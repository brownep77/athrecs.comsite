import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { buildProfileAchievementSummary } from "../src/lib/athrecs/profile-achievement-summary.ts";
import "./verify-calendar-year-achievements.mjs";

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
const pending = buildProfileAchievementSummary([], [history], today);
const reportedYear = pending;
assert.deepEqual(reportedYear.earned.find(({ id }) => id === "years").calendarYears, [
  { year: 2026, verified: false },
]);
assert.equal(pending.progress[0].completed, 1);
assert.equal(pending.earned.find((a) => a.id === "finishes").verified, false);
history.performances[0].verificationStatus = "source_verified";
const confirmed = buildProfileAchievementSummary([], [history], today);
assert.equal(confirmed.progress[0].completed, 1);
assert.equal(confirmed.earned.find((a) => a.id === "finishes").verified, true);
assert.deepEqual(confirmed.progress, pending.progress);

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

// Distance achievements must advance beyond the first finish, across the full history.
const halfRows = Array.from({ length: 12 }, (_, index) => ({
  ...history.performances[0],
  year: 2020,
  date: `2020-${String(index + 1).padStart(2, "0")}-01`,
  discipline: index % 2 ? "Half" : "Half Marathon",
  meeting: `Example half marathon ${index + 1}`,
  performance: "1:20:00",
  labels: ["Road"],
  verificationStatus: index < 10 ? "source_verified" : "unverified",
}));
const halfHistory = { ...history, performances: halfRows };
const halfSummary = buildProfileAchievementSummary([], [halfHistory], today);
assert.equal(
  halfSummary.earned.find(({ id }) => id === "half-marathons").title,
  "12 half marathons completed",
);
assert.equal(halfSummary.earned.find(({ id }) => id === "half-marathons").verified, false);
assert.deepEqual(
  halfSummary.progress.find(({ id }) => id === "half-marathons"),
  {
    id: "half-marathons",
    title: "20 half marathons",
    completed: 12,
    target: 20,
    remaining: 8,
    remainingLabel: "8 more half marathons",
  },
);
const verifiedHalves = buildProfileAchievementSummary(
  [],
  [
    {
      ...halfHistory,
      performances: halfRows.map((row) => ({ ...row, verificationStatus: "source_verified" })),
    },
  ],
  today,
);
assert.equal(
  buildProfileAchievementSummary(
    [],
    [
      {
        ...halfHistory,
        performances: halfRows.map((row) => ({ ...row, labels: ["Multi-terrain"] })),
      },
    ],
    today,
  ).progress.find(({ id }) => id === "half-marathons").completed,
  12,
  "Surface does not disqualify a recorded distance completion",
);
assert.equal(verifiedHalves.earned.find(({ id }) => id === "half-marathons").verified, true);
assert.deepEqual(
  verifiedHalves.progress,
  halfSummary.progress,
  "Verification only changes the tick, never the count",
);
const duplicateHalf = race(200, {
  eventDate: halfRows[0].date,
  eventName: halfRows[0].meeting,
  distanceCode: "Half",
  distanceKm: 21.0975,
  finishTimeSeconds: 4800,
});
const repeatedHistory = { ...halfHistory, provider: "Second example source" };
assert.equal(
  buildProfileAchievementSummary(
    [duplicateHalf],
    [halfHistory, repeatedHistory],
    today,
  ).progress.find(({ id }) => id === "half-marathons").completed,
  12,
  "Recorded and history duplicates count once",
);
const ineligibleHalfRows = [
  { profileExcluded: true },
  { performance: "DNF" },
  { performance: "DQ" },
  { date: "2027-01-01", year: 2027 },
  { notes: "conflicting source result" },
  { labels: ["Road", "Relay leg"] },
  { labels: ["Road", "Split"] },
  { labels: ["Road", "Short course"] },
].map((overrides, index) => ({
  ...halfRows[0],
  meeting: `Ineligible half ${index}`,
  ...overrides,
}));
assert.equal(
  buildProfileAchievementSummary(
    [],
    [{ ...halfHistory, performances: [...halfRows, ...ineligibleHalfRows] }],
    today,
  ).progress.find(({ id }) => id === "half-marathons").completed,
  12,
);
for (const [distanceCode, distanceKm, id] of [
  ["5K", 5, "5K"],
  ["10K", 10, "10K"],
  ["Mile", 1.609344, "miles"],
  ["Half", 21.1, "half-marathons"],
]) {
  const summary = buildProfileAchievementSummary(
    four.map((row) => ({ ...row, distanceCode, distanceKm })),
    [],
    today,
  );
  assert.equal(summary.progress.find((goal) => goal.id === id).completed, 4);
  assert.equal(summary.progress.find((goal) => goal.id === id).remaining, 1);
}
assert(
  !buildProfileAchievementSummary(
    [
      race(300, { sport: "Athletics", surface: "Track", distanceCode: "10000m" }),
      race(301, { sport: "Cycling" }),
    ],
    [],
    today,
  ).earned.some(({ id }) => id === "10K"),
  "Track and cycling must not become running 10K completions",
);
const twenty = buildProfileAchievementSummary(
  Array.from({ length: 20 }, (_, index) =>
    race(index + 1, { distanceCode: "Half", distanceKm: 21.0975 }),
  ),
  [],
  today,
);
assert.equal(
  twenty.earned.find(({ id }) => id === "half-marathons").title,
  "20 half marathons completed",
);
assert.equal(twenty.progress.find(({ id }) => id === "half-marathons").target, 25);

