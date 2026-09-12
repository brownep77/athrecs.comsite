import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
registerHooks({
  resolve(specifier, context, next) {
    let base;
    if (specifier.startsWith("@/")) base = pathToFileURL(resolve("src", specifier.slice(2)));
    else if (context.parentURL && /^\.\.?\//.test(specifier))
      base = new URL(specifier, context.parentURL);
    if (base)
      for (const ext of ["", ".ts", "/index.ts"]) {
        const url = new URL(base.href + ext);
        if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
      }
    return next(specifier, context);
  },
});
process.env.DATABASE_URL = "postgresql://test-only@127.0.0.1/never-connect";
const core = await import("../src/lib/race-collector/core.ts");
const service = await import("../src/lib/race-collector/service.server.ts");
const { parseResearch, buildResearchPrompt } =
  await import("../src/lib/race-collector/research.server.ts");
const { REGIONS_BY_COUNTRY } = await import("../src/lib/race-collector/regions.ts");
const scope = {
  countries: ["IE"],
  dateFrom: "2027-01-01",
  dateTo: "2028-12-31",
  min: 0,
  max: 500,
  unit: "mi",
};
// Calendar presets include the entire selected month(s), including leap days and year changes.
for (const [month, months, dateFrom, dateTo] of [
  ["2027-01", 1, "2027-01-01", "2027-01-31"],
  ["2027-02", 1, "2027-02-01", "2027-02-28"],
  ["2028-02", 1, "2028-02-01", "2028-02-29"],
  ["2027-04", 1, "2027-04-01", "2027-04-30"],
  ["2027-02", 3, "2027-02-01", "2027-04-30"],
  ["2027-11", 3, "2027-11-01", "2028-01-31"],
  ["2027-12", 3, "2027-12-01", "2028-02-29"],
]) {
  const range = core.calendarMonthRange(month, months);
  assert.deepEqual(range, { dateFrom, dateTo });
  const jobs = core.planScope({
    ...scope,
    ...range,
    countries: ["IE", "US"],
    regional: true,
    regions: { US: ["US-NY"] },
  });
  for (const country of ["IE", "US"])
    for (const pass of [1, 2]) {
      const selected = jobs.filter((job) => job.country === country && job.pass === pass);
      assert.equal(selected[0].dateFrom, dateFrom);
      assert.equal(selected.at(-1).dateTo, dateTo);
      assert(selected.every((job) => job.regionCode === (country === "US" ? "US-NY" : undefined)));
      for (let i = 1; i < selected.length; i++)
        assert.equal(
          Date.parse(selected[i].dateFrom) - Date.parse(selected[i - 1].dateTo),
          86400000,
        );
    }
}
for (const month of ["", "2027-00", "2027-13", "2027-2", "not-a-month"])
  assert.equal(core.calendarMonthRange(month, 1), null);
const windows = core.planScope(scope);
assert.equal(windows.length, 16);
assert.equal(windows[4].dateFrom, "2028-01-01");
assert.equal(windows[4].dateTo, "2028-03-31");
assert.equal(windows[7].dateTo, "2028-12-31");
assert.equal(core.COLLECTOR_COUNTRIES.length, 250);
// Saved scopes remain national. New scopes expand only the selected states/regions.
const regionalScope = { ...scope, countries: ["US"], dateTo: "2027-03-31", regional: true };
assert.equal(core.planScope({ ...regionalScope, regional: undefined }).length, 2);
const usa = core.planScope(regionalScope);
assert.equal(usa.length, 102);
assert.equal(new Set(usa.map((w) => w.regionCode)).size, 51);
assert(usa.some((w) => w.regionCode === "US-DC"));
assert(
  !usa.some((w) =>
    [undefined, "US-PR", "US-GU", "US-AS", "US-MP", "US-VI", "US-UM"].includes(w.regionCode),
  ),
);
assert.deepEqual(
  Object.fromEntries(Object.entries(REGIONS_BY_COUNTRY).map(([c, regions]) => [c, regions.length])),
  { US: 51, CA: 13, AU: 9, IN: 36, CN: 31, RU: 83, BR: 27, MX: 32 },
);
const world = core.planScope({
  ...scope,
  countries: core.COLLECTOR_COUNTRIES.map((c) => c.code),
  regional: true,
});
assert.equal(world.length, 8384);
assert.equal(
  new Set(world.map((w) => `${w.country}|${w.regionCode ?? ""}|${w.pass}|${w.dateFrom}`)).size,
  world.length,
);
assert(world.some((w) => w.country === "HK" && !w.regionCode));
assert(!world.some((w) => ["CN-HK", "CN-MO", "CN-TW"].includes(w.regionCode)));
const selectedScope = { ...regionalScope, regions: { US: ["US-NY", "US-CA", "US-NY"] } };
const selectedWindows = core.planScope(selectedScope);
assert.equal(selectedWindows.length, 4);
assert.deepEqual([...new Set(selectedWindows.map((w) => w.regionCode))], ["US-CA", "US-NY"]);
assert.equal(
  core.planScope({ ...regionalScope, countries: ["US", "IE"], regions: { US: ["US-CA"] } }).length,
  4,
);
for (const regions of [
  { US: [] },
  { US: ["CA-ON"] },
  { US: ["US-PR"] },
  { CA: ["CA-ON"] },
  { US: "US-CA" },
])
  assert.throws(() => core.validateScope({ ...regionalScope, regions }));
assert.throws(() =>
  core.validateScope({ ...regionalScope, regional: false, regions: { US: ["US-CA"] } }),
);
assert.throws(() => core.validateScope({ ...regionalScope, regional: "true" }));
const californiaPrompt = buildResearchPrompt(selectedWindows[0], selectedScope, []);
assert(californiaPrompt.includes("ONLY in California (US-CA)"));
assert(californiaPrompt.includes("state/region of its START venue"));
assert(californiaPrompt.includes("BOTH miles and kilometres"));
assert(californiaPrompt.includes("Puerto Rico"));
assert.throws(() =>
  buildResearchPrompt({ ...selectedWindows[0], regionCode: "CA-ON" }, selectedScope, []),
);
for (const pass of [1, 2]) {
  const w = windows.filter((x) => x.pass === pass);
  for (let i = 1; i < w.length; i++)
    assert.equal(Date.parse(w[i].dateFrom) - Date.parse(w[i - 1].dateTo), 86400000);
}
assert.throws(() => core.validateScope({ ...scope, dateFrom: "2027-02-29" }));
assert.throws(() => core.validateScope({ ...scope, countries: ["ZZ"] }));
assert.throws(() => core.validateScope({ ...scope, max: 501 }));
assert.throws(() => core.validateScope({ ...scope, unit: "yards" }));
const c = {
  name: "Sample Island Run",
  countryCode: "IE",
  country: "Ireland",
  city: "Dublin",
  region: "Dublin",
  date: "2027-02-01",
  distance: 10,
  unit: "km",
  distanceLabel: "10K",
  distanceKm: 10,
  surface: "Road",
  sourceUrl: "https://race.example.org/programme/2027",
  entryUrl: "",
  startTime: "",
  entryStatus: "TBC",
  sourceKind: "organiser",
  evidence: "Current primary programme supplies the exact local date and a ten kilometre race.",
  notes: "",
};
assert.deepEqual(core.candidateProblems(c, windows[0], scope), []);
const regionalCandidate = {
  ...c,
  name: "Coastal State Run",
  countryCode: "US",
  country: "United States",
  city: "San Diego",
  region: "California",
  regionCode: "US-CA",
  sourceUrl: "https://state-race.example.org/programme/2027",
};
assert.deepEqual(core.candidateProblems(regionalCandidate, selectedWindows[0], selectedScope), []);
assert(
  core
    .candidateProblems(
      { ...regionalCandidate, regionCode: "US-NY" },
      selectedWindows[0],
      selectedScope,
    )
    .includes("Start state or region is outside this job or unresolved"),
);
assert(
  core.candidateProblems(
    { ...regionalCandidate, regionCode: undefined },
    selectedWindows[0],
    selectedScope,
  ).length,
);
assert.notEqual(
  core.reconcile({ ...c, name: "北京马拉松", countryCode: "CN" }, [], []).eventSlug,
  core.reconcile({ ...c, name: "上海马拉松", countryCode: "CN" }, [], []).eventSlug,
);
assert(core.candidateProblems({ ...c, distance: 0 }, windows[0], scope).length);
assert(
  core.candidateProblems({ ...c, sourceUrl: "javascript:alert(1)" }, windows[0], scope).length,
);
const events = [
  {
    id: 1,
    slug: "sample-run",
    name: "Sample Island Run 2026",
    country: "Ireland",
    website: c.sourceUrl,
  },
];
const editions = [
  { eventId: 1, date: c.date, distance: "6.2mi", distanceKm: 9.9779, source: c.sourceUrl },
];
assert.equal(core.reconcile(c, events, editions).status, "duplicate");
assert.equal(
  core.reconcile(c, events, [], [{ eventSlug: "sample-run", date: c.date }]).status,
  "held",
);
assert.equal(
  core.reconcile(c, [...events, { ...events[0], id: 2, slug: "alias" }], []).status,
  "held",
);
assert.equal(
  core.reconcile(c, events, [{ ...editions[0], distance: "10K", distanceKm: 11 }]).status,
  "held",
);
assert.throws(() => parseResearch({ status: "incomplete", output_text: "{}" }));
assert.throws(() => parseResearch({ status: "completed", output_text: "{}" }));
assert.equal(
  parseResearch({
    output_text: JSON.stringify({
      candidates: [c],
      sources: [c.sourceUrl],
      gaps: [],
      capped: false,
    }),
  }).candidates.length,
  1,
);
const pg = new PGlite();
await pg.exec(
  `create table events(id int primary key,slug text,name text,country text,website text,sport text);create table editions(event_id int,event_date date,distance_code text,distance_km float8,source_url text);create table slug_redirects(entity_type text,old_slug text,current_slug text);`,
);
await pg.exec(await readFile("migrations/0016_catalogue_publishing.sql", "utf8"));
await pg.exec(await readFile("migrations/20260912_worldwide_race_collector.sql", "utf8"));
function adapter(db, inTransaction = false) {
  const sql = async (strings, ...values) => {
    let text = strings[0];
    values.forEach((_, i) => (text += `$${i + 1}` + strings[i + 1]));
    return (await db.query(text, values)).rows;
  };
  sql.query = async (text, values = []) => (await db.query(text, values)).rows;
  sql.transaction = async (fn) =>
    inTransaction ? fn(sql) : db.transaction((tx) => fn(adapter(tx, true)));
  return sql;
}
const sql = adapter(pg);
const run = await service.createRun(scope, "staff@example.org", sql);
const repeat = await service.createRun(scope, "staff@example.org", sql);
assert.equal(run.id, repeat.id);
assert.equal(repeat.reused, true);
assert.equal((await sql`select count(*)::int n from race_collector_jobs`)[0].n, 16);
let calls = 0;
const research = async () => {
  calls++;
  return {
    candidates: [{ ...c }],
    sources: [c.sourceUrl],
    gaps: ["Fixture data is not exhaustive."],
    capped: false,
    usage: "{}",
    responseId: "fixture",
  };
};
await service.controlRun(run.id, "pause", sql);
assert.equal((await service.runWorker(sql, research)).worked, false);
assert.equal(calls, 0);
await service.controlRun(run.id, "resume", sql);
await service.runWorker(sql, research);
assert.equal((await sql`select count(*)::int n from race_collector_candidates`)[0].n, 1);
assert.equal((await sql`select status from race_collector_candidates`)[0].status, "review");
// Redelivered windows retain one fact, and cannot inflate duplicate counts.
await sql`update race_collector_jobs set status='queued' where ordinal=0`;
await service.runWorker(sql, research);
assert.equal((await sql`select count(*)::int n from race_collector_candidates`)[0].n, 1);
// An expired lease is recovered; a valid lease prevents a second model call.
await sql`update race_collector_jobs set status='running',lease_until=now()+interval '1 minute' where ordinal=1`;
const before = calls;
assert.equal((await service.runWorker(sql, research)).worked, false);
assert.equal(calls, before);
await sql`update race_collector_jobs set lease_until=now()-interval '1 minute' where ordinal=1`;
await service.runWorker(sql, async () => {
  throw new Error("Simulated upstream failure");
});
assert.equal(
  (await sql`select status from race_collector_jobs where ordinal=1`)[0].status,
  "queued",
);
await sql`update race_collector_jobs set attempts=2,available_at=now() where ordinal=1`;
await service.runWorker(sql, async () => {
  throw new Error("Simulated upstream failure");
});
assert.equal(
  (await sql`select status from race_collector_jobs where ordinal=1`)[0].status,
  "failed",
);
await service.controlRun(run.id, "retry", sql);
assert.equal((await sql`select attempts from race_collector_jobs where ordinal=1`)[0].attempts, 0);
// Real staged publisher is exercised on the isolated database, including atomic review links.
const toStage = (await sql`select id from race_collector_candidates where status='review'`)[0].id;
const staged = await service.stageReviewed([toStage], "staff@example.org", sql);
const batch = (await sql`select * from catalogue_import_batches where id=${staged.batchId}`)[0];
assert.equal(batch.status, "staged");
assert.equal(batch.payload.editions.length, 1);
const { assertCollectorPublication } =
  await import("../src/lib/race-collector/publication-guard.server.ts");
await assertCollectorPublication(sql, staged.batchId, batch.payload);
await sql`insert into events(id,slug,name,country,website,sport) values(99,${batch.payload.events[0].slug},${c.name},'Ireland',${c.sourceUrl},'Running')`;
await sql`insert into editions(event_id,event_date,distance_code,distance_km,source_url) values(99,${c.date},'6.2mi',9.9779,${c.sourceUrl})`;
await assert.rejects(
  () => assertCollectorPublication(sql, staged.batchId, batch.payload),
  /identity|distance/,
);
await assert.rejects(
  () => service.stageReviewed([toStage], "staff@example.org", sql),
  /Selection changed/,
);
// Reconciliation guard rejects a new equivalent edition appearing before publication.
const rows = await sql`select id from race_collector_candidates`;
assert.equal(rows.length, 1);
await service.controlRun(run.id, "cancel", sql);
assert.equal((await service.runWorker(sql, research)).worked, false);
// Regional jobs persist their scope; progress rolls up per state and country.
const regionalRun = await service.createRun(selectedScope, "staff@example.org", sql);
const regionalResearch = async (window, requestedScope, known) => {
  assert.deepEqual(requestedScope.regions.US, ["US-CA", "US-NY"]);
  if (window.regionCode === "US-NY") assert(!known.includes(regionalCandidate.name));
  const candidates =
    window.pass === 1 && window.regionCode === "US-CA"
      ? [
          regionalCandidate,
          {
            ...regionalCandidate,
            name: "Unknown State Run",
            regionCode: "",
            sourceUrl: "https://unknown.example.org/race",
          },
        ]
      : [{ ...regionalCandidate, distance: 6.2137119223733395, unit: "mi" }];
  return {
    candidates,
    sources: [regionalCandidate.sourceUrl],
    gaps: [],
    capped: false,
    usage: "{}",
    responseId: "regional-fixture",
  };
};
for (let n = 0; n < 4; n++) await service.runWorker(sql, regionalResearch);
const regionalDashboard = await service.dashboard(regionalRun.id, sql);
assert.equal(regionalDashboard.run.status, "complete");
assert.equal(regionalDashboard.jobs.length, 2);
assert(regionalDashboard.jobs.every((j) => j.count === 2 && j.status === "complete"));
assert.equal(
  regionalDashboard.jobs.reduce((n, j) => n + j.count, 0),
  4,
);
assert.equal(regionalDashboard.candidates.length, 2); // one fact across states, units and both passes + one held
assert.equal(
  regionalDashboard.candidates.find((r) => r.candidate.name === "Unknown State Run").status,
  "held",
);
const stateRow = regionalDashboard.candidates.find(
  (r) => r.candidate.name === regionalCandidate.name,
);
assert.equal(stateRow.status, "review");
assert.equal(stateRow.candidate.regionCode, "US-CA");
assert.equal(stateRow.candidate.region, "California");
assert(regionalDashboard.gaps.every((g) => ["US-CA", "US-NY"].includes(g.window.regionCode)));
const stateStaged = await service.stageReviewed([stateRow.id], "staff@example.org", sql);
const stateBatch = (
  await sql`select payload from catalogue_import_batches where id=${stateStaged.batchId}`
)[0];
assert.equal(stateBatch.payload.events[0].county, "California");
assert.equal(stateBatch.payload.editions.length, 1);
const priorSecret = process.env.CRON_SECRET;
delete process.env.CRON_SECRET;
assert.equal(service.authorizedWorker(new Request("https://example.org")), false);
process.env.CRON_SECRET = "test-secret";
assert.equal(
  service.authorizedWorker(
    new Request("https://example.org", { headers: { authorization: "Bearer bad" } }),
  ),
  false,
);
assert.equal(
  service.authorizedWorker(
    new Request("https://example.org", { headers: { authorization: "Bearer test-secret" } }),
  ),
  true,
);
if (priorSecret) process.env.CRON_SECRET = priorSecret;
else delete process.env.CRON_SECRET;
await pg.close();
console.log(
  "Race collector verified: regional selection and boundaries, legacy scopes, region progress, units, cross-region duplicates, durable jobs, leases, retries, staging and worker authentication.",
);
