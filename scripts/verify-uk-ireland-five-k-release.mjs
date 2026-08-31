#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  ukIrelandFiveKExistingSeriesEditions,
  ukIrelandFiveKReleaseEditionOverrides,
  ukIrelandFiveKReleaseEditionReplacements,
  ukIrelandFiveKReleaseEditions,
  ukIrelandFiveKReleaseResearchQueue,
  ukIrelandFiveKReleaseSeries,
  ukIrelandFiveKReleaseSeriesOverrides,
} from "../src/data/uk-ireland-five-k-release-2026-08-28.ts";

const TODAY = "2026-08-28";
const HORIZON = "2027-12-31";
const COUNTRIES = new Set(["England", "Scotland", "Wales", "Northern Ireland", "Ireland"]);

assert.equal(ukIrelandFiveKReleaseSeries.length, 52);
assert.equal(ukIrelandFiveKReleaseEditions.length, 54);
assert.equal(ukIrelandFiveKExistingSeriesEditions.length, 12);
assert.equal(Object.keys(ukIrelandFiveKReleaseEditionOverrides).length, 9);
assert.equal(ukIrelandFiveKReleaseEditionReplacements.length, 2);
assert.equal(ukIrelandFiveKReleaseResearchQueue.length, 6);

const slugs = new Set();
const names = new Set();
for (const series of ukIrelandFiveKReleaseSeries) {
  const name = series.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  assert(!slugs.has(series.slug), `Duplicate new 5K slug: ${series.slug}`);
  assert(!names.has(name), `Duplicate new 5K name: ${series.name}`);
  slugs.add(series.slug);
  names.add(name);
  assert.equal(series.sport, "Running");
  assert(series.distances.includes("5K"), `${series.slug} is missing 5K`);
  assert(COUNTRIES.has(series.country), `${series.slug} is outside the release countries`);
  assert.match(series.website, /^https:\/\//);
  assert.equal(series.website, series.source_url);
}

const editionKeys = new Set();
for (const edition of [...ukIrelandFiveKReleaseEditions, ...ukIrelandFiveKExistingSeriesEditions]) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate 5K release edition: ${key}`);
  editionKeys.add(key);
  assert(edition.date >= TODAY && edition.date <= HORIZON, `${key} is outside the horizon`);
  assert.equal(edition.distance, "5K");
  assert.equal(edition.distanceKm, 5);
  assert.equal(edition.status, "Open");
  assert.match(edition.source, /^https:\/\//);
  assert.equal(edition.entryOptions?.length, 1);
  assert.equal(edition.entryOptions?.[0]?.checkedAt, TODAY);
  assert.equal(edition.entryOptions?.[0]?.isVerified, true);
  assert.equal(edition.entryOptions?.[0]?.isPrimary, true);
  assert.equal(edition.entryOptions?.[0]?.entryType, "official");
}

for (const held of ukIrelandFiveKReleaseResearchQueue) {
  assert(!slugs.has(held.slug), `${held.slug} is held but was made public`);
  assert.match(held.sourceUrl, /^https:\/\//);
}

assert.equal(ukIrelandFiveKReleaseSeriesOverrides["ruthin-evening-5k"]?.country, "Wales");
assert.equal(
  ukIrelandFiveKReleaseSeriesOverrides["druridge-bay-beach-trail-runs"]?.country,
  "England",
);
assert.equal(
  ukIrelandFiveKReleaseEditionOverrides["lifford-strabane-5k-2026|2026-09-06|5K"]?.date,
  "2026-09-20",
);
assert.equal(
  ukIrelandFiveKReleaseEditionOverrides["ruthin-evening-5k|2026-09-02|5K"]?.startTime,
  "18:30",
);

const [catalogueSource, entrySource, packageSource, publisherSource] = await Promise.all([
  fs.readFile(new URL("../src/data/catalogue.ts", import.meta.url), "utf8"),
  fs.readFile(new URL("../src/data/entry-options.ts", import.meta.url), "utf8"),
  fs.readFile(new URL("../package.json", import.meta.url), "utf8"),
  fs.readFile(new URL("./publish-after-build.mjs", import.meta.url), "utf8"),
]);
assert(catalogueSource.includes('from "./uk-ireland-five-k-release-2026-08-28"'));
assert(catalogueSource.includes("...(ukIrelandFiveKReleaseSeries as Series[])"));
assert(catalogueSource.includes("...(ukIrelandFiveKExistingSeriesEditions as Edition[])"));
assert(entrySource.includes("...ukIrelandFiveKReleaseEditionReplacements"));
assert(entrySource.includes("...ukIrelandFiveKReleaseEditionOverrides"));
assert(entrySource.includes("...ukIrelandFiveKReleaseSeriesOverrides"));
assert(packageSource.includes("publish-after-build.mjs"));
assert(publisherSource.includes("scripts/publish-uk-ireland-five-k-release.mjs"));
assert(publisherSource.includes("process.exit(0)"));

console.log(
  `Verified ${ukIrelandFiveKReleaseSeries.length} new 5K series, ${ukIrelandFiveKReleaseEditions.length + ukIrelandFiveKExistingSeriesEditions.length} new editions, nine corrections and ${ukIrelandFiveKReleaseResearchQueue.length} held candidates.`,
);