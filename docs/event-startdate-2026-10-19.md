# Event startDate investigation — 19 October 2026

## Confirmed evidence and limits

Google's 18 October email reports one critical issue type, missing `startDate`, but contains no example URLs or affected-item count. The current browser session is signed out of Search Console. Its new affected URL list, last crawl dates and validation state have therefore **not** been inspected, and validation has not been requested. Do not label the warning stale or resolved on this evidence alone.

Production AthRecs deployment `dpl_BgqfPPKR7EWid8Uxi5gyVYRhBAVm` was READY at main commit `e9017dc62c7c7b62c6b13922dd44e8133d8d2cec` before these changes. The October 5 guard from PR #559 remains in that code. PR #752, merged October 15, separately removed nested SportsEvent markup from results archives.

A fresh anonymous audit fetched **122 live AthRecs pages**, all HTTP 200, and recursively inspected every JSON-LD object (including nested subjects and graphs). **104 pages emitted dated Events, with zero missing or malformed startDate values; 18 emitted no Events.** This inventory comprises the 119 URLs retained from the earlier, non-critical report plus the Pradelia archive and two running-guide paths. It is **not** the unknown affected list from the October 18 warning and is not a whole-site crawl. The 119 earlier URLs now contain 102 Events and 17 pages without Events. See the adjacent audit JSON for exact URLs, check times, canonicals and fields.

A rendered browser check of `/races/wa-futuras-promesas-en-accion-pradelia-delgado-ojeda-7244673` confirms `WebPage` markup, the visible “No future date listed” message and the preserved September 5 historical edition. The October 5 fix works for this original example today.

`/results/zugspitz-ultra-trail-by-utmb-2026-06-18-107k-109238558` returns CollectionPage/Thing/ItemList markup with no nested Event. The October 15 archive correction is also live.

Google's fresh [Newcastle Rich Results Test](https://search.google.com/test/rich-results/result?id=bb0bR1uCPeiGv_8ZUnr8Bw), crawled October 19, reports one valid Event and one valid breadcrumb item, with non-critical issues. Its current startDate is `2027-03-21T09:35`. This confirms technical Event eligibility for that tested page, not all pages or guaranteed display.

## Reproduced gaps corrected

- The RunRecs build substitutes `src/runrecs/seo.ts` for the AthRecs helper. It still emitted SportsEvent without startDate on undated input. It now shares the same strict calendar-date validation and WebPage fallback. This is a separate confirmed code defect; it is not established as the cause of the AthRecs warning.
- Both brand helpers appended unvalidated start-time text to valid dates (for example `2027-04-25TTBC`). Unknown or invalid local times now retain the known date alone. Valid HH:mm/HH:mm:ss, including an explicitly supplied midnight, remain unchanged. No time or timezone is invented.
- The road marathon/half-marathon and ultra selectors admitted impossible dates; an ultra's valid end date could also let an absent start date reach SportsEvent. All guide selectors now require a real start date before advertising an upcoming edition. Original edition arrays and historical records are not mutated.

These are rendering guards, with no database migrations, catalogue publication, date corrections or historical data deletions.

## Regression coverage and release

`node scripts/verify-event-startdate.mjs` covers both actual brand helpers; missing, partial, impossible and timestamp-as-date values; malformed local times; leap days; every guide builder; end-date-without-start cases; immutability; and 139 current guide Events across 179 guides. It is added to the normal quality gate. The new test failed on the unpatched AthRecs malformed-time case; the unpatched RunRecs missing-date output was separately reproduced.

Local checks passed: new regression suite, existing race schema suite, all road marathon/half-marathon/ultra checks, TypeScript, focused ESLint and development-mode Vite production build. Normal GitHub CI and Vercel checks must pass on the final pull-request head before merge. Record the final release status in the PR.

## Search Console follow-up

Once the authenticated report is accessible, open the new missing-startDate issue, export its exact examples and inspect indexed crawl dates versus current live JSON-LD. Test the live URLs and request Validate Fix only after all examples are corrected or legitimately no longer emit Events. Unknown-date archives remain eligible for ordinary indexing but intentionally do not claim Event-rich-result eligibility. Dated pages must satisfy Google's other required properties and guidelines as well; passing startDate alone is insufficient.
