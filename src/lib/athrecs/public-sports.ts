import type { Sport } from "./types";

/** One public catalogue boundary for menus, detail pages, entries and sitemaps. */
export const ATHRECS_PUBLIC_SPORTS = [
  "Athletics",
  "Running",
  "Parkrun",
  "Triathlon",
  "Cycling",
  "Swimming",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "Indoor Rowing",
  "OCR",
  "Adventure Racing",
  "Functional Fitness",
  "HYROX",
  "DEKA",
  "CrossFit",
  "Swimrun",
  "Orienteering",
  "Cross-country Skiing",
  "Roller Skiing",
] as const satisfies readonly Sport[];

export const HYBRID_FITNESS_SPORTS = ["Functional Fitness", "HYROX", "DEKA", "CrossFit"] as const;

export function isAthrecsPublicSport(
  value: unknown,
): value is (typeof ATHRECS_PUBLIC_SPORTS)[number] {
  return typeof value === "string" && (ATHRECS_PUBLIC_SPORTS as readonly string[]).includes(value);
}
