import assert from "node:assert/strict";
import {
  buildProfileDistanceSummary,
  distanceSummaryToday,
  ultraParticipationBonus,
} from "../src/lib/athrecs/profile-distance-summary.ts";

const today = new Date("2026-10-23T12:00:00Z");
const race = (id, changes = {}) => ({
  resultId: id,
  editionId: id,
  eventName: `Synthetic race ${id}`,
  eventSlug: `synthetic-race-${id}`,
  sport: "Running",
  surface: "Road",
  country: "GB",
  eventDate: "2026-06-01",
  distanceCode: "5K",
  distanceKm: 5,
  status: "finished",
  finishTimeSeconds: 1200,
  chipTimeSeconds: 1200,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  sourceUrls: [],
  ...changes,
});
const row = (changes = {}) => ({
  year: 2026,
  date: "2026-06-01",
  sourceDate: "1 Jun",
  ageGroup: "",
  discipline: "5K",
  performance: "20:00",
  wind: "",
  place: "20",
  venue: "Synthetic venue",
  meeting: "Synthetic race 1",
  labels: ["Road running"],
  sourceUrls: [],
  verificationStatus: "unverified",
  ...changes,
});
const history = (rows) => [
  { provider: "Synthetic history", externalId: "test", performances: rows },
];
const summary = (results, rows = []) => buildProfileDistanceSummary(results, history(rows), today);

const basic = summary([
  race(1),
  race(2, { distanceCode: "10K", distanceKm: 10, finishTimeSeconds: 2500, chipTimeSeconds: 2500 }),
  race(3, {
    distanceCode: "Half",
    distanceKm: 21.1,
    finishTimeSeconds: 6000,
    chipTimeSeconds: 6000,
    eventDate: "2025-01-01",
  }),
  race(4, {
    distanceCode: "Marathon",
    distanceKm: 42.195,
    finishTimeSeconds: 13000,
    chipTimeSeconds: 13000,
  }),
  race(5, { sport: "Parkrun", surface: "Parkrun" }),
  race(6, { distanceCode: "73.4K", distanceKm: 73.4, surface: "Trail" }),
  race(7, { distanceCode: "Ultra", distanceKm: 0 }),
]);
assert.deepEqual(basic.allTime, {
  completedRaces: 7,
  distanceKm: 156.69,
  unknownDistanceRaces: 1,
  racePoints: 70,
  distancePoints: 156.69,
  ultraBonusPoints: 62.41,
  totalPoints: 289.1,
  verifiedRaces: 0,
  verifiedTotalPoints: 0,
});
assert.equal(basic.currentSeason.year, 2026);
assert.equal(basic.currentSeason.completedRaces, 6);
assert.equal(basic.seasons.find((season) => season.year === 2025).totalPoints, 31.1);
assert.equal(basic.finishes[0].distanceKm >= 0, true);

assert.equal(
  summary([race(1), race(1, { resultId: 101 })]).allTime.totalPoints,
  15,
  "Canonical duplicate counts once",
);
assert.equal(
  summary([race(1)], [row()]).allTime.totalPoints,
  15,
  "Recorded and source-history overlap counts once",
);
assert.equal(
  summary([], [row(), row()]).allTime.totalPoints,
  15,
  "Identical history captures count once",
);
assert.equal(
  summary([race(1)], [row({ performance: "19:59" })]).allTime.completedRaces,
  0,
  "Cross-source disagreement is held, not suppressed by recorded row",
);
assert.equal(
  summary([race(1), race(1, { resultId: 99, finishTimeSeconds: 1201 })]).allTime.completedRaces,
  0,
);
assert.equal(
  summary([race(1), race(1, { resultId: 99, status: "DNF" })]).allTime.completedRaces,
  0,
);
assert.equal(
  summary([race(1), race(1, { resultId: 99, eventDate: "2025-06-01" })]).allTime.completedRaces,
  0,
  "Conflicting edition dates are held",
);
assert.equal(
  summary([race(1), race(1, { resultId: 99, distanceKm: 10, distanceCode: "10K" })]).allTime
    .completedRaces,
  0,
  "Conflicting edition distances are held",
);

const gunAndChip = summary(
  [race(1, { gunTimeSeconds: 1206 })],
  [row({ performance: "20:06", timing: { basis: "gun", gun: "20:06" } })],
);
assert.equal(
  gunAndChip.allTime.completedRaces,
  1,
  "Matching explicit gun and chip marks are compatible",
);
assert.equal(
  summary([race(1)], [row({ performance: "20:06", timing: { basis: "chip", chip: "20:06" } })])
    .allTime.completedRaces,
  0,
  "Different explicit chip marks conflict",
);

