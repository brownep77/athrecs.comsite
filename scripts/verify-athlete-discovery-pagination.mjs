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
  const { readAthleteDirectoryPage } = await server.ssrLoadModule(
    "/src/lib/athrecs/athlete-directory-page.server.ts",
  );
  const [identified] = await sql.query(`select a.id, i.athlete_number from athletes a
    join athlete_resolved_ids i on i.athlete_id=a.id where a.slug='search-example-1'`);
  const byNumber = await readAthleteDirectoryPage(sql, {
    q: `ATH-${String(identified.athlete_number).padStart(6, "0")}`,
  });
  assert.equal(
    byNumber.total,
    1,
    "Moving identifier hydration after pagination preserves athlete-number search",
  );
  assert.equal(byNumber.athletes[0].id, identified.id);
  const matches = await readAthleteDirectoryPage(sql, { q: "Search Example" });
  assert.equal(matches.athletes.length, 24);
  assert.equal(matches.total, null, "The first page does not count the whole catalogue");
  assert.equal(matches.hasMore, true);
  const lastMatches = await readAthleteDirectoryPage(sql, { q: "Search Example", page: 2 });
  assert.equal(lastMatches.athletes.length, 2);
  assert.equal(lastMatches.total, 26);
  assert.equal(lastMatches.hasMore, false);
  assert.equal((await readAthleteDirectoryPage(sql, { q: "Search Private" })).total, 0);
  assert.equal((await readAthleteDirectoryPage(sql, { q: "ATH-9999999999999999999" })).total, 0);
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
  await sql.query(`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values
    ('directory-private-fields','Synthetic owner','directory-private-fields@example.test',true,now(),now())`);
  const [{ id: clubId }] = await sql.query(`insert into clubs(slug,name)
    values ('directory-hidden-club','HiddenClubToken') returning id`);
  const [{ id: athleteId }] = await sql.query(
    `insert into athletes(slug,display_name,profile_visibility,city,country,club_id)
    values ('directory-private-fields','Literal 100%_ Runner','public','HiddenCityToken','Ireland',$1) returning id`,
    [clubId],
  );
  await sql.query(
    `insert into athlete_account_links(athlete_id,user_id,user_email,status)
    values ($1,'directory-private-fields','directory-private-fields@example.test','active')`,
    [athleteId],
  );
  await sql.query(`insert into athlete_public_shares(user_id,slug,enabled,share_results,search_indexable,share_club,share_location)
    values ('directory-private-fields','directory-private-fields',true,true,true,false,false)`);
  const literal = await readAthleteDirectoryPage(sql, { q: "100%_" });
  assert.deepEqual(
    literal.athletes.map((a) => a.id),
    [athleteId],
    "Search treats LIKE wildcards literally",
  );
  assert.equal(literal.athletes[0].city, null);
  assert.equal(literal.athletes[0].club, null);
  assert.equal(literal.athletes[0].country, "");
  for (const q of ["HiddenCityToken", "HiddenClubToken"]) {
    assert.equal(
      (await readAthleteDirectoryPage(sql, { q })).athletes.length,
      0,
      "Search candidates never disclose hidden location or club fields",
    );
  }
  assert(
    !(await readAthleteDirectoryPage(sql, { country: "Ireland" })).athletes.some(
      (a) => a.id === athleteId,
    ),
  );
  await sql.query(
    `update athlete_public_shares set enabled=false where user_id='directory-private-fields'`,
  );
  assert.equal(
    (await readAthleteDirectoryPage(sql, { q: "100%_" })).athletes.length,
    0,
    "Withdrawal takes effect on the next uncached query",
  );
  console.log(
    "PASS: anonymous A–Z discovery, native GET search, canonical paging, out-of-range redirects and private identity exclusion.",
  );
} finally {
  await server.close();
  await database?.close();
}
