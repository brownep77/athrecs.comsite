export type MarathonFieldSample = { year: number; finishers: number; sourceUrl: string };
export type MarathonCapacity = { year: number; places: number; sourceUrl: string; note?: string };
export type MarathonEntryField = {
  year: number;
  entries: number;
  qualifier?: "approximately" | "more than";
  sourceUrl: string;
  note?: string;
};
export type MarathonFieldEvidence = {
  finishers: MarathonFieldSample[];
  capacities: MarathonCapacity[];
  entries?: MarathonEntryField[];
  reportedField?: { year: number; label: string; count: number; sourceUrl: string; note?: string };
};

/** Full marathon only. Sources checked 26 September 2026; no festival totals or estimated attendance. */
export const UK_MARATHON_FIELDS: Readonly<Record<string, MarathonFieldEvidence>> = {
  // Nifty rows minus DNF/DQ/UOF: 2023 3465-74; 2024 4509-68-1; 2025 4959-73-6-2.
  chester: {
    finishers: [
      {
        year: 2023,
        finishers: 3391,
        sourceUrl: "https://www.niftyentries.com/Results/2023-MBNA-Chester-Marathon",
      },
      {
        year: 2024,
        finishers: 4440,
        sourceUrl: "https://www.niftyentries.com/Results/2024-MBNA-Chester-Marathon",
      },
      {
        year: 2025,
        finishers: 4878,
        sourceUrl: "https://www.niftyentries.com/Results/2025-MBNA-Chester-Marathon",
      },
    ],
    capacities: [],
  },
  "boston-uk": {
    finishers: [
      { year: 2024, finishers: 664, sourceUrl: "https://www.stuweb.co.uk/race/32m/" },
      { year: 2025, finishers: 869, sourceUrl: "https://www.stuweb.co.uk/race/3gJ/" },
      { year: 2026, finishers: 1020, sourceUrl: "https://www.stuweb.co.uk/race/3rl/" },
    ],
    capacities: [
      {
        year: 2027,
        places: 1400,
        sourceUrl: "https://www.stuweb.co.uk/race/3xR",
        note: "Published full-marathon athlete places; availability can change.",
      },
    ],
  },
  newport: {
    finishers: [
      {
        year: 2026,
        finishers: 2754,
        sourceUrl:
          "https://results.poweredbypacer.com/results/7fd3a733-e06e-4a9c-b4d6-ea498377d8b0/e74299ee-3266-47eb-b1f3-234a60abe022",
      },
    ],
    capacities: [],
  },
  london: {
    finishers: [
      {
        year: 2025,
        finishers: 56640,
        sourceUrl:
          "https://www.londonmarathonevents.co.uk/london-marathon/article/2025-tcs-london-marathon-sets-new-fundraising-record-ps873-million-total",
      },
      {
        year: 2026,
        finishers: 59830,
        sourceUrl:
          "https://www.londonmarathonevents.co.uk/london-marathon/article/2026-tcs-london-marathon-breaks-guinness-world-records-title-largest-number",
      },
    ],
    capacities: [],
    reportedField: {
      year: 2027,
      label: "Announced participants",
      count: 100000,
      sourceUrl:
        "https://www.londonmarathonevents.co.uk/london-marathon/2027-tcs-london-marathon-double-faqs",
      note: "Across both race days combined; the organiser does not describe this as a hard entry limit.",
    },
  },
  manchester: {
    finishers: [],
    capacities: [],
    entries: [
      {
        year: 2025,
        entries: 36000,
        sourceUrl: "https://www.manchestermarathon.co.uk/news/london-ballot-2026/",
      },
    ],
    reportedField: {
      year: 2027,
      label: "Announced participants",
      count: 52000,
      sourceUrl: "https://www.manchestermarathon.co.uk/event-info/about-event/",
      note: "Announced field size; a separate numeric entry limit has not been verified.",
    },
  },
  brighton: {
    finishers: [],
    capacities: [],
    reportedField: {
      year: 2026,
      label: "More than this many finishers",
      count: 14000,
      sourceUrl:
        "https://www.londonmarathonevents.co.uk/brighton-marathon-weekend/article/2026-brighton-marathon-record-breaker",
      note: "The organiser gives a lower bound, so this is not used as an exact average sample.",
    },
  },
  abingdon: {
    finishers: [
      {
        year: 2024,
        finishers: 991,
        sourceUrl: "https://www.abingdonmarathon.org.uk/s/FullRaceresults2024.pdf",
      },
      {
        year: 2025,
        finishers: 1017,
        sourceUrl: "https://www.abingdonmarathon.org.uk/s/2025resultsforwebv2.pdf",
      },
    ],
    capacities: [],
  },
  "loch-ness": {
    finishers: [],
    capacities: [],
    entries: [
      {
        year: 2025,
        entries: 5800,
        sourceUrl:
          "https://lochnessmarathon.com/2025/09/baxters-loch-ness-marathon-festival-of-running-returns-to-the-highlands-this-weekend/",
      },
      {
        year: 2026,
        entries: 6000,
        sourceUrl:
          "https://lochnessmarathon.com/2026/09/baxters-loch-ness-marathon-set-to-take-over-the-highlands-this-weekend-as-record-number-of-participants-from-around-the-globe-head-to-inverness/",
      },
    ],
    reportedField: {
      year: 2026,
      label: "Sold-out marathon entries",
      count: 6000,
      sourceUrl:
        "https://lochnessmarathon.com/2026/09/baxters-loch-ness-marathon-set-to-take-over-the-highlands-this-weekend-as-record-number-of-participants-from-around-the-globe-head-to-inverness/",
      note: "This is the 2026 entered field, not a confirmed 2027 entry limit.",
    },
  },
};

export function averageMarathonField(raceId: string) {
  const samples = UK_MARATHON_FIELDS[raceId]?.finishers ?? [];
  if (samples.length < 2) return null;
  return {
    count: Math.round(samples.reduce((sum, sample) => sum + sample.finishers, 0) / samples.length),
    samples,
  };
}

export function marathonCapacity(raceId: string, year: number) {
  return UK_MARATHON_FIELDS[raceId]?.capacities.find((capacity) => capacity.year === year) ?? null;
}

export function marathonEntries(raceId: string, year: number) {
  return UK_MARATHON_FIELDS[raceId]?.entries?.find((field) => field.year === year) ?? null;
}

export function formatMarathonEntries(field: MarathonEntryField): string {
  return `${field.qualifier ? `${field.qualifier === "approximately" ? "About" : "More than"} ` : ""}${field.entries.toLocaleString("en-GB")}`;
}
