import { createServerFn } from "@tanstack/react-start";
import type { Sql, SqlRow } from "@/lib/db";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  createOrganisationSchema,
  eventClaimSubmissionSchema,
  eventEditSubmissionSchema,
  eventSubmissionSchema,
  newOccurrenceSubmissionSchema,
  occurrenceEditSubmissionSchema,
  competitionEditSubmissionSchema,
  resultUploadSchema,
  slugify,
  type CompetitionSubmission,
  type EventSubmissionInput,
  type NewOccurrenceSubmissionInput,
  type VenueSubmission,
} from "./multisport.types";
import {
  requireMinimumOrganisationRole,
  requireOrganisationEventPermission,
  requireOrganisationRole,
} from "./access.server";
import { csvToResultRows, stageResultUpload } from "./results-upload.server";
import { withSqlTransaction } from "./transaction.server";
import {
  addEvidenceItems,
  attachCaseToSubmission,
  createDataSubmission,
  createVerificationCase,
  writeAudit,
} from "./workflow.server";

function valueOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function uniqueOrganisationSlug(sql: Sql, requested: string): Promise<string> {
  const base = slugify(requested) || "organisation";
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const rows = await sql<{ exists: boolean }>`
      select exists(select 1 from organisations where slug = ${candidate}) as exists
    `;
    if (!rows[0]?.exists) return candidate;
  }
  throw new Error("Could not create a unique organisation URL");
}

async function uniqueEventSlug(sql: Sql, requested: string): Promise<string> {
  const base = slugify(requested) || "event";
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const rows = await sql<{ exists: boolean }>`
      select exists(select 1 from events where slug = ${candidate}) as exists
    `;
    if (!rows[0]?.exists) return candidate;
  }
  throw new Error("Could not create a unique event URL");
}

async function uniqueOccurrenceSlug(
  sql: Sql,
  eventId: number,
  requested: string,
): Promise<string> {
  const base = slugify(requested) || "occurrence";
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const rows = await sql<{ exists: boolean }>`
      select exists(
        select 1 from event_occurrences
        where event_id = ${eventId} and slug = ${candidate}
      ) as exists
    `;
    if (!rows[0]?.exists) return candidate;
  }
  throw new Error("Could not create a unique occurrence URL");
}

async function resolveSport(
  sql: Sql,
  code: string,
): Promise<{ id: number; code: string; name: string }> {
  const rows = await sql<{ id: number; code: string; name: string }>`
    select id, code, name from sports where code = ${code} and active = true limit 1
  `;
  if (!rows[0]) {
    throw new Error(
      `Unknown sport code "${code}". Use the taxonomy endpoint or submit the event under "other" for Athrecs review.`,
    );
  }
  return rows[0];
}

async function resolveDisciplineId(
  sql: Sql,
  sportId: number,
  code: string | undefined,
): Promise<number | null> {
  if (!code) return null;
  const rows = await sql<{ id: number }>`
    select id from disciplines
    where sport_id = ${sportId} and code = ${code} and active = true
    limit 1
  `;
  if (!rows[0]) {
    throw new Error(`Unknown discipline code "${code}" for the selected sport`);
  }
  return rows[0].id;
}

async function resolveSurface(
  sql: Sql,
  code: string | undefined,
): Promise<{ id: number; name: string } | null> {
  if (!code) return null;
  const rows = await sql<{ id: number; name: string }>`
    select id, name from surfaces where code = ${code} and active = true limit 1
  `;
  if (!rows[0]) throw new Error(`Unknown surface code "${code}"`);
  return rows[0];
}

