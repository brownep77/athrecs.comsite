import type { RoadMarathon } from "./types";

// Organiser and official timing sources opened on 26 September 2026.
// Past-result summaries describe the named edition; no future dates are inferred.
const aucklandCourse = "https://aucklandmarathon.co.nz/race-info/full-marathon/";
const aucklandArchive = "https://aucklandmarathon.co.nz/athlete-info/results-records/";
const auckland2025 = "https://www.sportsplits.com/races/barfoot-thompson-auckland-marathon-2025";
const auckland2024 = "https://www.sportsplits.com/races/barfoot-thompson-auckland-marathon-2024";
const aucklandReport =
  "https://aucklandmarathon.co.nz/athlete-info/latest-news/brigid-dennehy-and-daniel-balchin-win-2025-auckland-marathon-titles/";
const christchurchCourse = "https://www.christchurchmarathon.co.nz/42km-marathon";
const christchurch2026 = "https://results.timingsports.com/christchurchmarathon/2026";
const wellingtonCourse = "https://www.wellingtonmarathon.co.nz/the-course";
const wellington2026 = "https://results.timingsports.com/wellingtonmarathon/2026";
const wellingtonReport =
  "https://wellingtonmarathon.co.nz/storage/app/media/Home%20Page/2026_Post%20Race.pdf";
const rotoruaCourse = "https://www.rotoruamarathon.co.nz/race-options/marathon";
const rotoruaHistory = "https://www.rotoruamarathon.co.nz/about/history";
const rotorua2026 = "https://www.sportsplits.com/races/red-stag-rotorua-marathon-2026";
const rotorua2025 = "https://www.sportsplits.com/races/red-stag-rotorua-marathon-2025";
const rotorua2024Report =
  "https://www.rotoruamarathon.co.nz/news/michael-voss-reigns-in-60th-anniversary-red-stag-rotorua-marathon";
const dunedinCourse = "https://dunedinmarathon.co.nz/race-entry/full-marathon-course/";
const dunedinArchive = "https://dunedinmarathon.co.nz/results/past-results/";
const dunedin2026 =
  "https://dunedinmarathon.co.nz/wp-content/uploads/2026/09/2026-Emersons-Dunedin-Marathon-Full-Marathon.pdf";
const dunedin2025 = "https://dunedinmarathon.co.nz/uncategorized/2025-results/";
const bullerCourse = "https://bgm.nz/race-information/";
const bullerHistory = "https://bgm.nz/historic-results/";
const buller2023 = "https://bgm.nz/results/2023-results/";
const akaroaCourse = "https://runakaroa.com/akaroa-marathon";
const akaroa2026 = "https://www.sportsplits.com/races/run-akaroa-2026";
const selwyn = "https://raceroster.com/events/2027/138402/urban-estates-selwyn-marathon";
const selwynCourse = `${selwyn}/page/course`;
const selwynSchedule = `${selwyn}/page/timetable`;
const selwynResults = "https://results.raceroster.com/v3/events/zxhhc76gvrys5e3x";
const whanganuiInfo = "https://whanganuithreebridges.co.nz/event-info/";
const whanganui2025 = "https://thetimingteamresults.co.nz/pages/event_summary/631/";
const whanganui2024 = "https://thetimingteamresults.co.nz/pages/event_summary/619/";

