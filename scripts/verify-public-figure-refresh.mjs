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

  const roadRows =
    await sql`select r.status, r.finish_time_seconds from results r join athletes a on a.id=r.athlete_id where a.slug='mo-farah'`;
  assert.equal(roadRows.length, 52, "All sourced road records reach the database");
  assert.equal(roadRows.filter((row) => row.status === "finished").length, 50);
  assert(
    roadRows.filter((row) => row.status === "DNF").every((row) => row.finish_time_seconds === null),
  );

  // The new public profile retains result status, terrain and database identity.
  const gogginsRows = await sql`
    select r.id as "resultId", ed.id as "editionId", e.slug as "eventSlug", e.name as "eventName",
      e.sport, e.surface, e.country, ed.event_date::text as "eventDate",
      ed.distance_code as "distanceCode", ed.distance_km as "distanceKm",
      r.status, r.finish_time_seconds as "finishTimeSeconds", r.overall_place as "overallPlace"
    from results r join athletes a on a.id=r.athlete_id
    join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
    where a.slug='david-goggins'
  `;
  assert.equal(gogginsRows.length, 44);
  const { findPersonalBests } = await server.ssrLoadModule("/src/lib/athrecs/profile-records.ts");
  const { buildProfileAchievements } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-achievements.ts",
  );
  assert.equal(buildProfileAchievements(gogginsRows).finishes.length, 40);
  assert(gogginsRows.filter((r) => r.status === "DNF").every((r) => r.finishTimeSeconds === null));
  assert(findPersonalBests(gogginsRows).every((r) => r.surface === "Road"));
  assert.equal(gogginsRows.filter((r) => r.eventSlug === "jfk-50-mile").length, 3);
  assert(
    gogginsRows.filter((r) => r.eventSlug === "jfk-50-mile").every((r) => /Trail/.test(r.surface)),
  );
  const gogginsIdentity = await sql`
    select a.profile_type, a.date_of_birth, i.athlete_number::text as number
    from athletes a join athlete_resolved_ids i on i.athlete_id=a.id
    where a.slug='david-goggins'
  `;
  assert.equal(gogginsIdentity.length, 1);
  assert.equal(gogginsIdentity[0].profile_type, "Public figure");
  assert.equal(gogginsIdentity[0].date_of_birth, null);
  assert.match(gogginsIdentity[0].number, /^\d+$/);

  // Reproduce the production redirects that blocked the first road import.
  const renamedEvents = [];
  for (const [sourceSlug, currentSlug] of [
    ["aj-bell-great-manchester-run", "bupa-great-manchester-run"],
    ["vitality-london-10000", "bupa-london-10000"],
  ]) {
    const [event] = await sql`select id from events where slug=${sourceSlug}`;
    assert(event, `Source event ${sourceSlug} exists in the fresh catalogue`);
    await sql`update events set slug=${currentSlug} where id=${event.id}`;
    renamedEvents.push({ id: event.id, sourceSlug, currentSlug });
  }
  await sql`delete from results where athlete_id=(select id from athletes where slug='mo-farah')`;

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
  assert.equal(version[0].value, "athrecs-david-goggins-running-2026-09-18-v1");
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
  for (const { id, sourceSlug, currentSlug } of renamedEvents) {
    assert.deepEqual(await sql`select id from events where slug=${currentSlug}`, [{ id }]);
    assert.equal((await sql`select id from events where slug=${sourceSlug}`).length, 0);
    assert.equal(
      (
        await sql`select entity_id from slug_redirects where entity_type='event' and old_slug=${sourceSlug}`
      )[0].entity_id,
      id,
    );
  }
  await assert.rejects(
    () =>
      sql`insert into events (slug,name,sport) values (${oldSlug},'Must remain blocked','Running')`,
    /permanent public URL and cannot be reused/,
    "The production URL-reuse safeguard remains active",
  );

  // A second cold start must be idempotent after the profile marker advances.
  await sql`update athletes set bio='Editorial update after road import' where slug='mo-farah'`;
  globalThis.__athrecsFullSeedPromise__ = undefined;
  await ensureAthrecsSeeded();
  assert.equal(
    (await sql`select bio from athletes where slug='mo-farah'`)[0].bio,
    "Editorial update after road import",
    "Completeness follows redirects, so a cold start does not replay the import",
  );
  assert.equal((await sql`select count(*)::int as n from athletes where slug='mo-farah'`)[0].n, 1);
  assert.equal(
    (
      await sql`select count(*)::int as n from results r join athletes a on a.id=r.athlete_id where a.slug='mo-farah'`
    )[0].n,
    52,
    "Repeated refreshes do not duplicate road performances",
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from results r join athletes a on a.id=r.athlete_id where a.slug='david-goggins'`
    )[0].n,
    44,
  );
  assert.deepEqual(
    await sql`select a.profile_type, a.date_of_birth, i.athlete_number::text as number from athletes a join athlete_resolved_ids i on i.athlete_id=a.id where a.slug='david-goggins'`,
    gogginsIdentity,
  );
  console.log(
    "Public-figure refresh passed: source results follow renamed production events, retired URLs remain guarded, catalogue markers stay unchanged and cold starts do not replay the import.",
  );
} finally {
  await server.close();
  await database?.close();
}
