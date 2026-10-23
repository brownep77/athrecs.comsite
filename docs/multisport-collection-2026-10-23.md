# Multisport collection and directory expansion — 23 October 2026

The directory now links every one of the 11 sport sections to its fixtures,
results and athlete collection. Organisation profiles show the collections for
their reviewed remit; funding bodies show all 11. Athlete filters currently group
cycling disciplines under Cycling, and road/trail athletes under Running. The
links state this scope and do not imply discipline-specific athlete membership.

## Source-compared data publication

Owner-authorised batches `multisport-public-20261023` and
`multisport-fixtures-20261023` were rehearsed on an isolated database branch and
then published. Existing athlete identities and catalogue records were preserved.
Private source captures, row comparisons, held matches, nationality provenance and
publication receipts are retained in the staff database, not in this repository.

| Provider | New athlete profiles | Published performances | Explicit sporting nationalities |
| --- | ---: | ---: | ---: |
| World Triathlon | 81 | 81 | 81 |
| World Aquatics | 4 | 75 | 4 |
| Total | 85 | 156 | 85 |

The triathlon batch covers the 2026 Pontevedra elite men's/women's programmes
and Zofingen long-distance duathlon elite men's/women's programmes. Official JSON
rows were compared with the official XLSX export by programme/athlete/result IDs,
bib, names, nationality, date, distances, finish status, time, supplied placing and
named splits. Zofingen's published component distances are 10.8/148.2/26.7 km.
The two Run columns were mapped separately. Conflicting nation codes and
non-finishes were held. The 81 programme-result mirrors link the same performances
to the event graph and are excluded from duplicate profile display.

Swimming observations come from four official World Aquatics athlete PB tables.
Exact cells were compared with two independent parsers. Source pool length,
date and hundredth-second precision are preserved; absent round and numeric
placing remain empty. Relays and historical junior observations were held.
These are source-listed PB observations, not complete swimming meet results.

All 156 published performances carry source verification. This does not verify
account ownership or civil citizenship. Each nationality is an explicit sporting
nationality reported by the governing-body source. Profiles remain unclaimed
provisional identities; no residence or exact date of birth was inferred. The
full existing athlete/alias directory and account candidates were screened;
37 possible existing/similar identities were held without merging. Separately,
83 source/scope observations were held. These counts are not a count of unique
unpublished people.

Public athlete profiles retain performance and nationality labels while source
URLs, row evidence and research notes remain in staff views. Event results retain
provider credit. New World Triathlon, World Aquatics and UCI source records are
registered for supervised review, with automated collection disabled.

## Sixteen future fixture editions

These are 12 meeting identities with 16 dated editions, all checked against the
existing Cycling/Swimming inventory and opened official announcements. Start times,
individual race distances and entry status were not supplied and remain unknown.

| Meeting | Confirmed date(s) |
| --- | --- |
| Swimming World Cup — Berlin | 15–17 October 2027 |
| Swimming World Cup — Paris | 22–24 October 2027 |
| Swimming World Cup — London | 29–31 October 2027 |
| Open Water World Cup — Cancún | 6–7 November 2026 |
| Open Water World Cup — Somabay | 19–20 March 2027 |
| Open Water World Cup — Golfo Aranci | 30 April–1 May 2027 |
| Open Water World Cup — Setúbal | 28–29 May 2027 |
| Track World Cup — Milton | 2–4 April 2027 |
| Track World Cup — Hong Kong | 23–25 April 2027 |
| BMX World Cup — Sakarya | 12 June (round 3), 13 June (round 4), 2027 |
| BMX World Cup — Sarasota | 31 October (round 9), 1 November (round 10), 2026; 2 October (round 7), 3 October (round 8), 2027 |
| Masters Mountain Bike Worlds — Nevados de Chillán | 24–28 March 2027 |

The June 2026 UCI update supersedes the older Sarasota 2026 round numbering.
The September 2026 decision moves the Chile championship from 17–21 to 24–28
March 2027. Unannounced locations were excluded; no recurrence was inferred.
Track and BMX retain their explicit public sport/surface mappings; their optional
network discipline IDs remain empty because the current network taxonomy has no
corresponding codes. They are not assigned to road cycling.

Primary fixture references:

- [2027 Swimming World Cup](https://www.worldaquatics.com/news/4596230/swc-2027)
- [2026/27 Open Water World Cup](https://www.worldaquatics.com/news/4594549/world-aquatics-reveals-open-water-swimming-world-cup-202627-calendar-as-sport-builds-towards-budapest-2027)
- [UCI 2026–2028 track and BMX calendars](https://www.uci.org/pressrelease/the-uci-unveils-the-calendars-for-the-2026-to-2028-editions-of-the-uci-world/2OgvKmKB5XbtoUcQgAH55b)
- [UCI June 2026 BMX update](https://www.uci.org/pressrelease/2026-uci-bmx-racing-world-cup-expands-with-confirmation-of-four-chinese-rounds/3WHWdvBAFaR3PliNDcoCt0)
- [UCI September 2026 decisions](https://www.uci.org/pressrelease/uci-management-committee-met-in-montreal-and-took-several-key-decisions-for-the-2027-season/3j98hCXlGoOJKJn5EyZiLM)

## Twelve national federations

China, Chinese Taipei, Nepal, Vietnam, Sri Lanka and Macau each gain a triathlon
and swimming federation. The directory totals 337 organisations, including 289
national federations across 75 countries/territories. All preceding 325 records
are unchanged.

Names and affiliation were checked against the actual World Triathlon member
profiles and [World Aquatics member directory](https://www.worldaquatics.com/members/national-federations).
Vietnam's triathlon federation and Sri Lanka's aquatics union have verified
standalone destinations. The other ten use explicitly labelled official member
pages/directories where a usable standalone destination could not be verified.
Only Vietnam receives a new duathlon mapping, supported by its explicit remit.
Each record retains its actual source URLs and 23 October review date.

## Validation and scope

Directory/reference/filter checks, source-registry checks, focused ESLint, TypeScript
and the Vite application build (`build:dev`) passed. The 325 prior records were compared
structurally. Every new source-history payload passed the application schema.
Both database batches passed an isolated rehearsal and independent production
readback; public profile samples passed content and evidence-privacy checks.

This is a bounded addition across the listed sports, not a claim that every sport,
country, fixture or athlete is complete or that the wider catalogue was reverified.
