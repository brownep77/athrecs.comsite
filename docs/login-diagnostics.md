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
