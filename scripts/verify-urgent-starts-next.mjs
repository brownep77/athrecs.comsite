import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { URGENT_STARTS_NEXT_REVIEW as review } from "./lib/urgent-starts-next-2026-10-25-review.mjs";
import details from "../src/data/urgent-starts-next-2026-10-25.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { importEventSlug, slugify } = await import("../src/lib/athrecs/import.server.ts");
assert.equal(importEventSlug("legacy--event-", "Changed name"), "legacy--event-");
assert.equal(importEventSlug(undefined, "New Display Name"), "new-display-name");
assert.equal(importEventSlug("Not a Slug"), slugify("Not a Slug"));
const { checkedFixtureStart, checkedFixtureStartLabel, isReviewedFixturePlaceholder } =
  await import("../src/data/fixture-details.ts");
const { fixtureDateIsWithheld } = await import("../src/data/fixture-date-reviews.ts");
const { editions } = await import("../src/data/catalogue.ts");
const { buildCalendarEvent } = await import("../src/lib/athrecs/event-calendar.ts");
const { pg, sql } = await bulkFixture();
try {
  const events = new Set();
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const eventId = before?.event_id ?? review.additions[key].eventId;
    if (!events.has(eventId)) {
      await sql.query(
        "insert into events(id,slug,name,sport,country) values($1,$2,$2,'Running','Test')",
        [eventId, slug],
      );
      events.add(eventId);
    }
    if (before)
      await sql.query(
        "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          before.id,
          eventId,
          date,
          distance,
          before.distance_km,
          before.status,
          before.start_time,
          before.source_url,
          before.notes,
        ],
      );
  }
  // Preserve the imported placeholder while publishing its checked distances.
  await sql.query(
    "insert into editions(event_id,event_date,distance_code,distance_km,status) values(3065326,'2026-10-25','Other',0,'TBC')",
  );
  await sql.query("update editions set notes='Concurrent correction' where id=83204337");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set notes=$1 where id=83204337", [
    review.baseline[
      "wa-5th-shuhei-nishida-memorial-track-and-field-tournament-7244642|2026-10-25|Track & field"
    ].notes,
  ]);
  const unsafe = structuredClone(review);
  delete unsafe.additions[
    "wa-4th-kokushikan-university-competition-7245266|2026-11-07|Track & field"
  ].nonDistanceProgramme;
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, unsafe),
    /Reviewed baseline changed/,
  );
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query(
    "select e.slug,d.*,d.event_date::text as date from editions d join events e on e.id=d.event_id",
  );
  assert.equal(rows.length, 19);
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const detail = details[slug + "|" + date];
    const start = detail.starts[distance];
    const row = rows.find(
      (r) => r.slug === slug && r.date === date && r.distance_code === distance,
    );
    assert.equal(row.start_time, start.time, key);
    assert.equal(
      row.status,
      review.statusCorrections?.[key]?.to ?? before?.status ?? review.additions[key].status,
      key,
    );
    if (before) {
      assert.equal(row.id, before.id);
      assert(row.notes.startsWith(before.notes ?? ""));
    }
    const seed = editions.filter(
      (e) => e.seriesSlug === slug && e.date === date && e.distance === distance,
    );
    // Mamers was imported directly and has no static seed. Its edition override
    // applies to database reads; every newly added seed must still exist exactly once.
    assert.equal(seed.length, slug === "les-foulees-mamertines" ? 0 : 1, key);
    if (seed.length) {
      assert.equal(seed[0].startTime ?? null, start.time, key);
      assert.equal(seed[0].status, row.status, key);
    }
    assert.equal(checkedFixtureStart(slug, date, distance, "12:00"), start.time);
    assert.equal(checkedFixtureStart(slug, "2027-10-25", distance, null), null);
    assert(checkedFixtureStartLabel(slug, date, distance));
    const event = buildCalendarEvent({
      id: key,
      name: slug,
      date,
      distance,
      startTime: start.time,
      timeZone: detail.timeZone,
      pageUrl: "https://www.athrecs.com/races/" + slug,
    });
    if (start.time === null)
      assert.equal(
        event.startUtc,
        null,
        "provisional or cancelled programme must not become an exact calendar time",
      );
    else
      assert.equal(
        event.startUtc,
        "2026-10-25T" +
          { "08:02": "06:02", "08:10": "06:10", "08:20": "06:20", "11:40": "09:40" }[start.time] +
          ":00Z",
        "Kyiv winter-time conversion",
      );
  }
  assert.equal(rows.filter((r) => r.distance_code === "Other").length, 1);
  assert(
    isReviewedFixturePlaceholder(
      "wa-privatbank-kyiv-unbroken-marathon-7237779",
      "2026-10-25",
      "Other",
    ),
  );
  assert(
    !isReviewedFixturePlaceholder(
      "wa-privatbank-kyiv-unbroken-marathon-7237779",
      "2026-10-24",
      "Other",
    ),
  );
  assert(fixtureDateIsWithheld("wa-croatian-road-running-championships-7245412", "2026-10-25"));
  assert(!fixtureDateIsWithheld("wa-croatian-road-running-championships-7245412", "2026-10-31"));
  assert(fixtureDateIsWithheld("wa-serbian-cross-country-championships-7240001", "2026-10-25"));
  assert(!fixtureDateIsWithheld("wa-serbian-cross-country-championships-7240001", "2026-10-24"));
  const audit = await sql.query("select operation from catalogue_change_log where revision_id=$1", [
    published.revisionId,
  ]);
  assert.equal(audit.length, 18);
  assert.equal(audit.filter((a) => a.operation === "insert").length, 14);
  assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  console.log(
    "Urgent next pass passed: 18 audited editions, 4 exact wave starts, qualified unknowns, date and cancellation scope, seed parity, baseline/replay guards and DST calendar checks.",
  );
} finally {
  await pg.close();
}
