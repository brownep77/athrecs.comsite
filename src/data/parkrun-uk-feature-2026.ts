import type { EditorialArticle } from "../lib/athrecs/editorial";

export const PARKRUN_UK_FEATURE: EditorialArticle = {
  slug: "parkrun-uk-records-age-groups-community",
  kind: "news",
  date: "2026-11-06",
  displayDate: "6 November 2026",
  author: "AthRecs Editorial",
  title: "parkrun: fast times, fresh starts and friends you haven’t met yet",
  seoTitle: "parkrun UK: records, age groups and how to get started",
  description:
    "Remarkable UK parkrun times, inspiring age-group performances and real stories of friendship. A welcoming guide for walkers, first-timers and returning runners.",
  standfirst:
    "A 13:44 finish in Belfast. A gathering of 180 people aged 80 and over at Bushy. A school friendship picked up years later. There are quite a few ways to have a good Saturday morning.",
  sports: ["parkrun"],
  locations: [
    { country: "England" },
    { country: "Scotland" },
    { country: "Wales" },
    { country: "Northern Ireland" },
  ],
  coverageLevels: ["national", "world"],
  publishedAt: "2026-11-06T15:30:00+00:00",
  modifiedAt: "2026-11-06T15:30:00+00:00",
  image: {
    src: "/images/editorial/parkrun-bushy-kevin-wood-2014.jpg",
    alt: "A mixed group of participants following the parkrun course beneath autumn trees at Bushy Park.",
    caption:
      "Bushy parkrun, 27 September 2014. Photograph: Kevin Wood / Wikimedia Commons, CC BY 2.0. Original photograph, uncropped; source and licence linked below.",
    width: 1920,
    height: 1241,
  },
  body: [
    "You can spend years deciding whether you’re a runner. Or you can take a barcode to a park on Saturday and leave the philosophical discussion until coffee.",
    "At parkrun, nobody needs your training history. You can walk the whole five kilometres, jog a little and walk a little, or arrive with a personal best in mind and a rather serious relationship with your watch. You can also volunteer and spend the morning helping other people round. There is room for all of it.",
    "That is a lovely thing to find when much of adult life seems to require an appointment, a subscription or proof that you already know what you’re doing. Register once, check the local details, turn up. Your first morning can be as simple as that.",
    "The fast times are extraordinary. So are some of the reasons people keep coming back.",
  ],
  sections: [
    {
      id: "everyone-starts-somewhere",
      heading: "You don’t have to get fit before you come",
      paragraphs: [
        "If your plan is to train until you feel ready for parkrun, you may be giving yourself an unnecessary entrance exam. Walking is welcome. There is no cut-off time, and the volunteer Tail Walker stays at the back. Mixing running and walking is a perfectly ordinary way to take part.",
        "Go to the first-timers’ welcome and say it is your first visit. That gives you a chance to hear about the course, ask where the finish is and discover that at least one other person has been wondering exactly the same thing.",
        "You do not have to make a grand announcement about changing your life. You can simply see how you like one Saturday. If the prospect of five kilometres still feels a bit much, contact the team about volunteering. Being part of the morning doesn’t depend on covering the course.",
      ],
      sources: [
        {
          label: "parkrun · walkers and the Tail Walker",
          url: "https://volunteer.parkrun.com/hc/en-us/articles/16857824613266-2-9-Walkers",
        },
        {
          label: "parkrun · registration",
          url: "https://support.parkrun.com/hc/en-us/articles/205595392-1-1-How-do-I-register-for-parkrun",
        },
      ],
    },
    {
      id: "uk-records",
      heading: "When the person up the path is an international athlete",
      paragraphs: [
        "The welcome extends to people who can cover five kilometres at a speed most of us would prefer to observe from a comfortable distance. Irish international Nick Griggs ran 13:44 at Belfast Victoria in Northern Ireland on 9 November 2024. Fellow Irish international Ciara Mageean had recorded 15:13 on the same course on 23 December 2023. Both performances were widely reported as unassisted parkrun world bests; The Running Channel still listed them as the leading marks in April 2026.",
        "On New Year’s Day 2026, Innes FitzGerald ran 15:27 at Exmouth. Exeter Harriers reported it as the fastest parkrun by a British woman at the time. What a way to begin the year. Some of us were still trying to find the lid for the leftovers.",
        "These are dated landmarks, with their record status as reported at the time. parkrun removed its prominent record tables in February 2024; individual results continue.",
      ],
      table: {
        caption: "Remarkable performances at UK events · parkrun finish times, not chip timed",
        headings: ["Event", "Athlete", "Finish time", "Date", "Reported achievement"],
        rows: [
          [
            "Belfast Victoria, Northern Ireland",
            "Nick Griggs",
            "13:44",
            "9 November 2024",
            "Men’s unassisted world best reported in 2024",
          ],
          [
            "Belfast Victoria, Northern Ireland",
            "Ciara Mageean",
            "15:13",
            "23 December 2023",
            "Women’s unassisted world best reported in 2023",
          ],
          [
            "Edinburgh, Scotland",
            "Andy Butchart",
            "13:45",
            "24 June 2023",
            "Former men’s world best",
          ],
          [
            "Bushy, England",
            "Andy Baddeley",
            "13:48",
            "2012",
            "Former men’s world best; stood until 2023",
          ],
          [
            "Exmouth, England",
            "Innes FitzGerald",
            "15:27",
            "1 January 2026",
            "Fastest by a British woman, as reported by her club then",
          ],
        ],
      },
      sources: [
        {
          label: "The Running Channel · leading marks, April 2026",
          url: "https://therunningchannel.com/fastest-and-slowest-parkruns-uk/",
        },
        {
          label: "BBC Sport · Griggs, 9 November 2024",
          url: "https://www.bbc.co.uk/sport/athletics/articles/cjw07p0l591o",
        },
        {
          label: "Irish Examiner · Mageean at Belfast Victoria",
          url: "https://www.irishexaminer.com/sport/othersport/arid-41296459.html",
        },
        {
          label: "Scottish Athletics · Butchart and Baddeley",
          url: "https://www.scottishathletics.org.uk/poland-parkrun/",
        },
        {
          label: "Exeter Harriers · FitzGerald at Exmouth",
          url: "https://www.exeterharriers.org.uk/news/3414-innes-runs-fastest-ever-parkrun-by-a-british-female",
        },
        {
          label: "BBC Sport · record-table changes, February 2024",
          url: "https://www.bbc.co.uk/sport/68239218",
        },
        {
          label: "parkrun · how results are recorded",
          url: "https://support.parkrun.com/hc/en-us/articles/200565343-4-1-Results",
        },
      ],
    },
    {
      id: "age-categories",
      heading: "The over-80s would like a word",
      paragraphs: [
        "At Bushy on 4 July 2026, 180 people aged 80 and over completed the course, including 11 in the 90–94 band. Peter Giles led the gathering in 23:55; Veterans AC described it as a record for the annual gathering. Joyce Archibald’s 40:08 in the women’s 90–94 band earned the day’s highest age grading: 98.55%.",
        "The results invite an enjoyable change of perspective: growing older can bring a new category, new company and new goals. A quick time is one possible ambition. Still having somewhere you look forward to going is another.",
      ],
      table: {
        caption:
          "Bushy’s over-80s gathering, 4 July 2026 — leading age-band performances reported by Veterans AC",
        headings: ["Age band", "Participant", "Finish time"],
        rows: [
          ["Men 80–84", "Peter Giles", "23:55"],
          ["Men 85–89", "David Moorekite", "30:01"],
          ["Women 80–84", "Fiona Hatton", "30:07"],
          ["Women 85–89", "Judy Nutting", "35:57"],
          ["Women 90–94", "Joyce Archibald", "40:08"],
        ],
      },
      sources: [
        {
          label: "Veterans AC · Bushy gathering report",
          url: "https://www.vetsac.org.uk/Results-2026.html",
        },
      ],
    },
    {
      id: "age-grading",
      heading: "What does that percentage beside your time mean?",
      paragraphs: [
        "Age grading compares your time with a reference standard for your age and gender, producing a percentage. It gives a performance some context when a straight comparison of finishing times would tell only part of the story.",
        "Use it as an interesting guide. parkrun itself says the comparison is approximate: it does not allow for different terrain or weather. A windy seafront and a sheltered, flat path are not the same assignment.",
        "If numbers motivate you, enjoy them. Perhaps you want to improve your age grade, your time on one familiar course or your ability to finish with a little energy left. If you would rather put the watch away and talk to your friend, that works too. The results email can wait until after breakfast.",
      ],
      sources: [
        {
          label: "parkrun · age grading explained",
          url: "https://support.parkrun.com/hc/en-us/articles/200565263-4-5-Age-grading",
        },
      ],
    },
    {
      id: "finding-running-again",
      heading: "Sometimes you’re finding your way back",
      paragraphs: [
        "Georgia Hunter Bell had been a talented junior before injuries during her time at university in California helped push her away from athletics. Running and parkrun became part of her return. In Paris in 2024 she won Olympic 1500m bronze in 3:52.61, then a British record.",
        "Her story offers something even if your own ambitions stop well short of an Olympic stadium. The activity you used to enjoy can become yours again. You are allowed to come back with a different pace, a different routine and a different idea of what a good morning looks like.",
        "In parkrun’s magazine, Roger Shapcott described returning after more than four years away, following pandemic disruption, cancer treatment and the death of his wife. He was 83 when interviewed and credited the encouragement around him with helping him return. His account is a reminder that a finish time rarely tells you what it took to reach the start.",
      ],
      sources: [
        {
          label: "Team GB · Hunter Bell’s comeback and Paris bronze",
          url: "https://www.teamgb.com/article/georgia-bell-marks-incredible-athletics-comeback-with-olympic-bronze/6XJDePdFETKKhA0gvQxFw3",
        },
        {
          label: "parkrun magazine · Roger’s account",
          url: "https://magazine.parkrun.com/people-of-parkrun/",
        },
      ],
    },
    {
      id: "friendships",
      heading: "Come for the five kilometres. Find your people",
      paragraphs: [
        "Leanne Alston’s first parkrun began with a practical problem: she didn’t know where the start was. She asked another participant for directions. The Saturday conversations continued, then became friendships, trips to other events and celebrations away from parkrun. She told the story in parkrun’s magazine. It is a fairly good return on asking the way.",
        "For Sally Nash, it was a familiar face that changed things. In her account for Pershore Plum Plodders, she recalls being nervous about finishing last before her first parkrun in April 2013. Through parkrun she reconnected with a school friend and eventually joined the club herself, despite initially thinking she would be too slow.",
        "You don’t have to be particularly good at making an entrance. Showing up again does a lot of the work. A nod becomes a hello. You remember a name. Somebody asks how last week went. Over time, the park can start to feel like somewhere you belong.",
        "There is no requirement to become an extrovert by the second lap. One small conversation is a perfectly respectable start.",
      ],
      image: {
        src: "/images/editorial/parkrun-south-manchester-king-februarius-2026.jpg",
        alt: "Participants gather beside the finish funnel and on the grass at South Manchester parkrun in Platt Fields Park.",
        caption:
          "After the finish at South Manchester parkrun, Platt Fields Park. Photograph: King Februarius / Wikimedia Commons, CC0 1.0. Wikimedia’s resized version; uncropped.",
        width: 1280,
        height: 960,
      },
      sources: [
        {
          label: "parkrun magazine · Leanne Alston’s friendship story",
          url: "https://magazine.parkrun.com/making-connections-the-art-of-conversation/",
        },
        {
          label: "Pershore Plum Plodders · Sally Nash’s account",
          url: "https://www.pershoreplumplodders.co.uk/?page_id=72576",
        },
        {
          label: "Photograph · King Februarius",
          url: "https://commons.wikimedia.org/wiki/File:South_Manchester_Parkrun.jpg",
        },
        {
          label: "Photo licence · CC0 1.0",
          url: "https://creativecommons.org/publicdomain/zero/1.0/",
        },
      ],
    },
    {
      id: "community",
      heading: "How a weekly habit changes a place",
      paragraphs: [
        "Andrew Waller first ran and walked Great Denham with a friend. More of his family became involved. He began volunteering, became an event director and helped assemble the team that launched Great Denham junior parkrun in July 2024. His account in parkrun’s magazine shows how one person’s tentative start can eventually open a door for other families.",
        "That is a practical kind of community change: people giving their time, learning names, putting out a course and making sure the next person has somewhere welcoming to begin. The run director and the person scanning your barcode are part of the morning you came for.",
        "If you’ve enjoyed taking part, ask about a volunteer role. The team can explain what is involved. You don’t need to have completed a prescribed number of parkruns before offering, and enthusiasm is considerably more useful than a speedy 5k.",
      ],
      sources: [
        {
          label: "parkrun magazine · Andrew Waller and Great Denham juniors",
          url: "https://magazine.parkrun.com/people-of-parkrun/",
        },
      ],
    },
    {
      id: "around-the-world",
      heading: "One barcode, a much bigger Saturday",
      paragraphs: [
        "Once you have registered, the same barcode works at parkruns around the world. It is a useful little travel companion: a reason to explore somewhere beyond the hotel breakfast room, and a way to join a local morning instead of just passing through it.",
        "Our country features visit Ireland, Australia, New Zealand, South Africa, Canada, the United States and Singapore. Each has its own stories, remarkable performances and local details. English is used across those communities, but parkrun’s welcome travels much further: the official event map also includes Japan, Germany, Poland, Italy and the Nordic countries, among others. Events in Namibia and Eswatini are part of the southern African network.",
        "Check the actual event before travelling. Start times vary by location and sometimes by season; Saturday morning does not mean the same clock time everywhere. Singapore’s official event poster, for example, gives 7.30am. That is information best discovered before you set the alarm.",
        "A visit abroad need not become a personal-best attempt. Meet the volunteers, listen to the briefing and enjoy seeing how the same simple idea has made itself at home somewhere else.",
      ],
      sources: [
        {
          label: "parkrun · one registration worldwide",
          url: "https://support.parkrun.com/hc/en-us/articles/205595392-1-1-How-do-I-register-for-parkrun",
        },
        { label: "parkrun · global event map", url: "https://www.parkrun.com/" },
        {
          label: "parkrun Singapore · official 7.30am poster",
          url: "https://resources.parkrun.com/resources/singapore-event-poster-7-30am-start",
        },
      ],
    },
    {
      id: "first-parkrun",
      heading: "Your first parkrun: the useful bit",
      paragraphs: [
        "Register free at parkrun and bring your scannable personal barcode if you want your participation recorded. You register once, rather than booking a place every week.",
        "Read your chosen event’s page for its exact start location, local time, course information and cancellation notices. Arrive in time for the first-timers’ welcome and the main briefing. Start with everyone else, complete the full course, follow the volunteers’ instructions at the finish and return your finish token after scanning. It is not a tiny souvenir medal.",
        "Walk, jog, run or mix them. At a 5k event, children under 11 must stay within arm’s reach of a parent, guardian or an adult chosen by their parent. The separate UK junior parkrun events are 2k for children aged 4–14, usually on Sunday mornings. Check the individual event’s arrangements.",
        "Wear something comfortable, allow yourself to be new and decide afterwards whether you’d like to come back. You do not need a target time to have a reason to go.",
      ],
      image: {
        src: "/images/editorial/parkrun-charlton-paul-w-2022.jpg",
        alt: "A group of adults setting off together across the grass at Charlton parkrun in London.",
        caption:
          "Starting together at Charlton parkrun, London, 19 February 2022. Photograph: Paul W / Wikimedia Commons, CC BY-SA 4.0. Wikimedia’s resized version; uncropped. The photograph remains under the same licence.",
        width: 1280,
        height: 961,
      },
      sources: [
        {
          label: "parkrun · barcodes and finish tokens",
          url: "https://support.parkrun.com/hc/en-us/articles/200566883-1-4-Barcodes",
        },
        {
          label: "parkrun · children at parkrun",
          url: "https://volunteer.parkrun.com/hc/en-us/articles/16857763557266-2-5-Children-at-parkrun",
        },
        {
          label: "parkrun · junior events",
          url: "https://support.parkrun.com/hc/en-us/articles/20039077073554-1-6-What-is-junior-parkrun",
        },
        {
          label: "parkrun · cancellation advice",
          url: "https://support.parkrun.com/hc/en-us/articles/20039144552338-1-9-How-will-I-know-if-my-event-is-cancelled",
        },
        {
          label: "Photograph · Paul W",
          url: "https://commons.wikimedia.org/wiki/File:Charlton_parkrun_start_(19_February_2022).jpg",
        },
        {
          label: "Photo licence · CC BY-SA 4.0",
          url: "https://creativecommons.org/licenses/by-sa/4.0/",
        },
      ],
    },
    {
      id: "your-achievements",
      heading: "Keep the mornings that matter",
      paragraphs: [
        "A personal best is worth remembering. So is your first finish, your return after years away, or the morning you realised you had stopped apologising for your pace.",
        "At AthRecs, we want to help you preserve your sporting history. Your parkrun finish times belong in that story. If a result is missing, a link to the published result helps us investigate it. An old newspaper clipping or results sheet may help recover another part of your history too.",
        "You might discover a performance you had forgotten. You might simply enjoy seeing how far you’ve come. Either is a good reason to keep the record.",
        "And next Saturday? There will be someone at their first-timers’ welcome, wondering whether they belong. You may be the person who says hello.",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I just turn up to parkrun?",
      answer:
        "Yes. Register once, free, with parkrun if you want a recorded result, then bring your scannable barcode. There is no separate weekly booking. Check the event’s start location, local time and cancellation notices before travelling.",
    },
    {
      question: "Can I walk the whole parkrun?",
      answer:
        "Yes. Walkers are welcome, there is no cut-off time and a volunteer Tail Walker remains at the back.",
    },
    {
      question: "Does parkrun still publish individual results?",
      answer: "Yes. Individual results and personal participation histories continue.",
    },
    {
      question: "Are parkrun times chip timed?",
      answer:
        "No. These are parkrun finish times recorded through the event’s timing and finish-token process. AthRecs keeps them distinct from chip-timed road-race results.",
    },
  ],
  callToAction: {
    heading: "Your achievements deserve to be remembered",
    text: "Create your AthRecs account to start bringing your sporting history together. Have a missing result? Share the published link so we can investigate it. We’re independent of parkrun; you don’t need an AthRecs account to join a parkrun.",
    label: "Create my athlete profile",
    url: "/join",
  },
  links: [
    { label: "Find a parkrun on AthRecs", url: "/races?sport=Parkrun" },
    { label: "Register free with parkrun", url: "https://www.parkrun.org.uk/register/" },
    { label: "parkrun in Ireland", url: "/news/parkrun-ireland-records-first-timers-community" },
    {
      label: "parkrun in Australia",
      url: "/news/parkrun-australia-records-community-first-timers",
    },
    { label: "parkrun in New Zealand", url: "/news/parkrun-new-zealand-age-records-community" },
    { label: "parkrun in South Africa", url: "/news/parkrun-south-africa-records-age-community" },
    { label: "parkrun in the USA", url: "/news/parkrun-united-states-age-records-community" },
    { label: "parkrun in Canada", url: "/news/parkrun-canada-records-all-ages-community" },
    { label: "parkrun in Singapore", url: "/news/parkrun-singapore-community-first-timers" },
    {
      label: "Main photograph · Kevin Wood",
      url: "https://commons.wikimedia.org/wiki/File:Bushy_parkrun_27th_September_2014_(15194006519).jpg",
    },
    {
      label: "Main photograph licence · CC BY 2.0",
      url: "https://creativecommons.org/licenses/by/2.0/",
    },
  ],
};
