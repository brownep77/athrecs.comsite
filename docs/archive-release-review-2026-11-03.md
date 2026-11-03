# Historical results release review — 3 November 2026

PR #1115 was already merged at 10:43:38 UTC as 6309ccc16d0f1c1724f168847f3ac105912845ae. The review base is main f8229fca804f6de2392467c169fc33844ea8d9ed. Both #1115 and the previously merged report standings PR #1118 are ancestors. This follow-up does not replay either change.

## Proposed fixes

- Require public/public_figure result visibility independently of athlete Public figure status on archive listings, standings, race previews, race-hub counts and athlete-directory canonical-result counts. An explicitly private performance must remain private. Retain the legacy RunRecs preview/directory behavior.
- Hide profile club data for results-only identity holds and active owner club-sharing opt-outs in archive standings. Do not permit searches to infer those hidden clubs. Keep separately recorded race affiliation distinct. Race previews also respect club-sharing opt-outs.
- Keep a recorded performance on one line; desktop paired boards previously wrapped the last fractional digit in a synthetic 2:01:00.25 stress case.

The private-result regression was first run against unchanged main and failed: a private performance belonging to a Public figure entered the standings. The proposed query changes make it pass. Regression cases additionally cover an edition with only private results, owner club-sharing opt-outs, private club searches, results-only profile club isolation, race previews and canonical-result counts. No production database writes or imports were made.

## Compatibility and visual review

Live New York archive: men at x=122, women at x=682, equal y and 544 px width. 51 men, 30 women, two unrecorded-division rows; 83 total public performances at review time. Country flags/codes and a working Oz Pearlman profile link were inspected. Do not infer absent divisions or nationality from names.

Live Auckland report retains separate marathon and half-marathon leading-three boards, source net-time labels, flags and country codes. Live Dublin report retains paired international leading-three boards and organiser time labels (men x=143, women x=682, same y). These report components were preserved.

The actual archive results component was rendered with synthetic long names, club names, countries and fractional times using the built stylesheet. At 390 and 320 CSS px, document width equalled viewport width, boards stacked, details expanded, flags/codes and times remained readable. This is a browser layout check in width-constrained frames, not a physical-device test. Desktop fractional-time wrapping was reproduced and corrected. The normal Vite development preview rejected terminal.local; the isolated static layout fixture avoided changing the app hosting configuration.

## Observed public coverage

| Surface | Confirmed coverage | Remaining work |
| --- | --- | --- |
| Brentwood Half Marathon | 22 searchable editions: 2003–2017, 2019–2020, 2022–2026; all 22 linked from the race hub; main search for Brentwood 2006 finds the exact edition; 2006 displays 1,511 public performances | 2012 and 2014 have only six/seven public rows; do not describe all editions as full fields. No 2018 or 2021 edition was returned; source research must establish what is recoverable. |
| New York 2026 | 83 public recorded performances | Full-field collection/publication remains necessary; #1118 explicitly did not import the NYRR full field. |
| Frinton and Walton Half Marathon | 2003: 100 public performances; 2004: 153 | No recovered 2007–2010 edition appeared in the reviewed search. |
| Mersea specialist archive | Bundled regression verifies 2,620 finisher records across 24 editions | This validation preserves the existing stored coverage; it is not a fresh timing-source verification. |
| London Marathon | Public search returns small fragments across multiple event identities, including three 2026 entries with 1/1/18 rows | Canonical edition reconciliation and full-field publication are still needed. This review did not merge race records or publish staff ingestion data. |
| Auckland and Dublin reports | Leading three men and women; Auckland includes a separate half-marathon board | These are report summaries, not full-field archives. |

The specialist Berlin and Bure Valley pages remain linked from results. Bure Valley is labelled a winners summary. Page availability does not establish full-field coverage or verify every source fact.

## Validation

- Actual SQL against isolated PGlite: verify-public-results-section, verify-public-read-limits.
- Built HTTP route regression: verify-archive-discovery (22 synthetic editions, race-hub links, year search, canonical URLs, HTML/hydration evidence suppression).
- Specialist/public projections: verify-mersea-results; verify-public-guide-evidence.
- Editorial compatibility: verify-editorial-reports; verify-editorial-athletes.
- Vite development-mode production bundle, TypeScript and changed-file ESLint.

Archive and guide checks verify that staff evidence URLs remain stored while absent from public responses and rendered data. Source labels/credits remain. Privacy assertions use synthetic records and demonstrate the tested gates; they are not an exhaustive audit of every production record or all other site APIs.

## Release gate

This follow-up requires Paul's approval before merge. No merge, deployment, auto-merge or data-import action is authorised by this review itself. After approval, merge through GitHub with the approved head SHA, await deployment, and revisit historical search, Brentwood 2006, New York, Dublin and Auckland. Reconfirm public credits, layouts and profile navigation. Recheck public counts without expecting an import: the patch may reduce counts if previously exposed private records existed.