assert.equal(
  summary([race(1), race(2)]).allTime.completedRaces,
  2,
  "Separate races on one day count separately",
);
assert.equal(
  summary([
    race(1),
    race(2, { eventName: "Synthetic race 1", distanceCode: "10K", distanceKm: 10 }),
  ]).allTime.completedRaces,
  2,
  "Separate distances on one day remain separate",
);
assert.equal(
  summary([
    race(1),
    race(2, { eventName: "Synthetic race 1", sport: "Parkrun", surface: "Parkrun" }),
  ]).allTime.completedRaces,
  2,
  "Parkrun is distinct from road 5K",
);
assert.equal(
  summary([
    race(1, { sport: "Athletics", surface: "Track", distanceCode: "5000m", displayRound: "heat" }),
    race(1, {
      resultId: 102,
      sport: "Athletics",
      surface: "Track",
      distanceCode: "5000m",
      displayRound: "final",
    }),
  ]).allTime.completedRaces,
  2,
  "Explicit rounds remain separate finishes",
);

for (const change of [
  { distanceCode: "800m", distanceKm: 0.8 },
  { distanceCode: "0.999K", distanceKm: 0.999 },
  { status: "DNF" },
  { status: "DNS" },
  { status: "DQ" },
  { conflicting: true },
  { details: { syntheticTest: true } },
  { details: { profileExcluded: true } },
  { eventDate: "2027-01-01" },
  { eventDate: "2026-12-01" },
  { eventDate: "2026-02-30" },
  { eventDate: "2026" },
  { eventDate: "2025/2026" },
  { sport: "Cycling" },
  { sport: "Swimming" },
  { sport: "Athletics", surface: "Field" },
  { distanceCode: "Marathon relay", distanceKm: 42.195 },
  { distanceCode: "10K split", distanceKm: 10 },
  { distanceCode: "5K stage" },
  { distanceCode: "5K team" },
  { distanceCode: "5K short-course" },
  { eventName: "Synthetic marathon relay", distanceCode: "Marathon", distanceKm: 42.195 },
  { eventName: "Synthetic team total" },
  { eventName: "Synthetic stage total" },
  { distanceCode: "5K", distanceKm: 50 },
  { distanceKm: -5 },
  { distanceKm: NaN },
  { finishTimeSeconds: 0 },
  { finishTimeSeconds: Infinity },
])
  assert.equal(summary([race(1, change)]).allTime.completedRaces, 0, JSON.stringify(change));

assert.equal(
  summary([race(1)], [row({ syntheticTest: true, performance: "01:00" })]).allTime.completedRaces,
  1,
  "A synthetic history duplicate cannot poison a genuine row",
);
assert.equal(
  summary([], [row(), row({ syntheticTest: true, performance: "01:00" })]).allTime.completedRaces,
  1,
);
assert.equal(
  summary([], [row(), row({ labels: ["Split: 5K"], performance: "01:00" })]).allTime.completedRaces,
  1,
  "An excluded split cannot poison a genuine history row",
);

assert.equal(
  summary([race(1, { eventDate: "2025" })]).allTime.completedRaces,
  1,
  "Past year-only completion can count without an invented date",
);
assert.equal(
  summary([race(1, { eventDate: "2025" })]).seasons.find((season) => season.year === 2025)
    .completedRaces,
  1,
);
assert.equal(
  summary([], [row({ date: "", year: 2025, yearLabel: "2024/2025" })]).allTime.completedRaces,
  0,
  "Ambiguous multi-year season cannot supply a calendar year",
);
assert.equal(summary([], [row({ labels: ["split: 5K"] })]).allTime.completedRaces, 0);
assert.equal(
  summary([], [row({ endDate: "2027-01-01" })]).allTime.completedRaces,
  0,
  "A future finishing date does not count yet",
);

const verified = summary([race(1)], [row({ verificationStatus: "source_verified" })]);
assert.equal(verified.allTime.verifiedRaces, 1);
assert.equal(verified.allTime.verifiedTotalPoints, 15);
assert.equal(
  verified.finishes[0].details?.verificationStatus,
  undefined,
  "A duplicate's tick never rewrites canonical verification",
);

