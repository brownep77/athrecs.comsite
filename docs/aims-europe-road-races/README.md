# European AIMS marathon and half-marathon audit

Checked 25 August 2026 against the live [AIMS member-race calendar](https://aims-worldrunning.org/calendar.html), covering confirmed European fixtures from 25 August 2026 through the site's 31 December 2027 catalogue horizon.

## Published coverage

- Reconciled 128 AIMS European member-race series and 135 dated fixtures.
- Added 60 genuinely missing Athrecs event cards.
- Enriched 67 existing canonical cards in place with official organiser links, correct marathon/half-marathon discovery and additional dated editions.
- Retained separate cards for distinct same-city races such as the Budapest, Barcelona, Warsaw, Prague, Berlin, Madrid and Istanbul half marathons.
- Consolidated the two separately listed Lisbon half-marathon member pages into the existing `lisbon-half-marathon` card.

## Source and duplicate controls

Every fixture retains its AIMS event-calendar URL, AIMS member-race page and official organiser website. Dates remain `TBC` for entry status because AIMS confirms the fixture date, not whether public registration is currently open.

The verifier rejects missing official URLs, out-of-horizon dates, duplicate edition keys, incomplete locations, non-road records and unexpected canonical collisions. The catalogue-wide duplicate verifier is also run before release.

Run `npm run verify:aims-europe-road-races`, `npm run verify:fixture-duplicates`, `npm run typecheck` and `npm run build` before review.
