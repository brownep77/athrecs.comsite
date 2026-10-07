import type { RoadMarathon } from "./types";
import { UK_MARATHONS } from "../uk-marathon-guide";
import { UK_MARATHON_EDITIONS, UK_MARATHON_UNCONFIRMED_2027 } from "../uk-marathon-editions";
import { UK_MARATHON_FIELD_ESTIMATES } from "../uk-marathon-field-estimates";
import { UK_MARATHON_REGIONS } from "./uk-regions";

// Editorial summaries from opened organiser pages and result tables, checked 26 September 2026.
// Kept separate from athlete imports: these are race reports, not profile identity matches.
const category = (category: string, summary: string, sourceUrl: string) => ({
  category,
  summary,
  sourceUrl,
});
const link = (label: string, url: string) => ({ label, url });
const entry = (name: string, description: string, url: string) => ({ name, description, url });
const practical = (label: string, value: string, sourceUrl: string) => ({
  label,
  value,
  sourceUrl,
});
const news = (label: string, url: string): RoadMarathon["media"][number] => ({
  label,
  url,
  kind: "news",
});
const photos = (label: string, url: string): RoadMarathon["media"][number] => ({
  label,
  url,
  kind: "photos",
});
const past = (
  year: number,
  resultsUrl: string,
  summary: string,
  categories: RoadMarathon["pastEditions"][number]["categories"] = [],
  date?: string,
) => ({ year, ...(date ? { date } : {}), resultsUrl, summary, categories });

const londonReport =
  "https://www.londonmarathonevents.co.uk/london-marathon/article/2026-tcs-london-marathon-makes-sporting-history-sawe-breaks-landmark-two";
const manchesterReport =
  "https://www.manchestermarathon.co.uk/news/your-2026-elite-winners-hall-lidove-robinson/";
const brightonReport =
  "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/article/2026-brighton-marathon-record-breaker";
const belfastReport = "https://belfastcitymarathon.com/events/2026-phoenix-energy-belfast-marathon";
const chesterResults = "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon";
const yorkshireReport =
  "https://www.runforall.com/community/news/historic-streets-of-york-come-alive-for-the-altra-yorkshire-marathon-festival/";
const mkReport =
  "https://mkmarathon.com/mk-marathon-delivers-record-breaking-success-with-11000-participants-and-multiple-course-records/";
const lochPrizes =
  "https://lochnessmarathon.com/wp-content/uploads/2025/09/LNM2025-Prize-Giving-Forms_LNM-1.pdf";
const abingdonResults = "https://www.abingdonmarathon.org.uk/s/2025resultsforwebv2.pdf";
const leedsReport =
  "https://www.runforall.com/community/news/record-participation-and-landmark-mnd-wave-at-2026-rob-burrow-leeds-marathon-weekend/";
const newportResults = "https://www.run4wales.org/news-media/race-results/";

// Category leaders use the timing table's Category > Chip position, not overall gun order.
const chester2025AgeCategories = [
  {
    category: "Senior Female (18-34)",
    summary: "Atsede Gidey (bib 60; Exmouth Harriers) led the category on chip time in 02:44:51.",
    sourceUrl:
      "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=Senior+Female+%2818-34%29",
  },
  {
    category: "Senior Male (18-34)",
    summary:
      "Joshua Griffiths (bib 28; Swansea Harriers) led the category on chip time in 02:17:16.",
    sourceUrl:
      "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=Senior+Male+%2818-34%29",
  },
  {
    category: "MV35",
    summary: "Jack Bromley (bib 25) led the category on chip time in 02:27:52.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV35",
  },
  {
    category: "FV35",
    summary: "Sammy Antell (bib 55; Bideford AAC) led the category on chip time in 02:44:21.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV35",
  },
  {
    category: "FV40",
    summary:
      "Melissah Gibson (bib 53; 100 Marathon Club) led the category on chip time in 02:44:59.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV40",
  },
  {
    category: "MV40",
    summary: "Tom Charles (bib 9; Chorlton Runners) led the category on chip time in 02:24:27.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV40",
  },
  {
    category: "FV45",
    summary:
      "Sally Armitage (bib 65; Ilkley Harriers AC) led the category on chip time in 03:06:46.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV45",
  },
  {
    category: "MV45",
    summary:
      "Wayne Singleton (bib 18; Barnsley Athletic Club) led the category on chip time in 02:36:17.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV45",
  },
  {
    category: "FV50",
    summary: "Joanne Bentley (bib 5144; VeloRunner) led the category on chip time in 03:06:44.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV50",
  },
  {
    category: "MV50",
    summary:
      "David McDonough (bib 6188; Kirkby Milers AC) led the category on chip time in 02:50:04.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV50",
  },
  {
    category: "MV55",
    summary:
      "Woody Felton (bib 4870; Spectrum Striders) led the category on chip time in 02:45:35.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV55",
  },
  {
    category: "FV55",
    summary:
      "Andrea Winkless (bib 6114; Barrow Runners) led the category on chip time in 03:35:21.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV55",
  },
  {
    category: "MV60",
    summary: "Robert Burn (bib 4219; Buxton AC) led the category on chip time in 02:55:01.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV60",
  },
  {
    category: "FV60",
    summary:
      "Julie Masterman (bib 5358; Goole Viking Striders) led the category on chip time in 03:30:22.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV60",
  },
  {
    category: "MV65",
    summary:
      "Jack de Bokx (bib 4612; Daventry Road Runners) led the category on chip time in 03:07:42.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV65",
  },
  {
    category: "FV65",
    summary:
      "Victoria Perry (bib 5775; Altrincham & District Athletic Club Limited) led the category on chip time in 03:43:57.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV65",
  },
  {
    category: "FV70",
    summary:
      "Angela Kerr (bib 4875; Axe Valley Runners) led the category on chip time in 04:38:39.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV70",
  },
  {
    category: "MV70",
    summary: "Robert Langley (bib 713; Halstead RRC) led the category on chip time in 03:39:55.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV70",
  },
  {
    category: "FV75",
    summary: "Pauline Bingham (bib 781) led the category on chip time in 05:59:31.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=FV75",
  },
  {
    category: "MV75",
    summary:
      "Peter Rymill (bib 2563; Wetherby Runners AC) led the category on chip time in 04:16:41.",
    sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Category=MV75",
  },
];

type Enrichment = Pick<
  RoadMarathon,
  "slug" | "description" | "course" | "entryMethods" | "media" | "resultsUrl" | "pastEditions"
> & { practical?: RoadMarathon["practical"] };

