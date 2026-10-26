import { fixtureDistanceLabel } from "./fixture-distance-policy.ts";
import { unconfirmedFixtureEditionIds } from "./fixture-distance-policy.server.ts";
import { publicCatalogueContent } from "./public-catalogue-content.ts";
import type { Sql } from "../db";
import { fixtureTimeZone } from "./fixture-presentation";
import { resolveCountry } from "./countries";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import { eventSlugAliases } from "../../data/entry-options";
import { FIXTURE_DETAILS, isReviewedFixturePlaceholder } from "../../data/fixture-details";
import { withheldFixtureDateKeys } from "../../data/fixture-date-reviews";
import { ROAD_MARATHONS } from "../../data/road-marathons";
import { ROAD_HALF_MARATHONS } from "../../data/road-half-marathons";
import {
  buildRacePlaces,
  placePath,
  racePlacePage,
  type PlaceEdition,
  type PlaceRace,
} from "./race-places";
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
  options: { compact?: boolean; eventIds?: number[] } = {},
): Promise<PlaceRace[]> {
  if (options.eventIds?.length === 0) return [];
  const heldDistanceIds = await unconfirmedFixtureEditionIds(sql, now.slice(0, 10));
  // The shared index needs dates for filters and rollover, but not descriptions,
  // entry links or source links for every future edition in the world.
  // Tuples also avoid repeating JSON property names for recurring fixtures.
  type EditionTuple = [string, string, string, string | null, number | null];
  const endDate = `case when ed.end_source_url is not null and ed.end_checked_at is not null
          and ed.end_date >= ed.event_date then ed.end_date::text end`;
  const editionJson = options.compact
    ? `json_build_array(ed.event_date::text, ed.distance_code, ed.status, ${endDate}, ed.distance_km)`
    : `json_build_object(
        'date', ed.event_date::text, 'distance', ed.distance_code, 'distanceKm', ed.distance_km, 'status', ed.status, 'entryUrl', ed.entry_url,
        'startTime', ed.start_time, 'sourceUrl', ed.source_url, 'endDate', ${endDate})`;
  const rows = await sql.query<
    Omit<PlaceRace, "timeZone" | "editions"> & { editions: (PlaceEdition | EditionTuple)[] }
  >(
    `
    select e.id, e.slug, e.name, e.sport, e.country, e.county, e.region, e.city,
      ${options.compact ? "''::text" : "e.summary"} as summary, e.surface, (e.featured or exists (select 1 from event_groups g where g.event_id=e.id
        and g.level in ('major','final'))) as featured,
      array(select ed.distance_code from editions ed where ed.event_id=e.id
        and ed.status <> 'Cancelled' and ed.distance_code is not null
        union select distance_code from event_distances where event_id=e.id) as "distanceCodes",
      (select max(ed.event_date)::text from editions ed where ed.event_id=e.id
        and ed.event_date < $1::date and ed.status <> 'Cancelled') as "lastDate",
      coalesce((select json_agg(${editionJson}
        order by ed.event_date, ed.distance_code) from editions ed
      where ed.event_id=e.id and coalesce(ed.end_date, ed.event_date) >= $1::date - interval '2 days'
        and not (ed.id = any($5::int[]))
        and not ((coalesce(e.slug, '') || '|' || ed.event_date::text) = any($4::text[]))), '[]') as editions
    from events e where e.sport in ('Running','Athletics','Triathlon','Parkrun','Cycling','Swimming','Duathlon')
      ${options.eventIds ? "and e.id = any($6::int[])" : ""}
      and not (e.slug = any($2::text[]))
      and not exists (select 1 from jsonb_to_recordset($3::jsonb) a(old_slug text, current_slug text)
        join events target on target.slug = coalesce((select current_slug from slug_redirects
          where entity_type='event' and old_slug=a.current_slug), a.current_slug)
        where a.old_slug=e.slug and target.id<>e.id)
    order by e.id`,
    [
      now.slice(0, 10),
      retainedFixtureAliasSlugs,
      aliases,
      withheldFixtureDateKeys,
      heldDistanceIds,
      ...(options.eventIds ? [options.eventIds] : []),
    ],
  );
  return rows
    .map((race) => ({
      ...race,
      editions: race.editions
        .map((edition): PlaceEdition =>
          Array.isArray(edition)
            ? {
                date: edition[0],
                distance: edition[1],
                status: edition[2],
                endDate: edition[3],
                distanceKm: edition[4],
              }
            : edition,
        )
        .filter(
          (edition) => !isReviewedFixturePlaceholder(race.slug, edition.date, edition.distance),
        )
        .map((edition) => {
          const detail = FIXTURE_DETAILS[`${race.slug}|${edition.date}`];
          const checked = detail?.starts[edition.distance];
          return {
            ...edition,
            distance: fixtureDistanceLabel(edition.distance, edition.distanceKm),
            startTime: checked
              ? checked.time
              : edition.sourceUrl && !/runabc\.co\.uk/i.test(edition.sourceUrl)
                ? edition.startTime
                : null,
            startNote: checked?.note ?? null,
            startLabel: checked?.label ?? null,
            sourceUrl: checked?.sourceUrl ?? detail?.sourceUrl ?? edition.sourceUrl,
            checkedAt: detail?.checkedAt ?? null,
            checkedCity: detail?.place?.city ?? detail?.place?.town ?? null,
          };
        }),
      timeZone:
        checkedZones.get(race.slug) ??
        fixtureTimeZone(resolveCountry({ country: race.country }).name),
    }))
    .map(publicCatalogueContent);
}

