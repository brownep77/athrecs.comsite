import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { publishCountyExpansion } from "./lib/county-expansion-publication.mjs";
const data = JSON.parse(await readFile("src/data/county-expansion-more-2026-10-21.json"));
const baseline = JSON.parse(await readFile("scripts/lib/county-expansion-more-baseline.json"));
const { COUNTY_EXPANSION_MORE } = await import("./lib/county-expansion-more.mjs");
const publish = (sql, publishing, data, baseline) =>
  publishCountyExpansion(sql, publishing, data, baseline, COUNTY_EXPANSION_MORE);
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
  await assert.rejects(publish(sql, publishing, data, baseline), /baseline changed/);
  await sql.query("update events set county=$1 where id=$2", [
    baseline.events[0].county,
    baseline.events[0].id,
  ]);
  // Simulate a concurrent equivalent-distance listing under another label.
  const collision = data.editions.find(
    (edition) =>
      baseline.events.some((event) => event.slug === edition.eventSlug) &&
      edition.distanceKm !== null,
  );
  const collisionEvent = baseline.events.find((event) => event.slug === collision.eventSlug);
  const [injected] = await sql.query(
    "insert into editions(event_id,event_date,distance_code,distance_km,status) values($1,$2,'Alternate label',$3,'Open') returning id",
    [collisionEvent.id, collision.date, collision.distanceKm],
  );
  await assert.rejects(publish(sql, publishing, data, baseline), /already exists/);
  await sql.query("delete from editions where id=$1", [injected.id]);
  const beforeEditions = await sql.query("select * from editions order by id");
  const published = await publish(sql, publishing, data, baseline);
  assert.equal(published.length, 2);
  assert.equal((await sql.query("select count(*)::int n from events"))[0].n, 68);
  assert.equal(
    (await sql.query("select count(*)::int n from editions"))[0].n,
    baseline.editions.length + 120,
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
  for (const edition of baseline.editions) {
    const event = baseline.events.find((event) => event.id === edition.event_id);
    const date = String(edition.event_date).slice(0, 10);
    const checked = FIXTURE_DETAILS[`${event.slug}|${date}`]?.starts[edition.distance_code];
    if (!checked) continue;
    const live = rows
      .find((row) => row.slug === event.slug)
      ?.editions.find((row) => row.date === date && row.distance === edition.distance_code);
    assert(live, `Existing reviewed distance disappeared: ${event.slug}/${edition.distance_code}`);
    assert.equal(
      live.startTime,
      checked.time,
      "Existing equivalent labels receive the reviewed start",
    );
  }
  assert.equal(
    rows
      .find((row) => row.slug === "outlaw-holkham")
      .editions.filter((edition) => edition.date.startsWith("2027-")).length,
    2,
  );
  assert(
    !rows.some((row) => row.slug === "outlaw-holkham-gravel-sprint"),
    "Keep the existing Holkham identity",
  );
  assert.equal(rows.find((row) => row.slug === "great-north-swim").editions.length, 16);
  assert.equal(checkedFixtureStart("great-north-swim", "2027-06-12", "0.5mi", "14:00"), null);
  assert.equal(checkedFixtureStart("great-north-swim", "2028-06-12", "0.5mi", null), null);
  assert(isReviewedFixturePlaceholder("far-atw-grafham-triathlon", "2027-09-25", "Other"));
  assert(!isReviewedFixturePlaceholder("far-atw-grafham-triathlon", "2028-09-25", "Other"));
  for (const [slug, date, expectedDistances] of [
    ["beyond-ncl", "2027-04-24", ["25K", "55K"]],
    ["the-priory-100k", "2027-05-29", ["100K"]],
  ]) {
    assert.deepEqual(
      rows
        .find((row) => row.slug === slug)
        .editions.filter((edition) => edition.date === date)
        .map((edition) => edition.distance)
        .sort(),
      expectedDistances,
      "Reviewed programme replaces generic Ultra placeholder in public listings",
    );
    assert(!isReviewedFixturePlaceholder(slug, date.replace("2027", "2028"), "Ultra"));
  }
  assert(
    (await publish(sql, publishing, data, baseline)).every((result) => result.alreadyPublished),
  );
  const altered = structuredClone(data);
  altered.events[0].name += " changed";
  await assert.rejects(publish(sql, publishing, altered, baseline), /payload changed/i);
  const changes = await sql.query(
    "select entity_type,operation,count(*)::int n from catalogue_change_log group by entity_type,operation",
  );
  assert.equal(
    changes.find((row) => row.entity_type === "event" && row.operation === "insert").n,
    30,
  );
  assert.equal(
    changes.find((row) => row.entity_type === "event" && row.operation === "update").n,
    38,
  );
  assert.equal(
    changes.find((row) => row.entity_type === "edition" && row.operation === "insert").n,
    120,
  );
  console.log(
    "Further county expansion rehearsed: 30 new events, 38 enriched identities, 120 dated listings (117 distance options and three meets), 24 areas and six sports. Baseline, equivalent-distance collision, existing editions, source, wave, end-date, audit and repeat-safety checks passed.",
  );
} finally {
  await pg.close();
}
