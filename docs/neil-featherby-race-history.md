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
- MTEC lists Neil Featherby of England ninth at Grandma's Marathon in 1990,
  2:23:15. The identity match to Norwich’s Neil still needs corroboration,
  and its header and summary disagree on the date. No invented date is used.
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

## Explicit unverified status — 20 September 2026

The owner clarified that all 28 entries should be included as Neil’s races
but remain unverified. The section and profile count now say Unverified,
and every race badge starts with Unverified while retaining the source type.
This includes Berlin 1986 despite its stronger source evidence. Grandma’s
entry also explicitly retains the unresolved identity match. No race, time,
placing or source is removed; no verified result row is created.

## Race list and PB inclusion — owner clarification, 20 September 2026

The owner clarified that the entries should count as Neil’s races and feed his
PBs, with the caveat “Not verified by chip time”. This supersedes the earlier
blanket PB exclusion for this profile.

All 28 existing entries now appear in the main results table and its count,
search and year/sport filters. Each row retains its original date text, source
links and unresolved details, alongside the chip-time caveat. No exact dates,
chip times, gun times, result IDs or extra editions have been manufactured.
The 14 Great Race stages remain stages; four Norfolk wins remain one grouped
record. These rows do not mint verified medals or rankings.

The PB strip includes four explicitly sourced candidates:
- 10K 29:28 and 10 miles 49:47: Sportlink biography (checked 20 September 2026);
  the race and date are unknown, so these PB claims do not create extra races.
- Half marathon 1:07:37: Stevenage 1989 organiser winners archive.
- Marathon 2:17:35: Berlin 1986 organiser archive, corroborated by the club journal.

The headline calculation chooses one fastest candidate per comparable distance
and surface. Each reported PB has a PB* marker and the chip-time caveat. This is
an explicit Neil-only opt-in; other athletes’ unverified histories retain their
existing exclusions. Any separate identity uncertainty, including Grandma’s,
remains stated in the race row.
