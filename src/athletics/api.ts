import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { todayIso } from "../lib/athrecs/format";
import type {
  AthleteListItem,
  ClubListItem,
  SpectatorAccessType,
  Sport,
} from "../lib/athrecs/types";
import * as base from "../lib/athrecs/api";

// Keep staff, import and shared-network functions available. The explicit
// exports below replace only public catalogue functions that require the
// ATHRECS Athletics-only boundary.
export * from "../lib/athrecs/api";

const ATHLETICS_SPORT = "Athletics" as const;

function isAthleticsSport(value: unknown): value is typeof ATHLETICS_SPORT {
  return value === ATHLETICS_SPORT;
}

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

type EventRegionInput =
  | {
      sport?: Sport | "All";
      country?: string;
    }
  | undefined;

export const listEventRegions = createServerFn({ method: "GET" })
  .validator((input: EventRegionInput) => input ?? {})
  .handler(async ({ data }) => {
    if (data.sport && data.sport !== "All" && !isAthleticsSport(data.sport)) return [];
    return base.listEventRegions({ data: { ...data, sport: ATHLETICS_SPORT } });
  });

type ListEventsInput =
  | {
      sport?: Sport | "All";
      q?: string;
      upcomingOnly?: boolean;
      limit?: number;
      distance?: string;
      surface?: string;
      country?: string;
      county?: string;
      city?: string;
      postcode?: string;
      month?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: string;
      group?: string;
      offset?: number;
    }
  | undefined;

export const listEvents = createServerFn({ method: "GET" })
  .validator((input: ListEventsInput) => input ?? {})
  .handler(async ({ data }) => {
    if (data.sport && data.sport !== "All" && !isAthleticsSport(data.sport)) return [];
    return base.listEvents({
      data: {
        ...data,
        sport: ATHLETICS_SPORT,
      },
    });
  });

export const getEventBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const result = await base.getEventBySlug({ data });
    if (!result || !isAthleticsSport(result.event.sport)) return null;
    return {
      ...result,
      related: result.related.filter((event) => isAthleticsSport(event.sport)),
    };
  });

export const getEditionResults = createServerFn({ method: "GET" })
  .validator((editionId: number) => editionId)
  .handler(async ({ data }) => {
    const sql = await ready();
    const allowed = await sql<{ ok: number }>`
      select 1 as ok
      from editions edition
      join events event on event.id = edition.event_id
      where edition.id = ${data}
        and event.sport = 'Athletics'
      limit 1
    `;
    if (!allowed.length) return [];
    return base.getEditionResults({ data });
  });

export const listAthletes = createServerFn({ method: "GET" })
  .validator((input: { q?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await ready();
    const q = data.q?.trim() ? `%${data.q.trim().toLowerCase()}%` : null;
    return sql<AthleteListItem>`
      select
        athlete.id,
        athlete.slug,
        athlete.display_name,
        athlete.gender,
        athlete.city,
        athlete.county,
        athlete.country,
        athlete.profile_type,
        athlete.profile_roles,
        club.name as club,
        club.slug as club_slug,
        (
          select count(*)::int
          from results result
          join editions edition on edition.id = result.edition_id
          join events event on event.id = edition.event_id
          where result.athlete_id = athlete.id
            and event.sport = 'Athletics'
            and (
              athlete.profile_type = 'Public figure'
              or athlete.profile_visibility = 'public'
              or result.result_visibility in ('public', 'public_figure')
            )
        ) as result_count
      from athletes athlete
      left join clubs club on club.id = athlete.club_id
      where (athlete.profile_type = 'Public figure' or athlete.profile_visibility = 'public')
        and (
          lower(coalesce(athlete.profile_roles, '')) like '%professional athlete%'
          or exists (
            select 1
            from results result
            join editions edition on edition.id = result.edition_id
            join events event on event.id = edition.event_id
            where result.athlete_id = athlete.id
              and event.sport = 'Athletics'
              and (
                athlete.profile_type = 'Public figure'
                or athlete.profile_visibility = 'public'
                or result.result_visibility in ('public', 'public_figure')
              )
          )
        )
        and (
          ${q}::text is null
          or lower(athlete.display_name) like ${q}
          or lower(coalesce(club.name, '')) like ${q}
          or lower(coalesce(athlete.city, '')) like ${q}
          or lower(coalesce(athlete.profile_type, '')) like ${q}
          or lower(coalesce(athlete.profile_roles, '')) like ${q}
        )
      order by athlete.display_name
    `;
  });

export const getAthleteBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const result = await base.getAthleteBySlug({ data });
    if (!result) return null;

    const sql = await ready();
    const allowedRows = await sql<{ id: number }>`
      select result.id
      from results result
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where result.athlete_id = ${result.athlete.id}
        and event.sport = 'Athletics'
    `;
    const allowed = new Set(allowedRows.map((row) => row.id));
    const results = result.results.filter((row) => allowed.has(row.id));
    const isProfessional = result.athlete.profile_roles
      .toLowerCase()
      .split(",")
      .some((role) => role.trim() === "professional athlete");
    if (!results.length && !isProfessional) return null;
    return { ...result, results };
  });

