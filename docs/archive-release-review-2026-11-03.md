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


## Independent follow-up review and extended candidate

The production deployment inspected for this review is dpl_GVLAonLKnWcKD1bbLph3QYyWEboF, main f7b1401d8fc5360cea379e9268ced001437115fa. PR #1127 remains draft at 91ba6a777bb37b39de0254a597dc61b4b3c56693. No branch update, merge or deployment is authorised until Paul approves the final candidate.

Additional findings beyond the original PR:

- The shared public-result visibility predicate still allowed public-figure status to bypass explicit private or unset visibility. This affects sitemap edition selection and native edition links. Require published result visibility independently.
- The member profile query had a separate public-figure bypass. Remove it so membership cannot expose another athlete's private rows.
- The member directory returned and searched opted-out club details. Hide both club name and slug and exclude private club search matches.

The new verify-explicit-result-privacy regression extracts and executes the actual profile SQL with PGlite and tests the shared discovery predicate. It fails against unchanged production source (private and unset-visibility rows returned) and passes with this candidate. Synthetic records only. Add it to the public read protection workflow. Existing archive and read-limit regressions check opt-outs, hidden rows, results-only identities, counts, race affiliation separation, exact timing and public projections.

Fresh public browser checks confirm 22 searchable Brentwood editions; the 2006 archive reports 1,511 rows and displays 01:11:20 for John Clarke. His result is currently unlinked; the linked Patryk Huczkowski profile works. New York 2026 reports 83 recorded performances. These are coverage checks, not a production privacy canary test.

Fresh render of the actual candidate board and built stylesheet: 320 and 390 px frames stack divisions, document width equals viewport width, and 2:01:00.25 remains unwrapped; 1152 px has equal 550 px boards on the same row. These are width-constrained browser checks, not physical-device tests. Separately recorded race affiliations remain public even if profile club sharing is disabled; this distinction is intentional.

Limits: no real private record was deliberately exposed or created in production. Synthetic SQL/HTTP tests demonstrate the covered controls; a live owner-controlled privacy canary and production recheck follow approval. This patch is not a comprehensive audit of legacy RunRecs directory behavior, all profile source-history publication, third-party caches or previously indexed data. The RunRecs-specific compatibility bypasses in the original PR remain outside the AthRecs release scope. Reverting to a pre-fix build would restore the vulnerability.
