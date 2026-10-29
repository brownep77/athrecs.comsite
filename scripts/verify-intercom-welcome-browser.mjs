import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { chromium } from "playwright";

// Render the real welcome, Messenger lifecycle and CSS. Only the external
// authentication and Intercom SDK boundaries are synthetic; no customer data
// or live Messenger requests leave this local fixture.
const project = process.cwd();
const fixture = mkdtempSync(resolve(tmpdir(), "athrecs-intercom-welcome-"));
const screenshots = mkdtempSync(resolve(tmpdir(), "athrecs-intercom-welcome-shots-"));
const file = (name, content) => {
  const path = resolve(fixture, name);
  writeFileSync(path, content);
  return path;
};
const auth = file(
  "auth.js",
  `import {useSyncExternalStore} from 'react';
const mode=new URLSearchParams(location.search).get('auth');
let state={user:mode==='member'?{id:'fixture-member',displayName:'Synthetic Athlete',isDevFallback:false}:null,isPending:mode==='pending',hasSessionError:mode==='error',retrySession:async()=>{}};
const listeners=new Set();
export const readAuth=()=>state;
export function setAuth(next){state={...state,...next};listeners.forEach(fn=>fn())}
export function useCurrentUserState(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},readAuth,readAuth)}`,
);
const identity = file(
  "identity.js",
  `import {readAuth} from './auth.js';
export async function getIntercomIdentity(){const user=readAuth().user;return user?{status:'ready',userId:user.id,jwt:'synthetic.test.token',expiresAt:Date.now()/1000+3600}:{status:'disabled'}}`,
);
const site = file("site.js", "export const IS_ATHRECS_SITE=true;");
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local Messenger welcome verification</title></head><body class="athrecs-theme"><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "style.css",
  `@import "${resolve(project, "src/styles.css")}";\n@source "${resolve(project, "src")}";`,
);
file(
  "main.tsx",
  `import React,{useEffect,useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {IntercomWelcome} from '/@fs/${resolve(project, "src/components/assistant/IntercomWelcome.tsx")}';
import {IntercomMessenger} from '/@fs/${resolve(project, "src/components/assistant/IntercomMessenger.tsx")}';
import * as messenger from '/@fs/${resolve(project, "src/lib/athrecs/intercom.ts")}';
import {setAuth,readAuth} from './auth.js';
import './style.css';
const calls=[];const callbacks=new Map();
const emit=(name)=>{for(const cb of callbacks.get(name)||[])cb()};
const stub=document.createElement('script');stub.id='intercom-widget-script';stub.type='application/x-local-test';document.head.appendChild(stub);
window.Intercom=(method,...args)=>{
  calls.push([method,...args.map(value=>typeof value==='function'?'[callback]':value)]);
  if(['ready','onShow','onHide'].includes(method)){callbacks.set(method,[...(callbacks.get(method)||[]),args[0]]);return;}
  if(method==='show'||method==='showNewMessage')emit('onShow');
  if(method==='hide'||method==='shutdown')emit('onHide');
};
window.fixture={calls,ready:()=>emit('ready'),hide:()=>emit('onHide'),nativeOpen:()=>emit('onShow'),snapshot:messenger.getIntercomDisplayState,open:messenger.openIntercom,boot:messenger.bootIntercom,setAuth,readAuth,navigate:(path)=>{history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'))},mounted:false};
function App(){
  const pathname=useSyncExternalStore(cb=>{window.addEventListener('popstate',cb);return()=>window.removeEventListener('popstate',cb)},()=>location.pathname);
  useEffect(()=>{window.fixture.mounted=true},[]);
  return <div className="mx-auto min-h-dvh max-w-6xl">
    <header className="border-b border-border px-4 py-4 font-bold">ATHRECS <span className="ml-2 text-xs font-normal text-muted">Local display test</span></header>
    <IntercomWelcome pathname={pathname}/>
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Find your next race</h1>
      <label className="grid max-w-md gap-2">Search races<input id="fixture-input" className="rounded border px-3 py-2" placeholder="Race name"/></label>
      <div id="fixture-dialog" role="dialog" aria-label="Test editing dialog" hidden className="mt-4 border bg-surface p-4">An editing dialog is open.</div>
      <button id="fixture-neutral" className="mt-4 rounded border px-4 py-2">Browse races</button>
      <p className="mt-6 text-sm text-muted">Synthetic verification only. No live conversations are created.</p>
    </main>
    <IntercomMessenger pathname={pathname}/>
    <nav className="fixed inset-x-0 bottom-0 flex h-16 items-center justify-around border-t bg-surface lg:hidden" aria-label="Fixture mobile navigation"><span>Home</span><span>Results</span><span>Athletes</span></nav>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);`,
);

