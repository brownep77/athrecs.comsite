#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [filters, search, sharedApi, runRecsApi, card, calendar] = await Promise.all([
  readFile("src/runrecs/filters.ts", "utf8"),
  readFile("src/components/races/EventSearch.tsx", "utf8"),
  readFile("src/lib/athrecs/api.ts", "utf8"),
  readFile("src/runrecs/api.ts", "utf8"),
  readFile("src/components/races/RaceCard.tsx", "utf8"),
  readFile("src/routes/calendar.tsx", "utf8"),
]);

assert.match(filters, /PREFER_DROPDOWN_FILTERS = true/);
assert.match(filters, /sport === "All" \? "Running" : sport/);
assert.match(filters, /sport === "All" \|\| base\.supportsRaceGroupFilter/);

assert.match(search, /listEventRegions/);
assert.match(search, /Choose a country first/);
assert.match(search, /All areas \/ regions/);
assert.match(search, /preferSelect=\{PREFER_DROPDOWN_FILTERS\}/);
assert.match(search, /Running and parkrun filters are applied together/);

assert.match(sharedApi, /export const listEventRegions/);
assert.match(sharedApi, /coalesce\(e\.region/);
assert.match(sharedApi, /groups_json/);
assert.match(sharedApi, /groups: parseRaceGroups\(groups_json\)/);

assert.match(runRecsApi, /export const listEventRegions/);
assert.match(runRecsApi, /\["Running", "Parkrun"\]/);
assert.match(runRecsApi, /lower\(coalesce\(e\.region, ''\)\) like/);

assert.match(card, /Start time TBC/);
assert.match(card, /`Starts \$\{startLabel\}`/);
assert.match(card, /RaceGroupBadges groups=\{race\.groups\}/);

assert.match(calendar, /RaceGroupBadges groups=\{ed\.groups \?\? \[\]\}/);
assert.match(calendar, /groups: ed\.groups/);
assert.match(calendar, /Start time TBC/);

console.log("RunRecs calendar controls, start times and competition badges verified");
