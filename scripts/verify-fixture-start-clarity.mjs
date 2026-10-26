import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { distanceDisplayLabel, formatDistanceWithUnits } from "../src/lib/athrecs/distance.ts";
import { formatLocalClock } from "../src/lib/athrecs/timezone.ts";
import {
  checkedFixtureStart,
  checkedFixtureStartLabel,
  isReviewedFixturePlaceholder,
} from "../src/data/fixture-details.ts";
import { readSportFixtures } from "../src/lib/athrecs/sport-fixtures.server.ts";
import { RUNNING_FIXTURE_SCOPE } from "../src/lib/athrecs/sport-pages.ts";
import { buildCalendarEvent } from "../src/lib/athrecs/event-calendar.ts";

for (const value of ["", "Other", " other ", "Unknown", "TBC", "TBD", "N/A"]) {
  assert.equal(distanceDisplayLabel(value), "Distance not yet confirmed");
  assert.equal(formatDistanceWithUnits(value), "Distance not yet confirmed");
}
assert.equal(distanceDisplayLabel("Other", 12), "12 km / 7.5 mi");
assert.equal(distanceDisplayLabel("Half"), "Half marathon");
assert.equal(distanceDisplayLabel("Relay"), "Relay");
for (const value of [null, "", "Other", "TBC", "09:00 rubbish", "24:00", "09:60", "-1:00"]) {
  assert.equal(formatLocalClock(value, { country: "Germany", date: "2026-10-25" }), null);
}
assert.equal(formatLocalClock("9:30:00", { country: "Germany", date: "2026-10-25" }), "09:30 CET");

assert.equal(formatLocalClock("9:30", { country: "Germany", date: "2026-10-24" }), "09:30 CEST");
assert.equal(formatLocalClock("9:30", { country: "Germany", date: "2026-03-28" }), "09:30 CET");
assert.equal(formatLocalClock("9:30", { country: "Germany", date: "2026-03-29" }), "09:30 CEST");

const slug = "wa-32-hella-hamburg-half-marathon-7238156";
const date = "2026-10-25";
assert.equal(checkedFixtureStart(slug, date, "Half", "08:00"), "09:30");
assert.match(checkedFixtureStartLabel(slug, date, "Half · Other"), /First wave 09:30 CET.*11:00/);
assert.equal(checkedFixtureStartLabel(slug, "2027-10-25", "Half"), null);
assert.equal(checkedFixtureStart(slug, "2027-10-25", "Half", null), null);
assert.equal(checkedFixtureStart(slug, date, "5K", null), null);
assert.equal(isReviewedFixturePlaceholder(slug, date, "Other"), true);
assert.equal(isReviewedFixturePlaceholder(slug, "2027-10-25", "Other"), false);
assert.equal(isReviewedFixturePlaceholder("unrelated-race", date, "Other"), false);

const db = new PGlite();
try {
  await db.exec(`
    create table events (id int primary key, name text, sport text, city text, country text, website text, surface text, slug text, summary text, county text);
    create table editions (id int primary key, event_id int, event_date date, distance_code text, distance_km double precision default 0, status text default 'Open', start_time text, source_url text, end_date date, end_time text, end_source_url text, end_checked_at date);
    insert into events values (1, 'Hamburg regression fixture', 'Running', 'Hamburg', 'Germany', 'https://example.org', 'Road', '${slug}', '', 'Hamburg'),
      (2, 'Unresolved regression fixture', 'Running', 'Norwich', 'England', 'https://example.org', 'Road', 'unrelated-race', '', 'Norfolk');
    insert into editions (id,event_id,event_date,distance_code,distance_km,start_time,source_url) values
      (1,1,'${date}','Half',21.0975,'09:30','https://example.org/half'),
      (2,1,'${date}','Other',0,'09:30','https://example.org/placeholder'),
      (3,2,'${date}','Other',0,null,'https://example.org/unknown'),
      (4,2,'${date}','10K',10,'10:00','https://example.org/ten');
  `);
  await db.exec("alter table events add column region text");
  const sql = { query: async (query, params) => (await db.query(query, params)).rows };
  const result = await readSportFixtures(sql, RUNNING_FIXTURE_SCOPE, date);
  const hamburg = result.fixtures.find((item) => item.slug === slug);
  assert.equal(hamburg.starts.length, 1, "Reviewed duplicate must not appear as another start");
  const start = hamburg.starts[0];
  assert.equal(start.distance, "Half");
  assert.match(start.label, /First wave 09:30 CET.*11:00/);
  for (const time of ["09:30", "09:45", "10:00", "10:15", "10:30", "10:45", "11:00"]) {
    assert.ok(start.note.includes(time));
    assert.ok(start.calendarRace.raceDayInformation.includes(time));
  }
  assert.equal(
    buildCalendarEvent(start.calendarRace).startUtc,
    null,
    "Wave programmes remain date-only until the runner knows their assigned block",
  );
  assert.equal(
    result.fixtures.find((item) => item.slug === "unrelated-race").starts.length,
    1,
    "Unconfirmed distance is held without deleting it or suppressing the confirmed sibling",
  );
  assert.equal(
    (await db.query("select count(*)::int n from editions")).rows[0].n,
    4,
    "Presentation must preserve original evidence",
  );
} finally {
  await db.close();
}
console.log(
  "Fixture start clarity: placeholders, exact edition, waves, DST and evidence retention passed",
);
