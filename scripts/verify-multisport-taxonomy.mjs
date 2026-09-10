#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  isTemporaryRunningEdition,
  isTemporaryRunningEvent,
} from "../src/athletics/temporary-running.ts";

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
  for (const sport of networkSports) {
    assert(source.includes(`"${sport}"`), `${path} does not include ${sport}`);
  }
}

const filters = await readFile("src/lib/athrecs/filters.ts", "utf8");
assert(filters.includes('sport === "Adventure Racing"'), "Adventure Racing needs shared filters");
assert(
  filters.includes('sport === "Functional Fitness"'),
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
  athleticsFilters.includes('export const SPORTS = ["Athletics", "Running"] as const') &&
    athleticsFilters.includes('export const DEFAULT_SPORT = "Athletics" as const'),
  "ATHRECS must expose Athletics and the temporary Running collection, defaulting to Athletics",
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
