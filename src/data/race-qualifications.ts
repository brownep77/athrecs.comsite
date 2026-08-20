export type QualificationTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export type RaceQualification = {
  heading: string;
  checkedAt: string;
  sourceUrl: string;
  summary: string;
  window?: string;
  requirements: string[];
  tables?: QualificationTable[];
  note?: string;
  additionalLinks?: { label: string; url: string }[];
};

export const raceQualifications: Readonly<Record<string, RaceQualification>> = {
  "comrades-marathon": {
    heading: "Comrades qualification",
    checkedAt: "2026-08-20",
    sourceUrl: "https://comrades.com/faqs",
    summary:
      "The 2027 centenary race is confirmed, but its formal qualification rules have not yet been published. The latest organiser-published standards, for 2026, are shown as reference and must not be assumed for 2027.",
    window: "Latest published window: 9 June 2025 to 4 May 2026 (for the 2026 race).",
    requirements: [
      "The qualifying race had to be ASA technically compliant and at least 42.2km.",
      "Only an official published result was accepted; personal GPS records were not accepted.",
      "Athletes also had to complete the medical questionnaire and submit verified qualifying details by the deadline.",
    ],
    tables: [
      {
        caption: "Latest published Comrades qualifying table (2026 reference only)",
        headers: ["Race distance", "Maximum time"],
        rows: [
          ["42.2km", "4:59:59"],
          ["48km", "5:59:59"],
          ["50km", "6:09:59"],
          ["52–54km", "6:29:59"],
          ["56km", "6:59:59"],
          ["60km", "7:39:59"],
          ["64km", "8:14:59"],
          ["80km", "10:34:59"],
          ["90km", "11:59:59"],
          ["100km", "13:34:59"],
        ],
      },
    ],
    note: "Check the official Comrades page again when the organiser publishes the 2027 rules.",
  },
  "two-oceans-marathon": {
    heading: "Two Oceans qualification",
    checkedAt: "2026-08-20",
    sourceUrl: "https://www.twooceansmarathon.org.za/ultra-marathon/#qualification",
    summary:
      "The 2027 Ultra requires a qualifying marathon or longer race. The Half Marathon uses a recent 10km, 15km or 21km time for seeding rather than an Ultra-style entry standard.",
    window:
      "For 2027, qualifying and Half Marathon seeding performances run after 1 May 2026 are accepted.",
    requirements: [
      "Ultra qualifiers must be standard World Athletics-affiliated marathons or longer races.",
      "The qualifying course must be officially measured and the race officially timed.",
      "Half Marathon runners may submit a 10km, 15km or 21km performance for seeding.",
    ],
    tables: [
      {
        caption: "2027 Two Oceans Ultra qualifying criteria",
        headers: ["Race distance", "Required time"],
        rows: [
          ["42km", "Under 5:00"],
          ["48km", "Under 6:00"],
          ["50km", "Under 6:30"],
          ["56.6km", "Under 7:00"],
          ["90km", "Under 12:00"],
          ["100km+", "Under 13:30"],
        ],
      },
    ],
    additionalLinks: [
      {
        label: "Official Two Oceans qualifier directory",
        url: "https://admin.twooceansmarathon.org.za/qualracelist.aspx",
      },
      {
        label: "Official Half Marathon seeding guidance",
        url: "https://www.twooceansmarathon.org.za/half-marathon/#qualification",
      },
    ],
  },
  "boston-marathon": {
    heading: "Boston qualification",
    checkedAt: "2026-08-20",
    sourceUrl: "https://www.baa.org/races/boston-marathon/qualify/",
    summary:
      "A 2027 qualifying standard permits an application but does not guarantee entry. The B.A.A. ranks verified applicants by how far they beat their age and gender standard.",
    window:
      "The 2027 qualifying window opened 13 September 2025; qualifier registration is 14–18 September 2026, and athletes may qualify through the day they register.",
    requirements: [
      "The result must be an official net (chip) time from a certified outdoor full marathon.",
      "Courses must be certified by USATF, AIMS or the relevant national governing body; shorter, virtual, indoor, treadmill and time-trial events are not accepted.",
      "For 2027, net-downhill courses of 1,500–2,999ft receive a +5:00 index, 3,000–5,999ft receive +10:00, and drops of 6,000ft or more are ineligible.",
    ],
    tables: [
      {
        caption: "2027 Boston Marathon open-field qualifying standards",
        headers: ["Age", "Men", "Women", "Non-binary"],
        rows: [
          ["18–34", "2:55:00", "3:25:00", "3:25:00"],
          ["35–39", "3:00:00", "3:30:00", "3:30:00"],
          ["40–44", "3:05:00", "3:35:00", "3:35:00"],
          ["45–49", "3:15:00", "3:45:00", "3:45:00"],
          ["50–54", "3:20:00", "3:50:00", "3:50:00"],
          ["55–59", "3:30:00", "4:00:00", "4:00:00"],
          ["60–64", "3:50:00", "4:20:00", "4:20:00"],
          ["65–69", "4:05:00", "4:35:00", "4:35:00"],
          ["70–74", "4:20:00", "4:50:00", "4:50:00"],
          ["75–79", "4:35:00", "5:05:00", "5:05:00"],
          ["80+", "4:50:00", "5:20:00", "5:20:00"],
        ],
      },
    ],
    note: "Para Athletics, wheelchair and adaptive programmes have separate official standards; follow the B.A.A. qualification page for the applicable division.",
  },
};
