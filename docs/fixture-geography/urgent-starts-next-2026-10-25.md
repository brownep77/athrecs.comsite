# Urgent start review: continuation on 25 October 2026

This is a bounded continuation of the original 49-edition urgent queue, not a
completed catalogue or three-month audit. Preserve the prior review and all
unvisited editions in the shared checkpoint. Publication uses source key
`athrecs:urgent-starts-next:2026-10-25`, with fresh row baselines and canonical
event IDs. The previous PR #940 broad quality run 40174751216 completed successfully.

## Reviewed corrections

- **Kyiv Unbroken, 25 October:** the organiser's current
  [programme](https://kyivmarathon.org/programa-zahodu/) and
  [regulations](https://kyivmarathon.org/polozhennya/) confirm Khmelnytskyi,
  5 Heroiv Maidanu Street. Open marathon waves begin 08:02, 10km 08:10,
  21km 08:20, 5km 11:40, all Europe/Kyiv. Later waves are explicit.
  Championship 08:00 and village opening 07:00 are separate.
  The 21km label follows the programme rather than inventing extra precision.
  Entry ended 24 October. Retain the old generic records and superseded
  10–11 October dates for audit; the revised race-day section takes precedence
  over the stale club-ranking subsection. Saturday's programme remains separate.
- **Nishida meeting, Wakayama:** the
  [federation page](https://wariku.com/result/26nishida-memorial-tournament/)
  links the [competition service](https://games.athleteranking.com/gamedata.php?gid=zha12026029).
  Its 25 October 10:30 JST heavy-rain cancellation supersedes the remaining
  Sunday timetable. Only Sunday's edition becomes Cancelled. Preserve Saturday.
- **Kokushikan fourth meeting:** the
  [university page](https://kokushikan-trackfield.com/schedule/%E7%AC%AC4%E5%9B%9E%E5%9B%BD%E5%A3%AB%E8%88%98%E5%A4%A7%E5%AD%A6%E7%AB%B6%E6%8A%80%E4%BC%9A/)
  and linked regulations confirm 7–8 November 2026, not 24–25 October.
  Two reviewed track-and-field programme days retain unknown clocks.
  Entry ended 23 October. New zero-km programmes require both the exact
  Track & field label and explicit non-distance-programme review.
- **Croatian road championships:** the federation's
  [2026 bulletin](https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf)
  confirms 31 October in Zaprešić. Its timetable is explicitly preliminary:
  3km boys/girls 11:05/11:25, 5km younger junior men/women 11:45/12:15,
  senior 10km men/women 12:45/13:40, separate ZŠĆ 5km 14:30 CET.
  Publish qualified category labels, without exact calendar clocks.
  Registration closes 28 October. Preserve the existing 31 October identity and
  hide the obsolete 25 October row; replace its generic distance programme.
- **Serbian cross-country:** the
  [federation's OpenTrack competition](https://serbia.opentrack.run/en-gb/x/2026/SRB/kros26/)
  confirms 24 October and has results. Preserve that existing edition and
  suppress the old 25 October duplicate. Individual starts were not obtained
  from the JavaScript event table.
- **Yuen Tin running:** the
  [association page](https://www.yldsal.org.hk/活動/元朗區體育節2026-元天街跑/)
  links the [Sportsoho programme](https://ytstreetrun.sportsoho.com/inline-skating-street-run).
  Running 10km 08:30, 3km 08:40 and family 1km 10:00 HKT are explicitly
  provisional. The family run is untimed and non-competitive; inline-skating
  starts must not be applied to running. Linked Google Drive regulations
  exposed only a loading/sign-in page. Exact clocks remain unresolved.
- **Sierra Leone:** the
  [Street Child FAQ](https://www.street-child.org/challenges/the-sierra-leone-marathon)
  explicitly names 25 October 2026 and approximately 06:00, although the page
  heading now advertises 2027. The authorised
  [2026 itinerary](https://street-child.wetravel.com/trips/sierra-leone-marathon-cycle-challenge-2026-street-child-45317114)
  confirms Makeni and Sunday race day, without an exact clock. Retain an
  approximate label and no exact calendar time.
- **Mamers youth:** the
  [federation fixture](https://comite72athletisme.sportsregions.fr/evenements/2026/10/25/foulees-mamertines-2544640)
  links the [entry programme](https://fr.milesrepublic.com/event/les-foulees-mamertines-17292).
  It groups 1.5km and 3km children from 09:00 CET without separate starts.
  Publish that scope, retaining unknown individual clocks and existing IDs.
- **Callao:** the [organiser](https://perurunners.com/evento/media-maraton-del-callao-10k-2026/)
  confirms 25 October, half marathon/10km and 06:30. Later race-week information
  on secondary pages reports 06:31 for both distances; the original official
  Instagram post could not be opened. Authorised Eventrid returned no extracted
  programme. Publish the two known distances with an explicit timing review,
  not either clock as confirmed.

## Remaining review

Beernem's Cycling Vlaanderen calendar did not expose its category programme.
Tokai's opened organiser site still describes an older 2025 meeting; the 2026
date/start remains unchecked. These are incomplete attempts, not evidence that
the organiser has not published a timetable. Canterbury's marathon was already
corrected concurrently to 08:30; preserve that correction. Calder Vale retains
its separate identity hold despite the related Calder Lodge postponement.
Keep all unvisited original urgent entries and prior unresolved races open.

Fourteen newly inspected research sources remain disabled for automated collection.
Existing HAS and OpenTrack registrations retain their IDs and prior evidence.
No participant rows were imported and no organiser messages were sent.

## Validation

The transaction test checks 18 audited writes (14 additions, four updates),
concurrent-edit rejection, idempotent replay, exact seed scope, retained source
placeholders and legacy URLs, cancellation/date boundaries, Europe/Kyiv's
25 October winter-time conversion, and the absence of machine clocks for
provisional, approximate, grouped and cancelled programmes.

Publishing previously truncated a supplied event slug to 80 characters, which
misidentified the existing Yuen Tin event. Explicit valid public slugs are now
preserved consistently during staging, validation and import. Generated names
continue to use the existing normalisation and length limit.

The first full CI run exposed two imported events missing from the older static
catalogue. Yuen Tin and Callao now have fallback event dependencies using their
existing production IDs; every added edition is checked for one canonical event.
