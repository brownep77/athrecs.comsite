// Safari-engine login and post-login flows. Disposable database and synthetic OAuth only.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "vite";
import { webkit, chromium, devices } from "playwright";

const temp = mkdtempSync(path.join(os.tmpdir(), "athrecs-ios-signin-"));
const origin = "https://127.0.0.1:18249";
execFileSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-days",
    "1",
    "-keyout",
    `${temp}/key.pem`,
    "-out",
    `${temp}/cert.pem`,
    "-subj",
    "/CN=127.0.0.1",
    "-addext",
    "subjectAltName=IP:127.0.0.1",
  ],
  { stdio: "ignore" },
);
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  VITE_AUTH_ENABLED: "true",
  VITE_SITE_BRAND: "athrecs",
  VERCEL_ENV: "development",
  VERCEL: "",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "synthetic-ios-signin-secret-at-least-32-characters",
  GOOGLE_CLIENT_ID: "synthetic-google-client",
  GOOGLE_CLIENT_SECRET: "synthetic-google-secret",
  GROK_AUTH_CLIENT_ID: "",
  GROK_AUTH_CLIENT_SECRET: "",
  RESEND_API_KEY: "",
  ATHRECS_INVITATION_RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
});
globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
const realFetch = globalThis.fetch;
const oauthIdentity = "webkit";
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" ? input : input instanceof URL ? input : input.url);
  if (url.href === "https://oauth2.googleapis.com/token") {
    const payload = {
      sub: `synthetic-${oauthIdentity}`,
      name: "Test",
      email: `${oauthIdentity}@example.test`,
      email_verified: true,
      aud: "synthetic-google-client",
      iss: "https://accounts.google.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const jwt = [
      Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
      Buffer.from(JSON.stringify(payload)).toString("base64url"),
      "synthetic",
    ].join(".");
    return Response.json({
      access_token: "synthetic-oauth-access",
      token_type: "Bearer",
      expires_in: 3600,
      id_token: jwt,
    });
  }
  assert.equal(url.origin, origin, `Unexpected outbound server request: ${url.origin}`);
  return realFetch(input, init);
};
const server = await createServer({
  cacheDir: `${temp}/vite`,
  server: {
    host: "127.0.0.1",
    port: 18249,
    strictPort: true,
    https: { key: readFileSync(`${temp}/key.pem`), cert: readFileSync(`${temp}/cert.pem`) },
  },
});
let database;
let browser;
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  const engine = process.argv.includes("--chromium") ? chromium : webkit;
  browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ ...devices["iPhone 13"], ignoreHTTPSErrors: true });
  const requests = [];
  let failureMode = null;
  let injectedFailures = 0;
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin && failureMode) {
      const functionId = url.pathname.split("/_serverFn/")[1];
      const functionName = functionId
        ? JSON.parse(Buffer.from(functionId, "base64url").toString()).export
        : "";
      if (
        failureMode === "profile-data" &&
        functionName === "getMyAthleteAccount_createServerFn_handler"
      ) {
        injectedFailures++;
        return route.fulfill({
          status: 503,
          contentType: "text/plain",
          body: "Synthetic profile data unavailable",
        });
      }
      if (failureMode === "session-check" && url.pathname === "/api/auth/get-session") {
        injectedFailures++;
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ message: "Synthetic session check unavailable" }),
        });
      }
    }
    if (url.hostname === "accounts.google.com") {
      const state = url.searchParams.get("state");
      assert(state, "Google authorisation carries real generated state");
      const callback = `${origin}/api/auth/callback/google?code=synthetic-code&state=${encodeURIComponent(state)}`;
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<script>location.replace(${JSON.stringify(callback)})</script>`,
      });
    }
    if (url.origin === origin) return route.continue();
    return route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  const networkFailures = [];
  let stage = "sign-in";
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === origin)
      networkFailures.push({
        stage,
        url: request.url().split("?")[0],
        error: request.failure()?.errorText,
      });
  });
  page.on("response", (response) => {
    if (response.url().includes("/_serverFn/") || response.url().includes("/api/auth/"))
      requests.push({ url: response.url().split("?")[0], status: response.status() });
  });
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle", timeout: 120000 });
  const consent = page.getByRole("button", { name: "No thanks", exact: true });
  if (await consent.isVisible()) await consent.click();
  await page.getByRole("button", { name: "Sign in or create account", exact: true }).click();
  const signupDialog = page.getByRole("dialog");
  await signupDialog.getByRole("tab", { name: "Create account", exact: true }).click();
  await signupDialog.getByLabel("First name", { exact: true }).fill("Test");
  await signupDialog.getByLabel("Last name", { exact: true }).fill("Runner");
  await signupDialog.getByLabel("Country", { exact: true }).selectOption("England");
  await signupDialog
    .getByLabel("Town, city, postcode or ZIP code", { exact: true })
    .fill("Norwich");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Continue with Google", exact: true })
    .click();
  await page.waitForURL(`${origin}/athlete-account?section=potential`, { timeout: 120000 });
  await page.getByRole("heading", { name: "Search your race results", exact: true }).waitFor();
  const session = await page.evaluate(async () => (await fetch("/api/auth/get-session")).json());
  assert.equal(session.user.email, `${oauthIdentity}@example.test`);
  const tokenCookie = (await context.cookies()).find(
    (cookie) => cookie.name === "__Host-grok-auth.session_token",
  );
  assert(tokenCookie?.secure && tokenCookie.httpOnly && tokenCookie.sameSite === "Lax");
  assert.equal(tokenCookie.domain, "127.0.0.1");
  assert.equal(tokenCookie.path, "/");
  console.log(
    "PASS: mobile Google redirect, real OAuth state/callback, secure host-only session and post-login account.",
  );
  stage = "profile-setup";
  await page.getByLabel("Full racing name", { exact: true }).fill("Test");
  await page.getByRole("checkbox", { name: /I acknowledge the/ }).check();
  await page.getByRole("button", { name: "Save and find my results", exact: true }).click();
  await page.getByText("Your profile is in our review queue.", { exact: false }).waitFor();
  // Let post-save invalidations finish before deliberately unloading the page.
  // This baseline scenario tests settled navigation, not cancellation of in-flight requests.
  await page.waitForLoadState("networkidle");
  stage = "account-reload";
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Search your race results", exact: true }).waitFor();
  stage = "private-profile";
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await page.waitForURL(`${origin}/my-athlete-profile`);
  await page.getByRole("heading", { name: "Test", exact: true }).waitFor();
  stage = "private-calendar";
  await page.goto(`${origin}/my-race-calendar`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Create subscription link", exact: true }).waitFor();
  const events = (
    await database.query(
      "select kind,error_code,route from athlete_access_events where outcome='error'",
    )
  ).rows;
  console.log(
    JSON.stringify({
      errors,
      networkFailures,
      failedRequests: requests.filter((r) => r.status >= 400),
      events,
    }),
  );
  assert.deepEqual(errors, []);
  // The OAuth full-page redirect can cancel Better Auth's background refresh
  // after sign-out. WebKit reports this as TypeError, and the current app logs it.
  // Accept only an observed cancellation of that specific request during sign-in;
  // retain the evidence above and fail on every other network/data error.
  const isAuthRedirectCancellation = (failure) =>
    failure.stage === "sign-in" &&
    failure.url === `${origin}/api/auth/get-session` &&
    ["Load request cancelled", "net::ERR_ABORTED"].includes(failure.error);
  const sawAuthRedirectCancellation = networkFailures.some(isAuthRedirectCancellation);
  assert.deepEqual(
    networkFailures.filter((failure) => !isAuthRedirectCancellation(failure)),
    [],
  );
  assert.deepEqual(
    events.filter(
      (event) =>
        !(
          sawAuthRedirectCancellation &&
          event.kind === "network_error" &&
          event.error_code === "TypeError" &&
          event.route === "/athlete-account"
        ),
    ),
    [],
  );
  assert.deepEqual(
    requests.filter((r) => r.status >= 400),
    [],
  );
  console.log(
    "PASS: first-name-only setup, reload, private profile and private calendar remain signed in without data errors.",
  );
  if (process.argv.includes("--faults")) {
    stage = "injected-profile-data-failure";
    failureMode = "profile-data";
    const reportReceived = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/diagnostics" && response.status() === 204,
    );
    await page.goto(`${origin}/my-athlete-profile`, { waitUntil: "networkidle" });
    await page
      .getByText("Your private Athlete Profile could not be loaded.", { exact: false })
      .waitFor();
    await reportReceived;
    assert(injectedFailures > 0);
    const duringFailure = await page.evaluate(async () =>
      (await fetch("/api/auth/get-session")).json(),
    );
    assert.equal(
      duringFailure.user.email,
      `${oauthIdentity}@example.test`,
      "A failed data read does not end the session",
    );
    const dataReports = (
      await database.query(
        "select kind,error_code,route,user_id from athlete_access_events where kind='data_query_error'",
      )
    ).rows;
    assert(
      dataReports.some(
        (event) =>
          event.error_code === "Error" &&
          event.route === "/my-athlete-profile" &&
          event.user_id === session.user.id,
      ),
    );
    assert.equal(await page.getByText("Something went wrong", { exact: true }).count(), 0);
    console.log(
      "PASS: injected profile HTTP 503 produces an authenticated data-query error and a recoverable inline message, not a lost session.",
    );
    failureMode = null;
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Test", exact: true }).waitFor();
    console.log("PASS: profile recovers after the data service returns without signing in again.");

    for (const [route, heading] of [
      ["/my-athlete-profile", "Test"],
      ["/athlete-account?section=potential", "Search your race results"],
    ]) {
      stage = "injected-session-check-failure";
      failureMode = "session-check";
      injectedFailures = 0;
      await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
      await page
        .getByRole("heading", { name: "We couldn’t check your sign-in", exact: true })
        .waitFor();
      assert.equal(
        await page
          .getByRole("heading", { name: /Sign in (?:to view your profile|or create your account)/ })
          .count(),
        0,
      );
      assert(injectedFailures > 0);
      assert(
        (await context.cookies()).some(
          (cookie) => cookie.name === "__Host-grok-auth.session_token",
        ),
      );
      failureMode = null;
      const retainedSession = await page.evaluate(async () =>
        (await fetch("/api/auth/get-session")).json(),
      );
      assert.equal(retainedSession.user.id, session.user.id);
      await page.getByRole("button", { name: "Try again", exact: true }).click();
      await page.getByRole("heading", { name: heading, exact: true }).waitFor();
    }
    assert.deepEqual(errors, [], "Neither injected failure should crash rendering");
    console.log(
      "PASS: account/profile session-check failures show a retry state and recover without another Google login.",
    );
    await context.clearCookies();
    await page.goto(`${origin}/my-athlete-profile`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", { name: "Sign in to view your profile", exact: true })
      .waitFor();
    assert.equal(await page.getByRole("heading", { name: "Test", exact: true }).count(), 0);
    console.log(
      "PASS: genuinely signed-out visitors still see the sign-in gate and no private profile.",
    );
  }
} catch (error) {
  if (browser) {
    const page = browser.contexts()[0]?.pages()[0];
    if (page)
      console.error(
        "FAIL page:",
        page.url(),
        (await page.locator("body").innerText()).slice(-4000),
      );
  }
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
  rmSync(temp, { recursive: true, force: true });
}
