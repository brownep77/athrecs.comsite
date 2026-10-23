# Further multisport additions — 23 October 2026, batch G

This batch adds 17 completed performances, six unclaimed athlete profiles, 15 future fixture listings across four sports, and 24 national athletics federations. Checks are limited to these additions and the existing records they extend.

## Results and athlete details

11 performances extend nine existing profiles. Six more performances accompany six new profiles with explicit source-reported sporting nationalities and birth years. Their biographies provide no exact birthday, residence, birthplace or representative; those fields remain empty. Nationality is not inferred from a name or race location.

Six programmes cover Dexing elite women, the Spanish sprint national championships (men and women), Troutbeck and Ebotse elite men, and the Banyoles elite men's duathlon. Programme JSON and XLSX are compared with athlete-history XLSX by provider athlete ID, programme, date, component distances, finish status, time, bib, nationality, splits and supplied places. Retained same-day history captures retain their actual capture timestamps. Source penalties and final times are preserved. The 16 triathlon results and one duathlon result use the actual course distances; Banyoles is 5 km run, 19.8 km bike and 2.5 km run, with no swim split.

Six other programmes remain held: Kitzbühel and Xuzhou combine final and semifinal classifications without a resolved row-level round date; Spain T100 has an inconsistent bike-distance unit; two Napier classifications have no component distances; the Banyoles cross-duathlon XLSX has fewer row values than headers, shifting the timing fields. No positional repair or nominal-distance substitution is used.

Duplicate and ownership checks include provider IDs, canonical and entry names, aliases, previous names, accented and ASCII surname variants, account links, resolved identifiers and private profiles. Existing privacy, source facts and performances are protected by transactional before-value guards. All 92 stored and proposed performance objects for the selected profiles pass the application's schema. Source verification does not establish ownership. Original captures, row comparisons and profile evidence remain staff-only; public results pages retain World Triathlon credit and original result links.

## Fixtures

The Wimbleball organiser's explicitly dated 2027 category cards and the authorised Race Space entry page agree on 15 start times. Four lake swims, three road sportives and five trail/canicross categories take place on 28 August; three triathlons take place on 29 August. Times are local to Europe/London. Junior and canicross classifications remain separately labelled. The organiser's race-manual link is a placeholder, so it is not cited as a timetable.

Three existing event records are reused, with their original 2026 editions preserved unchanged. Their general descriptions, location and official organiser links are refreshed from the opened sources. One new event groups the three Exmoor sportive distances. The existing wider event inventory was checked for name and venue duplicates.

Triathlon course totals use the published legs: 115.9 km for the organiser's “70.3 distance” category (1.9/93/21 km), 57 km standard (1.5/45/10.5 km), and 23.75 km sprint (0.75/18/5 km). Sportive kilometre values are conversions of the published 100, 65 and 50 mile labels. Generic template text about a different seaside event is excluded.

Other Wimbleball options await complete category-specific evidence. IRONMAN announcement candidates are held because direct event pages could not be retrieved and reported dates conflict. No recurrence dates or old edition starts are copied into 2027.

## Federations

24 national athletics entries add Algeria, Botswana, Burkina Faso, Burundi, Cameroon, Central African Republic, Chad, Comoros, Republic of the Congo, Djibouti, Egypt, Eritrea, Ethiopia, Gabon, Guinea, Lesotho, Liberia, Madagascar, Malawi, Morocco, Mauritania, Namibia, Niger and Senegal.

Names and national roles are checked against the Confederation of African Athletics directory and each opened country detail page. The source's published names are retained. Links are clearly labelled as official member-directory entries; no national website, contact details, leadership, funding role or broader compliance status is inferred. The World Athletics Africa endpoint did not supply usable current member details in this check and is not used as corroboration.

The directory now contains 485 organisations, including 437 national bodies, covering 156 countries and territories. These countries already had cycling entries; this pass expands their sport coverage.

## Validation

All three publication plans are rehearsed and read back in the isolated review database before production, with matching plan hashes and repeated identity, duplicate and before-value guards. Source captures and original event values are retained privately. TypeScript, the existing directory verifier, multisport taxonomy checks and the development build pass. Release checks cover all 15 affected athlete profiles, six result programmes, 15 fixture categories, four sport filters, 24 federation details and country filters, sport collection links and sitemap entries.
