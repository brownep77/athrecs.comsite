import type {
  EventCreateSubmission,
  EventEditSubmission,
  ResultRowInput,
} from "./schemas";

export type ItemStatus = "validated" | "warning" | "rejected";
export type CheckStatus = "pass" | "warning" | "fail";
export type CheckSeverity = "info" | "low" | "medium" | "high" | "critical";

export type SubmissionItemDraft = {
  id: string;
  rowNumber: number;
  entityType: string;
  entityKey: string | null;
  proposedAction: "create" | "update" | "upsert";
  targetTable: string | null;
  targetId: string | null;
  rawData: unknown;
  currentData: unknown | null;
  normalizedData: Record<string, unknown> | null;
  status: ItemStatus;
  errors: string[];
  warnings: string[];
};

export type AutomatedCheckDraft = {
  id: string;
  itemId?: string;
  checkType: string;
  status: CheckStatus;
  severity: CheckSeverity;
  score?: number;
  message: string;
  evidence?: Record<string, unknown>;
};

export type ResultsVerificationSummary = {
  items: SubmissionItemDraft[];
  checks: AutomatedCheckDraft[];
  acceptedCount: number;
  warningCount: number;
  rejectedCount: number;
  automatedScore: number;
};

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function timeStringToMs(input: string | undefined): number | null {
  if (!input?.trim()) return null;
  const clean = input.trim().replace(",", ".");
  if (/^\d+(?:\.\d+)?$/.test(clean)) {
    const seconds = Number(clean);
    return Number.isFinite(seconds) ? Math.round(seconds * 1_000) : null;
  }
  const parts = clean.split(":");
  if (parts.length < 2 || parts.length > 3) return null;
  const numbers = parts.map(Number);
  if (numbers.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (numbers.at(-1)! >= 60) return null;
  if (parts.length === 3 && numbers[1] >= 60) return null;
  const seconds =
    parts.length === 3
      ? numbers[0] * 3_600 + numbers[1] * 60 + numbers[2]
      : numbers[0] * 60 + numbers[1];
  return Math.round(seconds * 1_000);
}

function participantKey(row: ResultRowInput): string {
  if (row.participant.athleteId) return `athlete:${row.participant.athleteId}`;
  if (row.participant.teamId) return `team:${row.participant.teamId}`;
  if (row.participant.externalId) return `external:${row.participant.externalId}`;
  return `name:${row.participant.name?.trim().toLowerCase() ?? "unknown"}`;
}

export function verifyResultsRows(input: {
  rows: ResultRowInput[];
  competitionResultType: string;
  competitionParticipantType?: string;
  existingSourceKeys: ReadonlySet<string>;
  knownAthleteIds?: ReadonlySet<number>;
  knownTeamIds?: ReadonlySet<number>;
  knownRoundIds?: ReadonlySet<number>;
}): ResultsVerificationSummary {
  const seenSourceKeys = new Set<string>();
  const seenRanks = new Map<number, number>();
  const seenParticipants = new Set<string>();
  const items: SubmissionItemDraft[] = [];

  input.rows.forEach((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const itemId = makeId("item");
    const sourceKey = row.sourceRecordKey?.trim() || null;
    const timeMs = row.timeMs ?? timeStringToMs(row.time);

    if (row.time && timeMs == null) errors.push(`Unrecognised time value: ${row.time}`);
    const participantType = input.competitionParticipantType?.trim().toLowerCase();
    if (participantType === "individual" && row.participant.teamId) {
      errors.push("An individual competition result cannot use a team participant");
    }
    if (
      participantType &&
      ["team", "pair", "relay"].includes(participantType) &&
      row.participant.athleteId
    ) {
      errors.push(
        `A ${participantType} competition result must use a team/pair/relay participant, with athletes added as contributors`,
      );
    }
    if (
      participantType === "relay" &&
      !row.participant.athleteId &&
      (row.contributors ?? []).length === 0
    ) {
      warnings.push("Relay result has no athlete contributors to verify the relay members");
    }
    if (
      row.participant.athleteId &&
      input.knownAthleteIds &&
      !input.knownAthleteIds.has(row.participant.athleteId)
    ) {
      errors.push(`Unknown athleteId ${row.participant.athleteId}`);
    }
    if (
      row.participant.teamId &&
      input.knownTeamIds &&
      !input.knownTeamIds.has(row.participant.teamId)
    ) {
      errors.push(`Unknown teamId ${row.participant.teamId}`);
    }
    const contributorIds = new Set<number>();
    for (const contributor of row.contributors ?? []) {
      if (contributorIds.has(contributor.athleteId)) {
        errors.push(`Duplicate contributor athleteId ${contributor.athleteId}`);
      }
      contributorIds.add(contributor.athleteId);
      if (
        input.knownAthleteIds &&
        !input.knownAthleteIds.has(contributor.athleteId)
      ) {
        errors.push(`Unknown contributor athleteId ${contributor.athleteId}`);
      }
      if (contributor.athleteId === row.participant.athleteId) {
        warnings.push(
          `athleteId ${contributor.athleteId} is both the direct participant and a contributor`,
        );
      }
    }
    if (row.roundId && input.knownRoundIds && !input.knownRoundIds.has(row.roundId)) {
      errors.push(`roundId ${row.roundId} does not belong to this competition`);
    }
    if (!row.participant.athleteId && !row.participant.teamId) {
      warnings.push("Participant is name-only and must be identity-matched by Athrecs");
    }
    const rowParticipantKey = `${row.roundId ?? 0}|${participantKey(row)}`;
    if (seenParticipants.has(rowParticipantKey)) {
      warnings.push("The same participant appears more than once in this round");
    }
    seenParticipants.add(rowParticipantKey);
    if (!sourceKey) {
      warnings.push("No stable sourceRecordKey was supplied; duplicate matching is less reliable");
    } else {
      if (seenSourceKeys.has(sourceKey)) errors.push("Duplicate sourceRecordKey within this upload");
      if (input.existingSourceKeys.has(sourceKey)) {
        warnings.push("This sourceRecordKey already exists and will be treated as a correction");
      }
      seenSourceKeys.add(sourceKey);
    }
    if (row.resultType !== input.competitionResultType) {
      warnings.push(
        `Row result type ${row.resultType} differs from competition type ${input.competitionResultType}`,
      );
    }
    if (row.rank != null) {
      const rankCount = seenRanks.get(row.rank) ?? 0;
      seenRanks.set(row.rank, rankCount + 1);
      if (rankCount > 0 && !row.tiedRank) {
        warnings.push(`Rank ${row.rank} is repeated without tiedRank=true`);
      }
    }

    const normalizedData: Record<string, unknown> = {
      competitionResultType: input.competitionResultType,
      sourceRecordKey: sourceKey,
      participant: {
        athleteId: row.participant.athleteId ?? null,
        teamId: row.participant.teamId ?? null,
        name: row.participant.name?.trim() ?? "",
        externalId: row.participant.externalId?.trim() ?? null,
      },
      ...(row.contributors !== undefined
        ? {
            contributors: row.contributors.map((contributor) => ({
              athleteId: contributor.athleteId,
              role: contributor.role,
              participationStatus: contributor.participationStatus,
              stats: contributor.stats,
            })),
          }
        : {}),
      roundId: row.roundId ?? null,
      bib: row.bib?.trim() ?? null,
      laneOrPosition: row.laneOrPosition?.trim() ?? null,
      status: row.status,
      rank: row.rank ?? null,
      tiedRank: row.tiedRank,
      qualificationStatus: row.qualificationStatus?.trim() ?? null,
      resultType: row.resultType,
      timeMs,
      distanceValue: row.distanceValue ?? null,
      distanceUnit: row.distanceUnit?.trim() ?? null,
      measurementValue: row.measurementValue ?? null,
      measurementUnit: row.measurementUnit?.trim() ?? null,
      score: row.score ?? null,
      points: row.points ?? null,
      resultText: row.resultText?.trim() ?? null,
      outcome: row.outcome?.trim() ?? null,
      attempts: row.attempts,
      splits: row.splits,
      stats: row.stats,
    };

    items.push({
      id: itemId,
      rowNumber: index + 1,
      entityType: "competition_result",
      entityKey: sourceKey ?? participantKey(row),
      proposedAction:
        sourceKey && input.existingSourceKeys.has(sourceKey) ? "update" : "upsert",
      targetTable: "competition_results",
      targetId: null,
      rawData: row,
      currentData: null,
      normalizedData,
      status: errors.length ? "rejected" : warnings.length ? "warning" : "validated",
      errors,
      warnings,
    });
  });

  const rejectedCount = items.filter((item) => item.status === "rejected").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const acceptedCount = items.length - rejectedCount;
  const penalty = rejectedCount * 8 + warningCount * 2;
  const automatedScore = Math.max(0, Math.round((100 - penalty / Math.max(items.length, 1)) * 100) / 100);

  const checks: AutomatedCheckDraft[] = [
    {
      id: makeId("check"),
      checkType: "schema_validation",
      status: rejectedCount ? "fail" : "pass",
      severity: rejectedCount ? "high" : "info",
      score: items.length ? ((items.length - rejectedCount) / items.length) * 100 : 0,
      message: rejectedCount
        ? `${rejectedCount} row(s) failed structural or metric validation`
        : `All ${items.length} row(s) passed structural validation`,
      evidence: { rowCount: items.length, rejectedCount },
    },
    {
      id: makeId("check"),
      checkType: "participant_identity",
      status: warningCount ? "warning" : "pass",
      severity: warningCount ? "medium" : "info",
      message: warningCount
        ? `${warningCount} row(s) need identity, duplicate or consistency review`
        : "All rows have strong participant and result identifiers",
      evidence: { warningCount },
    },
    {
      id: makeId("check"),
      checkType: "duplicate_detection",
      status: rejectedCount ? "warning" : "pass",
      severity: rejectedCount ? "medium" : "info",
      message: "Source keys and repeated ranks were checked against the upload and existing results",
      evidence: {
        sourceKeysInUpload: seenSourceKeys.size,
        repeatedRanks: [...seenRanks.entries()].filter(([, count]) => count > 1).map(([rank]) => rank),
        uniqueParticipants: seenParticipants.size,
      },
    },
  ];

  return {
    items,
    checks,
    acceptedCount,
    warningCount,
    rejectedCount,
    automatedScore,
  };
}

export function verifyEventCreate(input: {
  submission: EventCreateSubmission;
  knownSportSlugs: ReadonlySet<string>;
  knownDisciplineKeys: ReadonlySet<string>;
  possibleDuplicateCount: number;
}): AutomatedCheckDraft[] {
  const requestedSports = new Set(
    [
      input.submission.event.primarySportSlug,
      ...input.submission.event.sportSlugs,
      ...input.submission.event.editions.flatMap((edition) =>
        edition.competitions.map((competition) => competition.sportSlug),
      ),
    ].map(slugify),
  );
  const unknownSports = [...requestedSports].filter(
    (slug) => !input.knownSportSlugs.has(slug),
  );
  const unknownDisciplines = input.submission.event.editions
    .flatMap((edition) => edition.competitions)
    .filter((competition) => competition.disciplineSlug)
    .map(
      (competition) =>
        `${slugify(competition.sportSlug)}:${slugify(competition.disciplineSlug ?? "")}`,
    )
    .filter((key) => !input.knownDisciplineKeys.has(key));
  const hasEvidence = Boolean(
    input.submission.sourceUrl || input.submission.evidence.some((item) => item.url || item.reference),
  );

  return [
    {
      id: makeId("check"),
      checkType: "schema_validation",
      status: "pass",
      severity: "info",
      score: 100,
      message: "Event structure passed Athrecs schema validation",
    },
    {
      id: makeId("check"),
      checkType: "sport_taxonomy",
      status: unknownSports.length ? "fail" : "pass",
      severity: unknownSports.length ? "high" : "info",
      score: unknownSports.length ? 0 : 100,
      message: unknownSports.length
        ? `Unknown sport taxonomy must be added or mapped before approval: ${unknownSports.join(", ")}`
        : "All sports match the Athrecs taxonomy",
      evidence: { unknownSports },
    },
    {
      id: makeId("check"),
      checkType: "discipline_taxonomy",
      status: unknownDisciplines.length ? "fail" : "pass",
      severity: unknownDisciplines.length ? "high" : "info",
      score: unknownDisciplines.length ? 0 : 100,
      message: unknownDisciplines.length
        ? `Unknown sport/discipline combinations must be added or mapped before approval: ${unknownDisciplines.join(", ")}`
        : "All disciplines match the Athrecs taxonomy",
      evidence: { unknownDisciplines },
    },
    {
      id: makeId("check"),
      checkType: "source_evidence",
      status: hasEvidence ? "pass" : "warning",
      severity: hasEvidence ? "info" : "medium",
      score: hasEvidence ? 100 : 50,
      message: hasEvidence
        ? "A source or supporting evidence was supplied"
        : "No independent source URL or reference was supplied",
    },
    {
      id: makeId("check"),
      checkType: "duplicate_event",
      status: input.possibleDuplicateCount ? "warning" : "pass",
      severity: input.possibleDuplicateCount ? "high" : "info",
      score: input.possibleDuplicateCount ? 40 : 100,
      message: input.possibleDuplicateCount
        ? `${input.possibleDuplicateCount} possible matching event(s) require review`
        : "No close event-name/location match was found",
      evidence: { possibleDuplicateCount: input.possibleDuplicateCount },
    },
  ];
}

export function verifyEventEdit(input: {
  submission: EventEditSubmission;
  currentEvent: Record<string, unknown>;
  knownSportSlugs: ReadonlySet<string>;
  knownDisciplineKeys: ReadonlySet<string>;
  conflictingSlugCount: number;
}): AutomatedCheckDraft[] {
  const changedFields = Object.keys(input.submission.patch);
  const hasEvidence = Boolean(
    input.submission.sourceUrl || input.submission.evidence.some((item) => item.url || item.reference),
  );
  const requestedSports = new Set(
    [
      input.submission.patch.primarySportSlug,
      ...(input.submission.patch.sportSlugs ?? []),
      ...(input.submission.patch.editions ?? []).flatMap((edition) =>
        edition.competitions.map((competition) => competition.sportSlug),
      ),
    ]
      .filter((value): value is string => Boolean(value))
      .map(slugify),
  );
  const unknownSports = [...requestedSports].filter(
    (slug) => !input.knownSportSlugs.has(slug),
  );
  const unknownDisciplines = (input.submission.patch.editions ?? [])
    .flatMap((edition) => edition.competitions)
    .filter((competition) => competition.disciplineSlug)
    .map(
      (competition) =>
        `${slugify(competition.sportSlug)}:${slugify(competition.disciplineSlug ?? "")}`,
    )
    .filter((key) => !input.knownDisciplineKeys.has(key));
  return [
    {
      id: makeId("check"),
      checkType: "schema_validation",
      status: "pass",
      severity: "info",
      score: 100,
      message: `${changedFields.length} event field group(s) passed schema validation`,
      evidence: { changedFields },
    },
    {
      id: makeId("check"),
      checkType: "sport_taxonomy",
      status: unknownSports.length ? "fail" : "pass",
      severity: unknownSports.length ? "high" : "info",
      score: unknownSports.length ? 0 : 100,
      message: unknownSports.length
        ? `Unknown sport taxonomy must be added or mapped before approval: ${unknownSports.join(", ")}`
        : "All changed sports match the Athrecs taxonomy",
      evidence: { unknownSports },
    },
    {
      id: makeId("check"),
      checkType: "discipline_taxonomy",
      status: unknownDisciplines.length ? "fail" : "pass",
      severity: unknownDisciplines.length ? "high" : "info",
      score: unknownDisciplines.length ? 0 : 100,
      message: unknownDisciplines.length
        ? `Unknown sport/discipline combinations must be added or mapped before approval: ${unknownDisciplines.join(", ")}`
        : "All changed disciplines match the Athrecs taxonomy",
      evidence: { unknownDisciplines },
    },
    {
      id: makeId("check"),
      checkType: "event_slug_conflict",
      status: input.conflictingSlugCount ? "fail" : "pass",
      severity: input.conflictingSlugCount ? "high" : "info",
      score: input.conflictingSlugCount ? 0 : 100,
      message: input.conflictingSlugCount
        ? "The proposed event slug belongs to another event"
        : "The proposed event slug does not conflict with another event",
      evidence: { conflictingSlugCount: input.conflictingSlugCount },
    },
    {
      id: makeId("check"),
      checkType: "source_evidence",
      status: hasEvidence ? "pass" : "warning",
      severity: hasEvidence ? "info" : "medium",
      score: hasEvidence ? 100 : 60,
      message: hasEvidence
        ? "Supporting source or evidence supplied"
        : "Edit has a reason but no independent source evidence",
    },
    {
      id: makeId("check"),
      checkType: "current_record_snapshot",
      status: "pass",
      severity: "info",
      score: 100,
      message: "The current event record was captured for reviewer comparison and audit",
      evidence: { currentEventId: input.currentEvent.id },
    },
  ];
}
