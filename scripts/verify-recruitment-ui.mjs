// Actual browser -> auth -> profile -> database journey using a reserved test
// email and disposable storage. Only the external mail delivery is intercepted.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "playwright";

for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING"])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = "test-key-not-used-for-delivery";
process.env.BETTER_AUTH_SECRET = "recruitment-test-only-secret-at-least-32-characters";
const origin = "http://127.0.0.1:18228";
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
const server = await createServer({ server: { host: "127.0.0.1", port: 18228, strictPort: true } });
let database;
let browser;
let page;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${origin}/join?from=instagram`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("button", { name: "No thanks", exact: true }).click();
  await page.getByRole("heading", { name: "Follow along on Instagram", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Skip for now and create my profile", exact: true })
    .click();
  await page.getByRole("button", { name: "Create my profile with email", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in with an email code" });
  await dialog.getByLabel("Email address", { exact: true }).fill("onboarding-runner@example.test");
  await dialog.getByRole("button", { name: "Send sign-in code", exact: true }).click();
  await dialog.getByLabel("Six-digit code", { exact: true }).waitFor();
  const code = sent.at(-1)?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(code, "The actual email adapter receives the sign-in code");
  await dialog.getByLabel("Six-digit code", { exact: true }).fill(code);
  await dialog.getByRole("button", { name: "Verify code and sign in", exact: true }).click();
  await page.getByRole("heading", { name: "Let’s start your profile", exact: true }).waitFor();
  assert.equal(new URL(page.url()).searchParams.get("from"), "instagram");
  await page.getByLabel("Your name", { exact: true }).fill("Fictional Recruitment Runner");
  await page.getByLabel("Your main sport", { exact: true }).selectOption("Running");
  const save = page.getByRole("button", { name: "Create my private profile", exact: true });
  assert.equal(await save.isDisabled(), true, "Privacy acknowledgement is explicit");
  await page.getByRole("checkbox").check();
  await save.click();
  await page.getByRole("heading", { name: "Your profile is ready", exact: true }).waitFor();
  const rows =
    await sql`select u.id, u."emailVerified", p.full_name from "user" u join athlete_private_profiles p on p.user_id=u.id where u.email='onboarding-runner@example.test'`;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].emailVerified, true);
  assert.equal(rows[0].full_name, "Fictional Recruitment Runner");
  const sports =
    await sql`select sport_code, is_primary from athlete_sport_profiles where user_id=${rows[0].id}`;
  assert.deepEqual(sports, [{ sport_code: "Running", is_primary: true }]);
  const consents =
    await sql`select status from athlete_account_consents where user_id=${rows[0].id} and purpose='marketing'`;
  assert.equal(consents[0].status, "withdrawn");
  const publicRows =
    await sql`select enabled from athlete_public_shares where user_id=${rows[0].id} and enabled=true`;
  assert.equal(publicRows.length, 0);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Your profile is ready", exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("Your name", { exact: true }).count(),
    0,
    "Existing profiles are not overwritten by onboarding",
  );
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/recruitment-mobile.png", fullPage: true });
  await page.goto(`${origin}/athletes/mo-farah`, { waitUntil: "networkidle", timeout: 90000 });
  await page.getByRole("heading", { name: "Mo Farah", exact: true }).waitFor();
  const photo = page.getByRole("img", { name: /Mo Farah, wearing/ });
  assert.equal(await photo.evaluate((image) => image.complete && image.naturalWidth > 0), true);
  await page.getByText("12:53.11", { exact: true }).waitFor();
  await page.getByText("59:32", { exact: true }).waitFor();
  await page.getByRole("link", { name: "CC0 public-domain dedication", exact: true }).waitFor();
  assert.equal(await page.getByText("Verified athlete", { exact: true }).count(), 0);
  assert.equal(
    await page
      .getByText("Your first recorded finish starts your achievement collection.", { exact: true })
      .count(),
    0,
  );
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: "artifacts/mo-farah-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "Recruitment journey passed: optional follow, real email code, verified private profile save, unchanged marketing consent, return visit and sourced Mo Farah profile with loaded CC0 image.",
  );
} catch (error) {
  await mkdir("artifacts", { recursive: true });
  await page?.screenshot({ path: "artifacts/recruitment-failure.png", fullPage: true });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
