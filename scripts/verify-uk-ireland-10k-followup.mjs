import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [
  followupData,
  { runabcEditions, runabcSeries },
  { verifiedUkEditions, verifiedUkSeries },
  { ukFiveKEditions, ukFiveKSeries },
  { continuedFiveKEditions, continuedFiveKSeries },
] = await Promise.all([
  import("../src/data/ten-k-races-uk-ireland-followup.ts"),
  import("../src/data/runabc.ts"),
  import("../src/data/verified-races-uk.ts"),
  import("../src/data/uk-5k-races.ts"),
  import("../src/data/five-k-races-uk-ireland-next.ts"),
]);

const {
  verifiedTenKFollowupEditions,
  verifiedTenKFollowupResearchQueue,
  verifiedTenKFollowupSeries,
  verifiedTenKFollowupSeriesOverrides,
} = followupData;

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const REUSED_SERIES = new Set([
  "clacton-half-marathon-10k",
  "edinburgh-running-festival",
  "mount-ephraim-10k-august",
]);

assert.equal(verifiedTenKFollowupSeries.length, 11, "The 10K follow-up series set is incomplete");
assert.equal(
  verifiedTenKFollowupEditions.length,
  14,
  "The 10K follow-up edition set is incomplete",
);
assert.equal(
  Object.keys(verifiedTenKFollowupSeriesOverrides).length,
  6,
  "The 10K existing-series correction set is incomplete",
);
assert.equal(
  verifiedTenKFollowupResearchQueue.length,
  4,
  "The held 10K research queue is incomplete",
);

const existingSeries = [
  ...runabcSeries,
  ...verifiedUkSeries,
  ...ukFiveKSeries,
  ...continuedFiveKSeries,
];
const existingEditions = [
  ...runabcEditions,
  ...verifiedUkEditions,
  ...ukFiveKEditions,
  ...continuedFiveKEditions,
];
const existingSlugs = new Set(existingSeries.map((series) => series.slug));
const existingNameKeys = new Set(
  existingSeries.map((series) => series.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
);

const newSlugs = new Set();
for (const series of verifiedTenKFollowupSeries) {
  assert(!newSlugs.has(series.slug), `Duplicate follow-up 10K slug: ${series.slug}`);
  newSlugs.add(series.slug);
  assert(!existingSlugs.has(series.slug), `${series.slug} duplicates an existing catalogue slug`);
  assert(
    !existingNameKeys.has(series.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
    `${series.slug} duplicates an existing catalogue name`,
  );
  assert(series.distances.includes("10K"), `${series.slug} does not advertise a 10K distance`);
  assert(
    ["England", "Ireland", "Wales"].includes(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const existingEditionKeys = new Set(
  existingEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`),
);
const editionKeys = new Set();
for (const edition of verifiedTenKFollowupEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate follow-up 10K edition: ${key}`);
  editionKeys.add(key);
  assert(!existingEditionKeys.has(key), `${key} duplicates an existing catalogue edition`);
  assert(
    newSlugs.has(edition.seriesSlug) || REUSED_SERIES.has(edition.seriesSlug),
    `${edition.seriesSlug} has no new or explicitly reused series`,
  );
  assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/, `${key} has an invalid ISO date`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert.equal(edition.distance, "10K", `${key} is not represented as a 10K edition`);
  assert.equal(edition.distanceKm, 10, `${key} does not have a 10 km metric distance`);
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

for (const slug of REUSED_SERIES) {
  assert(existingSlugs.has(slug), `Reused series is missing upstream: ${slug}`);
}
for (const slug of Object.keys(verifiedTenKFollowupSeriesOverrides)) {
  assert(existingSlugs.has(slug), `Override target is missing upstream: ${slug}`);
}
for (const candidate of verifiedTenKFollowupResearchQueue) {
  assert(
    !newSlugs.has(candidate.slug),
    `Held candidate was accidentally published: ${candidate.slug}`,
  );
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} source must use HTTPS`);
}

assert.deepEqual(
  verifiedTenKFollowupSeriesOverrides["run-balmoral-harbour-energy-5k-2027"]?.distances,
  ["5K", "10K"],
  "Run Balmoral lost its confirmed 10K distance",
);
assert.deepEqual(
  verifiedTenKFollowupSeriesOverrides["the-chislehurst-half-marathon"]?.distances,
  ["Half", "10K"],
  "The Chislehurst series lost its new 10K option",
);
assert.deepEqual(
  verifiedTenKFollowupSeriesOverrides["stansted-house-trail-run"]?.distances,
  ["Half", "15K", "10K"],
  "Stansted House lost its confirmed 10K distance",
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
assert(
  catalogueSource.includes('from "./ten-k-races-uk-ireland-followup"'),
  "The UK and Ireland 10K follow-up dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedTenKFollowupSeries as Series[])"),
  "The UK and Ireland 10K follow-up series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedTenKFollowupEditions as Edition[]).filter"),
  "The UK and Ireland 10K follow-up editions are not merged into the catalogue",
);
assert(
  entryOptionsSource.includes("...verifiedTenKFollowupSeriesOverrides"),
  "The UK and Ireland 10K follow-up series corrections are not merged",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-half-ten-mile-scan-v242"'),
  "The persistent catalogue seed version is behind the 10K follow-up",
);

console.log(
  `Verified ${verifiedTenKFollowupSeries.length} new 10K series, ${verifiedTenKFollowupEditions.length} editions, ${Object.keys(verifiedTenKFollowupSeriesOverrides).length} existing-series corrections and ${verifiedTenKFollowupResearchQueue.length} held candidates.`,
);
