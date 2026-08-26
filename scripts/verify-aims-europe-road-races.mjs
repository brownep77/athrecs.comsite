import assert from "node:assert/strict";
import fs from "node:fs";

const {
  AIMS_EUROPE_BASELINE_MATCHED_SERIES_COUNT,
  AIMS_EUROPE_CHECKED_AT,
  AIMS_EUROPE_NEW_SERIES_COUNT,
  AIMS_EUROPE_SOURCE_URL,
  aimsEuropeEditions,
  aimsEuropeSeries,
  aimsEuropeSeriesOverrides,
  aimsEuropeSourceRows,
} = await import("../src/data/aims-europe-road-races.ts");

assert.equal(AIMS_EUROPE_CHECKED_AT, "2026-08-25");
assert.equal(AIMS_EUROPE_SOURCE_URL, "https://aims-worldrunning.org/calendar.html");
assert.equal(aimsEuropeSourceRows.length, 128);
assert.equal(aimsEuropeSeries.length, 127);
assert.equal(aimsEuropeEditions.length, 135);
assert.equal(AIMS_EUROPE_BASELINE_MATCHED_SERIES_COUNT, 67);
assert.equal(AIMS_EUROPE_NEW_SERIES_COUNT, 60);
assert.equal(
  AIMS_EUROPE_BASELINE_MATCHED_SERIES_COUNT + AIMS_EUROPE_NEW_SERIES_COUNT,
  aimsEuropeSeries.length,
);

const sourceRaceUrls = aimsEuropeSourceRows.map((row) => row.raceUrl);
assert.equal(new Set(sourceRaceUrls).size, 128, "Every AIMS member-race page must be unique");

const sourceSlugCounts = new Map();
for (const row of aimsEuropeSourceRows) {
  sourceSlugCounts.set(row.slug, (sourceSlugCounts.get(row.slug) ?? 0) + 1);
  assert(row.slug && row.name && row.city && row.country && row.organiser);
  assert.deepEqual([...new Set(row.distances)], row.distances);
  assert(row.distances.length > 0);
  assert(row.distances.every((distance) => ["Half", "Marathon"].includes(distance)));
  assert.match(row.officialUrl, /^https:\/\//);
  assert.match(row.raceUrl, /^https:\/\/www\.aims-worldrunning\.org\/races\/\d+\.html$/);
}

assert.deepEqual(
  [...sourceSlugCounts].filter(([, count]) => count > 1),
  [["lisbon-half-marathon", 2]],
  "Only the two separately listed Lisbon half-marathon member pages should share a canonical card",
);

assert.equal(new Set(aimsEuropeSeries.map((series) => series.slug)).size, aimsEuropeSeries.length);
for (const series of aimsEuropeSeries) {
  assert.equal(series.sport, "Running");
  assert.equal(series.surface, "Road");
  assert(series.city && series.country);
  assert.match(series.website, /^https:\/\//);
  assert(!series.website.includes("aims-worldrunning.org"), `${series.slug} lacks an official URL`);
  assert.deepEqual(aimsEuropeSeriesOverrides[series.slug]?.distances, series.distances);
  assert.equal(aimsEuropeSeriesOverrides[series.slug]?.website, series.website);
}

const editionKeys = aimsEuropeEditions.map(
  (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
);
assert.equal(new Set(editionKeys).size, editionKeys.length, "AIMS edition keys must be unique");
for (const edition of aimsEuropeEditions) {
  assert.match(edition.date, /^20\d{2}-\d{2}-\d{2}$/);
  assert(edition.date >= "2026-08-25" && edition.date <= "2027-12-31");
  assert(["Half", "Marathon"].includes(edition.distance));
  assert.equal(edition.distanceKm, edition.distance === "Marathon" ? 42.195 : 21.0975);
  assert.equal(edition.status, "TBC");
  assert.match(edition.entryUrl, /^https:\/\//);
  assert.match(edition.source, /^https:\/\/www\.aims-worldrunning\.org\/events\/\d+\.ics$/);
}

for (const requiredSlug of [
  "budapest-half-marathon",
  "barcelona-half-marathon",
  "warsaw-half-marathon",
  "istanbul-half-marathon",
  "helsinki-half-marathon",
  "chisinau-international-marathon",
  "silesia-marathon",
  "skopje-marathon",
  "split-marathon",
  "zurich-marathon",
]) {
  assert(
    aimsEuropeSeries.some((series) => series.slug === requiredSlug),
    `Missing ${requiredSlug}`,
  );
}

assert(
  aimsEuropeSeries
    .find((series) => series.slug === "stavanger-marathon")
    ?.distances.includes("Half"),
  "The existing Stavanger card must be enriched with its half marathon",
);
assert(
  aimsEuropeEditions.some(
    (edition) =>
      edition.seriesSlug === "waterford-viking-marathon" && edition.date === "2027-06-20",
  ),
  "Waterford Viking's confirmed 2027 event is missing",
);

const catalogueSource = fs.readFileSync(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes('from "./aims-europe-road-races"'));
assert(catalogueSource.includes("...(aimsEuropeSeries as Series[])"));
assert(catalogueSource.includes("...aimsEuropeSeriesOverrides[series.slug]"));
assert(catalogueSource.includes("...aimsEuropeEditions.filter"));

const seedSource = fs.readFileSync(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(seedSource.includes('const SEED_VERSION = "athrecs-albania-running-calendar-v245"'));

process.stdout.write(
  JSON.stringify(
    {
      checked_at: AIMS_EUROPE_CHECKED_AT,
      source_series: aimsEuropeSourceRows.length,
      canonical_series: aimsEuropeSeries.length,
      existing_cards_enriched: AIMS_EUROPE_BASELINE_MATCHED_SERIES_COUNT,
      new_cards: AIMS_EUROPE_NEW_SERIES_COUNT,
      dated_editions: aimsEuropeEditions.length,
      half_marathon_series: aimsEuropeSeries.filter((series) => series.distances.includes("Half"))
        .length,
      marathon_series: aimsEuropeSeries.filter((series) => series.distances.includes("Marathon"))
        .length,
    },
    null,
    2,
  ) + "\n",
);
