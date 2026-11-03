# ATHRECS result-claim flow

## Athlete experience

1. Sign in and verify access to the email address. Email verification does not verify athlete identity.
2. Review the associated results, remove anything that is not yours and submit missing results with one explicit declaration. Evidence links are optional; do not place personal identity documents in public links.
3. Every new ownership claim stays **Pending ownership review**. An exact name, source profile URL, account invitation or unopposed declaration cannot create an account-to-athlete management link.
4. A separate authorised staff member independently checks the claimant's authority, records the evidence and approves the claim. The existing athlete and results are linked without copying or upgrading source verification.
5. A reviewed owner can confirm additional results without another ownership review. Disputes, child/guardian authority, protected profiles and historical adverse decisions retain their additional checks.

## Ownership and verification levels

Ownership review and performance verification are separate. The historical `approved` claim status records a completed association; it alone does not grant public management. `confirmation_method` retains `athlete`, `staff` or `unrecorded` as originally recorded. No migration upgrades legacy evidence.

The `athlete_management_reviewed` predicate requires an active link and its matching approved source claim, review timestamp, evidence note and an independently recorded reviewer. A `staff` label alone, a self-review or a note without a reviewer is insufficient. Historically unrecorded links retain management only when their stored source claim already establishes that independent review.

New approval rejects a reviewer whose user ID or email matches the claimant. Staff record a meaningful evidence note; the decision and previous claim are retained in `network_audit_log`. Existing unreviewed approved claims appear in the pending staff queue and may be explicitly upgraded after review. An older private link without any source claim can submit a new pending review request while retaining its existing link and history. Rejecting an existing link uses the audited revocation route.

Historical self-confirmed links remain available for private account access and saved race history. Until reviewed they cannot change canonical athlete biographies/details, exclude canonical results, add archive records directly, represent an athlete in partnerships or publish account overlays at an athlete URL. Athlete correspondence and incoming replies also require reviewed ownership before being associated with an account. Published shared-account reads reject an active unreviewed link; stored sharing preferences and old privacy withdrawals are retained. A user can always switch sharing off. Private account editing, private result proposals and evidence submission remain available.

Public ownership badges require reviewed management. Account and claim screens explain when an existing association still needs ownership review. A staff ownership decision does not imply a photo/ID check or verify a race performance, timing, PB or ranking.

## Review and child safeguards

The server rechecks ownership-review issues under the athlete lock. Existing suggestions, invitation tokens, self-supplied source IDs and client-supplied approval fields cannot bypass a review flag. A child/guardian declaration, a known under-18 birth date or a recent junior category triggers review. Categories are a conservative review signal and never manufacture a birth date. Missing birth dates do not prove adulthood; the guardian option and staff dispute/revocation route remain available.

For a child, privately establish the responsible adult's authority and consent before granting control. Do not request public links to a child's ID or other personal documents. Staff should record what was checked without copying unnecessary sensitive data into notes. A parent's name or family association alone is not authority over an email account.

The batch form retains optional HTTPS identity evidence, private to the claimant and staff, including earlier evidence links. Existing evidence is retained when an earlier claim is confirmed again. The guardian declaration remains binding across repeated submissions; omitting it later cannot erase the review requirement. Recent junior categories in imported source histories also trigger review, even if the athlete excludes that result.

## Ownership and duplicate protection

Every ownership change locks the athlete before the claim. Staff approval and the account link commit together. Existing owners are never overwritten by a submission; concurrent contenders enter conflict review. The original athlete and result records are reused, not copied or merged based on a matching name.

Staff approval of one profile claim also completes that account's pending claims on the same athlete. Staff approval completes same-account pending/needs-info siblings with a linked review note; only other claimants are treated as competitors. Revocation closes all approved sibling claims for the removed owner and remains binding across resubmission, withdrawal and different results. Review markers survive deletion of a staff account.

Batch confirmation freezes the actual pending or already-reviewed status and result-selection counts into one durable receipt. A pending first claim sends a staff review notice and never creates a completed-ownership notification. Retrying a frozen receipt cannot change its recorded meaning or create duplicate ownership.

Historical completion and conflict notifications retain their existing outbox, recipient, payload and retry controls. Existing sent or queued notifications are not rewritten. Archive additions to an already independently reviewed profile may still use that completion outbox. Conflict recipients use a validated `ATHRECS_CLAIMS_EMAILS` override or the enabled results route; staff authentication addresses do not determine notification destinations.

## One queue for archive and profile claims

`/admin/result-claims` includes outstanding archive requests and completed profile/result claims. A completed archive selection creates or reuses the normal claim record, so it is visible in the same Complete list and uses the same notification/retry system. The original archive request, raw payload, decision and source references remain private and auditable.

Athletes can select archive rows, explicitly declare ownership and press **Claim selected results**. For an account with exactly one active independently reviewed profile, suitable matching rows go directly into that profile as private, unverified results. A matching existing performance is reused without changing its data or verification. Aliases are supported; unrelated names, discrepancies, changed revisions, held/flagged rows, source-ID or bib conflicts, unknown finishes, future events and team legs stay for staff attention. No archive claim creates an athlete or grants ownership of a new profile. Accounts with no linked profile or several linked profiles keep a request for staff to resolve. Staff can process earlier declarations from the same unified page.

The lock order matches archive reviews. Performance precision remains in `result_details.timing`; canonical integer time uses rounding. New data never acquire source-checked status through a claim. Existing published/private visibility is preserved and new results default private. Repeated requests cannot duplicate races, claims or completion alerts. `verify-archive-claims.mjs` runs the actual archive/member/claim/outbox services with a migrated disposable database and intercepted notifications to a results-category recipient enabled only in that test database.

## Rollout and checks

`20261103_reviewed_athlete_management.sql` creates a function and view only. It does not update claims, links, source histories, results, private accounts or sharing choices. The published site must apply this migration before using the new authorization predicate.

- `verify-athlete-management.mjs`: migrated disposable database and real management/share services; fake staff labels, self-review, missing evidence, valid legacy review, preserved records/private access, denied canonical writes, correspondence binding, public overlays, and privacy withdrawal.
- `verify-result-conflict-flow.mjs`: real claim/review services, independent staff approval, ordinary/protected/child claims, competing claims, replay, legacy upgrade/revocation, frozen receipts and historical outbox retries. Its CI PostgreSQL mode uses independent connections for contention checks.
- `verify-signup-ownership.mjs`: real authentication and claim RPC transport; a verified mailbox plus matching name remains pending, and forged staff approval is denied.
- `verify-unified-profile-flow.mjs`, `verify-profile-claim-journey.mjs`, and `verify-recruitment-ui.mjs`: pending first claim followed by an independent synthetic staff review and the existing profile journey.
- Archive and partnership suites use independently reviewed synthetic ownership and test denial of an unreviewed association.

All fixtures and intercepted emails are synthetic. Production verification must inspect the actual deployed commit and public entry points; a merged PR alone does not establish rollout.
