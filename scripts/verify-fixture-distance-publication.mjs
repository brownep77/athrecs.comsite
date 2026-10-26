import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";
import { hasConfirmedFixtureDistance } from "../src/lib/athrecs/fixture-distance-policy.ts";
import { unconfirmedFixtureEditionIds } from "../src/lib/athrecs/fixture-distance-policy.server.ts";
import corrections from "../src/data/confirmed-distance-editions-2026-10-26.json" with { type: "json" };
const { editions, seriesList } = await import("../src/data/catalogue.ts");
const publishing = await import("../src/lib/athrecs/catalogue-publishing.server.ts");
const { applyImportBundle } = await import("../src/lib/athrecs/import.server.ts");

for (const label of [
  "",
  "Other",
  "Unknown",
  "Ultra",
  "Cross Country",
  "Fun Run",
  "TBC",
  "Unspecified",
  "0K",
  "0H",
  "10K tomorrow",
])
  assert.equal(hasConfirmedFixtureDistance("Running", label, 0), false, label);
for (const label of [
  "5K",
  "5 km",
  "5mi",
  "1500m",
  "Half",
  "Half Marathon",
  "Marathon",
  "24H",
  "6H Night",
  "6D",
])
  assert.equal(hasConfirmedFixtureDistance("Running", label, 0), true, label);
assert.equal(hasConfirmedFixtureDistance("Running", "Other", 12), true);
assert.equal(hasConfirmedFixtureDistance("Running", "Ultra", Infinity), false);
assert.equal(hasConfirmedFixtureDistance("Athletics", "Track & field", 0), true);
assert.equal(hasConfirmedFixtureDistance("Swimming", "Pool meet", 0), true);
assert.equal(hasConfirmedFixtureDistance("Cycling", "Other", 0), false);
for (const correction of corrections) {
  const knownEvent = seriesList.some((event) => event.slug === correction.seriesSlug);
  const exact = editions.filter(
    (edition) =>
      edition.seriesSlug === correction.seriesSlug &&
      edition.date === correction.date &&
      edition.distance === correction.distance,
  );
  assert.equal(
    exact.length,
    knownEvent ? 1 : 0,
    "Seed corrections preserve canonical event identities",
  );
  if (!knownEvent) continue;
  assert.equal(exact[0].distanceKm, correction.distanceKm);
  assert.equal(exact[0].source, correction.source);
  if (correction.replacesDistance && correction.replacesDistance !== correction.distance)
    assert(
      !editions.some(
        (edition) =>
          edition.seriesSlug === correction.seriesSlug &&
          edition.date === correction.date &&
          edition.distance === correction.replacesDistance,
      ),
      "A seed refresh cannot restore the superseded placeholder",
    );
}

const { pg, sql } = await bulkFixture();
try {
  await sql.query(
    "insert into events(id,slug,name,sport,country) values(901001,'distance-review-test','Synthetic distance review','Running','England')",
  );
  await sql.query(`insert into editions(id,event_id,event_date,distance_code,distance_km) values
    (901001,901001,'2099-01-01','Other',0),
    (901002,901001,'2099-01-01','10K',10),
    (901003,901001,'2099-01-02','24H',0),
    (901004,901001,'2000-01-01','Other',0)`);
  assert.deepEqual(await unconfirmedFixtureEditionIds(sql, "2099-01-01"), [901001]);
  const staged = await publishing.stageCatalogueBatch(
    {
      sourceKey: "test:unconfirmed-distance",
      editions: [
        { eventSlug: "distance-review-test", date: "2099-02-01", distance: "Other", distanceKm: 0 },
      ],
    },
    "reviewer@example.org",
    sql,
  );
  const result = await publishing.validateCatalogueBatch(staged.batchId, sql);
  assert.equal(result.status, "ready");
  assert.equal(result.withheldDistanceCount, 1);
  assert.match(result.distanceHolds.join(" "), /Withheld from public fixtures/);
  // An older ready batch without the new warning still cannot bypass the public hold.
  await sql.query(
    "update catalogue_import_batches set validation_summary='{}'::jsonb where id=$1",
    [staged.batchId],
  );
  const published = await publishing.publishCatalogueBatch(
    staged.batchId,
    "reviewer@example.org",
    sql,
  );
  assert.equal(published.withheldDistanceCount, 1);
  const imported = await applyImportBundle(
    {
      editions: [
        { eventSlug: "distance-review-test", date: "2099-03-01", distance: "Ultra", distanceKm: 0 },
      ],
    },
    { sqlOverride: sql },
  );
  assert.deepEqual(imported.errors, []);
  const held = await unconfirmedFixtureEditionIds(sql, "2099-01-01");
  assert.equal(held.length, 3, "Both import paths retain research records behind the public hold");
  for (const visible of [901002, 901003, 901004]) assert(!held.includes(visible));
  assert.equal(
    (await sql.query("select count(*)::int as n from editions where event_date>='2099-02-01'"))[0]
      .n,
    2,
  );
  assert.equal(
    (await sql.query("select count(*)::int as n from editions where event_id=901001"))[0].n,
    6,
    "Original records and history survive the hold",
  );
} finally {
  await pg.close();
}
console.log(
  "Distance holds, timed formats, historical retention, staff review warnings, stale-ready and legacy-import visibility guards passed.",
);
