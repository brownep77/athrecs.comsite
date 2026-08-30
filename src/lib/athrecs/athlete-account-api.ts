import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql, dbSource } from "@/lib/db";
import { ensureAthrecsSeeded, ensureDevPreviewAthleteAccount } from "./seed.server";

export const ATHLETE_PRIVACY_VERSION = "athlete-account-2026-08-23";

export const ATHLETE_SPORTS = [
  "Running",
  "Athletics",
  "Trail running",
  "Ultra running",
  "Parkrun",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Cycling",
  "Swimming",
  "Rowing",
  "OCR",
  "Gym and fitness",
  "Walking and hiking",
  "Yoga and mobility",
  "Other",
] as const;

export type AthleteSportCode = (typeof ATHLETE_SPORTS)[number];
export type AthleteExperienceLevel =
  "new" | "recreational" | "club" | "competitive" | "elite" | "coach" | "other";

export type AthleteSportProfile = {
  sportCode: AthleteSportCode;
  isPrimary: boolean;
  experienceLevel: AthleteExperienceLevel | null;
  disciplines: string[];
  preferredDistances: string[];
  preferredSurfaces: string[];
  trainingSessionsPerWeek: number | null;
  trainingHoursPerWeek: number | null;
  weeklyDistanceKm: number | null;
  eventsPerYear: number | null;
  goals: string;
  coachName: string;
};

export type AthleteProductPreferences = {
  equipmentItems: string[];
  equipmentBrands: string[];
  equipmentModels: string[];
  equipmentNotes: string;
  nutritionProducts: string[];
  nutritionBrands: string[];
  nutritionNotes: string;
  technologyDevices: string[];
  technologyApps: string[];
  technologyBrands: string[];
  technologyNotes: string;
  clothingItems: string[];
  clothingBrands: string[];
  clothingSize: string;
  clothingFit: "relaxed" | "regular" | "fitted" | "compression" | "varies" | null;
  clothingNotes: string;
  recoveryProducts: string[];
  recoveryBrands: string[];
  recoveryNotes: string;
  purchaseChannels: string[];
  purchasePriorities: string[];
  annualSportsSpendBand:
    "prefer_not_to_say" | "under_250" | "250_499" | "500_999" | "1000_1999" | "2000_plus" | null;
};

export type AthleteAccountConsents = {
  performanceInsights: boolean;
  personalisation: boolean;
  productResearch: boolean;
  marketing: boolean;
};

export type AthleteAccountData = {
  exists: boolean;
  userId: string;
  verifiedEmail: string;
  emailVerified: boolean;
  authName: string;
  fullName: string;
  displayName: string;
  dateOfBirth: string;
  country: string;
  region: string;
  city: string;
  postcode: string;
  nationality: string;
  clubOrTeam: string;
  preferredLanguage: string;
  previousNames: string[];
  parkrunId: string;
  athleticsUrn: string;
  powerOf10Url: string;
  worldAthleticsUrl: string;
  fingerprintEvent: string;
  fingerprintYear: string;
  fingerprintDistance: string;
  fingerprintTime: string;
  profilePhotoUrl: string;
  profilePhotoUpdatedAt: string | null;
  profilePhotoUploadAvailable: boolean;
  authImageUrl: string;
  privacyAcknowledged: boolean;
  updatedAt: string | null;
  sports: AthleteSportProfile[];
  preferences: AthleteProductPreferences;
  consents: AthleteAccountConsents;
  claimedProfiles: Array<{ athleteId: number; athleteName: string; athleteSlug: string }>;
  claimedResults: Array<{
    resultId: number;
    athleteName: string;
    eventName: string;
    eventSlug: string;
    eventDate: string;
    distanceCode: string;
    finishTimeSeconds: number | null;
    overallPlace: number | null;
    category: string | null;
  }>;
  claimCount: number;
};

export type AthleteAccountInput = {
  fullName: string;
  displayName?: string;
  dateOfBirth?: string;
  country?: string;
  region?: string;
  city?: string;
  postcode?: string;
  nationality?: string;
  clubOrTeam?: string;
  preferredLanguage?: string;
  previousNames?: string[];
  parkrunId?: string;
  athleticsUrn?: string;
  powerOf10Url?: string;
  worldAthleticsUrl?: string;
  fingerprintEvent?: string;
  fingerprintYear?: string;
  fingerprintDistance?: string;
  fingerprintTime?: string;
  privacyAcknowledged: boolean;
  sports: AthleteSportProfile[];
  preferences: AthleteProductPreferences;
  consents: AthleteAccountConsents;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
};

type ProfileRow = {
  full_name: string;
  display_name: string | null;
  date_of_birth: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  postcode: string | null;
  nationality: string | null;
  club_or_team: string | null;
  preferred_language: string | null;
  previous_names: string[] | null;
  parkrun_id: string | null;
  athletics_urn: string | null;
  power_of_10_url: string | null;
  world_athletics_url: string | null;
  fingerprint_event: string | null;
  fingerprint_year: string | null;
  fingerprint_distance: string | null;
  fingerprint_time: string | null;
  privacy_notice_version: string;
  privacy_acknowledged_at: string;
  updated_at: string;
};

