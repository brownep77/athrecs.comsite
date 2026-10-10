import assert from "node:assert/strict";
import {
  buildProfileTimeline,
  profileDisciplineLabel,
} from "../src/lib/athrecs/profile-timeline.ts";
import { additionalHistoryResults } from "../src/lib/athrecs/profile-history-results.ts";

const url = "https://worldathletics.org/athletes/example/test-runner-123456";
const result = {
  resultId: 1,
  editionId: 1,
  eventName: "Example Marathon",
  eventSlug: "example-marathon",
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: "2001-10-07",
  distanceCode: "Marathon",
  distanceKm: 42.195,
  status: "finished",
  finishTimeSeconds: 8315,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  sourceUrls: [url],
  resultSource: "World Athletics",
  details: { note: "Official time retained." },
};
const row = (extra = {}) => ({
  year: 2001,
  date: "2001-10-07",
  sourceDate: "7 Oct 2001",
  discipline: "Marathon",
  performance: "2:18:35",
  place: "23",
  wind: "",
  ageGroup: "",
  venue: "GBR",
  meeting: "Example Marathon, London",
  sourceUrls: [url],
  labels: [],
  ...extra,
});
const history = (rows) => [
  {
    provider: "World Athletics",
    externalId: "123456",
    sourceUrl: url,
    capturedAt: "2026-10-10",
    complete: false,
    yearsExpected: [2001],
    yearsCaptured: [2001],
    performances: rows,
  },
];
const sourceRows = history([
  row({ notes: "Club archive differs by one second." }),
  row({
    meeting: "World Athletics all-time toplist",
    sourceUrls: ["https://worldathletics.org/athletes/athlete=123456"],
  }),
]);
const before = JSON.stringify([result, sourceRows]);
const timeline = buildProfileTimeline([result], sourceRows);
assert.equal(timeline.count, 1, "Catalogue, career record and toplist show one performance");
assert.equal(timeline.results[0].finishTimeSeconds, 8315, "Official time is unchanged");
assert.match(timeline.results[0].details.note, /differs by one second/);
assert.equal(JSON.stringify([result, sourceRows]), before, "Stored input is never mutated");
assert.equal(
  additionalHistoryResults(sourceRows).length,
  0,
  "Layout must not promote legacy verification",
);
assert.equal(
  buildProfileTimeline([result], history([row({ performance: "2:18:34" })])).count,
  2,
  "Conflicting marks remain separate",
);
assert.equal(
  buildProfileTimeline([], history([row({ date: "" }), row({ date: "" })])).count,
  2,
  "Year-only entries are not guessed to be duplicates",
);
assert.equal(
  buildProfileTimeline(
    [],
    history([
      row({ discipline: "5000 Metres", performance: "14:30.11", labels: ["Round: H1"] }),
      row({ discipline: "5000 Metres", performance: "14:30.11", labels: ["Round: H2"] }),
    ]),
  ).count,
  2,
  "Separate heats survive",
);
assert.equal(
  buildProfileTimeline(
    [],
    history([
      row({ discipline: "5000 Metres", performance: "14:30.11" }),
      row({ discipline: "5 Kilometres Road", performance: "14:30.11" }),
    ]),
  ).count,
  2,
  "Track and road stay separate",
);
assert.equal(buildProfileTimeline([], history([row({ profileExcluded: true })])).count, 0);
const short = buildProfileTimeline(
  [{ ...result, distanceCode: "Half (short course)", finishTimeSeconds: 3609 }],
  history([row({ discipline: "Half Marathon", performance: "1:00:09 (SC)" })]),
);
assert.equal(short.count, 1);
assert.equal(
  short.results[0].distanceCode,
  "Half (short course)",
  "Short-course exclusion survives",
);
const decimal = buildProfileTimeline(
  [],
  history([row({ discipline: "10,000 Metres", performance: "27:47.79" })]),
);
assert.equal(decimal.history[0].performance.performance, "27:47.79");
assert.equal(
  buildProfileTimeline([], history([row({ discipline: "10 Kilometres Road" })])).history[0].sport,
  "Running",
);
assert.equal(profileDisciplineLabel("10 Kilometres Road"), profileDisciplineLabel("10K"));
assert.equal(profileDisciplineLabel("10 Miles Road"), profileDisciplineLabel("10mi"));
console.log(
  "Profile timeline: deduplication, source precedence, precision, year-only dates, rounds and eligibility checks passed.",
);
