import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";
import { PGlite } from "@electric-sql/pglite";

// Every write goes to a new in-memory database; no production connection or mail.
const database = new PGlite();
const wrap = (db) => {
  const sql = (strings, ...values) =>
    sql.query(
      strings.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, ""),
      values,
    );
  sql.query = async (text, values = []) => (await db.query(text, values)).rows;
  sql.transaction = (work) => db.transaction((tx) => work(wrap(tx)));
  return sql;
};
const sql = wrap(database);
const vite = await createServer({
  configFile: false,
  resolve: { alias: { "@": path.resolve("src") } },
  server: { middlewareMode: true },
  appType: "custom",
});
let checks = 0;
const check = async (name, run) => {
  await run();
  checks++;
  console.log("PASS:", name);
};
try {
  await database.exec(`
    create table "user" (id text primary key, email text);
    insert into "user" values ('alpha','private-alpha@example.test'),('beta','private-beta@example.test'),('full','private-full@example.test');
    create table events(id int primary key,slug text,name text,country text,county text,city text,website text);
    create table editions(id int primary key,event_id int,event_date date,distance_code text,distance_km double precision,status text,start_time text,end_date date,end_time text,end_source_url text,end_checked_at timestamptz);
    insert into events values (1,'calendar-test','Test race 🏃','England','Norfolk','Norwich','https://example.test');
    insert into editions values (1,1,'2027-07-04','Half',21.0975,'Open','10:00',null,null,null,null),(2,1,'2027-07-04','10K',10,'Open',null,null,null,null,null);
  `);
  await database.exec("alter table events add column sport text default 'Running'");
  await database.exec(
    fs.readFileSync("migrations/20261023_race_calendar_subscriptions.sql", "utf8"),
  );
  const {
    changeRaceCalendar: change,
    loadRaceCalendar: load,
    raceCalendarResponse: feed,
  } = await vite.ssrLoadModule("/src/lib/athrecs/calendar-subscription.server.ts");
  const { raceCalendarFeed, validCalendarToken, validCalendarRaceId } = await vite.ssrLoadModule(
    "/src/lib/athrecs/calendar-subscription.ts",
  );
  const key = (value) => value.feedPath.split("/").at(-1);
  let firstKey, secondKey;
  const { sanitiseWebAnalyticsEvent } = await vite.ssrLoadModule(
    "/src/lib/athrecs/web-analytics.ts",
  );
  assert.equal(
    sanitiseWebAnalyticsEvent(
      { type: "pageview", url: "https://www.athrecs.com/my-race-calendar?race=edition-1-Half" },
      true,
    ),
    null,
  );
  await check("reading a new calendar never creates a token or selections", async () => {
    assert.deepEqual((await load(sql, "alpha")).items, []);
    assert.equal((await load(sql, "alpha")).feedPath, null);
    assert.equal((await sql.query("select * from athlete_race_calendars")).length, 0);
  });
  await check("invalid IDs and non-existent editions cannot be added", async () => {
    for (const id of [
      "",
      "https://internal.test",
      "edition-1-Half\r\nattack",
      "edition-999-Half",
      "edition-1-Half;drop table editions",
      "road-missing-2027-01-01",
    ])
      await assert.rejects(change(sql, "alpha", "add", id));
    assert(!validCalendarRaceId("x".repeat(251)));
  });
  await check("canonical selection creates a private 256-bit subscription", async () => {
    await change(sql, "alpha", "add", "edition-1-Half");
    const value = await load(sql, "alpha");
    firstKey = key(value);
    assert(validCalendarToken(firstKey));
    assert.equal(value.items.length, 1);
    assert.equal(value.items[0].race.startTime, "10:00");
  });
  await check("repeated add is idempotent and retains the subscription", async () => {
    await change(sql, "alpha", "add", "edition-1-Half");
    const value = await load(sql, "alpha");
    assert.equal(value.items.length, 1);
    assert.equal(key(value), firstKey);
  });
  await check(
    "feed has inline calendar headers and correct DST without private account details",
    async () => {
      const response = await feed(sql, firstKey),
        text = await response.text();
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /^text\/calendar/);
      assert.match(response.headers.get("content-disposition"), /^inline;/);
      assert.match(response.headers.get("cache-control"), /no-store/);
      assert.equal(response.headers.get("referrer-policy"), "no-referrer");
      assert.match(text, /DTSTART:20270704T090000Z/);
      assert(!/private-alpha|@example.test|one-off calendar copy/.test(text));
      assert.equal((text.match(/BEGIN:VEVENT/g) || []).length, 1);
    },
  );
  await check("different accounts cannot read or remove each other's selections", async () => {
    await change(sql, "beta", "add", "edition-2-10K");
    assert.equal((await load(sql, "beta")).items[0].id, "edition-2-10K");
    assert.notEqual(key(await load(sql, "beta")), firstKey);
    await change(sql, "beta", "remove", "edition-1-Half");
    assert.equal((await load(sql, "alpha")).items.length, 1);
  });
  await check("date and time corrections retain the event UID", async () => {
    const before = await (await feed(sql, firstKey)).text();
    await sql.query("update editions set event_date='2027-07-05',start_time='11:00' where id=1");
    const after = await (await feed(sql, firstKey)).text();
    assert.match(after, /DTSTART:20270705T100000Z/);
    assert.equal(before.match(/UID:([^\r\n]+)/)[1], after.match(/UID:([^\r\n]+)/)[1]);
  });
  await check(
    "cancellations disappear from the feed without inventing replacement dates",
    async () => {
      await sql.query("update editions set status='Cancelled' where id=1");
      assert(!(await (await feed(sql, firstKey)).text()).includes("BEGIN:VEVENT"));
      await assert.rejects(change(sql, "beta", "add", "edition-1-Half"));
      await sql.query("update editions set status='Open' where id=1");
    },
  );
  await check("guide and ultra editions resolve from canonical data", async () => {
    await change(sql, "alpha", "add", "road-great-north-run-2027-09-12");
    await change(sql, "alpha", "add", "ultra-dartmoor-discovery-2027-06-05");
    const text = await (await feed(sql, firstKey)).text();
    assert.match(text, /Great North Run/);
    assert.match(text, /Dartmoor Discovery/);
    assert.equal((text.match(/BEGIN:VEVENT/g) || []).length, 3);
  });
  await check("reset revokes the previous link and keeps selections", async () => {
    await change(sql, "alpha", "reset");
    secondKey = key(await load(sql, "alpha"));
    assert.notEqual(secondKey, firstKey);
    assert.equal((await feed(sql, firstKey)).status, 404);
    assert.equal((await feed(sql, secondKey)).status, 200);
    assert.equal((await load(sql, "alpha")).items.length, 3);
  });
  await check("disable revokes access; enabling creates a fresh link", async () => {
    await change(sql, "alpha", "disable");
    assert.equal((await feed(sql, secondKey)).status, 404);
    assert.equal((await load(sql, "alpha")).feedPath, null);
    await change(sql, "alpha", "enable");
    firstKey = key(await load(sql, "alpha"));
    assert.notEqual(firstKey, secondKey);
  });
  await check("removing the last selection serves a valid empty feed", async () => {
    for (const { id } of (await load(sql, "alpha")).items) await change(sql, "alpha", "remove", id);
    const response = await feed(sql, firstKey),
      text = await response.text();
    assert.equal(response.status, 200);
    assert(text.startsWith("BEGIN:VCALENDAR\r\n"));
    assert(text.endsWith("END:VCALENDAR\r\n"));
    assert(!text.includes("BEGIN:VEVENT"));
  });
  await check(
    "invalid tokens do not query the database; unknown valid tokens are 404",
    async () => {
      const noQueries = () => {
        throw new Error("Unexpected query");
      };
      for (const invalid of ["", "a".repeat(63), "A".repeat(64), "../alpha", "x".repeat(10000)])
        assert.equal((await feed(noQueries, invalid)).status, 404);
      assert.equal((await feed(sql, "f".repeat(64))).status, 404);
    },
  );
  await check("selection limits hold without blocking repeat additions", async () => {
    await change(sql, "full", "add", "edition-1-Half");
    await sql.query(
      "insert into athlete_race_calendar_items(user_id,race_id) select 'full','edition-'||n||'-Half' from generate_series(100,298) n",
    );
    await assert.rejects(change(sql, "full", "add", "edition-2-10K"), /200 races/);
    await change(sql, "full", "add", "edition-1-Half");
    assert.equal((await load(sql, "full")).items.length, 200);
  });
  await check("feed de-duplicates UIDs and escapes injected fields", async () => {
    const race = {
      id: "synthetic",
      name: "Race\r\nBEGIN:VEVENT 🏃",
      date: "2027-07-04",
      pageUrl: "javascript:alert(1)",
      officialUrl: "https://runabc.co.uk/hidden",
    };
    const text = raceCalendarFeed([race, race]);
    assert.equal((text.match(/^BEGIN:VEVENT/gm) || []).length, 1);
    assert(!/javascript:|runabc/i.test(text));
    for (const line of text.split("\r\n")) assert(Buffer.byteLength(line) <= 75);
  });
  await check("withheld fixture dates do not leak into subscriptions", async () => {
    const { withheldFixtureDateKeys } = await vite.ssrLoadModule(
      "/src/data/fixture-date-reviews.ts",
    );
    const [slug, date] = withheldFixtureDateKeys[0].split("|");
    await sql.query("update events set slug=$1 where id=1", [slug]);
    await sql.query("update editions set event_date=$1 where id=1", [date]);
    assert.equal((await load(sql, "beta")).items[0].race?.id, "edition-2-10K");
    await assert.rejects(change(sql, "alpha", "add", "edition-1-Half"));
  });
  console.log(`PASS: ${checks} subscription integration scenarios with real PostgreSQL semantics.`);
} finally {
  await vite.close();
  await database.close();
}
