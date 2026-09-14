// Test the real candidate card with isolated fixtures and native confirmation dialogs.
import assert from "node:assert/strict";
import { mkdtemp, writeFile, symlink, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "playwright";

const root = resolve(".");
const temp = await mkdtemp(join(tmpdir(), "collector-decisions-ui-"));
let server, browser;
try {
  await symlink(join(root, "node_modules"), join(temp, "node_modules"), "dir");
  const row = {
    id: "00000000-0000-0000-0000-000000000001",
    candidate: {
      name: "Hampton Court Palace 10K",
      date: "2027-03-13",
      distanceLabel: "10K",
      distanceKm: 10,
      city: "East Molesey",
      region: "Surrey",
      country: "United Kingdom",
      sourceUrl: "https://www.runthrough.co.uk/event/hampton-court-palace-10k/",
      entryUrl: "https://www.runthrough.co.uk/entry/",
      evidence: "The organiser confirms 13 March, 10K and the palace start.",
      notes: "Retain the RunThrough email evidence and possible alias.",
      surface: "Road",
      sourceKind: "organiser",
      startTime: "09:00",
      entryStatus: "Open",
    },
    status: "held",
    reason: "Possible event alias needs review",
    event_id: null,
    event_slug: "hampton-court-palace-10k",
    batch_id: null,
    check: {
      matches: [],
      matchCount: 0,
      pending: [],
      changed: false,
    },
  };
  await writeFile(join(temp, "entry.tsx"), `
    import React, { useState } from "react";
    import { createRoot } from "react-dom/client";
    import { CollectorCandidateCard } from "${join(root, "src/components/admin/collector-candidate-card.tsx")}";
    import "${join(root, "src/styles.css")}";
    window.__decisions = [];
    function Fixture() {
      const [row, setRow] = useState(${JSON.stringify(row)});
      const [busy, setBusy] = useState(false);
      const [error, setError] = useState("");
      return <main className="mx-auto max-w-3xl p-4">
        <CollectorCandidateCard row={row} disabled={busy} onDecide={(action) => {
          window.__decisions.push(action);
          setBusy(true);
          setError("");
          window.__complete = (success = true) => {
            if (success) setRow((r) => action === "keep"
              ? {...r, kept_at: "2026-09-14", kept_by: "reviewer@example.org", dismissed_at: null}
              : {...r, dismissed_at: "2026-09-14", dismissed_by: "reviewer@example.org"});
            else setError("Could not save. Please retry.");
            setBusy(false);
          };
        }} />
        {error && <p role="alert">{error}</p>}
      </main>;
    }
    createRoot(document.getElementById("root")).render(<Fixture />);
  `);
  await writeFile(
    join(temp, "index.html"),
    '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/entry.tsx"></script></body></html>',
  );
  server = await createServer({
    configFile: false,
    root: temp,
    plugins: [react(), tailwindcss()],
    resolve: { alias: [{ find: "@", replacement: join(root, "src") }] },
    server: { host: "127.0.0.1", port: 0, fs: { allow: [root, temp] } },
  });
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(server.resolvedUrls.local[0]);
  const keep = page.getByRole("button", { name: /^Keep Hampton/ });
  const dismiss = page.getByRole("button", { name: /^Dismiss Hampton/ });
  await keep.waitFor();
  assert.deepEqual(await page.getByRole("button").allTextContents(), ["Keep", "Dismiss"]);
  async function confirm(button, action, accept) {
    const dialog = page.waitForEvent("dialog");
    const click = button.click();
    const popup = await dialog;
    assert.equal(popup.type(), "confirm");
    assert(popup.message().startsWith("Are you sure you want to " + action));
    assert(popup.message().includes("Hampton Court Palace 10K"));
    assert(popup.message().includes("2027-03-13 · 10K"));
    if (accept) await popup.accept();
    else await popup.dismiss();
    await click;
  }
  // Both cancel paths are side-effect free.
  await confirm(keep, "keep", false);
  await confirm(dismiss, "dismiss", false);
  assert.deepEqual(await page.evaluate(() => window.__decisions), []);
  // Failed persistence leaves the original decision available to retry.
  await confirm(keep, "keep", true);
  assert(await keep.isDisabled());
  assert(await dismiss.isDisabled());
  await page.evaluate(() => window.__complete(false));
  await page.getByRole("alert").waitFor();
  assert(await keep.isEnabled());
  // Confirmed Keep works for held/alias candidates without resolving or erasing the check.
  await confirm(keep, "keep", true);
  await page.evaluate(() => window.__complete());
  await page.getByText("Kept", { exact: true }).waitFor();
  assert(await keep.isDisabled());
  assert(await dismiss.isEnabled());
  await page.getByText("Race information, sources and checks", { exact: true }).click();
  assert(await page.getByText(row.candidate.evidence).isVisible());
  assert(await page.getByText(row.candidate.notes).isVisible());
  assert(await page.getByText(row.reason, { exact: false }).isVisible());
  assert.equal(await page.getByRole("link", { name: "Primary programme" }).getAttribute("href"), row.candidate.sourceUrl);
  assert.equal(await page.getByRole("button").count(), 2);
  // Cancel a reversal, then dismiss and restore with the same two actions.
  await confirm(dismiss, "dismiss", false);
  assert(await page.getByText("Kept", { exact: true }).isVisible());
  await confirm(dismiss, "dismiss", true);
  await page.evaluate(() => window.__complete());
  await page.getByText("Dismissed", { exact: true }).waitFor();
  assert(await dismiss.isDisabled());
  assert(await keep.isEnabled());
  await confirm(keep, "keep", true);
  await page.evaluate(() => window.__complete());
  await page.getByText("Kept", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__decisions), ["keep", "keep", "dismiss", "keep"]);
  await page.setViewportSize({ width: 390, height: 844 });
  assert(await keep.isVisible());
  assert(await dismiss.isVisible());
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await mkdir(join(root, "artifacts"), { recursive: true });
  await page.screenshot({ path: join(root, "artifacts/collector-decisions-mobile.png"), fullPage: true });
  assert.deepEqual(errors, []);
  console.log("Collector decisions verified: exactly two actions, confirmation and cancellation, retry, reversible dismissal, retained evidence and mobile layout.");
} finally {
  await browser?.close();
  await server?.close();
  await rm(temp, { recursive: true, force: true });
}
