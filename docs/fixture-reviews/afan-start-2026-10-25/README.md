# Afan held start resolved — catalogue revision 385

Published on 25 October 2026 at 16:40:26 UTC. This is the isolated resolution of
the Afan database hold documented in [PR #962](https://github.com/brownep77/athrecs.comsite/pull/962).
That PR was still open at review; its other research/display changes were not
merged or replayed by this work.

## Source and canonical records

The [organiser's current programme](https://www.aspirexevents.com/e/rtt-afan-forest-trail-10k-and-5k-13869)
was opened on 25 October. It confirms 29 November 2026 at Bryn Bettws Lodge,
Pontrhydyfen, Port Talbot: briefing 10:50, both 5K and 10K starts 11:00 local
Europe/London (GMT). The briefing is not the race start.

Canonical event ID **3061155**, slug `rtt-afan-forest-trail-10k-5k`, is unchanged.

| Edition ID | Distance | Before                       | Published                                      |
| ---------- | -------- | ---------------------------- | ---------------------------------------------- |
| 108804223  | 5K       | No start; directory evidence | 11:00; organiser evidence appended             |
| 71613968   | 10K      | 11:00; directory evidence    | 11:00 reconfirmed; organiser evidence appended |

No event, edition, distance or entry option was created. Only edition
`start_time`, `source_url`, and `notes` changed. Original notes are retained;
full before/after records and entry options are in the normal catalogue ledger.
The 5K's existing TBC entry status is unchanged: it is separate from its now
verified start. The different Afan half-marathon event on 14 November is untouched.

## Why publication was held

Six ready batches from 24–26 August contained the canonical event and both
29 November distances. All twelve queued edition rows omitted `startTime`.
`applyImportBundle` maps that omission to NULL, and its edition upsert assigns
`start_time = excluded.start_time`. Publishing those old batches would therefore
clear the already stored 10K start as well as any newly published 5K start.
This was a queued overwrite risk, not a conflicting organiser timetable,
missing database access, duplicate canonical edition, or missing organiser time.

## Scoped queue reconciliation

The transaction locked the catalogue revision pointer, canonical rows and queue;
checked revision 384, complete edition/event/entry baselines, the exact set of
six overlapping batch IDs, full payload hashes and the original staged rows;
then staged and validated this two-edition correction before publication.

Each of the twelve existing queued Afan edition payloads now carries 11:00 and
the organiser source/note. Their earlier source URL is retained in the note.
Batch and staged payloads are consistent, their hashes were refreshed, and
the original Afan payloads, hashes and validation metadata are retained in
this new batch's `validation_summary.queueReconciliation` and `review.json`.

All six batch IDs/source keys remain the same and remain ready. Their event
rows, unrelated editions, entry links/options, distances and statuses are
unchanged. None of those entire queued imports was published by this task.
Independent readback verified all of these properties. This resolves the
existing six overlaps; it does not globally change the importer's omission
semantics or approve future/unreviewed batches.

## Verification and audit

- Exact captured production rehearsal: **64 checks passed**, including stale
  revision, changed edition, changed queue payload, late staged-row conflict,
  newly overlapping import, transaction rollback and idempotency.
- Synthetic standalone regression: **58 checks passed**.
- All six reconciled batches passed the actual application validator in the
  isolated database. Publishing each reconciled Afan subset through the real
  publisher retained both 11:00 starts.
- **382 calendar assertions** and fixture-start clarity checks passed. ESLint
  passed for the added regression script.
- Live canonical page displayed **Starts 11:00 GMT** for both distances.
- Both actual live form submissions to `/api/event-calendar` returned HTTP 200
  calendar downloads with `DTSTART:20261129T110000Z` and the original edition UIDs.
- Independent database readback confirmed revision **385**, two audited edition
  updates, one new start, one reconfirmation, no duplicate creation, and complete
  preservation of revision **384** and its nineteen audit entries.

Files: `review.json` is the reviewed baseline and queue plan; `publish.sql` is
the exact executed guarded transaction; `readback.json` records the independent
database and live-page/calendar results. The SQL is not connected to builds or
automatic deployment. Its stable batch ID makes later execution a no-op after
publication or rollback.

Run the repeatable regression with:

```sh
node scripts/verify-afan-start-reconciliation.mjs
```

An optional captured snapshot JSON path runs the exact-production rehearsal.
The capture contains public fixture/import records and stays outside source control.

Normal latest-revision rollback can restore the two edition before-snapshots.
Queue amendments intentionally retain the independently confirmed starts;
restoring queue metadata requires its recorded before values and fresh guards.
No access or pending-import conflict remains for this start publication.
Unrelated unverified/qualified/window times remain held.
