# Evidence required for athlete results

The legacy catalogue accepted source-labelled values as finished results without
requiring an independently matching source row. Its structural tests checked
references and counts; they could not establish that a person ran a race. The
review also identified category positions stored in the gender-position field.

The root AGENTS.md records the required review rules. This document describes
the repeatable comparison added for Total Race Timing. It is a pre-import review
tool; it does not change the production database or claim that every existing
result is verified.

## Nationality on all future imports

Paul requested on 10 October 2026 that explicitly supplied nationality be retained
for every future import and checked on the profiles already imported. Preserve
the original nationality column and row locator in the source capture. Map only
an explicitly labelled nationality field, never race country, residence or club.
Unknown or conflicting values remain empty or held; never guess from names.

For an unclaimed source profile, store `profile_details.sourceNationalityObservation`
with `value`, `provider`, `sourceUrl`, `observedAt` and the capture/row reference.
The profile reader displays the value with provider attribution on an approved
public profile. Existing DUV `duvSourceObservation.nationality` and matching
`sourceIdentities` are supported directly, so old and future DUV profiles require
no destructive backfill. Keep their original code, such as `BRA`, in storage.
Athlete-supplied profile nationality takes precedence. Account-linked profiles
retain their own privacy/sharing controls. Nationality does not establish identity,
residence, birthplace or result verification. Do not replace a conflicting value
silently; retain the observations for review.

On 10 October 2026, Paul requested that public athlete profiles omit World
Marathon Majors branding and attribution links. Nationality values and results
remain visible; original provider names, URLs, row identifiers and notes remain
in the source records and staff evidence views. Public note wording preserves
missing-date, timing-basis and identity limitations. This is a display choice,
not a verification decision. Verification requires the accepted source, an actual
row comparison and recorded identity-match evidence, as described below. Profile
ownership is a separate check.

## Official London Marathon results

On 15 October 2026, Paul confirmed that London's official results website,
`https://results.tcslondonmarathon.com/`, is an accepted primary verification
source for this and future imports. Its mass listing's "unofficial results"
wording is a qualification attached to those published results, not a reason to
categorise the website as an unofficial source.

Use `source_verified` for a matched performance after comparing the actual
source row against the race, edition/date, distance, finish status, bib or row ID,
name and all imported timing/placing fields. Preserve the original headings,
values, qualification, source URL, capture timestamp and identity-match evidence.
Do not accept a URL alone. A retained original browser capture is valid comparison
evidence; record its capture date and the later review date separately, and do
not describe that review as a fresh live-site check. Later source corrections
or disqualifications still require review.

A new unclaimed profile can represent the runner identified by that source row.
For an existing profile, record corroborating identity evidence and hold ambiguous
or conflicting matches. Source verification is separate from account ownership:
it does not claim a profile, verify an account or establish a person's identity.
Keep athlete-supplied nationality and visibility controls intact. Preserve unknown
chip/gun classifications and comparison rankings without inventing race placings.
Verified-result eligibility follows the application's existing rules; no medal or
ranking is established by source authority alone.

## Run a source comparison

Capture the organiser's rendered result table independently from the proposed
import. Include the page URL, race headings, displayed start dates, complete
source row count, table headers and relevant rows. Check that pagination and
distance tabs are complete. Do not build this capture from the proposed values.

The result input is a JSON array using the database export fields: `id`,
`source_id`, `athlete_id`, `athlete_number`, `display_name`, `event_name`,
`event_date`, `distance_code`, `status`, `result_visibility`, `source_url`,
`edition_source_url`, `finish_time_seconds`, `chip_time_seconds`,
`gun_time_seconds`, `overall_place`, `gender_place` and `category_place`.
The source input is a JSON array of `{url, headings, startTimes, rowCount,
tables:[{headers, rows}]}`. Start times use the provider's displayed DD/MM/YYYY
format. Preserve each table's original headings and decimal times.

```sh
node scripts/audit-result-evidence.mjs proposed-results.json independent-sources.json review.json --strict
```

Strict mode exits unsuccessfully for uncovered results, generic result URLs,
structural inconsistencies, ambiguous name matches, missing names, wrong dates,
empty result pages and differences in available timing/placing fields. The
output retains stable row IDs, original values, matched source values and flags.
The command makes no database or network writes. For a catalogue-wide diagnostic
report, omit `--strict`; a zero diagnostic exit code is not evidence of clean data.

The parser reads named columns, so an optional Wava column cannot shift timing
fields. Comparisons allow at most one second of difference for existing integer
storage; the report preserves the decimal source value. Generic `Time` fields
are not silently relabelled as chip or gun times.

## Manual checks still required

The tool detects inconsistencies. It does not independently authenticate a saved
capture, prove a runner's identity, determine whether an event title is an alias,
or establish the correct distance among multiple races on a source page. It also
does not override a later disqualification decision. Those checks must be
recorded before an import can be described as verified. A clean comparison is
only one part of that evidence.

## Regression coverage

```sh
node scripts/verify-result-evidence-audit.mjs
```

The synthetic examples cover optional columns, distinct gender/category ranks,
wrong times, wrong dates, missing athletes, ambiguous matches and unexpected
headers. No private athlete export or real review manifest belongs in this
code-only change.

## Profile achievements and verification

Owner instruction, 21 October 2026: published, completed results contribute to
profile achievements immediately, including pending results. Countries raced,
PBs, milestones, progress and competition honours are calculated from the visible
record. A separate tick means the required supporting evidence is verified.
A threshold can use any qualifying confirmed results; each country, sport, major
or year needs one confirmed qualifying performance. A faster pending PB replaces
a slower confirmed PB, with its tick appearing only after that performance is
confirmed. Verification never changes the achieved count by itself.

This display policy does not upgrade stored result verification, change ranking
eligibility, publish hidden records or verify account ownership. Invalid,
conflicting, future, excluded and disqualified results stay ineligible. Final
rounds, overall/gender/category positions, course conditions and timing categories
retain their existing meaning. Original evidence remains in staff-only storage.

## Staff checkboxes for every profile

The staff athlete directory includes claimed, unclaimed, public and private
profiles. Each backend profile has a profile-details review checkbox and separate
result checkboxes, including imported history from every provider. Profile review
never verifies results or grants ownership. Changed profile details invalidate a
previous profile-details tick. Checking a result requires a source link, row
locator, identity match and staff confirmation; unchecking it reopens verification.
Reviewers, timestamps, original values and private notes are kept in the audit.
Pending athlete requests reflect the same staff decision. Visibility never changes.

Public and signed-in athlete profile projections remove provider names, URLs and
staff review notes. Derived sport classifications, deduplication keys and existing
verification status remain usable without exposing the original source. Staff
readers keep the original evidence. No existing profile or result is automatically
verified by installing these controls.
