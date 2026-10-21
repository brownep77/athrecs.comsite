import { resolveCountry, countryFromIso } from "./countries";
import { countrySlug } from "./country-sites";
import { collectionRegions } from "../race-collector/regions";
import { COUNTRY_CONTINENTS } from "../../data/country-continents";
import { raceLocalDate } from "../running/road-marathon-calendar";
import {
  PLACE_SPORTS,
  PLACE_TERRAINS,
  MIN_PLACE_FACET_RACES,
  matchesPlaceDistance,
  placeFacetSuffix,
  placeRaceDistanceCodes,
  resolvePlaceFacet,
  distancesForPlaceSport,
} from "./race-place-facets";
import { PLACE_RACE_GUIDANCE } from "./race-place-guides";

export const PLACE_ROOT = "/races/places";
export const PLACE_PAGE_SIZE = 30;
export const CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];
export type PlaceEdition = {
  date: string;
  endDate: string | null;
  status: string;
  distance: string;
  entryUrl?: string | null;
  startTime?: string | null;
  startNote?: string | null;
  startLabel?: string | null;
  sourceUrl?: string | null;
  checkedAt?: string | null;
  checkedCity?: string | null;
};
export type PlaceRace = {
  id: number;
  slug: string;
  name: string;
  sport: string;
  surface?: string;
  country: string;
  county: string;
  region: string | null;
  city: string;
  summary: string;
  featured: boolean;
  timeZone: string | null;
  editions: PlaceEdition[];
  distanceCodes?: string[];
  lastDate: string | null;
};
export type RacePlace = {
  key: string;
  name: string;
  kind: "world" | "continent" | "country" | "nation" | "region";
  parent: string | null;
  country?: string;
  raceIds: number[];
};
export const placePath = (key: string) => `${PLACE_ROOT}${key ? `/${key}` : ""}`;
const regionSlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
const clean = (value?: string | null) => {
  const text = value?.trim() ?? "";
  return /^(?:unknown|tbc|other|n\/?a|venue tbc|[-—])$/i.test(text) ? "" : text;
};

/** Exact administrative labels only; a city or venue is not a state. */
function raceRegion(race: PlaceRace, iso: string) {
  const regions = collectionRegions(iso);
  const value =
    iso === "GB" || iso === "IE"
      ? clean(race.county) || clean(race.region)
      : clean(race.region) || clean(race.county);
  if (!value) return "";
  if (regions.length) {
    const key = countrySlug(value);
    return (
      regions.find(
        (region) =>
          countrySlug(region.name) === key ||
          region.code.toLowerCase() === value.toLowerCase() ||
          region.code.split("-").at(-1)?.toLowerCase() === value.toLowerCase(),
      )?.name ?? ""
    );
  }
  // County is an established field in the UK/Ireland catalogue. Other countries
  // need an explicit region, because legacy county fields often contain venues.
  const result = iso === "GB" || iso === "IE" ? value : clean(race.region);
  // Historical imports sometimes put the venue into county. Retain those
  // races on their country page without creating a fictitious county page.
  if (
    /[,;]|\b(stadium|track|arena|athletics?|centre|center|university|sports? ground|racecourse|park|tvac)\b/i.test(
      result,
    )
  )
    return "";
  const country = resolveCountry({ country: result });
  return country.iso === "UN" && result.length <= 100 && !/[<>/\\]/.test(result) ? result : "";
}

export function buildRacePlaces(races: readonly PlaceRace[]) {
  const places = new Map<string, RacePlace>();
  const add = (
    key: string,
    name: string,
    kind: RacePlace["kind"],
    parent: string | null,
    country?: string,
  ) => {
    if (!places.has(key)) places.set(key, { key, name, kind, parent, country, raceIds: [] });
    return places.get(key)!;
  };
  add("", "World", "world", null);
  for (const continent of CONTINENTS) add(countrySlug(continent), continent, "continent", "");
  for (const [iso, continent] of Object.entries(COUNTRY_CONTINENTS)) {
    const country = countryFromIso(iso).name;
    const key = `${countrySlug(continent)}/${countrySlug(country)}`;
    add(key, country, "country", countrySlug(continent), country);
    for (const region of collectionRegions(iso))
      add(`${key}/${regionSlug(region.name)}`, region.name, "region", key, country);
  }
  const uk = "europe/united-kingdom";
  for (const nation of ["England", "Scotland", "Wales", "Northern Ireland"])
    add(`${uk}/${countrySlug(nation)}`, nation, "nation", uk, nation);
  for (const race of races) {
    const info = resolveCountry({ country: race.country });
    const continent = COUNTRY_CONTINENTS[info.iso];
    if (!continent) continue; // Unknown location is not evidence of a country.
    const country = countryFromIso(info.iso).name;
    const continentKey = countrySlug(continent);
    const countryKey = `${continentKey}/${countrySlug(country)}`;
    const ancestry = ["", continentKey, countryKey];
    let parent = countryKey;
    if (info.ukNation) {
      parent = `${countryKey}/${countrySlug(info.ukNation)}`;
      ancestry.push(parent);
    }
    const region = raceRegion(race, info.iso);
    if (region && regionSlug(region) !== parent.split("/").at(-1)) {
      const key = `${parent}/${regionSlug(region)}`;
      add(key, region, "region", parent, info.ukNation ?? country);
      ancestry.push(key);
      // Explicit counties within a named state/province get their own child page.
      // Do not reinterpret old venue-filled county fields as administrative areas.
      const county = clean(race.county);
      if (race.region && county !== region && /\b(county|parish|borough)$/i.test(county)) {
        const countyKey = `${key}/${regionSlug(county)}`;
        add(countyKey, county, "region", key, country);
        ancestry.push(countyKey);
      }
    }
    for (const key of ancestry) places.get(key)?.raceIds.push(race.id);
  }
  return places;
}

