import assert from "node:assert/strict";
import { buildRaceWinAchievements as build } from "../src/lib/athrecs/race-win-achievements.ts";
import { combineProfileResults } from "../src/lib/athrecs/profile-records.ts";

const today = new Date("2026-09-22T12:00:00Z");
const race = (id, extra = {}) => ({
  resultId: id,
  editionId: id,
  eventName: `Test race ${id}`,
  eventSlug: `test-race-${id}`,
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: "2026-06-01",
  distanceCode: "10K",
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 2100,
  chipTimeSeconds: 2100,
  gunTimeSeconds: 2102,
  overallPlace: 8,
  genderPlace: 1,
  categoryPlace: 1,
  resultGender: "F",
  category: "F40-44",
  sourceUrls: [`https://example.test/results/${id}`],
  ...extra,
});
const source = (extra = {}) => ({
  year: 2026,
  date: "2026-06-01",
  sourceDate: "1 Jun",
  ageGroup: "F40-44",
  discipline: "10k",
  performance: "35:00",
  wind: "",
  place: "8",
  venue: "Test town",
  meeting: "Test race 1",
  sourceUrls: ["https://example.test/results/1"],
  labels: ["Gender Pos: 1", "Cat Pos: 1"],
  ...extra,
});
const history = (performances) => ({
  provider: "Synthetic timing source",
  externalId: "synthetic",
  sourceUrl: "https://example.test",
  capturedAt: "2026-09-22",
  complete: false,
  yearsExpected: [2026],
  yearsCaptured: [2026],
  performances,
});
const wins = (results = [], rows = []) =>
  build(results, rows.length ? [history(rows)] : [], "F", today);

assert.deepEqual(
  wins([race(1)]).map((w) => [w.kind, w.label]),
  [
    ["gender", "Women’s race"],
    ["category", "Category · F40-44"],
  ],
  "A woman's race win must not become an overall win",
);
assert.equal(wins([race(1, { overallPlace: 1 })]).filter((w) => w.kind === "overall").length, 1);
assert.equal(wins([race(1, { genderPlace: 2 })]).length, 1, "Category-only win remains separate");
assert.equal(wins([race(1), race(2, { distanceCode: "10 km" })])[0].results.length, 2);
assert.equal(
  wins([race(1), race(1, { resultId: 99 })])[0].results.length,
  1,
  "Same edition is counted once",
);
assert.equal(
  wins([race(1)], [source()])[0].results.length,
  1,
  "Source history does not duplicate canonical win",
);
assert.equal(wins([], [source(), source()])[0].results.length, 1);
assert.equal(
  wins([], [source({ meeting: "Alternate race name" }), source()])[0].results.length,
  1,
  "Primary result URL identifies duplicates",
);
assert(!wins([race(1), race(1, { resultId: 2, genderPlace: 2 })]).some((w) => w.kind === "gender"));
assert.equal(
  wins(combineProfileResults([race(1), race(1, { resultId: 2, categoryPlace: 2 })])).length,
  0,
  "Profile deduplication preserves conflicting classification placings",
);
const missingPlacing = combineProfileResults([
  race(1, { genderPlace: null, categoryPlace: null }),
  race(1, { resultId: 2 }),
]);
assert.equal(missingPlacing.length, 1);
assert.equal(
  missingPlacing[0].conflicting,
  false,
  "An absent placing is not a conflicting placing",
);
assert.deepEqual([missingPlacing[0].genderPlace, missingPlacing[0].categoryPlace], [1, 1]);
assert.equal(wins(missingPlacing).length, 2);
assert(!wins([race(1)], [source({ labels: ["Gender Pos: 2"] })]).some((w) => w.kind === "gender"));
assert.equal(wins([], [source({ labels: ["Gender Pos: 1", "Gender Pos: 2"] })]).length, 0);
for (const extra of [
  { status: "DNF" },
  { status: "DNS" },
  { status: "DQ" },
  { conflicting: true },
  { eventDate: "2027-06-01" },
  { eventName: "10K relay" },
  { eventName: "Stage 1" },
  { eventName: "10K heat" },
  { sport: "Parkrun" },
  { eventName: "Virtual 10K" },
  {
    details: {
      disqualification: {
        reason: "other",
        sourceUrl: "https://example.test/dq",
        decisionDate: "2026-06-02",
        note: "Test",
      },
    },
  },
])
  assert.equal(wins([race(1, extra)]).length, 0, JSON.stringify(extra));
for (const extra of [
  { performance: "DNF" },
  { performance: "0:00" },
  { date: "2027-06-01" },
  { date: "2026-02-30" },
  { labels: ["Club-reported Gender Pos: 1"] },
  { labels: ["Gender Pos: 1", "Unresolved identity"] },
  { labels: ["Gender Pos: 1", "Virtual event"] },
  { labels: ["Gender Pos: 1", "Run split"] },
  { labels: [], place: "1" },
  { labels: ["PB rank: 1"] },
  { labels: ["Gender Pos: 10"] },
  { labels: ["Gender Pos: 1"], sourceUrls: [] },
  { disqualification: { reason: "other" } },
])
  assert.equal(wins([], [source(extra)]).length, 0, JSON.stringify(extra));
assert.equal(
  wins([], [source({ labels: ["Gender Pos: 1 (official winners list)"] })])[0].kind,
  "gender",
);
assert.equal(wins([], [source({ labels: ["Cat Pos: 1"], ageGroup: "None" })]).length, 0);
assert.equal(wins([], [source({ labels: ["Overall Pos: 1"] })])[0].kind, "overall");
assert.equal(wins([race(1, { category: null, genderPlace: 2 })]).length, 0);
assert.equal(wins([race(1, { distanceCode: "Marathon", distanceKm: 21.1 })]).length, 0);
assert.equal(wins([race(1, { distanceCode: "Discus", distanceKm: 0 })]).length, 0);
assert.equal(
  wins([], [source({ discipline: "10M" })]).length,
  0,
  "Ambiguous M does not become metres or miles",
);
assert.equal(wins([race(1, { distanceCode: "10mi", distanceKm: 16.093 })])[0].distance, "10 miles");
assert.equal(
  wins([race(1, { distanceCode: "Half Marathon", distanceKm: 21.1 })])[0].distance,
  "Half marathon",
);
assert.equal(
  wins([race(1), race(2, { sport: "Cycling" })]).length,
  4,
  "Different sports retain separate wins",
);
assert.equal(
  wins(
    [],
    [
      source({
        discipline: "Triathlon — IRONMAN",
        performance: "10:25:17",
        labels: ["Gender Pos: 1", "Bike split: 5:33:54"],
      }),
    ],
  )[0].sport,
  "Triathlon",
);
assert.deepEqual(wins(), []);
console.log(
  "Race-win checks passed: classification, distances, deduplication, conflicts, source provenance and exclusions.",
);
