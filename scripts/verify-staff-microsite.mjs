import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  isPermittedStaffHostname,
  normalizeHostname,
  parseStaffEmails,
} from "../src/lib/auth/staff-config.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

assert.deepEqual(
  parseStaffEmails(" Owner@Example.com,editor@example.com\nOWNER@example.com "),
  ["owner@example.com", "editor@example.com"],
);
assert.equal(normalizeHostname("UPDATE.ATHRECS.COM:443"), "update.athrecs.com");
assert.equal(isPermittedStaffHostname("update.athrecs.com"), true);
assert.equal(isPermittedStaffHostname("localhost:8080"), true);
assert.equal(isPermittedStaffHostname("athrecs-staff.vercel.app"), true);
assert.equal(isPermittedStaffHostname("www.athrecs.com"), false);
assert.equal(isPermittedStaffHostname("update.athrecs.com.example.org"), false);

const appShell = await readFile(resolve(root, "src/components/layout/AppShell.tsx"), "utf8");
assert.doesNotMatch(appShell, /label:\s*["']Update["']/);
assert.match(appShell, /StaffMicrositeShell/);

const authServer = await readFile(resolve(root, "src/lib/auth/server.ts"), "utf8");
assert.match(authServer, /GOOGLE_CLIENT_ID/);
assert.match(authServer, /GOOGLE_CLIENT_SECRET/);
assert.match(authServer, /socialProviders:\s*\{/);
assert.match(authServer, /google:\s*\{/);
assert.match(authServer, /brokerConfigured/);

const authClient = await readFile(resolve(root, "src/lib/auth/client.ts"), "utf8");
assert.match(authClient, /signIn\.social\(\{/);
assert.match(authClient, /provider:\s*["']google["']/);

const staffAuth = await readFile(resolve(root, "src/lib/auth/staff.server.ts"), "utf8");
assert.match(staffAuth, /["']google["']/);
assert.match(staffAuth, /["']grok-google["']/);

const adminApi = await readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8");
for (const functionName of [
  "getDbStatus",
  "getBulkSourceRun",
  "listFixtureSources",
  "queueBulkSourceRun",
  "getScraperWorkbookImport",
  "uploadScraperWorkbookNow",
  "importFromCsv",
  "importFromJson",
  "importResults",
  "listAdminEventCards",
]) {
  const start = adminApi.indexOf(`export const ${functionName}`);
  assert.notEqual(start, -1, `${functionName} must exist`);
  const nextExport = adminApi.indexOf("export const ", start + 20);
  const definition = adminApi.slice(start, nextExport === -1 ? undefined : nextExport);
  assert.match(definition, /middleware\(\[staffMiddleware\]\)/, `${functionName} must be staff-only`);
}

for (const relativePath of [
  "src/lib/athrecs/fixture-review-api.ts",
  "src/lib/athrecs/results-links-api.ts",
]) {
  const source = await readFile(resolve(root, relativePath), "utf8");
  assert.doesNotMatch(source, /authMiddleware/);
  const serverFunctions = source.match(/export const \w+ = createServerFn/g)?.length ?? 0;
  const staffGuards = source.match(/middleware\(\[staffMiddleware\]\)/g)?.length ?? 0;
  assert.equal(staffGuards, serverFunctions, `${relativePath} must protect every server function`);
}

const vercel = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
const staffRedirect = vercel.redirects?.find(
  (rule) =>
    rule.source === "/" &&
    rule.destination === "/admin" &&
    rule.has?.some(
      (condition) => condition.type === "host" && condition.value === "update.athrecs.com",
    ),
);
assert.ok(staffRedirect, "the staff hostname root must redirect to /admin");

console.log("Staff microsite verification passed");
