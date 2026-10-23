import { z } from "zod";

// Timing type and verification are independent. Never infer chip/gun from a
// provider name, event type, the faster mark, or parenthesised source notation.
const mark = z.string().regex(/^\d+(?::[0-5]\d){0,2}(?:\.\d+)?$/);
export const performanceTimingSchema = z.object({
  basis: z.enum(["chip", "gun", "unknown"]),
  chip: mark.optional(),
  gun: mark.optional(),
});
export type PerformanceTiming = z.infer<typeof performanceTimingSchema>;

/** Explicit hours and minutes establish a finish without supplying exact seconds. */
export function hasMinutePrecisionTime(performance: string): boolean {
  const match = /^(\d+)h ?([0-5]\d)m$/i.exec(performance.trim());
  if (!match) return false;
  const hours = Number(match[1]);
  return Number.isSafeInteger(hours) && (hours > 0 || Number(match[2]) > 0);
}

/** A distance covered in a fixed-duration event establishes a finish, never a timed mark. */
export function hasFixedDurationDistanceMark(performance: string, discipline: string): boolean {
  if (!/^(?:6|12|24|48)\s*(?:h|hrs?|hours?)(?:\s+running)?$/i.test(discipline.trim()))
    return false;
  const distance = /^(\d+(?:\.\d+)?)\s*(?:km|mi|miles?)$/i.exec(performance.trim());
  return distance !== null && Number.isFinite(Number(distance[1])) && Number(distance[1]) > 0;
}

export function hasTimedMark(performance: string, discipline = ""): boolean {
  if (
    /jump|vault|shot|throw|^(?:LJ|TJ|HJ|PV|SP|DT|JT|HT|WT)(?:\d.*)?$|discus|javelin|hammer|points|pentathlon|heptathlon|decathlon|(?:6|12|24|48)\s*(?:h|hours)/i.test(
      discipline,
    )
  )
    return false;
  return /^\d+(?::\d{2}){0,2}(?:\.\d+)?(?:[a-z+]+|\s*\(.*\))?$/i.test(performance.trim());
}

export function timingLabel(basis: PerformanceTiming["basis"]): string {
  return basis === "chip" ? "Chip time" : basis === "gun" ? "Gun time" : "Timing unknown";
}

export function historicalTimingLines(performance: string, timing?: PerformanceTiming): string[] {
  const lines = [timingLabel(timing?.basis ?? "unknown")];
  if (hasMinutePrecisionTime(performance)) lines.unshift("Time recorded to minutes");
  if (timing?.chip && !(timing.basis === "chip" && timing.chip === performance))
    lines.push(`Chip ${timing.chip}`);
  if (timing?.gun && !(timing.basis === "gun" && timing.gun === performance))
    lines.push(`Gun ${timing.gun}`);
  return lines;
}
