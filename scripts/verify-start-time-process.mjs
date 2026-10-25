import assert from "node:assert/strict";
import {
  startTimeReviewToday,
  startTimeReviewThrough,
  startTimeReviewPriority,
  isResearchStartTime,
} from "../src/lib/race-collector/start-time-policy.ts";
import { parseResearch, buildResearchPrompt } from "../src/lib/race-collector/research.server.ts";

for (const [today, end] of [
  ["2026-10-25", "2027-01-25"],
  ["2026-01-31", "2026-04-30"],
  ["2027-11-30", "2028-02-29"],
  ["2026-11-30", "2027-02-28"],
  ["2028-02-29", "2028-05-29"],
])
  assert.equal(startTimeReviewThrough(today), end);
for (const bad of ["2026-02-30", "2026-13-01", "2026-1-01", ""])
  assert.throws(() => startTimeReviewThrough(bad));
assert.equal(startTimeReviewToday(new Date("2026-06-01T23:30:00Z")), "2026-06-02");
assert.equal(startTimeReviewToday(new Date("2026-12-01T23:30:00Z")), "2026-12-01");
const today = "2026-10-25";
for (const [date, priority] of [
  ["2026-10-24", null],
  [today, 0],
  ["2026-10-27", 0],
  ["2026-10-28", 1],
  ["2026-11-01", 1],
  ["2026-11-02", 2],
  ["2026-11-24", 2],
  ["2026-11-25", 3],
  ["2027-01-25", 3],
  ["2027-01-26", null],
  ["2026-02-30", null],
])
  assert.equal(startTimeReviewPriority(date, today), priority);
for (const valid of ["00:00", "09:30", "23:59"]) assert(isResearchStartTime(valid));
for (const bad of ["", "Other", "TBC", "24:00", "09:60", "9:30", "09:30 TBC"])
  assert(!isResearchStartTime(bad));

const candidate = {
  name: "Synthetic Trail Race",
  countryCode: "GB",
  country: "Scotland",
  city: "Test",
  region: "",
  date: today,
  distance: 7.5,
  unit: "km",
  distanceLabel: "7.5K",
  surface: "Trail",
  sourceUrl: "https://example.org/2026",
  entryUrl: "",
  startTime: "",
  evidence: "Synthetic test evidence",
  notes: "",
  sourceKind: "organiser",
  entryStatus: "Closed",
};
const candidates = [
  { ...candidate, name: "Beyond window", date: "2027-01-26" },
  { ...candidate, name: "Boundary", date: "2027-01-25" },
  { ...candidate, name: "Invalid start", startTime: "Other" },
  { ...candidate, name: "Known start", startTime: "09:30" },
];
const report = parseResearch(
  {
    output_text: JSON.stringify({
      candidates,
      sources: [candidate.sourceUrl],
      gaps: Array.from({ length: 100 }, (_, i) => `Unrelated gap ${i}`),
    }),
  },
  today,
);
assert.equal(report.gaps.length, 100);
assert.match(report.gaps[0], /Invalid start.*Mandatory three-month review/);
assert.match(report.gaps[1], /Boundary.*Mandatory three-month review/);
assert.match(report.gaps[2], /Beyond window/);
assert(!report.gaps[2].includes("Mandatory three-month review"));
assert(!report.gaps.some((gap) => gap.includes("Known start")));
assert.equal(
  report.candidates[2].startTime,
  "Other",
  "preserve invalid evidence for existing validation to reject",
);
assert.equal(report.candidates[1].startTime, "", "never fill unknown times");
const prompt = buildResearchPrompt(
  { country: "GB", dateFrom: today, dateTo: "2027-12-31", pass: 1 },
  { countries: ["GB"], dateFrom: today, dateTo: "2027-12-31", min: 0, max: 500, unit: "mi" },
  [],
  today,
);
assert(prompt.includes("2026-10-25 through 2027-01-25 inclusive"));
assert(prompt.includes("athlete guide and linked PDFs"));
assert(prompt.includes("attempted URL with its outcome"));
assert(prompt.includes("retry date"));
assert(prompt.includes("Do not guess or contact organisers without explicit messaging authority"));
console.log(
  "Rolling three-month start-time process, boundary dates and unresolved-gap checks passed.",
);
