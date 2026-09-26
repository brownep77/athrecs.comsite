import type { RoadMarathon } from "./types";

const indyResults = "https://monumentalmarathon.com/results/monumental-marathon-results/2025-2/";
const indyReport =
  "https://beyondmonumental.org/press_releases/monumental-milestones-at-the-2025-cno-financial-indianapolis-monumental-marathon/";
const columbusResults =
  "https://www.mtecresults.com/race/leaderboard/19623/2025_Columbus_Marathon-Marathon";
const columbusReport =
  "https://rrm.com/2025/news/rrw-some-interesting-results-for-you-from-last-weekend/";
const clevelandReport = "https://www.clevelandmarathon.com/about-us/recent-news/2026-results.aspx";
const desMoinesHistory = "https://www.runablaze.com/history/DSM-Marathon.pdf";
const okcResults = "https://okcmarathon.com/races/runner-results/";

const indyAgeLeaders: [string, string, string][] = [
  ["Men 16–18", "Julian Hipp", "2:39:37"],
  ["Men 19–24", "Louis Bertrand", "2:27:09"],
  ["Men 25–29", "Alec Danner", "2:21:02"],
  ["Men 30–34", "Adam Prunty", "2:32:21"],
  ["Men 35–39", "David Petrak", "2:23:02"],
  ["Men 40–44", "Milton Camas", "2:30:55"],
  ["Men 45–49", "Samuel Darling", "2:37:24"],
  ["Men 50–54", "Eduardo Ledesma", "2:48:40"],
  ["Men 55–59", "Glenn Kasin", "2:49:05"],
  ["Men 60–64", "David Black", "3:04:39"],
  ["Men 65–69", "Jeff Lindsey", "3:06:22"],
  ["Men 70–74", "Aaron Pratt", "3:48:57"],
  ["Men 75–79", "Charles Beverage", "4:31:51"],
  ["Men 80 & over", "Bob Edwards", "5:27:38"],
  ["Women 16–18", "Celia Pollock", "3:17:33"],
  ["Women 19–24", "Katie Humphries", "2:47:59"],
  ["Women 25–29", "Kayla Grahn", "2:41:45"],
  ["Women 30–34", "Brandy Leclair", "2:47:19"],
  ["Women 35–39", "Becky Nussbaum", "2:48:06"],
  ["Women 40–44", "Jessica Ponds", "2:56:03"],
  ["Women 45–49", "Bibo Gao", "2:55:49"],
  ["Women 50–54", "Tara Driscoll", "3:10:19"],
  ["Women 55–59", "Laura Norton", "3:24:49"],
  ["Women 60–64", "Terri Cassel", "3:22:51"],
  ["Women 65–69", "Sabine Sturm", "3:52:32"],
  ["Women 70–74", "Grace Wasielewski", "3:36:09"],
  ["Women 75–79", "Billie Jo Godfrey", "6:33:24"],
  ["Non-binary 19–24", "Connor Korte", "3:24:35"],
  ["Non-binary 25–29", "Reed Williams", "2:32:03"],
  ["Non-binary 50–54", "Edward O'Neil", "4:00:48"],
  ["Non-binary 55–59", "Jeff Frizzi", "4:18:49"],
];

