import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { todayIso } from "../lib/athrecs/format";
import type {
  AthleteListItem,
  ClubListItem,
  EntryStatus,
  EventListItem,
  RaceGroupInfo,
  Sport,
} from "../lib/athrecs/types";
import * as base from "../lib/athrecs/api";

// Keep every staff/import function available. Explicit RunRecs exports below
// replace only the public catalogue functions that require sport isolation.
export * from "../lib/athrecs/api";

const RUNRECS_SPORTS = new Set<string>(["Running", "Parkrun"]);

function isRunRecsSport(value: unknown): value is "Running" | "Parkrun" {
  return typeof value === "string" && RUNRECS_SPORTS.has(value);
}

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function parseRaceGroups(value: unknown): RaceGroupInfo[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as RaceGroupInfo[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as RaceGroupInfo[]) : [];
  } catch {
    return [];
  }
}

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

type RawEventRow = {
  id: number;
  slug: string;
  name: string;
  sport: Sport;
  country: string;
  county: string;
  city: string;
  area: string;
  surface: string;
  summary: string;
  organiser: string;
  website: string;
  distances_csv: string | null;
  groups_json: string | RaceGroupInfo[] | null;
  next_date: string | null;
  next_distance: string | null;
  next_status: string | null;
  next_start_time: string | null;
  upcoming_count: number;
  past_count: number;
  edition_count: number;
};

