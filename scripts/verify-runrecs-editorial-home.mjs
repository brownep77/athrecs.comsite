#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile("src/runrecs/routes/index.tsx", "utf8");

for (const section of [
  "Every race starts long before the gun.",
  "Stories & guides",
  "Major races to follow",
  "Run board",
  "Coming to RunRecs",
]) {
  assert(home.includes(section), `RunRecs editorial homepage is missing: ${section}`);
}

for (const raceSlug of [
  "great-north-run",
  "berlin-marathon",
  "dublin-marathon",
  "two-oceans-marathon",
  "boston-marathon",
  "london-marathon",
  "comrades-marathon",
]) {
  assert(home.includes(`slug: "${raceSlug}"`), `Major race link is missing: ${raceSlug}`);
}

for (const plannedFeature of [
  "Training plans",
  "Runner rankings",
  "Running news",
  "Claim your runner profile",
  "Submit a race",
  "Submit results",
]) {
  assert(home.includes(`title: "${plannedFeature}"`), `Roadmap item is missing: ${plannedFeature}`);
}

assert.match(home, /comingSoon\.map/);
assert.match(home, /Coming soon/);
assert.match(home, /formatStartTime\(race\.next_start_time/);
assert.match(home, /race\.groups\[0\]\?\.label/);
assert.match(home, /surface: "Trail"/);

for (const forbiddenSport of ["Cycling", "Swimming", "Triathlon", "Duathlon"]) {
  assert(!home.includes(forbiddenSport), `RunRecs homepage leaked ${forbiddenSport}`);
}

console.log("RunRecs editorial homepage stories, major races and roadmap verified");
