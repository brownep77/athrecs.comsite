import assert from "node:assert/strict";
import { buildProfileAchievementSummary } from "../src/lib/athrecs/profile-achievement-summary.ts";
import { buildProfileAchievements } from "../src/lib/athrecs/profile-achievements.ts";
import { profileAchievementResults } from "../src/lib/athrecs/profile-history-results.ts";
import { withoutProfileEvidence } from "../src/lib/athrecs/profile-evidence.ts";

const today = new Date("2026-10-21T12:00:00Z");
const row = (year, changes = {}) => ({
  year,
  date: `${year}-06-01`,
  sourceDate: "1 June",
  ageGroup: "",
  discipline: "5K",
  performance: "20:00",
  place: "12",
  wind: "",
  venue: "Synthetic town",
  meeting: `Synthetic event ${year}`,
  country: "GB",
  labels: [],
  sourceUrls: [`https://example.test/private-results/${year}`],
  verificationStatus: "unverified",
  ...changes,
});
const history = (performances, provider = "Synthetic timing") => ({
  provider,
  externalId: "example",
  performances,
});
const summary = (rows, results = []) =>
  buildProfileAchievementSummary(results, [history(rows)], today);
const years = (record) => record.earned.find(({ id }) => id === "years")?.calendarYears ?? [];
const rows = [
  row(2011),
  row(2011),
  row(2013, { verificationStatus: "source_verified" }),
  row(2018, {
    date: "",
    dateLabel: "20–23 July 2018",
    verificationStatus: "verified_by_administrator",
  }),
  row(2019, { date: "", verificationStatus: undefined }),
  row(2021, { discipline: "Cycling 10K" }),
  row(2025, {
    discipline: "200m",
    performance: "26.10",
    providerName: "World Athletics",
    verificationStatus: undefined,
  }),
];
const record = summary(rows);
assert.deepEqual(years(record), [
  { year: 2011, verified: false },
  { year: 2013, verified: true },
  { year: 2018, verified: true },
  { year: 2019, verified: false },
  { year: 2021, verified: false },
  { year: 2025, verified: true },
]);
assert.equal(record.earned.find(({ id }) => id === "years").title, "Raced in 6 calendar years");
assert.equal(record.progress.find(({ id }) => id === "years").target, 10);
assert.equal(record.progress.find(({ id }) => id === "years").remaining, 4);
assert.equal(
  years(
    summary([
      ...rows,
      row(2021, {
        discipline: "Swimming 200m",
        performance: "2:30",
        verificationStatus: "source_verified",
      }),
    ]),
  ).find(({ year }) => year === 2021).verified,
  true,
  "One verified performance verifies that year without adding another year",
);
assert.equal(
  years(summary([...rows, row(2026)])).length,
  7,
  "A newly linked year updates automatically",
);
assert.equal(
  years(summary(rows.filter(({ year }) => year !== 2019))).length,
  5,
  "Removing the only performances in a year removes that year",
);
assert.deepEqual(
  years(summary([row(2020)])),
  [{ year: 2020, verified: false }],
  "Other athletes have independent totals",
);
for (const change of [
  { performance: "DNF" },
  { performance: "DNS" },
  { performance: "DQ" },
  { performance: "NM" },
  { performance: "0" },
  { performance: "", place: "" },
  { profileExcluded: true },
  { syntheticTest: true },
  { notes: "Conflicting source details" },
  { date: "2027-06-01", year: 2027 },
  { date: "2020-02-30" },
  { date: "", yearLabel: "2019 / 2020" },
  { date: "", dateLabel: "2019–2020" },
  { date: "", dateLabel: "2019/20" },
  { date: "", yearLabel: "Unknown" },
  { date: "", endDate: "2021-01-01" },
  { endDate: "2027-01-01" },
  { labels: ["Split: 5K"] },
  { disqualification: { reason: "other" } },
])
  assert.deepEqual(years(summary([row(2020, change)])), [], JSON.stringify(change));
assert.deepEqual(
  years(summary([row(2020, { yearLabel: "2019/2020" })])),
  [{ year: 2020, verified: false }],
  "An exact date identifies its calendar year",
);
const raw = { results: [], histories: [history(rows)] };
const safe = withoutProfileEvidence(raw);
assert.deepEqual(
  buildProfileAchievementSummary(safe.results, safe.histories, today),
  record,
  "Evidence redaction does not change year totals or verification",
);
assert(!JSON.stringify(record).includes("https:"));
assert(!JSON.stringify(record).includes("provider"));
const strict = buildProfileAchievements(
  profileAchievementResults([], [history([row(2020)])]),
  today,
);
assert.equal(strict.finishes.length, 1);
assert.equal(
  strict.calendarYears.length,
  1,
  "Completed recorded results count before verification",
);
console.log(
  "Calendar years: full history, legacy/unverified records, distinct years, verification, exclusions, privacy and automatic updates passed.",
);
