import { createServerFn } from "@tanstack/react-start";
import { getSql, dbSource } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import { todayIso } from "./format";
import type {
  AthleteListItem,
  ClubListItem,
  EntryStatus,
  EventListItem,
  Sport,
} from "./types";
import {
  applyImportBundle,
  applyResultsImport,
  parseEventsCsv,
  type ImportBundle,
  type ResultsImportBundle,
} from "./import.server";

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

export const listEvents = createServerFn({ method: "GET" })
  .validator(
    (
      input:
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
          }
        | undefined,
    ) => input ?? {},
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const sport = data.sport && data.sport !== "All" ? data.sport : null;
    const rawQ = data.q?.trim() ?? "";
    const q = rawQ ? `%${rawQ.toLowerCase()}%` : null;
    const today = todayIso();
    const upcomingOnly = data.upcomingOnly === true;
    const limit = Math.min(Math.max(data.limit ?? 40, 1), 80);
    const fetchLimit = Math.min(limit * 3, 160);
    const distance = data.distance?.trim() || null;
    const surface = data.surface?.trim() || null;
    const country = data.country?.trim() && data.country !== "All" ? data.country.trim() : null;
    const county = data.county?.trim() ? `%${data.county.trim().toLowerCase()}%` : null;
    const city = data.city?.trim() ? `%${data.city.trim().toLowerCase()}%` : null;
    const postcode = data.postcode?.trim() || null;
    const format = data.format?.trim() || null;
    const { monthToRange } = await import("@/lib/athrecs/filters");
    const monthRange = data.month ? monthToRange(data.month) : null;
    const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
    const dateTo = data.dateTo?.trim() || monthRange?.to || null;

    const rows = await sql<
      EventListItem & { distances_csv: string | null }
    >`
      select
        e.id, e.slug, e.name, e.sport, e.country, e.county, e.city, e.area,
        e.surface, e.summary, e.organiser, e.website,
        (
          select string_agg(d.distance_code, ',' order by d.distance_code)
          from event_distances d where d.event_id = e.id
        ) as distances_csv,
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
      where
        (${sport}::text is null or e.sport = ${sport})
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
          ${dateFrom}::date is null and ${dateTo}::date is null
          or exists (
            select 1 from editions ed
            where ed.event_id = e.id
              and (${dateFrom}::date is null or ed.event_date >= ${dateFrom}::date)
              and (${dateTo}::date is null or ed.event_date <= ${dateTo}::date)
          )
        )
        and (
          ${upcomingOnly}::boolean is false
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
    `;

    const { collapseSameNameDate } = await import("@/lib/athrecs/dedupe");
    const {
      matchesDistanceFilter,
      matchesFormatFilter,
      nameHasFullMarathon,
      sanitizeDistances,
      searchLooksLikeMarathon,
    } = await import("@/lib/athrecs/filters");
    const { matchesPostcodeQuery } = await import("@/lib/athrecs/venue");
    return collapseSameNameDate(
      rows.map((r) => {
        const distances = sanitizeDistances(
          r.name,
          r.distances_csv ? r.distances_csv.split(",") : [],
        );
        return {
          ...r,
          distances,
          next_status: (r.next_status as EntryStatus) ?? null,
          next_distance:
            r.next_distance === "Marathon" && !distances.includes("Marathon")
              ? distances[0] ?? r.next_distance
              : r.next_distance,
        };
      }),
    )
      .filter((row) => matchesDistanceFilter(row.name, row.distances, distance))
      .filter((row) => matchesFormatFilter(row.name, format))
      .filter((row) =>
        matchesPostcodeQuery(postcode, {
          slug: row.slug,
          area: row.area,
          city: row.city,
        }),
      )
      .filter((row) => !searchLooksLikeMarathon(rawQ) || nameHasFullMarathon(row.name))
      .slice(0, limit);
  });

export const getEventBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const today = todayIso();
    const events = await sql`
      select * from events where slug = ${slug} limit 1
    `;
    const event = events[0] as
      | {
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
          description: string;
          organiser: string;
          website: string;
        }
      | undefined;
    if (!event) return null;

    const distances = await sql<{ distance_code: string }>`
      select distance_code from event_distances where event_id = ${event.id}
    `;
    const editions = await sql<{
      id: number;
      event_date: string;
      distance_code: string;
      distance_km: number;
      status: string;
      entry_url: string | null;
      source_url: string | null;
      start_time: string | null;
      result_count: number;
    }>`
      select
        ed.id,
        ed.event_date::text as event_date,
        ed.distance_code,
        ed.distance_km,
        ed.status,
        ed.entry_url,
        ed.source_url,
        ed.start_time,
        (select count(*)::int from results r where r.edition_id = ed.id) as result_count
      from editions ed
      where ed.event_id = ${event.id}
      order by ed.event_date desc
    `;

    return {
      event,
      distances: distances.map((d) => d.distance_code),
      upcoming: editions.filter((e) => e.event_date >= today).reverse(),
      past: editions.filter((e) => e.event_date < today),
    };
  });

