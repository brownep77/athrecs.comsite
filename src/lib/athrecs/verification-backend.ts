import { createServerFn } from "@tanstack/react-start";
import type { Sql, SqlRow } from "@/lib/db";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { reviewDecisionSchema, type ReviewDecisionInput } from "./multisport.types";
import { requirePlatformRole } from "./access.server";
import { publishVerifiedBatch, publishVerifiedResult } from "./result-publication.server";
import { withSqlTransaction } from "./transaction.server";
import { writeAudit } from "./workflow.server";

const reviewerRoles = ["super_admin", "admin", "reviewer", "data_steward"] as const;

type SubmissionRow = {
  id: number;
  submission_type: string;
  target_type: string;
  target_id: string | null;
  organisation_id: number | null;
  athlete_id: number | null;
  submitted_by_user_id: string;
  payload: unknown;
  current_snapshot: unknown;
  source_url: string | null;
  status: string;
  verification_case_id: number | null;
};

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  }
  return {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  }
  return [];
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function positiveIntegerArray(value: unknown): number[] {
  return asArray(value)
    .map((item) => optionalNumber(item))
    .filter(
      (item): item is number =>
        item !== null && Number.isInteger(item) && item > 0,
    );
}

function has(object: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

async function writeSubmissionProvenance(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
  entityType: string,
  entityId: number,
): Promise<void> {
  const payload = asObject(submission.payload);
  const changes = asObject(payload.changes);
  const fieldPaths = Object.keys(changes);
  const sourceType = submission.organisation_id
    ? "organiser"
    : submission.athlete_id
      ? "athlete"
      : "public_source";
  const permittedUses = submission.submission_type === "athlete_claim"
    ? ["account_access", "profile_management"]
    : ["public_display", "search", "statistics"];
  const paths = fieldPaths.length ? fieldPaths : [null];

  for (const fieldPath of paths) {
    await sql`
      insert into data_provenance (
        entity_type, entity_id, field_path, source_type, source_url,
        source_reference, submitted_by_user_id, collected_at, verified_at,
        confidence, permitted_uses, metadata
      ) values (
        ${entityType}, ${String(entityId)}, ${fieldPath}, ${sourceType},
        ${submission.source_url}, ${`data_submission:${submission.id}`},
        ${submission.submitted_by_user_id}, now(), now(),
        ${"high"}, ${JSON.stringify(permittedUses)}::jsonb,
        ${JSON.stringify({
          submissionType: submission.submission_type,
          targetType: submission.target_type,
          reviewerUserId,
        })}::jsonb
      )
    `;
  }
}

function provenanceEntityType(submissionType: string): string | null {
  switch (submissionType) {
    case "new_event":
    case "event_edit":
      return "event";
    case "event_claim":
      return "event_organisation_relationship";
    case "new_occurrence":
    case "occurrence_edit":
      return "event_occurrence";
    case "competition_edit":
      return "event_competition";
    case "athlete_public_edit":
      return "athlete_public_profile";
    case "athlete_claim":
      return "athlete_profile_claim";
    default:
      return null;
  }
}

async function closeVerificationCase(
  sql: Sql,
  caseId: number | null,
  reviewerUserId: string,
  decision: ReviewDecisionInput["decision"],
  note: string,
): Promise<void> {
  if (!caseId) return;
  const status =
    decision === "approve"
      ? "closed"
      : decision === "reject"
        ? "closed"
        : "needs_information";
  await sql`
    update verification_cases set
      status = ${status},
      decision = ${decision},
      decision_note = ${note},
      assigned_to_user_id = ${reviewerUserId},
      reviewed_at = now(),
      closed_at = case when ${status} = 'closed' then now() else null end,
      updated_at = now()
    where id = ${caseId}
  `;
}

async function applyEventClaim(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const eventId = Number(submission.target_id);
  const organisationId = submission.organisation_id;
  if (!Number.isInteger(eventId) || eventId <= 0 || !organisationId) {
    throw new Error("Event claim has no valid event and organisation");
  }
  const payload = asObject(submission.payload);
  const relationship = optionalString(payload.relationship) ?? "organiser";
  const allowed = new Set([
    "owner",
    "organiser",
    "co_organiser",
    "timing_partner",
    "governing_body",
    "data_partner",
  ]);
  if (!allowed.has(relationship)) throw new Error("Unknown event relationship");

  const canEdit = ["owner", "organiser", "co_organiser", "governing_body"].includes(
    relationship,
  );
  const canUploadResults = [
    "owner",
    "organiser",
    "co_organiser",
    "timing_partner",
    "governing_body",
    "data_partner",
  ].includes(relationship);

  const events = await sql<SqlRow>`
    select id, owner_organisation_id from events where id = ${eventId} for update
  `;
  const event = events[0];
  if (!event) throw new Error("Event no longer exists");
  const currentOwnerId = optionalNumber(event.owner_organisation_id);
  if (
    relationship === "owner" &&
    currentOwnerId !== null &&
    currentOwnerId !== organisationId
  ) {
    throw new Error(
      "This event already has a different verified owner; resolve the ownership dispute before approving another owner",
    );
  }
  if (relationship === "owner") {
    const otherOwners = await sql<{ organisation_id: number }>`
      select organisation_id
      from organisation_events
      where event_id = ${eventId}
        and relationship = 'owner'
        and status = 'active'
        and organisation_id <> ${organisationId}
      limit 1
    `;
    if (otherOwners[0]) {
      throw new Error(
        "This event already has another active owner relationship; resolve it before approval",
      );
    }
  }
  await sql`
    insert into organisation_events (
      organisation_id, event_id, relationship, status, can_edit,
      can_upload_results, verified_at, verified_by_user_id
    ) values (
      ${organisationId}, ${eventId}, ${relationship}, ${"active"},
      ${canEdit}, ${canUploadResults}, now(), ${reviewerUserId}
    )
    on conflict (organisation_id, event_id, relationship) do update set
      status = 'active', can_edit = excluded.can_edit,
      can_upload_results = excluded.can_upload_results,
      verified_at = now(), verified_by_user_id = excluded.verified_by_user_id
  `;
  if (relationship === "owner") {
    await sql`
      update events set
        owner_organisation_id = ${organisationId},
        updated_at = now()
      where id = ${eventId}
    `;
  }
  await writeAudit(sql, {
    actorUserId: reviewerUserId,
    action: "event.claim_approved",
    entityType: "event",
    entityId: eventId,
    organisationId,
    beforeData: events[0],
    afterData: { relationship, canEdit, canUploadResults },
  });
}

async function applyNewEvent(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const eventId = Number(submission.target_id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("New event submission has no valid event id");
  }
  const payload = asObject(submission.payload);
  const created = asObject(payload.created);
  const createdEventId = optionalNumber(created.eventId);
  const occurrenceId = optionalNumber(created.occurrenceId);
  const competitionIds = positiveIntegerArray(created.competitionIds);
  const venueId = optionalNumber(created.venueId);
  if (createdEventId !== eventId || !occurrenceId || !competitionIds.length) {
    throw new Error("New event submission is missing its staged record identifiers");
  }

  const events = await sql<{ id: number }>`
    update events set
      visibility = 'public',
      verification_status = 'verified',
      verified_at = now(),
      verified_by_user_id = ${reviewerUserId},
      updated_at = now()
    where id = ${eventId}
      and verification_status in ('pending', 'automated_checks_passed')
    returning id
  `;
  if (!events[0]) throw new Error("The staged event is no longer pending review");

  const occurrences = await sql<{ id: number }>`
    update event_occurrences set
      visibility = 'public',
      verification_status = 'verified',
      verified_at = now(),
      verified_by_user_id = ${reviewerUserId},
      updated_at = now()
    where id = ${occurrenceId}
      and event_id = ${eventId}
      and verification_status in ('pending', 'automated_checks_passed')
    returning id
  `;
  if (!occurrences[0]) {
    throw new Error("The staged event occurrence is missing or no longer pending");
  }

  for (const competitionId of competitionIds) {
    const competitions = await sql<{ id: number }>`
      update event_competitions set
        verification_status = 'verified',
        verified_at = now(),
        verified_by_user_id = ${reviewerUserId},
        updated_at = now()
      where id = ${competitionId}
        and occurrence_id = ${occurrenceId}
        and verification_status in ('pending', 'automated_checks_passed')
      returning id
    `;
    if (!competitions[0]) {
      throw new Error(`Staged competition ${competitionId} is missing or no longer pending`);
    }
  }
  if (submission.organisation_id) {
    await sql`
      update organisation_events set verified_at = now(),
        verified_by_user_id = ${reviewerUserId}
      where organisation_id = ${submission.organisation_id}
        and event_id = ${eventId}
        and relationship = 'owner'
        and status = 'active'
    `;
  }
  if (venueId) {
    await sql`
      update venues set verification_status = 'verified', updated_at = now()
      where id = ${venueId} and verification_status = 'pending'
    `;
  }
}

async function applyNewOccurrence(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const occurrenceId = Number(submission.target_id);
  if (!Number.isInteger(occurrenceId) || occurrenceId <= 0) {
    throw new Error("New occurrence submission has no valid occurrence id");
  }
  const payload = asObject(submission.payload);
  const created = asObject(payload.created);
  const createdOccurrenceId = optionalNumber(created.occurrenceId);
  const competitionIds = positiveIntegerArray(created.competitionIds);
  const venueId = optionalNumber(created.venueId);
  if (createdOccurrenceId !== occurrenceId || !competitionIds.length) {
    throw new Error("New occurrence submission is missing its staged record identifiers");
  }

  const occurrences = await sql<{ id: number }>`
    update event_occurrences set
      visibility = 'public', verification_status = 'verified',
      verified_at = now(), verified_by_user_id = ${reviewerUserId},
      updated_at = now()
    where id = ${occurrenceId}
      and verification_status in ('pending', 'automated_checks_passed')
    returning id
  `;
  if (!occurrences[0]) {
    throw new Error("The staged occurrence is missing or no longer pending");
  }
  for (const competitionId of competitionIds) {
    const competitions = await sql<{ id: number }>`
      update event_competitions set
        verification_status = 'verified', verified_at = now(),
        verified_by_user_id = ${reviewerUserId}, updated_at = now()
      where id = ${competitionId}
        and occurrence_id = ${occurrenceId}
        and verification_status in ('pending', 'automated_checks_passed')
      returning id
    `;
    if (!competitions[0]) {
      throw new Error(`Staged competition ${competitionId} is missing or no longer pending`);
    }
  }
  if (venueId) {
    await sql`
      update venues set verification_status = 'verified', updated_at = now()
      where id = ${venueId} and verification_status = 'pending'
    `;
  }
}

async function applyOccurrenceEdit(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const occurrenceId = Number(submission.target_id);
  if (!Number.isInteger(occurrenceId) || occurrenceId <= 0) {
    throw new Error("Occurrence edit has no valid occurrence id");
  }
  const payload = asObject(submission.payload);
  const changes = asObject(payload.changes);
  const current = await sql<SqlRow>`
    select * from event_occurrences where id = ${occurrenceId} for update
  `;
  if (!current[0]) throw new Error("Occurrence no longer exists");
  await sql`
    update event_occurrences set
      name = case when ${has(changes, "name")} then ${optionalString(changes.name)} else name end,
      season = case when ${has(changes, "season")} then ${optionalString(changes.season)} else season end,
      start_at = case when ${has(changes, "startAt")} then ${optionalString(changes.startAt)}::timestamptz else start_at end,
      end_at = case when ${has(changes, "endAt")} then ${optionalString(changes.endAt)}::timestamptz else end_at end,
      timezone = case when ${has(changes, "timezone")} then ${optionalString(changes.timezone)} else timezone end,
      status = case when ${has(changes, "status")} then ${optionalString(changes.status)} else status end,
      entry_status = case when ${has(changes, "entryStatus")} then ${optionalString(changes.entryStatus)} else entry_status end,
      entry_url = case when ${has(changes, "entryUrl")} then ${optionalString(changes.entryUrl)} else entry_url end,
      country_code = case when ${has(changes, "countryCode")} then upper(${optionalString(changes.countryCode)}) else country_code end,
      nation = case when ${has(changes, "nation")} then ${optionalString(changes.nation)} else nation end,
      region = case when ${has(changes, "region")} then ${optionalString(changes.region)} else region end,
      county = case when ${has(changes, "county")} then ${optionalString(changes.county)} else county end,
      district = case when ${has(changes, "district")} then ${optionalString(changes.district)} else district end,
      city = case when ${has(changes, "city")} then ${optionalString(changes.city)} else city end,
      postcode = case when ${has(changes, "postcode")} then ${optionalString(changes.postcode)} else postcode end,
      source_url = case when ${has(changes, "sourceUrl")} then ${optionalString(changes.sourceUrl)} else source_url end,
      custom_data = case
        when ${has(changes, "customData")} then custom_data || ${JSON.stringify(asObject(changes.customData))}::jsonb
        else custom_data
      end,
      verification_status = 'verified', verified_at = now(),
      verified_by_user_id = ${reviewerUserId}, updated_at = now()
    where id = ${occurrenceId}
  `;
  await writeAudit(sql, {
    actorUserId: reviewerUserId,
    action: "occurrence.edit_applied",
    entityType: "occurrence",
    entityId: occurrenceId,
    organisationId: submission.organisation_id,
    beforeData: current[0],
    afterData: changes,
  });
}

async function applyCompetitionEdit(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const competitionId = Number(submission.target_id);
  if (!Number.isInteger(competitionId) || competitionId <= 0) {
    throw new Error("Competition edit has no valid competition id");
  }
  const payload = asObject(submission.payload);
  const changes = asObject(payload.changes);
  const current = await sql<SqlRow & { sport_id: number }>`
    select * from event_competitions where id = ${competitionId} for update
  `;
  if (!current[0]) throw new Error("Competition no longer exists");

  let disciplineId: number | null = null;
  if (has(changes, "disciplineCode")) {
    const code = optionalString(changes.disciplineCode);
    if (code) {
      const rows = await sql<{ id: number }>`
        select id from disciplines
        where sport_id = ${current[0].sport_id} and code = ${code} and active = true
        limit 1
      `;
      if (!rows[0]) throw new Error(`Unknown discipline code ${code}`);
      disciplineId = rows[0].id;
    }
  }
  let surfaceId: number | null = null;
  if (has(changes, "surfaceCode")) {
    const code = optionalString(changes.surfaceCode);
    if (code) {
      const rows = await sql<{ id: number }>`
        select id from surfaces where code = ${code} and active = true limit 1
      `;
      if (!rows[0]) throw new Error(`Unknown surface code ${code}`);
      surfaceId = rows[0].id;
    }
  }

  await sql`
    update event_competitions set
      name = case when ${has(changes, "name")} then ${optionalString(changes.name)} else name end,
      discipline_id = case when ${has(changes, "disciplineCode")} then ${disciplineId} else discipline_id end,
      surface_id = case when ${has(changes, "surfaceCode")} then ${surfaceId} else surface_id end,
      participant_kind = case when ${has(changes, "participantKind")} then ${optionalString(changes.participantKind)} else participant_kind end,
      result_model = case when ${has(changes, "resultModel")} then ${optionalString(changes.resultModel)} else result_model end,
      distance_value = case when ${has(changes, "distanceValue")} then ${optionalNumber(changes.distanceValue)} else distance_value end,
      distance_unit = case when ${has(changes, "distanceUnit")} then ${optionalString(changes.distanceUnit)} else distance_unit end,
      duration_seconds = case when ${has(changes, "durationSeconds")} then ${optionalNumber(changes.durationSeconds)} else duration_seconds end,
      category_code = case when ${has(changes, "categoryCode")} then ${optionalString(changes.categoryCode)} else category_code end,
      category_name = case when ${has(changes, "categoryName")} then ${optionalString(changes.categoryName)} else category_name end,
      gender_category = case when ${has(changes, "genderCategory")} then ${optionalString(changes.genderCategory)} else gender_category end,
      age_min = case when ${has(changes, "ageMin")} then ${optionalNumber(changes.ageMin)} else age_min end,
      age_max = case when ${has(changes, "ageMax")} then ${optionalNumber(changes.ageMax)} else age_max end,
      weight_class = case when ${has(changes, "weightClass")} then ${optionalString(changes.weightClass)} else weight_class end,
      classification = case when ${has(changes, "classification")} then ${optionalString(changes.classification)} else classification end,
      start_at = case when ${has(changes, "startAt")} then ${optionalString(changes.startAt)}::timestamptz else start_at end,
      end_at = case when ${has(changes, "endAt")} then ${optionalString(changes.endAt)}::timestamptz else end_at end,
      status = case when ${has(changes, "status")} then ${optionalString(changes.status)} else status end,
      entry_status = case when ${has(changes, "entryStatus")} then ${optionalString(changes.entryStatus)} else entry_status end,
      entry_url = case when ${has(changes, "entryUrl")} then ${optionalString(changes.entryUrl)} else entry_url end,
      entry_fee = case when ${has(changes, "entryFee")} then ${optionalNumber(changes.entryFee)} else entry_fee end,
      currency = case when ${has(changes, "currency")} then upper(${optionalString(changes.currency)}) else currency end,
      capacity = case when ${has(changes, "capacity")} then ${optionalNumber(changes.capacity)} else capacity end,
      rules_url = case when ${has(changes, "rulesUrl")} then ${optionalString(changes.rulesUrl)} else rules_url end,
      permit_number = case when ${has(changes, "permitNumber")} then ${optionalString(changes.permitNumber)} else permit_number end,
      source_url = case when ${has(changes, "sourceUrl")} then ${optionalString(changes.sourceUrl)} else source_url end,
      allows_ties = case when ${has(changes, "allowsTies")} then ${Boolean(changes.allowsTies)} else allows_ties end,
      custom_data = case
        when ${has(changes, "customData")} then custom_data || ${JSON.stringify(asObject(changes.customData))}::jsonb
        else custom_data
      end,
      verification_status = 'verified', verified_at = now(),
      verified_by_user_id = ${reviewerUserId}, updated_at = now()
    where id = ${competitionId}
  `;
  await writeAudit(sql, {
    actorUserId: reviewerUserId,
    action: "competition.edit_applied",
    entityType: "competition",
    entityId: competitionId,
    organisationId: submission.organisation_id,
    beforeData: current[0],
    afterData: changes,
  });
}

async function applyEventEdit(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const eventId = Number(submission.target_id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    throw new Error("Event edit has no valid event id");
  }
  const payload = asObject(submission.payload);
  const changes = asObject(payload.changes);
  const currentRows = await sql<SqlRow>`
    select * from events where id = ${eventId} for update
  `;
  if (!currentRows[0]) throw new Error("Event no longer exists");

  await sql`
    update events set
      name = case when ${has(changes, "name")} then ${optionalString(changes.name)} else name end,
      summary = case when ${has(changes, "summary")} then ${optionalString(changes.summary) ?? ""} else summary end,
      description = case when ${has(changes, "description")} then ${optionalString(changes.description) ?? ""} else description end,
      website = case when ${has(changes, "website")} then ${optionalString(changes.website) ?? ""} else website end,
      country = case when ${has(changes, "country")} then ${optionalString(changes.country) ?? ""} else country end,
      county = case when ${has(changes, "county")} then ${optionalString(changes.county) ?? ""} else county end,
      city = case when ${has(changes, "city")} then ${optionalString(changes.city) ?? ""} else city end,
      area = case when ${has(changes, "area")} then ${optionalString(changes.area) ?? ""} else area end,
      surface = case when ${has(changes, "surface")} then ${optionalString(changes.surface) ?? "Other"} else surface end,
      governing_body = case when ${has(changes, "governingBody")} then ${optionalString(changes.governingBody)} else governing_body end,
      permit_number = case when ${has(changes, "permitNumber")} then ${optionalString(changes.permitNumber)} else permit_number end,
      rules_url = case when ${has(changes, "rulesUrl")} then ${optionalString(changes.rulesUrl)} else rules_url end,
      metadata = case
        when ${has(changes, "metadata")} then metadata || ${JSON.stringify(asObject(changes.metadata))}::jsonb
        else metadata
      end,
      verification_status = 'verified',
      verified_at = now(),
      verified_by_user_id = ${reviewerUserId},
      updated_at = now()
    where id = ${eventId}
  `;
  await writeAudit(sql, {
    actorUserId: reviewerUserId,
    action: "event.edit_applied",
    entityType: "event",
    entityId: eventId,
    organisationId: submission.organisation_id,
    beforeData: currentRows[0],
    afterData: changes,
  });
}

async function applyAthletePublicEdit(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const athleteId = Number(submission.target_id ?? submission.athlete_id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) {
    throw new Error("Athlete edit has no valid athlete id");
  }
  const payload = asObject(submission.payload);
  const changes = asObject(payload.changes);
  const currentRows = await sql<SqlRow>`
    select id, display_name, gender, city, county, country, bio,
           avatar_url, nation, preferred_distance, source_url
    from athletes where id = ${athleteId} for update
  `;
  if (!currentRows[0]) throw new Error("Athlete no longer exists");

  await sql`
    update athletes set
      display_name = case when ${has(changes, "displayName")} then ${optionalString(changes.displayName)} else display_name end,
      gender = case when ${has(changes, "gender")} then ${optionalString(changes.gender) ?? "U"} else gender end,
      city = case when ${has(changes, "city")} then ${optionalString(changes.city)} else city end,
      county = case when ${has(changes, "county")} then ${optionalString(changes.county) ?? ""} else county end,
      country = case when ${has(changes, "country")} then ${optionalString(changes.country) ?? ""} else country end,
      bio = case when ${has(changes, "bio")} then ${optionalString(changes.bio) ?? ""} else bio end,
      avatar_url = case when ${has(changes, "avatarUrl")} then ${optionalString(changes.avatarUrl)} else avatar_url end,
      nation = case when ${has(changes, "nation")} then ${optionalString(changes.nation)} else nation end,
      preferred_distance = case when ${has(changes, "preferredDistance")} then ${optionalString(changes.preferredDistance)} else preferred_distance end
    where id = ${athleteId}
  `;
  await writeAudit(sql, {
    actorUserId: reviewerUserId,
    action: "athlete.public_edit_applied",
    entityType: "athlete",
    entityId: athleteId,
    beforeData: currentRows[0],
    afterData: changes,
  });
}

async function applyAthleteClaim(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<void> {
  const athleteId = Number(submission.target_id ?? submission.athlete_id);
  if (!Number.isInteger(athleteId) || athleteId <= 0) {
    throw new Error("Athlete claim has no valid athlete id");
  }
  const payload = asObject(submission.payload);
  const relationship = optionalString(payload.relationship) ?? "self";
  const role = optionalString(payload.requestedRole) ?? "owner";
  const allowedRelationships = new Set([
    "self",
    "parent",
    "guardian",
    "coach",
    "agent",
    "manager",
    "club_admin",
    "other",
  ]);
  const allowedRoles = new Set(["owner", "editor", "contributor", "viewer"]);
  if (!allowedRelationships.has(relationship) || !allowedRoles.has(role)) {
    throw new Error("Athlete claim contains an unsupported relationship or role");
  }
  if (relationship === "self" && role === "owner") {
    const otherOwners = await sql<{ user_id: string }>`
      select user_id from athlete_user_links
      where athlete_id = ${athleteId}
        and relationship = 'self'
        and role = 'owner'
        and status = 'verified'
        and user_id <> ${submission.submitted_by_user_id}
      limit 1
      for update
    `;
    if (otherOwners[0]) {
      throw new Error(
        "This athlete already has another verified self-owner; resolve the identity dispute before approving this claim",
      );
    }
  }
  const updated = await sql<{ athlete_id: number }>`
    update athlete_user_links set
      role = ${role}, status = 'verified', verified_at = now(),
      verified_by_user_id = ${reviewerUserId}, updated_at = now()
    where athlete_id = ${athleteId}
      and user_id = ${submission.submitted_by_user_id}
      and relationship = ${relationship}
    returning athlete_id
  `;
  if (!updated[0]) throw new Error("Pending athlete access link not found");
}

async function applyMissingResult(
  sql: Sql,
  submission: SubmissionRow,
  reviewerUserId: string,
): Promise<number> {
  const payload = asObject(submission.payload);
  const competitionId = optionalNumber(payload.competitionId);
  if (!competitionId) throw new Error("Missing-result submission has no competition id");
  const result = asObject(payload.result);
  const published = await publishVerifiedResult(sql, {
    competitionId,
    externalEntryKey: `athlete-submission:${submission.id}`,
    row: result,
    sourceType: "athlete",
    sourceUrl: submission.source_url,
    verifiedByUserId: reviewerUserId,
    provenanceReference: `Athlete missing-result submission ${submission.id}`,
  });
  await sql`
    update data_submissions set target_id = ${String(published.resultId)}
    where id = ${submission.id}
  `;
  return published.resultId;
}

async function rejectStagedSubmissionRecords(
  sql: Sql,
  submission: SubmissionRow,
): Promise<void> {
  if (!["new_event", "new_occurrence"].includes(submission.submission_type)) return;

  const payload = asObject(submission.payload);
  const created = asObject(payload.created);
  const numericTargetId = Number(submission.target_id);
  const safeTargetId =
    Number.isInteger(numericTargetId) && numericTargetId > 0 ? numericTargetId : null;
  const eventId = optionalNumber(created.eventId) ??
    (submission.submission_type === "new_event" ? safeTargetId : null);
  const occurrenceId = optionalNumber(created.occurrenceId) ??
    (submission.submission_type === "new_occurrence" ? safeTargetId : null);
  const competitionIds = positiveIntegerArray(created.competitionIds);
  const venueId = optionalNumber(created.venueId);

  if (eventId && submission.submission_type === "new_event") {
    await sql`
      update events set verification_status = 'rejected', visibility = 'private',
        updated_at = now()
      where id = ${eventId}
    `;
    if (submission.organisation_id) {
      await sql`
        update organisation_events set status = 'ended', can_edit = false,
          can_upload_results = false
        where organisation_id = ${submission.organisation_id}
          and event_id = ${eventId}
          and relationship = 'owner'
      `;
    }
  }
  if (occurrenceId) {
    await sql`
      update event_occurrences set verification_status = 'rejected',
        visibility = 'private', updated_at = now()
      where id = ${occurrenceId}
        and (${eventId}::int is null or event_id = ${eventId})
    `;
  }
  for (const competitionId of competitionIds) {
    await sql`
      update event_competitions set verification_status = 'rejected',
        updated_at = now()
      where id = ${competitionId}
        and (${occurrenceId}::int is null or occurrence_id = ${occurrenceId})
    `;
  }
  if (venueId) {
    await sql`
      update venues set verification_status = 'rejected', updated_at = now()
      where id = ${venueId} and verification_status = 'pending'
    `;
  }
}

export const listVerificationQueue = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator(
    (input:
      | { status?: string; subjectType?: string; priority?: string; limit?: number }
      | undefined) => input ?? {},
  )
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, reviewerRoles);
    const sql = await getSql();
    const status = data.status?.trim() || null;
    const subjectType = data.subjectType?.trim() || null;
    const priority = data.priority?.trim() || null;
    const limit = Math.max(1, Math.min(Number(data.limit) || 100, 500));
    return sql`
      select
        vc.*,
        ds.id as submission_id, ds.submission_type, ds.target_type,
        ds.target_id, ds.organisation_id, ds.athlete_id,
        ds.submitted_by_user_id, ds.submitted_at,
        rb.id as upload_batch_id, rb.original_filename, rb.row_count,
        rb.warning_count, rb.error_count, rb.declared_official,
        rb.is_final_results,
        rc.id as result_claim_id, rc.claim_type, rc.result_id as claimed_result_id
      from verification_cases vc
      left join data_submissions ds
        on vc.subject_type in ('event_submission', 'athlete_claim', 'athlete_edit', 'missing_result')
       and ds.id::text = vc.subject_id
      left join result_upload_batches rb
        on vc.subject_type = 'result_upload' and rb.id::text = vc.subject_id
      left join result_claims rc
        on vc.subject_type = 'result_claim' and rc.id::text = vc.subject_id
      where (${status}::text is null or vc.status = ${status})
        and (${subjectType}::text is null or vc.subject_type = ${subjectType})
        and (${priority}::text is null or vc.priority = ${priority})
      order by
        case vc.priority when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end,
        vc.opened_at asc
      limit ${limit}
    `;
  });

