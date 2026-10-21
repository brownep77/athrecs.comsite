/** Immutable inputs to the already-published PR #793 batch. */
export const NORFOLK_CLARIFICATION_DETAILS = {
  "reepham-cross-country|2027-01-31": {
    summary: "One- and two-lap cross-country races from Whitwell Station near Reepham.",
    timeZone: "Europe/London",
    sourceUrl: "https://totalracetiming.co.uk/race/746",
    checkedAt: "2026-10-21",
    starts: {
      "5K": {
        time: null,
        note: "Adult one-lap start TBC; juniors start 10:00. The programme gives adults 10:15 but both senior entry options give 10:30. Organiser clarification requested; separate adult waves have not been confirmed.",
      },
      "10K": {
        time: null,
        note: "Adult two-lap start TBC. The programme gives 10:15 but the senior entry option gives 10:30. Organiser clarification requested; do not treat the conflicting times as separate waves.",
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
        note: "Published race start 09:00; registration 07:30–08:30. Boghopper Races’ 2027 timetable and FAQ (https://boghopperraces.co.uk/faqs) agree with the entry option. The entry-page programme still gives 08:30; clarification requested. No separate early start or wave is specified in the current timetable.",
      },
      Half: {
        time: "10:30",
        note: "Published race start 10:30; registration 08:30–10:00. Boghopper Races’ 2027 timetable and FAQ (https://boghopperraces.co.uk/faqs) agree with the entry option. A summary bullet and the entry-page programme still give 10:00; clarification requested. No separate wave is specified; follow final race instructions.",
      },
    },
  },
};
