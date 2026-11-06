import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { scorePotentialResultNameMatch } from "./result-match.ts";
import {
  matchingNames,
  publicResultUrl,
  validBirthDate,
  type MatchingSettings,
} from "./result-matching-settings.ts";
import {
  FIN_RESEARCH_CANDIDATE_LIMIT,
  FIN_RESEARCH_DAILY_JOB_LIMIT,
  FIN_RESEARCH_LOCK_MS,
  FIN_RESEARCH_MAX_ATTEMPTS,
  FIN_RESEARCH_PAGE_LIMIT,
  FIN_RESEARCH_PAGE_TIMEOUT_MS,
  FIN_RESEARCH_PURPOSE,
  FIN_RESEARCH_SCOPE_TTL_MS,
  FIN_RESEARCH_SYSTEM_PROMPT,
  FIN_RESEARCH_TOKEN_TTL_MS,
  pageConfirmsCandidate,
  permittedResearchPrompt,
  normaliseResearchCandidates,
  type FinResearchAction,
  type NormalisedCandidate,
  type PermittedResearchIdentity,
  type ResearchHints,
} from "./fin-research.ts";

const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export class FinResearchError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "FinResearchError";
    this.code = code;
    this.status = status;
  }
}

export type ResearchActor =
  | { kind: "account"; userId: string }
  | { kind: "token"; token: string; allowStaleRevision?: boolean };

type Identity = PermittedResearchIdentity & {
  userId: string;
  email: string;
  emailVerified: boolean;
  dateOfBirth: string;
  externalSearchConsent: boolean;
  settingsRevision: string;
  profileRevision: string;
  settings: MatchingSettings | null;
  previousNames: string[];
};

type JobRow = {
  id: string;
  user_id: string;
  idempotency_key: string;
  scope_hash: string;
  state: "queued" | "running" | "completed" | "failed" | "cancelled";
  attempt_count: number;
  max_attempts: number;
  scope: ResearchScope | string;
  settings_revision: string;
  profile_revision: string;
  message: string;
  error_code: string | null;
  provider_calls: number;
  created_at: string;
  finished_at: string | null;
};

type ResearchScope = {
  eventName: string | null;
  year: number | null;
  names: string[];
  sourceUrls: string[];
};

export type ResearchProviderResult =
  | { ok: true; text: string; model?: string }
  | {
      ok: false;
      error: "missing-key" | "privacy-configuration" | "timeout" | "malformed" | "provider" | "settings-changed";
      model?: string;
    };

export type ResearchProvider = (input: {
  prompt: string;
  systemPrompt: string;
  signal: AbortSignal;
  maySend: () => Promise<boolean>;
}) => Promise<ResearchProviderResult>;

export type SourcePageFetcher = (
  url: string,
  signal: AbortSignal,
) => Promise<{ ok: true; text: string; contentType?: string } | { ok: false; inaccessible: true }>;

type CandidateRow = {
  id: string;
  job_id: string;
  user_id: string;
  athlete_name: string;
  event_name: string;
  event_date: string;
  sport: string;
  discipline: string;
  distance: string;
  chip_time: string;
  gun_time: string;
  published_finish_time: string;
  timing_label: string;
  finish_status: string;
  overall_position: number | null;
  gender_position: number | null;
  category_position: number | null;
  source_url: string;
  source_provider: string;
  checked_at: string;
  row_locator: string;
  supporting_clues: string[] | string;
  conflicting_evidence: string[] | string;
  evidence_level: "suggested" | "source_checked" | "athlete_supplied";
  source_accessible: boolean | null;
  catalogue_result_id: number | null;
  linked_to_account: boolean;
  already_on_profile: boolean;
  review_state: "unreviewed" | "selected" | "rejected" | "uncertain";
  private_notes: string;
};

const QUEUED_MESSAGE =
  "Your public result search has started. AthRecs is checking organiser and official pages separately. Nothing has been found, claimed or published yet.";
const RUNNING_MESSAGE =
  "Your public result search is still running. You can leave this page and come back. A matching name would not prove the result is yours.";
const CONSENT_MESSAGE =
  "Turn on the separate public-results search choice in your AthRecs account before this search can use your saved racing names, public links, club and general location. Birth date, email, phone and address are not sent. No search was started.";
const INELIGIBLE_MESSAGE =
  "Public-results searches are available to adults with a saved birth date. Under-18 and guardian searches need staff assistance; internal AthRecs suggestions remain available.";
const SETTINGS_MESSAGE =
  "Your details or search choices changed. No new results were saved. Check your choices before starting another search.";
const WITHDRAWN_MESSAGE =
  "Public result search was stopped because that permission was turned off. Unsaved research was discarded. Your account is otherwise unchanged.";
const INTERRUPTED_MESSAGE =
  "The search was interrupted and could not be recovered safely. Nothing new was saved. You can start a new search.";

function scopeOf(value: JobRow["scope"]): ResearchScope {
  const scope = typeof value === "string" ? (JSON.parse(value) as ResearchScope) : value;
  return {
    eventName: scope?.eventName ?? null,
    year: scope?.year ?? null,
    names: Array.isArray(scope?.names) ? scope.names : [],
    sourceUrls: Array.isArray(scope?.sourceUrls) ? scope.sourceUrls : [],
  };
}

function hintsOf(scope: ResearchScope): ResearchHints {
  return {
    eventName: scope.eventName || undefined,
    year: scope.year ?? undefined,
  };
}

function jsonArray(value: CandidateRow["supporting_clues"]): string[] {
  const parsed = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
}

