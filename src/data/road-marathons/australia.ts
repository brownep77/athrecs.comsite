import type { RoadMarathon } from "./types";

export const AUSTRALIA_ROAD_MARATHONS: RoadMarathon[] = [
  {
    slug: "sydney-marathon",
    name: "TCS Sydney Marathon",
    country: "australia",
    city: "Sydney",
    region: "New South Wales",
    timeZone: "Australia/Sydney",
    officialUrl: "https://www.tcssydneymarathon.com/marathon",
    description:
      "Sydney’s road marathon crosses the Harbour Bridge on its way from North Sydney to a finish beside the Opera House. Centennial Park and the Royal Botanic Garden area feature along the route, with climbs and descents that deserve attention when planning your pace. The harbour supplies the scenery; you still have to supply the legs. Entry is through a ballot, with separate charity and official travel options. Check the final course map for your edition before settling on a race plan.",
    course: {
      summary:
        "North Sydney to the Opera House via the Harbour Bridge, Centennial Park and Mrs Macquarie's Chair; consult the organiser for the final edition's route.",
      surface: "Road",
      profile: "Undulating; the published 2026 route lists 313 m ascent and an 83 m net descent.",
      links: [
        {
          label: "Official course map and course videos",
          url: "https://www.tcssydneymarathon.com/marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Public ballot",
        description: "2027 ballot opens 29 September 2026; selection is required.",
        url: "https://www.tcssydneymarathon.com/marathon",
      },
      {
        name: "Charity and official travel places",
        description: "Separate entry channels have their own availability and requirements.",
        url: "https://www.tcssydneymarathon.com/marathon",
      },
    ],
    editions: [
      {
        date: "2027-08-29",
        sourceUrl: "https://www.tcssydneymarathon.com/marathon",
      },
    ],
    media: [
      {
        label: "2026 race report",
        url: "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
        kind: "news",
      },
      {
        label: "Official course flyover and runner-view preview",
        url: "https://www.tcssydneymarathon.com/marathon",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.tcssydneymarathon.com/past-results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-08-30",
        resultsUrl: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026",
        summary:
          "Three elite course records fell in 2026. The official results separate the marathon, wheelchair marathon, duo teams and Australian championships.",
        categories: [
          {
            category: "Men",
            summary: "Addisu Gobena won in 2:04:42.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Women",
            summary: "Peres Jepchirchir won in 2:18:31.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Men's wheelchair",
            summary: "Daniel Romanchuk won in 1:26:50.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Women's wheelchair",
            summary: "Manuela Schär won in 1:42:04.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Australian championship — men",
            summary: "Andy Buchanan took the national title in 2:10:14.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Australian championship — women",
            summary: "Ellie Pashley took the national title in 2:28:28.",
            sourceUrl:
              "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
          },
          {
            category: "Duo teams",
            summary: "Team Bergeman led the published team results in 3:22:19.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026",
          },
          {
            category: "Men 18-24",
            summary: "Published age-group leader: Addisu Gobena, 02:04:42 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 25-29",
            summary: "Published age-group leader: Tebello Ramakongoana, 02:04:57 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 30-34",
            summary: "Published age-group leader: Alphonce Simbu, 02:04:57 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 35-39",
            summary: "Published age-group leader: Dawit Wolde Arega, 02:06:41 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 40-44",
            summary: "Published age-group leader: Thomas Do Canto, 02:15:25 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 45-49",
            summary: "Published age-group leader: Michael Mbagu, 02:37:17 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 50-54",
            summary: "Published age-group leader: Wayne Spies, 02:34:30 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 55-59",
            summary: "Published age-group leader: Yusheng Ni, 02:44:02 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 60-64",
            summary: "Published age-group leader: Yuri Strofilov, 02:50:16 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 65-69",
            summary: "Published age-group leader: Joe Ouyang, 03:14:20 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 70-74",
            summary: "Published age-group leader: Terrence Diamond, 03:39:02 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 75-79",
            summary: "Published age-group leader: Mario Venturino, 03:41:57 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 80-84",
            summary: "Published age-group leader: John Battley, 05:35:14 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 85-89",
            summary: "Published age-group leader: Daniel Tou, 07:01:43 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 18-24",
            summary: "Published age-group leader: Mizuki Nishimura, 02:31:01 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 25-29",
            summary: "Published age-group leader: Haven Hailu Desse, 02:22:57 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 30-34",
            summary: "Published age-group leader: Peres Jepchirchir, 02:18:31 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 35-39",
            summary: "Published age-group leader: Ellie Pashley, 02:28:28 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 40-44",
            summary: "Published age-group leader: Kathryn Parkinson, 02:43:22 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 45-49",
            summary: "Published age-group leader: Priscah Cherono, 02:23:49 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 50-54",
            summary: "Published age-group leader: Jacqueline Kellerman, 02:54:19 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 55-59",
            summary: "Published age-group leader: Suzanne McMahon, 03:06:09 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 60-64",
            summary: "Published age-group leader: Maday Lines, 03:19:49 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 65-69",
            summary: "Published age-group leader: Donna Grocki, 03:39:41 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 70-74",
            summary: "Published age-group leader: Jennifer Kellett, 03:41:51 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 75-79",
            summary: "Published age-group leader: Donna Walker Cameron, 04:59:09 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 80-84",
            summary: "Published age-group leader: Georgina Little, 05:12:48 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 18-24",
            summary: "Published age-group leader: Jesse Mazur, 02:57:44 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 25-29",
            summary: "Published age-group leader: Thomas Lim, 02:55:48 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 30-34",
            summary: "Published age-group leader: Cal Calamia, 02:45:27 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 35-39",
            summary: "Published age-group leader: Nathalie Jaklewicz, 03:16:46 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 40-44",
            summary: "Published age-group leader: Lewis Chappell, 03:07:26 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 45-49",
            summary:
              "Published age-group leader: Alejandro Contreras Martinez, 03:26:38 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 50-54",
            summary: "Published age-group leader: Kristopher Damiano, 03:22:22 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 55-59",
            summary: "Published age-group leader: Kim Seng Lim, 03:58:39 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 60-64",
            summary: "Published age-group leader: Surend Bharath, 04:43:53 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Non-Binary 65-69",
            summary: "Published age-group leader: Rahman Haryanto, 05:13:56 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 18-24",
            summary: "Published age-group leader: Bryan Woo, 03:36:46 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 25-29",
            summary: "Published age-group leader: Michael O’Rourke, 03:11:33 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 30-34",
            summary: "Published age-group leader: Charis Dimaculangan, 03:12:46 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 35-39",
            summary: "Published age-group leader: Stacey Woodward, 02:55:21 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 40-44",
            summary: "Published age-group leader: Sarotin Chailark, 04:50:29 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 45-49",
            summary: "Published age-group leader: Brendan Williams, 05:01:23 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 55-59",
            summary: "Published age-group leader: Ram Maharjan, 05:17:54 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 70-74",
            summary: "Published age-group leader: Shinichi Hosokawa, 04:41:23 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race, entry and course information",
        url: "https://www.tcssydneymarathon.com/marathon",
      },
      {
        label: "Historical results archive",
        url: "https://www.tcssydneymarathon.com/past-results",
      },
      {
        label: "2026 official timing results",
        url: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026",
      },
      {
        label: "2026 organiser report",
        url: "https://www.tcssydneymarathon.com/post/three-records-fall-as-tcs-sydney-marathon-with-the-fastest-marathon-ever-run-on-australian-soil",
      },
      {
        label: "2026 official marathon category leaderboards",
        url: "https://www.multisportaustralia.com.au/races/sydney-marathon-2026/events/1/leaderboards",
      },
    ],
    fieldSize: {
      display: "About 36,300",
      basis: "Finishers",
      year: "2026",
      sourceUrl:
        "https://www.destinationnsw.com.au/newsroom/record-crowds-put-sydney-in-marathon-mode",
      note: "Rounded from 36,296 marathon finishers reported by Destination NSW for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "melbourne-marathon",
    name: "Nike Melbourne Marathon",
    country: "australia",
    city: "Melbourne",
    region: "Victoria",
    timeZone: "Australia/Melbourne",
    officialUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
    description:
      "The Melbourne Marathon finishes inside the Melbourne Cricket Ground, giving even a rather weary final kilometre a sense of occasion. Before that, the road course heads through St Kilda and the Albert Park area. The 2026 redesign reduces turns and removes the late Birdwood Avenue climb. General places for 2026 are exhausted; check the organiser’s guidance for remaining entry routes and qualifying applications. The festival runs across two days, so use the full marathon’s Sunday schedule when making plans.",
    course: {
      summary:
        "Starts on Batman Avenue and finishes inside the MCG, visiting St Kilda and Albert Park. The 2026 redesign changes direction on Beach Road.",
      surface: "Road with stadium finish",
      profile: "Generally flat; revised 2026 course removes the late Birdwood Avenue climb.",
      links: [
        {
          label: "Course map and cut-off policy",
          url: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Ballot and alternative entry pathways",
        description:
          "General allocation is exhausted for 2026; use the organiser's entry guidance for any remaining routes.",
        url: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
      {
        name: "Qualifying and elite applications",
        description:
          "Performance-based applications are subject to qualifying windows and availability.",
        url: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
    ],
    editions: [
      {
        date: "2026-10-11",
        sourceUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
    ],
    nextDateNote: "2027 marathon date has not been verified.",
    fieldSize: {
      display: "About 14,500",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://melbournemarathon.com.au/2025-nike-melbourne-marathon-results/",
      note: "Organiser-reported marathon finishers; excludes the other festival distances.",
    },
    practical: [
      {
        label: "2026 marathon start",
        value: "06:15 local time; minimum age 18.",
        sourceUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
      {
        label: "2026 course limit",
        value: "7 hours 45 minutes from the gun, with intermediate cut-offs.",
        sourceUrl: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
    ],
    media: [
      {
        label: "2025 organiser race report",
        url: "https://melbournemarathon.com.au/2025-nike-melbourne-marathon-results/",
        kind: "news",
      },
    ],
    resultsUrl: "https://melbournemarathon.com.au/past-results/",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-12",
        resultsUrl: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
        summary:
          "Jack Rayner and debutant Caitlin Adams won the full marathon; the festival also published separate wheelchair marathon results.",
        categories: [
          {
            category: "Men",
            summary: "Jack Rayner won in 2:15:02 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
          },
          {
            category: "Women",
            summary: "Caitlin Adams won in 2:30:26 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
          },
          {
            category: "Men's wheelchair",
            summary: "Ian Gainey led the published results in 3:24:52 gun time (3:24:49 net).",
            sourceUrl: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
          },
          {
            category: "Women's wheelchair",
            summary: "Sharnie Digby led the published results in 3:25:27 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official marathon information",
        url: "https://melbournemarathon.com.au/nike-melbourne-marathon/",
      },
      {
        label: "All-edition results archive",
        url: "https://melbournemarathon.com.au/past-results/",
      },
      {
        label: "2025 official timing results",
        url: "https://www.multisportaustralia.com.au/races/melbourne-marathon-2025",
      },
      {
        label: "2025 race report",
        url: "https://melbournemarathon.com.au/2025-nike-melbourne-marathon-results/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "canberra-marathon",
    name: "Canberra Marathon",
    country: "australia",
    city: "Canberra",
    region: "Australian Capital Territory",
    timeZone: "Australia/Sydney",
    officialUrl: "https://solemotive.com/pages/canberra-marathon-42k",
    description:
      "Canberra’s road marathon takes runners past Parliament House, along Anzac Parade and back beside Lake Burley Griffin. There is a climb towards the Australian War Memorial, with rolling sections elsewhere, so the lakeside setting tells only part of the story. Entry is direct through Sole Motive, with performance evidence needed for priority starts. The marathon is the Sunday race in a two-day festival; check its early start and intermediate road cut-offs when working out your expected finishing time.",
    course: {
      summary:
        "A Parliament House loop leads through Telopea Park, Anzac Parade, Barton and Weston Park before returning beside Lake Burley Griffin.",
      surface: "Road",
      profile: "Rolling city course with a climb on Anzac Parade.",
      links: [
        {
          label: "Official course and road cut-offs",
          url: "https://solemotive.com/pages/canberra-marathon-42k",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Online registration through Sole Motive; priority starts require performance evidence.",
        url: "https://solemotive.com/pages/canberra-marathon-42k",
      },
    ],
    editions: [
      {
        date: "2027-04-11",
        sourceUrl: "https://solemotive.com/pages/canberra-marathon",
      },
    ],
    practical: [
      {
        label: "2027 start",
        value: "06:15 local time; the start line closes at 06:40.",
        sourceUrl: "https://solemotive.com/pages/canberra-marathon-42k",
      },
      {
        label: "2027 finish deadline",
        value: "All marathon runners must finish by 14:00; intermediate road cut-offs apply.",
        sourceUrl: "https://solemotive.com/pages/canberra-marathon-42k",
      },
    ],
    media: [],
    resultsUrl: "https://solemotive.com/pages/canberra-marathon-results",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://solemotive.com/pages/canberra-marathon-results",
        summary:
          "The organiser provides a 2026 results link in its historical archive. Category results are available through the timing service; no category winners have been transcribed here.",
        categories: [],
      },
      {
        year: 2025,
        resultsUrl: "https://solemotive.com/pages/canberra-marathon-results",
        summary: "The 2025 edition has a separate results link in the organiser's archive.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official marathon and course",
        url: "https://solemotive.com/pages/canberra-marathon-42k",
      },
      {
        label: "Confirmed festival schedule",
        url: "https://solemotive.com/pages/canberra-marathon",
      },
      {
        label: "Historical results",
        url: "https://solemotive.com/pages/canberra-marathon-results",
      },
    ],
    fieldSize: {
      display: "About 2,400",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/canberra-2026",
      note: "Rounded from the 2,374 full-marathon finishers recorded by Ausrunning for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "brisbane-marathon",
    name: "Brisbane Marathon",
    country: "australia",
    city: "Brisbane",
    region: "Queensland",
    timeZone: "Australia/Brisbane",
    officialUrl: "https://www.brisbanemarathon.com.au/marathon",
    description:
      "The Brisbane Marathon follows city streets and paved riverside paths, crossing the Story Bridge before finishing in the City Botanic Gardens. Kangaroo Point and New Farm feature along the route, with bridge climbs adding work between the waterfront stretches. It is worth studying the elevation profile alongside the map. Entry is direct through the organiser, and the full marathon has its own early start. The results and photograph archives offer a useful look at previous editions.",
    course: {
      summary:
        "City streets, the Story Bridge and riverfront sections through Kangaroo Point and New Farm, finishing in the City Botanic Gardens.",
      surface: "Road and paved riverside paths",
      profile: "Includes bridge climbs; see the official course map for the elevation profile.",
      links: [
        {
          label: "Official marathon route information",
          url: "https://www.brisbanemarathon.com.au/marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Book the full marathon through the organiser's registration link, subject to availability.",
        url: "https://www.brisbanemarathon.com.au/marathon",
      },
    ],
    editions: [
      {
        date: "2027-06-06",
        sourceUrl: "https://www.brisbanemarathon.com.au/marathon",
      },
    ],
    practical: [
      {
        label: "2027 start",
        value: "06:00 local time.",
        sourceUrl: "https://www.brisbanemarathon.com.au/marathon",
      },
      {
        label: "2027 minimum age",
        value: "17 years.",
        sourceUrl: "https://www.brisbanemarathon.com.au/marathon",
      },
    ],
    media: [
      {
        label: "Official race photos, including previous editions",
        url: "https://www.brisbanemarathon.com.au/photos",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.brisbanemarathon.com.au/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-06-07",
        resultsUrl: "https://www.multisportaustralia.com.au/races/brisbane-marathon-festival-2026",
        summary:
          "The full-marathon results were led by Takaki Mori and Lucy Bartholomew. Shorter festival events have separate classifications.",
        categories: [
          {
            category: "Men",
            summary: "Takaki Mori won in 2:21:05, ahead of Kei Tsuboi and Yoshiki Nagano.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/brisbane-marathon-festival-2026",
          },
          {
            category: "Women",
            summary:
              "Lucy Bartholomew won in 2:47:06, ahead of Melanie Magarey and Haruki Ogasawara.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/brisbane-marathon-festival-2026",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official event and entry information",
        url: "https://www.brisbanemarathon.com.au/marathon",
      },
      {
        label: "Historical results",
        url: "https://www.brisbanemarathon.com.au/results",
      },
      {
        label: "2026 official results",
        url: "https://www.multisportaustralia.com.au/races/brisbane-marathon-festival-2026",
      },
      {
        label: "Official photo archive",
        url: "https://www.brisbanemarathon.com.au/photos",
      },
    ],
    fieldSize: {
      display: "About 2,600",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/brisbane-2026",
      note: "Rounded from the 2,565 full-marathon finishers recorded by Ausrunning for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "sunshine-coast-marathon",
    name: "EVA Air Sunshine Coast Marathon",
    country: "australia",
    city: "Alexandra Headland",
    region: "Queensland",
    timeZone: "Australia/Brisbane",
    officialUrl: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
    description:
      "The Sunshine Coast Marathon starts and finishes at Alexandra Headland, following a single loop through Twin Waters and Mudjimba. Roads and paved paths carry runners along a predominantly flat coastal route, although two crossings of the Sunshine Motorway Bridge interrupt the level running. The organiser’s course video is useful for getting those sections clear in your head. Follow the official entry releases and check the full marathon’s checkpoint deadlines; the festival’s shorter races have their own arrangements.",
    course: {
      summary:
        "Single loop from Alexandra Headland through Twin Waters and Mudjimba, crossing the Sunshine Motorway Bridge twice.",
      surface: "Road and paved paths",
      profile: "Predominantly flat, with bridge crossings.",
      links: [
        {
          label: "Official course information and video",
          url: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "Use the official registration or early-access links for the next marathon release.",
        url: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
    ],
    editions: [
      {
        date: "2027-08-01",
        sourceUrl: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
    ],
    practical: [
      {
        label: "Published marathon start",
        value: "06:00 local time; recommended arrival 05:00.",
        sourceUrl: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
      {
        label: "Published cut-off",
        value: "6 hours 20 minutes from the gun, with intermediate checkpoints.",
        sourceUrl: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
      {
        label: "Minimum age",
        value: "17 years.",
        sourceUrl: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
    ],
    media: [
      {
        label: "Official marathon course video",
        url: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
        kind: "video",
      },
      {
        label: "2026 race report from the host council",
        url: "https://www.sunshinecoast.qld.gov.au/news/record-16-500-runners-celebrate-15-years-of-sunshine-coast-marathon",
        kind: "news",
      },
    ],
    resultsUrl: "https://sunshinecoastmarathon.com.au/record-holders",
    pastEditions: [
      {
        year: 2026,
        resultsUrl:
          "https://www.multisportaustralia.com.au/races/sunshine-coast-marathon-festival-2026",
        summary:
          "Brett Robinson and Beth McKenzie led the marathon results. The official timing service separates the full distance from the other festival races.",
        categories: [
          {
            category: "Men",
            summary: "Brett Robinson won in 2:15:45.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sunshine-coast-marathon-festival-2026",
          },
          {
            category: "Women",
            summary: "Beth McKenzie won in 2:37:26.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/sunshine-coast-marathon-festival-2026",
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: "https://sunshinecoastmarathon.com.au/record-holders",
        summary:
          "The organiser records Ryan Gregson's 2:14:05 as the single-lap men's marathon course record, alongside separate wheelchair records.",
        categories: [
          {
            category: "Men",
            summary: "Ryan Gregson: 2:14:05, listed as the single-lap marathon course record.",
            sourceUrl: "https://sunshinecoastmarathon.com.au/record-holders",
          },
          {
            category: "Men's wheelchair",
            summary: "Geoff Trappett: 2:22:22, listed as the single-lap wheelchair course record.",
            sourceUrl: "https://sunshinecoastmarathon.com.au/record-holders",
          },
          {
            category: "Women's wheelchair",
            summary: "Sharnie Digby: 3:50:27, listed as the single-lap wheelchair course record.",
            sourceUrl: "https://sunshinecoastmarathon.com.au/record-holders",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official marathon, route and entry details",
        url: "https://sunshinecoastmarathon.com.au/event-info/marathon-42-195km",
      },
      {
        label: "Past results archive",
        url: "https://sunshinecoastmarathon.com.au/record-holders",
      },
      {
        label: "2026 official timing results",
        url: "https://www.multisportaustralia.com.au/races/sunshine-coast-marathon-festival-2026",
      },
    ],
    fieldSize: {
      display: "About 2,900",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/sunshine-coast-2026",
      note: "Rounded from the 2,924 full-marathon finishers recorded by Ausrunning for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "cairns-marathon",
    name: "Cairns Marathon",
    country: "australia",
    city: "Cairns",
    region: "Queensland",
    timeZone: "Australia/Brisbane",
    officialUrl: "https://www.cairnsmarathon.com.au/7news-marathon",
    description:
      "The Cairns Marathon is a flat, four-lap race on the Esplanade and nearby streets, with paved waterfront paths forming part of the route. Supporters get several chances to see you without taking on a marathon of their own. The early start puts the opening kilometres before dawn, and the organiser lists the course as AIMS certified and a Boston qualifier. Check the staged entry releases and select the individual marathon, as the festival also offers a relay and shorter races.",
    course: {
      summary: "Four laps on the Cairns Esplanade and surrounding streets.",
      surface: "Road and paved waterfront paths",
      profile: "Flat multi-lap course.",
      links: [
        {
          label: "Official marathon course and race information",
          url: "https://www.cairnsmarathon.com.au/7news-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry and early-access registration",
        description: "The organiser offers a 2027 waitlist and staged registration releases.",
        url: "https://www.cairnsmarathon.com.au/",
      },
    ],
    editions: [
      {
        date: "2027-07-11",
        sourceUrl: "https://www.cairnsmarathon.com.au/7news-marathon",
      },
    ],
    media: [
      {
        label: "2026 photographs and race-day links",
        url: "https://www.cairnsmarathon.com.au/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.cairnsmarathon.com.au/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-07-12",
        resultsUrl: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
        summary:
          "Shuji Tsukamoto led the men's marathon. The timing service also publishes women's and wheelchair results separately from the relay.",
        categories: [
          {
            category: "Men",
            summary: "Shuji Tsukamoto won in 2:26:41 net time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
          },
          {
            category: "Women",
            summary:
              "The winner, listed as 夏楠 沼田 in the official timer, finished in 2:46:26 net time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
          },
          {
            category: "Men's wheelchair",
            summary: "Geoff Trappett led the published classification in 2:27:55 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
          },
          {
            category: "Women's wheelchair",
            summary: "Sharnie Digby led the published classification in 3:01:22 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official marathon route and date",
        url: "https://www.cairnsmarathon.com.au/7news-marathon",
      },
      {
        label: "Entry and race-day media",
        url: "https://www.cairnsmarathon.com.au/",
      },
      {
        label: "Results archive",
        url: "https://www.cairnsmarathon.com.au/results",
      },
      {
        label: "2026 official timing results",
        url: "https://www.multisportaustralia.com.au/races/cairns-marathon-festival-2026",
      },
    ],
    fieldSize: {
      display: "About 600",
      basis: "Entrants",
      year: "2025",
      sourceUrl:
        "https://www.cairns.qld.gov.au/__data/assets/pdf_file/0004/704056/Clause-No.-6.1.pdf",
      note: "Rounded from 612 full-marathon registrations reported by Cairns Regional Council for 2025.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "townsville-marathon",
    name: "Townsville Airport Marathon",
    country: "australia",
    city: "Townsville",
    region: "Queensland",
    timeZone: "Australia/Brisbane",
    officialUrl: "https://www.townsvillerunningfestival.com/townsville-marathon",
    description:
      "Townsville’s road marathon starts at Jezzine Barracks, takes two city loops past the marina and The Strand, then adds a longer section towards Pallarenda. Views towards Magnetic Island accompany a flat route on roads and paved coastal paths. Some sections share space with controlled traffic, making the race briefing worth a careful read. Entry is through the organiser when the next edition opens. A 2027 date is still to be confirmed here, so check before arranging travel.",
    course: {
      summary:
        "Two approximately 10.5 km city loops plus a 21.1 km Pallarenda loop; Jezzine Barracks start and finish.",
      surface: "Road and paved coastal paths",
      profile: "Flat three-loop course.",
      links: [
        {
          label: "Official marathon route",
          url: "https://www.townsvillerunningfestival.com/townsville-marathon",
        },
        {
          label: "Traffic and race-day guidance",
          url: "https://www.townsvillerunningfestival.com/race-info",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description: "Use the organiser's registration link when the next edition opens.",
        url: "https://www.townsvillerunningfestival.com/townsville-marathon",
      },
    ],
    editions: [],
    nextDateNote: "The 2027 marathon date has not yet been verified.",
    media: [],
    resultsUrl: "https://www.townsvillerunningfestival.com/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-08-02",
        resultsUrl: "https://www.townsvillerunningfestival.com/results",
        summary:
          "The 2026 festival took place on 2 August, with the full marathon following the certified coastal course from Jezzine Barracks.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official marathon course",
        url: "https://www.townsvillerunningfestival.com/townsville-marathon",
      },
      {
        label: "2026 race information",
        url: "https://www.townsvillerunningfestival.com/race-info",
      },
      {
        label: "Official results gateway",
        url: "https://www.townsvillerunningfestival.com/results",
      },
    ],
    fieldSize: {
      display: "About 270",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/townsville-2026",
      note: "Rounded from the 271 full-marathon finishers recorded by Ausrunning for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "newcastle-marathon-australia",
    name: "Henderson Newcastle Marathon",
    country: "australia",
    city: "Newcastle",
    region: "New South Wales",
    timeZone: "Australia/Sydney",
    officialUrl: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
    description:
      "Newcastle’s Australian road marathon follows the harbour and coast through Honeysuckle, Nobbys Beach and Newcastle Beach. The organiser describes a flat, AIMS-accredited course, but changes are planned for 2027: works around The Station mean the start and finish are moving towards Foreshore Park. Use the final race instructions when planning transport and pacing. Entry is direct, and the published six-hour limit is tied to reopening the roads, subject to the next edition’s final arrangements.",
    course: {
      summary:
        "Coastal and harbour route through Honeysuckle, Nobbys Beach and Newcastle Beach. Changes are planned for 2027.",
      surface: "Road and paved waterfront paths",
      profile: "Described by the organiser as flat; final 2027 course subject to change.",
      links: [
        {
          label: "Official route and event updates",
          url: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct entry",
        description:
          "The organiser links registration and detailed race information; 2027 early-bird entry opened 1 July 2026.",
        url: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
      },
    ],
    editions: [
      {
        date: "2027-04-18",
        sourceUrl: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
      },
    ],
    practical: [
      {
        label: "Full-marathon time limit",
        value: "6 hours, subject to the final edition's instructions.",
        sourceUrl: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
      },
    ],
    media: [
      {
        label: "2025 highlights video",
        url: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.sportsplits.com/races/henderson-newcastle-marathon-2026",
    pastEditions: [
      {
        year: 2026,
        date: "2026-04-19",
        resultsUrl: "https://www.sportsplits.com/races/henderson-newcastle-marathon-2026",
        summary:
          "Nick Watson and Avery DePiero won the 2026 full marathon. The official timing page separates the marathon from the half marathon.",
        categories: [
          {
            category: "Men",
            summary: "Nick Watson 2:33:32; Vladimir Shatrov 2:33:35; Nick Cain 2:38:49. Gun times.",
            sourceUrl: "https://www.sportsplits.com/races/henderson-newcastle-marathon-2026",
          },
          {
            category: "Women",
            summary:
              "Avery DePiero 2:51:06; Steph Auston 2:58:29; Laura Hemmings 2:59:40. Gun times.",
            sourceUrl: "https://www.sportsplits.com/races/henderson-newcastle-marathon-2026",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official event, course, registration and media",
        url: "https://hevents.com.au/events/henderson-newcastle-marathon?of=1",
      },
      {
        label: "Official timing gateway linked by the organiser",
        url: "https://www.multisportaustralia.com.au/",
      },
      {
        label: "2026 official results",
        url: "https://www.sportsplits.com/races/henderson-newcastle-marathon-2026",
      },
    ],
    fieldSize: {
      display: "About 850",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/newcastle-2026",
      note: "Rounded from the 837 full-marathon finishers recorded by Ausrunning for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "hobart-marathon",
    name: "Hobart Marathon",
    country: "australia",
    city: "Hobart",
    region: "Tasmania",
    timeZone: "Australia/Hobart",
    officialUrl: "https://www.hobartmarathon.com.au/fullmarathon",
    description:
      "The Hobart Marathon follows the River Derwent waterfront, passing Salamanca Place and the Royal Tasmanian Botanical Gardens on a course of repeated loops. Roads and paved paths keep runners close to the city, while the rolling hills require some restraint with the early pace. Supporters should find the repeated passes useful. Entry is online with staged pricing; the 2027 race has a 6 am start and a minimum age of 17. Its detailed route map is still to follow.",
    course: {
      summary:
        "Multiple laps around Hobart's waterfront, Salamanca Place, the River Derwent and Royal Tasmanian Botanical Gardens. The full 2027 map is pending.",
      surface: "Road and paved waterfront paths",
      profile: "Undulating; the organiser describes rolling hills.",
      links: [
        {
          label: "Marathon route and race information",
          url: "https://www.hobartmarathon.com.au/fullmarathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "Enter through the organiser's registration link; prices are released in stages.",
        url: "https://www.hobartmarathon.com.au/fullmarathon",
      },
    ],
    editions: [
      {
        date: "2027-04-04",
        sourceUrl: "https://www.hobartmarathon.com.au/fullmarathon",
      },
    ],
    practical: [
      {
        label: "2027 start time",
        value: "06:00 local time",
        sourceUrl: "https://www.hobartmarathon.com.au/fullmarathon",
      },
      {
        label: "2027 minimum age",
        value: "17 on race day",
        sourceUrl: "https://www.hobartmarathon.com.au/fullmarathon",
      },
    ],
    media: [
      {
        label: "Official results and race photos",
        url: "https://www.hobartmarathon.com.au/resultsphotos",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.hobartmarathon.com.au/resultsphotos",
    pastEditions: [
      {
        year: 2026,
        date: "2026-04-12",
        resultsUrl: "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026",
        summary:
          "Dillon Goss and Petra Melis-Walsh headed the 2026 marathon results. The official timer includes gender and age-category filters.",
        categories: [
          {
            category: "Men",
            summary:
              "Dillon Goss won in 2:27:25, ahead of Harrison Bickers (2:37:39) and Thomas Barnett (2:39:28).",
            sourceUrl: "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026",
          },
          {
            category: "Women",
            summary:
              "Petra Melis-Walsh won in 2:47:40; Haruki Ogasawara ran 3:06:21 and Chloe Wood 3:12:31.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026",
          },
          {
            category: "Men 17-24",
            summary: "Published age-group leader: Joshua Grima, 03:25:28 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 25-29",
            summary: "Published age-group leader: Jacob Synnott, 03:29:13 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 30-34",
            summary: "Published age-group leader: Thomas Barnett, 02:39:28 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 35-39",
            summary: "Published age-group leader: Ray Holmes, 02:52:22 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 40-44",
            summary: "Published age-group leader: Christopher Worland, 02:57:48 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 45-49",
            summary: "Published age-group leader: Andrew Squire, 03:26:19 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 50-54",
            summary: "Published age-group leader: Edward Rice, 03:13:15 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 55-59",
            summary: "Published age-group leader: Eugene Zaid, 03:28:01 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 60-64",
            summary: "Published age-group leader: Rich Reed, 04:12:26 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 65-69",
            summary: "Published age-group leader: Tim Hughes, 05:32:19 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Men 75-79",
            summary: "Published age-group leader: Martin Harrap, 06:18:25 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 17-24",
            summary: "Published age-group leader: Chloe Millar, 03:59:59 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 25-29",
            summary: "Published age-group leader: Janna Lawson, 03:35:15 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 30-34",
            summary: "Published age-group leader: Summer Robinson, 03:59:51 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 35-39",
            summary: "Published age-group leader: Petra Melis-Walsh, 02:47:40 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 40-44",
            summary: "Published age-group leader: Melanie Nicolson, 03:58:48 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 45-49",
            summary: "Published age-group leader: Evnike Yardley, 03:57:09 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 50-54",
            summary: "Published age-group leader: Heike Godwin, 03:30:46 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 55-59",
            summary: "Published age-group leader: Elaine Reyes, 05:18:14 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 60-64",
            summary: "Published age-group leader: Susan Moodie, 04:04:29 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
          {
            category: "Women 70-74",
            summary: "Published age-group leader: Judith Clarke, 05:42:39 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: "https://www.hobartmarathon.com.au/resultsphotos",
        summary:
          "The organiser records Milly Clark's 2:40:40 as its 2025 women's marathon course record.",
        categories: [
          {
            category: "Women",
            summary: "Milly Clark:2:40:40, listed by the organiser as the women's course record.",
            sourceUrl: "https://www.hobartmarathon.com.au/resultsphotos",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Organiser marathon information",
        url: "https://www.hobartmarathon.com.au/fullmarathon",
      },
      {
        label: "Official archive",
        url: "https://www.hobartmarathon.com.au/resultsphotos",
      },
      {
        label: "2026 official timer",
        url: "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026",
      },
      {
        label: "2026 official marathon category leaderboards",
        url: "https://www.multisportaustralia.com.au/races/hobart-marathon-festival-2026/events/1/leaderboards",
      },
    ],
    fieldSize: {
      display: "About 700",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/146468",
      note: "Rounded from the 681 full-marathon finishers recorded by MarathonView for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "ballarat-marathon",
    name: "Ballarat Marathon",
    country: "australia",
    city: "Ballarat",
    region: "Victoria",
    timeZone: "Australia/Melbourne",
    officialUrl: "https://www.ballaratmarathon.com.au/marathon",
    description:
      "The Ballarat Marathon runs two laps of Steve Moneghetti’s course through the Victorian city, starting and finishing outside the Town Hall on Sturt Street. The Lake Wendouree area adds another feature to the road circuit. Online entry and a separate elite programme are available, with a six-hour chip-time limit for 2027. Collect your bib before the expo closes on Saturday. Discovering that Sunday collection is unavailable would be an unnecessarily energetic start to the morning.",
    course: {
      summary:
        "Two laps of the Steve Moneghetti-designed circuit from Ballarat Town Hall, using Sturt Street and the Lake Wendouree area.",
      surface: "Road",
      profile: "A repeated city-road circuit; check the official course map for elevation.",
      links: [
        {
          label: "Marathon course and 2027 map",
          url: "https://www.ballaratmarathon.com.au/marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description: "Register via the official Race Roster link, with tiered pricing.",
        url: "https://www.ballaratmarathon.com.au/marathon",
      },
      {
        name: "Elite athlete application",
        description:
          "The organiser provides a separate elite programme and preferred-start information.",
        url: "https://www.ballaratmarathon.com.au/marathon",
      },
    ],
    editions: [
      {
        date: "2027-04-18",
        sourceUrl: "https://www.ballaratmarathon.com.au/schedule",
      },
    ],
    practical: [
      {
        label: "2027 start time",
        value: "08:00 local time",
        sourceUrl: "https://www.ballaratmarathon.com.au/marathon",
      },
      {
        label: "2027 time limit",
        value: "6 hours from the runner's chip-time start",
        sourceUrl: "https://www.ballaratmarathon.com.au/marathon",
      },
      {
        label: "2027 bib collection",
        value: "Collect before the expo closes on Saturday; no Sunday morning collection.",
        sourceUrl: "https://www.ballaratmarathon.com.au/schedule",
      },
    ],
    media: [
      {
        label: "Official 2026 race films",
        url: "https://www.ballaratmarathon.com.au/",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
        summary: "The third edition's marathon winners were Caden Shields and Ellie Pashley.",
        categories: [
          {
            category: "Men",
            summary: "Caden Shields won in 2:18:07.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
          {
            category: "Women",
            summary: "Ellie Pashley won in 2:30:47.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
        summary: "Reece Edwards and Kate Mason won the 2025 full marathon.",
        categories: [
          {
            category: "Men",
            summary: "Reece Edwards won in 2:16:56.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
          {
            category: "Women",
            summary: "Kate Mason won in 2:33:55.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
        ],
      },
      {
        year: 2024,
        resultsUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
        summary: "Thomas Do Canto and Ella McCartney won the inaugural edition.",
        categories: [
          {
            category: "Men",
            summary: "Thomas Do Canto won in 2:17:04.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
          {
            category: "Women",
            summary: "Ella McCartney won in 2:40:55.",
            sourceUrl: "https://www.ballaratmarathon.com.au/results-winners-and-records",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Marathon course and entry",
        url: "https://www.ballaratmarathon.com.au/marathon",
      },
      {
        label: "2027 schedule",
        url: "https://www.ballaratmarathon.com.au/schedule",
      },
      {
        label: "All-edition winners and results",
        url: "https://www.ballaratmarathon.com.au/results-winners-and-records",
      },
    ],
    fieldSize: {
      display: "About 2,500",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/ballarat-2026",
      note: "Ausrunning reports 2,473 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "perth-running-festival-marathon",
    name: "Perth Running Festival Marathon",
    country: "australia",
    city: "Perth",
    region: "Western Australia",
    timeZone: "Australia/Perth",
    officialUrl: "https://perthrunningfestival.com.au/marathon/",
    description:
      "The Perth Running Festival marathon follows a flat course around Burswood Park and the Swan River before finishing inside Optus Stadium. That stadium finish is a good reason to keep something in reserve. The 2026 marathon starts at 6 am and has a seven-hour limit. General entries have sold out, with an official waiting list available. Plan your journey using the organiser’s transport guidance: parking nearby is limited. A 2027 marathon date is still to be confirmed here.",
    course: {
      summary:
        "A flat route around Burswood Park and the Swan River with a finish inside Optus Stadium.",
      surface: "Road",
      profile: "Flat",
      links: [
        {
          label: "Official marathon map",
          url: "https://perthrunningfestival.com.au/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Waiting list",
        description:
          "The 2026 event is sold out; join the waiting list through the official registration link.",
        url: "https://perthrunningfestival.com.au/",
      },
    ],
    editions: [
      {
        date: "2026-10-11",
        sourceUrl: "https://perthrunningfestival.com.au/marathon/",
      },
    ],
    nextDateNote: "A 2027 marathon date has not been verified.",
    practical: [
      {
        label: "2026 start time",
        value: "06:00 local time at Optus Stadium",
        sourceUrl: "https://perthrunningfestival.com.au/race-day/",
      },
      {
        label: "2026 time limit",
        value: "7 hours",
        sourceUrl: "https://perthrunningfestival.com.au/marathon/",
      },
      {
        label: "2026 travel",
        value: "Organiser recommends free event public transport; parking is limited.",
        sourceUrl: "https://perthrunningfestival.com.au/race-day/",
      },
    ],
    media: [
      {
        label: "Official 2024 and 2025 live broadcasts",
        url: "https://perthrunningfestival.com.au/",
        kind: "video",
      },
    ],
    resultsUrl: "https://bluechipresults.com.au/",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-12",
        resultsUrl: "https://bluechipresults.com.au/",
        summary:
          "The 2025 festival took place on 12 October, with runners finishing inside Optus Stadium.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Marathon information",
        url: "https://perthrunningfestival.com.au/marathon/",
      },
      {
        label: "Entry status and official video",
        url: "https://perthrunningfestival.com.au/",
      },
      {
        label: "Race-day travel and schedule",
        url: "https://perthrunningfestival.com.au/race-day/",
      },
    ],
    fieldSize: {
      display: "About 3,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://ausrunning.net/marathon/perth-2025",
      note: "Ausrunning reports 3,019 full-marathon finishers in 2025.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "adelaide-marathon",
    name: "Adelaide Marathon",
    country: "australia",
    city: "Adelaide",
    region: "South Australia",
    timeZone: "Australia/Adelaide",
    officialUrl: "https://adelaidemarathon.com.au/marathon/",
    description:
      "The Adelaide Marathon takes runners from the Adelaide Oval precinct through North Adelaide and the city parklands on a flat road course. Organised by the South Australian Road Runners Club, it offers route maps and GPX files for anyone who likes to know where the turns are coming. The 2026 race had a six-hour limit and a minimum age of 18. Entry for the next edition will be through the organiser; check for a confirmed 2027 date before booking travel.",
    course: {
      summary:
        "City and parkland circuit from the Adelaide Oval precinct, through North Adelaide and around the city parklands. Consult the published map for turns and lap arrangements.",
      surface: "Road",
      profile: "Flat",
      links: [
        {
          label: "Official course map and GPX",
          url: "https://adelaidemarathon.com.au/courses/",
        },
        {
          label: "2026 event guide and marathon map",
          url: "https://adelaidemarathon.com.au/wp-content/uploads/2026/04/2026-AMF-Event-Guide.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "SARRC registration",
        description: "Use the marathon website's registration link when the next edition opens.",
        url: "https://adelaidemarathon.com.au/marathon/",
      },
    ],
    editions: [],
    nextDateNote: "The 2026 race was held on 3 May. A 2027 date has not been verified.",
    practical: [],
    media: [],
    resultsUrl: "https://adelaidemarathon.com.au/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-03",
        resultsUrl: "https://adelaidemarathon.com.au/results/",
        summary:
          "The 2026 full marathon was held on 3 May on the organiser's certified course. The official archive connects to the South Australian Road Runners Club results.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Marathon details",
        url: "https://adelaidemarathon.com.au/marathon/",
      },
      {
        label: "Course map",
        url: "https://adelaidemarathon.com.au/courses/",
      },
      {
        label: "All-edition results gateway",
        url: "https://adelaidemarathon.com.au/results/",
      },
      {
        label: "2026 organiser event guide",
        url: "https://adelaidemarathon.com.au/wp-content/uploads/2026/04/2026-AMF-Event-Guide.pdf",
      },
    ],
    fieldSize: {
      display: "About 800",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/adelaide-2026",
      note: "Ausrunning reports 819 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "barossa-marathon",
    name: "Barossa Marathon",
    country: "australia",
    city: "Tanunda",
    region: "South Australia",
    timeZone: "Australia/Adelaide",
    officialUrl: "https://barossamarathon.com.au/event-information/marathon/",
    description:
      "The Barossa Marathon is based in Tanunda, taking runners through South Australia’s wine country on roads and a sealed shared path. The generally flat to gently rolling course uses a 1.4 km section of the Barossa Rail Trail twice. The vineyards provide a pleasant distraction from the arithmetic of kilometres remaining. Entry is through the South Australian Road Runners Club when the next edition opens. A 2027 date is still to be confirmed here; the organiser publishes course maps and GPX downloads.",
    course: {
      summary:
        "Barossa Valley roads with a 1.4 kmsealed rail-trail section between Light Pass Road and Research Road, used twice in the full marathon.",
      surface: "Road and sealed shared-use path",
      profile: "Generally flat to gently rolling",
      links: [
        {
          label: "Official course map and GPX",
          url: "https://barossamarathon.com.au/event-information/course-map/",
        },
      ],
    },
    entryMethods: [
      {
        name: "SARRC online entry",
        description: "Enter through the organiser's registration link when the next edition opens.",
        url: "https://barossamarathon.com.au/event-information/marathon/",
      },
    ],
    editions: [],
    nextDateNote: "The 2026 race was held on 23 August. A 2027 date has not been verified.",
    fieldSize: {
      display: "About 550 marathon runners",
      basis: "Reported runners",
      year: "2026",
      sourceUrl:
        "https://www.railtrails.org.au/news/barossa-rail-trail-shines-during-barossa-marathon/",
      note: "Rail Trails Australia reported 554 full-marathon competitors in 2026.",
    },
    practical: [],
    media: [
      {
        label: "2026 race report and course photograph",
        url: "https://www.railtrails.org.au/news/barossa-rail-trail-shines-during-barossa-marathon/",
        kind: "news",
      },
    ],
    resultsUrl: "https://barossamarathon.com.au/event-information/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-08-23",
        resultsUrl: "https://barossamarathon.com.au/event-information/results/",
        summary:
          "Rail Trails Australia reported 554 full-marathon competitors and good weather. The organiser links 2026 timing results alongside earlier editions.",
        categories: [],
      },
      {
        year: 2024,
        resultsUrl: "https://barossamarathon.com.au/event-information/results/",
        summary:
          "The organiser credits Ryan Waddington with a 2:28:08 marathon performance in 2024, listed on its records page.",
        categories: [
          {
            category: "Men",
            summary: "Ryan Waddington's 2:28:08 is listed as the men's marathon course record.",
            sourceUrl: "https://barossamarathon.com.au/event-information/results/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official marathon",
        url: "https://barossamarathon.com.au/event-information/marathon/",
      },
      {
        label: "Official results archive",
        url: "https://barossamarathon.com.au/event-information/results/",
      },
      {
        label: "2026 participation and route report",
        url: "https://www.railtrails.org.au/news/barossa-rail-trail-shines-during-barossa-marathon/",
      },
      {
        label: "Surface confirmation",
        url: "https://www.railtrails.org.au/trails/the-barossa-trail/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "orange-running-festival-marathon",
    name: "Orange Running Festival Marathon",
    country: "australia",
    city: "Orange",
    region: "New South Wales",
    timeZone: "Australia/Sydney",
    officialUrl: "https://orangerunningfestival.com.au/marathon/",
    description:
      "Orange’s road marathon heads into the New South Wales countryside from Gosling Creek Reserve, using sealed paths and roads through Orchard Road, Forest Reefs Road and Spring Terrace Road. The gently undulating route offers a regional setting for the full distance, with the reserve serving as both start and finish. Entry is online through the festival website. The 2027 festival date is announced, but detailed marathon instructions still refer to 2026, so check the final edition’s course and arrangements.",
    course: {
      summary:
        "Gosling Creek Reserve to Forest Road, with Orchard Road, Forest Reefs Road and Spring Terrace Road loops, then back to the reserve.",
      surface: "Bitumen roads and sealed reserve paths",
      profile: "Gently undulating",
      links: [
        {
          label: "Official course map and elevation",
          url: "https://orangerunningfestival.com.au/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "Use the organiser's entry link and check the edition shown; the detailed marathon instructions still refer to 2026.",
        url: "https://orangerunningfestival.com.au/",
      },
    ],
    editions: [
      {
        date: "2027-03-07",
        sourceUrl: "https://orangerunningfestival.com.au/",
      },
    ],
    practical: [],
    media: [
      {
        label: "Official 2026 and earlier photo galleries",
        url: "https://orangerunningfestival.com.au/photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://orangerunningfestival.com.au/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-15",
        resultsUrl: "https://orangerunningfestival.com.au/results/",
        summary:
          "The 2026 marathon started at Gosling Creek Reserve on 15 March and followed sealed rural roads and paths.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "2027 date announcement",
        url: "https://orangerunningfestival.com.au/",
      },
      {
        label: "Course and surface",
        url: "https://orangerunningfestival.com.au/marathon/",
      },
      {
        label: "Results archive",
        url: "https://orangerunningfestival.com.au/results/",
      },
      {
        label: "Photo archive",
        url: "https://orangerunningfestival.com.au/photos/",
      },
    ],
    fieldSize: {
      display: "About 120",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/147081",
      note: "MarathonView records 123 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "gold-coast-marathon",
    name: "ASICS Gold Coast Marathon",
    country: "australia",
    city: "Gold Coast",
    region: "Queensland",
    timeZone: "Australia/Brisbane",
    officialUrl: "https://goldcoastmarathon.com.au/races/marathon/",
    description:
      "The Gold Coast Marathon follows the Pacific coastline and Broadwater on a flat road course from Southport. Runners head south through Surfers Paradise and Broadbeach to Miami, then return north for the later stages. It is a course that invites a time target, although the watch still expects you to do the work. The 2027 marathon is confirmed for 4 July. Entries open in early December 2026, with the organiser still to announce the detailed entry routes.",
    course: {
      summary:
        "Coastal out-and-back road course from Southport, south through Surfers Paradise and Broadbeach to Miami, then north beside the Broadwater.",
      surface: "Road",
      profile: "Flat coastal course; the published 2025 route had 62 mof ascent.",
      links: [
        {
          label: "Official marathon course information",
          url: "https://goldcoastmarathon.com.au/races/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "2027 entry release",
        description:
          "Entries open in early December 2026. The organiser will announce the 2027 entry pathways.",
        url: "https://goldcoastmarathon.com.au/enter/",
      },
    ],
    editions: [
      {
        date: "2027-07-04",
        sourceUrl: "https://goldcoastmarathon.com.au/races/marathon/",
      },
    ],
    fieldSize: {
      display: "About 15,000 marathon entrants",
      basis: "Entrants",
      year: "2025",
      sourceUrl: "https://aims-worldrunning.org/articles/2589-flat-fast-and-scenic.html",
      note: "AIMS announced a sold-out marathon field of 15,000 for 2025.",
    },
    practical: [],
    media: [
      {
        label: "Official 2026 post-event report",
        url: "https://goldcoastmarathon.com.au/2026/08/18/asics-gold-coast-marathon-sets-a-new-benchmark-as-visitation-and-economic-impact-records-skyrocket/",
        kind: "news",
      },
    ],
    resultsUrl: "https://goldcoastmarathon.com.au/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
        summary:
          "Haftu Strintzos and Almaz Kebebe led the 2026 running marathon, while Kota Hokinoue and Madison de Rozario won the wheelchair classifications.",
        categories: [
          {
            category: "Men",
            summary:
              "Haftu Strintzos 2:06:20; Hidekazu Hijikata 2:07:20; Jinya Ozaki 2:07:48. Gun times.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
          },
          {
            category: "Women",
            summary:
              "Almaz Kebebe 2:24:53; Antonina Kwambai 2:25:41; Kaede Kawamura 2:28:00. Gun times.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
          },
          {
            category: "Men's wheelchair",
            summary: "Kota Hokinoue won in 1:39:02 gun time.",
            sourceUrl: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
          },
          {
            category: "Women's wheelchair",
            summary: "Madison de Rozario won in 1:57:05 gun time (1:57:03 net).",
            sourceUrl: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
          },
          {
            category: "Men 18-24",
            summary: "Published age-group leader: Jinya Ozaki, 02:07:48 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 25-29",
            summary: "Published age-group leader: Haftu Strintzos, 02:06:20 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 30-34",
            summary: "Published age-group leader: Ryoma Takeuchi, 02:08:20 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 35-39",
            summary: "Published age-group leader: Ilham Tanui Ozbilen, 02:13:09 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 40-44",
            summary: "Published age-group leader: Benjamin Williams, 02:34:42 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 45-49",
            summary: "Published age-group leader: Tom Brimelow, 02:29:12 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 50-54",
            summary: "Published age-group leader: Duncan Marsden, 02:40:16 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 55-59",
            summary: "Published age-group leader: Daniel Coates, 02:41:53 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 60-64",
            summary: "Published age-group leader: Neil Bath, 03:04:45 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 65-69",
            summary: "Published age-group leader: Kyle Davis, 03:30:27 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 70-74",
            summary: "Published age-group leader: David McEwan, 03:22:32 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 75-79",
            summary: "Published age-group leader: Vin Gasper, 03:53:31 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Men 80-84",
            summary: "Published age-group leader: Michael Byrne, 05:32:14 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 18-24",
            summary: "Published age-group leader: Almaz Kebebe, 02:24:53 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 25-29",
            summary: "Published age-group leader: Kaede Kawamura, 02:28:00 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 30-34",
            summary: "Published age-group leader: Antonina Kwambai, 02:25:41 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 35-39",
            summary: "Published age-group leader: Abigail Nordberg, 02:30:22 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 40-44",
            summary: "Published age-group leader: Bronwyn Hager, 02:49:45 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 45-49",
            summary: "Published age-group leader: Shiloh Watts, 02:51:53 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 50-54",
            summary: "Published age-group leader: Elizabeth King, 02:59:07 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 55-59",
            summary: "Published age-group leader: Kyoko Miura, 03:06:10 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 60-64",
            summary: "Published age-group leader: Gill Fullen, 03:07:38 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 65-69",
            summary: "Published age-group leader: Christina Kluth, 03:35:47 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 70-74",
            summary: "Published age-group leader: Jennifer Kellett, 03:47:08 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 75-79",
            summary: "Published age-group leader: Deanna Cottrell, 04:33:45 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Women 80-84",
            summary: "Published age-group leader: Anne Elizabeth Boyd, 06:41:25 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 18-24",
            summary: "Published age-group leader: Jordan Trevena, 02:37:02 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 30-34",
            summary: "Published age-group leader: Emma Haege, 02:58:00 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 35-39",
            summary: "Published age-group leader: Joshua Foo, 02:51:57 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 40-44",
            summary: "Published age-group leader: Jacob Halbert, 03:35:18 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
          {
            category: "Not Disclosed 45-49",
            summary: "Published age-group leader: Jensen Mak, 03:47:03 net/finish time.",
            sourceUrl:
              "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
          },
        ],
      },
    ],
    sources: [
      {
        label: "2027 marathon date",
        url: "https://goldcoastmarathon.com.au/races/marathon/",
      },
      {
        label: "Entry announcements",
        url: "https://goldcoastmarathon.com.au/enter/",
      },
      {
        label: "AIMS course and field preview",
        url: "https://aims-worldrunning.org/articles/2589-flat-fast-and-scenic.html",
      },
      {
        label: "Historical results",
        url: "https://goldcoastmarathon.com.au/results/",
      },
      {
        label: "2026 official results",
        url: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/",
      },
      {
        label: "2026 official marathon category leaderboards",
        url: "https://www.multisportaustralia.com.au/races/gold-coast-marathon-2026/events/1/leaderboards",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "busselton-bay-run-marathon",
    name: "Busselton Bay Run Marathon",
    country: "australia",
    city: "Busselton",
    region: "Western Australia",
    timeZone: "Australia/Perth",
    officialUrl: "https://www.busseltonrunnersclub.org.au/brc-bay-run",
    description:
      "Busselton’s Bay Run marathon follows Geographe Bay Road and the paved coastal shared path towards Quindalup before returning to town. The out-and-back route gives the bay plenty of time to make an impression, but the 4 hour 30 minute cut-off deserves attention before entering. This is a race to assess against your current marathon pace. Busselton Runners Club confirms 13 February for the 2027 event, with tickets on sale from 1 November 2026 and course information available through its website.",
    course: {
      summary:
        "Geographe Bay Road start and coastal shared path out towards the Quindalup Boat Ramp before returning to Busselton.",
      surface: "Road and paved coastal shared path",
      profile: "Coastal out-and-back with several turnarounds.",
      links: [
        {
          label: "Official course maps and briefing video",
          url: "https://www.busseltonrunnersclub.org.au/brc-bay-run/course-information",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online ticket release",
        description: "2027 tickets go on sale on 1 November 2026.",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run",
      },
    ],
    editions: [
      {
        date: "2027-02-13",
        sourceUrl: "https://www.busseltonrunnersclub.org.au/brc-bay-run",
      },
    ],
    practical: [
      {
        label: "Published marathon time limit",
        value: "4 hours 30 minutes",
        sourceUrl: "https://www.busseltonrunnersclub.org.au/brc-bay-run",
      },
    ],
    media: [
      {
        label: "Race photos from 2026 and earlier editions",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run/results-photos",
        kind: "photos",
      },
      {
        label: "Marathon course briefing video",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run/course-information",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.busseltonrunnersclub.org.au/brc-bay-run/results-photos",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-07",
        resultsUrl: "https://my.raceresult.com/379671/results",
        summary:
          "The 2026 Bay Run took place on 7 February. The club's archive links its official timing results and event photography.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "2027 date and entry release",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run",
      },
      {
        label: "Course information",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run/course-information",
      },
      {
        label: "Results and photo archive",
        url: "https://www.busseltonrunnersclub.org.au/brc-bay-run/results-photos",
      },
    ],
    fieldSize: {
      display: "About 210",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/144468",
      note: "MarathonView records 214 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "rottnest-island-marathon",
    name: "Wadjemup Rottnest Island Marathon",
    country: "australia",
    city: "Wadjemup / Rottnest Island",
    region: "Western Australia",
    timeZone: "Australia/Perth",
    officialUrl: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
    description:
      "The Rottnest Island Marathon takes runners around Wadjemup on four laps of island roads and paved paths, passing salt lakes and northern bays. The 2026 course includes an extension towards Oliver’s Hill, adding to an undulating coastal route. Planning starts before the start line: check the event ferry service or arrange an overnight stay. Entry is through the West Australian Marathon Club, with member and non-member rates. A 2027 date is still to be confirmed here.",
    course: {
      summary:
        "Four-lap island-road marathon. The 2026 guide starts at Heritage Common and visits salt lakes and the northern bays, with the Oliver's Hill extension used once.",
      surface: "Island roads and paved paths",
      profile: "Undulating coastal circuit",
      links: [
        {
          label: "Official course map and event guide",
          url: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
        },
      ],
    },
    entryMethods: [
      {
        name: "WAMC registration",
        description:
          "Use the club's event page for the next release; members and non-members have separate entry rates.",
        url: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
      },
    ],
    editions: [],
    nextDateNote: "The 2026 race took place on 14 June. A 2027 date has not been verified.",
    practical: [
      {
        label: "Travel planning",
        value: "Check event-specific ferry services or arrange an overnight island stay.",
        sourceUrl: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
      },
    ],
    media: [],
    resultsUrl: "https://www.wamc.org.au/race-results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-06-14",
        resultsUrl: "https://www.wamc.org.au/race-results",
        summary:
          "The 32nd Rottnest Running Festival used Heritage Common as its event hub. Marathon runners completed four laps around the island course.",
        categories: [],
      },
      {
        year: 2023,
        resultsUrl: "https://www.wamc.org.au/race-results",
        summary:
          "The organiser highlights Kate Baker's 2023 performance: she won the marathon outright and set a women's course record.",
        categories: [
          {
            category: "Women and overall",
            summary:
              "Kate Baker won outright in 2:47:53, recorded by WAMC as a women's course record.",
            sourceUrl: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official event information",
        url: "https://www.wamc.org.au/event/wadjemup-rottnest-running-festival",
      },
      {
        label: "2026 organiser guide",
        url: "https://cdn.wamc.org.au/guide/2026-chalkwest-budget-wadjemup-rottnest-running-festival-event-guide-6b3a0985-1792-4ad3-ab06-7f9d49c2d353.pdf",
      },
      {
        label: "Club results archive",
        url: "https://www.wamc.org.au/race-results",
      },
      {
        label: "AIMS race record",
        url: "https://aims-worldrunning.org/races/10172.html",
      },
    ],
    fieldSize: {
      display: "About 280",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://ausrunning.net/marathon/rottnest-island-2026",
      note: "Ausrunning reports 275 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "bunbury-three-waters-marathon",
    name: "Bunbury 3 Waters Marathon",
    country: "australia",
    city: "Bunbury",
    region: "Western Australia",
    timeZone: "Australia/Perth",
    officialUrl: "https://www.runbunbury.com.au/mode-marathon",
    description:
      "Bunbury’s 3 Waters Marathon takes its name from the Indian Ocean, Koombana Bay and Leschenault Inlet. The two-lap road and paved-path course also visits Big Swamp Nature Reserve and climbs towards the lighthouse on each circuit. The second visit may feel rather more uphill than the first. The race hub is at Bunbury Runners Club beside Ocean Drive. The next festival is confirmed for 11 April 2027, with online registration opening on 1 October 2026.",
    course: {
      summary:
        "Two laps from Bunbury Runners Club, taking in Big Swamp, the oceanfront, lighthouse, Jetty Road and Leschenault Inlet.",
      surface: "Road and paved paths, with the event hub at the recreation ground",
      profile: "Undulating, including the lighthouse climb on each lap.",
      links: [
        {
          label: "Official full marathon route",
          url: "https://www.runbunbury.com.au/mode-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description: "Registration for 2027 opens on 1 October 2026 through the official site.",
        url: "https://www.runbunbury.com.au/",
      },
    ],
    editions: [
      {
        date: "2027-04-11",
        sourceUrl:
          "https://www.bunburyrunnersclub.org.au/running-events/bunbury-3-waters-running-festival",
      },
    ],
    practical: [],
    media: [
      {
        label: "2026 official race photographs",
        url: "https://www.runbunbury.com.au/2025results-1",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.runbunbury.com.au/2025results-1",
    pastEditions: [
      {
        year: 2026,
        date: "2026-04-12",
        resultsUrl: "https://www.runbunbury.com.au/2025results-1",
        summary: "Liam Kamudu and Anna Watts led the 2026 marathon podiums.",
        categories: [
          {
            category: "Men",
            summary: "Liam Kamudu 2:39:20; Rhys Shore 2:46:29; Jon Pendse 2:47:42.",
            sourceUrl: "https://www.runbunbury.com.au/2025results-1",
          },
          {
            category: "Women",
            summary: "Anna Watts 3:05:41; Melissa Jolly 3:12:17; Kylie Durward 3:14:46.",
            sourceUrl: "https://www.runbunbury.com.au/2025results-1",
          },
        ],
      },
    ],
    sources: [
      {
        label: "2027 organising-club date",
        url: "https://www.bunburyrunnersclub.org.au/running-events/bunbury-3-waters-running-festival",
      },
      {
        label: "Marathon route",
        url: "https://www.runbunbury.com.au/mode-marathon",
      },
      {
        label: "Entry announcement",
        url: "https://www.runbunbury.com.au/",
      },
      {
        label: "2026 podium and archive links",
        url: "https://www.runbunbury.com.au/2025results-1",
      },
    ],
    fieldSize: {
      display: "About 230",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/146395",
      note: "MarathonView records 229 full-marathon finishers in 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "alice-springs-marathon",
    name: "Alice Springs Marathon",
    country: "australia",
    city: "Alice Springs",
    region: "Northern Territory",
    timeZone: "Australia/Darwin",
    officialUrl: "https://www.alicespringsrunningfestival.com.au/",
    description:
      "The Alice Springs Marathon starts and finishes at Simpsons Gap, following Darken Drive and the sealed cycle path through Tjoritja / West MacDonnell National Park. Desert bushland and the ranges frame an undulating out-and-back course. The marathon returned in 2025 after its previous edition in 2018, and the next festival is confirmed for 18 July 2027. Registration is expected in early 2027. The published 7 am start and 1:30 pm cut-off remain provisional, so check the final instructions.",
    course: {
      summary:
        "From Simpsons Gap along Darken Drive to the ranger-station out-and-back, then along the Simpsons Gap path and back to the start.",
      surface: "Road and sealed cycle path",
      profile: "Undulating out-and-back route",
      links: [
        {
          label: "Official marathon route",
          url: "https://www.alicespringsrunningfestival.com.au/",
        },
        {
          label: "NT Parks path information",
          url: "https://nt.gov.au/parks/find-a-park/tjoritja-west-macdonnell-national-park/simpsons-gap",
        },
      ],
    },
    entryMethods: [
      {
        name: "2027 registration",
        description: "The organiser expects registrations to open in early 2027.",
        url: "https://www.alicespringsrunningfestival.com.au/",
      },
    ],
    editions: [
      {
        date: "2027-07-18",
        sourceUrl: "https://www.alicespringsrunningfestival.com.au/",
      },
    ],
    practical: [
      {
        label: "Provisional 2027 schedule",
        value: "07:00 start;13:30 cut-off. Organiser states details are subject to change.",
        sourceUrl: "https://www.alicespringsrunningfestival.com.au/",
      },
    ],
    media: [
      {
        label: "Official 2025 and 2026 photo collection",
        url: "https://www.alicespringsrunningfestival.com.au/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://my.raceresult.com/374561/results",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://my.raceresult.com/374561/results",
        summary:
          "The festival returned for a second year after its 2025 revival, with all distances starting and finishing at Simpsons Gap.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "2027 race, entry, route and photos",
        url: "https://www.alicespringsrunningfestival.com.au/",
      },
      {
        label: "Sealed-path confirmation",
        url: "https://nt.gov.au/parks/find-a-park/tjoritja-west-macdonnell-national-park/simpsons-gap",
      },
      {
        label: "2026 official results",
        url: "https://my.raceresult.com/374561/results",
      },
    ],
    fieldSize: {
      display: "About 40",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://thetimingguysresults.com/list/AliceSpringsRunningFestival/2025/MAR/",
      note: "Based on 37 full-marathon finish times recorded by The Timing Guys in 2025.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "cadbury-marathon",
    name: "Cadbury Marathon",
    country: "australia",
    city: "Claremont, Hobart",
    region: "Tasmania",
    timeZone: "Australia/Hobart",
    officialUrl: "https://cadburymarathon.com.au/marathon/",
    description:
      "The Cadbury Marathon starts on Cadbury Road in Claremont, Hobart, and finishes at the chocolate factory. The published road route passes through the Cadbury estate and the MONA area, crossing Bowen Bridge before the return climb. A chocolate factory is a persuasive finish-line landmark, though it does little for the gradient. The 2027 route remains provisional; use the final event booklet for pacing plans. Enter the in-person marathon through Race Roster and allow for the published six-hour limit.",
    course: {
      summary:
        "Published route from Cadbury Road through the estate, Main Road and the MONA area to Bowen Bridge, returning to the factory. Final 2027 route confirmation is pending.",
      surface: "Road",
      profile: "Undulating, including bridge crossings and the return climb to Claremont.",
      links: [
        {
          label: "Official route, map and elevation",
          url: "https://cadburymarathon.com.au/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "In-person marathon registration",
        description:
          "Select Cadbury Marathon (42.2 km) in the official Race Roster registration. Virtual entries are separate.",
        url: "https://raceroster.com/events/2027/130484/2027-cadbury-marathon",
      },
    ],
    editions: [
      {
        date: "2027-01-03",
        sourceUrl: "https://cadburymarathon.com.au/marathon/",
      },
    ],
    fieldSize: {
      display: "About 280 finishers",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://thetimingguysresults.com/cadburymarathon/2025",
      note: "278 in-person full-marathon finishers in the official timer.",
    },
    practical: [
      {
        label: "2027 time limit",
        value: "6 hours; start time to be confirmed.",
        sourceUrl: "https://cadburymarathon.com.au/marathon/",
      },
      {
        label: "2027 minimum age",
        value: "18 on race day",
        sourceUrl: "https://cadburymarathon.com.au/marathon/",
      },
    ],
    media: [
      {
        label: "Official race photography",
        url: "https://cadburymarathon.com.au/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://cadburymarathon.com.au/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://racetecresults.com/results.aspx?CId=20346&RId=150",
        summary:
          "The organiser's 2026 archive links the in-person marathon and other festival-distance results.",
        categories: [],
      },
      {
        year: 2025,
        resultsUrl: "https://thetimingguysresults.com/list/cadburymarathon/2025/MARA/",
        summary:
          "The official timer recorded 278 in-person marathon finishers, led by Fraser Darcy and Camille O'Donoghue.",
        categories: [
          {
            category: "Men",
            summary:
              "Fraser Darcy won in 2:26:46 gun time (2:26:45 net), ahead of Toby Sparkes and Harvey Chilcott.",
            sourceUrl: "https://thetimingguysresults.com/list/cadburymarathon/2025/MARA/",
          },
          {
            category: "Women",
            summary:
              "Camille O'Donoghue won in 2:54:46 gun time (2:54:40 net), ahead of Claire Johnson and Kyoko Miura.",
            sourceUrl: "https://thetimingguysresults.com/list/cadburymarathon/2025/MARA/",
          },
        ],
      },
      {
        year: 2021,
        resultsUrl: "https://cadburymarathon.com.au/results/",
        summary:
          "The organiser's honour roll records Matt Gunther and Marnie Ponton as the 2021 marathon winners.",
        categories: [
          {
            category: "Men",
            summary: "Matt Gunther won in 2:25:58.",
            sourceUrl: "https://cadburymarathon.com.au/results/",
          },
          {
            category: "Women",
            summary: "Marnie Ponton won in 2:39:11.",
            sourceUrl: "https://cadburymarathon.com.au/results/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "2027 marathon and route",
        url: "https://cadburymarathon.com.au/marathon/",
      },
      {
        label: "2027 registration",
        url: "https://raceroster.com/events/2027/130484/2027-cadbury-marathon",
      },
      {
        label: "Official results and honour roll",
        url: "https://cadburymarathon.com.au/results/",
      },
      {
        label: "2025 official full-marathon results",
        url: "https://thetimingguysresults.com/list/cadburymarathon/2025/MARA/",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
