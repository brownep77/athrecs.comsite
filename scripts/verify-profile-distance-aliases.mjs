import assert from "node:assert/strict";
import { profileDisciplineLabel } from "../src/lib/athrecs/profile-timeline.ts";
import {
  combineProfileResults,
  findPersonalBests,
  performanceGroup,
  personalBestGroup,
} from "../src/lib/athrecs/profile-records.ts";
import { profilePersonalBestSummary } from "../src/lib/athrecs/profile-personal-best-summary.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { profileAchievementResults } from "../src/lib/athrecs/profile-history-results.ts";

// Synthetic profile with old and new import spellings, plus a faster pending PB.
export const distanceAliasResults = ["10k", "10K", "10 km"].map((distanceCode, index) => ({
  resultId: index + 1,
  editionId: index + 1,
  eventName: `Example race ${index + 1}`,
  eventSlug: `example-race-${index + 1}`,
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: `2025-06-0${index + 1}`,
  distanceCode,
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 2500 - index * 100,
  chipTimeSeconds: 2500 - index * 100,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  sourceUrls: [],
  details: { verificationStatus: index === 0 ? "source_verified" : "unverified" },
}));
const before = JSON.stringify(distanceAliasResults);
assert.deepEqual(
  [...new Set(distanceAliasResults.map((r) => profileDisciplineLabel(r.distanceCode)))],
  ["10K"],
);
assert.deepEqual(
  findPersonalBests(distanceAliasResults).map((r) => r.resultId),
  [3],
);
const summary = profilePersonalBestSummary(distanceAliasResults, []);
assert.equal(summary.length, 1);
assert.equal(summary[0].distance, "10K");
assert.equal(summary[0].mark, "38:20");
assert.equal(summary[0].verified, false, "Normalising a distance never verifies a result");
const achievements = buildProfileAchievements(distanceAliasResults, new Date("2026-01-01"));
assert.equal(achievements.finishes.length, 3, "Separate races remain separate finishes");
assert.equal(achievements.distanceFinishes.find((r) => r.id === "10K").results.length, 3);
assert(achievements.milestones.some((m) => m.id === "personal-improvement"));
const base = distanceAliasResults[0];
for (const changes of [
  { distanceCode: "10000m", sport: "Athletics", surface: "Track" },
  { distanceCode: "10K", surface: "Cross Country" },
  { distanceCode: "10K", surface: "Unknown" },
  { distanceCode: "10K", sport: "Swimming" },
  { distanceCode: "10K (short course)" },
  { distanceCode: "10K relay" },
  { distanceCode: "10K", distanceKm: 9.9 },
])
  assert.notEqual(personalBestGroup(base), personalBestGroup({ ...base, ...changes }));
assert.notEqual(
  performanceGroup(base),
  performanceGroup({ ...base, chipTimeSeconds: null, gunTimeSeconds: base.finishTimeSeconds }),
);
assert.notEqual(
  personalBestGroup({ ...base, distanceCode: "5k", distanceKm: 5 }),
  personalBestGroup({ ...base, distanceCode: "5K", distanceKm: 5, sport: "Parkrun" }),
);
assert.equal(profileDisciplineLabel("5k"), "5K");
assert.equal(profileDisciplineLabel("10k (short course)"), "10k (short course)");

const duplicate = [
  { ...base, editionId: 0 },
  { ...base, editionId: 0, resultId: 99, distanceCode: "10K" },
];
assert.equal(combineProfileResults(duplicate).length, 1);
assert.equal(buildProfileAchievements(duplicate).finishes.length, 1);
assert.equal(
  buildProfileAchievements([duplicate[0], { ...duplicate[1], surface: "Cross Country" }]).finishes
    .length,
  2,
);
assert(
  combineProfileResults([duplicate[0], { ...duplicate[1], finishTimeSeconds: 2400 }]).every(
    (r) => r.conflicting,
  ),
);
const histories = [
  {
    provider: "Example timer",
    externalId: "synthetic",
    sourceUrl: "https://example.test/results",
    capturedAt: "2026-01-01",
    complete: true,
    yearsExpected: [2025],
    yearsCaptured: [2025],
    performances: [
      {
        year: 2025,
        date: base.eventDate,
        sourceDate: base.eventDate,
        discipline: "10K",
        performance: "41:40",
        place: "",
        wind: "",
        ageGroup: "",
        venue: "United Kingdom",
        meeting: base.eventName,
        sourceUrls: [],
        labels: ["Road"],
        verificationStatus: "unverified",
      },
    ],
  },
];
assert.equal(
  profileAchievementResults([base], histories).length,
  1,
  "History and canonical copies must not double-count",
);
assert.equal(JSON.stringify(distanceAliasResults), before, "Source data remains untouched");
console.log(
  "Profile distance aliases: shared labels, PBs, progress, totals and source preservation passed.",
);
