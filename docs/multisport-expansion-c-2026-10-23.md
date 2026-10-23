# Further multisport additions — 23 October 2026

This pass adds 91 completed triathlon results, seven unclaimed athlete profiles, 22 fixture listings across 20 events, and 24 national federation entries. It does not establish full catalogue or full-career verification.

## Results and athlete details

78 additional completed performances extend 43 existing profiles. A further 13 performances belong to seven new source profiles, with explicitly reported sporting nationalities and birth years. Exact birthdays, birthplace, residence and representative are not inferred. A source-reported former name was checked during duplicate review and retained as an alias.

Eight elite programmes across Chengdu, Quiberon, Lanzarote, Edmonton, Yokohama, Tarragona and Haikou were compared using programme JSON, programme XLSX and athlete-history XLSX. Comparisons cover provider athlete ID, programme, date, component distances, finish status, time, bib, nationality, splits and supplied placing. Existing same-day history captures retain their original capture date. Seven non-finish observations (five DNF, one DNS and one DSQ) are held outside completed-result totals; spreadsheet zero times are not treated as finishes.

Name, alias, provider ID and account checks precede new-profile creation. Existing profile ownership, privacy settings, nationality, facts and original results are protected by transactional guards. Source verification remains separate from account ownership. Original captures and before/after values stay in staff-only evidence and audit records.

Missing source venue text is represented as an empty string without inventing a location. All 324 stored and proposed performance objects for the selected profiles pass the application's actual result schema before publication.

## Fixtures

Eighteen 2027 Triathlon World Tour programme ranges agree between World Triathlon's 25 September calendar and the current T100 organiser listings. These cover T50 Championship, T50 Cup, T100 Championship and T100 Challenger events. Programme weekends are labelled explicitly; individual race dates, distances and wave starts are not inferred from them.

The Ely 115 Squadron Duathlon adds one distance listing and East Grinstead Triathlon adds three: sprint, Try-a-Tri and the separate youth race. Dates and distances agree between the organisers and British Triathlon. Ely's 08:00 event start comes from the governing-body listing for its single listed race. East Grinstead's 07:00 summary is not copied across individual waves. Both governing-body pages show permits in progress; entry availability remains TBC in this import.

Wānaka, Florianópolis and Yokohama are held because the compared date ranges or programme scopes differ. East Grinstead aquabike and relay are omitted from this batch while inconsistent governing-body distance fields remain unresolved. Existing fixtures were reviewed for duplicates before adding new events.

## Federations

24 athletics and cycling bodies extend coverage to Iran, Iraq, Jordan, Kuwait, Lebanon, Myanmar, Oman, Qatar, Saudi Arabia, Tajikistan, Turkmenistan and Uzbekistan. Names and membership are checked against the current Asian Athletics and UCI Asian member directories. The captured UCI directory lists no sanctions or suspensions in its corresponding fields. This establishes the listed membership, not a broader compliance assessment.

Member-directory links are labelled accordingly. No national website, contact detail or unverified cycling-discipline remit is invented. The directory now contains 397 organisations, including 349 national bodies, across 99 countries and territories.

## Validation

Existing-profile updates, new profiles and fixtures are rehearsed in the isolated review database and read back before production publication. Actual result-schema validation, protected-profile checks, source comparisons and duplicate guards precede writes. Directory and taxonomy checks, TypeScript validation and the development build cover the code change. Live checks cover new federation pages and filters, fixture dates and classifications, result pages, source-reported facts and the exclusion of private evidence from public profile responses.
