# Athletics New Zealand athlete imports

Staff can paste an ANZ athlete profile into **Athlete tools → Add one athlete from a link**. Review the existing athlete match or create a private profile, then choose **Preview ANZ results**. Compare the returned identity and performance rows with ANZ before saving.

The importer follows the public athlete form, submitting each listed event with **ALL YEARS** and newest-first ordering. It retains the original marks, wind, placing annotations, dates, meetings and venues, together with the stable athlete ID and event/row locator. Championship medals come from the separately labelled championship table: a result-table place is not interpreted as a championship medal. Year-only medals remain year-only. Missing nationality, chip/gun basis and category positions remain unknown.

The preview makes no database changes. Saving fetches the source again and checks a content/version digest, exact linked source identity, athlete name, ownership and existing history. It rejects changed or missing historical marks, unexpected tables, pagination and partial event captures. Account-managed athletes require owner review. New histories stay private; existing publication settings, exclusions and disqualifications are retained. The previous history and source metadata are archived in the transaction audit.

Eligible recorded running performances feed profile PBs and annual progression; verification is a separate tick. Track and road disciplines stay separate, decimal precision is preserved, and excluded, disqualified, wind-assisted and annotated nonstandard marks do not become PBs. This is coverage of results available on ANZ, not a claim of a complete racing career.

The parser retains a `Road` label for ANZ's unqualified kilometre events, Half Marathon, Marathon and road mile. This is ANZ-specific classification, not a distance-to-surface assumption for other sources. ANZ's [Ground Rules](https://www.anzrankings.org.nz/userfiles/file/Ground_Rules_for_performances_for_Rankings_lists.pdf), Presentation Format point 3, distinguish kilometre road events from metre track events; its [ranking standards](https://www.anzrankings.org.nz/userfiles/file/Minimum_Performances_for_Ranking_Purposes.pdf) list the marathon disciplines in that road-distance group. Both were checked on 22 October 2026. The [abbreviation list](https://www.anzrankings.org.nz/site/abbrev_con) identifies `DH` as a downhill road course: retain that source note and an aided-course qualification so it cannot silently become an unqualified PB.

Legacy histories may lack these surface labels. Any correction must match the exact source and disciplines, preserve result values, order, publication and review flags, and archive the complete before/after history in the private audit. Do not change the shared PB rule to admit unknown surfaces.

Validation:

- `node scripts/verify-anz-import.mjs`: synthetic source tables through profile PB selection (including slower pacing results, half marathon, track separation, unknown surfaces, downhill qualifications and privacy), identity checks, precision, repeat imports, stale previews and transaction rollback. This runs in the quality gate.
- `node scripts/verify-anz-browser.mjs`: synthetic desktop/mobile interaction fixture. Requires a supported Playwright Chromium installation; optionally set `ATHRECS_CHROMIUM_PATH`.
- Existing profile timeline, achievement and athlete-link checks cover integration behaviour.

Do not commit real source captures, database snapshots, connection strings or private audit exports. ANZ retrieval is staff-triggered; no scheduled scraping or automatic publication is enabled.

## Results beyond ANZ

An exhausted ANZ event search is not a complete racing career. For New Zealand profiles,
also inspect the athlete's club archives, regional governing-body result sheets, national
championship results and the original timing provider. Keep these in separate source
histories so an ANZ refresh cannot remove them. Every additional row needs a source-row
comparison and identity evidence; a same-name search hit alone is insufficient.

Retain cross-country disciplines explicitly (for example `5km XC`) and label relay-leg
marks separately from team totals and individual races. Record pacing roles, original
time precision and the exact placing classification. Do not count mirrored results or
rounded versions as additional races. Conflicting dates, unidentified abbreviated names
and source disagreements require review before publication. Scope each history as partial
unless its own defined coverage has actually been checked.
