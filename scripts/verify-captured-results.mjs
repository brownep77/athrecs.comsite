import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { PGlite } from "@electric-sql/pglite";
const require = createRequire(import.meta.url),
  ts = require("typescript");
const module = { exports: {} };
new Function(
  "module",
  "exports",
  ts.transpileModule(readFileSync("src/lib/results-archive/captures.server.ts", "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText,
)(module, module.exports);
const { listCapturedRaces, capturedRaceRows } = module.exports;
const db = new PGlite();
const sql = async (parts, ...args) =>
  (
    await db.query(
      parts.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
      args,
    )
  ).rows;
sql.query = async (text, args = []) => (await db.query(text, args)).rows;
try {
  assert.equal((await listCapturedRaces(sql, { q: "", offset: 0 })).available, false);
  await db.exec(readFileSync("migrations/20261009_private_source_captures.sql", "utf8"));
  await db.exec(`INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,evidence) VALUES('test','Test timer','Synthetic','owner_private_import','{}');
    INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory) VALUES('00000000-0000-0000-0000-000000000001','test','Test timer','[]');`);
  const insert = async (key, rows, date = "2026-10-01") => {
    const payload = {
      publication: "staff_only",
      index: { name: `Synthetic race ${key}`, date, location: "Test" },
      rows,
    };
    return (
      await sql.query(
        `INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
      VALUES('00000000-0000-0000-0000-000000000001','test','Test timer',$1,'https://example.test/'||$1,md5($2)||md5($2),repeat('a',64),'', $2::jsonb,$3,'compared','{}',$4::timestamptz) RETURNING id::text`,
        [key, JSON.stringify(payload), rows.length, date],
      )
    )[0].id;
  };
  const rows = Array.from({ length: 201 }, (_, i) => ({
    name: `Synthetic Runner ${i}`,
    bib: String(i),
    tableKey: "5k",
    sourceRow: String(i + 1),
    original: { "Chip Time": "00:22:03.7", "Gun Time": "00:22:04.1", Position: String(i + 1) },
  }));
  const old = await insert("1", [{ name: "Old version" }], "2026-09-01");
  const id = await insert("1", rows);
  for (let i = 2; i <= 52; i++) await insert(String(i), [{ name: "Single Runner" }]);
  const first = await listCapturedRaces(sql, { q: "", offset: 0 });
  assert.equal(first.races, 52);
  assert.equal(first.results, 252);
  assert.equal(first.rows.length, 50);
  assert.equal(first.next, 50);
  assert.equal((await listCapturedRaces(sql, { q: "", offset: 50 })).rows.length, 2);
  assert.equal((await listCapturedRaces(sql, { q: "%' OR true --", offset: 0 })).total, 0);
  await assert.rejects(() => capturedRaceRows(sql, { id: old, q: "", offset: 0 }), /superseded/);
  const page = await capturedRaceRows(sql, { id, q: "", offset: 100 });
  assert.equal(page.total, 201);
  assert.equal(page.rows.length, 100);
  assert.equal(page.rows[0].ordinal, 101);
  assert.equal(page.next, 200);
  assert.equal(page.rows[0].row.original["Chip Time"], "00:22:03.7");
  const final = await capturedRaceRows(sql, { id, q: "", offset: 200 });
  assert.equal(final.rows.length, 1);
  assert.equal(final.next, null);
  assert.equal((await capturedRaceRows(sql, { id, q: "Runner 200", offset: 0 })).total, 1);
  await db.exec("UPDATE result_archive_capture_approvals SET revoked_at=now()");
  assert.equal((await listCapturedRaces(sql, { q: "", offset: 0 })).results, 0);
  await assert.rejects(() => capturedRaceRows(sql, { id, q: "", offset: 0 }), /unavailable/);
  const api = readFileSync("src/lib/results-archive/captures-api.ts", "utf8");
  assert.equal((api.match(/\.middleware\(\[staffMiddleware\]\)/g) || []).length, 2);
  assert.equal((api.match(/\.validator\(/g) || []).length, 2);
  console.log(
    "Captured results: complete pagination, revision selection, literal searches, precision, revoked access and staff guards passed.",
  );
} finally {
  await db.close();
}
