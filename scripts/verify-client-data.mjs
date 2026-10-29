// Synthetic end-to-end authentication and staff data tests. No live accounts or email.
import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { chromium } from "playwright";
import { runInNewContext } from "node:vm";

// Prove backfill does not manufacture history or change existing totals.
const migrationDb = new PGlite();
await migrationDb.exec(await readFile("migrations/0001_auth.sql", "utf8"));
await migrationDb.exec(await readFile("migrations/20261009_athlete_login_activity.sql", "utf8"));
await migrationDb.exec(`insert into "user"(id,name,email,"emailVerified","updatedAt") values('legacy','Synthetic Legacy','legacy@example.test',false,now());
  insert into session(id,"expiresAt",token,"updatedAt","userId","userAgent") values('legacy-session',now()+interval '1 day','synthetic-only',now(),'legacy','Mozilla/5.0 (Linux; Android 10; K) Chrome/155.0.0.0 Mobile Safari/537.36');`);
await migrationDb.exec(await readFile("migrations/20261021_client_login_data.sql", "utf8"));
const legacy = (
  await migrationDb.query(
    "select captured_from,device_id,country_code,sign_in_method from athlete_client_logins",
  )
).rows[0];
assert.deepEqual(legacy, {
  captured_from: "existing_session",
  device_id: null,
  country_code: null,
  sign_in_method: null,
});
assert.equal(
  Number(
    (await migrationDb.query("select sign_in_count from athlete_login_activity")).rows[0]
      .sign_in_count,
  ),
  1,
);
await migrationDb.close();

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
  "VERCEL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GROK_AUTH_CLIENT_ID",
  "GROK_AUTH_CLIENT_SECRET",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "staff@example.test";