export const getVerificationCase = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { caseId: number }) => ({ caseId: Number(input.caseId) }))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, reviewerRoles);
    const sql = await getSql();
    const cases = await sql`
      select * from verification_cases where id = ${data.caseId} limit 1
    `;
    const item = cases[0] as SqlRow | undefined;
    if (!item) throw new Error("Verification case not found");
    const subjectType = String(item.subject_type);
    const subjectId = String(item.subject_id);
    const checks = await sql`
      select * from verification_checks
      where case_id = ${data.caseId}
      order by performed_at, id
    `;
    const evidence = await sql`
      select * from evidence_items
      where subject_type = ${subjectType} and subject_id = ${subjectId}
      order by created_at, id
    `;
    const submissions =
      ["event_submission", "athlete_claim", "athlete_edit", "missing_result"].includes(
        subjectType,
      )
        ? await sql`select * from data_submissions where id::text = ${subjectId}`
        : [];
    const batches =
      subjectType === "result_upload"
        ? await sql`
            select b.*, c.name as competition_name, e.name as event_name
            from result_upload_batches b
            join event_competitions c on c.id = b.competition_id
            join event_occurrences o on o.id = c.occurrence_id
            join events e on e.id = o.event_id
            where b.id::text = ${subjectId}
          `
        : [];
    const uploadChecks =
      subjectType === "result_upload"
        ? await sql`
            select * from result_upload_checks
            where batch_id::text = ${subjectId}
            order by severity desc, check_code
          `
        : [];
    const uploadRows =
      subjectType === "result_upload"
        ? await sql`
            select id, row_number, normalized_data, validation_status,
                   errors, warnings, matched_entry_id, matched_athlete_id,
                   published_result_id
            from result_upload_rows
            where batch_id::text = ${subjectId}
            order by row_number
            limit 10_000
          `
        : [];
    const claims =
      subjectType === "result_claim"
        ? await sql`
            select rc.*, cr.*, ce.athlete_id as currently_linked_athlete_id,
                   ce.display_name as participant_name,
                   ec.name as competition_name, e.name as event_name
            from result_claims rc
            join competition_results cr on cr.id = rc.result_id
            join competition_entries ce on ce.id = cr.entry_id
            join event_competitions ec on ec.id = cr.competition_id
            join event_occurrences eo on eo.id = ec.occurrence_id
            join events e on e.id = eo.event_id
            where rc.id::text = ${subjectId}
          `
        : [];
    return {
      case: item,
      checks,
      evidence,
      submission: submissions[0] ?? null,
      batch: batches[0] ?? null,
      uploadChecks,
      uploadRows,
      resultClaim: claims[0] ?? null,
    };
  });

