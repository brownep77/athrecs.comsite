import type { Sql } from "../db";
import { resultVerification } from "./profile-result-presentation.ts";
import { updateHistory, verificationVersion } from "./result-verification.server.ts";
import {
  staffProfileVerificationInput,
  staffResultVerificationInput,
  type StaffProfileVerificationInput,
  type StaffResultVerificationInput,
  type StaffResultTarget,
} from "./staff-athlete-verification.ts";

type Actor = { userId: string; staff: boolean };
async function staff(sql: Sql, actor: Actor) {
  if (!actor.staff) throw new Error("Staff access required.");
  const [user] = await sql<{
    verified: boolean;
  }>`select "emailVerified" as verified from "user" where id=${actor.userId}`;
  if (!user?.verified) throw new Error("Sign in with a verified staff account.");
}
async function identity(sql: Sql, number: string, lock = false) {
  const [ref] = await sql.query<{ athlete_id: number | null; user_id: string | null }>(
    `select athlete_id,user_id from athlete_identifiers where number=$1::bigint ${lock ? "for update" : ""}`,
    [number],
  );
  if (!ref) throw new Error("Athlete profile not found.");
  const linked = ref.user_id
    ? await sql<{
        id: number;
      }>`select athlete_id as id from athlete_account_links where user_id=${ref.user_id} and status='active' order by athlete_id`
    : [{ id: ref.athlete_id! }];
  const ids = linked.map((row) => row.id);
  const profiles = await sql.query<{ snapshot: Record<string, unknown> }>(
    `select jsonb_build_object('id',id,'name',display_name,'gender',gender,'birthday',date_of_birth,'club',club_id,'country',country,'details',profile_details) as snapshot
     from athletes where id=any($1::int[]) order by id ${lock ? "for update" : ""}`,
    [ids],
  );
  const accounts = ref.user_id
    ? await sql.query<{ snapshot: Record<string, unknown> }>(
        `select jsonb_build_object('name',full_name,'displayName',display_name,'birthday',date_of_birth,'nationality',nationality,'country',country,'club',club_or_team,'details',profile_details) as snapshot
     from athlete_private_profiles where user_id=$1 ${lock ? "for update" : ""}`,
        [ref.user_id],
      )
    : [];
  return {
    ids,
    snapshot: {
      sourceProfiles: profiles.map((row) => row.snapshot),
      account: accounts[0]?.snapshot ?? null,
    },
  };
}
async function lastReview(sql: Sql, number: string) {
  const [row] = await sql<{
    review: { verified: boolean; profileVersion: string; note: string };
    reviewedBy: string;
    reviewedAt: string;
  }>`
    select after_value as review,actor_user_id as "reviewedBy",created_at::text as "reviewedAt" from network_audit_log
    where entity_type='athlete_profile_verification' and entity_id=${number}
    order by created_at desc,id desc limit 1`;
  return row;
}
export async function staffProfileVerification(sql: Sql, number: string, actor: Actor) {
  await staff(sql, actor);
  const profile = await identity(sql, number),
    review = await lastReview(sql, number);
  const profileVersion = verificationVersion(profile.snapshot);
  const stale = Boolean(review?.review.verified && review.review.profileVersion !== profileVersion);
  return {
    verified: Boolean(review?.review.verified && !stale),
    stale,
    version: verificationVersion({ profileVersion, review: review ?? null }),
    note: review?.review.note ?? "",
    reviewedBy: review?.reviewedBy ?? "",
    reviewedAt: review?.reviewedAt ?? "",
  };
}
export async function saveStaffProfileVerification(
  sql: Sql,
  input: StaffProfileVerificationInput,
  actor: Actor,
) {
  await staff(sql, actor);
  const data = staffProfileVerificationInput.parse(input);
  return sql.transaction(async (tx) => {
    const profile = await identity(tx, data.athleteNumber, true);
    const current = await staffProfileVerification(tx, data.athleteNumber, actor);
    if (current.version !== data.expectedVersion)
      throw new Error("The profile or review changed. Reload before saving.");
    const after = {
      verified: data.verified,
      profileVersion: verificationVersion(profile.snapshot),
      note: data.note,
    };
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},'staff.profile_verification_changed','athlete_profile_verification',${data.athleteNumber},${JSON.stringify(current)}::jsonb,${JSON.stringify(after)}::jsonb,${data.note})`;
    return { verified: data.verified };
  });
}

type StoredRow = {
  target: StaffResultTarget;
  original: Record<string, unknown>;
  event: string;
  date: string;
  discipline: string;
  performance: string;
  provider: string;
  urls: string[];
  published: boolean;
};
export async function staffVerificationResults(
  sql: Sql,
  number: string,
  offset: number,
  actor: Actor,
) {
  await staff(sql, actor);
  const { ids } = await identity(sql, number);
  const rows = await sql<StoredRow>`
    with records as (
      select jsonb_build_object('kind','result','resultId',r.id) as target,to_jsonb(r) as original,
        e.name as event,ed.event_date::text as date,ed.distance_code as discipline,
        coalesce(r.result_details->'timing'->>'finishText',r.finish_time_seconds::text||' seconds',r.status) as performance,
        coalesce(r.result_source,'') as provider,
        array(select distinct url from (select r.source_url as url union all select rr.source_url from result_source_references rr where rr.result_id=r.id) u where url like 'https://%') as urls,
        r.result_visibility='public' as published,'r:'||r.id as key
      from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id where r.athlete_id=any(${ids}::int[])
      union all
      select jsonb_build_object('kind','history','athleteId',h.athlete_id,'provider',h.provider,'externalId',h.external_id,'index',p.ordinality-1),p.value,
        coalesce(p.value->>'meeting',''),coalesce(nullif(p.value->>'date',''),p.value->>'yearLabel',p.value->>'year',''),
        coalesce(p.value->>'discipline',''),coalesce(p.value->>'performance',''),coalesce(p.value->>'providerName',h.provider),
        array(select distinct url from (select jsonb_array_elements_text(coalesce(p.value->'sourceUrls','[]'::jsonb)) as url union all select h.source_url) u where url like 'https://%'),
        h.published_at is not null,'h:'||h.athlete_id||':'||h.provider||':'||h.external_id||':'||p.ordinality
      from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances) with ordinality p(value,ordinality)
      where h.athlete_id=any(${ids}::int[])
    ) select target,original,event,date,discipline,performance,provider,urls,published from records
      order by date desc,key limit 51 offset ${offset}`;
  return rows.map(({ original, ...row }) => {
    const details =
      row.target.kind === "history"
        ? original
        : ((original.result_details ?? {}) as Record<string, unknown>);
    return {
      ...row,
      version: verificationVersion(original),
      originalJson: JSON.stringify(original, null, 2),
      verified: resultVerification(
        typeof details.verificationStatus === "string" ? details.verificationStatus : undefined,
        row.provider,
      ).verified,
      reviewJson: details.staffVerification
        ? JSON.stringify(details.staffVerification, null, 2)
        : "",
    };
  });
}
export async function saveStaffResultVerification(
  sql: Sql,
  input: StaffResultVerificationInput,
  actor: Actor,
) {
  await staff(sql, actor);
  const data = staffResultVerificationInput.parse(input);
  return sql.transaction(async (tx) => {
    const { ids } = await identity(tx, data.athleteNumber, true);
    const target = data.target;
    let original: Record<string, unknown>, athleteId: number;
    if (target.kind === "result") {
      const [row] = await tx<{
        original: Record<string, unknown>;
        athlete_id: number;
      }>`select to_jsonb(r) as original,athlete_id from results r where id=${target.resultId} for update`;
      if (!row || !ids.includes(row.athlete_id))
        throw new Error("Result does not belong to this profile.");
      original = row.original;
      athleteId = row.athlete_id;
    } else {
      if (!ids.includes(target.athleteId))
        throw new Error("Result does not belong to this profile.");
      const [history] = await tx<{
        performances: Record<string, unknown>[];
      }>`select performances from athlete_source_histories where athlete_id=${target.athleteId} and provider=${target.provider} and external_id=${target.externalId} for update`;
      original = history?.performances[target.index];
      athleteId = target.athleteId;
      if (!original) throw new Error("Performance no longer available. Reload the profile.");
    }
    if (verificationVersion(original) !== data.expectedVersion)
      throw new Error("The result changed. Reload before saving verification.");
    const details =
      target.kind === "history"
        ? original
        : ((original.result_details ?? {}) as Record<string, unknown>);
    if (
      data.verified &&
      (details.syntheticTest ||
        /conflicting (?:source|details|result)|disputed placing/i.test(
          String(details.notes ?? details.note ?? ""),
        ))
    )
      throw new Error("Resolve fictional or conflicting data before verifying this result.");
    const review = { ...data, reviewedBy: actor.userId, reviewedAt: new Date().toISOString() };
    const status = data.verified ? "verified_by_administrator" : "unverified";
    if (target.kind === "result") {
      await tx`update results set result_details=coalesce(result_details,'{}'::jsonb)||${JSON.stringify({ verificationStatus: status, staffVerification: review })}::jsonb where id=${target.resultId}`;
    } else {
      await updateHistory(
        tx,
        athleteId,
        target.provider,
        target.externalId,
        target.index,
        original,
        review,
        status,
      );
    }
    const requestKeys = target.kind === "result" ? [`r:${target.resultId}`] : [];
    if (target.kind === "history") {
      if (target.provider === "AthRecs additions")
        requestKeys.push(`h:${athleteId}:${target.externalId}:${target.index}`);
      const sourceRow = (original.archiveReference as { sourceRow?: string } | undefined)
        ?.sourceRow;
      if (sourceRow) {
        const claims = await tx<{ id: number }>`select id from source_history_claim_results
          where athlete_id=${athleteId} and provider=${target.provider} and external_id=${target.externalId} and source_key=${sourceRow}`;
        requestKeys.push(...claims.map((row) => `r:${-row.id}`));
      }
    }
    // The profile checkbox and the request inbox represent the same staff decision.
    await tx`update athlete_result_verification_requests set status=${data.verified ? "approved" : "needs_info"},
      revision=revision+1,staff_evidence=${JSON.stringify(review)}::jsonb,
      member_message=${data.verified ? "This result has been verified." : "This result is awaiting further verification."},
      reviewed_by=${actor.userId},reviewed_at=now(),updated_at=now()
      where athlete_id=${athleteId} and result_key=any(${requestKeys}::text[])`;
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},'staff.result_verification_changed','athlete_result_verification',${verificationVersion(target)},${JSON.stringify(original)}::jsonb,${JSON.stringify(review)}::jsonb,${data.note})`;
    return { verified: data.verified };
  });
}
