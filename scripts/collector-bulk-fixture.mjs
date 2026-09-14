// A disposable database with the real collector and publication schemas.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
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
// No network database is ever opened: every service call receives the isolated adapter.
process.env.DATABASE_URL = "postgresql://test-only@127.0.0.1/never-connect";
export const { actOnFindings } = await import("../src/lib/race-collector/bulk-actions.server.ts");
export const service = await import("../src/lib/race-collector/service.server.ts");
const { reconcile } = await import("../src/lib/race-collector/core.ts");
export const reviewer = "fixture-reviewer@example.org";
export async function bulkFixture() {
  const pg = new PGlite({ parsers: { 20: Number, 1082: (value) => value } });
  for (const name of [
    "0002_athrecs",
    "0003_full_catalogue",
    "0004_edition_entry_options",
    "0015_slug_redirects",
    "0016_catalogue_publishing",
    "20260912_worldwide_race_collector",
    "20260912_worldwide_race_collector_dismissals",
    "20260913_collector_duplicate_reviews",
    "20260914_collector_keep_decisions",
  ])
    await pg.exec(await readFile(`migrations/${name}.sql`, "utf8"));
  function adapter(db, inTransaction = false) {
    const sql = async (strings, ...values) => {
      let statement = strings[0];
      values.forEach((_, i) => (statement += `$${i + 1}${strings[i + 1]}`));
      return (await db.query(statement, values)).rows;
    };
    sql.query = async (statement, values = []) => (await db.query(statement, values)).rows;
    sql.transaction = (fn) =>
      inTransaction ? fn(sql) : db.transaction((tx) => fn(adapter(tx, true)));
    return sql;
  }
  const sql = adapter(pg);
  const scope = {
    countries: ["GB"],
    dateFrom: "2027-01-01",
    dateTo: "2027-12-31",
    min: 0,
    max: 500,
    unit: "km",
    passes: 1,
  };
  const runId = randomUUID(),
    jobId = randomUUID();
  await sql`insert into race_collector_runs(id,scope,status,requested_by,total_jobs) values(${runId}::uuid,${JSON.stringify(scope)}::jsonb,'complete',${reviewer},1)`;
  const window = { country: "GB", dateFrom: scope.dateFrom, dateTo: scope.dateTo, pass: 1 };
  await sql`insert into race_collector_jobs(id,run_id,ordinal,"window",status,report) values(${jobId}::uuid,${runId}::uuid,0,${JSON.stringify(window)}::jsonb,'complete','{"sources":["https://organiser.example.org/programme"],"gaps":[]}'::jsonb)`;
  let ordinal = 0;
  const add = async (name, changes = {}, rowChanges = {}) => {
    const candidate = {
      name,
      countryCode: "GB",
      country: "United Kingdom",
      city: "Norwich",
      region: "Norfolk",
      date: "2027-05-02",
      distance: 10,
      unit: "km",
      distanceKm: 10,
      distanceLabel: "10K",
      surface: "Road",
      sourceUrl: `https://organiser.example.org/programme/${++ordinal}`,
      entryUrl: "",
      startTime: "09:00",
      entryStatus: "TBC",
      sourceKind: "organiser",
      evidence:
        "The primary organiser programme confirms this exact date, distance and Norwich start venue.",
      notes: "Preserve the original newsletter evidence.",
      ...changes,
    };
    const decision = { ...reconcile(candidate, [], []), ...rowChanges };
    const id = randomUUID();
    await sql`insert into race_collector_candidates(id,run_id,job_id,fingerprint,candidate,status,reason,event_slug,event_id) values(${id}::uuid,${runId}::uuid,${jobId}::uuid,${id},${JSON.stringify(candidate)}::jsonb,${decision.status},${decision.reason},${decision.eventSlug},${decision.eventId})`;
    return (await sql`select * from race_collector_candidates where id=${id}::uuid`)[0];
  };
  const action = (ids, action, extra = {}) =>
    actOnFindings(
      { runId, ids, action, confirmed: true, sourcesReviewed: action === "publish", ...extra },
      reviewer,
      sql,
    );
  return { pg, sql, add, action, runId, jobId };
}
