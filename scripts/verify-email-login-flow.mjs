import { signupDetails } from "./fixtures/signup-details.mjs";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// Real auth endpoints and profile RPCs; email and Google's token endpoint are mocked.
// Never send a test email or use a configured external database.
const delivery = !process.argv.includes("--no-email");
process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = delivery ? "test-resend-key" : "";
process.env.AUTH_EMAIL_FROM = "ATHRECS Test <accounts@example.test>";
process.env.ATHRECS_CLAIMS_EMAILS = "";
process.env.ATHRECS_STAFF_EMAILS = "";
const origin = "http://127.0.0.1:18225";
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
const oauthProfiles = new Map();
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://oauth2.googleapis.com/token") {
    const body = new URLSearchParams(init?.body ?? (await input.text()));
    const profile = oauthProfiles.get(body.get("code"));
    assert(profile, "Only explicitly issued synthetic OAuth codes can be exchanged");
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    return Response.json({
      access_token: "synthetic-google-access-token",
      token_type: "Bearer",
      expires_in: 3600,
      id_token: `${encode({ alg: "none" })}.${encode(profile)}.synthetic`,
    });
  }
  if (url === "https://api.resend.com/emails") {
    assert(delivery, "Disabled email delivery must never be called");
    const email = JSON.parse(init.body);
    assert(email.to.every((to) => to.endsWith("@example.test")));
    sent.push(email);
    return Response.json({ id: `test-email-${sent.length}` });
  }
  assert(url.startsWith(origin), `Unexpected external request: ${new URL(url).origin}`);
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18225, strictPort: true } });
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
function responseCookies(response) {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}
async function startGoogle(details) {
  const response = await post("sign-in/social", {
    provider: "google",
    callbackURL: "/athlete-account",
    errorCallbackURL: "/athlete-account?auth=1&authMode=signup",
    disableRedirect: true,
    ...(details ? { additionalData: { athrecsSignup: details } } : {}),
  });
  assert.equal(response.status, 200, await response.clone().text());
  const url = new URL((await response.json()).url);
  // The provider receives an opaque state, never the submitted private location.
  assert(!url.href.includes("Norwich") && !url.href.includes("signupLocation"));
  return { state: url.searchParams.get("state"), cookie: responseCookies(response) };
}
async function finishGoogle(flow, email, extraQuery = {}) {
  const code = `synthetic-oauth-${oauthProfiles.size + 1}`;
  oauthProfiles.set(code, {
    sub: email,
    email,
    email_verified: true,
    name: "Provider Nickname",
  });
  const url = new URL(`${origin}/api/auth/callback/google`);
  url.search = new URLSearchParams({ state: flow.state, code, ...extraQuery }).toString();
  return fetch(url, { headers: { origin, cookie: flow.cookie }, redirect: "manual" });
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();
  const methods = await rpc("auth/auth-methods-api", "getAvailableAuthMethods");
  assert.equal(methods.emailPassword, true);
  assert.equal(methods.emailCode, delivery);
  assert.equal(methods.passwordReset, delivery);
  assert.deepEqual(
    methods.providers.map((p) => p.providerId),
    delivery
      ? ["google", "apple", "microsoft", "facebook", "twitter", "linkedin"]
      : ["google", "apple"],
  );
  const invalidDetails = [
    ["full-name-only", { name: "Full Name" }, "SIGNUP_NAME_REQUIRED"],
    ["missing-first", { ...signupDetails(), firstName: undefined }, "SIGNUP_NAME_REQUIRED"],
    ["blank-first", { ...signupDetails(), firstName: " \u00a0\u200b " }, "SIGNUP_NAME_REQUIRED"],
    ["missing-last", { ...signupDetails(), lastName: undefined }, "SIGNUP_NAME_REQUIRED"],
    ["blank-last", { ...signupDetails(), lastName: " \t " }, "SIGNUP_NAME_REQUIRED"],
    [
      "missing-country",
      { ...signupDetails(), signupCountry: undefined },
      "SIGNUP_COUNTRY_REQUIRED",
    ],
    ["blank-country", { ...signupDetails(), signupCountry: "   " }, "SIGNUP_COUNTRY_REQUIRED"],
    [
      "invalid-country",
      { ...signupDetails(), signupCountry: "Not a country" },
      "SIGNUP_COUNTRY_REQUIRED",
    ],
    [
      "missing-location",
      { ...signupDetails(), signupLocation: undefined },
      "SIGNUP_LOCATION_REQUIRED",
    ],
    [
      "blank-location",
      { ...signupDetails(), signupLocation: " \u00a0\u200b " },
      "SIGNUP_LOCATION_REQUIRED",
    ],
    ["long-first", { ...signupDetails(), firstName: "A".repeat(61) }, "SIGNUP_DETAILS_INVALID"],
    ["long-last", { ...signupDetails(), lastName: "B".repeat(61) }, "SIGNUP_DETAILS_INVALID"],
    [
      "long-full-name",
      { ...signupDetails(), firstName: "A".repeat(60), lastName: "B".repeat(60) },
      "SIGNUP_DETAILS_INVALID",
    ],
    [
      "long-location",
      { ...signupDetails(), signupLocation: "C".repeat(121) },
      "SIGNUP_DETAILS_INVALID",
    ],
  ];
  for (const [label, details, expectedCode] of invalidDetails) {
    const email = `invalid-password-${label}@example.test`;
    const before = sent.length;
    const response = await post("sign-up/email", {
      ...details,
      email,
      password: "Test-password-123!",
    });
    assert.equal(response.status, 400, `${label}: ${await response.clone().text()}`);
    assert.equal((await response.json()).code, expectedCode, label);
    assert.equal((await sql`select count(*)::int as n from "user" where email=${email}`)[0].n, 0);
    assert.equal(sent.length, before, "Rejected signup sends no verification or welcome message");
  }
  if (!delivery) {
    assert.equal(
      (
        await post("email-otp/send-verification-otp", {
          email: "disabled@example.test",
          type: "sign-in",
        })
      ).status,
      404,
    );
    const created = await post("sign-up/email", {
      email: "password-only@example.test",
      password: "Test-password-123!",
      ...signupDetails("Password Test"),
    });
    assert.equal(created.status, 200, await created.clone().text());
    await sql`update "user" set name='',"firstName"=null,"lastName"=null,"signupCountry"=null,"signupLocation"=null where email='password-only@example.test'`;
    const login = await post("sign-in/email", {
      email: "password-only@example.test",
      password: "Test-password-123!",
    });
    assert.equal(login.status, 200, await login.clone().text());
    const body = await login.json();
    assert.equal(body.user.emailVerified, false);
    assert.equal(
      body.user.name,
      "",
      "A legacy account without registration details can still sign in",
    );
    const account = await rpc(
      "athrecs/athlete-account-api",
      "getMyAthleteAccount",
      undefined,
      body.token,
    );
    await assert.rejects(
      () =>
        rpc(
          "athrecs/athlete-account-api",
          "saveMyAthleteAccount",
          { ...account, fullName: "Password Test", privacyAcknowledged: true },
          body.token,
        ),
      /Verify your email/,
    );
    await assert.rejects(
      () =>
        rpc(
          "athrecs/athlete-account-api",
          "saveMyAthleteRacingName",
          {
            fullName: "Password Test",
            privacyAcknowledged: true,
          },
          body.token,
        ),
      /Verify your email/,
    );
    await sql`insert into events (id, slug, name, sport, surface, country)
      values (990041, 'claim-auth-test', 'Synthetic Claim Auth Test', 'Athletics', 'Road', 'United Kingdom')`;
    await sql`insert into editions (id, event_id, event_date, distance_code, distance_km)
      values (990041, 990041, '2026-09-01', '10K', 10)`;
    await sql`insert into athletes (id, slug, display_name, profile_visibility)
      values (990041, 'claim-auth-runner', 'Password Test', 'private')`;
    await sql`insert into results (id, edition_id, athlete_id, finish_time_seconds)
      values (990041, 990041, 990041, 2400)`;
    await assert.rejects(
      () =>
        rpc(
          "athrecs/result-claims-api",
          "submitResultClaim",
          {
            resultId: 990041,
            declarationAccepted: true,
          },
          body.token,
        ),
      /Verify your email/,
      "An unverified password account must not acquire athlete ownership",
    );
    assert.equal(
      (await sql`select count(*)::int as n from athlete_account_links where athlete_id=990041`)[0]
        .n,
      0,
    );
    assert.equal(
      (await sql`select count(*)::int as n from result_claims where result_id=990041`)[0].n,
      0,
    );
    assert.equal(sent.length, 0);
    console.log(
      "No-email mode passed: passwords work; codes, recovery and unverified profile saving stay unavailable.",
    );
  } else {
    for (const [label, details, expectedCode] of invalidDetails) {
      const email = `invalid-otp-${label}@example.test`;
      const code = await sendCode(email);
      const response = await post("sign-in/email-otp", { ...details, email, otp: code });
      assert.equal(response.status, 400, `${label}: ${await response.clone().text()}`);
      assert.equal((await response.json()).code, expectedCode, label);
      assert.equal((await sql`select count(*)::int as n from "user" where email=${email}`)[0].n, 0);
      assert(
        (await post("sign-in/email-otp", { ...signupDetails(), email, otp: code })).status >= 400,
        "A rejected new account does not make a consumed code reusable",
      );
    }
    const recoveredEmail = "invalid-otp-full-name-only@example.test";
    const recovered = await post("sign-in/email-otp", {
      email: recoveredEmail,
      otp: await sendCode(recoveredEmail),
      name: "Ignored Full Name",
      firstName: "  Ana\u00a0María  ",
      lastName: " O’Neill-Smith ",
      signupCountry: " england ",
      signupLocation: "  NR1  2AB  ",
    });
    assert.equal(recovered.status, 200, await recovered.clone().text());
    const recoveredUser = (await recovered.json()).user;
    assert.equal(recoveredUser.name, "Ana María O’Neill-Smith");
    for (const key of ["firstName", "lastName", "signupCountry", "signupLocation"])
      assert(!(key in recoveredUser), `${key} stays out of the auth response`);
    const [storedDetails] =
      await sql`select "firstName","lastName","signupCountry","signupLocation" from "user" where id=${recoveredUser.id}`;
    assert.deepEqual(storedDetails, {
      firstName: "Ana María",
      lastName: "O’Neill-Smith",
      signupCountry: "England",
      signupLocation: "NR1 2AB",
    });
    // Synthetic legacy data explicitly represents registrations made before this requirement.
    await sql`update "user" set name='',"firstName"=null,"lastName"=null,"signupCountry"=null,"signupLocation"=null where id=${recoveredUser.id}`;
    const legacyOtp = await post("sign-in/email-otp", {
      email: recoveredEmail,
      otp: await sendCode(recoveredEmail),
    });
    assert.equal(legacyOtp.status, 200, await legacyOtp.clone().text());
    assert.equal((await legacyOtp.json()).user.id, recoveredUser.id);

    const email = "code-runner@example.test";
    const code = await sendCode(email);
    const stored = await sql`select value from verification where identifier like ${`%${email}%`}`;
    assert(stored.length);
    assert(
      stored.every((row) => !row.value.includes(code)),
      "Only a hash of the code is stored",
    );
    const login = await post("sign-in/email-otp", {
      email,
      otp: code,
      ...signupDetails("Code Runner"),
    });
    assert.equal(login.status, 200, await login.clone().text());
    const user = await login.json();
    assert.equal(user.user.emailVerified, true);
    assert.equal(user.user.name, "Code Runner");
    assert(
      (await post("sign-in/email-otp", { email, otp: code })).status >= 400,
      "Codes are single-use",
    );
    const account = await rpc(
      "athrecs/athlete-account-api",
      "getMyAthleteAccount",
      undefined,
      user.token,
    );
    assert.equal(account.dateOfBirth, "");
    assert.equal(account.postcode, "");
    assert.equal(
      account.exists,
      false,
      "Signup details do not publish or complete an athlete profile",
    );
    const saved = await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteAccount",
      { ...account, fullName: "Code Runner", privacyAcknowledged: true },
      user.token,
    );
    assert.equal(saved.fullName, "Code Runner");
    assert.equal(saved.athleteNumber, account.athleteNumber);
    const withDetails = await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteAccount",
      { ...saved, dateOfBirth: "1990-04-12", postcode: "EX1 1AA" },
      user.token,
    );
    assert.equal(withDetails.dateOfBirth, "1990-04-12");
    assert.equal(withDetails.postcode, "EX1 1AA");
    assert.equal(withDetails.profileDetails.birthdayVisibility, "hidden");
    const narrowSave = await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteRacingName",
      {
        fullName: "Code Runner",
        privacyAcknowledged: true,
        dateOfBirth: "2000-01-01",
        postcode: "ALTERED",
        consents: { marketing: true },
        userId: "another-user",
      },
      user.token,
    );
    assert.equal(narrowSave.dateOfBirth, withDetails.dateOfBirth);
    assert.equal(narrowSave.postcode, withDetails.postcode);
    assert.equal(
      narrowSave.consents.marketing,
      false,
      "The name API ignores injected unrelated fields",
    );
    await assert.rejects(
      () =>
        rpc(
          "athrecs/athlete-account-api",
          "saveMyAthleteRacingName",
          {
            fullName: "Code Runner",
            privacyAcknowledged: false,
          },
          user.token,
        ),
      /privacy notice/,
    );
    await assert.rejects(
      () =>
        rpc("athrecs/athlete-account-api", "saveMyAthleteRacingName", {
          fullName: "Unauthenticated",
          privacyAcknowledged: true,
        }),
      "Name saving requires a session",
    );
    await assert.rejects(
      () =>
        rpc(
          "athrecs/athlete-account-api",
          "saveMyAthleteRacingName",
          {
            fullName: "Cross Site",
            privacyAcknowledged: true,
          },
          user.token,
          { origin: "https://untrusted.example", "sec-fetch-site": "cross-site" },
        ),
      "Cross-site writes are rejected",
    );
    const cleared = await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteAccount",
      { ...withDetails, dateOfBirth: "", postcode: "" },
      user.token,
    );
    assert.equal(cleared.dateOfBirth, "");
    assert.equal(cleared.postcode, "");
    for (const dateOfBirth of ["2025-02-29", "2024-02-31", "1900-02-29", "2999-01-01"]) {
      await assert.rejects(
        () =>
          rpc(
            "athrecs/athlete-account-api",
            "saveMyAthleteAccount",
            {
              ...cleared,
              dateOfBirth,
            },
            user.token,
          ),
        /Date of birth is invalid/,
        `Reject invalid date ${dateOfBirth} at the API boundary`,
      );
    }
    const again = await post("sign-in/email-otp", { email, otp: await sendCode(email) });
    assert.equal(again.status, 200, await again.clone().text());
    assert.equal(
      (await again.json()).user.id,
      user.user.id,
      "An existing account and athlete ID are reused",
    );
    const share = await rpc(
      "athrecs/athlete-profile-share-api",
      "getMyProfileShare",
      undefined,
      user.token,
    );
    assert.equal(share.enabled, false, "Signing in does not publish a profile");
    const lockedEmail = "attempts@example.test";
    const correct = await sendCode(lockedEmail);
    const wrong = correct === "000000" ? "111111" : "000000";
    for (let i = 0; i < 3; i++)
      assert((await post("sign-in/email-otp", { email: lockedEmail, otp: wrong })).status >= 400);
    assert(
      (await post("sign-in/email-otp", { email: lockedEmail, otp: correct })).status >= 400,
      "Three failed attempts invalidate the code",
    );
    const expiredEmail = "expired@example.test";
    const expired = await sendCode(expiredEmail);
    await sql`update verification set "expiresAt"=now()-interval '1 minute' where identifier like ${`%${expiredEmail}%`}`;
    assert(
      (await post("sign-in/email-otp", { email: expiredEmail, otp: expired })).status >= 400,
      "Expired codes are refused",
    );
    const passwordEmail = "email-password@example.test";
    const password = "Test-password-123!";
    const signup = await post("sign-up/email", {
      email: passwordEmail,
      password,
      ...signupDetails("Password Runner"),
      callbackURL: "/athlete-account",
    });
    assert.equal(signup.status, 200, await signup.clone().text());
    assert.equal((await post("sign-in/email", { email: passwordEmail, password })).status, 403);
    const verificationEmail = sent.findLast((mail) => mail.to.includes(passwordEmail));
    const verificationUrl = verificationEmail.text.match(/http:\/\/[^\s]+/)?.[0];
    assert(verificationUrl?.startsWith(origin));
    const verified = await fetch(verificationUrl, { headers: { origin }, redirect: "manual" });
    assert(verified.status < 400);
    const credentialLogin = await post("sign-in/email", { email: passwordEmail, password });
    assert.equal(credentialLogin.status, 200, await credentialLogin.clone().text());
    assert.equal((await credentialLogin.json()).user.emailVerified, true);
    const hijackEmail = "preclaimed-email@example.test";
    const attackerPassword = "Attacker-password-123!";
    const unverified = await post("sign-up/email", {
      email: hijackEmail,
      password: attackerPassword,
      ...signupDetails("Unverified Name"),
    });
    assert.equal(unverified.status, 200, await unverified.clone().text());
    const ownerLogin = await post("sign-in/email-otp", {
      email: hijackEmail,
      otp: await sendCode(hijackEmail),
    });
    assert.equal(ownerLogin.status, 200, await ownerLogin.clone().text());
    const owner = await ownerLogin.json();
    // This Better Auth version returns its pre-update user snapshot here;
    // the account API and ownership checks must use the authoritative DB value.
    const ownerAccount = await rpc(
      "athrecs/athlete-account-api",
      "getMyAthleteAccount",
      undefined,
      owner.token,
    );
    assert.equal(ownerAccount.emailVerified, true);
    assert.equal(
      (await post("sign-in/email", { email: hijackEmail, password: attackerPassword })).status,
      401,
      "Proving mailbox ownership must remove an attacker's earlier unverified password",
    );
    assert.equal(
      (
        await sql`select count(*)::int as n from account where "userId"=${owner.user.id} and "providerId"='credential'`
      )[0].n,
      0,
    );
    const expiredSession = await post("sign-out", {}, { authorization: `Bearer ${owner.token}` });
    assert.equal(expiredSession.status, 200);
    await assert.rejects(
      () => rpc("athrecs/athlete-account-api", "getMyAthleteAccount", undefined, owner.token),
      "A signed-out bearer token must not read private account data",
    );
    for (const provider of ["google", "apple", "microsoft", "facebook", "twitter", "linkedin"]) {
      const response = await post("sign-in/social", {
        provider,
        callbackURL: "/athlete-account",
        disableRedirect: true,
      });
      assert.equal(response.status, 200, `${provider}: ${await response.clone().text()}`);
      const value = await response.json();
      const url = new URL(value.url);
      assert.equal(url.protocol, "https:");
      assert.equal(url.searchParams.get("redirect_uri"), `${origin}/api/auth/callback/${provider}`);
    }
    const missingOAuthEmail = "oauth-missing-details@example.test";
    const deniedOAuth = await finishGoogle(await startGoogle(), missingOAuthEmail, {
      firstName: "Query",
      lastName: "Spoof",
      signupCountry: "England",
      signupLocation: "Norwich",
    });
    assert.equal(deniedOAuth.status, 302);
    assert(
      new URL(deniedOAuth.headers.get("location"), origin).searchParams.has("error"),
      "OAuth cannot bypass required details with a provider display name or callback query",
    );
    assert.equal(
      (await sql`select count(*)::int as n from "user" where email=${missingOAuthEmail}`)[0].n,
      0,
    );
    const validOAuth = await startGoogle(signupDetails("OAuth Test Runner"));
    const oauthEmail = "oauth-complete-details@example.test";
    const missingCookie = await finishGoogle({ ...validOAuth, cookie: "" }, oauthEmail);
    assert.equal(missingCookie.status, 302);
    assert(new URL(missingCookie.headers.get("location"), origin).searchParams.has("error"));
    assert.equal(
      (await sql`select count(*)::int as n from "user" where email=${oauthEmail}`)[0].n,
      0,
    );
    const completedOAuth = await finishGoogle(validOAuth, oauthEmail);
    assert.equal(completedOAuth.status, 302);
    assert.equal(
      new URL(completedOAuth.headers.get("location"), origin).pathname,
      "/athlete-account",
    );
    assert(!new URL(completedOAuth.headers.get("location"), origin).searchParams.has("error"));
    const [oauthUser] =
      await sql`select id,name,"firstName","lastName","signupCountry","signupLocation" from "user" where email=${oauthEmail}`;
    assert.deepEqual(
      { ...oauthUser, id: undefined },
      {
        id: undefined,
        name: "OAuth Test Runner",
        firstName: "OAuth",
        lastName: "Test Runner",
        signupCountry: "England",
        signupLocation: "Norwich",
      },
    );
    const oauthSession = await fetch(`${origin}/api/auth/get-session`, {
      headers: { origin, cookie: responseCookies(completedOAuth) },
    });
    assert.equal(oauthSession.status, 200);
    const sessionUser = (await oauthSession.json()).user;
    assert.equal(sessionUser.id, oauthUser.id);
    for (const key of ["firstName", "lastName", "signupCountry", "signupLocation"])
      assert(!(key in sessionUser), `${key} stays out of the session response`);
    const existingOAuth = await finishGoogle(await startGoogle(), oauthEmail);
    assert.equal(existingOAuth.status, 302);
    assert(!new URL(existingOAuth.headers.get("location"), origin).searchParams.has("error"));
    assert.equal(
      (await sql`select count(*)::int as n from "user" where email=${oauthEmail}`)[0].n,
      1,
    );
    console.log(
      "Email login flow passed: required names/country/location, normalized private signup details, fresh-code recovery, legacy login, delivery adapter, password verification, hashed one-time codes, expiry, attempts, stable profile IDs, DOB validation, scoped name writes, cross-site/unauthenticated rejection, pre-registration attack prevention, logout revocation, OAuth protected-state signup and six OAuth redirects.",
    );
  }
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
