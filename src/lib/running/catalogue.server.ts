import { getSql } from "../db";
import { ensureAthrecsSeeded } from "../athrecs/seed.server";
import { todayIso } from "../athrecs/format";
import type { EntryStatus, EventListItem, RaceGroupInfo, Sport } from "../athrecs/types";
import { supplementedStart } from "../../data/runrecs-race-guides";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";

function isRunRecsSport(value: unknown): value is "Running" | "Parkrun" {
  return value === "Running" || value === "Parkrun";
}
async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

export type EventRegionInput =
  | {
      sport?: Sport | "All";
      country?: string;
    }
  | undefined;

export async function queryRunningRegions(data: NonNullable<EventRegionInput>) {
  if (data.sport && data.sport !== "All" && !isRunRecsSport(data.sport)) return [];
  const country = data.country?.trim() && data.country !== "All" ? data.country.trim() : null;
  if (!country) return [];

  // Query here instead of invoking the shared createServerFn from another
  // createServerFn. Nested RPC wrappers return an empty payload in the
  // deployed specialist runtime, while a direct query preserves the exact
  // Running/Parkrun public boundary and supplies the catalogue choices.
  const sql = await ready();
  const requestedSport = isRunRecsSport(data.sport) ? data.sport : null;
  const rows = await sql<{
    slug: string;
    name: string;
    country: string;
    region: string | null;
    county: string;
    city: string;
    area: string;
  }>`
      select e.slug, e.name, e.country, e.region, e.county, e.city, e.area
      from events e
      where e.sport in ('Running', 'Parkrun')
        and not (e.slug = any(${retainedFixtureAliasSlugs}::text[]))
        and (${requestedSport}::text is null or e.sport = ${requestedSport})
        and (
          lower(coalesce(e.country, '')) = lower(${country})
          or lower(coalesce(e.county, '')) = lower(${country})
          or (
            ${country} in ('United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland')
            and lower(coalesce(e.country, '')) in (
              'united kingdom', 'england', 'scotland', 'wales', 'northern ireland', 'uk', 'gb'
            )
          )
        )
      order by e.region nulls last, e.county, e.city
    `;
  const { countryMatchesFilter, resolveCountry } = await import("@/lib/athrecs/countries");
  const choices = rows
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
    .map((row) => row.region?.trim() || row.county?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value) => value.toLowerCase() !== country.toLowerCase());

  return [...new Set(choices)].sort((left, right) => left.localeCompare(right, "en"));
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

export type ListEventsInput =
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
  next_entry_url: string | null;
  next_starts_json: string | Array<{ distance: string; time: string | null }> | null;
  upcoming_count: number;
  past_count: number;
  edition_count: number;
};

