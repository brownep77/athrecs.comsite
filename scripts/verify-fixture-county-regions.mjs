import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { reviewedFixtureCountyRegion } from "../src/data/fixture-county-regions.ts";
const manifest = JSON.parse(
  fs.readFileSync(
    new URL("../docs/fixture-geography/county-region-2026-10-26.json", import.meta.url),
  ),
);
const migration = fs.readFileSync(
  new URL("../migrations/20261026_fixture_county_regions.sql", import.meta.url),
  "utf8",
);
const { corrections, sources, held } = manifest;
const evidence = new Set(sources.map((s) => s.id));
assert.equal(new Set(corrections.map((c) => c.slug)).size, corrections.length);
for (const c of corrections) {
  assert.ok(c.evidenceIds.length && c.evidenceIds.every((id) => evidence.has(id)));
  assert.ok(
    c.after.county &&
      !["South of England", "North of England", "Midlands"].includes(c.after.county),
  );
  const input = { slug: c.slug, ...c.before };
  assert.equal(reviewedFixtureCountyRegion(input).county, c.after.county);
  assert.equal(
    reviewedFixtureCountyRegion({ ...input, city: "Changed start venue" }).county,
    c.before.county,
  );
}
assert.ok(
  !corrections.some((c) => c.before.city === "Kent"),
  "A county label must not match a hamlet",
);
assert.ok(
  !corrections.some((c) => c.slug === "scottish-half-marathon"),
  "Marketing city is not its start venue",
);
assert.ok(held.every((h) => h.reason));
const db = new PGlite();
try {
  await db.exec(
    `create table events(id serial primary key,slug text unique,country text,city text,county text,region text,area text,website text,source_url text,description text default 'unchanged',updated_at timestamptz); create table app_meta(key text primary key,value text);`,
  );
  const fields = ["country", "city", "county", "region", "area", "website", "source_url"];
  for (const c of corrections)
    await db.query(`insert into events(slug,${fields.join(",")}) values($1,$2,$3,$4,$5,$6,$7,$8)`, [
      c.slug,
      ...fields.map((k) => c.before[k]),
    ]);
  await db.query(
    `insert into events(slug,county,description) values('unrelated','Unchanged county','Do not change')`,
  );
  const stale = corrections[0];
  await db.query("update events set area='Changed since review' where slug=$1", [stale.slug]);
  await db.transaction((tx) => tx.exec(migration));
  assert.equal(
    (await db.query("select count(*)::int as n from app_meta")).rows[0].n,
    corrections.length - 1,
  );
  const rows = (await db.query("select * from events order by slug")).rows;
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  for (const c of corrections) {
    const row = bySlug.get(c.slug);
    assert.equal(row.county, c.slug === stale.slug ? c.before.county : c.after.county);
    assert.equal(row.region, c.slug === stale.slug ? c.before.region : c.after.region);
    for (const k of ["country", "city", "website", "source_url"]) assert.equal(row[k], c.before[k]);
    assert.equal(row.description, "unchanged");
  }
  assert.equal(bySlug.get("unrelated").county, "Unchanged county");
  const backups = (await db.query("select * from app_meta order by key")).rows;
  const original = JSON.parse(backups[0].value);
  assert.ok(original.before.slug && original.after && original.evidenceIds.length);
  await db.transaction((tx) => tx.exec(migration));
  assert.deepEqual((await db.query("select * from events order by slug")).rows, rows);
  assert.deepEqual((await db.query("select * from app_meta order by key")).rows, backups);
  // A forced failure after the write must restore both changes and backups.
  await db.exec("delete from app_meta; update events set county='reset'");
  for (const c of corrections)
    await db.query("update events set county=$2,region=$3,area=$4 where slug=$1", [
      c.slug,
      c.before.county,
      c.before.region,
      c.before.area,
    ]);
  const beforeRollback = (await db.query("select * from events order by slug")).rows;
  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.exec(migration);
      await tx.exec("select 1/0");
    }),
  );
  assert.deepEqual((await db.query("select * from events order by slug")).rows, beforeRollback);
  assert.equal((await db.query("select count(*)::int as n from app_meta")).rows[0].n, 0);
} finally {
  await db.close();
}
console.log(
  `County/region enrichment: ${corrections.length} guarded changes; source references, seed guards, stale venue rejection, unrelated fields, retained originals, repeat no-op and atomic rollback passed.`,
);
