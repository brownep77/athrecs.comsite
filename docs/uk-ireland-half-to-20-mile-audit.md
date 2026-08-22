# UK and Ireland half-to-20-mile race audit

Checked: 2026-08-22

## Scope

This release covers future running races in England, Scotland, Wales, Northern Ireland and Ireland whose published course distance is strictly longer than a half marathon (21.0975 km) and strictly shorter than 20 miles (32.18688 km). Road, trail, mixed-terrain and fell races are included. Exact half marathons and exact 20-mile races are outside this pass.

Every published date and distance was checked against an organiser, direct registration, governing-body or race-licensing source. Existing Athrecs cards were corrected in place before any new series was created. A series slug/date duplicate check prevents a second edition card for the same fixture.

## Published additions

| Date       | Race                                  |    Published distance | Country | Result                                               |
| ---------- | ------------------------------------- | --------------------: | ------- | ---------------------------------------------------- |
| 2026-09-12 | Mynyddoedd Du / Black Mountains       |       27.4 km / 17 mi | Wales   | New series                                           |
| 2026-09-19 | Pedol Peris                           |     28.2 km / 17.5 mi | Wales   | New series                                           |
| 2026-09-26 | EcoTrail Wicklow                      |               30.9 km | Ireland | New series                                           |
| 2026-09-26 | East of Ireland Marathons — Howth     |          3/4 marathon | Ireland | New series                                           |
| 2026-10-04 | Life Style Sports Irish 3/4 Marathon  | 31.646 km / 19.664 mi | Ireland | New series                                           |
| 2026-11-08 | Roaches Fell Race                     |       24.1 km / 15 mi | England | New series                                           |
| 2026-11-14 | Beastier of Bamford                   |       23 km / 14.3 mi | England | New series                                           |
| 2026-11-15 | Roly's Run                            |     24.9 km / 15.5 mi | England | New series                                           |
| 2026-11-21 | Tour of Pendle                        |       27 km / 16.8 mi | England | New series                                           |
| 2027-01-02 | Punk Panther New Year Half & Marathon |       22.5 km / 14 mi | England | New edition on existing Green Gateways series        |
| 2027-01-17 | Benfleet 15                           |       24.1 km / 15 mi | England | New series; entry TBC                                |
| 2027-02-06 | Punk Panther Harrogate Hustle         |       23 km / 14.3 mi | England | New series                                           |
| 2027-02-06 | Wadsworth Trog                        |       31 km / 19.3 mi | England | New series; entry TBC                                |
| 2027-02-14 | St Valentine's 30K                    |                 30 km | England | New series; entry TBC                                |
| 2027-05-22 | OuterEdge Race The Tide               |     24.9 km / 15.5 mi | England | New series, distinct from the existing Cumbria event |
| 2027-05-29 | HOWL Trail                            |       25.7 km / 16 mi | England | New series                                           |
| 2027-05-29 | Community Traverse Cleveland Hills    |                 32 km | England | New series                                           |

## Corrected without duplication

The following existing catalogue records were enriched rather than re-added:

- Exterminator: `Other` and 09:30 corrected to 16 miles and 10:30.
- Stretton Skyline: `Other` and 08:30 corrected to 19 miles and 11:00.
- Rye Ancient Trails: `Other` and 08:30 corrected to 30K and 09:30.
- Yorkshireman Off Road: the “Half” corrected to its official 14.8-mile measurement and 10:30 start; 2026 is sold out.
- Two Breweries: `Other` and 11:00 corrected to 18 miles and the noon mass start.
- Windgather: `Other` and 10:00 corrected to 13.5 miles and 11:00.
- Pentland Skyline record: renamed Carnethy Skyloop and corrected to about 30K; entry held as TBC until its announced opening.
- Sidmouth Four Trigs: `Other` corrected to 17 miles.
- Ireland West: “30K” corrected to the organiser's 3/4 marathon label while retaining its 10K and 5K options.
- Green Gateways: stale 20K/Ultra metadata corrected to the 14-mile and marathon options for the confirmed 2027 fixture.

## Held back

| Candidate              | Why it was not published                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Folksworth 15          | Official site still shows only the completed January 2026 edition.    |
| Banbury 15             | No future edition is confirmed on the organiser page.                 |
| Cranleigh 21           | Only the completed March 2026 edition is confirmed.                   |
| Cork to Cobh 15        | Official page does not give a year-specific 2026 date.                |
| Granite Peaks 25       | NIMRA's calendar date conflicts with a later cancellation notice.     |
| Malvern Hills 18 Miler | Organiser explicitly describes it as a guided social run, not a race. |

## Release controls

- New series slugs and normalised names are checked against the core, runABC, race-collection and recent UK/Ireland datasets.
- New edition keys are checked against existing `seriesSlug + date` keys.
- Every published and corrected edition must remain inside the two exclusive distance bounds.
- Open editions require a verified official entry option checked on 2026-08-22; TBC editions cannot advertise an entry option.
- The persistent catalogue seed version is advanced so existing environments receive the additions and corrections.
