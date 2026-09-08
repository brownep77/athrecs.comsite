# Bucharest Half Marathon — May 2027 import

## Current status

Prepared on 8 September 2026 in response to the missing May Bucharest Half Marathon report. Target: **RunRecs** (`sport: Running`), following the current running/athletics split.

**This is a prepared import, not a staged or published database batch.** Merging this PR alone will not add the race to the public website. No runtime code, seed version, workflow, domain or production setting is changed.

The JSON matches the `CatalogueBatchInput` / `ImportEventInput` / `ImportEditionInput` contracts inspected in this repository. It contains one proposed event and two 2027 editions, with a stable source key and an official entry option for each race.

## Verified facts and primary sources

| Fact | Confirmed value | Organiser source |
| --- | --- | --- |
| Event identity | OMV Petrom Bucharest Half Marathon, organised by Bucharest Running Club | https://www.bucuresti21km.ro/en/rules/ |
| Weekend | 8–9 May 2027 | https://www.bucuresti21km.ro/en/rules/ |
| Half marathon | Sunday 9 May 2027, 09:00 local; three-hour limit | https://www.bucuresti21km.ro/en/cursa-21km-half-marathon-bucharest/ |
| Companion 10K | Saturday 8 May 2027, 09:00 local; 90-minute limit | https://www.bucuresti21km.ro/en/cursa-10km-10k-bucharest-race/ |
| Entry link | Official homepage advertises registration for 2027 and links to the edition-specific njuko form | https://www.bucuresti21km.ro/en/ → https://in.njuko.com/bucharest21k2027 |
| Surface | Paved road course | Official 21K and 10K pages above |

All stored start times are local to Bucharest (`Europe/Bucharest`), not UK time. The organiser prints the half distance as 21.097 km; `distanceKm` uses the normalised standard half-marathon distance, 21.0975. The wheelchair 10K start at 08:45 is not the mass-race start.

No unverified prices, spectator-access claims, elite entrants, future results or additional editions are supplied. The relay and fun race are mentioned in the event description because the official homepage lists them, but they are not imported as separate race rows in this bounded batch.

## Identity and duplicate checks required before staging

The May event at `bucuresti21km.ro` is distinct from Bucharest International Half Marathon by Constantina Dita at `bucharest.run`. Do not merge them because their city and distances match.

`bucharest-half-marathon` is the proposed sponsor-neutral slug, **not a claim that this slug is absent from production**. Repository search returned incomplete index results, and live filtered searches / candidate detail URLs could not be retrieved by the available browser tools. No conclusion about complete production absence is justified.

Before staging, search the actual RunRecs catalogue, including past and undated records, for Bucharest, Bucuresti, OMV Petrom, Semimaraton and the official source domain. If the same May event already exists, reuse its permanent slug in the edition records. Avoid replacing its existing event description, links or distances; omit the proposed event object if no event enrichment is needed, or explicitly preserve existing fields and union its distances. Do not create a second event solely to obtain this proposed slug. Recheck the batch's event/date/distance natural keys against the database.

## Publication procedure

Use the staged workflow described in `../README.md`: stage, validate, inspect the proposed changes, then explicitly publish through the staff catalogue-publishing interface. Do not use a seed bump, direct SQL, emergency importer, production redeployment or weakened authentication to bypass this flow.

Source key: `runrecs:bucharest-half-marathon:2027:2026-09-08`.

After successful publication, record the batch ID and revision ID, and verify the actual RunRecs event page plus the Romania / May 2027 / Half and 10K search results. There must be one May event with the correct distance-specific dates and entry links, without altering the separate April race. Record the resolved canonical slug if an existing event was reused.

## Validation performed

Local structural validation passed for the prepared payload: one event, two editions, valid expected dates and weekdays, correct event references, expected official source and entry URLs, and zero duplicate event/date/distance keys within the batch. This is **not** live-database duplicate validation or a production publication test.

Reproduce the structural check with:

```sh
python3 docs/catalogue-publishing/batches/verify_bucharest_half_marathon_batch.py
```

If an existing canonical event is reused, update the payload and the explicit identity expectations in the structural test together; then rerun structural and live catalogue validation before publication.
