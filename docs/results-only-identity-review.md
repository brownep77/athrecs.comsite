# Results with unresolved athlete names

A damaged source name must not be guessed or merged solely by spelling similarity.
Staff can retain its already-published performances while withholding the standalone
profile. This does not verify a result, identity, nationality or account ownership.

The explicit hold is `athletes.profile_details.nameReview.mode = results_only`,
with `profile_visibility = private`. Apply only to the reviewed snapshot of
unclaimed root source profiles; record the original name, prior publication state,
candidate matches and reason in the private `network_audit_log`. Preserve source
histories, canonical results, identifiers and original spelling. Publication holds
and corrections must compare the current name with the expected old name so that
concurrent source corrections are not overwritten.

`/results/unlinked` lists the held records' public canonical results and published
source histories. Year-only records stay year-only. The public projection contains
no athlete slug, birth date, candidate profile IDs, internal notes or raw evidence.
Account-linked records, merged children, private results, unpublished histories,
excluded source performances and future dated results are excluded. The page is
noindex and retains provider credit. Race result tables keep canonical results
visible with an unlinked name-under-review label; their structured data does not
assert a Person or link to a withheld profile.

The normal bulk-publish action skips explicit name-review holds. To resolve a hold,
compare the original organiser/timing/federation row and corroborating identifiers.
Retain before/after evidence, correct or reconcile the identity, clear the hold and
explicitly restore the appropriate publication state. Do not equate clearing a
name hold with verifying an account or performance. Single names and genuine
diacritics alone are not grounds for a hold.

Validation: `node scripts/verify-public-results-section.mjs` exercises actual SQL
against isolated PostgreSQL, including private data, ownership, held results,
source histories, year-only dates and hold removal.
