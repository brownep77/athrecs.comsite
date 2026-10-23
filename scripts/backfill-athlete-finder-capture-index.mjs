#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import pg from "pg";
import {
  migrationConnectionString,
  postgresConnectionConfig,
} from "../src/lib/postgres-connection.js";

const defaults = Object.freeze({
  mode: "check",
  batchSize: 25,
  maxCaptures: 100,
  timeBudgetSeconds: 60,
  statementTimeoutMs: 30_000,
  lockTimeoutMs: 1_000,
});
const flags = {
  "--batch-size": ["batchSize", 1, 100],
  "--max-captures": ["maxCaptures", 1, 10_000],
  "--time-budget-seconds": ["timeBudgetSeconds", 1, 3_600],
  "--statement-timeout-ms": ["statementTimeoutMs", 100, 60_000],
  "--lock-timeout-ms": ["lockTimeoutMs", 1, 5_000],
};
const codedError = (code) => Object.assign(new Error(code), { code });
const safeCode = (error) =>
  typeof error?.code === "string" &&
  (/^[0-9A-Z]{5}$/.test(error.code) ||
    [
      "TIME_BUDGET",
      "INVALID_ARGUMENTS",
      "DATABASE_URL_MISSING",
      "INDEX_INCONSISTENT",
      "INVALID_COUNT",
      "ECONNREFUSED",
      "ECONNRESET",
      "ENOTFOUND",
      "ETIMEDOUT",
    ].includes(error.code))
    ? error.code
    : "DATABASE_ERROR";

function validatedOptions(options) {
  const result = { ...defaults, ...options };
  if (!["check", "apply"].includes(result.mode)) throw codedError("INVALID_ARGUMENTS");
  for (const [name, minimum, maximum] of Object.values(flags)) {
    if (!Number.isSafeInteger(result[name]) || result[name] < minimum || result[name] > maximum)
      throw codedError("INVALID_ARGUMENTS");
  }
  return result;
}

export function parseCaptureBackfillArgs(args = []) {
  const options = {};
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const [flag, inline, ...extra] = args[index].split("=");
    if (extra.length || seen.has(flag)) throw codedError("INVALID_ARGUMENTS");
    seen.add(flag);
    if (["--check", "--apply", "--help"].includes(flag)) {
      if (inline !== undefined) throw codedError("INVALID_ARGUMENTS");
      if (flag === "--help") options.help = true;
      else {
        if (options.mode) throw codedError("INVALID_ARGUMENTS");
        options.mode = flag.slice(2);
      }
    } else {
      if (!flags[flag]) throw codedError("INVALID_ARGUMENTS");
      const value = inline ?? args[++index];
      if (!/^[0-9]+$/.test(value ?? "")) throw codedError("INVALID_ARGUMENTS");
      options[flags[flag][0]] = Number(value);
    }
  }
  return validatedOptions(options);
}

export function captureBackfillConnectionConfig(env, rawOptions = {}) {
  const options = validatedOptions(rawOptions);
  const configured =
    env.DATABASE_URL_UNPOOLED?.trim() ||
    env.POSTGRES_URL_NON_POOLING?.trim() ||
    env.DATABASE_URL?.trim();
  if (!configured) throw codedError("DATABASE_URL_MISSING");
  return postgresConnectionConfig(migrationConnectionString(configured), {
    connectionTimeoutMillis: Math.min(10_000, options.timeBudgetSeconds * 1_000),
    query_timeout: options.statementTimeoutMs + 5_000,
    options: `-c statement_timeout=${options.statementTimeoutMs} -c lock_timeout=${options.lockTimeoutMs}`,
  });
}

// Match search readiness exactly. Publication comes from atomically maintained
// metadata; selecting work never reads source payloads or participant names.
// expected_rows describes the retained array; legacy row_count can be stale.
const ready = `search_state.index_version=1
  AND ((search_state.staff_only AND search_state.indexed_rows=search_state.expected_rows)
    OR (NOT search_state.staff_only AND search_state.indexed_rows=0 AND search_state.expected_rows=0))`;
