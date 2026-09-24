import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";

// Only synthetic identities and in-memory PGLite. Never use production secrets,
// send real mail, or change a published athlete. The fetch guard fails closed.
for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING"])
  process.env[key] = "";
for (const provider of ["GOOGLE", "APPLE", "MICROSOFT", "FACEBOOK", "TWITTER", "LINKEDIN", "GITHUB", "GROK_AUTH"])
  for (const suffix of ["CLIENT_ID", "CLIENT_SECRET", "PRIVATE_KEY"])
    process.env[`${provider}_${suffix}`] = "";
const origin = "http://127.0.0.1:18227";
process.env.BETTER_AUTH_URL = origin;
process.env.BETTER_AUTH_SECRET = "isolated-adversarial-test-only-32-character-secret";
process.env.VITE_AUTH_ENABLED = "true";
process.env.RESEND_API_KEY = "synthetic-key-no-send-permissions";
process.env.AUTH_EMAIL_FROM = "ATHRECS Audit <accounts@example.test>";
const emails = [];
const results = [];
let mailUnavailable = false;
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://api.resend.com/emails") {
    const email = JSON.parse(init.body);
    assert(email.to.every((to) => to.endsWith("@example.test")));
    if (mailUnavailable) return Response.json({ message: "Synthetic mail-service outage" }, { status: 503 });
    emails.push(email);
    return Response.json({ id: `synthetic-${emails.length}` });
  }
  assert.equal(new URL(url).origin, origin, "All external network requests are forbidden");
  return realFetch(input, init);
};
const server = await createServer({ server: { host: "127.0.0.1", port: 18227, strictPort: true } });
let db;
let ip = 1;
async function post(path, body, requestOrigin = origin) {
  return fetch(`${origin}/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: requestOrigin, "sec-fetch-site": requestOrigin === origin ? "same-origin" : "cross-site", "x-forwarded-for": `127.2.0.${ip++}` },
    body: JSON.stringify(body), redirect: "manual", signal: AbortSignal.timeout(30000),
  });
}
async function check(name, fn) {
  try { await fn(); results.push({ name, status: "PASS" }); console.log(`PASS: ${name}`); }
  catch (error) { results.push({ name, status: "FAIL", error: error.message }); console.error(`FAIL: ${name}: ${error.message}`); }
}
async function statusIn(response, accepted) {
  assert(accepted.includes(response.status), `Expected ${accepted.join("/")}, received HTTP ${response.status}`);
}
function emailLink(address, subject) {
  const email = emails.findLast((item) => item.to.includes(address) && item.subject.includes(subject));
  assert(email, "Expected the email adapter to receive a message");
  const url = email.text.match(/http:\/\/[^\s]+/)?.[0];
  assert(url && new URL(url).origin === origin, "Email links must return to this application");
  return new URL(url);
}
const address = "signup-audit@example.test";
const password = "Original-password-123!";
const replacement = "Replacement-password-456!";
let sessionToken;
let resetToken;
let sql;
try {
  await server.listen();
  const module = await server.ssrLoadModule("/src/lib/db.ts");
  db = await module.getPglite();
  sql = await module.getSql();
  await check("Missing signup fields are rejected", async () => statusIn(await post("sign-up/email", {}), [400, 422]));
  await check("Malformed email is rejected", async () => statusIn(await post("sign-up/email", { name: "Audit Runner", email: "not-an-email", password }), [400, 422]));
  await check("Nine-character password is rejected", async () => statusIn(await post("sign-up/email", { name: "Audit Runner", email: "short@example.test", password: "123456789" }), [400, 422]));
  await check("Password above 128 characters is rejected", async () => statusIn(await post("sign-up/email", { name: "Audit Runner", email: "long@example.test", password: "x".repeat(129) }), [400, 422]));
  await check("Untrusted origin cannot create an account", async () => {
    await statusIn(await post("sign-up/email", { name: "Audit Runner", email: "cross-origin@example.test", password }, "https://example.invalid"), [403]);
    assert.equal((await sql`select count(*)::int as n from "user" where email='cross-origin@example.test'`)[0].n, 0);
  });
  await check("External signup callback is rejected", async () => statusIn(await post("sign-up/email", { name: "Audit Runner", email: "callback@example.test", password, callbackURL: "https://example.invalid/collect" }), [400, 403]));
  await check("Exactly ten password characters are accepted", async () => statusIn(await post("sign-up/email", { name: "Boundary Runner", email: "boundary@example.test", password: "1234567890", callbackURL: "/athlete-account" }), [200]));
  await check("New signup remains unverified with no session", async () => {
    const response = await post("sign-up/email", { name: "Audit Runner", email: address, password, callbackURL: "/athlete-account" });
    await statusIn(response, [200]);
    const body = await response.json();
    assert.equal(body.user.emailVerified, false);
    assert(!body.token, "No signed-in session before email verification");
  });
  await check("Repeated signup does not create a duplicate identity", async () => {
    const response = await post("sign-up/email", { name: "Audit Runner", email: address, password });
    assert(response.status < 500, "Duplicate signup must not crash");
    assert.equal((await sql`select count(*)::int as n from "user" where lower(email)=${address}`)[0].n, 1);
  });
  await check("Case variation cannot create a duplicate email identity", async () => {
    const response = await post("sign-up/email", { name: "Audit Runner", email: address.toUpperCase(), password });
    assert(response.status < 500);
    assert.equal((await sql`select count(*)::int as n from "user" where lower(email)=${address}`)[0].n, 1);
  });
  await check("Correct password cannot bypass email verification", async () => statusIn(await post("sign-in/email", { email: address, password }), [403]));
  await check("Email verification link enables normal password sign-in", async () => {
    const response = await fetch(emailLink(address, "Verify").href, { headers: { origin }, redirect: "manual" });
    assert(response.status < 400);
    const login = await post("sign-in/email", { email: address, password });
    await statusIn(login, [200]);
    const body = await login.json();
    assert.equal(body.user.emailVerified, true);
    assert(body.token);
    sessionToken = body.token;
  });
  await check("Wrong password is rejected for a verified account", async () => statusIn(await post("sign-in/email", { email: address, password: "Definitely-wrong-password" }), [400, 401, 403]));
  await check("Unknown-account password reset does not send email", async () => {
    const count = emails.length;
    await statusIn(await post("request-password-reset", { email: "missing@example.test", redirectTo: `${origin}/athlete-account?auth=1&authMode=reset` }), [200]);
    assert.equal(emails.length, count);
  });
  await check("Password recovery creates a same-origin reset link", async () => {
    await statusIn(await post("request-password-reset", { email: address, redirectTo: `${origin}/athlete-account?auth=1&authMode=reset` }), [200]);
    const url = emailLink(address, "Reset");
    resetToken = url.searchParams.get("token") || url.pathname.split("/").at(-1);
    assert(resetToken && resetToken !== "reset-password");
  });
  await check("Password reset rejects a missing token", async () => statusIn(await post("reset-password", { newPassword: replacement }), [400, 422]));
  await check("Password reset rejects a short new password", async () => statusIn(await post("reset-password", { token: resetToken, newPassword: "short" }), [400, 422]));
  await check("Valid reset replaces the old password", async () => {
    await statusIn(await post("reset-password", { token: resetToken, newPassword: replacement }), [200]);
    await statusIn(await post("sign-in/email", { email: address, password }), [400, 401, 403]);
    await statusIn(await post("sign-in/email", { email: address, password: replacement }), [200]);
  });
  await check("Password reset revokes the previous session", async () => {
    assert(sessionToken);
    const response = await fetch(`${origin}/api/auth/get-session`, { headers: { origin, authorization: `Bearer ${sessionToken}` } });
    await statusIn(response, [200]);
    const body = await response.json();
    assert(!body || !body.session);
  });
  await check("A consumed reset token cannot be reused", async () => statusIn(await post("reset-password", { token: resetToken, newPassword: password }), [400, 401, 403]));
  await check("Expired reset tokens are rejected", async () => {
    await statusIn(await post("request-password-reset", { email: address, redirectTo: `${origin}/athlete-account?auth=1&authMode=reset` }), [200]);
    const url = emailLink(address, "Reset");
    const token = url.searchParams.get("token") || url.pathname.split("/").at(-1);
    const changed = await sql`update verification set "expiresAt"=now()-interval '1 minute' where identifier=${`reset-password:${token}`} returning id`;
    assert.equal(changed.length, 1, "Only this synthetic reset token was expired");
    await statusIn(await post("reset-password", { token, newPassword: password }), [400, 401, 403]);
  });
  await check("Email-service outage is not reported as a sent code", async () => {
    mailUnavailable = true;
    try {
      const response = await post("email-otp/send-verification-otp", { email: "outage@example.test", type: "sign-in" });
      assert(response.status >= 400, `Mail failed but endpoint returned HTTP ${response.status}`);
      assert.equal((await sql`select count(*)::int as n from "user" where email='outage@example.test'`)[0].n, 0);
    } finally { mailUnavailable = false; }
  });
  await check("Code sending recovers after email service returns", async () => {
    await statusIn(await post("email-otp/send-verification-otp", { email: "outage@example.test", type: "sign-in" }), [200]);
    assert(emails.some((item) => item.to.includes("outage@example.test")));
  });
} finally {
  await server.close();
  await db?.close();
  globalThis.fetch = realFetch;
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/signup-adversarial-report.json", JSON.stringify({ checkedAt: new Date().toISOString(), scope: "Isolated real auth handlers; synthetic database and intercepted email delivery", results }, null, 2));
}
console.log(`${results.filter((r) => r.status === "PASS").length}/${results.length} additional signup/recovery checks passed.`);
if (results.some((result) => result.status !== "PASS")) process.exitCode = 1;
