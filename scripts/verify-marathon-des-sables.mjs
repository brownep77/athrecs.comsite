import assert from "node:assert/strict";
import {
  marathonDesSablesEditions,
  marathonDesSablesSeries,
} from "../src/data/marathon-des-sables.ts";

assert.equal(marathonDesSablesSeries.length, 12, "Expected all 12 current MDS race pages");
assert.equal(marathonDesSablesEditions.length, 10, "Expected ten exactly dated MDS editions");
assert.equal(
  new Set(marathonDesSablesSeries.map((series) => series.slug)).size,
  marathonDesSablesSeries.length,
  "MDS series slugs must be unique",
);
assert.equal(
  new Set(marathonDesSablesEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`))
    .size,
  marathonDesSablesEditions.length,
  "MDS edition dates must be unique within each series",
);

const seriesSlugs = new Set(marathonDesSablesSeries.map((series) => series.slug));
assert(
  marathonDesSablesEditions.every((edition) => seriesSlugs.has(edition.seriesSlug)),
  "Every MDS edition must reference an MDS series page",
);
assert(
  marathonDesSablesSeries.every(
    (series) =>
      series.website.startsWith("https://marathondessables.com/") &&
      series.source_url === series.website,
  ),
  "Every MDS page must use its official organiser source",
);
assert(
  !marathonDesSablesEditions.some((edition) => edition.seriesSlug === "mds-120-peru"),
  "The cancelled MDS 120 Peru 2026 fixture must not be published",
);
assert(
  !marathonDesSablesEditions.some((edition) => edition.seriesSlug === "mds-120-jordan"),
  "MDS 120 Jordan must remain date-TBC until an exact official date is published",
);

console.log(
  `Marathon des Sables verified: ${marathonDesSablesSeries.length} pages, ${marathonDesSablesEditions.length} sourced editions, no invented Peru or Jordan fixture.`,
);