async function loadIdentity(sql: Sql, userId: string): Promise<Identity | null> {
  const [row] = await sql<{
    email: string;
    email_verified: boolean;
    full_name: string | null;
    display_name: string | null;
    auth_name: string | null;
    previous_names: string[] | null;
    city: string | null;
    region: string | null;
    country: string | null;
    club_or_team: string | null;
    parkrun_id: string | null;
    athletics_urn: string | null;
    power_of_10_url: string | null;
    world_athletics_url: string | null;
    fingerprint_event: string | null;
    fingerprint_year: string | null;
    fingerprint_distance: string | null;
    fingerprint_time: string | null;
    date_of_birth: string | null;
    profile_revision: string | null;
    matching_settings: MatchingSettings | null;
    settings_revision: string | null;
  }>`
    select account_user.email as email,
      account_user."emailVerified" as email_verified,
      account_user.name as auth_name,
      profile.full_name, profile.display_name, profile.previous_names, profile.city, profile.region,
      profile.country, profile.club_or_team, profile.parkrun_id, profile.athletics_urn,
      profile.power_of_10_url, profile.world_athletics_url, profile.fingerprint_event,
      profile.fingerprint_year, profile.fingerprint_distance, profile.fingerprint_time,
      profile.date_of_birth::text as date_of_birth, profile.updated_at::text as profile_revision,
      settings.settings as matching_settings, settings.updated_at::text as settings_revision
    from "user" account_user
    left join athlete_private_profiles profile on profile.user_id = account_user."id"
    left join athlete_result_matching_settings settings on settings.user_id = account_user."id"
    where account_user."id" = ${userId}
    limit 1`;
  if (!row) return null;
  const settings = row.matching_settings;
  const safeLink = (value: string | null): string | null => {
    if (!value) return null;
    try {
      return publicResultUrl(value);
    } catch {
      return null;
    }
  };
  const sourceUrls = (settings?.sourceUrls ?? []).map((url) => safeLink(url)).filter((url): url is string => Boolean(url));
  const previousNames = Array.isArray(row.previous_names) ? row.previous_names : [];
  const names = matchingNames(row.full_name, previousNames, settings, [
    row.display_name,
    row.auth_name,
  ]);
  return {
    userId,
    email: row.email,
    emailVerified: row.email_verified === true,
    fullName: (row.full_name ?? "").trim(),
    searchedNames: names,
    sourceUrls,
    club: (row.club_or_team ?? "").trim(),
    city: (row.city ?? "").trim(),
    region: (row.region ?? "").trim(),
    country: (row.country ?? "").trim(),
    parkrunId: (row.parkrun_id ?? "").trim(),
    athleticsUrn: (row.athletics_urn ?? "").trim(),
    powerOf10Url: safeLink(row.power_of_10_url),
    worldAthleticsUrl: safeLink(row.world_athletics_url),
    knownRace: {
      event: (row.fingerprint_event ?? "").trim(),
      year: (row.fingerprint_year ?? "").trim(),
      distance: (row.fingerprint_distance ?? "").trim(),
      time: (row.fingerprint_time ?? "").trim(),
    },
    dateOfBirth: (row.date_of_birth ?? "").slice(0, 10),
    externalSearchConsent: settings?.externalSearchConsent === true,
    settingsRevision: row.settings_revision ?? "",
    profileRevision: row.profile_revision ?? "",
    settings,
    previousNames,
  };
}

function adult(identity: Identity, now: Date): boolean {
  const cutoff = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()));
  return validBirthDate(identity.dateOfBirth, now) && identity.dateOfBirth <= cutoff.toISOString().slice(0, 10);
}

function gate(identity: Identity, now: Date): FinResearchError | null {
  if (!identity.emailVerified)
    return new FinResearchError(
      "verify_email",
      403,
      "Verify your email before searching public results. No search was started.",
    );
  if (!identity.fullName)
    return new FinResearchError(
      "identity_required",
      403,
      "Save your full name before searching public result sites. No search was started.",
    );
  if (!identity.externalSearchConsent) return new FinResearchError("consent_required", 403, CONSENT_MESSAGE);
  if (!adult(identity, now)) return new FinResearchError("ineligible", 403, INELIGIBLE_MESSAGE);
  return null;
}

async function resolveActor(
  sql: Sql,
  actor: ResearchActor,
  now: Date,
  requireCurrent: boolean,
): Promise<Identity> {
  if (actor.kind === "account") {
    if (!actor.userId || actor.userId === "dev-user")
      throw new FinResearchError("user_authorisation_required", 403, "Sign in to your AthRecs account to continue.");
    const identity = await loadIdentity(sql, actor.userId);
    if (!identity) throw new FinResearchError("user_authorisation_required", 403, "Sign in to your AthRecs account to continue.");
    return identity;
  }
  const [token] = await sql<{
    user_id: string;
    purpose: string;
    settings_revision: string;
    profile_revision: string;
    expires_at: string;
    revoked_at: string | null;
  }>`select user_id, purpose, settings_revision, profile_revision, expires_at::text, revoked_at::text
    from fin_research_tokens where token_hash=${hash(actor.token)} limit 1`;
  if (
    !token ||
    token.purpose !== FIN_RESEARCH_PURPOSE ||
    token.revoked_at ||
    new Date(token.expires_at).getTime() <= now.getTime()
  )
    throw new FinResearchError(
      "user_authorisation_required",
      403,
      "This research code is missing or no longer valid. Authorise research again from your AthRecs account.",
    );
  const identity = await loadIdentity(sql, token.user_id);
  if (!identity)
    throw new FinResearchError(
      "user_authorisation_required",
      403,
      "This research code is missing or no longer valid. Authorise research again from your AthRecs account.",
    );
  if (!identity.externalSearchConsent && actor.kind === "token" && requireCurrent)
    throw new FinResearchError("consent_required", 403, WITHDRAWN_MESSAGE);
  if (
    requireCurrent &&
    !actor.allowStaleRevision &&
    (identity.settingsRevision !== token.settings_revision || identity.profileRevision !== token.profile_revision)
  )
    throw new FinResearchError("settings_changed", 409, SETTINGS_MESSAGE);
  return identity;
}

