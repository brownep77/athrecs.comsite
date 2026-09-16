// Browser-only form behaviour. Real code validation is tested separately by
// verify-email-login-flow.mjs; browser delivery requests are intercepted here.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createServer } from "vite";
import { chromium } from "playwright";
process.env.RESEND_API_KEY = "test-key-never-used-for-delivery";
process.env.VITE_AUTH_ENABLED = "true";
const origin = "http://127.0.0.1:18226";
process.env.BETTER_AUTH_URL = origin;
const server = await createServer({ server: { host: "127.0.0.1", port: 18226, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const requests = [];
  await page.route(`${origin}/api/auth/email-otp/send-verification-otp`, async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });
  await page.route(`${origin}/api/auth/sign-in/email-otp`, async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ code: "INVALID_OTP", message: "Invalid OTP" }),
    });
  });
  await page.goto(`${origin}/athlete-account`, { waitUntil: "networkidle", timeout: 60000 });
  await page.getByRole("button", { name: "Sign in or create account", exact: true }).click();
  await page.getByRole("button", { name: "Continue with an email code" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in with an email code" });
  await dialog.getByLabel("Email address", { exact: true }).fill("runner@example.test");
  assert.equal(await dialog.getByLabel("Password", { exact: true }).count(), 0);
  await dialog.getByRole("button", { name: "Send sign-in code" }).click();
  const code = dialog.getByLabel("Six-digit code", { exact: true });
  await code.waitFor({ state: "visible" });
  assert.deepEqual(requests[0], { email: "runner@example.test", type: "sign-in" });
  assert.equal(await code.evaluate((element) => element === document.activeElement), true);
  assert.equal(await dialog.getByLabel("Email address", { exact: true }).isDisabled(), true);
  assert.equal(await dialog.getByRole("button", { name: /Resend code in/ }).isDisabled(), true);
  await code.fill("111111");
  await dialog.getByRole("button", { name: "Verify code and sign in" }).click();
  await dialog.getByRole("alert").waitFor({ state: "visible" });
  assert.deepEqual(requests[1], { email: "runner@example.test", otp: "111111" });
  assert.equal(
    await dialog.getByRole("button", { name: "Verify code and sign in" }).isDisabled(),
    false,
  );
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/email-code-mobile.png", fullPage: true });
  await dialog.getByRole("button", { name: "Use another email" }).click();
  assert.equal(await dialog.getByLabel("Email address", { exact: true }).isDisabled(), false);
  assert.equal(await dialog.getByLabel("Six-digit code", { exact: true }).count(), 0);
  await dialog.getByRole("button", { name: "Back to sign in" }).click();
  await page
    .getByRole("button", { name: "Sign in with email", exact: true })
    .waitFor({ state: "visible" });
  assert.deepEqual(pageErrors, []);
  console.log(
    "Email-code browser checks passed: passwordless form, delivery request, code focus, countdown, errors and changing email.",
  );
} finally {
  await browser?.close();
  await server.close();
}
