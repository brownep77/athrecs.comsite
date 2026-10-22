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
    // PGlite fixture writes can block the event loop beyond Vite's keep-alive
    // timeout; do not reuse an idle test-server socket after those writes.
    const response = await fetch(`${origin}${path}`, { headers: { connection: 'close' } });
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
      headers: { 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)', connection: 'close' },
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
  const [{ id: triathlonId }] = await sql`insert into events(slug,name,sport,country,city,surface)
    values ('test-indexing-triathlon','Synthetic Indexing Triathlon','Triathlon','United Kingdom','Test City','Multi') returning id`;
  await sql`insert into editions(event_id,event_date,distance_code,distance_km,status)
    values (${triathlonId},current_date+365,'Sprint',25.75,'Scheduled')`;
  const [{ id: triathlonClubId }] = await sql`insert into clubs(slug,name,city,county,country,sports)
    values ('test-indexing-triathlon-club','Synthetic Indexing Triathlon Club','Test City','','United Kingdom','Triathlon') returning id`;
  await sql`update athletes set club_id=${triathlonClubId} where slug='synthetic-private'`;
  const { contentSitemapPageCount } = await server.ssrLoadModule('/src/lib/athrecs/content-sitemap.server.ts');
  for (const [kind, slug] of [['races','test-indexing-triathlon'],['clubs','test-indexing-triathlon-club']]) {
    const path = `/${kind}/${slug}`;
    const page = await get(path);
    assert(!/noindex|none/.test(page.$('meta[name=robots]').attr('content')), path);
    assert.equal(page.$('link[rel=canonical]').attr('href'), `https://www.athrecs.com${path}`);
    assert(!page.html.includes('Synthetic Private Runner'), 'Public club sitemap inclusion must not expose private members');
    const lastShard = await contentSitemapPageCount(sql, kind);
    const map = await get(`/sitemaps/${kind}-${lastShard}.xml`);
    assert(map.html.includes(`https://www.athrecs.com${path}</loc>`), path);
  }
  console.log('PASS: public triathlon event and club pages match sitemap inclusion while private club members remain hidden.');
  // Use a controlled, synthetic two-page catalogue to exercise the boundary
  // between a populated directory and an empty page through actual SSR.
  await sql`update editions set status='Cancelled' where event_date >= current_date`;
  await sql`insert into events(slug,name,sport,country,city,surface)
    select 'test-indexing-directory-'||n,
      'Synthetic Indexing Fixture '||chr(65+n/26)||chr(65+n%26),
      'Athletics','United Kingdom','Test City','Track'
    from generate_series(0,40) n`;
  await sql`insert into editions(event_id,event_date,distance_code,distance_km,status)
    select id,current_date+365,'1500m',1.5,'Scheduled' from events
    where slug like 'test-indexing-directory-%'`;
  for (const [path, count, indexable, canonical] of [
    ['/races', 40, true, '/races'],
    ['/races?page=2', 1, true, '/races?page=2'],
    ['/races?page=3', 0, false, '/races?page=3'],
    ['/races?q=Synthetic%20Indexing', 40, false, '/races'],
    ['/races?q=missing-synthetic-fixture', 0, false, '/races'],
  ]) {
    const page = await get(path);
    assert.equal(page.$('main a[href^="/races/test-indexing-directory-"]').length, count, path);
    assert.equal(/noindex/.test(page.$('meta[name=robots]').attr('content')), !indexable, path);
    assert.equal(page.$('link[rel=canonical]').attr('href'), `https://www.athrecs.com${canonical}`, path);
  }
  console.log('PASS: populated race directory pages stay indexable; empty and filtered pages remain noindex with unchanged canonicals.');

  // These browse pages contain distinct records, not search refinements.
  // Exercise their final HTTP status and SSR metadata, not only head helpers.
  await sql`update editions set event_date=event_date-36525
    where event_id not in (select id from events where slug like 'test-indexing-directory-%')`;
  for (const path of ['/sports/track-and-field?page=2']) {
    const page = await get(path);
    assert(!/noindex/.test(page.$('meta[name=robots]').attr('content')), path);
    assert.equal(page.$('link[rel=canonical]').attr('href'), `https://www.athrecs.com${path}`);
    assert.match(page.$('title').text(), /Page 2/);
    assert.equal(page.$("#fixtures article h3").length, 17);
    assert.match(page.$("#fixtures article h3").first().text(), /Synthetic Indexing Fixture/);
  }
  assert.match((await get('/sports/track-and-field?q=absent-synthetic')).$('meta[name=robots]').attr('content'), /noindex/);
  await sql`update events set sport='Running', surface='Road' where slug like 'test-indexing-directory-%'`;
  const running = await get('/running/events?page=2');
  assert.equal(running.$('link[rel=canonical]').attr('href'), 'https://www.athrecs.com/running/events?page=2');
  assert(!/noindex/.test(running.$('meta[name=robots]').attr('content')));
  assert.match((await get('/running/events?q=absent-synthetic')).$('meta[name=robots]').attr('content'), /noindex/);
  await sql`update athletes set profile_visibility='public' where id=${publicId}`;
  await sql`insert into editions(event_id,event_date,distance_code,distance_km,status)
    select id,'2010-01-01','5K',5,'Finished' from events where slug like 'test-indexing-directory-%'`;
  await sql`insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility)
    select ${publicId},ed.id,'finished',1200,'public' from editions ed join events e on e.id=ed.event_id
    where e.slug like 'test-indexing-directory-%' and ed.event_date='2010-01-01'`;
  const resultsDirectory = await get('/results?page=2');
  assert.equal(resultsDirectory.$('link[rel=canonical]').attr('href'), 'https://www.athrecs.com/results?page=2');
  assert(!/noindex/.test(resultsDirectory.$('meta[name=robots]').attr('content')));
  assert.match(resultsDirectory.$('title').text(), /Page 2/);
  assert(resultsDirectory.$('main a[href^="/results/"]').length > 0);
  const filteredResults = await get('/results?q=absent-synthetic');
  assert.match(filteredResults.$('meta[name=robots]').attr('content'), /noindex/);
  assert.equal(filteredResults.$('link[rel=canonical]').attr('href'), 'https://www.athrecs.com/results');
  for (const path of ['/results?page=1000', '/running/events?page=250', '/sports/track-and-field?page=400']) {
    const response = await fetch(`${origin}${path}`, {headers: {connection: 'close'}});
    await response.text();
    assert.equal(response.status, 404, path);
  }
  for (const sport of ['Cycling', 'Swimming', 'Duathlon']) {
    const slug = `test-indexing-${sport.toLowerCase()}`;
    await sql`insert into events(slug,name,sport,country,city,surface)
      values (${slug},${`Synthetic ${sport}`},${sport},'United Kingdom','Test City','Road')`;
    const [{ id: clubId }] = await sql`insert into clubs(slug,name,city,county,country,sports)
      values (${slug},${`Synthetic ${sport} Club`},'Test City','','United Kingdom',${sport}) returning id`;
    await sql`update athletes set club_id=${clubId} where slug='synthetic-private'`;
    for (const kind of ['races', 'clubs']) {
      const path = `/${kind}/${slug}`;
      const page = await get(path);
      assert(!page.html.includes('Synthetic Private Runner'));
      assert(!/noindex/.test(page.$('meta[name=robots]').attr('content')));
      assert.equal(page.$('link[rel=canonical]').attr('href'), `https://www.athrecs.com${path}`);
      const shard = await contentSitemapPageCount(sql, kind);
      assert((await get(`/sitemaps/${kind}-${shard}.xml`)).html.includes(`https://www.athrecs.com${path}</loc>`));
    }
  }
  console.log('PASS: results/sport/running browse pagination is indexable and self-canonical; empty later pages return 404; searches stay noindex; multisport sitemap inclusion preserves member privacy.');

  console.log('PASS: data-only collections SSR, bounded homepage and directory, A–Z crawlability, robots headers, factual biography/Person schema, locale consolidation and immediate withdrawal.');
  console.log('PASS: SSR archive distinction, safe result preview, credits, original result links, country running default, explicit sport selection, empty-directory noindex and live sitemap exclusion.');
} finally {
  await server.close();
  await database?.close();
}
