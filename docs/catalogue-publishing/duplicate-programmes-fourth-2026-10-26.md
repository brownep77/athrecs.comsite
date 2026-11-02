# Fourth duplicate-programme review — 26 October 2026

The owner requested continued fixture deduplication, retaining the fuller distance
listing. This batch withholds eight exact event/date listings from public fixtures
and calendars. Original events, editions, entry options and dependants survive.
It retains eleven race options across eight canonical programmes, including two
newly published November Nightmare distances. No athlete or result data changes.

## Reviewed matches

| Date       | Duplicate event → retained event     | Retained options            | Opened primary evidence                                                      |
| ---------- | ------------------------------------ | --------------------------- | ---------------------------------------------------------------------------- |
| 2026-10-18 | Detroit 3060293 → 3580912            | Marathon                    | https://www.freepmarathon.com/marathon/                                      |
| 2026-10-18 | Palma 4229801 → 3060974              | Half, marathon              | https://www.avaibooksports.com/inscripcion/tui-palma-marathon-mallorca-2026/ |
| 2026-11-01 | November Nightmare 4375834 → 3060938 | 8 miles, 16 miles, marathon | https://www.codrc.co.uk/e/the-november-nightmare-12273                       |
| 2026-11-13 | York 3061720 → 3147979               | 5K with two start groups    | https://racebest.com/races/r4ag4                                             |
| 2026-11-29 | Seattle 3061265 → 4166992            | Marathon                    | https://www.seattlemarathon.org/marathon-and-half-marathon                   |
| 2027-02-05 | Dead Sea 3066368 → 4104287           | Marathon                    | https://deadsea.run/en/event/42km/                                           |
| 2027-05-02 | Vancouver 3066379 → 3642557          | Marathon                    | https://bmovanmarathon.ca/marathon                                           |
| 2027-06-13 | Phuket 3066387 → 3757295             | Marathon                    | https://phuketmarathon.com/race-information/                                 |

Eight race-distance rows repeat retained options. Two additional rows on the
Nightmare duplicate are incorrectly labelled 10K and standard half marathon.
All ten raw rows remain unchanged. The authorised programme explicitly offers
8 miles and 16 miles instead. The existing marathon ID 71613833 survives; the
two additions use exact mile conversions (12.874752 and 25.749504 km).

## Starts, evidence and original values

Checked 26 October 2026. Times are local and scoped to these editions only.

| Retained edition                        | Previous stored start | Reviewed public start              | Decision                                                                                                         |
| --------------------------------------- | --------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Detroit 83428472                        | blank                 | From 07:00, three-minute waves     | Exact 18 October 2026 marathon programme; duplicate 06:00 is unsupported.                                        |
| Palma Half 71613686 / Marathon 71829676 | 07:00 / blank         | Unverified / unverified            | Entry service confirms 18 October; its 08:00 event summary does not establish either distance's start.           |
| Nightmare 71613833 + two additions      | 09:00 / absent        | All 09:00 GMT                      | Organiser entry categories 65732, 65733 and 65734 explicitly date all three choices to 1 November 2026 at 09:00. |
| York 74248402                           | 19:30                 | Open 19:30; Super Sprint 20:00 GMT | Dated November entry programme supersedes generic one-wave series text.                                          |
| Seattle 97921468                        | 07:00                 | 07:00 PST                          | Exact 2026 full-marathon timetable agrees with authorised entry.                                                 |
| Dead Sea 96360539                       | blank                 | 06:15 Asia/Jerusalem               | Exact 2027 marathon course page; 06:00 is gate opening.                                                          |
| Vancouver 84988317                      | blank                 | 08:30 America/Vancouver            | Marathon page explicitly supplies 2 May 2027 and its clock time.                                                 |
| Phuket 87885443                         | blank                 | 03:00 Asia/Bangkok                 | 13 June 2027 timetable labels this the new marathon start.                                                       |

The three retained in-window programmes have five source-confirmed distance
options. Nightmare's organiser page, embedded entry categories and authorised
Find a Race booking page agree:
https://findarace.com/events/the-november-nightmare . The organiser lists no
separate race-day PDF on that page. Reconfirm on 30 October (two days before).
Only the existing 1 November fixture is consolidated here; starts and missing
fixtures for 2–8 November remain outside this batch.

