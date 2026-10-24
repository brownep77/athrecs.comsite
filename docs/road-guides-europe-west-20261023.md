# Spain, Portugal and Germany road-race guide evidence

Checked: **23 October 2026**. Scope: six marathon guides and six half-marathon guides, in the six new country data modules. The shared guide renderer, country registries, routes, sitemap and search notification integration are handled separately.

## Edition decisions

Only confirmed dates appear in `editions`. Historical schedules are explicitly labelled by year. A provisional date is an editorial note and must not become an Event `startDate`.

| Guide slug                | Confirmed dates recorded in `editions` | Edition qualification                                                           |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| `valencia-marathon`       | 2026-12-06                             | No confirmed 2027 date found in checked organiser material.                     |
| `barcelona-marathon`      | 2027-03-14                             | Date and runner timetable from the 2027 regulations.                            |
| `lisbon-marathon`         | None                                   | Completed 2026 edition remains in history; next date TBC.                       |
| `porto-marathon`          | 2026-11-08                             | 2026 rules; no recurrence inferred for 2027.                                    |
| `berlin-marathon`         | 2027-09-26                             | New GENERALI title/domain for 2027; course map still identifies 2026.           |
| `frankfurt-marathon`      | 2026-10-25; 2027-10-31                 | Current course page and new 2027 registration page establish separate editions. |
| `valencia-half-marathon`  | 2026-10-25                             | SuperHalfs lists 2027-10-24 provisionally; retained only in `dateNotes`.        |
| `barcelona-half-marathon` | 2027-02-14                             | The 2027 regulations override stale year/date text in the webpage title.        |
| `lisbon-half-marathon`    | 2027-03-07                             | Both conflicting official start times retained with TBC.                        |
| `porto-half-marathon`     | 2027-09-19                             | Homepage establishes date; rules, course and logistics still describe 2026.     |
| `berlin-half-marathon`    | 2027-04-04                             | Edition-specific race-day page confirms date and waves.                         |
| `cologne-half-marathon`   | None                                   | Completed 2026 edition retained in history; 2027 TBC.                           |

## Important editorial decisions

- **Lisbon half marathon:** the opened 2027 programme displays 09:20. Article 1 of the 2027 regulations displays 09:30. No clear supersession was found. The guide preserves **09:20 / 09:30 — TBC**, specifies local time, and points to both sources. Search snippets alone sometimes displayed a different time from the opened programme and were not used to resolve it. Mass participants and elite athletes have different starting locations.
- **Porto half marathon:** the 2027 date is confirmed independently of the old practical details. The 2026 start, limit and route are labelled historical reference, with 2027 details awaiting publication.
- **Frankfurt:** the general information page mixes years and contains inconsistent wave text. The guide does not repeat that wave schedule or carry over its limits to 2027. The 2027 registration page supports the advertised 10:00 start, subject to final wave instructions.
- **Berlin marathon:** the site now redirects from the former BMW domain to the new GENERALI domain. The new title applies to 2027; historical results are not renamed. The course page explicitly says that its displayed map is still the 2026 version.
- **Barcelona:** unrelated commercial/spam material appeared in the parsed official pages. It was excluded completely. Only coherent race-specific content, regulations, course information and official results navigation were used.
- No prices, unconfirmed entry capacity, predicted recurrence, weather promises, record claims or athlete performances were invented. Individual result rows were not imported or marked verified. Results hubs are labelled as hubs, and provisional classifications retain that qualification.
- All 12 slugs were checked against the pre-existing road-guide inventory before creation. No standalone duplicate was found. Lisbon, Valencia and Berlin half marathons already appeared as summaries in the SuperHalfs page; these new records provide their standalone road-race guides.

## Opened primary sources

The URLs below were opened and inspected. The corresponding records also retain them in `sources`, `course.links`, practical fields and edition provenance.

### Spain

**Valencia Marathon**

