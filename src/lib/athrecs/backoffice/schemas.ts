import { z } from "zod";

const shortText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalUrl = z.string().trim().url().max(2_000).optional();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const isoDateTime = z.string().datetime({ offset: true }).optional();

export const evidenceSchema = z.object({
  type: z.string().trim().min(1).max(80),
  url: z.string().trim().url().max(2_000).optional(),
  note: z.string().trim().max(2_000).optional(),
  reference: z.string().trim().max(250).optional(),
});

export const venueDraftSchema = z.object({
  name: shortText(200),
  addressLine1: optionalText(200),
  addressLine2: optionalText(200),
  city: optionalText(120),
  district: optionalText(120),
  countyOrState: optionalText(120),
  region: optionalText(120),
  postcode: optionalText(30),
  country: optionalText(120),
  countryCode: z.string().trim().length(2).toUpperCase().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: optionalText(80),
  indoor: z.boolean().optional(),
  accessibility: z.record(z.string(), z.unknown()).optional(),
  transport: z.record(z.string(), z.unknown()).optional(),
});

export const competitionRoundDraftSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: shortText(200),
  roundType: z.string().trim().min(1).max(80).default("round"),
  sequenceNo: z.number().int().positive().default(1),
  parentKey: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  status: z.string().trim().min(1).max(60).default("scheduled"),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const competitionDraftSchema = z.object({
  name: shortText(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  sportSlug: shortText(100),
  disciplineSlug: optionalText(100),
  competitionType: z.string().trim().min(1).max(80).default("competition"),
  format: z.string().trim().max(120).default(""),
  participantType: z.enum(["individual", "team", "pair", "relay", "mixed"]).default("individual"),
  resultType: z
    .enum([
      "time",
      "distance",
      "measurement",
      "score",
      "points",
      "placing",
      "win_loss",
      "judged",
      "multi_metric",
      "mixed",
    ])
    .default("placing"),
  scoringMethod: z.string().trim().max(200).default(""),
  distanceValue: z.number().nonnegative().optional(),
  distanceUnit: optionalText(40),
  distanceMetres: z.number().nonnegative().optional(),
  measurementUnit: optionalText(40),
  durationSeconds: z.number().int().nonnegative().optional(),
  surface: z.string().trim().max(100).default(""),
  courseVariant: z.string().trim().max(120).default(""),
  ageCategories: z.array(z.string().trim().min(1).max(80)).max(100).default([]),
  genderCategories: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  classificationRules: z.record(z.string(), z.unknown()).default({}),
  teamSizeMin: z.number().int().positive().optional(),
  teamSizeMax: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  startAt: isoDateTime,
  endAt: isoDateTime,
  status: z.string().trim().min(1).max(60).default("scheduled"),
  entryUrl: optionalUrl,
  entryFeeMinor: z.number().int().nonnegative().optional(),
  currency: z.string().trim().length(3).toUpperCase().default("GBP"),
  rulesUrl: optionalUrl,
  rounds: z.array(competitionRoundDraftSchema).max(2_000).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).superRefine((value, ctx) => {
  const roundKeys = new Set<string>();
  const parents = new Map<string, string | undefined>();
  value.rounds.forEach((round, index) => {
    if (roundKeys.has(round.key)) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds", index, "key"],
        message: `Duplicate round key: ${round.key}`,
      });
    }
    roundKeys.add(round.key);
    parents.set(round.key, round.parentKey);
  });
  value.rounds.forEach((round, index) => {
    if (round.parentKey && !roundKeys.has(round.parentKey)) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds", index, "parentKey"],
        message: `Unknown parent round key: ${round.parentKey}`,
      });
    }
    if (round.parentKey === round.key) {
      ctx.addIssue({
        code: "custom",
        path: ["rounds", index, "parentKey"],
        message: "A round cannot be its own parent",
      });
    }
  });
  for (const round of value.rounds) {
    const seen = new Set<string>([round.key]);
    let parent = parents.get(round.key);
    while (parent) {
      if (seen.has(parent)) {
        ctx.addIssue({
          code: "custom",
          message: `Round hierarchy contains a cycle involving ${round.key}`,
        });
        break;
      }
      seen.add(parent);
      parent = parents.get(parent);
    }
  }
});

