// Reproduce a production profile refresh after an event URL has been retired.
// Uses the real migrations, slug safeguards and seed handler in disposable storage.
import assert from "node:assert/strict";
import { createServer } from "vite";

process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
let database;
try {
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const { ensureAthrecsSeeded } = await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  const { moFarahAthlete } = await server.ssrLoadModule("/src/data/mo-farah.ts");
  await ensureAthrecsSeeded();

  const oldSlug = "marriotts-way-marathon-and-half-marathon";
  const newSlug = `${oldSlug}-refresh-regression`;
  const events = await sql`select id from events where slug=${oldSlug}`;
  assert.equal(events.length, 1, "Regression fixture exists in the actual catalogue");
  await sql`update events set slug=${newSlug} where id=${events[0].id}`;
  const redirects =
    await sql`select entity_id, old_slug, current_slug from slug_redirects where entity_type='event' and old_slug=${oldSlug}`;
  assert.equal(redirects.length, 1, "Renaming records the permanent URL redirect");
  const markers =
    await sql`select key, value from app_meta where key <> 'public_figures_catalogue_version' order by key`;
  await sql`update app_meta set value='athrecs-professional-athletes-wave-1-v1' where key='public_figures_catalogue_version'`;
  await sql`update athletes set bio='Previous editorial biography' where slug='mo-farah'`;

  globalThis.__athrecsFullSeedPromise__ = undefined;
  await ensureAthrecsSeeded();
  const refreshed = await sql`select bio from athletes where slug='mo-farah'`;
  assert.equal(refreshed[0].bio, moFarahAthlete.bio);
  const version =
    await sql`select value from app_meta where key='public_figures_catalogue_version'`;
  assert.equal(version[0].value, "athrecs-professional-athletes-mo-farah-2026-09-17-v2");
  assert.deepEqual(
    await sql`select key, value from app_meta where key <> 'public_figures_catalogue_version' order by key`,
    markers,
  );
  assert.deepEqual(
    await sql`select entity_id, old_slug, current_slug from slug_redirects where entity_type='event' and old_slug=${oldSlug}`,
    redirects,
  );
  assert.deepEqual(await sql`select id from events where slug=${newSlug}`, events);
  assert.equal((await sql`select id from events where slug=${oldSlug}`).length, 0);
  await assert.rejects(
    () =>
      sql`insert into events (slug,name,sport) values (${oldSlug},'Must remain blocked','Running')`,
    /permanent public URL and cannot be reused/,
    "The production URL-reuse safeguard remains active",
  );

  // A second cold start must be idempotent after the profile marker advances.
  globalThis.__athrecsFullSeedPromise__ = undefined;
  await ensureAthrecsSeeded();
  assert.equal((await sql`select count(*)::int as n from athletes where slug='mo-farah'`)[0].n, 1);
  console.log(
    "Public-figure refresh passed: updated biography and version, preserved retired event URL and redirect, unchanged catalogue markers, active slug guard and idempotent cold start.",
  );
} finally {
  await server.close();
  await database?.close();
}
