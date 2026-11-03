/**
 * Athlete email/password authentication feature flag.
 *
 * In isolated development/preview, email/password remains available without
 * outgoing email. Production configuration requires delivery. Email codes,
 * verification and recovery require configured delivery. Athlete profile saving
 * and automatic account linking continue to require a verified email.
 */
export const emailAndPasswordEnabled = true;
