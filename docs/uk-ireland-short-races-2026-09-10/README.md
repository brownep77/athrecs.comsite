# UK and Ireland 5K / 10K additions

Requested by Paul Browne on 10 September 2026 for AthRecs, covering **10 September 2026–31 January 2027 inclusive**.

Published to the shared production catalogue as **revision 17**, batch `811be401-72c7-5a38-9f12-c63588c18aa7`.

- 234 new distance editions: 127 × 5K and 107 × 10K.
- 77 new event listings; 107 existing events receive missing dates or distances.
- 418 full before/after catalogue audit records. No existing event fields or entry options overwritten.
- The identical batch was staged, validated and published on an isolated Neon review branch before production.

## Sources and checks

RunABC's September 2026–January 2027 calendars for Scotland, North, Midlands and South supplied 679 unique candidate listings. Already-covered records were removed before checking 275 individual detail pages. Athletics Ireland's permitted-event calendar and Athletics Northern Ireland's road fixtures supplied Ireland and Northern Ireland dates and distances.

Facts were checked against the dated detail fields. Calendar timestamps were interpreted in Europe/London to avoid the previous-day UTC problem. Irish permit-pending events, cancellations, unconfirmed dates, relay legs, club-only leagues and conflicts were held. This is a snapshot of announced fixtures, not a promise that every January race has been announced.

Deduplication checked live event names, source URLs, permanent aliases, the assembled code catalogue, pending batches, and event/date/distance keys. Monthly Street 5K dates share one event. York, Leeds, Gateshead, Dorney and Wimbledon listings reuse existing identities; close dates and ambiguous existing duplicates are held for reconciliation. The established February 2027 Fountains Abbey correction is preserved.

Primary governing-body sources:
- https://www.athleticsireland.ie/get-involved/events-calendar/
- https://athleticsni.org/Fixtures/Road-Running

Every added edition carries its specific source URL. Entry status remains TBC where current checkout availability was not verified.

## Files

- `payload.json`: exact published event and edition input.
- `audit.json`: additions, held source candidates and skipped duplicate keys.
- `stage.sql`, `validate.sql`, `publish.sql`: bounded, audited publishing transaction used through the authenticated Neon connector. The usual application Postgres connection was unavailable from this workspace. These scripts use the existing catalogue state lock, revision and snapshot format. They abort if an edition appears or an alias changes between validation and publication.

Do not rerun the published batch. Normal catalogue recovery can inspect its full snapshots and revision chain.

## Public display

AthRecs adds a Running filter and homepage shortcut for the six UK/Ireland country labels. The event list, calendar, event detail and verified-entry resolver restrict Running editions to 5K/10K within the requested date window. Athletics remains the default. Other specialist sites retain their existing scope.

## Added editions by stored country

| Country | 5K | 10K |
| --- | ---: | ---: |
| England | 96 | 68 |
| Scotland | 23 | 13 |
| Wales | 5 | 1 |
| Northern Ireland | 0 | 5 |
| Ireland | 3 | 20 |