export const getEditionResults = createServerFn({ method: "GET" })
  .validator((editionId: number) => editionId)
  .handler(async ({ data: editionId }) => {
    const sql = await ready();
    return sql<{
      id: number;
      overall_place: number | null;
      finish_time_seconds: number | null;
      category: string | null;
      athlete_name: string;
      athlete_slug: string;
      club: string | null;
    }>`
      select
        r.id,
        r.overall_place,
        r.finish_time_seconds,
        r.category,
        a.display_name as athlete_name,
        a.slug as athlete_slug,
        c.name as club
      from results r
      join athletes a on a.id = r.athlete_id
      left join clubs c on c.id = a.club_id
      where r.edition_id = ${editionId}
      order by r.finish_time_seconds asc nulls last, a.display_name asc
    `;
  });

export const listAthletes = createServerFn({ method: "GET" })
  .validator((input: { q?: string } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await ready();
    const q = data.q?.trim() ? `%${data.q.trim().toLowerCase()}%` : null;
    return sql<AthleteListItem>`
      select
        a.id, a.slug, a.display_name, a.gender, a.city, a.county, a.country,
        c.name as club,
        c.slug as club_slug,
        (select count(*)::int from results r where r.athlete_id = a.id) as result_count
      from athletes a
      left join clubs c on c.id = a.club_id
      where
        ${q}::text is null
        or lower(a.display_name) like ${q}
        or lower(coalesce(c.name, '')) like ${q}
        or lower(coalesce(a.city, '')) like ${q}
      order by a.display_name
    `;
  });

export const getAthleteBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      slug: string;
      display_name: string;
      gender: string;
      city: string | null;
      county: string;
      country: string;
      bio: string;
      club: string | null;
      club_slug: string | null;
    }>`
      select
        a.*, c.name as club, c.slug as club_slug
      from athletes a
      left join clubs c on c.id = a.club_id
      where a.slug = ${slug}
      limit 1
    `;
    const athlete = rows[0];
    if (!athlete) return null;
    const results = await sql<{
      id: number;
      event_name: string;
      event_slug: string;
      event_date: string;
      distance_code: string;
      overall_place: number | null;
      finish_time_seconds: number | null;
      category: string | null;
    }>`
      select
        r.id,
        e.name as event_name,
        e.slug as event_slug,
        ed.event_date::text as event_date,
        ed.distance_code,
        r.overall_place,
        r.finish_time_seconds,
        r.category
      from results r
      join editions ed on ed.id = r.edition_id
      join events e on e.id = ed.event_id
      where r.athlete_id = ${athlete.id}
      order by ed.event_date desc
    `;
    return { athlete, results };
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
        c.website, c.summary,
        (select count(*)::int from athletes a where a.club_id = c.id) as member_count
      from clubs c
      where
        ${q}::text is null
        or lower(c.name) like ${q}
        or lower(c.city) like ${q}
        or lower(c.sports) like ${q}
      order by c.name
    `;
    return rows.map((r) => ({
      ...r,
      sports: r.sports_csv ? r.sports_csv.split(",").filter(Boolean) : [],
    }));
  });

export const getClubBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      slug: string;
      name: string;
      city: string;
      county: string;
      country: string;
      sports: string;
      website: string | null;
      summary: string;
    }>`
      select * from clubs where slug = ${slug} limit 1
    `;
    const club = rows[0];
    if (!club) return null;
    const members = await sql<{
      id: number;
      slug: string;
      display_name: string;
      gender: string;
      city: string | null;
      result_count: number;
    }>`
      select
        a.id, a.slug, a.display_name, a.gender, a.city,
        (select count(*)::int from results r where r.athlete_id = a.id) as result_count
      from athletes a
      where a.club_id = ${club.id}
      order by a.display_name
    `;
    return {
      club: {
        ...club,
        sports: club.sports ? club.sports.split(",").filter(Boolean) : [],
      },
      members,
    };
  });

export const getHomeStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await ready();
    const today = todayIso();
    const events = await sql<{ n: number }>`select count(*)::int as n from events`;
    const clubs = await sql<{ n: number }>`select count(*)::int as n from clubs`;
    const athletes = await sql<{ n: number }>`select count(*)::int as n from athletes`;
    const upcoming = await sql<{ n: number }>`
      select count(*)::int as n from editions where event_date >= ${today}::date
    `;
    const bySport = await sql<{ sport: string; n: number }>`
      select sport, count(*)::int as n from events group by sport order by sport
    `;
    return {
      events: events[0]?.n ?? 0,
      clubs: clubs[0]?.n ?? 0,
      athletes: athletes[0]?.n ?? 0,
      upcoming: upcoming[0]?.n ?? 0,
      bySport,
    };
  },
);

/** Live DB backend + row counts for admin diagnosis (Neon vs ephemeral PGLite). */
export const getDbStatus = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  const row = await sql<{
    clubs: number;
    athletes: number;
    events: number;
    editions: number;
    results: number;
  }>`select
    (select count(*)::int from clubs) as clubs,
    (select count(*)::int from athletes) as athletes,
    (select count(*)::int from events) as events,
    (select count(*)::int from editions) as editions,
    (select count(*)::int from results) as results`;
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'seed_version' limit 1
  `;
  const r = row[0];
  return {
    backend: dbSource,
    persistent: dbSource === "neon",
    seedVersion: meta[0]?.value ?? null,
    clubs: r?.clubs ?? 0,
    athletes: r?.athletes ?? 0,
    events: r?.events ?? 0,
    editions: r?.editions ?? 0,
    results: r?.results ?? 0,
  };
});

