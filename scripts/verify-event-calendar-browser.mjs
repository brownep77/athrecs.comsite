import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { calendarDownloadResponse } from "../src/lib/athrecs/calendar-download.ts";
const require = createRequire(import.meta.url);
const engine = process.env.ATHRECS_BROWSER_ENGINE || "chromium";
assert(["chromium", "firefox", "webkit"].includes(engine), "Unsupported browser engine: " + engine);
const browserType = require(process.env.ATHRECS_BROWSER_MODULE || "playwright")[engine];
const root = path.resolve("artifacts/calendar-browser-fixture");
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, "style.css"),
  `@import "${path.resolve("src/styles.css")}";\n@source "${path.resolve("src")}";`,
);
fs.writeFileSync(
  path.join(root, "index.html"),
  '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><link rel="stylesheet" href="/style.css?direct"><script type="module" src="/entry.tsx"></script></body></html>',
);
fs.writeFileSync(
  path.join(root, "main.tsx"),
  `
import React,{useState} from 'react';
import{RaceActions}from'/@fs/${path.resolve("src/components/races/RaceActions.tsx")}';
import{RacePracticalInformation}from'/@fs/${path.resolve("src/components/races/RacePracticalInformation.tsx")}';
import{CompactFixtureRow}from'/@fs/${path.resolve("src/components/discovery/CompactFixtureRow.tsx")}';
import{useSavedFixtures}from'/@fs/${path.resolve("src/components/discovery/useSavedFixtures.ts")}';
import './style.css';
const base={id:'synthetic-half',name:'Calendar test race 🏃',distance:'Half marathon',date:'2027-07-04',startTime:'10:00',timeZone:'Europe/London',pageUrl:'https://www.athrecs.com/races/synthetic',location:'Synthetic venue',raceDayInformation:'Start and finish: Use the signed gate. HQ is at the hall.',officialUrl:'https://example.org'};
function App(){const saved=useSavedFixtures();const[other,setOther]=useState(false);const[later,setLater]=useState(false);const[different,setDifferent]=useState(false);const selected={...base,...(other?{id:'synthetic-full',distance:'Marathon',startTime:'08:30'}:{}),...(different?{id:'other-synthetic',name:'Other synthetic race',pageUrl:'https://www.athrecs.com/races/other-synthetic'}:{}),date:later?'2027-07-05':base.date};return <main style={{maxWidth:900,margin:'auto',padding:16}}>
<h1>Synthetic calendar regression fixture</h1><div data-case="changing"><RaceActions race={selected}/></div>
<button onClick={()=>setOther(v=>!v)}>Change selected distance</button>
<button onClick={()=>setLater(v=>!v)}>Change selected date</button>
<button onClick={()=>setDifferent(v=>!v)}>Change selected race</button>
<div data-case="unknown"><RaceActions race={{...base,id:'tbc',startTime:null}}/></div>
<div data-case="cancelled"><RaceActions race={{...base,status:'Cancelled'}}/></div>
<div data-case="invalid"><RaceActions race={{...base,date:'2027-02-30'}}/></div>
<div data-case="provisional"><RaceActions race={{...base,id:'provisional',provisional:true,startTime:null,endDate:'2027-07-06'}}/></div>
<div data-case="long"><RaceActions race={{...base,id:'long',name:'Very long international race name 東京 '.repeat(8),location:'Long location '.repeat(60)}}/></div>
<div data-case="integrated"><RacePracticalInformation data={{event:{id:9,slug:'synthetic',name:'Synthetic integrated race',sport:'Running',country:'England',county:'Norfolk',city:'Norwich',website:'https://example.org',description:'Synthetic test',surface:'Road'},upcoming:[{id:91,event_date:'2027-07-04',distance_code:'Half',distance_km:21.0975,start_time:'10:00',status:'Open',entry_options:[],entry_url:null,source_url:null},{id:92,event_date:'2027-07-04',distance_code:'Marathon',distance_km:42.195,start_time:'08:30',status:'Open',entry_options:[],entry_url:null,source_url:null}],past:[],groups:[],distances:[],related:[]}}/></div>
<div data-case="compact"><CompactFixtureRow fixture={{eventId:9,slug:'synthetic',name:base.name,eventDate:base.date,city:'Norwich',town:null,county:'Norfolk',state:null,country:'England',website:base.officialUrl,summary:'',timeZone:base.timeZone,starts:[{editionId:91,distance:'Half',distanceKm:21.0975,status:'Open',time:'10:00',label:null,note:null,calendarRace:base},{editionId:92,distance:'Marathon',distanceKm:42.195,status:'Open',time:'08:30',label:null,note:null,calendarRace:{...base,id:'synthetic-full',distance:'Marathon',startTime:'08:30'}}]}} saved={saved.isSaved({eventId:9,eventDate:base.date})} onToggleSaved={saved.toggleSaved} saveReady={saved.ready}/></div>
</main>}export{App};
`,
);
fs.writeFileSync(
  path.join(root, "entry.tsx"),
  `import React from 'react';import{hydrateRoot}from'react-dom/client';import{App}from'./main';hydrateRoot(document.getElementById('root')!,<App/>);document.documentElement.dataset.calendarHydrated='yes';`,
);
fs.writeFileSync(
  path.join(root, "ssr.tsx"),
  `import React from 'react';import{renderToString}from'react-dom/server';import{App}from'./main';export const markup=renderToString(<App/>);`,
);
const server = await createServer({
  configFile: false,
  root,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "calendar-download-fixture",
      configureServer(vite) {
        vite.middlewares.use("/api/event-calendar", async (req, res) => {
          const chunks = [];
          for await (const c of req) chunks.push(c);
          const response = await calendarDownloadResponse(
            new Request("http://127.0.0.1:8106/api/event-calendar", {
              method: req.method,
              headers: req.headers,
              body: Buffer.concat(chunks),
            }),
          );
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(Buffer.from(await response.arrayBuffer()));
        });
      },
    },
  ],
  resolve: { alias: { "@": path.resolve("src") }, dedupe: ["react", "react-dom"] },
  server: {
    host: "127.0.0.1",
    port: 8106,
    strictPort: true,
    fs: { allow: [process.cwd(), path.resolve("node_modules")] },
  },
  optimizeDeps: { include: ["react", "react-dom/client", "react/jsx-runtime"] },
});
let browser, page;
const errors = [];
let downloads = 0;
try {
  await server.listen();
  const { markup } = await server.ssrLoadModule("/ssr.tsx");
  fs.writeFileSync(
    path.join(root, "index.html"),
    fs
      .readFileSync(path.join(root, "index.html"), "utf8")
      .replace('<div id="root"></div>', '<div id="root">' + markup + "</div>"),
  );
  browser = await browserType.launch({
    headless: true,
    ...(engine === "chromium"
      ? { executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined }
      : {}),
  });
  page = await browser.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8106");
  const mainButton = page.locator('[data-case="changing"] summary[aria-label$="to calendar"]');
  const openCalendarButton = page.locator('details[open] > summary[aria-label$="to calendar"]');
  await mainButton.click();
  const dialog = page.locator('details[open] [role="group"][aria-label="Calendar options"]');
  await dialog.waitFor();
  assert.match(await dialog.innerText(), /Half marathon/);
  for (const [name, host] of [
    ["Google Calendar", "calendar.google.com"],
    ["Outlook.com", "outlook.live.com"],
    ["Microsoft 365", "outlook.office.com"],
  ]) {
    const link = dialog.getByRole("link", { name, exact: true });
    const url = new URL(await link.getAttribute("href"));
    assert.equal(url.hostname, host);
    assert.match(
      url.searchParams.get(name === "Google Calendar" ? "details" : "body"),
      /Use the signed gate/,
    );
    assert.equal(
      url.searchParams.get(name === "Google Calendar" ? "dates" : "startdt"),
      name === "Google Calendar" ? "20270704T090000Z/20270704T090000Z" : "2027-07-04T09:00:00Z",
    );
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.match(await link.getAttribute("rel"), /noopener/);
  }
  assert.equal(
    await dialog.getByRole("link", { name: "Apple Calendar", exact: true }).getAttribute("href"),
    "/my-race-calendar?race=synthetic-half",
  );
  for (const name of ["Download calendar file (.ics)"]) {
    const pending = page.waitForEvent("download");
    await dialog.getByRole("button", { name, exact: true }).click();
    const download = await pending;
    const text = fs.readFileSync(await download.path(), "utf8");
    assert.match(text, /DTSTART:20270704T090000Z/);
    assert.match(text, /BEGIN:VCALENDAR/);
    assert.match(text.replace(/\r\n /g, ""), /Use the signed gate/);
    assert(download.suggestedFilename().endsWith(".ics"));
    downloads++;
  }
  await openCalendarButton.focus();
  await page.keyboard.press("Space");
  await dialog.waitFor({ state: "hidden" });
  assert(
    await mainButton.evaluate((el) => document.activeElement === el),
    "Closing the native disclosure keeps keyboard focus on its summary",
  );
  await page.getByRole("button", { name: "Change selected distance" }).click();
  await mainButton.click();
  assert.match(await dialog.innerText(), /Marathon/);
  assert.match(
    await dialog.getByRole("link", { name: "Google Calendar", exact: true }).getAttribute("href"),
    /20270704T073000Z/,
  );
  await openCalendarButton.click();
  for (const name of ["cancelled", "invalid"]) {
    const section = page.locator(`[data-case="${name}"]`);
    assert(await section.getByRole("button", { name: /to calendar$/ }).isDisabled());
    assert(await section.locator('summary[aria-label^="Share "]').isVisible());
  }
  await page.locator('[data-case="unknown"] summary[aria-label$="to calendar"]').click();
  assert.match(await dialog.innerText(), /Date-only reminder/);
  const allDay = new URL(
    await dialog.getByRole("link", { name: "Google Calendar", exact: true }).getAttribute("href"),
  );
  assert.equal(allDay.searchParams.get("dates"), "20270704/20270705");
  await openCalendarButton.click();
  await page.locator('[data-case="provisional"] summary[aria-label$="to calendar"]').click();
  assert.match(await dialog.innerText(), /Provisional date/);
  await openCalendarButton.click();
  const integrated = page.locator('[data-case="integrated"]');
  const addButtons = integrated.locator('summary[aria-label$="to calendar"]');
  assert.equal(await addButtons.count(), 2);
  for (let i = 0; i < 2; i++) {
    await addButtons.nth(i).click();
    const params = new URL(
      await dialog.getByRole("link", { name: "Google Calendar", exact: true }).getAttribute("href"),
    ).searchParams;
    assert.equal(
      params.get("dates"),
      i === 0 ? "20270704T090000Z/20270704T090000Z" : "20270704T073000Z/20270704T073000Z",
    );
    await openCalendarButton.click();
  }
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('[data-case="long"] summary[aria-label$="to calendar"]').click();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "overflow at " + width,
    );
    for (const control of await dialog.locator("button,a").all()) {
      const box = await control.boundingBox();
      assert(box && box.width >= 40 && box.height >= 40, "touch target");
      assert(box.x >= 0 && box.x + box.width <= width + 1, "control clipped");
    }
    for (const control of await page.locator('summary[aria-label^="Share "]').all()) {
      const box = await control.boundingBox();
      assert(box && box.width >= 40 && box.height >= 40, "share touch target");
      assert(box.x >= 0 && box.x + box.width <= width + 1, "share control clipped");
    }
    await page.screenshot({ path: `artifacts/calendar-${engine}-${width}.png`, fullPage: true });
    await openCalendarButton.click();
  }
  // Exercise the real share button with isolated browser APIs: no external messages or real clipboard writes.
  async function mockSharing(native = "success", clipboard = "allowed") {
    await page.evaluate(
      ({ native, clipboard }) => {
        window.__raceShareCalls = [];
        window.__raceClipboardCalls = [];
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value:
            native === "missing"
              ? undefined
              : async (data) => {
                  window.__raceShareCalls.push(data);
                  if (native === "cancel") throw new DOMException("Cancelled", "AbortError");
                  if (native === "cancel-object") throw { name: "AbortError" };
                  if (native === "denied") throw new DOMException("Unavailable", "NotAllowedError");
                },
        });
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value:
            clipboard === "missing"
              ? undefined
              : {
                  writeText: async (value) => {
                    window.__raceClipboardCalls.push(value);
                    if (clipboard === "denied") throw new DOMException("Denied", "NotAllowedError");
                  },
                },
        });
      },
      { native, clipboard },
    );
  }
  const shareCase = page.locator('[data-case="changing"]');
  const shareSummary = shareCase.locator('summary[aria-label^="Share "]');
  const shareOptions = shareCase.locator('[role="group"][aria-label="Sharing options"]');
  const moreButton = shareOptions.getByRole("button", {
    name: "More sharing options",
    exact: true,
  });
  const raceUrl = "https://www.athrecs.com/races/synthetic";
  async function openSharing() {
    if (!(await shareSummary.evaluate((el) => el.parentElement.open))) await shareSummary.click();
    await shareOptions.waitFor();
  }
  async function closeSharing() {
    if (await shareSummary.evaluate((el) => el.parentElement.open)) await shareSummary.click();
    await shareOptions.waitFor({ state: "hidden" });
  }
  async function configureSharing(native = "success", clipboard = "allowed") {
    await closeSharing();
    await mockSharing(native, clipboard);
    await openSharing();
    await moreButton.waitFor({ state: native === "missing" ? "hidden" : "visible" });
  }
  async function inspectSharingLinks(panel, expectedUrl = raceUrl) {
    for (const [label, protocol, hostname, pathname] of [
      ["WhatsApp", "https:", "wa.me", "/"],
      ["Facebook", "https:", "www.facebook.com", "/sharer/sharer.php"],
      ["X", "https:", "x.com", "/intent/tweet"],
      ["Telegram", "https:", "t.me", "/share/url"],
      ["Email", "mailto:", "", ""],
    ]) {
      const link = panel.getByRole("link", { name: label, exact: true });
      assert(await link.isVisible(), label + " is visible");
      const url = new URL(await link.getAttribute("href"));
      assert.deepEqual([url.protocol, url.hostname, url.pathname], [protocol, hostname, pathname]);
      if (label === "WhatsApp" || label === "Email") {
        const text = url.searchParams.get(label === "Email" ? "body" : "text");
        assert(text.endsWith("\r\n\r\n" + expectedUrl));
      } else {
        assert.equal(url.searchParams.get(label === "Facebook" ? "u" : "url"), expectedUrl);
      }
      if (label === "Email") {
        assert.equal(await link.getAttribute("target"), null);
      } else {
        assert.equal(await link.getAttribute("target"), "_blank");
        assert.match(await link.getAttribute("rel"), /noopener/);
        assert.match(await link.getAttribute("rel"), /noreferrer/);
        assert.equal(await link.getAttribute("referrerpolicy"), "no-referrer");
      }
    }
  }
  await configureSharing();
  await inspectSharingLinks(shareOptions);
  assert.deepEqual(
    await page.evaluate(() => window.__raceShareCalls),
    [],
    "Opening choices never sends or invokes native sharing",
  );
  assert.deepEqual(
    await page.evaluate(() => window.__raceClipboardCalls),
    [],
    "Opening choices never copies",
  );
  await shareOptions.getByRole("link", { name: "WhatsApp", exact: true }).focus();
  await page.keyboard.press("Escape");
  await shareOptions.waitFor({ state: "hidden" });
  assert(
    await shareSummary.evaluate((el) => document.activeElement === el),
    "Escape returns focus to Share",
  );
  await openSharing();
  await page
    .getByRole("heading", { name: "Synthetic calendar regression fixture", exact: true })
    .click();
  await shareOptions.waitFor({ state: "hidden" });
  await openSharing();
  await moreButton.click();
  let shareCalls = await page.evaluate(() => window.__raceShareCalls);
  assert.equal(shareCalls.length, 1);
  assert.equal(shareCalls[0].url, raceUrl);
  assert.match(shareCalls[0].title, /Marathon/);
  assert.match(shareCalls[0].text, /4 Jul(?:y)? 2027/);
  assert.deepEqual(await page.evaluate(() => window.__raceClipboardCalls), []);
  assert.equal(await openCalendarButton.count(), 0, "Sharing must not toggle the calendar");
  await page.getByRole("button", { name: "Change selected distance" }).click();
  await page.getByRole("button", { name: "Change selected date" }).click();
  await openSharing();
  await moreButton.click();
  shareCalls = await page.evaluate(() => window.__raceShareCalls);
  assert.equal(shareCalls.length, 2);
  assert.match(shareCalls[1].title, /Half marathon/);
  assert.match(shareCalls[1].text, /5 Jul(?:y)? 2027/);
  assert.doesNotMatch(shareCalls[1].text, /4 Jul(?:y)? 2027/);
  assert.equal(shareCalls[1].url, raceUrl);
  await inspectSharingLinks(shareOptions);
  const changedText = new URL(
    await shareOptions.getByRole("link", { name: "Telegram", exact: true }).getAttribute("href"),
  ).searchParams.get("text");
  assert.match(changedText, /Half marathon/);
  assert.match(changedText, /5 Jul(?:y)? 2027/);
  await page.getByRole("button", { name: "Change selected race" }).click();
  await openSharing();
  await inspectSharingLinks(shareOptions, "https://www.athrecs.com/races/other-synthetic");
  assert.match(await shareSummary.getAttribute("aria-label"), /Other synthetic race/);
  await page.getByRole("button", { name: "Change selected race" }).click();
  for (const mode of ["cancel", "cancel-object"]) {
    await configureSharing(mode);
    await moreButton.click();
    assert.equal(await page.evaluate(() => window.__raceShareCalls.length), 1);
    assert.deepEqual(
      await page.evaluate(() => window.__raceClipboardCalls),
      [],
      "Cancelling must not copy",
    );
    assert.equal(await shareCase.getByLabel("Race link", { exact: true }).count(), 0);
  }
  for (const [mode, width] of [
    ["success", 320],
    ["missing", 390],
    ["denied", 1280],
  ]) {
    await page.setViewportSize({ width, height: 844 });
    await configureSharing(mode);
    if (mode === "denied") await moreButton.click();
    else await shareOptions.getByRole("button", { name: "Copy link", exact: true }).click();
    const copied = shareCase.getByRole("status").filter({ hasText: /link copied/i });
    await copied.waitFor();
    const copiedButton = shareOptions.getByRole("button", { name: "Link copied", exact: true });
    const copiedBox = await copiedButton.boundingBox();
    assert(
      copiedBox && copiedBox.x >= 0 && copiedBox.x + copiedBox.width <= width + 1,
      "copy confirmation clipped",
    );
    assert(
      await copiedButton.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      "copy confirmation text overflows",
    );
    assert.deepEqual(await page.evaluate(() => window.__raceClipboardCalls), [raceUrl]);
    if (mode !== "denied")
      assert.deepEqual(
        await page.evaluate(() => window.__raceShareCalls),
        [],
        "Copy is independent of native sharing",
      );
    assert(await shareOptions.isVisible(), "Copying keeps sharing choices open");
    await copied.waitFor({ state: "hidden", timeout: 5000 });
    assert(await shareOptions.getByRole("button", { name: "Copy link", exact: true }).isVisible());
  }
  for (const clipboard of ["denied", "missing"]) {
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.calendarHydrated === "yes");
    await configureSharing("missing", clipboard);
    await shareOptions.getByRole("button", { name: "Copy link", exact: true }).click();
    const manual = shareCase.getByLabel("Race link", { exact: true });
    await manual.waitFor();
    assert.equal(await manual.inputValue(), raceUrl);
    assert.notEqual(await manual.getAttribute("readonly"), null);
    assert.match(await shareCase.getByRole("status").innerText(), /copy/i);
    assert.equal(await openCalendarButton.count(), 0);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        "manual share fallback overflow at " + width,
      );
      const box = await manual.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, "manual race link clipped");
    }
  }
  await page.screenshot({
    path: `artifacts/calendar-${engine}-share-manual-390.png`,
    fullPage: true,
  });
  await closeSharing();
  const longShare = page.locator('[data-case="long"] summary[aria-label^="Share "]');
  const longOptions = page.locator(
    '[data-case="long"] [role="group"][aria-label="Sharing options"]',
  );
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await longShare.click();
    await longOptions.waitFor();
    await inspectSharingLinks(longOptions);
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "sharing panel overflow at " + width,
    );
    for (const control of await longOptions.locator("button,a").all()) {
      const box = await control.boundingBox();
      assert(box && box.width >= 40 && box.height >= 40, "sharing option touch target");
      assert(box.x >= 0 && box.x + box.width <= width + 1, "sharing option clipped");
      assert(
        await control.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        "sharing option text overflows",
      );
    }
    await page.screenshot({
      path: `artifacts/calendar-${engine}-sharing-${width}.png`,
      fullPage: true,
    });
    await longShare.click();
  }
  // The actual reported boundary: choices and downloads cannot depend on JS.
  for (const mode of ["disabled", "delayed"]) {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== "disabled",
      acceptDownloads: true,
      viewport: { width: 390, height: 844 },
    });
    const noJs = await context.newPage();
    noJs.on("pageerror", (e) => errors.push(e.message));
    let release;
    if (mode === "delayed") {
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await noJs.route("**/entry.tsx", async (route) => {
        await gate;
        await route.continue();
      });
    }
    await noJs.goto("http://127.0.0.1:8106", { waitUntil: mode === "delayed" ? "commit" : "load" });
    const summary = noJs.locator('[data-case="changing"] summary[aria-label$="to calendar"]');
    await summary.click();
    const choices = noJs.locator(
      '[data-case="changing"] [role="group"][aria-label="Calendar options"]',
    );
    assert(await choices.isVisible(), mode + " scripts: choices must open");
    for (const name of ["Google Calendar", "Outlook.com", "Microsoft 365"])
      assert(await choices.getByRole("link", { name, exact: true }).isVisible());
    const noJsShareSummary = noJs.locator('[data-case="changing"] summary[aria-label^="Share "]');
    const noJsShareOptions = noJs.locator(
      '[data-case="changing"] [role="group"][aria-label="Sharing options"]',
    );
    await noJsShareSummary.click();
    assert(await noJsShareOptions.isVisible(), mode + " scripts: sharing choices must open");
    await inspectSharingLinks(noJsShareOptions);
    const noJsCopy = noJsShareOptions.getByRole("button", { name: "Copy link", exact: true });
    assert(await noJsCopy.isDisabled(), "Clipboard action is disabled until hydration");
    if (mode === "disabled") {
      assert.equal(
        await noJsShareOptions
          .getByRole("link", { name: raceUrl, exact: true })
          .getAttribute("href"),
        raceUrl,
      );
    }
    if (release) {
      release();
      await noJs.waitForFunction(() => document.documentElement.dataset.calendarHydrated === "yes");
      assert(await choices.isVisible(), "Hydration must preserve an already open menu");
      assert(await noJsShareOptions.isVisible(), "Hydration must preserve open sharing choices");
      await noJsCopy.click({ trial: true });
    }
    await noJsShareSummary.focus();
    await noJs.keyboard.press("Space");
    assert(
      !(await noJsShareOptions.isVisible()),
      "Sharing disclosure keeps its native keyboard toggle",
    );
    const pending = noJs.waitForEvent("download");
    assert(await choices.getByRole("link", { name: "Apple Calendar", exact: true }).isVisible());
    await choices
      .getByRole("button", { name: "Download calendar file (.ics)", exact: true })
      .click();
    const downloaded = await pending;
    assert.match(fs.readFileSync(await downloaded.path(), "utf8"), /DTSTART:20270704T090000Z/);
    downloads++;
    await summary.focus();
    await noJs.keyboard.press("Space");
    assert(!(await choices.isVisible()), "Native keyboard toggle");
    await context.close();
  }
  const compact = page.locator('[data-case="compact"]');
  assert.equal(await compact.locator("select").count(), 0, "No duplicate distance dropdown");
  const saveRace = compact.getByRole("button", { name: /^Save race:/ });
  assert.equal(await saveRace.innerText(), "Save race");
  await saveRace.click();
  const savedRace = compact.getByRole("button", { name: /^Saved race:/ });
  assert.equal(await savedRace.innerText(), "Saved race");
  assert.equal(await savedRace.getAttribute("aria-pressed"), "true");
  await page.reload();
  await savedRace.waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("athrecs.saved-fixtures.v1")).fixtures[0].eventId,
    ),
    9,
  );
  await savedRace.click();
  await saveRace.waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("athrecs.saved-fixtures.v1")).fixtures.length,
    ),
    0,
  );
  const compactDate = compact.locator("time");
  assert.equal(await compactDate.getAttribute("aria-label"), "Sunday, 4 July 2027");
  assert.match(await compactDate.innerText(), /Sun · Jul/i);
  const marathonChoice = compact.getByRole("button", { name: /Marathon.*08:30/ });
  await marathonChoice.focus();
  await page.keyboard.press("Space");
  assert.equal(await marathonChoice.getAttribute("aria-pressed"), "true");
  const compactCalendar = compact.locator('summary[aria-label$="to calendar"]');
  const compactShare = compact.locator('summary[aria-label^="Share "]');
  await compactCalendar.click();
  const compactPayload = JSON.parse(await compact.locator('input[name="race"]').inputValue());
  assert.equal(compactPayload.id, "synthetic-full");
  assert.equal(compactPayload.startTime, "08:30");
  assert.match(compactPayload.raceDayInformation, /Use the signed gate/);
  assert.equal(
    await compact.getByRole("link", { name: "Race website", exact: true }).getAttribute("href"),
    "https://example.org/",
  );
  assert.equal(
    new URL(
      await compact
        .getByRole("link", { name: "Google Calendar", exact: true })
        .getAttribute("href"),
    ).searchParams.get("dates"),
    "20270704T073000Z/20270704T073000Z",
  );
  await compactCalendar.click();
  await compactShare.click();
  assert.match(
    await compact.getByRole("group", { name: "Sharing options" }).innerText(),
    /Marathon/,
  );
  await compact.getByRole("button", { name: /Half marathon.*10:00/ }).click();
  assert.match(await compactCalendar.getAttribute("aria-label"), /Half marathon/);
  assert.match(await compactShare.getAttribute("aria-label"), /Half marathon/);
  assert.equal(
    await compact.locator("details[open]").count(),
    0,
    "Changing distance clears old choices",
  );
  const colours = (el) => {
    const style = getComputedStyle(el);
    return [style.backgroundColor, style.color, style.borderTopColor];
  };
  await page.mouse.move(0, 0);
  assert.deepEqual(
    await compactCalendar.evaluate(colours),
    await mainButton.evaluate(colours),
    "Calendar retains its original purple colours",
  );
  assert.deepEqual(
    await compactShare.evaluate(colours),
    await shareSummary.evaluate(colours),
    "Share retains its original blue colours",
  );
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await compact.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      "Compact fixture overflow at " + width,
    );
    assert(
      await compactDate
        .locator("span")
        .first()
        .evaluate(
          (el) =>
            el.scrollWidth <= el.parentElement.clientWidth &&
            el.getBoundingClientRect().height < 20,
        ),
      "Weekday and month fit on one neat line",
    );
    await compact.screenshot({ path: `artifacts/calendar-${engine}-compact-${width}.png` });
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS (${engine}): real React controls and integrated race schedule; 3 calendar and 5 sharing provider URLs; ` +
      downloads +
      " downloaded ICS files; changed distances; date-only and disabled states; native keyboard controls; scripts disabled/delayed; server ICS downloads; sharing Escape/outside close and focus; independent Copy; mocked native sharing/cancellation and clipboard/manual fallbacks; current share race/date/distance; compact fixture weekday, original button colours and distance selection; 320/390/768/1280px.",
  );
} finally {
  await browser?.close();
  await server.close();
  fs.rmSync(root, { recursive: true, force: true });
}
