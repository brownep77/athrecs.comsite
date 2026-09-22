import { isDeepStrictEqual } from "node:util";
import { randomUUID } from "node:crypto";
import type { Sql } from "../db.ts";
import { sourcePerformanceSchema } from "../athrecs/source-performance-history.ts";
import {
  assess,
  normal,
  providerUrl,
  scopeSchema,
  reviewSchema,
  filterSchema,
  type Candidate,
  type Decision,
  type Filters,
  type Match,
  type Row,
  type Scope,
  type ReviewInput,
} from "./core.ts";
import { discover, extract, fetchSource, INDEX_URL } from "./provider.server.ts";
const db = async (override?: Sql) => override ?? (await import("../db.ts")).getSql();
type Run = {
  id: string;
  club_id: number;
  scope: Scope;
  status: string;
  created_at: string;
  club_name: string;
};
type Job = {
  id: string;
  run_id: string;
  url: string;
  kind: string;
  status: string;
  lease_token: string;
  scope: Scope;
  club_id: number;
  error: string | null;
};
export async function athletes(sql: Sql): Promise<Match[]> {
  return sql<Match>`select a.id,a.display_name as name,a.slug,a.gender,a.club_id as "clubId",a.source_club_name as club,a.profile_visibility as visibility,(select athlete_number::text from athlete_resolved_ids where athlete_id=a.id) as number,
 exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed from athletes a`;
}
export async function createRun(input: Scope, actor: string, override?: Sql) {
  const sql = await db(override),
    scope = scopeSchema.parse(input);
  const clubs = await sql<{
    name: string;
    source_names: string;
  }>`select name,source_names from clubs where id=${scope.clubId}`;
  if (!clubs.length) throw new Error("Club not found");
  scope.aliases = [...new Set([clubs[0].name, ...scope.aliases])];
  const id = randomUUID();
  await sql.transaction(async (tx) => {
    await tx`insert into club_scan_runs(id,club_id,scope,status,created_by) values(${id}::uuid,${scope.clubId},${JSON.stringify(scope)}::jsonb,'running',${actor})`;
    for (const url of [
      ...new Set([
        ...(scope.discover ? [INDEX_URL] : []),
        ...scope.urls.map((u) => (providerUrl(u) ? u.split("#")[0] : u)),
      ]),
    ]) {
      const kind = url === INDEX_URL ? "index" : providerUrl(url) ? "race" : "manual";
      await tx`insert into club_scan_jobs(id,run_id,url,kind,status,error) values(${randomUUID()}::uuid,${id}::uuid,${url},${kind},${kind === "manual" ? "held" : "queued"},${kind === "manual" ? "Provider not yet supported. Keep this link for manual source review." : null})`;
    }
  });
  return { id };
}
async function audit(
  tx: Sql,
  c: Candidate,
  actor: string,
  action: string,
  reason: string,
  after: unknown,
) {
  await tx`insert into club_scan_reviews(id,candidate_id,actor,action,reason,before_value,after_value) values(${randomUUID()}::uuid,${c.id}::uuid,${actor},${action},${reason},${JSON.stringify({ status: c.status, decision: c.decision, athleteId: c.athlete_id })}::jsonb,${JSON.stringify(after)}::jsonb)`;
}
export async function runNext(runId?: string, override?: Sql, fetcher = fetchSource) {
  const sql = await db(override),
    token = randomUUID();
  const jobs = await sql<Job>`with next_job as (
 select j.id from club_scan_jobs j join club_scan_runs r on r.id=j.run_id
 where r.status='running' and (${runId ?? null}::uuid is null or r.id=${runId ?? null}::uuid)
 and (j.status='queued' or (j.status='processing' and j.lease_until<now())) and j.attempts<3
 order by r.created_at,j.kind,j.id for update of j skip locked limit 1
 ), claimed as (update club_scan_jobs j set status='processing',attempts=attempts+1,lease_token=${token}::uuid,lease_until=now()+interval '120 seconds' from next_job n where j.id=n.id returning j.*)
 select c.*,r.scope,r.club_id from claimed c join club_scan_runs r on r.id=c.run_id`;
  if (!jobs.length) {
    await completeRuns(sql, runId);
    return { processed: 0 };
  }
  const job = jobs[0];
  try {
    const html = await fetcher(job.url);
    if (job.kind === "index") {
      const urls = discover(html, job.scope);
      await sql.transaction(async (tx) => {
        await lockJob(tx, job, token);
        if (urls.length)
          await tx`insert into club_scan_jobs(id,run_id,url,kind,status)
     select (x->>'id')::uuid,${job.run_id}::uuid,x->>'url','race','queued' from jsonb_array_elements(${JSON.stringify(urls.map((x) => ({ ...x, id: randomUUID() })))}::jsonb) x on conflict(run_id,url) do nothing`;
        await tx`update club_scan_jobs set status='done',checked_at=now(),capture=${JSON.stringify({ discovered: urls.length, coverage: "Provider results index; explicit links only" })}::jsonb,lease_until=null where id=${job.id}::uuid`;
      });
    } else {
      const result = extract(html, job.url, job.scope),
        people = await athletes(sql);
      const staged = result.rows.map((row) => ({
        id: randomUUID(),
        key: row.key,
        data: row,
        ...assess(row, people, job.club_id),
      }));
      const savedRows = await sourceRecords(sql, result.rows);
      for (const candidate of staged) {
        const existing = sourceMatches(candidate.data, savedRows);
        if (existing.length) {
          candidate.status = "duplicate";
          candidate.issues = ["Source row is already stored in an athlete history"];
        }
      }
      await sql.transaction(async (tx) => {
        await lockJob(tx, job, token);
        if (staged.length) {
          await tx`insert into club_scan_candidates(id,club_id,source_key,data,matches,issues,status)
     select (x->>'id')::uuid,${job.club_id},x->>'key',x->'data',x->'matches',x->'issues',x->>'status' from jsonb_array_elements(${JSON.stringify(staged)}::jsonb) x
     on conflict(club_id,source_key) do nothing`;
          await tx`insert into club_scan_run_candidates(run_id,candidate_id) select ${job.run_id}::uuid,id from club_scan_candidates where club_id=${job.club_id} and source_key=any(${staged.map((x) => x.key)}::text[]) on conflict do nothing`;
        }
        await tx`update club_scan_jobs set status=${result.errors.length ? "held" : "done"},error=${result.errors.join("; ") || null},source_hash=${result.sourceHash},capture=${JSON.stringify(result.captures)}::jsonb,checked_at=now(),lease_until=null where id=${job.id}::uuid`;
      });
    }
  } catch (error) {
    await sql`update club_scan_jobs set status='error',error=${error instanceof Error ? error.message : "Source scan failed"},lease_until=null where id=${job.id}::uuid and lease_token=${token}::uuid`;
  }
  await completeRuns(sql, job.run_id);
  return { processed: 1 };
}
async function lockJob(sql: Sql, job: Job, token: string) {
  const active =
    await sql`select j.id from club_scan_jobs j join club_scan_runs r on r.id=j.run_id where j.id=${job.id}::uuid and j.lease_token=${token}::uuid and r.status='running' for update of j,r`;
  if (!active.length) throw new Error("Scan paused or lease replaced; no findings saved");
}
async function completeRuns(sql: Sql, runId?: string) {
  await sql`update club_scan_jobs set status='error',error='Worker retry limit reached' where status='processing' and lease_until<now() and attempts>=3`;
  await sql`update club_scan_runs r set status='complete',updated_at=now() where status='running' and (${runId ?? null}::uuid is null or id=${runId ?? null}::uuid) and not exists(select 1 from club_scan_jobs j where j.run_id=r.id and j.status in ('queued','processing'))`;
}
export async function control(
  runId: string,
  action: "pause" | "resume" | "retry" | "cancel",
  override?: Sql,
) {
  const sql = await db(override);
  await sql.transaction(async (tx) => {
    const run = await tx<Run>`select * from club_scan_runs where id=${runId}::uuid for update`;
    if (!run.length) throw new Error("Run not found");
    if (action === "retry")
      await tx`update club_scan_jobs set status='queued',attempts=0,error=null where run_id=${runId}::uuid and status='error'`;
    await tx`update club_scan_runs set status=${action === "pause" ? "paused" : action === "cancel" ? "cancelled" : "running"},updated_at=now() where id=${runId}::uuid`;
  });
}
export async function dashboard(input: Filters, override?: Sql) {
  const sql = await db(override),
    filters = filterSchema.parse(input);
  const clubs = await sql<{
    id: number;
    name: string;
    source_names: string;
  }>`select id,name,source_names from clubs order by name`;
  const runs =
    await sql<Run>`select r.*,c.name as club_name from club_scan_runs r join clubs c on c.id=r.club_id order by r.created_at desc limit 100`;
  const runId = filters.runId ?? runs[0]?.id;
  if (!runId)
    return {
      clubs,
      runs,
      runId: null,
      candidates: [] as Candidate[],
      total: 0,
      counts: [] as { status: string; n: number }[],
      jobs: [] as { status: string; n: number }[],
      problems: [] as { id: string; url: string; error: string; status: string }[],
    };
  const query = "%" + filters.q + "%";
  const candidates =
    await sql<Candidate>`select c.* from club_scan_candidates c join club_scan_run_candidates rc on rc.candidate_id=c.id where rc.run_id=${runId}::uuid and (${filters.status}='all' or c.status=${filters.status}) and (c.data->>'name' ilike ${query} or c.data->'performance'->>'meeting' ilike ${query}) order by c.data->>'name',c.source_key limit 50 offset ${(filters.page - 1) * 50}`;
  const totals = await sql<{
    n: number;
  }>`select count(*)::int n from club_scan_candidates c join club_scan_run_candidates rc on rc.candidate_id=c.id where rc.run_id=${runId}::uuid and (${filters.status}='all' or c.status=${filters.status}) and (c.data->>'name' ilike ${query} or c.data->'performance'->>'meeting' ilike ${query})`;
  const counts = await sql<{
    status: string;
    n: number;
  }>`select c.status,count(*)::int n from club_scan_candidates c join club_scan_run_candidates rc on rc.candidate_id=c.id where rc.run_id=${runId}::uuid group by c.status`;
  const jobs = await sql<{
    status: string;
    n: number;
  }>`select status,count(*)::int n from club_scan_jobs where run_id=${runId}::uuid group by status`;
  const problems = await sql<{
    id: string;
    url: string;
    error: string;
    status: string;
  }>`select id,url,error,status from club_scan_jobs where run_id=${runId}::uuid and status in ('error','held') order by url limit 100`;
  return { clubs, runs, runId, candidates, total: totals[0].n, counts, jobs, problems };
}
export async function searchAthletes(q: string, override?: Sql) {
  const sql = await db(override),
    term = "%" + q.trim() + "%";
  if (q.trim().length < 2) return [];
  return sql<Match>`select a.id,a.display_name as name,a.slug,a.gender,a.club_id as "clubId",a.source_club_name as club,a.profile_visibility as visibility,(select athlete_number::text from athlete_resolved_ids where athlete_id=a.id) as number,exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed from athletes a where display_name ilike ${term} or slug ilike ${term} order by display_name limit 30`;
}
export async function review(input: ReviewInput, actor: string, override?: Sql) {
  const sql = await db(override),
    data = reviewSchema.parse(input);
  return sql.transaction(async (tx) => {
    const rows =
      await tx<Candidate>`select * from club_scan_candidates where id=any(${data.ids}::uuid[]) order by id for update`;
    if (rows.length !== new Set(data.ids).size)
      throw new Error("Some selected rows are unavailable");
    const people = await athletes(tx);
    for (const c of rows) {
      if (c.status === "published")
        throw new Error("Published rows cannot be changed in this queue");
      let status = "held",
        decision: Decision | null = null;
      if (data.action === "dismiss") status = "dismissed";
      else if (data.action === "reopen") status = assess(c.data, people, c.club_id).status;
      else if (["suggested", "create", "link"].includes(data.action)) {
        if (!data.sourcesReviewed || !data.evidenceUrl)
          throw new Error("Confirm source and identity review and record an evidence link");
        if (c.data.sourceIssues.length)
          throw new Error("Resolve source-table issues by rechecking the source before approval");
        const check = assess(c.data, people, c.club_id),
          exact = check.matches.filter((a) => normal(a.name) === normal(c.data.name));
        const action =
          data.action === "suggested" ? (exact.length === 1 ? "link" : "create") : data.action;
        if (data.action === "suggested" && check.issues.length)
          throw new Error("Choose an explicit identity decision for uncertain matches");
        const athleteId =
          data.athleteId ?? (data.action === "suggested" ? exact[0]?.id : undefined);
        if (action === "link") {
          const target = people.find((a) => a.id === athleteId);
          if (!target) throw new Error("Choose an existing athlete");
          if (target.managed || target.visibility !== "public")
            throw new Error("This profile needs its separate owner/publication review");
          if (c.data.gender && target.gender !== c.data.gender)
            throw new Error("Source gender conflicts with the selected athlete");
        } else if (exact.length)
          throw new Error(
            "An exact-name profile exists. Link it with evidence or hold the result.",
          );
        if (action === "create" && c.data.name.split(/\s+/)[0].replace(/\W/g, "").length < 2)
          throw new Error("Initial-only names cannot create new profiles");
        decision = {
          action: action as "create" | "link",
          ...(action === "link" ? { athleteId } : {}),
          reason: data.reason,
          evidenceUrl: data.evidenceUrl,
          ...(action === "link"
            ? {
                target: ((a) => ({ name: a.name, gender: a.gender, clubId: a.clubId }))(
                  people.find((a) => a.id === athleteId)!,
                ),
              }
            : {}),
          reviewedBy: actor,
          reviewedAt: new Date().toISOString(),
          sourceHash: c.data.sourceHash,
        };
        status = "approved";
      }
      await tx`update club_scan_candidates set status=${status},decision=${decision ? JSON.stringify(decision) : null}::jsonb,updated_at=now() where id=${c.id}::uuid`;
      await audit(tx, c, actor, data.action, data.reason, { status, decision });
    }
    return { reviewed: rows.length };
  });
}
type SavedSource = {
  athlete_id: number;
  provider: string;
  external_id: string;
  p: Row["performance"];
};
async function sourceRecords(sql: Sql, rows: Row[]) {
  if (!rows.length) return [];
  return sql<SavedSource>`select h.athlete_id,h.provider,h.external_id,p from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances) p where p->>'date'=any(${[...new Set(rows.map((r) => r.performance.date))]}::text[]) or (h.provider='Club scanner' and h.external_id=any(${rows.map((r) => r.key)}::text[]))`;
}
function sourceMatches(row: Row, saved: SavedSource[]) {
  const record = row.performance.labels.find((l) => l.startsWith("Source record: "));
  return saved.filter(
    (s) =>
      (s.provider === "Club scanner" && s.external_id === row.key) ||
      (s.p.date === row.performance.date &&
        ((record && s.p.labels?.includes(record)) ||
          (s.p.sourceUrls?.includes(row.url) && s.p.labels?.includes("Bib: " + row.bib)))),
  );
}
async function recordedSource(sql: Sql, row: Row) {
  return sourceMatches(row, await sourceRecords(sql, [row]));
}
async function collision(sql: Sql, row: Row, athleteId: number) {
  const histories = await sql<{
    p: Row["performance"];
  }>`select p from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances) p where h.athlete_id=${athleteId} and p->>'date'=${row.performance.date}`;
  if (histories.length)
    return histories.some(
      (h) =>
        h.p.performance === row.performance.performance &&
        normal(h.p.meeting) === normal(row.performance.meeting),
    )
      ? "duplicate"
      : "held";
  const results =
    await sql`select r.id from results r join editions e on e.id=r.edition_id where r.athlete_id=${athleteId} and e.event_date=${row.performance.date}::date`;
  return results.length ? "held" : null;
}
export async function publish(ids: string[], actor: string, override?: Sql, fetcher = fetchSource) {
  if (!ids.length || ids.length > 10)
    throw new Error("Publish between 1 and 10 reviewed rows at a time");
  const sql = await db(override),
    selected =
      await sql<Candidate>`select * from club_scan_candidates where id=any(${ids}::uuid[]) order by id`;
  if (
    selected.length !== new Set(ids).size ||
    selected.some((c) => c.status !== "approved" || !c.decision)
  )
    throw new Error("Only approved rows can be published");
  // Re-fetch the independent tables. A reviewed manifest is not source verification.
  const sourceHtml = new Map<string, string>();
  const urls = [...new Set(selected.map((c) => c.data.url.split("#")[0]))];
  for (let i = 0; i < urls.length; i += 3)
    await Promise.all(urls.slice(i, i + 3).map(async (u) => sourceHtml.set(u, await fetcher(u))));
  const fresh = new Map<string, Row>();
  for (const c of selected) {
    const scope = {
      clubId: c.club_id,
      aliases: [c.data.club],
      dateFrom: c.data.performance.date,
      dateTo: c.data.performance.date,
      discover: false,
      urls: [],
    } as Scope;
    const result = extract(
        sourceHtml.get(c.data.url.split("#")[0])!,
        c.data.url.split("#")[0],
        scope,
      ),
      row = result.rows.find((r) => r.key === c.source_key);
    if (
      !row ||
      row.sourceIssues.length ||
      !isDeepStrictEqual(row.raw, c.data.raw) ||
      !isDeepStrictEqual(row.performance, c.data.performance)
    )
      throw new Error(
        `${c.data.name}: the source changed or is ambiguous. Recheck before publishing.`,
      );
    sourcePerformanceSchema.parse(row.performance);
    fresh.set(c.id, row);
  }
  return sql.transaction(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext('athrecs-club-scanner-publication'))`;
    const rows =
      await tx<Candidate>`select * from club_scan_candidates where id=any(${ids}::uuid[]) order by id for update`;
    const created = new Map<string, number>();
    let published = 0,
      duplicates = 0,
      held = 0,
      newProfiles = 0;
    for (const c of rows) {
      const before = selected.find((s) => s.id === c.id)!;
      if (
        c.status !== "approved" ||
        !isDeepStrictEqual(c.decision, before.decision) ||
        !isDeepStrictEqual(c.data, before.data)
      )
        throw new Error("A review changed during publication. Reload the queue.");
      const row = fresh.get(c.id)!,
        d = c.decision!;
      let athleteId = d.athleteId;
      const recorded = await recordedSource(tx, row);
      if (recorded.length) {
        const state =
          d.action === "create" || recorded.every((r) => r.athlete_id === d.athleteId)
            ? "duplicate"
            : "held";
        const reason =
          state === "duplicate"
            ? "This source row is already stored; no profile or history created"
            : "Source row is already attached to another athlete; identity conflict";
        await tx`update club_scan_candidates set status=${state},issues=${JSON.stringify([reason])}::jsonb,updated_at=now() where id=${c.id}::uuid`;
        await audit(tx, c, actor, state, reason, { status: state });
        if (state === "duplicate") duplicates++;
        else held++;
        continue;
      }
      const people = await athletes(tx),
        exact = people.filter((a) => normal(a.name) === normal(row.name));
      if (d.action === "create") {
        athleteId = created.get(`${c.club_id}:${normal(row.name)}:${row.gender}`);
        if (!athleteId && exact.length)
          throw new Error(`${row.name}: a profile now exists. Recheck the match.`);
        if (!athleteId) {
          const slug =
            row.name
              .normalize("NFKD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") +
            "-" +
            c.id.slice(0, 8);
          const added = await tx<{
            id: number;
          }>`insert into athletes(slug,display_name,gender,club_id,source_club_name,profile_visibility,bio,county,country) values(${slug},${row.name},${row.gender || "U"},${c.club_id},${row.club},'public',${"Listed as representing " + row.club + " in sourced race results. This is a partial history; current membership is not independently confirmed."},'','') returning id`;
          athleteId = added[0].id;
          created.set(`${c.club_id}:${normal(row.name)}:${row.gender}`, athleteId);
          newProfiles++;
        }
      }
      const target = await tx<{
        id: number;
        gender: string;
        profile_visibility: string;
        name: string;
        clubId: number | null;
        managed: boolean;
      }>`select a.id,a.gender,a.display_name as name,a.club_id as "clubId",a.profile_visibility,exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed from athletes a where a.id=${athleteId} for update of a`;
      if (
        !target.length ||
        target[0].managed ||
        target[0].profile_visibility !== "public" ||
        (row.gender && target[0].gender !== row.gender)
      )
        throw new Error("Profile ownership, visibility or identity changed. Publication stopped.");
      if (
        d.action === "link" &&
        (!d.target ||
          !isDeepStrictEqual(d.target, {
            name: target[0].name,
            gender: target[0].gender,
            clubId: target[0].clubId,
          }))
      )
        throw new Error("Selected athlete details changed after review. Recheck the match.");
      const state = await collision(tx, row, athleteId!);
      if (state) {
        await tx`update club_scan_candidates set status=${state},issues=${JSON.stringify([state === "duplicate" ? "This race and time are already in the athlete history" : "Another result exists on this date; compare before attachment"])}::jsonb,updated_at=now() where id=${c.id}::uuid`;
        await audit(tx, c, actor, state, "Publication duplicate check", { status: state });
        if (state === "duplicate") duplicates++;
        else held++;
        continue;
      }
      const performance = {
        ...row.performance,
        labels: [
          ...row.performance.labels,
          "Checked " +
            row.checkedAt.slice(0, 10) +
            "; source history, excluded from canonical PB totals",
          "Identity evidence: " + d.reason,
          "Identity evidence URL: " + d.evidenceUrl,
        ],
      };
      await tx`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at) values(${athleteId},'Club scanner',${c.source_key},${row.url},now(),false,${[performance.year]}::integer[],${[performance.year]}::integer[],${JSON.stringify([performance])}::jsonb,now())`;
      await tx`update club_scan_candidates set status='published',athlete_id=${athleteId},published_at=now(),updated_at=now() where id=${c.id}::uuid`;
      await audit(tx, c, actor, "publish", d.reason, {
        athleteId,
        status: "published",
        sourceHash: row.sourceHash,
        checkedAt: row.checkedAt,
        performance,
      });
      published++;
    }
    return { published, newProfiles, duplicates, held };
  });
}
export async function recheck(ids: string[], actor: string, override?: Sql, fetcher = fetchSource) {
  if (!ids.length || ids.length > 10) throw new Error("Recheck 1–10 rows at a time");
  const sql = await db(override),
    rows =
      await sql<Candidate>`select * from club_scan_candidates where id=any(${ids}::uuid[]) and status<>'published'`,
    people = await athletes(sql),
    htmlCache = new Map<string, string>();
  for (const c of rows) {
    const url = c.data.url.split("#")[0];
    if (!htmlCache.has(url)) htmlCache.set(url, await fetcher(url));
    const scope = {
      clubId: c.club_id,
      aliases: [c.data.club],
      dateFrom: "1900-01-01",
      dateTo: new Date().toISOString().slice(0, 10),
      discover: false,
      urls: [],
    } as Scope;
    const row = extract(htmlCache.get(url)!, url, scope).rows.find((r) => r.key === c.source_key);
    const next = row ?? {
        ...c.data,
        sourceIssues: ["Source row no longer found; preserve the earlier evidence"],
      },
      check = assess(next, people, c.club_id);
    await sql.transaction(async (tx) => {
      const current = (
        await tx<Candidate>`select * from club_scan_candidates where id=${c.id}::uuid for update`
      )[0];
      if (current.status === "published") return;
      await tx`update club_scan_candidates set data=${JSON.stringify(next)}::jsonb,matches=${JSON.stringify(check.matches)}::jsonb,issues=${JSON.stringify(check.issues)}::jsonb,status=${check.status},decision=null,updated_at=now() where id=${c.id}::uuid`;
      await audit(
        tx,
        current,
        actor,
        "recheck",
        "Fetched source again; previous approval cleared",
        check,
      );
    });
  }
  return { checked: rows.length };
}
export async function reviewHistory(id: string, override?: Sql) {
  const sql = await db(override);
  return sql<{
    actor: string;
    action: string;
    reason: string;
    created_at: string;
  }>`select actor,action,reason,created_at::text from club_scan_reviews where candidate_id=${id}::uuid order by created_at desc`;
}
