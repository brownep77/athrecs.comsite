#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  runrecsFinalFiveKEditionOverrides,
  runrecsFinalFiveKEditions,
  runrecsFinalFiveKExistingSeriesEditions,
  runrecsFinalFiveKPublishedKeys,
  runrecsFinalFiveKSeries,
  runrecsFinalFiveKSeriesOverrides,
} from "../src/data/runrecs-five-k-final-release-2026-08-31.ts";

const allEditions = [...runrecsFinalFiveKEditions, ...runrecsFinalFiveKExistingSeriesEditions];

assert.equal(runrecsFinalFiveKSeries.length, 24);
assert.equal(runrecsFinalFiveKEditions.length, 24);
assert.equal(runrecsFinalFiveKExistingSeriesEditions.length, 10);
assert.equal(allEditions.length, 34);
assert.equal(runrecsFinalFiveKPublishedKeys.length, 34);
assert.equal(new Set(runrecsFinalFiveKPublishedKeys).size, 34);
assert.equal(Object.keys(runrecsFinalFiveKEditionOverrides).length, 4);
assert.equal(Object.keys(runrecsFinalFiveKSeriesOverrides).length, 5);

const newSlugs = new Set();
const newNames = new Set();
for (const series of runrecsFinalFiveKSeries) {
  const nameKey = series.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  assert(!newSlugs.has(series.slug), `Duplicate new Runrecs 5K slug: ${series.slug}`);
  assert(!newNames.has(nameKey), `Duplicate new Runrecs 5K name: ${series.name}`);
  newSlugs.add(series.slug);
  newNames.add(nameKey);
  assert.equal(series.sport, "Running");
  assert(series.distances.includes("5K"), `${series.slug} is missing 5K`);
  assert.match(series.website, /^https:\/\//);
  assert.equal(series.website, series.source_url);
}

for (const edition of allEditions) {
  assert.equal(edition.distance, "5K");
  assert.equal(edition.distanceKm, 5);
  assert.equal(edition.publishAllDistances, true);
  assert.match(edition.source, /^https:\/\//);
  assert(edition.date >= "2026-08-30" && edition.date <= "2027-12-31");
  if (edition.entryOptions) {
    assert.equal(edition.entryOptions.length, 1);
    assert.equal(edition.entryOptions[0].checkedAt, "2026-08-31");
    assert.equal(edition.entryOptions[0].entryType, "official");
    assert.equal(edition.entryOptions[0].isVerified, true);
    assert.equal(edition.entryOptions[0].isPrimary, true);
  } else {
    assert.equal(edition.status, "TBC");
  }
}

for (const heldSlug of [
  "run-the-bridges-5k-2026",
  "croi-night-run-sligo-2026",
  "moiras-run-2026",
  "southampton-5k-2026",
]) {
  assert(!newSlugs.has(heldSlug), `${heldSlug} is provisional but was published`);
}

for (const requiredKey of [
  "flete-10k|2026-09-12|5K",
  "tonbridge-half-marathon|2026-10-04|5K",
  "run-heaton-5k-10k-half-marathon-october|2026-10-11|5K",
  "run-heaton-5k-10k-half-marathon-november|2026-11-29|5K",
  "croft-running-festival-november-2026|2026-11-01|5K",
  "run-heaton-park-half-marathon-march-2027|2027-03-28|5K",
  "kettering-half-marathon-march|2027-03-14|5K",
  "surrey-half-marathon-2027|2027-03-21|5K",
  "leeds-running-festival-march-2027|2027-03-28|5K",
  "lambton-castle-summer-trail-runs|2027-08-15|5K",
]) {
  assert(runrecsFinalFiveKPublishedKeys.includes(requiredKey), `Missing ${requiredKey}`);
}

const [catalogueSource, entryOptionsSource, seedSource] = await Promise.all([
  fs.readFile(new URL("../src/data/catalogue.ts", import.meta.url), "utf8"),
  fs.readFile(new URL("../src/data/entry-options.ts", import.meta.url), "utf8"),
  fs.readFile(new URL("../src/lib/athrecs/seed.server.ts", import.meta.url), "utf8"),
]);

assert(catalogueSource.includes('from "./runrecs-five-k-final-release-2026-08-31"'));
assert(catalogueSource.includes("...(runrecsFinalFiveKSeries as Series[])"));
assert(catalogueSource.includes("...(runrecsFinalFiveKExistingSeriesEditions as Edition[])"));
assert(entryOptionsSource.includes("...runrecsFinalFiveKEditionOverrides"));
assert(entryOptionsSource.includes("...runrecsFinalFiveKSeriesOverrides"));
assert(
  seedSource.includes("athrecs-runrecs-uk-ireland-five-mile-five-k-2026-08-31-v276"),
);

console.log(
  "Verified 24 new Runrecs 5K series, 10 added 5K editions on existing cards, four official-source enrichments and four held provisional races.",
);