async function insertVenue(
  sql: Sql,
  organisationId: number,
  venue: VenueSubmission,
): Promise<number> {
  const base = slugify(`${venue.name}-${venue.city ?? ""}`) || "venue";
  let venueSlug = base;
  for (let suffix = 1; suffix <= 10_000; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const rows = await sql<{ exists: boolean }>`
      select exists(
        select 1 from venues
        where organisation_id = ${organisationId} and slug = ${candidate}
      ) as exists
    `;
    if (!rows[0]?.exists) {
      venueSlug = candidate;
      break;
    }
  }

  const rows = await sql<{ id: number }>`
    insert into venues (
      organisation_id, slug, name, address_line_1, address_line_2, city,
      district, county, region, nation, country_code, postcode, latitude,
      longitude, timezone, website, accessibility, transport, facilities,
      verification_status
    ) values (
      ${organisationId}, ${venueSlug}, ${venue.name},
      ${valueOrNull(venue.addressLine1)}, ${valueOrNull(venue.addressLine2)},
      ${valueOrNull(venue.city)}, ${valueOrNull(venue.district)},
      ${valueOrNull(venue.county)}, ${valueOrNull(venue.region)},
      ${valueOrNull(venue.nation)}, ${valueOrNull(venue.countryCode)?.toUpperCase() ?? null},
      ${valueOrNull(venue.postcode)}, ${venue.latitude ?? null},
      ${venue.longitude ?? null}, ${valueOrNull(venue.timezone)},
      ${valueOrNull(venue.website)}, ${JSON.stringify(venue.accessibility)}::jsonb,
      ${JSON.stringify(venue.transport)}::jsonb,
      ${JSON.stringify(venue.facilities)}::jsonb, ${"pending"}
    )
    returning id
  `;
  if (!rows[0]) throw new Error("Could not create the venue");
  return rows[0].id;
}

async function insertCompetition(
  sql: Sql,
  occurrenceId: number,
  competition: CompetitionSubmission,
  fallbackVenueId: number | null,
): Promise<number> {
  const sport = await resolveSport(sql, competition.sportCode);
  const disciplineId = await resolveDisciplineId(
    sql,
    sport.id,
    competition.disciplineCode,
  );
  const surface = await resolveSurface(sql, competition.surfaceCode);

  const rows = await sql<{ id: number }>`
    insert into event_competitions (
      occurrence_id, sport_id, discipline_id, surface_id, venue_id, code, name,
      participant_kind, result_model, distance_value, distance_unit,
      duration_seconds, category_code, category_name, gender_category, age_min,
      age_max, weight_class, classification, start_at, end_at, status,
      entry_status, entry_url, entry_fee, currency, capacity, rules_url,
      permit_number, source_url, allows_ties, custom_data, verification_status
    ) values (
      ${occurrenceId}, ${sport.id}, ${disciplineId}, ${surface?.id ?? null},
      ${fallbackVenueId}, ${competition.code}, ${competition.name},
      ${competition.participantKind}, ${competition.resultModel},
      ${competition.distanceValue ?? null}, ${valueOrNull(competition.distanceUnit)},
      ${competition.durationSeconds ?? null}, ${valueOrNull(competition.categoryCode)},
      ${valueOrNull(competition.categoryName)}, ${valueOrNull(competition.genderCategory)},
      ${competition.ageMin ?? null}, ${competition.ageMax ?? null},
      ${valueOrNull(competition.weightClass)}, ${valueOrNull(competition.classification)},
      ${valueOrNull(competition.startAt)}::timestamptz,
      ${valueOrNull(competition.endAt)}::timestamptz, ${"scheduled"},
      ${competition.entryStatus}, ${valueOrNull(competition.entryUrl)},
      ${competition.entryFee ?? null}, ${valueOrNull(competition.currency)?.toUpperCase() ?? null},
      ${competition.capacity ?? null}, ${valueOrNull(competition.rulesUrl)},
      ${valueOrNull(competition.permitNumber)}, ${valueOrNull(competition.sourceUrl)},
      ${competition.allowsTies}, ${JSON.stringify(competition.customData)}::jsonb,
      ${"pending"}
    )
    returning id
  `;
  if (!rows[0]) throw new Error(`Could not create competition ${competition.name}`);
  return rows[0].id;
}

