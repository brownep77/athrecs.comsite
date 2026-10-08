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
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
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
        await page.screenshot({ path: `artifacts/gothenburg-${width}.png` });
      }
    }
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
    "PASS: desktop/mobile race flags and hydrated country filters across road, trail and track fixtures.",
  );
} finally {
  await browser.close();
}
