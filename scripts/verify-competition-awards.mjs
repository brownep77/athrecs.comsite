import assert from "node:assert/strict";
import {
  competitionContext,
  historyAwards,
  recordedAwards,
} from "../src/lib/athrecs/competition-awards.ts";
import { buildCompetitionHonours } from "../src/lib/athrecs/competition-honours.ts";

// Synthetic sources: these fixtures assert display rules, never establish real results.
const row = (extra = {}) => ({
  year: 2024,
  date: "2024-08-01",
  sourceDate: "",
  ageGroup: "",
  discipline: "10000 Metres",
  performance: "28:00.00",
  wind: "",
  place: "1",
  venue: "Example stadium, FRA",
  meeting: "Olympic Games",
  sourceUrls: ["https://results.example/olympics/10000"],
  labels: ["Round: F"],
  providerName: "Fixture timer",
  verificationStatus: "source_verified",
  ...extra,
});
const histories = (rows) => [
  {
    provider: "Fixture timer",
    externalId: "fixture",
    sourceUrl: "https://results.example/athlete",
    capturedAt: "2026-01-01",
    complete: false,
    yearsExpected: [],
    yearsCaptured: [],
    performances: rows,
  },
];
const honours = (rows) => buildCompetitionHonours([], histories(rows), "M");
for (const [event, tier] of [
  ["Olympic Games, Paris", "olympic"],
  ["XXXIII Olympic Games", "olympic"],
  ["Paralympic Games", "paralympic"],
  ["IAAF World Championships", "world"],
  ["World Indoor Championships", "world"],
  ["World Athletics Road Running Championships", "world"],
  ["World Masters Athletics Championships", "world"],
  ["European Athletics Championships", "continental"],
  ["Commonwealth Games", "continental"],
  ["AAA Championships", "national"],
  ["British Masters Championships", "national"],
  ["Norfolk County Championships", "regional"],
  ["Example Club Championships", "local"],
  ["Wanda Diamond League Final", "international"],
  ["Example parkrun", "community"],
  ["Olympic Park 5K", "race"],
  ["World Championship Charity Run", "race"],
  ["Olympic distance triathlon", "race"],
])
  assert.equal(competitionContext({ event, verified: true }).tier, tier, event);
assert.equal(
  competitionContext({
    event: "Chicago Marathon",
    discipline: "Marathon",
    date: "1996-10-20",
    verified: true,
  }).tier,
  "major",
);
assert.equal(
  competitionContext({
    event: "Chicago Marathon",
    discipline: "10K",
    date: "1996-10-20",
    verified: true,
  }).tier,
  "race",
);
assert.equal(
  competitionContext({
    event: "Sydney Marathon",
    discipline: "Marathon",
    date: "2024-09-01",
    verified: true,
  }).tier,
  "race",
);
assert.equal(competitionContext({ event: "Olympic Games", verified: false }).tier, "race");
assert.equal(historyAwards(row())[0].kind, "gold");
assert.equal(historyAwards(row({ place: "2" }))[0].kind, "silver");
assert.equal(historyAwards(row({ place: "3" }))[0].kind, "bronze");
for (const labels of [["Round: h2"], ["Round: SF1"], ["Round: Q"], [], ["Round: F", "Round: H1"]]) {
  assert.equal(historyAwards(row({ labels }))[0].kind, "finisher", JSON.stringify(labels));
  assert(!honours([row({ labels })]).some((award) => award.kind === "gold"));
}
assert.equal(historyAwards(row({ labels: ["Round: F", "Round: Final"] }))[0].kind, "gold");
for (const performance of ["DNF", "DNS", "DQ", "DSQ", "28:00+"])
  assert.deepEqual(historyAwards(row({ performance })), []);
assert.deepEqual(historyAwards(row({ date: "2199-08-01" })), []);
assert.deepEqual(honours([row({ verificationStatus: "unverified" })]), []);
assert.equal(honours([row({ performance: "DNF" })])[0].kind, "participation");
assert.deepEqual(honours([row({ performance: "DNS" })]), []);
assert.deepEqual(honours([row({ performance: "DQ" })]), []);
assert.equal(honours([row({ performance: "DNF", yearLabel: "1990 or 1991", date: "" })]).length, 0);

const masters = row({
  meeting: "World Masters Athletics Championships",
  ageGroup: "M50",
  places: { overall: 8, gender: 5, category: 1 },
});
const mastersAwards = historyAwards(masters, "M");
assert.equal(mastersAwards[0].kind, "finisher");
assert.equal(mastersAwards[1].kind, "gold");
assert.equal(mastersAwards[1].scope, "category");
assert.match(mastersAwards[1].label, /Masters.*M50 age\/category/);
assert.equal(
  honours([masters]).find((award) => award.kind === "gold").scope,
  "Masters · Category · M50",
);
assert(
  !historyAwards({ ...masters, places: undefined }).some((award) => award.podium),
  "An age group and unspecified placing cannot invent a category/overall medal",
);
assert(
  !historyAwards({ ...masters, labels: ["Round: F", "Category Position: 2"] }).some(
    (award) => award.podium,
  ),
  "Conflicting category placings are suppressed",
);
assert(
  !historyAwards(row({ labels: ["Round: F", "Overall Position: 2", "Overall Position: 3"] })).some(
    (award) => award.podium,
  ),
);
assert.equal(
  historyAwards(
    row({
      meeting: "British Masters Championships",
      ageGroup: "F40",
      places: { overall: 9, gender: 1, category: 1 },
    }),
    "F",
  ).filter((award) => award.podium).length,
  2,
);

const editions = honours([
  row({ place: "3", labels: ["Round: H1"], date: "1992-07-31", year: 1992 }),
  row({ place: "11", date: "1992-08-03", year: 1992 }),
  row({ place: "11", labels: ["Round: H1"], date: "1996-07-26", year: 1996 }),
]);
assert.equal(editions.length, 1);
assert.equal(editions[0].kind, "participation");
assert.equal(editions[0].evidence.length, 2, "Count Olympic editions, not rounds");
assert.equal(honours([row(), row()]).find((award) => award.kind === "gold").evidence.length, 1);
assert.equal(
  honours([row(), row({ place: "2" })]).length,
  0,
  "Disputed copies cannot create competing medals",
);
assert.equal(honours([row(), row({ performance: "28:01.00" })]).length, 0);
assert.equal(honours([row({ meeting: "Example parkrun", labels: [] })]).length, 0);
assert.equal(
  honours([
    row({
      meeting: "Chicago Marathon",
      discipline: "Marathon",
      performance: "2:08:52",
      labels: [],
    }),
  ])[0].kind,
  "trophy",
);

const recorded = {
  resultId: 1,
  editionId: 1,
  eventName: "Olympic Games",
  eventSlug: "fixture-olympics",
  eventDate: "2024-08-01",
  sport: "Athletics",
  surface: "Track",
  country: "France",
  distanceCode: "10000m",
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 1680,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: 1,
  category: null,
  sourceUrls: row().sourceUrls,
  resultSource: "Fixture timer",
  details: { verificationStatus: "source_verified" },
};
assert.equal(
  recordedAwards(recorded)[0].kind,
  "finisher",
  "A stored track result needs final evidence",
);
assert.equal(
  buildCompetitionHonours([recorded], histories([row()])).find((award) => award.kind === "gold")
    .evidence.length,
  1,
  "Matched final evidence decorates a canonical row once",
);
console.log(
  "Competition tiers, final medals, category scope, verified honours and edition deduplication passed.",
);