async function createPendingEventRecords(
  sql: Sql,
  userId: string,
  input: EventSubmissionInput,
): Promise<{
  eventId: number;
  occurrenceId: number;
  competitionIds: number[];
  venueId: number | null;
  eventSlug: string;
}> {
  const organisationRows = await sql<{ name: string }>`
    select name from organisations where id = ${input.organisationId} limit 1
  `;
  if (!organisationRows[0]) throw new Error("Organisation not found");

  const sport = await resolveSport(sql, input.sportCode);
  const firstSurface = await resolveSurface(
    sql,
    input.occurrence.competitions[0]?.surfaceCode,
  );
  const eventSlug = await uniqueEventSlug(sql, input.slug || input.name);
  const venueId = input.occurrence.venue
    ? await insertVenue(sql, input.organisationId, input.occurrence.venue)
    : null;

  const country =
    input.occurrence.nation ||
    input.occurrence.venue?.nation ||
    input.occurrence.countryCode ||
    input.occurrence.venue?.countryCode ||
    "";
  const county =
    input.occurrence.county || input.occurrence.venue?.county || "";
  const city = input.occurrence.city || input.occurrence.venue?.city || "";
  const area =
    input.occurrence.district ||
    input.occurrence.venue?.district ||
    input.occurrence.region ||
    input.occurrence.venue?.region ||
    "";

  const eventRows = await sql<{ id: number }>`
    insert into events (
      slug, name, sport, country, county, city, area, surface, summary,
      description, organiser, website, featured, source_url, sport_id,
      owner_organisation_id, event_type, timezone, visibility,
      lifecycle_status, verification_status, governing_body, permit_number,
      rules_url, metadata, created_at, updated_at
    ) values (
      ${eventSlug}, ${input.name}, ${sport.name}, ${country}, ${county}, ${city},
      ${area}, ${firstSurface?.name ?? "Other"}, ${input.summary},
      ${input.description}, ${organisationRows[0].name},
      ${valueOrNull(input.website) ?? ""}, ${false}, ${valueOrNull(input.sourceUrl)},
      ${sport.id}, ${input.organisationId}, ${input.eventType},
      ${input.occurrence.timezone}, ${"private"}, ${"active"}, ${"pending"},
      ${valueOrNull(input.governingBody)}, ${valueOrNull(input.permitNumber)},
      ${valueOrNull(input.rulesUrl)}, ${JSON.stringify({ submittedByUserId: userId })}::jsonb,
      now(), now()
    )
    returning id
  `;
  if (!eventRows[0]) throw new Error("Could not create the event");
  const eventId = eventRows[0].id;

  await sql`
    insert into organisation_events (
      organisation_id, event_id, relationship, status, can_edit,
      can_upload_results, created_at
    ) values (
      ${input.organisationId}, ${eventId}, ${"owner"}, ${"active"},
      ${true}, ${true}, now()
    )
  `;

  const occurrenceSlug =
    input.occurrence.slug ||
    slugify(
      `${input.name}-${input.occurrence.season || input.occurrence.startAt.slice(0, 10)}`,
    );
  const occurrenceRows = await sql<{ id: number }>`
    insert into event_occurrences (
      event_id, slug, name, season, start_at, end_at, timezone, status,
      entry_status, entry_url, venue_id, country_code, nation, region, county,
      district, city, postcode, source_url, results_status, visibility,
      verification_status, custom_data
    ) values (
      ${eventId}, ${occurrenceSlug}, ${valueOrNull(input.occurrence.name)},
      ${valueOrNull(input.occurrence.season)}, ${input.occurrence.startAt}::timestamptz,
      ${valueOrNull(input.occurrence.endAt)}::timestamptz,
      ${input.occurrence.timezone}, ${"scheduled"},
      ${input.occurrence.entryStatus}, ${valueOrNull(input.occurrence.entryUrl)},
      ${venueId}, ${valueOrNull(input.occurrence.countryCode)?.toUpperCase() ?? null},
      ${valueOrNull(input.occurrence.nation)}, ${valueOrNull(input.occurrence.region)},
      ${valueOrNull(input.occurrence.county)}, ${valueOrNull(input.occurrence.district)},
      ${valueOrNull(input.occurrence.city)}, ${valueOrNull(input.occurrence.postcode)},
      ${valueOrNull(input.occurrence.sourceUrl)}, ${"awaiting"}, ${"private"},
      ${"pending"}, ${JSON.stringify(input.occurrence.customData)}::jsonb
    )
    returning id
  `;
  if (!occurrenceRows[0]) throw new Error("Could not create the event occurrence");
  const occurrenceId = occurrenceRows[0].id;

  const competitionIds: number[] = [];
  for (const competition of input.occurrence.competitions) {
    competitionIds.push(
      await insertCompetition(sql, occurrenceId, competition, venueId),
    );
  }

  return { eventId, occurrenceId, competitionIds, venueId, eventSlug };
}

