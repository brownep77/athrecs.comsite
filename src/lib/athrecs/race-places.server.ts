import type { Sql } from "../db";
import { fixtureTimeZone } from "./fixture-presentation";
import { resolveCountry } from "./countries";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import { eventSlugAliases } from "../../data/entry-options";
import { ROAD_MARATHONS } from "../../data/road-marathons";
import { ROAD_HALF_MARATHONS } from "../../data/road-half-marathons";
import { buildRacePlaces, placePath, type PlaceRace } from "./race-places";

const checkedZones = new Map(
  [...ROAD_MARATHONS, ...ROAD_HALF_MARATHONS].map((race) => [race.slug, race.timeZone]),
);
const aliases = JSON.stringify(
  Object.entries(eventSlugAliases).map(([old_slug, current_slug]) => ({ old_slug, current_slug })),
);

/** Public event data only. No athlete, account, results or staff tables are read. */
export async function queryRacePlaceRows(
  sql: Sql,
  now = new Date().toISOString(),
): Promise<PlaceRace[]> {
  const rows = await sql.query<Omit<PlaceRace, "timeZone">>(
    `
    select e.id, e.slug, e.name, e.sport, e.country, e.county, e.region, e.city,
      e.summary, (e.featured or exists (select 1 from event_groups g where g.event_id=e.id
        and g.level in ('major','final'))) as featured,
      (select max(ed.event_date)::text from editions ed where ed.event_id=e.id
        and ed.event_date < $1::date and ed.status <> 'Cancelled') as "lastDate",
      coalesce((select json_agg(json_build_object(
        'date', ed.event_date::text, 'distance', ed.distance_code, 'status', ed.status,
        'endDate', case when ed.end_source_url is not null and ed.end_checked_at is not null
          and ed.end_date >= ed.event_date then ed.end_date::text end
      ) order by ed.event_date, ed.distance_code) from editions ed
      where ed.event_id=e.id and coalesce(ed.end_date, ed.event_date) >= $1::date - interval '2 days'), '[]') as editions
    from events e where e.sport in ('Running','Athletics','Triathlon')
      and not (e.slug = any($2::text[]))
      and not exists (select 1 from jsonb_to_recordset($3::jsonb) a(old_slug text, current_slug text)
        join events target on target.slug = coalesce((select current_slug from slug_redirects
          where entity_type='event' and old_slug=a.current_slug), a.current_slug)
        where a.old_slug=e.slug and target.id<>e.id)
    order by e.id`,
    [now.slice(0, 10), retainedFixtureAliasSlugs, aliases],
  );
  return rows.map((race) => ({
    ...race,
    timeZone:
      checkedZones.get(race.slug) ??
      fixtureTimeZone(resolveCountry({ country: race.country }).name),
  }));
}

let cached: { rows: PlaceRace[]; expires: number } | undefined;
let pending: Promise<PlaceRace[]> | undefined;

/** Short metadata cache; date visibility is recalculated on every request. */
export async function readRacePlaceRows() {
  if (cached && cached.expires > Date.now()) return cached.rows;
  if (!pending)
    pending = (async () => {
      const { ensureAthrecsSeeded } = await import("./seed.server");
      const { getSql } = await import("../db");
      await ensureAthrecsSeeded();
      const rows = await queryRacePlaceRows(await getSql());
      cached = { rows, expires: Date.now() + 60_000 };
      return rows;
    })().finally(() => {
      pending = undefined;
    });
  return pending;
}

export function racePlaceSitemapPaths(rows: readonly PlaceRace[]) {
  return [...buildRacePlaces(rows).values()]
    .filter((place) => place.raceIds.length > 0)
    .map((place) => placePath(place.key));
}
