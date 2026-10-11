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

export function hasTimedMark(performance: string, discipline = ""): boolean {
  if (
    /jump|vault|shot|^(?:LJ|TJ|HJ|PV|SP|DT|JT|HT|WT)(?:\d.*)?$|discus|javelin|hammer|points|pentathlon|heptathlon|decathlon|(?:6|12|24|48)\s*(?:h|hours)/i.test(
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
  if (timing?.chip && !(timing.basis === "chip" && timing.chip === performance))
    lines.push(`Chip ${timing.chip}`);
  if (timing?.gun && !(timing.basis === "gun" && timing.gun === performance))
    lines.push(`Gun ${timing.gun}`);
  return lines;
}
