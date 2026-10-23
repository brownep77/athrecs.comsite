import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";

// Isolated synthetic fixture: no application server, auth session or database.
const fixture = await mkdtemp(path.resolve(".ratings-browser-"));
const fixturePath = `${path.basename(fixture)}/main.tsx`;
const year = Number(
  new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric" }).format(
    new Date(),
  ),
);
const race = (id, changes = {}) => ({
  resultId: id,
  editionId: id,
  eventName: `Synthetic race ${id}`,
  eventSlug: `synthetic-${id}`,
  sport: "Running",
  surface: "Road",
  country: "GB",
  eventDate: `${year}-01-01`,
  distanceCode: "5K",
  distanceKm: 5,
  status: "finished",
  finishTimeSeconds: 1200,
  chipTimeSeconds: 1200,
  gunTimeSeconds: null,
  overallPlace: null,
  category: null,
  resultGender: "M",
  sourceUrls: ["https://example.test/PRIVATE-EVIDENCE"],
  ...changes,
});
const results = [
  ...Array.from({ length: 25 }, (_, i) => race(i + 1)),
  race(30, { eventDate: `${year - 1}-06-01`, finishTimeSeconds: 1080, chipTimeSeconds: 1080 }),
  race(31, {
    distanceCode: "50K",
    distanceKm: 50,
    surface: "Trail",
    finishTimeSeconds: 18000,
    chipTimeSeconds: 18000,
  }),
  race(32, { sport: "Parkrun", surface: "Parkrun" }),
];
let server;
let browser;
try {
  await writeFile(
    path.join(fixture, "main.tsx"),
    `
    import { createRoot } from 'react-dom/client';
    import { DistanceRatings } from '/src/components/athletes/DistanceRatings.tsx';
    import '/src/styles.css';
    createRoot(document.getElementById('root')!).render(<main className="mx-auto max-w-5xl p-3"><DistanceRatings results={${JSON.stringify(results)}} /></main>);
  `,
  );
  server = await createServer({
    configFile: false,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "ratings-fixture",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (request.url !== "/") return next();
            response.setHeader("Content-Type", "text/html");
            response.end(
              await server.transformIndexHtml(
                "/",
                `<html lang="en" class="athrecs-theme"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/${fixturePath}"></script></body></html>`,
              ),
            );
          });
        },
      },
    ],
    resolve: { alias: { "@": path.resolve("src") } },
    appType: "custom",
    logLevel: "error",
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  browser = await chromium.launch({
    headless: true,
    ...(process.env.ATHRECS_BROWSER_EXECUTABLE
      ? { executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE }
      : {}),
  });
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(server.resolvedUrls.local[0]);
    await page.getByRole("heading", { name: "Distance ratings & race points" }).waitFor();
    const allTime = page.getByRole("article").first();
    assert.match(await allTime.innerText(), /480.61 points/);
    assert.match(await allTime.innerText(), /15.61 ultra bonus/);
    await page.getByText("Ultra participation bonuses", { exact: true }).click();
    const bonusTable = page
      .getByRole("table")
      .filter({ has: page.getByText("Part of each race", { exact: true }) });
    assert.equal(await bonusTable.locator("tbody tr").count(), 4);
    await page.getByText("Ultra participation bonuses", { exact: true }).click();
    assert.match(await allTime.innerText(), /28 completed events/);
    await page.getByText(`Every rated performance · ${year} (27)`, { exact: true }).click();
    const individual = page.getByRole("table", { name: /^Individual performance ratings for / });
    assert.equal(await individual.locator("tbody tr").count(), 10);
    await page.getByRole("button", { name: "Show more performances" }).click();
    assert.equal(await individual.locator("tbody tr").count(), 27);
    await page.getByLabel("Season", { exact: true }).selectOption(String(year - 1));
    assert.equal(await individual.locator("tbody tr").count(), 1);
    assert.match(await page.getByRole("article").nth(1).innerText(), /15 points/);
    assert.match(await individual.innerText(), /18:00/);
    const groups = page.getByRole("table", { name: "Performance rating by distance" });
    assert.equal(
      await groups.locator("tbody tr").count(),
      3,
      "Road, parkrun and trail remain separate",
    );
    assert.match(await groups.innerText(), /Distance-only estimate/);
    assert(!(await page.content()).includes("PRIVATE-EVIDENCE"));
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      "Mobile page stays within the viewport",
    );
    assert.deepEqual(errors, [], "No browser runtime errors");
    if (process.env.ATHRECS_RATINGS_SCREENSHOT_DIR)
      await page.screenshot({
        path: path.join(
          process.env.ATHRECS_RATINGS_SCREENSHOT_DIR,
          `ratings-${viewport.width}.png`,
        ),
        fullPage: true,
      });
    await page.close();
  }
  console.log(
    "Distance ratings browser: desktop/mobile, season switching, pagination, totals, surface separation and evidence privacy passed.",
  );
} finally {
  await browser?.close();
  await server?.close();
  await rm(fixture, { recursive: true, force: true });
}
