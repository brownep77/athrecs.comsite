import assert from "node:assert/strict";
import { publicAthleteCareer } from "../src/lib/athrecs/public-athlete-career.ts";
import { publicAthleteSearchContent } from "../src/lib/athrecs/public-athlete-search-content.ts";
const recorded = (name, date, extra = {}) => ({
  kind: "recorded",
  result: {
    eventName: name,
    eventSlug: name.toLowerCase().replaceAll(" ", "-"),
    eventDate: date,
    distanceCode: "Marathon",
    status: "finished",
    details: { verificationStatus: "unverified", note: "Private evidence sentinel" },
    sourceUrls: ["https://example.test/private-evidence"],
    finishTimeSeconds: 15599,
    ...extra,
  },
});
const entries = [
  recorded("Early Marathon", "2006-04-23"),
  ...Array.from({ length: 9 }, (_, i) =>
    recorded(`Recent Event ${i}`, `2025-01-${String(i + 1).padStart(2, "0")}`, {
      distanceCode: i % 2 ? "10K" : "Half",
      details: { verificationStatus: "source_verified" },
    }),
  ),
  recorded("Private excluded event", "1999-01-01", { details: { profileExcluded: true } }),
  recorded("DNF event", "1998-01-01", { status: "DNF" }),
  recorded("Future event", "2199-01-01"),
  recorded("Disqualified event", "1997-01-01", { status: "DQ" }),
  recorded("Conflicted event", "1996-01-01", { conflicting: true }),
];
const summary = publicAthleteCareer("Synthetic Runner", entries, true);
assert(
  publicAthleteCareer("Limited preview", entries).events.every(
    (event) => !("performance" in event) && !("qualifications" in event),
  ),
);
assert.equal(summary.events.length, 6);
assert.equal(summary.events[0].name, "Early Marathon");
assert.equal(summary.events[0].verification, "Unverified record");
assert.equal(summary.events[0].performance, "4:19:59");
assert.equal(summary.events[1].verification, "Source checked");
assert.match(summary.text, /2006 to 2025/);
assert.equal(new Set(summary.events.map((e) => e.name)).size, 6);
const safe = JSON.stringify(summary);
for (const secret of [
  "Private evidence sentinel",
  "https://example.test",
  "15599",
  "DNF event",
  "Future event",
  "Disqualified event",
  "Conflicted event",
  "Private excluded event",
])
  assert(!safe.includes(secret), secret);
for (const event of summary.events)
  assert.deepEqual(Object.keys(event).sort(), [
    "discipline",
    "eventSlug",
    "name",
    "performance",
    "qualifications",
    "verification",
    "year",
  ]);
assert.equal(publicAthleteCareer("Empty", []), null);
const mixedLabels = publicAthleteCareer("Distances", [
  recorded("First 10K", "2020-01-01", { distanceCode: "10k" }),
  recorded("Second 10K", "2021-01-01", { distanceCode: "10 km" }),
  recorded("Five miles", "2022-01-01", { distanceCode: "5 miles" }),
  recorded("Recent 10K", "2023-01-01", { distanceCode: "10K" }),
]);
assert.match(mixedLabels.text, /in 10K, 5mi\.$/);
assert.equal(new Set(mixedLabels.events.map((event) => event.discipline)).size, 2);
const history = (overrides = {}) => ({
  kind: "history",
  result: {
    performance: {
      year: 2001,
      date: "",
      discipline: "Marathon",
      meeting: "Historic Marathon",
      performance: "4:19:59",
      place: "",
      labels: [],
      sourceUrls: ["https://example.test/source"],
      verificationStatus: "verified_by_administrator",
      ...overrides,
    },
  },
});
assert.equal(
  publicAthleteCareer("History", [history()]).events[0].verification,
  "Administrator confirmed",
);
assert.equal(publicAthleteCareer("History", [history({ yearLabel: "2001–2002" })]), null);
assert.equal(publicAthleteCareer("History", [history({ labels: ["split: half"] })]), null);
assert.equal(publicAthleteCareer("History", [history({ profileExcluded: true })]), null);
const precise = publicAthleteCareer(
  "History",
  [
    history({
      performance: "04:49:04.64",
      verificationStatus: "unverified",
      labels: ["Provisional results", "Private evidence sentinel"],
    }),
  ],
  true,
).events[0];
assert.equal(precise.performance, "04:49:04.64", "Preserve the published precision");
assert.equal(precise.verification, "Unverified record", "Showing a time does not verify it");
assert.deepEqual(precise.qualifications, ["Provisional results"]);
const content = publicAthleteSearchContent({
  slug: "synthetic",
  displayName: "Synthetic Runner",
  sports: ["Running"],
  biography: ["Synthetic Runner is a runner."],
  careerSummary: summary,
  entries: [],
});
assert.match(content.description, /Early Marathon/);
assert.match(content.jsonLd.mainEntity.description, /Early Marathon \(2006; unverified record\)/);
assert(!JSON.stringify(content).includes("15599"));
console.log(
  "PASS: six distinct public career events, older event search relevance, explicit verification, valid years and no private evidence/full result fields.",
);
