# Further multisport additions — 23 October 2026, batch D

This pass adds 58 completed triathlon results, six unclaimed athlete profiles, 15 future fixture listings and 12 national federation entries. It does not establish full catalogue or full-career verification.

## Results and athlete details

47 additional completed performances extend 30 existing profiles. A further 11 performances belong to six new source profiles, with explicitly reported sporting nationalities and birth years. Exact birthdays, birthplace, residence and representative are absent from the checked biographies and remain empty.

Eight elite programmes across Edmonton, Rio de Janeiro, Quarteira, Haikou, Asuncion and Antofagasta were compared using programme JSON, programme XLSX and athlete-history XLSX. Comparisons cover provider athlete ID, programme, date, component distances, finish status, time, bib, nationality, splits and supplied placing. Existing same-day history captures retain their original capture date. Eight DNF observations and one LAP observation are held outside completed-result totals; spreadsheet zero times are not treated as finishes.

The Asuncion spreadsheet expresses split hours with one digit while its JSON uses two. Validated hour/minute/second tuples agree exactly; displayed values retain the JSON formatting, and both original captures are preserved. Missing venue text is represented as an empty string. All 241 existing and proposed performance objects for the selected profiles pass the application's actual result schema.

Provider ID, name, alias, account and private-profile checks precede new-profile creation. Existing ownership, privacy settings, nationality, facts and original results are protected by transactional guards. Source verification remains separate from account ownership. Original captures and before/after values stay in staff-only evidence and audit records.

## Fixtures

Nine T50 Cup and six T100 Challenger programme ranges agree between World Triathlon's September calendar, the tour announcement and the current organiser priority-access calendar. These add Melilla, Tiszaújváros, Munich, Rio de Janeiro, Karlovy Vary, Tongyeong, Iquique, San Pedro de la Paz, Hong Kong, Samarkand, Fortaleza, Vieux Boucau, Peguera-Mallorca, Forte Village and Xiamen.

Programme weekends are labelled explicitly. Individual race dates, component distances, wave starts and entry availability are not inferred. Samarkand's August T100 programme is distinct from its existing April T50 programme.

Chengdu is held because the September announcement gives 16–17 October while the current organiser form gives 9–10 October. Kaiserwinkl-Walchsee is held because the form gives 27–27 June against the announcement's 26–27 June. No dated race-day timetable resolves these discrepancies. All existing triathlon/duathlon editions were checked for duplicate locations, dates and names before creating new fixtures.

## Federations

12 athletics and cycling bodies extend coverage to Afghanistan, North Korea, Palestine, Syria, Timor-Leste and Yemen. Names and membership are checked against the current Asian Athletics and UCI Asian member directories. This establishes membership listed by those bodies, not a broader compliance assessment or membership of another sport's federation. In particular, the World Triathlon Congress membership decisions are not applied to athletics or cycling.

Member-directory links are labelled accordingly. No national website, contact detail or unverified cycling-discipline remit is invented. The directory now contains 409 organisations, including 361 national bodies, across 105 countries and territories.

## Validation

Existing-profile updates, new profiles and fixtures are rehearsed in the isolated review database and read back before production publication. Actual result-schema validation, protected-profile checks, source comparisons and duplicate guards precede writes. Directory and taxonomy checks, TypeScript validation and the development build cover the code change. Live checks cover federation pages and filters, fixture dates, result pages, source-reported facts and the exclusion of private evidence from public profiles.
