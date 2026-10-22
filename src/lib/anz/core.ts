import { z } from "zod";
import type { SourceHistory, SourcePerformance } from "../athrecs/source-performance-history.ts";
import { isCompletedHistoryResult } from "../athrecs/profile-history-results.ts";

export const ANZ_PROVIDER = "Athletics New Zealand Rankings and Records";
export function anzSource(value: string) {
  const url = new URL(value);
  const id = url.pathname.match(/^\/site\/profiles_con\/athlete\/([1-9]\d{0,10})\/?$/)?.[1];
  if (
    url.protocol !== "https:" ||
    !["www.anzrankings.org.nz", "anzrankings.org.nz"].includes(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    !id
  )
    throw new Error("Use an Athletics New Zealand athlete profile link.");
  return { externalId: id, url: `https://www.anzrankings.org.nz/site/profiles_con/athlete/${id}` };
}
export const anzMedalSchema = z.object({
  year: z.number().int().min(1900).max(2200),
  event: z.string().min(1).max(100),
  ageGroup: z.string().max(100),
  performance: z.string().max(50),
  medal: z.enum(["gold", "silver", "bronze"]),
  sourceUrl: z.string().url(),
});
export type AnzMedal = z.infer<typeof anzMedalSchema>;
export type AnzCapture = {
  externalId: string;
  sourceUrl: string;
  name: string;
  club: string;
  coach: string;
  medals: AnzMedal[];
  history: SourceHistory;
  eventCount: number;
};
export const anzRequestSchema = z
  .object({ url: z.string().max(2048), athleteId: z.number().int().positive() })
  .strict();
export const anzSaveSchema = anzRequestSchema
  .extend({
    version: z.string().regex(/^[a-f0-9]{64}$/),
    sourceChecked: z.literal(true),
  })
  .strict();
export function publicAnzMedals(details: unknown, histories: readonly SourceHistory[]): AnzMedal[] {
  const metadata = (
    details as { anzImport?: { verificationStatus?: string; medals?: unknown } } | null
  )?.anzImport;
  if (metadata?.verificationStatus !== "source_verified") return [];
  const parsed = z.array(anzMedalSchema).max(500).safeParse(metadata.medals);
  if (!parsed.success) return [];
  return parsed.data.filter((medal) =>
    histories.some(
      (h) =>
        (h.provider === ANZ_PROVIDER || h.rankingHistory === true) &&
        h.sourceUrl === medal.sourceUrl &&
        h.performances.some(
          (row) =>
            row.year === medal.year &&
            row.discipline === medal.event &&
            row.performance === medal.performance &&
            isCompletedHistoryResult(row),
        ),
    ),
  );
}
export function anzPerformanceKey(row: SourcePerformance) {
  return JSON.stringify([
    row.date,
    row.discipline,
    row.performance,
    row.wind,
    row.place,
    row.meeting,
    row.venue,
  ]);
}
// ANZ's unqualified metre events are track; km events are road. Never pool them.
const runningEvents = /^(?:\d+m|Mile|2 Miles|\d+(?:\.\d+)?km|Half Marathon|Marathon|Mile Road)$/i;
export function anzTime(row: SourcePerformance): number | null {
  if (
    !isCompletedHistoryResult(row) ||
    !runningEvents.test(row.discipline) ||
    !/^(?:\d+:)*\d+(?:\.\d+)?$/.test(row.performance) ||
    (row.wind && (!/^[+-]?\d+(?:\.\d+)?$/.test(row.wind) || Number(row.wind) > 2)) ||
    row.labels.some((l) => /short course|hand tim|indoor|implement|hurdle|assisted|aided/i.test(l))
  )
    return null;
  const parts = row.performance.split(":").map(Number);
  if (parts.length > 3 || parts.slice(1).some((n) => n >= 60)) return null;
  const value = parts.reduce((n, part) => n * 60 + part, 0);
  return value > 0 ? value : null;
}
export function anzProgress(histories: readonly SourceHistory[]) {
  const groups = new Map<string, SourcePerformance[]>();
  for (const h of histories.filter((h) => h.provider === ANZ_PROVIDER || h.rankingHistory === true))
    for (const row of h.performances) {
      if (anzTime(row) === null) continue;
      const rows = groups.get(row.discipline) ?? [];
      if (!rows.some((r) => anzPerformanceKey(r) === anzPerformanceKey(row))) rows.push(row);
      groups.set(row.discipline, rows);
    }
  return [...groups].map(([discipline, rows]) => {
    const best = [...rows].sort(
      (a, b) => anzTime(a)! - anzTime(b)! || a.date.localeCompare(b.date),
    )[0];
    const years = [...new Set(rows.map((r) => r.year))]
      .sort((a, b) => a - b)
      .map(
        (year) =>
          rows
            .filter((r) => r.year === year)
            .sort((a, b) => anzTime(a)! - anzTime(b)! || a.date.localeCompare(b.date))[0],
      );
    return {
      discipline,
      rows,
      best,
      years,
      surface: /km$|marathon|mile road/i.test(discipline) ? "Road" : "Track",
    };
  });
}
