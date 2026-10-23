import { createHash } from "node:crypto";
import { z } from "zod";

const object = z.record(z.string(), z.unknown());
const stamp = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) &&
      Number.isFinite(Date.parse(value)),
    "Use the actual ISO capture/review date or timestamp.",
  );
const evidenceSchema = z
  .object({
    sourceUrl: z
      .string()
      .url()
      .refine((value) => new URL(value).protocol === "https:"),
    sourceKind: z.enum(["governing_body", "organiser", "official_timer", "owner_accepted_source"]),
    authorityEvidence: z.string().trim().min(12).max(4000),
    locator: z.string().trim().min(2).max(1000),
    captureKind: z.enum(["live", "retained_capture"]),
    capturedAt: stamp,
    checkedAt: stamp,
    captureReference: z.string().trim().min(3).max(2000).optional(),
    captureGuard: z
      .object({
        id: z.union([
          z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          z.string().regex(/^[1-9]\d*$/),
        ]),
        provider: z.string().min(1).max(200),
        sourceKey: z.string().min(1).max(2000),
        payloadHash: z.string().regex(/^[a-f0-9]{64}$/),
        sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
    identityEvidence: z.string().trim().min(12).max(8000),
    sourceChecked: z.literal(true),
    fieldsCompared: z
      .object({
        athleteIdentity: z.literal(true),
        race: z.literal(true),
        editionDate: z.literal(true),
        distance: z.literal(true),
        finishStatus: z.literal(true),
        timing: z.literal(true),
        placings: z.literal(true),
      })
      .strict(),
    sourceRow: object.refine(
      (value) => Object.keys(value).length > 0,
      "Retain the compared source row.",
    ),
    note: z.string().trim().min(12).max(8000),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.captureKind === "retained_capture" && !value.captureReference)
      ctx.addIssue({ code: "custom", message: "Retained evidence needs its capture reference." });
    if (value.captureGuard && value.captureKind !== "retained_capture")
      ctx.addIssue({
        code: "custom",
        message: "A stored capture guard must describe retained evidence honestly.",
      });
    if (
      !value.captureGuard &&
      /^(?:\d+)$|result_archive_source_captures|\bdb[-_ ]?capture\b|\bdatabase capture\b|\bcapture(?:[_ -]?id)?\s*[:#=]\s*\d/i.test(
        value.captureReference ?? "",
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "A database capture reference requires its apply-time captureGuard.",
      });
    if (Date.parse(value.capturedAt) > Date.parse(value.checkedAt))
      ctx.addIssue({
        code: "custom",
        message: "The original capture cannot be later than its review.",
      });
  });
const overrideSchema = z
  .object({
    reason: z.string().trim().min(20).max(8000),
    // Exact private snapshots make an intentional override distinct from ignoring a prior review.
    staffVerification: z.unknown().optional(),
    rejectedRequests: z.array(object).max(100).optional(),
  })
  .strict();
const reviewSchema = z
  .object({
    index: z.number().int().min(0),
    evidence: evidenceSchema,
    overrideDecision: overrideSchema.optional(),
  })
  .strict();
const targetResultSchema = z
  .object({
    kind: z.literal("result"),
    resultId: z.number().int().positive().max(2147483647),
    athleteId: z.number().int().positive().max(2147483647),
  })
  .strict();
const targetHistorySchema = z
  .object({
    kind: z.literal("history"),
    athleteId: z.number().int().positive().max(2147483647),
    provider: z.string().min(1).max(200),
    externalId: z.string().min(1).max(1000),
  })
  .strict();
const profileGuardSchema = z
  .object({
    displayName: z.string(),
    gender: z.string().nullable(),
    parentAthleteId: z.number().int().positive().nullable(),
    sourceUrl: z.string().nullable(),
    profileDetails: object,
    activeAccountLinks: z
      .array(z.object({ user_id: z.string(), status: z.literal("active") }).strict())
      .max(100),
  })
  .strict();
const planSchema = z
  .object({
    schemaVersion: z.literal(1),
    batchId: z.string().regex(/^[a-z][a-z0-9-]{7,119}$/),
    reviewedAt: stamp,
    actor: z
      .object({
        kind: z.literal("automation"),
        name: z.string().trim().min(3).max(200),
        purpose: z.string().trim().min(12).max(2000),
      })
      .strict(),
    entries: z
      .array(
        z.union([
          z
            .object({
              target: targetResultSchema,
              before: object,
              evidence: evidenceSchema,
              profileGuard: profileGuardSchema.optional(),
              overrideDecision: overrideSchema.optional(),
            })
            .strict(),
          z
            .object({
              target: targetHistorySchema,
              before: z.array(object).min(1).max(10000),
              reviews: z.array(reviewSchema).min(1).max(2000),
              profileGuard: profileGuardSchema.optional(),
            })
            .strict(),
        ]),
      )
      .min(1)
      .max(200),
  })
  .strict();

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stable(item)]),
    );
  return value;
}
const same = (a, b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));
const json = (value) => JSON.stringify(value);
const key = (target) => json(stable(target));
const checkedReviews = (entry) => (entry.target.kind === "history" ? entry.reviews : [entry]);
const beforePerformance = (entry, review) =>
  entry.target.kind === "history"
    ? entry.before[review.index]
    : (entry.before.result_details ?? {});

