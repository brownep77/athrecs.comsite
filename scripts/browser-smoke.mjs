#!/usr/bin/env node
/**
 * Lightweight headless load + screenshot for a local Athrecs preview.
 * Targets stay restricted to loopback HTTP(S). Screenshots may only be written
 * inside the checked-out workspace (or /workspace in the app-builder image).
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import { checkedOutputPath, checkedUrl } from "./browser-guard.mjs";

const workspaceRoot = resolve(process.cwd());
const url = checkedUrl(process.argv[2] || "http://127.0.0.1:8080/");
const outPng = checkedOutputPath(
  process.argv[3] || resolve(workspaceRoot, "artifacts/app-builder-preview.png"),
  [workspaceRoot, "/workspace"],
);
const timeoutMs = Number(process.env.BROWSER_SMOKE_TIMEOUT_MS || 45000);
const fullPage = process.env.BROWSER_SMOKE_FULL_PAGE === "1";

mkdirSync(dirname(outPng), { recursive: true });

const consoleErrors = [];
const pageErrors = [];
const transientVitePatterns = [
  /outdated optimize dep/i,
  /failed to fetch dynamically imported module/i,
  /err_aborted\s+504/i,
];

function isTransientViteFailure(bodyText) {
  return [...consoleErrors, ...pageErrors, bodyText].some((value) =>
    transientVitePatterns.some((pattern) => pattern.test(String(value))),
  );
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error?.message || error)));

  let response;
  let status = 0;
  let bodyText = "";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    consoleErrors.length = 0;
    pageErrors.length = 0;

    const retryUrl =
      attempt === 1
        ? url
        : `${url}${url.includes("?") ? "&" : "?"}__browser_smoke_retry=${Date.now()}`;

    response = await page.goto(retryUrl, { waitUntil: "networkidle", timeout: timeoutMs });
    status = response?.status() ?? 0;
    await page.waitForTimeout(1000);
    bodyText = await page
      .locator("body")
      .innerText()
      .catch(() => "");

    if (attempt === 1 && isTransientViteFailure(bodyText)) {
      console.warn("Transient Vite optimiser response detected; retrying once.");
      await page.waitForTimeout(1500);
      continue;
    }
    break;
  }

  const title = await page.title();
  const hasCanvas = (await page.locator("canvas").count()) > 0;
  const bodyTextLen = bodyText.trim().length;

  await page.screenshot({ path: outPng, fullPage });

  console.log(
    JSON.stringify(
      {
        url,
        finalUrl: page.url(),
        status,
        title,
        hasCanvas,
        bodyTextLen,
        consoleErrors,
        pageErrors,
        fullPage,
        screenshot: outPng,
      },
      null,
      2,
    ),
  );

  if (status >= 400 || status === 0) process.exit(1);
  if (pageErrors.length || consoleErrors.length) process.exit(2);
  process.exit(0);
} catch (error) {
  console.error(
    JSON.stringify({ ok: false, url, error: String(error?.message || error) }, null, 2),
  );
  process.exit(1);
} finally {
  await browser.close();
}