export async function issueFinResearchToken(
  sql: Sql,
  userId: string,
  continuation: string,
  now = new Date(),
): Promise<{ token: string; expiresAt: string }> {
  if (!userId || userId === "dev-user")
    throw new FinResearchError("user_authorisation_required", 403, "Sign in to your AthRecs account to continue.");
  const { parseFinContinuation } = await import("./fin-onboarding.ts");
  if (!parseFinContinuation(continuation))
    throw new FinResearchError("invalid_request", 400, "Open the saved search from your AthRecs link before authorising research.");
  return sql.transaction(async (tx) => {
    const [handoff] = await tx<{ request_key_hash: string; consumed_by: string | null; expires_at: string }>`
      select request_key_hash, consumed_by, expires_at::text
      from fin_onboarding_handoffs where token_hash=${hash(continuation)} for update`;
    if (!handoff || handoff.consumed_by !== userId || new Date(handoff.expires_at).getTime() <= now.getTime())
      throw new FinResearchError(
        "user_authorisation_required",
        403,
        "Authorise research from the account that opened this saved search.",
      );
    const identity = await loadIdentity(tx, userId);
    if (!identity) throw new FinResearchError("user_authorisation_required", 403, "Sign in to your AthRecs account to continue.");
    const blocked = gate(identity, now);
    if (blocked) throw blocked;
    const [count] = await tx<{ total: number }>`select count(*)::int as total from fin_research_tokens
      where user_id=${userId} and created_at > ${new Date(now.getTime() - 60 * 60 * 1000)}`;
    if ((count?.total ?? 0) >= 10)
      throw new FinResearchError("rate_limited", 429, "Too many research codes were created. Please try again later.");
    await tx`update fin_research_tokens set revoked_at=${now}
      where user_id=${userId} and revoked_at is null`;
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + FIN_RESEARCH_TOKEN_TTL_MS);
    await tx`insert into fin_research_tokens
      (token_hash, user_id, purpose, handoff_key, settings_revision, profile_revision, created_at, expires_at)
      values (${hash(token)}, ${userId}, ${FIN_RESEARCH_PURPOSE}, ${handoff.request_key_hash},
        ${identity.settingsRevision}, ${identity.profileRevision}, ${now}, ${expiresAt})`;
    return { token, expiresAt: expiresAt.toISOString() };
  });
}

function buildScope(
  identity: Identity,
  hints: ResearchHints,
  refresh?: string,
): ResearchScope & { refresh?: string } {
  return {
    eventName: hints.eventName ?? null,
    year: hints.year ?? null,
    names: identity.searchedNames,
    sourceUrls: identity.sourceUrls,
    ...(refresh ? { refresh } : {}),
  };
}

export async function startFinResultResearch(
  sql: Sql,
  actor: ResearchActor,
  input: { requestId: string; eventName?: string; year?: number; refresh?: string },
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  const identity = await resolveActor(sql, actor, now, true);
  const blocked = gate(identity, now);
  if (blocked) throw blocked;
  const refresh = input.refresh && /^[a-z0-9]{8,32}$/.test(input.refresh) ? input.refresh : undefined;
  const scope = buildScope(identity, input, refresh);
  const scopeHash = hash(JSON.stringify(scope));
  const idempotencyKey = hash(input.requestId);
  const job = await sql.transaction(async (tx) => {
    const [sameRequest] = await tx<JobRow>`select id, user_id, idempotency_key, scope_hash, state, attempt_count,
      max_attempts, scope, settings_revision, profile_revision, message, error_code, provider_calls,
      created_at::text, finished_at::text
      from fin_result_research_jobs where user_id=${identity.userId} and idempotency_key=${idempotencyKey} for update`;
    if (sameRequest) {
      if (sameRequest.scope_hash !== scopeHash)
        throw new FinResearchError(
          "request_conflict",
          409,
          "This research request was already used for different details. Start a new request.",
        );
      return sameRequest;
    }
    const [sameScope] = await tx<JobRow>`select id, user_id, idempotency_key, scope_hash, state, attempt_count,
      max_attempts, scope, settings_revision, profile_revision, message, error_code, provider_calls,
      created_at::text, finished_at::text
      from fin_result_research_jobs
      where user_id=${identity.userId} and scope_hash=${scopeHash}
        and state in ('queued','running','completed')
        and created_at > ${new Date(now.getTime() - FIN_RESEARCH_SCOPE_TTL_MS)}
      order by created_at desc limit 1 for update`;
    if (sameScope) return sameScope;
    const [usage] = await tx<{ total: number }>`select count(*)::int as total from fin_result_research_jobs
      where user_id=${identity.userId} and created_at > ${new Date(now.getTime() - FIN_RESEARCH_SCOPE_TTL_MS)}`;
    if ((usage?.total ?? 0) >= FIN_RESEARCH_DAILY_JOB_LIMIT)
      throw new FinResearchError(
        "rate_limited",
        429,
        "The research limit for this account has been reached for now. You can still review earlier suggestions or continue your profile.",
      );
    const id = randomUUID();
    await tx`insert into fin_result_research_jobs
      (id, user_id, idempotency_key, scope_hash, state, attempt_count, max_attempts, scope,
       settings_revision, profile_revision, message, provider_calls, created_at, updated_at)
      values (${id}, ${identity.userId}, ${idempotencyKey}, ${scopeHash}, 'queued', 0,
        ${FIN_RESEARCH_MAX_ATTEMPTS}, ${JSON.stringify(scope)}::jsonb, ${identity.settingsRevision},
        ${identity.profileRevision}, ${QUEUED_MESSAGE}, 0, ${now}, ${now})`;
    const [created] = await tx<JobRow>`select id, user_id, idempotency_key, scope_hash, state, attempt_count,
      max_attempts, scope, settings_revision, profile_revision, message, error_code, provider_calls,
      created_at::text, finished_at::text
      from fin_result_research_jobs where id=${id}`;
    return created;
  });
  return { httpStatus: 200, body: await presentJob(sql, job, identity, false) };
}

async function ownedJob(sql: Sql, identity: Identity, jobId: string): Promise<JobRow> {
  const [job] = await sql<JobRow>`select id, user_id, idempotency_key, scope_hash, state, attempt_count,
    max_attempts, scope, settings_revision, profile_revision, message, error_code, provider_calls,
    created_at::text, finished_at::text
    from fin_result_research_jobs where id=${jobId} and user_id=${identity.userId} limit 1`;
  if (!job)
    throw new FinResearchError("not_found", 404, "This search is not available to this account.");
  return job;
}

function performanceOf(row: Pick<CandidateRow, "chip_time" | "gun_time" | "published_finish_time" | "finish_status">): boolean {
  return Boolean(row.chip_time || row.gun_time || row.published_finish_time || row.finish_status);
}

export async function readFinResultResearch(
  sql: Sql,
  actor: ResearchActor,
  jobId: string,
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  const identity = await resolveActor(sql, actor, now, false);
  const job = await ownedJob(sql, identity, jobId);
  const hideCandidates = actor.kind === "token" && !identity.externalSearchConsent;
  return { httpStatus: 200, body: await presentJob(sql, job, identity, hideCandidates) };
}

