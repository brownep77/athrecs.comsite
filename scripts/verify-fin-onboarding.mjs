import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  finActionSchema,
  finSignupLinkSchema,
  parseFinContinuation,
} from "../src/lib/athrecs/fin-onboarding.ts";
import {
  cleanupFinOnboarding,
  createFinSignupLink,
  resumeFinSignup,
} from "../src/lib/athrecs/fin-onboarding.server.ts";
import {
  FIN_ACTION_BODY_LIMIT_BYTES,
  FIN_ACTIONS_PER_MINUTE,
  finConnectorConfigured,
  handleFinActionRequest,
} from "../src/lib/athrecs/fin-actions.server.ts";

// Production functions and migration, disposable synthetic data only. Any
// provider, Intercom or other network request is an unexpected test failure.
const realFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("Fin onboarding verification must not make network calls");
};
const db = new PGlite();
function sqlFor(connection, inTransaction = false) {
  const sql = async (strings, ...values) =>
    (
      await connection.query(
        strings.reduce((query, part, index) => query + (index ? `$${index}` : "") + part, ""),
        values,
      )
    ).rows;
  sql.query = async (query, values = []) => (await connection.query(query, values)).rows;
  sql.transaction = (work) =>
    inTransaction ? work(sql) : connection.transaction((tx) => work(sqlFor(tx, true)));
  return sql;
}
const sql = sqlFor(db);
const secret = "synthetic-fin-connector-secret-never-used-outside-this-test";
const start = new Date("2026-11-06T12:00:00.000Z");
const at = (milliseconds) => new Date(start.getTime() + milliseconds);
const hour = 60 * 60 * 1000;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const input = (suffix, extra = {}) => ({
  action: "create_signup_link",
  requestId: `synthetic-fin-request-${suffix}`,
  racingName: "Synthetic Fin Runner",
  eventName: "Synthetic Harbour 10K",
  year: 2024,
  ...extra,
});
function continuation(link) {
  const url = new URL(link.signupUrl);
  assert.equal(url.origin, "https://www.athrecs.com");
  assert.equal(url.pathname, "/join");
  assert.deepEqual([...url.searchParams.keys()], ["continuation"]);
  assert.equal(url.hash, "");
  const token = url.searchParams.get("continuation");
  assert.equal(parseFinContinuation(token), token);
  assert.match(token, /^[A-Za-z0-9_-]{43}$/);
  return token;
}
async function handoff(requestId) {
  return (
    await sql`select * from fin_onboarding_handoffs where request_key_hash=${hash(requestId)}`
  )[0];
}
async function receipt(userId) {
  return (await sql`select * from fin_assisted_signups where user_id=${userId}`)[0];
}
async function privateState() {
  return {
    accounts: await sql`select * from "user" order by id`,
    profiles: await sql`select * from athlete_private_profiles order by user_id`,
    settings: await sql`select * from athlete_result_matching_settings order by user_id`,
    athletes: await sql`select * from athletes order by id`,
    links: await sql`select * from athlete_account_links order by user_id`,
    claims: await sql`select * from result_claims order by id`,
  };
}