export const listEvents = createServerFn({ method: "GET" })
  .validator((input: ListEventsInput) => input ?? {})
  .handler(async ({ data }) => {
    if (data.sport && data.sport !== "All" && !isRunRecsSport(data.sport)) return [];

    const sql = await ready();
    const requestedSport = data.sport && data.sport !== "All" ? data.sport : null;
    const rawQ = data.q?.trim() ?? "";
    const q = rawQ ? `%${rawQ.toLowerCase()}%` : null;
    const today = todayIso();
    const upcomingOnly = data.upcomingOnly === true;
    const limit = Math.min(Math.max(data.limit ?? 40, 1), 80);
    const offset = Math.min(Math.max(Math.floor(data.offset ?? 0), 0), 10_000);
    const fetchLimit = Math.min(limit * 3, 160);
    const distance = data.distance?.trim() || null;
    const surface = data.surface?.trim() || null;
    const country = data.country?.trim() && data.country !== "All" ? data.country.trim() : null;
    const county = data.county?.trim() ? `%${data.county.trim().toLowerCase()}%` : null;
    const city = data.city?.trim() ? `%${data.city.trim().toLowerCase()}%` : null;
    const postcode = data.postcode?.trim() || null;
    const format = data.format?.trim() || null;
    const group = data.group?.trim() || null;
    const { monthToRange } = await import("../lib/athrecs/filters");
    const monthRange = data.month ? monthToRange(data.month) : null;
    const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
    const dateTo = data.dateTo?.trim() || monthRange?.to || null;

    const rows = await sql<RawEventRow>`
      select
        e.id, e.slug, e.name, e.sport, e.country, e.county, e.city, e.area,
        e.surface, e.summary, e.organiser, e.website,
        (
          select string_agg(d.distance_code, ',' order by d.distance_code)
          from event_distances d where d.event_id = e.id
        ) as distances_csv,
        (
          select coalesce(
            json_agg(json_build_object(
              'code', g.group_code,
              'label', g.label,
              'level', g.level,
              'source_url', g.source_url,
              'checked_at', g.checked_at::text,
              'note', g.note
            ) order by g.group_code)::text,
            '[]'
          )
          from event_groups g where g.event_id = e.id
        ) as groups_json,
        (
          select ed.event_date::text from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
          order by ed.event_date asc limit 1
        ) as next_date,
        (
          select ed.distance_code from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
          order by ed.event_date asc limit 1
        ) as next_distance,
        (
          select ed.status from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
          order by ed.event_date asc limit 1
        ) as next_status,
        (
          select ed.start_time from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
          order by ed.event_date asc limit 1
        ) as next_start_time,
        (
          select count(*)::int from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
        ) as upcoming_count,
        (
          select count(*)::int from editions ed
          where ed.event_id = e.id and ed.event_date < ${today}::date
        ) as past_count,
        (select count(*)::int from editions ed where ed.event_id = e.id) as edition_count
      from events e
      where e.sport in ('Running', 'Parkrun')
        and (${requestedSport}::text is null or e.sport = ${requestedSport})
        and (
          ${q}::text is null
          or lower(e.name) like ${q}
          or lower(e.city) like ${q}
          or lower(e.sport) like ${q}
          or lower(e.county) like ${q}
          or lower(e.country) like ${q}
          or lower(e.surface) like ${q}
          or exists (
            select 1 from event_distances d
            where d.event_id = e.id and lower(d.distance_code) like ${q}
          )
        )
        and (${surface}::text is null or e.surface = ${surface})
        and (
          ${group}::text is null
          or exists (
            select 1 from event_groups g
            where g.event_id = e.id and g.group_code = ${group}
          )
        )
        and (${country}::text is null or e.country = ${country} or e.county = ${country})
        and (${county}::text is null or lower(e.county) like ${county} or lower(e.city) like ${county})
        and (${city}::text is null or lower(e.city) like ${city} or lower(e.area) like ${city} or lower(e.county) like ${city})
        and (
          ${postcode}::text is null
          or lower(e.area) like ${"%" + (postcode ?? "").toLowerCase() + "%"}
          or lower(e.city) like ${"%" + (postcode ?? "").toLowerCase() + "%"}
        )
        and (
          ${distance}::text is null
          or exists (
            select 1 from event_distances d
            where d.event_id = e.id and d.distance_code = ${distance}
          )
        )
        and (
          (${dateFrom}::date is null and ${dateTo}::date is null)
          or e.sport = 'Parkrun'
          or exists (
            select 1 from editions ed
            where ed.event_id = e.id
              and (${dateFrom}::date is null or ed.event_date >= ${dateFrom}::date)
              and (${dateTo}::date is null or ed.event_date <= ${dateTo}::date)
          )
        )
        and (
          ${upcomingOnly}::boolean is false
          or e.sport = 'Parkrun'
          or exists (
            select 1 from editions ed
            where ed.event_id = e.id and ed.event_date >= ${today}::date
          )
        )
      order by
        case when (
          select min(ed.event_date) from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
        ) is null then 1 else 0 end,
        (
          select min(ed.event_date) from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
        ) asc nulls last,
        e.name asc
      limit ${fetchLimit}
      offset ${offset}
    `;

    const { collapseSameNameDate } = await import("../lib/athrecs/dedupe");
    const {
      matchesDistanceFilter,
      matchesFormatFilter,
      nameHasFullMarathon,
      sanitizeDistances,
      searchLooksLikeMarathon,
    } = await import("../lib/athrecs/filters");
    const { matchesPostcodeQuery } = await import("../lib/athrecs/venue");
    const { countryMatchesFilter, resolveCountry } = await import("../lib/athrecs/countries");
    const { nextParkrunDate, remainingParkrunCount, parkrunDates, parkrunStartTime } =
      await import("../lib/athrecs/parkrun-dates");

    const mapped: EventListItem[] = rows
      .map((rawRow): EventListItem | null => {
        const { groups_json, distances_csv, ...row } = rawRow;
        const distances = sanitizeDistances(
          row.name,
          distances_csv ? distances_csv.split(",") : [],
        );
        if (row.sport === "Parkrun" && (dateFrom || dateTo)) {
          if (parkrunDates(row.name, dateFrom ?? today, dateTo ?? "2027-12-26").length === 0) {
            return null;
          }
        }
        const nextDate =
          row.sport === "Parkrun"
            ? nextParkrunDate(row.name, dateFrom && dateFrom > today ? dateFrom : today)
            : row.next_date;
        return {
          ...row,
          distances,
          groups: parseRaceGroups(groups_json),
          next_date: nextDate,
          upcoming_count:
            row.sport === "Parkrun" ? remainingParkrunCount(row.name, today) : row.upcoming_count,
          next_start_time:
            row.sport === "Parkrun"
              ? parkrunStartTime(row.country, /junior/i.test(row.name))
              : row.next_start_time,
          next_status: (row.next_status as EntryStatus) ?? (row.sport === "Parkrun" ? "Open" : null),
          next_distance:
            row.sport === "Parkrun"
              ? /junior/i.test(row.name)
                ? "2K"
                : "5K"
              : row.next_distance === "Marathon" && !distances.includes("Marathon")
                ? (distances[0] ?? row.next_distance)
                : row.next_distance,
        } satisfies EventListItem;
      })
      .filter((row): row is EventListItem => row !== null);

    return collapseSameNameDate(mapped)
      .filter((row) => matchesDistanceFilter(row.name, row.distances, distance))
      .filter((row) => matchesFormatFilter(row.name, format))
      .filter((row) =>
        matchesPostcodeQuery(postcode, {
          slug: row.slug,
          area: row.area,
          city: row.city,
        }),
      )
      .filter((row) =>
        countryMatchesFilter(
          resolveCountry({
            slug: row.slug,
            name: row.name,
            country: row.country,
            county: row.county,
            city: row.city,
            area: row.area,
          }),
          country,
        ),
      )
      .filter((row) => !searchLooksLikeMarathon(rawQ) || nameHasFullMarathon(row.name))
      .slice(0, limit);
  });

