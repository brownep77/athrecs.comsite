import { z } from "zod";

export const organisationRoles = [
  "owner",
  "admin",
  "editor",
  "results_uploader",
  "finance",
  "viewer",
] as const;
export type OrganisationRole = (typeof organisationRoles)[number];

export const platformRoles = [
  "super_admin",
  "admin",
  "reviewer",
  "data_steward",
  "support",
  "read_only",
] as const;
export type PlatformRole = (typeof platformRoles)[number];

export const participantKinds = [
  "individual",
  "team",
  "pair",
  "relay",
  "crew",
  "mixed",
] as const;
export type ParticipantKind = (typeof participantKinds)[number];

export const resultModels = [
  "time",
  "score",
  "distance",
  "height",
  "points",
  "placement",
  "win_loss",
  "multi_metric",
] as const;
export type ResultModel = (typeof resultModels)[number];

export const resultStatuses = [
  "entered",
  "dns",
  "started",
  "finished",
  "dnf",
  "disqualified",
  "withdrawn",
  "cancelled",
  "no_result",
  "provisional",
] as const;
export type ResultStatus = (typeof resultStatuses)[number];

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lower-case URL slug");

const optionalUrlSchema = z.union([z.url(), z.literal("")]).optional();
const jsonObjectSchema = z.record(z.string(), z.unknown()).default({});

export const evidenceSubmissionSchema = z.object({
  evidenceType: z.enum([
    "official_results",
    "organiser_document",
    "governing_body_record",
    "timing_file",
    "certificate",
    "photo",
    "identity_document",
    "website",
    "email",
    "gps_activity",
    "other",
  ]),
  sourceUrl: optionalUrlSchema,
  description: z.string().trim().max(1_000).optional(),
  isOfficialSource: z.boolean().default(false),
});
export type EvidenceSubmissionInput = z.infer<typeof evidenceSubmissionSchema>;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export const createOrganisationSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: slugSchema.optional(),
  organisationType: z
    .enum([
      "event_organiser",
      "club",
      "team",
      "league",
      "governing_body",
      "timing_company",
      "venue",
      "charity",
      "school",
      "university",
      "commercial",
      "media",
      "other",
    ])
    .default("event_organiser"),
  legalName: z.string().trim().max(250).optional(),
  companyNumber: z.string().trim().max(80).optional(),
  charityNumber: z.string().trim().max(80).optional(),
  governingBody: z.string().trim().max(200).optional(),
  website: optionalUrlSchema,
  publicEmail: z.union([z.email(), z.literal("")]).optional(),
  countryCode: z.string().trim().min(2).max(3).optional(),
});
export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;

export const venueSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(250),
  addressLine1: z.string().trim().max(250).optional(),
  addressLine2: z.string().trim().max(250).optional(),
  city: z.string().trim().max(150).optional(),
  district: z.string().trim().max(150).optional(),
  county: z.string().trim().max(150).optional(),
  region: z.string().trim().max(150).optional(),
  nation: z.string().trim().max(150).optional(),
  countryCode: z.string().trim().min(2).max(3).optional(),
  postcode: z.string().trim().max(30).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().trim().max(100).optional(),
  website: optionalUrlSchema,
  accessibility: jsonObjectSchema,
  transport: jsonObjectSchema,
  facilities: jsonObjectSchema,
});
export type VenueSubmission = z.infer<typeof venueSubmissionSchema>;

