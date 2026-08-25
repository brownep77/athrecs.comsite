import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [dailyData, originalData, continuedData, { runabcSeries }, { worldAthleticsSeries }] =
  await Promise.all([
    import("../src/data/five-k-races-uk-ireland-daily.ts"),
    import("../src/data/uk-5k-races.ts"),
    import("../src/data/five-k-races-uk-ireland-next.ts"),
    import("../src/data/runabc.ts"),
    import("../src/data/world-athletics.ts"),
  ]);

const { dailyFiveKEditions, dailyFiveKResearchQueue, dailyFiveKSeries } = dailyData;
const existingSeries = [
  ...originalData.ukFiveKSeries,
  ...continuedData.continuedFiveKSeries,
  ...runabcSeries,
  ...worldAthleticsSeries,
];
const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const EXPECTED_SURFACES = new Set(["Road", "Track", "Mixed", "Trail", "Cross Country"]);

function normalizedName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

assert.equal(dailyFiveKSeries.length, 12, "Expected twelve newly verified 5K series");
assert.equal(dailyFiveKEditions.length, 12, "Expected twelve newly verified 5K editions");
assert.deepEqual(
  new Set(dailyFiveKSeries.map((series) => series.surface)),
  EXPECTED_SURFACES,
  "The daily release lost one of its verified surfaces",
);

const existingSlugs = new Set(existingSeries.map((series) => series.slug));
const existingNames = new Set(existingSeries.map((series) => normalizedName(series.name)));
const newSlugs = new Set();
const newNames = new Set();
for (const series of dailyFiveKSeries) {
  assert(!existingSlugs.has(series.slug), `Existing source already has slug ${series.slug}`);
  assert(
    !existingNames.has(normalizedName(series.name)),
    `Existing source already has ${series.name}`,
  );
  assert(!newSlugs.has(series.slug), `Duplicate new slug ${series.slug}`);
  assert(!newNames.has(normalizedName(series.name)), `Duplicate new name ${series.name}`);
  newSlugs.add(series.slug);
  newNames.add(normalizedName(series.name));
  assert.equal(series.sport, "Running", `${series.slug} is not a running series`);
  assert(series.distances.includes("5K"), `${series.slug} does not advertise 5K`);
  assert(["England", "Ireland"].includes(series.country), `${series.slug} is outside scope`);
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.equal(series.website, series.source_url, `${series.slug} source provenance differs`);
}

const editionKeys = new Set();
for (const edition of dailyFiveKEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate new edition ${key}`);
  editionKeys.add(key);
  assert(newSlugs.has(edition.seriesSlug), `${edition.seriesSlug} has no new series`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert.equal(edition.distance, "5K", `${key} is not a 5K edition`);
  assert.equal(edition.distanceKm, 5, `${key} does not have a 5 km metric distance`);
  assert.equal(edition.status, "Open", `${key} is not open`);
  assert.match(edition.startTime ?? "", /^\d{2}:\d{2}$/, `${key} is missing a start time`);
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);
  assert.equal(edition.entryOptions?.length, 1, `${key} needs one primary entry option`);
  const option = edition.entryOptions[0];
  assert.equal(option.checkedAt, TODAY, `${key} has a stale entry check`);
  assert.equal(option.isVerified, true, `${key} entry is not verified`);
  assert.equal(option.isPrimary, true, `${key} entry is not primary`);
  assert.equal(option.entryType, "official", `${key} entry is not official/direct`);
  assert.equal(option.entryUrl, edition.source, `${key} entry and source URLs differ`);
}

for (const candidate of dailyFiveKResearchQueue) {
  assert(!newSlugs.has(candidate.slug), `${candidate.slug} is held and must not be public`);
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} queue source must use HTTPS`);
}
assert(
  dailyFiveKResearchQueue.some((candidate) => candidate.slug === "portmarnock-ac-beach-5k-2026"),
  "The permit-pending Portmarnock Beach 5K must remain held",
);
assert(
  dailyFiveKResearchQueue.some(
    (candidate) => candidate.slug === "st-lukes-5k-run-to-remember-2026",
  ),
  "The unstable St Luke's registration listing must remain held",
);
assert(
  dailyFiveKResearchQueue.some(
    (candidate) => candidate.slug === "very-pink-run-kilkenny-2026",
  ),
  "Very Pink Run Kilkenny must remain held while its advertised distances conflict",
);

const catalogueSource = await fs.readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
const seedSource = await fs.readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  catalogueSource.includes('from "./five-k-races-uk-ireland-daily"'),
  "The daily 5K module is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(dailyFiveKSeries as Series[])"),
  "The daily 5K series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(dailyFiveKEditions as Edition[]).filter"),
  "The daily 5K editions are not merged into the catalogue",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-aims-europe-road-races-v244"'),
  "The persistent seed version is behind the daily 5K release",
);

console.log(
  `Daily UK and Ireland 5K release verified: ${dailyFiveKSeries.length} public races across ${EXPECTED_SURFACES.size} surfaces; ${dailyFiveKResearchQueue.length} candidates held.`,
);
