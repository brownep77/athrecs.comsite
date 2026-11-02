# Seventh fixture continuation — 26 October 2026

This batch keeps the fuller Appingedam and Croft listings, fixes two wrong dates,
removes a training camp from race fixtures, and fills source-confirmed distance,
start and entry information. It does not certify the whole October catalogue or
the rolling three-month window.

## Published scope

- Two exact duplicate event/date projections: Appingedam on 3 October and Croft
  on 1 November. Original events, editions and result dependencies remain stored.
  The fuller canonical events now offer five and eight options respectively.
- Fifteen additions on existing canonical events: Appingedam 100m and 400m;
  Zombie Cows 8H; Rosliston 6H; Croft 10mi, 26.2K and junior mile; London MoRun
  half and Mini 1.5K; Riverside half, 10K and Mini 1.5K on 29 November; Shepshed
  one-mile fun run; Brutal junior 3.3K and canicross 6.6K.
- Six guarded metadata updates: Appingedam 800m 14:00 → 15:00; missing Perth
  marathon 06:00 and Anglesey half 08:15 / 10K 08:45; Shepshed 7mi and Corofin
  10-mile entry status → Closed after the authorised entry pages reported full.
- Nine exact distance holds preserve the raw rows: Anglesey 5K; five fixed-distance
  Zombie Cows options; Croft 16mi; Shepshed 5K; Brutal 5K.
- Two exact wrong-date holds: Riverside 8 November → 29 November, and Rosliston
  31 October half → 1 November six-hour challenge. The Brecons 30 October
  running/yoga camp is a coached weekend, not a ten-mile race.
- Fifteen event/date detail reviews cover 39 options: 27 exact starts, four
  qualified planned Brutal starts, and eight unresolved starts. Three further
  Lakeland starts and the Delamere junior start retain their earlier unresolved
  presentation rather than adopting uninspected search snippets.

## Opened source evidence and decisions

