import type { RoadMarathon } from "./types";

export const SOUTH_AFRICA_WESTERN_MARATHONS: RoadMarathon[] = [
  {
    slug: "cape-town-marathon",
    name: "Sanlam Cape Town Marathon",
    country: "south-africa",
    city: "Cape Town",
    region: "Western Cape",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://capetownmarathon.com/",
    description:
      "The Sanlam Cape Town Marathon is a road marathon through Cape Town’s city streets, with neighbourhood running, coastal stretches and Table Mountain overlooking proceedings. Its first edition as an Abbott World Marathon Major is set for May 2027, following the 2026 race’s successful assessment. The general ballot has closed, so prospective visitors should check official charity and tour allocations. The mountain supplies the backdrop; the runner still supplies the work.",
    course: {
      summary:
        "The published 2026 route links Green Point and Sea Point with central Cape Town and the southern suburbs, including Rondebosch and Newlands. Check the organiser’s route page for the final 2027 layout.",
      surface: "Paved roads.",
      profile:
        "Predominantly flat city running with changes of gradient; coastal sections are exposed to the weather.",
      links: [
        {
          label: "Official marathon and route information",
          url: "https://capetownmarathon.com/marathon/#route-map",
        },
        {
          label: "Published 2026 route and landmarks",
          url: "https://capetownmarathon.com/wp-content/uploads/2026/02/2026-Cape-Town-Marathon-Route-Landmarks-11-Feb.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "2027 general ballot — closed",
        description:
          "The ballot ran from 10 to 24 June 2026. Successful applicants had a separate payment deadline; submitting a ballot application did not guarantee a place.",
        url: "https://capetownmarathon.com/FAQ/",
      },
      {
        name: "Official international tour operators",
        description:
          "Approved travel operators offer marathon packages with entry. Contact a listed operator for current allocations, package terms and availability.",
        url: "https://capetownmarathon.com/international-travel-program/",
      },
      {
        name: "Official charity places",
        description:
          "The organiser lists international charity partners offering entry packages. The separate charity allocation for South African residents is sold out.",
        url: "https://capetownmarathon.com/run-for-charity/",
      },
      {
        name: "Existing priority and sponsored allocations",
        description:
          "Candidacy Club priority selection has closed. Runners who previously selected a sponsored 2027 place following the 2025 cancellation should follow their organiser-issued redemption instructions.",
        url: "https://capetownmarathon.com/FAQ/",
      },
    ],
    editions: [
      {
        date: "2027-05-23",
        sourceUrl: "https://www.worldmarathonmajors.com/cape-town-major",
      },
    ],
    fieldSize: {
      display: "About 18,500",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/147085",
      note: "Rounded from 18,512 full-marathon finishers listed by MarathonView, which cites SportSplits. This is one edition, not a multi-year average.",
    },
    practical: [
      {
        label: "Minimum age",
        value: "18 on race day.",
        sourceUrl: "https://capetownmarathon.com/FAQ/",
      },
      {
        label: "Time limit",
        value: "6 hours 30 minutes; consult the final race instructions for intermediate cutoffs.",
        sourceUrl: "https://capetownmarathon.com/FAQ/",
      },
      {
        label: "2027 entry transfers",
        value: "Entries are not transferable and substitutions are not permitted.",
        sourceUrl: "https://capetownmarathon.com/FAQ/",
      },
      {
        label: "Major status",
        value:
          "The first edition as the eighth Abbott World Marathon Major is 23 May 2027. Finishers of the assessed 2026 race also receive a Major star.",
        sourceUrl: "https://www.worldmarathonmajors.com/cape-town-major",
      },
    ],
    media: [
      {
        label: "Organiser’s 2026 race report",
        url: "https://capetownmarathon.com/most-successful-sanlam-cape-town-marathon-sets-scene-for-majors-status/",
        kind: "news",
      },
      {
        label: "Why the 2025 marathon was cancelled",
        url: "https://capetownmarathon.com/cancellation-timeline-of-the-2025-sanlam-cape-town-marathon/",
        kind: "news",
      },
    ],
    resultsUrl: "https://capetownmarathon.com/2026-results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-24",
        resultsUrl: "https://capetownmarathon.com/2026-results/",
        summary:
          "Mohamed Esa won the men’s race in a course record, while Dera Dida Yami took the women’s title. David Weir and Manuela Schär won the wheelchair races. Cape Town also hosted the separate AbbottWMM age-group World Championships; those championship categories are identified below.",
        categories: [
          {
            category: "Men — elite",
            summary: "Mohamed Esa won in 2:04:55, a course record.",
            sourceUrl: "https://capetownmarathon.com/2026-results/",
          },
          {
            category: "Women — elite",
            summary: "Dera Dida Yami won in 2:23:18.",
            sourceUrl: "https://capetownmarathon.com/2026-results/",
          },
          {
            category: "Men — wheelchair",
            summary: "David Weir won in a course-record 1:30:20.",
            sourceUrl: "https://capetownmarathon.com/2026-results/",
          },
          {
            category: "Women — wheelchair",
            summary: "Manuela Schär won in a course-record 1:43:25.",
            sourceUrl: "https://capetownmarathon.com/2026-results/",
          },
          {
            category: "World Championships — Men 40–44",
            summary: "Jose Eraldo Lima won in 2:23:47.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 45–49",
            summary: "Naoki Matsuoka won in 2:30:19.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 50–54",
            summary: "Tom van Ongeval won in 2:29:44.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 55–59",
            summary: "Robert Ashby won in 2:38:57.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 60–64",
            summary: "Yuri Strofilov won in 2:45:53.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 65–69",
            summary: "Sergey Apenko won in 3:00:02.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 70–74",
            summary: "Andrew Kilback won in 3:09:07.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 75–79",
            summary: "Yoji Kawase won in 3:48:58.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Men 80+",
            summary: "John Fanshawe won in 4:08:28.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 40–44",
            summary: "Doris Maria Nagel-Wallimann won in 2:48:14.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 45–49",
            summary: "Véronique Leboeuf won in 2:52:43.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 50–54",
            summary: "Astrid Roberts won in 2:51:58.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 55–59",
            summary: "Elizabeth Potter won in 3:01:26.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 60–64",
            summary: "Yongson Basta won in 3:15:23.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 65–69",
            summary: "Tomoko Yamada won in 3:16:27.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 70–74",
            summary: "Andrea Simmons won in 3:41:52.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
          {
            category: "World Championships — Women 75–79",
            summary: "Penny Jarvis won in 3:57:13.",
            sourceUrl: "https://www.worldmarathonmajors.com/rankings/world-championships",
          },
        ],
      },
      {
        year: 2024,
        date: "2024-10-20",
        resultsUrl: "https://capetownmarathon.com/2024-marathon-results/",
        summary:
          "Glenrose Xaba won on her marathon debut with a South African and course record of 2:22:22. Abdisa Tola Adera won the men’s race. Sho Watanabe and Michelle Wheeler took the wheelchair titles. The following year’s marathon was cancelled because of severe winds.",
        categories: [
          {
            category: "Men — overall",
            summary: "Abdisa Tola Adera leads the official results in 2:08:15.",
            sourceUrl: "https://capetownmarathon.com/2024-marathon-results/",
          },
          {
            category: "Women — overall",
            summary: "Glenrose Xaba won in 2:22:22.",
            sourceUrl: "https://capetownmarathon.com/2024-marathon-results/",
          },
          {
            category: "Men — wheelchair",
            summary: "Sho Watanabe won in 1:37:33.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6762",
          },
          {
            category: "Women — wheelchair",
            summary: "Michelle Wheeler won in 2:03:22.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6762",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race website",
        url: "https://capetownmarathon.com/",
      },
      {
        label: "2027 entry and runner FAQs",
        url: "https://capetownmarathon.com/FAQ/",
      },
      {
        label: "AbbottWMM Major announcement and date",
        url: "https://www.worldmarathonmajors.com/cape-town-major",
      },
      {
        label: "2026 elite and wheelchair results",
        url: "https://capetownmarathon.com/2026-results/",
      },
      {
        label: "2026 age-group World Championships",
        url: "https://www.worldmarathonmajors.com/rankings/world-championships",
      },
      {
        label: "2024 results",
        url: "https://capetownmarathon.com/2024-marathon-results/",
      },
      {
        label: "2024 timing results, including wheelchairs",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=6762",
      },
      {
        label: "Organiser’s 2024 Xaba race report",
        url: "https://capetownmarathon.com/glenrose-xaba-shatters-records/",
      },
      {
        label: "2025 cancellation explanation",
        url: "https://capetownmarathon.com/cancellation-timeline-of-the-2025-sanlam-cape-town-marathon/",
      },
      {
        label: "2026 full-marathon field estimate",
        url: "https://marathonview.net/race/147085",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "peninsula-marathon",
    dateNotes: [
      {
        text: "Calendar estimate: 21 February 2027. Awaiting confirmation from the organiser.",
        sourceUrl: "https://runningcalendar.co.za/events/cape-peninsula-marathon",
        expiresAfter: "2027-02-21",
      },
    ],
    name: "Balwin Run Series Peninsula Marathon",
    country: "south-africa",
    city: "Cape Town to Simon’s Town",
    region: "Western Cape",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://celticharriers.co.za/balwin-run-series-peninsula",
    description:
      "The Peninsula Marathon is a point-to-point road race from Green Point in Cape Town to the Naval Sports Ground in Simon’s Town. Organised by Celtic Harriers, it follows the peninsula towards the False Bay coast on a route the club describes as flat and fast. The separate start and finish make transport worth arranging before race morning. A confirmed 2027 date is still to come; the coastline, at least, is already in place.",
    course: {
      summary:
        "The established marathon starts on Main Road in Green Point and finishes at Simon’s Town Naval Sports Ground, following the peninsula and False Bay coastline.",
      surface: "Paved roads.",
      profile: "Predominantly flat point-to-point course, with start and finish well separated.",
      links: [
        {
          label: "Official course description and race information",
          url: "https://celticharriers.co.za/balwin-run-series-peninsula",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry",
        description:
          "Enter the full marathon through the registration link published by Celtic Harriers or the Balwin Run Series. The 2026 entry period is closed; the next opening has not been announced.",
        url: "https://celticharriers.co.za/balwin-run-series-peninsula",
      },
    ],
    editions: [],
    nextDateNote: "The organiser has not confirmed the 2027 marathon date.",
    fieldSize: {
      display: "About 3,600",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
      note: "Rounded from 3,593 full-marathon finishers in the federation’s published results. Half-marathon runners are excluded.",
    },
    practical: [
      {
        label: "Start and finish",
        value: "Green Point to Simon’s Town: plan transport between two different venues.",
        sourceUrl: "https://celticharriers.co.za/balwin-run-series-peninsula",
      },
      {
        label: "Previous start time",
        value:
          "The 2026 marathon started at 05:15. Await the next edition’s timetable before making race-day arrangements.",
        sourceUrl: "https://secure.onreg.com/onreg2/front/step1.php?id=7304",
      },
    ],
    media: [
      {
        label: "Official Peninsula race photos — 2026, 2025 and 2024",
        url: "https://balwin.co.za/marathon-peninsula",
        kind: "photos",
      },
    ],
    resultsUrl: "https://wpa.org.za/road-running-results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-15",
        resultsUrl:
          "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
        summary:
          "George Kusche and Jenna Challenor lead the men’s and women’s marathon results. Western Province Athletics lists 3,593 full-marathon finishers. The age-group summaries below identify the fastest published race time in each group; they are not a separate prize-award list.",
        categories: [
          {
            category: "Men 20–39",
            summary: "George Kusche has the fastest published race time, 02:13:08.421.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Men 40–49",
            summary: "Mthandazo Qhina has the fastest published race time, 02:26:52.701.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Women 40–49",
            summary: "Jenna Challenor has the fastest published race time, 02:47:34.717.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Women 20–39",
            summary: "Steph Mccall has the fastest published race time, 02:51:10.940.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Men 50–59",
            summary: "Quinton Prince has the fastest published race time, 02:51:46.500.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Men 60–69",
            summary: "Timothy Hess has the fastest published race time, 03:19:30.290.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Women 50–59",
            summary: "Marlize Vienings has the fastest published race time, 03:20:08.800.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Women 70–79",
            summary: "Nancy Will has the fastest published race time, 03:54:07.534.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Women 60–69",
            summary: "Elizabeth Bax has the fastest published race time, 03:56:11.540.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
          {
            category: "Men 70–79",
            summary: "Henry Cleophas has the fastest published race time, 04:21:46.626.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
          },
        ],
      },
      {
        year: 2025,
        date: "2025-02-16",
        resultsUrl:
          "https://wpa.org.za/wp-content/uploads/2025/05/Balwin-Sport-Peninsula-Results-2025.xlsx",
        summary:
          "Bennet Seloyi and Jenna Challenor led the men’s and women’s full-marathon fields. The event also hosted the ASA Marathon Championships. The category summaries use the official timing service’s full-race age-group leaderboards, rather than the separate championship medal tables.",
        categories: [
          {
            category: "Men 20–34",
            summary: "Bennet Seloyi leads the official category leaderboard in 2:20:12.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM20-34&timingpoint=31&records=10",
          },
          {
            category: "Men 35–39",
            summary: "Tebogo Pilusa leads the official category leaderboard in 2:24:04.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM35-39&timingpoint=31&records=10",
          },
          {
            category: "Men 40–44",
            summary: "Rirhandzu Rhangani leads the official category leaderboard in 2:31:37.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM40-44&timingpoint=31&records=10",
          },
          {
            category: "Men 45–49",
            summary: "Mthandazo Qhina leads the official category leaderboard in 2:29:19.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM45-49&timingpoint=31&records=10",
          },
          {
            category: "Men 50–54",
            summary: "Charles Tjiane leads the official category leaderboard in 2:32:49.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM50-54&timingpoint=31&records=10",
          },
          {
            category: "Men 55–59",
            summary: "John September leads the official category leaderboard in 3:05:36.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM55-59&timingpoint=31&records=10",
          },
          {
            category: "Men 60–64",
            summary: "Timothy Hess leads the official category leaderboard in 3:13:20.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM60-64&timingpoint=31&records=10",
          },
          {
            category: "Men 65–69",
            summary: "Louis Abbott leads the official category leaderboard in 3:20:34.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM65-69&timingpoint=31&records=10",
          },
          {
            category: "Men 70–74",
            summary: "Sticks Stiglingh leads the official category leaderboard in 3:48:42.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM70-74&timingpoint=31&records=10",
          },
          {
            category: "Men 75–79",
            summary: "Kenny Williams leads the official category leaderboard in 5:00:14.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AM75-79&timingpoint=31&records=10",
          },
          {
            category: "Women 20–34",
            summary: "Jenna Cackett leads the official category leaderboard in 3:09:13.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW20-34&timingpoint=31&records=10",
          },
          {
            category: "Women 35–39",
            summary: "Deanne Laubscher leads the official category leaderboard in 2:53:44.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW35-39&timingpoint=31&records=10",
          },
          {
            category: "Women 40–44",
            summary: "Jenna Challenor leads the official category leaderboard in 2:51:19.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW40-44&timingpoint=31&records=10",
          },
          {
            category: "Women 45–49",
            summary: "Yolande Maclean leads the official category leaderboard in 3:13:36.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW45-49&timingpoint=31&records=10",
          },
          {
            category: "Women 50–54",
            summary: "Elizabeth Potter leads the official category leaderboard in 3:16:41.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW50-54&timingpoint=31&records=10",
          },
          {
            category: "Women 55–59",
            summary: "Ursula Frans leads the official category leaderboard in 3:29:58.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW55-59&timingpoint=31&records=10",
          },
          {
            category: "Women 60–64",
            summary: "Christine Claasen leads the official category leaderboard in 3:47:02.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW60-64&timingpoint=31&records=10",
          },
          {
            category: "Women 65–69",
            summary: "Karen Nuttall leads the official category leaderboard in 4:30:12.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW65-69&timingpoint=31&records=10",
          },
          {
            category: "Women 70–74",
            summary: "Nancy Will leads the official category leaderboard in 4:02:19.",
            sourceUrl:
              "https://live.ultimate.dk/mobile/front/standings.php?eventid=6689&distance=1&category=CATEGORY%3AW70-74&timingpoint=31&records=10",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Celtic Harriers official race information",
        url: "https://celticharriers.co.za/balwin-run-series-peninsula",
      },
      {
        label: "Balwin Run Series official listing",
        url: "https://balwin.co.za/balwin-run-series",
      },
      {
        label: "2026 closed registration and race details",
        url: "https://secure.onreg.com/onreg2/front/step1.php?id=7304",
      },
      {
        label: "2026 federation results",
        url: "https://wpa.org.za/wp-content/uploads/2026/04/Balwin-Pennisula-Results-2026.xlsx",
      },
      {
        label: "2025 federation results",
        url: "https://wpa.org.za/wp-content/uploads/2025/05/Balwin-Sport-Peninsula-Results-2025.xlsx",
      },
      {
        label: "2025 official timing and age categories",
        url: "https://live.ultimate.dk/mobile/front/?eventid=6689",
      },
      {
        label: "Official race photo archive",
        url: "https://balwin.co.za/marathon-peninsula",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "winelands-marathon",
    name: "Sportsmans Warehouse Winelands Marathon",
    country: "south-africa",
    city: "Stellenbosch",
    region: "Western Cape",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://winelandsmarathon.com/",
    description:
      "The Winelands Marathon is a road marathon based in Stellenbosch, with an undulating route through the surrounding winelands. The 2026 race moves to Coetzenburg Stadium, and the organiser has published a provisional course for the new venue. A 05:30 start and six-hour limit give the day a fairly clear shape. All distances are sold out, so an early alarm is currently useful only to runners who already have an entry.",
    course: {
      summary:
        "The provisional 2026 full-marathon route starts and finishes at Coetzenburg Stadium in Stellenbosch. The organiser warns that small route changes remain possible; older fly-throughs describe the previous course.",
      surface: "Paved roads.",
      profile:
        "Undulating winelands course; the provisional 2026 map lists approximately 398 metres of climbing.",
      links: [
        {
          label: "Official current route maps",
          url: "https://winelandsmarathon.com/route-maps",
        },
        {
          label: "Organiser-linked provisional 2026 marathon map",
          url: "https://ridewithgps.com/routes/56188048",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry — 2026 sold out",
        description:
          "The organiser reports that all 2026 distances are sold out, with no waiting list or race-day entries. Use the official race website for any next-edition announcement.",
        url: "https://winelandsmarathon.com/",
      },
      {
        name: "Licensed and unlicensed runners",
        description:
          "The entry system accepts licensed athletes and runners purchasing a temporary licence. Marathon entrants must be at least 20 on race day; a licence does not secure an entry after the race has sold out.",
        url: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
    ],
    editions: [
      {
        date: "2026-11-07",
        sourceUrl: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
    ],
    nextDateNote: "The organiser has not announced a 2027 marathon date.",
    fieldSize: {
      display: "About 1,600",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
      note: "Rounded from 1,564 runners marked Finished in the published 42.2 km results. Other distances and non-finishers are excluded.",
    },
    practical: [
      {
        label: "2026 start",
        value: "05:30 at Coetzenburg Stadium, Stellenbosch.",
        sourceUrl: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
      {
        label: "2026 cutoffs",
        value: "Six hours overall, with a four-hour cutoff at 25.4 km on Steynsrust Bridge.",
        sourceUrl: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
      {
        label: "2026 number collection",
        value:
          "Friday 6 November, 10:00–18:00, at the selected Sportsmans Warehouse collection point. No race-day collection.",
        sourceUrl: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
    ],
    media: [
      {
        label: "Official Winelands photo gallery",
        url: "https://winelandsmarathon.com/gallery",
        kind: "photos",
      },
    ],
    resultsUrl: "https://winelandsmarathon.com/past-results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-11-29",
        resultsUrl:
          "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
        summary:
          "Sithembiso Mqhele won the men’s marathon in 02:23:08. Linda Kinloch-Smith was the first woman in 03:09:58 and also led the women’s 40–49 category. The published full-marathon results contain 1,564 finishers; all ten listed sex-and-age category winners appear below.",
        categories: [
          {
            category: "Men — Senior",
            summary:
              "Sithembiso Mqhele won the category in 02:23:08 and was the first man overall.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Men — 40–49",
            summary: "Mthandazo Qhina won the category in 02:42:50.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Men — 50–59",
            summary: "Quinton Prince won the category in 02:51:04.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Women — 40–49",
            summary:
              "Linda Kinloch-Smith won the category in 03:09:58 and was the first woman overall.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Women — Senior",
            summary: "Jennifer Greig won the category in 03:24:52.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Men — 60–69",
            summary: "Wilfred Demingo won the category in 03:27:03.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Women — 50–59",
            summary: "Ursula Frans won the category in 03:34:36.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Women — 70+",
            summary: "Nancy Will won the category in 03:54:16.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Men — 70+",
            summary: "Brian Merryweather won the category in 04:12:47.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
          {
            category: "Women — 60–69",
            summary: "Jessie Davey won the category in 04:28:12.",
            sourceUrl:
              "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
          },
        ],
      },
      {
        year: 2024,
        date: "2024-11-30",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&RId=4876",
        summary:
          "The 2024 race used the previous Eikestad Primary School venue. Duane Fortuin’s 2:27:51 is recorded by the organiser as the men’s 40–49 course record. The linked timing archive contains the edition’s individual results.",
        categories: [
          {
            category: "Men 40–49 — course record",
            summary:
              "Duane Fortuin recorded 2:27:51, listed by the organiser as the category course record.",
            sourceUrl: "https://winelandsmarathon.com/course-records",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official Winelands Marathon website",
        url: "https://winelandsmarathon.com/",
      },
      {
        label: "Official 2026 entry and practical information",
        url: "https://topevents.co.za/event/sportsmans-warehouse-winelands-marathon-2026/",
      },
      {
        label: "Current course maps and venue",
        url: "https://winelandsmarathon.com/route-maps",
      },
      {
        label: "Official past-results archive",
        url: "https://winelandsmarathon.com/past-results",
      },
      {
        label: "2025 federation results",
        url: "https://wpa.org.za/wp-content/uploads/2025/12/Winelands-2025-FIMAL-RESULTS.xlsx",
      },
      {
        label: "Official course records",
        url: "https://winelandsmarathon.com/course-records",
      },
      {
        label: "2024 official race brochure",
        url: "https://wpa.org.za/wp-content/uploads/2024/01/Winelands-Marathon-Entry-Form-2024_FIN.pdf",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "cango-marathon",
    dateNotes: [
      {
        text: "Calendar estimate: 27 February 2027 for the marathon. Awaiting confirmation from the organiser.",
        sourceUrl: "https://runningcalendar.co.za/events/cango-marathon",
        expiresAfter: "2027-02-27",
      },
    ],
    name: "Infantry School Cango Marathon",
    country: "south-africa",
    city: "Oudtshoorn",
    region: "Western Cape",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://topevents.co.za/event/infantry-school-cango-42-2km-21-1km-2026/",
    description:
      "The Cango Marathon is a road marathon from the Cango Caves to the Infantry School sports ground in Oudtshoorn, in the Western Cape. Its established course loses height overall, although downhill running still leaves the legs with plenty to discuss afterwards. Organiser transport takes runners to the start, an important detail for a race with two different venues. The 2026 edition offered a six-hour limit; the 2027 date and arrangements remain unconfirmed.",
    course: {
      summary:
        "The established 42.195 km course runs from Cango Caves to the Military Base Infantry School sports ground in Oudtshoorn.",
      surface: "Paved roads.",
      profile:
        "Net downhill and point-to-point. The World Athletics course list records a descent of 7.20 metres per kilometre and start-to-finish separation over 50%.",
      links: [
        {
          label: "Official 2026 brochure, start and finish",
          url: "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
        },
        {
          label: "World Athletics certified road-course list",
          url: "https://media.aws.iaaf.org/competitioninfo/037d770d-6a24-43e5-8826-66d8073c4a12.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online pre-entry",
        description:
          "The organiser uses Top Events for full-marathon registration. The 2026 pre-entry period is closed; a dated 2027 entry opening has not been announced.",
        url: "https://topevents.co.za/event/infantry-school-cango-42-2km-21-1km-2026/",
      },
      {
        name: "Licensed and unlicensed runners",
        description:
          "The previous edition accepted both licensed entrants and runners buying a temporary licence. Check the next edition’s rules and registration details when published.",
        url: "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
      },
    ],
    editions: [],
    nextDateNote: "The 2027 marathon date is still to be confirmed.",
    practical: [
      {
        label: "Previous start and time limit",
        value:
          "The 2026 marathon started at 06:00 and had a six-hour limit. The next edition’s timetable is not yet confirmed.",
        sourceUrl:
          "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
      },
      {
        label: "Transport to the start",
        value:
          "For 2026, buses left the Infantry School Parade Ground at 04:00. Private vehicles were not permitted to transport runners to the start; check the next edition’s transport instructions.",
        sourceUrl:
          "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
      },
      {
        label: "Minimum age in 2026",
        value: "20 for the full marathon.",
        sourceUrl:
          "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
      },
    ],
    media: [
      {
        label: "Nedbank Running Club’s 2026 Cango race report",
        url: "https://www.nedbankrunningclub.co.za/newsletter/Preview.aspx?newsid=41114",
        kind: "news",
      },
    ],
    resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5663",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-28",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5663",
        summary:
          "Nedbank Running Club reported a women’s marathon victory for Carla Spangenberg in 02:54:16, with Nerida Lubbe third in 02:59:18. The official FinishTime archive links to the full race results.",
        categories: [
          {
            category: "Women — reported winner",
            summary:
              "Nedbank Running Club reports that Carla Spangenberg won the women’s marathon in 02:54:16.",
            sourceUrl: "https://www.nedbankrunningclub.co.za/newsletter/Preview.aspx?newsid=41114",
          },
        ],
      },
      {
        year: 2025,
        date: "2025-03-01",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5055",
        summary:
          "The March 2025 edition has a dedicated full-marathon results archive at FinishTime. Open the marathon results for individual finishing positions and category details.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official latest race information",
        url: "https://topevents.co.za/event/infantry-school-cango-42-2km-21-1km-2026/",
      },
      {
        label: "Official 2026 race brochure",
        url: "https://www.topevents.co.za/wp-content/uploads/2025/09/Cango-42km-21km_2026.pdf",
      },
      {
        label: "Official Top Events registration service",
        url: "https://cango.topevents.co.za/",
      },
      {
        label: "World Athletics certified road-course list",
        url: "https://media.aws.iaaf.org/competitioninfo/037d770d-6a24-43e5-8826-66d8073c4a12.pdf",
      },
      {
        label: "Oudtshoorn tourism events — next date TBC",
        url: "https://www.oudtshoorn.com/events/",
      },
      {
        label: "2026 full-marathon results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5663",
      },
      {
        label: "2025 full-marathon results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5055",
      },
      {
        label: "Nedbank Running Club race report",
        url: "https://www.nedbankrunningclub.co.za/newsletter/Preview.aspx?newsid=41114",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
