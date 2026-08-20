/** Shared builder for Marathon Runners Diary calendar snapshots. */
import type { Edition, Series } from "./types";

export const MRD_SOURCE_CHECKED_AT = "2026-08-20";

const RACE_BASE_URL = "http://www.marathonrunnersdiary.com/races/";

export type MarathonSourceRow = readonly [
  slug: string,
  name: string,
  city: string,
  country: string,
  detailPath: string,
  date?: string,
];

export function buildMrdMarathonCatalogue(
  rows: readonly MarathonSourceRow[],
  sourceUrl: string,
  dateNotes: Readonly<Record<string, string>> = {},
): { series: Series[]; editions: Edition[] } {
  const series: Series[] = rows.map(([slug, name, city, country, detailPath]) => ({
    slug,
    name,
    sport: "Running",
    country,
    county: "",
    city,
    area: city,
    surface: "Road",
    distances: ["Marathon"],
    summary: `${name} — marathon 42.2 km.`,
    description:
      "Full marathon listed on Marathon Runners Diary. Confirm the date, entry status and race details on the official event website.",
    organiser: "See official race site",
    website: `${RACE_BASE_URL}${detailPath}`,
    featured: false,
    source_url: sourceUrl,
  }));

  const editions: Edition[] = rows.flatMap(([slug, name, , , detailPath, date]) =>
    date
      ? [
          {
            seriesSlug: slug,
            date,
            distance: "Marathon",
            distanceKm: 42.195,
            status: "TBC" as const,
            source: `${RACE_BASE_URL}${detailPath}`,
            notes: [
              `${name} was listed on Marathon Runners Diary when checked ${MRD_SOURCE_CHECKED_AT}.`,
              dateNotes[slug],
            ]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : [],
  );

  return { series, editions };
}
