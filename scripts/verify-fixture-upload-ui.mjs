// Actual import/review components and services, with a disposable database and local-only API.
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, mkdir, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, relative } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
import { bulkFixture, service, actOnFindings, reviewer } from "./collector-bulk-fixture.mjs";
const { previewFixtureUpload, importFixtureUpload } =
  await import("../src/lib/race-collector/fixture-upload.server.ts");
const root = resolve("."),
  temp = await mkdtemp(join(tmpdir(), "fixture-upload-ui-"));
const f = await bulkFixture();
let server, browser;
const candidate = {
  name: "Synthetic Upload Road Race",
  country: "England",
  city: "Norwich",
  date: "2027-06-12",
  distance: "10K",
  surface: "Road",
  sourceUrl: "https://organiser.example.org/upload-race",
  sourceKind: "organiser",
  evidence:
    "Synthetic organiser programme confirms this exact date, distance and Norwich start venue.",
  checkedAt: "2026-10-10",
  startTime: "",
};
try {
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  await writeFile(
    join(temp, "fixture.css"),
    (await readFile(join(root, "src/styles.css"), "utf8")) +
      `\n@source "${relative(temp, join(root, "src"))}";\n`,
  );
  await writeFile(
    join(temp, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/entry.tsx"></script></body></html>',
  );
  const call = `const call=async (name,{data}={})=>{const r=await fetch('/fixture/'+name,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data??{})});const v=await r.json();if(!r.ok)throw Error(v.error);return v;};\n`;
  await writeFile(
    join(temp, "upload-api.ts"),
    call +
      `export const previewFixtureFile=(v)=>call('preview',v);export const saveFixtureFile=(v)=>call('save',v);`,
  );
  const apiNames = [
    ...(await readFile("src/lib/race-collector/api.ts", "utf8")).matchAll(
      /export const (\w+) = createServerFn/g,
    ),
  ].map((m) => m[1]);
  await writeFile(
    join(temp, "collector-api.ts"),
    call + apiNames.map((name) => `export const ${name}=(v)=>call('${name}',v);`).join("\n"),
  );
  await writeFile(
    join(temp, "entry.tsx"),
    `
    import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
    import {createRootRoute,createRouter,RouterProvider} from '@tanstack/react-router';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import {FixtureImportPage} from '${join(root, "src/components/admin/fixture-import.tsx")}';import './fixture.css';
    function App(){const [run,setRun]=useState();return <main className="p-4"><FixtureImportPage run={run} onRun={setRun}/></main>}
    const route=createRootRoute({component:App}),router=createRouter({routeTree:route}),client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
    createRoot(document.getElementById('root')).render(<QueryClientProvider client={client}><RouterProvider router={router}/></QueryClientProvider>);
  `,
  );
  server = await createServer({
    configFile: false,
    root: temp,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "isolated-fixture-upload-api",
        configureServer(vite) {
          vite.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith("/fixture/")) return next();
            res.setHeader("content-type", "application/json");
            try {
              let body = "";
              for await (const chunk of req) body += chunk;
              const data = JSON.parse(body || "{}");
              let result;
              switch (req.url) {
                case "/fixture/preview":
                  result = await previewFixtureUpload(data, f.sql);
                  break;
                case "/fixture/save":
                  result = await importFixtureUpload(data, reviewer, f.sql);
                  break;
                case "/fixture/getCollector":
                  result = await service.dashboard(data.id, f.sql, data.review);
                  break;
                case "/fixture/actOnCollectorFindings":
                  result = await actOnFindings(data, reviewer, f.sql);
                  break;
                case "/fixture/decideCollectorFinding":
                  result = await service.decideFinding(data, reviewer, f.sql);
                  break;
                default:
                  throw Error("Unexpected fixture action");
              }
              res.end(JSON.stringify(result));
            } catch (error) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: [
        {
          find: "@/lib/race-collector/fixture-upload-api",
          replacement: join(temp, "upload-api.ts"),
        },
        { find: "@/lib/race-collector/api", replacement: join(temp, "collector-api.ts") },
        { find: "@", replacement: join(root, "src") },
      ],
    },
    server: { host: "127.0.0.1", port: 8098, strictPort: true, fs: { allow: [root, temp] } },
  });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8098/");
  await page.getByRole("heading", { name: "Import running fixtures", exact: true }).waitFor();
  const upload = async (rows) =>
    page
      .getByLabel("Fixture file", { exact: true })
      .setInputFiles({
        name: "reviewed-fixtures.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(rows)),
      });
  await upload([{ ...candidate, sourceUrl: "https://runabc.co.uk/synthetic" }]);
  await page.getByRole("button", { name: "Preview and check duplicates", exact: true }).click();
  await page.getByText(/0 ready for review.*1 invalid/).waitFor();
  assert.equal(
    await page.getByRole("button", { name: "Save import for review", exact: true }).isEnabled(),
    false,
  );
  await upload([
    candidate,
    { ...candidate, distance: 6.2, unit: "mi" },
    { ...candidate, distance: "half marathon", startTime: "09:30" },
  ]);
  await page.getByRole("button", { name: "Preview and check duplicates", exact: true }).click();
  await page.getByText(/2 ready for review.*1 repeated in file/).waitFor();
  await page.getByRole("button", { name: "Save import for review", exact: true }).click();
  await page.getByRole("heading", { name: "Import ready for review", exact: true }).waitFor();
  assert.equal((await f.sql`select count(*)::int n from editions`)[0].n, 0);
  await page.getByRole("button", { name: "Select ready races on this page", exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: "Publish selected (2)", exact: true }).isEnabled(),
    true,
  );
  page.once("dialog", async (d) => {
    assert.match(d.message(), /live on AthRecs/);
    await d.accept();
  });
  await page.getByRole("button", { name: "Publish selected (2)", exact: true }).click();
  await page.getByText("2 candidates published to AthRecs.", { exact: true }).waitFor();
  assert.equal((await f.sql`select count(*)::int n from editions`)[0].n, 2);
  await page.getByRole("button", { name: "Save import for review", exact: true }).click();
  await page.getByText(/Opened this file’s existing review/).waitFor();
  assert.equal((await f.sql`select count(*)::int n from catalogue_revisions`)[0].n, 1);
  await mkdir("artifacts", { recursive: true });
  await page.screenshot({ path: "artifacts/fixture-import-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    "Import fits the mobile viewport",
  );
  await page.screenshot({ path: "artifacts/fixture-import-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS fixture import browser: upload, invalid primary source, duplicate preview, review, bulk selection, publication, retry and mobile layout.",
  );
} finally {
  await browser?.close();
  await server?.close();
  await f.pg.close();
  await rm(temp, { recursive: true, force: true });
}
