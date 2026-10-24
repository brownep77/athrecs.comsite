# Staff login and diagnostics log

Open `/admin/athlete-accounts?view=login-log` on `update.athrecs.com`, or use
**Login & diagnostics** in the backend task list. Existing staff host, verified
Google account and staff allowlist checks apply to every data read. Responses
are private/no-store and excluded from indexing.

## Recorded events

- Successful sign-ins use the existing session-insertion log, one record per new
  session. The existing lifetime counters and per-account history are unchanged.
- Auth HTTP responses capture rejected passwords/codes, expired codes, provider
  callback errors, rate-limit responses, server failures, verification/recovery
  requests, and sign-out requests. Successful refreshes do not count as sign-ins.
- A failure's entered email is explicitly unverified, never proof the account
  owner made the attempt. Signed-out identities are resolved before logout.
- Browser error boundaries, uncaught errors/rejections, exhausted query/mutation
  errors and authentication network failures report only safe error categories.
  Page routes are generalised; no athlete names or URL query/hash are retained.
- Server HTTP 5xx responses and thrown request errors are recorded separately
  (auth and the diagnostic endpoint have their own handling). These may be
  anonymous. Browser and server observations can describe the same incident;
  error counts are observations, not a count of distinct affected users.

New browser reports distinguish failed queries (`data_query_error`) from failed
mutations (`data_mutation_error`). Existing `data_error` records remain unchanged.
Account, own-profile, claim/review and private race-calendar pages retain their
static route name; personal path segments and all query/hash values remain hidden.
Ordinary `Error` objects and allowlisted names on serialised/cross-realm errors
retain their category. `UnknownError` means no recognised category was supplied,
not a diagnosis of a particular browser problem. Arbitrary messages and stacks
remain excluded. These improvements cannot reconstruct missing details in older
reports or establish whether a failed mutation changed server-side data.

Browser report content is unverified, but any associated account is resolved
from the session on the server when the report arrives. An associated account
therefore means the server accepted that session at reporting time; it does not
prove the preceding data operation succeeded or that the visitor saw an error.

## Request and session recovery

Malformed plain GET requests to server functions can return a null/primitive
value without an HTTP Response. The response middleware now returns an uncached,
non-indexable 400 for that case instead of crashing while reading `response.status`.
Normal RPC null results still use the framework serializer, and missing responses
from other handlers remain failures. This does not change profile access checks.

On the Athlete Account and My Athlete Profile pages, a failed initial session
check now shows a retry card. It no longer presents the signed-out screen solely
because the session service/network failed. Retry checks the existing session;
an ordinary null session or explicit 401 still leads to the sign-in gate. These
changes address reproduced failure modes, not a proven cause of any historical
generic browser report.

The log displays UK timestamps, account/entered email, outcome, method, browser
and version, OS, broad device type, recognised browser number where available,
approximate platform location, endpoint/page family, HTTP status, authentication
response duration (excluding diagnostic storage), deployment commit and support
reference. Screen-size category and browser-reported online status accompany
browser reports. Filter by time window, outcome, browser, device and search term.
Search includes names, email addresses, error codes, website, route and references.
Common-problem summaries use the same filters. Pagination is 25 records.

**Unexpired sessions** lists retained sessions which still exist and have not
expired. It does not establish current presence, last interaction or actual use.
No session token or session identifier is returned to the browser. Multiple
sessions can belong to one account. Browser recognition is not hardware identity.

## Privacy, retention and limitations

The additive migration creates a capture-start timestamp. Historical failed
attempts and errors cannot be backfilled. Recovered successful sessions retain
only the metadata that was originally captured. No guessed identity, device,
location or sign-in method is added.

Diagnostic storage excludes passwords, OTPs, tokens, request/response bodies,
query strings, raw IPs, arbitrary error message text and stack traces. Only
allowlisted error codes are stored; unrecognised auth codes become a generic
status category. Browser reports are client-supplied observations, labelled as
such. Authentication and staff access are always evaluated on the server.

Browser reporting requires same-origin JSON, rejects unexpected fields, limits
input to 2 KB and output to five reports per page load, and has database-backed
per-network (10/minute) and global (300/minute) limits. The network key is HMACed
with the auth secret and rotates daily; the raw address is not stored. Unknown
networks share the conservative fallback bucket. Limits apply across instances.

Events expire after 90 days and are pruned on the next capture or staff log read;
rate-limit buckets older than a day are pruned then too. Deleting an account
removes associated diagnostics and attempts entered with its current email.
Successful-session counters retain their existing policy. Diagnostics are not
used for marketing. The privacy page describes these records.

Logging errors do not replace auth responses; storage outages can produce gaps.
Reports can be absent when the application cannot start, the network is offline,
or reporting is blocked/limited. Build failures, CDN rejections and failures
before this application's request handler remain in hosting logs. Server
functions that encode a handled error in HTTP 200 may appear only through the
browser's data-error report. The new database fields do not reconstruct earlier
unrecorded information.

## Validation

`node scripts/verify-client-data.mjs --browser` exercises real local signup,
sign-in and rejection requests, cookies and device recognition, safe error
capture, OAuth/OTP/server failures, storage-outage isolation, staff-only API
access, origin/host restrictions, filtering, pagination, retention, rate limits,
session expiry, and desktop/mobile navigation. All accounts are synthetic and
mail/network services are disabled. The existing quality gate runs this suite.

`node scripts/verify-ios-signin.mjs` tests the Google redirect/callback and
post-login journey in Playwright WebKit with an iPhone viewport. Install the
Playwright WebKit browser and its host dependencies first; OpenSSL is required
to create the disposable local HTTPS certificate. The test exercises actual
OAuth state handling and secure host-only session cookies, first-name-only
profile setup, reload, private profile and private calendar navigation. It uses
an in-memory database, synthetic accounts and a simulated Google response;
external browser/server requests are blocked and no real email is sent.
An optional `--chromium` argument runs the same scenario in Chromium.
This is a local WebKit regression test, not a physical iPhone or live Google
sign-in test, and cannot reproduce production network or database conditions.
The test retains request-failure evidence and allows only an observed cancellation
of the background `/api/auth/get-session` request during the OAuth redirect. The
current auth client can log that normal navigation cancellation as a
`network_error / TypeError` even though sign-in succeeds. Other network failures,
data-error reports and failed auth/data responses fail the test. This known
logging noise does not establish the cause of an unrelated `data_error` report.

Add `--faults` to inject a profile-data HTTP 503 and session-check HTTP 503s.
The test verifies that the data failure is associated with the still-authenticated
synthetic account, that the profile recovers, and that both account/profile
session checks can recover through the retry button without signing in again.
It then removes the synthetic browser cookies and verifies that the private
profile is still protected. No failure is injected into the live website.
