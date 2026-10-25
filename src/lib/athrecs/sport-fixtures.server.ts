import { publicCatalogueContent } from "./public-catalogue-content.ts";
import type { Sql } from "../db";
import type { SportFixtureScope, SportFixtureSearch } from "./sport-pages";
import type { CalendarRace } from "./event-calendar";
import { catalogueCalendarDetails } from "./catalogue-calendar.ts";
import {
  ATHLETICS_RUNNING_SURFACES,
  fixtureDistanceCode,
  parseSportFixtureSearch,
  publicHttpUrl,
  UK_FIXTURE_COUNTRIES,
} from "./sport-pages.ts";
import { formatDistanceWithUnits, kmFromDistanceCode } from "./distance.ts";
import { FIXTURE_DETAILS, isReviewedFixturePlaceholder } from "../../data/fixture-details.ts";
import { fixtureSummary, fixtureTimeZone } from "./fixture-presentation.ts";
import { filterCountryName, resolveCountry } from "./countries.ts";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication.ts";
import { withheldFixtureDateKeys } from "../../data/fixture-date-reviews.ts";

export const SPORT_FIXTURE_PAGE_SIZE = 24;

export type SportFixture = {
  eventId: number;
  slug: string | null;
  name: string;
  eventDate: string;
  city: string | null;
  town: string | null;
  county: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  summary: string;
  timeZone: string | null;
  starts: Array<{
    editionId: number;
    distance: string;
    distanceKm: number;
    status: string;
    time: string | null;
    endDate: string | null;
    endTime: string | null;
    sourceUrl: string | null;
    checkedAt: string | null;
    note: string | null;
    label: string | null;
    calendarRace: CalendarRace | null;
  }>;
};

