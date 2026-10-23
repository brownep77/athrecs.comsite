# Multisport retrospective review — 23 October 2026

This pass screens coverage across all eleven sport sections, revisits the previous multisport publication and extends reviewed source records. Inventory screening is not independent verification of the entire catalogue.

## Source comparison and additions

- Rechecked 85 existing unclaimed profiles and their source-reported sporting nationalities: 81 World Triathlon and four World Aquatics profiles.
- Recompared all 156 previously published observations: 81 individual elite triathlon/duathlon performances and 75 swimming personal-best observations.
- Added 179 completed triathlon performances to the same federation athlete IDs, comparing programme JSON, programme XLSX and each athlete's history XLSX. Twelve programme editions provide canonical results links; source histories remain the profile display source to prevent double counting.
- Published 71 explicitly supplied birth years and five stated birthplaces. Exact dates of birth remain absent. No residence, citizenship, representative or account identity is inferred from these facts.
- Held 14 non-finish/lapped rows and four duathlon performances whose programme source omits component distances. Those observations are retained privately, outside completed-result totals.
- Added seven UCI programme fixtures: the 2028 Track World Cup in Saint-Quentin-en-Yvelines; the three 2027 Para Cycling Road World Cups in Chiang Mai, Maniago and Brasília; and the revised 2028 Road and Gran Fondo World Championships in Abu Dhabi and BMX Racing World Championships in Houston. Start times, entry availability and classification-specific distances remain unspecified.

Original captures, source rows, comparison plans, previous values and publication receipts are retained in the staff-only audit. Source comparison does not establish account ownership. Public profiles expose approved facts, never the raw evidence or source biography.

## Federation directory

Twelve national athletics/cycling bodies were added for China, Chinese Taipei, Nepal, Vietnam, Sri Lanka and Macau. Asian Athletics and UCI membership references were also refreshed for eighteen existing athletics/cycling entries across Japan, India, Singapore, South Korea, Malaysia, Thailand, the Philippines, Indonesia and Hong Kong. This is a membership review; it does not independently reverify every existing discipline-specific statement.

The directory now contains 349 organisations, including 301 national federations, across 75 countries and territories. Existing all-sport navigation, territory filters and distinctions between federations, funding bodies and Olympic bodies remain in place. Nepal's UCI listing and its own website use different federation/association wording; both are retained explicitly.

## Coverage limits and remaining work

The catalogue screen covers road running, trail running, parkrun, track and field, triathlon, road cycling, mountain biking, track cycling, BMX, swimming and duathlon. All screened upcoming editions had a source URL; that checks source presence, not the currency or contents of every URL. Missing start times remain unknown until an edition-specific organiser timetable or governing-body fixture establishes them. Recurring parkrun inventory is not counted as newly confirmed fixtures.

Blank primary nationality fields are not automatically missing public nationalities: reviewed DUV and World Marathon Majors observations can supply approved fallbacks. No bulk replacement of those records was attempted. Other providers and sports remain in the retrospective review queue; this pass does not certify every athlete, fixture or result in the database.

## Application validation

Approved year-only facts display as “Birth year”, never an invented birthday. Approval must match the exact athlete and stored value. A later birthday privacy choice suppresses the year. Birthplace approval likewise applies to the exact current value. Anonymous profile tests cover unreviewed values, changed facts, wrong-athlete approvals, account links and private evidence leakage.

Publication is rehearsed on a copied Neon branch with atomic source/ownership guards, original-value checks and independent readback before production. Public account/private-profile exclusions use the actual account-link and resolved identifier relationships; UUID private profile IDs are not compared with integer catalogue IDs.
