import type { Sql } from "@/lib/db";
import { slugify } from "./verification";
import { asArray, asObject, json, resolveSport, text, type ApprovedItem, type SubmissionRecord } from "./application-common.server";
import { upsertEventChildren } from "./application-event-structure.server";
import { upsertVenue } from "./application-event-venue.server";

export async function applyEventCreate(
  sql: Sql,
  submission: SubmissionRecord,
  item: ApprovedItem,
  reviewerUserId: string,
): Promise<string> {
  if (item.target_id) return item.target_id;
  const event = asObject(item.normalized_data, "normalised event");
  const name = text(event.name);
  const eventSlug = text(event.slug) ?? (name ? slugify(name) : null);
  const primarySportSlug = text(event.primarySportSlug);
  if (!name || !eventSlug || !primarySportSlug) {
    throw new Error("Approved event is missing name, slug or primary sport");
  }
  const duplicate = await sql<{ id: number; metadata: Record<string, unknown> }>`
    select id, metadata from events where slug = ${eventSlug} limit 1
  `;
  if (duplicate[0]) {
    if (duplicate[0].metadata?.sourceSubmissionId === submission.id) {
      return String(duplicate[0].id);
    }
    throw new Error(`Event slug ${eventSlug} already exists`);
  }
  const sport = await resolveSport(sql, primarySportSlug);
  const venueId = await upsertVenue(sql, event.venue, eventSlug, reviewerUserId);
  const organisationNameRows = submission.organisation_id
    ? await sql<{ name: string }>`
        select name from organisations where id = ${submission.organisation_id} limit 1
      `
    : [];
  const organiserName =
    text(event.organiserDisplayName) ?? organisationNameRows[0]?.name ?? "";
  const eventMetadata = {
    ...(event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
      ? (event.metadata as Record<string, unknown>)
      : {}),
    sourceSubmissionId: submission.id,
  };
  const inserted = await sql<{ id: number }>`
    insert into events (
      slug, name, sport, country, county, city, area, surface, summary,
      description, organiser, website, featured, event_type, lifecycle_status,
      visibility, primary_sport_id, primary_organisation_id, venue_id,
      timezone, participant_type, verification_status, data_quality_score,
      last_verified_at, verified_by_user_id, published_at, metadata, updated_at
    ) values (
      ${eventSlug}, ${name}, ${sport.name}, ${text(event.country) ?? ""},
      ${text(event.county) ?? text(event.region) ?? ""}, ${text(event.city) ?? ""},
      ${text(event.area) ?? ""}, ${text(event.surface) ?? ""},
      ${text(event.summary) ?? ""}, ${text(event.description) ?? ""},
      ${organiserName}, ${text(event.website) ?? ""}, false,
      ${text(event.eventType) ?? "event"}, 'active', 'public', ${sport.id},
      ${submission.organisation_id}, ${venueId},
      ${text(event.timezone) ?? "Europe/London"},
      ${text(event.participantType) ?? "individual"}, 'athrecs_verified', 100,
      now(), ${reviewerUserId}, now(), ${json(eventMetadata)}::jsonb, now()
    ) returning id
  `;
  const eventId = inserted[0]?.id;
  if (!eventId) throw new Error("Event could not be created");

  const sportSlugs = new Set(
    [primarySportSlug, ...asArray(event.sportSlugs).map(text).filter(Boolean)] as string[],
  );
  for (const sportSlug of sportSlugs) {
    const eventSport = await resolveSport(sql, sportSlug);
    await sql`
      insert into event_sports (event_id, sport_id, relationship)
      values (
        ${eventId}, ${eventSport.id},
        ${eventSport.id === sport.id ? "primary" : "secondary"}
      )
      on conflict do nothing
    `;
  }
  if (submission.organisation_id) {
    await sql`
      insert into event_organisations (
        event_id, organisation_id, relationship, status, can_edit_event,
        can_manage_entries, can_upload_results, verified_at, verified_by_user_id
      ) values (
        ${eventId}, ${submission.organisation_id}, 'organiser', 'active',
        true, true, true, now(), ${reviewerUserId}
      )
      on conflict (event_id, organisation_id, relationship) do update set
        status = 'active', can_edit_event = true, can_manage_entries = true,
        can_upload_results = true, verified_at = now(),
        verified_by_user_id = excluded.verified_by_user_id, updated_at = now()
    `;
  }
  await upsertEventChildren(sql, {
    eventId,
    eventSlug,
    organisationId: submission.organisation_id,
    eventVenueId: venueId,
    editions: asArray(event.editions),
    reviewerUserId,
  });
  return String(eventId);
}
