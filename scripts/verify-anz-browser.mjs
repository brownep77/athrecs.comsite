import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
const root = resolve("artifacts/anz-browser");
mkdirSync(root, { recursive: true });
const row = (discipline, performance, year) => ({
  year,
  date: `${year}-03-10`,
  sourceDate: `10 Mar ${year}`,
  ageGroup: "",
  discipline,
  performance,
  wind: "",
  place: "2",
  venue: "Example Town",
  meeting: "Example meeting",
  sourceUrls: ["https://www.anzrankings.org.nz/site/profiles_con/athlete/42"],
  labels: [],
  verificationStatus: "source_verified",
});
const capture = {
  name: "Avery Example",
  club: "Test Club",
  coach: "Example Coach",
  externalId: "42",
  sourceUrl: "https://www.anzrankings.org.nz/site/profiles_con/athlete/42",
  eventCount: 2,
  medals: [
    {
      year: 2025,
      event: "3000m",
      ageGroup: "Senior women",
      performance: "10:01.23",
      medal: "silver",
      sourceUrl: "https://www.anzrankings.org.nz/site/profiles_con/athlete/42",
    },
  ],
  history: {
    provider: "Athletics New Zealand Rankings and Records",
    externalId: "42",
    sourceUrl: "https://www.anzrankings.org.nz/site/profiles_con/athlete/42",
    capturedAt: "2026-10-11T07:00:00Z",
    complete: true,
    yearsExpected: [2024, 2025],
    yearsCaptured: [2024, 2025],
    performances: [
      row("3000m", "10:01.23", 2025),
      row("3000m", "10:20.45", 2024),
      row("10km", "35:32", 2025),
    ],
  },
};
const data = process.env.ANZ_BROWSER_CAPTURE
  ? JSON.parse(readFileSync(process.env.ANZ_BROWSER_CAPTURE, "utf8"))
  : capture;
const file = (name, text) => {
  const path = resolve(root, name);
  writeFileSync(path, text);
  return path;
};
const api = file(
  "api.js",
  `window.anzSaves=[];export async function previewAnzImport(){return ${JSON.stringify({ version: "a".repeat(64), capture, athleteName: "Avery Example", previousCount: 0 })};}export async function saveAnzImport({data}){window.anzSaves.push(data);return {performances:3,medals:1,published:false,slug:'avery-example'};}`,
);
file("style.css", `@import "${resolve("src/styles.css")}";@source "${resolve("src")}";`);
file(
  "index.html",
  '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AnzPerformanceOverview}from'/@fs/${resolve("src/components/athletes/AnzPerformanceOverview.tsx")}';import{AnzImport}from'/@fs/${resolve("src/components/admin/AnzImport.tsx")}';import './style.css';const c=${JSON.stringify(data)};createRoot(document.getElementById('root')).render(<QueryClientProvider client={new QueryClient()}><main style={{maxWidth:980,margin:'auto',padding:20}}><h1 className="mb-6 font-display text-3xl font-semibold">{c.name}</h1><AnzPerformanceOverview histories={[c.history]} medals={c.medals} coach={{name:c.coach,slug:'example-coach'}}/><div className="mt-10"><AnzImport url="${capture.sourceUrl}" athleteId={1}/></div></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/anz/api", replacement: api },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8117, strictPort: true, fs: { allow: [process.cwd()] } },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ATHRECS_CHROMIUM_PATH,
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1050 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8117");
  await page.getByRole("heading", { name: "PBs", exact: true }).waitFor();
  await page.getByRole("combobox", { name: "Event" }).selectOption("10km");
  assert.equal(
    await page.getByRole("button", { name: /10km Road/ }).getAttribute("aria-pressed"),
    "true",
  );
  await page.screenshot({ path: resolve(root, "desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "Preview ANZ results", exact: true }).click();
  const save = page.getByRole("button", { name: "Save reviewed ANZ performances" });
  await save.waitFor();
  assert.equal(await save.isDisabled(), true);
  await page.getByRole("checkbox").check();
  await save.click();
  await page.getByRole("status").waitFor();
  assert.equal((await page.evaluate(() => window.anzSaves)).length, 1);
  assert.match(await page.getByRole("status").innerText(), /private pending/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("combobox", { name: "Event" })
    .selectOption(data.history.performances[0].discipline);
  await page.screenshot({ path: resolve(root, "mobile.png"), fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(
    "ANZ mobile/desktop layout, event selector, import preview, checked-save and private receipt passed.",
  );
} finally {
  await browser.close();
  await server.close();
}
