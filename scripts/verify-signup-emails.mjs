// Disposable PostgreSQL-compatible database and intercepted mail only.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
const ts = createRequire(import.meta.url)("typescript");
function load(path, deps) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      assert(name in deps, `Unexpected import: ${name}`);
      return deps[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}
const db = new PGlite();
let failSentWrite = false;
function sqlFor(connection) {
  const sql = async (parts, ...values) => {
    let text = parts[0];
    values.forEach((_, i) => {
      text += `$${i + 1}${parts[i + 1]}`;
    });
    if (failSentWrite && text.includes("set sent_at =")) throw Error("Interrupted receipt write");
    return (await connection.query(text, values)).rows;
  };
  sql.transaction = (fn) => db.transaction((tx) => fn(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
const connection = { dbSource: "neon", getSql: async () => sql };
const scope = { IS_RUNRECS_SITE: false };
const email = { authEmailConfigured: () => Boolean(process.env.RESEND_API_KEY) };
const alerts = load("src/lib/athrecs/signup-email.server.ts", {
  "@/lib/db": connection,
  "@/lib/site-scope": scope,
  "@/lib/auth/email.server": email,
  "./athlete-id": load("src/lib/athrecs/athlete-id.ts", {}),
});
const authWorker = load("src/lib/athrecs/result-claim-alerts.server.ts", {
  "node:crypto": crypto,
  "@/lib/db": connection,
  "@/lib/site-scope": scope,
  "@/lib/auth/email.server": email,
  "./result-claim-email.server": { staffRecipients: () => [] },
});
const sent = [];
let failSend = false;
globalThis.fetch = async (url, init) => {
  assert.equal(url, "https://api.resend.com/emails");
  const payload = JSON.parse(init.body);
  assert.deepEqual(payload.to, ["admin@example.test"]);
  const id = init.headers["Idempotency-Key"].split("-").at(-1);
  const [row] =
    await sql`select first_attempt_at, attempts from signup_email_deliveries where id = ${id}`;
  assert(row.first_attempt_at && row.attempts, "Reserve before network access");
  sent.push({ payload, key: init.headers["Idempotency-Key"] });
  if (failSend) throw Error("Synthetic provider failure");
  return Response.json({ id: "synthetic-receipt" });
};
process.env.VERCEL_ENV = "production";
process.env.ATHRECS_SIGNUP_EMAIL_TO = "admin@example.test";
process.env.ATHRECS_SIGNUP_EMAIL_FROM = "ATHRECS Test <notifications@example.test>";
process.env.RESEND_API_KEY = "synthetic-only-key";
process.env.CRON_SECRET = "synthetic-only-cron-secret";
async function user(id, date = "2026-10-08T08:00:00Z") {
  await sql`insert into "user"(id, name, email, "emailVerified", "createdAt", "updatedAt")
    values (${id}, ${`Synthetic <${id}>`}, ${`${id}@example.test`}, false, ${date}, ${date})`;
}
async function reset() {
  await db.exec(
    'delete from signup_email_deliveries; delete from signup_email_events; delete from "user";',
  );
  sent.length = 0;
}
try {
  for (const name of readdirSync("migrations")
    .filter((name) => name.endsWith(".sql") && name !== "20261008_signup_emails.sql")
    .sort())
    await db.exec(readFileSync(`migrations/${name}`, "utf8"));
  await user("old");
  await db.exec(readFileSync("migrations/20261008_signup_emails.sql", "utf8"));
  assert.equal(
    (await sql`select * from signup_email_events`).length,
    0,
    "No historical signup replay",
  );
  await user("one");
  const [identifier] =
    await sql`select number::text as n from athlete_identifiers where user_id = 'one'`;
  await alerts.deliverSignupEmails(sql, false, new Date(), ["one"]);
  assert.equal(sent.length, 1);
  assert.match(sent[0].payload.text, new RegExp(`ATH-${identifier.n.padStart(6, "0")}`));
  assert.match(sent[0].payload.text, /Synthetic <one>/);
  assert.match(sent[0].payload.html, /Synthetic &lt;one&gt;/);
  assert.match(sent[0].payload.text, /one@example.test/);
  assert.match(sent[0].payload.text, /8 Oct 2026, 09:00:00 BST/);
  assert.match(sent[0].payload.text, /Not yet verified/);
  await sql`update "user" set "emailVerified" = true where id = 'one'`;
  await alerts.deliverSignupEmails(sql);
  assert.equal(sent.length, 1, "Verification/repeated workers never create another signup");
  await assert.rejects(() =>
    db.transaction(async (tx) => {
      await tx.exec(
        `insert into "user"(id,name,email,"emailVerified") values('rollback','Rollback','rollback@example.test',false)`,
      );
      throw Error("rollback");
    }),
  );
  assert.equal((await sql`select * from signup_email_events where user_id = 'rollback'`).length, 0);

  await user("backlog");
  await user("current");
  await alerts.deliverSignupEmails(sql, false, new Date(), ["current"]);
  assert.match(
    sent.at(-1).payload.text,
    /current@example.test/,
    "Current request bypasses older queued signups",
  );
  await alerts.deliverSignupEmails(sql);
  assert.match(sent.at(-1).payload.text, /backlog@example.test/);

  await user("retry");
  failSentWrite = true;
  await alerts.deliverSignupEmails(sql);
  const first = structuredClone(sent.at(-1));
  failSentWrite = false;
  await alerts.deliverSignupEmails(sql);
  assert.deepEqual(sent.at(-1), first, "Reservation prevents immediate duplicate attempts");
  await sql`update "user" set name = 'Changed later' where id = 'retry'`;
  process.env.ATHRECS_SIGNUP_EMAIL_FROM = "Changed sender <changed@example.test>";
  await sql`update signup_email_deliveries set next_attempt_at = now() where user_id = 'retry'`;
  await alerts.deliverSignupEmails(sql);
  assert.deepEqual(sent.at(-1), first, "Ambiguous sends retry the same complete payload and key");

  await user("expired");
  failSend = true;
  await alerts.deliverSignupEmails(sql);
  failSend = false;
  const count = sent.length;
  await sql`update signup_email_deliveries set first_attempt_at = now() - interval '25 hours', next_attempt_at = now() where user_id = 'expired'`;
  await alerts.deliverSignupEmails(sql);
  assert.equal(sent.length, count, "Do not duplicate a possibly delivered email after key expiry");
  assert.equal(
    (await sql`select needs_review from signup_email_deliveries where user_id = 'expired'`)[0]
      .needs_review,
    true,
  );

  for (const [key, bad] of [
    ["VERCEL_ENV", "preview"],
    ["ATHRECS_SIGNUP_EMAIL_TO", ""],
    ["ATHRECS_SIGNUP_EMAIL_TO", "a@example.test,b@example.test"],
    ["CRON_SECRET", ""],
    ["RESEND_API_KEY", ""],
  ]) {
    const before = process.env[key];
    process.env[key] = bad;
    assert.equal(
      (
        await alerts.deliverSignupEmails(() => {
          throw Error("Must not access database");
        })
      ).paused,
      true,
    );
    process.env[key] = before;
  }
  connection.dbSource = "pglite";
  assert.equal(alerts.signupEmailsEnabled(), false);
  connection.dbSource = "neon";
  scope.IS_RUNRECS_SITE = true;
  assert.equal(alerts.signupEmailsEnabled(), false);
  scope.IS_RUNRECS_SITE = false;
  assert.equal(
    authWorker.authorizedClaimAlertWorker(new Request("https://example.test/api/signup-emails")),
    false,
  );
  assert.equal(
    authWorker.authorizedClaimAlertWorker(
      new Request("https://example.test/api/signup-emails", {
        headers: { authorization: "Bearer synthetic-only-cron-secret" },
      }),
    ),
    true,
  );

  // Both DST transitions: UTC windows must include precisely one UK calendar day.
  for (const sample of [
    {
      day: "2026-03-29",
      start: "2026-03-29T00:00:00Z",
      last: "2026-03-29T22:59:59Z",
      end: "2026-03-29T23:00:00Z",
      before: "2026-03-30T06:59:59Z",
      due: "2026-03-30T07:00:00Z",
    },
    {
      day: "2026-10-25",
      start: "2026-10-24T23:00:00Z",
      last: "2026-10-25T23:59:59Z",
      end: "2026-10-26T00:00:00Z",
      before: "2026-10-26T07:59:59Z",
      due: "2026-10-26T08:00:00Z",
    },
  ]) {
    await reset();
    await sql`update signup_email_schedule set last_queued_date = ${sample.day}::date - 1`;
    await user("start", sample.start);
    await user("last", sample.last);
    await user("next", sample.end);
    await alerts.queueSignupDigest(sql, new Date(sample.before));
    assert.equal(
      (await sql`select * from signup_email_deliveries`).length,
      0,
      "Not before 08:00 UK",
    );
    await alerts.queueSignupDigest(sql, new Date(sample.due));
    await alerts.queueSignupDigest(sql, new Date(sample.due));
    const messages = await sql`select payload from signup_email_deliveries`;
    assert.equal(messages.length, 1, "One digest per UK day");
    assert.match(messages[0].payload.subject, /2 new users/);
    assert.match(messages[0].payload.text, /start@example.test/);
    assert.match(messages[0].payload.text, /last@example.test/);
    assert.doesNotMatch(messages[0].payload.text, /next@example.test/);
  }
  await reset();
  await sql`update signup_email_schedule set last_queued_date = '2026-10-06'`;
  await alerts.queueSignupDigest(sql, new Date("2026-10-08T07:00:00Z"));
  assert.match(
    (await sql`select payload from signup_email_deliveries`)[0].payload.text,
    /No new signups/,
  );
  await reset();
  await sql`update signup_email_schedule set last_queued_date = '2026-10-06'`;
  await db.exec(`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
    select 'bulk-'||n,'Synthetic '||n,'bulk-'||n||'@example.test',true,'2026-10-07T12:00:00Z','2026-10-07T12:00:00Z' from generate_series(1,201) n`);
  await alerts.queueSignupDigest(sql, new Date("2026-10-08T07:00:00Z"));
  const pages = await sql`select payload from signup_email_deliveries order by id`;
  assert.equal(pages.length, 2);
  assert.match(pages[0].payload.subject, /201 new users — part 1\/2/);
  assert.equal(
    pages
      .map((p) => (p.payload.text.match(/Email address:/g) ?? []).length)
      .reduce((a, b) => a + b),
    201,
  );
  console.log(
    "Signup emails PASS: atomic capture, stable ATH numbers, immediate targeting, retries, privacy guards, UK 08:00/DST, empty days and complete paginated digests.",
  );
} finally {
  await db.close();
}
