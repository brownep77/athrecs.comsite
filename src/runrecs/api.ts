import { queryRunningEvents, queryRunningRegions, type EventRegionInput, type ListEventsInput } from "../lib/running/catalogue.server";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../lib/athrecs/seed.server";
import { todayIso } from "../lib/athrecs/format";
import type {
  AthleteListItem,
  ClubListItem,
} from "../lib/athrecs/types";
import * as base from "../lib/athrecs/api";
import { supplementedStart } from "../data/runrecs-race-guides";

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

export const listEventRegions = createServerFn({ method: "GET" })
  .validator((input: EventRegionInput) => input ?? {})
  .handler(async ({ data }) => queryRunningRegions(data));

export const listEvents = createServerFn({ method: "GET" })
  .validator((input: ListEventsInput) => input ?? {})
  .handler(async ({ data }) => queryRunningEvents(data));

export const getEventBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const result = await base.getEventBySlug({ data });
    if (!result || !isRunRecsSport(result.event.sport)) return null;
    return {
      ...result,
      upcoming: result.upcoming.map((edition) => ({
        ...edition,
        start_time: supplementedStart(
          result.event,
          edition.event_date,
          edition.distance_code,
          edition.start_time,
        ),
      })),
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
      .map((row) => ({
        ...row,
        start_time: supplementedStart(
          { slug: row.event_slug },
          row.event_date,
          row.distance_code,
          row.start_time,
        ),
      }))
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
