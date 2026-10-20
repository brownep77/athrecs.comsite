import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import * as cheerio from "cheerio";
fs.mkdirSync("artifacts", { recursive: true });
// Entirely local synthetic SQL. No external database connection is created.
process.env.DATABASE_URL = "postgresql://synthetic:synthetic@127.0.0.1:1/unused";
const db = new PGlite();
await db.exec(`create table events(id int, slug text, name text, sport text, country text, county text, region text, city text, summary text, featured boolean);
create table editions(event_id int, event_date date, distance_code text, status text, end_date date, end_source_url text, end_checked_at date);
create table event_groups(event_id int,level text);
create table slug_redirects(entity_type text, old_slug text, current_slug text);
insert into events values (1,'synthetic-race','Synthetic Norfolk 10K','Running','England','Norfolk',null,'Norwich','Fictional test race, with no live entries.',true),
(2,'synthetic-past','Synthetic Past Race','Running','England','Norfolk',null,'Norwich','Fictional archived event.',false);
insert into editions values (1,'2040-05-01','10K','Open',null,null,null),(2,'2025-01-01','Half','Finished',null,null,null);
alter table editions add column entry_url text;
update editions set entry_url='https://example.org/synthetic-entry' where event_id=1;`);
await db.exec(`insert into events values
  (3,'synthetic-wymondham','Synthetic Wymondham 10K','Running','England','Norfolk',null,'Wymondham','Fictional test event.',false),
  (4,'synthetic-triathlon','Synthetic Triathlon','Triathlon','England','Norfolk',null,'Norwich','Fictional multisport event.',false);
  insert into editions(event_id,event_date,distance_code,status) values
  (3,'2040-06-01','10K','Open'),(4,'2040-05-01','10K','Open');
  insert into events select id,'synthetic-extra-'||id,'Synthetic Extra '||id,'Running','England','Norfolk',null,'Norwich','Fictional pagination event.',false from generate_series(10,40) id;
  insert into editions(event_id,event_date,distance_code,status) select id,'2040-07-01','10K','Closed' from generate_series(10,40) id;`);
