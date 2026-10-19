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
insert into editions values (1,'2040-05-01','10K','Open',null,null,null),(2,'2025-01-01','Half','Finished',null,null,null);`);
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
]) {
  const response = await app.fetch(new Request(`https://www.athrecs.com${path}`));
  const html = await response.text();
  assert.equal(response.status, 200, `${path}: ${html.slice(0, 200)}`);
  const $ = cheerio.load(html);
  assert.equal($("main h1").length, 1, path);
  assert($("link[rel=canonical]").attr("href").includes(path), path);
  if (path.includes("antarctica"))
    assert($("meta[name=robots]").attr("content").startsWith("noindex"));
  else if (!path.includes("archive")) assert($("main").text().includes("Synthetic Norfolk 10K"));
  if (path.includes("norfolk") && !path.includes("archive")) {
    assert(
      $("#race-questions-heading").length,
      "runner questions must be present in server-rendered HTML",
    );
    assert(
      $("main").text().includes("1 May 2040"),
      "date answer must be readable without client JavaScript",
    );
    assert($("main").text().includes("Upcoming running events include 10K races."));
    assert($("main h1").text().includes("Norfolk, England"));
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
console.log("Built SSR route → server function → local SQL → HTML/metadata/sitemap checks passed.");
await db.close();
