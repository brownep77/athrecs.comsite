#!/usr/bin/env node
/**
 * Exercise the public Athlete Account chooser without leaving Athrecs or opening
 * an external OAuth provider. Targets remain restricted to loopback URLs.
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import { checkedOutputPath, checkedUrl } from "./browser-guard.mjs";

const workspaceRoot = resolve(process.cwd());
const baseUrl = checkedUrl(process.argv[2] || "http://127.0.0.1:8080/");
const outPng = checkedOutputPath(
  process.argv[3] || resolve(workspaceRoot, "artifacts/athlete-auth.png"),
  [workspaceRoot, "/workspace"],
);
const timeoutMs = Number(process.env.BROWSER_SMOKE_TIMEOUT_MS || 45000);

mkdirSync(dirname(outPng), { recursive: true });

const consoleErrors = [];
const pageErrors = [];
const assertions = [];

function record(name, passed) {
  assertions.push({ name, passed });
  if (!passed) throw new Error(`Authentication smoke assertion failed: ${name}`);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.message || error)));

  const response = await page.goto(baseUrl, {
    waitUntil: "networkidle",
    timeout: timeoutMs,
  });
  record("home returned a successful response", Boolean(response && response.status() < 400));

  const headerSignIn = page
    .getByRole("button", { name: "Sign in or create an athlete account" })
    .first();
  await headerSignIn.click();

  const signInDialog = page.getByRole("dialog", { name: "Sign in to ATHRECS" });
  await signInDialog.waitFor({ state: "visible", timeout: timeoutMs });

  // The dialog renders immediately, then loads the list of methods through a
  // server function. Wait for that asynchronous state rather than asserting
  // during the temporary "Loading secure sign-in methods" view.
  const googleButton = signInDialog.getByRole("button", { name: "Continue with Google" });
  await googleButton.waitFor({ state: "visible", timeout: timeoutMs });
  record("Google is offered in the chooser", true);

  const createAccountTab = signInDialog.getByRole("tab", { name: "Create account" });
  await createAccountTab.waitFor({ state: "visible", timeout: timeoutMs });
  record("manual sign-up tab is offered without Resend", true);

  const limitedModeNotice = signInDialog.getByText(
    "Verification emails and password recovery are temporarily unavailable",
    { exact: false },
  );
  await limitedModeNotice.waitFor({ state: "visible", timeout: timeoutMs });
  record("limited email-delivery mode is explained", true);
  record(
    "password recovery is hidden without email delivery",
    (await signInDialog.getByRole("button", { name: "Forgotten your password?" }).count()) === 0,
  );

  await createAccountTab.click();
  // The dialog's accessible name follows its heading, so switching tabs changes
  // the named dialog from "Sign in to ATHRECS" to "Create an Athlete Account".
  const signUpDialog = page.getByRole("dialog", { name: "Create an Athlete Account" });
  await signUpDialog.waitFor({ state: "visible", timeout: timeoutMs });

  const fullName = signUpDialog.locator('input[autocomplete="name"]');
  const email = signUpDialog.locator('input[autocomplete="email"]');
  const newPasswords = signUpDialog.locator('input[autocomplete="new-password"]');
  const createWithEmail = signUpDialog.getByRole("button", {
    name: "Create account with email",
  });
  for (const field of [fullName, email, newPasswords.first(), createWithEmail]) {
    await field.waitFor({ state: "visible", timeout: timeoutMs });
  }
  record("full name field is present", true);
  record("email field is present", true);
  record("password field is present", (await newPasswords.count()) >= 1);
  record("confirmation field is present", (await newPasswords.count()) >= 2);
  record("email account action is present", true);

  await page.screenshot({ path: outPng, fullPage: false });
  await signUpDialog.getByRole("button", { name: "Close sign-in" }).click();
  await signUpDialog.waitFor({ state: "hidden", timeout: timeoutMs });

  await page.goto(new URL("/claim-results", baseUrl).href, {
    waitUntil: "networkidle",
    timeout: timeoutMs,
  });
  const claimSignIn = page.getByRole("button", { name: "Sign in or create account" });
  await claimSignIn.click();
  const claimDialog = page.getByRole("dialog", { name: "Sign in to ATHRECS" });
  await claimDialog.waitFor({ state: "visible", timeout: timeoutMs });
  await claimDialog.getByRole("button", { name: "Close sign-in" }).click();
  await claimDialog.waitFor({ state: "hidden", timeout: timeoutMs });
  record("claim sign-in button resets after chooser closes", !(await claimSignIn.isDisabled()));

  record("page emitted no runtime errors", pageErrors.length === 0);
  record("page emitted no console errors", consoleErrors.length === 0);

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        assertions,
        consoleErrors,
        pageErrors,
        screenshot: outPng,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        baseUrl,
        assertions,
        consoleErrors,
        pageErrors,
        error: String(error?.message || error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  await browser.close();
}
