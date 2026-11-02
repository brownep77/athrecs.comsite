# Reepham Cross Country — 31 January 2027

Reviewed 31 October 2026. Venue: Whitwell Station. Timezone: Europe/London (GMT on race day).

| Programme | Approximate distance | Confirmed local start |
| --- | --- | --- |
| Juniors, one lap | 5K | 10:00 |
| Seniors, one lap | 5K | 10:15 |
| Seniors, two laps | 10K | 10:15 |

The organiser’s 31 October reply at 13:51 UTC confirms juniors 10:00 and seniors 10:15. Fresh inspection of https://totalracetiming.co.uk/race/746 now shows 10:15 for both senior entry options, 10:00 for juniors, and matching programme text. The previously observed 10:30 entry-option discrepancy has been corrected. No clarification email is needed.

The organiser website linked by that entry page, https://www.reephamrunners.co.uk/cross-country, returned 404 during this review. The authorised entry programme provides explicit distance-specific confirmation.

PR #794 recorded the earlier owner clarification (5K 10:15; 10K 10:30), rather than a new organiser response. Its publication payload is frozen separately, preserving the old batch and its checked date. The new reviewed batch retains canonical edition IDs 109456641 and 109456642, source URL and all existing notes. Its exact baseline was captured from the live race page before editing; the 10K correction explicitly authorises 10:30 → 10:15. Junior start remains in the programme notes because the existing 5K edition represents both age categories.

The production deployment stages, validates and publishes the new batch through publishCheckedFixtures. The public fixture details supply the current programme to race cards, entry-option notes and calendar payloads. Historical notes remain in storage and the change log. No distance, price, availability or entry URL is changed.

Validation: rehearse historical batches and the new correction with audit, exact baseline and repeat-publication checks; check event colours, calendar controls and TypeScript. After deployment, inspect the live race page and both distance calendar payloads for 10:15, junior programme 10:00 and Europe/London, with no current 10:30 programme.

Production baseline follow-up: the public readback decorates stored notes with presentation annotations. Do not compare those decorated notes to raw database notes. The guard checks canonical IDs, date/distance, status, source and prior clocks; the publisher appends to the raw stored notes and audits before/after snapshots. Regression rehearsal verifies concurrency rejection, explicit time-change authority and raw history preservation.