type ProfilePhotoRow = {
  updated_at: string;
};

type SportRow = {
  sport_code: AthleteSportCode;
  is_primary: boolean;
  experience_level: AthleteExperienceLevel | null;
  disciplines: string[] | null;
  preferred_distances: string[] | null;
  preferred_surfaces: string[] | null;
  training_sessions_per_week: number | null;
  training_hours_per_week: number | string | null;
  weekly_distance_km: number | string | null;
  events_per_year: number | null;
  goals: string | null;
  coach_name: string | null;
};

type PreferencesRow = {
  equipment_items: string[] | null;
  equipment_brands: string[] | null;
  equipment_models: string[] | null;
  equipment_notes: string | null;
  nutrition_products: string[] | null;
  nutrition_brands: string[] | null;
  nutrition_notes: string | null;
  technology_devices: string[] | null;
  technology_apps: string[] | null;
  technology_brands: string[] | null;
  technology_notes: string | null;
  clothing_items: string[] | null;
  clothing_brands: string[] | null;
  clothing_size: string | null;
  clothing_fit: AthleteProductPreferences["clothingFit"];
  clothing_notes: string | null;
  recovery_products: string[] | null;
  recovery_brands: string[] | null;
  recovery_notes: string | null;
  purchase_channels: string[] | null;
  purchase_priorities: string[] | null;
  annual_sports_spend_band: AthleteProductPreferences["annualSportsSpendBand"];
};

const EMPTY_PREFERENCES: AthleteProductPreferences = {
  equipmentItems: [],
  equipmentBrands: [],
  equipmentModels: [],
  equipmentNotes: "",
  nutritionProducts: [],
  nutritionBrands: [],
  nutritionNotes: "",
  technologyDevices: [],
  technologyApps: [],
  technologyBrands: [],
  technologyNotes: "",
  clothingItems: [],
  clothingBrands: [],
  clothingSize: "",
  clothingFit: null,
  clothingNotes: "",
  recoveryProducts: [],
  recoveryBrands: [],
  recoveryNotes: "",
  purchaseChannels: [],
  purchasePriorities: [],
  annualSportsSpendBand: null,
};

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

function text(value: unknown, max: number, label: string, required = false): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (required && result.length < 2) throw new Error(`${label} is required`);
  if (result.length > max) throw new Error(`${label} must be ${max} characters or fewer`);
  return result;
}

function optionalHttpsUrl(value: unknown, label: string): string {
  const result = text(value, 300, label);
  if (!result) return "";
  try {
    const url = new URL(result);
    if (url.protocol !== "https:") throw new Error(`${label} must be an https link`);
    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid https link`);
  }
}

function optionalYear(value: unknown): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) return "";
  if (!/^\d{4}$/.test(result)) throw new Error("Race year must be a 4-digit year");
  const year = Number(result);
  const max = new Date().getUTCFullYear() + 1;
  if (year < 1900 || year > max) throw new Error("Race year is out of range");
  return result;
}

function optionalDate(value: unknown): string {
  const result = typeof value === "string" ? value.trim() : "";
  if (!result) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error("Date of birth is invalid");
  const date = new Date(`${result}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date > new Date())
    throw new Error("Date of birth is invalid");
  return result;
}

function stringArray(value: unknown, maxItems: number, maxLength: number, label: string): string[] {
  if (!Array.isArray(value)) return [];
  if (value.length > maxItems) throw new Error(`${label} has too many selections`);
  const unique = new Set<string>();
  for (const item of value) {
    const result = text(item, maxLength, label);
    if (result) unique.add(result);
  }
  return [...unique];
}

function optionalNumber(value: unknown, min: number, max: number, label: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max) {
    throw new Error(`${label} must be between ${min} and ${max}`);
  }
  return result;
}

function validateSport(value: AthleteSportProfile): AthleteSportProfile {
  if (!ATHLETE_SPORTS.includes(value?.sportCode)) throw new Error("Choose a valid sport");
  const experience = value?.experienceLevel;
  if (
    experience !== null &&
    experience !== "new" &&
    experience !== "recreational" &&
    experience !== "club" &&
    experience !== "competitive" &&
    experience !== "elite" &&
    experience !== "coach" &&
    experience !== "other"
  ) {
    throw new Error("Experience level is invalid");
  }
  return {
    sportCode: value.sportCode,
    isPrimary: value.isPrimary === true,
    experienceLevel: experience ?? null,
    disciplines: stringArray(value.disciplines, 20, 80, "Disciplines"),
    preferredDistances: stringArray(value.preferredDistances, 20, 80, "Distances"),
    preferredSurfaces: stringArray(value.preferredSurfaces, 20, 80, "Surfaces"),
    trainingSessionsPerWeek: optionalNumber(
      value.trainingSessionsPerWeek,
      0,
      30,
      "Weekly sessions",
    ),
    trainingHoursPerWeek: optionalNumber(value.trainingHoursPerWeek, 0, 168, "Weekly hours"),
    weeklyDistanceKm: optionalNumber(value.weeklyDistanceKm, 0, 2000, "Weekly distance"),
    eventsPerYear: optionalNumber(value.eventsPerYear, 0, 500, "Events per year"),
    goals: text(value.goals, 1000, "Goals"),
    coachName: text(value.coachName, 120, "Coach name"),
  };
}