function isUpcomingEdition(edition: PlaceEdition, today: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(edition.date) &&
    Number.isFinite(Date.parse(edition.date)) &&
    new Date(edition.date).toISOString().slice(0, 10) === edition.date &&
    !["Cancelled", "Finished"].includes(edition.status) &&
    (edition.endDate ?? edition.date) >= today
  );
}

export function nextPlaceEdition(race: PlaceRace, now: string, localDate?: string) {
  // With no checked venue zone, retain the race until its date has ended
  // worldwide rather than expiring a US/Australian race on London's clock.
  const today = localDate ?? raceLocalDate(race.timeZone ?? "Etc/GMT+12", now);
  return (
    race.editions
      .filter((edition) => isUpcomingEdition(edition, today))
      .sort((a, b) => a.date.localeCompare(b.date) || a.distance.localeCompare(b.distance))[0] ??
    null
  );
}

export function racePlacePage(
  races: readonly PlaceRace[],
  key: string,
  now: string,
  page = 1,
  archive = false,
  filters: { month?: string; city?: string } = {},
) {
  const places = buildRacePlaces(races);
  const facet = resolvePlaceFacet(key, new Set(places.keys()));
  const place = facet ? places.get(facet.key) : null;
  if (!place || !facet || !Number.isSafeInteger(page) || page < 1) return null;
  const { sport, distance, terrain } = facet;
  const path = placePath(place.key) + placeFacetSuffix(sport, distance, terrain);
  const month =
    !archive && /^\d{4}-(0[1-9]|1[0-2])$/.test(filters.month ?? "") ? filters.month : undefined;
  const city = filters.city?.trim().slice(0, 100) || undefined;
  const ids = new Set(place.raceIds);
  const dates = new Map<string, string>();
  const localDate = (race: PlaceRace) => {
    const zone = race.timeZone ?? "Etc/GMT+12";
    if (!dates.has(zone)) dates.set(zone, raceLocalDate(zone, now));
    return dates.get(zone)!;
  };
  const located = races.filter((race) => ids.has(race.id));
  const matches = (race: PlaceRace) =>
    (!sport || race.sport === sport.sport) &&
    (!terrain || race.surface === terrain.surface) &&
    (!distance ||
      placeRaceDistanceCodes(race).some((code) => matchesPlaceDistance(code, distance)));
  const scoped = located.filter(matches).map((race) => {
    const editions = race.editions.filter((edition) =>
      matchesPlaceDistance(edition.distance, distance),
    );
    const eligible = editions.filter((edition) => isUpcomingEdition(edition, localDate(race)));
    const nextInView =
      eligible
        .filter(
          (edition) =>
            !month ||
            (edition.date.slice(0, 7) <= month &&
              (edition.endDate ?? edition.date).slice(0, 7) >= month),
        )
        .sort((a, b) => a.date.localeCompare(b.date) || a.distance.localeCompare(b.distance))[0] ??
      null;
    return {
      ...race,
      city: nextInView?.checkedCity ?? race.city,
      editions,
      next: nextPlaceEdition({ ...race, editions }, now, localDate(race)),
      nextInView,
      listedStarts: eligible.filter((edition) => nextInView && edition.date === nextInView.date),
      listedDistances: [
        ...new Set(
          eligible
            .filter((edition) => nextInView && edition.date === nextInView.date)
            .map((edition) => edition.distance),
        ),
      ],
      cancelledDate:
        race.editions
          .filter((edition) => edition.status === "Cancelled")
          .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null,
    };
  });
  const upcoming = scoped.filter((race) => race.next);
  const past = scoped.filter((race) => !race.next);
  const order = (a: (typeof scoped)[number], b: (typeof scoped)[number]) =>
    (a.next?.date ?? "9999").localeCompare(b.next?.date ?? "9999") || a.name.localeCompare(b.name);
  const inCity = (race: PlaceRace) =>
    !city || race.city.trim().toLocaleLowerCase("en-GB") === city.toLocaleLowerCase("en-GB");
  const visibleUpcoming = upcoming
    .filter((race) => race.nextInView && inCity(race))
    .map((race) => ({ ...race, next: race.nextInView }));
  const visiblePast = past.filter(inCity);
  const selected = (archive ? visiblePast : visibleUpcoming).sort(order);
  const pageCount = Math.max(1, Math.ceil(selected.length / PLACE_PAGE_SIZE));
  if (page > pageCount) return null;
  const summary = ({ raceIds, ...item }: RacePlace) => ({
    ...item,
    count: raceIds.filter((id) => scopedIds.has(id)).length,
    path: placePath(item.key) + placeFacetSuffix(sport, distance, terrain),
  });
  const scopedIds = new Set(scoped.map((race) => race.id));
  const ancestors: ReturnType<typeof summary>[] = [];
  let ancestor: RacePlace | undefined = place;
  while (ancestor) {
    ancestors.unshift({ ...summary(ancestor), path: placePath(ancestor.key) });
    ancestor = ancestor.parent === null ? undefined : places.get(ancestor.parent);
  }
  const card = ({
    editions: _editions,
    distanceCodes: _codes,
    nextInView: _next,
    ...race
  }: (typeof scoped)[number]) => race;
  // Count each event once per advertised running distance. A triathlon's run
  // leg must not turn into a claim that a standalone running race is available.
  const distanceCounts = new Map<string, number>();
  for (const race of visibleUpcoming.filter((item) => item.sport === "Running")) {
    const distances = new Set(
      race.editions
        .filter((edition) => isUpcomingEdition(edition, localDate(race)))
        .filter(
          (edition) =>
            !month ||
            (edition.date.slice(0, 7) <= month &&
              (edition.endDate ?? edition.date).slice(0, 7) >= month),
        )
        .map((edition) => edition.distance.trim())
        .filter(Boolean),
    );
    for (const distance of distances)
      distanceCounts.set(distance, (distanceCounts.get(distance) ?? 0) + 1);
  }
  const sportLinks = PLACE_SPORTS.map((item) => ({
    ...item,
    count: located.filter((race) => race.sport === item.sport).length,
    path: placePath(place.key) + placeFacetSuffix(item, null),
  })).filter((item) => item.count > 0);
  const distanceLinks = distancesForPlaceSport(sport)
    .map((item) => ({
      ...item,
      count: located.filter(
        (race) =>
          race.sport === (sport?.sport ?? "Running") &&
          (!terrain || race.surface === terrain.surface) &&
          placeRaceDistanceCodes(race).some((code) => matchesPlaceDistance(code, item)),
      ).length,
      path: placePath(place.key) + placeFacetSuffix(sport ?? PLACE_SPORTS[0], item, terrain),
    }))
    .filter((item) => item.count > 0);
  const monthCounts = new Map<string, number>();
  for (const race of upcoming) {
    const months = new Set<string>();
    for (const edition of race.editions.filter((item) =>
      isUpcomingEdition(item, localDate(race)),
    )) {
      const start = new Date(`${edition.date.slice(0, 7)}-01T00:00:00Z`);
      const end = (edition.endDate ?? edition.date).slice(0, 7);
      // Defensive bound for corrupt multi-day records; no unbounded UI options.
      for (let i = 0; i < 24 && start.toISOString().slice(0, 7) <= end; i++) {
        months.add(start.toISOString().slice(0, 7));
        start.setUTCMonth(start.getUTCMonth() + 1);
      }
    }
    for (const value of months) monthCounts.set(value, (monthCounts.get(value) ?? 0) + 1);
  }
  const cityCounts = new Map<string, number>();
  for (const race of archive ? past : upcoming) {
    const name = clean(race.city);
    if (name) cityCounts.set(name, (cityCounts.get(name) ?? 0) + 1);
  }
  const raceById = new Map(races.map((race) => [race.id, race]));
  const siblings =
    place.parent === null
      ? []
      : [...places.values()]
          .filter((item) => item.parent === place.parent && item.key !== place.key)
          .map((item) => ({
            ...item,
            count: item.raceIds.filter((id) => {
              const race = raceById.get(id);
              return race && matches(race);
            }).length,
            path: placePath(item.key) + placeFacetSuffix(sport, distance, terrain),
          }))
          .filter((item) => item.count > 0)
          .sort((a, b) => a.name.localeCompare(b.name));
  const breadcrumbs = terrain
    ? [
        { name: "Running", path: "/running" },
        { name: terrain.label, path: `/running/${terrain.slug}` },
        ...ancestors.map(({ name, path }) => ({
          name,
          path: path + placeFacetSuffix(sport, null, terrain),
        })),
      ]
    : ancestors.map(({ name, path }) => ({ name, path }));
  if (sport && !terrain)
    breadcrumbs.push({
      name: sport.label,
      path: placePath(place.key) + placeFacetSuffix(sport, null),
    });
  if (distance) breadcrumbs.push({ name: distance.label, path });
  const scopedSlugs = new Set(scoped.map((race) => race.slug));
  const nearbyCounties: Record<string, string[]> = {
    Norfolk: ["Suffolk", "Cambridgeshire", "Lincolnshire", "Essex"],
    Suffolk: ["Norfolk", "Essex", "Cambridgeshire"],
    Cambridgeshire: [
      "Norfolk",
      "Suffolk",
      "Lincolnshire",
      "Essex",
      "Bedfordshire",
      "Hertfordshire",
      "Northamptonshire",
    ],
    Essex: ["Suffolk", "Cambridgeshire", "Hertfordshire", "Norfolk"],
    Lincolnshire: [
      "Norfolk",
      "Cambridgeshire",
      "Nottinghamshire",
      "Leicestershire",
      "Rutland",
      "Northamptonshire",
    ],
  };
  // Curated nearby areas; other regional pages retain their more-areas navigation.
  const nearby = place.key.startsWith("europe/united-kingdom/england/")
    ? (nearbyCounties[place.name] ?? []).flatMap((name) => {
        const target = [...places.values()].find(
          (item) => item.parent === place.parent && item.name === name,
        );
        if (!target) return [];
        const count = target.raceIds.filter((id) => {
          const race = raceById.get(id);
          return race && matches(race);
        }).length;
        const query = new URLSearchParams();
        if (month) query.set("month", month);
        if (archive) query.set("view", "archive");
        return [
          {
            name,
            count,
            path:
              placePath(target.key) +
              placeFacetSuffix(sport, distance, terrain) +
              (query.size ? `?${query}` : ""),
          },
        ];
      })
    : [];
  return {
    place: { ...summary(place), path: placePath(place.key) },
    path,
    facet: { sport, distance, terrain },
    terrainLinks: PLACE_TERRAINS.map((item) => ({
      ...item,
      path: placePath(place.key) + placeFacetSuffix(PLACE_SPORTS[0], distance, item),
    })),
    indexable: scoped.length >= (sport ? MIN_PLACE_FACET_RACES : 1) && !archive && !month && !city,
    filters: { month, city },
    sportLinks,
    distanceLinks,
    nearby,
    breadcrumbs,
    guidance: !archive
      ? PLACE_RACE_GUIDANCE.filter(
          (item) =>
            item.place === place.key &&
            scopedSlugs.has(item.slug) &&
            item.validUntil >= now.slice(0, 10) &&
            (!sport || sport.slug === "running") &&
            matchesPlaceDistance(item.distance, distance),
        )
      : [],
    siblings: siblings.map(({ name, path, count }) => ({ name, path, count })),
    months: [...monthCounts]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, count })),
    cities: [...cityCounts]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, count })),
    ancestors,
    children: [...places.values()]
      .filter((child) => child.parent === place.key)
      .map(summary)
      .filter((child) => !sport || child.count > 0)
      .sort((a, b) => Number(b.count > 0) - Number(a.count > 0) || a.name.localeCompare(b.name)),
    races: selected.slice((page - 1) * PLACE_PAGE_SIZE, page * PLACE_PAGE_SIZE).map(card),
    archivePreview:
      !archive && page === 1 ? [...visiblePast].sort(order).slice(0, 6).map(card) : [],
    featuredRaces:
      !archive && page === 1
        ? [...visibleUpcoming]
            .filter((race) => race.featured)
            .sort(order)
            .slice(0, 4)
            .map(card)
        : [],
    upcomingCount: visibleUpcoming.length,
    archiveCount: visiblePast.length,
    featuredCount: visibleUpcoming.filter((race) => race.featured).length,
    total: scoped.length,
    overview: {
      sports: [...new Set(scoped.map((race) => race.sport))].sort(),
      distances: [...distanceCounts].map(([code, count]) => ({ code, count })),
      nextRaces: [...visibleUpcoming]
        .sort((a, b) => a.next!.date.localeCompare(b.next!.date) || a.name.localeCompare(b.name))
        .slice(0, 3)
        .map(({ name, slug, next }) => ({ name, slug, next: next! })),
    },
    page,
    pageCount,
    archive,
    now,
  };
}

export type RacePlacePageData = NonNullable<ReturnType<typeof racePlacePage>>;
