import type { Sql } from "../db";
import type { SportFixtureSearch, SportPage } from "./sport-pages";
import { publicHttpUrl, UK_FIXTURE_COUNTRIES } from "./sport-pages.ts";
import { kmFromDistanceCode } from "./distance.ts";

export const SPORT_FIXTURE_PAGE_SIZE = 24;

export type SportFixture = {
  eventId: number;
  name: string;
  eventDate: string;
  city: string | null;
  country: string | null;
  website: string | null;
  starts: Array<{ distance: string; time: string | null }>;
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
  const country =
    input.country === "United Kingdom"
      ? [...UK_FIXTURE_COUNTRIES]
      : input.country
        ? [input.country]
        : null;
  const [rows, options] = await Promise.all([
    sql.query<{
      event_id: number;
      name: string;
      event_date: string;
      city: string | null;
      country: string | null;
      website: string | null;
      starts_json: string;
    }>(
      `
    select e.id as event_id, e.name, ed.event_date::text as event_date,
      e.city, e.country, e.website,
      json_agg(json_build_object('distance', ed.distance_code, 'time', ed.start_time)
        order by ed.start_time nulls last, ed.distance_code, ed.id)::text as starts_json
    from events e join editions ed on ed.event_id = e.id
    where e.sport = any($1::text[]) and ed.event_date >= $2::date
      and ($3::text is null or e.name ilike $3 or e.city ilike $3 or e.country ilike $3)
      and ($6::text[] is null or e.surface = any($6::text[]))
      and ($7::text[] is null or btrim(e.country) = any($7::text[]))
      and ($8::text is null or btrim(ed.distance_code) = $8)
    group by e.id, e.name, ed.event_date, e.city, e.country, e.website
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
        input.distance ?? null,
      ],
    ),
    sql.query<{ country: string | null; distance: string | null }>(
      `select distinct btrim(e.country) as country, btrim(ed.distance_code) as distance
     from events e join editions ed on ed.event_id = e.id
     where e.sport = any($1::text[]) and ed.event_date >= $2::date
       and ($3::text[] is null or e.surface = any($3::text[]))`,
      [[...input.sports], today, input.surfaces ? [...input.surfaces] : null],
    ),
  ]);
  // Options cover the whole upcoming sport catalogue, not just the current page
  // or selection, so changing one filter never traps the visitor in another.
  const countries = new Set(
    options.map((row) => row.country).filter((value): value is string => !!value),
  );
  if (UK_FIXTURE_COUNTRIES.some((value) => countries.has(value))) countries.add("United Kingdom");
  const distances = [
    ...new Set(options.map((row) => row.distance).filter((value): value is string => !!value)),
  ];
  distances.sort(
    (a, b) =>
      (kmFromDistanceCode(a) ?? Infinity) - (kmFromDistanceCode(b) ?? Infinity) ||
      a.localeCompare(b, "en", { numeric: true }),
  );
  return {
    countries: [...countries].sort((a, b) => a.localeCompare(b, "en")),
    distances,
    fixtures: rows.slice(0, SPORT_FIXTURE_PAGE_SIZE).map((row): SportFixture => ({
      eventId: row.event_id,
      name: row.name,
      eventDate: row.event_date,
      city: row.city,
      country: row.country,
      website: publicHttpUrl(row.website),
      starts: JSON.parse(row.starts_json) as SportFixture["starts"],
    })),
    hasMore: rows.length > SPORT_FIXTURE_PAGE_SIZE,
    page,
  };
}
