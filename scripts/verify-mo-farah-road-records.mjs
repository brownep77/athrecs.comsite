import assert from "node:assert/strict";
import { moFarahRoadResults, moFarahRoadEditions } from "../src/data/mo-farah-road-results.ts";
import { publicFigureResults, publicFigureEditions } from "../src/data/public-figures.ts";
import { findPersonalBests, eligiblePerformance } from "../src/lib/athrecs/profile-records.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { roadPerformanceCondition } from "../src/lib/athrecs/road-performance-conditions.ts";

const seconds = (time) =>
  time === "DNF" ? null : time.split(":").reduce((n, part) => n * 60 + Number(part), 0);
const rows = moFarahRoadResults.map((result, i) => ({
  resultId: i + 1,
  editionId: i + 1,
  eventName: result.eventSlug,
  eventSlug: result.eventSlug,
  eventDate: result.date,
  distanceCode: result.distance,
  distanceKm: moFarahRoadEditions[i].distanceKm,
  sport: "Running",
  surface: "Road",
  country: result.eventSlug === "chicago-marathon" ? "United States" : "England",
  status: result.status,
  finishTimeSeconds: seconds(result.time),
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: result.place,
  category: result.category,
  sourceUrls: [result.source],
  resultSource: result.resultSource,
}));
assert.equal(rows.length, 52);
assert.equal(publicFigureResults.filter((r) => r.athleteSlug === "mo-farah").length, 52);
const keys = publicFigureEditions.map((e) => `${e.seriesSlug}|${e.date}|${e.distance}`);
assert.equal(new Set(keys).size, keys.length, "Shared London editions are imported once");
assert.deepEqual(
  Object.fromEntries(findPersonalBests(rows).map((r) => [r.distanceCode, r.finishTimeSeconds])),
  {
    "1mi": 242,
    "5K": 810,
    "10K": 1664,
    "10mi": 2785,
    Half: 3572,
    Marathon: 7511,
  },
);
const board = buildProfileAchievements(rows, new Date("2026-09-17T12:00:00Z"));
assert.equal(board.finishes.length, 50);
assert.equal(board.marathons.length, 6);
assert.equal(board.completedMajors.length, 2);
assert.equal(rows.filter((r) => r.status === "DNF").length, 2);
assert(
  rows
    .filter((r) => r.status === "DNF")
    .every((r) => r.finishTimeSeconds === null && !eligiblePerformance(r)),
);
const assisted = rows.find((r) => r.eventDate === "2019-09-08");
assert.equal(assisted.finishTimeSeconds, 3547);
assert.equal(eligiblePerformance(assisted), false);
assert.equal(
  board.finishes.some((r) => r.resultId === assisted.resultId),
  true,
  "An assisted finish still counts as a finish",
);
assert.equal(
  roadPerformanceCondition({ ...assisted, eventDate: "2021-09-12" }),
  null,
  "A different course edition is not inferred to be assisted",
);
assert.equal(eligiblePerformance(rows.find((r) => r.eventDate === "2018-03-04")), false);
assert.equal(eligiblePerformance({ ...assisted, eventSlug: "unrelated-half-marathon" }), true);
assert(rows.every((r) => r.sourceUrls[0].startsWith("https://")));
console.log(
  "Mo Farah: 52 sourced road entries, 50 finishes, 6 marathon finishes, 2 majors and six eligible PB categories; assisted/UNC/DNF cases kept separate.",
);
