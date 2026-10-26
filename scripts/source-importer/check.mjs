// Usage: node scripts/source-importer/check.mjs fixtures.csv [--out flags.csv] [--drop-errors clean.csv]
// Reads a fixture CSV, prints a summary and writes every flag. Publishes nothing.
import { readFile, writeFile } from "node:fs/promises";
import { parseCsv, toCsv } from "./lib.mjs";
import { checkRows, loadAllowedDomains, summarise } from "./checks.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out" && args[args.indexOf(a) - 1] !== "--drop-errors");
const opt = (n) => args[args.indexOf(`--${n}`) + 1];
if (!file) throw new Error("Give the fixtures CSV to check.");
const today = new Date().toISOString().slice(0, 10);
const rows = parseCsv(await readFile(file, "utf8"));
let allowedDomains = {};
try {
  allowedDomains = loadAllowedDomains(await readFile("docs/source-registry/fixture-result-sources.csv", "utf8"));
} catch {}
const flags = checkRows(rows, { today, allowedDomains });
const sum = summarise(rows, flags);
console.log(`${sum.rows} rows: ${sum.clean} clean, ${sum.withWarnings} with warnings, ${sum.withErrors} with errors`);
for (const [k, v] of Object.entries(sum.by).sort()) console.log(`  ${k}: ${v}`);
const out = opt("out") ?? file.replace(/\.csv$/, "") + ".flags.csv";
await writeFile(out, toCsv(["row", "severity", "check", "name", "date", "detail"], flags));
console.log(`Flags written to ${out}`);
if (args.includes("--drop-errors")) {
  const bad = new Set(flags.filter((f) => f.severity === "error").map((f) => f.row));
  const keep = rows.filter((_, i) => !bad.has(i + 2));
  await writeFile(opt("drop-errors"), toCsv(Object.keys(rows[0]), keep));
  console.log(`${keep.length} error-free rows written to ${opt("drop-errors")}`);
}
