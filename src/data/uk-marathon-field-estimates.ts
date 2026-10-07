export type MarathonFieldEstimate = {
  display: string;
  basis: "Entrants" | "Finishers" | "Reported runners";
  years: string;
  explanation: string;
  sources: string[];
};

/** Rounded scale indicators, not audited registration averages or entry limits. Checked 26 September 2026. */
export const UK_MARATHON_FIELD_ESTIMATES: Readonly<Record<string, MarathonFieldEstimate>> = {
  london: {
    display: "55,000–60,000",
    basis: "Finishers",
    years: "2025–2026",
    explanation:
      "Rounded range from 56,640 and 59,830 finishers. The announced 2027 field is larger, across two race days.",
    sources: [
      "https://www.londonmarathonevents.co.uk/london-marathon/article/2025-tcs-london-marathon-sets-new-fundraising-record-ps873-million-total",
      "https://www.londonmarathonevents.co.uk/london-marathon/article/2026-tcs-london-marathon-breaks-guinness-world-records-title-largest-number",
    ],
  },
  manchester: {
    display: "35,000–42,000",
    basis: "Reported runners",
    years: "2025–2026",
    explanation:
      "Rounded guide from 36,000 registered entries in 2025 and the organiser's reported 42,000-runner field in 2026. These are different measures, used to indicate scale.",
    sources: [
      "https://www.manchestermarathon.co.uk/news/london-ballot-2026/",
      "https://www.manchestermarathon.co.uk/news/greater-manchester-comes-alive-as-42000-runners-take-on-record-breaking-adidas-manchester-marathon/",
    ],
  },
  edinburgh: {
    display: "Around 10,500",
    basis: "Finishers",
    years: "2025",
    explanation:
      "Official late-result positions exceed 10,450; a secondary result summary reports 10,453. Both support a rounded figure of 10,500.",
    sources: [
      "https://www.edinburghmarathon.com/results?event=1031&gender=F&page=362&rs=417",
      "https://ausrunning.net/marathon/edinburgh-2025",
    ],
  },
  brighton: {
    display: "14,000+",
    basis: "Finishers",
    years: "2026",
    explanation:
      "The organiser reported more than 14,000 full-marathon finishers; this is a lower-bound indicator, not an exact average.",
    sources: [
      "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/article/2026-brighton-marathon-record-breaker",
    ],
  },
  belfast: {
    display: "Around 6,500",
    basis: "Reported runners",
    years: "2025",
    explanation:
      "The organiser's pre-race announcement described 6,500 runners taking on the full marathon, separately from relay teams and walkers.",
    sources: [
      "https://belfastcitymarathon.com/news/official-charity-partner/Traffic-advice-ahead-of-Belfast-City-Marathon-on-Sunday-4th-May",
    ],
  },
  chester: {
    display: "4,000–5,000",
    basis: "Finishers",
    years: "2024–2025",
    explanation:
      "Rounded range from 4,440 and 4,878 classified finishers in the current official results; DNF, DQ and UOF rows excluded.",
    sources: [
      "https://www.niftyentries.com/Results/2024-MBNA-Chester-Marathon",
      "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon",
    ],
  },
  yorkshire: {
    display: "5,000–6,500",
    basis: "Finishers",
    years: "2024–2025",
    explanation:
      "Secondary results reporting lists approximately 5,298 and 6,486 finishers. Rounded to indicate race scale.",
    sources: [
      "https://marathonview.net/race/137329",
      "https://results.canterburyharriers.org/race-result/21922",
    ],
  },
  "milton-keynes": {
    display: "Around 2,000",
    basis: "Finishers",
    years: "2025–2026",
    explanation:
      "Secondary result reports list 1,934 and approximately 2,215 finishers. Minor source differences do not affect this rounded estimate.",
    sources: [
      "https://results.canterburyharriers.org/race-result/21346",
      "https://marathonview.net/race/146867",
    ],
  },
  southampton: {
    display: "Around 1,500",
    basis: "Finishers",
    years: "2026",
    explanation:
      "Results aggregator reports 1,497 full-marathon finishers. This reflects the recent edition rather than a long-term average.",
    sources: ["https://marathonview.net/race/146803"],
  },
  "loch-ness": {
    display: "Around 6,000",
    basis: "Entrants",
    years: "2025–2026",
    explanation:
      "Organiser reports 5,800 full-marathon entries in 2025 and 6,000 in 2026, excluding other festival distances.",
    sources: [
      "https://lochnessmarathon.com/2025/09/baxters-loch-ness-marathon-festival-of-running-returns-to-the-highlands-this-weekend/",
      "https://lochnessmarathon.com/2026/09/baxters-loch-ness-marathon-set-to-take-over-the-highlands-this-weekend-as-record-number-of-participants-from-around-the-globe-head-to-inverness/",
    ],
  },
  abingdon: {
    display: "Around 1,200",
    basis: "Entrants",
    years: "2025",
    explanation:
      "Woodstock Harriers' race report says the 2025 marathon sold out with 1,200 entries. This is a club-reported estimate, not an organiser-audited registration total.",
    sources: ["https://www.woodstockharriers.co.uk/october-november-december-2025/"],
  },
  windermere: {
    display: "Around 450",
    basis: "Finishers",
    years: "2025",
    explanation: "Results aggregator lists 444 finishers for the UK race in June 2025.",
    sources: ["https://marathonview.net/race/140803"],
  },
  "boston-uk": {
    display: "700–1,000",
    basis: "Finishers",
    years: "2024–2026",
    explanation:
      "Rounded range from 664, 869 and 1,020 classified finishers; zero-time nonfinishers excluded.",
    sources: [
      "https://www.stuweb.co.uk/race/32m/",
      "https://www.stuweb.co.uk/race/3gJ/",
      "https://www.stuweb.co.uk/race/3rl/",
    ],
  },
  leeds: {
    display: "4,400–5,000",
    basis: "Finishers",
    years: "2025–2026",
    explanation:
      "Secondary result summaries list 5,028 and 4,399 finishers, citing Chip Timing UK.",
    sources: ["https://marathonview.net/race/140376", "https://marathonview.net/race/146942"],
  },
  newport: {
    display: "Around 2,800",
    basis: "Finishers",
    years: "2026",
    explanation:
      "Official timing provider lists 2,754 finishers for the full marathon, excluding other distances.",
    sources: [
      "https://results.poweredbypacer.com/results/7fd3a733-e06e-4a9c-b4d6-ea498377d8b0/e74299ee-3266-47eb-b1f3-234a60abe022",
    ],
  },
};
