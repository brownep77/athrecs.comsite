import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "vite";
import * as cheerio from "cheerio";

// Real routes and browser interactions, with an isolated disposable database.
process.env.DATABASE_URL = "";
process.env.RESEND_API_KEY = "";
process.env.VITE_SITE_BRAND = "athrecs";
const origin = "http://127.0.0.1:18544";
const server = await createServer({ server: { host: "127.0.0.1", port: 18544, strictPort: true } });
let database;
let browser;
try {
  await server.listen();
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  const { FEATURED_ROAD_RACES: races } = await server.ssrLoadModule("/src/data/featured-road-races.ts");
  const { isUpcomingFeaturedRace, featuredCaption } = await server.ssrLoadModule("/src/lib/running/featured-road-races.ts");
  assert.equal(races.length, 20);
  assert.equal(new Set(races.map((race) => race.slug)).size, 20);
  const auckland = races.find((race) => race.slug === "auckland-marathon-2026");
  assert(isUpcomingFeaturedRace(auckland, "2026-11-01T10:59:59Z"));
  assert(!isUpcomingFeaturedRace(auckland, "2026-11-01T11:00:00Z"));
  const london = races.find((race) => race.slug === "london-marathon-2027");
  assert(isUpcomingFeaturedRace(london, "2027-04-25T22:59:59Z"));
  assert(!isUpcomingFeaturedRace(london, "2027-04-25T23:00:00Z"));

  for (const race of races) {
    const route = `/running/previews/${race.slug}`;
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, route);
    assert.equal(response.headers.get("cache-control"), "no-store", route);
    const $ = cheerio.load(await response.text());
    assert.equal($("h1").text(), `${race.name} ${race.date.slice(0, 4)}`);
    assert.equal($('link[rel="canonical"]').attr("href"), `https://www.athrecs.com${route}`);
    assert.equal($('meta[name="description"]').attr("content"), race.summary);
    const article = $('script[type="application/ld+json"]').toArray()
      .map((el) => JSON.parse($(el).html())).find((item) => item["@type"] === "Article");
    assert.equal(article.about.startDate, race.date);
    assert.equal(article.about.endDate, race.endDate ?? race.date);
    assert.equal(article.dateModified, race.checkedAt);
    assert.equal(article.about.url, race.officialUrl);
    assert.equal($("main a").filter((i, el) => $(el).text() === "Official results and archives").attr("href"), race.resultsUrl);
    for (const athlete of race.athletes)
      assert($("#athletes-to-watch").parent().text().includes(athlete.name));
    const card = await fetch(`${origin}/featured-races/${race.slug}.png`);
    assert.equal(card.status, 200);
    const png = Buffer.from(await card.arrayBuffer());
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 1350);
  }
  console.log("PASS: all 20 previews, metadata, JSON-LD, result links, cards and local date boundaries.");

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/verify-running-guides-ssr.mjs"], {
      stdio: "inherit", env: { ...process.env, RUNNING_VERIFY_BASE: origin },
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Running SSR check exited ${code}`)));
  });
  if (!process.argv.includes("--ssr-only")) {
    const require = createRequire(import.meta.url);
    const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
    await fs.mkdir("artifacts", { recursive: true });
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport, permissions: ["clipboard-read", "clipboard-write"] });
      // Optional remote typography is outside this navigation/content test.
      await context.route("https://fonts.googleapis.com/**", (route) =>
        route.fulfill({ status: 200, contentType: "text/css", body: "" }));
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => { if (message.type() === "error") errors.push(`${message.text()} ${message.location().url}`); });
      page.on("requestfailed", (request) => console.log("Browser request failed:", request.url(), request.failure()));
      await page.goto(`${origin}/running`, { waitUntil: "networkidle" });
      for (const route of ["events", "calendar", "race-series"])
        assert.equal(await page.locator(`nav[aria-label="Running tools"] a[href="/running/${route}"]`).count(), 1);
      assert.equal(await page.title(), "Running Races, Calendars & Race Guides | ATHRECS");
      await page.screenshot({ path: `artifacts/running-landing-${viewport.width}.png`, fullPage: true });
      await page.locator('main a[href="/running/featured-races"]').click();
      await page.waitForURL("**/running/featured-races");
      const now = new Date();
      const upcoming = races.filter((race) => isUpcomingFeaturedRace(race, now));
      await page.waitForFunction((count) => document.querySelectorAll("main article").length === count, upcoming.length);
      await page.getByRole("button", { name: "UK", exact: true }).click();
      await page.waitForFunction((count) => document.querySelectorAll("main article").length === count,
        upcoming.filter((race) => race.country === "United Kingdom").length);
      await page.getByRole("button", { name: "Worldwide", exact: true }).click();
      await page.waitForFunction((count) => document.querySelectorAll("main article").length === count, upcoming.length);
      const next = [...upcoming].sort((a, b) => a.date.localeCompare(b.date))[0];
      assert(next, "An upcoming fixture is needed to exercise the share controls");
      await page.locator(`main h2 a[href="/running/previews/${next.slug}"]`).click();
      await page.waitForURL(`**/running/previews/${next.slug}`);
      assert.equal(await page.locator('nav a[aria-current="page"][href="/running/featured-races"]').count(), 1);
      await page.getByText("Share this preview on Instagram", { exact: true }).click();
      const img = page.getByAltText(`${next.name} race preview card`);
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((element) => element.decode());
      assert.deepEqual(await img.evaluate((el) => [el.naturalWidth, el.naturalHeight]), [1080, 1350]);
      await page.getByRole("button", { name: "Copy caption", exact: true }).click();
      await page.getByText("Caption copied", { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), featuredCaption(next));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "No page overflow");
      await page.screenshot({ path: `artifacts/featured-preview-${viewport.width}.png`, fullPage: true });
      await page.goto(`${origin}/running/previews/cardiff-half-marathon-2026`, { waitUntil: "networkidle" });
      if (!isUpcomingFeaturedRace(races[0], now)) {
        assert(await page.getByText("Previous race preview", { exact: false }).count());
        assert.equal(await page.getByRole("button", { name: "Copy caption", exact: true }).count(), 0);
      }
      assert.deepEqual(errors, [], `Browser errors at ${viewport.width}px`);
      await context.close();
    }
    console.log("PASS: desktop/mobile navigation, filtering, active links, archived preview, card decoding and clipboard (no social posting).");
  }
} finally {
  await browser?.close();
  await server.close();
  await database?.close();
}
