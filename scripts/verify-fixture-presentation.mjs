import assert from "node:assert/strict";
import {
  formatFixtureStart,
  fixtureSummary,
  fixtureTimeZone,
} from "../src/lib/athrecs/fixture-presentation.ts";
import { FIXTURE_DETAILS } from "../src/data/fixture-details.ts";

// Boundaries catch month-based DST guesses and accidental viewer-zone conversion.
for (const [date, zone, expected] of [
  ["2026-03-28", "Europe/London", "09:00 GMT (UTC)"],
  ["2026-03-29", "Europe/London", "09:00 BST (UTC+1)"],
  ["2026-10-24", "Europe/London", "09:00 BST (UTC+1)"],
  ["2026-10-25", "Europe/London", "09:00 GMT (UTC)"],
  ["2026-10-10", "Europe/Amsterdam", "09:00 CEST (UTC+2)"],
  ["2026-10-25", "Europe/Amsterdam", "09:00 CET (UTC+1)"],
  ["2026-03-07", "America/New_York", "09:00 EST (UTC−5)"],
  ["2026-03-08", "America/New_York", "09:00 EDT (UTC−4)"],
  ["2026-11-01", "America/New_York", "09:00 EST (UTC−5)"],
  ["2026-10-09", "Europe/Dublin", "09:00 IST (UTC+1)"],
])
  assert.equal(formatFixtureStart("09:00", date, zone), expected);
assert.equal(
  formatFixtureStart("01:30", "2026-03-29", "Europe/London"),
  "01:30 local · time zone TBC",
);
assert.equal(
  formatFixtureStart("01:30", "2026-10-25", "Europe/London"),
  "01:30 local · time zone TBC",
);
assert.equal(
  formatFixtureStart("07:00", "2026-10-10", "Asia/Kolkata"),
  "07:00 Asia/Kolkata (UTC+5:30)",
);
assert.equal(formatFixtureStart("24:00", "2026-10-10", "Europe/London"), "Start time TBC");
assert.equal(formatFixtureStart(null, "2026-10-10", "Europe/London"), "Start time TBC");
assert.equal(formatFixtureStart("09:00", "2026-10-10", "invalid"), "09:00 local · time zone TBC");
assert.equal(fixtureTimeZone("United States"), null, "Do not assign Eastern time to all US races");
assert.equal(
  fixtureTimeZone("Australia"),
  null,
  "Do not assign Sydney time to all Australian races",
);
assert.equal(fixtureTimeZone("unknown"), null);
assert.equal(fixtureTimeZone("England"), "Europe/London");
assert.equal(fixtureSummary("<p> A race. </p>", "Running", "London"), "A race.");
assert.equal(fixtureSummary(null, "Running", "London"), "Running event in London.");
assert.ok(fixtureSummary("A race. ".repeat(50), "Running", null).length <= 155);

for (const [key, detail] of Object.entries(FIXTURE_DETAILS)) {
  const date = key.split("|")[1];
  assert.ok(new URL(detail.sourceUrl).protocol === "https:");
  assert.match(detail.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const start of Object.values(detail.starts)) {
    assert.ok(!formatFixtureStart(start.time, date, detail.timeZone).includes("TBC"));
  }
}
console.log(
  "Fixture presentation: DST boundaries, ambiguous clocks, offsets, unknown venues, summaries and source records passed.",
);
