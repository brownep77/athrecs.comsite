import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readSportFixtures } from "../src/lib/athrecs/sport-fixtures.server.ts";
import {
  getSportPage,
  parseSportFixtureSearch,
  publicHttpUrl,
} from "../src/lib/athrecs/sport-pages.ts";
import { SPORT_BROADCASTS, upcomingBroadcasts } from "../src/data/sport-broadcasts.ts";

assert.equal(getSportPage("biking").sport, "Cycling");
assert.equal(getSportPage("unknown"), undefined);
assert.equal(getSportPage("running").slug, "road-running");
assert.equal(
  upcomingBroadcasts(getSportPage("road-running"), new Date("2026-09-26T12:00:00Z")).length,
  1,
);
assert.equal(
  upcomingBroadcasts(getSportPage("trail-running"), new Date("2026-09-26T12:00:00Z")).length,
  0,
);
assert.equal(
  upcomingBroadcasts(getSportPage("track-and-field"), new Date("2026-09-26T12:00:00Z")).length,
  0,
);
assert.equal(parseSportFixtureSearch({ page: "-2", q: "  Norwich  " }).page, undefined);
assert.equal(parseSportFixtureSearch({ page: "Infinity" }).page, undefined);
assert.equal(parseSportFixtureSearch({ page: "9999" }).page, 400);
assert.equal(publicHttpUrl("javascript:alert(1)"), null);
assert.equal(publicHttpUrl("https://user:secret@example.com"), null);

// Keep ongoing multi-day broadcasts until their final local calendar day ends.
assert.equal(
  upcomingBroadcasts(getSportPage("biking"), new Date("2026-09-28T02:00:00Z")).length,
  1,
);
assert.equal(
  upcomingBroadcasts(getSportPage("biking"), new Date("2026-09-28T05:00:00Z")).length,
  0,
);
assert.equal(
  upcomingBroadcasts(getSportPage("triathlon"), new Date("2026-09-26T23:00:00Z")).length,
  1,
);
assert.equal(
  upcomingBroadcasts(getSportPage("swimming"), new Date("2026-10-03T19:59:59Z")).length,
  3,
);
assert.equal(
  upcomingBroadcasts(getSportPage("swimming"), new Date("2026-10-03T20:00:00Z")).length,
  2,
);
assert.equal(
  upcomingBroadcasts(getSportPage("road-running"), new Date("2027-01-01T12:00:00Z")).length,
  0,
);
for (const broadcast of SPORT_BROADCASTS) {
  assert.ok(publicHttpUrl(broadcast.watchUrl));
  assert.ok(publicHttpUrl(broadcast.sourceUrl));
  assert.ok(broadcast.startDate <= broadcast.endDate);
  assert.ok(broadcast.checkedAt);
}

// Execute the real read query against a disposable PostgreSQL-compatible DB.
// No production connection or athlete records are involved.
const db = new PGlite();
try {
  await db.exec(`
    create table events (id int primary key, name text, sport text, city text, country text, website text, surface text default 'Road');
    create table editions (id int primary key, event_id int, event_date date, distance_code text, start_time text);
    insert into events (id, name, sport, city, country, website) values
      (1, 'Example Run', 'Running', 'Norwich', 'United Kingdom', 'https://example.com/run'),
      (2, 'Example Swim', 'Swimming', 'Norwich', 'United Kingdom', 'javascript:alert(1)'),
      (3, 'Example Ride', 'Cycling', 'Norwich', 'United Kingdom', null),
      (4, '100% Run', 'Running', 'Norwich', 'United Kingdom', null);
    insert into editions values
      (1,1,'2026-09-25','10K','09:00'),
      (2,1,'2026-09-26','10K','09:00'),
      (3,1,'2026-09-26','5K',null),
      (4,2,'2026-09-27','1500m',null),
      (5,3,'2026-09-27','Road',null),
      (6,4,'2026-09-27','10K',null);
  `);
  const sql = { query: async (query, params) => (await db.query(query, params)).rows };
  const running = await readSportFixtures(sql, { ...getSportPage("road-running") }, "2026-09-26");
  assert.deepEqual(
    running.fixtures.map((row) => row.eventDate),
    ["2026-09-26", "2026-09-27"],
  );
  assert.equal(running.fixtures[0].starts.length, 2, "Group distances on the same event day");
  assert.equal(running.fixtures[0].starts[1].time, null, "Do not manufacture start times");
  assert.equal(
    (await readSportFixtures(sql, { ...getSportPage("road-running"), q: "%" }, "2026-09-26"))
      .fixtures.length,
    1,
  );
  assert.equal(
    (
      await readSportFixtures(
        sql,
        { ...getSportPage("road-running"), q: "' OR 1=1 --" },
        "2026-09-26",
      )
    ).fixtures.length,
    0,
  );
  const swimming = await readSportFixtures(sql, { ...getSportPage("swimming") }, "2026-09-26");
  assert.equal(swimming.fixtures.length, 1);
  assert.equal(swimming.fixtures[0].website, null);
  assert.equal(
    (await readSportFixtures(sql, { ...getSportPage("biking") }, "2026-09-26")).fixtures[0].name,
    "Example Ride",
  );
  await db.exec(`
    insert into events (id, name, sport, surface) values
      (10, 'Trail Run', 'Running', 'Trail'),
      (11, 'Track Meeting', 'Athletics', 'Track'),
      (12, 'Track Run', 'Running', 'Track'),
      (13, 'Cross Country', 'Athletics', 'Cross Country'),
      (14, 'Track Cycling', 'Cycling', 'Track'),
      (15, 'Trail Athletics', 'Athletics', 'Trail'),
      (16, 'Athletics Road', 'Athletics', 'Road');
    insert into editions select id, id, '2026-10-01', 'Other', null from events where id >= 10;
  `);
  const namesFor = async (slug) =>
    (await readSportFixtures(sql, getSportPage(slug), "2026-09-26")).fixtures
      .map((row) => row.name)
      .sort();
  assert.deepEqual(await namesFor("trail-running"), ["Trail Athletics", "Trail Run"]);
  assert.deepEqual(await namesFor("track-and-field"), ["Track Meeting", "Track Run"]);
  assert.deepEqual(await namesFor("road-running"), ["100% Run", "Athletics Road", "Example Run"]);
  await db.exec(`delete from editions where event_id >= 10; delete from events where id >= 10;`);
  await db.exec(`
    insert into editions select 100+n, 1, '2026-10-01'::date+n, '10K', null from generate_series(0,30) n;
  `);
  const first = await readSportFixtures(sql, { ...getSportPage("road-running") }, "2026-09-26");
  const second = await readSportFixtures(
    sql,
    { ...getSportPage("road-running"), page: 2 },
    "2026-09-26",
  );
  assert.equal(first.fixtures.length, 24);
  assert.equal(first.hasMore, true);
  assert.equal(second.hasMore, false);
  assert.equal(second.fixtures.length, 9);
  assert.ok(first.fixtures.at(-1).eventDate < second.fixtures[0].eventDate);
} finally {
  await db.close();
}
console.log(
  "Sport fixtures: sport filters, local broadcast expiry, grouped distances, search escaping and pagination passed.",
);
