# October 2026 confirmed distances — 26 October follow-up

The owner's request is that October races have confirmed distances. This is a source-reviewed follow-up, not a claim that every October catalogue record is verified.

## Published

Batch `fixture-october-distances-20261026-b` was rehearsed on an isolated branch, validated, and published to catalogue revision **393**. Five existing editions were corrected and nine additional distance editions inserted across five events. Nineteen before/after audit entries retain the previous event and edition values. Production readback matched all 14 entries.

| Date | Event | Confirmed programme |
| --- | --- | --- |
| 28 October | East Anglian XC League Race 1, Stowmarket | Approximately 4 miles and 5.6 miles, 14:00 |
| 31 October | North District XC League Race 1, Grantown | 1.7K, 3.4K, 4.3K, 5.7K and 8K; category starts 13:15–14:15 |
| 31 October | North Yorkshire & South Durham Harrier League, Fox Rush | 2K, 2.8K, 3.2K, 5.8K and 8.6K; category starts 11:00–12:15 |
| 31 October | Phoenix Manchester Hoofs, Horns and Paws Charity Run | 7-hour timed event, 08:30–15:30; no invented fixed total |
| 31 October | World Triathlon Para Cup San Pedro de la Paz | 750m swim / 20K bike / 5K run, 07:30 first wave |

Exact category/wave start labels and local timezones are retained in `confirmed-distances-2026-10-26.json`. The seed corrections preserve canonical event IDs and prevent a seed refresh from reinstating the corrected placeholders.

## Primary sources inspected

- East Anglian league: https://eaccl.org.uk/winter-events/
- North league: https://sites.google.com/view/the-northleague/31st-of-october-26-grantown and its linked 2026 Grantown programme, https://drive.google.com/file/d/1Z2lGCnPNZyT1hK-OTYzw-Y3wmDmJcZZP/preview
- Fox Rush instructions linked by participating club https://tasharriers.club/cross-country/: https://docs.google.com/document/d/1XJHsvP1WBxlgQyrswPc9hr2jLzctENAaVWITJbe-EtE/edit
- Phoenix organiser: https://www.phoenixrunning.co.uk/events/manchester-hoofs-horns-and-paws-charity-run and authorised entry: https://www.evententry.co.uk/phoenix-manchester-hoofs-horns-and-paws-charity-run
- San Pedro organiser course description: https://www.wcsanpedro.cl/noticias/24466; edition date: https://triathlon.org/events/2026-world-triathlon-para-cup-san-pedro-de-la-paz

Phoenix sources disagree on lap length (2.91 versus 3.28 miles). The confirmed duration is published; lap length remains unresolved. San Pedro's previously checked first-wave start is retained, separately from the fresh course-distance check.

## Publication safety and presentation

The publication checked the expected catalogue revision, complete event and edition snapshots, entry options, pending import overlaps, exact target identities and equivalent-distance collisions inside a transaction. No events or editions were merged or deleted. Corrected directory-derived public entry URLs were replaced with inspected primary sources, while original evidence remains in the private audit.

The event-detail header previously retained an obsolete unknown badge because an orphan `event_distances.Other` label had no matching edition. The projection now derives generic labels only from confirmed numeric editions and omits unsupported placeholder badges. Historical records remain unchanged. Regression cases cover orphan placeholders, generic codes with numeric evidence, timed formats, approximate distances and multi-sport courses.

## Remaining scope

After this batch, four running placeholder records remain dated 26–31 October:

- Santa Cruz: governing-body date and reported race date disagree; primary organiser evidence is inaccessible. Do not infer 10K from the title.
- Race You To The Summit: organiser/FRA 4.3 miles/7km conflicts with the fresh organiser-linked entry programme's 7.40km. Junior distances are explicit, but overlapping ready imports need reconciliation before publication.
- Croatian road championships: an older generic row remains behind the public hold; confirmed 3K/5K/10K editions already exist.
- Petzl Delamere: an older ResultsBase placeholder remains behind the public hold; the canonical event already has confirmed 1K/10K/half-marathon editions.

There are also **203 historical running placeholder records from 1–25 October**: 170 Other, 28 Cross Country, 3 Ultra and 2 Fun Run. Fifty-six have at least one numeric edition for the same event/date, which is a duplicate-review candidate count, not a source-verified merge decision. These historical records have not all received fresh primary-source review. Fifty-two October timed entries are separate and do not require an invented numeric kilometre total. Track-and-field meetings and other sports require programme-specific review.

The outstanding genuine upcoming cases and Phoenix lap conflict should be rechecked on **27 October 2026**. Do not label the month complete. Preserve unresolved source conflicts and the staff review queue.

## Rollback

The immutable database audit holds exact before/after records. Since some distance codes changed in place, a rollback must explicitly restore `before.record.distance_code` as well as the other audited fields; the legacy generic rollback does not restore that code. Do not blindly replay or reverse the publication.
