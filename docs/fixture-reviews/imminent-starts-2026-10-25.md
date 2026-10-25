# Imminent fixture start review — 25 October 2026

Owner request: continue actively checking missing race starts, with priority to imminent editions. This pass examined 16 of the initial 66 missing-start editions for 25–27 October; 50 were not researched in this pass. This is not a complete check of the next seven days or the catalogue. Requery the database before continuing because other work can change the queue.

## Published corrections

- Chengdu Marathon: first marathon groups 07:30, later marathon groups 07:50, local UTC+8. Keep the half marathon's 08:10 start separate.
- BCS Oktoberfest Half, College Station: published starts from 07:00 CDT; individual wave detail remains unverified and is explicitly qualified. Entries closed.
- Athletics South Australia All Schools, Sunday: programme starts 09:00 ACDT, with separate individual event times.
- Niagara Falls Marathon: show provisional 08:15 EDT; the organiser still labels it tentative, so retain a null exact clock.
- Tirana: retain old 25 October rows for audit and exclude them from public fixtures. Add only the confirmed marathon, half marathon and 10K to the same canonical family on 15 November at 09:00 CET. Do not infer the current We Too distance or add its old 2.3K category.

The machine-readable evidence/checkpoint records each opened page and outstanding issue. `scripts/lib/imminent-starts-2026-10-25-review.mjs` captures exact previous public fixture values. Publication locks the catalogue, checks those baselines, permits only explicitly absent reviewed additions under the expected canonical event, and records one reversible audited revision. Seeds and presentation use the same edition-scoped reviewed facts. Reruns are idempotent.

## Date and duplicate holds

- Cramond: the organiser calendar says 1 November, but its linked booking page says 25 October. Withhold the 25 October date and preserve original rows, including the previously stored 10:00 ten-kilometre start. Do not claim a confirmed postponement.
- X-ray Marathon: verified duplicate of Röntgenlauf's existing marathon edition, already 09:30 CET. Withhold the duplicate date; preserve both source histories.

## Continue next

Start with the 50 `unchecked_in_this_pass` entries in the checkpoint, after a fresh live query, then expand to the rest of the next seven days. Revisit the unresolved Ghent distance mapping, inaccessible IRONMAN organiser schedule, Turkistan exact race-start programme, Kashmir's pending official timetable and Cramond's date discrepancy. Niagara needs final confirmation; BCS needs accessible per-wave instructions; Tirana We Too needs its current distance. An indexed snippet or a general event opening time is never sufficient to clear those holds.

Run `node scripts/verify-imminent-starts.mjs` for baseline conflict, canonical identity, absent-row guard, transaction audit, replay, seed, edition scope, wave/provisional calendar and date-hold checks. Read back the published rows and live race pages after deployment before claiming the corrections are live.
