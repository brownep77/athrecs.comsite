import { createHash, randomUUID } from "node:crypto";
import type { Sql } from "../db";
import {
  archiveRowSchema,
  batchSchema,
  datasetSchema,
  reviewSchema,
  type ArchiveCandidate,
  type ArchiveEntry,
  type ArchiveRow,
  type ArchiveState,
  type BatchInput,
  type BatchReceipt,
  type DatasetInput,
  type ReviewInput,
} from "./core";

export type ArchiveActor = { userId: string; staffEmail: string };
// Recursively sort keys so object property ordering cannot create phantom revisions.
function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, stable(v)]),
    );
  return value;
}
export const fingerprint = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(stable(value)))
    .digest("hex");
function actorRequired(actor: ArchiveActor) {
  if (!actor.userId || !actor.staffEmail) throw new Error("Authenticated staff required");
}
const escapeLike = (q: string) => q.replace(/[\\%_]/g, "\\$&");
const rounded = (n: number | null) => (n === null ? null : Math.round(n));

export async function createArchiveDataset(sql: Sql, raw: DatasetInput, actor: ArchiveActor) {
  actorRequired(actor);
  const input = datasetSchema.parse(raw);
  return sql.transaction(async (tx) => {
    const edition = await tx`select id from editions where id=${input.editionId} for share`;
    if (!edition.length) throw new Error("Select an existing race edition first");
    const [row] = await tx<{ id: string; source_url: string; expected_rows: number | null }>`
      insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note,expected_rows,created_by)
      values(${randomUUID()},${input.editionId},${input.provider},${input.sourceRaceKey},${input.sourceUrl},${input.permissionNote},${input.expectedRows ?? null},${actor.userId})
      on conflict (edition_id,lower(provider),source_race_key) do update set updated_at=result_archive_datasets.updated_at
      returning id,source_url,expected_rows`;
    if (row.source_url !== input.sourceUrl || row.expected_rows !== (input.expectedRows ?? null))
      throw new Error(
        "This source race is already registered with different source details. Open the existing dataset; do not create a duplicate.",
      );
    return { id: row.id };
  });
}

/** One atomic bounded chunk. Jobs may resume by replaying request IDs; no race-size limit. */
export async function ingestArchiveBatch(
  sql: Sql,
  raw: BatchInput,
  actor: ArchiveActor,
): Promise<BatchReceipt> {
  actorRequired(actor);
  const input = batchSchema.parse(raw);
  if (Buffer.byteLength(JSON.stringify(input), "utf8") > 2_500_000)
    throw new Error("Split this batch into smaller chunks (maximum 2.5 MB)");
  const hash = fingerprint(input);
  return sql.transaction(async (tx) => {
    await tx.query("SET LOCAL lock_timeout = '5s'");
    await tx.query("SET LOCAL statement_timeout = '30s'");
    // Serialise source revisions across workers, but allow different datasets in parallel.
    const datasets =
      await tx`select id from result_archive_datasets where id=${input.datasetId} for update`;
    if (!datasets.length) throw new Error("Source dataset not found");
    const prior = await tx<{
      fingerprint: string;
      actor_id: string;
      receipt: BatchReceipt;
    }>`select fingerprint,actor_id,receipt from result_archive_batches where id=${input.requestId}`;
    if (prior[0]) {
      if (prior[0].fingerprint !== hash || prior[0].actor_id !== actor.userId)
        throw new Error("Request ID already used with different data or staff identity");
      return { ...prior[0].receipt, replay: true };
    }
    await tx`insert into result_archive_batches(id,dataset_id,fingerprint,actor_id) values(${input.requestId},${input.datasetId},${hash},${actor.userId})`;
    const receipt: BatchReceipt = {
      requestId: input.requestId,
      inserted: 0,
      revised: 0,
      unchanged: 0,
      replay: false,
    };
    // One bulk upsert + one revision insert, rather than one database trip per participant.
    const payload = input.rows.map((row) => ({
      source_key: row.sourceKey,
      payload: row,
      payload_hash: fingerprint(row),
    }));
    const changed = await tx<{
      id: number;
      revision: number;
      payload: ArchiveRow;
      payload_hash: string;
    }>`
      insert into result_archive_entries(dataset_id,source_key,payload,payload_hash)
      select ${input.datasetId},r.source_key,r.payload,r.payload_hash
      from jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) as r(source_key text,payload jsonb,payload_hash text)
      on conflict(dataset_id,source_key) do update set
        payload=excluded.payload,payload_hash=excluded.payload_hash,
        revision=result_archive_entries.revision+1,updated_at=now()
      where result_archive_entries.payload_hash<>excluded.payload_hash
      returning id,revision,payload,payload_hash`;
    if (changed.length)
      await tx`
      insert into result_archive_revisions(entry_id,revision,batch_id,payload,payload_hash)
      select r.id,r.revision,${input.requestId},r.payload,r.payload_hash
      from jsonb_to_recordset(${JSON.stringify(changed)}::jsonb) as r(id bigint,revision integer,payload jsonb,payload_hash text)`;
    receipt.inserted = changed.filter((r) => r.revision === 1).length;
    receipt.revised = changed.length - receipt.inserted;
    receipt.unchanged = input.rows.length - changed.length;
    await tx`update result_archive_batches set receipt=${JSON.stringify(receipt)}::jsonb where id=${input.requestId}`;
    await tx`update result_archive_datasets set updated_at=now() where id=${input.datasetId}`;
    return receipt;
  });
}

