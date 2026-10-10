// Actual React -> loopback HTTP -> actual validated server functions -> disposable SQL.
// Only the session/middleware host is synthetic. No production connection or external requests.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";
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
const member = load("src/lib/results-archive/member.server.ts");
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
  requestMyArchiveMatch: (input) =>
    member.requestArchiveMatch(sql, "archive-browser-member", input),
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
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
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
  await page.getByLabel("Find race edition").fill("Synthetic Browser");
  await page
    .getByLabel("Race, date and distance")
    .selectOption({ label: "Synthetic Browser Race · 2026-10-01 · 10K" });
  await page.getByLabel("Timing/results provider").fill("Synthetic Timing");
  await page.getByLabel("Official results URL").fill("https://example.test/browser-results");
  await page.getByLabel("Provider’s race ID").fill("synthetic-browser");
  await page.getByLabel("Expected entries").fill("2");
  await page
    .getByLabel("Authority to retain")
    .fill("Synthetic file authority for disposable tests only.");
  await page.getByLabel("Results CSV or TSV").setInputFiles({
    name: "synthetic.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "Bib,Name,Chip Time,Gun Time\n1,Morgan Browser Synthetic,00:35:00.25,00:35:02.25\n2,Casey Browser Synthetic,00:36:00.15,00:36:02.15",
    ),
  });
  await page.getByRole("button", { name: "Check all rows" }).click();
  await page.getByText("Checked 2 rows.", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Save private race field" }).click();
  await page.getByText("Synthetic lost response", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Resume remaining batches" }).click();
  await page.getByText("Saved: 2 new source rows", { exact: false }).waitFor();
  assert.equal((await sql`select count(*)::int n from result_archive_entries`)[0].n, 2);
  assert.equal((await sql`select count(*)::int n from result_archive_batches`)[0].n, 1);
  const memberPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await memberPage.goto("http://127.0.0.1:8139?member");
  await memberPage.getByRole("button", { name: "This could be mine" }).click();
  await memberPage
    .getByLabel("What helps us confirm")
    .fill("My synthetic bib is 1; this is my synthetic race.");
  await memberPage.getByRole("button", { name: "Request a match review" }).click();
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
  assert.deepEqual(errors, []);
  console.log(
    "Archive browser -> validated API -> disposable database -> UI passed: upload, lost-response resume, private matching request, staff link, canonical view and mobile layout.",
  );
} finally {
  await browser.close();
  await server.close();
  await db.close();
}
