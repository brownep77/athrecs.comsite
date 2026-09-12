import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { getSql, dbSource, type Sql } from "../db.ts";
import {
  COLLECTOR_COUNTRIES,
  validateScope,
  planScope,
  candidateProblems,
  reconcile,
  normalizedName,
  normalizedUrl,
  type Scope,
  type Window,
  type Candidate,
  type Identity,
  type Edition,
} from "./core.ts";
import { researchWindow, type ResearchResult } from "./research.server.ts";
import { collectionRegion } from "./regions.ts";
import { JOB_LEASE_SECONDS } from "./timing.ts";
import { REVIEW_BATCH_LIMIT, validateReviewQuery, type ReviewQuery } from "./review.ts";
type Run = {
  id: string;
  scope: Scope;
  status: string;
  total_jobs: number;
  created_at: string;
  error: string | null;
};
type Job = { id: string; run_id: string; window: Window; lease_token: string; attempts: number };
export const MAX_CONCURRENT_RESEARCH = 3;
export type CandidateRow = {
  id: string;
  candidate: Candidate;
  status: string;
  reason: string;
  event_slug: string;
  event_id: number | null;
  batch_id: string | null;
  dismissed_at?: string | null;
  dismissed_by?: string | null;
};
export function readiness() {
  return {
    persistent: dbSource === "neon",
    research: Boolean(process.env.XAI_API_KEY?.trim()),
    background: process.env.VERCEL_ENV === "production" && Boolean(process.env.CRON_SECRET?.trim()),
  };
}
export function authorizedWorker(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  const actual = request.headers.get("authorization");
  if (!expected || !actual) return false;
  const a = Buffer.from(actual),
    b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function snapshot(sql: Sql, dates: string[]) {
  const sorted = dates.slice().sort();
  const from = sorted[0];
  const to = sorted[sorted.length - 1];
  const events =
    await sql<Identity>`select id,slug,name,country,website from events where sport='Running'`;
  const editions =
    await sql<Edition>`select event_id as "eventId",event_date::text as date,distance_code as distance,distance_km as "distanceKm",source_url as source from editions where event_date between ${from}::date - interval '31 days' and ${to}::date + interval '31 days' and event_id in (select id from events where sport='Running')`;
  const pending = await sql<{
    eventSlug: string;
    date: string;
  }>`select x->>'eventSlug' as "eventSlug",x->>'date' as date from catalogue_import_batches b cross join lateral jsonb_array_elements(coalesce(b.payload->'editions','[]'::jsonb)) x where b.status not in ('published','rolled_back')`;
  const redirects = await sql<{
    old_slug: string;
    current_slug: string;
  }>`select old_slug,current_slug from slug_redirects where entity_type='event'`;
  return { events, editions, pending, redirects };
}
export async function createRun(input: Scope, email: string, sql?: Sql) {
  const scope = validateScope(input);
  const jobs = planScope(scope);
  const db = sql ?? (await getSql());
  if (!sql) {
    const ready = readiness();
    if (!ready.persistent || !ready.research || !ready.background)
      throw new Error(
        "Connect persistent storage, research and the background worker before starting.",
      );
  }
  return db.transaction(async (tx) => {
    // A partial unique index arbitrates simultaneous first clicks without an empty-row lock race.
    const id = randomUUID();
    const rows = await tx<{
      id: string;
    }>`insert into race_collector_runs(id,scope,status,requested_by,total_jobs) values(${id},${JSON.stringify(scope)}::jsonb,'running',${email},${jobs.length}) on conflict do nothing returning id`;
    if (!rows.length) {
      const active =
        await tx<Run>`select * from race_collector_runs where status in ('running','paused')`;
      return { id: active[0].id, reused: true };
    }
    for (let i = 0; i < jobs.length; i += 100) {
      const chunk = jobs
        .slice(i, i + 100)
        .map((window, n) => ({ id: randomUUID(), ordinal: i + n, window }));
      await tx`insert into race_collector_jobs(id,run_id,ordinal,"window") select (x->>'id')::uuid,${id}::uuid,(x->>'ordinal')::int,x->'window' from jsonb_array_elements(${JSON.stringify(chunk)}::jsonb) x`;
    }
    return { id, reused: false };
  });
}
export async function controlRun(
  id: string,
  action: "pause" | "resume" | "retry" | "cancel",
  sql?: Sql,
) {
  const db = sql ?? (await getSql());
  return db.transaction(async (tx) => {
    const rows = await tx<Run>`select * from race_collector_runs where id=${id}::uuid for update`;
    const run = rows[0];
    if (!run) throw new Error("Run not found");
    if (action === "retry") {
      if (run.status === "cancelled") throw new Error("Cancelled runs cannot be retried");
      await tx`update race_collector_jobs set status='queued',attempts=0,available_at=now(),error=null,lease_token=null,lease_until=null where run_id=${id}::uuid and status='failed'`;
    }
    const state = action === "pause" ? "paused" : action === "cancel" ? "cancelled" : "running";
    if (run.status === "cancelled" || (run.status === "complete" && action !== "retry"))
      throw new Error("This run has finished. Start a new scan.");
    await tx`update race_collector_runs set status=${state},error=case when ${state}='running' then null else error end,updated_at=now() where id=${id}::uuid`;
    return { status: state };
  });
}
export async function runWorker(db?: Sql, research = researchWindow) {
  const sql = db ?? (await getSql());
  const claimed = await sql.transaction(async (tx) => {
    // Serialize short claims, then research outside the transaction. Leases cap overlapping ticks.
    const runs =
      await tx<Run>`select * from race_collector_runs where status='running' order by created_at limit 1 for update`;
    const run = runs[0];
    if (!run) return null;
    await tx`update race_collector_jobs set status=case when attempts>=3 then 'failed' else 'queued' end,lease_token=null,error='Previous worker interrupted; checkpoint recovered' where run_id=${run.id}::uuid and status='running' and lease_until<now()`;
    const busy =
      await tx`select id from race_collector_jobs where status='running' and lease_until>now()`;
    if (busy.length >= MAX_CONCURRENT_RESEARCH) return null;
    const jobs =
      await tx<Job>`select j.* from race_collector_jobs j where j.run_id=${run.id}::uuid and j.status='queued' and j.available_at<=now() and not exists(select 1 from race_collector_jobs earlier where earlier.run_id=j.run_id and earlier.status in ('queued','running') and (earlier."window"->>'pass')::int<(j."window"->>'pass')::int and earlier."window"->>'country'=j."window"->>'country' and coalesce(earlier."window"->>'regionCode','')=coalesce(j."window"->>'regionCode','')) order by j.ordinal limit 1 for update of j skip locked`;
    if (!jobs.length) {
      const pending =
        await tx`select id from race_collector_jobs where run_id=${run.id}::uuid and status in ('queued','running')`;
      if (!pending.length)
        await tx`update race_collector_runs set status='complete',updated_at=now() where id=${run.id}::uuid`;
      return null;
    }
    const job = jobs[0];
    const token = randomUUID();
    await tx`update race_collector_jobs set status='running',attempts=attempts+1,lease_token=${token}::uuid,lease_until=now()+${JOB_LEASE_SECONDS}::int*interval '1 second' where id=${job.id}::uuid`;
    await tx`update race_collector_runs set updated_at=now() where id=${run.id}::uuid`;
    return { run, job: { ...job, lease_token: token, attempts: job.attempts + 1 } };
  });
  if (!claimed) return { worked: false };
  const { run, job } = claimed;
  try {
    const known = await sql<{
      name: string;
    }>`select distinct candidate->>'name' name from race_collector_candidates where run_id=${run.id}::uuid and candidate->>'countryCode'=${job.window.country} and (${job.window.regionCode ?? null}::text is null or candidate->>'regionCode'=${job.window.regionCode ?? null}) limit 200`;
    const result = await research(
      job.window,
      run.scope,
      known.map((x) => x.name),
    );
    await saveResult(sql, job, run, result);
    return { worked: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    await sql`update race_collector_jobs set status=case when attempts>=3 then 'failed' else 'queued' end,error=${message.slice(0, 250)},lease_token=null,available_at=now()+interval '2 minutes' where id=${job.id}::uuid and lease_token=${job.lease_token}::uuid`;
    if (error && typeof error === "object" && "pauseRun" in error && error.pauseRun)
      await sql`update race_collector_runs set status='paused',error=${message},updated_at=now() where id=${run.id}::uuid and status='running'`;
    else await sql`update race_collector_runs set updated_at=now() where id=${run.id}::uuid`;
    return { worked: true, error: message };
  }
}
export async function runWorkerBatch(db?: Sql, research = researchWindow) {
  const sql = db ?? (await getSql());
  const settled = await Promise.allSettled(
    Array.from({ length: MAX_CONCURRENT_RESEARCH }, () => runWorker(sql, research)),
  );
  const failed = settled.find((r) => r.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
  const results = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  return {
    worked: results.filter((r) => r.worked).length,
    errors: results.flatMap((r) => (r.error ? [r.error] : [])),
  };
}
export async function saveResult(sql: Sql, job: Job, run: Run, result: ResearchResult) {
  await sql.transaction(async (tx) => {
    const live =
      await tx<Run>`select * from race_collector_runs where id=${run.id}::uuid for update`;
    const current =
      await tx<Job>`select * from race_collector_jobs where id=${job.id}::uuid and lease_token=${job.lease_token}::uuid for update`;
    if (!current.length) return;
    if (live[0].status === "cancelled") {
      await tx`update race_collector_jobs set status='failed',lease_token=null,error='Cancelled before result saved' where id=${job.id}::uuid`;
      return;
    }
    const snap = await snapshot(tx, [job.window.dateFrom, job.window.dateTo]);
    const prior =
      await tx<CandidateRow>`select * from race_collector_candidates where run_id=${run.id}::uuid`;
    for (const c of result.candidates) {
      c.distanceKm = c.distance * (c.unit === "mi" ? 1.609344 : 1);
      const issues = candidateProblems(c, job.window, run.scope);
      const region = collectionRegion(job.window.country, c.regionCode);
      if (region && c.regionCode === job.window.regionCode && !issues.length)
        c.region = region.name;
      const country = COLLECTOR_COUNTRIES.find((x) => x.code === job.window.country)!;
      if (
        job.window.country !== "GB" ||
        !["England", "Wales", "Scotland", "Northern Ireland", "United Kingdom"].includes(c.country)
      )
        c.country = country.name;
      let decision = reconcile(c, snap.events, snap.editions, snap.pending);
      if (snap.redirects.some((a) => a.old_slug === decision.eventSlug))
        decision = {
          ...decision,
          status: "held",
          reason: "A retired event slug needs canonical review",
        };
      const seen = prior.some(
        (p) =>
          p.candidate.date === c.date &&
          ((normalizedName(p.candidate.name) === normalizedName(c.name) &&
            p.candidate.countryCode === c.countryCode &&
            normalizedName(p.candidate.city) === normalizedName(c.city)) ||
            (normalizedUrl(p.candidate.sourceUrl) === normalizedUrl(c.sourceUrl) &&
              p.event_slug === decision.eventSlug)) &&
          Math.abs(p.candidate.distanceKm - c.distanceKm) <= 0.025,
      );
      if (
        prior.some(
          (p) =>
            p.event_slug === decision.eventSlug &&
            normalizedName(p.candidate.name) !== normalizedName(c.name),
        )
      )
        decision = {
          ...decision,
          status: "held",
          reason: "Proposed slug collides with another discovered event; canonical review required",
        };
      if (seen) continue; // Repeated discovery is not another race or an inflated skip count.
      if (issues.length) decision = { ...decision, status: "held", reason: issues.join("; ") };
      const fingerprint = createHash("sha256")
        .update(`${normalizedName(c.name)}|${c.date}|${c.distanceKm.toFixed(3)}|${c.countryCode}`)
        .digest("hex");
      const id = randomUUID();
      await tx`insert into race_collector_candidates(id,run_id,job_id,fingerprint,candidate,status,reason,event_slug,event_id) values(${id}::uuid,${run.id}::uuid,${job.id}::uuid,${fingerprint},${JSON.stringify(c)}::jsonb,${decision.status},${decision.reason},${decision.eventSlug},${decision.eventId}) on conflict(run_id,fingerprint) do nothing`;
      prior.push({
        id,
        candidate: c,
        status: decision.status,
        reason: decision.reason,
        event_slug: decision.eventSlug,
        event_id: decision.eventId,
        batch_id: null,
      });
    }
    await tx`update race_collector_jobs set status='complete',lease_token=null,finished_at=now(),error=null,report=${JSON.stringify({ ...result, candidates: undefined })}::jsonb where id=${job.id}::uuid`;
    await tx`update race_collector_runs set updated_at=now(),status=case when status='running' and not exists(select 1 from race_collector_jobs where run_id=${run.id}::uuid and status in ('queued','running')) then 'complete' else status end where id=${run.id}::uuid`;
  });
}
export async function dashboard(
  runId?: string,
  sqlOverride?: Sql,
  reviewInput?: Partial<ReviewQuery>,
) {
  const review = validateReviewQuery(reviewInput);
  const sql = sqlOverride ?? (await getSql());
  const runs = await sql<Run>`select * from race_collector_runs order by created_at desc limit 15`;
  const run = runId ? runs.find((r) => r.id === runId) : runs[0];
  if (!run)
    return {
      readiness: readiness(),
      runs,
      run: null,
      jobs: [],
      candidates: [],
      counts: [],
      activity: [],
      reviewPage: { ...review, total: 0, pages: 1 },
    };
  const jobs = await sql<{
    country: string;
    regionCode: string | null;
    status: string;
    count: number;
  }>`select "window"->>'country' country,"window"->>'regionCode' as "regionCode",status,count(*)::int count from race_collector_jobs where run_id=${run.id}::uuid group by "window"->>'country',"window"->>'regionCode',status`;
  const counts = await sql<{
    status: string;
    count: number;
  }>`select case when dismissed_at is not null then 'dismissed' else status end status,count(*)::int count from race_collector_candidates where run_id=${run.id}::uuid group by case when dismissed_at is not null then 'dismissed' else status end`;
  const total = (
    await sql<{
      count: number;
    }>`select count(*)::int count from race_collector_candidates where run_id=${run.id}::uuid and (case when ${review.status}='dismissed' then dismissed_at is not null else dismissed_at is null and (${review.status}='all' or status=${review.status}) end) and strpos(lower(concat_ws(' ',candidate->>'name',candidate->>'city',candidate->>'region',candidate->>'country',candidate->>'date',candidate->>'distanceLabel',reason)),lower(${review.search}))>0`
  )[0].count;
  const pages = Math.max(1, Math.ceil(total / review.pageSize));
  const page = Math.min(review.page, pages - 1);
  const candidates =
    await sql<CandidateRow>`select * from race_collector_candidates where run_id=${run.id}::uuid and (case when ${review.status}='dismissed' then dismissed_at is not null else dismissed_at is null and (${review.status}='all' or status=${review.status}) end) and strpos(lower(concat_ws(' ',candidate->>'name',candidate->>'city',candidate->>'region',candidate->>'country',candidate->>'date',candidate->>'distanceLabel',reason)),lower(${review.search}))>0 order by case status when 'review' then 0 when 'held' then 1 when 'duplicate' then 2 else 3 end,created_at,id limit ${review.pageSize} offset ${page * review.pageSize}`;
  const gaps = await sql<{
    window: Window;
    report: ResearchResult | null;
    error: string | null;
  }>`select "window",report,error from race_collector_jobs where run_id=${run.id}::uuid and (error is not null or report is not null) order by ordinal desc limit 100`;
  const activity = await sql<{
    id: string;
    window: Window;
    status: string;
    attempts: number;
    error: string | null;
    available_at: string;
  }>`select id,"window",status,attempts,error,available_at from race_collector_jobs where run_id=${run.id}::uuid and (status in ('running','failed') or (status='queued' and attempts>0)) order by case status when 'running' then 0 when 'queued' then 1 else 2 end,ordinal limit 6`;
  return {
    readiness: readiness(),
    runs,
    run,
    jobs,
    candidates,
    counts,
    gaps,
    activity,
    reviewPage: { ...review, page, pages, total },
  };
}
export async function exportRun(id: string) {
  const sql = await getSql();
  return {
    run: await sql`select * from race_collector_runs where id=${id}::uuid`,
    jobs: await sql`select * from race_collector_jobs where run_id=${id}::uuid order by ordinal`,
    candidates:
      await sql`select * from race_collector_candidates where run_id=${id}::uuid order by created_at`,
  };
}
export async function dismissDuplicates(
  runId: string,
  action: "dismiss" | "restore",
  email: string,
  ids?: string[],
  sqlOverride?: Sql,
) {
  if (
    !["dismiss", "restore"].includes(action) ||
    (ids !== undefined &&
      (!Array.isArray(ids) || !ids.length || ids.length > 100 || new Set(ids).size !== ids.length))
  )
    throw new Error("Invalid duplicate selection.");
  const sql = sqlOverride ?? (await getSql());
  return sql.transaction(async (tx) => {
    const runs = await tx`select id from race_collector_runs where id=${runId}::uuid for update`;
    if (!runs.length) throw new Error("Run not found.");
    if (ids) {
      const rows =
        await tx`select id from race_collector_candidates where run_id=${runId}::uuid and id=any(${ids}::uuid[]) and status='duplicate' for update`;
      if (rows.length !== ids.length)
        throw new Error(
          "Only already-listed findings from this scan can be dismissed or restored.",
        );
    }
    const rows =
      await tx`update race_collector_candidates set dismissed_at=case when ${action}='dismiss' then now() else null end,dismissed_by=case when ${action}='dismiss' then ${email} else null end where run_id=${runId}::uuid and status='duplicate' and (${ids ?? null}::uuid[] is null or id=any(${ids ?? null}::uuid[])) and (case when ${action}='dismiss' then dismissed_at is null else dismissed_at is not null end) returning id`;
    return { changed: rows.length, action };
  });
}
export async function stageReviewed(ids: string[], email: string, sqlOverride?: Sql) {
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    ids.length > REVIEW_BATCH_LIMIT ||
    new Set(ids).size !== ids.length
  )
    throw new Error("Select 1–50 reviewed listings.");
  const sql = sqlOverride ?? (await getSql());
  const { stageCatalogueBatch } = await import("../athrecs/catalogue-publishing.server");
  return sql.transaction(async (tx) => {
    // Serialize source review against workers and another reviewer.
    await tx`select id from race_collector_runs order by id for update`;
    const rows = await tx<
      CandidateRow & { run_id: string }
    >`select * from race_collector_candidates where id=any(${ids}::uuid[]) order by id for update`;
    if (
      rows.length !== ids.length ||
      rows.some((r) => r.status !== "review" || r.dismissed_at) ||
      new Set(rows.map((r) => r.run_id)).size !== 1
    )
      throw new Error("Selection changed. Refresh and review again.");
    const snap = await snapshot(
      tx,
      rows.map((r) => r.candidate.date),
    );
    const events: import("../athrecs/import.server").ImportEventInput[] = [];
    const editions: import("../athrecs/import.server").ImportEditionInput[] = [];
    for (const row of rows) {
      const c = row.candidate;
      const decision = reconcile(c, snap.events, snap.editions, snap.pending);
      if (
        decision.status !== "review" ||
        decision.eventSlug !== row.event_slug ||
        decision.eventId !== row.event_id ||
        snap.redirects.some((a) => a.old_slug === row.event_slug)
      )
        throw new Error(`${c.name}: catalogue identity changed; refresh research before staging.`);
      if (
        rows.some(
          (other) =>
            other.id !== row.id &&
            other.event_slug === row.event_slug &&
            other.candidate.date === c.date &&
            Math.abs(other.candidate.distanceKm - c.distanceKm) <= 0.025,
        )
      )
        throw new Error("Selection contains equivalent race distances.");
      if (!row.event_id && !events.some((e) => e.slug === row.event_slug))
        events.push({
          slug: row.event_slug,
          name: c.name,
          sport: "Running",
          country: c.country,
          county: c.region,
          city: c.city,
          surface: c.surface,
          website: c.sourceUrl,
          distances: rows
            .filter((r) => r.event_slug === row.event_slug)
            .map((r) => r.candidate.distanceLabel),
        });
      editions.push({
        eventSlug: row.event_slug,
        date: c.date,
        distance: c.distanceLabel,
        distanceKm: c.distanceKm,
        status: c.entryStatus,
        startTime: c.startTime || undefined,
        entryUrl: c.entryUrl || undefined,
        source: c.sourceUrl,
        notes:
          `${c.notes} ${c.evidence}${c.entryStatus === "TBC" ? " Date confirmed; entry availability is unknown." : ""}`.trim(),
      });
    }
    const digest = createHash("sha256")
      .update(ids.slice().sort().join("|"))
      .digest("hex")
      .slice(0, 20);
    const staged = await stageCatalogueBatch(
      {
        sourceKey: `runrecs:collector:${rows[0].run_id}:${digest}`,
        sourceUrl: rows[0].candidate.sourceUrl,
        events,
        editions,
      },
      email,
      tx,
    );
    await tx`update race_collector_candidates set status='staged',batch_id=${staged.batchId}::uuid,reviewed_by=${email},reviewed_at=now() where id=any(${ids}::uuid[])`;
    return staged;
  });
}
