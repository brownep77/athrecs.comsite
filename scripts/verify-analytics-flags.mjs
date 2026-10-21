import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "playwright";
import {
  evaluatePublicFeatureFlags,
  publicFeatureFlagConfig,
} from "../src/lib/athrecs/public-feature-flags.ts";
import { WEB_ANALYTICS_NOTICE_VERSION } from "../src/lib/athrecs/web-analytics.ts";

const enabled = publicFeatureFlagConfig({});
assert.deepEqual(evaluatePublicFeatureFlags("/", true, enabled), {
  "homepage-colour-picker": true,
  "language-picker": true,
});
assert.deepEqual(evaluatePublicFeatureFlags("/athletes", true, enabled), {
  "language-picker": true,
});
assert.deepEqual(evaluatePublicFeatureFlags("/", false, enabled), {});
for (const pathname of ["/admin", "/athlete-account", "/join", "/%61dmin", "/?email=private"]) {
  assert.deepEqual(evaluatePublicFeatureFlags(pathname, true, enabled), {}, pathname);
}
assert.deepEqual(
  evaluatePublicFeatureFlags(
    "/",
    true,
    publicFeatureFlagConfig({
      VITE_FLAG_HOMEPAGE_COLOUR_PICKER: "false",
      VITE_FLAG_LANGUAGE_PICKER: " FALSE ",
    }),
  ),
  { "homepage-colour-picker": false, "language-picker": false },
);
assert.deepEqual(publicFeatureFlagConfig({ VITE_FLAG_LANGUAGE_PICKER: "invalid" }), enabled);

