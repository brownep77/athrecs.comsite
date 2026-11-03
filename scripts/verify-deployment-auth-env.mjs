#!/usr/bin/env node

import { emailAndPasswordEnabled } from "../src/lib/auth/email-password.ts";
import { assertProductionAuthConfiguration } from "../src/lib/auth/production-config.ts";

const present = (value) => Boolean(value?.trim());
const emailPasswordFeatureEnabled = emailAndPasswordEnabled;
const vercelProduction = process.env.VERCEL_ENV === "production";
const authEnabled = process.env.VITE_AUTH_ENABLED !== "false";
const resendApiKeyPresent = present(process.env.RESEND_API_KEY);
const authEmailFromCustom = present(process.env.AUTH_EMAIL_FROM);
const emailPasswordAvailable = authEnabled && emailPasswordFeatureEnabled;
// email.server.ts supplies ATHRECS Accounts <accounts@athrecs.com> by default.
const emailDeliveryAvailable = emailPasswordAvailable && resendApiKeyPresent;

// Reject before migrations/build, using the same checks as the runtime server.
// Local development and isolated CI keep their deliberate no-email mode.
assertProductionAuthConfiguration(process.env, emailPasswordFeatureEnabled);

console.log(
  "[auth-env-check]",
  JSON.stringify({
    vercelProduction,
    authEnabled,
    emailPasswordFeatureEnabled,
    resendApiKeyPresent,
    authEmailFromCustom,
    authEmailFromDefaulted: !authEmailFromCustom,
    emailPasswordAvailable,
    emailDeliveryAvailable,
  }),
);
