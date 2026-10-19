import { createHash } from "node:crypto";
import type { Sql } from "../db";
import { candidateMark, groupResultCandidates } from "./result-candidate-groups";
import { resultIssues } from "../athlete-workspace/core";
import type { ProfileResultReviewInput, ProfileReviewRow } from "./profile-result-review";

const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
type StoredRow = ProfileReviewRow & {
  resultId: number | null;
  provider: string | null;
  externalId: string | null;
  performanceHash: string | null;
  sourceUrls: string[];
  detail: Record<string, unknown>;
};
type ReviewGroup = StoredRow & {
  members: StoredRow[];
};
export async function loadProfileResultReview(sql: Sql, userId: string, athleteId: number) {
  const rows = await sql<StoredRow>`
    select 'r:'||r.id as key,r.event_name as race,r.event_date as date,r.distance_code as distance,
      coalesce(r.result_details->'timing'->>'finishText',r.result_details->>'performance',case when r.finish_time_seconds is not null then
        (r.finish_time_seconds/3600)::text||':'||lpad(((r.finish_time_seconds%3600)/60)::text,2,'0')||':'||lpad((r.finish_time_seconds%60)::text,2,'0') end,'') as performance,
      r.chip_time_seconds as chip,r.gun_time_seconds as gun,r.status,
      r.bib,r.club_name as club,r.category,r.age_at_race as age,r.overall_place as place,
      (exists(select 1 from athlete_profile_hidden_results h where h.user_id=${userId} and h.result_id=r.id)
        or exists(select 1 from athlete_profile_hidden_source_results h where h.user_id=${userId} and h.source_result_id=-r.id)) as excluded,
      r.id as "resultId",null::text as provider,null::text as "externalId",null::text as "performanceHash",
      array_remove(array[r.source_url],null) as "sourceUrls",r.result_details as detail
    from athlete_claimable_results r where r.athlete_id=${athleteId}
      and ((r.id>0 and coalesce(r.result_details->>'profileExcluded','false')<>'true') or (r.id<0 and r.available))
    union all
    select 'h:'||md5(h.provider||':'||h.external_id)||':'||md5(p::text),
      coalesce(p->>'meeting',''),coalesce(nullif(p->>'date',''),nullif(p->>'dateLabel',''),p->>'year',''),
      coalesce(p->>'discipline',''),coalesce(p->>'performance',''),null::integer,null::integer,
      coalesce(p->>'verificationStatus','unverified'),
      p#>>'{archiveReference,original,Bib}',null::text,p->>'ageGroup',p#>>'{archiveReference,original,Age}',null::integer,
      exists(select 1 from athlete_profile_history_choices c where c.user_id=${userId}
        and c.athlete_id=h.athlete_id and c.provider=h.provider and c.external_id=h.external_id
        and c.performance_hash=md5(p::text) and c.excluded),
      null::integer,h.provider,h.external_id,md5(p::text),
      array(select jsonb_array_elements_text(coalesce(p->'sourceUrls','[]'::jsonb))),p
    from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances)p
    where h.athlete_id=${athleteId} and h.published_at is not null
      and coalesce(p->>'profileExcluded','false')<>'true'
      and not exists(select 1 from source_history_claim_results s where s.athlete_id=h.athlete_id
        and s.provider=h.provider and s.external_id=h.external_id and s.source_key=p#>>'{archiveReference,sourceRow}')
    order by date desc,key
    limit 20001`;
  if (rows.length > 20000)
    throw new Error("This profile needs a larger review. Please contact support@athrecs.com.");
  // Non-finishes remain reviewable. Empty unverified placeholders are not performances.
  const eligible = [...new Map(rows.map((row) => [row.key, row])).values()].filter(
    (row) => row.performance.trim() || !["", "unverified"].includes(row.status.toLowerCase()),
  );
  eligible.sort((a, b) => Number(b.resultId !== null) - Number(a.resultId !== null));
  const unique: ReviewGroup[] = groupResultCandidates(eligible, (row) => ({
    athleteId,
    name: `profile ${athleteId}`,
    date: row.date,
    distance: row.distance,
    event: row.race,
    performance: row.performance,
    bib: row.bib,
    sources: row.sourceUrls,
    round: Array.isArray(row.detail?.labels)
      ? row.detail.labels
          .filter((label) => typeof label === "string" && /^(?:round|heat|stage|leg):/i.test(label))
          .map((label: string) => label.trim().toLowerCase())
          .sort()
          .join("|")
      : "",
    qualification: JSON.stringify([row.detail?.disqualification ?? null, row.detail?.wind || ""]),
  })).map((members) => ({
    ...members[0],
    members,
    excluded: members.some((row) => row.excluded),
    alternatePerformances: [
      ...new Set(
        members
          .slice(1)
          .map((row) => row.performance)
          .filter((mark) => mark && candidateMark(mark) !== candidateMark(members[0].performance)),
      ),
    ],
  }));
  unique.sort((a, b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key));
  const [last] = await sql<{
    created_at: string;
  }>`select created_at::text from athlete_profile_result_confirmations
    where user_id=${userId} and athlete_id=${athleteId} order by created_at desc limit 1`;
  return { rows: unique, snapshot: hash(unique), lastConfirmedAt: last?.created_at ?? null };
}
export function publicReview(review: Awaited<ReturnType<typeof loadProfileResultReview>>) {
  return {
    snapshot: review.snapshot,
    lastConfirmedAt: review.lastConfirmedAt,
    rows: review.rows.map(
      ({
        key,
        race,
        date,
        distance,
        performance,
        alternatePerformances,
        chip,
        gun,
        status,
        bib,
        club,
        category,
        age,
        place,
        excluded,
      }) => ({
        key,
        race,
        date,
        distance,
        performance,
        alternatePerformances,
        chip,
        gun,
        status,
        bib,
        club,
        category,
        age,
        place,
        excluded,
      }),
    ),
  };
}

