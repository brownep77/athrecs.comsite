# Missing-athlete screening

`scripts/find-archive-athlete-candidates.py` compares reviewed TRT source captures
with a read-only athlete-directory snapshot. It emits reviewable name groups,
not approved identities, profile-creation requests or database writes.

Inputs are private JSON snapshots of athlete names and selected aliases, club
names and relationships, account names and previous names, resolved athlete
numbers, archive capture receipts, and snapshot metadata. An optional
`archive-scope.json` supplies held-page counts. Do not include emails, addresses,
birth dates, contact numbers or authentication credentials. Keep snapshots and
outputs outside the repository.

The local original HTML hashes and row counts must match the production capture
receipts. Select only one capture version per page; ambiguous versions fail.
Held source pages are excluded from candidate screening.

The comparison normalizes accents, punctuation and titles, then checks recorded
names/aliases, token order, first/last names, initials, common nicknames and
selected spelling variations. Shared club evidence can support a weak name
suggestion. Name evidence never establishes ownership or identity. Source name
variations, repeated entries in one table, differing recorded genders, junior
categories and multiple clubs remain explicit review flags.

Priority candidates have no apparent directory match, at least two finished
observations on different dates, one recorded club and no detected identity
conflict or source-name variation. Clubs are historical entry evidence. A
candidate is not necessarily one unique athlete; names can be shared or change.
Absence of a detected match is not proof that the person is absent from AthRecs.

The snapshot is time-bound. Recheck the live directory and all relevant evidence
before creating a profile or attaching source results. Screening does not publish
profiles, invite athletes, approve claims or verify a combined race history.

Run `python3 scripts/verify-archive-athlete-candidates.py` for synthetic regression
coverage of aliases, nicknames, missing-name candidates, source integrity,
duplicate entries and junior categories.
