import assert from "node:assert/strict";
import { load } from "cheerio";
import { createServer } from "vite";

// Keep the public route test isolated from live credentials and the large fixture catalogue.
for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING", "RESEND_API_KEY"])
  process.env[key] = "";
process.env.VITE_SITE_BRAND = "athrecs";
const server = await createServer({ server: { host: "127.0.0.1", port: 18273, strictPort: true, watch: null, hmr: false } });
let database;
try {
  await server.listen();
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const [{ id: eventId }] = await sql`insert into events(slug,name,sport,country,city,surface)
    values ('edition-search-test','Synthetic Archive Half Marathon','Running','United Kingdom','Test City','Road') returning id`;
  const [{ id: athleteId }] = await sql`insert into athletes(slug,display_name,profile_visibility)
    values ('edition-search-athlete','Synthetic Runner','public') returning id`;
  const sourceUrl = "https://example.org/results/raw-list";
  const get = async (path) => {
    assert(path);
    const response = await fetch("http://127.0.0.1:18273" + path, { redirect: "manual", headers: { connection: "close" } });
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
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status,results_official_url)
      select ${eventId},make_date(y,3,19),'Half',21.1,'Finished',${sourceUrl}
      from generate_series(${firstYear}::int,${lastYear}::int) as y`;
    await sql`insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility,source_url,result_source)
      select ${athleteId},ed.id,'finished',5400,'public',${sourceUrl},'Example Timing'
      from editions ed where ed.event_id=${eventId} and extract(year from ed.event_date) between ${firstYear} and ${lastYear}`;
  };
  await addEditions(2005, 2005);
  const single = await get("/races/edition-search-test");
  assert.match(single("#archive-results-heading").text(), /Selected Half performances/);
  assert.match(single("section[aria-labelledby='archive-results-heading'] table").text(), /Synthetic Runner/);
  assert.match(single("main").text(), /Example Timing/);
  const oldestUrl = single("section[aria-labelledby='results-heading'] a").attr("href");
  const oldest = await get(oldestUrl);
  assert.equal(oldest("link[rel=canonical]").attr("href"), "https://www.athrecs.com" + oldestUrl);
  await addEditions(2006, 2026);
  const hub = await get("/races/edition-search-test");
  const section = hub("section[aria-labelledby='results-heading']");
  assert.equal(section.find("a[href^='/results/']").length, 22);
  assert.equal(section.find("details a").length, 10, "Older links are in the initial server-rendered HTML");
  assert.equal(section.find("details a").last().attr("href"), oldestUrl);
  const mainSearch = await get("/search?q=Synthetic+Archive+Half+Marathon");
  assert.equal(mainSearch("#search-results li a").length, 8);
  const all = await get(mainSearch("#search-results a").first().attr("href"));
  assert.equal(all("a[href^='/results/']").filter((_, e) => /Synthetic Archive Half Marathon/.test(all(e).text())).length, 22);
  const datedSearch = await get("/search?q=Synthetic+Archive+Half+Marathon+2005");
  assert.equal(datedSearch("#search-results li a").length, 1);
  assert.equal(datedSearch("#search-results li a").attr("href"), oldestUrl);
  const missing = await get("/search?q=Synthetic+Archive+Half+Marathon+2002");
  assert.match(missing("#search-results").text(), /No published editions/);
  console.log("PASS: 22 native editions are linked in race hub HTML and from results search, with a bounded main search, exact year matches and backend-only evidence URLs.");
} finally {
  await server.close();
  await database?.close();
}
