import { formatDuration } from "@/lib/athrecs/format";
import type { ClaimableResult } from "@/lib/athrecs/result-claims-api";
import { isParkrunResult, PARKRUN_TIMING_LABEL } from "@/lib/athrecs/parkrun-timing";

export function ClaimResultDetails({ result }: { result: ClaimableResult }) {
  const parkrun = isParkrunResult(result);
  const details = [
    result.clubName ? `Recorded club: ${result.clubName}` : null,
    result.ageAtRace ? `Age at race: ${result.ageAtRace}` : null,
    parkrun ? PARKRUN_TIMING_LABEL : null,
    !parkrun && result.chipTimeSeconds != null
      ? `Chip time: ${formatDuration(result.chipTimeSeconds)}`
      : null,
    !parkrun && result.gunTimeSeconds != null
      ? `Gun time: ${formatDuration(result.gunTimeSeconds)}`
      : null,
    result.genderPlace != null ? `Gender place: ${result.genderPlace}` : null,
    result.categoryPlace != null ? `Category place: ${result.categoryPlace}` : null,
  ].filter(Boolean);
  if (!details.length) return null;
  return <p className="mt-3 text-sm text-muted">{details.join(" · ")}</p>;
}
