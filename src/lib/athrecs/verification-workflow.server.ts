import { createHash, randomUUID } from "node:crypto";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { normalizeEventName } from "./dedupe";
import { slugify } from "./import.server";

const SPORTS = new Set([
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
]);
const ENTRY_STATUSES = new Set(["Open", "ClosingSoon", "Closed", "Finished", "TBC"]);
const ENTRY_OPTION_TYPES = new Set(["official", "third_party", "charity", "tour_operator"]);
const ENTRY_OPTION_STATUSES = new Set([
  "open",
  "closing_soon",
  "ballot",
  "waitlist",
  "sold_out",
  "closed",
  "unknown",
]);
const FACT_STATUSES = new Set([
  "pending",
  "verified",
  "not_published",
  "not_applicable",
  "conflict",
  "rejected",
]);
const OFFICIAL_SITE_STATUSES = new Set([
  "pending",
  "verified",
  "rejected",
  "conflict",
  "not_found",
]);
const DUPLICATE_STATUSES = new Set([
  "pending",
  "new",
  "matched_existing",
  "exact_duplicate",
  "possible_duplicate",
  "needs_review",
]);
const OPTION_DUPLICATE_STATUSES = new Set([
  "pending",
  "new",
  "exact_duplicate",
  "possible_duplicate",
  "needs_review",
]);
const OVERALL_STATUSES = new Set(["pending", "approved", "needs_changes", "rejected"]);
const PROVIDER_RELATIONSHIPS = new Set([
  "organiser_direct",
  "authorised_partner",
  "charity_place",
  "tour_operator",
  "unconfirmed",
  "rejected",
]);

export type VerificationEntryInput = {
  id?: string;
  providerCode?: string;
  providerName: string;
  entryUrl: string;
  entryType?: string;
  status?: string;
  priceAmount?: number;
  priceCurrency?: string;
  opensAt?: string;
  closesAt?: string;
  sourceUrl?: string;
  providerRelationship?: string;
  urlCheck?: string;
  eventCheck?: string;
  editionCheck?: string;
  availabilityCheck?: string;
  duplicateStatus?: string;
  isPrimary?: boolean;
  reviewStatus?: string;
  reviewNote?: string;
};

export type VerificationResultInput = {
  id?: string;
  providerCode?: string;
  providerName: string;
  resultsUrl: string;
  sourceUrl?: string;
  urlCheck?: string;
  eventCheck?: string;
  editionCheck?: string;
  eventLevelCheck?: string;
  participantScopeCheck?: string;
  duplicateStatus?: string;
  reviewStatus?: string;
  reviewNote?: string;
};

export type VerificationCandidateInput = {
  sourceId: string;
  discoveryUrl: string;
  eventSlug?: string;
  eventName: string;
  sport?: string;
  country: string;
  county?: string;
  city?: string;
  area?: string;
  venue?: string;
  surface?: string;
  organiser?: string;
  officialWebsiteCandidate?: string | null;
  officialWebsiteEvidenceUrl?: string | null;
  eventDate: string;
  distance: string;
  distanceKm?: number;
  startTime?: string | null;
  entryStatus?: string;
  entryOptions?: VerificationEntryInput[];
  resultLinks?: VerificationResultInput[];
};

export type CandidateReviewInput = {
  candidateId: string;
  eventName: string;
  sport: string;
  country: string;
  county?: string;
  city?: string;
  area?: string;
  venue?: string;
  surface?: string;
  organiser?: string;
  officialWebsiteCandidate?: string | null;
  officialWebsiteEvidenceUrl?: string | null;
  officialWebsiteStatus: string;
  eventDate: string;
  distance: string;
  distanceKm?: number;
  startTime?: string | null;
  entryStatus: string;
  eventNameCheck: string;
  organiserCheck: string;
  dateCheck: string;
  distanceCheck: string;
  locationCheck: string;
  surfaceCheck: string;
  startTimeCheck: string;
  entryStatusCheck: string;
  cancellationCheck: string;
  duplicateStatus: string;
  matchedEventId?: number | null;
  matchedEditionId?: number | null;
  duplicateNote?: string;
  overallStatus: string;
  reviewNote?: string;
};

type CandidateRow = {
  id: string;
  fingerprint: string;
  source_id: string;
  discovery_url: string;
  event_slug: string;
  event_name: string;
  sport: string;
  country: string;
  county: string;
  city: string;
  area: string;
  venue: string;
  surface: string;
  organiser: string;
  official_website_candidate: string | null;
  official_website_evidence_url: string | null;
  official_website_status: string;
  event_date: string;
  distance_code: string;
  distance_km: number;
  start_time: string | null;
  entry_status: string;
  event_name_check: string;
  organiser_check: string;
  date_check: string;
  distance_check: string;
  location_check: string;
  surface_check: string;
  start_time_check: string;
  entry_status_check: string;
  cancellation_check: string;
  duplicate_status: string;
  matched_event_id: number | null;
  matched_edition_id: number | null;
  duplicate_note: string | null;
  overall_status: string;
  workflow_status: string;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_by: string | null;
  published_at: string | null;
};

