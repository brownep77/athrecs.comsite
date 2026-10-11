import { formatDuration } from "@/lib/athrecs/format";
import type { ClaimableResult } from "@/lib/athrecs/result-claims-api";

export function ClaimResultDetails({ result }: { result: ClaimableResult }) {
  const details = [
    result.clubName ? `Recorded club: ${result.clubName}` : null,
    result.ageAtRace ? `Age at race: ${result.ageAtRace}` : null,
    result.chipTimeSeconds != null ? `Chip time: ${formatDuration(result.chipTimeSeconds)}` : null,
    result.gunTimeSeconds != null ? `Gun time: ${formatDuration(result.gunTimeSeconds)}` : null,
    result.genderPlace != null ? `Gender place: ${result.genderPlace}` : null,
    result.categoryPlace != null ? `Category place: ${result.categoryPlace}` : null,
  ].filter(Boolean);
  if (!details.length) return null;
  return <p className="mt-3 text-sm text-muted">{details.join(" · ")}</p>;
}
