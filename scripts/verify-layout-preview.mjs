#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  LAYOUT_PREVIEW_BRANCH,
  layoutPreviewBuildEnv,
  layoutPreviewBuildRequested,
  writeLayoutPreviewOutput,
} from "./build-layout-preview.mjs";
import {
  layoutPreviewBlockedResponse,
  layoutPreviewRequestStatus,
} from "../src/lib/layout-preview-policy.ts";

assert.equal(layoutPreviewBuildRequested({}, ["--preview"]), true);
assert.equal(
  layoutPreviewBuildRequested({
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: LAYOUT_PREVIEW_BRANCH,
  }),
  true,
);
assert.equal(
  layoutPreviewBuildRequested({ VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "main" }),
  false,
);
assert.throws(
  () =>
    layoutPreviewBuildRequested({
      VERCEL_ENV: "production",
      VERCEL_GIT_COMMIT_REF: LAYOUT_PREVIEW_BRANCH,
    }),
  /production/,
);
assert.throws(
  () => layoutPreviewBuildRequested({ VERCEL_ENV: "production" }, ["--preview"]),
  /production/,
);
assert.throws(
  () => layoutPreviewBuildRequested({ VERCEL: "1", VITE_ATHRECS_LAYOUT_PREVIEW: "true" }),
  /restricted/,
);
assert.throws(
  () => layoutPreviewBuildRequested({ VERCEL_GIT_COMMIT_REF: "main" }, ["--preview"]),
  /restricted/,
);

const inherited = {
  DATABASE_URL: "postgresql://synthetic@127.0.0.1:1/never-connect",
  DATABASE_URL_UNPOOLED: "postgresql://synthetic@127.0.0.1:1/never-connect",
  POSTGRES_URL: "postgresql://synthetic@127.0.0.1:1/never-connect",
  POSTGRES_URL_NON_POOLING: "postgresql://synthetic@127.0.0.1:1/never-connect",
  ATHRECS_ASSISTANT_VERIFY_PROVIDER: "true",
};
const clean = layoutPreviewBuildEnv(inherited);
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
]) {
  assert.equal(clean[key], "");
  assert.notEqual(inherited[key], "");
}
assert.equal(clean.VITE_ATHRECS_LAYOUT_PREVIEW, "true");
assert.equal(clean.ATHRECS_ASSISTANT_VERIFY_PROVIDER, "false");

for (const pathname of [
  "/",
  "/running",
  "/running/guides",
  "/running/canada-marathons",
  "/en/new-zealand",
  "/brands",
  "/_serverFn/public-read",
]) {
  assert.equal(layoutPreviewRequestStatus("GET", pathname), null, pathname);
  assert.equal(layoutPreviewRequestStatus("HEAD", pathname), null, pathname);
}
for (const pathname of [
  "/api/signup-alerts",
  "/api/race-collector-worker",
  "/api/auth/sign-in/email",
  "/auth/popup",
  "/admin",
  "/admin/fixture-import",
  "/my-athlete-profile",
  "/brands/register",
  "/clubs/account",
  "/%61pi/signup-alerts",
  "/api%2fsignup-alerts",
]) {
  assert.equal(layoutPreviewRequestStatus("GET", pathname), 403, pathname);
}
for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
  assert.equal(layoutPreviewRequestStatus(method, "/_serverFn/any-action"), 405);
}
assert.equal(layoutPreviewRequestStatus("POST", "/api/event-calendar"), null);
assert.equal(layoutPreviewRequestStatus("PUT", "/api/event-calendar"), 405);
assert.equal(layoutPreviewRequestStatus("POST", "/api/event-calendar/other"), 405);
assert.equal(layoutPreviewRequestStatus("POST", "/api/signup-alerts"), 405);
const blocked = layoutPreviewBlockedResponse("POST", 405);
assert.equal(blocked.status, 405);
assert.equal(blocked.headers.get("allow"), "GET, HEAD");
assert.match(blocked.headers.get("x-robots-tag"), /noindex/);
assert.equal(await layoutPreviewBlockedResponse("HEAD", 403).text(), "");

const temporaryOutput = await mkdtemp(path.join(os.tmpdir(), "athrecs-layout-output-"));
try {
  await mkdir(path.join(temporaryOutput, "static"));
  await writeFile(
    path.join(temporaryOutput, "config.json"),
    JSON.stringify({
      version: 3,
      routes: [{ handle: "filesystem" }],
      crons: [{ path: "/api/signup-alerts", schedule: "* * * * *" }],
    }),
  );
  await writeLayoutPreviewOutput(temporaryOutput);
  const output = JSON.parse(await readFile(path.join(temporaryOutput, "config.json"), "utf8"));
  assert.deepEqual(output.crons, []);
  assert.equal(output.routes[0].headers["X-AthRecs-Layout-Preview"], "1");
  assert.deepEqual(output.routes[1], { handle: "filesystem" });
  assert.equal(
    await readFile(path.join(temporaryOutput, "static/robots.txt"), "utf8"),
    "User-agent: *\nDisallow: /\n",
  );
} finally {
  await rm(temporaryOutput, { recursive: true, force: true });
}
console.log(
  "Layout preview build gates, database-variable isolation, request policy and deployment output verified.",
);

