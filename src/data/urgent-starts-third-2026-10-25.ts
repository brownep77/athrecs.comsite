import details from "./urgent-starts-third-2026-10-25.json" with { type: "json" };
import type { Edition, Series } from "./types";
export const thirdUrgentSeriesOverrides: Record<string, Partial<Series>> = {
  "changsha-marathon": {
    distances: ["Marathon", "Half"],
    website: "https://www.marathonchangsha.com/Detail/30",
  },
  "wa-ukrainian-cross-country-championships-7240272": {
    distances: ["6.4K U23 women", "6.4K U23 men", "8K women", "8K men", "4x1K relay"],
    website: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
  },
  "be-youth-cx-beernem-october": {
    distances: [
      "Cyclo-cross U12",
      "Cyclo-cross U15 - 12 years",
      "Cyclo-cross U15 - 13 years",
      "Cyclo-cross U15 - 14 years",
    ],
    website: "https://cycling.vlaanderen/competitie/kalender",
  },
};
export const thirdUrgentAdditions: Edition[] = [
  {
    seriesSlug: "changsha-marathon",
    date: "2026-11-15",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "Closed",
    source: "https://www.marathonchangsha.com/Detail/30",
    publishAllDistances: true,
  },
  {
    seriesSlug: "changsha-marathon",
    date: "2026-11-15",
    distance: "Half",
    distanceKm: 21.0975,
    status: "Closed",
    source: "https://www.marathonchangsha.com/Detail/30",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-ukrainian-cross-country-championships-7240272",
    date: "2026-10-25",
    distance: "6.4K U23 women",
    distanceKm: 6.4,
    status: "Open",
    source: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-ukrainian-cross-country-championships-7240272",
    date: "2026-10-25",
    distance: "6.4K U23 men",
    distanceKm: 6.4,
    status: "Open",
    source: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-ukrainian-cross-country-championships-7240272",
    date: "2026-10-25",
    distance: "8K women",
    distanceKm: 8,
    status: "Open",
    source: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-ukrainian-cross-country-championships-7240272",
    date: "2026-10-25",
    distance: "8K men",
    distanceKm: 8,
    status: "Open",
    source: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-ukrainian-cross-country-championships-7240272",
    date: "2026-10-25",
    distance: "4x1K relay",
    distanceKm: 4,
    status: "TBC",
    source: "https://competitions.uaf.org.ua/2026.10.24-25_uzhhorod/live",
    publishAllDistances: true,
  },
  {
    seriesSlug: "be-youth-cx-beernem-october",
    date: "2026-10-25",
    distance: "Cyclo-cross U12",
    distanceKm: 0,
    status: "Open",
    source: "https://cycling.vlaanderen/competitie/kalender",
    publishAllDistances: true,
  },
  {
    seriesSlug: "be-youth-cx-beernem-october",
    date: "2026-10-25",
    distance: "Cyclo-cross U15 - 12 years",
    distanceKm: 0,
    status: "Open",
    source: "https://cycling.vlaanderen/competitie/kalender",
    publishAllDistances: true,
  },
  {
    seriesSlug: "be-youth-cx-beernem-october",
    date: "2026-10-25",
    distance: "Cyclo-cross U15 - 13 years",
    distanceKm: 0,
    status: "Open",
    source: "https://cycling.vlaanderen/competitie/kalender",
    publishAllDistances: true,
  },
  {
    seriesSlug: "be-youth-cx-beernem-october",
    date: "2026-10-25",
    distance: "Cyclo-cross U15 - 14 years",
    distanceKm: 0,
    status: "Open",
    source: "https://cycling.vlaanderen/competitie/kalender",
    publishAllDistances: true,
  },
];
const checked: Record<
  string,
  {
    sourceUrl: string;
    checkedAt: string;
    starts: Record<string, { time: string | null; note: string }>;
  }
> = details;
export function isThirdUrgentPlaceholder(slug: string, date: string, distance: string) {
  return (
    distance === "Other" &&
    thirdUrgentAdditions.some((e) => e.seriesSlug === slug && e.date === date)
  );
}
export function reviewThirdUrgentEdition(edition: Edition): Edition {
  const detail = checked[`${edition.seriesSlug}|${edition.date}`];
  const start = detail?.starts[edition.distance];
  if (!start) return edition;
  return {
    ...edition,
    startTime: start.time ?? undefined,
    source: detail.sourceUrl,
    ...(edition.seriesSlug === "maule-corre" ? { status: "Closed" as const } : {}),
    notes: [
      edition.notes,
      `Date checked ${detail.checkedAt} against ${detail.sourceUrl}. ${start.note}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