async function candidatesFor(sql: Sql, jobId: string, userId: string): Promise<CandidateRow[]> {
  return sql<CandidateRow>`select id, job_id, user_id, athlete_name, event_name, event_date, sport, discipline,
    distance, chip_time, gun_time, published_finish_time, timing_label, finish_status, overall_position,
    gender_position, category_position, source_url, source_provider, checked_at::text, row_locator,
    supporting_clues, conflicting_evidence, evidence_level, source_accessible, catalogue_result_id,
    linked_to_account, already_on_profile, review_state, private_notes
    from fin_result_research_candidates where job_id=${jobId} and user_id=${userId}
    order by created_at, id`;
}

async function draftState(sql: Sql, userId: string, jobId: string): Promise<Record<string, unknown>> {
  const [draft] = await sql<{ id: string; full_name: string; updated_at: string }>`
    select id, full_name, updated_at::text from fin_research_profile_drafts
    where user_id=${userId} and job_id=${jobId} limit 1`;
  if (!draft)
    return { status: "not_saved", claimSubmitted: false, profilePublished: false };
  return {
    status: "draft_saved",
    draftId: draft.id,
    fullName: draft.full_name,
    updatedAt: new Date(draft.updated_at).toISOString(),
    claimSubmitted: false,
    profilePublished: false,
  };
}

async function presentJob(
  sql: Sql,
  job: JobRow,
  identity: Identity,
  hideCandidates: boolean,
): Promise<Record<string, unknown>> {
  const rows = hideCandidates ? [] : await candidatesFor(sql, job.id, identity.userId);
  const draft = await draftState(sql, identity.userId, job.id);
  const phase =
    draft.status === "draft_saved" && job.state === "completed"
      ? "draft_saved"
      : job.state === "completed"
        ? rows.length
          ? "suggestions_found"
          : "no_matches"
        : job.state;
  return {
    status: phase,
    jobId: job.id,
    state: job.state,
    message: hideCandidates ? WITHDRAWN_MESSAGE : job.message,
    pollAfterSeconds: job.state === "queued" || job.state === "running" ? 10 : undefined,
    eventName: scopeOf(job.scope).eventName,
    year: scopeOf(job.scope).year,
    candidates: rows.map(athleteCandidate),
    draft,
    outcomes: {
      suggestionsFound: job.state === "completed" && rows.length > 0,
      draftSaved: draft.status === "draft_saved",
      claimSubmitted: false,
      profilePublished: false,
      signupCounted: false,
    },
  };
}

function athleteCandidate(row: CandidateRow): Record<string, unknown> {
  const note =
    row.evidence_level === "athlete_supplied"
      ? "You supplied this link. A result was not created from the link alone."
      : row.evidence_level === "source_checked"
        ? "The athlete name and performance or event date were read on the source page. This is not proof the account owns the result."
        : row.source_accessible === false
          ? "The source page could not be opened. This remains an unchecked suggestion."
          : "This suggestion was not confirmed on the source page. A matching name is not ownership.";
  return {
    id: row.id,
    athleteName: row.athlete_name,
    eventName: row.event_name,
    eventDate: row.event_date,
    sport: row.sport,
    discipline: row.discipline,
    distance: row.distance,
    chipTime: row.chip_time,
    gunTime: row.gun_time,
    publishedFinishTime: row.published_finish_time,
    timingLabel: row.timing_label,
    finishStatus: row.finish_status,
    overallPosition: row.overall_position,
    genderPosition: row.gender_position,
    categoryPosition: row.category_position,
    sourceUrl: row.source_url,
    sourceProvider: row.source_provider,
    checkedAt: new Date(row.checked_at).toISOString(),
    rowLocator: row.row_locator,
    supportingClues: jsonArray(row.supporting_clues),
    conflictingEvidence: jsonArray(row.conflicting_evidence),
    evidenceLevel: row.evidence_level,
    sourceAccessible: row.source_accessible,
    ownership: "not_confirmed",
    catalogueResultId: row.catalogue_result_id,
    linkedToThisAccount: row.linked_to_account,
    alreadyOnProfile: row.already_on_profile,
    review: row.review_state,
    note,
  };
}

export async function reviewFinResultResearch(
  sql: Sql,
  actor: ResearchActor,
  jobId: string,
  decisions: Array<{ candidateId: string; decision: "selected" | "rejected" | "uncertain" }>,
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  const identity = await resolveActor(sql, actor, now, false);
  if (!identity.externalSearchConsent && actor.kind === "token")
    throw new FinResearchError("consent_required", 403, WITHDRAWN_MESSAGE);
  await sql.transaction(async (tx) => {
    const job = await ownedJob(tx, identity, jobId);
    if (job.state !== "completed")
      throw new FinResearchError("invalid_request", 409, "Results can be reviewed after the search has finished.");
    const rows = await candidatesFor(tx, jobId, identity.userId);
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (const decision of decisions) {
      if (!byId.has(decision.candidateId))
        throw new FinResearchError("invalid_request", 400, "One of those results is not part of this search.");
      await tx`update fin_result_research_candidates set review_state=${decision.decision}
        where id=${decision.candidateId} and user_id=${identity.userId} and job_id=${jobId}`;
    }
    await tx`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
      values (${identity.userId}, ${jobId}, 'candidates_reviewed', ${`${jobId}:candidates_reviewed`}, ${now})
      on conflict (outcome_key) do nothing`;
    const accepted = decisions.some((decision) => {
      const row = byId.get(decision.candidateId);
      return decision.decision === "selected" && row && row.evidence_level !== "athlete_supplied" && performanceOf(row);
    });
    if (accepted)
      await tx`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
        values (${identity.userId}, ${jobId}, 'first_accepted_result', ${`${identity.userId}:first_accepted_result`}, ${now})
        on conflict (outcome_key) do nothing`;
  });
  const job = await ownedJob(sql, identity, jobId);
  return { httpStatus: 200, body: await presentJob(sql, job, identity, false) };
}