function hasValue(value) {
  if (value == null || value === false || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}
function hasUnresolvedReview(value) {
  if (!hasValue(value)) return false;
  if (typeof value !== "object" || Array.isArray(value)) return true;
  const resolved =
    value.resolved === true ||
    /^(?:resolved|cleared)$/i.test(String(value.status ?? value.state ?? ""));
  return (
    !resolved ||
    [value.activeHold, value.conflicting, value.holdReasons, value.conflicts].some(hasValue)
  );
}
const nonFinish =
  /\b(?:DQ|DSQ|DNF|DNS|DNC|DNQ|NM|NH|disqualified|withdrawn|retired|did not (?:finish|start))\b/i;
function checkResultHolds(row, container = {}, today = new Date().toISOString().slice(0, 10)) {
  if (
    [row.sourceIdentityReview, row.sourceQualificationReview].some(hasUnresolvedReview) ||
    [
      row.conflicting,
      row.conflict,
      row.conflicts,
      row.conflictingSource,
      row.sourceConflict,
      row.identityConflict,
      row.resultConflict,
      row.timingConflict,
      row.placingConflict,
      row.activeHold,
      row.held,
      row.onHold,
      row.reviewRequired,
      row.holdReasons,
      row.heldReasons,
      container.conflicting,
      container.conflicts,
    ].some(hasValue)
  )
    throw new Error(
      "Resolve active source identity, qualification, conflict or hold decisions before verification.",
    );
  const mark = [
    container.status,
    row.status,
    row.sourceStatus,
    row.performance,
    row.reportedPerformance,
  ]
    .filter(Boolean)
    .join(" ");
  if (row.disqualification || nonFinish.test(mark))
    throw new Error(
      "Non-finish or disqualification records require a separate reviewed correction.",
    );
  const date = row.date || row.eventDate || container.event_date || container.eventDate;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date) && date.slice(0, 10) > today)
    throw new Error("Future result dates cannot be source-verified by this completion batch.");
  const year = Number(row.year);
  if (Number.isFinite(year) && year > Number(today.slice(0, 4)))
    throw new Error("Future result years cannot be source-verified by this completion batch.");
}

/** Schema validation is not source verification: the reviewer must inspect the actual evidence. */
export function validateSourceVerificationPlan(input, now = new Date()) {
  if (Buffer.byteLength(JSON.stringify(input), "utf8") > 10 * 1024 * 1024)
    throw new Error("Verification plans are limited to 10 MiB.");
  const plan = planSchema.parse(input),
    targets = new Set();
  if (Date.parse(plan.reviewedAt) > now.getTime()) throw new Error("Review date is in the future.");
  let performanceCount = 0;
  for (const entry of plan.entries) {
    const id = key(entry.target);
    if (targets.has(id)) throw new Error("Duplicate verification target.");
    targets.add(id);
    if (
      entry.target.kind === "result" &&
      (entry.before.id !== entry.target.resultId ||
        entry.before.athlete_id !== entry.target.athleteId)
    )
      throw new Error("Result preimage does not match its target athlete and result ID.");
    const indexes = new Set();
    for (const review of checkedReviews(entry)) {
      performanceCount++;
      if (entry.target.kind === "history") {
        if (indexes.has(review.index) || !entry.before[review.index])
          throw new Error("Duplicate or missing history index.");
        indexes.add(review.index);
      }
      if (Date.parse(review.evidence.checkedAt) > Date.parse(plan.reviewedAt))
        throw new Error("Evidence review is later than the reviewed plan.");
      const row = beforePerformance(entry, review);
      if (!row || typeof row !== "object" || Array.isArray(row))
        throw new Error("Invalid result details preimage.");
      checkResultHolds(
        row,
        entry.target.kind === "result" ? entry.before : {},
        now.toISOString().slice(0, 10),
      );
      if (
        row.syntheticTest ||
        row.disqualification ||
        /conflicting (?:source|details|result)|disputed placing/i.test(
          String(row.notes ?? row.note ?? ""),
        )
      )
        throw new Error(
          "Resolve synthetic, disqualified or conflicting evidence before verification.",
        );
      if (row.verificationStatus != null && row.verificationStatus !== "unverified")
        throw new Error("The plan must contain only currently unverified results.");
      if (
        row.staffVerification &&
        !same(row.staffVerification, review.overrideDecision?.staffVerification)
      )
        throw new Error(
          "An explicit staff decision requires its exact reviewed override snapshot.",
        );
      if (
        review.overrideDecision?.staffVerification &&
        !same(row.staffVerification, review.overrideDecision.staffVerification)
      )
        throw new Error("Staff override snapshot is stale.");
    }
  }
  if (performanceCount > 2000)
    throw new Error("A verification batch is limited to 2,000 performances.");
  return plan;
}

