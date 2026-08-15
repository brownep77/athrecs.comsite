import { createServerFn } from "@tanstack/react-start";
import { getSql, type SqlRow } from "@/lib/db";

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const searchAllSportEvents = createServerFn({ method: "GET" })
  .validator(
    (input:
      | {
          q?: string;
          sportCode?: string;
          disciplineCode?: string;
          surfaceCode?: string;
          countryCode?: string;
          nation?: string;
          region?: string;
          county?: string;
          city?: string;
          participantKind?: string;
          dateFrom?: string;
          dateTo?: string;
          distanceMin?: number;
          distanceMax?: number;
          distanceUnit?: string;
          distanceMinMetres?: number;
          distanceMaxMetres?: number;
          limit?: number;
          offset?: number;
        }
      | undefined) => input ?? {},
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = clean(data.q) ? `%${clean(data.q)!.toLowerCase()}%` : null;
    const sportCode = clean(data.sportCode);
    const disciplineCode = clean(data.disciplineCode);
    const surfaceCode = clean(data.surfaceCode);
    const countryCode = clean(data.countryCode)?.toUpperCase() ?? null;
    const nation = clean(data.nation);
    const region = clean(data.region);
    const county = clean(data.county);
    const city = clean(data.city);
    const participantKind = clean(data.participantKind);
    const dateFrom = clean(data.dateFrom);
    const dateTo = clean(data.dateTo);
    const distanceMin = Number.isFinite(Number(data.distanceMin))
      ? Number(data.distanceMin)
      : null;
    const distanceMax = Number.isFinite(Number(data.distanceMax))
      ? Number(data.distanceMax)
      : null;
    const distanceUnit = clean(data.distanceUnit)?.toLowerCase() ?? null;
    const distanceMinMetres = Number.isFinite(Number(data.distanceMinMetres))
      ? Number(data.distanceMinMetres)
      : null;
    const distanceMaxMetres = Number.isFinite(Number(data.distanceMaxMetres))
      ? Number(data.distanceMaxMetres)
      : null;
    const limit = Math.max(1, Math.min(Number(data.limit) || 100, 500));
    const offset = Math.max(0, Number(data.offset) || 0);

    return sql`
      select *
      from public_event_catalogue_v catalogue
      where (
        ${q}::text is null
        or lower(catalogue.event_name) like ${q}
        or lower(catalogue.competition_name) like ${q}
        or lower(coalesce(catalogue.city, '')) like ${q}
        or lower(coalesce(catalogue.county, '')) like ${q}
        or lower(coalesce(catalogue.organiser, '')) like ${q}
      )
        and (${sportCode}::text is null or catalogue.sport_code = ${sportCode})
        and (${disciplineCode}::text is null or catalogue.discipline_code = ${disciplineCode})
        and (${surfaceCode}::text is null or catalogue.surface_code = ${surfaceCode})
        and (${countryCode}::text is null or catalogue.country_code = ${countryCode})
        and (${nation}::text is null or lower(coalesce(catalogue.nation, '')) = lower(${nation}))
        and (${region}::text is null or lower(coalesce(catalogue.region, '')) = lower(${region}))
        and (${county}::text is null or lower(coalesce(catalogue.county, '')) = lower(${county}))
        and (${city}::text is null or lower(coalesce(catalogue.city, '')) = lower(${city}))
        and (${participantKind}::text is null or catalogue.participant_kind = ${participantKind})
        and (${dateFrom}::text is null or catalogue.start_at >= ${dateFrom}::timestamptz)
        and (${dateTo}::text is null or catalogue.start_at < (${dateTo}::date + interval '1 day'))
        and (${distanceUnit}::text is null or lower(coalesce(catalogue.distance_unit, '')) = ${distanceUnit})
        and (${distanceMin}::numeric is null or catalogue.distance_value >= ${distanceMin})
        and (${distanceMax}::numeric is null or catalogue.distance_value <= ${distanceMax})
        and (${distanceMinMetres}::numeric is null or catalogue.distance_metres >= ${distanceMinMetres})
        and (${distanceMaxMetres}::numeric is null or catalogue.distance_metres <= ${distanceMaxMetres})
      order by
        case when catalogue.start_at >= now() then 0 else 1 end,
        case when catalogue.start_at >= now() then catalogue.start_at end asc nulls last,
        case when catalogue.start_at < now() then catalogue.start_at end desc nulls last,
        catalogue.event_name,
        catalogue.competition_name
      limit ${limit} offset ${offset}
    `;
  });