process.env.BETTER_AUTH_SECRET = "client-data-test-only-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18247";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
const server = await createServer({
  server: { host: "127.0.0.1", port: 18247, strictPort: true },
  cacheDir: ".client-data-vite",
});
let database, browser, lastHeaders;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `No external requests in test: ${new URL(url).origin}`);
  const response = await realFetch(input, init);
  if (url.includes("/_serverFn/")) lastHeaders = response.headers;
  return response;
};
const modules = new Map();
async function rpc(name, data, token, extra = {}) {
  const file = name === "listAccessLog" ? "athrecs/access-log-api" : "athrecs/client-data-api";
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method: "GET",
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
  if (result.error) throw result.error;
  return result.result;
}
const read = (data, token, headers) => rpc("listClientData", data, token, headers);
const history = (userId, token, page = 1) => rpc("getClientLoginHistory", { userId, page }, token);
const android =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Mobile Safari/537.36";
const password = "Client-data-test-password!";
async function post(path, body, extra = {}) {
  const response = await fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin, "user-agent": android, ...extra },
    body: JSON.stringify(body),
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}
const deviceCookie = (response) =>
  response.headers
    .getSetCookie()
    .find((c) => c.startsWith("athrecs_device="))
    ?.split(";")[0];
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const helpers = await server.ssrLoadModule("/src/lib/athrecs/client-data.ts");
  const diagnosticHelpers = await server.ssrLoadModule("/src/lib/athrecs/access-diagnostics.ts");
  // A crawler opening a public preview RPC as a plain URL can produce a null
  // terminal value. Diagnostics must not dereference a nonexistent response.
  const previewModule = await (
    await fetch(`${origin}/src/lib/athrecs/athlete-profile-share-api.ts`)
  ).text();
  const previewStart = previewModule.indexOf("const getPublicSharedProfilePreview =");
  assert(previewStart >= 0);
  const previewSection = previewModule.slice(
    previewStart,
    previewModule.indexOf(";", previewStart),
  );
  const previewId = previewSection.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(previewId);
  const malformedPreview = await fetch(`${origin}/_serverFn/${previewId}`);
  assert.equal(
    malformedPreview.status,
    400,
    "Malformed plain preview RPC is a client error, not a logging crash",
  );
  assert.match(malformedPreview.headers.get("cache-control"), /private.*no-store/);
  assert.match(malformedPreview.headers.get("x-robots-tag"), /noindex/);
  const validMissingPreview = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(previewId)({
      method: "GET",
      data: { slug: "synthetic-missing-profile" },
      headers: { origin, "sec-fetch-site": "same-origin" },
      context: {},
    }),
  );
  assert.equal(
    validMissingPreview.result,
    null,
    "A valid RPC still returns the original null result",
  );
  assert.equal(validMissingPreview.error, undefined);
  assert.equal(
    (
      await database.query(
        "select count(*)::int as n from athlete_access_events where kind='server_error'",
      )
    ).rows[0].n,
    0,
  );
  assert.equal(diagnosticHelpers.browserErrorCode(new Error("private-message")), "Error");
  assert.equal(
    diagnosticHelpers.browserErrorCode(runInNewContext('new TypeError("private-message")')),
    "TypeError",
  );
  assert.equal(
    diagnosticHelpers.browserErrorCode({ name: "Error", message: "private-message" }),
    "Error",
  );
  for (const error of [
    null,
    "private-message",
    { name: "private-message" },
    {
      get name() {
        throw new Error("private-message");
      },
    },
  ])
    assert.equal(diagnosticHelpers.browserErrorCode(error), "UnknownError");
  for (const route of [
    "athlete-account",
    "my-athlete-profile",
    "my-race-calendar",
    "claim-results",
    "review-results",
  ]) {
    const safe = diagnosticHelpers.diagnosticRoute(`/${route}?token=private-token#private-name`);
    assert.equal(safe, `/${route}`);
    assert.equal(
      diagnosticHelpers.diagnosticRoute(safe),
      safe,
      "Server sanitisation is idempotent",
    );
    assert.equal(diagnosticHelpers.diagnosticRoute(`/${route}/private-name`), `/${route}/:page`);
  }
  assert.equal(diagnosticHelpers.diagnosticRoute("/api/race-calendar/private-token"), "/:page");
  assert.equal(diagnosticHelpers.diagnosticRoute("/private-name"), "/:page");
  assert.equal(helpers.describeClientDevice(android).deviceType, "Mobile phone");
  assert.equal(
    helpers.describeClientDevice("Mozilla/5.0 (iPad; CPU OS 17) Version/17 Safari/605").deviceType,
    "Tablet",
  );
  assert.equal(
    helpers.describeClientDevice("Mozilla/5.0 (Windows NT 10.0) Chrome/155 Edg/155").browser,
    "Edge",
  );
  assert.equal(helpers.describeClientDevice(null).deviceType, "Unknown");
  assert.equal(helpers.clientSignInMethod("/callback/google"), "Google");
  assert.equal(helpers.clientSignInMethod("/oauth2/callback/grok-google"), "Google");
  assert.equal(helpers.clientSignInMethod("/callback/:id", { id: "google" }), "Google");
  assert.equal(
    helpers.clientSignInMethod("/oauth2/callback/:providerId", { providerId: "grok-google" }),
    "Google",
  );
  assert.equal(helpers.clientSignInMethod("/sign-in/social", {}, { provider: "apple" }), "Apple");
  assert.equal(helpers.clientSignInMethod("/sign-in/email-otp"), "Email code");
  assert.equal(helpers.clientSignInMethod("/get-session"), null);

  const staff = await post("sign-up/email", {
    ...signupDetails("Synthetic Staff"),
    email: "staff@example.test",
    password,
  });
  assert.equal(staff.status, 200);
  const token = staff.body.token;
  await assert.rejects(() => read({}, token), /Forbidden/);
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('staff-google','staff-google','google',${staff.body.user.id},now(),now())`;
  await sql`update "user" set "emailVerified"=true where id=${staff.body.user.id}`;
  const client = await post("sign-up/email", {
    ...signupDetails("Synthetic Client"),
    email: "client@example.test",
    password,
  });
  assert.equal(client.status, 200);
  const userId = client.body.user.id;
  const cookie = deviceCookie(client);
  assert(cookie, "Successful signup returns signed browser-recognition cookie");
  assert(client.headers.getSetCookie().some((c) => /athrecs_device=.*HttpOnly/i.test(c)));
  let record = (await read({ q: "client@example.test" }, token)).clients[0];
  assert.equal(record.signInCount, 1);
  assert.equal(record.recognisedDevices, 1);
  assert.equal(record.latestLogin.deviceType, "Mobile phone");
  assert.equal(record.latestLogin.signInMethod, "Email and password");
  assert.equal(record.latestLogin.location, "Not recorded");
  const number = record.latestLogin.deviceNumber;
  assert(number);
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");

  const forgedGeo = { cookie, "x-vercel-ip-country": "BM", "x-vercel-ip-city": "Hamilton" };
  let second = await post("sign-in/email", { email: "client@example.test", password }, forgedGeo);
  assert.equal(second.status, 200);
  record = (await read({ q: "client@example.test" }, token)).clients[0];
  assert.equal(record.signInCount, 2);
  assert.equal(record.recognisedDevices, 1);
  assert.equal(record.latestLogin.deviceNumber, number);
  assert.equal(
    record.latestLogin.location,
    "Not recorded",
    "Non-Vercel supplied location headers are not trusted",
  );
  await post("sign-out", {}, { authorization: `Bearer ${second.body.token}` });
  assert.equal((await history(userId, token)).total, 2, "History survives logout/session deletion");
  await post("sign-in/email", { email: "client@example.test", password: "wrong" }, { cookie });
  await fetch(`${origin}/api/auth/get-session`, {
    headers: { authorization: `Bearer ${client.body.token}` },
  });
  await sql`update session set "updatedAt"=now() where "userId"=${userId}`;
  assert.equal((await read({ q: "client@example.test" }, token)).clients[0].signInCount, 2);

  // Simulate platform-injected geolocation; no real geo service is queried.
  process.env.VERCEL = "1";
  second = await post("sign-in/email", { email: "client@example.test", password }, forgedGeo);
  process.env.VERCEL = "";
  record = (await read({ q: "client@example.test" }, token)).clients[0];
  assert.equal(record.latestLogin.location, "Hamilton, Bermuda");
  assert.equal(record.latestLogin.deviceNumber, number);
  await post(
    "sign-in/email",
    { email: "client@example.test", password },
    { cookie: "athrecs_device=forged" },
  );
  record = (await read({ q: "client@example.test" }, token)).clients[0];
  assert.equal(record.recognisedDevices, 2, "Forged cookie creates a fresh device");
  assert.notEqual(record.latestLogin.deviceNumber, number);

  await assert.rejects(() => read({}), /Unauthorized/);
  await assert.rejects(() => history(userId), /Unauthorized/);
  await assert.rejects(() => read({}, client.body.token), /Forbidden/);
  await assert.rejects(() => history(staff.body.user.id, client.body.token), /Forbidden/);
  await assert.rejects(
    () => read({}, token, { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => read({}, token, { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  await assert.rejects(() => read({ page: 0 }, token));
  assert.equal((await read({ q: "' OR 1=1 --" }, token)).total, 0);
  assert.equal((await read({ q: "%" }, token)).total, 0);
  assert.equal((await history("not-a-real-user", token)).total, 0);
  const payload = JSON.stringify(await read({}, token));
  for (const secret of [
    "session_id",
    "device_key_hash",
    "user_agent",
    "accessToken",
    "ipAddress",
    client.body.token,
    token,
  ])
    assert(
      !payload.includes(secret),
      `Private security material excluded: ${secret === token || secret === client.body.token ? "token" : secret}`,
    );

  await sql`insert into "user"(id,name,email,"emailVerified","updatedAt") select 'client-page-'||n,'Synthetic Page '||n,'page-'||n||'@example.test',false,now() from generate_series(1,27) n`;
  const firstPage = await read({ q: "Synthetic Page" }, token),
    nextPage = await read({ q: "Synthetic Page", page: 2 }, token);
  assert.equal(firstPage.clients.length, 25);
  assert.equal(nextPage.clients.length, 2);
  assert.equal(new Set([...firstPage.clients, ...nextPage.clients].map((c) => c.userId)).size, 27);
  await sql`insert into session(id,token,"userId","expiresAt","updatedAt") select 'client-history-'||n,'synthetic-history-'||n,${userId},now()+interval '1 day',now() from generate_series(1,27) n`;
  assert.equal((await history(userId, token)).logins.length, 25);
  assert((await history(userId, token, 2)).logins.length > 0);
  assert.equal(
    (await history(userId, token)).logins[0].signInMethod,
    null,
    "Direct/custom sessions do not inherit a linked method",
  );
  const beforePrune = (await read({ q: "client@example.test" }, token)).clients[0].signInCount;
  await sql`update athlete_client_logins set signed_in_at=now()-interval '91 days' where session_id='client-history-1'`;
  await history(userId, token);
  assert.equal(
    (await sql`select id from athlete_client_logins where session_id='client-history-1'`).length,
    0,
  );
  assert.equal(
    (await read({ q: "client@example.test" }, token)).clients[0].signInCount,
    beforePrune,
    "Retention preserves overall counts",
  );
  await sql`insert into session(id,token,"userId","expiresAt","updatedAt") values('cascade-session','synthetic-cascade','client-page-27',now()+interval '1 day',now())`;
  await sql`insert into athlete_client_devices(user_id,device_key_hash,first_seen_at,last_seen_at) values('client-page-27','synthetic',now(),now())`;
  await sql`delete from "user" where id='client-page-27'`;
  assert.equal(
    (await sql`select id from athlete_client_logins where user_id='client-page-27'`).length,
    0,
  );
  assert.equal(
    (await sql`select id from athlete_client_devices where user_id='client-page-27'`).length,
    0,
  );
  console.log(
    "PASS: migration/backfill, real signup/login cookie reuse and tampering, device parsing, trusted geolocation, logout persistence, counts, access control, safe payloads, pagination, retention and account deletion.",
  );

  // New cross-account log: real auth requests, never synthetic claims of success.
  await post("sign-in/email", { email: "client@example.test", password });
  await post("sign-in/email", { email: "client@example.test", password: "wrong" });
  const access = (data = {}, userToken = token) => rpc("listAccessLog", data, userToken);
  const log = await access({ q: "client@example.test" });
  assert(log.events.some((e) => e.outcome === "failed" && e.identity === "entered"));
  assert(log.events.some((e) => e.outcome === "success" && e.identity === "account"));
  const success = log.events.find((e) => e.outcome === "success" && e.requestId);
  assert(success && success.durationMs >= 0 && success.httpStatus === 200);
  assert.equal(success.host, "127.0.0.1");
  assert.equal(success.browser, "Chrome");
  assert.equal(success.browserVersion, "155.0.0.0");
  const failures = await access({ outcome: "failed", q: "client@example.test" });
  assert(failures.events.every((e) => e.outcome === "failed"));
  assert(failures.events.some((e) => e.errorCode === "INVALID_EMAIL_OR_PASSWORD"));
  assert.equal(failures.summary.successful, 0);
  assert(
    (await access({ view: "sessions", q: "client@example.test" })).events.every(
      (e) => new Date(e.expiresAt) > new Date(),
    ),
  );
  const activeBefore = (await access({ view: "sessions", q: "client@example.test" })).summary.total;
  await sql`update session set "expiresAt"=now()-interval '1 second' where id='client-history-2'`;
  assert.equal(
    (await access({ view: "sessions", q: "client@example.test" })).summary.total,
    activeBefore - 1,
  );
  assert(
    (await access({ q: "client@example.test", outcome: "info" })).events.some(
      (e) => e.kind === "sign_out" && e.identity === "account",
    ),
  );
  assert.equal((await access({ q: "%" })).summary.total, 0);
  assert.equal((await access({ browser: "Safari", q: "client@example.test" })).summary.total, 0);
  assert((await access({ device: "Mobile phone", browser: "Chrome" })).summary.total > 0);
  await assert.rejects(() => rpc("listAccessLog", {}, undefined), /Unauthorized/);
  await assert.rejects(() => access({}, client.body.token), /Forbidden/);
  await assert.rejects(() => access({ days: 500 }));
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  await assert.rejects(
    () =>
      rpc("listAccessLog", {}, token, {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => rpc("listAccessLog", {}, token, { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  const diagnostics = await server.ssrLoadModule("/src/lib/auth/access-diagnostics.server.ts");
  const secrets = [
    password,
    token,
    client.body.token,
    "secret-code-123456",
    "private-message",
    "private-token",
  ];
  const request = new Request(`${origin}/api/auth/sign-in/email-otp?token=private-token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "client@example.test", otp: "secret-code-123456", password }),
  });
  const response = await diagnostics.handleAuthWithDiagnostics(
    request,
    async () =>
      Response.json(
        { code: "OTP_EXPIRED", message: "private-message", token: "private-token" },
        { status: 400 },
      ),
    async () => sql,
  );
  assert.equal(response.status, 400);
  assert.equal(
    (await response.json()).message,
    "private-message",
    "Logging must preserve response body",
  );
  assert((await access({ q: "OTP_EXPIRED" })).summary.total > 0);
  await diagnostics.handleAuthWithDiagnostics(
    new Request(`${origin}/api/auth/callback/google?code=secret-code-123456`),
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: `${origin}/account?error=access_denied&token=private-token` },
      }),
    async () => sql,
  );
  assert(
    (await access({ q: "access_denied" })).events.some((e) => e.route === "/callback/:provider"),
  );
  await assert.rejects(
    () =>
      diagnostics.handleAuthWithDiagnostics(
        new Request(`${origin}/api/auth/sign-in/email`),
        async () => {
          throw new Error("private-message");
        },
        async () => sql,
      ),
    /private-message/,
  );
  assert((await access({ outcome: "error" })).events.some((e) => e.errorCode === "SERVER_ERROR"));
  const preserved = await diagnostics.handleAuthWithDiagnostics(
    new Request(`${origin}/api/auth/sign-out`),
    async () => Response.json({ success: true }),
    async () => {
      throw new Error("storage failure");
    },
  );
  assert.equal(preserved.status, 200, "Logging failure must not break auth");
  const browserReport = {
    kind: "page_error",
    code: "TypeError",
    route: "/athletes/private-name?token=private-token",
    reference: crypto.randomUUID(),
    online: true,
    viewport: "small",
  };
  const report = async (body = browserReport, headers = {}) =>
    fetch(`${origin}/api/diagnostics`, {
      method: "POST",
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        "content-type": "application/json",
        "user-agent": android,
        authorization: `Bearer ${client.body.token}`,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  assert.equal((await report()).status, 204);
  const reported = (await access({ outcome: "error", q: "client@example.test" })).events.find(
    (e) => e.source === "browser",
  );
  assert.equal(reported.route, "/athletes/:page");
  assert.equal(reported.identity, "account");
  assert.equal(reported.requestId, browserReport.reference);
  assert.equal((await report({ ...browserReport, userId: staff.body.user.id })).status, 400);
  assert.equal((await report(browserReport, { origin: "https://evil.example" })).status, 403);
  for (const [kind, route] of [
    ["data_query_error", "/athlete-account"],
    ["data_mutation_error", "/my-race-calendar"],
  ]) {
    const reference = crypto.randomUUID();
    assert.equal(
      (
        await report({
          ...browserReport,
          kind,
          route: `${route}?race=private-name`,
          code: "Error",
          reference,
        })
      ).status,
      204,
    );
    const event = (await access({ q: reference })).events[0];
    assert.equal(event.kind, kind);
    assert.equal(event.route, route);
    assert.equal(event.errorCode, "Error");
  }
  for (let i = 0; i < 7; i++)
    assert.equal((await report({ ...browserReport, reference: crypto.randomUUID() })).status, 204);
  assert.equal((await report()).status, 429);
  const stored = JSON.stringify(await sql`select * from athlete_access_events`);
  for (const secret of secrets)
    assert(!stored.includes(secret), "Sensitive input excluded from diagnostic storage");
  assert(!stored.includes("private-name"));
  const accessPayload = JSON.stringify(await access());
  for (const secret of [...secrets, "user_agent", "session_id", "device_key_hash", "ipAddress"])
    assert(!accessPayload.includes(secret), "Sensitive material excluded from staff payload");
  const pages = await access({ days: 90 }),
    page2 = await access({ days: 90, page: 2 });
  assert.equal(pages.events.length, 25);
  assert(!pages.events.some((e) => page2.events.some((other) => other.id === e.id)));
  await sql`insert into athlete_access_events(kind,outcome,request_id,source,occurred_at) values('page_error','error','expired-diagnostic','browser',now()-interval '91 days')`;
  await access();
  assert.equal(
    (await sql`select id from athlete_access_events where request_id='expired-diagnostic'`).length,
    0,
  );
  console.log(
    "PASS: shared timeline, real successful/failed sign-ins, OAuth/OTP/server errors, safe diagnostics, storage outage isolation, access controls, session expiry, filtering, pagination, rate limits and retention.",
  );

  if (process.argv.includes("--browser")) {
    // A fresh captured login makes the browser assertions exercise populated fields.
    process.env.VERCEL = "1";
    await post("sign-in/email", { email: "client@example.test", password }, forgedGeo);
    process.env.VERCEL = "";
    browser = await chromium.launch({
      executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      extraHTTPHeaders: { authorization: `Bearer ${token}` },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/admin/athlete-accounts?view=client-data`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    await page
      .getByRole("heading", { name: "Client data", exact: true })
      .waitFor({ timeout: 120000 });
    const decline = page.getByRole("button", { name: "No thanks", exact: true });
    if (await decline.isVisible()) await decline.click();
    await page.getByLabel("Find a client").fill("client@example.test");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByRole("heading", { name: "Synthetic Client", exact: true }).waitFor();
    await page.getByText("Hamilton, Bermuda", { exact: true }).waitFor();
    await page.getByText("Mobile phone · Android · Chrome", { exact: true }).waitFor();
    await page.getByRole("button", { name: "View login history", exact: true }).click();
    await page
      .getByRole("heading", { name: "Login history — last 90 days", exact: true })
      .waitFor();
    await mkdir("artifacts", { recursive: true });
    await page.screenshot({ path: "artifacts/client-data-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "No horizontal page overflow on mobile",
    );
    await page.screenshot({ path: "artifacts/client-data-mobile.png", fullPage: true });
    await page.getByRole("button", { name: "All signups and activity", exact: true }).click();
    await page.getByRole("heading", { name: "Signed-up athletes", exact: true }).waitFor();
    await page.getByRole("button", { name: "Client data", exact: true }).click();
    assert(page.url().includes("view=client-data"));
    await page.getByRole("button", { name: "Login & diagnostics", exact: true }).click();
    await page.getByRole("heading", { name: "Login & diagnostics", exact: true }).waitFor();
    await page.getByLabel("Search accounts or errors").fill("client@example.test");
    await page.getByRole("button", { name: "Search log", exact: true }).click();
    await page
      .getByRole("cell", { name: /Email entered \(unverified\)/ })
      .first()
      .waitFor();
    await page.getByLabel("Outcome", { exact: true }).selectOption("failed");
    await page.getByText("INVALID_EMAIL_OR_PASSWORD", { exact: true }).first().waitFor();
    await page.screenshot({ path: "artifacts/login-log-mobile.png", fullPage: true });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({ path: "artifacts/login-log-desktop.png", fullPage: true });
    await page.getByRole("button", { name: "Unexpired sessions", exact: true }).click();
    await page.getByText(/This does not show who is online now/).waitFor();
    await page
      .getByRole("cell", { name: /Expires/ })
      .first()
      .waitFor();
    await page.getByRole("button", { name: "All access events", exact: true }).click();
    assert(page.url().includes("view=login-log"));
    await sql`delete from athlete_diagnostic_limits`;
    const browserStored = page.waitForResponse(
      (response) => response.url().endsWith("/api/diagnostics") && response.status() === 204,
    );
    const supportRef = await page.evaluate(async () => {
      const { reportBrowserDiagnostic } = await import("/src/lib/browser-diagnostics.ts");
      return reportBrowserDiagnostic("page_error", new TypeError("private-browser-error"));
    });
    assert(supportRef);
    await browserStored;
    assert(
      (await access({ q: supportRef })).events.some(
        (e) => e.errorCode === "TypeError" && e.route === "/admin/:page",
      ),
    );
    assert(
      !JSON.stringify(await sql`select * from athlete_access_events`).includes(
        "private-browser-error",
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: staff client-data page, deep link, search, expanded history, mobile layout and tab navigation.",
    );
  }
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