export async function supplyFinResultLink(
  sql: Sql,
  actor: ResearchActor,
  jobId: string,
  sourceUrl: string,
  fetcher: SourcePageFetcher,
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  const identity = await resolveActor(sql, actor, now, true);
  const blocked = gate(identity, now);
  if (blocked) throw blocked;
  let safeUrl = "";
  try {
    safeUrl = publicResultUrl(sourceUrl);
  } catch {
    throw new FinResearchError("invalid_request", 400, "Enter a public HTTPS result link. No result was created.");
  }
  const job = await ownedJob(sql, identity, jobId);
  if (job.state !== "completed")
    throw new FinResearchError("invalid_request", 409, "Add a link after the search has finished, or start a new search.");
  let accessible = false;
  try {
    const page = await fetcher(safeUrl, AbortSignal.timeout(FIN_RESEARCH_PAGE_TIMEOUT_MS));
    accessible = page.ok;
  } catch {
    accessible = false;
  }
  const key = `lead|${safeUrl.toLowerCase()}`;
  await sql`insert into fin_result_research_candidates
    (id, job_id, user_id, candidate_key, athlete_name, event_name, event_date, sport, discipline, distance,
     chip_time, gun_time, published_finish_time, timing_label, finish_status, source_url, source_provider,
     checked_at, row_locator, supporting_clues, conflicting_evidence, evidence_level, source_accessible,
     linked_to_account, already_on_profile, review_state, private_notes, created_at)
    values (${randomUUID()}, ${jobId}, ${identity.userId}, ${key}, ${identity.fullName},
      ${scopeOf(job.scope).eventName || "Link supplied by athlete"}, '', '', '', '', '', '', '', '', '',
      ${safeUrl}, 'other', ${now}, '', '[]'::jsonb, '[]'::jsonb, 'athlete_supplied', ${accessible},
      false, ${identity.sourceUrls.includes(safeUrl)}, 'unreviewed',
      ${"Athlete-supplied link. No performance was extracted."}, ${now})
    on conflict (job_id, candidate_key) do nothing`;
  const body = await presentJob(sql, job, identity, false);
  body.status = "link_saved";
  body.resultCreated = false;
  body.message =
    "Your link was saved for review. A result was not created from the link alone, and nothing was published.";
  return { httpStatus: 200, body };
}

export async function saveFinResearchDraft(
  sql: Sql,
  actor: ResearchActor,
  input: { jobId: string; fullName: string; currentClub?: string; candidateIds: string[]; privacyAcknowledged: true },
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  if (input.privacyAcknowledged !== true)
    throw new FinResearchError("invalid_request", 400, "Please read the privacy notice before saving a private draft.");
  const identity = await resolveActor(sql, actor, now, false);
  if (!identity.emailVerified)
    throw new FinResearchError("verify_email", 403, "Verify your email before saving a private profile draft.");
  if (actor.kind === "token" && !identity.externalSearchConsent)
    throw new FinResearchError("consent_required", 403, WITHDRAWN_MESSAGE);
  await sql.transaction(async (tx) => {
    const job = await ownedJob(tx, identity, input.jobId);
    if (job.state !== "completed")
      throw new FinResearchError("invalid_request", 409, "Save a draft after the search has finished. You can also continue your profile with no results.");
    const rows = await candidatesFor(tx, job.id, identity.userId);
    const byId = new Map(rows.map((row) => [row.id, row]));
    const selected: CandidateRow[] = [];
    for (const id of input.candidateIds) {
      const row = byId.get(id);
      if (!row) throw new FinResearchError("invalid_request", 400, "One of those results is not part of this search.");
      if (row.review_state === "rejected" || row.review_state === "uncertain")
        throw new FinResearchError(
          "invalid_request",
          409,
          "Rejected or uncertain results stay out of the draft. Select a result or leave it out.",
        );
      selected.push(row);
    }
    for (const row of selected)
      await tx`update fin_result_research_candidates set review_state='selected'
        where id=${row.id} and user_id=${identity.userId}`;
    const urls = [
      ...new Set(selected.map((row) => row.source_url).filter((url) => url.startsWith("https://"))),
    ];
    const details = {
      fullName: input.fullName,
      currentClub: input.currentClub ?? identity.club,
      previousClubs: identity.settings?.previousClubs ?? [],
      previousNames: identity.previousNames,
      sourceUrls: urls,
      privacyAcknowledged: true,
      researchJobId: job.id,
      candidateIds: selected.map((row) => row.id),
    };
    const fingerprint = hash(JSON.stringify(details));
    await tx`insert into athlete_private_profiles
      (user_id, verified_email, full_name, club_or_team, previous_names, privacy_notice_version, privacy_acknowledged_at, updated_at)
      values (${identity.userId}, ${identity.email}, ${input.fullName}, ${input.currentClub || null},
        ${identity.previousNames}, ${"result-matching-optional-2026-10-13"}, ${now}, ${now})
      on conflict (user_id) do update set full_name=excluded.full_name,
        club_or_team=coalesce(excluded.club_or_team, athlete_private_profiles.club_or_team),
        privacy_notice_version=excluded.privacy_notice_version,
        privacy_acknowledged_at=excluded.privacy_acknowledged_at,
        updated_at=athlete_private_profiles.updated_at`;
    const currentUrls = identity.sourceUrls;
    const merged = [...new Set([...currentUrls, ...urls])];
    const nextSettings = { ...(identity.settings ?? {}), sourceUrls: merged };
    await tx`insert into athlete_result_matching_settings (user_id, settings, notice_version, updated_at)
      values (${identity.userId}, ${JSON.stringify(nextSettings)}::jsonb, ${"result-matching-optional-2026-10-13"}, ${now})
      on conflict (user_id) do update set
        settings = athlete_result_matching_settings.settings || jsonb_build_object('sourceUrls', ${JSON.stringify(merged)}::jsonb),
        updated_at = athlete_result_matching_settings.updated_at`;
    await tx`insert into fin_research_profile_drafts
      (id, user_id, job_id, fingerprint, full_name, details, published, claim_submitted, created_at, updated_at)
      values (${randomUUID()}, ${identity.userId}, ${job.id}, ${fingerprint}, ${input.fullName},
        ${JSON.stringify(details)}::jsonb, false, false, ${now}, ${now})
      on conflict (user_id, job_id) do update set fingerprint=excluded.fingerprint, full_name=excluded.full_name,
        details=excluded.details, published=false, claim_submitted=false, updated_at=${now}`;
    await tx`insert into athlete_profile_setup_requests (user_id, details, fingerprint, created_at)
      values (${identity.userId}, ${JSON.stringify(details)}::jsonb, ${fingerprint}, ${now})
      on conflict (user_id, fingerprint) do nothing`;
    await tx`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
      values (${identity.userId}, ${job.id}, 'profile_draft_saved', ${`${identity.userId}:profile_draft_saved`}, ${now})
      on conflict (outcome_key) do nothing`;
    if (selected.some((row) => row.evidence_level !== "athlete_supplied" && performanceOf(row)))
      await tx`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
        values (${identity.userId}, ${job.id}, 'first_accepted_result', ${`${identity.userId}:first_accepted_result`}, ${now})
        on conflict (outcome_key) do nothing`;
  });
  const job = await ownedJob(sql, identity, input.jobId);
  const body = await presentJob(sql, job, identity, false);
  body.status = "draft_saved";
  body.message =
    "Your private profile draft was saved. No claim was submitted and the profile was not published.";
  return { httpStatus: 200, body };
}

