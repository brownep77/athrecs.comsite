import type { RoadMarathon } from "./types";

const soweto25Categories = [
  {
    category: "Men",
    summary: "Khoarahlane Joseph Seutloali, 2:20:09.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women",
    summary: "Margaret Jepchumba, 2:34:33.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Men 20–39",
    summary: "Khoarahlane Joseph Seutloali, 2:20:09.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Men 40–49",
    summary: "Lebenya Nkoka, 2:22:47.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Men 50–59",
    summary: "Herbet Mokgala, 2:47:38.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Men 60–69",
    summary: "Thabo Hlako, 3:13:07.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Men 70+",
    summary: "Stephen Moagi, 4:08:35.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women 20–39",
    summary: "Elizabeth Mokoloma, 2:35:59.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women 40–49",
    summary: "Margaret Jepchumba, 2:34:33.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women 50–59",
    summary: "Clara Betton, 3:38:16.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women 60–69",
    summary: "Sharda Narothum, 4:57:17.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
  {
    category: "Women 70+",
    summary: "Linda Icely, 4:55:40.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
  },
];

const soweto24Categories = [
  {
    category: "Men",
    summary: "Onalenna Khonkhobe, 2:18:36.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women",
    summary: "Neheng Khatala, 2:43:07.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Junior Men",
    summary: "Zakhele Ngubeni, 4:52:20.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Men 20–39",
    summary: "Onalenna Khonkhobe, 2:18:36.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Men 40–49",
    summary: "Lebenya Nkoka, 2:24:14.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Men 50–59",
    summary: "Charles Tjiane, 2:28:56.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Men 60–69",
    summary: "Ditaba Mokalodise, 3:03:16.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Men 70+",
    summary: "Patrick Mohlala, 3:53:09.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women 20–39",
    summary: "Neheng Khatala, 2:43:07.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women 40–49",
    summary: "Margaret Jepchumba, 2:44:55.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women 50–59",
    summary: "Clara Betton, 3:41:22.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women 60–69",
    summary: "Dolsie Sehoole, 4:33:55.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
  {
    category: "Women 70+",
    summary: "Margaret Boshoe, 5:54:59.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
  },
];

const jcm26Categories = [
  {
    category: "Men",
    summary: "Philemon Koskey, 2:24:14.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Women",
    summary: "Melissa Jansen Van Vuuren, 3:12:35.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Men 20–39",
    summary: "Philemon Koskey, 2:24:14.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Men 40–49",
    summary: "Sibusiso Prince Mchunu, 2:41:27.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Men 50–59",
    summary: "Charles Tjiane, 2:37:06.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Men 60–69",
    summary: "Nimrod Mokoena, 3:17:38.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Men 70+",
    summary: "Theo Swanepoel, 4:23:49.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Women 20–39",
    summary: "Melissa Jansen Van Vuuren, 3:12:35.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Women 40–49",
    summary: "Helene Van Rooyen, 3:20:21.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Women 50–59",
    summary: "Salome Cooper, 3:29:13.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
  {
    category: "Women 60–69",
    summary: "Mboneni Maumela, 5:19:35.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
  },
];

const jcm25Categories = [
  {
    category: "Men",
    summary: "Raphael Segodi, 2:33:55.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Women",
    summary: "Nancy Barber, 3:29:50.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Men 20–39",
    summary: "Raphael Segodi, 2:33:55.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Men 40–49",
    summary: "Omo Hlungwane, 2:39:13.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Men 50–59",
    summary: "Claude Moshiywa, 2:41:44. Listed with “no age tag”.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Men 60–69",
    summary: "Ndabezinhle Ndlovu, 3:23:10.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Men 70+",
    summary: "Johannes Maros Mosehla, 4:19:03.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Women 20–39",
    summary: "Samantha Prokopiou, 3:35:21.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Women 40–49",
    summary: "Nancy Barber, 3:29:50.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Women 50–59",
    summary: "Lorraine Kriel, 4:08:43.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
  {
    category: "Women 60–69",
    summary: "Annie Thom, 4:31:08.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
  },
];

const vaal26Categories = [
  {
    category: "Men",
    summary: "Tshepo Gavu, 2:23:53.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Women",
    summary: "Adele Broodryk, 3:01:58.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Men 20–39",
    summary: "Tshepo Gavu, 2:23:53.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Men 40–49",
    summary: "Lindiwe Khupha, 2:36:47.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Men 50–59",
    summary: "Jorge Marques, 2:55:18.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Men 60–69",
    summary: "Bradley Oakley-Brown, 3:43:41.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Men 70+",
    summary: "Jacob Mjandana, 4:48:34.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Women 20–39",
    summary: "Adele Broodryk, 3:01:58.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Women 40–49",
    summary: "Leanne Mackay, 3:16:22.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Women 50–59",
    summary: "Salome Cooper, 3:16:11.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
  {
    category: "Women 60–69",
    summary: "Diane Schlebusch, 4:35:22.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
  },
];

const vaal25Categories = [
  {
    category: "Men",
    summary: "Kgotlelelo Lekalakala, 2:30:25.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Women",
    summary: "Gerda Steyn, 2:40:47.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Men 20–39",
    summary: "Kgotlelelo Lekalakala, 2:30:25.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Men 40–49",
    summary: "Sibusiso Prince Mchunu, 2:37:46.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Men 50–59",
    summary: "Albert Nyirenda, 2:55:48. Listed with “no AT”.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Men 60–69",
    summary: "Ndabezinhle Ndlovu, 3:28:42.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Men 70+",
    summary: "Eric Makhaya, 5:22:14.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Women 20–39",
    summary: "Gerda Steyn, 2:40:47.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Women 40–49",
    summary: "Pertunia Shangase, 3:42:29. Listed with “no AT”.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Women 50–59",
    summary: "Jenni Kruse, 3:24:33.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
  {
    category: "Women 60–69",
    summary: "Louise Goosen, 4:23:24.",
    sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
  },
];
export const SOUTH_AFRICA_GAUTENG_MARATHONS: RoadMarathon[] = [
  {
    slug: "soweto-marathon-south-africa",
    dateNotes: [
      {
        text: "Advertised date: Sunday 29 November 2026, listed by Gauteng Tourism. Check the organiser for final confirmation and entries.",
        sourceUrl: "https://visit.gauteng.net/events/african-bank-soweto-marathon-2026",
        expiresAfter: "2026-11-29",
      },
    ],
    name: "African Bank Soweto Marathon",
    country: "south-africa",
    city: "Soweto, Johannesburg",
    region: "Gauteng",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://sowetomarathon.com/",
    description:
      "Soweto Marathon takes the full road-marathon distance through Johannesburg’s south-western townships, passing places with a much longer story than anyone’s training diary. Vilakazi Street, Regina Mundi Church and the Hector Pieterson Memorial feature in the organiser’s route description. The race used Johannesburg Expo Centre at NASREC as its base in 2025. Known as the People’s Race, it combines a demanding run with a close view of Soweto’s history; check the next edition’s entry announcement before making travel plans.",
    course: {
      summary:
        "The organiser’s route visits Soweto landmarks including Walter Sisulu Square, Regina Mundi Church, Vilakazi Street and the Hector Pieterson Memorial. The City confirmed that the established route was retained for 2025.",
      surface: "Road",
      profile:
        "Challenging urban marathon; consult the next edition’s route information for the final layout.",
      links: [
        {
          label: "Organiser’s route landmarks and 2025 race information",
          url: "https://secure.onreg.com/onreg2/front/step1.php?id=7266",
        },
        {
          label: "City of Johannesburg: 2025 route inspection",
          url: "https://joburg.org.za/media_/Newsroom/Pages/2025-News-Articles/City,-organisers-inspect-route-ahead-of-2025-African-Bank-Soweto-Marathon.aspx",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "The 2025 race used Peak Timing’s online entry service, which is now closed. Follow the organiser’s next entry announcement for the correct edition and registration link.",
        url: "https://sowetomarathon.com/",
      },
    ],
    editions: [],
    nextDateNote:
      "29 November 2026 is publicly advertised; final organiser confirmation and entry details remain to be established.",
    fieldSize: {
      display: "About 2,300",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
      note: "Rounded from 2,324 full-marathon results with finish times in Peak Timing’s 2025 table. The half marathon and 10km are excluded; this is one edition, not a multi-year average.",
    },
    practical: [
      {
        label: "Recent race base",
        value:
          "The 2025 event was based at Johannesburg Expo Centre, NASREC. Confirm the venue and collection arrangements for the next edition.",
        sourceUrl: "https://secure.onreg.com/onreg2/front/step1.php?id=7266",
      },
      {
        label: "Race choice",
        value:
          "Select the full marathon when entering: the event also stages a half marathon and 10km race.",
        sourceUrl:
          "https://joburg.org.za/media_/Newsroom/Pages/2025-News-Articles/City,-organisers-inspect-route-ahead-of-2025-African-Bank-Soweto-Marathon.aspx",
      },
    ],
    media: [
      {
        label: "Africa Daily: CGA's August 2026 statement on race approval",
        url: "https://africadaily.co.za/who-is-advertising-the-soweto-marathon-cga-says-2026-race-is-not-sanctioned/",
        kind: "news",
      },
      {
        label: "City of Johannesburg: 2025 race report",
        url: "https://joburg.org.za/media_/Newsroom/Pages/2025-News-Articles/Joburg-hails-record-breaking-success-of-the-2025-Soweto-Marathon.aspx",
        kind: "news",
      },
      {
        label: "Nedbank Running Club: 2025 race report",
        url: "https://www.nedbankrunningclub.co.za/article/resource.aspx?niid=81510&type=news",
        kind: "news",
      },
    ],
    resultsUrl: "https://sowetomarathon.com/results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-11-29",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
        summary:
          "Khoarahlane Joseph Seutloali led the men in 2:20:09, with Ntsindiso Mphakathi 15 seconds behind. Margaret Jepchumba topped the women’s standings in 2:34:33. The City’s race report describes early rain and mist. The category summaries follow Peak Timing’s full-marathon standings and its undifferentiated Time column; they are not a separate prize-award list.",
        categories: soweto25Categories,
      },
      {
        year: 2024,
        date: "2024-11-03",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
        summary:
          "Onalenna Khonkhobe headed the men’s results in 2:18:36 and Neheng Khatala the women’s in 2:43:07. Margaret Jepchumba led women aged 40–49, while Charles Tjiane headed men aged 50–59. These are the published timing-table standings, with chip times shown below, rather than a separate prize-award list.",
        categories: soweto24Categories,
      },
    ],
    sources: [
      { label: "Organiser and race updates", url: "https://sowetomarathon.com/" },
      {
        label: "Gauteng Tourism: advertised 2026 date",
        url: "https://visit.gauteng.net/events/african-bank-soweto-marathon-2026",
      },
      {
        label: "Official 2025 registration and route landmarks",
        url: "https://secure.onreg.com/onreg2/front/step1.php?id=7266",
      },
      {
        label: "City of Johannesburg: 2025 route",
        url: "https://joburg.org.za/media_/Newsroom/Pages/2025-News-Articles/City,-organisers-inspect-route-ahead-of-2025-African-Bank-Soweto-Marathon.aspx",
      },
      {
        label: "2025 full-marathon results and field",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=7266",
      },
      {
        label: "2024 full-marathon results",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=6659",
      },
      {
        label: "Peak Timing: edition dates and results archive",
        url: "https://www.peaktiming.co.za/results",
      },
      {
        label: "City of Johannesburg: 2025 race report",
        url: "https://joburg.org.za/media_/Newsroom/Pages/2025-News-Articles/Joburg-hails-record-breaking-success-of-the-2025-Soweto-Marathon.aspx",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "johannesburg-city-marathon-south-africa",
    name: "Johannesburg City Marathon",
    country: "south-africa",
    city: "Johannesburg",
    region: "Gauteng",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://joburgharriers.co.za/",
    description:
      "Johannesburg City Marathon is a full road marathon organised by Johannesburg Harriers, with Klipriviersberg Recreation Centre in Kibler Park as its recent race base. The inaugural route took runners onto the M1 and past central-city landmarks, with enough climbing to discourage an optimistic opening pace. The 2026 instructions set a six-hour finish limit and an intermediate cutoff near 26km. Check the next route and entry announcement carefully: a familiar race name does not make last year’s instructions current.",
    course: {
      summary:
        "The 2026 race used Klipriviersberg Recreation Centre in Kibler Park. The Running Mann’s detailed 2024 account follows the road course along the R82 and M1, through Braamfontein and Parktown and over Nelson Mandela Bridge; consult the organiser for the next route.",
      surface: "Road",
      profile:
        "Hilly in the documented 2024 layout; a current elevation profile has not been published here.",
      links: [
        {
          label: "Official 2026 race information",
          url: "https://secure.onreg.com/onreg2/front/step1.php?id=7369",
        },
        {
          label: "Organiser’s 2026 race flyer",
          url: "https://runningmann.co.za/wp-content/uploads/2025/12/JCM-2026-Race-flyer_13Nov2025_compressed.pdf",
        },
        {
          label: "The Running Mann: 2024 route map, profile and account",
          url: "https://runningmann.co.za/2024/05/23/johannesburg-city-marathon-up-in-the-dumps/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "The race uses Peak Timing’s online entry service. The 2026 entry period is closed; use the club’s announcement for the next edition.",
        url: "https://secure.onreg.com/onreg2/front/step1.php?id=7369",
      },
      {
        name: "Organiser’s manual entries",
        description:
          "The 2026 instructions allowed manual entries only if places remained, with a surcharge. This option and its deadlines must be confirmed for the next race.",
        url: "https://secure.onreg.com/onreg2/front/step1.php?id=7369",
      },
    ],
    editions: [],
    nextDateNote: "A 2027 date and entry opening are awaiting organiser confirmation.",
    fieldSize: {
      display: "About 1,300",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
      note: "Rounded from 1,320 full-marathon results with finish times in Peak Timing’s 2026 table. Shorter races are excluded; this is a single-edition estimate.",
    },
    practical: [
      {
        label: "Recent start and venue",
        value:
          "The 2026 marathon started at 06:00 at Klipriviersberg Recreation Centre, Kibler Park.",
        sourceUrl: "https://secure.onreg.com/onreg2/front/step1.php?id=7369",
      },
      {
        label: "2026 time limits",
        value:
          "The finish closed at noon, six hours after the start. An intermediate cutoff applied at 09:30 near 26km.",
        sourceUrl:
          "https://runningmann.co.za/wp-content/uploads/2025/12/JCM-2026-Race-flyer_13Nov2025_compressed.pdf",
      },
      {
        label: "Eligibility and timing",
        value:
          "The 2026 minimum marathon age was 20. The organiser specified mat-to-mat marathon timing and restricted walking entries to the shorter races.",
        sourceUrl:
          "https://runningmann.co.za/wp-content/uploads/2025/12/JCM-2026-Race-flyer_13Nov2025_compressed.pdf",
      },
    ],
    media: [
      {
        label: "The Running Mann: 2024 race report and photographs",
        url: "https://runningmann.co.za/2024/05/23/johannesburg-city-marathon-up-in-the-dumps/",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.peaktiming.co.za/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-22",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
        summary:
          "Philemon Koskey led the men in 2:24:14 chip time. Melissa Jansen Van Vuuren headed the women in 3:12:35, two seconds ahead of Melinda Jansen Van Vuuren. Charles Tjiane also stood out as the leading man aged 50–59 in 2:37:06. The summaries use the timer’s chip-time standings, not a separate prize-award list.",
        categories: jcm26Categories,
      },
      {
        year: 2025,
        date: "2025-03-30",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
        summary:
          "Raphael Segodi led the men in the published time of 2:33:55. Nancy Barber topped the women’s table in 3:29:50 and also headed women aged 40–49. The results include age-group standings, but a timing-table position does not by itself confirm eligibility for a category prize.",
        categories: jcm25Categories,
      },
    ],
    sources: [
      {
        label: "Official 2026 entry and race information",
        url: "https://secure.onreg.com/onreg2/front/step1.php?id=7369",
      },
      {
        label: "Organiser’s 2026 race flyer",
        url: "https://runningmann.co.za/wp-content/uploads/2025/12/JCM-2026-Race-flyer_13Nov2025_compressed.pdf",
      },
      {
        label: "The Running Mann: documented 2024 course",
        url: "https://runningmann.co.za/2024/05/23/johannesburg-city-marathon-up-in-the-dumps/",
      },
      {
        label: "2026 full-marathon results and field",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=7369",
      },
      {
        label: "2025 full-marathon results",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=6784",
      },
      {
        label: "Peak Timing: edition dates and results archive",
        url: "https://www.peaktiming.co.za/results",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "vaal-marathon-south-africa",
    dateNotes: [
      {
        text: "Calendar estimate: 28 February 2027. Awaiting confirmation from the organiser.",
        sourceUrl: "https://runningcalendar.co.za/events/vaal-marathon",
        expiresAfter: "2027-02-28",
      },
    ],
    name: "Cape Gate Vaal Marathon",
    country: "south-africa",
    city: "Vereeniging",
    region: "Gauteng",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://www.vaalmarathon.co.za/",
    description:
      "The Vaal Marathon covers two road laps through Vereeniging’s suburbs, including a stretch beside the Vaal River, from Dick Fourie Stadium. The organiser describes a flat course while sensibly declining to call it easy: 42 kilometres still require some negotiation. The 2026 race used online pre-entry only and a 5-hour-45-minute finish limit, with an earlier halfway cutoff. It is a useful option for runners who like a familiar second lap and a clearly defined pace target.",
    course: {
      summary:
        "Two laps through four Vereeniging suburbs, with a section beside the Vaal River. The start and finish are at Dick Fourie Stadium in Three Rivers.",
      surface: "Road",
      profile:
        "Flat, at Gauteng altitude; the organiser cautions that the course still requires sustained effort.",
      links: [
        {
          label: "Official route maps, profile and measurement certificate",
          url: "https://www.vaalmarathon.co.za/race-info.html",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online pre-entry",
        description:
          "The 2026 full marathon required advance online entry through Peak Timing. The organiser did not offer marathon entries at number collection or on race morning. Check the next opening and deadline on the entry page.",
        url: "https://www.vaalmarathon.co.za/entry-info.html",
      },
      {
        name: "Official substitution",
        description:
          "The organiser allowed paid substitutions and distance changes before a published deadline in 2026. Use only the next edition’s authorised process when announced.",
        url: "https://www.vaalmarathon.co.za/entry-info.html",
      },
    ],
    editions: [],
    nextDateNote: "A 2027 date and entry opening are awaiting organiser confirmation.",
    fieldSize: {
      display: "About 1,300",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
      note: "Rounded from 1,282 full-marathon results with finish times in Peak Timing’s 2026 table. The half marathon, 10km and fun run are excluded; this is a single-edition estimate.",
    },
    practical: [
      {
        label: "Recent start",
        value:
          "The 2026 marathon started at 06:00 from Dick Fourie Stadium, Klip River Drive, Three Rivers.",
        sourceUrl: "https://www.vaalmarathon.co.za/race-info.html",
      },
      {
        label: "2026 time limits",
        value:
          "The full-marathon finish limit was 5 hours 45 minutes, with a halfway cutoff of 2 hours 45 minutes.",
        sourceUrl: "https://www.vaalmarathon.co.za/race-info.html",
      },
      {
        label: "Age and licence",
        value:
          "The minimum marathon age was 20 in 2026. Runners without an annual athletics licence needed a temporary licence.",
        sourceUrl: "https://www.vaalmarathon.co.za/race-info.html",
      },
      {
        label: "Timing",
        value:
          "The organiser uses mat-to-mat timing and intermediate mats; runners must cross every required timing point.",
        sourceUrl: "https://www.vaalmarathon.co.za/race-info.html",
      },
    ],
    media: [
      {
        label: "Vaalweekblad News: 2025 race highlights",
        url: "https://www.youtube.com/watch?v=vu61j7DGGNc",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.vaalmarathon.co.za/results.html",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-01",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
        summary:
          "Tshepo Gavu led the men in 2:23:53 chip time and Adele Broodryk headed the women in 3:01:58. Salome Cooper led women aged 50–59 in 3:16:11, just ahead of the leading woman aged 40–49, Leanne Mackay, in the combined chip-time results. Category summaries follow the chip-time standings, not a separate prize-award list.",
        categories: vaal26Categories,
      },
      {
        year: 2025,
        date: "2025-02-23",
        resultsUrl: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
        summary:
          "Kgotlelelo Lekalakala led the men in 2:30:25 chip time, while Gerda Steyn topped the women in 2:40:47. Jenni Kruse headed women aged 50–59 in 3:24:33. The summaries use chip-time standings; records marked “no AT” do not establish eligibility for an age-category prize.",
        categories: vaal25Categories,
      },
    ],
    sources: [
      { label: "Official race overview and course", url: "https://www.vaalmarathon.co.za/" },
      {
        label: "Official race information and route",
        url: "https://www.vaalmarathon.co.za/race-info.html",
      },
      {
        label: "Official entry information",
        url: "https://www.vaalmarathon.co.za/entry-info.html",
      },
      { label: "Official results archive", url: "https://www.vaalmarathon.co.za/results.html" },
      {
        label: "2026 full-marathon results and field",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=7363",
      },
      {
        label: "2025 full-marathon results",
        url: "https://live.ultimate.dk/desktop/front/index.php?eventid=6741",
      },
      { label: "Peak Timing: edition dates", url: "https://www.peaktiming.co.za/results" },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "wally-hayward-marathon-south-africa",
    dateNotes: [
      {
        text: "Provisional listing: 1 May 2027. The organiser has announced a 2027 return; confirmation of the exact date is pending.",
        sourceUrl: "https://racepass.com/za/races/wally-hayward-marathon",
        expiresAfter: "2027-05-01",
      },
    ],
    name: "MiWay Wally Hayward Marathon",
    country: "south-africa",
    city: "Centurion",
    region: "Gauteng",
    timeZone: "Africa/Johannesburg",
    officialUrl: "https://www.wally.africa/",
    description:
      "Wally Hayward Marathon is a two-lap road marathon in Centurion, starting on West Avenue beside Centurion Rugby Club. The organiser publishes separate lap maps and a course measurement certificate, useful reading before the second lap begins to look suspiciously familiar. The 2026 race used a 5-hour-30-minute finish limit and mat-to-mat timing. A 50th edition is planned for 2027; wait for the confirmed date and entry arrangements before putting it firmly in the diary.",
    course: {
      summary:
        "A two-lap marathon in Centurion, with the start on West Avenue outside Centurion Rugby Club. The organiser supplies separate lap maps, a downloadable route and a March 2026 measurement certificate.",
      surface: "Road",
      profile:
        "Two-lap measured course; consult the official maps and route download for the layout.",
      links: [
        {
          label: "Official lap maps, route download and measurement certificate",
          url: "https://www.wally.africa/the-course",
        },
        { label: "Official start information", url: "https://www.wally.africa/the-start" },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "Use the entry link published by the organiser for the next edition. Registration for 2027 has not been confirmed here; the current race information covers the completed 2026 event.",
        url: "https://www.wally.africa/",
      },
      {
        name: "Official substitution",
        description:
          "In 2026, substitutions were processed at number collection on the two days before the race, for a fee and with the required registration details. No race-day substitutions were allowed. Confirm the next edition’s policy before arranging a transfer.",
        url: "https://www.wally.africa/substitutionsandup-anddowngrades",
      },
    ],
    editions: [],
    nextDateNote:
      "The organiser plans a 50th edition in 2027; its exact date and entry opening are awaiting confirmation.",
    fieldSize: {
      display: "About 3,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://runningmann.co.za/2026/01/03/2025-marathon-ultra-statistics/",
      note: "Rounded from 2,967 full-marathon finishers in The Running Mann’s 2025 statistics. This is a single-edition count, excluding the shorter races.",
    },
    practical: [
      {
        label: "Recent start",
        value:
          "The 2026 marathon started at 06:30 on West Avenue, immediately outside Centurion Rugby Club.",
        sourceUrl: "https://www.wally.africa/the-start",
      },
      {
        label: "2026 time limit",
        value:
          "The full-marathon finish limit was 5 hours 30 minutes. An intermediate cutoff also applies; check the final instructions for the next race.",
        sourceUrl: "https://www.wally.africa/cutofftimes",
      },
      {
        label: "Collection",
        value:
          "The 2026 schedule offered race-pack collection at Centurion Rugby Club on the two preceding days and from 04:30 to 06:15 on race morning.",
        sourceUrl: "https://www.wally.africa/run-in-2025",
      },
      {
        label: "Age and licence",
        value:
          "The marathon minimum age is 20. The organiser requires the appropriate annual or temporary athletics licence and age-category tags for category prizes.",
        sourceUrl: "https://www.wally.africa/rules",
      },
    ],
    media: [
      {
        label: "SMacPix: 2026 event photographs",
        url: "https://photofrog.co.za/events/p97r5/gallery?search=",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.wally.africa/race-results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-01",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5737",
        summary:
          "The organiser reports a wet, rainy race day in Centurion and thanks runners for their turnout. FinishTime hosts the marathon results, with separate standings for the shorter races. A verified summary of the marathon winners and age categories is not yet available here.",
        categories: [],
      },
      {
        year: 2025,
        date: "2025-05-01",
        resultsUrl: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5081",
        summary:
          "The 2025 event took place from Centurion Rugby Club on 1 May. The linked FinishTime archive is the full-marathon result table; the half marathon and shorter events have separate results. A verified category recap is not yet available here.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "Official 2026 report and 2027 edition announcement",
        url: "https://www.wally.africa/",
      },
      { label: "Official course maps and measurement", url: "https://www.wally.africa/the-course" },
      { label: "Official start information", url: "https://www.wally.africa/the-start" },
      { label: "Official race-pack collection", url: "https://www.wally.africa/run-in-2025" },
      { label: "Official cutoff times", url: "https://www.wally.africa/cutofftimes" },
      { label: "Official rules", url: "https://www.wally.africa/rules" },
      {
        label: "Official substitutions policy",
        url: "https://www.wally.africa/substitutionsandup-anddowngrades",
      },
      {
        label: "2026 marathon results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5737",
      },
      {
        label: "2025 marathon results",
        url: "https://results.finishtime.co.za/results.aspx?CId=35&EId=1&RId=5081",
      },
      {
        label: "Athletics Gauteng North: 2025 fixture and venue",
        url: "https://agn.co.za/wp-content/uploads/2025/03/AGN-Combined-2025-Fixtures-Version-5.pdf",
      },
      {
        label: "The Running Mann: 2025 marathon field statistics",
        url: "https://runningmann.co.za/2026/01/03/2025-marathon-ultra-statistics/",
      },
      {
        label: "MiWay: 2026 online entry route",
        url: "https://www.miway.co.za/wally-competition-terms-conditions",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
