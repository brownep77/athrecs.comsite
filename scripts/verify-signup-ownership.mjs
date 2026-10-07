import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// Real auth endpoints and profile RPCs; only email delivery is intercepted.
// Never send a test email or use a configured external database.
const delivery = !process.argv.includes("--no-email");
process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = delivery ? "test-resend-key" : "";
process.env.AUTH_EMAIL_FROM = "ATHRECS Test <accounts@example.test>";
process.env.ATHRECS_CLAIMS_EMAILS = "";
process.env.ATHRECS_STAFF_EMAILS = "";
const origin = "http://127.0.0.1:18341";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = "test-only-authentication-secret-at-least-32-characters";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
for (const provider of ["GOOGLE", "LINKEDIN", "MICROSOFT", "FACEBOOK", "TWITTER"]) {
  process.env[`${provider}_CLIENT_ID`] = `test-${provider.toLowerCase()}`;
  process.env[`${provider}_CLIENT_SECRET`] = `test-${provider.toLowerCase()}-secret`;
}
process.env.APPLE_CLIENT_ID = "test.athrecs.web";
process.env.APPLE_TEAM_ID = "TESTTEAM01";
process.env.APPLE_KEY_ID = "TESTKEY001";
process.env.APPLE_PRIVATE_KEY = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
}).privateKey;
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    assert(delivery, "Disabled email delivery must never be called");
    const email = JSON.parse(init.body);
    assert(email.to.every((to) => to.endsWith("@example.test")));
    sent.push(email);
    return Response.json({ id: `test-email-${sent.length}` });
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18341, strictPort: true } });
let database;
let ipCounter = 1;
async function post(path, body, headers = {}) {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": `127.1.0.${ipCounter++}`,
      ...headers,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}