export const getEventBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const result = await base.getEventBySlug({ data });
    if (!result || !isRunRecsSport(result.event.sport)) return null;
    return {
      ...result,
      related: result.related.filter((event) => isRunRecsSport(event.sport)),
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
        and event.sport in ('Running', 'Parkrun')
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
        a.id, a.slug, a.display_name, a.gender, a.city, a.county, a.country,
        a.profile_type, a.profile_roles,
        c.name as club,
        c.slug as club_slug,
        (
          select count(*)::int
          from results result
          join editions edition on edition.id = result.edition_id
          join events event on event.id = edition.event_id
          where result.athlete_id = a.id
            and event.sport in ('Running', 'Parkrun')
            and (
              a.profile_type = 'Public figure'
              or a.profile_visibility = 'public'
              or result.result_visibility in ('public', 'public_figure')
            )
        ) as result_count
      from athletes a
      left join clubs c on c.id = a.club_id
      where (a.profile_type = 'Public figure' or a.profile_visibility = 'public')
        and exists (
          select 1
          from results result
          join editions edition on edition.id = result.edition_id
          join events event on event.id = edition.event_id
          where result.athlete_id = a.id
            and event.sport in ('Running', 'Parkrun')
            and (
              a.profile_type = 'Public figure'
              or a.profile_visibility = 'public'
              or result.result_visibility in ('public', 'public_figure')
            )
        )
        and (
          ${q}::text is null
          or lower(a.display_name) like ${q}
          or lower(coalesce(c.name, '')) like ${q}
          or lower(coalesce(a.city, '')) like ${q}
          or lower(coalesce(a.profile_type, '')) like ${q}
          or lower(coalesce(a.profile_roles, '')) like ${q}
        )
      order by a.display_name
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
        and event.sport in ('Running', 'Parkrun')
    `;
    const allowed = new Set(allowedRows.map((row) => row.id));
    const results = result.results.filter((row) => allowed.has(row.id));
    if (!results.length) return null;
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
        and event.sport in ('Running', 'Parkrun')
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
        c.id, c.slug, c.name, c.city, c.county, c.country,
        c.sports as sports_csv,
        c.website, c.official_source, c.summary,
        (
          select count(distinct athlete.id)::int
          from athletes athlete
          where athlete.club_id = c.id
            and (athlete.profile_type = 'Public figure' or athlete.profile_visibility = 'public')
            and exists (
              select 1
              from results result
              join editions edition on edition.id = result.edition_id
              join events event on event.id = edition.event_id
              where result.athlete_id = athlete.id
                and event.sport in ('Running', 'Parkrun')
            )
        ) as member_count
      from clubs c
      where (
          lower(coalesce(c.sports, '')) like '%running%'
          or lower(coalesce(c.sports, '')) like '%parkrun%'
          or lower(coalesce(c.sports, '')) like '%athletics%'
          or exists (
            select 1
            from athletes athlete
            join results result on result.athlete_id = athlete.id
            join editions edition on edition.id = result.edition_id
            join events event on event.id = edition.event_id
            where athlete.club_id = c.id
              and event.sport in ('Running', 'Parkrun')
          )
        )
        and (
          ${q}::text is null
          or lower(c.name) like ${q}
          or lower(c.city) like ${q}
          or lower(c.sports) like ${q}
        )
      order by c.name
    `;
    return rows.map((row) => ({
      ...row,
      sports: row.sports_csv ? row.sports_csv.split(",").filter(Boolean) : [],
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
        and event.sport in ('Running', 'Parkrun')
    `;
    const allowed = new Set(allowedRows.map((row) => row.id));
    const members = result.members.filter((member) => allowed.has(member.id));
    const sports = result.club.sports.map((sport) => sport.toLowerCase());
    if (!members.length && !sports.some((sport) => /running|parkrun|athletics/.test(sport))) {
      return null;
    }
    return { ...result, members };
  });

export const getHomeStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const today = todayIso();
  const events = await sql<{ n: number }>`
    select count(*)::int as n from events where sport in ('Running', 'Parkrun')
  `;
  const clubs = await sql<{ n: number }>`
    select count(*)::int as n
    from clubs club
    where lower(coalesce(club.sports, '')) like '%running%'
       or lower(coalesce(club.sports, '')) like '%parkrun%'
       or lower(coalesce(club.sports, '')) like '%athletics%'
       or exists (
         select 1
         from athletes athlete
         join results result on result.athlete_id = athlete.id
         join editions edition on edition.id = result.edition_id
         join events event on event.id = edition.event_id
         where athlete.club_id = club.id
           and event.sport in ('Running', 'Parkrun')
       )
  `;
  const athletes = await sql<{ n: number }>`
    select count(distinct result.athlete_id)::int as n
    from results result
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    where event.sport in ('Running', 'Parkrun')
  `;
  const upcoming = await sql<{ n: number }>`
    select count(*)::int as n
    from editions edition
    join events event on event.id = edition.event_id
    where edition.event_date >= ${today}::date
      and event.sport in ('Running', 'Parkrun')
  `;
  const bySport = await sql<{ sport: string; n: number; upcoming: number }>`
    select
      event.sport,
      count(*)::int as n,
      count(*) filter (
        where event.sport = 'Parkrun'
           or exists (
             select 1
             from editions edition
             where edition.event_id = event.id
               and edition.event_date >= ${today}::date
           )
      )::int as upcoming
    from events event
    where event.sport in ('Running', 'Parkrun')
    group by event.sport
    order by event.sport
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
  return updates.filter((update) => isRunRecsSport(update.sport));
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

export const listCalendarEditions = createServerFn({ method: "GET" })
  .validator((input: CalendarInput) => input ?? {})
  .handler(async ({ data }) => {
    if (data.sport && data.sport !== "All" && !isRunRecsSport(data.sport)) return [];
    const limit = Math.min(Math.max(data.limit ?? 24, 1), 80);
    const sports: Array<"Running" | "Parkrun"> = isRunRecsSport(data.sport)
      ? [data.sport]
      : ["Running", "Parkrun"];
    const sets = await Promise.all(
      sports.map((sport) =>
        base.listCalendarEditions({
          data: {
            ...data,
            sport,
            limit: 80,
          },
        }),
      ),
    );
    const seen = new Set<string>();
    return sets
      .flat()
      .filter((row) => {
        const key = `${row.event_slug}|${row.event_date}|${row.distance_code}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(
        (left, right) =>
          left.event_date.localeCompare(right.event_date) ||
          left.event_name.localeCompare(right.event_name),
      )
      .slice(0, limit);
  });