type CandidateEntryRow = {
  id: string;
  candidate_id: string;
  provider_code: string;
  provider_name: string;
  entry_url: string;
  canonical_url: string;
  entry_type: string;
  status: string;
  price_amount: number | string | null;
  price_currency: string | null;
  opens_at: string | null;
  closes_at: string | null;
  source_url: string | null;
  provider_relationship: string;
  url_check: string;
  event_check: string;
  edition_check: string;
  availability_check: string;
  duplicate_status: string;
  is_primary: boolean;
  review_status: string;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CandidateResultRow = {
  id: string;
  candidate_id: string;
  provider_code: string;
  provider_name: string;
  results_url: string;
  canonical_url: string;
  source_url: string | null;
  url_check: string;
  event_check: string;
  edition_check: string;
  event_level_check: string;
  participant_scope_check: string;
  duplicate_status: string;
  review_status: string;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type CatalogueEvent = {
  id: number;
  slug: string;
  name: string;
  country: string;
  city: string;
  organiser: string;
};

type CatalogueEdition = {
  id: number;
  event_id: number;
  event_date: string;
  distance_code: string;
};

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function requireString(value: unknown, label: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${label} is required`);
  return text;
}

function realDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function httpUrl(value: string | null | undefined, label: string): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    const parsed = new URL(text);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error();
    }
    return parsed.toString();
  } catch {
    throw new Error(`${label} must be a complete HTTP or HTTPS URL`);
  }
}

export function canonicalPublicUrl(value: string): string {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URLs must use HTTP or HTTPS");
  }
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  parsed.hash = "";
  if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
    parsed.port = "";
  }
  for (const key of [...parsed.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(?:fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) {
      parsed.searchParams.delete(key);
    }
  }
  parsed.searchParams.sort();
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  return parsed.toString();
}

function normalizeComparable(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function comparableCountry(value: string): string {
  const normalized = normalizeComparable(value);
  if (["uk", "gb", "unitedkingdom", "england", "scotland", "wales", "northernireland"].includes(normalized)) {
    return "unitedkingdom";
  }
  return normalized;
}

function sameCountry(left: string, right: string): boolean {
  return comparableCountry(left) === comparableCountry(right);
}

function candidateFingerprint(input: {
  eventName: string;
  eventDate: string;
  distance: string;
  country: string;
  city?: string | null;
}): string {
  return createHash("sha256")
    .update(
      [
        normalizeEventName(input.eventName),
        input.eventDate,
        normalizeComparable(input.distance),
        comparableCountry(input.country),
        normalizeComparable(input.city ?? ""),
      ].join("|"),
    )
    .digest("hex");
}

function providerCode(value: string): string {
  return slugify(value) || "provider";
}

function factStatus(value: string | undefined, label: string): string {
  const status = value?.trim() || "pending";
  if (!FACT_STATUSES.has(status)) throw new Error(`${label} has an invalid review status`);
  return status;
}

function optionalDate(value: string | undefined, label: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!realDate(trimmed.slice(0, 10))) throw new Error(`${label} must use YYYY-MM-DD`);
  return trimmed.slice(0, 10);
}

async function audit(
  sql: Sql,
  entityType: "source" | "crawl" | "fixture_candidate" | "entry_option" | "result_link",
  entityId: string,
  action: string,
  actorEmail: string,
  note: string | null,
  before: unknown,
  after: unknown,
): Promise<void> {
  await sql.query(
    `insert into staff_verification_audit (
       entity_type, entity_id, action, actor_email, note, before_json, after_json
     ) values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)`,
    [
      entityType,
      entityId,
      action,
      actorEmail,
      note,
      before == null ? null : JSON.stringify(before),
      after == null ? null : JSON.stringify(after),
    ],
  );
}

async function getCandidate(sql: Sql, candidateId: string, lock = false): Promise<CandidateRow> {
  const rows = await sql.query<CandidateRow>(
    `select
       id,
       fingerprint,
       source_id,
       discovery_url,
       event_slug,
       event_name,
       sport,
       country,
       county,
       city,
       area,
       venue,
       surface,
       organiser,
       official_website_candidate,
       official_website_evidence_url,
       official_website_status,
       event_date::text as event_date,
       distance_code,
       distance_km,
       start_time,
       entry_status,
       event_name_check,
       organiser_check,
       date_check,
       distance_check,
       location_check,
       surface_check,
       start_time_check,
       entry_status_check,
       cancellation_check,
       duplicate_status,
       matched_event_id,
       matched_edition_id,
       duplicate_note,
       overall_status,
       workflow_status,
       review_note,
       reviewed_by,
       reviewed_at::text as reviewed_at,
       created_by,
       created_at::text as created_at,
       updated_at::text as updated_at,
       published_by,
       published_at::text as published_at
     from fixture_verification_candidates
     where id = $1
     limit 1${lock ? " for update" : ""}`,
    [candidateId],
  );
  if (!rows[0]) throw new Error("Fixture verification candidate not found");
  return rows[0];
}

async function candidateEntries(sql: Sql, candidateId: string): Promise<CandidateEntryRow[]> {
  return sql<CandidateEntryRow>`
    select
      id,
      candidate_id,
      provider_code,
      provider_name,
      entry_url,
      canonical_url,
      entry_type,
      status,
      price_amount,
      price_currency,
      opens_at::text as opens_at,
      closes_at::text as closes_at,
      source_url,
      provider_relationship,
      url_check,
      event_check,
      edition_check,
      availability_check,
      duplicate_status,
      is_primary,
      review_status,
      review_note,
      reviewed_by,
      reviewed_at::text as reviewed_at,
      created_at::text as created_at,
      updated_at::text as updated_at
    from fixture_candidate_entry_options
    where candidate_id = ${candidateId}
    order by is_primary desc, provider_name, id
  `;
}

async function candidateResults(sql: Sql, candidateId: string): Promise<CandidateResultRow[]> {
  return sql<CandidateResultRow>`
    select
      id,
      candidate_id,
      provider_code,
      provider_name,
      results_url,
      canonical_url,
      source_url,
      url_check,
      event_check,
      edition_check,
      event_level_check,
      participant_scope_check,
      duplicate_status,
      review_status,
      review_note,
      reviewed_by,
      reviewed_at::text as reviewed_at,
      created_at::text as created_at,
      updated_at::text as updated_at
    from fixture_candidate_result_links
    where candidate_id = ${candidateId}
    order by provider_name, id
  `;
}

async function classifyDuplicate(
  sql: Sql,
  input: {
    eventSlug: string;
    eventName: string;
    country: string;
    city: string;
    organiser: string;
    eventDate: string;
    distance: string;
  },
) {
  const slugRows = await sql<CatalogueEvent>`
    select id, slug, name, country, city, organiser
    from events
    where slug = ${input.eventSlug}
    limit 1
  `;
  const slugMatch = slugRows[0];
  if (slugMatch) {
    const editions = await sql<CatalogueEdition>`
      select id, event_id, event_date::text as event_date, distance_code
      from editions
      where event_id = ${slugMatch.id}
        and event_date = ${input.eventDate}::date
        and distance_code = ${input.distance}
      limit 1
    `;
    return {
      duplicateStatus: "matched_existing" as const,
      matchedEventId: slugMatch.id,
      matchedEditionId: editions[0]?.id ?? null,
      duplicateNote: editions[0]
        ? "Exact event and edition already exist; approved changes update the existing records."
        : "The event already exists; this candidate can add or update the reviewed edition.",
    };
  }

  const normalizedName = normalizeEventName(input.eventName);
  const events = await sql<CatalogueEvent>`
    select id, slug, name, country, city, organiser from events
  `;
  const possible = events.filter((event) => {
    if (normalizeEventName(event.name) !== normalizedName) return false;
    if (!sameCountry(event.country, input.country)) return false;
    const cityMatches =
      !normalizeComparable(event.city) ||
      !normalizeComparable(input.city) ||
      normalizeComparable(event.city) === normalizeComparable(input.city);
    const organiserMatches =
      !normalizeComparable(event.organiser) ||
      !normalizeComparable(input.organiser) ||
      normalizeComparable(event.organiser) === normalizeComparable(input.organiser);
    return cityMatches || organiserMatches;
  });
  if (possible.length) {
    return {
      duplicateStatus: "possible_duplicate" as const,
      matchedEventId: possible.length === 1 ? possible[0].id : null,
      matchedEditionId: null,
      duplicateNote: `Possible duplicate of ${possible.map((event) => `${event.name} (${event.slug})`).join(", ")}`,
    };
  }
  return {
    duplicateStatus: "new" as const,
    matchedEventId: null,
    matchedEditionId: null,
    duplicateNote: null,
  };
}

function entryType(value: string | undefined): string {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, "_") || "third_party";
  if (!ENTRY_OPTION_TYPES.has(normalized)) throw new Error(`Unsupported entry type: ${value}`);
  return normalized;
}

function entryOptionStatus(value: string | undefined): string {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, "_") || "unknown";
  if (!ENTRY_OPTION_STATUSES.has(normalized)) {
    throw new Error(`Unsupported entry option status: ${value}`);
  }
  return normalized;
}

function providerRelationship(value: string | undefined): string {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, "_") || "unconfirmed";
  if (!PROVIDER_RELATIONSHIPS.has(normalized)) {
    throw new Error(`Unsupported provider relationship: ${value}`);
  }
  return normalized;
}

async function stageEntryOption(
  sql: Sql,
  candidateId: string,
  raw: VerificationEntryInput,
): Promise<string> {
  const providerName = requireString(raw.providerName, "Entry provider name");
  const entryUrl = requireString(raw.entryUrl, "Entry URL");
  httpUrl(entryUrl, "Entry URL");
  const canonicalUrl = canonicalPublicUrl(entryUrl);
  const code = providerCode(raw.providerCode || providerName);
  const relationship = providerRelationship(raw.providerRelationship);
  const type = entryType(raw.entryType);
  const status = entryOptionStatus(raw.status);
  const reviewStatus = raw.reviewStatus?.trim() || "pending";
  if (!OVERALL_STATUSES.has(reviewStatus)) throw new Error("Invalid entry review status");
  const duplicateStatus = raw.duplicateStatus?.trim() || "pending";
  if (!OPTION_DUPLICATE_STATUSES.has(duplicateStatus)) {
    throw new Error("Invalid entry duplicate status");
  }
  const priceAmount = raw.priceAmount == null ? null : Number(raw.priceAmount);
  if (priceAmount != null && (!Number.isFinite(priceAmount) || priceAmount < 0)) {
    throw new Error(`Invalid price for ${providerName}`);
  }
  const priceCurrency = raw.priceCurrency?.trim().toUpperCase() || null;
  if (priceCurrency && !/^[A-Z]{3}$/.test(priceCurrency)) {
    throw new Error(`Currency for ${providerName} must be a three-letter code`);
  }
  const sourceUrl = httpUrl(raw.sourceUrl, `Evidence URL for ${providerName}`);
  const existing = await sql<{ id: string; provider_code: string }>`
    select id, provider_code
    from fixture_candidate_entry_options
    where candidate_id = ${candidateId} and canonical_url = ${canonicalUrl}
    limit 1
  `;
  const id = raw.id?.trim() || existing[0]?.id || randomUUID();
  const effectiveDuplicateStatus =
    existing[0] && existing[0].provider_code !== code ? "exact_duplicate" : duplicateStatus;

  await sql.query(
    `insert into fixture_candidate_entry_options (
       id,
       candidate_id,
       provider_code,
       provider_name,
       entry_url,
       canonical_url,
       entry_type,
       status,
       price_amount,
       price_currency,
       opens_at,
       closes_at,
       source_url,
       provider_relationship,
       url_check,
       event_check,
       edition_check,
       availability_check,
       duplicate_status,
       is_primary,
       review_status,
       review_note,
       reviewed_by,
       reviewed_at,
       updated_at
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11::date, $12::date, $13, $14, $15, $16, $17, $18,
       $19, $20, $21, $22, null, null, now()
     )
     on conflict (id) do update set
       provider_code = excluded.provider_code,
       provider_name = excluded.provider_name,
       entry_url = excluded.entry_url,
       canonical_url = excluded.canonical_url,
       entry_type = excluded.entry_type,
       status = excluded.status,
       price_amount = excluded.price_amount,
       price_currency = excluded.price_currency,
       opens_at = excluded.opens_at,
       closes_at = excluded.closes_at,
       source_url = excluded.source_url,
       provider_relationship = excluded.provider_relationship,
       url_check = excluded.url_check,
       event_check = excluded.event_check,
       edition_check = excluded.edition_check,
       availability_check = excluded.availability_check,
       duplicate_status = excluded.duplicate_status,
       is_primary = excluded.is_primary,
       review_status = excluded.review_status,
       review_note = excluded.review_note,
       updated_at = now()`,
    [
      id,
      candidateId,
      code,
      providerName,
      entryUrl,
      canonicalUrl,
      type,
      status,
      priceAmount,
      priceCurrency,
      optionalDate(raw.opensAt, `${providerName} opensAt`),
      optionalDate(raw.closesAt, `${providerName} closesAt`),
      sourceUrl,
      relationship,
      factStatus(raw.urlCheck, `${providerName} URL`),
      factStatus(raw.eventCheck, `${providerName} event`),
      factStatus(raw.editionCheck, `${providerName} edition`),
      factStatus(raw.availabilityCheck, `${providerName} availability`),
      effectiveDuplicateStatus,
      raw.isPrimary === true,
      reviewStatus,
      raw.reviewNote?.trim() || null,
    ],
  );
  return id;
}

async function stageResultLink(
  sql: Sql,
  candidateId: string,
  raw: VerificationResultInput,
): Promise<string> {
  const providerName = requireString(raw.providerName, "Results provider name");
  const resultsUrl = requireString(raw.resultsUrl, "Results URL");
  httpUrl(resultsUrl, "Results URL");
  const canonicalUrl = canonicalPublicUrl(resultsUrl);
  const code = providerCode(raw.providerCode || providerName);
  const reviewStatus = raw.reviewStatus?.trim() || "pending";
  if (!OVERALL_STATUSES.has(reviewStatus)) throw new Error("Invalid result-link review status");
  const duplicateStatus = raw.duplicateStatus?.trim() || "pending";
  if (!OPTION_DUPLICATE_STATUSES.has(duplicateStatus)) {
    throw new Error("Invalid result-link duplicate status");
  }
  const sourceUrl = httpUrl(raw.sourceUrl, `Evidence URL for ${providerName}`);
  const existing = await sql<{ id: string; provider_code: string }>`
    select id, provider_code
    from fixture_candidate_result_links
    where candidate_id = ${candidateId} and canonical_url = ${canonicalUrl}
    limit 1
  `;
  const id = raw.id?.trim() || existing[0]?.id || randomUUID();
  const effectiveDuplicateStatus = existing[0] ? "exact_duplicate" : duplicateStatus;

  await sql.query(
    `insert into fixture_candidate_result_links (
       id,
       candidate_id,
       provider_code,
       provider_name,
       results_url,
       canonical_url,
       source_url,
       url_check,
       event_check,
       edition_check,
       event_level_check,
       participant_scope_check,
       duplicate_status,
       review_status,
       review_note,
       reviewed_by,
       reviewed_at,
       updated_at
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9,
       $10, $11, $12, $13, $14, $15, null, null, now()
     )
     on conflict (id) do update set
       provider_code = excluded.provider_code,
       provider_name = excluded.provider_name,
       results_url = excluded.results_url,
       canonical_url = excluded.canonical_url,
       source_url = excluded.source_url,
       url_check = excluded.url_check,
       event_check = excluded.event_check,
       edition_check = excluded.edition_check,
       event_level_check = excluded.event_level_check,
       participant_scope_check = excluded.participant_scope_check,
       duplicate_status = excluded.duplicate_status,
       review_status = excluded.review_status,
       review_note = excluded.review_note,
       updated_at = now()`,
    [
      id,
      candidateId,
      code,
      providerName,
      resultsUrl,
      canonicalUrl,
      sourceUrl,
      factStatus(raw.urlCheck, `${providerName} URL`),
      factStatus(raw.eventCheck, `${providerName} event`),
      factStatus(raw.editionCheck, `${providerName} edition`),
      factStatus(raw.eventLevelCheck, `${providerName} event-level scope`),
      factStatus(raw.participantScopeCheck, `${providerName} participant scope`),
      effectiveDuplicateStatus,
      reviewStatus,
      raw.reviewNote?.trim() || null,
    ],
  );
  return id;
}

export async function stageVerificationCandidate(
  rawInput: VerificationCandidateInput,
  actorEmail: string,
  sqlOverride?: Sql,
) {
  const sourceId = requireString(rawInput.sourceId, "sourceId");
  const discoveryUrl = requireString(rawInput.discoveryUrl, "Discovery URL");
  httpUrl(discoveryUrl, "Discovery URL");
  const eventName = requireString(rawInput.eventName, "Event name");
  const sport = rawInput.sport?.trim() || "Running";
  if (!SPORTS.has(sport)) throw new Error(`Unsupported sport: ${sport}`);
  const country = requireString(rawInput.country, "Country");
  const eventDate = rawInput.eventDate?.trim().slice(0, 10);
  if (!realDate(eventDate)) throw new Error("Event date must use YYYY-MM-DD");
  const distance = requireString(rawInput.distance, "Distance");
  const entryStatus = rawInput.entryStatus?.trim() || "TBC";
  if (!ENTRY_STATUSES.has(entryStatus)) throw new Error(`Unsupported entry status: ${entryStatus}`);
  const eventSlug = slugify(rawInput.eventSlug || eventName);
  if (!eventSlug) throw new Error("A permanent event slug could not be generated");
  const distanceKm = asNumber(rawInput.distanceKm, 0);
  if (distanceKm < 0) throw new Error("distanceKm cannot be negative");
  const officialWebsiteCandidate = httpUrl(
    rawInput.officialWebsiteCandidate,
    "Official website candidate",
  );
  const officialWebsiteEvidenceUrl = httpUrl(
    rawInput.officialWebsiteEvidenceUrl,
    "Official website evidence URL",
  );
  const fingerprint = candidateFingerprint({
    eventName,
    eventDate,
    distance,
    country,
    city: rawInput.city,
  });
  const sql = sqlOverride ?? (await getSql());

  return sql.transaction(async (tx) => {
    const sourceExists = await tx<{ exists: boolean }>`
      select (
        exists(select 1 from managed_fixture_sources where source_id = ${sourceId})
        or exists(select 1 from fixture_source_jobs where source_id = ${sourceId})
      ) as exists
    `;
    if (!sourceExists[0]?.exists) {
      throw new Error(`The discovery source is not registered: ${sourceId}`);
    }
    const existing = await tx<{ id: string }>`
      select id from fixture_verification_candidates where fingerprint = ${fingerprint} limit 1
    `;
    if (existing[0]) {
      return { candidateId: existing[0].id, reused: true };
    }

    const duplicate = await classifyDuplicate(tx, {
      eventSlug,
      eventName,
      country,
      city: rawInput.city?.trim() || "",
      organiser: rawInput.organiser?.trim() || "",
      eventDate,
      distance,
    });
    const candidateId = randomUUID();
    await tx.query(
      `insert into fixture_verification_candidates (
         id,
         fingerprint,
         source_id,
         discovery_url,
         event_slug,
         event_name,
         sport,
         country,
         county,
         city,
         area,
         venue,
         surface,
         organiser,
         official_website_candidate,
         official_website_evidence_url,
         event_date,
         distance_code,
         distance_km,
         start_time,
         entry_status,
         duplicate_status,
         matched_event_id,
         matched_edition_id,
         duplicate_note,
         created_by
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
         $12, $13, $14, $15, $16, $17::date, $18, $19, $20,
         $21, $22, $23, $24, $25, $26
       )`,
      [
        candidateId,
        fingerprint,
        sourceId,
        discoveryUrl,
        eventSlug,
        eventName,
        sport,
        country,
        rawInput.county?.trim() || "",
        rawInput.city?.trim() || "",
        rawInput.area?.trim() || "",
        rawInput.venue?.trim() || "",
        rawInput.surface?.trim() || "",
        rawInput.organiser?.trim() || "",
        officialWebsiteCandidate,
        officialWebsiteEvidenceUrl,
        eventDate,
        distance,
        distanceKm,
        rawInput.startTime?.trim() || null,
        entryStatus,
        duplicate.duplicateStatus,
        duplicate.matchedEventId,
        duplicate.matchedEditionId,
        duplicate.duplicateNote,
        actorEmail,
      ],
    );

    for (const entry of rawInput.entryOptions ?? []) {
      await stageEntryOption(tx, candidateId, entry);
    }
    for (const result of rawInput.resultLinks ?? []) {
      await stageResultLink(tx, candidateId, result);
    }
    const after = await getCandidate(tx, candidateId);
    await audit(
      tx,
      "fixture_candidate",
      candidateId,
      "staged",
      actorEmail,
      `Discovered from ${sourceId}`,
      null,
      after,
    );
    return { candidateId, reused: false, duplicate };
  });
}

function requiredCandidateChecks(candidate: CandidateRow): string[] {
  const errors: string[] = [];
  if (candidate.official_website_status !== "verified") {
    errors.push("The canonical official website has not been verified");
  }
  if (!candidate.official_website_candidate || !candidate.official_website_evidence_url) {
    errors.push("Official website and evidence URLs are required");
  }
  for (const [label, status] of [
    ["event name", candidate.event_name_check],
    ["organiser", candidate.organiser_check],
    ["date", candidate.date_check],
    ["distance", candidate.distance_check],
    ["location", candidate.location_check],
    ["cancellation/postponement", candidate.cancellation_check],
  ] as const) {
    if (status !== "verified") errors.push(`${label} is not verified`);
  }
  for (const [label, status] of [
    ["surface", candidate.surface_check],
    ["start time", candidate.start_time_check],
    ["entry status", candidate.entry_status_check],
  ] as const) {
    if (!["verified", "not_published", "not_applicable"].includes(status)) {
      errors.push(`${label} has not been resolved`);
    }
  }
  if (!["new", "matched_existing"].includes(candidate.duplicate_status)) {
    errors.push("The event duplicate review is incomplete");
  }
  if (candidate.overall_status !== "approved") {
    errors.push("The staff fixture review is not approved");
  }
  return errors;
}

function approvedEntryErrors(entries: CandidateEntryRow[]): string[] {
  const errors: string[] = [];
  const approved = entries.filter((entry) => entry.review_status === "approved");
  const primaries = approved.filter((entry) => entry.is_primary);
  if (approved.length && primaries.length !== 1) {
    errors.push("Approved entry routes require exactly one primary provider");
  }
  for (const entry of approved) {
    if (!["organiser_direct", "authorised_partner", "charity_place", "tour_operator"].includes(entry.provider_relationship)) {
      errors.push(`${entry.provider_name}: provider relationship is not approved`);
    }
    for (const [label, value] of [
      ["URL", entry.url_check],
      ["event", entry.event_check],
      ["edition", entry.edition_check],
    ] as const) {
      if (value !== "verified") errors.push(`${entry.provider_name}: ${label} is not verified`);
    }
    if (!["verified", "not_published", "not_applicable"].includes(entry.availability_check)) {
      errors.push(`${entry.provider_name}: availability has not been resolved`);
    }
    if (entry.duplicate_status !== "new") {
      errors.push(`${entry.provider_name}: duplicate resolution is incomplete`);
    }
  }
  const official = approved.find((entry) => entry.provider_relationship === "organiser_direct");
  if (official && primaries.length === 1 && !official.is_primary) {
    errors.push("The verified organiser-direct provider should be the primary entry route");
  }
  return errors;
}

function approvedResultErrors(results: CandidateResultRow[]): string[] {
  const errors: string[] = [];
  for (const result of results.filter((row) => row.review_status === "approved")) {
    for (const [label, value] of [
      ["URL", result.url_check],
      ["event", result.event_check],
      ["edition", result.edition_check],
      ["event-level scope", result.event_level_check],
      ["participant exclusion", result.participant_scope_check],
    ] as const) {
      if (value !== "verified") errors.push(`${result.provider_name}: ${label} is not verified`);
    }
    if (result.duplicate_status !== "new") {
      errors.push(`${result.provider_name}: duplicate resolution is incomplete`);
    }
  }
  return errors;
}

export async function updateCandidateReview(
  input: CandidateReviewInput,
  actorEmail: string,
) {
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const before = await getCandidate(tx, input.candidateId, true);
    if (before.workflow_status === "published") {
      throw new Error("A published candidate cannot be edited");
    }

    const eventName = input.eventName?.trim();
    const sport = input.sport?.trim();
    const country = input.country?.trim();
    const eventDate = input.eventDate?.trim().slice(0, 10);
    const distance = input.distance?.trim();
    if (!eventName) throw new Error("Event name is required");
    if (!SPORTS.has(sport)) throw new Error(`Unsupported sport: ${sport}`);
    if (!country) throw new Error("Country is required");
    if (!realDate(eventDate)) throw new Error("Event date must use YYYY-MM-DD");
    if (!distance) throw new Error("Distance is required");
    if (!OFFICIAL_SITE_STATUSES.has(input.officialWebsiteStatus)) {
      throw new Error("Official website status is invalid");
    }
    if (!DUPLICATE_STATUSES.has(input.duplicateStatus)) {
      throw new Error("Duplicate status is invalid");
    }
    if (!OVERALL_STATUSES.has(input.overallStatus)) {
      throw new Error("Overall review status is invalid");
    }
    const officialUrl = httpUrl(input.officialWebsiteCandidate, "Official website");
    const evidenceUrl = httpUrl(
      input.officialWebsiteEvidenceUrl,
      "Official website evidence URL",
    );
    if (input.officialWebsiteStatus === "verified" && (!officialUrl || !evidenceUrl)) {
      throw new Error("A verified official website needs both the final URL and evidence URL");
    }
    const distanceKm = Number(input.distanceKm ?? 0);
    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
      throw new Error("distanceKm must be zero or a positive number");
    }

    const fingerprint = candidateFingerprint({
      eventName,
      eventDate,
      distance,
      country,
      city: input.city,
    });
    const conflicting = await tx<{ id: string }>`
      select id
      from fixture_verification_candidates
      where fingerprint = ${fingerprint} and id <> ${input.candidateId}
      limit 1
    `;
    if (conflicting[0]) {
      throw new Error(`Another candidate already represents these event facts: ${conflicting[0].id}`);
    }

    await tx.query(
      `update fixture_verification_candidates
       set fingerprint = $2,
           event_slug = $3,
           event_name = $4,
           sport = $5,
           country = $6,
           county = $7,
           city = $8,
           area = $9,
           venue = $10,
           surface = $11,
           organiser = $12,
           official_website_candidate = $13,
           official_website_evidence_url = $14,
           official_website_status = $15,
           event_date = $16::date,
           distance_code = $17,
           distance_km = $18,
           start_time = $19,
           entry_status = $20,
           event_name_check = $21,
           organiser_check = $22,
           date_check = $23,
           distance_check = $24,
           location_check = $25,
           surface_check = $26,
           start_time_check = $27,
           entry_status_check = $28,
           cancellation_check = $29,
           duplicate_status = $30,
           matched_event_id = $31,
           matched_edition_id = $32,
           duplicate_note = $33,
           overall_status = $34,
           workflow_status = case
             when $34 = 'approved' then 'approved'
             when $34 = 'rejected' then 'rejected'
             else 'pending'
           end,
           review_note = $35,
           reviewed_by = $36,
           reviewed_at = now(),
           updated_at = now()
       where id = $1`,
      [
        input.candidateId,
        fingerprint,
        slugify(eventName),
        eventName,
        sport,
        country,
        input.county?.trim() || "",
        input.city?.trim() || "",
        input.area?.trim() || "",
        input.venue?.trim() || "",
        input.surface?.trim() || "",
        input.organiser?.trim() || "",
        officialUrl,
        evidenceUrl,
        input.officialWebsiteStatus,
        eventDate,
        distance,
        distanceKm,
        input.startTime?.trim() || null,
        input.entryStatus,
        factStatus(input.eventNameCheck, "Event name"),
        factStatus(input.organiserCheck, "Organiser"),
        factStatus(input.dateCheck, "Date"),
        factStatus(input.distanceCheck, "Distance"),
        factStatus(input.locationCheck, "Location"),
        factStatus(input.surfaceCheck, "Surface"),
        factStatus(input.startTimeCheck, "Start time"),
        factStatus(input.entryStatusCheck, "Entry status"),
        factStatus(input.cancellationCheck, "Cancellation/postponement"),
        input.duplicateStatus,
        input.matchedEventId ?? null,
        input.matchedEditionId ?? null,
        input.duplicateNote?.trim() || null,
        input.overallStatus,
        input.reviewNote?.trim() || null,
        actorEmail,
      ],
    );

    const after = await getCandidate(tx, input.candidateId);
    if (after.overall_status === "approved") {
      const errors = [
        ...requiredCandidateChecks(after),
        ...approvedEntryErrors(await candidateEntries(tx, input.candidateId)),
        ...approvedResultErrors(await candidateResults(tx, input.candidateId)),
      ];
      if (errors.length) {
        throw new Error(`Candidate cannot be approved: ${errors.join("; ")}`);
      }
    }
    await audit(
      tx,
      "fixture_candidate",
      input.candidateId,
      `review:${after.overall_status}`,
      actorEmail,
      input.reviewNote?.trim() || null,
      before,
      after,
    );
    return after;
  });
}

function requireApprovedEntry(input: VerificationEntryInput): void {
  if ((input.reviewStatus ?? "pending") !== "approved") return;
  const relationship = providerRelationship(input.providerRelationship);
  if (!["organiser_direct", "authorised_partner", "charity_place", "tour_operator"].includes(relationship)) {
    throw new Error("Approved entry providers require a confirmed provider relationship");
  }
  for (const [label, status] of [
    ["URL", factStatus(input.urlCheck, "Entry URL")],
    ["event", factStatus(input.eventCheck, "Entry event")],
    ["edition", factStatus(input.editionCheck, "Entry edition")],
  ] as const) {
    if (status !== "verified") throw new Error(`${label} must be verified before approval`);
  }
  if (!["verified", "not_published", "not_applicable"].includes(input.availabilityCheck ?? "")) {
    throw new Error("Availability must be verified, not published or not applicable");
  }
  if ((input.duplicateStatus ?? "pending") !== "new") {
    throw new Error("Resolve the entry-link duplicate before approval");
  }
}

export async function saveCandidateEntryOption(
  input: { candidateId: string; option: VerificationEntryInput },
  actorEmail: string,
) {
  requireApprovedEntry(input.option);
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const candidate = await getCandidate(tx, input.candidateId, true);
    if (candidate.workflow_status === "published") {
      throw new Error("Entry providers cannot be changed after candidate publication");
    }
    const before = input.option.id
      ? (
          await tx<CandidateEntryRow>`
            select * from fixture_candidate_entry_options where id = ${input.option.id} limit 1
          `
        )[0] ?? null
      : null;

    if (input.option.isPrimary) {
      await tx`
        update fixture_candidate_entry_options
        set is_primary = false, updated_at = now()
        where candidate_id = ${input.candidateId}
          and id <> ${input.option.id ?? ""}
      `;
    }
    const id = await stageEntryOption(tx, input.candidateId, input.option);
    await tx`
      update fixture_candidate_entry_options
      set reviewed_by = ${actorEmail},
          reviewed_at = now(),
          updated_at = now()
      where id = ${id}
    `;
    const after = (
      await tx<CandidateEntryRow>`
        select * from fixture_candidate_entry_options where id = ${id} limit 1
      `
    )[0];
    await audit(
      tx,
      "entry_option",
      id,
      before ? "updated" : "created",
      actorEmail,
      input.option.reviewNote?.trim() || null,
      before,
      after,
    );
    return after;
  });
}

function requireApprovedResult(input: VerificationResultInput): void {
  if ((input.reviewStatus ?? "pending") !== "approved") return;
  for (const [label, status] of [
    ["URL", factStatus(input.urlCheck, "Results URL")],
    ["event", factStatus(input.eventCheck, "Results event")],
    ["edition", factStatus(input.editionCheck, "Results edition")],
    ["event-level scope", factStatus(input.eventLevelCheck, "Results event-level scope")],
    ["participant exclusion", factStatus(input.participantScopeCheck, "Participant exclusion")],
  ] as const) {
    if (status !== "verified") throw new Error(`${label} must be verified before approval`);
  }
  if ((input.duplicateStatus ?? "pending") !== "new") {
    throw new Error("Resolve the result-link duplicate before approval");
  }
}

export async function saveCandidateResultLink(
  input: { candidateId: string; result: VerificationResultInput },
  actorEmail: string,
) {
  requireApprovedResult(input.result);
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const candidate = await getCandidate(tx, input.candidateId, true);
    if (candidate.workflow_status === "published") {
      throw new Error("Result links cannot be changed after candidate publication");
    }
    const before = input.result.id
      ? (
          await tx<CandidateResultRow>`
            select * from fixture_candidate_result_links where id = ${input.result.id} limit 1
          `
        )[0] ?? null
      : null;
    const id = await stageResultLink(tx, input.candidateId, input.result);
    await tx`
      update fixture_candidate_result_links
      set reviewed_by = ${actorEmail},
          reviewed_at = now(),
          updated_at = now()
      where id = ${id}
    `;
    const after = (
      await tx<CandidateResultRow>`
        select * from fixture_candidate_result_links where id = ${id} limit 1
      `
    )[0];
    await audit(
      tx,
      "result_link",
      id,
      before ? "updated" : "created",
      actorEmail,
      input.result.reviewNote?.trim() || null,
      before,
      after,
    );
    return after;
  });
}

async function upsertPublishedEntryOptions(
  sql: Sql,
  editionId: number,
  entries: CandidateEntryRow[],
  actorEmail: string,
): Promise<string | null> {
  const approved = entries.filter((entry) => entry.review_status === "approved");
  if (!approved.length) return null;
  const primary = approved.find((entry) => entry.is_primary);
  if (!primary) throw new Error("A primary approved entry route is required");

  await sql`
    update edition_entry_options
    set is_primary = false, updated_at = now()
    where edition_id = ${editionId}
  `;
  for (const entry of approved) {
    const isPrimary = entry.id === primary.id;
    const existingCanonical = await sql<{ id: number }>`
      select id
      from edition_entry_options
      where edition_id = ${editionId}
        and canonical_url = ${entry.canonical_url}
        and provider_code <> ${entry.provider_code}
      limit 1
    `;
    if (existingCanonical[0]) {
      await sql.query(
        `update edition_entry_options
         set provider_code = $2,
             provider_name = $3,
             entry_url = $4,
             entry_type = $5,
             status = $6,
             price_amount = $7,
             price_currency = $8,
             opens_at = $9::date,
             closes_at = $10::date,
             checked_at = now(),
             source_url = $11,
             is_verified = true,
             is_primary = $12,
             provider_relationship = $13,
             review_status = 'approved',
             reviewed_by = $14,
             reviewed_at = now(),
             review_note = $15,
             updated_at = now()
         where id = $1`,
        [
          existingCanonical[0].id,
          entry.provider_code,
          entry.provider_name,
          entry.entry_url,
          entry.entry_type,
          entry.status,
          entry.price_amount,
          entry.price_currency,
          entry.opens_at,
          entry.closes_at,
          entry.source_url,
          isPrimary,
          entry.provider_relationship,
          actorEmail,
          entry.review_note,
        ],
      );
    } else {
      await sql.query(
        `insert into edition_entry_options (
           edition_id,
           provider_code,
           provider_name,
           entry_url,
           canonical_url,
           entry_type,
           status,
           price_amount,
           price_currency,
           opens_at,
           closes_at,
           checked_at,
           source_url,
           is_verified,
           is_primary,
           provider_relationship,
           review_status,
           reviewed_by,
           reviewed_at,
           review_note,
           updated_at
         ) values (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10::date, $11::date, now(), $12, true, $13,
           $14, 'approved', $15, now(), $16, now()
         )
         on conflict (edition_id, provider_code) do update set
           provider_name = excluded.provider_name,
           entry_url = excluded.entry_url,
           canonical_url = excluded.canonical_url,
           entry_type = excluded.entry_type,
           status = excluded.status,
           price_amount = excluded.price_amount,
           price_currency = excluded.price_currency,
           opens_at = excluded.opens_at,
           closes_at = excluded.closes_at,
           checked_at = now(),
           source_url = excluded.source_url,
           is_verified = true,
           is_primary = excluded.is_primary,
           provider_relationship = excluded.provider_relationship,
           review_status = 'approved',
           reviewed_by = excluded.reviewed_by,
           reviewed_at = now(),
           review_note = excluded.review_note,
           updated_at = now()`,
        [
          editionId,
          entry.provider_code,
          entry.provider_name,
          entry.entry_url,
          entry.canonical_url,
          entry.entry_type,
          entry.status,
          entry.price_amount,
          entry.price_currency,
          entry.opens_at,
          entry.closes_at,
          entry.source_url,
          isPrimary,
          entry.provider_relationship,
          actorEmail,
          entry.review_note,
        ],
      );
    }
  }
  return primary.entry_url;
}

async function upsertPublishedResults(
  sql: Sql,
  editionId: number,
  results: CandidateResultRow[],
  actorEmail: string,
): Promise<number> {
  let inserted = 0;
  for (const result of results.filter((row) => row.review_status === "approved")) {
    await sql.query(
      `insert into edition_result_links (
         edition_id,
         provider_code,
         provider_name,
         results_url,
         canonical_url,
         source_url,
         registry_source_id,
         is_verified,
         status,
         checked_at,
         reviewed_by,
         review_note,
         updated_at
       ) values (
         $1, $2, $3, $4, $5, $6, null, true, 'approved', now(), $7, $8, now()
       )
       on conflict (edition_id, canonical_url) do update set
         provider_code = excluded.provider_code,
         provider_name = excluded.provider_name,
         results_url = excluded.results_url,
         source_url = excluded.source_url,
         is_verified = true,
         status = 'approved',
         checked_at = now(),
         reviewed_by = excluded.reviewed_by,
         review_note = excluded.review_note,
         updated_at = now()`,
      [
        editionId,
        result.provider_code,
        result.provider_name,
        result.results_url,
        result.canonical_url,
        result.source_url,
        actorEmail,
        result.review_note,
      ],
    );
    inserted += 1;
  }
  return inserted;
}

export async function publishVerificationCandidate(
  candidateId: string,
  actorEmail: string,
) {
  if (dbSource !== "neon") {
    throw new Error("Persistent Neon Postgres is required before publishing a verified fixture");
  }
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const candidate = await getCandidate(tx, candidateId, true);
    if (candidate.workflow_status === "published") {
      return {
        candidateId,
        reused: true,
        eventId: candidate.matched_event_id,
        editionId: candidate.matched_edition_id,
        entryOptionsPublished: 0,
        resultLinksPublished: 0,
      };
    }
    const entries = await candidateEntries(tx, candidateId);
    const results = await candidateResults(tx, candidateId);
    const errors = [
      ...requiredCandidateChecks(candidate),
      ...approvedEntryErrors(entries),
      ...approvedResultErrors(results),
    ];
    if (errors.length) {
      throw new Error(`Verified fixture cannot publish: ${errors.join("; ")}`);
    }

    let eventId = candidate.matched_event_id;
    if (candidate.duplicate_status === "matched_existing") {
      const matched = await tx<{ id: number; slug: string }>`
        select id, slug from events where id = ${eventId} for update
      `;
      if (!matched[0]) throw new Error("The matched event no longer exists");
      await tx.query(
        `update events
         set name = $2,
             sport = $3,
             country = $4,
             county = $5,
             city = $6,
             area = $7,
             surface = $8,
             organiser = $9,
             website = case when $10 = 'verified' then $11 else website end,
             official_website_status = case
               when $10 = 'verified' then 'verified'
               when $10 = 'not_found' then 'not_found'
               else official_website_status
             end,
             official_website_evidence_url = $12,
             official_website_checked_by = $13,
             official_website_checked_at = now(),
             official_website_review_note = $14
         where id = $1`,
        [
          eventId,
          candidate.event_name,
          candidate.sport,
          candidate.country,
          candidate.county,
          candidate.city,
          candidate.area,
          candidate.surface || "Other",
          candidate.organiser,
          candidate.official_website_status,
          candidate.official_website_candidate,
          candidate.official_website_evidence_url,
          actorEmail,
          candidate.review_note,
        ],
      );
    } else {
      const conflicting = await tx<{ id: number; name: string }>`
        select id, name from events where slug = ${candidate.event_slug} for update
      `;
      if (conflicting[0]) {
        throw new Error(
          `Event slug ${candidate.event_slug} was created after review; re-run duplicate review`,
        );
      }
      const inserted = await tx<{ id: number }>`
        insert into events (
          slug,
          name,
          sport,
          country,
          county,
          city,
          area,
          surface,
          summary,
          description,
          organiser,
          website,
          featured,
          official_website_status,
          official_website_evidence_url,
          official_website_checked_by,
          official_website_checked_at,
          official_website_review_note
        ) values (
          ${candidate.event_slug},
          ${candidate.event_name},
          ${candidate.sport},
          ${candidate.country},
          ${candidate.county},
          ${candidate.city},
          ${candidate.area},
          ${candidate.surface || "Other"},
          ${`${candidate.event_name} — verified ATHRECS fixture`},
          ${candidate.review_note ?? ""},
          ${candidate.organiser},
          ${candidate.official_website_status === "verified"
            ? candidate.official_website_candidate ?? ""
            : ""},
          false,
          ${candidate.official_website_status === "verified" ? "verified" : "not_found"},
          ${candidate.official_website_evidence_url},
          ${actorEmail},
          now(),
          ${candidate.review_note}
        )
        returning id
      `;
      eventId = inserted[0]?.id ?? null;
      if (!eventId) throw new Error("Could not create the verified event");
    }

    if (!eventId) throw new Error("A verified event could not be resolved");

    await tx`
      insert into event_distances (event_id, distance_code)
      values (${eventId}, ${candidate.distance_code})
      on conflict do nothing
    `;

    const editionRows = await tx<{ id: number }>`
      insert into editions (
        event_id,
        event_date,
        distance_code,
        distance_km,
        status,
        entry_url,
        source_url,
        start_time
      ) values (
        ${eventId},
        ${candidate.event_date}::date,
        ${candidate.distance_code},
        ${candidate.distance_km},
        ${candidate.entry_status},
        null,
        ${candidate.discovery_url},
        ${candidate.start_time}
      )
      on conflict (event_id, event_date, distance_code) do update set
        distance_km = excluded.distance_km,
        status = excluded.status,
        source_url = coalesce(excluded.source_url, editions.source_url),
        start_time = excluded.start_time
      returning id
    `;
    const editionId = editionRows[0]?.id;
    if (!editionId) throw new Error("Could not publish the verified edition");

    const primaryEntryUrl = await upsertPublishedEntryOptions(
      tx,
      editionId,
      entries,
      actorEmail,
    );
    if (primaryEntryUrl) {
      await tx`
        update editions set entry_url = ${primaryEntryUrl} where id = ${editionId}
      `;
    }
    const resultLinksPublished = await upsertPublishedResults(
      tx,
      editionId,
      results,
      actorEmail,
    );
    const beforeCandidate = candidate;
    await tx`
      update fixture_verification_candidates
      set workflow_status = 'published',
          matched_event_id = ${eventId},
          matched_edition_id = ${editionId},
          published_by = ${actorEmail},
          published_at = now(),
          updated_at = now()
      where id = ${candidateId}
    `;
    const afterCandidate = await getCandidate(tx, candidateId);
    await audit(
      tx,
      "fixture_candidate",
      candidateId,
      "published",
      actorEmail,
      candidate.review_note,
      beforeCandidate,
      afterCandidate,
    );
    return {
      candidateId,
      reused: false,
      eventId,
      editionId,
      entryOptionsPublished: entries.filter((entry) => entry.review_status === "approved").length,
      resultLinksPublished,
    };
  });
}

export async function getVerificationDashboard(input: {
  candidateId?: string;
  status?: "pending" | "approved" | "published" | "rejected" | "all";
}) {
  const sql = await getSql();
  const status = input.status ?? "pending";
  const candidates = input.candidateId
    ? [await getCandidate(sql, input.candidateId)]
    : await sql<CandidateRow>`
        select
          id,
          fingerprint,
          source_id,
          discovery_url,
          event_slug,
          event_name,
          sport,
          country,
          county,
          city,
          area,
          venue,
          surface,
          organiser,
          official_website_candidate,
          official_website_evidence_url,
          official_website_status,
          event_date::text as event_date,
          distance_code,
          distance_km,
          start_time,
          entry_status,
          event_name_check,
          organiser_check,
          date_check,
          distance_check,
          location_check,
          surface_check,
          start_time_check,
          entry_status_check,
          cancellation_check,
          duplicate_status,
          matched_event_id,
          matched_edition_id,
          duplicate_note,
          overall_status,
          workflow_status,
          review_note,
          reviewed_by,
          reviewed_at::text as reviewed_at,
          created_by,
          created_at::text as created_at,
          updated_at::text as updated_at,
          published_by,
          published_at::text as published_at
        from fixture_verification_candidates
        where ${status} = 'all' or workflow_status = ${status}
        order by created_at desc
        limit 100
      `;
  const selected = input.candidateId ? candidates[0] : null;
  const counts = await sql<{
    pending: number;
    approved: number;
    published: number;
    rejected: number;
  }>`
    select
      count(*) filter (where workflow_status = 'pending')::int as pending,
      count(*) filter (where workflow_status = 'approved')::int as approved,
      count(*) filter (where workflow_status = 'published')::int as published,
      count(*) filter (where workflow_status = 'rejected')::int as rejected
    from fixture_verification_candidates
  `;
  return {
    counts: counts[0] ?? { pending: 0, approved: 0, published: 0, rejected: 0 },
    candidates,
    selected: selected
      ? {
          candidate: selected,
          entries: await candidateEntries(sql, selected.id),
          results: await candidateResults(sql, selected.id),
          gateErrors: [
            ...requiredCandidateChecks(selected),
            ...approvedEntryErrors(await candidateEntries(sql, selected.id)),
            ...approvedResultErrors(await candidateResults(sql, selected.id)),
          ],
        }
      : null,
  };
}
