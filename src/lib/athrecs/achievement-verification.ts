import type { AchievementResult } from "./profile-history-results";
import { resultVerification } from "./profile-result-presentation.ts";

/** Verification decorates an achievement; it never decides whether it was achieved. */
export function achievementResultVerified(result: AchievementResult): boolean {
  const row = result.history?.performance;
  return resultVerification(
    row?.verificationStatus ?? result.details?.verificationStatus,
    row?.providerName ?? result.resultSource,
    result.conflicting,
  ).verified;
}

export function achievementEvidenceVerified(results: readonly AchievementResult[]): boolean {
  return results.length > 0 && results.every(achievementResultVerified);
}
