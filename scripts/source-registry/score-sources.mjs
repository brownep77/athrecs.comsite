#!/usr/bin/env node
// Source scorecard: profiles, scores and tiers every row of the fixture and
// result source registry so collection effort goes to the most useful sources.
//
//   npm run sources:score            -> writes docs/source-registry/source-scorecard.csv
//                                       and docs/source-registry/source-scorecard.md
//   npm run sources:score -- --check -> fails if the committed scorecard is stale
//
// Scores use registry evidence only (permission, what the source supplies, whether
// an adapter exists, coverage and timing quality). Live columns (last checked,
// records in 30 days, rejection rate) start blank and are filled by the source
// rater / collector runs; when present they adjust the score (see liveAdjustment).
// A score never grants permission: disabled or blocked rows stay uncollected.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const registryPath = join(root, "docs/source-registry/fixture-result-sources.csv");
const scorecardPath = join(root, "docs/source-registry/source-scorecard.csv");
const summaryPath = join(root, "docs/source-registry/source-scorecard.md");
const livePath = join(root, "docs/source-registry/source-live-metrics.csv");

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ""])));
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

// ---- Profiling --------------------------------------------------------------

const SPORT_PATTERNS = [
  ["Running", /\brun|road|marathon|10k|5k|half|parkrun|chip timing|race timing/i],
  ["Athletics", /athletic|track|field|indoor|diamond league|world athletics/i],
  ["Trail", /trail|fell|mountain|ultra|skyrun/i],
  ["Triathlon", /triathlon|duathlon|aquathlon|aquabike|multisport/i],
  ["Swimming", /swim|channel|open water|aquatic/i],
  ["Cycling", /cycl|bike|sportive|velo|gran fondo/i],
  ["HYROX", /hyrox|fitness racing|ocr|obstacle/i],
];

export function sportsFor(row) {
  const text = [
    row.source_name,
    row.source_section,
    row.coverage_scope,
    row.notes,
    row.start_url,
  ].join(" ");
  const sports = SPORT_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return sports.length ? sports : ["Unclassified"];
}

export function providesFor(row) {
  const scope = `${row.coverage_scope} ${row.timing_scope} ${row.source_section}`.toLowerCase();
  const fixtures = /future|fixture|calendar|upcoming|present & future|programme/.test(scope);
  const results =
    row.source_type === "results" || /past|result|archive|records|elapsed/.test(scope);
  if (/membership reference|reference only|external links only/.test(scope)) return "Reference";
  if (/awaiting assessment/.test(scope)) return "To assess";
  if (fixtures && results) return "Fixtures and results";
  if (fixtures) return "Fixtures";
  if (results) return "Results";
  return "To assess";
}

export function accessFor(row) {
  if (row.profile && row.profile !== "generic") return `Adapter (${row.profile})`;
  if (row.source_type === "sitemap") return "Sitemap";
  return "Web page";
}

export function permissionFor(row) {
  const rights = row.rights_status.toLowerCase();
  if (/blocked|do not copy|paused|copying restrictions|restrict reuse/.test(rights)) {
    return "Not allowed";
  }
  if (
    row.enabled === "1" &&
    /permitted|no published crawl restriction|cleared by owner/.test(rights)
  ) {
    return "Open";
  }
  if (
    /external links only|reference only|manual research only|not enabled|supervised/.test(rights)
  ) {
    return "Manual only";
  }
  return "Needs review";
}

// ---- Scoring (0-100) --------------------------------------------------------

const PERMISSION_POINTS = { Open: 30, "Needs review": 12, "Manual only": 5, "Not allowed": 0 };
const PROVIDES_POINTS = {
  "Fixtures and results": 25,
  Fixtures: 20,
  Results: 16,
  "To assess": 8,
  Reference: 4,
};
const HOME_MARKETS = /^(uk|united kingdom|england|scotland|wales|northern ireland|ireland|gb)/i;
const WIDE_SCOPE = /^(global|international|europe|world)/i;

function coveragePoints(row) {
  const region = row.region_scope.trim();
  if (HOME_MARKETS.test(region) || HOME_MARKETS.test(row.country_focus)) return 15; // UK first
  if (WIDE_SCOPE.test(region)) return 12;
  return region ? 8 : 4;
}

function timingPoints(row) {
  const chip = row.chip_timed_status.toLowerCase();
  if (chip.startsWith("provider-confirmed")) return 10;
  if (/event-specific|mixed|source-specific/.test(chip)) return 6;
  if (/precision|exact|elapsed|labels/i.test(row.timing_scope)) return 6;
  return 3;
}

function liveAdjustment(live) {
  if (!live) return 0;
  let delta = 0;
  const records = Number(live.records_30d);
  const rejection = Number(live.rejection_rate_pct);
  if (Number.isFinite(records) && live.records_30d !== "") {
    delta += records >= 200 ? 10 : records >= 50 ? 6 : records >= 1 ? 2 : -10;
  }
  if (Number.isFinite(rejection) && live.rejection_rate_pct !== "") {
    delta += rejection <= 5 ? 5 : rejection <= 20 ? 0 : rejection <= 50 ? -10 : -25;
  }
  return delta;
}

export function scoreSource(row, live) {
  const permission = permissionFor(row);
  const provides = providesFor(row);
  const adapter = row.profile && row.profile !== "generic" ? 20 : row.start_url ? 8 : 0;
  const raw =
    PERMISSION_POINTS[permission] +
    PROVIDES_POINTS[provides] +
    adapter +
    coveragePoints(row) +
    timingPoints(row) +
    liveAdjustment(live);
  const score = Math.max(0, Math.min(100, raw));
  return { permission, provides, score, tier: tierFor(score, permission, row) };
}