const server = await createServer({
  configFile: false,
  root: fixture,
  plugins: [react(), tailwind()],
  define: { "import.meta.env.VITE_INTERCOM_APP_ID": JSON.stringify("testapp1") },
  resolve: {
    alias: [
      { find: "@/lib/auth/use-current-user", replacement: auth },
      { find: "@/lib/athrecs/intercom-api", replacement: identity },
      { find: "@/lib/site-scope", replacement: site },
      { find: "@", replacement: resolve(project, "src") },
      { find: "react", replacement: resolve(project, "node_modules/react") },
      { find: "react-dom", replacement: resolve(project, "node_modules/react-dom") },
      { find: "lucide-react", replacement: resolve(project, "node_modules/lucide-react") },
    ],
  },
  server: { host: "127.0.0.1", port: 0, fs: { allow: [project, fixture] } },
});
await server.listen();
const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
let browser;
let cases = 0;
const errors = [];
const externalRequests = [];
const showCount = (page) =>
  page.evaluate(() => window.fixture.calls.filter(([method]) => method === "show").length);
const markReady = async (page) => {
  await page.waitForFunction(() => window.fixture.calls.some(([method]) => method === "ready"));
  await page.evaluate(() => window.fixture.ready());
  await page.waitForFunction(() => window.fixture.snapshot().ready);
};
const goto = async (page, path = "/") => {
  await page.goto(origin + path);
  await page.waitForFunction(() => window.fixture?.mounted);
  await page.bringToFront();
};
const newPage = async (context, path = "/") => {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const frozen = new Date("2026-10-28T12:00:00Z");
  await page.clock.install({ time: frozen });
  await page.clock.pauseAt(new Date(frozen.getTime() + 60_000));
  await goto(page, path);
  return page;
};
const withPage = async (label, options, run) => {
  const context = await browser.newContext({
    viewport: options?.viewport ?? { width: 1280, height: 900 },
  });
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    externalRequests.push(route.request().url());
    return route.abort();
  });
  try {
    const page = await newPage(context, options?.path);
    await run(page, context);
    cases += 1;
    console.log(`PASS ${label}`);
  } finally {
    await context.close();
  }
};

