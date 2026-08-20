import { randomUUID } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import {
  getBulkSourceJobManifest,
  getFixtureSourceRegistrySummary,
  type BulkSourceJobManifest,
} from "./source-registry.server";

type RunRow = {
  id: string;
  registry_hash: string;
  registry_source_count: number;
  runnable_source_count: number;
  blocked_source_count: number;
  status: string;
  requested_at: string;
  started_at: string | null;
  finished_at: string | null;
};

type JobCountRow = {
  status: string;
  count: number;
};

const JOB_COLUMNS = [
  "id",
  "run_id",
  "source_id",
  "source_name",
  "start_url",
  "source_type",
  "source_section",
  "region_scope",
  "country_focus",
  "coverage_scope",
  "surface_scope",
  "allowed_domains",
  "race_link_include_regex",
  "race_link_exclude_regex",
  "profile",
  "follow_history_links",
  "max_pages",
  "rate_limit_seconds",
  "rights_status",
  "notes",
  "enabled_at_queue_time",
  "status",
  "block_reason",
] as const;

function jobValues(runId: string, source: BulkSourceJobManifest): unknown[] {
  return [
    `${runId}:${source.source_id}`,
    runId,
    source.source_id,
    source.source_name,
    source.start_url,
    source.source_type,
    source.source_section,
    source.region_scope,
    source.country_focus,
    source.coverage_scope,
    source.surface_scope,
    source.allowed_domains,
    source.race_link_include_regex || null,
    source.race_link_exclude_regex || null,
    source.profile,
    source.follow_history_links,
    source.max_pages,
    source.rate_limit_seconds,
    source.rights_status,
    source.notes,
    source.enabled,
    source.queue_status,
    source.block_reason,
  ];
}

async function insertJobChunk(
  sql: Sql,
  runId: string,
  sources: BulkSourceJobManifest[],
): Promise<void> {
  if (sources.length === 0) return;
  const values: unknown[] = [];
  const valueGroups = sources.map((source) => {
    const row = jobValues(runId, source);
    const placeholders = row.map((value) => {
      values.push(value);
      return `$${values.length}`;
    });
    return `(${placeholders.join(", ")})`;
  });
  await sql.query(
    `insert into fixture_source_jobs (${JOB_COLUMNS.join(", ")})
     values ${valueGroups.join(", ")}
     on conflict (run_id, source_id) do nothing`,
    values,
  );
}

async function syncRunJobs(
  sql: Sql,
  runId: string,
  manifest: BulkSourceJobManifest[],
): Promise<void> {
  for (let index = 0; index < manifest.length; index += 50) {
    await insertJobChunk(sql, runId, manifest.slice(index, index + 50));
  }
}

async function runDashboard(sql: Sql, run: RunRow | undefined) {
  const registry = getFixtureSourceRegistrySummary();
  if (!run) return { registry, latestRun: null };

  const counts = await sql<JobCountRow>`
    select status, count(*)::int as count
    from fixture_source_jobs
    where run_id = ${run.id}
    group by status
    order by status
  `;
  const jobsByStatus = Object.fromEntries(counts.map((row) => [row.status, row.count]));
  return {
    registry,
    latestRun: {
      id: run.id,
      registryHash: run.registry_hash,
      registrySourceCount: run.registry_source_count,
      runnableSourceCount: run.runnable_source_count,
      blockedSourceCount: run.blocked_source_count,
      status: run.status,
      requestedAt: run.requested_at,
      startedAt: run.started_at,
      finishedAt: run.finished_at,
      jobsByStatus,
      totalJobs: counts.reduce((total, row) => total + row.count, 0),
    },
  };
}

async function latestRun(sql: Sql): Promise<RunRow | undefined> {
  const rows = await sql<RunRow>`
    select
      id,
      registry_hash,
      registry_source_count,
      runnable_source_count,
      blocked_source_count,
      status,
      requested_at::text as requested_at,
      started_at::text as started_at,
      finished_at::text as finished_at
    from fixture_source_runs
    order by requested_at desc
    limit 1
  `;
  return rows[0];
}

export async function getFixtureSourceBulkRunDashboard() {
  const sql = await getSql();
  return runDashboard(sql, await latestRun(sql));
}

/**
 * Create one durable run containing every source in the registry exactly once.
 * Approved rows are queued. Disabled/unapproved rows are retained as blocked
 * jobs, so the run is auditable and future runs pick them up when the CSV flag
 * changes without requiring another code path.
 */
export async function queueFixtureSourceBulkRun() {
  const sql = await getSql();
  const manifest = getBulkSourceJobManifest();
  const registry = getFixtureSourceRegistrySummary();
  const result = await sql.transaction(async (tx) => {
    const activeRows = await tx<RunRow>`
      select
        id,
        registry_hash,
        registry_source_count,
        runnable_source_count,
        blocked_source_count,
        status,
        requested_at::text as requested_at,
        started_at::text as started_at,
        finished_at::text as finished_at
      from fixture_source_runs
      where status in ('queued', 'running')
      order by requested_at desc
      limit 1
      for update
    `;
    let run = activeRows[0];
    let created = false;
    if (!run) {
      const runId = randomUUID();
      const inserted = await tx<RunRow>`
        insert into fixture_source_runs (
          id,
          registry_hash,
          registry_source_count,
          runnable_source_count,
          blocked_source_count,
          status
        ) values (
          ${runId},
          ${registry.registryHash},
          ${registry.sources},
          ${registry.runnable},
          ${registry.blocked},
          'queued'
        )
        returning
          id,
          registry_hash,
          registry_source_count,
          runnable_source_count,
          blocked_source_count,
          status,
          requested_at::text as requested_at,
          started_at::text as started_at,
          finished_at::text as finished_at
      `;
      run = inserted[0];
      created = true;
    } else if (run.registry_hash !== registry.registryHash) {
      await tx`
        update fixture_source_runs set
          registry_hash = ${registry.registryHash},
          registry_source_count = ${registry.sources},
          runnable_source_count = ${registry.runnable},
          blocked_source_count = ${registry.blocked}
        where id = ${run.id}
      `;
      run = {
        ...run,
        registry_hash: registry.registryHash,
        registry_source_count: registry.sources,
        runnable_source_count: registry.runnable,
        blocked_source_count: registry.blocked,
      };
    }
    if (!run) throw new Error("Could not create the fixture source bulk run");
    await syncRunJobs(tx, run.id, manifest);
    return { run, created };
  });

  return {
    ...(await runDashboard(sql, result.run)),
    created: result.created,
  };
}