export const getAllSportEvent = createServerFn({ method: "GET" })
  .validator((slug: string) => slug.trim())
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    const events = await sql`
      select
        e.id, e.slug, e.name, e.event_type, e.summary, e.description,
        e.organiser, e.website, e.country, e.county, e.city, e.area,
        e.governing_body, e.permit_number, e.rules_url,
        e.verification_status, e.verified_at,
        s.code as sport_code, s.name as sport_name,
        o.id as owner_organisation_id, o.name as owner_organisation_name,
        o.verification_status as organiser_verification_status
      from events e
      left join sports s on s.id = e.sport_id
      left join organisations o on o.id = e.owner_organisation_id
      where e.slug = ${slug}
        and coalesce(e.visibility, 'public') = 'public'
        and e.verification_status in ('verified', 'legacy_imported')
      limit 1
    `;
    if (!events[0]) return null;
    const competitions = await sql`
      select * from public_event_catalogue_v
      where event_id = ${events[0].id}
      order by start_at desc, competition_name
    `;
    return { event: events[0], competitions };
  });

export const getAllSportCompetitionResults = createServerFn({ method: "GET" })
  .validator((input: { competitionId: number; limit?: number; offset?: number }) => {
    const competitionId = Number(input.competitionId);
    if (!Number.isInteger(competitionId) || competitionId <= 0) {
      throw new Error("A valid competitionId is required");
    }
    return {
      competitionId,
      limit: Math.max(1, Math.min(Number(input.limit) || 250, 2_000)),
      offset: Math.max(0, Number(input.offset) || 0),
    };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const competitions = await sql`
      select c.*, o.start_at, e.name as event_name, e.slug as event_slug,
             s.code as sport_code, s.name as sport_name,
             d.name as discipline_name, sf.name as surface_name
      from event_competitions c
      join event_occurrences o on o.id = c.occurrence_id
      join events e on e.id = o.event_id
      join sports s on s.id = c.sport_id
      left join disciplines d on d.id = c.discipline_id
      left join surfaces sf on sf.id = c.surface_id
      where c.id = ${data.competitionId}
        and c.verification_status = 'verified'
        and o.verification_status = 'verified'
        and e.verification_status in ('verified', 'legacy_imported')
        and o.visibility = 'public'
        and e.visibility = 'public'
      limit 1
    `;
    if (!competitions[0]) return null;
    const results = await sql`
      select
        cr.id, cr.result_status, cr.rank_overall, cr.rank_category,
        cr.rank_gender, cr.performance_value, cr.performance_unit,
        cr.performance_display, cr.points, cr.score_for, cr.score_against,
        cr.outcome, cr.record_flags, cr.source_url, cr.verification_status,
        ce.id as entry_id, ce.participant_kind, ce.display_name, ce.bib,
        ce.lane, ce.category_code, ce.category_name, ce.country_code,
        a.id as athlete_id, a.slug as athlete_slug,
        a.display_name as athlete_name, t.id as team_id, t.slug as team_slug,
        t.name as team_name, club.name as club_name,
        (
          select json_agg(json_build_object(
            'code', m.metric_code,
            'name', m.metric_name,
            'valueNumeric', m.value_numeric,
            'valueText', m.value_text,
            'unit', m.unit,
            'sequenceNo', m.sequence_no,
            'isPrimary', m.is_primary,
            'rank', m.rank_for_metric
          ) order by m.sequence_no, m.id)
          from result_metrics m where m.result_id = cr.id
        ) as metrics,
        (
          select json_agg(json_build_object(
            'type', sg.segment_type,
            'code', sg.segment_code,
            'name', sg.segment_name,
            'sequenceNo', sg.sequence_no,
            'valueNumeric', sg.value_numeric,
            'valueText', sg.value_text,
            'unit', sg.unit,
            'rank', sg.rank_for_segment,
            'status', sg.status
          ) order by sg.sequence_no, sg.id)
          from result_segments sg where sg.result_id = cr.id
        ) as segments
      from competition_results cr
      join competition_entries ce on ce.id = cr.entry_id
      join event_competitions sort_competition on sort_competition.id = cr.competition_id
      left join athletes a on a.id = ce.athlete_id
      left join teams t on t.id = ce.team_id
      left join clubs club on club.id = ce.club_id
      where cr.competition_id = ${data.competitionId}
        and cr.record_status = 'active'
        and cr.published_at is not null
        and cr.verification_status in ('verified', 'source_matched', 'athlete_confirmed')
      order by
        cr.rank_overall nulls last,
        case
          when sort_competition.result_model = 'time' then cr.performance_value
        end asc nulls last,
        case
          when sort_competition.result_model in ('distance', 'height', 'points', 'score')
            then coalesce(cr.points, cr.performance_value, cr.score_for)
        end desc nulls last,
        coalesce(a.display_name, t.name, ce.display_name)
      limit ${data.limit} offset ${data.offset}
    `;
    return { competition: competitions[0], results };
  });

