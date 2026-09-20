import fs from "node:fs";
import { auditResults } from "./lib/result-evidence-audit.mjs";

const [resultsPath, sourcesPath, outputPath, mode] = process.argv.slice(2);
if (!resultsPath || !sourcesPath || !outputPath)
  throw new Error(
    "Usage: node scripts/audit-result-evidence.mjs RESULTS.json OFFICIAL-SOURCES.json OUTPUT.json [--strict]",
  );
const audit = auditResults(
  JSON.parse(fs.readFileSync(resultsPath, "utf8")),
  JSON.parse(fs.readFileSync(sourcesPath, "utf8")),
);
fs.writeFileSync(outputPath, JSON.stringify(audit, null, 2) + "\n");
console.log(JSON.stringify({ scope: audit.scope, flagCounts: audit.flagCounts }, null, 2));
// Strict mode is a pre-import stop, not permission to alter existing records.
if (
  mode === "--strict" &&
  (audit.scope.untestedResults ||
    audit.issues.length ||
    audit.comparisons.some((c) => c.flags.length))
)
  process.exitCode = 1;
