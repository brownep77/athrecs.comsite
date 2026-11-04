# AthRecs sign-up and ownership safeguards

## Purpose

The sign-up review found that private account settings, public sporting records,
mailbox verification and athlete ownership were too easy to confuse. Targeted
tests also reproduced stale-session access after logout/password reset and an
email-code delivery failure being reported as a successful request.

This change addresses those concrete issues. It is an engineering review and
regression suite, not an independent penetration-test certification.

## Changes

- Protected requests check the current server session. Cached authentication
  snapshots are disabled so logout and password reset revoke access immediately.
- A failed sign-in-code delivery returns a generic retryable failure. The failed
  code is invalidated without removing a newer code from an overlapping successful
  request. Request-local state prevents one visitor's failure changing another
  visitor's response.
- Production builds and the authentication runtime reject missing or unsafe
  authentication, HTTPS-origin, database and email-delivery configuration. Error
  messages identify setting names, never their values. Isolated development and
  preview tests retain their deliberately limited no-email mode.
- New athlete ownership requests wait for an independent staff review. A reviewed
  manager must have the matching approved source claim, review time, evidence note
  and an independently recorded reviewer. An email verification, matching name,
  `approved` status or `staff` label on its own does not grant management rights.
- Historical links and account choices remain stored. Unreviewed links retain
  private account/history access but cannot edit canonical athlete records,
  publish account overlays or represent an athlete in partnerships. Stored privacy
  withdrawals are respected. Staff can review an existing association without
  deleting and rebuilding it.
- The join form, account pages and privacy notice distinguish private account data
  from separately published sporting records. Optional consent no longer earns
  profile-completion points. A town or city is sufficient at registration.
- Authentication pages receive protective framing/referrer headers, and auth
  responses are explicitly non-cacheable. The stricter response policy on private
  certificate downloads is left in the handler and is not replaced by a global CSP.

Ownership review does not verify a sporting performance. Existing source evidence,
performance status, publication decisions and historical result facts are not
upgraded by these changes.

## Data preservation

The new migration adds an authorization function and view. It does not update or
delete existing claims, links, account choices, athletes or results. The management
regression suite checks row preservation and the retained private history. An
existing self-confirmed link may require staff review before public management or
sharing resumes; this is a permission restriction, not record deletion.

## Reproducible checks

Run `npm run verify:signup-security` for the production configuration, real isolated
authentication and reviewed-management regression suites. This command is included
in the quality gate.

The authentication regression first reproduced 15 failing checks out of 21 on the
old implementation. The corrected suite passes 22 checks, including a new overlap
test for failed and successful code delivery. Production configuration has 48
behavior assertions. All authentication test identities are synthetic, all email
delivery is intercepted and external databases are disabled.

The ordinary `verify:email-login-flow` suite covers registration, required private
details, one-time codes, password email verification, cross-account/origin isolation
and the no-email development mode. Claim, archive, partnership and profile-journey
tests now exercise a pending first claim followed by an independent synthetic
staff review; they do not bypass the new production authorization rule.

## Production evidence and limits

Before the change, the `www.athrecs.com` alias was verified against the intended
Vercel project and source commit. Production metadata and build logs confirmed
authentication, email-delivery and Intercom signing configuration without exposing
secret values. The live join form was inspected with optional analytics off.

Synthetic delivery tests establish application behavior, not receipt in a real
mailbox. A live signed-in recovery walkthrough requires the account owner's secure
authentication. The Intercom dashboard also requires authentication to verify its
Messenger Security enforcement and protected-attribute settings. A configured
signing key and passing local JWT tests do not prove those dashboard settings.

Release status and the final production commit are recorded in the pull request.
