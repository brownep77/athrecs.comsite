// Real local authentication and private-account RPCs, disposable database only.
// Every external request is blocked except intercepted synthetic email delivery.
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";
import { signupDetails } from "./fixtures/signup-details.mjs";

const origin = "http://127.0.0.1:18492";
for (const key of [
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "GROK_AUTH_CLIENT_ID",
  "GROK_AUTH_CLIENT_SECRET",
  "ATHRECS_STAFF_EMAILS",
  "ATHRECS_CLAIMS_EMAILS",
  "INTERCOM_SECRET_KEY",
  "VITE_INTERCOM_APP_ID",
])
  process.env[key] = "";
for (const provider of [
  "GOOGLE",
  "APPLE",
  "MICROSOFT",
  "FACEBOOK",
  "TWITTER",
  "LINKEDIN",
  "GITHUB",
])
  for (const suffix of ["CLIENT_ID", "CLIENT_SECRET", "TEAM_ID", "KEY_ID", "PRIVATE_KEY"])
    process.env[`${provider}_${suffix}`] = "";
Object.assign(process.env, {
  VERCEL_ENV: "",
  VERCEL: "",
  VITE_AUTH_ENABLED: "true",
  VITE_SITE_BRAND: "athrecs",
  BETTER_AUTH_URL: origin,
  BETTER_AUTH_SECRET: "signup-security-isolated-test-secret-at-least-32-chars",
  RESEND_API_KEY: "synthetic-email-key",
  AUTH_EMAIL_FROM: "AthRecs Test <accounts@example.test>",
  TSS_SERVER_FN_BASE: `${origin}/_serverFn/`,
});
const attemptedMail = [],
  failedRecipients = new Set(),
  deliveryHooks = new Map(),
  checks = [],
  failures = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const body = JSON.parse(init.body);
    assert(
      body.to.every((email) => email.endsWith("@example.test")),
      "Only synthetic recipients",
    );
    attemptedMail.push(body);
    const hook = deliveryHooks.get(body.to[0]);
    if (hook) return hook(body);
    if (body.to.some((email) => failedRecipients.has(email)))
      return Response.json({ message: "Synthetic provider outage" }, { status: 503 });
    return Response.json({ id: `synthetic-email-${attemptedMail.length}` });
  }
  assert(url.startsWith(`${origin}/`), "No external network requests are permitted");
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18492, strictPort: true } });
let database,
  requestNumber = 1;
const cookiesFrom = (response) =>
  response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
const headersFor = (cookie = "") => ({
  origin,
  "sec-fetch-site": "same-origin",
  ...(cookie ? { cookie } : {}),
});
function post(path, data, cookie = "") {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    redirect: "manual",
    headers: {
      ...headersFor(cookie),
      "content-type": "application/json",
      "x-forwarded-for": `127.2.0.${requestNumber++}`,
    },
    body: JSON.stringify(data),
  });
}
const modules = new Map();
async function rpc(name, data, cookie) {
  const file = "athrecs/athlete-account-api";
  if (!modules.has(file))
    modules.set(file, await (await fetch(`${origin}/src/lib/${file}.ts`)).text());
  const source = modules.get(file),
    start = source.indexOf(`const ${name} =`);
  assert(start >= 0);
  const section = source.slice(start, source.indexOf(";", start));
  const id = section.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  const method = section.match(/method: "(GET|POST)"/)?.[1];
  assert(id && method);
  const result = await runWithStartContext({ startOptions: {} }, () =>
    createClientRpc(id)({
      method,
      data,
      headers: headersFor(cookie),
      context: {},
    }),
  );
  if (result.error) throw result.error;
  return result.result;
}
async function check(label, action) {
  try {
    await action();
    checks.push(label);
    console.log(`PASS: ${label}`);
  } catch (error) {
    failures.push(label);
    console.error(`FAIL: ${label}: ${error.message}`);
  }
}
const codeFrom = (email) =>
  attemptedMail.findLast((mail) => mail.to.includes(email))?.text.match(/\b[0-9]{6}\b/)?.[0];
