import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [
  auditData,
  { seriesList: coreSeries, editions: coreEditions },
  { runabcEditions, runabcSeries },
  { raceCollectionEditions, raceCollectionSeries },
  { continuedFiveKEditions, continuedFiveKSeries },
  { verifiedFiveMileEditions, verifiedFiveMileSeries },
  { verifiedTenKFollowupEditions, verifiedTenKFollowupSeries },
  { verifiedUkEditions, verifiedUkSeries },
] = await Promise.all([
  import("../src/data/half-to-20-mile-races-uk-ireland.ts"),
  import("../src/data/series.ts").then(async ({ seriesList }) => ({
    seriesList,
    editions: (await import("../src/data/editions.ts")).editions,
  })),
  import("../src/data/runabc.ts"),
  import("../src/data/race-collections.ts"),
  import("../src/data/five-k-races-uk-ireland-next.ts"),
  import("../src/data/five-mile-races-uk-ireland.ts"),
  import("../src/data/ten-k-races-uk-ireland-followup.ts"),
  import("../src/data/verified-races-uk.ts"),
]);

const {
  halfToTwentyMileBounds,
  verifiedHalfToTwentyMileEditionOverrides,
  verifiedHalfToTwentyMileEditions,
  verifiedHalfToTwentyMileResearchQueue,
  verifiedHalfToTwentyMileSeries,
  verifiedHalfToTwentyMileSeriesOverrides,
} = auditData;

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const REUSED_SERIES = new Set(["green-gateways"]);

assert.equal(verifiedHalfToTwentyMileSeries.length, 16, "The new race series set is incomplete");
assert.equal(verifiedHalfToTwentyMileEditions.length, 17, "The new edition set is incomplete");
assert.equal(
  Object.keys(verifiedHalfToTwentyMileSeriesOverrides).length,
  10,
  "The existing-series correction set is incomplete",
);
assert.equal(
  Object.keys(verifiedHalfToTwentyMileEditionOverrides).length,
  8,
  "The existing-edition correction set is incomplete",
);
assert.equal(verifiedHalfToTwentyMileResearchQueue.length, 6, "The research queue is incomplete");
assert.equal(halfToTwentyMileBounds.minimumExclusiveKm, 21.0975);
assert.equal(halfToTwentyMileBounds.maximumExclusiveKm, 32.18688);

const existingSeries = [
  ...coreSeries,
  ...runabcSeries,
  ...raceCollectionSeries,
  ...continuedFiveKSeries,
  ...verifiedFiveMileSeries,
  ...verifiedTenKFollowupSeries,
  ...verifiedUkSeries,
];
const existingEditions = [
  ...coreEditions,
  ...runabcEditions,
  ...raceCollectionEditions,
  ...continuedFiveKEditions,
  ...verifiedFiveMileEditions,
  ...verifiedTenKFollowupEditions,
  ...verifiedUkEditions,
];
const existingSlugs = new Set(existingSeries.map((series) => series.slug));
const normaliseName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");
const existingNames = new Set(existingSeries.map((series) => normaliseName(series.name)));

