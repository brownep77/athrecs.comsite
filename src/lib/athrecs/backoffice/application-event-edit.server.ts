import type { Sql } from "@/lib/db";
import { asArray, asObject, json, numberValue, resolveSport, text, type ApprovedItem, type SubmissionRecord } from "./application-common.server";
import { upsertEventChildren } from "./application-event-structure.server";
import { upsertVenue } from "./application-event-venue.server";

async function updateEventFields(
  sql: Sql,
  eventId: number,
  patch: Record<string, unknown>,
  reviewerUserId: string,
): Promise<void> {
  const fieldMap: Record<string, string> = {
    name: "name",
    slug: "slug",
    eventType: "event_type",
    country: "country",
    county: "county",
    city: "city",
    area: "area",
    surface: "surface",
    participantType: "participant_type",
    summary: "summary",
    description: "description",
    organiserDisplayName: "organiser",
    website: "website",
    timezone: "timezone",
    metadata: "metadata",
  };
  const values: unknown[] = [];
  const assignments: string[] = [];
  for (const [inputKey, column] of Object.entries(fieldMap)) {
    if (!(inputKey in patch)) continue;
    const value = inputKey === "metadata" ? json(patch[inputKey]) : patch[inputKey] ?? null;
    values.push(value);
    assignments.push(
      inputKey === "metadata"
        ? `${column} = ${column} || $${values.length}::jsonb`
        : `${column} = $${values.length}`,
    );
  }
  if (patch.region != null && patch.county == null) {
    values.push(patch.region);
    assignments.push(`county = $${values.length}`);
  }
  if (patch.primarySportSlug != null) {
    const sport = await resolveSport(sql, String(patch.primarySportSlug));
    values.push(sport.id);
    assignments.push(`primary_sport_id = $${values.length}`);
    values.push(sport.name);
    assignments.push(`sport = $${values.length}`);
  }
  values.push(reviewerUserId);
  assignments.push(`verification_status = 'athrecs_verified'`);
  assignments.push(`data_quality_score = 100`);
  assignments.push(`last_verified_at = now()`);
  assignments.push(`verified_by_user_id = $${values.length}`);
  assignments.push(`published_at = coalesce(published_at, now())`);
  assignments.push(`updated_at = now()`);
  values.push(eventId);
  await sql.query(
    `update events set ${assignments.join(", ")} where id = $${values.length}`,
    values,
  );
}

export async function applyEventEdit(
  sql: Sql,
  submission: SubmissionRecord,
  item: ApprovedItem,
  reviewerUserId: string,
): Promise<string> {
  const wrapper = asObject(item.normalized_data, "normalised event edit");
  const eventId = numberValue(wrapper.eventId) ?? submission.event_id;
  if (!eventId) throw new Error("Event edit is missing eventId");
  const patch = asObject(wrapper.patch, "event patch");
  const eventRows = await sql<{
    id: number;
    slug: string;
    venue_id: number | null;
    primary_sport_id: number | null;
    primary_sport_slug: string | null;
  }>`
    select e.id, e.slug, e.venue_id, e.primary_sport_id,
           s.slug as primary_sport_slug
    from events e
    left join sports s on s.id = e.primary_sport_id
    where e.id = ${eventId}
    limit 1
  `;
  const current = eventRows[0];
  if (!current) throw new Error("Event to edit no longer exists");

  const effectiveEventSlug = text(patch.slug) ?? current.slug;
  let venueId = current.venue_id;
  if (patch.venue) {
    venueId = await upsertVenue(sql, patch.venue, effectiveEventSlug, reviewerUserId);
    patch.venueId = venueId;
  }
  await updateEventFields(sql, eventId, patch, reviewerUserId);
  if (patch.venue) {
    await sql`update events set venue_id = ${venueId}, updated_at = now() where id = ${eventId}`;
  }
  if (patch.sportSlugs || patch.primarySportSlug) {
    const primary = patch.primarySportSlug
      ? await resolveSport(sql, String(patch.primarySportSlug))
      : current.primary_sport_id && current.primary_sport_slug
        ? {
            id: current.primary_sport_id,
            slug: current.primary_sport_slug,
            name: "",
          }
        : null;
    if (patch.sportSlugs) {
      await sql`delete from event_sports where event_id = ${eventId}`;
    } else if (primary) {
      // A primary-sport-only edit must not leave the previous primary relation
      // behind. Remove any old primary and any duplicate relation for the new
      // primary before inserting the canonical row below.
      await sql`
        delete from event_sports
        where event_id = ${eventId}
          and (relationship = 'primary' or sport_id = ${primary.id})
      `;
    }
    const requested = new Set<string>();
    if (primary) requested.add(primary.slug);
    for (const value of asArray(patch.sportSlugs)) {
      const slug = text(value);
      if (slug) requested.add(slug);
    }
    for (const rawSport of requested) {
      const sport = await resolveSport(sql, rawSport);
      await sql`
        insert into event_sports (event_id, sport_id, relationship)
        values (${eventId}, ${sport.id}, ${primary?.id === sport.id ? "primary" : "secondary"})
        on conflict do nothing
      `;
    }
  }
  if (patch.editions) {
    await upsertEventChildren(sql, {
      eventId,
      eventSlug: effectiveEventSlug,
      organisationId: submission.organisation_id,
      eventVenueId: venueId,
      editions: asArray(patch.editions),
      reviewerUserId,
    });
  }
  return String(eventId);
}
