import type { RoadMarathon } from "./types";

export const RACES: readonly RoadMarathon[] = [
  {
    distanceKm: 42.195,
    country: "czechia",
    slug: "prague-marathon",
    name: "Vodafone Prague Marathon",
    city: "Prague",
    region: "Prague",
    timeZone: "Europe/Prague",
    officialUrl:
      "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
    description:
      "Vodafone Prague Marathon is RunCzech’s 42.195 km race through Prague’s historic centre. The individual marathon takes place on 2 May 2027, within the wider 1–2 May festival. It starts at Old Town Square and welcomes runners pursuing both a competitive performance and a first marathon finish. The confirmed 2027 schedule should be read separately from the route maps, which still show the 2026 edition.",
    course: {
      summary:
        "The official course page provides downloadable maps, a course overview and GPX links for a historic-city road marathon. RunCzech explicitly labels the currently displayed maps as 2026 and says the 2027 map will follow. Use the final edition map to plan the turns, refreshment points and access to Old Town Square.",
      surface: "Road",
      profile: "Historic city road course; 2027 map pending",
      links: [
        {
          label: "Official marathon course and map status",
          url: "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official RunCzech registration",
        description:
          "Follow Register on the individual 2027 marathon page and use your RunCzech account. Select the full marathon and check the current fee and optional services before paying.",
        url: "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
      },
      {
        name: "Entry changes and athlete requirements",
        description:
          "Read RunCzech’s current registration and transfer rules. Competitive athletes should confirm any separate elite or starting-group requirements directly with the organiser rather than assuming that a public entry guarantees a particular position.",
        url: "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
      },
    ],
    editions: [
      {
        date: "2027-05-02",
        sourceUrl:
          "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
      },
    ],
    practical: [
      {
        label: "2027 start",
        value:
          "The individual marathon starts at 08:00 local time on 2 May at Prague’s Old Town Square. The festival’s two-day date range is not a second marathon date.",
        sourceUrl:
          "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
      },
      {
        label: "Current marathon time limit",
        value:
          "RunCzech’s current general rules allow seven hours from the starting gun. Confirm the final 2027 instructions, including intermediate cutoffs; this is not a seven-hour allowance from each runner’s chip start.",
        sourceUrl:
          "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
      },
      {
        label: "Race pack and start-group planning",
        value:
          "Check the final collection arrangements, documents and starting-group instructions in your RunCzech account. Leave time for collection and the approach to the historic-centre start.",
        sourceUrl:
          "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
      },
      {
        label: "Results and performance comparison",
        value:
          "Use the official results index and select the exact marathon edition. Keep individual marathon classifications separate from other festival races and team formats.",
        sourceUrl: "https://www.runczech.com/en/results",
      },
    ],
    media: [],
    resultsUrl: "https://www.runczech.com/en/results",
    resultsLabel: "Official RunCzech results archive",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-03",
        resultsUrl: "https://www.runczech.com/en/results/vodafone-prague-marathon-2026",
        summary:
          "RunCzech’s official archive lists the 3 May 2026 Prague Marathon. Open the correct race and classification when comparing performances.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "2027 individual marathon date, start and maps",
        url: "https://www.runczech.com/en/events/vodafone-prague-marathon-2027/races/vodafone-prague-marathon",
      },
      {
        label: "RunCzech rules and general information",
        url: "https://www.runczech.com/en/for-you/for-runners/rules-and-general-information-1",
      },
      { label: "Official results index", url: "https://www.runczech.com/en/results" },
      {
        label: "Official 2026 marathon archive",
        url: "https://www.runczech.com/en/results/vodafone-prague-marathon-2026",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 42.195,
    country: "czechia",
    slug: "trebon-marathon",
    name: "Třeboň Nature Marathon",
    city: "Třeboň",
    region: "South Bohemia",
    timeZone: "Europe/Prague",
    officialUrl: "https://naturemarathon.cz/english/",
    description:
      "Třeboň Nature Marathon combines a town-square start with a route through the surrounding South Bohemian landscape. The next confirmed marathon is 9 October 2027. Despite its nature branding, the organiser describes predominantly smooth roads and asphalt cycleways, making it appropriate to compare with road marathons. The festival also offers shorter distances, each with its own start and entry, so select the full marathon when planning your day.",
    course: {
      summary:
        "The route uses mainly asphalt roads and cycleways through the Třeboň area, with limited elevation change and sections in protected countryside. Download the marathon map or GPX from the organiser’s course page. The nature setting does not make this a technical trail marathon; check the official route and any updates before selecting your equipment.",
      surface: "Predominantly road and asphalt cycleways",
      profile: "Low elevation change through town and countryside",
      links: [
        {
          label: "Official marathon route, map and GPX links",
          url: "https://naturemarathon.cz/trasa/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official marathon registration",
        description:
          "Use the entry links on the organiser’s registration page and choose the marathon. Capacity is limited and the organiser requires payment within seven days; an unpaid application does not secure a place indefinitely.",
        url: "https://naturemarathon.cz/registrace/",
      },
    ],
    editions: [{ date: "2027-10-09", sourceUrl: "https://naturemarathon.cz/english/" }],
    practical: [
      {
        label: "2027 marathon start",
        value:
          "The marathon starts at 10:45 local time on 9 October at Masarykovo Square. The half marathon, 10 km and 5 km have different start times.",
        sourceUrl: "https://naturemarathon.cz/propozice-a-program/",
      },
      {
        label: "Number collection",
        value:
          "The organiser lists Friday and Saturday collection at J. K. Tyl Theatre on Masarykovo Square. Check the closing time carefully and collect on Friday if possible; the marathon start is later than the morning registration cutoff.",
        sourceUrl: "https://naturemarathon.cz/propozice-a-program/",
      },
      {
        label: "Marathon limit and pacing",
        value:
          "The English runner information gives a 6.5-hour marathon limit. Line up according to expected finishing time because the course narrows shortly after the start, and confirm the final pacer and aid-station arrangements.",
        sourceUrl: "https://naturemarathon.cz/english/",
      },
      {
        label: "Results and race selection",
        value:
          "The organiser’s archive links to Stopnito for recent editions. Select the full-marathon distance and preserve the distinction between finish time and chip time when reading a result.",
        sourceUrl: "https://naturemarathon.cz/vysledky/",
      },
    ],
    media: [],
    resultsUrl: "https://naturemarathon.cz/vysledky/",
    resultsLabel: "Official Třeboň archive · Stopnito results links",
    pastEditions: [],
    sources: [
      { label: "Official English 2027 information", url: "https://naturemarathon.cz/english/" },
      {
        label: "2027 timetable and number collection",
        url: "https://naturemarathon.cz/propozice-a-program/",
      },
      { label: "Course, map and GPX", url: "https://naturemarathon.cz/trasa/" },
      { label: "Registration and payment terms", url: "https://naturemarathon.cz/registrace/" },
      { label: "Official results archive", url: "https://naturemarathon.cz/vysledky/" },
    ],
    checkedAt: "2026-10-23",
  },
];
