#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  normalizePostgresConnectionString,
  postgresConnectionConfig,
  migrationConnectionString,
} from "../src/lib/postgres-connection.js";

const base = "postgresql://runner:secret@example-pooler.neon.tech/runrecs";

const migrationUrl = new URL(
  migrationConnectionString(`${base}?sslmode=require&channel_binding=require`),
);
assert.equal(migrationUrl.hostname, "example.neon.tech");
assert.equal(migrationUrl.username, "runner");
assert.equal(migrationUrl.password, "secret");
assert.equal(migrationUrl.pathname, "/runrecs");
assert.equal(migrationUrl.searchParams.get("channel_binding"), "require");
assert.equal(migrationUrl.searchParams.get("sslmode"), "require");
assert.equal(
  migrationConnectionString(
    "postgresql://runner:secret@ep-test-pooler.c-5.us-east-2.aws.neon.tech/neondb",
  ),
  "postgresql://runner:secret@ep-test.c-5.us-east-2.aws.neon.tech/neondb",
);
for (const unchanged of [
  "postgresql://runner:secret@localhost/runrecs",
  "postgresql://runner:secret@example.neon.tech/runrecs",
  "postgresql://runner:secret@example-pooler.com/runrecs",
  "postgresql://runner:secret@pooler.neon.tech.attacker.test/runrecs",
]) {
  assert.equal(migrationConnectionString(unchanged), unchanged);
}
assert.equal(
  new URL(postgresConnectionConfig(base).connectionString).hostname,
  "example-pooler.neon.tech",
  "Application traffic must retain pooling",
);

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
