// Parallel race importer. Usage:
//   node scripts/source-importer/run.mjs --list
//   node scripts/source-importer/run.mjs --from 2026-10-26 --to 2026-11-30 [--source id ...] [--out dir]
// Writes fixtures.csv (upload it to Import running fixtures), skipped.csv and report.md. Publishes nothing.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OUTPUT_HEADERS, enabledSources, parseCsv, runAll, toCsv } from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const out = [];
  args.forEach((a, i) => a === `--${name}` && args[i + 1] && out.push(args[i + 1]));
  return out;
};
const has = (name) => args.includes(`--${name}`);
const today = new Date().toISOString().slice(0, 10);
const registryPath = flag("registry")[0] ?? "docs/source-registry/fixture-result-sources.csv";
const registry = parseCsv(await readFile(registryPath, "utf8"));
const sources = enabledSources(registry, flag("source"));

if (has("list")) {
  for (const s of sources)
    console.log(`${s.source_id}\t${s.source_type}\t${s.start_url}\tpages≤${s.max_pages}\t${s.rate_limit_seconds}s`);
  console.log(`${sources.length} enabled sources of ${registry.length} in the registry.`);
  process.exit(0);
}

const from = flag("from")[0] ?? today,
  to = flag("to")[0] ?? `${Number(today.slice(0, 4)) + 1}-12-31`;
const out = flag("out")[0] ?? join("tmp", `source-import-${today}`);
const concurrency = Number(flag("concurrency")[0] ?? 4);
const maxEvents = Number(flag("max-events")[0] ?? 200);
const { results, rows } = await runAll(sources, {
  concurrency,
  options: { today, from, to, maxEvents },
});
await mkdir(out, { recursive: true });
await writeFile(join(out, "fixtures.csv"), toCsv(OUTPUT_HEADERS, rows));
const skipped = results.flatMap((r) => r.skipped);
await writeFile(join(out, "skipped.csv"), toCsv(["source", "url", "name", "date", "reason"], skipped));
const report = [
  `# Source import ${today}`,
  `Window ${from} to ${to}. ${sources.length} enabled sources, ${rows.length} rows, ${skipped.length} skipped.`,
  "",
  ...results.map(
    (r) =>
      `- ${r.source}: ${r.pages} pages, ${r.rows.length} rows, ${r.skipped.length} skipped${r.log.length ? `, ${r.log.length} notes` : ""}`,
  ),
  "",
  "## Notes",
  ...results.flatMap((r) => r.log.map((l) => `- ${r.source}: ${l}`)),
  "",
  "Upload fixtures.csv to Import running fixtures. It runs the duplicate check; nothing is published until you Keep and Publish.",
].join("\n");
await writeFile(join(out, "report.md"), report + "\n");
console.log(report.split("\n").slice(0, 3).join("\n"));
console.log(`Files written to ${out}`);
