// Synthetic end-to-end authentication and staff data tests. No live accounts or email.
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { chromium } from "playwright";

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
  const file = "athrecs/client-data-api";
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
  assert.equal(helpers.clientSignInMethod("/sign-in/email-otp"), "Email code");
  assert.equal(helpers.clientSignInMethod("/get-session"), null);

  const staff = await post("sign-up/email", {
    name: "Synthetic Staff",
    email: "staff@example.test",
    password,
  });
  assert.equal(staff.status, 200);
  const token = staff.body.token;
  await assert.rejects(() => read({}, token), /Forbidden/);
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('staff-google','staff-google','google',${staff.body.user.id},now(),now())`;
  await sql`update "user" set "emailVerified"=true where id=${staff.body.user.id}`;
  const client = await post("sign-up/email", {
    name: "Synthetic Client",
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

  if (process.argv.includes("--browser")) {
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
