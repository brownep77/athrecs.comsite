import assert from "node:assert/strict";
import {
  raceCollectionEditions,
  raceCollectionSeries,
  raceGroupDefinitions,
  raceGroupMemberships,
} from "../src/data/race-collections.ts";

const byCode = (code) => raceGroupMemberships.filter((membership) => membership.groupCode === code);
const worldMajors = byCode("world-marathon-majors");
const utmbWorldSeries = byCode("utmb-world-series");
const utmbIndex = byCode("utmb-index");

assert.equal(raceGroupDefinitions.length, 3, "Expected three race collection definitions");
assert.equal(worldMajors.length, 8, "Expected all eight current World Marathon Majors");
assert.equal(utmbWorldSeries.length, 67, "Expected 67 official 2026 UTMB World Series events");
assert.equal(utmbIndex.length, 9, "Expected nine individually verified UTMB Index races");
assert.equal(
  new Set(raceGroupMemberships.map((membership) => `${membership.seriesSlug}|${membership.groupCode}`))
    .size,
  raceGroupMemberships.length,
  "Race group memberships must be unique",
);
assert.equal(
  utmbWorldSeries.filter((membership) => membership.level === "final").length,
  1,
  "Expected one UTMB World Series Finals event",
);
assert.equal(
  utmbWorldSeries.filter((membership) => membership.level === "major").length,
  4,
  "Expected four 2026 UTMB World Series Majors",
);
assert(
  utmbWorldSeries.every((membership) =>
    /^https:\/\/[^/]+\.utmb\.world\/?$/.test(membership.sourceUrl),
  ),
  "World Series memberships must link to official UTMB event sites",
);
assert(
  utmbIndex.every(
    (membership) =>
      membership.sourceUrl.startsWith("https://utmb.world/utmb-index/races/") &&
      /does not award Running Stones/i.test(membership.note),
  ),
  "Index memberships must use official edition pages and state that they do not award stones",
);
assert(
  !raceGroupMemberships.some((membership) => membership.seriesSlug.includes("western-states")),
  "The externally listed Western States race must not be presented as a UTMB World Series event",
);

const generatedSlugs = new Set(raceCollectionSeries.map((series) => series.slug));
for (const membership of [...utmbWorldSeries, ...utmbIndex]) {
  assert(generatedSlugs.has(membership.seriesSlug), `Missing generated race ${membership.seriesSlug}`);
}
const editionSlugs = new Set(raceCollectionEditions.map((edition) => edition.seriesSlug));
assert(
  utmbIndex.every((membership) => editionSlugs.has(membership.seriesSlug)),
  "Every verified Index race needs a dated edition",
);

console.log(
  `Race groups verified: ${worldMajors.length} World Marathon Majors, ${utmbWorldSeries.length} UTMB World Series events, ${utmbIndex.length} UTMB Index races.`,
);
