# Regional race collection

New console runs enable **Split large countries into states and regions** by default. Worldwide still starts one durable run, with each selected region receiving its own two passes and inclusive quarterly date windows. Selecting a country selects all its regions initially; expand that country to choose a subset. Empty region selections are rejected. Other countries continue to use national jobs.

| Country | Collection areas |
| --- | --- |
| United States | 50 states plus District of Columbia (51) |
| Canada | 10 provinces and 3 territories (13) |
| Australia | 6 states, Northern Territory, Australian Capital Territory and a separate Jervis Bay area (9) |
| India | 28 states and 8 union territories (36) |
| China | 31 mainland province-level areas |
| Russia | 83 areas from the ISO subdivision dataset |
| Brazil | 26 states plus Federal District (27) |
| Mexico | 31 states plus Mexico City (32) |

This is 282 regional areas. With the remaining 242 national/territory entries, the 2027–2028 worldwide preset has 524 areas × 8 quarters × 2 passes = **8,384 jobs**. The console shows the actual job count before starting. Turning regional collection off restores the national preset. Regional coverage adds provider requests; it does not promise exhaustive race coverage, and the per-job 50-candidate cap still applies.

## Identity and boundaries

- Country IDs remain ISO country/territory codes. `Scope.regional` is explicit: missing/false retains the original national planner. `Scope.regions` maps selected countries to nonempty region-code lists; missing entries mean all configured regions. Unknown, foreign and stale selections fail server validation.
- Jobs persist `window.regionCode`; candidate proposals include `regionCode` plus a readable region. Regional jobs require an exact matching code and a nonempty region. Missing or mismatched assignments remain held. The research prompt requires primary evidence for the start location rather than merely copying the requested region.
- Cross-state and cross-country races belong to their **start venue**. Equivalent-distance, canonical identity, pending import and publication checks remain global; region is deliberately not added to the duplicate key. Repeated discoveries across states, passes and units do not add another listing. Uncertain first discoveries remain held for human review.
- U.S. outlying areas remain separate country/territory entries: AS, GU, MP, PR, UM and VI are not U.S. state jobs.
- Hong Kong, Macao and Taiwan remain separate HK/MO/TW entries and are excluded from the CN area list.
- Australian external territories with separate country codes keep separate jobs. Jervis Bay uses application code `AU-JBT` (not an ISO code), excluded from NSW/ACT searches. Region definitions are collection areas; no public territorial-status changes are made.
- Russia uses the 83 ISO areas, without adding Ukrainian ISO areas. Tyumen excludes its separately queued Khanty-Mansi and Yamalo-Nenets districts; Arkhangelsk excludes separately queued Nenets. Unclear country assignments are source gaps.
- Progress sums all regional rows to a country total and offers expandable per-region counts/failures. Findings show city, region and country; gap reports include the region. Full job exports already retain the complete window. Region names are passed through the existing event `county` field when new events are staged.
- Existing jobs/runs are not replanned or mutated. No schema migration or data backfill is needed because scope, windows and candidates already use JSON. Staff auth, production-only execution, worker credentials and manual publication review are unchanged.

## Dataset and checks

The checked-in `src/lib/race-collector/regions.ts` uses subdivision codes/names from [pycountry 26.2.16](https://github.com/pycountry/pycountry), with readable name overrides and the boundary adjustments above. Python/pycountry is a generation aid only; it is not an application dependency. Data checked 12 September 2026.

Supporting references:

- [U.S. Bureau of Labor Statistics state abbreviations](https://www.bls.gov/respondents/mwr/electronic-data-interchange/appendix-d-usps-state-abbreviations-and-fips-codes.htm)
- [Government of Canada provinces and territories](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada/read-online/canadas-regions.html)
- [Australian Bureau of Statistics states/territories](https://www.abs.gov.au/statistics/standards/australian-statistical-geography-standard-asgs/edition-3-july-2021-june-2026/main-structure-and-greater-capital-city-statistical-areas/australia-and-stateterritory)
- [India national portal state/UT directory](https://www.india.gov.in/explore-india/facts-of-india/states-ut-districts)
- [China National Bureau of Statistics mainland scope](https://www.stats.gov.cn/english/PressRelease/202602/t20260228_1962661.html)
- [IBGE political map of Brazil](https://agenciadenoticias.ibge.gov.br/en/agencia-news/2184-news-agency/news/35015-ibge-launches-new-edition-of-political-map-of-brazil)
- [INEGI geographic catalogue](https://www.inegi.org.mx/app/ageeml/)

`npm run verify:race-collector` exercises exact regional counts, territory exclusions, national compatibility, mixed country/state selection, invalid selections, primary-location prompt requirements, persisted region jobs, per-region progress, omission hints, held unknown regions, equivalent races across states/passes/units and normal source-review staging using an isolated database and synthetic research results. It does not call a paid research service or publish races.
