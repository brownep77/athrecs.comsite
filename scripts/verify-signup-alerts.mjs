// Real auth endpoints and disposable Postgres-compatible DB. Every email is intercepted.
import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "vite";
const require = createRequire(import.meta.url);
const ts = require("typescript");
process.env.DATABASE_URL = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = "synthetic-key";
process.env.ATHRECS_INVITATION_RESEND_API_KEY = "synthetic-invitation-key";
process.env.BETTER_AUTH_URL = "http://127.0.0.1:18254";
process.env.BETTER_AUTH_SECRET = "synthetic-notification-auth-secret-at-least-32-characters";
process.env.VERCEL_ENV = "";
const origin = process.env.BETTER_AUTH_URL;
const fetchOriginal = globalThis.fetch;
const sends = [];
let failRecipient = "",
  failAll = false;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const body = JSON.parse(init.body);
    assert(
      body.to.every(
        (to) =>
          to.endsWith("@example.test") ||
          ["paul@athrecs.com", "paultwbrowne@gmail.com", "support@athrecs.com"].includes(to),
      ),
    );
    sends.push({ body, key: new Headers(init.headers).get("Idempotency-Key") });
    if (failAll || body.to.includes(failRecipient)) throw Error("Synthetic network interruption");
    return Response.json({ id: "synthetic-" + sends.length });
  }
  assert(url.startsWith(origin), "Block all unexpected external traffic");
  return fetchOriginal(input, init);
};
function load(path, deps) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      assert(name in deps, name);
      return deps[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}
