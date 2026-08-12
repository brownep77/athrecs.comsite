import type { Sql } from "@/lib/db";
import { makeId } from "./verification";
import {
  asArray,
  asObject,
  booleanValue,
  json,
  numberValue,
  resolveDiscipline,
  resolveSport,
  text,
  type ApprovedItem,
  type SubmissionRecord,
} from "./application-common.server";

export async function applyAthleteEdit(
  sql: Sql,
  submission: SubmissionRecord,
  item: ApprovedItem,
  reviewerUserId: string,
): Promise<string> {
  const change = asObject(item.normalized_data, "normalised athlete edit");
  const athleteId = numberValue(change.athleteId) ?? submission.athlete_id;
  if (!athleteId) throw new Error("Athlete edit is missing athleteId");

  if (change.publicProfile) {
    const profile = asObject(change.publicProfile, "public athlete profile");
    const map: Record<string, string> = {
      displayName: "display_name",
      givenName: "given_name",
      familyName: "family_name",
      gender: "gender",
      city: "city",
      county: "county",
      country: "country",
      nation: "nation",
      bio: "bio",
      avatarUrl: "avatar_url",
    };
    const values: unknown[] = [];
    const assignments: string[] = [];
    for (const [inputKey, column] of Object.entries(map)) {
      if (!(inputKey in profile)) continue;
      values.push(profile[inputKey] ?? null);
      assignments.push(`${column} = $${values.length}`);
    }
    if (assignments.length) {
      assignments.push("updated_at = now()");
      values.push(athleteId);
      await sql.query(
        `update athletes set ${assignments.join(", ")} where id = $${values.length}`,
        values,
      );
    }
  }

  if (change.privateProfile) {
    const profile = asObject(change.privateProfile, "private athlete profile");
    await sql`
      insert into athlete_private_profiles (
        athlete_id, legal_given_name, legal_family_name, preferred_name,
        date_of_birth, nationality_codes, contact_details, address,
        emergency_contact, race_entry_passport, visibility_settings,
        last_reviewed_at, updated_at
      ) values (
        ${athleteId}, ${text(profile.legalGivenName)}, ${text(profile.legalFamilyName)},
        ${text(profile.preferredName)}, ${text(profile.dateOfBirth)}::date,
        ${json(profile.nationalityCodes ?? [])}::jsonb,
        ${json(profile.contactDetails ?? {})}::jsonb,
        ${json(profile.address ?? {})}::jsonb,
        ${json(profile.emergencyContact ?? {})}::jsonb,
        ${json(profile.raceEntryPassport ?? {})}::jsonb,
        ${json(profile.visibilitySettings ?? {})}::jsonb, now(), now()
      )
      on conflict (athlete_id) do update set
        legal_given_name = coalesce(excluded.legal_given_name, athlete_private_profiles.legal_given_name),
        legal_family_name = coalesce(excluded.legal_family_name, athlete_private_profiles.legal_family_name),
        preferred_name = coalesce(excluded.preferred_name, athlete_private_profiles.preferred_name),
        date_of_birth = coalesce(excluded.date_of_birth, athlete_private_profiles.date_of_birth),
        nationality_codes = case
          when excluded.nationality_codes = '[]'::jsonb then athlete_private_profiles.nationality_codes
          else excluded.nationality_codes end,
        contact_details = athlete_private_profiles.contact_details || excluded.contact_details,
        address = athlete_private_profiles.address || excluded.address,
        emergency_contact = athlete_private_profiles.emergency_contact || excluded.emergency_contact,
        race_entry_passport = athlete_private_profiles.race_entry_passport || excluded.race_entry_passport,
        visibility_settings = athlete_private_profiles.visibility_settings || excluded.visibility_settings,
        last_reviewed_at = now(),
        updated_at = now()
    `;
  }

  for (const rawSport of asArray(change.sports)) {
    const athleteSport = asObject(rawSport, "athlete sport");
    const sportSlug = text(athleteSport.sportSlug);
    if (!sportSlug) throw new Error("Athlete sport is missing sportSlug");
    const sport = await resolveSport(sql, sportSlug);
    const disciplineId = await resolveDiscipline(
      sql,
      sport.id,
      text(athleteSport.disciplineSlug),
    );
    if (booleanValue(athleteSport.primarySport)) {
      await sql`
        update athlete_sports
        set primary_sport = false, updated_at = now()
        where athlete_id = ${athleteId}
      `;
    }
    const existing = await sql<{ id: number }>`
      select id from athlete_sports
      where athlete_id = ${athleteId}
        and sport_id = ${sport.id}
        and discipline_id is not distinct from ${disciplineId}
      limit 1
    `;
    if (existing[0]) {
      await sql`
        update athlete_sports
        set participation_level = ${text(athleteSport.participationLevel) ?? "recreational"},
            status = ${text(athleteSport.status) ?? "active"},
            primary_sport = ${booleanValue(athleteSport.primarySport) ?? false},
            preferences = ${json(athleteSport.preferences ?? {})}::jsonb,
            updated_at = now()
        where id = ${existing[0].id}
      `;
    } else {
      await sql`
        insert into athlete_sports (
          athlete_id, sport_id, discipline_id, participation_level, status,
          primary_sport, preferences
        ) values (
          ${athleteId}, ${sport.id}, ${disciplineId},
          ${text(athleteSport.participationLevel) ?? "recreational"},
          ${text(athleteSport.status) ?? "active"},
          ${booleanValue(athleteSport.primarySport) ?? false},
          ${json(athleteSport.preferences ?? {})}::jsonb
        )
      `;
    }
  }

  for (const rawEquipment of asArray(change.equipment)) {
    const equipment = asObject(rawEquipment, "athlete equipment");
    const equipmentId = text(equipment.id);
    const category = text(equipment.category);
    if (!equipmentId || !category) {
      throw new Error("Athlete equipment needs a stable id and category");
    }
    const sportSlug = text(equipment.sportSlug);
    const sportId = sportSlug ? (await resolveSport(sql, sportSlug)).id : null;
    const rows = await sql<{ id: string }>`
      insert into athlete_equipment (
        id, athlete_id, product_id, sport_id, category, brand, model,
        variant, size, acquisition_type, purchase_date, retailer, price_minor,
        currency, usage_total, usage_unit, status, visibility,
        sponsored_disclosure, rating, notes, metadata, updated_at
      ) values (
        ${equipmentId}, ${athleteId}, ${numberValue(equipment.productId)},
        ${sportId}, ${category}, ${text(equipment.brand) ?? ""},
        ${text(equipment.model) ?? ""}, ${text(equipment.variant)},
        ${text(equipment.size)}, ${text(equipment.acquisitionType) ?? "purchased"},
        ${text(equipment.purchaseDate)}::date, ${text(equipment.retailer)},
        ${numberValue(equipment.priceMinor)}, ${text(equipment.currency) ?? "GBP"},
        ${numberValue(equipment.usageTotal)}, ${text(equipment.usageUnit)},
        ${text(equipment.status) ?? "active"},
        ${text(equipment.visibility) ?? "private"},
        ${booleanValue(equipment.sponsoredDisclosure) ?? false},
        ${numberValue(equipment.rating)}, ${text(equipment.notes)},
        ${json(equipment.metadata ?? {})}::jsonb, now()
      )
      on conflict (id) do update set
        product_id = excluded.product_id,
        sport_id = excluded.sport_id,
        category = excluded.category,
        brand = excluded.brand,
        model = excluded.model,
        variant = excluded.variant,
        size = excluded.size,
        acquisition_type = excluded.acquisition_type,
        purchase_date = excluded.purchase_date,
        retailer = excluded.retailer,
        price_minor = excluded.price_minor,
        currency = excluded.currency,
        usage_total = excluded.usage_total,
        usage_unit = excluded.usage_unit,
        status = excluded.status,
        visibility = excluded.visibility,
        sponsored_disclosure = excluded.sponsored_disclosure,
        rating = excluded.rating,
        notes = excluded.notes,
        metadata = excluded.metadata,
        updated_at = now()
      where athlete_equipment.athlete_id = excluded.athlete_id
      returning id
    `;
    if (!rows[0]?.id) {
      throw new Error(`Equipment record ${equipmentId} belongs to another athlete`);
    }
  }

  for (const rawPreference of asArray(change.productPreferences)) {
    const preference = asObject(rawPreference, "athlete product preference");
    const sportSlug = text(preference.sportSlug);
    const category = text(preference.category);
    if (!sportSlug || !category) {
      throw new Error("Product preference needs sportSlug and category");
    }
    const sport = await resolveSport(sql, sportSlug);
    const existing = await sql<{ id: number }>`
      select id from athlete_product_preferences
      where athlete_id = ${athleteId}
        and sport_id = ${sport.id}
        and category = ${category}
      limit 1
    `;
    if (existing[0]) {
      await sql`
        update athlete_product_preferences
        set preference_data = ${json(preference.preferenceData ?? {})}::jsonb,
            source = 'athlete_declared', confidence = 100,
            marketing_use_allowed = ${booleanValue(preference.marketingUseAllowed) ?? false},
            updated_at = now()
        where id = ${existing[0].id}
      `;
    } else {
      await sql`
        insert into athlete_product_preferences (
          athlete_id, sport_id, category, preference_data, source,
          confidence, marketing_use_allowed
        ) values (
          ${athleteId}, ${sport.id}, ${category},
          ${json(preference.preferenceData ?? {})}::jsonb,
          'athlete_declared', 100,
          ${booleanValue(preference.marketingUseAllowed) ?? false}
        )
      `;
    }
  }

  const reviewedGroups = [
    change.publicProfile ? "public_profile" : null,
    change.privateProfile ? "private_profile" : null,
    asArray(change.sports).length ? "sports" : null,
    asArray(change.equipment).length ? "equipment" : null,
    asArray(change.productPreferences).length ? "product_preferences" : null,
  ].filter((value): value is string => Boolean(value));
  const profileDataReviewed = reviewedGroups.some((group) =>
    ["public_profile", "private_profile", "sports"].includes(group),
  );
  if (profileDataReviewed) {
    // Approval verifies the submitted profile fields, not the person's identity.
    // Preserve any stronger identity status already held by the athlete.
    await sql`
      update athletes
      set verification_status = case
            when verification_status in ('verified', 'identity_verified', 'athrecs_verified')
              then verification_status
            else 'profile_reviewed'
          end,
          data_quality_score = greatest(data_quality_score, 80),
          last_verified_at = now(), verified_by_user_id = ${reviewerUserId},
          updated_at = now()
      where id = ${athleteId}
    `;
  }

  await sql`
    insert into athlete_verifications (
      id, athlete_id, verification_type, status, source, evidence, confidence,
      verified_at, verified_by_user_id
    ) values (
      ${makeId("verification")}, ${athleteId}, 'submitted_data_review', 'verified',
      'athrecs_manual_review',
      ${json({ submissionId: submission.id, reviewedGroups })}::jsonb,
      100, now(), ${reviewerUserId}
    )
  `;
  return String(athleteId);
}
