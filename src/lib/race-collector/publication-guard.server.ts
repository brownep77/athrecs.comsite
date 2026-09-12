import type { Sql } from "../db";
import type { ImportBundle } from "../athrecs/import.server";
import { snapshot } from "./service.server";
import { reconcile, type Candidate } from "./core";
/** Invoked again under the normal publisher's revision lock, not just at collection time. */
export async function assertCollectorPublication(sql: Sql, batchId: string, payload: ImportBundle) {
  const rows = await sql<{
    candidate: Candidate;
    event_slug: string;
    event_id: number | null;
  }>`select candidate,event_slug,event_id from race_collector_candidates where batch_id=${batchId}::uuid and status='staged' and reviewed_by is not null and reviewed_at is not null`;
  if (!rows.length || rows.length !== (payload.editions ?? []).length)
    throw new Error("Collector source review is missing or incomplete.");
  const snap = await snapshot(
    sql,
    rows.map((r) => r.candidate.date),
  );
  const otherPending = await sql<{
    eventSlug: string;
    date: string;
  }>`select x->>'eventSlug' as "eventSlug",x->>'date' date from catalogue_import_batches b cross join lateral jsonb_array_elements(coalesce(b.payload->'editions','[]'::jsonb)) x where b.id<>${batchId} and b.status not in ('published','rolled_back')`;
  for (const row of rows) {
    const c = row.candidate;
    const d = (payload.editions ?? []).find(
      (x) => x.eventSlug === row.event_slug && x.date === c.date && x.distance === c.distanceLabel,
    );
    if (
      !d ||
      d.distanceKm !== c.distanceKm ||
      d.source !== c.sourceUrl ||
      d.status !== c.entryStatus ||
      (d.entryUrl ?? "") !== c.entryUrl ||
      (d.startTime ?? "") !== c.startTime
    )
      throw new Error("Staged edition differs from the reviewed source.");
    const current = reconcile(c, snap.events, snap.editions, otherPending);
    if (
      current.status !== "review" ||
      current.eventSlug !== row.event_slug ||
      current.eventId !== row.event_id ||
      snap.redirects.some((a) => a.old_slug === row.event_slug)
    )
      throw new Error("Collector canonical identity or equivalent distance changed since review.");
  }
}
