import assert from "node:assert/strict";
import { load } from "cheerio";
import { PGlite } from "@electric-sql/pglite";

// Keep the public route test isolated from live credentials and the large fixture catalogue.
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[key] = "";
process.env.VITE_SITE_BRAND = "athrecs";
// Vercel uses Neon in production; supply the installed, asset-complete PGlite
// runtime here so the same built handler can run its migrations against a disposable database.
const database = new PGlite({ parsers: { 20: Number, 1082: String, 1186: String } });
try {
  await database.waitReady;
  await database.exec(
    "create table _migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  globalThis.__pgliteInstance__ = Promise.resolve(database);
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const { default: app } = await import("../.vercel/output/functions/__server.func/index.mjs");
  const origin = "https://www.athrecs.com";
  const landing = await app.fetch(new Request(origin + "/search"));
  assert.equal(landing.status, 200);
  await landing.text();
  await globalThis.__pgBootstrapPromise__;
  // The full catalogue seed normally creates this legacy table.
  await database.exec(`create table if not exists event_groups (
    event_id int, group_code text, label text, level text, source_url text, checked_at date, note text
  )`);
  const {
    rows: [{ id: eventId }],
  } = await database.query(`insert into events(slug,name,sport,country,city,surface)
    values ('edition-search-test','Synthetic Archive Half Marathon','Running','United Kingdom','Test City','Road') returning id`);
  const {
    rows: [{ id: athleteId }],
  } = await database.query(`insert into athletes(slug,display_name,profile_visibility)
    values ('edition-search-athlete','Synthetic Runner','public') returning id`);
  const sourceUrl = "https://example.org/results/raw-list";
  const get = async (path) => {
    assert(path);
    const response = await app.fetch(new Request(origin + path));
    const html = await response.text();
    if (response.status !== 200) {
      const page = load(html);
      console.error(page("main, pre").text().slice(0, 1500) || html.slice(-1600));
    }
    assert.equal(response.status, 200, path);
    assert(!html.includes(sourceUrl), "Raw result evidence must be absent from HTML and hydration");
    return load(html);
  };
  const addEditions = async (firstYear, lastYear) => {
    await database.query(
      `insert into editions(event_id,event_date,distance_code,distance_km,status,results_official_url)
      select $1,make_date(y,3,19),'Half',21.1,'Finished',$2
      from generate_series($3::int,$4::int) as y`,
      [eventId, sourceUrl, firstYear, lastYear],
    );
    await database.query(
      `insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility,source_url,result_source)
      select $1,ed.id,'finished',5400,'public',$2,'Example Timing'
      from editions ed where ed.event_id=$3 and extract(year from ed.event_date) between $4 and $5`,
      [athleteId, sourceUrl, eventId, firstYear, lastYear],
    );
  };
  await addEditions(2005, 2005);
  const single = await get("/races/edition-search-test");
  assert.match(single("#archive-results-heading").text(), /Selected Half performances/);
  assert.match(
    single("section[aria-labelledby='archive-results-heading'] table").text(),
    /Synthetic Runner/,
  );
  assert.match(single("main").text(), /Example Timing/);
  const oldestUrl = single("section[aria-labelledby='results-heading'] a").attr("href");
  const oldest = await get(oldestUrl);
  assert.equal(oldest("link[rel=canonical]").attr("href"), "https://www.athrecs.com" + oldestUrl);
  await addEditions(2006, 2026);
  const hub = await get("/races/edition-search-test");
  const section = hub("section[aria-labelledby='results-heading']");
  assert.equal(section.find("a[href^='/results/']").length, 22);
  assert.equal(
    section.find("details a").length,
    10,
    "Older links are in the initial server-rendered HTML",
  );
  assert.equal(section.find("details a").last().attr("href"), oldestUrl);
  const mainSearch = await get("/search?q=Synthetic+Archive+Half+Marathon");
  assert.equal(mainSearch("#search-results li a").length, 8);
  const all = await get(mainSearch("#search-results a").first().attr("href"));
  assert.equal(
    all("a[href^='/results/']").filter((_, e) =>
      /Synthetic Archive Half Marathon/.test(all(e).text()),
    ).length,
    22,
  );
  const datedSearch = await get("/search?q=Synthetic+Archive+Half+Marathon+2005");
  assert.equal(datedSearch("#search-results li a").length, 1);
  assert.equal(datedSearch("#search-results li a").attr("href"), oldestUrl);
  const missing = await get("/search?q=Synthetic+Archive+Half+Marathon+2002");
  assert.match(missing("#search-results").text(), /No published editions/);
  console.log(
    "PASS: 22 native editions are linked in race hub HTML and from results search, with a bounded main search, exact year matches and backend-only evidence URLs.",
  );
} finally {
  await database.close();
}
