export type RaceFormatFact = {
  label: string;
  value: string;
};

export type RaceStage = {
  stage: string;
  distance: string;
  detail: string;
};

export type RaceFormatGuide = {
  title: string;
  overview: string;
  facts: RaceFormatFact[];
  stageTitle: string;
  stages: RaceStage[];
  stageNote: string;
  essentials: string[];
  sourceLabel: string;
  sourceUrl: string;
};

const guides: Record<string, RaceFormatGuide> = {
  "mds-legendary-morocco": {
    title: "MDS Legendary race format",
    overview:
      "The original Marathon des Sables is a multi-stage foot race through the Moroccan Sahara. Competitors may run or walk approximately 250 km while living at the desert bivouac and carrying their own food, sleeping gear and mandatory equipment.",
    facts: [
      { label: "Total distance", value: "Approximately 250 km / 155.3 mi" },
      { label: "Race structure", value: "6 stages over 7 days" },
      { label: "Full programme", value: "11 days, including 9 in the desert" },
      { label: "Format", value: "Food self-sufficiency" },
    ],
    stageTitle: "Example six-stage breakdown",
    stages: [
      { stage: "Stage 1", distance: "About 32 km", detail: "Opening desert stage" },
      { stage: "Stage 2", distance: "About 40 km", detail: "Full desert stage" },
      { stage: "Stage 3", distance: "About 32.5 km", detail: "Full desert stage" },
      {
        stage: "Stage 4",
        distance: "About 80–90 km",
        detail: "Long stage, continuing partly through the night",
      },
      { stage: "Stage 5", distance: "About 42 km", detail: "Marathon stage" },
      { stage: "Stage 6", distance: "About 21.1 km", detail: "Final stage" },
    ],
    stageNote:
      "These are the organiser’s example distances from the 2025 edition. The route, elevation, stage order and distances can change each year; the exact course is confirmed in the official roadbook at the bivouac before the race.",
    essentials: [
      "Participants compete at their own pace and may run or walk, subject to the official checkpoints and cut-offs.",
      "Food self-sufficiency means carrying personal food, sleeping gear and the mandatory kit throughout the race.",
      "Competitors sleep at the bivouac in traditional eight-person Berber tents; sanitary facilities and a medical clinic are available at camp.",
      "The long stage is the defining challenge and runs partly at night. Its distance, checkpoints and time limit are confirmed in the roadbook.",
    ],
    sourceLabel: "Official MDS Legendary 2027 race information",
    sourceUrl: "https://marathondessables.com/en/event/mds-legendary-2027",
  },
};

export function raceFormatGuideFor(slug: string): RaceFormatGuide | null {
  return guides[slug] ?? null;
}
