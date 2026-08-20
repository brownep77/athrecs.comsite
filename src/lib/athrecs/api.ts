import { createServerFn } from "@tanstack/react-start";
import { getSql, dbSource } from "@/lib/db";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { canonicalEventSlug } from "@/data/entry-options";
import { ensureAthrecsSeeded } from "./seed.server";
import { todayIso } from "./format";
import type {
  AthleteListItem,
  ClubContactInfo,
  ClubListItem,
  ClubSocialInfo,
  EditionEntryOption,
  EditionResultLink,
  EntryStatus,
  EventListItem,
  RaceGroupInfo,
  Sport,
} from "./types";
import {
  applyImportBundle,
  applyResultsImport,
  parseEventsCsv,
  type ImportBundle,
  type ResultsImportBundle,
} from "./import.server";
import {
  getFixtureSourceBulkRunDashboard,
  queueFixtureSourceBulkRun,
} from "./bulk-source-run.server";

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

function parseEntryOptions(value: unknown): EditionEntryOption[] {
  if (!value) return [];
  let options: EditionEntryOption[] = [];
  if (Array.isArray(value)) {
    options = value as EditionEntryOption[];
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      options = Array.isArray(parsed) ? (parsed as EditionEntryOption[]) : [];
    } catch {
      return [];
    }
  }

  const hasVerifiedOfficial = options.some(
    (option) => option.entry_type === "official" && option.is_verified,
  );
  if (!hasVerifiedOfficial) return options;

  return options.filter((option) => !(option.provider_code === "official" && !option.is_verified));
}

