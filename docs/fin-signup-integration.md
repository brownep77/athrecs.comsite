# Fin: athlete discovery and verified sign-up handoff

## Purpose and release state

The first integration helps an athlete find possible public AthRecs profiles, then
continue through the existing registration flow with the search details preserved.
The commercial objective is more completed, verified registrations. Profile setup,
result acceptance and ownership review remain separate milestones.

This implementation is **off by default**. It does not configure the Intercom
workspace, select a paid Fin role, connect a model subscription or deploy itself.
The connector exposes two actions; uploading knowledge articles alone does not
enable either action.

| Action                                                 | What it does                                                                               | What its success means                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `find_public_profiles`                                 | Searches the existing anonymous athlete directory and returns up to five public cards.     | Possible profiles were found, or this public search had no matches.                                  |
| `create_signup_link`                                   | Preserves a racing name and optional event/year behind a 24-hour opaque link.              | A link exists. No account has been created or result claimed.                                        |
| Athlete clicks **Continue my search** after signing in | A same-origin authenticated POST resumes the link and checks persisted email verification. | Search hints were recovered by this verified account. A qualifying new registration is counted once. |

The public directory searches names, approved aliases and other visible profile
information such as club or location. These are **possible profiles**, not proof
that someone raced a particular event. The lookup does not filter results by the
event/year mentioned in chat. Those optional details are restored as reminders.

## Application configuration

Use the existing AthRecs Vercel project and database. No new model provider or
database service is required for these first two actions.

