import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [
  tenMileData,
  { seriesList: coreSeries },
  { runabcEditions, runabcSeries },
  { verifiedUkEditions, verifiedUkSeries },
  { ukFiveKEditions, ukFiveKSeries },
  { continuedFiveKEditions, continuedFiveKSeries },
  { verifiedFiveMileEditions, verifiedFiveMileSeries },
  { verifiedTenKFollowupEditions, verifiedTenKFollowupSeries },
] = await Promise.all([
  import("../src/data/ten-mile-races-uk-ireland.ts"),
  import("../src/data/series.ts"),
  import("../src/data/runabc.ts"),
  import("../src/data/verified-races-uk.ts"),
  import("../src/data/uk-5k-races.ts"),
  import("../src/data/five-k-races-uk-ireland-next.ts"),
  import("../src/data/five-mile-races-uk-ireland.ts"),
  import("../src/data/ten-k-races-uk-ireland-followup.ts"),
]);

const {
  verifiedTenMileEditions,
  verifiedTenMileResearchQueue,
  verifiedTenMileSeries,
  verifiedTenMileSeriesOverrides,
} = tenMileData;

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";

assert.equal(verifiedTenMileSeries.length, 15, "The 10-mile series set is incomplete");
assert.equal(verifiedTenMileEditions.length, 15, "The 10-mile edition set is incomplete");
assert.equal(
  Object.keys(verifiedTenMileSeriesOverrides).length,
  6,
  "The existing-series 10-mile correction set is incomplete",
);
assert.equal(
  verifiedTenMileResearchQueue.length,
  4,
  "The held 10-mile research queue is incomplete",
);

const existingSeries = [
  ...coreSeries,
  ...runabcSeries,
  ...verifiedUkSeries,
  ...ukFiveKSeries,
  ...continuedFiveKSeries,
  ...verifiedFiveMileSeries,
  ...verifiedTenKFollowupSeries,
];
const existingEditions = [
  ...runabcEditions,
  ...verifiedUkEditions,
  ...ukFiveKEditions,
  ...continuedFiveKEditions,
  ...verifiedFiveMileEditions,
  ...verifiedTenKFollowupEditions,
];
const existingSlugs = new Set(existingSeries.map((series) => series.slug));
const existingNameKeys = new Set(
  existingSeries.map((series) => series.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
);

const newSlugs = new Set();
const countryCounts = new Map();
for (const series of verifiedTenMileSeries) {
  assert(!newSlugs.has(series.slug), `Duplicate 10-mile slug: ${series.slug}`);
  newSlugs.add(series.slug);
  assert(!existingSlugs.has(series.slug), `${series.slug} duplicates an existing catalogue slug`);
  assert(
    !existingNameKeys.has(series.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
    `${series.slug} duplicates an existing catalogue name`,
  );
  assert(series.distances.includes("10mi"), `${series.slug} does not advertise 10mi`);
  assert(
    ["England", "Ireland", "Northern Ireland", "Scotland", "Wales"].includes(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
  countryCounts.set(series.country, (countryCounts.get(series.country) ?? 0) + 1);
}

assert.deepEqual(
  Object.fromEntries(countryCounts),
  { "Northern Ireland": 2, Ireland: 4, England: 6, Wales: 3 },
  "The UK and Ireland coverage balance changed unexpectedly",
);

const existingEditionKeys = new Set(
  existingEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`),
);
const editionKeys = new Set();
for (const edition of verifiedTenMileEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate 10-mile edition: ${key}`);
  editionKeys.add(key);
  assert(!existingEditionKeys.has(key), `${key} duplicates an existing catalogue edition`);
  assert(newSlugs.has(edition.seriesSlug), `${edition.seriesSlug} has no new series`);
  assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/, `${key} has an invalid ISO date`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert.equal(edition.distance, "10mi", `${key} is not represented as a 10-mile edition`);
  assert.equal(edition.distanceKm, 16.09, `${key} does not use the canonical metric distance`);
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);

  if (edition.status === "Open") {
    assert(edition.entryOptions?.length, `${key} needs a verified entry option`);
  }
  if (edition.status === "TBC") {
    assert(!edition.entryOptions?.length, `${key} must not advertise unconfirmed entry`);
  }
  for (const option of edition.entryOptions ?? []) {
    assert.equal(option.checkedAt, TODAY, `${key} has a stale entry check date`);
    assert.equal(option.isVerified, true, `${key} has an unverified entry provider`);
    assert.equal(option.isPrimary, true, `${key} primary entry provider is not marked`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
}

assert.equal(
  verifiedTenMileEditions.filter((edition) => edition.status === "Open").length,
  10,
  "The verified live-entry total changed unexpectedly",
);
assert.equal(
  verifiedTenMileEditions.filter((edition) => edition.status === "TBC").length,
  5,
  "The conservative TBC total changed unexpectedly",
);

for (const [slug, override] of Object.entries(verifiedTenMileSeriesOverrides)) {
  assert(existingSlugs.has(slug), `Override target is missing upstream: ${slug}`);
  assert(override.distances?.includes("10mi"), `${slug} lost its confirmed 10-mile distance`);
  assert(!override.distances?.includes("10M"), `${slug} uses the non-canonical 10M distance code`);
}
for (const candidate of verifiedTenMileResearchQueue) {
  assert(
    !newSlugs.has(candidate.slug),
    `Held candidate was accidentally published: ${candidate.slug}`,
  );
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} source must use HTTPS`);
}

assert.deepEqual(
  verifiedTenMileSeriesOverrides["lee-valley-velo-park-april-2027"]?.distances,
  ["Half", "10mi", "10K", "5K", "1M"],
  "The April Lee Valley distance code was not normalized",
);

const catalogueSource = await fs.readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
const entryOptionsSource = await fs.readFile(
  new URL("../src/data/entry-options.ts", import.meta.url),
  "utf8",
);
const seedSource = await fs.readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
const packageSource = await fs.readFile(new URL("../package.json", import.meta.url), "utf8");

assert(
  catalogueSource.includes('from "./ten-mile-races-uk-ireland"'),
  "The UK and Ireland 10-mile dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedTenMileSeries as Series[])"),
  "The UK and Ireland 10-mile series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedTenMileEditions as Edition[]).filter"),
  "The UK and Ireland 10-mile editions are not merged into the catalogue",
);
assert(
  entryOptionsSource.includes("...verifiedTenMileSeriesOverrides"),
  "The existing-series 10-mile corrections are not merged",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-10-mile-v231"'),
  "The persistent catalogue seed version was not advanced for the 10-mile release",
);
assert(
  packageSource.includes('"verify:uk-ireland-10-mile-workflow"'),
  "The 10-mile verification workflow is not exposed as an npm script",
);

console.log(
  `Verified ${verifiedTenMileSeries.length} new 10-mile series, ${verifiedTenMileEditions.length} editions, ${Object.keys(verifiedTenMileSeriesOverrides).length} existing-series corrections and ${verifiedTenMileResearchQueue.length} held candidates.`,
);
