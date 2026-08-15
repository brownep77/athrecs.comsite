import { createServerFn } from "@tanstack/react-start";
import { getSql, type SqlRow } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  athleteClaimSchema,
  athleteConsentSchema,
  athletePreferenceSchema,
  athletePrivateProfileSchema,
  athletePublicEditSchema,
  athletePublicSettingsSchema,
  athleteSportSchema,
  equipmentInputSchema,
  missingResultSchema,
  resultClaimSchema,
} from "./multisport.types";
import {
  athleteAccessAllows,
  requireAthleteAccess,
  requireAthleteCapability,
} from "./access.server";
import { withSqlTransaction } from "./transaction.server";
import {
  addEvidenceItems,
  attachCaseToSubmission,
  createDataSubmission,
  createVerificationCase,
  writeAudit,
  type EvidenceInput,
} from "./workflow.server";

function valueOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

const evidenceTypes = new Set([
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
]);

function evidenceFromUnknown(items: Record<string, unknown>[]): EvidenceInput[] {
  return items.map((item) => ({
    evidenceType:
      typeof item.evidenceType === "string" && evidenceTypes.has(item.evidenceType)
        ? item.evidenceType
        : "other",
    sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : undefined,
    description:
      typeof item.description === "string"
        ? item.description
        : typeof item.note === "string"
          ? item.note
          : undefined,
    isOfficialSource: Boolean(item.isOfficialSource),
  }));
}

export const listMyAthleteProfiles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql`
      select
        l.athlete_id, l.relationship, l.role, l.status, l.verified_at,
        a.slug, a.display_name, a.avatar_url, a.city, a.county, a.country,
        a.athrecs_id, a.bio,
        (select count(*)::int from results r where r.athlete_id = a.id) as legacy_result_count,
        (
          select count(*)::int
          from competition_entries ce
          join competition_results cr
            on cr.entry_id = ce.id
           and cr.record_status = 'active'
          where ce.athlete_id = a.id
        ) as multisport_result_count
      from athlete_user_links l
      join athletes a on a.id = l.athlete_id
      where l.user_id = ${context.userId}
        and l.status in ('pending', 'verified')
      order by case l.status when 'verified' then 0 else 1 end, a.display_name
    `;
  });

