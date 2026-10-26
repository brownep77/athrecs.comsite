import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { NOVEMBER_NIGHTMARE_PROGRAMME_REVIEW as review } from "./lib/november-nightmare-programme-2026-10-26-review.mjs";
import details from "../src/data/duplicate-programme-starts-fourth-2026-10-26.json" with { type: "json" };
import { reviewConfirmedDistances } from "../src/data/confirmed-distance-editions.ts";
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const slug = "november-nightmare";
const date = "2026-11-01";
const key = `${slug}|${date}`;
const { pg, sql } = await bulkFixture();
try {
  await sql.query(
    "insert into events(id,slug,name,sport,country) values(3060938,$1,'Nightmare programme','Running','England'),(4375834,'november-nightmare-8-marathons-in-8-days','Original duplicate','Running','England')",
    [slug],
  );
  const before = review.baseline[`${key}|Marathon`];
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,$3,'Marathon',$4,$5,$6,$7,$8)",
    [
      before.id,
      before.event_id,
      date,
      before.distance_km,
      before.status,
      before.start_time,
      before.source_url,
      before.notes,
    ],
  );
  for (const [id, distance, km] of [
    [108804444, "Half", 21.0975],
    [108804445, "Marathon", 42.195],
    [108804446, "10K", 10],
  ]) {
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,notes) values($1,4375834,$2,$3,$4,'TBC','Original evidence')",
      [id, date, distance, km],
    );
  }
  const originals = await sql.query("select * from editions where event_id=4375834 order by id");
  await sql.query("update editions set start_time='10:00' where id=71613833");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, review),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time='09:00' where id=71613833");
  const published = await publishCheckedFixtures(sql, publishing, details, review);
  assert.deepEqual(
    await sql.query("select * from editions where event_id=4375834 order by id"),
    originals,
    "Original duplicate records survive unchanged",
  );
  const retained = await sql.query(
    "select * from editions where event_id=3060938 order by distance_km",
  );
  assert.deepEqual(
    retained.map((r) => r.distance_code),
    ["8mi", "16mi", "Marathon"],
  );
  assert.deepEqual(
    retained.map((r) => r.distance_km),
    [12.874752, 25.749504, 42.2],
  );
  assert.ok(retained.every((r) => r.start_time === "09:00" && r.source_url === review.sourceUrl));
  assert.equal(retained[2].id, 71613833, "Marathon identity survives");
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [published.revisionId],
  );
  assert.equal(audit.length, 3);
  assert.ok((await publishCheckedFixtures(sql, publishing, details, review)).alreadyPublished);
  assert.equal((await sql.query("select count(*)::int n from editions"))[0].n, 6);
  const seeded = reviewConfirmedDistances(
    [{ seriesSlug: slug, date, distance: "Marathon", distanceKm: 42.2, status: "Open" }],
    new Set([slug]),
  );
  assert.deepEqual(seeded.map((e) => e.distance).sort(), ["16mi", "8mi", "Marathon"]);
  assert.ok(seeded.every((e) => e.startTime === "09:00"));
  console.log(
    "November Nightmare passed: concurrent-change guard, exact mile additions, unchanged original records, marathon identity, audit, replay safety and seed consistency.",
  );
} finally {
  await pg.close();
}
