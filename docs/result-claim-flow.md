# ATHRECS result-claim flow

## Athlete experience

1. The athlete signs in and opens a private result match.
2. The athlete confirms that the result is theirs.
3. Evidence links are optional when submitting a claim.
4. Every new ownership claim remains pending until staff check independent athlete identity evidence. A verified mailbox, matching name or self-supplied URL does not prove ownership.
5. Staff record the evidence checked in a review note before approval links the athlete record and its results to the private account. Competing claims cannot replace an existing owner.

## Optional evidence

The claim form has no verification-detail text box and no verification-method selector. It provides three optional HTTPS evidence-link fields. All three may be left empty.

Evidence links are private to the claimant and ATHRECS staff. Existing legacy written evidence remains available in the staff audit view but is not collected by the current athlete claim form.

## Ownership protection

An existing active owner is never overwritten. Submissions are serialised. Only staff approval can create a new athlete-account link; the review decision and link are committed atomically. A concurrent or competing claim is sent to conflict review instead of changing ownership.

Competing claims now also create a durable staff email alert. The review screen shows delivery status, supports specific claim links and can retry due emails. See [collected results and claims](collected-results-and-claims.md) for the collection, potential-match and retry boundaries.

## Rollout

This change adds a staff review step for every new ownership claim. Staff must monitor the pending queue and use the existing needs-info, approve, reject and revoke actions. Signup and private result suggestions remain available while a claim is pending.

Existing active links are retained. Previously auto-approved claims have not become independently verified as a result of this code change; staff should audit those separately. This patch does not migrate or revoke production ownership records.

`scripts/verify-signup-ownership.mjs` tests the real auth and claim HTTP endpoints with synthetic accounts and intercepted mail. `scripts/verify-result-conflict-flow.mjs` checks the real claim/review services, including repeated claims and revocation; its PostgreSQL CI mode also tests simultaneous claimants and staff decisions. `scripts/verify-recruitment-ui.mjs --signup-only --linkedin` checks the actual browser journey from a LinkedIn entry link to the pending claim.
