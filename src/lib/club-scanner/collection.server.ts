import { randomUUID } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import type { Sql } from "../db.ts";
import { createRunInTransaction, runNext, publish } from "./service.server.ts";
import { fetchSource, INDEX_URL } from "./provider.server.ts";
import {
  collectionConfigSchema,
  collectionScope,
  saveCollectionSchema,
  pilotClubs,
  type CollectionConfig,
  type SaveCollection,
} from "./collection.ts";
const db = async (override?: Sql) => override ?? (await import("../db.ts")).getSql();
type Plan = {
  club_id: number;
  name: string;
  slug: string;
  config: CollectionConfig;
  enabled: boolean;
  revision: number;
  next_check_at: string;
  last_started_at: string | null;
  last_finished_at: string | null;
  last_run_id: string | null;
  last_error: string | null;
  research_checked_at: string | null;
  research_checkpoint: { summary?: string | null };
};
const actor = "club-collection-worker";
async function audit(
  sql: Sql,
  clubId: number,
  who: string,
  action: string,
  before: unknown,
  after: unknown,
) {
  await sql`insert into club_collection_reviews(id,club_id,actor,action,before_value,after_value) values(${randomUUID()}::uuid,${clubId},${who},${action},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb)`;
}
export async function savePlan(input: SaveCollection, who: string, override?: Sql) {
  const data = saveCollectionSchema.parse(input),
    sql = await db(override);
  return sql.transaction(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext('club-collection-plan:' || ${String(data.clubId)}))`;
    const old = (
      await tx<Plan>`select * from club_collection_plans where club_id=${data.clubId} for update`
    )[0];
    if ((old?.revision ?? 0) !== data.revision)
      throw new Error("This club plan changed. Reload before saving.");
    if (!(await tx`select id from clubs where id=${data.clubId}`).length)
      throw new Error("Club not found");
    await tx`insert into club_collection_plans(club_id,config,enabled,updated_by) values(${data.clubId},${JSON.stringify(data.config)}::jsonb,${data.enabled},${who})
      on conflict(club_id) do update set config=excluded.config,enabled=excluded.enabled,revision=club_collection_plans.revision+1,updated_by=excluded.updated_by,updated_at=now()`;
    if (!data.enabled)
      await tx`update club_scan_runs set status='paused',updated_at=now() where collection_club_id=${data.clubId} and status='running'`;
    else if (old && !old.enabled)
      await tx`update club_scan_runs set status='running',updated_at=now() where collection_club_id=${data.clubId} and status='paused'`;
    await audit(tx, data.clubId, who, "save_plan", old ?? null, data);
    return { saved: true };
  });
}
export async function setupPilot(who: string, override?: Sql) {
  const sql = await db(override);
  let added = 0;
  // Resolve actual directory slugs; do not create clubs or overwrite existing plans.
  for (const template of pilotClubs) {
    const club = (
      await sql<{
        id: number;
        source_names: string;
      }>`select id,source_names from clubs where slug=${template.slug}`
    )[0];
    if (
      !club ||
      (await sql`select club_id from club_collection_plans where club_id=${club.id}`).length
    )
      continue;
    const config = collectionConfigSchema.parse({
      ...template,
      aliases: [
        ...new Set([...template.aliases, ...(club.source_names ?? "").split("|").filter(Boolean)]),
      ],
      discover: true,
      historyFrom: `${new Date().getUTCFullYear() - 5}-01-01`,
      intervalHours: 24,
    });
    await savePlan({ clubId: club.id, revision: 0, enabled: true, config }, who, sql);
    added++;
  }
  return { added };
}
export async function checkNow(clubId: number, who: string, override?: Sql) {
  const sql = await db(override);
  await sql.transaction(async (tx) => {
    const plan = (
      await tx<Plan>`select * from club_collection_plans where club_id=${clubId} for update`
    )[0];
    if (!plan) throw new Error("Save a club plan first");
    if (!plan.enabled) throw new Error("Resume this club plan before checking");
    await tx`update club_collection_plans set next_check_at=now(),updated_at=now() where club_id=${clubId}`;
    await audit(tx, clubId, who, "check_requested", null, { nextCheck: "now" });
  });
  return enqueueDue(sql);
}
export async function enqueueDue(override?: Sql) {
  const sql = await db(override);
  return sql.transaction(async (tx) => {
    const plans =
      await tx<Plan>`select p.* from club_collection_plans p where enabled and next_check_at<=now()
      and not exists(select 1 from club_scan_runs r where r.collection_club_id=p.club_id and r.status in ('running','paused'))
      order by next_check_at,club_id for update of p skip locked limit 12`;
    let started = 0;
    for (const plan of plans) {
      const config = collectionConfigSchema.parse(plan.config);
      const run = await createRunInTransaction(
        collectionScope(plan.club_id, config, !plan.last_run_id),
        actor,
        tx,
      );
      await tx`update club_scan_runs set collection_club_id=${plan.club_id} where id=${run.id}::uuid`;
      await tx`update club_collection_plans set last_run_id=${run.id}::uuid,last_started_at=now(),last_error=null,
        next_check_at=now()+${config.intervalHours}*interval '1 hour' where club_id=${plan.club_id}`;
      await audit(tx, plan.club_id, actor, "scan_started", null, {
        runId: run.id,
        historical: !plan.last_run_id,
      });
      started++;
    }
    return { started };
  });
}

// Private, compressed and bounded. Only the allowlisted provider fetcher is used.
// Publication deliberately uses fetchSource directly, never this scan cache.
export function sharedSourceFetcher(sql: Sql, fetcher = fetchSource) {
  return async (url: string) => {
    const cached = (
      await sql<{
        compressed_body: string;
      }>`select compressed_body from club_collection_source_cache where url=${url} and expires_at>now()`
    )[0];
    if (cached) {
      await sql`update club_collection_source_cache set hits=hits+1 where url=${url}`;
      return gunzipSync(Buffer.from(cached.compressed_body, "base64"), {
        maxOutputLength: 6_000_000,
      }).toString("utf8");
    }
    const html = await fetcher(url);
    if (Buffer.byteLength(html) > 6_000_000) throw new Error("Source exceeds the scan limit");
    const compressed = gzipSync(html).toString("base64");
    await sql`insert into club_collection_source_cache(url,compressed_body,expires_at,bytes) values(${url},${compressed},now()+${url === INDEX_URL ? 1 : 24}*interval '1 hour',${Buffer.byteLength(html)})
      on conflict(url) do update set compressed_body=excluded.compressed_body,fetched_at=now(),expires_at=excluded.expires_at,bytes=excluded.bytes,hits=0`;
    await sql`delete from club_collection_source_cache where expires_at<now() or url in (select url from club_collection_source_cache order by fetched_at desc offset 64)`;
    return html;
  };
}
export async function finishCollections(override?: Sql) {
  const sql = await db(override);
  await sql`update club_collection_plans p set last_finished_at=r.updated_at,
    last_error=(select string_agg(distinct j.error,'; ') from club_scan_jobs j where j.run_id=r.id and j.status in ('held','error'))
    from club_scan_runs r where r.id=p.last_run_id and r.status='complete' and (p.last_finished_at is null or p.last_finished_at<r.updated_at)`;
}
export async function publishReviewed(override?: Sql, fetcher = fetchSource) {
  const sql = await db(override);
  // Only decisions already recorded by a reviewer. No automatic identity approval.
  const rows = await sql<{
    id: string;
    club_id: number;
  }>`select c.id,c.club_id from club_scan_candidates c
    join club_collection_plans p on p.club_id=c.club_id where p.enabled and p.config->>'publishApproved'='true'
    and c.status='approved' and c.decision is not null
    and exists(select 1 from club_scan_run_candidates rc join club_scan_runs r on r.id=rc.run_id where rc.candidate_id=c.id and r.collection_club_id=p.club_id and r.status in ('running','complete'))
    order by c.updated_at,c.id limit 1`;
  if (!rows.length) return { published: 0 };
  try {
    return await publish([rows[0].id], actor, sql, fetcher, async (tx) => {
      const plan = (
        await tx<{
          enabled: boolean;
          config: CollectionConfig;
        }>`select enabled,config from club_collection_plans where club_id=${rows[0].club_id} for update`
      )[0];
      return !!plan?.enabled && plan.config.publishApproved;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publication failed";
    // Retain the approval as evidence, hold the candidate, and avoid retrying it forever.
    await sql.transaction(async (tx) => {
      const current = (
        await tx<{
          status: string;
          decision: unknown;
        }>`select status,decision from club_scan_candidates where id=${rows[0].id}::uuid for update`
      )[0];
      if (current?.status !== "approved") return;
      await tx`update club_scan_candidates set status='held',issues=${JSON.stringify([message])}::jsonb,updated_at=now() where id=${rows[0].id}::uuid`;
      await audit(tx, rows[0].club_id, actor, "publication_held", current, {
        candidateId: rows[0].id,
        reason: message,
      });
    });
    return { published: 0, held: 1 };
  }
}
export async function collectionWorker(override?: Sql, fetcher = fetchSource) {
  const sql = await db(override);
  const scheduled = await enqueueDue(sql);
  const scanned = await runNext(undefined, sql, sharedSourceFetcher(sql, fetcher));
  await finishCollections(sql);
  const publication = await publishReviewed(sql, fetcher);
  return { ...scheduled, ...scanned, ...publication };
}
export async function collectionDashboard(override?: Sql) {
  const sql = await db(override);
  const plans = await sql<
    Plan & {
      run_status: string | null;
      sources: number;
      checked: number;
      errors: number;
      waiting: number;
      published: number;
      review: number;
      duplicates: number;
      new_profiles: number;
    }
  >`select p.*,jsonb_build_object('summary',p.research_checkpoint->>'summary') as research_checkpoint,c.name,c.slug,r.status as run_status,
    (select count(*)::int from club_scan_jobs j where j.run_id=p.last_run_id) as sources,
    (select count(*)::int from club_scan_jobs j where j.run_id=p.last_run_id and j.checked_at is not null) as checked,
    (select count(*)::int from club_scan_jobs j where j.run_id=p.last_run_id and j.status in ('error','held')) as errors,
    (select count(*)::int from club_scan_jobs j where j.run_id=p.last_run_id and j.status in ('queued','processing')) as waiting,
    (select count(*)::int from club_scan_candidates s where s.club_id=p.club_id and s.published_at is not null) as published,
    (select count(*)::int from club_scan_candidates s where s.club_id=p.club_id and s.status in ('proposed','held','approved')) as review,
    (select count(*)::int from club_scan_candidates s where s.club_id=p.club_id and s.status='duplicate') as duplicates,
    (select count(distinct v.after_value->>'athleteId')::int from club_scan_reviews v join club_scan_candidates s on s.id=v.candidate_id where s.club_id=p.club_id and v.action='publish' and v.before_value#>>'{decision,action}'='create') as new_profiles
    from club_collection_plans p join clubs c on c.id=p.club_id left join club_scan_runs r on r.id=p.last_run_id order by c.name`;
  const clubs = await sql<{
    id: number;
    name: string;
    source_names: string;
  }>`select id,name,source_names from clubs order by name`;
  return { plans, clubs };
}
