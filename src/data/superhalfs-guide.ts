/** Edition-specific organiser evidence checked on the date below. Never roll dates forward. */
export const SUPERHALFS_PATH = "/running/superhalfs";
export const SUPERHALFS_CHECKED_AT = "2026-10-23";
export const SUPERHALFS_CHECKED_LABEL = "23 October 2026";
export const SUPERHALFS_TITLE = "SuperHalfs 2027 Preview: Races, Dates & Runner Guide | AthRecs";
export const SUPERHALFS_DESCRIPTION =
  "Compare the six SuperHalfs races for 2027: dates, course previews, entry routes, cutoffs and practical advice for amateur, club and elite runners.";
export const SUPERHALFS_OFFICIAL = "https://www.superhalfs.com/en/";
export const SUPERHALFS_RULES = "https://www.superhalfs.com/en/faqs/";
export const SUPERHALFS_CLAIMS = "https://www.superhalfs.com/en/accounts/claims/";
export const SUPERHALFS_BERLIN_FAQ =
  "https://www.generali-berliner-halbmarathon.de/en/preparation/event-faq";
export const SUPERHALFS_CARDIFF_RACE_INFO =
  "https://www.cardiffhalfmarathon.co.uk/get-race-ready-fast/race-info/";
export const SUPERHALFS_TIME_LIMIT_NEWS =
  "https://www.superhalfs.com/en/articles/news/2025/02/11/superhalfs-changes-an-important-rule/";

export type SuperHalfsRace = {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  countryFlagCode?: string;
  date: string;
  dateLabel: string;
  dateStatus: "confirmed" | "provisional";
  start: string;
  startNote?: string;
  timeZone: string;
  cutoff: string;
  cutoffBasis: string;
  cutoffStatus: string;
  course: string;
  entry: string;
  practical: string;
  elite: string;
  website: string;
  entryUrl: string;
  resultsUrl: string;
  resultsLabel: string;
  eliteUrl: string;
  rulesUrl: string;
  sources: { label: string; url: string }[];
};

export const SUPERHALFS_QUESTIONS = [
  {
    question: "Which races are in the SuperHalfs series?",
    answer:
      "The six SuperHalfs races are the designated half marathons in Lisbon, Prague, Berlin, Copenhagen, Cardiff and Valencia. Each is 21.0975 kilometres, approximately 13.1 miles.",
    source: SUPERHALFS_OFFICIAL,
  },
  {
    question: "How long do I have to complete SuperHalfs?",
    answer:
      "The current six-race series has no completion deadline. The previous 60-month limit was removed in 2025, and eligible finishes no longer expire.",
    source: SUPERHALFS_TIME_LIMIT_NEWS,
  },
  {
    question: "Is SuperHalfs registration free?",
    answer:
      "The digital SuperPassport is free. You pay for each race entry separately, plus your own travel and accommodation. Charity and travel packages have their own charges and conditions.",
    source: SUPERHALFS_OFFICIAL,
  },
  {
    question: "Does a SuperPassport guarantee me a race entry?",
    answer:
      "No. You must secure a place through each race’s entry process. Registering for SuperHalfs does not reserve places in the six events.",
    source: SUPERHALFS_OFFICIAL,
  },
  {
    question: "Can beginners and amateur runners take part?",
    answer:
      "Yes. Choose a race whose age, entry and finishing requirements you can meet. Compare the cutoff and how it is measured, and allow time to prepare for the full half-marathon distance.",
    source: SUPERHALFS_OFFICIAL,
  },
  {
    question: "Do I have to run the six races in the same year or in a particular order?",
    answer: "No. The current six-race series can be completed in any order across different years.",
    source: SUPERHALFS_RULES,
  },
  {
    question: "Can I count another half marathon in one of the six cities?",
    answer:
      "Only the designated member event counts. An unrelated city race, a virtual run or a repeat of another member race cannot replace a missing event.",
    source: SUPERHALFS_RULES,
  },
  {
    question: "Does the Copenhagen 2026 championship half marathon count?",
    answer:
      "Yes. The half marathon at the World Athletics Road Running Championships in Copenhagen on 20 September 2026 is an eligible SuperHalfs race.",
    source: SUPERHALFS_RULES,
  },
  {
    question: "How do professional and elite runners enter?",
    answer:
      "Apply through the individual organiser’s elite process. Standards, qualifying periods, invitations and available places differ. Copenhagen’s 2027 Elite B and C requirements were still awaiting publication when this guide was checked.",
    source: "https://cphhalf.dk/en/the-race/",
  },
  {
    question: "Where can I find my official SuperHalfs race result?",
    answer:
      "Search the AthRecs results archive for the race, year and distance. Check your name, bib, chip time and finish status before matching it to your athlete profile.",
    source: SUPERHALFS_RULES,
  },
  {
    question: "Can I claim a SuperHalfs race I ran before registering?",
    answer:
      "Yes, if the race and edition are eligible. Use the official result-claim form with the year, race, bib number and chip time. Newly completed races become claimable after SuperHalfs has received and processed the organiser’s results.",
    source: SUPERHALFS_RULES,
  },
  {
    question: "When do I receive the SuperHalfs medal?",
    answer:
      "The SuperMedal is collected after your final qualifying race. Before travelling, check that your earlier finishes are recorded in your SuperPassport and that your final entry includes its number.",
    source: SUPERHALFS_OFFICIAL,
  },
];

/** Arithmetic reference only: even pace over the certified half-marathon distance. */
export const SUPERHALFS_PACE_TARGETS = [60, 75, 90, 105, 120, 150, 165, 180, 195, 240].map(
  (minutes) => {
    const formatPace = (seconds: number) => {
      const rounded = Math.round(seconds);
      return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
    };
    return {
      finish: `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}:00`,
      perKm: formatPace((minutes * 60) / 21.0975),
      perMile: formatPace((minutes * 60) / (21.0975 / 1.609344)),
    };
  },
);
