/** Production baseline checked 23 October 2026; Janice's reply supersedes PR #793. */
export const MARRIOTTS_CONFIRMATION_REVIEW = {
  sourceKey: "athrecs:marriotts-organiser-confirmation:2026-10-23",
  checkedAt: "2026-10-23",
  startCorrections: {
    "marriotts-way-races|2027-02-21|Marathon": {
      from: "09:00",
      to: "08:30",
    },
    "marriotts-way-races|2027-02-21|Half": {
      from: "10:30",
      to: "10:00",
    },
  },
  baseline: {
    "marriotts-way-races|2027-02-21|Marathon": {
      id: 71609696,
      event_id: 74,
      distance_km: 42.2,
      status: "Open",
      start_time: "09:00",
      source_url: "https://boghopperraces.co.uk/2027-marriotts-way-races-1",
      entry_url: "https://totalracetiming.co.uk/race/693",
      notes:
        "Date checked 2026-10-20 against https://totalracetiming.co.uk/race/693. Programme says 08:30; entry table says 09:00. Start time awaits organiser clarification.\nDate checked 2026-10-21 against https://boghopperraces.co.uk/2027-marriotts-way-races-1. Using Boghopper Races’ 2027 race-day timetable: registration 07:30–08:30, race start 09:00. The entry-page description still gives 08:30.\nDate checked 2026-10-21 against https://boghopperraces.co.uk/2027-marriotts-way-races-1. Published race start 09:00; registration 07:30–08:30. Boghopper Races’ 2027 timetable and FAQ (https://boghopperraces.co.uk/faqs) agree with the entry option. The entry-page programme still gives 08:30; clarification requested. No separate early start or wave is specified in the current timetable.",
    },
    "marriotts-way-races|2027-02-21|Half": {
      id: 71609697,
      event_id: 74,
      distance_km: 21.1,
      status: "Open",
      start_time: "10:30",
      source_url: "https://boghopperraces.co.uk/2027-marriotts-way-races-1",
      entry_url: "https://totalracetiming.co.uk/race/693",
      notes:
        "The organiser states that the point-to-point trail distance is approximate.\nAdditional source retained from merged edition 71612068: https://boghopperraces.co.uk/2027-marriotts-way-races\nDate checked 2026-10-20 against https://totalracetiming.co.uk/race/693. Programme says 10:00; entry table says 10:30. Start time awaits organiser clarification.\nDate checked 2026-10-21 against https://boghopperraces.co.uk/2027-marriotts-way-races-1. Using Boghopper Races’ 2027 race-day timetable: registration 08:30–10:00, race start 10:30. A summary bullet still gives 10:00; check your final race instructions.\nDate checked 2026-10-21 against https://boghopperraces.co.uk/2027-marriotts-way-races-1. Published race start 10:30; registration 08:30–10:00. Boghopper Races’ 2027 timetable and FAQ (https://boghopperraces.co.uk/faqs) agree with the entry option. A summary bullet and the entry-page programme still give 10:00; clarification requested. No separate wave is specified; follow final race instructions.",
    },
  },
};
