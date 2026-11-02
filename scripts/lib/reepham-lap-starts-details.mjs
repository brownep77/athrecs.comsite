/** Immutable PR #794 publication payload; later organiser corrections are a new batch. */
export const REEPHAM_LAP_STARTS_DETAILS = {
  "reepham-cross-country|2027-01-31": {
    summary: "One- and two-lap cross-country races from Whitwell Station near Reepham.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/746",
    checkedAt: "2026-10-21",
    starts: {
      "5K": {
        time: "10:15",
        note: "Adult one-lap 5K starts 10:15; juniors start 10:00. Owner clarification on 21 October 2026 distinguishes the adult 5K from the two-lap 10K at 10:30. The provider wording remains inconsistent; this correction records the owner's clarification, not a new organiser reply.",
        publicNote: "Adult one lap (approximately 5K): 10:15. Juniors start 10:00.",
      },
      "10K": {
        time: "10:30",
        note: "Adult two-lap 10K starts 10:30. Owner clarification on 21 October 2026 distinguishes this from the adult one-lap 5K at 10:15. The provider wording remains inconsistent; this correction records the owner's clarification, not a new organiser reply.",
        publicNote: "Adult two laps (approximately 10K): 10:30.",
      },
    },
  },
};
