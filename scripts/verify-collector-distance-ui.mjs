// Exercise the actual dialog with isolated, labelled fixtures; no staff auth or live data.
import assert from "node:assert/strict";
import { mkdtemp, writeFile, symlink, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";

const root = resolve(".");
const temp = await mkdtemp(join(tmpdir(), "collector-distance-ui-"));
let server, browser;
try {
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  const candidates = [
    ["half", "Half Marathon", 21.0975, "Leenane"],
    ["full", "Marathon", 42.195, "Lough Inagh"],
    ["ultra", "Ultra", 63.2472192, "Recess"],
  ].map(([id, distanceLabel, distanceKm, city]) => ({
    id,
    candidate: {
      name: `Connemara International Marathon ${distanceLabel}`,
      date: "2027-04-25",
      distanceLabel,
      distanceKm,
      city,
      country: "Ireland",
      sourceUrl: "https://www.connemarathon.com/",
      entryUrl: "https://in.njuko.com/connemara-2027",
      evidence: "Isolated UI fixture: verify the three selectable distance comparisons.",
    },
  }));
  const event = {
    id: 9001,
    name: "Connemarathon",
    slug: "connemara-international-marathon",
    city: "Connemara",
    country: "Ireland",
  };
  const distances = candidates.map((c, i) => ({
    edition: {
      id: i + 1,
      eventId: event.id,
      date: "2027-04-25",
      distance: c.candidate.distanceLabel,
      distanceKm: i === 2 ? 63.3 : c.candidate.distanceKm,
      source: "https://www.connemarathon.com/international/",
    },
    matches: [
      {
        ...c,
        token: String(i).repeat(64),
        differences: ["Start location differs: catalogue Connemara; finding " + c.candidate.city],
      },
    ],
  }));
  const data = {
    total: 2,
    totalFindings: 3,
    findings: candidates,
    events: [
      { event, date: "2027-04-25", distances },
      {
        event: { ...event, id: 9002, name: "Alternate published event" },
        date: "2027-04-25",
        distances: [],
      },
    ],
  };
  await writeFile(
    join(temp, "api.ts"),
    `
    export async function getDuplicateDistanceOptions() { return ${JSON.stringify(data)}; }
    export async function confirmCollectorDuplicateDistances({data}) {
      window.__savedSelection = data;
      return { count: data.selections.length, keptName: "Connemarathon" };
    }
  `,
  );
  await writeFile(
    join(temp, "entry.tsx"),
    `
    import React from "react";
    import { createRoot } from "react-dom/client";
    import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
    import { CollectorDuplicateDialog } from "${join(root, "src/components/admin/collector-duplicate-dialog.tsx")}";
    import "${join(root, "src/styles.css")}";
    createRoot(document.getElementById("root")).render(
      <QueryClientProvider client={new QueryClient()}>
        <CollectorDuplicateDialog finding={${JSON.stringify(candidates[0])}}
          onClose={() => { window.__closed = true; }}
          onSaved={(message) => { window.__savedMessage = message; }} />
      </QueryClientProvider>
    );
  `,
  );
  server = await createServer({
    configFile: false,
    root: temp,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: "@/lib/race-collector/api", replacement: join(temp, "api.ts") },
        { find: "@", replacement: join(root, "src") },
      ],
    },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [root, temp] } },
  });
  await writeFile(
    join(temp, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/entry.tsx"></script></body></html>',
  );
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(server.resolvedUrls.local[0]);
  const eventChoice = page.getByRole("radio", { name: /^Connemarathon/ });
  await eventChoice.check();
  const half = page.getByRole("checkbox", { name: /^Keep Half Marathon;/ });
  const full = page.getByRole("checkbox", { name: /^Keep Marathon;/ });
  const ultra = page.getByRole("checkbox", { name: /^Keep Ultra;/ });
  const save = page.getByRole("button", { name: /^Keep selected distances/ });
  const confirm = page.getByRole("checkbox", { name: /^I have compared/ });
  const differences = page.getByRole("checkbox", { name: /^I have checked/ });
  assert(await save.isDisabled());
  await half.check();
  await ultra.check();
  assert(!(await full.isChecked()));
  assert(await save.isDisabled());
  await confirm.check();
  assert(await save.isDisabled());
  await differences.check();
  assert(await save.isEnabled());
  // Changing any distance invalidates the previous confirmation.
  await full.check();
  assert(!(await confirm.isChecked()));
  assert(!(await differences.isChecked()));
  await full.uncheck();
  // Switching the event or searching cannot carry old selections into a new comparison.
  await page.getByRole("radio", { name: /^Alternate published event/ }).check();
  await eventChoice.check();
  assert(!(await half.isChecked()));
  await half.check();
  await page.getByRole("textbox", { name: "Search existing event names" }).fill("connema");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  assert(!(await eventChoice.isChecked()));
  await eventChoice.check();
  assert(!(await half.isChecked()));
  await half.check();
  await ultra.check();
  await confirm.check();
  await differences.check();
  await mkdir(join(root, "artifacts"), { recursive: true });
  await page.getByRole("dialog").evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.screenshot({ path: join(root, "artifacts/collector-distances-desktop.png") });
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await page.getByRole("dialog").evaluate((el) => el.scrollWidth <= el.clientWidth));
  await page.screenshot({ path: join(root, "artifacts/collector-distances-mobile.png") });
  await save.click();
  await page.waitForFunction(() => Boolean(window.__savedMessage));
  const saved = await page.evaluate(() => window.__savedSelection);
  assert.deepEqual(saved.selections.map((s) => s.id).sort(), ["half", "ultra"]);
  assert.equal(saved.eventId, 9001);
  assert(saved.sameRaceConfirmed && saved.differencesAccepted);
  assert.match(await page.evaluate(() => window.__savedMessage), /Removed 2 duplicate findings/);
  assert.deepEqual(errors, []);
  console.log(
    "Collector distance dialog verified: multi-selection, unselected preservation, confirmation reset, event/search reset, mobile fit and selected-only save.",
  );
} finally {
  await browser?.close();
  await server?.close();
  await rm(temp, { recursive: true, force: true });
}
