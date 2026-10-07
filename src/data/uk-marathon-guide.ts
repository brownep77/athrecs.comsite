/** Editorial guide, not catalogue seeds. Official organiser pages checked 26 September 2026. */
export const UK_MARATHON_GUIDE_REVIEWED = "2026-09-26";
export const UK_MARATHON_GUIDE_PATH = "/running/uk-marathons";
export const UK_MARATHON_GUIDE_TITLE = "UK Road Marathons: 15 Popular Races | ATHRECS";
export const UK_MARATHON_GUIDE_DESCRIPTION =
  "Compare 15 popular UK road marathons, with confirmed dates through 2027, approximate field sizes, course details and official race links.";

export type UkMarathonGuideEntry = {
  id: string;
  name: string;
  location: string;
  nation: "England" | "Scotland" | "Wales" | "Northern Ireland";
  season: "Spring" | "Early summer" | "Autumn";
  surface: string;
  character: string;
  description: string;
  consideration: string;
  officialUrl: string;
};

// Presentation order is editorial, not a ranking by finishers or entries.
export const UK_MARATHONS: readonly UkMarathonGuideEntry[] = [
  {
    id: "london",
    name: "London Marathon",
    location: "London",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "Capital-city crowds",
    description:
      "London landmarks and a big-city atmosphere. The London Marathon is the UK's event in the Abbott World Marathon Majors series.",
    consideration:
      "Check the official ballot, charity and qualifying entry routes; entry is not guaranteed.",
    officialUrl: "https://www.londonmarathonevents.co.uk/london-marathon",
  },
  {
    id: "manchester",
    name: "Manchester Marathon",
    location: "Greater Manchester",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "Flat city course",
    description:
      "A large-field city marathon with a flat course and strong crowd support, making it a popular choice for a road-marathon target.",
    consideration: "Plan travel and accommodation around a busy race weekend.",
    officialUrl: "https://www.manchestermarathon.co.uk/",
  },
  {
    id: "brighton",
    name: "Brighton Marathon",
    location: "Brighton and Hove",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "Coastal city atmosphere",
    description:
      "A major coastal event combining city streets, seafront scenery and lively support in Brighton and Hove.",
    consideration:
      "The course has rolling terrain; coastal scenery does not mean an entirely flat run.",
    officialUrl:
      "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/brighton-marathon",
  },
  {
    id: "edinburgh",
    name: "Edinburgh Marathon",
    location: "Edinburgh and East Lothian",
    nation: "Scotland",
    season: "Spring",
    surface: "Road",
    character: "City to coast",
    description:
      "An Edinburgh start leads towards the East Lothian coast on a road course with a net downhill profile.",
    consideration:
      "Net downhill does not mean flat throughout. Check transport between the start and finish.",
    officialUrl: "https://www.edinburghmarathon.com/marathon",
  },
  {
    id: "belfast",
    name: "Belfast City Marathon",
    location: "Belfast",
    nation: "Northern Ireland",
    season: "Spring",
    surface: "Road",
    character: "Capital-city community support",
    description:
      "A well-established city marathon through Belfast, with local support and a route linking Stormont and Ormeau Park.",
    consideration:
      "Check the full-marathon entry category; the event also offers other ways to take part.",
    officialUrl: "https://belfastcitymarathon.com/events/2027-phoenix-energy-belfast-city-marathon",
  },
  {
    id: "chester",
    name: "Chester Marathon",
    location: "Chester and cross-border countryside",
    nation: "England",
    season: "Autumn",
    surface: "Road",
    character: "Historic city and countryside",
    description:
      "Historic Chester gives way to rural roads on a marathon that crosses the England–Wales border.",
    consideration: "Listed under England for its host city; part of the course is in Wales.",
    officialUrl: "https://www.activeleisureevents.co.uk/marathon",
  },
  {
    id: "yorkshire",
    name: "Yorkshire Marathon",
    location: "York and surrounding countryside",
    nation: "England",
    season: "Autumn",
    surface: "Road",
    character: "York and rural roads",
    description:
      "An established autumn marathon combining York and the surrounding countryside, with its event base at the University of York.",
    consideration:
      "Use the organiser's travel guidance for access to the university event village.",
    officialUrl: "https://www.runforall.com/events/marathon/yorkshire-marathon/",
  },
  {
    id: "milton-keynes",
    name: "Milton Keynes Marathon",
    location: "Milton Keynes",
    nation: "England",
    season: "Spring",
    surface: "Road and surfaced paths",
    character: "Parks and stadium finish",
    description:
      "Parks, lakes and the city's redways give this marathon a green setting, with a finish at Stadium MK.",
    consideration:
      "Expect a mix of roads and surfaced paths; consult the current course map before race day.",
    officialUrl: "https://mkmarathon.com/mk-marathon/",
  },
  {
    id: "southampton",
    name: "Southampton Marathon",
    location: "Southampton",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "City and waterfront",
    description:
      "A south-coast city marathon with waterfront scenery and the Itchen Bridge among its course landmarks.",
    consideration:
      "Allow for bridge climbs, and check the final route for your edition before planning a time target.",
    officialUrl: "https://www.southamptonmarathon.co.uk/abp-southampton-marathon-festival",
  },
  {
    id: "loch-ness",
    name: "Loch Ness Marathon",
    location: "Loch Ness to Inverness",
    nation: "Scotland",
    season: "Autumn",
    surface: "Road",
    character: "Highland scenery",
    description:
      "A scenic point-to-point road marathon through the Highlands towards Inverness, with Loch Ness as its signature backdrop.",
    consideration:
      "The rolling route includes notable climbs. Check the organiser's start-transfer arrangements.",
    officialUrl: "https://www.lochnessmarathon.com/event/loch-ness-marathon/",
  },
  {
    id: "abingdon",
    name: "Abingdon Marathon",
    location: "Abingdon, Oxfordshire",
    nation: "England",
    season: "Autumn",
    surface: "Almost entirely road",
    character: "Flat club-runner favourite",
    description:
      "An established marathon with a flat course, often chosen by club runners working towards a personal best.",
    consideration: "Review the current time limit and race conditions before entering.",
    officialUrl: "https://www.abingdonmarathon.org.uk/",
  },
  {
    id: "windermere",
    name: "Windermere Marathon",
    location: "Windermere, Cumbria",
    nation: "England",
    season: "Early summer",
    surface: "Road",
    character: "Hilly Lake District circuit",
    description:
      "A road marathon around Windermere that puts Lake District scenery at the centre of the experience.",
    consideration:
      "The route is hilly. Current organiser information places the 2027 edition in June; check the edition's venue and date.",
    officialUrl: "https://www.windermeremarathon.co.uk/",
  },
  {
    id: "boston-uk",
    name: "Boston Marathon UK",
    location: "Boston, Lincolnshire",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "Flat rural course",
    description:
      "A flat marathon on rural Lincolnshire roads, based in the English market town of Boston.",
    consideration:
      "This is Boston in the United Kingdom, not the Boston Marathon in Massachusetts, USA.",
    officialUrl: "https://www.bostonmarathon.co.uk/",
  },
  {
    id: "leeds",
    name: "Rob Burrow Leeds Marathon",
    location: "Leeds, West Yorkshire",
    nation: "England",
    season: "Spring",
    surface: "Road",
    character: "Charity and community",
    description:
      "A major charity-focused road marathon with its start and finish at Headingley Stadium.",
    consideration: "The course is hilly; account for the climbs when choosing your target pace.",
    officialUrl: "https://www.runforall.com/events/marathon/leeds-marathon/",
  },
  {
    id: "newport",
    name: "Newport Marathon",
    location: "Newport and the Gwent Levels",
    nation: "Wales",
    season: "Spring",
    surface: "Road",
    character: "Flat Welsh road course",
    description:
      "A flat road marathon through Newport and the Gwent Levels, attracting runners looking for a time-focused course.",
    consideration:
      "Confirm the current full-marathon route and entry conditions on the organiser's website.",
    officialUrl: "https://newportwalesmarathon.co.uk/",
  },
];