export const competitionSubmissionSchema = z.object({
  code: slugSchema,
  name: z.string().trim().min(1).max(250),
  sportCode: slugSchema,
  disciplineCode: slugSchema.optional(),
  surfaceCode: slugSchema.optional(),
  participantKind: z.enum(participantKinds).default("individual"),
  resultModel: z.enum(resultModels).default("multi_metric"),
  distanceValue: z.number().nonnegative().optional(),
  distanceUnit: z.string().trim().max(40).optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  categoryCode: z.string().trim().max(80).optional(),
  categoryName: z.string().trim().max(160).optional(),
  genderCategory: z.string().trim().max(80).optional(),
  ageMin: z.number().int().nonnegative().optional(),
  ageMax: z.number().int().nonnegative().optional(),
  weightClass: z.string().trim().max(80).optional(),
  classification: z.string().trim().max(100).optional(),
  startAt: z.string().trim().optional(),
  endAt: z.string().trim().optional(),
  entryStatus: z
    .enum([
      "tbc",
      "not_applicable",
      "coming_soon",
      "open",
      "closing_soon",
      "closed",
      "waitlist",
      "sold_out",
    ])
    .default("tbc"),
  entryUrl: optionalUrlSchema,
  entryFee: z.number().nonnegative().optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  capacity: z.number().int().nonnegative().optional(),
  rulesUrl: optionalUrlSchema,
  permitNumber: z.string().trim().max(100).optional(),
  sourceUrl: optionalUrlSchema,
  allowsTies: z.boolean().default(false),
  customData: jsonObjectSchema,
});
export type CompetitionSubmission = z.infer<typeof competitionSubmissionSchema>;

export const occurrenceSubmissionSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().max(250).optional(),
  season: z.string().trim().max(80).optional(),
  startAt: z.string().trim().min(1),
  endAt: z.string().trim().optional(),
  timezone: z.string().trim().max(100).default("Europe/London"),
  entryStatus: z
    .enum([
      "tbc",
      "not_applicable",
      "coming_soon",
      "open",
      "closing_soon",
      "closed",
      "waitlist",
      "sold_out",
    ])
    .default("tbc"),
  entryUrl: optionalUrlSchema,
  venue: venueSubmissionSchema.optional(),
  countryCode: z.string().trim().min(2).max(3).optional(),
  nation: z.string().trim().max(150).optional(),
  region: z.string().trim().max(150).optional(),
  county: z.string().trim().max(150).optional(),
  district: z.string().trim().max(150).optional(),
  city: z.string().trim().max(150).optional(),
  postcode: z.string().trim().max(30).optional(),
  sourceUrl: optionalUrlSchema,
  competitions: z.array(competitionSubmissionSchema).min(1).max(200),
  customData: jsonObjectSchema,
});
export type OccurrenceSubmission = z.infer<typeof occurrenceSubmissionSchema>;

export const eventSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  name: z.string().trim().min(2).max(250),
  slug: slugSchema.optional(),
  sportCode: slugSchema,
  eventType: z
    .enum([
      "participation",
      "race",
      "meet",
      "match",
      "fixture",
      "tournament",
      "league",
      "championship",
      "festival",
      "training",
      "exhibition",
      "virtual",
      "other",
    ])
    .default("participation"),
  summary: z.string().trim().max(500).default(""),
  description: z.string().trim().max(20_000).default(""),
  website: optionalUrlSchema,
  governingBody: z.string().trim().max(200).optional(),
  permitNumber: z.string().trim().max(100).optional(),
  rulesUrl: optionalUrlSchema,
  sourceUrl: optionalUrlSchema,
  occurrence: occurrenceSubmissionSchema,
  evidence: z.array(evidenceSubmissionSchema).max(50).default([]),
});
export type EventSubmissionInput = z.infer<typeof eventSubmissionSchema>;

export const eventEditSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  changes: z
    .object({
      name: z.string().trim().min(2).max(250).optional(),
      summary: z.string().trim().max(500).optional(),
      description: z.string().trim().max(20_000).optional(),
      website: optionalUrlSchema,
      country: z.string().trim().max(150).optional(),
      county: z.string().trim().max(150).optional(),
      city: z.string().trim().max(150).optional(),
      area: z.string().trim().max(150).optional(),
      surface: z.string().trim().max(100).optional(),
      governingBody: z.string().trim().max(200).optional(),
      permitNumber: z.string().trim().max(100).optional(),
      rulesUrl: optionalUrlSchema,
      metadata: jsonObjectSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Supply at least one change"),
  sourceUrl: optionalUrlSchema,
  reason: z.string().trim().min(3).max(2000),
});
export type EventEditSubmissionInput = z.infer<typeof eventEditSubmissionSchema>;

export const eventClaimSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  relationship: z
    .enum([
      "owner",
      "organiser",
      "co_organiser",
      "timing_partner",
      "governing_body",
      "data_partner",
    ])
    .default("organiser"),
  reason: z.string().trim().min(3).max(2_000),
  sourceUrl: optionalUrlSchema,
  evidence: z.array(evidenceSubmissionSchema).max(50).default([]),
});
export type EventClaimSubmissionInput = z.infer<typeof eventClaimSubmissionSchema>;


