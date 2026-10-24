import type { RoadMarathon } from "./types";

export const RACES: readonly RoadMarathon[] = [
  {
    distanceKm: 42.195,
    country: "portugal",
    slug: "lisbon-marathon",
    name: "EDP Lisbon Marathon",
    city: "Carcavelos to Lisbon",
    region: "Lisbon metropolitan area",
    timeZone: "Europe/Lisbon",
    officialUrl: "https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/",
    description:
      "The EDP Lisbon Marathon is a point-to-point road marathon following the coast and river into central Lisbon. The 2026 edition moved its start to Carcavelos and finished at Praça do Comércio. It is a separate event from the March Lisbon Half Marathon. The most recent confirmed edition took place on 10 October 2026; a 2027 date was not confirmed in the organiser material checked.",
    course: {
      summary:
        "The 2026 route starts on Estrada N6-7 in Carcavelos, near NOVA School of Business and Economics, and ends at Praça do Comércio in Lisbon. The organiser describes a course beside the ocean and river. Use that edition’s map when comparing the start location with older routes from Cascais.",
      surface: "Road",
      profile: "Coastal and riverside point-to-point course",
      links: [
        {
          label: "2026 official course and race information",
          url: "https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/",
        },
        {
          label: "2026 route and race regulations",
          url: "https://maratonaclubedeportugal.com/wp-content/uploads/Rules_EDP_Lisbon_Marathon_OUT2026_EN-1.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "Next-edition organiser announcements",
        description:
          "The checked race page covers the completed 2026 marathon. Follow Maratona Clube de Portugal for the next confirmed date and entry release before making a new booking.",
        url: "https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/",
      },
    ],
    editions: [],
    nextDateNote:
      "The 2026 race took place on 10 October. The next edition’s date, entry arrangements and timetable are TBC; do not reuse the 2026 schedule for 2027.",
    practical: [
      {
        label: "2026 start reference",
        value:
          "The 2026 regulations listed an 08:00 local start and a six-hour limit from the last start. These are historical planning references, not confirmed arrangements for 2027.",
        sourceUrl:
          "https://maratonaclubedeportugal.com/wp-content/uploads/Rules_EDP_Lisbon_Marathon_OUT2026_EN-1.pdf",
      },
      {
        label: "Point-to-point travel",
        value:
          "Plan travel to Carcavelos separately from the finish in Lisbon. Check the next edition’s official transport and start-access instructions when published.",
        sourceUrl: "https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/",
      },
    ],
    media: [],
    resultsUrl: "https://sporthive.com/events/s/7391338081590568960",
    resultsLabel: "2026 provisional results · Sporthive",
    pastEditions: [
      {
        year: 2026,
        date: "2026-10-10",
        resultsUrl: "https://sporthive.com/events/s/7391338081590568960",
        summary:
          "The organiser links to the 2026 classifications on Sporthive and labels them provisional. That qualification is retained here.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official 2026 marathon information and results link",
        url: "https://maratonaclubedeportugal.com/en/prova/edp-lisbon-marathon-2026/",
      },
      {
        label: "2026 marathon regulations",
        url: "https://maratonaclubedeportugal.com/wp-content/uploads/Rules_EDP_Lisbon_Marathon_OUT2026_EN-1.pdf",
      },
      {
        label: "2026 provisional results · Sporthive",
        url: "https://sporthive.com/events/s/7391338081590568960",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 42.195,
    country: "portugal",
    slug: "porto-marathon",
    name: "EDP Porto Marathon",
    city: "Porto",
    region: "Porto metropolitan area",
    timeZone: "Europe/Lisbon",
    officialUrl: "https://www.maratonadoporto.com/en/",
    description:
      "The EDP Porto Marathon is the full-distance race in a programme that also includes a 10 km race and a 6 km walk. The confirmed 2026 marathon takes place on 8 November, starting beside SEA LIFE Porto and finishing at Queimódromo near Parque da Cidade. Club athletes and independent runners enter the same 42.195 km event; the course map, pacing groups and six-hour limit help runners assess whether it suits their goal.",
    course: {
      summary:
        "For 2026, the marathon begins at SEA LIFE Porto and finishes at Queimódromo. The organiser publishes a dedicated 42 km map alongside the shorter events. Select the full-marathon map to study the route, turns and service points; do not use the 10 km or walk course for planning.",
      surface: "Road",
      profile: "City road marathon; consult the edition’s route map",
      links: [
        {
          label: "2026 marathon course map",
          url: "https://www.maratonadoporto.com/en/course-2026/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official online entry",
        description:
          "Select the 42.195 km marathon through the official website. The regulations list limited entry and edition-specific deadlines; check current availability and the total payable before booking.",
        url: "https://www.maratonadoporto.com/en/",
      },
    ],
    editions: [{ date: "2026-11-08", sourceUrl: "https://www.maratonadoporto.com/en/rules-2026/" }],
    nextDateNote:
      "8 November 2026 is confirmed. A 2027 marathon date was not confirmed in the organiser pages checked.",
    practical: [
      {
        label: "2026 start and limit",
        value:
          "The marathon starts at 08:00 local time and has a maximum duration of six hours. Runners must be at least 18 on race day.",
        sourceUrl: "https://www.maratonadoporto.com/en/rules-2026/",
      },
      {
        label: "2026 bib collection",
        value:
          "Collect the race kit at Centro de Congressos da Alfândega do Porto on 6 or 7 November, 10:00–19:00, with registration confirmation and identification.",
        sourceUrl: "https://www.maratonadoporto.com/en/information-2026/",
      },
      {
        label: "2026 pacing",
        value:
          "The organiser lists pacer targets from 3:00 to 4:45, in 15-minute steps. Check the final instructions for group identification and starting positions.",
        sourceUrl: "https://www.maratonadoporto.com/en/information-2026/",
      },
      {
        label: "2026 bag drop",
        value:
          "Bag drop is near the Queimódromo finish. Label the bag with your race number and account for its location when planning the journey to the start.",
        sourceUrl: "https://www.maratonadoporto.com/en/information-2026/",
      },
    ],
    media: [
      {
        label: "2025 official results, photos and videos",
        url: "https://www.maratonadoporto.com/en/results-fotos-2025-2025/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.maratonadoporto.com/en/results-fotos-2025-2025/",
    resultsLabel: "2025 results and media hub · Runporto",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.maratonadoporto.com/en/results-fotos-2025-2025/",
        summary:
          "Runporto’s official 2025 hub provides links to race classifications, photographs and video. Follow its result link for the full-marathon classification.",
        categories: [],
      },
    ],
    sources: [
      { label: "Official Porto marathon", url: "https://www.maratonadoporto.com/en/" },
      { label: "2026 rules", url: "https://www.maratonadoporto.com/en/rules-2026/" },
      {
        label: "2026 runner information",
        url: "https://www.maratonadoporto.com/en/information-2026/",
      },
      { label: "2026 course maps", url: "https://www.maratonadoporto.com/en/course-2026/" },
      {
        label: "2025 results and media hub",
        url: "https://www.maratonadoporto.com/en/results-fotos-2025-2025/",
      },
    ],
    checkedAt: "2026-10-23",
  },
];
