# UK home-nation championship fixtures

Checked on 29 August 2026.

Power of 10's public Fixture Search (`https://www.powerof10.uk/Home/FixtureSearch`) does not expose a bulk listing: the new site returns an IIS permission error and the search endpoint is recaptcha-gated. The licensed UK Fixtures calendar at `https://fixtures.myathletics.uk/` is the official equivalent feed.

England track, field and cross-country licensed fixtures from that calendar were already imported in `src/data/england-athletics-uk-fixtures.ts` (138 series / 189 editions through 19 April 2027).

This pass adds the remaining home-nation championship meetings published by:

- [scottishathletics championship events](https://www.scottishathletics.org.uk/events/championship-events/)
- [Welsh Athletics championship events 2026](https://welshathletics.org/en/page/welsh-championship-events-2026)
- [Athletics NI fixtures](https://www.athleticsni.org/Fixtures)
- [English Cross Country Association](https://www.englishcrosscountry.co.uk/) for the 2027 English National XC

## Counts

- 26 new championship series
- 29 editions from 29 August 2026 through 20 February 2027
- 9 published host races / XC meetings skipped because they are already in Athrecs

No fixtures beyond December 2027 were published on the federation calendars at check time. Scottish indoor championships for January–March 2027 are included with venue-TBC notes where the federation has not yet named the hall.

Machine-readable decision log: `audit-2026-08-29.json`.
