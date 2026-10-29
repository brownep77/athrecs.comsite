import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { get as httpGet } from "node:http";
import { load } from "cheerio";
import { createRequire } from "node:module";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// Real sessions and HTTP/RPC transport against disposable local PGlite only.
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_STAFF_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
const origin = "http://127.0.0.1:18243";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = "local-profile-view-test-secret-at-least-32-characters";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18243, strictPort: true } });
const modules = new Map();
let database;
async function rpc(file, name, data, token, extra = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const response = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...extra,
      },
      context: {},
    }),
  );
  if (response.error) throw response.error;
  return response.result;
}
async function post(path, body, token) {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}
try {
  await server.listen();
  // These access tests use synthetic profiles, not the production catalogue.
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  assert.equal(await rpc("auth/profile-access", "canViewAthleteProfiles"), false);
  const calls = [
    ["athrecs/api", "listAthletes", {}],
    ["athrecs/api", "getAthleteBySlug", "view-login-fixture"],
    ["athrecs/api", "getAdministratorPublishedAthlete", "view-login-fixture"],
    ["athrecs/api", "getPrivateAthleteBySlug", "view-login-private"],
    [
      "athrecs/athlete-profile-share-api",
      "getPublishedSharedProfile",
      { slug: "view-login-fixture" },
    ],
  ];
  for (const [file, name, data] of calls) {
    await assert.rejects(() => rpc(file, name, data), /Unauthorized/);
    await assert.rejects(() => rpc(file, name, data, "invalid-token"), /Unauthorized/);
  }
  console.log("Anonymous and invalid-token RPCs denied.");
  // The public discovery directory is covered by verify-public-source-profiles.
  // Profiles without explicit publication still require a member session.
  for (const path of ["/athletes/view-login-fixture", "/athletes/ATH-000001"]) {
    const response = await fetch(origin + path);
    const html = await response.text();
    assert.equal(response.status, 404, "Unavailable anonymous profiles must not be soft 404s");
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    assert.match(response.headers.get("x-robots-tag"), /noindex/);
    assert(!html.includes("Restricted Fixture Biography"));
    assert(html.includes("Sign in to view athlete profiles"));
    assert(!html.includes("Explore athlete profiles</h1>"));
    assert(
      !html.includes('application/ld+json">{"@context":"https://schema.org","@type":"ProfilePage'),
    );
  }
  console.log("Anonymous SSR blocked and uncached.");
  const signup = await post("sign-up/email", {
    ...signupDetails("Profile Viewer Test"),
    email: "profile-viewer@example.test",
    password: "Test-only-password-123!",
  });
  assert.equal(signup.status, 200, await signup.clone().text());
  const { token, user } = await signup.json();
  assert(token);
  assert.equal(await rpc("auth/profile-access", "canViewAthleteProfiles", undefined, token), true);
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await rpc("athrecs/api", "listAthletes", {}, token);
  await sql`insert into athletes (slug,display_name,bio,profile_visibility) values ('view-login-fixture','Login Test Athlete','Restricted Fixture Biography','public'),('view-login-private','Private Test Athlete','Owner-only biography','private')`;
  const profile = await rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token);
  assert.equal(profile.athlete.display_name, "Login Test Athlete");
  // A link reader must get a usable sign-in shell, never an error page or a
  // session-backed profile. Browser hydration retries the probe same-origin.
  for (const site of ["cross-site", "same-site"]) {
    const readerHeaders = {
      "sec-fetch-site": site,
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      authorization: `Bearer ${token}`,
    };
    assert.equal(
      await rpc("auth/profile-access", "canViewAthleteProfiles", undefined, token, readerHeaders),
      false,
      "Blocked session probes must not inspect or disclose the signed-in session",
    );
    for (const path of ["/athletes/view-login-fixture"]) {
      const response = await fetch(origin + path, { headers: readerHeaders });
      const html = await response.text();
      assert.equal(response.status, 404);
      assert.match(response.headers.get("cache-control"), /private.*no-store/);
      assert(html.includes("Sign in to view athlete profiles"));
      assert(!html.includes("cross-site request blocked"));
      assert(!html.includes("Something went wrong"));
      assert(!html.includes("Login Test Athlete"));
      assert(!html.includes("Restricted Fixture Biography"));
    }
    await assert.rejects(
      () => rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token, readerHeaders),
      /cross-site/,
    );
  }
  // Node fetch overwrites Sec-Fetch-Mode with cors; raw HTTP preserves the
  // metadata that a browser sends for a real external-link navigation.
  const externalNavigation = await new Promise((resolve, reject) => {
    httpGet(
      origin + "/athletes/view-login-fixture",
      {
        headers: {
          authorization: `Bearer ${token}`,
          "sec-fetch-site": "cross-site",
          "sec-fetch-mode": "navigate",
          "sec-fetch-dest": "document",
        },
      },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve({ status: response.statusCode, body }));
        response.on("error", reject);
      },
    ).on("error", reject);
  });
  assert.equal(externalNavigation.status, 200);
  assert(externalNavigation.body.includes("Login Test Athlete"));
  assert.equal(await rpc("auth/profile-access", "canViewAthleteProfiles", undefined, token), true);
  console.log(
    "Cross-site readers receive a private sign-in shell; navigation and same-origin retry succeed; protected RPCs remain blocked.",
  );
  assert.equal(
    await rpc("athrecs/api", "getAthleteBySlug", "view-login-private", token),
    null,
    "Signing in must not override athlete privacy",
  );
  await assert.rejects(
    () =>
      rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token, {
        "sec-fetch-site": "cross-site",
      }),
    /cross-site/,
  );
  const authHtml = await (
    await fetch(origin + "/athletes/view-login-fixture", {
      headers: { authorization: `Bearer ${token}` },
    })
  ).text();
  assert(authHtml.includes("Login Test Athlete"), "Authenticated SSR receives permitted profile");
  const guestHtml = await (await fetch(origin + "/athletes/view-login-fixture")).text();
  assert(
    !guestHtml.includes("Login Test Athlete"),
    "Authenticated response must not leak to next anonymous request",
  );
  assert.equal((await fetch(origin + "/sitemaps/athletes-1.xml")).status, 404);
  assert((await (await fetch(origin + "/sitemaps/pages.xml")).text()).includes("/athletes</loc>"));
  assert(!(await (await fetch(origin + "/sitemap.xml")).text()).includes("/sitemaps/athletes-"));
  // A deliberately published history is viewable without a session; a public
  // database flag alone does not publish other members' profiles anonymously.
  const publicRead = (slug) => rpc("athrecs/api", "getAdministratorPublishedAthlete", slug, token);
  const previewRead = (slug) => rpc("athrecs/api", "getPublicAthletePreview", slug);
  assert.equal(await publicRead("view-login-fixture"), null);
  const [publishedAthlete] = await sql`insert into athletes
    (slug,display_name,bio,profile_visibility,city,country,date_of_birth,profile_details)
    values ('published-history-fixture','Published History Athlete','Private biography sentinel','public',
      'Private city sentinel','United Kingdom','1980-01-02',
      '{"coach":"Private coach sentinel","birthdayVisibility":"full"}'::jsonb) returning id`;
  await sql`insert into athlete_account_links (athlete_id,user_id,user_email)
    values (${publishedAthlete.id},${user.id},'profile-viewer@example.test')`;
  const performance = {
    year: 2025,
    date: "2025-12-17",
    sourceDate: "17 Dec",
    ageGroup: "",
    discipline: "5K",
    performance: "19:34(19:38)",
    wind: "",
    place: "81",
    venue: "Synthetic park",
    meeting: "Synthetic race",
    sourceUrls: ["https://example.test/result"],
    labels: [],
    verificationStatus: "unverified",
    profileExcluded: false,
  };
  const performances = [
    performance,
    {
      ...performance,
      year: 2026,
      date: "2026-04-26",
      discipline: "Marathon",
      performance: "3:20:14",
      meeting: "Synthetic spring marathon",
    },
    {
      ...performance,
      year: 2010,
      date: "2010-12-12",
      discipline: "60m",
      performance: "7.95i",
      meeting: "Synthetic indoor games",
    },
    {
      ...performance,
      year: 2009,
      date: "2009-09-19",
      discipline: "Long Jump",
      performance: "4.64",
      meeting: "Synthetic field games",
    },
    {
      ...performance,
      year: 2010,
      date: "2010-05-30",
      discipline: "100m",
      performance: "12.63w",
      wind: "2.1",
      meeting: "Synthetic wind-assisted sprint",
    },
    {
      ...performance,
      year: 2009,
      date: "2009-09-19",
      discipline: "Pentathlon U15W",
      performance: "2290",
      meeting: "Synthetic combined events",
    },
    {
      ...performance,
      year: 2012,
      yearLabel: "2011 / 2012",
      date: "",
      dateLabel: "29 Jan · 2011 / 2012",
      discipline: "60m",
      performance: "8.04i",
      meeting: "Synthetic uncertain-year games",
    },
    {
      ...performance,
      year: 2013,
      date: "2013-05-18",
      discipline: "Women 4x100m relay",
      performance: "51.00",
      meeting: "Synthetic relay",
    },
    {
      ...performance,
      year: 2013,
      date: "2013-05-18",
      discipline: "200m",
      performance: "27.65",
      meeting: "Synthetic track games",
    },
    {
      ...performance,
      year: 2007,
      date: "2007-08-25",
      discipline: "Shot 2.72K",
      performance: "5.69",
      meeting: "Synthetic shot put",
    },
  ];
  const [recordedEvent] = await sql`insert into events(slug,name,sport,city,country,surface)
    values ('published-history-marathon','Synthetic city marathon','Running','Synthetic city','United Kingdom','Road') returning id`;
  const [recordedEdition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km)
    values (${recordedEvent.id},'2026-09-27','Marathon',42.195) returning id`;
  await sql`insert into results(athlete_id,edition_id,finish_time_seconds,chip_time_seconds,status,result_visibility,source_url)
    values (${publishedAthlete.id},${recordedEdition.id},11166,11166,'finished','public','https://example.test/recorded-result')`;
  const historyKey = "AthRecs additions:public-history-test";
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values (${publishedAthlete.id},'AthRecs additions','public-history-test','https://example.test/result',
      now(),true,array[2025],array[2025],${JSON.stringify([...performances, { ...performance, performance: "Hidden mark sentinel", profileExcluded: true }])}::jsonb,now())`;
  assert.equal(
    await publicRead("published-history-fixture"),
    null,
    "A history without an approval is not public",
  );
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values (${user.id},'athlete.history_admin_published','athlete_source_history',${historyKey},
      ${JSON.stringify({ athleteId: publishedAthlete.id, athleteConsentRecorded: false })}::jsonb,'Synthetic explicit publication approval')`;
  const publicProfile = await publicRead("published-history-fixture");
  assert(
    !("results" in publicProfile),
    "Public payload must not duplicate profileResults in legacy row form",
  );
  assert.equal(publicProfile.athlete.display_name, "Published History Athlete");
  assert.equal(
    publicProfile.searchIndexable,
    false,
    "An active owner without a sharing choice stays out of search",
  );
  assert.equal(publicProfile.sourceHistories[0].performances.length, 10);
  assert.deepEqual(
    publicProfile.sourceHistories[0].performances[0].sourceUrls,
    [],
    "Member-facing payload omits private evidence",
  );
  for (const secret of [
    "Private biography sentinel",
    "Private city sentinel",
    "Private coach sentinel",
    "1980-01-02",
    "Hidden mark sentinel",
    "profile-viewer@example.test",
  ])
    assert(!JSON.stringify(publicProfile).includes(secret), `Do not disclose ${secret}`);
  assert.deepEqual(publicProfile.upcoming, []);
  assert(!JSON.stringify(publicProfile).includes("https://example.test/result"));
  const [storedHistory] =
    await sql`select performances from athlete_source_histories where athlete_id=${publishedAthlete.id}`;
  assert.deepEqual(
    storedHistory.performances[0].sourceUrls,
    performance.sourceUrls,
    "Original evidence remains stored",
  );
  process.env.ATHRECS_STAFF_EMAILS = "separate-staff@example.test";
  await assert.rejects(
    () =>
      rpc("athrecs/staff-athlete-directory-api", "getStaffAthleteProfile", {
        athleteId: "ATH-000001",
      }),
    /Unauthorized/,
  );
  await assert.rejects(
    () =>
      rpc(
        "athrecs/staff-athlete-directory-api",
        "getStaffAthleteProfile",
        { athleteId: "ATH-000001" },
        token,
      ),
    /Forbidden/,
  );
  process.env.ATHRECS_STAFF_EMAILS = user.email;
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('evidence-google','evidence-google','google',${user.id},now(),now())`;
  const staffProfile = await rpc(
    "athrecs/staff-athlete-directory-api",
    "getStaffAthleteProfile",
    { athleteId: `ATH-${String(publicProfile.athlete.athlete_number).padStart(6, "0")}` },
    token,
  );
  assert(staffProfile, "Staff can open the same athlete");
  assert.deepEqual(
    staffProfile.sourceHistories[0].performances[0].sourceUrls,
    performance.sourceUrls,
    "Authorised staff retain original evidence",
  );
  process.env.ATHRECS_STAFF_EMAILS = "";
  const preview = await previewRead("published-history-fixture");
  assert.equal(preview.entries.length + preview.reportedRecords.length, 5);
  assert.equal(preview.totalResults, 11);
  assert(!JSON.stringify(preview).includes("https://example.test/result"));
  const ownedLaterPage = await rpc("athrecs/api", "getPublicAthletePreview", {
    slug: "published-history-fixture",
    resultPage: 2,
  });
  assert.equal(ownedLaterPage.resultPage, 1, "An existing account link keeps the preview limit");
  const [unclaimed] = await sql`insert into athletes(slug,display_name,profile_visibility)
    values('unclaimed-paged-history','Unclaimed Page Fixture','public') returning id`;
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    select ${unclaimed.id},provider,external_id||'-unclaimed',source_url,captured_at,complete,years_expected,years_captured,performances,published_at
    from athlete_source_histories where athlete_id=${publishedAthlete.id}`;
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value)
    values('athlete.history_admin_published','athlete_source_history',${historyKey + "-unclaimed"},${JSON.stringify({ athleteId: unclaimed.id })}::jsonb)`;
  await sql`insert into results(athlete_id,edition_id,finish_time_seconds,status,result_visibility)
    values(${unclaimed.id},${recordedEdition.id},11166,'finished','public')`;
  const secondPage = await rpc("athrecs/api", "getPublicAthletePreview", {
    slug: "unclaimed-paged-history",
    resultPage: 2,
  });
  const lastPage = await rpc("athrecs/api", "getPublicAthletePreview", {
    slug: "unclaimed-paged-history",
    resultPage: 3,
  });
  assert.equal(secondPage.resultPage, 2);
  assert.equal(secondPage.resultPages, 3);
  assert(
    secondPage.careerSummary.events.every((event) => event.performance),
    "Approved unclaimed career highlights include the already-public performance",
  );
  assert.equal(secondPage.entries.length + secondPage.reportedRecords.length, 5);
  assert.equal(lastPage.entries.length + lastPage.reportedRecords.length, 1);
  for (const page of [secondPage, lastPage]) {
    assert(!JSON.stringify(page).includes("https://example.test/result"));
    assert(!JSON.stringify(page).includes("archiveReference"));
  }
  await sql`update athletes set profile_visibility='private' where id=${unclaimed.id}`;
  assert.equal(
    await rpc("athrecs/api", "getPublicAthletePreview", {
      slug: "unclaimed-paged-history",
      resultPage: 2,
    }),
    null,
    "Withdrawing the profile also withdraws every later result page",
  );
  const { buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  );
  const previewInput = {
    slug: "synthetic",
    displayName: "Synthetic",
    athleteNumber: "1",
    searchIndexable: true,
    results: publicProfile.profileResults,
    histories: publicProfile.sourceHistories,
  };
  assert.equal(
    buildPublicAthletePreview({ ...previewInput, results: [], histories: [] }).entries.length,
    0,
  );
  assert.equal(buildPublicAthletePreview({ ...previewInput, histories: [] }).entries.length, 1);
  const reported = {
    id: "reported-latest",
    event: "Reported latest",
    distance: "5K",
    location: "",
    reportedDate: "2026-10-01",
    reportedTime: "20:00",
    reportedPlace: "",
    uncertainty: "Unverified",
    sources: [],
  };
  const mixed = buildPublicAthletePreview({ ...previewInput, reportedRecords: [reported] });
  assert.equal(
    mixed.entries.length + mixed.reportedRecords.length,
    5,
    "One cap across every source",
  );
  assert.equal(mixed.totalResults, 12);
  assert.equal(mixed.reportedRecords[0].id, "reported-latest");
  const { achievementPalette, ACHIEVEMENT_HUES } = await server.ssrLoadModule(
    "/src/lib/athrecs/achievement-colours.ts",
  );
  const colourKeys = [
    ...Object.keys(ACHIEVEMENT_HUES).flatMap((key) => [`metric:${key}`, `milestone:${key}`]),
    ...Array.from({ length: 300 }, (_, index) => `career:synthetic-${index}`),
  ];
  const colours = achievementPalette(colourKeys);
  assert.equal(
    new Set([...colours.values()].map((value) => value.backgroundColor)).size,
    colourKeys.length,
  );
  assert.deepEqual(
    achievementPalette([...colourKeys].reverse()),
    colours,
    "Colour assignment is independent of card order",
  );

  assert.equal(preview.biography.length, 1);
  assert(!JSON.stringify(preview.entries).includes("Synthetic shot put"));
  assert(!JSON.stringify(preview.careerSummary).includes("5.69"), "Historical marks remain gated");
  for (const auth of [undefined, "invalid-token"])
    await assert.rejects(
      () =>
        rpc("athrecs/api", "getAdministratorPublishedAthlete", "published-history-fixture", auth),
      /Unauthorized/,
    );

  for (const site of ["none", "cross-site", "same-site"]) {
    const response = await fetch(origin + "/athletes/published-history-fixture", {
      headers: { "sec-fetch-site": site, "sec-fetch-mode": "cors", "sec-fetch-dest": "empty" },
    });
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    const $ = load(html);
    assert.equal($("h1").text(), "Published History Athlete");
    assert(!html.includes("Sign in to view athlete profiles"));
    assert(!html.includes("Forbidden: cross-site request blocked"));
    assert.equal($("#performance-history").length, 0, "No separate section for additions");
    assert.equal($("#results-history tbody tr").length, 5);
    assert.equal($("#results-history tr[data-history-result]").length, 4);
    assert($("#results-history h2").text().includes("Latest results"));
    assert($("#results-history tbody tr").first().text().includes("Synthetic city marathon"));
    assert($("#results-history tbody tr").eq(1).text().includes("Synthetic spring marathon"));
    assert($("#results-history").text().includes("19:34(19:38)"));
    assert(
      !JSON.stringify(preview.entries).includes("Synthetic field games"),
      "Older full result rows stay outside the five-result preview",
    );
    assert(!JSON.stringify(preview.entries).includes("Synthetic shot put"));
    assert(preview.careerSummary.events.length <= 6);
    for (const event of preview.careerSummary.events) {
      assert.deepEqual(
        Object.keys(event).sort(),
        ["discipline", "eventSlug", "name", "verification", "year"],
        "Career highlights disclose only selected event facts, not result rows or evidence",
      );
    }
    assert(html.includes("View the full athlete profile"));
    assert($.text().includes("Showing 5 of 11 recorded performances"));
    assert.equal($("#results-history .result-evidence a[href^='https://example.test']").length, 0);
    assert.equal(
      $("#results-history [aria-label='PB']").length,
      0,
      "A preview must not calculate a PB from five rows",
    );
  }
  // Verification changes the label, not the record, its original precision or owner controls.
  const confirmedPerformances = performances.map((row, index) => ({
    ...row,
    country: index === 0 ? "Spain" : "United Kingdom",
    verificationStatus: index === 0 ? "source_verified" : "verified_by_administrator",
  }));
  await sql`update athlete_source_histories set performances=${JSON.stringify([
    ...confirmedPerformances,
    {
      ...performance,
      verificationStatus: "verified_by_administrator",
      performance: "Hidden mark sentinel",
      profileExcluded: true,
    },
  ])}::jsonb where athlete_id=${publishedAthlete.id}`;
  const confirmedProfile = await publicRead("published-history-fixture");
  assert.equal(confirmedProfile.sourceHistories[0].performances.length, 10);
  assert.equal(
    confirmedProfile.sourceHistories[0].performances[0].verificationStatus,
    "source_verified",
  );
  assert.equal(
    confirmedProfile.sourceHistories[0].performances[1].verificationStatus,
    "verified_by_administrator",
  );
  const confirmedHtml = await (
    await fetch(origin + "/athletes/published-history-fixture", {
      headers: { authorization: `Bearer ${token}` },
    })
  ).text();
  const confirmed = load(confirmedHtml);
  const anonymousConfirmed = load(
    await (await fetch(origin + "/athletes/published-history-fixture")).text(),
  );
  assert.equal(
    confirmed("title").text(),
    anonymousConfirmed("title").text(),
    "Member and public metadata use the same approved preview",
  );
  assert.equal(
    confirmed('meta[name="description"]').attr("content"),
    anonymousConfirmed('meta[name="description"]').attr("content"),
  );
  const personSchema = ($) =>
    $('script[type="application/ld+json"]')
      .toArray()
      .map((element) => JSON.parse($(element).text()))
      .find((entity) => entity.mainEntity?.["@type"] === "Person");
  assert.deepEqual(
    personSchema(confirmed),
    personSchema(anonymousConfirmed),
    "Member-only history cannot enter structured data",
  );
  assert.equal(confirmed("#results-history tbody tr").length, 11);
  assert.equal(confirmed("#performance-history").length, 0);
  assert(!confirmed("#results-history tr[data-history-result]").text().includes("Unverified"));
  assert(
    confirmed("#results-history tbody tr").first().text().includes("Unverified"),
    "A recorded result without a verification basis keeps its own Unverified label",
  );
  assert(
    confirmed("#results-history tr[data-history-result] [title^='Completed event']").length > 0,
  );
  assert.equal(
    confirmed("#results-history tr[data-history-result] [data-country-code='ES']").length,
    1,
  );
  assert(confirmed("[aria-label='Achievements board']").text().includes("2Sports completed"));
  assert(confirmed("[aria-label='Achievements board']").text().includes("2Marathons"));
  assert(confirmed("[aria-label='Achievements board']").text().includes("Completed performances"));
  assert(confirmed("#results-history").text().includes("29 Jan · 2011 / 2012"));
  assert.equal(
    confirmed("#results-history .result-evidence a[href^='https://example.test']").length,
    0,
  );
  assert.equal(confirmed("#results-history .result-evidence[open]").length, 0);
  assert.equal(confirmed("#results-history tr[data-history-result] [aria-label='PB']").length, 0);
  if (process.env.ATHRECS_BROWSER_MODULE) {
    const { chromium } = createRequire(import.meta.url)(process.env.ATHRECS_BROWSER_MODULE);
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
    });
    try {
      const checkPerformanceVisibility = async (page) => {
        const cells = await page
          .locator(
            '#results-history td[data-label="Performance"], #results-history td[data-label="Time"]',
          )
          .evaluateAll((elements) =>
            elements.map((element) => {
              const cell = element.getBoundingClientRect();
              const panel = element.closest(".profile-table-wrap").getBoundingClientRect();
              return {
                text: element.textContent.trim(),
                visible:
                  cell.width > 0 &&
                  cell.left >= Math.max(0, panel.left) - 1 &&
                  cell.right <= Math.min(innerWidth, panel.right) + 1,
              };
            }),
          );
        assert(cells.length > 0);
        assert(
          cells.every((cell) => cell.text && cell.visible),
          `Every result time must fit without horizontal scrolling at ${page.viewportSize().width}px`,
        );
      };
      // Update the database while the same page stays open. No navigation,
      // focus event or manual reload may be needed to update its achievements.
      const checkLiveAchievements = async (page) => {
        const [original] = await sql`select performances from athlete_source_histories
          where athlete_id=${publishedAthlete.id} and external_id='public-history-test'`;
        const marathon = page.locator('[data-earned-achievement="marathons"]');
        await marathon.getByText("2 marathons completed", { exact: true }).waitFor();
        const added = {
          ...performance,
          date: "2024-06-01",
          year: 2024,
          discipline: "Marathon",
          performance: "4:00:00",
          meeting: "Synthetic refresh marathon",
          country: "France",
          verificationStatus: "unverified",
        };
        const update = async (rows) => {
          await sql`update athlete_source_histories set performances=${JSON.stringify(rows)}::jsonb
            where athlete_id=${publishedAthlete.id} and external_id='public-history-test'`;
        };
        try {
          await update([...original.performances, added]);
          await page.clock.fastForward(61_000);
          await marathon
            .getByText("3 marathons completed", { exact: true })
            .waitFor({ timeout: 30000 });
          assert((await marathon.innerText()).includes("Awaiting verification"));
          // Excluding a newly added result must also remove its achievement credit.
          await update([...original.performances, { ...added, profileExcluded: true }]);
          await page.clock.fastForward(61_000);
          await marathon
            .getByText("2 marathons completed", { exact: true })
            .waitFor({ timeout: 30000 });
          assert(!(await page.locator("body").innerText()).includes("Private biography sentinel"));
        } finally {
          await update(original.performances);
        }
      };
      const anonymous = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const guest = await anonymous.newPage();
      await guest.clock.install();
      await guest.goto(origin + "/athletes/published-history-fixture", {
        waitUntil: "networkidle",
      });
      assert.equal(await guest.locator("#results-history tbody tr").count(), 5);
      for (const width of [390, 640, 768, 820, 1023, 1365]) {
        await guest.setViewportSize({ width, height: 844 });
        await checkPerformanceVisibility(guest);
      }
      await guest.setViewportSize({ width: 390, height: 844 });
      await checkLiveAchievements(guest);
      await guest
        .getByRole("button", { name: "Sign in or create an account", exact: true })
        .click();
      await guest.getByRole("dialog").waitFor();
      assert.equal(await guest.getByRole("dialog").count(), 1);
      await anonymous.close();
      for (const viewport of [
        { width: 1365, height: 900 },
        { width: 768, height: 900 },
        { width: 390, height: 844 },
      ]) {
        const context = await browser.newContext({
          viewport,
          extraHTTPHeaders: { authorization: `Bearer ${token}` },
        });
        const page = await context.newPage();
        await page.clock.install();
        await page.goto(origin + "/athletes/published-history-fixture", {
          waitUntil: "networkidle",
        });
        await page
          .getByRole("heading", { name: "Published History Athlete", exact: true })
          .waitFor();
        assert.equal(
          await page
            .getByRole("heading", { name: "Sign in to view athlete profiles", exact: true })
            .count(),
          0,
        );
        const history = page.locator("#results-history");
        assert.equal(await history.locator("tbody tr").count(), 11);
        assert(
          !(await history.locator("tr[data-history-result]").allTextContents())
            .join(" ")
            .includes("Unverified"),
        );
        assert.equal(await page.getByText("Show all 11 results", { exact: true }).count(), 0);
        assert.equal(await history.locator("table").count(), 1);
        assert.equal(await history.locator("tbody tr:visible").count(), 11);
        await checkPerformanceVisibility(page);
        assert.equal(
          await history.locator(".result-evidence a[href^='https://example.test']").count(),
          0,
        );
        assert.equal(await history.locator(".result-evidence[open]").count(), 0);
        await page.getByRole("combobox", { name: "Sport", exact: true }).selectOption("Athletics");
        assert.equal(await history.locator("tbody tr").count(), 8);
        assert((await history.innerText()).includes("4.64 m"));
        await page.getByRole("combobox", { name: "Year", exact: true }).selectOption("2011 / 2012");
        assert.equal(await history.locator("tbody tr").count(), 1);
        assert((await history.innerText()).includes("29 Jan · 2011 / 2012"));
        await page.getByRole("combobox", { name: "Year", exact: true }).selectOption("");
        await page.getByRole("combobox", { name: "Sport", exact: true }).selectOption("");
        await page.getByRole("textbox", { name: "Search results", exact: true }).fill("Long Jump");
        assert.equal(await history.locator("tbody tr").count(), 1);
        assert((await history.innerText()).includes("4.64 m"));
        await page.getByRole("textbox", { name: "Search results", exact: true }).fill("");
        await page.getByRole("combobox", { name: "Sport", exact: true }).selectOption("Running");
        assert.equal(await history.locator("tbody tr").count(), 3);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
          false,
          "No horizontal page overflow",
        );
        assert.equal(
          (await context.cookies()).filter((cookie) => cookie.name.includes("session_token"))
            .length,
          0,
        );
        if (viewport.width > 1000) await checkLiveAchievements(page);
        await context.close();
      }
      console.log(
        "PASS: desktop/mobile profile rendering and automatic anonymous/member achievement updates after imported and excluded results.",
      );
    } finally {
      await browser.close();
    }
  }
  await sql`update athletes set profile_visibility='private' where id=${publishedAthlete.id}`;
  assert.equal(await publicRead("published-history-fixture"), null);
  await sql`update athletes set profile_visibility='public' where id=${publishedAthlete.id}`;
  await sql`insert into athlete_public_shares(user_id,slug,enabled,share_results,share_location,share_club)
    values (${user.id},'published-history-sharing',false,true,false,false)`;
  assert.equal(
    await publicRead("published-history-fixture"),
    null,
    "Owner withdrawal takes precedence",
  );
  await sql`update athlete_public_shares set enabled=true,share_results=false where user_id=${user.id}`;
  assert.equal(await publicRead("published-history-fixture"), null, "Owner can withdraw results");
  await sql`update athlete_public_shares set share_results=true where user_id=${user.id}`;
  const limitedProfile = await publicRead("published-history-fixture");
  assert.equal(limitedProfile.athlete.country, "");
  assert.equal(limitedProfile.athlete.club, null);
  assert.equal(limitedProfile.athlete.club_slug, null);
  const deployment = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
  assert(
    !deployment.headers
      .find((rule) => rule.source === "/athletes/:path*")
      ?.headers.some((header) => header.key.toLowerCase() === "x-robots-tag"),
    "The hosting configuration must defer athlete indexing to the validated page response",
  );
  const expectSearch = async (slug, indexable, extraHeaders = {}, status = 200) => {
    const response = await fetch(`${origin}/athletes/${slug}`, { headers: extraHeaders });
    const html = await response.text();
    const $ = load(html);
    assert.equal(response.status, status);
    assert.equal(response.headers.get("x-athrecs-profile-unavailable"), null);
    assert.equal(
      response.headers.get("x-robots-tag"),
      indexable ? "index, follow" : "noindex, nofollow, noarchive",
    );
    assert.equal(
      $("meta[name=robots]").attr("content"),
      indexable ? "index, follow" : "noindex, nofollow, noarchive",
    );
    assert.equal(
      response.headers.get("x-athrecs-profile-indexable"),
      null,
      "Internal eligibility marker is stripped",
    );
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    assert.equal($("link[rel=canonical]").attr("href"), `https://www.athrecs.com/athletes/${slug}`);
    for (const secret of [
      "Private biography sentinel",
      "Private city sentinel",
      "Private coach sentinel",
      "1980-01-02",
      "Hidden mark sentinel",
      "profile-viewer@example.test",
    ])
      assert(!html.includes(secret), `Indexing must not disclose ${secret}`);
  };
  const expectSitemap = async (present) => {
    const index = await (await fetch(origin + "/sitemap.xml")).text();
    assert.equal(index.includes("/sitemaps/athletes-1.xml"), present);
    const response = await fetch(origin + "/sitemaps/athletes-1.xml");
    assert.equal(response.status, present ? 200 : 404);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const xml = await response.text();
    if (present)
      assert(xml.includes("https://www.athrecs.com/athletes/published-history-fixture</loc>"));
    for (const excluded of [
      "view-login-fixture",
      "view-login-private",
      "published-history-sharing",
    ])
      assert(!xml.includes(excluded), `Do not advertise ${excluded}`);
  };
  await expectSearch("published-history-fixture", false);
  await expectSitemap(false);
  await sql`update athlete_public_shares set search_indexable=true where user_id=${user.id}`;
  assert.equal((await publicRead("published-history-fixture")).searchIndexable, true);
  await expectSearch("published-history-fixture", true, {
    "sec-fetch-site": "cross-site",
    "X-Athrecs-Profile-Unavailable": "1",
  });
  await expectSitemap(true);
  for (const slug of ["view-login-fixture", "view-login-private", "nonexistent-test-profile"]) {
    await expectSearch(
      slug,
      false,
      {
        "X-Athrecs-Profile-Indexable": "1",
        "X-Athrecs-Profile-Unavailable": "0",
      },
      404,
    );
  }
  const directory = await fetch(origin + "/athletes", {
    headers: { "X-Athrecs-Profile-Indexable": "1" },
  });
  assert.equal(directory.headers.get("x-robots-tag"), "index, follow");
  const filteredDirectory = await fetch(origin + "/athletes?q=published", {
    headers: { "X-Athrecs-Profile-Indexable": "1" },
  });
  assert.equal(
    filteredDirectory.headers.get("x-robots-tag"),
    "noindex, follow",
    "Request headers cannot make search filters indexable",
  );
  await sql`update athlete_public_shares set search_indexable=false where user_id=${user.id}`;
  await expectSearch("published-history-fixture", false);
  await expectSitemap(false);
  await sql`update athlete_public_shares set search_indexable=true, enabled=false where user_id=${user.id}`;
  await expectSearch("published-history-fixture", false, {}, 404);
  await expectSitemap(false);
  await sql`update athlete_public_shares set enabled=true, share_results=false where user_id=${user.id}`;
  await expectSearch("published-history-fixture", false, {}, 404);
  await expectSitemap(false);
  await sql`update athlete_public_shares set share_results=true where user_id=${user.id}`;
  await sql`update athletes set profile_visibility='private' where id=${publishedAthlete.id}`;
  await expectSearch("published-history-fixture", false, {}, 404);
  await expectSitemap(false);
  await sql`update athletes set profile_visibility='public' where id=${publishedAthlete.id}`;
  await sql`update athlete_account_links set status='revoked' where athlete_id=${publishedAthlete.id}`;
  await expectSearch("published-history-fixture", true);
  await expectSitemap(true);
  await sql`update athlete_source_histories set published_at=null where athlete_id=${publishedAthlete.id}`;
  await expectSearch("published-history-fixture", false, {}, 404);
  await expectSitemap(false);
  // The older staff-publication path and existing owner consent are equally
  // valid approvals. Neither depends on adding a newer manual source history.
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values (${user.id},'athlete.bulk_publish','athlete',${String(publishedAthlete.id)},
      '{"profile_visibility":"public"}'::jsonb,'Synthetic existing staff publication')`;
  await expectSearch("published-history-fixture", true);
  await expectSitemap(true);
  assert.equal(
    (await publicRead("published-history-fixture")).sourceHistories.length,
    0,
    "Unpublished source history is not exposed by a profile approval",
  );
  await sql`delete from network_audit_log where action='athlete.bulk_publish' and entity_id=${String(publishedAthlete.id)}`;
  await expectSearch("published-history-fixture", false, {}, 404);
  await sql`update athlete_account_links set status='active' where athlete_id=${publishedAthlete.id}`;
  await expectSearch("published-history-fixture", true);
  await expectSitemap(true);
  await sql`update athletes set profile_type='Public figure' where id=${publishedAthlete.id}`;
  await sql`update results set result_visibility='private' where athlete_id=${publishedAthlete.id}`;
  const privateRowsPreview = await rpc(
    "athrecs/athlete-profile-share-api",
    "getPublicSharedProfilePreview",
    { slug: "published-history-sharing" },
  );
  assert.equal(
    privateRowsPreview.entries.filter((entry) => entry.kind === "recorded").length,
    0,
    "Anonymous shared previews must also exclude private result rows",
  );
  assert.equal(
    (await publicRead("published-history-fixture")).profileResults.length,
    0,
    "Even a public-figure label cannot expose private result rows anonymously",
  );
  await sql`update athlete_public_shares set search_indexable=false where user_id=${user.id}`;
  await expectSearch("published-history-fixture", false);
  await expectSitemap(false);
  await sql`update athlete_public_shares set enabled=false where user_id=${user.id}`;
  assert.equal(
    await publicRead("published-history-fixture"),
    null,
    "Owner withdrawal also blocks the existing-sharing publication path",
  );
  // Exercise every combination through the real HTTP page and XML routes,
  // including bot rendering. A permissive flag must never cancel a veto.
  const googlebot = {
    "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  };
  for (const enabled of [false, true]) {
    for (const shareResults of [false, true]) {
      for (const searchIndexable of [false, true]) {
        await sql`update athlete_public_shares
          set enabled=${enabled},share_results=${shareResults},search_indexable=${searchIndexable}
          where user_id=${user.id}`;
        const indexable = enabled && shareResults && searchIndexable;
        const status = enabled && shareResults ? 200 : 404;
        await expectSearch("published-history-fixture", indexable, {}, status);
        await expectSearch("published-history-fixture", indexable, googlebot, status);
        await expectSitemap(indexable);
      }
    }
  }
  // Check a withdrawal immediately after the final all-enabled response.
  await sql`update athlete_public_shares set search_indexable=false where user_id=${user.id}`;
  await expectSearch("published-history-fixture", false, googlebot);
  await expectSitemap(false);
  console.log(
    "PASS: all eight sharing/results/search combinations agree across anonymous HTML, Googlebot HTML, HTTP robots headers and live sitemap membership; immediate search withdrawal stays uncached.",
  );
  console.log(
    "PASS: approved public profiles opt into search with matching HTML/header robots and sitemap; owner choices, withdrawal, unpublished histories and forged request headers remain protected.",
  );
  console.log(
    "PASS: approved history renders anonymously in the main results table; unapproved/private profiles, personal fields, owner withdrawals and removed marks remain protected.",
  );
  // A signed-in refresh must retain the preview's editorial badge styling.
  const [statusAthlete] = await sql`insert into athletes
    (slug,display_name,profile_visibility,profile_roles)
    values ('status-badge-fixture','Status Badge Athlete','public',
      'Professional athlete,Running legend,Running legend,Coach') returning id`;
  await sql`insert into network_audit_log(action,entity_type,entity_id,after_value)
    values ('athlete.profile_admin_published','athlete',${String(statusAthlete.id)},
      ${JSON.stringify({ athleteId: statusAthlete.id, profile_visibility: "public" })}::jsonb)`;
  const statusMarkup = [];
  for (const headers of [{}, { authorization: `Bearer ${token}` }]) {
    const response = await fetch(origin + "/athletes/status-badge-fixture", { headers });
    assert.equal(response.status, 200);
    const $ = load(await response.text());
    const overview = $("#profile-overview");
    const statuses = overview.find('[aria-label="Profile status"]');
    assert.equal(statuses.length, 1);
    assert.equal(statuses.prev("h1").text(), "Status Badge Athlete");
    const legend = statuses.find("span").filter((_, el) => $(el).text() === "Running legend");
    assert.equal(legend.length, 1);
    assert(legend.hasClass("border-amber-300"));
    assert(legend.hasClass("bg-amber-50"));
    assert.equal(legend.find('svg.lucide-trophy[aria-hidden="true"]').length, 1);
    assert.equal(overview.text().match(/Running legend/g)?.length, 1);
    assert.equal(
      overview.text().match(/Professional athlete/g)?.length,
      headers.authorization ? 2 : 1,
    );
    assert.equal(overview.text().includes("Coach"), Boolean(headers.authorization));
    statusMarkup.push(statuses.toString());
  }
  assert.equal(statusMarkup[0], statusMarkup[1], "Preview and member status badges stay identical");
  console.log(
    "PASS: public-to-member profile transition retains one gold trophy badge beneath the name.",
  );
  await post("sign-out", {}, token);
  await assert.rejects(
    () => rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token),
    /Unauthorized/,
  );
  console.log(
    "PASS: anonymous/invalid/revoked sessions denied; authenticated reads; privacy retained; cross-site denial; SSR and sequential-request isolation; no private or member-only profile sitemaps.",
  );
} finally {
  await server.close();
  await database?.close();
}
