import type { RoadHalfMarathon } from "../road-marathons/types";

export const RACES: readonly RoadHalfMarathon[] = [
  {
    distanceKm: 21.0975,
    country: "usa",
    slug: "boston-half-marathon",
    name: "Boston Half Marathon",
    city: "Boston",
    region: "Massachusetts",
    timeZone: "America/New_York",
    officialUrl: "https://www.baa.org/races/boston-half/info-for-athletes/",
    description:
      "Boston’s half marathon trades the spring marathon’s route for a rolling course through the Emerald Necklace park system. Franklin Park anchors the start and finish. It is a race to pace with the terrain in mind: autumn views are generous, but they do not flatten the hills.",
    course: {
      summary:
        "Starts and finishes in Franklin Park, using the Riverway, Jamaicaway and Arborway through the Emerald Necklace park system.",
      surface: "Road / surfaced paths",
      profile: "Rolling",
      links: [
        {
          label: "Official course information",
          url: "https://www.baa.org/races/boston-half/info-for-athletes/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Registration uses the B.A.A. Athletes’ Village. General places for 2026 have reached capacity.",
        url: "https://www.baa.org/races/boston-half/info-for-athletes/",
      },
      {
        name: "Charity places",
        description:
          "The organiser lists Team Dana-Farber and the Jimmy Fund as a remaining 2026 entry route; check current availability.",
        url: "https://www.baa.org/races/boston-half/info-for-athletes/",
      },
    ],
    editions: [
      {
        date: "2026-11-08",
        sourceUrl: "https://www.baa.org/races/boston-half/info-for-athletes/",
      },
    ],
    media: [],
    resultsUrl: "https://www.baa.org/races/boston-half/results/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.baa.org/races/boston-half/info-for-athletes/",
      },
      {
        label: "Results",
        url: "https://www.baa.org/races/boston-half/results/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "usa",
    slug: "houston-half-marathon",
    name: "Aramco Houston Half Marathon",
    city: "Houston",
    region: "Texas",
    timeZone: "America/Chicago",
    officialUrl: "https://www.chevronhoustonmarathon.com/race-weekend/schedule/",
    description:
      "Houston’s half marathon shares its January race morning with the city’s full marathon. The timetable separates the elite and open starts, making the athlete guide a useful read. Choose the 13.1-mile event when checking entry and results, then leave the longer route to somebody else.",
    course: {
      summary:
        "A Houston city road race starting at Congress and Fannin. Follow the organiser’s course information for the half-marathon route.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.chevronhoustonmarathon.com/race-weekend/schedule/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://www.chevronhoustonmarathon.com/",
      },
    ],
    editions: [
      {
        date: "2027-01-17",
        sourceUrl: "https://www.chevronhoustonmarathon.com/race-weekend/schedule/",
      },
    ],
    media: [],
    resultsUrl: "https://www.chevronhoustonmarathon.com/participants/results/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.chevronhoustonmarathon.com/race-weekend/schedule/",
      },
      {
        label: "Results",
        url: "https://www.chevronhoustonmarathon.com/participants/results/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "usa",
    slug: "philadelphia-half-marathon",
    name: "Philadelphia Half Marathon",
    city: "Philadelphia",
    region: "Pennsylvania",
    timeZone: "America/New_York",
    officialUrl: "https://www.philadelphiamarathon.com/races/half-marathon/",
    description:
      "Philadelphia gives its half marathon a Saturday of its own within the marathon weekend. The event uses a certified road course, with separate results and race-day information. It is a useful reminder that a shared festival name does not mean a shared alarm clock.",
    course: {
      summary:
        "A USATF-certified city road half marathon. Use the half-marathon course map for the latest route and checkpoint locations.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.philadelphiamarathon.com/races/half-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "The organiser lists the 2026 half marathon as sold out. Check its official entry updates rather than assuming the registration button means places remain.",
        url: "https://www.philadelphiamarathon.com/races/half-marathon/",
      },
    ],
    editions: [
      {
        date: "2026-11-21",
        sourceUrl: "https://www.philadelphiamarathon.com/races/half-marathon/",
      },
    ],
    media: [],
    resultsUrl: "https://www.philadelphiamarathon.com/races/half-marathon/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.philadelphiamarathon.com/races/half-marathon/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "usa",
    slug: "richmond-half-marathon",
    name: "Richmond Half Marathon",
    city: "Richmond",
    region: "Virginia",
    timeZone: "America/New_York",
    officialUrl: "https://www.richmondmarathon.org/races/half-marathon/",
    description:
      "Richmond’s half marathon starts downtown and explores the Virginia city’s neighbourhoods. It shares the weekend’s lively race-day atmosphere while keeping the distance to 13.1 miles. Check the waiting-list arrangements before making plans: a place in a queue is not yet a place on the start line.",
    course: {
      summary:
        "The road half marathon starts at 7th and Broad Street in downtown Richmond. Follow its dedicated course map for the route and finish.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.richmondmarathon.org/races/half-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Waiting list",
        description:
          "The 2026 half marathon is full. The organiser’s waiting list contacts runners when a place becomes available.",
        url: "https://www.richmondmarathon.org/races/half-marathon/",
      },
      {
        name: "Charity entry",
        description:
          "Official charity entry information is linked by the organiser; conditions and remaining places vary.",
        url: "https://www.richmondmarathon.org/races/half-marathon/",
      },
    ],
    editions: [
      {
        date: "2026-11-14",
        sourceUrl: "https://www.richmondmarathon.org/races/half-marathon/",
      },
    ],
    media: [],
    resultsUrl: "https://www.richmondmarathon.org/results/year-by-year-results/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.richmondmarathon.org/races/half-marathon/",
      },
      {
        label: "Results",
        url: "https://www.richmondmarathon.org/results/year-by-year-results/",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
