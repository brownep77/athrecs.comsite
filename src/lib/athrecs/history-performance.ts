import type { SourcePerformance } from "./source-performance-history";
import { hasTimedMark } from "./performance-timing.ts";

/** Strict display projection; the original mark and its timing columns stay untouched. */
export function historicalTime(mark: string): number | null {
  if (!/^\d+(?::[0-5]\d){0,2}(?:\.\d+)?$/.test(mark)) return null;
  const seconds = mark.split(":").reduce((sum, part) => sum * 60 + Number(part), 0);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function historicalMark(row: SourcePerformance) {
  const match = row.performance
    .trim()
    .match(/^(\d+(?::[0-5]\d){0,2}(?:\.\d+)?)(a?)(?:\((\d+(?::[0-5]\d){0,2}(?:\.\d+)?)\))?$/i);
  if (!match) return null;
  const seconds = historicalTime(match[1]);
  if (seconds === null) return null;
  return { mark: match[1], seconds, aided: Boolean(match[2]) };
}

export function historicalDistance(discipline: string, sport: string) {
  const code = discipline.trim();
  if (sport === "Indoor Rowing") {
    const erg = /^Indoor Rowing (Lightweight )?(\d+(?:\.\d+)?)m$/i.exec(code);
    if (erg)
      return {
        code: `${Number(erg[2])}m${erg[1] ? " Lightweight" : ""}`,
        km: Number(erg[2]) / 1000,
      };
  }
  if (sport === "Parkrun" && /^parkrun$/i.test(code)) return { code: "5K", km: 5 };
  if (/^marathon$/i.test(code)) return { code: "Marathon", km: 42.195 };
  if (/^half(?: marathon)?$/i.test(code)) return { code: "Half", km: 21.0975 };
  if (sport === "Walking") {
    const walk =
      /^(\d+(?:\.\d+)?)\s*(m|metres|meters|k|km|kilometres|kilometers)\s+race walk(?:ing)?$/i.exec(
        code,
      );
    if (walk) {
      const metres = /^(?:m|metres|meters)$/i.test(walk[2]);
      return {
        code: `${Number(walk[1])}${metres ? "m" : "K"}`,
        km: Number(walk[1]) / (metres ? 1000 : 1),
      };
    }
  }
  if (sport === "Athletics") {
    const metres = /^(\d+(?:\.\d+)?)\s*(?:m|metres|meters)?$/i.exec(code);
    if (metres) return { code: `${Number(metres[1])}m`, km: Number(metres[1]) / 1000 };
    if (/^mile$/i.test(code)) return { code: "Mile", km: 1.609344 };
    if (/^2 miles$/i.test(code)) return { code: "2 miles", km: 3.218688 };
  }
  const km = /^(\d+(?:\.\d+)?)\s*k(?:m)?$/i.exec(code);
  if (km) return { code: `${Number(km[1])}K`, km: Number(km[1]) };
  const miles = /^(\d+(?:\.\d+)?)\s*(?:mi|miles?)$/i.exec(code);
  if (miles) return { code: `${Number(miles[1])}mi`, km: Number(miles[1]) * 1.609344 };
  return { code, km: 0 };
}

export function historicalPbEligible(row: SourcePerformance): boolean {
  return (
    hasTimedMark(historicalMark(row)?.mark ?? "", row.discipline) &&
    Boolean(historicalMark(row)) &&
    !row.syntheticTest &&
    !row.profileExcluded &&
    !row.disqualification &&
    !/conflicting (?:source|details|result)|not legal/i.test(row.notes ?? "") &&
    !row.labels.some((label) =>
      /\b(?:split|intermediate|relay|short course|assisted|aided)\b/i.test(label),
    ) &&
    !/relay|short|multi|xc|fell|hurdle|steeple/i.test(row.discipline) &&
    !/relay/i.test(row.meeting) &&
    !(row.wind && (!Number.isFinite(Number(row.wind)) || Number(row.wind) > 2))
  );
}