export const editionDraftSchema = z.object({
  date: isoDate,
  distanceCode: z.string().trim().min(1).max(80).default("Event"),
  distanceKm: z.number().nonnegative().default(0),
  status: z.string().trim().min(1).max(60).default("TBC"),
  startAt: isoDateTime,
  endAt: isoDateTime,
  timezone: z.string().trim().min(1).max(80).default("Europe/London"),
  registrationOpenAt: isoDateTime,
  registrationCloseAt: isoDateTime,
  capacity: z.number().int().positive().optional(),
  entryFeeMinor: z.number().int().nonnegative().optional(),
  currency: z.string().trim().length(3).toUpperCase().default("GBP"),
  entryUrl: optionalUrl,
  sourceUrl: optionalUrl,
  venue: venueDraftSchema.optional(),
  competitions: z.array(competitionDraftSchema).max(500).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const eventDraftSchema = z.object({
  name: shortText(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  eventType: z.string().trim().min(1).max(80).default("race"),
  primarySportSlug: shortText(100),
  sportSlugs: z.array(shortText(100)).max(30).default([]),
  country: z.string().trim().max(120).default(""),
  county: z.string().trim().max(120).default(""),
  region: z.string().trim().max(120).default(""),
  city: z.string().trim().max(120).default(""),
  area: z.string().trim().max(160).default(""),
  surface: z.string().trim().max(100).default(""),
  participantType: z.enum(["individual", "team", "pair", "relay", "mixed"]).default("individual"),
  summary: z.string().trim().max(500).default(""),
  description: z.string().trim().max(20_000).default(""),
  organiserDisplayName: z.string().trim().max(200).default(""),
  website: optionalUrl,
  timezone: z.string().trim().min(1).max(80).default("Europe/London"),
  venue: venueDraftSchema.optional(),
  editions: z.array(editionDraftSchema).max(250).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});


export const organisationClaimSubmissionSchema = z
  .object({
    organisationId: z.number().int().positive().optional(),
    proposedName: optionalText(200),
    legalName: optionalText(250),
    organisationType: z.string().trim().min(1).max(80).default("event_organiser"),
    relationship: z.string().trim().min(1).max(80).default("owner"),
    registrationNumber: optionalText(120),
    country: z.string().trim().max(120).default(""),
    region: z.string().trim().max(120).default(""),
    city: z.string().trim().max(120).default(""),
    website: optionalUrl,
    publicEmail: z.string().trim().email().max(320).optional(),
    evidence: z.array(evidenceSchema).min(1).max(50),
    note: z.string().trim().max(5_000).default(""),
  })
  .superRefine((value, ctx) => {
    if (!value.organisationId && !value.proposedName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Choose an existing organisation or provide a proposed name",
      });
    }
  });

export const athleteClaimSubmissionSchema = z
  .object({
    athleteId: z.number().int().positive(),
    relationship: z.enum(["self", "parent", "guardian", "agent", "manager"]),
    sourceUrl: optionalUrl,
    permissions: z
      .object({
        editProfile: z.boolean().optional(),
        privateData: z.boolean().optional(),
      })
      .default({}),
    evidence: z.array(evidenceSchema).min(1).max(50),
    note: z.string().trim().max(5_000).default(""),
  })
  .superRefine((value, ctx) => {
    if (
      (value.relationship === "agent" || value.relationship === "manager") &&
      !value.permissions.editProfile
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["permissions", "editProfile"],
        message: "Agent and manager claims must explicitly request profile-management permission",
      });
    }
    if (value.permissions.privateData && !value.permissions.editProfile) {
      ctx.addIssue({
        code: "custom",
        path: ["permissions", "privateData"],
        message: "Private-data permission requires profile-management permission",
      });
    }
  });

export const eventCreateSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  sourceUrl: optionalUrl,
  evidence: z.array(evidenceSchema).max(50).default([]),
  note: z.string().trim().max(5_000).default(""),
  event: eventDraftSchema,
});

