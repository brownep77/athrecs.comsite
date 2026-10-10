import fs from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { auditResults } from "./lib/result-evidence-audit.mjs";
import { normalizePrivateSourceRow } from "./lib/private-source-normalization.mjs";

const [capturePath, runId, approvalId] = process.argv.slice(2);
if (!capturePath || !/^[a-f0-9-]{36}$/.test(runId ?? "") || !approvalId)
  throw new Error("Usage: prepare-private-result-capture.mjs CAPTURE RUN_UUID APPROVAL_ID");
const capture = JSON.parse(fs.readFileSync(capturePath, "utf8"));
if (capture.approvalId !== approvalId || capture.publication !== "staff_only")
  throw new Error("Source-specific private approval does not match");
if (capture.provider !== "Total Race Timing" || !/^https:\/\/totalracetiming\.co\.uk\/raceresults\/\d+$/.test(capture.sourceUrl))
  throw new Error("Source outside the reviewed provider scope");
const source = fs.readFileSync(capturePath.replace(/\.capture\.json$/, ".html"));
const sha = (value) => createHash("sha256").update(value).digest("hex");
if (sha(source) !== capture.htmlSha256) throw new Error("Original source hash changed");

const sources = capture.tables.map((table) => ({
  url: capture.sourceUrl + "#" + table.key,
  headings: capture.headings,
  startTimes: [table.startTime],
  rowCount: table.rows.length,
  tables: [table],
}));
const normalizedRows = capture.rows.map(normalizePrivateSourceRow);
const proposed = normalizedRows.map((row, index) => ({
  id: index + 1,
  source_id: row.sourceRow,
  source_bib: row.bib,
  display_name: row.name,
  event_name: capture.headings[0],
  event_date: row.date ?? capture.index.date,
  distance_code: row.distanceLabel,
  status: row.status,
  result_visibility: "private",
  source_url: capture.sourceUrl + "#" + row.tableKey,
  finish_time_seconds: row.finishSeconds,
  chip_time_seconds: row.chipSeconds,
  gun_time_seconds: row.gunSeconds,
  overall_place: row.overallPlace,
  gender_place: row.genderPlace,
  category_place: row.categoryPlace,
}));
const audit = auditResults(proposed, sources);
const issues = [
  ...capture.parserIssues.map((flag) => ({ flags: [flag] })),
  ...audit.issues.map(({ result_id, flags }) => ({ result_id, flags })),
  ...audit.comparisons.filter((row) => row.flags.length).map(({ result_id, flags }) => ({ result_id, flags })),
];
// An empty page is retained as evidence of a visited source, not a complete field.
if (!capture.tables.length) issues.push({ flags: ["no_result_tables"] });
fs.writeFileSync(capturePath.replace(/\.capture\.json$/, ".audit.json"), JSON.stringify(audit));
const check = { comparedRows: audit.scope.compared.results, untestedRows: audit.scope.untestedResults, issues, sourceCellsCompared: true, athleteIdentityVerified: false };
if (issues.length || audit.scope.untestedResults) {
  console.log(JSON.stringify({ action: "hold", sourceKey: capture.sourceKey, rows: capture.rows.length, check }));
  process.exit(0);
}
const payload = {
  schemaVersion: 2, sourceUrl: capture.sourceUrl, sourceKey: capture.sourceKey,
  provider: capture.provider, headings: capture.headings,
  index: { name: capture.index.name, date: capture.index.date, location: capture.index.location },
  tables: capture.tables, rows: normalizedRows,
  publication: "staff_only", identity: "unreviewed",
};
const stable = (value) => Array.isArray(value) ? value.map(stable) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => [k,stable(v)])) : value;
const hash = sha(JSON.stringify(stable(payload)));
const literal = (value) => "'" + String(value).replaceAll("'", "''") + "'";
const json = (value) => literal(JSON.stringify(value)) + "::jsonb";
const sql = `insert into result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
select ${literal(runId)}::uuid,a.id,${literal(capture.provider)},${literal(capture.sourceKey)},${literal(capture.sourceUrl)},${literal(hash)},${literal(capture.htmlSha256)},decode(${literal(gzipSync(source).toString("base64"))},'base64'),${json(payload)},${capture.rows.length},${literal(capture.rows.length ? "compared" : "empty")},${json(check)},${literal(capture.capturedAt)}::timestamptz
from result_archive_capture_approvals a where a.id=${literal(approvalId)} and a.provider=${literal(capture.provider)} and a.scope='staff_only' and a.revoked_at is null
on conflict(provider,source_key,payload_hash) do update set last_seen_at=now()
returning id,source_key,row_count,source_check,payload_hash`;
console.log(JSON.stringify({ action: "insert", sourceKey: capture.sourceKey, rows: capture.rows.length, hash, sql }));
