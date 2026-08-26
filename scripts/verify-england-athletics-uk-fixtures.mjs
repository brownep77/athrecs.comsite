import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  englandAthleticsUkFixturesEditions,
  englandAthleticsUkFixturesSeries,
} from "../src/data/england-athletics-uk-fixtures.ts";

const CHECKED_AT = "2026-08-26";
const HORIZON = "2027-12-31";
const SOURCE_URL = "https://fixtures.myathletics.uk/";

const audit = JSON.parse(
  await readFile(
    new URL(
      "../docs/england-athletics-runevents/audit-uk-fixtures-2026-08-26.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

assert.equal(audit.checkedAt, CHECKED_AT);
assert.equal(audit.horizonEnd, HORIZON);
assert.equal(audit.sourceUrl, SOURCE_URL);
assert.deepEqual(audit.counts, {
  sourceRows: 200,
  deduplicatedRows: 200,
  alreadyPresent: 11,
  reusedExistingSeries: 0,
  newSeries: 138,
  newEditions: 189,
  ambiguousHeld: 0,
});
assert.deepEqual(audit.disciplines, {
  "Cross Country": 84,
  "Outdoor - Track and Field": 115,
  Ultra: 1,
});
assert.equal(
  audit.counts.alreadyPresent + audit.counts.newEditions,
  audit.counts.deduplicatedRows,
  "Every fully licensed fixture must be present or added",
);

assert.equal(englandAthleticsUkFixturesSeries.length, 138);
assert.equal(englandAthleticsUkFixturesEditions.length, 189);
const seriesBySlug = new Map(
  englandAthleticsUkFixturesSeries.map((series) => [series.slug, series]),
);
assert.equal(seriesBySlug.size, englandAthleticsUkFixturesSeries.length, "Duplicate fixture slug");

for (const series of englandAthleticsUkFixturesSeries) {
  assert.equal(series.country, "England", `${series.slug} must be assigned to England`);
  assert(["Athletics", "Running"].includes(series.sport), `${series.slug} has the wrong sport`);
  assert(series.name && series.city && series.area, `${series.slug} is missing event metadata`);
  assert.equal(series.distances.length, 1, `${series.slug} needs one discipline badge`);
  assert.match(series.website, /^https?:\/\//, `${series.slug} has no public event source`);
  assert.equal(series.source_url, SOURCE_URL, `${series.slug} has the wrong source URL`);
}

const editionKeys = new Set();
for (const edition of englandAthleticsUkFixturesEditions) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate fully licensed fixture: ${key}`);
  editionKeys.add(key);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown fixture series: ${edition.seriesSlug}`);
  assert(
    edition.date >= CHECKED_AT && edition.date <= HORIZON,
    `Fixture is outside the audited horizon: ${key}`,
  );
  assert.equal(edition.status, "TBC", `${key} must not claim unverified entry availability`);
  if (edition.entryUrl) {
    assert.match(edition.entryUrl, /^https?:\/\//, `Invalid organiser URL for ${key}`);
  }
  assert.equal(edition.source, SOURCE_URL, `Wrong fixture source for ${key}`);
}

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes('from "./england-athletics-uk-fixtures"'));
assert(catalogueSource.includes("...(englandAthleticsUkFixturesSeries as Series[])"));
assert(catalogueSource.includes("...(englandAthleticsUkFixturesEditions as Edition[])"));

const seedSource = await readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-england-athletics-calendar-v249"'),
  "The production catalogue seed version was not advanced",
);

process.stdout.write(
  `${JSON.stringify(
    {
      checked_at: CHECKED_AT,
      horizon: HORIZON,
      source_rows: audit.counts.sourceRows,
      already_present: audit.counts.alreadyPresent,
      new_series: englandAthleticsUkFixturesSeries.length,
      new_fixtures: englandAthleticsUkFixturesEditions.length,
      disciplines: audit.disciplines,
      ambiguous_held: audit.counts.ambiguousHeld,
    },
    null,
    2,
  )}\n`,
);
