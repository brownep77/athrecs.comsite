import assert from "node:assert/strict";
import {
  marathonDesSablesEditions,
  marathonDesSablesSeries,
} from "../src/data/marathon-des-sables.ts";
import { raceFormatGuideFor } from "../src/data/race-format-guides.ts";

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

const legendaryGuide = raceFormatGuideFor("mds-legendary-morocco");
assert(legendaryGuide, "MDS Legendary must have a detailed race-format guide");
assert.equal(legendaryGuide.stages.length, 6, "MDS Legendary must list all six stages");
assert(
  legendaryGuide.facts.some(
    (fact) => fact.label === "Total distance" && fact.value.includes("250 km"),
  ),
  "MDS Legendary must show its approximate 250 km total distance",
);
assert(
  legendaryGuide.stageNote.includes("change each year"),
  "MDS Legendary stage distances must be labelled as variable",
);
assert(
  legendaryGuide.sourceUrl.startsWith("https://marathondessables.com/"),
  "MDS Legendary format details must use the official organiser source",
);

console.log(
  `Marathon des Sables verified: ${marathonDesSablesSeries.length} pages, ${marathonDesSablesEditions.length} sourced editions, six Legendary stages, no invented Peru or Jordan fixture.`,
);
