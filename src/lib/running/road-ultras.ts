export type UltraFormat = "distance" | "timed" | "journey";
export type UltraEdition = {
  date: string;
  endDate?: string;
  label?: string;
  provisional?: boolean;
  url: string;
};
export type RoadUltra = {
  slug: string;
  name: string;
  location: string;
  format: UltraFormat;
  distance: string;
  surface: string;
  summary: string;
  course: string;
  entry: string;
  editions: UltraEdition[];
  sources: { label: string; url: string }[];
  previousEdition?: string;
};

export const ULTRA_CHECKED = "2026-09-26";
export const ULTRA_GUIDE_PATH = "/running/uk-road-ultramarathons";
export const ultraPath = (slug: string) => `/running/ultramarathons/${slug}`;

/** Organiser/authorised entry sources checked 26 September 2026. See docs/uk-road-ultras.md. */
export const ROAD_ULTRAS: RoadUltra[] = [
  {
    slug: "dartmoor-discovery",
    name: "Dartmoor Discovery",
    location: "Princetown, Devon · England",
    format: "distance",
    distance: "32 miles",
    surface: "Road · hilly single lap",
    summary:
      "A long-established road ultra across Dartmoor, starting and finishing in Princetown. The lanes provide the scenery; the climbs provide a firm reminder that road running need not mean flat running.",
    course:
      "The loop visits Dartmeet, Ashburton and Widecombe before returning across the moor. The published overall time limit is 6 hours 45 minutes.",
    entry:
      "The organiser lists 5 June 2027, with entries due to open on 1 November 2026. Check the event instructions for intermediate cut-offs.",
    editions: [
      {
        date: "2027-06-05",
        url: "https://www.teignbridgetrotters.co.uk/our-races/dartmoor-discovery",
      },
    ],
    sources: [
      {
        label: "Teignbridge Trotters: race and entry",
        url: "https://www.teignbridgetrotters.co.uk/our-races/dartmoor-discovery",
      },
      {
        label: "Course and race information",
        url: "https://www.teignbridgetrotters.co.uk/our-races/dartmoor-discovery/general-info",
      },
    ],
  },
  {
    slug: "goodwood-50k",
    name: "Running GP at Goodwood 50K",
    location: "Chichester, West Sussex · England",
    format: "distance",
    distance: "50 km",
    surface: "Tarmac · motor circuit laps",
    summary:
      "A traffic-free 50K around Goodwood Motor Circuit. Repeated laps offer a straightforward course for runners who prefer a predictable surface and a familiar view of the finish line.",
    course:
      "The ultra uses the paved racing circuit. Goodwood hosts several Running GP dates, but the 50K is not offered at every meeting.",
    entry:
      "Select the 50K option on the relevant RunThrough event page. Dates below have an explicit 50K entry option; shorter-distance meetings are excluded.",
    editions: [
      {
        date: "2026-10-11",
        url: "https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-october-2026",
      },
      {
        date: "2027-02-21",
        url: "https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-february-2027",
      },
      {
        date: "2027-10-17",
        url: "https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-october-2027",
      },
      {
        date: "2027-12-05",
        url: "https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-december-2027",
      },
    ],
    sources: [
      {
        label: "RunThrough: Goodwood 50K",
        url: "https://www.runthrough.co.uk/event/running-gp-at-goodwood-motor-circuit-february-2027",
      },
    ],
  },
  {
    slug: "bath-bristol-railway-50k",
    name: "Bath & Bristol Railway 50K",
    location: "Bath to Bristol and back · England",
    format: "distance",
    distance: "50 km",
    surface: "Tarmac · shared railway path",
    summary:
      "An out-and-back ultra on the former railway between Bath and Bristol. The path offers a paved alternative to the trail ultras often found around the West Country.",
    course:
      "Relish describes the route as 100% tarmac. It includes Staple Hill Tunnel and uses a shared path rather than a closed road. The published finish limit is 8.5 hours, with a separate turnaround cut-off.",
    entry:
      "Choose the solo 50km entry on the organiser's event page and read the turnaround requirements before booking.",
    editions: [
      {
        date: "2026-10-11",
        url: "https://www.relishrunningraces.com/bath-bristol-railway-running-races.php",
      },
      {
        date: "2027-04-11",
        url: "https://www.relishrunningraces.com/bath-bristol-railway-running-races.php",
      },
    ],
    sources: [
      {
        label: "Relish Running: dates, course and entry",
        url: "https://www.relishrunningraces.com/bath-bristol-railway-running-races.php",
      },
    ],
  },
  {
    slug: "bath-two-tunnels-50k",
    name: "Bath Two Tunnels 50K",
    location: "Bath, Somerset · England",
    format: "distance",
    distance: "50 km",
    surface: "Almost entirely tarmac · grass at start/finish",
    summary:
      "Five laps through Bath's converted railway tunnels make this a distinctive urban ultra. The measured 50K has a different route from the event's city marathon.",
    course:
      "The Return Ticket course uses paved shared paths and the Devonshire and Combe Down tunnels, with a small grass section at the start and finish. The solo ultra has an 8.5-hour limit.",
    entry:
      "The solo 50K is confirmed for 15 August 2027. Other Two Tunnels dates and relay entries should not be mistaken for this individual ultra.",
    editions: [
      {
        date: "2027-08-15",
        url: "https://www.relishrunningraces.com/bath-two-tunnels-ultra-marathon.php",
      },
    ],
    sources: [
      {
        label: "Relish Running: solo ultra and entry",
        url: "https://www.relishrunningraces.com/bath-two-tunnels-ultra-marathon.php",
      },
      {
        label: "Route surfaces and event information",
        url: "https://www.relishrunningraces.com/bath-two-tunnels-railway-running-races.php",
      },
    ],
  },
  {
    slug: "derry-londonderry-belfast-75",
    name: "Derry/Londonderry to Belfast 75",
    location: "Derry/Londonderry to Belfast · Northern Ireland",
    format: "distance",
    distance: "75 miles",
    surface: "Roads and footpaths · point to point",
    summary:
      "A road journey between Northern Ireland's two largest cities. The distance and navigation make it a substantial step beyond a lapped 50K.",
    course:
      "The organiser specifies roads and footpaths throughout, with no trail. Runners navigate using the supplied route, carry a tracker and work within a 24-hour limit. There are three aid stations.",
    entry:
      "The 2027 race is listed for 10 April. Review the self-navigation, kit and support requirements on We Run Wild NI before entering.",
    editions: [
      {
        date: "2027-04-10",
        endDate: "2027-04-11",
        url: "https://werunwildni.com/derrylondonderry-to-belfast-75mile-2027.html",
      },
    ],
    sources: [
      {
        label: "We Run Wild NI: race details and entry",
        url: "https://werunwildni.com/derrylondonderry-to-belfast-75mile-2027.html",
      },
    ],
  },
  {
    slug: "windmill-way-wander",
    name: "Windmill Way Wander Ultra",
    location: "Barrow, Suffolk · England",
    format: "distance",
    distance: "Marathon plus 5 km or 10 km",
    surface: "Road · rolling countryside loops",
    summary:
      "A flexible ultra from the Suffolk Running Centre, using the Windmill route through the surrounding villages. The extra distance is added after two half-marathon loops.",
    course:
      "The organiser describes the 21.1km loop as 100% road, with 217 metres of ascent per loop. Ultra runners add a 5km or 10km out-and-back. The event has a seven-hour limit.",
    entry:
      "Choose the ultra option through Zig Zag Running. Bring a reusable cup or bottle for the aid station.",
    editions: [
      {
        date: "2027-01-16",
        url: "https://zigzagrunning.eventrac.co.uk/e/windmill-way-wander-11090",
      },
    ],
    sources: [
      {
        label: "Zig Zag Running: route, distance and entry",
        url: "https://zigzagrunning.eventrac.co.uk/e/windmill-way-wander-11090",
      },
    ],
  },
  {
    slug: "great-barrow-challenge-road-ultras",
    name: "Great Barrow Challenge — road ultras",
    location: "Barrow, Suffolk · England",
    format: "distance",
    distance: "Marathon plus an extra 5 km or 10 km route",
    surface: "Road · selected days only",
    summary:
      "Individual ultra entries within a ten-day running festival. The route changes each day, so this guide includes only the three days whose descriptions explicitly confirm a road course.",
    course:
      "Day 2 uses Windmill, Day 6 Golding Hills and Day 8 Mill Wind. Each published route is described as 100% road. Ultra runners continue beyond the marathon distance; other festival days may include trails.",
    entry:
      "Book the individual day and ultra distance. Route descriptions are more specific than the entry site's generic festival terrain tag; reconfirm the chosen route before entering.",
    editions: [
      {
        date: "2027-07-30",
        label: "Day 2 · Windmill",
        url: "https://www.evententry.co.uk/zigzag-2027-great-barrow-challenge-day-2",
      },
      {
        date: "2027-08-03",
        label: "Day 6 · Golding Hills",
        url: "https://www.evententry.co.uk/zigzag-2027-great-barrow-challenge-day-6",
      },
      {
        date: "2027-08-05",
        label: "Day 8 · Mill Wind",
        url: "https://www.evententry.co.uk/zigzag-2027-great-barrow-challenge-day-8",
      },
    ],
    sources: [
      {
        label: "Zig Zag Running: road-day entry information",
        url: "https://www.evententry.co.uk/zigzag-2027-great-barrow-challenge-day-2",
      },
    ],
  },
  {
    slug: "the-bridge-ultras",
    name: "The Bridge Ultras",
    location: "Old Severn Bridge · Wales / England",
    format: "distance",
    distance: "40, 100 or 200 miles",
    surface: "Paved bridge path · repeated out-and-backs",
    summary:
      "A long-distance test on the old Severn crossing, with three ultra distances. The route is easy to describe; repeating it in exposed conditions is another matter.",
    course:
      "The 200-mile race uses 50 laps and a 55-hour limit. The shorter options have their own limits: 30 hours for 100 miles and 10 hours for 40 miles.",
    entry:
      "The page still lists the May 2026 edition. The next date is TBC. The 200-mile option requires a previous 100-mile finish; check the organiser's current qualifying rules.",
    editions: [],
    previousEdition: "May 2026",
    sources: [
      {
        label: "Cockbain Events: distances, qualification and dates",
        url: "https://www.cockbainevents.com/the-bridge-200",
      },
    ],
  },
  {
    slug: "the-tunnel-200",
    name: "The Tunnel 200",
    location: "Combe Down Tunnel, Bath · England",
    format: "distance",
    distance: "200 miles",
    surface: "Paved tunnel path · repeated out-and-backs",
    summary:
      "Two hundred miles beneath Bath turns a short railway tunnel into a very long race. It is an extreme specialist event, with a qualifying requirement and a deliberately repetitive course.",
    course:
      "The race uses the paved Combe Down Tunnel path. The published limit is 55 hours and entrants need a previous 100-mile finish.",
    entry:
      "The organiser's 2027 entry section lists 5–7 March and says entries are closed. An older 2026 date remains elsewhere on the page; use the explicit 2027 entry notice.",
    editions: [
      {
        date: "2027-03-05",
        endDate: "2027-03-07",
        url: "https://www.cockbainevents.com/the-tunnel",
      },
    ],
    sources: [
      { label: "Cockbain Events: Tunnel 200", url: "https://www.cockbainevents.com/the-tunnel" },
    ],
  },
  {
    slug: "belfast-24",
    name: "Belfast 24",
    location: "Victoria Park, Belfast · Northern Ireland",
    format: "timed",
    distance: "50 km, 100 km, 100 miles or 24 hours",
    surface: "Park-path loop",
    summary:
      "A compact park circuit hosting both fixed-distance ultras and a 24-hour race. Regular returns to the event base make this a different experience from a point-to-point road ultra.",
    course:
      "The event uses Victoria Park's approximately one-mile loop. Choose between a distance target and the timed format; they are separate entry options.",
    entry:
      "The organiser gives 26–27 June 2027 provisionally, subject to council approval. Treat the date as provisional until that approval is confirmed.",
    editions: [
      {
        date: "2027-06-26",
        endDate: "2027-06-27",
        provisional: true,
        url: "https://werunwildni.com/belfast-24hr-new-page.html",
      },
    ],
    sources: [
      {
        label: "We Run Wild NI: provisional date and formats",
        url: "https://werunwildni.com/belfast-24hr-new-page.html",
      },
    ],
  },
  {
    slug: "dawn-to-dusk-ultra",
    name: "Dawn to Dusk Ultra",
    location: "Woodford Green, London · England",
    format: "timed",
    distance: "Daylight challenge · ultra from 25 laps (about 50 km)",
    surface: "Road and pavement · mostly tarmac",
    summary:
      "A winter daylight challenge organised by Sikhs in the City. Runners accumulate laps between sunrise and sunset, with a solo ultra option alongside the marathon and relay.",
    course:
      "The loop is 2.014km on roads and pavements. Twenty-five laps earns the ultra medal; the ultra competition is decided by the most laps completed. The 2026 window runs from 08:04 to 15:54.",
    entry:
      "Select the individual ultra entry for 6 December 2026. The separate 50km relay is a team event.",
    editions: [
      {
        date: "2026-12-06",
        url: "https://www.evententry.co.uk/sikhs-in-the-city-dawn-to-dusk-marathon-ultra-2026",
      },
    ],
    sources: [
      {
        label: "Sikhs in the City: authorised entry and race information",
        url: "https://www.evententry.co.uk/sikhs-in-the-city-dawn-to-dusk-marathon-ultra-2026",
      },
    ],
  },
  {
    slug: "mackyard-ultra-24",
    name: "Mackyard Ultra 24",
    location: "Redbridge Cycling Centre, London · England",
    format: "timed",
    distance: "Hourly 4.2-mile yards · maximum 24 hours",
    surface: "Tarmac · hilly cycling circuit",
    summary:
      "A capped backyard-style challenge on Redbridge's cycling circuit. Runners start a new yard each hour, using the remaining minutes to recover before the next start.",
    course:
      "Each yard covers about 4.2 miles on the tarmac circuit and includes around 110 metres of climbing. The event ends after 24 hours, rather than continuing indefinitely until one runner remains.",
    entry:
      "The listed start is 3 October 2026 at 14:00. Your completed distance determines whether the result is an ultra; entering a timed event alone does not guarantee an ultra finish.",
    editions: [
      {
        date: "2026-10-03",
        endDate: "2026-10-04",
        url: "https://www.mackyardevents.com/events/p/mackyardultra24",
      },
    ],
    sources: [
      {
        label: "Mackyard Events: format, course and entry",
        url: "https://www.mackyardevents.com/events/p/mackyardultra24",
      },
    ],
  },
  {
    slug: "hell-on-the-humber",
    name: "Hell on the Humber series",
    location: "Humber Bridge, Hessle · England",
    format: "timed",
    distance: "Timed challenges · duration varies by event",
    surface: "Paved bridge path · four-mile laps",
    summary:
      "A family of timed races on the Humber Bridge, including Hell on the Humber, the Mad Hatter, Helloween and Ho Ho HOTH. The bridge supplies both the route and a fair amount of the weather.",
    course:
      "The series uses four-mile laps. Published formats include six, nine, twelve and twenty-four hours across different editions. Check the individual event for its available duration.",
    entry:
      "The organiser's public entry listings checked for this guide still showed 2025 dates. Future dates are TBC; no annual recurrence has been assumed.",
    editions: [],
    previousEdition: "2025 listings",
    sources: [
      { label: "Hell on the Humber: series and course", url: "https://www.hellonthehumber.com/" },
      {
        label: "Official event entry listings",
        url: "https://www.hellonthehumber.com/event-entry/",
      },
    ],
  },
  {
    slug: "jogle",
    name: "JOGLE",
    location: "John o' Groats to Land's End · Scotland / England",
    format: "journey",
    distance: "Over 850 miles · 17 daily stages",
    surface: "Almost all road · multi-day journey",
    summary:
      "A supported stage race down the length of Britain. Seventeen consecutive days of running place it in a different category from a single-day road ultra.",
    course:
      "The organiser describes the route as almost entirely on roads, with amendments made between editions. Daily cut-offs and overnight stops shape the journey.",
    entry:
      "The 2027 edition is listed for 13–29 March and was sold out with a waiting list when checked. Read the package, accommodation and daily pace requirements carefully.",
    editions: [
      {
        date: "2027-03-13",
        endDate: "2027-03-29",
        url: "https://www.ultrarunningltd.co.uk/race/jogle/",
      },
    ],
    sources: [
      {
        label: "Ultra Running: JOGLE information and waiting list",
        url: "https://www.ultrarunningltd.co.uk/race/jogle/",
      },
    ],
  },
  {
    slug: "lejog",
    name: "LEJOG",
    location: "Land's End to John o' Groats · England / Scotland",
    format: "journey",
    distance: "Over 850 miles · 17 daily stages",
    surface: "Almost all road · multi-day journey",
    summary:
      "The northbound counterpart to JOGLE follows Britain's end-to-end route over seventeen stages. It combines daily ultra-distance running with organised overnight stops.",
    course:
      "The organiser describes the route as almost all road and applies daily pace requirements. This is a stage race, with overnight rests, rather than a continuous 850-mile race.",
    entry:
      "The specific 2026 page lists 1–17 October. Use the edition's own entry information: the organiser also has pages for later years.",
    editions: [
      {
        date: "2026-10-01",
        endDate: "2026-10-17",
        url: "https://www.ultrarunningltd.co.uk/race/mtc-lejog-26/",
      },
    ],
    sources: [
      {
        label: "Ultra Running: LEJOG 2026",
        url: "https://www.ultrarunningltd.co.uk/race/mtc-lejog-26/",
      },
    ],
  },
  {
    slug: "lon-las-cymru",
    name: "Lon Las Cymru",
    location: "Holyhead to Cardiff · Wales",
    format: "journey",
    distance: "250 miles · continuous race",
    surface: "Mostly road · cycle-route journey",
    summary:
      "A continuous journey through Wales following the Lon Las Cymru cycle route. It belongs among the longer road-based ultras, with a clear caveat that the route is not entirely road.",
    course:
      "The published limit is 88 hours. Sparse support and a long overnight journey distinguish it from a conventional fully supported road race.",
    entry:
      "The next date is TBC. The organiser requires a previous 100-mile finish; consult the current qualification and support details before applying.",
    editions: [],
    sources: [
      {
        label: "Cockbain Events: Lon Las Cymru",
        url: "https://www.cockbainevents.com/lon-las-cymru",
      },
    ],
  },
  {
    slug: "mallory-park-50k-100k",
    name: "Mallory Park 50K / 100K",
    location: "Kirkby Mallory, Leicestershire · England",
    format: "distance",
    distance: "50 km or 100 km",
    surface: "Road · motor circuit laps",
    summary:
      "Mallory Park has hosted open 50K and 100K road races alongside masters championships. It is included as an established road-ultra option to watch, with no new date confirmed here.",
    course:
      "The verified 2025 event used an undulating motor-circuit route. Check any new edition for its exact lap configuration and race eligibility.",
    entry:
      "The source is the 3 May 2025 event listing. It is historical evidence, not a current entry offer; the next edition is TBC.",
    editions: [],
    previousEdition: "3 May 2025",
    sources: [
      {
        label: "BMAF / OpenTrack: 2025 event listing",
        url: "https://bmaf.opentrack.run/mk/x/2025/GBR/bmaf-50k-100k/",
      },
    ],
  },
  {
    slug: "sri-chinmoy-perth-ultras",
    name: "Sri Chinmoy Perth 50K / 100K",
    location: "North Inch, Perth · Scotland",
    format: "distance",
    distance: "50 km or 100 km",
    surface: "Road loop · park setting",
    summary:
      "Perth's North Inch has hosted measured road ultras over 50K and 100K. The organiser's published 2024 edition provides a Scottish option to keep in view, rather than a confirmed forthcoming race.",
    course:
      "The published course is a 2.5km road loop in North Inch Park. Repeated laps suit runners looking for a fixed-distance road event.",
    entry:
      "The official page checked still lists 24 March 2024. The next date and entry arrangements are TBC.",
    editions: [],
    previousEdition: "24 March 2024",
    sources: [
      {
        label: "Sri Chinmoy Marathon Team: Perth ultras",
        url: "https://uk.srichinmoyraces.org/ultras",
      },
    ],
  },
];

