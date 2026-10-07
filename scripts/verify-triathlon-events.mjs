import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// All writes stay in this process's disposable PGlite database.
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18197";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18197, strictPort: true } });
let database;
const cache = new Map();
async function rpc(path, name, data) {
  if (!cache.has(path)) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200);
    cache.set(path, await response.text());
  }
  const source = cache.get(path);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} is available`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id, `${name} has a framework RPC identifier`);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({ method: "GET", data, headers: { origin }, context: {} }),
  );
  if (response.error) throw response.error;
  return response.result;
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const { ensureAthrecsSeeded } = await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  await ensureAthrecsSeeded();
  const [{ id: eventId }] = await sql`
    insert into events (slug, name, sport, country, city)
    values ('test-triathlon-visibility', 'Test Triathlon Visibility', 'Triathlon', 'New Zealand', 'Test City')
    returning id
  `;
  const [{ id: editionId }] = await sql`
    insert into editions (event_id, event_date, distance_code, distance_km, status)
    values (${eventId}, '2099-02-14', 'Sprint', 25.75, 'Open') returning id
  `;
  const [{ id: athleteId }] = await sql`
    insert into athletes (slug, display_name, given_name, family_name, profile_visibility, profile_type)
    values ('test-private-triathlete', 'Test Private Triathlete', 'Test', 'Triathlete', 'private', 'Participant') returning id
  `;
  await sql`
    insert into results (athlete_id, edition_id, status, finish_time_seconds, result_visibility)
    values (${athleteId}, ${editionId}, 'finished', 3600, 'private')
  `;
  const path = '/src/athletics/api.ts';
  const input = { sport: 'Triathlon', q: 'Test Triathlon Visibility', upcomingOnly: true };
  const events = await rpc(path, 'listEvents', input);
  assert.equal(events.length, 1);
  assert.equal(events[0].id, eventId);
  const event = await rpc(path, 'getEventBySlug', 'test-triathlon-visibility');
  assert.equal(event.event.sport, 'Triathlon');
  assert.equal(event.upcoming[0].distance_code, 'Sprint');
  assert.equal(event.upcoming[0].start_time, null, 'Do not invent a start time');
  assert.equal(event.upcoming[0].result_count, 0, 'Private participant count stays hidden');
  assert.deepEqual(await rpc(path, 'getEditionResults', editionId), []);
  const calendar = await rpc(path, 'listAthleticsCalendarPage', input);
  assert.equal(calendar.total, 1);
  assert.equal(calendar.items[0].event_slug, 'test-triathlon-visibility');
  assert.equal(await rpc('/src/runrecs/api.ts', 'getEventBySlug', 'test-triathlon-visibility'), null);
  const html = await (await fetch(`${origin}/races/test-triathlon-visibility`)).text();
  assert(html.includes('Test Triathlon Visibility'));
  assert(!html.includes('Test Private Triathlete'));
  const discovery = await (await fetch(`${origin}/find-events`)).text();
  assert(discovery.includes('/races?sport=Triathlon'));
  console.log('PASS: triathlon search, detail, calendar and discovery; private results hidden; RunRecs boundary retained.');
} finally {
  await server.close();
  await database?.close();
}
