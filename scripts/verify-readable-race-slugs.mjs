import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { resolveEventSeedSlugs, preserveMigratedEventSeedSlugs } from "../src/lib/athrecs/event-seed-slugs.server.ts";

const migration = await readFile("migrations/20261025_readable_race_slugs.sql", "utf8");
const mapping = [...migration.matchAll(/\('(wa-[a-f0-9]{16})', '([a-z0-9-]+)'\)/g)]
  .map(([, oldSlug, currentSlug]) => ({ oldSlug, currentSlug }));
assert.equal(mapping.length, 3134);
assert.equal(new Set(mapping.map((row) => row.currentSlug)).size, mapping.length);
assert(mapping.every((row) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(row.currentSlug)));
const db = new PGlite();
const sql = { query: async (query, values) => (await db.query(query, values)).rows };
try {
  await db.exec(`create table events(id int primary key, slug text unique, name text);
    create table athletes(id int primary key, slug text unique);
    create table clubs(id int primary key, slug text unique);
    create table editions(id int primary key, event_id int references events(id));
    create table results(id int primary key, edition_id int references editions(id), evidence text, visibility text);`);
  for (const file of ["0015_slug_redirects.sql", "0017_slug_insert_guards.sql", "0018_legacy_slug_compatibility.sql"])
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  // Synthetic records exercise every explicit mapping without copying athletes or results.
  await db.query(`insert into events select ordinality::int, slug, 'Synthetic Meeting'
    from unnest($1::text[]) with ordinality as source(slug, ordinality)`, [mapping.map((row) => row.oldSlug)]);
  await db.exec(`insert into editions select id, id from events;
    insert into results select id, id, 'synthetic evidence ' || id, case when id % 2 = 0 then 'private' else 'public' end from editions;`);
  const before = await sql.query("select * from results order by id");
  await db.exec(migration);
  await db.exec(migration);
  assert.deepEqual(await sql.query("select * from results order by id"), before);
  const redirects = await sql.query(`select e.id, e.slug, r.old_slug from events e
    join slug_redirects r on r.entity_type='event' and r.entity_id=e.id and r.current_slug=e.slug order by e.id`);
  assert.equal(redirects.length, mapping.length);
  for (const [i, row] of redirects.entries()) {
    assert.equal(row.id, i + 1);
    assert.equal(row.slug, mapping[i].currentSlug);
    assert.equal(row.old_slug, mapping[i].oldSlug);
  }
  await db.query("update events set slug='synthetic-later-rename' where id=1");
  const resolved = await resolveEventSeedSlugs(sql, mapping.map((row) => row.oldSlug));
  assert.equal(resolved.get(mapping[0].oldSlug), "synthetic-later-rename");
  assert.equal(resolved.get(mapping[1].oldSlug), mapping[1].currentSlug);
  await assert.rejects(db.query("insert into events values (999999, $1, 'Cannot recycle')", [mapping[0].oldSlug]), /permanent/);
  // A fresh database has the map before its first seed and gets old URL aliases too.
  await db.exec("truncate results, editions, events, slug_redirects");
  const fresh = await resolveEventSeedSlugs(sql, [mapping[0].oldSlug, "ordinary-race"]);
  assert.equal(fresh.get(mapping[0].oldSlug), mapping[0].currentSlug);
  assert.equal(fresh.get("ordinary-race"), "ordinary-race");
  await db.query("insert into events values (1, $1, 'Fresh synthetic race')", [mapping[0].currentSlug]);
  await preserveMigratedEventSeedSlugs(sql);
  await preserveMigratedEventSeedSlugs(sql);
  assert.equal((await sql.query("select * from slug_redirects")).length, 1);
  console.log(`PASS: ${mapping.length} readable race URLs, stable entity/result IDs, permanent aliases, replay and fresh-seed/later-rename protection.`);
} finally { await db.close(); }