export const getPrivateAthleteBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const stub = await base.getPrivateAthleteBySlug({ data });
    if (!stub) return null;

    const sql = await ready();
    const allowed = await sql<{ ok: number }>`
      select 1 as ok
      from athletes athlete
      join results result on result.athlete_id = athlete.id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where athlete.slug = ${data}
        and event.sport = 'Athletics'
      limit 1
    `;
    return allowed.length ? stub : null;
  });

export const listClubs = createServerFn({ method: "GET" })
  .validator((input: { q?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await ready();
    const q = data.q?.trim() ? `%${data.q.trim().toLowerCase()}%` : null;
    const rows = await sql<ClubListItem & { sports_csv: string }>`
      select
        club.id,
        club.slug,
        club.name,
        club.city,
        club.county,
        club.country,
        club.sports as sports_csv,
        club.website,
        club.official_source,
        club.summary,
        (
          select count(distinct athlete.id)::int
          from athletes athlete
          where athlete.club_id = club.id
            and (athlete.profile_type = 'Public figure' or athlete.profile_visibility = 'public')
            and exists (
              select 1
              from results result
              join editions edition on edition.id = result.edition_id
              join events event on event.id = edition.event_id
              where result.athlete_id = athlete.id
                and event.sport = 'Athletics'
            )
        ) as member_count
      from clubs club
      where (
          lower(coalesce(club.sports, '')) like '%athletics%'
          or exists (
            select 1
            from athletes athlete
            join results result on result.athlete_id = athlete.id
            join editions edition on edition.id = result.edition_id
            join events event on event.id = edition.event_id
            where athlete.club_id = club.id
              and event.sport = 'Athletics'
          )
        )
        and (
          ${q}::text is null
          or lower(club.name) like ${q}
          or lower(club.city) like ${q}
          or lower(club.sports) like ${q}
        )
      order by club.name
    `;

    return rows.map((row) => ({
      ...row,
      sports: [ATHLETICS_SPORT],
    }));
  });

export const getClubBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const result = await base.getClubBySlug({ data });
    if (!result) return null;

    const sql = await ready();
    const clubId = (result.club as { id: number }).id;
    const allowedRows = await sql<{ id: number }>`
      select distinct athlete.id
      from athletes athlete
      join results result on result.athlete_id = athlete.id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where athlete.club_id = ${clubId}
        and event.sport = 'Athletics'
    `;
    const allowed = new Set(allowedRows.map((row) => row.id));
    const members = result.members.filter((member) => allowed.has(member.id));
    const isAthleticsClub = result.club.sports.some((sport) =>
      sport.toLowerCase().includes("athletics"),
    );
    if (!members.length && !isAthleticsClub) return null;

    return {
      ...result,
      club: {
        ...result.club,
        sports: [ATHLETICS_SPORT],
      },
      members,
    };
  });

export const getHomeStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const today = todayIso();

  const events = await sql<{ n: number }>`
    select count(*)::int as n from events where sport = 'Athletics'
  `;
  const clubs = await sql<{ n: number }>`
    select count(*)::int as n
    from clubs club
    where lower(coalesce(club.sports, '')) like '%athletics%'
       or exists (
         select 1
         from athletes athlete
         join results result on result.athlete_id = athlete.id
         join editions edition on edition.id = result.edition_id
         join events event on event.id = edition.event_id
         where athlete.club_id = club.id
           and event.sport = 'Athletics'
       )
  `;
  const athletes = await sql<{ n: number }>`
    select count(distinct result.athlete_id)::int as n
    from results result
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    where event.sport = 'Athletics'
  `;
  const upcoming = await sql<{ n: number }>`
    select count(*)::int as n
    from editions edition
    join events event on event.id = edition.event_id
    where edition.event_date >= ${today}::date
      and event.sport = 'Athletics'
  `;
  const bySport = await sql<{ sport: string; n: number; upcoming: number }>`
    select
      event.sport,
      count(*)::int as n,
      count(*) filter (
        where exists (
          select 1
          from editions edition
          where edition.event_id = event.id
            and edition.event_date >= ${today}::date
        )
      )::int as upcoming
    from events event
    where event.sport = 'Athletics'
    group by event.sport
  `;

  return {
    events: events[0]?.n ?? 0,
    clubs: clubs[0]?.n ?? 0,
    athletes: athletes[0]?.n ?? 0,
    upcoming: upcoming[0]?.n ?? 0,
    bySport,
  };
});