function validatePreferences(value: AthleteProductPreferences): AthleteProductPreferences {
  const clothingFits: AthleteProductPreferences["clothingFit"][] = [
    null,
    "relaxed",
    "regular",
    "fitted",
    "compression",
    "varies",
  ];
  const spendBands: AthleteProductPreferences["annualSportsSpendBand"][] = [
    null,
    "prefer_not_to_say",
    "under_250",
    "250_499",
    "500_999",
    "1000_1999",
    "2000_plus",
  ];
  if (!clothingFits.includes(value?.clothingFit ?? null))
    throw new Error("Clothing fit is invalid");
  if (!spendBands.includes(value?.annualSportsSpendBand ?? null)) {
    throw new Error("Sports spending choice is invalid");
  }
  return {
    equipmentItems: stringArray(value?.equipmentItems, 30, 80, "Equipment"),
    equipmentBrands: stringArray(value?.equipmentBrands, 30, 80, "Equipment brands"),
    equipmentModels: stringArray(value?.equipmentModels, 30, 120, "Equipment models"),
    equipmentNotes: text(value?.equipmentNotes, 1000, "Equipment notes"),
    nutritionProducts: stringArray(value?.nutritionProducts, 30, 80, "Nutrition products"),
    nutritionBrands: stringArray(value?.nutritionBrands, 30, 80, "Nutrition brands"),
    nutritionNotes: text(value?.nutritionNotes, 1000, "Nutrition notes"),
    technologyDevices: stringArray(value?.technologyDevices, 30, 80, "Technology devices"),
    technologyApps: stringArray(value?.technologyApps, 30, 80, "Technology apps"),
    technologyBrands: stringArray(value?.technologyBrands, 30, 80, "Technology brands"),
    technologyNotes: text(value?.technologyNotes, 1000, "Technology notes"),
    clothingItems: stringArray(value?.clothingItems, 30, 80, "Clothing"),
    clothingBrands: stringArray(value?.clothingBrands, 30, 80, "Clothing brands"),
    clothingSize: text(value?.clothingSize, 30, "Clothing size"),
    clothingFit: value?.clothingFit ?? null,
    clothingNotes: text(value?.clothingNotes, 1000, "Clothing notes"),
    recoveryProducts: stringArray(value?.recoveryProducts, 30, 80, "Recovery products"),
    recoveryBrands: stringArray(value?.recoveryBrands, 30, 80, "Recovery brands"),
    recoveryNotes: text(value?.recoveryNotes, 1000, "Recovery notes"),
    purchaseChannels: stringArray(value?.purchaseChannels, 20, 80, "Purchase channels"),
    purchasePriorities: stringArray(value?.purchasePriorities, 20, 80, "Purchase priorities"),
    annualSportsSpendBand: value?.annualSportsSpendBand ?? null,
  };
}

function validateAccountInput(value: AthleteAccountInput): AthleteAccountInput {
  const sports = (Array.isArray(value?.sports) ? value.sports : []).map(validateSport);
  if (sports.length > ATHLETE_SPORTS.length) throw new Error("Too many sports selected");
  if (new Set(sports.map((sport) => sport.sportCode)).size !== sports.length) {
    throw new Error("Each sport can only be added once");
  }
  if (sports.filter((sport) => sport.isPrimary).length > 1) {
    throw new Error("Choose only one primary sport");
  }
  if (value?.privacyAcknowledged !== true) {
    throw new Error("Read and acknowledge the Athlete Account privacy notice");
  }
  return {
    fullName: text(value?.fullName, 120, "Full name", true),
    displayName: text(value?.displayName, 120, "Display name"),
    dateOfBirth: optionalDate(value?.dateOfBirth),
    country: text(value?.country, 100, "Country"),
    region: text(value?.region, 120, "Region"),
    city: text(value?.city, 120, "City"),
    postcode: text(value?.postcode, 30, "Postcode"),
    nationality: text(value?.nationality, 100, "Nationality"),
    clubOrTeam: text(value?.clubOrTeam, 160, "Club or team"),
    preferredLanguage: text(value?.preferredLanguage, 80, "Preferred language"),
    previousNames: stringArray(value?.previousNames, 8, 120, "Previous or known-as names"),
    parkrunId: text(value?.parkrunId, 40, "parkrun barcode"),
    athleticsUrn: text(value?.athleticsUrn, 40, "Athletics URN"),
    powerOf10Url: optionalHttpsUrl(value?.powerOf10Url, "Power of 10 profile"),
    worldAthleticsUrl: optionalHttpsUrl(value?.worldAthleticsUrl, "World Athletics profile"),
    fingerprintEvent: text(value?.fingerprintEvent, 160, "Known race name"),
    fingerprintYear: optionalYear(value?.fingerprintYear),
    fingerprintDistance: text(value?.fingerprintDistance, 40, "Known race distance"),
    fingerprintTime: text(value?.fingerprintTime, 20, "Known race time"),
    privacyAcknowledged: true,
    sports,
    preferences: validatePreferences(value?.preferences ?? EMPTY_PREFERENCES),
    consents: {
      performanceInsights: value?.consents?.performanceInsights === true,
      personalisation: value?.consents?.personalisation === true,
      productResearch: value?.consents?.productResearch === true,
      marketing: value?.consents?.marketing === true,
    },
  };
}

