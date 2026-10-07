// Isolated PostgreSQL only: never accepts a production connection string.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { Client, types } from "pg";
import * as cheerio from "cheerio";
import * as audit from "./lib/result-evidence-audit.mjs";
const require = createRequire(import.meta.url), ts = require("typescript");
function loadTs(path, deps = {}) {
  const module = { exports: {} };
  const compiled = ts.transpileModule(readFileSync(path, "utf8"), { fileName: path, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  new Function("require", "module", "exports", compiled.outputText)(name => {
    if (!(name in deps)) throw new Error(`Unexpected dependency: ${name}`);
    return deps[name];
  }, module, module.exports);
  return module.exports;
}
assert.equal(process.env.CI, "true", "Run only in the disposable CI PostgreSQL service");
assert.equal(process.env.DATABASE_URL ?? "", "", "Never use application database credentials in this test");
types.setTypeParser(20, Number); types.setTypeParser(1082, value => value); types.setTypeParser(1186, value => value);
const client = new Client({ host: "127.0.0.1", port: 5432, user: "postgres", password: "postgres", database: "athrecs_import_test" });
await client.connect();
let injectFailure = false;
const query = async (text, values = []) => {
  if (injectFailure && /insert\s+into\s+results\(/i.test(text)) throw new Error("Synthetic late failure");
  return (await client.query(text, values)).rows;
};
const sql = async (strings, ...values) => {
  let text = strings[0]; values.forEach((_, i) => { text += `$${i + 1}${strings[i + 1]}`; });
  return query(text, values);
};
sql.query = query;
sql.transaction = async work => {
  await client.query("begin");
  try { const result = await work(sql); await client.query("commit"); return result; }
  catch (error) { await client.query("rollback"); throw error; }
};
const core = loadTs("src/lib/staff-results-upload/core.ts");
const db = { getSql: async () => sql, dbSource: "neon" };
const headings = ["Position", "Forename", "Surname", "Gender", "Gender Pos", "Category", "Cat Pos", "Club", "Tag", "Time"];
let rows = [["1", "Fresh", "Synthetic", "M", "1", "MO", "1", "", "101", "00:35:09.1"], ["2", "Existing", "Synthetic", "M", "2", "MO", "2", "", "102", "00:35:50.1"]];
let eventName = "Synthetic PostgreSQL 10K", photoText = "View Photos";
const escape = text => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const source = { fetchSource: async () => `<h2>${eventName}</h2><h3>10k</h3><p>Start: 20/09/2026 10:00</p><table><thead><tr>${headings.map(h => `<th>${h}</th>`).join("")}<th></th></tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join("")}<td><a>${escape(photoText)}</a></td></tr>`).join("")}</tbody></table>` };
const service = loadTs("src/lib/staff-results-upload/service.server.ts", { "node:crypto": crypto, cheerio, "../db": db, "../site-scope": { IS_RUNRECS_SITE: false }, "../club-scanner/provider.server": source, "../../../scripts/lib/result-evidence-audit.mjs": audit, "./core": core, exceljs: require("exceljs") });
const commit = loadTs("src/lib/staff-results-upload/commit.server.ts", { "node:crypto": crypto, "../db": db, "./core": core, "./service.server": service });
const actor = { userId: "synthetic-postgres-staff", staffEmail: "synthetic-staff@example.test" };
const input = () => ({ filename: "synthetic.csv", content: [headings, ...rows].map(r => r.join(",")).join("\n"), eventName, date: "2026-09-20", distance: "10K", distanceKm: 10, sourceUrl: "https://totalracetiming.co.uk/raceresults/1", timingBasis: "chip" });
const decision = (index, athleteId) => ({ index, mode: athleteId ? "link" : "new", ...(athleteId ? { athleteId } : {}), identityNote: "Synthetic staff checked source identity evidence for this entry." });
const request = (upload, review, decisions) => ({ upload, reviewHash: review.reviewHash, requestId: crypto.randomUUID(), decisions, rightsConfirmed: true, identitiesConfirmed: true, confirmation: "IMPORT SELECTED RESULTS" });
async function snapshot() {
  const state = {};
  for (const table of ["athletes", "results", "events", "editions", "result_ingestion_runs", "result_ingestion_editions", "network_audit_log"])
    state[table] = (await query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from ${table} t`))[0].rows;
  return JSON.stringify(state);
}
try {
  assert.equal((await query("select current_database() as db"))[0].db, "athrecs_import_test");
  for (const name of readdirSync("migrations").filter(n => n.endsWith(".sql")).sort()) await client.query(readFileSync(`migrations/${name}`, "utf8"));
  await sql`insert into "user"("id","name","email","emailVerified","createdAt","updatedAt") values(${actor.userId},'Synthetic staff',${actor.staffEmail},true,now(),now())`;
  const [existing] = await sql`insert into athletes(slug,display_name,profile_visibility) values('existing-postgres-synthetic','Existing Synthetic','public') returning id`;
  const upload = input(), review = await service.previewUpload(upload);
  assert.deepEqual(review.rows.map(r => r.state), ["new", "review"]);
  const req = request(upload, review, [decision(1), decision(2, existing.id)]);
  const before = await snapshot();
  // Former bug: raw photo/action cell changes invalidated an otherwise identical review.
  photoText = "View new race photos";
  assert.equal((await service.previewUpload(upload)).reviewHash, review.reviewHash, "Photo actions must not invalidate unchanged result evidence");
  rows[0][9] = "00:35:09.2";
  await assert.rejects(() => commit.commitUpload(req, actor), /changed/);
  rows[0][9] = "00:35:09.1";
  rows[1][6] = "1";
  await assert.rejects(() => commit.commitUpload(req, actor), /changed/);
  rows[1][6] = "2";
  injectFailure = true;
  await assert.rejects(() => commit.commitUpload(req, actor), /Synthetic late failure/);
  injectFailure = false;
  assert.equal(await snapshot(), before, "Source changes and late failures leave every table unchanged");
  const saved = await commit.commitUpload(req, actor);
  assert.equal(saved.createdProfiles, 1); assert.equal(saved.linkedProfiles, 1); assert.equal(saved.importedResults, 2);
  const result = await sql`select chip_time_seconds,gun_time_seconds,result_details from results where ingestion_run_id=${saved.runId} order by overall_place`;
  assert.equal(result[0].chip_time_seconds, 2109); assert.equal(result[0].result_details.timing.chipSeconds, 2109.1); assert.equal(result[0].gun_time_seconds, null);
  const after = await snapshot();
  assert.equal((await commit.commitUpload(req, actor)).replay, true);
  assert.equal(await snapshot(), after, "Same request retries only retrieve the existing receipt");
  assert.equal((await service.previewUpload(upload)).summary.duplicate, 2);
  eventName = "Synthetic PostgreSQL Bulk 10K";
  rows = Array.from({ length: 430 }, (_, i) => [String(i + 1), `Test${i}`, `UniquePostgres${i}`, "M", String(i + 1), "MO", String(i + 1), "", String(i + 1000), `00:45:${String(i % 60).padStart(2, "0")}.1`]);
  const bulkInput = input(), bulkReview = await service.previewUpload(bulkInput);
  assert.equal(bulkReview.summary.new, 430);
  const bulk = await commit.commitUpload(request(bulkInput, bulkReview, rows.map((_, i) => decision(i + 1))), actor);
  assert.equal(bulk.importedResults, 430); assert.equal(bulk.createdProfiles, 430);
  assert.equal((await service.previewUpload(bulkInput)).summary.duplicate, 430);
  console.log("PASS: actual PostgreSQL/pg driver, real serializable transactions and advisory locks, migrated schema, photo-change stability, changed-time/placing rejection, rollback, exact chip precision, existing-profile reuse, replay receipts and 430-runner import. Isolated synthetic database only.");
} finally { await client.end(); }
