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
const emailPasswordAvailable = authEnabled && emailPasswordFeatureEnabled;
const emailDeliveryAvailable =
  emailPasswordAvailable && resendApiKeyPresent && authEmailFromPresent;

console.log(
  "[auth-env-check]",
  JSON.stringify({
    vercelProduction,
    authEnabled,
    emailPasswordFeatureEnabled,
    resendApiKeyPresent,
    authEmailFromPresent,
    emailPasswordAvailable,
    emailDeliveryAvailable,
  }),
);

if (vercelProduction && emailPasswordAvailable && !emailDeliveryAvailable) {
  console.warn(
    "[auth-env-check] Email/password sign-in will remain available, but email verification and password recovery are disabled until RESEND_API_KEY and AUTH_EMAIL_FROM are present.",
  );
}
