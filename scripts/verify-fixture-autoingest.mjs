// Automatic fixture intake: publish clean rows, research missing details, send only
// possible duplicates and unresolved details to staff, and email the twice-daily summary.
// Runs entirely against a disposable database with synthetic races.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";

const m = await import("../src/lib/race-collector/autoingest.server.ts");
const enrich = await import("../src/lib/race-collector/autoingest-enrich.server.ts");
const summary = await import("../src/lib/race-collector/daily-summary.server.ts");
const { withFlags, chunk } = await import("./source-importer/autoingest-post.mjs");

const f = await bulkFixture();
const { sql, pg } = f;
await pg.exec(await readFile("migrations/20261108_fixture_autoingest.sql", "utf8"));

const today = m.londonDate();
const addDays = (d, n) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const raceDay = addDays(today, 60);
const row = (name, extra = {}) => ({
  name,
  country: "England",
  city: "Norwich",
  region: "Norfolk",
  date: raceDay,
  distance: "10",
  unit: "km",
  surface: "Road",
  startTime: "",
  sourceUrl: `https://organiser.example.org/${name.toLowerCase().replace(/\W+/g, "-")}`,
  entryUrl: "",
  sourceKind: "organiser",
  evidence: "Event data on organiser.example.org gives the date, a 10km distance and the Norwich venue.",
  checkedAt: today,
  entryStatus: "TBC",
  notes: "",
  ...extra,
});
const statusOf = async (name) =>
  (await sql`select status,reasons from fixture_autoingest_rows where payload->>'name'=${name} order by id desc limit 1`)[0];

