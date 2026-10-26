import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const origin = "http://127.0.0.1:18261";
const server = await createServer({
  server: { host: "127.0.0.1", port: 18261, strictPort: true },
});
let browser;
try {
  await server.listen();
  const helpers = await server.ssrLoadModule("/src/lib/athrecs/race-weather.ts");
  assert.equal(helpers.raceDayWeather("unknown-event", "2023-07-16"), null);
  assert.equal(helpers.raceDayWeather("run-norwich", "2023"), null);
  assert.equal(helpers.raceDayWeather("run-norwich", "2023-07-17"), null);
  assert.equal(helpers.raceWeatherCondition([]), "Conditions unavailable");
  assert.equal(helpers.raceWeatherCondition([1, 3, 7]), "Rain at times");
  assert.equal(helpers.raceWeatherTemperature({ minC: -4, maxC: 0 }), "-4–0°C");
  const snapshots = JSON.parse(await readFile("src/data/race-day-weather.json", "utf8"));
  for (const [key, weather] of Object.entries(snapshots)) {
    assert(key.endsWith(`|${weather.date}`));
    assert(weather.archives.every((archive) => archive.sha256 || archive.error));
    if (weather.status !== "available") continue;
    assert(weather.hours >= weather.expectedHours * 0.75);
    assert(weather.minC <= weather.maxC);
    if (weather.precipitationMm != null)
      assert.equal(weather.precipitationHours, weather.expectedHours);
  }
  const { CompactResultsTable } = await server.ssrLoadModule(
    "/src/components/athletes/CompactResultsTable.tsx",
  );
  // Synthetic performances; the edition keys only exercise shared weather lookup.
  const results = [
    ["run-norwich", "2023-07-16"],
    ["norfolk-marathon-half", "2025-04-13"],
    ["cebu-marathon", "2011-01-09"],
    ["uncollected-race", "2024-01-01"],
  ].map(([eventSlug, eventDate], index) => ({
    resultId: index + 1,
    editionId: index + 1,
    eventSlug,
    eventDate,
    eventName: "Example long race name and half marathon",
    city: "Example town",
    country: "England",
    sport: "Running",
    surface: "Road",
    distanceCode: "Half",
    distanceKm: 21.0975,
    finishTimeSeconds: 6000,
    chipTimeSeconds: 6000,
    gunTimeSeconds: null,
    overallPlace: 123,
    category: "M45",
    status: "finished",
    sourceUrls: [],
    history: { key: `synthetic-${index}` },
  }));
  const html = renderToStaticMarkup(createElement(CompactResultsTable, { results }));
  assert(html.includes("Weather unavailable"));
  assert(html.includes("CC BY 4.0"));
  const css = await (await fetch(`${origin}/src/styles.css?direct`)).text();
  browser = await chromium.launch({
    executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await mkdir("artifacts", { recursive: true });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body><main style="max-width:1152px;margin:24px auto;padding:0 16px"><h1 style="font-size:24px;margin-bottom:20px">Example athlete · Results</h1>${html}</main></body></html>`,
    );
    assert.equal(await page.locator(".result-weather[open]").count(), 0);
    const checkWidth = async () =>
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `No horizontal page overflow at ${width}px`,
      );
    await checkWidth();
    const disclosure = page.locator(".result-weather summary").first();
    await disclosure.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator(".result-weather[open]").count(), 1);
    await checkWidth();
    await page.keyboard.press("Enter");
    await page.screenshot({ path: `artifacts/race-weather-${width}.png`, fullPage: true });
  }
  console.log(
    "PASS: edition matching, missing data, licence, keyboard disclosure and five viewport widths",
  );
} finally {
  await browser?.close();
  await server.close();
}
