import { resolveCountry, countryFromIso } from "./countries";
import { countrySlug } from "./country-sites";
import { collectionRegions } from "../race-collector/regions";
import { COUNTRY_CONTINENTS } from "../../data/country-continents";
import { raceLocalDate } from "../running/road-marathon-calendar";

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
};
export type PlaceRace = {
  id: number;
  slug: string;
  name: string;
  sport: string;
  country: string;
  county: string;
  region: string | null;
  city: string;
  summary: string;
  featured: boolean;
  timeZone: string | null;
  editions: PlaceEdition[];
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
) {
  const places = buildRacePlaces(races);
  const place = places.get(key);
  if (!place || !Number.isSafeInteger(page) || page < 1) return null;
  const ids = new Set(place.raceIds);
  const dates = new Map<string, string>();
  const localDate = (race: PlaceRace) => {
    const zone = race.timeZone ?? "Etc/GMT+12";
    if (!dates.has(zone)) dates.set(zone, raceLocalDate(zone, now));
    return dates.get(zone)!;
  };
  const scoped = races
    .filter((race) => ids.has(race.id))
    .map((race) => ({
      ...race,
      next: nextPlaceEdition(race, now, localDate(race)),
      cancelledDate:
        race.editions
          .filter((edition) => edition.status === "Cancelled")
          .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null,
    }));
  const upcoming = scoped.filter((race) => race.next);
  const past = scoped.filter((race) => !race.next);
  const order = (a: (typeof scoped)[number], b: (typeof scoped)[number]) =>
    Number(b.featured) - Number(a.featured) ||
    (a.next?.date ?? "9999").localeCompare(b.next?.date ?? "9999") ||
    a.name.localeCompare(b.name);
  const selected = (archive ? past : upcoming).sort(order);
  const pageCount = Math.max(1, Math.ceil(selected.length / PLACE_PAGE_SIZE));
  if (page > pageCount) return null;
  const summary = ({ raceIds, ...item }: RacePlace) => ({
    ...item,
    count: raceIds.length,
    path: placePath(item.key),
  });
  const ancestors: ReturnType<typeof summary>[] = [];
  let ancestor: RacePlace | undefined = place;
  while (ancestor) {
    ancestors.unshift(summary(ancestor));
    ancestor = ancestor.parent === null ? undefined : places.get(ancestor.parent);
  }
  const card = ({ editions: _editions, ...race }: (typeof scoped)[number]) => race;
  // Count each event once per advertised running distance. A triathlon's run
  // leg must not turn into a claim that a standalone running race is available.
  const distanceCounts = new Map<string, number>();
  for (const race of upcoming.filter((item) => item.sport !== "Triathlon")) {
    const distances = new Set(
      race.editions
        .filter((edition) => isUpcomingEdition(edition, localDate(race)))
        .map((edition) => edition.distance.trim())
        .filter(Boolean),
    );
    for (const distance of distances)
      distanceCounts.set(distance, (distanceCounts.get(distance) ?? 0) + 1);
  }
  return {
    place: summary(place),
    ancestors,
    children: [...places.values()]
      .filter((child) => child.parent === key)
      .map(summary)
      .sort((a, b) => Number(b.count > 0) - Number(a.count > 0) || a.name.localeCompare(b.name)),
    races: selected.slice((page - 1) * PLACE_PAGE_SIZE, page * PLACE_PAGE_SIZE).map(card),
    archivePreview: !archive && !upcoming.length ? past.sort(order).slice(0, 6).map(card) : [],
    upcomingCount: upcoming.length,
    archiveCount: past.length,
    featuredCount: scoped.filter((race) => race.featured).length,
    total: scoped.length,
    overview: {
      sports: [...new Set(scoped.map((race) => race.sport))].sort(),
      distances: [...distanceCounts].map(([code, count]) => ({ code, count })),
      nextRaces: [...upcoming]
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
