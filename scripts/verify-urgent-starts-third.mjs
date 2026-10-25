import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { URGENT_STARTS_THIRD_REVIEW as review } from "./lib/urgent-starts-third-2026-10-25-review.mjs";
import details from "../src/data/urgent-starts-third-2026-10-25.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { checkedFixtureStart, checkedFixtureStartLabel, isReviewedFixturePlaceholder } =
  await import("../src/data/fixture-details.ts");
const { fixtureDateIsWithheld } = await import("../src/data/fixture-date-reviews.ts");
const { editions, seriesList } = await import("../src/data/catalogue.ts");
const { thirdUrgentAdditions } = await import("../src/data/urgent-starts-third-2026-10-25.ts");
const { reviewedRacePage } = await import("../src/data/race-page-reviews.ts");
const { buildCalendarEvent } = await import("../src/lib/athrecs/event-calendar.ts");
const { catalogueCalendarRace } = await import("../src/lib/athrecs/catalogue-calendar.ts");
const { pg, sql } = await bulkFixture();
try {
  const eventIds = new Set();
  for (const [key, before] of Object.entries(review.baseline)) {
    const [slug, date, distance] = key.split("|");
    const eventId = before?.event_id ?? review.additions[key].eventId;
    if (!eventIds.has(eventId)) {
      await sql.query("insert into events(id,slug,name,sport,country) values($1,$2,$2,$3,'Test')", [
        eventId,
        slug,
        slug.startsWith("be-youth") ? "Cycling" : "Running",
      ]);
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
  for (const eventId of [3065227, 3349179])
    await sql.query(
      "insert into editions(event_id,event_date,distance_code,distance_km,status) values($1,'2026-10-25','Other',0,'Open')",
      [eventId],
    );
  await sql.query("update editions set notes='Concurrent change' where id=109456040");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set notes=$1 where id=109456040", [
    review.baseline["maule-corre|2026-10-25|0.8K"].notes,
  ]);
  const unsafe = structuredClone(review);
  delete unsafe.additions["be-youth-cx-beernem-october|2026-10-25|Cyclo-cross U12"]
    .nonDistanceProgramme;
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, unsafe),
    /Reviewed baseline changed/,
  );
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query(
    "select e.slug,d.*,d.event_date::text as date from editions d join events e on e.id=d.event_id",
  );
  assert.equal(rows.length, 17);
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
      review.statusCorrections[key]?.to ?? before?.status ?? review.additions[key].status,
      key,
    );
    if (before) {
      assert.equal(row.id, before.id);
      assert(row.notes.startsWith(before.notes));
    }
    const seed = editions.filter(
      (e) => e.seriesSlug === slug && e.date === date && e.distance === distance,
    );
    assert.equal(seed.length, slug === "maule-corre" ? 0 : 1, key);
    if (seed.length) {
      assert.equal(seed[0].startTime ?? null, start.time);
      assert.equal(seed[0].status, row.status);
    }
    assert.equal(checkedFixtureStart(slug, date, distance, "00:01"), start.time);
    assert.equal(checkedFixtureStart(slug, "2027-10-25", distance, null), null);
    assert.equal(checkedFixtureStartLabel(slug, date, distance), start.label ?? null);
    const exported = buildCalendarEvent(
      catalogueCalendarRace(
        { slug, name: slug, country: "Test" },
        {
          id: row.id,
          event_date: date,
          distance_code: distance,
          distance_km: row.distance_km,
          status: row.status,
          start_time: row.start_time,
          start_label: checkedFixtureStartLabel(slug, date, distance),
        },
        "https://www.athrecs.com",
      ),
    );
    if (start.label || start.time === null)
      assert.equal(exported.startUtc, null, key + " qualified wave remains a date-only reminder");
    else assert(exported.startUtc, key + " exact category start must export with a clock");
    const calendar = buildCalendarEvent({
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
        calendar.startUtc,
        null,
        "Unconfirmed wave/relay must not export an exact clock",
      );
    else {
      const [h, m] = start.time.split(":").map(Number);
      const offset = {
        "America/Santiago": -3,
        "Asia/Shanghai": 8,
        "Europe/Kyiv": 2,
        "Europe/Brussels": 1,
      }[detail.timeZone];
      const expected = new Date(Date.parse(date + "T00:00:00Z") + ((h - offset) * 60 + m) * 60000)
        .toISOString()
        .replace(".000Z", "Z");
      assert.equal(calendar.startUtc, expected, key + " local-time conversion");
    }
  }
  for (const edition of thirdUrgentAdditions)
    assert.equal(
      seriesList.filter((s) => s.slug === edition.seriesSlug).length,
      1,
      "Canonical fallback event: " + edition.seriesSlug,
    );
  for (const slug of [
    "wa-ukrainian-cross-country-championships-7240272",
    "be-youth-cx-beernem-october",
  ]) {
    assert(isReviewedFixturePlaceholder(slug, "2026-10-25", "Other"));
    assert(!isReviewedFixturePlaceholder(slug, "2026-10-24", "Other"));
  }
  assert.equal(rows.filter((r) => r.distance_code === "Other").length, 2, "Source rows retained");
  assert(fixtureDateIsWithheld("changsha-marathon", "2026-10-25"));
  assert(!fixtureDateIsWithheld("changsha-marathon", "2026-11-15"));
  for (const [key, detail] of Object.entries(details)) {
    const [slug, event_date] = key.split("|");
    const original = {
      event: { slug, city: "Old city", description: "Old date" },
      upcoming: [{ event_date, distance_code: Object.keys(detail.starts)[0], status: "Open" }],
      past: [],
    };
    const page = reviewedRacePage(original);
    assert.equal(page.event.city, detail.place.city);
    assert.equal(page.event.description, detail.summary);
    assert.deepEqual(page.distances, Object.keys(detail.starts));
    assert.equal(original.event.city, "Old city");
    assert.equal(
      reviewedRacePage({
        ...original,
        upcoming: [{ ...original.upcoming[0], event_date: "2027-10-25" }],
      }).event.city,
      "Old city",
    );
  }
  const mauleEntry = reviewedRacePage({
    event: { slug: "maule-corre" },
    distances: ["Other"],
    upcoming: ["2026-10-25", "2027-10-25"].map((event_date) => ({
      event_date,
      distance_code: "5K",
      status: "Closed",
      entry_options: [
        { entry_type: "official", status: "open" },
        { entry_type: "charity", status: "open" },
      ],
    })),
  });
  assert.equal(mauleEntry.upcoming[0].entry_options[0].status, "closed");
  assert.equal(mauleEntry.upcoming[0].entry_options[1].status, "open");
  assert.equal(mauleEntry.upcoming[1].entry_options[0].status, "open");
  const audit = await sql.query("select operation from catalogue_change_log where revision_id=$1", [
    published.revisionId,
  ]);
  assert.equal(audit.length, 15);
  assert.equal(audit.filter((a) => a.operation === "insert").length, 11);
  assert((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  console.log(
    "Third urgent pass: 15 audited writes, 13 exact category/first starts, two qualified unknowns; preserved IDs, source rows, edition scope, fallback parity, concurrency guards and local-time conversion.",
  );
} finally {
  await pg.close();
}
