import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
const data = JSON.parse(await readFile("src/data/county-expansion-2026-10-21.json"));
const baseline = JSON.parse(await readFile("scripts/lib/county-expansion-baseline.json"));
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { queryRacePlaceRows } = await import("../src/lib/athrecs/race-places.server.ts");
const { isReviewedFixturePlaceholder, checkedFixtureStart, FIXTURE_DETAILS } =
  await import("../src/data/fixture-details.ts");
const { pg, sql } = await bulkFixture();
try {
  await pg.exec(await readFile("migrations/20261015_event_end_evidence.sql", "utf8"));
  await pg.exec(
    "alter table events add column region text; create table event_groups(event_id int, level text)",
  );
  for (const [table, records] of [
    ["events", baseline.events],
    ["editions", baseline.editions],
    ["event_distances", baseline.distances],
  ]) {
    const columns = new Set(
      (
        await sql.query("select column_name from information_schema.columns where table_name=$1", [
          table,
        ])
      ).map((row) => row.column_name),
    );
    for (const record of records) {
      const fields = Object.keys(record).filter((field) => columns.has(field));
      await sql.query(
        `insert into ${table}(${fields.join(",")}) values(${fields.map((_, i) => `$${i + 1}`).join(",")})`,
        fields.map((field) => record[field]),
      );
    }
  }
  await sql.query("update events set county='Unreviewed change' where id=$1", [
    baseline.events[0].id,
  ]);
  await assert.rejects(publishCountyExpansion(sql, publishing, data, baseline), /baseline changed/);
  await sql.query("update events set county=$1 where id=$2", [
    baseline.events[0].county,
    baseline.events[0].id,
  ]);
  const beforeEditions = await sql.query("select * from editions order by id");
  const published = await publishCountyExpansion(sql, publishing, data, baseline);
  assert.equal(published.length, 2);
  assert.equal((await sql.query("select count(*)::int n from events"))[0].n, 76);
  assert.equal(
    (await sql.query("select count(*)::int n from editions"))[0].n,
    baseline.editions.length + 167,
  );
  assert.deepEqual(
    await sql.query("select * from editions where id=any($1::int[]) order by id", [
      baseline.editions.map((row) => row.id),
    ]),
    beforeEditions,
    "Existing editions and their evidence survive unchanged",
  );
  const rows = await queryRacePlaceRows(sql, "2026-10-21");
  for (const event of data.events) {
    const row = rows.find((row) => row.slug === event.slug);
    assert(row, `Missing county listing: ${event.slug}`);
    assert.equal(row.county, event.county);
    for (const edition of data.editions.filter((edition) => edition.eventSlug === event.slug)) {
      const live = row.editions.find(
        (row) => row.date === edition.date && row.distance === edition.distance,
      );
      assert(live, `Missing distance: ${event.slug} ${edition.distance}`);
      assert.equal(live.checkedAt, "2026-10-21");
      const current = FIXTURE_DETAILS[`${edition.eventSlug}|${edition.date}`];
      const start = current?.starts[edition.distance];
      assert.equal(live.startTime, start ? start.time : (edition.startTime ?? null));
      assert.equal(live.sourceUrl, start?.sourceUrl ?? current?.sourceUrl ?? edition.source);
      if (edition.endDate) assert.equal(live.endDate, edition.endDate);
    }
    if (event.sport === "Parkrun") {
      assert.equal(row.editions.length, 0, "No extrapolated parkrun dates");
      assert(
        row.distanceCodes.includes(event.distances[0]),
        "Undated venue retains distance colour/filter",
      );
    }
  }
  assert(
    !rows
      .find((row) => row.slug === "far-stratford-triathlon")
      .editions.some((row) => row.date === "2027-04-18" && row.distance === "Other"),
  );
  assert(!isReviewedFixturePlaceholder("far-stratford-triathlon", "2028-04-18", "Other"));
  assert.equal(checkedFixtureStart("suffolk-spring-classic", "2028-04-04", "118K", null), null);
  assert(
    (await publishCountyExpansion(sql, publishing, data, baseline)).every(
      (result) => result.alreadyPublished,
    ),
  );
  const altered = structuredClone(data);
  altered.events[0].name += " changed";
  await assert.rejects(
    publishCountyExpansion(sql, publishing, altered, baseline),
    /payload changed/i,
  );
  const changes = await sql.query(
    "select entity_type,operation,count(*)::int n from catalogue_change_log group by entity_type,operation",
  );
  assert.equal(
    changes.find((row) => row.entity_type === "event" && row.operation === "insert").n,
    61,
  );
  assert.equal(
    changes.find((row) => row.entity_type === "event" && row.operation === "update").n,
    15,
  );
  assert.equal(
    changes.find((row) => row.entity_type === "edition" && row.operation === "insert").n,
    167,
  );
  console.log(
    "County expansion rehearsed: 61 new events, 15 enriched identities, 167 dated distance options, 39 areas and all seven sports. Baseline, source, wave, undated parkrun, audit and repeat-safety checks passed.",
  );
} finally {
  await pg.close();
}
