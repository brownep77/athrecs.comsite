# Further multisport additions — 23 October 2026, batch E

This pass adds 29 completed results, five unclaimed athlete profiles, ten future cycling fixture listings and 20 national cycling federations. This is a source-compared batch, not verification of the whole catalogue or complete athlete careers.

## Results and athlete details

22 completed performances extend 18 existing profiles. Seven further performances belong to five new profiles with explicitly reported sporting nationalities and birth years. Exact birthdays, birthplace, residence and representative remain empty where the checked source biographies supply none.

Six elite programmes across Elblag, Asuncion, Xuzhou, Huatulco and Torremolinos were compared using official programme JSON, programme XLSX and athlete-history XLSX. Comparisons cover provider athlete ID, programme, date, component distances, finish status, time, bib, nationality, splits and supplied placing. Retained same-day history captures keep their original capture dates.

The batch contains 25 triathlon performances and four duathlon performances. Torremolinos retained a triathlon event title and a generic Swim split heading, but its technical-delegate notes explicitly say the race was changed to duathlon because of water quality. Its published 2.5 km run / 20 km bike / 5 km run format determines the sport classification. These performances do not acquire swimming splits. The result events and competition taxonomy also use Duathlon.

Tiszaujvaros is held because its table combines final and semifinal classifications without a safe per-row race-date/round match in the reviewed exports. Osaka Castle is held because component distances are absent. One DNF is excluded from completed results. A possible existing athlete found using an accent-normalised surname is held with one additional performance instead of creating a duplicate.

Provider ID, canonical name, alias, account and private-profile checks precede new-profile creation. Supplemental surname variants cover accents. Existing ownership, privacy settings, nationality, profile facts and original results are protected by transactional guards. All 165 existing and proposed performance objects for the selected profiles pass the application's actual schema. Source verification does not verify account ownership. Captures, comparison notes and before/after values remain staff-only.

## Fixtures

Nine 2027 Tour de France Femmes stages are matched between the organiser's route table and individual stage pages by stage number, date, start/finish towns, type and distance. Three stages are in the United Kingdom and six in France. The London stage is explicitly a team time trial. The organiser's rounded distances total 1,156 km and remain subject to homologation; earlier media precision is not substituted.

The separate amateur L’Étape du Tour de France Femmes adds a 138 km fixture for 8 August, with 2,460 m of ascent, from Panoramique des Dômes to the Charade circuit. The race and practical-information pages agree on the date. Puy-de-Dôme is a department, so it is not invented as a city value.

The individual stage timetable tables contain headings without populated start times; the amateur pages checked also provide no race start. Those fields remain empty. The existing cycling inventory was checked for duplicates before creating these ten separate fixtures. No pro entry availability is implied.

## Federations

20 UCI member entries add Algeria, Angola, Benin, Botswana, Burkina Faso, Burundi, Cameroon, Cabo Verde, Central African Republic, Chad, Comoros, Republic of the Congo, Democratic Republic of the Congo, Djibouti, Egypt, Equatorial Guinea, Eritrea, Eswatini, Ethiopia and Gabon. Exact member names and country codes were read from the current UCI African federation directory. The two Congos remain distinct.

Official member-directory links are labelled accordingly. No national website, contact detail or additional cycling-discipline remit is invented. A listing establishes the membership reported by the UCI, not a broader compliance assessment or membership in another sport. The directory reaches 429 organisations, including 381 national bodies, with national coverage in 125 countries and territories.

## Validation

Existing-profile updates, new profiles and fixtures are rehearsed in the isolated review database and read back before production publication. Source comparison, duplicate checks, schema validation and ownership/privacy guards precede writes. Directory verification, multisport taxonomy, TypeScript and the development build cover the code change. Live checks cover federation pages and filters, stage dates and distance classifications, result pages, source-reported profile facts and exclusion of private evidence from public profiles.
