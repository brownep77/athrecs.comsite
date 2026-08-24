#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const required = {
  "migrations/0016_catalogue_publishing.sql": [
    "catalogue_import_batches",
    "catalogue_staged_rows",
    "catalogue_revisions",
    "catalogue_change_log",
    "catalogue_publish_state",
  ],
  "src/lib/athrecs/catalogue-publishing.server.ts": [
    "stageCatalogueBatch",
    "validateCatalogueBatch",
    "publishCatalogueBatch",
    "rollbackCatalogueRevision",
    "assertSnapshotUnchanged",
    "preserveExistingPrimaryEntry",
    ".transaction(",
    "for update",
  ],
  "src/lib/athrecs/catalogue-publishing-api.ts": [
    "staffMiddleware",
    "stageCatalogueImport",
    "validateCatalogueImport",
    "publishCatalogueImport",
    "rollbackCatalogueImport",
  ],
  "src/routes/admin/catalogue-publishing.tsx": [
    "Staged catalogue publishing",
    "Validate",
    "Publish",
    "Roll back",
    "window.prompt",
    "PUBLISH ",
    "ROLLBACK ",
  ],
};

const failures = [];
for (const [path, patterns] of Object.entries(required)) {
  let content = "";
  try {
    content = await readFile(path, "utf8");
  } catch {
    failures.push(`${path}: missing`);
    continue;
  }
  for (const pattern of patterns) {
    if (!content.includes(pattern)) failures.push(`${path}: missing ${pattern}`);
  }
}

const importServer = await readFile("src/lib/athrecs/import.server.ts", "utf8");
for (const pattern of [
  "type Sql",
  "sqlOverride",
  "preserveExistingEvents",
  "preserveExistingPrimaryEntry",
]) {
  if (!importServer.includes(pattern)) {
    failures.push(`src/lib/athrecs/import.server.ts: missing ${pattern}`);
  }
}

const adminPage = await readFile("src/routes/admin/catalogue-publishing.tsx", "utf8");
for (const forbidden of ["https://example.org", "Example 10K"]) {
  if (adminPage.includes(forbidden)) {
    failures.push(`src/routes/admin/catalogue-publishing.tsx: publishable sample remains: ${forbidden}`);
  }
}

const migrator = await readFile("scripts/migrate.mjs", "utf8");
for (const pattern of [
  "strictMigrations",
  'process.env.VERCEL_ENV === "production"',
  "isTransientDbError(err) && !strictMigrations",
]) {
  if (!migrator.includes(pattern)) failures.push(`scripts/migrate.mjs: missing ${pattern}`);
}

if (failures.length) {
  console.error("Catalogue publishing verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Catalogue publishing verification passed.");
