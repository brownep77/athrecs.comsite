# Norfolk start-time clarification — 21 October 2026

PR #790 merged after #782. A fresh read of production race pages showed adult
Reepham 5K/10K at 10:15 and Marriott's Way marathon/half at 09:00/10:30 GMT.
Those were source-precedence decisions, not replies from organisers.

## Current evidence and decision

| Race / edition                                                      | Local race start | Evidence and remaining qualification                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reepham Cross Country, 31 January 2027, juniors (one lap, about 5K) | 10:00 GMT        | Both the [programme and junior entry option](https://totalracetiming.co.uk/race/746) agree. Retain as a junior-specific note; the shared 5K edition also includes adults.                                                                                                                                            |
| Reepham, adults (one or two laps, about 5K/10K)                     | TBC              | The same page gives 10:15 in the programme and 10:30 in both senior options. Neither is labelled as superseding the other or as a separate wave. The [club events page](https://www.reephamrunners.co.uk/runs-events) supplies no current timetable. Do not select an adult time while clarification is outstanding. |
| Marriott's Way, 21 February 2027, marathon                          | 09:00 GMT        | The [2027 organiser timetable](https://boghopperraces.co.uk/2027-marriotts-way-races-1), [organiser FAQ](https://boghopperraces.co.uk/faqs) and [entry option](https://totalracetiming.co.uk/race/693) agree. Registration is 07:30–08:30; that is not the start. The entry-page programme still says 08:30.         |
| Marriott's Way, half marathon                                       | 10:30 GMT        | The same timetable, FAQ and entry option agree. Registration is 08:30–10:00. A summary bullet and the entry-page programme still say 10:00.                                                                                                                                                                          |

All source pages above were opened on 21 October. Neither Marriott's Way
timetable start is labelled provisional; this is verification of the published
schedule, not a guarantee against later changes. No separate early/walker wave
is specified. The linked race brief is explicitly for 2026 and is not accepted
as 2027 evidence. Dates remain 31 January and 21 February 2027 respectively.

## Enquiries

On 21 October, clarification emails were sent through the connected email
account to the event-specific Reepham address published on race 746 and the
Boghopper address published in its FAQ. The requests distinguish each distance,
junior/adult categories, provisional versus final starts and possible waves,
and ask which timetable participants should follow. No reply has been relied
on in this correction. Message identifiers and account details are not included
in the public repository.

## Bounded publication

The new batch `athrecs:norfolk-start-clarification:2026-10-21` uses the existing
stage/validate/publish transaction and before/after ledger. It guards the exact
four-row state from #790, clears the two Reepham adult clocks, and adds current
qualifications and the FAQ source to the two unchanged Marriott's Way clocks.
Original notes and sources remain in the records and audit history.

The earlier batch's inputs are frozen so replay cannot redefine its evidence.
Completed/rolled-back batch checks remain in place. Unexpected row changes
abort the whole follow-up. The older holding batch mentioned in the #790 audit
must still be reconciled before publication; neither conflicting adult clock
is currently accepted. No edition, entry route, date or result is added or
removed. All three unsupported-date holds from #782 remain untouched.

The regression test rehearses both publications in isolated Postgres, checks
stale-baseline rejection and transaction rollback, verifies TBC despite a
stored fallback, preserves the junior note and Marriott's Way clocks, checks
year scoping and existing date holds, and confirms repeat publication cannot
restore the withdrawn adult times.
