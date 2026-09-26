import type { Sql } from "../db";
import type { SportPage } from "./sport-pages";
import { publicHttpUrl } from "./sport-pages.ts";

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
  input: { sport: SportPage["sport"]; q?: string; page?: number },
  today: string,
) {
  const q = input.q ? `%${input.q.replace(/[\\%_]/g, "\\$&")}%` : null;
  const page = input.page ?? 1;
  const rows = await sql.query<{
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
    where e.sport = $1 and ed.event_date >= $2::date
      and ($3::text is null or e.name ilike $3 or e.city ilike $3 or e.country ilike $3)
    group by e.id, e.name, ed.event_date, e.city, e.country, e.website
    order by ed.event_date, e.name, e.id
    limit $4 offset $5
  `,
    [input.sport, today, q, SPORT_FIXTURE_PAGE_SIZE + 1, (page - 1) * SPORT_FIXTURE_PAGE_SIZE],
  );
  return {
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
