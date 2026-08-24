/**
 * Athlete email/password authentication feature flag.
 *
 * The server still requires RESEND_API_KEY and AUTH_EMAIL_FROM before exposing
 * credential endpoints or showing the manual sign-up form. This keeps a missing
 * mail configuration from creating accounts that cannot verify or recover.
 */
export const emailAndPasswordEnabled = true;
