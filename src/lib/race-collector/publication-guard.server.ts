import type { Sql } from "../db";
import type { ImportBundle } from "../athrecs/import.server";
import { snapshot } from "./service.server";
import { reconcile, type Candidate } from "./core";
import { sharesProgramme } from "./matching";
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
  const otherPending = snap.pending.filter((p) => p.batchId !== batchId);
  for (const row of rows) {
    const c = row.candidate;
    if (
      rows.some(
        (other) => other.event_slug !== row.event_slug && sharesProgramme(c, other.candidate),
      )
    )
      throw new Error("Collector programme has conflicting event identities in this batch.");
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
    const current = reconcile(c, snap.events, snap.editions, otherPending, snap.match(c));
    if (
      current.status !== "review" ||
      current.eventSlug !== row.event_slug ||
      current.eventId !== row.event_id ||
      snap.redirects.some((a) => a.old_slug === row.event_slug)
    )
      throw new Error("Collector canonical identity or equivalent distance changed since review.");
  }
}
