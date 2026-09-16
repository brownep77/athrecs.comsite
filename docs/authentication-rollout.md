# ATHRECS authentication rollout

The shared sign-in chooser offers email/password and configured social providers. The athlete account entry now names email sign-in explicitly and has no Google-only wording. Verified email remains required for saving profile data, regardless of the sign-in provider.

Email-only sign-in uses six-digit, single-use codes. Codes expire after five minutes, are stored hashed, and stop working after three failed attempts. The delivery adapter must be configured before the code option is offered. An existing email reuses the same account and permanent athlete ID; sign-in does not publish a profile.

Provider activation details and exact callback URLs are in [the authentication setup guide](authentication/README.md). Apple, LinkedIn, Microsoft, Facebook and X are shown only when their credentials and any required email delivery are configured. Site code alone cannot register provider applications or supply their secrets.

`npm run verify:email-login-flow` exercises real authentication endpoints and profile RPCs with disposable storage and a captured email adapter. It checks code delivery, replay, expiry, attempts, password verification, stable IDs, profile privacy, provider redirects and behaviour without email delivery. No real emails are sent by the test.