const halves = summary(
  Array.from({ length: 20 }, (_, index) =>
    race(index + 1, { distanceKm: 21.0975, distanceCode: "Half" }),
  ),
);
assert.equal(halves.allTime.distanceKm, 421.95, "Sum exact distance before rounding total");
assert.equal(halves.allTime.totalPoints, 621.95);
assert.deepEqual(buildProfileDistanceSummary([], [], today).currentSeason, {
  year: 2026,
  completedRaces: 0,
  distanceKm: 0,
  unknownDistanceRaces: 0,
  racePoints: 0,
  distancePoints: 0,
  ultraBonusPoints: 0,
  totalPoints: 0,
  verifiedRaces: 0,
  verifiedTotalPoints: 0,
});
assert.equal(
  distanceSummaryToday(new Date("2026-06-01T23:30:00Z")),
  "2026-06-02",
  "Cutoff follows Europe/London during BST",
);
const londonMidnight = buildProfileDistanceSummary(
  [race(1, { eventDate: "2026-06-02" })],
  [],
  new Date("2026-06-01T23:30:00Z"),
);
assert.equal(londonMidnight.allTime.completedRaces, 1);

for (const changes of [{ resultGender: "F" }, { surface: "Trail" }]) {
  const a = race(1, { resultGender: "M" });
  const b = race(1, { resultId: 99, resultGender: "M", ...changes });
  for (const results of [
    [a, b],
    [b, a],
  ]) {
    assert.equal(
      summary(results).allTime.completedRaces,
      0,
      "Contradictory explicit category or surface cannot depend on input order",
    );
  }
}
assert.equal(
  summary([race(1), race(1, { resultId: 99, surface: "Unknown" })]).allTime.completedRaces,
  1,
  "Unknown surface is not a contradictory explicit surface",
);
const heat = race(1, {
  sport: "Athletics",
  surface: "Track",
  distanceCode: "5000m",
  displayRound: "heat",
});
const final = race(1, {
  resultId: 2,
  sport: "Athletics",
  surface: "Track",
  distanceCode: "5000m",
  displayRound: "final",
  finishTimeSeconds: 1190,
  chipTimeSeconds: 1190,
});
const unlabelled = { ...heat, resultId: 3, displayRound: undefined };
assert.equal(
  summary([final], [row({ discipline: "5000m", performance: "19:50", labels: ["Round: final"] })])
    .allTime.completedRaces,
  1,
  "Canonical final and explicit history final have the same round identity",
);
for (const records of [
  [heat, final, unlabelled],
  [unlabelled, final, heat],
  [final, unlabelled, heat],
]) {
  assert.equal(
    summary(records).allTime.completedRaces,
    2,
    "Unlabelled capture matches only its unique compatible round",
  );
}
for (const records of [
  [unlabelled, heat, { ...final, finishTimeSeconds: 1200, chipTimeSeconds: 1200 }],
  [heat, { ...final, finishTimeSeconds: 1200, chipTimeSeconds: 1200 }, unlabelled],
]) {
  assert.equal(
    summary(records).allTime.completedRaces,
    2,
    "Ambiguous unlabelled capture cannot bridge heat and final",
  );
}
assert.equal(
  summary([race(1, { distanceKm: 0 })]).allTime.totalPoints,
  15,
  "Explicit 5K code supplies known distance consistently with rating",
);
assert.equal(
  summary([race(1, { distanceCode: "5M", distanceKm: 8.05 })]).allTime.totalPoints,
  18.05,
  "Uppercase M with supplied km identifies miles",
);
assert.equal(
  summary([race(1, { distanceCode: "50M", distanceKm: 80.47 })]).finishes[0].distanceKm,
  80.4672,
);
assert.equal(
  summary([], [row({ performance: "20:06", timing: { basis: "chip", chip: "20:00" } })]).allTime
    .completedRaces,
  0,
  "Explicit timing basis cannot contradict its own main mark",
);

// Progressive ultra bonuses are earned by an individual completed race, never
// by adding together the athlete's shorter events or rounding each event first.
for (const [distanceKm, expected] of [
  [1, 11],
  [1.5, 11.5],
  [1.609344, 11.61],
  [2, 12],
  [3, 13],
  [4, 14],
  [5, 15],
  [10, 20],
  [21.0975, 31.1],
  [42.195, 52.2],
  [50, 75.61],
  [80.4672, 167.01],
  [100, 225.61],
  [160.9344, 469.35],
  [200, 664.68],
  [250, 914.68],
]) {
  const tally = summary([race(1, { distanceCode: `${distanceKm}K`, distanceKm })]).allTime;
  assert.equal(tally.totalPoints, expected, `Progressive participation points for ${distanceKm}km`);
}
for (const invalidDistance of [0, -50, NaN, Infinity])
  assert.equal(ultraParticipationBonus(invalidDistance), 0);
