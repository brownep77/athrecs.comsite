import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { FIFTH_DUPLICATE_PROGRAMMES_REVIEW as review } from "./lib/duplicate-programmes-fifth-2026-10-26-review.mjs";
import details from "../src/data/duplicate-programme-starts-fifth-2026-10-26.json" with { type: "json" };
import reviews from "../src/data/fixture-duplicate-reviews-fifth-2026-10-26.json" with { type: "json" };
import { reviewConfirmedDistances } from "../src/data/confirmed-distance-editions.ts";
import { isReviewedFixturePlaceholder } from "../src/data/fixture-details.ts";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { pg, sql } = await bulkFixture();
try {
  const events = new Map();
  for (const r of reviews) {
    events.set(r.canonicalEventId, r.canonicalSlug);
    events.set(r.duplicateEventId, r.duplicateSlug);
  }
  for (const [id, slug] of events)
    await sql.query(
      "insert into events(id,slug,name,sport,country) values($1,$2,$2,'Running','England')",
      [id, slug],
    );
  // Synthetic source rows include the zero-distance record, an existing 10K,
  // an independent historic edition and every reviewed duplicate event.
  let id = 100;
  for (const r of reviews)
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,notes) values($1,$2,$3,$4,$5,'Open','12:34','Original evidence')",
      [
        ++id,
        r.duplicateEventId,
        r.date,
        r.duplicateDistances[0],
        r.duplicateDistances[0] === "Other" ? 0 : 21.0975,
      ],
    );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,notes) values(201,3060603,'2026-10-24','Other',0,'Open','17:30','Original generic source'),(202,3061178,'2026-10-11','10K',10,'Open','09:15','Original 10K'),(203,3061178,'2025-10-12','Half',21.0975,'Finished','09:00','Older independent edition')",
  );
  const originals = await sql.query("select * from editions order by id");
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status) values(204,3061178,'2026-10-11','Half',21.0975,'Open')",
  );
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  assert.equal(
    (await sql.query("select count(*)::int n from editions where event_id=3060603"))[0].n,
    1,
    "Failed batch must not partially add Illuminator options",
  );
  await sql.query("delete from editions where id=204");
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  assert.deepEqual(
    await sql.query("select * from editions where id between 101 and 203 order by id"),
    originals,
    "Every original remains byte-for-byte intact",
  );
  for (const [key, expected] of Object.entries(review.additions)) {
    const [slug, date, code] = key.split("|");
    const rows = await sql.query(
      "select * from editions where event_id=$1 and event_date=$2 and distance_code=$3",
      [expected.eventId, date, code],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0].distance_km, expected.distanceKm);
    assert.equal(rows[0].start_time, details[`${slug}|${date}`].starts[code].time);
    assert.equal(rows[0].source_url, details[`${slug}|${date}`].sourceUrl);
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [published.revisionId],
  );
  assert.equal(audit.length, 4);
  assert.ok(
    audit.every((a) => a.before_json === null),
    "Only additions are audited",
  );
  assert.ok((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.equal(
    (await sql.query("select count(*)::int n from editions"))[0].n,
    originals.length + 4,
  );
  const seeds = reviewConfirmedDistances(
    [
      {
        seriesSlug: "illuminator-run-2017",
        date: "2026-10-24",
        distance: "Other",
        distanceKm: 0,
        status: "Open",
      },
      {
        seriesSlug: "run-leicester-half-marathon",
        date: "2026-10-11",
        distance: "10K",
        distanceKm: 10,
        status: "Open",
        startTime: "09:15",
      },
      {
        seriesSlug: "run-leicester-half-marathon",
        date: "2025-10-12",
        distance: "Half",
        distanceKm: 21.0975,
        status: "Finished",
      },
    ],
    new Set(["illuminator-run-2017", "run-leicester-half-marathon"]),
  );
  assert.deepEqual(
    seeds
      .filter((e) => e.seriesSlug === "illuminator-run-2017")
      .map((e) => e.distance)
      .sort(),
    ["15K", "15mi", "8K"],
  );
  assert.deepEqual(
    seeds
      .filter((e) => e.seriesSlug === "run-leicester-half-marathon" && e.date === "2026-10-11")
      .map((e) => e.distance)
      .sort(),
    ["10K", "Half"],
  );
  assert.ok(seeds.some((e) => e.date === "2025-10-12"));
  assert.equal(isReviewedFixturePlaceholder("illuminator-run-2017", "2026-10-24", "Other"), true);
  assert.equal(isReviewedFixturePlaceholder("illuminator-run-2017", "2027-10-24", "Other"), false);
  console.log(
    "Fifth programmes passed: concurrency guard, atomic failure, four exact additions, unchanged originals and history, audit, replay and seed consistency.",
  );
} finally {
  await pg.close();
}
