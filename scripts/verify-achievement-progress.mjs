import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { buildProfileAchievementSummary } from "../src/lib/athrecs/profile-achievement-summary.ts";

const today = new Date("2026-10-13T12:00:00Z");
const race = (id, overrides = {}) => ({
  resultId: id,
  editionId: id,
  eventName: `Example race ${id}`,
  eventSlug: `example-${id}`,
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: "2026-06-01",
  distanceCode: "10K",
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 2400,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  sourceUrls: ["https://example.test/private-evidence"],
  ...overrides,
});
const empty = buildProfileAchievementSummary([], [], today);
assert.deepEqual(empty.earned, []);
assert.equal(empty.progress[0].target, 1);
assert.equal(empty.progress[0].remaining, 1);
const four = Array.from({ length: 4 }, (_, i) => race(i + 1));
const progress = buildProfileAchievementSummary(four, [], today);
assert.equal(progress.progress.find((goal) => goal.id === "finishes").remaining, 1);
assert(progress.earned.some((achievement) => achievement.title === "First recorded finish"));
const five = buildProfileAchievementSummary([...four, race(5)], [], today);
assert(five.earned.some((achievement) => achievement.title === "5 finishes completed"));
assert.equal(five.progress.find((goal) => goal.id === "finishes").remaining, 5);
const invalid = [
  race(1, { status: "DNF" }),
  race(2, { status: "DNS" }),
  race(3, { status: "DQ" }),
  race(4, { conflicting: true }),
  race(5, { eventDate: "2027-01-01" }),
  race(6, { details: { syntheticTest: true } }),
  race(7, { details: { profileExcluded: true } }),
];
assert.deepEqual(buildProfileAchievementSummary(invalid, [], today), empty);
assert.equal(
  buildProfileAchievementSummary([race(1), race(1, { resultId: 2 })], [], today).progress[0]
    .completed,
  1,
);
assert.equal(
  buildProfileAchievementSummary([race(1), race(1, { resultId: 2, status: "DNF" })], [], today)
    .progress[0].completed,
  0,
);
const marathons = four.map((row) => ({ ...row, distanceCode: "Marathon", distanceKm: 42.195 }));
const marathonGoal = buildProfileAchievementSummary(marathons, [], today).progress.find(
  (goal) => goal.id === "marathons",
);
assert.equal(marathonGoal.remaining, 1);
const homeNations = buildProfileAchievementSummary(
  [race(1, { country: "England" }), race(2, { country: "Scotland" })],
  [],
  today,
);
assert.equal(homeNations.progress.find((goal) => goal.id === "countries").completed, 1);
assert.equal(homeNations.progress.find((goal) => goal.id === "countries").remaining, 1);
const history = {
  provider: "Example Timing",
  externalId: "example",
  sourceUrl: "https://example.test/private-history",
  capturedAt: "2026-10-13",
  complete: true,
  yearsExpected: [2026],
  yearsCaptured: [2026],
  performances: [
    {
      year: 2026,
      date: "2026-06-01",
      ageGroup: "",
      discipline: "10K",
      performance: "40:00",
      wind: "",
      place: "",
      venue: "",
      meeting: "Example historical race",
      country: "France",
      sourceUrls: ["https://example.test/private-row"],
      labels: [],
      verificationStatus: "unverified",
    },
  ],
};
assert.deepEqual(buildProfileAchievementSummary([], [history], today), empty);
history.performances[0].verificationStatus = "source_verified";
assert.equal(buildProfileAchievementSummary([], [history], today).progress[0].completed, 1);

