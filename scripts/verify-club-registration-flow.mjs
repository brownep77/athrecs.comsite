// Real TanStack RPCs, authenticated browser screens and disposable PGlite.
// No production database, external requests or emails are used.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { chromium } from "playwright";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "club-reviewer@example.test";
process.env.BETTER_AUTH_SECRET = "club-flow-test-only-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18243";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({
  cacheDir: "node_modules/.vite-club-flow",
  server: { host: "127.0.0.1", port: 18243, strictPort: true },
});
let database, browser, lastHeaders;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(`${origin}/`), `No external requests: ${new URL(url).origin}`);
  const response = await realFetch(input, init);
  lastHeaders = response.headers;
  return response;
};
const modules = new Map();
async function rpc(file, name, data, token, headers = {}) {
  if (!modules.has(file)) modules.set(file, await (await fetch(`${origin}/src/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} has a real RPC`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      context: {},
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
const clubRpc = (name, data, token, headers) =>
  rpc("lib/clubs/registration-api", name, data, token, headers);
async function signup(name, email) {
  const response = await fetch(`${origin}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ name, email, password: "Synthetic-club-password!" }),
  });
  assert.equal(response.status, 200);
  return response.json();
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  // Seed before adding regression fixtures, using the production facade.
  await rpc("athletics/api", "listClubs", {});
  const clubs = [];
  for (const sport of ["Running", "Swimming", "Cycling", "Triathlon"]) {
    const [club] = await sql`insert into clubs (slug,name,city,county,country,sports)
      values (${`synthetic-flow-${sport.toLowerCase()}`}, ${`Synthetic Flow ${sport}`},
        'Synthetic Town','Synthetic County',${sport === "Triathlon" ? "Ireland" : "England"},${sport})
      returning id,slug,name`;
    clubs.push(club);
    assert(
      (await rpc("athletics/api", "listClubs", { q: club.name })).some((c) => c.id === club.id),
      `${sport} club is discoverable without athletes or results`,
    );
    assert.equal((await rpc("athletics/api", "getClubBySlug", club.slug)).club.id, club.id);
  }
  assert.equal((await rpc("athletics/api", "listClubs", { q: "Synthetic County" })).length, 4);
  const officer = await signup("Synthetic Club Officer", "club-officer@example.test");
  const reviewer = await signup("Synthetic Club Reviewer", "club-reviewer@example.test");
  const stranger = await signup("Synthetic Other Officer", "club-other@example.test");
  const queue = { status: "pending", page: 1 };
  await assert.rejects(() => clubRpc("getMyClubRegistrations"), /Unauthorized/);
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  await assert.rejects(
    () => clubRpc("getClubRegistrationReviewQueue", queue, officer.token),
    /Forbidden/,
  );
  await assert.rejects(
    () => clubRpc("getClubRegistrationReviewQueue", queue, reviewer.token),
    /Forbidden/,
  );
  await sql`insert into account (id,"accountId","providerId","userId","createdAt","updatedAt")
    values ('synthetic-club-google','synthetic-club-google','google',${reviewer.user.id},now(),now())`;
  await sql`update "user" set "emailVerified"=true where id=${reviewer.user.id}`;
  assert.equal((await clubRpc("getClubRegistrationReviewQueue", queue, reviewer.token)).total, 0);
  const { clubDetailsSchema } = await import("../src/lib/clubs/registration.ts");
  const details = clubDetailsSchema.parse({
    clubName: clubs[1].name,
    country: "England",
    city: "Synthetic Town",
    sports: ["Swimming"],
    representativeName: "Synthetic Club Officer",
    representativeRole: "Secretary",
    verificationMethod: "officer_page",
    evidenceUrl: "https://club.example.test/committee",
    authorityDetails: "Fictional appointment for this isolated verification only.",
    adultConfirmed: true,
    authorityConfirmed: true,
    privacyAcknowledged: true,
  });
  const input = { clubId: clubs[1].id, details, submit: true };
  await assert.rejects(
    () => clubRpc("saveClubRegistration", input, officer.token),
    /Verify your account email/,
  );
  await sql`update "user" set "emailVerified"=true where id=${officer.user.id}`;
  await assert.rejects(
    () =>
      clubRpc("saveClubRegistration", input, officer.token, {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () =>
      clubRpc("getClubRegistrationReviewQueue", queue, reviewer.token, {
        "x-forwarded-host": "www.athrecs.com",
      }),
    /staff host required/,
  );
  const before = await sql`select
    (select count(*)::int from athletes) as athletes,
    (select count(*)::int from results) as results,
    (select count(*)::int from athlete_account_links) as ownership,
    (select count(*)::int from result_claims) as claims`;

  const clientApi = await (await fetch(`${origin}/src/lib/athrecs/api.ts`)).text();
  assert.doesNotMatch(
    clientApi,
    /athlete-search-policy\.server|from athletes a|loadPublishedSourceHistories/,
    "Server-only athlete readers are absent from the client module",
  );
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const errors = [];
  function observe(page) {
    page.setDefaultTimeout(30000);
    void page.route("**/*", (route) =>
      new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
    );
    page.on("requestfailed", (r) => {
      if (new URL(r.url()).origin === origin)
        console.error("BROWSER request failed:", r.url(), r.failure()?.errorText);
    });
    page.on("response", (r) => {
      if (r.status() >= 400) console.error("BROWSER response:", r.status(), r.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
  }
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    extraHTTPHeaders: { authorization: `Bearer ${officer.token}` },
  });
  observe(page);
  await page.goto(`${origin}/clubs/register?club=${clubs[1].slug}`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  // Registration is a private route: neither tracking nor consent UI belongs here.
  await page.getByRole("button", { name: "Continue", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("heading", { name: "Help improve ATHRECS", exact: true }).count(),
    0,
  );
  await mkdir("artifacts", { recursive: true });
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 700 },
    { width: 1023, height: 768 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const next = page.getByRole("button", { name: "Continue", exact: true });
    await next.evaluate((element) => element.scrollIntoView({ block: "end" }));
    assert(
      await next.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
      `End-aligned Continue clears the mobile navigation at ${viewport.width}px`,
    );
    await next.click({ trial: true });
    assert(
      await next.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
      `Continue is unobscured at ${viewport.width}px without analytics consent`,
    );
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const primary = page
      .getByRole("navigation", { name: "Primary", exact: true })
      .filter({ visible: true });
    await primary.getByRole("link", { name: "My profile", exact: true }).click({ trial: true });
    if (viewport.width === 390 || viewport.width === 768)
      await page.screenshot({
        path: `artifacts/club-registration-consent-${viewport.width}.png`,
        fullPage: true,
      });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Your full name", { exact: true }).fill(details.representativeName);
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .getByLabel("Your role in the club", { exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.getByLabel("Your role in the club", { exact: true }).fill(details.representativeRole);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Draft saved" }).waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: "2. Your details", exact: true }).click();
  assert.equal(
    await page.getByLabel("Your full name", { exact: true }).inputValue(),
    details.representativeName,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Page showing your club role", { exact: true }).fill(details.evidenceUrl);
  await page
    .getByLabel("Explain your authority and how we can confirm it", { exact: true })
    .fill(details.authorityDetails);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Submit for verification", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Application submitted" }).waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem("athrecs:analytics-consent")), null);
  assert.equal(
    (await sql`select count(*)::int n from site_analytics_events`)[0].n,
    0,
    "Completing registration without analytics consent sends no analytics",
  );
  assert.equal(
    await page.getByRole("heading", { name: "Help improve ATHRECS", exact: true }).count(),
    0,
  );
  assert.equal(await page.locator('script[src*="/_vercel/insights/"]').count(), 0);
  // Exercise the consent controls on the public directory, where they are shown.
  await page.goto(`${origin}/clubs`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Help improve ATHRECS", exact: true }).waitFor();
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  const privacyChoices = page.getByRole("button", { name: "Review analytics privacy choices" });
  assert.equal(await privacyChoices.evaluate((el) => el === document.activeElement), true);
  await page.keyboard.press("Enter");
  await page.getByRole("region", { name: "Help improve ATHRECS" }).waitFor();
  await page.keyboard.press("Tab");
  const privacyNotice = page.getByRole("link", { name: "privacy notice", exact: true });
  assert.equal(await privacyNotice.evaluate((el) => el === document.activeElement), true);
  assert.equal(await privacyNotice.getAttribute("href"), "/privacy#website-statistics");
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .getByRole("button", { name: "Close privacy choices" })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.keyboard.press("Enter");
  assert.equal(await privacyChoices.evaluate((el) => el === document.activeElement), true);
  await page.reload({ waitUntil: "networkidle" });
  await privacyChoices.waitFor();
  assert.equal(await page.getByRole("heading", { name: "Help improve ATHRECS" }).count(), 0);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("athrecs:analytics-consent")),
    "denied",
  );
  await page.goto(`${origin}/clubs/register?club=${clubs[1].slug}`, { waitUntil: "networkidle" });
  assert.equal(
    await page.getByRole("heading", { name: "Help improve ATHRECS", exact: true }).count(),
    0,
  );
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    "Mobile form has no overflow",
  );
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/club-real-mobile-submitted.png", fullPage: true });
  const app = (await clubRpc("getMyClubRegistrations", undefined, officer.token)).applications[0];
  assert.equal(app.status, "pending");
  assert.equal(
    (await clubRpc("getMyClubRegistrations", undefined, stranger.token)).applications.length,
    0,
  );
  await assert.rejects(
    () =>
      clubRpc("withdrawClubRegistration", { id: app.id, revision: app.revision }, stranger.token),
    /not found for this account/,
  );
  const reviewPage = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    extraHTTPHeaders: { authorization: `Bearer ${reviewer.token}` },
  });
  observe(reviewPage);
  await reviewPage.goto(`${origin}/admin/club-registrations`, {
    waitUntil: "networkidle",
    timeout: 120000,
  });
  await reviewPage.getByRole("button", { name: "Approve representative", exact: true }).waitFor();
  assert(
    await reviewPage
      .getByRole("button", { name: "Approve representative", exact: true })
      .isDisabled(),
  );
  await reviewPage
    .getByLabel("Message to the applicant", { exact: true })
    .fill("Synthetic appointment approved for this isolated test.");
  await reviewPage
    .getByLabel("Private verification record", { exact: true })
    .fill(
      "PRIVATE TEST RECORD: independently checked fictional appointment in the disposable database.",
    );
  for (const checkbox of await reviewPage.getByRole("checkbox").all()) await checkbox.check();
  await reviewPage.getByRole("button", { name: "Approve representative", exact: true }).click();
  await reviewPage.getByText("No applications in this view.", { exact: true }).waitFor();
  const approved = (await clubRpc("getMyClubRegistrations", undefined, officer.token))
    .applications[0];
  assert.equal(approved.status, "approved");
  assert(!JSON.stringify(approved).includes("PRIVATE TEST RECORD"));
  assert.equal(
    (await sql`select status from club_representatives where application_id=${app.id}`)[0].status,
    "active",
  );
  await page.goto(`${origin}/clubs/account`, { waitUntil: "networkidle" });
  await page.getByText("Representative approved", { exact: true }).waitFor();
  const after = await sql`select
    (select count(*)::int from athletes) as athletes,
    (select count(*)::int from results) as results,
    (select count(*)::int from athlete_account_links) as ownership,
    (select count(*)::int from result_claims) as claims`;
  assert.deepEqual(
    after,
    before,
    "Club approval leaves athlete records, results, ownership and claims unchanged",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: all four club sports, real RPC authorization/private caching/CSRF, verified email, real mobile draft/resume/submission, independent staff approval, private evidence and no athlete ownership or result claims.",
  );
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
