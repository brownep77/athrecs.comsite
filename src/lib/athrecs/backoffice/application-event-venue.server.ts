import type { Sql } from "@/lib/db";
import { slugify } from "./verification";
import {
  asArray,
  asObject,
  booleanValue,
  json,
  numberValue,
  resolveDiscipline,
  resolveSport,
  text,
  type ApprovedItem,
  type SubmissionRecord,
} from "./application-common.server";

export async function upsertVenue(
  sql: Sql,
  raw: unknown,
  fallbackSlugPrefix: string,
  reviewerUserId: string,
): Promise<number | null> {
  if (!raw) return null;
  const venue = asObject(raw, "venue");
  const name = text(venue.name);
  if (!name) throw new Error("Venue name is required");
  const city = text(venue.city) ?? "";
  const postcode = text(venue.postcode) ?? "";
  const baseSlug = slugify(`${fallbackSlugPrefix}-${name}-${city}-${postcode}`);
  const slug = baseSlug || `${fallbackSlugPrefix}-venue`;
  const rows = await sql<{ id: number }>`
    insert into venues (
      slug, name, address_line_1, address_line_2, city, district,
      county_or_state, region, postcode, country, country_code,
      latitude, longitude, timezone, indoor, accessibility, transport,
      verification_status, updated_at
    ) values (
      ${slug}, ${name}, ${text(venue.addressLine1) ?? ""},
      ${text(venue.addressLine2) ?? ""}, ${city}, ${text(venue.district) ?? ""},
      ${text(venue.countyOrState) ?? ""}, ${text(venue.region) ?? ""},
      ${postcode}, ${text(venue.country) ?? ""}, ${text(venue.countryCode) ?? ""},
      ${numberValue(venue.latitude)}, ${numberValue(venue.longitude)},
      ${text(venue.timezone) ?? "Europe/London"}, ${booleanValue(venue.indoor)},
      ${json(venue.accessibility ?? {})}::jsonb,
      ${json(venue.transport ?? {})}::jsonb,
      'athrecs_verified', now()
    )
    on conflict (slug) do update set
      name = excluded.name,
      address_line_1 = excluded.address_line_1,
      address_line_2 = excluded.address_line_2,
      city = excluded.city,
      district = excluded.district,
      county_or_state = excluded.county_or_state,
      region = excluded.region,
      postcode = excluded.postcode,
      country = excluded.country,
      country_code = excluded.country_code,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      timezone = excluded.timezone,
      indoor = excluded.indoor,
      accessibility = excluded.accessibility,
      transport = excluded.transport,
      verification_status = 'athrecs_verified',
      updated_at = now()
    returning id
  `;
  const venueId = rows[0]?.id;
  if (!venueId) throw new Error("Venue could not be saved");
  await sql`
    insert into data_audit_log (
      actor_user_id, action, entity_type, entity_id, after_data, reason
    ) values (
      ${reviewerUserId}, 'venue.applied', 'venue', ${String(venueId)},
      ${json(venue)}::jsonb, 'Approved back-office submission'
    )
  `;
  return venueId;
}

export async function upsertCompetitionRounds(
  sql: Sql,
  competitionId: number,
  rawRounds: unknown[],
): Promise<number[]> {
  const pending = new Map<string, Record<string, unknown>>();
  for (const rawRound of rawRounds) {
    const round = asObject(rawRound, "competition round");
    const key = text(round.key);
    if (!key) throw new Error("Competition round is missing its stable key");
    if (pending.has(key)) throw new Error(`Duplicate competition round key: ${key}`);
    pending.set(key, round);
  }

  const resolved = new Map<string, number>();
  const roundIds: number[] = [];
  while (pending.size) {
    let progressed = false;
    for (const [key, round] of [...pending.entries()]) {
      const parentKey = text(round.parentKey);
      if (parentKey && !resolved.has(parentKey)) continue;
      const name = text(round.name);
      if (!name) throw new Error(`Competition round ${key} is missing its name`);
      const rows = await sql<{ id: number }>`
        insert into competition_rounds (
          competition_id, parent_round_id, source_key, name, round_type,
          sequence_no, starts_at, ends_at, status, metadata
        ) values (
          ${competitionId}, ${parentKey ? resolved.get(parentKey) ?? null : null},
          ${key}, ${name}, ${text(round.roundType) ?? "round"},
          ${numberValue(round.sequenceNo) ?? 1}, ${text(round.startsAt)},
          ${text(round.endsAt)}, ${text(round.status) ?? "scheduled"},
          ${json(round.metadata ?? {})}::jsonb
        )
        on conflict (competition_id, source_key) do update set
          parent_round_id = excluded.parent_round_id,
          name = excluded.name,
          round_type = excluded.round_type,
          sequence_no = excluded.sequence_no,
          starts_at = excluded.starts_at,
          ends_at = excluded.ends_at,
          status = excluded.status,
          metadata = excluded.metadata
        returning id
      `;
      const roundId = rows[0]?.id;
      if (!roundId) throw new Error(`Competition round ${key} could not be saved`);
      resolved.set(key, roundId);
      roundIds.push(roundId);
      pending.delete(key);
      progressed = true;
    }
    if (!progressed) {
      throw new Error(
        `Competition round hierarchy contains an unresolved parent or cycle: ${[
          ...pending.keys(),
        ].join(", ")}`,
      );
    }
  }
  return roundIds;
}
