# Claim a profile and confirm results together

Registration creates the account; the athlete must explicitly claim their athlete profile.
A prominent account banner leads to the profile matches. Match cards open an in-page review
so unsaved account edits survive. Direct invitations and claim links open the same review.

The review lists the selected identity's stored canonical results, available Run Norwich
claim references and other published source histories, including non-finishes. Athletes
can remove/restore each entry, select all, search the list, and add missing results before
pressing **Confirm all results are mine** or **Confirm my selected results**. Selection
covers the full fetched list, including entries outside the current 50-row view. Profiles
above the explicit 20,000-row limit are held for support rather than silently truncated.

The server rechecks account authorization, verified email, invitation binding and a
snapshot of the results inside the existing athlete-locked transaction. Changed snapshots
must be reloaded. The declaration, account-specific exclusions, additions and email queue
commit together. Replaying a request (including with a different request ID and identical
content) neither creates another claim nor sends another receipt. Existing pending claims
on the same identity are reused for the batch path.

The athlete gets one summary receipt per confirmation, not an email per result. The
existing ten-minute authenticated email worker retries a frozen payload with the same
provider idempotency key. After 23 hours of uncertain delivery, retries stop for staff
inspection; the existing claims email panel shows those receipts. A later staff ownership
decision can still send a separate status update. Login verification emails are unchanged.

Canonical records and source evidence are never deleted or overwritten by a selection.
Exclusions are scoped to the account and only affect public history when that account is
the active owner. Source-history choices identify the exact row; an edited or new row is
not silently treated as previously confirmed. Missing results go into the existing private
staff proposal queue with the athlete's supplied timing type and source link. They remain
unverified and do not acquire rankings, medals or PB eligibility from self-declaration.

This change retains the ownership policy currently on main: new claims await review.
The separate immediate self-confirmation PR is not incorporated or bypassed here. Existing
owners can review their results again without creating a new ownership claim. Original
publication and sharing choices remain in force.

Checks: `verify-result-conflict-flow.mjs` exercises actual service/database logic, including
batch additions/removals/restoration, idempotence, one receipt, stale snapshots and competing
accounts; CI also runs independent PostgreSQL connections. Browser journeys cover direct
claims, invitations with email-code signup, account-draft preservation and mobile layouts.
