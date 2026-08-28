# England Athletics RunEvents audit

Checked on 26 August 2026 against the official England Athletics RunEvents calendar, covering listings through 31 December 2027.

The source returned 631 rows. After restricting the requested horizon and consolidating repeated source rows, 621 licensed listings remained. The comparison found:

- 239 listings already represented in Athrecs;
- 54 listings safely attached to 27 existing race series;
- 105 new race series, producing 267 advertised-distance rows across 181 race dates;
- 115 possible name variants held back for manual review;
- 86 rows held because their official URL, advertised distance, or source-year metadata was not safe to publish.

The machine-readable decision log is in `audit-2026-08-26.json`. Held records are deliberately not published: a same-city or same-organiser resemblance is not treated as proof that two races are the same event.

Source: <https://www.englandathletics.org/runevents/search/>

## UK Fixtures track, field and cross-country pass

The fully licensed England filter on the UK Fixtures calendar returned another 200 current rows: 84 cross-country fixtures, 115 outdoor track-and-field fixtures and one ultra fixture. Eleven were already represented in Athrecs; the remaining 189 fixtures were added across 138 new event series. Duplicate source rows at distinct venues were preserved as distinct competitions.

The machine-readable decision log is in `audit-uk-fixtures-2026-08-26.json`.

Source: <https://fixtures.myathletics.uk/>
