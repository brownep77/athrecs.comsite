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
    return { html, $: cheerio.load(html), headers: response.headers };
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
  const series = await get('/race-series');
  assert.match(series.$('main').text(), /Disciplines and championships/);
  const home = await get('/');
  assert.match(home.$('main').text(), /Find an athlete/);
  const { readAthleteDirectoryPage } = await server.ssrLoadModule('/src/lib/athrecs/athlete-directory-page.server.ts');
  const filteredDirectory = await readAthleteDirectoryPage(sql, { q: 'Synthetic Public' });
  assert.equal(filteredDirectory.total, 1);
  assert.equal(filteredDirectory.athletes[0].result_count, 1);
  assert.equal(filteredDirectory.publicResults, null, 'No false catalogue totals from a bounded query');
  const [{ id: publicId }] = await sql`select id from athletes where slug='synthetic-public'`;
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value,note)
    values ('athlete.bulk_publish','athlete',${String(publicId)},'{"profile_visibility":"public"}'::jsonb,'Synthetic search fixture')`;
  await sql`update results set result_details='{"verificationStatus":"source_verified"}'::jsonb where athlete_id=${publicId}`;
  const directory = await get('/athletes');
  assert.equal(directory.headers.get('x-robots-tag'), 'index, follow');
  assert.equal(directory.$('meta[name=robots]').attr('content'), 'index, follow');
  assert(directory.$('a[href*="letter=S"]').length, 'Alphabetical navigation is crawlable');
  const letter = await get('/athletes?letter=S');
  assert.equal(letter.headers.get('x-robots-tag'), 'index, follow');
  assert.equal(letter.$('link[rel=canonical]').attr('href'), 'https://www.athrecs.com/athletes?letter=S');
  const searchPage = await get('/athletes?q=Synthetic');
  assert.equal(searchPage.headers.get('x-robots-tag'), 'noindex, follow');
  assert(!searchPage.html.includes('Synthetic Private Runner'));
  const publicProfile = await get('/athletes/synthetic-public');
  assert.match(publicProfile.$('title').text(), /Synthetic Public Runner.*Athletics results/);
  assert.match(publicProfile.$('main').text(), /4 minutes and 26 seconds/);
  const entities = publicProfile.$('script[type="application/ld+json"]').toArray().map((e)=>JSON.parse(publicProfile.$(e).text()));
  assert(entities.some((item)=>item.mainEntity?.['@type']==='Person' && item.mainEntity.name==='Synthetic Public Runner'));
  const languageHome = await get('/nl/czechia');
  assert.equal(languageHome.$('link[rel=canonical]').attr('href'), 'https://www.athrecs.com/en/czechia');
  const pages = await get('/sitemaps/pages.xml');
  assert(pages.html.includes('https://www.athrecs.com/athletes</loc>'));
  assert(!sitemap.html.includes('https://www.athrecs.com/nl/czechia</loc>'));
  // Compare the actual result sitemap and rendered page after the final public
  // row is withdrawn and restored. SQL-only selection tests cannot catch a
  // stale route cache or a page/sitemap disagreement.
  for (const visibility of ['public', 'private', 'public']) {
    await sql`update results set result_visibility=${visibility} where athlete_id=${publicId}`;
    const resultSitemap = await get('/sitemaps/results-1.xml');
    assert.equal(resultSitemap.headers.get('cache-control'), 'no-store');
    assert.equal(resultSitemap.html.includes(`https://www.athrecs.com${resultsPath}</loc>`), visibility === 'public');
    const response = await fetch(`${origin}${resultsPath}`, {
      headers: { 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
    });
    assert.equal(response.status, visibility === 'public' ? 200 : 404);
    const html = await response.text();
    const $ = cheerio.load(html);
    if (visibility === 'public') {
      assert(!/noindex|none/.test($('meta[name=robots]').attr('content')));
      assert(!/noindex|none/.test(response.headers.get('x-robots-tag') ?? ''));
      assert.equal($('link[rel=canonical]').attr('href'), `https://www.athrecs.com${resultsPath}`);
      assert.match($('main').text(), /Synthetic Public Runner/);
    } else {
      assert(!html.includes('Synthetic Public Runner'), 'Withdrawn result must not remain in HTML or serialized data');
    }
  }
  console.log('PASS: last public result withdrawal/restoration immediately agrees between sitemap membership and crawler page status, metadata, canonical and public content.');
  await sql`update athletes set profile_visibility='private' where id=${publicId}`;
  assert(!(await readAthleteDirectoryPage(sql, { letter: 'S' })).athletes.some((a)=>a.id===publicId), 'Privacy withdrawal applies without a cache expiry');
  console.log('PASS: data-only collections SSR, bounded homepage and directory, A–Z crawlability, robots headers, factual biography/Person schema, locale consolidation and immediate withdrawal.');
  console.log('PASS: SSR archive distinction, safe result preview, credits, original result links, country running default, explicit sport selection, empty-directory noindex and live sitemap exclusion.');
} finally {
  await server.close();
  await database?.close();
}
