# Swimming expansion — 23 October 2026, batch N

Adds 13 Oceania national swimming bodies and Oceania Aquatics, two unclaimed athlete profiles with 51 source-compared performances, and 21 fixture entries across nine New Zealand competitions.

## Directory

All 15 Oceania member countries and territories were compared against the opened World Aquatics and Oceania Aquatics membership directories. Swimming Australia and Swimming New Zealand already exist. The other 13 national swimming bodies are added with their official listed names and explicit membership-directory links; no standalone websites or funding powers are guessed. Micronesia uses the existing catalogue country label while retaining the full federation name and country-name alias.

All 629 existing directory objects remain unchanged. Totals become 643 organisations, including 593 national bodies across 202 countries and territories.

## Fixtures

Eight pool competition listings preserve their full official 2027 date ranges: four Junior Festivals on 6–7 March, Age Group Championships on 11–15 April, Swimming Championships on 19–23 May, Secondary School Championships on 5–8 August, and Short Course Championships on 26–30 September. The All Stars venue remains TBC. Detailed pool schedules and entries are not yet available; these are meeting listings, not individual races or invented sessions. The checked ranges are retained in the seed metadata and database end dates, without inferred finish times.

Thirteen individual category listings cover the NZ Open Water and Secondary School Open Water Championships, Lake Pupuke, 13–14 February 2027. Seven starts agree between the official schedule and version 1 information booklet dated 20 October 2026. Six female category starts remain TBC because the equally dated documents disagree by two minutes. Relay listings are held because the schedule says 4 x 500m and the booklet's key-times table says 4 x 1km. The PDF tables were visually inspected as well as extracted.

Open-water entries are explicitly open through the festival gateway authorised by Swimming New Zealand. The booklet gives a 31 January 2027, 23:59 Auckland deadline. Times are Pacific/Auckland (NZDT, UTC+13:00); registration and briefing times are not used as race starts. National and school categories remain separate even when sharing a start.

## Athletes and performances

Lewis Clareburt receives 29 individual performances and Erika Fairweather 22, from their World Aquatics personal-best tables. Raw HTML tables are mapped by column headings and independently compared with fresh browser text. All seven non-country columns agree; competition country is read from the raw table's explicit country column. Relay rows are excluded. Exact decimal marks, dates, equal marks on different dates, and 25m/50m pool distinctions are preserved. Numerical placing and round remain blank when absent. These are incomplete athlete histories; no canonical race-result archive editions are added.

Both sources explicitly report NZL nationality. The New Zealand Olympic Team profiles explicitly supply birth years (1999 and 2003) and birthplaces (Wellington and Dunedin); these reviewed facts are approved for the unclaimed public profiles. Exact birth date, residence and representative remain unknown. No age-at-performance is converted into a birthday. Height observations are retained privately. Names, aliases, stable provider IDs and existing histories were screened before creation. Source comparison does not verify account ownership.

The review database's default country value was caught and cleared; the production insert explicitly uses the schema's empty country value for unknown residence. The three prior swimming profiles were checked and already preserve that empty value. Original rows, document text, raw-document hashes, source links and publication receipts remain in staff audits. Public athlete responses omit evidence and provider links.

## Sources and validation

Three previously missing result services are registered with collection disabled: Oceania Aquatics' 2025 Pacific Mini Games archive, Swimming New Zealand's officiated meet archive and linked result portal, and New Zealand Olympic Team athlete records. The static registry, managed registry, event register and wider swimming event inventory were checked for existing entries. Registration does not establish permission or verify the archive's participants.

Validation includes preservation of existing directory objects, independent source-row comparison, performance schema and evidence projection checks, unique fixture identities, date-range and timezone comparison, review-branch rehearsal, TypeScript, directory checks, fixture duplicate and geography checks, source registry validation, profile/result verification safeguards and a development build. Repository lint passes with the pre-existing untracked source-capture artifacts excluded. The registry's exact expected count now includes batch M's source and the three additions here. Production readbacks, deployment checks and live pages are recorded in the final staff receipt.
