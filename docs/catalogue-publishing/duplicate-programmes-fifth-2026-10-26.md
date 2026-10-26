# Fifth duplicate-programme review — 26 October 2026

The owner requested continued fixture deduplication, retaining fuller distance
programmes. This batch withholds seven exact event/date listings and two incorrect
prior-day entries. Six canonical programmes retain nine confirmed race options.
Four missing options are added through the staged, validated, audited publisher.
Every original event, edition, entry option, result and dependant survives.

## Reviewed matches

| Date       | Duplicate event → retained event        | Retained options                | Opened primary evidence                                                                                                                                          |
| ---------- | --------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-11 | Leicester 3061774 and 4372659 → 3061178 | 10K and half marathon           | [LOROS organiser news, 6 October 2026](https://loros.co.uk/about-loros/news/2026/10/06/loros-nurses-among-record-5000-running-to-support-loros-at-run-leicester) |
| 2026-10-24 | Illuminator 3061776 → 3060603           | 8K, 15K, 15 miles               | [2026 athlete guide, pages 3–4](https://illuminatorrun.co.uk/wp-content/uploads/2026/10/illuminator-AG_26_2.pdf)                                                 |
| 2026-10-25 | Dublin 4380420 → 3060325                | Marathon with four runner waves | [2026 wave programme](https://irishlifedublinmarathon.ie/wave-allocation/)                                                                                       |
| 2027-01-10 | First Light 4347383 → Mobile 3881362    | Marathon                        | [Organiser-authorised 2027 timetable](https://runsignup.com/Race/MobileALMarathon/Page-2)                                                                        |
| 2027-04-03 | Prague 3061347 → 3961454                | Half marathon                   | [Exact 2027 race page](https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2/races/generali-prague-half-marathon)                              |
| 2027-04-04 | Milan 3066301 → 3060856                 | Marathon                        | [2027 organiser practical information](https://www.milanomarathon.it/en/practical-info/)                                                                         |

The same primary programmes establish that Milan's 3 April 23:00 row 71614161
and Prague's 2 April 23:00 row 71614158 are unsupported prior-day entries.
Their correct-date records already exist; no replacement date is invented.
These two corrections are counted separately from the seven duplicates.

Mobile's former First Light name is explicitly recorded in the
[Mobile County Commission minutes of 13 January 2020, agenda 31, page 22](https://www.mobilecountyal.gov/pdf/meetings/minutes/January132020.pdf).
This is identity evidence only; the current RunSignup programme establishes
2027 date and distances. The New Zealand First Light Marathon is separate.

## Distances, starts and previous values

Checked 26 October 2026; all clocks are local and exact-edition scoped.

| Programme            | Previous stored value                       | Reviewed public programme                                           |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Illuminator 71613727 | Other, 0 km, 17:30                          | Add 8K 19:00, 15K 18:45, 15 miles 18:30; keep original private      |
| Leicester 71613570   | 10K 09:15; half only on duplicate 104325407 | Keep 10K identity; add half marathon 09:15 to the same event        |
| Dublin 71613726      | Marathon 08:45                              | Explicit runner waves 08:45 / 09:05 / 09:25 / 09:45                 |
| Mobile 91005940      | Marathon, blank clock                       | 07:30 America/Chicago                                               |
| Prague 93012307      | Half, blank clock                           | 10:00 Europe/Prague; general entries full, partner-code places only |
| Milan 71829724       | Marathon, blank clock                       | Start time not yet verified                                         |

Illuminator's downloaded PDF timetable was visually inspected. Its 8K, 15K and
15-mile pages independently agree with 24 October and the three clock times:
https://illuminatorrun.co.uk/8k-night-trail-race/ ,
https://illuminatorrun.co.uk/15k-night-trail-race/ ,
https://illuminatorrun.co.uk/15mile-night-trail-run/ .
The 15-mile conversion is exactly 24.14016 km. The canonical Scotland event is
retained; the duplicate incorrectly placed Aboyne in England. Its legacy year
slug remains stable while its public heading is the current event name.

Leicester's current generic event page has rolled to 2027. The dated LOROS news
confirms the 2026 event, both distances and 09:15 from Victoria Park. The organiser's
[2026 road-closure document](https://runleicester.co.uk/wp-content/uploads/2026/09/Leicester-Half-Marathon-2026-Road-Closure-Timings-and-Access-Details-for-website.pdf)
also confirms 11 October. ResultsBase was inaccessible; no participant data is
used. The source half row remains unchanged on its original event for audit.

Dublin's 2026 wave page and its linked wave image were inspected. The first
runner wave is 08:45; later colours have distinct starts. The combined wave
label produces a date-only calendar rather than assigning every entrant 08:45.
The race-day information introduction confirms Sunday 25 October 2026; a
2025 typo in its overview is not used. Dublin's 2027 edition and all historical
result editions are unchanged and not newly verified in this batch.

Mobile is the only retained upcoming programme within the current three-month
window. Its homepage returned 503; the organiser's authorised RunSignup site,
venues/times, packet pickup, course certification, time-limit FAQ and linked
[2027 paper application, page 2](https://files.constantcontact.com/0b907939901/09ceee9c-d538-4551-97de-d3dcef0a6d8e.pdf)
were inspected. The application and specific race timetable agree on 07:30 for
10 January 2027. Packet pickup closes at 07:15; the fun run starts at 12:30.
The application is revised 16 April 2026 and explicitly identifies First Light
Community as organiser. No newer conflicting start was found. Reconfirm
3 and 8 January 2027. Additional half/relay/fun-run options are outside this
existing duplicate-pair consolidation; no existing distance is lost.

Prague's exact race page gives 3 April 2027, half marathon, 10:00. Its linked
course map is explicitly from 2026 and is not treated as 2027 evidence.
Milan's homepage confirms 42.195 km and 4 April 2027. The opened regulation and
practical-information pages supplied no race-start clock. Research remains
incomplete outside the three-month window; retain the unknown label, retry
2 November and perform the full review on entering the window. No 23:00 or
previous-year clock is reused. Eight of the nine retained options have reviewed
starts, including Dublin's wave-specific qualification; one remains unverified.

## Publication and validation

The publisher adds only Illuminator's three absent distance editions and
Leicester's absent half. It checks event identity and exact absent baselines,
stages and validates before publication, audits all four additions and rejects
concurrent changes atomically. Its unique source key is
`athrecs:duplicate-programmes-fifth:2026-10-26`.

Fresh baseline: 45 existing editions across thirteen matched events, including
historic editions and Dublin 2027. Expected readback: every original row remains
byte-for-byte intact, plus four new canonical editions. Starts on existing
records are presentation reviews; the raw values remain untouched. Seeds mirror
the added distances and replace only the exact Illuminator placeholder.

Tests cover atomic baseline rejection, original-row preservation, mile precision,
audit and replay safety, seed consistency, the actual shared fixture reader,
seven duplicate suppressions, both wrong dates, retained options and starts,
wave calendars, unrelated-date fallbacks and the held Bath/Bristol pair.
Production readback and live-page checks are recorded on the pull request.

## Remaining review

Bath/Bristol's current organiser and entry pages have rolled to 2027; its linked
Webscorer results page returned 403. Searches did not recover an authoritative
2026 programme, so its complementary 10K/half rows are unchanged. Dorney and
Polesden remain held from earlier passes. This batch does not claim that the
remaining catalogue is duplicate-free or fully source-verified.
