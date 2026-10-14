import { z } from "zod";

const filter = z.string().trim().max(200).default("");
export const statsFilters = z
  .object({
    sport: filter,
    distance: filter,
    raceCountry: filter,
    raceCounty: filter,
    year: z.number().int().min(1800).max(2200).nullable().default(null),
    raceGroup: z.enum(["sport", "distance", "country", "county", "detail"]).default("sport"),
    gender: filter,
    profileCountry: filter,
    profileCounty: filter,
    profileGroup: z.enum(["gender", "country", "county", "detail"]).default("gender"),
  })
  .strict();
export type StatsFilters = z.infer<typeof statsFilters>;
export const defaultStatsFilters = statsFilters.parse({});

export type RaceCounts = { events: number; editions: number };
export type ProfileCounts = { profiles: number; publicProfiles: number; added7d: number };
export type RaceStatsRow = RaceCounts & {
  sport: string | null;
  distance: string | null;
  country: string | null;
  county: string | null;
};
export type ProfileStatsRow = ProfileCounts & {
  gender: string | null;
  country: string | null;
  county: string | null;
};
export type StatsReport = {
  generatedAt: string;
  totals: RaceCounts & ProfileCounts;
  excluded: { eventAliases: number; testProfiles: number };
  races: {
    totals: RaceCounts;
    rows: RaceStatsRow[];
    gaps: { sport: number; distance: number; country: number; county: number };
  };
  profiles: {
    totals: ProfileCounts;
    rows: ProfileStatsRow[];
    gaps: { gender: number; country: number; county: number };
  };
  options: {
    sports: string[];
    distances: string[];
    raceCountries: string[];
    raceCounties: string[];
    years: number[];
    genders: string[];
    profileCountries: string[];
    profileCounties: string[];
  };
};

/** Quote all cells and neutralise spreadsheet formulas in imported labels. */
export function statsCsv(rows: (string | number | null)[][]): string {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? "");
            if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
