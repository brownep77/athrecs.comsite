import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { START_TIME_REVIEW } from "./lib/official-start-time-review.mjs";
import { OFFICIAL_START_TIME_DETAILS } from "./lib/official-start-time-details.mjs";
import { NORFOLK_CLARIFICATION_REVIEW } from "./lib/norfolk-start-clarification-review.mjs";
const { FIXTURE_DETAILS, checkedFixtureStart } = await import("../src/data/fixture-details.ts");
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");

// Rehearse the exact four public fixture corrections in disposable Postgres.
const { pg, sql } = await bulkFixture();
try {
  for (const [key, row] of Object.entries(START_TIME_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    await sql.query(
      "insert into events(id,slug,name,sport,country) values($1,$2,$2,'Running','England') on conflict do nothing",
      [row.event_id, slug],
    );
    await sql.query(
      "insert into editions(id,event_id,event_date,distance_code,distance_km,status,start_time,source_url,notes) values($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        row.id,
        row.event_id,
        date,
        distance,
        row.distance_km,
        row.status,
        row.start_time,
        row.source_url,
        row.notes,
      ],
    );
  }
  await sql.query("update editions set start_time='11:00' where id=71609696");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=71609696");
  const result = await publishCheckedFixtures(
    sql,
    publishing,
    OFFICIAL_START_TIME_DETAILS,
    START_TIME_REVIEW,
  );
  assert(result.revisionId);
  const rows = await sql.query("select * from editions order by id");
  assert.equal(rows.length, 4, "no new editions");
  for (const [key, before] of Object.entries(START_TIME_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    const row = rows.find((r) => r.id === before.id);
    const detail = OFFICIAL_START_TIME_DETAILS[`${slug}|${date}`];
    assert.equal(row.start_time, detail.starts[distance].time);
    assert.equal(row.source_url, detail.sourceUrl);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(row.status, before.status);
    assert(row.notes.startsWith(before.notes));
    assert(row.notes.includes(detail.starts[distance].note));
    assert.equal(checkedFixtureStart(slug, date.replace("2027", "2028"), distance, null), null);
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [result.revisionId],
  );
  assert.equal(audit.length, 4);
  assert(audit.every((change) => change.before_json.record.start_time === null));
  assert(
    (await publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW))
      .alreadyPublished,
  );
  // Rehearse the follow-up against the exact state produced by the previous batch.
  await sql.query("update editions set start_time='10:45' where id=109456641");
  await assert.rejects(
    publishCheckedFixtures(sql, publishing, FIXTURE_DETAILS, NORFOLK_CLARIFICATION_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 1);
  await sql.query("update editions set start_time='10:15' where id=109456641");
  const followup = await publishCheckedFixtures(
    sql,
    publishing,
    FIXTURE_DETAILS,
    NORFOLK_CLARIFICATION_REVIEW,
  );
  const updated = await sql.query("select * from editions order by id");
  assert.equal(updated.length, 4);
  for (const [key, before] of Object.entries(NORFOLK_CLARIFICATION_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    const row = updated.find((r) => r.id === before.id);
    const detail = FIXTURE_DETAILS[`${slug}|${date}`];
    assert.equal(row.start_time, detail.starts[distance].time);
    assert.equal(checkedFixtureStart(slug, date, distance, "23:59"), row.start_time);
    assert.equal(row.source_url, detail.sourceUrl);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(row.status, before.status);
    assert(row.notes.startsWith(before.notes));
    assert(row.notes.includes(detail.starts[distance].note));
    assert.equal(
      checkedFixtureStart(slug, date.replace("2027", "2028"), distance, "08:00"),
      "08:00",
    );
  }
  assert(updated.filter((row) => row.event_id === 3059189).every((row) => row.start_time === null));
  assert.equal(updated.find((row) => row.id === 71609696).start_time, "09:00");
  assert.equal(updated.find((row) => row.id === 71609697).start_time, "10:30");
  assert(
    FIXTURE_DETAILS["reepham-cross-country|2027-01-31"].starts["5K"].note.includes(
      "juniors start 10:00",
    ),
  );
  const followupAudit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [followup.revisionId],
  );
  assert.equal(followupAudit.length, 4);
  const held = followupAudit.filter((change) => change.before_json.record.event_id === 3059189);
  assert.equal(held.length, 2);
  assert(
    held.every(
      (change) =>
        change.before_json.record.start_time === "10:15" &&
        change.after_json.record.start_time === null,
    ),
  );
  assert(
    (await publishCheckedFixtures(sql, publishing, FIXTURE_DETAILS, NORFOLK_CLARIFICATION_REVIEW))
      .alreadyPublished,
  );
  assert(
    (await publishCheckedFixtures(sql, publishing, OFFICIAL_START_TIME_DETAILS, START_TIME_REVIEW))
      .alreadyPublished,
  );
  assert.equal(
    (await sql.query("select start_time from editions where id=109456641"))[0].start_time,
    null,
  );
  const { withheldFixtureDateKeys } = await import("../src/data/fixture-date-reviews.ts");
  assert.deepEqual(withheldFixtureDateKeys, [
    "gear-10k-kings-lynn|2026-11-08",
    "marriotts-way-10k|2026-11-01",
    "lingwood-duathlon|2027-03-21",
  ]);
  console.log(
    "Norfolk follow-up preserves both audited batches, guards concurrent changes, clears unresolved adult starts, retains junior/Marriott starts and date holds, and is repeat-safe.",
  );
} finally {
  await pg.close();
}
