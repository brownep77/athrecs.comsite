import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { HADLEIGH_PROGRAMME_REVIEW as review } from "./lib/hadleigh-programme-2026-10-26-review.mjs";
import details from "../src/data/duplicate-programme-starts-third-2026-10-26.json" with { type: "json" };
import { reviewConfirmedDistances } from "../src/data/confirmed-distance-editions.ts";
import { isReviewedFixturePlaceholder } from "../src/data/fixture-details.ts";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const slug = "ea-runevents-hadleigh-10-5-2-hadleigh";
const date = "2026-11-22";
const key = `${slug}|${date}`;
const { pg, sql } = await bulkFixture();
try {
  await sql.query(
    "insert into events(id,slug,name,sport,country) values(3148026,$1,'Hadleigh programme','Running','England')",
    [slug],
  );
  for (const [editionKey, before] of Object.entries(review.baseline)) {
    if (!before) continue;
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        before.id,
        before.event_id,
        date,
        editionKey.split("|")[2],
        before.distance_km,
        before.status,
        before.start_time,
        before.source_url,
        before.notes,
      ],
    );
  }
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,notes) values(74248496,3148026,$1,'Fun Run',0,'Open','10:00','Original junior evidence')",
    [date],
  );
  const placeholderBefore = (await sql.query("select * from editions where id=74248496"))[0];
  await sql.query("update editions set start_time='11:15' where id=74248494");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time='10:00' where id=74248494");
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  const rows = await sql.query("select * from editions order by id");
  assert.equal(rows.length, 4, "Only the confirmed junior 2K is added");
  assert.deepEqual(
    rows.find((r) => r.id === 74248496),
    placeholderBefore,
    "Original placeholder is untouched",
  );
  for (const [distance, time] of [
    ["2K", "10:00"],
    ["10mi", "11:00"],
    ["5mi", "11:05"],
  ]) {
    const row = rows.find((r) => r.distance_code === distance);
    assert.equal(row.start_time, time);
    assert.equal(row.source_url, review.sourceUrl);
    const before = review.baseline[`${key}|${distance}`];
    if (before) {
      assert.equal(row.id, before.id, "Existing adult edition identity survives");
      assert.ok(row.notes.startsWith(before.notes));
    } else assert.equal(row.distance_km, 2);
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [published.revisionId],
  );
  assert.equal(audit.length, 3);
  assert.equal(audit.filter((a) => a.before_json?.record?.start_time === "10:00").length, 2);
  assert.ok((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.equal((await sql.query("select count(*)::int n from editions"))[0].n, 4);
  const seeded = reviewConfirmedDistances(
    [{ seriesSlug: slug, date, distance: "Fun Run", distanceKm: 0, status: "Open" }],
    new Set([slug]),
  );
  assert.deepEqual(seeded.map((e) => e.distance).sort(), ["10mi", "2K", "5mi"]);
  assert.equal(seeded.find((e) => e.distance === "5mi").startTime, "11:05");
  assert.ok(isReviewedFixturePlaceholder(slug, date, "Fun Run"));
  assert.equal(isReviewedFixturePlaceholder(slug, "2027-11-22", "Fun Run"), false);
  console.log(
    "Hadleigh passed: concurrent-change guard, additive junior race, unchanged raw placeholder, adult IDs, before/after audit, replay safety and seed consistency.",
  );
} finally {
  await pg.close();
}