async function createPendingOccurrenceRecords(
  sql: Sql,
  userId: string,
  input: NewOccurrenceSubmissionInput,
): Promise<{
  occurrenceId: number;
  competitionIds: number[];
  venueId: number | null;
  occurrenceSlug: string;
}> {
  const events = await sql<{ id: number; name: string }>`
    select id, name from events where id = ${input.eventId} limit 1
  `;
  if (!events[0]) throw new Error("Event not found");
  const venueId = input.occurrence.venue
    ? await insertVenue(sql, input.organisationId, input.occurrence.venue)
    : null;
  const occurrenceSlug = await uniqueOccurrenceSlug(
    sql,
    input.eventId,
    input.occurrence.slug ||
      `${events[0].name}-${input.occurrence.season || input.occurrence.startAt.slice(0, 10)}`,
  );
  const rows = await sql<{ id: number }>`
    insert into event_occurrences (
      event_id, slug, name, season, start_at, end_at, timezone, status,
      entry_status, entry_url, venue_id, country_code, nation, region, county,
      district, city, postcode, source_url, results_status, visibility,
      verification_status, custom_data
    ) values (
      ${input.eventId}, ${occurrenceSlug}, ${valueOrNull(input.occurrence.name)},
      ${valueOrNull(input.occurrence.season)}, ${input.occurrence.startAt}::timestamptz,
      ${valueOrNull(input.occurrence.endAt)}::timestamptz,
      ${input.occurrence.timezone}, ${"scheduled"},
      ${input.occurrence.entryStatus}, ${valueOrNull(input.occurrence.entryUrl)},
      ${venueId}, ${valueOrNull(input.occurrence.countryCode)?.toUpperCase() ?? null},
      ${valueOrNull(input.occurrence.nation)}, ${valueOrNull(input.occurrence.region)},
      ${valueOrNull(input.occurrence.county)}, ${valueOrNull(input.occurrence.district)},
      ${valueOrNull(input.occurrence.city)}, ${valueOrNull(input.occurrence.postcode)},
      ${valueOrNull(input.occurrence.sourceUrl)}, ${"awaiting"}, ${"private"},
      ${"pending"},
      ${JSON.stringify({ ...input.occurrence.customData, submittedByUserId: userId })}::jsonb
    ) returning id
  `;
  if (!rows[0]) throw new Error("Could not create the occurrence");
  const occurrenceId = rows[0].id;
  const competitionIds: number[] = [];
  for (const competition of input.occurrence.competitions) {
    competitionIds.push(
      await insertCompetition(sql, occurrenceId, competition, venueId),
    );
  }
  return { occurrenceId, competitionIds, venueId, occurrenceSlug };
}

export const listSportTaxonomy = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const sports = await sql<{
      id: number;
      code: string;
      name: string;
      category: string;
    }>`
      select id, code, name, category
      from sports where active = true order by name
    `;
    const disciplines = await sql<{
      id: number;
      sport_id: number;
      code: string;
      name: string;
      participant_kind: string;
      result_model: string;
      default_unit: string | null;
    }>`
      select id, sport_id, code, name, participant_kind, result_model, default_unit
      from disciplines where active = true order by sport_id, name
    `;
    const surfaces = await sql<{ id: number; code: string; name: string; category: string }>`
      select id, code, name, category from surfaces where active = true order by name
    `;
    return { sports, disciplines, surfaces };
  },
);

