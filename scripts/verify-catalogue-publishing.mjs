#!/usr/bin/env node
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
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
  "src/lib/athrecs/github-actions-oidc.server.ts": [
    "token.actions.githubusercontent.com",
    "athrecs-catalogue",
    "brownep77/athrecs-holding",
    "1123206060",
    "refresh-races.yml@refs/heads/main",
    "verifyGitHubActionsOidcToken",
    "verifySignature",
  ],
  "src/lib/athrecs/catalogue-automation.server.ts": [
    "verifyGitHubActionsOidcToken",
    "stageCatalogueBatch",
    "validateCatalogueBatch",
    "MAX_BODY_BYTES",
    "MAX_EVENTS",
    "MAX_EDITIONS",
    "sourceUrl does not match this workflow run",
  ],
  "src/routes/api/catalogue-automation.ts": [
    'createFileRoute("/api/catalogue-automation")',
    "handleAutomatedCatalogueRequest",
    "POST",
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

const automation = await readFile("src/lib/athrecs/catalogue-automation.server.ts", "utf8");
for (const forbidden of ["publishCatalogueBatch", "publishCatalogueImport", "rollbackCatalogueRevision"]) {
  if (automation.includes(forbidden)) {
    failures.push(`src/lib/athrecs/catalogue-automation.server.ts: automation must not contain ${forbidden}`);
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

const {
  ATHRECS_CATALOGUE_OIDC_AUDIENCE,
  verifyGitHubActionsOidcToken,
} = await import("../src/lib/athrecs/github-actions-oidc.server.ts");

const now = 1_787_557_800;
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = publicKey.export({ format: "jwk" });
jwk.kid = "athrecs-test-key";
jwk.alg = "RS256";
jwk.use = "sig";

function tokenFor(overrides = {}) {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT", kid: jwk.kid }),
  ).toString("base64url");
  const claims = {
    iss: "https://token.actions.githubusercontent.com",
    aud: ATHRECS_CATALOGUE_OIDC_AUDIENCE,
    exp: now + 300,
    nbf: now - 5,
    iat: now - 5,
    jti: "test-jti",
    repository: "brownep77/athrecs-holding",
    repository_id: "1123206060",
    repository_owner_id: "208288942",
    repository_visibility: "private",
    ref: "refs/heads/main",
    ref_type: "branch",
    sha: "a".repeat(40),
    run_id: "32702813259",
    run_attempt: "1",
    event_name: "schedule",
    workflow: "Refresh Athrecs race data",
    workflow_ref:
      "brownep77/athrecs-holding/.github/workflows/refresh-races.yml@refs/heads/main",
    runner_environment: "github-hosted",
    ...overrides,
  };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const input = `${header}.${payload}`;
  const signature = sign("RSA-SHA256", Buffer.from(input), privateKey).toString("base64url");
  return `${input}.${signature}`;
}

const claims = await verifyGitHubActionsOidcToken(tokenFor(), { now, jwks: [jwk] });
assert.equal(claims.repository, "brownep77/athrecs-holding");
assert.equal(claims.ref, "refs/heads/main");
await assert.rejects(
  verifyGitHubActionsOidcToken(tokenFor({ ref: "refs/heads/untrusted" }), {
    now,
    jwks: [jwk],
  }),
  /ref is not trusted/,
);
await assert.rejects(
  verifyGitHubActionsOidcToken(tokenFor({ workflow_ref: "brownep77/athrecs-holding/.github/workflows/other.yml@refs/heads/main" }), {
    now,
    jwks: [jwk],
  }),
  /workflow ref is not trusted/,
);

console.log("Catalogue publishing verification passed, including review-only GitHub Actions OIDC staging.");
