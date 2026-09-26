import type { RoadHalfMarathon } from "../road-marathons/types";

export const RACES: readonly RoadHalfMarathon[] = [
  {
    distanceKm: 21.0975,
    country: "new-zealand",
    slug: "auckland-half-marathon",
    name: "Auckland Half Marathon",
    city: "Auckland",
    region: "Auckland",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://aucklandmarathon.co.nz/race-info/half-marathon/",
    description:
      "Auckland’s half marathon starts in Devonport and finishes at Victoria Park, giving race morning a clear sense of a journey. Plan the start-line trip as carefully as the run itself. The published times and course can change, so the final athlete information earns a place on the reading list.",
    course: {
      summary:
        "The half marathon runs from King Edward Parade in Devonport to Victoria Park, Auckland. Check the organiser’s certified course map and intermediate cut-offs.",
      surface: "Road / surfaced paths",
      profile: "Point to point",
      links: [
        {
          label: "Official course information",
          url: "https://aucklandmarathon.co.nz/race-info/half-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://aucklandmarathon.co.nz/race-info/half-marathon/",
      },
    ],
    editions: [
      {
        date: "2026-11-01",
        sourceUrl: "https://aucklandmarathon.co.nz/race-info/half-marathon/",
      },
    ],
    media: [],
    resultsUrl: "https://aucklandmarathon.co.nz/athlete-info/results-records/",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://aucklandmarathon.co.nz/race-info/half-marathon/",
      },
      {
        label: "Results",
        url: "https://aucklandmarathon.co.nz/athlete-info/results-records/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "new-zealand",
    slug: "wellington-half-marathon",
    name: "Wellington Half Marathon",
    city: "Wellington",
    region: "Wellington",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://www.wellingtonmarathon.co.nz/",
    description:
      "Wellington’s running festival offers a half marathon alongside its other distances. The 2027 event marks the festival’s 40th anniversary, a good excuse to compare the course and make a capital-city weekend of it. The entry page is the place for practical details, including when registration opens.",
    course: {
      summary:
        "The Wellington festival’s road half-marathon course. Consult the current organiser map for the route and start and finish arrangements.",
      surface: "Road / surfaced paths",
      profile: "See the official course map",
      links: [
        {
          label: "Official course information",
          url: "https://www.wellingtonmarathon.co.nz/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "The organiser says 2027 entry opens on 1 October. Select the half marathon and check its current conditions.",
        url: "https://www.wellingtonmarathon.co.nz/",
      },
    ],
    editions: [
      {
        date: "2027-07-04",
        sourceUrl: "https://www.wellingtonmarathon.co.nz/",
      },
    ],
    media: [],
    resultsUrl: "https://results.timingsports.com/wellingtonmarathon/2026",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.wellingtonmarathon.co.nz/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "new-zealand",
    slug: "christchurch-half-marathon",
    name: "Christchurch Half Marathon",
    city: "Christchurch",
    region: "Canterbury",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://www.christchurchmarathon.co.nz/21km-half-marathon",
    description:
      "Christchurch’s half marathon pairs a flat city course with landmarks around Hagley Park and the Avon River. It is an appealing setting for a steady effort or a personal-best attempt. Check the final route before race day: even a flat course benefits from knowing where you are going.",
    course: {
      summary:
        "A flat road half marathon starting on Park Terrace and finishing in Hagley Park. Use the latest approved map; the organiser’s page currently contains differing lap descriptions.",
      surface: "Road / surfaced paths",
      profile: "Flat",
      links: [
        {
          label: "Official course information",
          url: "https://www.christchurchmarathon.co.nz/21km-half-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Choose the half marathon on the organiser’s registration page. Check the edition and current availability before entering.",
        url: "https://www.christchurchmarathon.co.nz/21km-half-marathon",
      },
    ],
    editions: [
      {
        date: "2027-04-18",
        sourceUrl: "https://www.christchurchmarathon.co.nz/",
      },
    ],
    media: [],
    resultsUrl: "https://www.christchurchmarathon.co.nz/results",
    resultsLabel: "Official results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official race information",
        url: "https://www.christchurchmarathon.co.nz/21km-half-marathon",
      },
      {
        label: "Results",
        url: "https://www.christchurchmarathon.co.nz/results",
      },
      {
        label: "Date announcement",
        url: "https://www.christchurchmarathon.co.nz/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    distanceKm: 21.0975,
    country: "new-zealand",
    slug: "dunedin-half-marathon",
    name: "Dunedin Half Marathon",
    city: "Dunedin",
    region: "Otago",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://dunedinmarathon.co.nz/race-entry/half-marathon-course/",
    description:
      "Dunedin’s half marathon begins on the Caledonian Ground track before heading onto roads and shared paths. The organiser describes a relatively flat course, with harbour-side stretches among the miles. It is a race where the map tells a more useful story than a dramatic-looking elevation graph.",
    course: {
      summary:
        "A track start leads onto Butts Road, Anzac Avenue, shared paths and harbour-side roads. The organiser describes the route as relatively flat.",
      surface: "Roads, surfaced shared paths and track start",
      profile: "Relatively flat",
      links: [
        {
          label: "Official course information",
          url: "https://dunedinmarathon.co.nz/race-entry/half-marathon-course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Follow the organiser for the next edition’s registration. The 2026 race has finished and the next date is TBC.",
        url: "https://dunedinmarathon.co.nz/",
      },
    ],
    editions: [],
    media: [],
    resultsUrl: "https://dunedinmarathon.co.nz/",
    resultsLabel: "Official results archive",
    pastEditions: [
      {
        year: 2026,
        date: "2026-09-13",
        resultsUrl: "https://dunedinmarathon.co.nz/",
        summary:
          "Jason van Kempen and Mel Aitken won the half-marathon races. The organiser reports both as course records and states that placings were determined by net times.",
        categories: [
          {
            category: "Men — overall",
            summary: "Jason van Kempen won in 1:09:27 (net time).",
            sourceUrl: "https://dunedinmarathon.co.nz/",
          },
          {
            category: "Women — overall",
            summary: "Mel Aitken won in 1:21:38 (net time).",
            sourceUrl: "https://dunedinmarathon.co.nz/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://dunedinmarathon.co.nz/race-entry/half-marathon-course/",
      },
      {
        label: "Results",
        url: "https://dunedinmarathon.co.nz/",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