export const createOrganiserOrganisation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => createOrganisationSchema.parse(input))
  .handler(async ({ data, context }) =>
    withSqlTransaction(async (sql) => {
      const slug = await uniqueOrganisationSlug(sql, data.slug || data.name);
      const rows = await sql<{ id: number }>`
        insert into organisations (
          slug, name, organisation_type, legal_name, company_number,
          charity_number, governing_body, website, public_email, country_code,
          status, verification_status, verification_level, created_by_user_id
        ) values (
          ${slug}, ${data.name}, ${data.organisationType},
          ${valueOrNull(data.legalName)}, ${valueOrNull(data.companyNumber)},
          ${valueOrNull(data.charityNumber)}, ${valueOrNull(data.governingBody)},
          ${valueOrNull(data.website)}, ${valueOrNull(data.publicEmail)},
          ${valueOrNull(data.countryCode)?.toUpperCase() ?? null}, ${"active"},
          ${"pending"}, ${"none"}, ${context.userId}
        ) returning id
      `;
      if (!rows[0]) throw new Error("Could not create the organisation");
      const organisationId = rows[0].id;

      await sql`
        insert into organisation_members (
          organisation_id, user_id, role, status, accepted_at
        ) values (
          ${organisationId}, ${context.userId}, ${"owner"}, ${"active"}, now()
        )
      `;
      const caseId = await createVerificationCase(sql, {
        subjectType: "organisation",
        subjectId: String(organisationId),
        openedByUserId: context.userId,
        summary: `Verify organiser: ${data.name}`,
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "organisation.created",
        entityType: "organisation",
        entityId: organisationId,
        organisationId,
        afterData: { ...data, slug, verificationCaseId: caseId },
      });
      return {
        organisationId,
        slug,
        verificationStatus: "pending" as const,
        verificationCaseId: caseId,
      };
    }),
  );

export const getOrganiserDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { organisationId: number }) => ({
    organisationId: Number(input.organisationId),
  }))
  .handler(async ({ data, context }) => {
    await requireOrganisationRole(context.userId, data.organisationId, [
      "owner",
      "admin",
      "editor",
      "results_uploader",
      "finance",
      "viewer",
    ]);
    const sql = await getSql();
    const organisation = await sql`
      select id, slug, name, organisation_type, verification_status,
             verification_level, website, public_email, country_code
      from organisations where id = ${data.organisationId} limit 1
    `;
    const events = await sql`
      select
        e.id, e.slug, e.name, e.sport, e.visibility, e.verification_status,
        oe.relationship, oe.can_edit, oe.can_upload_results,
        count(distinct o.id)::int as occurrence_count,
        count(distinct c.id)::int as competition_count,
        min(o.start_at) filter (where o.start_at >= now()) as next_start_at
      from organisation_events oe
      join events e on e.id = oe.event_id
      left join event_occurrences o on o.event_id = e.id
      left join event_competitions c on c.occurrence_id = o.id
      where oe.organisation_id = ${data.organisationId} and oe.status = 'active'
      group by e.id, oe.relationship, oe.can_edit, oe.can_upload_results
      order by next_start_at nulls last, e.name
    `;
    const uploads = await sql`
      select
        b.id, b.competition_id, b.original_filename, b.status, b.row_count,
        b.valid_row_count, b.warning_count, b.error_count, b.declared_official,
        b.is_final_results, b.created_at, b.submitted_at, b.published_at,
        c.name as competition_name, e.name as event_name
      from result_upload_batches b
      join event_competitions c on c.id = b.competition_id
      join event_occurrences o on o.id = c.occurrence_id
      join events e on e.id = o.event_id
      where b.organisation_id = ${data.organisationId}
      order by b.created_at desc
      limit 100
    `;
    const submissions = await sql`
      select id, submission_type, target_type, target_id, status,
             reviewer_note, submitted_at, reviewed_at, created_at
      from data_submissions
      where organisation_id = ${data.organisationId}
      order by created_at desc
      limit 100
    `;
    return { organisation: organisation[0] ?? null, events, uploads, submissions };
  });

