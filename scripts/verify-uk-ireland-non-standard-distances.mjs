import assert from "node:assert/strict";
import fs from "node:fs/promises";

const [data, { runabcEditions, runabcSeries }, { kmFromDistanceCode }] = await Promise.all([
  import("../src/data/non-standard-races-uk-ireland.ts"),
  import("../src/data/runabc.ts"),
  import("../src/lib/athrecs/distance.ts"),
]);

const {
  NON_STANDARD_DISTANCE_CHECKED_AT,
  nonStandardDistanceEditionOverrides,
  nonStandardDistanceEditionReplacements,
  nonStandardDistanceResearchQueue,
  nonStandardDistanceSeriesOverrides,
  nonStandardDistanceSlugAliases,
  verifiedNonStandardDistanceEditions,
  verifiedNonStandardDistanceSeries,
} = data;

const TODAY = "2026-08-22";
const HORIZON = "2027-12-31";
const HALF_MARATHON_KM = 21.0975;
const REUSED_SERIES = new Set(["3k-on-the-green-august", "peterhead-3k-junior-mile-august"]);

assert.equal(NON_STANDARD_DISTANCE_CHECKED_AT, TODAY, "The audit check date is stale");
assert.equal(verifiedNonStandardDistanceSeries.length, 21, "The new fixture set is incomplete");
assert.equal(verifiedNonStandardDistanceEditions.length, 25, "The new edition set is incomplete");
assert.equal(
  Object.keys(nonStandardDistanceSeriesOverrides).length,
  35,
  "The existing-series correction set is incomplete",
);
assert.equal(
  Object.keys(nonStandardDistanceEditionOverrides).length,
  33,
  "The edition correction set is incomplete",
);
assert.equal(
  nonStandardDistanceEditionReplacements.length,
  29,
  "The persistent migration set is incomplete",
);
assert.equal(
  Object.keys(nonStandardDistanceSlugAliases).length,
  5,
  "The duplicate identity alias set is incomplete",
);
assert.equal(nonStandardDistanceResearchQueue.length, 3, "The held review queue is incomplete");

const normalizedName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "");
const upstreamSlugs = new Set(runabcSeries.map((series) => series.slug));
const upstreamNames = new Set(runabcSeries.map((series) => normalizedName(series.name)));
const newSlugs = new Set();
const newNames = new Set();

for (const series of verifiedNonStandardDistanceSeries) {
  assert(!newSlugs.has(series.slug), `Duplicate new fixture slug: ${series.slug}`);
  assert(!upstreamSlugs.has(series.slug), `${series.slug} duplicates an upstream slug`);
  newSlugs.add(series.slug);

  const nameKey = normalizedName(series.name);
  assert(!newNames.has(nameKey), `Duplicate new fixture name: ${series.name}`);
  assert(!upstreamNames.has(nameKey), `${series.name} duplicates an upstream name`);
  newNames.add(nameKey);

  assert(
    ["England", "Ireland", "Northern Ireland", "Scotland", "Wales"].includes(series.country),
    `${series.slug} has an out-of-scope country ${series.country}`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} website must use HTTPS`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} source must use HTTPS`);
  assert(
    series.distances.some((distance) => {
      const km = kmFromDistanceCode(distance);
      return km !== null && km > 0 && km <= HALF_MARATHON_KM;
    }),
    `${series.slug} has no route distance between zero and a half marathon`,
  );
}

const upstreamEditionKeys = new Set(
  runabcEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`),
);
const addedEditionKeys = new Set();
for (const edition of verifiedNonStandardDistanceEditions) {
  const key = `${edition.seriesSlug}|${edition.date}`;
  assert(!addedEditionKeys.has(key), `Duplicate added edition: ${key}`);
  addedEditionKeys.add(key);
  assert(
    newSlugs.has(edition.seriesSlug) || REUSED_SERIES.has(edition.seriesSlug),
    `${edition.seriesSlug} is neither new nor an explicitly reused canonical series`,
  );
  assert(!upstreamEditionKeys.has(key), `${key} duplicates an upstream canonical edition`);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the audit horizon`);
  assert(edition.distance !== "Other", `${key} was left as Other`);
  assert(
    edition.distanceKm > 0 && edition.distanceKm <= HALF_MARATHON_KM,
    `${key} is outside the requested distance range`,
  );
  assert.match(edition.source, /^https:\/\//, `${key} source must use HTTPS`);
  if (edition.status === "Open") {
    assert(edition.entryUrl, `${key} needs a public event or entry URL`);
  }
  if (edition.status === "TBC") {
    assert(!edition.entryOptions?.length, `${key} must not advertise unconfirmed entry`);
  }
  for (const option of edition.entryOptions ?? []) {
    assert.equal(option.checkedAt, TODAY, `${key} has a stale entry check`);
    assert.equal(option.isVerified, true, `${key} has an unverified entry option`);
    assert.equal(option.isPrimary, true, `${key} primary entry is not marked`);
  }
}

