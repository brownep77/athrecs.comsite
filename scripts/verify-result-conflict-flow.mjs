// Exercise the real matching, claim and outbox code against a disposable schema.
// All athletes/accounts/results are synthetic; all outgoing emails are captured.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool, types } from "pg";
const require = createRequire(import.meta.url);
const ts = require("typescript");
function load(path, deps = {}) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  new Function("require", "module", "exports", outputText)(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected dependency: ${name}`);
      return deps[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}
const postgres = process.env.ATHRECS_CLAIM_TEST_POSTGRES === "1";
async function disposablePostgres() {
  assert.equal(process.env.CI, "true", "PostgreSQL checks require the disposable CI service");
  for (const name of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL"])
    assert.equal(process.env[name] ?? "", "", "Never use application database credentials");
  types.setTypeParser(20, Number);
  types.setTypeParser(1082, (value) => value);
  const pool = new Pool({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "athrecs_claim_test",
    max: 10,
    options: "-c statement_timeout=15000 -c lock_timeout=5000",
  });
  assert.equal(
    (await pool.query("select current_database() as name")).rows[0].name,
    "athrecs_claim_test",
  );
  assert.equal(
    (
      await pool.query(
        "select count(*)::int as n from information_schema.tables where table_schema='public'",
      )
    ).rows[0].n,
    0,
    "Use a fresh disposable database for each run",
  );
  return {
    query: (text, values) => pool.query(text, values),
    exec: (text) => pool.query(text),
    transaction: async (work) => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await work(client);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
const db = postgres ? await disposablePostgres() : new PGlite();
await db.waitReady;
let failOutbox = false;
let failSentWrite = false;
function sqlFor(connection) {
  const query = async (text, params = []) => {
    if (failOutbox && /insert into result_claim_alerts/.test(text))
      throw Error("Synthetic outbox failure");
    if (failSentWrite && /set sent_at =/.test(text))
      throw Error("Synthetic database failure after provider acceptance");
    return (await connection.query(text, params)).rows;
  };
  const sql = async (parts, ...values) => {
    let text = parts[0];
    values.forEach((_, i) => {
      text += `$${i + 1}${parts[i + 1]}`;
    });
    return query(text, values);
  };
  sql.query = query;
  sql.transaction = (fn) => db.transaction((tx) => fn(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
const connection = { getSql: async () => sql, dbSource: "neon" };
const scope = { IS_RUNRECS_SITE: false };
let configured = true;
let failEmail = false;
const sends = [];
const receipts = [];
const mail = {
  authEmailConfigured: () => configured,
  sendAthrecsAuthEmail: async (email, options) => {
    if (postgres) {
      const deliveryId = Number(options.idempotencyKey.split("-").at(-1));
      const [marker] =
        await sql`select first_attempt_at,attempts from result_claim_alert_deliveries where id=${deliveryId}`;
      assert(
        marker.first_attempt_at && marker.attempts > 0,
        "Attempt marker must be committed and visible to another connection before sending",
      );
    }
    sends.push({ email, options });
    if (failEmail) throw Error("Synthetic email failure");
  },
};
const emails = load("src/lib/athrecs/result-claim-email.server.ts", {
  "@/lib/auth/email.server": mail,
});
const alerts = load("src/lib/athrecs/result-claim-alerts.server.ts", {
  "node:crypto": crypto,
  "@/lib/db": connection,
  "@/lib/site-scope": scope,
  "@/lib/auth/email.server": mail,
  "./result-claim-email.server": emails,
});
const auth = { authMiddleware: "authenticated" };
const staff = { staffMiddleware: "staff" };
const server = {
  createServerFn: () => {
    let validate = (data) => data;
    let middleware = [];
    const chain = {
      middleware(value) {
        middleware = value;
        return chain;
      },
      validator(value) {
        validate = value;
        return chain;
      },
      handler(fn) {
        const invoke = (data, context) => fn({ data: validate(data), context });
        invoke.middleware = middleware;
        return invoke;
      },
    };
    return chain;
  },
};
const shared = {
  "@tanstack/react-start": server,
  "@/lib/auth/middleware": auth,
  "@/lib/auth/staff-middleware": staff,
  "@/lib/db": connection,
  "./seed.server": { ensureAthrecsSeeded: async () => {} },
  "./result-match": load("src/lib/athrecs/result-match.ts"),
  "./profile-connections": load("src/lib/athrecs/profile-connections.ts"),
};
const matches = load("src/lib/athrecs/result-match-api.ts", shared);
const claims = load("src/lib/athrecs/result-claims-api.ts", {
  ...shared,
  "./athlete-account-api": { syncAthleteAccountAfterClaim: async () => {} },
  "./result-claim-alerts.server": alerts,
  "./result-claim-email.server": {
    notifyResultClaimSubmitted: async (email, notifyStaff) => receipts.push({ email, notifyStaff }),
    notifyResultClaimReviewed: async () => {},
    notifyResultClaimWithdrawn: async () => {},
  },
});
const user = (id) => ({ userId: id });
const claim = (id, resultId = 1) =>
  claims.submitResultClaim({ resultId, declarationAccepted: true }, user(id));
const count = async (table) => Number((await sql.query(`select count(*) as n from ${table}`))[0].n);
const savedEnv = { ...process.env };
try {
  for (const name of readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${name}`, "utf8"));
  process.env.VERCEL_ENV = "production";
  process.env.ATHRECS_STAFF_EMAILS = "staff@example.test,STAFF@example.test,invalid";
  delete process.env.ATHRECS_CLAIMS_EMAILS;
  process.env.CRON_SECRET = "synthetic-worker-key";
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values
    ('one','Avery Test Athlete','one@example.test',true,now(),now()),
    ('two','Avery Test Athlete','two@example.test',true,now(),now()),
    ('unrelated','Unrelated Person','unrelated@example.test',true,now(),now()),
    ('unverified','Avery Test Athlete','unverified@example.test',false,now(),now())`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,country,county)
    values (1,'synthetic-avery','Avery Test Athlete','private','','')`;
  await sql`insert into events(id,slug,name,sport) values (1,'synthetic-race','Synthetic Race','Running')`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values
    (1,1,'2025-05-04','10K'),(2,1,'2026-05-04','10K')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (1,1,1,2400,'private'),(2,2,1,2390,'private')`;
  const originalResults = JSON.stringify(await sql`select * from results order by id`);
  assert.deepEqual(claims.submitResultClaim.middleware, ["authenticated"]);
  assert.deepEqual(claims.listStaffResultClaims.middleware, ["staff"]);
  assert.deepEqual(matches.listMyPotentialResultMatches.middleware, ["authenticated"]);
  assert.equal(
    (await matches.listMyPotentialResultMatches(undefined, user("one"))).matches.length,
    2,
  );
  assert.equal(await count("athlete_account_links"), 0, "Suggestions never claim ownership");
  assert.equal(await count("result_claim_alerts"), 0, "Two matching names are not a conflict");
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
    values ('new','Avery Test Athlete','new@example.test',true,now(),now())`;
  assert.equal(
    (await matches.listMyPotentialResultMatches(undefined, user("new"))).matches.length,
    2,
    "New registrations discover older results without a completed private profile",
  );
  assert.equal(
    (await matches.listMyPotentialResultMatches(undefined, user("unrelated"))).matches.length,
    0,
  );
  await assert.rejects(() => claim("unrelated"), /not available/);
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
    values ('source-id','Different Account Name','source-id@example.test',true,now(),now())`;
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,power_of_10_url,privacy_notice_version,privacy_acknowledged_at)
    values ('source-id','source-id@example.test','Different Account Name',
      'https://www.powerof10.uk/Home/Athlete/11111111-2222-4333-8444-555555555555','synthetic-test',now())`;
  await sql`insert into athlete_source_identities(provider,external_id,athlete_id,source_url)
    values ('powerof10','11111111-2222-4333-8444-555555555555',1,
      'https://www.powerof10.uk/Home/Athlete/11111111-2222-4333-8444-555555555555')`;
  const bySource = await matches.listMyPotentialResultMatches(undefined, user("source-id"));
  assert.equal(
    bySource.matches.length,
    2,
    "Current Power of 10 IDs match despite a different account name",
  );
  assert(bySource.matches.every((match) => match.score === 100));
  assert.equal((await claims.getClaimableResult({ resultId: 1 }, user("source-id"))).resultId, 1);
  assert.equal(
    await count("athlete_account_links"),
    0,
    "A source-ID suggestion still requires confirmation",
  );
  await assert.rejects(() => claim("unverified"), /Verify your email/);
  await assert.rejects(
    () => claims.submitResultClaim({ resultId: 1, declarationAccepted: false }, user("one")),
    /Confirm/,
  );
  assert.equal((await claim("one")).status, "approved");
  assert.equal(await count("result_claim_alerts"), 0);
  assert.equal(
    (await matches.listMyPotentialResultMatches(undefined, user("one"))).matches.length,
    0,
  );
  assert.equal((await claim("one")).alreadyOwned, true);
  failEmail = true;
  const conflict = await claim("two", 2);
  assert.equal(conflict.status, "pending");
  assert.equal(
    (await sql`select user_id from athlete_account_links where athlete_id = 1`)[0].user_id,
    "one",
  );
  assert.equal(await count("result_claim_alerts"), 1);
  assert.equal(await count("result_claim_alert_deliveries"), 1);
  assert.equal(receipts.at(-1).notifyStaff, false, "No duplicate generic staff alert");
  assert.equal(sends.length, 1);
  assert.match(sends[0].email.actionUrl, new RegExp(`claimId=${conflict.claimId}$`));
  assert(
    !sends[0].email.message.includes("two@example.test"),
    "Keep private account addresses in the staff UI",
  );
  const firstSend = JSON.stringify(sends[0]);
  await claim("two", 2);
  assert.equal(sends.length, 1, "Resubmission respects backoff");
  assert.equal(await count("result_claim_alerts"), 1);
  await sql`update result_claim_alert_deliveries set next_attempt_at = now() - interval '1 second'`;
  failEmail = false;
  assert.equal((await alerts.deliverClaimConflictAlerts(sql)).sent, 1);
  assert.equal(JSON.stringify(sends[1]), firstSend, "Retries reuse exactly the same message/key");
  await alerts.deliverClaimConflictAlerts(sql);
  assert.equal(sends.length, 2, "Successful sends are not repeated");
  const staffClaims = await claims.listStaffResultClaims({ status: "all" }, user("staff"));
  assert.equal(
    staffClaims.find((c) => c.claimId === conflict.claimId).competingClaimCount,
    1,
    "Competing claims on different results of the same athlete are visible",
  );
  failOutbox = true;
  await assert.rejects(() => claim("new"), /Synthetic outbox failure/);
  assert.equal(
    (await sql`select id from result_claims where claimant_user_id = 'new'`).length,
    0,
    "Failure to record the alert rolls back the conflicting claim",
  );
  failOutbox = false;
  // Missing settings preserve the conflict; enabling delivery later recovers it.
  configured = false;
  const later = await claim("new");
  assert.equal(later.status, "pending");
  assert.equal((await alerts.claimAlertSummary(sql)).awaiting_setup, 1);
  configured = true;
  process.env.VERCEL_ENV = "preview";
  assert.equal((await alerts.deliverClaimConflictAlerts(sql)).paused, true);
  process.env.VERCEL_ENV = "production";
  scope.IS_RUNRECS_SITE = true;
  assert.equal((await alerts.deliverClaimConflictAlerts(sql)).paused, true);
  scope.IS_RUNRECS_SITE = false;
  connection.dbSource = "pglite";
  assert.equal((await alerts.deliverClaimConflictAlerts(sql)).paused, true);
  connection.dbSource = "neon";
  failEmail = true;
  await alerts.deliverClaimConflictAlerts(sql);
  await sql`update result_claim_alert_deliveries set first_attempt_at = now() - interval '24 hours',
    next_attempt_at = now() - interval '1 second' where sent_at is null`;
  const beforeExpiry = sends.length;
  await alerts.deliverClaimConflictAlerts(sql);
  assert.equal(sends.length, beforeExpiry, "Expired ambiguous sends require manual investigation");
  assert.equal((await alerts.claimAlertSummary(sql)).needs_review, 1);
  assert(!alerts.authorizedClaimAlertWorker(new Request("https://example.test")));
  assert(
    !alerts.authorizedClaimAlertWorker(
      new Request("https://example.test", { headers: { authorization: "Bearer wrong" } }),
    ),
  );
  assert(
    alerts.authorizedClaimAlertWorker(
      new Request("https://example.test", {
        headers: { authorization: "Bearer synthetic-worker-key" },
      }),
    ),
  );
  delete process.env.CRON_SECRET;
  assert(
    !alerts.authorizedClaimAlertWorker(
      new Request("https://example.test", { headers: { authorization: "Bearer undefined" } }),
    ),
  );
  assert.equal(
    JSON.stringify(await sql`select * from results order by id`),
    originalResults,
    "Suggestions, claims and alerts never edit performances or publication",
  );
  // An account must not undo a staff revocation by resubmitting twice.
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values
    ('staff','Synthetic Staff','reviewer@example.test',true,now(),now()),
    ('revoked','Jordan Revocation Test','revoked@example.test',true,now(),now())`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility)
    values (2,'synthetic-revocation','Jordan Revocation Test','private')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (3,1,2,2500,'private'), (4,2,2,2480,'private')`;
  const first = await claim("revoked", 3);
  assert.equal(first.status, "approved");
  await claims.revokeAthleteOwnership(
    { claimId: first.claimId, staffNote: "Synthetic identity check rejected this ownership." },
    { userId: "staff", staffEmail: "reviewer@example.test" },
  );
  for (let attempt = 1; attempt <= 3; attempt++) {
    assert.equal(
      (await claim("revoked", 3)).status,
      "pending",
      `Staff revocation cannot be bypassed by resubmission ${attempt}`,
    );
  }
  assert.equal(
    (
      await sql`select user_id from athlete_account_links
    where athlete_id=2 and status='active'`
    ).length,
    0,
  );
  await claims.withdrawResultClaim({ claimId: first.claimId }, user("revoked"));
  assert.equal(
    (await claim("revoked", 4)).status,
    "pending",
    "A staff revocation also applies to another result of the same athlete",
  );
  // Removing the reviewer must not remove the decision's durable marker.
  await sql`delete from "user" where id='staff'`;
  for (let attempt = 0; attempt < 2; attempt++)
    assert.equal((await claim("revoked", 3)).status, "pending");

  if (postgres) {
    // Real independent PostgreSQL transactions, not PGlite's single session.
    configured = false;
    await sql`insert into athletes(id,slug,display_name,profile_visibility)
      values (10,'synthetic-racing','Concurrent Synthetic Athlete','private')`;
    await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility)
      values (10,1,10,2500,'private'),(11,2,10,2490,'private')`;
    for (let i = 0; i < 6; i++)
      await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
      values (${"race-" + i},'Concurrent Synthetic Athlete',${"race-" + i + "@example.test"},true,now(),now())`;
    const contested = await Promise.all(
      Array.from({ length: 6 }, (_, i) => claim("race-" + i, 10 + (i % 2))),
    );
    assert.equal(
      contested.filter((c) => c.status === "approved").length,
      1,
      "Exactly one simultaneous first claimant gets ownership",
    );
    assert.equal(contested.filter((c) => c.status === "pending").length, 5);
    assert.equal(
      (await sql`select * from athlete_account_links where athlete_id=10 and status='active'`)
        .length,
      1,
    );
    const pendingIndex = contested.findIndex((c) => c.status === "pending");
    await Promise.all(
      Array.from({ length: 6 }, () => claim("race-" + pendingIndex, 10 + (pendingIndex % 2))),
    );
    assert.equal(
      (await sql`select * from result_claims where athlete_id=10`).length,
      6,
      "Concurrent repeated submissions cannot create extra claims",
    );
    assert.equal(
      (
        await sql`select * from result_claim_alerts where claim_id in
      (select id from result_claims where athlete_id=10)`
      ).length,
      5,
    );
    configured = true;
    failEmail = false;
    const firstConcurrentSend = sends.length;
    await Promise.all(Array.from({ length: 4 }, () => alerts.deliverClaimConflictAlerts(sql)));
    const concurrentSends = sends.slice(firstConcurrentSend);
    const keys = concurrentSends.map((s) => s.options.idempotencyKey);
    assert.equal(new Set(keys).size, keys.length, "Overlapping workers send each delivery once");
    assert.equal(
      (
        await sql`select * from result_claim_alert_deliveries where sent_at is null
      and claim_id in (select id from result_claims where athlete_id=10)`
      ).length,
      0,
    );
    await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
      values ('concurrent-staff','Synthetic Staff','concurrent-staff@example.test',true,now(),now())`;
    const reviewer = { userId: "concurrent-staff", staffEmail: "concurrent-staff@example.test" };
    await claims.revokeAthleteOwnership(
      {
        claimId: contested.find((c) => c.status === "approved").claimId,
        staffNote: "Synthetic review of competing identities.",
      },
      reviewer,
    );
    const decisions = await Promise.allSettled(
      contested
        .filter((c) => c.status === "pending")
        .map((c) => claims.reviewResultClaim({ claimId: c.claimId, action: "approve" }, reviewer)),
    );
    assert.equal(
      decisions.filter((d) => d.status === "fulfilled").length,
      1,
      "Simultaneous staff approvals produce only one owner",
    );
    for (const decision of decisions)
      if (decision.status === "rejected")
        assert.match(
          decision.reason.message,
          /Only a pending claim|already owned/,
          "Losing staff decisions must not deadlock or overwrite ownership",
        );
    const [finalOwner] =
      await sql`select user_id from athlete_account_links where athlete_id=10 and status='active'`;
    const otherIndex = contested.findIndex((_, i) => "race-" + i !== finalOwner.user_id);
    const renewed = await claim("race-" + otherIndex, 10 + (otherIndex % 2));
    const withdrawalRace = await Promise.allSettled([
      claims.withdrawResultClaim({ claimId: renewed.claimId }, user("race-" + otherIndex)),
      claim("race-" + otherIndex, 10 + (otherIndex % 2)),
    ]);
    assert(
      withdrawalRace.every((outcome) => outcome.status === "fulfilled"),
      "A simultaneous withdrawal and resubmission must not deadlock",
    );
    assert.equal(
      (
        await sql`select user_id from athlete_account_links where athlete_id=10 and status='active'`
      )[0].user_id,
      finalOwner.user_id,
    );
    console.log(
      "PostgreSQL contention passed: simultaneous first claims, repeated submissions, competing staff approvals and overlapping email workers.",
    );
  }
  // A long queue delay is not an ambiguous delivery: the first attempt is safe.
  failEmail = false;
  const delayedEmail = { ...sends[0].email, to: "delayed-staff@example.test" };
  await sql`insert into result_claim_alert_deliveries(claim_id,recipient,email_payload,created_at)
    values (${conflict.claimId},${delayedEmail.to},${JSON.stringify(delayedEmail)}::jsonb,now()-interval '2 days')`;
  assert.equal(
    (await alerts.deliverClaimConflictAlerts(sql, conflict.claimId)).sent,
    1,
    "An alert that has never been attempted must still send after a long queue delay",
  );
  const interruptedEmail = { ...sends[0].email, to: "interrupted-staff@example.test" };
  const [interrupted] =
    await sql`insert into result_claim_alert_deliveries(claim_id,recipient,email_payload)
    values (${conflict.claimId},${interruptedEmail.to},${JSON.stringify(interruptedEmail)}::jsonb) returning id`;
  failSentWrite = true;
  assert.equal((await alerts.deliverClaimConflictAlerts(sql, conflict.claimId)).failed, 1);
  const ambiguousSend = JSON.stringify(sends.at(-1));
  const [durableAttempt] =
    await sql`select first_attempt_at,attempts,sent_at from result_claim_alert_deliveries where id=${interrupted.id}`;
  assert(durableAttempt.first_attempt_at);
  assert.equal(durableAttempt.attempts, 1);
  assert.equal(durableAttempt.sent_at, null);
  failSentWrite = false;
  const beforeBackoff = sends.length;
  await alerts.deliverClaimConflictAlerts(sql, conflict.claimId);
  assert.equal(
    sends.length,
    beforeBackoff,
    "An interrupted receipt still respects its reservation",
  );
  await sql`update result_claim_alert_deliveries set next_attempt_at=now()-interval '1 second' where id=${interrupted.id}`;
  assert.equal((await alerts.deliverClaimConflictAlerts(sql, conflict.claimId)).sent, 1);
  assert.equal(
    JSON.stringify(sends.at(-1)),
    ambiguousSend,
    "Uncertain provider acceptance retries the same payload and idempotency key",
  );
  // Execute the actual HTTP worker handler as well as its authorization helper.
  const worker = load("src/routes/api/result-claim-alerts.ts", {
    "@tanstack/react-router": { createFileRoute: () => (config) => config },
    "@/lib/athrecs/result-claim-alerts.server": alerts,
    "@/lib/db": connection,
  }).Route.server.handlers.GET;
  process.env.CRON_SECRET = "synthetic-worker-key";
  const requestFor = (token) =>
    new Request("https://example.test/api/result-claim-alerts", {
      headers: token ? { authorization: token } : {},
    });
  const beforeUnauthorized = sends.length;
  for (const token of [undefined, "Bearer wrong", "Basic synthetic-worker-key"]) {
    const response = await worker({ request: requestFor(token) });
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  process.env.VERCEL_ENV = "preview";
  assert.equal((await worker({ request: requestFor("Bearer synthetic-worker-key") })).status, 503);
  assert.equal(sends.length, beforeUnauthorized, "Denied and preview HTTP calls cannot send mail");
  process.env.VERCEL_ENV = "production";
  assert.equal((await worker({ request: requestFor("Bearer synthetic-worker-key") })).status, 200);
  // Validate the real email transport header without network access.
  const transport = load("src/lib/auth/email.server.ts");
  const savedFetch = globalThis.fetch;
  let request;
  process.env.RESEND_API_KEY = "synthetic-key";
  globalThis.fetch = async (...args) => {
    request = args;
    return { ok: true };
  };
  try {
    await transport.sendAthrecsAuthEmail(sends[0].email, sends[0].options);
    assert.equal(request[1].headers["Idempotency-Key"], sends[0].options.idempotencyKey);
    assert(request[1].signal instanceof AbortSignal);
  } finally {
    globalThis.fetch = savedFetch;
  }
  console.log(
    "Result conflict flow passed: registration, suggestions, claim ownership, atomic outbox, email retry and access guards.",
  );
} finally {
  for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
  Object.assign(process.env, savedEnv);
  await db.close();
}
