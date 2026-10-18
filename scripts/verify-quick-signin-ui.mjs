import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "playwright";
import { hashPassword } from "better-auth/crypto";

// Isolated local database and intercepted delivery: no production writes or mail.
const delivery = !process.argv.includes("--no-email");
const runrecs = process.argv.includes("--runrecs");
const origin = "http://127.0.0.1:18229";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  VITE_AUTH_ENABLED: "true",
  VITE_SITE_BRAND: runrecs ? "runrecs" : "athrecs",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "quick-signin-test-only-secret-at-least-32-characters",
  RESEND_API_KEY: delivery ? "test-resend-key" : "",
  AUTH_EMAIL_FROM: "ATHRECS Test <accounts@example.test>",
  GROK_AUTH_CLIENT_ID: "",
  GROK_AUTH_CLIENT_SECRET: "",
  GOOGLE_CLIENT_ID: "test-google",
  GOOGLE_CLIENT_SECRET: "test-google-secret",
  MICROSOFT_CLIENT_ID: "test-microsoft",
  MICROSOFT_CLIENT_SECRET: "test-microsoft-secret",
  APPLE_CLIENT_ID: "test.athrecs.web",
  APPLE_TEAM_ID: "TESTTEAM01",
  APPLE_KEY_ID: "TESTKEY001",
  APPLE_PRIVATE_KEY: generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  }).privateKey,
});
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    assert(delivery);
    const email = JSON.parse(init.body);
    assert(email.to.every((to) => to.endsWith("@example.test")));
    sent.push(email);
    return Response.json({ id: `test-email-${sent.length}` });
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18229, strictPort: true } });
let browser;
let database;
const errors = [];
const failures = [];
async function check(label, action) {
  try {
    await action();
    console.log(`PASS: ${label}`);
  } catch (error) {
    failures.push(`${label}: ${error.message}`);
    console.error(`FAIL: ${label}: ${error.message}`);
  }
}
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  await mkdir("artifacts", { recursive: true });
  // Optional visual review using the installed browser skill's CLI.
  if (process.env.AUTH_UI_AGENT_BROWSER) {
    const run = promisify(execFile);
    const command = process.env.AUTH_UI_AGENT_BROWSER;
    const args = ["--session", "athrecs-quick-signin"];
    await run(command, [...args, "open", `${origin}/athlete-account?auth=1`]);
    await run(command, [...args, "wait", '[role="dialog"] input[type="email"]']);
    console.log((await run(command, [...args, "snapshot", "-i"])).stdout);
    console.log((await run(command, [...args, "errors"])).stdout);
    await run(command, [...args, "screenshot", "artifacts/quick-signin-agent-browser.png"]);
    await run(command, [...args, "close"]);
  }
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(120000);
  page.on("pageerror", (error) => errors.push(error.message));
  const clearSession = async () => {
    await context.clearCookies();
    await context.setExtraHTTPHeaders({});
    await page.evaluate(() => sessionStorage.removeItem("grok-auth.bearer-token"));
  };
  const submitWithIssuedSession = async (endpoint, callback, action) => {
    let signedIn;
    let transportError;
    let finishTransport;
    const transportReady = new Promise((resolve) => { finishTransport = resolve; });
    // Pass the unchanged UI request to the real auth endpoint, then forward the
    // exact issued response. Reading it before fulfillment avoids Chromium
    // losing the response body when the successful UI immediately redirects.
    await page.route(`${origin}/api/auth/${endpoint}`, async (route) => {
      try {
        assert.equal(route.request().method(), "POST");
        const response = await route.fetch();
        assert.equal(response.status(), 200, await response.text());
        signedIn = await response.json();
        assert(signedIn.token, "The actual UI sign-in response issued a genuine session token");
        // Production Secure __Host cookies require HTTPS. The HTTP-loopback
        // fixture uses the app's existing bearer-session mechanism with this
        // actual token, installed before returning the same auth response.
        await context.setExtraHTTPHeaders({ authorization: `Bearer ${signedIn.token}` });
        await page.evaluate((token) => {
          sessionStorage.setItem("grok-auth.bearer-token", token);
        }, signedIn.token);
        await route.fulfill({ response });
      } catch (error) {
        transportError = error;
        await route.abort();
      } finally {
        finishTransport();
      }
    }, { times: 1 });
    await action();
    await transportReady;
    if (transportError) throw transportError;
    assert(signedIn?.token, "Successful UI sign-in uses the real issued session");
    await page.waitForURL((url) =>
      `${url.pathname}${url.search}` === callback ||
      (url.pathname === "/join" && url.searchParams.get("returnTo") === callback),
    );
  };
  const open = async (mode = "signin", callback = "/athlete-account") => {
    await page.goto(
      `${origin}/athlete-account?auth=1&authMode=${mode}&returnTo=${encodeURIComponent(callback)}`,
      { waitUntil: "networkidle" },
    );
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Continue with Google", exact: true }).waitFor();
    return dialog;
  };
  const completeOnboarding = async (firstName, lastName, role = "athlete") => {
    await page.getByRole("heading", { name: "Complete your profile", exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/join", "New accounts pass through onboarding");
    const intended = new URL(page.url()).searchParams.get("returnTo");
    assert(intended?.startsWith("/athlete-account"), "Onboarding preserves the account destination");
    await page.getByLabel("First names", { exact: true }).fill(firstName);
    await page.getByLabel("Last name", { exact: true }).fill(lastName);
    await page.getByLabel("Country of residence", { exact: true }).fill("United Kingdom");
    if (role === "athlete") {
      await page.getByLabel("Main sport", { exact: true }).selectOption("Running");
      await page.getByLabel("Nationality", { exact: true }).fill("British");
      await page.getByLabel("Date of birth", { exact: true }).fill("1990-01-01");
      await page.getByLabel("Postcode / ZIP / area (private)", { exact: true }).fill("NR1");
    } else {
      assert.equal(role, "supporter", "The test uses a supported alternate onboarding role");
      await page.getByRole("checkbox", { name: "Athlete", exact: true }).uncheck();
      await page.getByRole("checkbox", { name: "Supporter / spectator", exact: true }).check();
      assert.equal(await page.getByLabel("Date of birth", { exact: true }).count(), 0);
      assert.equal(await page.getByLabel("Nationality", { exact: true }).count(), 0);
      assert.equal(await page.getByLabel("Postcode / ZIP / area (private)", { exact: true }).count(), 0);
    }
    await page.getByRole("checkbox", { name: /I have read the privacy notice/ }).check();
    await page.getByRole("button", {
      name: role === "athlete" ? "Save profile and find my results" : "Save profile and continue",
      exact: true,
    }).click();
  };
  let dialog = await open();
  if (!delivery || runrecs) {
    await dialog.getByRole("tab", { name: "Create account", exact: true }).click();
    assert.equal(
      await dialog.locator('input[autocomplete="new-password"]').count(),
      runrecs ? 2 : 1,
    );
    assert.equal(
      await dialog.getByRole("button", { name: "Continue with email", exact: true }).count(),
      0,
    );
    assert.equal(await dialog.getByRole("button", { name: "Forgotten your password?" }).count(), 0);
    if (!delivery) {
      assert.equal(
        await dialog.getByRole("button", { name: "Continue with an email code" }).count(),
        0,
      );
    }
    if (runrecs) assert.equal(await dialog.getByRole("checkbox").count(), 0);
    console.log(
      `PASS: ${runrecs ? "RunRecs keeps its existing chooser" : "Password fallback works without email delivery"}.`,
    );
  } else {
    // A provider can fail after returning HTTP 200 (for example, a bad proxy).
    await page.route("**/api/auth/sign-in/social", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
    );
    await dialog.getByRole("button", { name: "Continue with Google", exact: true }).click();
    await check("Malformed provider response leaves an actionable error", async () => {
      await dialog.getByRole("alert").waitFor({ timeout: 10000 });
      assert(
        await dialog.getByRole("button", { name: "Continue with email", exact: true }).isEnabled(),
      );
    });
    await page.unroute("**/api/auth/sign-in/social");
    dialog = await open();

    // Existing accounts can predate today's new-password minimum.
    const legacyEmail = "legacy-runner@example.test";
    const signup = await fetch(`${origin}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({
        email: legacyEmail,
        name: "Legacy Test Runner",
        password: "Initial-password-123!",
      }),
    });
    assert.equal(signup.status, 200, await signup.clone().text());
    const legacyId = (await signup.json()).user.id;
    const legacyPassword = "Older123";
    await database.query('update "user" set "emailVerified"=true where id=$1', [legacyId]);
    await database.query(
      'update account set password=$1 where "userId"=$2 and "providerId"=\'credential\'',
      [await hashPassword(legacyPassword), legacyId],
    );
    const legacyLogin = await fetch(`${origin}/api/auth/sign-in/email`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify({ email: legacyEmail, password: legacyPassword }),
    });
    assert.equal(legacyLogin.status, 200, "The server accepts the existing credential");
    await dialog.getByRole("button", { name: "Use a password instead" }).click();
    await dialog.getByLabel("Email address", { exact: true }).fill(legacyEmail);
    await dialog.getByLabel("Password", { exact: true }).fill(legacyPassword);
    await submitWithIssuedSession("sign-in/email", "/athlete-account", () =>
      dialog.getByRole("button", { name: "Sign in with email", exact: true }).click(),
    );
    await check("Existing shorter passwords work through the UI and reach onboarding", async () => {
      await page.getByRole("heading", { name: "Complete your profile", exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/join");
    });
    await clearSession();
    dialog = await open();
    assert.equal(await dialog.getByRole("heading", { name: "Welcome to AthRecs" }).count(), 1);
    assert.equal(await dialog.getByRole("textbox").count(), 1);
    assert.equal(await dialog.locator('input[type="password"],input[type="date"]').count(), 0);
    assert.equal(
      await dialog.getByRole("checkbox", { name: /Find my race results/ }).isChecked(),
      false,
    );
    assert.equal(await dialog.getByRole("button", { name: "Continue with Microsoft" }).count(), 0);
    await dialog.getByRole("button", { name: "More sign-in options" }).click();
    await dialog.getByRole("button", { name: "Continue with Microsoft" }).waitFor();
    await dialog.getByRole("button", { name: "Fewer sign-in options" }).click();
    await page.screenshot({ path: "artifacts/quick-signin-desktop.png" });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(
      await dialog.getByRole("button", { name: "Continue with email", exact: true }).isVisible(),
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: "artifacts/quick-signin-mobile.png" });
    await dialog.getByRole("button", { name: "Use a password instead" }).click();
    await dialog.getByRole("button", { name: "Forgotten your password?" }).click();
    await dialog.getByRole("button", { name: "Send password-reset link" }).waitFor();
    await dialog.getByRole("button", { name: "Back to sign in" }).click();
    await dialog.getByRole("tab", { name: "Create account", exact: true }).click();
    assert.equal(await dialog.locator('input[autocomplete="new-password"]').count(), 1);
    await dialog.getByRole("button", { name: "Continue with an email code" }).click();
    await dialog.getByRole("button", { name: "Continue with email", exact: true }).waitFor();

    // Both code signup and an explicit signup link start with only an email.
    dialog = await open("signup");
    assert.equal(await dialog.getByRole("textbox").count(), 1);
    await dialog.getByRole("checkbox", { name: /Find my race results/ }).check();
    await dialog.getByLabel("Email address", { exact: true }).fill("quick-runner@example.test");
    await dialog.getByRole("button", { name: "Continue with email", exact: true }).click();
    await dialog.getByLabel("Six-digit code", { exact: true }).waitFor();
    assert(await dialog.getByRole("button", { name: /Resend code in/ }).isDisabled());
    const code = sent
      .findLast((mail) => mail.to.includes("quick-runner@example.test"))
      .text.match(/\b([0-9]{6})\b/)[1];
    await dialog
      .getByLabel("Six-digit code", { exact: true })
      .fill(code === "000000" ? "111111" : "000000");
    await dialog.getByRole("button", { name: "Verify code and continue" }).click();
    await dialog.getByRole("alert").waitFor();
    await dialog.getByLabel("Six-digit code", { exact: true }).fill(code);
    await submitWithIssuedSession("sign-in/email-otp", "/athlete-account?section=potential", () =>
      dialog.getByRole("button", { name: "Verify code and continue" }).click(),
    );
    await completeOnboarding("Quick Signup", "Runner");
    await page.waitForURL(`${origin}/athlete-account?section=potential`);
    assert.equal(await page.getByLabel("Full racing name", { exact: false }).count(), 0,
      "The quick-name form is unnecessary after onboarding has captured the name");
    await page.setViewportSize({ width: 1280, height: 900 });
    // A draft consent choice must not be committed by the separate name form.
    await page.locator('a[href="/athlete-account?section=privacy"]').first().click();
    await page.getByRole("checkbox", { name: /Marketing emails/ }).check();
    await page.locator('a[href="/athlete-account?section=potential"]').first().click();
    await database.exec(`
      insert into events (id, slug, name, sport, surface, country) values (990021, 'quick-signin-test', 'Quick Signin Test 10K', 'Athletics', 'Road', 'United Kingdom');
      insert into editions (id, event_id, event_date, distance_code, distance_km) values (990021, 990021, '2026-09-01', '10K', 10);
      insert into athletes (id, slug, display_name, profile_visibility) values (990021, 'quick-signin-runner', 'Quick Signup Runner', 'private');
      insert into results (id, edition_id, athlete_id, finish_time_seconds) values (990021, 990021, 990021, 2400);
    `);
    // Onboarding has already collected the name, so the quick-name form is hidden.
    // Exercise its real authenticated client RPC with the same saved name while
    // the account UI holds an unsaved marketing draft. This keeps the original
    // narrow-save consent regression without bypassing or mocking onboarding.
    const narrowlySaved = await page.evaluate(async () => {
      const { saveMyAthleteRacingName } = await import("/src/lib/athrecs/athlete-account-api.ts");
      return saveMyAthleteRacingName({
        data: { fullName: "Quick Signup Runner", privacyAcknowledged: true },
      });
    });
    assert.equal(narrowlySaved.fullName, "Quick Signup Runner");
    assert.equal(narrowlySaved.consents.marketing, false,
      "The quick-name API does not receive or grant the UI marketing draft");
    // The synthetic result was added after the panel initially queried the
    // database; use its normal search control to request the new source row.
    await page.getByLabel("Racing name", { exact: true }).fill("Quick Signup Runner");
    await page.getByRole("button", { name: "Search stored results", exact: true }).click();
    await page.getByRole("heading", { name: "Potential results matching your name" }).waitFor();
    await page
      .getByRole("article")
      .filter({ hasText: "Quick Signin Test 10K" })
      .getByRole("button", { name: "Claim profile & review all results", exact: true })
      .waitFor();
    const userId = (
      await database.query('select id from "user" where email = $1', ["quick-runner@example.test"])
    ).rows[0].id;
    const profile = (
      await database.query(
        "select full_name, date_of_birth, postcode, country, nationality from athlete_private_profiles where user_id=$1",
        [userId],
      )
    ).rows[0];
    assert.deepEqual(profile, {
      full_name: "Quick Signup Runner",
      date_of_birth: "1990-01-01",
      postcode: "NR1",
      country: "United Kingdom",
      nationality: "British",
    });
    await check("Saving a racing name does not grant draft consent", async () =>
      assert.equal(
        (
          await database.query(
            "select count(*)::int as n from athlete_account_consents where user_id=$1 and status='granted'",
            [userId],
          )
        ).rows[0].n,
        0,
      ),
    );
    await page.locator('a[href="/athlete-account?section=privacy"]').first().click();
    assert(
      await page.getByRole("checkbox", { name: /Marketing emails/ }).isChecked(),
      "Unsaved consent edits are retained as drafts",
    );
    await page.reload({ waitUntil: "networkidle" });
    await check("Reload discards the unsaved marketing choice", async () => {
      assert.equal(
        await page.getByRole("checkbox", { name: /Marketing emails/ }).isChecked(),
        false,
      );
    });
    assert.equal(
      (
        await database.query(
          "select count(*)::int as n from result_claims where claimant_user_id=$1",
          [userId],
        )
      ).rows[0].n,
      0,
    );
    await clearSession();
    dialog = await open("signup");
    assert.equal(
      await dialog.getByRole("checkbox", { name: /Find my race results/ }).isChecked(),
      false,
    );
    await dialog.getByLabel("Email address", { exact: true }).fill("skip-results@example.test");
    await dialog.getByRole("button", { name: "Continue with email", exact: true }).click();
    await dialog.getByLabel("Six-digit code", { exact: true }).waitFor();
    const skipCode = sent
      .findLast((mail) => mail.to.includes("skip-results@example.test"))
      .text.match(/\b([0-9]{6})\b/)[1];
    await dialog.getByLabel("Six-digit code", { exact: true }).fill(skipCode);
    await submitWithIssuedSession("sign-in/email-otp", "/athlete-account", () =>
      dialog.getByRole("button", { name: "Verify code and continue" }).click(),
    );
    await completeOnboarding("Skip Results", "Supporter", "supporter");
    await page.waitForURL(`${origin}/athlete-account`);
    await page.getByRole("heading", { name: "My races", exact: true }).waitFor();
    assert.equal(await page.getByLabel("Full racing name", { exact: false }).count(), 0);
    const supporterId = (
      await database.query('select id from "user" where email = $1', ["skip-results@example.test"])
    ).rows[0].id;
    assert.deepEqual((await database.query(
      "select full_name, date_of_birth, postcode, nationality from athlete_private_profiles where user_id=$1",
      [supporterId],
    )).rows[0], {
      full_name: "Skip Results Supporter", date_of_birth: null, postcode: null, nationality: null,
    });
    assert.deepEqual((await database.query(
      "select roles from member_onboarding where user_id=$1", [supporterId],
    )).rows[0].roles, ["supporter"]);
    assert.equal((await database.query(
      "select count(*)::int as n from result_claims where claimant_user_id=$1", [supporterId],
    )).rows[0].n, 0, "Supporter onboarding does not submit result claims");
    console.log(
      "PASS: email-only signup, wrong/correct codes, mobile layout, athlete/supporter onboarding, retained account destinations, real quick-name RPC and matching, no automatic claims or consent, password/recovery alternatives and skip path.",
    );
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, [], "All adversarial browser checks must pass");
} catch (error) {
  await browser
    ?.contexts()[0]
    ?.pages()[0]
    ?.screenshot({ path: "artifacts/quick-signin-failure.png" });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