const threeCountries = buildProfileAchievementSummary(
  [race(1, { country: "Bermuda" }), race(2, { country: "Canada" }), race(3, { country: "Canada" })],
  [{ ...history, performances: [{ ...history.performances[0], country: "Grenada" }] }],
  today,
);
assert.equal(
  threeCountries.earned.find((achievement) => achievement.id === "countries").title,
  "3 countries raced",
  "Show the actual country total, not the previous two-country milestone",
);
assert.equal(threeCountries.progress.find((goal) => goal.id === "countries").completed, 3);
assert.equal(threeCountries.progress.find((goal) => goal.id === "countries").remaining, 2);

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  );
  const { AchievementSummary } = await server.ssrLoadModule(
    "/src/components/athletes/AchievementSummary.tsx",
  );
  const countriesMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: threeCountries }),
  );
  assert(countriesMarkup.includes("3 countries raced"));
  assert(!countriesMarkup.includes("2 countries raced"));
  const input = {
    slug: "example",
    displayName: "Example Athlete",
    athleteNumber: "1",
    searchIndexable: true,
    results: Array.from({ length: 40 }, (_, i) => race(i + 1)),
    histories: [],
    allowResultPagination: true,
  };
  const firstPage = buildPublicAthletePreview(input);
  const secondPage = buildPublicAthletePreview({ ...input, resultPage: 2 });
  assert(firstPage.entries.length < 40, "Exercise actual pagination");
  assert.deepEqual(
    firstPage.achievements,
    secondPage.achievements,
    "Achievements count the complete record on every page",
  );
  const finish = firstPage.achievements.progress.find((goal) => goal.id === "finishes");
  assert.equal(finish.completed, 40);
  assert.equal(finish.remaining, 10);
  assert(
    !JSON.stringify(firstPage.achievements).includes("https:"),
    "No evidence URLs in the summary DTO",
  );
  const markup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: firstPage.achievements }),
  );
  assert(markup.includes("25 finishes completed"));
  assert(markup.includes("10 more finishes needed"));
  assert(markup.includes('aria-label="Progress towards 50 finishes"'));
  assert(markup.includes('value="40" max="50"'));
  const winningInput = {
    ...input,
    results: input.results.map((result, index) => ({
      ...result,
      sourceUrls: [`https://example.test/private-evidence/${result.resultId}`],
      overallPlace: 1,
      details: { verificationStatus: index < 30 ? "source_verified" : "unverified" },
    })),
  };
  const winningPage = buildPublicAthletePreview(winningInput);
  assert.deepEqual(
    winningPage.achievements.raceWins,
    buildPublicAthletePreview({ ...winningInput, resultPage: 2 }).achievements.raceWins,
  );
  assert.equal(winningPage.achievements.raceWins[0].count, 40);
  assert.equal(winningPage.achievements.raceWins[0].verifiedCount, 30);
  assert.deepEqual(
    Object.keys(winningPage.achievements.raceWins[0]).sort(),
    ["count", "distance", "id", "kind", "label", "sport", "verifiedCount"].sort(),
    "Only safe aggregate fields enter the public win summary",
  );
  const winMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: winningPage.achievements }),
  );
  assert(winMarkup.includes("Race wins by sport and distance"));
  assert(winMarkup.includes("40 wins"));
  assert(winMarkup.includes("30 of 40 verified"));
  assert(winMarkup.includes("10 awaiting verification"));
  assert(winMarkup.includes('data-race-win="overall"'));
  assert(
    !markup.includes("<details"),
    "Achievements and progress are visible without expanding a section",
  );
  const emptyMarkup = renderToStaticMarkup(createElement(AchievementSummary, { summary: empty }));
  assert(emptyMarkup.includes("First recorded finish"));
  assert(emptyMarkup.includes("1 more finish needed"));
  const reportedOnly = buildPublicAthletePreview({
    ...input,
    results: [],
    reportedRecords: [
      {
        id: "reported",
        event: "Unverified race",
        distance: "10K",
        location: "",
        reportedDate: "2026-06-01",
        reportedTime: "40:00",
        reportedPlace: "",
        uncertainty: "Unverified",
        sources: [],
      },
    ],
  });
  assert.equal(
    reportedOnly.achievements.earned.length,
    0,
    "Unverified narrative results do not earn milestones",
  );
} finally {
  await server.close();
}
console.log(
  "Achievement progress: empty profiles, milestone boundaries, exclusions, source eligibility, full-record pagination and visible rendering passed.",
);
