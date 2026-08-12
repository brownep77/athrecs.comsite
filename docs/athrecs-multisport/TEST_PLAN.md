# Staging Test Plan

## A. Migration and legacy regression

- [ ] Apply 0004–0007 to a fresh database with the existing 0001–0003 migrations.
- [ ] Apply them to a copy of the current catalogue.
- [ ] Run every migration a second time through the repository migration runner; no file should reapply.
- [ ] Existing event counts remain unchanged.
- [ ] Existing athlete and result pages still load.
- [ ] `public_event_catalogue_v` includes legacy editions once, not twice.
- [ ] `athlete_result_feed_v` includes existing results once.
- [ ] Distance filtering returns equivalent kilometre, mile and metre events when using normalized metres.
- [ ] Athlete activity breakdowns include legacy and generic entries by sport, surface and geography.

## B. Authentication and permissions

- [ ] Signed-out organiser/athlete/reviewer writes return 401.
- [ ] Organisation viewer cannot edit or upload.
- [ ] Results uploader can upload but cannot edit event information.
- [ ] Legacy `importFromCsv`, `importFromJson` and `importResults` reject signed-out and ordinary organiser accounts.
- [ ] Results uploader can upload only for linked events.
- [ ] Organisation member cannot edit another organisation’s event.
- [ ] Reviewer function rejects a normal organiser account.
- [ ] Athlete private data cannot be read using another athlete ID.
- [ ] A verified coach/agent without explicit capabilities cannot read address, emergency-contact, identifier, consent or buying data.
- [ ] Equipment, public settings, private passport, preferences and consent each enforce their own capability.

## C. Organisation and event claim

- [ ] Create an organisation; it starts pending/unverified.
- [ ] Submit a claim for an existing event with evidence.
- [ ] The organisation cannot edit the event before approval.
- [ ] Reviewer requests changes and organiser sees the note.
- [ ] Reviewer approval creates an active `organisation_events` relationship.
- [ ] Timing-partner approval grants upload rights without broad event editing.
- [ ] A second owner claim does not silently replace the existing owner.

## D. New event and edits

- [ ] Submit an event with multiple competitions.
- [ ] Event, occurrence and competitions remain private/pending.
- [ ] Reviewer rejection leaves them non-public.
- [ ] Reviewer approval makes the event and occurrence public and records provenance.
- [ ] Submit event, occurrence and competition edits; public data does not change before approval.
- [ ] Approved edits change only allow-listed fields.

## E. Results upload

- [ ] Upload the CSV template with a verified event relationship.
- [ ] Invalid rows remain staged with row-level errors.
- [ ] Duplicate rows and duplicate external entry keys are detected.
- [ ] Source/evidence and identity warnings appear.
- [ ] A participant-kind mismatch is blocking.
- [ ] Repeated ranks warn when ties are disabled and pass when ties are enabled.
- [ ] An upload with blocking errors cannot publish.
- [ ] Request changes, correct the file and upload again.
- [ ] Reviewer approval publishes all rows atomically.
- [ ] Repeating approval is idempotent.
- [ ] A corrected upload reusing `externalEntryKey` reuses the entry, creates a new active result version and marks the prior result superseded.
- [ ] Metrics and segments are replaced correctly on correction.
- [ ] Team, relay and crew member rows publish correctly.

## F. Athlete workflow

- [ ] Self claim requires review and creates no access before approval.
- [ ] Parent/guardian claim is separately identified and reviewed.
- [ ] A request for more athlete-claim evidence can be resubmitted into the same case without creating a second open case.
- [ ] Private profile fields never appear in the public API.
- [ ] Location visibility private/country/county/city is applied server-side.
- [ ] Public equipment appears only when both profile and item visibility permit it.
- [ ] Result claim: belongs to me, not mine, correction and duplicate all follow review.
- [ ] Repeated result-claim submission does not create duplicate open cases; requested evidence reopens the existing case.
- [ ] Missing result remains unpublished until approval.

## G. Sport examples

- [ ] Time result: running or swimming.
- [ ] Team win/loss result: football.
- [ ] Judged multi-metric result: gymnastics.
- [ ] Multi-segment result: triathlon.
- [ ] Round/heat structure: athletics or swimming.
- [ ] Add a new sport and discipline from taxonomy administration without changing the database schema.

## H. Operational and security

- [ ] Rate limits and upload-size limits are configured.
- [ ] Original files are private and malware-scanned.
- [ ] Logs do not contain private Athlete Passport or evidence-document contents.
- [ ] Backup/restore is tested.
- [ ] Reviewer and organiser actions appear in `audit_log`.
- [ ] Every approved public entity/result has provenance.