export const reviewDataSubmission = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { submissionId: number; decision: ReviewDecisionInput["decision"]; note: string }) => ({
    submissionId: Number(input.submissionId),
    ...reviewDecisionSchema.parse({ decision: input.decision, note: input.note }),
  }))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, reviewerRoles);
    return withSqlTransaction(async (sql) => {
      const rows = await sql<SubmissionRow>`
        select * from data_submissions where id = ${data.submissionId} for update
      `;
      const submission = rows[0];
      if (!submission) throw new Error("Data submission not found");
      if (["applied", "rejected", "cancelled"].includes(submission.status)) {
        throw new Error(`Submission is already ${submission.status}`);
      }

      if (data.decision === "request_changes") {
        await sql`
          update data_submissions set
            status = 'needs_information', reviewer_note = ${data.note},
            reviewed_at = now(), reviewed_by_user_id = ${context.userId},
            updated_at = now()
          where id = ${submission.id}
        `;
        await closeVerificationCase(
          sql,
          submission.verification_case_id,
          context.userId,
          data.decision,
          data.note,
        );
        return { submissionId: submission.id, status: "needs_information" as const };
      }

      if (data.decision === "reject") {
        await sql`
          update data_submissions set
            status = 'rejected', reviewer_note = ${data.note},
            reviewed_at = now(), reviewed_by_user_id = ${context.userId},
            updated_at = now()
          where id = ${submission.id}
        `;
        await rejectStagedSubmissionRecords(sql, submission);
        if (submission.submission_type === "athlete_claim") {
          const payload = asObject(submission.payload);
          await sql`
            update athlete_user_links set status = 'rejected', updated_at = now()
            where athlete_id = ${submission.athlete_id ?? Number(submission.target_id)}
              and user_id = ${submission.submitted_by_user_id}
              and relationship = ${optionalString(payload.relationship) ?? "self"}
          `;
        }
        await closeVerificationCase(
          sql,
          submission.verification_case_id,
          context.userId,
          data.decision,
          data.note,
        );
        await writeAudit(sql, {
          actorUserId: context.userId,
          action: "data_submission.rejected",
          entityType: "data_submission",
          entityId: submission.id,
          organisationId: submission.organisation_id,
          afterData: { decision: data.decision, note: data.note },
        });
        return { submissionId: submission.id, status: "rejected" as const };
      }

      let appliedEntityId: number | null = null;
      switch (submission.submission_type) {
        case "new_event":
          await applyNewEvent(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "event_claim":
          await applyEventClaim(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "new_occurrence":
          await applyNewOccurrence(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "event_edit":
          await applyEventEdit(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "occurrence_edit":
          await applyOccurrenceEdit(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "competition_edit":
          await applyCompetitionEdit(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "athlete_public_edit":
          await applyAthletePublicEdit(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id);
          break;
        case "athlete_claim":
          await applyAthleteClaim(sql, submission, context.userId);
          appliedEntityId = Number(submission.target_id ?? submission.athlete_id);
          break;
        case "missing_result":
          appliedEntityId = await applyMissingResult(sql, submission, context.userId);
          break;
        default:
          throw new Error(
            `Approval is not implemented for ${submission.submission_type}; request changes instead`,
          );
      }

      const provenanceType = provenanceEntityType(submission.submission_type);
      if (provenanceType && appliedEntityId) {
        await writeSubmissionProvenance(
          sql,
          submission,
          context.userId,
          provenanceType,
          appliedEntityId,
        );
      }

      await sql`
        update data_submissions set
          status = 'applied', reviewer_note = ${data.note}, reviewed_at = now(),
          reviewed_by_user_id = ${context.userId}, applied_at = now(),
          updated_at = now()
        where id = ${submission.id}
      `;
      await closeVerificationCase(
        sql,
        submission.verification_case_id,
        context.userId,
        data.decision,
        data.note,
      );
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "data_submission.approved",
        entityType: "data_submission",
        entityId: submission.id,
        organisationId: submission.organisation_id,
        beforeData: submission.current_snapshot,
        afterData: { appliedEntityId, submissionType: submission.submission_type },
      });
      return {
        submissionId: submission.id,
        status: "applied" as const,
        appliedEntityId,
      };
    });
  });

export const reviewResultUpload = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { batchId: number; decision: ReviewDecisionInput["decision"]; note: string }) => ({
    batchId: Number(input.batchId),
    ...reviewDecisionSchema.parse({ decision: input.decision, note: input.note }),
  }))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, reviewerRoles);
    if (data.decision === "approve") {
      const result = await publishVerifiedBatch(
        context.userId,
        data.batchId,
        data.note,
      );
      return { ...result, status: "published" as const };
    }

    return withSqlTransaction(async (sql) => {
      const batches = await sql<{
        id: number;
        organisation_id: number;
        status: string;
      }>`
        select id, organisation_id, status
        from result_upload_batches where id = ${data.batchId} for update
      `;
      const batch = batches[0];
      if (!batch) throw new Error("Result upload batch not found");
      if (batch.status === "published") throw new Error("Published results cannot be rejected");
      const nextStatus = data.decision === "reject" ? "rejected" : "needs_correction";
      await sql`
        update result_upload_batches set
          status = ${nextStatus}, rejection_reason = ${data.note},
          updated_at = now()
        where id = ${data.batchId}
      `;
      const cases = await sql<{ id: number }>`
        select id from verification_cases
        where subject_type = 'result_upload' and subject_id = ${String(data.batchId)}
        order by opened_at desc limit 1
      `;
      await closeVerificationCase(
        sql,
        cases[0]?.id ?? null,
        context.userId,
        data.decision,
        data.note,
      );
      await writeAudit(sql, {
        actorUserId: context.userId,
        action:
          data.decision === "reject"
            ? "result_upload.rejected"
            : "result_upload.changes_requested",
        entityType: "result_upload",
        entityId: data.batchId,
        organisationId: batch.organisation_id,
        afterData: { status: nextStatus, note: data.note },
      });
      return { batchId: data.batchId, status: nextStatus };
    });
  });

