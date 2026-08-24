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

mkdirSync(dirname(outPng), { recursive: true });

const consoleErrors = [];
const pageErrors = [];

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

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: timeoutMs });
  const status = response?.status() ?? 0;
  await page.waitForTimeout(1000);

  const title = await page.title();
  const hasCanvas = (await page.locator("canvas").count()) > 0;
  const bodyTextLen = (
    await page
      .locator("body")
      .innerText()
      .catch(() => "")
  ).trim().length;

  await page.screenshot({ path: outPng, fullPage: false });

  console.log(
    JSON.stringify(
      {
        url,
        status,
        title,
        hasCanvas,
        bodyTextLen,
        consoleErrors,
        pageErrors,
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
