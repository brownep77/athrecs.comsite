// Actual staff RPC + disposable SQL, with synthetic provider responses only.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_VERCEL_ANALYTICS_TOKEN",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "web-staff@example.test";
process.env.BETTER_AUTH_SECRET = "web-stats-synthetic-secret-at-least-32-characters";
const origin = "http://127.0.0.1:18249";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18249, strictPort: true } });
const originalFetch = globalThis.fetch;
let remoteStatus = 200,
  malformed = false,
  empty = false,
  remoteCalls = 0,
  lastHeaders;
const vercelRequests = [];
const seenQueries = [];
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  if (url.origin === origin) {
    const response = await originalFetch(input, init);
    lastHeaders = response.headers;
    return response;
  }
  assert(["api.vercel.com", "www.googleapis.com"].includes(url.hostname));
  remoteCalls++;
  assert.match(init.headers.Authorization, /^Bearer synthetic-/);
  assert.equal(init.redirect, "error");
  if (remoteStatus !== 200)
    return Response.json({ secret: "never-leak-provider-error" }, { status: remoteStatus });
  if (malformed) return Response.json({ data: { visitors: "bad", pageviews: -1 } });
  if (url.hostname === "api.vercel.com") {
    vercelRequests.push({ path: url.pathname, dimension: url.searchParams.get("by") });
    assert.equal(url.searchParams.get("projectId"), "prj_lbw3shClq8n6SThzl8i825UPBp6I");
    assert.equal(url.searchParams.get("filter"), "environment eq 'production'");
    const dimension = url.searchParams.get("by");
    const totals = { visitors: empty ? 0 : 3, pageviews: empty ? 0 : 5 };
    return Response.json({
      data: dimension
        ? empty
          ? []
          : [{ [dimension]: dimension === "environment" ? "production" : dimension === "requestPath" ? "/clubs" : "test", ...totals }]
        // Vercel's daily count endpoint omits traffic from today.
        : { visitors: 0, pageviews: 0 },
    });
  }
  if (url.pathname === "/webmasters/v3/sites")
    return Response.json({
      siteEntry: [
        { siteUrl: "sc-domain:unrelated.test", permissionLevel: "siteOwner" },
        { siteUrl: "sc-domain:athrecs.com", permissionLevel: "siteOwner" },
      ],
    });
  assert(url.pathname.includes(encodeURIComponent("sc-domain:athrecs.com")));
  const query = JSON.parse(init.body);
  seenQueries.push(query);
  assert.equal(query.dataState, "final");
  const row = { keys: query.dimensions, clicks: 2, impressions: 20, ctr: 0.1, position: 4.5 };
  return Response.json(empty ? {} : { rows: [row] });
};
let database, source;
async function rpc(name, method, data, token, extraHeaders = {}) {
  source ??= await (await originalFetch(`${origin}/src/lib/web-stats/api.ts`)).text();
  const section = source.slice(source.indexOf(`const ${name} =`));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id, `${name} compiled RPC exists`);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      context: {},
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
      },
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const service = await server.ssrLoadModule("/src/lib/web-stats/service.server.ts");
  const core = await server.ssrLoadModule("/src/lib/web-stats/core.ts");
  await sql`insert into "user"(id,name,email,"emailVerified") values('web-staff','Synthetic Staff','web-staff@example.test',true),('web-member','Synthetic Member','web-member@example.test',true)`;
  await sql`insert into session(id,token,"expiresAt","updatedAt","userId") values('web-session','web-token',now()+interval '1 day',now(),'web-staff'),('member-session','member-token',now()+interval '1 day',now(),'web-member')`;
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('web-google','web-google','google','web-staff',now(),now())`;
  for (const [name, method, data] of [
    ["getVercelStats", "GET", { days: 7 }],
    ["getGoogleSearchStats", "GET", { days: 7 }],
    ["connectVercelStats", "POST", { token: "synthetic-provider-token" }],
    ["connectGoogleSearchStats", "POST", undefined],
  ]) {
    await assert.rejects(() => rpc(name, method, data), /Unauthorized/);
    await assert.rejects(() => rpc(name, method, data, "member-token"), /Forbidden/);
    await assert.rejects(
      () => rpc(name, method, data, "web-token", { "x-forwarded-host": "www.athrecs.com" }),
      /staff host required/,
    );
    await assert.rejects(
      () =>
        rpc(name, method, data, "web-token", {
          origin: "https://untrusted.example",
          "sec-fetch-site": "cross-site",
        }),
      /Cross|Forbidden/,
    );
  }
  assert.equal(remoteCalls, 0, "Unauthorized requests never reach providers");
  await assert.rejects(() => rpc("getVercelStats", "GET", { days: 999 }, "web-token"));
  assert.equal((await rpc("getVercelStats", "GET", { days: 7 }, "web-token")).status, "connect");
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert(lastHeaders.get("x-robots-tag").includes("noindex"));
  assert.equal(
    (await rpc("getGoogleSearchStats", "GET", { days: 7 }, "web-token")).status,
    "connect",
  );
  await rpc("connectVercelStats", "POST", { token: "synthetic-provider-token" }, "web-token");
  const [saved] = await sql`select * from staff_web_stats_connections`;
  assert(!saved.credential_ciphertext.includes("synthetic-provider-token"));
  assert.equal(service.decryptCredential(saved.credential_ciphertext), "synthetic-provider-token");
  const parts = saved.credential_ciphertext.split(".");
  parts[3] = Buffer.from("tampered").toString("base64");
  assert.throws(() => service.decryptCredential(parts.join(".")));
  const visits = await rpc("getVercelStats", "GET", { days: 28 }, "web-token");
  assert.equal(visits.report.visitors, 3);
  assert.equal(visits.report.pageviews, 5);
  assert(vercelRequests.every((request) => request.path.endsWith("/aggregate")));
  assert(vercelRequests.some((request) => request.dimension === "environment"));
  assert.equal(visits.report.pages[0].label, "/clubs");
  assert.doesNotMatch(JSON.stringify(visits), /synthetic-provider-token|ciphertext|web-staff/);
  const search = await service.readGoogleReport("synthetic-google-token", { days: 28 });
  assert.equal(search.report.totals.ctr, 0.1);
  assert.equal(search.report.totals.position, 4.5);
  assert.equal(search.report.queries.length, 1);
  assert.equal(seenQueries.length, 5);
  assert.equal(
    seenQueries[0].dimensions.length,
    0,
    "Totals use an independent aggregate, never sum top queries",
  );
  assert.deepEqual(core.reportDates(7, new Date("2026-01-01T01:00:00Z")), {
    since: "2025-12-24",
    until: "2025-12-30",
  });
  assert.equal(
    core.athrecsProperty([{ siteUrl: "https://www.athrecs.com.evil.test/" }]),
    undefined,
  );
  empty = true;
  assert.equal(
    (await service.readGoogleReport("synthetic-google-token", { days: 7 })).report.totals.clicks,
    0,
  );
  assert.equal((await service.readVercelReport(sql, { days: 7 })).report.pageviews, 0);
  empty = false;
  malformed = true;
  assert.equal((await service.readVercelReport(sql, { days: 7 })).status, "error");
  malformed = false;
  remoteStatus = 403;
  assert.equal((await service.readVercelReport(sql, { days: 7 })).status, "connect");
  assert.equal(
    (await service.readGoogleReport("synthetic-google-token", { days: 7 })).status,
    "connect",
  );
  remoteStatus = 429;
  const limited = await service.readGoogleReport("synthetic-google-token", { days: 7 });
  assert.equal(limited.status, "error");
  assert.doesNotMatch(JSON.stringify(limited), /never-leak-provider-error/);
  console.log(
    "PASS: staff RPC authentication, host/CSRF controls, private caching, encrypted credentials, provider parsing, real zero vs failure, Google totals, Pacific dates, exact property matching and secret redaction.",
  );
} finally {
  globalThis.fetch = originalFetch;
  await database?.close();
  await server.close();
}
