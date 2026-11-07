// Daily automated fixture import: chunk import drops invalid and repeated rows,
// keeps the duplicate check, and publishes only rows that pass the existing
// collector publish action. Disposable database; no network.
import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
const { FIXTURE_UPLOAD_HEADERS } = await import("../src/lib/race-collector/fixture-upload.ts");
const { importCollectedChunk, publishReadyFromRun, authorizedSourceImport } =
  await import("../src/lib/race-collector/automated-source-import.server.ts");
const { OUTPUT_HEADERS } = await import("./source-importer/lib.mjs");

assert.deepEqual(
  [...OUTPUT_HEADERS].sort(),
  [...FIXTURE_UPLOAD_HEADERS].sort(),
  "The source importer writes exactly the columns the site imports",
);

const f = await bulkFixture();
const { sql } = f;
const cell = (x) => `"${String(x ?? "").replaceAll('"', '""')}"`;
const row = (overrides) => {
  const base = {
    name: "Synthetic Automated Riverside 10K",
    country: "England",
    city: "Norwich",
    region: "Norfolk",
    date: "2027-05-02",
    distance: "10",
    unit: "km",
    surface: "Road",
    startTime: "",
    sourceUrl: "https://organiser.example.org/riverside",
    entryUrl: "https://entry.example.org/riverside",
    sourceKind: "organiser",
    evidence: "Synthetic organiser programme confirms date, distance and venue.",
    checkedAt: "2026-11-07",
    entryStatus: "Open",
    notes: "",
    ...overrides,
  };
  return FIXTURE_UPLOAD_HEADERS.map((key) => cell(base[key])).join(",");
};
const csv = [
  FIXTURE_UPLOAD_HEADERS.join(","),
  row({}),
  row({
    name: "Synthetic Automated Hilltop Half",
    distance: "21.0975",
    sourceUrl: "https://organiser.example.org/hilltop",
    entryUrl: "https://entry.example.org/hilltop",
    date: "2027-06-06",
    city: "Thetford",
  }),
  row({}), // repeated in the same file
  row({
    name: "Synthetic Automated Missing Distance",
    distance: "",
    sourceUrl: "https://organiser.example.org/missing",
  }),
].join("\n");

try {
  process.env.SOURCE_IMPORT_TOKEN = "x".repeat(40);
  const request = (auth) =>
    new Request("https://example.test/api/source-import-worker", {
      method: "POST",
      headers: auth ? { authorization: auth } : {},
    });
  assert.equal(authorizedSourceImport(request()), false);
  assert.equal(authorizedSourceImport(request("Bearer wrong")), false);
  assert.equal(authorizedSourceImport(request(`Bearer ${"x".repeat(40)}`)), true);
  process.env.SOURCE_IMPORT_TOKEN = "short";
  assert.equal(authorizedSourceImport(request("Bearer short")), false, "Weak tokens are refused");

  const saved = await importCollectedChunk(
    { label: "Synthetic automated import", csv, dateFrom: "2027-01-01", dateTo: "2027-12-31" },
    sql,
  );
  assert.equal(saved.dropped, 2, "The invalid row and the repeated row are dropped");
  assert(saved.runId, "The remaining rows are saved to the review queue");
  const again = await importCollectedChunk(
    { label: "Synthetic automated import", csv, dateFrom: "2027-01-01", dateTo: "2027-12-31" },
    sql,
  );
  assert.equal(again.runId, saved.runId, "Re-sending the same chunk does not create a second run");

  // Without the owner's setting, fixtures wait in the review queue.
  delete process.env.AUTO_PUBLISH_SOURCE_FIXTURES;
  const queued = await publishReadyFromRun(saved.runId, 45_000, sql);
  assert.equal(queued.published, 0, "Automatic publication is off unless the owner switches it on");
  assert.equal(queued.autoPublish, false);
  process.env.AUTO_PUBLISH_SOURCE_FIXTURES = "true";
  const published = await publishReadyFromRun(saved.runId, 45_000, sql);
  assert.equal(published.published, 2, "Both ready fixtures publish through the collector checks");
  assert.equal(published.remaining, 0);
  const editions =
    await sql`select count(*)::int as n from editions where event_date in ('2027-05-02','2027-06-06')`;
  assert.equal(editions[0].n, 2);

  // The next day's run finds the same fixtures already listed: nothing new publishes.
  const nextDay = await importCollectedChunk(
    {
      label: "Synthetic automated import day 2",
      csv,
      dateFrom: "2027-01-01",
      dateTo: "2027-12-31",
    },
    sql,
  );
  const second = nextDay.runId
    ? await publishReadyFromRun(nextDay.runId, 45_000, sql)
    : { published: 0 };
  assert.equal(second.published, 0, "Already-listed fixtures are recognised as duplicates");
  const after =
    await sql`select count(*)::int as n from editions where event_date in ('2027-05-02','2027-06-06')`;
  assert.equal(after[0].n, 2, "No duplicate editions are created");
  console.log(
    "Automated source import passed: token check, invalid/repeated rows dropped, idempotent chunks, publication through collector checks, and next-day duplicates recognised.",
  );
} finally {
  await f.pg.close();
}
