# Evidence required for athlete results

The legacy catalogue accepted source-labelled values as finished results without
requiring an independently matching source row. Its structural tests checked
references and counts; they could not establish that a person ran a race. The
review also identified category positions stored in the gender-position field.

The root AGENTS.md records the required review rules. This document describes
the repeatable comparison added for Total Race Timing. It is a pre-import review
tool; it does not change the production database or claim that every existing
result is verified.

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
