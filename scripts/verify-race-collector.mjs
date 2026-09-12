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
const { parseResearch } = await import("../src/lib/race-collector/research.server.ts");
const scope = {
  countries: ["IE"],
  dateFrom: "2027-01-01",
  dateTo: "2028-12-31",
  min: 0,
  max: 500,
  unit: "mi",
};
const windows = core.planScope(scope);
assert.equal(windows.length, 16);
assert.equal(windows[4].dateFrom, "2028-01-01");
assert.equal(windows[4].dateTo, "2028-03-31");
assert.equal(windows[7].dateTo, "2028-12-31");
assert.equal(core.COLLECTOR_COUNTRIES.length, 250);
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
  "Race collector verified: scope boundaries, units, duplicate identities, durable jobs, leases, retries, pause/cancel and worker authentication.",
);
