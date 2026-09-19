// Published as unverified at the user's request on 19 September 2026.
// These source-reported entries are deliberately separate from ResultSeed:
// unresolved dates, times and statuses must not create verified finishes or PBs.
const history = "https://ultrasignup.com/results_participant.aspx?fname=David&lname=Goggins";
const duv = "https://statistik.d-u-v.org/getresultperson.php?runner=13632";

export const davidGogginsUnverifiedRecords = [
  {
    id: "leadville-2019",
    event: "Leadville Trail 100",
    distance: "100 miles",
    location: "Leadville, CO, United States",
    reportedDate: "17 August 2019",
    reportedTime: "22:55:44",
    reportedPlace: "35th overall",
    uncertainty:
      "UltraSignup and the athlete's website report 22:55:44; UTMB lists 22:55:48 and DUV 22:55:49. Original timing evidence is still needed to resolve the difference.",
    sources: [
      { label: "UltraSignup history", url: history },
      { label: "DUV history", url: duv },
      { label: "UTMB profile", url: "https://utmb.world/runner/17272.david.goggins" },
    ],
  },

  {
    id: "hurt-2012",
    event: "HURT 100",
    distance: "100 miles",
    location: "Honolulu, HI, United States",
    reportedDate: "14 January 2012",
    reportedTime: "Time and finish status unknown",
    reportedPlace: "Not recorded",
    uncertainty:
      "The athlete history contains an entry without a readable time or status. No 2012 finish was found in the organiser's historical finishers archive. It is not known whether he started or finished.",
    sources: [
      { label: "UltraSignup history", url: history },
      { label: "Organiser's archive", url: "https://hurt100.com/race-data-and-past-results/" },
    ],
  },
  {
    id: "running-for-the-bay-2011",
    event: "Running for the Bay Ultra Marathon",
    distance: "50K",
    location: "Apalachicola, FL, United States",
    reportedDate: "23 October 2011",
    reportedTime: "3:46:11",
    reportedPlace: "1st overall",
    uncertainty:
      "UltraSignup and DUV agree on the reported result. The original timer's results and a 2011 course description were not recovered; the course surface remains unverified.",
    sources: [
      { label: "UltraSignup history", url: history },
      { label: "DUV results", url: "https://statistik.d-u-v.org/getresultevent.php?event=37113" },
    ],
  },
  {
    id: "mcnaughton-2008",
    event: "McNaughton Park",
    distance: "150 miles",
    location: "Pekin, IL, United States",
    reportedDate: "April 2008 · exact start date disputed",
    reportedTime: "33:36:20",
    reportedPlace: "1st overall",
    uncertainty:
      "UltraSignup lists 12 April; DUV lists 11–13 April. The 150-mile start date needs confirmation separately from the shorter races.",
    sources: [
      {
        label: "UltraSignup results",
        url: "https://ultrasignup.com/results_event.aspx?did=13056#id5403",
      },
      { label: "DUV results", url: "https://statistik.d-u-v.org/getresultevent.php?event=3291" },
    ],
  },
  {
    id: "coyote-two-moon-2008",
    event: "Coyote Two Moon",
    distance: "100K",
    location: "Ojai, CA, United States",
    reportedDate: "21 March 2008",
    reportedTime: "12:45:00",
    reportedPlace: "4th overall",
    uncertainty:
      "UltraSignup reports 12:45:00 and fourth place; DUV reports 12:50:00 and first place. The original timing and scoring sheet is needed to reconcile both fields.",
    sources: [
      {
        label: "UltraSignup results",
        url: "https://ultrasignup.com/results_event.aspx?did=4081#id5403",
      },
      { label: "DUV results", url: "https://statistik.d-u-v.org/getresultevent.php?event=3285" },
    ],
  },
  {
    id: "world-of-hurt-2007",
    event: "World of Hurt",
    distance: "50K",
    location: "Las Vegas, NV, United States",
    reportedDate: "2007 · 27 October / 10 November disputed",
    reportedTime: "5:22:03",
    reportedPlace: "3rd overall",
    uncertainty:
      "UltraSignup lists 10 November and 5:22:03; DUV lists 27 October and 5:22:04. UltraRunning's archive also differs on overall placing. The original dated ranking table is still needed.",
    sources: [
      {
        label: "UltraSignup results",
        url: "https://ultrasignup.com/results_event.aspx?did=13231#id5403",
      },
      { label: "DUV results", url: "https://statistik.d-u-v.org/getresultevent.php?event=20034" },
      {
        label: "UltraRunning archive",
        url: "https://ultrarunning.com/calendar/event/world-of-hurt/race/6076/results",
      },
    ],
  },
  {
    id: "peak-ultra-2007",
    event: "Peak Ultra",
    distance: "53 miles",
    location: "Pittsfield, VT, United States",
    reportedDate: "9 June 2007",
    reportedTime: "13:53:29",
    reportedPlace: "8th overall",
    uncertainty:
      "The linked athlete history reports this result, but an independent organiser or timing table confirming identity, category and placing was not recovered.",
    sources: [{ label: "UltraSignup history", url: history }],
  },
] as const;
