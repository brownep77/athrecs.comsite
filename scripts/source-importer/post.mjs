// Posts a source-importer fixtures.csv to the site's automated import worker in
// chunks, then publishes ready rows. Used by the daily GitHub Actions job.
//   SOURCE_IMPORT_URL=https://www.athrecs.com SOURCE_IMPORT_TOKEN=... \
//     node scripts/source-importer/post.mjs tmp/source-import-YYYY-MM-DD/fixtures.csv FROM TO
import { readFile, appendFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { OUTPUT_HEADERS, parseCsv, toCsv } from "./lib.mjs";

const [file, dateFrom, dateTo] = process.argv.slice(2);
const base = (process.env.SOURCE_IMPORT_URL ?? "").replace(/\/$/, "");
const token = process.env.SOURCE_IMPORT_TOKEN ?? "";
if (!file || !dateFrom || !dateTo)
  throw new Error(
    "Usage: post.mjs fixtures.csv FROM TO (with SOURCE_IMPORT_URL and SOURCE_IMPORT_TOKEN)",
  );
const CHUNK = 300;
// Without the token the run still lists every source's outcome; nothing is imported or emailed.
const connected = Boolean(base && token);

async function call(body) {
  const response = await fetch(`${base}/api/source-import-worker`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${response.status}: ${json.error ?? "request failed"}`);
  return json;
}

// Parse properly so quoted fields containing commas or line breaks stay intact.
const rows = parseCsv(await readFile(file, "utf8"));
const totals = {
  rows: rows.length,
  saved: 0,
  dropped: 0,
  duplicates: 0,
  published: 0,
  held: 0,
  failedChunks: 0,
};
for (let start = 0; connected && start < rows.length; start += CHUNK) {
  const n = start / CHUNK + 1;
  const csv = toCsv(OUTPUT_HEADERS, rows.slice(start, start + CHUNK));
  try {
    const saved = await call({
      action: "import",
      label: `Automated source import ${new Date().toISOString().slice(0, 10)} part ${n}`,
      csv,
      dateFrom,
      dateTo,
    });
    totals.dropped += saved.dropped ?? 0;
    totals.duplicates += saved.counts?.duplicate ?? 0;
    totals.saved += (saved.counts?.rows ?? 0) - (saved.dropped ?? 0);
    if (!saved.runId) continue;
    // Publish in time-boxed rounds until nothing more can publish.
    for (let round = 0; round < 40; round += 1) {
      const result = await call({ action: "publish", runId: saved.runId });
      totals.published += result.published;
      totals.held = Math.max(totals.held, result.heldForReview);
      if (!result.remaining || !result.published) break;
    }
  } catch (error) {
    totals.failedChunks += 1;
    console.error(`Chunk ${n}: ${error.message}`);
  }
}
// Sites whose robots.txt refuses collection: partnership email (sent only
// when the site's outreach setting is on; otherwise reported as "would send").
const access = parseCsv(await readFile(join(dirname(file), "access.csv"), "utf8"));
const refused = access.filter((row) => row.status === "prohibited");
const outreach = [];
for (let start = 0; connected && start < refused.length; start += 25) {
  try {
    const reply = await call({
      action: "outreach",
      targets: refused.slice(start, start + 25).map((row) => ({
        sourceId: row.source_id,
        siteName: row.source_name,
        siteUrl: row.url,
        contactEmail: row.contact_email,
        reason: "disallowed by robots.txt",
      })),
    });
    outreach.push(...reply.results);
  } catch (error) {
    console.error(`Outreach batch ${start / 25 + 1}: ${error.message}`);
  }
}
const outreachBy = new Map(outreach.map((r) => [r.sourceId, r]));
const label = {
  collected: "Collecting fixtures",
  "no-fixtures-found": "Set up, no fixtures found this run",
  unreachable: "Could not be reached this run",
  prohibited: "Site says no (robots.txt)",
  "not-reached": "Not reached before the time limit",
};
const outcomeLines = [
  "# Source outcomes",
  "",
  `Run window ${dateFrom} to ${dateTo}. ${access.length} enabled sources.`,
  "",
  ...Object.entries(label).map(
    ([status, text]) => `- ${text}: ${access.filter((r) => r.status === status).length}`,
  ),
  "",
  "## Sites that said no, and the email outcome",
  "",
  "| Source | Website | Contact | Email |",
  "| --- | --- | --- | --- |",
  ...refused.map((row) => {
    const r = outreachBy.get(row.source_id);
    return `| ${row.source_name.replaceAll("|", "/")} | ${row.url} | ${r?.contactEmail || row.contact_email || "none found"} | ${r?.status ?? (connected ? "not attempted" : "not sent: import not connected")} |`;
  }),
  "",
  "## Sources with ingestion set up",
  "",
  "| Source | Website | Status | Fixtures this run |",
  "| --- | --- | --- | --- |",
  ...access
    .filter((row) => row.status !== "prohibited")
    .map(
      (row) =>
        `| ${row.source_name.replaceAll("|", "/")} | ${row.url} | ${label[row.status] ?? row.status} | ${row.rows} |`,
    ),
  "",
];
await writeFile(join(dirname(file), "source-outcomes.md"), outcomeLines.join("\n"));

const summary = [
  `### Automated fixture import${connected ? "" : " (not connected: add SOURCE_IMPORT_TOKEN)"}`,
  `- Rows collected: ${totals.rows}`,
  `- Dropped as invalid or repeated: ${totals.dropped}`,
  `- Already listed (duplicates): ${totals.duplicates}`,
  `- Published: ${totals.published}`,
  `- Left in the review queue for staff: rows that failed a publication check`,
  `- Chunks that failed: ${totals.failedChunks}`,
  `- Sites that said no (robots.txt): ${refused.length}; emailed: ${outreach.filter((r) => r.status === "sent").length}; would email once outreach is switched on: ${outreach.filter((r) => r.status === "would_send").length}; no contact found: ${outreach.filter((r) => r.status === "no_contact").length}`,
  `- Full list: source-outcomes.md in the run artifact`,
].join("\n");
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY)
  await appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
if (totals.failedChunks && totals.failedChunks * CHUNK >= rows.length) process.exit(1);
