import type { ReportedRaceRecord } from "@/lib/athrecs/reported-race-history";

// Published at the site owner's request. Incomplete records remain outside ResultSeed,
// verified finish totals, personal best calculations and achievement calculations.
// Research reviewed 20 September 2026. Existing athlete: ATH-009703 / neil-featherby.
export const neilFeatherbyReportedRecords: readonly ReportedRaceRecord[] = [
  {
    id: "stevenage-1989",
    event: "Stevenage Half Marathon",
    distance: "Half marathon",
    location: "Stevenage, England",
    reportedDate: "1989 · exact date not established",
    reportedTime: "1:07:37",
    reportedPlace: "1st male",
    evidenceLabel: "Organiser archive",
    uncertainty:
      "The organiser confirms the year, winning time and Norfolk Gazelles affiliation; the day and month are not supplied.",
    sources: [
      {
        label: "Organiser’s winners archive",
        url: "https://stevenagehalfmarathon.org.uk/past-winners-of-stevenage-half-marathon",
      },
    ],
  },
  {
    id: "grandmas-1990",
    event: "Grandma’s Marathon",
    distance: "Marathon",
    location: "Duluth, Minnesota, United States",
    reportedDate: "1990 · exact date unresolved",
    reportedTime: "2:23:15",
    reportedPlace: "9th overall",
    evidenceLabel: "Timing archive · date conflict",
    uncertainty:
      "MTEC confirms the time and place, but displays 31 May in its header and 1 May in its summary. No full date has been assigned.",
    sources: [
      {
        label: "MTEC individual result",
        url: "https://www.mtecresults.com/runner/show?race=7690&rid=9",
      },
    ],
  },
  {
    id: "aberdeen-1986",
    event: "Aberdeen Marathon",
    distance: "Marathon",
    location: "Aberdeen, Scotland",
    reportedDate: "1986 · exact date not established",
    reportedTime: "Time not established",
    reportedPlace: "2nd, reported in biography",
    evidenceLabel: "Club archive / biography",
    uncertainty:
      "The March 1989 Belgravian records his 1986 England appearance. Sportlink reports the runner-up placing; original results remain to be checked.",
    sources: [
      {
        label: "The Belgravian, March 1989, page 5",
        url: "https://www.belgraveharriers.info/_files/ugd/234280_a434fe69066248b39ae427f102756eeb.pdf?index=true",
      },
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "kosice-1987",
    event: "Košice Marathon",
    distance: "Marathon",
    location: "Košice, then Czechoslovakia",
    reportedDate: "1987 · exact date not established",
    reportedTime: "Time not established",
    reportedPlace: "Place not established",
    evidenceLabel: "Contemporary club archive",
    uncertainty:
      "The March 1989 Belgravian records a Great Britain appearance. A finish time, placing and exact race date have not been established.",
    sources: [
      {
        label: "The Belgravian, March 1989, page 5",
        url: "https://www.belgraveharriers.info/_files/ugd/234280_a434fe69066248b39ae427f102756eeb.pdf?index=true",
      },
    ],
  },
  {
    id: "berlin-1986",
    event: "Berlin Marathon",
    distance: "Marathon",
    location: "West Berlin",
    reportedDate: "1986 · exact date not established",
    reportedTime: "2:17:35",
    reportedPlace: "22nd",
    evidenceLabel: "Organiser archive",
    uncertainty:
      "The official 1986 archive lists Neil Featherby, GBR, bib 86, in 22nd place. Select 1986 and search Featherby. The club journal identifies this as his second Berlin appearance and marathon best.",
    sources: [
      {
        label: "Berlin Marathon official archive",
        url: "https://www.bmw-berlin-marathon.com/en/your-race/results",
      },
      {
        label: "The Belgravian, March 1989, page 5",
        url: "https://www.belgraveharriers.info/_files/ugd/234280_a434fe69066248b39ae427f102756eeb.pdf?index=true",
      },
    ],
  },
  {
    id: "berlin-first-appearance",
    event: "Berlin Marathon — first appearance",
    distance: "Marathon",
    location: "West Berlin",
    reportedDate: "Before the 1986 appearance · year not established",
    reportedTime: "Time not established",
    reportedPlace: "Place not established",
    evidenceLabel: "Contemporary club archive",
    uncertainty:
      "The club journal documents two Berlin appearances. This entry preserves the earlier appearance without assigning it an unverified year or time.",
    sources: [
      {
        label: "The Belgravian, March 1989, page 5",
        url: "https://www.belgraveharriers.info/_files/ugd/234280_a434fe69066248b39ae427f102756eeb.pdf?index=true",
      },
    ],
  },
  {
    id: "wolverhampton-1987",
    event: "Wolverhampton Marathon",
    distance: "Marathon",
    location: "Wolverhampton, England",
    reportedDate: "1987 · year inferred from athlete’s account",
    reportedTime: "Time not established",
    reportedPlace: "1st, athlete-reported",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "In his account of the 1990 Great Race, Neil recalls winning here three years earlier. The full date and finish time remain unverified.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-1",
    event: "Sun Life Great Race — stage 1",
    distance: "12 miles",
    location: "Glasgow–East Kilbride",
    reportedDate: "1990",
    reportedTime: "1:05:47",
    reportedPlace: "62nd",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-2",
    event: "Sun Life Great Race — stage 2",
    distance: "10.6 miles",
    location: "East Kilbride–Motherwell",
    reportedDate: "1990",
    reportedTime: "57:55",
    reportedPlace: "56th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-3",
    event: "Sun Life Great Race — stage 3",
    distance: "10.5 miles",
    location: "Lockerbie–Annan",
    reportedDate: "1990",
    reportedTime: "56:26",
    reportedPlace: "57th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-4",
    event: "Sun Life Great Race — stage 4",
    distance: "12.8 miles",
    location: "Gretna–Carlisle",
    reportedDate: "1990",
    reportedTime: "1:09:40",
    reportedPlace: "35th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-5",
    event: "Sun Life Great Race — stage 5",
    distance: "13.2 miles",
    location: "Keswick–Grasmere",
    reportedDate: "1990",
    reportedTime: "1:13:06",
    reportedPlace: "54th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-6",
    event: "Sun Life Great Race — stage 6",
    distance: "9.1 miles",
    location: "Windermere–Kendal",
    reportedDate: "1990",
    reportedTime: "48:43",
    reportedPlace: "Joint 44th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-7",
    event: "Sun Life Great Race — stage 7",
    distance: "11.5 miles",
    location: "Kendal–Kirkby Lonsdale",
    reportedDate: "1990",
    reportedTime: "1:01:54",
    reportedPlace: "Joint 52nd",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week one",
        url: "https://www.edp24.co.uk/sport/26539718.inside-first-seven-stages-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-8",
    event: "Sun Life Great Race — stage 8",
    distance: "13.7 miles",
    location: "Bolton–Manchester",
    reportedDate: "1990",
    reportedTime: "1:13:08",
    reportedPlace: "41st",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-9",
    event: "Sun Life Great Race — stage 9",
    distance: "6.9 miles",
    location: "Manchester–Stockport",
    reportedDate: "1990",
    reportedTime: "37:08",
    reportedPlace: "62nd",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-10",
    event: "Sun Life Great Race — stage 10",
    distance: "13.1 miles",
    location: "Stockport–Macclesfield",
    reportedDate: "1990",
    reportedTime: "1:14:11",
    reportedPlace: "61st",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-11",
    event: "Sun Life Great Race — stage 11",
    distance: "12.2 miles",
    location: "Leek–Stoke-on-Trent",
    reportedDate: "1990",
    reportedTime: "1:08:36",
    reportedPlace: "51st",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-12",
    event: "Sun Life Great Race — stage 12",
    distance: "10.4 miles",
    location: "Stone–Stafford",
    reportedDate: "1990",
    reportedTime: "55:02",
    reportedPlace: "45th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-13",
    event: "Sun Life Great Race — stage 13",
    distance: "12.5 miles",
    location: "Penkridge–Wolverhampton",
    reportedDate: "1990",
    reportedTime: "1:08:32",
    reportedPlace: "47th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "great-race-1990-stage-14",
    event: "Sun Life Great Race — stage 14",
    distance: "15.5 miles",
    location: "Wolverhampton–Birmingham",
    reportedDate: "1990",
    reportedTime: "1:24:28",
    reportedPlace: "34th",
    evidenceLabel: "Athlete-reported",
    uncertainty:
      "From Neil’s retrospective account, representing Red Counties AC. Stage time, distance and place await independent result-sheet verification.",
    sources: [
      {
        label: "Neil’s Great Race account, week two",
        url: "https://www.eveningnews24.co.uk/sport/26559415.inside-week-two-extraordinary-1990-great-race/",
      },
    ],
  },
  {
    id: "leicester",
    event: "Leicester Marathon",
    distance: "Marathon",
    location: "Leicester, England",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "1st",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "bungay",
    event: "Bungay Marathon",
    distance: "Marathon",
    location: "Bungay, England",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "1st",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "norfolk-wins",
    event: "Norfolk Marathon — four reported wins",
    distance: "Marathon",
    location: "Norfolk, England",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "Four wins; editions not identified",
    evidenceLabel: "Biography-reported",
    uncertainty:
      "Four wins reported together; individual editions remain unidentified. County championship titles have not been counted as extra races.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "hong-kong",
    event: "Hong Kong Marathon",
    distance: "Marathon",
    location: "Hong Kong",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "3rd",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "malta",
    event: "Malta Marathon",
    distance: "Marathon",
    location: "Malta",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "3rd",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "bermuda",
    event: "Bermuda Marathon",
    distance: "Marathon",
    location: "Bermuda",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "3rd",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
  {
    id: "luton",
    event: "Luton Home Countries Marathon",
    distance: "Marathon",
    location: "Luton, England",
    reportedDate: "Year not established",
    reportedTime: "Time not supplied",
    reportedPlace: "3rd",
    evidenceLabel: "Biography-reported",
    uncertainty: "Biography reports this result; date and time not supplied.",
    sources: [
      {
        label: "Sportlink biography",
        url: "https://www.sportlink.co.uk/pages/neil-featherby",
      },
    ],
  },
];
