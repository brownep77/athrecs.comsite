import assert from "node:assert/strict";
import {
  buildProfileAchievements,
  runningDistanceKind,
  isCompletedResult,
  resultDay,
} from "../src/lib/athrecs/profile-achievements.ts";
const today = new Date("2026-09-16T12:00:00Z");
const race = (id, values = {}) => ({
  resultId: id,
  editionId: id,
  eventName: `Race ${id}`,
  eventSlug: `race-${id}`,
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: "2026-06-01",
  distanceCode: "Marathon",
  distanceKm: 42.195,
  status: "finished",
  finishTimeSeconds: 14000,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  sourceUrls: [],
  ...values,
});
const rows = [
  race(1, { country: "England" }),
  race(1, { resultId: 101, country: "England" }),
  race(2, { country: "GBR", eventDate: "2026-06-07", distanceKm: 42.2 }),
  race(3, { country: "France", distanceCode: "50K", distanceKm: 50, surface: "Trail" }),
  race(4, { country: "Ireland", sport: "Cycling", distanceCode: "100K", distanceKm: 100 }),
  race(5, { country: "Unknown", distanceCode: "Half", distanceKm: 21.0975 }),
  race(6, { status: "DNF" }),
  race(7, { status: "DNS" }),
  race(8, { status: "DQ" }),
  race(9, { conflicting: true }),
  race(10, { eventDate: "2027-01-01" }),
  race(11, { distanceCode: "Marathon relay", distanceKm: 42.195 }),
];
const board = buildProfileAchievements(rows, today);
assert.equal(
  board.finishes.length,
  6,
  "One completed event per edition; no non-finishes/conflicts/future entries",
);
assert.equal(board.marathons.length, 2);
assert.equal(board.ultras.length, 1, "A trail ultra counts, a cycling 100K does not");
assert.deepEqual(board.countries.map((c) => c.code).sort(), ["FR", "GB", "IE"]);
assert.equal(board.marathonWeek.length, 2, "June 1–7 are seven consecutive calendar dates");
assert.equal(
  buildProfileAchievements([race(1), race(2, { eventDate: "2026-06-08" })], today).marathonWeek
    .length,
  1,
  "Day eight is outside the window",
);
assert.equal(
  buildProfileAchievements(
    [race(1, { eventDate: "2025-12-29" }), race(2, { eventDate: "2026-01-04" })],
    today,
  ).marathonWeek.length,
  2,
  "Windows cross week and year boundaries",
);
assert.equal(
  buildProfileAchievements(
    [race(1, { eventDate: "2026" }), race(2, { eventDate: "2026-02-30" })],
    today,
  ).marathonWeek.length,
  0,
  "Partial or invalid dates cannot establish a streak",
);
assert.equal(resultDay("2026-02-30"), null);
assert.equal(
  buildProfileAchievements([race(1), race(1, { resultId: 2, status: "DNF" })], today).finishes
    .length,
  0,
  "Disagreeing source outcomes cannot establish an achievement",
);
assert.equal(
  buildProfileAchievements([race(1), race(1, { resultId: 2, conflicting: true })], today).finishes
    .length,
  0,
  "Conflict on any duplicate excludes the whole edition",
);
assert.equal(
  buildProfileAchievements(
    [
      race(1, { country: "Scotland" }),
      race(2, { country: "Wales" }),
      race(3, { country: "Northern Ireland" }),
    ],
    today,
  ).countries.length,
  1,
);
assert.equal(runningDistanceKind(race(1, { sport: "Swimming" })), null);
assert.equal(runningDistanceKind(race(1, { distanceCode: "Half Marathon" })), null);
assert.equal(
  runningDistanceKind(race(1, { distanceKm: 21.0975 })),
  null,
  "A contradictory marathon distance is not awarded",
);
assert.equal(isCompletedResult(race(1, { status: "FIN" }), today), true);
assert.equal(isCompletedResult(race(1, { status: "" }), today), false);
const week = buildProfileAchievements(
  Array.from({ length: 4 }, (_, i) => race(i + 1, { eventDate: `2026-06-0${i + 1}` })),
  today,
);
assert.equal(week.marathonWeek.length, 4);
assert.equal(new Set(week.marathonWeek.map((r) => r.editionId)).size, 4);
assert.equal(buildProfileAchievements([], today).finishes.length, 0);
assert.equal(buildProfileAchievements([], today).milestones.length, 0);
assert.equal(isCompletedResult(race(1, { eventDate: "2027" }), today), false);
assert.equal(isCompletedResult(race(1, { eventDate: "2026-02-30" }), today), false);
const major = (id, slug, country, date = "2025-06-01", extra = {}) =>
  race(id, { eventSlug: slug, country, eventDate: date, ...extra });