const latest = `WITH latest AS MATERIALIZED (
  SELECT DISTINCT ON (provider,source_key) id
  FROM public.result_archive_source_captures
  ORDER BY provider,source_key,captured_at DESC,id DESC
)`;
const pending = `NOT EXISTS (
  SELECT 1 FROM public.athlete_finder_capture_search_state search_state
  WHERE search_state.capture_id=c.id AND ${ready}
)`;
const countQuery = `${latest}
  SELECT count(*)::bigint AS total,
    count(*) FILTER (WHERE NOT ${pending})::bigint AS ready,
    count(*) FILTER (WHERE ${pending})::bigint AS pending,
    count(*) FILTER (WHERE current.id IS NOT NULL AND ${pending})::bigint AS "pendingLatest"
  FROM public.result_archive_source_captures c
  LEFT JOIN latest current ON current.id=c.id`;
const candidateQuery = `${latest}
  SELECT c.id::text AS id,current.id IS NOT NULL AS latest,
    CASE WHEN search_state.capture_id IS NULL THEN 'missing'
      WHEN search_state.index_version<>1 THEN 'unsupported_version'
      ELSE 'inconsistent_count' END AS reason
  FROM public.result_archive_source_captures c
  LEFT JOIN latest current ON current.id=c.id
  LEFT JOIN public.athlete_finder_capture_search_state search_state ON search_state.capture_id=c.id
  WHERE ${pending} AND NOT (c.id=ANY($1::bigint[]))
  ORDER BY (current.id IS NOT NULL) DESC,c.captured_at DESC,c.id DESC LIMIT $2`;
const captureReadyQuery = `SELECT c.id::text AS id,
  EXISTS (SELECT 1 FROM public.athlete_finder_capture_search_state search_state
    WHERE search_state.capture_id=c.id AND ${ready}) AS ready
  FROM public.result_archive_source_captures c WHERE c.id=$1::bigint`;
const numericCount = (value) => {
  if (!/^[0-9]+$/.test(String(value)) || !Number.isSafeInteger(Number(value)))
    throw codedError("INVALID_COUNT");
  return Number(value);
};

/** A dedicated pg-compatible client is injected; importing this module never connects. */
export async function backfillCaptureSearchIndex(client, rawOptions = {}, dependencies = {}) {
  const options = validatedOptions(rawOptions);
  const now = dependencies.now ?? Date.now;
  const report = dependencies.report ?? (() => {});
  const started = now();
  const deadline = started + options.timeBudgetSeconds * 1_000;
  const remaining = () => {
    const milliseconds = Math.floor(deadline - now());
    if (milliseconds <= 0) throw codedError("TIME_BUDGET");
    return milliseconds;
  };
  async function transaction(readOnly, work) {
    remaining();
    await client.query(readOnly ? "BEGIN READ ONLY" : "BEGIN");
    try {
      const query = async (text, values = []) => {
        const timeout = Math.min(options.statementTimeoutMs, remaining());
        await client.query(
          "SELECT set_config('statement_timeout',$1,true),set_config('lock_timeout',$2,true)",
          [`${timeout}ms`, `${Math.min(options.lockTimeoutMs, timeout)}ms`],
        );
        return client.query(text, values);
      };
      const result = await work(query);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    }
  }
  const counts = () =>
    transaction(true, async (query) => {
      const {
        rows: [row],
      } = await query(countQuery);
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, numericCount(value)]),
      );
    });
  const candidates = (excluded, limit) =>
    transaction(true, async (query) => (await query(candidateQuery, [excluded, limit])).rows);
  const result = {
    mode: options.mode,
    stopReason: "complete",
    before: null,
    after: null,
    attempted: 0,
    indexedCaptures: 0,
    indexedRows: 0,
    skipped: 0,
    failures: [],
    statistics: "not_needed",
  };
  try {
    const schema = await transaction(
      true,
      async (query) =>
        (
          await query(`SELECT
        to_regclass('public.result_archive_source_captures') IS NOT NULL AS captures,
        to_regclass('public.athlete_finder_capture_search_rows') IS NOT NULL AS rows,
        to_regclass('public.athlete_finder_capture_search_state') IS NOT NULL AS state,
        to_regprocedure('public.athlete_finder_refresh_capture_search(bigint)') IS NOT NULL AS refresh`)
        ).rows[0],
    );
    const missing = Object.entries(schema)
      .filter(([, exists]) => !exists)
      .map(([name]) => name);
    if (missing.length)
      return { ...result, stopReason: "missing_schema", missing, elapsedMs: now() - started };
    result.before = await counts();
    report({ event: "start", mode: options.mode, counts: result.before });
    if (options.mode === "check") {
      const preview = await candidates([], Math.min(options.batchSize, options.maxCaptures));
      return { ...result, stopReason: "check_only", preview, elapsedMs: now() - started };
    }
    const seen = new Set();
    while (result.attempted < options.maxCaptures) {
      const batch = await candidates(
        [...seen],
        Math.min(options.batchSize, options.maxCaptures - result.attempted),
      );
      if (!batch.length) break;
      for (const capture of batch) {
        remaining();
        seen.add(capture.id);
        result.attempted += 1;
        try {
          const indexed = await transaction(false, async (query) => {
            const {
              rows: [current],
            } = await query(`${captureReadyQuery} FOR UPDATE OF c`, [capture.id]);
            if (!current || current.ready) return null;
            const {
              rows: [refreshed],
            } = await query(
              "SELECT public.athlete_finder_refresh_capture_search($1::bigint) AS rows",
              [capture.id],
            );
            const {
              rows: [checked],
            } = await query(captureReadyQuery, [capture.id]);
            if (!checked?.ready) throw codedError("INDEX_INCONSISTENT");
            return numericCount(refreshed.rows);
          });
          if (indexed === null) result.skipped += 1;
          else {
            result.indexedCaptures += 1;
            result.indexedRows += indexed;
          }
          report({
            event: "capture",
            id: capture.id,
            status: indexed === null ? "skipped" : "indexed",
            indexedRows: indexed,
          });
        } catch (error) {
          if (safeCode(error) === "TIME_BUDGET") throw error;
          const failure = { id: capture.id, code: safeCode(error) };
          result.failures.push(failure);
          report({ event: "capture", status: "failed", ...failure });
        }
      }
    }
    result.after = await counts();
    result.stopReason =
      result.after.pending === 0
        ? "complete"
        : result.attempted >= options.maxCaptures
          ? "max_captures"
          : "failed_remaining";
  } catch (error) {
    result.stopReason = safeCode(error) === "TIME_BUDGET" ? "time_budget" : "database_error";
    if (result.stopReason === "database_error") result.code = safeCode(error);
  }
  // A completed no-op rerun can finish statistics maintenance left pending by
  // an earlier time budget, without rebuilding or changing any capture index.
  if (options.mode === "apply" && (result.indexedCaptures > 0 || result.before?.pending === 0)) {
    try {
      await transaction(false, (query) =>
        query(
          "ANALYZE public.athlete_finder_capture_search_rows,public.athlete_finder_capture_search_state",
        ),
      );
      result.statistics = "updated";
    } catch (error) {
      result.statistics = safeCode(error) === "TIME_BUDGET" ? "pending" : "failed";
      result.statisticsCode = safeCode(error);
    }
  }
  return { ...result, elapsedMs: now() - started };
}