async function signIn(email, name) {
  const send = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
  assert.equal(send.status, 200);
  const response = await post("sign-in/email-otp", {
    email,
    otp: codeFrom(email),
    ...signupDetails(name),
  });
  assert.equal(response.status, 200);
  return { ...(await response.json()), cookie: cookiesFrom(response) };
}
async function privateAccessDenied(cookie, cause) {
  await check(`${cause}: saved cookies cannot read a private account`, async () => {
    await assert.rejects(() => rpc("getMyAthleteAccount", undefined, cookie));
  });
  await check(`${cause}: saved cookies cannot write a private account`, async () => {
    await assert.rejects(() =>
      rpc(
        "saveMyAthleteRacingName",
        { fullName: "Unwanted Change", privacyAcknowledged: true },
        cookie,
      ),
    );
  });
  await check(`${cause}: cached session endpoint no longer identifies the user`, async () => {
    const response = await fetch(`${origin}/api/auth/get-session`, { headers: headersFor(cookie) });
    assert.equal(await response.json(), null);
  });
  for (const path of ["athlete-profile-photo", "athlete-photos", "result-certificates"])
    await check(`${cause}: ${path} rejects saved cookies`, async () => {
      const response = await fetch(`${origin}/api/${path}`, { headers: headersFor(cookie) });
      assert.equal(response.status, 401);
    });
}
try {
  await server.listen();
  const db = await server.ssrLoadModule("/src/lib/db.ts");
  database = await db.getPglite();
  const sql = await db.getSql();

  const signup = await server.ssrLoadModule("/src/lib/auth/signup-details.ts");
  const validSignup = signupDetails("Synthetic Signup Runner");
  await check("registration rejects missing or malformed birthdates", async () => {
    for (const date of ["", "1990-2-3", "not-a-date", "1990-02-30", "2025-02-29", "9999-12-31"]) {
      assert.equal(signup.signupDetailsError({ ...validSignup, signupDateOfBirth: date })?.code,
        "SIGNUP_BIRTHDATE_REQUIRED", "Invalid birthdate accepted: " + date);
    }
  });
  await check("registration accepts leap days and normalises country", async () => {
    assert.equal(signup.signupDetailsError({ ...validSignup, signupDateOfBirth: "2000-02-29" }), null);
    assert.equal(signup.normalizeSignupDetails({ ...validSignup, signupCountry: "england" }).signupCountry, "England");
  });
  await check("registration rejects empty city and excessive clubs", async () => {
    assert.equal(signup.signupDetailsError({ ...validSignup, signupLocation: "   " })?.code, "SIGNUP_LOCATION_REQUIRED");
    assert.equal(signup.signupDetailsError({ ...validSignup, signupClubs: "x".repeat(1001) })?.code, "SIGNUP_CLUBS_INVALID");
    assert.equal(signup.signupDetailsError({ ...validSignup, signupClubs: Array.from({ length: 21 }, (_, i) => "Club " + i).join("\n") })?.code, "SIGNUP_CLUBS_INVALID");
    assert.equal(signup.signupDetailsError({ ...validSignup, signupClubs: "" }), null);
    assert.equal(signup.signupDetailsError({ ...validSignup, signupClubs: "Club One\nClub Two" }), null);
  });
  await check("date of birth and club history excluded from session schema", async () => {
    assert.equal(signup.signupUserFields.signupDateOfBirth.returned, false);
    assert.equal(signup.signupUserFields.signupClubs.returned, false);
  });
  await check("OTP registration rejects missing date of birth", async () => {
    const email = "missing-dob-synthetic@example.test";
    assert.equal((await post("email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
    const { signupDateOfBirth, ...noBirthdate } = validSignup;
    const response = await post("sign-in/email-otp", { email, otp: codeFrom(email), ...noBirthdate });
    assert(response.status >= 400 && response.status < 500, "Invalid registration must be rejected");
  });
  const alpha = await signIn("security-alpha@example.test", "Security Alpha");
  await check("verified login and session do not reveal private date of birth or clubs", async () => {
    assert(!JSON.stringify(alpha).includes("1990-05-15"));
    assert(!JSON.stringify(alpha).includes("Synthetic Runners AC"));
    const response = await fetch(origin + "/api/auth/get-session", { headers: headersFor(alpha.cookie) });
    const body = await response.text();
    assert(!body.includes("1990-05-15") && !body.includes("Synthetic Runners AC"));
  });
  const beta = await signIn("security-beta@example.test", "Security Beta");
  await rpc(
    "saveMyAthleteRacingName",
    { fullName: "Private Alpha", privacyAcknowledged: true },
    alpha.cookie,
  );
  await rpc(
    "saveMyAthleteRacingName",
    { fullName: "Private Beta", privacyAcknowledged: true },
    beta.cookie,
  );
  await check(
    "two accounts keep private records separate even with a spoofed user ID",
    async () => {
      const a = await rpc("getMyAthleteAccount", { userId: beta.user.id }, alpha.cookie);
      const b = await rpc("getMyAthleteAccount", { userId: alpha.user.id }, beta.cookie);
      assert.equal(a.userId, alpha.user.id);
      assert.equal(a.fullName, "Private Alpha");
      assert.equal(b.userId, beta.user.id);
      assert.equal(b.fullName, "Private Beta");
      assert(!JSON.stringify(a).includes(beta.user.email));
      assert(!JSON.stringify(b).includes(alpha.user.email));
    },
  );
  await check("a spoofed account ID cannot change the other account", async () => {
    await rpc(
      "saveMyAthleteRacingName",
      { userId: beta.user.id, fullName: "Alpha Updated", privacyAcknowledged: true },
      alpha.cookie,
    );
    assert.equal(
      (await rpc("getMyAthleteAccount", undefined, beta.cookie)).fullName,
      "Private Beta",
    );
  });
  const alphaSecond = await signIn("security-alpha@example.test", "Security Alpha");
  const signout = await post("sign-out", {}, alpha.cookie);
  assert.equal(signout.status, 200);
  await privateAccessDenied(alpha.cookie, "sign-out");
  await check("signing out one session leaves the other genuine session usable", async () => {
    assert.equal(
      (await rpc("getMyAthleteAccount", undefined, alphaSecond.cookie)).userId,
      alpha.user.id,
    );
  });
  const recovery = await post("request-password-reset", {
    email: alpha.user.email,
    redirectTo: "/athlete-account",
  });
  assert.equal(recovery.status, 200);
  const resetMail = attemptedMail.findLast(
    (mail) => mail.to.includes(alpha.user.email) && mail.subject.includes("Reset"),
  );
  const resetUrl = new URL(resetMail.text.match(/http:\/\/[^\s]+/)[0]);
  assert.equal(resetUrl.origin, origin);
  const reset = await post("reset-password", {
    token: resetUrl.pathname.split("/").at(-1),
    newPassword: "New-private-password-123!",
  });
  assert.equal(reset.status, 200);
  await privateAccessDenied(alphaSecond.cookie, "password reset");
  await check("resetting one account does not revoke the other account", async () => {
    assert.equal((await rpc("getMyAthleteAccount", undefined, beta.cookie)).userId, beta.user.id);
  });
  const failedEmail = "delivery-new@example.test";
  failedRecipients.add(failedEmail);
  failedRecipients.add(beta.user.email);
  const [failedNew, failedExisting, successful] = await Promise.all([
    post("email-otp/send-verification-otp", { email: failedEmail, type: "sign-in" }),
    post("email-otp/send-verification-otp", { email: beta.user.email, type: "sign-in" }),
    post("email-otp/send-verification-otp", {
      email: "delivery-good@example.test",
      type: "sign-in",
    }),
  ]);
  await check("provider failure returns a generic 503 for new and existing addresses", async () => {
    assert.equal(failedNew.status, 503);
    assert.equal(failedExisting.status, 503);
    const a = await failedNew.clone().json(),
      b = await failedExisting.clone().json();
    assert.deepEqual(a, b);
    assert.equal(a.code, "AUTH_EMAIL_DELIVERY_UNAVAILABLE");
    assert(!JSON.stringify(a).includes("Synthetic provider outage"));
    assert(!JSON.stringify(a).includes("@"));
    assert.match(failedNew.headers.get("cache-control"), /no-store/);
  });
  await check(
    "simultaneous successful delivery is not affected by another request's failure",
    async () => {
      assert.equal(successful.status, 200);
      assert.equal((await successful.json()).success, true);
    },
  );
  for (const email of [failedEmail, beta.user.email])
    await check(
      `undelivered sign-in code is unusable (${email === failedEmail ? "new" : "existing"} account)`,
      async () => {
        assert.equal(
          (
            await sql`select count(*)::int n from verification where identifier=${`sign-in-otp-${email}`}`
          )[0].n,
          0,
        );
        const response = await post("sign-in/email-otp", {
          email,
          otp: codeFrom(email),
          ...signupDetails("Delivery Test"),
        });
        assert(response.status >= 400);
      },
    );
  failedRecipients.delete(failedEmail);
  await check("the visitor can retry normally after delivery recovers", async () => {
    const user = await signIn(failedEmail, "Delivery Recovered");
    assert(user.user.emailVerified);
  });
  await check(
    "an older failed send cannot invalidate a newer successfully delivered code",
    async () => {
      const email = "delivery-overlap@example.test";
      let started,
        release,
        calls = 0;
      const firstStarted = new Promise((resolve) => {
        started = resolve;
      });
      const firstReleased = new Promise((resolve) => {
        release = resolve;
      });
      deliveryHooks.set(email, async () => {
        if (++calls === 1) {
          started();
          await firstReleased;
          return Response.json({ message: "Synthetic delayed rejection" }, { status: 503 });
        }
        return Response.json({ id: "synthetic-overlap-success" });
      });
      const older = post("email-otp/send-verification-otp", { email, type: "sign-in" });
      try {
        await Promise.race([
          firstStarted,
          older.then(() => {
            throw new Error("First send ended before reaching the intercepted provider");
          }),
        ]);
        const newer = await post("email-otp/send-verification-otp", { email, type: "sign-in" });
        assert.equal(newer.status, 200);
        const code = codeFrom(email);
        release();
        assert.equal((await older).status, 503);
        const response = await post("sign-in/email-otp", {
          email,
          otp: code,
          ...signupDetails("Overlap Test"),
        });
        assert.equal(response.status, 200);
      } finally {
        release();
        deliveryHooks.delete(email);
        await older;
      }
    },
  );
  console.log(JSON.stringify({ passed: checks.length, failed: failures.length, failures }));
  assert.equal(failures.length, 0, "Authentication security regressions failed");
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