export const submitEventClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => eventClaimSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireMinimumOrganisationRole(
      context.userId,
      data.organisationId,
      "admin",
    );
    return withSqlTransaction(async (sql) => {
      const events = await sql<SqlRow>`
        select id, slug, name, organiser, website, verification_status,
               owner_organisation_id
        from events where id = ${data.eventId} for update
      `;
      const event = events[0];
      if (!event) throw new Error("Event not found");
      const currentOwnerId = Number(event.owner_organisation_id ?? 0);
      if (
        data.relationship === "owner" &&
        Number.isInteger(currentOwnerId) &&
        currentOwnerId > 0 &&
        currentOwnerId !== data.organisationId
      ) {
        throw new Error(
          "This event already has a verified owner. Submit an organiser or co-organiser claim, or ask Athrecs to resolve ownership.",
        );
      }

      const existing = await sql<{ status: string }>`
        select status from organisation_events
        where organisation_id = ${data.organisationId}
          and event_id = ${data.eventId}
          and relationship = ${data.relationship}
        limit 1
      `;
      if (existing[0]?.status === "active") {
        throw new Error("This organisation already has the requested event relationship");
      }
      const pending = await sql<{ id: number }>`
        select id from data_submissions
        where submission_type = 'event_claim'
          and target_id = ${String(data.eventId)}
          and organisation_id = ${data.organisationId}
          and status in ('submitted', 'automated_checks', 'needs_information', 'under_review')
        limit 1
      `;
      if (pending[0]) return {
        submissionId: pending[0].id,
        status: "already_pending" as const,
      };

      const submissionId = await createDataSubmission(sql, {
        submissionType: "event_claim",
        targetType: "event",
        targetId: String(data.eventId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: {
          relationship: data.relationship,
          reason: data.reason,
          eventName: event.name,
        },
        currentSnapshot: event,
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Verify ${data.relationship} claim for event ${String(event.name)}`,
        priority: data.evidence.some((item) => item.isOfficialSource)
          ? "normal"
          : "high",
        riskFlags: data.evidence.some((item) => item.isOfficialSource)
          ? []
          : ["official_relationship_evidence_missing"],
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      const evidence = [...data.evidence];
      if (
        data.sourceUrl &&
        !evidence.some((item) => item.sourceUrl === data.sourceUrl)
      ) {
        evidence.push({
          evidenceType: "website",
          sourceUrl: data.sourceUrl,
          description: data.reason,
          isOfficialSource: false,
        });
      }
      await addEvidenceItems(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        addedByUserId: context.userId,
        evidence,
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "event.claim_submitted",
        entityType: "event",
        entityId: data.eventId,
        organisationId: data.organisationId,
        beforeData: event,
        afterData: {
          relationship: data.relationship,
          submissionId,
          verificationCaseId: caseId,
        },
      });
      return {
        submissionId,
        verificationCaseId: caseId,
        status: "submitted" as const,
      };
    });
  });

export const submitNewEvent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => eventSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireMinimumOrganisationRole(
      context.userId,
      data.organisationId,
      "editor",
    );
    return withSqlTransaction(async (sql) => {
      const created = await createPendingEventRecords(sql, context.userId, data);
      const submissionId = await createDataSubmission(sql, {
        submissionType: "new_event",
        targetType: "event",
        targetId: String(created.eventId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: { ...data, created },
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Verify new ${data.sportCode} event: ${data.name}`,
        priority: data.evidence.some((item) => item.isOfficialSource)
          ? "normal"
          : "high",
        riskFlags: data.evidence.some((item) => item.isOfficialSource)
          ? []
          : ["official_source_not_identified"],
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      await addEvidenceItems(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        addedByUserId: context.userId,
        evidence: data.evidence,
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "event.submitted",
        entityType: "event",
        entityId: created.eventId,
        organisationId: data.organisationId,
        afterData: { submissionId, verificationCaseId: caseId, ...created },
      });
      return {
        ...created,
        submissionId,
        verificationCaseId: caseId,
        status: "submitted" as const,
        public: false,
      };
    });
  });