const sql = async (strings, ...values) => {
  let query = strings[0];
  for (let i = 0; i < values.length; i++) query += `$${i + 1}` + strings[i + 1];
  return (await db.query(query, values)).rows;
};
sql.query = async (query, values) => (await db.query(query, values)).rows;
sql.transaction = async (fn) => fn(sql);
globalThis.__pgSqlPromise__ = Promise.resolve(sql);
globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
const { default: app } = await import("../.vercel/output/functions/__server.func/index.mjs");
const root = "/races/places";
for (const path of [
  root,
  `${root}/europe`,
  `${root}/europe/united-kingdom/england/norfolk`,
  `${root}/antarctica`,
  `${root}/europe/united-kingdom/england/norfolk?view=archive`,
  `${root}/europe/united-kingdom/england/norfolk/running`,
  `${root}/europe/united-kingdom/england/norfolk/running/10k`,
  `${root}/europe/united-kingdom/england/norfolk/running/10k?month=2040-06&city=Wymondham`,
  `${root}/europe/united-kingdom/england/norfolk/running/10k?page=2`,
]) {
  const response = await app.fetch(new Request(`https://www.athrecs.com${path}`));
  const html = await response.text();
  assert.equal(response.status, 200, `${path}: ${html.slice(0, 200)}`);
  const $ = cheerio.load(html);
  assert.equal($("main h1").length, 1, path);
  assert($("link[rel=canonical]").attr("href").includes(path), path);
  if (path.includes("antarctica"))
    assert($("meta[name=robots]").attr("content").startsWith("noindex"));
  else if (!path.includes("archive") && !path.includes("?"))
    assert($("main").text().includes("Synthetic Norfolk 10K"));
  if (path.includes("norfolk") && !path.includes("?")) {
    assert(
      $("#race-questions-heading").length,
      "runner questions must be present in server-rendered HTML",
    );
    assert(
      $("main").text().includes("1 May 2040"),
      "date answer must be readable without client JavaScript",
    );
    if (!path.endsWith("/10k"))
      assert($("main").text().includes("Upcoming running events include 10K races."));
    assert($("main h1").text().includes("Norfolk, England"));
  }
  if (path.includes("/running")) {
    assert(!$("main article h3").text().includes("Synthetic Triathlon"));
    assert.equal($("form").filter('[aria-label="Filter race calendar"]').attr("method"), "get");
    assert(
      $("meta[name=robots]")
        .attr("content")
        .startsWith(path.includes("month=") ? "noindex" : "index"),
    );
  }
  if (path.includes("month=")) {
    assert($("main article h3").text().includes("Synthetic Wymondham 10K"));
    assert(!$("main article h3").text().includes("Synthetic Norfolk 10K"));
  }
  for (const script of $('script[type="application/ld+json"]').toArray())
    JSON.parse($(script).html());
  fs.writeFileSync(
    `artifacts/places-ssr-${path.includes("norfolk") ? (path.includes("archive") ? "archive" : "norfolk") : path.split("/").at(-1)}.html`,
    html,
  );
  console.log(response.status, path, $("title").text());
}
for (const path of [
  `${root}/europe/unknown`,
  `${root}/europe/united-kingdom/england/norfolk?page=999`,
  `${root}/europe/united-kingdom/england/norfolk/running/not-a-distance`,
  `${root}/europe/united-kingdom/england/norfolk/triathlon/10k`,
]) {
  const response = await app.fetch(new Request(`https://www.athrecs.com${path}`));
  assert.equal(response.status, 404, path);
  console.log(response.status, path);
}
const sitemap = await app.fetch(new Request("https://www.athrecs.com/sitemaps/race-places.xml"));
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
assert(xml.includes("/europe/united-kingdom/england/norfolk"));
assert(!xml.includes("/antarctica"));
assert(xml.includes("/norfolk/running/10k"));
assert(!xml.includes("/norfolk/triathlon</loc>"), "small sport pages stay outside sitemap");
console.log("Built SSR route → server function → local SQL → HTML/metadata/sitemap checks passed.");
if (process.argv.includes("--browser")) {
  const { createServer } = await import("node:http");
  const { resolve, extname } = await import("node:path");
  const { chromium } = await import("playwright");
  const staticRoot = resolve(".vercel/output/static");
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const file = resolve(staticRoot, `.${decodeURIComponent(url.pathname)}`);
      if (file.startsWith(`${staticRoot}/`) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const mime = {
          ".js": "application/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".png": "image/png",
          ".woff2": "font/woff2",
        };
        res.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
        res.end(fs.readFileSync(file));
        return;
      }
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const response = await app.fetch(
        new Request(url, {
          method: req.method,
          headers: req.headers,
          ...(["GET", "HEAD"].includes(req.method) ? {} : { body: Buffer.concat(chunks) }),
        }),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/*", (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      );
      const base = `${origin}${root}/europe/united-kingdom/england/norfolk`;
      await page.goto(base);
      await page
        .getByRole("navigation", { name: "Sports and running distances" })
        .getByRole("link", { name: "Running", exact: true })
        .click();
      await page.waitForURL("**/norfolk/running");
      await page
        .getByRole("navigation", { name: "Sports and running distances" })
        .getByRole("link", { name: "10K", exact: true })
        .click();
      await page.waitForURL("**/running/10k");
      assert.equal(
        await page.getByRole("heading", { name: "Synthetic Triathlon", exact: true }).count(),
        0,
      );
      await page.getByLabel("Month", { exact: true }).selectOption("2040-06");
      await page.getByLabel("Town or city", { exact: true }).selectOption("Wymondham");
      await page.getByRole("button", { name: "Find races", exact: true }).click();
      await page.waitForURL("**/*month=2040-06*city=Wymondham*");
      await page.getByRole("heading", { name: "Synthetic Wymondham 10K", exact: true }).waitFor();
      assert.equal(
        await page.getByRole("heading", { name: "Synthetic Norfolk 10K", exact: true }).count(),
        0,
      );
      await page.getByRole("link", { name: "Clear filters", exact: true }).click();
      await page.waitForURL("**/running/10k");
      await page
        .getByRole("navigation", { name: "Race pages", exact: true })
        .getByRole("link", { name: "Next" })
        .click();
      await page.waitForURL("**/*page=2");
      assert.equal(await page.locator("main h1").count(), 1);
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        `${width}px: no horizontal overflow`,
      );
      await page.screenshot({ path: `artifacts/race-place-${width}.png`, fullPage: true });
      assert.deepEqual(errors, [], `${width}px: browser runtime errors`);
      await page.close();
    }
    console.log(
      "Desktop and mobile browser checks passed: sport/distance links, month/town form, reset, pagination, no overflow or runtime errors.",
    );
  } finally {
    await browser.close();
    server.close();
  }
}
await db.close();