export async function continueFinProfileSetup(
  sql: Sql,
  actor: ResearchActor,
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  const identity = await resolveActor(sql, actor, now, false);
  await sql`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
    values (${identity.userId}, null, 'profile_setup_continued', ${`${identity.userId}:profile_setup_continued`}, ${now})
    on conflict (outcome_key) do nothing`;
  return {
    httpStatus: 200,
    body: {
      status: "profile_setup_continued",
      message: "You can finish your private profile even if no public results were found. Nothing was published.",
      outcomes: {
        suggestionsFound: false,
        draftSaved: false,
        claimSubmitted: false,
        profilePublished: false,
        signupCounted: false,
      },
    },
  };
}

/** Stops provider work when saved choices change. Withdrawn consent also deletes research rows. */
export async function discardFinResearchAfterSettingsChange(
  sql: Sql,
  userId: string,
  consentGranted: boolean,
  now = new Date(),
): Promise<void> {
  const [ready] = await sql<{ ok: boolean }>`select to_regclass('public.fin_research_tokens') is not null as ok`;
  if (!ready?.ok) return;
  await sql`update fin_research_tokens set revoked_at=${now}
    where user_id=${userId} and revoked_at is null`;
  if (!consentGranted) {
    await sql`delete from fin_result_research_candidates where user_id=${userId}`;
    await sql`delete from fin_research_profile_drafts where user_id=${userId}`;
    await sql`update fin_result_research_jobs set state='cancelled', error_code='consent_withdrawn',
      message=${WITHDRAWN_MESSAGE}, finished_at=coalesce(finished_at, ${now}), updated_at=${now}, locked_until=null
      where user_id=${userId} and state in ('queued','running','completed')`;
    return;
  }
  await sql`update fin_result_research_jobs set state='failed', error_code='settings_changed',
    message=${SETTINGS_MESSAGE}, finished_at=${now}, updated_at=${now}, locked_until=null
    where user_id=${userId} and state in ('queued','running')`;
}

async function catalogueMatch(
  sql: Sql,
  userId: string,
  sourceUrl: string,
): Promise<{ resultId: number | null; linked: boolean }> {
  const [ready] = await sql<{ results: string | null; editions: string | null; links: string | null }>`
    select to_regclass('public.results')::text as results, to_regclass('public.editions')::text as editions,
      to_regclass('public.athlete_account_links')::text as links`;
  if (!ready?.results || !ready.editions) return { resultId: null, linked: false };
  const [match] = await sql<{ result_id: number; athlete_id: number }>`
    select result.id as result_id, result.athlete_id
    from results result
    join editions edition on edition.id = result.edition_id
    where edition.source_url=${sourceUrl}
    limit 1`;
  if (!match) return { resultId: null, linked: false };
  if (!ready.links) return { resultId: match.result_id, linked: false };
  const [link] = await sql<{ ok: number }>`select 1 as ok from athlete_account_links
    where athlete_id=${match.athlete_id} and user_id=${userId} and status='active' limit 1`;
  return { resultId: match.result_id, linked: Boolean(link) };
}

function assessCandidate(identity: Identity, candidate: NormalisedCandidate): {
  supporting: string[];
  conflicting: string[];
  keep: boolean;
} {
  const evidence = scorePotentialResultNameMatch(
    identity.searchedNames,
    candidate.athleteName,
    {
      clubOrTeam: identity.club,
      city: identity.city,
      region: identity.region,
      country: identity.country,
      dateOfBirth: identity.dateOfBirth,
    },
    {
      clubName: candidate.club,
      city: candidate.location,
      eventDate: candidate.eventDate,
      category: candidate.category,
      ageAtRace: candidate.ageAtRace,
    },
  );
  if (!evidence) return { supporting: [], conflicting: [], keep: false };
  const conflicting = evidence.reasons.filter((reason) => /check this match|before your saved birth date/i.test(reason));
  const supporting = evidence.reasons.filter((reason) => !conflicting.includes(reason));
  if (candidate.parkrunTimeAdjusted)
    supporting.push("Parkrun time kept as the published finish time, not a chip time.");
  return { supporting, conflicting, keep: true };
}

async function failJob(
  sql: Sql,
  jobId: string,
  code: string,
  message: string,
  now: Date,
  state: "failed" | "cancelled" = "failed",
): Promise<void> {
  await sql`update fin_result_research_jobs set state=${state}, error_code=${code}, message=${message},
    finished_at=${now}, updated_at=${now}, locked_until=null where id=${jobId}`;
  await sql`delete from fin_result_research_candidates where job_id=${jobId}`;
}

export async function processFinResearchQueue(
  sql: Sql,
  deps: { provider: ResearchProvider; fetcher: SourcePageFetcher },
  options: { now?: Date; limit?: number } = {},
): Promise<{ processed: number }> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 1;
  await sql`update fin_result_research_jobs set state='failed', error_code='interrupted', message=${INTERRUPTED_MESSAGE},
    finished_at=${now}, updated_at=${now}, locked_until=null
    where state='running' and locked_until <= ${now} and attempt_count >= max_attempts`;
  let processed = 0;
  for (let index = 0; index < limit; index += 1) {
    const claimed = await claimJob(sql, now);
    if (!claimed) break;
    await runClaimedJob(sql, claimed, deps, now);
    processed += 1;
  }
  return { processed };
}

async function claimJob(sql: Sql, now: Date): Promise<JobRow | null> {
  return sql.transaction(async (tx) => {
    const [row] = await tx<JobRow>`select id, user_id, idempotency_key, scope_hash, state, attempt_count,
      max_attempts, scope, settings_revision, profile_revision, message, error_code, provider_calls,
      created_at::text, finished_at::text
      from fin_result_research_jobs
      where (state='queued' or (state='running' and locked_until <= ${now}))
        and attempt_count < max_attempts
      order by created_at
      limit 1
      for update skip locked`;
    if (!row) return null;
    if (row.attempt_count >= row.max_attempts) {
      await tx`update fin_result_research_jobs set state='failed', error_code='interrupted', message=${INTERRUPTED_MESSAGE},
        finished_at=${now}, updated_at=${now}, locked_until=null where id=${row.id}`;
      return null;
    }
    const attempt = row.attempt_count + 1;
    const lockedUntil = new Date(now.getTime() + FIN_RESEARCH_LOCK_MS);
    await tx`update fin_result_research_jobs set state='running', attempt_count=${attempt}, locked_until=${lockedUntil},
      started_at=coalesce(started_at, ${now}), updated_at=${now}, message=${RUNNING_MESSAGE} where id=${row.id}`;
    return { ...row, state: "running", attempt_count: attempt };
  });
}