function mapSport(row: SportRow): AthleteSportProfile {
  return {
    sportCode: row.sport_code,
    isPrimary: row.is_primary,
    experienceLevel: row.experience_level,
    disciplines: row.disciplines ?? [],
    preferredDistances: row.preferred_distances ?? [],
    preferredSurfaces: row.preferred_surfaces ?? [],
    trainingSessionsPerWeek: row.training_sessions_per_week,
    trainingHoursPerWeek:
      row.training_hours_per_week == null ? null : Number(row.training_hours_per_week),
    weeklyDistanceKm: row.weekly_distance_km == null ? null : Number(row.weekly_distance_km),
    eventsPerYear: row.events_per_year,
    goals: row.goals ?? "",
    coachName: row.coach_name ?? "",
  };
}

function mapPreferences(row: PreferencesRow | undefined): AthleteProductPreferences {
  if (!row) return { ...EMPTY_PREFERENCES };
  return {
    equipmentItems: row.equipment_items ?? [],
    equipmentBrands: row.equipment_brands ?? [],
    equipmentModels: row.equipment_models ?? [],
    equipmentNotes: row.equipment_notes ?? "",
    nutritionProducts: row.nutrition_products ?? [],
    nutritionBrands: row.nutrition_brands ?? [],
    nutritionNotes: row.nutrition_notes ?? "",
    technologyDevices: row.technology_devices ?? [],
    technologyApps: row.technology_apps ?? [],
    technologyBrands: row.technology_brands ?? [],
    technologyNotes: row.technology_notes ?? "",
    clothingItems: row.clothing_items ?? [],
    clothingBrands: row.clothing_brands ?? [],
    clothingSize: row.clothing_size ?? "",
    clothingFit: row.clothing_fit,
    clothingNotes: row.clothing_notes ?? "",
    recoveryProducts: row.recovery_products ?? [],
    recoveryBrands: row.recovery_brands ?? [],
    recoveryNotes: row.recovery_notes ?? "",
    purchaseChannels: row.purchase_channels ?? [],
    purchasePriorities: row.purchase_priorities ?? [],
    annualSportsSpendBand: row.annual_sports_spend_band,
  };
}

function mapConsents(rows: Array<{ purpose: string; status: string }>): AthleteAccountConsents {
  const granted = new Set(rows.filter((row) => row.status === "granted").map((row) => row.purpose));
  return {
    performanceInsights: granted.has("performance_insights"),
    personalisation: granted.has("personalisation"),
    productResearch: granted.has("product_research"),
    marketing: granted.has("marketing"),
  };
}

function safeImageUrl(value: string | null): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

