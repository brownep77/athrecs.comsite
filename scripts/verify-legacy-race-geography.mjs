import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "vite";
import { legacyRaceGeography } from "../src/data/legacy-race-geography.ts";

const manifest = JSON.parse(
  fs.readFileSync(
    new URL("../docs/fixture-geography/legacy-home-nations-2026-10-11.json", import.meta.url),
    "utf8",
  ),
);
const repair = fs.readFileSync(
  new URL("../migrations/20261011_legacy_race_home_nations.sql", import.meta.url),
  "utf8",
);
const { corrections, sources, held } = manifest;
assert.equal(corrections.length + held.length, 570);
assert.equal(new Set(corrections.map((c) => c.slug)).size, corrections.length);
const evidenceIds = new Set(sources.map((s) => s.id));
for (const c of corrections) {
  assert.deepEqual(legacyRaceGeography[c.slug], c.after);
  assert.ok(c.evidenceIds.length && c.evidenceIds.every((id) => evidenceIds.has(id)));
  assert.ok(["England", "Scotland", "Wales", "Northern Ireland"].includes(c.after.country));
}
for (const h of held) assert.equal(legacyRaceGeography[h.slug], undefined);
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
let seeded = 0;
try {
  const { seriesList } = await vite.ssrLoadModule("/src/data/catalogue.ts");
  for (const s of seriesList) {
    const after = legacyRaceGeography[s.slug];
    if (!after) continue;
    for (const key of Object.keys(after)) assert.equal(s[key], after[key], `${s.slug}: ${key}`);
    seeded++;
  }
  assert.ok(seeded > 0);
} finally {
  await vite.close();
}
const db = new PGlite();
await db.exec(
  `CREATE TABLE events (id serial PRIMARY KEY, slug text UNIQUE, country text, county text, city text, area text, source_url text, updated_at timestamptz, description text DEFAULT 'Unchanged race description'); CREATE TABLE app_meta (key text PRIMARY KEY, value text);`,
);
for (const c of corrections) {
  await db.query(
    "INSERT INTO events(slug,country,county,city,area,source_url) VALUES($1,$2,$3,$4,$5,$6)",
    [c.slug, c.before.country, c.before.county, c.before.city, c.before.area, c.sourceUrl],
  );
}
// A concurrent editor has supplied a new location. The bounded repair must skip it.
const guarded = corrections[0];
await db.query("UPDATE events SET city='Editorial correction' WHERE slug=$1", [guarded.slug]);
await db.exec(
  "INSERT INTO events(slug,country,county,city,area) VALUES('unrelated-control','United Kingdom','','','')",
);
await db.exec(repair);
const rows = (await db.query("SELECT * FROM events ORDER BY slug")).rows;
for (const c of corrections.slice(1)) {
  const row = rows.find((r) => r.slug === c.slug);
  for (const key of Object.keys(c.after)) assert.equal(row[key], c.after[key], `${c.slug}: ${key}`);
  assert.equal(row.description, "Unchanged race description");
}
assert.equal(rows.find((r) => r.slug === guarded.slug).city, "Editorial correction");
assert.equal(rows.find((r) => r.slug === "unrelated-control").country, "United Kingdom");
const backups = (await db.query("SELECT value FROM app_meta ORDER BY key")).rows;
assert.equal(backups.length, corrections.length - 1);
for (const row of backups) {
  const value = JSON.parse(row.value);
  const c = corrections.find((c) => c.slug === value.before.slug);
  for (const key of Object.keys(c.before)) assert.equal(value.before[key], c.before[key]);
  assert.deepEqual(value.after, c.after);
}
await db.exec(repair);
assert.deepEqual((await db.query("SELECT * FROM events ORDER BY slug")).rows, rows);
assert.deepEqual((await db.query("SELECT value FROM app_meta ORDER BY key")).rows, backups);
await db.close();
console.log(
  `Legacy geography verified: ${corrections.length} corrections, ${seeded} catalogue seeds, ${held.length} held; before-state guard, original backups, repeat safety and unrelated fields preserved.`,
);