async function runClaimedJob(
  sql: Sql,
  job: JobRow,
  deps: { provider: ResearchProvider; fetcher: SourcePageFetcher },
  now: Date,
): Promise<void> {
  const fresh = await loadIdentity(sql, job.user_id);
  if (!fresh || !fresh.externalSearchConsent) {
    await failJob(sql, job.id, "consent_withdrawn", WITHDRAWN_MESSAGE, now, "cancelled");
    return;
  }
  if (fresh.settingsRevision !== job.settings_revision || fresh.profileRevision !== job.profile_revision) {
    await failJob(sql, job.id, "settings_changed", SETTINGS_MESSAGE, now);
    return;
  }
  const blocked = gate(fresh, now);
  if (blocked) {
    await failJob(sql, job.id, blocked.code, blocked.message, now);
    return;
  }
  const prompt = permittedResearchPrompt(fresh, hintsOf(scopeOf(job.scope)));
  const maySend = async () => {
    const current = await loadIdentity(sql, job.user_id);
    return Boolean(
      current?.externalSearchConsent &&
        current.settingsRevision === job.settings_revision &&
        current.profileRevision === job.profile_revision,
    );
  };
  let result: ResearchProviderResult;
  try {
    result = await deps.provider({
      prompt,
      systemPrompt: FIN_RESEARCH_SYSTEM_PROMPT,
      signal: AbortSignal.timeout(20_000),
      maySend,
    });
  } catch {
    result = { ok: false, error: "timeout" };
  }
  await sql`update fin_result_research_jobs set provider_calls=provider_calls+1, updated_at=${now} where id=${job.id}`;
  if (!result.ok) {
    if (result.error === "settings-changed" || !(await maySend())) {
      const current = await loadIdentity(sql, job.user_id);
      if (!current?.externalSearchConsent)
        await failJob(sql, job.id, "consent_withdrawn", WITHDRAWN_MESSAGE, now, "cancelled");
      else await failJob(sql, job.id, "settings_changed", SETTINGS_MESSAGE, now);
      return;
    }
    if (result.error === "timeout" || result.error === "provider") {
      if (job.attempt_count < job.max_attempts) {
        await sql`update fin_result_research_jobs set state='queued', locked_until=null, updated_at=${now},
          message=${"The search is waiting to try again. No results have been saved yet."} where id=${job.id}`;
        return;
      }
      await failJob(
        sql,
        job.id,
        result.error === "timeout" ? "provider_timeout" : "provider_unavailable",
        "The public result search did not finish. Nothing new was saved. You can try again, add a result link, or continue your profile.",
        now,
      );
      return;
    }
    const unavailable = result.error === "missing-key" || result.error === "privacy-configuration";
    await failJob(
      sql,
      job.id,
      unavailable ? "provider_unavailable" : "malformed_output",
      unavailable
        ? "Public result search is not available right now. No personal details were sent. You can still set up your profile."
        : "The search did not return usable sourced results. No results were added.",
      now,
    );
    return;
  }
  if (!(await maySend())) {
    const current = await loadIdentity(sql, job.user_id);
    if (!current?.externalSearchConsent)
      await failJob(sql, job.id, "consent_withdrawn", WITHDRAWN_MESSAGE, now, "cancelled");
    else await failJob(sql, job.id, "settings_changed", SETTINGS_MESSAGE, now);
    return;
  }
  const normalised = normaliseResearchCandidates(result.text);
  if (normalised.unparseable) {
    await failJob(
      sql,
      job.id,
      "malformed_output",
      "The search did not return usable sourced results. No results were added.",
      now,
    );
    return;
  }
  const prepared: Array<NormalisedCandidate & { supporting: string[]; conflicting: string[]; accessible: boolean | null; checked: boolean; privateNotes: string }> = [];
  let inaccessible = 0;
  for (const candidate of normalised.candidates) {
    const assessment = assessCandidate(fresh, candidate);
    if (!assessment.keep) continue;
    let accessible: boolean | null = null;
    let checked = false;
    let privateNotes = "";
    if (prepared.filter((item) => item.checked || item.accessible === false).length < FIN_RESEARCH_PAGE_LIMIT) {
      try {
        const page = await deps.fetcher(candidate.sourceUrl, AbortSignal.timeout(FIN_RESEARCH_PAGE_TIMEOUT_MS));
        if (!page.ok || (page.contentType ?? "").includes("pdf")) {
          accessible = false;
          inaccessible += 1;
          privateNotes = page.ok ? "PDF source was not text-checked." : "Source could not be opened.";
        } else if (pageConfirmsCandidate(candidate, page.text.slice(0, 200_000))) {
          accessible = true;
          checked = true;
          privateNotes = "Source page contained the athlete name and a performance or event date.";
        } else {
          accessible = true;
          privateNotes = "Fetched page did not contain this athlete and performance. Page text was not trusted as instructions.";
          assessment.conflicting.push("The opened source page did not show this athlete and performance.");
        }
      } catch {
        accessible = false;
        inaccessible += 1;
        privateNotes = "Source could not be opened.";
      }
    }
    prepared.push({ ...candidate, supporting: assessment.supporting, conflicting: assessment.conflicting, accessible, checked, privateNotes });
  }
  const stillAllowed = await sql.transaction(async (tx) => {
    const current = await loadIdentity(tx, job.user_id);
    if (
      !current?.externalSearchConsent ||
      current.settingsRevision !== job.settings_revision ||
      current.profileRevision !== job.profile_revision
    )
      return current;
    await tx`delete from fin_result_research_candidates where job_id=${job.id}`;
    for (const candidate of prepared) {
      const catalogue = await catalogueMatch(tx, job.user_id, candidate.sourceUrl);
      const already = current.sourceUrls.includes(candidate.sourceUrl);
      await tx`insert into fin_result_research_candidates
        (id, job_id, user_id, candidate_key, athlete_name, event_name, event_date, sport, discipline, distance,
         chip_time, gun_time, published_finish_time, timing_label, finish_status, overall_position, gender_position,
         category_position, source_url, source_provider, checked_at, row_locator, supporting_clues,
         conflicting_evidence, evidence_level, source_accessible, catalogue_result_id, linked_to_account,
         already_on_profile, review_state, private_notes, created_at)
        values (${randomUUID()}, ${job.id}, ${job.user_id}, ${candidate.candidateKey}, ${candidate.athleteName},
          ${candidate.eventName}, ${candidate.eventDate}, ${candidate.sport}, ${candidate.discipline},
          ${candidate.distance}, ${candidate.chipTime}, ${candidate.gunTime}, ${candidate.publishedFinishTime},
          ${candidate.timingLabel}, ${candidate.finishStatus}, ${candidate.overallPosition}, ${candidate.genderPosition},
          ${candidate.categoryPosition}, ${candidate.sourceUrl}, ${candidate.sourceProvider}, ${now},
          ${candidate.rowLocator}, ${JSON.stringify(candidate.supporting)}::jsonb,
          ${JSON.stringify(candidate.conflicting)}::jsonb,
          ${candidate.checked ? "source_checked" : "suggested"}, ${candidate.accessible}, ${catalogue.resultId},
          ${catalogue.linked}, ${already}, 'unreviewed', ${candidate.privateNotes}, ${now})
        on conflict (job_id, candidate_key) do nothing`;
    }
    const message = prepared.length
      ? inaccessible
        ? "Some sources could not be opened. Checked rows were read on the source page; the others are unconfirmed suggestions. None of this confirms ownership or publishes a profile."
        : "Possible public results are ready to review. A source check is not ownership, and nothing has been claimed or published."
      : "No sourced public results were found for the saved details. You can add a result link, change the event details, or continue your profile. This does not mean you have no results.";
    await tx`update fin_result_research_jobs set state='completed', message=${message}, error_code=null,
      finished_at=${now}, updated_at=${now}, locked_until=null where id=${job.id}`;
    await tx`insert into fin_research_outcomes (user_id, job_id, outcome, outcome_key, created_at)
      values (${job.user_id}, ${job.id}, 'search_completed', ${`${job.id}:search_completed`}, ${now})
      on conflict (outcome_key) do nothing`;
    return current;
  });
  if (
    !stillAllowed ||
    !stillAllowed.externalSearchConsent ||
    stillAllowed.settingsRevision !== job.settings_revision ||
    stillAllowed.profileRevision !== job.profile_revision
  ) {
    await sql`delete from fin_result_research_candidates where job_id=${job.id}`;
    if (!stillAllowed?.externalSearchConsent)
      await failJob(sql, job.id, "consent_withdrawn", WITHDRAWN_MESSAGE, now, "cancelled");
    else await failJob(sql, job.id, "settings_changed", SETTINGS_MESSAGE, now);
  }
}

