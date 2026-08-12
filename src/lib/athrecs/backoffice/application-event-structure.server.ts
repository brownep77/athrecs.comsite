import type { Sql } from "@/lib/db";
import { slugify } from "./verification";
import {
  asArray,
  asObject,
  json,
  numberValue,
  resolveDiscipline,
  resolveSport,
  text,
} from "./application-common.server";
import { upsertCompetitionRounds, upsertVenue } from "./application-event-venue.server";

export async function upsertEventChildren(
  sql: Sql,
  input: {
    eventId: number;
    eventSlug: string;
    organisationId: number | null;
    eventVenueId: number | null;
    editions: unknown[];
    reviewerUserId: string;
  },
): Promise<{ editionIds: number[]; competitionIds: number[] }> {
  const editionIds: number[] = [];
  const competitionIds: number[] = [];

  for (const rawEdition of input.editions) {
    const edition = asObject(rawEdition, "edition");
    const date = text(edition.date);
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Edition date must be YYYY-MM-DD");
    }
    const distanceCode = text(edition.distanceCode) ?? "Event";
    const editionVenueId = edition.venue
      ? await upsertVenue(
          sql,
          edition.venue,
          `${input.eventSlug}-${date}`,
          input.reviewerUserId,
        )
      : input.eventVenueId;
    const rows = await sql<{ id: number }>`
      insert into editions (
        event_id, event_date, distance_code, distance_km, status,
        entry_url, source_url, venue_id, start_at, end_at, timezone,
        registration_open_at, registration_close_at, capacity,
        entry_fee_minor, currency, verification_status, last_verified_at,
        verified_by_user_id, published_at, metadata, updated_at
      ) values (
        ${input.eventId}, ${date}::date, ${distanceCode},
        ${numberValue(edition.distanceKm) ?? 0}, ${text(edition.status) ?? "TBC"},
        ${text(edition.entryUrl)}, ${text(edition.sourceUrl)}, ${editionVenueId},
        ${text(edition.startAt)}, ${text(edition.endAt)},
        ${text(edition.timezone) ?? "Europe/London"},
        ${text(edition.registrationOpenAt)}, ${text(edition.registrationCloseAt)},
        ${numberValue(edition.capacity)}, ${numberValue(edition.entryFeeMinor)},
        ${text(edition.currency) ?? "GBP"}, 'athrecs_verified', now(),
        ${input.reviewerUserId}, now(), ${json(edition.metadata ?? {})}::jsonb, now()
      )
      on conflict (event_id, event_date, distance_code) do update set
        distance_km = excluded.distance_km,
        status = excluded.status,
        entry_url = excluded.entry_url,
        source_url = excluded.source_url,
        venue_id = excluded.venue_id,
        start_at = excluded.start_at,
        end_at = excluded.end_at,
        timezone = excluded.timezone,
        registration_open_at = excluded.registration_open_at,
        registration_close_at = excluded.registration_close_at,
        capacity = excluded.capacity,
        entry_fee_minor = excluded.entry_fee_minor,
        currency = excluded.currency,
        verification_status = 'athrecs_verified',
        last_verified_at = now(),
        verified_by_user_id = excluded.verified_by_user_id,
        published_at = coalesce(editions.published_at, now()),
        metadata = excluded.metadata,
        updated_at = now()
      returning id
    `;
    const editionId = rows[0]?.id;
    if (!editionId) throw new Error("Edition could not be saved");
    editionIds.push(editionId);
    await sql`
      insert into event_distances (event_id, distance_code)
      values (${input.eventId}, ${distanceCode})
      on conflict do nothing
    `;

    for (const rawCompetition of asArray(edition.competitions)) {
      const competition = asObject(rawCompetition, "competition");
      const name = text(competition.name);
      const sportSlug = text(competition.sportSlug);
      if (!name || !sportSlug) throw new Error("Competition name and sport are required");
      const sport = await resolveSport(sql, sportSlug);
      const disciplineId = await resolveDiscipline(
        sql,
        sport.id,
        text(competition.disciplineSlug),
      );
      const competitionSlug = text(competition.slug) ?? slugify(name);
      const inserted = await sql<{ id: number }>`
        insert into event_competitions (
          edition_id, sport_id, discipline_id, slug, name, competition_type,
          format, participant_type, result_type, scoring_method,
          distance_value, distance_unit, distance_metres, measurement_unit,
          duration_seconds, surface, course_variant, age_categories,
          gender_categories, classification_rules, team_size_min,
          team_size_max, capacity, start_at, end_at, status, entry_url,
          entry_fee_minor, currency, rules_url, verification_status,
          last_verified_at, verified_by_user_id, metadata, updated_at
        ) values (
          ${editionId}, ${sport.id}, ${disciplineId}, ${competitionSlug}, ${name},
          ${text(competition.competitionType) ?? "competition"},
          ${text(competition.format) ?? ""},
          ${text(competition.participantType) ?? "individual"},
          ${text(competition.resultType) ?? "placing"},
          ${text(competition.scoringMethod) ?? ""},
          ${numberValue(competition.distanceValue)}, ${text(competition.distanceUnit)},
          ${numberValue(competition.distanceMetres)}, ${text(competition.measurementUnit)},
          ${numberValue(competition.durationSeconds)}, ${text(competition.surface) ?? ""},
          ${text(competition.courseVariant) ?? ""},
          ${json(competition.ageCategories ?? [])}::jsonb,
          ${json(competition.genderCategories ?? [])}::jsonb,
          ${json(competition.classificationRules ?? {})}::jsonb,
          ${numberValue(competition.teamSizeMin)}, ${numberValue(competition.teamSizeMax)},
          ${numberValue(competition.capacity)}, ${text(competition.startAt)},
          ${text(competition.endAt)}, ${text(competition.status) ?? "scheduled"},
          ${text(competition.entryUrl)}, ${numberValue(competition.entryFeeMinor)},
          ${text(competition.currency) ?? "GBP"}, ${text(competition.rulesUrl)},
          'athrecs_verified', now(), ${input.reviewerUserId},
          ${json(competition.metadata ?? {})}::jsonb, now()
        )
        on conflict (edition_id, slug) do update set
          sport_id = excluded.sport_id,
          discipline_id = excluded.discipline_id,
          name = excluded.name,
          competition_type = excluded.competition_type,
          format = excluded.format,
          participant_type = excluded.participant_type,
          result_type = excluded.result_type,
          scoring_method = excluded.scoring_method,
          distance_value = excluded.distance_value,
          distance_unit = excluded.distance_unit,
          distance_metres = excluded.distance_metres,
          measurement_unit = excluded.measurement_unit,
          duration_seconds = excluded.duration_seconds,
          surface = excluded.surface,
          course_variant = excluded.course_variant,
          age_categories = excluded.age_categories,
          gender_categories = excluded.gender_categories,
          classification_rules = excluded.classification_rules,
          team_size_min = excluded.team_size_min,
          team_size_max = excluded.team_size_max,
          capacity = excluded.capacity,
          start_at = excluded.start_at,
          end_at = excluded.end_at,
          status = excluded.status,
          entry_url = excluded.entry_url,
          entry_fee_minor = excluded.entry_fee_minor,
          currency = excluded.currency,
          rules_url = excluded.rules_url,
          verification_status = 'athrecs_verified',
          last_verified_at = now(),
          verified_by_user_id = excluded.verified_by_user_id,
          metadata = excluded.metadata,
          updated_at = now()
        returning id
      `;
      const competitionId = inserted[0]?.id;
      if (!competitionId) throw new Error("Competition could not be saved");
      competitionIds.push(competitionId);
      await upsertCompetitionRounds(
        sql,
        competitionId,
        asArray(competition.rounds),
      );
    }
  }

  return { editionIds, competitionIds };
}
