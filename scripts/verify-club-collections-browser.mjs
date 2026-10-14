import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
const child = spawn(
  process.execPath,
  ["--experimental-strip-types", "scripts/preview-club-scanner.mjs"],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let browser;
try {
  await new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(() => reject(new Error("Fixture did not start: " + log)), 45000);
    const capture = (chunk) => {
      log += chunk;
      if (log.includes("Club scanner fixture:")) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error("Fixture exited " + code + ": " + log));
    });
  });
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
    executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
  });
  const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:8097");
  await page.getByRole("heading", { name: "Regular club checks" }).waitFor();
  await page.getByRole("button", { name: "Edit plan", exact: true }).click();
  await page.getByLabel("Hours between checks").fill("12");
  await page
    .getByLabel("Names used in results, one per line")
    .fill("Example AC\nExample Athletics Club\n");
  await page.getByLabel("What should we look for?").fill("Find local road and trail results.");
  await page.getByRole("button", { name: "Save club plan", exact: true }).click();
  await page.getByText("Club collection settings saved.", { exact: true }).waitFor();
  await page.getByText(/Every 12 hours/).waitFor();
  await page.getByRole("button", { name: "Edit plan", exact: true }).click();
  assert.equal(
    await page.getByLabel("Names used in results, one per line").inputValue(),
    "Example AC\nExample Athletics Club",
  );
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Pause checks", exact: true }).click();
  await page.getByRole("button", { name: "Resume checks", exact: true }).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Check now", exact: true }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "Resume checks", exact: true }).click();
  await page.getByRole("button", { name: "Pause checks", exact: true }).waitFor();
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/club-collection-desktop.png", fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  const section = page.getByRole("region", { name: "Regular club checks" });
  await section.scrollIntoViewIfNeeded();
  const box = await section.boundingBox();
  assert.ok(box.width <= 390, "Collection cards fit a mobile screen");
  await page.screenshot({ path: "artifacts/club-collection-mobile.png", fullPage: false });
  assert.deepEqual(errors, []);
  console.log(
    "Club collection browser checks passed: saved settings, multiline aliases, pause/resume and mobile layout.",
  );
} finally {
  await browser?.close();
  child.kill("SIGTERM");
}
