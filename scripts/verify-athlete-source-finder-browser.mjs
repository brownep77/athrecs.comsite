// Actual React -> loopback HTTP -> validated API + staff middleware -> PGlite.
// Sessions and provider responses are synthetic; production storage is never opened.
import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { fromJSON, toJSONAsync } from "seroval";
import { encode } from "@tanstack/router-core";
import * as cheerio from "cheerio";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { createFinderSyntheticFixture } from "./verify-athlete-source-finder.mjs";
import { auditResults } from "./lib/result-evidence-audit.mjs";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(path, deps = {}) {
  const module = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (name) => {
      if (!(name in deps)) throw new Error(`Unexpected test dependency ${name} in ${path}`);
      return deps[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}

const fixture = await createFinderSyntheticFixture();
const { db, sql, core, service } = fixture;
const name = "Browser Finder Synthetic";
const club = "Synthetic browser club";
const origin = "http://127.0.0.1:8147";
const rpcDirectory = dirname(
  fileURLToPath(import.meta.resolve("@tanstack/start-client-core/client-rpc")),
);
const root = resolve("artifacts/athlete-source-finder-browser");
mkdirSync(root, { recursive: true });
const staff = { id: "finder-browser-staff", email: "finder-browser-staff@example.test" };
const member = { id: "finder-browser-member", email: "finder-browser-member@example.test" };
const beforeAllowlist = process.env.ATHRECS_STAFF_EMAILS;
process.env.ATHRECS_STAFF_EMAILS = staff.email;

let browser;
let server;
const requests = [];
const providerRequests = [];
const externalBrowserRequests = [];
const errors = [];
const responseGates = new Map();

function holdSearchResponse(query) {
  const entered = Promise.withResolvers();
  const released = Promise.withResolvers();
  const gate = { entered, released };
  assert.equal(responseGates.has(query), false);
  responseGates.set(query, gate);
  return {
    async waitUntilEntered() {
      let timeout;
      try {
        await Promise.race([
          entered.promise,
          new Promise((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error("Synthetic search did not reach its response gate")),
              20_000,
            );
          }),
        ]);
      } finally {
        clearTimeout(timeout);
      }
    },
    release: () => {
      responseGates.delete(query);
      released.resolve();
    },
  };
}

