import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const {
  GERMANY_ENDURANCE_CHECKED_AT,
  GERMANY_ENDURANCE_WINDOW_END,
  germanyEnduranceCalendarStats,
  germanyEnduranceExpectedSeriesSlugs,
  germanyEnduranceRaceEditions,
  germanyEnduranceRaceSeries,
} = await import("../src/data/germany-endurance-races.ts");

const [catalogueSource, aimsSource, ironmanSource] = await Promise.all([
  readFile(new URL("../src/data/catalogue.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/data/aims-europe-road-races.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/data/ironman-703-calendar.ts", import.meta.url), "utf8"),
]);

const exactKey = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
const requestedSlugs = new Set(germanyEnduranceExpectedSeriesSlugs);

assert.equal(
  germanyEnduranceRaceSeries.length,
  38,
  "The curated Germany import must retain all 38 requested regional/national race series",
);
assert.equal(
  germanyEnduranceRaceEditions.length,
  150,
  "The curated Germany import must publish every advertised distance separately",
);
assert.equal(
  requestedSlugs.size,
  germanyEnduranceExpectedSeriesSlugs.length,
  "The curated Germany series list contains a duplicate slug",
);
assert.deepEqual(germanyEnduranceCalendarStats, {
  checkedAt: "2026-08-28",
  windowEnd: "2027-08-27",
  series: 38,
  editions: 150,
  sports: ["Cycling", "Triathlon", "Running", "Duathlon"],
  firstDate: "2026-08-29",
  lastDate: "2027-08-14",
});

for (const series of germanyEnduranceRaceSeries) {
  assert.equal(series.country, "Germany", `${series.slug} must be assigned to Germany`);
  assert(
    ["Running", "Cycling", "Triathlon", "Duathlon"].includes(series.sport),
    `${series.slug} has an unexpected endurance sport`,
  );
  assert(series.website.startsWith("https://"), `${series.slug} requires an HTTPS official website`);
  assert(
    series.source_url?.startsWith("https://"),
    `${series.slug} requires an HTTPS primary source`,
  );
  assert(series.city.trim(), `${series.slug} is missing a city or host locality`);
  assert(series.county.trim(), `${series.slug} is missing a federal state or region`);
  assert(series.distances.length > 0, `${series.slug} is missing distance labels`);
}

const localEditionKeys = germanyEnduranceRaceEditions.map(exactKey);
assert.equal(
  new Set(localEditionKeys).size,
  localEditionKeys.length,
  "The curated Germany import contains duplicate date/distance editions",
);

for (const edition of germanyEnduranceRaceEditions) {
  assert(
    requestedSlugs.has(edition.seriesSlug),
    `Unexpected Germany edition series ${edition.seriesSlug}`,
  );
  assert(
    edition.date >= GERMANY_ENDURANCE_CHECKED_AT &&
      edition.date <= GERMANY_ENDURANCE_WINDOW_END,
    `${exactKey(edition)} falls outside the requested next-12-month window`,
  );
  assert(edition.distanceKm > 0, `${exactKey(edition)} has a non-positive distance`);
  assert(edition.publishAllDistances, `${exactKey(edition)} must remain separately publishable`);
  assert(edition.source.startsWith("https://"), `${exactKey(edition)} requires a source URL`);
  assert(
    edition.entryOptions?.some(
      (option) =>
        option.isPrimary &&
        option.isVerified &&
        option.entryType === "official" &&
        option.entryUrl.startsWith("https://"),
    ),
    `${exactKey(edition)} requires a verified primary official link`,
  );
}

for (const requiredWiring of [
  'from "./germany-endurance-races"',
  "germanyEnduranceRaceSeries as Series[]",
  "germanyEnduranceRaceEditions as Edition[]",
]) {
  assert(
    catalogueSource.includes(requiredWiring),
    `The Germany source is not wired into the central catalogue: ${requiredWiring}`,
  );
}

const berlinKey = "berlin-marathon|2026-09-27|Marathon";
assert(
  aimsSource.includes('slug: "berlin-marathon"') &&
    aimsSource.includes('date: "2026-09-27"') &&
    aimsSource.includes('distance: "Marathon"'),
  `BMW BERLIN-MARATHON must retain its confirmed 2026 AIMS edition (${berlinKey})`,
);

const requiredGermanIronmanKeys = [
  "ironman-703-erkner|2026-09-13|70.3",
  "ironman-703-kraichgau|2027-05-23|70.3",
];
assert(
  ironmanSource.includes(
    '["im703-erkner", "IRONMAN 70.3 Erkner", "2026-09-13", "Erkner", "Brandenburg", "Germany"',
  ),
  `Confirmed in-window German IRONMAN fixture is missing: ${requiredGermanIronmanKeys[0]}`,
);
assert(
  ironmanSource.includes(
    '["im703-kraichgau", "IRONMAN 70.3 Kraichgau", "2027-05-23", "Bad Schonborn", "Baden-Wurttemberg", "Germany"',
  ),
  `Confirmed in-window German IRONMAN fixture is missing: ${requiredGermanIronmanKeys[1]}`,
);

for (const existingGlobalSlug of [
  "berlin-marathon",
  "ironman-703-erkner",
  "ironman-703-kraichgau",
]) {
  assert(
    !requestedSlugs.has(existingGlobalSlug),
    `${existingGlobalSlug} must remain supplied by its existing global feed rather than duplicated locally`,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      checked_at: GERMANY_ENDURANCE_CHECKED_AT,
      requested_series: germanyEnduranceRaceSeries.length,
      requested_distance_editions: germanyEnduranceRaceEditions.length,
      berlin_marathon: berlinKey,
      german_ironman: requiredGermanIronmanKeys,
      catalogue_status:
        "Germany source wired into the catalogue; existing global major fixtures retained without local duplicates",
    },
    null,
    2,
  )}\n`,
);