assert.equal(ultraParticipationBonus(42.195), 0, "A marathon does not earn an ultra bonus");
assert.equal(
  summary([race(1, { sport: "Athletics", surface: "Track", distanceCode: "1000m", distanceKm: 1 })])
    .allTime.totalPoints,
  11,
  "A complete 1,000m track race earns points",
);
assert.equal(
  summary([], [row({ discipline: "1000m", labels: ["Track"], performance: "3:00" })]).allTime
    .totalPoints,
  11,
  "Historical track 1K is covered",
);
assert.equal(
  summary([race(1, { sport: "Parkrun", surface: "Parkrun", distanceCode: "2K", distanceKm: 2 })])
    .allTime.totalPoints,
  12,
  "Explicit 2K parkrun distance is retained",
);
for (const boundary of [42.195, 100, 160.9344]) {
  const before = ultraParticipationBonus(boundary - 0.000001);
  const at = ultraParticipationBonus(boundary);
  const after = ultraParticipationBonus(boundary + 0.000001);
  assert(before <= at && at < after, `Bonus increases beyond ${boundary}km`);
  assert(after - before < 0.00001, "No sudden threshold jump");
}
const weeklyParkruns = summary(
  Array.from({ length: 20 }, (_, index) =>
    race(index + 1, { sport: "Parkrun", surface: "Parkrun" }),
  ),
).allTime;
assert.equal(weeklyParkruns.distanceKm, 100);
assert.equal(
  weeklyParkruns.ultraBonusPoints,
  0,
  "Career/season kilometres never trigger an ultra bonus",
);
assert.equal(weeklyParkruns.totalPoints, 300);
const twoFifties = summary([
  race(1, { distanceCode: "50K", distanceKm: 50 }),
  race(2, { distanceCode: "50K", distanceKm: 50 }),
]).allTime;
assert.equal(twoFifties.ultraBonusPoints, 31.22);
assert.equal(twoFifties.totalPoints, 151.22);
assert(twoFifties.totalPoints < 225.61, "A single 100K rewards the longer continuous event");
const seasonalUltras = summary([
  race(1, {
    distanceCode: "50K",
    distanceKm: 50,
    eventDate: "2025-06-01",
    details: { verificationStatus: "source_verified" },
  }),
  race(2, { distanceCode: "100K", distanceKm: 100 }),
]);
assert.equal(seasonalUltras.allTime.totalPoints, 301.22);
assert.equal(seasonalUltras.allTime.ultraBonusPoints, 131.22);
assert.equal(
  seasonalUltras.allTime.verifiedTotalPoints,
  75.61,
  "Verified subtotal includes only the verified event's bonus",
);
assert.equal(seasonalUltras.currentSeason.totalPoints, 225.61);
assert.equal(seasonalUltras.seasons.find(({ year }) => year === 2025).totalPoints, 75.61);
assert.equal(
  summary([race(1, { distanceCode: "Marathon", distanceKm: 42.2 })]).allTime.ultraBonusPoints,
  0,
  "Rounded marathon is not an ultra",
);
assert.equal(
  summary([race(1, { distanceCode: "Ultra", distanceKm: 0 })]).allTime.ultraBonusPoints,
  0,
);
const duplicateUltra = race(1, { distanceCode: "50K", distanceKm: 50 });
assert.equal(
  summary([duplicateUltra, { ...duplicateUltra, resultId: 99 }]).allTime.totalPoints,
  75.61,
);
assert.equal(summary([{ ...duplicateUltra, status: "DNF" }]).allTime.ultraBonusPoints, 0);
assert.equal(
  summary([
    duplicateUltra,
    { ...duplicateUltra, resultId: 99, finishTimeSeconds: 1201, chipTimeSeconds: 1201 },
  ]).allTime.ultraBonusPoints,
  0,
);
assert.equal(
  summary(
    Array.from({ length: 3 }, (_, index) =>
      race(index + 1, { distanceCode: "100mi", distanceKm: 160.9344 }),
    ),
  ).allTime.totalPoints,
  1408.04,
  "Sum raw bonuses before rounding the total",
);

console.log(
  "Profile distance summary: participation, seasons, precise distances, deduplication and conflict checks passed.",
);