const help = `Usage: npm run backfill:athlete-finder-capture-index -- [options]

Default --check is read only. --apply builds private derived name indexes.
  --check | --apply
  --batch-size N              1–100, default 25
  --max-captures N            1–10000, default 100 (includes failed/skipped attempts)
  --time-budget-seconds N     1–3600, default 60
  --statement-timeout-ms N    100–60000, default 30000
  --lock-timeout-ms N         1–5000, default 1000

Latest source versions are attempted before older versions. Failures are skipped
only for this run; the next --apply retries unfinished work. The time budget stops
new work and bounds each statement; transaction cleanup may finish afterward.
Successful --apply work refreshes derived-table statistics within the same budget.
Uses DATABASE_URL_UNPOOLED, POSTGRES_URL_NON_POOLING, then DATABASE_URL, with
the project's direct-connection and TLS normalization. No connection URL is logged.
`;

async function main() {
  let client;
  const report = (value) => console.log(JSON.stringify(value));
  try {
    const options = parseCaptureBackfillArgs(process.argv.slice(2));
    if (options.help) return console.log(help);
    client = new pg.Client(captureBackfillConnectionConfig(process.env, options));
    client.on("error", (error) => {
      report({ event: "connection_error", code: safeCode(error) });
      process.exitCode = 1;
    });
    await client.connect();
    const result = await backfillCaptureSearchIndex(client, options, { report });
    report({ event: "summary", ...result });
    if (
      result.failures.length ||
      result.statistics === "failed" ||
      ["database_error", "missing_schema"].includes(result.stopReason)
    )
      process.exitCode = 1;
  } catch (error) {
    report({ event: "error", code: safeCode(error) });
    process.exitCode = 1;
  } finally {
    await client?.end().catch(() => {});
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
