import { canonicalEventSlug } from "@/data/entry-options";
import { getSql, type Sql } from "@/lib/db";
import { getBulkSourceJobManifest } from "./source-registry.server";
import {
  canonicalResultUrl,
  decideResultLinkSource,
  parseResultLinksCsv,
  type ParsedResultLinkRow,
  type ResultLinkPreviewStatus,
  type ResultLinkPolicySource,
} from "./results-links-import";

export type ResultLinkPreviewRow = {
  rowNumber: number;
  eventSlug: string;
  eventName: string | null;
  date: string;
  distance: string;
  providerName: string;
  resultsUrl: string;
  sourceName: string | null;
  editionId: number | null;
  status: ResultLinkPreviewStatus;
  reason: string;
};

export type ResultLinkPreview = {
  rows: ResultLinkPreviewRow[];
  counts: {
    total: number;
    ready: number;
    duplicate: number;
    held: number;
    unmatched: number;
    ambiguous: number;
    invalid: number;
  };
};

type EditionIndexRow = {
  id: number;
  event_slug: string;
  event_name: string;
  event_date: string;
  distance_code: string;
  results_official_url: string | null;
};

type StoredLinkRow = {
  edition_id: number;
  canonical_url: string;
  results_url: string;
};

type ReadyRow = ParsedResultLinkRow & {
  editionId: number;
  sourceId: string | null;
};

function editionKey(eventSlug: string, date: string, distance: string): string {
  return `${canonicalEventSlug(eventSlug.trim().toLowerCase())}\u0000${date}\u0000${distance
    .trim()
    .toLowerCase()}`;
}

function previewCounts(rows: ResultLinkPreviewRow[]): ResultLinkPreview["counts"] {
  return {
    total: rows.length,
    ready: rows.filter((row) => row.status === "ready").length,
    duplicate: rows.filter((row) => row.status === "duplicate").length,
    held: rows.filter((row) => row.status === "held").length,
    unmatched: rows.filter((row) => row.status === "unmatched").length,
    ambiguous: rows.filter((row) => row.status === "ambiguous").length,
    invalid: rows.filter((row) => row.status === "invalid").length,
  };
}

