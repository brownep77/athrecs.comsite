import details from "./imminent-starts-2026-10-25.json" with { type: "json" };
import type { Edition } from "./types";

const checked: Record<
  string,
  {
    sourceUrl: string;
    checkedAt: string;
    starts: Record<string, { time: string | null; note: string }>;
  }
> = details;

/** Keep reseeding consistent with the exact reviewed editions; never infer a future start. */
export function reviewImminentEdition(edition: Edition): Edition {
  const detail = checked[`${edition.seriesSlug}|${edition.date}`];
  const start = detail?.starts[edition.distance];
  if (!start) return edition;
  return {
    ...edition,
    startTime: start.time ?? undefined,
    source: detail.sourceUrl,
    ...(edition.seriesSlug === "oktoberfest-half-college-station"
      ? { status: "Closed" as const }
      : {}),
    notes: [
      edition.notes,
      `Date checked ${detail.checkedAt} against ${detail.sourceUrl}. ${start.note}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

/** Only the three rescheduled distances confirmed by the revised organiser programme. */
export const imminentReviewedAdditions: Edition[] = [
  ["10K", 10],
  ["Half", 21.0975],
  ["Marathon", 42.195],
].map(([distance, distanceKm]) => ({
  seriesSlug: "tirana-marathon",
  date: "2026-11-15",
  distance: String(distance),
  distanceKm: Number(distanceKm),
  status: "Open",
  source: "https://www.tiranamarathon.com/en",
  publishAllDistances: true,
}));
