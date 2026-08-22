# UK and Ireland 5K catalogue audit

Checked: **22 August 2026**

Public fixture horizon: **22 August 2026 to 31 December 2027**

The original release added missing, dated United Kingdom 5K races. The continuation adds 55
more dated fixtures across the United Kingdom and Republic of Ireland from official organiser,
event, governing-body, or direct registration pages. It also extends the public horizon through
the end of 2027 and records each race's actual surface rather than treating every 5K as road.

## Publication rules

- A public edition needs a specific date and an identifiable source URL.
- `Open` and `Closed` additions carry a checked entry/status option. Governing-body fixtures
  without a published checkout remain `TBC`; representative-only races are not presented as
  public entry opportunities.
- Organiser entry is recorded separately from third-party registration. The only third-party
  primary in this release is the direct November Duthie Park registration listing.
- A series may offer other distances, but the edition added by this audit represents the 5K
  race so that it is discoverable in the 5K catalogue workflow.
- Weekly adult parkruns remain in the dedicated parkrun source and are not duplicated here.
- Athletics Ireland fixtures labelled `permit pending` remain in the research queue until the
  permit is approved, even when their registration provider has published a date.

## Sources covered

- Athletics Northern Ireland, Welsh Athletics / England Athletics licensed listings
- Great Run, Run Nation, Nice Work, ATW Events, EvenSplits and Danum Harriers
- Up and Running Events in Scotland
- RunThrough's published 2027 event calendar
- Pop Up Races and Eventmaster direct event-registration pages
- Athletics Ireland permit states exposed by Eventmaster

The implementation lives in `src/data/uk-5k-races.ts` and
`src/data/five-k-races-uk-ireland-next.ts`. Run
`npm run verify:uk-5k-workflow` after future changes.

## Continuation release

The new public batch contains **55 series and 55 dated 5K editions**:

- 27 England fixtures, including the previously uncovered January-April 2027 window and
  RunThrough's October-December 2027 calendar;
- 21 Republic of Ireland / Northern Ireland fixtures from August-December 2026;
- 7 approved, dated Republic of Ireland fixtures in 2027.

The surface mix is **Road, Track, Mixed and Beach**. Debden Airfield, Goodwood Motor Circuit and
Lee Valley VeloPark are tagged `Track`; Dune Run Bundoran and Brandon Bay are tagged `Beach`;
park or wildlife-park courses whose official descriptions are not solely road are tagged `Mixed`.

## Existing records retained and enriched

Camperdown Park, Cuningar Loop, Edinburgh Marathon Festival 5K and the three Hatfield 5K
series races were already present. They were not duplicated. Hatfield received official
organiser metadata, while Oundle, Wendover Woods, Ruthin, Swansea Bay, Antrim Coast and the
Great Perthshire Last Mince Pie Run received targeted distance, source or geography fixes.

The wider geography audit also moves obvious Welsh runABC fixtures out of England and corrects
two false Welsh matches in Cold Norton and the Isle of Wight.

## Held research candidates

The exported `ukFiveKResearchQueue` keeps these out of the public catalogue until the stated
evidence gap is resolved:

- provisional Nice Work fixtures at Beckley and Cannock Chase;
- Glasgow Green January 2027, pending a dated organiser page;
- the 2027 Scottish 5K Championships, pending a confirmed host and date;
- Cancer Research UK Race for Life 5K events, which need a structured venue-level official-feed
  import rather than an unsafe bulk copy of search listings.
- RunClare Quin 5K, Long Woman's 5K and South East Greenway 5K Stride, whose 2027 Eventmaster
  pages explicitly showed their Athletics Ireland permits as pending when checked.

This is a verified release, not a claim that every informal, private, representative, or newly
announced UK or Irish 5K has already been published.
