# Joe Skipper publication — 19 September 2026

User requested the researched multisport history on AthRecs, duplicate checks, and visible original results marked with an asterisk, symbol and the specific disqualification reason.

## Identity and scope

- Reuse Joe Skipper, athlete 128 / ATH-000128 / `joe-skipper`. No new athlete or account is created.
- Production checks found only this name/surname profile and no conflicting Power of 10 identity (366603); it is unclaimed and was private.
- Import 44 selected results: 10 running, 12 cycling, 19 triathlon and 3 duathlon/bike–run; 12 are disqualified. Add two decimal track performances to source history. This is not a complete career archive.
- Preserve triathlon swim/bike/run splits beneath their parent result. No standalone swimming race was verified. Cancelled-swim events retain their actual format. IRONMAN UK 2018 used a shortened course; Chattanooga's longer course is not assigned an exact aggregate distance.
- PTO reports 325.55 miles in his 2020 12-hour ride; mention the historical distance in his bio without claiming current record-holder status. Sub7 exhibition and unsupported local duathlon leads remain outside canonical results.

## Status evidence

[ITA announcement, 4 September 2026](https://ita.sport/news/the-ita-acknowledges-the-international-hearing-panel-decision-sanctioning-ironman-athlete-joe-skipper/) reports the IHP decision dated 17 August 2026: competitive results since 15 May 2025 are disqualified for three whereabouts failures. It records an appeal right; it does not report a positive drug test. This publication reflects that announced decision.

Store `status = DQ`, retain original time/place, and attach result-level decision metadata. The UI shows `*`, an alert icon, the specific reason and an expandable explanation with the official source. Whereabouts and positive-test reasons are distinct. SQL prevents decision metadata being paired with a finished status; PB and achievement functions also reject it defensively. Source-history rows support the same marker. Event results show DQ instead of assigning the original placing as a valid rank.

## Existing results reviewed

- Keep Aylsham 2025 (11970) and Great Yarmouth 2026 (11358), with disqualification metadata.
- Correct Worstead 2026 (11113) from the old 26:05 to the current timing-provider source: chip 25:52.5, gun 25:53.3. Preserve source precision in the note; display 25:53. Mark disqualified.
- Keep 12255 (purported 1 July 2024 Wroxham) and 11181 (purported 1 July 2026 Wroxham) private. The first lacks a matching dated source; the linked current 2026 timing page does not list Joe Skipper. Do not invent a disqualification for an unsubstantiated performance.
- Race-page visibility now respects result publication instead of exposing every private result when its athlete becomes public.

## Publish and verify

1. Apply migration 0037 and `publish.sql` to an isolated production branch. Read back identity, visibility, result count, statuses and retained private rows. Repeated imports use existing athlete/event/edition/result keys.
2. Deploy the schema and UI; keep Joe private until the production marker is available.
3. Run the checked `publish.sql` on production. It locks Joe's existing row, rejects a new ownership link or conflicting identity, records before/after snapshots in the staff audit log and checks the expected public count/statuses in the same transaction.
4. Check the live profile, status detail/source links, filters, original times and PB/achievement exclusion.

`build-data.py` produces the reviewed manifest; `build-sql.mjs` produces the explicit publication transaction. These are not automatic seed or build actions and cannot silently overwrite later source corrections. The two private legacy rows are retained for staff review.

Tests: `npm run typecheck`, lint of changed application files, production build, `verify:result-disqualifications`, `verify:profile-achievements`, plus the isolated database publication/read-back. The new check is included in the repository quality gate.