try {
  await sql`insert into "user"(id,name,email,"emailVerified") values
    (${staff.id},'Synthetic finder staff',${staff.email},true),
    (${member.id},'Synthetic finder member',${member.email},true)`;
  await sql`insert into account(id,"accountId","providerId","userId","updatedAt") values
    ('finder-browser-staff-google','finder-browser-staff-google','google',${staff.id},now()),
    ('finder-browser-member-google','finder-browser-member-google','google',${member.id},now())`;
  const [event] = await sql`insert into events(slug,name,sport,country,county,city,surface,summary)
    values('finder-browser-event','Synthetic browser race','Running','GB','','','Road','Synthetic only') returning id`;
  const [edition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status)
    values(${event.id},'2026-10-01','10K',10,'Finished') returning id`;
  const [athlete] = await sql`insert into athletes(slug,display_name,source_club_name)
    values('finder-browser-athlete',${name},${club}) returning id`;
  const [result] =
    await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,source_url,result_source,result_details)
    values(${edition.id},${athlete.id},'finished',2400,'https://finder-browser.test/result/1','Synthetic browser timer',
      '{"timing":{"finishText":"00:40:00.12"},"verificationStatus":"unverified"}') returning id`;
  const dataset = "00000000-0000-4000-8000-000000000777";
  await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note)
    values(${dataset}::uuid,${edition.id},'Synthetic browser timer','finder-browser-race',
      'https://finder-browser.test/result/1','Disposable synthetic fixture; no real athlete data.')`;
  await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash)
    select ${dataset}::uuid,'browser-row-'||n,
      jsonb_build_object('name',${name}::text,'club',${club}::text,'bib',n::text,'finishText','00:40:00.12','finishSeconds',2400.12),
      repeat('a',64) from generate_series(1,26) n`;
  await sql`insert into result_archive_capture_approvals(id,provider,approved_by,approval_basis,evidence)
    values('finder-browser-capture','Synthetic browser timer','Synthetic test','owner_private_import','{}')`;
  await sql`insert into result_archive_capture_runs(id,approval_id,provider,inventory)
    values('00000000-0000-4000-8000-000000000778','finder-browser-capture','Synthetic browser timer','[]')`;
  const capturePayload = {
    publication: "staff_only",
    index: { name: "Synthetic browser captured race", date: "2026-10-01", location: "Synthetic" },
    rows: [
      {
        name,
        club,
        bib: "77",
        distanceLabel: "10K",
        tableKey: "10K",
        sourceRow: "7",
        original: { "Chip Time": "00:40:00.12", "Gun Time": "00:40:02.34" },
      },
    ],
  };
  const [capture] = await sql`insert into result_archive_source_captures(
    run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
    values('00000000-0000-4000-8000-000000000778','finder-browser-capture','Synthetic browser timer','finder-browser-race',
      'https://finder-browser.test/captured/1',repeat('b',64),repeat('c',64),'',${JSON.stringify(capturePayload)}::jsonb,1,'compared','{}',now()) returning id::text`;
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
    values(${athlete.id},'Synthetic browser timer','finder-browser-history','https://finder-browser.test/athlete/1',now(),true,
      array[2026],array[2026],${JSON.stringify([{ meeting: "Synthetic browser history race", date: "2026-10-01", discipline: "10K", club, performance: "40:00.12", sourceUrls: ["https://finder-browser.test/history/1"] }])}::jsonb)`;
  await sql`insert into event_register_sources(source_key,name,url,host,cursors) values
    ('finder-browser','Browser finder source','https://finder-browser.test/','finder-browser.test','[]'),
    ('finder-browser-document','Browser document source','https://finder-document.test/','finder-document.test','[]'),
    ('finder-browser-link','Browser link source','https://finder-link.test/','finder-link.test','[{"url":"https://finder-link.test/results"}]')`;
  await sql`insert into event_register_extraction_items(source_host,item_key,source_url,kind,state) values
    ('finder-document.test','saved-document','https://finder-document.test/results.pdf','results','pending')`;

  const registry = [
    ...fixture.registry,
    {
      source_id: "finder_browser_test",
      source_name: "Browser finder source",
      start_url: "https://finder-browser.test/",
      allowed_domains: "finder-browser.test",
    },
    {
      source_id: "finder_browser_document",
      source_name: "Browser document source",
      start_url: "https://finder-document.test/",
      allowed_domains: "finder-document.test",
    },
    {
      source_id: "finder_browser_link",
      source_name: "Browser link source",
      start_url: "https://finder-link.test/",
      allowed_domains: "finder-link.test",
    },
  ].map((source) => ({
    source_name: source.source_id,
    source_type: "results",
    country_focus: "Synthetic",
    enabled: false,
    rights_status: "Not assessed",
    ...source,
  }));

  const requestState = new AsyncLocalStorage();
  const responseServer = {
    getRequest: () => requestState.getStore().request,
    setResponseHeader: (header, value) => requestState.getStore().response.setHeader(header, value),
  };
  class UnauthorizedError extends Error {
    status = 401;
    constructor() {
      super("Unauthorized");
    }
  }
  const staffConfig = load("src/lib/auth/staff-config.ts");
  const isolation = load("src/lib/auth/isolation.server.ts", {
    "@tanstack/react-start/server": responseServer,
  });
  const staffServer = load("src/lib/auth/staff.server.ts", {
    "@tanstack/react-start/server": responseServer,
    "@/lib/db": { getSql: async () => sql },
    "./verify.server": {
      UnauthorizedError,
      getSessionUser: async () => requestState.getStore().user,
    },
    "./staff-config": staffConfig,
  });
  const start = {
    createMiddleware: () => {
      const chain = { client: () => chain, server: (fn) => fn };
      return chain;
    },
    createServerFn: (options = {}) => {
      let middleware = [],
        validate = (input) => input;
      const chain = {
        middleware(value) {
          middleware = value;
          return chain;
        },
        validator(value) {
          validate = value;
          return chain;
        },
        handler(handler) {
          const execute = async (raw) => {
            assert.deepEqual(
              middleware,
              [auth.staffMiddleware],
              "All finder APIs must retain the actual staff middleware",
            );
            const run = (index, context) =>
              index === middleware.length
                ? handler({ data: validate(raw), context })
                : middleware[index]({
                    context,
                    next: (options = {}) => run(index + 1, { ...context, ...options.context }),
                  });
            return run(0, {});
          };
          return Object.assign(execute, { httpMethod: options.method ?? "GET" });
        },
      };
      return chain;
    },
  };
  const auth = load("src/lib/auth/staff-middleware.ts", {
    "@tanstack/react-start": start,
    "@tanstack/react-start/server": responseServer,
    "./isolation.server": isolation,
    "./staff.server": staffServer,
  });
  const common = {
    "@tanstack/react-start": start,
    "@tanstack/react-start/server": responseServer,
    "../auth/staff-middleware": auth,
    "../db": { getSql: async () => sql },
    "../athrecs/source-registry.server": { getFixtureSourceRegistry: () => registry },
  };
  const searchApi = load("src/lib/athlete-finder/api.ts", {
    ...common,
    "./core": core,
    "./search.server": service,
  });
  const registryCore = load("src/lib/athrecs/source-registry.ts");
  const coverage = load("src/lib/athlete-finder/coverage.ts", { zod: { z } });
  const coverageService = load("src/lib/athlete-finder/coverage.server.ts", {
    "../athrecs/source-registry": registryCore,
    "./core": core,
  });
  const coverageApi = load("src/lib/athlete-finder/coverage-api.ts", {
    ...common,
    "./coverage": coverage,
    "./coverage.server": coverageService,
  });
  const checkCore = load("src/lib/athlete-finder/source-check.ts", { zod: { z } });
  const archiveCore = load("src/lib/results-archive/core.ts", { zod: { z } });
  const browserCapture = load("src/lib/results-archive/browser-capture.ts", {
    zod: { z },
    "./core": archiveCore,
  });
  const checkService = load("src/lib/athlete-finder/source-check.server.ts", {
    "node:crypto": crypto,
    cheerio,
    "./source-check.ts": checkCore,
    "../results-archive/browser-capture.ts": browserCapture,
    "../results-archive/core.ts": archiveCore,
    "../../../scripts/lib/result-evidence-audit.mjs": { auditResults },
  });
  const sourceUrl = "https://totalracetiming.co.uk/raceresults/123";
  const sourceHtml = `<h2>Synthetic browser live race</h2><h3 id="sr1">10K</h3><p>Start: 01/10/2026</p><table><thead><tr><th>Position</th><th>Tag</th><th>Forename</th><th>Surname</th><th>Club</th><th>Chip Time</th><th>Gun Time</th></tr></thead><tbody><tr><td>1</td><td>17</td><td>Browser Finder</td><td>Synthetic</td><td>${club}</td><td>00:40:12.34</td><td>00:40:14.56</td></tr><tr><td>2</td><td>18</td><td>Different</td><td>Participant</td><td></td><td>00:41:00.00</td><td>00:41:02.00</td></tr></tbody></table>`;
  const checkApi = load("src/lib/athlete-finder/source-check-api.ts", {
    ...common,
    "./source-check": checkCore,
    "./source-check.server": {
      checkSourcePage: (input, actor) =>
        checkService.checkSourcePage(input, actor, {
          sql,
          wait: async () => {},
          fetcher: async (url) => {
            providerRequests.push(String(url));
            if (String(url) === "https://totalracetiming.co.uk/robots.txt")
              return new Response("User-agent: *\nAllow: /", {
                headers: { "Content-Type": "text/plain" },
              });
            assert.equal(
              String(url),
              sourceUrl,
              "The synthetic transport forbids all other provider/network requests",
            );
            return new Response(sourceHtml, { headers: { "Content-Type": "text/html" } });
          },
        }),
    },
  });
  const methods = {
    ...searchApi,
    ...coverageApi,
    ...checkApi,
    listFixtureSources: start
      .createServerFn({ method: "GET" })
      .middleware([auth.staffMiddleware])
      .handler(async () => ({ sources: registry })),
  };
  function file(filename, contents) {
    const path = resolve(root, filename);
    writeFileSync(path, contents);
    return path;
  }
  const bridge = file(
    "bridge.js",
    // Use the installed RPC fetcher, including its GET query serializer and
    // AbortSignal forwarding. Only app-specific Start options are absent from
    // this isolated component fixture; the transport is not a POST-only mock.
    `import{serverFnFetcher}from'/@fs/${resolve(rpcDirectory, "serverFnFetcher.js")}';\n` +
      Object.entries(methods)
        .map(
          ([method, fn]) =>
            `export async function ${method}(arg={}){const value=await serverFnFetcher('/finder-test-api/${method}',[{...arg,method:${JSON.stringify(fn.httpMethod)}}],fetch);if(value?.error)throw Error(value.error);return value;}`,
        )
        .join("\n"),
  );
  const startOptions = file(
    "start-options.js",
    "export function getStartOptions(){return undefined}",
  );

  async function apiRequest(method, input, headers = {}) {
    const httpMethod = methods[method].httpMethod;
    const payload = JSON.stringify(await toJSONAsync({ data: input }));
    return fetch(
      `${origin}/finder-test-api/${method}${httpMethod === "GET" ? `?${encode({ payload })}` : ""}`,
      {
        method: httpMethod,
        headers: { "Content-Type": "application/json", ...headers },
        ...(httpMethod === "POST" ? { body: payload } : {}),
      },
    );
  }
  file(
    "index.html",
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>',
  );
  file(
    "main.tsx",
    `import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';import{AthleteResultFinder}from'/@fs/${resolve("src/components/staff/AthleteResultFinder.tsx")}';import{pendingBrowserCaptures}from'/@fs/${resolve("src/lib/results-archive/browser-handoff.ts")}';import'./style.css';function Receiver(){const[rows,setRows]=useState([]);useEffect(()=>{pendingBrowserCaptures().then(setRows)},[]);return <section><h1>Synthetic import receiver</h1><pre data-testid="pending-captures">{JSON.stringify(rows)}</pre></section>}const client=new QueryClient({defaultOptions:{queries:{retry:false}}});createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><main style={{maxWidth:1280,margin:'auto',padding:16,minWidth:0}}>{location.pathname==='/admin/result-archive'?<Receiver/>:<AthleteResultFinder/>}</main></QueryClientProvider>);`,
  );
  file("style.css", `@import "${resolve("src/styles.css")}";\n@source "${resolve("src")}";`);

  server = await createServer({
    configFile: false,
    root,
    cacheDir: resolve("node_modules/.cache/athlete-finder-browser-vite"),
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "finder-test-api",
        configureServer(vite) {
          vite.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith("/finder-test-api/")) return next();
            const requestUrl = new URL(req.url, origin);
            const method = requestUrl.pathname.split("/").at(-1);
            const role = req.headers.cookie?.match(
              /(?:^|;\s*)finder-test-role=(staff|member)(?:;|$)/,
            )?.[1];
            const context = {
              request: new Request(`${origin}${req.url}`, {
                method: req.method,
                headers: req.headers,
              }),
              response: res,
              user: role === "staff" ? staff : role === "member" ? member : null,
            };
            await requestState.run(context, async () => {
              try {
                assert.ok(Object.hasOwn(methods, method), "Unknown test API");
                assert.equal(
                  req.method,
                  methods[method].httpMethod,
                  "Use the API's declared HTTP method",
                );
                let body = "";
                for await (const chunk of req) {
                  body += chunk;
                  if (body.length > 100_000) throw new Error("Synthetic request too large");
                }
                const serialized =
                  req.method === "GET" ? requestUrl.searchParams.get("payload") : body;
                const input = serialized ? (fromJSON(JSON.parse(serialized)).data ?? {}) : {};
                requests.push({
                  method,
                  input,
                  role,
                  httpMethod: req.method,
                  requestTarget: req.url,
                  wireLength: Buffer.byteLength(req.url),
                  bodyLength: Buffer.byteLength(body),
                  contentType: req.headers["content-type"],
                  serverFnHeader: req.headers["x-tsr-serverfn"],
                  fetchSite: req.headers["sec-fetch-site"],
                  requestOrigin: req.headers.origin,
                  equivalentGetWireLength: Buffer.byteLength(
                    `${requestUrl.pathname}?${encode({ payload: serialized })}`,
                  ),
                });
                const response = await methods[method](input);
                const gate =
                  method === "searchAthleteSourceResults" ? responseGates.get(input.q) : undefined;
                if (gate) {
                  gate.entered.resolve();
                  await gate.released.promise;
                }
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(response));
              } catch (error) {
                if (![401, 403].includes(Number(error.status)))
                  console.error(`Synthetic finder API ${method}: ${error.message}`);
                res.statusCode = Number(error.status) || 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: [
        { find: /^\.{1,2}\/getStartOptions\.js$/, replacement: startOptions },
        { find: "@/lib/athlete-finder/api", replacement: bridge },
        { find: "@/lib/athlete-finder/coverage-api", replacement: bridge },
        { find: "@/lib/athlete-finder/source-check-api", replacement: bridge },
        { find: "@/lib/athrecs/api", replacement: bridge },
        { find: "@", replacement: resolve("src") },
      ],
    },
    server: {
      host: "127.0.0.1",
      port: 8147,
      strictPort: true,
      fs: { allow: [process.cwd(), resolve(rpcDirectory, "..")] },
    },
  });
  await server.listen();

  // Exercise the real staff middleware and allowlist with synthetic sessions.
  const protectedMethods = {
    searchAthleteSourceResults: { q: name },
    getAthleteFinderSourceCoverage: {},
    checkAthleteSource: { name, url: sourceUrl },
  };
  for (const [method, input] of Object.entries(protectedMethods)) {
    for (const [role, expected] of [
      ["anonymous", 401],
      ["member", 403],
    ]) {
      const denied = await apiRequest(method, input, { Cookie: `finder-test-role=${role}` });
      assert.equal(
        denied.status,
        expected,
        `${method} must refuse ${role} access before reading private results`,
      );
      assert.equal(denied.headers.get("cache-control"), "private, no-store");
      assert.equal(denied.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
      assert.ok(!(await denied.text()).includes(name));
    }
  }
  for (const [site, mode] of [
    ["same-site", "cors"],
    ["cross-site", "cors"],
    ["same-site", "navigate"],
    ["cross-site", "navigate"],
  ]) {
    const denied = await apiRequest(
      "searchAthleteSourceResults",
      { q: name },
      {
        Cookie: "finder-test-role=staff",
        "Sec-Fetch-Site": site,
        "Sec-Fetch-Mode": mode,
        "Sec-Fetch-Dest": mode === "navigate" ? "document" : "empty",
      },
    );
    assert.equal(denied.status, 403, "POST must not inherit the top-level GET exception");
    assert.equal(denied.headers.get("cache-control"), "private, no-store");
    assert.ok(!(await denied.text()).includes(name));
  }
  assert.equal(providerRequests.length, 0);
  requests.length = 0;

  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.ATHRECS_TEST_CHROMIUM_EXECUTABLE,
  });
  const context = await browser.newContext({ viewport: { width: 1365, height: 1000 } });
  await context.addCookies([{ name: "finder-test-role", value: "staff", url: origin }]);
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    externalBrowserRequests.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") console.error(`Synthetic finder browser: ${message.text()}`);
  });
  page.setDefaultTimeout(20_000);
  const called = (method) => requests.filter((request) => request.method === method).length;
  await page.goto(origin);
  await page.getByRole("heading", { name: "Athlete result finder", exact: true }).waitFor();
  await page
    .getByLabel("Source website")
    .locator("option[value='finder_browser_test']")
    .waitFor({ state: "attached" });
  assert.equal(
    called("searchAthleteSourceResults"),
    0,
    "Opening the finder must not search automatically",
  );
  assert.equal(
    called("getAthleteFinderSourceCoverage"),
    0,
    "Coverage remains a staff-requested read",
  );
  assert.equal(called("checkAthleteSource"), 0);
  assert.equal(providerRequests.length, 0);
  await page.getByLabel("Athlete name", { exact: true }).fill(name);
  await page.getByLabel("Official results page URL").fill(sourceUrl);
  assert.equal(called("searchAthleteSourceResults"), 0, "Typing does not run a search");
  assert.equal(called("checkAthleteSource"), 0, "Typing a URL does not fetch it");

  const beforeResults =
    await sql`select (select count(*)::int from results) canonical,(select count(*)::int from result_archive_entries) archive,(select count(*)::int from result_archive_source_captures) capture`;
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  const resultTable = page.getByRole("table", {
    name: "Possible athlete matches in stored collections",
  });
  assert.equal(await resultTable.locator("tbody tr").count(), 28);
  for (const label of [
    "Profile results",
    "Central archive",
    "Saved race captures",
    "Athlete histories",
  ])
    assert.ok(
      await resultTable.getByText(label, { exact: true }).count(),
      `${label} must have a real stored result`,
    );
  assert.equal(
    await resultTable.getByRole("link", { name: "Open saved race rows" }).getAttribute("href"),
    `/admin/result-archive#capture=${capture.id}&name=${encodeURIComponent(name)}`,
  );
  const [lastEntry] =
    await sql`select id::int from result_archive_entries where dataset_id=${dataset}::uuid order by id desc limit 1`;
  assert.equal(
    await resultTable
      .getByRole("link", { name: "Review archive row" })
      .first()
      .getAttribute("href"),
    `/admin/result-archive#entry=${lastEntry.id}`,
  );
  assert.equal(
    await resultTable
      .getByRole("link", { name: "Review athlete results" })
      .first()
      .getAttribute("href"),
    `/admin/athlete-tools?section=review&athleteId=${athlete.id}`,
  );
  assert.equal(providerRequests.length, 0, "Stored search must never contact a provider");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page
    .getByRole("heading", { name: `1 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  assert.equal(await resultTable.locator("tbody tr").count(), 1);
  assert.equal(
    requests.filter((request) => request.method === "searchAthleteSourceResults").at(-1).input
      .offset,
    25,
  );
  assert.ok(await page.getByRole("button", { name: "Next page", exact: true }).isDisabled());
  await page.getByRole("button", { name: "Previous page", exact: true }).click();
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();

  // Inputs are editable while a request is pending, but the resulting rows and
  // pagination must keep the submitted query, not relabel it using later drafts.
  const heldDraftResponse = holdSearchResponse(name);
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await heldDraftResponse.waitUntilEntered();
  await page.getByLabel("Athlete name", { exact: true }).fill("Unsubmitted Synthetic Draft");
  await page.getByLabel("Other racing names").fill("Unsubmitted Synthetic Alias");
  await page.getByLabel("Club filter").fill("Unsubmitted Synthetic Club");
  assert.ok(
    await page.getByRole("button", { name: "Searching stored results…", exact: true }).isDisabled(),
  );
  assert.equal(
    await resultTable.count(),
    0,
    "A pending request must not present earlier results as current",
  );
  heldDraftResponse.release();
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Athlete name", { exact: true }).inputValue(),
    "Unsubmitted Synthetic Draft",
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page
    .getByRole("heading", { name: `1 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  const pagedDraft = requests
    .filter((request) => request.method === "searchAthleteSourceResults")
    .at(-1).input;
  assert.equal(pagedDraft.q, name);
  assert.deepEqual(pagedDraft.aliases, []);
  assert.equal(pagedDraft.club, "");
  assert.equal(pagedDraft.offset, 25);
  await page.getByLabel("Other racing names").fill("");
  await page.getByLabel("Club filter").fill("");

  // Stress an overlapping submission directly: ordinary pending UI prevents
  // this, but a late old response still must not replace the newest mutation.
  const delayedName = "Delayed Previous Synthetic Request";
  const oldResponse = holdSearchResponse(delayedName);
  await page.getByLabel("Athlete name", { exact: true }).fill(delayedName);
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await oldResponse.waitUntilEntered();
  await page.getByLabel("Athlete name", { exact: true }).fill(name);
  await page
    .locator("form")
    .first()
    .evaluate((form) => form.requestSubmit());
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  const oldDelivered = page.waitForResponse((response) => {
    const url = new URL(response.url());
    if (url.pathname !== "/finder-test-api/searchAthleteSourceResults") return false;
    const payload = response.request().postData();
    return payload && fromJSON(JSON.parse(payload)).data?.q === delayedName;
  });
  oldResponse.release();
  await (await oldDelivered).finished();
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
  );
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  assert.equal(
    await page
      .getByRole("heading", {
        name: `0 stored matches on this page for ${delayedName}`,
        exact: true,
      })
      .count(),
    0,
  );

  // Historical and partially indexed captures must remain searchable while the
  // new index rolls out. A missing/unknown/inconsistent marker selects the exact
  // legacy fallback; it must never become a successful but false empty search.
  await page.getByRole("combobox", { name: /^Collection/ }).selectOption("capture");
  for (const [label, mutation] of [
    [
      "missing marker",
      "delete from athlete_finder_capture_search_state where capture_id=$1::bigint",
    ],
    [
      "unknown index version",
      "update athlete_finder_capture_search_state set index_version=2 where capture_id=$1::bigint",
    ],
    [
      "inconsistent indexed row count",
      "update athlete_finder_capture_search_state set indexed_rows=0 where capture_id=$1::bigint",
    ],
  ]) {
    await sql.query(mutation, [capture.id]);
    try {
      const responseReady = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/finder-test-api/searchAthleteSourceResults",
      );
      await page.getByRole("button", { name: "Search stored results", exact: true }).click();
      const response = await (await responseReady).json();
      assert.equal(
        response.completeForSelectedStores,
        true,
        `${label}: exact fallback is a completed search`,
      );
      assert.deepEqual(
        response.stores.map(({ kind, status, returned }) => ({ kind, status, returned })),
        [{ kind: "capture", status: "searched", returned: 1 }],
      );
      assert.deepEqual(
        response.rows.map((row) => [row.captureId, row.captureOrdinal]),
        [[capture.id, 1]],
        `${label}: the source row must not disappear`,
      );
      await page
        .getByRole("heading", { name: `1 stored matches on this page for ${name}`, exact: true })
        .waitFor();
      assert.equal(await page.getByText("Search incomplete", { exact: true }).count(), 0);
      assert.equal(
        await resultTable.getByRole("link", { name: "Open saved race rows" }).getAttribute("href"),
        `/admin/result-archive#capture=${capture.id}&name=${encodeURIComponent(name)}`,
      );
    } finally {
      await sql`select athlete_finder_refresh_capture_search(${capture.id}::bigint)`;
    }
  }
  await page.getByRole("combobox", { name: /^Collection/ }).selectOption("all");

  // Exercise maximum accepted browser fields through the installed POST serializer.
  // The full Unicode payload must arrive in the body without lengthening the URL.
  const maximumName = "李".repeat(160);
  const maximumAliases = [..."許鍾鄧黃鄭謝何陳"].map((character) => character.repeat(160));
  const maximumClub = "俱".repeat(160);
  await page.getByLabel("Athlete name", { exact: true }).fill(maximumName);
  await page.getByLabel("Other racing names").fill(maximumAliases.join(";"));
  await page.getByLabel("Club filter").fill(maximumClub);
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await page
    .getByText("No matching rows were returned from the available stored data.", { exact: false })
    .waitFor();
  const maximumRequest = requests
    .filter((request) => request.method === "searchAthleteSourceResults")
    .at(-1);
  assert.equal(maximumRequest.httpMethod, "POST");
  assert.equal(maximumRequest.input.q, maximumName);
  assert.deepEqual(maximumRequest.input.aliases, maximumAliases);
  assert.equal(maximumRequest.input.club, maximumClub);
  assert.equal(maximumRequest.requestTarget, "/finder-test-api/searchAthleteSourceResults");
  assert.ok(maximumRequest.wireLength < 200, "Search fields must not enter the request URL");
  assert.ok(maximumRequest.bodyLength > 4_800 && maximumRequest.bodyLength < 10_000);
  assert.equal(maximumRequest.contentType, "application/json");
  assert.equal(maximumRequest.serverFnHeader, "true");
  assert.equal(maximumRequest.fetchSite, "same-origin");
  assert.equal(maximumRequest.requestOrigin, origin);
  assert.ok(
    maximumRequest.equivalentGetWireLength > 14 * 1024,
    "The equivalent GET serialization must exceed the documented 14 KB URL limit",
  );
  await page.getByLabel("Other racing names").fill("");
  await page.getByLabel("Club filter").fill("");

  await page.getByLabel("Athlete name", { exact: true }).fill("Nobody With This Synthetic Name");
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await page
    .getByText("No matching rows were returned from the available stored data.", { exact: false })
    .waitFor();
  assert.equal(
    await page.getByText("Search incomplete", { exact: true }).count(),
    0,
    "An empty result is distinct from an unavailable store",
  );
  await db.exec(
    "alter table athlete_source_histories rename to athlete_source_histories_browser_hidden",
  );
  await page.getByLabel("Athlete name", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await page
    .getByText("This result store is not available in this environment.", { exact: true })
    .waitFor();
  await page.getByText("Search incomplete", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Show source coverage", exact: true }).click();
  const coverageTable = page.getByRole("table", {
    name: "Source collection and extraction coverage",
  });
  await coverageTable.waitFor();
  const savedLinkSource = coverageTable
    .getByRole("row")
    .filter({ hasText: "Synthetic URL-only source" });
  await savedLinkSource.getByText("Coverage incomplete", { exact: true }).waitFor();
  await savedLinkSource.getByText("Saved result links: 1", { exact: true }).waitFor();
  await savedLinkSource.getByText("History performances: Unknown", { exact: true }).waitFor();
  const coverageFailure = page.getByText(
    "History performances: This collection is not available in this environment.",
    { exact: true },
  );
  await coverageFailure.waitFor();
  const failedCoverageRequests = called("getAthleteFinderSourceCoverage");
  await db.exec(
    "alter table athlete_source_histories_browser_hidden rename to athlete_source_histories",
  );
  assert.equal(called("getAthleteFinderSourceCoverage"), failedCoverageRequests);
  await page.getByRole("button", { name: "Refresh source coverage", exact: true }).click();
  await savedLinkSource.getByText("Links held; rows not collected", { exact: true }).waitFor();
  await coverageFailure.waitFor({ state: "hidden" });
  assert.equal(called("getAthleteFinderSourceCoverage"), failedCoverageRequests + 1);
  assert.equal(await page.getByLabel("Filter source coverage").inputValue(), "");
  assert.equal(
    requests.filter((request) => request.method === "getAthleteFinderSourceCoverage").at(-1).input
      .offset,
    0,
    "Refreshing a failed collection preserves the current coverage page",
  );
  await page.getByLabel("Filter source coverage").fill("Synthetic URL-only source");
  await page.getByRole("button", { name: "Filter sources", exact: true }).click();
  await page.getByText("1–1 of 1", { exact: true }).waitFor();
  await savedLinkSource.getByText("Links held; rows not collected", { exact: true }).waitFor();
  await savedLinkSource.getByText("Saved result links: 1", { exact: true }).waitFor();
  const previousCoverageRequests = called("getAthleteFinderSourceCoverage");
  await page.getByLabel("Filter source coverage").fill("Browser");
  assert.equal(
    called("getAthleteFinderSourceCoverage"),
    previousCoverageRequests,
    "Filtering source text only submits on request",
  );
  await page.getByRole("button", { name: "Filter sources", exact: true }).click();
  await page.getByText("1–3 of 3", { exact: true }).waitFor();
  await coverageTable
    .getByRole("row")
    .filter({ hasText: "Browser document source" })
    .getByText("Extraction / review needed", { exact: true })
    .waitFor();
  await coverageTable
    .getByRole("row")
    .filter({ hasText: "Browser link source" })
    .getByText("Links held; rows not collected", { exact: true })
    .waitFor();
  const storedSourceRow = coverageTable
    .getByRole("row")
    .filter({ hasText: "Browser finder source" });
  await storedSourceRow.getByText("Stored rows available", { exact: true }).waitFor();
  await storedSourceRow.getByText("Archive rows: 26", { exact: true }).waitFor();
  const beforeSelect = called("searchAthleteSourceResults");
  await storedSourceRow.getByRole("button", { name: "Use source filter", exact: true }).click();
  assert.equal(await page.getByLabel("Source website").inputValue(), "finder_browser_test");
  assert.equal(
    called("searchAthleteSourceResults"),
    beforeSelect,
    "Choosing a source does not silently search",
  );
  await page.getByRole("button", { name: "Search stored results", exact: true }).click();
  await page
    .getByRole("heading", { name: `28 stored matches on this page for ${name}`, exact: true })
    .waitFor();
  assert.equal(
    requests.filter((request) => request.method === "searchAthleteSourceResults").at(-1).input
      .sourceId,
    "finder_browser_test",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "The finder must not overflow the mobile viewport",
  );
  await page.screenshot({ path: resolve(root, "finder-mobile.png"), fullPage: true });
  await page.setViewportSize({ width: 1365, height: 1000 });
  await page.screenshot({ path: resolve(root, "finder-stored-and-coverage.png"), fullPage: true });

  await page.getByRole("button", { name: "Check result page", exact: true }).click();
  await page.getByText("1 possible matching rows on this page", { exact: true }).waitFor();
  assert.deepEqual(providerRequests, ["https://totalracetiming.co.uk/robots.txt", sourceUrl]);
  await page
    .getByText("Synthetic browser live race · 2 source rows on the page", { exact: true })
    .waitFor();
  await page.getByText("Preview only; not saved to the archive", { exact: false }).waitFor();
  await page.getByText(`${name} · ${club} · 10K · Row 1`, { exact: true }).click();
  await page.getByText("00:40:12.34", { exact: true }).waitFor();
  await page.getByText("00:40:14.56", { exact: true }).waitFor();
  const reviewButton = page.getByRole("button", {
    name: "Review 1 matching rows · 10K",
    exact: true,
  });
  const stalePreview = page.getByText(
    "The name, racing names, club clue or URL has changed. Check the page again before reviewing these rows for import.",
    { exact: true },
  );
  const checkedName = page.getByText(`Checked racing name: ${name}`, { exact: true });
  await checkedName.waitFor();
  for (const [label, changed, original] of [
    ["Athlete name", "Different Synthetic Athlete", name],
    ["Other racing names", "Different Synthetic Alias", ""],
    ["Club filter", "Different Synthetic Club", ""],
    ["Official results page URL", "https://totalracetiming.co.uk/raceresults/456", sourceUrl],
  ]) {
    const input = page.getByLabel(label, { exact: label === "Athlete name" });
    await input.fill(changed);
    await stalePreview.waitFor();
    assert.ok(
      await reviewButton.isDisabled(),
      `Changing ${label} must prevent importing an earlier preview`,
    );
    await checkedName.waitFor();
    assert.equal(providerRequests.length, 2, "Editing preview inputs must not fetch another page");
    await input.fill(original);
    await stalePreview.waitFor({ state: "hidden" });
    assert.ok(await reviewButton.isEnabled(), "Restoring the checked inputs restores its preview");
  }
  assert.deepEqual(
    await sql`select (select count(*)::int from results) canonical,(select count(*)::int from result_archive_entries) archive,(select count(*)::int from result_archive_source_captures) capture`,
    beforeResults,
    "Search and URL preview cannot import result rows",
  );
  assert.equal(
    (
      await sql`select result_details->>'verificationStatus' as status from results where id=${result.id}`
    )[0].status,
    "unverified",
  );
  await page.screenshot({ path: resolve(root, "finder-source-preview.png"), fullPage: true });
  await page.getByRole("button", { name: "Review 1 matching rows · 10K", exact: true }).click();
  await page.waitForURL(/\/admin\/result-archive#import=[a-f0-9-]{36}$/);
  await page.getByRole("heading", { name: "Synthetic import receiver", exact: true }).waitFor();
  await page.waitForFunction(
    () =>
      (document.querySelector('[data-testid="pending-captures"]')?.textContent?.length ?? 0) > 2,
  );
  const queued = JSON.parse(await page.getByTestId("pending-captures").textContent());
  assert.equal(queued.length, 1);
  assert.equal(queued[0].id, page.url().split("#import=")[1]);
  assert.equal(queued[0].rows, 1);
  assert.equal(queued[0].sourceUrl, `${sourceUrl}#sr1`);
  const retained = JSON.parse(queued[0].json);
  assert.equal(retained.table.rows.length, 1);
  assert.equal(retained.table.rows[0][retained.table.headers.indexOf("Chip Time")], "00:40:12.34");
  assert.equal(retained.table.rows[0][retained.table.headers.indexOf("Gun Time")], "00:40:14.56");
  assert.ok(retained.warnings.some((warning) => warning.includes("Selected matching rows only")));
  assert.equal(
    JSON.stringify(retained).includes("Different Participant"),
    false,
    "Only selected matching rows can enter the importer handoff",
  );
  assert.equal(
    externalBrowserRequests.length,
    0,
    "The browser must make no external requests during finder use",
  );
  assert.deepEqual(errors, []);
  console.log(
    `Maximum Unicode finder transport: ${maximumRequest.httpMethod}, request target ${maximumRequest.wireLength} bytes, body ${maximumRequest.bodyLength} bytes; equivalent encoded GET target ${maximumRequest.equivalentGetWireLength} bytes.`,
  );
  console.log(
    "Athlete finder browser verified: real GET/POST transport, maximum Unicode POST inputs, delayed and reordered responses, partial-index fallback, four stores, submit-only search, pagination, review links, unavailable-store distinction, source coverage refresh recovery, mobile layout, staff access, stale-preview protection and durable selected-row import handoff.",
  );
} finally {
  for (const gate of responseGates.values()) gate.released.resolve();
  if (beforeAllowlist === undefined) delete process.env.ATHRECS_STAFF_EMAILS;
  else process.env.ATHRECS_STAFF_EMAILS = beforeAllowlist;
  await browser?.close();
  await server?.close();
  await db.close();
}
