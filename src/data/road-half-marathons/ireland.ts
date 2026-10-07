import type { RoadHalfMarathon } from "../road-marathons/types";

export const RACES: readonly RoadHalfMarathon[] = [
  {
    distanceKm: 21.0975,
    country: "ireland",
    slug: "dublin-city-half-marathon",
    name: "Dublin City Half Marathon",
    city: "Dublin",
    region: "Dublin",
    timeZone: "Europe/Dublin",
    officialUrl: "https://dublincityhalfmarathon.ie/",
    description:
      "Dublin City’s half marathon takes the capital’s streets at a rather different pace from the usual city-centre stroll. Its own event sits separately from the Dublin Marathon and Race Series. Check the organiser’s next entry announcement before putting a date in the diary.",
    course: {
      summary:
        "The organiser describes a city-centre start on O’Connell Street, a route through north Dublin and a return to the city centre. Use the edition’s final map for the exact route.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://dublincityhalfmarathon.ie/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Next-edition entry information",
        description:
          "The organiser says information on 2027 entries will be released in early 2027. The next race date remains TBC.",
        url: "https://dublincityhalfmarathon.ie/",
      },
    ],
    editions: [],
    media: [],
    resultsUrl: "https://dublincityhalfmarathon.ie/results/",
    resultsLabel: "Official results archive",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-03",
        resultsUrl: "https://dublincityhalfmarathon.ie/results/",
        summary:
          "The organiser’s race report records new men’s and women’s course records at the second Dublin City Half Marathon.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Sean Tobin of Clonmel AC won in 1:03:11, according to the organiser’s report.",
            sourceUrl: "https://dublincityhalfmarathon.ie/",
          },
          {
            category: "Women — overall",
            summary:
              "Sorcha Nic Dhomhnaill of West Limerick AC won in 1:11:25, according to the organiser’s report.",
            sourceUrl: "https://dublincityhalfmarathon.ie/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://dublincityhalfmarathon.ie/",
      },
      {
        label: "Results",
        url: "https://dublincityhalfmarathon.ie/results/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "ireland",
    slug: "cork-city-half-marathon",
    name: "Cork City Half Marathon",
    city: "Cork",
    region: "Cork",
    timeZone: "Europe/Dublin",
    officialUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
    description:
      "Cork City’s half marathon is the 13.1-mile option within a festival that also includes the marathon and 10K. Compare its own entry requirements and course rather than borrowing the full marathon’s details. The city supplies the setting; the distance remains reassuringly standard.",
    course: {
      summary:
        "A road half marathon in Cork City. Follow the organiser’s half-marathon information for its route and race-day arrangements.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://www.corkcity.ie/en/cork-city-marathon/race-information-and-prizes/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Ballot",
        description:
          "The organiser publishes ballot information for the 2027 event. Check the half-marathon conditions and application window.",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
      {
        name: "Good for Age",
        description:
          "Good-for-age applications are listed for the full and half marathon; qualifying requirements must be checked for the chosen distance.",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-06-06",
        sourceUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
    ],
    media: [],
    resultsUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
    resultsLabel: "Results via the organiser",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
      {
        label: "Course",
        url: "https://www.corkcity.ie/en/cork-city-marathon/race-information-and-prizes/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "ireland",
    slug: "great-limerick-run-half-marathon",
    name: "Great Limerick Run Half Marathon",
    city: "Limerick",
    region: "Limerick",
    timeZone: "Europe/Dublin",
    officialUrl: "https://eventmaster.ie/event/32lyhx4tZW/eEwAIKkTr",
    description:
      "Limerick’s half marathon forms part of the city’s May Bank Holiday running weekend. It has a separate start from the full marathon, so the right timetable matters. The organiser’s registration page is the place to compare entry arrangements and race-pack collection.",
    course: {
      summary:
        "A road half marathon within the Great Limerick Run festival. Follow the organiser’s half-marathon map for the exact course.",
      surface: "Road / surfaced paths",
      profile: "City road course",
      links: [
        {
          label: "Official course information",
          url: "https://eventmaster.ie/event/32lyhx4tZW/eEwAIKkTr",
        },
      ],
    },
    entryMethods: [
      {
        name: "Organiser entry information",
        description:
          "The organiser advertises 2 May 2027, but the registration page says the permit is pending approval. Check the latest position before booking.",
        url: "https://eventmaster.ie/event/32lyhx4tZW/eEwAIKkTr",
      },
    ],
    editions: [],
    media: [],
    resultsUrl: "https://www.greatlimerickrun.com/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://eventmaster.ie/event/32lyhx4tZW/eEwAIKkTr",
      },
      {
        label: "Results",
        url: "https://www.greatlimerickrun.com/",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote:
      "The organiser’s advertised next edition is awaiting final permit confirmation. Check the official entry page for updates.",
  },
  {
    distanceKm: 21.0975,
    country: "ireland",
    slug: "half-on-the-head",
    name: "Half on the Head",
    city: "Ballyheigue",
    region: "Kerry",
    timeZone: "Europe/Dublin",
    officialUrl: "https://halfonthehead.com/",
    description:
      "Half on the Head takes its half marathon around the Kerryhead Peninsula, starting and finishing in Ballyheigue. Country roads, the Shannon Estuary and Tralee Bay give this race a distinct coastal character. The scenery may distract you from the effort, though probably not for all 13.1 miles.",
    course: {
      summary:
        "A loop on country roads around Kerryhead, returning to the finish at the gates of Ballyheigue Castle.",
      surface: "Road / surfaced paths",
      profile: "Coastal road loop",
      links: [
        {
          label: "Official course information",
          url: "https://halfonthehead.com/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://halfonthehead.com/",
      },
    ],
    editions: [
      {
        date: "2027-06-12",
        sourceUrl: "https://halfonthehead.com/",
      },
    ],
    media: [],
    resultsUrl: "https://halfonthehead.com/hall-of-fame/",
    resultsLabel: "Past winners",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://halfonthehead.com/",
      },
      {
        label: "Results",
        url: "https://halfonthehead.com/hall-of-fame/",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
