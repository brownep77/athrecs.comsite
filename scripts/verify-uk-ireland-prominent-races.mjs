#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  prominentUkIrelandEditions,
  prominentUkIrelandEditionOverrides,
  prominentUkIrelandEntryOptions,
  prominentUkIrelandExpectedNewSlugs,
  prominentUkIrelandSeries,
  prominentUkIrelandSeriesOverrides,
} from "../src/data/uk-ireland-prominent-races-2026-2027.ts";

const CHECKED_AT = "2026-08-27";
const HORIZON = "2027-08-27";
const SEATON_CLASSIC_KEY = "seaton-classic-10k|2026-09-26|10K";
const EXISTING_SLUGS = [
  "dingle-marathon-half-2026",
  "connemara-international-marathon",
  "the-village-run-5k-2026",
];

assert.equal(prominentUkIrelandSeries.length, 29, "New prominent-race series count changed");
assert.equal(
  prominentUkIrelandExpectedNewSlugs.length,
  29,
  "Expected new-slug count changed",
);
assert.equal(prominentUkIrelandEditions.length, 51, "Prominent-race edition count changed");
assert.equal(
  new Set(prominentUkIrelandExpectedNewSlugs).size,
  prominentUkIrelandExpectedNewSlugs.length,
  "Duplicate expected race slug",
);
assert.deepEqual(
  prominentUkIrelandSeries.map((series) => series.slug),
  prominentUkIrelandExpectedNewSlugs,
  "Expected slugs no longer match the new-series payload",
);

