import type { RoadMarathon } from "./types";

const kaapOfficial = "https://nelspruitmarathonclub.com/";
const kaapEntry =
  "https://entrygeek.co.za/events/tswelopele-funerals-kaapsehoop-4-in-1-marathon-2026/";
const kaapInternational =
  "https://entrygeek.co.za/events/tswelopele-funerals-kaapsehoop-4-in-1-marathon-2026international-runners/";
const kaapFlyer =
  "https://entrygeek.co.za/wp-content/uploads/2026/03/KAAPSEHOOP-FLYER-2026_page-0001-1-725x1024.jpg";
const kaapRules =
  "https://entrygeek.co.za/wp-content/uploads/2026/03/KAAPSEHOOP-FLYER-2026_page-0002-2-725x1024.jpg";
const kaapReport2025 =
  "https://www.citizen.co.za/lowvelder/sports-news/2025/11/10/in-photos-mavuso-and-van-zyl-motor-to-victory-to-claim-2025-kaapsehoop-marathon-title/";
const kaapReport2024 =
  "https://www.citizen.co.za/lowvelder/sports-news/local-sports/2024/11/08/thamsanqa-mthembu-wins-kaapsehoop-marathon-for-second-consecutive-year/";
const kaapResults2025 = "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5483";
const kaapResults2024 = "https://results.finishtime.co.za/results.aspx?CId=35&RId=4900";
const kaapReview = "https://runningmann.co.za/2021/11/03/kaapsehoop-marathon/";
const buffsOfficial = "https://buffsmarathon.co.za/";
const buffsResults2026 =
  "https://www.mobiielite.com/results/RaceID/2261a61d-f3c5-4fc9-a992-46b1a3add11f";
const buffsResults2025 =
  "https://www.mobiielite.com/results/RaceID/e3fff7e7-b381-423c-8a00-bb54c1f6508f";
const buffsReport2026 =
  "https://arenaholdings-dailydispatch-prod.web.arc-cdn.net/sport/2026-03-01-mixed-bag-of-results-in-buffalo-marathon/";
const buffsProfile = "https://runningmann.co.za/2026/01/30/march-2026-marathons/";
const buffsClubReport2025 =
  "https://www.nedbankrunningclub.co.za/newsletter/Preview.aspx?newsid=36204";

