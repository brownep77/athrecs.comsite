/** Exact two-row baseline after PR #793; preserve prior notes and reject concurrent edits. */
export const REEPHAM_LAP_STARTS_REVIEW = {
  sourceKey: "athrecs:owner-clarified-reepham-laps:2026-10-21",
  checkedAt: "2026-10-21",
  baseline: {
    "reepham-cross-country|2027-01-31|10K": {
      id: 109456642,
      event_id: 3059189,
      distance_km: 10,
      status: "Open",
      start_time: null,
      source_url: "https://totalracetiming.co.uk/race/746",
      notes:
        "Approximate lap distances: one lap 5K; two laps 10K. Juniors (5K) start 10:00. Adult 5K/10K start time unresolved: narrative says 10:15, entry categories say 10:30. Checked 10 October 2026; confirm with Reepham Runners. Junior/adult categories are not duplicated as separate same-distance editions.\nDate checked 2026-10-20 against https://totalracetiming.co.uk/race/746. Adult times conflict: 10:15 in the programme and 10:30 in the entry table; confirm with the organiser.\nDate checked 2026-10-21 against https://totalracetiming.co.uk/race/746. Adult start from Reepham Runners’ race programme. The entry table still lists 10:30; check your final race instructions.\nDate checked 2026-10-21 against https://totalracetiming.co.uk/race/746. Adult two-lap start TBC. The programme gives 10:15 but the senior entry option gives 10:30. Organiser clarification requested; do not treat the conflicting times as separate waves.",
    },
    "reepham-cross-country|2027-01-31|5K": {
      id: 109456641,
      event_id: 3059189,
      distance_km: 5,
      status: "Open",
      start_time: null,
      source_url: "https://totalracetiming.co.uk/race/746",
      notes:
        "Approximate lap distances: one lap 5K; two laps 10K. Juniors (5K) start 10:00. Adult 5K/10K start time unresolved: narrative says 10:15, entry categories say 10:30. Checked 10 October 2026; confirm with Reepham Runners. Junior/adult categories are not duplicated as separate same-distance editions.\nDate checked 2026-10-20 against https://totalracetiming.co.uk/race/746. Junior start 10:00. Adult times conflict: 10:15 in the programme and 10:30 in the entry table; confirm with the organiser.\nDate checked 2026-10-21 against https://totalracetiming.co.uk/race/746. Adults 10:15; juniors 10:00. Using Reepham Runners’ race programme; the entry table still lists adults at 10:30. Check your final race instructions.\nDate checked 2026-10-21 against https://totalracetiming.co.uk/race/746. Adult one-lap start TBC; juniors start 10:00. The programme gives adults 10:15 but both senior entry options give 10:30. Organiser clarification requested; separate adult waves have not been confirmed.",
    },
  },
};