const server = await createServer({ server: { host: "127.0.0.1", port: 18254, strictPort: true } });
let db;
try {
  await server.listen();
  const database = await server.ssrLoadModule("/src/lib/db.ts");
  db = await database.getPglite();
  const sql = await database.getSql();
  assert(
    !(await sql`select recipient from athrecs_notification_recipients('support')`).some(
      (row) => row.recipient === "support@athrecs.com",
    ),
    "Unconfirmed department mailboxes start disabled",
  );
  await sql`insert into staff_notification_routes(category,recipient,enabled)
    values('support','support@athrecs.com',true)
    on conflict(category,recipient) do update set enabled=excluded.enabled`;
  const recipients = (
    await sql`select recipient from athrecs_notification_recipients('support') order by recipient`
  ).map((row) => row.recipient);
  assert.deepEqual(recipients, [
    "paul@athrecs.com",
    "paultwbrowne@gmail.com",
    "support@athrecs.com",
  ]);
  const actual = await server.ssrLoadModule("/src/lib/auth/signup-alerts.server.ts");
  const connection = { dbSource: "neon", getSql: async () => sql };
  const scope = { IS_RUNRECS_SITE: false };
  const notifications = load("src/lib/auth/staff-notifications.server.ts", {
    "@/lib/db": connection,
  });
  const svc = load("src/lib/auth/signup-alerts.server.ts", {
    "@/lib/db": connection,
    "@/lib/site-scope": scope,
    "./staff-notifications.server": notifications,
  });
  // Use the identical notifier with an injected disposable database connection.
  // The actual auth hook is exercised separately by the real HTTP signup below.
  const post = async (path, body) =>
    fetch(origin + "/api/auth/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", origin, "sec-fetch-site": "same-origin" },
      body: JSON.stringify(body),
    });
  const email = "signup-alert-test@example.test";
  let r = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (
      await sql`select count(*)::int as n from signup_alert_deliveries where signup_email=${email}`
    )[0].n,
    0,
    "Requesting a code is not a signup",
  );
  const otp = sends.at(-1).body.text.match(/\b\d{6}\b/)[0];
  r = await post("sign-in/email-otp", { email, otp, ...signupDetails("Synthetic <Athlete>") });
  assert.equal(r.status, 200, await r.clone().text());
  const result = await r.json();
  const id = result.user.id;
  let rows =
    await sql`select * from signup_alert_deliveries where user_id=${id} order by recipient`;
  assert.equal(rows.length, recipients.length);
  assert.deepEqual(
    rows.map((x) => x.recipient),
    recipients,
  );
  assert(rows.every((x) => x.email_verified));
  // Preview/local safeguards remain active even when provider keys exist.
  assert.equal(svc.signupAlertsReady(), false);
  const before = sends.length;
  await svc.notifyNewSignup(id);
  assert.equal(sends.length, before);
  process.env.VERCEL_ENV = "production";
  assert.equal(
    actual.signupAlertsReady(),
    false,
    "The embedded preview DB cannot send real signup alerts",
  );
  assert.equal(svc.signupAlertsReady(), true);
  failRecipient = "paultwbrowne@gmail.com";
  await svc.notifyNewSignup(id);
  rows = await sql`select * from signup_alert_deliveries where user_id=${id} order by recipient`;
  assert(
    rows.every((row) => Boolean(row.sent_at) === (row.recipient !== failRecipient)),
    "One recipient failing does not block the other recipients, including support",
  );
  const first = sends.filter((s) => s.key?.startsWith("athrecs-signup-alert-"));
  assert.equal(first.length, recipients.length);
  assert(
    first.every(
      (s) => s.body.from === "paul@athrecs.com" && s.body.subject === "New AthRecs signup",
    ),
  );
  assert(
    first.every(
      (s) => s.body.text.includes(email) && s.body.text.includes("/admin/athlete-accounts"),
    ),
  );
  assert(first.every((s) => !s.body.text.includes(otp) && !s.body.text.includes(result.token)));
  assert(
    first.every(
      (s) => s.body.reply_to === email && s.body.text.includes(`Reference: signup/${id}`),
    ),
    "Each signup recipient gets the account reference and can reply to the registrant",
  );
  assert(first.every((s) => !s.body.html.includes("<Athlete>")));
  const count = sends.length;
  await svc.notifyNewSignup(id);
  assert.equal(sends.length, count, "Successful and reserved deliveries are not repeated");
  await sql`update signup_alert_deliveries set next_attempt_at=now() where user_id=${id} and sent_at is null`;
  failRecipient = "";
  await Promise.all([svc.deliverSignupAlerts(sql, id), svc.deliverSignupAlerts(sql, id)]);
  assert.equal(sends.length, count + 1, "Concurrent workers deliver only the failed recipient");
  assert.deepEqual(
    sends.at(-1),
    first.find((s) => s.body.to.includes("paultwbrowne@gmail.com")),
    "Retry payload and key stay identical",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_messages where contact=any(${recipients}::text[])`
    )[0].n,
    0,
    "Internal alerts do not enter athlete conversations",
  );
  r = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(r.status, 200);
  const secondOtp = sends.at(-1).body.text.match(/\b\d{6}\b/)[0];
  r = await post("sign-in/email-otp", { email, otp: secondOtp });
  assert.equal(r.status, 200, await r.text());
  assert.equal(
    (await sql`select count(*)::int n from signup_alert_deliveries where user_id=${id}`)[0].n,
    recipients.length,
    "Repeat sign-in does not create another signup notification",
  );
  await sql`update "user" set name='Changed Name' where id=${id}`;
  assert.equal(
    (await sql`select count(*)::int n from signup_alert_deliveries where user_id=${id}`)[0].n,
    recipients.length,
    "Changing an account name does not create another signup notification",
  );
  await assert.rejects(() =>
    sql.transaction(async (tx) => {
      await tx`insert into "user"(id,name,email,"emailVerified") values('rolled-back','Rollback','rollback@example.test',false)`;
      throw Error("rollback");
    }),
  );
  assert.equal(
    (await sql`select count(*)::int n from signup_alert_deliveries where user_id='rolled-back'`)[0]
      .n,
    0,
    "Rolled back account creates no alert",
  );
  await sql`insert into "user"(id,name,email,"emailVerified") values('signup-failure','Synthetic Failure','failure@example.test',false)`;
  failAll = true;
  await svc.notifyNewSignup("signup-failure");
  assert.equal(
    (await sql`select count(*)::int n from "user" where id='signup-failure'`)[0].n,
    1,
    "Delivery failure preserves account",
  );
  await sql`update signup_alert_deliveries set first_attempt_at=now()-interval '24 hours',next_attempt_at=now() where user_id='signup-failure'`;
  const expiredCount = sends.length;
  await svc.deliverSignupAlerts(sql, "signup-failure");
  assert.equal(
    sends.length,
    expiredCount,
    "Do not resend ambiguous deliveries beyond provider idempotency window",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from signup_alert_deliveries where user_id='signup-failure' and needs_review`
    )[0].n,
    recipients.length,
  );
  failAll = false;
  scope.IS_RUNRECS_SITE = true;
  assert.equal(svc.signupAlertsReady(), false);
  scope.IS_RUNRECS_SITE = false;
  connection.dbSource = "pglite";
  assert.equal(svc.signupAlertsReady(), false);
  connection.dbSource = "neon";
  process.env.RESEND_API_KEY = "";
  process.env.ATHRECS_INVITATION_RESEND_API_KEY = "";
  assert.equal(svc.signupAlertsReady(), false);
  const cron = await fetch(origin + "/api/signup-alerts");
  assert.equal(cron.status, 401);
  console.log(
    "PASS: real OTP signup queues category-routed support and owner alerts; immediate notifier, sender/recipients, safe content, independent retry, concurrency, unchanged idempotency payload, repeat login, rollback, outage survival, expired retry review, private history isolation, preview/sibling guards and cron authorization. No real emails sent.",
  );
} finally {
  globalThis.fetch = fetchOriginal;
  await server.close();
  await db?.close();
}
