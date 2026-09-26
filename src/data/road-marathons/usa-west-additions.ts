import type { RoadMarathon } from "./types";

const colfaxRace = "https://www.runcolfax.org/races/marathon-3/";
const colfaxResults = "https://www.runcolfax.org/races/race-results/";
const colfaxReport = "https://duclarion.com/2026/05/on-the-course-at-the-denver-colfax-marathon/";
const stGeorgeRace =
  "https://www.sgcityutah.gov/activity/special_events/st._george_marathon/marathon_information.php";
const stGeorgeResults = "https://results.laurelt.com/stg/results?race=167737";
const longBeachRace = "https://www.runlongbeach.com/marathon";
const longBeachResults = "https://www.runlongbeach.com/race-results";
const longBeachReport =
  "https://www.runningusa.org/industry-news/hometown-spirit-shines-as-paige-moore-24-wins-2xu-long-beach-marathon/";
const oaklandRace = "https://oaklandmarathon.com/races/marathon/";
const oaklandResults = "https://oaklandmarathon.com/race-resources/results/";
const oaklandReport =
  "https://oaklandmarathon.com/mano-and-deutsche-win-the-2026-oakland-marathon/";
const tucsonRace = "https://www.aravaiparunning.com/tucson/";
const tucsonResults = "https://live.chronotrack.com/event/89423/results";
const tucsonReport = "https://www.aravaiparunning.com/results/";

