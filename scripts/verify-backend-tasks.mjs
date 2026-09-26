import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root = resolve("artifacts/backend-task-fixture");
mkdirSync(root, { recursive: true });
writeFileSync(resolve(root, "style.css"), `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
writeFileSync(resolve(root, "main.tsx"), `import React from 'react';import{createRoot}from'react-dom/client';import{BackendTaskPanel}from'/@fs/${resolve("src/components/staff/BackendTaskPanel.tsx")}';import'./style.css';createRoot(document.getElementById('root')!).render(<main style={{maxWidth:1280,margin:'auto',padding:20}}><p>ISOLATED NAVIGATION TEST — NO LIVE DATABASE</p><BackendTaskPanel/></main>);`);
writeFileSync(resolve(root, "index.html"), '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
const server = await createServer({ configFile: false, root, plugins: [react(), tailwindcss()], resolve: { alias: { "@": resolve("src") } }, server: { host: "127.0.0.1", port: 8101, strictPort: true, fs: { allow: [process.cwd()] } } });
await server.listen();
const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  await page.goto("http://127.0.0.1:8101");
  await page.getByRole("heading", { name: "What would you like to do?" }).waitFor();
  const cards = page.locator('[aria-label="Backend tasks"] article');
  assert.equal(await cards.count(), 17);
  const paths = await cards.locator("a").evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute("href")));
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) {
    assert(path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin#"));
    const route = path.split("#")[0];
    assert(existsSync(`src/routes${route === "/admin" ? "/admin/index" : route}.tsx`), `Missing route: ${path}`);
  }
  const covered = new Set(paths.map(path => path.split("#")[0]));
  for (const name of readdirSync("src/routes/admin").filter(name => name.endsWith(".tsx") && !name.includes("$"))) {
    const route = name === "index.tsx" ? "/admin" : `/admin/${name.slice(0, -4)}`;
    assert(covered.has(route), `Top-level staff tool missing from panel: ${route}`);
  }
  const linksCard = cards.filter({ has: page.getByRole("heading", { name: "Import official results-page links", exact: true }) });
  assert.match(await linksCard.innerText(), /adds links, not runners or finish times/);
  assert.equal(await linksCard.getByRole("link").getAttribute("href"), "/admin/result-links");
  assert.match(readFileSync("src/routes/admin/result-links.tsx", "utf8"), /Upload result-page links for existing editions/);
  await page.screenshot({ path: "artifacts/import-backend-tasks-desktop.png", fullPage: true });
  await page.getByLabel("Find a backend task").fill("duplicates");
  assert.equal(await cards.count(), 1);
  assert.equal(await cards.getByRole("link").getAttribute("href"), "/admin/check-results-upload");
  await page.getByLabel("Find a backend task").fill("does-not-exist-xyz");
  assert.equal(await cards.count(), 0);
  await page.getByRole("button", { name: "Show all tasks", exact: true }).click();
  assert.equal(await cards.count(), 17);
  await page.getByRole("button", { name: "Maintenance & data", exact: true }).click();
  assert.equal(await cards.count(), 3);
  await page.getByRole("button", { name: "All tasks", exact: true }).click();
  assert.equal(await cards.count(), 17);
  assert.equal(await page.getByRole("link", { name: "Import athletes & results", exact: true }).getAttribute("href"), "/admin/check-results-upload");
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await page.screenshot({ path: "artifacts/import-backend-tasks-mobile.png", fullPage: true });
  const shell = readFileSync("src/components/staff/StaffMicrositeShell.tsx", "utf8");
  assert(shell.indexOf("if (!access.data.authorized)") < shell.lastIndexOf("<BackendTaskPanel"));
  assert.match(shell, /IS_ATHRECS_SITE && pathname === "\/admin"/);
  assert.match(shell, /id="legacy-admin-tools"/);
  assert.doesNotMatch(readFileSync("src/components/staff/BackendTaskPanel.tsx", "utf8"), /createServerFn|getSql|fetch\(|localStorage/);
  assert.deepEqual(errors, []);
  console.log("PASS: all top-level staff routes covered, 17 distinct tool links, accurate results-link purpose, duplicates search opens athlete/results importer, search/reset/categories, no writes or live requests, preserved authentication/brand gate and desktop/mobile navigation layout.");
} catch (error) {
  if (page) await page.screenshot({ path: "artifacts/import-backend-tasks-failure.png", fullPage: true });
  throw error;
} finally { await browser.close(); await server.close(); rmSync(root, { recursive: true, force: true }); }