export async function searchArchiveEditions(sql: Sql, q: string) {
  if (q.trim().length < 2) return [];
  return sql<{ id: number; name: string; date: string; distance: string; sport: string }>`
    select ed.id,e.name,ed.event_date::text as date,ed.distance_code as distance,e.sport
    from editions ed join events e on e.id=ed.event_id
    where e.name ilike ${`%${escapeLike(q.trim().slice(0, 160))}%`}
    order by ed.event_date desc,ed.id desc limit 40`;
}

export async function archiveOverview(sql: Sql) {
  const [summary] = await sql<{
    canonical: number;
    sourceRows: number;
    unmatched: number;
    changed: number;
    held: number;
  }>`
    select (select count(*) from results)::bigint as canonical,
      count(*)::bigint as "sourceRows",
      count(*) filter(where canonical_result_id is null and review_state='unmatched')::bigint as unmatched,
      count(*) filter(where revision>applied_revision or exists(select 1 from result_change_history h where h.result_id=canonical_result_id and h.id>applied_history_id))::bigint as changed,
      count(*) filter(where review_state='held')::bigint as held from result_archive_entries`;
  const datasets = await sql<{
    id: string;
    editionId: number;
    provider: string;
    sourceUrl: string;
    eventName: string;
    date: string;
    distance: string;
    expected: number | null;
    stored: number;
    linked: number;
  }>`
    select d.id,d.edition_id as "editionId",d.provider,d.source_url as "sourceUrl",e.name as "eventName",ed.event_date::text as date,ed.distance_code as distance,d.expected_rows as expected,
      count(a.id)::bigint as stored,count(a.id) filter(where a.canonical_result_id is not null)::bigint as linked
    from (select * from result_archive_datasets order by updated_at desc,id limit 50) d
    join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
    left join result_archive_entries a on a.dataset_id=d.id
    group by d.id,d.edition_id,d.provider,d.source_url,e.name,ed.event_date,ed.distance_code,d.expected_rows,d.updated_at order by d.updated_at desc,d.id`;
  return { summary, datasets };
}

const ENTRY_SELECT = `select a.id,a.dataset_id as "datasetId",a.source_key as "sourceKey",a.revision,a.applied_revision as "appliedRevision",
  exists(select 1 from result_change_history h where h.result_id=a.canonical_result_id and h.id>a.applied_history_id) as "canonicalChanged",
  a.review_state as state,a.canonical_result_id as "resultId",r.athlete_id as "athleteId",at.display_name as "athleteName",a.payload,
  e.name as "eventName",ed.event_date::text as "eventDate",ed.distance_code as distance,d.provider,d.source_url as "sourceUrl"
  from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id
  join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
  left join results r on r.id=a.canonical_result_id left join athletes at on at.id=r.athlete_id`;
