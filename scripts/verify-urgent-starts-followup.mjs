import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { URGENT_STARTS_FOLLOWUP_REVIEW as review } from "./lib/urgent-starts-followup-2026-10-25-review.mjs";
import details from "../src/data/urgent-starts-followup-2026-10-25.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { checkedFixtureStart, isReviewedFixturePlaceholder } =
  await import("../src/data/fixture-details.ts");
const { editions, seriesList } = await import("../src/data/catalogue.ts");
for (const slug of [
  "wa-les-foul-es-monterelaises-7244787",
  "wa-trek-marathon-de-lille-7244788",
  "wa-maratonina-citt-di-arezzo-7242465",
]) {
  const series = seriesList.find((event) => event.slug === slug);
  assert.equal(series.sport, "Running", "road races must not use track-and-field fallback");
  assert(!series.distances.includes("Other"));
}
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
    else
      await sql.query(
        "insert into editions(event_id,event_date,distance_code,distance_km,status) values($1,$2,'Other',0,'Open')",
        [eventId, date],
      );
  }
  await sql.query("update editions set start_time='06:00' where id=106243529");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time='06:50' where id=106243529");
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query(
    "select e.slug,d.*,d.event_date::text as date from editions d join events e on e.id=d.event_id",
  );
  assert.equal(rows.length, 11, "nine reviewed races plus two retained source placeholders");
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const start = details[`${slug}|${date}`].starts[distance];
    const row = rows.find(
      (r) => r.slug === slug && r.date === date && r.distance_code === distance,
    );
    assert.equal(row.start_time, start.time, key);
    assert.equal(
      row.status,
      review.statusCorrections?.[key]?.to ?? before?.status ?? review.additions[key].status,
    );
    if (before) {
      assert.equal(row.id, before.id);
      assert(row.notes.startsWith(before.notes ?? ""));
    }
    const seed = editions.filter(
      (e) => e.seriesSlug === slug && e.date === date && e.distance === distance,
    );
    assert.equal(seed.length, 1, key);
    assert.equal(seed[0].startTime, start.time, key);
    assert.equal(seed[0].status, row.status, key);
    assert.equal(checkedFixtureStart(slug, date, distance, null), start.time);
    assert.equal(checkedFixtureStart(slug, "2027-10-25", distance, null), null);
    if (!before) {
      assert(isReviewedFixturePlaceholder(slug, date, "Other"));
      assert(!isReviewedFixturePlaceholder(slug, "2027-10-25", "Other"));
      assert(!isReviewedFixturePlaceholder(slug, date, distance));
      assert(
        rows.find((r) => r.slug === slug && r.distance_code === "Other"),
        "preserve source history",
      );
    }
  }
  const audit = await sql.query("select operation from catalogue_change_log where revision_id=$1", [
    published.revisionId,
  ]);
  assert.equal(audit.length, 9);
  assert.equal(audit.filter((a) => a.operation === "insert").length, 2);
  assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.equal(checkedFixtureStart("santa-cruz-marathon", "2026-10-25", "Half", null), null);
  const utc = {
    "bbbrun|2026-10-25|Half": "2026-10-24T19:50:00Z",
    "retie-trail|2026-10-25|8K": "2026-10-25T09:45:00Z",
    "retie-trail|2026-10-25|17K": "2026-10-25T10:00:00Z",
    "retie-trail|2026-10-25|31K": "2026-10-25T09:00:00Z",
    "santa-cruz-marathon|2026-10-25|Marathon": "2026-10-25T14:00:00Z",
    "ecomarathon-futakotama-october|2026-10-25|Half": "2026-10-25T02:00:00Z",
    "wa-les-foul-es-monterelaises-7244787|2026-10-25|10K": "2026-10-25T09:00:00Z",
    "wa-trek-marathon-de-lille-7244788|2026-10-25|Marathon": "2026-10-25T10:15:00Z",
    "wa-maratonina-citt-di-arezzo-7242465|2026-10-25|Half": "2026-10-25T08:30:00Z",
  };
  for (const [key, expected] of Object.entries(utc)) {
    const [slug, date, distance] = key.split("|");
    const detail = details[`${slug}|${date}`];
    const event = buildCalendarEvent({
      id: key,
      name: slug,
      date,
      distance,
      startTime: detail.starts[distance].time,
      timeZone: detail.timeZone,
      pageUrl: `https://www.athrecs.com/races/${slug}`,
    });
    assert.equal(event.startUtc, expected, key);
  }
  console.log(
    "Urgent follow-up passed: nine audited starts, baseline/replay guards, preserved placeholders, exact seed scope and nine timezone/calendar conversions.",
  );
} finally {
  await pg.close();
}