York's organiser page https://evensplits.events/york5k lists 13 November and
authorises RaceBest. Its generic one-wave statement conflicts with the exact
November entry options, which explicitly sell Open and Super Sprint categories.
The linked participant instructions are labelled February 2024 and return 403:
https://evensplits.s3.eu-west-2.amazonaws.com/York%2B5K/York%2B5K%2Binstructions%2BFEB24.pdf .
No 2024 clock is reused. Reconfirm 6 and 11 November. The combined wave label
produces a date-only calendar event rather than assigning all entrants one time.
Other York dates are unchanged and are not newly verified by this review.

Seattle's organiser timetable, FAQ https://www.seattlemarathon.org/faq and linked
authorised registration were inspected:
https://raceroster.com/events/2026/112954/2026-uw-medicine-seattle-marathon-and-half-marathon .
The specific full-marathon start is 07:00; the half's 08:30 is separate.
Reconfirm 22 and 27 November. No unresolved retained in-window clock is claimed
as complete; this does not constitute a catalogue-wide start review.

Palma's 2026 authorised entry categories were inspected at
https://www.avaibooksports.com/inscripcion/tui-palma-marathon-mallorca-2026/participantes/?lang=en&pagina=7 .
Only race-category labels support this fixture review; no participant records
are copied or changed. Current organiser race-info pages have rolled to 2027.
The German athlete-guide page exposed a 2026 PDF link which returned 403, while
a direct page read now says the guide will be available before the race:
https://www.palmademallorcamarathon.com/deutsch/race-info/athlete-guide .
The older league site is stale; another league-branded page was not used because
its provenance was unclear. Both historic distance clocks remain inaccessible/
unverified, with originals preserved. A later historical guide recovery can
resolve them; no 2027 or general 08:00 clock is copied into the 2026 distances.

## Guarded publication and verification

The publication helper checks an exact live baseline for Nightmare, stages and
validates the additions through the existing catalogue workflow, records the
before/after audit and rejects concurrent changes. A unique source key makes
replay idempotent. Seeds receive the same three-distance programme. Exact-date
suppression is reversible; no global event alias or database deletion is added.

Baseline snapshot: 21 existing edition rows across the sixteen matched events,
including two other York dates. Expected readback: all 21 IDs survive unchanged
except the existing Nightmare marathon receives an appended evidence note; two
new canonical editions are added. Projection-only starts leave raw clocks intact.

Validation covers actual staged publication, baseline concurrency rejection,
unchanged duplicate rows, exact mile conversions, canonical identity, audit,
replay and seed consistency. Shared fixture-reader checks cover all eight
suppressions, retained options, starts, wave calendars and other-date controls.
Production readback and live-page proof are recorded on the pull request.

## Remaining candidates

Dorney's old dated organiser URL returns no programme; Polesden's current
National Trust page has removed the October occurrence. Neither is changed
without recovering edition-specific evidence. Illuminator and Samarkand need
their confirmed distance programmes consolidated before removing placeholders.
Bath/Bristol, Run Leicester and other complementary-distance splits remain
separate until their unique options can be preserved. Mobile's organiser page
returned 503. These holds are not assertions that the remaining catalogue is
duplicate-free.

## Live release and recommendation follow-up

PR #1001 deployed commit `612147c5aaaf6d5199f3536ccc39de6df8ee17e6`.
Publication batch `4f175a7e-28ce-403a-981c-523b0e2bb715`, revision 396,
is published with three audited changes. The new 8-mile and 16-mile edition IDs
are 109710392 and 109710393. All 21 baseline IDs survive; only the existing
Nightmare marathon's evidence note changed. There are now 23 rows in this scope.

The live race-detail inspection also exposed a related-card gap: an event whose
only edition is withheld could still be recommended as “Date TBC”. The follow-up
filters both general event cards and nearby recommendations only when every
recorded edition is withheld. Genuinely undated events, other unreviewed dates
and valid historical editions stay available; direct records remain untouched.
The regression runs both actual SQL queries against a disposable database and
checks each of those cases, including that all stored rows remain unchanged.
