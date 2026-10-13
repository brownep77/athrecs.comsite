// Disposable data only. No real emails or external network requests.
import assert from "node:assert/strict";
import { createServer } from "vite";
process.env.DATABASE_URL = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.VERCEL_ENV = "";
process.env.RESEND_API_KEY = "synthetic-only";
process.env.ATHRECS_INVITATION_RESEND_API_KEY = "synthetic-only";
const sent = [];
const realFetch = globalThis.fetch;
let fail = false;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  assert.equal(url, "https://api.resend.com/emails", "No real external requests");
  const body = JSON.parse(init.body);
  assert(body.to.every((to) => to.endsWith("@example.test")));
  sent.push({ body, key: new Headers(init.headers).get("Idempotency-Key") });
  if (fail) throw Error("Synthetic delivery uncertainty");
  return Response.json({ id: "synthetic-welcome-" + sent.length });
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18256, strictPort: true } });
let db;
try {
  const database = await server.ssrLoadModule("/src/lib/db.ts");
  db = await database.getPglite();
  const sql = await database.getSql();
  const service = await server.ssrLoadModule("/src/lib/auth/signup-welcome.server.ts");
  const regs = await server.ssrLoadModule("/src/lib/athrecs/registrations.server.ts");
  const add = async (id, name = "Synthetic Athlete", verified = true) =>
    sql`insert into "user"(id,name,email,"emailVerified") values(${id},${name},${id + "@example.test"},${verified})`;
  await add("welcome", "Jane Smith");
  assert.equal(
    (await sql`select count(*)::int n from signup_welcome_deliveries where user_id='welcome'`)[0].n,
    1,
  );
  await service.welcomeNewSignup("welcome");
  assert.equal(sent.length, 0, "Preview does not send welcome mail");
  assert.equal((await service.deliverSignupWelcomes(sql, "welcome")).sent, 1);
  const message = sent[0];
  assert.equal(message.body.from, "paul@athrecs.com");
  assert.equal(message.body.reply_to, "paul@athrecs.com");
  assert.deepEqual(message.body.to, ["welcome@example.test"]);
  assert.equal(message.body.subject, "Welcome to AthRecs");
  assert(message.body.text.includes("Hi Jane,"));
  for (const word of [
    "pilot",
    "independently",
    "feedback",
    "sporting history",
    "family",
    "generations",
    "missing results",
    "section=potential",
  ])
    assert(message.body.text.includes(word), word);
  assert(!message.body.text.includes("Your one-time code:"));
  assert.equal(message.key, "signup-welcome/welcome");
  assert(
    (
      await sql`select count(*)::int n from athlete_messages where user_id='welcome' and source_key='signup-welcome/welcome' and status='accepted'`
    )[0].n === 1,
    "Staff history includes welcome acceptance",
  );
  await Promise.all([
    service.deliverSignupWelcomes(sql, "welcome"),
    service.deliverSignupWelcomes(sql, "welcome"),
  ]);
  assert.equal(sent.length, 1);
  await add("pending", "Pending Athlete", false);
  assert.equal((await service.deliverSignupWelcomes(sql, "pending")).sent, 0);
  await sql`update "user" set "emailVerified"=true where id='pending'`;
  assert.equal((await service.deliverSignupWelcomes(sql, "pending")).sent, 1);
  await add("invited");
  await sql`insert into athlete_messages(id,user_id,direction,channel,subject,body,contact,sender,status,source,source_key) values('synthetic-invitation','invited','sent','email','Welcome','Already welcomed','invited@example.test','paul@athrecs.com','accepted','site','invitation-welcome/synthetic/attempt')`;
  const before = sent.length;
  await service.deliverSignupWelcomes(sql, "invited");
  assert.equal(sent.length, before);
  assert.equal(
    (await sql`select skipped_reason from signup_welcome_deliveries where user_id='invited'`)[0]
      .skipped_reason,
    "invitation_welcome_sent",
  );
  await add("retry");
  fail = true;
  await service.deliverSignupWelcomes(sql, "retry");
  const failed = sent.at(-1);
  await sql`update signup_welcome_deliveries set next_attempt_at=now() where user_id='retry'`;
  await sql`update "user" set name='Changed after first attempt' where id='retry'`;
  fail = false;
  await Promise.all([
    service.deliverSignupWelcomes(sql, "retry"),
    service.deliverSignupWelcomes(sql, "retry"),
  ]);
  assert.deepEqual(sent.at(-1), failed, "Retry retains identical payload and provider key");
  assert.equal(sent.filter((s) => s.key === failed.key).length, 2, "Concurrent retry runs once");
  await add("changed");
  fail = true;
  await service.deliverSignupWelcomes(sql, "changed");
  fail = false;
  await sql`update "user" set email='new-address@example.test' where id='changed'`;
  await sql`update signup_welcome_deliveries set next_attempt_at=now() where user_id='changed'`;
  const changedCount = sent.length;
  await service.deliverSignupWelcomes(sql, "changed");
  assert.equal(sent.length, changedCount);
  assert.equal(
    (await sql`select skipped_reason from signup_welcome_deliveries where user_id='changed'`)[0]
      .skipped_reason,
    "email_changed",
  );
  await add("expired");
  fail = true;
  await service.deliverSignupWelcomes(sql, "expired");
  fail = false;
  await sql`update signup_welcome_deliveries set first_attempt_at=now()-interval '24 hours',next_attempt_at=now() where user_id='expired'`;
  await service.deliverSignupWelcomes(sql, "expired");
  assert(
    (await sql`select needs_review from signup_welcome_deliveries where user_id='expired'`)[0]
      .needs_review,
  );
  await add("old");
  await sql`delete from signup_welcome_deliveries where user_id='old'`;
  const oldCount = sent.length;
  await service.deliverSignupWelcomes(sql, "old");
  assert.equal(sent.length, oldCount, "Pre-feature accounts are not retroactively welcomed");
  await sql`insert into athletes(id,slug,display_name) values(999761,'synthetic-welcome-one','Synthetic One'),(999762,'synthetic-welcome-two','Synthetic Two')`;
  await sql`insert into athlete_account_links(user_id,user_email,athlete_id,status) values('welcome','welcome@example.test',999761,'active'),('welcome','welcome@example.test',999762,'active')`;
  await sql`insert into athlete_profile_result_confirmations(id,user_id,athlete_id,input_hash,snapshot,included_keys,excluded_keys,added_count) values('11111111-1111-4111-8111-111111111111','welcome',999761,'one','one','[]','[]',2),('22222222-2222-4222-8222-222222222222','welcome',999762,'two','two','[]','[]',1)`;
  const funnel = await regs.loadSignupFunnel(sql);
  assert.equal(funnel.claimed, 1);
  assert.equal(funnel.confirmed, 1);
  assert.equal(funnel.submitted, 1);
  assert.equal(funnel.welcomed, 4);
  const registration = await regs.loadRegistrations(
    sql,
    { q: "", status: "all", sort: "newest", page: 1, month: "", joinedFrom: "", joinedTo: "" },
    "welcome",
  );
  assert.equal(registration.accounts[0].welcomeStatus, "Welcome sent");
  assert.equal(registration.accounts[0].resultsConfirmed, true);
  assert.deepEqual(registration.funnel, funnel);
  console.log(
    "PASS: personalized welcome, exact sender, one CTA, verified email gate, no historical mailout, invitation deduplication, safe retries, concurrency, changed email, expired delivery review, staff message history and distinct-athlete funnel counts. Synthetic emails only.",
  );
} finally {
  globalThis.fetch = realFetch;
  await server.close();
  await db?.close();
}
