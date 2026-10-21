import type { Sql } from "../db";
import { fixtureTimeZone } from "./fixture-presentation";
import { resolveCountry } from "./countries";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import { eventSlugAliases } from "../../data/entry-options";
import { FIXTURE_DETAILS, isReviewedFixturePlaceholder } from "../../data/fixture-details";
import { withheldFixtureDateKeys } from "../../data/fixture-date-reviews";
import { ROAD_MARATHONS } from "../../data/road-marathons";
import { ROAD_HALF_MARATHONS } from "../../data/road-half-marathons";
import { buildRacePlaces, placePath, type PlaceRace } from "./race-places";
import {
  PLACE_SPORTS,
  PLACE_TERRAINS,
  MIN_PLACE_FACET_RACES,
  matchesPlaceDistance,
  placeFacetSuffix,
  placeRaceDistanceCodes,
  distancesForPlaceSport,
} from "./race-place-facets";

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
      e.summary, e.surface, (e.featured or exists (select 1 from event_groups g where g.event_id=e.id
        and g.level in ('major','final'))) as featured,
      array(select ed.distance_code from editions ed where ed.event_id=e.id
        and ed.status <> 'Cancelled' and ed.distance_code is not null
        union select distance_code from event_distances where event_id=e.id) as "distanceCodes",
      (select max(ed.event_date)::text from editions ed where ed.event_id=e.id
        and ed.event_date < $1::date and ed.status <> 'Cancelled') as "lastDate",
      coalesce((select json_agg(json_build_object(
        'date', ed.event_date::text, 'distance', ed.distance_code, 'status', ed.status, 'entryUrl', ed.entry_url,
        'startTime', ed.start_time, 'sourceUrl', ed.source_url,
        'endDate', case when ed.end_source_url is not null and ed.end_checked_at is not null
          and ed.end_date >= ed.event_date then ed.end_date::text end
      ) order by ed.event_date, ed.distance_code) from editions ed
      where ed.event_id=e.id and coalesce(ed.end_date, ed.event_date) >= $1::date - interval '2 days'
        and not ((coalesce(e.slug, '') || '|' || ed.event_date::text) = any($4::text[]))), '[]') as editions
    from events e where e.sport in ('Running','Athletics','Triathlon','Parkrun','Cycling','Swimming','Duathlon')
      and not (e.slug = any($2::text[]))
      and not exists (select 1 from jsonb_to_recordset($3::jsonb) a(old_slug text, current_slug text)
        join events target on target.slug = coalesce((select current_slug from slug_redirects
          where entity_type='event' and old_slug=a.current_slug), a.current_slug)
        where a.old_slug=e.slug and target.id<>e.id)
    order by e.id`,
    [now.slice(0, 10), retainedFixtureAliasSlugs, aliases, withheldFixtureDateKeys],
  );
  return rows.map((race) => ({
    ...race,
    editions: race.editions
      .filter((edition) => !isReviewedFixturePlaceholder(race.slug, edition.date, edition.distance))
      .map((edition) => {
        const detail = FIXTURE_DETAILS[`${race.slug}|${edition.date}`];
        const checked = detail?.starts[edition.distance];
        return {
          ...edition,
          startTime: checked
            ? checked.time
            : edition.sourceUrl && !/runabc\.co\.uk/i.test(edition.sourceUrl)
              ? edition.startTime
              : null,
          startNote: checked?.note ?? null,
          sourceUrl: detail?.sourceUrl ?? edition.sourceUrl,
          checkedAt: detail?.checkedAt ?? null,
          checkedCity: detail?.place?.city ?? detail?.place?.town ?? null,
        };
      }),
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
  const byId = new Map(rows.map((race) => [race.id, race]));
  return [...buildRacePlaces(rows).values()].flatMap((place) => {
    if (!place.raceIds.length) return [];
    const path = placePath(place.key);
    const local = place.raceIds.map((id) => byId.get(id)!);
    const paths = [path];
    for (const sport of PLACE_SPORTS) {
      const scoped = local.filter((race) => race.sport === sport.sport);
      if (scoped.length < MIN_PLACE_FACET_RACES) continue;
      paths.push(path + placeFacetSuffix(sport, null));
      if (sport.slug === "running") {
        for (const terrain of PLACE_TERRAINS) {
          const matching = scoped.filter((race) => race.surface === terrain.surface);
          if (matching.length < MIN_PLACE_FACET_RACES) continue;
          paths.push(path + placeFacetSuffix(sport, null, terrain));
          for (const distance of distancesForPlaceSport(sport))
            if (
              matching.filter((race) =>
                placeRaceDistanceCodes(race).some((code) => matchesPlaceDistance(code, distance)),
              ).length >= MIN_PLACE_FACET_RACES
            )
              paths.push(path + placeFacetSuffix(sport, distance, terrain));
        }
      }
      for (const distance of distancesForPlaceSport(sport)) {
        if (
          scoped.filter((race) =>
            placeRaceDistanceCodes(race).some((code) => matchesPlaceDistance(code, distance)),
          ).length >= MIN_PLACE_FACET_RACES
        )
          paths.push(path + placeFacetSuffix(sport, distance));
      }
    }
    return paths;
  });
}