/** One bounded metadata entry per instance. Failed reads never poison the cache.
 * This is public fixture metadata only; athlete privacy decisions are not cached.
 * Date visibility is still recalculated for every request, including midnight.
 */
export function createRacePlaceRowsCache(load: () => Promise<PlaceRace[]>, clock = Date.now) {
  let cached: { rows: PlaceRace[]; expires: number } | undefined;
  let pending: Promise<PlaceRace[]> | undefined;
  return async () => {
    if (cached && cached.expires > clock()) return cached.rows;
    if (!pending)
      pending = load()
        .then((rows) => {
          cached = { rows, expires: clock() + 5 * 60_000 };
          return rows;
        })
        .finally(() => {
          pending = undefined;
        });
    return pending;
  };
}

export const readRacePlaceRows = createRacePlaceRowsCache(async () => {
  const { ensureAthrecsSeeded } = await import("./seed.server");
  const { getSql } = await import("../db");
  await ensureAthrecsSeeded();
  return queryRacePlaceRows(await getSql(), new Date().toISOString(), { compact: true });
});

/** Fetch full descriptions and entry/start information only for visible cards.
 * Keep the complete date index: truncating it would silently break month,
 * distance, archive and timezone filtering. At most 43 event IDs per round.
 */
export async function queryRacePlacePage(
  sql: Sql,
  rows: readonly PlaceRace[],
  ...args: Parameters<typeof racePlacePage> extends [unknown, ...infer Rest] ? Rest : never
) {
  let current = rows;
  const loaded = new Set<number>();
  for (let attempt = 0; attempt <= 3; attempt++) {
    const page = racePlacePage(current, ...args);
    if (!page) return null;
    const overviewSlugs = new Set(page.overview.nextRaces.map((race) => race.slug));
    const ids = [
      ...new Set(
        [
          ...page.races,
          ...page.archivePreview,
          ...page.featuredRaces,
          ...current.filter((race) => overviewSlugs.has(race.slug)),
        ].map((race) => race.id),
      ),
    ].filter((id) => !loaded.has(id));
    if (!ids.length) return page;
    if (attempt === 3) break;
    const detailRows = await queryRacePlaceRows(sql, args[1], { eventIds: ids });
    const byId = new Map(detailRows.map((race) => [race.id, race]));
    ids.forEach((id) => loaded.add(id));
    // A removed or newly withheld event must not survive in the returned cards.
    current = current
      .filter((race) => !ids.includes(race.id) || byId.has(race.id))
      .map((race) => byId.get(race.id) ?? race);
  }
  throw new Error("Race listings changed during this request. Please retry.");
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