| Setting                        | Required value                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ATHRECS_FIN_ENABLED`          | `true` only when ready to test the connector. Omission disables actions and continuation recovery.                                   |
| `ATHRECS_FIN_CONNECTOR_SECRET` | A newly generated secret of at least 32 characters; store only in the deployment secret store and Intercom connector authentication. |
| `DATABASE_URL`                 | The normal persistent database connection. Deployed previews and production fail closed without one.                                 |
| `CRON_SECRET`                  | The existing Vercel cron secret, used by the hourly cleanup endpoint.                                                                |
| Existing Messenger settings    | Keep the current `VITE_INTERCOM_APP_ID` and separate `INTERCOM_SECRET_KEY` configuration.                                            |

Never prefix the connector secret with `VITE_`, put it in knowledge articles, or
expose it as a Fin conversation variable. The implementation rejects reuse of the
Messenger signing secret. It also respects the app's existing alternate-site
build selectors, so this AthRecs integration is unavailable on that separate build.

Explicitly enabled local development/tests may use disposable PGlite. When
`NODE_ENV=production` or `VERCEL_ENV` is nonempty, persistent storage is mandatory.
Use an isolated database and secret for hosted testing. Do not enable a preview
that shares production account data just to complete a test.

Migration `20261106_fin_onboarding.sql` adds three tables. It changes no existing
account, profile, result, claim or consent row. Normal application migrations
apply it before the code is enabled.

## Configure the two Intercom Data connectors

Both use:

```text
POST https://www.athrecs.com/api/fin/actions
Content-Type: application/json
Authorization: Bearer <deployment connector secret>
```

Set the bearer value using Intercom's secure authentication configuration. The
only athlete input to these actions is the bounded JSON below. Do not add account
IDs, email addresses, dates of birth, consent fields or arbitrary callback URLs.
Unknown fields are rejected.

### Connector 1: Find possible AthRecs profiles

```json
{
  "action": "find_public_profiles",
  "racingName": "Synthetic Example Runner"
}
```

Configure the description so Fin uses it when an athlete wants to find their
existing public profile or sporting history. Ask for the name they raced under
when it is missing. A racing name must contain 2–120 characters.

The response contains `status`, `scope`, `profiles`, `hasMore` and `message`.
`scope` is `public_directory_search`. Each card has these allowlisted fields:
`displayName`, `athleteNumber`, `profileUrl`, `city`, `country`, `club`, `sports`
and `publicResultCount`. Links point to native AthRecs profiles. Private evidence,
external source links, emails, birth dates and internal claim state are omitted.

For `possible_profiles`, explain that the athlete should inspect the candidates.
For `no_public_profiles`, explain that this search found no public profile; it
does not establish that no results exist. `hasMore=true` means only the first five
cards were returned. Do not claim an exhaustive search.

### Connector 2: Continue with an AthRecs account

```json
{
  "action": "create_signup_link",
  "requestId": "fin:synthetic-conversation:signup:1",
  "racingName": "Synthetic Example Runner",
  "eventName": "Synthetic Autumn 10K",
  "year": 2024
}
```

`eventName` and `year` are optional. Omit unknown values; do not invent them or
send blank strings/null. An event name must contain 2–200 characters. A supplied
year must be an integer between 1800 and the current year.

Map `requestId` from a stable conversation/attempt identifier in the Procedure
configuration, using Intercom's variable picker. It must be 16–128 characters,
using letters, digits, `.`, `_`, `:`, or `-`. Keep the same value and input on a
retry. Use a new attempt identifier when the athlete changes the details or needs
a fresh expired link. Do not ask the athlete to invent this value or treat it as
identity verification.

Successful output has:

```json
{
  "status": "ready",
  "signupUrl": "https://www.athrecs.com/join?continuation=<opaque-reference>",
  "expiresAt": "<ISO timestamp>"
}
```

Show `signupUrl` as the **Create my account and continue** link. The same page
also lets existing athletes sign in. Say the link lasts 24 hours. A successful
response means the link is ready; Fin must not say an account or profile has been
created. For hosted preview tests, deliberately substitute only the link's
origin with the isolated preview origin; retain its path and opaque token. The
production action always emits the canonical AthRecs domain.

### Errors and retries

| HTTP status     | Meaning                                                               | Procedure behavior                                                                             |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 400 / 413 / 415 | Invalid fields, oversized request or incorrect content type.          | Correct the mapping; never repeatedly retry an unchanged malformed request.                    |
| 401             | Incorrect connector authentication.                                   | Use the normal join link and alert the integration owner through the existing support process. |
| 409             | Same request ID used for different details.                           | Start a new attempt ID for the revised details.                                                |
| 410             | The saved link expired or its original signing configuration changed. | Start a new attempt ID.                                                                        |
| 429             | Global connector limit reached.                                       | Respect `Retry-After`; offer the ordinary join/directory link.                                 |
| 503             | Disabled configuration or temporary failure.                          | State the lookup/link could not be completed. Offer the normal next step.                      |

There is a shared database-backed limit of 120 valid connector actions per minute.
Public queries have an 8-second SQL statement timeout. Request bodies are capped
at 8 KiB, including chunked bodies. These limits do not prove a hosted 30-second
Intercom round trip; measure that during the restricted audience test.

## Suggested Procedure instructions

The following is staff configuration, not a public help article:

> Help athletes take a useful first step towards an AthRecs account. Answer their
> question clearly, explain the relevant benefit, and offer one appropriate next
> action. If they want to find their sporting history, ask for their racing name
> and use the public profile connector. Explain uncertainty and show real native
> AthRecs links. Invite them to create an account to continue reviewing results.
> If they want to continue, use the signup-link connector with the details they
> supplied. Event and year are optional. Existing athletes should be directed to
> sign in or their account, without another signup pitch. Never describe a public
> name match as ownership, invent a result, promise a scholarship or selection,
> claim an account was created by the connector, or say external research ran.
> If an action fails, explain that specific step could not be completed and offer
> the normal AthRecs join/account/directory route.

Use the athlete-facing help centre as the answer source. Keep staff setup,
secrets, operational metrics and internal troubleshooting out of public content.
The signup objective should guide useful next steps, without obstructing access
to public answers or implying a result requires registration to be viewed.

This code works with the Data connector capability; it does not require choosing
Fin for Sales. Role selection, content availability and any additional billing
remain workspace decisions. Keep the current role during first testing.

## The athlete's experience

1. Fin presents possible public profiles or an honest no-match response.
2. The athlete chooses the signup/continue link. No personal hints appear in its URL.
3. The existing signup/sign-in form preserves the opaque reference through its
   local callback, including email verification and retry paths.
4. A verified athlete clicks **Continue my search**. This explicit authenticated
   POST binds the handoff to the account. Link previews and anonymous GETs cannot
   claim it.
5. AthRecs displays the name and optional event/year from chat. The athlete can
   find public profiles or open the existing stored-result review. An incomplete
   private profile is directed to the existing setup form.

The new panel does not silently save an alias, apply an unsupported event filter,
change external-search consent, submit ownership claims or publish a profile.
Another signed-in account cannot recover a handoff once it is bound. Repeating
the action on the same account returns the existing state.

## Counting the outcome

`fin_assisted_signups` records a server-confirmed verified account created at or
after its handoff was issued, once the athlete explicitly resumes that handoff.
Its `user_id` primary key prevents double counting across retries and links.
Existing accounts and unverified accounts produce no new signup receipt.

This initial measure is **verified Fin-assisted registrations with a resumed
handoff**. It conservatively excludes an athlete who verifies their new account
but never clicks Continue my search. It is not every signup after a chat, proof of
causal uplift, a lead count, or an Intercom billed-outcome count. Use a later
controlled comparison to measure incremental signup lift.

For a private staff report, aggregate counts without exporting account details:

```sql
select (completed_at at time zone 'UTC')::date as day,
       count(*)::integer as verified_fin_assisted_signups
