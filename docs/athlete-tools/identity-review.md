# Name variants and profile review

The staff athlete result finder checks the directory alongside each submitted
result search. Its review panel flags exact names, common short-name variants,
initials, compatible middle names and racing names already recorded in
`profile_details.aliases`. It shows recorded and historical clubs and labels
an initial-only match as weak. A different current club does not hide a candidate.

The panel is read-only and uses the existing staff middleware. It does not merge
profiles, publish results, verify ownership or change memberships. Review the
race evidence and identity before applying a merge. Confirmed merges can retain
racing names in `aliases`, historical associations in `athlete_clubs` and
`profile_details.clubHistory`, and the original source entries with the
`nameReview.mode = merged_source_entry` marker. A family/parent link alone does
not mark a profile as merged.

“Search recorded names across clubs” searches the selected profile name and up
to eight recorded/input aliases with the club filter cleared. This is an explicit
search action; it does not claim that every returned result belongs to that person.
Year and source filters remain in effect. Unknown surname changes, unsupported
nicknames and missing club histories still require manual research.

Candidate retrieval uses the existing name index and the alias index in
`20261025_athlete_identity_alias_search.sql`. It checks at most 200 indexed
candidates per request, has a seven-second statement timeout and reports
truncation. A zero result or a capped scan is not evidence that a new profile is
needed. No private contact or birth-date fields are returned.

Validation: `npm run verify:athlete-identity-review` runs the real query against
synthetic PostgreSQL data. `npm run verify:athlete-source-finder-browser` checks
the staff-only API and rendered panel through the browser; the existing finder
regressions continue to cover the four result collections independently.