export const listCalendarEditions = createServerFn({ method: "GET" })
  .validator(
    (
      input:
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
          }
        | undefined,
    ) => input ?? {},
  )
  .handler(async ({ data }) => {
    const sql = await ready();
    const rawQ = data.q?.trim() ?? "";
    const q = rawQ ? `%${rawQ.toLowerCase()}%` : null;
    const region = data.region?.trim() || null;
    const today = todayIso();
    const upcomingOnly = data.upcomingOnly !== false;
    const limit = Math.min(Math.max(data.limit ?? 24, 1), 80);
    const fetchLimit = Math.min(limit * 3, 120);
    const distance = data.distance?.trim() || null;
    const surface = data.surface?.trim() || null;
    const sport = data.sport?.trim() && data.sport !== "All" ? data.sport.trim() : null;
    const country = data.country?.trim() && data.country !== "All" ? data.country.trim() : null;
    const county = data.county?.trim() ? `%${data.county.trim().toLowerCase()}%` : null;
    const city = data.city?.trim() ? `%${data.city.trim().toLowerCase()}%` : null;
    const postcode = data.postcode?.trim() || null;
    const format = data.format?.trim() || null;
    const { monthToRange } = await import("@/lib/athrecs/filters");
    const monthRange = data.month ? monthToRange(data.month) : null;
    const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
    const dateTo = data.dateTo?.trim() || monthRange?.to || null;
    const rows = await sql<{
      id: number;
      event_date: string;
      distance_code: string;
      status: string;
      start_time: string | null;
      event_slug: string;
      event_name: string;
      sport: string;
      city: string;
      county: string;
      country: string;
      area: string;
      surface: string;
    }>`
      select
        ed.id,
        ed.event_date::text as event_date,
        ed.distance_code,
        ed.status,
        ed.start_time,
        e.slug as event_slug,
        e.name as event_name,
        e.sport,
        e.city,
        e.county,
        e.country,
        e.area,
        e.surface
      from editions ed
      join events e on e.id = ed.event_id
      where
        (${upcomingOnly}::boolean is false or ed.event_date >= ${today}::date)
        and (
          ${q}::text is null
          or lower(e.name) like ${q}
          or lower(e.city) like ${q}
          or lower(e.county) like ${q}
          or lower(e.country) like ${q}
          or lower(e.area) like ${q}
          or lower(e.surface) like ${q}
          or lower(ed.distance_code) like ${q}
        )
        and (
          ${region}::text is null
          or ${region} = 'Northern Ireland'
          or ${region} = 'Ireland'
          or e.country = ${region}
          or e.county = ${region}
        )
        and (${surface}::text is null or e.surface = ${surface})
        and (${sport}::text is null or e.sport = ${sport})
        and (${country}::text is null or e.country = ${country} or e.county = ${country})
        and (${county}::text is null or lower(e.county) like ${county} or lower(e.city) like ${county})
        and (${city}::text is null or lower(e.city) like ${city} or lower(e.area) like ${city})
        and (
          ${dateFrom}::date is null or ed.event_date >= ${dateFrom}::date
        )
        and (
          ${dateTo}::date is null or ed.event_date <= ${dateTo}::date
        )
        and (
          ${distance}::text is null
          or exists (
            select 1 from editions x
            where x.event_id = ed.event_id
              and x.event_date = ed.event_date
              and x.distance_code = ${distance}
          )
        )
      order by ed.event_date asc, e.name
      limit ${fetchLimit}
    `;
    const { venueForEvent } = await import("@/lib/athrecs/venue");
    const { collapseSameEventDate } = await import("@/lib/athrecs/dedupe");
    const {
      matchesDistanceFilter,
      matchesFormatFilter,
      nameHasFullMarathon,
      sanitizeDistances,
      searchLooksLikeMarathon,
      splitDistanceLabels,
    } = await import("@/lib/athrecs/filters");
    const { matchesPostcodeQuery } = await import("@/lib/athrecs/venue");
    const cleaned = rows.map((row) => {
      const labels = sanitizeDistances(row.event_name, splitDistanceLabels(row.distance_code));
      const distanceCode = labels[0] ?? row.distance_code;
      return {
        ...row,
        distance_code: labels.join(" · ") || distanceCode,
      };
    });
    const mapped = collapseSameEventDate(cleaned).map((row) => {
      const venue = venueForEvent({
        slug: row.event_slug,
        city: row.city,
        county: row.county,
        country: row.country,
        area: row.area,
      });
      return { ...row, venue };
    });
    const filtered = mapped
      .filter((row) =>
        matchesDistanceFilter(row.event_name, splitDistanceLabels(row.distance_code), distance),
      )
      .filter((row) => matchesFormatFilter(row.event_name, format))
      .filter((row) =>
        matchesPostcodeQuery(postcode, {
          slug: row.event_slug,
          area: row.area,
          city: row.city,
          address: row.venue.address,
        }),
      )
      .filter((row) => !searchLooksLikeMarathon(rawQ) || nameHasFullMarathon(row.event_name));
    if (!region) return filtered.slice(0, limit);
    if (region === "Northern Ireland" || region === "Ireland") {
      return filtered.filter((row) => row.venue.nation === region).slice(0, limit);
    }
    return filtered
      .filter((row) => {
        if (row.venue.nation === region) return true;
        return row.country === region || row.county === region;
      })
      .slice(0, limit);
  });


