import type { RoadMarathon } from "./types";

export const IRELAND_ROAD_MARATHONS: RoadMarathon[] = [
  {
    slug: "dublin-marathon",
    name: "Irish Life Dublin Marathon",
    country: "ireland",
    city: "Dublin",
    region: "County Dublin",
    timeZone: "Europe/Dublin",
    officialUrl: "https://irishlifedublinmarathon.ie/",
    description:
      "Dublin’s road marathon shares its city course with the Irish national championships. The 2026 route starts on Leeson Street Lower, passes through the city centre and Phoenix Park, and finishes on Mount Street Upper. There are climbs among the flatter stretches, so a little restraint early on is useful. General entry is by ballot, with charity, qualifying-time and recognised tour-operator routes also available. The autumn race series offers shorter distances for runners building towards the full 26.2 miles.",
    course: {
      summary:
        "The 2026 route runs from Leeson Street Lower through central Dublin and Phoenix Park to Mount Street Upper.",
      surface: "Road",
      profile: "A mixture of flat sections, climbs and descents.",
      links: [
        {
          label: "Official course information",
          url: "https://irishlifedublinmarathon.ie/course-and-start-finish/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General ballot",
        description:
          "The 2026 ballot is closed. The organiser says 2027 ballot details will be released later in the year.",
        url: "https://irishlifedublinmarathon.ie/register-for-the-race/",
      },
      {
        name: "Charity entry",
        description:
          "Apply through the official charity programme and its partner charities; fundraising terms and availability apply.",
        url: "https://irishlifedublinmarathon.ie/run-for-charity-duplicate/",
      },
      {
        name: "Good For Age",
        description:
          "A qualifying-time application route; 2026 applications are closed and meeting a standard does not guarantee entry.",
        url: "https://irishlifedublinmarathon.ie/frequently-asked-questions/",
      },
      {
        name: "Recognised tour operators",
        description:
          "The organiser lists approved international operators offering 2026 entry and accommodation packages.",
        url: "https://irishlifedublinmarathon.ie/travel-packages/",
      },
    ],
    editions: [
      {
        date: "2026-10-25",
        sourceUrl: "https://irishlifedublinmarathon.ie/",
      },
    ],
    media: [
      {
        label: "2025 national championship report",
        url: "https://www.athleticsireland.ie/mcglynn-and-crean-claim-debut-national-marathon-titles-in-44th-dublin-marathon/",
        kind: "news",
      },
    ],
    resultsUrl: "https://raceresults.dublinmarathon.ie/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl:
          "https://raceresults.dublinmarathon.ie/results/2025-irish-life-dublin-marathon/",
        summary:
          "The 44th edition took place on 26 October. Athletics Ireland reports first national marathon titles for David McGlynn and Ava Crean. Separate official general, visually impaired and wheelchair result searches are available.",
        categories: [
          {
            category: "Overall men",
            summary: "Daniel Mesfin won in 2:08:51, as reported by Athletics Ireland.",
            sourceUrl:
              "https://www.athleticsireland.ie/mcglynn-and-crean-claim-debut-national-marathon-titles-in-44th-dublin-marathon/",
          },
          {
            category: "Irish national championship — men",
            summary:
              "David McGlynn took the national title; Ryan Creech and Paul O’Donnell completed the national podium.",
            sourceUrl:
              "https://www.athleticsireland.ie/mcglynn-and-crean-claim-debut-national-marathon-titles-in-44th-dublin-marathon/",
          },
          {
            category: "Irish national championship — women",
            summary:
              "Ava Crean won in 2:34:11; Ann-Marie McGlynn and Nichola Sheridan completed the national podium.",
            sourceUrl:
              "https://www.athleticsireland.ie/mcglynn-and-crean-claim-debut-national-marathon-titles-in-44th-dublin-marathon/",
          },
          {
            category: "Wheelchair — MS",
            summary:
              "Sean Frame placed first overall and first in the published MS category, with a finish time of 1:48:28 (chip time 1:48:26).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-wheelchair-irish-life-dublin-marathon/",
          },
          {
            category: "Wheelchair — W40",
            summary:
              "Jayne Bleakley placed second overall and first in the published W40 category, with a finish time of 2:33:55 (chip time 2:33:00).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-wheelchair-irish-life-dublin-marathon/",
          },
          {
            category: "Wheelchair — M75",
            summary:
              "Jerry Forde placed third overall and first in the published M75 category, with a finish time of 6:46:17 (chip time 6:46:14).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-wheelchair-irish-life-dublin-marathon/",
          },
          {
            category: "VI — M45",
            summary:
              "Ger Copeland placed first overall and first in the published M45 category in the VI results, with a finish and chip time of 2:58:23.",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
          },
          {
            category: "VI — M35",
            summary:
              "Matthew Collins placed second overall and first in the published M35 category in the VI results, with a finish and chip time of 2:58:23.",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
          },
          {
            category: "VI — W40",
            summary:
              "Sinead Kane placed third overall and first in the published W40 category in the VI results, with a finish time of 3:19:52 (chip time 3:19:51).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
          },
          {
            category: "VI — M40",
            summary:
              "Mark Young placed fifth overall and first in the published M40 category in the VI results, with a finish time of 4:36:25 (chip time 4:35:30).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
          },
          {
            category: "VI — W55",
            summary:
              "Cathy Mullan placed sixth overall and first in the published W55 category in the VI results, with a finish time of 6:17:02 (chip time 6:10:41).",
            sourceUrl:
              "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
          },
        ],
        date: "2025-10-26",
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://irishlifedublinmarathon.ie/",
      },
      {
        label: "Course information",
        url: "https://irishlifedublinmarathon.ie/course-and-start-finish/",
      },
      {
        label: "Results",
        url: "https://raceresults.dublinmarathon.ie/",
      },
      {
        label: "2026 race FAQ",
        url: "https://irishlifedublinmarathon.ie/frequently-asked-questions/",
      },
      {
        label: "Entry information",
        url: "https://irishlifedublinmarathon.ie/register-for-the-race/",
      },
      {
        label: "2025 visually impaired results",
        url: "https://raceresults.dublinmarathon.ie/results/2025-vi-irish-life-dublin-marathon/",
      },
      {
        label: "2025 wheelchair results",
        url: "https://raceresults.dublinmarathon.ie/results/2025-wheelchair-irish-life-dublin-marathon/",
      },
    ],
    fieldSize: {
      display: "About 18,500",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Dublin+Marathon",
      note: "Based on 18,508 marathon finishers in 2025, as reported by FindMyMarathon.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2026 start times",
        value: "Wheelchairs 08:40; running waves 08:45, 09:05, 09:25 and 09:45 local time.",
        sourceUrl: "https://irishlifedublinmarathon.ie/frequently-asked-questions/",
      },
      {
        label: "2026 course limit",
        value: "Seven hours from the final participant crossing the start line.",
        sourceUrl: "https://irishlifedublinmarathon.ie/frequently-asked-questions/",
      },
    ],
    nextDateNote: "2027 date has not yet been verified from the organiser.",
  },
  {
    slug: "cork-city-marathon",
    name: "Analog Devices Cork City Marathon",
    country: "ireland",
    city: "Cork",
    region: "County Cork",
    timeZone: "Europe/Dublin",
    officialUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
    description:
      "Cork City Marathon takes runners through the city and its suburbs over the full 42.195km road distance. The 2026 route finished on Grand Parade, with downloadable and interactive maps available to help plan the race. A half marathon and 10km share the wider programme, each with separate results. Entry and waiting-list details are handled through the council’s race website. For anyone choosing the full distance, the course map is a useful starting point before settling on a target pace.",
    course: {
      summary:
        "A city and suburban road course; the organiser supplies a 2026 map and an interactive route.",
      surface: "Road",
      profile: "Consult the official route map for the current course and changes.",
      links: [
        {
          label: "Official course information",
          url: "https://www.corkcity.ie/en/cork-city-marathon/maps/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official entry",
        description:
          "Follow the council’s Tickets/Waiting list link for the current registration release and availability.",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-06-06",
        sourceUrl: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
    ],
    media: [
      {
        label: "2026 race report and podiums",
        url: "https://www.corkcity.ie/en/council-services/news-room/latest-news/cork-turns-yellow-and-winners-of-the-2026-analog-devices-cork-city-marathon/",
        kind: "news",
      },
      {
        label: "Official race photographs",
        url: "https://www.corkcity.ie/en/cork-city-marathon/marathon-photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.corkcity.ie/en/cork-city-marathon/live-results-2026/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.corkcity.ie/en/cork-city-marathon/live-results-2026/",
        summary:
          "Stephen McAuley and Melissah Gibson won the full marathon. The official council recap publishes separate marathon, half-marathon and 10km podiums.",
        categories: [
          {
            category: "Men",
            summary: "Stephen McAuley 2:22:42; Chris Jeuken 2:24:20; Wayne Waldron 2:26:22.",
            sourceUrl:
              "https://www.corkcity.ie/en/council-services/news-room/latest-news/cork-turns-yellow-and-winners-of-the-2026-analog-devices-cork-city-marathon/",
          },
          {
            category: "Women",
            summary: "Melissah Gibson 2:40:41; Andrea Aza Villamor 2:48:05; April Quinn 2:56:01.",
            sourceUrl:
              "https://www.corkcity.ie/en/council-services/news-room/latest-news/cork-turns-yellow-and-winners-of-the-2026-analog-devices-cork-city-marathon/",
          },
        ],
        date: "2026-05-31",
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://www.corkcity.ie/en/cork-city-marathon/",
      },
      {
        label: "Course information",
        url: "https://www.corkcity.ie/en/cork-city-marathon/maps/",
      },
      {
        label: "Results",
        url: "https://www.corkcity.ie/en/cork-city-marathon/live-results-2026/",
      },
      {
        label: "Official timing partner and distance",
        url: "https://www.popupraces.ie/race/analog-devices-cork-city-marathon-2026/",
      },
      {
        label: "2026 race report",
        url: "https://www.corkcity.ie/en/council-services/news-room/latest-news/cork-turns-yellow-and-winners-of-the-2026-analog-devices-cork-city-marathon/",
      },
    ],
    fieldSize: {
      display: "About 3,000",
      basis: "Finishers",
      year: "2026",
      sourceUrl:
        "https://www.corkcity.ie/en/council-services/news-room/latest-news/cork-turns-yellow-and-winners-of-the-2026-analog-devices-cork-city-marathon/",
      note: "Cork City Council reports approximately 3,000 full-marathon finishers in 2026, excluding the half marathon and 10km.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "great-limerick-run-marathon",
    name: "Regeneron Great Limerick Run Marathon",
    country: "ireland",
    city: "Limerick",
    region: "County Limerick",
    timeZone: "Europe/Dublin",
    officialUrl: "https://greatlimerickrun.com/",
    description:
      "Limerick’s road marathon starts at Pery Square, follows city streets and the River Shannon, visits the University of Limerick area and finishes on O’Connell Street. The organiser describes it as flat, with 196 metres of elevation gain. Flat is clearly a relative term. Entry is through Eventmaster, with the individual marathon and relay booked separately. Race numbers can be posted before the deadline; otherwise, runners need to collect them at the University of Limerick before race day.",
    course: {
      summary:
        "Pery Square to O’Connell Street via city streets, the River Shannon and the University of Limerick.",
      surface: "Road and surfaced urban paths",
      profile: "Organiser-described flat route with 196m of published elevation gain.",
      links: [
        {
          label: "Official course information",
          url: "https://greatlimerickrun.com/the-races/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "Book the individual marathon through the official Eventmaster event; the marathon relay is a separate entry.",
        url: "https://eventmaster.ie/event/32lyhx4tZW",
      },
    ],
    editions: [
      {
        date: "2027-05-02",
        sourceUrl: "https://eventmaster.ie/event/32lyhx4tZW",
      },
    ],
    media: [
      {
        label: "2026 report from Limerick Athletic Club",
        url: "https://limerickathleticclub.ie/2026/05/06/great-limerick-run-2/",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.tdleventservices.co.uk/en/results-embed.php?event=4200",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.tdleventservices.co.uk/en/results-embed.php?event=4200",
        summary:
          "The official timing gateway covers the 2026 event. Limerick Athletic Club’s report, whose volunteers marshalled the University of Limerick section, records more than 2,600 marathon entries; this is an entry figure, not a finisher count.",
        categories: [],
        date: "2026-05-03",
      },
      {
        year: 2025,
        resultsUrl: "https://www.tdleventservices.co.uk/en/results-embed.php?event=4106",
        summary:
          "The timing partner retains the 2025 marathon, half-marathon and six-mile results in one event gateway; select the marathon distance to view its results.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://greatlimerickrun.com/",
      },
      {
        label: "Course information",
        url: "https://greatlimerickrun.com/the-races/marathon/",
      },
      {
        label: "Results",
        url: "https://www.tdleventservices.co.uk/en/results-embed.php?event=4200",
      },
      {
        label: "2027 entry and schedule",
        url: "https://eventmaster.ie/event/32lyhx4tZW",
      },
      {
        label: "Race FAQ",
        url: "https://greatlimerickrun.com/faqs/",
      },
    ],
    fieldSize: {
      display: "Over 2,600",
      basis: "Entries",
      year: "2026",
      sourceUrl: "https://limerickathleticclub.ie/2026/05/06/great-limerick-run-2/",
      note: "Limerick Athletic Club reports more than 2,600 marathon entries in 2026. Entries include runners who may not have started or finished.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2027 marathon start",
        value: "09:00 local time at Pery Square.",
        sourceUrl: "https://eventmaster.ie/event/32lyhx4tZW",
      },
      {
        label: "2027 bib collection",
        value: "For entries without postage: UL Arena, 1 May, 11:00–16:30. No race-day collection.",
        sourceUrl: "https://eventmaster.ie/event/32lyhx4tZW",
      },
    ],
  },
  {
    slug: "connemara-international-marathon",
    name: "Connemara International Marathon",
    country: "ireland",
    city: "Maam Cross",
    region: "County Galway",
    timeZone: "Europe/Dublin",
    officialUrl: "https://www.connemarathon.com/",
    description:
      "Connemara’s full marathon is a road race from Lough Inagh to Maam Cross, taking in rural scenery and a demanding second half. The hills reward a measured start; an ambitious early pace may look less convincing later. Entry includes transport to and from the race, and the organised buses are compulsory because there is no parking at the start or finish. The accompanying half marathon and ultra have their own start arrangements, so check the instructions for your distance.",
    course: {
      summary:
        "Point-to-point from Lough Inagh to Maam Cross, including the half-marathon course through the second half.",
      surface: "100% road, explicitly confirmed by the organiser",
      profile: "Hilly, with a demanding second half.",
      links: [
        {
          label: "Official course information",
          url: "https://www.connemarathon.com/course-profiles/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "Use the organiser’s Enter 2027 link and select the full marathon. Entry includes race transport.",
        url: "https://www.connemarathon.com/enter-now/",
      },
    ],
    editions: [
      {
        date: "2027-04-25",
        sourceUrl: "https://www.connemarathon.com/",
      },
    ],
    media: [
      {
        label: "Official photographs",
        url: "https://www.connemarathon.com/photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.connemarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
        summary:
          "The organiser-linked full-marathon table publishes split times, race times, chip times and category labels. These summaries follow the published labels and race-time order; they do not assert separate prize eligibility.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Marc Augustin is first listed in this published category: race time 2:39:44, chip time 2:39:44.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Men — Over 40",
            summary:
              "Marc Augustin is first listed in this published category: race time 2:39:44, chip time 2:39:44.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Men — Over 50",
            summary:
              "Brian Gurrin is first listed in this published category: race time 2:52:26, chip time 2:52:20.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Men — Senior",
            summary:
              "Daragh Morgan is first listed in this published category: race time 2:53:26, chip time 2:53:25.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — overall",
            summary:
              "Aoife Hoare is first listed in this published category: race time 3:10:22, chip time 3:10:03.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Senior",
            summary:
              "Aoife Hoare is first listed in this published category: race time 3:10:22, chip time 3:10:03.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Over 40",
            summary:
              "Marie Leroyer is first listed in this published category: race time 3:21:04, chip time 3:20:57.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Men — Over 60",
            summary:
              "Julius Susmak is first listed in this published category: race time 3:25:20, chip time 3:25:06.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Over 60",
            summary:
              "Bernie Carter is first listed in this published category: race time 3:56:11, chip time 3:56:08.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Over 50",
            summary:
              "Denise Antohi is first listed in this published category: race time 4:03:38, chip time 4:03:28.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Men — Over 70",
            summary:
              "Michael McDonagh is first listed in this published category: race time 4:38:13, chip time 4:37:41.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Over 70",
            summary:
              "Joan McGuinness is first listed in this published category: race time 6:55:30, chip time 6:55:30.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
          {
            category: "Women — Over 80",
            summary:
              "Terry Gough is first listed in this published category: race time 6:57:18, chip time 6:57:18.",
            sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
        summary:
          "The organiser-linked full-marathon table publishes split times, race times, chip times and category labels. These summaries follow the published labels and race-time order; they do not assert separate prize eligibility.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Féidhlim Mc Gowan is first listed in this published category: race time 2:30:53, chip time 2:30:53.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Men — Senior",
            summary:
              "Féidhlim Mc Gowan is first listed in this published category: race time 2:30:53, chip time 2:30:53.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Men — Over 40",
            summary:
              "Oran Finegan is first listed in this published category: race time 2:55:16, chip time 2:55:14.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Men — Over 50",
            summary:
              "Alessandro Belloni is first listed in this published category: race time 3:16:28, chip time 3:16:18.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Women — overall",
            summary:
              "Jennie O Leary is first listed in this published category: race time 3:29:29, chip time 3:29:08.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Women — Senior",
            summary:
              "Jennie O Leary is first listed in this published category: race time 3:29:29, chip time 3:29:08.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Men — Over 60",
            summary:
              "Denis Murray is first listed in this published category: race time 3:38:54, chip time 3:38:45.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Women — Over 40",
            summary:
              "Maura Dineen is first listed in this published category: race time 3:42:05, chip time 3:41:34.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Women — Over 60",
            summary:
              "Catherine Hayes is first listed in this published category: race time 4:04:20, chip time 4:03:55.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
          {
            category: "Women — Over 50",
            summary:
              "Tina Mc Grath is first listed in this published category: race time 4:17:13, chip time 4:16:08.",
            sourceUrl: "https://www.redtagtiming.com/results/CNM2025_FullMarathon.html",
          },
        ],
      },
      {
        year: 2015,
        resultsUrl: "https://www.connemarathon.com/results/",
        summary:
          "The organiser’s historical records identify a women’s full-marathon course record from this edition.",
        categories: [
          {
            category: "Women — course record",
            summary:
              "Mary Laverty’s 2:57:38 from 2015 is listed as the women’s full-marathon course record.",
            sourceUrl: "https://www.connemarathon.com/results/",
          },
        ],
      },
      {
        year: 2011,
        resultsUrl: "https://www.connemarathon.com/results/",
        summary:
          "The organiser’s historical records identify a men’s full-marathon course record from this edition.",
        categories: [
          {
            category: "Men — course record",
            summary:
              "Freddy Keron Sittuk’s 2:27:48 from 2011 is listed as the men’s full-marathon course record.",
            sourceUrl: "https://www.connemarathon.com/results/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://www.connemarathon.com/",
      },
      {
        label: "Course information",
        url: "https://www.connemarathon.com/course-profiles/",
      },
      {
        label: "Results",
        url: "https://www.connemarathon.com/results/",
      },
      {
        label: "Surface, transport and time limits",
        url: "https://www.connemarathon.com/faqs/",
      },
      {
        label: "2027 registration",
        url: "https://www.connemarathon.com/enter-now/",
      },
    ],
    fieldSize: {
      display: "About 550",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://redtagtiming.com/results/CNM2026_FullMarathon.html",
      note: "Based on 566 full-marathon finishers in 2026. The half marathon and ultra are separate races.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "Published marathon start",
        value: "11:00 local time; reconfirm the final race timetable.",
        sourceUrl: "https://www.connemarathon.com/faqs/",
      },
      {
        label: "Published time limit",
        value:
          "The finish is dismantled from 17:30, giving the full marathon approximately 6.5 hours.",
        sourceUrl: "https://www.connemarathon.com/faqs/",
      },
      {
        label: "Transport",
        value: "Race buses are required; no parking at the start or finish.",
        sourceUrl: "https://www.connemarathon.com/faqs/",
      },
      {
        label: "2027 minimum age",
        value: "18 on race day.",
        sourceUrl: "https://www.connemarathon.com/enter-now/",
      },
    ],
  },
  {
    slug: "longford-marathon",
    name: "Abbott Longford Marathon",
    country: "ireland",
    city: "Longford",
    region: "County Longford",
    timeZone: "Europe/Dublin",
    officialUrl: "https://longfordmarathon.com/",
    description:
      "Longford’s road marathon starts and finishes in the town centre, with a rural circuit through the surrounding countryside. Its established route is a flat single loop from Main Street, passing through Longford, Roscommon and Leitrim. Check the latest course map when planning the race, as routes can change between editions. The wider programme includes shorter distances, a relay and an ultra. Individual marathon results can be searched by year and age category, with both finish and chip times shown.",
    course: {
      summary:
        "Town-centre start and finish with a rural road circuit; use the latest official map for current routing.",
      surface: "Road",
      profile: "Flat, according to the AIMS race profile.",
      links: [
        {
          label: "Official course information",
          url: "https://longfordmarathon.com/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Official registration",
        description:
          "The entry page currently covers the completed 2026 event. Await the organiser’s next-edition announcement before booking.",
        url: "https://longfordmarathon.com/enter/",
      },
    ],
    editions: [],
    media: [
      {
        label: "Official photo gallery",
        url: "https://longfordmarathon.com/gallery/photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://longfordmarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://longfordmarathon.com/results/",
        summary:
          "The 2026 full-marathon table lists Sean Hehir first overall and Adele Walsh first in the women’s filter. Populated published gender and age filters are summarised below using finish time, with chip time shown separately.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Sean Hehir is first in the organiser’s published category filter: finish time 02:36:35, chip time 02:36:33.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=",
          },
          {
            category: "Men — Over 35",
            summary:
              "Steven Mac Sweeney is first in the organiser’s published category filter: finish time 02:53:25, chip time 02:53:21.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=35",
          },
          {
            category: "Men — Over 40",
            summary:
              "Sean Hehir is first in the organiser’s published category filter: finish time 02:36:35, chip time 02:36:33.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=40",
          },
          {
            category: "Men — Over 45",
            summary:
              "Tomek Dykiel is first in the organiser’s published category filter: finish time 03:15:03, chip time 03:14:58.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=45",
          },
          {
            category: "Men — Over 50",
            summary:
              "Chris Denton is first in the organiser’s published category filter: finish time 02:39:03, chip time 02:39:00.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=50",
          },
          {
            category: "Men — Over 55",
            summary:
              "Stephen Mc Laughlin is first in the organiser’s published category filter: finish time 02:57:14, chip time 02:57:12.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=55",
          },
          {
            category: "Men — Over 60",
            summary:
              "Gabriel Mc Goldrick is first in the organiser’s published category filter: finish time 03:33:45, chip time 03:33:36.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=60",
          },
          {
            category: "Men — Over 65",
            summary:
              "Billy Byrne is first in the organiser’s published category filter: finish time 03:23:48, chip time 03:23:42.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=65",
          },
          {
            category: "Men — Over 70",
            summary:
              "Sam Cochrane is first in the organiser’s published category filter: finish time 03:53:50, chip time 03:53:41.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=m&category=70",
          },
          {
            category: "Women — overall",
            summary:
              "Adele Walsh is first in the organiser’s published category filter: finish time 02:56:19, chip time 02:56:14.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=",
          },
          {
            category: "Women — Over 35",
            summary:
              "Kingda Bamrounsavath is first in the organiser’s published category filter: finish time 03:34:16, chip time 03:33:27.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=35",
          },
          {
            category: "Women — Over 40",
            summary:
              "Sorcha Casey is first in the organiser’s published category filter: finish time 04:00:38, chip time 04:00:16.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=40",
          },
          {
            category: "Women — Over 45",
            summary:
              "Marcela Laziciusova is first in the organiser’s published category filter: finish time 03:22:34, chip time 03:22:29.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=45",
          },
          {
            category: "Women — Over 50",
            summary:
              "Adele Walsh is first in the organiser’s published category filter: finish time 02:56:19, chip time 02:56:14.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=50",
          },
          {
            category: "Women — Over 55",
            summary:
              "Sarah Benton is first in the organiser’s published category filter: finish time 03:11:29, chip time 03:11:22.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=55",
          },
          {
            category: "Women — Over 60",
            summary:
              "Rosarii Dunne is first in the organiser’s published category filter: finish time 04:01:33, chip time 04:00:58.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=60",
          },
          {
            category: "Women — Over 65",
            summary:
              "Fiona Bishop is first in the organiser’s published category filter: finish time 04:51:39, chip time 04:51:32.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=65",
          },
          {
            category: "Women — Over 70",
            summary:
              "Mary Jennings is first in the organiser’s published category filter: finish time 05:36:42, chip time 05:36:28.",
            sourceUrl:
              "https://longfordmarathon.com/results/?year=2026&marathon=full&gender=f&category=70",
          },
        ],
        date: "2026-08-30",
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://longfordmarathon.com/",
      },
      {
        label: "Course information",
        url: "https://longfordmarathon.com/marathon/",
      },
      {
        label: "Results",
        url: "https://longfordmarathon.com/results/",
      },
      {
        label: "AIMS road-course profile",
        url: "https://aims-worldrunning.org/articles/2645-in-the-heart-of-ireland.html",
      },
      {
        label: "Race FAQ",
        url: "https://longfordmarathon.com/event/faq/",
      },
      {
        label: "Entry page",
        url: "https://longfordmarathon.com/enter/",
      },
    ],
    fieldSize: {
      display: "About 300",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://longfordmarathon.com/results/",
      note: "Based on 287 finishers in the organiser’s 2026 full-marathon results.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "Published start arrangements",
        value:
          "The 2026 FAQ lists marathon runners at 09:00 and marathon walkers at 07:00 local time.",
        sourceUrl: "https://longfordmarathon.com/event/faq/",
      },
    ],
    nextDateNote: "2027 date has not yet been verified from the organiser.",
  },
  {
    slug: "run-galway-bay-marathon",
    name: "Run Galway Bay Marathon",
    country: "ireland",
    city: "Galway",
    region: "County Galway",
    timeZone: "Europe/Dublin",
    officialUrl: "https://rungalwaybay.com/",
    description:
      "Run Galway Bay Marathon follows the waterfront between the Claddagh and Salthill on closed roads and the paved promenade. Two short laps and four full laps make up the distance, so there is more than one chance to admire the view. The course is flat, with some narrow sections worth bearing in mind when passing other runners. The 2026 race is sold out, with race numbers posted to entrants. There is no official bag drop, so plan where to leave your belongings.",
    course: {
      summary:
        "Two short laps and four full laps from the Claddagh through Salthill, returning along the promenade.",
      surface: "Road and paved promenade",
      profile: "Flat, according to the organiser.",
      links: [
        {
          label: "Official course information",
          url: "https://rungalwaybay.com/full-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "The 2026 race is sold out. Use the organiser’s updates and entry links for future releases.",
        url: "https://rungalwaybay.com/faqs/",
      },
    ],
    editions: [
      {
        date: "2026-10-03",
        sourceUrl: "https://rungalwaybay.com/faqs/",
      },
    ],
    media: [
      {
        label: "Official photo gallery",
        url: "https://rungalwaybay.com/gallery/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://rungalwaybay.com/results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
        summary:
          "The full-marathon timing table publishes individual lap splits, race time, chip time and category labels. Summaries follow the published category labels and race-time order; they are not a separate prize-allocation list.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Cedric Portmann is first listed in this published category: race time 2:45:32, chip time 2:45:32.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Men — Senior",
            summary:
              "Cedric Portmann is first listed in this published category: race time 2:45:32, chip time 2:45:32.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Men — Over 40",
            summary:
              "Kieran O'Brien is first listed in this published category: race time 2:46:40, chip time 2:46:39.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Men — Over 50",
            summary:
              "Kenny Holdsworth is first listed in this published category: race time 3:00:10, chip time 3:00:06.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — overall",
            summary:
              "Ann Marie Connell is first listed in this published category: race time 3:01:28, chip time 3:01:27.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — Over 40",
            summary:
              "Ann Marie Connell is first listed in this published category: race time 3:01:28, chip time 3:01:27.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — Senior",
            summary:
              "Michelle Needham is first listed in this published category: race time 3:13:42, chip time 3:13:41.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — Over 50",
            summary:
              "Helen Hartnett is first listed in this published category: race time 3:14:51, chip time 3:14:45.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Men — Over 60",
            summary:
              "Ken Carey is first listed in this published category: race time 3:35:45, chip time 3:35:03.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — Over 60",
            summary:
              "Eileen Donoghue is first listed in this published category: race time 4:43:27, chip time 4:42:35.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Men — Over 70",
            summary:
              "Jim Walsh is first listed in this published category: race time 5:29:22, chip time 5:27:47.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
          {
            category: "Women — Over 80",
            summary:
              "Terry Gough is first listed in this published category: race time 6:43:36, chip time 6:43:36.",
            sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
          },
        ],
      },
      {
        year: 2024,
        resultsUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
        summary:
          "The full-marathon timing table publishes individual lap splits, race time, chip time and category labels. Summaries follow the published category labels and race-time order; they are not a separate prize-allocation list.",
        categories: [
          {
            category: "Men — overall",
            summary:
              "Alan Ritchie is first listed in this published category: race time 2:45:00, chip time 2:44:56.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Men — Senior",
            summary:
              "Alan Ritchie is first listed in this published category: race time 2:45:00, chip time 2:44:56.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Men — Over 40",
            summary:
              "Mark McGarry is first listed in this published category: race time 2:50:35, chip time 2:50:34.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Men — Over 50",
            summary:
              "Don Ryan is first listed in this published category: race time 3:11:49, chip time 3:11:39.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — overall",
            summary:
              "Maeve Carville is first listed in this published category: race time 3:20:19, chip time 3:20:18.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — Senior",
            summary:
              "Maeve Carville is first listed in this published category: race time 3:20:19, chip time 3:20:18.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — Over 40",
            summary:
              "Eilis Lynch is first listed in this published category: race time 3:24:02, chip time 3:23:40.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — Over 50",
            summary:
              "Aidan Hogan is first listed in this published category: race time 3:29:41, chip time 3:29:30.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Men — Over 60",
            summary:
              "Leslie Wilkinson is first listed in this published category: race time 3:50:58, chip time 3:50:41.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — Over 60",
            summary:
              "Eileen Donoghue is first listed in this published category: race time 4:16:38, chip time 4:15:50.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Men — Over 70",
            summary:
              "Larry Rigney is first listed in this published category: race time 5:54:22, chip time 5:54:22.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
          {
            category: "Women — Over 80",
            summary:
              "Terry Gough is first listed in this published category: race time 6:46:49, chip time 6:46:49.",
            sourceUrl: "https://redtagtiming.com/results/RGB2024_42km.html",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://rungalwaybay.com/",
      },
      {
        label: "Course information",
        url: "https://rungalwaybay.com/full-marathon/",
      },
      {
        label: "Results",
        url: "https://rungalwaybay.com/results/",
      },
      {
        label: "Race FAQ and date",
        url: "https://rungalwaybay.com/faqs/",
      },
    ],
    fieldSize: {
      display: "About 350",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://redtagtiming.com/results/RGB2025_42km.html",
      note: "Based on 353 full-marathon finishers in 2025, excluding 12 runners listed as not finishing.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2026 start",
        value: "08:30 local time.",
        sourceUrl: "https://rungalwaybay.com/faqs/",
      },
      {
        label: "2026 baggage",
        value: "No official bag drop; plan baggage arrangements before travelling.",
        sourceUrl: "https://rungalwaybay.com/full-marathon/",
      },
    ],
    nextDateNote: "2027 date has not yet been verified from the organiser.",
  },
  {
    slug: "dingle-marathon",
    name: "Dingle Marathon",
    country: "ireland",
    city: "Dingle",
    region: "County Kerry",
    timeZone: "Europe/Dublin",
    officialUrl: "https://dinglemarathon.ie/",
    description:
      "Dingle Marathon makes a road circuit of the Kerry peninsula, heading through Ventry towards Slea Head before continuing through Dunquin and Ballyferriter back to town. Coastal scenery accompanies a hilly course, including a substantial climb around mile 22. Save something for it; the route has clearly not read the memo about tired legs. Full and half-marathon runners start together, but enter their distances separately. The published full-marathon cutoff is six hours from the gun, an important consideration when choosing this race.",
    course: {
      summary:
        "Dingle to Ventry and Slea Head, continuing through Dunquin and Ballyferriter before returning to Dingle.",
      surface: "Road",
      profile: "Hilly, including a challenging climb around mile 22.",
      links: [
        {
          label: "Official course information",
          url: "https://dinglemarathon.ie/the-course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "General registration for 2027 is advertised to open at 09:00 on 30 September 2026; use the official Eventmaster link.",
        url: "https://eventmaster.ie/event/2xmRS2qc0z",
      },
    ],
    editions: [
      {
        date: "2027-09-04",
        sourceUrl: "https://dinglemarathon.ie/",
      },
    ],
    media: [
      {
        label: "Official video gallery",
        url: "https://dinglemarathon.ie/the-race/video-gallery/",
        kind: "video",
      },
    ],
    resultsUrl: "https://dinglemarathon.ie/the-race/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl:
          "https://myrunresults.com/events/dingle_half_marathon__full_marathon_2026/6031/results",
        summary:
          "The full and half marathons took place on 5 September. The organiser’s FAQ records a new women’s full-marathon course record by Lillian Bradley; select the full-marathon distance in the timing portal for complete placings.",
        categories: [
          {
            category: "Women — course record",
            summary:
              "Lillian Bradley’s 2:48:37 from 2026 is listed as the women’s full-marathon course record.",
            sourceUrl: "https://dinglemarathon.ie/the-race/faqs/",
          },
        ],
        date: "2026-09-05",
      },
      {
        year: 2025,
        resultsUrl: "https://dinglemarathon.ie/the-race/results/",
        summary:
          "The organiser’s archive links the full and half marathon results for the 6 September 2025 edition.",
        categories: [],
        date: "2025-09-06",
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://dinglemarathon.ie/",
      },
      {
        label: "Course information",
        url: "https://dinglemarathon.ie/the-course/",
      },
      {
        label: "Results",
        url: "https://dinglemarathon.ie/the-race/results/",
      },
      {
        label: "Race FAQ",
        url: "https://dinglemarathon.ie/the-race/faqs/",
      },
      {
        label: "2027 entry",
        url: "https://eventmaster.ie/event/2xmRS2qc0z",
      },
    ],
    fieldSize: {
      display: "About 750",
      basis: "Finishers",
      year: "2026",
      sourceUrl:
        "https://corkrunning.blogspot.com/2026/09/a-look-at-2026-dingle-marathon-numbers.html",
      note: "Based on 751 full-marathon finishers in 2026, as reported by Running in Cork. Half-marathon finishers are excluded.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2027 start",
        value: "09:00 local time.",
        sourceUrl: "https://eventmaster.ie/event/2xmRS2qc0z",
      },
      {
        label: "Published full-marathon cutoff",
        value: "Six hours from the gun; confirm final 2027 instructions.",
        sourceUrl: "https://dinglemarathon.ie/the-race/faqs/",
      },
      {
        label: "Minimum age",
        value: "18 on race day.",
        sourceUrl: "https://dinglemarathon.ie/the-race/faqs/",
      },
    ],
  },
];
