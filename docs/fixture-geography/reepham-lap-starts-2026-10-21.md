# Reepham lap starts — owner clarification, 21 October 2026

The owner clarified the 31 January 2027 schedule after PR #793:

> 5k is 10.15 and 10k is 10.30 for reepham. it wasn't clear but it shows 1 lap and 2 laps.

| Category | Laps / approximate distance | Local start (GMT) |
| -------- | --------------------------- | ----------------- |
| Juniors  | One lap / 5K                | 10:00             |
| Adults   | One lap / 5K                | 10:15             |
| Adults   | Two laps / 10K              | 10:30             |

The [Total Race Timing entry page](https://totalracetiming.co.uk/race/746), opened
again on 21 October 2026, identifies one lap as approximately 5K and two laps as
approximately 10K. Its programme still says adults 10:15, and both senior entry
options still say 10:30. Juniors are consistently listed at 10:00. The distance
mapping above therefore records the owner's explicit clarification, not a newly
received organiser reply or an assertion that the provider has corrected its
text. The adult starts are separate distance starts, not inferred waves within
one race. No additional provisional or early-start arrangement is established.

## Publication and safeguards

The batch `athrecs:owner-clarified-reepham-laps:2026-10-21` updates only edition
109456641 (adult 5K, null to 10:15) and 109456642 (adult 10K, null to 10:30),
under event 3059189. The junior start remains a category-specific note on the
shared 5K edition. The database retains original notes and the provider URL;
the before/after ledger preserves both previous null values. Public schedule
copy shows the current lap-specific information rather than superseded review
notes. Publication guards the exact state produced by #793 and aborts on any
unexpected change. The #793 batch inputs are frozen to preserve its history.

The isolated Postgres rehearsal checks the full sequence of three batches,
stale-baseline rollback, exactly two changed editions, retained source and
notes, repeat publication and year scoping. Marriott's Way remains untouched
at 09:00 / 10:30. All three unsupported-date holds from #782 remain intact;
unresolved starts elsewhere continue to return TBC.
