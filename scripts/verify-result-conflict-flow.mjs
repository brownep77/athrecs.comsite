// Exercise the real matching, claim and outbox code against a disposable schema.
// All athletes/accounts/results are synthetic; all outgoing emails are captured.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
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
const db = new PGlite();
await db.waitReady;
let failOutbox = false;
function sqlFor(connection) {
  const query = async (text, params = []) => {
    if (failOutbox && /insert into result_claim_alerts/.test(text))
      throw Error("Synthetic outbox failure");
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
