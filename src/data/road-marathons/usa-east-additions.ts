import type { RoadMarathon } from "./types";

// Official organiser and timing evidence checked on 26 September 2026.
export const USA_EAST_ADDITIONS: RoadMarathon[] = [
  {
    slug: "pittsburgh-marathon-usa",
    name: "DICK’S Sporting Goods Pittsburgh Marathon",
    country: "usa",
    city: "Pittsburgh",
    region: "Pennsylvania",
    timeZone: "America/New_York",
    officialUrl: "https://www.thepittsburghmarathon.com/",
    description:
      "Pittsburgh Marathon is a hilly road race through the Pennsylvania city’s neighbourhoods and across its rivers. The bridges provide landmarks; the climbs provide a reason to be sensible in the opening miles. General registration and the Run for a Reason charity programme offer routes into the race. For 2027, the organiser’s course details remain subject to change, so use the latest map when planning your pace and where supporters should stand.",
    course: {
      summary:
        "A city road course through Pittsburgh, with river crossings and neighbourhood sections.",
      surface: "Road",
      profile:
        "Hilly urban route; the organiser currently links its 2026 maps and marks 2027 course details as subject to change.",
      links: [
        {
          label: "Official course maps and support information",
          url: "https://www.thepittsburghmarathon.com/pages/course-information",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry",
        description: "Register through the organiser’s Race Roster link for the full marathon.",
        url: "https://p3r.org/races/dick-s-sporting-goods-pittsburgh-marathon",
      },
      {
        name: "Run for a Reason charity entry",
        description:
          "Choose an official charity and follow its registration and fundraising arrangements.",
        url: "https://p3r.org/programs/run-for-a-reason",
      },
    ],
    editions: [
      {
        date: "2027-05-02",
        sourceUrl: "https://p3r.org/races/dick-s-sporting-goods-pittsburgh-marathon",
      },
    ],
    media: [
      {
        label: "2026 organiser race report",
        url: "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
        kind: "news",
      },
    ],
    resultsUrl: "https://www.thepittsburghmarathon.com/results",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-03",
        resultsUrl: "https://www.thepittsburghmarathon.com/results",
        summary:
          "Will Loevner won a close men’s race, finishing 12 seconds ahead of Jared Ward. Jane Bareikis secured her third consecutive women’s title. The organiser also reported masters, Pennsylvania-resident and handcycle leaders.",
        categories: [
          {
            category: "Men",
            summary: "Will Loevner won in 2:14:52; Jared Ward followed in 2:15:04.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Women",
            summary: "Jane Bareikis won in 2:30:34, ahead of Morgan Jensen in 2:39:23.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Masters men",
            summary: "Donnie Cowart received the masters award with 2:22:05.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Masters women",
            summary: "Lauren Reasoner received the masters award with 2:59:25.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Fastest Pennsylvania man",
            summary: "Will Loevner received the Pennsylvania-resident award with 2:14:52.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Fastest Pennsylvania woman",
            summary: "Nicole Keeley received the Pennsylvania-resident award with 3:07:34.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Handcycle men",
            summary: "Marshall Tempest won in 1:40:16.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
          {
            category: "Handcycle women",
            summary: "Heidi Stark led the published division in 3:04:15.",
            sourceUrl:
              "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
          },
        ],
      },
    ],
    sources: [
      {
        label: "2027 weekend schedule and registration",
        url: "https://p3r.org/races/dick-s-sporting-goods-pittsburgh-marathon",
      },
      {
        label: "Course information",
        url: "https://www.thepittsburghmarathon.com/pages/course-information",
      },
      {
        label: "Official charity programme",
        url: "https://p3r.org/programs/run-for-a-reason",
      },
      {
        label: "2026 organiser race report",
        url: "https://p3r.org/blog/record-52-000-runners-cross-the-finish-line-in-historic-dick-s-sporting-goods-pittsburgh-marathon-weekend-news-post",
      },
      {
        label: "Results",
        url: "https://www.thepittsburghmarathon.com/results",
      },
    ],
    fieldSize: {
      display: "About 5,000",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl: "https://www.findmymarathon.com/race-detail.php?zname=Pittsburgh+Marathon",
      note: "Rounded from 5,024 full-marathon finishers reported by FindMyMarathon for 2026.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "Race day",
        value: "The full marathon is on Sunday, 2 May 2027; Saturday hosts other distances.",
        sourceUrl: "https://p3r.org/races/dick-s-sporting-goods-pittsburgh-marathon",
      },
    ],
  },
  {
    slug: "baltimore-marathon-usa",
    name: "Baltimore Marathon",
    country: "usa",
    city: "Baltimore",
    region: "Maryland",
    timeZone: "America/New_York",
    officialUrl: "https://www.thebaltimoremarathon.com/",
    description:
      "Baltimore Marathon tours the Maryland city on roads and surfaced park sections, finishing beside the Inner Harbor. Federal Hill, Fells Point and the Maryland Zoo feature along the way. Save something for the climbs around miles 16–20; the mostly downhill final five miles arrive after the hills have had their say. Direct registration and charity teams provide entry options, with 2026 online entry closing on 16 October at 6pm, or earlier if places sell out.",
    course: {
      summary:
        "City streets through Federal Hill, Fells Point, the zoo and Lake Montebello, finishing on Pratt Street.",
      surface: "Road and surfaced park sections",
      profile: "Hilly, with climbs around miles 16–20 and a mostly downhill final five miles.",
      links: [
        {
          label: "Course map and elevation chart",
          url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Enter online; 2026 registration closes on 16 October at 6pm local time, or sooner if sold out. Packet-pickup entry may be available.",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
      },
      {
        name: "Run for a Cause charity teams",
        description:
          "Contact an official charity partner for its entry and fundraising conditions.",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/RunforaCause",
      },
    ],
    editions: [
      {
        date: "2026-10-17",
        sourceUrl:
          "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
      },
    ],
    media: [
      {
        label: "Official race news and media updates",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/LatestNews",
        kind: "news",
      },
    ],
    resultsUrl:
      "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Past-Results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-18",
        resultsUrl:
          "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
        summary:
          "Steve Mance and Rachel Cluett led the men’s and women’s marathon standings. Madeline Lohr led the published non-binary category. The summaries below follow the timer’s overall and age-group tables; overall times are gun times and age-group times are chip times.",
        categories: [
          {
            category: "Men — Overall",
            summary: "Steve Mance led the published category in 2:27:18 gun.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — Overall",
            summary: "Rachel Cluett led the published category in 2:53:12 gun.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Non-binary — Overall",
            summary: "Madeline Lohr led the published category in 4:27:44 gun.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 1 - 19",
            summary: "Kenji Ignacio Yamada led the published category in 3:04:16 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 1 - 19",
            summary: "Ashton Layh led the published category in 3:26:38 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 20 - 24",
            summary: "Benjamin Waterman led the published category in 2:47:54 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 20 - 24",
            summary: "Aubrey Schaffer led the published category in 3:11:12 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 25 - 29",
            summary: "Casey Comber led the published category in 2:31:19 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 25 - 29",
            summary: "Hannah Flinchum led the published category in 3:05:52 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 30 - 34",
            summary: "Jordan Christman led the published category in 2:31:46 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 30 - 34",
            summary: "Hannah Betman led the published category in 2:56:41 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 35 - 39",
            summary: "Brian Clapp led the published category in 2:30:49 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 35 - 39",
            summary: "Colleen Shelgren led the published category in 3:27:23 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 40 - 44",
            summary: "Nicolas Crouzier led the published category in 2:30:08 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 40 - 44",
            summary: "Brenda McRae led the published category in 3:09:33 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 45 - 49",
            summary: "Michael Stehling led the published category in 2:56:05 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 45 - 49",
            summary: "Marie-France Vidaver led the published category in 3:19:55 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 50 - 54",
            summary: "Michael Wardian led the published category in 2:37:25 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 50 - 54",
            summary: "Jennifer Hickey led the published category in 3:39:50 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 55 - 59",
            summary: "Jake Byun led the published category in 3:13:55 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 55 - 59",
            summary: "Rebecca Browne led the published category in 3:35:50 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 60 - 64",
            summary: "Akintunde Morakinyo led the published category in 3:29:06 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 60 - 64",
            summary: "Jenny Jaakola led the published category in 4:15:03 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 65 - 69",
            summary: "Tony Maranto led the published category in 3:36:54 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 65 - 69",
            summary: "Hoi King Lui led the published category in 4:54:16 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 70 - 74",
            summary: "Xinghou Ma led the published category in 3:47:48 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Women — 70 - 74",
            summary: "Mary Fout led the published category in 4:55:13 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
          {
            category: "Men — 75 - 99",
            summary: "James Rogers led the published category in 4:51:05 chip.",
            sourceUrl:
              "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Marathon route, entry and race-day information",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
      },
      {
        label: "2025 marathon results",
        url: "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
      },
      {
        label: "Historical results",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Past-Results",
      },
      {
        label: "Charity partners",
        url: "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/RunforaCause",
      },
    ],
    checkedAt: "2026-09-26",
    fieldSize: {
      display: "About 2,000",
      basis: "Results entries",
      year: "2025",
      sourceUrl:
        "https://results.svetiming.com/Corrigan-Sports-Enterprises/events/2025/baltimore-running-festival/results",
      note: "The timer lists 1,962 entrants in the marathon results. This is a rough field indicator, not a count of all festival participants.",
    },
    practical: [
      {
        label: "2026 start",
        value: "8am local time at Russell and Camden Streets.",
        sourceUrl:
          "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
      },
      {
        label: "Course limit",
        value: "Seven hours.",
        sourceUrl:
          "https://www.thebaltimoremarathon.com/Race/TheBaltimoreRunningFestival/Page/Marathon",
      },
    ],
  },
  {
    slug: "hartford-marathon-usa",
    name: "Eversource Hartford Marathon",
    country: "usa",
    city: "Hartford",
    region: "Connecticut",
    timeZone: "America/New_York",
    officialUrl: "https://www.hartfordmarathon.com/eversource-hartford-marathon/",
    description:
      "Hartford Marathon links Connecticut’s capital with West Hartford, East Hartford and South Windsor on roads and paved riverside paths. The State Capitol start and finish beneath the Soldiers and Sailors Memorial Arch bookend a route through Elizabeth Park and across Founders Bridge. There is a six-hour course limit and no race-day bib collection. General registration, approved transfers and elite applications have separate conditions; the free members’ waitlist offers a possibility of entry, rather than a promised place.",
    course: {
      summary:
        "Hartford and West Hartford, then across Founders Bridge through East Hartford and South Windsor, returning to the Memorial Arch.",
      surface: "Road and paved riverside paths",
      profile:
        "City and suburban route with bridge crossings; use the official map for the detailed profile.",
      links: [
        {
          label: "Official marathon map and course preview",
          url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/races/eversource-hartford-marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration and waitlist",
        description:
          "Register through HMF when places are available. Sold-out-event waitlists are available to free HMF Milestone members; joining does not guarantee entry.",
        url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/registration-info/",
      },
      {
        name: "Official participant transfer",
        description:
          "Use HMF’s approved transfer process up to seven days before race day; contact registration for a sold-out event.",
        url: "https://www.hartfordmarathon.com/cancellation-transfer-refund/",
      },
      {
        name: "New England’s Finest and elite programmes",
        description:
          "Eligible competitive runners can apply to the regional or other elite programme under the published edition-specific standards.",
        url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/registration-info/",
      },
    ],
    editions: [
      {
        date: "2026-10-10",
        sourceUrl: "https://www.hartfordmarathon.com/eversource-hartford-marathon/",
      },
    ],
    media: [
      {
        label: "2025 organiser release via Running USA",
        url: "https://www.runningusa.org/industry-news/alex-norstrom-wins-fourth-eversource-hartford-marathon-previous-winner-rachel-schilkowsky-repeats-win/",
        kind: "news",
      },
      {
        label: "Official course preview video",
        url: "https://www.youtube.com/watch?v=-K2PJvsew3Y",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.hartfordmarathon.com/eversource-hartford-marathon/#results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-11",
        resultsUrl: "https://www.athlinks.com/event/1581/results/Event/1123103/Results",
        summary:
          "The organiser’s release, published by Running USA, records Alex Norstrom’s fourth Hartford marathon victory. Rachel Schilkowsky returned to the top of the women’s podium after her 2018 win. Complete division results remain available through the official archive.",
        categories: [
          {
            category: "Men",
            summary: "Alex Norstrom won in 2:19:04.",
            sourceUrl:
              "https://www.runningusa.org/industry-news/alex-norstrom-wins-fourth-eversource-hartford-marathon-previous-winner-rachel-schilkowsky-repeats-win/",
          },
          {
            category: "Women",
            summary: "Rachel Schilkowsky won in 2:38:16, as reported in the organiser’s release.",
            sourceUrl:
              "https://www.runningusa.org/industry-news/alex-norstrom-wins-fourth-eversource-hartford-marathon-previous-winner-rachel-schilkowsky-repeats-win/",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Race schedule and archives",
        url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/",
      },
      {
        label: "Course and rules",
        url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/races/eversource-hartford-marathon/",
      },
      {
        label: "Registration and elite programmes",
        url: "https://www.hartfordmarathon.com/eversource-hartford-marathon/registration-info/",
      },
      {
        label: "2025 official timer event page",
        url: "https://www.gsrs.com/results/5861",
      },
      {
        label: "2025 organiser release",
        url: "https://www.runningusa.org/industry-news/alex-norstrom-wins-fourth-eversource-hartford-marathon-previous-winner-rachel-schilkowsky-repeats-win/",
      },
    ],
    fieldSize: {
      display: "About 1,900",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Hartford+Marathon",
      note: "Rounded from 1,915 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
    practical: [
      {
        label: "2026 start",
        value: "8am local time; wheelchair athletes start at 7:57am.",
        sourceUrl: "https://www.hartfordmarathon.com/eversource-hartford-marathon/",
      },
      {
        label: "Course limit",
        value: "Six hours; minimum marathon age is 16.",
        sourceUrl:
          "https://www.hartfordmarathon.com/eversource-hartford-marathon/races/eversource-hartford-marathon/",
      },
      {
        label: "Packet pickup",
        value: "No race-day registration or bib pickup.",
        sourceUrl:
          "https://www.hartfordmarathon.com/eversource-hartford-marathon/registration-info/",
      },
    ],
  },
  {
    slug: "vermont-city-marathon-usa",
    name: "M&T Bank Vermont City Marathon",
    country: "usa",
    city: "Burlington",
    region: "Vermont",
    timeZone: "America/New_York",
    officialUrl: "https://www.runvermont.org/vermont-city-marathon-relay/",
    description:
      "Vermont City Marathon follows Burlington’s roads and paved lakeside bike path, with views across Lake Champlain towards the Adirondacks. Waterfront Park anchors the two-loop route, which also passes Church Street Marketplace. The proposed 2027 course removes a railway crossing and changes the finish approach, but its preliminary map remains subject to certification. General entry for 2027 opens on 1 October 2026; selected competitive runners can apply through the invited-runner programme.",
    course: {
      summary:
        "Two loops around Burlington, including Church Street Marketplace and the lakeside bike path, starting and finishing at Waterfront Park.",
      surface: "Road and paved bike path",
      profile:
        "Revised two-loop course for 2027, with a downhill approach to the finish; published preliminary map remains subject to certification.",
      links: [
        {
          label: "2027 preliminary course map",
          url: "https://www.runvermont.org/vermont-city-marathon-relay/course-map/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "2027 online registration opens on 1 October 2026 through the organiser’s RunSignup link.",
        url: "https://www.runvermont.org/vermont-city-marathon-relay/register/",
      },
      {
        name: "Invited Runner Program",
        description:
          "Apply to RunVermont with a racing résumé. The published programme offers selected athletes complimentary entry; check the next edition’s application criteria.",
        url: "https://www.runvermont.org/vermont-city-marathon-relay/invited-runners/",
      },
    ],
    editions: [
      {
        date: "2027-05-30",
        sourceUrl: "https://www.runvermont.org/vermont-city-marathon-relay/register/",
      },
    ],
    media: [
      {
        label: "2026 official race photos",
        url: "https://www.sportograf.com/en/event/19531",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.runvermont.org/results/vermont-city-marathon-relay/",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-24",
        resultsUrl:
          "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
        summary:
          "Ryan Smith set a men’s course record with 2:15:53 gun time. Kellyn Taylor led the women in 2:35:19, with Rachel Schilkowsky next in 2:35:51. Jordan Gustafson headed the non-binary standings. Age-division recaps use the timer’s published rankings and chip times.",
        categories: [
          {
            category: "Men overall",
            summary: "Ryan Smith led the published standings in 2:15:53 gun.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M16-24",
            summary: "Ryan Smith led the published division in 2:15:52 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M25-29",
            summary: "Kevin Heeman led the published division in 2:19:25 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M30-34",
            summary: "Alex Archer led the published division in 2:21:25 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M35-39",
            summary: "Johnny Herrick led the published division in 2:26:34 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M40-44",
            summary: "Alexander Grout led the published division in 2:33:06 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "Women overall",
            summary: "Kellyn Taylor led the published standings in 2:35:19 gun.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F35-39",
            summary: "Kellyn Taylor led the published division in 2:35:18 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F30-34",
            summary: "Rachel Schilkowsky led the published division in 2:35:51 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F40-44",
            summary: "Paula Pridgen led the published division in 2:41:29 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M45-49",
            summary: "Neil Martin led the published division in 2:47:22 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F45-49",
            summary: "Heidi Westover led the published division in 2:47:30 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M50-54",
            summary: "Andrew Castaldi led the published division in 2:52:20 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F25-29",
            summary: "Tasha Freed led the published division in 2:52:40 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M65-69",
            summary: "Paul Crochiere led the published division in 3:00:24 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F16-24",
            summary: "Anna Kaigle led the published division in 3:06:01 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M55-59",
            summary: "Paul Sullivan led the published division in 3:15:14 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "Non-binary overall",
            summary: "Jordan Gustafson led the published standings in 3:18:18 gun.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "X30-34",
            summary: "Jordan Gustafson led the published division in 3:18:08 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M60-64",
            summary: "Jeff Shedd led the published division in 3:27:55 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F55-59",
            summary: "Mary Pardi led the published division in 3:28:23 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F50-54",
            summary: "Jennifer Strand led the published division in 3:32:18 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M70-74",
            summary: "Tim Noonan led the published division in 3:55:34 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "X25-29",
            summary: "Beck Morrow led the published division in 4:00:15 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F65-69",
            summary: "Margaret McKeown led the published division in 4:08:24 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F60-64",
            summary: "Eunice Panetta led the published division in 4:12:47 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "X16-24",
            summary: "Holden Parrent led the published division in 4:28:40 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "M75-79",
            summary: "John Volkman led the published division in 5:42:56 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
          {
            category: "F75-79",
            summary: "Celine Blais led the published division in 6:32:18 chip.",
            sourceUrl:
              "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Race overview",
        url: "https://www.runvermont.org/vermont-city-marathon-relay/",
      },
      {
        label: "2027 date and registration",
        url: "https://www.runvermont.org/vermont-city-marathon-relay/register/",
      },
      {
        label: "2027 course map",
        url: "https://www.runvermont.org/vermont-city-marathon-relay/course-map/",
      },
      {
        label: "Burlington bike-path surface",
        url: "https://www.runvermont.org/blog/burlington-running-routes/",
      },
      {
        label: "2026 timing results",
        url: "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
      },
      {
        label: "Historical records",
        url: "https://www.runvermont.org/results/vermont-city-marathon-relay/top-finishersage-groups/",
      },
    ],
    checkedAt: "2026-09-26",
    fieldSize: {
      display: "About 1,500",
      basis: "Finishers",
      year: "2026",
      sourceUrl:
        "https://results.laurelt.com/ver/results?race=167930&event=Marathon&size_172589=100000",
      note: "Counted 1,467 ranked finish rows in the individual marathon table. Relay, virtual and wheelchair event tables are excluded.",
    },
    practical: [
      {
        label: "2027 start",
        value: "7:10am local time at Waterfront Park, with a wave-start arrangement.",
        sourceUrl: "https://www.runvermont.org/vermont-city-marathon-relay/register/",
      },
    ],
  },
  {
    slug: "erie-marathon-usa",
    name: "Erie Marathon at Presque Isle",
    country: "usa",
    city: "Erie",
    region: "Pennsylvania",
    timeZone: "America/New_York",
    officialUrl: "https://eriemarathon.net/",
    description:
      "Erie Marathon runs two paved road loops through Presque Isle State Park in Pennsylvania, beside Lake Erie. The flat course and shaded sections suit runners who prefer a steady rhythm, with the Beach One pavilion serving as the start and finish. Two laps also give the scenery a second chance to register. Entry is online when the next edition opens. Check the announced date before booking travel, and note that entries cannot be refunded, deferred or transferred.",
    course: {
      summary:
        "Two loops of Presque Isle State Park on the old lake road and main road, from the Beach One pavilion.",
      surface: "Paved road",
      profile: "Flat; the organiser notes shaded sections.",
      links: [
        {
          label: "Official course description and race-day arrangements",
          url: "https://eriemarathon.net/race-info-course.html",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online general entry",
        description:
          "Enter through the official RunSignup link once the next race opens. The organiser announces registration updates through its official channels.",
        url: "https://eriemarathon.net/registration.html",
      },
    ],
    editions: [],
    media: [
      {
        label: "Official race photography",
        url: "https://www.runphotos.com/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://eriemarathon.net/results.html",
    pastEditions: [
      {
        year: 2025,
        date: "2025-09-07",
        resultsUrl: "https://www.runhigh.com/2025RESULTS/R090725AA.html",
        summary:
          "The official timer recorded 1,104 finishers. Nate Kawalec and Katie Lembo led the open fields, while Mark Badaracco and Viktoryia Kalesnikava led the masters categories. The division summaries follow the published awards list, which separates open and masters awards from the age groups.",
        categories: [
          {
            category: "Open men",
            summary: "Nate Kawalec led the open men in 2:23:31 clock time (2:23:30 net).",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Open women",
            summary: "Katie Lembo led the open women in 2:51:47 clock time (2:51:39 net).",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Masters Men",
            summary: "Mark Badaracco led the published category in 2:48:42 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Masters Women",
            summary: "Viktoryia Kalesnikava led the published category in 2:58:46 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men Under 20",
            summary: "Oliver Garber led the published category in 2:47:56 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 20 - 24",
            summary: "Sam Duncan led the published category in 2:34:11 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 25 - 29",
            summary: "Nicholas Robinson led the published category in 2:41:12 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 30 - 34",
            summary: "Christopher Zapple led the published category in 2:37:13 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 35 - 39",
            summary: "Omer Abdulrahman led the published category in 2:46:36 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 40 - 44",
            summary: "Matthew Vogel led the published category in 2:55:29 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 45 - 49",
            summary: "Jeffrey Browne led the published category in 2:50:59 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 50 - 54",
            summary: "Jason Homorody led the published category in 2:49:39 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 55 - 59",
            summary: "Tonson Tong led the published category in 2:57:25 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 60 - 64",
            summary: "Sijian Zhang led the published category in 3:23:52 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 65 - 69",
            summary: "Michael Fronsoe led the published category in 3:20:44 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 70 - 74",
            summary: "Luther Isaac led the published category in 3:52:12 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Men 75 - 79",
            summary: "Larry Evans led the published category in 4:19:24 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women Under 20",
            summary: "Thea Bentley led the published category in 4:57:49 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 20 - 24",
            summary: "Morgan Cole led the published category in 2:55:21 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 25 - 29",
            summary: "Macy Putman led the published category in 2:56:11 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 30 - 34",
            summary: "Leila Abraksia led the published category in 3:07:23 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 35 - 39",
            summary: "Ashley Kearcher led the published category in 2:55:48 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 40 - 44",
            summary: "Megan Furrow led the published category in 3:22:24 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 45 - 49",
            summary: "Magna Ayon led the published category in 3:30:36 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 50 - 54",
            summary: "Caroline Bolduc led the published category in 3:14:54 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 55 - 59",
            summary: "Amy Palmer led the published category in 3:43:33 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 60 - 64",
            summary: "Mary Turner DePalma led the published category in 3:48:20 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 65 - 69",
            summary: "Mary Breslin led the published category in 4:19:06 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 70 - 74",
            summary: "Peggy Wise led the published category in 4:40:32 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
          {
            category: "Women 75 - 79",
            summary: "Que Pham led the published category in 5:19:24 net.",
            sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official race information",
        url: "https://eriemarathon.net/",
      },
      {
        label: "Course and race-day information",
        url: "https://eriemarathon.net/race-info-course.html",
      },
      {
        label: "Registration",
        url: "https://eriemarathon.net/registration.html",
      },
      {
        label: "Official results and photography",
        url: "https://eriemarathon.net/results.html",
      },
      {
        label: "2025 finishers and splits",
        url: "https://www.runhigh.com/2025RESULTS/R090725AB.html",
      },
      {
        label: "2025 category results",
        url: "https://www.runhigh.com/2025RESULTS/R090725ABAWARDS.html",
      },
    ],
    checkedAt: "2026-09-26",
    nextDateNote:
      "The 2026 race has passed. A 2027 race date has not yet been confirmed in the checked official information.",
    fieldSize: {
      display: "About 1,100",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://www.runhigh.com/2025RESULTS/R090725AB.html",
      note: "The official timer records 1,104 marathon finishers: 691 male and 413 female.",
    },
    practical: [
      {
        label: "Course support window",
        value: "Approximately six hours; the organiser reopens roads progressively.",
        sourceUrl: "https://eriemarathon.net/race-info-course.html",
      },
      {
        label: "Entry changes",
        value: "The organiser states entries cannot be refunded, deferred or transferred.",
        sourceUrl: "https://eriemarathon.net/registration.html",
      },
    ],
  },
];
