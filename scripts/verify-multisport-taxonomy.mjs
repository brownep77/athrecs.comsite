#!/usr/bin/env node
import { ATHRECS_PUBLIC_SPORTS, isAthrecsPublicSport } from "../src/lib/athrecs/public-sports.ts";
import { SPORT_PAGES } from "../src/lib/athrecs/sport-pages.ts";
import assert from "node:assert/strict";
const compactSource = (value) => value.replace(/\s+/g, "").replace(/,([\])])/g, "$1");
import { readFile } from "node:fs/promises";
import {
  isTemporaryRunningEdition,
  isTemporaryRunningEvent,
} from "../src/athletics/temporary-running.ts";

const addedSports = [
  "HYROX",
  "DEKA",
  "CrossFit",
  "Swimrun",
  "Indoor Rowing",
  "Orienteering",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
  "Adventure Racing",
  "Functional Fitness",
];
for (const sport of addedSports) {
  assert(isAthrecsPublicSport(sport));
  assert(SPORT_PAGES.some((page) => page.sport === sport));
}
assert.equal(new Set(ATHRECS_PUBLIC_SPORTS).size, ATHRECS_PUBLIC_SPORTS.length);
for (const invalid of [null, undefined, "All", "Unsupported", "constructor", "__proto__"])
  assert(!isAthrecsPublicSport(invalid));

const networkSports = ["Adventure Racing", "Functional Fitness", "Walking"];
const sharedTaxonomyFiles = [
  "src/data/types.ts",
  "src/lib/athrecs/types.ts",
  "src/lib/athrecs/import.server.ts",
  "src/lib/athrecs/catalogue-publishing.server.ts",
  "src/lib/athrecs/filters.ts",
];

// The shared SportsRecs database, import pipeline and staff backend remain
// multi-sport even though each public specialist site exposes a narrower scope.
for (const path of sharedTaxonomyFiles) {
  const source = await readFile(path, "utf8");
  for (const sport of [...networkSports, ...addedSports]) {
    assert(source.includes(`"${sport}"`), `${path} does not include ${sport}`);
  }
}

const filters = await readFile("src/lib/athrecs/filters.ts", "utf8");
assert(filters.includes('sport === "Adventure Racing"'), "Adventure Racing needs shared filters");
assert(
  compactSource(filters).includes('["Rowing","FunctionalFitness","HYROX","DEKA","CrossFit"].includes(sport)'),
  "Functional Fitness needs shared filters",
);
assert(filters.includes('sport === "Walking"'), "Walking needs shared filters");

const [raceRoute, countryRaceRoute, athleticsFilters, runRecsFilters] = await Promise.all([
  readFile("src/routes/races/index.tsx", "utf8"),
  readFile("src/routes/$language/$country/races/index.tsx", "utf8"),
  readFile("src/athletics/filters.ts", "utf8"),
  readFile("src/runrecs/filters.ts", "utf8"),
]);

for (const routeSource of [raceRoute, countryRaceRoute]) {
  assert(
    routeSource.includes("SPORTS as PUBLIC_SPORTS") && routeSource.includes("PUBLIC_SPORTS.filter"),
    "Public race routes must derive their sport allow-list from the active specialist facade",
  );
  for (const sport of networkSports) {
    assert(
      !routeSource.includes(`"${sport}"`),
      `Public specialist route must not hard-code shared network sport ${sport}`,
    );
  }
}

assert(
  athleticsFilters.includes("ATHRECS_PUBLIC_SPORTS as SPORTS") &&
    athleticsFilters.includes('export const DEFAULT_SPORT = "Athletics" as const'),
  "ATHRECS must expose Athletics, Running, Parkrun, Triathlon and Cycling, defaulting to Athletics",
);
assert(
  runRecsFilters.includes('export const SPORTS = ["All", "Running", "Parkrun"] as const') &&
    runRecsFilters.includes('export const DEFAULT_SPORT = "All" as const'),
  "RunRecs must expose only Running and Parkrun",
);

for (const country of [
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "United Kingdom",
  "Ireland",
]) {
  assert(isTemporaryRunningEvent({ sport: "Running", country }));
}
for (const country of ["France", "Jersey", "Isle of Man", "United States"]) {
  assert(!isTemporaryRunningEvent({ sport: "Running", country }));
}
assert(!isTemporaryRunningEvent({ sport: "Parkrun", country: "England" }));
for (const distance_code of ["5K", "10K"]) {
  assert(isTemporaryRunningEdition({ event_date: "2026-09-10", distance_code }));
  assert(isTemporaryRunningEdition({ event_date: "2027-01-31", distance_code }));
  assert(!isTemporaryRunningEdition({ event_date: "2026-09-09", distance_code }));
  assert(!isTemporaryRunningEdition({ event_date: "2027-02-01", distance_code }));
}
for (const distance_code of ["Half", "Marathon", "5mi", "10mi", "Other"]) {
  assert(!isTemporaryRunningEdition({ event_date: "2026-12-01", distance_code }));
}

process.stdout.write(
  "Shared multisport taxonomy and specialist public-scope verification passed.\n",
);
