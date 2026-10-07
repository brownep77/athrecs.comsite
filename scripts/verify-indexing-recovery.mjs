import assert from "node:assert/strict";
import { createServer } from "vite";
import * as cheerio from "cheerio";

// Exercise actual server-rendered routes against an isolated in-memory database.
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18198";
const server = await createServer({ server: { host: "127.0.0.1", port: 18198, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const { ensureAthrecsSeeded } = await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  await ensureAthrecsSeeded();
  const [{ id: eventId }] = await sql`insert into events (slug, name, sport, country, city, surface)
    values ('test-indexing-archive', 'Synthetic Archive Meeting', 'Athletics', 'Montenegro', 'Test City', 'Track') returning id`;
  const [{ id: editionId }] = await sql`insert into editions (event_id, event_date, distance_code, distance_km, status)
    values (${eventId}, '2014-06-07', '1500m', 1.5, 'Finished') returning id`;
  for (const [slug, name, visibility] of [['synthetic-public','Synthetic Public Runner','public'],['synthetic-private','Synthetic Private Runner','private']]) {
    const [{ id }] = await sql`insert into athletes (slug, display_name, given_name, family_name, profile_visibility, profile_type)
      values (${slug}, ${name}, 'Synthetic', 'Runner', ${visibility}, 'Participant') returning id`;
    await sql`insert into results (athlete_id, edition_id, status, finish_time_seconds, result_visibility, source_url, result_source)
      values (${id}, ${editionId}, 'finished', 266, ${visibility}, 'https://example.org/results', 'Example Timing')`;
  }
  const get = async (path) => {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    return { html, $: cheerio.load(html) };
  };
  const archive = await get('/races/test-indexing-archive');
  assert.match(archive.$('#archive-results-heading').text(), /1500m/);
  assert.match(archive.$('title').text(), /2014-06-07.*1500m.*Synthetic Public Runner/);
  assert.match(archive.$('main').text(), /Synthetic Public Runner/);
  assert(!archive.html.includes('Synthetic Private Runner'));
  assert(!archive.$('main').text().includes('Before you go'));
  assert(!archive.$('main').text().includes('Ways to enter'));
  assert.match(archive.$('main').text(), /Example Timing/);
  const resultsPath = archive.$('a').filter((i, e) => archive.$(e).text() === 'View recorded results').attr('href');
  assert(resultsPath);
  const results = await get(resultsPath);
  assert.match(results.$('main').text(), /1 performance recorded/);
  assert.match(results.$('main').text(), /may cover only part of the field/);
  assert(!results.html.includes('Synthetic Private Runner'));
  const country = await get('/de/montenegro/races');
  assert.match(country.$('main').text(), /Running/);
  assert(country.$('a[href*="/races/"]').length > 1, 'Default country directory shows running fixtures');
  assert(!country.$('meta[name=robots]').attr('content').includes('noindex'));
  const empty = await get('/de/montenegro/races?sport=Athletics');
  assert.match(empty.$('meta[name=robots]').attr('content'), /noindex/);
  const sitemap = await get('/sitemaps/countries.xml');
  assert(sitemap.html.includes('https://www.athrecs.com/de/montenegro/races'));
  await sql`update editions set event_date='2000-01-01' where event_id in (select id from events where country='Montenegro' and sport='Running')`;
  const nowEmpty = await get('/de/montenegro/races');
  assert.match(nowEmpty.$('meta[name=robots]').attr('content'), /noindex/);
  const updatedSitemap = await get('/sitemaps/countries.xml');
  assert(!updatedSitemap.html.includes('https://www.athrecs.com/de/montenegro/races'));
  const { Route } = await server.ssrLoadModule('/src/routes/$language/$country/races/index.tsx');
  const explicit = Route.options.validateSearch({sport:'Athletics'});
  assert.equal(explicit.sport, 'Athletics');
  console.log('PASS: SSR archive distinction, safe result preview, credits, original result links, country running default, explicit sport selection, empty-directory noindex and live sitemap exclusion.');
} finally {
  await server.close();
  await database?.close();
}