export const USA_WEST_ADDITIONS: RoadMarathon[] = [
  {
    slug: "denver-colfax-marathon-usa",
    name: "Denver Colfax Marathon",
    country: "usa",
    city: "Denver",
    region: "Colorado",
    timeZone: "America/Denver",
    officialUrl: "https://www.runcolfax.org/",
    description:
      "Denver Colfax Marathon combines Colorado city roads and paved paths in a loop from City Park through downtown, Sloan’s Lake and Lakewood. The course passes through Denver Fire Station No. 1 and twice through Empower Field at Mile High, an unusual pair of detours for a morning run. Altitude, climbs and descents all belong in the pacing plan. General entry includes the option to support a charity partner; the six-hour limit and advance bib collection also need attention.",
    course: {
      summary:
        "Starts and finishes in City Park, visiting downtown, Empower Field at Mile High, Sloan’s Lake and Lakewood.",
      surface: "Road and paved urban paths, with stadium passages",
      profile: "Urban loop at altitude, with climbs and descents.",
      links: [
        {
          label: "Course map and route description",
          url: "https://www.runcolfax.org/races/marathon-course-overview/",
        },
      ],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Enter the individual marathon through the organiser’s Race Roster registration page.",
        url: "https://raceroster.com/events/2027/139249/2027-denver-colfax-marathon",
      },
      {
        name: "Run for a charity partner",
        description:
          "Choose a participating nonprofit during registration, or add it to an existing entry. The charity contacts runners about its fundraising or awareness arrangements; this is an option within registration.",
        url: "https://www.runcolfax.org/runner-info/run-for-a-nonprofit/",
      },
    ],
    editions: [{ date: "2027-05-16", sourceUrl: colfaxRace }],
    fieldSize: {
      display: "About 3,000 runners",
      basis: "Reported starters",
      year: "2026",
      sourceUrl: colfaxReport,
      note: "The Denver Clarion’s on-course report described almost 3,000 runners at the full-marathon start. This is a rounded report, not a festival attendance figure or an entry limit.",
    },
    practical: [
      {
        label: "2027 start",
        value: "06:00 local time, east side of Ferrill Lake in City Park.",
        sourceUrl: colfaxRace,
      },
      { label: "Course limit", value: "Six hours.", sourceUrl: colfaxRace },
      {
        label: "Bib collection",
        value: "Collect at the Friday or Saturday expo; there is no race-day packet collection.",
        sourceUrl: colfaxRace,
      },
    ],
    media: [
      { label: "2026 race report — The Denver Clarion", url: colfaxReport, kind: "news" },
      { label: "Official course video and photo tour", url: colfaxRace, kind: "video" },
    ],
    resultsUrl: colfaxResults,
    pastEditions: [
      {
        year: 2026,
        date: "2026-05-17",
        resultsUrl: colfaxResults,
        summary:
          "Colorado runners led both podiums in the 2026 full marathon. The Denver Clarion’s on-course report named Alec Hornecker and Hali Hafeman as the winners; the organiser’s archive links to the complete timed results and category standings.",
        categories: [
          {
            category: "Men",
            summary:
              "The Denver Clarion reported Alec Hornecker winning in 2:27:56, ahead of Ryan Montera and Patrick Keeley.",
            sourceUrl: colfaxReport,
          },
          {
            category: "Women",
            summary:
              "The Denver Clarion reported Hali Hafeman winning in 2:55:26, followed by Emily Stoodley and Chelsea Factor.",
            sourceUrl: colfaxReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Official marathon details", url: colfaxRace },
      {
        label: "Course overview",
        url: "https://www.runcolfax.org/races/marathon-course-overview/",
      },
      { label: "Official results archive", url: colfaxResults },
      { label: "2026 on-course reporting", url: colfaxReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "st-george-marathon-usa",
    name: "St. George Marathon",
    country: "usa",
    city: "St. George",
    region: "Utah",
    timeZone: "America/Denver",
    officialUrl: "https://www.stgeorgemarathon.com/",
    description:
      "St. George Marathon descends on Utah roads from the Pine Valley Mountains to Vernon Worthen Park in the city. The point-to-point course is predominantly downhill, making preparation for sustained descents useful. Race morning also begins well before the start: 2026 buses leave between 3:45am and 5:15am at assigned times. Check general-entry availability through the organiser before booking travel. The 2026 transfer deadline has passed, and runners holding deferrals must redeem them rather than assume they are registered.",
    course: {
      summary:
        "A descending road route from the Pine Valley Mountains to the finish at Vernon Worthen Park in St. George.",
      surface: "Road",
      profile: "Point-to-point and predominantly downhill.",
      links: [{ label: "Official course map and preview video", url: stGeorgeRace }],
    },
    entryMethods: [
      {
        name: "General registration",
        description:
          "Use the official Haku registration service linked by the city. Check the current edition’s availability before making travel arrangements.",
        url: "https://events.hakuapp.com/events/47fc1f7fac107df69384/registration_options",
      },
      {
        name: "Official transfer",
        description:
          "Transfers must be completed through the participant account and within the published deadline. The 2026 recipient-registration deadline was 15 September.",
        url: stGeorgeRace,
      },
      {
        name: "Deferred-entry redemption",
        description:
          "Eligible runners use the organiser’s emailed link to redeem a deferral when registration opens; a deferral does not automatically register the runner.",
        url: stGeorgeRace,
      },
    ],
    editions: [
      { date: "2026-10-03", sourceUrl: stGeorgeRace },
      {
        date: "2027-10-02",
        sourceUrl: "https://www.stgeorgemarathon.com/customer/registration.aspx",
      },
    ],
    fieldSize: {
      display: "About 4,400 runners",
      basis: "Finishers",
      year: "2025",
      sourceUrl: "https://results.laurelt.com/stg/results?pk=8261366",
      note: "Rounded from the official timer’s full-marathon overall ranking denominator of 4,426. This measures finishers rather than everyone who registered.",
    },
    practical: [
      { label: "2026 start", value: "07:00 local time.", sourceUrl: stGeorgeRace },
      {
        label: "Start buses",
        value: "Buses leave Vernon Worthen Park from 03:45 to 05:15; use the assigned bus time.",
        sourceUrl: stGeorgeRace,
      },
      {
        label: "Course cutoffs",
        value: "Reach mile 23.1 by 13:15; the finish closes at 14:15 in 2026.",
        sourceUrl: stGeorgeRace,
      },
    ],
    media: [
      { label: "Official course preview and race information", url: stGeorgeRace, kind: "video" },
    ],
    resultsUrl: "https://results.laurelt.com/stg/results",
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-04",
        resultsUrl: stGeorgeResults,
        summary:
          "Jake Heslington won the 2025 men’s race by three seconds on gun time. Kodi Kleven led the women. The official table separates overall awards from age divisions and supplies both chip and gun times.",
        categories: [
          {
            category: "M Overall",
            summary:
              "Jake Heslington won in 2:13:56 gun time, with Michael Ottesen second in 2:13:59 and Eric Nelson third in 2:14:52.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "F Overall",
            summary: "Kodi Kleven won in 2:28:42 gun time; her chip time was 2:28:41.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "M20-24",
            summary: "Sam Fish led the published age division in 2:26:14 chip time.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "M25-29",
            summary: "Josh Ericksen led the published age division in 2:24:25 chip time.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "M30-34",
            summary: "Rush Mills led the published age division in 2:26:01 chip time.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "M35-39",
            summary: "Jared Jimmerson led the published age division in 2:27:57 chip time.",
            sourceUrl: stGeorgeResults,
          },
          {
            category: "M40-44",
            summary: "Ryan Merriman led the published age division in 2:24:26 chip time.",
            sourceUrl: stGeorgeResults,
          },
        ],
      },
    ],
    sources: [
      { label: "Official 2026 marathon information", url: stGeorgeRace },
      {
        label: "Published future dates",
        url: "https://www.stgeorgemarathon.com/customer/registration.aspx",
      },
      { label: "2025 official timing results", url: stGeorgeResults },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "long-beach-marathon-usa",
    name: "2XU Long Beach Marathon",
    country: "usa",
    city: "Long Beach",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://www.runlongbeach.com/",
    description:
      "Long Beach Marathon follows California roads and a paved beach path on a predominantly flat course at sea level. The Queen Mary, Shoreline Village, Belmont Shore and Cal State Long Beach feature before the return along Ocean Boulevard. The 2026 start is at 5:30am, so breakfast requires some commitment. General entry depends on the availability of registration releases. The 2027 early-access list provides notifications only; joining it does not secure a place. The published course limit is 7.5 hours.",
    course: {
      summary:
        "Downtown Long Beach, Queen Mary, Shoreline Village, the beach path, Belmont Shore, Marine Stadium and Cal State Long Beach, returning via Ocean Boulevard.",
      surface: "Road and paved beach path",
      profile: "Predominantly flat at sea level.",
      links: [{ label: "Official route and course-map download", url: longBeachRace }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Use the official website for release availability and registration. Sold-out releases may limit the places available.",
        url: longBeachRace,
      },
      {
        name: "2027 early-access notifications",
        description:
          "The organiser offers a 2027 notification list. Joining it alerts you when registration opens and does not itself secure a race place.",
        url: longBeachRace,
      },
    ],
    editions: [{ date: "2026-10-11", sourceUrl: longBeachRace }],
    nextDateNote:
      "The organiser is collecting 2027 early-access interest; an exact 2027 race date has not yet been verified.",
    fieldSize: {
      display: "About 6,500 runners",
      basis: "Reported participants",
      year: "2025",
      sourceUrl: longBeachReport,
      note: "The race report published by Running USA identifies 6,500 participants in the marathon separately from 14,000 in the half marathon. It does not label the number as a finisher count.",
    },
    practical: [
      {
        label: "2026 start",
        value: "05:30 local time at Shoreline Drive and Shoreline Village Drive.",
        sourceUrl: longBeachRace,
      },
      { label: "Course limit", value: "7.5 hours; minimum age 18.", sourceUrl: longBeachRace },
    ],
    media: [{ label: "2025 race report — Running USA", url: longBeachReport, kind: "news" }],
    resultsUrl: longBeachResults,
    pastEditions: [
      {
        year: 2025,
        date: "2025-10-05",
        resultsUrl: longBeachResults,
        summary:
          "Paige Moore won on her marathon debut, while Esteban Prado took the men’s title. The race report published by Running USA describes cool, overcast conditions and gives the marathon field separately from the other weekend events.",
        categories: [
          {
            category: "Men",
            summary:
              "Running USA’s race report records Esteban Prado winning in 2:26:32, with Ethan Widlansky second.",
            sourceUrl: longBeachReport,
          },
          {
            category: "Women",
            summary:
              "Paige Moore won in 2:55:13 ahead of Selena Gallardo Dominguez, according to the race report published by Running USA.",
            sourceUrl: longBeachReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Official marathon information", url: longBeachRace },
      { label: "Official results archive", url: longBeachResults },
      { label: "2025 race report and marathon participation", url: longBeachReport },
    ],
    checkedAt: "2026-09-26",
  },
  {
    slug: "oakland-marathon-usa",
    name: "Oakland Marathon",
    country: "usa",
    city: "Oakland",
    region: "California",
    timeZone: "America/Los_Angeles",
    officialUrl: "https://oaklandmarathon.com/",
    description:
      "Oakland Marathon combines California city roads with the paved Bay Bridge path, taking runners past Lake Merritt and towards Yerba Buena Island. The bridge out-and-back supplies the main climbs and descents, so a flat-city pacing plan needs some adjustment. The start and finish are near the Henry J. Kaiser Center for the Arts. General entry is through the official registration page, where runners should select the in-person full marathon. The seven-hour limit runs from the gun start.",
    course: {
      summary:
        "One loop through Oakland with a Bay Bridge out-and-back, Lake Merritt and a finish by the Henry J. Kaiser Center for the Arts.",
      surface: "Road and paved bridge path",
      profile: "Urban route with climbs and descents on the Bay Bridge section.",
      links: [{ label: "Course overview, downloadable map and interactive map", url: oaklandRace }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Register for the full marathon through the official Race Roster page. Select the in-person marathon rather than a virtual distance.",
        url: "https://raceroster.com/events/2027/118186/2027-oakland-marathon",
      },
    ],
    editions: [{ date: "2027-03-21", sourceUrl: oaklandRace }],
    practical: [
      { label: "2027 start", value: "07:00 local time.", sourceUrl: oaklandRace },
      {
        label: "Course limit",
        value: "Seven hours from the gun start; minimum age 18.",
        sourceUrl: oaklandRace,
      },
      {
        label: "Gear check",
        value: "Available at the Henry J. Kaiser Center for the Arts from 05:30.",
        sourceUrl: oaklandRace,
      },
    ],
    media: [{ label: "2026 official race report", url: oaklandReport, kind: "news" }],
    resultsUrl: oaklandResults,
    pastEditions: [
      {
        year: 2026,
        date: "2026-03-22",
        resultsUrl: "https://results.raceroster.com/v3/events/hpcsg4kr4jdaaqk2",
        summary:
          "Ryuji Mano, Andrea Deutsche and Ethan Demoss won the marathon’s men’s, women’s and Non-Binary+ categories. The organiser reported record participation across the wider weekend; that combined figure is not a marathon field estimate.",
        categories: [
          { category: "Men", summary: "Ryuji Mano won in 2:30:58.", sourceUrl: oaklandReport },
          {
            category: "Women",
            summary: "Andrea Deutsche won in 2:52:56.",
            sourceUrl: oaklandReport,
          },
          {
            category: "Non-Binary+",
            summary: "Ethan Demoss won in 3:06:47.",
            sourceUrl: oaklandReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Official marathon details", url: oaklandRace },
      {
        label: "2027 registration",
        url: "https://raceroster.com/events/2027/118186/2027-oakland-marathon",
      },
      { label: "Results archive", url: oaklandResults },
      { label: "2026 official report", url: oaklandReport },
    ],
    fieldSize: {
      display: "About 1,100",
      basis: "Reported finishers",
      year: "2026",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Oakland+Marathon",
      note: "Rounded from 1,061 full-marathon finishers reported by FindMyMarathon for 2026.",
    },
    checkedAt: "2026-09-26",
  },
  {
    slug: "tucson-marathon-usa",
    name: "Tucson Marathon",
    country: "usa",
    city: "Tucson / Oro Valley",
    region: "Arizona",
    timeZone: "America/Phoenix",
    officialUrl: tucsonRace,
    description:
      "Tucson Marathon is an Arizona road race from Biosphere 2 near Oracle to Oro Valley, finishing at Pima Community College’s Northwest Campus. Rolling opening miles lead into a net descent of 1,493 feet, with highway sections giving way to the paved Cañada del Oro River Park bike path. General entry for 2026 is scheduled to close on 12 December at 6pm. Plan the shuttle journey and allow for the half-mile walk from staging to the start.",
    course: {
      summary:
        "Biosphere 2 to Pima Community College Northwest Campus via Highway AZ-77 and the Cañada del Oro River Park bike path.",
      surface: "Paved road and bike path",
      profile: "Point-to-point; 1,493 feet net downhill with rolling opening miles.",
      links: [{ label: "Official marathon route and interactive-map link", url: tucsonRace }],
    },
    entryMethods: [
      {
        name: "General entry",
        description:
          "Enter the individual marathon through Race Roster. Online registration is scheduled to close at 18:00 local time on 12 December 2026.",
        url: "https://raceroster.com/events/2026/113655/tucson-marathon-events",
      },
    ],
    editions: [{ date: "2026-12-13", sourceUrl: tucsonRace }],
    nextDateNote: "An exact 2027 date has not yet been verified.",
    practical: [
      {
        label: "2026 start",
        value:
          "07:15 local time at Biosphere 2; allow time for the half-mile walk from staging to the start.",
        sourceUrl: tucsonRace,
      },
      {
        label: "Course limit",
        value: "The marathon’s published time limit is 7.5 hours; intermediate cutoffs also apply.",
        sourceUrl: tucsonRace,
      },
    ],
    media: [
      {
        label: "2025 official race photos",
        url: "https://aravaipa.smugmug.com/2025-Events/Tucson-Marathon",
        kind: "photos",
      },
      {
        label: "2025 livestream replay",
        url: "https://www.youtube.com/watch?v=UhvtOq7nfCo",
        kind: "video",
      },
    ],
    resultsUrl: "https://www.aravaiparunning.com/race-results/tucson-marathon/",
    pastEditions: [
      {
        year: 2025,
        date: "2025-12-14",
        resultsUrl: tucsonResults,
        summary:
          "Joseph Moreno and Sydney Welch led the 2025 full marathon. Aravaipa’s results archive lists the marathon separately from the half marathon and 50K; use the linked timing results to explore individual and division performances.",
        categories: [
          {
            category: "Men",
            summary: "Joseph Moreno won the marathon in 2:27:21.",
            sourceUrl: tucsonReport,
          },
          {
            category: "Women",
            summary: "Sydney Welch won the marathon in 2:42:36.",
            sourceUrl: tucsonReport,
          },
        ],
      },
    ],
    sources: [
      { label: "Official course, entry and practical information", url: tucsonRace },
      {
        label: "2026 registration",
        url: "https://raceroster.com/events/2026/113655/tucson-marathon-events",
      },
      { label: "Organiser’s results archive and category winners", url: tucsonReport },
      { label: "2025 official timing results", url: tucsonResults },
    ],
    fieldSize: {
      display: "About 1,100",
      basis: "Reported finishers",
      year: "2025",
      sourceUrl: "https://findmymarathon.com/race-detail.php?zname=Tucson+Marathon",
      note: "Rounded from 1,125 full-marathon finishers reported by FindMyMarathon for 2025.",
    },
    checkedAt: "2026-09-26",
  },
];
