import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { safeAuthCallback } from "../src/lib/auth/auth-methods.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

const [
  server,
  client,
  methodsApi,
  dialog,
  header,
  rootRoute,
  email,
  emailFlag,
  deploymentGuard,
  envExample,
  docs,
] = await Promise.all([
  read("src/lib/auth/server.ts"),
  read("src/lib/auth/client.ts"),
  read("src/lib/auth/auth-methods-api.ts"),
  read("src/components/auth/AthleteAuthDialog.tsx"),
  read("src/components/auth/AthleteAccountAccess.tsx"),
  read("src/routes/__root.tsx"),
  read("src/lib/auth/email.server.ts"),
  read("src/lib/auth/email-password.ts"),
  read("scripts/verify-deployment-auth-env.mjs"),
  read(".env.example"),
  read("docs/authentication/README.md"),
]);

assert.equal(safeAuthCallback("/claim-results?resultId=42"), "/claim-results?resultId=42");
assert.equal(safeAuthCallback("https://evil.example/steal"), "/athlete-account");
assert.equal(safeAuthCallback("//evil.example/steal"), "/athlete-account");
assert.equal(safeAuthCallback("javascript:alert(1)"), "/athlete-account");

assert.match(emailFlag, /emailAndPasswordEnabled = true/);
assert.match(server, /emailPasswordConfigured = !authDisabled && emailAndPasswordEnabled/);
assert.match(server, /emailDeliveryConfigured/);
assert.match(server, /requireEmailVerification:\s*emailDeliveryConfigured/);
assert.match(server, /sendResetPassword/);
assert.match(server, /revokeSessionsOnPasswordReset:\s*true/);
assert.match(server, /resetPasswordTokenExpiresIn:\s*60 \* 60/);
assert.match(server, /requireLocalEmailVerified:\s*true/);
assert.match(server, /https:\/\/appleid\.apple\.com/);
assert.match(server, /generateAppleClientSecret/);
assert.match(server, /dsaEncoding:\s*["']ieee-p1363["']/);

for (const provider of [
  "google",
  "apple",
  "microsoft",
  "facebook",
  "twitter",
  "linkedin",
]) {
  assert.match(server, new RegExp(`${provider}:`), `${provider} server provider missing`);
  assert.match(envExample, new RegExp(`callback/${provider}`), `${provider} callback docs missing`);
}

assert.doesNotMatch(methodsApi, /providerId:\s*["']github["']/);
assert.doesNotMatch(envExample, /callback\/github/);
assert.doesNotMatch(docs, /\| GitHub \|/);
assert.match(methodsApi, /emailAndPasswordEnabled/);
assert.match(methodsApi, /passwordReset:\s*emailDelivery/);
assert.match(methodsApi, /RESEND_API_KEY/);
assert.match(methodsApi, /AUTH_EMAIL_FROM/);
assert.match(client, /signInWithProvider/);
assert.match(client, /AUTH_DIALOG_EVENT/);
assert.match(dialog, /Create account with email/);
assert.match(dialog, /passwordResetAvailable/);
assert.match(dialog, /temporarily unavailable/);
assert.match(dialog, /requestPasswordReset/);
assert.match(dialog, /resetPassword/);
assert.match(dialog, /Resend verification email/);
assert.doesNotMatch(header, /AthleteAuthDialog/);
assert.match(rootRoute, /AthleteAuthDialog/);
assert.match(email, /https:\/\/api\.resend\.com\/emails/);
assert.match(email, /ATHRECS\.com/);
assert.match(deploymentGuard, /Email\/password sign-in will remain available/);
assert.doesNotMatch(
  deploymentGuard,
  /Production email\/password authentication is enabled but missing/,
);
assert.match(docs, /Strava, Garmin Connect, COROS, Instagram and TikTok/);

console.log(
  "Authentication verification passed: email credentials remain available without Resend, recovery is delivery-gated, and one global multi-social chooser is present.",
);