- [Official event](https://www.valenciaciudaddelrunning.com/en/marathon/maraton/)
- [2026 entry status and routes](https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/)
- [Course](https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/)
- [Regulations](https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/)
- [Previous editions and results](https://www.valenciaciudaddelrunning.com/en/marathon/previous-editions-marathon/)

**Barcelona Marathon**

- [Official event](https://zurichmaratobarcelona.es/en/)
- [Course](https://zurichmaratobarcelona.es/en/i-am-a-runner/course/)
- [2027 regulations](https://zurichmaratobarcelona.es/en/i-am-a-runner/regulation/)
- [Results archive with Sportmaniacs links](https://zurichmaratobarcelona.es/en/i-am-a-runner/results/)

**Valencia Half Marathon**

- [Official event](https://www.valenciaciudaddelrunning.com/en/half/half-marathon/)
- [Course](https://www.valenciaciudaddelrunning.com/en/half/course-half-marathon/)
- [2026 regulations](https://www.valenciaciudaddelrunning.com/en/half/regulations-valencia-half-marathon/)
- [Runner guide and 2027 entry announcements](https://www.valenciaciudaddelrunning.com/en/half/race-guide/)
- [SuperHalfs calendar and provisional-date qualification](https://www.superhalfs.com/en/faqs/)
- [Results archive](https://www.valenciaciudaddelrunning.com/en/half/rankings-half-marathon/)

**Barcelona Half Marathon**

- [Official event, now Hyundai Mitja Marató Barcelona by Brooks](https://www.mitjamarato.barcelona/en/)
- [Course](https://www.mitjamarato.barcelona/en/i-am-a-runner/course/)
- [2027 regulations and sub-elite entry](https://www.mitjamarato.barcelona/en/i-am-a-runner/regulation/)
- [Results archive with Sportmaniacs links](https://www.mitjamarato.barcelona/en/i-am-a-runner/results/)

### Portugal

**Lisbon Marathon**

- [2026 organiser event page](https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/)
- [2026 regulations, articles 1–3 for date, duration and route](https://maratonaclubedeportugal.com/wp-content/uploads/Rules_EDP_Lisbon_Marathon_OUT2026_EN-1.pdf)
- [2026 provisional results on Sporthive](https://sporthive.com/events/s/7391338081590568960), followed from the organiser’s results link.

**Lisbon Half Marathon**

- [2027 programme, mass-race access and results navigation](https://maratonaclubedeportugal.com/en/corrida-marco/edp-lisbon-half-marathon/)
- [2027 regulations, including the conflicting start time and separate elite start](https://maratonaclubedeportugal.com/wp-content/uploads/REGULAMENTO_EDP_MEIA_MARATONA_DE_LISBOA_2027_EN.docx.pdf)
- [2026 results on Sporthive](https://sporthive.com/events/s/1555368b-34b0-4964-9cff-b798f3212bf0), followed from the organiser’s results link.

The Sporthive URLs returned application shells in the reader. Their exact event URLs and the organiser’s result labels were inspected; no participant result comparison is claimed.

**Porto Marathon**

- [Official event](https://www.maratonadoporto.com/en/)
- [2026 rules](https://www.maratonadoporto.com/en/rules-2026/)
- [2026 participant information](https://www.maratonadoporto.com/en/information-2026/)
- [2026 course maps](https://www.maratonadoporto.com/en/course-2026/)
- [2025 results and media hub](https://www.maratonadoporto.com/en/results-fotos-2025-2025/)

**Porto Half Marathon**

- [Official event and 2027 date](https://www.meiamaratonadoporto.com/en/)
- [2026 rules and detailed street route](https://www.meiamaratonadoporto.com/en/rules-2026/)
- [2026 participant information](https://www.meiamaratonadoporto.com/en/information-2026/)
- [Course-map page](https://www.meiamaratonadoporto.com/en/course-2026/)
- [2026 provisional results](https://www.meiamaratonadoporto.com/en/results-2026/)

The web reader returned 502 for the Porto domains. Normal read-only HTTP requests to the public organiser pages returned 200 and their rendered text/navigation was inspected, including the actual Porto half-marathon result-table headings. Compressed responses were decoded before parsing. No login or access-control bypass was involved. The half-marathon course detail comes from the rules; the interactive course map was not treated as independent confirmation of a 2027 route.

### Germany

**Berlin Marathon**

- [Official 2027 homepage and title change](https://www.generali-berlin-marathon.com/en/)
- [2027 entry and eligibility](https://www.generali-berlin-marathon.com/en/registration/run)
- [Course and map-edition qualification](https://www.generali-berlin-marathon.com/en/race-weekend/course)
- [FAQ](https://www.generali-berlin-marathon.com/en/preparation/faq)
- [Results archive](https://www.generali-berlin-marathon.com/en/race-weekend/results)

**Frankfurt Marathon**

- [2027 registration](https://www.frankfurt-marathon.com/en/yourrun/marathon/registration/)
- [Course and 2026 date](https://www.frankfurt-marathon.com/en/yourrun/marathon/course/)
- [General participant information, with mixed-year content](https://www.frankfurt-marathon.com/en/yourrun/marathon/information/)
- [Results archive](https://www.frankfurt-marathon.com/en/information/results/)

**Berlin Half Marathon**

- [Official event and remaining entry routes](https://www.generali-berliner-halbmarathon.de/en/)
- [Runner entry and lottery](https://www.generali-berliner-halbmarathon.de/en/registration/run)
- [Course](https://www.generali-berliner-halbmarathon.de/en/your-race/course)
- [2027 race-day programme](https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants)
- [Results archive](https://www.generali-berliner-halbmarathon.de/en/your-race/results)

**Cologne Half Marathon**

- [Official half-marathon information](https://generali-koeln-marathon.de/en/events/half-marathon/)
- [Course maps and GPX](https://generali-koeln-marathon.de/en/courses/)
- [Professional-athlete information](https://generali-koeln-marathon.de/en/pros/)
- [Results hub](https://generali-koeln-marathon.de/en/results/)

## Results-source registration handoff

All newly linked archive domains and exact Sporthive event URLs were handed to the source-registry owner for duplicate reconciliation and registration as disabled research references. Existing Sporthive, Sportmaniacs and Mika Timing provider entries can be reused. Registration does not authorise collection or verify any participant result. The Berlin archives’ result-list reuse restrictions must remain in the registry rights notes; these guides only link to the archives.

## Country description suggestions

- **🇪🇸 Spain:** Compare Valencia and Barcelona road marathons and half marathons, with official entry routes, course previews, edition-specific start information and results links.
- **🇵🇹 Portugal:** Explore Lisbon and Porto marathon and half-marathon guides, from bridge starts to coastal and Douro waterfront courses, with confirmed dates and clear distinctions between current and previous-edition details.
- **🇩🇪 Germany:** Compare Berlin and Frankfurt marathons with Berlin and Cologne half marathons, including lottery and direct-entry routes, city course previews and official results archives.

## Validation

All six modules were imported directly with Node’s TypeScript support. Checks passed for 12 unique slugs, two races per distance per country, correct distance values, nonempty descriptions/course/entry/source fields, absolute HTTPS links, the common checked date, and a date or TBC note for every guide. Separate assertions confirmed that the Lisbon start conflict remains visible and Valencia’s provisional 2027 date is absent from confirmed editions. Shared country/route/sitemap/schema and production checks belong to the integration pass.

## Recovery record

Restored on 24 October 2026 from the retained prior write content after the unpublished scratch checkout was lost. The source checks remain dated 23 October 2026; recovery is not represented as a new live source check.
