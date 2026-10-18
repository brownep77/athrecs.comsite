// Actual app -> issued authentication cookie -> onboarding RPC -> disposable PGlite.
// All accounts and details below are fictional. No real delivery, app-route mocks,
// production database, or athlete identity/ownership changes are permitted.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "vite";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const port = Number(process.env.ATHRECS_ONBOARDING_TEST_PORT || 18257);
assert(Number.isSafeInteger(port) && port > 1024 && port < 65536);
const origin = `http://127.0.0.1:${port}`;
const inheritedFetch = globalThis.fetch;
const savedEnvironment = new Map();
const environment = {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_INVITATION_RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  ATHRECS_STAFF_EMAILS: "",
  VERCEL_ENV: "",
  VERCEL_GIT_COMMIT_REF: "",
  VERCEL_PROJECT_PRODUCTION_URL: "",
  VITE_SITE_BRAND: "athrecs",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "member-onboarding-test-only-secret-at-least-32-characters",
};
for (const [key, value] of Object.entries(environment)) {
  savedEnvironment.set(key, process.env[key]);
  process.env[key] = value;
}
const externalServerRequests = [];
globalThis.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (new URL(url, origin).origin !== origin) {
    externalServerRequests.push(url);
    throw new Error(`Test forbids external server requests: ${new URL(url).origin}`);
  }
  return inheritedFetch(input, init);
};

let server;
let database;
let browser;
let currentPage;
const pageErrors = [];
const serverFailures = [];
const outcomes = [];

async function assertFits(page, description) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    `${description} has no horizontal overflow`,
  );
}

async function assertReachable(button, description) {
  await button.scrollIntoViewIfNeeded();
  assert(
    await button.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
      );
    }),
    `${description} is not obscured by navigation or a floating panel`,
  );
  await button.click({ trial: true });
}

async function forbiddenChanges(sql, userId) {
  const [counts] = await sql`select
    (select count(*)::int from athlete_account_links where user_id=${userId}) as links,
    (select count(*)::int from result_claims where claimant_user_id=${userId}) as claims,
    (select count(*)::int from athlete_profile_result_confirmations where user_id=${userId}) as confirmations,
    (select count(*)::int from athlete_result_proposals where submitted_by=${userId}) as proposals,
    (select count(*)::int from athlete_account_consents where user_id=${userId} and status='granted') as consents`;
  assert.deepEqual(counts, { links: 0, claims: 0, confirmations: 0, proposals: 0, consents: 0 });
  const welcomes =
    await sql`select attempts,sent_at from signup_welcome_deliveries where user_id=${userId}`;
  assert(
    welcomes.every((row) => row.attempts === 0 && row.sent_at === null),
    "Onboarding sends no welcome email",
  );
}

async function signUp(sql, scenario) {
  const context = await browser.newContext({ viewport: scenario.viewport });
  // Only local HTTP requests reach this actual app. Remote font and asset reads
  // are blocked; no local route, server function, auth response or RPC is mocked.
  await context.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
  );
  const credentials = {
    email: `member-onboarding-${scenario.id}@example.test`,
    password: "Fictional-onboarding-password-123!",
  };
  const signup = await context.request.post(`${origin}/api/auth/sign-up/email`, {
    headers: { origin },
    data: { ...credentials, name: "Synthetic Placeholder" },
  });
  assert.equal(signup.status(), 200, await signup.text());
  const { user } = await signup.json();
  assert(user?.id, "Real signup issued an account identifier");
  // This is the explicit email-verification precondition, not a simulated
  // authentication response. Sign-in below issues a fresh genuine session.
  await sql`update "user" set name='',"emailVerified"=true where id=${user.id}`;
  await context.clearCookies();
  const signin = await context.request.post(`${origin}/api/auth/sign-in/email`, {
    headers: { origin },
    data: credentials,
  });
  assert.equal(signin.status(), 200, await signin.text());
  assert(
    (await context.cookies()).some((cookie) => /session_token/.test(cookie.name)),
    "Authentication issued the browser a real session cookie",
  );
  const session = await context.request.get(`${origin}/api/auth/get-session`);
  assert.equal(session.status(), 200);
  const authenticated = await session.json();
  assert.equal(authenticated.user.id, user.id);
  assert.equal(authenticated.user.emailVerified, true);
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on("pageerror", (error) =>
    pageErrors.push({ scenario: scenario.id, message: error.message }),
  );
  page.on("response", (response) => {
    if (response.url().startsWith(`${origin}/`) && response.status() >= 500) {
      serverFailures.push({
        scenario: scenario.id,
        status: response.status(),
        url: response.url(),
      });
    }
  });
  return { context, page, user };
}