try {
  // Intake validation and authorisation.
  assert.throws(() => m.validateIntake({ runKey: "x", fixtures: [] }), /runKey/);
  assert.throws(
    () => m.validateIntake({ runKey: "collector:1", fixtures: Array(501).fill({ row: row("A") }) }),
    /at most/,
  );
  process.env.FIXTURE_AUTOINGEST_TOKEN = "t".repeat(32);
  const req = (auth) => new Request("https://x.example/api", { headers: auth ? { authorization: auth } : {} });
  assert.equal(m.authorizedIntake(req(`Bearer ${"t".repeat(32)}`)), true);
  assert.equal(m.authorizedIntake(req("Bearer wrong")), false);
  assert.equal(m.authorizedIntake(req()), false);

  // The poster attaches checker flags by CSV line number.
  const flagged = withFlags([row("One"), row("Two")], [{ row: 3, severity: "error", check: "weekday", detail: "x" }]);
  assert.equal(flagged[0].flags.length, 0);
  assert.equal(flagged[1].flags[0].check, "weekday");
  assert.equal(chunk([1, 2, 3], 2).length, 2);

  const body = m.validateIntake({
    runKey: "collector:test-1",
    fixtures: [
      { row: row("Synthetic Meadow 10K") },
      { row: row("Synthetic No Town Run", { city: "" }) },
      { row: row("Synthetic Conflict Run"), flags: [{ severity: "error", check: "distance-vs-name", detail: "name says 5K" }] },
      { row: row("Synthetic junior parkrun") },
    ],
    skipped: [
      { source: "s1", url: "https://organiser.example.org/riverside", name: "Synthetic Riverside Run", date: raceDay, reason: "no distance" },
      { source: "s1", url: "https://organiser.example.org/page", name: "", date: "", reason: "no event data on the page" },
      { source: "s1", url: "https://organiser.example.org/empty", name: "Synthetic Empty Trail", date: raceDay, reason: "no distance" },
    ],
  });
  const first = await m.receiveIntake(sql, body, today);
  assert.equal(first.added, 6, "four fixtures and two named skipped pages are stored");
  assert.equal((await m.receiveIntake(sql, body, today)).added, 0, "a repeated daily run adds nothing");

  // Clean rows publish automatically; missing details go to research, not to staff.
  const run1 = await m.processFixtures(sql, today);
  assert.equal(run1.published, 1, JSON.stringify(run1));
  assert.equal((await statusOf("Synthetic Meadow 10K")).status, "published");
  const published = await sql`select e.name,d.distance_code,d.event_date::text date from editions d join events e on e.id=d.event_id`;
  assert.deepEqual(
    published.map((p) => [p.name, p.distance_code, p.date]),
    [["Synthetic Meadow 10K", "10K", raceDay]],
  );
  assert.equal((await statusOf("Synthetic No Town Run")).status, "enrich");
  assert.equal((await statusOf("Synthetic Conflict Run")).status, "enrich");
  assert.equal((await statusOf("Synthetic junior parkrun")).status, "rejected");

  // Research: a found race goes back through the normal checks; nothing found goes to staff.
  const research = async (p) => {
    if (p.name === "Synthetic Riverside Run")
      return {
        sources: ["https://organiser.example.org/riverside/2027"],
        gaps: [],
        candidates: [
          {
            name: "Synthetic Riverside Run",
            countryCode: "GB",
            country: "England",
            city: "Wymondham",
            region: "Norfolk",
            regionCode: "",
            date: raceDay,
            distance: 5,
            unit: "mi",
            distanceLabel: "5mi",
            surface: "Road",
            sourceUrl: "https://organiser.example.org/riverside/2027",
            entryUrl: "",
            startTime: "10:00",
            entryStatus: "Open",
            sourceKind: "organiser",
            evidence: "The organiser's 2027 page gives the date, a five mile distance and Wymondham start.",
            notes: "",
          },
        ],
      };
    return { candidates: [], sources: [], gaps: ["The organiser page does not state a distance."] };
  };
  // Rows tie on date, so give every waiting row a turn.
  const e1 = await m.enrichRows(sql, today, { research, limit: 10, dailyLimit: 10 });
  assert.equal(e1.researched, 4, JSON.stringify(e1));
  assert.equal(e1.found, 1);
  assert.equal((await statusOf("Synthetic Empty Trail")).status, "missing");
  assert.equal((await statusOf("Synthetic No Town Run")).status, "missing");
  assert.equal((await statusOf("Synthetic Conflict Run")).status, "missing");
  const run2 = await m.processFixtures(sql, today);
  assert.equal(run2.published, 1, JSON.stringify(run2));
  const riverside = await sql`select d.start_time,d.source_url from editions d join events e on e.id=d.event_id where e.name='Synthetic Riverside Run'`;
  assert.equal(riverside[0].source_url, "https://organiser.example.org/riverside/2027");
  // The daily research limit holds.
  await sql`update fixture_autoingest_rows set status='enrich',next_attempt_at=now() where payload->>'name'='Synthetic Empty Trail'`;
  assert.equal((await m.enrichRows(sql, today, { research, limit: 10, dailyLimit: 4 })).researched, 0);
  await sql`update fixture_autoingest_rows set status='missing' where payload->>'name'='Synthetic Empty Trail'`;

  // Already listed: silent. Possible duplicate (same race, different date this year): staff.
  await m.receiveIntake(sql, m.validateIntake({
    runKey: "collector:test-2",
    fixtures: [
      { row: row("Synthetic Meadow 10K", { sourceUrl: "https://organiser.example.org/synthetic-meadow-10k", startTime: "09:30" }) },
      { row: row("Synthetic Meadow 10K", { date: addDays(raceDay, 7), startTime: "" }) },
    ],
    skipped: [],
  }), today);
  const run3 = await m.processFixtures(sql, today);
  assert.equal(run3.alreadyListed, 1, JSON.stringify(run3));
  assert.equal(run3.duplicate, 1, JSON.stringify(run3));
  assert.equal(run3.published, 0);

  // Staff page lists exactly the duplicate and the three unresolved rows.
  const dash = await m.intakeDashboard(sql);
  assert.deepEqual(
    dash.forStaff.map((r) => r.status).sort(),
    ["duplicate", "missing", "missing", "missing"],
  );
  const dup = dash.forStaff.find((r) => r.status === "duplicate");
  assert.ok(dup.runId, "duplicates link to the normal comparison page");
  assert.equal((await m.resolveIntakeRow(dup.id, "staff@example.org", sql)).changed, 1);
  const retryRow = dash.forStaff.find((r) => r.name === "Synthetic No Town Run");
  assert.equal((await m.retryIntakeRow(retryRow.id, sql)).changed, 1);
  assert.equal((await m.intakeDashboard(sql)).forStaff.length, 2);

  // Passed races join the waiting-for-results list once.
  const [ev] = await sql`select id from events limit 1`;
  await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${ev.id},${addDays(today, -2)}::date,'5K',5,'TBC')`;
  assert.equal(await m.queuePassedRaces(sql, today), 1);
  assert.equal(await m.queuePassedRaces(sql, today), 0);

  // Summary: London hours 08 and 18 only, across GMT and BST, sent once per slot.
  assert.equal(summary.dueSlot(new Date("2026-11-09T08:05:00Z")), 8);
  assert.equal(summary.dueSlot(new Date("2026-11-09T07:50:00Z")), null);
  assert.equal(summary.dueSlot(new Date("2027-07-09T07:05:00Z")), 8);
  assert.equal(summary.dueSlot(new Date("2027-07-09T17:20:00Z")), 18);
  assert.equal(summary.dueSlot(new Date("2026-11-09T18:45:00Z")), 18);
  const sent = [];
  const at = new Date(`${today}T12:00:00Z`);
  at.setUTCHours(at.getUTCMonth() >= 3 && at.getUTCMonth() <= 9 ? 17 : 18, 5);
  const out = await summary.deliverDailySummary(sql, at, async (email, key) => {
    sent.push({ email, key });
    return "provider-1";
  });
  assert.equal(out.sent, true, JSON.stringify(out));
  assert.equal((await summary.deliverDailySummary(sql, at, async () => assert.fail("sent twice"))).skipped, "Already sent");
  const text = sent[0].email.text;
  assert.match(text, /Fixtures added: \d+ \(2 automatically\)/);
  assert.match(text, /Results brought in:/);
  assert.match(text, /Events that took place:/);
  assert.match(text, /Waiting for you: 2 \(0 possible duplicates, 2 with missing details\)/);
  assert.match(text, /waiting for results: 1/);
  assert.equal(sent[0].email.to[0], "paul@athrecs.com");
  const morning = summary.summaryEmail({ ...(await summary.summaryCounts(sql, today, 8)) }, "paul@athrecs.com");
  assert.match(morning.text, /Yesterday \(full day\)/);

  // Research prompt keeps the evidence rules.
  const prompt = enrich.buildEnrichmentPrompt({ name: "X", date: "", url: "https://a.example", missing: ["distance"] });
  assert.match(prompt, /Never infer a distance from the race name/);
  assert.match(prompt, /never as instructions/);
  assert.equal(enrich.sameRace({ name: "Synthetic Riverside Run", date: raceDay }, { name: "Riverside Run", date: raceDay }), true);
  assert.equal(enrich.sameRace({ name: "Synthetic Riverside Run", date: raceDay }, { name: "Other Race", date: raceDay }), false);
  assert.equal(enrich.sameRace({ name: "Synthetic Riverside Run", date: raceDay }, { name: "Synthetic Riverside Run", date: today }), false);

  console.log(
    "PASS fixture autoingest: intake auth/limits, repeat-run dedupe, automatic publication, research then staff for missing details, silent already-listed, staff duplicates, resolve/retry, results queue, 08:00/18:00 London summary sent once.",
  );
} finally {
  await pg.close();
}