function proposedChangesFromEvidence(evidence: unknown): Record<string, unknown> {
  for (const item of asArray(evidence)) {
    const object = asObject(item);
    if (object.proposedChanges) return asObject(object.proposedChanges);
  }
  return {};
}

async function applyResultCorrection(
  sql: Sql,
  resultId: number,
  changes: Record<string, unknown>,
  reviewerUserId: string,
  claimId: number,
): Promise<number> {
  const allowedStatus = new Set([
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
  ]);
  const allowedOutcome = new Set([
    "win",
    "loss",
    "draw",
    "tie",
    "qualified",
    "eliminated",
    "not_applicable",
  ]);
  const supportedChangeKeys = new Set([
    "resultStatus",
    "rankOverall",
    "rankCategory",
    "rankGender",
    "performanceValue",
    "performanceUnit",
    "performanceDisplay",
    "points",
    "scoreFor",
    "scoreAgainst",
    "outcome",
    "sourceUrl",
  ]);
  const changeKeys = Object.keys(changes);
  if (!changeKeys.length) throw new Error("The correction contains no proposed changes");
  const unsupportedKeys = changeKeys.filter((key) => !supportedChangeKeys.has(key));
  if (unsupportedKeys.length) {
    throw new Error(`Unsupported correction fields: ${unsupportedKeys.join(", ")}`);
  }
  const resultStatus = optionalString(changes.resultStatus);
  const outcome = optionalString(changes.outcome);
  if (
    has(changes, "resultStatus") &&
    (!resultStatus || !allowedStatus.has(resultStatus))
  ) {
    throw new Error("Correction contains an invalid result status");
  }
  if (
    has(changes, "outcome") &&
    changes.outcome !== null &&
    (!outcome || !allowedOutcome.has(outcome))
  ) {
    throw new Error("Correction contains an invalid outcome");
  }
  for (const key of ["rankOverall", "rankCategory", "rankGender"] as const) {
    const value = changes[key];
    if (
      has(changes, key) &&
      value !== null &&
      (typeof value !== "number" || !Number.isInteger(value) || value <= 0)
    ) {
      throw new Error(`${key} must be a positive integer or null`);
    }
  }
  for (const key of [
    "performanceValue",
    "points",
    "scoreFor",
    "scoreAgainst",
  ] as const) {
    const value = changes[key];
    if (
      has(changes, key) &&
      value !== null &&
      (typeof value !== "number" || !Number.isFinite(value))
    ) {
      throw new Error(`${key} must be a finite number or null`);
    }
  }
  for (const key of ["performanceUnit", "performanceDisplay"] as const) {
    const value = changes[key];
    if (has(changes, key) && value !== null && typeof value !== "string") {
      throw new Error(`${key} must be text or null`);
    }
  }
  if (has(changes, "sourceUrl") && changes.sourceUrl !== null) {
    if (typeof changes.sourceUrl !== "string") {
      throw new Error("sourceUrl must be a URL or null");
    }
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(changes.sourceUrl);
    } catch {
      throw new Error("sourceUrl must be a valid URL");
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("sourceUrl must use HTTP or HTTPS");
    }
  }

  const currentRows = await sql<SqlRow>`
    select * from competition_results
    where id = ${resultId} and record_status = 'active'
    for update
  `;
  if (!currentRows[0]) throw new Error("The result is no longer the active version");

  // Free the active-result uniqueness slot inside this transaction, then insert
  // a new verified version. A failure rolls the old status back automatically.
  await sql`
    update competition_results
    set record_status = 'superseded', updated_at = now()
    where id = ${resultId}
  `;
  const inserted = await sql<{ id: number }>`
    insert into competition_results (
      competition_id, round_id, entry_id, result_status, rank_overall,
      rank_category, rank_gender, performance_value, performance_unit,
      performance_display, points, score_for, score_against, outcome,
      record_flags, source_type, source_url, upload_batch_id, record_status,
      verification_status, verified_at, verified_by_user_id, published_at,
      custom_data
    )
    select
      competition_id, round_id, entry_id,
      case when ${has(changes, "resultStatus")} then ${resultStatus} else result_status end,
      case when ${has(changes, "rankOverall")} then ${optionalNumber(changes.rankOverall)} else rank_overall end,
      case when ${has(changes, "rankCategory")} then ${optionalNumber(changes.rankCategory)} else rank_category end,
      case when ${has(changes, "rankGender")} then ${optionalNumber(changes.rankGender)} else rank_gender end,
      case when ${has(changes, "performanceValue")} then ${optionalNumber(changes.performanceValue)} else performance_value end,
      case when ${has(changes, "performanceUnit")} then ${optionalString(changes.performanceUnit)} else performance_unit end,
      case when ${has(changes, "performanceDisplay")} then ${optionalString(changes.performanceDisplay)} else performance_display end,
      case when ${has(changes, "points")} then ${optionalNumber(changes.points)} else points end,
      case when ${has(changes, "scoreFor")} then ${optionalNumber(changes.scoreFor)} else score_for end,
      case when ${has(changes, "scoreAgainst")} then ${optionalNumber(changes.scoreAgainst)} else score_against end,
      case when ${has(changes, "outcome")} then ${outcome} else outcome end,
      record_flags, 'athrecs',
      case when ${has(changes, "sourceUrl")} then ${optionalString(changes.sourceUrl)} else source_url end,
      upload_batch_id, 'active', 'verified', now(), ${reviewerUserId}, now(),
      custom_data
    from competition_results
    where id = ${resultId}
    returning id
  `;
  if (!inserted[0]) throw new Error("Could not create the corrected result version");
  const correctedResultId = inserted[0].id;

  await sql`
    update competition_results
    set superseded_by_result_id = ${correctedResultId}, updated_at = now()
    where id = ${resultId}
  `;

  const metrics = await sql<{
    metric_code: string;
    metric_name: string | null;
    value_numeric: number | null;
    value_text: string | null;
    unit: string | null;
    sequence_no: number;
    is_primary: boolean;
    rank_for_metric: number | null;
    custom_data: unknown;
  }>`
    select metric_code, metric_name, value_numeric, value_text, unit,
           sequence_no, is_primary, rank_for_metric, custom_data
    from result_metrics where result_id = ${resultId}
    order by sequence_no, id
  `;
  for (const metric of metrics) {
    await sql`
      insert into result_metrics (
        result_id, metric_code, metric_name, value_numeric, value_text, unit,
        sequence_no, is_primary, rank_for_metric, custom_data
      ) values (
        ${correctedResultId}, ${metric.metric_code}, ${metric.metric_name},
        ${metric.value_numeric}, ${metric.value_text}, ${metric.unit},
        ${metric.sequence_no}, ${metric.is_primary}, ${metric.rank_for_metric},
        ${JSON.stringify(metric.custom_data ?? {})}::jsonb
      )
    `;
  }

  const segments = await sql<{
    id: number;
    parent_segment_id: number | null;
    segment_type: string;
    segment_code: string;
    segment_name: string | null;
    sequence_no: number;
    value_numeric: number | null;
    value_text: string | null;
    unit: string | null;
    rank_for_segment: number | null;
    status: string | null;
    custom_data: unknown;
  }>`
    select id, parent_segment_id, segment_type, segment_code, segment_name,
           sequence_no, value_numeric, value_text, unit, rank_for_segment,
           status, custom_data
    from result_segments where result_id = ${resultId}
    order by sequence_no, id
  `;
  const newSegmentIdByOld = new Map<number, number>();
  const pending = [...segments];
  while (pending.length) {
    let insertedThisPass = 0;
    for (let index = pending.length - 1; index >= 0; index -= 1) {
      const segment = pending[index];
      const parentId = segment.parent_segment_id
        ? newSegmentIdByOld.get(segment.parent_segment_id)
        : null;
      if (segment.parent_segment_id && !parentId) continue;
      const copied = await sql<{ id: number }>`
        insert into result_segments (
          result_id, parent_segment_id, segment_type, segment_code,
          segment_name, sequence_no, value_numeric, value_text, unit,
          rank_for_segment, status, custom_data
        ) values (
          ${correctedResultId}, ${parentId}, ${segment.segment_type},
          ${segment.segment_code}, ${segment.segment_name}, ${segment.sequence_no},
          ${segment.value_numeric}, ${segment.value_text}, ${segment.unit},
          ${segment.rank_for_segment}, ${segment.status},
          ${JSON.stringify(segment.custom_data ?? {})}::jsonb
        ) returning id
      `;
      if (!copied[0]) throw new Error("Could not copy result segment");
      newSegmentIdByOld.set(segment.id, copied[0].id);
      pending.splice(index, 1);
      insertedThisPass += 1;
    }
    if (!insertedThisPass) {
      throw new Error("Result segment hierarchy is invalid and could not be copied");
    }
  }

  await sql`
    insert into data_provenance (
      entity_type, entity_id, source_type, source_reference,
      submitted_by_user_id, collected_at, verified_at, confidence,
      permitted_uses, metadata
    ) values (
      ${"competition_result"}, ${String(correctedResultId)}, ${"athrecs"},
      ${`result_claim:${claimId}`}, ${reviewerUserId}, now(), now(), ${"authoritative"},
      ${JSON.stringify(["public_display", "statistics", "rankings"])}::jsonb,
      ${JSON.stringify({ correctedFromResultId: resultId, claimId })}::jsonb
    )
  `;
  return correctedResultId;
}