export function sourceVerificationPlanHash(input) {
  const plan = validateSourceVerificationPlan(input);
  return createHash("sha256")
    .update(json(stable(plan)))
    .digest("hex");
}

async function loadEntry(tx, entry) {
  const target = entry.target;
  if (target.kind === "result") {
    const [row] = await tx.query(
      "select to_jsonb(r) as value from results r where r.id=$1 and r.athlete_id=$2 for update",
      [target.resultId, target.athleteId],
    );
    return row?.value;
  }
  const [row] = await tx.query(
    "select performances as value from athlete_source_histories where athlete_id=$1 and provider=$2 and external_id=$3 for update",
    [target.athleteId, target.provider, target.externalId],
  );
  return row?.value;
}

async function historyMirrors(tx, target) {
  return tx.query(
    "select * from source_history_claim_results where provider=$1 and external_id=$2 order by id for update",
    [target.provider, target.externalId],
  );
}

async function checkProfiles(tx, entries) {
  const ids = [...new Set(entries.map((entry) => entry.target.athleteId))].sort((a, b) => a - b);
  const profiles = await tx.query(
    `select id,jsonb_build_object('displayName',display_name,'gender',gender,
      'parentAthleteId',parent_athlete_id,'sourceUrl',source_url,'profileDetails',profile_details) as snapshot
     from athletes where id=any($1::int[]) order by id for update`,
    [ids],
  );
  if (profiles.length !== ids.length) throw new Error("A target athlete no longer exists.");
  for (const profile of profiles) {
    const details = profile.snapshot.profileDetails ?? {};
    checkResultHolds(details);
    if (details.syntheticTest)
      throw new Error("Synthetic athlete profiles cannot be source-verified.");
  }
  const guardedIds = [
    ...new Set(
      entries.filter((entry) => entry.profileGuard).map((entry) => entry.target.athleteId),
    ),
  ].sort((a, b) => a - b);
  if (!guardedIds.length) return;
  // Lock inactive rows too: an existing revoked link could otherwise become active
  // without acquiring a new foreign-key lock on the already locked athlete.
  const links = await tx.query(
    "select athlete_id,user_id,status from athlete_account_links where athlete_id=any($1::int[]) order by athlete_id,user_id for update",
    [guardedIds],
  );
  const sortLinks = (values) => [...values].sort((a, b) => a.user_id.localeCompare(b.user_id));
  for (const entry of entries) {
    if (!entry.profileGuard) continue;
    const profile = profiles.find((row) => row.id === entry.target.athleteId);
    const current = {
      ...profile.snapshot,
      activeAccountLinks: sortLinks(
        links
          .filter((link) => link.athlete_id === entry.target.athleteId && link.status === "active")
          .map(({ user_id, status }) => ({ user_id, status })),
      ),
    };
    if (
      !same(current, {
        ...entry.profileGuard,
        activeAccountLinks: sortLinks(entry.profileGuard.activeAccountLinks),
      })
    )
      throw new Error(
        "The reviewed athlete identity/profile or active account links have changed.",
      );
  }
}

