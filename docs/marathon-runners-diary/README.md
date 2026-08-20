# Marathon Runners Diary snapshot

Checked 20 August 2026 against:

- `http://www.marathonrunnersdiary.com/races/europe-marathons-list.php`
- `http://www.marathonrunnersdiary.com/races/international-marathons-list.php`

The snapshot contains 158 marathon series: 89 European and 69 international. It creates 121
dated editions; the 37 TBC listings remain series-only until the directory publishes an exact
date. US and UAE abbreviations are normalised, and every record retains the source list plus its
race-detail path.

## Duplicate and date review

- `Warsaw Marathon` is canonical. The same 27 September 2026 World Athletics record
  (`wa-48th-warsaw-marathon-7236127`) is retired during seeding.
- Sponsor-prefixed records for the same marathon, city and date are mapped to one readable
  canonical series. Separate half-marathon and 5K records are not merged.
- Adjacent or nearby duplicate editions from earlier feeds are corrected for Dublin, Venice,
  Chicago, Barcelona, Paris, Rome, Marrakech, Great Wall and Cape Town. France.fr corroborates
  11 April 2027 for Paris while the supplied list currently marks it TBC.
- The Europe page visibly says 16 January 2027 for Leipziger Winter Marathon while its embedded
  metadata says 17 January. The visible date is used and was cross-checked against current
  event-linked calendars.
- The international page visibly says 28 November 2026 for Jordan Impact Marathon while its
  embedded metadata says 29 November. The visible race date is used; the organiser describes a
  23–29 November event week.

Run `npm run verify:mrd-marathons`, `npm run verify:fixture-duplicates`, `npm run typecheck` and
`npm run build` before review.
