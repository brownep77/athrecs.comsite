# Athlete finder adversarial verification — 23 October 2026

This report records the first test round. The [follow-up performance report](athlete-result-finder-performance-tests-2026-10-23.md) covers the subsequent participant index, further regressions and current performance measurements.

## Scope and method

The fault-finding exercise covered the staff athlete result finder, its four stored collections, source coverage, the supported Total Race Timing URL preview, and the selected-row handoff to the existing importer. The baseline was the deployed finder plus the subsequent public-profile evidence privacy fix. The changes also preserve the later source-registry additions from main.

Most tests use fictional records in disposable PGlite databases and synthetic provider responses. The browser harness drives the actual React form, loopback HTTP API, staff middleware, database queries and IndexedDB handoff. Production checks were limited to the existing staff UI and bounded read-only query plans/benchmarks. No production result, athlete, claim, verification state or source capture was changed by these tests. No private result rows or source HTML are included in this report or the test fixtures.

## Reproduced faults and corrections

| Area                       | Reproduced fault                                                                                                                                                 | Correction and evidence                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Preview identity           | Changing the athlete name left the previous preview's import-review button enabled.                                                                              | The checked name, aliases and club remain labelled. Changes to name, aliases, club or URL disable the button and its handler until the draft matches the checked inputs. The new browser assertion failed before the fix and passes for all four inputs afterward. |
| Race metadata              | A later table without its own date or heading borrowed metadata from the preceding race.                                                                         | Metadata lookup stops at race-section boundaries. Missing dates remain missing; the ambiguous table has no automatic handoff. Independent fixtures cover missing dates and headings.                                                                               |
| Source locators            | Repeated table anchors produced duplicate row keys and ambiguous handoffs.                                                                                       | Duplicate anchors are detected across the document. Preview rows retain distinct table/row locators, show a warning and require manual review.                                                                                                                     |
| Access challenges          | A challenge page containing an old results table was accepted as checked. Plain-text denial from robots could be treated as unrestricted.                        | Challenge checks run before result parsing. Explicit access challenges stop the check and retain the provider cooldown.                                                                                                                                            |
| Crawl rules                | CR-only line endings lost a denial. A token in the crawler's contact URL could override the wildcard group.                                                      | The parser handles CR, LF and CRLF and matches the crawler product token. Matching groups combine before path evaluation. Synthetic fixtures verify the denied page is not requested.                                                                              |
| Response failures          | Cancelling an already-failed HTTP denial body threw before the cooldown was written.                                                                             | Body cancellation is best-effort cleanup. Tests for 401, 403 and 429 preserve the observed denial and durable cooldown; a subsequent request makes no provider call.                                                                                               |
| Ambiguous performances     | A zero finish, a generic finish contradicting chip/gun times, and a heading with two distances could receive a handoff.                                          | Original rows remain available for manual interpretation, but these cases cannot automatically enter import review. Consistent timing columns still pass.                                                                                                          |
| Document formats           | A MIME type merely containing the text `text/html` was accepted; some non-text robots formats reached parsing.                                                   | The actual MIME type is checked. Results require HTML and declared crawl-rule responses require plain text.                                                                                                                                                        |
| Unicode matching           | Twenty of 32 targeted store/name checks returned false zeroes, including Turkish, Greek and Indic examples.                                                      | Input terms now use the database's indexed normalization. Greek final-sigma variants are included in both the exact query and the candidate filter. All 32 cases pass across all four stores.                                                                      |
| Capture search performance | A live search exceeded its seven-second bound. The query sorted matching JSON rows globally before applying the page limit.                                      | Candidate IDs are ordered before a per-capture scan; incremental ordering permits early page completion. A safe ASCII preliminary check avoids many unnecessary name-vector constructions. The final benchmark completed within the unchanged limit.               |
| Coverage recovery          | A partial failure could remain cached for two minutes with no direct refresh action or useful reason.                                                            | A manual refresh preserves filter/page, reports safe collection-specific failure reasons, and clears the diagnostic after recovery. The browser test temporarily removes and restores the history store, then recovers through Refresh without changing filters.   |
| Coverage counts            | Invalid ports could count as valid hosts, equivalent encoded/IDN authorities could split, and overlapping registry/inventory domains were incompletely labelled. | Grouped authorities use the registry's URL normalization. Overlapping rows both receive the shared-count warning. Invalid/overflowing counts are unknown rather than zero, and empty/error pagination states remain distinct.                                      |