try {
  await db.exec(`
    create table "user" (
      id text primary key, "emailVerified" boolean not null,
      "createdAt" timestamptz not null, email text not null, name text not null
    );
    create table athlete_private_profiles (user_id text primary key, full_name text, private_note text);
    create table athlete_result_matching_settings (user_id text primary key, settings jsonb);
    create table athletes (id integer primary key, display_name text, profile_visibility text);
    create table athlete_account_links (user_id text, athlete_id integer, status text);
    create table result_claims (id integer primary key, claimant_user_id text, status text);
    insert into "user" values
      ('new-account', true, '2026-11-06T12:01:00Z', 'new@example.test', 'New Synthetic Athlete'),
      ('other-account', true, '2026-11-06T12:01:00Z', 'other@example.test', 'Other Synthetic Athlete'),
      ('older-account', true, '2026-11-05T12:00:00Z', 'older@example.test', 'Existing Synthetic Athlete'),
      ('pending-account', false, '2026-11-06T12:01:00Z', 'pending@example.test', 'Pending Synthetic Athlete'),
      ('older-unverified', false, '2026-11-05T12:00:00Z', 'old-pending@example.test', 'Old Pending Athlete'),
      ('boundary-account', true, '2026-11-06T12:00:00Z', 'boundary@example.test', 'Boundary Athlete'),
      ('race-account-a', true, '2026-11-06T12:01:00Z', 'race-a@example.test', 'Race Athlete A'),
      ('race-account-b', true, '2026-11-06T12:01:00Z', 'race-b@example.test', 'Race Athlete B'),
      ('rollback-account', true, '2026-11-06T12:01:00Z', 'rollback@example.test', 'Rollback Athlete'),
      ('removed-account', true, '2026-11-06T12:01:00Z', 'removed@example.test', 'Removed Athlete');
    insert into athlete_private_profiles values
      ('new-account', 'Saved Private Racing Name', 'PRIVATE EVIDENCE: never leave the account');
    insert into athlete_result_matching_settings values
      ('new-account', '{"externalSearchConsent":false,"marketingConsent":false}');
    insert into athletes values (1, 'Private Synthetic Athlete', 'private');
    insert into athlete_account_links values ('older-account', 1, 'active');
    insert into result_claims values (1, 'new-account', 'pending');
  `);
  const migration = await readFile(
    new URL("../migrations/20261106_fin_onboarding.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration);
  await db.exec(migration);
  const initialPrivateState = await privateState();

  // The public contract cannot smuggle an account, ownership choice or consent.
  const validInput = input("schema");
  assert.equal(finActionSchema.safeParse(validInput).success, true);
  assert.equal(
    finActionSchema.safeParse({ action: "find_public_profiles", racingName: "Synthetic Runner" })
      .success,
    true,
  );
  for (const candidate of [
    { ...validInput, action: "create_account" },
    { ...validInput, userId: "other-account" },
    { ...validInput, email: "private@example.test" },
    { ...validInput, athleteId: 1 },
    { ...validInput, externalSearchConsent: true },
    { ...validInput, racingName: " " },
    { ...validInput, racingName: "x".repeat(121) },
    { ...validInput, racingName: "Synthetic\u0000Runner" },
    { ...validInput, eventName: "x".repeat(201) },
    { ...validInput, year: "2024" },
    { ...validInput, year: 2024.5 },
    { ...validInput, year: 1799 },
    { ...validInput, year: new Date().getUTCFullYear() + 1 },
    { ...validInput, requestId: "short" },
    { ...validInput, requestId: "request/with/unsafe/path" },
    { action: "find_public_profiles", racingName: "Synthetic Runner", includePrivate: true },
  ])
    assert.equal(finActionSchema.safeParse(candidate).success, false, JSON.stringify(candidate));
  for (const value of [
    undefined,
    null,
    123,
    {},
    "",
    "x".repeat(42),
    "x".repeat(44),
    "!".repeat(43),
  ])
    assert.equal(parseFinContinuation(value), undefined);
  assert.equal(
    finSignupLinkSchema.parse(input("trim", { racingName: "  Synthetic Runner  " })).racingName,
    "Synthetic Runner",
  );
  let unexpectedSql = 0;
  const noSql = () => {
    unexpectedSql++;
    throw new Error("Invalid inputs must be rejected before database access");
  };
  noSql.transaction = noSql;
  await assert.rejects(() => createFinSignupLink(noSql, validInput, "too-short", start));
  await assert.rejects(() =>
    createFinSignupLink(noSql, { ...validInput, userId: "new-account" }, secret, start),
  );
  for (const [token, userId] of [
    ["bad", "new-account"],
    ["x".repeat(43), ""],
    ["x".repeat(43), "dev-user"],
  ])
    assert.deepEqual(await resumeFinSignup(noSql, token, userId, start), { status: "unavailable" });
  assert.equal(unexpectedSql, 0);
  console.log("PASS Fin input boundaries and disabled identity fallback");

  const firstInput = input("first");
  const firstLink = await createFinSignupLink(sql, firstInput, secret, start);
  const firstToken = continuation(firstLink);
  assert.deepEqual(Object.keys(firstLink).sort(), ["expiresAt", "signupUrl", "status"]);
  assert.equal(firstLink.expiresAt, at(24 * hour).toISOString());
  const firstRow = await handoff(firstInput.requestId);
  assert.equal(firstRow.token_hash, hash(firstToken));
  assert.notEqual(firstRow.token_nonce, firstToken);
  assert.match(firstRow.token_nonce, /^[A-Za-z0-9_-]{43}$/);
  for (const forbidden of [
    firstToken,
    firstLink.signupUrl,
    firstInput.requestId,
    "new@example.test",
  ])
    assert.equal(
      JSON.stringify(firstRow).includes(forbidden),
      false,
      "Only token and request hashes are stored",
    );
  for (const personalValue of [firstInput.racingName, firstInput.eventName, "new@example.test"])
    assert.equal(decodeURIComponent(firstLink.signupUrl).includes(personalValue), false);
  assert.equal(firstRow.consumed_by, null);
  assert.equal(firstRow.consumed_at, null);
  assert.equal((await sql`select * from fin_assisted_signups`).length, 0);
  assert.deepEqual(await createFinSignupLink(sql, firstInput, secret, at(5 * 60_000)), firstLink);
  assert.deepEqual(
    await handoff(firstInput.requestId),
    firstRow,
    "Retries cannot prolong expiry or change stored hints",
  );
  for (const changed of [
    { racingName: "Different Synthetic Runner" },
    { eventName: "Different Synthetic Event" },
    { year: 2023 },
  ]) {
    await assert.rejects(
      () => createFinSignupLink(sql, { ...firstInput, ...changed }, secret, at(60_000)),
      (error) => error.code === "request_conflict" && error.status === 409,
    );
  }
  assert.deepEqual(await handoff(firstInput.requestId), firstRow);
  await assert.rejects(
    () => createFinSignupLink(sql, firstInput, `${secret}-rotated`, at(60_000)),
    (error) => error.code === "expired" && error.status === 410,
  );
  const parallelInput = input("parallel-create");
  const parallelLinks = await Promise.all(
    Array.from({ length: 8 }, () => createFinSignupLink(sql, parallelInput, secret, start)),
  );
  for (const link of parallelLinks) assert.deepEqual(link, parallelLinks[0]);
  assert.equal(
    (
      await sql`select * from fin_onboarding_handoffs where request_key_hash=${hash(parallelInput.requestId)}`
    ).length,
    1,
  );
  assert.deepEqual(
    await privateState(),
    initialPrivateState,
    "Link creation cannot change accounts, ownership or preferences",
  );
  console.log("PASS Opaque links, hash storage, concurrent idempotency and conflicting retries");

  const firstResume = await resumeFinSignup(sql, firstToken, "new-account", at(2 * 60_000));
  assert.deepEqual(firstResume, {
    status: "ready",
    racingName: firstInput.racingName,
    eventName: firstInput.eventName,
    year: firstInput.year,
    expiresAt: firstLink.expiresAt,
    accountStatus: "verified_new_signup",
  });
  const firstReceipt = await receipt("new-account");
  assert(firstReceipt);
  assert.deepEqual(Object.keys(firstReceipt).sort(), ["completed_at", "handoff_key", "user_id"]);
  assert.equal(firstReceipt.handoff_key, hash(firstInput.requestId));
  const consumedRow = await handoff(firstInput.requestId);
  assert.equal(consumedRow.consumed_by, "new-account");
  const repeated = await Promise.all(
    Array.from({ length: 5 }, () => resumeFinSignup(sql, firstToken, "new-account", at(hour))),
  );
  for (const result of repeated) assert.deepEqual(result, firstResume);
  assert.deepEqual(await receipt("new-account"), firstReceipt);
  assert.deepEqual(
    await handoff(firstInput.requestId),
    consumedRow,
    "Retry receipts retain their original consumption time",
  );
  assert.deepEqual(await resumeFinSignup(sql, firstToken, "other-account", at(hour)), {
    status: "unavailable",
  });
  assert.equal(await receipt("other-account"), undefined);
  assert.deepEqual(await privateState(), initialPrivateState);
  console.log("PASS Verified signup receipt, account isolation and replay safety");

  const laterLink = await createFinSignupLink(sql, input("later"), secret, at(10 * 60_000));
  const laterResume = await resumeFinSignup(
    sql,
    continuation(laterLink),
    "new-account",
    at(11 * 60_000),
  );
  assert.equal(laterResume.accountStatus, "existing_account");
  assert.deepEqual(
    await receipt("new-account"),
    firstReceipt,
    "A second link cannot count the same signup again",
  );
  const oldLink = await createFinSignupLink(sql, input("older"), secret, start);
  assert.equal(
    (await resumeFinSignup(sql, continuation(oldLink), "older-account", at(hour))).accountStatus,
    "existing_account",
  );
  assert.equal(await receipt("older-account"), undefined);
  const pendingInput = input("pending");
  const pendingLink = await createFinSignupLink(sql, pendingInput, secret, start);
  assert.deepEqual(
    await resumeFinSignup(sql, continuation(pendingLink), "pending-account", at(hour)),
    { status: "verify_email" },
  );
  assert.equal((await handoff(pendingInput.requestId)).consumed_by, null);
  assert.equal(await receipt("pending-account"), undefined);
  await sql`update "user" set "emailVerified"=true where id='pending-account'`;
  assert.equal(
    (await resumeFinSignup(sql, continuation(pendingLink), "pending-account", at(hour)))
      .accountStatus,
    "verified_new_signup",
  );
  const oldPendingLink = await createFinSignupLink(sql, input("older-unverified"), secret, start);
  assert.deepEqual(
    await resumeFinSignup(sql, continuation(oldPendingLink), "older-unverified", at(hour)),
    { status: "verify_email" },
  );
  await sql`update "user" set "emailVerified"=true where id='older-unverified'`;
  assert.equal(
    (await resumeFinSignup(sql, continuation(oldPendingLink), "older-unverified", at(hour)))
      .accountStatus,
    "existing_account",
  );
  assert.equal(
    await receipt("older-unverified"),
    undefined,
    "Later email verification cannot make an older account new",
  );
  const boundaryLink = await createFinSignupLink(
    sql,
    input("boundary", { eventName: undefined, year: undefined }),
    secret,
    start,
  );
  const boundaryResume = await resumeFinSignup(
    sql,
    continuation(boundaryLink),
    "boundary-account",
    at(hour),
  );
  assert.equal(boundaryResume.accountStatus, "verified_new_signup");
  assert.equal(boundaryResume.eventName, null);
  assert.equal(boundaryResume.year, null);
  console.log(
    "PASS Conversion counts verified new accounts once and distinguishes existing accounts",
  );

  const raceLink = await createFinSignupLink(sql, input("competing-accounts"), secret, start);
  const raceToken = continuation(raceLink);
  const racingAccounts = ["race-account-a", "race-account-b"];
  const raceResults = await Promise.all(
    racingAccounts.map((userId) => resumeFinSignup(sql, raceToken, userId, at(hour))),
  );
  assert.deepEqual(raceResults.map((result) => result.status).sort(), ["ready", "unavailable"]);
  const winner = racingAccounts[raceResults.findIndex((result) => result.status === "ready")];
  const loser = racingAccounts.find((account) => account !== winner);
  assert(await receipt(winner));
  assert.equal(await receipt(loser), undefined);
  assert.deepEqual(await resumeFinSignup(sql, raceToken, loser, at(hour)), {
    status: "unavailable",
  });
  const remainingToken = continuation(parallelLinks[0]);
  for (const invalidToken of [
    "x".repeat(43),
    `${firstToken[0] === "A" ? "B" : "A"}${firstToken.slice(1)}`,
    `${firstToken.slice(0, 42)}!`,
  ])
    assert.deepEqual(await resumeFinSignup(sql, invalidToken, "other-account", at(hour)), {
      status: "unavailable",
    });
  for (const invalidAccount of ["missing-account", "new-account' OR 1=1 --"])
    assert.deepEqual(await resumeFinSignup(sql, remainingToken, invalidAccount, at(hour)), {
      status: "unavailable",
    });
  const removedInput = input("removed-account");
  const removedLink = await createFinSignupLink(sql, removedInput, secret, start);
  await resumeFinSignup(sql, continuation(removedLink), "removed-account", at(hour));
  await sql`delete from "user" where id='removed-account'`;
  assert.equal(await receipt("removed-account"), undefined);
  assert.equal(await handoff(removedInput.requestId), undefined);
  assert.deepEqual(
    await resumeFinSignup(sql, continuation(removedLink), "other-account", at(hour)),
    { status: "unavailable" },
  );
  const rollbackInput = input("atomic-receipt");
  const rollbackLink = await createFinSignupLink(sql, rollbackInput, secret, start);
  await sql`alter table fin_assisted_signups add constraint synthetic_receipt_failure
    check (user_id <> 'rollback-account')`;
  await assert.rejects(() =>
    resumeFinSignup(sql, continuation(rollbackLink), "rollback-account", at(hour)),
  );
  assert.equal((await handoff(rollbackInput.requestId)).consumed_by, null);
  assert.equal((await handoff(rollbackInput.requestId)).consumed_at, null);
  assert.equal(await receipt("rollback-account"), undefined);
  await sql`alter table fin_assisted_signups drop constraint synthetic_receipt_failure`;
  assert.equal(
    (await resumeFinSignup(sql, continuation(rollbackLink), "rollback-account", at(hour)))
      .accountStatus,
    "verified_new_signup",
    "A failed conversion write rolls back link consumption so a retry can succeed",
  );
  console.log(
    "PASS Competing accounts, tampering, deleted-account cleanup and atomic failure recovery",
  );

  const expiryInput = input("expiry");
  const expiryLink = await createFinSignupLink(sql, expiryInput, secret, start);
  const expiryToken = continuation(expiryLink);
  assert.equal(
    (await resumeFinSignup(sql, expiryToken, "older-account", at(24 * hour - 1))).status,
    "ready",
  );
  for (const expiredAt of [at(24 * hour), at(24 * hour + 1)]) {
    assert.deepEqual(await resumeFinSignup(sql, expiryToken, "older-account", expiredAt), {
      status: "unavailable",
    });
    await assert.rejects(
      () => createFinSignupLink(sql, expiryInput, secret, expiredAt),
      (error) => error.code === "expired" && error.status === 410,
    );
  }
  const retainedInput = input("retained");
  const retainedLink = await createFinSignupLink(sql, retainedInput, secret, at(23 * hour));
  await sql`insert into fin_connector_usage(bucket,requests,expires_at) values
    ('expired-synthetic-quota',1,${at(24 * hour)}),('current-synthetic-quota',1,${at(26 * hour)})`;
  const conversionRows = await sql`select * from fin_assisted_signups order by user_id`;
  await cleanupFinOnboarding(sql, at(25 * hour));
  assert.equal(await handoff(expiryInput.requestId), undefined);
  assert.equal(
    await handoff(firstInput.requestId),
    undefined,
    "Expired racing hints must be deleted",
  );
  assert(await handoff(retainedInput.requestId));
  assert.equal(
    (await sql`select * from fin_connector_usage where bucket='expired-synthetic-quota'`).length,
    0,
  );
  assert.equal(
    (await sql`select * from fin_connector_usage where bucket='current-synthetic-quota'`).length,
    1,
  );
  assert.deepEqual(await sql`select * from fin_assisted_signups order by user_id`, conversionRows);
  assert.equal(
    (await resumeFinSignup(sql, continuation(retainedLink), "older-account", at(25 * hour))).status,
    "ready",
  );
  const replacement = await createFinSignupLink(sql, expiryInput, secret, at(25 * hour));
  assert.notEqual(
    continuation(replacement),
    expiryToken,
    "Purging an old request must never resurrect its bearer token",
  );
  assert.deepEqual(await resumeFinSignup(sql, expiryToken, "other-account", at(25 * hour)), {
    status: "unavailable",
  });
  assert.equal(
    (await resumeFinSignup(sql, continuation(replacement), "other-account", at(25 * hour))).status,
    "ready",
  );
  console.log(
    "PASS Expiry boundaries, retained signup counts and fresh nonces after hint deletion",
  );

  const environment = {
    ATHRECS_FIN_ENABLED: "true",
    ATHRECS_FIN_CONNECTOR_SECRET: secret,
    INTERCOM_SECRET_KEY: "separate-synthetic-messenger-identity-secret",
    VITE_SITE_BRAND: "athrecs",
    NODE_ENV: "production",
    DATABASE_URL: "postgres://synthetic.invalid/never-connected",
  };
  const publicSearch = { action: "find_public_profiles", racingName: "Synthetic Runner" };
  function actionRequest({ body = publicSearch, raw, method = "POST", headers = {} } = {}) {
    const requestHeaders = new Headers({
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    });
    for (const [name, value] of Object.entries(headers)) {
      if (value === null) requestHeaders.delete(name);
      else requestHeaders.set(name, value);
    }
    return new Request("https://www.athrecs.com/api/fin/actions", {
      method,
      headers: requestHeaders,
      ...(["GET", "HEAD"].includes(method) ? {} : { body: raw ?? JSON.stringify(body) }),
    });
  }
  function assertResponsePrivacy(response) {
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow, noarchive");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  }
  let deniedDatabaseReads = 0;
  const rejectDatabase = async () => {
    deniedDatabaseReads++;
    throw new Error("A denied connector request must never access the database");
  };
  for (const overrides of [
    { ATHRECS_FIN_ENABLED: "false" },
    { ATHRECS_FIN_ENABLED: "TRUE" },
    { ATHRECS_FIN_CONNECTOR_SECRET: "" },
    { ATHRECS_FIN_CONNECTOR_SECRET: "short" },
    { ATHRECS_FIN_CONNECTOR_SECRET: ` ${environment.INTERCOM_SECRET_KEY} ` },
    { VITE_SITE_BRAND: " RunRecs " },
    { VITE_SITE_BRAND: undefined, VERCEL_PROJECT_PRODUCTION_URL: "www.RUNRECS.com" },
    { VITE_SITE_BRAND: undefined, VERCEL_GIT_COMMIT_REF: "feat/runrecs-running-site" },
    { VITE_SITE_BRAND: undefined, VERCEL_GIT_COMMIT_REF: "runrecs-production" },
    { DATABASE_URL: " " },
    { NODE_ENV: "development", VERCEL_ENV: "preview", DATABASE_URL: "" },
  ]) {
    const env = { ...environment, ...overrides };
    assert.equal(finConnectorConfigured(env), false);
    const response = await handleFinActionRequest(actionRequest(), { env, getSql: rejectDatabase });
    assert.equal(response.status, 503);
    assertResponsePrivacy(response);
  }
  assert.equal(finConnectorConfigured(environment), true);
  assert.equal(
    finConnectorConfigured({ ...environment, NODE_ENV: "development", DATABASE_URL: "" }),
    true,
    "Explicit local testing may use disposable PGlite",
  );
  for (const authorization of [
    null,
    "",
    "Bearer wrong",
    secret,
    `Bearer ${environment.INTERCOM_SECRET_KEY}`,
  ]) {
    const response = await handleFinActionRequest(
      actionRequest({
        headers: { authorization, cookie: "synthetic-browser-session=not-connector-authority" },
      }),
      { env: environment, getSql: rejectDatabase },
    );
    assert.equal(response.status, 401);
    assertResponsePrivacy(response);
  }
  const deniedRequests = [
    [actionRequest({ method: "GET" }), 405],
    [actionRequest({ method: "PUT" }), 405],
    [actionRequest({ headers: { "content-type": "text/plain" } }), 415],
    [actionRequest({ headers: { "content-type": null } }), 415],
    [actionRequest({ raw: "{" }), 400],
    [actionRequest({ raw: "" }), 400],
    [actionRequest({ raw: new Uint8Array([0xc3, 0x28]) }), 400],
    [actionRequest({ body: { ...publicSearch, userId: "other-account" } }), 400],
    [actionRequest({ body: { action: "publish_profile", athleteId: 1 } }), 400],
    [actionRequest({ headers: { "content-length": "unknown" } }), 400],
    [
      actionRequest({ headers: { "content-length": String(FIN_ACTION_BODY_LIMIT_BYTES + 1) } }),
      413,
    ],
    [actionRequest({ raw: " ".repeat(FIN_ACTION_BODY_LIMIT_BYTES + 1) }), 413],
    [
      actionRequest({
        raw: " ".repeat(FIN_ACTION_BODY_LIMIT_BYTES + 1),
        headers: { "content-length": "1" },
      }),
      413,
    ],
    [
      actionRequest({
        raw: JSON.stringify({ racingName: "\u00e9".repeat(FIN_ACTION_BODY_LIMIT_BYTES / 2) }),
      }),
      413,
    ],
  ];
  for (const [request, expected] of deniedRequests) {
    const response = await handleFinActionRequest(request, {
      env: environment,
      getSql: rejectDatabase,
    });
    assert.equal(response.status, expected);
    assertResponsePrivacy(response);
    if (expected === 405) assert.equal(response.headers.get("allow"), "POST");
  }
  assert.equal(deniedDatabaseReads, 0);
  console.log(
    "PASS Connector feature gates, separate authentication and streamed request limits before database access",
  );

  let lookups = 0;
  const publicResult = {
    status: "possible_profiles",
    profiles: [
      {
        displayName: "Synthetic Runner",
        athleteNumber: "ATH000099",
        profileUrl: "https://www.athrecs.com/athletes/synthetic-runner",
        city: null,
        country: "Ireland",
        club: null,
        sports: ["Running"],
        publicResultCount: 3,
      },
    ],
    hasMore: false,
    scope: "public_directory_search",
    message: "Possible public profile; ownership has not been confirmed.",
  };
  const dependencies = {
    env: environment,
    getSql: async () => sql,
    findPublicProfiles: async (connection, racingName) => {
      assert.equal(connection, sql);
      assert.equal(racingName, "Synthetic Runner");
      lookups++;
      return publicResult;
    },
  };
  const beforeActionState = await privateState();
  const found = await handleFinActionRequest(
    actionRequest({
      body: { ...publicSearch, racingName: "  Synthetic Runner  " },
      headers: { "content-type": "application/json; charset=utf-8" },
    }),
    dependencies,
  );
  assert.equal(found.status, 200);
  assertResponsePrivacy(found);
  assert.deepEqual(await found.json(), publicResult);
  assert.equal(lookups, 1);
  const connectorInput = input("connector");
  const created = await handleFinActionRequest(
    actionRequest({ body: connectorInput }),
    dependencies,
  );
  assert.equal(created.status, 200);
  assertResponsePrivacy(created);
  const connectorLink = await created.json();
  continuation(connectorLink);
  const retried = await handleFinActionRequest(
    actionRequest({ body: connectorInput }),
    dependencies,
  );
  assert.equal(retried.status, 200);
  assert.deepEqual(await retried.json(), connectorLink);
  const conflict = await handleFinActionRequest(
    actionRequest({
      body: { ...connectorInput, racingName: "Conflicting Synthetic Runner" },
    }),
    dependencies,
  );
  assert.equal(conflict.status, 409);
  assertResponsePrivacy(conflict);
  assert.equal((await conflict.json()).status, "request_conflict");
  await sql`update fin_onboarding_handoffs set created_at=now()-interval '2 days',
    expires_at=now()-interval '1 day' where request_key_hash=${hash(connectorInput.requestId)}`;
  const expired = await handleFinActionRequest(
    actionRequest({ body: connectorInput }),
    dependencies,
  );
  assert.equal(expired.status, 410);
  assertResponsePrivacy(expired);
  assert.equal((await expired.json()).status, "expired");
  assert.deepEqual(await privateState(), beforeActionState);
  console.log("PASS Actual action handler dispatch and onboarding idempotency/error receipts");

  for (const failingDependencies of [
    {
      ...dependencies,
      getSql: async () => {
        throw new Error(`PRIVATE SQL DETAILS ${secret}`);
      },
    },
    {
      ...dependencies,
      findPublicProfiles: async () => {
        throw new Error(`PRIVATE SOURCE https://example.test/evidence ${secret}`);
      },
    },
  ]) {
    const response = await handleFinActionRequest(actionRequest(), failingDependencies);
    assert.equal(response.status, 503);
    assertResponsePrivacy(response);
    const text = await response.text();
    for (const forbidden of [secret, "PRIVATE", "example.test", "Synthetic Runner"])
      assert.equal(text.includes(forbidden), false);
  }
  // Set the active SQL bucket to one available slot, then exercise the actual
  // atomic reservation with overlapping requests. One enclosing test transaction
  // keeps PostgreSQL now() stable if the wall clock crosses a minute boundary.
  const beforeQuotaLookups = lookups;
  const limited = await sql.transaction(async (tx) => {
    await tx`insert into fin_connector_usage(bucket, requests, expires_at)
      values ('actions:'||floor(extract(epoch from now())/60)::bigint::text,
        ${FIN_ACTIONS_PER_MINUTE - 1}, date_trunc('minute',now())+interval '1 minute')
      on conflict(bucket) do update set requests=excluded.requests, expires_at=excluded.expires_at`;
    const quotaDependencies = {
      ...dependencies,
      getSql: async () => tx,
      findPublicProfiles: async () => {
        lookups++;
        return publicResult;
      },
    };
    return Promise.all([
      handleFinActionRequest(actionRequest(), quotaDependencies),
      handleFinActionRequest(actionRequest(), quotaDependencies),
    ]);
  });
  assert.deepEqual(limited.map((response) => response.status).sort(), [200, 429]);
  assert.equal(
    lookups - beforeQuotaLookups,
    1,
    "Only a reserved request reaches the lookup action",
  );
  for (const response of limited) {
    assertResponsePrivacy(response);
    if (response.status === 429) {
      assert.equal((await response.json()).status, "rate_limited");
      const retry = Number(response.headers.get("retry-after"));
      assert(retry >= 1 && retry <= 60);
    }
  }
  assert.equal(
    Number(
      (
        await sql`select max(requests) as requests from fin_connector_usage where bucket like 'actions:%'`
      )[0].requests,
    ),
    FIN_ACTIONS_PER_MINUTE,
  );
  console.log("PASS Sanitized failures and durable atomic connector quota");

  console.log(
    "Fin onboarding synthetic regression checks passed. PGlite serializes transactions; independent PostgreSQL sessions and live Intercom are not exercised.",
  );
} finally {
  globalThis.fetch = realFetch;
  await db.close();
}
