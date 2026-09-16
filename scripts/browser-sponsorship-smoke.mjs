#!/usr/bin/env node
// Full enquiry round trip against disposable CI PostgreSQL and loopback only.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright";
import pg from "pg";
import { checkedUrl } from "./browser-guard.mjs";

if (process.env.CI !== "true") throw new Error("This test is restricted to disposable CI data.");
const database = new URL(process.env.DATABASE_URL);
if (
  !["127.0.0.1", "localhost"].includes(database.hostname) ||
  database.pathname !== "/athrecs_ci"
) {
  throw new Error("Expected the isolated athrecs_ci database on loopback.");
}
const baseUrl = checkedUrl(process.argv[2] || "http://127.0.0.1:8080/");
if (!["127.0.0.1", "localhost"].includes(new URL(baseUrl).hostname)) {
  throw new Error("Sponsorship tests only submit data to loopback.");
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const email = `sponsorship-${randomUUID()}@example.test`;
try {
  const context = await browser.newContext();
  const signup = await context.request.post(new URL("/api/auth/sign-up/email", baseUrl).href, {
    headers: { Origin: new URL(baseUrl).origin },
    data: { name: "CI Sponsorship Organiser", email, password: `Ci-${randomUUID()}!` },
  });
  assert.equal(signup.ok(), true, `Test sign-up returned ${signup.status()}`);
  const account = await pool.query(
    'update "user" set "emailVerified" = true where email = $1 returning id',
    [email],
  );
  assert.equal(account.rowCount, 1);
  const userId = account.rows[0].id;
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(new URL("/sponsorship?kind=race_organiser", baseUrl).href);
  await page.getByLabel("Your name", { exact: true }).waitFor({ timeout: 45000 });
  const declineAnalytics = page.getByRole("button", { name: "No thanks", exact: true });
  if (await declineAnalytics.isVisible()) await declineAnalytics.click();
  await page.getByLabel("Your name", { exact: true }).fill("CI Sponsorship Organiser");
  await page.getByLabel("Race or event name", { exact: true }).fill("CI Sponsorship Race");
  await page.getByLabel("Official website", { exact: true }).fill("https://example.test/ci-race");
  await page
    .getByLabel("Race location and country", { exact: true })
    .fill("Norwich, United Kingdom");
  await page
    .getByLabel("Race date", { exact: true })
    .fill(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  await page
    .getByLabel("Your sponsorship brief", { exact: true })
    .fill("CI-only test brief: seeking products and paid support for a test event.");
  await page.getByLabel("I am 18 or over.", { exact: true }).check();
  await page.getByLabel("I am authorised to represent", { exact: false }).check();
  await page.getByRole("button", { name: "Submit private enquiry", exact: true }).click();
  await page.getByText(/Enquiry #\d+ saved for review/).waitFor({ timeout: 45000 });
  const result = await pool.query("select * from sponsorship_enquiries where user_id = $1", [
    userId,
  ]);
  assert.equal(result.rowCount, 1);
  assert.equal(result.rows[0].kind, "race_organiser");
  assert.equal(result.rows[0].status, "pending");
  assert.equal(result.rows[0].source, "athrecs");
  await page.reload();
  await page
    .getByRole("heading", { name: `#${result.rows[0].id} · CI Sponsorship Race`, exact: true })
    .waitFor();
  await pool.query(
    "update sponsorship_enquiries set response = $1, status = 'in_review', revision = revision + 1 where id = $2",
    ["CI reviewer response: please provide your event authority.", result.rows[0].id],
  );
  await page.reload();
  await page
    .getByText("CI reviewer response: please provide your event authority.", { exact: true })
    .waitFor();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Withdraw enquiry", exact: true }).click();
  await page.getByText("Withdrawn", { exact: true }).waitFor();
  assert.equal(
    (
      await pool.query("select status from sponsorship_enquiries where id = $1", [
        result.rows[0].id,
      ])
    ).rows[0].status,
    "withdrawn",
  );
  assert.deepEqual(errors, []);
  console.log(
    "Sponsorship browser-to-database submission, reload, response and withdrawal passed.",
  );
} finally {
  await pool.query('delete from "user" where email = $1', [email]);
  await pool.end();
  await browser.close();
}