export const USA_CENTRAL_ADDITIONS: RoadMarathon[] = [
  {
    slug: "indianapolis-monumental-marathon-usa",
    name: "CNO Financial Indianapolis Monumental Marathon",
    country: "usa",
    city: "Indianapolis",
    region: "Indiana",
    timeZone: "America/Indiana/Indianapolis",
    officialUrl: "https://monumentalmarathon.com/",
    description:
      "Indianapolis Monumental Marathon is a flat road race through Indiana’s capital, starting and finishing downtown. Historic neighbourhoods and cultural districts provide the setting, while the seven-hour limit and intermediate cutoff deserve a place in the race plan. General entry for 2026 is sold out. Limited charity places and elite applications have their own requirements, with acceptance subject to availability or selection. Arrange bib collection too: race-day pickup requires a separately purchased option.",
    course: {
      summary:
        "A 26.2-mile route through downtown Indianapolis, historic neighbourhoods and cultural districts, with the start and finish downtown.",
      surface: "Road",
      profile: "Flat; USATF-certified course.",
      links: [
        {
          label: "Course and race information",
          url: "https://monumentalmarathon.com/races/cno-financial-indianapolis-monumental-marathon/",
        },
        {
          label: "Published course map (2025 edition)",
          url: "https://monumentalmarathon.com/wp-content/uploads/2025/10/2025-Official-Full-Course-Map.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Enter through the organiser's registration service when available. General in-person entries were sold out at the September 2026 review.",
        url: "https://monumentalmarathon.com/",
      },
      {
        name: "Charity entry",
        description:
          "The organiser lists limited charity places after general entries sell out; check the partner's fundraising and availability conditions.",
        url: "https://monumentalmarathon.com/",
      },
      {
        name: "Elite application",
        description:
          "Apply against the published performance standards. Limited waived elite applications remain available for 2026; meeting a standard does not guarantee acceptance.",
        url: "https://monumentalmarathon.com/participants/elite-athletes-26/",
      },
    ],
    editions: [
      {
        date: "2026-11-07",
        sourceUrl:
          "https://monumentalmarathon.com/races/cno-financial-indianapolis-monumental-marathon/",
      },
    ],
    nextDateNote: "A 2027 race date has not yet been verified.",
    fieldSize: {
      display: "About 6,600",
      basis: "Finishers",
      year: "2025",
      sourceUrl: indyReport,
      note: "Rounded from the organiser's report of more than 6,600 full-marathon finishers. This excludes the half marathon and 5K.",
    },
    practical: [
      {
        label: "2026 start",
        value: "8:00am local time on Saturday 7 November.",
        sourceUrl:
          "https://monumentalmarathon.com/races/cno-financial-indianapolis-monumental-marathon/",
      },
      {
        label: "Course limit",
        value:
          "Seven hours, with rolling road closures and an intermediate course-split cutoff. Check the race FAQ for the complete requirements.",
        sourceUrl: "https://monumentalmarathon.com/participants/faq-2026/",
      },
      {
        label: "Packet collection",
        value:
          "Expo collection is on 5–6 November 2026. Race-day collection requires the separately purchased Will Call option, subject to availability.",
        sourceUrl: "https://monumentalmarathon.com/participants/faq-2026/",
      },
    ],
    media: [{ label: "2025 organiser race report", url: indyReport, kind: "news" }],
    resultsUrl: "https://monumentalmarathon.com/results/",
    pastEditions: [
      {
        year: 2025,
        date: "2025-11-08",
        resultsUrl: indyResults,
        summary:
          "Joseph Whelan set a men's course record and Amanda Mosborg won the women's race. More than 6,600 marathoners finished. The age-group summaries follow the organiser's published leader listing; they are separate from the overall standings.",
        categories: [
          {
            category: "Men overall",
            summary: "Joseph Whelan won in 2:12:29, a course record.",
            sourceUrl: indyReport,
          },
          {
            category: "Women overall",
            summary: "Amanda Mosborg won in 2:32:01.",
            sourceUrl: indyReport,
          },
          ...indyAgeLeaders.map(([category, name, time]) => ({
            category,
            summary: `${name}, ${time}.`,
            sourceUrl: indyResults,
          })),
        ],
      },
    ],
    sources: [
      {
        label: "Race information",
        url: "https://monumentalmarathon.com/races/cno-financial-indianapolis-monumental-marathon/",
      },
      { label: "2026 FAQ", url: "https://monumentalmarathon.com/participants/faq-2026/" },
      { label: "2025 results and division leaders", url: indyResults },
      { label: "2025 organiser report and marathon field", url: indyReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "columbus-marathon-usa",
    name: "Nationwide Children's Hospital Columbus Marathon",
    country: "usa",
    city: "Columbus",
    region: "Ohio",
    timeZone: "America/New_York",
    officialUrl: "https://www.columbusmarathon.com/",
    description:
      "Columbus Marathon follows a mostly flat road route through Ohio’s capital and neighbouring communities, with North Bank Park as its race-day base. Bexley, Upper Arlington, Grandview Heights and Ohio State University feature along the way. The race’s connection with Nationwide Children’s Hospital runs through its Marathon Mile Champions programme, supported by patient families. The 2026 full marathon is sold out, and that edition’s official transfer deadline and elite applications have also closed.",
    course: {
      summary:
        "From North Bank Park through downtown Columbus, Bexley, Upper Arlington, Grandview Heights and Ohio State University; landmarks include the Statehouse, Nationwide Children's Hospital and German Village.",
      surface: "Road",
      profile: "Minimal elevation changes.",
      links: [
        { label: "Official marathon course map", url: "https://www.columbusmarathon.com/marathon" },
      ],
    },
    entryMethods: [
      {
        name: "Online registration",
        description:
          "Use the official entry link when registration is available. The 2026 full marathon was sold out at the September review.",
        url: "https://www.columbusmarathon.com/marathon",
      },
      {
        name: "Official bib transfer",
        description:
          "Transfers use the original entrant's Manage Registration link. The 2026 initiation deadline was 18 September, so this route has closed for that edition.",
        url: "https://www.columbusmarathon.com/faq",
      },
      {
        name: "Elite application",
        description:
          "The event operates an invited-athlete programme with performance standards and edition-specific benefits. Applications for 2026 are closed.",
        url: "https://www.columbusmarathon.com/elite-athlete-information",
      },
    ],
    editions: [{ date: "2026-10-18", sourceUrl: "https://www.columbusmarathon.com/marathon" }],
    nextDateNote: "A 2027 marathon date has not yet been verified.",
    fieldSize: {
      display: "About 4,100",
      basis: "Finishers",
      year: "2025",
      sourceUrl: columbusReport,
      note: "Rounded from Race Results Weekly's report, published by Road Race Management, of 4,122 full-marathon finishers in 2025. Other distances are excluded.",
    },
    practical: [
      {
        label: "2026 start",
        value: "7:30am local time; wheelchair division at 7:25am. Corrals open at 6:00am.",
        sourceUrl: "https://www.columbusmarathon.com/marathon",
      },
      {
        label: "Race-day location",
        value: "North Bank Park, 311 W Long Street, Columbus.",
        sourceUrl: "https://www.columbusmarathon.com/marathon",
      },
      {
        label: "Minimum age",
        value: "16 on race day for the marathon.",
        sourceUrl: "https://www.columbusmarathon.com/faq",
      },
    ],
    media: [
      {
        label: "Official race-day photo gallery",
        url: "https://www.columbusmarathon.com/racedaygallery",
        kind: "photos",
      },
    ],
    resultsUrl: "https://www.columbusmarathon.com/results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-19",
        resultsUrl: columbusResults,
        summary:
          "Race Results Weekly reports victories for Simon Heys and Shannon Smith at the 2025 marathon, with approximately 4,100 marathon finishers. The times below are the report's gun times. Complete standings are linked through the official timer.",
        categories: [
          {
            category: "Men",
            summary: "Race Results Weekly reports Simon Heys as the winner in 2:21:16 (gun time).",
            sourceUrl: columbusReport,
          },
          {
            category: "Women",
            summary:
              "Race Results Weekly reports Shannon Smith as the winner in 2:42:56 (gun time).",
            sourceUrl: columbusReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Marathon date and course", url: "https://www.columbusmarathon.com/marathon" },
      {
        label: "Entry policies and practical information",
        url: "https://www.columbusmarathon.com/faq",
      },
      {
        label: "Elite entry and award rules",
        url: "https://www.columbusmarathon.com/elite-athlete-information",
      },
      { label: "Official results archive", url: "https://www.columbusmarathon.com/results" },
      { label: "2025 timing results", url: columbusResults },
      { label: "Race Results Weekly 2025 report and finisher count", url: columbusReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "cleveland-marathon-usa",
    name: "University Hospitals Cleveland Marathon",
    country: "usa",
    city: "Cleveland",
    region: "Ohio",
    timeZone: "America/New_York",
    officialUrl: "https://www.clevelandmarathon.com/",
    description:
      "Cleveland Marathon takes runners and walkers along Ohio city roads from downtown Mall B through neighbourhoods including Ohio City, Gordon Square and Lakewood. Long flat stretches are broken by bridge crossings; the organiser notes that elevation charts can make those crossings look more dramatic than they are. The 2027 race marks its 50th anniversary. General registration, charity teams and an elite application programme offer entry options, while a seven-hour schedule includes intermediate cutoffs and possible rerouting.",
    course: {
      summary:
        "Downtown start and finish at St. Clair Avenue and Mall B, passing Hingetown, Ohio City, Gordon Square, Edgewater and the Lakewood turnaround.",
      surface: "Road",
      profile:
        "Long flat sections with bridge crossings; the organiser warns that map elevation traces can exaggerate changes at bridges.",
      links: [
        {
          label: "Official marathon route, map and elevation",
          url: "https://www.clevelandmarathon.com/races/marathon.aspx",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Register online through the organiser's 2027 registration page and select the full marathon.",
        url: "https://www.clevelandmarathon.com/2027-registration.aspx",
      },
      {
        name: "Charity team",
        description:
          "Join an official charity partner and ask its team leader about the registration promo code before entering; fundraising and discounts follow partner conditions.",
        url: "https://www.clevelandmarathon.com/charity-program/run-for-a-cause.aspx",
      },
      {
        name: "Elite application",
        description:
          "Qualified runners can apply by 1 March 2027. Accepted athletes receive a fee reduction and elite start benefits; a qualifying time does not guarantee selection.",
        url: "https://www.clevelandmarathon.com/runners/2027-elite-program.aspx",
      },
    ],
    editions: [
      { date: "2027-05-16", sourceUrl: "https://www.clevelandmarathon.com/races/marathon.aspx" },
    ],
    fieldSize: {
      display: "About 2,000",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://rrm.com/2026/news/rrw-results-catch-up-may-12-17/",
      note: "Rounded from Race Results Weekly's report, published by Road Race Management, of 2,011 full-marathon finishers. Other distances are excluded.",
    },
    practical: [
      {
        label: "2027 start",
        value: "7:00am local time on Sunday 16 May, for marathon runners and walkers.",
        sourceUrl: "https://www.clevelandmarathon.com/races/marathon.aspx",
      },
      {
        label: "Course support",
        value:
          "The organiser applies a seven-hour course schedule with intermediate cutoffs and possible rerouting. Read the full rules before choosing a walking or run-walk pace.",
        sourceUrl: "https://www.clevelandmarathon.com/races/marathon.aspx",
      },
      {
        label: "Minimum age",
        value: "16 for the full marathon.",
        sourceUrl: "https://www.clevelandmarathon.com/races/marathon.aspx",
      },
    ],
    media: [
      { label: "2026 organiser race report", url: clevelandReport, kind: "news" },
      {
        label: "Official race videos",
        url: "https://www.clevelandmarathon.com/about-us/race-videos.aspx",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.clevelandmarathon.com/runners/past-results.aspx",
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-17",
        resultsUrl: "https://results.raceroster.com/v3/events/mpe7k9v2jm3svegb",
        summary:
          "Ashton Swinford recorded her fifth consecutive women's full-marathon victory. Jacob Kocis won the men's race and Zoe Tippl led the non-binary division. Times below follow the organiser's race report.",
        categories: [
          { category: "Men", summary: "Jacob Kocis won in 2:21:50.", sourceUrl: clevelandReport },
          {
            category: "Women",
            summary: "Ashton Swinford won in 2:44:36, her fifth consecutive victory.",
            sourceUrl: clevelandReport,
          },
          {
            category: "Non-binary",
            summary: "Zoe Tippl finished first in 3:22:43.",
            sourceUrl: clevelandReport,
          },
        ],
      },
    ],
    sources: [
      {
        label: "Marathon date, route and practical details",
        url: "https://www.clevelandmarathon.com/races/marathon.aspx",
      },
      {
        label: "2027 registration",
        url: "https://www.clevelandmarathon.com/2027-registration.aspx",
      },
      {
        label: "Results archive",
        url: "https://www.clevelandmarathon.com/runners/past-results.aspx",
      },
      { label: "2026 organiser report", url: clevelandReport },
      {
        label: "Race Results Weekly marathon finisher count",
        url: "https://rrm.com/2026/news/rrw-results-catch-up-may-12-17/",
      },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "des-moines-marathon-usa",
    name: "IMT Des Moines Marathon",
    country: "usa",
    city: "Des Moines",
    region: "Iowa",
    timeZone: "America/Chicago",
    officialUrl: "https://desmoinesmarathon.com/",
    description:
      "Des Moines Marathon combines roads and surfaced park paths in Iowa’s capital, with recent courses visiting Drake Stadium and Water Works Park. The organiser describes the route as flat, but returning runners have a practical reason to study the current map: the start and finish move to Raccoon Street for 2026. Entry is available online, with expo registration dependent on remaining places. Race-morning bib collection is a paid option that must be arranged in advance.",
    course: {
      summary:
        "City streets and park sections in Des Moines. The recent course includes Drake Stadium and Water Works Park; consult the current route for the 2026 Raccoon Street start and finish.",
      surface: "Road and surfaced park paths, with a stadium section on the recent course",
      profile:
        "Described by the organiser as a flat course; consult the current map for the complete profile.",
      links: [
        { label: "Current organiser course maps", url: "https://desmoinesmarathon.com/" },
        {
          label: "2025 athlete guide and course landmarks",
          url: "https://desmoinesmarathon.com/wp-content/uploads/2025/10/2025-IMT-Des-Moines-Marathon-Athlete-Guide-carbs-fuel-1-compressed.pdf",
        },
      ],
    },
    entryMethods: [
      {
        name: "Online entry",
        description:
          "Select the individual marathon through the organiser's RunSignup registration page.",
        url: "https://runsignup.com/Race/IA/DesMoines/IMTDesMoinesMarathon",
      },
      {
        name: "Expo registration",
        description:
          "Walk-up registration is available at the race expo only for distances with bibs still available.",
        url: "https://desmoinesmarathon.com/faqs/",
      },
    ],
    editions: [{ date: "2026-10-18", sourceUrl: "https://desmoinesmarathon.com/faqs/" }],
    nextDateNote: "A 2027 race date has not yet been verified.",
    fieldSize: {
      display: "About 1,900",
      basis: "Finishers",
      year: "2025",
      sourceUrl: desMoinesHistory,
      note: "Rounded from the Runablaze Iowa race-history compilation's 1,887 full-marathon finishers. Its half-marathon count is separate.",
    },
    practical: [
      {
        label: "2026 start",
        value: "8:00am local time on Sunday 18 October.",
        sourceUrl: "https://desmoinesmarathon.com/faqs/",
      },
      {
        label: "Start and finish",
        value: "212 Raccoon Street, Des Moines; new for 2026.",
        sourceUrl: "https://desmoinesmarathon.com/faqs/",
      },
      {
        label: "Packet collection",
        value:
          "Expo pickup on 16–17 October at MidAmerican Energy Two Rivers Park. A paid race-morning pickup option must be arranged in advance.",
        sourceUrl: "https://desmoinesmarathon.com/",
      },
    ],
    media: [
      { label: "Runablaze Iowa race history and reports", url: desMoinesHistory, kind: "news" },
      {
        label: "Official photographer — search Des Moines",
        url: "https://www.marathonfoto.com/",
        kind: "photos",
      },
    ],
    resultsUrl: "https://results.truetimeracing.com/results.aspx?CId=16535&RId=1609",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-19",
        resultsUrl: "https://results.truetimeracing.com/results.aspx?CId=16535&RId=1609",
        summary:
          "Runablaze Iowa's race-history report records a new marathon finisher high of 1,887 in 2025, with Benard Rotich and Katie Long winning the men's and women's races. The complete event results are linked separately through the official timer.",
        categories: [
          {
            category: "Men",
            summary: "Runablaze Iowa records Benard Rotich as the men's winner in 2:20:54.",
            sourceUrl: desMoinesHistory,
          },
          {
            category: "Women",
            summary: "Runablaze Iowa records Katie Long as the women's winner.",
            sourceUrl: desMoinesHistory,
          },
        ],
      },
    ],
    sources: [
      { label: "Official race information and maps", url: "https://desmoinesmarathon.com/" },
      { label: "2026 FAQ", url: "https://desmoinesmarathon.com/faqs/" },
      {
        label: "Official registration",
        url: "https://runsignup.com/Race/IA/DesMoines/IMTDesMoinesMarathon",
      },
      {
        label: "2025 official timing results",
        url: "https://results.truetimeracing.com/results.aspx?CId=16535&RId=1609",
      },
      { label: "Runablaze Iowa historical results compilation", url: desMoinesHistory },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "oklahoma-city-memorial-marathon-usa",
    name: "Oklahoma City Memorial Marathon",
    country: "usa",
    city: "Oklahoma City",
    region: "Oklahoma",
    timeZone: "America/Chicago",
    officialUrl: "https://okcmarathon.com/",
    description:
      "Oklahoma City Memorial Marathon is a road race commemorating the 168 people killed in the city’s 1995 bombing. Named banners line a single-loop course from the National Memorial through Bricktown, the State Capitol area and historic neighbourhoods to Scissortail Park. Registration supports the Memorial and Museum and includes museum admission. Runners enter through the official event service, with separate arrangements for wheelchair and assisted participation. The 6.5-hour limit includes additional cutoffs at miles 7.5 and 20.",
    course: {
      summary:
        "A single loop from the Oklahoma City National Memorial through downtown, Bricktown, the State Capitol area and historic neighbourhoods, finishing at Scissortail Park.",
      surface: "Road",
      profile: "USATF-certified city loop; the official interactive map includes elevations.",
      links: [
        {
          label: "Official full-marathon map and elevation",
          url: "https://okcmarathon.com/races/marathon/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Register for the full marathon through the official event registration service.",
        url: "https://events.okcmarathon.com/events/8f8948044bf5037c730f/registration_options",
      },
      {
        name: "Wheelchair entry and assisted participation",
        description:
          "The marathon has a wheelchair division with equipment and start requirements. Requests to push a wheelchair are reviewed individually and must be made at least one month before race day.",
        url: "https://okcmarathon.com/races/marathon/",
      },
    ],
    editions: [{ date: "2027-04-25", sourceUrl: "https://okcmarathon.com/races/marathon/" }],
    fieldSize: {
      display: "About 2,600",
      basis: "Finishers",
      year: "2026",
      sourceUrl: "https://www.mychiptime.com/searchevent.php?id=17142",
      note: "Rounded from 2,613 full-marathon finishers. The timer lists three marathon wheelers separately; shorter races are excluded.",
    },
    practical: [
      {
        label: "2027 start",
        value:
          "6:30am local time on Sunday 25 April; wheelchair and assisted starts have separate arrangements.",
        sourceUrl: "https://okcmarathon.com/races/marathon/",
      },
      {
        label: "Course support",
        value:
          "6.5 hours from the last corral, with additional cutoffs at miles 7.5 and 20. Check the complete pace and rerouting rules.",
        sourceUrl: "https://okcmarathon.com/races/marathon/",
      },
      {
        label: "Minimum age",
        value: "16 for the full marathon.",
        sourceUrl: "https://okcmarathon.com/races/marathon/",
      },
    ],
    media: [
      {
        label: "Official race-day broadcast coverage",
        url: "https://okcmarathon.com/watch/race-day-coverage/",
        kind: "video",
      },
    ],
    resultsUrl: okcResults,
    pastEditions: [
      {
        year: 2026,
        date: "2026-04-26",
        resultsUrl: "https://www.mychiptime.com/searchevent.php?id=17091",
        summary:
          "Steven Baker and Maddie McQuirk won the 2026 marathon. The timer records 2,613 marathon finishers and a separate three-person wheelers field. Overall winning times below follow the organiser's archive; the timer also provides chip and gun details.",
        categories: [
          {
            category: "Men overall",
            summary: "Steven Baker won in 2:23:19, as recorded in the organiser's archive.",
            sourceUrl: okcResults,
          },
          {
            category: "Women overall",
            summary: "Maddie McQuirk won in 2:53:22, as recorded in the organiser's archive.",
            sourceUrl: okcResults,
          },
          {
            category: "Marathon wheelers — men",
            summary:
              "Steven Scalzo led the timer's combined wheelers leaderboard in 1:35:14, ahead of Glenn Pemberton and David Satre. This listing combines the published wheeler results rather than separating equipment classes.",
            sourceUrl: "https://www.mychiptime.com/searchevent.php?id=17144",
          },
        ],
      },
    ],
    sources: [
      {
        label: "Official marathon date, route and participation rules",
        url: "https://okcmarathon.com/races/marathon/",
      },
      {
        label: "Registration",
        url: "https://events.okcmarathon.com/events/8f8948044bf5037c730f/registration_options",
      },
      { label: "Organiser's results archive", url: okcResults },
      {
        label: "2026 full-marathon timing and finisher count",
        url: "https://www.mychiptime.com/searchevent.php?id=17142",
      },
      {
        label: "2026 wheelers results",
        url: "https://www.mychiptime.com/searchevent.php?id=17144",
      },
    ],
    checkedAt: "2026-09-26",
  },
];