const server = await createServer({ server: { middlewareMode: true } });
try {
  const { buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  );
  const { AchievementSummary } = await server.ssrLoadModule(
    "/src/components/athletes/AchievementSummary.tsx",
  );
  const halfMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: halfSummary }),
  );
  assert(halfMarkup.includes("12 half marathons completed"));
  assert(halfMarkup.includes("8 more half marathons"));
  assert(halfMarkup.includes('value="12" max="20"'));
  assert(!halfMarkup.includes("First recorded half marathon"));
  assert(!halfMarkup.includes("example.test"));
  const { AchievementsBoard } = await server.ssrLoadModule(
    "/src/components/athletes/ProfileAchievements.tsx",
  );
  const boardMarkup = renderToStaticMarkup(
    createElement(AchievementsBoard, { results: [], sourceHistories: [halfHistory] }),
  );
  assert(boardMarkup.includes("Half marathons"));
  assert(boardMarkup.includes("12 half marathons completed"));
  assert(!boardMarkup.includes("example.test"));
  const countriesMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: threeCountries }),
  );
  assert(countriesMarkup.includes("3 countries raced"));
  assert(countriesMarkup.includes('data-achievement-verification="pending"'));
  const verifiedMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: confirmed }),
  );
  assert(verifiedMarkup.includes('data-achievement-verification="verified"'));
  assert(verifiedMarkup.includes("Supporting results verified"));
  assert(!countriesMarkup.includes("2 countries raced"));
  const yearMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, { summary: reportedYear }),
  );
  assert(yearMarkup.includes("Raced in 1 calendar year"));
  assert(yearMarkup.includes('aria-label="Recorded racing years"'));
  assert(yearMarkup.includes('aria-label="2026: awaiting verification"'));
  assert(yearMarkup.includes("Each year counts once"));
  const verifiedYearMarkup = renderToStaticMarkup(
    createElement(AchievementSummary, {
      summary: buildProfileAchievementSummary([], [history], today),
    }),
  );
  assert(verifiedYearMarkup.includes('aria-label="2026: verified result recorded"'));
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
  const halfInput = { ...input, histories: [halfHistory] };
  const halfPreview = buildPublicAthletePreview(halfInput);
  assert.equal(
    halfPreview.achievements.earned.find(({ id }) => id === "half-marathons").title,
    "12 half marathons completed",
  );
  assert.deepEqual(
    halfPreview.achievements,
    buildPublicAthletePreview({ ...halfInput, resultPage: 2 }).achievements,
  );
  assert(!JSON.stringify(halfPreview.achievements).includes("example.test"));
  const { publicAnzMedals, ANZ_PROVIDER } = await server.ssrLoadModule("/src/lib/anz/core.ts");
  const { AnzChampionshipMedals } = await server.ssrLoadModule(
    "/src/components/athletes/AnzChampionshipMedals.tsx",
  );
  const medalHistory = {
    ...history,
    provider: ANZ_PROVIDER,
    performances: [
      {
        ...history.performances[0],
        year: 2020,
        date: "2020-06-01",
        discipline: "10km",
        place: "4",
      },
      {
        ...history.performances[0],
        year: 2021,
        date: "2021-06-01",
        discipline: "Half Marathon",
        performance: "1:20:01",
        place: "2",
      },
    ],
  };
  const medalMetadata = {
    anzImport: {
      verificationStatus: "source_verified",
      medals: [
        {
          year: 2020,
          event: "10km",
          performance: "40:00",
          ageGroup: "Open Women",
          medal: "bronze",
          sourceUrl: medalHistory.sourceUrl,
        },
        {
          year: 2021,
          event: "Half Marathon",
          performance: "1:20:01",
          ageGroup: "Senior Women",
          medal: "silver",
          sourceUrl: medalHistory.sourceUrl,
        },
      ],
    },
  };
  const medals = publicAnzMedals(medalMetadata, [medalHistory]);
  const medalInput = { ...input, histories: [medalHistory], anzMedals: medals };
  const medalPreview = buildPublicAthletePreview(medalInput);
  assert.equal(medalPreview.championshipMedals.length, 2);
  assert.deepEqual(
    medalPreview.championshipMedals,
    buildPublicAthletePreview({ ...medalInput, resultPage: 2 }).championshipMedals,
  );
  assert(
    medalPreview.entries.every((entry) => entry.kind === "recorded"),
    "Older championship medals must survive the latest-five-results limit",
  );
  assert(!JSON.stringify(medalPreview.championshipMedals).includes("source"));
  assert(!JSON.stringify(medalPreview.championshipMedals).includes("example.test"));
  assert.equal(
    medalHistory.performances[0].place,
    "4",
    "A championship bronze never overwrites overall placing",
  );
  const medalMarkup = renderToStaticMarkup(
    createElement(AnzChampionshipMedals, { medals: medalPreview.championshipMedals }),
  );
  assert(medalMarkup.includes("New Zealand championship medals"));
  assert(medalMarkup.includes('data-profile-award="silver"'));
  assert(medalMarkup.includes('data-profile-award="bronze"'));
  assert.equal((medalMarkup.match(/data-award-tier="national"/g) ?? []).length, 2);
  assert.equal((medalMarkup.match(/data-achievement-verification="verified"/g) ?? []).length, 2);
  assert(medalMarkup.includes("Open Women") && medalMarkup.includes("1:20:01"));
  assert.equal(renderToStaticMarkup(createElement(AnzChampionshipMedals, { medals: [] })), "");
  assert.equal(
    publicAnzMedals(medalMetadata, [
      {
        ...medalHistory,
        performances: medalHistory.performances.map((row) => ({ ...row, profileExcluded: true })),
      },
    ]).length,
    0,
  );
  assert.deepEqual(
    firstPage.achievements,
    secondPage.achievements,
    "Achievements count the complete record on every page",
  );
  const yearsInput = {
    ...input,
    histories: [
      {
        ...history,
        performances: [2010, 2012, 2018, 2020].map((year) => ({
          ...history.performances[0],
          year,
          date: "",
          verificationStatus: "unverified",
        })),
      },
    ],
  };
  const yearsPage = buildPublicAthletePreview(yearsInput);
  assert.deepEqual(
    yearsPage.achievements,
    buildPublicAthletePreview({ ...yearsInput, resultPage: 2 }).achievements,
    "All recorded years count before pagination",
  );
  assert.equal(
    yearsPage.achievements.earned.find(({ id }) => id === "years").title,
    "Raced in 5 calendar years",
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