export async function listStaffFinResearch(sql: Sql, limit = 50): Promise<Array<Record<string, unknown>>> {
  const jobs = await sql<JobRow & { private_note_count: number }>`select job.id, job.user_id, job.idempotency_key,
    job.scope_hash, job.state, job.attempt_count, job.max_attempts, job.scope, job.settings_revision,
    job.profile_revision, job.message, job.error_code, job.provider_calls, job.created_at::text, job.finished_at::text
    from fin_result_research_jobs job order by job.created_at desc limit ${limit}`;
  const listed = [];
  for (const job of jobs) {
    const notes = await sql<{ id: string; private_notes: string; source_url: string }>`
      select id, private_notes, source_url from fin_result_research_candidates where job_id=${job.id}`;
    listed.push({
      jobId: job.id,
      userId: job.user_id,
      state: job.state,
      errorCode: job.error_code,
      providerCalls: job.provider_calls,
      privateNotes: notes.map((note) => ({
        candidateId: note.id,
        sourceUrl: note.source_url,
        note: note.private_notes,
      })),
    });
  }
  return listed;
}

export async function handleFinResearchAction(
  sql: Sql,
  action: FinResearchAction,
  fetcher: SourcePageFetcher,
  now = new Date(),
): Promise<{ httpStatus: number; body: Record<string, unknown> }> {
  if (action.action === "start_result_research")
    return startFinResultResearch(sql, { kind: "token", token: action.userActionToken }, action, now);
  if (action.action === "get_result_research")
    return readFinResultResearch(sql, { kind: "token", token: action.userActionToken }, action.jobId, now);
  if (action.action === "review_result_research")
    return reviewFinResultResearch(
      sql,
      { kind: "token", token: action.userActionToken },
      action.jobId,
      action.decisions,
      now,
    );
  if (action.action === "save_research_profile_draft")
    return saveFinResearchDraft(sql, { kind: "token", token: action.userActionToken }, action, now);
  if (action.action === "supply_result_link")
    return supplyFinResultLink(
      sql,
      { kind: "token", token: action.userActionToken },
      action.jobId,
      action.sourceUrl,
      fetcher,
      now,
    );
  return continueFinProfileSetup(sql, { kind: "token", token: action.userActionToken }, now);
}

export async function fetchPublicSourcePage(
  url: string,
  signal: AbortSignal,
): Promise<{ ok: true; text: string; contentType?: string } | { ok: false; inaccessible: true }> {
  try {
    const safe = publicResultUrl(url);
    const response = await fetch(safe, {
      method: "GET",
      redirect: "follow",
      signal,
      headers: { Accept: "text/html,text/plain" },
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, inaccessible: true };
    }
    try {
      publicResultUrl(response.url || safe);
    } catch {
      await response.body?.cancel().catch(() => undefined);
      return { ok: false, inaccessible: true };
    }
    const contentType = response.headers.get("content-type") ?? "";
    const text = (await response.text()).slice(0, 200_000);
    return { ok: true, text, contentType };
  } catch {
    return { ok: false, inaccessible: true };
  }
}

export async function cleanupFinResearch(sql: Sql, now = new Date()): Promise<void> {
  const [ready] = await sql<{ ok: boolean }>`select to_regclass('public.fin_research_tokens') is not null as ok`;
  if (!ready?.ok) return;
  await sql`delete from fin_research_tokens where expires_at <= ${now}`;
}