const upstreamEditionSourceKeys = new Set(
  runabcEditions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
);
for (const replacement of nonStandardDistanceEditionReplacements) {
  const sourceKey = `${replacement.seriesSlug}|${replacement.fromDate}|${replacement.distance}`;
  assert(
    upstreamEditionSourceKeys.has(sourceKey),
    `Migration target is missing upstream: ${sourceKey}`,
  );
  const override = nonStandardDistanceEditionOverrides[sourceKey];
  assert(override, `Migration has no catalogue override: ${sourceKey}`);
  assert.equal(override.date, replacement.toDate, `${sourceKey} date migration disagrees`);
  assert.equal(
    override.distance,
    replacement.toDistance,
    `${sourceKey} distance migration disagrees`,
  );
  assert.notEqual(override.distance, "Other", `${sourceKey} still maps to Other`);
  assert((override.distanceKm ?? 0) > 0, `${sourceKey} has no metric distance`);
}

for (const slug of Object.keys(nonStandardDistanceSeriesOverrides)) {
  assert(upstreamSlugs.has(slug), `Series override target is missing upstream: ${slug}`);
}
for (const [alias, canonical] of Object.entries(nonStandardDistanceSlugAliases)) {
  assert(upstreamSlugs.has(alias), `Alias source is missing upstream: ${alias}`);
  assert(upstreamSlugs.has(canonical), `Alias target is missing upstream: ${canonical}`);
  assert.notEqual(alias, canonical, `Self-referential alias: ${alias}`);
}

const replacementSlugs = new Set(
  nonStandardDistanceEditionReplacements.map((replacement) => replacement.seriesSlug),
);
for (const candidate of nonStandardDistanceResearchQueue) {
  assert(!replacementSlugs.has(candidate.slug), `${candidate.slug} escaped the held review queue`);
  assert.match(candidate.sourceUrl, /^https:\/\//, `${candidate.slug} held source must use HTTPS`);
  const key = `${candidate.slug}|${candidate.publishedDate}|Other`;
  assert.equal(
    nonStandardDistanceEditionOverrides[key]?.status,
    "TBC",
    `${candidate.slug} is not visibly held as TBC`,
  );
}

assert.equal(kmFromDistanceCode("Quarter"), 10.54875, "Quarter marathon conversion is missing");

const [catalogueSource, entryOptionsSource, filtersSource, seedSource, packageSource] =
  await Promise.all([
    fs.readFile(new URL("../src/data/catalogue.ts", import.meta.url), "utf8"),
    fs.readFile(new URL("../src/data/entry-options.ts", import.meta.url), "utf8"),
    fs.readFile(new URL("../src/lib/athrecs/filters.ts", import.meta.url), "utf8"),
    fs.readFile(new URL("../src/lib/athrecs/seed.server.ts", import.meta.url), "utf8"),
    fs.readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
for (const distance of [
  "1mi",
  "3K",
  "4mi",
  "6K",
  "6mi",
  "7K",
  "7mi",
  "8K",
  "8mi",
  "9K",
  "11K",
  "12K",
  "13K",
  "14K",
  "15K",
  "16K",
  "17K",
  "Quarter",
]) {
  assert(
    filtersSource.includes(`"${distance}"`),
    `Missing first-class distance filter: ${distance}`,
  );
}
assert(
  catalogueSource.includes('from "./non-standard-races-uk-ireland"'),
  "The non-standard dataset is not imported by the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedNonStandardDistanceSeries as Series[])"),
  "The new non-standard series are not merged into the catalogue",
);
assert(
  catalogueSource.includes("...(verifiedNonStandardDistanceEditions as Edition[]).filter"),
  "The new non-standard editions are not merged into the catalogue",
);
for (const mergeName of [
  "nonStandardDistanceEditionOverrides",
  "nonStandardDistanceEditionReplacements",
  "nonStandardDistanceSeriesOverrides",
  "nonStandardDistanceSlugAliases",
]) {
  assert(entryOptionsSource.includes(`...${mergeName}`), `${mergeName} is not merged`);
}
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-non-standard-distances-v231"'),
  "The persistent seed version was not advanced",
);
assert(
  packageSource.includes('"verify:uk-ireland-non-standard-distances"'),
  "The package verifier command is missing",
);

console.log(
  `Verified ${verifiedNonStandardDistanceSeries.length} new series, ${verifiedNonStandardDistanceEditions.length} added editions, ${nonStandardDistanceEditionReplacements.length} safe distance/date migrations, ${Object.keys(nonStandardDistanceSlugAliases).length} aliases and ${nonStandardDistanceResearchQueue.length} held conflicts.`,
);