from fin_assisted_signups
where completed_at >= now() - interval '30 days'
group by 1
order by 1;
```

Profile setup, first accepted result and approved ownership are not reported by
this table. Its minimal account association is deleted when the account is
deleted. The short-lived handoff table must not be used as a durable funnel
denominator, because expired hints are removed.

## Expiry, privacy and operations

- Handoffs expire exactly 24 hours after creation; retries do not extend them.
- Tokens derive from a random 32-byte nonce and a keyed SHA-256 function. Only
  their hashes and non-secret nonces are stored, permitting an exact retry link
  without storing the usable token. Account identity never comes from the token.
- Hourly `/api/fin/cleanup` uses the existing cron authentication and removes
  expired hints and quota buckets. It remains available when the feature is
  disabled. A failed cron does not extend link validity; monitor cleanup failures.
- Conversion receipts survive hint cleanup. No transcript, email, DOB, source
  evidence or model output is copied into them.
- Connector responses and continuation RPCs use private/no-store and no-referrer
  headers. Continuation-bearing join pages use noindex and no-referrer metadata.
- Existing analytics sanitization removes query strings. Never add continuation
  tokens or request bodies to logs, analytics properties or support transcripts.

## Verification and release

Run the focused verification command:

```sh
npm run verify:fin
```

It covers the real migration and storage logic, connector authentication and
limits, actual public directory SQL/HTTP, and actual email-code signup plus
authenticated continuation RPC. Synthetic mail delivery is intercepted and
unexpected external fetches fail the tests. PGlite transaction tests do not
simulate independent concurrent PostgreSQL sessions.

The focused browser fixture separately checks the actual join/continuation
components with mocked account/RPC responses: preserved callbacks, no mutation
on mount, user changes while a response is pending, expired/error states and
desktop/mobile layout. This is not a live Intercom test.

Before enabling for athletes:

1. Complete the repository's required CI and preview checks for the release commit.
2. Confirm the additive migration and cron in the target environment, with the
   feature initially disabled.
3. Configure the two connectors with the dedicated secret and a restricted test
   audience. Use fictional accounts and an isolated database for write tests.
4. Exercise actual connector calls, link retry, verified signup, existing-user
   return, no matches, hidden profiles, expiry and the count query. Do not infer
   real API success from a simulation or default sample response.
5. Review the athlete-facing privacy/help copy for the enabled actions. The
   existing statement that chat cannot create accounts remains accurate: the
   athlete registers through the application.
6. Enable the intended audience and monitor successful registrations, failures
   and cleanup. No paid role change is required by this patch.

Rollback: disable `ATHRECS_FIN_ENABLED` and the two workspace connectors. Ordinary
signup and result review continue; leave the additive tables and cleanup in
place until expired hints are removed. The code can then be reverted without
removing existing athlete data.

## Next implementation: asynchronous result research

The existing optional Grok search is authenticated, adult/consent-gated, checks
the provider's zero-data-retention status and treats results as unverified
suggestions. Its probe can take 15 seconds and research another 45 seconds. It
must not be placed directly inside this synchronous connector.

The next slice should extract that existing service into a durable user-scoped
job, return a job ID promptly, and expose authenticated status/review actions.
Preserve the current saved-identity, consent-revision, source and ownership
checks. A separate purpose-scoped user action token is required; the integration
bearer and current Messenger identity JWT do not authorize private account writes.
OpenAI or Claude can be added behind the same research interface later if useful.

### Official integration references

Checked 6 November 2026:

- [Intercom: set up Data connectors](https://www.intercom.com/help/en/articles/9916497-how-to-set-up-data-connectors)
- [Intercom: API design, authentication, idempotency and connector timeouts](https://www.intercom.com/help/en/articles/10576235-designing-and-using-your-apis-with-data-connectors)
- [Intercom: use Data connectors in Procedures](https://www.intercom.com/help/en/articles/13459820-how-to-use-data-connectors-in-fin-procedures)
- [Vercel: managing authenticated cron jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
