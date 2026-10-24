import type { RoadHalfMarathon } from "../road-marathons/types";

export const RACES: readonly RoadHalfMarathon[] = [
  {
    distanceKm: 21.0975,
    country: "germany",
    slug: "berlin-half-marathon",
    name: "GENERALI BERLIN HALF MARATHON",
    city: "Berlin",
    region: "Berlin",
    timeZone: "Europe/Berlin",
    officialUrl: "https://www.generali-berliner-halbmarathon.de/en/",
    description:
      "The GENERALI BERLIN HALF MARATHON is Germany’s SuperHalfs event, with the next edition confirmed for 4 April 2027. Its city course starts between the Brandenburg Gate and Victory Column and finishes near the Brandenburg Gate. Runners start in waves, and the organiser publishes a 3-hour-15-minute net time limit. The 2027 lottery has already closed; any remaining charity or travel entries must be obtained through the official routes.",
    course: {
      summary:
        "A low-profile road half marathon through Berlin, with the start on Straße des 17. Juni and a finish near the Brandenburg Gate. The organiser’s course map identifies the route and refreshment stations. Review the start-area map separately to plan security access and the walk to your corral.",
      surface: "Road",
      profile: "Low-profile city course",
      links: [
        {
          label: "Official course and refreshment map",
          url: "https://www.generali-berliner-halbmarathon.de/en/your-race/course",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official charity and travel entry routes",
        description:
          "The organiser’s homepage directs runners to charity and tour-operator routes after the 2027 lottery. Check current places and package or fundraising conditions with an authorised provider.",
        url: "https://www.generali-berliner-halbmarathon.de/en/",
      },
      {
        name: "Lottery and SuperHalfs information",
        description:
          "The 2027 lottery application window closed on 28 May 2026. The runner entry page explains the process and how to associate a SuperPassport with a valid entry.",
        url: "https://www.generali-berliner-halbmarathon.de/en/registration/run",
      },
    ],
    editions: [
      {
        date: "2027-04-04",
        sourceUrl:
          "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
    ],
    practical: [
      {
        label: "2027 runner start",
        value:
          "Runners start from 10:05 local time in several waves. The 09:55 wheelchair and handbike start and 09:15 inline start are separate categories.",
        sourceUrl:
          "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
      {
        label: "2027 limit and course control",
        value:
          "The runner limit is 3 hours 15 minutes from crossing the start line. The published course control at kilometre 18 closes at 14:15; check final instructions for changes.",
        sourceUrl:
          "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
      {
        label: "Start seeding and pacers",
        value:
          "Groups reflect the best or target time in the entry account. The 2027 race-day page lists pacer targets of 1:25, 1:35, 1:45, 2:00, 2:15 and 2:30.",
        sourceUrl:
          "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
      {
        label: "Baggage or poncho",
        value:
          "Clothing drop-off is available to participants who booked that option. Runners without it receive a finish poncho and cannot use the clothing drop-off.",
        sourceUrl:
          "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
    ],
    media: [],
    resultsUrl: "https://www.generali-berliner-halbmarathon.de/en/your-race/results",
    resultsLabel: "Official Berlin half-marathon results · Mika Timing links",
    pastEditions: [],
    sources: [
      {
        label: "Official event and entry routes",
        url: "https://www.generali-berliner-halbmarathon.de/en/",
      },
      {
        label: "Runner registration and SuperHalfs",
        url: "https://www.generali-berliner-halbmarathon.de/en/registration/run",
      },
      { label: "Course", url: "https://www.generali-berliner-halbmarathon.de/en/your-race/course" },
      {
        label: "2027 race-day timetable and practical information",
        url: "https://www.generali-berliner-halbmarathon.de/en/your-race/race-day-for-participants",
      },
      {
        label: "Official results archive",
        url: "https://www.generali-berliner-halbmarathon.de/en/your-race/results",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 21.0975,
    country: "germany",
    slug: "cologne-half-marathon",
    name: "Generali Cologne Half Marathon",
    city: "Cologne",
    region: "North Rhine-Westphalia",
    timeZone: "Europe/Berlin",
    officialUrl: "https://generali-koeln-marathon.de/en/events/half-marathon/",
    description:
      "Cologne’s half marathon is the 21.0975 km option within the Generali Cologne Marathon weekend. The published 2026 route starts in Deutz and finishes beside Cologne Cathedral, passing through districts including Sülz, Lindenthal and Ehrenfeld. The organiser describes a flat course. The checked information covers the completed 2026 event; the 2027 date and entry conditions remain to be confirmed.",
    course: {
      summary:
        "The 2026 half marathon starts on Opladener Straße near Deutz station and finishes on Komödienstraße beside the cathedral. Its flat city route differs from the full marathon and relay, so choose the half-marathon map or GPX download on the official course page.",
      surface: "Road",
      profile: "Flat city course; next-edition route TBC",
      links: [
        {
          label: "Half-marathon route and event information",
          url: "https://generali-koeln-marathon.de/en/events/half-marathon/",
        },
        {
          label: "Official course maps and GPX downloads",
          url: "https://generali-koeln-marathon.de/en/courses/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Next-edition official entry",
        description:
          "Follow the organiser for the next half-marathon entry announcement. The checked page describes the sold-out, completed 2026 event and does not confirm a 2027 place or date.",
        url: "https://generali-koeln-marathon.de/en/events/half-marathon/",
      },
      {
        name: "Elite enquiries",
        description:
          "The organiser has a separate professional-athlete information page. Confirm the next edition’s standards, application window and acceptance process rather than applying expired 2026 deadlines.",
        url: "https://generali-koeln-marathon.de/en/pros/",
      },
    ],
    editions: [],
    nextDateNote:
      "The checked organiser information covers 4 October 2026. The next half-marathon date, entry release and timetable are TBC.",
    practical: [
      {
        label: "2026 start reference",
        value:
          "The 2026 half-marathon information lists an 08:30 local start with waves. Do not use that timetable as confirmation of a future edition.",
        sourceUrl: "https://generali-koeln-marathon.de/en/events/half-marathon/",
      },
      {
        label: "2026 time-limit reference",
        value:
          "The published half-marathon limit was 2 hours 45 minutes net. Confirm the next edition’s limit before choosing this race for a first half marathon or walking entry.",
        sourceUrl: "https://generali-koeln-marathon.de/en/events/half-marathon/",
      },
      {
        label: "Route and travel planning",
        value:
          "The Deutz start and cathedral finish are in different locations. Use the course and start-area maps to choose arrival transport and a post-race meeting point.",
        sourceUrl: "https://generali-koeln-marathon.de/en/courses/",
      },
    ],
    media: [],
    resultsUrl: "https://generali-koeln-marathon.de/en/results/",
    resultsLabel: "Official Cologne results hub",
    pastEditions: [
      {
        year: 2026,
        date: "2026-10-04",
        resultsUrl: "https://generali-koeln-marathon.de/en/results/",
        summary:
          "Use the organiser’s results hub and select the 2026 half marathon. The weekend also includes full-marathon and relay competitions with separate classifications.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official half-marathon information",
        url: "https://generali-koeln-marathon.de/en/events/half-marathon/",
      },
      { label: "Course maps", url: "https://generali-koeln-marathon.de/en/courses/" },
      {
        label: "Professional-athlete information and 2026 date",
        url: "https://generali-koeln-marathon.de/en/pros/",
      },
      { label: "Results hub", url: "https://generali-koeln-marathon.de/en/results/" },
    ],
    checkedAt: "2026-10-23",
  },
];
