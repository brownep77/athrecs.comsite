#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const repoRoot = process.cwd();
const required = [
  "migrations/0004_multisport_taxonomy_access.sql",
  "migrations/0005_events_results_verification.sql",
  "migrations/0006_athlete_backend_commerce.sql",
  "migrations/0007_public_compatibility_views.sql",
  "src/lib/athrecs/api.ts",
  "src/lib/athrecs/access.server.ts",
  "src/lib/athrecs/athlete-backend.ts",
  "src/lib/athrecs/multisport-public-api.ts",
  "src/lib/athrecs/multisport.types.ts",
  "src/lib/athrecs/organiser-backend.ts",
  "src/lib/athrecs/result-publication.server.ts",
  "src/lib/athrecs/results-upload.server.ts",
  "src/lib/athrecs/taxonomy-backend.ts",
  "src/lib/athrecs/transaction.server.ts",
  "src/lib/athrecs/verification-backend.ts",
  "src/lib/athrecs/workflow.server.ts",
  "scripts/harden-legacy-api.mjs",
];

let failed = false;
function fail(message) {
  failed = true;
  console.error(`ERROR: ${message}`);
}

for (const relative of required) {
  const absolute = path.join(repoRoot, relative);
  if (!fs.existsSync(absolute)) fail(`Missing ${relative}`);
}

function structurallyCheckSql(relative) {
  const text = fs.readFileSync(path.join(repoRoot, relative), "utf8");
  const parentheses = [];
  let state = "normal";
  let dollarTag = null;
  let line = 1;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1] ?? "";
    if (char === "\n") line += 1;
    if (state === "normal") {
      if (char === "-" && next === "-") {
        state = "line-comment";
        index += 1;
      } else if (char === "/" && next === "*") {
        state = "block-comment";
        index += 1;
      } else if (char === "'") {
        state = "single-quote";
      } else if (char === '"') {
        state = "double-quote";
      } else if (char === "$") {
        const match = text.slice(index).match(/^(\$\$|\$[A-Za-z_][A-Za-z0-9_]*\$)/);
        if (match) {
          dollarTag = match[1];
          state = "dollar-quote";
          index += dollarTag.length - 1;
        }
      } else if (char === "(") {
        parentheses.push(line);
      } else if (char === ")") {
        if (!parentheses.length) return fail(`${relative}: unmatched ) on line ${line}`);
        parentheses.pop();
      }
    } else if (state === "line-comment") {
      if (char === "\n") state = "normal";
    } else if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "normal";
        index += 1;
      }
    } else if (state === "single-quote") {
      if (char === "'" && next === "'") index += 1;
      else if (char === "'") state = "normal";
    } else if (state === "double-quote") {
      if (char === '"' && next === '"') index += 1;
      else if (char === '"') state = "normal";
    } else if (state === "dollar-quote" && text.startsWith(dollarTag, index)) {
      index += dollarTag.length - 1;
      dollarTag = null;
      state = "normal";
    }
  }
  if (parentheses.length) fail(`${relative}: unclosed ( from line ${parentheses.at(-1)}`);
  if (!["normal", "line-comment"].includes(state)) fail(`${relative}: unterminated ${state}`);
}


const legacyApiPath = path.join(repoRoot, "src/lib/athrecs/api.ts");
if (fs.existsSync(legacyApiPath)) {
  const legacyApi = fs.readFileSync(legacyApiPath, "utf8");
  if (!legacyApi.includes('import { authMiddleware } from "@/lib/auth/middleware";')) {
    fail("Legacy api.ts does not import authMiddleware");
  }
  if (!legacyApi.includes('import { requirePlatformRole } from "./access.server";')) {
    fail("Legacy api.ts does not import requirePlatformRole");
  }
  for (const exportName of ["importFromCsv", "importFromJson", "importResults"]) {
    const start = legacyApi.indexOf(`export const ${exportName} = createServerFn`);
    const next = start < 0 ? -1 : legacyApi.indexOf("\nexport const ", start + 1);
    const block = start < 0 ? "" : legacyApi.slice(start, next < 0 ? undefined : next);
    if (!block.includes(".middleware([authMiddleware])")) {
      fail(`${exportName} is not protected by authMiddleware`);
    }
    if (!block.includes("requirePlatformRole(context.userId")) {
      fail(`${exportName} is not restricted to Athrecs staff roles`);
    }
  }
}

function requireMarkers(relative, markers) {
  const absolute = path.join(repoRoot, relative);
  if (!fs.existsSync(absolute)) return;
  const text = fs.readFileSync(absolute, "utf8");
  for (const marker of markers) {
    if (!text.includes(marker)) fail(`${relative}: missing safety marker ${marker}`);
  }
}

requireMarkers("src/lib/athrecs/access.server.ts", [
  "export async function requireAthleteCapability",
  'const familyRelationships = new Set(["self", "parent", "guardian"]);',
  'case "view_commercial_data":',
  'case "manage_consents":',
]);
requireMarkers("src/lib/athrecs/athlete-backend.ts", [
  'action: "athlete.claim_resubmitted"',
  'action: "result.claim_resubmitted"',
  "requireAthleteCapability(",
  "and cr.record_status = 'active'",
]);
requireMarkers("src/lib/athrecs/verification-backend.ts", [
  "record_status = 'superseded'",
  "superseded_by_result_id",
  "rejectStagedSubmissionRecords",
]);
requireMarkers("migrations/0006_athlete_backend_commerce.sql", [
  "athlete_user_links_verified_self_owner_idx",
  "and cr.record_status = 'active'",
]);
requireMarkers("migrations/0007_public_compatibility_views.sql", [
  "distance_metres",
  "and cr.record_status = 'active'",
]);

const publicApiPath = path.join(
  repoRoot,
  "src/lib/athrecs/multisport-public-api.ts",
);
if (fs.existsSync(publicApiPath)) {
  const publicApi = fs.readFileSync(publicApiPath, "utf8");
  for (const privateTable of [
    "athlete_private_profiles",
    "athlete_identifiers",
    "athlete_consents",
    "product_interactions",
  ]) {
    if (publicApi.includes(privateTable)) {
      fail(`Public API directly references private table ${privateTable}`);
    }
  }
}

for (const relative of required.filter((item) => item.endsWith(".sql"))) {
  if (fs.existsSync(path.join(repoRoot, relative))) structurallyCheckSql(relative);
}

for (const relative of required.filter((item) => item.endsWith(".ts"))) {
  const absolute = path.join(repoRoot, relative);
  if (!fs.existsSync(absolute)) continue;
  const output = ts.transpileModule(fs.readFileSync(absolute, "utf8"), {
    fileName: absolute,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  });
  for (const diagnostic of output.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    fail(`${relative}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`);
  }
}

const templateDirectories = [
  path.join(repoRoot, "templates", "athrecs-multisport"),
  path.join(repoRoot, "templates"),
].filter((directory, index, all) =>
  fs.existsSync(directory) && all.indexOf(directory) === index,
);
for (const templateDir of templateDirectories) {
  for (const filename of fs.readdirSync(templateDir)) {
    if (!filename.endsWith(".json")) continue;
    try {
      JSON.parse(fs.readFileSync(path.join(templateDir, filename), "utf8"));
    } catch (error) {
      fail(`Invalid JSON template ${filename}: ${error.message}`);
    }
  }
}

if (failed) process.exit(1);
console.log("Athrecs multi-sport backend files passed structural verification.");
console.log("Next run: npm run typecheck && npm run build");
