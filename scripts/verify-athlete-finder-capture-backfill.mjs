import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  backfillCaptureSearchIndex,
  captureBackfillConnectionConfig,
  parseCaptureBackfillArgs,
} from "./backfill-athlete-finder-capture-index.mjs";

const marker = "PRIVATE SYNTHETIC PARTICIPANT AND CONNECTION SENTINEL";
const defaults = parseCaptureBackfillArgs();
assert.equal(defaults.mode, "check");
assert.equal(parseCaptureBackfillArgs(["--apply"]).mode, "apply");
assert.equal(parseCaptureBackfillArgs(["--batch-size=3"]).batchSize, 3);
assert.equal(parseCaptureBackfillArgs(["--max-captures", "7"]).maxCaptures, 7);
for (const args of [
  ["--check", "--apply"],
  ["--apply", "--apply"],
  ["--apply=true"],
  ["--unknown"],
  ["--batch-size"],
  ["--batch-size=0"],
  ["--batch-size=101"],
  ["--max-captures=-1"],
  ["--max-captures=10001"],
  ["--max-captures=1.5"],
  ["--time-budget-seconds=0"],
  ["--time-budget-seconds=3601"],
  ["--statement-timeout-ms=99"],
  ["--statement-timeout-ms=60001"],
  ["--lock-timeout-ms=0"],
  ["--lock-timeout-ms=5001"],
  ["--batch-size=1e2"],
  ["--batch-size=1=2"],
]) {
  assert.throws(() => parseCaptureBackfillArgs(args), { code: "INVALID_ARGUMENTS" });
}
const env = {
  DATABASE_URL: "postgresql://test:secret@unused.test/test",
  DATABASE_URL_UNPOOLED: "postgresql://test:secret@synthetic-pooler.neon.tech/test?sslmode=require",
};
const configured = captureBackfillConnectionConfig(env);
assert.equal(new URL(configured.connectionString).hostname, "synthetic.neon.tech");
assert.equal(new URL(configured.connectionString).searchParams.get("sslmode"), "verify-full");
assert.match(env.DATABASE_URL_UNPOOLED, /synthetic-pooler/);
assert.throws(() => captureBackfillConnectionConfig({}), { code: "DATABASE_URL_MISSING" });

const db = new PGlite();
const queries = [];
const reports = [];
let lockedId = null;
const client = {
  async query(text, values = []) {
    queries.push({ text, values });
    if (lockedId && text.endsWith("FOR UPDATE OF c") && values[0] === lockedId)
      throw Object.assign(new Error(marker), { code: "55P03" });
    return db.query(text, values);
  },
};
const report = (value) => reports.push(value);
const options = (extra = []) =>
  parseCaptureBackfillArgs(["--apply", "--batch-size=2", "--max-captures=10", ...extra]);
const stateRows = () =>
  db.query(`select capture_id::text,index_version,staff_only,indexed_rows,expected_rows
  from athlete_finder_capture_search_state order by capture_id`);
const refreshCalls = () =>
  queries.filter(
    ({ text }) =>
      text === "SELECT public.athlete_finder_refresh_capture_search($1::bigint) AS rows",
  );