export async function queryRunningEvents(data: NonNullable<ListEventsInput>) {
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
  const { monthToRange } = await import("../athrecs/filters");
  const monthRange = data.month ? monthToRange(data.month) : null;
  const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
  const dateTo = data.dateTo?.trim() || monthRange?.to || null;

  // Inline the filtered set so repeated event lookups retain the editions
  // index instead of scanning a materialized copy of the whole catalogue.
  const rows = await sql<RawEventRow>`
      with display_editions as not materialized (
        select ed.* from editions ed
        where ed.status <> 'Cancelled' and (${dateFrom}::date is null or ed.event_date >= ${dateFrom}::date)
          and (${dateTo}::date is null or ed.event_date <= ${dateTo}::date)
          and ((${dateFrom}::date is not null or ${dateTo}::date is not null) or ed.event_date >= ${today}::date)
          and (${upcomingOnly}::boolean is false or ed.event_date >= ${today}::date)
          and (${distance}::text is null or ed.distance_code = ${distance})
      )
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
          select ed.event_date::text from display_editions ed
          where ed.event_id = e.id
          order by ed.event_date asc, ed.distance_km asc, ed.id asc limit 1
        ) as next_date,
        (
          select ed.distance_code from display_editions ed
          where ed.event_id = e.id
          order by ed.event_date asc, ed.distance_km asc, ed.id asc limit 1
        ) as next_distance,
        (
          select ed.status from display_editions ed
          where ed.event_id = e.id
          order by ed.event_date asc, ed.distance_km asc, ed.id asc limit 1
        ) as next_status,
        (
          select ed.start_time from display_editions ed
          where ed.event_id = e.id
          order by ed.event_date asc, ed.distance_km asc, ed.id asc limit 1
        ) as next_start_time,
        (
          select option.entry_url
          from display_editions ed
          join edition_entry_options option on option.edition_id = ed.id
          where ed.event_id = e.id
            and ed.status not in ('Closed', 'Finished', 'Cancelled')
            and option.entry_type = 'official' and option.is_verified
            and option.status in ('open', 'closing_soon', 'ballot', 'waitlist', 'unknown')
            and (option.closes_at is null or option.closes_at >= ${today}::date)
            and ed.id = (select first_ed.id from display_editions first_ed
              where first_ed.event_id = e.id
              order by first_ed.event_date, first_ed.distance_km, first_ed.id limit 1)
          order by option.is_primary desc, option.checked_at desc, option.id limit 1
        ) as next_entry_url,
        (
          select json_agg(json_build_object('distance', ed.distance_code, 'time', ed.start_time)
            order by ed.distance_km, ed.id)::text
          from display_editions ed where ed.event_id = e.id and ed.event_date = (
            select min(first_ed.event_date) from display_editions first_ed
            where first_ed.event_id = e.id
          )
        ) as next_starts_json,
        (
          select count(*)::int from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date and ed.status <> 'Cancelled'
        ) as upcoming_count,
        (
          select count(*)::int from editions ed
          where ed.event_id = e.id and ed.event_date < ${today}::date
        ) as past_count,
        (select count(*)::int from editions ed where ed.event_id = e.id) as edition_count
      from events e
      where e.sport in ('Running', 'Parkrun')
        and not (e.slug = any(${retainedFixtureAliasSlugs}::text[]))
        and (${requestedSport}::text is null or e.sport = ${requestedSport})
        and (
          (${upcomingOnly}::boolean is false and ${dateFrom}::date is null
            and ${dateTo}::date is null and ${distance}::text is null)
          or exists (select 1 from display_editions ed where ed.event_id = e.id)
        )
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
        and (${country}::text is null or e.country = ${country} or e.county = ${country} or (${country} = 'United Kingdom' and e.country in ('England','Scotland','Wales','Northern Ireland')))
        and (
          ${county}::text is null
          or lower(coalesce(e.region, '')) like ${county}
          or lower(e.county) like ${county}
          or lower(e.city) like ${county}
        )
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
            where ed.event_id = e.id and ed.event_date >= ${today}::date and ed.status <> 'Cancelled'
          )
        )
      order by
        case when (
          select min(ed.event_date) from display_editions ed
          where ed.event_id = e.id
        ) is null then 1 else 0 end,
        (
          select min(ed.event_date) from display_editions ed
          where ed.event_id = e.id
        ) asc nulls last,
        e.name asc
      limit ${fetchLimit}
      offset ${offset}
    `;

  const { collapseSameNameDate } = await import("../athrecs/dedupe");
  const {
    matchesDistanceFilter,
    matchesFormatFilter,
    nameHasFullMarathon,
    sanitizeDistances,
    searchLooksLikeMarathon,
  } = await import("../athrecs/filters");
  const { matchesPostcodeQuery } = await import("../athrecs/venue");
  const { countryMatchesFilter, resolveCountry } = await import("../athrecs/countries");

  const mapped: EventListItem[] = rows
    .map((rawRow): EventListItem | null => {
      const { groups_json, distances_csv, next_starts_json, ...row } = rawRow;
      const nextStarts =
        typeof next_starts_json === "string"
          ? (JSON.parse(next_starts_json) as Array<{ distance: string; time: string | null }>)
          : (next_starts_json ?? []);
      const distances = sanitizeDistances(row.name, distances_csv ? distances_csv.split(",") : []);
      return {
        ...row,
        distances,
        groups: parseRaceGroups(groups_json),
        next_start_time:
          row.sport === "Parkrun"
            ? row.next_start_time
            : supplementedStart(row, row.next_date, row.next_distance, row.next_start_time),
        next_starts: nextStarts.map((start) => ({
          distance: start.distance,
          time:
            row.sport === "Parkrun"
              ? start.time
              : supplementedStart(row, row.next_date, start.distance, start.time),
        })),
        next_status: row.next_status as EntryStatus | null,
        next_distance:
          row.next_distance === "Marathon" && !distances.includes("Marathon")
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
}
