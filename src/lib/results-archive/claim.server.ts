import type { Sql } from "../db";
import { archiveRowSchema } from "./core";
import { matchingNames, type MatchingSettings } from "../athrecs/result-matching-settings";
import { scorePotentialResultNameMatch } from "../athrecs/result-match";
import { queueCompletedClaim } from "../athrecs/result-claim-alerts.server";

/** Called within a transaction, after the requester's explicit declaration has been saved.
 * Adds only to an already-owned profile. It never grants ownership or source verification. */
export async function completeOwnArchiveRequests(sql: Sql, userId: string, entryIds: number[]) {
  const claimed: number[] = [],
    claimIds: number[] = [];
  const held: Array<{ entryId: number; reason: string }> = [];
  let added = 0,
    duplicates = 0;
  const [identity] = await sql<{
    email: string;
    verified: boolean;
    name: string;
    full_name: string;
    previous_names: string[];
    dob: string;
    nationality: string;
    settings: MatchingSettings;
  }>`select u.email,u."emailVerified" as verified,u.name,p.full_name,
    p.previous_names,p.date_of_birth::text as dob,p.nationality,s.settings
    from "user" u left join athlete_private_profiles p on p.user_id=u.id
    left join athlete_result_matching_settings s on s.user_id=u.id where u.id=${userId} for update of u`;
  if (!identity?.verified) throw new Error("Verify your email before claiming results");
  // Same lock order as staff archive reviews: dataset -> entry -> athlete -> result.
  await sql`select d.id from result_archive_datasets d where d.id in
    (select dataset_id from result_archive_entries where id=any(${entryIds}::bigint[])) order by d.id for update`;
  const entries = await sql<{
    id: number;
    revision: number;
    payload: Record<string, unknown>;
    canonical_result_id: number | null;
    review_state: string;
    edition_id: number;
    provider: string;
    source_url: string;
    event_date: string;
    source_key: string;
  }>`select a.*,d.edition_id,d.provider,d.source_url,ed.event_date::text as event_date
    from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id
    join editions ed on ed.id=d.edition_id where a.id=any(${entryIds}::bigint[]) order by a.id for update of a`;
  const links = await sql<{
    id: number;
    display_name: string;
  }>`select a.id,a.display_name from athletes a join athlete_account_links l on l.athlete_id=a.id
    where l.user_id=${userId} and l.status='active' order by a.id for update of a,l`;
  const names = matchingNames(
    identity.full_name,
    identity.previous_names ?? [],
    identity.settings,
    [identity.name, ...links.map((l) => l.display_name)],
  );
  for (const e of entries) {
    const hold = (reason: string) => held.push({ entryId: Number(e.id), reason });
    const [request] = await sql<{
      revision: number;
      note: string;
    }>`select * from result_archive_match_requests where entry_id=${e.id} and user_id=${userId}`;
    if (!request || request.revision !== e.revision) {
      hold("The requested source revision has changed.");
      continue;
    }
    if (links.length !== 1) {
      hold(
        "Claim your athlete profile first, or ask staff to select between your linked profiles.",
      );
      continue;
    }
    const athleteId = links[0].id;
    if (e.canonical_result_id) {
      const [r] = await sql`select athlete_id from results where id=${e.canonical_result_id}`;
      if (r?.athlete_id === athleteId) {
        claimed.push(Number(e.id));
        duplicates++;
      } else hold("This archive result is already attached to another athlete.");
      continue;
    }
    if (
      e.review_state !== "unmatched" ||
      (Array.isArray(e.payload.reviewFlags) && e.payload.reviewFlags.length > 0)
    ) {
      hold("The archived source row has an unresolved review flag.");
      continue;
    }
    const raw = e.payload;
    const fields = Object.keys(archiveRowSchema.shape);
    const textFields = new Set([
      "bib",
      "club",
      "category",
      "gender",
      "country",
      "sourceAthleteProvider",
      "sourceAthleteId",
      "performance",
      "team",
      "leg",
    ]);
    const parsed = archiveRowSchema.safeParse(
      Object.fromEntries(
        fields.map((k) => [
          k,
          k === "original" ? {} : raw[k] == null && textFields.has(k) ? "" : raw[k],
        ]),
      ),
    );
    if (!parsed.success) {
      hold("The archived performance needs a format check.");
      continue;
    }
    const p = parsed.data;
    if (
      p.status !== "finished" ||
      !p.finishSeconds ||
      p.team ||
      p.leg ||
      e.event_date > new Date().toISOString().slice(0, 10)
    ) {
      hold("This entry needs its finish status, event date or team classification checked.");
      continue;
    }
    const match = scorePotentialResultNameMatch(
      names,
      p.name,
      { dateOfBirth: identity.dob, nationality: identity.nationality },
      {
        eventDate: e.event_date,
        category: p.category,
        ageAtRace: String(raw.age ?? raw.sourceAge ?? ""),
        nationality: p.country,
      },
    );
    if (!match || match.confidence === "possible") {
      hold("The athlete details need clarification.");
      continue;
    }
    if (p.sourceAthleteId) {
      const mappings =
        await sql`select athlete_id from athlete_source_identities where provider=${p.sourceAthleteProvider} and external_id=${p.sourceAthleteId}
        union select athlete_id from result_archive_athlete_identifiers where provider=${p.sourceAthleteProvider} and external_id=${p.sourceAthleteId}`;
      if (mappings.some((m) => m.athlete_id !== athleteId)) {
        hold("The source identity is linked to another athlete.");
        continue;
      }
    }
    const [existing] = await sql<{
      id: number;
      status: string;
      finish_time_seconds: number;
      chip_time_seconds: number | null;
      gun_time_seconds: number | null;
    }>`select * from results where edition_id=${e.edition_id} and athlete_id=${athleteId} for update`;
    if (
      existing &&
      (existing.status !== p.status ||
        existing.finish_time_seconds !== Math.round(p.finishSeconds) ||
        (existing.chip_time_seconds != null &&
          p.chipSeconds != null &&
          existing.chip_time_seconds !== Math.round(p.chipSeconds)) ||
        (existing.gun_time_seconds != null &&
          p.gunSeconds != null &&
          existing.gun_time_seconds !== Math.round(p.gunSeconds)))
    ) {
      hold("This performance conflicts with the result already on the profile.");
      continue;
    }
    if (p.bib) {
      await sql`select pg_advisory_xact_lock(hashtext('athrecs:archive-bib'),hashtext(${`${e.edition_id}|${e.source_url}|${p.bib}`}))`;
      const clashes =
        await sql`select id from results where edition_id=${e.edition_id} and athlete_id<>${athleteId} and bib=${p.bib} and source_url=${e.source_url} limit 1`;
      if (clashes.length) {
        hold("The source bib is attached to another athlete.");
        continue;
      }
    }
    let resultId = existing?.id;
    if (existing) {
      const prior =
        await sql`select status from result_claims where result_id=${resultId} and claimant_user_id=${userId}`;
      if (prior.some((c) => c.status !== "approved")) {
        hold("An earlier claim decision needs staff attention.");
        continue;
      }
    }
    const note = `Athlete self-confirmation: ${request.note}. Archived request #${e.id}, revision ${e.revision}. Ownership already linked; no independent source or identity verification.`;
    await sql`select set_config('athrecs.archive_actor',${userId},true),set_config('athrecs.archive_note',${note},true)`;
    if (!resultId) {
      const details = {
        timing: {
          finishSeconds: p.finishSeconds,
          chipSeconds: p.chipSeconds,
          gunSeconds: p.gunSeconds,
        },
        archive: { entryId: Number(e.id), revision: e.revision, sourceKey: e.source_key },
        sourceRow: { url: e.source_url, name: p.name, bib: p.bib, provider: e.provider },
        splits: p.splits.map((s) => ({ label: s.label, time: s.value })),
        verification: { status: "unverified", method: "athlete_self_confirmation" },
      };
      const [saved] = await sql<{
        id: number;
      }>`insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,gender_place,category_place,category,result_source,source_url,result_visibility,result_details)
        values(${e.edition_id},${athleteId},${p.status},${Math.round(p.finishSeconds)},${p.chipSeconds == null ? null : Math.round(p.chipSeconds)},${p.gunSeconds == null ? null : Math.round(p.gunSeconds)},${p.bib || null},${p.overallPlace},${p.genderPlace},${p.categoryPlace},${p.category || null},${e.provider},${e.source_url},'private',${JSON.stringify(details)}::jsonb) returning id`;
      resultId = saved.id;
      added++;
    } else duplicates++;
    await sql`insert into result_source_references(result_id,source_url,source_name) values(${resultId},${e.source_url},${e.provider}) on conflict do nothing`;
    await sql`update result_archive_entries set canonical_result_id=${resultId},applied_revision=${e.revision},
      applied_history_id=(select coalesce(max(id),0) from result_change_history where result_id=${resultId}),
      review_state='linked',review_note=${note},reviewed_by=${userId},reviewed_at=now(),updated_at=now() where id=${e.id}`;
    await sql`insert into result_archive_decisions(entry_id,revision,action,actor_id,note,before_value,after_value)
      values(${e.id},${e.revision},'link',${userId},${note},${JSON.stringify({ resultId: null, revision: e.revision })}::jsonb,${JSON.stringify({ resultId, method: "athlete_self_confirmation", existingResult: Boolean(existing) })}::jsonb)`;
    await sql`insert into result_claims(result_id,athlete_id,claimant_user_id,claimant_email,status,verification_method,evidence_text,declaration_accepted,claimant_role,confirmation_method,confirmed_at)
      values(${resultId},${athleteId},${userId},${identity.email},'approved','other',${note},true,'athlete','athlete',now()) on conflict(result_id,claimant_user_id) do nothing`;
    const [claim] =
      await sql`select id from result_claims where result_id=${resultId} and claimant_user_id=${userId} and status='approved'`;
    if (claim) {
      await queueCompletedClaim(sql, Number(claim.id));
      claimIds.push(Number(claim.id));
    }
    claimed.push(Number(e.id));
  }
  return { claimed: claimed.length, added, duplicates, held, claimIds };
}
