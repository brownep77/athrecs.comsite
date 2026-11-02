import { signupDetails } from "./fixtures/signup-details.mjs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID, generateKeyPairSync } from "node:crypto";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// Real auth endpoints and profile RPCs; only email delivery is intercepted.
// Never send a test email or use a configured external database.
const delivery = true;
process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = delivery ? "test-resend-key" : "";
process.env.AUTH_EMAIL_FROM = "ATHRECS Test <accounts@example.test>";
process.env.ATHRECS_CLAIMS_EMAILS = "";
process.env.ATHRECS_STAFF_EMAILS = "";
const origin = "http://127.0.0.1:18471";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = "test-only-authentication-secret-at-least-32-characters";
process.env.TSS_SERVER_FN_BASE = `${origin}/_serverFn/`;
for (const provider of ["GOOGLE", "LINKEDIN", "MICROSOFT", "FACEBOOK", "TWITTER"]) {
  process.env[`${provider}_CLIENT_ID`] = `test-${provider.toLowerCase()}`;
  process.env[`${provider}_CLIENT_SECRET`] = `test-${provider.toLowerCase()}-secret`;
}
process.env.APPLE_CLIENT_ID = "test.athrecs.web";
process.env.APPLE_TEAM_ID = "TESTTEAM01";
process.env.APPLE_KEY_ID = "TESTKEY001";
process.env.APPLE_PRIVATE_KEY = generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
}).privateKey;
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    assert(delivery, "Disabled email delivery must never be called");
    const email = JSON.parse(init.body);
    assert(email.to.every((to) => to.endsWith("@example.test") || to === "paul@athrecs.com"));
    sent.push(email);
    return Response.json({ id: `test-email-${sent.length}` });
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18471, strictPort: true } });
let database;
let ipCounter = 1;
async function post(path, body, headers = {}) {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "sec-fetch-site": "same-origin",
      "x-forwarded-for": `127.1.0.${ipCounter++}`,
      ...headers,
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}
const modules = new Map();
async function rpc(file, name, data, token, requestHeaders = {}) {
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file);
  const start = source.indexOf(`const ${name} =`);
  assert(start >= 0, `${name} is exposed through the real RPC transport`);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: {
        origin,
        "sec-fetch-site": "same-origin",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...requestHeaders,
      },
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
async function sendCode(email) {
  const response = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(response.status, 200, await response.text());
  const message = sent.findLast((mail) => mail.to.includes(email));
  const code = message?.text.match(/\b([0-9]{6})\b/)?.[1];
  assert(code, "A six-digit code must reach the email adapter");
  return code;
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  await database.exec(
    await readFile(new URL("./fixtures/test-account.sql", import.meta.url), "utf8"),
  );
  globalThis.__athrecsFullSeedPromise__ = Promise.resolve();
  const email = "paul@athrecs.com";
  const code = await sendCode(email);
  const response = await post("sign-in/email-otp", {
    email,
    otp: code,
    ...signupDetails("Test Test"),
  });
  assert.equal(response.status, 200, await response.clone().text());
  const user = await response.json();
  const token = user.token;
  assert(user.user.emailVerified);
  assert(
    (await post("sign-in/email-otp", { email, otp: code })).status >= 400,
    "OTP replay rejected",
  );
  const call = (file, name, data, auth = token) => rpc(`athrecs/${file}`, name, data, auth);
  await call("athlete-account-api", "saveMyAthleteRacingName", {
    fullName: "Test Test",
    privacyAcknowledged: true,
  });
  const hub = await call("test-account-api", "getMyTestHub");
  assert.equal(hub.races.length, 10);
  assert.equal(new Set(hub.races.map((r) => r.distance)).size, 10);
  assert.deepEqual(
    hub.races.map((r) => r.name),
    Array.from({ length: 10 }, (_, i) => `Test ${i + 1}`),
  );
  const [test] = await sql`select athlete_id from athrecs_test_athletes where email=${email}`;
  const aid = test.athlete_id;
  assert.equal((await sql`select count(*)::int n from results where athlete_id=${aid}`)[0].n, 0);
  assert.equal(
    (await sql`select count(*)::int n from events where name ~ '^Test ([1-9]|10)$'`)[0].n,
    0,
  );
  const candidate = await call("result-claims-api", "getClaimableResult", {
    resultId: hub.races[0].resultId,
    includeReview: true,
  });
  assert(candidate);
  assert.equal(candidate.review.rows.length, 10);
  assert.equal(candidate.chipTimeSeconds, null, "Gun-only test time never becomes a chip time");
  assert.equal(candidate.gunTimeSeconds, 270);
  const review = {
    requestId: randomUUID(),
    snapshot: candidate.review.snapshot,
    includedKeys: candidate.review.rows.slice(0, 9).map((r) => r.key),
    additions: [],
  };
  const claim = await call("result-claims-api", "submitResultClaim", {
    resultId: candidate.resultId,
    declarationAccepted: true,
    review,
  });
  assert.equal(claim.status, "approved");
  await call("result-claims-api", "submitResultClaim", {
    resultId: candidate.resultId,
    declarationAccepted: true,
    review,
  });
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_profile_result_confirmations where user_id=${user.user.id}`
    )[0].n,
    1,
    "Bulk replay is idempotent",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athlete_profile_hidden_source_results where user_id=${user.user.id}`
    )[0].n,
    1,
  );
  await call("result-claims-api", "submitResultClaim", {
    resultId: hub.races[1].resultId,
    declarationAccepted: true,
  });
  const hidden = (
    await sql`select -source_result_id as id from athlete_profile_hidden_source_results where user_id=${user.user.id}`
  )[0].id;
  await call("athlete-profile-results-api", "restoreResultToMyProfile", { resultId: hidden });
  await call("athlete-profile-results-api", "hideResultFromMyProfile", { resultId: hidden });
  await call("athlete-profile-results-api", "restoreResultToMyProfile", { resultId: hidden });
  const account = await call("athlete-account-api", "getMyAthleteAccount");
  assert.equal(account.claimedResults.length, 10);
  assert(account.claimedResults.every((r) => r.details.syntheticTest));
  assert.deepEqual(
    new Set(account.claimedResults.map((r) => r.distanceKm)),
    new Set([1, 3, 5, 8.04672, 10, 16.09344, 21.0975, 42.195, 50, 100]),
  );
  const records = await server.ssrLoadModule("/src/lib/athrecs/profile-records.ts");
  const achievements = await server.ssrLoadModule("/src/lib/athrecs/profile-achievements.ts");
  assert.equal(records.findPersonalBests(account.claimedResults).length, 0);
  assert.equal(achievements.buildProfileAchievements(account.claimedResults).finishes.length, 0);
  const bio = await call("athlete-bio-api", "getMyAthleteBio");
  assert.match(bio.generatedBio, /FICTIONAL TEST/);
  await call("athlete-bio-api", "saveMyAthleteBio", {
    mode: "custom",
    customBio: "FICTIONAL TEST: practising profile updates.",
  });
  assert.match(
    (await call("athlete-bio-api", "getMyAthleteBio")).displayBio,
    /practising profile updates/,
  );
  await call("athlete-bio-api", "saveMyAthleteBio", { mode: "automatic" });
  await assert.rejects(
    () =>
      call("athlete-profile-share-api", "saveMyProfileShare", {
        enabled: true,
        acknowledged: true,
        shareBio: true,
        shareResults: true,
        shareClub: true,
        shareLocation: true,
        searchIndexable: true,
      }),
    /Fictional test/,
  );
  await assert.rejects(
    () => sql`update athletes set profile_visibility='public' where id=${aid}`,
    /Fictional test/,
  );
  await assert.rejects(
    () => sql`update athletes set profile_details='{}'::jsonb where id=${aid}`,
    /Fictional test/,
  );
  await assert.rejects(
    () => sql`update athlete_source_histories set published_at=now() where athlete_id=${aid}`,
    /Fictional test/,
  );
  await assert.rejects(
    () =>
      sql`update source_history_claim_results set performance=jsonb_set(performance,'{verificationStatus}','"source_verified"') where athlete_id=${aid}`,
    /Fictional performances/,
  );
  const outsiderCode = await sendCode("outsider@example.test");
  const outsider = await (
    await post("sign-in/email-otp", {
      email: "outsider@example.test",
      otp: outsiderCode,
      ...signupDetails("Synthetic Outsider"),
    })
  ).json();
  await assert.rejects(
    () => call("test-account-api", "getMyTestHub", undefined, outsider.token),
    /approved/,
  );
  assert.equal(
    await call(
      "result-claims-api",
      "getClaimableResult",
      { resultId: candidate.resultId },
      outsider.token,
    ),
    null,
  );
  await assert.rejects(() =>
    call(
      "result-claims-api",
      "submitResultClaim",
      { resultId: candidate.resultId, declarationAccepted: true },
      outsider.token,
    ),
  );
  await assert.rejects(() => rpc("athrecs/test-account-api", "getMyTestHub"));
  await assert.rejects(() =>
    rpc(
      "athrecs/test-account-api",
      "registerForTestRace",
      { eventId: 1, registered: true },
      token,
      { "sec-fetch-site": "cross-site" },
    ),
  );
  await assert.rejects(() =>
    call("test-account-api", "registerForTestRace", { eventId: 11, registered: true }),
  );
  const service = await server.ssrLoadModule("/src/lib/athrecs/test-account.server.ts");
  await call("test-account-api", "registerForTestRace", { eventId: 1, registered: true });
  await Promise.all(
    Array.from({ length: 4 }, () => service.saveTestRegistration(sql, user.user.id, 1, true)),
  );
  assert.equal(
    (
      await sql`select count(*)::int n from athrecs_test_registration_receipts where user_id=${user.user.id}`
    )[0].n,
    1,
  );
  const before = sent.length;
  await service.deliverTestRegistrationReceipts(sql, user.user.id);
  await service.deliverTestRegistrationReceipts(sql, user.user.id);
  assert.equal(sent.length, before + 1);
  assert.match(sent.at(-1).subject, /FICTIONAL TEST/);
  assert.deepEqual(sent.at(-1).to, [email]);
  await service.saveTestRegistration(sql, user.user.id, 1, false);
  await service.deliverTestRegistrationReceipts(sql, user.user.id, async () => {
    throw new Error("Synthetic outage");
  });
  assert.equal(
    (
      await sql`select registered from athrecs_test_registrations where user_id=${user.user.id} and event_id=1`
    )[0].registered,
    false,
  );
  await sql`update athrecs_test_registration_receipts set retry_after=now() where user_id=${user.user.id} and sent_at is null`;
  await service.deliverTestRegistrationReceipts(sql, user.user.id);
  assert.match(sent.at(-1).subject, /cancelled/);
  await service.saveTestRegistration(sql, user.user.id, 1, true);
  assert.equal(
    (
      await sql`select version from athrecs_test_registrations where user_id=${user.user.id} and event_id=1`
    )[0].version,
    3,
  );
  const mail = await server.ssrLoadModule("/src/lib/auth/email.server.ts");
  await assert.rejects(
    () =>
      mail.sendAthrecsAuthEmail({
        to: "outsider@example.test",
        testOnly: true,
        subject: "Test",
        heading: "Test",
        message: "Test",
      }),
    /approved test address/,
  );
  const claimMail = await server.ssrLoadModule("/src/lib/athrecs/result-claim-email.server.ts");
  await claimMail.notifyProfileResultsConfirmed({
    id: randomUUID(),
    resultId: candidate.resultId,
    claimantEmail: email,
    athleteName: "Test Test",
    included: 10,
    excluded: 0,
    added: 0,
    status: "approved",
  });
  assert.match(sent.at(-1).subject, /FICTIONAL TEST/);
  const stats = await server.ssrLoadModule("/src/lib/athrecs/registration-stats.server.ts");
  const counts = await stats.loadRegistrationStats(sql, new Date().toISOString().slice(0, 7));
  assert.equal(
    counts.daily.reduce((sum, r) => sum + r.signups, 0),
    1,
    "Only outsider counts as genuine signup",
  );
  console.log(
    "PASS: real HTTP auth, OTP replay, ten fixtures/distances, batch/individual claims, retries, private profile updates, PB/achievement exclusion, publication guards, account isolation, practice registrations, email allowlist and outage recovery. All mail intercepted; no production writes.",
  );
} finally {
  await server.close();
  if (database) await database.close();
  globalThis.fetch = realFetch;
}
