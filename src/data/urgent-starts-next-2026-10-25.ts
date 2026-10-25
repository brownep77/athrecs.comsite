import details from "./urgent-starts-next-2026-10-25.json" with { type: "json" };
import type { Edition, Series } from "./types";

export const nextUrgentSeriesOverrides: Record<string, Partial<Series>> = {
  "wa-privatbank-kyiv-unbroken-marathon-7237779": {
    sport: "Running",
    distances: ["Marathon", "21K", "10K", "5K"],
    website: "https://kyivmarathon.org/programa-zahodu/",
  },
  "wa-croatian-road-running-championships-7245412": {
    sport: "Running",
    distances: ["3K", "5K", "10K"],
    website:
      "https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf",
  },
  "wa-yuen-long-district-sports-festival-yuen-tin-street-run-inline-speed-skating-7246699": {
    sport: "Running",
    distances: ["10K", "3K", "1K"],
    website: "https://ytstreetrun.sportsoho.com/inline-skating-street-run",
  },
  "sierra-leone-marathon": {
    sport: "Running",
    distances: ["Marathon"],
    website: "https://www.street-child.org/challenges/the-sierra-leone-marathon",
  },
  "les-foulees-mamertines": {
    sport: "Running",
    distances: ["1.5K", "3K"],
    website: "https://fr.milesrepublic.com/event/les-foulees-mamertines-17292",
  },
  "wa-media-maraton-del-callao-7247350": {
    sport: "Running",
    distances: ["Half", "10K"],
    website: "https://perurunners.com/evento/media-maraton-del-callao-10k-2026/",
  },
};
export const nextUrgentAdditions: Edition[] = [
  {
    seriesSlug: "wa-privatbank-kyiv-unbroken-marathon-7237779",
    date: "2026-10-25",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "Closed",
    source: "https://kyivmarathon.org/programa-zahodu/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-privatbank-kyiv-unbroken-marathon-7237779",
    date: "2026-10-25",
    distance: "21K",
    distanceKm: 21,
    status: "Closed",
    source: "https://kyivmarathon.org/programa-zahodu/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-privatbank-kyiv-unbroken-marathon-7237779",
    date: "2026-10-25",
    distance: "10K",
    distanceKm: 10,
    status: "Closed",
    source: "https://kyivmarathon.org/programa-zahodu/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-privatbank-kyiv-unbroken-marathon-7237779",
    date: "2026-10-25",
    distance: "5K",
    distanceKm: 5,
    status: "Closed",
    source: "https://kyivmarathon.org/programa-zahodu/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-4th-kokushikan-university-competition-7245266",
    date: "2026-11-07",
    distance: "Track & field",
    distanceKm: 0,
    status: "Closed",
    source:
      "https://kokushikan-trackfield.com/schedule/%E7%AC%AC4%E5%9B%9E%E5%9B%BD%E5%A3%AB%E8%88%98%E5%A4%A7%E5%AD%A6%E7%AB%B6%E6%8A%80%E4%BC%9A/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-4th-kokushikan-university-competition-7245266",
    date: "2026-11-08",
    distance: "Track & field",
    distanceKm: 0,
    status: "Closed",
    source:
      "https://kokushikan-trackfield.com/schedule/%E7%AC%AC4%E5%9B%9E%E5%9B%BD%E5%A3%AB%E8%88%98%E5%A4%A7%E5%AD%A6%E7%AB%B6%E6%8A%80%E4%BC%9A/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-croatian-road-running-championships-7245412",
    date: "2026-10-31",
    distance: "3K",
    distanceKm: 3,
    status: "Open",
    source:
      "https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-croatian-road-running-championships-7245412",
    date: "2026-10-31",
    distance: "5K",
    distanceKm: 5,
    status: "Open",
    source:
      "https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-croatian-road-running-championships-7245412",
    date: "2026-10-31",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    source:
      "https://has.hr/images/stories/HAS/servisi/raspisi26/20261031_Zapresic_PH_cestovna_trcanja_raspis.pdf",
    publishAllDistances: true,
  },
  {
    seriesSlug:
      "wa-yuen-long-district-sports-festival-yuen-tin-street-run-inline-speed-skating-7246699",
    date: "2026-10-25",
    distance: "10K",
    distanceKm: 10,
    status: "TBC",
    source: "https://ytstreetrun.sportsoho.com/inline-skating-street-run",
    publishAllDistances: true,
  },
  {
    seriesSlug:
      "wa-yuen-long-district-sports-festival-yuen-tin-street-run-inline-speed-skating-7246699",
    date: "2026-10-25",
    distance: "3K",
    distanceKm: 3,
    status: "TBC",
    source: "https://ytstreetrun.sportsoho.com/inline-skating-street-run",
    publishAllDistances: true,
  },
  {
    seriesSlug:
      "wa-yuen-long-district-sports-festival-yuen-tin-street-run-inline-speed-skating-7246699",
    date: "2026-10-25",
    distance: "1K",
    distanceKm: 1,
    status: "TBC",
    source: "https://ytstreetrun.sportsoho.com/inline-skating-street-run",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-media-maraton-del-callao-7247350",
    date: "2026-10-25",
    distance: "Half",
    distanceKm: 21.0975,
    status: "TBC",
    source: "https://perurunners.com/evento/media-maraton-del-callao-10k-2026/",
    publishAllDistances: true,
  },
  {
    seriesSlug: "wa-media-maraton-del-callao-7247350",
    date: "2026-10-25",
    distance: "10K",
    distanceKm: 10,
    status: "TBC",
    source: "https://perurunners.com/evento/media-maraton-del-callao-10k-2026/",
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

export function isNextUrgentPlaceholder(slug: string, date: string, distance: string) {
  return (
    distance === "Other" &&
    nextUrgentAdditions.some((edition) => edition.seriesSlug === slug && edition.date === date)
  );
}

export function reviewNextUrgentEdition(edition: Edition): Edition {
  const detail = checked[`${edition.seriesSlug}|${edition.date}`];
  const start = detail?.starts[edition.distance];
  if (!start) return edition;
  return {
    ...edition,
    startTime: start.time ?? undefined,
    source: detail.sourceUrl,
    ...(edition.seriesSlug === "wa-5th-shuhei-nishida-memorial-track-and-field-tournament-7244642"
      ? { status: "Cancelled" as const }
      : {}),
    notes: [
      edition.notes,
      `Date checked ${detail.checkedAt} against ${detail.sourceUrl}. ${start.note}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
