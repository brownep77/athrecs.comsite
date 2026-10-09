import assert from "node:assert/strict";
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
  assert.equal(await rpc("auth/profile-access", "canViewAthleteProfiles"), false);
  const calls = [
    ["athrecs/api", "listAthletes", {}],
    ["athrecs/api", "getAthleteBySlug", "view-login-fixture"],
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
  for (const path of ["/athletes", "/athletes/view-login-fixture", "/athletes/ATH-000001"]) {
    const response = await fetch(origin + path);
    const html = await response.text();
    assert.equal(response.status, 200);
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
    name: "Profile Viewer Test",
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
    for (const path of ["/athletes", "/athletes/view-login-fixture"]) {
      const response = await fetch(origin + path, { headers: readerHeaders });
      const html = await response.text();
      assert.equal(response.status, 200);
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
  assert(!(await (await fetch(origin + "/sitemaps/pages.xml")).text()).includes("/athletes</loc>"));
  assert(!(await (await fetch(origin + "/sitemap.xml")).text()).includes("/sitemaps/athletes-"));
  // A deliberately published history is viewable without a session; a public
  // database flag alone does not publish other members' profiles anonymously.
  const publicRead = (slug) => rpc("athrecs/api", "getAdministratorPublishedAthlete", slug);
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
  const historyKey = "AthRecs additions:public-history-test";
  await sql`insert into athlete_source_histories
    (athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values (${publishedAthlete.id},'AthRecs additions','public-history-test','https://example.test/result',
      now(),true,array[2025],array[2025],${JSON.stringify([performance, { ...performance, performance: "Hidden mark sentinel", profileExcluded: true }])}::jsonb,now())`;
  assert.equal(
    await publicRead("published-history-fixture"),
    null,
    "A history without an approval is not public",
  );
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values (${user.id},'athlete.history_admin_published','athlete_source_history',${historyKey},
      ${JSON.stringify({ athleteId: publishedAthlete.id, athleteConsentRecorded: false })}::jsonb,'Synthetic explicit publication approval')`;
  const publicProfile = await publicRead("published-history-fixture");
  assert.equal(publicProfile.athlete.display_name, "Published History Athlete");
  assert.equal(publicProfile.sourceHistories[0].performances.length, 1);
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
    assert(
      $("details[open]").filter(
        (_, e) => $(e).find("summary").first().text() === "Performance history",
      ).length === 1,
    );
    assert($.text().includes("19:34(19:38)"));
    assert($.text().includes("1 performance"));
  }
  if (process.env.ATHRECS_BROWSER_MODULE) {
    const { chromium } = createRequire(import.meta.url)(process.env.ATHRECS_BROWSER_MODULE);
    const browser = await chromium.launch({ headless: true });
    try {
      for (const viewport of [
        { width: 1365, height: 900 },
        { width: 390, height: 844 },
      ]) {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
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
        assert.equal(await page.locator("#performance-history").getAttribute("open"), "");
        assert((await page.locator("#performance-history").innerText()).includes("19:34(19:38)"));
        assert.equal(
          (await context.cookies()).filter((cookie) => cookie.name.includes("session_token"))
            .length,
          0,
        );
        await context.close();
      }
      console.log(
        "PASS: signed-out desktop and mobile browsers retain the visible, expanded history after hydration.",
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
  console.log(
    "PASS: approved history renders anonymously with expanded results; unapproved/private profiles, personal fields, owner withdrawals and removed marks remain protected.",
  );
  await post("sign-out", {}, token);
  await assert.rejects(
    () => rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token),
    /Unauthorized/,
  );
  console.log(
    "PASS: anonymous/invalid/revoked sessions denied; authenticated reads; privacy retained; cross-site denial; SSR and sequential-request isolation; no profile sitemaps.",
  );
} finally {
  await server.close();
  await database?.close();
}