export const newOccurrenceSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  occurrence: occurrenceSubmissionSchema,
  evidence: z.array(evidenceSubmissionSchema).max(50).default([]),
});
export type NewOccurrenceSubmissionInput = z.infer<typeof newOccurrenceSubmissionSchema>;

export const occurrenceEditSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  occurrenceId: z.number().int().positive(),
  changes: z
    .object({
      name: z.string().trim().max(250).optional(),
      season: z.string().trim().max(80).optional(),
      startAt: z.string().trim().optional(),
      endAt: z.string().trim().optional(),
      timezone: z.string().trim().max(100).optional(),
      status: z.enum(["draft", "scheduled", "entries_open", "entries_closed", "postponed", "cancelled", "in_progress", "completed"]).optional(),
      entryStatus: z.enum(["tbc", "not_applicable", "coming_soon", "open", "closing_soon", "closed", "waitlist", "sold_out"]).optional(),
      entryUrl: optionalUrlSchema,
      countryCode: z.string().trim().min(2).max(3).optional(),
      nation: z.string().trim().max(150).optional(),
      region: z.string().trim().max(150).optional(),
      county: z.string().trim().max(150).optional(),
      district: z.string().trim().max(150).optional(),
      city: z.string().trim().max(150).optional(),
      postcode: z.string().trim().max(30).optional(),
      sourceUrl: optionalUrlSchema,
      customData: jsonObjectSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Supply at least one change"),
  reason: z.string().trim().min(3).max(2_000),
  sourceUrl: optionalUrlSchema,
});
export type OccurrenceEditSubmissionInput = z.infer<typeof occurrenceEditSubmissionSchema>;

