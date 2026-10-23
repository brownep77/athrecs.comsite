// Actual React -> loopback HTTP -> actual validated server functions -> disposable SQL.
// Only the session/middleware host is synthetic. No production connection or external requests.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";
import * as matchingSettings from "../src/lib/athrecs/result-matching-settings.ts";
import * as resultMatch from "../src/lib/athrecs/result-match.ts";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { londonPaginationFixture, londonFixtureUrl } from "./fixtures/london-pagination.mjs";
import { browserResultsBookmark } from "./lib/browser-results-button.mjs";
const require = createRequire(import.meta.url),
  ts = require("typescript");
function load(path, deps = {}) {
  const m = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (n) => {
      if (!(n in deps)) throw Error(`Unexpected dependency ${n}`);
      return deps[n];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const db = new PGlite();
await db.waitReady;
function sqlFor(connection) {
  const query = async (s, p = []) => (await connection.query(s, p)).rows;
  const sql = async (parts, ...v) => {
    let s = parts[0];
    v.forEach((_, i) => (s += `$${i + 1}${parts[i + 1]}`));
    return query(s, v);
  };
  sql.query = query;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
for (const name of readdirSync("migrations")
  .filter((n) => n.endsWith(".sql"))
  .sort())
  await db.exec(readFileSync(`migrations/${name}`, "utf8"));
const actor = { userId: "archive-browser-staff", staffEmail: "browser@example.test" };
await sql`insert into "user"(id,name,email,"emailVerified") values(${actor.userId},'Synthetic Browser Staff',${actor.staffEmail},true),('archive-browser-member','Morgan Browser Synthetic','morgan@example.test',true)`;
const [event] =
  await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('archive-browser-race','Synthetic Browser Race','Running','GB','','','Road','Synthetic') returning id`;
await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-10-01','10K',10,'Finished')`;
const core = load("src/lib/results-archive/core.ts", { zod: { z } });
const service = load("src/lib/results-archive/service.server.ts", {
  "node:crypto": crypto,
  "./core": core,
});
const member = load("src/lib/results-archive/member.server.ts", {
  "../athrecs/result-matching-settings": matchingSettings,
  "../athrecs/result-match": resultMatch,
});
const start = {
  createServerFn: () => {
    let middleware = [],
      validate = (x) => x;
    const chain = {
      middleware(x) {
        middleware = x;
        return chain;
      },
      validator(x) {
        validate = x;
        return chain;
      },
      handler(fn) {
        return async (data, context) => {
          assert.deepEqual(middleware, ["staff"]);
          return fn({ data: validate(data), context });
        };
      },
    };
    return chain;
  },
};
const api = load("src/lib/results-archive/api.ts", {
  "@tanstack/react-start": start,
  zod: { z },
  "../auth/staff-middleware": { staffMiddleware: "staff" },
  "../db": { getSql: async () => sql, dbSource: "neon" },
  "./core": core,
  "./service.server": service,
});
const methods = {
  ...api,
  getStaffArchiveRequests: () => member.staffArchiveRequests(sql),
  getMyArchiveMatches: () => member.memberArchiveMatches(sql, "archive-browser-member"),
  requestMyArchiveMatches: (input) =>
    member.requestArchiveMatches(sql, "archive-browser-member", input),
};
const root = resolve("artifacts/results-archive-browser");
mkdirSync(root, { recursive: true });
function file(name, content) {
  const p = resolve(root, name);
  writeFileSync(p, content);
  return p;
}
const bridge = file(
  "bridge.js",
  Object.keys(methods)
    .map(
      (name) =>
        `export async function ${name}(arg={}){const r=await fetch('/archive-test-api/${name}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(arg.data||{})});const value=await r.json();if(!r.ok)throw Error(value.error);return value;}`,
    )
    .join("\n"),
);
file(
  "index.html",
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
);
file(
  "main.tsx",
  `import React from 'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{ResultsArchiveWorkspace}from'/@fs/${resolve("src/components/staff/ResultsArchiveWorkspace.tsx")}';import{ArchivedResultSuggestions}from'/@fs/${resolve("src/components/athletes/ArchivedResultSuggestions.tsx")}';import'./style.css';const client=new QueryClient({defaultOptions:{queries:{retry:false}}});createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{maxWidth:1280,margin:'auto',padding:16}}><p>SYNTHETIC VERIFICATION · DISPOSABLE DATABASE</p>{location.search.includes('member')?<ArchivedResultSuggestions userId="archive-browser-member"/>:<ResultsArchiveWorkspace/>}</main></QueryClientProvider>);`,
);
file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);
let loseFirstReceipt = true;
let loseCollectionReceipt = true;
const server = await createServer({
  configFile: false,
  root,
  cacheDir: resolve("node_modules/.cache/archive-browser-vite"),
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "archive-test-api",
      configureServer(s) {
        s.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/archive-test-api/")) return next();
          try {
            const name = req.url.split("/").at(-1);
            if (!(name in methods)) throw Error("Unknown test API");
            let body = "";
            for await (const chunk of req) body += chunk;
            const value = await methods[name](JSON.parse(body || "{}"), actor);
            if (name === "saveArchiveBatch" && loseFirstReceipt) {
              loseFirstReceipt = false;
              throw Error("Synthetic lost response after database commit");
            }
            if (name === "saveArchiveBatch" && loseCollectionReceipt && JSON.parse(body).rows?.some(r => r.bib === "9003")) {
              loseCollectionReceipt = false;
              throw Error("Synthetic collection receipt lost after commit");
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(value));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: "@/lib/results-archive/api", replacement: bridge },
      { find: "@/lib/results-archive/member-api", replacement: bridge },
      { find: "@", replacement: resolve("src") },
    ],
  },
  server: { host: "127.0.0.1", port: 8139, strictPort: true, fs: { allow: [process.cwd()] } },
});
await server.listen();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ATHRECS_TEST_CHROMIUM_EXECUTABLE ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
});
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort(),
  );
  await page.goto("http://127.0.0.1:8139");
  await page.getByRole("heading", { name: "Central results archive" }).waitFor();
  await page.getByRole("button", { name: "Import a race", exact: true }).click();
  await page.getByLabel("Results CSV, TSV or browser capture").setInputFiles({
    name: "synthetic.csv", mimeType: "text/csv",
    buffer: Buffer.from("Bib,Name,Chip Time,Gun Time\n1,Morgan Browser Synthetic,00:35:00.25,00:35:02.25\n2,Casey Browser Synthetic,00:36:00.15,00:36:02.15"),
  });
  await page.getByRole("button", { name: "Continue to race" }).click();
  await page.getByLabel("Find race edition").fill("Synthetic Browser");
  await page.getByLabel("Race, date and distance").selectOption({ label: "Synthetic Browser Race · 2026-10-01 · 10K" });
  await page.getByLabel("Timing/results provider").fill("Synthetic Timing");
  await page.getByLabel("Official results URL").fill("https://example.test/browser-results");
  await page.getByLabel("Provider’s race ID").fill("synthetic-browser");
  await page.getByLabel("Expected entries").fill("2");
  await page.getByLabel("Authority to retain").fill("Synthetic file authority for disposable tests only.");
  await page.getByRole("button", { name: "Continue to preview" }).click();
  await page.getByText("Checked 2 rows.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  // Exercise the real browser-file handler before the existing API/database flow.
  await page.getByLabel("Results CSV, TSV or browser capture").setInputFiles({
    name: "synthetic.athrecs.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      format: "athrecs-browser-results-v1", scope: "loaded-page-only",
      capturedAt: "2026-10-14T12:00:00.000Z",
      page: { url: "https://example.test/browser-results", title: "Synthetic Browser Race" },
      table: {
        label: "Synthetic results", headers: ["Bib", "Name", "Chip Time", "Gun Time"],
        rows: [["1", "Morgan Browser Synthetic", "00:35:00.25", "00:35:02.25"],
          ["2", "Casey Browser Synthetic", "00:36:00.15", "00:36:02.15"]],
        rowLinks: [[], []],
      }, warnings: [],
    })),
  });
  await page.getByText("Loaded 2 captured rows", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Continue to race" }).click();
  assert.equal(await page.getByLabel("Race, date and distance").inputValue(), "0", "Replacing a file needs a new edition confirmation");
  await page.getByLabel("Race, date and distance").selectOption({ label: "Synthetic Browser Race · 2026-10-01 · 10K" });
  assert.equal(await page.getByLabel("Expected entries").inputValue(), "");
  assert.equal(await page.getByLabel("Official results URL").inputValue(), "https://example.test/browser-results");
  assert.equal((await sql`select count(*)::int n from result_archive_entries`)[0].n, 0);
  await page.getByLabel("Timing/results provider").fill("Synthetic Timing");
  await page.getByLabel("Provider’s race ID").fill("synthetic-browser");
  await page.getByRole("button", { name: "Continue to preview" }).click();
  await page.getByText("Checked 2 rows.", { exact: false }).waitFor();
  assert(await page.getByRole("button", { name: "Save results for athlete matching" }).isDisabled());
  await page.getByLabel("I checked the race").check();
  await page.screenshot({ path: resolve(root, "guided-preview.png"), fullPage: true });
  await page.getByRole("button", { name: "Save results for athlete matching" }).click();
  await page.getByText("Synthetic lost response", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Resume remaining batches" }).click();
  await page.getByText("Saved: 2 new source rows", { exact: false }).waitFor();
  assert.equal((await sql`select count(*)::int n from result_archive_entries`)[0].n, 2);
  assert.equal((await sql`select count(*)::int n from result_archive_batches`)[0].n, 1);
  await page.getByRole("heading", { name: "Saved — ready for athlete matching" }).waitFor();
  await page.getByRole("button", { name: "Review athlete matches" }).click();
  await page.getByRole("cell", { name: /Morgan Browser Synthetic/ }).waitFor();
  // Actual cross-origin bookmark handoff, durable pending capture, wizard and repeat import.
  // Every HTTPS request is intercepted and served locally; no external site is contacted.
  const handoff = await browser.newContext();
  await handoff.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "https://example.test") return route.fulfill({ contentType: "text/html", body: '<title>Synthetic Browser Race</title><table><tr><th>Bib</th><th>Name</th><th>Chip Time</th><th>Gun Time</th></tr><tr><td>1</td><td>Morgan Browser Synthetic</td><td>00:35:00.25</td><td>00:35:02.25</td></tr><tr><td>2</td><td>Casey Browser Synthetic</td><td>00:36:00.15</td><td>00:36:02.15</td></tr></table>' });
    if (url.origin !== "https://update.athrecs.com") return route.abort();
    if (["/tools/import-results.html", "/tools/import-results.js"].includes(url.pathname)) return route.fulfill({ contentType: url.pathname.endsWith(".js") ? "text/javascript" : "text/html", body: readFileSync(`public${url.pathname}`) });
    const response = await route.fetch({ url: `http://127.0.0.1:8139${url.pathname}${url.search}` });
    return route.fulfill({ response });
  });
  const sourcePage = await handoff.newPage();
  await sourcePage.goto("https://example.test/browser-results");
  await sourcePage.evaluate(decodeURIComponent(browserResultsBookmark().slice("javascript:".length)));
  const popupPromise = sourcePage.waitForEvent("popup");
  await sourcePage.getByRole("button", { name: "Send to AthRecs", exact: true }).click();
  const receiver = await popupPromise;
  receiver.on("pageerror", (e) => errors.push(e.message));
  await receiver.getByRole("link", { name: "Continue to import" }).waitFor();
  await sourcePage.getByText("Rows received.", { exact: false }).waitFor();
  assert.equal((await sql`select count(*)::int n from result_archive_batches`)[0].n, 1, "Handoff has not written the database");
  await receiver.getByRole("link", { name: "Continue to import" }).click();
  await receiver.getByText("Loaded 2 captured rows", { exact: false }).waitFor();
  // A reload (including a sign-in round trip) must not lose the pending page.
  await receiver.reload();
  await receiver.getByText("Loaded 2 captured rows", { exact: false }).waitFor();
  // A finder deep link must win over an unrelated pending browser import.
  // Use the real persisted capture and reload the real archive component so its
  // asynchronous IndexedDB hydration runs after the requested entry is selected.
  const pendingImportUrl = receiver.url();
  const [requestedEntry] = await sql`select id::int from result_archive_entries where payload->>'name'='Morgan Browser Synthetic' order by id limit 1`;
  await receiver.goto(`${pendingImportUrl.split("#")[0]}#entry=${requestedEntry.id}`);
  await receiver.reload();
  await receiver.getByRole("button", { name: "Review 2 received rows", exact: true }).waitFor();
  await receiver.getByRole("heading", { name: `Review entry #${requestedEntry.id}`, exact: true }).waitFor();
  await receiver.getByText("Inspect Synthetic Timing source", { exact: true }).waitFor();
  assert.equal(await receiver.getByRole("button", { name: "Source results", exact: true }).getAttribute("aria-pressed"), "true", "A pending browser capture cannot replace the requested archive-entry tab");
  assert.equal(await receiver.getByRole("button", { name: "Import a race", exact: true }).getAttribute("aria-pressed"), "false");
  assert.equal(await receiver.getByText("Loaded 2 captured rows", { exact: false }).count(), 0, "Pending capture stays available without opening the import wizard");
  assert.equal((await sql`select count(*)::int n from result_archive_batches`)[0].n, 1, "Opening a stored entry does not save the pending capture");
  await receiver.goto(pendingImportUrl);
  await receiver.reload();
  await receiver.getByText("Loaded 2 captured rows", { exact: false }).waitFor();
  await receiver.getByRole("button", { name: "Continue to race" }).click();
  const [savedDataset] = await sql`select id from result_archive_datasets limit 1`;
  await receiver.getByLabel("Add to a saved race").selectOption(savedDataset.id);
  assert.equal(await receiver.getByLabel("Provider’s race ID").inputValue(), "synthetic-browser");
  assert.equal(await receiver.getByLabel("Timing/results provider").inputValue(), "Synthetic Timing");
  assert.equal(await receiver.getByLabel("Expected entries").inputValue(), "");
  await receiver.getByRole("button", { name: "Continue to preview" }).click();
  await receiver.getByLabel("I checked the race").check();
  await receiver.getByRole("button", { name: "Save results for athlete matching" }).click();
  await receiver.getByText("Saved: 0 new source rows, 0 changed, 2 unchanged.", { exact: false }).waitFor();
  assert.equal((await sql`select count(*)::int n from result_archive_entries`)[0].n, 2);
  assert.equal((await sql`select count(*)::int n from results`)[0].n, 0);
  await receiver.reload();
  assert.equal(await receiver.getByRole("button", { name: "Review 2 received rows" }).count(), 0, "Saved pending capture was removed");
  await handoff.close();
  const memberPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await memberPage.goto("http://127.0.0.1:8139?member");
  await memberPage.getByRole("checkbox", { name: /Select saved result/ }).check();
  await memberPage
    .getByLabel("What helps us confirm")
    .fill("My synthetic bib is 1; this is my synthetic race.");
  await memberPage.getByRole("button", { name: "Request review of 1 selected result" }).click();
  await memberPage.getByText("Requested — awaiting staff review.").waitFor();
  await page.getByRole("button", { name: "Athlete requests", exact: true }).click();
  await page.getByRole("button", { name: /Review entry/ }).click();
  await page.getByText("Inspect Synthetic Timing source").waitFor();
  assert(await page.getByRole("button", { name: "Link reviewed result" }).isDisabled());
  await page
    .getByLabel("Identity and source evidence checked")
    .fill("Synthetic source row and athlete identity were independently checked.");
  await page.getByLabel("I inspected the source row").check();
  await page.getByRole("button", { name: "Link reviewed result" }).click();
  await page.getByText("Decision saved.", { exact: false }).waitFor();
  assert.equal((await sql`select count(*)::int n from results`)[0].n, 1);
  assert.equal((await sql`select result_visibility from results`)[0].result_visibility, "private");
  assert.equal((await sql`select count(*)::int n from athlete_account_links`)[0].n, 0);
  await page.getByRole("button", { name: "Profile results", exact: true }).click();
  await page.getByRole("cell", { name: /Morgan Browser Synthetic/ }).waitFor();
  await page.getByRole("button", { name: "Source results", exact: true }).click();
  await page.getByRole("cell", { name: /Morgan Browser Synthetic/ }).waitFor();
  await page.screenshot({ path: resolve(root, "desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(root, "mobile.png"), fullPage: true });
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    "No mobile page overflow",
  );
  const [dataset] = await sql`select id from result_archive_datasets limit 1`;
  await service.ingestArchiveBatch(
    sql,
    {
      requestId: crypto.randomUUID(),
      datasetId: dataset.id,
      rows: [3, 4].map((bib) =>
        core.archiveRowSchema.parse({
          sourceKey: `bulk-${bib}`,
          name: "Morgan Browser Synthetic",
          bib: String(bib),
          status: "finished",
          finishSeconds: 2200 + bib,
          club: "Synthetic AC",
          original: {},
        }),
      ),
    },
    actor,
  );
  await memberPage.reload();
  await memberPage.getByRole("button", { name: "Select all 2 results", exact: true }).click();
  const selectedBoxes = memberPage.getByRole("checkbox", { name: /Select saved result/ });
  assert.equal(await selectedBoxes.count(), 2);
  await selectedBoxes.first().uncheck();
  await memberPage.getByText("1 selected", { exact: true }).waitFor();
  await selectedBoxes.first().check();
  await memberPage
    .getByLabel("What helps us confirm")
    .fill("Both synthetic bibs 3 and 4 belong to my synthetic test results.");
  await memberPage.getByRole("button", { name: "Request review of 2 selected results" }).click();
  await memberPage.getByText(/2 selected results have been submitted together/).waitFor();
  assert.equal(
    (
      await sql`select count(*)::int n from result_archive_match_requests where user_id='archive-browser-member'`
    )[0].n,
    3,
  );
  assert.equal((await sql`select count(*)::int n from athlete_account_links`)[0].n, 0);
  await memberPage.screenshot({ path: resolve(root, "bulk-results-mobile.png"), fullPage: true });
  assert(
    await memberPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
  );
  // London all-pages collection: confirm once, stream pages into the actual archive,
  // lose an API receipt and receive an HTTP 429, then resume without duplicates.
  const collectionContext = await browser.newContext();
  let blockThirdPage = true;
  const sourceRequests = [];
  await collectionContext.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin === "https://results.tcslondonmarathon.com") {
      const n = Number(url.searchParams.get("page") || 1); sourceRequests.push(n);
      if (n === 3 && blockThirdPage) { blockThirdPage = false; return route.fulfill({ status: 429, contentType: "text/html", body: "Synthetic rate limit" }); }
      return route.fulfill({ contentType: "text/html", body: londonPaginationFixture(n) });
    }
    if (url.origin !== "https://update.athrecs.com") return route.abort();
    if (["/tools/import-results.html", "/tools/import-results.js"].includes(url.pathname)) return route.fulfill({ contentType: url.pathname.endsWith(".js") ? "text/javascript" : "text/html", body: readFileSync(`public${url.pathname}`) });
    const response = await route.fetch({ url: `http://127.0.0.1:8139${url.pathname}${url.search}` });
    return route.fulfill({ response });
  });
  const collectionSource = await collectionContext.newPage();
  await collectionSource.goto(londonFixtureUrl);
  await collectionSource.evaluate(decodeURIComponent(browserResultsBookmark().slice("javascript:".length)));
  const collectionPopup = collectionSource.waitForEvent("popup");
  await collectionSource.getByRole("button", { name: "Collect all pages", exact: true }).click();
  const collectionStaff = await collectionPopup;
  collectionStaff.on("pageerror", e => errors.push(e.message));
  await collectionStaff.getByRole("link", { name: "Continue to import" }).click();
  await collectionStaff.getByText("Automatic collection:", { exact: false }).waitFor();
  assert.deepEqual(sourceRequests, [1], "No other pages requested before staff confirmation");
  await collectionStaff.getByRole("button", { name: "Continue to race" }).click();
  await collectionStaff.getByLabel("Find race edition").fill("Synthetic Browser");
  await collectionStaff.getByLabel("Race, date and distance").selectOption({ label: "Synthetic Browser Race · 2026-10-01 · 10K" });
  await collectionStaff.getByLabel("Timing/results provider").fill("Synthetic Collection Timing");
  await collectionStaff.getByLabel("Authority to retain").fill("Synthetic collection authority; disposable test only.");
  assert.equal(await collectionStaff.getByLabel("Expected entries").inputValue(), "", "Filtered total is not the whole race total");
  await collectionStaff.getByRole("button", { name: "Continue to preview" }).click();
  await collectionStaff.getByLabel("I checked the race").check();
  await collectionStaff.getByRole("button", { name: "Save and collect all pages", exact: true }).click();
  await collectionSource.getByText("Synthetic collection receipt lost", { exact: false }).waitFor();
  assert.deepEqual(sourceRequests, [1, 2], "No subsequent page while a save is unconfirmed");
  assert.equal((await sql`select count(*)::int n from result_archive_entries where payload->>'bib' like '900%'`)[0].n, 4);
  await collectionSource.getByRole("button", { name: "Resume collection", exact: true }).click();
  await collectionSource.getByText("HTTP 429", { exact: false }).waitFor();
  assert.deepEqual(sourceRequests, [1, 2, 3], "HTTP 429 stops without automatic retry");
  await collectionSource.getByRole("button", { name: "Resume collection", exact: true }).click();
  await collectionStaff.getByRole("heading", { name: "All selected pages saved", exact: true }).waitFor();
  await collectionStaff.getByText("5 new · 0 changed · 0 unchanged.", { exact: true }).waitFor();
  assert.deepEqual(sourceRequests, [1, 2, 3, 3]);
  assert.equal((await sql`select count(*)::int n from result_archive_entries where payload->>'bib' like '900%'`)[0].n, 5);
  assert.equal((await sql`select count(*)::int n from results`)[0].n, 1, "Collection adds no automatic profile results");
  const collectionMatches = await member.memberArchiveMatches(sql, "archive-browser-member");
  assert(collectionMatches.some(r => r.bib === "9001"), "Collected rows are available for member claim suggestions");
  assert.equal((await sql`select count(*)::int n from athlete_account_links`)[0].n, 0);
  const [qualifier] = await sql`select payload->'original'->>'_capture_notes' as note from result_archive_entries where payload->>'bib'='9001'`;
  assert.equal(qualifier.note, "unofficial results", "Source qualifications remain in stored evidence");
  await collectionStaff.screenshot({ path: resolve(root, "all-pages-complete.png"), fullPage: true });
  await collectionStaff.setViewportSize({ width: 390, height: 844 });
  assert(await collectionStaff.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Collection has no mobile page overflow");
  await collectionContext.close();
  assert.deepEqual(errors, []);
  console.log(
    "Archive browser -> validated API -> disposable database -> UI passed: upload, lost-response resume, stored-entry deep link with a pending import, private matching request, staff link, canonical view and mobile layout.",
  );
} finally {
  await browser.close();
  await server.close();
  await db.close();
}