export const submitEventEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => eventEditSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireOrganisationEventPermission(
      context.userId,
      data.organisationId,
      data.eventId,
      "edit",
    );
    return withSqlTransaction(async (sql) => {
      const currentRows = await sql<SqlRow>`
        select * from events where id = ${data.eventId} limit 1
      `;
      if (!currentRows[0]) throw new Error("Event not found");
      const submissionId = await createDataSubmission(sql, {
        submissionType: "event_edit",
        targetType: "event",
        targetId: String(data.eventId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: { changes: data.changes, reason: data.reason },
        currentSnapshot: currentRows[0],
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Review edit to event ${currentRows[0].name ?? data.eventId}`,
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      if (data.sourceUrl) {
        await addEvidenceItems(sql, {
          subjectType: "event_submission",
          subjectId: String(submissionId),
          addedByUserId: context.userId,
          evidence: [
            {
              evidenceType: "website",
              sourceUrl: data.sourceUrl,
              description: data.reason,
              isOfficialSource: false,
            },
          ],
        });
      }
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "event.edit_submitted",
        entityType: "event",
        entityId: data.eventId,
        organisationId: data.organisationId,
        beforeData: currentRows[0],
        afterData: { changes: data.changes, submissionId, verificationCaseId: caseId },
      });
      return { submissionId, verificationCaseId: caseId, status: "submitted" as const };
    });
  });

export const submitNewOccurrence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => newOccurrenceSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireOrganisationEventPermission(
      context.userId,
      data.organisationId,
      data.eventId,
      "edit",
    );
    return withSqlTransaction(async (sql) => {
      const created = await createPendingOccurrenceRecords(sql, context.userId, data);
      const submissionId = await createDataSubmission(sql, {
        submissionType: "new_occurrence",
        targetType: "occurrence",
        targetId: String(created.occurrenceId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: { ...data, created },
        sourceUrl: valueOrNull(data.occurrence.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Verify new occurrence for event ${data.eventId}`,
        riskFlags: data.evidence.some((item) => item.isOfficialSource)
          ? []
          : ["official_source_not_identified"],
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      await addEvidenceItems(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        addedByUserId: context.userId,
        evidence: data.evidence,
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "occurrence.submitted",
        entityType: "occurrence",
        entityId: created.occurrenceId,
        organisationId: data.organisationId,
        afterData: { submissionId, verificationCaseId: caseId, ...created },
      });
      return {
        ...created,
        submissionId,
        verificationCaseId: caseId,
        status: "submitted" as const,
        public: false,
      };
    });
  });

export const submitOccurrenceEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => occurrenceEditSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireOrganisationEventPermission(
      context.userId,
      data.organisationId,
      data.eventId,
      "edit",
    );
    return withSqlTransaction(async (sql) => {
      const current = await sql<SqlRow>`
        select * from event_occurrences
        where id = ${data.occurrenceId} and event_id = ${data.eventId}
        limit 1
      `;
      if (!current[0]) throw new Error("Occurrence not found for this event");
      const submissionId = await createDataSubmission(sql, {
        submissionType: "occurrence_edit",
        targetType: "occurrence",
        targetId: String(data.occurrenceId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: { changes: data.changes, reason: data.reason, eventId: data.eventId },
        currentSnapshot: current[0],
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Review occurrence edit ${data.occurrenceId}`,
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "occurrence.edit_submitted",
        entityType: "occurrence",
        entityId: data.occurrenceId,
        organisationId: data.organisationId,
        beforeData: current[0],
        afterData: { submissionId, changes: data.changes },
      });
      return { submissionId, verificationCaseId: caseId, status: "submitted" as const };
    });
  });

export const submitCompetitionEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => competitionEditSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireOrganisationEventPermission(
      context.userId,
      data.organisationId,
      data.eventId,
      "edit",
    );
    return withSqlTransaction(async (sql) => {
      const current = await sql<SqlRow>`
        select c.*
        from event_competitions c
        join event_occurrences o on o.id = c.occurrence_id
        where c.id = ${data.competitionId} and o.event_id = ${data.eventId}
        limit 1
      `;
      if (!current[0]) throw new Error("Competition not found for this event");
      const submissionId = await createDataSubmission(sql, {
        submissionType: "competition_edit",
        targetType: "competition",
        targetId: String(data.competitionId),
        organisationId: data.organisationId,
        submittedByUserId: context.userId,
        payload: { changes: data.changes, reason: data.reason, eventId: data.eventId },
        currentSnapshot: current[0],
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "event_submission",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Review competition edit ${data.competitionId}`,
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "competition.edit_submitted",
        entityType: "competition",
        entityId: data.competitionId,
        organisationId: data.organisationId,
        beforeData: current[0],
        afterData: { submissionId, changes: data.changes },
      });
      return { submissionId, verificationCaseId: caseId, status: "submitted" as const };
    });
  });

