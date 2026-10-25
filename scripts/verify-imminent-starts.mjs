import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { IMMINENT_STARTS_REVIEW as review } from "./lib/imminent-starts-2026-10-25-review.mjs";
import details from "../src/data/imminent-starts-2026-10-25.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { checkedFixtureStart, checkedFixtureStartLabel } =
  await import("../src/data/fixture-details.ts");
const { fixtureDateIsWithheld } = await import("../src/data/fixture-date-reviews.ts");
const { editions } = await import("../src/data/catalogue.ts");
const { buildCalendarEvent } = await import("../src/lib/athrecs/event-calendar.ts");
const { raceEditionStart } = await import("../src/lib/athrecs/race-page-metadata.ts");
assert.equal(
  raceEditionStart(
    { slug: "tirana-marathon", country: "Albania" },
    { event_date: "2026-11-15", distance_code: "Marathon", status: "Open", start_time: "09:00" },
  ),
  "09:00 CET",
  "the shared race-page formatter must retain the reviewed venue timezone",
);
const { formatLocalClock, timeZoneForPlace, calendarTimeZoneForPlace } =
  await import("../src/lib/athrecs/timezone.ts");
assert.equal(formatLocalClock("09:00", { country: "Albania", date: "2026-11-15" }), "09:00 CET");
assert.equal(calendarTimeZoneForPlace({ country: "Albania" }), "Europe/Tirane");
const adelaidePlace = {
  country: "Australia",
  date: "2026-10-25",
  timeZone: details["wa-athletics-sa-state-all-schools-championships-7245416|2026-10-25"].timeZone,
};
assert.equal(timeZoneForPlace(adelaidePlace), "Australia/Adelaide");
assert.equal(formatLocalClock("09:00", adelaidePlace), "09:00 ACDT");
const { pg, sql } = await bulkFixture();
try {
  const eventIds = new Set();
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const eventId = before?.event_id ?? review.additions[key].eventId;
    if (!eventIds.has(eventId)) {
      await sql.query(
        "insert into events(id,slug,name,sport,country) values($1,$2,$2,'Running','Test')",
        [eventId, slug],
      );
      eventIds.add(eventId);
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
  await sql.query("update editions set start_time='06:00' where id=83428474");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=83428474");
  const wrongCanonical = structuredClone(review);
  wrongCanonical.additions["tirana-marathon|2026-11-15|Half"].eventId = 999;
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, wrongCanonical),
    /Reviewed baseline changed/,
  );
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, { ...review, additions: {} }),
    /Reviewed baseline changed/,
  );
  await sql.query(
    "insert into editions(event_id,event_date,distance_code,distance_km,status) values(3059325,'2026-11-15','Half',21.0975,'TBC')",
  );
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  await sql.query("delete from editions where event_id=3059325");
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query(
    "select e.slug,d.*,d.event_date::text as date from editions d join events e on e.id=d.event_id",
  );
  assert.equal(rows.length, 7);
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const start = details[`${slug}|${date}`].starts[distance];
    const row = rows.find(
      (r) => r.slug === slug && r.date === date && r.distance_code === distance,
    );
    assert(row, key);
    assert.equal(row.start_time, start.time, key);
    if (before) {
      assert.equal(row.id, before.id);
      assert(row.notes.startsWith(before.notes));
    }
    assert.equal(
      row.status,
      review.statusCorrections?.[key]?.to ?? before?.status ?? review.additions[key].status,
    );
    const seeded = editions.filter(
      (e) => e.seriesSlug === slug && e.date === date && e.distance === distance,
    );
    assert.equal(seeded.length, 1, `exact seed scope: ${key}`);
    assert.equal(seeded[0].startTime ?? null, start.time, `seed retains start: ${key}`);
    assert.equal(seeded[0].status, row.status);
    assert.equal(seeded[0].source, row.source_url);
    assert.equal(checkedFixtureStart(slug, date, distance, null), start.time);
    assert.equal(checkedFixtureStart(slug, date.replace("2026", "2027"), distance, null), null);
  }
  const audit = await sql.query(
    "select operation,before_json,after_json from catalogue_change_log where revision_id=$1",
    [published.revisionId],
  );
  assert.equal(audit.length, 7);
  assert.equal(audit.filter((a) => a.operation === "insert").length, 3);
  assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.equal(
    checkedFixtureStart("chengdu-marathon", "2026-10-25", "Half", null),
    null,
    "do not copy marathon wave to half",
  );
  for (const [key, detail] of Object.entries(details))
    for (const [distance, start] of Object.entries(detail.starts)) {
      const [slug, date] = key.split("|");
      const label = checkedFixtureStartLabel(slug, date, distance);
      const event = buildCalendarEvent({
        id: key,
        name: slug,
        date,
        distance,
        startTime: start.time,
        startLabel: label,
        timeZone: detail.timeZone,
        pageUrl: `https://www.athrecs.com/races/${slug}`,
        raceDayInformation: start.publicNote,
      });
      if (label)
        assert.equal(
          event.startUtc,
          null,
          "wave, programme and provisional labels must not become a personal start instant",
        );
      else assert.equal(event.startUtc, "2026-11-15T08:00:00Z", "Tirana CET conversion");
    }
  for (const slug of [
    "tirana-marathon",
    "cramond-promenade-5k-10k-half-marathon-october",
    "x-ray-marathon",
  ]) {
    assert(fixtureDateIsWithheld(slug, "2026-10-25"));
    assert(!fixtureDateIsWithheld(slug, "2027-10-25"));
  }
  assert(!fixtureDateIsWithheld("tirana-marathon", "2026-11-15"));
  assert(!fixtureDateIsWithheld("roentgenlauf", "2026-10-25"));
  assert.equal(
    rows.filter((r) => r.slug === "tirana-marathon" && r.distance_code === "2.3K").length,
    0,
  );
  console.log(
    "Imminent starts passed: seven audited changes, absent-row/canonical guards, replay safety, seed consistency, waves, provisional clocks, date holds and exact edition scope.",
  );
} finally {
  await pg.close();
}