export async function listArchiveEntries(
  sql: Sql,
  input: { q?: string; datasetId?: string; state?: ArchiveState; after?: number },
) {
  const rows = await sql.query<ArchiveEntry>(
    `${ENTRY_SELECT}
    where ($1::uuid is null or a.dataset_id=$1) and a.id>$2 and (
      $3='all' or ($3='changed' and (a.revision>a.applied_revision or exists(select 1 from result_change_history h where h.result_id=a.canonical_result_id and h.id>a.applied_history_id))) or ($3='unmatched' and a.canonical_result_id is null and a.review_state='unmatched')
      or ($3='linked' and a.canonical_result_id is not null and a.revision=a.applied_revision and a.review_state='linked' and not exists(select 1 from result_change_history h where h.result_id=a.canonical_result_id and h.id>a.applied_history_id)) or ($3='held' and a.review_state='held'))
      and ($4='' or to_tsvector('simple',coalesce(a.payload->>'name','') || ' ' || coalesce(a.payload->>'bib','') || ' ' || coalesce(a.payload->>'club','')) @@ plainto_tsquery('simple',$4)
        or a.source_key=$4)
    order by a.id limit 51`,
    [input.datasetId ?? null, input.after ?? 0, input.state ?? "all", input.q?.trim() ?? ""],
  );
  return {
    rows: rows.slice(0, 50).map((r) => ({ ...r, payload: { ...r.payload, original: {} } })),
    next: rows.length > 50 ? rows[49].id : null,
  };
}

export async function archiveCandidates(
  sql: Sql,
  entryId: number,
  query = "",
): Promise<ArchiveCandidate[]> {
  const [entry] = await sql<{
    payload: ArchiveRow;
    edition_id: number;
  }>`select a.payload,d.edition_id from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id where a.id=${entryId}`;
  if (!entry) throw new Error("Archived entry not found");
  const p = entry.payload;
  const rows = await sql<{
    id: number;
    name: string;
    slug: string;
    club: string;
    country: string;
    managed: boolean;
    existingResultId: number | null;
    sourceMatch: boolean;
  }>`
    select a.id,a.display_name as name,a.slug,coalesce(c.name,a.source_club_name,'') as club,a.country,
      exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed,
      (select id from results where athlete_id=a.id and edition_id=${entry.edition_id} limit 1) as "existingResultId",
      exists(select 1 from (select provider,external_id,athlete_id from athlete_source_identities union all select provider,external_id,athlete_id from result_archive_athlete_identifiers) s where s.athlete_id=a.id and s.provider=${p.sourceAthleteProvider} and s.external_id=${p.sourceAthleteId}) as "sourceMatch"
    from athletes a left join clubs c on c.id=a.club_id
    where (${query}<>'' and a.display_name ilike ${`%${escapeLike(query)}%`}) or (${query}='' and (
      lower(a.display_name)=lower(${p.name}) or exists(select 1 from (select provider,external_id,athlete_id from athlete_source_identities union all select provider,external_id,athlete_id from result_archive_athlete_identifiers) s where s.athlete_id=a.id and s.provider=${p.sourceAthleteProvider} and s.external_id=${p.sourceAthleteId})))
    order by "sourceMatch" desc,a.id limit 50`;
  return rows.map(({ sourceMatch, ...r }) => ({
    ...r,
    reason: sourceMatch
      ? "Recorded source athlete identifier; review identity"
      : "Name candidate only; review identity",
  }));
}

export async function archiveEntryDetail(sql: Sql, entryId: number, athleteId?: number) {
  const [entry] = await sql.query<ArchiveEntry>(`${ENTRY_SELECT} where a.id=$1`, [entryId]);
  if (!entry) throw new Error("Archived entry not found");
  const [current] = await sql<{
    value: Record<string, unknown>;
  }>`select to_jsonb(r) as value from results r
    where r.id=${entry.resultId} or (r.athlete_id=${athleteId ?? null} and r.edition_id=(select edition_id from result_archive_datasets where id=${entry.datasetId})) limit 1`;
  const revisions = await sql<{
    revision: number;
    payload: ArchiveRow;
    created: string;
  }>`select revision,(payload - 'original') || '{"original":{}}'::jsonb as payload,created_at::text as created from result_archive_revisions where entry_id=${entryId} order by revision desc limit 25`;
  const decisions = await sql<{
    action: string;
    note: string;
    created: string;
  }>`select action,note,created_at::text as created from result_archive_decisions where entry_id=${entryId} order by id desc limit 25`;
  const v = current?.value;
  const currentResult = v
    ? {
        id: Number(v.id),
        athlete_id: Number(v.athlete_id),
        status: String(v.status),
        finish_time_seconds: v.finish_time_seconds as number | null,
        chip_time_seconds: v.chip_time_seconds as number | null,
        gun_time_seconds: v.gun_time_seconds as number | null,
        overall_place: v.overall_place as number | null,
        gender_place: v.gender_place as number | null,
        category_place: v.category_place as number | null,
        category: v.category as string | null,
        source_url: v.source_url as string | null,
        result_source: v.result_source as string | null,
        timing_precision: JSON.stringify(
          (v.result_details as Record<string, unknown>)?.timing ?? null,
        ),
      }
    : null;
  return {
    entry,
    currentResult,
    resultFingerprint: current ? fingerprint(current.value) : undefined,
    revisions,
    decisions,
  };
}

