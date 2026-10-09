// Complete staff registrations flow using synthetic data and disposable PGlite.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as crypto from "node:crypto";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "RESEND_API_KEY",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.ATHRECS_STAFF_EMAILS = "staff@example.test";
process.env.BETTER_AUTH_SECRET = "registration-test-only-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18241";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const server = await createServer({ server: { host: "127.0.0.1", port: 18241, strictPort: true } });
let database;
const deliveries = [];
let deliveryFailure = false;
let lastHeaders;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    deliveries.push({ headers: init.headers, payload: JSON.parse(init.body) });
    if (deliveryFailure)
      throw new Error("Synthetic network interruption after provider acceptance");
    return new Response(JSON.stringify({ id: "synthetic-email" }), { status: 200 });
  }
  assert(url.startsWith(origin), `No external calls in this test: ${new URL(url).origin}`);
  const response = await realFetch(input, init);
  if (url.includes("/_serverFn/")) lastHeaders = response.headers;
  return response;
};
const modules = new Map();
async function rpc(file, name, data, token, headers = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} real RPC exists`);
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
        ...headers,
      },
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
const read = (data = {}, token, headers = {}) =>
  rpc("athrecs/registrations-api", "listRegisteredAthletes", data, token, headers);
async function post(path, body, token) {
  const response = await fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const signup = async (name, email) => {
    const r = await post("sign-up/email", { name, email, password: "Synthetic-password-123!" });
    assert.equal(r.status, 200);
    await sql`update "user" set "emailVerified"=true where id=${r.body.user.id}`;
    return { id: r.body.user.id, token: r.body.token, email };
  };
  const staff = await signup("Synthetic Staff", "staff@example.test");
  const athlete = await signup("Temporary Name", "runner@example.test");
  const other = await signup("Synthetic Other", "other@example.test");
  await sql`update "user" set name='' where id=${athlete.id}`;
  const call = (name, data, auth = staff.token, headers = {}) =>
    rpc("athrecs/claim-invitations-api", name, data, auth, headers);
  const claim = (name, data, auth = athlete.token) =>
    rpc("athrecs/result-claims-api", name, data, auth);
  const search = { userId: athlete.id, q: "Synthetic Runner" };
  await assert.rejects(() => call("findStaffClaimMatches", search), /Forbidden/);
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('invite-google','invite-google','google',${staff.id},now(),now())`;
  await sql`insert into athletes(id,slug,display_name,city,country) values(991401,'synthetic-invite-runner','Synthetic Runner','Norwich','United Kingdom'),(991402,'synthetic-invite-other','Synthetic Other','Norwich','United Kingdom'),(991403,'synthetic-invite-empty','Synthetic Empty',null,'United Kingdom')`;
  await sql`insert into events(id,slug,name,sport,surface,country) values(991401,'synthetic-invite-race','Synthetic Invitation Race','Running','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(991401,991401,'2026-01-01','10K',10),(991402,991401,'2025-01-01','10K',10)`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(991401,991401,991401,'finished'),(991402,991402,991401,'finished'),(991403,991401,991402,'finished')`;
  const input = {
    userId: athlete.id,
    athleteId: 991401,
    matchNote: "Synthetic athlete confirmed this race and club",
    reviewed: true,
  };
  for (const token of ["", other.token]) {
    await assert.rejects(
      () => call("findStaffClaimMatches", search, token),
      /Unauthorized|Forbidden/,
    );
    await assert.rejects(
      () => call("createStaffClaimInvitation", input, token),
      /Unauthorized|Forbidden/,
    );
  }
  await assert.rejects(
    () =>
      call("createStaffClaimInvitation", input, staff.token, {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () =>
      call("createStaffClaimInvitation", input, staff.token, {
        "x-forwarded-host": "www.athrecs.com",
      }),
    /staff host required/,
  );
  await assert.rejects(() => call("createStaffClaimInvitation", { ...input, reviewed: false }));
  await assert.rejects(() => call("createStaffClaimInvitation", { ...input, matchNote: "" }));
  const noName = await call("findStaffClaimMatches", { userId: athlete.id, q: "" });
  assert.equal(noName.hasSavedName, false);
  assert.equal(noName.candidates.length, 0);
  const matches = await call("findStaffClaimMatches", search);
  assert.equal(matches.candidates[0].id, 991401);
  assert.equal(matches.candidates[0].resultCount, 2);
  assert.equal(matches.candidates[0].recentResults[0].race, "Synthetic Invitation Race");
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert.equal((await call("findStaffClaimMatches", { ...search, q: "%" })).candidates.length, 0);
  await sql`update "user" set name='Synthetic Runner' where id=${other.id}`;
  assert.equal(
    (await call("findStaffClaimMatches", { userId: other.id, q: "" })).candidates[0].id,
    991401,
  );
  await assert.rejects(
    () => call("createStaffClaimInvitation", { ...input, athleteId: 991403 }),
    /eligible stored result/,
  );
  const invite = await call("createStaffClaimInvitation", input);
  const token = new URL(invite.url).searchParams.get("invitation");
  assert.equal(new URL(invite.url).origin, "https://www.athrecs.com");
  const repeat = await call("createStaffClaimInvitation", input);
  assert.equal(repeat.id, invite.id);
  assert.equal(repeat.reused, true);
  await assert.rejects(
    () => call("createStaffClaimInvitation", { ...input, athleteId: 991402 }),
    /Revoke/,
  );
  await assert.rejects(
    () => call("emailStaffClaimInvitation", { id: invite.id }),
    /only on the live/,
  );
  assert.equal((await sql`select * from athlete_account_links where athlete_id=991401`).length, 0);
  const data = { resultId: 991401, invitation: token };
  assert.equal(
    await claim("getClaimableResult", { resultId: 991401 }),
    null,
    "Unnamed account cannot use ordinary name match",
  );
  assert.equal((await claim("getClaimableResult", data)).athleteName, "Synthetic Runner");
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert.equal(lastHeaders.get("referrer-policy"), "no-referrer");
  await assert.rejects(
    () => claim("getClaimableResult", data, other.token),
    /invitation is unavailable/,
  );
  await assert.rejects(
    () => claim("getClaimableResult", { ...data, resultId: 991402 }),
    /invitation is unavailable/,
  );
  await assert.rejects(
    () => claim("getClaimableResult", { ...data, invitation: "0".repeat(64) }),
    /invitation is unavailable/,
  );
  await sql`update "user" set "emailVerified"=false where id=${athlete.id}`;
  await assert.rejects(() => claim("getClaimableResult", data), /invitation is unavailable/);
  await sql`update "user" set "emailVerified"=true,email='changed@example.test' where id=${athlete.id}`;
  await assert.rejects(() => claim("getClaimableResult", data), /invitation is unavailable/);
  await sql`update "user" set email=${athlete.email} where id=${athlete.id}`;
  await sql`update athlete_claim_invitations set expires_at=now()-interval '1 second' where id=${invite.id}`;
  await assert.rejects(() => claim("getClaimableResult", data), /invitation is unavailable/);
  await sql`update athlete_claim_invitations set expires_at=now()+interval '7 days' where id=${invite.id}`;
  await assert.rejects(
    () => claim("submitResultClaim", { ...data, declarationAccepted: false }),
    /Confirm/,
  );

  // Exercise the real mail dispatcher and rendering with a mocked production
  // environment and an intercepted Resend boundary. No external email is sent.
  const authEmail = await server.ssrLoadModule("/src/lib/auth/email.server.ts");
  const core = await server.ssrLoadModule("/src/lib/athrecs/claim-invitation.ts");
  const matching = await server.ssrLoadModule("/src/lib/athrecs/result-match.ts");
  const identities = await server.ssrLoadModule("/src/lib/athrecs/profile-connections.ts");
  const context = vm.createContext({
    process: { env: { VERCEL_ENV: "production" } },
    Buffer,
    console,
  });
  const imports = {
    "node:crypto": crypto,
    "@/lib/db": { dbSource: "neon" },
    "@/lib/site-scope": { IS_RUNRECS_SITE: false },
    "@/lib/auth/email.server": authEmail,
    "./result-match": matching,
    "./profile-connections": identities,
    "./claim-invitation": core,
  };
  const source = ts.transpileModule(
    await readFile("src/lib/athrecs/claim-invitations.server.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
  ).outputText;
  const module = new vm.SourceTextModule(source, { context });
  await module.link(async (spec) => {
    const exports = imports[spec];
    assert(exports, `Known test import ${spec}`);
    return new vm.SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [k, v] of Object.entries(exports)) this.setExport(k, v);
      },
      { context },
    );
  });
  await module.evaluate();
  process.env.RESEND_API_KEY = "synthetic-intercepted-key";
  deliveryFailure = true;
  assert.equal((await module.namespace.sendInvitationEmail(sql, invite.id)).status, "failed");
  deliveryFailure = false;
  assert.equal((await module.namespace.sendInvitationEmail(sql, invite.id)).status, "sent");
  assert.equal(deliveries.length, 2);
  assert.deepEqual(
    deliveries[0],
    deliveries[1],
    "Interrupted send retries identical payload and provider idempotency key",
  );
  assert.equal(deliveries[1].payload.from, "ATHRECS Support <support@athrecs.com>");
  assert.equal(deliveries[1].payload.reply_to, "support@athrecs.com");
  assert.deepEqual(deliveries[1].payload.to, [athlete.email]);
  assert(deliveries[1].payload.text.includes(invite.url));
  assert.equal((await module.namespace.sendInvitationEmail(sql, invite.id)).status, "sent");
  assert.equal(deliveries.length, 2, "Repeated send does not call provider again");
  const history = (await call("findStaffClaimMatches", search)).history;
  assert.equal(history[0].status, "invited");
  assert(!JSON.stringify(history).includes(token), "History does not expose claim tokens");
  process.env.RESEND_API_KEY = "";

  const accepted = await claim("submitResultClaim", { ...data, declarationAccepted: true });
  assert.equal(accepted.status, "pending");
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=991401`).length,
    0,
    "Invitation submits only, without ownership",
  );
  const replay = await claim("submitResultClaim", { ...data, declarationAccepted: true });
  assert.equal(replay.claimId, accepted.claimId);
  assert.equal(
    (await sql`select * from result_claims where claimant_user_id=${athlete.id}`).length,
    1,
  );
  assert.equal((await call("findStaffClaimMatches", search)).history[0].status, "pending");
  await assert.rejects(
    () => call("declineClaimInvitation", { token, resultId: 991401 }, athlete.token),
    /already been submitted/,
  );
  await assert.rejects(
    () => claim("reviewResultClaim", { claimId: accepted.claimId, action: "approve" }, staff.token),
    /independent identity evidence/,
  );
  await claim(
    "reviewResultClaim",
    {
      claimId: accepted.claimId,
      action: "approve",
      staffNote: "Synthetic independent club confirmation checked for this test",
    },
    staff.token,
  );
  assert.equal((await call("findStaffClaimMatches", search)).history[0].status, "approved");
  const link = (await sql`select * from athlete_account_links where athlete_id=991401`)[0];
  assert.equal(link.user_id, athlete.id);
  const row = (await read({ q: athlete.email }, staff.token)).accounts[0];
  assert.equal(row.invitation.status, "approved");
  await assert.rejects(
    () => call("createStaffClaimInvitation", { ...input, userId: other.id }),
    /already linked/,
  );

  const second = await call("createStaffClaimInvitation", {
    ...input,
    userId: other.id,
    athleteId: 991402,
  });
  const token2 = new URL(second.url).searchParams.get("invitation");
  await assert.rejects(
    () => call("declineClaimInvitation", { token: token2, resultId: 991403 }, athlete.token),
    /invitation is unavailable/,
  );
  await call("declineClaimInvitation", { token: token2, resultId: 991403 }, other.token);
  await assert.rejects(
    () => claim("getClaimableResult", { resultId: 991403, invitation: token2 }, other.token),
    /invitation is unavailable/,
  );
  assert.equal(
    (await call("findStaffClaimMatches", { userId: other.id, q: "" })).history[0].status,
    "declined",
  );
  const third = await call("createStaffClaimInvitation", {
    ...input,
    userId: other.id,
    athleteId: 991402,
  });
  const token3 = new URL(third.url).searchParams.get("invitation");
  await call("revokeStaffClaimInvitation", { id: third.id });
  await assert.rejects(
    () =>
      claim(
        "submitResultClaim",
        { resultId: 991403, invitation: token3, declarationAccepted: true },
        other.token,
      ),
    /invitation is unavailable/,
  );
  const fourth = await call("createStaffClaimInvitation", {
    ...input,
    userId: other.id,
    athleteId: 991402,
  });
  process.env.RESEND_API_KEY = "synthetic-intercepted-key";
  await sql`update athlete_claim_invitations set first_attempt_at=now()-interval '24 hours' where id=${fourth.id}`;
  assert.equal((await module.namespace.sendInvitationEmail(sql, fourth.id)).status, "held");
  assert.equal(deliveries.length, 2, "Ambiguous sends outside provider retry window are held");
  context.process.env.VERCEL_ENV = "preview";
  await assert.rejects(() => module.namespace.sendInvitationEmail(sql, fourth.id), /live ATHRECS/);
  await assert.rejects(
    () => module.namespace.createInvitation(sql, staff.id, input),
    /live ATHRECS/,
  );
  process.env.RESEND_API_KEY = "";
  await call("revokeStaffClaimInvitation", { id: fourth.id });
  const fifth = await call("createStaffClaimInvitation", {
    ...input,
    userId: other.id,
    athleteId: 991402,
  });
  const token5 = new URL(fifth.url).searchParams.get("invitation");
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(991402,${staff.id},${staff.email},'active')`;
  const competing = await claim(
    "submitResultClaim",
    { resultId: 991403, invitation: token5, declarationAccepted: true },
    other.token,
  );
  assert.equal(competing.status, "pending");
  await assert.rejects(
    () =>
      claim(
        "reviewResultClaim",
        {
          claimId: competing.claimId,
          action: "approve",
          staffNote: "Synthetic identity note cannot replace existing owner",
        },
        staff.token,
      ),
    /already owned/,
  );
  assert.equal(
    (await sql`select user_id from athlete_account_links where athlete_id=991402`)[0].user_id,
    staff.id,
  );
  const beforeDelete = (
    await sql`select count(*)::int as n from athlete_claim_invitations where user_id=${other.id}`
  )[0].n;
  assert(beforeDelete > 0);
  await sql`delete from "user" where id=${other.id}`;
  assert.equal(
    (await sql`select * from athlete_claim_invitations where user_id=${other.id}`).length,
    0,
  );
  console.log(
    "PASS: private staff matching, blank-name invitation, recipient/verified-email/result binding, token expiry/revoke/decline, duplicate creation/send/claim, existing owner protection, identity-note approval, dashboard tracking, frozen support email retries and preview blocking. Synthetic accounts; no real email sent.",
  );
} finally {
  process.env.RESEND_API_KEY = "";
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
