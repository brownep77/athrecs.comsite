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
  await sql.query(`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    select id,'Synthetic sport source',slug,'https://example.test/sports',now(),false,array[]::int[],array[]::int[],
      '[{"discipline":"10K"}]'::jsonb,now() from athletes where slug like 'search-example-%'`);
  const running = await readAthleteDirectoryPage(sql, { sport: "Running" });
  assert.equal(running.athletes.length, 24);
  assert.equal(running.hasMore, true);
  assert.equal(running.total, null);
  assert(running.athletes.every((a) => a.sports.includes("Running")));
  const runningPage = await get("/athletes?sport=Running&page=2");
  assert.equal(runningPage.response.status, 200);
  assert.equal(runningPage.$("meta[name=robots]").attr("content"), "noindex, follow");
  assert.equal(runningPage.$("a[rel=prev]").attr("href"), "/athletes?sport=Running");
  assert.match(runningPage.response.headers.get("server-timing"), /athlete_directory/);
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Swimming" })).total, 0);
  for (const [sport, discipline] of [
    ["Triathlon", "Triathlon"],
    ["Duathlon", "Duathlon"],
    ["Athletics", "Long jump"],
    ["Parkrun", "5 km parkrun"],
    ["Running", "10KXC"],
    ["Running", "10 Kilometres Road"],
    ["Swimming", "Swimming"],
    ["Cycling", "Cycling"],
  ]) {
    await sql.query(
      `update athlete_source_histories set performances=jsonb_build_array(jsonb_build_object('discipline',$1::text))
      where external_id='search-example-1'`,
      [discipline],
    );
    const match = await readAthleteDirectoryPage(sql, { sport, q: "Search Example 01" });
    assert.equal(match.total, 1);
    assert.deepEqual(match.athletes[0].sports, [sport]);
  }
  await sql.query(`update athlete_source_histories set performances='[{"discipline":"Senior"}]'::jsonb
    where external_id='search-example-1'`);
  const unclassified = await readAthleteDirectoryPage(sql, { q: "Search Example 01" });
  assert.deepEqual(unclassified.athletes[0].sports, [], "An unknown category is not Athletics");
  assert.equal(unclassified.athletes[0].result_count, 1, "Classification must preserve the result");
  await sql.query(
    `update athlete_source_histories set published_at=null where external_id='search-example-1'`,
  );
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Athletics" })).total, 0);
  await sql.query(`update athlete_source_histories set performances='[{"discipline":"10KXC"}]'::jsonb
    where external_id='search-example-1'`);
  const { loadStaffDirectoryPage } = await server.ssrLoadModule(
    "/src/lib/athrecs/staff-athlete-directory-page.server.ts",
  );
  const staffHistory = await loadStaffDirectoryPage(sql, {
    q: "Search Example 01",
    sport: "Running",
    visibility: "",
    page: 1,
  });
  assert.equal(staffHistory.total, 1, "Staff can classify unpublished source histories");
  assert(staffHistory.sports.includes("Running"));
  assert.equal(
    (await readAthleteDirectoryPage(sql, { sport: "Running", q: "Search Example 01" })).total,
    0,
    "Using unpublished history in staff search must not publish it",
  );
  const outOfRangeSport = await get("/athletes?sport=Running&page=999");
  assert.equal(outOfRangeSport.response.status, 301);
  assert.equal(outOfRangeSport.response.headers.get("location"), "/athletes?sport=Running&page=2");

  await sql.query(
    `update athlete_public_shares set enabled=true where user_id='directory-private-fields'`,
  );
  await sql.query(
    `insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values ($1,'Synthetic private sport source','owned-sports','https://example.test/sports',now(),false,array[]::int[],array[]::int[],
      '[{"discipline":"Triathlon"},{"discipline":"10K","archiveReference":{"sourceRow":"one"}}]'::jsonb,now())`,
    [athleteId],
  );
  await sql.query(
    `insert into network_audit_log(action,entity_type,entity_id,after_value)
    values ('athlete.history_admin_published','athlete','Synthetic private sport source:owned-sports',jsonb_build_object('athleteId',$1::text))`,
    [String(athleteId)],
  );
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Triathlon", q: "100%_" })).total, 1);
  await sql.query(`insert into athlete_profile_history_choices(user_id,athlete_id,provider,external_id,performance_hash,excluded)
    select 'directory-private-fields',athlete_id,provider,external_id,md5((performances->0)::text),true
    from athlete_source_histories where external_id='owned-sports'`);
  assert.equal(
    (await readAthleteDirectoryPage(sql, { sport: "Triathlon", q: "100%_" })).total,
    0,
    "An owner-excluded history cannot make a sport discoverable",
  );
  const [{ id: sourceId }] = await sql.query(
    `insert into source_history_claim_results
    (athlete_id,provider,external_id,source_key,source_url,performance)
    values ($1,'Synthetic private sport source','owned-sports','one','https://example.test/sports','{}') returning id`,
    [athleteId],
  );
  await sql.query(
    `insert into athlete_profile_hidden_source_results(user_id,source_result_id)
    values ('directory-private-fields',$1)`,
    [sourceId],
  );
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Running", q: "100%_" })).total, 0);
  const hiddenSports = await readAthleteDirectoryPage(sql, { q: "100%_" });
  assert.equal(hiddenSports.athletes[0].result_count, 0);
  assert.deepEqual(hiddenSports.athletes[0].sports, []);
  const [{ id: eventId }] =
    await sql.query(`insert into events(slug,name,sport,country,city,surface)
    values ('synthetic-directory-cycle','Synthetic cycle','Cycling','','','Road') returning id`);
  const [{ id: editionId }] = await sql.query(
    `insert into editions(event_id,event_date,distance_code,distance_km,status)
    values ($1,'2026-01-01','10K',10,'Finished') returning id`,
    [eventId],
  );
  const [{ id: resultId }] = await sql.query(
    `insert into results(athlete_id,edition_id,status,result_visibility)
    values ($1,$2,'finished','public') returning id`,
    [athleteId, editionId],
  );
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Cycling" })).total, 1);
  await sql.query(
    `insert into athlete_profile_hidden_results(user_id,result_id) values ('directory-private-fields',$1)`,
    [resultId],
  );
  assert.equal((await readAthleteDirectoryPage(sql, { sport: "Cycling" })).total, 0);
  await sql.query(`insert into athletes(slug,display_name,profile_visibility,profile_details)
    values ('evidence-example','Evidence Example','public',
      '{"powerOf10Ranking20260917":{"provider":"powerof10","rankingTitle":"10K Overall Men 2026","sourceUrl":"https://www.powerof10.uk/Home/Athlete/private-evidence-token"}}'),
      ('evidence-private','Evidence Private','private',
      '{"publication_approved":true,"user_supplied_sports":["Swimming"]}')`);
  const evidence = await readAthleteDirectoryPage(sql, { sport: "Running", q: "Evidence Example" });
  assert.equal(evidence.total, 1);
  assert.deepEqual(evidence.athletes[0].sports, ["Running"]);
  assert.equal(evidence.athletes[0].result_count, 0, "Ranking evidence is not an invented result");
  assert(
    !JSON.stringify(evidence).includes("private-evidence-token"),
    "Classification never exposes its source evidence",
  );
  const evidenceWithoutQuery = await readAthleteDirectoryPage(sql, {
    sport: "Running",
    pageSize: 100,
  });
  assert(
    evidenceWithoutQuery.athletes.some((a) => a.slug === "evidence-example"),
    "Sport candidate index includes metadata-only evidence",
  );
  assert.equal(
    (await readAthleteDirectoryPage(sql, { sport: "Swimming", q: "Evidence Private" })).total,
    0,
  );
  await sql.query(
    `update athletes set profile_details='{"publication_approved":true,"user_supplied_sports":["Swimming"]}' where id=$1`,
    [athleteId],
  );
  assert.equal(
    (await readAthleteDirectoryPage(sql, { sport: "Swimming", q: "100%_" })).total,
    0,
    "Source metadata cannot override a linked owner's sport controls",
  );
  const staffEvidence = await loadStaffDirectoryPage(sql, {
    q: "Evidence Example",
    sport: "Running",
    visibility: "",
    page: 1,
  });
  assert.equal(staffEvidence.total, 1);
  console.log(
    "PASS: anonymous A–Z discovery, native GET search, canonical paging, out-of-range redirects and private identity exclusion.",
  );
} finally {
  await server.close();
  await database?.close();
}