export const competitionEditSubmissionSchema = z.object({
  organisationId: z.number().int().positive(),
  eventId: z.number().int().positive(),
  competitionId: z.number().int().positive(),
  changes: z
    .object({
      name: z.string().trim().min(1).max(250).optional(),
      disciplineCode: slugSchema.optional(),
      surfaceCode: slugSchema.optional(),
      participantKind: z.enum(participantKinds).optional(),
      resultModel: z.enum(resultModels).optional(),
      distanceValue: z.number().nonnegative().optional(),
      distanceUnit: z.string().trim().max(40).optional(),
      durationSeconds: z.number().int().nonnegative().optional(),
      categoryCode: z.string().trim().max(80).optional(),
      categoryName: z.string().trim().max(160).optional(),
      genderCategory: z.string().trim().max(80).optional(),
      ageMin: z.number().int().nonnegative().optional(),
      ageMax: z.number().int().nonnegative().optional(),
      weightClass: z.string().trim().max(80).optional(),
      classification: z.string().trim().max(100).optional(),
      startAt: z.string().trim().optional(),
      endAt: z.string().trim().optional(),
      status: z.enum(["draft", "scheduled", "postponed", "cancelled", "in_progress", "completed"]).optional(),
      entryStatus: z.enum(["tbc", "not_applicable", "coming_soon", "open", "closing_soon", "closed", "waitlist", "sold_out"]).optional(),
      entryUrl: optionalUrlSchema,
      entryFee: z.number().nonnegative().optional(),
      currency: z.string().trim().min(3).max(3).optional(),
      capacity: z.number().int().nonnegative().optional(),
      rulesUrl: optionalUrlSchema,
      permitNumber: z.string().trim().max(100).optional(),
      sourceUrl: optionalUrlSchema,
      allowsTies: z.boolean().optional(),
      customData: jsonObjectSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Supply at least one change"),
  reason: z.string().trim().min(3).max(2_000),
  sourceUrl: optionalUrlSchema,
});
export type CompetitionEditSubmissionInput = z.infer<typeof competitionEditSubmissionSchema>;

export const resultMetricSchema = z
  .object({
    code: slugSchema,
    name: z.string().trim().max(120).optional(),
    valueNumeric: z.number().optional(),
    valueText: z.string().trim().max(500).optional(),
    unit: z.string().trim().max(40).optional(),
    sequenceNo: z.number().int().positive().default(1),
    isPrimary: z.boolean().default(false),
    rank: z.number().int().positive().optional(),
    customData: jsonObjectSchema,
  })
  .refine(
    (value) => value.valueNumeric !== undefined || Boolean(value.valueText),
    "A metric needs valueNumeric or valueText",
  );
export type ResultMetricInput = z.infer<typeof resultMetricSchema>;

export const resultSegmentSchema = z
  .object({
    type: z.string().trim().min(1).max(80),
    code: z.string().trim().min(1).max(100),
    name: z.string().trim().max(160).optional(),
    sequenceNo: z.number().int().positive(),
    valueNumeric: z.number().optional(),
    valueText: z.string().trim().max(500).optional(),
    unit: z.string().trim().max(40).optional(),
    rank: z.number().int().positive().optional(),
    status: z.string().trim().max(80).optional(),
    customData: jsonObjectSchema,
  })
  .refine(
    (value) =>
      value.valueNumeric !== undefined || Boolean(value.valueText) || Boolean(value.status),
    "A segment needs a value or status",
  );
export type ResultSegmentInput = z.infer<typeof resultSegmentSchema>;

export const resultUploadRowSchema = z
  .object({
    externalEntryKey: z.string().trim().max(200).optional(),
    participantKind: z.enum(participantKinds).default("individual"),
    athleteId: z.number().int().positive().optional(),
    athleteExternalId: z.string().trim().max(200).optional(),
    teamId: z.number().int().positive().optional(),
    displayName: z.string().trim().max(250).optional(),
    teamName: z.string().trim().max(250).optional(),
    memberNames: z.array(z.string().trim().min(1).max(250)).max(100).default([]),
    bib: z.string().trim().max(80).optional(),
    lane: z.string().trim().max(80).optional(),
    categoryCode: z.string().trim().max(80).optional(),
    categoryName: z.string().trim().max(160).optional(),
    clubId: z.number().int().positive().optional(),
    clubName: z.string().trim().max(250).optional(),
    countryCode: z.string().trim().min(2).max(3).optional(),
    resultStatus: z.enum(resultStatuses).default("finished"),
    rankOverall: z.number().int().positive().optional(),
    rankCategory: z.number().int().positive().optional(),
    rankGender: z.number().int().positive().optional(),
    performanceValue: z.number().optional(),
    performanceUnit: z.string().trim().max(40).optional(),
    performanceDisplay: z.string().trim().max(200).optional(),
    points: z.number().optional(),
    scoreFor: z.number().optional(),
    scoreAgainst: z.number().optional(),
    outcome: z
      .enum(["win", "loss", "draw", "tie", "qualified", "eliminated", "not_applicable"])
      .optional(),
    sourceUrl: optionalUrlSchema,
    metrics: z.array(resultMetricSchema).max(500).default([]),
    segments: z.array(resultSegmentSchema).max(5_000).default([]),
    customData: jsonObjectSchema,
  })
  .refine(
    (value) =>
      value.athleteId !== undefined ||
      value.teamId !== undefined ||
      Boolean(value.displayName) ||
      Boolean(value.teamName) ||
      value.memberNames.length > 0,
    "A result needs an athlete, team or participant name",
  )
  .refine(
    (value) =>
      value.resultStatus !== "finished" ||
      value.performanceValue !== undefined ||
      Boolean(value.performanceDisplay) ||
      value.points !== undefined ||
      value.scoreFor !== undefined ||
      value.scoreAgainst !== undefined ||
      value.outcome !== undefined ||
      value.metrics.length > 0 ||
      value.segments.length > 0 ||
      value.rankOverall !== undefined,
    "A finished result needs a performance, score, metric or rank",
  );
export type ResultUploadRowInput = z.infer<typeof resultUploadRowSchema>;

export const resultUploadSchema = z.object({
  organisationId: z.number().int().positive(),
  competitionId: z.number().int().positive(),
  originalFilename: z.string().trim().min(1).max(255),
  uploadFormat: z.enum(["csv", "json", "xml", "api", "manual", "pdf_reference"]),
  mimeType: z.string().trim().max(120).optional(),
  sourceUrl: optionalUrlSchema,
  declaredOfficial: z.boolean().default(false),
  isFinalResults: z.boolean().default(false),
  uploaderNote: z.string().trim().max(5_000).optional(),
  evidence: z.array(evidenceSubmissionSchema).max(50).default([]),
  rows: z.array(z.unknown()).min(1).max(100_000),
});
export type ResultUploadInput = z.infer<typeof resultUploadSchema>;

export const athletePublicEditSchema = z.object({
  athleteId: z.number().int().positive(),
  changes: z
    .object({
      displayName: z.string().trim().min(1).max(250).optional(),
      gender: z.string().trim().max(30).optional(),
      city: z.string().trim().max(150).optional(),
      county: z.string().trim().max(150).optional(),
      country: z.string().trim().max(150).optional(),
      bio: z.string().trim().max(10_000).optional(),
      avatarUrl: optionalUrlSchema,
      nation: z.string().trim().max(150).optional(),
      preferredDistance: z.string().trim().max(100).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Supply at least one change"),
  reason: z.string().trim().min(3).max(2_000),
  sourceUrl: optionalUrlSchema,
});
export type AthletePublicEditInput = z.infer<typeof athletePublicEditSchema>;

export const athletePrivateProfileSchema = z.object({
  athleteId: z.number().int().positive(),
  legalGivenName: z.string().trim().max(150).optional(),
  legalMiddleNames: z.string().trim().max(200).optional(),
  legalFamilyName: z.string().trim().max(150).optional(),
  preferredName: z.string().trim().max(150).optional(),
  dateOfBirth: z.union([z.string().date(), z.literal("")]).optional(),
  competitionSex: z.string().trim().max(50).optional(),
  nationality: z.string().trim().max(150).optional(),
  countryOfResidence: z.string().trim().max(150).optional(),
  primaryEmail: z.union([z.email(), z.literal("")]).optional(),
  mobilePhone: z.string().trim().max(60).optional(),
  address: jsonObjectSchema.optional(),
  emergencyContact: jsonObjectSchema.optional(),
  raceEntryProfile: jsonObjectSchema.optional(),
  accessibilityRequirements: jsonObjectSchema.optional(),
  profileCompleteness: z.number().int().min(0).max(100).optional(),
});
export type AthletePrivateProfileInput = z.infer<typeof athletePrivateProfileSchema>;

export const missingResultSchema = z.object({
  athleteId: z.number().int().positive(),
  competitionId: z.number().int().positive(),
  result: resultUploadRowSchema,
  evidence: z.array(z.record(z.string(), z.unknown())).default([]),
  note: z.string().trim().max(5_000).optional(),
});
export type MissingResultInput = z.infer<typeof missingResultSchema>;

export const equipmentInputSchema = z.object({
  athleteId: z.number().int().positive(),
  productId: z.number().int().positive().optional(),
  sportId: z.number().int().positive().optional(),
  category: z.string().trim().min(1).max(120),
  brand: z.string().trim().max(150).optional(),
  model: z.string().trim().max(200).optional(),
  variant: z.string().trim().max(150).optional(),
  size: z.string().trim().max(80).optional(),
  colour: z.string().trim().max(80).optional(),
  ownershipType: z.enum(["purchased", "gifted", "sponsored", "borrowed", "trial", "unknown"]).default("purchased"),
  purchaseDate: z.string().date().optional(),
  retailer: z.string().trim().max(200).optional(),
  purchasePrice: z.number().nonnegative().optional(),
  currency: z.string().trim().min(3).max(3).optional(),
  status: z.enum(["wishlist", "active", "retired", "returned", "sold", "lost"]).default("active"),
  visibility: z.enum(["private", "followers", "public"]).default("private"),
  disclosure: z.enum(["personally_purchased", "gifted", "sponsored", "affiliate", "review_sample", "unknown"]).default("personally_purchased"),
  notes: z.string().trim().max(5_000).optional(),
  metadata: jsonObjectSchema,
});
export type EquipmentInput = z.infer<typeof equipmentInputSchema>;


export const athleteClaimSchema = z.object({
  athleteId: z.number().int().positive(),
  relationship: z
    .enum(["self", "parent", "guardian", "coach", "agent", "manager", "club_admin", "other"])
    .default("self"),
  requestedRole: z.enum(["owner", "editor", "contributor", "viewer"]).default("owner"),
  note: z.string().trim().max(5_000).optional(),
  evidence: z.array(z.record(z.string(), z.unknown())).max(25).default([]),
});
export type AthleteClaimInput = z.infer<typeof athleteClaimSchema>;

export const resultClaimSchema = z.object({
  athleteId: z.number().int().positive(),
  resultId: z.number().int().positive(),
  claimType: z.enum(["belongs_to_me", "not_me", "correction", "duplicate"]),
  note: z.string().trim().max(5_000).optional(),
  proposedChanges: z.record(z.string(), z.unknown()).default({}),
  evidence: z.array(z.record(z.string(), z.unknown())).max(25).default([]),
});
export type ResultClaimInput = z.infer<typeof resultClaimSchema>;

export const athletePublicSettingsSchema = z.object({
  athleteId: z.number().int().positive(),
  profileVisibility: z.enum(["private", "unlisted", "public"]).default("public"),
  locationVisibility: z.enum(["private", "country", "region", "county", "city"]).default("city"),
  dateOfBirthVisibility: z.enum(["private", "age_category", "age", "full"]).default("age_category"),
  upcomingEventsVisibility: z.enum(["private", "followers", "public"]).default("private"),
  equipmentVisibility: z.enum(["private", "followers", "public"]).default("private"),
  allowFollows: z.boolean().default(true),
  allowContactRequests: z.boolean().default(false),
  showVerifiedBadges: z.boolean().default(true),
  settings: jsonObjectSchema,
});
export type AthletePublicSettingsInput = z.infer<typeof athletePublicSettingsSchema>;

export const athleteSportSchema = z.object({
  athleteId: z.number().int().positive(),
  sportId: z.number().int().positive(),
  disciplineId: z.number().int().positive().optional(),
  isPrimary: z.boolean().default(false),
  participationLevel: z
    .enum(["recreational", "club", "county", "regional", "national", "international", "professional", "elite"])
    .default("recreational"),
  status: z.enum(["active", "inactive", "retired"]).default("active"),
  startedOn: z.string().date().optional(),
  endedOn: z.string().date().optional(),
  preferredSurfaceId: z.number().int().positive().optional(),
  preferredDistanceValue: z.number().nonnegative().optional(),
  preferredDistanceUnit: z.string().trim().max(40).optional(),
  publicNotes: z.string().trim().max(2_000).optional(),
  privateData: jsonObjectSchema,
});
export type AthleteSportInput = z.infer<typeof athleteSportSchema>;

export const athletePreferenceSchema = z.object({
  athleteId: z.number().int().positive(),
  preferenceType: z.enum(["distance", "surface", "location", "travel_radius", "entry_price", "season", "brand", "product", "event_type", "communication", "other"]),
  sportId: z.number().int().positive().optional(),
  value: z.unknown(),
  visibility: z.enum(["private", "organisers", "partners", "public"]).default("private"),
  expiresAt: z.string().trim().optional(),
});
export type AthletePreferenceInput = z.infer<typeof athletePreferenceSchema>;

export const athleteConsentSchema = z.object({
  athleteId: z.number().int().positive(),
  purpose: z.enum(["service", "race_recommendations", "equipment_recommendations", "race_alerts", "athrecs_news", "product_offers", "partner_offers_via_athrecs", "direct_partner_sharing", "anonymous_research", "profiling"]),
  channel: z.enum(["in_app", "email", "sms", "push", "phone", "data_sharing"]),
  status: z.enum(["granted", "withdrawn", "denied"]),
  lawfulBasis: z.enum(["contract", "consent", "legitimate_interests", "legal_obligation", "vital_interests", "public_task"]).optional(),
  policyVersion: z.string().trim().max(80).optional(),
  expiresAt: z.string().trim().optional(),
  evidence: jsonObjectSchema,
});
export type AthleteConsentInput = z.infer<typeof athleteConsentSchema>;

export const reviewDecisionSchema = z.object({
  decision: z.enum(["approve", "reject", "request_changes"]),
  note: z.string().trim().min(3).max(10_000),
});
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;
