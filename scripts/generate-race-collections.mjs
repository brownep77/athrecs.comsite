#!/usr/bin/env node

/**
 * Refresh official race-series data used by Athrecs.
 *
 * Sources:
 * - Abbott World Marathon Majors: existing canonical Athrecs race pages.
 * - UTMB World Series: the current official event switcher on utmb.world.
 * - UTMB Index: individually verified official race pages. Index status is
 *   edition-specific, so the checked edition is retained in the note.
 */

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const checkedAt = process.argv.find((arg) => arg.startsWith("--checked-at="))?.split("=")[1]
  ?? new Date().toISOString().slice(0, 10);
const outputPath = resolve("src/data/race-collections.ts");

const WORLD_MARATHON_MAJORS = [
  ["tokyo-marathon", "Tokyo Marathon"],
  ["boston-marathon", "Boston Marathon"],
  ["london-marathon", "London Marathon"],
  ["sydney-marathon", "Sydney Marathon"],
  ["berlin-marathon", "Berlin Marathon"],
  ["chicago-marathon", "Chicago Marathon"],
  ["new-york-city-marathon", "New York City Marathon"],
  ["sanlam-cape-town-marathon", "Sanlam Cape Town Marathon"],
];

const UTMB_MAJOR_TENANTS = new Set(["kodiak", "chiangmai", "uta", "valdaran"]);

const UTMB_INDEX_RACES = [
  {
    slug: "isle-of-wight-challenge",
    name: "Isle of Wight Challenge",
    country: "England",
    county: "Isle of Wight",
    city: "Chale",
    area: "Chale Recreation Ground",
    date: "2026-05-02",
    distances: ["100K", "Ultra"],
    category: "100K",
    distanceKm: 106,
    sourceUrl: "https://utmb.world/utmb-index/races/3026.isleofwightchallengeisleofwightchallenge.2026",
    note: "The 2026 Isle of Wight Challenge was verified as a UTMB Index 100K race.",
  },
  {
    slug: "centurion-sea-to-sea",
    name: "Centurion Sea to Sea",
    country: "England",
    county: "Cumbria",
    city: "St Bees",
    area: "St Bees",
    date: "2026-03-28",
    distances: ["100M", "Ultra"],
    category: "100M",
    distanceKm: 292,
    sourceUrl: "https://utmb.world/utmb-index/races/60852.centurionseatosea300kmcenturionseatosea300km2026.2026",
    note: "The 2026 Centurion Sea to Sea was verified as a UTMB Index 100M race.",
  },
  {
    slug: "london-winter-walk",
    name: "London Winter Walk",
    country: "England",
    county: "Greater London",
    city: "London",
    area: "London",
    date: "2026-01-24",
    distances: ["20K", "Half", "Marathon"],
    category: "20K",
    distanceKm: 21,
    sourceUrl: "https://utmb.world/utmb-index/races/39402.londonwinterwalkhalfmarathon-eastloopsaturday.2026",
    note: "The 2026 London Winter Walk included verified UTMB Index 20K-category races.",
  },
  {
    slug: "waterville-trail-running-festival",
    name: "Waterville Trail Running Festival",
    country: "Ireland",
    county: "Kerry",
    city: "Waterville",
    area: "Waterville",
    date: "2026-05-03",
    distances: ["50K", "Ultra"],
    category: "50K",
    distanceKm: 43.3,
    sourceUrl: "https://utmb.world/utmb-index/races/19821.watervilletrailrunningfestivalwtf43km.2026",
    note: "The 2026 Waterville Trail Running Festival 43 km race was verified in the UTMB Index 50K category.",
  },
  {
    slug: "peak-district-challenge",
    name: "Peak District Challenge",
    country: "England",
    county: "Derbyshire",
    city: "Bakewell",
    area: "Bakewell Showground",
    date: "2026-07-04",
    distances: ["100K", "Ultra"],
    category: "100K",
    distanceKm: 100.7,
    sourceUrl: "https://utmb.world/utmb-index/races/17127.peakdistrictchallengepeakdistrictchallenge-100km.2026",
    note: "The 2026 Peak District Challenge 100 km race was verified in the UTMB Index 100K category.",
  },
  {
    slug: "green-gateways",
    name: "Green Gateways",
    country: "England",
    county: "West Yorkshire",
    city: "Otley",
    area: "Otley",
    date: "2026-01-17",
    distances: ["20K", "Ultra"],
    category: "20K",
    distanceKm: 31.5,
    sourceUrl: "https://utmb.world/utmb-index/races/30395.greengatewaysgreengateways20miletrailrace.2026",
    note: "The 2026 Green Gateways 20 Mile Trail Race was verified in the UTMB Index 20K category.",
  },
  {
    slug: "thunder-races",
    name: "Thunder Races",
    country: "England",
    county: "Bedfordshire",
    city: "Bedford",
    area: "Bedford",
    date: "2026-03-07",
    distances: ["50K", "Ultra"],
    category: "50K",
    distanceKm: 50,
    sourceUrl: "https://utmb.world/utmb-index/races/48742.thunderracesthunderraces.2026",
    note: "The 2026 Thunder Races event was verified in the UTMB Index 50K category.",
  },
  {
    slug: "race-to-the-king",
    name: "Race to the King",
    country: "England",
    county: "West Sussex",
    city: "West Dean",
    area: "West Dean Estate",
    date: "2026-06-20",
    distances: ["100K", "Ultra"],
    category: "100K",
    distanceKm: 102.7,
    sourceUrl: "https://utmb.world/utmb-index/races/31294.racetothekingracetotheking-100k.2026",
    note: "The 2026 Race to the King 100 km race was verified in the UTMB Index 100K category.",
  },
  {
    slug: "centurion-thames-path-100",
    name: "Centurion Thames Path 100",
    country: "England",
    county: "Greater London",
    city: "London",
    area: "Thames Path",
    date: "2026-05-02",
    distances: ["100M", "Ultra"],
    category: "100M",
    distanceKm: 161.3,
    sourceUrl: "https://utmb.world/utmb-index/races/1026.centurionthamespath100centurionthamespath100.2026",
    note: "The 2026 Centurion Thames Path 100 was verified in the UTMB Index 100M category.",
  },
];