const majorRows = [
  major(1, "london-marathon", "England"),
  major(2, "berlin-marathon", "Germany"),
  major(3, "chicago-marathon", "United States"),
  major(4, "boston-marathon", "United States"),
  major(5, "new-york-city-marathon", "United States"),
];
const majorBoard = buildProfileAchievements(majorRows, today);
assert.equal(majorBoard.completedMajors.length, 5);
assert.equal(
  majorBoard.milestones.find((m) => m.id === "majors").title,
  "5 marathon majors completed",
);
assert(!majorBoard.milestones.some((m) => m.id === "original-six"));
assert.equal(
  buildProfileAchievements(
    [...majorRows, major(6, "london-marathon", "United Kingdom", "2026-04-26")],
    today,
  ).completedMajors.length,
  5,
);
assert(
  buildProfileAchievements(
    [...majorRows, major(6, "tokyo-marathon", "Japan")],
    today,
  ).milestones.some((m) => m.id === "original-six"),
);
assert.equal(
  buildProfileAchievements([major(1, "boston-marathon", "United Kingdom")], today).completedMajors
    .length,
  0,
  "A UK Boston race is not the US major",
);
assert.equal(
  buildProfileAchievements(
    [
      major(1, "london-marathon", "United Kingdom", "2025-04-27", {
        eventName: "Virtual London Marathon",
      }),
    ],
    today,
  ).completedMajors.length,
  0,
);
assert.equal(
  buildProfileAchievements(
    [
      major(1, "london-marathon", "United Kingdom", "2025-04-27", {
        distanceCode: "Half",
        distanceKm: 21.0975,
      }),
    ],
    today,
  ).completedMajors.length,
  0,
);
assert.equal(
  buildProfileAchievements([major(1, "sydney-marathon", "Australia", "2024-09-15")], today)
    .completedMajors.length,
  0,
  "Historical special eligibility needs explicit confirmation",
);
assert.equal(
  buildProfileAchievements([major(1, "sydney-marathon", "Australia", "2025-08-31")], today)
    .completedMajors.length,
  1,
);
assert.equal(
  buildProfileAchievements(
    [major(1, "sanlam-cape-town-marathon", "South Africa", "2024-10-20")],
    today,
  ).completedMajors.length,
  0,
);
assert.equal(
  buildProfileAchievements(
    [major(1, "sanlam-cape-town-marathon", "South Africa", "2026-05-24")],
    today,
  ).completedMajors.length,
  1,
);
assert.equal(
  buildProfileAchievements(
    [race(1, { sport: "Running" }), race(2, { sport: "Athletics" }), race(3, { sport: "Parkrun" })],
    today,
  ).sports.length,
  1,
);
assert(
  buildProfileAchievements([race(1), race(2, { sport: "Cycling" })], today).milestones.some(
    (m) => m.title === "2 sports completed",
  ),
);
assert(
  buildProfileAchievements(
    [race(1, { eventDate: "2026-06-01" }), race(2, { eventDate: "2026-06-02" })],
    today,
  ).milestones.some((m) => m.id === "consecutive-marathons"),
);
assert(
  buildProfileAchievements(
    [
      race(1, { eventDate: "2025-06-01", finishTimeSeconds: 15000 }),
      race(2, { eventDate: "2026-06-01", finishTimeSeconds: 14000 }),
    ],
    today,
  ).milestones.find((m) => m.id === "personal-improvement").results.length === 2,
);
assert.equal(
  buildProfileAchievements([race(1, { distanceCode: "5K", distanceKm: 5 })], today).milestones[0]
    .title,
  "First recorded finish",
);
console.log(
  "Profile achievement checks passed: completion, deduplication, distance/sport, countries and seven-day boundaries.",
);

// Flag resolution must not depend on the ICU version in Node or Chromium.
const originalDisplayNames = Intl.DisplayNames;
try {
  Intl.DisplayNames = class {
    constructor() {
      throw new Error("Runtime region names must not be used");
    }
  };
  const { countryFlag } = await import("../src/lib/athrecs/country-flags.ts?stable-region-test");
  for (const [value, code, name] of [
    ["Hong Kong", "HK", "Hong Kong"],
    ["Macau", "MO", "Macau"],
    ["British", "GB", "United Kingdom"],
    ["IE", "IE", "Ireland"],
  ]) {
    assert.equal(countryFlag(value).code, code);
    assert.equal(countryFlag(value).name, name);
  }
  assert.equal(countryFlag("Unspecified").code, "");
} finally {
  Intl.DisplayNames = originalDisplayNames;
}
