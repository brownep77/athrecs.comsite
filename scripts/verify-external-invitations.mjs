// Real registration, staff RPC, token binding and claims. Only outgoing email is intercepted.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.RESEND_API_KEY = "synthetic-intercepted-email-key";
process.env.ATHRECS_STAFF_EMAILS = "staff@example.test";
process.env.BETTER_AUTH_SECRET = "external-invitations-test-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18242";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const deliveries = [];
const realFetch = globalThis.fetch;
let lastHeaders;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const payload = JSON.parse(init.body);
    assert(
      payload.to.every((to) => to.endsWith("@example.test")),
      "Only synthetic email recipients",
    );
    deliveries.push(payload);
    return Response.json({ id: `synthetic-${deliveries.length}` });
  }
  assert(url.startsWith(origin), `No external calls: ${new URL(url).origin}`);
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
  assert(start >= 0, `Real RPC ${name}`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      context: {},
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
let ip = 1;
async function post(path, body) {
  const response = await fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": `127.2.0.${ip++}`,
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
async function signup(email) {
  const sent = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(sent.status, 200);
  const otp = deliveries
    .findLast((mail) => mail.to.includes(email))
    ?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(otp, "A real verification code reaches the intercepted email boundary");
  const login = await post("sign-in/email-otp", { email, otp });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.emailVerified, true);
  return { id: login.body.user.id, token: login.body.token, email };
}
const server = await createServer({ server: { host: "127.0.0.1", port: 18242, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const staff = await signup("staff@example.test");
  const wrong = await signup("wrong@example.test");
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('external-google','external-google','google',${staff.id},now(),now())`;
  await sql`insert into athletes(id,slug,display_name) values(992401,'synthetic-external-athlete','Avery Test Athlete'),(992402,'synthetic-social-athlete','Jordan Test Athlete'),(992403,'synthetic-empty-athlete','Casey Test Athlete')`;
  await sql`insert into events(id,slug,name,sport,surface,country) values(992401,'synthetic-external-race','Synthetic Invitation Race','Running','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(992401,992401,'2026-01-01','10K',10)`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(992401,992401,992401,'finished'),(992402,992401,992402,'finished')`;
  const call = (name, data, token = staff.token, headers = {}) =>
    rpc("athrecs/claim-invitations-api", name, data, token, headers);
  const claim = (name, data, token) => rpc("athrecs/result-claims-api", name, data, token);
  const input = {
    athleteId: 992401,
    recipientName: "Avery Test Athlete",
    email: " New-Athlete@Example.Test ",
    phone: "",
    telegramUsername: "",
    socialLinks: [],
    sourceNote: "Synthetic athlete supplied their address",
    matchNote: "Synthetic staff knows this athlete and recognised the race",
    reviewed: true,
  };
  for (const token of ["", wrong.token]) {
    await assert.rejects(
      () => call("createStaffExternalInvitation", input, token),
      /Unauthorized|Forbidden/,
    );
    await assert.rejects(
      () => call("getStaffInvitationProfile", { athleteId: input.athleteId }, token),
      /Unauthorized|Forbidden/,
    );
  }
  await assert.rejects(
    () =>
      call("createStaffExternalInvitation", input, staff.token, {
        "x-forwarded-host": "www.athrecs.com",
      }),
    /staff host required/,
  );
  await assert.rejects(
    () =>
      call("createStaffExternalInvitation", input, staff.token, {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  for (const patch of [
    { reviewed: false },
    { sourceNote: "" },
    { matchNote: "" },
    { email: "bad" },
    { email: "" },
    { phone: "07700900123" },
    { socialLinks: [{ platform: "instagram", url: "https://untrusted.example/person" }] },
  ])
    await assert.rejects(() => call("createStaffExternalInvitation", { ...input, ...patch }));
  await assert.rejects(
    () => call("createStaffExternalInvitation", { ...input, athleteId: 992403 }),
    /eligible stored result/,
  );
  const countBefore = (await sql`select count(*)::int as n from "user"`)[0].n;
  const invitation = await call("createStaffExternalInvitation", input);
  assert.equal(
    (await sql`select count(*)::int as n from "user"`)[0].n,
    countBefore,
    "Invitation never creates a placeholder account",
  );
  assert.equal(invitation.recipient, "new-athlete@example.test");
  assert.equal(
    (await call("createStaffExternalInvitation", input)).id,
    invitation.id,
    "Retry reuses the exact link",
  );
  await assert.rejects(
    () => call("createStaffExternalInvitation", { ...input, athleteId: 992402 }),
    /Revoke/,
  );
  const token = new URL(invitation.url).searchParams.get("invitation");
  const intro = await call("getClaimInvitationIntro", { token, resultId: 992401 }, "");
  assert.deepEqual(intro, { name: "Avery Test Athlete", emailBound: true });
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  assert(!JSON.stringify(intro).includes("@"));
  const selected = { resultId: 992401, invitation: token };
  await assert.rejects(() => claim("getClaimableResult", selected, ""), /Unauthorized/);
  await assert.rejects(
    () => claim("getClaimableResult", selected, wrong.token),
    /invitation is unavailable/,
  );
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${invitation.id}`)[0].user_id,
    null,
  );
  const athlete = await signup("new-athlete@example.test");
  assert.equal((await claim("getClaimableResult", selected, athlete.token)).athleteId, 992401);
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${invitation.id}`)[0].user_id,
    null,
    "Viewing never consumes a new invitation",
  );
  await sql`update "user" set "emailVerified"=false where id=${athlete.id}`;
  await assert.rejects(
    () => claim("getClaimableResult", selected, athlete.token),
    /invitation is unavailable/,
  );
  await sql`update "user" set "emailVerified"=true where id=${athlete.id}`;
  await assert.rejects(
    () => claim("submitResultClaim", { ...selected, declarationAccepted: false }, athlete.token),
    /Confirm/,
  );
  const submitted = await claim(
    "submitResultClaim",
    { ...selected, declarationAccepted: true },
    athlete.token,
  );
  assert.equal(submitted.status, "pending");
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${invitation.id}`)[0].user_id,
    athlete.id,
  );
  assert.equal(
    (await claim("submitResultClaim", { ...selected, declarationAccepted: true }, athlete.token))
      .claimId,
    submitted.claimId,
  );
  assert.equal(
    (await sql`select count(*)::int as n from athlete_account_links where athlete_id=992401`)[0].n,
    0,
  );
  await assert.rejects(
    () =>
      claim("reviewResultClaim", { claimId: submitted.claimId, action: "approve" }, staff.token),
    /independent identity evidence/,
  );
  const history = await call("getStaffInvitationProfile", { athleteId: 992401 });
  assert.equal(history.history[0].status, "pending");
  assert(!JSON.stringify(history).includes(token), "History omits private tokens");

  const socialInput = {
    ...input,
    athleteId: 992402,
    recipientName: "Jordan Test Athlete",
    email: "",
    phone: "+447700900123",
    telegramUsername: "@synthetic_athlete",
    socialLinks: [
      { platform: "instagram", url: "https://www.instagram.com/synthetic_athlete/" },
      { platform: "facebook", url: "https://www.facebook.com/synthetic.athlete" },
      { platform: "x", url: "https://x.com/synthetic_athlete" },
    ],
  };
  const beforeSocial = deliveries.length;
  const social = await call("createStaffExternalInvitation", socialInput);
  assert.equal(deliveries.length, beforeSocial, "Contact invitations send no email");
  assert.equal(social.emailBound, false);
  assert.equal(social.contact.telegramUsername, "synthetic_athlete");
  const socialToken = new URL(social.url).searchParams.get("invitation");
  const socialSelected = { resultId: 992402, invitation: socialToken };
  assert.equal(
    (await call("getClaimInvitationIntro", { token: socialToken, resultId: 992402 }, ""))
      .emailBound,
    false,
  );
  await assert.rejects(() => claim("getClaimableResult", socialSelected, ""), /Unauthorized/);
  const socialAthlete = await signup("social-athlete@example.test");
  assert.equal(
    (await claim("getClaimableResult", socialSelected, socialAthlete.token)).athleteId,
    992402,
  );
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${social.id}`)[0].user_id,
    null,
  );
  await sql`update "user" set "emailVerified"=false where id=${wrong.id}`;
  await assert.rejects(
    () => claim("getClaimableResult", socialSelected, wrong.token),
    /invitation is unavailable/,
  );
  await sql`update "user" set "emailVerified"=true where id=${wrong.id}`;
  const socialClaim = await claim(
    "submitResultClaim",
    { ...socialSelected, declarationAccepted: true },
    socialAthlete.token,
  );
  assert.equal(socialClaim.status, "pending");
  await assert.rejects(
    () => claim("getClaimableResult", socialSelected, wrong.token),
    /invitation is unavailable/,
  );
  await assert.rejects(
    () => claim("submitResultClaim", { ...socialSelected, declarationAccepted: true }, wrong.token),
    /invitation is unavailable/,
  );
  assert.match(
    (await sql`select evidence_text from result_claims where id=${socialClaim.claimId}`)[0]
      .evidence_text,
    /does not verify control/,
  );
  assert.equal(
    (await sql`select count(*)::int as n from athlete_account_links where athlete_id=992402`)[0].n,
    0,
  );
  const { claimInvitationSharing } = await server.ssrLoadModule(
    "/src/lib/athrecs/claim-invitation-sharing.ts",
  );
  const links = claimInvitationSharing(social.url, social.contact, true, false);
  assert.equal(new URL(links.sms).searchParams.get("body"), links.message);
  assert.match(links.message, /Create a free account/);
  assert(links.message.includes(social.url));
  assert(new URL(links.viber).searchParams.get("text").length <= 200);
  assert.equal(new URL(links.whatsapp).pathname, "/447700900123");
  assert.equal(new URL(links.telegram).pathname, "/synthetic_athlete");

  const fresh = await call("createStaffExternalInvitation", {
    ...input,
    email: "fresh@example.test",
  });
  const freshToken = new URL(fresh.url).searchParams.get("invitation");
  await call("revokeStaffClaimInvitation", { id: fresh.id });
  assert.equal(
    await call("getClaimInvitationIntro", { token: freshToken, resultId: 992401 }, ""),
    null,
  );
  const expiring = await call("createStaffExternalInvitation", {
    ...input,
    email: "expire@example.test",
  });
  await sql`update athlete_claim_invitations set expires_at=now()-interval '1 second' where id=${expiring.id}`;
  assert.equal(
    await call(
      "getClaimInvitationIntro",
      { token: new URL(expiring.url).searchParams.get("invitation"), resultId: 992401 },
      "",
    ),
    null,
  );
  const declineInvite = await call("createStaffExternalInvitation", {
    ...input,
    email: "decline@example.test",
  });
  const decliner = await signup("decline@example.test");
  await call(
    "declineClaimInvitation",
    { token: new URL(declineInvite.url).searchParams.get("invitation"), resultId: 992401 },
    decliner.token,
  );
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${declineInvite.id}`)[0]
      .user_id,
    decliner.id,
  );
  console.log(
    "PASS: new-contact invitations, exact profile continuation through real email-code signup, email and verified-account binding, staff-only controls, private intro/history, explicit claim consumption, no automatic ownership, social/SMS payloads, retries, expiry, revoke and decline. Synthetic recipients only.",
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