export function tierFor(score, permission, row) {
  if (permission === "Not allowed") return "Retired";
  if (row.enabled === "1" && score >= 70) return "A";
  if (score >= 50) return "B";
  if (score >= 30) return "C";
  return "Retired";
}

export const CHECK_FREQUENCY = {
  A: "Every 2 hours",
  B: "Daily",
  C: "Weekly",
  Retired: "Monthly",
};

export function nextAction(row, permission, tier) {
  if (permission === "Not allowed") return "Keep off; revisit monthly in case terms change";
  if (row.enabled === "1") return tier === "A" ? "Collect" : "Collect; improve adapter";
  if (permission === "Needs review") return "Rights review, then partner request if needed";
  if (permission === "Manual only") return "Manual research or partner request";
  return "Build adapter and enable";
}

// ---- Build ------------------------------------------------------------------

function loadLive() {
  if (!existsSync(livePath)) return new Map();
  return new Map(parseCsv(readFileSync(livePath, "utf8")).map((row) => [row.source_id, row]));
}

export function buildScorecard(registry, live = new Map()) {
  return registry
    .map((row) => {
      const metrics = live.get(row.source_id);
      const { permission, provides, score, tier } = scoreSource(row, metrics);
      return {
        source_id: row.source_id,
        source_name: row.source_name,
        url: row.start_url,
        country: row.country_focus || row.region_scope,
        sports: sportsFor(row).join(" | "),
        provides,
        access: accessFor(row),
        permission,
        enabled: row.enabled === "1" ? "yes" : "no",
        score,
        tier,
        check_frequency: CHECK_FREQUENCY[tier],
        next_action: nextAction(row, permission, tier),
        last_checked: metrics?.last_checked ?? "",
        last_new_item: metrics?.last_new_item ?? "",
        records_30d: metrics?.records_30d ?? "",
        rejection_rate_pct: metrics?.rejection_rate_pct ?? "",
      };
    })
    .sort((a, b) => b.score - a.score || a.source_id.localeCompare(b.source_id));
}

export function toCsv(rows) {
  const header = Object.keys(rows[0]);
  return [header.join(","), ...rows.map((row) => header.map((key) => csvCell(row[key])).join(","))]
    .join("\n")
    .concat("\n");
}

function count(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    for (const value of String(row[key]).split(" | "))
      counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

export function toSummary(rows) {
  const table = (title, pairs) =>
    [`| ${title} | Sources |`, "| --- | ---: |", ...pairs.map(([k, n]) => `| ${k} | ${n} |`)].join(
      "\n",
    );
  const top = rows
    .filter((row) => row.tier !== "A" && row.permission !== "Not allowed")
    .slice(0, 25)
    .map(
      (row) =>
        `| ${row.source_name.replaceAll("|", "/")} | ${row.country} | ${row.provides} | ${row.score} | ${row.next_action} |`,
    );
  return [
    "# Source scorecard",
    "",
    `Generated from \`fixture-result-sources.csv\` by \`npm run sources:score\`. ${rows.length} sources scored.`,
    "Scores use registry evidence; live collection metrics adjust them once recorded in",
    "`source-live-metrics.csv`. A score never grants permission to collect.",
    "",
    "## Tiers and check frequency",
    "",
    table(
      "Tier",
      ["A", "B", "C", "Retired"].map((tier) => [
        `${tier} (${CHECK_FREQUENCY[tier]})`,
        rows.filter((row) => row.tier === tier).length,
      ]),
    ),
    "",
    "## Permission",
    "",
    table("Permission", count(rows, "permission")),
    "",
    "## What sources supply",
    "",
    table("Supplies", count(rows, "provides")),
    "",
    "## Sports covered",
    "",
    table("Sport", count(rows, "sports")),
    "",
    "## Highest-value sources not yet collected (top 25)",
    "",
    "| Source | Country | Supplies | Score | Next action |",
    "| --- | --- | --- | ---: | --- |",
    ...top,
    "",
    "## How scores work",
    "",
    "- Permission: open 30, needs review 12, manual only 5, not allowed 0",
    "- Supplies: fixtures and results 25, fixtures 20, results 16, to assess 8, reference 4",
    "- Adapter built 20, plain web page 8",
    "- Coverage: UK and Ireland 15 (UK first), global or Europe 12, other regions 8",
    "- Timing quality: provider-confirmed chip timing 10, partial 6, unknown 3",
    "- Live data, when recorded: up to +10 for volume, +5 for low rejection; -10 for no new records, down to -25 for high rejection",
    "- Tier A needs an enabled source scoring 70+; B 50+; C 30+; otherwise Retired",
    "",
  ].join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const registry = parseCsv(readFileSync(registryPath, "utf8"));
  const rows = buildScorecard(registry, loadLive());
  const csv = toCsv(rows);
  const summary = toSummary(rows);
  if (process.argv.includes("--check")) {
    const stale =
      !existsSync(scorecardPath) ||
      readFileSync(scorecardPath, "utf8") !== csv ||
      readFileSync(summaryPath, "utf8") !== summary;
    if (stale) {
      console.error("Source scorecard is out of date. Run: npm run sources:score");
      process.exit(1);
    }
    console.log(`Source scorecard is current (${rows.length} sources).`);
  } else {
    writeFileSync(scorecardPath, csv);
    writeFileSync(summaryPath, summary);
    const tiers = ["A", "B", "C", "Retired"].map(
      (tier) => `${tier}=${rows.filter((row) => row.tier === tier).length}`,
    );
    console.log(`Scored ${rows.length} sources: ${tiers.join(" ")}`);
  }
}
