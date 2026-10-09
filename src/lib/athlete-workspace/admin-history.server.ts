import { createHash } from "node:crypto";
import type { z } from "zod";
import { adminHistoryInput, historyExclusionInput } from "./admin-history.ts";
import type { Sql } from "../db";
import {
  sourceHistorySchema,
  historyPerformanceSchema,
} from "../athrecs/source-performance-history.ts";
import type { CandidateResult } from "./core";

export const ADMIN_HISTORY_PROVIDER = "AthRecs additions";
type Actor = { userId: string; staff: boolean };
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function verified(sql: Sql, actor: Actor) {
  const [account] = await sql<{
    verified: boolean;
  }>`select "emailVerified" as verified from "user" where id=${actor.userId}`;
  if (!account?.verified) throw new Error("A verified account is required.");
}
async function access(sql: Sql, athleteId: number, actor: Actor, edit = false) {
  await verified(sql, actor);
  const links = await sql<{
    user_id: string;
  }>`select user_id from athlete_account_links where athlete_id=${athleteId} and status='active'`;
  if (
    links.some((link) => link.user_id === actor.userId) ||
    (actor.staff && (!edit || !links.length))
  )
    return;
  throw new Error("Only the linked athlete can remove or restore this history.");
}

/** Explicit editorial publication. This never represents athlete consent or source verification. */
export async function publishAdminHistory(
  sql: Sql,
  input: z.input<typeof adminHistoryInput>,
  actor: Actor,
) {
  if (!actor.staff) throw new Error("Staff approval is required.");
  const data = adminHistoryInput.parse(input);
  const key = `${ADMIN_HISTORY_PROVIDER}:${data.requestId}`,
    fingerprint = digest(data);
  if (new Set(data.batches.map((batch) => batch.id)).size !== data.batches.length)
    throw new Error("Select each batch once.");
  if (
    data.batches.length &&
    data.batches.reduce((sum, batch) => sum + batch.indexes.length, 0) !== data.performances.length
  )
    throw new Error("Every selected proposal needs one performance.");
  return sql.transaction(async (tx) => {
    await verified(tx, actor);
    const [athlete] = await tx<{
      profile_visibility: string;
    }>`select profile_visibility from athletes where id=${data.athleteId} for update`;
    if (!athlete) throw new Error("Athlete not found.");
    const [prior] = await tx<{
      actor_user_id: string;
      after_value: { fingerprint: string; added: number };
    }>`select actor_user_id,after_value from network_audit_log where action='athlete.history_admin_published' and entity_id=${key}`;
    if (prior) {
      if (prior.actor_user_id !== actor.userId || prior.after_value.fingerprint !== fingerprint)
        throw new Error("This publication reference is already used for different data.");
      return { added: prior.after_value.added, replay: true };
    }
    if (athlete.profile_visibility !== "public")
      throw new Error("This operation cannot publish a private profile.");
    const hidden =
      await tx`select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=${data.athleteId} and l.status='active' and (s.enabled=false or s.share_results=false)`;
    if (hidden.length) throw new Error("The athlete has disabled profile or result sharing.");
    const batches = [];
    for (const ref of [...data.batches].sort((a, b) => a.id.localeCompare(b.id))) {
      if (new Set(ref.indexes).size !== ref.indexes.length)
        throw new Error("Select each proposal once.");
      const [batch] = await tx<{
        athlete_id: number;
        revision: number;
        entries: CandidateResult[];
      }>`select athlete_id,revision,entries from athlete_result_proposals where id=${ref.id}::uuid for update`;
      if (!batch || batch.athlete_id !== data.athleteId || batch.revision !== ref.revision)
        throw new Error("The proposal batch changed or belongs to another athlete.");
      for (const index of ref.indexes) {
        const row = batch.entries.find((entry) => entry.index === index);
        if (!row || row.state !== "pending" || row.response === "no")
          throw new Error("Only pending proposals not denied by the athlete can be published.");
      }
      batches.push({ ref, batch });
    }
    const rows = data.performances.map((row) => ({
      ...row,
      profileExcluded: false,
      verificationStatus: "unverified" as const,
    }));
    const years = [...new Set(rows.map((row) => row.year))].sort();
    await tx`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
      values(${data.athleteId},${ADMIN_HISTORY_PROVIDER},${data.requestId},${data.sourceUrl},now(),false,${years}::int[],${years}::int[],${JSON.stringify(rows)}::jsonb,now())`;
    for (const { ref, batch } of batches) {
      const entries = batch.entries.map((row) =>
        ref.indexes.includes(row.index)
          ? {
              ...row,
              state: "approved",
              decisionNote:
                "Published by administrator as unverified performance history. Athlete confirmation was not recorded.",
              historyReference: key,
            }
          : row,
      );
      await tx`update athlete_result_proposals set entries=${JSON.stringify(entries)}::jsonb,revision=revision+1,updated_at=now() where id=${ref.id}::uuid`;
      await tx`update athlete_result_review_invitations set revoked_at=now() where batch_id=${ref.id}::uuid and revoked_at is null and responded_at is null`;
    }
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},'athlete.history_admin_published','athlete_source_history',${key},null,${JSON.stringify({ athleteId: data.athleteId, fingerprint, added: rows.length, athleteConsentRecorded: false, verificationStatus: "unverified", batches: data.batches, originalPerformances: data.performances })}::jsonb,${data.reason})`;
    return { added: rows.length, replay: false };
  });
}

export async function readManagedHistory(sql: Sql, athleteId: number, actor: Actor) {
  await access(sql, athleteId, actor);
  const histories =
    await sql`select provider,external_id as "externalId",source_url as "sourceUrl",captured_at::text as "capturedAt",complete,years_expected as "yearsExpected",years_captured as "yearsCaptured",performances from athlete_source_histories where athlete_id=${athleteId} and provider=${ADMIN_HISTORY_PROVIDER} order by captured_at`;
  return histories.map((history) => sourceHistorySchema.parse(history));
}
export async function excludeHistoryPerformance(
  sql: Sql,
  input: z.infer<typeof historyExclusionInput>,
  actor: Actor,
) {
  const data = historyExclusionInput.parse(input);
  return sql.transaction(async (tx) => {
    await tx`select id from athletes where id=${data.athleteId} for update`;
    await access(tx, data.athleteId, actor, true);
    const [history] = await tx<{
      performances: unknown[];
    }>`select performances from athlete_source_histories where athlete_id=${data.athleteId} and provider=${ADMIN_HISTORY_PROVIDER} and external_id=${data.externalId} for update`;
    if (!history || !history.performances[data.index])
      throw new Error("Performance not found on this profile.");
    const original = historyPerformanceSchema.parse(history.performances[data.index]);
    await tx`update athlete_source_histories set performances=jsonb_set(performances,${[String(data.index), "profileExcluded"]}::text[],${JSON.stringify(data.excluded)}::jsonb,true) where athlete_id=${data.athleteId} and provider=${ADMIN_HISTORY_PROVIDER} and external_id=${data.externalId}`;
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},'athlete.history_display_changed','athlete_source_history',${ADMIN_HISTORY_PROVIDER + ":" + data.externalId},${JSON.stringify({ index: data.index, profileExcluded: original.profileExcluded ?? false })}::jsonb,${JSON.stringify({ athleteId: data.athleteId, index: data.index, profileExcluded: data.excluded })}::jsonb,${data.reason})`;
    return { saved: true };
  });
}
