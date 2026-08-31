#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
assert(filters.includes('sport === "Functional Fitness"'), "Functional Fitness needs shared filters");
assert(filters.includes('sport === "Walking"'), "Walking needs shared filters");

const [raceRoute, countryRaceRoute, athleticsFilters, runRecsFilters] = await Promise.all([
  readFile("src/routes/races/index.tsx", "utf8"),
  readFile("src/routes/$language/$country/races/index.tsx", "utf8"),
  readFile("src/athletics/filters.ts", "utf8"),
  readFile("src/runrecs/filters.ts", "utf8"),
]);

for (const routeSource of [raceRoute, countryRaceRoute]) {
  assert(
    routeSource.includes('SPORTS as PUBLIC_SPORTS') &&
      routeSource.includes("PUBLIC_SPORTS.filter"),
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
  athleticsFilters.includes('export const SPORTS = ["Athletics"] as const') &&
    athleticsFilters.includes('export const DEFAULT_SPORT = "Athletics" as const'),
  "ATHRECS must expose Athletics only",
);
assert(
  runRecsFilters.includes('export const SPORTS = ["All", "Running", "Parkrun"] as const') &&
    runRecsFilters.includes('export const DEFAULT_SPORT = "All" as const'),
  "RunRecs must expose only Running and Parkrun",
);

process.stdout.write(
  "Shared multisport taxonomy and specialist public-scope verification passed.\n",
);
