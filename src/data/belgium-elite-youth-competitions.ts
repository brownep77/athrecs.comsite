import type { Edition, Series } from "./types.ts";
import {
  CLASSES,
  COUNTIES,
  DISCIPLINES,
  NOTES,
  ORGANISERS,
  SURFACES,
} from "./belgium-elite-youth-competition-dictionaries-a.ts";
import {
  SOURCES,
  WEBSITES,
} from "./belgium-elite-youth-competition-dictionaries-b.ts";
import { BELGIUM_ELITE_YOUTH_ROWS_1 } from "./belgium-elite-youth-competition-rows-1.ts";
import { BELGIUM_ELITE_YOUTH_ROWS_2 } from "./belgium-elite-youth-competition-rows-2.ts";
import { BELGIUM_ELITE_YOUTH_ROWS_3 } from "./belgium-elite-youth-competition-rows-3.ts";
import { BELGIUM_ELITE_YOUTH_ROWS_4 } from "./belgium-elite-youth-competition-rows-4.ts";
import { BELGIUM_ELITE_YOUTH_ROWS_5 } from "./belgium-elite-youth-competition-rows-5.ts";

export type BelgiumEliteYouthAudience =
  | "professional"
  | "elite"
  | "youth"
  | "mixed-elite-youth";

export type BelgiumEliteYouthEntryMode =
  | "team-invitation"
  | "federation-selection"
  | "licensed-competition-registration"
  | "licensed-youth-registration";

export type BelgiumEliteYouthCompetitionConfig = {
  slug: string;
  name: string;
  sport: Series["sport"];
  discipline: string;
  county: string;
  city: string;
  area: string;
  surface: string;
  organiser: string;
  website: string;
  sourceUrl: string;
  audience: BelgiumEliteYouthAudience;
  entryMode: BelgiumEliteYouthEntryMode;
  classes: string[];
  occurrences: Array<{
    date: string;
    status: Edition["status"];
    distanceKm?: number;
    startTime?: string;
    endDate?: string;
    note?: string;
  }>;
};

/**
 * Belgium restricted-entry competition audit.
 *
 * The compact source stores 100 exact-dated professional, elite and youth-only
 * fixtures. Exported objects retain named fields for catalogue consumers.
 * Restricted events never receive a public entry URL.
 */
const SPORT = { C: "Cycling", T: "Triathlon", D: "Duathlon" } as const;
const AUDIENCE = {
  P: "professional",
  E: "elite",
  Y: "youth",
  M: "mixed-elite-youth",
} as const;
const ENTRY_MODE = {
  T: "team-invitation",
  F: "federation-selection",
  C: "licensed-competition-registration",
  Y: "licensed-youth-registration",
} as const;
const STATUS = {
  O: "Open",
  C: "Closed",
  F: "Finished",
  S: "ClosingSoon",
  T: "TBC",
} as const;

const RAW_ROWS = [
  BELGIUM_ELITE_YOUTH_ROWS_1,
  BELGIUM_ELITE_YOUTH_ROWS_2,
  BELGIUM_ELITE_YOUTH_ROWS_3,
  BELGIUM_ELITE_YOUTH_ROWS_4,
  BELGIUM_ELITE_YOUTH_ROWS_5,
]
  .join("\n")
  .trim();

function index(value: string): number {
  return Number.parseInt(value, 36);
}

export const belgiumEliteYouthCompetitionConfigs: BelgiumEliteYouthCompetitionConfig[] =
  RAW_ROWS.split("\n").filter(Boolean).map((line) => {
    const [
      slug,
      name,
      sportCode,
      disciplineCode,
      countyCode,
      city,
      rawArea,
      surfaceCode,
      organiserCode,
      websiteCode,
      sourceCode,
      audienceCode,
      entryModeCode,
      classesCode,
      date,
      statusCode,
      rawDistanceKm,
      startTime,
      endDate,
      noteCode,
    ] = line.split("\t");

    return {
      slug,
      name,
      sport: SPORT[sportCode as keyof typeof SPORT],
      discipline: DISCIPLINES[index(disciplineCode)],
      county: COUNTIES[index(countyCode)],
      city,
      area: rawArea || city,
      surface: SURFACES[index(surfaceCode)],
      organiser: ORGANISERS[index(organiserCode)],
      website: WEBSITES[index(websiteCode)],
      sourceUrl: SOURCES[index(sourceCode)],
      audience: AUDIENCE[audienceCode as keyof typeof AUDIENCE],
      entryMode: ENTRY_MODE[entryModeCode as keyof typeof ENTRY_MODE],
      classes: [...CLASSES[index(classesCode)]],
      occurrences: [
        {
          date,
          status: STATUS[statusCode as keyof typeof STATUS],
          ...(rawDistanceKm ? { distanceKm: Number(rawDistanceKm) } : {}),
          ...(startTime ? { startTime } : {}),
          ...(endDate ? { endDate } : {}),
          ...(NOTES[index(noteCode)] ? { note: NOTES[index(noteCode)] } : {}),
        },
      ],
    };
  });

function audienceLabel(audience: BelgiumEliteYouthAudience): string {
  switch (audience) {
    case "professional":
      return "Professional-only";
    case "elite":
      return "Elite-only";
    case "youth":
      return "Youth-only";
    case "mixed-elite-youth":
      return "Restricted elite and youth categories";
  }
}

function entryRestriction(config: BelgiumEliteYouthCompetitionConfig): string {
  switch (config.entryMode) {
    case "team-invitation":
      return "Participation is by professional team invitation or selection; this is not a public-entry race.";
    case "federation-selection":
      return "Participation is restricted by federation licence, championship eligibility or national-team selection.";
    case "licensed-competition-registration":
      return "Participation is restricted to licensed competition categories and is not an open mass-participation entry.";
    case "licensed-youth-registration":
      return "Participation is restricted to the published youth/development age classes and may require a federation licence.";
  }
}

export const belgiumEliteYouthCompetitionSeries: Series[] =
  belgiumEliteYouthCompetitionConfigs.map((config) => {
    const restriction = entryRestriction(config);
    const classification = audienceLabel(config.audience);
    return {
      slug: config.slug,
      name: config.name,
      sport: config.sport,
      country: "Belgium",
      county: config.county,
      city: config.city,
      area: config.area,
      surface: config.surface,
      distances: ["Other"],
      summary: `${config.name} — ${classification}. ${config.discipline}.`,
      description: `${config.name} in ${config.area}, Belgium. ${classification}. Eligible classes: ${config.classes.join(
        ", ",
      )}. ${restriction}`,
      organiser: config.organiser,
      website: config.website,
      featured: false,
      source_url: config.sourceUrl,
    };
  });

export const belgiumEliteYouthCompetitionEditions: Edition[] =
  belgiumEliteYouthCompetitionConfigs.flatMap((config) =>
    config.occurrences.map((occurrence) => ({
      seriesSlug: config.slug,
      date: occurrence.date,
      distance: "Other",
      distanceKm: occurrence.distanceKm ?? 0,
      status: occurrence.status,
      ...(occurrence.startTime ? { startTime: occurrence.startTime } : {}),
      source: config.sourceUrl,
      notes: [
        `${audienceLabel(config.audience)}.`,
        `Eligible classes: ${config.classes.join(", ")}.`,
        entryRestriction(config),
        occurrence.endDate ? `Competition runs through ${occurrence.endDate}.` : "",
        occurrence.note ?? "",
      ]
        .filter(Boolean)
        .join(" "),
    })),
  );