export const submitAthleteProfileClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athleteClaimSchema.parse(input))
  .handler(async ({ data, context }) =>
    withSqlTransaction(async (sql) => {
      const athletes = await sql<SqlRow>`
        select id, slug, display_name, city, county, country, club_id,
               source_url, date_of_birth, athrecs_id
        from athletes where id = ${data.athleteId} limit 1
      `;
      const athlete = athletes[0];
      if (!athlete) throw new Error("Athlete profile not found");

      const existing = await sql<{
        status: string;
        verification_case_id: number | null;
        case_status: string | null;
        submission_id: number | null;
      }>`
        select l.status, l.verification_case_id,
               vc.status as case_status, ds.id as submission_id
        from athlete_user_links l
        left join verification_cases vc on vc.id = l.verification_case_id
        left join data_submissions ds
          on ds.verification_case_id = l.verification_case_id
         and ds.submission_type = 'athlete_claim'
        where l.athlete_id = ${data.athleteId}
          and l.user_id = ${context.userId}
          and l.relationship = ${data.relationship}
        order by ds.created_at desc nulls last
        limit 1
      `;
      if (existing[0]?.status === "verified") {
        return {
          athleteId: data.athleteId,
          status: "verified" as const,
          alreadyLinked: true,
        };
      }
      if (
        existing[0]?.status === "pending" &&
        existing[0].case_status !== "needs_information"
      ) {
        return {
          athleteId: data.athleteId,
          status: "pending" as const,
          verificationCaseId: existing[0].verification_case_id,
          alreadyLinked: true,
          resubmitted: false,
        };
      }
      if (
        existing[0]?.status === "pending" &&
        existing[0].case_status === "needs_information"
      ) {
        const submissionId = existing[0].submission_id;
        const caseId = existing[0].verification_case_id;
        if (!submissionId || !caseId) {
          throw new Error("The athlete claim needs information but its review record is incomplete");
        }
        await sql`
          update data_submissions set
            payload = ${JSON.stringify(data)}::jsonb,
            status = 'submitted', submitted_at = now(),
            reviewer_note = null, reviewed_at = null,
            reviewed_by_user_id = null, applied_at = null, updated_at = now()
          where id = ${submissionId}
            and submitted_by_user_id = ${context.userId}
        `;
        await sql`
          update verification_cases set
            status = 'open', decision = null, decision_note = null,
            reviewed_at = null, closed_at = null, updated_at = now()
          where id = ${caseId}
        `;
        await sql`
          update athlete_user_links set
            role = ${data.requestedRole}, updated_at = now()
          where athlete_id = ${data.athleteId}
            and user_id = ${context.userId}
            and relationship = ${data.relationship}
            and status = 'pending'
        `;
        await addEvidenceItems(sql, {
          subjectType: "athlete_claim",
          subjectId: String(submissionId),
          addedByUserId: context.userId,
          evidence: evidenceFromUnknown(data.evidence),
        });
        await writeAudit(sql, {
          actorUserId: context.userId,
          action: "athlete.claim_resubmitted",
          entityType: "athlete",
          entityId: data.athleteId,
          afterData: {
            submissionId,
            verificationCaseId: caseId,
            relationship: data.relationship,
            requestedRole: data.requestedRole,
            evidenceCount: data.evidence.length,
            noteProvided: Boolean(data.note),
          },
        });
        return {
          athleteId: data.athleteId,
          submissionId,
          verificationCaseId: caseId,
          status: "pending" as const,
          alreadyLinked: true,
          resubmitted: true,
        };
      }

      const existingSelfOwners =
        data.relationship === "self" && data.requestedRole === "owner"
          ? await sql<{ user_id: string }>`
              select user_id from athlete_user_links
              where athlete_id = ${data.athleteId}
                and relationship = 'self'
                and role = 'owner'
                and status = 'verified'
                and user_id <> ${context.userId}
              limit 1
            `
          : [];
      const existingOwnerConflict = Boolean(existingSelfOwners[0]);

      const submissionId = await createDataSubmission(sql, {
        submissionType: "athlete_claim",
        targetType: "athlete",
        targetId: String(data.athleteId),
        athleteId: data.athleteId,
        submittedByUserId: context.userId,
        payload: data,
        currentSnapshot: athlete,
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "athlete_claim",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Verify ${data.relationship} claim for ${String(athlete.display_name)}`,
        priority:
          existingOwnerConflict || data.relationship !== "self" ? "high" : "normal",
        riskFlags: [
          ...(data.relationship === "self"
            ? []
            : ["delegated_or_child_profile_access"]),
          ...(existingOwnerConflict ? ["existing_verified_self_owner"] : []),
        ],
      });
      await attachCaseToSubmission(sql, submissionId, caseId);

      await sql`
        insert into athlete_user_links (
          athlete_id, user_id, relationship, role, status, permissions,
          verification_case_id, updated_at
        ) values (
          ${data.athleteId}, ${context.userId}, ${data.relationship},
          ${data.requestedRole}, ${"pending"}, ${JSON.stringify({})}::jsonb,
          ${caseId}, now()
        )
        on conflict (athlete_id, user_id, relationship) do update set
          role = excluded.role,
          status = 'pending',
          verification_case_id = excluded.verification_case_id,
          updated_at = now()
      `;

      await addEvidenceItems(sql, {
        subjectType: "athlete_claim",
        subjectId: String(submissionId),
        addedByUserId: context.userId,
        evidence: evidenceFromUnknown(data.evidence),
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.claim_submitted",
        entityType: "athlete",
        entityId: data.athleteId,
        afterData: { submissionId, verificationCaseId: caseId, ...data },
      });
      return {
        athleteId: data.athleteId,
        submissionId,
        verificationCaseId: caseId,
        status: "pending" as const,
        alreadyLinked: false,
        existingOwnerConflict,
      };
    }),
  );

export const getAthleteBackend = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { athleteId: number }) => ({ athleteId: Number(input.athleteId) }))
  .handler(async ({ data, context }) => {
    const access = await requireAthleteAccess(context.userId, data.athleteId, [
      "owner",
      "editor",
      "contributor",
      "viewer",
    ]);
    const canViewPrivateProfile = athleteAccessAllows(
      access,
      "view_private_profile",
    );
    const canViewIdentifiers = athleteAccessAllows(access, "view_identifiers");
    const canViewEquipment = athleteAccessAllows(access, "view_equipment");
    const canViewCommercialData = athleteAccessAllows(
      access,
      "view_commercial_data",
    );
    const canViewConsents = athleteAccessAllows(access, "view_consents");
    const canViewWorkflow =
      canViewPrivateProfile || access.permissions.view_verification_workflow === true;

    const sql = await getSql();
    const athleteRows = await sql`
      select
        a.id, a.slug, a.display_name, a.gender, a.club_id, a.city, a.county,
        a.country, a.bio, a.created_at, a.given_name, a.family_name, a.nation,
        a.continent, a.commonwealth, a.preferred_distance, a.athrecs_id,
        a.avatar_url, a.source_url,
        c.name as club_name, c.slug as club_slug,
        s.profile_visibility, s.location_visibility,
        s.date_of_birth_visibility, s.upcoming_events_visibility,
        s.equipment_visibility, s.allow_follows,
        s.allow_contact_requests, s.show_verified_badges,
        s.settings as public_settings
      from athletes a
      left join clubs c on c.id = a.club_id
      left join athlete_public_settings s on s.athlete_id = a.id
      where a.id = ${data.athleteId}
      limit 1
    `;
    if (!athleteRows[0]) throw new Error("Athlete not found");

    const privateProfile = canViewPrivateProfile
      ? await sql`
          select
            app.*,
            a.date_of_birth as legacy_date_of_birth,
            a.race_entry_name as legacy_race_entry_name,
            a.default_category as legacy_default_category,
            a.default_bib as legacy_default_bib,
            a.ea_number as legacy_governing_body_number
          from athletes a
          left join athlete_private_profiles app on app.athlete_id = a.id
          where a.id = ${data.athleteId}
          limit 1
        `
      : [];
    const sports = canViewPrivateProfile
      ? await sql`
          select asp.*, s.code as sport_code, s.name as sport_name,
                 d.code as discipline_code, d.name as discipline_name,
                 sf.code as preferred_surface_code, sf.name as preferred_surface_name
          from athlete_sports asp
          join sports s on s.id = asp.sport_id
          left join disciplines d on d.id = asp.discipline_id
          left join surfaces sf on sf.id = asp.preferred_surface_id
          where asp.athlete_id = ${data.athleteId}
          order by asp.is_primary desc, s.name, d.name
        `
      : await sql`
          select
            asp.athlete_id, asp.sport_id, asp.discipline_id, asp.is_primary,
            asp.participation_level, asp.status, asp.started_on, asp.ended_on,
            asp.preferred_surface_id, asp.preferred_distance_value,
            asp.preferred_distance_unit, asp.public_notes,
            asp.created_at, asp.updated_at,
            s.code as sport_code, s.name as sport_name,
            d.code as discipline_code, d.name as discipline_name,
            sf.code as preferred_surface_code, sf.name as preferred_surface_name
          from athlete_sports asp
          join sports s on s.id = asp.sport_id
          left join disciplines d on d.id = asp.discipline_id
          left join surfaces sf on sf.id = asp.preferred_surface_id
          where asp.athlete_id = ${data.athleteId}
          order by asp.is_primary desc, s.name, d.name
        `;
    const identifiers = canViewIdentifiers
      ? await sql`
          select * from athlete_identifiers
          where athlete_id = ${data.athleteId}
          order by status = 'verified' desc, issuing_body, identifier_type
        `
      : [];
    const memberships = canViewIdentifiers
      ? await sql`
          select am.*, s.name as sport_name, c.name as club_name,
                 t.name as team_name, o.name as organisation_name
          from athlete_memberships am
          left join sports s on s.id = am.sport_id
          left join clubs c on c.id = am.club_id
          left join teams t on t.id = am.team_id
          left join organisations o on o.id = am.organisation_id
          where am.athlete_id = ${data.athleteId}
          order by am.is_primary desc, am.status, am.start_date desc nulls last
        `
      : await sql`
          select
            am.id, am.athlete_id, am.sport_id, am.club_id, am.team_id,
            am.organisation_id, am.membership_type, am.start_date, am.end_date,
            am.is_primary, am.status, am.verification_status,
            am.created_at, am.updated_at,
            s.name as sport_name, c.name as club_name,
            t.name as team_name, o.name as organisation_name
          from athlete_memberships am
          left join sports s on s.id = am.sport_id
          left join clubs c on c.id = am.club_id
          left join teams t on t.id = am.team_id
          left join organisations o on o.id = am.organisation_id
          where am.athlete_id = ${data.athleteId}
          order by am.is_primary desc, am.status, am.start_date desc nulls last
        `;
    const activity = await sql`
      select * from athlete_activity_breakdown_all_v
      where athlete_id = ${data.athleteId}
      order by latest_entry_at desc nulls last, sport_name, discipline_name
    `;
    const activityRecords = await sql`
      select * from athlete_activity_all_v
      where athlete_id = ${data.athleteId}
      order by event_start_at desc nulls last, activity_key
      limit 5000
    `;
    const equipment = canViewEquipment
      ? canViewCommercialData
        ? await sql`
            select ae.*, p.name as product_name, p.brand as product_brand,
                   s.name as sport_name,
                   (select count(*)::int from equipment_usage eu where eu.equipment_id = ae.id) as usage_count
            from athlete_equipment ae
            left join products p on p.id = ae.product_id
            left join sports s on s.id = ae.sport_id
            where ae.athlete_id = ${data.athleteId}
            order by case ae.status when 'active' then 0 when 'wishlist' then 1 else 2 end,
                     ae.purchase_date desc nulls last, ae.created_at desc
          `
        : await sql`
            select
              ae.id, ae.athlete_id, ae.product_id, ae.sport_id, ae.category,
              ae.brand, ae.model, ae.variant, ae.size, ae.colour,
              ae.ownership_type, ae.status, ae.visibility, ae.disclosure,
              ae.usage_distance, ae.usage_distance_unit, ae.usage_hours,
              ae.usage_sessions, ae.usage_events, ae.athlete_rating,
              ae.replacement_due_at, ae.created_at, ae.updated_at,
              p.name as product_name, p.brand as product_brand,
              s.name as sport_name,
              (select count(*)::int from equipment_usage eu where eu.equipment_id = ae.id) as usage_count
            from athlete_equipment ae
            left join products p on p.id = ae.product_id
            left join sports s on s.id = ae.sport_id
            where ae.athlete_id = ${data.athleteId}
            order by case ae.status when 'active' then 0 when 'wishlist' then 1 else 2 end,
                     ae.created_at desc
          `
      : [];
    const equipmentSummary = canViewCommercialData
      ? await sql`
          select * from athlete_equipment_summary_v
          where athlete_id = ${data.athleteId}
          order by category, brand
        `
      : [];
    const preferences = canViewCommercialData
      ? await sql`
          select ap.*, s.name as sport_name
          from athlete_preferences ap
          left join sports s on s.id = ap.sport_id
          where ap.athlete_id = ${data.athleteId}
          order by ap.preference_type, s.name nulls first
        `
      : [];
    const consents = canViewConsents
      ? await sql`
          select * from athlete_consents
          where athlete_id = ${data.athleteId}
          order by purpose, channel
        `
      : [];
    const genericResults = await sql`
      select
        cr.id, cr.result_status, cr.rank_overall, cr.rank_category,
        cr.rank_gender, cr.performance_value, cr.performance_unit,
        cr.performance_display, cr.points, cr.score_for, cr.score_against,
        cr.outcome, cr.verification_status, cr.source_url, cr.published_at,
        ec.name as competition_name, ec.result_model, ec.distance_value,
        ec.distance_unit, coalesce(ec.start_at, eo.start_at) as start_at,
        e.name as event_name, e.slug as event_slug,
        sp.name as sport_name, d.name as discipline_name, sf.name as surface_name,
        coalesce(eo.country_code, v.country_code) as country_code,
        coalesce(eo.nation, v.nation, e.country) as nation,
        coalesce(eo.region, v.region) as region,
        coalesce(eo.county, v.county, e.county) as county,
        coalesce(eo.district, v.district, e.area) as district,
        coalesce(eo.city, v.city, e.city) as city,
        v.name as venue_name
      from competition_entries ce
      join competition_results cr
        on cr.entry_id = ce.id
       and cr.record_status = 'active'
      join event_competitions ec on ec.id = cr.competition_id
      join event_occurrences eo on eo.id = ec.occurrence_id
      join events e on e.id = eo.event_id
      join sports sp on sp.id = ec.sport_id
      left join disciplines d on d.id = ec.discipline_id
      left join surfaces sf on sf.id = ec.surface_id
      left join venues v on v.id = coalesce(ec.venue_id, eo.venue_id)
      where ce.athlete_id = ${data.athleteId}
      order by coalesce(ec.start_at, eo.start_at) desc nulls last, cr.id desc
    `;
    const legacyResults = await sql`
      select
        r.id, r.status, r.finish_time_seconds, r.chip_time_seconds,
        r.gun_time_seconds, r.overall_place, r.gender_place,
        r.category, r.category_place, r.age_grade_pct, r.result_source,
        r.source_url, ed.event_date, ed.distance_code, ed.distance_km,
        e.name as event_name, e.slug as event_slug, e.sport, e.surface,
        e.country as nation, e.county, e.area as district, e.city
      from results r
      join editions ed on ed.id = r.edition_id
      join events e on e.id = ed.event_id
      where r.athlete_id = ${data.athleteId}
      order by ed.event_date desc, r.id desc
    `;
    const claims = canViewWorkflow
      ? await sql`
          select rc.*, vc.status as verification_case_status,
                 vc.decision, vc.decision_note
          from result_claims rc
          left join verification_cases vc on vc.id = rc.verification_case_id
          where rc.athlete_id = ${data.athleteId}
          order by rc.submitted_at desc
        `
      : [];
    const submissions = canViewWorkflow
      ? await sql`
          select id, submission_type, target_type, target_id, status,
                 reviewer_note, submitted_at, reviewed_at, applied_at, created_at
          from data_submissions
          where athlete_id = ${data.athleteId}
          order by created_at desc
          limit 200
        `
      : [];

    return {
      access,
      capabilities: {
        canViewPrivateProfile,
        canViewIdentifiers,
        canViewEquipment,
        canViewCommercialData,
        canViewConsents,
        canViewWorkflow,
      },
      athlete: athleteRows[0],
      privateProfile: privateProfile[0] ?? null,
      sports,
      identifiers,
      memberships,
      activity,
      activityRecords,
      genericResults,
      legacyResults,
      equipment,
      equipmentSummary,
      preferences,
      consents,
      claims,
      submissions,
    };
  });

export const saveAthletePrivateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athletePrivateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteCapability(
      context.userId,
      data.athleteId,
      "edit_private_profile",
      ["owner", "editor"],
    );
    return withSqlTransaction(async (sql) => {
      const before = await sql<{ profile_completeness: number }>`
        select profile_completeness
        from athlete_private_profiles
        where athlete_id = ${data.athleteId}
      `;

      const supplied = {
        legalGivenName: hasOwn(data, "legalGivenName"),
        legalMiddleNames: hasOwn(data, "legalMiddleNames"),
        legalFamilyName: hasOwn(data, "legalFamilyName"),
        preferredName: hasOwn(data, "preferredName"),
        dateOfBirth: hasOwn(data, "dateOfBirth"),
        competitionSex: hasOwn(data, "competitionSex"),
        nationality: hasOwn(data, "nationality"),
        countryOfResidence: hasOwn(data, "countryOfResidence"),
        primaryEmail: hasOwn(data, "primaryEmail"),
        mobilePhone: hasOwn(data, "mobilePhone"),
        address: hasOwn(data, "address"),
        emergencyContact: hasOwn(data, "emergencyContact"),
        raceEntryProfile: hasOwn(data, "raceEntryProfile"),
        accessibilityRequirements: hasOwn(data, "accessibilityRequirements"),
        profileCompleteness: hasOwn(data, "profileCompleteness"),
      };

      await sql`
        insert into athlete_private_profiles (
          athlete_id, legal_given_name, legal_middle_names, legal_family_name,
          preferred_name, date_of_birth, competition_sex, nationality,
          country_of_residence, primary_email, mobile_phone, address,
          emergency_contact, race_entry_profile, accessibility_requirements,
          profile_completeness, last_reviewed_at, updated_at
        ) values (
          ${data.athleteId}, ${valueOrNull(data.legalGivenName)},
          ${valueOrNull(data.legalMiddleNames)}, ${valueOrNull(data.legalFamilyName)},
          ${valueOrNull(data.preferredName)}, ${valueOrNull(data.dateOfBirth)}::date,
          ${valueOrNull(data.competitionSex)}, ${valueOrNull(data.nationality)},
          ${valueOrNull(data.countryOfResidence)}, ${valueOrNull(data.primaryEmail)},
          ${valueOrNull(data.mobilePhone)},
          ${JSON.stringify(data.address ?? {})}::jsonb,
          ${JSON.stringify(data.emergencyContact ?? {})}::jsonb,
          ${JSON.stringify(data.raceEntryProfile ?? {})}::jsonb,
          ${JSON.stringify(data.accessibilityRequirements ?? {})}::jsonb,
          ${data.profileCompleteness ?? 0}, now(), now()
        )
        on conflict (athlete_id) do update set
          legal_given_name = case when ${supplied.legalGivenName} then excluded.legal_given_name else athlete_private_profiles.legal_given_name end,
          legal_middle_names = case when ${supplied.legalMiddleNames} then excluded.legal_middle_names else athlete_private_profiles.legal_middle_names end,
          legal_family_name = case when ${supplied.legalFamilyName} then excluded.legal_family_name else athlete_private_profiles.legal_family_name end,
          preferred_name = case when ${supplied.preferredName} then excluded.preferred_name else athlete_private_profiles.preferred_name end,
          date_of_birth = case when ${supplied.dateOfBirth} then excluded.date_of_birth else athlete_private_profiles.date_of_birth end,
          competition_sex = case when ${supplied.competitionSex} then excluded.competition_sex else athlete_private_profiles.competition_sex end,
          nationality = case when ${supplied.nationality} then excluded.nationality else athlete_private_profiles.nationality end,
          country_of_residence = case when ${supplied.countryOfResidence} then excluded.country_of_residence else athlete_private_profiles.country_of_residence end,
          primary_email = case when ${supplied.primaryEmail} then excluded.primary_email else athlete_private_profiles.primary_email end,
          mobile_phone = case when ${supplied.mobilePhone} then excluded.mobile_phone else athlete_private_profiles.mobile_phone end,
          address = case when ${supplied.address} then excluded.address else athlete_private_profiles.address end,
          emergency_contact = case when ${supplied.emergencyContact} then excluded.emergency_contact else athlete_private_profiles.emergency_contact end,
          race_entry_profile = case when ${supplied.raceEntryProfile} then excluded.race_entry_profile else athlete_private_profiles.race_entry_profile end,
          accessibility_requirements = case when ${supplied.accessibilityRequirements} then excluded.accessibility_requirements else athlete_private_profiles.accessibility_requirements end,
          profile_completeness = case when ${supplied.profileCompleteness} then excluded.profile_completeness else athlete_private_profiles.profile_completeness end,
          last_reviewed_at = now(),
          updated_at = now()
      `;
      const after = await sql<{ profile_completeness: number }>`
        select profile_completeness
        from athlete_private_profiles
        where athlete_id = ${data.athleteId}
      `;
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.private_profile_updated",
        entityType: "athlete_private_profile",
        entityId: data.athleteId,
        beforeData: before[0] ?? null,
        // Private field values are deliberately excluded from the audit payload.
        afterData: {
          profileCompleteness: after[0]?.profile_completeness ?? 0,
          changedFields: Object.entries(supplied)
            .filter(([, wasSupplied]) => wasSupplied)
            .map(([field]) => field),
        },
      });
      return { athleteId: data.athleteId, saved: true };
    });
  });

export const saveAthletePublicSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athletePublicSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteCapability(
      context.userId,
      data.athleteId,
      "manage_public_settings",
      ["owner", "editor"],
    );
    const sql = await getSql();
    await sql`
      insert into athlete_public_settings (
        athlete_id, profile_visibility, location_visibility,
        date_of_birth_visibility, upcoming_events_visibility,
        equipment_visibility, allow_follows, allow_contact_requests,
        show_verified_badges, settings, updated_at
      ) values (
        ${data.athleteId}, ${data.profileVisibility}, ${data.locationVisibility},
        ${data.dateOfBirthVisibility}, ${data.upcomingEventsVisibility},
        ${data.equipmentVisibility}, ${data.allowFollows},
        ${data.allowContactRequests}, ${data.showVerifiedBadges},
        ${JSON.stringify(data.settings)}::jsonb, now()
      )
      on conflict (athlete_id) do update set
        profile_visibility = excluded.profile_visibility,
        location_visibility = excluded.location_visibility,
        date_of_birth_visibility = excluded.date_of_birth_visibility,
        upcoming_events_visibility = excluded.upcoming_events_visibility,
        equipment_visibility = excluded.equipment_visibility,
        allow_follows = excluded.allow_follows,
        allow_contact_requests = excluded.allow_contact_requests,
        show_verified_badges = excluded.show_verified_badges,
        settings = excluded.settings,
        updated_at = now()
    `;
    return { athleteId: data.athleteId, saved: true };
  });

export const saveAthleteSport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athleteSportSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteAccess(context.userId, data.athleteId, ["owner", "editor"]);
    return withSqlTransaction(async (sql) => {
      if (data.isPrimary) {
        await sql`
          update athlete_sports set is_primary = false, updated_at = now()
          where athlete_id = ${data.athleteId}
        `;
      }
      const updated = await sql<{ athlete_id: number }>`
        update athlete_sports set
          is_primary = ${data.isPrimary},
          participation_level = ${data.participationLevel},
          status = ${data.status},
          started_on = ${valueOrNull(data.startedOn)}::date,
          ended_on = ${valueOrNull(data.endedOn)}::date,
          preferred_surface_id = ${data.preferredSurfaceId ?? null},
          preferred_distance_value = ${data.preferredDistanceValue ?? null},
          preferred_distance_unit = ${valueOrNull(data.preferredDistanceUnit)},
          public_notes = ${valueOrNull(data.publicNotes)},
          private_data = ${JSON.stringify(data.privateData)}::jsonb,
          updated_at = now()
        where athlete_id = ${data.athleteId}
          and sport_id = ${data.sportId}
          and discipline_id is not distinct from ${data.disciplineId ?? null}
        returning athlete_id
      `;
      if (!updated[0]) {
        await sql`
          insert into athlete_sports (
            athlete_id, sport_id, discipline_id, is_primary,
            participation_level, status, started_on, ended_on,
            preferred_surface_id, preferred_distance_value,
            preferred_distance_unit, public_notes, private_data
          ) values (
            ${data.athleteId}, ${data.sportId}, ${data.disciplineId ?? null},
            ${data.isPrimary}, ${data.participationLevel}, ${data.status},
            ${valueOrNull(data.startedOn)}::date, ${valueOrNull(data.endedOn)}::date,
            ${data.preferredSurfaceId ?? null},
            ${data.preferredDistanceValue ?? null},
            ${valueOrNull(data.preferredDistanceUnit)},
            ${valueOrNull(data.publicNotes)}, ${JSON.stringify(data.privateData)}::jsonb
          )
        `;
      }
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.sport_saved",
        entityType: "athlete_sport",
        entityId: `${data.athleteId}:${data.sportId}:${data.disciplineId ?? "all"}`,
        afterData: data,
      });
      return { athleteId: data.athleteId, saved: true };
    });
  });

export const submitAthletePublicEdit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athletePublicEditSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteAccess(context.userId, data.athleteId, ["owner", "editor"]);
    return withSqlTransaction(async (sql) => {
      const current = await sql`
        select id, slug, display_name, gender, city, county, country, bio,
               avatar_url, nation, preferred_distance, source_url
        from athletes where id = ${data.athleteId} limit 1
      `;
      if (!current[0]) throw new Error("Athlete not found");
      const submissionId = await createDataSubmission(sql, {
        submissionType: "athlete_public_edit",
        targetType: "athlete",
        targetId: String(data.athleteId),
        athleteId: data.athleteId,
        submittedByUserId: context.userId,
        payload: { changes: data.changes, reason: data.reason },
        currentSnapshot: current[0],
        sourceUrl: valueOrNull(data.sourceUrl),
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "athlete_edit",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Review athlete profile edit for ${String(current[0].display_name)}`,
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      if (data.sourceUrl) {
        await addEvidenceItems(sql, {
          subjectType: "athlete_edit",
          subjectId: String(submissionId),
          addedByUserId: context.userId,
          evidence: [
            {
              evidenceType: "website",
              sourceUrl: data.sourceUrl,
              description: data.reason,
            },
          ],
        });
      }
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.public_edit_submitted",
        entityType: "athlete",
        entityId: data.athleteId,
        beforeData: current[0],
        afterData: { submissionId, verificationCaseId: caseId, changes: data.changes },
      });
      return { submissionId, verificationCaseId: caseId, status: "submitted" as const };
    });
  });

