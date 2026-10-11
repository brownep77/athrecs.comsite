# ATHRECS result-claim flow

## Athlete experience

1. Sign in, verify the email address and open a private result match.
2. Review every associated result in the account dialog or direct claim/invitation page. Remove and restore individual results, add missing results, then confirm the selected results together. Evidence links are optional.
3. Straightforward claims complete immediately: the existing athlete record and its stored results are linked once. Claiming each race separately is unnecessary.
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

Batch completion freezes the final ownership status and selection counts into one durable receipt in the same transaction. Straightforward completions send that completion receipt without a second per-result receipt or staff-review email. Replays reuse the same audit and provider idempotency key. Missing result proposals remain unverified in the staff queue. Held claims retain staff review notifications and the durable competing-claim alert outbox. See [collected results and claims](collected-results-and-claims.md).

## Rollout and checks

The additive migration records confirmation method, timestamp and claimant role. It does not auto-approve old pending claims or relabel historical evidence. An untouched pending claim can be completed through the same confirmation form; all eligible claims for that account/profile finish together. Previously reviewed or flagged claims remain with staff. Existing active links remain intact.

`verify-result-conflict-flow.mjs` exercises real claim/review services against disposable PGlite, and independent PostgreSQL connections in CI: immediate completion, siblings, idempotence, child/guardian checks, discrepancies, revocation, contention, source preservation and the conflict outbox. `verify-signup-ownership.mjs` and `verify-unified-profile-flow.mjs` exercise real auth/RPC ownership and downstream profile integration. `verify-recruitment-ui.mjs` checks the confirmation and completion journey on mobile and desktop. All fixtures and intercepted emails are synthetic.

## Integration with profile-wide review (PR #635)

The ownership policy and result review use the same authenticated transaction. Eligible direct, invited and account-dialog claims complete immediately. Existing pending submissions are not processed in the background; the athlete must explicitly confirm again. A policy-versioned review fingerprint allows a new confirmation of a pre-policy review while retaining the old audit and receipt unchanged.

Keep the consolidated receipt status aligned with the committed ownership decision. Retry workers send the frozen receipt rather than recomputing its meaning from later claim changes. A fresh review for an existing owner attaches to the ownership claim without creating another claim or changing ownership.

The migration is additive and makes no claim-status or ownership changes. Verification uses synthetic accounts and intercepted mail. Production verification must inspect the actual deployed commit and public entry points; a merged PR alone is not evidence of rollout.