export const reviewResultClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { claimId: number; decision: ReviewDecisionInput["decision"]; note: string }) => ({
    claimId: Number(input.claimId),
    ...reviewDecisionSchema.parse({ decision: input.decision, note: input.note }),
  }))
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, reviewerRoles);
    return withSqlTransaction(async (sql) => {
      const claims = await sql<{
        id: number;
        result_id: number;
        athlete_id: number;
        claim_type: string;
        status: string;
        evidence: unknown;
        verification_case_id: number | null;
        entry_id: number;
        currently_linked_athlete_id: number | null;
        competition_id: number;
        participant_kind: string;
      }>`
        select rc.*, cr.entry_id, cr.competition_id,
               ce.athlete_id as currently_linked_athlete_id,
               ec.participant_kind
        from result_claims rc
        join competition_results cr
          on cr.id = rc.result_id
         and cr.record_status = 'active'
        join competition_entries ce on ce.id = cr.entry_id
        join event_competitions ec on ec.id = cr.competition_id
        where rc.id = ${data.claimId}
        for update of rc, cr, ce
      `;
      const claim = claims[0];
      if (!claim) throw new Error("Result claim not found");
      if (["approved", "rejected", "cancelled"].includes(claim.status)) {
        throw new Error(`Claim is already ${claim.status}`);
      }

      let activeResultId = claim.result_id;
      if (data.decision === "approve") {
        if (
          ["not_me", "correction", "duplicate"].includes(claim.claim_type) &&
          claim.currently_linked_athlete_id !== claim.athlete_id
        ) {
          throw new Error(
            "The claimant is no longer linked to this active result; reopen the identity review instead",
          );
        }
        if (
          claim.claim_type === "belongs_to_me" &&
          !["individual", "mixed"].includes(claim.participant_kind)
        ) {
          throw new Error("Team, pair, relay and crew results require the team claim workflow");
        }
        if (
          claim.claim_type === "belongs_to_me" &&
          claim.currently_linked_athlete_id !== null &&
          claim.currently_linked_athlete_id !== claim.athlete_id
        ) {
          throw new Error(
            "This result is linked to another athlete; resolve that identity dispute before reassigning it",
          );
        }
        switch (claim.claim_type) {
          case "belongs_to_me":
            await sql`
              update competition_entries set
                athlete_id = ${claim.athlete_id}, verification_status = 'verified',
                updated_at = now()
              where id = ${claim.entry_id}
            `;
            await sql`
              update competition_results set verification_status = 'verified',
                verified_at = now(), verified_by_user_id = ${context.userId},
                updated_at = now()
              where id = ${claim.result_id}
            `;
            break;
          case "not_me":
            if (claim.currently_linked_athlete_id === claim.athlete_id) {
              await sql`
                update competition_entries set athlete_id = null,
                  verification_status = 'disputed', updated_at = now()
                where id = ${claim.entry_id}
              `;
            }
            await sql`
              update competition_results set verification_status = 'disputed',
                verified_at = now(), verified_by_user_id = ${context.userId},
                updated_at = now()
              where id = ${claim.result_id}
            `;
            break;
          case "correction":
            activeResultId = await applyResultCorrection(
              sql,
              claim.result_id,
              proposedChangesFromEvidence(claim.evidence),
              context.userId,
              claim.id,
            );
            break;
          case "duplicate": {
            const changes = proposedChangesFromEvidence(claim.evidence);
            const duplicateOfResultId = optionalNumber(changes.duplicateOfResultId);
            if (duplicateOfResultId) {
              const targets = await sql<{ id: number }>`
                select id from competition_results
                where id = ${duplicateOfResultId}
                  and id <> ${claim.result_id}
                  and competition_id = ${claim.competition_id}
                  and record_status = 'active'
                limit 1
              `;
              if (!targets[0]) {
                throw new Error("The proposed canonical result is not in this competition");
              }
            }
            await sql`
              update competition_results set
                record_status = ${duplicateOfResultId ? "superseded" : "removed"},
                superseded_by_result_id = ${duplicateOfResultId},
                verification_status = 'rejected',
                verified_at = now(), verified_by_user_id = ${context.userId},
                updated_at = now()
              where id = ${claim.result_id}
            `;
            break;
          }
          default:
            throw new Error(`Unknown result claim type ${claim.claim_type}`);
        }
      }

      const nextStatus =
        data.decision === "approve"
          ? "approved"
          : data.decision === "reject"
            ? "rejected"
            : "under_review";
      await sql`
        update result_claims set
          status = ${nextStatus}, reviewer_note = ${data.note},
          reviewed_by_user_id = ${context.userId}, reviewed_at = now()
        where id = ${claim.id}
      `;
      await closeVerificationCase(
        sql,
        claim.verification_case_id,
        context.userId,
        data.decision,
        data.note,
      );
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: `result_claim.${nextStatus}`,
        entityType: "competition_result",
        entityId: claim.result_id,
        afterData: {
          claimId: claim.id,
          claimType: claim.claim_type,
          activeResultId,
          note: data.note,
        },
      });
      return {
        claimId: claim.id,
        resultId: claim.result_id,
        activeResultId,
        status: nextStatus,
      };
    });
  });

