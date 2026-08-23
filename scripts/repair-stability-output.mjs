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
  "src/lib/athrecs/catalogue-publishing.server.ts",
  '  return typeof value === "string" ? (JSON.parse(value) as T) : value;',
  '  return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);',
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

replaceOnce(
  "src/routes/admin/catalogue-publishing.tsx",
  'import { Button } from "@/components/ui/button";\n\nexport const Route',
  `import { Button } from "@/components/ui/button";\n\ntype CatalogueBatchRow = {\n  id: string;\n  sourceKey: string;\n  status: string;\n  error: string | null;\n  counts: { events: number; editions: number };\n  validationSummary: { errors?: unknown[] } | null;\n};\n\ntype CatalogueRevisionRow = {\n  id: number;\n  batchId: string;\n  publishedAt: string;\n  status: string;\n};\n\nexport const Route`,
);
replaceOnce(
  "src/routes/admin/catalogue-publishing.tsx",
  "  const batches = dashboard.data?.batches ?? [];",
  "  const batches = (dashboard.data?.batches ?? []) as CatalogueBatchRow[];",
);
replaceOnce(
  "src/routes/admin/catalogue-publishing.tsx",
  "  const revisions = dashboard.data?.revisions ?? [];",
  "  const revisions = (dashboard.data?.revisions ?? []) as CatalogueRevisionRow[];",
);

console.log("Applied generated-output TypeScript repairs.");
