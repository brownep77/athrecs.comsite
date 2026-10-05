import assert from "node:assert/strict";
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
      !html.includes(
        'application/ld+json">{"@context":"https://schema.org","@type":"ProfilePage',
      ),
    );
  }
  console.log("Anonymous SSR blocked and uncached.");
  const signup = await post("sign-up/email", {
    name: "Profile Viewer Test",
    email: "profile-viewer@example.test",
    password: "Test-only-password-123!",
  });
  assert.equal(signup.status, 200, await signup.clone().text());
  const { token } = await signup.json();
  assert(token);
  assert.equal(await rpc("auth/profile-access", "canViewAthleteProfiles", undefined, token), true);
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await rpc("athrecs/api", "listAthletes", {}, token);
  await sql`insert into athletes (slug,display_name,bio,profile_visibility) values ('view-login-fixture','Login Test Athlete','Restricted Fixture Biography','public'),('view-login-private','Private Test Athlete','Owner-only biography','private')`;
  const profile = await rpc("athrecs/api", "getAthleteBySlug", "view-login-fixture", token);
  assert.equal(profile.athlete.display_name, "Login Test Athlete");
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
