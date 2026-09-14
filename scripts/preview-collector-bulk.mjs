// Local-only browser fixture: real UI, collector service and disposable publication database.
import { mkdtemp, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { bulkFixture, service } from "./collector-bulk-fixture.mjs";

const root = resolve(".");
const temp = await mkdtemp(join(tmpdir(), "collector-bulk-ui-"));
const fixture = await bulkFixture();
await fixture.add("Orchard Spring Run");
await fixture.add("Harbour Sunset Circuit", { distance: 5, distanceKm: 5, distanceLabel: "5K" });
await fixture.add("Meadow Lantern Loop");
await fixture.add(
  "Forest Challenge",
  {},
  { status: "held", reason: "Possible event alias needs review" },
);
await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
await writeFile(
  join(temp, "index.html"),
  '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/entry.tsx"></script></body></html>',
);
await writeFile(
  join(temp, "entry.tsx"),
  `
  import React, { useState, useEffect } from "react";
  import { createRoot } from "react-dom/client";
  import { CollectorCandidateList } from "${join(root, "src/components/admin/collector-candidate-list.tsx")}";
  import "${join(root, "src/styles.css")}";
  function Fixture() {
    const [data, setData] = useState(null), [page, setPage] = useState(0), [scan, setScan] = useState(0);
    const [fail, setFail] = useState(false), [last, setLast] = useState("None"), [mobile, setMobile] = useState(false);
    const refresh = async () => setData(await (await fetch("/fixture/data")).json());
    useEffect(() => { void refresh(); }, []);
    const action = async (input) => {
      setLast(JSON.stringify(input));
      if(fail) { setFail(false); throw new Error("Fixture connection failure. Nothing changed; please retry."); }
      const response = await fetch("/fixture/action", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(input) });
      const result = await response.json();
      if(!response.ok) throw new Error(result.error);
      await refresh();
      return result;
    };
    return <main style={{maxWidth: mobile ? 390 : 900}} className="mx-auto space-y-4 p-4">
      <h1>Disposable bulk review fixture</h1>
      <nav className="flex flex-wrap gap-3">
        <button onClick={()=>setPage(0)}>Page 1</button><button onClick={()=>setPage(1)}>Page 2</button>
        <button onClick={()=>setScan(scan+1)}>Reset scan selection</button>
        <button aria-pressed={fail} onClick={()=>setFail(!fail)}>Fail next request</button>
        <button onClick={()=>setMobile(!mobile)}>Toggle mobile width</button>
      </nav>
      <p data-testid="database-counts">{data ? JSON.stringify(data.counts) : "Loading"}</p>
      <details><summary>Last request</summary><pre data-testid="last-request" className="whitespace-pre-wrap break-all">{last}</pre></details>
      {data && <CollectorCandidateList key={scan} rows={data.rows.slice(page*2,page*2+2)} onDecide={(id,decision)=>void action({ids:[id],action:decision,confirmed:true})} onBulkAction={action}/>}
    </main>;
  }
  createRoot(document.getElementById("root")).render(<Fixture/>);
`,
);
const server = await createServer({
  configFile: false,
  root: temp,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "disposable-collector-api",
      configureServer(vite) {
        vite.middlewares.use(async (request, response, next) => {
          if (!request.url?.startsWith("/fixture/")) return next();
          response.setHeader("content-type", "application/json");
          try {
            if (request.url === "/fixture/data") {
              const data = await service.dashboard(fixture.runId, fixture.sql, { status: "all" });
              // Include dismissed records so retention can be checked without losing the card.
              const dismissed = await service.dashboard(fixture.runId, fixture.sql, {
                status: "dismissed",
              });
              const rows = [...data.candidates, ...dismissed.candidates].sort((a, b) =>
                a.candidate.name.localeCompare(b.candidate.name),
              );
              const counts = (
                await fixture.sql`select (select count(*)::int from editions) as editions,(select count(*)::int from catalogue_revisions) as revisions,(select count(*)::int from race_collector_candidates where kept_at is not null and dismissed_at is null) as kept,(select count(*)::int from race_collector_candidates where dismissed_at is not null) as dismissed`
              )[0];
              return response.end(JSON.stringify({ rows, counts }));
            }
            if (request.url !== "/fixture/action" || request.method !== "POST") {
              response.statusCode = 404;
              return response.end("{}");
            }
            let body = "";
            for await (const chunk of request) body += chunk;
            const input = JSON.parse(body);
            const result = await fixture.action(input.ids, input.action, input);
            response.end(JSON.stringify(result));
          } catch (error) {
            response.statusCode = 400;
            response.end(JSON.stringify({ error: error.message }));
          }
        });
      },
    },
  ],
  resolve: { alias: [{ find: "@", replacement: join(root, "src") }] },
  server: { host: "127.0.0.1", port: 8091, strictPort: true, fs: { allow: [root, temp] } },
});
await server.listen();
console.log(server.resolvedUrls.local[0]);
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, async () => {
    await server.close();
    await fixture.pg.close();
    await rm(temp, { recursive: true, force: true });
    process.exit(0);
  });
