#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

function replaceOnce(path, oldText, newText) {
  const current = readFileSync(path, "utf8");
  const first = current.indexOf(oldText);
  if (first < 0) throw new Error(`Expected repair block not found in ${path}: ${oldText}`);
  if (current.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error(`Repair block occurs more than once in ${path}: ${oldText}`);
  }
  writeFileSync(
    path,
    current.slice(0, first) + newText + current.slice(first + oldText.length),
    "utf8",
  );
}

replaceOnce(
  "src/lib/athrecs/catalogue-publishing-api.ts",
  "    return getCataloguePublishingDashboard();",
  "    return JSON.parse(JSON.stringify(await getCataloguePublishingDashboard()));",
);

replaceOnce(
  "src/lib/athrecs/catalogue-publishing.server.ts",
  "function jsonValue<T>(value: T | string | null): T | null {",
  "function jsonValue<T>(value: unknown): T | null {",
);

replaceOnce(
  "src/lib/athrecs/import.server.ts",
  "  options: ApplyImportOptions = {},",
  "  importOptions: ApplyImportOptions = {},",
);
replaceOnce(
  "src/lib/athrecs/import.server.ts",
  "  const sql = options.sqlOverride ?? (await getSql());",
  "  const sql = importOptions.sqlOverride ?? (await getSql());",
);
replaceOnce(
  "src/lib/athrecs/import.server.ts",
  "        if (!options.preserveExistingEvents) {",
  "        if (!importOptions.preserveExistingEvents) {",
);
replaceOnce(
  "src/lib/athrecs/import.server.ts",
  "          { ...options, sqlOverride: sql },",
  "          { ...importOptions, sqlOverride: sql },",
);

console.log("Applied generated-output TypeScript repairs.");
