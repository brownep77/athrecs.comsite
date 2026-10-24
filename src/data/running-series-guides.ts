/** Editorial series guides. Source checks and qualifications are recorded in docs/running-series-expansion.md. */
export type RunningSeriesGuide = {
  slug: string;
  name: string;
  shortDescription: string;
  kind: "series" | "collection";
  format: string;
  disciplines: string[];
  countries: { name: string; code?: string }[];
  overview: string[];
  amateurAdvice: string[];
  competitiveAdvice: string[];
  entryAdvice: string[];
  completionOrRanking: string[];
  planningAdvice: string[];
  faqs: { question: string; answer: string }[];
  officialLinks: { label: string; url: string }[];
  relatedCountryIds: string[];
  checkedAt: string;
};

export const RUNNING_SERIES_GUIDES: RunningSeriesGuide[] = [
  {
    slug: "european-marathon-classics",
    name: "European Marathon Classics",
    shortDescription:
      "Plan the European Marathon Classics challenge: complete five of eight European marathons, understand result verification and arrange individual race entries.",
    kind: "series",
    format: "Marathon completion challenge: five different member events",
    disciplines: ["Road running", "Marathon"],
    countries: [
      { name: "Italy", code: "IT" },
      { name: "Austria", code: "AT" },
      { name: "Spain", code: "ES" },
      { name: "United Kingdom", code: "GB" },
      { name: "Denmark", code: "DK" },
      { name: "Poland", code: "PL" },
      { name: "Portugal", code: "PT" },
      { name: "Germany", code: "DE" },
    ],
    overview: [
      "European Marathon Classics connects eight established European city marathons: Rome, Vienna, Madrid, London, Copenhagen, Warsaw, Lisbon and Frankfurt. Its completion challenge recognises runners who finish five different member marathons in five cities. You can choose the events that suit your interests and experience; completing all eight is not required for the standard Finisher award.",
      "There is no prescribed order and no final deadline for completing the challenge. That makes it possible to spread the marathons across several seasons. Registration with the challenge is separate from securing a place in each race. The exact event identity matters: a city's half marathon, a virtual run or another marathon with a similar name should never be assumed to qualify.",
      "The programme suits recreational runners building a long-term travel goal as well as experienced marathoners who want to combine competitive races with a completion project. Each individual marathon retains its own entry system, course, participant conditions and results. The challenge does not replace those requirements or create a single shared entry to the eight events.",
    ],
    amateurAdvice: [
      "Choose your first marathon for practical reasons: a realistic training period, manageable travel, an affordable entry route and a course that appeals to you. With no completion deadline, there is no reason to crowd several marathons into one season simply to collect progress. Leave room in the plan for recovery, disrupted training and changes to personal commitments.",
      "Keep an organised record of race confirmations and official results. Use consistent personal details when entering races and maintaining your challenge account so that a performance can be matched correctly. Check your online progress after each marathon; a medal photograph or an entry receipt alone is not the same as a verified finish.",
    ],
    competitiveAdvice: [
      "Treat the challenge and a performance campaign as two related plans. Compare the particular marathon's course, expected conditions, field and entry standards before choosing where to target a time. Elite or seeded placement remains a matter for that event's organiser; European Marathon Classics registration does not itself provide access to a professional field.",
      "If a race is intended to support selection or qualification elsewhere, check that competition's current acceptance rules and the exact official result. Keep gun and chip performances clearly identified. A marathon being included in this completion challenge does not automatically settle another governing body's course or qualification conditions.",
    ],
    entryAdvice: [
      "Create an account through the official European Marathon Classics website. Challenge registration is free, but you still need to obtain and pay for individual race entries through the appropriate organisers or their authorised routes. Confirm a race place before committing to travel that depends on admission; a challenge account is not a reserved bib.",
      "Historical-result verification became available in July 2026. If you have previously run one of the member marathons, use the account's official verification workflow. Historical archives are not uniformly complete, so do not assume that every older result will immediately appear or that an unverified claim already counts towards the award.",
    ],
    completionOrRanking: [
      "The standard target is five verified finishes at five different member marathons. Repeating the same member race does not turn it into a second city. This is a completion challenge rather than a separate championship points table; individual race placings remain with their respective marathons.",
      "The current FAQ describes digital e-coins in the runner's account and says physical coins are not distributed at individual finishes at present. The Finisher medal has a separate collection process: the organiser describes collection in person at an official EMC expo or finish line, not delivery by post. Check the arrangements before travelling to collect it.",
    ],
    planningAdvice: [
      "Build a flexible shortlist across the eight cities, then compare the confirmed edition dates and available entry routes. Plan registration deadlines as carefully as race dates. For each trip, allow time for bib collection, journeys to the start and departure after the finish; the most convenient hotel for sightseeing may not be the most convenient on race morning.",
      "Keep completion administration on a simple checklist alongside your training plan: entry secured, personal details checked, official finish saved, result verified and account progress reviewed. Recheck the programme's FAQ before your fifth qualifying marathon so you understand the recognition and collection process that applies when you finish.",
    ],
    faqs: [
      {
        question: "How many marathons do I need for European Marathon Classics?",
        answer:
          "Finish five different member marathons in five cities and have the results verified through European Marathon Classics. There are eight member events to choose from, and the challenge has no prescribed order or final completion deadline.",
      },
      {
        question: "Can my previous marathons count towards European Marathon Classics?",
        answer:
          "Historical results can count through the official verification process. Submit or match them in your EMC account and check that they have been accepted; past participation alone does not mean that the account has already credited the finish.",
      },
      {
        question: "Does European Marathon Classics registration include race entry?",
        answer:
          "No. Registering for the challenge is free, but entry to each marathon is arranged separately under that organiser's conditions. Your challenge account does not reserve a race place or provide an elite starting position.",
      },
    ],
    officialLinks: [
      {
        label: "European Marathon Classics and member races",
        url: "https://europeanmarathonclassics.eu/",
      },
      {
        label: "Challenge rules and runner questions",
        url: "https://europeanmarathonclassics.eu/the-classics-challenge/",
      },
      {
        label: "Official regulations",
        url: "https://europeanmarathonclassics.eu/wp-content/uploads/2026/02/EMC-Rules-and-Regulations.pdf",
      },
      {
        label: "Historical-result verification",
        url: "https://europeanmarathonclassics.eu/european-marathon-classics-unlocks-marathon-history-today/",
      },
    ],
    relatedCountryIds: ["uk", "spain", "portugal", "germany", "denmark"],
    checkedAt: "2026-10-23",
  },
  {
    slug: "marathon-des-sables",
    name: "Marathon des Sables",
    shortDescription:
      "Compare Marathon des Sables formats, including MDS Legendary and MDS 120, with entry, equipment and stage-race planning for amateur and competitive runners.",
    kind: "collection",
    format: "Desert and adventure event family with different stage formats",
    disciplines: ["Stage racing", "Desert running", "Walking"],
    countries: [{ name: "Morocco", code: "MA" }, { name: "Other destinations vary by format" }],
    overview: [
      "Marathon des Sables is an event family with several formats, rather than one interchangeable race specification. MDS Legendary is the established Moroccan Sahara stage race, covering approximately 250 kilometres over six stages with food self-sufficiency. The stage distances and route belong to the particular edition, so an older roadbook should not be treated as the final plan for a future race.",
      "MDS 120 offers 70, 100 and 120 kilometre options across three stages. Its shorter programme is a different undertaking from Legendary, with its own event arrangements. The wider family also includes formats such as Trek, Raid and Ultra; their staging, support and participant requirements differ. Start by choosing the exact format and destination before comparing entries.",
      "Running speed is only part of stage-race preparation. Organising equipment, handling your own supplies and being ready to move again on successive days all affect the experience. The official format pages and participant documents are the right place to establish what is carried, what is supplied and which checks apply to your chosen event.",
    ],
    amateurAdvice: [
      "Choose a format that fits your current experience and the preparation time available. A shorter total distance does not remove the demands of consecutive stages, unfamiliar terrain or carrying equipment. Compare the longest stage, time limits and camp arrangements before deciding that a particular option is suitable. Running and walking strategies must still comply with the event's rules.",
      "Practise the practical routine you expect to use: packing the required kit, accessing food, organising your shoes and clothing, and preparing for the following stage. Test equipment before travelling and keep it accessible in the order you will need it. Avoid making your first experience of a loaded pack the race's opening stage.",
    ],
    competitiveAdvice: [
      "A strong single-day result does not automatically predict a stage-race result. Plan for repeated efforts and the time spent managing equipment and supplies between stages. Study the official classification, stage procedures and penalties before building a race strategy. Use the published edition information rather than assuming that stage lengths repeat from a previous year.",
      "Contact the organiser directly about any elite, media or team arrangements you need. Check the exact category and result format for the event you are entering. An MDS family name on two races does not establish identical competitive rules, awards, support conditions or a shared season ranking.",
    ],
    entryAdvice: [
      "Use the official MDS format comparison to reach the event and edition you intend to enter. Read the inclusions and exclusions alongside the entry conditions: transfers, nights before or after the race, meals, carried supplies and equipment can differ between programmes. Make a full trip budget instead of comparing headline entry fees alone.",
      "Follow that edition's participant instructions for required documents, medical checks, insurance conditions and equipment inspections. Where a requirement is unclear, ask the organiser before purchasing specialist kit or travel. This guide explains planning considerations; the participant handbook and the appropriate qualified professionals govern personal medical and fitness decisions.",
    ],
    completionOrRanking: [
      "Completion is assessed under the rules of the selected event and distance. Legendary's approximately 250 kilometre, six-stage format and the three-stage MDS 120 options should be recorded as distinct achievements. Keep the event name, edition, selected distance and final official result together when adding the race to your running history.",
      "Do not assume that entering several MDS-branded events produces an automatic passport, combined medal or whole-family points total. The family contains different programmes. Any team classification, stage ranking or additional award must be confirmed in the rules for the event in which you are actually taking part.",
    ],
    planningAdvice: [
      "Work backwards from the official arrival, registration and transfer schedule, not just the first running stage. Include travel buffers, equipment preparation and the return journey in the time you set aside. Check baggage and transport arrangements for everything you intend to carry, especially if the event package begins at a specified meeting point.",
      "Make separate lists for mandatory equipment, personal supplies and items provided by the organiser. Keep a dated copy of the instructions and revisit it when the final participant documents arrive. If a format offers distance choices, understand when and how the selection is made and what it means for the stages, classification and finish recognition.",
    ],
    faqs: [
      {
        question: "How far is MDS Legendary?",
        answer:
          "MDS Legendary is approximately 250 kilometres across six stages in the Moroccan Sahara. The organiser publishes the route and stage details for each edition; the approximate total should not be treated as a promise of identical stages every year.",
      },
      {
        question: "What is the difference between MDS Legendary and MDS 120?",
        answer:
          "Legendary is the longer six-stage programme. MDS 120 has 70, 100 and 120 kilometre options over three stages. They have different participant arrangements, so compare the official format and edition documents before choosing.",
      },
      {
        question: "Can amateur runners enter Marathon des Sables events?",
        answer:
          "The event family includes programmes for a range of participants, but you must choose a suitable format and meet its entry, equipment and participant requirements. Check time limits and stage demands; being able to run a road marathon does not by itself answer those questions.",
      },
    ],
    officialLinks: [
      {
        label: "Compare the official MDS formats",
        url: "https://marathondessables.com/en/les-formats-du-marathon-des-sables",
      },
      {
        label: "MDS Legendary format",
        url: "https://marathondessables.com/en/format/mds-legendary",
      },
      { label: "MDS 120 format", url: "https://marathondessables.com/fr/format/mds-120" },
    ],
    relatedCountryIds: [],
    checkedAt: "2026-10-23",
  },
  {
    slug: "racingtheplanet-4-deserts",
    name: "RacingThePlanet and the 4 Deserts",
    shortDescription:
      "Understand RacingThePlanet stage races, the four-desert completion challenge, Grand Slam options and the separate entry requirements for The Last Desert.",
    kind: "series",
    format: "Multi-stage ultras with 4 Deserts Club and Grand Slam challenges",
    disciplines: ["Stage racing", "Ultramarathon", "Desert running"],
    countries: [
      { name: "Namibia", code: "NA" },
      { name: "Mongolia", code: "MN" },
      { name: "Chile", code: "CL" },
      { name: "Antarctica" },
    ],
    overview: [
      "RacingThePlanet organises multi-stage ultramarathons and the 4 Deserts challenge. The current four-desert set consists of the Namib Race in Namibia, Gobi March in Mongolia, Atacama Crossing in Chile and The Last Desert in Antarctica. These are distinct destinations and events; the travelling RacingThePlanet Ultramarathon is an additional programme whose location changes.",
      "The full stage-race format is approximately 250 kilometres over six stages in seven days. Participants carry their own food, clothing and personal equipment, while the organiser supplies water, tents and event support under the published arrangements. Use the individual race's instructions to understand the precise equipment, travel and staging requirements.",
      "The 4 Deserts Club recognises completion of the four-desert set. The Grand Slam adds a time condition: finish all four within a single year. Grand Slam Plus also includes the designated travelling RacingThePlanet Ultramarathon. These are separate achievements, and the existence of a race in the wider calendar does not make every distance or shortened format eligible.",
    ],
    amateurAdvice: [
      "Begin by assessing one suitable stage race, rather than committing to a four-event travel plan before understanding the format. Read the longest-stage information, checkpoint arrangements and required equipment. Consider the time needed to prepare and to travel, as well as your ability to organise supplies and repeat the routine over several consecutive days.",
      "Practise carrying the equipment you intend to use and organising your food and clothing without a daily hotel reset. Keep a clear packing inventory and check it against the event's current mandatory list. Preparation is easier when you know which items the organiser provides and which must remain with you throughout the race.",
    ],
    competitiveAdvice: [
      "Review the event rules for stage timing, classification, team categories and penalties before choosing a race strategy. Stage results and overall positions answer different questions; preserve the official final classification when recording the performance. A single fast stage does not establish the outcome of the whole multi-day event.",
      "For an ambitious multi-race campaign, map the actual calendar alongside preparation, recovery and international travel. The organiser's current Grand Slam page advertises a complete programme for 2028. That evidence does not establish a four-race Grand Slam schedule for 2027, and this guide does not infer one from recurring events.",
    ],
    entryAdvice: [
      "Choose the exact race and distance on the official calendar, then check entry requirements, inclusions and payment conditions. Compare the meeting point with the race destination when booking transport. Antarctic travel in particular is a different logistical commitment from an ordinary city race; the organiser's own itinerary should drive the booking plan.",
      "The Last Desert has a qualification requirement: the published FAQ requires at least two accepted prior RacingThePlanet or 4 Deserts ultras. Confirm which completions satisfy that requirement before applying. The separate one-day Antarctica Ultramarathon is a different event; do not transfer eligibility, distance or completion assumptions between the two programmes.",
    ],
    completionOrRanking: [
      "For the 4 Deserts Club, confirm that the organiser has recognised your full-event completion at each of the four required races. Keep the race edition and official result with your records. Entering a race, completing a shorter alternative or attending the same destination does not necessarily satisfy the full-event completion requirement.",
      "Grand Slam and Grand Slam Plus require the designated events within the organiser's specified single-year programme. Read the current challenge page before committing to several entries; a travelling race's destination may be announced separately. The final decision on recognition and any exception belongs to RacingThePlanet, rather than an independently assembled list of race names.",
    ],
    planningAdvice: [
      "Create an itinerary that includes arrival, registration, equipment checks and post-race travel, as well as the running days. Check passport, transit and destination requirements using the appropriate official authorities for your own circumstances. Keep important participant documents accessible during the journey instead of relying on a single saved email.",
      "Budget for the complete undertaking: event entry, transport to the meeting point, accommodation outside the package, equipment and the time away. Revisit the current equipment and participant instructions as departure approaches. Treat desert and Antarctic events as different environments with their own mandatory lists, rather than trying to reuse one unchanged checklist.",
    ],
    faqs: [
      {
        question: "Which races make up the 4 Deserts?",
        answer:
          "The current set is the Namib Race in Namibia, Gobi March in Mongolia, Atacama Crossing in Chile and The Last Desert in Antarctica. Check the official Club rules for the recognised full-event completions.",
      },
      {
        question: "What is the difference between the 4 Deserts Club and Grand Slam?",
        answer:
          "The Club recognises completion of all four deserts. The Grand Slam requires all four within one year; Grand Slam Plus also requires the designated travelling RacingThePlanet Ultramarathon. Check the programme and eligibility rules before booking.",
      },
      {
        question: "Can I enter The Last Desert as my first RacingThePlanet race?",
        answer:
          "The published FAQ requires at least two accepted prior RacingThePlanet or 4 Deserts ultras for The Last Desert. Ask the organiser to confirm your qualifying races. The separate one-day Antarctica Ultramarathon has its own arrangements.",
      },
    ],
    officialLinks: [
      {
        label: "RacingThePlanet participant questions",
        url: "https://www.racingtheplanet.com/frequently-asked-questions",
      },
      { label: "4 Deserts Club", url: "https://www.racingtheplanet.com/4-deserts-club" },
      {
        label: "4 Deserts Grand Slam",
        url: "https://www.racingtheplanet.com/4-deserts-grand-slam",
      },
      {
        label: "Race calendar and entry details",
        url: "https://www.racingtheplanet.com/entry-details",
      },
    ],
    relatedCountryIds: [],
    checkedAt: "2026-10-23",
  },
  {
    slug: "golden-trail-world-series",
    name: "Golden Trail World Series",
    shortDescription:
      "Explore the Golden Trail World Series: mountain racing, public and elite entry routes, season rankings and practical preparation for competitive trail events.",
    kind: "series",
    format: "International trail-running championship with a Grand Finale",
    disciplines: ["Trail running", "Mountain running"],
    countries: [{ name: "International calendar" }],
    overview: [
      "The Golden Trail World Series brings together international trail races and a season championship. Individual events have their own courses, local organisers and entry arrangements. The World Series is part of a wider Golden Trail structure that also includes National Series, whose calendars and pathways must be checked separately.",
      "These are mountain and trail competitions, so a course's distance alone does not explain the challenge. Ascent, descent, surface and technical sections affect how a race feels and how long it takes. Read the actual event profile and participant instructions before comparing it with a road race of a similar nominal distance.",
      "Public participation and the elite championship operate through different arrangements. A runner may seek an ordinary event entry, while invited or qualifying athletes follow the series' competitive procedures. Neither appearing on an event's public start list nor registering for a National Series should be treated as an automatic World Series invitation.",
    ],
    amateurAdvice: [
      "Choose a particular event because its course, time limits and entry conditions suit you. Review the terrain and required equipment before making travel plans. Familiarity with a race from live coverage is useful inspiration, but it does not establish the conditions or access arrangements that apply to your own entry.",
      "Prepare for both climbing and descending on surfaces comparable with the course. Allow for the time spent moving through technical terrain when estimating your race duration. Study checkpoint and mandatory-kit instructions, and use the organiser's current route information rather than assuming a track from an earlier edition remains correct.",
    ],
    competitiveAdvice: [
      "For the 2026 season, the later official scoring explanation describes four counting results from seven regular races, followed by the Grand Finale. Segment bonuses and a team classification also form part of that season's competition. These details are labelled 2026 here because scoring structures should be rechecked when a new season's rules are published.",
      "Before committing to a championship campaign, check eligibility, entry allocation, the counting-race rules, finale requirements and any team arrangements. Use the current dedicated rules and season updates if a general information page retains older wording. Do not plan travel or a points target from an earlier year's formula alone.",
    ],
    entryAdvice: [
      "Follow the World Series calendar to the official organiser of your chosen race. Read its public-entry conditions and determine whether entry is open, allocated or subject to another process. A race's inclusion in the series does not mean that ordinary entries are continuously available, or that a series registration reserves a place.",
      "Athletes seeking an elite place should follow the series and race organiser's published process and supply the requested evidence. If pursuing a National Series pathway, read the rules for that specific country and season. Different national programmes should not be assumed to offer identical qualifying places, benefits or eligibility conditions.",
    ],
    completionOrRanking: [
      "The World Series ranks competitive performances under its season rules. Finishing one event and earning a position in the final championship are different outcomes, and neither should be confused with a passport-style requirement to complete every venue. Keep the exact edition, distance and official classification when recording a result.",
      "Use the organiser's live standings and current rules to interpret points and qualification. General introductions can remain online after the scoring system changes: for 2026, later official reporting corroborates four counting regular results, while older introductory wording refers to three. Future seasons require their own check rather than automatic reuse of either figure.",
    ],
    planningAdvice: [
      "Plan accommodation and transport around race registration, the starting location and the return journey from the finish. Mountain venues can require arrangements different from a city centre race. Check the event's travel information and any mandatory briefing times before deciding that a short visit or same-day arrival will work.",
      "Keep a practical race file with the organiser's route, elevation profile, mandatory equipment list, cut-offs and communication instructions. Competitive runners should add the season rules and confirmed entry correspondence. Separate your personal performance goal from the championship calculation so that a change to travel or one race result does not leave the whole plan unclear.",
    ],
    faqs: [
      {
        question: "Can amateur runners enter Golden Trail World Series races?",
        answer:
          "Check the public-entry arrangements for the individual race. Taking part through an ordinary entry and receiving an elite invitation are separate matters, and availability or eligibility differs between events.",
      },
      {
        question: "How does Golden Trail World Series scoring work?",
        answer:
          "The later official 2026 explanation uses four counting results from seven regular races plus the Grand Finale, with additional season-specific rules. Consult the current rules before planning another season; the formula is not assumed to continue unchanged.",
      },
      {
        question: "Is a Golden Trail National Series the same as the World Series?",
        answer:
          "No. National Series have their own events and rules and may provide competitive pathways. Check the particular country's programme and current qualifying arrangements rather than assuming a national result automatically secures a World Series place.",
      },
    ],
    officialLinks: [
      {
        label: "Official series calendar and race information",
        url: "https://goldentrailseries.com/",
      },
      {
        label: "2026 scoring and team-ranking explanation",
        url: "https://goldentrailseries.com/inside-the-gtws-2026-team-ranking-format-scoring-and-whats-at-stake/",
      },
      {
        label: "September 2026 championship update",
        url: "https://goldentrailseries.com/kipngeno-and-groeber-conquer-myoko-trail-as-kiriago-takes-over-the-gtws-lead/",
      },
    ],
    relatedCountryIds: ["spain", "canada"],
    checkedAt: "2026-10-23",
  },
  {
    slug: "world-trail-majors",
    name: "World Trail Majors",
    shortDescription:
      "Compare World Trail Majors events, the main circuit and Short Series, with practical entry and race-planning advice for amateur and competitive trail runners.",
    kind: "series",
    format: "International trail circuit with main and Short Series competitions",
    disciplines: ["Trail running", "Ultramarathon"],
    countries: [{ name: "International calendar" }],
    overview: [
      "World Trail Majors brings together independently organised trail events in an international circuit. Its member races retain their own character, courses and local arrangements. The association provides a shared competitive setting, while race entry and practical participation remain matters for each organiser and the specific distance you choose.",
      "The main circuit and the Short Series are separate programmes. Centurion's official member information identifies the South Downs Way 100 with the main circuit and the South Downs Way 50km with the Short Series. Aravaipa's Black Canyon information also identifies World Trail Majors membership. These examples are useful starting points, not a complete current membership list.",
      "Runners should distinguish an event weekend from its qualifying series distance. A festival may contain several races, but inclusion of one distance does not establish that every option contributes to the same competition. Check the World Trail Majors calendar alongside the member organiser's exact race page before selecting an entry.",
    ],
    amateurAdvice: [
      "Choose an individual race that matches your experience, preparation and practical support needs. Compare distance, ascent, surface, time limits and overnight running where relevant. A place on an international circuit does not make two ultra courses interchangeable, and a shorter series option still deserves its own assessment of terrain and duration.",
      "Read the organiser's requirements for navigation, mandatory kit, checkpoints, drop bags and support. Build your preparation around the actual course and permitted assistance. If travelling with family or a crew, check where they can meet you and how they can move between locations; unrestricted road access should never be assumed.",
    ],
    competitiveAdvice: [
      "Before targeting a series position, check the current season's eligibility, scoring, counting-race conditions and any awards directly with World Trail Majors. This guide does not reproduce an unverified numerical points table or prize fund. An old announcement can explain the circuit's background without proving that every competitive condition remains unchanged.",
      "For each race, clarify elite entry, starting arrangements and the official result that will be used for classification. Keep any invitation or special arrangement in writing. A course may also have relationships with other competitions, but those qualifications are separate: World Trail Majors membership alone does not establish eligibility for a different championship or final.",
    ],
    entryAdvice: [
      "Enter through the official member event and select the appropriate edition and distance. Check the entry method, any prior-experience requirement, mandatory documents and the cancellation or transfer policy. Organisers operate independently, so one race's application process should not be treated as a template for every other member event.",
      "Confirm your place before arranging travel that depends on entry. If your aim is the main circuit or Short Series, ask the organiser to confirm which race at that weekend counts. Retain the confirmation and participant instructions, especially if the event page includes several routes with similar names or distances.",
    ],
    completionOrRanking: [
      "The circuit's competitive classifications and an individual race finish are different records. Save the event name, edition, distance, finish status and official result rather than recording only the wider series name. Use the current official standings to determine whether and how your performance contributes to the competition.",
      "There is no basis here for promising a universal completion medal simply for accumulating member events. Consult the current programme for any specific recognition. Main-circuit and Short Series performances should remain distinct, and any outside qualification advertised by a member race should be checked against the receiving competition's own rules.",
    ],
    planningAdvice: [
      "Build an event-by-event schedule covering registration, briefings, start transport, race duration and the journey home. Include the time needed for kit checks and any finish transfer. For long races, think through the practical effect of arriving back after public transport has finished, rather than planning around an optimistic finish estimate alone.",
      "For an international campaign, compare the cost and time commitment of the full trips, not just entry fees. Keep room for preparation and recovery between races. Recheck the member calendar and official rules when a new season is announced; the circuit can be a useful way to discover races without requiring you to attempt a complete season.",
    ],
    faqs: [
      {
        question: "What is World Trail Majors?",
        answer:
          "It is an international circuit of independently organised trail events. Member organisers run their own races and entries, while World Trail Majors provides the wider competitive programme. Check the current official calendar for the eligible events and distances.",
      },
      {
        question: "Does every distance at a World Trail Majors event count?",
        answer:
          "Do not assume so. The main circuit and Short Series are separate, and a race weekend may contain additional distances. Confirm the exact eligible race with the series and event organiser before entering for a competitive target.",
      },
      {
        question: "Can amateur runners take part in World Trail Majors events?",
        answer:
          "Check the individual organiser's entry conditions. Assess the course, time limits, experience requirements and mandatory equipment for your selected race; participation and elite or series-ranking eligibility are separate questions.",
      },
    ],
    officialLinks: [
      { label: "World Trail Majors official website", url: "https://worldtrailmajors.com/" },
      {
        label: "Member organiser's circuit introduction",
        url: "https://www.aravaiparunning.com/2023/11/13/world-trail-majors-is-born/",
      },
      {
        label: "Centurion: main circuit and Short Series",
        url: "https://www.centurionrunning.com/landing/world-trail-majors",
      },
      {
        label: "Black Canyon official race information",
        url: "https://www.aravaiparunning.com/blackcanyon/",
      },
    ],
    relatedCountryIds: ["uk", "usa"],
    checkedAt: "2026-10-23",
  },
  {
    slug: "runczech",
    name: "RunCzech races and challenges",
    shortDescription:
      "Explore RunCzech races, the five-race Halfs challenge, RunCzech Stars and EuroHeroes, with clear entry and completion advice for amateur and competitive runners.",
    kind: "collection",
    format: "Event family with distinct completion and elite competition programmes",
    disciplines: ["Road running", "Half marathon", "Marathon", "Selected trail events"],
    countries: [{ name: "Czechia", code: "CZ" }],
    overview: [
      "RunCzech organises a range of races and operates several different running programmes. Its Czech calendar includes Prague's major road races and regional events, while its challenge pages describe separate goals for participants. RunCzech Halfs, RunCzech Stars and EuroHeroes each have their own purpose and conditions; they should not be treated as one combined league.",
      "RunCzech Halfs comprises five half marathons: Prague, Karlovy Vary, České Budějovice, Olomouc and Ústí nad Labem. The published challenge gives runners 36 months from their first qualifying race to complete the five, with eligible results beginning in 2025. Progress is tracked through Runners ID under the programme's own rules.",
      "Prague Half Marathon is also a SuperHalfs event, but the two challenges are separate. A RunCzech account, race entry or regional half-marathon result does not by itself establish a SuperHalfs credit. Check the appropriate account and completion requirements for every programme you intend to follow.",
    ],
    amateurAdvice: [
      "For a manageable completion goal, compare the five Halfs events by travel, confirmed dates and the time you want between races. The 36-month window allows a plan across several seasons, but it still has a defined starting point. Record the date of your first qualifying race and check your account's displayed progress rather than relying on memory.",
      "Keep your registration details consistent in Runners ID and review the result after each race. If a finish is missing or attached incorrectly, use the organiser's result-correction instructions. Check the exact distance when entering a festival: a relay, shorter run or shared marathon option is not interchangeable with an individual qualifying half marathon.",
    ],
    competitiveAdvice: [
      "EuroHeroes is the European elite competition associated with the four regional half marathons in Karlovy Vary, České Budějovice, Olomouc and Ústí nad Labem. Its published ranking system uses the best two scoring performances and World Athletics scoring tables. The full athlete-eligibility and participation conditions still need to be checked with the organiser.",
      "Public entry to one of these races should not be treated as automatic eligibility for the elite standings. Competitive athletes should follow RunCzech's current elite contact and application process and retain the requested performance evidence. Check which official time and classification applies before using a result for selection, a seed request or another competition.",
    ],
    entryAdvice: [
      "Use the official RunCzech calendar to select the exact event, year and distance, then follow the organiser's entry route. Runners ID is used for account management and challenge tracking, but a profile does not reserve a race place. Read the event's current allocation, transfer and participant conditions before arranging a trip.",
      "For RunCzech Halfs, the organiser describes automatic registration and tracking through Runners ID. Check the programme page for the eligible results and correction process. If you are pursuing SuperHalfs at the same time, maintain the separate SuperPassport requirements and confirm that the relevant result appears in both systems where it should.",
    ],
    completionOrRanking: [
      "RunCzech Stars has a different target from Halfs: complete the required individual races within one season. The published selection includes Prague Half Marathon and Marathon, the four regional half marathons, Prague 10K and the specified 12km or 22km Liberec trail option. Relays, 2Run and other shorter alternatives do not substitute for those individual-race requirements.",
      "Keep the three goals distinct when planning: Halfs is five designated half marathons within its 36-month window; Stars requires its broader race selection within one season; EuroHeroes is an elite ranking competition. Use the current programme page before setting a target, since completing one programme's race list does not automatically complete another.",
    ],
    planningAdvice: [
      "Build a calendar from edition-specific organiser announcements. Regional festivals may offer several distances with different starts and participant arrangements, so use the timetable for your own race. Plan bib collection and transport between accommodation, start and finish rather than assuming that every event follows Prague's procedures.",
      "For a multi-race project, keep one record per race with its entry, official result and each challenge credit you expect. Review the overall plan after every finish. If you change distance or transfer an entry, check what that means for Halfs or Stars before assuming the original completion plan remains intact.",
    ],
    faqs: [
      {
        question: "What are the five RunCzech Halfs races?",
        answer:
          "The challenge consists of the Prague, Karlovy Vary, České Budějovice, Olomouc and Ústí nad Labem half marathons. The published rules allow 36 months from the first qualifying race and recognise eligible results from 2025 onward.",
      },
      {
        question: "Is RunCzech Halfs the same as SuperHalfs?",
        answer:
          "No. Prague Half Marathon belongs to both, but they are separate challenges with their own tracking and completion requirements. The other RunCzech Halfs events should not be assumed to count towards SuperHalfs.",
      },
      {
        question: "How do RunCzech Stars and EuroHeroes differ?",
        answer:
          "Stars is a completion programme for a specified set of individual races within one season. EuroHeroes is an elite European competition at four regional half marathons, with its own eligibility and performance-ranking rules.",
      },
    ],
    officialLinks: [
      { label: "RunCzech official race calendar", url: "https://www.runczech.com/en/events" },
      {
        label: "RunCzech Halfs rules and questions",
        url: "https://www.runczech.com/en/running-league/runczech-halfs/runczech-halfs",
      },
      {
        label: "RunCzech Stars completion rules",
        url: "https://www.runczech.com/en/for-you/communities/runczech-stars",
      },
      {
        label: "EuroHeroes programme",
        url: "https://www.runczech.com/en/running-league/euroheroes/project-euroheroes",
      },
      {
        label: "EuroHeroes ranking system",
        url: "https://www.runczech.com/en/running-league/euroheroes/ranking-system",
      },
    ],
    relatedCountryIds: ["czechia"],
    checkedAt: "2026-10-23",
  },
  {
    slug: "great-run",
    name: "Great Run series",
    shortDescription:
      "Compare Great Run events and distances, from the Great North Run to city races, with public entry, elite application and race-day planning information.",
    kind: "collection",
    format: "UK running event family with event-specific entry and awards",
    disciplines: ["Road running", "Half marathon", "10 miles", "10km", "Other event distances"],
    countries: [{ name: "United Kingdom", code: "GB" }],
    overview: [
      "Great Run is a family of mass-participation running events, including the Great North Run, Great South Run, Great Manchester Run, Great Birmingham Run, Great Bristol Run and Great Scottish Run. The events offer different distances and settings. Use the individual event page to establish exactly which race, location and entry route you are comparing.",
      "The Great North Run is the half marathon from Newcastle to South Shields. It has its own entry arrangements and elite policy. Other Great Run events should not be assumed to share its ballot process, course distance, starting procedures or conditions simply because they belong to the same organiser's event family.",
      "For recreational runners, the family offers opportunities to choose a large public event around a personal goal. For competitive runners, there are event-specific elite applications and prize conditions. The name 'series' describes a connected event programme here; it does not establish a universal points league or a completion medal for running every event.",
    ],
    amateurAdvice: [
      "Choose a distance and location that fit your preparation and travel plans. At a busy event, collecting information about your start area, wave and route to the venue can be as useful as comparing finish times. Read your own participant instructions instead of following another runner's timetable from a different distance or wave.",
      "If running with friends, check the organiser's arrangements for start groups and meeting afterwards. Agree a practical meeting place and allow for congestion around the finish. Keep your official entry details accessible and review the baggage, transport and permitted-item instructions before leaving home; these are specific to the event and edition.",
    ],
    competitiveAdvice: [
      "Great Run publishes an elite-entry process, with a separate policy for the Great North Run. Places are discretionary and limited: meeting a published standard does not by itself guarantee acceptance. Supply the requested performance evidence and wait for confirmation rather than assuming that an ordinary public entry will be converted automatically.",
      "The official elite information states that prize positions are determined by gun time. Competitive runners should understand their start allocation and prize eligibility before racing, and keep gun and chip results distinct in subsequent applications. Recheck the current event's standards and awards rather than relying on numerical thresholds or prize amounts from an earlier season.",
    ],
    entryAdvice: [
      "Start with the official Great Run events page and choose the correct race and edition. Follow that event's public-entry process and read the conditions for any alternative route you use. A charity place, public allocation and elite invitation can involve different commitments; confirm the terms of the actual place you obtain.",
      "Review the participant FAQ for transfer, withdrawal, race-pack and practical questions. Do not assume that entry to one Great Run event covers another race or an additional distance on the same weekend. Secure the right place before making travel bookings whose usefulness depends on taking part.",
    ],
    completionOrRanking: [
      "Each event publishes its own results and award arrangements. Record the event name, edition, distance and official finish so that a 10km performance, ten-mile race and half marathon are not confused. Where chip and gun times are both supplied, retain their labels rather than treating them as identical measures.",
      "A personal goal of completing several Great Run events is a valid way to plan a season, but it is not automatically an organiser-recognised whole-family challenge. Check for a specifically published programme before expecting a combined medal, passport or ranking. Event-specific prizes and categories continue to follow the relevant race's rules.",
    ],
    planningAdvice: [
      "For the Great North Run, plan both the journey to Newcastle's start arrangements and the return from the finish in South Shields. For other events, identify their own start and finish locations rather than assuming an out-and-back trip. Check official transport information close to race day, particularly when road closures affect normal travel.",
      "Allow time for the correct start assembly and for the period after finishing. Spectators should use the organiser's guidance for viewing and meeting points. If you are comparing several events, make a simple table of distance, confirmed date, entry status and total travel cost before deciding which best serves your current running goal.",
    ],
    faqs: [
      {
        question: "Is the Great Run series a single completion challenge?",
        answer:
          "Great Run is an event family with separate races and conditions. Do not assume there is a universal all-events completion medal or points table; check any specifically advertised programme and the individual event rules.",
      },
      {
        question: "How do competitive runners apply for Great Run elite entry?",
        answer:
          "Use Great Run's official elite-entry information and the policy for the selected event. The Great North Run has separate arrangements. Published standards do not guarantee acceptance; an elite place requires organiser confirmation.",
      },
      {
        question: "Are Great Run prize positions based on chip time?",
        answer:
          "The official elite information states that prize positions use gun time. Check your event's current prize eligibility and starting arrangements, and keep chip and gun times clearly identified in your performance records.",
      },
    ],
    officialLinks: [
      { label: "Great Run events and distances", url: "https://www.greatrun.org/events/" },
      {
        label: "Great Run elite-entry information",
        url: "https://www.greatrun.org/elite-entries/",
      },
      { label: "Great Run participant questions", url: "https://www.greatrun.org/faqs/" },
      {
        label: "Great North Run official information",
        url: "https://www.greatrun.org/events/great-north-run/",
      },
    ],
    relatedCountryIds: ["uk"],
    checkedAt: "2026-10-23",
  },
  {
    slug: "runthrough",
    name: "RunThrough races and Top Flight",
    shortDescription:
      "Find a suitable RunThrough race, compare distances and venues, and understand the separate Top Flight entry, wave and prize conditions for competitive runners.",
    kind: "collection",
    format: "Running event family with a separate Top Flight competition programme",
    disciplines: ["Road running", "Trail running", "Multiple race distances"],
    countries: [{ name: "United Kingdom", code: "GB" }, { name: "Other event locations vary" }],
    overview: [
      "RunThrough operates a broad calendar of running events across different distances, surfaces and venues. The general calendar is an event family rather than one automatically combined season league. Search for the particular race, edition and distance that fits your goal, since a venue may host several events during the year.",
      "The organiser welcomes recreational and first-time runners as well as competitive participants. That does not make every distance equally suitable for every runner: check the course, time limits and practical requirements before choosing. A road race, trail event and circuit-based race can offer very different experiences even when the advertised distance is similar.",
      "Top Flight is a separate competitive programme within the wider RunThrough offering. Its entry and prize requirements should be read alongside the specific event information. An ordinary public entry does not automatically establish eligibility for Top Flight benefits, the appropriate competitive wave or prize-related support.",
    ],
    amateurAdvice: [
      "Start with a manageable distance and a venue you can reach without an unnecessarily difficult journey. Look at surface, elevation, lap format and the published limit where applicable. If a location offers several distances, check that your confirmation and race-day instructions refer to the one you intend to complete.",
      "Plan number collection, arrival and the journey to the start using the event's own instructions. Read the organiser's chip-timing explanation and follow the directions for wearing the timing equipment. Keep your registration details and emergency information accurate, and check how the organiser communicates any final changes before race day.",
    ],
    competitiveAdvice: [
      "Review Top Flight's current qualifying and application conditions if you are seeking free or reduced entry. The organiser's prize guidance ties eligibility to the appropriate elite or Top Flight entry and start wave. A fast result from another wave should not be assumed to qualify for prizes or expense support automatically.",
      "If your goal is an external championship standard or a good-for-age entry elsewhere, verify the exact event's course certification and the receiving competition's current rules. A general claim about an organiser's calendar is not enough to establish every individual race's acceptance. Retain the official result, distance and timing labels needed for your application.",
    ],
    entryAdvice: [
      "Use the official event finder and verify the race name, date, venue and distance before paying. Repeated events at the same venue can look similar in a search result. Check the entry inclusions and participant instructions for that specific booking rather than relying on details from another RunThrough race you have completed.",
      "Read the current transfer policy before making changes to your entry. The permitted process, deadlines and any charges should come from the organiser's current guidance. For Top Flight, complete the separate application or entry process and obtain confirmation of your allocation; do not wait until race morning to resolve competitive eligibility.",
    ],
    completionOrRanking: [
      "Use the individual race's official results for the performance you record. Preserve the edition and distance, together with the distinction between chip and gun time where both are provided. Running a race at a familiar venue does not mean it is the same edition or course as another result in your history.",
      "The general RunThrough calendar should not be presented as a universal medal-collection challenge or an automatic cumulative ranking. Top Flight and any specifically named series have their own requirements. If a competitive target depends on a prize, qualifying result or season standing, confirm the relevant programme rather than inferring it from the organiser's name.",
    ],
    planningAdvice: [
      "Compare the full event-day plan as well as the distance: travel time, parking or public transport, number collection, start time and the route home. Use the correct edition instructions for spectator access and facilities. When several races share a venue, allow for their separate assembly and start arrangements.",
      "For a sequence of local races, choose each event for a clear purpose, such as a first finish, a measured progress check or a target performance. Keep the schedule flexible enough to respond to preparation and recovery. Competitive runners should add confirmation of the correct wave, current prize conditions and any external qualification requirements to the same checklist.",
    ],
    faqs: [
      {
        question: "Are RunThrough races only for elite runners?",
        answer:
          "No. RunThrough's participant information welcomes recreational and first-time runners too. Choose a suitable distance and course, and check the specific event's time limits and practical requirements before entering.",
      },
      {
        question: "Does a normal RunThrough entry include Top Flight eligibility?",
        answer:
          "Do not assume so. Top Flight has its own qualifying and entry conditions, and the organiser's prize guidance requires the appropriate entry and start wave. Confirm your allocation before relying on prizes or expense support.",
      },
      {
        question: "Can a RunThrough result qualify me for another race?",
        answer:
          "Check the exact event's certification and the receiving competition's rules. Acceptance can depend on distance, course conditions, date and the required result evidence; the organiser's name alone does not establish eligibility.",
      },
    ],
    officialLinks: [
      {
        label: "RunThrough official event finder",
        url: "https://www.runthrough.co.uk/events-timeline",
      },
      { label: "Top Flight programme", url: "https://www.runthrough.co.uk/series/top-flight" },
      {
        label: "Prize and competitive-entry conditions",
        url: "https://www.runthrough.co.uk/prizes",
      },
      {
        label: "Participant questions",
        url: "https://www.runthrough.co.uk/help/collection/frequently-asked-questions",
      },
      { label: "Entry transfer policy", url: "https://www.runthrough.co.uk/help/transfer-policy" },
      {
        label: "Course certification and qualifying standards",
        url: "https://www.runthrough.co.uk/help/event-certification-and-qualifying-standards",
      },
    ],
    relatedCountryIds: ["uk"],
    checkedAt: "2026-10-23",
  },
];
