// Real registration, staff RPC, token binding and claims. Only outgoing email is intercepted.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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
process.env.BETTER_AUTH_SECRET = "athlete-messages-test-secret-at-least-32-chars";
const origin = "http://127.0.0.1:18249";
process.env.BETTER_AUTH_URL = origin;
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
const deliveries = [];
let emailStatus = 200;
let networkFailure = false;
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
    if (networkFailure) throw new Error("Synthetic timeout");
    deliveries.push(payload);
    if (emailStatus !== 200)
      return Response.json({ error: "Synthetic failure" }, { status: emailStatus });
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
const server = await createServer({ server: { host: "127.0.0.1", port: 18249, strictPort: true } });
let database;
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const staff = await signup("staff@example.test");
  const athlete = await signup("athlete@example.test");
  const other = await signup("other@example.test");
  await sql`insert into account(id,"accountId","providerId","userId","createdAt","updatedAt") values('messages-google','messages-google','google',${staff.id},now(),now())`;
  const call = (name, data, token = staff.token, headers = {}) =>
    rpc("athrecs/athlete-messages-api", name, data, token, headers);
  const target = { userId: athlete.id };
  const filters = { target, direction: "all", page: 1 };
  const message = {
    target,
    entryId: randomUUID(),
    direction: "received",
    channel: "email",
    subject: "My missing result",
    body: "<script>alert('synthetic')</script> Can you add my result?",
    contact: athlete.email,
    occurredAt: new Date().toISOString(),
  };
  for (const token of ["", athlete.token]) {
    await assert.rejects(
      () => call("getStaffAthleteMessages", filters, token),
      /Unauthorized|Forbidden/,
    );
    await assert.rejects(
      () => call("saveStaffAthleteMessage", message, token),
      /Unauthorized|Forbidden/,
    );
  }
  for (const headers of [
    { "x-forwarded-host": "www.athrecs.com" },
    { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" },
  ]) {
    await assert.rejects(
      () => call("getStaffAthleteMessages", filters, staff.token, headers),
      /Forbidden|Cross|staff host required/,
    );
    await assert.rejects(
      () => call("saveStaffAthleteMessage", message, staff.token, headers),
      /Forbidden|Cross|staff host required/,
    );
  }
  const initial = await call("getStaffAthleteMessages", filters);
  assert.equal(initial.total, 0);
  assert.equal(lastHeaders.get("cache-control"), "private, no-store");
  const deliveryCount = deliveries.length;
  await call("saveStaffAthleteMessage", message);
  await call("saveStaffAthleteMessage", message);
  assert.equal(deliveries.length, deliveryCount, "Recording correspondence never sends a message");
  let history = await call("getStaffAthleteMessages", filters);
  assert.equal(history.received, 1, "Retry is idempotent");
  assert.equal(history.messages[0].body, message.body, "Plain text retained, not evaluated");
  assert.equal(
    (await call("getStaffAthleteMessages", { ...filters, target: { userId: other.id } })).total,
    0,
  );
  await assert.rejects(
    () => call("getStaffAthleteMessages", { ...filters, target: { userId: "missing" } }),
    /not found/,
  );
  for (const patch of [
    { body: "" },
    { subject: "x".repeat(201) },
    { channel: "fake" },
    { occurredAt: "2099-01-01T00:00:00.000Z" },
    { target: { userId: athlete.id, athleteNumber: "1" } },
  ])
    await assert.rejects(() =>
      call("saveStaffAthleteMessage", { ...message, ...patch, entryId: randomUUID() }),
    );
  const { sendAthrecsAuthEmail } = await server.ssrLoadModule("/src/lib/auth/email.server.ts");
  const email = {
    to: athlete.email,
    subject: "Synthetic welcome",
    heading: "Hello",
    message:
      "Please claim your results. 123456 https://www.athrecs.com/claim?token=never-store-this",
    code: "123456",
    actionUrl: "https://www.athrecs.com/claim?token=never-store-this",
  };
  const options = { from: "paul@athrecs.com", idempotencyKey: "synthetic/welcome" };
  await sendAthrecsAuthEmail(email, options);
  await sendAthrecsAuthEmail(email, options);
  history = await call("getStaffAthleteMessages", filters);
  assert.equal(history.sent, 1);
  assert.equal(history.total, 2);
  const sent = history.messages.find((m) => m.direction === "sent");
  assert.equal(sent.sender, "paul@athrecs.com");
  assert.equal(sent.status, "accepted");
  assert(!JSON.stringify(history).includes("123456"));
  assert(!JSON.stringify(history).includes("never-store-this"));
  emailStatus = 403;
  await assert.rejects(() =>
    sendAthrecsAuthEmail(
      { ...email, subject: "Rejected" },
      { ...options, idempotencyKey: "synthetic/fail" },
    ),
  );
  assert.equal(
    (await call("getStaffAthleteMessages", filters)).messages.find((m) => m.subject === "Rejected")
      .status,
    "failed",
  );
  emailStatus = 200;
  await sendAthrecsAuthEmail(
    { ...email, subject: "Rejected" },
    { ...options, idempotencyKey: "synthetic/fail" },
  );
  history = await call("getStaffAthleteMessages", filters);
  assert.equal(history.messages.filter((m) => m.subject === "Rejected").length, 1);
  assert.equal(history.messages.find((m) => m.subject === "Rejected").status, "accepted");
  networkFailure = true;
  await assert.rejects(() =>
    sendAthrecsAuthEmail(
      { ...email, subject: "Uncertain" },
      { ...options, idempotencyKey: "synthetic/unknown" },
    ),
  );
  networkFailure = false;
  assert.equal(
    (await call("getStaffAthleteMessages", filters)).messages.find((m) => m.subject === "Uncertain")
      .status,
    "unknown",
  );
  await sql`insert into athletes(id,slug,display_name) values(998901,'synthetic-message-athlete','Same Name'),(998902,'synthetic-other-message-athlete','Same Name')`;
  const [source] = await sql`select number::text from athlete_identifiers where athlete_id=998901`;
  const [unrelated] =
    await sql`select number::text from athlete_identifiers where athlete_id=998902`;
  const sourceTarget = { athleteNumber: source.number };
  await call("saveStaffAthleteMessage", {
    ...message,
    target: sourceTarget,
    entryId: randomUUID(),
    channel: "whatsapp",
    subject: "Source reply",
  });
  assert.equal(
    (await call("getStaffAthleteMessages", { ...filters, target: sourceTarget })).total,
    1,
  );
  assert.equal(
    (
      await call("getStaffAthleteMessages", {
        ...filters,
        target: { athleteNumber: unrelated.number },
      })
    ).total,
    0,
    "Same name does not join correspondence",
  );
  await sql`insert into athlete_account_links(user_id,user_email,athlete_id,status) values(${athlete.id},${athlete.email},998901,'active')`;
  assert.equal(
    (await call("getStaffAthleteMessages", filters)).received,
    2,
    "Approved linked profile joins source correspondence",
  );
  await sql`insert into events(id,slug,name,sport,surface,country) values(998901,'synthetic-message-race','Synthetic Race','Running','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(998901,998901,'2026-01-01','10K',10)`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(998901,998901,998902,'finished')`;
  const invitationId = randomUUID();
  const payload = {
    to: "new@example.test",
    subject: "Invitation",
    heading: "Welcome",
    message: "Please claim your profile",
    actionUrl: "https://www.athrecs.com/claim?invitation=hidden-token",
  };
  await sql`insert into athlete_claim_invitations(id,athlete_id,result_id,token_hash,claim_url,match_note,invitation_kind,recipient_email,recipient_key,email_payload,email_sent_at) values(${invitationId},998902,998901,${"1".repeat(64)},${payload.actionUrl},'Synthetic checked identity','email','new@example.test','email:new@example.test',${JSON.stringify(payload)}::jsonb,now()-interval '1 day')`;
  const inviteFilters = { ...filters, target: { athleteNumber: unrelated.number } };
  const earlier = await call("getStaffAthleteMessages", inviteFilters);
  assert.equal(earlier.sent, 1);
  assert(!JSON.stringify(earlier).includes("hidden-token"));
  await sendAthrecsAuthEmail(payload, {
    from: "paul@athrecs.com",
    idempotencyKey: `profile-claim-invitation/${invitationId}`,
  });
  assert.equal(
    (await call("getStaffAthleteMessages", inviteFilters)).sent,
    1,
    "Earlier invitation and new audit are deduplicated",
  );
  assert.equal(
    (await call("getStaffAthleteMessages", filters)).messages.some(
      (m) => m.contact === "new@example.test",
    ),
    false,
    "Unregistered invitation goes only to the invited source profile",
  );
  const invitedSignup = await signup("new@example.test");
  assert.equal(
    (await call("getStaffAthleteMessages", { ...filters, target: { userId: invitedSignup.id } }))
      .sent,
    1,
    "Verified mailbox sees its pre-registration invitation before claiming",
  );
  for (let i = 0; i < 22; i++)
    await call("saveStaffAthleteMessage", {
      ...message,
      entryId: randomUUID(),
      subject: `Reply ${i}`,
    });
  const page1 = await call("getStaffAthleteMessages", { ...filters, direction: "received" });
  const page2 = await call("getStaffAthleteMessages", {
    ...filters,
    direction: "received",
    page: 2,
  });
  assert.equal(page1.messages.length, 20);
  assert.equal(page2.messages.length, 4);
  assert(!page1.messages.some((a) => page2.messages.some((b) => a.id === b.id)));
  assert.equal(
    (await call("getStaffAthleteMessages", { ...filters, page: 999 })).messages.length,
    0,
  );
  console.log(
    "PASS: private staff RPC, correct athlete binding, sent/received history, legacy invitations, recorded replies, no sends from recording, pagination, idempotency, send failure/recovery and code/link redaction. Synthetic recipients only.",
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
