# ATHRECS result-claim flow

## Athlete experience

1. The athlete signs in and opens a private result match.
2. The athlete confirms that the result is theirs.
3. No evidence is required to submit the claim.
4. The first uncontested claim is linked to the athlete's private Athlete Account immediately.
5. A claim is held for staff review only when another account already owns or has actively claimed the athlete profile.

## Optional evidence

The claim form has no verification-detail text box and no verification-method selector. It provides three optional HTTPS evidence-link fields. All three may be left empty.

Evidence links are private to the claimant and ATHRECS staff. Existing legacy written evidence remains available in the staff audit view but is not collected by the current athlete claim form.

## Ownership protection

An existing active owner is never overwritten. Ownership decisions are serialised and the claim record and athlete-account link are committed atomically. A concurrent or competing claim is sent to conflict review instead of changing ownership.