// Use the real analytics component and SDK. Only the router, first-party storage
// API and remote script transport are intercepted. No live analytics are sent.
const root = mkdtempSync(resolve(".analytics-flags-test-"));
const file = (name, content) => {
  const path = resolve(root, name);
  writeFileSync(path, content);
  return path;
};
const router = file(
  "router.js",
  `
import {useSyncExternalStore} from 'react';
export function useRouterState({select}) {
  const pathname=useSyncExternalStore(callback=>{
    addEventListener('popstate',callback);
    return ()=>removeEventListener('popstate',callback);
  },()=>location.pathname);
  return select({location:{pathname}});
}
window.navigate=path=>{history.pushState({},'',path);dispatchEvent(new PopStateEvent('popstate'));};
`,
);
const api = file(
  "api.js",
  `
export const ANALYTICS_CONSENT_VERSION='synthetic';
export const recordSiteAnalyticsEvent=async()=>({});
export const withdrawSiteAnalyticsConsent=async()=>({});
`,
);
file(
  "index.html",
  '<!doctype html><html><head></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {useRouterState} from '@tanstack/react-router';
import {SiteAnalytics} from '@/components/analytics/SiteAnalytics';
import {evaluatePublicFeatureFlags,publicFeatureFlagConfig} from '@/lib/athrecs/public-feature-flags';
function Fixture(){
  const pathname=useRouterState({select:s=>s.location.pathname});
  const config=publicFeatureFlagConfig(window.disabledFlags ? {
    VITE_FLAG_HOMEPAGE_COLOUR_PICKER:'false',VITE_FLAG_LANGUAGE_PICKER:'false'
  } : {});
  return <SiteAnalytics featureFlags={evaluatePublicFeatureFlags(pathname,true,config)}/>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);
`,
);
let server;
let browser;
try {
  server = await createServer({
    configFile: false,
    root,
    cacheDir: resolve(root, ".vite"),
    plugins: [react()],
    define: { "import.meta.env.PROD": "true" },
    resolve: {
      alias: [
        { find: "@/lib/athrecs/data-intelligence-api", replacement: api },
        { find: /^@tanstack\/react-router$/, replacement: router },
        { find: "@", replacement: resolve("src") },
      ],
    },
    server: { host: "127.0.0.1", port: 0, hmr: false, fs: { allow: [process.cwd()] } },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
    executablePath: process.env.ATHRECS_BROWSER_EXECUTABLE || undefined,
  });
  const context = await browser.newContext();
  const errors = [];
  let scriptRequests = 0;
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/_vercel/insights/script.js") {
      scriptRequests++;
      return route.fulfill({
        contentType: "application/javascript",
        body: `
        window.captured=[];let beforeSend;
        window.va=(type,payload)=>{
          if(type==='beforeSend'){beforeSend=payload;return;}
          if(type!=='pageview')return;
          const event=beforeSend?.({type:'pageview',url:new URL(payload.path,location.origin).href});
          if(event)window.captured.push({event,flags:Object.assign({},...Array.from(document.querySelectorAll('[data-flag-values]'),s=>JSON.parse(s.textContent)))});
        };
        for(const args of window.vaq||[])window.va(...args);
        window.vaq=[];
      `,
      });
    }
    assert.equal(url.hostname, "www.athrecs.com", "no third-party requests");
    const response = await fetch(`${origin}${url.pathname}${url.search}`);
    return route.fulfill({
      status: response.status,
      contentType: response.headers.get("content-type") || "text/plain",
      body: Buffer.from(await response.arrayBuffer()),
    });
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("https://www.athrecs.com/");
  await page.getByRole("button", { name: "Allow anonymous analytics" }).waitFor();
  assert.equal(scriptRequests, 0);
  assert.equal(await page.locator("[data-flag-values]").count(), 0);
  await page.getByRole("button", { name: "Allow anonymous analytics" }).click();
  await page.waitForFunction(() => window.captured?.length === 1);
  assert.deepEqual((await page.evaluate(() => window.captured))[0].flags, {
    "homepage-colour-picker": true,
    "language-picker": true,
  });
  await page.evaluate(() => window.navigate("/athletes?search=private#secret"));
  await page.waitForFunction(() => window.captured.length === 2);
  assert.deepEqual((await page.evaluate(() => window.captured))[1], {
    event: { type: "pageview", url: "https://www.athrecs.com/athletes" },
    flags: { "language-picker": true },
  });
  await page.evaluate(() => window.navigate("/athlete-account"));
  await page.waitForFunction(() => !document.querySelector("[data-flag-values]"));
  await page.evaluate(() => window.va("pageview", { path: "/athlete-account" }));
  assert.equal(await page.evaluate(() => window.captured.length), 2);
  await page.evaluate(() => {
    window.disabledFlags = true;
    window.navigate("/");
  });
  await page.waitForFunction(() => window.captured.length === 3);
  assert.deepEqual((await page.evaluate(() => window.captured))[2].flags, {
    "homepage-colour-picker": false,
    "language-picker": false,
  });
  await page.getByRole("button", { name: "Review analytics privacy choices" }).click();
  await page.getByRole("button", { name: "No thanks" }).click();
  await page.waitForFunction(() => !document.querySelector("[data-flag-values]"));
  await page.evaluate(() => window.va("pageview", { path: "/results" }));
  assert.equal(
    await page.evaluate(() => window.captured.length),
    3,
    "withdrawal blocks loaded SDK",
  );
  assert.equal(scriptRequests, 1, "SPA transitions do not load duplicate SDKs");
  await page.reload();
  await page.getByRole("button", { name: "Review analytics privacy choices" }).waitFor();
  assert.equal(await page.locator("[data-flag-values]").count(), 0);
  assert.equal(scriptRequests, 1, "denied consent persists");
  await page.evaluate((version) => {
    localStorage.setItem("athrecs:analytics-consent", "granted");
    localStorage.setItem("athrecs:analytics-notice", version);
  }, WEB_ANALYTICS_NOTICE_VERSION);
  await page.goto("https://www.athrecs.com/admin");
  await page.waitForFunction(() => typeof window.navigate === "function");
  assert.equal(scriptRequests, 1, "private entry never starts tracking");
  assert.deepEqual(errors, []);
  await context.close();
  console.log(
    "Analytics flags: defaults, disabled variants, route scoping, consent, SPA navigation, private pages and withdrawal passed.",
  );
} finally {
  await browser?.close();
  await server?.close();
  rmSync(root, { recursive: true, force: true });
}