async function loadAccount(sql: Awaited<ReturnType<typeof getSql>>, userId: string) {
  if (dbSource === "pglite" && userId === "dev-user") {
    await ensureDevPreviewAthleteAccount(sql);
  }
  const users = await sql<UserRow>`
    select
      "id" as id,
      "name" as name,
      lower("email") as email,
      "emailVerified" as email_verified,
      "image" as image
    from "user"
    where "id" = ${userId}
    limit 1
  `;
  const user = users[0];
  if (!user?.email) throw new Error("Your signed-in account has no email address");

  const [
    profiles,
    photos,
    sports,
    preferences,
    consentRows,
    claimedProfiles,
    claimedResults,
    claimCounts,
  ] = await Promise.all([
      sql<ProfileRow>`
        select
          full_name, display_name, date_of_birth::text as date_of_birth,
          country, region, city, postcode, nationality, club_or_team,
          preferred_language, previous_names, parkrun_id, athletics_urn,
          power_of_10_url, world_athletics_url, fingerprint_event,
          fingerprint_year, fingerprint_distance, fingerprint_time,
          privacy_notice_version,
          privacy_acknowledged_at::text as privacy_acknowledged_at,
          updated_at::text as updated_at
        from athlete_private_profiles
        where user_id = ${userId}
        limit 1
      `,
      sql<ProfilePhotoRow>`
        select updated_at::text as updated_at
        from athlete_profile_photos
        where user_id = ${userId}
        limit 1
      `,
      sql<SportRow>`
        select *
        from athlete_sport_profiles
        where user_id = ${userId}
        order by is_primary desc, sport_code
      `,
      sql<PreferencesRow>`
        select *
        from athlete_product_preferences
        where user_id = ${userId}
        limit 1
      `,
      sql<{ purpose: string; status: string }>`
        select purpose, status
        from athlete_account_consents
        where user_id = ${userId}
      `,
      sql<{ athlete_id: number; athlete_name: string; athlete_slug: string }>`
        select
          athlete.id as athlete_id,
          athlete.display_name as athlete_name,
          athlete.slug as athlete_slug
        from athlete_account_links account_link
        join athletes athlete on athlete.id = account_link.athlete_id
        where account_link.user_id = ${userId} and account_link.status = 'active'
        order by athlete.display_name
      `,
      sql<{
        result_id: number;
        athlete_name: string;
        event_name: string;
        event_slug: string;
        event_date: string;
        distance_code: string;
        finish_time_seconds: number | null;
        overall_place: number | null;
        category: string | null;
      }>`
        select
          result.id as result_id,
          athlete.display_name as athlete_name,
          event.name as event_name,
          event.slug as event_slug,
          edition.event_date::text as event_date,
          edition.distance_code,
          result.finish_time_seconds,
          result.overall_place,
          result.category
        from athlete_account_links account_link
        join athletes athlete on athlete.id = account_link.athlete_id
        join results result on result.athlete_id = athlete.id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        where account_link.user_id = ${userId}
          and account_link.status = 'active'
        order by edition.event_date desc, event.name, result.id desc
        limit 500
      `,
      sql<{ claim_count: number }>`
        select count(*)::int as claim_count
        from result_claims
        where claimant_user_id = ${userId}
      `,
    ]);
  const profile = profiles[0];
  const photo = photos[0];
  // Upload is always available: private Blob is preferred, with an
  // authenticated Postgres bytea fallback until an object store is connected.
  const profilePhotoUploadAvailable = true;
  return {
    exists: Boolean(profile),
    userId,
    verifiedEmail: user.email,
    emailVerified: user.email_verified,
    authName: user.name ?? "",
    fullName: profile?.full_name ?? user.name ?? "",
    displayName: profile?.display_name ?? "",
    dateOfBirth: profile?.date_of_birth ?? "",
    country: profile?.country ?? "",
    region: profile?.region ?? "",
    city: profile?.city ?? "",
    postcode: profile?.postcode ?? "",
    nationality: profile?.nationality ?? "",
    clubOrTeam: profile?.club_or_team ?? "",
    preferredLanguage: profile?.preferred_language ?? "",
    previousNames: profile?.previous_names ?? [],
    parkrunId: profile?.parkrun_id ?? "",
    athleticsUrn: profile?.athletics_urn ?? "",
    powerOf10Url: profile?.power_of_10_url ?? "",
    worldAthleticsUrl: profile?.world_athletics_url ?? "",
    fingerprintEvent: profile?.fingerprint_event ?? "",
    fingerprintYear: profile?.fingerprint_year ?? "",
    fingerprintDistance: profile?.fingerprint_distance ?? "",
    fingerprintTime: profile?.fingerprint_time ?? "",
    profilePhotoUrl: photo
      ? `/api/athlete-profile-photo?v=${encodeURIComponent(photo.updated_at)}`
      : "",
    profilePhotoUpdatedAt: photo?.updated_at ?? null,
    profilePhotoUploadAvailable,
    authImageUrl: safeImageUrl(user.image),
    privacyAcknowledged: Boolean(profile?.privacy_acknowledged_at),
    updatedAt: profile?.updated_at ?? null,
    sports: sports.map(mapSport),
    preferences: mapPreferences(preferences[0]),
    consents: mapConsents(consentRows),
    claimedProfiles: claimedProfiles.map((row) => ({
      athleteId: row.athlete_id,
      athleteName: row.athlete_name,
      athleteSlug: row.athlete_slug,
    })),
    claimedResults: claimedResults.map((row) => ({
      resultId: row.result_id,
      athleteName: row.athlete_name,
      eventName: row.event_name,
      eventSlug: row.event_slug,
      eventDate: row.event_date,
      distanceCode: row.distance_code,
      finishTimeSeconds: row.finish_time_seconds,
      overallPlace: row.overall_place,
      category: row.category,
    })),
    claimCount: claimCounts[0]?.claim_count ?? 0,
  } satisfies AthleteAccountData;
}