function nextDataFromHtml(html) {
  const marker = '<script id="__NEXT_DATA__" type="application/json">';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error("UTMB __NEXT_DATA__ was not found");
  const bodyStart = start + marker.length;
  const end = html.indexOf("</script>", bodyStart);
  if (end < 0) throw new Error("UTMB __NEXT_DATA__ closing tag was not found");
  return JSON.parse(html.slice(bodyStart, end));
}

function normalizeCountry(country) {
  return {
    "United States of America": "United States",
    "Chinese Taipei": "Taiwan",
    "Hong Kong, China": "Hong Kong",
  }[country] ?? country;
}

function categoriesFor(event) {
  const mapped = (event.raceCategories ?? [])
    .map((category) => ({ ws20KM: "20K", ws50KM: "50K", ws100KM: "100K", ws100M: "100M" })[category])
    .filter(Boolean);
  return [...new Set([...mapped, "Ultra"])];
}

function ts(value) {
  return JSON.stringify(value, null, 2);
}

const response = await fetch("https://utmb.world/en/index-races");
if (!response.ok) throw new Error(`UTMB calendar request failed: ${response.status}`);
const html = await response.text();
const nextData = nextDataFromHtml(html);
const utmbEvents = nextData.props.pageProps.eventsTopBar
  .filter((event) => event.tenant !== "ext-western100" && /\.utmb\.world\/?$/i.test(event.url))
  .map((event) => ({
    ...event,
    slug: `utmb-world-series-${event.tenant}`,
    country: normalizeCountry(event.country),
    city: event.placeName?.trim() || event.country,
    distances: categoriesFor(event),
  }));

const raceCollectionSeries = [
  ...utmbEvents.map((event) => ({
    slug: event.slug,
    name: event.title.trim(),
    sport: "Running",
    country: event.country,
    county: event.city,
    city: event.city,
    area: event.city,
    surface: "Trail",
    distances: event.distances,
    summary: `${event.title.trim()} — an official UTMB World Series ${event.tenant === "montblanc" ? "Final" : UTMB_MAJOR_TENANTS.has(event.tenant) ? "Major" : "Event"}.`,
    description: `Official UTMB World Series event in ${event.city}, ${event.country}. Check the organiser page for the individual races, mandatory kit, entry requirements and current Running Stones information.`,
    organiser: "UTMB World Series / local organiser",
    website: event.url,
    featured: event.tenant === "montblanc" || UTMB_MAJOR_TENANTS.has(event.tenant),
    source_url: event.url,
  })),
  ...UTMB_INDEX_RACES.map((event) => ({
    slug: event.slug,
    name: event.name,
    sport: "Running",
    country: event.country,
    county: event.county,
    city: event.city,
    area: event.area,
    surface: "Trail",
    distances: event.distances,
    summary: `${event.name} — a verified UTMB Index race for the 2026 edition.`,
    description: `${event.note} UTMB Index races contribute to a runner's UTMB Index but do not award Running Stones. Confirm the status of each future edition with the organiser and UTMB.`,
    organiser: "See official organiser / UTMB Index",
    website: event.sourceUrl,
    featured: false,
    source_url: event.sourceUrl,
  })),
];

