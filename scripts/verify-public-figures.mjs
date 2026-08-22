import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  publicFigureAthletes,
  publicFigureEditions,
  publicFigureResults,
  publicFigureSeries,
} from "../src/data/public-figures.ts";

const expectedProfiles = [
  "rich-roll",
  "harry-styles",
  "gordon-ramsay",
  "kevin-hart",
  "colin-farrell",
  "jennifer-connelly",
];

assert.deepEqual(
  publicFigureAthletes.map((athlete) => athlete.slug),
  expectedProfiles,
  "The reviewed public-figure profile set changed unexpectedly",
);
assert.equal(
  new Set(publicFigureAthletes.map((athlete) => athlete.slug)).size,
  publicFigureAthletes.length,
  "Public-figure athlete slugs must be unique",
);
assert(
  publicFigureAthletes.every(
    (athlete) =>
      athlete.profile_type === "Public figure" &&
      athlete.profile_source_checked_at &&
      athlete.source_url?.startsWith("https://") &&
      !athlete.avatar_url,
  ),
  "Every public figure needs a checked HTTPS source and must not use an unlicensed image",
);

const catalogueSource = readFileSync(new URL("../src/data/catalogue.ts", import.meta.url), "utf8");
assert.match(catalogueSource, /\.\.\.\(publicFigureSeries as Series\[\]\)/);
assert.match(catalogueSource, /\.\.\.\(publicFigureEditions as Edition\[\]\)/);

const publicFigureEditionKeys = new Set(
  publicFigureEditions.map(
    (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
  ),
);
assert(
  publicFigureSeries.every((series) => series.source_url?.startsWith("https://")),
  "Every public-figure series needs an HTTPS source",
);

const athleteSlugs = new Set(publicFigureAthletes.map((athlete) => athlete.slug));
assert(
  publicFigureResults.every(
    (result) =>
      athleteSlugs.has(result.athleteSlug) &&
      publicFigureEditionKeys.has(`${result.eventSlug}|${result.date}|${result.distance}`) &&
      result.finishTimeSeconds > 0 &&
      result.source.startsWith("https://"),
  ),
  "Every public-figure result needs an athlete, catalogue edition, time and HTTPS source",
);

console.log(
  `Verified ${publicFigureAthletes.length} public figures, ${publicFigureResults.length} results and ${publicFigureEditions.length} editions.`,
);
