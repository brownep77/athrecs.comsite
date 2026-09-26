import type { RoadMarathon } from "./types";

const austinResults = "https://www.mychiptime.com/searchevent.php?id=17035";
const austinReport =
  "https://youraustinmarathon.com/austin-marathon-marks-35th-anniversary-with-largest-field-in-event-history/";
const miamiReport =
  "https://news.lifetime.life/2026-01-25-Life-Time-Miami-Marathon-Half-Delivers-an-Unforgettable-Weekend-for-More-Than-17,000-Runners";
const shamrockReport =
  "https://www.runningusa.org/industry-news/sun-sand-sellouts-inside-the-sold-out-2026-yuengling-shamrock-marathon-weekend/";

export const USA_SOUTH_ADDITIONS: RoadMarathon[] = [
  {
    slug: "austin-marathon-usa",
    name: "Austin Marathon",
    country: "usa",
    city: "Austin",
    region: "Texas",
    timeZone: "America/Chicago",
    officialUrl: "https://youraustinmarathon.com/",
    description:
      "Austin Marathon runs through the Texas capital on a hilly road course, linking South Congress, the university area and East Austin. The start and finish are on Congress Avenue, with the closing miles heading towards the State Capitol. Live music adds to the setting, though it cannot do much about the gradients. General entry is available subject to places remaining, alongside the Austin Marathon Gives charity programme. Each runner must collect their own packet at the expo.",
    course: {
      summary:
        "Starts at 2nd Street and Congress Avenue and finishes at 9th Street and Congress Avenue, with a route through South Congress, the university area and East Austin.",
      surface: "Road",
      profile: "Rolling and hilly city course.",
      links: [
        {
          label: "Course map, elevation profile and GPX",
          url: "https://youraustinmarathon.com/course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry",
        description:
          "Choose the 26.2-mile marathon through the organiser’s EventDog registration link. Entry remains subject to availability.",
        url: "https://youraustinmarathon.com/registration/",
      },
      {
        name: "Charity fundraising",
        description:
          "Austin Marathon Gives connects runners with official charities. Arrange fundraising with the selected organisation and complete the required race registration.",
        url: "https://youraustinmarathon.com/austinmarathongives/",
      },
    ],
    editions: [{ date: "2027-02-14", sourceUrl: austinReport }],
    fieldSize: {
      display: "About 7,300",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Austin+Marathon",
      note: "Rounded from the 7,295 full-marathon finishers reported by FindMyMarathon. This excludes the half marathon and 5K.",
    },
    practical: [
      {
        label: "Course time limit",
        value: "Seven hours, with a required average pace of approximately 16 minutes per mile.",
        sourceUrl: "https://youraustinmarathon.com/course/",
      },
      {
        label: "Race-number collection",
        value: "Each participant must collect their own packet at the Health & Fitness Expo.",
        sourceUrl: "https://youraustinmarathon.com/registration/",
      },
    ],
    media: [{ label: "2026 organiser’s race report", url: austinReport, kind: "news" }],
    resultsUrl: "https://youraustinmarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-15",
        resultsUrl: austinResults,
        summary:
          "The 35th Austin Marathon produced course records for Joseph Whelan and Kellyn Taylor. The organiser’s report records Whelan’s third victory in Austin; the timing archive provides individual marathon results and division standings.",
        categories: [
          {
            category: "Men",
            summary:
              "Joseph Whelan won in 2:13:18, ahead of Elisha Barno in 2:14:26 and Benard Rotich in 2:23:33.",
            sourceUrl: austinReport,
          },
          {
            category: "Women",
            summary:
              "Kellyn Taylor won in 2:33:28. Sarah Jackson finished second in 2:46:11 and Joy Jiang third in 2:50:23.",
            sourceUrl: austinReport,
          },
        ],
      },
    ],
    sources: [
      {
        label: "Registration and participant requirements",
        url: "https://youraustinmarathon.com/registration/",
      },
      {
        label: "Official course guide",
        url: "https://youraustinmarathon.com/your-guide-to-the-austin-marathon-course/",
      },
      { label: "Maps and course support", url: "https://youraustinmarathon.com/course/" },
      { label: "2026 marathon timing results", url: austinResults },
      { label: "2026 recap and 2027 date", url: austinReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "miami-marathon-usa",
    name: "Life Time Miami Marathon",
    country: "usa",
    city: "Miami",
    region: "Florida",
    timeZone: "America/New_York",
    officialUrl: "https://www.themiamimarathon.com/",
    description:
      "Miami Marathon links Miami and Miami Beach on a mainly flat road loop across Biscayne Bay, finishing at Bayfront Park. Causeways and bridges interrupt the flat stretches and open up the waterfront views. General entry for 2027 was sold out by 26 September 2026; the official waitlist closes on 30 September, with invitations dependent on places becoming available. Selected charity teams offer another possible route in. The course limit is seven hours after the final wave starts.",
    course: {
      summary:
        "A single loop through Miami and Miami Beach, crossing Biscayne Bay and returning to a finish at Bayfront Park.",
      surface: "Road",
      profile: "Mainly flat with causeway and bridge crossings.",
      links: [
        {
          label: "Marathon course map and support information",
          url: "https://www.themiamimarathon.com/course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry and official waitlist",
        description:
          "As checked on 26 September 2026, general entry for 2027 was sold out. The waitlist closes on 30 September; random selections begin on 5 October as places become available, with 48 hours to claim an invitation.",
        url: "https://www.themiamimarathon.com/registration/",
      },
      {
        name: "Official charity teams",
        description:
          "Contact an approved charity team about its allocated places and fundraising requirements. The Life Time Foundation advertised a limited number of 2027 charity places at the September review.",
        url: "https://www.themiamimarathon.com/groups-charities/",
      },
      {
        name: "Elite athlete application",
        description:
          "Apply with linked race performances for consideration under the elite programme. The published 2027 deadline is 17 January; an application does not guarantee acceptance.",
        url: "https://www.themiamimarathon.com/elite-program/",
      },
    ],
    editions: [{ date: "2027-01-31", sourceUrl: "https://www.themiamimarathon.com/marathon/" }],
    fieldSize: {
      display: "About 3,300",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Miami+Marathon",
      note: "Rounded from the 3,251 full-marathon finishers reported by FindMyMarathon. This is a recent-edition estimate, not an average or a combined weekend total.",
    },
    practical: [
      {
        label: "Minimum age",
        value: "16 on race day; entrants under 18 need a parent or guardian’s waiver.",
        sourceUrl: "https://www.themiamimarathon.com/faqs/",
      },
      {
        label: "Course time limit",
        value:
          "Seven hours after the final wave starts, with roads reopening and support withdrawing behind the cutoff pace.",
        sourceUrl: "https://www.themiamimarathon.com/faqs/",
      },
      {
        label: "Expo dates",
        value:
          "29–30 January 2027; check the organiser’s packet-collection requirements before travelling.",
        sourceUrl: "https://www.themiamimarathon.com/faqs/",
      },
    ],
    media: [
      { label: "2026 Life Time race report", url: miamiReport, kind: "news" },
      {
        label: "Official race photographs",
        url: "https://www.themiamimarathon.com/results/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.themiamimarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-01-25",
        resultsUrl: "https://www.themiamimarathon.com/results/",
        summary:
          "Dominic Ondoro and Florida’s Christina Welsh took the elite marathon titles at the 24th edition. The organiser’s results archive separates the full marathon from the accompanying half marathon and provides links to individual performances and photographs.",
        categories: [
          {
            category: "Elite men",
            summary:
              "Dominic Ondoro won in 2:17:47. Bradley Makuvire was second in 2:20:12 and Ederson Vilela Pereira third in 2:21:18.",
            sourceUrl: miamiReport,
          },
          {
            category: "Elite women",
            summary:
              "Christina Welsh won in 2:42:14, followed by Ellie Stevens in 2:45:43 and Hanna Hauschild in 2:52:27.",
            sourceUrl: miamiReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Marathon date and information", url: "https://www.themiamimarathon.com/marathon/" },
      {
        label: "Entry and waitlist policies",
        url: "https://www.themiamimarathon.com/registration/",
      },
      { label: "Course", url: "https://www.themiamimarathon.com/course/" },
      { label: "2026 organiser report", url: miamiReport },
      { label: "Results archive", url: "https://www.themiamimarathon.com/results/" },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "donna-marathon-usa",
    name: "DONNA Marathon",
    country: "usa",
    city: "Jacksonville Beach",
    region: "Florida",
    timeZone: "America/New_York",
    officialUrl: "https://breastcancermarathon.com/",
    description:
      "The DONNA Marathon follows a flat road course through northeast Florida’s beach communities, starting at Seawalk Pavilion in Jacksonville Beach. Its purpose is breast-cancer fundraising, and the 2027 edition marks the event’s 20th running. Marathon runners share the opening 13 miles with the half marathon before turning to repeat the course. Direct online entry is available for the full distance. Pace groups and a seven-hour limit help with planning, while entries are non-refundable and cannot be transferred to another person.",
    course: {
      summary:
        "Starts at Seawalk Pavilion in Jacksonville Beach. The marathon and half marathon share the first 13 miles, then marathon runners turn to repeat the course.",
      surface: "Road",
      profile: "Flat, two-lap course through the beach communities.",
      links: [
        {
          label: "Official interactive course maps",
          url: "https://breastcancermarathon.com/the-course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry",
        description:
          "Register for the Breast Cancer Marathon through the official RunSignUp page. Select the in-person full marathon; virtual events and weekend challenges have separate registrations.",
        url: "https://breastcancermarathon.com/races-challenges/marathon/",
      },
    ],
    editions: [
      {
        date: "2027-02-07",
        sourceUrl: "https://breastcancermarathon.com/races-challenges/marathon/",
      },
    ],
    fieldSize: {
      display: "About 850",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Donna+Marathon",
      note: "Rounded from the 861 full-marathon finishers reported by FindMyMarathon. This excludes the half marathon and other weekend events.",
    },
    practical: [
      {
        label: "2027 start",
        value:
          "7:30 am local time at Jacksonville Beach Seawalk Pavilion; the athletes’ village opens at 6:00 am.",
        sourceUrl: "https://breastcancermarathon.com/races-challenges/marathon/",
      },
      {
        label: "Course time limit",
        value:
          "Seven hours, equivalent to approximately 16 minutes per mile for the full marathon.",
        sourceUrl: "https://breastcancermarathon.com/the-course/",
      },
      {
        label: "Entry changes",
        value:
          "Fees are non-refundable and entries cannot be transferred to another person. Distance changes are managed through RunSignUp under the event’s published conditions.",
        sourceUrl: "https://breastcancermarathon.com/races-challenges/",
      },
    ],
    media: [
      {
        label: "20th-running announcement",
        url: "https://thedonnafoundation.org/donna-marathon-weekend-celebrates-20th-running-in-2027/",
        kind: "news",
      },
      {
        label: "Official race photographs and video links",
        url: "https://breastcancermarathon.com/race-results-photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://breastcancermarathon.com/race-results-photos/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-02-01",
        resultsUrl: "https://my.raceresult.com/380155/results",
        summary:
          "The 2026 marathon took place at Jacksonville Beach on 1 February. Its Sunday timing archive covers the marathon and half marathon, while the organiser’s archive links previous editions and race photographs.",
        categories: [],
      },
    ],
    sources: [
      {
        label: "2027 marathon",
        url: "https://breastcancermarathon.com/races-challenges/marathon/",
      },
      { label: "Course and time limit", url: "https://breastcancermarathon.com/the-course/" },
      { label: "Registration rules", url: "https://breastcancermarathon.com/races-challenges/" },
      {
        label: "Official results archive",
        url: "https://breastcancermarathon.com/race-results-photos/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "shamrock-marathon-usa",
    name: "Yuengling Shamrock Marathon",
    country: "usa",
    city: "Virginia Beach",
    region: "Virginia",
    timeZone: "America/New_York",
    officialUrl: "https://www.shamrockmarathon.com/",
    description:
      "Shamrock Marathon is a coastal road race in Virginia Beach, finishing on the paved boardwalk near the King Neptune statue. The predominantly flat route heads north along Shore Drive before returning through the resort area and crossing Rudee Inlet. Runners can enter the marathon directly or choose the Whale Challenge, which adds Saturday’s 8K. That needs its own challenge registration; doing the extra running does not, by itself, complete the paperwork. Charity participation is also available through registration.",
    course: {
      summary:
        "Heads north along Shore Drive beside First Landing State Park, returns through the resort area and across Rudee Inlet, then finishes on the Virginia Beach Boardwalk near King Neptune.",
      surface: "Road and paved boardwalk",
      profile: "Predominantly flat coastal route with a bridge crossing.",
      links: [
        {
          label: "Marathon course and race information",
          url: "https://www.shamrockmarathon.com/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry",
        description:
          "Follow the organiser’s Register link and select the marathon in the official Let’s Do This checkout.",
        url: "https://www.shamrockmarathon.com/",
      },
      {
        name: "Whale Challenge",
        description:
          "Enter the combined Saturday 8K and Sunday marathon through the Whale Challenge option. Registering separately for the two races does not qualify as a challenge entry.",
        url: "https://www.shamrockmarathon.com/dolphinwhale-challenge/",
      },
      {
        name: "Run for charity",
        description:
          "Choose a participating charity during registration; the charity then contacts you about its fundraising arrangements.",
        url: "https://www.shamrockmarathon.com/run-for-charity/",
      },
    ],
    editions: [{ date: "2027-03-21", sourceUrl: "https://www.shamrockmarathon.com/marathon/" }],
    fieldSize: {
      display: "About 2,400",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Shamrock+Marathon",
      note: "Rounded from the 2,435 full-marathon finishers reported by FindMyMarathon. This excludes the half marathon, 8K and children’s events.",
    },
    practical: [
      {
        label: "2027 start",
        value: "7:30 am local time on Sunday 21 March.",
        sourceUrl: "https://www.shamrockmarathon.com/marathon/",
      },
    ],
    media: [
      { label: "J&A Racing’s 2026 recap via Running USA", url: shamrockReport, kind: "news" },
      {
        label: "Official race photograph archive",
        url: "https://www.shamrockmarathon.com/photos/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.shamrockmarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-22",
        resultsUrl: "https://www.shamrockmarathon.com/results/",
        summary:
          "Addison Allshouse and Emma Somers won the marathon titles during a sold-out Shamrock weekend. J&A Racing’s published recap identifies the marathon winners separately from the half marathon and 8K; the results archive links the detailed standings.",
        categories: [
          {
            category: "Men",
            summary: "Addison Allshouse won the marathon in 2:26:06.",
            sourceUrl: shamrockReport,
          },
          {
            category: "Women",
            summary: "Emma Somers won the marathon in 2:57:13.",
            sourceUrl: shamrockReport,
          },
        ],
      },
    ],
    sources: [
      {
        label: "2027 marathon course and start",
        url: "https://www.shamrockmarathon.com/marathon/",
      },
      {
        label: "Challenge registration",
        url: "https://www.shamrockmarathon.com/dolphinwhale-challenge/",
      },
      { label: "Official results archive", url: "https://www.shamrockmarathon.com/results/" },
      { label: "Organiser’s 2026 recap", url: shamrockReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "little-rock-marathon-usa",
    name: "Little Rock Marathon",
    country: "usa",
    city: "Little Rock",
    region: "Arkansas",
    timeZone: "America/Chicago",
    officialUrl: "https://littlerockmarathon.com/",
    description:
      "Little Rock Marathon follows a hilly road course through Arkansas’s capital, starting and finishing on LaHarpe Boulevard behind the Statehouse Convention Center. Its oversized medal is a familiar feature, but the start arrangements deserve closer attention when entering. The general start allows six hours. Runners expecting to take six to eight hours must obtain approval for the early start, and may need supporting race times. General registration is through the organiser’s online entry service.",
    course: {
      summary:
        "A city road course beginning and ending on LaHarpe Boulevard behind the Statehouse Convention Center.",
      surface: "Road",
      profile: "Undulating city route with hills.",
      links: [
        {
          label: "Course maps and turn-by-turn instructions",
          url: "https://littlerockmarathon.com/course/",
        },
      ],
    },
    entryMethods: [
      {
        name: "Direct online entry",
        description:
          "Register for the full marathon through the organiser’s Race Roster entry page, selecting the correct distance and participant options.",
        url: "https://littlerockmarathon.raceroster.com/",
      },
      {
        name: "Approved early-start entry",
        description:
          "Marathon entrants expecting six to eight hours can request approval for the early start. This is not an optional start for faster runners; the organiser may request supporting race times.",
        url: "https://littlerockmarathon.com/marathon/",
      },
    ],
    editions: [{ date: "2027-03-07", sourceUrl: "https://littlerockmarathon.com/marathon/" }],
    fieldSize: {
      display: "About 1,200",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Little+Rock+Marathon",
      note: "Rounded from the 1,208 full-marathon finishers reported by FindMyMarathon. This is a recent-edition estimate rather than a multi-year average.",
    },
    practical: [
      {
        label: "2027 starts",
        value:
          "5:00 am approved early start; 6:55 am wheelchair and handcycle; 7:00 am general start. All times are local.",
        sourceUrl: "https://littlerockmarathon.com/marathon/",
      },
      {
        label: "Minimum age",
        value: "16 on race day for the full marathon.",
        sourceUrl: "https://littlerockmarathon.com/registration/",
      },
    ],
    media: [
      {
        label: "Official photographs and videos",
        url: "https://littlerockmarathon.com/photo-gallery/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://littlerockmarathon.com/results/",
    pastEditions: [
      {
        year: 2026,
        resultsUrl: "https://littlerockmarathon.com/results/",
        summary:
          "The organiser’s winners archive records Benjamin Williams, Holly Moser and Larry Little as the 2026 marathon division winners. Its results archive links available historical standings.",
        categories: [
          {
            category: "Men",
            summary: "Benjamin Williams won in the organiser’s published time of 2:32:07.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
          {
            category: "Women",
            summary: "Holly Moser won in 2:53:23.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
          {
            category: "Non-Binary",
            summary: "Larry Little won in 4:50:40.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
        ],
      },
      {
        year: 2025,
        resultsUrl: "https://littlerockmarathon.com/results/",
        summary:
          "Aaron Soltmann, Stefanie Rodell and Daniel Deuhs led the three marathon divisions in 2025.",
        categories: [
          {
            category: "Men",
            summary: "Aaron Soltmann won in 2:32:20.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
          {
            category: "Women",
            summary: "Stefanie Rodell won in 3:10:58.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
          {
            category: "Non-Binary",
            summary: "Daniel Deuhs won in 3:03:28.",
            sourceUrl: "https://littlerockmarathon.com/marathon/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Marathon date, starts and winners",
        url: "https://littlerockmarathon.com/marathon/",
      },
      { label: "Course information", url: "https://littlerockmarathon.com/course/" },
      { label: "Registration requirements", url: "https://littlerockmarathon.com/registration/" },
      { label: "Official results archive", url: "https://littlerockmarathon.com/results/" },
    ],
    checkedAt: "2026-09-26",
  },
];
