# Further multisport additions — 23 October 2026, batch L

This batch adds 31 completed triathlon results, five unclaimed athlete profiles, nine fixture categories and 17 European triathlon member bodies. Eighteen existing athlete profiles are extended; two existing fixture editions and 34 existing federation entries are reviewed in place.

## Results and athletes

Twenty-six performances extend 18 existing profiles. Five more accompany new profiles for Erwin Vanderplancke (BEL, birth year 1995), Thomas Hansmaennel (FRA, 2004), Carter Stuhlmacher (USA, 2004), Dario Wickihalter (SUI, 2003) and Luca Vanderbruggen (BEL, 2007). Nationalities and birth years are explicitly supplied by World Triathlon. Exact birthdays, residence, birthplace and representative remain empty where absent. The available biography describes sporting history, without supplying those additional personal facts. Account ownership remains unverified.

Eight programmes cover Ceuta men, Coimbra men and women, Tenerife women, Olsztyn women, Rzeszów men, City of Derry women and Wels women. Programme JSON, programme XLSX and athlete-history XLSX are compared by provider athlete ID, date, category, actual component distances, finish status, total time, bib, nationality, placing scope and all supplied split headings. Ceuta's bike leg is 19.68 km, Tenerife's 18.8 km and Wels's 22 km; the other programmes specify 20 km. All specify 750 m swimming and 5 km running. Existing same-day history captures retain their original timestamps; programme and new-athlete captures are fresh.

Discovery expands to previously captured athletes beyond the original 81 profiles and excludes already reviewed or held programmes. One new candidate is held after a family-name variant identifies a possible existing profile; this is not a confirmed duplicate. Six existing meeting identities are reused and one Wels meeting is added. All 62 retained and proposed performance objects pass the application schema, separately from source comparison of the 31 additions. Public profile responses omit staff evidence; result pages retain provider credit and original links.

## Fixtures

Eleven reviewed categories cover Taunton Flyer's three road sportives on 9 May 2027, four Exeter Trail categories on 20 March 2027, and four Devon Trail categories on 31 October 2026. Nine categories and one event record are new. Both existing trail event identities, edition identities and competition identities are preserved.

Taunton's dated 2027 manual gives rolling windows of 08:00–08:30 for Wellington, 08:15–08:45 for Dakota and 08:20–09:00 for Spitfire. Stored start times are the beginnings of those windows. The manual's Dakota timetable supersedes the generic card's 08:10–09:00. Distances use the current route cards' rounded advertised 163, 100 and 60 km; Wellington's manual medal-table heading uses nominal 100 miles, while its route card advertises 101 miles / 163 km. These are timed sportives, not races or certified-distance claims.

Exeter's current 2027 category cards give half marathon 11:20, half marathon canicross 11:15, 10K 11:35 and 10K canicross 11:30. Its linked manual explicitly covers March 2026, so that year's different wave order is not transferred. The existing nominal 10K start changes from 11:00 to 11:35 and its approximate route distance from 10 to 10.5 km, matching the organiser's description. Half-marathon distances remain nominal, without a course-certification claim.

Devon's 9 September 2026 manual confirms 11:00 for the half marathon and 10K, 11:10 for half marathon canicross and 12:10pm for 10K canicross. The last supersedes the card's 12.10 am wording. Its original 10K start is rechecked, with source, geography and venue refreshed. Original values are privately audited, and both existing edition seeds and venue entries are updated to match. Entry availability remains TBC and unsupported entry URLs are removed.

Haldon Heroic, Moor to Sea and Dartmoor Legend remain held: their shared manual says 14 April 2027 while the current pages give 24 April, alongside older dates and inconsistent distances. No typographical date repair or distance guess is published. Their actual captures are retained for follow-up. World Triathlon, Sportiva and Webscorer were already known sources; no duplicate source registration or automated collection setting is added.

## Federations

All 51 European member records are compared across World Triathlon's global list, Europe Triathlon's directory and individual member pages. Seventeen additions cover Albania, Andorra, Armenia, Azerbaijan, Belarus, Bosnia and Herzegovina, Faroe Islands, Georgia, Gibraltar, Kosovo, Liechtenstein, Moldova, Monaco, Montenegro, North Macedonia, Russia and Ukraine. Faroe Islands retains associate-member qualification. Membership does not establish athlete or event eligibility, government powers or funding responsibilities.

Thirty-four existing entries retain their names, remits, aliases and earlier sources. Source jurisdictions Great Britain, Czech Republic and Türkiye are matched to the existing United Kingdom, Czechia and Turkey records, avoiding duplicates. The other 527 existing entries are semantically unchanged. The directory contains 578 organisations, including 530 national bodies, across 199 countries and territories in the national-body collection.

## Validation

The existing isolated review database rehearses each publication plan. Production writes use exact before-value, ownership, provider-ID and alias safeguards. Validation includes source comparisons, schema checks, directory identity/preservation checks, TypeScript, fixture geography, multisport taxonomy, the development build, seed consistency and exact database readback. Live checks cover affected athletes, results, fixture categories, federation pages, country filters, sport collections and sitemap entries. Original source captures and aggregate receipts remain in staff-only storage. This batch does not verify the entire catalogue.
