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
    await sql`insert into events(slug,name,sport,country,city,county,surface) values('career-early-marathon','Career Early Marathon','Running','England','Test Town','Test County','Road') returning id`;
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
  await sql`insert into slug_redirects(entity_type,entity_id,old_slug,current_slug)
    values('athlete',${athlete},'career-old-name','career-test-runner'),
      ('athlete',${unapproved},'unapproved-old-name','career-unapproved')`;
  const oldProfile = await fetch(origin + "/athletes/career-old-name", { redirect: "manual" });
  assert.equal(oldProfile.status, 301);
  assert.equal(oldProfile.headers.get("location"), "/athletes/career-test-runner");
  assert.match(oldProfile.headers.get("cache-control"), /private.*no-store/);
  for (const slug of ["career-unapproved", "unapproved-old-name", "missing-test-athlete"]) {
    const unavailable = await fetch(origin + `/athletes/${slug}`, { redirect: "manual" });
    assert.equal(unavailable.status, 404);
    assert.equal(unavailable.headers.get("location"), null);
    const html = await unavailable.text();
    assert(!html.includes("Unapproved Sentinel"));
    assert(html.includes("Sign in to view athlete profiles"));
  }
  const profile = await get("/athletes/career-test-runner");
  assert.equal(profile.response.status, 200);
  assert.equal(profile.$("meta[name=robots]").attr("content"), "index, follow");
  assert.equal(profile.$("#results-history tbody tr").length, 5);
  assert.equal(
    profile.$('a[rel="next"]').attr("href"),
    "/athletes/career-test-runner?resultsPage=2",
  );
  const older = await get("/athletes/career-test-runner?resultsPage=2");
  assert.equal(older.response.status, 200);
  assert.equal(older.$("#results-history tbody tr").length, 3);
  assert.equal(older.$("meta[name=robots]").attr("content"), "index, follow");
  assert.equal(
    older.$("link[rel=canonical]").attr("href"),
    "https://www.athrecs.com/athletes/career-test-runner?resultsPage=2",
  );
  assert.match(older.$("#results-history").text(), /Showing 6–8 of 8/);
  assert(older.$('#results-history a[href="/athletes/career-test-runner"]').length);
  for (const secret of [
    "Private biography sentinel",
    "Private evidence sentinel",
    "Private Race Sentinel",
  ]) {
    assert(!older.html.includes(secret), `Later page leaked ${secret}`);
  }
  const tooFar = await fetch(origin + "/athletes/career-test-runner?resultsPage=999999", {
    redirect: "manual",
  });
  assert.equal(tooFar.status, 301);
  assert.equal(tooFar.headers.get("location"), "/athletes/career-test-runner?resultsPage=2");
  for (const slug of ["career-unapproved", "missing-test-athlete"]) {
    const hiddenPage = await get(`/athletes/${slug}?resultsPage=2`);
    assert.equal(hiddenPage.response.status, 404);
    assert(!hiddenPage.html.includes("Unapproved Sentinel"));
  }
  assert.match(profile.$("#career-summary").text(), /Career Early Marathon/);
  assert.match(profile.$("#career-summary").text(), /2006/);
  assert.match(profile.$("#career-summary").text(), /Unverified record/);
  assert.match(
    profile.$("#profile-overview").text(),
    /Career Early Marathon \(2006; unverified record\)/,
  );
  const profileEntities = profile
    .$('script[type="application/ld+json"]')
    .toArray()
    .map((element) => JSON.parse(profile.$(element).text()));
  const person = profileEntities.find(
    (entity) => entity.mainEntity?.["@type"] === "Person",
  ).mainEntity;
  assert.equal(person.memberOf.name, "Career Test Club");
  assert(profileEntities.some((entity) => entity["@type"] === "BreadcrumbList"));
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
  const raceBio = race.$('section[aria-labelledby="race-biography-heading"]').text();
  assert.match(
    raceBio,
    /Career Early Marathon is a running event in Test Town, Test County, England/,
  );
  assert.match(raceBio, /editions from 2006 to 2013/);
  assert.match(
    race.$('meta[name="description"]').attr("content"),
    /Test Town, Test County, England/,
  );
  const raceEntities = race
    .$('script[type="application/ld+json"]')
    .toArray()
    .map((element) => JSON.parse(race.$(element).text()));
  assert(raceEntities.some((entity) => entity["@type"] === "BreadcrumbList"));
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
  const optedOutRedirect = await fetch(origin + "/athletes/career-old-name", {
    redirect: "manual",
  });
  assert.equal(optedOutRedirect.status, 404);
  assert.equal(optedOutRedirect.headers.get("location"), null);
  assert.equal(
    (await get("/athletes/career-test-runner")).response.status,
    200,
    "An unlisted shared profile remains usable at its direct URL",
  );
  await sql`update athlete_public_shares set search_indexable=true where user_id='career-owner'`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), true);
  const sharedOlder = await fetch(origin + "/athletes/career-test-runner?resultsPage=2", {
    redirect: "manual",
  });
  assert.equal(sharedOlder.status, 301, "Account-owned previews must retain their existing limit");
  assert.equal(sharedOlder.headers.get("location"), "/athletes/career-test-runner");
  await sql`update athlete_public_shares set share_bio=false,share_club=false where user_id='career-owner'`;
  const noBio = await get("/athletes/career-test-runner");
  assert(!noBio.$("#profile-overview").text().includes("Selected recorded events"));
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
  const withdrawnOlder = await get("/athletes/career-test-runner?resultsPage=2");
  assert.equal(withdrawnOlder.response.status, 404);
  assert(!withdrawnOlder.html.includes("Career Early Marathon"));
  await sql`update athlete_public_shares set share_results=true,enabled=false where user_id='career-owner'`;
  assert.equal(await isApprovedAthleteIndexable(sql, athlete), false);
  console.log(
    "PASS: staff-approved profiles enter matching HTML/sitemap/A–Z discovery; career summaries retain five rows; event/club links honour search, biography, club, result and owner opt-outs.",
  );
} finally {
  await server.close();
  await database?.close();
}