function parseResultLinks(value: unknown): EditionResultLink[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as EditionResultLink[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as EditionResultLink[]) : [];
  } catch {
    return [];
  }
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
            group?: string;
            offset?: number;
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
    const { monthToRange } = await import("@/lib/athrecs/filters");
    const monthRange = data.month ? monthToRange(data.month) : null;
    const dateFrom = data.dateFrom?.trim() || monthRange?.from || null;
    const dateTo = data.dateTo?.trim() || monthRange?.to || null;

    const rows = await sql<
      Omit<EventListItem, "groups"> & {
        distances_csv: string | null;
        groups_json: string | RaceGroupInfo[] | null;
      }
    >`
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
          ${dateFrom}::date is null and ${dateTo}::date is null
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

    const { collapseSameNameDate } = await import("@/lib/athrecs/dedupe");
    const {
      matchesDistanceFilter,
      matchesFormatFilter,
      nameHasFullMarathon,
      sanitizeDistances,
      searchLooksLikeMarathon,
    } = await import("@/lib/athrecs/filters");
    const { matchesPostcodeQuery } = await import("@/lib/athrecs/venue");
    const { countryMatchesFilter, resolveCountry } = await import("@/lib/athrecs/countries");
    const { nextParkrunDate, remainingParkrunCount, parkrunDates, parkrunStartTime } =
      await import("@/lib/athrecs/parkrun-dates");
    const mapped = rows
      .map((rawRow) => {
        const { groups_json, ...r } = rawRow;
        const distances = sanitizeDistances(
          r.name,
          r.distances_csv ? r.distances_csv.split(",") : [],
        );
        if (r.sport === "Parkrun" && (dateFrom || dateTo)) {
          if (parkrunDates(r.name, dateFrom ?? today, dateTo ?? "2027-12-26").length === 0) {
            return null;
          }
        }
        const nextDate =
          r.sport === "Parkrun"
            ? nextParkrunDate(r.name, dateFrom && dateFrom > today ? dateFrom : today)
            : r.next_date;
        return {
          ...r,
          distances,
          groups: parseRaceGroups(groups_json),
          next_date: nextDate,
          upcoming_count:
            r.sport === "Parkrun" ? remainingParkrunCount(r.name, today) : r.upcoming_count,
          next_start_time:
            r.sport === "Parkrun"
              ? parkrunStartTime(r.country, /junior/i.test(r.name))
              : r.next_start_time,
          next_status: (r.next_status as EntryStatus) ?? (r.sport === "Parkrun" ? "Open" : null),
          next_distance:
            r.sport === "Parkrun"
              ? /junior/i.test(r.name)
                ? "2K"
                : "5K"
              : r.next_distance === "Marathon" && !distances.includes("Marathon")
                ? (distances[0] ?? r.next_distance)
                : r.next_distance,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
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
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const today = todayIso();
    const canonicalSlug = canonicalEventSlug(slug);
    const events = await sql`
      select * from events where slug = ${canonicalSlug} limit 1
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

    const { parkrunDates, parkrunDistance, parkrunStartTime } =
      await import("@/lib/athrecs/parkrun-dates");

    const distances = await sql<{ distance_code: string }>`
      select distance_code from event_distances where event_id = ${event.id}
    `;
    const groups = await sql<RaceGroupInfo>`
      select
        group_code as code,
        label,
        level,
        source_url,
        checked_at::text as checked_at,
        note
      from event_groups
      where event_id = ${event.id}
      order by
        case level when 'final' then 0 when 'major' then 1 when 'event' then 2 else 3 end,
        label
    `;
    const editionRows = await sql<{
      id: number;
      event_date: string;
      distance_code: string;
      distance_km: number;
      status: string;
      entry_url: string | null;
      source_url: string | null;
      results_official_url: string | null;
      start_time: string | null;
      notes: string | null;
      result_count: number;
      entry_options_json: string | EditionEntryOption[] | null;
      result_links_json: string | EditionResultLink[] | null;
    }>`
      select
        ed.id,
        ed.event_date::text as event_date,
        ed.distance_code,
        ed.distance_km,
        ed.status,
        ed.entry_url,
        ed.source_url,
        ed.results_official_url,
        ed.start_time,
        ed.notes,
        (select count(*)::int from results r where r.edition_id = ed.id) as result_count,
        (
          select coalesce(
            json_agg(json_build_object(
              'id', option.id,
              'provider_code', option.provider_code,
              'provider_name', option.provider_name,
              'entry_url', option.entry_url,
              'entry_type', option.entry_type,
              'status', option.status,
              'price_amount', option.price_amount,
              'price_currency', option.price_currency,
              'opens_at', option.opens_at::text,
              'closes_at', option.closes_at::text,
              'checked_at', option.checked_at::text,
              'source_url', option.source_url,
              'is_verified', option.is_verified,
              'is_primary', option.is_primary,
              'notes', option.notes
            ) order by
              option.is_primary desc,
              case option.entry_type when 'official' then 0 else 1 end,
              option.provider_name)::text,
            '[]'
          )
          from edition_entry_options option
          where option.edition_id = ed.id
        ) as entry_options_json
        , (
          select coalesce(
            json_agg(json_build_object(
              'id', link.id,
              'provider_code', link.provider_code,
              'provider_name', link.provider_name,
              'results_url', link.results_url,
              'source_url', link.source_url,
              'is_verified', link.is_verified,
              'checked_at', link.checked_at::text
            ) order by link.provider_name, link.id)::text,
            '[]'
          )
          from edition_result_links link
          where link.edition_id = ed.id
            and link.status = 'approved'
            and link.is_verified
        ) as result_links_json
      from editions ed
      where ed.event_id = ${event.id}
      order by
        ed.event_date desc,
        exists (
          select 1 from edition_entry_options option
          where option.edition_id = ed.id and option.is_verified
        ) desc,
        exists (
          select 1 from edition_entry_options option
          where option.edition_id = ed.id
        ) desc,
        case ed.distance_code
          when 'Half' then 0
          when 'Marathon' then 1
          when 'Ultra' then 2
          when '10K' then 3
          when '5K' then 4
          else 5
        end,
        ed.id desc
    `;
    const editions = editionRows.map(({ entry_options_json, result_links_json, ...edition }) => ({
      ...edition,
      entry_options: parseEntryOptions(entry_options_json),
      result_links: parseResultLinks(result_links_json),
    }));

    const storedUpcoming = editions.filter((e) => e.event_date >= today);
    const storedDates = new Set(storedUpcoming.map((e) => e.event_date));
    const generated =
      event.sport === "Parkrun"
        ? parkrunDates(event.name, today).map((event_date, index) => {
            const dist = parkrunDistance(event.name);
            return {
              id: -1000 - index,
              event_date,
              distance_code: dist.code,
              distance_km: dist.km,
              status: "Open",
              entry_url: event.website,
              source_url: event.website,
              results_official_url: null,
              start_time: parkrunStartTime(event.country, /junior/i.test(event.name)),
              notes: null,
              result_count: 0,
              result_links: [],
              entry_options: event.website
                ? [
                    {
                      id: -1000 - index,
                      provider_code: "official",
                      provider_name: "Official parkrun page",
                      entry_url: event.website,
                      entry_type: "official" as const,
                      status: "open" as const,
                      price_amount: null,
                      price_currency: null,
                      opens_at: null,
                      closes_at: null,
                      checked_at: today,
                      source_url: event.website,
                      is_verified: true,
                      is_primary: true,
                    },
                  ]
                : [],
            };
          })
        : [];
    const upcoming = [
      ...storedUpcoming,
      ...generated.filter((row) => !storedDates.has(row.event_date)),
    ].sort((a, b) => a.event_date.localeCompare(b.event_date));

    const relatedRows = await sql<
      Omit<EventListItem, "groups"> & {
        distances_csv: string | null;
        groups_json: string | RaceGroupInfo[] | null;
      }
    >`
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
      where e.id <> ${event.id}
        and e.sport = ${event.sport}
        and (
          lower(coalesce(e.city, '')) = lower(${event.city})
          or e.country = ${event.country}
        )
      order by
        case when lower(coalesce(e.city, '')) = lower(${event.city}) then 0 else 1 end,
        (
          select min(ed.event_date) from editions ed
          where ed.event_id = e.id and ed.event_date >= ${today}::date
        ) asc nulls last
      limit 8
    `;
    const { sanitizeDistances } = await import("@/lib/athrecs/filters");
    const related = relatedRows.map((rawRow) => {
      const { groups_json, ...row } = rawRow;
      return {
        ...row,
        distances: sanitizeDistances(
          row.name,
          row.distances_csv ? row.distances_csv.split(",") : [],
        ),
        groups: parseRaceGroups(groups_json),
        next_status: (row.next_status as EntryStatus) ?? null,
      };
    });

    return {
      event,
      groups,
      distances: distances.map((d) => d.distance_code),
      upcoming,
      past: editions.filter((e) => e.event_date < today),
      related,
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
        c.website, c.official_source, c.summary,
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
      address: string | null;
      postcode: string | null;
      region: string | null;
      official_source: string | null;
      source_url: string | null;
      checked_at: string | null;
      location_precision: string;
      contact_url: string | null;
      contacts_json: string;
      socials_json: string;
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
        contacts: JSON.parse(club.contacts_json || "[]") as ClubContactInfo[],
        socials: JSON.parse(club.socials_json || "[]") as ClubSocialInfo[],
      },
      members,
    };
  });

