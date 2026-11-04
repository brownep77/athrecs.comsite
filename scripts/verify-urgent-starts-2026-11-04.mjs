import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { URGENT_STARTS_20261104_REVIEW as review } from "./lib/urgent-starts-2026-11-04-review.mjs";
import details from "../src/data/urgent-starts-2026-11-04.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { isReviewedFixturePlaceholder, checkedFixtureStart } =
  await import("../src/data/fixture-details.ts");
const { catalogueCalendarRace } = await import("../src/lib/athrecs/catalogue-calendar.ts");
const { buildCalendarEvent } = await import("../src/lib/athrecs/event-calendar.ts");
const { raceEditionStart } = await import("../src/lib/athrecs/race-page-metadata.ts");
const nesher = "wa-israeli-10km-road-running-championships-7233553";
const atlanta = "mercedes-benz-stadium-move-with-madd-5k";
const { pg, sql } = await bulkFixture();
try {
  await sql.query(
    "insert into events(id,slug,name,sport,country,city) values(4390268,$1,'Israeli 10km Road Running Championships','Running','Israel','Nesher'),(3059369,$2,'Mercedes-Benz Stadium Move with MADD 5K','Running','United States','Atlanta')",
    [nesher, atlanta],
  );
  const mile = review.baseline[`${atlanta}|2026-11-07|1mi`];
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,'2026-11-07','1mi',$3,$4,$5,$6,$7)",
    [
      mile.id,
      mile.event_id,
      mile.distance_km,
      mile.status,
      mile.start_time,
      mile.source_url,
      mile.notes,
    ],
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,notes) values(71611911,3059369,'2026-11-07','5K',5,'Open','08:00','Existing verified 5K'),(109479947,4390268,'2026-11-06','Other',0,'TBC',null,'Original World Athletics placeholder')",
  );
  const untouched = await sql.query(
    "select * from editions where id in (71611911,109479947) order by id",
  );
  await sql.query("update editions set start_time='08:15' where id=109710421");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=109710421");
  const result = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query(
    "select d.*,d.event_date::text as date,e.slug,e.name,e.country from editions d join events e on e.id=d.event_id",
  );
  assert.equal(rows.length, 4);
  assert.deepEqual(
    await sql.query("select * from editions where id in (71611911,109479947) order by id"),
    untouched,
  );
  const audit = await sql.query("select operation from catalogue_change_log where revision_id=$1", [
    result.revisionId,
  ]);
  assert.equal(audit.length, 2);
  assert.equal(audit.filter((r) => r.operation === "insert").length, 1);
  for (const [slug, date, code, clock, utc, zone] of [
    [nesher, "2026-11-06", "10K", "07:10", "2026-11-06T05:10:00Z", "Asia/Jerusalem"],
    [atlanta, "2026-11-07", "1mi", "08:30", "2026-11-07T13:30:00Z", "America/New_York"],
    [atlanta, "2026-11-07", "5K", "08:00", "2026-11-07T13:00:00Z", "America/New_York"],
  ]) {
    const row = rows.find((r) => r.slug === slug && r.distance_code === code);
    assert(row);
    assert.equal(row.start_time, clock);
    const edition = { ...row, event_date: row.date };
    const calendar = catalogueCalendarRace(row, edition, "https://www.athrecs.com");
    assert.equal(calendar.timeZone, zone);
    assert.equal(buildCalendarEvent(calendar).startUtc, utc);
    assert(raceEditionStart(row, edition).startsWith(clock + " "));
    assert.equal(checkedFixtureStart(slug, date.replace("2026", "2027"), code, null), null);
    assert(!isReviewedFixturePlaceholder(slug, date, code));
  }
  assert(isReviewedFixturePlaceholder(nesher, "2026-11-06", "Other"));
  assert(!isReviewedFixturePlaceholder(nesher, "2027-11-06", "Other"));
  assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  console.log(
    "Urgent starts passed: two audited changes, canonical IDs, concurrent-change rollback, replay safety, preserved 5K/placeholder, exact dates, timezone display and calendar conversion.",
  );
} finally {
  await pg.close();
}
