import type { RoadMarathon } from "./types";

export const SOUTH_AFRICA_KZN_MARATHONS: RoadMarathon[] = [
  {
    slug: "durban-city-marathon-south-africa",
    name: "Durban City Marathon",
    country: "south-africa",
    city: "Durban",
    region: "KwaZulu-Natal",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://www.durbancitymarathon.co.za/",
    description:
      "Durban City Marathon is a road race based at Kings Park Athletics Stadium, with a coastal route through central Durban. The two-lap course includes stretches of promenade, giving runners a second look at the seafront when conversation is usually less ambitious. The 2027 listing specifies a 05:30 start and a five-hour-45-minute limit. Entries are advertised through Racepass; check the current race instructions before travelling, particularly the route and arrangements for collecting your number.",
    course: {
      summary:
        "Two laps through central Durban and the seafront. The organiser’s published 2024 route passes uShaka and returns to Kings Park; consult current race instructions for subsequent changes.",
      surface: "Road and promenade, with linking paths and a stadium finish",
      profile: "Predominantly flat, two-lap coastal course.",
      links: [
        {
          label: "Organiser’s route map and turn-by-turn directions — 2024 reference",
          url: "https://www.durbancitymarathon.co.za/routes-2023/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "The organiser’s Racepass listing advertises the 2027 marathon. Entries are marked as coming soon; choose the full-marathon option when booking opens.",
        url: "https://racepass.com/za/races/durban-city-marathon",
      },
      {
        name: "Late entry at registration",
        description:
          "The 2027 listing advertises late entries at Kings Park Athletics Stadium on 9 and 10 April. Check availability with the organiser.",
        url: "https://racepass.com/za/races/durban-city-marathon",
      },
    ],
    editions: [
      {
        date: "2027-04-11",
        sourceUrl: "https://racepass.com/za/races/durban-city-marathon",
      },
    ],
    fieldSize: {
      display: "About 700 runners",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://marathonview.net/race/139633",
      note: "MarathonView lists 717 finishers in the 2025 full marathon. This is one edition’s finishing field, not an average or the number of entries.",
    },
    practical: [
      {
        label: "2027 start and limit",
        value: "05:30 local time; five hours 45 minutes for the marathon.",
        sourceUrl: "https://racepass.com/za/races/durban-city-marathon",
      },
      {
        label: "2027 number collection",
        value: "Kings Park Athletics Stadium: 9 April, 10:00–16:00, or 10 April, 10:00–14:00.",
        sourceUrl: "https://racepass.com/za/races/durban-city-marathon",
      },
    ],
    media: [
      {
        label: "Annie Bothma’s account of her 2026 win",
        url: "https://www.anniebothma.com/my-story",
        kind: "news",
      },
      {
        label: "2026 marathon preview — The Running Mann",
        url: "https://runningmann.co.za/2026/01/30/march-2026-marathons/",
        kind: "news",
      },
    ],
    resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5700",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-29",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5700",
        summary:
          "Annie Bothma’s own race account records a women’s victory at Durban City in 2:33:35. The complete FinishTime results cover the marathon and the event’s other distances.",
        categories: [
          {
            category: "Women",
            summary: "Annie Bothma reports winning the marathon in 2:33:35.",
            sourceUrl: "https://www.anniebothma.com/my-story",
          },
        ],
      },
      {
        year: 2025,
        date: "2025-03-30",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=4979",
        summary:
          "MarathonView records 717 full-marathon finishers in the 2025 edition: 620 men and 97 women. FinishTime hosts the complete official results.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official event and entry listing",
        url: "https://racepass.com/za/races/durban-city-marathon",
      },
      {
        label: "Official route reference",
        url: "https://www.durbancitymarathon.co.za/routes-2023/",
      },
      {
        label: "2026 official results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5700",
      },
      {
        label: "2025 full-marathon field statistics",
        url: "https://marathonview.net/race/139633",
      },
      {
        label: "2026 winner’s race account",
        url: "https://www.anniebothma.com/my-story",
      },
      {
        label: "2026 course preview",
        url: "https://runningmann.co.za/2026/01/30/march-2026-marathons/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "hillcrest-marathon-south-africa",
    dateNotes: [
      {
        text: "Listed date: 7 February 2027 on Racepass. The listing still includes 2026 race details; organiser confirmation is pending.",
        sourceUrl: "https://racepass.com/za/races/the-hillcrest-marathon",
        expiresAfter: "2027-02-07",
      },
    ],
    name: "Rolando Hillcrest Marathon",
    country: "south-africa",
    city: "Hillcrest",
    region: "KwaZulu-Natal",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
    description:
      "Rolando Hillcrest Marathon follows the roads of Hillcrest and Winston Park, west of Durban, over two hilly laps. The second circuit offers the useful assurance that the climbs have not moved. A short linking path and a sports-ground finish accompany the road sections. This is an advance-entry race: the published rules allow no late entries or substitutions. Its six-hour limit includes a three-hour deadline for starting lap two, so a restrained first half has practical value.",
    course: {
      summary:
        "Two circuits through Hillcrest and Winston Park, starting at Hospital and Old Main roads and finishing at Hillcrest Villagers Athletics Club on Crooked Lane.",
      surface: "Road, with a short linking path and sports-ground finish",
      profile: "Hilly two-lap course.",
      links: [
        {
          label: "Official marathon course map",
          url: "https://connect.garmin.com/app/course/428401720",
        },
        {
          label: "Organiser’s detailed route instructions",
          url: "https://hvacmarathonracebible.wordpress.com/2025-rolando-hillcrest-villagers-marathon-route-information-2/",
        },
        {
          label: "Marathon elevation profile",
          url: "https://hvacmarathonracebible.wordpress.com/wp-content/uploads/2024/02/route-profile-42.png?w=954",
        },
      ],
    },
    entryMethods: [
      {
        name: "Advance online entry",
        description:
          "Enter through Racepass when the organiser opens registration. The published rules prohibit late entries, transfers and substitutions.",
        url: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
      },
      {
        name: "Entry for runners aged 70 and over",
        description:
          "The organiser advertises free race entry for runners aged 70 and over. Arrange registration and check marathon licensing requirements with the club.",
        url: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
      },
    ],
    editions: [],
    nextDateNote: "The organiser has not announced a confirmed 2027 date.",
    fieldSize: {
      display: "About 1,000 runners",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://marathonview.net/race/139181",
      note: "MarathonView lists 1,043 finishers in the 2025 full marathon. This is one edition’s finishing field, not an average or the number of entries.",
    },
    practical: [
      {
        label: "Published start and cutoffs",
        value:
          "05:00 start; six-hour finish limit. Start the second lap within three hours and reach 38.5 km by 10:30.",
        sourceUrl: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
      },
      {
        label: "Number collection",
        value:
          "Collect on the Saturday before the race, 10:00–17:00, at Hillcrest Villagers Club; no race-day collection.",
        sourceUrl: "https://hvacmarathonracebible.wordpress.com/",
      },
      {
        label: "Minimum age",
        value: "20 years on race day for the marathon.",
        sourceUrl: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
      },
    ],
    media: [
      {
        label: "2026 race photographs — Sportpix",
        url: "https://sportpix.co.za/events/hillcrest-marathon-2026",
        kind: "photos",
      },
      {
        label: "2026 club race report — Nedbank Running Club",
        url: "https://www.nedbankrunningclub.co.za/article/resource.aspx?niid=120577&type=news",
        kind: "news",
      },
    ],
    resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&RId=5581",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-08",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&RId=5581",
        summary:
          "Nedbank Running Club’s report highlighted two top-ten marathon finishes: Nathi Khanyeza in fifth and Gareth Ford in ninth. The full official results provide the wider standings.",
        categories: [
          {
            category: "Men — reported top-ten finishes",
            summary:
              "Nedbank Running Club reported Nathi Khanyeza fifth in 2:31:42 and Gareth Ford ninth in 2:41:41.",
            sourceUrl:
              "https://www.nedbankrunningclub.co.za/article/resource.aspx?niid=120577&type=news",
          },
        ],
      },
      {
        year: 2025,
        date: "2025-02-09",
        resultsUrl:
          "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5029&adv=1&dt=0",
        summary:
          "MarathonView lists 1,043 full-marathon finishers for 2025, comprising 823 men and 220 women. The official FinishTime table retains individual and category results.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official race details",
        url: "https://hillcrestvillagers.co.za/hillcrest-marathon/",
      },
      {
        label: "Organiser’s race-day guide",
        url: "https://hvacmarathonracebible.wordpress.com/",
      },
      {
        label: "Official route instructions",
        url: "https://hvacmarathonracebible.wordpress.com/2025-rolando-hillcrest-villagers-marathon-route-information-2/",
      },
      {
        label: "2026 club report",
        url: "https://www.nedbankrunningclub.co.za/article/resource.aspx?niid=120577&type=news",
      },
      {
        label: "2025 full-marathon field statistics",
        url: "https://marathonview.net/race/139181",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "capital-city-marathon-south-africa",
    name: "Capital City Marathon",
    country: "south-africa",
    city: "Pietermaritzburg",
    region: "KwaZulu-Natal",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://capitalcity42.co.za/",
    description:
      "Capital City Marathon is a road marathon through Pietermaritzburg, starting outside City Hall and finishing at Msunduzi Athletics Stadium. The separate venues are worth sorting out before race morning: the organiser directs drivers to park near the finish and walk to the start. The 2027 race begins at 05:00, with a six-hour limit and intermediate cutoffs. Entry options include online registration and Pick n Pay stores; international and unaffiliated runners should check the current temporary-licence rules.",
    course: {
      summary:
        "Starts at Pietermaritzburg City Hall and finishes at Msunduzi Athletics Stadium. Follow the current race instructions for the route between them.",
      surface: "Road, with an athletics-stadium finish",
      profile:
        "City course with separate start and finish venues; consult the organiser for the current elevation profile.",
      links: [
        {
          label: "2027 race guide, venues and course cutoffs",
          url: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "The organiser offers Entry Ninja and Webtickets. Follow its current entry links and select the 2027 full marathon; early entries run to 1 February, followed by late online entries until 21 February.",
        url: "https://capitalcity42.co.za/",
      },
      {
        name: "In-store entry",
        description: "The organiser also accepts manual entries through Pick n Pay stores.",
        url: "https://capitalcity42.co.za/",
      },
      {
        name: "Late entry at registration",
        description:
          "The 2027 race flyer advertises late entries at registration. Check availability and the applicable late-entry conditions.",
        url: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
      },
    ],
    editions: [
      {
        date: "2027-02-28",
        sourceUrl: "https://capitalcity42.co.za/",
      },
    ],
    fieldSize: {
      display: "About 900 runners",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://marathonview.net/race/144660",
      note: "MarathonView lists 915 finishers in the 2026 full marathon. This is one edition’s finishing field, not an average or the number of entries.",
    },
    practical: [
      {
        label: "2027 start and finish limit",
        value: "05:00 from City Hall; finish by 11:00. Intermediate course cutoffs also apply.",
        sourceUrl: "https://capitalcity42.co.za/",
      },
      {
        label: "2027 number collection",
        value:
          "09:00–17:00: Kings Park Athletics Stadium in Durban on 24 February, or Msunduzi Athletics Stadium on 26–27 February.",
        sourceUrl: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
      },
      {
        label: "2027 licensing",
        value:
          "The current flyer requires international and unaffiliated marathon entrants to buy and wear a temporary licence.",
        sourceUrl: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
      },
      {
        label: "Minimum age",
        value: "20 years for the full marathon.",
        sourceUrl: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
      },
    ],
    media: [
      {
        label: "2026 race report and winner interview — Caxton Network News",
        url: "https://www.citizen.co.za/network-news/network-sport/2026/02/22/video-marathon-glory-for-ngcobo-and-madziva-in-annual-capital-city-race/",
        kind: "news",
      },
      {
        label: "Organiser’s race photographs",
        url: "https://capitalcity42.co.za/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5589",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-22",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5589",
        summary:
          "Philani Ngcobo and Loveness Madziva won the 2026 marathon, according to Jerry Barnes’s report for The Witness and Caxton Network News. Ngcobo described cool conditions and light drizzle, and celebrated his first marathon victory.",
        categories: [
          {
            category: "Men",
            summary:
              "The Witness and Caxton Network News reported Philani Ngcobo winning in 2:26:54.",
            sourceUrl:
              "https://www.citizen.co.za/network-news/network-sport/2026/02/22/video-marathon-glory-for-ngcobo-and-madziva-in-annual-capital-city-race/",
          },
          {
            category: "Women",
            summary:
              "The Witness and Caxton Network News named Loveness Madziva as the women’s 42.2 km winner.",
            sourceUrl:
              "https://www.citizen.co.za/network-news/network-sport/2026/02/22/video-marathon-glory-for-ngcobo-and-madziva-in-annual-capital-city-race/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race and registration",
        url: "https://capitalcity42.co.za/",
      },
      {
        label: "2027 race flyer",
        url: "https://capitalcity42.co.za/wp-content/uploads/2026/09/CCM-Race-Flyer-9.26.pdf",
      },
      {
        label: "2026 official results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5589",
      },
      {
        label: "2026 race report",
        url: "https://www.citizen.co.za/network-news/network-sport/2026/02/22/video-marathon-glory-for-ngcobo-and-madziva-in-annual-capital-city-race/",
      },
      {
        label: "2026 full-marathon field statistics",
        url: "https://marathonview.net/race/144660",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "dolphin-coast-marathon-south-africa",
    dateNotes: [
      {
        text: "Calendar estimate: 21 March 2027. Awaiting confirmation from the organiser.",
        sourceUrl: "https://runningcalendar.co.za/events/dolphin-coast-marathon",
        expiresAfter: "2027-03-21",
      },
    ],
    name: "Balwin Sport Dolphin Coast Marathon",
    country: "south-africa",
    city: "Ballito to Durban",
    region: "KwaZulu-Natal",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://dolphincoaststriders.co.za/pages/balwin-dolphin-coast-marathon-2026",
    description:
      "Dolphin Coast Marathon follows the M4 coastal road from Ballito to Durban, finishing on the promenade at the Amphitheatre. It is a point-to-point road marathon, so transport deserves a place in the plan alongside pacing. The 2026 organiser offered paid buses from the finish to the start before dawn, with no number collection at the start. Online entry runs through Peak Timing; the next edition’s date and entry arrangements are still awaiting confirmation.",
    course: {
      summary:
        "The 2026 route started at Lifestyle Centre in Ballito and followed the M4 towards Durban, leaving near Durban Country Club for the promenade and Amphitheatre finish.",
      surface: "Road and paved beachfront promenade",
      profile: "Coastal point-to-point course.",
      links: [
        {
          label: "2026 organiser’s route description and race guide",
          url: "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry through Peak Timing",
        description:
          "Use the organiser’s Peak Timing entry link when the next edition opens. The completed 2026 edition accepted card and Instant EFT payments; late entries and substitutions were not allowed.",
        url: "https://dolphincoaststriders.co.za/pages/balwin-dolphin-coast-marathon-2026",
      },
      {
        name: "Entry for runners aged 70 and over",
        description:
          "The 2026 race offered free full-marathon entry to runners aged 70 and over. Check the next edition’s eligibility and registration arrangements.",
        url: "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
    ],
    editions: [],
    nextDateNote: "A confirmed 2027 date has not been announced.",
    fieldSize: {
      display: "About 2,200 runners",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
      note: "Rounded from 2,198 ranked finishers with recorded chip times in the official 42.2 km results. This excludes the shorter races and is not an entry count.",
    },
    practical: [
      {
        label: "2026 transport",
        value:
          "Paid buses ran from the Durban finish area towards the starts from 03:00; tickets were sold online and at registration.",
        sourceUrl:
          "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
      {
        label: "2026 collection",
        value:
          "Race packs were collected before race day. No collection was available at the start.",
        sourceUrl:
          "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
      {
        label: "2026 marathon rules",
        value:
          "Minimum age 20. The full marathon required a permanent licence; temporary licences were offered only for the shorter races.",
        sourceUrl:
          "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
      {
        label: "2026 halfway cutoff",
        value: "Reach 21 km within three hours, by 08:00.",
        sourceUrl:
          "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
    ],
    media: [
      {
        label: "Race photographs — RaceSnap",
        url: "https://racesnap.co.za/events/baldwin-sport-dolphin-coast-marathon",
        kind: "photos",
      },
    ],
    resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-22",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
        summary:
          "Adam Lipschitz and Melissa Gelling led the 2026 full marathon. The official results list 2,198 finishers. Category summaries below follow the timer’s chip-time standings, which are distinct from race-day prize eligibility.",
        categories: [
          {
            category: "Men / Men 20–39",
            summary: "Adam Lipschitz led the published standings in 2:18:47 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Women / Women 20–39",
            summary: "Melissa Gelling led the published standings in 2:53:07 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Men 40–49",
            summary: "Siya Mqambeli led the published standings in 2:30:42 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Women 40–49",
            summary: "Carla Van Huyssteen led the published standings in 2:59:22 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Men 50–59",
            summary: "Maxwell Sobetshe led the published standings in 2:41:58 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Women 50–59",
            summary: "Karen Sobrino led the published standings in 3:14:41 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Men 60–69",
            summary: "Shaun Meiklejohn led the published standings in 3:16:53 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Women 60–69",
            summary: "Roshini Natasen led the published standings in 3:46:23 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Men 70+",
            summary: "Pathamanathan Pillay led the published standings in 3:14:38 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
          {
            category: "Women 70+",
            summary: "Ronny-Ann Ager led the published standings in 5:13:48 chip time.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
          },
        ],
      },
      {
        year: 2025,
        date: "2025-03-16",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
        summary:
          "Adam Lipschitz and Gaby Webber headed the 2025 full-marathon standings. The official timer lists 1,928 finishers. The summaries follow its published Time column and category labels; standings do not establish eligibility for age-group prizes.",
        categories: [
          {
            category: "Men / Men 20–39",
            summary: "Adam Lipschitz led the published standings in 2:20:25.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Women / Women 20–39",
            summary: "Gaby Webber led the published standings in 2:58:34.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Men 40–49",
            summary: "Delani Mkhize led the published standings in 2:29:25.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Women 40–49",
            summary: "Janie Grundling led the published standings in 3:02:19.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Men 50–59",
            summary: "Michael Ndlovu led the published standings in 2:50:27.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Women 50–59",
            summary: "Patricia Dammann led the published standings in 3:28:45.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Men 60–69",
            summary: "Mandla Dlamuka led the published standings in 3:11:27.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Women 60–69",
            summary: "Irene Wisdom led the published standings in 3:57:06.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Men 70+",
            summary:
              "Samuel Ndwandwe is listed fastest in 2:54:28 with a “no age tag” note; an age-group prize is not established.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
          {
            category: "Women 70+",
            summary: "Patricia Fisher led the published standings in 5:09:43.",
            sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official organiser and entry portal",
        url: "https://dolphincoaststriders.co.za/pages/balwin-dolphin-coast-marathon-2026",
      },
      {
        label: "2026 race flyer",
        url: "https://admin.runningcalendar.co.za/storage/edition/5530/BalwinSport-Dolphin-Coast-Marathon-Flyer-2026.pdf",
      },
      {
        label: "2026 official results",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=7339",
      },
      {
        label: "2025 official results",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=6703",
      },
      {
        label: "Timing provider’s results archive",
        url: "https://www.peaktiming.co.za/results",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
