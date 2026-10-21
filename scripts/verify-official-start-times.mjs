import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCheckedFixtures } from "./lib/checked-fixture-publication.mjs";
import { START_TIME_REVIEW } from "./lib/official-start-time-review.mjs";
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
    publishCheckedFixtures(sql, publishing, FIXTURE_DETAILS, START_TIME_REVIEW),
    /Reviewed baseline changed/,
  );
  assert.equal((await sql.query("select count(*)::int n from catalogue_revisions"))[0].n, 0);
  await sql.query("update editions set start_time=null where id=71609696");
  const result = await publishCheckedFixtures(sql, publishing, FIXTURE_DETAILS, START_TIME_REVIEW);
  assert(result.revisionId);
  const rows = await sql.query("select * from editions order by id");
  assert.equal(rows.length, 4, "no new editions");
  for (const [key, before] of Object.entries(START_TIME_REVIEW.baseline)) {
    const [slug, date, distance] = key.split("|");
    const row = rows.find((r) => r.id === before.id);
    const detail = FIXTURE_DETAILS[`${slug}|${date}`];
    assert.equal(row.start_time, detail.starts[distance].time);
    assert.equal(row.source_url, detail.sourceUrl);
    assert.equal(row.distance_km, before.distance_km);
    assert.equal(row.status, before.status);
    assert(row.notes.startsWith(before.notes));
    assert(row.notes.includes(detail.starts[distance].note));
    assert.equal(checkedFixtureStart(slug, date, distance, "23:59"), row.start_time);
    assert.equal(checkedFixtureStart(slug, date.replace("2027", "2028"), distance, null), null);
  }
  const audit = await sql.query(
    "select before_json,after_json from catalogue_change_log where revision_id=$1",
    [result.revisionId],
  );
  assert.equal(audit.length, 4);
  assert(audit.every((change) => change.before_json.record.start_time === null));
  assert(
    (await publishCheckedFixtures(sql, publishing, FIXTURE_DETAILS, START_TIME_REVIEW))
      .alreadyPublished,
  );
  console.log(
    "Four organiser starts published with original evidence, baseline guards and repeat safety in isolated Postgres.",
  );
} finally {
  await pg.close();
}
