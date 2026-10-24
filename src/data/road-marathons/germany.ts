import type { RoadMarathon } from "./types";

export const RACES: readonly RoadMarathon[] = [
  {
    distanceKm: 42.195,
    country: "germany",
    slug: "berlin-marathon",
    name: "GENERALI BERLIN-MARATHON",
    city: "Berlin",
    region: "Berlin",
    timeZone: "Europe/Berlin",
    officialUrl: "https://www.generali-berlin-marathon.com/en/",
    description:
      "Berlin’s city marathon is called the GENERALI BERLIN-MARATHON from the 2027 edition, which is confirmed for 26 September. The organiser describes a road course with very little elevation gain. Its lottery, charity and official travel routes give runners different ways to seek entry. Performance planning should begin with the edition’s course and start information; the map currently available still describes 2026.",
    course: {
      summary:
        "A 42.195 km course through Berlin with very little elevation gain. The organiser’s course page supplies interactive mapping and refreshment information, but explicitly identifies the displayed map as the 2026 version until the 2027 route is released.",
      surface: "Road",
      profile: "Flat city course; 2027 map awaiting publication",
      links: [
        {
          label: "Official course information and map status",
          url: "https://www.generali-berlin-marathon.com/en/race-weekend/course",
        },
      ],
    },
    entryMethods: [
      {
        name: "2027 entry lottery",
        description:
          "The organiser lists the lottery application period as 1 October–12 November 2026, with allocation results on 3 December. A lottery application is not a confirmed race place.",
        url: "https://www.generali-berlin-marathon.com/en/registration/run",
      },
      {
        name: "Official charity and tour-operator routes",
        description:
          "The organiser also links to charity race entries and authorised tour operators. Check each provider’s allocation, fundraising or package conditions and edition before committing.",
        url: "https://www.generali-berlin-marathon.com/en/",
      },
    ],
    editions: [{ date: "2027-09-26", sourceUrl: "https://www.generali-berlin-marathon.com/en/" }],
    practical: [
      {
        label: "2027 time limit",
        value:
          "The runner registration information lists a limit of 6 hours 15 minutes. Check the final participant instructions for timing, course controls and starting waves.",
        sourceUrl: "https://www.generali-berlin-marathon.com/en/registration/run",
      },
      {
        label: "2027 eligibility",
        value:
          "The published runner eligibility is birth year 2009 or earlier. Read the full participation conditions before entering.",
        sourceUrl: "https://www.generali-berlin-marathon.com/en/registration/run",
      },
      {
        label: "Baggage and registration choices",
        value:
          "Check the baggage option selected during registration and the organiser’s change rules. Final start-area access and collection details should come from your edition’s participant information.",
        sourceUrl: "https://www.generali-berlin-marathon.com/en/preparation/faq",
      },
      {
        label: "Course and fuelling preparation",
        value:
          "The course page explains aid stations and personal-refreshment arrangements. Recheck the 2027 version before fixing a race nutrition or spectator-support plan.",
        sourceUrl: "https://www.generali-berlin-marathon.com/en/race-weekend/course",
      },
    ],
    media: [],
    resultsUrl: "https://www.generali-berlin-marathon.com/en/race-weekend/results",
    resultsLabel: "Official Berlin results archive · Mika Timing links",
    pastEditions: [],
    sources: [
      {
        label: "Official 2027 marathon and title change",
        url: "https://www.generali-berlin-marathon.com/en/",
      },
      {
        label: "2027 runner entry and lottery",
        url: "https://www.generali-berlin-marathon.com/en/registration/run",
      },
      {
        label: "Course and map status",
        url: "https://www.generali-berlin-marathon.com/en/race-weekend/course",
      },
      {
        label: "Participant FAQ",
        url: "https://www.generali-berlin-marathon.com/en/preparation/faq",
      },
      {
        label: "Official results archive",
        url: "https://www.generali-berlin-marathon.com/en/race-weekend/results",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 42.195,
    country: "germany",
    slug: "frankfurt-marathon",
    name: "Mainova Frankfurt Marathon",
    city: "Frankfurt am Main",
    region: "Hesse",
    timeZone: "Europe/Berlin",
    officialUrl: "https://www.frankfurt-marathon.com/en/",
    description:
      "The Mainova Frankfurt Marathon combines a flat city circuit with a finish inside the Festhalle at Messe Frankfurt. The published route crosses the Main and passes districts including Sachsenhausen and Höchst before returning to the centre. The organiser confirms both 25 October 2026 and 31 October 2027, with registration information already available for 2027. Check the year carefully when comparing practical information because some pages still describe earlier editions.",
    course: {
      summary:
        "The published course visits both sides of the River Main, the central skyline, Sachsenhausen and Höchst, then returns along Mainzer Landstraße towards the Festhalle finish. The organiser describes a flat profile. Use the edition’s map for the final route and location of aid stations.",
      surface: "Road",
      profile: "Flat city circuit with an indoor finish",
      links: [
        {
          label: "Official Frankfurt marathon course",
          url: "https://www.frankfurt-marathon.com/en/yourrun/marathon/course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "2027 official registration",
        description:
          "The registration page advertises 31 October 2027 and links to the organiser’s online entry service. Select that edition and review its conditions and current availability.",
        url: "https://www.frankfurt-marathon.com/en/yourrun/marathon/registration/",
      },
    ],
    editions: [
      {
        date: "2026-10-25",
        sourceUrl: "https://www.frankfurt-marathon.com/en/yourrun/marathon/course/",
      },
      {
        date: "2027-10-31",
        sourceUrl: "https://www.frankfurt-marathon.com/en/yourrun/marathon/registration/",
      },
    ],
    practical: [
      {
        label: "2027 advertised start",
        value:
          "The 2027 registration page advertises a 10:00 local start. Check the final edition-specific timetable for your own starting block and wave.",
        sourceUrl: "https://www.frankfurt-marathon.com/en/yourrun/marathon/registration/",
      },
      {
        label: "Finish and meeting points",
        value:
          "The marathon finishes inside the Festhalle at Messe Frankfurt. Arrange a meeting point outside the restricted finish and runner-service areas.",
        sourceUrl: "https://www.frankfurt-marathon.com/en/yourrun/marathon/information/",
      },
      {
        label: "Edition-specific runner information",
        value:
          "Confirm the current pack-collection arrangements, cut-offs and start seeding in your participant instructions. The general information page contains details from more than one edition.",
        sourceUrl: "https://www.frankfurt-marathon.com/en/yourrun/marathon/information/",
      },
    ],
    media: [],
    resultsUrl: "https://www.frankfurt-marathon.com/en/information/results/",
    resultsLabel: "Official Frankfurt marathon results archive",
    pastEditions: [],
    sources: [
      {
        label: "2027 registration and confirmed date",
        url: "https://www.frankfurt-marathon.com/en/yourrun/marathon/registration/",
      },
      {
        label: "Course and 2026 date",
        url: "https://www.frankfurt-marathon.com/en/yourrun/marathon/course/",
      },
      {
        label: "Participant information — check the edition",
        url: "https://www.frankfurt-marathon.com/en/yourrun/marathon/information/",
      },
      {
        label: "Results archive",
        url: "https://www.frankfurt-marathon.com/en/information/results/",
      },
    ],
    checkedAt: "2026-10-23",
  },
];
