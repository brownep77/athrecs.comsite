# Further urgent start review — 25 October 2026

This bounded pass follows the original 49-entry urgent queue. It is not a complete
three-month source review. Source key: `athrecs:urgent-starts-third:2026-10-25`.
Fifteen edition writes are staged against fresh canonical-event baselines:
four existing Maule editions and eleven category/date additions. Thirteen clocks
are confirmed for the stated category or first gun; two remain qualified unknowns.
The old Changsha date and two generic source rows remain stored for audit.
Maule’s four clocks were filled concurrently before merge; the refreshed
baseline preserves those notes and clocks. This pass reconfirms them and adds
closed-entry status and public schedule clarity. Nine category/first clocks
are new additions; four are independently reconfirmed.

## Confirmed programmes

- **Maule Corre, 25 October:** the [organiser](https://www.maulecorre.cl/index.html)
  links the [2026 regulations](https://www.maulecorre.cl/documentacion/bases2026.pdf)
  and [authorised GUCA entry](https://guca.cl/att_tickets/public/e/770/80-maule-corre).
  PDF section 3 and its matching [programme image](https://guca.cl/documentos/maulecorre/01programa.png)
  give 800m 09:00 and 3/5/10km 09:30, America/Santiago (UTC−3).
  The image was visually inspected. Opening/kit collection at 08:00 is separate.
  Online and office entry ended 18 October; preserve edition IDs and close entry.
  A second older-linked rules PDF was also attempted; the current 2026 PDF and
  authorised programme agree on the race clocks.
- **Changsha:** [current regulations](https://www.marathonchangsha.com/Detail/30)
  contain an image inspected visually, including the date, categories, start
  zones, multiple-gun clause and registration timetable. They confirm
  **15 November 2026, event first gun 07:00 Asia/Shanghai (UTC+8)**.
  [Organiser news](https://www.marathonchangsha.com/Detail/402) independently
  repeats that date and first gun; the [2026 FAQ](https://www.marathonchangsha.com/Detail/362)
  confirms marathon/half-marathon distances, common start by Du Fu Jiang Ge,
  and general entry closing 11 August. The old AIMS-based 25 October date is
  withheld. The marathon first gun is explicit; the half-marathon wave is
  **not** assigned 07:00 because its runners occupy mixed later zones.
  [Pickup instructions](https://www.marathonchangsha.com/Detail/31) still say
  forthcoming. Current organiser news was checked; later wave clocks remain open.
- **Ukrainian cross-country, Sunday 25 October:** the
  [federation calendar](https://uaf.org.ua/calendar-flau/) links the
  [draft programme](https://uaf.org.ua/images/otherdocuments/calendar/2026/2026.10.24-25_uzhhorod/2026.10.24-25_rozklad2.pdf),
  regulations and [live competition timetable](https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live).
  The live table was retrieved directly when the search reader failed. Its
  Sunday section confirms U23 women 6.4km 10:30, U23 men 6.4km 11:05,
  senior women 8km 11:45, senior men 8km 12:30, Europe/Kyiv (UTC+2).
  Publish separate categories at Zolota Hora, Barvinok, near Uzhhorod.
  The draft-only mixed youth/junior 4×1km relay at 13:20 is absent from the
  live table: retain it as unconfirmed with no exact calendar clock.
  Do not apply the adjacent cancelled All-Ukrainian III-stage listing to
  these national championships. Saturday remains unaffected. No results imported.
- **Beernem youth cyclo-cross, 25 October:** the
  [federation calendar](https://cycling.vlaanderen/competitie/kalender)
  uses public race-detail data. Its observed calendar script identified the
  same public endpoint used to open each category:
  [U12 / 15032](https://cycling.vlaanderen/actions/cycling-api-module/api?method=races/15032.json),
  [12 years / 15033](https://cycling.vlaanderen/actions/cycling-api-module/api?method=races/15033.json),
  [13 years / 15096](https://cycling.vlaanderen/actions/cycling-api-module/api?method=races/15096.json),
  [14 years / 15097](https://cycling.vlaanderen/actions/cycling-api-module/api?method=races/15097.json).
  Starts are 10:00, 13:30, 14:15 and 15:00 Europe/Brussels (UTC+1).
  These are duration-based races at Sportpark Drogenbrood, not fixed distances.
  The federation's [calendar guide](https://dejuistecadans.be/artikelenbibliotheek/waar-kan-je-de-kalender-vinden-en-hoe-interpreteer-je-deze-per-discipline/)
  confirms that the third `U` clock is the start; the first two are registration.
  The national calendar and West Vlaanderen officials PDF also confirm this date.

## Further attempts and open work

The [Piauiense Sub-23 page](https://fpiatletismopiaui.org.br/competicoes/eventos/festival-piauiense-de-atletismo-sub-23),
calendar, linked registration form and event banner were inspected. The banner
advertises 24 October at UFPI, Teresina. No individual start or explicit second
day was verified. Retain the existing rows and an open date/start investigation;
do not interpret an initial date alone as proof of cancellation on 25 October.

Roraimense's federation website was inaccessible; Tokai searches led to older
meetings; Chile's Mixto and Sri Lanka Army searches did not supply opened final
programmes. These remain unchecked, with completed attempts retained. Unvisited
urgent editions remain visible. SMH's stored 5km was corrected concurrently to
10:45. The entry page failed in the search reader but direct retrieval succeeded:
its 2026 timetable confirms both junior and OPEN 5km at 10:45. This is an
independent recheck of the concurrent correction, with no additional database write.

Four new research sources remain disabled. Existing registrations and historical
check notes are preserved. No messages were sent to organisers.

## Validation and release

The focused transaction test covers all 15 writes, exact canonical IDs,
concurrent-change rejection, idempotency, source-row retention, static fallback
parity, date/category scope, unknown calendar clocks and winter-time conversion.
Zero-distance additions require an explicit reviewed non-distance programme and
a named supported track/field or youth cyclo-cross category; `Other` remains
ineligible. Page copy is scoped to the reviewed edition.

The preceding passes' broad CI runs 40179200890 (PR 949) and 40179983871
(PR 953) completed successfully. Production publication and live readback for
this pass are recorded in the shared timing checkpoint after deployment.

## Live-page follow-up

Revision 380 published 15 editions (11 inserts and four Maule reconfirmations).
The production readback exposed a calendar distinction: a qualified start label
intentionally creates a date-only reminder. Removed redundant labels from the
12 exact single-category starts and verified the real catalogue-to-calendar
adapter. Changsha's first-gun label remains qualified because assigned waves
can start later; its half marathon and the Ukrainian relay remain unconfirmed.

The reviewed edition now supplies the page's category list, so Ukraine and
Beernem no longer retain an unknown-distance heading. Multi-race days across
all sports point to individual category starts in the headline and key facts.
Beernem's cards use the reviewed public notes. Maule's official entry option
shows closed for 25 October only, preserving other entry routes and years.