export const reviewOrganisationVerification = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { organisationId: number; decision: ReviewDecisionInput["decision"]; note: string; level?: string }) => {
    const level = input.level?.trim() || "organisation";
    if (!["none", "identity", "organisation", "governing_body", "official_partner"].includes(level)) {
      throw new Error("Unknown organisation verification level");
    }
    return {
      organisationId: Number(input.organisationId),
      level,
      ...reviewDecisionSchema.parse({ decision: input.decision, note: input.note }),
    };
  })
  .handler(async ({ data, context }) => {
    await requirePlatformRole(context.userId, ["super_admin", "admin", "reviewer"]);
    return withSqlTransaction(async (sql) => {
      const organisations = await sql<SqlRow>`
        select * from organisations where id = ${data.organisationId} for update
      `;
      if (!organisations[0]) throw new Error("Organisation not found");
      const verificationStatus =
        data.decision === "approve"
          ? "verified"
          : data.decision === "reject"
            ? "rejected"
            : "pending";
      await sql`
        update organisations set
          verification_status = ${verificationStatus},
          verification_level = case
            when ${data.decision} = 'approve' then ${data.level}
            else verification_level
          end,
          verified_at = case when ${data.decision} = 'approve' then now() else null end,
          verified_by_user_id = case
            when ${data.decision} = 'approve' then ${context.userId}
            else null
          end,
          updated_at = now()
        where id = ${data.organisationId}
      `;
      const cases = await sql<{ id: number }>`
        select id from verification_cases
        where subject_type = 'organisation'
          and subject_id = ${String(data.organisationId)}
        order by opened_at desc limit 1
      `;
      await closeVerificationCase(
        sql,
        cases[0]?.id ?? null,
        context.userId,
        data.decision,
        data.note,
      );
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: `organisation.verification_${verificationStatus}`,
        entityType: "organisation",
        entityId: data.organisationId,
        beforeData: organisations[0],
        afterData: { verificationStatus, level: data.level, note: data.note },
      });
      return { organisationId: data.organisationId, verificationStatus };
    });
  });
