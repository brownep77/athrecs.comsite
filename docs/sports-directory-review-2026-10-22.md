# Directory review — 22 October 2026

Reviewed the 123 records present after PR #811, then added 31 national bodies and
Scottish Hill Runners. The collection now contains 155 organisations, including
107 national federations across 27 countries and territories, with entries for
all 11 AthRecs sport sections. It is not an exhaustive global census.

## Method and limits

- Reviewed each existing entry's name, type, remit, sport mappings and references.
  Requested all 202 distinct existing website/source URLs: 184 returned HTTP 200;
  18 blocked access, timed out or returned another status. A successful HTTP
  response alone was not treated as proof of identity or role.
- Read organisation pages, recognised member/parent profiles, page titles and
  relevant role text. Used indexed official-page text for blocked or dynamic
  pages. Rechecked ambiguities against more specific primary sources.
- The new national entries' initial direct pass requested 50 HTML URLs: 49
  returned HTTP 200 and the Polish athletics home page timed out (it was
  accessible through web retrieval). Finnish triathlon returned “Site
  Unavailable” despite HTTP 200; its official destination and role were
  corroborated by its World Triathlon profile and indexed official pages.
  Additional calendar, role, constitution and specialist pages were reviewed.
- Review dates describe editorial review of role and website references, not
  a guarantee that every page is currently reachable. No athlete results or
  personal data were imported; references do not establish data-reuse permission.

The initial direct-access exceptions involved Sport England, Triathlon Scotland,
Swim Wales, Swimming Canada, Cycling South Africa, parkrun, Portuguese swimming,
Dutch triathlon, Triathlon Japan, Brazilian cycling/aquatics, European Aquatics
and ITRA. Indexed official pages or recognised member/parent references supported
the review. Dynamic Team GB, UCI, Scottish Swimming and European Athletics pages
also needed evidence beyond their first HTML response.

## Corrections

| Entry                          | Change                                                                                                                 | Primary evidence                                                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Welsh Cycling                  | Display Beicio Cymru; preserve old-name aliases and slug; use canonical website                                        | [Beicio Cymru](https://www.beiciocymru.org/)                                                                                                                                                                 |
| Welsh Triathlon                | Display Triathlon Cymru; preserve alias and slug; update FAQ                                                           | [Triathlon Cymru](https://welshtriathlon.org/)                                                                                                                                                               |
| Athletics Ireland              | Add Northern Ireland to all-island remit; explain the overlapping Athletics NI role without implying eligibility rules | [History](https://www.athleticsireland.ie/about/history/) and [2026 bye-laws](https://www.athleticsireland.ie/wp-content/uploads/2026/06/Athletic-Association-of-Ireland-Bye-Laws-Amended-April-25-2026.pdf) |
| British Paralympic Association | Replace indirect Team GB source with its own role page                                                                 | [About ParalympicsGB](https://paralympics.org.uk/footer-pages/about-the-bpa)                                                                                                                                 |
| UCI                            | Use explicit governing-body description                                                                                | [The UCI](https://www.uci.org/the-uci/2QDMyzhoBXyWbVrsxge0EH)                                                                                                                                                |
| WMRA                           | Use current redirect destination                                                                                       | [WMRA](https://www.wmra.info/)                                                                                                                                                                               |
| European Athletics             | Follow manifesto reference to current `/stories/` path; corroborate role through its official organisational profile   | [Manifesto](https://www.european-athletics.com/stories/your-sport-for-life) and [official profile](https://www.linkedin.com/company/european-athletics)                                                      |
| parkrun                        | Extend country filters; omit France because its specific suspension notice overrides the generic special-days table    | [Regional table](https://volunteer.parkrun.com/hc/en-us/articles/16858208225170-2-19-Additional-parkrun-Days) and [France update](https://blog.parkrun.com/fr/2024/05/16/parkrun-france-update/)             |

The funding distinction remains explicit: Sport England supports participation;
UK Sport funds high-performance programmes; the independently funded BOA manages
Team GB. Governing bodies, funding bodies, Games teams and legislation remain
separate concepts.

## Additions

| Country or territory | National bodies added                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Austria              | Österreichischer Leichtathletik-Verband; Cycling Austria; Österreichischer Schwimmverband; Triathlon Austria                             |
| Finland              | Suomen Urheiluliitto; Suomen Pyöräily; Suomen Uimaliitto; Triathlon Finland                                                              |
| Norway               | Norges Friidrettsforbund; Norges Cykleforbund; Norges Svømmeforbund; Norges Triatlonforbund                                              |
| Poland               | Polski Związek Lekkiej Atletyki; Polski Związek Kolarski; Polski Związek Pływacki; Polski Związek Triathlonu                             |
| India                | Athletics Federation of India; Cycling Federation of India; Swimming Federation of India; Indian Triathlon Federation                    |
| Singapore            | Singapore Athletics; Singapore Cycling Federation; Singapore Aquatics; Triathlon Singapore                                               |
| Kenya                | Athletics Kenya; Kenya Aquatics; Kenya Triathlon Federation                                                                              |
| Bermuda              | Bermuda National Athletics Association; Bermuda Bicycle Association; Bermuda Amateur Swimming Association; Bermuda Triathlon Association |

National triathlon identities were corroborated with World Triathlon member
profiles; European cycling identities with UEC profiles. Federation pages and
calendars support discipline mappings. Each entry retains its official sources
in `src/data/sports-organisations.ts`.

Cycling Austria uses `cyclingaustria.at`, the redirect from its older domain.
Finnish athletics uses `/suomen-yleisurheilu/`, because `/sul/` redirected to an
anniversary article. Indian cycling uses `cfiindia.in`, corroborated by the
current UCI national-road event listing and the federation's role page. The
obsolete domain in an older Olympic directory redirected to unrelated content
and was not used.

Scottish Hill Runners is a specialist service association. Its [own description](https://www.scottishhillrunners.uk/info)
explicitly says it is not a sports governing body.

## Deliberately limited coverage

- Kenyan cycling appears in the UCI directory, but a current independent
  official destination and discipline scope were not sufficiently established
  for a profile in this batch.
- Bermuda cycling is mapped to road and mountain bike; Indian cycling to the
  road, track and mountain bike programmes established on its role page.
  Bermuda triathlon is mapped only to triathlon in this batch.
- New athletics entries cover road running and track and field; trail remit
  is not inferred solely from World Athletics affiliation.
- National-federation totals exclude Scottish Hill Runners and parkrun-only
  locations. Bermuda is a territory, so public copy says “countries and territories”.

## Verification

The directory verifier covers old-name aliases, accent-insensitive Polish and
Norwegian searches, all-island athletics, new country/sport filters, conservative
Bermuda mappings, specialist classification and parkrun coverage. Existing URL,
relationship, all-sport, malformed-filter and Olympic distinctions remain
covered. Type checking, the development bundle build and deployed route checks
cover integration. No database migration is required.
