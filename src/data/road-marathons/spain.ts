import type { RoadMarathon } from "./types";

export const RACES: readonly RoadMarathon[] = [
  {
    distanceKm: 42.195,
    country: "spain",
    slug: "valencia-marathon",
    name: "Valencia Marathon Trinidad Alfonso Zurich",
    city: "Valencia",
    region: "Valencian Community",
    timeZone: "Europe/Madrid",
    officialUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/maraton/",
    description:
      "Valencia’s marathon combines a flat city course with a distinctive finish at the City of Arts and Sciences. It gives competitive runners a course to study for an even-paced effort, while recreational runners need to plan around the wave system and finishing limit. The next confirmed edition is 6 December 2026. Standard entries for that edition are sold out; the organiser’s waiting-list and authorised travel information explain any remaining options.",
    course: {
      summary:
        "The 2026 route starts at Plaça de la Marató and visits central Valencia and the maritime neighbourhood of El Cabanyal. The finish follows a blue carpet over the water at the City of Arts and Sciences. Study the official map for turns, refreshment stations and access to the start.",
      surface: "Road",
      profile: "Flat city course",
      links: [
        {
          label: "2026 course and route analysis",
          url: "https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official entry and waiting-list information",
        description:
          "The 2026 general allocation is sold out. Consult the organiser’s registration page for the waiting-list process and any places released; a waiting-list application does not guarantee a bib.",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/",
      },
      {
        name: "Authorised travel operators",
        description:
          "The organiser identifies official tour operators as another entry route. Check that the package includes a confirmed marathon entry and read its booking conditions.",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/",
      },
    ],
    editions: [
      {
        date: "2026-12-06",
        sourceUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/maraton/",
      },
    ],
    nextDateNote:
      "6 December 2026 is confirmed. A 2027 race date was not confirmed in the organiser pages checked.",
    practical: [
      {
        label: "2026 start and waves",
        value:
          "The first start is 08:15 local time, with nine waves assigned using accredited performance. Your own bib and final instructions determine your wave.",
        sourceUrl:
          "https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/",
      },
      {
        label: "2026 time limit",
        value:
          "The regulations allow 5 hours 30 minutes from crossing the start line, with the finish closing at 15:15. Check intermediate controls in the official rules.",
        sourceUrl:
          "https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/",
      },
      {
        label: "Competitive and accessible entry",
        value:
          "Read the seeding and proof-of-performance requirements before entering a predicted time. The rules also explain the FESA application route for athletes with disabilities.",
        sourceUrl:
          "https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/",
      },
    ],
    media: [
      {
        label: "Official course analysis and video",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.valenciaciudaddelrunning.com/en/marathon/previous-editions-marathon/",
    resultsLabel: "Official Valencia marathon results archive",
    pastEditions: [],
    sources: [
      {
        label: "Official marathon and confirmed date",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/maraton/",
      },
      {
        label: "2026 entry information",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/info-registration-2026/",
      },
      {
        label: "Marathon regulations",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/regulations-valencia-marathon/",
      },
      {
        label: "2026 course",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/official-route-marathon/",
      },
      {
        label: "Previous editions and results",
        url: "https://www.valenciaciudaddelrunning.com/en/marathon/previous-editions-marathon/",
      },
    ],
    checkedAt: "2026-10-23",
  },
  {
    distanceKm: 42.195,
    country: "spain",
    slug: "barcelona-marathon",
    name: "Zurich Marató Barcelona",
    city: "Barcelona",
    region: "Catalonia",
    timeZone: "Europe/Madrid",
    officialUrl: "https://zurichmaratobarcelona.es/en/",
    description:
      "The Zurich Marató Barcelona is Barcelona’s 42.195 km city road marathon. The organiser confirms 14 March 2027 and publishes a separate course, entry process and results archive from the city’s February half marathon. Runners can compare the start corrals and pacer information with their target time, while planning an arrival that leaves time to collect the race pack before race day.",
    course: {
      summary:
        "The published city route starts on Passeig de Gràcia. The organiser presents it as a flat urban course and provides a route map, refreshment information and pacer targets. Check the final edition map when choosing accommodation and spectator meeting points.",
      surface: "Road",
      profile: "Flat urban course",
      links: [
        {
          label: "Official Barcelona marathon course",
          url: "https://zurichmaratobarcelona.es/en/i-am-a-runner/course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official registration",
        description:
          "Use the marathon’s own registration link and select the 2027 edition. Review the current allocation, payment conditions and any optional services before completing entry.",
        url: "https://zurichmaratobarcelona.es/en/",
      },
    ],
    editions: [
      {
        date: "2027-03-14",
        sourceUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/regulation/",
      },
    ],
    practical: [
      {
        label: "2027 start",
        value:
          "The regulations list 08:30 local time for runners and 08:25 for the wheelchair start. Allow for the starting corral and wave shown in your participant instructions.",
        sourceUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/regulation/",
      },
      {
        label: "2027 eligibility and limit",
        value:
          "Runners must be at least 18 on race day. The published maximum is six hours from the last participant’s start; read the full rules for course closure arrangements.",
        sourceUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/regulation/",
      },
      {
        label: "Race-pack collection",
        value:
          "Collect the bib before race day. The organiser does not offer race-day bib collection, so include the expo visit in your travel plan.",
        sourceUrl: "https://zurichmaratobarcelona.es/en/",
      },
      {
        label: "Pacing and performance planning",
        value:
          "The course page lists pacer groups from 2:45 to 4:30 and explains the staggered start. Check the final pacer and corral information for your target.",
        sourceUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/course/",
      },
    ],
    media: [],
    resultsUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/results/",
    resultsLabel: "Official results archive · Sportmaniacs links",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://zurichmaratobarcelona.es/en/i-am-a-runner/results/",
        summary:
          "The organiser’s archive links to the 2026 marathon classifications on Sportmaniacs. Select the correct year when comparing performances.",
        categories: [],
      },
    ],
    sources: [
      { label: "Official race and entry", url: "https://zurichmaratobarcelona.es/en/" },
      {
        label: "2027 regulations",
        url: "https://zurichmaratobarcelona.es/en/i-am-a-runner/regulation/",
      },
      {
        label: "Course and pacers",
        url: "https://zurichmaratobarcelona.es/en/i-am-a-runner/course/",
      },
      {
        label: "Results archive",
        url: "https://zurichmaratobarcelona.es/en/i-am-a-runner/results/",
      },
    ],
    checkedAt: "2026-10-23",
  },
];