const newSlugs = new Set();
const newNames = new Set();
for (const series of verifiedHalfToTwentyMileSeries) {
  assert(!newSlugs.has(series.slug), `Duplicate new series slug: ${series.slug}`);
  assert(!existingSlugs.has(series.slug), `${series.slug} duplicates an existing catalogue slug`);
  newSlugs.add(series.slug);

  const nameKey = normaliseName(series.name);
  assert(!newNames.has(nameKey), `Duplicate new series name: ${series.name}`);
  assert(!existingNames.has(nameKey), `${series.name} duplicates an existing catalogue name`);
  newNames.add(nameKey);

  assert.equal(series.sport, "Running", `${series.slug} is not a running race`);
  assert(
    ["England", "Ireland", "Northern Ireland", "Scotland", "Wales"].includes(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const existingEditionKeys = new Set(
  existingEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`),
);
const newEditionKeys = new Set();
for (const edition of verifiedHalfToTwentyMileEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!newEditionKeys.has(key), `Duplicate new edition: ${key}`);
  newEditionKeys.add(key);
  assert(!existingEditionKeys.has(key), `${key} duplicates an existing catalogue edition`);
  assert(
    newSlugs.has(edition.seriesSlug) || REUSED_SERIES.has(edition.seriesSlug),
    `${edition.seriesSlug} has no new or explicitly reused series`,
  );
  assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/, `${key} has an invalid ISO date`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert(
    edition.distanceKm > halfToTwentyMileBounds.minimumExclusiveKm,
    `${key} is not longer than a half marathon`,
  );
  assert(
    edition.distanceKm < halfToTwentyMileBounds.maximumExclusiveKm,
    `${key} is not shorter than 20 miles`,
  );
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

for (const reusedSlug of REUSED_SERIES) {
  assert(existingSlugs.has(reusedSlug), `Reused series is missing upstream: ${reusedSlug}`);
}
for (const slug of Object.keys(verifiedHalfToTwentyMileSeriesOverrides)) {
  assert(existingSlugs.has(slug), `Series override target is missing upstream: ${slug}`);
}

const existingFullEditionKeys = new Set(
  existingEditions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
);
for (const [key, override] of Object.entries(verifiedHalfToTwentyMileEditionOverrides)) {
  assert(existingFullEditionKeys.has(key), `Edition override target is missing upstream: ${key}`);
  assert(
    (override.distanceKm ?? 0) > halfToTwentyMileBounds.minimumExclusiveKm,
    `${key} correction is not longer than a half marathon`,
  );
  assert(
    (override.distanceKm ?? Infinity) < halfToTwentyMileBounds.maximumExclusiveKm,
    `${key} correction is not shorter than 20 miles`,
  );
  if (override.status === "Open" || override.status === "Closed") {
    assert(override.entryOptions?.length, `${key} needs a verified entry option`);
  }
  for (const option of override.entryOptions ?? []) {
    assert.equal(option.checkedAt, TODAY, `${key} has a stale entry check date`);
    assert.equal(option.isVerified, true, `${key} has an unverified entry provider`);
  }
}

for (const candidate of verifiedHalfToTwentyMileResearchQueue) {
  assert(
    !newSlugs.has(candidate.slug),
    `Held candidate was accidentally published: ${candidate.slug}`,
  );
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} source must use HTTPS`);
}

assert.deepEqual(
  verifiedHalfToTwentyMileSeriesOverrides["ireland-west-5k-2026"]?.distances,
  ["3/4 Marathon", "10K", "5K"],
  "Ireland West lost its confirmed 3/4 marathon option",
);
assert.deepEqual(
  verifiedHalfToTwentyMileSeriesOverrides["green-gateways"]?.distances,
  ["14mi", "26.2mi"],
  "Green Gateways lost its measured 14-mile option",
);
assert.equal(
  verifiedHalfToTwentyMileEditionOverrides["yorkshireman-off-road-marathon|2026-09-13|Half"]
    ?.distance,
  "14.8mi",
  "Yorkshireman's long half was not corrected in place",
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
  catalogueSource.includes('from "./half-to-20-mile-races-uk-ireland"'),
  "The audit dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedHalfToTwentyMileSeries as Series[])"),
  "The audit series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedHalfToTwentyMileEditions as Edition[])"),
  "The audit editions are not merged into the catalogue",
);
assert(
  entryOptionsSource.includes("...verifiedHalfToTwentyMileEditionOverrides") &&
    entryOptionsSource.includes("...verifiedHalfToTwentyMileSeriesOverrides"),
  "The in-place audit corrections are not merged",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-aims-europe-road-races-v244"'),
  "The persistent catalogue seed version was not advanced",
);
assert(
  packageSource.includes('"verify:uk-ireland-half-to-20-mile"'),
  "The audit verifier is not available as an npm script",
);

console.log(
  `Verified ${verifiedHalfToTwentyMileSeries.length} new series, ${verifiedHalfToTwentyMileEditions.length} editions, ${Object.keys(verifiedHalfToTwentyMileSeriesOverrides).length} series corrections, ${Object.keys(verifiedHalfToTwentyMileEditionOverrides).length} edition corrections and ${verifiedHalfToTwentyMileResearchQueue.length} held candidates.`,
);
