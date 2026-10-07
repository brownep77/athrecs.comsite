import assert from "node:assert/strict";
import { createServer } from "vite";
import { resolveCataloguePublisherRedirects } from "./lib/catalogue-publisher-redirects.mjs";

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
  const publishing = await server.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const [event] = await sql`insert into events (slug, name, sport, country)
    values ('redirect-fixture-first', 'Canonical editorial name', 'Running', 'England') returning id`;
  await sql`update events set slug='redirect-fixture-second' where id=${event.id}`;
  await sql`update events set slug='redirect-fixture-live' where id=${event.id}`;
  const eventsBefore = await sql`select * from events order by id`;
  const redirectsBefore = await sql`select * from slug_redirects order by entity_type, old_slug`;
  const eventInput = (slug) => ({
    slug,
    name: "Old source name",
    sport: "Running",
    country: "England",
    distances: ["Half"],
  });
  const editionInput = (eventSlug, date) => ({
    eventSlug,
    date,
    distance: "Half",
    distanceKm: 21.0975,
    status: "Open",
  });
  const batch = {
    sourceKey: "test:permanent-event-redirects",
    events: [
      eventInput("redirect-fixture-first"),
      eventInput("redirect-fixture-second"),
      eventInput("redirect-fixture-new"),
    ],
    editions: [
      editionInput("redirect-fixture-first", "2027-02-01"),
      editionInput("redirect-fixture-second", "2027-03-01"),
      editionInput("redirect-fixture-new", "2027-04-01"),
    ],
  };
  const untouched = structuredClone(batch);
  const originalStage = await publishing.stageCatalogueBatch(batch, "regression@example.test", sql);
  assert.equal(
    (await publishing.validateCatalogueBatch(originalStage.batchId, sql)).status,
    "invalid",
  );
  const resolved = await resolveCataloguePublisherRedirects(sql, batch);
  assert.deepEqual(batch, untouched, "Resolving aliases does not mutate the source batch");
  assert.deepEqual(resolved.events, [eventInput("redirect-fixture-new")]);
  assert.deepEqual(resolved.editions, [
    editionInput("redirect-fixture-live", "2027-02-01"),
    editionInput("redirect-fixture-live", "2027-03-01"),
    editionInput("redirect-fixture-new", "2027-04-01"),
  ]);
  const staged = await publishing.stageCatalogueBatch(resolved, "regression@example.test", sql);
  assert.equal((await publishing.validateCatalogueBatch(staged.batchId, sql)).status, "ready");
  assert.equal(
    (
      await publishing.stageCatalogueBatch(
        await resolveCataloguePublisherRedirects(sql, batch),
        "regression@example.test",
        sql,
      )
    ).batchId,
    staged.batchId,
  );
  assert.deepEqual(await sql`select * from events order by id`, eventsBefore);
  assert.deepEqual(
    await sql`select * from slug_redirects order by entity_type, old_slug`,
    redirectsBefore,
  );
  await assert.rejects(
    () => sql`insert into events (slug, name, sport)
    values ('redirect-fixture-first', 'Must remain blocked', 'Running')`,
    /permanent public URL/,
  );
  const duplicate = {
    ...batch,
    editions: [
      editionInput("redirect-fixture-first", "2027-02-01"),
      editionInput("redirect-fixture-second", "2027-02-01"),
    ],
  };
  assert.equal((await resolveCataloguePublisherRedirects(sql, duplicate)).editions.length, 1);
  await assert.rejects(
    () =>
      resolveCataloguePublisherRedirects(sql, {
        ...duplicate,
        editions: [duplicate.editions[0], { ...duplicate.editions[1], startTime: "09:00" }],
      }),
    /Conflicting catalogue editions/,
  );
  await sql`delete from events where id=${event.id}`;
  const orphaned = await resolveCataloguePublisherRedirects(sql, batch);
  assert.deepEqual(
    orphaned,
    batch,
    "Orphaned reservations are left for the existing validator to reject",
  );
  assert.equal(
    (await publishing.validateCatalogueBatch(originalStage.batchId, sql)).status,
    "invalid",
  );
  console.log(
    "Catalogue publisher redirects verified: valid targets, preserved metadata, unchanged guards, conflict rejection and stable staging.",
  );
} finally {
  await server.close();
  await database?.close();
}
