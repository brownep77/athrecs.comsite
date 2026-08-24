#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const present = (value) => Boolean(value?.trim());
const featureFile = fileURLToPath(
  new URL("../src/lib/auth/email-password.ts", import.meta.url),
);
const featureSource = readFileSync(featureFile, "utf8");
const emailPasswordFeatureEnabled = /emailAndPasswordEnabled\s*=\s*true/.test(featureSource);
const vercelProduction = process.env.VERCEL_ENV === "production";
const authEnabled = process.env.VITE_AUTH_ENABLED !== "false";
const resendApiKeyPresent = present(process.env.RESEND_API_KEY);
const authEmailFromPresent = present(process.env.AUTH_EMAIL_FROM);
const emailPasswordAvailable =
  authEnabled &&
  emailPasswordFeatureEnabled &&
  resendApiKeyPresent &&
  authEmailFromPresent;

console.log(
  "[auth-env-check]",
  JSON.stringify({
    vercelProduction,
    authEnabled,
    emailPasswordFeatureEnabled,
    resendApiKeyPresent,
    authEmailFromPresent,
    emailPasswordAvailable,
  }),
);

if (
  vercelProduction &&
  authEnabled &&
  emailPasswordFeatureEnabled &&
  !emailPasswordAvailable
) {
  const missing = [
    !resendApiKeyPresent ? "RESEND_API_KEY" : null,
    !authEmailFromPresent ? "AUTH_EMAIL_FROM" : null,
  ].filter(Boolean);
  throw new Error(
    `Production email/password authentication is enabled but missing: ${missing.join(", ")}`,
  );
}