async function runScenario(sql, roles, scenario) {
  const { context, page, user } = await signUp(sql, scenario);
  currentPage = page;
  try {
    await forbiddenChanges(sql, user.id);
    await page.goto(`${origin}${scenario.destination}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    const form = page.getByRole("form", { name: "Complete your profile", exact: true });
    await form.waitFor();
    await page.waitForURL((url) => url.pathname === "/join");
    assert.equal(
      new URL(page.url()).searchParams.get("returnTo"),
      scenario.destination,
      "The real root gate preserves the requested destination",
    );
    await assertFits(page, `${scenario.id} initial form`);
    for (const role of roles) {
      const checkbox = form.getByRole("checkbox", { name: role.label, exact: true });
      assert.equal(await checkbox.count(), 1, `Role ${role.label} has one labelled checkbox`);
      if (await checkbox.isChecked()) await checkbox.uncheck();
    }
    for (const roleValue of scenario.roles) {
      const role = roles.find((item) => item.value === roleValue);
      assert(role);
      await form.getByRole("checkbox", { name: role.label, exact: true }).check();
    }
    await form.getByLabel("First names", { exact: true }).fill(scenario.firstName);
    await page.keyboard.press("Tab");
    assert(
      await form
        .getByLabel("Last name", { exact: true })
        .evaluate((element) => element === document.activeElement),
      "Keyboard Tab reaches the next identity field",
    );
    await form.getByLabel("Last name", { exact: true }).fill("Synthetic");
    await form.getByLabel("Country of residence", { exact: true }).fill("United Kingdom");
    if (scenario.athlete) {
      await form.getByLabel("Main sport", { exact: true }).selectOption("Running");
      await form.getByLabel("Nationality", { exact: true }).fill("British");
      await form.getByLabel("Date of birth", { exact: true }).fill("1985-06-07");
      await form.getByLabel("Postcode / ZIP / area (private)", { exact: true }).fill("NR1");
      await form.getByLabel(/Current club/).fill("Fictional Testing Harriers");
      await form.getByText("Your kit and nutrition — optional", { exact: true }).click();
      await form
        .getByLabel("Trainer / equipment brands (comma separated)", { exact: true })
        .fill("Fictional Shoe Brand");
      await form
        .getByLabel("Trainer models (comma separated)", { exact: true })
        .fill("Fictional Shoe Model");
      await form
        .getByLabel("Sports clothing brands (comma separated)", { exact: true })
        .fill("Fictional Clothing Brand");
      await form
        .getByLabel("Watch / devices (comma separated)", { exact: true })
        .fill("Fictional Watch");
      await form
        .getByLabel("Training apps (comma separated)", { exact: true })
        .fill("Fictional Training App");
      await form
        .getByLabel("Nutrition brands (comma separated)", { exact: true })
        .fill("Fictional Nutrition Brand");
      await form
        .getByLabel("Nutrition products (comma separated)", { exact: true })
        .fill("Fictional Nutrition Product");
    } else {
      const dob = form.getByLabel("Date of birth", { exact: true });
      if (await dob.count())
        assert.equal(
          await dob.evaluate((element) => element.required),
          false,
          "A supporter is not required to supply athlete identity fields",
        );
    }
    await form.getByRole("checkbox", { name: /I have read/ }).check();
    await assertFits(page, `${scenario.id} completed form`);
    await page.screenshot({
      path: `artifacts/member-onboarding-live-${scenario.id}-form.png`,
      fullPage: true,
    });
    const save = form.getByRole("button", {
      name: scenario.athlete ? "Save profile and find my results" : "Save profile and continue",
      exact: true,
    });
    await assertReachable(save, `${scenario.id} save button`);
    await save.click();
    await page.waitForURL((url) => `${url.pathname}${url.search}` === scenario.destination, {
      timeout: 120000,
    });
    await page.waitForLoadState("networkidle");
    await assertFits(page, `${scenario.id} destination`);
    const [member] =
      await sql`select first_name,last_name,roles from member_onboarding where user_id=${user.id}`;
    assert.deepEqual(member, {
      first_name: scenario.firstName,
      last_name: "Synthetic",
      roles: scenario.roles,
    });
    const [profile] =
      await sql`select full_name,country,date_of_birth,postcode,nationality from athlete_private_profiles where user_id=${user.id}`;
    assert.equal(profile.full_name, `${scenario.firstName} Synthetic`);
    assert.equal(profile.country, "United Kingdom");
    if (scenario.athlete) {
      assert.equal(profile.date_of_birth, "1985-06-07");
      assert.equal(profile.postcode, "NR1");
      assert.equal(profile.nationality, "British");
      const [preferences] =
        await sql`select equipment_brands,equipment_models,clothing_brands,technology_devices,technology_apps,nutrition_brands,nutrition_products from athlete_product_preferences where user_id=${user.id}`;
      assert.deepEqual(preferences, {
        equipment_brands: ["Fictional Shoe Brand"],
        equipment_models: ["Fictional Shoe Model"],
        clothing_brands: ["Fictional Clothing Brand"],
        technology_devices: ["Fictional Watch"],
        technology_apps: ["Fictional Training App"],
        nutrition_brands: ["Fictional Nutrition Brand"],
        nutrition_products: ["Fictional Nutrition Product"],
      });
    } else assert.equal(profile.date_of_birth, null);
    await forbiddenChanges(sql, user.id);
    const initialConsentChoices =
      await sql`select purpose,status from athlete_account_consents where user_id=${user.id} order by purpose`;
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(
      `${new URL(page.url()).pathname}${new URL(page.url()).search}`,
      scenario.destination,
      "A completed account reload does not re-enter onboarding",
    );
    await page.screenshot({
      path: `artifacts/member-onboarding-live-${scenario.id}-saved.png`,
      fullPage: true,
    });
    await page.goto(
      `${origin}/join?step=edit&returnTo=${encodeURIComponent(scenario.destination)}`,
      { waitUntil: "networkidle" },
    );
    await form.waitFor();
    assert.equal(
      await form.getByLabel("First names", { exact: true }).inputValue(),
      scenario.firstName,
    );
    assert.equal(await form.getByLabel("Last name", { exact: true }).inputValue(), "Synthetic");
    for (const role of roles)
      assert.equal(
        await form.getByRole("checkbox", { name: role.label, exact: true }).isChecked(),
        scenario.roles.includes(role.value),
        "Saved roles restore accurately",
      );
    await form.getByLabel("First names", { exact: true }).fill(`${scenario.firstName} Renée`);
    await save.click();
    await page.waitForURL((url) => `${url.pathname}${url.search}` === scenario.destination, {
      timeout: 120000,
    });
    const [edited] =
      await sql`select first_name,roles from member_onboarding where user_id=${user.id}`;
    assert.equal(edited.first_name, `${scenario.firstName} Renée`);
    assert.deepEqual(edited.roles, scenario.roles);
    assert.equal(
      (await sql`select user_id from member_onboarding where user_id=${user.id}`).length,
      1,
      "Editing updates the same account rather than duplicating onboarding",
    );
    await forbiddenChanges(sql, user.id);
    assert.deepEqual(
      await sql`select purpose,status from athlete_account_consents where user_id=${user.id} order by purpose`,
      initialConsentChoices,
      "Editing the onboarding form preserves consent choices",
    );
    await assertFits(page, `${scenario.id} edited destination`);
    outcomes.push(
      `${scenario.id}: real issued session, root gate, profile/roles/kit persistence, preserved destination, reload/edit and no claims/links/consent grants/email`,
    );
    console.log(`PASS ${outcomes.at(-1)}`);
  } catch (error) {
    await page
      .screenshot({
        path: `artifacts/member-onboarding-live-${scenario.id}-failure.png`,
        fullPage: true,
      })
      .catch(() => {});
    await writeFile(
      `artifacts/member-onboarding-live-${scenario.id}-failure.html`,
      await page.content(),
    ).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

try {
  await mkdir("artifacts", { recursive: true });
  server = await createServer({
    cacheDir: "node_modules/.vite-member-onboarding-live",
    server: { host: "127.0.0.1", port, strictPort: true },
  });
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  assert.equal(db.dbSource, "pglite", "Only disposable in-memory Postgres is permitted");
  database = await db.getPglite();
  const sql = await db.getSql();
  await (await server.ssrLoadModule("/src/lib/athrecs/seed.server.ts")).ensureAthrecsSeeded();
  const { MEMBER_ROLES } = await server.ssrLoadModule("/src/lib/athrecs/member-onboarding.ts");
  const roles = Object.entries(MEMBER_ROLES).map(([value, label]) => ({ value, label }));
  const installedShell =
    "/root/.cache/ms-playwright/chromium_headless_shell-1169/chrome-linux/headless_shell";
  const executablePath =
    process.env.ATHRECS_BROWSER_EXECUTABLE ||
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    (existsSync(installedShell) ? installedShell : undefined);
  browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  for (const scenario of [
    {
      id: "desktop-athlete",
      viewport: { width: 1280, height: 900 },
      firstName: "Avery Desktop",
      roles: ["athlete", "coach"],
      athlete: true,
      destination: "/athlete-account?section=potential",
    },
    {
      id: "mobile-athlete",
      viewport: { width: 390, height: 844 },
      firstName: "Avery Mobile",
      roles: ["athlete"],
      athlete: true,
      destination: "/athlete-account?section=potential",
    },
    {
      id: "mobile-supporter",
      viewport: { width: 320, height: 700 },
      firstName: "Casey",
      roles: ["supporter"],
      athlete: false,
      destination: "/clubs/register",
    },
  ])
    await runScenario(sql, roles, scenario);
  assert.deepEqual(pageErrors, [], "No browser JavaScript errors");
  assert.deepEqual(serverFailures, [], "No first-party 5xx responses");
  assert.deepEqual(externalServerRequests, [], "No email or other external service request");
  console.log(
    `PASS: ${outcomes.length} complete real-app onboarding journeys. Synthetic accounts only; no real emails or production writes.`,
  );
} catch (error) {
  if (currentPage && !currentPage.isClosed()) {
    await currentPage
      .screenshot({ path: "artifacts/member-onboarding-live-failure.png", fullPage: true })
      .catch(() => {});
    await writeFile(
      "artifacts/member-onboarding-live-failure.html",
      await currentPage.content(),
    ).catch(() => {});
  }
  console.error(JSON.stringify({ pageErrors, serverFailures, externalServerRequests }, null, 2));
  throw error;
} finally {
  await browser?.close();
  await server?.close();
  await database?.close();
  globalThis.fetch = inheritedFetch;
  for (const [key, value] of savedEnvironment) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
