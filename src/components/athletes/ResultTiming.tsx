import { formatDuration } from "@/lib/athrecs/format";
import {
  isParkrunResult,
  PARKRUN_TIMING_LABEL,
  type ParkrunContext,
} from "@/lib/athrecs/parkrun-timing";
import type { ProfileResult } from "@/lib/athrecs/profile-records";
import { timingBasis } from "@/lib/athrecs/profile-records";
import {
  hasMinutePrecisionTime,
  hasTimedMark,
  historicalTimingLines,
  type PerformanceTiming,
} from "@/lib/athrecs/performance-timing";

export function ResultTiming({ result }: { result: ProfileResult }) {
  if (
    result.finishTimeSeconds == null ||
    !Number.isFinite(result.finishTimeSeconds) ||
    result.finishTimeSeconds < 0
  )
    return null;
  if (isParkrunResult(result)) return <TimingLines lines={[PARKRUN_TIMING_LABEL]} />;
  const basis = timingBasis(result);
  const lines = [basis === "Unknown" ? "Timing unknown" : `${basis} time`];
  if (result.chipTimeSeconds != null && basis !== "Chip" && basis !== "Chip / gun")
    lines.push(`Chip ${formatDuration(result.chipTimeSeconds)}`);
  if (result.gunTimeSeconds != null && basis !== "Gun" && basis !== "Chip / gun")
    lines.push(`Gun ${formatDuration(result.gunTimeSeconds)}`);
  return <TimingLines lines={lines} />;
}

export function HistoricalTiming({
  performance,
  discipline,
  timing,
  sport,
  eventName,
}: {
  performance: string;
  discipline?: string;
  timing?: PerformanceTiming;
} & Pick<ParkrunContext, "sport" | "eventName">) {
  return hasTimedMark(performance, discipline) || hasMinutePrecisionTime(performance) ? (
    <TimingLines
      lines={
        isParkrunResult({ sport, eventName, distanceCode: discipline })
          ? [PARKRUN_TIMING_LABEL]
          : historicalTimingLines(performance, timing)
      }
    />
  ) : null;
}

function TimingLines({ lines }: { lines: string[] }) {
  return (
    <span data-result-timing className="block whitespace-normal text-xs font-normal text-subtle">
      {lines.join(" · ")}
    </span>
  );
}