export const getHomeSportUpdates = createServerFn({ method: "GET" }).handler(async () => {
  const updates = await base.getHomeSportUpdates();
  return updates.filter((update) => isAthleticsSport(update.sport));
});

type CalendarInput =
  | {
      q?: string;
      region?: string;
      upcomingOnly?: boolean;
      limit?: number;
      distance?: string;
      surface?: string;
      sport?: string;
      country?: string;
      county?: string;
      city?: string;
      postcode?: string;
      month?: string;
      dateFrom?: string;
      dateTo?: string;
      format?: string;
      group?: string;
    }
  | undefined;

export type AthleticsCalendarItem = {
  id: number;
  event_date: string;
  status: string;
  start_time: string | null;
  event_slug: string;
  event_name: string;
  sport: string;
  city: string;
  county: string;
  country: string;
  area: string;
  distance_code: string;
  surface: string;
  featured: boolean;
  competition_label: string | null;
  spectator_access_type: SpectatorAccessType | null;
  spectator_ticket_url: string | null;
};

export type AthleticsCalendarPage = {
  items: AthleticsCalendarItem[];
  total: number;
  limit: number;
  offset: number;
};

type AthleticsCalendarPageInput = Exclude<CalendarInput, undefined> & {
  offset?: number;
};

function athleticsCompetitionLabel(input: {
  name: string;
  summary: string;
  description: string;
}): string | null {
  const text = `${input.name} ${input.summary} ${input.description}`;
  if (/diamond league/i.test(text)) return "Diamond League";
  const tour = text.match(
    /World Athletics (Continental|Indoor) Tour\s*[–-]\s*(Gold|Silver|Bronze|Challenger)/i,
  );
  if (tour) return `${tour[1]} Tour · ${tour[2]}`;
  if (/world athletics indoor championships/i.test(text)) return "World Indoor Championships";
  if (/world athletics championships/i.test(text)) return "World Championships";
  if (/olympic games/i.test(text)) return "Olympic Games";
  if (/area (?:u\d+ |senior )?championship/i.test(text)) return "Continental championship";
  if (/national (?:u\d+ |senior )?(?:indoor |outdoor )?championship/i.test(text)) {
    return "National championship";
  }
  return null;
}

/**
 * The shared calendar endpoint intentionally returns a small homepage-sized
 * slice. The Athletics calendar needs an exact total and stable pagination so
 * every global, national and local meeting remains reachable.
 */