async function syncAthleteAnalytics(userId: string): Promise<void> {
  const sql = await ready();
  const linked = await sql<{ athlete_id: number }>`
    select athlete_id
    from athlete_account_links
    where user_id = ${userId} and status = 'active'
  `;
  if (!linked.length) return;
  const sports = await sql<SportRow>`
    select *
    from athlete_sport_profiles
    where user_id = ${userId}
    order by is_primary desc, sport_code
    limit 1
  `;
  const preferences = await sql<PreferencesRow>`
    select * from athlete_product_preferences where user_id = ${userId} limit 1
  `;
  const consents = await sql<{ purpose: string; status: string }>`
    select purpose, status from athlete_account_consents where user_id = ${userId}
  `;
  const sport = sports[0];
  const product = mapPreferences(preferences[0]);
  for (const link of linked) {
    await sql`
      insert into athlete_habit_profiles (
        athlete_id, training_days_per_week, weekly_distance_km, races_per_year,
        preferred_distances, preferred_surfaces, shoe_brands, kit_brands,
        nutrition_categories, recovery_methods, travel_preferences,
        source, collected_at, updated_at
      ) values (
        ${link.athlete_id}, ${sport?.training_sessions_per_week ?? null},
        ${sport?.weekly_distance_km == null ? null : Number(sport.weekly_distance_km)},
        ${sport?.events_per_year ?? null},
        ${JSON.stringify(sport?.preferred_distances ?? [])}::jsonb,
        ${JSON.stringify(sport?.preferred_surfaces ?? [])}::jsonb,
        ${JSON.stringify(product.equipmentBrands)}::jsonb,
        ${JSON.stringify(product.clothingBrands)}::jsonb,
        ${JSON.stringify(product.nutritionProducts)}::jsonb,
        ${JSON.stringify(product.recoveryProducts)}::jsonb,
        '[]'::jsonb, 'athlete_account', now(), now()
      )
      on conflict (athlete_id) do update set
        training_days_per_week = excluded.training_days_per_week,
        weekly_distance_km = excluded.weekly_distance_km,
        races_per_year = excluded.races_per_year,
        preferred_distances = excluded.preferred_distances,
        preferred_surfaces = excluded.preferred_surfaces,
        shoe_brands = excluded.shoe_brands,
        kit_brands = excluded.kit_brands,
        nutrition_categories = excluded.nutrition_categories,
        recovery_methods = excluded.recovery_methods,
        source = 'athlete_account',
        updated_at = now()
    `;
    for (const consent of consents) {
      const granted = consent.status === "granted";
      await sql`
        insert into athlete_data_consents (
          athlete_id, user_id, purpose, status, policy_version, source,
          granted_at, withdrawn_at, updated_at
        ) values (
          ${link.athlete_id}, ${userId}, ${consent.purpose}, ${consent.status},
          ${ATHLETE_PRIVACY_VERSION}, 'athlete_account',
          ${granted ? new Date() : null}, ${granted ? null : new Date()}, now()
        )
        on conflict (athlete_id, purpose) do update set
          user_id = excluded.user_id,
          status = excluded.status,
          policy_version = excluded.policy_version,
          source = 'athlete_account',
          granted_at = excluded.granted_at,
          withdrawn_at = excluded.withdrawn_at,
          updated_at = now()
      `;
    }
  }
}

export const syncAthleteAccountAfterClaim = createServerOnlyFn(async (userId: string) => {
  await syncAthleteAnalytics(userId);
});

export const getMyAthleteAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => loadAccount(await ready(), context.userId));

