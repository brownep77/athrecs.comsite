# France, Spain and Portugal running-calendar audit

Checked: 26 August 2026  
Calendar window: 1 January 2026 to 31 December 2027

## Publication rule

AthRecs publishes a race only when a public organiser or governing-body page gives an explicit date and an explicit running distance. Same-day distances are separate edition rows and collapse to one calendar card. Finished 2026 races remain discoverable without stale entry links. Relays, walks, untimed fun runs, youth-only races, virtual challenges and inferred annual recurrences are excluded.

The curated addition contains 124 race dates and 163 advertised-distance rows:

| Country  | Series | Race dates | Distance rows |
| -------- | -----: | ---------: | ------------: |
| France   |     17 |         23 |            45 |
| Spain    |     55 |         55 |            65 |
| Portugal |     43 |         46 |            53 |

## Source handling

- France: the FFA calendar footer expressly says that copying displayed data is not authorised. Its registry entry therefore remains disabled and no published fixture cites that calendar. French additions are traced to organiser, municipal or event-owned pages.
- Spain: the RFEA 2026 road calendar was reviewed month by month. Only listings whose title or official category states the distance were retained. Duplicate public-event and championship listings were collapsed. RFEA currently publishes no 2027 road listings, so none were inferred.
- Portugal: the FPA national-results calendar and FPACompetições portal were reviewed. Postponed listings, duplicates, walks and youth-only records were held back. Confirmed 2027 companion distances were added from organiser pages for Funchal, Cascais and Lisbon.

The automated source registry remains disabled for all three federations pending dedicated rights profiles. The curated rows are individually reviewed fixture metadata rather than a bulk federation import.

## Verification

`npm run verify:france-spain-portugal-running-calendar` checks:

- country resolution and the French, Spanish and Portuguese flags;
- the calendar date horizon;
- unique series/date/distance keys;
- complete same-day distance publication;
- removal of entry links from finished events;
- the FFA no-copy safeguard;
- the absence of invented Spanish 2027 recurrences;
- representative multi-distance festivals in all three countries.