export const SOUTH_AFRICA_MB_MARATHONS: RoadMarathon[] = [
  {
    slug: "kaapsehoop-marathon",
    name: "Kaapsehoop Marathon",
    country: "south-africa",
    city: "Kaapsehoop to Mbombela",
    region: "Mpumalanga",
    timeZone: "Africa/Johannesburg",
    officialUrl: kaapOfficial,
    description:
      "Kaapsehoop Marathon is a point-to-point road race from the Mpumalanga village to Mbombela Stadium. The long descent attracts runners chasing qualifying times, although the uphill sections have not agreed to retire. For 2026, compulsory buses take marathon entrants to the start, with separate entry forms for local and international runners. Older course accounts describe a dirt turnaround, so confirm the latest surface details with the organiser before entering.",
    course: {
      summary:
        "The 42.2 km course starts at Kaapsehoop and finishes at Mbombela Stadium; the organiser provides compulsory transport to the start.",
      surface:
        "Classified as a road race; older course accounts include a dirt turnaround. Confirm the current turnaround surface with the organiser.",
      profile:
        "Predominantly downhill, with uphill sections; pace the descents with the later climbs in mind.",
      links: [
        { label: "Official 2026 start, finish and transport details", url: kaapFlyer },
        {
          label: "Route map linked by RunningCalendar",
          url: "https://www.plotaroute.com/route/2078374",
        },
        { label: "Independent course account", url: kaapReview },
      ],
    },
    entryMethods: [
      {
        name: "South African, Lesotho and Eswatini entry",
        description:
          "Use the organiser-linked local EntryGeek form and select 42.2 km. The 2026 listing charges R410 including the compulsory R60 bus fare; pre-entries close on 3 October.",
        url: kaapEntry,
      },
      {
        name: "International entry",
        description:
          "Other international runners have a separate EntryGeek form, listing R615 for the 2026 marathon. Check the foreign-athlete clearance requirements in the race rules.",
        url: kaapInternational,
      },
      {
        name: "Substitutions and distance changes",
        description:
          "The 2026 flyer permits substitutions, upgrades and downgrades during race-pack collection for a R60 fee.",
        url: kaapFlyer,
      },
    ],
    editions: [{ date: "2026-11-07", sourceUrl: kaapEntry }],
    nextDateNote: "The organiser has not announced a 2027 marathon date.",
    fieldSize: {
      display: "Around 3,200",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: kaapReport2025,
      note: "Lowvelder reports 3,223 full-marathon finishers in 2025, separately from the half marathon and 10 km.",
    },
    practical: [
      {
        label: "2026 start and buses",
        value: "The marathon starts at 05:30. Compulsory marathon buses depart at 02:30.",
        sourceUrl: kaapFlyer,
      },
      {
        label: "2026 cut-offs",
        value: "Reach halfway by 09:00; the finish cut-off is 11:30.",
        sourceUrl: kaapFlyer,
      },
      {
        label: "Temporary licences",
        value: "A temporary licence costs R50 in 2026.",
        sourceUrl: kaapFlyer,
      },
      {
        label: "International runners",
        value:
          "Foreign athletes must provide clearance from their home federation under the published rules.",
        sourceUrl: kaapRules,
      },
      {
        label: "On-course rules",
        value: "Seconding, pacing and earphones are prohibited by the 2026 race rules.",
        sourceUrl: kaapRules,
      },
    ],
    media: [
      { label: "Lowvelder 2025 report and photographs", url: kaapReport2025, kind: "photos" },
      { label: "Lowvelder 2024 report and photographs", url: kaapReport2024, kind: "photos" },
      { label: "The Running Mann: an earlier course account", url: kaapReview, kind: "news" },
    ],
    resultsUrl: kaapResults2025,
    pastEditions: [
      {
        year: 2025,
        date: "2025-11-01",
        resultsUrl: kaapResults2025,
        summary:
          "Lowvelder reports that Bonginkosi Mavuso broke clear in the second half to regain the title, while Irvette van Zyl led the women home. The 40th edition had 3,223 marathon finishers.",
        categories: [
          {
            category: "Men",
            summary:
              "Lowvelder lists Bonginkosi Mavuso first in 2:16:26, Derrick Masango second in 2:17:53 and Mbuti Mollo third in 2:18:08.",
            sourceUrl: kaapReport2025,
          },
          {
            category: "Women",
            summary:
              "Irvette van Zyl won in 2:41:05, followed by Melinda Jansen van Vuuren in 2:52:00 and Rebecca Nakuwa in 2:54:40, according to Lowvelder.",
            sourceUrl: kaapReport2025,
          },
        ],
      },
      {
        year: 2024,
        date: "2024-11-02",
        resultsUrl: kaapResults2024,
        summary:
          "Lowvelder describes a hot race and a close men's contest: Thamsanqa Mthembu retained his title by 13 seconds. The report also names the women's winner and six full-marathon age-group leaders.",
        categories: [
          {
            category: "Men",
            summary: "Thamsanqa Mthembu won in 2:16:07; Denis Kipkosgei followed in 2:16:20.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Women",
            summary:
              "Lowvelder names Kebogile Mothadi as winner in 2:53:25, ahead of Melinda Jansen van Vuuren in 2:55:07.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Male 40–49",
            summary: "Mthandazo Qhina led the category with 2:26:04.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Male 50–59",
            summary: "Nhlanhla Dladla took first place in 2:42:26.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Male 60–69",
            summary: "Jabulani Gamete won the age group in 2:54:47.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Male 70+",
            summary: "Butch Grobbelaar finished first in 5:37:35.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Female 40–49",
            summary: "Nomcebo Mthethwa led the category with 3:14:01.",
            sourceUrl: kaapReport2024,
          },
          {
            category: "Female 60–69",
            summary: "Sarah Crooks won the age group in 3:54:38.",
            sourceUrl: kaapReport2024,
          },
        ],
      },
    ],
    sources: [
      { label: "Nelspruit Marathon Club and official entry links", url: kaapOfficial },
      { label: "2026 local entry", url: kaapEntry },
      { label: "2026 international entry", url: kaapInternational },
      { label: "2026 organiser flyer", url: kaapFlyer },
      { label: "2026 organiser rules", url: kaapRules },
      {
        label: "Road classification and linked route map",
        url: "https://runningcalendar.co.za/events/kaapsehoop-marathon/2026",
      },
      { label: "Earlier course account and surface caveat", url: kaapReview },
      { label: "Lowvelder 2025 results and field size", url: kaapReport2025 },
      { label: "Lowvelder 2024 results", url: kaapReport2024 },
      {
        label: "2025 full-marathon timing link index",
        url: "https://runningcalendar.co.za/events/kaapsehoop-marathon/2025/results",
      },
      { label: "2025 official timing results", url: kaapResults2025 },
      { label: "2024 official timing results", url: kaapResults2024 },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "buffs-marathon",
    dateNotes: [
      {
        text: "Announced race weekend: 27–28 February 2027. The organiser’s listing does not specify which day the full marathon takes place.",
        sourceUrl: "https://liveadventure.co.za/",
        expiresAfter: "2027-02-28",
      },
    ],
    name: "Buffs (Buffalo) Marathon",
    country: "south-africa",
    city: "East London",
    region: "Eastern Cape",
    timeZone: "Africa/Johannesburg",
    officialUrl: buffsOfficial,
    description:
      "Buffs Marathon brings runners from the N6 near Macleantown into East London, finishing at the Buffs Club. This Eastern Cape road marathon descends towards the coast, but the route still includes climbing: gravity offers assistance, not a lift home. The organiser provides an online entry route and race-morning taxis to the start. Use the published 2026 arrangements as background while awaiting the next edition's confirmed date, fees and collection details.",
    course: {
      summary:
        "A 42.2 km point-to-point road route from the N6 near Macleantown to the Buffs Club in East London.",
      surface: "Road",
      profile:
        "Net downhill with climbs: The Running Mann describes a start around 500 metres above sea level and a finish near the coast.",
      links: [
        { label: "Official marathon route map and race information", url: buffsOfficial },
        { label: "Independent 2026 course profile", url: buffsProfile },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "Enter through the official site when the next edition opens. The 2026 race accepted online entries only, with no late entries.",
        url: buffsOfficial,
      },
    ],
    editions: [],
    nextDateNote:
      "The 2027 race weekend is announced; the exact marathon day remains to be confirmed.",
    fieldSize: {
      display: "Around 850",
      basis: "Reported entrants",
      year: "2026",
      sourceUrl: buffsReport2026,
      note: "Daily Dispatch reports 846 full-marathon entries in 2026. This excludes the separately reported half-marathon and 10 km fields.",
    },
    practical: [
      {
        label: "2026 timetable",
        value:
          "Start 06:00; finish cut-off 12:00. The next edition's timetable is still to be confirmed.",
        sourceUrl: buffsOfficial,
      },
      {
        label: "2026 transport",
        value: "Taxis left the Buffs Club from 04:00; the fare was R60 cash per runner.",
        sourceUrl: buffsOfficial,
      },
      {
        label: "Race-number collection",
        value:
          "In 2026, collection was at the Buffs Club on the preceding Saturday, not at the start.",
        sourceUrl: buffsOfficial,
      },
      {
        label: "Minimum age and race rules",
        value:
          "Marathon runners must be at least 20. Earphones are prohibited; check the official licence and seconding rules.",
        sourceUrl: buffsOfficial,
      },
    ],
    media: [
      { label: "Daily Dispatch: 2026 race report", url: buffsReport2026, kind: "news" },
      {
        label: "GO! & Express: the 2025 race weekend",
        url: "https://www.goexpress.co.za/2025/02/27/to-soon-to-book-26-race-dates/",
        kind: "news",
      },
    ],
    resultsUrl: buffsResults2026,
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-01",
        resultsUrl: buffsResults2026,
        summary:
          "Daily Dispatch reports that Sonwabi Tshezi broke 2:20 to win the 52nd edition and Putunz Macingwana led the women's marathon. Its race-day report described the results as not yet certified; the linked timing archive provides the official standings.",
        categories: [
          {
            category: "Men — race-day report",
            summary:
              "Daily Dispatch reports Sonwabi Tshezi first in 2:19:33 and Musa Zweni third in 2:26:53; these were provisional at publication.",
            sourceUrl: buffsReport2026,
          },
          {
            category: "Women — race-day report",
            summary:
              "The provisional report lists Putunz Macingwana first in 3:22:50, Angelique Norton second in 3:25:11 and Carmen Schaefer third in 3:30:48.",
            sourceUrl: buffsReport2026,
          },
        ],
      },
      {
        year: 2025,
        date: "2025-02-23",
        resultsUrl: buffsResults2025,
        summary:
          "The 51st edition took place on 23 February. Nedbank Running Club later included Jeannie Henderson's 2:58:37 at Buffs in its Comrades team preview. This is a reported individual performance; the official archive covers the full race standings.",
        categories: [
          {
            category: "Women — reported performance",
            summary:
              "Nedbank Running Club records Jeannie Henderson's 2025 Buffs Marathon time as 2:58:37, without stating her finishing position.",
            sourceUrl: buffsClubReport2025,
          },
        ],
      },
    ],
    sources: [
      { label: "Official race information, route map and entry rules", url: buffsOfficial },
      { label: "2026 official timing results", url: buffsResults2026 },
      { label: "2025 official timing results", url: buffsResults2025 },
      { label: "Daily Dispatch 2026 results and marathon entry count", url: buffsReport2026 },
      { label: "The Running Mann 2026 course guide", url: buffsProfile },
      { label: "Nedbank Running Club's 2025 reported performance", url: buffsClubReport2025 },
      {
        label: "Previous edition dates",
        url: "https://runningcalendar.co.za/events/buffs-marathon/history",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
