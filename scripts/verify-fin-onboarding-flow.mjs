import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { signupDetails } from "./fixtures/signup-details.mjs";
import { athleteAuthDestination, safeAuthCallback } from "../src/lib/auth/auth-methods.ts";

// Real email-code authentication, Fin HTTP action and authenticated RPC. All
// data is synthetic PGlite; delivery is intercepted and external fetch is denied.
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "VERCEL_ENV",
  "ATHRECS_STAFF_EMAILS",
  "ATHRECS_CLAIMS_EMAILS",
  "INTERCOM_SECRET_KEY",
  "VITE_INTERCOM_APP_ID",
])
  process.env[key] = "";
process.env.NODE_ENV = "test";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = "synthetic-fin-flow-resend";
process.env.AUTH_EMAIL_FROM = "AthRecs Test <accounts@example.test>";
process.env.BETTER_AUTH_SECRET = "synthetic-fin-flow-authentication-secret-32-characters";
process.env.ATHRECS_FIN_ENABLED = "true";
process.env.ATHRECS_FIN_CONNECTOR_SECRET = "synthetic-fin-flow-connector-secret-32-characters";
const origin = "http://127.0.0.1:18209";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const realFetch = globalThis.fetch;
const sent = [];
let lastRpcResponse;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const message = JSON.parse(init.body);
    assert(message.to.every((address) => address.endsWith("@example.test")));
    sent.push(message);
    return Response.json({ id: `synthetic-fin-message-${sent.length}` });
  }
  assert(url.startsWith(`${origin}/`), `Unexpected external request to ${new URL(url).origin}`);
  const response = await realFetch(input, init);
  if (url.includes("/_serverFn/")) lastRpcResponse = response.clone();
  return response;
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18209, strictPort: true } });
let database;
let nextIp = 1;
const modules = new Map();

async function rpc(data, token, extraHeaders = {}) {
  const file = "athrecs/fin-onboarding-api";
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf("const resumeFinOnboarding =");
  assert(start >= 0);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(id);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method: "POST",
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
      },
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}

async function authPost(path, body) {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": `127.3.0.${nextIp++}`,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}
async function register(email, name) {
  const sentResponse = await authPost("email-otp/send-verification-otp", {
    email,
    type: "sign-in",
  });
  assert.equal(sentResponse.status, 200, await sentResponse.clone().text());
  const code = sent
    .findLast((message) => message.to.includes(email))
    ?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(code, "The synthetic mailbox receives an actual OTP through the delivery adapter");
  const response = await authPost("sign-in/email-otp", {
    ...signupDetails(name),
    email,
    otp: code,
  });
  assert.equal(response.status, 200, await response.clone().text());
  const account = await response.json();
  assert.equal(account.user.emailVerified, true);
  return account;
}
async function signupLink(requestId) {
  const response = await fetch(`${origin}/api/fin/actions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.ATHRECS_FIN_CONNECTOR_SECRET}`,
    },
    body: JSON.stringify({
      action: "create_signup_link",
      requestId,
      racingName: "Synthetic Fin Runner",
      eventName: "Synthetic Autumn 10K",
      year: 2024,
    }),
  });
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  return response.json();
}
function assertRpcPrivacy() {
  assert.equal(lastRpcResponse.headers.get("cache-control"), "private, no-store");
  assert.equal(lastRpcResponse.headers.get("referrer-policy"), "no-referrer");
}

try {
  await server.listen();
  const dbModule = await server.ssrLoadModule("/src/lib/db.ts");
  database = await dbModule.getPglite();
  const sql = await dbModule.getSql();
  const link = await signupLink("synthetic-fin-flow-request-001");
  assert.deepEqual(await signupLink("synthetic-fin-flow-request-001"), link);
  const continuation = new URL(link.signupUrl).searchParams.get("continuation");
  assert(continuation);
  assert.equal((await sql`select count(*)::int as n from "user"`)[0].n, 0);
  assert.equal((await sql`select count(*)::int as n from fin_assisted_signups`)[0].n, 0);
  const callback = `/join?step=profile&continuation=${continuation}`;
  assert.equal(safeAuthCallback(callback), callback);
  assert.equal(athleteAuthDestination(callback, true), callback);
  assert.equal(
    athleteAuthDestination("/claim-results?resultId=42", true),
    "/claim-results?resultId=42",
  );
  assert.equal(safeAuthCallback("https://example.test/steal"), "/athlete-account");

  await assert.rejects(rpc({ continuation }), /Unauthorized/);
  assertRpcPrivacy();
  const account = await register("fin-flow-runner@example.test", "Synthetic Fin Runner");
  assert.equal(
    (await sql`select count(*)::int as n from fin_assisted_signups`)[0].n,
    0,
    "Creating a verified account alone does not claim a handoff or count a resumed Fin signup",
  );
  const before = await sql`select
    (select count(*) from athlete_account_links)::int as links,
    (select count(*) from result_claims)::int as claims,
    (select count(*) from athlete_external_match_searches)::int as external_searches,
    (select count(*) from athlete_result_matching_settings)::int as matching_settings`;
  await assert.rejects(
    rpc({ continuation }, account.token, { "sec-fetch-site": "cross-site" }),
    /cross-site/,
  );
  assertRpcPrivacy();
  await assert.rejects(rpc({ continuation, userId: "someone-else" }, account.token));
  assertRpcPrivacy();
  assert.equal((await sql`select count(*)::int as n from fin_assisted_signups`)[0].n, 0);
  const resumed = await rpc({ continuation }, account.token);
  assertRpcPrivacy();
  assert.equal(resumed.status, "ready");
  assert.equal(resumed.accountStatus, "verified_new_signup");
  assert.equal(resumed.racingName, "Synthetic Fin Runner");
  assert.equal(resumed.eventName, "Synthetic Autumn 10K");
  assert.equal(resumed.year, 2024);
  assert.deepEqual(await rpc({ continuation }, account.token), resumed);
  const after = await sql`select
    (select count(*) from athlete_account_links)::int as links,
    (select count(*) from result_claims)::int as claims,
    (select count(*) from athlete_external_match_searches)::int as external_searches,
    (select count(*) from athlete_result_matching_settings)::int as matching_settings`;
  assert.deepEqual(
    after,
    before,
    "Continuation changes no ownership, claims, external searches or saved consent",
  );
  assert.equal((await sql`select count(*)::int as n from fin_assisted_signups`)[0].n, 1);
  assert(!JSON.stringify(resumed).includes("@example.test"));

  const laterLink = await signupLink("synthetic-fin-flow-request-002");
  const later = new URL(laterLink.signupUrl).searchParams.get("continuation");
  const existing = await rpc({ continuation: later }, account.token);
  assert.equal(existing.accountStatus, "existing_account");
  assert.equal((await sql`select count(*)::int as n from fin_assisted_signups`)[0].n, 1);
  const other = await register("fin-flow-other@example.test", "Synthetic Other Runner");
  assert.deepEqual(await rpc({ continuation }, other.token), { status: "unavailable" });
  assert.equal((await sql`select count(*)::int as n from fin_assisted_signups`)[0].n, 1);
  const cleanup = await fetch(`${origin}/api/fin/cleanup`);
  assert.equal(cleanup.status, 401);
  assert.equal(cleanup.headers.get("cache-control"), "private, no-store");

  console.log(
    "Fin onboarding flow passed: real connector, OTP registration, authenticated/same-origin resume, one signup receipt, existing-account and cross-account isolation; all delivery intercepted.",
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
