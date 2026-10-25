#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { createSourceReader, writeJson, importSourceCaptures } from "./lib/start-time-fetch.mjs";
import { runStartTimeBatch, reviewHtml, prepareReviewedStarts } from "./lib/start-time-batch.mjs";

const HELP = `Batch missing-start research (all sports; no database writes).
  npm run collect:start-times -- --input <inventory.json> --out <private-job-directory>
  [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--limit 100] [--concurrency 6]
  [--max-pages 12] [--depth 2] [--max-requests 1500] [--ttl-hours 24]
  [--discovery <observed-links.json>] [--offline]
  Import approved public-web captures: --out <job> --import-captures <captures.json>

Defaults: today through 31 December of the current year, every missing edition.
Re-run with the same output directory to reuse unexpired captures. --offline only
reads retained captures and leaves unfetched pages unchecked. --ttl-hours 0 makes
a fresh source pass. Requires Node 24 and Poppler pdftotext for PDF text.
JSON report, searchable review.html and per-event checkpoints are private evidence.
Time clues are NOT verified assignments. Scanned is not the same as complete.

After human source review, prepare a guarded publication handoff:
  --out <job> --decisions <decisions.json> --current <fresh-inventory.json>
This emits reviewed-starts.json, never SQL or live writes. See docs/start-time-batch.md.
`;
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
export async function runCli(argv) {
  const args = {};
  const booleans = ["--help", "--offline"];
  const values = [
    "--input",
    "--out",
    "--from",
    "--to",
    "--limit",
    "--concurrency",
    "--max-pages",
    "--depth",
    "--max-requests",
    "--ttl-hours",
    "--discovery",
    "--decisions",
    "--current",
    "--import-captures",
  ];
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (Object.hasOwn(args, flag)) throw Error(`Repeated option ${flag}`);
    if (booleans.includes(flag)) args[flag] = true;
    else if (values.includes(flag) && argv[i + 1] && !argv[i + 1].startsWith("--"))
      args[flag] = argv[++i];
    else throw Error(`Unknown option or missing value ${flag}`);
  }
  if (args["--help"]) {
    console.log(HELP);
    return;
  }
  if (!args["--out"]) throw Error("Supply a private --out directory");
  const directory = resolve(args["--out"]);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if (args["--import-captures"]) {
    const count = await importSourceCaptures(
      await readJson(args["--import-captures"]),
      join(directory, "sources"),
    );
    console.log(
      `Imported ${count} retained source captures with their original check dates. Run the scanner with --offline to review them.`,
    );
    return { imported: count };
  }
  if (args["--decisions"]) {
    if (!args["--current"])
      throw Error("Supply a fresh --current inventory before preparing reviewed starts");
    const report = await readJson(join(directory, "report.json"));
    const handoff = await prepareReviewedStarts(report, await readJson(args["--decisions"]), {
      cacheDirectory: join(directory, "sources"),
      currentRows: await readJson(args["--current"]),
    });
    await writeJson(join(directory, "reviewed-starts.json"), handoff);
    console.log(
      `${handoff.updates.length} reviewed starts prepared for existing staging/validation. Published: 0.`,
    );
    return handoff;
  }
  if (!args["--input"]) throw Error("Supply --input inventory.json");
  const from = args["--from"] ?? new Date().toISOString().slice(0, 10),
    to = args["--to"] ?? `${from.slice(0, 4)}-12-31`;
  for (const date of [from, to])
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date
    )
      throw Error("Dates must be valid YYYY-MM-DD values");
  if (to < from) throw Error("--to must not precede --from");
  const number = (key, fallback, min, max) => {
    if (!args[key]) return fallback;
    if (!/^\d+$/.test(args[key]) || Number(args[key]) < min || Number(args[key]) > max)
      throw Error(`${key} must be ${min}–${max}`);
    return Number(args[key]);
  };
  const controller = new AbortController();
  const limits = {
    limit: number("--limit", Infinity, 1, 100000),
    concurrency: number("--concurrency", 6, 1, 16),
    maxPages: number("--max-pages", 12, 1, 50),
    depth: number("--depth", 2, 0, 4),
  };
  const stop = () =>
    controller.abort(Error("Interrupted; source captures and event checkpoints retained"));
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    const reader = createSourceReader({
      directory: join(directory, "sources"),
      offline: !!args["--offline"],
      maxRequests: number("--max-requests", 1500, 1, 20000),
      ttlHours: number("--ttl-hours", 24, 0, 168),
      signal: controller.signal,
    });
    const report = await runStartTimeBatch(await readJson(args["--input"]), {
      directory,
      reader,
      from,
      to,
      ...limits,
      discovery: args["--discovery"] ? await readJson(args["--discovery"]) : [],
      onProgress: (p) => {
        if (p.completed % 25 === 0 || p.completed === p.groups)
          console.log(
            `Scanned ${p.completed}/${p.groups} event dates; ${p.editions} editions in scope.`,
          );
      },
    });
    await writeFile(join(directory, "review.html"), reviewHtml(report), { mode: 0o600 });
    console.log(JSON.stringify(report.summary, null, 2));
    return report;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  runCli(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
