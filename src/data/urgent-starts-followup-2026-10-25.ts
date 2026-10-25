import details from "./urgent-starts-followup-2026-10-25.json" with { type: "json" };
import type { Edition } from "./types";

const checked: Record<
  string,
  {
    sourceUrl: string;
    checkedAt: string;
    starts: Record<string, { time: string; note: string }>;
  }
> = details;

export const urgentReviewedAdditions: Edition[] = [
  ["wa-les-foul-es-monterelaises-7244787", "10K", 10],
  ["wa-trek-marathon-de-lille-7244788", "Marathon", 42.195],
  ["wa-maratonina-citt-di-arezzo-7242465", "Half", 21.0975],
].map(([slug, distance, distanceKm]) => ({
  seriesSlug: String(slug),
  date: "2026-10-25",
  distance: String(distance),
  distanceKm: Number(distanceKm),
  status: "Closed",
  source: checked[`${slug}|2026-10-25`].sourceUrl,
  publishAllDistances: true,
}));

/** Only these opened organiser programmes establish a replacement for Other. */
export function isUrgentReviewedPlaceholder(slug: string, date: string, distance: string) {
  return (
    distance === "Other" &&
    urgentReviewedAdditions.some((edition) => edition.seriesSlug === slug && edition.date === date)
  );
}

/** Pin the correction to this edition so a later seed cannot restore its missing clock. */
export function reviewUrgentEdition(edition: Edition): Edition {
  const detail = checked[`${edition.seriesSlug}|${edition.date}`];
  const start = detail?.starts[edition.distance];
  if (!start) return edition;
  return {
    ...edition,
    startTime: start.time,
    source: detail.sourceUrl,
    ...(["santa-cruz-marathon", "ecomarathon-futakotama-october"].includes(edition.seriesSlug)
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
