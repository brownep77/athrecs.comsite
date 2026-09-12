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
const { parseResearch, buildResearchPrompt, researchWindow } =
  await import("../src/lib/race-collector/research.server.ts");
const { RESEARCH_TIMEOUT_MS, WORKER_MAX_DURATION_SECONDS, JOB_LEASE_SECONDS } =
  await import("../src/lib/race-collector/timing.ts");
assert(RESEARCH_TIMEOUT_MS > 90_000, "Dense research must outlast the old abort threshold");
assert(RESEARCH_TIMEOUT_MS + 60_000 <= WORKER_MAX_DURATION_SECONDS * 1000);
assert(JOB_LEASE_SECONDS >= WORKER_MAX_DURATION_SECONDS + 120);
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
assert.equal(core.validateScope(scope).passes, 2);
assert.equal(core.planScope({ ...scope, passes: 2 }).length, 16);
const quick = core.planScope({ ...scope, passes: 1 });
assert.equal(quick.length, 8);
assert(quick.every((job) => job.pass === 1));
for (const passes of [0, 3, "1", null])
  assert.throws(() => core.validateScope({ ...scope, passes }));
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
// Exercise the real provider request without waiting or spending research credits.
const priorFetch = globalThis.fetch;
const priorTimeout = AbortSignal.timeout;
const priorKey = process.env.XAI_API_KEY;
let requestedTimeout;
try {
  process.env.XAI_API_KEY = "test-only";
  AbortSignal.timeout = (ms) => {
    requestedTimeout = ms;
    return priorTimeout(ms);
  };
  globalThis.fetch = async (_url, options) => {
    assert(options.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
    return Response.json({
      status: "completed",
      output_text: JSON.stringify({ candidates: [c], sources: [c.sourceUrl], gaps: [] }),
    });
  };
  assert.equal((await researchWindow(windows[0], scope, [])).candidates.length, 1);
  assert.equal(requestedTimeout, RESEARCH_TIMEOUT_MS);
} finally {
  globalThis.fetch = priorFetch;
  AbortSignal.timeout = priorTimeout;
  if (priorKey === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = priorKey;
}
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
// Valid leases cap all overlapping invocations at three requests; expired work is recovered.
await sql`update race_collector_jobs set status='running',lease_until=now()+interval '1 minute' where ordinal in (1,2,3)`;
const before = calls;
assert.equal((await service.runWorker(sql, research)).worked, false);
assert.equal(calls, before);
await sql`update race_collector_jobs set status='queued',lease_until=null where ordinal in (2,3)`;
await sql`update race_collector_jobs set lease_until=now()-interval '1 minute' where ordinal=1`;
await service.runWorker(sql, async () => {
  throw new Error("Simulated upstream failure");
});
assert.equal(
  (await sql`select status from race_collector_jobs where ordinal=1`)[0].status,
  "queued",
);
const retryActivity = (await service.dashboard(run.id, sql)).activity;
assert.equal(retryActivity.length, 1);
assert.equal(retryActivity[0].status, "queued");
assert.equal(retryActivity[0].error, "Simulated upstream failure");
assert(new Date(retryActivity[0].available_at).getTime() > Date.now());
await sql`update race_collector_jobs set attempts=2,available_at=now() where ordinal=1`;
await service.runWorker(sql, async () => {
  throw new Error("Simulated upstream failure");
});
assert.equal(
  (await sql`select status from race_collector_jobs where ordinal=1`)[0].status,
  "failed",
);
assert.equal((await service.dashboard(run.id, sql)).activity[0].status, "failed");
await service.controlRun(run.id, "retry", sql);
assert.equal((await service.dashboard(run.id, sql)).activity.length, 0);
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
// Overlapping cron batches share the database cap, and concurrent repeated discoveries stay unique.
const parallelRun = await service.createRun(
  { ...scope, dateTo: "2027-12-31", passes: 1 },
  "staff@example.org",
  sql,
);
assert.equal((await service.dashboard(parallelRun.id, sql)).run.total_jobs, 4);
// Simulate duplicated delivery windows to exercise the commit-time deduplication lock.
await sql`update race_collector_jobs set "window"=${JSON.stringify(quick[0])}::jsonb where run_id=${parallelRun.id}::uuid`;
let releaseResearch, reachedCapacity;
const heldResearch = new Promise((resolve) => {
  releaseResearch = resolve;
});
const capacity = new Promise((resolve) => {
  reachedCapacity = resolve;
});
let inFlight = 0,
  peak = 0;
const parallelResearch = async () => {
  inFlight++;
  peak = Math.max(peak, inFlight);
  if (inFlight === 3) reachedCapacity();
  await heldResearch;
  inFlight--;
  return {
    candidates: [{ ...c }],
    sources: [c.sourceUrl],
    gaps: [],
    capped: false,
    usage: "{}",
    responseId: "parallel-fixture",
  };
};
const batchWork = service.runWorkerBatch(sql, parallelResearch);
let capacityTimer;
try {
  await Promise.race([
    capacity,
    new Promise((_, reject) => {
      capacityTimer = setTimeout(
        () => reject(new Error("Parallel workers did not reach capacity")),
        5000,
      );
    }),
  ]);
  const activeSearches = (await service.dashboard(parallelRun.id, sql)).activity;
  assert.equal(activeSearches.length, 3);
  assert(activeSearches.every((job) => job.status === "running" && job.attempts === 1));
  const leases =
    await sql`select extract(epoch from (lease_until-now()))::int seconds from race_collector_jobs where run_id=${parallelRun.id}::uuid and status='running'`;
  assert(leases.every((lease) => lease.seconds > WORKER_MAX_DURATION_SECONDS));
  assert.equal(
    (
      await sql`select count(*)::int n from race_collector_jobs where run_id=${parallelRun.id}::uuid and status='running'`
    )[0].n,
    3,
  );
  assert.equal((await service.runWorkerBatch(sql, parallelResearch)).worked, 0);
  await service.controlRun(parallelRun.id, "pause", sql);
} finally {
  clearTimeout(capacityTimer);
  releaseResearch();
}
assert.equal((await batchWork).worked, 3);
assert.equal(peak, 3);
assert.equal((await service.runWorkerBatch(sql, parallelResearch)).worked, 0);
assert.equal((await service.dashboard(parallelRun.id, sql)).candidates.length, 1);
await service.controlRun(parallelRun.id, "resume", sql);
assert.equal((await service.runWorkerBatch(sql, parallelResearch)).worked, 1);
assert.equal((await service.dashboard(parallelRun.id, sql)).run.status, "complete");
// A delayed first pass blocks only its own region's second pass, including retry backoff.
const orderedRun = await service.createRun(selectedScope, "staff@example.org", sql);
await sql`update race_collector_jobs set available_at=now()+interval '1 hour' where run_id=${orderedRun.id}::uuid and "window"->>'regionCode'='US-CA' and "window"->>'pass'='1'`;
const seenPasses = [];
const orderedResearch = async (job) => {
  seenPasses.push(`${job.regionCode}:${job.pass}`);
  return {
    candidates: [],
    sources: [],
    gaps: ["No current programme found."],
    capped: false,
    usage: "{}",
    responseId: "ordered-fixture",
  };
};
await service.runWorker(sql, orderedResearch);
await service.runWorker(sql, orderedResearch);
assert.deepEqual(seenPasses, ["US-NY:1", "US-NY:2"]);
assert.equal((await service.runWorkerBatch(sql, orderedResearch)).worked, 0);
await sql`update race_collector_jobs set available_at=now() where run_id=${orderedRun.id}::uuid`;
await service.runWorker(sql, orderedResearch);
await service.runWorker(sql, orderedResearch);
assert.deepEqual(seenPasses, ["US-NY:1", "US-NY:2", "US-CA:1", "US-CA:2"]);
assert.equal((await service.dashboard(orderedRun.id, sql)).run.status, "complete");
// Cancelling and starting a new run cannot exceed the cap while old requests still have leases.
const cancelledRun = await service.createRun(
  { ...scope, dateTo: "2027-09-30", passes: 1 },
  "staff@example.org",
  sql,
);
await sql`update race_collector_jobs set status='running',lease_until=now()+interval '1 minute' where run_id=${cancelledRun.id}::uuid`;
await service.controlRun(cancelledRun.id, "cancel", sql);
const nextRun = await service.createRun(
  { ...scope, dateTo: "2027-03-31", passes: 1 },
  "staff@example.org",
  sql,
);
const callsBeforeCancelCheck = calls;
assert.equal((await service.runWorkerBatch(sql, research)).worked, 0);
assert.equal(calls, callsBeforeCancelCheck);
await sql`update race_collector_jobs set status='failed',lease_until=null where run_id=${cancelledRun.id}::uuid`;
// A provider rate error pauses future work, including requests from later batches.
await service.runWorkerBatch(sql, async () => {
  throw Object.assign(new Error("Simulated provider 429"), { pauseRun: true });
});
assert.equal((await service.dashboard(nextRun.id, sql)).run.status, "paused");
assert.equal((await service.runWorkerBatch(sql, research)).worked, 0);
await sql`update race_collector_jobs set available_at=now() where run_id=${nextRun.id}::uuid`;
await service.controlRun(nextRun.id, "resume", sql);
assert.equal((await service.dashboard(nextRun.id, sql)).run.error, null);
await service.runWorkerBatch(sql, research);
assert.equal((await service.dashboard(nextRun.id, sql)).run.status, "complete");
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
  "Race collector verified: quick/thorough scopes, monthly boundaries, parallel cap, pass ordering, concurrent deduplication, regions, units, durable jobs, leases, retries, staging and worker authentication.",
);
