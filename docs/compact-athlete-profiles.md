# Compact athlete profiles

- `/athletes/:slug`: compact, filterable results with sport, distance, location flag, time, place, category and source. Manually supplied fixtures use the Upcoming tab.
- `/athlete-account`: nationality, country of birth, birthday display, running age category, current/previous club, coach, manager and contact preference. Per-sport coaches remain available. Sharing is saved separately and defaults off.
- `/my-athlete-profile`: account-owned fixture add/edit/remove and compact results. Existing claim, hidden-result and restore controls remain intact.
- `https://update.athrecs.com/admin/athlete-directory`: staff-only storage, search, sports and visibility filters, source fixture management and XLSX export of every matching athlete. The second worksheet contains one row per athlete/sport.
- Existing `ATH-xxxxxx` references are retained. Only verified ownership links consolidate source records under an account reference; matching names do not merge people.

## Release order

1. Deploy the UI and `0033_compact_athlete_profiles.sql`. This stores the fields without changing production publication settings.
2. Verify the new UI on the production deployment.
3. Deploy `migrations/0034_publish_paul_compact_profile.sql` after step 2. Only Paul's source profile/results and any already claimed account are activated. This sequencing prevents the old UI from exposing the seeded birthday before the privacy-aware projection is live.
4. Check `/athletes/paul-browne`, flags/tooltips, and the staff directory. Confirm the birthday is absent.

## Verification

`npm run verify:compact-athlete-profiles` exercises real authenticated HTTP handlers and a disposable Postgres-compatible database: saved account fields, both sports under one ID, all birthday options, fixture creation/edit/reload/deletion, rejected cross-account mutation, staff access restrictions, complete filtered export read back with ExcelJS, hidden-profile lookup and publication withdrawal. It is included in `npm run ci:verify`.

The export includes private staff account information and never runs through a public route. Contact preference does not change marketing consent or publish email addresses.

## Medals, personal bests and achievements

Profile headers now include a compact PB strip and achievements board on source, shared and account profiles. Medal icons mark completed events, not podium placings or confirmed physical medals. PB row badges use the full visible result set, not the current page or year filter.

Counts cover completed events, running marathons, running ultras and known race countries. Duplicate editions count once; conflicting sources, non-finishes and future events do not count. Cycling/swimming distances cannot earn running milestones. UK home nations count as one country. Figures reflect only visible records and grow as results are added; no self-reported lifetime totals are silently treated as verified.

The two-marathon milestone requires two distinct completed marathons within seven consecutive calendar dates (start day through start + six days), across calendar week/year boundaries. Partial and invalid dates cannot establish it. Expanding a count or the achieved milestone reveals its supporting races. No new data collection or schema change is required. `npm run verify:profile-achievements` covers the counting and boundary rules.

## Automatic achievement milestones

All three profile surfaces calculate first recorded finishes/distances, finish-count milestones, marathon/ultra totals, different countries, multiple sports, calendar years with results, comparable PB improvements and consecutive-day marathons. Earned badges expand to their supporting races and retain athlete-submitted/source-linked labels. Profiles without results show a first-finish goal. The next finish milestone updates when results change; achievements are computed from permitted visible results, never a background scan of private or unconfirmed identities.

Marathon-major recognition uses an explicit event-slug and country allowlist and requires a dated full-marathon finish. Repeat finishes increase total completions but not distinct majors. Sydney counts from 2025 and Cape Town from 2026; earlier special eligibility remains unawarded until explicitly confirmed. The original six are recognised separately, without claiming that AthRecs issues or verifies the official Six Star medal. Rules were checked against https://www.worldmarathonmajors.com/six-star/how-it-works on 16 September 2026. No official medal artwork, collectible purchase flow or payments are enabled.

## Production rollout

The privacy-aware profile UI was deployed in PR #472 (production commit `cc5894c524453d2aa78deed945219aad3bfafa81`) and verified on www.athrecs.com on 16 September 2026. Harry Styles’ existing public profile returned the compact results, PB strip, achievements board and two distinct marathon majors; Paul’s source URL remained private and did not expose his birthday. Migration 0034 is now enabled for the second publication stage.

`npm run verify:paul-profile-publication` exercises the migration against a disposable database, including repeat application, existing and new share URLs, preserved field sharing, hidden results, stable athlete IDs, birthday privacy and unchanged visibility for another athlete. It is part of the full quality gate.