export const saveMyAthleteAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: AthleteAccountInput) => validateAccountInput(input))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const users = await sql<UserRow>`
      select
        "id" as id, "name" as name, lower("email") as email,
        "emailVerified" as email_verified
      from "user"
      where "id" = ${context.userId}
      limit 1
    `;
    const user = users[0];
    if (!user?.email) throw new Error("Your signed-in account has no email address");
    if (!user.email_verified) throw new Error("Verify your Google email before saving");

    await sql.transaction(async (tx) => {
      await tx`
        insert into athlete_private_profiles (
          user_id, verified_email, full_name, display_name, date_of_birth,
          country, region, city, postcode, nationality, club_or_team,
          preferred_language, previous_names, parkrun_id, athletics_urn,
          power_of_10_url, world_athletics_url, fingerprint_event,
          fingerprint_year, fingerprint_distance, fingerprint_time,
          privacy_notice_version, privacy_acknowledged_at,
          onboarding_completed_at, updated_at
        ) values (
          ${context.userId}, ${user.email}, ${data.fullName}, ${data.displayName || null},
          ${data.dateOfBirth || null}::date, ${data.country || null}, ${data.region || null},
          ${data.city || null}, ${data.postcode || null}, ${data.nationality || null},
          ${data.clubOrTeam || null}, ${data.preferredLanguage || null},
          ${data.previousNames ?? []}, ${data.parkrunId || null}, ${data.athleticsUrn || null},
          ${data.powerOf10Url || null}, ${data.worldAthleticsUrl || null},
          ${data.fingerprintEvent || null}, ${data.fingerprintYear || null},
          ${data.fingerprintDistance || null}, ${data.fingerprintTime || null},
          ${ATHLETE_PRIVACY_VERSION}, now(), now(), now()
        )
        on conflict (user_id) do update set
          verified_email = excluded.verified_email,
          full_name = excluded.full_name,
          display_name = excluded.display_name,
          date_of_birth = excluded.date_of_birth,
          country = excluded.country,
          region = excluded.region,
          city = excluded.city,
          postcode = excluded.postcode,
          nationality = excluded.nationality,
          club_or_team = excluded.club_or_team,
          preferred_language = excluded.preferred_language,
          previous_names = excluded.previous_names,
          parkrun_id = excluded.parkrun_id,
          athletics_urn = excluded.athletics_urn,
          power_of_10_url = excluded.power_of_10_url,
          world_athletics_url = excluded.world_athletics_url,
          fingerprint_event = excluded.fingerprint_event,
          fingerprint_year = excluded.fingerprint_year,
          fingerprint_distance = excluded.fingerprint_distance,
          fingerprint_time = excluded.fingerprint_time,
          privacy_notice_version = excluded.privacy_notice_version,
          privacy_acknowledged_at = now(),
          updated_at = now()
      `;

      await tx`delete from athlete_sport_profiles where user_id = ${context.userId}`;
      for (const sport of data.sports) {
        await tx`
          insert into athlete_sport_profiles (
            user_id, sport_code, is_primary, experience_level, disciplines,
            preferred_distances, preferred_surfaces, training_sessions_per_week,
            training_hours_per_week, weekly_distance_km, events_per_year,
            goals, coach_name
          ) values (
            ${context.userId}, ${sport.sportCode}, ${sport.isPrimary},
            ${sport.experienceLevel}, ${sport.disciplines}, ${sport.preferredDistances},
            ${sport.preferredSurfaces}, ${sport.trainingSessionsPerWeek},
            ${sport.trainingHoursPerWeek}, ${sport.weeklyDistanceKm},
            ${sport.eventsPerYear}, ${sport.goals || null}, ${sport.coachName || null}
          )
        `;
      }

      const preferences = data.preferences;
      await tx`
        insert into athlete_product_preferences (
          user_id, equipment_items, equipment_brands, equipment_models, equipment_notes,
          nutrition_products, nutrition_brands, nutrition_notes,
          technology_devices, technology_apps, technology_brands, technology_notes,
          clothing_items, clothing_brands, clothing_size, clothing_fit, clothing_notes,
          recovery_products, recovery_brands, recovery_notes,
          purchase_channels, purchase_priorities, annual_sports_spend_band, updated_at
        ) values (
          ${context.userId}, ${preferences.equipmentItems}, ${preferences.equipmentBrands},
          ${preferences.equipmentModels}, ${preferences.equipmentNotes || null},
          ${preferences.nutritionProducts}, ${preferences.nutritionBrands},
          ${preferences.nutritionNotes || null}, ${preferences.technologyDevices},
          ${preferences.technologyApps}, ${preferences.technologyBrands},
          ${preferences.technologyNotes || null}, ${preferences.clothingItems},
          ${preferences.clothingBrands}, ${preferences.clothingSize || null},
          ${preferences.clothingFit}, ${preferences.clothingNotes || null},
          ${preferences.recoveryProducts}, ${preferences.recoveryBrands},
          ${preferences.recoveryNotes || null}, ${preferences.purchaseChannels},
          ${preferences.purchasePriorities}, ${preferences.annualSportsSpendBand}, now()
        )
        on conflict (user_id) do update set
          equipment_items = excluded.equipment_items,
          equipment_brands = excluded.equipment_brands,
          equipment_models = excluded.equipment_models,
          equipment_notes = excluded.equipment_notes,
          nutrition_products = excluded.nutrition_products,
          nutrition_brands = excluded.nutrition_brands,
          nutrition_notes = excluded.nutrition_notes,
          technology_devices = excluded.technology_devices,
          technology_apps = excluded.technology_apps,
          technology_brands = excluded.technology_brands,
          technology_notes = excluded.technology_notes,
          clothing_items = excluded.clothing_items,
          clothing_brands = excluded.clothing_brands,
          clothing_size = excluded.clothing_size,
          clothing_fit = excluded.clothing_fit,
          clothing_notes = excluded.clothing_notes,
          recovery_products = excluded.recovery_products,
          recovery_brands = excluded.recovery_brands,
          recovery_notes = excluded.recovery_notes,
          purchase_channels = excluded.purchase_channels,
          purchase_priorities = excluded.purchase_priorities,
          annual_sports_spend_band = excluded.annual_sports_spend_band,
          updated_at = now()
      `;

      const consentEntries: Array<[string, boolean]> = [
        ["performance_insights", data.consents.performanceInsights],
        ["personalisation", data.consents.personalisation],
        ["product_research", data.consents.productResearch],
        ["marketing", data.consents.marketing],
      ];
      for (const [purpose, granted] of consentEntries) {
        await tx`
          insert into athlete_account_consents (
            user_id, purpose, status, policy_version, source,
            granted_at, withdrawn_at, updated_at
          ) values (
            ${context.userId}, ${purpose}, ${granted ? "granted" : "withdrawn"},
            ${ATHLETE_PRIVACY_VERSION}, 'athlete_account',
            ${granted ? new Date() : null}, ${granted ? null : new Date()}, now()
          )
          on conflict (user_id, purpose) do update set
            status = excluded.status,
            policy_version = excluded.policy_version,
            source = excluded.source,
            granted_at = case
              when excluded.status = 'granted' then coalesce(athlete_account_consents.granted_at, now())
              else null
            end,
            withdrawn_at = case when excluded.status = 'withdrawn' then now() else null end,
            updated_at = now()
        `;
      }
    });

    await syncAthleteAnalytics(context.userId);
    return loadAccount(sql, context.userId);
  });

export type StaffAthleteAccountItem = AthleteAccountData & { completionPercent: number };

function accountCompletion(account: AthleteAccountData): number {
  let score = account.fullName && account.verifiedEmail ? 35 : 0;
  if (account.sports.length) score += 15;
  const primary = account.sports.find((sport) => sport.isPrimary) ?? account.sports[0];
  if (primary?.trainingSessionsPerWeek != null || primary?.trainingHoursPerWeek != null)
    score += 10;
  if (account.country || account.city || account.clubOrTeam) score += 10;
  const preferences = account.preferences;
  if (preferences.equipmentItems.length || preferences.equipmentBrands.length) score += 5;
  if (preferences.nutritionProducts.length) score += 5;
  if (preferences.technologyDevices.length || preferences.technologyApps.length) score += 5;
  if (preferences.clothingItems.length || preferences.clothingBrands.length) score += 5;
  if (preferences.recoveryProducts.length) score += 5;
  if (account.consents.performanceInsights || account.consents.productResearch) score += 5;
  return Math.min(score, 100);
}

