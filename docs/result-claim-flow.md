# ATHRECS result-claim flow

## Athlete experience

1. Sign in, verify the email address and open a private result match.
2. Review every associated result in the account dialog or direct claim/invitation page. Remove and restore individual results, add missing results, then confirm the selected results together. Evidence links are optional.
3. Straightforward claims complete immediately: the existing athlete record and its stored results are linked once. Claiming each race separately is unnecessary. Staff receive a notification afterwards, without an approval step for the athlete.
4. The completion page and receipt say **Claim complete**. The audit records **Athlete self-confirmation**, with a completion timestamp. This does not mean staff, photo or ID verification.
5. Conflicts, previous staff decisions, revoked links, name or known date-of-birth discrepancies, protected public figures and child/guardian claims remain pending with a specific reason. Staff record the evidence resolving that issue before approval.

## Verification levels

Ownership completion and performance verification are separate. The stored `approved` status means the profile link is complete, not that the performance or identity has been independently verified. `confirmation_method` records `athlete`, `staff` or `unrecorded`; legacy records retain `unrecorded` rather than acquiring invented provenance. Staff review does not imply a photo or ID check.

Public ownership badges say **Claimed profile**. Claim history distinguishes **Athlete confirmed · self-confirmation** from **Staff reviewed**. Timing/source evidence, chip and gun fields, publication, PB eligibility and ranking rules are not upgraded by a claim. A chip verification label must be supported by an independently checked source row. Future photo or ID checks need their own evidence and status.

## Review and child safeguards

The server rechecks eligibility under the athlete lock. Existing suggestions, invitation tokens, self-supplied source IDs and client-supplied approval fields cannot bypass a review flag. A child/guardian declaration, a known under-18 birth date or a recent junior category triggers review. Categories are a conservative review signal and never manufacture a birth date. Missing birth dates do not prove adulthood; the guardian option and staff dispute/revocation route remain available.

For a child, privately establish the responsible adult's authority and consent before granting control. Do not request public links to a child's ID or other personal documents. Staff should record what was checked without copying unnecessary sensitive data into notes. A parent's name or family association alone is not authority over an email account.

The batch form retains optional HTTPS identity evidence, private to the claimant and staff, including earlier evidence links. Existing evidence is retained when an earlier claim is confirmed again. The guardian declaration remains binding across repeated submissions; omitting it later cannot erase the review requirement. Recent junior categories in imported source histories also trigger review, even if the athlete excludes that result.

## Ownership and duplicate protection

Every ownership change locks the athlete before the claim. Completion and the account link commit together. Existing owners are never overwritten by a submission; concurrent contenders enter conflict review. The original athlete and result records are reused, not copied or merged based on a matching name.

Completing one profile claim also completes that account's eligible pending claims on the same athlete. Staff approval completes same-account pending/needs-info siblings with a linked review note; only other claimants are treated as competitors. Revocation closes all approved sibling claims for the removed owner and remains binding across resubmission, withdrawal and different results. Review markers survive deletion of a staff account.

Batch completion freezes the final ownership status and selection counts into one durable receipt in the same transaction. Straightforward completions send that completion receipt without a second per-result receipt or staff-review email. They also queue one `claim_completed` staff notification in the ownership transaction. Delivery starts after commit and retries through the existing ten-minute worker. Delivery failure never makes a completed claim pending. Replays and sibling result claims reuse the same notification; already-owned profiles do not create fresh alerts. There is no historical completion backfill.

The staff email identifies the athlete and anchor result and links to the exact private claim record, where the claimant and current ownership status can be inspected. It says the claim completed without waiting for approval, rather than asking staff to approve it. New completion notifications use the enabled **results** category in `staff_notification_routes`. Conflict and ordinary pending-claim recipients use an explicit, validated `ATHRECS_CLAIMS_EMAILS` override when provided, otherwise the same results category. `ATHRECS_STAFF_EMAILS` controls staff access and is no longer a notification fallback. Department mailboxes must be confirmed before enabling them; the initial route configuration retains Paul's established mailboxes. Fictional-account notifications are restricted to Paul, regardless of an override.

Existing frozen deliveries keep their original recipients, payloads and provider keys, including older messages addressed to info@athrecs.com. Reservation/backoff and the 23-hour ambiguous-delivery hold apply to both completion and conflict alerts. Staff can inspect sent/waiting statuses and retry due messages in Result claims. The ordinary pending-claim staff email remains a best-effort legacy notification; it has the same category routing but does not gain an outbox in this change. These claim messages retain the existing authentication-email transport. The new signup/submission alert transport is separate. Neither route grants access, publishes submitted results, or changes ownership policy. See [collected results and claims](collected-results-and-claims.md).

## One queue for archive and profile claims

`/admin/result-claims` includes outstanding archive requests and completed profile/result claims. A completed archive selection creates or reuses the normal claim record, so it is visible in the same Complete list and uses the same notification/retry system. The original archive request, raw payload, decision and source references remain private and auditable.

Athletes can select archive rows, explicitly declare ownership and press **Claim selected results**. For an account with exactly one active owned profile, suitable matching rows go directly into that profile as private, unverified results. A matching existing performance is reused without changing its data or verification. Aliases are supported; unrelated names, discrepancies, changed revisions, held/flagged rows, source-ID or bib conflicts, unknown finishes, future events and team legs stay for staff attention. No archive claim creates an athlete or grants ownership of a new profile. Accounts with no linked profile or several linked profiles keep a request for staff to resolve. Staff can process earlier declarations from the same unified page.

The lock order matches archive reviews. Performance precision remains in `result_details.timing`; canonical integer time uses rounding. New data never acquire source-checked status through a claim. Existing published/private visibility is preserved and new results default private. Repeated requests cannot duplicate races, claims or completion alerts. `verify-archive-claims.mjs` runs the actual archive/member/claim/outbox services with a migrated disposable database and intercepted notifications to a results-category recipient enabled only in that test database.

## Rollout and checks

The additive migration records confirmation method, timestamp and claimant role. It does not auto-approve old pending claims or relabel historical evidence. An untouched pending claim can be completed through the same confirmation form; all eligible claims for that account/profile finish together. Previously reviewed or flagged claims remain with staff. Existing active links remain intact.

`verify-result-conflict-flow.mjs` exercises real claim/review services against disposable PGlite, and independent PostgreSQL connections in CI: immediate completion, siblings, idempotence, child/guardian checks, discrepancies, revocation, contention, source preservation and the conflict outbox. `verify-signup-ownership.mjs` and `verify-unified-profile-flow.mjs` exercise real auth/RPC ownership and downstream profile integration. `verify-recruitment-ui.mjs` checks the confirmation and completion journey on mobile and desktop. All fixtures and intercepted emails are synthetic.

## Integration with profile-wide review (PR #635)

The ownership policy and result review use the same authenticated transaction. Eligible direct, invited and account-dialog claims complete immediately. Existing pending submissions are not processed in the background; the athlete must explicitly confirm again. A policy-versioned review fingerprint allows a new confirmation of a pre-policy review while retaining the old audit and receipt unchanged.

Keep the consolidated receipt status aligned with the committed ownership decision. Retry workers send the frozen receipt rather than recomputing its meaning from later claim changes. A fresh review for an existing owner attaches to the ownership claim without creating another claim or changing ownership.

The migration is additive and makes no claim-status or ownership changes. Verification uses synthetic accounts and intercepted mail. Production verification must inspect the actual deployed commit and public entry points; a merged PR alone is not evidence of rollout.