async function queryAthleticsCalendarPage(
  data: AthleticsCalendarPageInput = {},
): Promise<AthleticsCalendarPage> {
  const sql = await ready();
  const rawQ = data.q?.trim() ?? "";
  const q = rawQ ? `%${rawQ.toLowerCase()}%` : null;
  const region = data.region?.trim() || null;
  const today = todayIso();
  const upcomingOnly = data.upcomingOnly !== false;
  const limit = Math.min(Math.max(data.limit ?? 40, 1), 100);
  const offset = Math.min(Math.max(data.offset ?? 0, 0), 100_000);
  const requestedDistance =
    data.distance?.trim() && data.distance !== "All" ? data.distance.trim() : null;
  const trackAndFieldOnly = requestedDistance === "Track & field";
  const distance = trackAndFieldOnly ? null : requestedDistance;
  const surface = data.surface?.trim() && data.surface !== "All" ? data.surface.trim() : null;
  const country = data.country?.trim() && data.country !== "All" ? data.country.trim() : null;
  const county = data.county?.trim() ? `%${data.county.trim().toLowerCase()}%` : null;
  const city = data.city?.trim() ? `%${data.city.trim().toLowerCase()}%` : null;
  const postcode = data.postcode?.trim() ? `%${data.postcode.trim().toLowerCase()}%` : null;
  const { monthToRange } = await import("../lib/athrecs/filters");
  const monthRange = data.month ? monthToRange(data.month) : null;
  const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
  const dateTo = data.dateTo?.trim() || monthRange?.to || null;

  const rows = await sql<
    Omit<AthleticsCalendarItem, "competition_label"> & {
      summary: string;
      description: string;
      total_count: number;
    }
  >`
      with competition_days as (
        select
          min(edition.id)::int as id,
          edition.event_date,
          (array_agg(edition.status order by edition.id))[1] as status,
          (array_agg(edition.start_time order by edition.id)
            filter (where edition.start_time is not null))[1] as start_time,
          event.slug as event_slug,
          event.name as event_name,
          event.sport,
          event.city,
          event.county,
          event.country,
          event.area,
          string_agg(distinct edition.distance_code, ' · ') as distance_code,
          event.surface,
          event.featured,
          event.summary,
          event.description,
          (
            array_agg(spectator.access_type order by spectator.checked_at desc)
              filter (where spectator.is_verified)
          )[1] as spectator_access_type,
          (
            array_agg(spectator.ticket_url order by spectator.checked_at desc)
              filter (where spectator.is_verified and spectator.ticket_url is not null)
          )[1] as spectator_ticket_url
        from editions edition
        join events event on event.id = edition.event_id
        left join edition_spectator_access spectator on spectator.edition_id = edition.id
        where event.sport = 'Athletics'
          and (${trackAndFieldOnly}::boolean is false or event.surface = 'Track')
          and (${upcomingOnly}::boolean is false or edition.event_date >= ${today}::date)
          and (${dateFrom}::date is null or edition.event_date >= ${dateFrom}::date)
          and (${dateTo}::date is null or edition.event_date <= ${dateTo}::date)
          and (${surface}::text is null or event.surface = ${surface})
          and (${country}::text is null or event.country = ${country} or event.county = ${country})
          and (${region}::text is null or event.country = ${region} or event.county = ${region})
          and (
            ${county}::text is null
            or lower(event.county) like ${county}
            or lower(event.city) like ${county}
            or lower(event.area) like ${county}
          )
          and (
            ${city}::text is null
            or lower(event.city) like ${city}
            or lower(event.area) like ${city}
          )
          and (
            ${postcode}::text is null
            or lower(event.area) like ${postcode}
            or lower(event.city) like ${postcode}
          )
          and (
            ${q}::text is null
            or lower(event.name) like ${q}
            or lower(event.city) like ${q}
            or lower(event.county) like ${q}
            or lower(event.country) like ${q}
            or lower(event.area) like ${q}
            or lower(event.surface) like ${q}
            or lower(event.summary) like ${q}
            or lower(event.description) like ${q}
          )
          and (
            ${distance}::text is null
            or exists (
              select 1
              from editions matching_edition
              where matching_edition.event_id = event.id
                and matching_edition.event_date = edition.event_date
                and matching_edition.distance_code = ${distance}
            )
          )
        group by
          event.id,
          edition.event_date,
          event.slug,
          event.name,
          event.sport,
          event.city,
          event.county,
          event.country,
          event.area,
          event.surface,
          event.featured,
          event.summary,
          event.description
      )
      select competition_days.*, count(*) over()::int as total_count
      from competition_days
      order by event_date asc, event_name asc
      limit ${limit}
      offset ${offset}
    `;

  return {
    items: rows.map(({ total_count: _totalCount, summary, description, ...row }) => ({
      ...row,
      competition_label: athleticsCompetitionLabel({
        name: row.event_name,
        summary,
        description,
      }),
    })),
    total: rows[0]?.total_count ?? 0,
    limit,
    offset,
  } satisfies AthleticsCalendarPage;
}

export const listAthleticsCalendarPage = createServerFn({ method: "GET" })
  .validator((input: AthleticsCalendarPageInput | undefined) => input ?? {})
  .handler(({ data }) => queryAthleticsCalendarPage(data));

export const listCalendarEditions = createServerFn({ method: "GET" })
  .validator((input: CalendarInput) => input ?? {})
  .handler(async ({ data }) => {
    if (data.sport && data.sport !== "All" && !isAthleticsSport(data.sport)) return [];
    return base.listCalendarEditions({
      data: {
        ...data,
        sport: ATHLETICS_SPORT,
      },
    });
  });
