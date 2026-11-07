// Real connector HTTP and directory SQL against disposable, fully migrated PGlite.
// Every athlete/result below is synthetic. External fetches and provider keys are blocked.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { seedReviewedLink } from "./fixtures/reviewed-link.mjs";

Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  XAI_API_KEY: "",
  OPENAI_API_KEY: "",
  NODE_ENV: "test",
  VERCEL_ENV: "",
  VERCEL_PROJECT_PRODUCTION_URL: "",
  VERCEL_GIT_COMMIT_REF: "",
  VITE_AUTH_ENABLED: "false",
  VITE_SITE_BRAND: "athrecs",
  ATHRECS_FIN_ENABLED: "true",
  ATHRECS_FIN_CONNECTOR_SECRET: "synthetic-fin-connector-key-for-local-privacy-tests-only",
  INTERCOM_SECRET_KEY: "synthetic-distinct-messenger-key",
});

const origin = "http://127.0.0.1:18208";
const originalFetch = globalThis.fetch;
const externalRequests = [];
globalThis.fetch = async (input, init) => {
  const target = new URL(input instanceof Request ? input.url : String(input));
  if (target.origin !== origin) {
    externalRequests.push(target.origin);
    throw new Error("The Fin connector test must not call external services");
  }
  return originalFetch(input, init);
};