export const submitResultClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => resultClaimSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteAccess(context.userId, data.athleteId, [
      "owner",
      "editor",
      "contributor",
    ]);
    return withSqlTransaction(async (sql) => {
      const results = await sql<{
        id: number;
        linked_athlete_id: number | null;
        participant_kind: string;
        display_name: string | null;
        competition_name: string;
        event_name: string;
      }>`
        select cr.id, ce.athlete_id as linked_athlete_id, ce.display_name,
               ec.participant_kind, ec.name as competition_name,
               e.name as event_name
        from competition_results cr
        join competition_entries ce on ce.id = cr.entry_id
        join event_competitions ec on ec.id = cr.competition_id
        join event_occurrences eo on eo.id = ec.occurrence_id
        join events e on e.id = eo.event_id
        where cr.id = ${data.resultId}
          and cr.record_status = 'active'
        limit 1
      `;
      const result = results[0];
      if (!result) throw new Error("Active result not found");

      if (
        ["not_me", "correction", "duplicate"].includes(data.claimType) &&
        result.linked_athlete_id !== data.athleteId
      ) {
        throw new Error(
          "Only the athlete currently linked to a result can dispute or correct it",
        );
      }
      if (
        data.claimType === "belongs_to_me" &&
        !["individual", "mixed"].includes(result.participant_kind)
      ) {
        throw new Error(
          "Team, pair, relay and crew results must be claimed through the team or organiser workflow",
        );
      }

      const claimEvidence = [
        ...data.evidence,
        ...(data.note ? [{ note: data.note }] : []),
        ...(Object.keys(data.proposedChanges).length
          ? [{ proposedChanges: data.proposedChanges }]
          : []),
      ];
      const existingClaims = await sql<{
        id: number;
        status: string;
        verification_case_id: number | null;
        case_status: string | null;
      }>`
        select rc.id, rc.status, rc.verification_case_id,
               vc.status as case_status
        from result_claims rc
        left join verification_cases vc on vc.id = rc.verification_case_id
        where rc.result_id = ${data.resultId}
          and rc.athlete_id = ${data.athleteId}
          and rc.claim_type = ${data.claimType}
          and rc.submitted_by_user_id = ${context.userId}
        limit 1
        for update of rc
      `;
      const existingClaim = existingClaims[0];
      if (
        existingClaim &&
        ["submitted", "automated_checks", "under_review"].includes(
          existingClaim.status,
        ) &&
        existingClaim.case_status !== "needs_information"
      ) {
        return {
          claimId: existingClaim.id,
          verificationCaseId: existingClaim.verification_case_id,
          status: existingClaim.status,
          alreadySubmitted: true,
          resubmitted: false,
        };
      }
      if (
        existingClaim &&
        existingClaim.case_status === "needs_information" &&
        existingClaim.verification_case_id
      ) {
        await sql`
          update result_claims set
            status = 'submitted', evidence = ${JSON.stringify(claimEvidence)}::jsonb,
            submitted_at = now(), reviewed_at = null,
            reviewed_by_user_id = null, reviewer_note = null
          where id = ${existingClaim.id}
        `;
        await sql`
          update verification_cases set
            status = 'open', decision = null, decision_note = null,
            reviewed_at = null, closed_at = null, updated_at = now()
          where id = ${existingClaim.verification_case_id}
        `;
        await addEvidenceItems(sql, {
          subjectType: "result_claim",
          subjectId: String(existingClaim.id),
          addedByUserId: context.userId,
          evidence: evidenceFromUnknown(data.evidence),
        });
        await writeAudit(sql, {
          actorUserId: context.userId,
          action: "result.claim_resubmitted",
          entityType: "competition_result",
          entityId: data.resultId,
          afterData: {
            claimId: existingClaim.id,
            verificationCaseId: existingClaim.verification_case_id,
            claimType: data.claimType,
            evidenceCount: data.evidence.length,
            proposedFieldCount: Object.keys(data.proposedChanges).length,
          },
        });
        return {
          claimId: existingClaim.id,
          verificationCaseId: existingClaim.verification_case_id,
          status: "submitted" as const,
          alreadySubmitted: true,
          resubmitted: true,
        };
      }

      const rows = await sql<{ id: number }>`
        insert into result_claims (
          result_id, athlete_id, submitted_by_user_id, claim_type, status,
          evidence, verification_case_id
        ) values (
          ${data.resultId}, ${data.athleteId}, ${context.userId},
          ${data.claimType}, ${"submitted"},
          ${JSON.stringify(claimEvidence)}::jsonb,
          ${null}
        )
        on conflict (result_id, athlete_id, claim_type, submitted_by_user_id)
        do update set
          status = 'submitted',
          evidence = excluded.evidence,
          verification_case_id = null,
          submitted_at = now(),
          reviewed_at = null,
          reviewed_by_user_id = null,
          reviewer_note = null
        returning id
      `;
      if (!rows[0]) throw new Error("Could not save the result claim");
      const claimId = rows[0].id;
      const caseId = await createVerificationCase(sql, {
        subjectType: "result_claim",
        subjectId: String(claimId),
        openedByUserId: context.userId,
        summary: `${data.claimType} claim for result ${data.resultId}`,
        priority: data.claimType === "not_me" ? "high" : "normal",
      });
      await sql`
        update result_claims
        set verification_case_id = ${caseId}
        where id = ${claimId}
      `;
      await addEvidenceItems(sql, {
        subjectType: "result_claim",
        subjectId: String(claimId),
        addedByUserId: context.userId,
        evidence: evidenceFromUnknown(data.evidence),
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "result.claim_submitted",
        entityType: "competition_result",
        entityId: data.resultId,
        afterData: { claimId, verificationCaseId: caseId, ...data },
      });
      return {
        claimId,
        verificationCaseId: caseId,
        status: "submitted" as const,
      };
    });
  });

