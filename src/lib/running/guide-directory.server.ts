import { ROAD_HALF_MARATHONS } from "@/data/road-half-marathons";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";
import { ROAD_MARATHONS } from "@/data/road-marathons";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import type { MarathonCountryGuide, RoadRace } from "@/data/road-marathons/types";
import { raceGroupDefinitions, raceGroupMemberships } from "@/data/race-collections";
import { SUPERHALFS_CHECKED_AT, SUPERHALFS_PATH } from "@/data/superhalfs";
import { RUNNING_SERIES_GUIDES } from "@/data/running-series-guides";
import { runningSeriesGuidePath } from "./series-guides";
import { COUNTRY_SITES, countryHomePath } from "@/lib/athrecs/country-sites";
import { ROAD_GUIDE_TEMPLATE_MODIFIED } from "./guide-modified";
import {
  RUNNING_GUIDES_MODIFIED,
  type RunningGuideCountry,
  type RunningGuideCountryLink,
  type RunningGuideDirectory,
  type RunningGuideDistance,
  type RunningGuideRecord,
  type RunningGuideSeries,
} from "./guide-directory";
import { ROAD_ULTRAS, ULTRA_CHECKED, ULTRA_GUIDE_PATH, ultraPath } from "./road-ultras";

/**
 * Call inside a createServerFn handler. Keeping the full guide registries in this
 * module prevents course notes, edition histories and source arrays reaching the
 * directory's client bundle or loader payload.
 */
export async function getRunningGuideDirectory(): Promise<RunningGuideDirectory> {
  const countryDefinitions = new Map(
    [...HALF_MARATHON_COUNTRIES, ...MARATHON_COUNTRIES].map((country) => [country.id, country]),
  );

  function compactRoadGuide(race: RoadRace, distance: RunningGuideDistance): RunningGuideRecord {
    const country = countryDefinitions.get(race.country);
    if (!country) throw new Error(`Missing running guide country: ${race.country}`);
    return {
      id: `${distance}:${race.slug}`,
      name: race.name,
      path: `/running/races/${race.slug}`,
      countryId: country.id,
      countryName: country.name,
      countryCode: country.countryCode,
      distance,
      location: [...new Set([race.city, race.region, race.nation].filter(Boolean))].join(", "),
    };
  }

  const uk = countryDefinitions.get("uk");
  if (!uk) throw new Error("Missing UK country definition for the road ultra guides");
  const guides: RunningGuideRecord[] = [
    ...ROAD_HALF_MARATHONS.map((race) => compactRoadGuide(race, "half-marathon")),
    ...ROAD_MARATHONS.map((race) => compactRoadGuide(race, "marathon")),
    ...ROAD_ULTRAS.map((race) => ({
      id: `ultra:${race.slug}`,
      name: race.name,
      path: ultraPath(race.slug),
      countryId: uk.id,
      countryName: uk.name,
      countryCode: uk.countryCode,
      distance: "ultra" as const,
      location: race.location,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name, "en"));

  const counts = new Map<string, number>();
  for (const guide of guides) {
    const key = `${guide.countryId}:${guide.distance}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const countryLinks = new Map<string, RunningGuideCountryLink[]>();
  function addCountryGuide(country: MarathonCountryGuide, distance: RunningGuideDistance) {
    const links = countryLinks.get(country.id) ?? [];
    links.push({
      name: `${country.name} ${distance === "half-marathon" ? "half marathons" : "marathons"}`,
      path: `/running/${country.guide}`,
      distance,
      count: counts.get(`${country.id}:${distance}`) ?? 0,
    });
    countryLinks.set(country.id, links);
  }
  HALF_MARATHON_COUNTRIES.forEach((country) => addCountryGuide(country, "half-marathon"));
  MARATHON_COUNTRIES.forEach((country) => addCountryGuide(country, "marathon"));
  countryLinks.get("uk")!.push({
    name: "United Kingdom road ultramarathons",
    path: ULTRA_GUIDE_PATH,
    distance: "ultra",
    count: counts.get("uk:ultra") ?? 0,
  });

  const countries: RunningGuideCountry[] = [...countryDefinitions.values()].map((country) => {
    const links = countryLinks.get(country.id) ?? [];
    return {
      id: country.id,
      name: country.name,
      countryCode: country.countryCode,
      regionLabel: country.regionLabel,
      links,
      count: links.reduce((total, link) => total + link.count, 0),
    };
  });

  // Keep introductory descriptions evergreen: membership and qualification rules
  // belong to the linked series guide and its organiser sources.
  const seriesDescriptions: Record<string, string> = {
    "world-marathon-majors":
      "Explore the major city marathons and follow their race guides for courses, entry routes and practical information.",
    "utmb-world-series":
      "Find UTMB World Series trail events and compare the races, locations and entry information in the collection.",
    "utmb-index":
      "Browse the UTMB Index race collection and check the recorded edition and organiser information for each event.",
  };
  const series: RunningGuideSeries[] = [
    {
      id: "superhalfs",
      name: "SuperHalfs",
      path: SUPERHALFS_PATH,
      description:
        "Compare the SuperHalfs half marathons, entry routes, course previews and race-day information for amateur, club and elite runners.",
      kind: "series",
    },
    ...raceGroupDefinitions.map((group) => ({
      id: group.code,
      name: group.name,
      path: `/running/race-series#${group.code}`,
      description: seriesDescriptions[group.code] ?? group.description,
      kind: group.code === "utmb-index" ? ("collection" as const) : ("series" as const),
    })),
    ...RUNNING_SERIES_GUIDES.map((guide) => ({
      id: guide.slug,
      name: guide.name,
      path: runningSeriesGuidePath(guide.slug),
      description: guide.shortDescription,
      kind: guide.kind,
    })),
  ];

  const portals = COUNTRY_SITES.map((site) => ({
    name: site.country,
    flag: site.flag,
    path: countryHomePath(site, "en"),
  })).sort((left, right) => left.name.localeCompare(right.name, "en"));

  const modifiedAt = [
    RUNNING_GUIDES_MODIFIED,
    ROAD_GUIDE_TEMPLATE_MODIFIED,
    SUPERHALFS_CHECKED_AT,
    ULTRA_CHECKED,
    ...ROAD_MARATHONS.map((race) => race.checkedAt),
    ...ROAD_HALF_MARATHONS.map((race) => race.checkedAt),
    ...raceGroupMemberships.map((membership) => membership.checkedAt),
    ...RUNNING_SERIES_GUIDES.map((guide) => guide.checkedAt),
  ]
    .sort()
    .at(-1)!;

  return { guides, countries, series, portals, modifiedAt, totalGuides: guides.length };
}
