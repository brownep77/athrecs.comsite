import type { RoadMarathon } from "./types";

export const RACES: readonly RoadMarathon[] = [
  {
    distanceKm: 42.195,
    country: "denmark",
    slug: "copenhagen-marathon",
    name: "Copenhagen Marathon",
    city: "Copenhagen",
    region: "Capital Region of Denmark",
    timeZone: "Europe/Copenhagen",
    officialUrl: "https://copenhagenmarathon.dk/en/",
    description:
      "Copenhagen Marathon is a 42.195 km road race through Denmark’s capital. The next confirmed edition is 9 May 2027. Its published course preview describes a flat route through several city neighbourhoods, giving runners useful material for pacing and spectator planning. Recreational runners should check the organiser’s current entry routes, while competitive athletes have separate Elite A and Elite B arrangements. The 2027 date is confirmed, but the course page still describes 2026.",
    course: {
      summary:
        "The published 2026 route covers the inner city, Østerbro, Christianshavn, Vesterbro, Nørrebro and Frederiksberg. The interactive map also identifies refreshment zones. Use it as a preview and check the final 2027 map before fixing your fuelling plan, accommodation or spectator meeting points.",
      surface: "Road",
      profile: "Flat city course; published map currently covers 2026",
      links: [
        {
          label: "Official course page — currently 2026",
          url: "https://copenhagenmarathon.dk/en/the-course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official entry information",
        description:
          "Start with the organiser’s 2027 race page for current availability and authorised entry routes. An entry-list listing is separate from an available place.",
        url: "https://copenhagenmarathon.dk/en/",
      },
      {
        name: "Charity and official travel places",
        description:
          "The organiser offers limited charity places through its partner and identifies official travel operators. Confirm the fundraising commitment or package terms and that a race place is included.",
        url: "https://copenhagenmarathon.dk/en/run-the-copenhagen-marathon-and-support-a-good-cause-along-the-way/",
      },
      {
        name: "Elite applications",
        description:
          "Elite A selection is individual. Elite B applicants must document an eligible qualifying performance; read the current standards and contact Sparta about the conflicting qualifying-window end dates.",
        url: "https://copenhagenmarathon.dk/en/my-race/elite/",
      },
    ],
    editions: [{ date: "2027-05-09", sourceUrl: "https://copenhagenmarathon.dk/en/" }],
    practical: [
      {
        label: "2027 start",
        value:
          "The organiser publishes 09:30 local time on 9 May 2027. Use Copenhagen local time when arranging transport and allow for the approach to your assigned start area.",
        sourceUrl: "https://copenhagenmarathon.dk/en/",
      },
      {
        label: "2027 Elite B standards",
        value:
          "The published standards are marathon 2:25:00, half marathon 1:08:30 or 10 km 31:00 for men; marathon 2:50:00, half marathon 1:20:00 or 10 km 36:00 for women. The qualifying performance needs official evidence.",
        sourceUrl: "https://copenhagenmarathon.dk/en/my-race/elite/",
      },
      {
        label: "Elite qualifying-window clarification",
        value:
          "The same official page gives 25 April 2027 in the Elite B section and 24 April 2027 in its competition terms as the end of the qualifying window. Ask Sparta to confirm before relying on a performance near that boundary.",
        sourceUrl: "https://copenhagenmarathon.dk/en/my-race/elite/",
      },
      {
        label: "Course and fuelling preparation",
        value:
          "Study the organiser’s refreshment-zone information, then check the final 2027 edition before deciding where to take drinks or gels. The currently displayed aid-station details belong to the 2026 course.",
        sourceUrl: "https://copenhagenmarathon.dk/en/the-course/",
      },
    ],
    media: [
      {
        label: "Official race media and results links",
        url: "https://copenhagenmarathon.dk/en/media/",
        kind: "news",
      },
    ],
    resultsUrl: "https://copenhagenmarathon.dk/en/my-race/resultatarkiv/",
    resultsLabel: "Official Copenhagen Marathon results archive",
    pastEditions: [],
    sources: [
      { label: "Official 2027 race date and start", url: "https://copenhagenmarathon.dk/en/" },
      {
        label: "Course and refreshment zones — 2026 preview",
        url: "https://copenhagenmarathon.dk/en/the-course/",
      },
      {
        label: "2027 elite standards and competition terms",
        url: "https://copenhagenmarathon.dk/en/my-race/elite/",
      },
      {
        label: "Official charity entries",
        url: "https://copenhagenmarathon.dk/en/run-the-copenhagen-marathon-and-support-a-good-cause-along-the-way/",
      },
      {
        label: "Official travel operators",
        url: "https://copenhagenmarathon.dk/en/official-tour-operators-for-copenhagen-marathon/",
      },
      {
        label: "Official results archive",
        url: "https://copenhagenmarathon.dk/en/my-race/resultatarkiv/",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 42.195,
    country: "denmark",
    slug: "hca-marathon",
    name: "HCA Marathon",
    city: "Odense",
    region: "Southern Denmark",
    timeZone: "Europe/Copenhagen",
    officialUrl: "https://hcamarathon.dk/",
    description:
      "HCA Marathon takes runners through Odense, the home city of Hans Christian Andersen. The organiser confirms its 27th edition for 26 September 2027. The published route offers a city-marathon setting with two half-length laps and limited height variation. It is a useful option to compare with Copenhagen for a first marathon or a performance attempt, while keeping the 2026 course preview separate from the final 2027 programme.",
    course: {
      summary:
        "The route page is explicitly labelled 2026. It describes two laps for the full marathon, starting near Odense Idrætspark and finishing at the athletics stadium. The stated 21 metres is the difference between the highest and lowest points, not total ascent. Check the final 2027 map and any second-lap changes before racing.",
      surface: "Road",
      profile: "Low height variation; two-lap 2026 course preview",
      links: [{ label: "Official route — currently 2026", url: "https://hcamarathon.dk/ruten/" }],
    },
    entryMethods: [
      {
        name: "Official 2027 registration",
        description:
          "Use the 2027 entry button on the HCA website, which links to SportsTiming. Select the full marathon and review the current price, optional services and transfer or cancellation terms.",
        url: "https://hcamarathon.dk/",
      },
    ],
    editions: [{ date: "2027-09-26", sourceUrl: "https://hcamarathon.dk/" }],
    nextDateNote:
      "26 September 2027 is confirmed. The organiser says the 2027 programme will be published later; a final 2027 start time is not yet confirmed here.",
    practical: [
      {
        label: "2027 timetable",
        value:
          "Wait for the final 2027 programme before relying on the older 10:00 start or six-hour road-closure information still displayed elsewhere on the site.",
        sourceUrl: "https://hcamarathon.dk/",
      },
      {
        label: "Race-weekend planning",
        value:
          "The organiser uses Odense Idrætspark for race services and number collection. Check the edition-specific opening hours, transport arrangements and baggage instructions when the final programme is available.",
        sourceUrl: "https://hcamarathon.dk/",
      },
      {
        label: "Performance and first-marathon planning",
        value:
          "Use the lap map to plan an even effort and identify the marathon’s second-lap split. Confirm 2027 pacers, fast-runner access and intermediate cutoffs directly with the organiser before relying on older criteria.",
        sourceUrl: "https://hcamarathon.dk/ruten/",
      },
      {
        label: "Timing and results",
        value:
          "The organiser links results through SportsTiming and distinguishes gun time from chip time. Select the correct year and full-marathon distance when comparing performances.",
        sourceUrl: "https://hcamarathon.dk/",
      },
    ],
    media: [],
    resultsUrl: "https://www.sportstiming.dk/event/16156/results",
    resultsLabel: "2026 HCA Marathon results · SportsTiming",
    pastEditions: [],
    sources: [
      { label: "Official 2027 date, entry and programme status", url: "https://hcamarathon.dk/" },
      { label: "2026 route and profile", url: "https://hcamarathon.dk/ruten/" },
      {
        label: "Organiser-linked 2026 SportsTiming results",
        url: "https://www.sportstiming.dk/event/16156/results",
      },
    ],
    checkedAt: "2026-10-23",
  },
];
