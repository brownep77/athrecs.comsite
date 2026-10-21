/** Immutable evidence used by the already-published PR #790 batch. */
export const OFFICIAL_START_TIME_DETAILS = {
  "reepham-cross-country|2027-01-31": {
    summary: "One- and two-lap cross-country races from Whitwell Station near Reepham.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/746",
    checkedAt: "2026-10-21",
    starts: {
      "5K": {
        time: "10:15",
        note: "Adults 10:15; juniors 10:00. Using Reepham Runners’ race programme; the entry table still lists adults at 10:30. Check your final race instructions.",
      },
      "10K": {
        time: "10:15",
        note: "Adult start from Reepham Runners’ race programme. The entry table still lists 10:30; check your final race instructions.",
      },
    },
  },
  "marriotts-way-races|2027-02-21": {
    summary:
      "Point-to-point marathon and half-marathon trail routes along Marriott’s Way, finishing in Aylsham.",
    timeZone: "Europe/London",
    sourceUrl: "https://boghopperraces.co.uk/2027-marriotts-way-races-1",
    checkedAt: "2026-10-21",
    starts: {
      Marathon: {
        time: "09:00",
        note: "Using Boghopper Races’ 2027 race-day timetable: registration 07:30–08:30, race start 09:00. The entry-page description still gives 08:30.",
      },
      Half: {
        time: "10:30",
        note: "Using Boghopper Races’ 2027 race-day timetable: registration 08:30–10:00, race start 10:30. A summary bullet still gives 10:00; check your final race instructions.",
      },
    },
  },
};
