// Merges the shard folders of a daily collection into one folder for post.mjs.
//   node scripts/source-importer/merge.mjs OUT_DIR SHARD_DIR [SHARD_DIR ...]
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OUTPUT_HEADERS, parseCsv, toCsv } from "./lib.mjs";

const [out, ...dirs] = process.argv.slice(2);
if (!out || !dirs.length) throw new Error("Usage: merge.mjs OUT_DIR SHARD_DIR [SHARD_DIR ...]");
const read = async (dir, name) => {
  try {
    return parseCsv(await readFile(join(dir, name), "utf8"));
  } catch {
    return [];
  }
};
const seen = new Set();
const fixtures = [];
const access = [];
const reports = [];
for (const dir of dirs) {
  for (const row of await read(dir, "fixtures.csv")) {
    const key = [row.name, row.date, row.distance, row.unit, row.sourceUrl].join("|").toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      fixtures.push(row);
    }
  }
  access.push(...(await read(dir, "access.csv")));
  reports.push(await readFile(join(dir, "report.md"), "utf8").catch(() => ""));
}
await mkdir(out, { recursive: true });
await writeFile(join(out, "fixtures.csv"), toCsv(OUTPUT_HEADERS, fixtures));
await writeFile(
  join(out, "access.csv"),
  toCsv(["source_id", "source_name", "url", "status", "rows", "contact_email"], access),
);
await writeFile(join(out, "report.md"), reports.join("\n"));
console.log(`Merged ${dirs.length} shards: ${fixtures.length} fixtures, ${access.length} sources.`);