## Capture performance evidence

The live query's candidate-only plan selected 1,699 eligible capture pages in **27.9 ms**, using both the name-candidate and latest-capture indexes. The broad race-level prefixes can occur in different participants' names, so candidate selection still left many race rows to inspect.

An ordered-query benchmark returned **24 matches in 6,291 ms**. Adding the ASCII preliminary check returned **24 matches in 3,224 ms**. Both measured query executions used the same seven-second statement bound and one-second lock bound, in read-only transactions. The preliminary check does not replace the exact name predicate and bypasses all non-ASCII source names.

These are representative single-query measurements with shared database caches, not cold-cache guarantees or service-level promises. Short names, broad aliases, deep offsets, cache state and concurrent load can still cause timeouts. A timeout remains an incomplete search, never a successful zero-match answer. Candidate races are not arbitrarily truncated to make the query appear faster.

## Regression coverage

The focused suites and integrated browser harness exercise:

- All four stores, aliases, prefix matching, filters, pagination and Unicode case/normalization behavior.
- Active approval, latest capture versions, revoked/held replacements, malformed stored data and individual store failures.
- Staff-only access, anonymous/member denial, cross-site request rejection and minimal private responses.
- No automatic search or provider fetch while typing, no import or verification writes from a search/preview, and exact chip/gun values in the selected-row handoff.
- Incomplete versus empty source coverage, recovery by explicit refresh, source overlap, domain normalization, count validation and mobile layout.
- Source URL validation, crawl rules, redirects, challenges, durable cooldowns, unsupported formats, malformed UTF-8, streamed byte limits, failed bodies and timeout signals.
- Missing metadata, duplicate table anchors, contradictory timings, malformed placings, result/table limits and exclusion of unmatched participants from the handoff.

Reproduce the relevant checks with:

```sh
npm run verify:athlete-source-finder
npm run verify:athlete-source-coverage
npm run verify:athlete-source-check
npm run verify:athlete-source-finder-browser
npm run typecheck
npm run build:dev
```

CI also runs the existing central-archive workflow and the repository quality gate. Their outcomes belong to the pull request's check records; this report does not substitute for those checks.

## Remaining limits

- A matching name is a possible identity match. These code tests do not verify an athlete, a performance or the full stored catalogue.
- Coverage counts represent overlapping observations, not unique performances, and saved URLs do not contain searchable participant data until extracted.
- The earlier intermittent capture coverage failure cannot be assigned a proven cause because the old handler discarded its reason. The new refresh and diagnostics improve recovery and investigation; they do not prove that database failures cannot recur.
- Coverage now normalizes encoded and IDN hosts, but the stored-search source filter still uses ordinary SQL host comparison. Unusual legacy hostname spellings can therefore be missed with a source filter. Searching all websites avoids the missed-match filtering limitation; consistent historic URL normalization remains follow-up work. The follow-up test round also fixes the earlier acceptance of ports above 65535 in that filter.
- The live URL adapter remains limited to supplied supported TRT pages. It does not search the entire internet or every URL in the registry.
- Synthetic malformed-page cases do not cover every future provider layout. Ambiguous or unsupported tables retain their evidence for manual review and may have no automatic handoff.

The crawler product-token and line-ending fixes follow [RFC 9309, sections 2.2 and 2.2.1](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.2). The stricter single-page preview retains its own conservative access, redirect, format and size limits.
