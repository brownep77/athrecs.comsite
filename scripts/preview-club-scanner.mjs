// Disposable local UI fixture. It uses the production review service with synthetic data.
import { mkdtemp, readFile, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join, relative } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fixture, service, scope } from "./club-scanner-fixture.mjs";
const root = resolve("."),
  temp = await mkdtemp(join(tmpdir(), "club-scanner-ui-")),
  f = await fixture();
const run = await service.createRun(scope, "staff@example.test", f.sql);
await service.runNext(run.id, f.sql, f.fetcher);
await service.runNext(run.id, f.sql, f.fetcher);
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
await writeFile(
  join(temp, "entry.tsx"),
  `import React from 'react';import {createRoot} from 'react-dom/client';import {QueryClient,QueryClientProvider} from '@tanstack/react-query';import {ClubScanner} from '${join(root, "src/components/admin/club-athlete-scanner.tsx")}';import './fixture.css';createRoot(document.getElementById('root')).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><main className="mx-auto max-w-7xl p-5"><ClubScanner/></main></QueryClientProvider>);`,
);
const names = [
  "getClubScans",
  "startClubScan",
  "stepClubScan",
  "controlClubScan",
  "reviewClubResults",
  "publishClubResults",
  "recheckClubResults",
  "findClubAthletes",
  "getClubReviewHistory",
];
await writeFile(
  join(temp, "api.ts"),
  names
    .map(
      (name) =>
        `export const ${name}=async({data})=>{const r=await fetch('/fixture/${name}',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;};`,
    )
    .join("\n"),
);
const server = await createServer({
  configFile: false,
  root: temp,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "club-scanner-disposable-api",
      configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/fixture/")) return next();
          res.setHeader("content-type", "application/json");
          try {
            let body = "";
            for await (const chunk of req) body += chunk;
            const data = JSON.parse(body || "{}"),
              name = req.url.split("/").at(-1);
            let result;
            switch (name) {
              case "getClubScans":
                result = await service.dashboard(data, f.sql);
                break;
              case "startClubScan":
                result = await service.createRun(data, "staff@example.test", f.sql);
                break;
              case "stepClubScan":
                result = await service.runNext(data.id, f.sql, f.fetcher);
                break;
              case "controlClubScan":
                result = await service.control(data.id, data.action, f.sql);
                break;
              case "reviewClubResults":
                result = await service.review(data, "staff@example.test", f.sql);
                break;
              case "publishClubResults":
                result = await service.publish(data.ids, "staff@example.test", f.sql, f.fetcher);
                break;
              case "recheckClubResults":
                result = await service.recheck(data.ids, "staff@example.test", f.sql, f.fetcher);
                break;
              case "findClubAthletes":
                result = await service.searchAthletes(data.q, f.sql);
                break;
              case "getClubReviewHistory":
                result = await service.reviewHistory(data.id, f.sql);
                break;
              default:
                throw new Error("Unknown fixture action");
            }
            res.end(JSON.stringify(result ?? {}));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: [
      { find: "@/lib/club-scanner/api", replacement: join(temp, "api.ts") },
      { find: "@", replacement: join(root, "src") },
    ],
  },
  server: { host: "0.0.0.0", port: 8097, strictPort: true, fs: { allow: [root, temp] } },
});
if (process.argv.includes("--check-render")) {
  const data = await service.dashboard({ status: "all", q: "", page: 1 }, f.sql);
  await writeFile(
    join(temp, "render-check.tsx"),
    `import React from 'react';import {renderToString} from 'react-dom/server';import {QueryClient,QueryClientProvider} from '@tanstack/react-query';import {ClubScanner} from '${join(root, "src/components/admin/club-athlete-scanner.tsx")}';export function render(data){const client=new QueryClient();client.setQueryData(['club-scans',{status:'all',q:'',page:1}],data);return renderToString(<QueryClientProvider client={client}><ClubScanner/></QueryClientProvider>);}`,
  );
  const { render } = await server.ssrLoadModule("/render-check.tsx");
  const markup = render(data);
  const { default: assert } = await import("node:assert/strict");
  for (const expected of [
    "Club athlete scanner",
    "Fresh Runner",
    "Known Runner",
    "Managed Runner",
    "Source time",
    "Select up to 10 approved",
    "Initial-only name needs identity evidence",
  ])
    assert.ok(markup.includes(expected), expected);
  assert.ok(
    !markup.includes("Confirm publication"),
    "No publication dialog before an explicit action",
  );
  console.log("Real club scanner component rendered the six-row disposable review queue.");
  await server.close();
  await f.close();
  await rm(temp, { recursive: true, force: true });
  process.exit(0);
}
await server.listen();
console.log("Club scanner fixture: http://localhost:8097");
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, async () => {
    await server.close();
    await f.close();
    await rm(temp, { recursive: true, force: true });
    process.exit(0);
  });
