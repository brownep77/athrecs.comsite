import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  englandAthleticsRunEventsEditions,
  englandAthleticsRunEventsSeries,
} from "../src/data/england-athletics-runevents.ts";

const CHECKED_AT = "2026-08-26";
const HORIZON = "2027-12-31";
const SOURCE_URL = "https://www.englandathletics.org/runevents/search/";

const audit = JSON.parse(
  await readFile(
    new URL("../docs/england-athletics-runevents/audit-2026-08-26.json", import.meta.url),
    "utf8",
  ),
);

assert.equal(audit.checkedAt, CHECKED_AT);
assert.equal(audit.horizonEnd, HORIZON);
assert.equal(audit.sourceUrl, SOURCE_URL);
assert.deepEqual(audit.counts, {
  sourceRows: 631,
  futureRows: 627,
  deduplicatedRows: 621,
  eligibleRows: 535,
  alreadyPresent: 239,
  reusedExistingSeries: 54,
  newSeries: 105,
  newEditions: 267,
  ambiguousHeld: 115,
  invalidHeld: 86,
});

assert.equal(
  englandAthleticsRunEventsSeries.length,
  audit.counts.newSeries,
  "England Athletics series count no longer matches the audited snapshot",
);
assert.equal(
  englandAthleticsRunEventsEditions.length,
  audit.counts.newEditions,
  "England Athletics edition count no longer matches the audited snapshot",
);

const seriesBySlug = new Map(
  englandAthleticsRunEventsSeries.map((series) => [series.slug, series]),
);
assert.equal(
  seriesBySlug.size,
  englandAthleticsRunEventsSeries.length,
  "Duplicate England Athletics series slug",
);

for (const series of englandAthleticsRunEventsSeries) {
  assert.equal(series.country, "England", `${series.slug} must be assigned to England`);
  assert.equal(series.sport, "Running", `${series.slug} must be a running event`);
  assert(series.name && series.city && series.area, `${series.slug} is missing location metadata`);
  assert(series.distances.length > 0, `${series.slug} has no advertised distances`);
  assert.match(series.website, /^https?:\/\//, `${series.slug} has no official event URL`);
  assert.equal(series.source_url, SOURCE_URL, `${series.slug} has the wrong source URL`);
}

const reusedSlugs = new Set(audit.reused.map((record) => record.matchedSlug));
assert.equal(reusedSlugs.size, 27, "Unexpected reused-series set");
const editionKeys = new Set();
const raceDates = new Set();
for (const edition of englandAthleticsRunEventsEditions) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate England Athletics edition: ${key}`);
  editionKeys.add(key);
  raceDates.add(`${edition.seriesSlug}|${edition.date}`);
  assert(
    seriesBySlug.has(edition.seriesSlug) || reusedSlugs.has(edition.seriesSlug),
    `Unknown England Athletics series: ${edition.seriesSlug}`,
  );
  assert(
    edition.date >= CHECKED_AT && edition.date <= HORIZON,
    `England Athletics edition is outside the audited horizon: ${key}`,
  );
  assert.equal(edition.status, "Open", `${key} should remain linked to its official listing`);
  assert.match(edition.entryUrl ?? "", /^https?:\/\//, `Missing official event URL for ${key}`);
  assert.equal(edition.source, SOURCE_URL, `Wrong audit source for ${key}`);
  assert.equal(
    edition.publishAllDistances,
    true,
    `Advertised same-day distance is not publishable: ${key}`,
  );
}
assert.equal(raceDates.size, 181, "Unexpected England Athletics race-date count");

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes('from "./england-athletics-runevents"'));
assert(catalogueSource.includes("...(englandAthleticsRunEventsSeries as Series[])"));
assert(catalogueSource.includes("...(englandAthleticsRunEventsEditions as Edition[])"));

process.stdout.write(
  `${JSON.stringify(
    {
      checked_at: CHECKED_AT,
      horizon: HORIZON,
      source_rows: audit.counts.sourceRows,
      already_present: audit.counts.alreadyPresent,
      reused_existing_series: audit.counts.reusedExistingSeries,
      new_series: englandAthleticsRunEventsSeries.length,
      published_race_dates: raceDates.size,
      advertised_distance_rows: englandAthleticsRunEventsEditions.length,
      ambiguous_held: audit.counts.ambiguousHeld,
      invalid_held: audit.counts.invalidHeld,
    },
    null,
    2,
  )}\n`,
);
