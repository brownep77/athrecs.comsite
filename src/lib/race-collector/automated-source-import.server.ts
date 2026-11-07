// Daily automated fixture collection (owner decision, 7 November 2026).
//
// A scheduled GitHub Actions job runs the source importer across every enabled,
// owner-cleared source (robots.txt, crawl delay and page budgets enforced) and
// posts the resulting fixture CSV here in chunks. Each chunk goes through exactly
// the same checks as a staff upload: invalid and repeated rows are dropped, the
// rest are saved to the collector review queue with the duplicate check. When
// the owner's AUTO_PUBLISH_SOURCE_FIXTURES setting is on, ready rows are then
// published through the existing collector publish action, which stages,
// validates and publishes atomically. Anything that fails a check stays in the
// review queue for staff; nothing is forced through.
import { timingSafeEqual } from "node:crypto";
import { getSql, type Sql } from "../db";
import { COLLECTOR_COUNTRIES, type Scope } from "./core";
import { parseFixtureUpload } from "./fixture-upload";
import { importFixtureUpload, previewFixtureUpload } from "./fixture-upload.server";
import { actOnFindings } from "./bulk-actions.server";
import { REVIEW_BATCH_LIMIT } from "./review";

export const AUTOMATED_IMPORT_EMAIL = "automated-source-import@athrecs.com";
const MAX_ROWS_PER_CHUNK = 400;

export function authorizedSourceImport(request: Request): boolean {
  const expected = process.env.SOURCE_IMPORT_TOKEN?.trim();
  const actual = request.headers.get("authorization");
  if (!expected || expected.length < 32 || !actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

function csvLines(content: string): { header: string; rows: string[] } {
  // Rows from the importer never contain raw newlines inside fields, but keep
  // quoted newlines together anyway.
  const lines: string[] = [];
  let current = "";
  let quotes = 0;
  for (const line of content.replace(/\r\n?/g, "\n").split("\n")) {
    current = current ? `${current}\n${line}` : line;
    quotes += (line.match(/"/g) ?? []).length;
    if (quotes % 2 === 0) {
      if (current.trim()) lines.push(current);
      current = "";
      quotes = 0;
    }
  }
  const [header = "", ...rows] = lines;
  return { header, rows };
}

/** Save one chunk of collected fixtures to the review queue. */
export async function importCollectedChunk(
  input: { label: string; csv: string; dateFrom: string; dateTo: string },
  sqlOverride?: Sql,
) {
  const { header, rows } = csvLines(input.csv);
  if (!header || !rows.length) return { runId: null, counts: { rows: 0 }, dropped: 0 };
  if (rows.length > MAX_ROWS_PER_CHUNK)
    throw new Error(`Send at most ${MAX_ROWS_PER_CHUNK} rows per chunk.`);
  const label = input.label.slice(0, 160);
  const broad: Scope = {
    countries: COLLECTOR_COUNTRIES.map((c) => c.code),
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    min: 0,
    max: 804.672,
    unit: "km",
  };
  // Scope the import to the countries actually present in this chunk.
  const parsed = parseFixtureUpload({ content: input.csv, format: "csv", label, scope: broad });
  const countries = [...new Set(parsed.rows.map((r) => r.candidate.countryCode).filter(Boolean))];
  if (!countries.length)
    return { runId: null, counts: { rows: rows.length }, dropped: rows.length };
  const scope: Scope = { ...broad, countries };
  const sql = sqlOverride ?? (await getSql());
  const first = await previewFixtureUpload(
    { content: input.csv, format: "csv", label, scope },
    sql,
  );
  // Drop rows a staff upload would have to correct (invalid) or that repeat
  // another row in the same file; keep ready, duplicate and held rows so the
  // duplicate check and review queue record them.
  const keep = new Set(
    first.rows.filter((r) => r.status !== "invalid" && r.status !== "repeat").map((r) => r.row),
  );
  // CSV row numbers count the header as row 1.
  const kept = rows.filter((_, index) => keep.has(index + 2));
  const dropped = rows.length - kept.length;
  if (!kept.length) return { runId: null, counts: first.counts, dropped };
  const content = [header, ...kept].join("\n");
  const preview = await previewFixtureUpload({ content, format: "csv", label, scope }, sql);
  const saved = await importFixtureUpload(
    { content, format: "csv", label, scope, previewHash: preview.hash },
    AUTOMATED_IMPORT_EMAIL,
    sql,
  );
  return { runId: saved.id, counts: saved.counts, dropped, reused: saved.reused };
}

/**
 * Publish ready rows from one automated run, within a time budget. A batch that
 * fails a publication check is retried one row at a time so the passing rows
 * still publish; rows that fail on their own stay in the review queue.
 */
export function autoPublishEnabled(): boolean {
  return process.env.AUTO_PUBLISH_SOURCE_FIXTURES === "true";
}

export async function publishReadyFromRun(runId: string, budgetMs = 45_000, sqlOverride?: Sql) {
  // Publishing normally needs a person to confirm the organiser's programme
  // (owner rule, 26 October 2026). Automatic publication is a separate owner
  // decision, switched on only by AUTO_PUBLISH_SOURCE_FIXTURES=true; otherwise
  // collected fixtures wait in the review queue for one-click staff publishing.
  if (!autoPublishEnabled())
    return { published: 0, heldForReview: 0, remaining: 0, reasons: [], autoPublish: false };
  const started = Date.now();
  const sql = sqlOverride ?? (await getSql());
  let published = 0;
  let failed = 0;
  const failedIds = new Set<string>();
  const reasons = new Map<string, number>();
  const ready = async () =>
    (
      await sql<{ id: string }>`
        select id from race_collector_candidates
        where run_id=${runId}::uuid and status='review' and dismissed_at is null and batch_id is null
        order by id`
    )
      .map((r) => r.id)
      .filter((id) => !failedIds.has(id));
  const publish = (ids: string[]) =>
    actOnFindings(
      // With the owner's automatic-publication setting on, the organiser's own
      // structured listing (the page the importer read) stands as the source check.
      { runId, ids, action: "publish", confirmed: true, sourcesReviewed: true },
      AUTOMATED_IMPORT_EMAIL,
      sql,
    );
  let ids = await ready();
  while (ids.length && Date.now() - started < budgetMs) {
    const batch = ids.slice(0, REVIEW_BATCH_LIMIT);
    try {
      published += (await publish(batch)).published;
    } catch {
      for (const id of batch) {
        if (Date.now() - started >= budgetMs) break;
        try {
          published += (await publish([id])).published;
        } catch (error) {
          failed += 1;
          failedIds.add(id);
          const reason = (error instanceof Error ? error.message : String(error)).slice(0, 200);
          reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
        }
      }
    }
    ids = await ready();
  }
  return {
    published,
    heldForReview: failed,
    remaining: ids.length,
    reasons: [...reasons].map(([reason, count]) => ({ reason, count })),
    autoPublish: true,
  };
}
