# Further multisport additions — 23 October 2026, batch J

This batch adds 20 completed performances, two unclaimed athlete profiles, 18 future fixture categories and 15 national triathlon bodies. It also extends 12 existing athlete profiles, rechecks 21 federation entries and corrects two existing 2027 fixtures without changing their identities.

## Results and athletes

Eighteen performances extend 12 existing profiles. Two performances accompany two new athletes, each with an explicitly reported sporting nationality and birth year. Exact birthdays, residence, birthplace and representative remain empty when absent from the source. Existing facts and publication controls are preserved.

Nine World Triathlon programmes cover Gold Coast, Nyon, Rzeszów, Tipaza and Monastir elite women, Yasmine Hammamet and Torremolinos elite men, and Caorle elite men and women. The Torremolinos programme explicitly states that water quality caused a conversion to duathlon; its published 2.5 km run / 20 km bike / 5 km run is retained. Two added results are duathlon and 18 are triathlon. Actual component distances, dates, final times, bibs, sporting nationalities, splits and placing scopes are matched across programme JSON, programme XLSX and athlete-history exports by exact provider athlete ID. Retained same-day profile/history captures retain their original timestamps.

Two overlapping Napier Cup/Championship listings remain held because component distances are absent and their shared race must be deduplicated. Kitzbühel's combined final/semifinal classification also remains held for round-level mapping. Five further potential new profiles fail conservative family-name/alias screening; another candidate remains held from an earlier review. These are possible identity conflicts, not confirmed duplicate people.

Provider-ID, name, alias, account-link, resolved-identifier and private-profile checks precede publication. Transactional before-value guards protect the 12 existing profiles. All 67 stored and proposed performance objects pass the application schema; this is separate from the source comparison of the 20 additions. Source verification does not establish ownership. Captures and athlete evidence remain staff-only. Public result pages retain provider credit and original result links.

## Fixtures and corrections

The 20 reviewed categories comprise three Roadford Lake triathlons, four Roadford lake swims, six Tavistock triathlons, six Roadford trail-running categories and Burrator 10K. Three new event records are created. The existing Roadford trail and Burrator event/edition identities are reused, with their original values retained privately. Eighteen edition categories are new and two are corrected.

Roadford's 16 May 2027 triathlon manual confirms middle, standard and sprint starts of 07:30, 08:30 and 09:15, with actual components of 1.9/93/20 km, 1.5/46/10 km and 0.75/20/5 km. Its 15 May swim programme supplies matching page/manual starts for 500 m and 750 m at 14:00, and 2500 m and 5000 m at 15:00. The 1500 m swim remains held: its 15:00 manual start, 13:45 briefing and 14:00 category-card start are not consistently resolved.

Tavistock's current event cards establish 2 May 2027 and the accepted categories' starts and components. The linked manual is still for 3 May 2026 and is not copied forward. Tristar 2 and 3 remain held because the current cards say 11:45 pm and 11:30 pm.

Roadford's dated 15 May 2027 trail manual gives 10:15 for the junior races, 11:00 for the adult 10K, 11:05 for 10K canicross, 11:10 for 5K and 11:15 for 5K canicross. The previous 08:30 adult start is corrected. The organiser's nominal 10K label is retained with its explicitly advertised 10.5 km lap and a course-distance qualification; this is not a certified 10 km performance distance. The half marathon remains held for exact course-distance clarification. Junior minimum ages are reported without silently resolving inconsistent upper age bands.

Burrator's 29 May 2027 manual and category card agree on 18:30, correcting the stored 17:30. Its junior starts are checked but their upper age bands remain held. The two corrected fixtures' seed records and venue details are updated alongside the database, including official source URLs, Devon locations and confirmed postcodes. Unsupported entry links are removed; entry availability stays TBC. Starts are local to Europe/London and specific to the recorded editions.

Roadford aquabike and aquathlon are recorded in the private research holds because those sports are outside the current public AthRecs facade. No sport is relabelled to force publication. EMIT UK and Webscorer already have source-registry entries, so no duplicate source is added and collection settings are unchanged.

## Federations

New triathlon member bodies cover Antigua and Barbuda, Aruba, Belize, Cayman Islands, Cuba, El Salvador, Grenada, Haiti, Honduras, Nicaragua, Puerto Rico, Saint Kitts and Nevis, Suriname, Venezuela and Virgin Islands. The directory reaches 550 organisations, including 502 national bodies, across 171 countries and territories.

All 36 Americas records are compared across the opened continental directory, World Triathlon's global member list and individual member pages. Antigua and Barbuda, Belize, Nicaragua and Suriname retain the published “Not in good standing” warning. The 21 existing entries retain their prior names, aliases, remits and sources; current World Triathlon listing-name variants are added as searchable aliases and qualified in the detail text. Membership does not imply funding powers, leadership or a broader sports remit.

## Validation

Publication plans are rehearsed and read back in the existing isolated review database before production, with matching hashes and repeated ownership, duplicate and exact before-value guards. Validation covers TypeScript, directory structure and relationships, fixture geography, multisport taxonomy and a development build. Release checks cover 14 athlete profiles, nine result programmes, 20 fixture categories, four sport filters, 15 new and 21 rechecked federation pages, 15 country filters, sport collection links and sitemap entries. The scope is this batch and the records it extends, not the entire catalogue.
