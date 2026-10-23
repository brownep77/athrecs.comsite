# Further multisport additions — 23 October 2026, batch F

This pass adds 22 completed triathlon results, six unclaimed athlete profiles, 22 future cycling fixture listings and 32 national cycling federations. The checks cover this batch, not complete athlete careers or the whole catalogue.

## Results and athlete details

16 completed performances extend 13 existing profiles. Six further performances belong to six new profiles with source-reported sporting nationalities and birth years. The checked biographies supply no exact birthday, birthplace, residence or representative; these fields remain empty.

Seven elite programmes cover Elblag, Monte Gordo, Quarteira, French Riviera T100, San Francisco T100, Singapore T100 and Gulfport. Actual programme JSON and XLSX are compared with athlete-history XLSX by provider athlete ID, programme, race date, component distances, finish status, time, bib, nationality, splits and supplied placing. Retained same-day history captures keep their original capture dates. Split durations are compared as validated H:M:S components while preserving original source precision.

Programme notes and leg sequences were inspected before classification. French Riviera uses the source's 79.1 km bike leg; Gulfport uses 19.8 km. Nominal format distances are not substituted. The Tiszaujvaros women's classification is held because it combines finals and semifinals without a safe per-row round/date match in the reviewed exports. One French Riviera DNF is excluded from completed results; its XLSX zero time and JSON DNF marker are retained in the private hold.

New-profile checks cover provider IDs, canonical names, aliases, previous names, account names and private profiles, including accented and ASCII surname variants. Existing ownership, privacy, facts and original performances are protected by transactional guards. All 103 existing and proposed performance objects for the selected profiles pass the application's schema. Source verification does not verify ownership. Original captures and before/after evidence remain staff-only.

## Fixtures

The 21 individual 2027 Tour de France stages are compared between the organiser's route table and each stage page by number, date, start/finish towns, stage type and distance. The three rest days are excluded. The first three stages are in the United Kingdom and the remaining 18 in France. Two stages are individual time trials. Published stage distances total 3,479 km and remain subject to homologation; the current official opening stage is 185 km.

The separate amateur L’Étape du Tour de France is listed for 11 July 2027 from Cluses to Les Saisies. Its edition-specific route is 154 km with 4,850 m of ascent, distinct from the professional stage's 150 km. The departure page still describes the 2026 Bourg d’Oisans edition: its 05:00 luggage drop-off is not a 2027 start time. No start times are copied from that page. Professional stage timetable tables also contain only headings, so all 22 start fields remain empty.

The existing overall Tour fixture remains alongside the separately identified stages. The wider cycling inventory was checked for duplicates. Professional rider entry availability is not implied.

## Federations

32 current UCI African member entries add Gambia, Ghana, Guinea, Guinea-Bissau, Côte d’Ivoire, Kenya, Lesotho, Liberia, Libya, Madagascar, Malawi, Mali, Mauritania, Morocco, Mozambique, Namibia, Niger, Nigeria, Rwanda, Sao Tome and Principe, Senegal, Seychelles, Sierra Leone, Somalia, Sudan, South Sudan, Togo, Tunisia, Uganda, Tanzania, Zambia and Zimbabwe.

Names and country codes come from the actual UCI member-directory payload. The previously listed South African and Mauritian bodies are not duplicated. Official member-directory links are labelled accordingly; no national website, contact details or additional cycling-discipline remit is invented. UCI membership is not a statement about membership in another sport or broader compliance.

The directory reaches 461 organisations, including 413 national bodies, with national coverage in 156 countries and territories. Kenya already had other national sport bodies, so the 32 additions extend country coverage by 31.

## Validation

Existing-profile changes, new profiles and fixtures are rehearsed and read back in the isolated review database before production. Publication requires the same plan hash and repeats transactional identity, snapshot and duplicate guards. TypeScript, directory verification, multisport taxonomy and the development build check the source change. Live checks cover profile facts and results, private evidence exclusion, provider credit on result pages, fixture dates and distances, federation details, country and sport filters, athlete links and sitemap entries.