if (!process.argv.includes("--runtime")) process.exit(0);

// Exercise the compiled flag with a hostile synthetic database URL. Only the
// disposable PGlite instance and loopback HTTP requests may be used by this test.
Object.assign(process.env, inherited, {
  VITE_ATHRECS_LAYOUT_PREVIEW: "true",
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: LAYOUT_PREVIEW_BRANCH,
  VITE_AUTH_ENABLED: "false",
  VITE_SITE_BRAND: "athrecs",
});
const { createServer } = await import("vite");
const origin = "http://127.0.0.1:18267";
const originalFetch = globalThis.fetch;
let outboundCalls = 0;
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  if (url.origin !== origin) {
    outboundCalls += 1;
    throw new Error("Layout preview isolation test blocked an external request.");
  }
  return originalFetch(input, init);
};
let server, database;
try {
  server = await createServer({
    server: { host: "127.0.0.1", port: 18267, strictPort: true },
    logLevel: "warn",
  });
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  assert.equal(db.dbSource, "pglite");
  database = await db.getPglite();
  const sql = await db.getSql();
  const migrations = await sql.query("select count(*)::int as count from _migrations");
  assert(migrations[0].count > 0);

  const auth = await server.ssrLoadModule("/src/lib/auth/server.ts");
  assert.equal(auth.authConfigured, false);
  const verification = await server.ssrLoadModule("/src/lib/auth/verify.server.ts");
  assert.equal(await verification.getSessionUser(), null);
  await assert.rejects(() => verification.requireUserId(), /Unauthorized/);

  for (const pathname of [
    "/api/signup-alerts",
    "/api/race-collector-worker",
    "/api/auth/sign-in/email",
    "/auth/popup",
    "/admin/fixture-import",
  ]) {
    const response = await fetch(`${origin}${pathname}`);
    assert.equal(response.status, 403, pathname);
    assert.equal(response.headers.get("x-athrecs-layout-preview"), "1");
  }
  const mutation = await fetch(`${origin}/_serverFn/not-an-action`, {
    method: "POST",
    body: "synthetic",
  });
  assert.equal(mutation.status, 405);
  for (const [pathname, heading] of [
    ["/", /Find your next running race/],
    ["/sports/track-and-field", /Your next track (?:&amp;|&) field meeting/],
  ]) {
    const started = performance.now();
    const response = await fetch(`${origin}${pathname}`, { signal: AbortSignal.timeout(180_000) });
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers.get("x-athrecs-layout-preview"), "1");
    const html = await response.text();
    assert.match(html, heading, pathname);
    assert.match(
      html,
      /<article class="compact-fixture-row/,
      `${pathname} renders actual fixture rows`,
    );
    assert.doesNotMatch(
      html,
      /Fixtures are temporarily unavailable|Running fixtures are temporarily unavailable/,
    );
    console.log(
      `Preview SSR ${pathname}: fixture rows rendered in ${Math.round(performance.now() - started)} ms.`,
    );
  }
  const seeded = await sql.query(
    "select (select count(*)::int from events) as events, (select count(*)::int from editions) as editions",
  );
  assert(seeded[0].events > 0 && seeded[0].editions > 0);
  console.log(
    `Disposable preview catalogue: ${seeded[0].events} events / ${seeded[0].editions} editions.`,
  );
  const calendar = await fetch(`${origin}/api/event-calendar`, {
    method: "POST",
    body: new URLSearchParams({
      race: JSON.stringify({
        id: "synthetic-preview-race",
        name: "Synthetic calendar test",
        date: "2027-05-01",
        pageUrl: `${origin}/running/events`,
      }),
    }),
  });
  assert.equal(calendar.status, 200);
  assert.match(calendar.headers.get("content-type"), /text\/calendar/);
  assert.match(await calendar.text(), /BEGIN:VCALENDAR/);
  const robots = await fetch(`${origin}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \//);
  assert.equal(outboundCalls, 0);
  console.log(
    "Compiled preview uses PGlite despite inherited database URLs; auth, HTTP mutations and worker/email endpoints are blocked.",
  );
} finally {
  await server?.close();
  await database?.close();
  globalThis.fetch = originalFetch;
}
