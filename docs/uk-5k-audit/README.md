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
`src/data/five-k-races-uk-ireland-next.ts`, with new monitoring additions in
`src/data/five-k-races-uk-ireland-daily.ts`. Run
`npm run verify:uk-5k-workflow` after future changes.

## Follow-up release

A further **17 dated 5K fixtures** were source-checked and published across road, trail and
mixed surfaces. The batch includes missing Scurry Events and ACORN Trails fixtures in Scotland,
Race Dunvegan on **20 March 2027**, Run Balmoral, Cardiff Race for Victory, and five additional
RunThrough fixtures through September 2027. Existing source slugs are reused where appropriate,
so their 5K distance is exposed without creating lookalike duplicate events.

## Continuation release

The new public batch contains **55 series and 55 dated 5K editions**:

- 27 England fixtures, including the previously uncovered January-April 2027 window and
  RunThrough's October-December 2027 calendar;
- 21 Republic of Ireland / Northern Ireland fixtures from August-December 2026;
- 7 approved, dated Republic of Ireland fixtures in 2027.

The surface mix is **Road, Track, Mixed and Beach**. Debden Airfield, Goodwood Motor Circuit and
Lee Valley VeloPark are tagged `Track`; Dune Run Bundoran and Brandon Bay are tagged `Beach`;
park or wildlife-park courses whose official descriptions are not solely road are tagged `Mixed`.

## Daily-scan baseline release

The daily-scan release publishes **12 additional dated races** after checking their
organiser or direct-registration pages and comparing names, slugs, dates and sources with the
existing catalogue:

| Date        | Race                             | Country | Surface       |
| ----------- | -------------------------------- | ------- | ------------- |
| 27 Aug 2026 | Dunboyne Track 5K                | Ireland | Track         |
| 29 Aug 2026 | Very Pink Run Dublin 5K          | Ireland | Road          |
| 5 Sep 2026  | Seamie Weldon 5K & 10K Road Race | Ireland | Road          |
| 6 Sep 2026  | Very Pink Run Cork 5K            | Ireland | Road          |
| 19 Sep 2026 | Horsted Keynes Fun Run 5K        | England | Trail         |
| 20 Oct 2026 | Savills Sandymount Night Run 5K  | Ireland | Road          |
| 29 Nov 2026 | Skipton Santa Fun Run 5K         | England | Mixed         |
| 13 Dec 2026 | Bedale Santa Run 5K              | England | Mixed         |
| 21 Dec 2026 | Winter Solstice Strider 5K       | England | Trail         |
| 7 Mar 2027  | Keighley 10K & 5K                | England | Mixed         |
| 14 Mar 2027 | Wakefield Hospice 5K             | England | Road          |
| 13 Jun 2027 | PaintRush 5K                     | England | Cross Country |

The scan excludes any separate virtual entry. Portmarnock AC Beach 5K remains unpublished while
its Athletics Ireland permit is pending, and St Luke's 5K Run to Remember remains held because
its previously indexed registration page is no longer stable. Very Pink Run Kilkenny also remains
held: Athletics Ireland and Eventmaster advertise 5K/10K, but the organiser's venue FAQ gives
4K/8K.

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
