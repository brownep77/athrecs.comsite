import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
import { publishCountyTbcReview, reviewedCountyBatches } from "./lib/county-tbc-publication.mjs";
import { checkedFixtureStart, checkedFixtureStartLabel } from "../src/data/fixture-details.ts";
import { createServer } from "vite";

const read = async (path) => JSON.parse(await readFile(path));
const data = await read("src/data/county-expansion-deep-2026-10-21.json");
const baseline = await read("scripts/lib/county-expansion-deep-baseline.json");
const review = await read("src/data/county-deep-recheck-2026-10-21.json");
const before = await read("scripts/lib/county-deep-recheck-baseline.json");
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
const publishing = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
const { queryRacePlaceRows } = await vite.ssrLoadModule("/src/lib/athrecs/race-places.server.ts");
const { readSportFixtures } = await vite.ssrLoadModule("/src/lib/athrecs/sport-fixtures.server.ts");
const options = {
  sourcePrefix: "athrecs:county-expansion-deep:2026-10-21",
  expectedEvents: 13,
  expectedEditions: 21,
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
  ])
    for (const record of records) {
      const fields = Object.keys(record);
      await sql.query(
        `insert into ${table}(${fields.join(",")}) values(${fields.map((_, i) => `$${i + 1}`).join(",")})`,
        fields.map((field) => record[field]),
      );
    }
  await sql.query(
    `insert into edition_entry_options(edition_id,provider_code,provider_name,entry_url,entry_type,status,price_amount,price_currency,is_verified,is_primary) values($1,'review-control','Entry preservation control','https://entry.example.org/existing','official','open',42,'GBP',true,true)`,
    [before.editions[0].id],
  );
  const entryBefore = await sql.query("select * from edition_entry_options order by id");
  const editionBefore = await sql.query("select * from editions order by id");
  const first = reviewedCountyBatches(review, before)[0].expected[0];
  await sql.query("update editions set start_time='23:59' where id=$1", [first.id]);
  await assert.rejects(publishCountyTbcReview(sql, publishing, review, before), /baseline changed/);
  await sql.query("update editions set start_time=$1 where id=$2", [first.start_time, first.id]);
  const additions = await publishCountyExpansion(sql, publishing, data, baseline, options);
  assert.equal(additions.length, 1);
  assert.deepEqual(
    await sql.query("select * from editions where id=any($1::int[]) order by id", [
      before.editions.map((r) => r.id),
    ]),
    editionBefore,
  );
  const result = await publishCountyTbcReview(sql, publishing, review, before);
  assert.equal(result.length, 5);
  assert.equal(
    (await sql.query("select count(*)::int n from events"))[0].n,
    before.events.length + 5,
  );
  assert.equal(
    (await sql.query("select count(*)::int n from editions"))[0].n,
    before.editions.length + 21,
  );
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
    const changed = intended.find((e) => `${e.eventSlug}|${e.date}|${e.distance}` === key);
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
    const row = rows
      .find((r) => r.slug === ed.eventSlug)
      ?.editions.find((r) => r.date === ed.date && r.distance === ed.distance);
    assert(row, `Missing public listing ${ed.eventSlug}/${ed.date}/${ed.distance}`);
    assert.equal(row.startTime, ed.startTime ?? null);
    assert.equal(row.sourceUrl, ed.source);
    const label = checkedFixtureStartLabel(ed.eventSlug, ed.date, ed.distance);
    assert.equal(row.startLabel, label);
  }
  const key = "marlborough-kids-fun-triathlon";
  assert.equal(
    checkedFixtureStart(key, "2027-07-10", "Tin", "23:59"),
    null,
    "An event window is not a personal start",
  );
  assert.match(checkedFixtureStartLabel(key, "2027-07-10", "Tin"), /11:00–17:00/);
  assert.equal(checkedFixtureStartLabel(key, "2028-07-10", "Tin"), null, "Do not copy dates");
  assert.equal(
    checkedFixtureStart("woodhall-spa-triathlon", "2027-09-19", "Sprint", null),
    "07:30",
  );
  assert.match(
    checkedFixtureStartLabel("moors-valley-festive-trail-runs", "2026-12-06", "2K"),
    /conflict/,
  );
  assert.equal(
    checkedFixtureStart("moors-valley-festive-trail-runs", "2026-12-06", "2K", "10:00"),
    null,
  );
  const sport = await readSportFixtures(
    sql,
    { sports: ["Triathlon"], surfaces: null, q: "Marlborough" },
    "2026-10-21",
  );
  assert.equal(sport.fixtures.length, 1);
  for (const start of sport.fixtures[0].starts) {
    assert.equal(start.time, null);
    assert.match(start.label, /11:00–17:00/);
    assert.equal(start.sourceUrl, "https://charitytriathlon.org/marlborough-kids-triathlon/");
  }
  assert(
    (await publishCountyExpansion(sql, publishing, data, baseline, options)).every(
      (r) => r.alreadyPublished,
    ),
  );
  assert(
    (await publishCountyTbcReview(sql, publishing, review, before)).every(
      (r) => r.alreadyPublished,
    ),
  );
  const altered = structuredClone(review);
  altered.details[Object.keys(altered.details)[0]].starts.Sprint.editionNote += " changed";
  await assert.rejects(publishCountyTbcReview(sql, publishing, altered, before), /payload changed/);
  const changes = await sql.query(
    "select entity_type,operation,count(*)::int n from catalogue_change_log group by entity_type,operation",
  );
  assert.equal(changes.find((r) => r.entity_type === "edition" && r.operation === "insert").n, 21);
  assert.equal(changes.find((r) => r.entity_type === "edition" && r.operation === "update").n, 126);
  console.log(
    "Passed: 21 additions, 126 edition reviews across 43 programmes, original entries and unrelated editions preserved, baseline conflict guard, audit, repeat safety, published windows separate from personal clocks, and county/sport labels with specific sources.",
  );
} finally {
  await pg.close();
  await vite.close();
}
