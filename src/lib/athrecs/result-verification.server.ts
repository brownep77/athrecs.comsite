import { createHash, randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { resultVerification } from "./profile-result-presentation.ts";
import {
  verificationRequestInput,
  verificationReviewInput,
  type VerificationRequestInput,
  type VerificationReviewInput,
  type MemberVerificationRequest,
  type VerificationStatus,
} from "./result-verification.ts";

// JSONB key order differs from JS input order; versions must survive either representation.
export function verificationVersion(value: unknown): string {
  const stable = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(stable)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => [k, stable(x)]),
          )
        : v;
  return createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
}
type Target = {
  athleteId: number;
  key: string;
  version: string;
  verified: boolean;
  excluded: boolean;
  snapshot: Record<string, unknown>;
  resultId?: number;
  history?: { provider: string; externalId: string; index: number; row: Record<string, unknown> };
};
async function account(sql: Sql, userId: string) {
  const [user] = await sql<{
    verified: boolean;
  }>`select "emailVerified" as verified from "user" where id=${userId}`;
  if (!user?.verified) throw new Error("Sign in with a verified email address.");
}
async function owned(sql: Sql, userId: string, athleteId: number) {
  const [link] =
    await sql`select 1 from athlete_account_links where athlete_id=${athleteId} and user_id=${userId} and status='active'`;
  if (!link) throw new Error("This result is not linked to your Athlete Account.");
}
async function targetAthlete(sql: Sql, key: string) {
  if (key.startsWith("h:")) return Number(key.split(":")[1]);
  const id = Number(key.slice(2));
  if (!Number.isSafeInteger(id) || Math.abs(id) > 2147483647) throw new Error("Invalid result.");
  const [row] = await sql<{
    athlete_id: number;
  }>`select athlete_id from athlete_claimable_results where id=${id}`;
  if (!row) throw new Error("Result no longer available.");
  return row.athlete_id;
}
async function loadTarget(sql: Sql, key: string, athleteId: number): Promise<Target> {
  if (key.startsWith("h:")) {
    const [, , externalId, indexText] = key.split(":"),
      index = Number(indexText);
    const [history] = await sql<{
      performances: Record<string, unknown>[];
      source_url: string;
      display_name: string;
    }>`
      select h.performances,h.source_url,a.display_name from athlete_source_histories h join athletes a on a.id=h.athlete_id
      where h.athlete_id=${athleteId} and h.provider='AthRecs additions' and h.external_id=${externalId} and h.published_at is not null for update of h`;
    const row = history?.performances[index];
    if (!row) throw new Error("Performance no longer available. Reload the profile.");
    return {
      athleteId,
      key,
      version: verificationVersion(row),
      verified: resultVerification(String(row.verificationStatus ?? ""), "AthRecs additions")
        .verified,
      excluded: Boolean(row.profileExcluded),
      snapshot: {
        athleteName: history.display_name,
        race: row.meeting,
        date: row.date || row.dateLabel || row.yearLabel || row.year,
        distance: row.discipline,
        performance: row.performance,
        sourceUrl: history.source_url,
        original: row,
      },
      history: { provider: "AthRecs additions", externalId, index, row },
    };
  }
  const resultId = Number(key.slice(2));
  if (resultId > 0) await sql`select id from results where id=${resultId} for update`;
  else await sql`select id from source_history_claim_results where id=${-resultId} for update`;
  const [row] = await sql<
    {
      result_details: Record<string, unknown>;
      result_source: string;
      available: boolean;
      event_name: string;
      event_date: string;
      distance_code: string;
      finish_time_seconds: number | null;
      display_name: string;
    } & Record<string, unknown>
  >`
    select r.*,a.display_name from athlete_claimable_results r join athletes a on a.id=r.athlete_id where r.id=${resultId} and r.athlete_id=${athleteId}`;
  if (!row || (resultId < 0 && !row.available))
    throw new Error("Result no longer available. Reload the profile.");
  return {
    athleteId,
    key,
    resultId,
    version: verificationVersion(row),
    verified: resultVerification(
      String(row.result_details.verificationStatus ?? ""),
      row.result_source,
    ).verified,
    excluded: Boolean(row.result_details.profileExcluded),
    snapshot: {
      athleteName: row.display_name,
      race: row.event_name,
      date: row.event_date,
      distance: row.distance_code,
      performance: row.result_details.performance ?? row.finish_time_seconds,
      original: row,
    },
  };
}
async function audit(
  sql: Sql,
  userId: string,
  id: string,
  action: string,
  before: unknown,
  after: unknown,
) {
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
    values(${userId},${action},'result_verification',${id},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb,'Result verification review; account ownership and visibility unchanged.')`;
}
export async function requestVerification(
  sql: Sql,
  input: VerificationRequestInput,
  userId: string,
) {
  const data = verificationRequestInput.parse(input);
  return sql.transaction(async (tx) => {
    await account(tx, userId);
    await tx`select id from "user" where id=${userId} for update`;
    const athleteId = await targetAthlete(tx, data.key);
    await tx`select id from athletes where id=${athleteId} for update`;
    await owned(tx, userId, athleteId);
    const target = await loadTarget(tx, data.key, athleteId);
    const original = target.snapshot.original as {
      syntheticTest?: boolean;
      result_details?: { syntheticTest?: boolean };
    };
    if (original.syntheticTest || original.result_details?.syntheticTest)
      throw new Error("Fictional test results cannot be verified.");
    if (target.verified) throw new Error("This result is already verified.");
    if (target.excluded) throw new Error("Restore this result before requesting verification.");
    if (data.key.startsWith("h:") && !data.expectedVersion)
      throw new Error("Reload the performance before requesting verification.");
    if (data.expectedVersion && data.expectedVersion !== target.version)
      throw new Error("The result changed. Reload it before requesting verification.");
    const [prior] = await tx<{
      id: string;
      requested_by: string;
      status: VerificationStatus;
      member_message: string;
    }>`
      select id::text,requested_by,status,member_message from athlete_result_verification_requests where athlete_id=${athleteId} and result_key=${data.key} for update`;
    // One staff case for this performance, including retries and multiple linked guardians.
    if (prior?.status === "pending")
      return {
        key: data.key,
        status: prior.status,
        message: "Verification requested. AthRecs staff will review this result.",
      };
    const [recent] = await tx<{
      n: number;
    }>`select count(*)::int as n from network_audit_log where actor_user_id=${userId} and action='athlete.verification_requested' and created_at>now()-interval '1 hour'`;
    if (recent.n >= 20)
      throw new Error("You have requested 20 checks this hour. Please try again later.");
    const id = prior?.id ?? randomUUID();
    await tx`insert into athlete_result_verification_requests(id,athlete_id,result_key,requested_by,athlete_note,evidence_url,result_snapshot,result_version)
      values(${id}::uuid,${athleteId},${data.key},${userId},${data.note},${data.evidenceUrl},${JSON.stringify(target.snapshot)}::jsonb,${target.version})
      on conflict(athlete_id,result_key) do update set requested_by=excluded.requested_by,status='pending',revision=athlete_result_verification_requests.revision+1,
        athlete_note=excluded.athlete_note,evidence_url=excluded.evidence_url,result_snapshot=excluded.result_snapshot,result_version=excluded.result_version,
        staff_evidence=null,member_message='',reviewed_by=null,reviewed_at=null,updated_at=now()`;
    await audit(tx, userId, id, "athlete.verification_requested", prior ?? null, {
      ...data,
      athleteId,
      snapshot: target.snapshot,
    });
    return {
      key: data.key,
      status: "pending" as const,
      message: "Verification requested. AthRecs staff will review this result.",
    };
  });
}
export async function memberRequests(
  sql: Sql,
  userId: string,
): Promise<MemberVerificationRequest[]> {
  return sql<MemberVerificationRequest>`select v.result_key as key,v.status,v.member_message as message from athlete_result_verification_requests v
    where exists(select 1 from athlete_account_links l where l.user_id=${userId} and l.athlete_id=v.athlete_id and l.status='active') order by v.updated_at desc`;
}
export async function staffRequests(
  sql: Sql,
  filter: { athleteIds: number[]; status: string; offset: number },
  actor: { userId: string; staff: boolean },
) {
  if (!actor.staff) throw new Error("Staff access required.");
  await account(sql, actor.userId);
  const rows = await sql<{
    id: string;
    athleteId: number;
    athleteName: string;
    key: string;
    status: VerificationStatus;
    revision: number;
    note: string;
    evidenceUrl: string;
    snapshot: Record<string, unknown>;
    staffEvidence: Record<string, unknown> | null;
    memberMessage: string;
    updatedAt: string;
  }>`
    select v.id::text,v.athlete_id as "athleteId",a.display_name as "athleteName",v.result_key as key,v.status,v.revision,
      v.athlete_note as note,v.evidence_url as "evidenceUrl",v.result_snapshot as snapshot,v.staff_evidence as "staffEvidence",
      v.member_message as "memberMessage",v.updated_at::text as "updatedAt"
    from athlete_result_verification_requests v join athletes a on a.id=v.athlete_id
    where (${filter.status}='all' or v.status=${filter.status}) and (cardinality(${filter.athleteIds}::int[])=0 or v.athlete_id=any(${filter.athleteIds}::int[]))
    order by v.updated_at,v.id limit 51 offset ${filter.offset}`;
  return rows.map(({ snapshot, staffEvidence, ...row }) => ({
    ...row,
    snapshot: {
      race: String(snapshot.race ?? ""),
      date: String(snapshot.date ?? ""),
      distance: String(snapshot.distance ?? ""),
      performance:
        typeof snapshot.performance === "number"
          ? snapshot.performance
          : String(snapshot.performance ?? ""),
      originalJson: JSON.stringify(snapshot, null, 2),
    },
    staffEvidence: staffEvidence ? JSON.stringify(staffEvidence, null, 2) : null,
  }));
}
export async function updateHistory(
  sql: Sql,
  athleteId: number,
  provider: string,
  externalId: string,
  index: number,
  original: Record<string, unknown>,
  review: unknown,
  verificationStatus = "verified_by_administrator",
) {
  const updated = {
    ...original,
    verificationStatus,
    staffVerification: review,
  };
  // Carry profile display choices across a row's new evidence hash.
  await sql`insert into athlete_profile_history_choices(user_id,athlete_id,provider,external_id,performance_hash,excluded)
    select c.user_id,c.athlete_id,c.provider,c.external_id,md5(${JSON.stringify(updated)}::jsonb::text),c.excluded
    from athlete_profile_history_choices c where c.athlete_id=${athleteId} and c.provider=${provider} and c.external_id=${externalId} and c.performance_hash=md5(${JSON.stringify(original)}::jsonb::text)
    on conflict(user_id,athlete_id,provider,external_id,performance_hash) do nothing`;
  await sql`update athlete_source_histories set performances=jsonb_set(performances,${[String(index)]}::text[],${JSON.stringify(updated)}::jsonb,false)
    where athlete_id=${athleteId} and provider=${provider} and external_id=${externalId}`;
}
export async function reviewVerification(
  sql: Sql,
  input: VerificationReviewInput,
  actor: { userId: string; staff: boolean },
) {
  if (!actor.staff) throw new Error("Staff access required.");
  const userId = actor.userId;
  const data = verificationReviewInput.parse(input);
  if (
    data.action === "approve" &&
    (!data.sourceChecked ||
      !data.sourceUrl ||
      data.locator.length < 2 ||
      data.identityEvidence.length < 12)
  )
    throw new Error(
      "Inspect the source row, record its locator and identity evidence, and confirm every supplied result field before verifying.",
    );
  return sql.transaction(async (tx) => {
    await account(tx, userId);
    const [ref] = await tx<{
      athlete_id: number;
    }>`select athlete_id from athlete_result_verification_requests where id=${data.id}::uuid`;
    if (!ref) throw new Error("Request not found.");
    await tx`select id from athletes where id=${ref.athlete_id} for update`;
    const [request] = await tx<{
      athlete_id: number;
      result_key: string;
      revision: number;
      status: VerificationStatus;
      result_version: string;
    }>`select * from athlete_result_verification_requests where id=${data.id}::uuid for update`;
    if (
      !request ||
      request.revision !== data.revision ||
      !["pending", "needs_info"].includes(request.status)
    )
      throw new Error("This request changed or was already reviewed. Reload the inbox.");
    let target: Target | undefined;
    if (data.action === "approve") {
      target = await loadTarget(tx, request.result_key, request.athlete_id);
      if (target.version !== request.result_version)
        throw new Error(
          "The source result changed after this request. Ask the athlete to resubmit before verifying it.",
        );
      if (target.excluded || target.verified)
        throw new Error("The result is removed or already verified. Reload the profile.");
      if (target.resultId && target.resultId > 0) {
        await tx`update results set result_details=result_details||${JSON.stringify({ verificationStatus: "verified_by_administrator", staffVerification: data })}::jsonb where id=${target.resultId} and athlete_id=${target.athleteId}`;
      } else if (target.history) {
        await updateHistory(
          tx,
          target.athleteId,
          target.history.provider,
          target.history.externalId,
          target.history.index,
          target.history.row,
          data,
        );
      } else {
        const [source] = await tx<{
          provider: string;
          external_id: string;
          source_key: string;
          performance: Record<string, unknown>;
        }>`select * from source_history_claim_results where id=${-target.resultId!}`;
        const [history] = await tx<{
          performances: Record<string, unknown>[];
        }>`select performances from athlete_source_histories where athlete_id=${target.athleteId} and provider=${source.provider} and external_id=${source.external_id} for update`;
        const indexes =
          history?.performances.flatMap((p, i) =>
            (p.archiveReference as { sourceRow?: string })?.sourceRow === source.source_key
              ? [i]
              : [],
          ) ?? [];
        if (
          indexes.length !== 1 ||
          verificationVersion(history.performances[indexes[0]]) !==
            verificationVersion(source.performance)
        )
          throw new Error(
            "Source history no longer matches. Resolve the evidence before verifying.",
          );
        await updateHistory(
          tx,
          target.athleteId,
          source.provider,
          source.external_id,
          indexes[0],
          source.performance,
          data,
        );
      }
    }
    const status =
      data.action === "approve" ? "approved" : data.action === "reject" ? "rejected" : "needs_info";
    await tx`update athlete_result_verification_requests set status=${status},revision=revision+1,staff_evidence=${JSON.stringify(data)}::jsonb,
      member_message=${data.memberMessage},reviewed_by=${userId},reviewed_at=now(),updated_at=now() where id=${data.id}::uuid`;
    await audit(
      tx,
      userId,
      data.id,
      "staff.verification_reviewed",
      { request, original: target?.snapshot ?? null },
      { ...data, status },
    );
    return { status };
  });
}