function requestKeys(entry, review, mirrors) {
  if (entry.target.kind === "result") return [`r:${entry.target.resultId}`];
  const { athleteId, provider, externalId } = entry.target;
  const keys =
    provider === "AthRecs additions" ? [`h:${athleteId}:${externalId}:${review.index}`] : [];
  const sourceRow = entry.before[review.index].archiveReference?.sourceRow;
  if (sourceRow)
    keys.push(
      ...mirrors.filter((row) => row.source_key === sourceRow).map((row) => `r:${-row.id}`),
    );
  return keys;
}

async function checkRequests(tx, athleteId, keys, review) {
  if (!keys.length) {
    if (review.overrideDecision?.rejectedRequests?.length)
      throw new Error("Rejected-request override has no matching request target.");
    return [];
  }
  const requests = await tx.query(
    "select to_jsonb(v) as value from athlete_result_verification_requests v where athlete_id=$1 and result_key=any($2::text[]) order by id for update",
    [athleteId, keys],
  );
  const rejected = requests.map((row) => row.value).filter((row) => row.status === "rejected");
  const overrides = review.overrideDecision?.rejectedRequests ?? [];
  if (!same(rejected, overrides))
    throw new Error("Rejected verification requests need exact reviewed override snapshots.");
  return requests;
}

async function checkCaptureGuard(tx, evidence) {
  const guard = evidence.captureGuard;
  if (!guard) return;
  const rows = await tx.query(
    `select c.id from result_archive_source_captures c
     join result_archive_capture_approvals a on a.id=c.approval_id
     where c.id=$1::bigint and c.provider=$2 and c.source_key=$3
       and c.payload_hash=$4 and c.html_sha256=$5 and c.source_check='compared'
       and a.provider=c.provider and a.scope='staff_only' and a.revoked_at is null
       and (case when length($6::text)=10 then c.captured_at::date=$6::date else c.captured_at=$6::timestamptz end)
       and not exists(select 1 from result_archive_source_captures newer
         where newer.provider=c.provider and newer.source_key=c.source_key
           and (newer.captured_at,newer.id)>(c.captured_at,c.id))
     for share of c,a`,
    [
      guard.id,
      guard.provider,
      guard.sourceKey,
      guard.payloadHash,
      guard.sourceSha256,
      evidence.capturedAt,
    ],
  );
  if (rows.length !== 1)
    throw new Error(
      "Retained capture is stale, superseded, uncompared, revoked or differs from the reviewed hashes/date.",
    );
}

/**
 * Runs in one transaction. Dry-run executes the real updates/triggers, then rolls back.
 * The SQL adapter must provide query(text, params)->rows and transaction(callback).
 * No source is trusted by URL alone, and this helper never fetches or invents evidence.
 */
