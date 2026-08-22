# UK and Ireland five-mile catalogue audit

Checked: **22 August 2026**

Public fixture horizon: **22 August 2026 to 31 December 2027**

This release adds dated, in-person five-mile running races across England, Scotland, Wales,
Northern Ireland and the Republic of Ireland. It covers road, trail and mixed-terrain races and
uses the catalogue's canonical `5mi` / 8.05 km representation.

## Publication rules

- A public edition needs a specific date and an identifiable official organiser, governing-body
  or direct registration source.
- `Open` and `Closed` additions carry a checked entry/status option. Dated fixtures whose entry
  window is not open remain `TBC` without a checkout claim.
- Athletics Ireland events labelled `permit pending`, and UK races whose registration pages say
  their licence or permit is pending or TBC, remain in the research queue.
- Virtual races, canicross-only races, timed events that merely use a five-mile lap, and races that
  mention five miles only as part of a longer route are excluded.
- Existing catalogue series are reused where they describe the same race. New editions are not
  represented as lookalike duplicate series.

## Public release

The audited dataset now contains **22 series records and 24 dated five-mile editions**. Two
records reuse existing catalogue series, leaving 20 net-new public series.

- Northern Ireland: Portrush and the Heath Graham Ards 5 Mile.
- Wales: three 2026 editions of the measured Severn Bridge 5 Night Race.
- Scotland: the licensed Glasgow University Des Gilmore road race and the dated 2027 Cramond
  Island mixed-terrain race.
- Republic of Ireland: four permit-approved Beara A.C. races, Lucan Harriers and the approved
  2027 Tommy Ryan Memorial Carrigaline race.
- England: Southend Rudolph Run plus 2027 road, trail and mixed-terrain races from ATW, Nice Work,
  Pendle Trail Running Club and Stort10, plus the dated St Agnes 5 Miler.

The follow-up also corrects the existing M10 Swansea record to the organiser's official
**28 February 2027** date and exposes both its 5-mile and 10-mile distances.

The reused series are Girlings Ashford & District RRC and Cannock Chase Forest. RAM 5 Mile was
already dated in the wider catalogue and is retained without a duplicate record.

## Held research candidates

Seven candidates remain out of the public catalogue:

- Garrettstown 5 Mile and RunClare Whitegate 5 Mile, whose Athletics Ireland permits are pending;
- Hellhole 5 Mile, Falmouth Mob Match and Preston Harriers 5 Mile, whose UK licence/permit evidence
  is still pending or TBC;
- the Plough and Harroween night trail race, whose TRA permit is in progress;
- Let's Run Rhyl, because the organiser homepage supplies a date while the detailed event page
  still labels the February 2027 date TBC.

The implementation lives in `src/data/five-mile-races-uk-ireland.ts`. Run
`npm run verify:uk-ireland-5-mile-workflow` after future changes.

This is a source-checked release, not a claim that every informal, private, club-only or newly
announced five-mile race has already been published.
