import { createHash, randomUUID } from "node:crypto";
import { getSql, type Sql } from "../db.ts";
import { snapshot, type CandidateRow } from "./service.server.ts";
import { normalizedName } from "./matching.ts";
import { duplicateCompatibility, type DuplicateReview, type Keeper } from "./duplicate-review.ts";
import type { Edition, Identity } from "./core.ts";

function previewToken(row: CandidateRow, keeper: Keeper) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        candidate: row.candidate,
        status: row.status,
        reason: row.reason,
        event_slug: row.event_slug,
        event_id: row.event_id,
        dismissed_at: row.dismissed_at ?? null,
        keeper: {
          event: {
            id: keeper.event.id,
            slug: keeper.event.slug,
            name: keeper.event.name,
            city: keeper.event.city,
            country: keeper.event.country,
            website: keeper.event.website,
          },
          edition: keeper.edition,
        },
      }),
    )
    .digest("hex");
}
async function finding(sql: Sql, id: string) {
  const rows = await sql<
    CandidateRow & { run_id: string }
  >`select * from race_collector_candidates where id=${id}::uuid`;
  if (!rows.length) throw new Error("Finding not found.");
  if (rows[0].status === "staged" || rows[0].batch_id)
    throw new Error(
      "This finding is already in a publication batch. Resolve it in Publication review.",
    );
  return rows[0];
}
export async function duplicateOptions(id: string, search = "", sqlOverride?: Sql) {
  if (typeof search !== "string" || search.length > 200) throw new Error("Invalid event search.");
  const sql = sqlOverride ?? (await getSql());
  const row = await finding(sql, id);
  const snap = await snapshot(sql, [row.candidate.date]);
  const query = normalizedName(search.trim());
  const matching = snap.match(row.candidate);
  const rank = new Map(matching.map((m, i) => [m.event.id, i]));
  const events = snap.events.filter((e) =>
    query
      ? normalizedName(`${e.name} ${e.slug} ${(e.aliases ?? []).join(" ")}`).includes(query)
      : rank.has(e.id),
  );
  const byId = new Map(events.map((e) => [e.id, e]));
  const options = snap.editions
    .filter((d) => d.id && d.date === row.candidate.date && byId.has(d.eventId))
    .map((edition) => ({
      event: byId.get(edition.eventId)!,
      edition: edition as Edition & { id: number },
    }))
    .sort(
      (a, b) =>
        (rank.get(a.event.id) ?? 99999) - (rank.get(b.event.id) ?? 99999) ||
        Math.abs(a.edition.distanceKm - row.candidate.distanceKm) -
          Math.abs(b.edition.distanceKm - row.candidate.distanceKm) ||
        a.edition.id - b.edition.id,
    );
  return {
    total: options.length,
    options: options.slice(0, 40).map((keeper) => ({
      ...keeper,
      ...duplicateCompatibility(row.candidate, keeper),
      token: previewToken(row, keeper),
    })),
  };
}
export type ConfirmDuplicateInput = {
  id: string;
  eventId: number;
  editionId: number;
  token: string;
  sameRaceConfirmed: boolean;
  differencesAccepted: boolean;
  note: string;
};
export async function confirmDuplicate(
  input: ConfirmDuplicateInput,
  email: string,
  sqlOverride?: Sql,
) {
  if (
    input.sameRaceConfirmed !== true ||
    !Number.isSafeInteger(input.eventId) ||
    input.eventId <= 0 ||
    !Number.isSafeInteger(input.editionId) ||
    input.editionId <= 0 ||
    !/^[a-f0-9]{64}$/.test(input.token) ||
    typeof input.note !== "string" ||
    input.note.length > 1000
  )
    throw new Error("Compare the two fixtures and confirm which one to keep.");
  const sql = sqlOverride ?? (await getSql());
  return sql.transaction(async (tx) => {
    const initial = await finding(tx, input.id);
    await tx`select id from race_collector_runs where id=${initial.run_id}::uuid for update`;
    await tx`select id from race_collector_candidates where id=${input.id}::uuid for update`;
    const row = await finding(tx, input.id);
    const active =
      await tx<DuplicateReview>`select * from race_collector_duplicate_reviews where candidate_id=${input.id}::uuid and undone_at is null`;
    if (active.length)
      throw new Error(
        "This finding already has a keeper. Undo the duplicate decision before choosing again.",
      );
    const events =
      await tx<Identity>`select id,slug,name,country,city,website from events where id=${input.eventId} and sport='Running' for share`;
    const editions = await tx<
      Edition & { id: number }
    >`select id,event_id as "eventId",event_date::text as date,distance_code as distance,distance_km as "distanceKm",source_url as source,entry_url as "entryUrl" from editions where id=${input.editionId} and event_id=${input.eventId} for share`;
    if (!events.length || !editions.length)
      throw new Error("The kept fixture has changed. Search again.");
    const keeper = { event: events[0], edition: editions[0] };
    if (previewToken(row, keeper) !== input.token)
      throw new Error(
        "The finding or kept fixture changed since the comparison. Close this comparison and open it again.",
      );
    const compatibility = duplicateCompatibility(row.candidate, keeper);
    if (compatibility.blocker) throw new Error(compatibility.blocker);
    if (compatibility.differences.length && input.differencesAccepted !== true)
      throw new Error("Confirm the displayed distance and location differences first.");
    const id = randomUUID();
    const note = input.note.trim() || "Reviewer confirmed these are the same fixture.";
    const before = {
      candidate: row.candidate,
      status: row.status,
      reason: row.reason,
      event_slug: row.event_slug,
      event_id: row.event_id,
      dismissed_at: row.dismissed_at ?? null,
      dismissed_by: row.dismissed_by ?? null,
    };
    await tx`insert into race_collector_duplicate_reviews(id,candidate_id,kept_event_id,kept_edition_id,before_state,kept_snapshot,reason,reviewed_by) values(${id}::uuid,${row.id}::uuid,${keeper.event.id},${keeper.edition.id},${JSON.stringify(before)}::jsonb,${JSON.stringify(keeper)}::jsonb,${note},${email})`;
    const reason = `Manually confirmed duplicate: kept ${keeper.event.name} · ${keeper.edition.date} · ${keeper.edition.distance}. ${note}`;
    await tx`update race_collector_candidates set status='duplicate',reason=${reason},event_id=${keeper.event.id},event_slug=${keeper.event.slug},dismissed_at=now(),dismissed_by=${email} where id=${row.id}::uuid`;
    return { id, keptName: keeper.event.name, keptDistance: keeper.edition.distance };
  });
}
export async function undoDuplicate(id: string, email: string, sqlOverride?: Sql) {
  const sql = sqlOverride ?? (await getSql());
  return sql.transaction(async (tx) => {
    const initial = await finding(tx, id);
    await tx`select id from race_collector_runs where id=${initial.run_id}::uuid for update`;
    await tx`select id from race_collector_candidates where id=${id}::uuid for update`;
    await finding(tx, id);
    const rows =
      await tx<DuplicateReview>`select * from race_collector_duplicate_reviews where candidate_id=${id}::uuid and undone_at is null for update`;
    if (!rows.length) throw new Error("No active duplicate decision to undo.");
    const r = rows[0],
      before = r.before_state;
    await tx`update race_collector_candidates set status=${before.status},reason=${before.reason},event_slug=${before.event_slug},event_id=${before.event_id},dismissed_at=${before.dismissed_at}::timestamptz,dismissed_by=${before.dismissed_by} where id=${id}::uuid`;
    await tx`update race_collector_duplicate_reviews set undone_at=now(),undone_by=${email} where id=${r.id}::uuid`;
    return { restored: true };
  });
}