export async function applySourceVerificationPlan(sql, input, { dryRun = true } = {}) {
  const plan = validateSourceVerificationPlan(input),
    planHash = sourceVerificationPlanHash(plan);
  const rollback = new Error("source-verification-dry-run-rollback");
  let receipt;
  try {
    return await sql.transaction(async (tx) => {
      await tx.query("set local lock_timeout='8s'");
      await tx.query("set local statement_timeout='55s'");
      // The archive's existing identity lock serializes batches and source-identity changes.
      const lock = await tx.query(
        "select version from result_archive_identity_clock where singleton for update",
      );
      if (lock.length !== 1) throw new Error("The archive identity lock is unavailable.");
      const previous = await tx.query(
        "select after_value from network_audit_log where entity_type='source_verification_batch' and entity_id=$1 order by id desc limit 1",
        [plan.batchId],
      );
      const ordered = [...plan.entries].sort((a, b) => key(a.target).localeCompare(key(b.target)));
      await checkProfiles(tx, ordered);
      if (previous.length) {
        if (previous[0].after_value.planHash !== planHash)
          throw new Error("This batch ID already identifies a different reviewed plan.");
        const audits = await tx.query(
          "select after_value from network_audit_log where entity_type='source_verification_target' and after_value->>'batchId'=$1 order by id",
          [plan.batchId],
        );
        if (audits.length !== ordered.length)
          throw new Error("The existing batch audit is incomplete.");
        for (const entry of ordered) {
          const audit = audits.find((row) =>
            same(row.after_value.target, entry.target),
          )?.after_value;
          if (!audit || !same(await loadEntry(tx, entry), audit.value))
            throw new Error("An applied result has changed since this batch; review it again.");
        }
        return { ...previous[0].after_value, applied: false, alreadyApplied: true, dryRun };
      }
      const [{ appliedAt }] = await tx.query('select now()::text as "appliedAt"');
      await tx.query(
        "select set_config('athrecs.archive_actor',$1,true),set_config('athrecs.archive_note',$2,true)",
        [`automation:${plan.actor.name}`, `Source verification batch ${plan.batchId}; ${planHash}`],
      );
      let count = 0,
        requestCount = 0,
        mirrorCount = 0,
        historyPerformanceCount = 0;
      let canonicalResultCount = 0,
        excludedCanonicalResultCount = 0;
      const checkedCaptures = new Set();
      for (const entry of ordered) {
        const current = await loadEntry(tx, entry);
        if (!same(current, entry.before))
          throw new Error("Stale result/history preimage; no batch changes applied.");
        const target = entry.target;
        if (target.kind === "result") {
          const [edition] = await tx.query(
            "select event_date::text as event_date from editions where id=$1 for share",
            [entry.before.edition_id],
          );
          if (!edition) throw new Error("The canonical result edition no longer exists.");
          checkResultHolds(entry.before.result_details ?? {}, {
            ...entry.before,
            event_date: edition.event_date,
          });
        }
        const mirrors = target.kind === "history" ? await historyMirrors(tx, target) : [];
        const changedRows = new Map(),
          prepared = [];
        for (const review of checkedReviews(entry)) {
          const before = beforePerformance(entry, review),
            keys = requestKeys(entry, review, mirrors);
          const captureKey = json([review.evidence.captureGuard, review.evidence.capturedAt]);
          if (!checkedCaptures.has(captureKey)) {
            await checkCaptureGuard(tx, review.evidence);
            checkedCaptures.add(captureKey);
          }
          const requestsBefore = await checkRequests(tx, target.athleteId, keys, review);
          const staffVerification = {
            type: "source_verification_batch",
            batchId: plan.batchId,
            planHash,
            actor: plan.actor,
            reviewedAt: plan.reviewedAt,
            appliedAt,
            evidence: review.evidence,
            ...(review.overrideDecision ? { overrideDecision: review.overrideDecision } : {}),
          };
          const after = { ...before, verificationStatus: "source_verified", staffVerification };
          prepared.push({ review, before, after, keys, staffVerification, requestsBefore });
          if (target.kind === "history") changedRows.set(review.index, after);
        }
        let afterValue;
        if (target.kind === "result") {
          canonicalResultCount++;
          if (entry.before.result_details?.profileExcluded) excludedCanonicalResultCount++;
          const rows = await tx.query(
            "update results r set result_details=$1::jsonb where id=$2 and athlete_id=$3 and to_jsonb(r)=$4::jsonb returning to_jsonb(r) as value",
            [json(prepared[0].after), target.resultId, target.athleteId, json(entry.before)],
          );
          if (rows.length !== 1) throw new Error("Concurrent canonical result change.");
          afterValue = rows[0].value;
          if (!same({ ...afterValue, result_details: entry.before.result_details }, entry.before))
            throw new Error("A result trigger changed fields outside verification.");
        } else {
          historyPerformanceCount += prepared.length;
          afterValue = entry.before.map((row, index) => changedRows.get(index) ?? row);
          const choices = await tx.query(
            "select user_id,performance_hash,excluded from athlete_profile_history_choices where athlete_id=$1 and provider=$2 and external_id=$3 for update",
            [target.athleteId, target.provider, target.externalId],
          );
          // Most unclaimed source profiles have no choices. Avoid two round trips
          // per performance while preserving the exact MD5 migration when needed.
          for (const { before, after } of choices.length ? prepared : []) {
            const conflicts = await tx.query(
              "select 1 from athlete_profile_history_choices old join athlete_profile_history_choices next using(user_id,athlete_id,provider,external_id) where old.athlete_id=$1 and old.provider=$2 and old.external_id=$3 and old.performance_hash=md5($4::jsonb::text) and next.performance_hash=md5($5::jsonb::text) and old.excluded<>next.excluded limit 1",
              [target.athleteId, target.provider, target.externalId, json(before), json(after)],
            );
            if (conflicts.length)
              throw new Error("Conflicting history visibility choices require review.");
            await tx.query(
              "insert into athlete_profile_history_choices(user_id,athlete_id,provider,external_id,performance_hash,excluded,confirmed_at) select user_id,athlete_id,provider,external_id,md5($1::jsonb::text),excluded,confirmed_at from athlete_profile_history_choices where athlete_id=$2 and provider=$3 and external_id=$4 and performance_hash=md5($5::jsonb::text) on conflict(user_id,athlete_id,provider,external_id,performance_hash) do nothing",
              [json(after), target.athleteId, target.provider, target.externalId, json(before)],
            );
          }
          for (const mirror of mirrors) {
            const matches = entry.before.filter(
              (row) => row.archiveReference?.sourceRow === mirror.source_key,
            );
            if (
              mirror.athlete_id !== target.athleteId ||
              matches.length > 1 ||
              (matches.length === 1 && !same(matches[0], mirror.performance))
            )
              throw new Error(
                "Source claim mirror has ambiguous, stale or conflicting identity evidence.",
              );
          }
          const changed = await tx.query(
            "update athlete_source_histories set performances=$1::jsonb where athlete_id=$2 and provider=$3 and external_id=$4 and performances=$5::jsonb returning performances as value",
            [
              json(afterValue),
              target.athleteId,
              target.provider,
              target.externalId,
              json(entry.before),
            ],
          );
          if (changed.length !== 1 || !same(changed[0].value, afterValue))
            throw new Error("Concurrent history change or unexpected trigger edit.");
          const afterMirrors = await historyMirrors(tx, target);
          if (
            !same(
              afterMirrors.map((row) => row.id),
              mirrors.map((row) => row.id),
            )
          )
            throw new Error(
              "A history trigger would create or remove claim references; review separately.",
            );
          for (const mirror of mirrors) {
            const changedRow = prepared.find(
              ({ before }) => before.archiveReference?.sourceRow === mirror.source_key,
            );
            const expected = changedRow?.after ?? mirror.performance;
            const observed = afterMirrors.find((row) => row.id === mirror.id);
            if (
              !same(observed.performance, mirror.performance) &&
              !same(observed.performance, expected)
            )
              throw new Error("A history trigger changed an unrelated claim performance.");
            // Existing source triggers can recompute availability. Verification never changes it.
            await tx.query(
              "update source_history_claim_results set performance=$1::jsonb,available=$2,source_url=$3,updated_at=now() where id=$4 and athlete_id=$5",
              [json(expected), mirror.available, mirror.source_url, mirror.id, target.athleteId],
            );
            if (changedRow) mirrorCount++;
          }
        }
        for (const { keys, staffVerification } of prepared) {
          if (!keys.length) continue;
          const updated = await tx.query(
            "update athlete_result_verification_requests set status='approved',revision=revision+1,staff_evidence=$1::jsonb,member_message='This result has been verified against its recorded source.',reviewed_by=null,reviewed_at=now(),updated_at=now() where athlete_id=$2 and result_key=any($3::text[]) and status in ('pending','needs_info','rejected') returning id",
            [json(staffVerification), target.athleteId, keys],
          );
          requestCount += updated.length;
        }
        count += prepared.length;
        await tx.query(
          "insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note) values(null,'automation.source_result_verified','source_verification_target',$1,$2::jsonb,$3::jsonb,$4)",
          [
            `${plan.batchId}:${createHash("sha256").update(key(target)).digest("hex")}`,
            json({
              target,
              value: entry.before,
              ...(entry.profileGuard ? { profileGuard: entry.profileGuard } : {}),
              requests: prepared.flatMap((review) => review.requestsBefore.map((row) => row.value)),
            }),
            json({ batchId: plan.batchId, planHash, target, value: afterValue, actor: plan.actor }),
            `${plan.actor.name}: source comparison confirmed. Ownership and visibility unchanged.`,
          ],
        );
      }
      receipt = {
        batchId: plan.batchId,
        planHash,
        actor: plan.actor,
        appliedAt,
        targetCount: ordered.length,
        recordCount: count,
        historyPerformanceCount,
        canonicalResultCount,
        excludedCanonicalResultCount,
        requestCount,
        mirrorCount,
      };
      await tx.query(
        "insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note) values(null,'automation.source_verification_batch','source_verification_batch',$1,$2::jsonb,$3)",
        [
          plan.batchId,
          json(receipt),
          "Reviewed source-verification plan applied atomically; no ownership or publication changes.",
        ],
      );
      if (dryRun) throw rollback;
      return { ...receipt, applied: true, alreadyApplied: false, dryRun: false };
    });
  } catch (error) {
    if (error !== rollback) throw error;
    return { ...receipt, applied: false, alreadyApplied: false, dryRun: true };
  }
}