export const getAllSportAthleteProfile = createServerFn({ method: "GET" })
  .validator((slug: string) => slug.trim())
  .handler(async ({ data: slug }) => {
    const sql = await getSql();
    const athletes = await sql`
      select
        a.id, a.slug, a.display_name, a.gender, a.city, a.county, a.country,
        a.bio, a.avatar_url, a.nation, a.athrecs_id,
        c.name as club_name, c.slug as club_slug,
        coalesce(ps.profile_visibility, 'public') as profile_visibility,
        coalesce(ps.location_visibility, 'city') as location_visibility,
        coalesce(ps.equipment_visibility, 'private') as equipment_visibility,
        coalesce(ps.upcoming_events_visibility, 'private') as upcoming_events_visibility,
        coalesce(ps.show_verified_badges, true) as show_verified_badges
      from athletes a
      left join clubs c on c.id = a.club_id
      left join athlete_public_settings ps on ps.athlete_id = a.id
      where a.slug = ${slug}
        and coalesce(ps.profile_visibility, 'public') = 'public'
      limit 1
    `;
    const athlete = athletes[0] as SqlRow | undefined;
    if (!athlete) return null;

    // Apply visibility on the server so hidden location fields never reach the
    // browser payload. The legacy athlete table has city/county/country but no
    // separate region column, so "region" currently falls back to country-only.
    const publicAthlete = { ...athlete };
    const locationVisibility = String(athlete.location_visibility ?? "city");
    if (locationVisibility === "private") {
      publicAthlete.city = null;
      publicAthlete.county = null;
      publicAthlete.country = null;
    } else if (locationVisibility === "country" || locationVisibility === "region") {
      publicAthlete.city = null;
      publicAthlete.county = null;
    } else if (locationVisibility === "county") {
      publicAthlete.city = null;
    }

    const athleteId = Number(athlete.id);
    const sports = await sql`
      select s.code, s.name, d.code as discipline_code, d.name as discipline_name,
             asp.is_primary, asp.participation_level, asp.public_notes,
             sf.code as preferred_surface_code,
             asp.preferred_distance_value, asp.preferred_distance_unit
      from athlete_sports asp
      join sports s on s.id = asp.sport_id
      left join disciplines d on d.id = asp.discipline_id
      left join surfaces sf on sf.id = asp.preferred_surface_id
      where asp.athlete_id = ${athleteId} and asp.status = 'active'
      order by asp.is_primary desc, s.name, d.name
    `;
    const results = await sql`
      select * from athlete_result_feed_v
      where athlete_id = ${athleteId}
      order by event_start_at desc nulls last, result_key
      limit 1000
    `;
    const breakdown = await sql`
      select * from athlete_result_breakdown_v
      where athlete_id = ${athleteId}
      order by result_count desc, sport_name, discipline_name
    `;
    const equipment =
      athlete.equipment_visibility === "public"
        ? await sql`
            select ae.id, ae.category, coalesce(p.brand, ae.brand) as brand,
                   coalesce(p.name, ae.model) as product_name, ae.variant, ae.size,
                   ae.colour, ae.status, ae.usage_distance,
                   ae.usage_distance_unit, ae.usage_hours, ae.athlete_rating,
                   ae.disclosure, s.name as sport_name
            from athlete_equipment ae
            left join products p on p.id = ae.product_id
            left join sports s on s.id = ae.sport_id
            where ae.athlete_id = ${athleteId} and ae.visibility = 'public'
            order by case ae.status when 'active' then 0 else 1 end, ae.category
          `
        : [];
    return { athlete: publicAthlete, sports, results, breakdown, equipment };
  });
