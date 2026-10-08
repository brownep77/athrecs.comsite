# Fixture geography correction — 8 October 2026

The runABC source region had been stored as a venue country. Its Scotland listings include races in England and overseas. Separately, race-page geography guessed countries from ambiguous place names and defaulted missing values to England. These paths could disagree with fixture flags.

## Scope and evidence

- Automated screening covered all 14,743 live event records and their 196 distinct stored country labels. This is not independent organiser verification of every event.
- `corrections-2026-10-08.json` records 42 source-checked corrections with URLs and check dates. The Seattle listing itself contains a country error, so the organiser's Seattle Center, Washington venue takes precedence.
- The Gothenburg organiser confirms Saturday 10 October 2026, marathon start 10:00 at Slottsskogsvallen, Gothenburg, Sweden. The previous 9 October / 23:00 imported values were wrong. The organiser's entry page says entries are closed. Sources: https://goteborgmarathon.se/information and https://goteborgmarathon.se/anmalan.
- Another 38 Welsh seed records were aligned with their already-correct live country values. Venue overrides were aligned so later seeding cannot restore the known errors.
- 311 historical records have no stored country; none has an upcoming edition. Five records use international/continental labels. These must not receive a guessed national flag. They remain explicit unknown/international values pending source evidence.
- Ambiguous and cross-border venues are not automatically reassigned from city-name matches.

## Behaviour

Both flag paths recognise the full 250-entry country/territory dictionary, plus UK home nations and imported IOC aliases. Explicit stored countries win over race names and city names. Unknown labels do not become England or an unrelated flag. Country-filter options and SQL filtering canonicalise equivalent labels before pagination. World Athletics refresh uses the same country normalisation.

## Repair and validation

`repair-2026-10-08.sql` is a reviewed, bounded repair, not an automatic application migration. It was applied transactionally to production on 8 October 2026. Original event/edition rows are retained in 43 `app_meta` records with prefix `fixture-geography:2026-10-08:`. All 42 event corrections and Gothenburg's date, time and status were read back successfully.

`npm run verify:fixture-geography` tests every dictionary code/name, aliases, ambiguous cities, unknown labels, UK home nations, timezone formatting, seeds, real SQL filtering, repair repeat safety, original-value retention and atomic rollback on an edition collision. An optional JSON event projection argument adds a full catalogue screening pass.

`scripts/verify-fixture-geography-ui.mjs` runs in the existing quality gate against its seeded local server, covering desktop/mobile race details and hydrated country filters for road, trail and track fixtures. No production records or athlete results are changed by tests.

Live browser verification also found the legacy Gothenburg booking option still said open. `repair-entry-option-2026-10-08.sql` preserves its before-state in one additional `app_meta` record and aligns that specific option with the corrected edition/seed (closed, organiser entry URL). No other booking options are changed.

A second screening pass compared 1,354 explicit three-letter venue codes with stored countries. Governing-body/host pages confirmed three Scottish athletics events incorrectly stored as England. `world-athletics-corrections-2026-10-08.json` records their evidence; the accompanying bounded repair corrects all three countries and the host-confirmed Glasgow championship date (12 December 2027). Original rows are retained. This brings the source-checked live country corrections to 45. One retired Cardiff seed was also corrected to Wales. No athlete results are changed.

The full duplicate regression caught a Wrexham pair previously separated by the wrong seed country. Both https://runabc.co.uk/wrexham-half-marathon-february and https://www.runthrough.co.uk/event/wrexham-half-marathon-february-2027 confirm the same 28 February 2027, 09:00 half marathon at Queensway Stadium; the partner page identifies Active Leisure Events as organiser. The imported slug now resolves to `wrexham-half-marathon-2027`. Production inspection found only that canonical event, so no live duplicate needed removal. The regression test was retained unchanged.

It also exposed the imported Budapest marathon on 10 October alongside the canonical 11 October marathon. https://marathon.runinbudapest.com/ confirms the two-day festival and Sunday marathon. The imported URL resolves to `budapest-marathon` and public race/fixture lists show that canonical event. The imported database event, editions and all references are retained: this alias is explicitly excluded from seed retirement. The duplicate regression remains unchanged.