export function ukToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function upcomingEditions(race: RoadUltra, today: string) {
  // A multi-day race remains current through its final day; never invent its next edition.
  return race.editions.filter((edition) => (edition.endDate ?? edition.date) >= today);
}

export function formatUltraDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function editionDate(edition: UltraEdition) {
  return `${formatUltraDate(edition.date)}${edition.endDate ? ` – ${formatUltraDate(edition.endDate)}` : ""}${edition.provisional ? " (provisional)" : ""}`;
}

export const ULTRA_FAQS = [
  {
    question: "What counts as a road ultramarathon?",
    answer:
      "An ultramarathon is longer than 42.195km. This guide includes road races and ultras on paved paths or motor circuits, with the surface stated for each event. Mostly-road journeys are labelled separately. Track races and predominantly trail events are outside this guide.",
  },
  {
    question: "Does every timed event count as an ultra?",
    answer:
      "No. Your completed distance must exceed the marathon distance. A six-hour, backyard-style or 24-hour entry can produce a shorter result. Fixed-distance races and timed challenges are clearly distinguished here.",
  },
  {
    question: "Why are some dates marked TBC or provisional?",
    answer:
      "TBC means a future edition has not been confirmed in the sources checked. Provisional means the organiser has announced a date that still depends on approval. We do not generate new dates by assuming an event repeats annually.",
  },
  {
    question: "Is this every UK road ultra?",
    answer:
      "This is a researched selection, not a claim of complete coverage. Small organisers add dates throughout the year, and some events mix road and trail. Events with multiple dates or distances are grouped rather than counted as separate races.",
  },
];
