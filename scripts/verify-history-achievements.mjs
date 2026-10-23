import assert from "node:assert/strict";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import {
  historyResultCountry,
  isCompletedHistoryResult,
  isTrailHistoryResult,
  isCrossCountryHistoryResult,
  profileAchievementResults,
  sourceHistorySports,
} from "../src/lib/athrecs/profile-history-results.ts";
import { historyPerformanceSchema } from "../src/lib/athrecs/source-performance-history.ts";

const today = new Date("2026-10-09T12:00:00Z");
const row = (extra = {}) => ({
  year: 2025,
  date: "2025-12-17",
  sourceDate: "17 Dec",
  ageGroup: "",
  discipline: "5K",
  performance: "19:34(19:38)",
  wind: "",
  place: "90",
  venue: "Synthetic park",
  country: "GB",
  meeting: "Synthetic race",
  sourceUrls: ["https://example.test/result"],
  labels: [],
  verificationStatus: "verified_by_administrator",
  ...extra,
});
const history = (rows) => [
  { provider: "Test additions", externalId: "synthetic", performances: rows },
];
const trailRow = row({ labels: ["Trail running", "Finished"] });
assert.equal(isTrailHistoryResult(trailRow), true);
assert.equal(isTrailHistoryResult(row()), false);
assert.equal(profileAchievementResults([], history([trailRow]))[0].surface, "Trail");
assert.equal(profileAchievementResults([], history([row()]))[0].surface, "Unknown");
assert.equal(
  profileAchievementResults([], history([row({ labels: ["Road running"] })]))[0].surface,
  "Road",
  "Explicit road evidence remains road",
);
for (const extra of [
  { discipline: "5km XC" },
  { discipline: "Cross-country relay leg" },
  { discipline: "10km", labels: ["Cross country"] },
]) {
  const xc = row(extra);
  assert.equal(isCrossCountryHistoryResult(xc), true);
  assert.equal(profileAchievementResults([], history([xc]))[0].surface, "Cross Country");
}
assert.deepEqual(sourceHistorySports(history([row({ discipline: "5km XC" })])), ["Running"]);
assert.equal(isCrossCountryHistoryResult(row({ discipline: "5000m" })), false);
assert.deepEqual(sourceHistorySports(history([row({ discipline: "5km road relay leg" })])), [
  "Running",
]);
const board = (rows, recorded = []) =>
  buildProfileAchievements(profileAchievementResults(recorded, history(rows)), today);
assert.equal(historyResultCountry(row()), "United Kingdom");
assert.equal(historyResultCountry(row({ country: "", venue: "Valencia, ESP" })), "Spain");
assert.equal(historyResultCountry(row({ country: "", venue: "Paris, FRA" })), "France");
assert.equal(historyResultCountry(row({ country: "", venue: "Bydgoszcz, POL" })), "Poland");
assert.equal(
  historyResultCountry(row({ country: "", venue: "London" })),
  "",
  "An ambiguous city alone never supplies a flag",
);
assert.equal(historyPerformanceSchema.parse(row({ eventSlug: "london-marathon" })).country, "GB");
assert.equal(
  board([row()]).finishes.length,
  1,
  "Administrator-accepted results count towards completion",
);
assert.equal(board([row({ verificationStatus: "source_verified" })]).finishes.length, 1);
const pending = board([row({ verificationStatus: "unverified" })]);
assert.equal(pending.finishes.length, 1);
assert.equal(pending.milestones.find((m) => m.id === "finishes").verified, false);
assert.equal(board([row()]).milestones.find((m) => m.id === "finishes").verified, true);
const countries = board([
  row({ verificationStatus: "unverified", date: "2025-01-01" }),
  row({ date: "2025-02-01" }),
  row({ country: "US", date: "2025-03-01" }),
]);
assert.equal(countries.countries.length, 2);
assert.equal(countries.milestones.find((m) => m.id === "countries").verified, true);
const pendingCountry = board([
  row(),
  row({ country: "US", date: "2025-03-01", verificationStatus: "unverified" }),
]);
assert.equal(
  pendingCountry.milestones.find((m) => m.id === "countries").title,
  "2 countries raced",
);
assert.equal(pendingCountry.milestones.find((m) => m.id === "countries").verified, false);

for (const extra of [
  { verificationStatus: undefined },
  { profileExcluded: true },
  { performance: "DNF" },
  { performance: "DNS" },
  { performance: "DQ" },
  { performance: "NM" },
  { performance: "0" },
  { performance: "", place: "" },
  { date: "2027-01-01" },
  { date: "2025-02-30" },
  { notes: "Conflicting source details remain unresolved" },
  {
    disqualification: {
      reason: "other",
      decisionDate: "2026-01-01",
      sourceUrl: "https://example.test/dq",
      note: "Synthetic DQ",
    },
  },
])
  assert.equal(board([row(extra)]).finishes.length, 0, JSON.stringify(extra));
