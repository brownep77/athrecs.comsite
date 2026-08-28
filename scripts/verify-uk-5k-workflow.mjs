import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [
  fiveKData,
  continuedFiveKData,
  dailyFiveKData,
  fiveKReleaseData,
  { parkrunSeries },
  { runabcSeries },
  { worldAthleticsSeries },
] = await Promise.all([
  import("../src/data/uk-5k-races.ts"),
  import("../src/data/five-k-races-uk-ireland-next.ts"),
  import("../src/data/five-k-races-uk-ireland-daily.ts"),
  import("../src/data/uk-ireland-five-k-release-2026-08-28.ts"),
  import("../src/data/parkrun-uk.ts"),
  import("../src/data/runabc.ts"),
  import("../src/data/world-athletics.ts"),
]);

const {
  ukFiveKEditions,
  ukFiveKEditionOverrides,
  ukFiveKResearchQueue,
  ukFiveKSeries,
  ukFiveKSeriesOverrides,
} = fiveKData;
const { continuedFiveKEditions, continuedFiveKResearchQueue, continuedFiveKSeries } =
  continuedFiveKData;
const { dailyFiveKEditions, dailyFiveKResearchQueue, dailyFiveKSeries } = dailyFiveKData;
const {
  ukIrelandFiveKExistingSeriesEditions,
  ukIrelandFiveKReleaseEditions,
  ukIrelandFiveKReleaseResearchQueue,
  ukIrelandFiveKReleaseSeries,
} = fiveKReleaseData;

const allFiveKSeries = [
  ...ukFiveKSeries,
  ...continuedFiveKSeries,
  ...dailyFiveKSeries,
  ...ukIrelandFiveKReleaseSeries,
];
const allFiveKEditions = [
  ...ukFiveKEditions,
  ...continuedFiveKEditions,
  ...dailyFiveKEditions,
  ...ukIrelandFiveKReleaseEditions,
  ...ukIrelandFiveKExistingSeriesEditions,
];
const allFiveKResearchQueue = [
  ...ukFiveKResearchQueue,
  ...continuedFiveKResearchQueue,
  ...dailyFiveKResearchQueue,
  ...ukIrelandFiveKReleaseResearchQueue,
];

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const COVERED_COUNTRIES = new Set(["England", "Ireland", "Northern Ireland", "Scotland", "Wales"]);
const originalExistingSeriesEditionSlugs = new Set(["wendover-woods-running-festival-august"]);
const existingSeriesEditionSlugs = new Set([
  ...originalExistingSeriesEditionSlugs,
  ...ukIrelandFiveKExistingSeriesEditions.map((edition) => edition.seriesSlug),
]);

assert(ukFiveKSeries.length >= 55, "The verified UK 5K release is unexpectedly small");
assert(ukFiveKEditions.length > ukFiveKSeries.length, "Series with multiple dates were lost");
assert.equal(continuedFiveKSeries.length, 55, "The continued UK and Ireland release is incomplete");
assert.equal(
  continuedFiveKEditions.length,
  continuedFiveKSeries.length,
  "Each continued-release series must have one dated 5K edition",
);
assert.deepEqual(
  new Set(continuedFiveKSeries.map((series) => series.surface)),
  new Set(["Road", "Track", "Mixed", "Beach"]),
  "The continued release lost one of its verified surface types",
);
assert.equal(dailyFiveKSeries.length, 12, "The daily-scan release is incomplete");
assert.equal(
  dailyFiveKEditions.length,
  dailyFiveKSeries.length,
  "Each daily-scan series must have one dated 5K edition",
);
assert.equal(ukIrelandFiveKReleaseSeries.length, 52, "The 28 August release is incomplete");
assert.equal(ukIrelandFiveKReleaseEditions.length, 54, "The new-series edition set is incomplete");
assert.equal(
  ukIrelandFiveKExistingSeriesEditions.length,
  12,
  "Existing event cards lost one of their verified 5K editions",
);

