import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { ACCRA_START_REVIEW } from "./lib/accra-start-2026-10-25-review.mjs";
import details from "../src/data/accra-start-2026-10-25.json" with { type: "json" };
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { checkedFixtureStart, FIXTURE_DETAILS } = await import("../src/data/fixture-details.ts");
const { pg, sql } = await bulkFixture();
try {
  const before = Object.values(ACCRA_START_REVIEW.baseline)[0];
  await sql.query(
    "insert into events(id,slug,name,sport,country) values($1,'accra-international-marathon','Accra International Marathon','Running','Ghana')",
    [before.event_id],
  );
  await sql.query(
    "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,'2026-10-25','Marathon',$3,$4,$5,$6,$7)",
    [
      before.id,
      before.event_id,
      before.distance_km,
      before.status,
      before.start_time,
      before.source_url,
      before.notes,
    ],
  );
  await sql.query("update editions set start_time='06:00' where id=$1", [before.id]);
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, details, ACCRA_START_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=$1", [before.id]);
  const result = await publishCheckedFixtures(sql, publishing, details, ACCRA_START_REVIEW);
  const rows = await sql.query("select * from editions");
  assert.equal(rows.length, 1, "no additional distance or year invented");
  assert.equal(rows[0].id, before.id);
  assert.equal(rows[0].start_time, "05:30");
  assert.equal(rows[0].status, "Closed");
  assert.equal(rows[0].source_url, "https://aimghana.com/schedules.php");
  assert(rows[0].notes.startsWith(before.notes));
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [result.revisionId],
  );
  assert.equal(audit.length, 1);
  assert.equal(audit[0].before_json.record.start_time, null);
  assert.equal(audit[0].after_json.record.start_time, "05:30");
  assert(
    (await publishCheckedFixtures(sql, publishing, details, ACCRA_START_REVIEW)).alreadyPublished,
  );
  assert.equal(
    checkedFixtureStart("accra-international-marathon", "2026-10-25", "Marathon", null),
    "05:30",
  );
  assert.equal(
    checkedFixtureStart("accra-international-marathon", "2026-10-25", "Half", null),
    null,
  );
  assert.equal(
    checkedFixtureStart("accra-international-marathon", "2027-10-25", "Marathon", null),
    null,
  );
  assert.equal(FIXTURE_DETAILS["accra-international-marathon|2026-10-25"].timeZone, "Africa/Accra");
  console.log(
    "Accra start passed: guarded publication, before/after audit, replay safety and exact edition/distance scope.",
  );
} finally {
  await pg.close();
}