export const listStaffAthleteAccounts = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const sql = await ready();
    const [profiles, sports, preferences, consentRows, claimedProfiles, claimCounts] =
      await Promise.all([
        sql<
          ProfileRow & {
            user_id: string;
            auth_name: string;
            auth_email: string;
            email_verified: boolean;
          }
        >`
          select
            profile.user_id,
            profile.full_name,
            profile.display_name,
            profile.date_of_birth::text as date_of_birth,
            profile.country,
            profile.region,
            profile.city,
            profile.postcode,
            profile.nationality,
            profile.club_or_team,
            profile.preferred_language,
            profile.previous_names,
            profile.parkrun_id,
            profile.athletics_urn,
            profile.power_of_10_url,
            profile.world_athletics_url,
            profile.fingerprint_event,
            profile.fingerprint_year,
            profile.fingerprint_distance,
            profile.fingerprint_time,
            profile.privacy_notice_version,
            profile.privacy_acknowledged_at::text as privacy_acknowledged_at,
            profile.updated_at::text as updated_at,
            account_user."name" as auth_name,
            lower(account_user."email") as auth_email,
            account_user."emailVerified" as email_verified
          from athlete_private_profiles profile
          join "user" account_user on account_user."id" = profile.user_id
          order by profile.updated_at desc
        `,
        sql<SportRow & { user_id: string }>`
          select * from athlete_sport_profiles order by is_primary desc, sport_code
        `,
        sql<PreferencesRow & { user_id: string }>`select * from athlete_product_preferences`,
        sql<{ user_id: string; purpose: string; status: string }>`
          select user_id, purpose, status from athlete_account_consents
        `,
        sql<{
          user_id: string;
          athlete_id: number;
          athlete_name: string;
          athlete_slug: string;
        }>`
          select
            account_link.user_id,
            athlete.id as athlete_id,
            athlete.display_name as athlete_name,
            athlete.slug as athlete_slug
          from athlete_account_links account_link
          join athletes athlete on athlete.id = account_link.athlete_id
          where account_link.status = 'active'
          order by athlete.display_name
        `,
        sql<{ user_id: string; claim_count: number }>`
          select claimant_user_id as user_id, count(*)::int as claim_count
          from result_claims
          group by claimant_user_id
        `,
      ]);

    const groupedSports = groupByUser(sports);
    const groupedConsents = groupByUser(consentRows);
    const groupedClaims = groupByUser(claimedProfiles);
    const preferencesByUser = new Map(preferences.map((row) => [row.user_id, row]));
    const claimCountByUser = new Map(claimCounts.map((row) => [row.user_id, row.claim_count]));

    return profiles.map((profile) => {
      const account: AthleteAccountData = {
        exists: true,
        userId: profile.user_id,
        verifiedEmail: profile.auth_email,
        emailVerified: profile.email_verified,
        authName: profile.auth_name ?? "",
        fullName: profile.full_name,
        displayName: profile.display_name ?? "",
        dateOfBirth: profile.date_of_birth ?? "",
        country: profile.country ?? "",
        region: profile.region ?? "",
        city: profile.city ?? "",
        postcode: profile.postcode ?? "",
        nationality: profile.nationality ?? "",
        clubOrTeam: profile.club_or_team ?? "",
        preferredLanguage: profile.preferred_language ?? "",
        previousNames: profile.previous_names ?? [],
        parkrunId: profile.parkrun_id ?? "",
        athleticsUrn: profile.athletics_urn ?? "",
        powerOf10Url: profile.power_of_10_url ?? "",
        worldAthleticsUrl: profile.world_athletics_url ?? "",
        fingerprintEvent: profile.fingerprint_event ?? "",
        fingerprintYear: profile.fingerprint_year ?? "",
        fingerprintDistance: profile.fingerprint_distance ?? "",
        fingerprintTime: profile.fingerprint_time ?? "",
        profilePhotoUrl: "",
        profilePhotoUpdatedAt: null,
        profilePhotoUploadAvailable: false,
        authImageUrl: "",
        privacyAcknowledged: Boolean(profile.privacy_acknowledged_at),
        updatedAt: profile.updated_at,
        sports: (groupedSports.get(profile.user_id) ?? []).map(mapSport),
        preferences: mapPreferences(preferencesByUser.get(profile.user_id)),
        consents: mapConsents(groupedConsents.get(profile.user_id) ?? []),
        claimedProfiles: (groupedClaims.get(profile.user_id) ?? []).map((row) => ({
          athleteId: row.athlete_id,
          athleteName: row.athlete_name,
          athleteSlug: row.athlete_slug,
        })),
        claimedResults: [],
        claimCount: claimCountByUser.get(profile.user_id) ?? 0,
      };
      return { ...account, completionPercent: accountCompletion(account) };
    });
  });

function groupByUser<T extends { user_id: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const current = grouped.get(row.user_id);
    if (current) current.push(row);
    else grouped.set(row.user_id, [row]);
  }
  return grouped;
}