/** Must run inside the claim transaction after authorization and the athlete lock. */
export async function saveProfileResultReview(
  sql: Sql,
  userId: string,
  athleteId: number,
  input: ProfileResultReviewInput,
  claimantRole: "athlete" | "guardian" = "athlete",
) {
  const inputHash = hash({
    // A fresh explicit confirmation can complete a pre-policy pending review.
    // Its old audit/receipt stays immutable; retries of this policy are idempotent.
    policy: "self-confirmation-v1",
    claimantRole,
    athleteId,
    snapshot: input.snapshot,
    includedKeys: [...input.includedKeys].sort(),
    additions: input.additions,
  });
  const prior = await sql<{
    id: string;
    input_hash: string;
    claim_id: number | null;
    included_keys: string[];
    excluded_keys: string[];
    added_count: number;
  }>`
    select id::text,input_hash,claim_id,included_keys,excluded_keys,added_count from athlete_profile_result_confirmations
    where user_id=${userId} and (id=${input.requestId}::uuid or (athlete_id=${athleteId} and input_hash=${inputHash}))`;
  if (prior.length) {
    if (prior.some((row) => row.input_hash !== inputHash))
      throw new Error("This confirmation has changed. Reload before confirming again.");
    return {
      id: prior[0].id,
      claimId: prior[0].claim_id,
      reused: true,
      included: prior[0].included_keys.length,
      excluded: prior[0].excluded_keys.length,
      added: prior[0].added_count,
    };
  }
  const [recent] = await sql<{
    n: number;
  }>`select count(*)::int as n from athlete_profile_result_confirmations
    where user_id=${userId} and created_at>now()-interval '1 hour'`;
  if (recent.n >= 20)
    throw new Error("You have saved 20 reviews this hour. Please try again later.");
  const review = await loadProfileResultReview(sql, userId, athleteId);
  if (review.snapshot !== input.snapshot)
    throw new Error(
      "Your results have changed. Reload the review and check the updated list before confirming.",
    );
  const selected = new Set(input.includedKeys);
  if (!selected.size && !input.additions.length)
    throw new Error("Select at least one result or choose a different profile.");
  const availableKeys = new Set(review.rows.map((row) => row.key));
  if ([...selected].some((key) => !availableKeys.has(key)))
    throw new Error("A selected result does not belong to this profile.");
  for (const row of input.additions) {
    const issues = resultIssues(row);
    if (issues.length) throw new Error(`${row.race}: ${issues.join(". ")}`);
  }
  const included = review.rows.filter((row) => selected.has(row.key));
  const excluded = review.rows.filter((row) => !selected.has(row.key));
  await sql`insert into athlete_profile_result_confirmations(id,user_id,athlete_id,input_hash,snapshot,included_keys,excluded_keys,added_count)
    values(${input.requestId}::uuid,${userId},${athleteId},${inputHash},${input.snapshot},${JSON.stringify(included.map((r) => r.key))}::jsonb,${JSON.stringify(excluded.map((r) => r.key))}::jsonb,${input.additions.length})`;
  const [recipient] = await sql<{ email: string; name: string; owned: boolean }>`
    select u.email,a.display_name as name,exists(select 1 from athlete_account_links l where l.user_id=u.id and l.athlete_id=a.id and l.status='active') as owned
    from "user" u cross join athletes a where u.id=${userId} and a.id=${athleteId}`;
  // Freeze a single summary in the same transaction as the declaration.
  await sql`update athlete_profile_result_confirmations set email_payload=${JSON.stringify({ id: input.requestId, resultId: 0, claimantEmail: recipient.email, athleteName: recipient.name, included: included.length, excluded: excluded.length, added: input.additions.length, status: recipient.owned ? "approved" : "pending" })}::jsonb where id=${input.requestId}::uuid`;
  // Account choices are inert until ownership is active. They never change source records.
  // A choice applies to every stored representation of the displayed result.
  const allRows = review.rows.flatMap((row) => row.members);
  const excludedRows = excluded.flatMap((row) => row.members);
  const selectedMemberKeys = new Set(
    included.flatMap((row) => row.members.map((member) => member.key)),
  );
  const canonical = allRows
    .filter((r) => r.resultId !== null && r.resultId > 0)
    .map((r) => r.resultId as number);
  const source = allRows
    .filter((r) => r.resultId !== null && r.resultId < 0)
    .map((r) => -(r.resultId as number));
  const hiddenCanonical = excludedRows
    .filter((r) => r.resultId !== null && r.resultId > 0)
    .map((r) => r.resultId as number);
  const hiddenSource = excludedRows
    .filter((r) => r.resultId !== null && r.resultId < 0)
    .map((r) => -(r.resultId as number));
  await sql`delete from athlete_profile_hidden_results where user_id=${userId} and result_id=any(${canonical}::int[])`;
  await sql`insert into athlete_profile_hidden_results(user_id,result_id)
    select ${userId},unnest(${hiddenCanonical}::int[]) on conflict do nothing`;
  await sql`delete from athlete_profile_hidden_source_results where user_id=${userId} and source_result_id=any(${source}::int[])`;
  await sql`insert into athlete_profile_hidden_source_results(user_id,source_result_id)
    select ${userId},unnest(${hiddenSource}::int[]) on conflict do nothing`;
  const histories = allRows
    .filter((r) => r.resultId === null)
    .map((row) => ({
      provider: row.provider,
      external_id: row.externalId,
      performance_hash: row.performanceHash,
      excluded: !selectedMemberKeys.has(row.key),
    }));
  await sql`insert into athlete_profile_history_choices(user_id,athlete_id,provider,external_id,performance_hash,excluded)
    select ${userId},${athleteId},r.provider,r.external_id,r.performance_hash,r.excluded
    from jsonb_to_recordset(${JSON.stringify(histories)}::jsonb) as r(provider text,external_id text,performance_hash text,excluded boolean)
    on conflict(user_id,athlete_id,provider,external_id,performance_hash) do update set excluded=excluded.excluded,confirmed_at=now()`;
  if (input.additions.length) {
    const entries = input.additions.map((row, index) => ({
      ...row,
      index: index + 1,
      state: "pending",
      response: "yes",
      responseBy: userId,
      responseAt: new Date().toISOString(),
      responseNote: "Athlete declared this result in a profile confirmation.",
    }));
    await sql`insert into athlete_result_proposals(id,athlete_id,submitted_by,source_url,original_text,input_hash,entries)
      values(${input.requestId}::uuid,${athleteId},${userId},${input.additions[0].sourceUrl},${JSON.stringify(input.additions)},${hash(input.additions)},${JSON.stringify(entries)}::jsonb)
      on conflict do nothing`;
  }
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,after_value,note)
    values(${userId},'athlete.results_confirmed','profile_result_confirmation',${input.requestId},${JSON.stringify({ athleteId, included: included.length, excluded: excluded.length, added: input.additions.length })}::jsonb,'Athlete self-declaration only. Performance evidence and profile ownership safeguards remain unchanged.')`;
  return {
    id: input.requestId,
    claimId: null,
    reused: false,
    included: included.length,
    excluded: excluded.length,
    added: input.additions.length,
  };
}
