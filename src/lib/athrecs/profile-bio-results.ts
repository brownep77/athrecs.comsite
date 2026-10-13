import { combineProfileResults, type ProfileResult } from "./profile-records.ts";
import { buildProfileAchievements, isCompletedResult } from "./profile-achievements.ts";
import { buildCompetitionHonours } from "./competition-honours.ts";
import { profileAchievementResults } from "./profile-history-results.ts";
import type { SourceHistory } from "./source-performance-history";
import { resultVerification } from "./profile-result-presentation.ts";

/** Match the profile's exclusions and deduplication before deriving any biography facts. */
export function visibleBioResults(results: ProfileResult[], hiddenIds: number[]): ProfileResult[] {
  const hidden = new Set(hiddenIds);
  return combineProfileResults(results).filter(
    (result) => !result.sourceResultIds.some((id) => hidden.has(id)) && isCompletedResult(result),
  );
}

export function bioAchievements(
  results: ProfileResult[],
  histories: SourceHistory[] = [],
): string[] {
  const verified = results.filter(
    (result) =>
      resultVerification(
        result.details?.verificationStatus,
        result.resultSource,
        result.conflicting,
      ).verified,
  );
  return [
    ...buildCompetitionHonours(verified, histories).map(
      (honour) =>
        `${honour.title.toLowerCase()} (${honour.scope.toLowerCase()}) at ${honour.evidence.length} ${honour.evidence.length === 1 ? "event" : "events"}`,
    ),
    ...buildProfileAchievements(profileAchievementResults(verified, histories)).milestones.map(
      (milestone) => milestone.title.toLowerCase(),
    ),
  ];
}
