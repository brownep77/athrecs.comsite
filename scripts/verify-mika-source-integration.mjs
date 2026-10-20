// Isolated rejection-path integration: no live tokens, database, or result fetches.
import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const kid = "synthetic-mika-rejection-test";
const jwk = { ...publicKey.export({ format: "jwk" }), kid };
const approvals = {};
const effects = { database: 0, seed: 0, import: 0, normalize: 0, jwks: 0 };
const forbidden = (name) => () => {
  effects[name] += 1;
  throw new Error(`Unexpected ${name} access in a registration-only test`);
};
const context = vm.createContext({
  Buffer, URL, Request, Response, AbortSignal, console,
  // The tested code never sees the caller's environment or credentials.
  process: { env: approvals },
  fetch: async (url) => {
    assert.equal(url, "https://token.actions.githubusercontent.com/.well-known/jwks");
    effects.jwks += 1;
    return Response.json({ keys: [jwk] }, {
      headers: { "cache-control": "max-age=300" },
    });
  },
});
function synthetic(name, exports) {
  return new vm.SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
  }, { context, identifier: name });
}
const modules = new Map([
  ["node:crypto", synthetic("node:crypto", crypto)],
  ["@/lib/db", synthetic("db-blocked", { getSql: forbidden("database") })],
  ["./seed.server", synthetic("seed-blocked", { ensureAthrecsSeeded: forbidden("seed") })],
  ["./results-import.server", synthetic("import-blocked", {
    applyResultsImport: forbidden("import"),
    timeToSeconds: forbidden("normalize"),
  })],
  ["@tanstack/react-router", synthetic("route-factory", {
    createFileRoute: (path) => {
      assert.equal(path, "/api/catalogue-automation");
      return (options) => options;
    },
  })],
]);
const sourcePaths = {
  "./historical-result-sources": "src/lib/athrecs/historical-result-sources.ts",
  "./github-actions-oidc.server": "src/lib/athrecs/github-actions-oidc.server.ts",
  "@/lib/athrecs/result-source-automation.server": "src/lib/athrecs/result-source-automation.server.ts",
  route: "src/routes/api/catalogue-automation.ts",
};
for (const [name, path] of Object.entries(sourcePaths)) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  });
  modules.set(name, new vm.SourceTextModule(compiled.outputText, {
    context,
    identifier: path,
    initializeImportMeta: (meta) => { meta.env = { VITE_SITE_BRAND: "athrecs" }; },
    importModuleDynamically: async (specifier) => {
      const module = resolve(specifier);
      if (module.status === "unlinked") await module.link(resolve);
      if (module.status === "linked") await module.evaluate();
      return module;
    },
  }));
}
function resolve(specifier) {
  assert.ok(modules.has(specifier), `Unexpected dependency: ${specifier}`);
  return modules.get(specifier);
}
const route = resolve("route");
await route.link(resolve);
await route.evaluate();
const post = route.namespace.Route.server.handlers.POST;

function token(overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: "https://token.actions.githubusercontent.com",
    aud: "athrecs-catalogue", exp: now + 300, iat: now, nbf: now,
    jti: "synthetic-local-rejection-test",
    repository: "brownep77/athrecs-holding", repository_id: "1123206060",
    repository_owner_id: "208288942", repository_visibility: "private",
    ref: "refs/heads/main", ref_type: "branch", sha: "a".repeat(40),
    run_id: "1", run_attempt: "1", event_name: "workflow_dispatch",
    workflow: "Refresh Athrecs race data",
    workflow_ref: "brownep77/athrecs-holding/.github/workflows/refresh-races.yml@refs/heads/main",
    runner_environment: "github-hosted", ...overrides,
  };
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const input = `${encode({ alg: "RS256", typ: "JWT", kid })}.${encode(claims)}`;
  return `${input}.${crypto.sign("RSA-SHA256", Buffer.from(input), privateKey).toString("base64url")}`;
}
const signedToken = token();
const batch = {
  sourceKey: "mika_timing_berlin_results",
  sourceUrl: "https://berlin.r.mikatiming.com/2026/",
  batchKey: "synthetic-denied-request",
  // A caller-supplied string cannot grant approval. No source approval is set.
  permissionReference: "unapproved-test-request",
  results: [{}],
};
function request({ auth = signedToken, body = batch, headers = {} } = {}) {
  return new Request("https://example.test/api/catalogue-automation?mode=historical-results", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(auth ? { authorization: `Bearer ${auth}` } : {}),
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
let checks = 0;
async function rejected(options, status, message) {
  const response = await post({ request: request(options) });
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.match(payload.error, message);
  assert.deepEqual({ ...effects, jwks: 0 }, {
    database: 0, seed: 0, import: 0, normalize: 0, jwks: 0,
  });
  checks += 1;
}
await rejected({ auth: null }, 401, /OIDC bearer token is required/);
await rejected({ auth: "invalid" }, 401, /token is malformed/);
const tokenParts = signedToken.split(".");
const invalidSignature = Buffer.from(tokenParts[2], "base64url");
invalidSignature[0] ^= 1;
await rejected({ auth: `${tokenParts[0]}.${tokenParts[1]}.${invalidSignature.toString("base64url")}` }, 401, /signature is invalid/);
await rejected({ auth: token({ exp: Math.floor(Date.now() / 1000) - 60 }) }, 401, /expired/);
await rejected({ auth: token({ aud: "untrusted-test-audience" }) }, 401, /workflow and audience are not trusted/);
await rejected({ auth: token({ repository_id: "0" }) }, 401, /repository ID is not trusted/);
await rejected({}, 403, /blocked until this source is approved/);
approvals.ATHRECS_RESULT_SOURCE_APPROVALS_JSON = "{}";
await rejected({}, 403, /blocked until this source is approved/);
approvals.ATHRECS_RESULT_SOURCE_APPROVALS_JSON = JSON.stringify({ mika_timing_berlin_results: { permissionReference: " " } });
await rejected({}, 403, /blocked until this source is approved/);
approvals.ATHRECS_RESULT_SOURCE_APPROVALS_JSON = "{";
await rejected({}, 500, /approvals are misconfigured/);
delete approvals.ATHRECS_RESULT_SOURCE_APPROVALS_JSON;
await rejected({ body: { ...batch, sourceKey: "unregistered-test-source" } }, 422, /not an approved source/);
await rejected({ body: { ...batch, sourceUrl: "https://berlin.r.mikatiming.com/2025/" } }, 422, /does not match/);
await rejected({ body: { ...batch, sourceUrl: "https://example.test/2026/" } }, 422, /does not match/);
await rejected({ body: { ...batch, sourceUrl: "https://test@example.test/2026/" } }, 422, /credential-free HTTPS/);
await rejected({ body: { ...batch, permissionReference: "" } }, 422, /permissionReference is required/);
await rejected({ headers: { "content-type": "text/plain" } }, 415, /must be application\/json/);
await rejected({ headers: { "content-length": "2000001" } }, 413, /too large/);
await rejected({ body: " ".repeat(2_000_001) }, 413, /empty or too large/);
await rejected({ body: "" }, 413, /empty or too large/);
await rejected({ body: "{" }, 400, /not valid JSON/);
assert.equal(effects.jwks, 1, "OIDC uses only the in-memory synthetic JWKS response");
console.log(`Berlin source integration: ${checks} rejection checks passed; zero database, seed, import or row-normalization calls. No live authentication or adapter audit is claimed.`);