const eventPatchSchema = eventDraftSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "At least one event field must be supplied",
    });
  }
});

export const eventEditSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  sourceUrl: optionalUrl,
  evidence: z.array(evidenceSchema).max(50).default([]),
  reason: z.string().trim().min(3).max(5_000),
  patch: eventPatchSchema,
});

export const resultParticipantSchema = z
  .object({
    athleteId: z.number().int().positive().optional(),
    teamId: z.number().int().positive().optional(),
    name: z.string().trim().max(250).optional(),
    externalId: z.string().trim().max(250).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.athleteId && !value.teamId && !value.name?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Provide athleteId, teamId or participant name",
      });
    }
    if (value.athleteId && value.teamId) {
      ctx.addIssue({
        code: "custom",
        message: "A result participant cannot be both an athlete and a team",
      });
    }
  });

export const resultContributorSchema = z.object({
  athleteId: z.number().int().positive(),
  role: z.string().trim().min(1).max(80).default("participant"),
  participationStatus: z.string().trim().min(1).max(80).default("participated"),
  stats: z.record(z.string(), z.unknown()).default({}),
});

export const resultRowSchema = z
  .object({
    sourceRecordKey: z.string().trim().max(300).optional(),
    participant: resultParticipantSchema,
    contributors: z.array(resultContributorSchema).max(500).optional(),
    roundId: z.number().int().positive().optional(),
    bib: z.string().trim().max(80).optional(),
    laneOrPosition: z.string().trim().max(80).optional(),
    status: z.string().trim().min(1).max(80).default("finished"),
    rank: z.number().int().positive().optional(),
    tiedRank: z.boolean().default(false),
    qualificationStatus: z.string().trim().max(80).optional(),
    resultType: z
      .enum([
        "time",
        "distance",
        "measurement",
        "score",
        "points",
        "placing",
        "win_loss",
        "judged",
        "multi_metric",
        "mixed",
      ])
      .default("placing"),
    time: z.string().trim().max(80).optional(),
    timeMs: z.number().int().nonnegative().optional(),
    distanceValue: z.number().nonnegative().optional(),
    distanceUnit: z.string().trim().max(40).optional(),
    measurementValue: z.number().optional(),
    measurementUnit: z.string().trim().max(40).optional(),
    score: z.number().optional(),
    points: z.number().optional(),
    resultText: z.string().trim().max(500).optional(),
    outcome: z.string().trim().max(80).optional(),
    attempts: z.array(z.record(z.string(), z.unknown())).max(100).default([]),
    splits: z.array(z.record(z.string(), z.unknown())).max(5_000).default([]),
    stats: z.record(z.string(), z.unknown()).default({}),
  })
  .superRefine((value, ctx) => {
    const hasText = Boolean(value.resultText?.trim());
    const nonFinisher = new Set([
      "dns",
      "did_not_start",
      "dnf",
      "did_not_finish",
      "dsq",
      "disqualified",
      "withdrawn",
      "cancelled",
    ]).has(value.status.trim().toLowerCase());
    if (nonFinisher) return;

    if (value.resultType === "time" && value.timeMs == null && !value.time && !hasText) {
      ctx.addIssue({ code: "custom", message: "Timed results need timeMs, time or resultText" });
    }
    if (value.resultType === "distance" && value.distanceValue == null && !hasText) {
      ctx.addIssue({ code: "custom", message: "Distance results need distanceValue or resultText" });
    }
    if (value.resultType === "measurement" && value.measurementValue == null && !hasText) {
      ctx.addIssue({ code: "custom", message: "Measured results need measurementValue or resultText" });
    }
    if ((value.resultType === "score" || value.resultType === "judged") && value.score == null && !hasText) {
      ctx.addIssue({ code: "custom", message: "Scored results need score or resultText" });
    }
    if (value.resultType === "points" && value.points == null && !hasText) {
      ctx.addIssue({ code: "custom", message: "Points results need points or resultText" });
    }
    if (value.resultType === "win_loss" && !value.outcome && !hasText) {
      ctx.addIssue({ code: "custom", message: "Win/loss results need outcome or resultText" });
    }
    if (value.resultType === "placing" && value.rank == null && !hasText) {
      ctx.addIssue({ code: "custom", message: "Placing results need rank or resultText" });
    }
    if (
      (value.resultType === "multi_metric" || value.resultType === "mixed") &&
      value.timeMs == null &&
      !value.time &&
      value.distanceValue == null &&
      value.measurementValue == null &&
      value.score == null &&
      value.points == null &&
      !value.outcome &&
      !hasText &&
      value.attempts.length === 0 &&
      Object.keys(value.stats).length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Mixed results need at least one performance metric, attempt, stat or resultText",
      });
    }
  });