export const submitMissingResult = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => missingResultSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteAccess(context.userId, data.athleteId, [
      "owner",
      "editor",
      "contributor",
    ]);
    return withSqlTransaction(async (sql) => {
      const competitions = await sql<{
        id: number;
        name: string;
        event_name: string;
        start_at: string;
        participant_kind: string;
      }>`
        select ec.id, ec.name, e.name as event_name, eo.start_at,
               ec.participant_kind
        from event_competitions ec
        join event_occurrences eo on eo.id = ec.occurrence_id
        join events e on e.id = eo.event_id
        where ec.id = ${data.competitionId}
        limit 1
      `;
      const competition = competitions[0];
      if (!competition) throw new Error("Competition not found");
      if (!["individual", "mixed"].includes(competition.participant_kind)) {
        throw new Error(
          "Missing team, pair, relay and crew results must be submitted by the organiser or team manager",
        );
      }
      const normalizedResult = {
        ...data.result,
        athleteId: data.athleteId,
        teamId: undefined,
        participantKind: "individual" as const,
      };
      const submissionId = await createDataSubmission(sql, {
        submissionType: "missing_result",
        targetType: "result",
        athleteId: data.athleteId,
        submittedByUserId: context.userId,
        payload: {
          athleteId: data.athleteId,
          competitionId: data.competitionId,
          result: normalizedResult,
          note: data.note,
        },
      });
      const caseId = await createVerificationCase(sql, {
        subjectType: "missing_result",
        subjectId: String(submissionId),
        openedByUserId: context.userId,
        summary: `Verify missing result for ${competition.event_name}`,
        priority: data.evidence.length ? "normal" : "high",
        riskFlags: data.evidence.length ? [] : ["evidence_missing"],
      });
      await attachCaseToSubmission(sql, submissionId, caseId);
      await addEvidenceItems(sql, {
        subjectType: "missing_result",
        subjectId: String(submissionId),
        addedByUserId: context.userId,
        evidence: evidenceFromUnknown(data.evidence),
      });
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "result.missing_submitted",
        entityType: "competition",
        entityId: data.competitionId,
        afterData: { submissionId, verificationCaseId: caseId, athleteId: data.athleteId },
      });
      return { submissionId, verificationCaseId: caseId, status: "submitted" as const };
    });
  });