export const getHomeStats = createServerFn({ method: "GET" }).handler(async () => {
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
});

/** Live DB backend + row counts for admin diagnosis (Neon vs ephemeral PGLite). */
export const getDbStatus = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await ready();
    const row = await sql<{
      clubs: number;
      athletes: number;
      events: number;
      editions: number;
      entry_options: number;
      result_links: number;
      results: number;
    }>`select
      (select count(*)::int from clubs) as clubs,
      (select count(*)::int from athletes) as athletes,
      (select count(*)::int from events) as events,
      (select count(*)::int from editions) as editions,
      (select count(*)::int from edition_entry_options) as entry_options,
      (select count(*)::int from edition_result_links where status = 'approved') as result_links,
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
      entryOptions: r?.entry_options ?? 0,
      resultLinks: r?.result_links ?? 0,
      results: r?.results ?? 0,
    };
  });

export const getBulkSourceRun = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ready();
    return getFixtureSourceBulkRunDashboard();
  });

/** Configuration-level source inventory for the admin review screen. */
export const listFixtureSources = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getBulkSourceJobManifest, getFixtureSourceRegistrySummary } =
      await import("./source-registry.server");
    const { registryHash: _registryHash, ...registry } = getFixtureSourceRegistrySummary();
    return {
      registry,
      sources: getBulkSourceJobManifest(),
    };
  });

export const queueBulkSourceRun = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ready();
    return queueFixtureSourceBulkRun();
  });

export const getScraperWorkbookImport = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ready();
    const { getScraperWorkbookImportDashboard } = await import("./scraper-workbook-import.server");
    return getScraperWorkbookImportDashboard();
  });

export const uploadScraperWorkbookNow = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    await ready();
    if (dbSource !== "neon") {
      throw new Error("Connect the persistent Neon database before uploading the scraper workbook");
    }
    const { uploadScraperWorkbookSnapshotNow } = await import("./scraper-workbook-import.server");
    return uploadScraperWorkbookSnapshotNow();
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
            group?: string;
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
    const group = data.group?.trim() || null;
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
        and (
          ${group}::text is null
          or exists (
            select 1 from event_groups g
            where g.event_id = e.id and g.group_code = ${group}
          )
        )
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
    const { parkrunDates, parkrunDistance, parkrunStartTime } =
      await import("@/lib/athrecs/parkrun-dates");
    const wantParkrun = !sport || sport === "Parkrun";
    const generatedRows: typeof rows = [];
    if (wantParkrun) {
      const windowFrom = dateFrom && dateFrom > today ? dateFrom : today;
      const windowTo = dateTo || (dateFrom ? "2027-12-26" : null);
      const venues = await sql<{
        id: number;
        slug: string;
        name: string;
        sport: string;
        city: string;
        county: string;
        country: string;
        area: string;
        surface: string;
        website: string | null;
      }>`
        select e.id, e.slug, e.name, e.sport, e.city, e.county, e.country, e.area, e.surface, e.website
        from events e
        where e.sport = 'Parkrun'
          and ${group}::text is null
          and (${q}::text is null
            or lower(e.name) like ${q}
            or lower(e.city) like ${q}
            or lower(e.county) like ${q}
            or lower(e.country) like ${q}
            or lower(e.area) like ${q})
          and (${country}::text is null or e.country = ${country} or e.county = ${country})
          and (${county}::text is null or lower(e.county) like ${county} or lower(e.city) like ${county})
          and (${city}::text is null or lower(e.city) like ${city} or lower(e.area) like ${city})
          and (${surface}::text is null or e.surface = ${surface})
        order by e.name
        limit 400
      `;
      const seen = new Set(rows.map((row) => `${row.event_slug}|${row.event_date}`));
      for (const venue of venues) {
        const dates = parkrunDates(venue.name, windowFrom, windowTo ?? undefined);
        const cap = windowTo ? dates : dates.slice(0, 4);
        const dist = parkrunDistance(venue.name);
        for (const eventDate of cap) {
          const key = `${venue.slug}|${eventDate}`;
          if (seen.has(key)) continue;
          seen.add(key);
          generatedRows.push({
            id: -venue.id,
            event_date: eventDate,
            distance_code: dist.code,
            status: "Open",
            start_time: parkrunStartTime(venue.country, /junior/i.test(venue.name)),
            event_slug: venue.slug,
            event_name: venue.name,
            sport: venue.sport,
            city: venue.city,
            county: venue.county,
            country: venue.country,
            area: venue.area,
            surface: venue.surface,
          });
        }
      }
    }
    const combined = [...rows, ...generatedRows];
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
    const { countryMatchesFilter, resolveCountry } = await import("@/lib/athrecs/countries");
    const cleaned = combined.map((row) => {
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
        name: row.event_name,
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
      .filter((row) => !searchLooksLikeMarathon(rawQ) || nameHasFullMarathon(row.event_name))
      .filter((row) =>
        countryMatchesFilter(
          resolveCountry({
            slug: row.event_slug,
            name: row.event_name,
            country: row.country,
            county: row.county,
            city: row.city,
            area: row.area,
            address: row.venue.address,
          }),
          country || region,
        ),
      )
      .sort(
        (a, b) =>
          a.event_date.localeCompare(b.event_date) || a.event_name.localeCompare(b.event_name),
      );
    return filtered.slice(0, limit);
  });

// -- Admin / Grok-assisted imports --
export const importFromCsv = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { csv: string }) => input)
  .handler(async ({ data }) => {
    await ready();
    const parsed = parseEventsCsv(data.csv);
    return applyImportBundle(parsed);
  });

export const importFromJson = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
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
  .middleware([staffMiddleware])
  .validator((input: { json: string }) => input)
  .handler(async ({ data }) => {
    await ready();
    let bundle: ResultsImportBundle;
    try {
      const parsed = JSON.parse(data.json) as ResultsImportBundle | { results?: unknown };
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !Array.isArray((parsed as ResultsImportBundle).results)
      ) {
        throw new Error('JSON must be { "results": [ ... ] }');
      }
      bundle = parsed as ResultsImportBundle;
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error("Invalid JSON");
      throw e;
    }
    return applyResultsImport(bundle);
  });

export const listAdminEventCards = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
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
  });
