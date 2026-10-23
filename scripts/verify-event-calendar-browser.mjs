import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { calendarDownloadResponse } from "../src/lib/athrecs/calendar-download.ts";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ATHRECS_BROWSER_MODULE || "playwright");
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
import{AddToCalendar}from'/@fs/${path.resolve("src/components/races/AddToCalendar.tsx")}';
import{RacePracticalInformation}from'/@fs/${path.resolve("src/components/races/RacePracticalInformation.tsx")}';
import './style.css';
const base={id:'synthetic-half',name:'Calendar test race 🏃',distance:'Half marathon',date:'2027-07-04',startTime:'10:00',timeZone:'Europe/London',pageUrl:'https://www.athrecs.com/races/synthetic',location:'Synthetic venue',officialUrl:'https://example.org'};
function App(){const[other,setOther]=useState(false);return <main style={{maxWidth:900,margin:'auto',padding:16}}>
<h1>Synthetic calendar regression fixture</h1><div data-case="changing"><AddToCalendar race={other?{...base,id:'synthetic-full',distance:'Marathon',startTime:'08:30'}:base}/></div>
<button onClick={()=>setOther(v=>!v)}>Change selected distance</button>
<div data-case="unknown"><AddToCalendar race={{...base,id:'tbc',startTime:null}}/></div>
<div data-case="cancelled"><AddToCalendar race={{...base,status:'Cancelled'}}/></div>
<div data-case="invalid"><AddToCalendar race={{...base,date:'2027-02-30'}}/></div>
<div data-case="provisional"><AddToCalendar race={{...base,id:'provisional',provisional:true,startTime:null,endDate:'2027-07-06'}}/></div>
<div data-case="long"><AddToCalendar race={{...base,id:'long',name:'Very long international race name 東京 '.repeat(8),location:'Long location '.repeat(60)}}/></div>
<div data-case="integrated"><RacePracticalInformation data={{event:{id:9,slug:'synthetic',name:'Synthetic integrated race',sport:'Running',country:'England',county:'Norfolk',city:'Norwich',website:'https://example.org',description:'Synthetic test',surface:'Road'},upcoming:[{id:91,event_date:'2027-07-04',distance_code:'Half',distance_km:21.0975,start_time:'10:00',status:'Open',entry_options:[],entry_url:null,source_url:null},{id:92,event_date:'2027-07-04',distance_code:'Marathon',distance_km:42.195,start_time:'08:30',status:'Open',entry_options:[],entry_url:null,source_url:null}],past:[],groups:[],distances:[],related:[]}}/></div>
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
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ATHRECS_CHROMIUM_EXECUTABLE || undefined,
  });
  page = await browser.newPage({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8106");
  const mainButton = page.locator('[data-case="changing"] summary');
  await mainButton.click();
  const dialog = page.locator('details[open] [role="group"]');
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
    assert(download.suggestedFilename().endsWith(".ics"));
    downloads++;
  }
  await page.locator("details[open] > summary").click();
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
  await page.locator("details[open] > summary").click();
  assert(await page.locator('[data-case="cancelled"] button').isDisabled());
  assert(await page.locator('[data-case="invalid"] button').isDisabled());
  await page.locator('[data-case="unknown"] summary').click();
  assert.match(await dialog.innerText(), /Date-only reminder/);
  const allDay = new URL(
    await dialog.getByRole("link", { name: "Google Calendar", exact: true }).getAttribute("href"),
  );
  assert.equal(allDay.searchParams.get("dates"), "20270704/20270705");
  await page.locator("details[open] > summary").click();
  await page.locator('[data-case="provisional"] summary').click();
  assert.match(await dialog.innerText(), /Provisional date/);
  await page.locator("details[open] > summary").click();
  const integrated = page.locator('[data-case="integrated"]');
  const addButtons = integrated.locator("summary");
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
    await page.locator("details[open] > summary").click();
  }
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('[data-case="long"] summary').click();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "overflow at " + width,
    );
    for (const control of await dialog.locator("button,a").all()) {
      const box = await control.boundingBox();
      assert(box && box.width >= 40 && box.height >= 40, "touch target");
      assert(box.x >= 0 && box.x + box.width <= width + 1, "control clipped");
    }
    await page.screenshot({ path: "artifacts/calendar-" + width + ".png", fullPage: true });
    await page.locator("details[open] > summary").click();
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
    const summary = noJs.locator('[data-case="changing"] summary');
    await summary.click();
    const choices = noJs.locator('[data-case="changing"] [role="group"]');
    assert(await choices.isVisible(), mode + " scripts: choices must open");
    for (const name of ["Google Calendar", "Outlook.com", "Microsoft 365"])
      assert(await choices.getByRole("link", { name, exact: true }).isVisible());
    if (release) {
      release();
      await noJs.waitForFunction(() => document.documentElement.dataset.calendarHydrated === "yes");
      assert(await choices.isVisible(), "Hydration must preserve an already open menu");
    }
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
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real React controls and integrated race schedule; 3 provider URLs; " +
      downloads +
      " downloaded ICS files; changed distances; date-only and disabled states; native keyboard controls; scripts disabled/delayed; server ICS downloads; 320/390/768/1280px.",
  );
} finally {
  await browser?.close();
  await server.close();
  fs.rmSync(root, { recursive: true, force: true });
}