const details: Record<string, Enrichment> = {
  london: {
    slug: "london-marathon",
    description:
      "The London Marathon takes runners from the capital’s south-east to The Mall, passing Cutty Sark, Tower Bridge and the Thames on a largely flat road course. Securing a place can require its own training in patience: options include the ballot, charities, Good for Age and approved international operators. The special 2027 edition spans 24 and 25 April, so follow the instructions for your assigned day and start wave. With different start and finish locations, the journey home needs a little thought too.",
    course: {
      summary:
        "Point-to-point from Greenwich and nearby start areas to The Mall, via Cutty Sark, Tower Bridge, Canary Wharf and Victoria Embankment.",
      surface: "Road",
      profile:
        "Predominantly flat, with an early descent and smaller inclines including the approach to Tower Bridge.",
      links: [
        link(
          "Official course guide",
          "https://www.londonmarathonevents.co.uk/london-marathon/course",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Ballot",
        "Apply during the organiser's ballot window; a ballot application does not guarantee entry.",
        "https://www.londonmarathonevents.co.uk/ballot",
      ),
      entry(
        "Charity place",
        "Apply to an official charity and agree its fundraising conditions.",
        "https://www.londonmarathonevents.co.uk/london-marathon/run-charity",
      ),
      entry(
        "Good for Age",
        "Qualifying performances, eligibility and application deadlines are set by the organiser.",
        "https://www.londonmarathonevents.co.uk/london-marathon/good-age-entry",
      ),
      entry(
        "International tour operator",
        "Overseas participants can compare the organiser's approved operators and packages.",
        "https://www.londonmarathonevents.co.uk/london-marathon/international-participants",
      ),
    ],
    media: [news("2026 official race report", londonReport)],
    resultsUrl: "https://www.londonmarathonevents.co.uk/london-marathon/results",
    pastEditions: [
      past(
        2026,
        "https://www.londonmarathonevents.co.uk/london-marathon/results",
        "All four defending elite champions retained their titles. The organiser separates elite competition results from mass-event comparisons.",
        [
          category(
            "Elite men",
            "Sabastian Sawe won in 1:59:30, the first sub-two-hour performance in a competitive marathon.",
            londonReport,
          ),
          category(
            "Elite women",
            "Tigst Assefa won in 2:15:41, improving the women-only world record.",
            londonReport,
          ),
          category("Men's wheelchair", "Marcel Hug won his eighth London title.", londonReport),
          category(
            "Women's wheelchair",
            "Catherine Debrunner retained the title after racing Tatyana McFadden to the finish.",
            londonReport,
          ),
        ],
      ),
    ],
  },
  manchester: {
    slug: "manchester-marathon",
    description:
      "Manchester Marathon is a large spring road race through Greater Manchester, with a flat course that gives runners good reason to think carefully about their pace. The latest published map covers 2026, when the finish was on Oxford Road; treat it as a guide until the 2027 route is confirmed. General-entry releases and official charity places have separate arrangements. For a closer look before booking, the race’s livestream and participant photographs show rather more than an elevation chart can.",
    course: {
      summary:
        "Road course through Greater Manchester; the latest published map is for 2026 and that edition finished on Oxford Road.",
      surface: "Road",
      profile: "Flat; check the edition-specific route map before planning a time target.",
      links: [link("Official route map", "https://www.manchestermarathon.co.uk/route/route-map/")],
    },
    entryMethods: [
      entry(
        "General-entry updates",
        "Register interest through the organiser for current entry-release information.",
        "https://www.manchestermarathon.co.uk/home/",
      ),
      entry(
        "Official charity",
        "Choose an official charity partner and follow its entry and fundraising conditions.",
        "https://www.manchestermarathon.co.uk/charities/official-charities/",
      ),
    ],
    media: [news("2026 elite winners and race videos", manchesterReport)],
    resultsUrl: "https://www.manchestermarathon.co.uk/event-info/results/",
    pastEditions: [
      past(
        2026,
        "https://www.manchestermarathon.co.uk/event-info/results/",
        "The 2026 elite races finished on Oxford Road. The organiser's report publishes separate running and wheelchair podiums.",
        [
          category(
            "Elite men",
            "Yohan Lidove won in 2:15:19 gun time; William Strangeway ran 2:15:42 and Charlie Brisley 2:16:04.",
            manchesterReport,
          ),
          category(
            "Elite women",
            "Naomi Robinson won in 2:36:56, ahead of Heather Townsend (2:37:40) and Louise Flynn (2:44:21).",
            manchesterReport,
          ),
          category(
            "Men's wheelchair",
            "Calum Hall won in 1:47:35; Bret Crossley was second in 1:55:32 and Josh Hickinbottom third in 2:00:03.",
            manchesterReport,
          ),
        ],
      ),
    ],
  },
  brighton: {
    slug: "brighton-marathon",
    description:
      "Brighton Marathon starts in Preston Park and takes its road runners through the city and along the seafront. Sea views do not, regrettably, come with a guarantee of flat ground: the route has four main climbs within the first 11 miles. That makes a measured start sensible. Standard and charity entries are available through London Marathon Events, with pacers and refreshment stations on course. The beach village provides a place to find supporters once the running is done.",
    course: {
      summary:
        "Preston Park start with city landmarks and seafront running. The road marathon is separate from the trail event.",
      surface: "Tarmac road with a short block-paved section",
      profile: "Rolling; four main climbs are identified at miles 1, 7, 9 and 11.",
      links: [
        link(
          "Course and support stations",
          "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-weekend-brighton-marathon-course",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "Follow the organiser's 2027 entry link and select the road marathon.",
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
      ),
      entry(
        "Charity entry",
        "The event's Take Part menu links to its charity programme and charity-place conditions.",
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
      ),
    ],
    practical: [
      practical(
        "2027 start location",
        "Preston Park",
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
      ),
    ],
    media: [news("2026 official race report", brightonReport)],
    resultsUrl: "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/results",
    pastEditions: [
      past(
        2026,
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/results",
        "More than 14,000 runners completed the road marathon in blustery conditions. Figures for the whole festival include other distances.",
        [
          category(
            "Men",
            "Sam Cook retained his title in 2:25:04. Ryan Deakin finished second (2:29:48), followed by Aaron Hudson (2:31:59).",
            brightonReport,
          ),
          category(
            "Women",
            "Amy Harris won in 2:49:38, followed by Flaminia Gold (2:51:42) and Lucy Lavender (2:53:56).",
            brightonReport,
          ),
        ],
        "2026-04-12",
      ),
    ],
  },
  edinburgh: {
    slug: "edinburgh-marathon",
    description:
      "Edinburgh Marathon begins on Potterrow, near McEwan Hall, before heading through Portobello and Musselburgh towards the East Lothian coast. The road course loses almost 90 metres overall, although that is not a promise that every mile goes downhill. Standard and charity entries sit alongside Top Club and Good for Age applications. As the race heads away from its city-centre start, check the transport arrangements as carefully as the route map; tired legs seldom improve a complicated journey back.",
    course: {
      summary:
        "Potterrow city-centre start, then Portobello, Musselburgh and the East Lothian coast towards Gosford House and back.",
      surface: "Road",
      profile:
        "Net downhill by almost 90 metres; a net descent does not mean every section is downhill.",
      links: [
        link("Route and elevation profile", "https://www.edinburghmarathon.com/marathon/route-map"),
      ],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "Select the marathon through the official entry process.",
        "https://www.edinburghmarathon.com/marathon/event-information",
      ),
      entry(
        "Charity entry",
        "Compare participating charities and their fundraising conditions.",
        "https://www.edinburghmarathon.com/charities/marathon",
      ),
      entry(
        "Top Club / Good for Age",
        "Apply with evidence of a qualifying performance and check the organiser's eligibility rules.",
        "https://www.edinburghmarathon.com/marathon/topclub",
      ),
    ],
    practical: [
      practical(
        "2027 start time",
        "10:00 local time",
        "https://www.edinburghmarathon.com/marathon",
      ),
    ],
    media: [
      {
        label: "Official event information and film",
        url: "https://www.edinburghmarathon.com/marathon/event-information",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.edinburghmarathon.com/results-navigation/marathon",
    pastEditions: [
      past(
        2026,
        "https://www.edinburghmarathon.com/results?event=1060",
        "The official full-marathon results include running, non-binary and wheelchair/handbike divisions, with age-group standings and both chip and gun times. The summaries below follow the published positions.",
        [
          category(
            "Men",
            "The first displayed result is Conor Sarsfield (bib 106): 02:18:03 chip, 02:18:04 gun. The next two displayed results are Calum Phillip (bib 123): 02:28:39 chip, 02:28:39 gun; Shaun Cumming (bib 132): 02:30:18 chip, 02:30:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=M&rs=438",
          ),
          category(
            "Women",
            "The leading displayed women's result is Melissah Gibson (bib 258): 02:43:52 chip, 02:43:55 gun. The next two displayed results are Ashleigh Harvie (bib 139): 02:51:50 chip, 02:51:52 gun; Susan Stead (bib 583): 02:53:49 chip, 02:53:55 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=F&rs=438",
          ),
          category(
            "Non-binary",
            "The first displayed result is Isabelle Scoffin (bib 17267): 04:23:55 chip, 04:50:34 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=N&rs=438",
          ),
          category(
            "Men 45-49",
            "Patrice Bligny (bib 571) is listed first in category 45M: 02:54:49 chip, 02:55:02 gun.",
            "https://www.edinburghmarathon.com/results?age_category=45&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 50-54",
            "Andrew Luke (bib 350) is listed first in category 50M: 02:55:55 chip, 02:56:10 gun.",
            "https://www.edinburghmarathon.com/results?age_category=50&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 55-59",
            "Graham Wilson (bib 504) is listed first in category 55M: 03:04:08 chip, 03:04:14 gun.",
            "https://www.edinburghmarathon.com/results?age_category=55&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 60-64",
            "Graeme Parker (bib 1073) is listed first in category 60M: 03:14:51 chip, 03:16:30 gun.",
            "https://www.edinburghmarathon.com/results?age_category=60&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 65-69",
            "Jim Doyle (bib 984) is listed first in category 65M: 03:17:55 chip, 03:18:25 gun.",
            "https://www.edinburghmarathon.com/results?age_category=65&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 70-74",
            "Jerry Lockspeiser (bib 8736) is listed first in category 70M: 04:11:24 chip, 04:20:26 gun.",
            "https://www.edinburghmarathon.com/results?age_category=70&event=1060&gender=M&rs=438",
          ),
          category(
            "Men Wheelchair/Handbike",
            "Oliver Bellarby (bib 15986) is listed first in category WM: 03:56:08 chip, 04:15:18 gun.",
            "https://www.edinburghmarathon.com/results?age_category=W&event=1060&gender=M&rs=438",
          ),
          category(
            "Women Under 35",
            "Ashleigh Harvie (bib 139) is listed first in category U35F: 02:51:50 chip, 02:51:52 gun.",
            "https://www.edinburghmarathon.com/results?age_category=U35&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 35-39",
            "Susan Stead (bib 583) is listed first in category 35F: 02:53:49 chip, 02:53:55 gun.",
            "https://www.edinburghmarathon.com/results?age_category=35&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 45-49",
            "Paula Rutherfoord (bib 3699) is listed first in category 45F: 03:17:04 chip, 03:20:23 gun.",
            "https://www.edinburghmarathon.com/results?age_category=45&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 50-54",
            "Ailsa McCorquodale (bib 4311) is listed first in category 50F: 03:24:54 chip, 03:28:22 gun.",
            "https://www.edinburghmarathon.com/results?age_category=50&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 55-59",
            "Dawn Knox (bib 17145) is listed first in category 55F: 03:14:02 chip, 03:14:21 gun.",
            "https://www.edinburghmarathon.com/results?age_category=55&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 60-64",
            "Claire Ulysses (bib 11868) is listed first in category 60F: 04:13:39 chip, 04:29:40 gun.",
            "https://www.edinburghmarathon.com/results?age_category=60&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 65-69",
            "Lynda Hembury (bib 5092) is listed first in category 65F: 03:52:19 chip, 03:59:23 gun.",
            "https://www.edinburghmarathon.com/results?age_category=65&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 70-74",
            "Irene Cruickshank (bib 18251) is listed first in category 70F: 05:07:48 chip, 05:34:02 gun.",
            "https://www.edinburghmarathon.com/results?age_category=70&event=1060&gender=F&rs=438",
          ),
          category(
            "Women 75-80",
            "Barbara Wesson (bib 18128) is listed first in category 75F: 05:20:54 chip, 05:51:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=75&event=1060&gender=F&rs=438",
          ),
          category(
            "Men Under 35",
            "Conor Sarsfield (bib 106) is listed first in category U35M: 02:18:03 chip, 02:18:04 gun.",
            "https://www.edinburghmarathon.com/results?age_category=U35&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 35-39",
            "Shaun Cumming (bib 132) is listed first in category 35M: 02:30:18 chip, 02:30:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=35&event=1060&gender=M&rs=438",
          ),
          category(
            "Men 40-44",
            "Paul Gourlay (bib 255) is listed first in category 40M: 02:37:28 chip, 02:37:33 gun.",
            "https://www.edinburghmarathon.com/results?age_category=40&event=1060&gender=M&rs=438",
          ),
          category(
            "Non-binary 0N",
            "Isabelle Scoffin (bib 17267) is listed first in category 0N: 04:23:55 chip, 04:50:34 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=N&rs=438",
          ),
          category(
            "Non-binary 35N",
            "Zbigniew Jan Zwolski (bib 15177) is listed first in category 35N: 04:24:54 chip, 04:49:04 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=N&rs=438",
          ),
          category(
            "Non-binary 40N",
            "Rona Cran (bib 14421) is listed first in category 40N: 04:47:10 chip, 05:11:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=N&rs=438",
          ),
          category(
            "Non-binary 55N",
            "Samantha Hamlet (bib 18713) is listed first in category 55N: 06:32:35 chip, 06:58:36 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1060&gender=N&rs=438",
          ),
        ],
      ),
      past(
        2025,
        "https://www.edinburghmarathon.com/results?event=1031",
        "The official full-marathon results include running, non-binary and wheelchair/handbike divisions, with age-group standings and both chip and gun times. The summaries below follow the published positions.",
        [
          category(
            "Women",
            "The first displayed result is Melissah Gibson (bib 246): 02:38:42 chip, 02:38:48 gun. The next two displayed results are Kirsty Oldham (bib 536): 02:45:30 chip, 02:45:40 gun; Emily Soanes (bib 383): 02:46:58 chip, 02:47:10 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1031&gender=F&rs=417",
          ),
          category(
            "Non-binary",
            "The first displayed result is Meg Markwick (bib 3892): 03:31:32 chip, 03:34:45 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1031&gender=N&rs=417",
          ),
          category(
            "Men",
            "The first displayed result is Marshall Smith (bib 117): 02:22:16 chip, 02:22:16 gun. The next two displayed results are Ben Holmes (bib 129): 02:26:14 chip, 02:26:14 gun; Kris Lecher (bib 218): 02:26:57 chip, 02:27:01 gun.",
            "https://www.edinburghmarathon.com/results?age_category=any&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 50-54",
            "Thomas Gavin (bib 292) is listed first in category 50M: 02:47:16 chip, 02:47:20 gun.",
            "https://www.edinburghmarathon.com/results?age_category=50&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 55-59",
            "Mike Stewart (bib 468) is listed first in category 55M: 02:53:06 chip, 02:53:16 gun.",
            "https://www.edinburghmarathon.com/results?age_category=55&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 60-64",
            "Rob Soutar (bib 858) is listed first in category 60M: 02:56:26 chip, 02:57:20 gun.",
            "https://www.edinburghmarathon.com/results?age_category=60&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 65-69",
            "Tadeusz Zaranko (bib 1974) is listed first in category 65M: 03:23:11 chip, 03:24:41 gun.",
            "https://www.edinburghmarathon.com/results?age_category=65&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 70-74",
            "Mungai Wairia (bib 5086) is listed first in category 70M: 03:37:07 chip, 03:42:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=70&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 75-80",
            "Sam Selway (bib 5933) is listed first in category 75M: 03:46:26 chip, 03:51:27 gun.",
            "https://www.edinburghmarathon.com/results?age_category=75&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 85+",
            "Kieran Maher (bib 6525) is listed first in category 85M: 03:54:40 chip, 04:00:44 gun.",
            "https://www.edinburghmarathon.com/results?age_category=O85&event=1031&gender=M&rs=417",
          ),
          category(
            "Men Wheelchair/Handbike",
            "Michael Cole (bib 85648) is listed first in category WM: 03:56:03 chip, 04:12:33 gun.",
            "https://www.edinburghmarathon.com/results?age_category=W&event=1031&gender=M&rs=417",
          ),
          category(
            "Women 50-54",
            "Heleen De Hooge (bib 1520) is listed first in category 50F: 03:10:35 chip, 03:12:02 gun.",
            "https://www.edinburghmarathon.com/results?age_category=50&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 55-59",
            "Wendy Chapman (bib 1314) is listed first in category 55F: 03:05:25 chip, 03:06:19 gun.",
            "https://www.edinburghmarathon.com/results?age_category=55&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 60-64",
            "Jan Davies (bib 9710) is listed first in category 60F: 03:59:26 chip, 04:11:02 gun.",
            "https://www.edinburghmarathon.com/results?age_category=60&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 65-69",
            "Aileen Ross (bib 5661) is listed first in category 65F: 04:10:54 chip, 04:16:53 gun.",
            "https://www.edinburghmarathon.com/results?age_category=65&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 70-74",
            "Dorothy Wicke (bib 15052) is listed first in category 70F: 04:55:26 chip, 05:15:23 gun.",
            "https://www.edinburghmarathon.com/results?age_category=70&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 75-80",
            "Margaret Thompson (bib 19051) is listed first in category 75F: 06:31:48 chip, 06:57:04 gun.",
            "https://www.edinburghmarathon.com/results?age_category=75&event=1031&gender=F&rs=417",
          ),
          category(
            "Men Under 35",
            "Marshall Smith (bib 117) is listed first in category U35M: 02:22:16 chip, 02:22:16 gun.",
            "https://www.edinburghmarathon.com/results?age_category=U35&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 35-39",
            "Kris Lecher (bib 218) is listed first in category 35M: 02:26:57 chip, 02:27:01 gun.",
            "https://www.edinburghmarathon.com/results?age_category=35&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 40-44",
            "Ewan Cameron (bib 137) is listed first in category 40M: 02:32:23 chip, 02:32:23 gun.",
            "https://www.edinburghmarathon.com/results?age_category=40&event=1031&gender=M&rs=417",
          ),
          category(
            "Men 45-49",
            "Steven Anders (bib 279) is listed first in category 45M: 02:50:46 chip, 02:50:59 gun.",
            "https://www.edinburghmarathon.com/results?age_category=45&event=1031&gender=M&rs=417",
          ),
          category(
            "Women Under 35",
            "Kirsty Oldham (bib 536) is listed first in category U35F: 02:45:30 chip, 02:45:40 gun.",
            "https://www.edinburghmarathon.com/results?age_category=U35&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 35-39",
            "Hannah Berry (bib 494) is listed first in category 35F: 02:56:51 chip, 02:57:01 gun.",
            "https://www.edinburghmarathon.com/results?age_category=35&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 40-44",
            "Melissah Gibson (bib 246) is listed first in category 40F: 02:38:42 chip, 02:38:48 gun.",
            "https://www.edinburghmarathon.com/results?age_category=40&event=1031&gender=F&rs=417",
          ),
          category(
            "Women 45-49",
            "Katja Juhart (bib 2234) is listed first in category 45F: 02:56:44 chip, 02:57:20 gun.",
            "https://www.edinburghmarathon.com/results?age_category=45&event=1031&gender=F&rs=417",
          ),
        ],
      ),
    ],
  },
  belfast: {
    slug: "belfast-city-marathon",
    description:
      "Belfast City Marathon runs from Stormont Estate to Ormeau Park on a road course through Northern Ireland’s capital. The 2027 full marathon is scheduled to start at 09:00, and individual entry is separate from the relay. Runners can book directly or take part through the charity programme. There is useful depth to the race’s history too: its results archive reaches back to 2001, with recent prize lists covering open, wheelchair, veteran and Northern Ireland categories.",
    course: {
      summary: "Stormont Estate start and Ormeau Park finish through Belfast.",
      surface: "Road",
      profile: "City course; consult the edition's participant instructions for the final route.",
      links: [
        link(
          "Official event and participant information",
          "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Individual marathon",
        "Use the organiser's Explore Entry Options link and select the full marathon.",
        "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
      ),
      entry(
        "Run for charity",
        "Choose a charity through the organiser's charity registration page.",
        "https://belfastcitymarathon.com/charities/register-to-run-for-a-charity",
      ),
    ],
    practical: [
      practical(
        "2027 start",
        "09:00 local time, Stormont Estate; finish in Ormeau Park.",
        "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
      ),
    ],
    media: [news("2026 official prize winners", belfastReport)],
    resultsUrl: "https://belfastcitymarathon.com/results",
    pastEditions: [
      past(
        2026,
        "https://belfastcitymarathon.com/results",
        "The organiser publishes separate open, Northern Ireland, wheelchair and veteran prize lists; its prize page does not provide finish times.",
        [
          category(
            "Open men",
            "Abay Alemu won, followed by Tadese Mamo and Abera Ketema.",
            belfastReport,
          ),
          category(
            "Open women",
            "Laila Aziza Alaoui Selsouli won, ahead of Judith Storm and Melissah Gibson.",
            belfastReport,
          ),
          category(
            "Northern Ireland",
            "Patrick McColl won the men's award; Dearbhla Cox won the women's award.",
            belfastReport,
          ),
          category(
            "Women's wheelchair",
            "Jayne Bleakley received the wheelchair winner's award.",
            belfastReport,
          ),
          category(
            "Male veterans",
            "Published winners: 35+ James Turner; 40 John Joe Doherty; 45 Brian McElvanna; 50 Stephen Duncan; 55 David Curran; 60 Francis Marsh; 65 Norman Mawhinney; 70 Frederick Campbell; 80 Ken Davison.",
            belfastReport,
          ),
          category(
            "Female veterans",
            "Published winners: 35+ Emma Horner; 40 Sinead Murtagh; 45 Gillian McCrory; 50 Aine Fegan; 55 Catherine Roche; 60 Mary Slocum; 65 Jacqueline Maxwell; 70 Mary Jennings; 75 Collette OHagan; 80 Terry Gough.",
            belfastReport,
          ),
        ],
      ),
    ],
  },
  chester: {
    slug: "chester-marathon",
    description:
      "Chester Marathon starts and finishes in the city, taking runners through Cheshire and North Wales before returning beside the River Dee. Crossing a national border is a pleasing amount of travel for a morning on foot. This road race offers direct entry and support including training plans, organised runs and on-course refreshments. UK entrants receive their race packs by post; overseas runners collect them during the weekend. When booking, choose the full marathon rather than the shorter metric marathon.",
    course: {
      summary:
        "Chester city landmarks, Cheshire and North Wales countryside, returning beside the River Dee.",
      surface: "Road",
      profile: "City and countryside course; consult the organiser's final route guidance.",
      links: [
        link(
          "Official race description",
          "https://ale.niftyentries.com/2026-MBNA-Chester-Marathon",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Standard marathon entry",
        "Book the full marathon through the organiser's official entry page; UKA-affiliated discounts and transfer conditions are published there.",
        "https://ale.niftyentries.com/2026-MBNA-Chester-Marathon",
      ),
    ],
    practical: [
      practical(
        "2026 minimum age",
        "18 on race day",
        "https://ale.niftyentries.com/2026-MBNA-Chester-Marathon",
      ),
    ],
    media: [
      news(
        "2025 report from Welsh Athletics",
        "https://www.welshathletics.org/en/blog/post/weekend-round-up-4-5-october-2025",
      ),
    ],
    resultsUrl: chesterResults,
    pastEditions: [
      past(
        2025,
        chesterResults,
        "The final-results table distinguishes gun time, chip time, gender position and age-category position, with an Other Dates archive for earlier editions.",
        [
          category(
            "Men",
            "Joshua Griffiths (bib 28, Swansea Harriers) finished first in 2:17:16, recorded as both gun and chip time.",
            "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon/28/1",
          ),
          category(
            "Women",
            "Sammy Antell (bib 55, Bideford AAC) was first woman in 2:44:22 gun time and 2:44:21 chip time.",
            "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon?Gender=Female",
          ),
          ...chester2025AgeCategories,
        ],
        "2025-10-05",
      ),
    ],
  },
  yorkshire: {
    slug: "yorkshire-marathon",
    description:
      "The Yorkshire Marathon sets out from the University of York for city streets, villages and countryside, returning to the university to finish. The road route includes Stockton-on-the-Forest and the approach towards Buttercrambe Moor Wood, with gradient maps available for pacing plans. Enter individually or through the Yorkshire Double ticket, which also includes Leeds. For 2026, general campus parking is unavailable, so use the park-and-ride guidance. Getting to the start should require less effort than the race itself.",
    course: {
      summary:
        "University of York start and finish, with city streets and surrounding villages and countryside.",
      surface: "Road",
      profile: "Rural road course; official static, interactive and gradient maps are available.",
      links: [
        link(
          "Route and gradient maps",
          "https://www.runforall.com/events/marathon/yorkshire-marathon/",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Individual entry",
        "Use the official Enter Event link for the full marathon.",
        "https://www.runforall.com/events/marathon/yorkshire-marathon/",
      ),
      entry(
        "Yorkshire Double",
        "The organiser offers a combined Leeds and Yorkshire marathon season ticket.",
        "https://www.runforall.com/events/season-tickets/yorkshire-double-season-ticket/",
      ),
    ],
    practical: [
      practical(
        "2026 start time",
        "09:30 local time, University of York",
        "https://www.runforall.com/events/marathon/yorkshire-marathon/",
      ),
      practical(
        "2026 access",
        "University parking is restricted to Blue Badge holders; use the organiser's park-and-ride guidance.",
        "https://www.runforall.com/events/marathon/yorkshire-marathon/",
      ),
    ],
    media: [news("2025 official race report", yorkshireReport)],
    resultsUrl: "https://www.runforall.com/events/results-photos/",
    pastEditions: [
      past(
        2025,
        "https://www.runforall.com/events/results-photos/",
        "The festival included the full marathon, relay and 10-mile race. Heather Townsend set a women's marathon course record.",
        [
          category(
            "Men",
            "Edward Buck won in 2:18:15, followed by Rob Corney (2:20:15) and Thomas Cornthwait (2:23:46).",
            yorkshireReport,
          ),
          category(
            "Women",
            "Heather Townsend won in 2:38:58; Melissah Gibson was second in 2:43:03 and Alice Lambert third in 2:45:00.",
            yorkshireReport,
          ),
          category(
            "Wheelchair",
            "The organiser reports Catriona Johnson finishing the marathon wheelchair race in 3:28:09.",
            yorkshireReport,
          ),
        ],
      ),
    ],
  },
  "milton-keynes": {
    slug: "milton-keynes-marathon",
    description:
      "Milton Keynes Marathon follows roads and surfaced paths through the city’s green spaces before finishing inside Stadium MK. The lap around the pitch gives supporters a clear view of the final effort, whether that resembles a sprint or something more diplomatic. The organiser describes a flat route with long traffic-free sections. Standard and charity participation are available, and the 2027 marathon has a six-and-a-half-hour limit. Select the full distance when entering the wider bank-holiday programme.",
    course: {
      summary:
        "Milton Keynes roads and surfaced paths, green spaces and a lap of the Stadium MK pitch before the finish.",
      surface: "Road and surfaced paths",
      profile: "The organiser describes the course as flat, with long traffic-free sections.",
      links: [link("Route details and printable map", "https://mkmarathon.com/mk-marathon/")],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "Register through the official marathon page and select the full distance.",
        "https://mkmarathon.com/mk-marathon/",
      ),
      entry(
        "Charity programme",
        "Compare the organiser's charity partners and charity participation options.",
        "https://mkmarathon.com/charity-program/",
      ),
    ],
    practical: [
      practical(
        "2027 start time",
        "09:00 local time, Stadium MK",
        "https://mkmarathon.com/mk-marathon/",
      ),
      practical(
        "2027 course limit",
        "6 hours 30 minutes; minimum age 18 on race day.",
        "https://mkmarathon.com/mk-marathon/",
      ),
    ],
    media: [news("2026 official race report", mkReport)],
    resultsUrl: "https://mkmarathon.com/results/",
    pastEditions: [
      past(
        2026,
        "https://mkmarathon.com/results/",
        "The organiser reported new men's and women's course records in the full marathon. Its 11,000-participant weekend total includes several other races.",
        [
          category("Men", "Mohammed Elbayan won in 2:25:36.", mkReport),
          category("Women", "Gemma Carter won in 2:51:32.", mkReport),
        ],
        "2026-05-04",
      ),
    ],
  },
  southampton: {
    slug: "southampton-marathon",
    description:
      "Southampton Marathon is a road race through the city whose previous routes have included the waterfront, St Mary’s Stadium and the Itchen Bridge. The 2027 course is still to be confirmed, so earlier maps should guide expectations without settling them. Bridge climbs have featured before; save detailed pacing decisions for the final route. Standard entry and charity options are available through the organiser, with separate results and photographs for the marathon and the festival’s shorter distances.",
    course: {
      summary:
        "Southampton city and waterfront marathon. The organiser has not yet confirmed the 2027 route.",
      surface: "Road",
      profile: "Previous routes include bridge climbs; 2027 profile awaits confirmation.",
      links: [
        link(
          "Official route updates",
          "https://www.southamptonmarathon.co.uk/abp-southampton-marathon-festival",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "Use the organiser's Sign Up link and select the full marathon.",
        "https://www.southamptonmarathon.co.uk/abp-southampton-marathon-festival",
      ),
      entry(
        "Charity entry",
        "Use the event's Run for Charity options and check the selected charity's terms.",
        "https://www.southamptonmarathon.co.uk/abp-southampton-marathon-festival",
      ),
    ],
    media: [photos("Official race photos", "https://www.southamptonmarathon.co.uk/race-photos")],
    resultsUrl: "https://www.southamptonmarathon.co.uk/race-results",
    pastEditions: [
      past(
        2026,
        "https://www.southamptonmarathon.co.uk/race-results",
        "The organiser links separate 2026 full-marathon results through DB Max. Use the full results for individual performances and categories.",
      ),
    ],
  },
  "loch-ness": {
    slug: "loch-ness-marathon",
    description:
      "Loch Ness Marathon starts in Highland moorland and follows the loch’s south-eastern side towards Inverness, crossing the River Ness before the finish. It is a road race with descents and substantial climbs; admiring the scenery is entirely compatible with noticing the hills. Standard and charity entry options are available. The point-to-point layout makes start transport a key part of the plan, so read those instructions early. The organiser’s results and age-group prize lists give a useful picture of previous fields.",
    course: {
      summary:
        "Moorland start, south-eastern Loch Ness shoreline and River Ness crossing before finishing in Inverness.",
      surface: "Road",
      profile: "Rolling point-to-point course with descents and notable climbs.",
      links: [
        link(
          "Course and event guide",
          "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Standard entry / registration interest",
        "Use the official race page for the currently available edition and its entry announcements.",
        "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
      ),
      entry(
        "Charity place",
        "Select a participating charity and check its fundraising requirements.",
        "https://lochnessmarathon.com/run-for-charity/",
      ),
    ],
    practical: [
      practical(
        "2026 start time",
        "10:00 local time; minimum age 18.",
        "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
      ),
    ],
    media: [
      news(
        "2025 report from Scottish Athletics",
        "https://www.scottishathletics.org.uk/ultra-trail-loch-ness/",
      ),
    ],
    resultsUrl: "https://lochnessmarathon.com/results/",
    pastEditions: [
      past(
        2025,
        "https://lochnessmarathon.com/results/",
        "Alex Milne set the men's course record. The organiser's prize-giving lists use gun times and publish male and female awards through the 70+ categories.",
        [
          category(
            "Men",
            "Alex Milne won in 2:15:46; James Donald ran 2:22:01 and Shaun Cumming 2:22:57.",
            lochPrizes,
          ),
          category(
            "Women",
            "Melissah Gibson won in 2:43:08; Fay Hughes ran 2:51:29 and Rebecca Burns 2:55:19.",
            lochPrizes,
          ),
          category(
            "Male age-group winners",
            "40+: Oscar Coetzee 2:32:21; 50+: George Darden 2:40:41; 60+: Garth Morris 3:03:03; 70+: Andy Law 3:28:12. All are gun times.",
            lochPrizes,
          ),
          category(
            "Female age-group winners",
            "40+: Melissah Gibson 2:43:08; 50+: Janet Dickson 3:10:12; 60+: Sheila Lewis 3:40:01; 70+: Susan Linklater 4:06:50. All are gun times.",
            lochPrizes,
          ),
        ],
      ),
    ],
  },
  abingdon: {
    slug: "abingdon-marathon",
    description:
      "Abingdon Marathon starts and finishes on the Tilsley Park track, with a generally flat road route through the town and neighbouring villages. The course changes for 2026, so use the revised map rather than a familiar old file. Some roads and footpaths remain open to other users, with marshals supporting the race. The 2026 event is sold out, with an official waiting list and transfer process. Its six-hour limit and detailed historical results are worth checking before seeking a place.",
    course: {
      summary:
        "Tilsley Park track start and finish, Abingdon town centre and a two-lap section through surrounding villages; revised for 2026.",
      surface: "Road, footpaths and athletics track",
      profile: "Generally flat; use the revised course map and elevation profile.",
      links: [link("Current route and elevation", "https://www.abingdonmarathon.org.uk/route")],
    },
    entryMethods: [
      entry(
        "Waiting list / official transfer",
        "The 2026 race is sold out. The organiser links an official waiting list and transfer information.",
        "https://www.abingdonmarathon.org.uk/",
      ),
    ],
    practical: [
      practical(
        "2026 start time",
        "09:00 local time, Tilsley Park",
        "https://www.abingdonmarathon.org.uk/",
      ),
      practical(
        "2026 course limit",
        "Six hours, with any extension at the race director's discretion.",
        "https://www.abingdonmarathon.org.uk/race-information",
      ),
    ],
    media: [
      news("2026 course changes", "https://www.abingdonmarathon.org.uk/news/a-new-course-for-2026"),
    ],
    resultsUrl: "https://www.abingdonmarathon.org.uk/results",
    pastEditions: [
      past(
        2025,
        abingdonResults,
        "The final PDF contains overall, age-category, team and Oxfordshire championship tables. Times below are gun times from its individual/category results.",
        [
          category("Overall men", "Tom Hollis (bib 371) won in 2:29:24.", abingdonResults),
          category("Overall women", "Louise Flynn (bib 1198) won in 2:46:42.", abingdonResults),
          category(
            "Men's age-category leaders",
            "SM Jonathan Frost 2:29:41; VM40 Tom Hollis 2:29:24; VM50 Martin Green 2:36:20; VM60 Nigel Rackham 2:46:54; VM70+ Nick Silvester 3:28:37.",
            abingdonResults,
          ),
          category(
            "Women's age-category leaders",
            "SW Fliss Tournant 2:58:02; VW35 Louise Flynn 2:46:42; VW45 Annabel Granger 2:53:47; VW55 Alice Riddell-Webster 2:56:51; VW65 Linda Tyler 3:32:14; VW75+ Jane Ashby 4:17:28.",
            abingdonResults,
          ),
          category(
            "Teams",
            "Headington RR led the men's team standings; Bristol & West AC led the women's.",
            abingdonResults,
          ),
        ],
        "2025-10-19",
      ),
    ],
  },
  windermere: {
    slug: "windermere-marathon",
    description:
      "Windermere Marathon makes a road journey around the Lake District lake, from Waterhead through the western villages and Newby Bridge to a finish at Brockhole. The organiser estimates about 600 metres of ascent, so the views have a fairly clear price in climbing. The return takes in Bowness and Troutbeck Bridge, with the finish beside the Great North Swim event village. Direct entry, route files and travel guidance are available online; leave room in the pacing plan for the hills.",
    course: {
      summary:
        "Waterhead to Brockhole-on-Windermere via the western lakeside villages, Newby Bridge and Bowness.",
      surface: "Road",
      profile: "Hilly, with approximately 600 metres of ascent.",
      links: [link("Route, GPX and OS map links", "https://www.windermeremarathon.co.uk/")],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "The organiser links directly to 2027 registration through Let's Do This.",
        "https://www.windermeremarathon.co.uk/",
      ),
    ],
    practical: [
      practical(
        "2027 provisional start",
        "08:30 local time; the organiser labels this provisional.",
        "https://www.windermeremarathon.co.uk/",
      ),
    ],
    media: [photos("Official event gallery", "https://www.windermeremarathon.co.uk/event-gallery")],
    resultsUrl: "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
    pastEditions: [
      past(
        2026,
        "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
        "Michael Young led the men's results, Beckie Ripley led the women's results and Lucas Coombs led the organiser's Other category. The official online summary lists the populated age categories below and notes that these summaries may differ from race-day prize presentations.",
        [
          category(
            "Overall men",
            "Michael Young (bib 112) led this published category in 02:38:08 chip time (02:38:08 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M40",
            "Hugh Watkin (bib 346) led this published category in 02:53:34 chip time (02:53:35 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M45",
            "David Birtwistle (bib 979) led this published category in 03:00:38 chip time (03:00:38 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M50",
            "Ted Leahy (bib 343) led this published category in 03:09:45 chip time (03:09:46 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M55",
            "Nick Hynes (bib 235) led this published category in 03:39:31 chip time (03:39:43 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M60",
            "Rob Downs (bib 994) led this published category in 03:31:54 chip time (03:31:55 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M65",
            "Malcolm Fallow (bib 826) led this published category in 04:09:48 chip time (04:10:24 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M70",
            "Ken Johnson (bib 928) led this published category in 05:29:48 chip time (05:30:45 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M75",
            "Steve Walsh (bib 370) led this published category in 06:12:58 chip time (06:14:29 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "M80",
            "Adam Carter (bib 104) led this published category in 04:50:03 chip time (04:51:37 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "MSEN",
            "Michael Young (bib 112) led this published category in 02:38:08 chip time (02:38:08 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "Overall women",
            "Beckie Ripley (bib 1013) led this published category in 03:17:36 chip time (03:17:40 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F35",
            "Emma Burckhardt (bib 275) led this published category in 03:26:15 chip time (03:26:15 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F40",
            "Jenny Ledsham (bib 575) led this published category in 03:29:52 chip time (03:29:56 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F45",
            "Emily Wideman (bib 489) led this published category in 03:21:40 chip time (03:21:47 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F50",
            "Nicola Raby (bib 711) led this published category in 03:57:50 chip time (03:58:11 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F55",
            "Annette O donoghue (bib 404) led this published category in 04:20:09 chip time (04:21:13 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F60",
            "Elaine Rowlands (bib 549) led this published category in 04:33:35 chip time (04:33:57 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "F65",
            "Pamela Hardman (bib 650) led this published category in 04:40:57 chip time (04:41:57 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "FSEN",
            "Beckie Ripley (bib 1013) led this published category in 03:17:36 chip time (03:17:40 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "Overall — Other",
            "Lucas Coombs (bib 876) led this published category in 03:32:34 chip time (03:33:10 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
          category(
            "USEN",
            "Lucas Coombs (bib 876) led this published category in 03:32:34 chip time (03:33:10 gun time).",
            "https://results.frsys.uk/events/jd7b8p13f3nzvmajbxqdsr73zd88hmg4/1",
          ),
        ],
        "2026-06-14",
      ),
    ],
  },
  "boston-uk": {
    slug: "boston-marathon-uk",
    description:
      "Boston Marathon UK is the Lincolnshire race: a flat road marathon through villages and countryside, with direct entry through the organiser. The latest route page describes a Market Place start and Boston College finish, but remains labelled 2026; wait for confirmation before treating that as the 2027 route. Much of the course uses roads open to traffic, which is an important detail alongside the agreeable elevation profile. Official maps, runner information and an aerial film help put the route in context.",
    course: {
      summary:
        "Latest published route: Boston Market Place to Boston College via rural Lincolnshire villages. The route page is still labelled 2026.",
      surface: "Road",
      profile: "Flat rural course on roads that remain open to traffic.",
      links: [link("Route and elevation maps", "https://www.bostonmarathon.co.uk/route")],
    },
    entryMethods: [
      entry(
        "Standard full-marathon entry",
        "Choose the full marathon through the organiser's registration page.",
        "https://www.bostonmarathon.co.uk/register",
      ),
    ],
    practical: [
      practical(
        "2027 published start",
        "08:00 local time; administration opens at 07:00.",
        "https://www.bostonmarathon.co.uk/",
      ),
    ],
    media: [photos("Organiser's photo gallery", "https://www.bostonmarathon.co.uk/photo-gallery")],
    resultsUrl: "https://www.stuweb.co.uk/events/2026/04/12/4505/",
    pastEditions: [
      past(
        2026,
        "https://www.stuweb.co.uk/race/3rl",
        "David Webster and Lizzie Keep led the men's and women's published marathon standings. The full-marathon table is ranked by chip time and is separate from the other Boston UK festival races.",
        [
          category(
            "Men",
            "David Webster (bib 6279) led in 02:34:10, followed by Mohamed Abdin (bib 5003) in 02:37:17 and Conor Culham (bib 5298) in 02:37:22. All are chip times.",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Women",
            "Lizzie Keep (bib 5660) led in 02:54:22, followed by Katie Latham (bib 5710) in 02:55:42 and Elizabeth Joyce (bib 5644) in 02:56:05. All are chip times.",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 20–24",
            "Joe Heather (bib 5536) is listed first in this category in 02:44:36 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 25–29",
            "Conor Culham (bib 5298) is listed first in this category in 02:37:22 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 30–34",
            "Mohamed Abdin (bib 5003) is listed first in this category in 02:37:17 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 35–39",
            "David Webster (bib 6279) is listed first in this category in 02:34:10 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 40–44",
            "David Craddock (bib 5283) is listed first in this category in 02:47:52 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 45–49",
            "Hugh Torry (bib 6344) is listed first in this category in 02:47:04 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Men 50–54",
            "Heydon Mizon (bib 5848) is listed first in this category in 02:49:08 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Women 25–29",
            "Elizabeth Joyce (bib 5644) is listed first in this category in 02:56:05 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Women 30–34",
            "Lizzie Keep (bib 5660) is listed first in this category in 02:54:22 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Women 40–44",
            "Katie Latham (bib 5710) is listed first in this category in 02:55:42 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
          category(
            "Women 45–49",
            "Margaret Beever (bib 5096) is listed first in this category in 02:58:41 (chip).",
            "https://www.stuweb.co.uk/race/3rl",
          ),
        ],
        "2026-04-12",
      ),
    ],
  },
  leeds: {
    slug: "rob-burrow-leeds-marathon",
    description:
      "The Rob Burrow Leeds Marathon starts and finishes at Headingley Stadium, heading through Meanwood, Bramhope and Otley on a hilly road course. The Otley Chevin climb deserves a place in the training plan, not just a passing glance at the map. Named in Rob Burrow’s honour, the event supports MND charities and welcomes fundraising for other causes. Runners can enter directly or use the Yorkshire Double ticket for Leeds and Yorkshire. The stadium finish comes after a proper day’s work.",
    course: {
      summary:
        "Headingley Stadium loop via Meanwood, Golden Acre Park, Bramhope and Otley, finishing inside the stadium.",
      surface: "Road",
      profile: "Hilly, including the Otley Chevin climb.",
      links: [
        link(
          "Route and elevation maps",
          "https://www.runforall.com/events/marathon/leeds-marathon/",
        ),
      ],
    },
    entryMethods: [
      entry(
        "Individual entry",
        "Enter the full marathon through Run For All's official event page.",
        "https://www.runforall.com/events/marathon/leeds-marathon/",
      ),
      entry(
        "Yorkshire Double",
        "The organiser offers a Leeds and Yorkshire marathon season ticket.",
        "https://www.runforall.com/events/season-tickets/yorkshire-double-season-ticket/",
      ),
    ],
    practical: [
      practical(
        "2027 start",
        "09:00 local time, AMT Headingley Stadium; minimum age 18.",
        "https://www.runforall.com/events/marathon/leeds-marathon/",
      ),
    ],
    media: [news("2026 official race report", leedsReport)],
    resultsUrl: "https://www.runforall.com/events/results-photos/",
    pastEditions: [
      past(
        2026,
        "https://www.runforall.com/events/results-photos/",
        "The weekend introduced a dedicated MND Wave and included a separate half marathon and relay. The full marathon finished on the Headingley pitch.",
        [
          category(
            "Men",
            "George Ravenhall won in 2:26:31; Tom Charles ran 2:27:09 and Daniel Grant 2:31:55.",
            leedsReport,
          ),
          category(
            "Women",
            "The organiser names Melisah Gibson as winner in 2:45:51, followed by Charlotte Knowles (2:51:46) and Anna Firth (2:56:52).",
            leedsReport,
          ),
        ],
        "2026-05-10",
      ),
    ],
  },
  newport: {
    slug: "newport-marathon",
    description:
      "Newport Marathon heads from the Welsh city into the Gwent Levels on a flat road course, passing riverfront landmarks and rural villages. The Transporter Bridge helps set the scene before the route reaches the countryside. It is a useful option to consider when hills are not on the wish list, though 26.2 miles still need running. Standard and charity entries are available through Run 4 Wales. Check the marathon’s own route and results, as the festival also includes shorter races.",
    course: {
      summary:
        "Newport and the Gwent Levels, combining city landmarks, riverfront and rural villages.",
      surface: "Road",
      profile: "Flat road course.",
      links: [link("Official marathon route", "https://newportwalesmarathon.co.uk/routes/")],
    },
    entryMethods: [
      entry(
        "Standard entry",
        "Select the full marathon through the official 2027 entry page.",
        "https://newportwalesmarathon.co.uk/register-marathon/",
      ),
      entry(
        "Charity entry",
        "Choose a participating charity and review its entry requirements.",
        "https://newportwalesmarathon.co.uk/choose-a-charity/",
      ),
    ],
    media: [
      {
        label: "Official race videos",
        url: "https://newportwalesmarathon.co.uk/video/",
        kind: "video",
      },
    ],
    resultsUrl: "https://newportwalesmarathon.co.uk/race-results/",
    pastEditions: [
      past(
        2026,
        "https://newportwalesmarathon.co.uk/race-results/",
        "Run 4 Wales publishes the full-marathon winners separately from the half-marathon and 10K results.",
        [
          category("Men", "Jacob Tasker won in 2:21:07.", newportResults),
          category("Women", "Samantha Antell won in 2:43:15.", newportResults),
        ],
      ),
      past(
        2025,
        "https://newportwalesmarathon.co.uk/race-results/",
        "The organiser records a women's course record and publishes a separate wheelchair winner.",
        [
          category("Men", "Daniel Husbands won in 2:27:57.", newportResults),
          category("Women", "Melissah Gibson won in 2:38:31.", newportResults),
          category("Wheelchair", "Ron Price won in 2:49:21.", newportResults),
        ],
      ),
    ],
  },
};

export const UK_ROAD_MARATHONS: RoadMarathon[] = UK_MARATHONS.map((race) => {
  const enriched = details[race.id];
  const geography = UK_MARATHON_REGIONS[enriched.slug];
  const countySuffix = `, ${geography.region}`;
  const field = UK_MARATHON_FIELD_ESTIMATES[race.id];
  const editions = UK_MARATHON_EDITIONS.filter((edition) => edition.raceId === race.id).map(
    (edition) => ({
      date: edition.startDate,
      ...(edition.endDate ? { endDate: edition.endDate } : {}),
      sourceUrl: edition.sourceUrl,
    }),
  );
  const sourceLinks = [
    link("Official event", race.officialUrl),
    link("County / area information", geography.sourceUrl),
    ...enriched.course.links,
    ...enriched.entryMethods.map((method) => link(method.name, method.url)),
    link("Official results", enriched.resultsUrl),
    ...enriched.media.map((item) => link(item.label, item.url)),
    ...enriched.pastEditions.flatMap((edition) =>
      edition.categories.map((item) => link(`${edition.year} ${item.category}`, item.sourceUrl)),
    ),
    ...editions.map((edition) => link("Confirmed race date", edition.sourceUrl)),
    ...(field?.sources.map((url) => link("Field-size evidence", url)) ?? []),
  ];
  return {
    ...enriched,
    name: race.name,
    country: "uk",
    city: race.location.endsWith(countySuffix)
      ? race.location.slice(0, -countySuffix.length)
      : race.location,
    region: geography.region,
    nation: geography.nation,
    timeZone: "Europe/London",
    officialUrl: race.officialUrl,
    editions,
    ...(UK_MARATHON_UNCONFIRMED_2027.some((id) => id === race.id)
      ? { nextDateNote: "2027 date not yet confirmed by the organiser." }
      : {}),
    ...(field
      ? {
          fieldSize: {
            display: field.display,
            basis: field.basis,
            note: field.explanation,
            year: field.years,
            sourceUrl: field.sources[0],
          },
        }
      : {}),
    sources: sourceLinks.filter(
      (source, index, all) => all.findIndex((item) => item.url === source.url) === index,
    ),
    checkedAt: "2026-09-26",
  };
});
