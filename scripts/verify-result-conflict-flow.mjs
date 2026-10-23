// Exercise the real matching, claim and outbox code against a disposable schema.
// All athletes/accounts/results are synthetic; all outgoing emails are captured.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool, types } from "pg";
import * as resultCandidateGroups from "../src/lib/athrecs/result-candidate-groups.ts";
import * as resultMatch from "../src/lib/athrecs/result-match.ts";
import * as matchingSettings from "../src/lib/athrecs/result-matching-settings.ts";
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
  "./result-match": resultMatch,
  "./result-matching-settings": matchingSettings,
  "@tanstack/react-start/server": { setResponseHeader() {} },
  "./claim-identity.server": load("src/lib/athrecs/claim-identity.server.ts", {
    "./result-matching-settings": matchingSettings,
  }),
  "./profile-connections": load("src/lib/athrecs/profile-connections.ts"),
};
const matches = load("src/lib/athrecs/result-match-api.ts", shared);
const invitationCore = load("src/lib/athrecs/claim-invitation.ts", {
  zod: require("zod"),
  "./athlete-contact": load("src/lib/athrecs/athlete-contact.ts", {
    zod: require("zod"),
    "./profile-connections": shared["./profile-connections"],
  }),
});
const invitationSends = [];
process.env.ATHRECS_INVITATION_RESEND_API_KEY = "synthetic-invitation-only-key";
const invitations = load("src/lib/athrecs/claim-invitations.server.ts", {
  "node:crypto": crypto,
  "@/lib/db": connection,
  "@/lib/site-scope": scope,
  "@/lib/auth/email.server": {
    sendAthrecsAuthEmail: async (email, options) => {
      assert.equal(options.apiKey, "synthetic-invitation-only-key");
      assert.equal(options.from, "paul@athrecs.com");
      assert.equal(options.replyTo, "paul@athrecs.com");
      const id = options.idempotencyKey.split("/").at(-1);
      const [marker] =
        await sql`select first_attempt_at,reserved_until from athlete_claim_invitations where id=${id}`;
      assert(
        marker.first_attempt_at && marker.reserved_until,
        "Invitation reservation is committed before provider call",
      );
      invitationSends.push({ email, options });
    },
  },
  "./result-match": shared["./result-match"],
  "./profile-connections": shared["./profile-connections"],
  "./claim-invitation": invitationCore,
});
const reviewCore = load("src/lib/athlete-workspace/core.ts", { zod: require("zod") });
const resultReview = load("src/lib/athrecs/profile-result-review.server.ts", {
  "./result-candidate-groups": resultCandidateGroups,
  "node:crypto": crypto,
  "../athlete-workspace/core": reviewCore,
});
const summarySends = [];
const summaryReceipts = load("src/lib/athrecs/profile-result-receipts.server.ts", {
  "./result-claim-alerts.server": alerts,
  "./result-claim-email.server": {
    notifyProfileResultsConfirmed: async (payload) => summarySends.push(payload),
  },
});
const claims = load("src/lib/athrecs/result-claims-api.ts", {
  "./profile-result-receipts.server": summaryReceipts,
  "./profile-result-review": load("src/lib/athrecs/profile-result-review.ts", {
    zod: require("zod"),
    "../athlete-workspace/core": reviewCore,
  }),
  "./profile-result-review.server": resultReview,
  "./claim-invitations-api": { privateClaimMiddleware: "private" },
  "./claim-invitation": invitationCore,
  "./claim-invitations.server": invitations,
  ...shared,
  "./athlete-account-api": { syncAthleteAccountAfterClaim: async () => {} },
  "./result-claim-alerts.server": alerts,
  "./result-claim-email.server": {
    notifyProfileResultsConfirmed: async (email) => receipts.push({ summary: email }),
    notifyResultClaimSubmitted: async (
      email,
      { notifyStaff = true, notifyAthlete = true, selfConfirmed = false } = {},
    ) => receipts.push({ email, notifyStaff, notifyAthlete, selfConfirmed }),
    notifyResultClaimReviewed: async () => {},
    notifyResultClaimWithdrawn: async () => {},
  },
});
// These tests exercise conflicts after the claimant completes required identity.
// Missing/forged identity and verified-email enforcement are tested through real
// authenticated HTTP in verify-intelligent-result-matching.mjs.
async function completeSyntheticIdentity(userId) {
  await sql`insert into athlete_private_profiles(user_id,verified_email,full_name,date_of_birth,nationality,privacy_notice_version,privacy_acknowledged_at)
    select id,email,coalesce(nullif(trim(name),''),'Synthetic Unnamed'),date '1984-01-01','Irish','synthetic-test',now() from "user" where id=${userId}
    on conflict(user_id) do update set date_of_birth=coalesce(athlete_private_profiles.date_of_birth,excluded.date_of_birth),nationality=coalesce(nullif(athlete_private_profiles.nationality,''),excluded.nationality)`;
}
async function submitWithIdentity(data, context) {
  await completeSyntheticIdentity(context.userId);
  return claims.submitResultClaim(data, context);
}
async function reviewWithIdentity(data, context) {
  const [row] = await sql`select claimant_user_id from result_claims where id=${data.claimId}`;
  if (row) await completeSyntheticIdentity(row.claimant_user_id);
  return claims.reviewResultClaim(data, context);
}
const user = (id) => ({ userId: id });
const claim = (id, resultId = 1) =>
  submitWithIdentity({ resultId, declarationAccepted: true }, user(id));
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
  await sql`insert into athletes(id,slug,display_name,profile_visibility,country,county,profile_type)
    values (1,'synthetic-avery','Avery Test Athlete','private','','','Public figure')`;
  await sql`insert into events(id,slug,name,sport) values (1,'synthetic-race','Synthetic Race','Running')`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values
    (1,1,'2025-05-04','10K'),(2,1,'2026-05-04','10K')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (1,1,1,2400,'private'),(2,2,1,2390,'private')`;
  const originalResults = JSON.stringify(await sql`select * from results order by id`);
  assert.deepEqual(claims.submitResultClaim.middleware, ["private", "authenticated"]);
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
    () => submitWithIdentity({ resultId: 1, declarationAccepted: false }, user("one")),
    /Confirm/,
  );
  const initialClaim = await claim("one");
  assert.equal(
    initialClaim.status,
    "pending",
    "A protected public-figure profile requires staff review",
  );
  assert.equal(
    await count("athlete_account_links"),
    0,
    "A held claim must not grant control of the athlete",
  );
  assert.equal(
    (await claim("one")).status,
    "pending",
    "Replaying an uncontested claim cannot bypass review",
  );
  const otherResultClaim = await submitWithIdentity(
    {
      resultId: 2,
      declarationAccepted: true,
      evidenceUrl: "https://example.test/self-declared-profile",
      status: "approved",
      reviewed_by_user_id: "staff",
    },
    user("one"),
  );
  assert.equal(
    otherResultClaim.status,
    "pending",
    "Another result, a supplied URL and forged review fields cannot establish ownership",
  );
  assert.equal(await count("athlete_account_links"), 0);
  assert.equal(receipts.at(-1).notifyStaff, true, "Held claims reach the staff queue");
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt")
    values ('initial-reviewer','Synthetic Reviewer','initial-reviewer@example.test',true,now(),now())`;
  await assert.rejects(
    () =>
      reviewWithIdentity(
        { claimId: initialClaim.claimId, action: "approve" },
        { userId: "initial-reviewer", staffEmail: "initial-reviewer@example.test" },
      ),
    /independent identity evidence/,
  );
  await reviewWithIdentity(
    {
      claimId: initialClaim.claimId,
      action: "approve",
      staffNote: "Synthetic independent identity check completed.",
    },
    { userId: "initial-reviewer", staffEmail: "initial-reviewer@example.test" },
  );
  assert.equal(
    (await sql`select status from result_claims where id=${otherResultClaim.claimId}`)[0].status,
    "approved",
    "Same-claimant sibling claims complete together rather than being rejected",
  );
  assert.equal(
    (
      await sql`select confirmation_method from result_claims where id=${otherResultClaim.claimId}`
    )[0].confirmation_method,
    "staff",
  );
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
  await sql`insert into athletes(id,slug,display_name,profile_visibility,profile_type)
    values (2,'synthetic-revocation','Jordan Revocation Test','private','Public figure')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility)
    values (3,1,2,2500,'private'), (4,2,2,2480,'private')`;
  const first = await claim("revoked", 3);
  assert.equal(first.status, "pending");
  await reviewWithIdentity(
    {
      claimId: first.claimId,
      action: "approve",
      staffNote: "Synthetic identity evidence checked.",
    },
    { userId: "staff", staffEmail: "reviewer@example.test" },
  );
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
    await sql`insert into athletes(id,slug,display_name,profile_visibility,profile_type)
      values (10,'synthetic-racing','Concurrent Synthetic Athlete','private','Public figure')`;
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
      0,
      "Simultaneous claims on a protected public-figure profile all require review",
    );
    assert.equal(contested.filter((c) => c.status === "pending").length, 6);
    assert.equal(
      (await sql`select * from athlete_account_links where athlete_id=10 and status='active'`)
        .length,
      0,
    );
    // Transaction order is deliberately nondeterministic. Replay an account
    // that already has a conflict alert, rather than assuming who submitted first.
    const [alertedClaim] = await sql`select claim.claimant_user_id from result_claims claim
      join result_claim_alerts alert on alert.claim_id=claim.id
      where claim.athlete_id=10 order by claim.id limit 1`;
    const pendingIndex = Number(alertedClaim.claimant_user_id.slice("race-".length));
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
    // Each worker deliberately sends at most three deliveries. Earlier cases
    // leave a backlog, so one wave is not guaranteed to reach these new claims.
    // Keep overlapping workers and the final zero-pending/unique-key assertions.
    for (let wave = 0; wave < 4; wave++) {
      await Promise.all(Array.from({ length: 4 }, () => alerts.deliverClaimConflictAlerts(sql)));
      const pending = await sql`select id from result_claim_alert_deliveries where sent_at is null
        and claim_id in (select id from result_claims where athlete_id=10)`;
      if (!pending.length) break;
    }
    assert(sends.length > firstConcurrentSend, "Overlapping workers must make delivery progress");
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
    const decisions = await Promise.allSettled(
      contested
        .filter((c) => c.status === "pending")
        .map((c) =>
          reviewWithIdentity(
            {
              claimId: c.claimId,
              action: "approve",
              staffNote: "Synthetic independent identity evidence checked.",
            },
            reviewer,
          ),
        ),
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
    "@/lib/athrecs/profile-result-receipts.server": summaryReceipts,
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
  // Exercise invitation contention against independent PostgreSQL connections
  // in CI (or the serial disposable PGlite adapter locally).
  await sql`insert into "user"(id,name,email,"emailVerified") values('invite-target','','invite-target@example.test',true)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,country,county) values(20,'synthetic-invite-target','Synthetic Invited Athlete','private','','')`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(20,1,20,'finished')`;
  const inviteInput = {
    userId: "invite-target",
    athleteId: 20,
    matchNote: "Synthetic club identity checked for invitation",
  };
  const created = await Promise.all(
    Array.from({ length: 6 }, () => invitations.createInvitation(sql, "one", inviteInput)),
  );
  assert.equal(
    new Set(created.map((i) => i.id)).size,
    1,
    "Concurrent creation returns one invitation",
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from athlete_claim_invitations where user_id='invite-target'`
    )[0].n,
    1,
  );
  await Promise.all(
    Array.from({ length: 6 }, () => invitations.sendInvitationEmail(sql, created[0].id)),
  );
  assert.equal(invitationSends.length, 1, "Concurrent email attempts invoke the provider once");
  const invitation = new URL(created[0].url).searchParams.get("invitation");
  const beforeReceipts = receipts.length;
  const accepted = await Promise.all(
    Array.from({ length: 6 }, () =>
      submitWithIdentity(
        { resultId: 20, invitation, declarationAccepted: true },
        user("invite-target"),
      ),
    ),
  );
  assert.equal(
    new Set(accepted.map((c) => c.claimId)).size,
    1,
    "Concurrent submissions keep one claim",
  );
  assert.equal(
    receipts.length - beforeReceipts,
    1,
    "Concurrent acceptance sends one claim receipt",
  );
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=20`).length,
    0,
    "Invitation acceptance never assigns ownership",
  );
  assert.equal((await invitations.invitationHistory(sql, "invite-target"))[0].status, "pending");
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(21,'synthetic-before-signup','Synthetic New Athlete','private'),(22,'synthetic-contact-only','Synthetic Contact Athlete','private')`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(21,1,21,'finished'),(22,1,22,'finished')`;
  const newInput = {
    athleteId: 21,
    recipientName: "Synthetic New Athlete",
    email: "late-signup@example.test",
    phone: "",
    telegramUsername: "",
    socialLinks: [],
    sourceNote: "Synthetic recipient confirmed contact",
    matchNote: "Synthetic staff checked the profile and contact",
    reviewed: true,
  };
  const newInvites = await Promise.all(
    Array.from({ length: 6 }, () => invitations.createExternalInvitation(sql, "one", newInput)),
  );
  assert.equal(
    new Set(newInvites.map((item) => item.id)).size,
    1,
    "Concurrent pre-registration invitations reuse one token",
  );
  const beforeNewEmail = invitationSends.length;
  await Promise.all(
    Array.from({ length: 6 }, () => invitations.sendInvitationEmail(sql, newInvites[0].id)),
  );
  assert.equal(
    invitationSends.length - beforeNewEmail,
    1,
    "Concurrent pre-registration emails send once",
  );
  await sql`insert into "user"(id,name,email,"emailVerified") values('late-signup','','late-signup@example.test',true),('contact-one','','contact-one@example.test',true),('contact-two','','contact-two@example.test',true)`;
  const lateToken = new URL(newInvites[0].url).searchParams.get("invitation");
  const lateClaims = await Promise.all(
    Array.from({ length: 6 }, () =>
      submitWithIdentity(
        { resultId: 21, invitation: lateToken, declarationAccepted: true },
        user("late-signup"),
      ),
    ),
  );
  assert.equal(new Set(lateClaims.map((item) => item.claimId)).size, 1);
  assert.equal(
    (await sql`select user_id from athlete_claim_invitations where id=${newInvites[0].id}`)[0]
      .user_id,
    "late-signup",
  );
  const contactInvite = await invitations.createExternalInvitation(sql, "one", {
    ...newInput,
    athleteId: 22,
    email: "",
    phone: "+447700900125",
  });
  const contactToken = new URL(contactInvite.url).searchParams.get("invitation");
  const competingInvites = await Promise.allSettled(
    ["contact-one", "contact-two"].map((id) =>
      submitWithIdentity(
        { resultId: 22, invitation: contactToken, declarationAccepted: true },
        user(id),
      ),
    ),
  );
  assert.equal(
    competingInvites.filter((item) => item.status === "fulfilled").length,
    1,
    "One account can consume a contact-only token",
  );
  assert.match(
    competingInvites.find((item) => item.status === "rejected").reason.message,
    /invitation is unavailable/,
  );
  assert.equal(
    (await sql`select count(*)::int as n from result_claims where athlete_id=22`)[0].n,
    1,
  );
  assert.equal(
    (await sql`select count(*)::int as n from athlete_account_links where athlete_id in (21,22)`)[0]
      .n,
    0,
    "Concurrent external claims never assign ownership",
  );
  console.log(
    "Invitation contention passed: concurrent creation, email reservation and claim submission.",
  );
  // New self-confirmation policy: completion is distinct from verified evidence.
  configured = false;
  const beforeAthletes = await count("athletes");
  await sql`insert into "user"(id,name,email,"emailVerified") values
    ('self','Morgan Claim Test','self@example.test',true),
    ('child','Casey Child Test','child@example.test',true),
    ('guardian','Robin Guardian Test','guardian@example.test',true)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility,date_of_birth) values
    (100,'synthetic-self','Morgan Claim Test','private',null),
    (101,'synthetic-child','Casey Child Test','private',current_date - interval '10 years'),
    (102,'synthetic-guardian','Robin Guardian Test','private',null)`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,result_visibility) values
    (100,1,100,2500,'private'),(103,2,100,2490,'private'),
    (101,1,101,2000,'private'),(102,1,102,2000,'private')`;
  // An older untouched pending claim is completed without inserting a duplicate.
  await sql`insert into result_claims(result_id,athlete_id,claimant_user_id,claimant_email,status,verification_method,declaration_accepted)
    values (100,100,'self','self@example.test','pending','other',true),
      (103,100,'self','self@example.test','pending','other',true)`;
  const beforeSources = JSON.stringify(
    await sql`select * from results where athlete_id=100 order by id`,
  );
  failOutbox = true;
  await assert.rejects(() => claim("self", 100), /Synthetic outbox failure/);
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=100`).length,
    0,
    "Claim and durable staff notification commit atomically",
  );
  failOutbox = false;
  configured = true;
  failEmail = true;
  const beforeCompletionSend = sends.length;
  const self = await claim("self", 100);
  assert.equal(self.status, "approved");
  const [completedAlert] =
    await sql`select * from result_claim_alerts where claim_id=${self.claimId}`;
  assert.equal(completedAlert.event_kind, "claim_completed");
  assert.equal(
    (await alerts.deliverClaimAlerts(sql, self.claimId)).sent,
    0,
    "Immediate failed notification respects retry backoff",
  );
  assert.equal(
    (await sql`select status from result_claims where id=${self.claimId}`)[0].status,
    "approved",
    "A failed staff email cannot undo the completed claim",
  );
  const completionSend = sends.at(-1);
  assert.equal(sends.length, beforeCompletionSend + 1);
  assert.match(completionSend.email.subject, /result claimed/);
  assert.match(completionSend.email.message, /without waiting for staff approval/);
  assert.match(completionSend.email.actionUrl, new RegExp(`claimId=${self.claimId}$`));
  assert.doesNotMatch(completionSend.email.heading, /needs review/);
  await sql`update result_claim_alert_deliveries set next_attempt_at=now() where claim_id=${self.claimId}`;
  failEmail = false;
  assert.equal((await alerts.deliverClaimAlerts(sql, self.claimId)).sent, 1);
  assert.deepEqual(sends.at(-1), completionSend, "Completed-claim retries retain payload and key");
  await alerts.deliverClaimAlerts(sql, self.claimId);
  assert.equal(sends.length, beforeCompletionSend + 2, "A successful completion alert sends once");
  configured = false;
  assert.equal(receipts.at(-1).selfConfirmed, true);
  assert.equal(
    receipts.at(-1).notifyStaff,
    false,
    "Straightforward completion does not create a staff review email",
  );
  const selfClaims = await claims.listMyResultClaims(undefined, user("self"));
  assert.equal(selfClaims.length, 2);
  assert(
    selfClaims.every(
      (c) =>
        c.status === "approved" &&
        c.confirmationMethod === "athlete" &&
        c.confirmedAt &&
        !c.reviewedAt &&
        !c.staffNote,
    ),
  );
  assert.equal(
    (await sql`select confirmation_method from athlete_account_links where athlete_id=100`)[0]
      .confirmation_method,
    "athlete",
  );
  assert.equal(
    JSON.stringify(await sql`select * from results where athlete_id=100 order by id`),
    beforeSources,
    "Claiming cannot upgrade timing, source evidence or publication",
  );
  assert.equal(
    await count("athletes"),
    beforeAthletes + 3,
    "Claims do not create duplicate athlete profiles",
  );
  const beforeRepeat = receipts.length;
  const selfReplay = await Promise.all(Array.from({ length: 6 }, () => claim("self", 103)));
  assert(selfReplay.every((c) => c.status === "approved" && c.alreadyOwned));
  assert.equal(
    receipts.length,
    beforeRepeat,
    "Completed claims are idempotent without repeated receipts",
  );
  assert.equal(
    (await sql`select * from result_claim_alerts where claim_id=${self.claimId}`).length,
    1,
    "Repeated and sibling claims reuse one completed-claim notification",
  );
  const child = await claim("child", 101);
  assert.equal(child.status, "pending");
  assert.match(
    (await claims.listMyResultClaims(undefined, user("child")))[0].conflictReason,
    /responsible adult/,
  );
  const guardian = await submitWithIdentity(
    { resultId: 102, declarationAccepted: true, claimantRole: "guardian" },
    user("guardian"),
  );
  assert.equal(guardian.status, "pending");
  assert.equal(
    (await claim("guardian", 102)).status,
    "pending",
    "Removing guardian flag cannot skip the authority check",
  );
  assert.equal(
    (await claim("guardian", 102)).status,
    "pending",
    "Repeated omission cannot erase the guardian safeguard",
  );
  assert.equal(
    (await claims.listMyResultClaims(undefined, user("guardian")))[0].claimantRole,
    "guardian",
  );
  await sql`update athletes set date_of_birth=null where id=101`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values(101,1,current_date,'5K')`;
  await sql`update results set edition_id=101,category='JW11-14' where id=101`;
  assert.equal(
    (await claim("child", 101)).status,
    "pending",
    "Recent junior results protect children even with no stored birth date",
  );
  await sql`update results set category=null where id=101`;
  await sql`update "user" set name='Different Name' where id='child'`;
  await sql`update athlete_private_profiles set full_name='Different Name' where user_id='child'`;
  assert.equal(
    (await claim("child", 101)).status,
    "pending",
    "An existing submission does not bypass current name discrepancy checks",
  );
  // Self-confirmed ownership can be revoked, and all sibling claims reflect it.
  await claims.revokeAthleteOwnership(
    { claimId: self.claimId, staffNote: "Synthetic dispute requires review" },
    { userId: "initial-reviewer", staffEmail: "initial-reviewer@example.test" },
  );
  assert(
    (await claims.listMyResultClaims(undefined, user("self"))).every(
      (c) => c.status === "rejected",
    ),
  );
  assert.equal((await claim("self", 103)).status, "pending");
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=100 and status='active'`)
      .length,
    0,
  );
  // Concurrency test also runs with independent PostgreSQL connections in CI.
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(104,'synthetic-auto-race','Concurrent Self Test','private')`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(104,1,104,'finished')`;
  for (let i = 0; i < 6; i++)
    await sql`insert into "user"(id,name,email,"emailVerified") values(${"self-race-" + i},'Concurrent Self Test',${"self-race-" + i + "@example.test"},true)`;
  const concurrentSelf = await Promise.all(
    Array.from({ length: 6 }, (_, i) => claim("self-race-" + i, 104)),
  );
  assert.equal(concurrentSelf.filter((c) => c.status === "approved").length, 1);
  assert.equal(concurrentSelf.filter((c) => c.status === "pending").length, 5);
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=104 and status='active'`)
      .length,
    1,
  );
  console.log(
    "Self-confirmed claims passed: immediate completion, sibling claims, child/guardian review, revocation, concurrency and source preservation.",
  );
  // Source-only Run Norwich profiles use stable foreign-keyed claims, with no
  // fabricated canonical edition/date and no duplicate public performance.
  await sql`insert into athletes(id,slug,display_name,profile_visibility,country,county) values
    (8001,'source-claim-runner','Source Claim Runner','public','',''),
    (8002,'virtual-claim-runner','Virtual Claim Runner','public','','')`;
  const sourceRow = {
    year: 2026,
    date: "2026-09-06",
    meeting: "Run Norwich 2026",
    discipline: "10K",
    performance: "40:05",
    place: "25",
    ageGroup: "M40",
    labels: ["Club at race: Synthetic Harriers"],
    places: { overall: 25, gender: 20, category: 3 },
    verificationStatus: "source_verified",
    sourceUrls: ["https://example.test/norwich.pdf"],
    archiveReference: {
      sourceRow: "RN2026:9001",
      captureId: 1,
      original: { Bib: "9001", Age: "42", "Gun Time": "41:01" },
    },
  };
  const virtualRow = {
    ...sourceRow,
    year: 2020,
    date: "",
    meeting: "Run Norwich 2020 (Virtual)",
    discipline: "10K Virtual",
    performance: "00:42:05",
    verificationStatus: "unverified",
    dateLabel: "18–24 October 2020 (individual run date not supplied)",
    archiveReference: { sourceRow: "RN2020:p1:r1", captureId: 2, original: { Age: "36" } },
  };
  for (const [athlete, p] of [
    [8001, sourceRow],
    [8002, virtualRow],
  ]) {
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
      values(${athlete},'Run Norwich official results',${String(athlete)},'https://example.test/norwich.pdf',now(),false,${[p.year]},${[p.year]},${JSON.stringify([p])}::jsonb,now())`;
  }
  await sql`insert into "user"(id,name,email,"emailVerified") values
    ('source-claim','Source Claim Runner','source-claim@example.test',true),
    ('source-rival','Source Claim Runner','source-rival@example.test',true),
    ('virtual-claim','Virtual Claim Runner','virtual-claim@example.test',true)`;
  const sourceMatches = (
    await matches.listMyPotentialResultMatches(undefined, user("source-claim"))
  ).matches;
  assert.equal(sourceMatches.length, 1);
  const sourceId = sourceMatches[0].resultId;
  assert(sourceId < 0);
  assert.equal(sourceMatches[0].finishTimeSeconds, 2405, "mm:ss stays minutes, never hours");
  assert.equal(sourceMatches[0].clubName, "Synthetic Harriers");
  assert.equal(sourceMatches[0].ageAtRace, "42");
  const sourceDetail = await claims.getClaimableResult(
    { resultId: sourceId },
    user("source-claim"),
  );
  assert.equal(sourceDetail.gunTimeSeconds, 2461);
  assert.equal(sourceDetail.categoryPlace, 3);
  assert.equal(await claims.getClaimableResult({ resultId: sourceId }, user("unrelated")), null);
  await assert.rejects(claim("unrelated", sourceId), /not available/);
  const sourceClaim = await claim("source-claim", sourceId);
  assert.equal(sourceClaim.status, "approved");
  assert.equal((await claim("source-claim", sourceId)).claimId, sourceClaim.claimId);
  const [savedSourceClaim] =
    await sql`select result_id,source_result_id,source_evidence from result_claims where id=${sourceClaim.claimId}`;
  assert.equal(savedSourceClaim.result_id, null);
  assert.equal(savedSourceClaim.source_result_id, -sourceId);
  assert.deepEqual(savedSourceClaim.source_evidence, sourceRow);
  const rivalSourceClaim = await claim("source-rival", sourceId);
  assert.equal(rivalSourceClaim.status, "pending");
  assert(
    (await sql`select 1 from result_claim_alerts where claim_id=${rivalSourceClaim.claimId}`)
      .length,
  );
  assert.equal(
    (await sql`select user_id from athlete_account_links where athlete_id=8001`)[0].user_id,
    "source-claim",
  );
  assert.equal(
    (await claims.listMyResultClaims(undefined, user("source-claim")))[0].resultId,
    sourceId,
  );
  const virtualMatches = (
    await matches.listMyPotentialResultMatches(undefined, user("virtual-claim"))
  ).matches;
  assert.equal(virtualMatches.length, 1);
  assert.equal(virtualMatches[0].eventDate, virtualRow.dateLabel);
  const virtualId = virtualMatches[0].resultId;
  const virtualDetail = await claims.getClaimableResult(
    { resultId: virtualId },
    user("virtual-claim"),
  );
  assert.equal(virtualDetail.chipTimeSeconds, null);
  const sourceInvite = await invitations.createExternalInvitation(sql, "one", {
    athleteId: 8002,
    recipientName: "Virtual Claim Runner",
    email: "virtual-claim@example.test",
    phone: "",
    telegramUsername: "",
    socialLinks: [],
    sourceNote: "Synthetic source profile invitation",
    matchNote: "Synthetic source profile invitation",
    reviewed: true,
  });
  assert.equal(Number(new URL(sourceInvite.url).searchParams.get("resultId")), virtualId);
  await submitWithIdentity(
    {
      resultId: virtualId,
      invitation: new URL(sourceInvite.url).searchParams.get("invitation"),
      declarationAccepted: true,
    },
    user("virtual-claim"),
  );
  await sql`update athlete_source_histories set published_at=published_at where athlete_id in (8001,8002)`;
  assert.equal(
    (
      await sql`select count(*)::int n from source_history_claim_results where athlete_id in (8001,8002)`
    )[0].n,
    2,
    "repeat projection preserves IDs",
  );
  assert.equal(
    (await sql`select count(*)::int n from results where athlete_id in (8001,8002)`)[0].n,
    0,
    "claim integration never duplicates canonical results",
  );
  assert.deepEqual(
    (await sql`select performances from athlete_source_histories where athlete_id=8002`)[0]
      .performances,
    [virtualRow],
  );
  await sql`update athlete_source_histories set published_at=null where athlete_id=8002`;
  assert.equal(
    (await matches.listMyPotentialResultMatches(undefined, user("virtual-claim"))).matches.length,
    0,
    "unpublished history is not discoverable",
  );
  console.log(
    "Source-history claims passed: dates/windows, club/age/placings, minute precision, authorization, stable IDs, evidence snapshot, invitations, conflict review and no canonical duplicates.",
  );
  // Whole-profile review uses one declaration and one receipt, not one claim per row.
  configured = true;
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('batch-user','Batch Test Athlete','batch@example.test',true,now(),now()),('batch-staff','Batch Reviewer','batch-reviewer@example.test',true,now(),now())`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(8200,'batch-test-athlete','Batch Test Athlete','public')`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values(8203,1,'2024-05-04','10K')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(8201,1,8200,2345,'finished'),(8202,2,8200,2378,'finished'),(8203,8203,8200,null,'dnf')`;
  const historyRow = {
    year: 2025,
    date: "2025-03-01",
    sourceDate: "1 Mar 2025",
    ageGroup: "",
    discipline: "5K",
    performance: "18:20",
    wind: "",
    place: "12",
    venue: "Test Venue",
    meeting: "Synthetic History Race",
    sourceUrls: ["https://example.test/history"],
    labels: [],
    verificationStatus: "source_verified",
  };
  await sql`update results set source_url='https://example.test/history' where id=8202`;
  const [duplicateSource] =
    await sql`select event_name,event_date,distance_code,finish_time_seconds from athlete_claimable_results where id=8202`;
  const duplicateHistory = {
    ...historyRow,
    date: duplicateSource.event_date,
    meeting: duplicateSource.event_name,
    discipline: duplicateSource.distance_code,
    performance: `${Math.floor(duplicateSource.finish_time_seconds / 60)}:${String(duplicateSource.finish_time_seconds % 60).padStart(2, "0")}`,
  };
  await sql`insert into editions(id,event_id,event_date,distance_code) values(8204,1,'2024-05-05','10K')`;
  await sql`insert into results(id,edition_id,athlete_id,status) values(8204,8204,8200,'Unverified')`;
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values(8200,'Synthetic timing','batch-history','https://example.test/history',now(),true,array[2025],array[2025],${JSON.stringify([historyRow, duplicateHistory])}::jsonb,now())`;
  const originalBatchResults = JSON.stringify(
    await sql`select * from results where athlete_id=8200 order by id`,
  );
  const originalHistory = JSON.stringify(
    await sql`select * from athlete_source_histories where athlete_id=8200`,
  );
  const detail = await claims.getClaimableResult(
    { resultId: 8201, includeReview: true },
    user("batch-user"),
  );
  assert.equal(
    detail.review.rows.length,
    4,
    "Finished, non-finish and source-history rows are all reviewable",
  );
  assert(
    detail.review.rows.some((row) => row.key === "r:8202"),
    "Canonical key represents grouped duplicates",
  );
  assert(
    !detail.review.rows.some((row) => row.key === "r:8204"),
    "Empty unverified placeholder does not inflate review count",
  );
  assert.equal(detail.sourceUrl, null, "Stored evidence is not sent to the claim UI");
  assert(
    !JSON.stringify(detail.review).includes("example.test"),
    "Review response omits private source URLs",
  );
  assert.equal(
    await claims.getClaimableResult({ resultId: 8201, includeReview: true }, user("unrelated")),
    null,
  );
  assert.equal(
    await claims.getClaimableResult({ resultId: 8201, includeReview: true }, user("unverified")),
    null,
  );
  const batchInput = {
    resultId: 8201,
    declarationAccepted: true,
    review: {
      requestId: crypto.randomUUID(),
      snapshot: detail.review.snapshot,
      includedKeys: ["r:8201", "r:8203"],
      additions: [
        {
          index: 1,
          race: "Synthetic Missing 10K",
          date: "2025-02-02",
          distance: "10K",
          time: "42:34",
          timingBasis: "gun",
          sourceUrl: "https://example.test/missing",
          bib: "42",
          place: "",
        },
      ],
    },
  };
  await assert.rejects(
    () =>
      submitWithIdentity(
        { ...batchInput, review: { ...batchInput.review, includedKeys: ["r:8201", "r:1"] } },
        user("batch-user"),
      ),
    /does not belong/,
  );
  assert.equal(
    (await sql`select * from athlete_profile_result_confirmations where user_id='batch-user'`)
      .length,
    0,
    "Invalid selection rolls back without a claim or confirmation",
  );
  const receiptBefore = summarySends.length;
  const genericBefore = receipts.length;
  const staffBefore = sends.length;
  const submitted = await submitWithIdentity(batchInput, user("batch-user"));
  assert.equal(
    submitted.status,
    "approved",
    "An eligible batch claim completes with the same ownership safeguards",
  );
  assert.deepEqual(submitted.confirmation, { included: 2, excluded: 2, added: 1, reused: false });
  assert.equal(
    sends.length,
    staffBefore + 1,
    "Whole-profile claims notify staff once after completion",
  );
  assert.match(sends.at(-1).email.subject, /result claimed/);
  assert.equal(
    (await sql`select event_kind from result_claim_alerts where claim_id=${submitted.claimId}`)[0]
      .event_kind,
    "claim_completed",
  );
  assert.equal(
    (await sql`select * from result_claims where claimant_user_id='batch-user'`).length,
    1,
  );
  assert.equal(
    summarySends.length,
    receiptBefore + 1,
    "Exactly one athlete summary for all results",
  );
  assert.equal(summarySends.at(-1).resultId, 8201);
  assert.equal(
    summarySends.at(-1).status,
    "approved",
    "Frozen receipt reflects completed ownership",
  );
  assert.equal(
    receipts.length,
    genericBefore,
    "No generic athlete or staff email is generated for immediate batch completion",
  );
  assert.equal(
    (
      await sql`select entries from athlete_result_proposals where id=${batchInput.review.requestId}::uuid`
    )[0].entries[0].timingBasis,
    "gun",
  );
  const historyChoices =
    await sql`select excluded from athlete_profile_history_choices where user_id='batch-user' and athlete_id=8200`;
  assert.equal(
    historyChoices.length,
    2,
    "Both the standalone history and grouped history receive the choice",
  );
  assert(
    historyChoices.every((row) => row.excluded),
    "Excluding one displayed result hides all its representations",
  );
  const replay = await submitWithIdentity(batchInput, user("batch-user"));
  assert.equal(replay.confirmation.reused, true);
  assert.equal(summarySends.length, receiptBefore + 1, "Retry sends no extra athlete email");
  assert.equal(sends.length, staffBefore + 1, "Retry sends no extra staff completion notification");
  const replayNewId = await submitWithIdentity(
    { ...batchInput, review: { ...batchInput.review, requestId: crypto.randomUUID() } },
    user("batch-user"),
  );
  assert.equal(
    replayNewId.confirmation.reused,
    true,
    "Duplicate payload with a new request ID is also idempotent",
  );
  assert.equal(
    (await sql`select * from athlete_profile_hidden_results where user_id='batch-user'`)[0]
      .result_id,
    8202,
  );
  assert.equal(
    (await sql`select * from athlete_profile_history_choices where user_id='batch-user'`)[0]
      .excluded,
    true,
  );
  assert.equal(
    JSON.stringify(await sql`select * from results where athlete_id=8200 order by id`),
    originalBatchResults,
  );
  assert.equal(
    JSON.stringify(await sql`select * from athlete_source_histories where athlete_id=8200`),
    originalHistory,
    "Original source rows are never edited",
  );
  // A source edit while a review is open must fail atomically.
  const current = await claims.getClaimableResult(
    { resultId: 8201, includeReview: true },
    user("batch-user"),
  );
  await sql`update results set gun_time_seconds=2400 where id=8201`;
  await assert.rejects(
    () =>
      submitWithIdentity(
        {
          ...batchInput,
          review: {
            requestId: crypto.randomUUID(),
            snapshot: current.review.snapshot,
            includedKeys: current.review.rows.map((r) => r.key),
            additions: [],
          },
        },
        user("batch-user"),
      ),
    /results have changed/,
  );
  await sql`update results set gun_time_seconds=null where id=8201`;
  const owned = await claims.getClaimableResult(
    { resultId: 8201, includeReview: true },
    user("batch-user"),
  );
  const restored = await submitWithIdentity(
    {
      resultId: 8201,
      declarationAccepted: true,
      review: {
        requestId: crypto.randomUUID(),
        snapshot: owned.review.snapshot,
        includedKeys: owned.review.rows.map((r) => r.key),
        additions: [],
      },
    },
    user("batch-user"),
  );
  assert.equal(restored.alreadyOwned, true);
  assert.equal(restored.confirmation.included, 4);
  assert.equal(
    (await sql`select * from athlete_profile_hidden_results where user_id='batch-user'`).length,
    0,
    "Restoring selections removes only this account’s exclusions",
  );
  assert.equal(
    (await sql`select * from athlete_profile_history_choices where user_id='batch-user'`)[0]
      .excluded,
    false,
  );
  assert.equal(
    (await sql`select * from result_claims where claimant_user_id='batch-user'`).length,
    1,
    "Owned re-review creates no new claim",
  );
  // Imported junior categories need the same protection as canonical results.
  // Excluding a junior row from the selection cannot remove the identity safeguard.
  await sql`insert into "user"(id,name,email,"emailVerified") values('source-child','Imported Child Runner','source-child@example.test',true)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(8300,'imported-child-runner','Imported Child Runner','public')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(8300,1,8300,2000,'finished')`;
  const juniorRow = {
    ...historyRow,
    year: new Date().getUTCFullYear(),
    date: "",
    ageGroup: "JW11-14",
  };
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values(8300,'Synthetic junior source','junior-history','https://example.test/junior',now(),true,array[2026],array[2026],${JSON.stringify([juniorRow])}::jsonb,now())`;
  const juniorDetail = await claims.getClaimableResult(
    { resultId: 8300, includeReview: true },
    user("source-child"),
  );
  const juniorInput = {
    resultId: 8300,
    declarationAccepted: true,
    review: {
      requestId: crypto.randomUUID(),
      snapshot: juniorDetail.review.snapshot,
      includedKeys: ["r:8300"],
      additions: [],
    },
  };
  const juniorReceiptBefore = summarySends.length;
  const juniorClaim = await submitWithIdentity(juniorInput, user("source-child"));
  assert.equal(juniorClaim.status, "pending");
  assert.match(
    (await claims.listMyResultClaims(undefined, user("source-child")))[0].conflictReason,
    /responsible adult/,
  );
  assert.equal(summarySends.length, juniorReceiptBefore + 1);
  assert.equal(summarySends.at(-1).status, "pending");
  assert.equal(
    receipts.at(-1).notifyAthlete,
    false,
    "Review exceptions still receive only their consolidated athlete receipt",
  );
  await submitWithIdentity(juniorInput, user("source-child"));
  assert.equal(summarySends.length, juniorReceiptBefore + 1);
  assert.equal((await sql`select * from athlete_account_links where athlete_id=8300`).length, 0);
  // Even without a junior result, the batch UI/API guardian declaration is sticky.
  await sql`update athlete_source_histories set performances='[]'::jsonb where athlete_id=8300`;
  const guardianDetail = await claims.getClaimableResult(
    { resultId: 8300, includeReview: true },
    user("source-child"),
  );
  const guardianInput = {
    ...juniorInput,
    claimantRole: "guardian",
    review: {
      ...juniorInput.review,
      requestId: crypto.randomUUID(),
      snapshot: guardianDetail.review.snapshot,
    },
  };
  assert.equal((await submitWithIdentity(guardianInput, user("source-child"))).status, "pending");
  for (let attempt = 0; attempt < 3; attempt++) {
    const detail = await claims.getClaimableResult(
      { resultId: 8300, includeReview: true },
      user("source-child"),
    );
    assert.equal(
      (
        await submitWithIdentity(
          {
            ...guardianInput,
            claimantRole: "athlete",
            review: {
              ...guardianInput.review,
              requestId: crypto.randomUUID(),
              snapshot: detail.review.snapshot,
            },
          },
          user("source-child"),
        )
      ).status,
      "pending",
    );
  }
  // A PR #635 review already saved before this policy must not trap an eligible
  // athlete in pending forever, or rewrite that earlier audit/email on upgrade.
  await sql`insert into "user"(id,name,email,"emailVerified") values('legacy-batch','Legacy Batch Runner','legacy-batch@example.test',true)`;
  await sql`insert into athletes(id,slug,display_name,profile_visibility) values(8400,'legacy-batch-runner','Legacy Batch Runner','public')`;
  await sql`insert into results(id,edition_id,athlete_id,finish_time_seconds,status) values(8400,1,8400,2100,'finished')`;
  const [legacyClaim] =
    await sql`insert into result_claims(result_id,athlete_id,claimant_user_id,claimant_email,status,verification_method,declaration_accepted)
    values(8400,8400,'legacy-batch','legacy-batch@example.test','pending','other',true) returning id`;
  const legacyDetail = await claims.getClaimableResult(
    { resultId: 8400, includeReview: true },
    user("legacy-batch"),
  );
  const oldId = crypto.randomUUID();
  const oldPayload = { id: oldId, status: "pending", resultId: 8400 };
  const oldHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        athleteId: 8400,
        snapshot: legacyDetail.review.snapshot,
        includedKeys: ["r:8400"],
        additions: [],
      }),
    )
    .digest("hex");
  await sql`insert into athlete_profile_result_confirmations(id,user_id,athlete_id,claim_id,input_hash,snapshot,included_keys,excluded_keys,email_payload,email_sent_at)
    values(${oldId}::uuid,'legacy-batch',8400,${legacyClaim.id},${oldHash},${legacyDetail.review.snapshot},'["r:8400"]'::jsonb,'[]'::jsonb,${JSON.stringify(oldPayload)}::jsonb,now())`;
  const resumedInput = {
    resultId: 8400,
    declarationAccepted: true,
    review: {
      requestId: crypto.randomUUID(),
      snapshot: legacyDetail.review.snapshot,
      includedKeys: ["r:8400"],
      additions: [],
    },
  };
  assert.equal(
    (await sql`select * from athlete_account_links where athlete_id=8400`).length,
    0,
    "Reading does not complete an existing claim",
  );
  const legacyReceiptBefore = summarySends.length;
  const resumed = await submitWithIdentity(resumedInput, user("legacy-batch"));
  assert.equal(resumed.status, "approved");
  assert.equal(resumed.claimId, legacyClaim.id, "Reuse the earlier claim");
  assert.deepEqual(
    (
      await sql`select email_payload from athlete_profile_result_confirmations where id=${oldId}::uuid`
    )[0].email_payload,
    oldPayload,
  );
  assert.equal(summarySends.length, legacyReceiptBefore + 1);
  assert.equal(summarySends.at(-1).status, "approved");
  await submitWithIdentity(resumedInput, user("legacy-batch"));
  assert.equal(
    summarySends.length,
    legacyReceiptBefore + 1,
    "Retry of resumed claim sends no extra email",
  );
  // A competing account may save its proposal; it cannot alter the active owner’s selection.
  await sql`insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values('batch-other','Batch Test Athlete','batch-other@example.test',true,now(),now())`;
  const competitor = await claims.getClaimableResult(
    { resultId: 8201, includeReview: true },
    user("batch-other"),
  );
  const competingBatch = await submitWithIdentity(
    {
      resultId: 8201,
      declarationAccepted: true,
      review: {
        requestId: crypto.randomUUID(),
        snapshot: competitor.review.snapshot,
        includedKeys: ["r:8201"],
        additions: [],
      },
    },
    user("batch-other"),
  );
  assert.equal(competingBatch.status, "pending");
  assert.equal(
    (
      await sql`select user_id from athlete_account_links where athlete_id=8200 and status='active'`
    )[0].user_id,
    "batch-user",
  );
  assert.equal(
    (await sql`select * from athlete_profile_hidden_results where user_id='batch-user'`).length,
    0,
  );
  console.log(
    "Whole-profile confirmation passed: complete result list, additions/removals/restores, one email, replay, changed snapshots, source preservation and competing-owner isolation.",
  );

  // Validate the real email transport header without network access.
  const transport = load("src/lib/auth/email.server.ts");
  const savedFetch = globalThis.fetch;
  let request;
  process.env.RESEND_API_KEY = "synthetic-key";
  globalThis.fetch = async (...args) => {
    request = args;
    return Response.json({ id: "synthetic-transport-receipt" });
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
