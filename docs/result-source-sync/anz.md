# Athletics New Zealand athlete imports

Staff can paste an ANZ athlete profile into **Athlete tools → Add one athlete from a link**. Review the existing athlete match or create a private profile, then choose **Preview ANZ results**. Compare the returned identity and performance rows with ANZ before saving.

The importer follows the public athlete form, submitting each listed event with **ALL YEARS** and newest-first ordering. It retains the original marks, wind, placing annotations, dates, meetings and venues, together with the stable athlete ID and event/row locator. Championship medals come from the separately labelled championship table: a result-table place is not interpreted as a championship medal. Year-only medals remain year-only. Missing nationality, chip/gun basis and category positions remain unknown.

The preview makes no database changes. Saving fetches the source again and checks a content/version digest, exact linked source identity, athlete name, ownership and existing history. It rejects changed or missing historical marks, unexpected tables, pagination and partial event captures. Account-managed athletes require owner review. New histories stay private; existing publication settings, exclusions and disqualifications are retained. The previous history and source metadata are archived in the transaction audit.

Eligible running performances feed the public ANZ PB and annual-progression view. Track and road disciplines stay separate, decimal precision is preserved, and unsupported, unverified, excluded, disqualified, wind-assisted and annotated nonstandard marks do not become PBs. This is coverage of results available on ANZ, not a claim of a complete racing career.

Validation:

- `node scripts/verify-anz-import.mjs`: synthetic source tables, identity checks, precision, privacy, repeat imports, stale previews and transaction rollback.
- `node scripts/verify-anz-browser.mjs`: synthetic desktop/mobile interaction fixture. Requires a supported Playwright Chromium installation; optionally set `ATHRECS_CHROMIUM_PATH`.
- Existing profile timeline, achievement and athlete-link checks cover integration behaviour.

Do not commit real source captures, database snapshots, connection strings or private audit exports. ANZ retrieval is staff-triggered; no scheduled scraping or automatic publication is enabled.
