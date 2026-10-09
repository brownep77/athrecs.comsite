# Simple athlete signup

AthRecs starts with two steps: an email address, then the six-digit email code.
The same form signs in an existing user or creates a new verified account. It
does not request a password, date of birth, address, marketing consent or result
selection. Configured social and password methods remain under **Other ways to
sign in**; the existing fallback remains visible when email codes are unavailable.

An account with no saved private profile, claims or linked athlete profile opens
a compact **Your account is ready** screen after email confirmation. The only next
action is optional: supply the racing name and find possible results, or **Skip
for now**. A provider-supplied name is prefilled but must still be submitted before
result matching. The full navigation and completion meter are deferred until the
athlete chooses the account workspace. Existing accounts keep their normal view.

Explicit section, profile-sharing, result-claim and partner destinations are
preserved. Saving a racing name opens the potential-results section and retains
unrelated unsaved edits. No claim is submitted, ownership granted, result verified,
marketing preference saved or profile published by signup or name capture.

The browser regressions cover the new form, wrong/correct codes, alternate
methods, password recovery, narrow screens, optional name capture, skip,
source-backed matching, consent draft isolation and the unchanged RunRecs flow.
The email-login suite exercises real auth endpoints with intercepted email and
disposable storage. Do not use live athlete accounts for these checks.

This change does not activate welcome/reminder campaigns or implement the
separate proposed missing-result upload form.
