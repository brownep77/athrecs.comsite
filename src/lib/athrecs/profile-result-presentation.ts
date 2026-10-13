import type { ProfileResult } from "./profile-records";
import type { SourcePerformance } from "./source-performance-history";
import type { ReportedRaceRecord } from "./reported-race-history";
import { isDisqualified } from "./result-details.ts";

export type ResultVerification = { verified: boolean; explanation: string };

/** An explicit review wins; a link alone never establishes verification. */
export function resultVerification(
  status?: string,
  provider?: string | null,
  conflicting = false,
): ResultVerification {
  if (conflicting) return { verified: false, explanation: "Conflicting results need review." };
  if (status === "unverified")
    return { verified: false, explanation: "This result has not been verified." };
  if (status === "source_verified")
    return {
      verified: true,
      explanation: "Checked against the result source; this does not verify account ownership.",
    };
  if (status === "verified_by_administrator")
    return { verified: true, explanation: "Confirmed by an AthRecs administrator." };
  // The owner accepts the existing World Athletics imports as the official record.
  if (/^world\s*athletics$/i.test(provider?.trim() ?? ""))
    return { verified: true, explanation: "Official World Athletics record." };
  return {
    verified: false,
    explanation: "A verification check has not been recorded for this result.",
  };
}

const nonFinish =
  /\b(?:DNF|DNS|DQ|DSQ|NM|NH|DNC|DNQ|retired|withdrawn|withdrawal|disqualified|did not (?:finish|start))\b/i;

/** Row decoration only: it must not change PBs, rankings or achievement totals. */
export function hasFinishMark(mark: string, place = ""): boolean {
  if (nonFinish.test(mark) || /\+/.test(mark)) return false;
  const time = mark.trim().replace(/\s*\(SC\)$/i, "");
  if (/^(?:\d+:)*\d+(?:\.\d+)?(?:\((?:\d+:)*\d+(?:\.\d+)?\))?[aiwch]*$/i.test(time))
    return /[1-9]/.test(time);
  if (/^(?:finished|completed|fin)$/i.test(time)) return true;
  return (!time || /^NT$/i.test(time)) && /^[1-9]\d*(?:=|[AB])?$/.test(place);
}

function hasPastYear(date: string, today = new Date()): boolean {
  const years = date.match(/\b\d{4}\b/g)?.map(Number) ?? [];
  if (!years.length || Math.max(...years) > today.getUTCFullYear()) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return true;
  const parsed = new Date(`${date}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date &&
    date <= today.toISOString().slice(0, 10)
  );
}

export function hasRecordedFinish(result: ProfileResult): boolean {
  return (
    !result.details?.syntheticTest &&
    !result.details?.profileExcluded &&
    !isDisqualified(result) &&
    hasPastYear(result.eventDate) &&
    (["finished", "fin"].includes(result.status.trim().toLowerCase()) ||
      (!result.status && result.finishTimeSeconds != null && result.finishTimeSeconds > 0))
  );
}

export function hasHistoryFinish(row: SourcePerformance): boolean {
  return (
    !row.syntheticTest &&
    !row.profileExcluded &&
    !row.disqualification &&
    !row.labels.some((label) => /^(?:split|intermediate)(?:\b|:)/i.test(label)) &&
    hasPastYear(row.date || row.yearLabel || String(row.year)) &&
    hasFinishMark(row.performance, row.place)
  );
}

export function reportedResultYear(record: ReportedRaceRecord): string {
  return record.reportedDate.match(/\b\d{4}\b/)?.[0] ?? "Unknown";
}

export function reportedResultSport(record: ReportedRaceRecord): string {
  return /triathlon/i.test(record.distance)
    ? "Triathlon"
    : /duathlon/i.test(record.distance)
      ? "Duathlon"
      : "Running";
}

export function hasReportedFinish(record: ReportedRaceRecord): boolean {
  return (
    record.entryKind !== "grouped" &&
    hasPastYear(record.reportedDate) &&
    hasFinishMark(record.reportedTime)
  );
}

/** Sort only explicit dates; unresolved dates keep their original display text. */
export function reportedResultSortDate(record: ReportedRaceRecord): string {
  const value = record.reportedDate;
  const iso = value.match(/^(\d{4}-\d{2}-\d{2})(?:\b|$)/)?.[1];
  if (iso) return iso;
  const named = value.match(
    /^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})(?:$| \(reported\)$)/,
  );
  if (named) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${named[3]}-${String(months.indexOf(named[2]) + 1).padStart(2, "0")}-${named[1].padStart(2, "0")}`;
  }
  const year = reportedResultYear(record);
  return year === "Unknown" ? "" : year;
}
