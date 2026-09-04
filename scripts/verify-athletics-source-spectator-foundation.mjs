#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { professionalAthletes } from "../src/data/professional-athletes.ts";
import { parseFixtureSourceRegistry } from "../src/lib/athrecs/source-registry.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const [registryCsv, migration, sharedApi, athleticsApi, calendarRoute, raceRoute, athleteRoute] =
  await Promise.all([
    read("../docs/source-registry/fixture-result-sources.csv"),
    read("../migrations/0028_edition_spectator_access.sql"),
    read("../src/lib/athrecs/api.ts"),
    read("../src/athletics/api.ts"),
    read("../src/athletics/routes/calendar.tsx"),
    read("../src/routes/races/$slug.tsx"),
    read("../src/routes/athletes/$slug.tsx"),
  ]);

const registry = parseFixtureSourceRegistry(registryCsv);
const requiredHeldSources = [
  "world_athletics_cross_country_tour",
  "world_athletics_race_walking_tour",
  "world_athletics_combined_events_tour",
  "world_athletics_member_federations",
  "european_athletics",
  "world_para_athletics",
  "world_masters_athletics",
  "roster_athletics",
  "athletic_net",
  "tfrrs",
  "direct_athletics",
  "milesplit",
  "tilastopaja",
];

for (const sourceId of requiredHeldSources) {
  const source = registry.find((item) => item.source_id === sourceId);
  assert(source, `Missing athletics source: ${sourceId}`);
  assert.equal(
    source.enabled,
    false,
    `${sourceId} must remain held until its rights review passes`,
  );
  assert.match(source.rights_status, /review|required|blocked|do not copy/i);
}

assert.match(migration, /create table if not exists edition_spectator_access/);
assert.match(
  migration,
  /'free'.*'ticketed'.*'free_and_ticketed'.*'registration_required'.*'sold_out'.*'unknown'/s,
);
assert.match(migration, /source_url text not null check \(source_url ~ '\^https:\/\/'\)/);
assert.match(migration, /where is_verified/);
assert.match(sharedApi, /from edition_spectator_access spectator/);
assert.match(sharedApi, /and spectator\.is_verified/);
assert.match(sharedApi, /spectator_access: parseSpectatorAccess/);
assert.match(athleticsApi, /spectator_access_type/);
assert.match(athleticsApi, /filter \(where spectator\.is_verified\)/);
assert.match(calendarRoute, /Free to watch/);
assert.match(calendarRoute, /Tickets available/);
assert.match(raceRoute, /Spectator access/);
assert.match(raceRoute, /spectatorAccess\.ticket_url/);
assert.match(raceRoute, /<Fact label="Entry"/);
assert.match(raceRoute, /<Fact label="Spectators"/);

assert.equal(professionalAthletes.length, 6, "The first professional-athlete cohort changed");
assert.equal(
  new Set(professionalAthletes.map((athlete) => athlete.slug)).size,
  professionalAthletes.length,
  "Professional-athlete slugs must be unique",
);
for (const athlete of professionalAthletes) {
  assert.equal(athlete.profile_type, "Public figure");
  assert(athlete.profile_roles?.includes("Professional athlete"));
  assert.match(athlete.source_url ?? "", /^https:\/\/worldathletics\.org\/athletes\//);
  assert(
    athlete.profile_links?.some((link) => /^https:\/\/(?:www\.)?instagram\.com\//.test(link.url)),
    `${athlete.slug} needs a checked Instagram link`,
  );
  assert(
    athlete.profile_links?.some(
      (link) =>
        link.label === "World Athletics records & results" && link.url === athlete.source_url,
    ),
    `${athlete.slug} needs an official records link`,
  );
}
assert.match(athleteRoute, /Professional athlete profile/);
assert.match(athleteRoute, /No source-checked performance rows have been added/);

console.log(
  JSON.stringify(
    {
      fixture_and_result_sources: registry.length,
      strategic_sources_held_for_review: requiredHeldSources.length,
      professional_athletes: professionalAthletes.length,
      spectator_access: "verified-edition-metadata-only",
      athlete_entry_separate: true,
    },
    null,
    2,
  ),
);
