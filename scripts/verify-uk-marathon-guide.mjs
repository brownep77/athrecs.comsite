import assert from "node:assert/strict";
import {
  currentLondonDate,
  nextLondonMidnight,
  upcomingMarathonEditions,
} from "../src/lib/running/marathon-calendar.ts";
import {
  UK_MARATHON_EDITIONS,
  UK_MARATHON_UNCONFIRMED_2027,
} from "../src/data/uk-marathon-editions.ts";
import { UK_MARATHONS } from "../src/data/uk-marathon-guide.ts";
import { UK_MARATHON_FIELD_ESTIMATES } from "../src/data/uk-marathon-field-estimates.ts";
import {
  UK_MARATHON_FIELDS,
  averageMarathonField,
  marathonCapacity,
  marathonEntries,
  formatMarathonEntries,
} from "../src/data/uk-marathon-fields.ts";

const ids = new Set(UK_MARATHONS.map((race) => race.id));
assert.equal(ids.size, 15);
assert.deepEqual(new Set(Object.keys(UK_MARATHON_FIELD_ESTIMATES)), ids);
for (const estimate of Object.values(UK_MARATHON_FIELD_ESTIMATES)) {
  assert(estimate.display && estimate.years && estimate.explanation);
  assert(["Entrants", "Finishers", "Reported runners"].includes(estimate.basis));
  assert(estimate.sources.length > 0);
  for (const source of estimate.sources) assert.equal(new URL(source).protocol, "https:");
}
assert.equal(
  new Set(UK_MARATHON_EDITIONS.map((e) => `${e.raceId}:${e.startDate}`)).size,
  UK_MARATHON_EDITIONS.length,
);
for (const edition of UK_MARATHON_EDITIONS) {
  assert(ids.has(edition.raceId));
  assert.equal(new Date(edition.startDate).toISOString().slice(0, 10), edition.startDate);
  assert(edition.startDate <= (edition.endDate ?? edition.startDate));
  assert(new URL(edition.sourceUrl).protocol === "https:");
}
for (const id of UK_MARATHON_UNCONFIRMED_2027) {
  assert(ids.has(id));
  assert(!UK_MARATHON_EDITIONS.some((e) => e.raceId === id && e.startDate.startsWith("2027")));
}
assert.equal(upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2026-09-26").length, 17);
assert.equal(currentLondonDate(new Date("2026-09-27T22:59:59Z")), "2026-09-27");
assert.equal(currentLondonDate(new Date("2026-09-27T23:00:00Z")), "2026-09-28");
assert(
  upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2026-09-27").some(
    (e) => e.startDate === "2026-09-27",
  ),
);
assert(
  !upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2026-09-28").some(
    (e) => e.startDate === "2026-09-27",
  ),
);
assert(
  upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2027-04-25").some((e) => e.raceId === "london"),
);
assert(
  !upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2027-04-26").some((e) => e.raceId === "london"),
);
assert.equal(upcomingMarathonEditions(UK_MARATHON_EDITIONS, "2028-01-01").length, 0);
const synthetic = ["2026-09-25", "2027-12-31", "2028-01-01"].map((startDate) => ({
  raceId: "test",
  startDate,
  sourceUrl: "https://example.test",
  checkedAt: "2026-09-26",
}));
assert.deepEqual(
  upcomingMarathonEditions(synthetic, "2026-09-26").map((e) => e.startDate),
  ["2027-12-31"],
);
for (const [now, midnight] of [
  ["2026-09-26T12:00:00Z", "2026-09-26T23:00:00.000Z"],
  ["2026-10-24T12:00:00Z", "2026-10-24T23:00:00.000Z"],
  ["2026-10-25T00:30:00Z", "2026-10-26T00:00:00.000Z"],
  ["2027-03-27T12:00:00Z", "2027-03-28T00:00:00.000Z"],
  ["2027-03-28T12:00:00Z", "2027-03-28T23:00:00.000Z"],
])
  assert.equal(nextLondonMidnight(new Date(now)).toISOString(), midnight);
assert.equal(averageMarathonField("london").count, 58235);
assert.equal(averageMarathonField("abingdon").count, 1004);
assert.equal(averageMarathonField("boston-uk").count, 851);
assert.equal(averageMarathonField("chester").count, 4236);
assert.equal(averageMarathonField("newport"), null, "A single year is not a multi-year average");
assert.equal(marathonCapacity("boston-uk", 2027).places, 1400);
assert.equal(marathonCapacity("boston-uk", 2026), null, "A capacity must match its edition year");
assert.equal(marathonCapacity("london", 2027), null, "Announced field must not become a hard cap");
assert.equal(marathonEntries("loch-ness", 2025).entries, 5800);
assert.equal(marathonEntries("loch-ness", 2026).entries, 6000);
assert.equal(marathonEntries("manchester", 2025).entries, 36000);
assert.equal(marathonEntries("london", 2025), null, "Finishers must not become registrations");
assert.equal(
  marathonEntries("boston-uk", 2025),
  null,
  "Neither results nor capacity establish entries",
);
assert.equal(formatMarathonEntries(marathonEntries("manchester", 2025)), "36,000");
for (const [id, evidence] of Object.entries(UK_MARATHON_FIELDS)) {
  assert(ids.has(id));
  assert.equal(new Set(evidence.finishers.map((s) => s.year)).size, evidence.finishers.length);
  for (const sample of evidence.finishers)
    assert(Number.isSafeInteger(sample.finishers) && sample.finishers > 0);
}
console.log(
  "Passed: 17 verified editions, date-window limits, race-day expiry, two-day London, UK midnight/DST, 15 sourced field estimates, averages and year-specific capacities.",
);