function canonicalValues(p: ArchiveRow) {
  return {
    status: p.status,
    finish_time_seconds: rounded(p.finishSeconds),
    chip_time_seconds: rounded(p.chipSeconds),
    gun_time_seconds: rounded(p.gunSeconds),
    bib: p.bib || null,
    overall_place: p.overallPlace,
    gender_place: p.genderPlace,
    category_place: p.categoryPlace,
    category: p.category || null,
  };
}
function compatible(current: Record<string, unknown>, incoming: Record<string, unknown>) {
  return Object.entries(incoming).every(
    ([key, value]) => value === null || current[key] === null || value === current[key],
  );
}

/** Review links an observation to the existing canonical results read path. Never grants account ownership or publication. */
export async function reviewArchiveEntry(sql: Sql, raw: ReviewInput, actor: ArchiveActor) {
  actorRequired(actor);
  const input = reviewSchema.parse(raw);
  return sql.transaction(async (tx) => {
    await tx.query("SET LOCAL lock_timeout = '5s'");
    // Stable ordering: dataset -> entry -> athlete -> result. Importers lock the same dataset.
    const [dataset] = await tx<{
      id: string;
      edition_id: number;
      source_url: string;
      provider: string;
    }>`
      select d.* from result_archive_datasets d join result_archive_entries a on a.dataset_id=d.id where a.id=${input.entryId} for update of d`;
    if (!dataset) throw new Error("Archived entry not found");
    const [entry] = await tx<{
      id: number;
      revision: number;
      payload: ArchiveRow;
      canonical_result_id: number | null;
      applied_revision: number | null;
      review_state: string;
    }>`select * from result_archive_entries where id=${input.entryId} for update`;
    if (entry.revision !== input.revision)
      throw new Error("The source row changed. Reload and review the latest revision");
    const p = archiveRowSchema.parse(entry.payload);
    const before = {
      resultId: entry.canonical_result_id,
      appliedRevision: entry.applied_revision,
      state: entry.review_state,
    };
    if (input.action === "hold" || input.action === "reopen") {
      const state =
        input.action === "hold" ? "held" : entry.canonical_result_id ? "linked" : "unmatched";
      await tx`update result_archive_entries set review_state=${state},review_note=${input.identityNote},reviewed_by=${actor.userId},reviewed_at=now() where id=${entry.id}`;
      await tx`insert into result_archive_decisions(entry_id,revision,action,actor_id,note,before_value,after_value)
        values(${entry.id},${entry.revision},${input.action},${actor.userId},${input.identityNote},${JSON.stringify(before)}::jsonb,${JSON.stringify({ ...before, state })}::jsonb)`;
      return { resultId: entry.canonical_result_id, state };
    }
    if (!input.sourceChecked)
      throw new Error("Inspect the official source row and confirm the performance before linking");
    if (entry.review_state === "held") throw new Error("Reopen this held entry before linking");
    if (
      p.status === "unknown" ||
      (p.status === "finished" && !(p.finishSeconds && p.finishSeconds > 0))
    )
      throw new Error(
        "A canonical race result needs a known finish status and a positive time for a finish. Untimed marks remain in the archive",
      );
    if (p.team || p.leg)
      throw new Error(
        "Team or leg entries need the sport-specific review workflow; they cannot be attached as an individual full-race result",
      );
    let athleteId = input.athleteId;
    if (entry.canonical_result_id) {
      const [linked] = await tx<{
        athlete_id: number;
      }>`select athlete_id from results where id=${entry.canonical_result_id}`;
      if (athleteId && linked.athlete_id !== athleteId)
        throw new Error(
          "This source row is already linked to another athlete; use the identity correction workflow",
        );
      athleteId = linked.athlete_id;
    }
    const mappings = p.sourceAthleteId
      ? await tx<{
          athlete_id: number;
        }>`select athlete_id from athlete_source_identities where provider=${p.sourceAthleteProvider} and external_id=${p.sourceAthleteId} union select athlete_id from result_archive_athlete_identifiers where provider=${p.sourceAthleteProvider} and external_id=${p.sourceAthleteId}`
      : [];
    if (mappings.some((m) => m.athlete_id !== athleteId))
      throw new Error(
        "The source athlete identifier belongs to another record; select that athlete for review",
      );
    if (!athleteId) {
      if (input.action === "correct")
        throw new Error("Select the existing athlete/result to correct");
      const candidates = await archiveCandidates(tx, entry.id);
      if (candidates.length)
        throw new Error(
          "Potential existing athletes were found. Review them before creating a private record",
        );
      const slug = `archive-${p.name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 90)}-${entry.id}`;
      const [created] = await tx<{
        id: number;
      }>`insert into athletes(slug,display_name,gender,source_club_name,country,profile_visibility) values(${slug},${p.name},${["M", "F", "U", "X"].includes(p.gender) ? p.gender : "U"},${p.club},${p.country},'private') returning id`;
      athleteId = created.id;
      await tx`insert into athlete_identifiers(athlete_id) values(${athleteId}) on conflict do nothing`;
    }
    const locked = await tx`select id from athletes where id=${athleteId} for update`;
    if (!locked.length) throw new Error("Athlete not found");
    if (p.sourceAthleteId) {
      await tx`insert into result_archive_athlete_identifiers(provider,external_id,athlete_id,reviewed_by,note)
        values(${p.sourceAthleteProvider},${p.sourceAthleteId},${athleteId},${actor.userId},${input.identityNote}) on conflict do nothing`;
      const [mapping] = await tx<{
        athlete_id: number;
      }>`select athlete_id from result_archive_athlete_identifiers where provider=${p.sourceAthleteProvider} and external_id=${p.sourceAthleteId} for update`;
      if (mapping.athlete_id !== athleteId)
        throw new Error(
          "A concurrent review linked this source identity elsewhere; reload the candidates",
        );
    }
    const [current] = await tx<{
      value: Record<string, unknown>;
    }>`select to_jsonb(r) as value from results r where edition_id=${dataset.edition_id} and athlete_id=${athleteId} for update`;
    if (current && input.resultFingerprint !== fingerprint(current.value))
      throw new Error(
        "The existing result changed or has not been reviewed. Reload its details first",
      );
    if (!current && input.resultFingerprint)
      throw new Error("The reviewed result no longer exists; reload before linking");
    if (!current && input.action === "correct")
      throw new Error("There is no existing result to correct");
    const values = canonicalValues(p);
    if (current && input.action !== "correct" && !compatible(current.value, values))
      throw new Error(
        "Performance conflicts with the existing result. Compare both sources and use an explicit correction",
      );
    const precise = (
      current?.value.result_details as
        | {
            timing?: {
              finishSeconds?: number | null;
              chipSeconds?: number | null;
              gunSeconds?: number | null;
            };
          }
        | undefined
    )?.timing;
    if (
      precise &&
      input.action !== "correct" &&
      (["finishSeconds", "chipSeconds", "gunSeconds"] as const).some(
        (k) => precise[k] != null && p[k] != null && precise[k] !== p[k],
      )
    )
      throw new Error(
        "Source precision conflicts with the existing result. Review an explicit correction",
      );
    // A bib is only a source-row locator; never an athlete identity. Block duplicate assignment within this source and edition.
    if (p.bib) {
      await tx`select pg_advisory_xact_lock(hashtext('athrecs:archive-bib'),hashtext(${`${dataset.edition_id}|${dataset.source_url}|${p.bib}`}))`;
      const clashes =
        await tx`select id from results where edition_id=${dataset.edition_id} and athlete_id<>${athleteId} and bib=${p.bib} and source_url=${dataset.source_url} limit 1`;
      if (clashes.length)
        throw new Error("This source bib is already assigned to a different athlete");
    }
    const details = {
      timing: {
        finishSeconds: p.finishSeconds,
        chipSeconds: p.chipSeconds,
        gunSeconds: p.gunSeconds,
      },
      archive: { entryId: entry.id, revision: entry.revision, sourceKey: p.sourceKey },
      sourceRow: { url: dataset.source_url, name: p.name, bib: p.bib, provider: dataset.provider },
      splits: p.splits.map((s) => ({ label: s.label, time: s.value })),
      verification: {
        status: "source_checked",
        method: "staff_source_and_identity_review",
        checkedAt: new Date().toISOString(),
        identityNote: input.identityNote,
      },
    };
    await tx`select set_config('athrecs.archive_actor',${actor.userId},true),set_config('athrecs.archive_note',${input.identityNote},true)`;
    let resultId = current ? Number(current.value.id) : null;
    if (!current) {
      const [saved] = await tx<{
        id: number;
      }>`insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,gender_place,category_place,category,result_source,source_url,result_visibility,result_details)
        values(${dataset.edition_id},${athleteId},${p.status},${values.finish_time_seconds},${values.chip_time_seconds},${values.gun_time_seconds},${values.bib},${p.overallPlace},${p.genderPlace},${p.categoryPlace},${values.category},${dataset.provider},${dataset.source_url},'private',${JSON.stringify(details)}::jsonb) returning id`;
      resultId = saved.id;
    } else if (input.action === "correct") {
      const previousDetails = current.value.result_details as Record<string, unknown>;
      if (previousDetails?.disqualification && p.status !== "DQ")
        throw new Error("A sourced disqualification requires its dedicated review workflow");
      if (
        typeof current.value.source_url === "string" &&
        current.value.source_url.startsWith("https://")
      )
        await tx`insert into result_source_references(result_id,source_url,source_name) values(${resultId},${current.value.source_url},${String(current.value.result_source ?? "")}) on conflict do nothing`;
      await tx`update results set status=${p.status},finish_time_seconds=${values.finish_time_seconds},chip_time_seconds=${values.chip_time_seconds},gun_time_seconds=${values.gun_time_seconds},
        bib=${values.bib},overall_place=${p.overallPlace},gender_place=${p.genderPlace},category_place=${p.categoryPlace},category=${values.category},result_source=${dataset.provider},source_url=${dataset.source_url},
        result_details=result_details || ${JSON.stringify(details)}::jsonb where id=${resultId}`;
    }
    await tx`insert into result_source_references(result_id,source_url,source_name) values(${resultId},${dataset.source_url},${dataset.provider}) on conflict do nothing`;
    await tx`update result_archive_entries set canonical_result_id=${resultId},applied_revision=${entry.revision},applied_history_id=(select coalesce(max(id),0) from result_change_history where result_id=${resultId}),review_state='linked',review_note=${input.identityNote},reviewed_by=${actor.userId},reviewed_at=now(),updated_at=now() where id=${entry.id}`;
    const [after] = await tx<{
      value: Record<string, unknown>;
    }>`select to_jsonb(r) as value from results r where id=${resultId}`;
    await tx`insert into result_archive_decisions(entry_id,revision,action,actor_id,note,before_value,after_value)
      values(${entry.id},${entry.revision},${input.action},${actor.userId},${input.identityNote},${JSON.stringify({ entry: before, result: current?.value ?? null })}::jsonb,${JSON.stringify({ resultId, result: after.value })}::jsonb)`;
    return { resultId, state: "linked" };
  });
}

/** Canonical records imported through any existing tool remain searchable without a backfill. */
export async function searchCanonicalResults(
  sql: Sql,
  input: { q: string; after?: number; editionId?: number },
) {
  const q = `%${escapeLike(input.q.trim())}%`;
  const rows = await sql<{
    id: number;
    athleteId: number;
    name: string;
    slug: string;
    event: string;
    date: string;
    distance: string;
    status: string;
    seconds: number | null;
    provider: string | null;
    sourceUrl: string | null;
    visibility: string;
  }>`
    select r.id,r.athlete_id as "athleteId",a.display_name as name,a.slug,e.name as event,ed.event_date::text as date,ed.distance_code as distance,r.status,r.finish_time_seconds as seconds,r.result_source as provider,r.source_url as "sourceUrl",r.result_visibility as visibility
    from results r join athletes a on a.id=r.athlete_id join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
    where r.id>${input.after ?? 0} and (${input.editionId ?? null}::integer is null or r.edition_id=${input.editionId ?? null})
      and (${input.q}='' or a.display_name ilike ${q} or e.name ilike ${q} or r.bib=${input.q})
    order by r.id limit 51`;
  return { rows: rows.slice(0, 50), next: rows.length > 50 ? rows[49].id : null };
}