export const UK_MARATHON_FAQS = [
  {
    question: "What are some of the most popular road marathons in the UK?",
    answer:
      "London, Manchester, Brighton, Edinburgh and Belfast are prominent city-marathon choices. This AthRecs guide selects 15 popular and established road marathons across all four UK nations. It is an editorial selection, not a ranking by participant numbers.",
  },
  {
    question: "Which UK marathon is a World Marathon Major?",
    answer:
      "The London Marathon is the UK's event in the Abbott World Marathon Majors series. The phrase major UK marathons in this guide describes notable races more broadly; it does not mean all the races belong to that series.",
  },
  {
    question: "Which UK marathons have flatter courses?",
    answer:
      "Manchester, Newport, Abingdon and Boston Marathon UK are options to compare for flatter courses. Edinburgh has a net downhill profile, which is different from being flat throughout. Always check the current route, qualifying rules and conditions for your chosen edition.",
  },
  {
    question: "Which UK marathons are scenic or hilly?",
    answer:
      "Loch Ness and Windermere offer scenic road running with climbs. Leeds is another hilly road-marathon option, while Chester and Yorkshire combine city landmarks with countryside.",
  },
  {
    question: "Are there marathons in all four UK nations?",
    answer:
      "Yes. This guide includes races in England, Edinburgh and Loch Ness in Scotland, Newport in Wales, and Belfast City Marathon in Northern Ireland. Chester starts in England and also crosses into Wales.",
  },
  {
    question: "How long is a full marathon?",
    answer:
      "The standard marathon distance is 42.195 kilometres, usually described as 26.2 miles. Check the organiser's course and measurement information for your chosen race.",
  },
  {
    question: "How do I find dates, start times and entries?",
    answer:
      "The upcoming calendar lists officially confirmed full-marathon dates through 31 December 2027. Past editions disappear after their final race day in UK local time. Unconfirmed 2027 dates are labelled separately. Follow the linked organiser for local start times, prices, availability and entry conditions.",
  },
  {
    question: "What does approximate field size mean?",
    answer:
      "Approximate field size gives a rough idea of a marathon's scale using recent entries, reported runners or finishers. Each figure shows its measure, years and sources. It is not an exact registration average. Confirmed last-year entry totals are also shown where available.",
  },
] as const;
