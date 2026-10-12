import assert from "node:assert/strict";
import { createServer } from "vite";
import { load } from "cheerio";

// Exercise the actual anonymous route with synthetic records, without a catalogue import.
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[key] = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18244";
const server = await createServer({ server: { host: "127.0.0.1", port: 18244, strictPort: true } });
let database;
try {
  await server.listen();
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await sql.query(`insert into athletes(slug,display_name,profile_visibility)
    select 'search-example-'||n,'Search Example '||lpad(n::text,2,'0'),'public' from generate_series(1,26) n`);
  await sql.query(`insert into network_audit_log(action,entity_type,entity_id,after_value)
    select 'athlete.bulk_publish','athlete',id::text,'{"profile_visibility":"public"}'::jsonb
    from athletes where slug like 'search-example-%'`);
  await sql.query(`insert into athletes(slug,display_name,profile_visibility)
    values('search-private','Search Private Identity','private')`);
  const get = async (path) => {
    const response = await fetch(origin + path, { redirect: "manual" });
    const html = await response.text();
    return { response, html, $: load(html) };
  };
  const first = await get("/athletes?letter=S");
  assert.equal(first.response.status, 200);
  assert.equal(first.$("meta[name=robots]").attr("content"), "index, follow");
  assert.equal(first.$("form[role=search]").attr("method"), "get");
  assert.equal(first.$("form[role=search]").attr("action"), "/athletes");
  assert.equal(first.$("a[rel=next]").attr("href"), "/athletes?letter=S&page=2");
  assert(!first.html.includes("Search Private Identity"));
  const second = await get("/athletes?letter=S&page=2");
  assert.equal(second.response.status, 200);
  assert.equal(second.$("a[rel=prev]").attr("href"), "/athletes?letter=S");
  assert.equal(
    second.$("link[rel=canonical]").attr("href"),
    "https://www.athrecs.com/athletes?letter=S&page=2",
  );
  const beyond = await get("/athletes?letter=S&page=999");
  assert.equal(beyond.response.status, 301);
  assert.equal(beyond.response.headers.get("location"), "/athletes?letter=S&page=2");
  const empty = await get("/athletes?letter=Z&page=999");
  assert.equal(empty.response.status, 301);
  assert.equal(empty.response.headers.get("location"), "/athletes?letter=Z");
  console.log(
    "PASS: anonymous A–Z discovery, native GET search, canonical paging, out-of-range redirects and private identity exclusion.",
  );
} finally {
  await server.close();
  await database?.close();
}