assert.equal(
  isCompletedHistoryResult(
    row({
      date: "",
      year: 2012,
      yearLabel: "2011 / 2012",
      discipline: "60m",
      performance: "8.04i",
    }),
    today,
  ),
  true,
);
const undated = board([
  row({ date: "", year: 2012, yearLabel: "2011 / 2012", discipline: "60m", performance: "8.04i" }),
]);
assert.equal(undated.finishes[0].eventDate, "");
assert.equal(undated.marathonWeek.length, 0);
assert.equal(board([row(), row()]).finishes.length, 1, "Repeated copies count once");
assert.equal(
  board([
    row({ discipline: "60m", performance: "8.01i", place: "1" }),
    row({ discipline: "60m", performance: "8.01i", place: "4" }),
  ]).finishes.length,
  2,
  "Separate rounds remain separate performances",
);
assert.equal(
  board([row({ performance: "", place: "3", discipline: "4x100m relay" })]).finishes.length,
  1,
  "An accepted relay placing need not invent a team time",
);
const roadAndTrack = board([
  row(),
  row({ discipline: "Long Jump", performance: "4.64", meeting: "Synthetic athletics meet" }),
]);
assert.deepEqual(roadAndTrack.sports, ["Athletics", "Running"]);
const multisportRows = [
  row({ discipline: "Triathlon — middle distance" }),
  row({ discipline: "5 km run leg — sprint triathlon" }),
  row({ discipline: "‘Brick’ Duathlon" }),
];
assert.deepEqual(sourceHistorySports(history(multisportRows)), ["Triathlon", "Duathlon"]);
assert(
  profileAchievementResults([], history(multisportRows)).every((r) => r.surface === ""),
  "A multisport source label must not invent a track surface",
);
assert.equal(
  roadAndTrack.finishes[1].finishTimeSeconds,
  null,
  "A field mark must not become a time",
);
assert.equal(
  roadAndTrack.finishes[0].chipTimeSeconds,
  null,
  "Do not invent timing columns in a completion projection",
);
const marathonRows = [
  row({
    discipline: "Marathon",
    performance: "3:20:14",
    eventSlug: "london-marathon",
    date: "2026-04-26",
    meeting: "TCS London Marathon",
  }),
  row({
    discipline: "Marathon",
    performance: "3:10:38(3:10:51)",
    country: "ES",
    date: "2025-12-07",
    meeting: "Synthetic Spanish marathon",
  }),
];
assert.equal(board(marathonRows).marathons.length, 2);
assert.equal(board(marathonRows).completedMajors.length, 1);
const yearOnlyMajors = ["Boston", "Chicago"].map((city) =>
  row({
    meeting: `${city} Marathon`,
    eventSlug: `${city.toLowerCase()}-marathon`,
    discipline: "Marathon",
    performance: "3:12:34",
    country: "US",
    labels: ["Road"],
    date: "",
    year: 2025,
    yearLabel: "2025",
    verificationStatus: "unverified",
  }),
);
const yearOnlyBoard = board(yearOnlyMajors);
assert.equal(yearOnlyBoard.completedMajors.length, 2);
assert.equal(yearOnlyBoard.milestones.find((m) => m.id === "majors").verified, false);
assert.equal(yearOnlyBoard.marathonWeek.length, 0, "A year never supplies a date-window finish");
assert(yearOnlyBoard.finishes.every((r) => r.eventDate === "2025"));
for (const extra of [
  { yearLabel: "2024 / 2025" },
  { yearLabel: "Unknown" },
  { year: 2199, yearLabel: "2199" },
  { dateLabel: "2024 or 2025" },
  { country: "GB" },
  { profileExcluded: true },
  { performance: "DNF" },
])
  assert.equal(
    board([{ ...yearOnlyMajors[0], ...extra }]).completedMajors.length,
    0,
    JSON.stringify(extra),
  );
for (const [year, expected] of [
  [2024, 0],
  [2025, 1],
]) {
  assert.equal(
    board([
      {
        ...yearOnlyMajors[0],
        meeting: "Sydney Marathon",
        eventSlug: "sydney-marathon",
        country: "AU",
        year,
        yearLabel: String(year),
      },
    ]).completedMajors.length,
    expected,
  );
}
assert.equal(
  board([
    row({
      discipline: "Marathon",
      performance: "3:20:14",
      meeting: "London Marathon training race",
    }),
  ]).completedMajors.length,
  0,
  "City/name similarities cannot award a major",
);
const projected = profileAchievementResults([], history([row()]))[0];
const recorded = {
  ...projected,
  history: undefined,
  resultId: 100,
  editionId: 100,
  finishTimeSeconds: 1174,
};
assert.equal(
  board([row()], [recorded]).finishes.length,
  1,
  "An existing linked result is not counted again from history",
);
assert.equal(
  board([row()], [{ ...recorded, status: "DQ" }]).finishes.length,
  0,
  "History cannot resurrect a disqualified linked record",
);
console.log(
  "Historical completion checks passed: flags, accepted basis, exclusions, duplicates, track/field, partial dates, majors and timing precision.",
);