/** Read the published event catalogue without changing any data or visibility. */
export async function readSportFixtures(
  sql: Sql,
  input: SportFixtureScope & SportFixtureSearch,
  today: string,
) {
  const q = input.q ? `%${input.q.replace(/[\\%_]/g, "\\$&")}%` : null;
  const page = input.page ?? 1;
  const month = parseSportFixtureSearch({ month: input.month }).month;
  const requestedCountry = input.country
    ? filterCountryName(resolveCountry({ country: input.country }))
    : null;
  let country =
    requestedCountry === "United Kingdom"
      ? [...UK_FIXTURE_COUNTRIES]
      : requestedCountry
        ? [requestedCountry]
        : null;
  const options = await sql.query<{
    country: string | null;
    distance: string | null;
    month: string;
  }>(
    `select distinct btrim(e.country) as country, btrim(ed.distance_code) as distance,
       to_char(ed.event_date, 'YYYY-MM') as month
     from events e join editions ed on ed.event_id = e.id
     where e.sport = any($1::text[]) and ed.event_date >= $2::date
       and not ((coalesce(e.slug, '') || '|' || ed.event_date::text) = any($5::text[]))
       and not (coalesce(e.slug, '') = any($4::text[]))
       and ($3::text[] is null or e.surface = any($3::text[]))
       and (not $6::boolean or e.sport = 'Running'
         or (e.sport = 'Athletics' and e.surface = any($7::text[])))`,
    [
      [...input.sports],
      today,
      input.surfaces ? [...input.surfaces] : null,
      retainedFixtureAliasSlugs,
      withheldFixtureDateKeys,
      input.broadRunning === true,
      ATHLETICS_RUNNING_SURFACES,
    ],
  );
  const distanceCodes = [
    ...new Set(options.map((row) => row.distance).filter((value): value is string => !!value)),
  ];
  const canonicalCountry = (value: string | null) =>
    value ? filterCountryName(resolveCountry({ country: value })) : null;
  if (country) {
    const wanted = new Set(country.map(canonicalCountry));
    country = options
      .map((row) => row.country)
      .filter((value): value is string => !!value && wanted.has(canonicalCountry(value)));
  }
  const distance = input.distance
    ? distanceCodes.filter(
        (code) => fixtureDistanceCode(code) === fixtureDistanceCode(input.distance!),
      )
    : null;
  const rows = await sql.query<{
    event_id: number;
    slug: string | null;
    summary: string | null;
    sport: string;
    name: string;
    event_date: string;
    city: string | null;
    county: string | null;
    country: string | null;
    website: string | null;
    starts_json: string;
  }>(
    `
    select e.id as event_id, e.slug, e.summary, e.sport, e.name, ed.event_date::text as event_date,
      e.city, e.county, e.country, e.website,
      json_agg(json_build_object(
          'editionId', ed.id, 'distance', ed.distance_code, 'distanceKm', ed.distance_km,
          'status', ed.status, 'time', ed.start_time, 'sourceUrl', ed.source_url,
          'endDate', case when ed.end_source_url is not null and ed.end_checked_at is not null then ed.end_date::text end,
          'endTime', case when ed.end_source_url is not null and ed.end_checked_at is not null then ed.end_time end)
        order by ed.start_time nulls last, ed.distance_code, ed.id)::text as starts_json
    from events e join editions ed on ed.event_id = e.id
    where e.sport = any($1::text[]) and ed.event_date >= $2::date
      and not ((coalesce(e.slug, '') || '|' || ed.event_date::text) = any($10::text[]))
      and not (coalesce(e.slug, '') = any($9::text[]))
      and ($3::text is null or e.name ilike $3 or e.city ilike $3 or e.county ilike $3 or e.country ilike $3)
      and ($6::text[] is null or e.surface = any($6::text[]))
      and ($7::text[] is null or btrim(e.country) = any($7::text[]))
      and ($8::text[] is null or btrim(ed.distance_code) = any($8::text[]))
      and ($11::date is null or (ed.event_date >= $11::date and ed.event_date < $11::date + interval '1 month'))
      and (not $12::boolean or e.sport = 'Running'
        or (e.sport = 'Athletics' and e.surface = any($13::text[])))
    group by e.id, e.slug, e.summary, e.sport, e.name, ed.event_date, e.city, e.county, e.country, e.website
    order by ed.event_date, e.name, e.id
    limit $4 offset $5
  `,
    [
      [...input.sports],
      today,
      q,
      SPORT_FIXTURE_PAGE_SIZE + 1,
      (page - 1) * SPORT_FIXTURE_PAGE_SIZE,
      input.surfaces ? [...input.surfaces] : null,
      country,
      distance,
      retainedFixtureAliasSlugs,
      withheldFixtureDateKeys,
      month ? `${month}-01` : null,
      input.broadRunning === true,
      ATHLETICS_RUNNING_SURFACES,
    ],
  );
  // Options cover the whole upcoming sport catalogue, not just the current page
  // or selection, so changing one filter never traps the visitor in another.
  const countries = new Set(
    options.map((row) => canonicalCountry(row.country)).filter((value): value is string => !!value),
  );
  if (UK_FIXTURE_COUNTRIES.some((value) => countries.has(value))) countries.add("United Kingdom");
  const distances = [...new Set(distanceCodes.map(fixtureDistanceCode))];
  distances.sort(
    (a, b) =>
      (kmFromDistanceCode(a) ?? Infinity) - (kmFromDistanceCode(b) ?? Infinity) ||
      a.localeCompare(b, "en", { numeric: true }),
  );
  return {
    countries: [...countries].sort((a, b) => a.localeCompare(b, "en")),
    months: [...new Set(options.map((row) => row.month))].sort(),
    distances,
    fixtures: rows
      .slice(0, SPORT_FIXTURE_PAGE_SIZE)
      .map((row): SportFixture => {
        const detail = FIXTURE_DETAILS[`${row.slug}|${row.event_date}`];
        const starts = JSON.parse(row.starts_json) as Array<{
          editionId: number;
          distance: string;
          distanceKm: number;
          status: string;
          time: string | null;
          endDate: string | null;
          endTime: string | null;
          sourceUrl: string | null;
        }>;
        const slug = row.slug || null;
        const city = detail?.place?.city ?? row.city;
        const county = detail?.place?.county ?? row.county;
        const countryName = canonicalCountry(row.country);
        const timeZone = detail?.timeZone ?? fixtureTimeZone(row.country);
        return {
          eventId: row.event_id,
          slug,
          name: row.name,
          eventDate: row.event_date,
          town: detail?.place?.town ?? null,
          city,
          county,
          state: detail?.place?.state ?? null,
          country: countryName,
          website: publicHttpUrl(detail?.sourceUrl ?? row.website),
          summary: fixtureSummary(detail?.summary ?? row.summary, row.sport, row.city),
          timeZone,
          starts: starts
            .filter(
              (start) =>
                !isReviewedFixturePlaceholder(row.slug ?? "", row.event_date, start.distance),
            )
            .map((start) => {
              const checked = detail?.starts[start.distance];
              const sourceUrl = publicHttpUrl(
                checked ? (checked.sourceUrl ?? detail.sourceUrl) : start.sourceUrl,
              );
              // Legacy runABC imports contain UTC-shifted clocks and midnight
              // placeholders. Do not present those as race starts without a check.
              const legacyImport =
                sourceUrl && /(^|\.)runabc\.co\.uk$/i.test(new URL(sourceUrl).hostname);
              const time = checked ? checked.time : sourceUrl && !legacyImport ? start.time : null;
              const label = checked?.label ?? null;
              // These are the same real edition identifiers accepted by the private
              // calendar subscription. Never manufacture a page URL for missing slugs
              // or promote the entry-status value TBC into a provisional date claim.
              const calendarRace: CalendarRace | null = slug
                ? {
                    id: `edition-${start.editionId}-${start.distance}`,
                    name: row.name,
                    date: row.event_date,
                    distance: formatDistanceWithUnits(start.distance, start.distanceKm),
                    startTime: time,
                    startLabel: label,
                    endDate: start.endDate,
                    endTime: start.endTime,
                    timeZone,
                    ...catalogueCalendarDetails(
                      {
                        slug,
                        website: publicHttpUrl(row.website),
                        city,
                        county,
                        country: countryName,
                      },
                      row.event_date,
                      start.distance,
                    ),
                    pageUrl: `https://www.athrecs.com/races/${encodeURIComponent(slug)}`,
                    status: start.status,
                  }
                : null;
              return {
                editionId: start.editionId,
                distance: start.distance,
                distanceKm: start.distanceKm,
                status: start.status,
                time,
                endDate: start.endDate,
                endTime: start.endTime,
                sourceUrl,
                checkedAt: checked ? detail.checkedAt : null,
                note: checked?.note ?? null,
                label,
                calendarRace,
              };
            })
            .sort(
              (a, b) =>
                (a.time ?? "99:99").localeCompare(b.time ?? "99:99") ||
                a.distance.localeCompare(b.distance),
            ),
        };
      })
      .map(publicCatalogueContent),
    hasMore: rows.length > SPORT_FIXTURE_PAGE_SIZE,
    page,
  };
}