export const athleteResultClaimSubmissionSchema = z
  .object({
    athleteId: z.number().int().positive(),
    resultModel: z.enum(["legacy", "generic"]),
    resultId: z.string().trim().min(1).max(150),
    relationship: z.enum(["direct", "contributor"]).default("direct"),
    sourceUrl: optionalUrl,
    evidence: z.array(evidenceSchema).min(1).max(50),
    note: z.string().trim().max(5_000).default(""),
  })
  .superRefine((value, ctx) => {
    if (value.resultModel === "legacy" && value.relationship === "contributor") {
      ctx.addIssue({
        code: "custom",
        path: ["relationship"],
        message: "Legacy results support direct athlete claims only",
      });
    }
  });

export const athleteMissingResultSubmissionSchema = z
  .object({
    athleteId: z.number().int().positive(),
    competitionId: z.number().int().positive(),
    sourceUrl: optionalUrl,
    sourceType: z.string().trim().min(1).max(80).default("athlete_submission"),
    evidence: z.array(evidenceSchema).min(1).max(50),
    note: z.string().trim().max(5_000).default(""),
    result: resultRowSchema,
  })
  .superRefine((value, ctx) => {
    const direct = value.result.participant.athleteId === value.athleteId;
    const contribution = (value.result.contributors ?? []).some(
      (item) => item.athleteId === value.athleteId,
    );
    if (!direct && !contribution) {
      ctx.addIssue({
        code: "custom",
        path: ["result", "participant"],
        message: "The missing result must identify the managed athlete directly or as a contributor",
      });
    }
    if (
      value.result.participant.athleteId != null &&
      value.result.participant.athleteId !== value.athleteId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["result", "participant", "athleteId"],
        message: "An athlete submission cannot directly assign the result to another athlete",
      });
    }
    const otherContributors = (value.result.contributors ?? []).filter(
      (item) => item.athleteId !== value.athleteId,
    );
    if (otherContributors.length) {
      ctx.addIssue({
        code: "custom",
        path: ["result", "contributors"],
        message: "An athlete submission may only identify the managed athlete; organisers can add other contributors",
      });
    }
  });

export const resultsUploadSubmissionSchema = z
  .object({
    organisationId: z.number().int().positive(),
    competitionId: z.number().int().positive(),
    sourceUrl: optionalUrl,
    sourceType: z.string().trim().min(1).max(80).default("organiser_upload"),
    originalFilename: z.string().trim().max(255).optional(),
    contentType: z.string().trim().max(150).optional(),
    contentHash: z.string().trim().max(200).optional(),
    evidence: z.array(evidenceSchema).max(50).default([]),
    note: z.string().trim().max(5_000).default(""),
    rows: z.array(resultRowSchema).min(1).max(10_000),
  })
  .superRefine((value, ctx) => {
    if (!value.sourceUrl && !value.originalFilename && !value.contentHash && value.evidence.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Supply a source URL, uploaded filename, content hash or supporting evidence",
      });
    }
  });

