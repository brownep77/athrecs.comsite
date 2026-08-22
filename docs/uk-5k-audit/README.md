# UK 5K catalogue audit

Checked: **22 August 2026**

Public fixture horizon: **22 August 2026 to 30 September 2027**

This release adds missing, dated United Kingdom 5K races from official organiser, event,
governing-body, or direct registration pages. It also corrects country and distance metadata
discovered while reconciling the existing catalogue.

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

## Sources covered

- Athletics Northern Ireland, Welsh Athletics / England Athletics licensed listings
- Great Run, Run Nation, Nice Work, ATW Events, EvenSplits and Danum Harriers
- Up and Running Events in Scotland
- RunThrough's published 2027 event calendar

The implementation lives in `src/data/uk-5k-races.ts`. Run
`npm run verify:uk-5k-workflow` after future changes.

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

This is a verified release, not a claim that every informal, private, representative, or newly
announced UK 5K has already been published.
