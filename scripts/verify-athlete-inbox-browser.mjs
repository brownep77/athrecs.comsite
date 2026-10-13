// Synthetic interface only: no credentials leave localhost and no real mailbox is used.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
const root = resolve("artifacts/athlete-inbox-fixture");
mkdirSync(root, { recursive: true });
const file = (name, text) => {
  const path = resolve(root, name);
  writeFileSync(path, text);
  return path;
};
const api = file(
  "inbox-api.js",
  `
window.failConnect=true;window.connectOptions=[];window.syncs=0;
const state={mailbox:'paul@athrecs.com',ready:true,connected:false,lastSyncedAt:null,lastError:null,imported:0,ambiguous:0};
export async function getAthleteInboxStatus(){return {...state};}
export async function connectStaffAthleteInbox({data}){window.connectOptions.push({includeRecent:data.includeRecent});if(window.failConnect)throw Error('Synthetic error');state.connected=true;return{connected:true};}
export async function syncStaffAthleteInbox(){window.syncs++;state.lastSyncedAt='2026-10-13T10:00:00Z';state.imported+=2;return{imported:2};}
export async function disconnectStaffAthleteInbox(){state.connected=false;return{connected:false};}
`,
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Inbox connection preview</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AthleteInboxConnection}from'/@fs/${resolve("src/components/staff/AthleteInboxConnection.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false}}});window.client=client;createRoot(document.getElementById('root')!).render(<QueryClientProvider client={client}><main style={{maxWidth:760,margin:'auto',padding:16}}><p>SYNTHETIC INBOX · NO LIVE EMAIL</p><AthleteInboxConnection/></main></QueryClientProvider>);`,
);
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve(root, ".vite"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@/lib/athrecs/athlete-inbox-api", replacement: api },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8130, strictPort: true, fs: { allow: [process.cwd()] } },
});
let browser, page;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8130");
  const password = page.getByLabel("Mailbox password", { exact: true });
  await password.waitFor();
  assert.equal(await password.getAttribute("type"), "password");
  assert(await page.getByRole("button", { name: "Connect inbox", exact: true }).isDisabled());
  await page.screenshot({ path: "artifacts/athlete-inbox-desktop.png", fullPage: true });
  await password.fill("synthetic-only-secret");
  await page.getByRole("button", { name: "Connect inbox", exact: true }).click();
  await page.getByText(/Could not connect\. Check the password/).waitFor();
  assert.equal(await password.inputValue(), "", "Clear failed credentials");
  await page.waitForFunction(
    () =>
      !JSON.stringify(
        window.client
          .getMutationCache()
          .getAll()
          .map((m) => m.state.variables),
      ).includes("synthetic-only-secret"),
  );
  await page.evaluate(() => {
    window.failConnect = false;
  });
  await password.fill("synthetic-only-secret");
  await page.getByLabel("Also check the past 30 days for athlete replies").uncheck();
  await page.getByRole("button", { name: "Connect inbox", exact: true }).click();
  await page.getByText("paul@athrecs.com is connected", { exact: true }).waitFor();
  assert.equal(await password.count(), 0);
  await page.waitForFunction(
    () =>
      !JSON.stringify(
        window.client
          .getMutationCache()
          .getAll()
          .map((m) => m.state.variables),
      ).includes("synthetic-only-secret"),
  );
  assert.deepEqual(await page.evaluate(() => window.connectOptions), [
    { includeRecent: true },
    { includeRecent: false },
  ]);
  await page.getByRole("button", { name: "Sync now", exact: true }).click();
  await page.getByText("2 new replies added.", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.syncs), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.screenshot({ path: "artifacts/athlete-inbox-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Reconnect", exact: true }).click();
  await password.waitFor();
  assert.equal(await password.inputValue(), "");
  await page.getByRole("button", { name: "Disconnect inbox", exact: true }).click();
  await page
    .getByText("Inbox disconnected. Saved athlete messages are kept.", { exact: true })
    .waitFor();
  assert.equal(await password.inputValue(), "");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: masked credentials cleared after success/failure, no retained password in query cache, recent-mail option, sync, reconnect/disconnect and desktop/mobile layout. Synthetic inbox only.",
  );
} catch (error) {
  await page?.screenshot({ path: "artifacts/athlete-inbox-failure.png", fullPage: true });
  throw error;
} finally {
  await browser?.close();
  await server.close();
  rmSync(root, { recursive: true, force: true });
}
