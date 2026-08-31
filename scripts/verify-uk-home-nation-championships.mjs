#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ukHomeNationChampionshipsCheckedAt,
  ukHomeNationChampionshipsEditions,
  ukHomeNationChampionshipsExpectedNewSlugs,
  ukHomeNationChampionshipsHeld,
  ukHomeNationChampionshipsHorizon,
  ukHomeNationChampionshipsSeries,
} from "../src/data/uk-home-nation-championships-2026-2027.ts";

const CHECKED_AT = "2026-08-30";
const HORIZON = "2027-12-31";
const EXPECTED_SERIES = 33;
const EXPECTED_EDITIONS = 38;

assert.equal(ukHomeNationChampionshipsCheckedAt, CHECKED_AT);
assert.equal(ukHomeNationChampionshipsHorizon, HORIZON);
assert.equal(
  ukHomeNationChampionshipsSeries.length,
  EXPECTED_SERIES,
  "Championship series count changed",
);
assert.equal(
  ukHomeNationChampionshipsEditions.length,
  EXPECTED_EDITIONS,
  "Championship edition count changed",
);
assert.equal(
  ukHomeNationChampionshipsExpectedNewSlugs.length,
  EXPECTED_SERIES,
  "Expected slug count drifted from the series payload",
);
assert.deepEqual(
  ukHomeNationChampionshipsSeries.map((series) => series.slug),
  ukHomeNationChampionshipsExpectedNewSlugs,
  "Championship slugs no longer match the declared payload",
);
assert.equal(
  new Set(ukHomeNationChampionshipsExpectedNewSlugs).size,
  EXPECTED_SERIES,
  "Duplicate championship slug",
);

const heldNames = ukHomeNationChampionshipsHeld.map((item) => item.name);
for (const required of [
  "Cardiff Half Marathon 2026 including Welsh Half Marathon Championships",
  "Richard Burton 10k 2026 including the Welsh 10km Road Race Championship",
  "Home Nations 5K 2026",
  "ECCA National Cross Country Relay Championships",
  "Seaton Classic 10Km NI Ulster 10K Road Championships",
]) {
  assert(heldNames.includes(required), `Missing duplicate-control hold: ${required}`);
}

const seriesBySlug = new Map(
  ukHomeNationChampionshipsSeries.map((series) => [series.slug, series]),
);
for (const series of ukHomeNationChampionshipsSeries) {
  assert.equal(series.sport, "Athletics", `${series.slug} must stay on the Athletics sport`);
  assert(
    ["England", "Scotland", "Wales", "Northern Ireland"].includes(series.country),
    series.slug,
  );
  assert(
    series.city && series.area && series.organiser,
    `${series.slug} is missing venue metadata`,
  );
  assert.equal(
    series.distances.length,
    1,
    `${series.slug} needs one championship discipline badge`,
  );
  assert.match(series.website, /^https:\/\//, `${series.slug} has no official website`);
  assert.match(series.source_url ?? "", /^https:\/\//, `${series.slug} has no source URL`);
  assert.equal(series.featured, true, `${series.slug} should be featured as a championship`);
}

const editionKeys = new Set();
for (const edition of ukHomeNationChampionshipsEditions) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate championship edition: ${key}`);
  editionKeys.add(key);
  assert(
    seriesBySlug.has(edition.seriesSlug),
    `Unknown championship series: ${edition.seriesSlug}`,
  );
  assert(
    edition.date >= CHECKED_AT.slice(0, 10) || edition.date >= "2026-08-29",
    `Championship is before the remaining-season window: ${key}`,
  );
  assert(edition.date <= HORIZON, `Championship is beyond December 2027: ${key}`);
  assert.equal(edition.status, "TBC", `${key} must not claim unverified entry`);
  assert.equal(edition.entryUrl, undefined, `${key} must not advertise a premature checkout`);
  assert.match(edition.source, /^https:\/\//, `${key} is missing an official source`);
}

assert(seriesBySlug.has("lindsays-national-xc-championships-2027"));
assert(seriesBySlug.has("ecca-english-national-xc-championships-2027"));
assert(seriesBySlug.has("welsh-senior-u18-para-indoor-championships-2027"));
assert(seriesBySlug.has("ni-ulster-combined-event-championships-2026"));

const scottishNationalXc = ukHomeNationChampionshipsEditions.find(
  (edition) =>
    edition.seriesSlug === "lindsays-national-xc-championships-2027" &&
    edition.date === "2027-02-20",
);
const englishNationalXc = ukHomeNationChampionshipsEditions.find(
  (edition) =>
    edition.seriesSlug === "ecca-english-national-xc-championships-2027" &&
    edition.date === "2027-02-20",
);
assert(scottishNationalXc, "Scottish National XC 20 February 2027 is missing");
assert(englishNationalXc, "English National XC 20 February 2027 is missing");
assert.notEqual(
  scottishNationalXc.seriesSlug,
  englishNationalXc.seriesSlug,
  "Scottish and English national XC cards must remain separate",
);

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes('from "./uk-home-nation-championships-2026-2027"'));
assert(catalogueSource.includes("...(ukHomeNationChampionshipsSeries as Series[])"));
assert(catalogueSource.includes("...(ukHomeNationChampionshipsEditions as Edition[])"));

const seedSource = await readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  seedSource.includes("athrecs-runrecs-uk-ireland-five-mile-five-k-2026-08-31-v276"),
  "The production catalogue seed version was not advanced",
);

const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");
const guardedBuildPublisherSource = await readFile(
  new URL("./publish-after-build.mjs", import.meta.url),
  "utf8",
);
assert(packageSource.includes("verify:uk-home-nation-championships"));
assert(packageSource.includes("publish-after-build.mjs"));
assert(guardedBuildPublisherSource.includes("scripts/publish-uk-home-nation-championships.mjs"));

console.log(
  `Verified ${EXPECTED_SERIES} home-nation championship series, ${EXPECTED_EDITIONS} editions, ${ukHomeNationChampionshipsHeld.length} duplicate holds and catalogue wiring through 31 December 2027.`,
);
