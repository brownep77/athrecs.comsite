import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  athleteSitemapPageCount,
  athleteSitemapSlugs,
  sitemapXml,
} from "../src/lib/athrecs/athlete-sitemap.server.ts";

const db = new PGlite();
const sql = { query: async (query, values) => (await db.query(query, values)).rows };
try {
  await db.exec(`
    create table athletes (id int primary key, slug text, profile_type text, profile_visibility text);
    create table athlete_account_links (athlete_id int, status text);
    insert into athletes select i, 'athlete-' || i, 'Athlete', 'public' from generate_series(1, 5001) i;
    insert into athletes values
      (5002, 'private-source', 'Athlete', 'private'),
      (5003, 'public-figure', 'Public figure', 'private'),
      (5004, 'account-private', 'Athlete', 'public'),
      (5005, 'unlisted-account', 'Athlete', 'public'),
      (5006, 'released-source', 'Athlete', 'public');
    insert into athlete_account_links values (5004, 'active'), (5005, 'active'), (5006, 'revoked');
  `);
  assert.equal(await athleteSitemapPageCount(sql), 2);
  const first = await athleteSitemapSlugs(sql, 1);
  const second = await athleteSitemapSlugs(sql, 2);
  assert.equal(first.length, 5000);
  assert.deepEqual(second, ["athlete-5001", "public-figure", "released-source"]);
  assert.equal(new Set([...first, ...second]).size, 5003);
  assert.deepEqual(await athleteSitemapSlugs(sql, 3), []);
  assert.deepEqual(await athleteSitemapSlugs(sql, 0), []);
  await db.exec("update athletes set profile_visibility='private' where id = 5001");
  assert(
    !(await athleteSitemapSlugs(sql, 2)).includes("athlete-5001"),
    "Privacy changes apply immediately",
  );
  await db.exec("update athletes set profile_visibility='public' where id = 5002");
  assert(
    (await athleteSitemapSlugs(sql, 2)).includes("private-source"),
    "New publications need no rebuild",
  );
  assert.match(sitemapXml(["https://example.test/a?x=1&y=2"]), /x=1&amp;y=2/);
  assert.match(sitemapXml(["https://example.test/sitemaps/athletes-1.xml"], true), /<sitemapindex/);
  console.log(
    "Athlete sitemap passed: all pages, public figures, publication/privacy changes, account exclusions and valid XML escaping.",
  );
} finally {
  await db.close();
}