// -- Admin / Grok-assisted imports --
export const importFromCsv = createServerFn({ method: "POST" })
  .validator((input: { csv: string }) => input)
  .handler(async ({ data }) => {
    await ready();
    const parsed = parseEventsCsv(data.csv);
    return applyImportBundle(parsed);
  });

export const importFromJson = createServerFn({ method: "POST" })
  .validator((input: { json: string }) => input)
  .handler(async ({ data }) => {
    await ready();
    let bundle: ImportBundle;
    try {
      bundle = JSON.parse(data.json) as ImportBundle;
    } catch {
      throw new Error("Invalid JSON - paste a Grok export with events[] and/or editions[]");
    }
    return applyImportBundle(bundle);
  });

export const importResults = createServerFn({ method: "POST" })
  .validator((input: { json: string }) => input)
  .handler(async ({ data }) => {
    await ready();
    let bundle: ResultsImportBundle;
    try {
      const parsed = JSON.parse(data.json) as ResultsImportBundle | { results?: unknown };
      if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as ResultsImportBundle).results)) {
        throw new Error('JSON must be { "results": [ ... ] }');
      }
      bundle = parsed as ResultsImportBundle;
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error("Invalid JSON");
      throw e;
    }
    return applyResultsImport(bundle);
  });

export const listAdminEventCards = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await ready();
    return sql<{
      id: number;
      slug: string;
      name: string;
      sport: string;
      city: string;
      edition_count: number;
      next_date: string | null;
    }>`
      select
        e.id, e.slug, e.name, e.sport, e.city,
        (select count(*)::int from editions ed where ed.event_id = e.id) as edition_count,
        (
          select ed.event_date::text from editions ed
          where ed.event_id = e.id
          order by ed.event_date desc limit 1
        ) as next_date
      from events e
      order by e.name
    `;
  },
);
