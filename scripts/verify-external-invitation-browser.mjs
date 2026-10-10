// Actual browser -> auth -> profile -> database journey using a reserved test
// email and disposable storage. Only the external mail delivery is intercepted.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");

for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = "test-key-not-used-for-delivery";
process.env.BETTER_AUTH_SECRET = "recruitment-test-only-secret-at-least-32-characters";
const origin = "http://127.0.0.1:18243";
process.env.BETTER_AUTH_URL = origin;
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const email = JSON.parse(init.body);
    assert(email.to.every((address) => address === "onboarding-runner@example.test"));
    sent.push(email);
    return Response.json({ id: `fixture-mail-${sent.length}` });
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18243, strictPort: true } });
let database;
let browser;
let page;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('synthetic-inviter','Synthetic Inviter','staff@example.test',true,now(),now())`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(993401,'synthetic-invited-athlete','Avery Invitation Athlete','private')`;
  await sql`insert into events(id,slug,name,sport) values(993401,'synthetic-invitation-race','Synthetic Invitation 10K','Running')`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values(993401,993401,'2026-09-01','10K')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status,result_visibility) values(993401,993401,993401,2400,'finished','private')`;
  const core = await server.ssrLoadModule("/src/lib/athrecs/claim-invitations.server.ts");
  const invitation = await core.createExternalInvitation(sql, "synthetic-inviter", {
    athleteId: 993401,
    recipientName: "Avery Invitation Athlete",
    email: "onboarding-runner@example.test",
    phone: "",
    telegramUsername: "",
    socialLinks: [],
    sourceNote: "Synthetic known athlete contact",
    matchNote: "Synthetic staff recognised the athlete and this race",
    reviewed: true,
  });
  const path = new URL(invitation.url).pathname + new URL(invitation.url).search;
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto(origin + path, { waitUntil: "networkidle", timeout: 60000 });
  const cookies = page.getByRole("button", { name: "No thanks", exact: true });
  if (await cookies.isVisible()) await cookies.click();
  await page
    .getByRole("heading", { name: "Claim Avery Invitation Athlete’s athlete profile", exact: true })
    .waitFor();
  assert.equal(
    await page.getByRole("heading", { name: "Synthetic Invitation 10K", exact: true }).count(),
    0,
    "Race details require the invited verified account",
  );
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/external-invitation-landing-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign in or create account", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email address", { exact: true }).fill("onboarding-runner@example.test");
  await dialog.getByRole("button", { name: "Continue with email", exact: true }).click();
  await dialog.getByLabel("Six-digit code", { exact: true }).waitFor();
  const code = sent.at(-1)?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(code, "Real email-code signup delivery is intercepted");
  await dialog.getByLabel("Six-digit code", { exact: true }).fill(code);
  await dialog.getByRole("button", { name: "Verify code and continue", exact: true }).click();
  await page.getByRole("heading", { name: "Synthetic Invitation 10K", exact: true }).waitFor();
  assert.equal(
    new URL(page.url()).searchParams.get("invitation"),
    new URL(invitation.url).searchParams.get("invitation"),
    "Signup preserves the token",
  );
  assert.equal(
    new URL(page.url()).searchParams.get("resultId"),
    "993401",
    "Signup preserves the exact profile/result",
  );
  await page.getByText("Suggested profile: Avery Invitation Athlete", { exact: true }).waitFor();
  const [user] =
    await sql`select id,"emailVerified" from "user" where email='onboarding-runner@example.test'`;
  assert.equal(user.emailVerified, true);
  assert.equal(
    (await sql`select user_id from athlete_private_profiles where user_id=${user.id}`).length,
    0,
    "Claim does not require a completed private profile",
  );
  await page.getByRole("checkbox", { name: /This is my profile and the race shown is mine/ }).check();
  await page.getByRole("button", { name: "Yes, this is me — submit my profile claim", exact: true }).click();
  await page.getByText("Claim received — awaiting identity review", { exact: true }).waitFor();
  const claims =
    await sql`select status,claimant_user_id from result_claims where result_id=993401`;
  assert.deepEqual(claims, [{ status: "pending", claimant_user_id: user.id }]);
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${invitation.id}`)[0].user_id,
    user.id,
  );
  assert.equal(
    (await sql`select athlete_id from athlete_account_links where athlete_id=993401`).length,
    0,
    "Only staff review grants ownership",
  );
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({
      path: `artifacts/external-invitation-claim-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real browser private invitation → email-code signup → exact selected profile → pending claim, with mobile/desktop layout and no automatic ownership. Synthetic data only.",
  );
} catch (error) {
  await mkdir("artifacts", { recursive: true });
  await page?.screenshot({ path: "artifacts/external-invitation-failure.png", fullPage: true });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
