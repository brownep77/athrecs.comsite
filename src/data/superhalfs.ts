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

export const SUPERHALFS_RACES: readonly SuperHalfsRace[] = [
  {
    id: "lisbon",
    name: "EDP Lisbon Half Marathon",
    city: "Lisbon",
    country: "Portugal",
    countryCode: "PT",
    date: "2027-03-07",
    dateLabel: "Sunday 7 March 2027",
    dateStatus: "confirmed",
    start: "09:20 / 09:30 — TBC",
    startNote:
      "The 7 March 2027 programme lists 09:20. The 2027 regulations and official runner FAQ say 09:30. Confirm the final start and your wave with the organiser before race day.",
    timeZone: "Europe/Lisbon",
    cutoff: "3 hours",
    cutoffBasis: "Published duration; confirm the final wave and closing timetable.",
    cutoffStatus: "2027 regulations",
    course:
      "Mass runners start on the 25 de Abril Bridge and finish in Belém. Elite and high-performance athletes have a separate start at Cruz Quebrada.",
    entry:
      "The 2027 ballot has closed. Follow the organiser for any remaining official entry routes and their availability.",
    practical:
      "Bib collection is advertised for 4–6 March at Centro de Congressos de Lisboa, with no race-day collection or bag-drop service. Read the organiser’s final travel and start-area instructions before travelling.",
    elite:
      "The 2027 regulations list a men’s half-marathon mark under 1:05 and a women’s benchmark of 1:20, achieved within the previous three years at a recognised event. Confirm your evidence, acceptance and start location with the organiser.",
    website: "https://maratonaclubedeportugal.com/en/corrida-marco/edp-lisbon-half-marathon/",
    entryUrl:
      "https://meia-maratona.inscricoes.maratonaclubedeportugal.com/ballot/docs/regulamento-en.html?v=20260423100847",
    resultsUrl: "https://sporthive.com/events/s/1555368b-34b0-4964-9cff-b798f3212bf0",
    resultsLabel: "Official 2026 results · Sporthive",
    eliteUrl:
      "https://maratonaclubedeportugal.com/wp-content/uploads/REGULAMENTO_EDP_MEIA_MARATONA_DE_LISBOA_2027_EN.docx.pdf",
    rulesUrl:
      "https://maratonaclubedeportugal.com/wp-content/uploads/REGULAMENTO_EDP_MEIA_MARATONA_DE_LISBOA_2027_EN.docx.pdf",
    sources: [
      {
        label: "2027 race information",
        url: "https://maratonaclubedeportugal.com/en/corrida-marco/edp-lisbon-half-marathon/",
      },
      {
        label: "2027 regulations (PDF)",
        url: "https://maratonaclubedeportugal.com/wp-content/uploads/REGULAMENTO_EDP_MEIA_MARATONA_DE_LISBOA_2027_EN.docx.pdf",
      },
      {
        label: "Official runner FAQ and start guidance",
        url: "https://maratonaclubedeportugal.com/en/faqs-edp-lisbon-half-marathon/",
      },
    ],
  },
  {
    id: "prague",
    name: "Generali Prague Half Marathon",
    city: "Prague",
    country: "Czechia",
    countryCode: "CZ",
    date: "2027-04-03",
    dateLabel: "Saturday 3 April 2027",
    dateStatus: "confirmed",
    start: "10:00",
    timeZone: "Europe/Prague",
    cutoff: "3 hours",
    cutoffBasis:
      "From the starting gun under current RunCzech rules; recheck the 2027 instructions.",
    cutoffStatus: "General rules; 2027 detail pending",
    course:
      "A city road race through historic Prague. The organiser currently displays a 2026 course map; the 2027 map is still to be published.",
    entry:
      "General capacity is full and the 2027 ballot is closed. RunCzech lists charity and travel partners for entries using registration codes, subject to availability.",
    practical:
      "Check the final expo, bib-collection and start-area instructions before arranging travel. Prague and Berlin fall on consecutive days in 2027; you can complete them in different years.",
    elite:
      "Ask RunCzech about the appropriate elite field or seeded start. A public numeric 2027 elite-entry standard was not confirmed in the checked material. General and elite classifications can use different timing rules.",
    website: "https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2",
    entryUrl: "https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2",
    resultsUrl: "https://www.runczech.com/en/results",
    resultsLabel: "Official results · RunCzech",
    eliteUrl: "https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2",
    rulesUrl: "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
    sources: [
      {
        label: "2027 event and entry",
        url: "https://www.runczech.com/en/events/generali-prague-half-marathon-2027-2",
      },
      {
        label: "RunCzech race rules",
        url: "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
      },
    ],
  },
  {
    id: "berlin",
    name: "Generali Berlin Half Marathon",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    date: "2027-04-04",
    dateLabel: "Sunday 4 April 2027",
    dateStatus: "confirmed",
    start: "From 10:05, in waves",
    timeZone: "Europe/Berlin",
    cutoff: "3 hours 15 minutes",
    cutoffBasis: "Net time, measured from crossing the start line.",
    cutoffStatus: "2027 runner information",
    course:
      "A flat city course starting on Straße des 17. Juni, between the Brandenburg Gate and Victory Column. Check the organiser’s final route and assigned wave.",
    entry:
      "The 2027 lottery is closed. Official charity and tour-operator options are linked from registration information; a place depends on availability and their terms.",
    practical:
      "Walking is allowed within the published time limit; Nordic walking is not. Wheelchair, handbike and inline events have their own arrangements. Use the running half marathon when planning a SuperHalfs finish.",
    elite:
      "Contact SCC EVENTS for elite participation. No public numeric 2027 half-marathon qualification programme was confirmed in the checked pages. The Berlin Marathon’s fast-runner rules should not be applied to this race.",
    website: "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
    entryUrl:
      "https://www.generali-berliner-halbmarathon.de/en/registration/registration-information",
    resultsUrl: "https://www.generali-berliner-halbmarathon.de/en/your-race/results",
    resultsLabel: "Official results · SCC EVENTS",
    eliteUrl: "https://www.generali-berliner-halbmarathon.de/en/registration/run",
    rulesUrl: "https://www.generali-berliner-halbmarathon.de/en/registration/run",
    sources: [
      {
        label: "2027 runner entry and cutoff",
        url: "https://www.generali-berliner-halbmarathon.de/en/registration/run",
      },
      {
        label: "Race-day timetable",
        url: "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
    ],
  },
  {
    id: "copenhagen",
    name: "Copenhagen Half Marathon",
    city: "Copenhagen",
    country: "Denmark",
    countryCode: "DK",
    date: "2027-09-19",
    dateLabel: "Sunday 19 September 2027",
    dateStatus: "confirmed",
    start: "09:30",
    timeZone: "Europe/Copenhagen",
    cutoff: "3 hours",
    cutoffBasis: "Net time, measured from crossing the start line.",
    cutoffStatus: "Current organiser terms",
    course:
      "A road half marathon through Copenhagen and Frederiksberg. The 2027 race information lists the start on Jagtvej.",
    entry:
      "The 2027 lottery has closed. Use the official participation information for any subsequent opportunities and authorised travel options.",
    practical:
      "The 2027 expo venue and opening hours are still to be announced. Leave time for bib collection when planning your visit and check the final start-area instructions.",
    elite:
      "Elite A is by invitation. Elite B and C applications use verified performances within a qualifying period. The organiser says the 2027 standards, qualifying window and registration details will be published later.",
    website: "https://cphhalf.dk/en/",
    entryUrl: "https://cphhalf.dk/en/faq/",
    resultsUrl: "https://cphhalf.dk/en/results-archive/",
    resultsLabel: "Official results archive · CPH Half",
    eliteUrl: "https://cphhalf.dk/en/the-race/",
    rulesUrl: "https://cphhalf.dk/en/terms-and-conditions/",
    sources: [
      { label: "2027 race and elite information", url: "https://cphhalf.dk/en/the-race/" },
      { label: "Participation terms", url: "https://cphhalf.dk/en/terms-and-conditions/" },
      { label: "Entry questions", url: "https://cphhalf.dk/en/faq/" },
    ],
  },
  {
    id: "cardiff",
    name: "Cardiff Half Marathon",
    city: "Cardiff",
    country: "Wales, United Kingdom",
    countryCode: "GB",
    countryFlagCode: "GB-WLS",
    date: "2027-10-03",
    dateLabel: "Sunday 3 October 2027",
    dateStatus: "confirmed",
    start: "From 10:00, in waves",
    timeZone: "Europe/London",
    cutoff: "4 hours",
    cutoffBasis: "The organiser’s terms measure the limit from the last runner crossing the start.",
    cutoffStatus: "2027 entry and current terms",
    course:
      "A predominantly flat route from Cardiff Castle via Penarth Marina, the barrage, Cardiff Bay and Roath Park Lake, finishing at the Civic Centre.",
    entry:
      "The 2027 ballots closed on 18 October 2026; results were announced on 22 October. The organiser also lists charity and international tour entries, subject to availability.",
    practical:
      "Cardiff is the UK’s SuperHalfs race. The published minimum age is 17 on race day. Check the dedicated accessibility guidance if you require a guide runner, wheelchair entry or other arrangements.",
    elite:
      "There is a dedicated elite application covering men’s, women’s and wheelchair racing. The linked prize and qualification document is labelled 2026; confirm the 2027 criteria and awards with the elite team.",
    website: "https://www.cardiffhalfmarathon.co.uk/",
    entryUrl: "https://www.cardiffhalfmarathon.co.uk/take-part/register/",
    resultsUrl: "https://www.cardiffhalfmarathon.co.uk/event-info/results/",
    resultsLabel: "Official Cardiff results",
    eliteUrl: "https://www.cardiffhalfmarathon.co.uk/take-part/prize-money/",
    rulesUrl:
      "https://www.cardiffhalfmarathon.co.uk/take-part/terms-and-conditions/half-marathon-terms-conditions/",
    sources: [
      {
        label: "2027 entry information",
        url: "https://www.cardiffhalfmarathon.co.uk/take-part/register/",
      },
      {
        label: "2027 race-day timetable",
        url: "https://www.cardiffhalfmarathon.co.uk/get-race-ready-fast/race-info/",
      },
      { label: "Course guide", url: "https://www.cardiffhalfmarathon.co.uk/event-info/route/" },
      {
        label: "Elite athlete information",
        url: "https://www.cardiffhalfmarathon.co.uk/take-part/prize-money/",
      },
    ],
  },
  {
    id: "valencia",
    name: "Valencia Half Marathon Trinidad Alfonso Zurich",
    city: "Valencia",
    country: "Spain",
    countryCode: "ES",
    date: "2027-10-24",
    dateLabel: "Sunday 24 October 2027",
    dateStatus: "provisional",
    start: "2027 start time to be confirmed",
    timeZone: "Europe/Madrid",
    cutoff: "2 hours 45 minutes",
    cutoffBasis:
      "2026 net-time limit, with an intermediate cutoff; the 2027 limit is not yet confirmed.",
    cutoffStatus: "2026 reference only",
    course:
      "The 2026 race starts and finishes on Avenida de Tarongers. Confirm the 2027 course and wave arrangements when that edition’s guide is published.",
    entry:
      "The organiser announces a 2027 ballot and a prior loyalty window for 2026 participants, beginning on 5 November 2026. Follow the official guide for eligibility, deadlines and fees.",
    practical:
      "SuperHalfs lists 24 October 2027 provisionally. Valencia’s checked regulations still cover 2026, so its older start time, expo arrangements and cutoff should not be assumed for 2027.",
    elite:
      "Valencia publishes elite and sub-elite provisions in its race regulations. The available standards cover 2026 and limited places; obtain the 2027 requirements before applying or relying on a qualifying mark.",
    website: "https://www.valenciaciudaddelrunning.com/en/half/",
    entryUrl: "https://www.valenciaciudaddelrunning.com/en/half/race-guide/",
    resultsUrl: "https://www.valenciaciudaddelrunning.com/en/half/rankings-half-marathon/",
    resultsLabel: "Official Valencia results archive",
    eliteUrl:
      "https://www.valenciaciudaddelrunning.com/en/half/regulations-valencia-half-marathon/",
    rulesUrl:
      "https://www.valenciaciudaddelrunning.com/en/half/regulations-valencia-half-marathon/",
    sources: [
      { label: "SuperHalfs provisional calendar", url: SUPERHALFS_RULES },
      {
        label: "Race guide and 2027 entry",
        url: "https://www.valenciaciudaddelrunning.com/en/half/race-guide/",
      },
      {
        label: "2026 regulations",
        url: "https://www.valenciaciudaddelrunning.com/en/half/regulations-valencia-half-marathon/",
      },
    ],
  },
];

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
      "Use the official results link in each race guide above and select the correct year and distance. Check your name, bib, chip time and finish status before matching it to your athlete profile.",
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