export const addAthleteEquipment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => equipmentInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteCapability(
      context.userId,
      data.athleteId,
      "manage_equipment",
      ["owner", "editor", "contributor"],
    );
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      insert into athlete_equipment (
        athlete_id, product_id, sport_id, category, brand, model, variant,
        size, colour, ownership_type, purchase_date, retailer, purchase_price,
        currency, status, visibility, disclosure, notes, metadata
      ) values (
        ${data.athleteId}, ${data.productId ?? null}, ${data.sportId ?? null},
        ${data.category}, ${valueOrNull(data.brand)}, ${valueOrNull(data.model)},
        ${valueOrNull(data.variant)}, ${valueOrNull(data.size)},
        ${valueOrNull(data.colour)}, ${data.ownershipType},
        ${valueOrNull(data.purchaseDate)}::date, ${valueOrNull(data.retailer)},
        ${data.purchasePrice ?? null}, ${valueOrNull(data.currency)?.toUpperCase() ?? null},
        ${data.status}, ${data.visibility}, ${data.disclosure},
        ${valueOrNull(data.notes)}, ${JSON.stringify(data.metadata)}::jsonb
      )
      returning id
    `;
    if (!rows[0]) throw new Error("Could not save equipment");
    return { equipmentId: rows[0].id, saved: true };
  });

export const saveAthletePreference = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athletePreferenceSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteCapability(
      context.userId,
      data.athleteId,
      "manage_preferences",
      ["owner", "editor"],
    );
    const sql = await getSql();
    const updated = await sql<{ id: number }>`
      update athlete_preferences set
        value_json = ${JSON.stringify(data.value)}::jsonb,
        source_type = 'athlete_declared',
        confidence = 'high',
        visibility = ${data.visibility},
        expires_at = ${valueOrNull(data.expiresAt)}::timestamptz,
        updated_at = now()
      where athlete_id = ${data.athleteId}
        and preference_type = ${data.preferenceType}
        and sport_id is not distinct from ${data.sportId ?? null}
      returning id
    `;
    if (!updated[0]) {
      await sql`
        insert into athlete_preferences (
          athlete_id, preference_type, sport_id, value_json, source_type,
          confidence, visibility, expires_at
        ) values (
          ${data.athleteId}, ${data.preferenceType}, ${data.sportId ?? null},
          ${JSON.stringify(data.value)}::jsonb, ${"athlete_declared"},
          ${"high"}, ${data.visibility}, ${valueOrNull(data.expiresAt)}::timestamptz
        )
      `;
    }
    return { athleteId: data.athleteId, saved: true };
  });

export const saveAthleteConsent = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athleteConsentSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAthleteCapability(
      context.userId,
      data.athleteId,
      "manage_consents",
      ["owner"],
    );
    return withSqlTransaction(async (sql) => {
      const before = await sql<{
        status: string;
        lawful_basis: string | null;
        policy_version: string | null;
        expires_at: string | null;
      }>`
        select status, lawful_basis, policy_version, expires_at
        from athlete_consents
        where athlete_id = ${data.athleteId}
          and purpose = ${data.purpose}
          and channel = ${data.channel}
        limit 1
      `;
      const now = new Date().toISOString();
      await sql`
        insert into athlete_consents (
          athlete_id, user_id, purpose, channel, status, lawful_basis,
          policy_version, source, granted_at, withdrawn_at, expires_at,
          evidence, updated_at
        ) values (
          ${data.athleteId}, ${context.userId}, ${data.purpose}, ${data.channel},
          ${data.status}, ${data.lawfulBasis ?? null},
          ${valueOrNull(data.policyVersion)}, ${"athrecs"},
          ${data.status === "granted" ? now : null}::timestamptz,
          ${data.status === "withdrawn" ? now : null}::timestamptz,
          ${valueOrNull(data.expiresAt)}::timestamptz,
          ${JSON.stringify(data.evidence)}::jsonb, now()
        )
        on conflict (athlete_id, purpose, channel) do update set
          user_id = excluded.user_id,
          status = excluded.status,
          lawful_basis = excluded.lawful_basis,
          policy_version = excluded.policy_version,
          granted_at = case
            when excluded.status = 'granted' then now()
            else athlete_consents.granted_at
          end,
          withdrawn_at = case
            when excluded.status = 'withdrawn' then now()
            else null
          end,
          expires_at = excluded.expires_at,
          evidence = excluded.evidence,
          updated_at = now()
      `;
      await writeAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.consent_updated",
        entityType: "athlete_consent",
        entityId: `${data.athleteId}:${data.purpose}:${data.channel}`,
        beforeData: before[0] ?? null,
        afterData: {
          status: data.status,
          lawfulBasis: data.lawfulBasis ?? null,
          policyVersion: data.policyVersion ?? null,
          expiresAt: data.expiresAt ?? null,
        },
      });
      return { athleteId: data.athleteId, saved: true };
    });
  });

