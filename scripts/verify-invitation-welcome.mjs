// Disposable database, real Better Auth endpoints and intercepted delivery only.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import ts from "typescript";
import { createServer } from "vite";
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "VERCEL_ENV",
  "ATHRECS_CLAIMS_EMAILS",
])
  process.env[key] = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VITE_SITE_BRAND = "athrecs";
process.env.RESEND_API_KEY = "synthetic-auth-key";
process.env.ATHRECS_INVITATION_RESEND_API_KEY = "synthetic-invitation-key";
process.env.BETTER_AUTH_SECRET = "welcome-test-only-authentication-secret-32-characters";
const origin = "http://127.0.0.1:18249";
process.env.BETTER_AUTH_URL = origin;
const server = await createServer({ server: { host: "127.0.0.1", port: 18249, strictPort: true } });
let database;
let failure = false;
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const payload = JSON.parse(init.body);
    assert(payload.to.every((email) => email.endsWith("@example.test")));
    sent.push({ payload, headers: init.headers });
    if (failure) throw new Error("Synthetic ambiguous provider response");
    return Response.json({ id: `synthetic-${sent.length}` });
  }
  assert(url.startsWith(origin), "External network is forbidden in this test");
  return realFetch(input, init);
};
const NativeDate = globalThis.Date;
async function afterHours(hours, run) {
  // Advance the auth clock without waiting or editing the verification expiry.
  const offset = hours * 60 * 60 * 1000;
  globalThis.Date = class extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [NativeDate.now() + offset]));
    }
    static now() {
      return NativeDate.now() + offset;
    }
  };
  try {
    return await run();
  } finally {
    globalThis.Date = NativeDate;
  }
}
let ip = 1;
async function login(email, otp) {
  return fetch(`${origin}/api/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "content-type": "application/json", origin, "x-forwarded-for": `127.2.0.${ip++}` },
    body: JSON.stringify({ email, otp }),
  });
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const authModule = await server.ssrLoadModule("/src/lib/auth/server.ts");
  const emailModule = await server.ssrLoadModule("/src/lib/auth/email.server.ts");
  const core = await server.ssrLoadModule("/src/lib/athrecs/claim-invitations.server.ts");
  const deps = {
    "node:crypto": crypto,
    "@/lib/auth/server": authModule,
    "@/lib/auth/email.server": emailModule,
    "./claim-invitations.server": {
      assertInvitationWrites: core.assertInvitationWrites,
      invitationEmailAvailable: () => true,
    },
    "./claim-invitation": await server.ssrLoadModule("/src/lib/athrecs/claim-invitation.ts"),
    "./invitation-welcome": await server.ssrLoadModule("/src/lib/athrecs/invitation-welcome.ts"),
  };
  const welcomeText = deps["./invitation-welcome"];
  for (const [name, greeting] of [
    ["Avery Test", "Hi Avery,"],
    ["Dr. Élodie Test", "Hi Élodie,"],
    ["Mary-Jane Test", "Hi Mary-Jane,"],
    ["", "Hi,"],
    ["Name not supplied", "Hi,"],
    ["person@example.test", "Hi,"],
    ["Avery\n<script>", "Hi,"],
  ]) {
    assert(welcomeText.invitationWelcomeMessage(name).startsWith(`${greeting}\n\n`));
  }
  const compiled = ts.transpileModule(
    await readFile("src/lib/athrecs/invitation-welcome.server.ts", "utf8"),
    {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    },
  ).outputText;
  const module = { exports: {} };
  new Function("require", "exports", "module", compiled)(
    (name) => {
      assert(name in deps, `Unexpected dependency: ${name}`);
      return deps[name];
    },
    module.exports,
    module,
  );
  const send = (id = "synthetic-welcome") => module.exports.sendWelcomeInvitationEmail(sql, id);
  const email = "welcome@example.test";
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('welcome-user','Synthetic Welcome',${email},false,now(),now())`;
  await sql`insert into athletes(id,slug,display_name) values(992401,'synthetic-welcome-profile','Synthetic Welcome')`;
  await sql`insert into events(id,slug,name,sport,surface,country) values(992401,'synthetic-welcome-race','Synthetic Welcome Race','Running','Road','United Kingdom')`;
  await sql`insert into editions(id,event_id,event_date,distance_code,distance_km) values(992401,992401,'2026-01-01','10K',10)`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(992401,992401,992401,'finished')`;
  const token = "d".repeat(64);
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const url = `https://www.athrecs.com/claim-results?resultId=992401&invitation=${token}`;
  const frozen = {
    to: email,
    subject: "Original invitation",
    message: "Frozen original body",
    actionUrl: url,
  };
  await sql`insert into athlete_claim_invitations(id,user_id,recipient_email,athlete_id,result_id,token_hash,claim_url,match_note,email_payload) values('synthetic-welcome','welcome-user',${email},992401,992401,${hash},${url},'Synthetic reviewed invitation',${JSON.stringify(frozen)}::jsonb)`;
  const row = async () =>
    (await sql`select * from athlete_claim_invitations where id='synthetic-welcome'`)[0];
  const allowAgain = async () =>
    sql`update athlete_claim_invitations set welcome_attempted_at=now()-interval '2 minutes',welcome_attempts_today=0 where id='synthetic-welcome'`;
  const code = () => sent.at(-1).payload.text.match(/Your one-time code: (\d{6})/)[1];
  process.env.VERCEL_ENV = "preview";
  await assert.rejects(send, /live ATHRECS/);
  process.env.VERCEL_ENV = "";
  const oldCode = await authModule.auth.api.createVerificationOTP({
    body: { email, type: "sign-in" },
  });
  assert.deepEqual(await send(), { status: "sent" });
  assert.equal(sent.length, 1, "One combined message, no second auth email");
  const firstCode = code();
  const mail = sent[0].payload;
  assert.equal(mail.from, "paul@athrecs.com");
  assert.equal(mail.reply_to, "paul@athrecs.com");
  assert.equal(sent[0].headers.Authorization, "Bearer synthetic-invitation-key");
  assert(mail.text.includes(welcomeText.invitationWelcomeMessage("Synthetic Welcome")));
  assert(mail.html.includes("Hi Synthetic,"));
  assert(mail.html.includes('src="https://www.athrecs.com/athrecs-logo.png"'));
  assert(mail.html.includes('alt="AthRecs.com"'));
  assert(mail.text.includes("valid for 24 hours and can be used once"));
  assert.equal(
    (await core.invitationHistory(sql, "welcome-user"))[0].recipientName,
    "Synthetic Welcome",
  );
  assert.equal(
    (await core.externalInvitationProfile(sql, 992401)).history[0].recipientName,
    "Synthetic Welcome",
  );
  assert(mail.text.includes(url) && mail.html.includes(url.replaceAll("&", "&amp;")));
  assert(mail.html.includes(firstCode) && mail.html.includes("white-space:pre-line"));
  const stored = await sql`select * from verification where identifier=${`sign-in-otp-${email}`}`;
  assert.equal(stored.length, 1, "Fresh code replaces previous codes");
  assert(!JSON.stringify(stored).includes(firstCode), "Code is stored hashed");
  const ttl = new Date(stored[0].expiresAt).getTime() - Date.now();
  assert(ttl > 86340000 && ttl <= 86400000, "Invitation code has a full 24-hour expiry");
  const invitation = await row();
  assert.deepEqual(invitation.email_payload, frozen, "Frozen retry payload is untouched");
  assert.equal(invitation.claim_url, url, "Existing private link is retained");
  assert(!JSON.stringify(invitation).includes(firstCode), "No plaintext code in invitation row");
  assert.deepEqual(await send(), { status: "recent" });
  assert.equal(sent.length, 1);
  if (oldCode !== firstCode) assert.equal((await login(email, oldCode)).status, 400);
  assert.equal((await login("different@example.test", firstCode)).status, 400);
  const success = await afterHours(23.9, () => login(email, firstCode));
  assert.equal(success.status, 200, "Invitation code still works almost 24 hours later");
  const signedIn = await success.json();
  assert.equal(signedIn.user.id, "welcome-user");
  assert.equal(
    (await sql`select "emailVerified" from "user" where id='welcome-user'`)[0].emailVerified,
    true,
  );
  assert.equal((await login(email, firstCode)).status, 400, "Consumed code cannot be reused");
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=992401`).length,
    0,
    "Sign-in does not grant profile ownership",
  );

  await allowAgain();
  await send();
  const expiredCode = code();
  assert.equal(
    (await afterHours(24.1, () => login(email, expiredCode))).status,
    400,
    "Invitation code expires after 24 hours",
  );
  await allowAgain();
  await send();
  const limitedCode = code();
  const wrong = limitedCode === "000000" ? "999999" : "000000";
  for (let n = 0; n < 3; n++) assert.equal((await login(email, wrong)).status, 400);
  assert.equal(
    (await login(email, limitedCode)).status,
    403,
    "Three incorrect guesses exhaust the code",
  );

  await allowAgain();
  failure = true;
  const beforeFailure = sent.length;
  assert.deepEqual(await send(), { status: "failed" });
  assert.equal(sent.length, beforeFailure + 1, "Ambiguous send is not automatically retried");
  assert.equal((await row()).reserved_until, null);
  assert.equal((await row()).delivery_error, true);
  failure = false;
  await allowAgain();
  assert.deepEqual(await send(), { status: "sent" });
  assert.notEqual(
    sent.at(-1).headers["Idempotency-Key"],
    sent.at(-2).headers["Idempotency-Key"],
    "Explicit fresh code uses its own delivery attempt",
  );
  await allowAgain();
  await sql`update athlete_claim_invitations set reserved_until=now()+interval '1 minute' where id='synthetic-welcome'`;
  assert.deepEqual(await send(), { status: "sending" });
  await sql`update athlete_claim_invitations set reserved_until=null,welcome_attempted_at=now()-interval '2 minutes',welcome_attempts_today=5 where id='synthetic-welcome'`;
  assert.deepEqual(await send(), { status: "limited" });
  const beforeInactive = sent.length;
  for (const column of ["revoked_at", "declined_at"]) {
    await sql.query(
      `update athlete_claim_invitations set ${column}=now() where id='synthetic-welcome'`,
    );
    await assert.rejects(send, /no longer active/);
    await sql.query(
      `update athlete_claim_invitations set ${column}=null where id='synthetic-welcome'`,
    );
  }
  await sql`update athlete_claim_invitations set expires_at=now()-interval '1 second' where id='synthetic-welcome'`;
  await assert.rejects(send, /no longer active/);
  await sql`update athlete_claim_invitations set expires_at=now()+interval '1 day' where id='synthetic-welcome'`;
  await sql`update "user" set email='changed@example.test' where id='welcome-user'`;
  await assert.rejects(send, /no longer active/);
  await sql`update "user" set email=${email} where id='welcome-user'`;
  assert.equal(sent.length, beforeInactive);
  await allowAgain();
  await sql`update athlete_claim_invitations set claim_url=${url.replace("resultId=992401", "resultId=992402")} where id='synthetic-welcome'`;
  await assert.rejects(send, /link is invalid/);
  await sql`update athlete_claim_invitations set claim_url=${url},user_id=null,invitation_kind='email',recipient_key='email:new-welcome@example.test',recipient_email='new-welcome@example.test',recipient_name='Avery Example' where id='synthetic-welcome'`;
  assert.deepEqual(await send(), { status: "sent" });
  assert(sent.at(-1).payload.text.includes("Hi Avery,"));
  assert.equal(
    (await login("new-welcome@example.test", code())).status,
    200,
    "Email-bound invitation also supports a new account",
  );
  const normalEmail = "ordinary-login@example.test";
  await authModule.auth.api.createVerificationOTP({
    body: { email: normalEmail, type: "sign-in" },
  });
  const [normal] =
    await sql`select "expiresAt" from verification where identifier=${`sign-in-otp-${normalEmail}`}`;
  const normalTtl = new Date(normal.expiresAt).getTime() - Date.now();
  assert(normalTtl > 240000 && normalTtl <= 300000, "Ordinary login still uses five minutes");
  console.log(
    "PASS: personalised welcome + hashed 24-hour OTP + existing link; real recipient-bound sign-in, expiry, replay, guessing limit, safe failures, cooldown, inactive guards and no ownership grant. All delivery intercepted.",
  );
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
  globalThis.Date = NativeDate;
}
