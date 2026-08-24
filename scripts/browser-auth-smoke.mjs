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

  const dialog = page.getByRole("dialog", { name: "Sign in to ATHRECS" });
  await dialog.waitFor({ state: "visible", timeout: timeoutMs });

  // The dialog renders immediately, then loads the list of methods through a
  // server function. Wait for that asynchronous state rather than asserting
  // during the temporary "Loading secure sign-in methods" view.
  const googleButton = dialog.getByRole("button", { name: "Continue with Google" });
  await googleButton.waitFor({ state: "visible", timeout: timeoutMs });
  record("Google is offered in the chooser", true);

  const createAccountTab = dialog.getByRole("tab", { name: "Create account" });
  await createAccountTab.waitFor({ state: "visible", timeout: timeoutMs });
  record("manual sign-up tab is offered", true);

  await createAccountTab.click();
  await page
    .getByRole("heading", { name: "Create an Athlete Account" })
    .waitFor({ state: "visible", timeout: timeoutMs });

  const fullName = page.getByLabel("Full name");
  const email = page.getByLabel("Email address");
  const password = page.getByLabel("Password", { exact: true });
  const confirmPassword = page.getByLabel("Confirm password");
  const createWithEmail = page.getByRole("button", { name: "Create account with email" });
  for (const field of [fullName, email, password, confirmPassword, createWithEmail]) {
    await field.waitFor({ state: "visible", timeout: timeoutMs });
  }
  record("full name field is present", true);
  record("email field is present", true);
  record("password field is present", true);
  record("confirmation field is present", true);
  record("email account action is present", true);

  await page.screenshot({ path: outPng, fullPage: false });
  await page.getByRole("button", { name: "Close sign-in" }).click();
  await dialog.waitFor({ state: "hidden", timeout: timeoutMs });

  await page.goto(new URL("/claim-results", baseUrl).href, {
    waitUntil: "networkidle",
    timeout: timeoutMs,
  });
  const claimSignIn = page.getByRole("button", { name: "Sign in or create account" });
  await claimSignIn.click();
  await page
    .getByRole("dialog", { name: "Sign in to ATHRECS" })
    .waitFor({ state: "visible", timeout: timeoutMs });
  await page.getByRole("button", { name: "Close sign-in" }).click();
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