export const athleteEditSubmissionSchema = z
  .object({
    athleteId: z.number().int().positive(),
    sourceUrl: optionalUrl,
    evidence: z.array(evidenceSchema).max(50).default([]),
    reason: z.string().trim().min(3).max(5_000),
    publicProfile: z
      .object({
        displayName: optionalText(200),
        givenName: optionalText(120),
        familyName: optionalText(120),
        gender: optionalText(40),
        city: optionalText(120),
        county: optionalText(120),
        country: optionalText(120),
        nation: optionalText(120),
        bio: optionalText(20_000),
        avatarUrl: optionalUrl,
      })
      .optional(),
    privateProfile: z
      .object({
        legalGivenName: optionalText(120),
        legalFamilyName: optionalText(120),
        preferredName: optionalText(120),
        dateOfBirth: isoDate.optional(),
        nationalityCodes: z.array(z.string().trim().min(2).max(3)).max(10).optional(),
        contactDetails: z.record(z.string(), z.unknown()).optional(),
        address: z.record(z.string(), z.unknown()).optional(),
        emergencyContact: z.record(z.string(), z.unknown()).optional(),
        raceEntryPassport: z.record(z.string(), z.unknown()).optional(),
        visibilitySettings: z.record(z.string(), z.unknown()).optional(),
      })
      .optional(),
    sports: z
      .array(
        z.object({
          sportSlug: shortText(100),
          disciplineSlug: optionalText(100),
          participationLevel: z.string().trim().min(1).max(80).default("recreational"),
          status: z.string().trim().min(1).max(60).default("active"),
          primarySport: z.boolean().default(false),
          preferences: z.record(z.string(), z.unknown()).default({}),
        }),
      )
      .max(100)
      .optional(),
    equipment: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(150).optional(),
          productId: z.number().int().positive().optional(),
          sportSlug: optionalText(100),
          category: shortText(120),
          brand: z.string().trim().max(160).default(""),
          model: z.string().trim().max(200).default(""),
          variant: optionalText(160),
          size: optionalText(80),
          acquisitionType: z.string().trim().min(1).max(80).default("purchased"),
          purchaseDate: isoDate.optional(),
          retailer: optionalText(200),
          priceMinor: z.number().int().nonnegative().optional(),
          currency: z.string().trim().length(3).toUpperCase().default("GBP"),
          usageTotal: z.number().nonnegative().optional(),
          usageUnit: optionalText(60),
          status: z.string().trim().min(1).max(60).default("active"),
          visibility: z.string().trim().min(1).max(60).default("private"),
          sponsoredDisclosure: z.boolean().default(false),
          rating: z.number().min(0).max(5).optional(),
          notes: optionalText(5_000),
          metadata: z.record(z.string(), z.unknown()).default({}),
        }),
      )
      .max(500)
      .optional(),
    productPreferences: z
      .array(
        z.object({
          sportSlug: shortText(100),
          category: shortText(120),
          preferenceData: z.record(z.string(), z.unknown()).default({}),
          marketingUseAllowed: z.boolean().default(false),
        }),
      )
      .max(250)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (
      !value.publicProfile &&
      !value.privateProfile &&
      !value.sports?.length &&
      !value.equipment?.length &&
      !value.productPreferences?.length
    ) {
      ctx.addIssue({ code: "custom", message: "No athlete changes were supplied" });
    }
  });

export const reviewSubmissionSchema = z.object({
  submissionId: shortText(120),
  decision: z.enum(["approved", "partially_approved", "rejected", "needs_information"]),
  note: z.string().trim().max(10_000).default(""),
  approvedItemIds: z.array(shortText(120)).max(10_000).optional(),
});

export type Evidence = z.infer<typeof evidenceSchema>;
export type OrganisationClaimSubmission = z.infer<typeof organisationClaimSubmissionSchema>;
export type AthleteClaimSubmission = z.infer<typeof athleteClaimSubmissionSchema>;
export type EventCreateSubmission = z.infer<typeof eventCreateSubmissionSchema>;
export type EventEditSubmission = z.infer<typeof eventEditSubmissionSchema>;
export type ResultsUploadSubmission = z.infer<typeof resultsUploadSubmissionSchema>;
export type ResultRowInput = z.infer<typeof resultRowSchema>;
export type AthleteResultClaimSubmission = z.infer<typeof athleteResultClaimSubmissionSchema>;
export type AthleteMissingResultSubmission = z.infer<typeof athleteMissingResultSubmissionSchema>;
export type AthleteEditSubmission = z.infer<typeof athleteEditSubmissionSchema>;
export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
