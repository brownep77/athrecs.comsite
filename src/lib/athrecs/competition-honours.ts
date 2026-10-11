import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import { buildProfileTimeline, profileDisciplineLabel } from "./profile-timeline.ts";
import {
  resultVerification,
  hasRecordedFinish,
  hasHistoryFinish,
} from "./profile-result-presentation.ts";
import {
  recordedAwards,
  historyAwards,
  recordedCompetition,
  historyCompetition,
  COMPETITION_TIERS,
  type PerformanceAward,
  type CompetitionTier,
  type CompetitionContext,
} from "./competition-awards.ts";
import type { ProfileAwardKind } from "./profile-awards";

export type CompetitionHonour = {
  id: string;
  tier: CompetitionTier;
  kind: ProfileAwardKind;
  title: string;
  scope: string;
  evidence: {
    key: string;
    event: string;
    date: string;
    discipline: string;
    sources: { url: string; provider: string }[];
  }[];
};

/** One collection from the already-deduplicated profile; unsupported rows cannot earn titles. */
export function buildCompetitionHonours(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[],
  sourceGender = "",
): CompetitionHonour[] {
  const timeline = buildProfileTimeline(results, histories);
  const groups = new Map<string, CompetitionHonour>();
  type Candidate = {
    context: CompetitionContext;
    awards: PerformanceAward[];
    started: boolean;
    evidence: CompetitionHonour["evidence"][number];
    mark: string;
  };
  const candidates: Candidate[] = [];
  const add = (
    context: CompetitionContext,
    awards: PerformanceAward[],
    started: boolean,
    evidence: CompetitionHonour["evidence"][number],
  ) => {
    const level = COMPETITION_TIERS[context.tier].label;
    const addToGroup = (
      id: string,
      title: string,
      kind: ProfileAwardKind,
      scope: string,
      key = evidence.key,
    ) => {
      const group = groups.get(id) ?? { id, title, kind, tier: context.tier, scope, evidence: [] };
      if (!group.evidence.some((row) => row.key === key)) group.evidence.push({ ...evidence, key });
      groups.set(id, group);
    };
    if (
      started &&
      /^\d{4}(?:-|$)/.test(evidence.date) &&
      ["olympic", "paralympic", "world"].includes(context.tier)
    ) {
      const edition = `${context.tier}:${evidence.date.slice(0, 4)}:${
        context.tier === "world"
          ? evidence.event
              .split(",")[0]
              .replace(/^\d+(?:st|nd|rd|th)?\s+/i, "")
              .toLowerCase()
          : ""
      }`;
      addToGroup(
        `${context.tier}:appearances:${context.division}`,
        `${level} appearances`,
        "participation",
        context.division || "Championship participation",
        edition,
      );
    }
    for (const award of awards) {
      if (!award.podium || context.tier === "community") continue;
      const titleEvent =
        context.tier === "race" ? "Race" : context.tier === "major" ? "Major marathon" : level;
      const kind =
        award.kind === "gold" && !["olympic", "paralympic", "world"].includes(context.tier)
          ? "trophy"
          : award.kind;
      const classification =
        award.scope === "category"
          ? `Category · ${award.category}`
          : award.scope === "gender"
            ? award.label.split(" · ").at(-1)!
            : "Overall";
      const scope = context.division ? `${context.division} · ${classification}` : classification;
      const outcome =
        award.kind === "gold"
          ? kind === "trophy"
            ? "wins"
            : "gold medals"
          : award.kind === "silver"
            ? "silver medals"
            : "bronze medals";
      addToGroup(
        `${context.tier}:${award.kind}:${award.scope}:${scope}`,
        `${titleEvent} ${outcome}`,
        kind,
        scope,
      );
    }
  };
  for (const result of timeline.results) {
    if (
      !resultVerification(
        result.details?.verificationStatus,
        result.resultSource,
        result.conflicting,
      ).verified
    )
      continue;
    const started =
      hasRecordedFinish(result) ||
      (/^dnf$/i.test(result.status) && hasRecordedFinish({ ...result, status: "finished" }));
    candidates.push({
      context: recordedCompetition(result),
      awards: recordedAwards(result),
      started,
      mark: String(result.finishTimeSeconds ?? result.status),
      evidence: {
        key: `result:${result.resultId}`,
        event: result.eventName,
        date: result.eventDate,
        discipline: result.distanceCode,
        sources: result.sourceUrls.map((url) => ({
          url,
          provider: result.resultSource || "Source",
        })),
      },
    });
  }
  for (const { key, performance: row } of timeline.history) {
    if (
      !resultVerification(row.verificationStatus, row.providerName).verified ||
      /conflicting (?:source|details|result)|disputed placing/i.test(row.notes ?? "")
    )
      continue;
    const started =
      hasHistoryFinish(row) ||
      (/^dnf$/i.test(row.performance) && hasHistoryFinish({ ...row, performance: "FIN" }));
    const numericTime = /^\d+(?::\d{2}){1,2}(?:\.\d+)?$/.test(row.performance)
      ? row.performance.split(":").reduce((sum, part) => sum * 60 + Number(part), 0)
      : null;
    candidates.push({
      context: historyCompetition(row),
      awards: historyAwards(row, sourceGender),
      started,
      mark: String(numericTime ?? row.performance),
      evidence: {
        key,
        event: row.meeting,
        date: row.date || row.yearLabel || String(row.year),
        discipline: row.discipline,
        sources: row.sourceUrls.map((url) => ({ url, provider: row.providerName || "Source" })),
      },
    });
  }
  // Do not turn duplicate or contradictory copies of one performance into extra honours.
  const indexed = new Map<string, Set<Candidate>>();
  const aliases = (candidate: Candidate) => {
    const { evidence, context } = candidate;
    const prefix = `${evidence.date}|${profileDisciplineLabel(evidence.discipline).toLowerCase()}|${context.round}|`;
    return [
      `${prefix}name:${evidence.event.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      ...evidence.sources.slice(0, 1).map(({ url }) => `${prefix}source:${url}`),
    ];
  };
  for (const candidate of candidates) {
    const group = new Set([candidate]);
    for (const alias of aliases(candidate))
      for (const other of indexed.get(alias) ?? []) group.add(other);
    for (const other of group) for (const alias of aliases(other)) indexed.set(alias, group);
  }
  for (const group of new Set(indexed.values())) {
    const copies = [...group];
    const signatures = new Set(
      copies.map((row) =>
        JSON.stringify([
          row.mark,
          row.awards.map((award) => [award.kind, award.scope, award.category]),
        ]),
      ),
    );
    if (signatures.size !== 1) continue;
    const row = copies[0];
    add(row.context, row.awards, row.started, {
      ...row.evidence,
      sources: [
        ...new Map(
          copies.flatMap((copy) => copy.evidence.sources).map((source) => [source.url, source]),
        ).values(),
      ],
    });
  }
  return [...groups.values()].sort(
    (a, b) =>
      COMPETITION_TIERS[a.tier].rank - COMPETITION_TIERS[b.tier].rank ||
      ["gold", "trophy", "silver", "bronze", "participation"].indexOf(a.kind) -
        ["gold", "trophy", "silver", "bronze", "participation"].indexOf(b.kind) ||
      a.scope.localeCompare(b.scope),
  );
}