const seriesBySlug = new Map(prominentUkIrelandSeries.map((series) => [series.slug, series]));
for (const series of prominentUkIrelandSeries) {
  assert.equal(series.sport, "Running", `Wrong sport: ${series.slug}`);
  assert(series.country, `Missing country: ${series.slug}`);
  assert(series.city, `Missing city: ${series.slug}`);
  assert(series.distances.length > 0, `Missing distances: ${series.slug}`);
  assert.match(series.website, /^https:\/\//, `Missing official website: ${series.slug}`);
  assert.match(series.source_url ?? "", /^https:\/\//, `Missing source URL: ${series.slug}`);
  assert(
    !EXISTING_SLUGS.includes(series.slug),
    `Existing event was incorrectly duplicated as a new series: ${series.slug}`,
  );
}

const editionKeys = new Set();
for (const edition of prominentUkIrelandEditions) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate edition row: ${key}`);
  editionKeys.add(key);
  assert(
    seriesBySlug.has(edition.seriesSlug) || EXISTING_SLUGS.includes(edition.seriesSlug),
    `Edition references an unknown event: ${key}`,
  );
  assert(
    edition.date >= CHECKED_AT && edition.date <= HORIZON,
    `Edition is outside the requested 12-month window: ${key}`,
  );
  assert.match(edition.source, /^https:\/\//, `Missing edition source: ${key}`);
  if (key === "portadown-running-festival|2027-03-14|Unspecified") {
    assert.equal(edition.status, "TBC", "Portadown must remain TBC until distances publish");
    assert.equal(edition.distanceKm, 0, "Portadown must not invent a distance");
  } else {
    assert(edition.distanceKm > 0, `Invalid distance units: ${key}`);
  }

  const advertisedCount = seriesBySlug.get(edition.seriesSlug)?.distances.length ?? 0;
  if (advertisedCount > 1 || EXISTING_SLUGS.includes(edition.seriesSlug)) {
    assert.equal(
      edition.publishAllDistances,
      true,
      `Multi-distance row can be collapsed by the catalogue: ${key}`,
    );
  }
  if (key === SEATON_CLASSIC_KEY) {
    assert.equal(edition.entryUrl, undefined, "Seaton must not invent a direct entry URL");
  } else if (edition.status === "Open" || edition.status === "Closed") {
    assert.match(edition.entryUrl ?? "", /^https:\/\//, `Missing entry link: ${key}`);
    assert.equal(edition.entryOptions?.[0]?.checkedAt, CHECKED_AT, `Stale entry check: ${key}`);
    assert.equal(edition.entryOptions?.[0]?.isVerified, true, `Unverified entry: ${key}`);
  }
}

function distancesFor(slug, date) {
  return prominentUkIrelandEditions
    .filter((edition) => edition.seriesSlug === slug && edition.date === date)
    .map((edition) => edition.distance)
    .sort();
}

assert.deepEqual(
  distancesFor("beaumaris-run-fest-coast-2-castle", "2026-09-13"),
  ["10K", "Half"].sort(),
  "Beaumaris programme is incomplete",
);
assert.deepEqual(
  distancesFor("skyrun-the-mournes", "2026-10-10"),
  ["20K", "35K", "50K"],
  "SkyRun the Mournes programme is incomplete",
);
assert.deepEqual(
  distancesFor("northern-traverse-series", "2027-04-03"),
  ["100K", "300K", "55K", "80K"],
  "Northern Traverse programme is incomplete",
);
assert.deepEqual(
  distancesFor("connemara-international-marathon", "2027-04-25"),
  ["Half", "Ultra"],
  "Connemarathon supplemental distances are incomplete",
);
assert.deepEqual(
  distancesFor("the-village-run-5k-2026", "2026-09-27"),
  ["10K", "3/4 Marathon", "Half"].sort(),
  "The Village Run supplemental distances are incomplete",
);
assert.deepEqual(
  prominentUkIrelandSeriesOverrides["dingle-marathon-half-2026"].distances,
  ["Half", "Marathon"],
  "Dingle series enrichment changed",
);
assert.deepEqual(
  prominentUkIrelandSeriesOverrides["connemara-international-marathon"].distances,
  ["Half", "Marathon", "Ultra"],
  "Connemarathon series enrichment changed",
);
assert.deepEqual(
  prominentUkIrelandSeriesOverrides["the-village-run-5k-2026"].distances,
  ["5K", "10K", "Half", "3/4 Marathon"],
  "The Village Run series enrichment changed",
);

for (const key of [
  "dingle-marathon-half-2026|2026-09-05|Half",
  "connemara-international-marathon|2027-04-25|Marathon",
  "the-village-run-5k-2026|2026-09-27|5K",
]) {
  assert(prominentUkIrelandEditionOverrides[key], `Missing existing-edition override: ${key}`);
  assert(prominentUkIrelandEntryOptions[key], `Missing existing-edition entry option: ${key}`);
}

const catalogueSource = await readFile("src/data/catalogue.ts", "utf8");
for (const token of ["prominentUkIrelandSeries", "prominentUkIrelandEditions"]) {
  assert(catalogueSource.includes(token), `Catalogue is not wired to ${token}`);
}
const entryOptionsSource = await readFile("src/data/entry-options.ts", "utf8");
for (const token of [
  "prominentUkIrelandSeriesOverrides",
  "prominentUkIrelandEditionOverrides",
  "prominentUkIrelandEntryOptions",
  "SEATON_CLASSIC_KEY",
  'status: "TBC"',
  "official-seaton-classic-10k-2026",
]) {
  assert(entryOptionsSource.includes(token), `Entry options are not wired to ${token}`);
}

const publisherSource = await readFile("scripts/publish-uk-ireland-prominent-races.mjs", "utf8");
for (const token of [
  'process.env.VERCEL_ENV === "production"',
  'branch !== "main"',
  "stageCatalogueBatch",
  "validateCatalogueBatch",
  "publishCatalogueBatch",
  "payload.events.length > 75",
  "payload.editions.length > 200",
  "SEATON_CLASSIC_KEY",
  'status: "TBC"',
]) {
  assert(publisherSource.includes(token), `Safe publication script is missing ${token}`);
}

const packageSource = JSON.parse(await readFile("package.json", "utf8"));
assert(
  packageSource.scripts.build.includes("publish-uk-ireland-prominent-races.mjs"),
  "Production build does not run the reviewed publication batch",
);
assert(
  packageSource.scripts["verify:uk-ireland-prominent-races"],
  "Targeted verifier is not registered",
);
assert(
  packageSource.scripts["ci:verify"].includes("verify:uk-ireland-prominent-races"),
  "Targeted verifier is absent from CI",
);

console.log(
  `Verified ${prominentUkIrelandSeries.length} new UK/Ireland race series, ${prominentUkIrelandEditions.length} catalogue editions and three existing-event enrichments.`,
);
