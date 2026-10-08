import type { Sql } from "../db";
import type { SportFixtureSearch, SportPage } from "./sport-pages";
import { fixtureDistanceCode, publicHttpUrl, UK_FIXTURE_COUNTRIES } from "./sport-pages.ts";
import { kmFromDistanceCode } from "./distance.ts";
import { FIXTURE_DETAILS } from "../../data/fixture-details.ts";
import { fixtureSummary, fixtureTimeZone } from "./fixture-presentation.ts";
import { filterCountryName, resolveCountry } from "./countries.ts";

export const SPORT_FIXTURE_PAGE_SIZE = 24;

export type SportFixture = {
  eventId: number;
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
    distance: string;
    time: string | null;
    sourceUrl: string | null;
    checkedAt: string | null;
    note: string | null;
  }>;
};

/** Read the published event catalogue without changing any data or visibility. */
export async function readSportFixtures(
  sql: Sql,
  input: {
    sports: SportPage["sports"];
    surfaces: SportPage["surfaces"];
  } & SportFixtureSearch,
  today: string,
) {
  const q = input.q ? `%${input.q.replace(/[\\%_]/g, "\\$&")}%` : null;
  const page = input.page ?? 1;
  let country =
    input.country === "United Kingdom"
      ? [...UK_FIXTURE_COUNTRIES]
      : input.country
        ? [input.country]
        : null;
  const options = await sql.query<{ country: string | null; distance: string | null }>(
    `select distinct btrim(e.country) as country, btrim(ed.distance_code) as distance
     from events e join editions ed on ed.event_id = e.id
     where e.sport = any($1::text[]) and ed.event_date >= $2::date
       and ($3::text[] is null or e.surface = any($3::text[]))`,
    [[...input.sports], today, input.surfaces ? [...input.surfaces] : null],
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
    slug: string;
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
      json_agg(json_build_object('distance', ed.distance_code, 'time', ed.start_time, 'sourceUrl', ed.source_url)
        order by ed.start_time nulls last, ed.distance_code, ed.id)::text as starts_json
    from events e join editions ed on ed.event_id = e.id
    where e.sport = any($1::text[]) and ed.event_date >= $2::date
      and ($3::text is null or e.name ilike $3 or e.city ilike $3 or e.county ilike $3 or e.country ilike $3)
      and ($6::text[] is null or e.surface = any($6::text[]))
      and ($7::text[] is null or btrim(e.country) = any($7::text[]))
      and ($8::text[] is null or btrim(ed.distance_code) = any($8::text[]))
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
    distances,
    fixtures: rows.slice(0, SPORT_FIXTURE_PAGE_SIZE).map((row): SportFixture => {
      const detail = FIXTURE_DETAILS[`${row.slug}|${row.event_date}`];
      const starts = JSON.parse(row.starts_json) as Array<{
        distance: string;
        time: string | null;
        sourceUrl: string | null;
      }>;
      return {
        eventId: row.event_id,
        name: row.name,
        eventDate: row.event_date,
        town: detail?.place?.town ?? null,
        city: detail?.place?.city ?? row.city,
        county: detail?.place?.county ?? row.county,
        state: detail?.place?.state ?? null,
        country: canonicalCountry(row.country),
        website: publicHttpUrl(detail?.sourceUrl ?? row.website),
        summary: fixtureSummary(detail?.summary ?? row.summary, row.sport, row.city),
        timeZone: detail?.timeZone ?? fixtureTimeZone(row.country),
        starts: starts
          .map((start) => {
            const checked = detail?.starts[start.distance];
            const sourceUrl = publicHttpUrl(checked ? detail.sourceUrl : start.sourceUrl);
            // Legacy runABC imports contain UTC-shifted clocks and midnight
            // placeholders. Do not present those as race starts without a check.
            const legacyImport =
              sourceUrl && /(^|\.)runabc\.co\.uk$/i.test(new URL(sourceUrl).hostname);
            return {
              distance: start.distance,
              time: checked?.time ?? (sourceUrl && !legacyImport ? start.time : null),
              sourceUrl,
              checkedAt: checked ? detail.checkedAt : null,
              note: checked?.note ?? null,
            };
          })
          .sort(
            (a, b) =>
              (a.time ?? "99:99").localeCompare(b.time ?? "99:99") ||
              a.distance.localeCompare(b.distance),
          ),
      };
    }),
    hasMore: rows.length > SPORT_FIXTURE_PAGE_SIZE,
    page,
  };
}
