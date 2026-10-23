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
  const insert = async (key, rows, date = "2026-10-01", options = {}) => {
    const payload = {
      publication: options.publication ?? "staff_only",
      index: { name: `Synthetic race ${key}`, date, location: "Test" },
      rows,
    };
    return (
      await sql.query(
        `INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
      VALUES($5::uuid,$6,$7,$1,'https://example.test/'||$1,md5($2)||md5($2),repeat('a',64),'', $2::jsonb,$3,$8,'{}',$4::timestamptz) RETURNING id::text`,
        [
          key,
          JSON.stringify(payload),
          rows.length,
          date,
          options.runId ?? "00000000-0000-0000-0000-000000000001",
          options.approvalId ?? "test",
          options.provider ?? "Test timer",
          options.sourceCheck ?? "compared",
        ],
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

  // Latest observation wins before eligibility checks. A newer held, revoked or
  // nonstaff observation must suppress the earlier approved private version.
  await db.exec(`INSERT INTO result_archive_capture_approvals(id,provider,approved_by,approval_basis,evidence,revoked_at) VALUES
    ('revoked','Test timer','Synthetic','owner_private_import','{}',now()),
    ('other-provider','Other synthetic timer','Synthetic','owner_private_import','{}',null);
    INSERT INTO result_archive_capture_runs(id,approval_id,provider,inventory) VALUES
    ('00000000-0000-0000-0000-000000000002','revoked','Test timer','[]'),
    ('00000000-0000-0000-0000-000000000003','other-provider','Other synthetic timer','[]');`);
  const hidden = [];
  for (const [key, options] of [
    ["latest-held", { sourceCheck: "held" }],
    ["latest-revoked", { approvalId: "revoked", runId: "00000000-0000-0000-0000-000000000002" }],
    ["latest-nonstaff", { publication: "not_approved_for_staff" }],
  ]) {
    const previous = await insert(
      key,
      [{ name: "Earlier approved synthetic runner" }],
      "2026-09-01",
    );
    const newest = await insert(
      key,
      [{ name: "Restricted synthetic sentinel" }],
      "2026-10-01",
      options,
    );
    hidden.push(previous, newest);
    const listing = await listCapturedRaces(sql, { q: key, offset: 0 });
    assert.equal(
      listing.total,
      0,
      `${key}: newest ineligible observation cannot revive an older capture`,
    );
    assert.deepEqual(listing.rows, [], `${key}: neither version can enter the private review list`);
    for (const unavailableId of [previous, newest])
      await assert.rejects(
        () => capturedRaceRows(sql, { id: unavailableId, q: "", offset: 0 }),
        /unavailable or has been superseded/,
        `${key}: direct row access must obey the same latest/eligibility rule`,
      );
  }
  const oldEmpty = await insert(
    "latest-empty",
    [{ name: "Removed synthetic runner" }],
    "2026-09-01",
  );
  const newestEmpty = await insert("latest-empty", [], "2026-10-01", { sourceCheck: "empty" });
  const emptyListing = await listCapturedRaces(sql, { q: "latest-empty", offset: 0 });
  assert.equal(emptyListing.total, 1);
  assert.equal(emptyListing.rows[0].id, newestEmpty);
  assert.equal(emptyListing.rows[0].row_count, 0);
  assert.deepEqual((await capturedRaceRows(sql, { id: newestEmpty, q: "", offset: 0 })).rows, []);
  await assert.rejects(
    () => capturedRaceRows(sql, { id: oldEmpty, q: "", offset: 0 }),
    /superseded/,
  );

  const tiedOld = await insert("latest-tie", [{ name: "Earlier equal-time version" }]);
  const tiedNew = await insert("latest-tie", [{ name: "Latest equal-time version" }]);
  const lateInsertedOld = await insert(
    "latest-tie",
    [{ name: "Older date inserted later" }],
    "2026-09-01",
  );
  assert.equal((await listCapturedRaces(sql, { q: "latest-tie", offset: 0 })).rows[0].id, tiedNew);
  for (const superseded of [tiedOld, lateInsertedOld])
    await assert.rejects(
      () => capturedRaceRows(sql, { id: superseded, q: "", offset: 0 }),
      /superseded/,
    );

  const otherProvider = await insert(
    "latest-held",
    [{ name: "Separate provider synthetic runner" }],
    "2026-09-01",
    {
      provider: "Other synthetic timer",
      approvalId: "other-provider",
      runId: "00000000-0000-0000-0000-000000000003",
    },
  );
  const separateListing = await listCapturedRaces(sql, { q: "latest-held", offset: 0 });
  assert.deepEqual(
    separateListing.rows.map((row) => row.id),
    [otherProvider],
  );
  const allVisible = await listCapturedRaces(sql, { q: "", offset: 50 });
  assert.ok(allVisible.rows.every((row) => !hidden.includes(row.id)));

  // Display actual stored rows without correcting the original source summary.
  // Relax this one check in the disposable fixture to reproduce legacy shapes.
  const [constraint] = await sql`select conname,pg_get_constraintdef(oid) definition
    from pg_constraint where conrelid='result_archive_source_captures'::regclass
      and contype='c' and pg_get_constraintdef(oid) like '%jsonb_array_length%'`;
  assert.ok(constraint);
  const quotedConstraint = `"${constraint.conname.replaceAll('"', '""')}"`;
  const countBeforeLegacy = (await listCapturedRaces(sql, { q: "", offset: 0 })).results;
  const legacyIds = [];
  await db.exec(`alter table result_archive_source_captures drop constraint ${quotedConstraint}`);
  try {
    const actualRow = {
      name: "Counted Synthetic Runner",
      sourceRow: "17",
      original: { "Chip Time": "00:22:03.70", "Gun Time": "00:22:04.12" },
    };
    for (const [key, declared, storedRows, expected] of [
      ["count-missing-array", 21, undefined, 0],
      ["count-zero-summary", 0, [actualRow], 1],
      ["count-empty-array", 7, [], 0],
      ["count-malformed-object", 4, { name: "Not a participant array" }, 0],
      ["count-malformed-string", 3, "Not a participant array", 0],
      ["count-null-array", 2, null, 0],
    ]) {
      const captureId = await insert(key, []);
      legacyIds.push(captureId);
      const payload = JSON.stringify({
        publication: "staff_only",
        index: { name: `Synthetic race ${key}`, date: "2026-10-01", location: "Test" },
        rows: storedRows,
      });
      await sql`update result_archive_source_captures set payload=${payload}::jsonb,row_count=${declared}
        where id=${captureId}::bigint`;
      const listing = await listCapturedRaces(sql, { q: key, offset: 0 });
      assert.equal(listing.total, 1);
      assert.equal(
        listing.rows[0].row_count,
        expected,
        `${key}: list counts actual participant rows`,
      );
      const detail = await capturedRaceRows(sql, { id: captureId, q: "", offset: 0 });
      assert.equal(
        detail.race.row_count,
        expected,
        `${key}: race metadata agrees with its actual rows`,
      );
      assert.equal(detail.total, expected);
      assert.equal(detail.rows.length, expected);
      assert.equal(detail.next, null);
      if (expected) {
        assert.deepEqual(detail.rows, [{ ordinal: 1, row: actualRow }]);
        assert.equal(
          (await capturedRaceRows(sql, { id: captureId, q: "Counted Synthetic Runner", offset: 0 }))
            .total,
          1,
        );
      }
      assert.equal(
        (
          await sql`select row_count from result_archive_source_captures where id=${captureId}::bigint`
        )[0].row_count,
        declared,
        `${key}: reading actual counts must preserve the stored source summary`,
      );
    }
    assert.equal(
      (await listCapturedRaces(sql, { q: "", offset: 0 })).results,
      countBeforeLegacy + 1,
      "Aggregate participant totals use actual arrays, including positive rows behind a zero summary",
    );
  } finally {
    await sql`delete from result_archive_source_captures where id=any(${legacyIds}::bigint[])`;
    await db.exec(
      `alter table result_archive_source_captures add constraint ${quotedConstraint} ${constraint.definition}`,
    );
  }

  await db.exec("UPDATE result_archive_capture_approvals SET revoked_at=now()");
  assert.equal((await listCapturedRaces(sql, { q: "", offset: 0 })).results, 0);
  await assert.rejects(() => capturedRaceRows(sql, { id, q: "", offset: 0 }), /unavailable/);
  const api = readFileSync("src/lib/results-archive/captures-api.ts", "utf8");
  assert.equal((api.match(/\.middleware\(\[staffMiddleware\]\)/g) || []).length, 2);
  assert.equal((api.match(/\.validator\(/g) || []).length, 2);
  console.log(
    "Captured results: complete pagination, latest-first held/revoked/nonstaff suppression, actual array counts despite stale summaries, safe malformed rows, empty revisions, timestamp/id ties, provider isolation, literal searches, precision, revoked access and staff guards passed.",
  );
} finally {
  await db.close();
}
