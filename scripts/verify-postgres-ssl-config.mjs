#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  normalizePostgresConnectionString,
  postgresConnectionConfig,
} from "../src/lib/postgres-connection.js";

const base = "postgresql://runner:secret@example-pooler.neon.tech/runrecs";

for (const legacyMode of ["prefer", "require", "verify-ca"]) {
  const normalized = new URL(
    normalizePostgresConnectionString(`${base}?sslmode=${legacyMode}&channel_binding=require`),
  );
  assert.equal(normalized.searchParams.get("sslmode"), "verify-full");
  assert.equal(normalized.searchParams.get("channel_binding"), "require");
}

assert.equal(
  new URL(normalizePostgresConnectionString(`${base}?sslmode=verify-full`)).searchParams.get(
    "sslmode",
  ),
  "verify-full",
);
assert.equal(
  new URL(normalizePostgresConnectionString(`${base}?sslmode=no-verify`)).searchParams.get(
    "sslmode",
  ),
  "no-verify",
);
assert.equal(
  new URL(
    normalizePostgresConnectionString(`${base}?uselibpqcompat=true&sslmode=require`),
  ).searchParams.get("sslmode"),
  "require",
);

assert.deepEqual(postgresConnectionConfig(base), {
  connectionString: base,
  ssl: true,
});
assert.deepEqual(postgresConnectionConfig("postgresql://runner:secret@localhost/runrecs"), {
  connectionString: "postgresql://runner:secret@localhost/runrecs",
});
assert.equal(postgresConnectionConfig(`${base}?sslmode=require`, { max: 1 }).max, 1);

const [databaseSource, authSource, migrationSource] = await Promise.all([
  readFile(new URL("../src/lib/db.ts", import.meta.url), "utf8"),
  readFile(new URL("../src/lib/auth/server.ts", import.meta.url), "utf8"),
  readFile(new URL("./migrate.mjs", import.meta.url), "utf8"),
]);
for (const [name, source] of [
  ["catalogue", databaseSource],
  ["authentication", authSource],
  ["migration", migrationSource],
]) {
  assert.match(
    source,
    /postgresConnectionConfig\(/,
    `${name} PostgreSQL path must use the shared explicit TLS config`,
  );
}

console.log("PostgreSQL SSL configuration verification passed.");
