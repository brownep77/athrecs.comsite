import assert from "node:assert/strict";
import { createServer } from "vite";
import { load } from "cheerio";
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
])
  process.env[key] = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18246";
const server = await createServer({ server: { host: "127.0.0.1", port: 18246, strictPort: true } });
let database;
try {
  await server.listen();
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  // This legacy catalogue table is normally created by the full seed. Keep the
  // production shape, without importing the unrelated global event catalogue.
  await sql.query(`create table if not exists event_groups (
    event_id int not null references events(id), group_code text not null,
    label text not null, level text not null, source_url text not null,
    checked_at date not null, note text not null default '',
    primary key(event_id, group_code))`);
  await sql.query("alter table edition_entry_options add column if not exists notes text");
  const { isApprovedAthleteIndexable } = await server.ssrLoadModule(
    "/src/lib/athrecs/athlete-search-policy.server.ts",
  );
  const { readEventAthleteLinks } = await server.ssrLoadModule(
    "/src/lib/athrecs/event-athlete-discovery.server.ts",
  );
  const [{ id: club }] =
    await sql`insert into clubs(slug,name,city,country) values('career-test-club','Career Test Club','Test Town','England') returning id`;
  const [{ id: athlete }] =
    await sql`insert into athletes(slug,display_name,profile_visibility,club_id,bio) values('career-test-runner','Career Test Runner','public',${club},'Private biography sentinel') returning id`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), false);
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value) values('athlete.profile_admin_published','athlete',${String(athlete)},${JSON.stringify({ athleteId: athlete, profile_visibility: "public" })}::jsonb)`;
  assert.equal(
    await isApprovedAthleteIndexable(sql, athlete),
    true,
    "Existing staff publication qualifies without result verification or account ownership",
  );
  const [{ id: event }] =
    await sql`insert into events(slug,name,sport,country,city,surface) values('career-early-marathon','Career Early Marathon','Running','England','Test Town','Road') returning id`;
  for (let n = 0; n < 8; n++) {
    const [{ id: edition }] =
      await sql`insert into editions(event_id,event_date,distance_code,distance_km) values(${event},${`${2006 + n}-04-01`},'Marathon',42.195) returning id`;
    await sql`insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility,result_details) values(${athlete},${edition},'finished',${15599 + n},'public','{"verificationStatus":"unverified","note":"Private evidence sentinel"}'::jsonb)`;
  }
  const [{ id: hiddenEvent }] =
    await sql`insert into events(slug,name,sport,country,city,surface) values('career-hidden-race','Private Race Sentinel','Running','England','Secret City','Road') returning id`;
  const [{ id: hiddenEdition }] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km) values(${hiddenEvent},'2000-01-01','10K',10) returning id`;
  await sql`insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility) values(${athlete},${hiddenEdition},'finished',1777,'private')`;
  const [{ id: unapproved }] =
    await sql`insert into athletes(slug,display_name,profile_visibility,club_id) values('career-unapproved','Unapproved Sentinel','public',${club}) returning id`;
  await sql`insert into results(athlete_id,edition_id,status,result_visibility) values(${unapproved},${hiddenEdition},'finished','public')`;
  const get = async (path) => {
    const response = await fetch(origin + path);
    const html = await response.text();
    return { response, html, $: load(html) };
  };
  const profile = await get("/athletes/career-test-runner");
  assert.equal(profile.response.status, 200);
  assert.equal(profile.$("meta[name=robots]").attr("content"), "index, follow");
  assert.equal(profile.$("#results-history tbody tr").length, 5);
  assert.match(profile.$("#career-summary").text(), /Career Early Marathon/);
  assert.match(profile.$("#career-summary").text(), /2006/);
  assert.match(profile.$("#career-summary").text(), /Unverified record/);
  assert.equal(profile.$('a[href="/clubs/career-test-club"]').length, 1);
  assert(
    profile
      .$("button")
      .toArray()
      .some((e) => profile.$(e).text().includes("Copy link")),
  );
  for (const secret of [
    "Private biography sentinel",
    "Private evidence sentinel",
    "Private Race Sentinel",
    "15599",
  ])
    assert(!profile.html.includes(secret), secret);
  const sitemap = await get("/sitemaps/athletes-1.xml");
  assert(sitemap.html.includes("/athletes/career-test-runner</loc>"));
  assert(!sitemap.html.includes("/athletes/career-unapproved</loc>"));
  const directory = await get("/athletes?letter=C");
  assert(directory.$('a[href="/athletes/career-test-runner"]').length > 0);
  assert(!directory.html.includes("Unapproved Sentinel"));
  const clubPage = await get("/clubs/career-test-club");
  assert(clubPage.$('a[href="/athletes/career-test-runner"]').length > 0);
  assert(!clubPage.html.includes("Unapproved Sentinel"));
  assert.deepEqual(await readEventAthleteLinks(sql, "career-early-marathon"), [
    { slug: "career-test-runner", name: "Career Test Runner" },
  ]);
  assert.deepEqual(await readEventAthleteLinks(sql, "career-hidden-race"), []);
  const race = await get("/races/career-early-marathon");
  assert.equal(race.response.status, 200, race.$("main").text().slice(0, 200));
  assert(
    race.$(
      'section[aria-labelledby="event-athletes-heading"] a[href="/athletes/career-test-runner"]',
    ).length > 0,
  );
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('career-owner','Career Test Runner','career-owner@example.test',true,now(),now())`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${athlete},'career-owner','career-owner@example.test','active')`;
  assert.equal(
    await isApprovedAthleteIndexable(sql, athlete),
    false,
    "An account without sharing consent is excluded",
  );
  assert.deepEqual(await readEventAthleteLinks(sql, "career-early-marathon"), []);
  await sql`insert into athlete_public_shares(user_id,slug,enabled,share_results,share_bio,share_club,share_location,search_indexable) values('career-owner','career-test-runner',true,true,true,true,true,false)`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), false, "Search opt-out wins");
  await sql`update athlete_public_shares set search_indexable=true where user_id='career-owner'`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), true);
  await sql`update athlete_public_shares set share_bio=false,share_club=false where user_id='career-owner'`;
  const noBio = await get("/athletes/career-test-runner");
  assert.equal(
    noBio.$("#career-summary").length,
    0,
    "Hidden biography also hides its career extension",
  );
  assert.equal(noBio.$('a[href="/clubs/career-test-club"]').length, 0);
  assert(!(await get("/clubs/career-test-club")).html.includes("Career Test Runner"));
  await sql`update athlete_public_shares set share_results=false where user_id='career-owner'`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), false);
  assert.deepEqual(await readEventAthleteLinks(sql, "career-early-marathon"), []);
  await sql`update athlete_public_shares set share_results=true,enabled=false where user_id='career-owner'`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), false);
  console.log(
    "PASS: staff-approved profiles enter matching HTML/sitemap/A–Z discovery; career summaries retain five rows; event/club links honour search, biography, club, result and owner opt-outs.",
  );
} finally {
  await server.close();
  await database?.close();
}
