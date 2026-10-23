# Further multisport additions — 23 October 2026, batch I

This batch adds 17 completed performances, four unclaimed athlete profiles, 34 future fixture listings across three sports, and 22 national triathlon federations. It also extends eight existing athlete profiles and rechecks 15 existing federation entries.

## Results and athletes

Thirteen performances extend eight existing profiles; four performances accompany four new profiles. All four new athletes have explicit source-reported sporting nationalities. Two have a supplied birth year. Missing birth years, exact birthdays, residence, birthplace and representative remain empty.

Nine World Triathlon programmes cover Vancouver T100, Mossel Bay, Swakopmund and Putrajaya elite women, plus Devonport, Tenerife, Olsztyn, Swakopmund and El Galala elite men. Actual programme JSON and XLSX are compared with athlete-history exports using provider athlete IDs, programme, date, component distances, finish status, time, bib, nationality, splits and supplied places. Retained same-day history captures keep their original timestamps. Source penalties and final times are preserved, including the selected Devonport finisher's 15-second transition penalty. Vancouver uses its published 2/80/18 km T100 course; other programmes retain their actual component distances.

Three further programmes remain held: Padola winter triathlon and winter duathlon need discipline/split mapping, while Runaway Bay SuperSprint needs round-level clarification. Three potential new profiles remain held after compound-family-name and alias checks. No result or athlete is attached by name alone.

Duplicate and ownership checks include provider IDs, canonical and entry names, aliases, previous names, accented/ASCII and compound-family-name variants, account links, resolved identifiers and private profiles. Transactional before-value guards preserve the eight existing profiles' facts, privacy and performances. All 62 stored and proposed performance objects pass the application schema. Source verification does not establish account ownership. Captures and profile evidence remain staff-only; public result pages retain World Triathlon credit and original result links.

## Fixtures

Five new events and two reused Dawlish events group 34 confirmed 2027 programmes: Torbay spring triathlon (10), Torbay autumn triathlon (9), Plymouth triathlon (3), Plymouth swimming (3), Dawlish triathlon (2), Dawlish swimming (3), and Rame Head trail running (4). The two original Dawlish 2026 editions remain unchanged. Dates, venues, component distances, age rules and starts are checked against opened organiser pages and their linked race manuals. Entry availability is unconfirmed, so entry status stays TBC and entry URLs remain empty.

The current 2027 Plymouth manual gives standard and sprint triathlon starts of 08:00 and 08:10, superseding conflicting website cards. Its swim manual gives 09:10, 09:05 and 09:00 for 750 m, 1500 m and 3000 m respectively. Mount Edgcumbe is recorded in Cornwall despite the Plymouth event title. Rame Head's 2027 manual resolves the 10.5 km and canicross starts to 11:10 and 11:25; both junior distances start at 09:30. Times are local to Europe/London and specific to the edition.

Torbay's older detailed race-pack tabs are not copied into 2027. The autumn Tristar Start category remains held because its source says 12.00am; noon is not assumed. Relay options with year ambiguity and Rame Head half/full marathon distances with conflicting nominal/lap descriptions are also held. Dawlish's 2027 page supplies swim dates and times; its inconsistently dated manual is not used to establish the year or conflicting lap counts.

## Federations

New triathlon entries cover Bangladesh, Bahrain, Cambodia, Iran, Iraq, Jordan, Kazakhstan, Kyrgyzstan, Saudi Arabia, Kuwait, Lebanon, Maldives, Mongolia, Oman, Pakistan, Palestine, Qatar, Syria, Timor-Leste, United Arab Emirates, Uzbekistan and Yemen. Existing entries for China, Hong Kong, Indonesia, India, Japan, South Korea, Macau, Malaysia, Nepal, Philippines, Singapore, Sri Lanka, Thailand, Chinese Taipei and Vietnam are rechecked.

All 37 records match the opened Asia Triathlon list, World Triathlon member data and individual federation pages. Pakistan retains the published “Not in good standing” warning. Source names are preserved, including Kuwait Triathlon Club and Yemen Aquatics; membership alone does not establish funding powers or a wider sports remit. New entries link to clearly labelled official member-directory pages. Existing unrelated records and profile fields are preserved.

The directory now contains 535 organisations, including 487 national bodies, across 156 countries and territories. This pass expands triathlon coverage in countries already represented by other sports.

## Sources and validation

Race Results / EMIT UK is added as one disabled manual-review source after checking its actual current index, provider relationship and registry/wider event-inventory domains. Existing RaceSignup event links are preserved. Registration does not enable automated collection or verify individual results. The registry contains 335 sources: 36 enabled and 299 disabled.

Publication is rehearsed in the existing isolated review database, then guarded and read back in production with matching plan hashes. Validation covers TypeScript, the directory and source-registry verifiers, bulk-source job accounting, multisport taxonomy and a development build. Release checks cover 12 athlete profiles, nine result programmes, all 34 fixture categories, three sport filters, 22 new and 15 rechecked federation pages, country filters, sport collection links and sitemap entries. The checks apply to this batch and the records it extends, not the entire catalogue.