const modules = new Map();
async function rpc(file, name, data, token, requestHeaders = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} is exposed through the real RPC transport`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...requestHeaders,
      },
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
async function sendCode(email) {
  const response = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(response.status, 200, await response.text());
  const message = sent.findLast((mail) => mail.to.includes(email));
  const code = message?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(code, "A six-digit code must reach the email adapter");
  return code;
}
const findings = [];
async function check(name, action) {
  try {
    const evidence = await action();
    findings.push({ name, status: "PASS", evidence });
  } catch (error) {
    findings.push({ name, status: "FAIL", error: error.message });
  }
  console.log(JSON.stringify(findings.at(-1)));
}
try {
  await server.listen();
  // Enable production rate limiting while retaining the isolated local database.
  process.env.NODE_ENV = "production";
  database = await (await server.ssrLoadModule("/src/lib/db.ts")).getPglite();
  const sql = await (await server.ssrLoadModule("/src/lib/db.ts")).getSql();
  await rpc("auth/auth-methods-api", "getAvailableAuthMethods");
  const login = async (email) => {
    const r = await post("sign-in/email-otp", { email, otp: await sendCode(email) });
    assert.equal(r.status, 200, await r.clone().text());
    return r.json();
  };
  const a = await login("audit-a@example.test");
  await rpc(
    "athrecs/athlete-account-api",
    "saveMyAthleteRacingName",
    { fullName: "Synthetic Same Name", privacyAcknowledged: true },
    a.token,
  );
  const b = await login("audit-b@example.test");
  await rpc(
    "athrecs/athlete-account-api",
    "saveMyAthleteRacingName",
    { fullName: "Synthetic Other Person", privacyAcknowledged: true },
    b.token,
  );

  await check("One OTP cannot create two simultaneous sessions", async () => {
    const otp = await sendCode("audit-a@example.test");
    const responses = await Promise.all(
      [0, 1].map(() => post("sign-in/email-otp", { email: "audit-a@example.test", otp })),
    );
    const statuses = responses.map((r) => r.status);
    assert.equal(statuses.filter((s) => s === 200).length, 1, `Concurrent statuses: ${statuses}`);
    return { statuses };
  });
  await check("A code cannot be used for a different email", async () => {
    const otp = await sendCode("audit-a@example.test");
    const r = await post("sign-in/email-otp", { email: "audit-b@example.test", otp });
    assert(r.status >= 400, `Status: ${r.status}`);
    return { status: r.status };
  });
  await check("Repeat signup with email case changes reuses one account", async () => {
    const otp = await sendCode("audit-a@example.test");
    const r = await post("sign-in/email-otp", { email: "AUDIT-A@EXAMPLE.TEST", otp });
    assert.equal(r.status, 200, await r.clone().text());
    assert.equal((await r.json()).user.id, a.user.id);
    const rows =
      await sql`select count(*)::int as n from "user" where lower(email)='audit-a@example.test'`;
    assert.equal(rows[0].n, 1);
    return { users: rows[0].n };
  });
  await check("Injected account identifier cannot overwrite a different account", async () => {
    await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteRacingName",
      { fullName: "Still Synthetic A", privacyAcknowledged: true, userId: b.user.id },
      a.token,
    );
    const other = await rpc(
      "athrecs/athlete-account-api",
      "getMyAthleteAccount",
      undefined,
      b.token,
    );
    assert.equal(other.fullName, "Synthetic Other Person");
    return { otherAccountUnchanged: true };
  });
  await check("External OAuth callback is rejected", async () => {
    const r = await post("sign-in/social", {
      provider: "google",
      callbackURL: "https://untrusted.example/collect",
      disableRedirect: true,
    });
    assert(r.status >= 400, `Status: ${r.status}`);
    return { status: r.status };
  });
  await check("Production mode limits repeated OTP sends from the same IP", async () => {
    const statuses = [];
    for (let i = 0; i < 4; i++) {
      const r = await post(
        "email-otp/send-verification-otp",
        { email: `rate-${i}@example.test`, type: "sign-in" },
        { "x-forwarded-for": "127.20.0.55" },
      );
      statuses.push(r.status);
    }
    assert.equal(statuses[3], 429, `Statuses: ${statuses}`);
    return { statuses };
  });

  // All race and athlete records below are synthetic fixtures in disposable storage.
  await sql`insert into events (id, slug, name, sport, surface, country) values (991501, 'audit-fictional-race', 'Synthetic Audit 10K', 'Athletics', 'Road', 'United Kingdom')`;
  await sql`insert into editions (id, event_id, event_date, distance_code, distance_km) values (991501, 991501, '2026-09-01', '10K', 10)`;
  await sql`insert into athletes (id, slug, display_name, profile_visibility) values (991501, 'audit-fictional-athlete', 'Synthetic Same Name', 'private')`;
  await sql`insert into results (id, edition_id, athlete_id, finish_time_seconds) values (991501, 991501, 991501, 2400)`;
  await check("Unmatched private result is inaccessible to another name", async () => {
    await assert.rejects(
      () =>
        rpc(
          "athrecs/result-claims-api",
          "submitResultClaim",
          { resultId: 991501, declarationAccepted: true },
          b.token,
        ),
      /not available/,
    );
    return { denied: true };
  });
  await rpc(
    "athrecs/athlete-account-api",
    "saveMyAthleteRacingName",
    { fullName: "Synthetic Same Name", privacyAcknowledged: true },
    a.token,
  );
  await check("Name alone must not establish ownership of an existing athlete", async () => {
    const outcome = await rpc(
      "athrecs/result-claims-api",
      "submitResultClaim",
      { resultId: 991501, declarationAccepted: true },
      a.token,
    );
    const links =
      await sql`select count(*)::int as n from athlete_account_links where athlete_id=991501 and status='active'`;
    assert.equal(outcome.status, "pending");
    assert.equal(links[0].n, 0, "No active ownership without an independent identity check");
    return { status: outcome.status, ownerLinks: links[0].n };
  });
  await check("Neither same-name account gains ownership without staff approval", async () => {
    await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteRacingName",
      { fullName: "Synthetic Same Name", privacyAcknowledged: true },
      b.token,
    );
    const outcome = await rpc(
      "athrecs/result-claims-api",
      "submitResultClaim",
      { resultId: 991501, declarationAccepted: true },
      b.token,
    );
    assert.equal(outcome.status, "pending");
    const links =
      await sql`select user_id from athlete_account_links where athlete_id=991501 and status='active'`;
    assert.equal(links.length, 0);
    return { status: outcome.status, ownerLinks: links.length };
  });
  await check("A normal athlete cannot approve their own claim through the staff API", async () => {
    const claims = await rpc("athrecs/result-claims-api", "listMyResultClaims", undefined, a.token);
    const claimId = claims.find((c) => c.resultId === 991501).claimId;
    await assert.rejects(
      () =>
        rpc(
          "athrecs/result-claims-api",
          "reviewResultClaim",
          {
            claimId,
            action: "approve",
            staffNote: "Forged self-approval",
            userId: "staff",
          },
          a.token,
        ),
      /Forbidden|Staff access/,
    );
    const links = await sql`select id from result_claims where id=${claimId} and status='approved'`;
    assert.equal(links.length, 0);
    return { denied: true };
  });
  await check("Claiming does not publish an athlete's profile", async () => {
    const sharing = await rpc(
      "athrecs/athlete-profile-share-api",
      "getMyProfileShare",
      undefined,
      a.token,
    );
    assert.equal(sharing.enabled, false);
    return { sharingEnabled: sharing.enabled };
  });
} finally {
  await mkdir("artifacts/funnel-audit", { recursive: true });
  await writeFile(
    "artifacts/funnel-audit/signup-ownership.json",
    JSON.stringify(findings, null, 2),
  );
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}

assert.equal(
  findings.filter((f) => f.status === "FAIL").length,
  0,
  "All signup and ownership adversarial checks must pass",
);
