import { formatAthleteId } from "../athrecs/athlete-id.ts";
import { normal, type Candidate, type Match } from "./core.ts";

export type ApprovalProfile = Pick<Match, "id" | "slug" | "number" | "visibility">;

export function candidateProfileId(candidate: Candidate): number | null {
  if (candidate.athlete_id) return candidate.athlete_id;
  if (candidate.decision) {
    return candidate.decision.action === "link" ? (candidate.decision.athleteId ?? null) : null;
  }
  const match = candidate.matches.length === 1 ? candidate.matches[0] : undefined;
  return match && normal(match.name) === normal(candidate.data.name) ? match.id : null;
}

export function approvalProfileHref(profile: ApprovalProfile): string {
  if (profile.visibility === "public" && profile.slug) {
    return `https://www.athrecs.com/athletes/${encodeURIComponent(profile.slug)}`;
  }
  if (profile.number && /^[1-9]\d*$/.test(profile.number)) {
    return `/admin/athletes/${formatAthleteId(profile.number)}`;
  }
  return `/admin/athlete-workspace?athleteId=${profile.id}`;
}
