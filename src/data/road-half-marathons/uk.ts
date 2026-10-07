import type { RoadHalfMarathon } from "../road-marathons/types";

export const RACES: readonly RoadHalfMarathon[] = [
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "great-north-run",
    name: "Great North Run",
    city: "Newcastle upon Tyne to South Shields",
    region: "Tyne and Wear",
    timeZone: "Europe/London",
    officialUrl: "https://www.greatrun.org/events/great-north-run/",
    description:
      "The Great North Run takes 13.1 miles from Newcastle to South Shields and turns them into a sizeable North East occasion. A huge field and a point-to-point course make it a race to plan around, from getting to the start to getting home from the coast.",
    course: {
      summary:
        "A road course from Newcastle to South Shields. Study the organiser’s route guide and travel arrangements for the separate start and finish.",
      surface: "Road / surfaced paths",
      profile: "Point to point",
      links: [
        {
          label: "Official course information",
          url: "https://www.greatrun.org/events/great-north-run/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Ballot",
        description:
          "Places are allocated through the organiser’s ballot windows; check the current application timetable.",
        url: "https://www.greatrun.org/events/great-north-run/",
      },
      {
        name: "Charity places",
        description: "Participating charities offer places with their own fundraising terms.",
        url: "https://www.greatrun.org/events/great-north-run/",
      },
    ],
    editions: [
      {
        date: "2027-09-12",
        sourceUrl: "https://www.greatrun.org/events/great-north-run/",
      },
    ],
    media: [],
    resultsUrl: "https://results.greatrun.org/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.greatrun.org/events/great-north-run/",
      },
      {
        label: "Results",
        url: "https://results.greatrun.org/results",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "England",
    fieldSize: {
      display: "About 63,000",
      basis: "Organiser-reported participants",
      year: "2026",
      sourceUrl: "https://www.greatrun.org/events/great-north-run/",
    },
  },
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "bath-half-marathon",
    name: "Bath Half Marathon",
    city: "Bath",
    region: "Somerset",
    timeZone: "Europe/London",
    officialUrl: "https://www.londonmarathonevents.co.uk/bath-half",
    description:
      "Bath gives the half marathon a handsome city setting and a long-established place in the British race calendar. The 13.1-mile event uses traffic-free streets, with general and charity entry routes. It is worth arranging the weekend before the training miles start filling it.",
    course: {
      summary:
        "A road race on traffic-free streets in Bath. Use the current course page for the detailed route and start arrangements.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.londonmarathonevents.co.uk/bath-half/course",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://www.londonmarathonevents.co.uk/bath-half",
      },
      {
        name: "Charity places",
        description: "Choose a participating charity and check its fundraising conditions.",
        url: "https://www.londonmarathonevents.co.uk/bath-half",
      },
    ],
    editions: [
      {
        date: "2027-03-14",
        sourceUrl: "https://www.londonmarathonevents.co.uk/bath-half",
      },
    ],
    media: [],
    resultsUrl: "https://www.londonmarathonevents.co.uk/bath-half/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.londonmarathonevents.co.uk/bath-half",
      },
      {
        label: "Course",
        url: "https://www.londonmarathonevents.co.uk/bath-half/course",
      },
      {
        label: "Results",
        url: "https://www.londonmarathonevents.co.uk/bath-half/results",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "England",
  },
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "cardiff-half-marathon",
    name: "Cardiff Half Marathon",
    city: "Cardiff",
    region: "Cardiff",
    timeZone: "Europe/London",
    officialUrl: "https://www.cardiffhalfmarathon.co.uk/",
    description:
      "Cardiff’s half marathon puts the Welsh capital at the centre of a busy road-running weekend. Compare the route and entry pathways before making plans: ballot places, charity entries and international options each have their own arrangements. A familiar skyline does not make the final miles any shorter.",
    course: {
      summary:
        "The organiser describes a flat, fast course around Cardiff. Consult the official route map for the current roads, landmarks and finish area.",
      surface: "Road / surfaced paths",
      profile: "Predominantly flat",
      links: [
        {
          label: "Official course information",
          url: "https://www.cardiffhalfmarathon.co.uk/event-info/route/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Ballot",
        description:
          "Follow the official ballot information for the next edition; a ballot application is not a guaranteed place.",
        url: "https://www.cardiffhalfmarathon.co.uk/",
      },
      {
        name: "Charity and international entry",
        description:
          "The organiser lists separate charity and international entry routes. Check their conditions and availability.",
        url: "https://www.cardiffhalfmarathon.co.uk/",
      },
    ],
    editions: [
      {
        date: "2026-10-04",
        sourceUrl: "https://www.cardiffhalfmarathon.co.uk/",
      },
    ],
    media: [],
    resultsUrl: "https://www.cardiffhalfmarathon.co.uk/event-info/results/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.cardiffhalfmarathon.co.uk/",
      },
      {
        label: "Course",
        url: "https://www.cardiffhalfmarathon.co.uk/event-info/route/",
      },
      {
        label: "Results",
        url: "https://www.cardiffhalfmarathon.co.uk/event-info/results/",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "Wales",
  },
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "great-scottish-run-half-marathon",
    name: "Great Scottish Run Half Marathon",
    city: "Glasgow",
    region: "Glasgow City",
    timeZone: "Europe/London",
    officialUrl: "https://www.greatrun.org/events/great-scottish-run/",
    description:
      "Glasgow’s Great Scottish Run offers a half marathon within a wider weekend of running. Choose the 13.1-mile event when checking entry and results: the 10K has its own story and its own finish times. The city setting supplies plenty to take in along the way.",
    course: {
      summary:
        "A Glasgow city road race. The organiser’s half-marathon route map gives the current start, finish and road-closure information.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.greatrun.org/events/great-scottish-run/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://www.greatrun.org/events/great-scottish-run/",
      },
    ],
    editions: [
      {
        date: "2026-10-04",
        sourceUrl: "https://www.greatrun.org/events/great-scottish-run/",
      },
    ],
    media: [],
    resultsUrl: "https://results.greatrun.org/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.greatrun.org/events/great-scottish-run/",
      },
      {
        label: "Results",
        url: "https://results.greatrun.org/results",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "Scotland",
  },
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "royal-parks-half-marathon",
    name: "Royal Parks Half Marathon",
    city: "London",
    region: "Greater London",
    timeZone: "Europe/London",
    officialUrl: "https://www.royalparkshalf.com/",
    description:
      "The Royal Parks Half brings a 13.1-mile race into central London’s parkland and streets. It is a useful choice for runners who like a city backdrop with their race-day miles. Check the next entry announcement early; this is not a race to assume you can join on a whim.",
    course: {
      summary:
        "A central London road-running event using streets and park paths. Follow the official route link for the current course.",
      surface: "Road / surfaced paths",
      profile: "City streets and park paths",
      links: [
        {
          label: "Official course information",
          url: "https://www.royalparkshalf.com/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official entry announcements",
        description:
          "Registration for 2026 is closed. The organiser is collecting interest for 2027; follow its entry announcements.",
        url: "https://www.royalparkshalf.com/",
      },
    ],
    editions: [
      {
        date: "2026-10-11",
        sourceUrl: "https://www.royalparkshalf.com/",
      },
    ],
    media: [],
    resultsUrl: "https://www.royalparkshalf.com/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.royalparkshalf.com/",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "England",
  },
  {
    distanceKm: 21.0975,
    country: "uk",
    slug: "belfast-city-half-marathon",
    name: "Belfast City Half Marathon",
    city: "Belfast",
    region: "Antrim / Down",
    timeZone: "Europe/London",
    officialUrl: "https://belfastcitymarathon.com/events/belfast-city-half-marathon",
    description:
      "Belfast’s half marathon explores the city across its north, south, east and west. It is a separate race from the spring marathon, so give its own entry page and route the attention they deserve. The city tour is included; fresh legs at the end are down to you.",
    course: {
      summary:
        "The organiser’s half-marathon guide describes a route starting and finishing on Ormeau Embankment and visiting all four areas of Belfast.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://belfastcitymarathon.com/events/belfast-city-half-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Check the organiser’s next half-marathon announcement. The page retains information from earlier editions; a new race date is TBC.",
        url: "https://belfastcitymarathon.com/events/belfast-city-half-marathon",
      },
    ],
    editions: [],
    media: [],
    resultsUrl: "https://belfastcitymarathon.com/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://belfastcitymarathon.com/events/belfast-city-half-marathon",
      },
    ],
    checkedAt: "2026-09-26",
    nation: "Northern Ireland",
  },
];