const raceCollectionEditions = [
  ...utmbEvents
    .filter((event) => event.dateBegin)
    .map((event) => ({
      seriesSlug: event.slug,
      date: event.dateBegin,
      distance: "Ultra",
      distanceKm: 0,
      status: "Open",
      entryUrl: event.url,
      source: event.url,
      notes: event.dateEnd && event.dateEnd !== event.dateBegin
        ? `Event weekend ${event.dateBegin} to ${event.dateEnd}. See the official event for individual race dates.`
        : "See the official event for individual race dates.",
    })),
  ...UTMB_INDEX_RACES.map((event) => ({
    seriesSlug: event.slug,
    date: event.date,
    distance: event.category,
    distanceKm: event.distanceKm,
    status: "Finished",
    entryUrl: event.sourceUrl,
    source: event.sourceUrl,
    notes: event.note,
  })),
];

const raceGroupMemberships = [
  ...WORLD_MARATHON_MAJORS.map(([seriesSlug, name]) => ({
    seriesSlug,
    groupCode: "world-marathon-majors",
    label: "World Marathon Major",
    level: "major",
    sourceUrl: "https://www.worldmarathonmajors.com/",
    checkedAt,
    note: `${name} is one of the eight current Abbott World Marathon Majors.`,
  })),
  ...utmbEvents.map((event) => {
    const level = event.tenant === "montblanc"
      ? "final"
      : UTMB_MAJOR_TENANTS.has(event.tenant)
        ? "major"
        : "event";
    const label = level === "final"
      ? "UTMB World Series Final"
      : level === "major"
        ? "UTMB World Series Major"
        : "UTMB World Series Event";
    return {
      seriesSlug: event.slug,
      groupCode: "utmb-world-series",
      label,
      level,
      sourceUrl: event.url,
      checkedAt,
      note: level === "major"
        ? "Official UTMB World Series Major; finishers earn double the normal Running Stones for their race category."
        : level === "final"
          ? "Part of HOKA UTMB Mont-Blanc, home of the OCC, CCC and UTMB World Series Finals."
          : "Official UTMB World Series Event; eligible finishers can earn Running Stones and record a UTMB Index result.",
    };
  }),
  ...UTMB_INDEX_RACES.map((event) => ({
    seriesSlug: event.slug,
    groupCode: "utmb-index",
    label: "UTMB Index race",
    level: "index",
    sourceUrl: event.sourceUrl,
    checkedAt,
    note: `${event.note} It does not award Running Stones.`,
  })),
];

const raceGroupDefinitions = [
  {
    code: "world-marathon-majors",
    name: "Abbott World Marathon Majors",
    shortName: "World Marathon Majors",
    description: "The eight current Abbott World Marathon Majors: Tokyo, Boston, London, Sydney, Berlin, Chicago, New York City and Cape Town.",
    qualificationNote: "The original six remain the races used for the Six Star Medal. Sydney and Cape Town are additional current Majors.",
    sourceUrl: "https://www.worldmarathonmajors.com/",
  },
  {
    code: "utmb-world-series",
    name: "UTMB World Series",
    shortName: "UTMB World Series",
    description: "Official UTMB World Series Events, continental Majors and the HOKA UTMB Mont-Blanc Finals.",
    qualificationNote: "World Series Events award Running Stones. Majors award double Running Stones; exact awards depend on race category.",
    sourceUrl: "https://utmb.world/en/sports-system",
  },
  {
    code: "utmb-index",
    name: "UTMB Index races",
    shortName: "UTMB Index",
    description: "Officially verified editions that contribute to a finisher's UTMB Index. These were formerly commonly called UTMB qualifiers.",
    qualificationNote: "UTMB Index races do not award Running Stones. Index status can change by edition, so Athrecs records the verified year and source.",
    sourceUrl: "https://utmb.world/en/index-races",
  },
];

const output = `/** Generated by scripts/generate-race-collections.mjs on ${checkedAt}. */\n\n`
  + `import type { Edition, RaceGroupDefinition, RaceGroupMembershipSeed, Series } from "./types";\n\n`
  + `export const raceGroupDefinitions: RaceGroupDefinition[] = ${ts(raceGroupDefinitions)};\n\n`
  + `export const raceCollectionSeries: Series[] = ${ts(raceCollectionSeries)};\n\n`
  + `export const raceCollectionEditions: Edition[] = ${ts(raceCollectionEditions)};\n\n`
  + `export const raceGroupMemberships: RaceGroupMembershipSeed[] = ${ts(raceGroupMemberships)};\n`;

await writeFile(outputPath, output);
console.log(JSON.stringify({
  outputPath,
  checkedAt,
  utmbWorldSeriesEvents: utmbEvents.length,
  utmbIndexRaces: UTMB_INDEX_RACES.length,
  worldMarathonMajors: WORLD_MARATHON_MAJORS.length,
}, null, 2));
