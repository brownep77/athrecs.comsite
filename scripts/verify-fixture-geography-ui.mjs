import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { checkedUrl } from "./browser-guard.mjs";
import { countryFlag } from "../src/lib/athrecs/country-flags.ts";

// Uses the quality gate's seeded local server; never edits live records.
const base = checkedUrl(process.argv[2] || "http://127.0.0.1:8080");
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  // A cold --force Vite server can invalidate the first client module while it
  // optimizes dependencies. Warm it separately, then test fresh pages with the
  // full error assertion still enabled (persistent application errors fail).
  const warmup = await browser.newPage();
  await warmup.goto(`${base}/races/gothenburg-marathon`, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  await warmup.reload({ waitUntil: "networkidle", timeout: 90_000 });
  await warmup.close();
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    // The first browser load includes cold Vite dependency optimisation and reload.
    page.setDefaultNavigationTimeout(90_000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const [slug, code] of [
      ["gothenburg-marathon", "SE"],
      ["shanghai-marathon", "CN"],
      ["spar-budapest-international-marathon", "HU"],
      ["capital-to-country", "NP"],
      ["amica-insurance-seattle-marathon", "US"],
    ]) {
      const response = await page.goto(`${base}/races/${slug}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, slug);
      const flags = page.locator("header [data-country-code]");
      assert.ok((await flags.count()) > 0, slug);
      for (const flag of await flags.all())
        assert.equal(await flag.getAttribute("data-country-code"), code, slug);
      if (slug === "gothenburg-marathon") {
        assert.equal(
          await page.getByRole("heading", { name: "Gothenburg Marathon", exact: true }).count(),
          1,
        );
        assert.ok(!(await page.locator("body").innerText()).includes("Gothenburg · Scotland"));
        const schedule = await page.locator("#race-schedule").innerText();
        assert.match(schedule, /10 Oct 2026/);
        assert.match(schedule, /10:00 CEST/);
        assert.match(await page.locator("#race-location").innerText(), /Slottsskogsvallen/);
        await page.screenshot({ path: `artifacts/gothenburg-${width}.png` });
      }
    }
    // The searchable race cards use a different country/venue rendering path.
    const raceSearch = new URLSearchParams({
      q: "Gothenburg Marathon",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
      country: "Sweden",
    });
    await page.goto(`${base}/running/events?${raceSearch}`, { waitUntil: "networkidle" });
    const gothenburgCard = page.locator("article").filter({ hasText: "Gothenburg Marathon" });
    await gothenburgCard.waitFor();
    assert.equal(await gothenburgCard.count(), 1);
    assert.equal(
      await gothenburgCard.locator("[data-country-code]").getAttribute("data-country-code"),
      "SE",
    );
    await page.screenshot({ path: `artifacts/gothenburg-race-search-${width}.png` });
    raceSearch.set("country", "Scotland");
    await page.goto(`${base}/running/events?${raceSearch}`, { waitUntil: "networkidle" });
    assert.equal(
      await page.locator("article").filter({ hasText: "Gothenburg Marathon" }).count(),
      0,
    );
    // Exercise actual server filtering and the hydrated form on every sport fixture surface.
    for (const sport of ["road-running", "trail-running", "track-and-field"]) {
      await page.goto(`${base}/sports/${sport}`, { waitUntil: "networkidle" });
      const options = await page.locator("#sport-fixture-country option").allTextContents();
      assert.equal(new Set(options).size, options.length, `${sport}: duplicate country options`);
      const chosen =
        options.find((label) => label === "Sweden") ||
        options.find(
          (label) => countryFlag(label).code && !countryFlag(label).code.startsWith("GB"),
        );
      assert.ok(chosen, `${sport}: no country filter`);
      await page.getByLabel("Country", { exact: true }).selectOption({ label: chosen });
      await Promise.all([
        page.waitForURL((url) => url.searchParams.get("country") === chosen),
        page.getByRole("button", { name: "Apply filters", exact: true }).click(),
      ]);
      const flags = page.locator("#fixtures [data-country-code]");
      await flags.first().waitFor();
      for (const flag of await flags.all())
        assert.equal(await flag.getAttribute("data-country-code"), countryFlag(chosen).code, sport);
      await page.screenshot({ path: `artifacts/${sport}-country-${width}.png` });
    }
    assert.deepEqual(errors, [], `page errors at width ${width}`);
    await page.close();
  }
  console.log(
    "PASS: desktop/mobile race details, searchable cards, Gothenburg dates/venue and hydrated country filters across road, trail and track fixtures.",
  );
} finally {
  await browser.close();
}