const assertPrivateHeaders = (response) => {
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
};
const send = (body, authorization = `Bearer ${process.env.ATHRECS_FIN_CONNECTOR_SECRET}`) =>
  fetch(`${origin}/api/fin/actions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify(body),
  });
const expectedFields = [
  "displayName",
  "athleteNumber",
  "profileUrl",
  "city",
  "country",
  "club",
  "sports",
  "publicResultCount",
].sort();

let server;
let database;
try {
  console.log("[fin-profile-search] Starting isolated HTTP server and migration schema");
  server = await createServer({
    server: { host: "127.0.0.1", port: 18208, strictPort: true },
  });
  await server.listen();
  const dbModule = await server.ssrLoadModule("/src/lib/db.ts");
  assert.equal(dbModule.dbSource, "pglite");
  database = await dbModule.getPglite();
  const sql = await dbModule.getSql();
  const { findFinPublicProfiles } = await server.ssrLoadModule(
    "/src/lib/athrecs/fin-actions.server.ts",
  );

  for (const credential of ["", "Bearer incorrect-integration-secret"]) {
    const denied = await send(
      { action: "find_public_profiles", racingName: "Fin Privacyfixture" },
      credential,
    );
    assert.equal(denied.status, 401);
    assertPrivateHeaders(denied);
    assert.deepEqual(await denied.json(), {
      status: "unauthorized",
      message: "Authentication required.",
    });
  }
  assert.equal(
    (await sql`select count(*)::int as count from fin_connector_usage`)[0].count,
    0,
    "Unauthorized HTTP requests never reserve a connector action",
  );
  const wrongMethod = await fetch(`${origin}/api/fin/actions`, { method: "PUT" });
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get("allow"), "POST");
  assertPrivateHeaders(wrongMethod);

  const [club] = await sql`insert into clubs(slug,name)
    values ('fin-privacy-fixture-club','Fin Visible Clubfixture') returning id`;
  const [visible] = await sql`insert into athletes
    (slug,display_name,profile_visibility,club_id,city,country,profile_details)
    values ('fin-privacy-fixture-visible','Fin Privacyfixture Visible','public',${club.id},
      'Fin Visible Townfixture','Ireland',${JSON.stringify({
        privateNote: "FIN-PRIVATE-SOURCE-NOTE",
        sourceUrl: "https://private-evidence.example.test/profile",
        email: "private-athlete@example.test",
        dateOfBirth: "1940-12-31",
      })}::jsonb) returning id`;
  await sql`insert into athletes(slug,display_name,profile_visibility)
    values ('fin-privacy-fixture-private','Fin Privacyfixture Private','private'),
      ('fin-privacy-fixture-unpublished','Fin Privacyfixture Unpublished','private')`;
  for (const label of ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"]) {
    await sql`insert into athletes(slug,display_name,profile_visibility)
      values (${`fin-page-fixture-${label.toLowerCase()}`},${`Fin Pagefixture ${label}`},'public')`;
  }
  await sql`insert into athletes(slug,display_name,profile_visibility)
    values ('fin-page-fixture-hidden','Fin Pagefixture Hidden','private')`;

  const [event] = await sql`insert into events(slug,name,sport,county,city,country)
    values ('fin-discovery-fixture-event','Synthetic Fin Discovery Race','Running','','','Ireland')
    returning id`;
  const [edition] = await sql`insert into editions(event_id,event_date,distance_code,distance_km)
    values (${event.id},'2026-01-01','10K',10) returning id`;
  const [privateEdition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km)
    values (${event.id},'2026-02-01','10K',10) returning id`;
  const [result] = await sql`insert into results
    (edition_id,athlete_id,finish_time_seconds,result_visibility,source_url,result_details)
    values (${edition.id},${visible.id},2700,'public',
      'https://private-evidence.example.test/official-row',
      '{"reviewNote":"FIN-PRIVATE-RESULT-NOTE"}'::jsonb) returning id`;
  await sql`insert into results(edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (${privateEdition.id},${visible.id},2800,'private')`;
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,years_expected,years_captured,performances)
    values (${visible.id},'Synthetic Fin Provider','fin-unpublished-history',
      'https://private-evidence.example.test/unpublished',now(),array[2026],array[2026],
      '[{"date":"2026-03-01","discipline":"Marathon","performance":"3:30:00",
        "sourceUrls":["https://private-evidence.example.test/history-row"]}]'::jsonb)`;

  console.log("[fin-profile-search] Checking public projection and live owner choices");
  const initial = await findFinPublicProfiles(sql, "Fin Privacyfixture");
  assert.equal(initial.status, "possible_profiles");
  assert.equal(initial.scope, "public_directory_search");
  assert.equal(initial.hasMore, false);
  assert.equal(initial.profiles.length, 1);
  const profile = initial.profiles[0];
  assert.deepEqual(Object.keys(profile).sort(), expectedFields);
  assert.equal(profile.displayName, "Fin Privacyfixture Visible");
  assert.equal(profile.profileUrl, "https://www.athrecs.com/athletes/fin-privacy-fixture-visible");
  assert.equal(profile.city, "Fin Visible Townfixture");
  assert.equal(profile.country, "Ireland");
  assert.equal(profile.club, "Fin Visible Clubfixture");
  assert.equal(
    profile.publicResultCount,
    1,
    "Private results and unpublished histories are excluded",
  );
  assert.deepEqual(profile.sports, ["Running"]);
  assert.doesNotMatch(JSON.stringify(initial), /private-evidence|FIN-PRIVATE|1940-12-31|@example/);

  const page = await findFinPublicProfiles(sql, "Fin Pagefixture");
  assert.equal(page.profiles.length, 5);
  assert.equal(page.hasMore, true);
  assert(page.profiles.every((candidate) => !candidate.displayName.includes("Hidden")));
  for (const candidate of page.profiles)
    assert.deepEqual(Object.keys(candidate).sort(), expectedFields);
  const absent = await findFinPublicProfiles(sql, "Fin NoSuchAthleteFixture");
  assert.equal(absent.status, "no_public_profiles");
  assert.deepEqual(absent.profiles, []);
  assert.match(absent.message, /does not mean the athlete has no results/);
  assert.equal((await findFinPublicProfiles(sql, "%Fin Privacyfixture%")).profiles.length, 0);

  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
    values ('fin-profile-owner','Synthetic Owner','fin-owner@example.test',true,now(),now()),
      ('fin-profile-reviewer','Synthetic Reviewer','fin-reviewer@example.test',true,now(),now())`;
  await seedReviewedLink(sql, {
    athleteId: visible.id,
    userId: "fin-profile-owner",
    email: "fin-owner@example.test",
    reviewerId: "fin-profile-reviewer",
    reviewerEmail: "fin-reviewer@example.test",
  });
  await sql`insert into athlete_public_shares(user_id,slug,enabled,share_results)
    values ('fin-profile-owner','fin-profile-owner-share',true,true)`;
  await sql`update athlete_public_shares set share_location=false,share_club=false
    where user_id='fin-profile-owner'`;
  const hiddenFields = await findFinPublicProfiles(sql, "Fin Privacyfixture Visible");
  assert.equal(hiddenFields.profiles.length, 1);
  assert.equal(hiddenFields.profiles[0].city, null);
  assert.equal(hiddenFields.profiles[0].country, null);
  assert.equal(hiddenFields.profiles[0].club, null);
  for (const hiddenQuery of ["Fin Visible Townfixture", "Fin Visible Clubfixture"]) {
    assert.equal((await findFinPublicProfiles(sql, hiddenQuery)).profiles.length, 0);
  }
  await sql`insert into athlete_profile_hidden_results(user_id,result_id)
    values ('fin-profile-owner',${result.id})`;
  const hiddenResult = await findFinPublicProfiles(sql, "Fin Privacyfixture Visible");
  assert.equal(hiddenResult.profiles[0].publicResultCount, 0);
  assert.deepEqual(hiddenResult.profiles[0].sports, []);
  await sql`delete from athlete_profile_hidden_results where user_id='fin-profile-owner'`;
  await sql`update athlete_public_shares set share_results=false where user_id='fin-profile-owner'`;
  assert.equal((await findFinPublicProfiles(sql, "Fin Privacyfixture Visible")).profiles.length, 0);
  await sql`update athlete_public_shares set share_results=true,enabled=false
    where user_id='fin-profile-owner'`;
  assert.equal((await findFinPublicProfiles(sql, "Fin Privacyfixture Visible")).profiles.length, 0);
  await sql`update athlete_public_shares set enabled=true where user_id='fin-profile-owner'`;

  const found = await send({
    action: "find_public_profiles",
    racingName: "Fin Privacyfixture Visible",
  });
  assert.equal(found.status, 200);
  assertPrivateHeaders(found);
  const httpResult = await found.json();
  assert.equal(httpResult.profiles.length, 1);
  assert.equal(httpResult.profiles[0].publicResultCount, 1);
  assert.equal(httpResult.profiles[0].city, null);
  assert.equal(httpResult.profiles[0].club, null);
  assert.deepEqual(Object.keys(httpResult.profiles[0]).sort(), expectedFields);
  assert.doesNotMatch(
    JSON.stringify(httpResult),
    /private-evidence|FIN-PRIVATE|1940-12-31|@example/,
  );
  const link = await send({
    action: "create_signup_link",
    requestId: "fin-http-synthetic-request-0001",
    racingName: "Fin Privacyfixture Visible",
    eventName: "Synthetic Fin Discovery Race",
    year: 2026,
  });
  assert.equal(link.status, 200);
  assertPrivateHeaders(link);
  const signup = await link.json();
  assert.equal(signup.status, "ready");
  assert.match(signup.signupUrl, /^https:\/\/www\.athrecs\.com\/join\?continuation=[\w-]{43}$/);
  assert.doesNotMatch(signup.signupUrl, /Privacyfixture|Synthetic|2026/);
  assert.equal(
    (await sql`select count(*)::int as count from fin_assisted_signups`)[0].count,
    0,
    "A connector link is not a completed registration",
  );
  assert.deepEqual(
    externalRequests,
    [],
    "No model, Intercom, mail or production endpoint was called",
  );
  console.log(
    "Fin public connector passed: real HTTP authentication and methods, bounded directory SQL, public field allowlist, private/unpublished exclusion, live owner choices and opaque signup link.",
  );
} finally {
  await server?.close();
  await database?.close();
  globalThis.fetch = originalFetch;
}
