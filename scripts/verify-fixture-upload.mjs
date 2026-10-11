import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { bulkFixture, service, actOnFindings, reviewer } from "./collector-bulk-fixture.mjs";
const { parseFixtureUpload, UK_FIXTURE_SCOPE, FIXTURE_UPLOAD_HEADERS } =
  await import("../src/lib/race-collector/fixture-upload.ts");
const { previewFixtureUpload, importFixtureUpload } =
  await import("../src/lib/race-collector/fixture-upload.server.ts");
const f = await bulkFixture();
const { sql, pg } = f;
const candidate = {
  name: "Synthetic Orchard Race",
  country: "England",
  city: "Norwich",
  date: "2027-05-02",
  distance: "10K",
  surface: "Road",
  startTime: "",
  sourceUrl: "https://organiser.example.org/orchard",
  entryUrl: "https://entry.example.org/orchard",
  sourceKind: "organiser",
  evidence:
    "Synthetic programme fixture confirms the date, ten kilometre distance and Norwich venue.",
  checkedAt: "2026-10-10",
};
const input = (rows, extra = {}) => ({
  content: JSON.stringify(rows),
  format: "json",
  label: "Synthetic upload regression",
  scope: UK_FIXTURE_SCOPE,
  ...extra,
});
const preview = (rows) => previewFixtureUpload(input(rows), sql);
const count = async (table) => (await sql.query(`select count(*)::int n from ${table}`))[0].n;
const save = async (data) => {
  const p = await previewFixtureUpload(data, sql);
  return importFixtureUpload({ ...data, previewHash: p.hash }, reviewer, sql);
};
try {
  const csvCell = (x) => `"${String(x ?? "").replaceAll('"', '""')}"`;
  const multiline = {
    ...candidate,
    name: 'Synthetic "Orchard", Run',
    evidence: candidate.evidence + "\nSecond quoted line.",
  };
  const csv =
    "\uFEFF" +
    FIXTURE_UPLOAD_HEADERS.join(",") +
    "\r\n" +
    FIXTURE_UPLOAD_HEADERS.map((k) => csvCell(multiline[k])).join(",") +
    "\r\n";
  const parsedCsv = parseFixtureUpload(input([], { format: "csv", content: csv }));
  assert.equal(parsedCsv.rows[0].candidate.name, multiline.name);
  assert.equal(parsedCsv.rows[0].candidate.evidence, multiline.evidence);
  assert.equal(parsedCsv.rows[0].candidate.countryCode, "GB");
  assert.equal(parsedCsv.rows[0].candidate.startTime, "");
  for (const bad of ["name,date\na,b,c", "name,name\na,b", 'name,date\n"unfinished'])
    assert.throws(() => parseFixtureUpload(input([], { format: "csv", content: bad })));
  assert.throws(() => parseFixtureUpload(input(Array(501).fill(candidate))), /1–500/);
  assert.throws(() => parseFixtureUpload(input([], { content: "x".repeat(2_000_001) })), /2 MB/);
  assert.equal(
    parseFixtureUpload(input([{ ...candidate, distance: "half marathon" }])).rows[0].candidate
      .distanceKm,
    21.0975,
  );
  assert.equal(
    parseFixtureUpload(input([{ ...candidate, distance: 10, unit: "mi" }])).rows[0].candidate
      .distanceKm,
    16.09344,
  );
  for (const changes of [
    { date: "2027-02-30" },
    { date: "2028-01-01" },
    { distance: "timed event" },
    { distance: "10 km", unit: "mi" },
    { checkedAt: "" },
    { checkedAt: "2999-01-01" },
    { startTime: "9.30" },
    { sourceUrl: "https://runabc.co.uk/race" },
    { entryUrl: "https://www.runabc.co.uk/entry" },
    { sourceKind: "calendar" },
    { country: "Ireland" },
    { country: "Scotland", countryCode: "IE" },
    { country: "Narnia", countryCode: "GB" },
    { sport: "Parkrun" },
    { name: "Synthetic junior parkrun" },
    { distanceKm: "not-a-number" },
    { evidence: "" },
  ]) {
    const p = await preview([{ ...candidate, ...changes }]);
    assert.equal(p.counts.invalid, 1, JSON.stringify(changes));
    await assert.rejects(() => save(input([{ ...candidate, ...changes }])), /invalid rows/);
  }
  const paused = randomUUID();
  await sql`insert into race_collector_runs(id,scope,status,requested_by,total_jobs,error) values(${paused}::uuid,${JSON.stringify(UK_FIXTURE_SCOPE)}::jsonb,'paused',${reviewer},1,'Research service returned 403')`;
  delete process.env.XAI_API_KEY;
  delete process.env.CRON_SECRET;
  const rows = [
    candidate,
    { ...candidate, distance: 6.2, unit: "mi", distanceLabel: "6.2mi" },
    { ...candidate, distance: "half marathon", startTime: "09:30", sourceKind: "timing-provider" },
  ];
  const p = await preview(rows);
  assert.deepEqual(p.counts, { rows: 3, ready: 2, duplicate: 0, held: 0, repeat: 1, invalid: 0 });
  assert.equal(await count("events"), 0);
  assert.equal(await count("editions"), 0);
  await assert.rejects(
    () => importFixtureUpload({ ...input(rows), previewHash: "stale" }, reviewer, sql),
    /Preview|preview/,
  );
  const [first, retry] = await Promise.all([save(input(rows)), save(input(rows))]);
  assert.equal(first.id, retry.id);
  assert.equal(retry.reused, true);
  assert.equal(
    (await sql`select status from race_collector_runs where id=${paused}::uuid`)[0].status,
    "paused",
  );
  assert.equal(await count("editions"), 0, "Saving proposals never publishes races");
  const review = await service.dashboard(first.id, sql, { status: "review" });
  assert.equal(review.candidates.length, 2);
  assert(review.candidates.every((r) => r.candidate.checkedAt === candidate.checkedAt));
  const ids = review.candidates.map((r) => r.id);
  await assert.rejects(() =>
    actOnFindings(
      { runId: first.id, ids, action: "publish", confirmed: true, sourcesReviewed: false },
      reviewer,
      sql,
    ),
  );
  const published = await actOnFindings(
    { runId: first.id, ids, action: "publish", confirmed: true, sourcesReviewed: true },
    reviewer,
    sql,
  );
  assert.equal(published.published, 2);
  const editions = await sql`select * from editions order by distance_km`;
  assert.equal(editions[0].start_time, null, "Unknown time must stay null");
  assert.equal(editions[1].start_time.slice(0, 5), "09:30");
  assert(editions.every((r) => r.notes.includes("Source checked 2026-10-10")));
  assert.equal(await count("events"), 1, "Different distances share one canonical event");
  const repeatedAfterPublish = await save(input(rows));
  assert.equal(repeatedAfterPublish.id, first.id);
  assert.equal(await count("editions"), 2);
  assert.equal(await count("catalogue_revisions"), 1);
  const newFile = await preview([
    { ...candidate, notes: "Another research file", distance: 6.2, unit: "mi" },
  ]);
  assert.equal(
    newFile.counts.duplicate,
    1,
    "Miles and kilometre equivalents cannot create another listing",
  );
  const distantReschedule = await preview([{ ...candidate, date: "2027-12-05" }]);
  assert.equal(
    distantReschedule.counts.held,
    1,
    "A reschedule far outside a 31-day window needs review",
  );
  const existing = (await sql`select id,slug from events`)[0];
  await sql`insert into slug_redirects(entity_type,entity_id,old_slug,current_slug) values('event',${existing.id},'old-orchard-name',${existing.slug})`;
  const alias = await preview([
    {
      ...candidate,
      name: "Old Orchard Name",
      sourceUrl: "https://organiser.example.org/new-page",
      entryUrl: "",
    },
  ]);
  assert.equal(alias.counts.duplicate, 1);
  // A changed file creates another review, but sees equivalent unpublished proposals across runs.
  const pending = await save(
    input([
      {
        ...candidate,
        name: "Synthetic Harbour Dash",
        sourceUrl: "https://organiser.example.org/harbour",
        entryUrl: "",
        city: "Cromer",
      },
    ]),
  );
  const pendingRows = await service.dashboard(pending.id, sql);
  await service.stageReviewed(
    pendingRows.candidates.map((r) => r.id),
    reviewer,
    sql,
  );
  const overlap = await preview([
    {
      ...candidate,
      name: "Synthetic Harbour Dash",
      sourceUrl: "https://organiser.example.org/harbour",
      entryUrl: "",
      city: "Cromer",
      distance: 6.2,
      unit: "mi",
    },
  ]);
  assert.equal(overlap.counts.held, 1);
  assert.match(overlap.rows[0].reason, /pending/);
  // Old import URLs still open after more than fifteen newer imports.
  for (let i = 0; i < 16; i++)
    await sql`insert into race_collector_runs(id,scope,status,requested_by,total_jobs,created_at) values(${randomUUID()}::uuid,${JSON.stringify(UK_FIXTURE_SCOPE)}::jsonb,'complete',${reviewer},1,now()+interval '1 day')`;
  assert.equal((await service.dashboard(first.id, sql)).run.id, first.id);
  console.log(
    "PASS fixture import: quoted CSV/JSON, exact dates, unknown/known times, RunABC rejection, UK geography, provider-independent upload, atomic/idempotent retries, canonical/equivalent/pending/alias checks, reviewed publication and historic review links.",
  );
} finally {
  await pg.close();
}