try {
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
  });

  await withPage(
    "actual SDK readiness gates desktop opening; once-only across reload and SPA",
    {},
    async (page) => {
      await page.clock.runFor(20_000);
      assert.equal(await showCount(page), 0, "No ready callback means no automatic open");
      await markReady(page);
      await page.clock.runFor(9999);
      assert.equal(await showCount(page), 0, "Wait the full ten seconds");
      await page.screenshot({ path: resolve(screenshots, "desktop-banner.png"), fullPage: true });
      await page.clock.runFor(1);
      assert.equal(await showCount(page), 1);
      await page.evaluate(() => window.fixture.hide());
      await page.evaluate(() => window.fixture.navigate("/athletes"));
      await page.clock.runFor(30_000);
      assert.equal(await showCount(page), 1, "Changing browsing pages must not reopen it");
      await goto(page);
      await markReady(page);
      await page.clock.runFor(30_000);
      assert.equal(await showCount(page), 0, "Reload keeps the seen preference");
    },
  );

  for (const mode of ["pending", "error", "member"]) {
    await withPage(
      `${mode} account state never triggers automatic chat`,
      { path: `/?auth=${mode}` },
      async (page) => {
        if (mode === "member") await markReady(page);
        else await page.evaluate(() => window.fixture.ready());
        await page.clock.runFor(30_000);
        assert.equal(await showCount(page), 0);
        if (mode !== "member")
          assert.equal(await page.locator("[data-intercom-welcome]").count(), 0);
        else
          assert.equal(
            await page
              .getByText("Need help with your profile or results?", { exact: true })
              .count(),
            1,
          );
      },
    );
  }

  await withPage(
    "a pending sign-in invalidates an almost-due anonymous introduction",
    {},
    async (page) => {
      await markReady(page);
      await page.clock.runFor(9999);
      await page.evaluate(() => window.fixture.setAuth({ isPending: true }));
      await page.clock.runFor(30_000);
      assert.equal(await showCount(page), 0);
      await page.evaluate(() =>
        window.fixture.setAuth({
          isPending: false,
          user: { id: "fixture-member", displayName: "Synthetic Athlete", isDevFallback: false },
        }),
      );
      await markReady(page);
      await page.clock.runFor(30_000);
      assert.equal(await showCount(page), 0);
    },
  );

  await withPage(
    "an expired signed-in identity cannot open Messenger",
    { path: "/?auth=member" },
    async (page) => {
      await markReady(page);
      await page.evaluate(() =>
        window.fixture.boot({
          userId: "fixture-member",
          jwt: "synthetic.expiring.token",
          expiresAt: Date.now() / 1000 + 1,
        }),
      );
      await page.clock.runFor(1001);
      assert.equal(await page.evaluate(() => window.fixture.open()), false);
      assert.equal(await showCount(page), 0);
      assert.equal(await page.evaluate(() => window.fixture.snapshot().ready), false);
      assert.equal(await page.getByRole("link", { name: "Ask AthRecs by email" }).count(), 1);
    },
  );

  await withPage("typing and visible editing dialogs defer the welcome", {}, async (page) => {
    await markReady(page);
    await page.locator("#fixture-input").focus();
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
    await page.locator("#fixture-neutral").focus();
    await page.clock.runFor(5000);
    await page.evaluate(() => {
      document.querySelector("#fixture-dialog").hidden = false;
    });
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
    await page.evaluate(() => {
      document.querySelector("#fixture-dialog").hidden = true;
    });
    await page.clock.runFor(10_000);
    assert.equal(await showCount(page), 1);
  });

  await withPage("manual Messenger opening cancels the pending introduction", {}, async (page) => {
    await markReady(page);
    await page.clock.runFor(5000);
    await page.evaluate(() => {
      window.fixture.nativeOpen();
      window.fixture.hide();
    });
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
  });

  await withPage("banner dismissal prevents prompts and survives reload", {}, async (page) => {
    await markReady(page);
    await page.getByRole("button", { name: "Dismiss the AthRecs welcome banner" }).click();
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
    assert.equal(await page.locator('[data-intercom-welcome="banner"]').count(), 0);
    assert.equal(await page.getByRole("link", { name: "Ask AthRecs in chat" }).count(), 1);
    await goto(page);
    await markReady(page);
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
    assert.equal(await page.locator('[data-intercom-welcome="banner"]').count(), 0);
  });

  await withPage(
    "mobile welcome stays compact and clear of navigation",
    { viewport: { width: 375, height: 667 } },
    async (page) => {
      await markReady(page);
      await page.clock.runFor(10_000);
      const card = page.locator('[data-intercom-welcome="mobile"]');
      assert.equal(await card.isVisible(), true);
      assert.equal(
        await showCount(page),
        0,
        "Mobile must not automatically open the full Messenger",
      );
      const bounds = await card.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 375);
      assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 667 - 150);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: resolve(screenshots, "mobile-welcome.png"), fullPage: true });
      await page.getByRole("button", { name: "Dismiss the AthRecs welcome message" }).click();
      await goto(page);
      await markReady(page);
      await page.clock.runFor(30_000);
      assert.equal(await page.locator('[data-intercom-welcome="mobile"]').count(), 0);
      assert.equal(await showCount(page), 0);
    },
  );

  await withPage(
    "all four choices prefill a composer without sending a message",
    { viewport: { width: 375, height: 667 } },
    async (page) => {
      await markReady(page);
      await page.clock.runFor(10_000);
      const choice = page.locator(
        '[data-intercom-welcome="mobile"] [data-intercom-choice="profile"]',
      );
      await choice.click();
      assert.equal(await page.locator('[data-intercom-welcome="mobile"]').count(), 0);
      assert.equal(
        await page.evaluate(
          () => window.fixture.calls.filter(([method]) => method === "showNewMessage").length,
        ),
        1,
      );
      assert.match(
        await page.evaluate(
          () => window.fixture.calls.find(([method]) => method === "showNewMessage")[1],
        ),
        /find my athlete profile/,
      );
      await page.evaluate(() => window.fixture.hide());
      await page.setViewportSize({ width: 1280, height: 900 });
      for (const key of ["results", "race", "correction"]) {
        await page
          .locator(`[data-intercom-welcome="banner"] [data-intercom-choice="${key}"]`)
          .click();
        await page.evaluate(() => window.fixture.hide());
      }
      assert.equal(
        await page.evaluate(
          () => window.fixture.calls.filter(([method]) => method === "showNewMessage").length,
        ),
        4,
      );
      assert.equal(
        await page.evaluate(
          () => window.fixture.calls.filter(([method]) => method === "startConversation").length,
        ),
        0,
      );
    },
  );

  await withPage("blocked SDK offers real browse and support destinations", {}, async (page) => {
    await page.clock.runFor(30_000);
    assert.equal(await showCount(page), 0);
    assert.equal(
      await page.getByRole("link", { name: "Ask AthRecs by email" }).getAttribute("href"),
      "mailto:support@athrecs.com",
    );
    const expected = {
      profile: "/athletes",
      results: "mailto:support@athrecs.com?subject=Missing%20AthRecs%20results",
      race: "/races",
      correction: "mailto:support@athrecs.com?subject=AthRecs%20correction",
    };
    for (const [key, href] of Object.entries(expected)) {
      assert.equal(
        await page.locator(`[data-intercom-choice="${key}"]`).getAttribute("href"),
        href,
      );
    }
    await page.locator('[data-intercom-choice="profile"]').click();
    assert.equal(new URL(page.url()).pathname, "/athletes");
  });

  await withPage(
    "dismissal in another tab prevents an automatic opening",
    {},
    async (page, context) => {
      await markReady(page);
      const other = await newPage(context);
      await markReady(other);
      await page.bringToFront();
      await page.getByRole("button", { name: "Dismiss the AthRecs welcome banner" }).click();
      await other.bringToFront();
      await other.clock.runFor(30_000);
      assert.equal(await showCount(other), 0);
      assert.equal(await other.locator('[data-intercom-welcome="banner"]').count(), 0);
    },
  );

  await withPage(
    "browsing forms and account routes do not show a welcome",
    { path: "/athlete-account" },
    async (page) => {
      await markReady(page);
      for (const path of [
        "/athlete-account",
        "/athletes/fixture/edit",
        "/claim-results",
        "/privacy",
        "/admin",
      ]) {
        await page.evaluate((pathname) => window.fixture.navigate(pathname), path);
        await page.clock.runFor(20_000);
        assert.equal(await page.locator("[data-intercom-welcome]").count(), 0, path);
        assert.equal(await showCount(page), 0, path);
      }
    },
  );

  await withPage(
    "tablet desktop breakpoint has no horizontal overflow",
    { viewport: { width: 1024, height: 768 } },
    async (page) => {
      await markReady(page);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: resolve(screenshots, "desktop-1024.png"), fullPage: true });
    },
  );
  assert.deepEqual(errors, [], "No browser runtime errors");
  assert.deepEqual(externalRequests, [], "The isolated fixture never contacts external services");
  console.log(JSON.stringify({ passed: cases, screenshots }));
} finally {
  await browser?.close();
  await server.close();
  rmSync(fixture, { recursive: true, force: true });
}