async function buildPreview(csv: string, sql: Sql) {
  const parsed = parseResultLinksCsv(csv);
  const requestedSlugs = [
    ...new Set(
      parsed.map((row) => canonicalEventSlug(row.eventSlug.trim().toLowerCase())).filter(Boolean),
    ),
  ];
  const placeholders = requestedSlugs.map((_, index) => `$${index + 1}`).join(", ");
  const [editions, storedLinks] = requestedSlugs.length
    ? await Promise.all([
        sql.query<EditionIndexRow>(
          `
      select
        ed.id,
        e.slug as event_slug,
        e.name as event_name,
        ed.event_date::text as event_date,
        ed.distance_code,
        ed.results_official_url
      from editions ed
      join events e on e.id = ed.event_id
      where e.slug in (${placeholders})
    `,
          requestedSlugs,
        ),
        sql.query<StoredLinkRow>(
          `
      select edition_id, canonical_url, results_url
      from edition_result_links link
      join editions ed on ed.id = link.edition_id
      join events e on e.id = ed.event_id
      where link.status = 'approved'
        and e.slug in (${placeholders})
    `,
          requestedSlugs,
        ),
      ])
    : [[], []];
  const byEditionKey = new Map<string, EditionIndexRow[]>();
  for (const edition of editions) {
    const key = editionKey(edition.event_slug, edition.event_date, edition.distance_code);
    byEditionKey.set(key, [...(byEditionKey.get(key) ?? []), edition]);
  }
  const stored = new Set<string>();
  for (const link of storedLinks) {
    stored.add(`${link.edition_id}\u0000${canonicalResultUrl(link.results_url)}`);
    stored.add(`${link.edition_id}\u0000${link.canonical_url}`);
  }
  for (const edition of editions) {
    if (!edition.results_official_url) continue;
    try {
      stored.add(`${edition.id}\u0000${canonicalResultUrl(edition.results_official_url)}`);
    } catch {
      // A legacy non-HTTPS link remains visible but does not block a corrected HTTPS import.
    }
  }

  const sources = getBulkSourceJobManifest() as ResultLinkPolicySource[];
  const seenUpload = new Map<string, number>();
  const readyRows: ReadyRow[] = [];
  const rows: ResultLinkPreviewRow[] = parsed.map((row) => {
    const base = {
      rowNumber: row.rowNumber,
      eventSlug: canonicalEventSlug(row.eventSlug.trim().toLowerCase()),
      eventName: null,
      date: row.date,
      distance: row.distance,
      providerName: row.providerName,
      resultsUrl: row.resultsUrl,
      sourceName: null,
      editionId: null,
    };
    if (row.issues.length) {
      return { ...base, status: "invalid" as const, reason: row.issues.join("; ") };
    }
    const matches = byEditionKey.get(editionKey(row.eventSlug, row.date, row.distance)) ?? [];
    if (matches.length === 0) {
      return {
        ...base,
        status: "unmatched" as const,
        reason: "No exact edition matches this event slug, date and distance",
      };
    }
    if (matches.length > 1) {
      return {
        ...base,
        status: "ambiguous" as const,
        reason: "More than one edition matches this exact key",
      };
    }
    const edition = matches[0];
    const matched = { ...base, eventName: edition.event_name, editionId: edition.id };
    const decision = decideResultLinkSource(row, sources);
    if (!decision.allowed) {
      return {
        ...matched,
        sourceName: decision.sourceName,
        status: "held" as const,
        reason: decision.reason || "Source held for review",
      };
    }
    const duplicateKey = `${edition.id}\u0000${row.canonicalUrl}`;
    if (stored.has(duplicateKey)) {
      return {
        ...matched,
        sourceName: decision.sourceName,
        status: "duplicate" as const,
        reason: "This edition already has the same results URL",
      };
    }
    const firstRow = seenUpload.get(duplicateKey);
    if (firstRow) {
      return {
        ...matched,
        sourceName: decision.sourceName,
        status: "duplicate" as const,
        reason: `Duplicate of CSV row ${firstRow}`,
      };
    }
    seenUpload.set(duplicateKey, row.rowNumber);
    readyRows.push({ ...row, editionId: edition.id, sourceId: decision.sourceId });
    return {
      ...matched,
      sourceName: decision.sourceName,
      status: "ready" as const,
      reason: "Exact edition match; verified source; ready to publish",
    };
  });

  return { preview: { rows, counts: previewCounts(rows) }, readyRows };
}

export async function previewResultLinksCsv(csv: string): Promise<ResultLinkPreview> {
  const sql = await getSql();
  return (await buildPreview(csv, sql)).preview;
}

export async function publishResultLinksCsv(csv: string) {
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const { preview, readyRows } = await buildPreview(csv, tx);
    let inserted = 0;
    for (const row of readyRows) {
      const insertedRows = await tx<{ id: number }>`
        insert into edition_result_links (
          edition_id,
          provider_code,
          provider_name,
          results_url,
          canonical_url,
          source_url,
          registry_source_id,
          is_verified,
          status,
          checked_at
        ) values (
          ${row.editionId},
          ${row.providerCode},
          ${row.providerName},
          ${row.resultsUrl},
          ${row.canonicalUrl},
          ${row.sourceUrl},
          ${row.sourceId},
          true,
          'approved',
          ${row.checkedAt || new Date().toISOString()}::timestamptz
        )
        on conflict (edition_id, canonical_url) do nothing
        returning id
      `;
      inserted += insertedRows.length;
    }
    return {
      inserted,
      skipped: preview.counts.total - inserted,
      preview,
    };
  });
}
