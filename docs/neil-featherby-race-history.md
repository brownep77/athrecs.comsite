# Neil Featherby race-history publication

Requested by the site owner on 20 September 2026. Reuses the existing public
profile `neil-featherby`, database athlete 13868, permanent ID ATH-009703.

The previous collection stored 20 historical findings only in biography and
profile metadata. This change makes those findings visible as sourced entries
in Results history and adds the earlier Berlin appearance plus seven marathon
records from Sportlink. There are 28 display entries, including 14 Great Race
stages and one grouped entry for four Norfolk Marathon wins. This is not a count
of 28 independently verified finishes.

## Evidence

- Stevenage's organiser archive confirms the 1989 men's win in 1:07:37 for
  Norfolk Gazelles; no day/month is supplied.
- MTEC confirms ninth at Grandma's Marathon in 1990, 2:23:15, but its header and
  summary disagree on the date. No invented date is used.
- Berlin's official results UI was checked on 20 September: select
  `1986 | 13. BERLIN-MARATHON`, enter `Featherby`, press Enter. It lists Neil
  Featherby, GBR, bib 86, place 22, 02:17:35. The URL does not encode this filter:
  https://www.bmw-berlin-marathon.com/en/your-race/results
- The March 1989 Belgravian, PDF page 5, records Aberdeen 1986 (England), Košice
  1987 (Great Britain), two Berlin appearances and the 2:17:35 best on the second.
  The earlier Berlin appearance remains undated. Searches of 1984 and 1985 in
  the current Berlin archive did not return a Featherby match.
- Neil's published first-person Great Race accounts supply the 14 stage times,
  distances and places, including ties at stages 6 and 7. They also imply his
  Wolverhampton win was in 1987. These entries retain athlete-reported labels.
- Sportlink reports wins at Leicester, Bungay and Norfolk (four), and thirds at
  Hong Kong, Malta, Bermuda and Luton. Dates and times are absent. Championship
  medals have not been converted into extra races or assumed to date the four
  Norfolk wins.

Every displayed row links its supporting source. Complete source URLs and
individual uncertainty notes are in `src/data/neil-featherby-reported.ts`.

## Publication and safeguards

The existing labelled-history component now supports Neil as well as David
Goggins. The data uses free-text dates, avoiding artificial January 1 dates.
It remains separate from ResultSeed, result rows, PBs and achievement totals.
No new athlete, edition or fake dated result is created. No birth date is inferred.
The existing Goggins labels and seven records are preserved. The section is
inside the Results history tab, and the profile header links to it.

Validation: type-check, focused ESLint, and
`node scripts/verify-reported-race-history.mjs`; normal PR quality gate and live
profile verification are required before reporting publication complete.
