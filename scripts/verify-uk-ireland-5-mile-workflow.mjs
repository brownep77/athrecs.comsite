import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [{ runabcSeries }, fiveMileData] = await Promise.all([
  import("../src/data/runabc.ts"),
  import("../src/data/five-mile-races-uk-ireland.ts"),
]);

const {
  verifiedFiveMileEditionOverrides,
  verifiedFiveMileEditions,
  verifiedFiveMileResearchQueue,
  verifiedFiveMileSeries,
  verifiedFiveMileSeriesOverrides,
} = fiveMileData;

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const COVERED_COUNTRIES = new Set(["England", "Ireland", "Northern Ireland", "Scotland", "Wales"]);
const REUSED_SERIES_SLUGS = new Set([
  "ashford-district-girlings-may-10k",
  "cannock-chase-10-5-mile",
]);

assert.equal(verifiedFiveMileSeries.length, 22, "The five-mile release is incomplete");
assert.equal(verifiedFiveMileEditions.length, 24, "The five-mile edition release is incomplete");
assert.equal(verifiedFiveMileResearchQueue.length, 7, "The held-candidate audit is incomplete");
assert.deepEqual(
  new Set(verifiedFiveMileSeries.map((series) => series.country)),
  COVERED_COUNTRIES,
  "The release lost one of the covered UK or Ireland countries",
);
assert.deepEqual(
  new Set(verifiedFiveMileSeries.map((series) => series.surface)),
  new Set(["Road", "Trail", "Mixed"]),
  "The release lost one of its verified surface types",
);

const slugs = new Set();
for (const series of verifiedFiveMileSeries) {
  assert(!slugs.has(series.slug), `Duplicate five-mile slug: ${series.slug}`);
  slugs.add(series.slug);
  assert(series.distances.includes("5mi"), `${series.slug} does not advertise five miles`);
  assert(
    COVERED_COUNTRIES.has(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const editionKeys = new Set();
for (const edition of verifiedFiveMileEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate five-mile edition: ${key}`);
  editionKeys.add(key);
  assert(slugs.has(edition.seriesSlug), `${edition.seriesSlug} has no audited series`);
  assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/, `${key} has an invalid ISO date`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert.equal(edition.distance, "5mi", `${key} is not represented as five miles`);
  assert.equal(edition.distanceKm, 8.05, `${key} does not have the canonical metric distance`);
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);

  if (edition.status === "Open" || edition.status === "Closed") {
    assert(edition.entryOptions?.length, `${key} needs a verified entry/status option`);
  }
  if (edition.status === "TBC") {
    assert.equal(edition.entryOptions, undefined, `${key} must not imply an open checkout`);
  }
  for (const option of edition.entryOptions ?? []) {
    assert.equal(option.checkedAt, TODAY, `${key} has a stale entry check date`);
    assert.equal(option.isVerified, true, `${key} has an unverified entry provider`);
    assert.equal(option.isPrimary, true, `${key} primary entry provider is not marked`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
}

const catalogueSource = await fs.readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
const seedSource = await fs.readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  catalogueSource.includes('from "./five-mile-races-uk-ireland"'),
  "The five-mile dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedFiveMileSeries as Series[])"),
  "The five-mile series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedFiveMileEditions as Edition[])"),
  "The five-mile editions are not merged into the catalogue",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-5k-very-pink-v241"'),
  "The persistent catalogue seed version is behind the five-mile workflow",
);

const upstreamSlugs = new Set(runabcSeries.map((series) => series.slug));
for (const reusedSlug of REUSED_SERIES_SLUGS) {
  assert(slugs.has(reusedSlug), `Reused series is missing from the release: ${reusedSlug}`);
  assert(upstreamSlugs.has(reusedSlug), `Reused series is missing upstream: ${reusedSlug}`);
}

const sentinels = [
  "portrush-5-mile-road-race-2026",
  "severn-bridge-5-night-races-2026",
  "glasgow-university-des-gilmore-5-mile-2026",
  "beara-glengarriff-5-mile-2026",
  "lucan-harriers-5-mile-road-race-2026",
  "tommy-ryan-memorial-carrigaline-5-mile-2027",
  "atw-bedford-5-and-10-2027",
  "pendle-5-mile-trail-race-2027",
  "stort10-5-mile-trail-race-2027",
  "st-agnes-5-miler-2027",
];
for (const slug of sentinels) {
  assert(slugs.has(slug), `Coverage sentinel is missing: ${slug}`);
}

assert.deepEqual(
  verifiedFiveMileSeriesOverrides["m10-swansea"]?.distances,
  ["5mi", "10mi"],
  "M10 Swansea must advertise its official 5-mile and 10-mile distances",
);
assert.deepEqual(
  verifiedFiveMileEditionOverrides["m10-swansea|2027-03-21|10mi"],
  {
    ...verifiedFiveMileEditionOverrides["m10-swansea|2027-03-21|10mi"],
    date: "2027-02-28",
    distance: "5mi",
    distanceKm: 8.05,
  },
  "M10 Swansea's imported edition must be corrected to the official 5-mile date",
);

const queuedSlugs = new Set();
for (const candidate of verifiedFiveMileResearchQueue) {
  assert(!queuedSlugs.has(candidate.slug), `Duplicate research candidate: ${candidate.slug}`);
  queuedSlugs.add(candidate.slug);
  assert(!slugs.has(candidate.slug), `${candidate.slug} is queued and must not be published`);
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} queue source must use HTTPS`);
}

console.log(
  `UK and Ireland five-mile workflow verified: ${verifiedFiveMileSeries.length} audited series, ${verifiedFiveMileEditions.length} editions and ${verifiedFiveMileResearchQueue.length} held candidates.`,
);