// Separate validators are intentionally plain here because Zod's generated type
// for a 100,000-row union can become expensive in TanStack's route inference.
export const uploadResultsCsv = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    organisationId: number;
    competitionId: number;
    originalFilename: string;
    csv: string;
    mimeType?: string;
    sourceUrl?: string;
    declaredOfficial?: boolean;
    isFinalResults?: boolean;
    uploaderNote?: string;
    evidence?: unknown[];
  }) => input)
  .handler(async ({ data, context }) => {
    if (!data.csv?.trim()) throw new Error("Paste or upload a CSV file");
    const parsed = csvToResultRows(data.csv);
    const input = resultUploadSchema.parse({
      organisationId: Number(data.organisationId),
      competitionId: Number(data.competitionId),
      originalFilename: data.originalFilename,
      uploadFormat: "csv",
      mimeType: data.mimeType || "text/csv",
      sourceUrl: data.sourceUrl,
      declaredOfficial: Boolean(data.declaredOfficial),
      isFinalResults: Boolean(data.isFinalResults),
      uploaderNote: data.uploaderNote,
      evidence: data.evidence ?? [],
      rows: parsed.rows,
    });
    return stageResultUpload(context.userId, input, parsed.headers);
  });

export const uploadResultsJson = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => resultUploadSchema.parse(input))
  .handler(async ({ data, context }) =>
    stageResultUpload(context.userId, data),
  );

export const getResultUploadBatch = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { organisationId: number; batchId: number }) => ({
    organisationId: Number(input.organisationId),
    batchId: Number(input.batchId),
  }))
  .handler(async ({ data, context }) => {
    await requireOrganisationRole(context.userId, data.organisationId, [
      "owner",
      "admin",
      "editor",
      "results_uploader",
      "viewer",
    ]);
    const sql = await getSql();
    const batches = await sql`
      select b.*, c.name as competition_name, o.id as occurrence_id,
             e.id as event_id, e.name as event_name
      from result_upload_batches b
      join event_competitions c on c.id = b.competition_id
      join event_occurrences o on o.id = c.occurrence_id
      join events e on e.id = o.event_id
      where b.id = ${data.batchId}
        and b.organisation_id = ${data.organisationId}
      limit 1
    `;
    if (!batches[0]) throw new Error("Upload batch not found");
    const rows = await sql`
      select id, row_number, normalized_data, validation_status,
             errors, warnings, matched_entry_id, matched_athlete_id,
             published_result_id
      from result_upload_rows
      where batch_id = ${data.batchId}
      order by row_number
      limit 10_000
    `;
    const checks = await sql`
      select check_code, check_name, status, severity, details, checked_at
      from result_upload_checks
      where batch_id = ${data.batchId}
      order by severity desc, check_code
    `;
    return { batch: batches[0], rows, checks };
  });

// Keep the imported type visible to generated API tooling.
export type { EventSubmissionInput };