try {
  const missing = await backfillCaptureSearchIndex(client);
  assert.equal(missing.stopReason, "missing_schema");
  assert.deepEqual(missing.missing, ["captures", "rows", "state", "refresh"]);
  await db.exec(`create table result_archive_source_captures(
    id bigint primary key,provider text not null,source_key text not null,
    source_url text not null,payload jsonb not null,row_count integer not null,
    captured_at timestamptz not null);
    create table synthetic_canonical_results(id int primary key,performance text);
    insert into synthetic_canonical_results values(1,'Preserved original result');`);
  const insert = async (id, provider, key, capturedAt, count, publication = "staff_only") =>
    db.query(
      `insert into result_archive_source_captures
      values($1,$2,$3,$4,$5::jsonb,$6,$7::timestamptz)`,
      [
        id,
        provider,
        key,
        `https://synthetic.test/${id}`,
        JSON.stringify({
          publication,
          rows: Array.from({ length: count }, (_, n) => ({ name: `${marker} ${n}` })),
        }),
        count,
        capturedAt,
      ],
    );
  await insert(1, "alpha", "race", "2026-10-01", 1);
  await insert(2, "alpha", "race", "2026-10-02", 2);
  await insert(3, "beta", "race", "2026-10-03", 3);
  await insert(4, "gamma", "race", "2026-10-04", 2, "public");
  await insert(5, "other-alpha", "race", "2026-10-01", 1);
  await insert(6, "beta", "race", "2026-10-03", 1);
  const originalCaptures = (
    await db.query("select * from result_archive_source_captures order by id")
  ).rows;
  await db.exec(readFileSync("migrations/20261023_athlete_finder_participant_index.sql", "utf8"));

  queries.length = 0;
  const check = await backfillCaptureSearchIndex(
    client,
    {
      ...defaults,
      batchSize: 2,
      maxCaptures: 2,
    },
    { report },
  );
  assert.equal(check.stopReason, "check_only");
  assert.deepEqual(check.before, { total: 6, ready: 0, pending: 6, pendingLatest: 4 });
  assert.deepEqual(
    check.preview.map(({ id }) => id),
    ["4", "6"],
  );
  assert.ok(check.preview.every(({ latest, reason }) => latest && reason === "missing"));
  assert.deepEqual((await stateRows()).rows, []);
  assert.equal(refreshCalls().length, 0);
  assert.ok(
    queries
      .filter(({ text }) => text.startsWith("BEGIN"))
      .every(({ text }) => text === "BEGIN READ ONLY"),
  );
  assert.ok(queries.every(({ text }) => !/^ANALYZE /i.test(text)));
  assert.ok(
    queries.every(({ text }) => !/\bpayload\b/i.test(text)),
    "Work selection must not read source JSON",
  );

  reports.length = 0;
  const bounded = { ...options(), maxCaptures: 2 };
  const first = await backfillCaptureSearchIndex(client, bounded, { report });
  assert.equal(first.stopReason, "max_captures");
  assert.equal(first.attempted, 2);
  assert.equal(first.indexedCaptures, 2);
  assert.equal(first.statistics, "updated");
  assert.deepEqual(first.after, { total: 6, ready: 2, pending: 4, pendingLatest: 2 });
  assert.deepEqual(
    reports.filter(({ event }) => event === "capture").map(({ id }) => id),
    ["4", "6"],
  );
  assert.deepEqual(
    (
      await db.query(`select staff_only,indexed_rows from athlete_finder_capture_search_state
    where capture_id=4`)
    ).rows[0],
    { staff_only: false, indexed_rows: 0 },
  );
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from athlete_finder_capture_search_rows where capture_id=4",
      )
    ).rows[0].count,
    0,
  );

  reports.length = 0;
  const second = await backfillCaptureSearchIndex(client, bounded, { report });
  assert.equal(second.stopReason, "max_captures");
  assert.deepEqual(second.after, { total: 6, ready: 4, pending: 2, pendingLatest: 0 });
  assert.deepEqual(
    reports.filter(({ event }) => event === "capture").map(({ id }) => id),
    ["2", "5"],
  );
  reports.length = 0;
  const third = await backfillCaptureSearchIndex(client, options(), { report });
  assert.equal(third.stopReason, "complete");
  assert.deepEqual(
    reports.filter(({ event }) => event === "capture").map(({ id }) => id),
    ["3", "1"],
  );
  assert.equal(third.after.pending, 0);
  assert.deepEqual(
    (await db.query("select * from result_archive_source_captures order by id")).rows,
    originalCaptures,
  );
  assert.deepEqual((await db.query("select * from synthetic_canonical_results")).rows, [
    { id: 1, performance: "Preserved original result" },
  ]);
  let transactionRefreshes = 0;
  for (const { text } of queries) {
    if (text.startsWith("BEGIN")) transactionRefreshes = 0;
    if (text === "SELECT public.athlete_finder_refresh_capture_search($1::bigint) AS rows")
      assert.ok(++transactionRefreshes <= 1, "Each capture refresh has its own transaction");
  }
  queries.length = 0;
  const noOp = await backfillCaptureSearchIndex(client, options());
  assert.equal(noOp.stopReason, "complete");
  assert.equal(noOp.attempted, 0);
  assert.equal(
    noOp.statistics,
    "updated",
    "A no-op apply can finish interrupted statistics maintenance",
  );
  assert.equal(refreshCalls().length, 0);

  // A real PostgreSQL exception after derived-row replacement must roll back
  // both names and metadata. A separate simulated lock failure must not starve
  // other candidates or retry the same ID endlessly within one invocation.
  await db.exec(`update athlete_finder_capture_search_state set index_version=2 where capture_id in (1,2,5);
    update athlete_finder_capture_search_rows set name_vector='old_synthetic_vector'::tsvector where capture_id=2;
    create function synthetic_reject_marker() returns trigger language plpgsql as $$
      begin if new.capture_id=2 then raise exception using errcode='57014',message='${marker}'; end if; return new; end $$;
    create trigger synthetic_reject_marker before insert on athlete_finder_capture_search_state
      for each row execute function synthetic_reject_marker();`);
  const priorRows = (
    await db.query(
      "select row_ordinal,name_vector::text from athlete_finder_capture_search_rows where capture_id=2 order by row_ordinal",
    )
  ).rows;
  lockedId = "5";
  queries.length = 0;
  reports.length = 0;
  const failed = await backfillCaptureSearchIndex(client, options(), { report });
  assert.equal(failed.stopReason, "failed_remaining");
  assert.equal(failed.attempted, 3);
  assert.equal(failed.indexedCaptures, 1);
  assert.deepEqual(failed.failures, [
    { id: "2", code: "57014" },
    { id: "5", code: "55P03" },
  ]);
  assert.equal(failed.after.pending, 2);
  assert.deepEqual(
    (
      await db.query(
        "select row_ordinal,name_vector::text from athlete_finder_capture_search_rows where capture_id=2 order by row_ordinal",
      )
    ).rows,
    priorRows,
  );
  assert.equal(
    (
      await db.query(
        "select index_version from athlete_finder_capture_search_state where capture_id=2",
      )
    ).rows[0].index_version,
    2,
  );
  assert.equal(
    queries.filter(({ text, values }) => text.endsWith("FOR UPDATE OF c") && values[0] === "5")
      .length,
    1,
  );
  assert.equal(JSON.stringify({ failed, reports }).includes(marker), false);
  assert.equal(JSON.stringify({ failed, reports }).includes("https://"), false);
  await db.exec(
    "drop trigger synthetic_reject_marker on athlete_finder_capture_search_state; drop function synthetic_reject_marker()",
  );
  lockedId = null;
  const retried = await backfillCaptureSearchIndex(client, options());
  assert.equal(retried.stopReason, "complete");
  assert.equal(retried.indexedCaptures, 2);
  assert.deepEqual(retried.failures, []);

  // Legacy summary counts can differ from the actual original rows array. Only
  // the atomically captured expected_rows controls name-index completeness.
  await insert(7, "malformed", "race", "2026-10-05", 1);
  await db.exec(`update result_archive_source_captures set row_count=2 where id=7;
    insert into result_archive_source_captures values
      (8,'legacy','missing-rows','https://synthetic.test/8','{"publication":"staff_only"}',5,'2026-10-05');
    delete from athlete_finder_capture_search_state where capture_id in (7,8)`);
  const legacySummary = await backfillCaptureSearchIndex(client, options());
  assert.equal(legacySummary.stopReason, "complete");
  assert.equal(legacySummary.indexedCaptures, 2);
  assert.deepEqual(
    (
      await db.query(`select capture_id::text,indexed_rows,expected_rows
    from athlete_finder_capture_search_state where capture_id in (7,8) order by capture_id`)
    ).rows,
    [
      { capture_id: "7", indexed_rows: 1, expected_rows: 1 },
      { capture_id: "8", indexed_rows: 0, expected_rows: 0 },
    ],
  );
  await db.exec("update athlete_finder_capture_search_state set indexed_rows=2 where capture_id=7");
  const repairedCount = await backfillCaptureSearchIndex(client, options());
  assert.equal(repairedCount.indexedCaptures, 1);
  assert.equal(repairedCount.stopReason, "complete");

  // A function result alone cannot declare success if a faulty metadata writer
  // leaves its completion marker inconsistent. Roll back and attempt it once.
  await db.exec(`update athlete_finder_capture_search_state set index_version=2 where capture_id=7;
    create function synthetic_bad_count() returns trigger language plpgsql as $$
      begin if new.capture_id=7 then new.indexed_rows:=new.expected_rows+1; end if; return new; end $$;
    create trigger synthetic_bad_count before insert on athlete_finder_capture_search_state
      for each row execute function synthetic_bad_count();`);
  const inconsistent = await backfillCaptureSearchIndex(client, options());
  assert.equal(inconsistent.attempted, 1);
  assert.equal(inconsistent.indexedCaptures, 0);
  assert.deepEqual(inconsistent.failures, [{ id: "7", code: "INDEX_INCONSISTENT" }]);
  assert.equal(inconsistent.after.pending, 1);
  const repeatedMismatch = await backfillCaptureSearchIndex(client, options());
  assert.equal(
    repeatedMismatch.attempted,
    1,
    "A later invocation retries the unfinished capture once",
  );
  await db.exec(
    "drop trigger synthetic_bad_count on athlete_finder_capture_search_state; drop function synthetic_bad_count()",
  );
  assert.equal((await backfillCaptureSearchIndex(client, options())).stopReason, "complete");

  await db.exec(
    "update athlete_finder_capture_search_state set index_version=2 where capture_id in (2,5)",
  );
  let clock = 0;
  queries.length = 0;
  const interrupted = await backfillCaptureSearchIndex(
    client,
    {
      ...options(),
      timeBudgetSeconds: 1,
      batchSize: 1,
    },
    {
      now: () => clock,
      report: (event) => {
        if (event.event === "capture") clock = 1_000;
      },
    },
  );
  assert.equal(interrupted.stopReason, "time_budget");
  assert.equal(interrupted.indexedCaptures, 1);
  assert.equal(interrupted.after, null, "Do not invent a final remaining count after the deadline");
  assert.equal(interrupted.statistics, "pending");
  assert.ok(
    queries
      .filter(({ text }) => text.startsWith("SELECT set_config"))
      .every(({ values }) => values[0] === "1000ms"),
  );
  assert.equal(refreshCalls().length, 1);
  const resumed = await backfillCaptureSearchIndex(client, options());
  assert.equal(resumed.indexedCaptures, 1);
  assert.equal(resumed.stopReason, "complete");
  assert.equal(resumed.after.pending, 0);

  // Every refresh is isolated in its own transaction; maintenance ANALYZE is
  // separate, and a subsequent read-only check cannot mutate indexed state.
  queries.length = 0;
  const beforeCheck = (await stateRows()).rows;
  const finalCheck = await backfillCaptureSearchIndex(client, defaults);
  assert.equal(finalCheck.before.pending, 0);
  assert.deepEqual((await stateRows()).rows, beforeCheck);
  assert.equal(refreshCalls().length, 0);
  assert.ok(
    queries
      .filter(({ text }) => text.startsWith("BEGIN"))
      .every(({ text }) => text === "BEGIN READ ONLY"),
  );

  console.log(
    "Capture-index backfill verified: read-only default, validated bounds, direct TLS connection config, latest-first partial resume, nonstaff metadata, atomic failure rollback, locked-ID skip/retry, inconsistent-count handling, time-budget interruption, no-op rerun and sanitized progress.",
  );
} finally {
  await db.close();
}
