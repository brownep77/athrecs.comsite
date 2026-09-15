// CI browser regression against the actual UI, service and disposable publication database.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const server = spawn(process.execPath, ["scripts/preview-collector-bulk.mjs"], {
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  let output = "";
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Fixture did not start: ${output}`)), 60_000);
    server.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes("http://127.0.0.1:8091/")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (chunk) => {
      output += chunk;
    });
    server.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Fixture exited ${code}: ${output}`));
    });
  });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:8091/");
  await page.getByRole("heading", { name: "Forest Challenge", exact: true }).waitFor();
  const button = (name) => page.getByRole("button", { name, exact: true });
  assert.ok(
    await button("Keep selected (0)").evaluate(
      (element) => element.getBoundingClientRect().height >= 36,
    ),
    "Bulk buttons must retain their usable target size with the real component styles",
  );
  const choose = (name, choice) =>
    page.getByRole("button", { name: new RegExp(`^Select to ${choice} ${name} `) }).click();
  const counts = async () => JSON.parse(await page.getByTestId("database-counts").innerText());
  const confirm = async (name, accept, action) => {
    let message;
    const dialogDone = new Promise((resolve) =>
      page.once("dialog", async (dialog) => {
        message = dialog.message();
        assert.match(message, new RegExp(`Are you sure you want to ${action}`));
        await (accept ? dialog.accept() : dialog.dismiss());
        resolve();
      }),
    );
    await button(name).click();
    await dialogDone;
    return message;
  };
  assert.equal(
    await page
      .getByText(
        "To publish, click Select to keep on each race. Opening Kept does not select its races.",
        { exact: true },
      )
      .isVisible(),
    true,
  );
  await choose("Forest Challenge", "keep");
  const blockers = page.getByRole("region", { name: "Races blocking publication" });
  assert.match(await blockers.innerText(), /Forest Challenge/);
  assert.match(await blockers.innerText(), /may already be listed under a different name/);
  assert.equal(await button("Publish selected (1)").isEnabled(), false);
  assert.equal(await button("Select only ready races (0)").count(), 0);
  await choose("Harbour Sunset Circuit", "keep");
  assert.equal(await button("Publish selected (2)").isEnabled(), false);
  assert.match(
    await page
      .locator(`[id="${await button("Publish selected (2)").getAttribute("aria-describedby")}"]`)
      .innerText(),
    /1 ready to publish, 1 blocked/,
  );
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/collector-publication-blocked-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/collector-publication-blocked-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    "Publication reasons must fit the mobile viewport",
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await button("Page 2").click();
  await choose("Meadow Lantern Loop", "dismiss");
  assert.match(
    await blockers.innerText(),
    /Forest Challenge/,
    "Off-page blockers retain their name and reason",
  );
  await button("Select only ready races (1)").click();
  assert.equal(await button("Publish selected (1)").isEnabled(), true);
  assert.equal(await button("Dismiss selected (1)").isEnabled(), true);
  assert.equal(await blockers.count(), 0);
  assert.equal(await page.getByTestId("last-request").textContent(), "None");
  assert.deepEqual(await counts(), { editions: 0, revisions: 0, kept: 0, dismissed: 0 });
  await button("Clear selection").click();
  await button("Page 1").click();
  await choose("Forest Challenge", "keep");
  assert.equal(await button("Publish selected (1)").isEnabled(), false);
  await choose("Forest Challenge", "dismiss");
  await choose("Harbour Sunset Circuit", "keep");
  await button("Page 2").click();
  await choose("Meadow Lantern Loop", "keep");
  await choose("Orchard Spring Run", "dismiss");
  assert.equal(await button("Publish selected (2)").isEnabled(), true);
  await confirm("Publish selected (2)", false, "publish");
  assert.deepEqual(await counts(), { editions: 0, revisions: 0, kept: 0, dismissed: 0 });
  assert.equal(await page.getByTestId("last-request").textContent(), "None");
  await confirm("Keep selected (2)", false, "keep");
  assert.equal(await page.getByTestId("last-request").textContent(), "None");
  await confirm("Keep selected (2)", true, "keep");
  await page.getByRole("status").filter({ hasText: "2 candidates saved to Kept" }).waitFor();
  assert.deepEqual(await counts(), { editions: 0, revisions: 0, kept: 2, dismissed: 0 });
  assert.equal(
    await button("Dismiss selected (2)").isEnabled(),
    true,
    "Keep clears only its own selection",
  );
  await confirm("Dismiss selected (2)", false, "dismiss");
  assert.equal((await counts()).dismissed, 0);
  await confirm("Dismiss selected (2)", true, "dismiss");
  await page.getByRole("status").filter({ hasText: "2 candidates dismissed" }).waitFor();
  assert.deepEqual(await counts(), { editions: 0, revisions: 0, kept: 2, dismissed: 2 });

  await choose("Meadow Lantern Loop", "keep");
  await button("Page 1").click();
  await choose("Harbour Sunset Circuit", "keep");
  await button("Fail next request").click();
  await confirm("Publish selected (2)", true, "publish");
  await page.getByRole("alert").filter({ hasText: "Fixture connection failure" }).waitFor();
  assert.equal(
    await button("Publish selected (2)").isEnabled(),
    true,
    "A failed request keeps the selection available for retry",
  );
  assert.equal((await counts()).editions, 0);
  const message = await confirm("Publish selected (2)", true, "publish");
  assert.match(message, /dates, distances and start venues/);
  assert.match(message, /Meadow Lantern Loop/);
  assert.match(message, /Harbour Sunset Circuit/);
  await page.getByRole("status").filter({ hasText: "2 candidates published to RunRecs" }).waitFor();
  assert.deepEqual(await counts(), { editions: 2, revisions: 1, kept: 2, dismissed: 2 });
  const request = JSON.parse(await page.getByTestId("last-request").textContent());
  assert.equal(request.confirmed, true);
  assert.equal(request.sourcesReviewed, true);
  assert.equal(request.ids.length, 2);
  const publishedCard = page.locator("article").filter({ hasText: "Harbour Sunset Circuit" });
  assert.match(await publishedCard.innerText(), /Published/);
  await publishedCard.getByText("Race information, sources and checks", { exact: true }).click();
  assert.equal(await publishedCard.getByRole("link", { name: "Primary programme" }).count(), 1);
  assert.match(await publishedCard.innerText(), /Preserve the original newsletter evidence/);
  await choose("Harbour Sunset Circuit", "dismiss");
  await button("Page 2").click();
  await choose("Meadow Lantern Loop", "dismiss");
  await confirm("Dismiss selected (2)", true, "dismiss");
  await page.getByRole("status").filter({ hasText: "2 candidates dismissed" }).waitFor();
  assert.deepEqual(await counts(), { editions: 2, revisions: 1, kept: 0, dismissed: 4 });
  await choose("Orchard Spring Run", "keep");
  await button("Reset scan selection").click();
  assert.equal(await button("Keep selected (0)").isEnabled(), false);

  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/collector-bulk-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await choose("Orchard Spring Run", "keep");
  await page.screenshot({ path: "artifacts/collector-bulk-mobile.png", fullPage: true });
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll("main *")]
      .filter((element) => element.getBoundingClientRect().right > window.innerWidth)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.slice(0, 100),
        right: element.getBoundingClientRect().right,
      })),
  );
  assert.deepEqual(overflow, [], "Mobile content must fit the viewport");
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    "Mobile page must not scroll horizontally",
  );
  for (const name of ["Keep selected (1)", "Publish selected (1)", "Dismiss selected (0)"])
    assert.equal(await button(name).isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(
    "Collector bulk browser: cross-page selection, exclusive choices, cancel, keep, dismiss, publish, failure/retry, retained evidence and mobile layout passed against disposable database.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  if (server.exitCode === null) await once(server, "exit");
}