const slugs = new Set();
for (const series of allFiveKSeries) {
  assert(!slugs.has(series.slug), `Duplicate UK 5K slug: ${series.slug}`);
  slugs.add(series.slug);
  assert(series.distances.includes("5K"), `${series.slug} does not advertise a 5K distance`);
  assert(
    COVERED_COUNTRIES.has(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
}

const editionKeys = new Set();
for (const edition of allFiveKEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!editionKeys.has(key), `Duplicate UK 5K edition: ${key}`);
  editionKeys.add(key);
  assert(
    slugs.has(edition.seriesSlug) || existingSeriesEditionSlugs.has(edition.seriesSlug),
    `${edition.seriesSlug} has no new or explicitly reused series`,
  );
  assert.match(edition.date, /^\d{4}-\d{2}-\d{2}$/, `${key} has an invalid ISO date`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert.equal(edition.distance, "5K", `${key} is not represented as a 5K edition`);
  assert.equal(edition.distanceKm, 5, `${key} does not have a 5 km metric distance`);
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);

  if (edition.status === "Open") {
    assert(edition.entryOptions?.length, `${key} needs a verified entry option`);
  }
  if (edition.status === "Closed" && !edition.entryOptions?.length) {
    assert.match(
      edition.notes ?? "",
      /representative/i,
      `${key} needs either a status option or a representative-race note`,
    );
  }
  for (const option of edition.entryOptions ?? []) {
    assert(
      option.checkedAt >= TODAY && option.checkedAt <= "2026-08-28",
      `${key} has an invalid entry check date`,
    );
    assert.equal(option.isVerified, true, `${key} has an unverified entry provider`);
    assert.equal(option.isPrimary, true, `${key} primary entry provider is not marked`);
    assert.match(option.entryUrl, /^https:\/\//, `${key} entry URL must use HTTPS`);
  }
}

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
  catalogueSource.includes('import { ukFiveKEditions, ukFiveKSeries } from "./uk-5k-races"'),
  "The UK 5K dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes('from "./five-k-races-uk-ireland-next"'),
  "The continued UK and Ireland 5K dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes('from "./five-k-races-uk-ireland-daily"'),
  "The daily UK and Ireland 5K dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes('from "./uk-ireland-five-k-release-2026-08-28"'),
  "The 28 August UK and Ireland 5K release is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(ukFiveKSeries as Series[])"),
  "The UK 5K series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(continuedFiveKSeries as Series[])"),
  "The continued UK and Ireland 5K series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(dailyFiveKSeries as Series[])"),
  "The daily UK and Ireland 5K series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(ukFiveKEditions as Edition[])"),
  "The UK 5K editions are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(continuedFiveKEditions as Edition[]).filter"),
  "The continued UK and Ireland 5K editions are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(dailyFiveKEditions as Edition[]).filter"),
  "The daily UK and Ireland 5K editions are not merged into the catalogue",
);
assert(
  entryOptionsSource.includes("...ukFiveKEditionOverrides") &&
    entryOptionsSource.includes("...ukFiveKSeriesOverrides"),
  "The UK 5K corrections are not merged into entry options",
);
assert.match(
  seedSource,
  /const SEED_VERSION = "athrecs-[^"]+";/,
  "The persistent catalogue must retain a versioned ATHRECS seed marker",
);

const existingSourceSlugs = new Set(
  [...runabcSeries, ...worldAthleticsSeries].map((series) => series.slug),
);
for (const reusedSlug of originalExistingSeriesEditionSlugs) {
  assert(existingSourceSlugs.has(reusedSlug), `Reused series is missing upstream: ${reusedSlug}`);
}

const sentinels = [
  "grc-coastal-5k-2026",
  "llantwit-major-10k-5k-2026",
  "aj-bell-great-south-5k-2026",
  "run-london-victoria-park-5k-november-2026",
  "howletts-cheetah-5k-2026",
  "atw-neon-run-5k-10k-2026",
  "duthie-park-5k-10k-2026",
  "evensplits-leeds-5k-series-2026",
  "runthrough-victoria-park-may-2027",
  "runthrough-chepstow-august-2027",
  "jerry-kiernan-5k-2026",
  "dune-run-bundoran-5k-2026",
  "rock-the-lough-5k-2026",
  "tom-brennan-memorial-5k-2027",
  "brandon-bay-run-5k-2027",
  "runthrough-goodwood-running-gp-october-2027",
  "runthrough-aintree-december-2027",
  "race-dunvegan-5k-2027",
  "run-balmoral-harbour-energy-5k-2027",
  "cardiff-5k-race-for-victory-2027",
  "runthrough-tatton-park-september-2027",
  "dunboyne-track-5k-2026",
  "very-pink-run-dublin-5k-2026",
  "seamie-weldon-5k-10k-2026",
  "very-pink-run-cork-5k-2026",
  "horsted-keynes-fun-run-5k-2026",
  "savills-sandymount-night-run-5k-october-2026",
  "skipton-santa-fun-run-5k-2026",
  "bedale-santa-run-5k-2026",
  "winter-solstice-strider-5k-2026",
  "keighley-10k-5k-2027",
  "wakefield-hospice-5k-2027",
  "paintrush-5k-2027",
];
for (const slug of sentinels) {
  assert(slugs.has(slug), `Coverage sentinel is missing: ${slug}`);
}
assert(
  allFiveKEditions.some(
    (edition) => edition.seriesSlug === "race-dunvegan-5k-2027" && edition.date === "2027-03-20",
  ),
  "Race Dunvegan 5K must be published on 20 March 2027",
);

for (const slug of ["ruthin-evening-5k", "the-bay-5k-series-race-3"]) {
  assert.equal(ukFiveKSeriesOverrides[slug]?.country, "Wales", `${slug} was not moved to Wales`);
}
assert.equal(
  ukFiveKSeriesOverrides["wa-antrim-coast-5k-7238722"]?.country,
  "Northern Ireland",
  "Antrim Coast 5K was not moved to Northern Ireland",
);
assert.equal(
  ukFiveKEditionOverrides["wa-antrim-coast-5k-7238722|2026-08-23|Other"]?.distance,
  "5K",
  "Antrim Coast distance correction is missing",
);

const queuedSlugs = new Set();
for (const candidate of allFiveKResearchQueue) {
  assert(!queuedSlugs.has(candidate.slug), `Duplicate research candidate: ${candidate.slug}`);
  queuedSlugs.add(candidate.slug);
  assert(!slugs.has(candidate.slug), `${candidate.slug} is queued and must not be published`);
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} queue source must use HTTPS`);
}

const weeklyParkruns = parkrunSeries.filter(
  (series) => series.sport === "Parkrun" && series.distances.includes("5K"),
);
assert(
  weeklyParkruns.length >= 800,
  "Weekly adult parkruns must remain a separate catalogue stream",
);

console.log(
  `UK and Ireland 5K workflow verified: ${allFiveKSeries.length} audited series, ${allFiveKEditions.length} editions, ${allFiveKResearchQueue.length} held candidates, ${weeklyParkruns.length} weekly 5K parkruns preserved.`,
);
