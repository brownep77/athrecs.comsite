import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";

export type ResultIngestionRunStatus =
  | "queued"
  | "processing"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "cancelled";

export type ResultEditionCoverageStatus =
  | "queued"
  | "processing"
  | "complete"
  | "partial"
  | "failed"
  | "blocked";

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function limitValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 10), 250) : 100;
}

export const getResultArchiveDashboard = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator(
    (
      input:
        | { q?: string; sport?: string; status?: ResultEditionCoverageStatus | "all"; limit?: number }
        | undefined,
    ) => ({
      q: input?.q?.trim().slice(0, 160) || "",
      sport: input?.sport?.trim().slice(0, 80) || "",
      status: input?.status || "all",
      limit: limitValue(input?.limit),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const q = data.q ? `%${data.q.toLowerCase()}%` : null;
    const sport = data.sport || null;
    const status = data.status === "all" ? null : data.status;

    const [summaryRows, sportRows, runs, editions] = await Promise.all([
      sql<{
        run_count: number;
        tracked_editions: number;
        inserted_results: number;
        updated_results: number;
        skipped_rows: number;
        private_results: number;
        public_results: number;
      }>`
        select
          (select count(*)::int from result_ingestion_runs) as run_count,
          (select count(distinct edition_id)::int from result_ingestion_editions) as tracked_editions,
          (select coalesce(sum(rows_imported), 0)::int from result_ingestion_runs) as inserted_results,
          (select coalesce(sum(rows_updated), 0)::int from result_ingestion_runs) as updated_results,
          (select coalesce(sum(rows_skipped), 0)::int from result_ingestion_runs) as skipped_rows,
          (
            select count(*)::int from results result
            join athletes athlete on athlete.id = result.athlete_id
            where result.result_visibility = 'private'
              and athlete.profile_type <> 'Public figure'
              and athlete.profile_visibility = 'private'
          ) as private_results,
          (
            select count(*)::int from results result
            join athletes athlete on athlete.id = result.athlete_id
            where result.result_visibility in ('public', 'public_figure')
              or athlete.profile_type = 'Public figure'
              or athlete.profile_visibility = 'public'
          ) as public_results
      `,
      sql<{ sport: string; edition_count: number; result_count: number }>`
        select
          coverage.sport,
          count(distinct coverage.edition_id)::int as edition_count,
          coalesce(sum(coverage.rows_imported + coverage.rows_updated), 0)::int as result_count
        from result_ingestion_editions coverage
        group by coverage.sport
        order by result_count desc, coverage.sport
      `,
      sql<{
        id: string;
        sport: string;
        source_name: string;
        source_url: string | null;
        acquisition_method: string;
        file_name: string | null;
        status: ResultIngestionRunStatus;
        rows_detected: number;
        rows_imported: number;
        rows_updated: number;
        rows_skipped: number;
        edition_count: number;
        error_count: number;
        requested_by_email: string | null;
        started_at: string;
        finished_at: string | null;
      }>`
        select
          id, sport, source_name, source_url, acquisition_method, file_name, status,
          rows_detected, rows_imported, rows_updated, rows_skipped, edition_count,
          error_count, requested_by_email, started_at::text as started_at,
          finished_at::text as finished_at
        from result_ingestion_runs
        order by created_at desc
        limit 30
      `,
      sql<{
        id: number;
        ingestion_run_id: string;
        sport: string;
        event_name: string;
        event_slug: string;
        event_date: string;
        distance_code: string;
        source_url: string | null;
        source_name: string;
        acquisition_method: string;
        status: ResultEditionCoverageStatus;
        rows_detected: number;
        rows_imported: number;
        rows_updated: number;
        rows_skipped: number;
        error_count: number;
        updated_at: string;
      }>`
        select
          coverage.id,
          coverage.ingestion_run_id,
          coverage.sport,
          coverage.event_name,
          coverage.event_slug,
          coverage.event_date::text as event_date,
          coverage.distance_code,
          coverage.source_url,
          run.source_name,
          run.acquisition_method,
          coverage.status,
          coverage.rows_detected,
          coverage.rows_imported,
          coverage.rows_updated,
          coverage.rows_skipped,
          coverage.error_count,
          coverage.updated_at::text as updated_at
        from result_ingestion_editions coverage
        join result_ingestion_runs run on run.id = coverage.ingestion_run_id
        where (${sport}::text is null or coverage.sport = ${sport})
          and (${status}::text is null or coverage.status = ${status})
          and (
            ${q}::text is null
            or lower(coverage.event_name) like ${q}
            or lower(coverage.event_slug) like ${q}
            or lower(run.source_name) like ${q}
            or lower(coalesce(coverage.source_url, '')) like ${q}
          )
        order by coverage.event_date desc, coverage.event_name, coverage.distance_code
        limit ${data.limit}
      `,
    ]);

    const summary = summaryRows[0] ?? {
      run_count: 0,
      tracked_editions: 0,
      inserted_results: 0,
      updated_results: 0,
      skipped_rows: 0,
      private_results: 0,
      public_results: 0,
    };

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        runs: summary.run_count,
        trackedEditions: summary.tracked_editions,
        insertedResults: summary.inserted_results,
        updatedResults: summary.updated_results,
        skippedRows: summary.skipped_rows,
        privateResults: summary.private_results,
        publicResults: summary.public_results,
      },
      sports: sportRows.map((row) => ({
        sport: row.sport,
        editionCount: row.edition_count,
        resultCount: row.result_count,
      })),
      runs: runs.map((run) => ({
        id: run.id,
        sport: run.sport,
        sourceName: run.source_name,
        sourceUrl: run.source_url,
        acquisitionMethod: run.acquisition_method,
        fileName: run.file_name,
        status: run.status,
        rowsDetected: run.rows_detected,
        rowsInserted: run.rows_imported,
        rowsUpdated: run.rows_updated,
        rowsSkipped: run.rows_skipped,
        editionCount: run.edition_count,
        errorCount: run.error_count,
        requestedByEmail: run.requested_by_email,
        startedAt: run.started_at,
        finishedAt: run.finished_at,
      })),
      editions: editions.map((edition) => ({
        id: edition.id,
        runId: edition.ingestion_run_id,
        sport: edition.sport,
        eventName: edition.event_name,
        eventSlug: edition.event_slug,
        eventDate: edition.event_date,
        distanceCode: edition.distance_code,
        sourceUrl: edition.source_url,
        sourceName: edition.source_name,
        acquisitionMethod: edition.acquisition_method,
        status: edition.status,
        rowsDetected: edition.rows_detected,
        rowsInserted: edition.rows_imported,
        rowsUpdated: edition.rows_updated,
        rowsSkipped: edition.rows_skipped,
        errorCount: edition.error_count,
        updatedAt: edition.updated_at,
      })),
    };
  });