export const NEW_ZEALAND_ROAD_MARATHONS: RoadMarathon[] = [
  {
    slug: "auckland-marathon",
    name: "Barfoot & Thompson Runaway Auckland Marathon",
    country: "new-zealand",
    city: "Auckland",
    region: "Auckland",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://aucklandmarathon.co.nz/",
    description:
      "Auckland Marathon runs from Devonport to Victoria Park, crossing the Harbour Bridge before following the waterfront towards St Heliers and back. The rolling first half asks for restraint; the flatter second half gives runners a chance to settle into their pace. General entry and race transport are arranged through the organiser. Check the intermediate cut-offs as well as the seven-hour limit, and confirm the provisional 6am start for 2026. That is an early alarm, even by marathon standards.",
    course: {
      summary:
        "Devonport via Takapuna, the Northern Busway and Harbour Bridge, then the waterfront to St Heliers and back to Victoria Park.",
      surface: "Road and paved city waterfront",
      profile: "Rolling first half; flatter second half with small bridge rises",
      links: [{ label: "Marathon route, maps and certification", url: aucklandCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Book the full marathon through the official entry page. Availability and prices change as allocations sell.",
        url: "https://aucklandmarathon.co.nz/entry-info/entry-info/",
      },
    ],
    editions: [{ date: "2026-11-01", sourceUrl: aucklandCourse }],
    nextDateNote:
      "The 2027 marathon date has not yet been confirmed in the checked organiser pages.",
    fieldSize: {
      display: "Around 2,800",
      basis: "Finishers",
      note: "The official 2025 full-marathon winner's result shows 2,776 ranked finishers; this excludes the separate wheelchair race and shorter distances.",
      year: "2025",
      sourceUrl:
        "https://www.sportsplits.com/races/barfoot-thompson-auckland-marathon-2025/events/2/results/individuals/3",
    },
    practical: [
      {
        label: "2026 start",
        value:
          "6:00am is the published provisional marathon start; the organiser says it is subject to change.",
        sourceUrl: aucklandCourse,
      },
      {
        label: "2026 time limit",
        value: "Seven hours, with intermediate cut-offs listed on the course page.",
        sourceUrl: aucklandCourse,
      },
      { label: "Minimum age", value: "18 on race day.", sourceUrl: aucklandCourse },
    ],
    media: [{ label: "2025 official race report", url: aucklandReport, kind: "news" }],
    resultsUrl: aucklandArchive,
    pastEditions: [
      {
        year: 2025,
        date: "2025-11-02",
        resultsUrl: auckland2025,
        summary:
          "Brigid Dennehy set a women's course record and Daniel Balchin regained the men's title. The official results also publish a separate wheelchair marathon.",
        categories: [
          // Official result summary rows: running bibs M3/F2; wheelchair bibs 13005/13000.
          {
            category: "Men",
            summary: "Daniel Balchin won in 2:19:55 net time (bib M3).",
            sourceUrl: auckland2025,
          },
          {
            category: "Women",
            summary: "Brigid Dennehy won in 2:38:10 net time (bib F2), a course record.",
            sourceUrl: aucklandReport,
          },
          {
            category: "Wheelchair men",
            summary:
              "Michael Taylor led the published wheelchair marathon results in 1:29:00 net time (bib 13005).",
            sourceUrl: auckland2025,
          },
          {
            category: "Wheelchair women",
            summary:
              "Sally Barkman led the published wheelchair marathon results in 1:53:41 net time (bib 13000).",
            sourceUrl: auckland2025,
          },
        ],
      },
      {
        year: 2024,
        date: "2024-11-03",
        resultsUrl: auckland2024,
        summary:
          "The 2024 timing summary publishes running and wheelchair marathon podiums; times below are the provider's net times.",
        categories: [
          {
            category: "Men",
            summary: "Oska Baynes placed first in 2:21:49 (bib 8).",
            sourceUrl: auckland2024,
          },
          {
            category: "Women",
            summary: "Brigid Dennehy placed first in 2:41:31 (bib 5).",
            sourceUrl: auckland2024,
          },
          {
            category: "Wheelchair men",
            summary: "Kevin Gaidies placed first in 1:57:41 (bib 13005).",
            sourceUrl: auckland2024,
          },
          {
            category: "Wheelchair women",
            summary: "Tiffiney Perry placed first in 1:57:45 (bib 13001).",
            sourceUrl: auckland2024,
          },
        ],
      },
    ],
    sources: [
      { label: "Official marathon information", url: aucklandCourse },
      { label: "Official results archive", url: aucklandArchive },
      { label: "2025 official timing results", url: auckland2025 },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "christchurch-marathon",
    name: "ASICS Christchurch Marathon",
    country: "new-zealand",
    city: "Christchurch",
    region: "Canterbury",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://www.christchurchmarathon.co.nz/",
    description:
      "Christchurch Marathon takes to the city’s flat roads and paved paths, with the Avon River, Hagley Park and central landmarks along the way. The proposed 2027 course uses two laps, starting on Park Terrace and finishing in the park’s event village, but still needs final approval. General entries are open through the organiser. The compact layout offers supporters repeat chances to spot their runner, while the flat profile makes even pacing a reasonable ambition rather than a guarantee.",
    course: {
      summary:
        "The planned 2027 route is two laps from Park Terrace through the central city and Hagley Park; final route approval remains pending.",
      surface: "City roads and paved cycle paths, with a park finish",
      profile: "Flat",
      links: [{ label: "2027 marathon course", url: christchurchCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description: "2027 entries are open through the organiser's registration link.",
        url: "https://www.christchurchmarathon.co.nz/",
      },
    ],
    editions: [{ date: "2027-04-18", sourceUrl: "https://www.christchurchmarathon.co.nz/" }],
    fieldSize: {
      display: "Around 1,300",
      basis: "Entrants",
      note: "Official 2026 results show 1,325 entrants and 1,134 finishers in the running marathon; wheelchair and shorter races are separate.",
      year: "2026",
      sourceUrl: christchurch2026,
    },
    practical: [
      {
        label: "Published 2027 start",
        value: "7:30am; check the final race schedule before travel.",
        sourceUrl: christchurchCourse,
      },
    ],
    media: [
      {
        label: "Official news and course updates",
        url: "https://www.christchurchmarathon.co.nz/news-updates/hello-from-the-asics-christchurch-marathon",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.christchurchmarathon.co.nz/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-04-12",
        resultsUrl: christchurch2026,
        summary:
          "Official timing records 1,134 running-marathon finishers and four wheelchair-marathon finishers. The archive also links earlier editions and identifies years when no event took place.",
        categories: [
          {
            category: "Men",
            summary:
              "The official marathon summary records a first male time of 2:24:19. Individual athlete rows were not available to verify here.",
            sourceUrl: christchurch2026,
          },
          {
            category: "Women",
            summary:
              "The official marathon summary records a first female time of 2:38:14. Individual athlete rows were not available to verify here.",
            sourceUrl: christchurch2026,
          },
          {
            category: "Wheelchair marathon",
            summary:
              "Five entrants and four finishers are recorded; the summary lists first male and female times of 3:32:04 and 4:51:57 respectively.",
            sourceUrl: christchurch2026,
          },
        ],
      },
    ],
    sources: [
      { label: "2027 date and entry", url: "https://www.christchurchmarathon.co.nz/" },
      { label: "2027 course", url: christchurchCourse },
      { label: "Results archive", url: "https://www.christchurchmarathon.co.nz/results" },
      { label: "2026 official timing", url: christchurch2026 },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "wellington-marathon",
    name: "Gazley Volkswagen Wellington Marathon",
    country: "new-zealand",
    city: "Wellington",
    region: "Wellington",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://www.wellingtonmarathon.co.nz/",
    description:
      "Wellington Marathon follows the capital’s harbour roads for two laps, taking in Oriental Parade and Evans Bay towards the Miramar Peninsula. The stadium’s Fran Wilde Walkway serves as the start and finish, and its access ramp supplies the principal rise on an otherwise flat route. The 2027 race marks the event’s 40th anniversary, with entry due to open on 1 October 2026. Running and walking options have separate results. Check the first-lap deadline and road-control hours when planning your pace.",
    course: {
      summary:
        "Two harbour laps from Hnry Stadium through the CBD, Oriental Parade and Evans Bay towards the Miramar Peninsula.",
      surface: "Road and paved waterfront",
      profile: "Flat apart from the stadium access ramp",
      links: [{ label: "Route, map and aid stations", url: wellingtonCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "The organiser says 2027 entry opens on 1 October 2026. Follow the official entry page for running and walking options.",
        url: "https://www.wellingtonmarathon.co.nz/entry-info",
      },
    ],
    editions: [{ date: "2027-07-04", sourceUrl: "https://www.wellingtonmarathon.co.nz/" }],
    fieldSize: {
      display: "Around 500",
      basis: "Entrants",
      note: "The 2026 timing dashboard lists 512 running-marathon entrants and 426 finishers; a separate marathon walk had 25 entrants and 23 finishers.",
      year: "2026",
      sourceUrl: wellington2026,
    },
    practical: [
      {
        label: "Published course cut-off",
        value:
          "Runners must complete the first marathon lap by 11:00am. Road controls end at 1:00pm; consult the current race instructions for support after that time.",
        sourceUrl: wellingtonCourse,
      },
    ],
    media: [{ label: "2026 official race report", url: wellingtonReport, kind: "news" }],
    resultsUrl: "https://www.wellingtonmarathon.co.nz/history",
    pastEditions: [
      {
        year: 2026,
        date: "2026-06-28",
        resultsUrl: wellington2026,
        summary:
          "The 39th edition took place in cold southerly conditions. Charlotte Burgess set a women's race record while Josh Stewart won the men's marathon.",
        categories: [
          {
            category: "Men",
            summary:
              "Josh Stewart won in 2:32:51, according to the organiser's post-race report, page 1.",
            sourceUrl: wellingtonReport,
          },
          {
            category: "Women",
            summary:
              "Charlotte Burgess won in a race-record 2:46:06, according to the organiser's post-race report, page 1.",
            sourceUrl: wellingtonReport,
          },
          {
            category: "Marathon walk",
            summary:
              "The official dashboard records 23 finishers and first male/female times of 5:12:21 and 5:20:56. Individual winners were not verified.",
            sourceUrl: wellington2026,
          },
        ],
      },
    ],
    sources: [
      { label: "2027 date and entry announcement", url: "https://www.wellingtonmarathon.co.nz/" },
      { label: "Official route", url: wellingtonCourse },
      { label: "Historical results", url: "https://www.wellingtonmarathon.co.nz/history" },
      { label: "2026 report", url: wellingtonReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "rotorua-marathon",
    name: "Red Stag Rotorua Marathon",
    country: "new-zealand",
    city: "Rotorua",
    region: "Bay of Plenty",
    timeZone: "Pacific/Auckland",
    officialUrl: rotoruaCourse,
    description:
      "Rotorua Marathon is a road circuit of Lake Rotorua with a history stretching back to 1965. For 2027, runners go anti-clockwise for the first time in more than fifty years, returning to the original direction. Regulars may therefore find the scenery arriving in an unfamiliar order. The lakefront event village sits beside Novotel Rotorua Lakeside. Entry is through the organiser’s Race Roster page; check the final guide, as the timetable lists an 8am start while some course details remain under revision.",
    course: {
      summary:
        "One anti-clockwise lap of Lake Rotorua in 2027, with a lakefront start area and finish outside Novotel Rotorua Lakeside.",
      surface: "Road",
      profile: "Lake circuit with changes of elevation",
      links: [
        { label: "2027 marathon route and map", url: rotoruaCourse },
        {
          label: "Explanation of the 2027 route change",
          url: "https://www.rotoruamarathon.co.nz/news/a-new-take-on-the-lake",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Enter the 2027 full marathon through the organiser's Race Roster registration. Walkers may participate, but the organiser no longer offers separate walking merit results or awards.",
        url: "https://raceroster.com/events/2027/139959/2027-red-stag-rotorua-marathon",
      },
    ],
    editions: [{ date: "2027-05-01", sourceUrl: rotoruaCourse }],
    practical: [
      { label: "Minimum age", value: "18 on race day.", sourceUrl: rotoruaCourse },
      {
        label: "Published 2027 start",
        value:
          "The timetable lists 8:00am on Hinemaru Street. The marathon course page still has some details marked coming soon, so confirm the final event guide.",
        sourceUrl: "https://www.rotoruamarathon.co.nz/athlete-info/timetable",
      },
    ],
    media: [
      {
        label: "Official 2027 course announcement",
        url: "https://www.rotoruamarathon.co.nz/news/a-new-take-on-the-lake",
        kind: "news",
      },
    ],
    resultsUrl: rotoruaHistory,
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-02",
        resultsUrl: rotorua2026,
        summary:
          "The 62nd edition's official timing summary separates the open marathon and NZ Masters Marathon Championships. Gun and net times are both published.",
        categories: [
          {
            category: "Men",
            summary: "Daniel Balchin won in 2:19:32 gun and net time (bib 1759).",
            sourceUrl: rotorua2026,
          },
          {
            category: "Women",
            summary: "Bara Styblova won in 2:43:45 gun time, 2:43:44 net (bib 832).",
            sourceUrl: rotorua2026,
          },
          {
            category: "NZ Masters Marathon Championships — men",
            summary:
              "Daniel Balchin led the published masters championship classification in 2:19:32 gun time (bib 1759).",
            sourceUrl: rotorua2026,
          },
          {
            category: "NZ Masters Marathon Championships — women",
            summary:
              "Kate Macdonald led the published masters championship classification in 3:04:17 gun time, 3:04:14 net (bib 1737).",
            sourceUrl: rotorua2026,
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: rotorua2025,
        summary:
          "Daniel Balchin and Billie Haresnape led the full-marathon results. The timing provider publishes a separate New Zealand Marathon Champs classification, which should not be confused with the open race.",
        categories: [
          {
            category: "Men",
            summary: "Daniel Balchin placed first in 2:24:41 gun and net time (bib 4911).",
            sourceUrl: rotorua2025,
          },
          {
            category: "Women",
            summary: "Billie Haresnape placed first in 3:03:49 gun and net time (bib 5228).",
            sourceUrl: rotorua2025,
          },
          {
            category: "New Zealand Marathon Champs — men",
            summary:
              "The provider's separate championship table is led by Rodwyn Isaacs in 2:28:48 (bib 5398).",
            sourceUrl: rotorua2025,
          },
          {
            category: "New Zealand Marathon Champs — women",
            summary:
              "The provider's separate championship table is led by Rachel O'Brien in 3:04:31 (bib 5363).",
            sourceUrl: rotorua2025,
          },
        ],
      },
      {
        year: 2024,
        date: "2024-05-04",
        resultsUrl: rotoruaHistory,
        summary:
          "The 60th anniversary edition also hosted the New Zealand Marathon Championships. Michael Voss won a close men's race; Debbie Donald retained her national title.",
        categories: [
          {
            category: "Men",
            summary: "Michael Voss won in 2:23:48 and also took the New Zealand title.",
            sourceUrl: rotorua2024Report,
          },
          {
            category: "Women",
            summary: "Debbie Donald won in 2:46:30 and retained the New Zealand title.",
            sourceUrl: rotorua2024Report,
          },
        ],
      },
    ],
    sources: [
      { label: "2027 race details", url: rotoruaCourse },
      { label: "2027 timetable", url: "https://www.rotoruamarathon.co.nz/athlete-info/timetable" },
      { label: "History and results archive", url: rotoruaHistory },
      { label: "2026 official results", url: rotorua2026 },
      { label: "2025 official results", url: rotorua2025 },
      { label: "2024 official report", url: rotorua2024Report },
    ],
    fieldSize: {
      display: "Around 900",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/146786",
      note: "MarathonView lists 865 full-marathon finishers in 2026, using SportSplits results. Shorter races and relay teams are separate.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "dunedin-marathon",
    name: "Emerson's Dunedin Marathon",
    country: "new-zealand",
    city: "Dunedin",
    region: "Otago",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://dunedinmarathon.co.nz/",
    description:
      "Dunedin Marathon begins at Portobello Recreation Reserve and follows the Otago Peninsula before taking the paved harbour path towards Emerson’s Brewery. Gentle inclines in the first half give way to a mostly flat second half, making this a road marathon with a changing backdrop and a recognisable destination. Caversham Harrier and Athletic Club maintains the results archive, including records for different course versions. The September 2026 race has passed; the organiser has yet to announce a confirmed 2027 date.",
    course: {
      summary:
        "Portobello Recreation Reserve, a Harwood loop and peninsula turnaround, then the harbour shared path and city streets to Emerson's Brewery.",
      surface: "Road and paved shared path",
      profile: "Gentle inclines early; mostly flat second half",
      links: [{ label: "Official full-marathon route", url: dunedinCourse }],
    },
    entryMethods: [
      {
        name: "Organiser entry updates",
        description:
          "Check the official site for the next edition's entry announcement; the displayed 2026 race has already taken place.",
        url: "https://dunedinmarathon.co.nz/",
      },
    ],
    editions: [],
    nextDateNote:
      "The 2026 race took place on 13 September. The organiser has not yet published a confirmed 2027 date on the pages checked.",
    media: [
      {
        label: "Official race photo galleries",
        url: "https://dunedinmarathon.co.nz/about-2/2024-galleries/",
        kind: "photos",
      },
    ],
    resultsUrl: dunedinArchive,
    pastEditions: [
      {
        year: 2026,
        date: "2026-09-13",
        resultsUrl: dunedin2026,
        summary:
          "The 46th edition used wave starts and official net-time placings. The results explain that second and third men's finish-line prize order differed from the net-time ranking.",
        categories: [
          // Source PDF page 2, bibs 459 and 470; category headings also on page 2.
          {
            category: "Men",
            summary: "Dwight Grieve won in 2:43:06 net time (bib 459, results page 2).",
            sourceUrl: dunedin2026,
          },
          {
            category: "Women",
            summary: "Odette Jennings won in 2:56:44 net time (bib 470, results page 2).",
            sourceUrl: dunedin2026,
          },
          {
            category: "Senior and masters categories",
            summary:
              "The results include Senior Men and Women under 35, M35–49, W35–49, M50+ and W50+, with category positions alongside overall and gender positions.",
            sourceUrl: dunedin2026,
          },
        ],
      },
      {
        year: 2025,
        date: "2025-09-14",
        resultsUrl: dunedin2025,
        summary:
          "The organiser's 2025 marathon tables identify Dan Hayman and Hannah Oldroyd as the men's and women's winners and link the complete results downloads.",
        categories: [
          {
            category: "Men",
            summary:
              "Dan Hayman placed first in 2:39:48 in the official marathon table (men's winner row).",
            sourceUrl: dunedin2025,
          },
          {
            category: "Women",
            summary:
              "Hannah Oldroyd placed first in 2:53:50 in the official marathon table (women's winner row).",
            sourceUrl: dunedin2025,
          },
        ],
      },
    ],
    sources: [
      { label: "Official marathon course", url: dunedinCourse },
      { label: "Historical results and course versions", url: dunedinArchive },
      { label: "2026 full-marathon results", url: dunedin2026 },
    ],
    fieldSize: {
      display: "Around 500",
      basis: "Finishers",
      year: "2026",
      sourceUrl:
        "https://dunedinmarathon.co.nz/wp-content/uploads/2026/09/2026-Emersons-Dunedin-Marathon-Full-Marathon.pdf",
      note: "The official 2026 full-marathon results list 487 ranked finishers. Non-finishers and shorter races are excluded.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "buller-gorge-marathon",
    name: "Buller Gorge Marathon",
    country: "new-zealand",
    city: "Westport",
    region: "West Coast",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://bgm.nz/",
    description:
      "Buller Gorge Marathon follows the river roads towards Westport, starting near Hawks Crag with an initial trip up the gorge towards Berlins. After turning, runners head back to Victoria Square over an undulating course with three principal hills. The organiser’s buses take entrants from Westport to the start and return their bags to the finish. General entry is available online. This is the festival’s road marathon; its ten-kilometre race uses a coastal trail, so choose the distance carefully.",
    course: {
      summary:
        "Hawks Crag towards Berlins, then back down the Buller Gorge Highway to Victoria Square in Westport.",
      surface: "Road",
      profile: "Undulating, with three principal hills",
      links: [{ label: "Race information and course diagrams", url: bullerCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Use the registration link on the organiser's site and select the individual full-marathon run.",
        url: "https://bgm.nz/",
      },
    ],
    editions: [{ date: "2027-02-13", sourceUrl: bullerCourse }],
    practical: [
      { label: "2027 start", value: "8:30am.", sourceUrl: bullerCourse },
      {
        label: "2027 transport",
        value:
          "Start buses leave Victoria Square from 6:45am; the organiser asks runners to line up by 6:30am.",
        sourceUrl: bullerCourse,
      },
      {
        label: "2027 timing",
        value: "Official timekeeping stops at 2:15pm.",
        sourceUrl: bullerCourse,
      },
    ],
    media: [{ label: "Official organiser updates", url: "https://bgm.nz/updates/", kind: "news" }],
    resultsUrl: "https://bgm.nz/results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://events.barefootsport.co.nz/event/964/results",
        summary:
          "The organiser links the 2025 edition to Barefoot Sports. Its result rows were unavailable during checking, so no winner or category figures are reproduced.",
        categories: [],
      },
      {
        year: 2024,
        resultsUrl: "https://bgm.nz/results/",
        summary:
          "The organiser's historical winners tables name Andy Good and Hannah Oldroyd as the 2024 full-marathon winners.",
        categories: [
          {
            category: "Men",
            summary:
              "Andy Good is listed with 2:23:49 in the 2024 men's full-marathon winners row.",
            sourceUrl: bullerHistory,
          },
          {
            category: "Women",
            summary:
              "Hannah Oldroyd is listed with 2:49:50 in the 2024 women's full-marathon winners row.",
            sourceUrl: bullerHistory,
          },
        ],
      },
      {
        year: 2023,
        resultsUrl: buller2023,
        summary:
          "Hannah Oldroyd was first overall in the published full-marathon running results. Michael Anderson was the first man.",
        categories: [
          {
            category: "Women and overall",
            summary: "Hannah Oldroyd finished first overall in 2:46:46.50 (bib 180).",
            sourceUrl: buller2023,
          },
          {
            category: "Men",
            summary: "Michael Anderson was first man and second overall in 2:47:56.03 (bib 195).",
            sourceUrl: buller2023,
          },
        ],
      },
    ],
    sources: [
      { label: "2027 marathon information", url: bullerCourse },
      { label: "Official results archive", url: "https://bgm.nz/results/" },
      { label: "Historical winners", url: bullerHistory },
      { label: "2023 results", url: buller2023 },
    ],
    fieldSize: {
      display: "Around 110",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://wrw.org.nz/2026-buller-gorge-10k/",
      note: "Wellington Runners & Walkers reports 107 full-marathon finishers in 2026, excluding relay teams and shorter races.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "run-akaroa-marathon",
    name: "Run Akaroa — The Grand Hotel Marathon",
    country: "new-zealand",
    city: "Akaroa",
    region: "Canterbury",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://runakaroa.com/",
    description:
      "Run Akaroa’s marathon follows sealed Summit Road around the Banks Peninsula harbour rim before descending into Akaroa. The final seven kilometres run downhill to The Grand Hotel, although the undulating ridge section needs attention first. Gravity is helpful, but rarely does the whole job. General entries are available for this running event, which has no separate walking category. Check the start transport and intermediate cut-offs, and use the course flyover to see how the route fits into the volcanic landscape.",
    course: {
      summary:
        "Summit Road above Little Akaloa, an out-and-back towards Hilltop, then around the rim and down Long Bay Road to Akaroa.",
      surface: "Sealed road",
      profile: "Undulating ridge road followed by a seven-kilometre descent",
      links: [{ label: "Marathon map, profile and flyover", url: akaroaCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "2027 entries are open through the organiser's entry page. Select the full marathon; it has no separate walking option.",
        url: "https://runakaroa.com/entry-info",
      },
    ],
    editions: [{ date: "2027-05-16", sourceUrl: akaroaCourse }],
    practical: [
      {
        label: "2027 start",
        value: "9:00am, with an 8:45am briefing at the Summit Road start.",
        sourceUrl: akaroaCourse,
      },
      {
        label: "2027 cut-offs",
        value: "12:10pm at 19km; 2:30pm at 36km; full course closes at 3:30pm.",
        sourceUrl: akaroaCourse,
      },
      { label: "Minimum age", value: "18.", sourceUrl: akaroaCourse },
    ],
    media: [{ label: "Official 2026 event film", url: "https://runakaroa.com/", kind: "video" }],
    resultsUrl: akaroa2026,
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-17",
        resultsUrl: akaroa2026,
        summary:
          "The published 2026 timing summary identifies Byron Mann and Frances Redmond as marathon winners. The marathon is listed separately from the half marathon and 10km.",
        categories: [
          {
            category: "Men",
            summary: "Byron Mann won in 2:51:49 gun time (bib 110).",
            sourceUrl: akaroa2026,
          },
          {
            category: "Women",
            summary: "Frances Redmond won in 3:09:17 gun time (bib 19).",
            sourceUrl: akaroa2026,
          },
        ],
      },
    ],
    sources: [
      { label: "Official course and 2027 date", url: akaroaCourse },
      { label: "Entry information", url: "https://runakaroa.com/entry-info" },
      { label: "2026 official timing", url: akaroa2026 },
    ],
    fieldSize: {
      display: "Around 110",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://leithharriers.com/road-2026/",
      note: "Leith Harrier & Athletic Club's 2026 report records a field of 108 in the full-marathon results.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "selwyn-marathon",
    name: "Urban Estates Selwyn Marathon",
    country: "new-zealand",
    city: "Lincoln",
    region: "Canterbury",
    timeZone: "Pacific/Auckland",
    officialUrl: selwyn,
    description:
      "Selwyn Marathon starts and finishes at Lincoln Event Centre, using two flat laps through the town, rural roads and Rossendale Wines. Returning through the event centre between laps gives supporters another chance to see runners without organising an expedition. Direct entry, maps and the timetable are on the organiser’s Race Roster pages. The course has been measured in cooperation with AIMS. Allow for both the first-lap deadline and the six-hour overall limit when deciding whether it suits your planned pace.",
    course: {
      summary:
        "Two laps from Lincoln Event Centre through Lincoln, surrounding country roads and Rossendale Wines.",
      surface: "Road and cycle/walking pathway",
      profile: "Flat",
      links: [{ label: "Official route and map", url: selwynCourse }],
    },
    entryMethods: [
      {
        name: "General entry",
        description: "Register directly on the organiser's 2027 Race Roster page.",
        url: selwyn,
      },
    ],
    editions: [{ date: "2027-06-06", sourceUrl: selwyn }],
    practical: [
      {
        label: "2027 start",
        value: "8:00am, after a 7:45am marathon briefing.",
        sourceUrl: selwynSchedule,
      },
      {
        label: "2027 cut-offs",
        value: "First lap by 11:00am and finish by 2:00pm.",
        sourceUrl: selwynSchedule,
      },
      { label: "Minimum age", value: "18 on race day.", sourceUrl: `${selwyn}/page/faqs` },
    ],
    media: [
      {
        label: "Officially linked 2026 race photos",
        url: "https://geosnapshot.com/e/selwyn-marathon-31st-may-2026/53481?source=event-eo-share",
        kind: "photos",
      },
    ],
    resultsUrl: selwynResults,
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-31",
        resultsUrl: selwynResults,
        summary:
          "The organiser's 2026 event page confirms the 31 May edition in Lincoln. Its linked Race Roster results gateway did not expose edition-specific rows during checking; category summaries remain unverified.",
        categories: [],
      },
    ],
    sources: [
      { label: "2027 official registration", url: selwyn },
      { label: "Course", url: selwynCourse },
      { label: "2027 schedule", url: selwynSchedule },
      {
        label: "2026 organiser event page",
        url: "https://raceroster.com/events/2026/106786/urban-estates-selwyn-marathon",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "whanganui-three-bridges-marathon",
    name: "PAK'nSAVE Whanganui 3 Bridges Marathon",
    country: "new-zealand",
    city: "Whanganui",
    region: "Manawatū-Whanganui",
    timeZone: "Pacific/Auckland",
    officialUrl: "https://whanganuithreebridges.co.nz/",
    description:
      "Whanganui’s Three Bridges Marathon is based at Kowhai Park, using public roads and footpaths on a riverside circuit with bridge crossings. Full-marathon runners and walkers have entry options, while the 2026 Athletics New Zealand championship has separate arrangements. Three aid stations serve each quarter-marathon lap. The 6am start allows seven hours before official timing closes, so check both the clock and the course instructions. The next confirmed race is on 6 December 2026; a 2027 date has yet to be announced.",
    course: {
      summary:
        "A lap-based course on Whanganui's public roads and footpaths, starting and finishing at Kowhai Park; consult the organiser's maps for the current bridge routing.",
      surface: "Road and footpath",
      profile: "River-side circuit with bridge crossings",
      links: [{ label: "Official maps and event instructions", url: whanganuiInfo }],
    },
    entryMethods: [
      {
        name: "General full-marathon entry",
        description:
          "The organiser offers marathon run and walk entries through its linked registration service.",
        url: whanganuiInfo,
      },
      {
        name: "Athletics NZ championship entry",
        description:
          "A separate championship entry is listed for 2026; check the organiser's championship terms before selecting it.",
        url: whanganuiInfo,
      },
    ],
    editions: [{ date: "2026-12-06", sourceUrl: whanganuiInfo }],
    nextDateNote: "The organiser has not yet confirmed a 2027 date in the pages checked.",
    practical: [
      {
        label: "2026 start",
        value: "6:00am for the full-marathon run and walk.",
        sourceUrl: whanganuiInfo,
      },
      {
        label: "2026 timing cut-off",
        value: "Official timing and course organisation close at 1:00pm.",
        sourceUrl: whanganuiInfo,
      },
    ],
    media: [
      {
        label: "Official event updates",
        url: "https://whanganuithreebridges.co.nz/",
        kind: "news",
      },
    ],
    resultsUrl: whanganuiInfo,
    pastEditions: [
      {
        year: 2025,
        resultsUrl: whanganui2025,
        summary:
          "The official timing summary publishes separate marathon run and walk standings. Placings use gun time; the walk is a recreational classification rather than an official race-walk competition.",
        categories: [
          {
            category: "Marathon run — men",
            summary: "Tom Francis won in 2:48:10.09 (men's first-place row).",
            sourceUrl: whanganui2025,
          },
          {
            category: "Marathon run — women",
            summary: "Anita Chan won in 3:29:24.80 (women's first-place row).",
            sourceUrl: whanganui2025,
          },
          {
            category: "Marathon walk — men",
            summary: "Matthew Schipper placed first in 5:22:47.62.",
            sourceUrl: whanganui2025,
          },
          {
            category: "Marathon walk — women",
            summary: "Jenny Cheevers placed first in 5:35:21.39.",
            sourceUrl: whanganui2025,
          },
        ],
      },
      {
        year: 2024,
        resultsUrl: whanganui2024,
        summary:
          "The 2024 summary distinguishes marathon running, marathon walking and an informal early-start marathon. It warns that online age groups differ from prize-giving categories.",
        categories: [
          {
            category: "Marathon run — men",
            summary: "Gene Rand won in 2:44:15.58 gun time.",
            sourceUrl: whanganui2024,
          },
          {
            category: "Marathon run — women",
            summary: "Gabriela Diver won in 3:20:49.28 gun time.",
            sourceUrl: whanganui2024,
          },
          {
            category: "Marathon walk — men",
            summary: "Graeme Olliver placed first in 5:32:35.33 gun time.",
            sourceUrl: whanganui2024,
          },
          {
            category: "Marathon walk — women",
            summary: "Jenny Cheevers placed first in 5:19:14.03 gun time.",
            sourceUrl: whanganui2024,
          },
          {
            category: "Early-start marathon",
            summary:
              "The provider marks these times informal because participants started before the course was active; they should not be treated as standard race results.",
            sourceUrl: whanganui2024,
          },
        ],
      },
    ],
    sources: [
      { label: "2026 date, entry and course", url: whanganuiInfo },
      { label: "2025 official timing", url: whanganui2025 },
      { label: "2024 official timing", url: whanganui2024 },
    ],
    fieldSize: {
      display: "Around 100",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://thetimingteamresults.co.nz/pages/result_list/4225/all/all/7",
      note: "The official 2025 marathon-run results list 102 finishers. The separate marathon walk and shorter races are excluded.",
    },
    checkedAt: "2026-09-26",
  },
];
