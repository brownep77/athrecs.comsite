import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { createServer } from "vite";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

// Real auth endpoints and profile RPCs; only email delivery is intercepted.
// Never send a test email or use a configured external database.
const delivery = !process.argv.includes("--no-email");
process.env.DATABASE_URL = "";
process.env.DATABASE_URL_UNPOOLED = "";
process.env.POSTGRES_URL_NON_POOLING = "";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = delivery ? "test-resend-key" : "";
process.env.AUTH_EMAIL_FROM = "ATHRECS Test <accounts@example.test>";
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
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
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
async function rpc(file, name, data, token) {
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
      name: "Password Test",
    });
    assert.equal(created.status, 200, await created.clone().text());
    const login = await post("sign-in/email", {
      email: "password-only@example.test",
      password: "Test-password-123!",
    });
    assert.equal(login.status, 200, await login.clone().text());
    const body = await login.json();
    assert.equal(body.user.emailVerified, false);
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
    assert.equal(sent.length, 0);
    console.log(
      "No-email mode passed: passwords work; codes, recovery and unverified profile saving stay unavailable.",
    );
  } else {
    const email = "code-runner@example.test";
    const code = await sendCode(email);
    const stored = await sql`select value from verification where identifier like ${`%${email}%`}`;
    assert(stored.length);
    assert(
      stored.every((row) => !row.value.includes(code)),
      "Only a hash of the code is stored",
    );
    const login = await post("sign-in/email-otp", { email, otp: code, name: "Code Runner" });
    assert.equal(login.status, 200, await login.clone().text());
    const user = await login.json();
    assert.equal(user.user.emailVerified, true);
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
    const saved = await rpc(
      "athrecs/athlete-account-api",
      "saveMyAthleteAccount",
      { ...account, fullName: "Code Runner", privacyAcknowledged: true },
      user.token,
    );
    assert.equal(saved.fullName, "Code Runner");
    assert.equal(saved.athleteNumber, account.athleteNumber);
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
      name: "Password Runner",
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
    console.log(
      "Email login flow passed: delivery adapter, password verification, hashed one-time codes, expiry, attempts, stable profile IDs, privacy and six OAuth redirects.",
    );
  }
} finally {
  await server.close();
  await database?.close();
  globalThis.fetch = realFetch;
}
