# Hamburg half-marathon start clarification

Checked 25 October 2026 against the opened organiser FAQ:
https://www.hamburg-halbmarathon.de/faq_0726/

The 25 October 2026 half marathon starts in blocks A–G at 09:30, 09:45,
10:00, 10:15, 10:30, 10:45 and 11:00 respectively. These are local Hamburg
times (Europe/Berlin, CET / UTC+1). Participants follow their allocated block.
09:30 is the first wave, not a common start for all runners.

The live event `wa-32-hella-hamburg-half-marathon-7238156` (ID 3065198)
contained two records for the same race date:

| Edition ID | Distance code | km | Stored start | Original source |
| --- | --- | --- | --- | --- |
| 71829679 | Half | 21.0975 | 09:30 | https://www.aims-worldrunning.org/events/7286.ics |
| 71614975 | Other | 0 | 09:30 | https://worldathletics.org/competition/calendar-results/results/7238156 |

Both notes already contained the seven organiser start blocks from an earlier
check. The public list nevertheless displayed the internal `Other` distance
as another start option. The reviewed placeholder suppression now applies to
this exact event/date/distance across public fixture, calendar, place and race
detail views. The original source record remains stored for audit; no result,
athlete, entry link or source history is deleted. Other dates are unaffected.
The same suppression applies to the legacy source seed, so re-seeding cannot
restore this duplicate to the public programme.

The edition-specific presentation includes the first-wave label, all block times,
the local zone and the organiser instruction. Calendar exports remain date-only reminders until the runner knows their
assigned block, with the first-wave qualification and full wave programme.
The general European time-zone label also now follows actual IANA clock-change
rules, correcting the previous month-based CEST label on 25 October.

Shared display helpers replace generic distance placeholders with explicit
missing-distance wording, or their stored numeric distance when supplied.
The clock formatter rejects placeholders and invalid clocks instead of adding
a time-zone suffix to arbitrary text. Unknown races are retained; they are
not assumed to be duplicates or assigned another race's distance or time.
