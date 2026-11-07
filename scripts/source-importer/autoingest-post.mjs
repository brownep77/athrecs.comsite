// Sends collector output to the live site's automatic intake.
// Usage: node scripts/source-importer/autoingest-post.mjs --run-key <key> <dir> [<dir> ...] [--dry-run]
// Each <dir> holds fixtures.csv and skipped.csv from run.mjs or render.mjs.
// Needs FIXTURE_AUTOINGEST_URL (e.g. https://www.athrecs.com/api/fixture-autoingest)
// and FIXTURE_AUTOINGEST_TOKEN. The site decides what is published; this script only delivers.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseCsv } from "./lib.mjs";
import { checkRows, loadAllowedDomains, summarise } from "./checks.mjs";

const args = process.argv.slice(2);
const opt = (n) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : undefined);
const runKey = opt("run-key") ?? `collector:${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "")}`;
const dirs = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--run-key");
const dryRun = args.includes("--dry-run");
const FIXTURES_PER_POST = 400;
const SKIPPED_PER_POST = 1500;

export function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Attach the quality checker's flags to every row (row numbers are CSV lines, from 2). */
export function withFlags(rows, flags, sourceIds = []) {
  return rows.map((row, i) => ({
    row,
    sourceId: sourceIds[i] ?? "",
    flags: flags
      .filter((f) => f.row === i + 2)
      .map((f) => ({ severity: f.severity, check: f.check, detail: f.detail })),
  }));
}

async function post(url, token, body, attempt = 1) {
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  }).catch((error) => ({ ok: false, status: 0, text: async () => String(error) }));
  if (response.ok) return response.json();
  if (attempt < 4 && (response.status === 0 || response.status >= 500)) {
    await new Promise((r) => setTimeout(r, attempt * 10_000));
    return post(url, token, body, attempt + 1);
  }
  throw new Error(`Intake returned ${response.status}: ${(await response.text()).slice(0, 300)}`);
}

async function main() {
  if (!dirs.length) throw new Error("Give at least one output folder.");
  const today = new Date().toISOString().slice(0, 10);
  let allowedDomains = {};
  try {
    allowedDomains = loadAllowedDomains(await readFile("docs/source-registry/fixture-result-sources.csv", "utf8"));
  } catch {
    // Without the registry the domain check is skipped; every other check still runs.
  }
  const fixtures = [];
  const skipped = [];
  for (const dir of dirs) {
    const f = join(dir, "fixtures.csv");
    const s = join(dir, "skipped.csv");
    if (existsSync(f)) {
      const rows = parseCsv(await readFile(f, "utf8"));
      if (rows.length) {
        const flags = checkRows(rows, { today, allowedDomains });
        const sum = summarise(rows, flags);
        console.log(`${dir}: ${sum.rows} rows, ${sum.clean} clean, ${sum.withErrors} with errors`);
        fixtures.push(...withFlags(rows, flags));
      }
    }
    if (existsSync(s)) skipped.push(...parseCsv(await readFile(s, "utf8")));
  }
  console.log(`Sending ${fixtures.length} fixture rows and ${skipped.length} skipped pages as ${runKey}.`);
  if (dryRun) return;
  const url = process.env.FIXTURE_AUTOINGEST_URL?.trim();
  const token = process.env.FIXTURE_AUTOINGEST_TOKEN?.trim();
  if (!url || !token) throw new Error("FIXTURE_AUTOINGEST_URL and FIXTURE_AUTOINGEST_TOKEN are required.");
  const f = chunk(fixtures, FIXTURES_PER_POST);
  const s = chunk(skipped, SKIPPED_PER_POST);
  let added = 0;
  let ignored = 0;
  for (let i = 0; i < Math.max(f.length, s.length); i++) {
    const result = await post(url, token, { runKey, fixtures: f[i] ?? [], skipped: s[i] ?? [] });
    added += result.added ?? 0;
    ignored += result.ignored ?? 0;
  }
  console.log(`Intake accepted ${added} new rows; ${ignored} were already known or not races.`);
}

if (import.meta.url === `file://${process.argv[1]}`)
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
