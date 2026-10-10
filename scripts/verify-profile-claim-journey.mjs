// Actual browser -> authenticated RPC -> disposable PGlite. Never production data or email.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const origin = "http://127.0.0.1:18246";
Object.assign(process.env, {
  DATABASE_URL: "",
  DATABASE_URL_UNPOOLED: "",
  POSTGRES_URL_NON_POOLING: "",
  RESEND_API_KEY: "",
  ATHRECS_CLAIMS_EMAILS: "",
  VITE_SITE_BRAND: "athrecs",
  VITE_AUTH_ENABLED: "true",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "profile-claim-test-only-secret-at-least-32-chars",
});
const realFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18246, strictPort: true } });
let browser, database;
const errors = [];
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const account = async (email) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const response = await context.request.post(`${origin}/api/auth/sign-up/email`, {
      headers: { origin },
      data: { name: "Temporary Name", email, password: "Synthetic-password-123!" },
    });
    assert.equal(response.status(), 200, await response.text());
    const { user } = await response.json();
    await sql`update "user" set name='',"emailVerified"=true where id=${user.id}`;
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
    await page
      .getByRole("heading", {
        name: "Your account is ready. Finish claiming your athlete profile.",
      })
      .waitFor();
    return { context, page, user };
  };
  const plain = await account("plain-claim@example.test");
  await sql`insert into events (id,slug,name,sport,surface,country) values (992101,'claim-journey-test','Synthetic Claim Journey 10K','Running','Road','United Kingdom')`;
  await sql`insert into editions (id,event_id,event_date,distance_code,distance_km) values (992101,992101,'2026-09-01','10K',10)`;
  await sql`insert into athletes (id,slug,display_name,profile_visibility) values (992101,'claim-journey-runner','Journey Test Runner','private'),(992102,'claim-journey-invited','Invited Test Runner','private')`;
  await sql`insert into results (id,edition_id,athlete_id,finish_time_seconds,status) values (992101,992101,992101,2400,'finished'),(992102,992101,992102,2500,'finished')`;
  const { page } = plain;
  await page.goto(`${origin}/claim-results?resultId=992101`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Next, enter your racing name" }).waitFor();
  assert.equal(await page.getByText("This match is no longer available").count(), 0);
  await page.getByLabel("Full racing name").fill("Journey Test Runner");
  await page.getByRole("button", { name: "Continue to my profile claim", exact: true }).click();
  await page
    .getByRole("checkbox", { name: /This is my profile and the race shown is mine/ })
    .waitFor();
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Finish my profile claim", exact: true }).click();
  assert(new URL(page.url()).searchParams.get("resultId") === "992101");
  await page
    .getByRole("checkbox", { name: /This is my profile and the race shown is mine/ })
    .check();
  await page
    .getByRole("button", { name: "Yes, this is me — submit my profile claim", exact: true })
    .click();
  await page.getByText("Claim received — awaiting identity review", { exact: true }).waitFor();
  const [claim] =
    await sql`select status from result_claims where claimant_user_id=${plain.user.id}`;
  assert.equal(claim.status, "pending");
  assert.equal(
    (await sql`select * from athlete_account_links where user_id=${plain.user.id}`).length,
    0,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Claim received — awaiting identity review", { exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Yes, this is me — submit my profile claim", exact: true })
      .count(),
    0,
  );
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "View my submitted claim" }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Finish my profile claim", exact: true }).count(),
    0,
  );
  console.log(
    "PASS: Missing name -> same selected profile -> remembered navigation -> one pending claim -> clear receipt after reload.",
  );

  const invited = await account("invited-claim@example.test");
  const token = "a".repeat(64);
  const hash = createHash("sha256").update(token).digest("hex");
  const claimUrl = `https://www.athrecs.com/claim-results?resultId=992102&invitation=${token}`;
  await sql`insert into athlete_claim_invitations(id,user_id,recipient_email,athlete_id,result_id,token_hash,claim_url,match_note,created_by,invitation_kind,recipient_name,recipient_key,email_payload) values('99210200-0000-4000-8000-000000000001',null,'invited-claim@example.test',992102,992102,${hash},${claimUrl},'Synthetic recipient confirmed this profile',${plain.user.id},'email','Invited Test Runner','email:invited-claim@example.test','{}'::jsonb)`;
  await invited.page.reload({ waitUntil: "networkidle" });
  const resume = invited.page.getByRole("link", {
    name: "Continue claiming Invited Test Runner",
    exact: true,
  });
  await resume.waitFor();
  assert.equal(await invited.page.getByLabel("Full racing name").count(), 0);
  await invited.page.setViewportSize({ width: 390, height: 844 });
  await mkdir("artifacts", { recursive: true });
  await invited.page.screenshot({ path: "artifacts/claim-resume-mobile.png", fullPage: true });
  assert(
    await invited.page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  );
  await resume.click();
  await invited.page
    .getByRole("checkbox", { name: /This is my profile and the race shown is mine/ })
    .waitFor();
  assert.equal(await invited.page.getByLabel("Full racing name").count(), 0);
  await invited.page.screenshot({ path: "artifacts/claim-confirm-mobile.png", fullPage: true });
  await invited.page
    .getByRole("checkbox", { name: /This is my profile and the race shown is mine/ })
    .check();
  await invited.page
    .getByRole("button", { name: "Yes, this is me — submit my profile claim", exact: true })
    .click();
  await invited.page
    .getByText("Claim received — awaiting identity review", { exact: true })
    .waitFor();
  await invited.page.screenshot({ path: "artifacts/claim-received-mobile.png", fullPage: true });
  assert.equal(
    (await sql`select * from result_claims where claimant_user_id=${invited.user.id}`).length,
    1,
  );
  const [bound] =
    await sql`select user_id,claim_id from athlete_claim_invitations where token_hash=${hash}`;
  assert.equal(bound.user_id, invited.user.id);
  assert(bound.claim_id);
  console.log(
    "PASS: Verified blank-name account resumes its email invitation on mobile and submits exactly one claim without granting ownership.",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser?.close();
  await database?.close();
  await server.close();
}