| Programme                 | Primary evidence                                                                                                                                                                                | Decision                                                                                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Appingedam                | [Revised date](https://stadsloopappingedam.nl/nieuwe-datum-zaterdag-3-oktober-2026/), [timetable](https://stadsloopappingedam.nl/praktisch/starttijden-en-tarieven/) and children’s page        | Keep the existing 5K/10K/800m event; correct the older children’s clock to 15:00 and add the two younger groups at 14:00. Framerunning is a different category and was not merged with these starts.                                                                    |
| Perth                     | [2026 marathon programme](https://perthrunningfestival.com.au/marathon/)                                                                                                                        | Marathon 06:00; assembly 05:45. Championship duplicate remains pending because the Athletics West pages could not be opened.                                                                                                                                            |
| Anglesey                  | [2026 final instructions, page 6](https://alwaysaimhighevents.com/content/files/Anglesey-Trail-Final-Instructions-2026.pdf), visually checked                                                   | Half 08:15 and 10K 08:45 supersede generic “usually 08:30” text. Only these two distances are advertised.                                                                                                                                                               |
| Zombie Cows               | [Dated organiser page and FAQ](https://runbelievablechallenges.co.uk/attack-of-the-zombie-cows-1), linked payment page                                                                          | One eight-hour challenge from 08:30. A weather-dependent lap length is not a fixed total or five separate races.                                                                                                                                                        |
| Rosliston                 | [Organiser event index](https://rasselbock.co.uk/product-tag/marathon/) and [linked event FAQ](https://rasselbock.co.uk/event/rosliston-rumble-weekend-edition-autumn-2026/)                    | Sunday 1 November, six hours from 09:00. Preserve the original wrong-date half privately.                                                                                                                                                                               |
| Croft                     | [Dated organiser page](https://www.runninggrandprix.com/event/croft-running-festival-november-2026) and linked 2026 guide, pages 5 and 10                                                       | All eight distance starts checked; guide’s start/collection columns visually distinguished. Metric marathon explicitly 26.2 km; junior route one mile. The organiser’s metric entry link redirects to an unrelated Blackburn page, so it is not used as entry evidence. |
| London / Riverside        | [London](https://www.mo-running.com/london) and [Riverside](https://www.mo-running.com/london-richmond-riverside), including Timings sections                                                   | Separate events on 8 and 29 November. Both half 09:30, 10K 10:00, Mini 11:45; only London has 5K, at 10:00.                                                                                                                                                             |
| Shepshed                  | [2026 entrant guide, pages 2–3](https://shepshedrc.org.uk/wp-content/uploads/2026/09/Shepshed_7_2026_Entrant_Information-1.pdf) and [authorised entry](https://www.evententry.co.uk/shepshed-7) | 7mi 11:00, main race full; approximately one-mile fun run 10:00, entry on the day. Ignore unrelated injected text on the club HTML pages.                                                                                                                               |
| Brutal                    | [Organiser calendar](https://brutal.run/events) and [linked authorised entry programme](https://racesignup.co.uk/brutal-halloween-hogmoor)                                                      | Planned junior 17:45, canicross 17:55, adult 18:00. Final instructions due 30 October; no exact calendar instant is asserted yet. No 5K advertised.                                                                                                                     |
| Corofin                   | [Current authorised entry](https://eventmaster.ie/event/oOlbck3tLm)                                                                                                                             | 10 miles sold out. Latest fetch had selectable 8K tickets, so its status stays Open. Event-level 09:00 does not establish both distance starts.                                                                                                                         |
| Winter Sugar Loaf juniors | [WFRA programme](https://welshfellrunnersassociation.org.uk/en/races/winter-sugar-loaf-juniors-2026)                                                                                            | Date/age distances confirmed; programme from 11:00, registration 10:00. Separate category clocks remain unknown. Parking at Great Bettws Farm, not Fro registration car park.                                                                                           |
| Haldon / Scorrier         | [Dated Purple Gecko programme](https://www.purplegeckoevents.co.uk/halloween-twilight-run-haldon)                                                                                               | Existing 10K dates confirmed; entry pages inaccessible. Do not copy unrelated 2021 Cardinham starts. Other advertised distance/category additions remain in follow-up.                                                                                                  |
| Run to Remember           | [JustRuns upcoming events](https://justrunsevents.ie/upcoming-events) and linked 2026 Njuko URL                                                                                                 | Confirm Kildare Town / County Kildare and 5K; entry body inaccessible, start unresolved.                                                                                                                                                                                |
| Brecons                   | [Wild Running camp itinerary](https://www.wildrunning.co.uk/e/brecons-trail-fell-running-and-yoga-camp-11568)                                                                                   | Ability requirements and guided runs do not establish a ten-mile race.                                                                                                                                                                                                  |

## Publication safeguards

`fixture-quality-seventh-2026-10-26-review.mjs` has 21 exact baselines, including
15 explicit absences. The existing publisher locks, validates and audits one
transaction; a changed baseline aborts it. Only a positive explicitly reviewed
duration matching its `H` code can add a zero-kilometre timed challenge.
Unknown/fixed zero-distance additions still fail. A replay is a no-op. Seed
corrections match published edition metadata; no raw rows are deleted or moved.

Exact unsupported-distance keys also enter the shared SQL visibility gate so
filters and list cards cannot resurrect them or produce an empty card. Their
other years remain untouched. Public notes contain participant information;
source-matching rationale stays in review records.

## Checkpoint and remaining work

[The per-edition checkpoint](../fixture-reviews/fixture-quality-seventh-2026-10-26-checkpoint.json)
records all 23 selected missing-start rows through 2 November: two exact starts
resolved, nine original entries superseded/held for programme corrections, and
12 unresolved rows across eight programmes. Remaining searches are incomplete;
a blocked page or indexed snippet is not recorded as exhaustive verification.

Retry Haldon, Helvellyn, Delamere juniors, Scorrier, Ullswater, Corofin, Winter
Sugar Loaf age groups and Run to Remember on 27 October. Check Brutal’s final
instructions by 30 October. The next forward scan starts at 3 November;
Samarkand’s 8 November programme, Perth championship identity, and older
Bath/Bristol, Dorney and Polesden duplicate leads remain open. The wider catalogue
and nonblank unverified starts still require work.

## Validation

Passed: exact-batch PGlite publication/visibility/calendar regression, shared
distance-policy and prior publisher regressions, TypeScript, public-content
policy, start clarity, catalogue calendar exports, withheld-event cards and
source registry checks. Production SHA, live-page proof and final database
readback are recorded in the pull request after release.
