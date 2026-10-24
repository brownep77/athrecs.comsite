# London 2025 secondary result sources

Checked 24 October 2026. This records source capability and coverage evidence;
participant exports and private review files are not included in the repository.
Registration does not enable collection, verify an individual performance or
approve profile publication.

## MarathonGuide: update the existing source

The existing `marathonguide` entry already covers the provider's fixture
directory. The event inventory and existing historical research also reference
the same domain. Retain that source identity rather than creating another entry.

The opened [London Marathon 2025 result list](https://marathonguide.com/races/run/london-marathon-21/2025/results/)
advertises 56,186 results: 31,542 men and 24,644 women. Its observed table headings
are Place, Full Name, Distance, Final Time, Gender, BQ and Actions. The ordinary
interface offers 100 rows per page. The retained browser capture covers all 562
observed pages, with 56,186 distinct source result IDs and contiguous source
places. Page headings, row counts and per-page timestamps were independently
reconciled; the final page contains 86 rows and ends at source Place 56,186.
This establishes a secondary results-archive capability in addition to the
previously recorded fixture-directory capability.

Keep the source disabled with its existing rights-review requirement. The table
does not specify whether Final Time is chip or gun time. Source Place is the
archive's displayed placing, not independently verified official, gender or
category placing. Empty BQ text does not establish the absence of an icon. No
open reuse licence was established by this review.

## Pace Notes: one new research source

[Andrew Kam / Pace Notes on Figshare](https://figshare.com/articles/dataset/Pace_Notes_marathon_race_results_corpus_5_km_splits_/33965155)
publishes a named-runner marathon corpus with cumulative 5 km splits under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Version 3 was published on 21 October 2026. The
[public release documentation](https://github.com/koolkam00/pace-notes/releases/tag/private-export-20261021-1050)
describes the downloadable corpus, raw record schema, edition checksums and
quality/completeness overlays. See also the
[publisher's methodology](https://splithappens.run/methodology).

The reviewed London 2025 extract contains 55,047 rows, comprising 55,004 MAS and
43 ELIT records. It retains names, finish times, available 5 km checkpoints,
original timing-result IDs and URLs, source ingestion dates, sex and age
categories where supplied. Original ingestion dates are 1–5 September 2026;
24 October is the review/extraction date, not a fresh official timing-page check.

The readable [16 October SQLite snapshot](https://github.com/koolkam00/pace-notes/releases/tag/htw-db-2026-10-16-1652)
contains the same London 2025 raw rows as the 21 October release, confirmed by
the published edition checksum. That confirms snapshot integrity, not athlete
identity or live timing-provider accuracy.

The publisher marks London 2025 incomplete/held pending re-collection and count
review. Chip timing in the metadata is explicitly an inference from split
patterns, so it remains unconfirmed. Country suffixes are source-reported values;
exact ages and dates of birth are absent. Publisher notes beginning `DQ step1`
describe data-quality screening and do not establish race disqualification.

Register this as one disabled secondary research source. Reviewed coverage is
London 2025; the publisher's broader corpus does not imply that other editions
have been checked here. Preserve Andrew Kam / Pace Notes attribution and the
licence link when using the licensed dataset. This registration does not enable
imports, merge athletes or approve public profiles.

## Completeness and duplicate checks

The [organiser's announcement](https://www.londonmarathonevents.co.uk/london-marathon/article/2025-tcs-london-marathon-breaks-guinness-world-records-title-largest-number)
states 56,640 finishers. Neither secondary source's count matches that headline;
division scope and later corrections require reconciliation before it can serve
as a full-field export control total. The two secondary collections overlap and
must not be added to calculate distinct runners.

The existing Sources registry and wider repository source/event inventory were checked for
MarathonGuide, Pace Notes, `splithappens.run`, the Figshare dataset ID and the
publisher's GitHub repository. MarathonGuide already existed; no matching Pace
Notes registration was found. No new timing-provider identity is created for
the retained original London result URLs. The live database inventory was not
confirmed by this review; these are repository registration checks.
