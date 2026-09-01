#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { worldAthleticsEditions, worldAthleticsSeries } from "../src/data/world-athletics.ts";
import { parseFixtureSourceRegistry } from "../src/lib/athrecs/source-registry.ts";

const WINDOW_START = "2026-09-01";
const WINDOW_END = "2027-12-31";
const seriesBySlug = new Map(worldAthleticsSeries.map((series) => [series.slug, series]));
const editionKeys = new Set();

assert.equal(
  seriesBySlug.size,
  worldAthleticsSeries.length,
  "World Athletics slugs must be unique",
);
for (const edition of worldAthleticsEditions) {
  assert(seriesBySlug.has(edition.seriesSlug), `Missing series for ${edition.seriesSlug}`);
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate World Athletics edition: ${key}`);
  editionKeys.add(key);
}

const refreshedTrackEditions = worldAthleticsEditions.filter((edition) => {
  const series = seriesBySlug.get(edition.seriesSlug);
  return series?.surface === "Track" && edition.date >= WINDOW_START && edition.date <= WINDOW_END;
});
const refreshedTrackSlugs = new Set(refreshedTrackEditions.map((edition) => edition.seriesSlug));
const refreshedTrackSeries = [...refreshedTrackSlugs].map((slug) => seriesBySlug.get(slug));

assert(
  refreshedTrackSeries.length >= 800,
  `Expected at least 800 official track meetings through 2027, found ${refreshedTrackSeries.length}`,
);
assert(
  new Set(refreshedTrackSeries.map((series) => series?.country)).size >= 85,
  "Official track coverage must span at least 85 countries",
);
assert(
  refreshedTrackSeries.every(
    (series) =>
      series?.sport === "Athletics" &&
      series.surface === "Track" &&
      series.website.startsWith("https://worldathletics.org/competition/calendar-results/results/"),
  ),
  "Refreshed track meetings must retain Athletics taxonomy and official provenance",
);

const diamondLeague2027 = refreshedTrackSeries.filter((series) =>
  /diamond league/i.test(`${series?.summary} ${series?.description}`),
);
const diamondNames = new Set(diamondLeague2027.map((series) => series?.name));
for (const expected of [
  "Doha Meeting",
  "Wanda Diamond League Shanghai",
  "Wanda Diamond League Xiamen",
  "Golden Gala",
  "Olso Bislett Games",
  "BAUHAUS-Galan",
  "Meeting de Paris",
  "Prefontaine Classic",
  "Meeting International d’Athlétisme Herculis EBS",
  "Athletissima Lausanne",
  "London Athletics Meet",
  "Silesia Kamila Skolimowska Memorial",
  "Memorial van Damme",
  "Weltklasse Zürich",
]) {
  assert(diamondNames.has(expected), `Missing 2027 Diamond League meeting: ${expected}`);
}
assert(diamondNames.size >= 14, "The full 2027 Diamond League circuit must be present");

const registryCsv = await readFile(
  new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
  "utf8",
);
const registry = parseFixtureSourceRegistry(registryCsv);
const requiredSources = new Map([
  ["world_athletics_global_calendar", "Track"],
  ["wanda_diamond_league", "Track"],
  ["world_athletics_continental_tour", "Track"],
  ["world_athletics_indoor_tour", "Track"],
]);
for (const [sourceId, surface] of requiredSources) {
  const source = registry.find((item) => item.source_id === sourceId);
  assert(source, `Missing official athletics source: ${sourceId}`);
  assert(source.enabled, `${sourceId} must be enabled`);
  assert(source.surface_scope.includes(surface), `${sourceId} must cover ${surface}`);
}

const nationalFederations = registry.filter(
  (source) =>
    /Fixtures/.test(source.source_section) &&
    /athletic|track and field|federation/i.test(`${source.source_name} ${source.notes}`),
);
assert(
  nationalFederations.length >= 45,
  `Expected a worldwide national-federation research layer, found ${nationalFederations.length}`,
);

const calendarRoute = await readFile(
  new URL("../src/athletics/routes/calendar.tsx", import.meta.url),
  "utf8",
);
assert.match(calendarRoute, /listAthleticsCalendarPage/);
assert.match(calendarRoute, /competition_label/);
assert.match(calendarRoute, /of \$\{data\.total\.toLocaleString/);

const athleticsApi = await readFile(new URL("../src/athletics/api.ts", import.meta.url), "utf8");
assert.match(athleticsApi, /requestedDistance === "Track & field"/);
assert.match(athleticsApi, /trackAndFieldOnly.*event\.surface = 'Track'/s);

console.log(
  JSON.stringify(
    {
      official_track_meetings: refreshedTrackSeries.length,
      official_track_competition_days: refreshedTrackEditions.length,
      countries: new Set(refreshedTrackSeries.map((series) => series?.country)).size,
      diamond_league_2027: diamondNames.size,
      national_federation_sources: nationalFederations.length,
    },
    null,
    2,
  ),
);
