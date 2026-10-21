import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
import { publishCountyTbcReview, reviewedCountyBatches } from "./lib/county-tbc-publication.mjs";
const read = async (path) => JSON.parse(await readFile(path));
const data = await read("src/data/county-expansion-checked-2026-10-21.json");
const baseline = await read("scripts/lib/county-expansion-checked-baseline.json");
const review = await read("src/data/county-tbc-review-2026-10-21.json");
const before = await read("scripts/lib/county-tbc-review-baseline.json");
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { queryRacePlaceRows } = await import("../src/lib/athrecs/race-places.server.ts");
const { checkedFixtureStart } = await import("../src/data/fixture-details.ts");
const options = {
  sourcePrefix: "athrecs:county-expansion-checked:2026-10-21",
  expectedEvents: 14,
  expectedEditions: 66,
};
const { pg, sql } = await bulkFixture();
try {
  await pg.exec(await readFile("migrations/20261015_event_end_evidence.sql", "utf8"));
  await pg.exec(
    "alter table events add column region text; create table event_groups(event_id int, level text)",
  );
  for (const [table, records] of [
    ["events", before.events],
    ["editions", before.editions],
    ["event_distances", before.distances],
  ]) {
    for (const record of records) {
      const fields = Object.keys(record);
      await sql.query(
        `insert into ${table}(${fields.join(",")}) values(${fields.map((_, index) => `$${index + 1}`).join(",")})`,
        fields.map((field) => record[field]),
      );
    }
  }
  // A nontrivial existing entry option must remain intact through both publishers.
  await sql.query(
    `insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,entry_type,status,price_amount,price_currency,is_verified,is_primary)
    values($1,'review-control','Entry preservation control','https://entry.example.org/existing','official','open',42,'GBP',true,true)`,
    [before.editions[0].id],
  );
  const entryBefore = await sql.query("select * from edition_entry_options order by id");
  const editionBefore = await sql.query("select * from editions order by id");
  // Concurrent source/time changes must stop this exact reviewed batch.
  const first = reviewedCountyBatches(review, before)[0].expected[0];
  await sql.query("update editions set start_time='23:59' where id=$1", [first.id]);
  await assert.rejects(publishCountyTbcReview(sql, publishing, review, before), /baseline changed/);
  await sql.query("update editions set start_time=$1 where id=$2", [first.start_time, first.id]);
  const additions = await publishCountyExpansion(sql, publishing, data, baseline, options);
  assert.equal(additions.length, 1);
  assert.deepEqual(
    await sql.query("select * from editions where id=any($1::int[]) order by id", [
      before.editions.map((row) => row.id),
    ]),
    editionBefore,
  );
  const result = await publishCountyTbcReview(sql, publishing, review, before);
  assert.equal(result.length, 5);
  assert.equal((await sql.query("select count(*)::int n from events"))[0].n, 73);
  assert.equal((await sql.query("select count(*)::int n from editions"))[0].n, 242);
  assert.deepEqual(
    await sql.query(
      "select * from edition_entry_options where provider_code='review-control' order by id",
    ),
    entryBefore,
  );
  const intended = reviewedCountyBatches(review, before).flatMap((batch) => batch.editions);
  const events = new Map(before.events.map((event) => [event.id, event]));
  const updated = await sql.query("select * from editions order by id");
  for (const original of editionBefore) {
    const key = `${events.get(original.event_id).slug}|${original.event_date}|${original.distance_code}`;
    const changed = intended.find(
      (edition) => `${edition.eventSlug}|${edition.date}|${edition.distance}` === key,
    );
    const after = updated.find((row) => row.id === original.id);
    const expected = changed
      ? {
          ...original,
          start_time: changed.startTime ?? null,
          source_url: changed.source,
          notes: changed.notes,
        }
      : original;
    assert.deepEqual(after, expected, `Unexpected edition mutation: ${key}`);
  }
  const rows = await queryRacePlaceRows(sql, "2026-10-21");
  for (const ed of [...data.editions, ...intended]) {
    const event = rows.find((row) => row.slug === ed.eventSlug);
    const live = event?.editions.find(
      (row) => row.date === ed.date && row.distance === ed.distance,
    );
    assert(live, `Missing public listing: ${ed.eventSlug}/${ed.date}/${ed.distance}`);
    assert.equal(live.startTime, ed.startTime ?? null);
    assert.equal(live.sourceUrl, ed.source);
    assert.equal(live.checkedAt, "2026-10-21");
    if (ed.entryUrl) assert.equal(live.entryUrl, ed.entryUrl);
  }
  assert.equal(rows.find((row) => row.slug === "race-for-life-ipswich").county, "Suffolk");
  assert.equal(
    checkedFixtureStart("high-lodge-wild-trail-runs", "2027-04-11", "5K", null),
    "09:30",
  );
  for (const [slug, date, code, time] of [
    ["glamis-castle-festive-trail-runs", "2026-12-06", "1mi", "09:15"],
    ["sherwood-pines-festive-trail-runs", "2026-12-13", "5K", "09:35"],
    ["wild-deer-harewood-house-trail-runs", "2027-01-09", "10K", "10:00"],
    ["wild-deer-harewood-house-trail-runs", "2027-01-09", "Half", "10:30"],
    ["wentworth-castle-trail-runs", "2027-06-16", "5K", "19:10"],
    ["moors-valley-festive-trail-runs", "2026-12-06", "2K", null],
    ["swim-derwent", "2027-07-04", "400m", null],
  ])
    assert.equal(checkedFixtureStart(slug, date, code, "23:59"), time);
  assert.equal(checkedFixtureStart("high-lodge-wild-trail-runs", "2028-04-11", "5K", null), null);
  assert.equal(checkedFixtureStart("great-north-swim", "2027-06-12", "0.5mi", "14:00"), null);
  assert.equal(
    checkedFixtureStart(
      "swim-england-national-winter-championships",
      "2026-12-10",
      "Pool meet",
      null,
    ),
    "09:00",
  );
  assert(
    (await publishCountyExpansion(sql, publishing, data, baseline, options)).every(
      (result) => result.alreadyPublished,
    ),
  );
  assert(
    (await publishCountyTbcReview(sql, publishing, review, before)).every(
      (result) => result.alreadyPublished,
    ),
  );
  const altered = structuredClone(review);
  altered.details[Object.keys(altered.details)[0]].starts.Sprint.note += " changed";
  await assert.rejects(publishCountyTbcReview(sql, publishing, altered, before), /payload changed/);
  const changes = await sql.query(
    "select entity_type,operation,count(*)::int n from catalogue_change_log group by entity_type,operation",
  );
  assert.equal(
    changes.find((row) => row.entity_type === "edition" && row.operation === "insert").n,
    66,
  );
  assert.equal(
    changes.find((row) => row.entity_type === "edition" && row.operation === "update").n,
    139,
  );
  console.log(
    "Verified: 13 new events, one enriched identity, 66 new options, 139 existing edition reviews. Entry routes, unrelated columns/editions, multi-day evidence, precise source links, county display, conflict TBCs, concurrent-change guard, audit and repeat safety passed.",
  );
} finally {
  await pg.close();
}
