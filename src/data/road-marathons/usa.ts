import type { RoadMarathon } from "./types";

// Dates and results were checked against linked organiser, timer and governing-body sources; San Diego category recaps are explicitly attributed to local news reporting.
export const USA_ROAD_MARATHONS: RoadMarathon[] = [
  {
    slug: "boston-marathon-usa",
    name: "Boston Marathon",
    country: "usa",
    city: "Boston",
    region: "Massachusetts",
    timeZone: "America/New_York",
    officialUrl: "https://www.baa.org/races/boston-marathon/",
    description:
      "The Boston Marathon runs from Hopkinton to Boylston Street, with the Newton hills arriving between roughly miles 17.5 and 21. They are worth remembering during the earlier miles. Entry takes planning: achieving a qualifying time does not guarantee acceptance. For 2027, a further selection offers some eligible qualifiers who miss the cutoff another chance. The Boston Athletic Association also runs an official charity programme, with places and fundraising conditions managed by its partners.",
    course: {
      summary: "Hopkinton to Boston, finishing on Boylston Street.",
      surface: "Road",
      profile: "Point-to-point, with the Newton hills between approximately miles 17.5 and 21.",
      links: [
        {
          label: "Course and spectator information",
          url: "https://www.baa.org/races/boston-marathon/info-for-spectators/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Time qualification",
        description:
          "The 2027 qualifier application window was 14–18 September 2026. Applications are ranked against the applicable age and gender standard.",
        url: "https://www.baa.org/news/registration-updates-and-information-announced-for-2027-boston-marathon-presented-by-bank-of-america/",
      },
      {
        name: "Boston Qualifier Selection",
        description:
          "For 2027, approximately 1,000 places are randomly selected from eligible qualifier applicants whose times are not faster than the acceptance cutoff. This is not a general-public ballot.",
        url: "https://www.baa.org/news/registration-updates-and-information-announced-for-2027-boston-marathon-presented-by-bank-of-america/",
      },
      {
        name: "Official charity programme",
        description:
          "Apply through the B.A.A. official charity programme; each partner manages its own places and fundraising conditions.",
        url: "https://www.baa.org/races/boston-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-04-19",
        sourceUrl:
          "https://www.baa.org/news/registration-updates-and-information-announced-for-2027-boston-marathon-presented-by-bank-of-america/",
      },
    ],
    media: [
      {
        label: "2026 race report",
        url: "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.baa.org/races/boston-marathon/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.baa.org/races/boston-marathon/results/",
        summary:
          "John Korir set a course record and Sharon Lokedi retained the women’s title at the 130th race on 20 April 2026.",
        categories: [
          {
            category: "Men",
            summary: "John Korir won in 2:01:52, a course record.",
            sourceUrl:
              "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
          },
          {
            category: "Women",
            summary: "Sharon Lokedi won in 2:18:51.",
            sourceUrl:
              "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
          },
          {
            category: "Men’s Wheelchair",
            summary: "Marcel Hug won in 1:16:06.",
            sourceUrl:
              "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
          },
          {
            category: "Women’s Wheelchair",
            summary: "Eden Rainbow-Cooper won in 1:30:51.",
            sourceUrl:
              "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.baa.org/races/boston-marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.baa.org/races/boston-marathon/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.baa.org/news/130th-boston-marathon-presented-by-bank-of-america-featured-course-records-and-back-to-back-champions/",
      },
    ],
    fieldSize: {
      display: "About 29,000",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://registration.baa.org/2026/cf/Public/iframe_Statistics.htm",
      note: "Based on 29,033 finishers in the organiser’s runner category; wheelchair and handcycle divisions are listed separately.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "new-york-city-marathon-usa",
    name: "TCS New York City Marathon",
    country: "usa",
    city: "New York City",
    region: "New York",
    timeZone: "America/New_York",
    officialUrl: "https://www.nyrr.org/tcsnycmarathon",
    description:
      "The New York City Marathon crosses all five boroughs on city streets and bridges before finishing in Central Park. With a field this large, getting to the start deserves a place in the training plan. Entry routes include the drawing, official charities, approved travel providers and NYRR’s 9+1 programme. Time qualification has separate rules for eligible NYRR races and the limited allocation for other marathons; meeting a non-NYRR standard alone does not secure a place.",
    course: {
      summary: "A road marathon through all five boroughs, finishing in Central Park.",
      surface: "Road",
      profile: "City streets and bridge crossings.",
      links: [
        {
          label: "Official course and race information",
          url: "https://testcache.nyrr.org/tcsnycmarathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "Drawing and guaranteed entry",
        description:
          "Check NYRR’s edition-specific entry guidance for the drawing and eligibility windows.",
        url: "https://testcache.nyrr.org/tcsnycmarathon/runners/entry/2027",
      },
      {
        name: "9+1 programme",
        description:
          "Complete nine eligible NYRR races and one qualifying volunteer opportunity in 2026, and meet the membership requirement, to claim eligible 2027 entry.",
        url: "https://testcache.nyrr.org/tcsnycmarathon/runners/entry/2027",
      },
      {
        name: "Time qualification",
        description:
          "Eligible NYRR race performances and limited non-NYRR marathon qualification have different rules; a non-NYRR standard alone does not guarantee entry.",
        url: "https://testcache.nyrr.org/tcsnycmarathon/runners/entry/2027",
      },
      {
        name: "Charity and international travel",
        description:
          "Official charity partners, Team for Kids and approved international travel providers offer their own entry arrangements.",
        url: "https://testcache.nyrr.org/tcsnycmarathon/runners/entry/2027",
      },
    ],
    editions: [
      {
        date: "2026-11-01",
        sourceUrl: "https://testcache.nyrr.org/tcsnycmarathon",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
        kind: "news",
      },
    ],
    resultsUrl: "https://testcache.nyrr.org/tcsnycmarathon/results/race-results",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://testcache.nyrr.org/tcsnycmarathon/results/race-results",
        summary:
          "The 2 November race produced a women’s course record and an exceptionally close men’s finish. The organiser’s final event page records 59,226 finishers.",
        categories: [
          {
            category: "Women’s open division",
            summary: "Hellen Obiri won in 2:19:51, breaking the course record.",
            sourceUrl:
              "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
          },
          {
            category: "Men’s open division",
            summary: "Benson Kipruto won in 2:08:09.",
            sourceUrl:
              "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
          },
          {
            category: "Men’s wheelchair division",
            summary: "Marcel Hug won in 1:30:16.",
            sourceUrl:
              "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
          },
          {
            category: "Women’s wheelchair division",
            summary: "Susannah Scaroni won in 1:42:10.",
            sourceUrl:
              "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://testcache.nyrr.org/tcsnycmarathon",
      },
      {
        label: "Results archive",
        url: "https://testcache.nyrr.org/tcsnycmarathon/results/race-results",
      },
      {
        label: "Completed-race report and categories",
        url: "https://testcache.nyrr.org/media-center/press-release/2025_1102_tcsnycmresults",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    fieldSize: {
      display: "About 59,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://testcache.nyrr.org/tcsnycmarathon",
    },
  },
  {
    slug: "chicago-marathon-usa",
    name: "Bank of America Chicago Marathon",
    country: "usa",
    city: "Chicago",
    region: "Illinois",
    timeZone: "America/Chicago",
    officialUrl: "https://www.chicagomarathon.com/",
    description:
      "The Chicago Marathon starts and finishes in Grant Park, taking runners through 29 city neighbourhoods. Professional runners and wheelchair racers share the event with a substantial mass field. Entry is through a non-guaranteed drawing or one of several guaranteed routes, including qualifying performances, eligible legacy provisions, charities and approved tour operators. For 2027, applicants need to check both the application window and the payment deadline: being selected is not quite the end of the paperwork.",
    course: {
      summary:
        "A city-road circuit through 29 neighbourhoods, starting and finishing in Grant Park.",
      surface: "Road",
      profile: "City road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.chicagomarathon.com/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Non-guaranteed drawing",
        description:
          "2027 applications run 8–29 October 2026; drawing notifications are scheduled for 8 December. Selected runners must complete payment.",
        url: "https://www.chicagomarathon.com/apply/",
      },
      {
        name: "Guaranteed entry",
        description:
          "Published routes include qualifying performances, eligible legacy/cancellation provisions and completion of the Chicago Distance Series.",
        url: "https://www.chicagomarathon.com/apply/",
      },
      {
        name: "Official charity and tour entries",
        description:
          "Official charities and approved international tour operators offer guaranteed-entry routes subject to their own availability and requirements.",
        url: "https://www.chicagomarathon.com/apply/",
      },
    ],
    editions: [
      {
        date: "2026-10-11",
        sourceUrl: "https://www.chicagomarathon.com/",
      },
      {
        date: "2027-10-10",
        sourceUrl: "https://www.chicagomarathon.com/apply/",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.chicagomarathon.com/results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.chicagomarathon.com/results/",
        summary:
          "The 12 October race set a participation record of more than 54,000 finishers. Conner Mantz also lowered the American marathon record to 2:04:43.",
        categories: [
          {
            category: "Men",
            summary: "Jacob Kiplimo won in 2:02:23.",
            sourceUrl:
              "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
          },
          {
            category: "Women",
            summary: "Hawi Feysa won in 2:14:56.",
            sourceUrl:
              "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
          },
          {
            category: "Men’s wheelchair",
            summary: "Marcel Hug won in 1:23:20.",
            sourceUrl:
              "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
          },
          {
            category: "Women’s wheelchair",
            summary: "Susannah Scaroni won in 1:38:14.",
            sourceUrl:
              "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
          },
          {
            category: "Non-binary",
            summary: "Winter Parks was the first non-binary finisher in 2:28:31.",
            sourceUrl:
              "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.chicagomarathon.com/",
      },
      {
        label: "Results archive",
        url: "https://www.chicagomarathon.com/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
      },
    ],
    checkedAt: "2026-09-26",
    fieldSize: {
      display: "More than 54,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl:
        "https://cdn.chicagomarathon.com/app/uploads/2025/12/24120403/101225_2025-BACM_Press-Release_Post-Race_FINAL.pdf",
    },
  },
  {
    slug: "marine-corps-marathon-usa",
    name: "Marine Corps Marathon",
    country: "usa",
    city: "Arlington and Washington, DC",
    region: "Virginia / District of Columbia",
    timeZone: "America/New_York",
    officialUrl: "https://www.marinemarathon.com/event/marine-corps-marathon/",
    description:
      "The Marine Corps Marathon follows roads through Arlington and Washington, DC, finishing at the Marine Corps War Memorial. Civilian runners take part alongside military competitors, while the Armed Forces Championships, Challenge Cup and service-academy contests add separate team competitions. General registration, charity places and approved travel programmes offer different entry routes. Check their individual availability before making travel plans, and keep team awards separate from the individual marathon standings when looking through past results.",
    course: {
      summary:
        "Arlington and Washington, DC, landmarks with a finish at the Marine Corps War Memorial.",
      surface: "Road",
      profile: "City road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.marinemarathon.com/event/marine-corps-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Use the organiser’s registration page for current availability and eligibility.",
        url: "https://www.marinemarathon.com/event/marine-corps-marathon/",
      },
      {
        name: "Charity partners",
        description:
          "Official charity partners manage their own places and fundraising requirements; the published 2026 charity deadline has passed.",
        url: "https://www.marinemarathon.com/event/marine-corps-marathon/",
      },
      {
        name: "Travel and seeded entry",
        description:
          "The organiser lists approved travel agencies and a separate seeded-runner process; seeded applications for 2026 are closed.",
        url: "https://www.marinemarathon.com/event/marine-corps-marathon/",
      },
    ],
    editions: [
      {
        date: "2026-10-25",
        sourceUrl: "https://www.marinemarathon.com/event/marine-corps-marathon/",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.marinemarathon.com/results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.marinemarathon.com/results/",
        summary:
          "The 50th running celebrated the Marine Corps’ 250th birthday. The organiser’s post-race release reports 30,191 marathon finishers; its individual results were described as provisional when released.",
        categories: [
          {
            category: "Overall men",
            summary:
              "Kyle King won his third title in 2:18:52, as reported in the organiser’s release.",
            sourceUrl:
              "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
          },
          {
            category: "Overall women",
            summary: "Tessa Barrett won in a course-record 2:34:08 in the organiser’s release.",
            sourceUrl:
              "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
          },
          {
            category: "Armed Forces Marathon Championships",
            summary: "Army won the men’s team competition; Navy won the women’s.",
            sourceUrl:
              "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
          },
          {
            category: "Challenge Cup",
            summary: "The US Marine teams won both men’s and women’s competitions.",
            sourceUrl:
              "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
          },
          {
            category: "Service Academy Team Awards",
            summary: "Air Force Academy won the men’s title and Naval Academy the women’s.",
            sourceUrl:
              "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.marinemarathon.com/event/marine-corps-marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.marinemarathon.com/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    fieldSize: {
      display: "About 30,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl:
        "https://rrm.com/2025/news/usmc-marine-corps-marathon-weekend-celebrates-50th-anniversary-and-250th-birthday-of-the-united-states-marine-corps/",
    },
  },
  {
    slug: "honolulu-marathon-usa",
    name: "Honolulu Marathon",
    country: "usa",
    city: "Honolulu",
    region: "Hawaii",
    timeZone: "Pacific/Honolulu",
    officialUrl: "https://www.honolulumarathon.org/",
    description:
      "The Honolulu Marathon starts on Ala Moana Boulevard, passes through downtown Honolulu and Waikiki, and finishes at Kapiolani Park. The early start is part of the race-day planning, as are the conditions on Hawaii’s urban coastal roads. The 2025 race was wet and humid, with substantial rain before the start; a tropical setting does not promise a dry shirt. General registration and VIP charity entry are listed by the organiser, with separate terms to check.",
    course: {
      summary: "Ala Moana Boulevard, downtown Honolulu and Waikiki, with a Kapiolani Park finish.",
      surface: "Road",
      profile: "Urban coastal roads.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.honolulumarathon.org/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description: "Register through the official Honolulu Marathon entry page.",
        url: "https://www.honolulumarathon.org/key-information/how-to-enter",
      },
      {
        name: "VIP charity entry",
        description:
          "The organiser lists VIP charity entry alongside general registration; check its current terms.",
        url: "https://www.honolulumarathon.org/",
      },
    ],
    editions: [
      {
        date: "2026-12-13",
        sourceUrl: "https://www.honolulumarathon.org/",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.honolulumarathon.org/results",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.honolulumarathon.org/results",
        summary:
          "The 14 December edition started in wet, humid conditions. The organiser reported 23,131 marathon starters, separately from 8,903 starters in the 10K.",
        categories: [
          {
            category: "Men",
            summary: "Tsegay Weldlibanos won in 2:13:38.",
            sourceUrl:
              "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
          },
          {
            category: "Women",
            summary: "Calli Hauger-Thackery won in 2:30:43.",
            sourceUrl:
              "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
          },
          {
            category: "Men’s wheelchair",
            summary: "Yukina Ota won in a course-record 1:28:25.",
            sourceUrl:
              "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
          },
          {
            category: "Women’s wheelchair",
            summary: "Susannah Scaroni won in a course-record 1:48:37.",
            sourceUrl:
              "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.honolulumarathon.org/",
      },
      {
        label: "Results archive",
        url: "https://www.honolulumarathon.org/results",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    fieldSize: {
      display: "About 23,000",
      basis: "Starters",
      year: "2025",
      sourceUrl:
        "https://www.honolulumarathon.org/hauger-thackery-weldlibanos-win-rainy-jal-honolulu-marathon",
    },
    practical: [
      {
        label: "2026 start",
        value: "5:00 am local time on 13 December.",
        sourceUrl: "https://www.honolulumarathon.org/",
      },
    ],
  },
  {
    slug: "los-angeles-marathon-usa",
    name: "ASICS Los Angeles Marathon",
    country: "usa",
    city: "Los Angeles",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
    description:
      "The Los Angeles Marathon runs from Dodger Stadium to Century City on the Stadium to the Stars road course. The finish is on Santa Monica Boulevard at Avenue of the Stars, a useful detail to settle with anyone coming to meet you. The McCourt Foundation offers general registration and an official charity programme. When comparing past performances, note that professional running and wheelchair awards use gun times, while mass-field results also show chip times.",
    course: {
      summary: "Dodger Stadium to Santa Monica Boulevard at Avenue of the Stars, Century City.",
      surface: "Road",
      profile: "Point-to-point urban road route.",
      links: [
        {
          label: "Stadium to the Stars course",
          url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/distances-courses/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description: "Use the organiser’s full-marathon registration link for 2027 availability.",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
      },
      {
        name: "Charity programme",
        description:
          "The official charity programme offers partner fundraising and entry arrangements.",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-03-07",
        sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
      },
    ],
    media: [
      {
        label: "Official results and race photographs",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
        summary:
          "Nathan Martin won an exceptionally close elite men’s finish, while Priscah Cherono won the women’s race and the Marathon Chase. The awards page separates gun-timed elite results from chip-timed age divisions.",
        categories: [
          {
            category: "Elite men",
            summary:
              "Nathan Martin: 2:11:16.50 gun time; Michael Kimani Kamau was 0.01 seconds behind.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Elite women",
            summary: "Priscah Cherono: 2:25:18 gun time.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Pro Wheelchair men",
            summary: "Miguel Jimenez Vergara: 1:42:09 gun time.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Pro Wheelchair women",
            summary: "Hannah Babalola: 2:17:49 gun time.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 15 & Under",
            summary: "Tai Hansen: 3:08:30 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 15 & Under",
            summary:
              "Nathaly Sales-Gomez: 3:58:44 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 16-19",
            summary: "Andrew Alba Romero: 2:49:34 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 16-19",
            summary: "Natalia Davis: 3:28:22 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 20-24",
            summary: "Sheldon Watanabe: 2:24:30 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 20-24",
            summary: "Maggie Gibbs: 2:55:57 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 25-29",
            summary: "Xavier Smith: 2:20:27 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 25-29",
            summary: "Becca Richtman: 2:40:58 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 30-34",
            summary: "Tim Reed: 2:23:12 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 30-34",
            summary: "Anna Farello: 2:51:51 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 35-39",
            summary: "Anthony Solis: 2:24:18 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 35-39",
            summary: "Renee Funston: 2:49:26 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 40-44",
            summary: "Ryan Collins: 2:43:43 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 40-44",
            summary: "Kaia Sauter: 3:06:44 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 45-49",
            summary: "Jesse Williams: 2:44:56 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 45-49",
            summary: "Meghan Vogt: 3:16:12 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 50-54",
            summary: "Naoki Kato: 2:52:51 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 50-54",
            summary: "Tiffani Williams: 3:01:59 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 55-59",
            summary: "Hirofumi Oshima: 3:07:00 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 55-59",
            summary: "Deike Peters: 3:26:24 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 60-64",
            summary: "Angel Santiago: 3:12:16 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 60-64",
            summary: "Paula Molstead: 3:38:56 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 65-69",
            summary: "Javier Jorquiera: 3:06:14 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 65-69",
            summary: "Won An: 4:21:18 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 70-74",
            summary: "Charles Kaminski: 3:48:56 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 70-74",
            summary: "Sherry Pipkin: 5:09:38 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 75-79",
            summary: "Tim Freeman: 4:35:27 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 75-79",
            summary: "Myung Hee Kim: 4:47:44 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Men 80+",
            summary: "Armando Soto: 3:59:41 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
          {
            category: "Women 80+",
            summary: "Kazuko Baumgardner: 7:07:34 chip time, first in this published age division.",
            sourceUrl: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.mccourtfoundation.org/event/los-angeles-marathon/2026-awards/",
      },
    ],
    fieldSize: {
      display: "About 21,500",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Los+Angeles+Marathon",
      note: "Rounded from 21,444 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "san-francisco-marathon-usa",
    name: "San Francisco Marathon",
    country: "usa",
    city: "San Francisco",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.thesfmarathon.com/full-marathon/",
    description:
      "The San Francisco Marathon starts on the Embarcadero and returns to the waterfront after visiting the Golden Gate Bridge, Golden Gate Park, Haight Street and the stadium districts. The bridge crossing is out and back, giving it rather more running than a quick photograph suggests. Entry is through the organiser’s full-marathon page. Check the course limit before entering, as it determines official finisher status, and distinguish the full race from the two half marathons and separate ultra.",
    course: {
      summary:
        "Embarcadero, Golden Gate Bridge out and back, Golden Gate Park, Haight Street and the stadium districts.",
      surface: "Road",
      profile: "City and bridge road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.thesfmarathon.com/full-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description: "The full-marathon page links directly to the official registration platform.",
        url: "https://www.thesfmarathon.com/full-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-07-25",
        sourceUrl: "https://www.thesfmarathon.com/full-marathon/",
      },
    ],
    media: [
      {
        label: "2026 organiser race report",
        url: "https://www.endurancesportswire.com/over-30000-cross-the-finish-line-as-the-49th-san-francisco-marathon-concludes-in-historic-fashion/",
        kind: "news",
      },
      {
        label: "2026 race photos",
        url: "https://www.thesfmarathon.com/race-results-and-photos/",
        kind: "photos",
      },
      {
        label: "Official course videos",
        url: "https://www.thesfmarathon.com/full-marathon/",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.thesfmarathon.com/race-results-and-photos/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.thesfmarathon.com/race-results-and-photos/",
        summary:
          "The 49th edition took runners through San Francisco on 26 July 2026. The organiser’s post-race release lists provisional full-marathon leaders in three divisions.",
        categories: [
          {
            category: "Male Division",
            summary:
              "Garret Patrick was the provisional division leader in 2:26:25, according to the organiser’s release.",
            sourceUrl:
              "https://www.endurancesportswire.com/over-30000-cross-the-finish-line-as-the-49th-san-francisco-marathon-concludes-in-historic-fashion/",
          },
          {
            category: "Female Division",
            summary:
              "Leandra Zimmerman was the provisional division leader in 2:45:14, according to the organiser’s release.",
            sourceUrl:
              "https://www.endurancesportswire.com/over-30000-cross-the-finish-line-as-the-49th-san-francisco-marathon-concludes-in-historic-fashion/",
          },
          {
            category: "Non-Binary+ Division",
            summary:
              "Tony Solis was the provisional division leader in 3:20:28, according to the organiser’s release.",
            sourceUrl:
              "https://www.endurancesportswire.com/over-30000-cross-the-finish-line-as-the-49th-san-francisco-marathon-concludes-in-historic-fashion/",
          },
        ],
        date: "2026-07-26",
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.thesfmarathon.com/full-marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.thesfmarathon.com/race-results-and-photos/",
      },
      {
        label: "2026 organiser race report",
        url: "https://www.endurancesportswire.com/over-30000-cross-the-finish-line-as-the-49th-san-francisco-marathon-concludes-in-historic-fashion/",
      },
    ],
    fieldSize: {
      display: "About 7,200",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=San+Francisco+Marathon",
      note: "Rounded from 7,166 full-marathon finishers reported by FindMyMarathon for 2026.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2027 start and cutoff",
        value: "5:15 am local start; six-hour course limit for an official marathon finish.",
        sourceUrl: "https://www.thesfmarathon.com/full-marathon/",
      },
    ],
  },
  {
    slug: "california-international-marathon-usa",
    name: "California International Marathon",
    country: "usa",
    city: "Sacramento",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://runcim.org/",
    description:
      "California International Marathon runs from Folsom to the State Capitol in Sacramento, with rolling early miles and a flatter finish. Its net drop of 366 feet does not remove the uphill sections along the way. Entry tiers carry different transfer and deferral terms, with charity places listed separately. The race also attracts a strong competitive field: the 2025 edition hosted the USATF Marathon Championships and produced more than one hundred Olympic Trials qualifying performances.",
    course: {
      summary: "Folsom foothills to the California State Capitol in Sacramento.",
      surface: "Road",
      profile: "Rolling, net downhill by 366 feet, with a flat finish.",
      links: [
        {
          label: "Official course and race information",
          url: "https://runcim.org/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Registration tiers",
        description:
          "The organiser publishes Gold, Orange and Blue entry terms with different transfer/deferral options. The checked 2026 tiers were sold out.",
        url: "https://runcim.org/registration/",
      },
      {
        name: "Charity entry",
        description:
          "Charity entries are listed separately with a required contribution; check live availability.",
        url: "https://runcim.org/registration/",
      },
    ],
    editions: [
      {
        date: "2026-12-06",
        sourceUrl: "https://runcim.org/",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://www.usatf.org/news/2025/american-runners-deliver-historic-performances-at-",
        kind: "news",
      },
    ],
    resultsUrl: "https://runcim.org/results-photos/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://runcim.org/results-photos/",
        summary:
          "The 7 December edition hosted the USATF Marathon Championships. USATF reported 106 Olympic Trials qualifying performances, including 54 women and 52 men.",
        categories: [
          {
            category: "USATF Men",
            summary: "Futsum Zienasellassie won in 2:09:29.",
            sourceUrl:
              "https://www.usatf.org/news/2025/american-runners-deliver-historic-performances-at-",
          },
          {
            category: "USATF Women",
            summary: "Molly Born won in 2:24:09 on her marathon debut.",
            sourceUrl:
              "https://www.usatf.org/news/2025/american-runners-deliver-historic-performances-at-",
          },
          {
            category: "Women’s masters",
            summary:
              "Sara Hall finished second overall in 2:24:36, setting a masters course record.",
            sourceUrl:
              "https://www.usatf.org/news/2025/american-runners-deliver-historic-performances-at-",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://runcim.org/",
      },
      {
        label: "Results archive",
        url: "https://runcim.org/results-photos/",
      },
      {
        label: "2025 full-marathon results",
        url: "https://myrace.ai/races/cim-2025/results",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.usatf.org/news/2025/american-runners-deliver-historic-performances-at-",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    fieldSize: {
      display: "About 8,200",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://myrace.ai/races/cim-2025/results",
    },
  },
  {
    slug: "portland-marathon-usa",
    name: "Portland Marathon",
    country: "usa",
    city: "Portland",
    region: "Oregon",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.portlandmarathon.com/info",
    description:
      "The Portland Marathon starts and finishes on SW Naito Parkway, with its own start time separate from the half marathon. The organiser provides course maps and a detailed pre-race programme, useful for planning the route and race morning together. General entry comes with published transfer and deferral rules. Bib collection is at the expo unless you arrange the optional shipping service. Past results list both chip and gun times, alongside gender and age-division positions.",
    course: {
      summary: "A Portland road marathon starting and finishing at 1000 SW Naito Parkway.",
      surface: "Road",
      profile: "Urban roads; use the official course map for the current elevation and route.",
      links: [
        {
          label: "Course maps",
          url: "https://www.portlandmarathon.com/courses",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Register via the official site; check the separate marathon entry and published transfer/deferral policy.",
        url: "https://www.portlandmarathon.com/info",
      },
    ],
    editions: [
      {
        date: "2026-10-04",
        sourceUrl: "https://www.portlandmarathon.com/info",
      },
    ],
    media: [
      {
        label: "Race results and photos",
        url: "https://www.portlandmarathon.com/results",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.portlandmarathon.com/results",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.portlandmarathon.com/results",
        summary:
          "The 5 October marathon results publish chip time, gun time and age-division placings separately. The following summaries retain the timing basis shown by the organiser.",
        categories: [
          {
            category: "M Overall",
            summary: "Nic Maszk won in 2:26:52 chip and gun time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "F Overall",
            summary: "Luciana Lenth won in 2:53:20 chip and gun time.",
            sourceUrl: "https://www.portlandmarathon.com/results?event=Marathon&gender=F",
          },
          {
            category: "W Overall",
            summary:
              "Max Woodbury led the published W Overall category in 2:32:25 chip time (2:32:26 gun).",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M35-39",
            summary: "Kaleb Keyserling led the division in 2:35:08 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M45-49",
            summary: "West Livaudais led the division in 2:36:48 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M19-24",
            summary: "Henry Axon led the division in 2:37:27 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M25-29",
            summary: "Joseph Petty led the division in 2:38:16 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M30-34",
            summary: "Juan Robles led the division in 2:41:54 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M40-44",
            summary: "Evan White led the division in 2:46:57 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
          {
            category: "M15-18",
            summary: "Sam Evers led the division in 2:49:39 chip time.",
            sourceUrl: "https://www.portlandmarathon.com/results",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.portlandmarathon.com/info",
      },
      {
        label: "Results archive",
        url: "https://www.portlandmarathon.com/results",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.portlandmarathon.com/results",
      },
    ],
    fieldSize: {
      display: "About 3,000",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://www.portlandmarathon.com/results?race=167408&event=Marathon",
      note: "The organiser’s marathon table lists 3,012 ranked finishers, including wheelchair participants. Unranked and unfinished records and other distances are excluded.",
    },
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    practical: [
      {
        label: "2026 marathon start",
        value: "7:15 am local time. No race-morning packet collection.",
        sourceUrl: "https://www.portlandmarathon.com/info",
      },
    ],
  },
  {
    slug: "houston-marathon-usa",
    name: "Chevron Houston Marathon",
    country: "usa",
    city: "Houston",
    region: "Texas",
    timeZone: "America/Chicago",
    officialUrl: "https://www.chevronhoustonmarathon.com/",
    description:
      "The Chevron Houston Marathon is a 26.2-mile road race through Houston, held during a weekend that also offers a half marathon and 5K. General registration and the Run for a Reason charity programme provide separate entry routes. Consult the current marathon course and starting arrangements when planning race morning. The results archive stretches back to the early editions; the 2026 race added a men’s course record and a women’s win for Calli Hauger-Thackery.",
    course: {
      summary:
        "The full 26.2-mile Houston road race; consult the organiser’s current course information.",
      surface: "Road",
      profile: "City road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.chevronhoustonmarathon.com/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "2027 registration is linked through the organiser’s Haku platform, subject to remaining places.",
        url: "https://www.chevronhoustonmarathon.com/participants/registration/",
      },
      {
        name: "Run for a Reason",
        description:
          "Official charity partners provide fundraising entry options under their own requirements.",
        url: "https://www.chevronhoustonmarathon.com/",
      },
    ],
    editions: [
      {
        date: "2027-01-17",
        sourceUrl: "https://www.chevronhoustonmarathon.com/race-weekend/schedule/",
      },
    ],
    media: [
      {
        label: "2026 race report",
        url: "https://www.chevronhoustonmarathon.com/records-fall-and-us-champions-shine/",
        kind: "news",
      },
      {
        label: "Official photos and finish-line videos",
        url: "https://www.chevronhoustonmarathon.com/participants/results/",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.chevronhoustonmarathon.com/participants/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.chevronhoustonmarathon.com/participants/results/",
        summary:
          "Zouhair Talbi set a course record in the 2026 marathon. Calli Hauger-Thackery won just four weeks after her victory in Honolulu; half-marathon performances are excluded here.",
        categories: [
          {
            category: "Men",
            summary: "Zouhair Talbi won in 2:05:45, a course record.",
            sourceUrl:
              "https://www.chevronhoustonmarathon.com/records-fall-and-us-champions-shine/",
          },
          {
            category: "Women",
            summary: "Calli Hauger-Thackery won in 2:24:17.",
            sourceUrl:
              "https://www.chevronhoustonmarathon.com/records-fall-and-us-champions-shine/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.chevronhoustonmarathon.com/",
      },
      {
        label: "Results archive",
        url: "https://www.chevronhoustonmarathon.com/participants/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.chevronhoustonmarathon.com/records-fall-and-us-champions-shine/",
      },
    ],
    fieldSize: {
      display: "About 9,300",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Houston+Marathon",
      note: "Rounded from 9,257 full-marathon finishers reported by FindMyMarathon for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "dallas-marathon-usa",
    name: "BMW Dallas Marathon",
    country: "usa",
    city: "Dallas",
    region: "Texas",
    timeZone: "America/Chicago",
    officialUrl: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
    description:
      "The BMW Dallas Marathon starts and finishes at Dallas City Hall, taking runners through the city’s neighbourhoods on a certified road course. It takes place on the Sunday of a festival that also includes a half marathon, relays, shorter races and an ultra. General registration is through the organiser’s event site. Choose the individual marathon when entering or checking results: the weekend attendance is considerably broader than the number running all 26.2 miles.",
    course: {
      summary: "Dallas City Hall start and finish, through Dallas neighbourhoods.",
      surface: "Road",
      profile: "City road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Use the official Sunday-event page and choose the individual marathon rather than relay, half marathon or ultra.",
        url: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
      },
    ],
    editions: [
      {
        date: "2026-12-13",
        sourceUrl: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
      },
    ],
    media: [
      {
        label: "2025 race report",
        url: "https://www.endurancesportswire.com/downtown-dallas-roars-as-19000-runners-cross-the-finish-line-at-the-54th-bmw-dallas-marathon-on-sunday/",
        kind: "news",
      },
    ],
    resultsUrl: "https://dallasmarathon.com/dallas-marathon-festival/results",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://dallasmarathon.com/dallas-marathon-festival/results",
        summary:
          "The 54th edition took place on 14 December. The organiser’s press release named Steven Fahy and Alauna Carstens as full-marathon winners; its headline attendance includes other Sunday races.",
        categories: [
          {
            category: "Full Marathon men",
            summary:
              "Steven Fahy won; the organiser’s release reports a rounded time of 2 hours 23 minutes.",
            sourceUrl:
              "https://www.endurancesportswire.com/downtown-dallas-roars-as-19000-runners-cross-the-finish-line-at-the-54th-bmw-dallas-marathon-on-sunday/",
          },
          {
            category: "Full Marathon women",
            summary:
              "Alauna Carstens won; the organiser’s release reports a rounded time of 2 hours 53 minutes.",
            sourceUrl:
              "https://www.endurancesportswire.com/downtown-dallas-roars-as-19000-runners-cross-the-finish-line-at-the-54th-bmw-dallas-marathon-on-sunday/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
      },
      {
        label: "Results archive",
        url: "https://dallasmarathon.com/dallas-marathon-festival/results",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.endurancesportswire.com/downtown-dallas-roars-as-19000-runners-cross-the-finish-line-at-the-54th-bmw-dallas-marathon-on-sunday/",
      },
    ],
    fieldSize: {
      display: "About 3,800",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Dallas+Marathon",
      note: "Rounded from 3,847 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    practical: [
      {
        label: "2026 start",
        value: "8:00 am local time at Dallas City Hall Plaza.",
        sourceUrl: "https://dallasmarathon.com/dallas-marathon-festival/events/sunday-events",
      },
    ],
  },
  {
    slug: "twin-cities-marathon-usa",
    name: "Medtronic Twin Cities Marathon",
    country: "usa",
    city: "Minneapolis to Saint Paul",
    region: "Minnesota",
    timeZone: "America/Chicago",
    officialUrl:
      "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
    description:
      "The Twin Cities Marathon is a point-to-point road race from Minneapolis to Saint Paul. Its marathon guide covers registration, on-course support, pacer targets and finish-area arrangements, separate from the weekend’s 10-mile race and other events. General registration is the main entry route. There are also invited professional places and limited applications for strong age-group runners, although meeting a standard does not guarantee acceptance. Historical results distinguish finish time from net time when comparing performances.",
    course: {
      summary: "Minneapolis to Saint Paul on the marathon’s city-road route.",
      surface: "Road",
      profile: "Point-to-point urban road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Use the organiser’s marathon registration links and current event information.",
        url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
      },
      {
        name: "Professional and age-group applications",
        description:
          "The organiser has invited professional entries and limited comped applications for eligible high-performing age-group runners; meeting a standard does not guarantee acceptance.",
        url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
      },
    ],
    editions: [
      {
        date: "2026-10-04",
        sourceUrl:
          "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
      },
    ],
    media: [
      {
        label: "2025 organiser race report",
        url: "https://www.runningusa.org/industry-news/norris-and-bareikis-win-2025-medtronic-twin-cities-marathon-titles/",
        kind: "news",
      },
      {
        label: "2025 official weekend photographs",
        url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/2025photography",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.raceberryjam.com/2025/tcmmen.html",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.raceberryjam.com/2025/tcmmen.html",
        summary:
          "Will Norris and Jane Bareikis won the 2025 marathon from Minneapolis to Saint Paul. The organiser’s post-race report counted 7,025 marathon finishers and also recognised nonbinary and push-rim wheelchair champions.",
        categories: [
          {
            category: "Men",
            summary:
              "Will Norris led the published men’s results in 2:15:41 finish time (2:15:39 net).",
            sourceUrl: "https://www.raceberryjam.com/2025/tcmmen.html",
          },
          {
            category: "M35",
            summary: "Benard Kipkemoi Rotich led M35 in 2:17:37 finish time (2:17:35 net).",
            sourceUrl: "https://www.raceberryjam.com/2025/tcmmen.html",
          },
          {
            category: "Women",
            summary:
              "Jane Bareikis won; the organiser’s post-race report gives her time as 2:32:52.",
            sourceUrl:
              "https://www.runningusa.org/industry-news/norris-and-bareikis-win-2025-medtronic-twin-cities-marathon-titles/",
          },
          {
            category: "Non-Binary",
            summary: "The organiser lists Daniel Deuhs as the champion in 3:09:53.",
            sourceUrl:
              "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/marathonweekendprofessionalathletes",
          },
          {
            category: "Men’s Wheelchair",
            summary: "The organiser lists Hermin Garic as the champion in 1:46:14.",
            sourceUrl:
              "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/marathonweekendprofessionalathletes",
          },
          {
            category: "Women’s Wheelchair",
            summary: "The organiser lists Hannah Babalola as the champion in 2:21:47.",
            sourceUrl:
              "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/marathonweekendprofessionalathletes",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/medtronictwincitiesmarathon",
      },
      {
        label: "Results archive",
        url: "https://www.raceberryjam.com/2025/tcmmen.html",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.raceberryjam.com/2025/tcmmen.html",
      },
      {
        label: "2025 organiser race report",
        url: "https://www.runningusa.org/industry-news/norris-and-bareikis-win-2025-medtronic-twin-cities-marathon-titles/",
      },
      {
        label: "Official champions and elite information",
        url: "https://www.tcmevents.org/alleventsandraces/medtronictwincitiesmarathonweekend/marathonweekendprofessionalathletes",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    fieldSize: {
      display: "About 7,000",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl:
        "https://www.runningusa.org/industry-news/norris-and-bareikis-win-2025-medtronic-twin-cities-marathon-titles/",
    },
  },
  {
    slug: "grandmas-marathon-usa",
    name: "Grandma’s Marathon",
    country: "usa",
    city: "Duluth",
    region: "Minnesota",
    timeZone: "America/Chicago",
    officialUrl: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
    description:
      "Grandma’s Marathon follows the Lake Superior shore towards Duluth on a relatively flat road course. The name is homely; the distance remains the usual 26.2 miles. It has its own entry and results history, separate from the Garry Bjorklund Half Marathon. General registration for 2027 opens on 1 October 2026 at 7pm Central Time, with official charity options also available. The archive records open, non-binary, wheelchair and masters champions across the race’s history.",
    course: {
      summary: "Road marathon along Lake Superior towards Duluth.",
      surface: "Road",
      profile: "Relatively flat lakeshore road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description: "2027 registration opens at 7:00 pm Central Time on 1 October 2026.",
        url: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
      },
      {
        name: "Charity entry",
        description:
          "The organiser lists charity entries, including its Young Athletes Foundation programme; check each partner’s requirements.",
        url: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
      },
    ],
    editions: [
      {
        date: "2027-06-19",
        sourceUrl: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
      },
    ],
    media: [
      {
        label: "Official race photographs and results",
        url: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
        summary:
          "Amanuel Mesel and Dakotah Popehn won the 50th edition. Zoey Viavattine set a non-binary event record, while the archive separately records wheelchair and masters champions.",
        categories: [
          {
            category: "Men’s Champion",
            summary: "Amanuel Mesel won in 2:11:21.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Women’s Champion",
            summary: "Dakotah Popehn won in 2:28:51.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Non-Binary",
            summary:
              "Zoey Viavattine won in an event-record 2:38:09; the organiser recorded 25 finishers in this category.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Men’s Wheelchair",
            summary: "Luis Francisco Sanclemente won in 1:33:33.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Women’s Wheelchair",
            summary: "Michelle Wheeler won in 1:59:50.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Men’s Masters",
            summary: "Elisha Barno won in 2:12:50.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
          {
            category: "Women’s Masters",
            summary: "Argentina Valdepeñas Cerna won in 2:44:02.",
            sourceUrl: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
      },
      {
        label: "Results archive",
        url: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://grandmasmarathon.com/home/grandmas-marathon-results/",
      },
    ],
    checkedAt: "2026-09-26",
    fieldSize: {
      display: "About 9,600",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://grandmasmarathon.com/the-marathon/grandmas-marathon/",
    },
  },
  {
    slug: "philadelphia-marathon-usa",
    name: "TIAA Philadelphia Marathon",
    country: "usa",
    city: "Philadelphia",
    region: "Pennsylvania",
    timeZone: "America/New_York",
    officialUrl: "https://www.philadelphiamarathon.com/races/marathon/",
    description:
      "The Philadelphia Marathon visits historic city streets, University City, Fairmount Park and Manayunk, following the Schuylkill River corridor on part of its route. The start and finish area is on Benjamin Franklin Parkway near the Museum of Art. General entry for 2026 was sold out when checked; official charity partners may have remaining places with their own fundraising conditions. The organiser’s guide covers championship, wheelchair and age-group awards, while the full marathon has separate results from the shorter races.",
    course: {
      summary:
        "Benjamin Franklin Parkway start and finish area, with University City, Fairmount Park and Manayunk.",
      surface: "Road",
      profile: "Urban road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.philadelphiamarathon.com/races/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "The 2026 full marathon is sold out; follow the organiser for future registration releases.",
        url: "https://www.philadelphiamarathon.com/races/marathon/",
      },
      {
        name: "Official charity partners",
        description:
          "The organiser advises that official charity bibs may remain after general entry closes; availability and fundraising conditions vary.",
        url: "https://www.philadelphiamarathon.com/races/marathon/",
      },
    ],
    editions: [
      {
        date: "2026-11-22",
        sourceUrl: "https://www.philadelphiamarathon.com/races/marathon/",
      },
    ],
    media: [
      {
        label: "2025 official marathon photographs",
        url: "https://www.marathonfoto.com/Landing/22002025F1/philadelphia-marathon-2025",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.mychiptime.com/searchevent.php?id=16897",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.mychiptime.com/searchevent.php?id=16897",
        summary:
          "The official 2025 full-marathon gateway lists Melikhaya Frans and Anna Oeser at the top of its men’s and women’s leaderboards. The displayed leaderboard times below are retained as shown, without relabelling them as gun times.",
        categories: [
          {
            category: "Men",
            summary: "Melikhaya Frans leads the published leaderboard at 02:13:57.",
            sourceUrl: "https://www.mychiptime.com/searchevent.php?id=16897",
          },
          {
            category: "Women",
            summary: "Anna Oeser leads the published leaderboard at 02:34:55.",
            sourceUrl: "https://www.mychiptime.com/searchevent.php?id=16897",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.philadelphiamarathon.com/races/marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.mychiptime.com/searchevent.php?id=16897",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.mychiptime.com/searchevent.php?id=16897",
      },
    ],
    fieldSize: {
      display: "About 12,500",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Philadelphia+Marathon",
      note: "Rounded from 12,576 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    practical: [
      {
        label: "2026 starts",
        value:
          "Wheelchairs 6:55 am; runners 7:00 am local time, near 22nd Street and Benjamin Franklin Parkway.",
        sourceUrl: "https://www.philadelphiamarathon.com/races/marathon/",
      },
    ],
  },
  {
    slug: "detroit-free-press-marathon-usa",
    name: "Detroit Free Press Marathon",
    country: "usa",
    city: "Detroit",
    region: "Michigan",
    timeZone: "America/Detroit",
    officialUrl: "https://www.freepmarathon.com/marathon/",
    description:
      "The Detroit Free Press Marathon is an international road race, so the preparation includes checking travel documents as well as running shoes. Entrants must meet the organiser’s border-admissibility requirements. The Detroit route takes in Woodbridge, District Detroit, Eastern Market and the Dequindre Cut, finishing at the foot of Campus Martius. General entry for 2026 was sold out when checked, with a waitlist available. Read the crossing guidance before committing to the race.",
    course: {
      summary: "International marathon with Detroit neighbourhoods and a Campus Martius finish.",
      surface: "Road",
      profile: "City roads and international crossing sections; consult the current map.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.freepmarathon.com/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry and waitlist",
        description:
          "2026 general entry is sold out; the marathon page links the current waitlist order.",
        url: "https://www.freepmarathon.com/marathon/",
      },
    ],
    editions: [
      {
        date: "2026-10-18",
        sourceUrl: "https://www.freepmarathon.com/marathon/",
      },
    ],
    media: [
      {
        label: "2025 official race photographs",
        url: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.freepmarathon.com/previous-results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
        summary:
          "Andy Bowman and Christina Welsh led the 2025 marathon. The official results also publish masters and adaptive divisions, with separate categories for handcycles and pushrim athletes.",
        categories: [
          {
            category: "Overall Male",
            summary: "Andy Bowman ranked first in 2:16:10 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Overall Female",
            summary: "Christina Welsh ranked first in 2:46:59 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Overall Male Masters",
            summary: "Juri Plotnikow ranked first in 2:47:11 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Overall Female Masters",
            summary: "Bridget Stacy ranked first in 2:50:42 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female Handcycle",
            summary: "Katty Abran ranked first in 2:05:37 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female Pushrim",
            summary: "Heather Sealover ranked first in 2:57:06 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male Handcycle",
            summary: "Andrew Hairston ranked first in 1:27:28 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 19 And Under",
            summary: "Bella Reed ranked first in 3:50:12 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 20-24",
            summary: "Reagan Justice ranked first in 2:48:09 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 25-29",
            summary: "Christina Welsh ranked first in 2:46:59 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 30-34",
            summary: "Marissa Ward ranked first in 3:03:08 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 35-39",
            summary: "Kelsey Rivard ranked first in 3:09:21 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 40-44",
            summary: "Bridget Stacy ranked first in 2:50:42 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 45-49",
            summary: "Andrea Wudyka ranked first in 3:15:48 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 50-54",
            summary: "Anissa Schymik ranked first in 3:18:34 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 55-59",
            summary: "Gina Linze ranked first in 3:43:58 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 60-64",
            summary: "Lisa Veneziano ranked first in 3:07:17 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 65-69",
            summary: "Nancy Schubring ranked first in 3:58:32 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Female 70-74",
            summary: "Laurie Haller ranked first in 5:13:00 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 19 And Under",
            summary: "Jamison Snay ranked first in 3:08:20 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 25-29",
            summary: "Zac Truman ranked first in 2:20:38 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 30-34",
            summary: "Andy Bowman ranked first in 2:16:10 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 35-39",
            summary: "Micah Lorenzen ranked first in 2:30:13 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 40-44",
            summary: "Ian Driver ranked first in 2:47:34 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 45-49",
            summary: "Juri Plotnikow ranked first in 2:47:11 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 50-54",
            summary: "Alex Galitsky ranked first in 3:05:05 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 55-59",
            summary: "Tian Wang ranked first in 3:09:43 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 60-64",
            summary: "Rich Power ranked first in 3:34:42 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 65-69",
            summary: "Manfred Mueller ranked first in 3:43:04 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 70-74",
            summary: "Bob Basse ranked first in 4:33:04 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 75-79",
            summary: "David Huck ranked first in 5:55:32 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
          {
            category: "Male 20-24",
            summary: "Tom Brady ranked first in 2:19:19 on the official table.",
            sourceUrl: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.freepmarathon.com/marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.freepmarathon.com/previous-results/",
      },
      {
        label: "2025 official timing table and photographs",
        url: "https://gallery.us.runnertag.site/events/2025-detroit-free-press-marathon",
      },
    ],
    fieldSize: {
      display: "About 3,600",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Detroit+Free+Press+Marathon",
      note: "Rounded from 3,569 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
    practical: [
      {
        label: "2026 start and eligibility",
        value:
          "7:00 am local start; age 16 or older; valid travel document required for this international race.",
        sourceUrl: "https://www.freepmarathon.com/marathon/",
      },
      {
        label: "2026 cutoff",
        value: "6.5 hours from the Last Chance Pacer’s start; finish line closes at 2:00 pm.",
        sourceUrl: "https://www.freepmarathon.com/marathon/",
      },
    ],
  },
  {
    slug: "big-sur-international-marathon-usa",
    name: "Big Sur International Marathon",
    country: "usa",
    city: "Big Sur to Carmel",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.bigsurmarathon.org/races/marathon/",
    description:
      "The Big Sur International Marathon follows Highway 1 from Big Sur to Carmel, crossing Bixby Bridge around halfway. The coastal setting comes with 2,182 feet of climbing; the lower finish elevation is not the whole story. Entry uses a random drawing and guaranteed routes including charities, travel packages and Boston 2 Big Sur. The 2027 drawing has closed. Check remaining options, the early bus journey to the start and the course cutoff before making plans.",
    course: {
      summary: "Highway 1 from Big Sur to Carmel, via Bixby Bridge.",
      surface: "Road",
      profile: "Hilly; published ascent 2,182 feet and descent 2,528 feet.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.bigsurmarathon.org/races/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Random drawing",
        description:
          "The 2027 drawing closed on 2 September 2026; results were announced on 8 September.",
        url: "https://www.bigsurmarathon.org/register/",
      },
      {
        name: "Guaranteed routes",
        description:
          "Published routes include VIP, Race Benefactor, official charities and Marathon Tours, subject to availability.",
        url: "https://www.bigsurmarathon.org/races/marathon/",
      },
      {
        name: "Boston 2 Big Sur",
        description:
          "Opens 14 October 2026 at 8:00 am Pacific; entrants must also hold an official April 2027 Boston Marathon entry.",
        url: "https://www.bigsurmarathon.org/register/",
      },
    ],
    editions: [
      {
        date: "2027-04-25",
        sourceUrl: "https://www.bigsurmarathon.org/races/marathon/",
      },
    ],
    media: [
      {
        label: "2026 race report",
        url: "https://www.bigsurmarathon.org/2026/04/27/the-39th-big-sur-international-marathon-delivers-another-sold-out-year-along-highway-1/",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.bigsurmarathon.org/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.bigsurmarathon.org/results/",
        summary:
          "The 26 April race was the 39th edition. Simon Ricci took his third consecutive title, and Elle Meyer won the women’s division.",
        categories: [
          {
            category: "Men",
            summary: "Simon Ricci won in 2:23:46.",
            sourceUrl:
              "https://www.bigsurmarathon.org/2026/04/27/the-39th-big-sur-international-marathon-delivers-another-sold-out-year-along-highway-1/",
          },
          {
            category: "Women",
            summary: "Elle Meyer won in 2:51:45.",
            sourceUrl:
              "https://www.bigsurmarathon.org/2026/04/27/the-39th-big-sur-international-marathon-delivers-another-sold-out-year-along-highway-1/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.bigsurmarathon.org/races/marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.bigsurmarathon.org/results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.bigsurmarathon.org/2026/04/27/the-39th-big-sur-international-marathon-delivers-another-sold-out-year-along-highway-1/",
      },
    ],
    fieldSize: {
      display: "About 3,200",
      basis: "Listed runners",
      year: "2026",
      sourceUrl:
        "https://results.svetiming.com/Big-Sur/events/2026/Big-Sur-International-Marathon/results",
      note: "The official marathon results list 3,227 entrants. Other distances and relay teams are excluded.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2027 start and cutoff",
        value:
          "6:45 am Pacific start; six-hour limit with intermediate cutoffs. Organised bus transport takes entrants to the start.",
        sourceUrl: "https://www.bigsurmarathon.org/races/marathon/",
      },
    ],
  },
  {
    slug: "flying-pig-marathon-usa",
    name: "Flying Pig Marathon",
    country: "usa",
    city: "Cincinnati",
    region: "Ohio",
    timeZone: "America/New_York",
    officialUrl:
      "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
    description:
      "The Flying Pig Marathon takes runners through Cincinnati and neighbouring communities on both sides of the Ohio River, including Covington and Newport. Its hilly road course also visits Mariemont, Fairfax and Columbia Township before finishing on Mehring Way. General registration is through the organiser. For 2027, the listed start area is Rosa Parks Street. Study the course map and rolling closure policy alongside your pace plan; the weekend’s shorter races and challenges have separate entry choices.",
    course: {
      summary:
        "Cincinnati, Covington, Newport and neighbouring communities, finishing on Mehring Way.",
      surface: "Road",
      profile: "Hilly city road course.",
      links: [
        {
          label: "Official course and race information",
          url: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "The official race page links to registration for the full marathon and weekend options.",
        url: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
      },
    ],
    editions: [
      {
        date: "2027-05-02",
        sourceUrl:
          "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
      },
    ],
    media: [
      {
        label: "2026 race report",
        url: "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
        kind: "news",
      },
    ],
    resultsUrl: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/results",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/results",
        summary:
          "Zach Kreft lowered the men’s event record to 2:17:40 at the 28th edition. Katie Hallahan won the women’s race, and the organiser also reported handcycle and men’s wheelchair winners.",
        categories: [
          {
            category: "Men’s division",
            summary: "Zach Kreft won in 2:17:40, an event record.",
            sourceUrl:
              "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
          },
          {
            category: "Women’s division",
            summary: "Katie Hallahan won in 2:48:43.",
            sourceUrl:
              "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
          },
          {
            category: "Handcycle division",
            summary: "Steve Chapman won in 1:41:33.",
            sourceUrl:
              "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
          },
          {
            category: "Men’s wheelchair",
            summary: "James Garman won in 3:01:42.",
            sourceUrl:
              "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
          },
        ],
        date: "2026-05-03",
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
      },
      {
        label: "Results archive",
        url: "https://flyingpigmarathon.com/flying-pig-marathon-weekend/results",
      },
      {
        label: "2026 race report and registration numbers",
        url: "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
      },
    ],
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2027 start and minimum age",
        value: "6:30 am local start; entrants must be at least 18 on race day.",
        sourceUrl:
          "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
      },
      {
        label: "Course closure pace",
        value:
          "Services follow a continuous 16-minute-mile pace, with an additional intermediate cutoff.",
        sourceUrl:
          "https://flyingpigmarathon.com/flying-pig-marathon-weekend/event/flying-pig-marathon",
      },
    ],
    fieldSize: {
      display: "About 6,200",
      basis: "Entrants",
      year: "2026",
      sourceUrl:
        "https://flyingpigmarathon.com/news/records-fall-at-28th-annual-flying-pig-marathon",
    },
  },
  {
    slug: "richmond-marathon-virginia-usa",
    name: "Allianz Richmond Marathon",
    country: "usa",
    city: "Richmond",
    region: "Virginia",
    timeZone: "America/New_York",
    officialUrl: "https://www.richmondmarathon.org/races/marathon/",
    description:
      "The Allianz Richmond Marathon takes place in Virginia, starting on Broad Street near First Street and finishing by the downtown riverfront. The final approach is downhill, a welcome feature after most of a marathon. The organiser provides general registration, a detailed course guide and aid-station information. Fifth and Tredegar Streets, near Brown’s Island, give supporters a clear finish-area meeting point. Past results are available by year, with separate listings for the marathon, half marathon and 8K.",
    course: {
      summary: "Broad Street near First Street to Fifth and Tredegar Streets at the riverfront.",
      surface: "Road",
      profile: "City road course with a downhill finish.",
      links: [
        {
          label: "Marathon course map and aid stations",
          url: "https://www.richmondmarathon.org/race-weekend/course-information/marathon-course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Enter through the organiser’s full-marathon page and check current availability.",
        url: "https://www.richmondmarathon.org/races/marathon/",
      },
    ],
    editions: [
      {
        date: "2026-11-14",
        sourceUrl: "https://www.richmondmarathon.org/races/marathon/",
      },
    ],
    media: [
      {
        label: "2025 official race photographs",
        url: "https://www.finisherpix.com/en/event/9715/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.richmondmarathon.org/results/year-by-year-results/",
    pastEditions: [
      {
        year: 2025,
        resultsUrl: "https://www.richmondmarathon.org/results/year-by-year-results/",
        summary:
          "The organiser’s marathon winners archive records Sam Montclair and Casey Mulroy as the 2025 champions. Half-marathon and 8K winners are listed separately.",
        categories: [
          {
            category: "Male",
            summary: "Sam Montclair won in 2:20:15.",
            sourceUrl: "https://www.richmondmarathon.org/results/past-winners/",
          },
          {
            category: "Female",
            summary: "Casey Mulroy won in 2:44:36.",
            sourceUrl: "https://www.richmondmarathon.org/results/past-winners/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.richmondmarathon.org/races/marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.richmondmarathon.org/results/year-by-year-results/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.richmondmarathon.org/results/past-winners/",
      },
    ],
    fieldSize: {
      display: "About 5,000",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Richmond+Marathon",
      note: "Rounded from 4,943 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
    nextDateNote: "A 2027 marathon date has not yet been verified from the organiser.",
  },
  {
    slug: "walt-disney-world-marathon-usa",
    name: "Walt Disney World Marathon",
    country: "usa",
    city: "Walt Disney World Resort",
    region: "Florida",
    timeZone: "America/New_York",
    officialUrl:
      "https://www.rundisney.com/events/disneyworld/disneyworld-marathon-weekend/events/marathon/",
    description:
      "The Walt Disney World Marathon follows resort roads as the full-distance race in runDisney’s Marathon Weekend. General registration and charity opportunities have separate conditions, and the edition-specific guide sets out the course. Take care when comparing past results: the 2026 course was modified because of inclement weather and warmer-than-usual temperatures, with all participants included in the marathon results. The archive also covers age-group, wheelchair, hand-cycle and duo categories, alongside the weekend’s separate races and challenges.",
    course: {
      summary:
        "Road marathon within Walt Disney World Resort; consult the edition-specific course guide.",
      surface: "Road",
      profile: "Resort roads; current course map to be checked.",
      links: [
        {
          label: "Official course and race information",
          url: "https://www.rundisney.com/events/disneyworld/disneyworld-marathon-weekend/events/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "runDisney registration",
        description:
          "Use the official full-marathon listing for registration status and available entry options.",
        url: "https://www.rundisney.com/events/disneyworld/disneyworld-marathon-weekend/events/marathon/",
      },
      {
        name: "Charity bib through Humane World for Animals",
        description:
          "The charity offers 2027 full-marathon bibs by application. Its published $242 registration fee counts toward a $1,500 fundraising commitment; availability is subject to approval.",
        url: "https://www.humaneworld.org/en/events/2026-2027-rundisney-races",
      },
    ],
    editions: [
      {
        date: "2027-01-10",
        sourceUrl: "https://www.humaneworld.org/en/events/2026-2027-rundisney-races",
      },
    ],
    media: [],
    resultsUrl: "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/",
        summary:
          "The official timer warns that the marathon course was modified because of inclement weather, including unusually warm temperatures. Results include all participants, so this edition should not be used as a like-for-like full-distance field-size or performance comparison.",
        categories: [
          {
            category: "MEN -- OPEN",
            summary: "Matt Hensley led the open men in 2:29:37 clock and net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=1B&Ind=0",
          },
          {
            category: "WOMEN -- OPEN",
            summary: "Brittany Charboneau led the open women in 2:54:48 clock and net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=1G&Ind=1",
          },
          {
            category: "WHEELCHAIR -- MEN PUSH RIM",
            summary: "Brian Siemann ranked first, with 1:54:19 clock time and 1:54:17 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZU&Ind=0",
          },
          {
            category: "WHEELCHAIR -- WOMEN PUSH RIM",
            summary: "Heather Sealover ranked first, with 2:12:44 clock time and 2:12:41 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZV&Ind=0",
          },
          {
            category: "WHEELCHAIR -- MEN HAND CYCLE",
            summary: "Nicholas McCoy ranked first, with 1:39:25 clock time and 1:39:23 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZW&Ind=0",
          },
          {
            category: "WHEELCHAIR -- WOMEN HAND CYCLE",
            summary:
              "Linden Williamson ranked first, with 1:39:25 clock time and 1:39:22 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZX&Ind=0",
          },
          {
            category: "DUO DIVISION",
            summary: "Kyle Pease ranked first, with 2:59:42 clock time and 2:59:35 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZY&Ind=0",
          },
          {
            category: "MEN -- 18 THROUGH 24",
            summary: "Alec Troxell ranked first, with 2:49:58 clock time and 2:49:55 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=E&Ind=0",
          },
          {
            category: "MEN -- 25 THROUGH 29",
            summary: "Brendan Twiggs ranked first, with 2:52:06 clock time and 2:51:56 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=F&Ind=0",
          },
          {
            category: "MEN -- 30 THROUGH 34",
            summary: "Jose Ancona ranked first, with 2:41:24 clock time and 2:41:15 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=G&Ind=0",
          },
          {
            category: "MEN -- 35 THROUGH 39",
            summary: "Nicholas Jollye ranked first, with 2:39:00 clock time and 2:38:57 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=H&Ind=0",
          },
          {
            category: "MEN -- 40 THROUGH 44",
            summary: "John Huber ranked first, with 2:46:22 clock time and 2:46:19 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=I&Ind=0",
          },
          {
            category: "MEN -- 45 THROUGH 49",
            summary: "Fredison Costa ranked first, with 2:41:14 clock time and 2:41:13 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=J&Ind=0",
          },
          {
            category: "MEN -- 50 THROUGH 54",
            summary: "Marc Burget ranked first, with 2:49:33 clock time and 2:49:31 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=K&Ind=0",
          },
          {
            category: "MEN -- 55 THROUGH 59",
            summary: "Boris Jersch ranked first, with 3:20:46 clock time and 3:20:32 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=L&Ind=0",
          },
          {
            category: "MEN -- 60 THROUGH 64",
            summary: "Jim Capron ranked first, with 3:37:28 clock time and 3:36:13 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=M&Ind=0",
          },
          {
            category: "MEN -- 65 THROUGH 69",
            summary: "Paul Bish ranked first, with 3:26:19 clock time and 3:26:07 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=MA&Ind=0",
          },
          {
            category: "MEN -- 70 THROUGH 74",
            summary: "Alan Mitleider ranked first, with 4:56:33 clock time and 4:56:08 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=N&Ind=0",
          },
          {
            category: "MEN -- 75 THROUGH 79",
            summary: "Douglas Hicks ranked first, with 5:15:02 clock time and 5:01:41 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=NA&Ind=0",
          },
          {
            category: "MEN -- 80 AND OVER",
            summary: "James Fell ranked first, with 7:10:21 clock time and 6:56:45 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=NB&Ind=0",
          },
          {
            category: "WOMEN -- 18 THROUGH 24",
            summary: "Kelly Lynch ranked first, with 3:10:38 clock time and 3:10:20 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=S&Ind=0",
          },
          {
            category: "WOMEN -- 25 THROUGH 29",
            summary: "Emma Bradshaw ranked first, with 3:19:30 clock time and 3:19:08 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=SA&Ind=0",
          },
          {
            category: "WOMEN -- 30 THROUGH 34",
            summary:
              "Mandy Kompanowski ranked first, with 3:13:44 clock time and 3:13:40 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=U&Ind=0",
          },
          {
            category: "WOMEN -- 35 THROUGH 39",
            summary: "Emily Hensel ranked first, with 3:06:39 clock time and 3:06:37 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=V&Ind=0",
          },
          {
            category: "WOMEN -- 40 THROUGH 44",
            summary: "Georganne Watson ranked first, with 3:02:46 clock time and 3:02:44 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=W&Ind=0",
          },
          {
            category: "WOMEN -- 45 THROUGH 49",
            summary: "Leah Foley ranked first, with 3:09:31 clock time and 3:09:28 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=X&Ind=0",
          },
          {
            category: "WOMEN -- 50 THROUGH 54",
            summary: "Angie Hinkle ranked first, with 3:24:51 clock time and 3:23:44 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=Y&Ind=0",
          },
          {
            category: "WOMEN -- 55 THROUGH 59",
            summary: "Michele Lynch ranked first, with 3:42:35 clock time and 3:41:11 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=Z&Ind=0",
          },
          {
            category: "WOMEN -- 60 THROUGH 64",
            summary: "Elissa Gielen ranked first, with 3:55:00 clock time and 3:54:51 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZA&Ind=0",
          },
          {
            category: "WOMEN -- 65 THROUGH 69",
            summary: "Barbra Fagan ranked first, with 4:43:47 clock time and 4:42:28 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZB&Ind=0",
          },
          {
            category: "WOMEN -- 70 THROUGH 74",
            summary: "Deborah Lazaroff ranked first, with 4:07:18 clock time and 4:04:01 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZC&Ind=0",
          },
          {
            category: "WOMEN -- 75 THROUGH 79",
            summary:
              "Terezinha Goularte ranked first, with 5:14:59 clock time and 5:03:22 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZD&Ind=0",
          },
          {
            category: "WOMEN -- 80 AND OVER",
            summary: "Kathryn Koontz ranked first, with 7:34:55 clock time and 7:33:38 net time.",
            sourceUrl:
              "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php?Link=161&Type=2&Div=ZE&Ind=0",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.rundisney.com/events/disneyworld/disneyworld-marathon-weekend/events/marathon/",
      },
      {
        label: "Results archive",
        url: "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/",
      },
      {
        label: "Completed-race report and categories",
        url: "https://www.trackshackresults.com/disneysports/results/wdw/wdw26/mar_results.php",
      },
      {
        label: "2027 date and charity bib conditions",
        url: "https://www.humaneworld.org/en/events/2026-2027-rundisney-races",
      },
    ],
    fieldSize: {
      display: "About 12,500",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://www.trackshackresults.com/disneysports/results/wdw/wdw25/mar_results.php",
      note: "Based on 12,532 official full-marathon finishers in 2025. The 2026 course was modified because of the weather, so its combined results are not used for this full-distance comparison.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "rock-n-roll-san-diego-marathon-usa",
    name: "Rock ’n’ Roll San Diego Marathon",
    country: "usa",
    city: "San Diego",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.runrocknroll.com/events/san-diego",
    description:
      "The Rock ’n’ Roll San Diego Marathon follows a road route from the Balboa Park area towards downtown, with entertainment along the course. San Diego was the series’ original location when the event began in 1998. General registration and charity opportunities are linked through the official event site. Check the full-marathon course map and entry option when planning your race, as the weekend also includes a half marathon and 5K with their own results.",
    course: {
      summary: "Road route from the Balboa Park area to downtown San Diego.",
      surface: "Road",
      profile: "City road course.",
      links: [
        {
          label: "Full-marathon course and map",
          url: "https://www.runrocknroll.com/events/san-diego/course-overview",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description: "Use the organiser’s registration overview and select the full marathon.",
        url: "https://www.runrocknroll.com/events/san-diego",
      },
      {
        name: "Charity programme",
        description:
          "The series links its official charity programme from the event page; partner terms and places vary.",
        url: "https://www.runrocknroll.com/events/san-diego",
      },
    ],
    editions: [
      {
        date: "2027-06-06",
        sourceUrl: "https://www.runrocknroll.com/events/san-diego/register",
      },
    ],
    media: [
      {
        label: "2026 Times of San Diego race report",
        url: "https://timesofsandiego.com/sports/2026/05/31/san-diegos-sara-bagnell-wins-womens-rock-n-roll-marathon/",
        kind: "news",
      },
      {
        label: "2025 official race highlights",
        url: "https://www.runrocknroll.com/news/2025-rock-n-roll-san-diego-highlights",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.runrocknroll.com/events/san-diego/results",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://www.runrocknroll.com/events/san-diego/results",
        summary:
          "Times of San Diego reported that Isaac Hernandez and Sara Bagnell won the 2026 full marathon. Its local race report gives their times as 2:28:54 and 2:57:46 respectively.",
        categories: [
          {
            category: "Men’s Marathon",
            summary: "Times of San Diego reported Isaac Hernandez as the winner in 2:28:54.",
            sourceUrl:
              "https://timesofsandiego.com/sports/2026/05/31/san-diegos-sara-bagnell-wins-womens-rock-n-roll-marathon/",
          },
          {
            category: "Women’s Marathon",
            summary: "Times of San Diego reported Sara Bagnell as the winner in 2:57:46.",
            sourceUrl:
              "https://timesofsandiego.com/sports/2026/05/31/san-diegos-sara-bagnell-wins-womens-rock-n-roll-marathon/",
          },
        ],
        date: "2026-05-31",
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://www.runrocknroll.com/events/san-diego",
      },
      {
        label: "Results archive",
        url: "https://www.runrocknroll.com/events/san-diego/results",
      },
      {
        label: "2027 full-marathon registration and date",
        url: "https://www.runrocknroll.com/events/san-diego/register",
      },
      {
        label: "2026 local news report",
        url: "https://timesofsandiego.com/sports/2026/05/31/san-diegos-sara-bagnell-wins-womens-rock-n-roll-marathon/",
      },
    ],
    fieldSize: {
      display: "About 6,700",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl:
        "https://www.findmymarathon.com/race-detail.php?zname=Rock+n+Roll+San+Diego+Marathon",
      note: "Rounded from 6,657 full-marathon finishers reported by FindMyMarathon for 2026.",
    },
    checkedAt: "2026-09-26",
  },
];
