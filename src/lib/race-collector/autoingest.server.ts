/**
 * Automatic fixture intake (owner instruction, 7 November 2026).
 *
 * The scheduled collector posts what it read from every approved source. Each row
 * then goes one of four ways:
 *   - clean and new                → published automatically
 *   - already in the fixture list  → recorded, nothing to do
 *   - possible duplicate           → staff decide (normal Keep / Publish review)
 *   - details missing              → automated research first; staff only if still missing
 *
 * Every published row still passes the normal collector duplicate check, the
 * collector publication guard and catalogue batch validation. Nothing is inferred:
 * research results must come from a primary page and pass the same checks.
 */
import { createHash, timingSafeEqual } from "node:crypto";
import { getSql, type Sql } from "../db.ts";
import { COLLECTOR_COUNTRIES, type Candidate, type Scope } from "./core.ts";
import { FIXTURE_UPLOAD_LIMIT, type FixtureUploadInput } from "./fixture-upload.ts";
import type { PartialFixture } from "./autoingest-enrich.server.ts";

export const AUTOMATION_ACTOR = "automation@athrecs.com";
export const INTAKE_FIXTURE_LIMIT = 500;
export const INTAKE_SKIPPED_LIMIT = 2000;
export const PROCESS_BATCH = 200;
export const PUBLISH_CHUNK = 50;

export type IntakeFlag = { severity: "error" | "warn" | "info"; check: string; detail: string };
export type IntakeFixture = {
  row: Record<string, string>;
  flags?: IntakeFlag[];
  sourceId?: string;
};
export type IntakeSkipped = {
  source: string;
  url: string;
  name: string;
  date: string;
  reason: string;
};
export type IntakeBody = { runKey: string; fixtures: IntakeFixture[]; skipped: IntakeSkipped[] };

type QueueRow = {
  id: number;
  kind: "fixture" | "skipped";
  source_id: string;
  payload: Record<string, string>;
  check_flags: IntakeFlag[];
  status: string;
  reasons: string[];
  enrich_attempts: number;
};

const HEADERS = [
  "name",
  "country",
  "city",
  "region",
  "date",
  "distance",
  "unit",
  "surface",
  "startTime",
  "sourceUrl",
  "entryUrl",
  "sourceKind",
  "evidence",
  "checkedAt",
  "entryStatus",
  "notes",
] as const;

export function londonDate(at = new Date()): string {
  return at.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function authorizedIntake(request: Request): boolean {
  const expected = process.env.FIXTURE_AUTOINGEST_TOKEN?.trim();
  const actual = request.headers.get("authorization");
  if (!expected || expected.length < 24 || !actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(`Bearer ${expected}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

const text = (v: unknown, max = 3000) =>
  typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) : "";

/** Rejects anything that is not the collector's own output shape. */
export function validateIntake(input: unknown): IntakeBody {
  if (!input || typeof input !== "object") throw new Error("Body must be a JSON object.");
  const body = input as Record<string, unknown>;
  const runKey = text(body.runKey, 80);
  if (!/^[A-Za-z0-9:._-]{6,80}$/.test(runKey)) throw new Error("Invalid runKey.");
  const fixtures = Array.isArray(body.fixtures) ? body.fixtures : [];
  const skipped = Array.isArray(body.skipped) ? body.skipped : [];
  if (fixtures.length > INTAKE_FIXTURE_LIMIT || skipped.length > INTAKE_SKIPPED_LIMIT)
    throw new Error(
      `Send at most ${INTAKE_FIXTURE_LIMIT} fixtures and ${INTAKE_SKIPPED_LIMIT} skipped rows per request.`,
    );
  return {
    runKey,
    fixtures: fixtures.map((f, i) => {
      const item = (f ?? {}) as Record<string, unknown>;
      const raw = (item.row ?? {}) as Record<string, unknown>;
      if (!raw || typeof raw !== "object" || Array.isArray(raw))
        throw new Error(`Fixture ${i + 1} needs a row object.`);
      const row = Object.fromEntries(HEADERS.map((h) => [h, text(raw[h])]));
      if (!row.name || !row.sourceUrl)
        throw new Error(`Fixture ${i + 1} needs a name and sourceUrl.`);
      const flags = (Array.isArray(item.flags) ? item.flags : []).slice(0, 20).map((x) => {
        const flag = (x ?? {}) as Record<string, unknown>;
        const severity = ["error", "warn", "info"].includes(String(flag.severity))
          ? (flag.severity as IntakeFlag["severity"])
          : "warn";
        return { severity, check: text(flag.check, 80), detail: text(flag.detail, 400) };
      });
      return { row, flags, sourceId: text(item.sourceId, 120) };
    }),
    skipped: skipped.map((s) => {
      const item = (s ?? {}) as Record<string, unknown>;
      return {
        source: text(item.source, 120),
        url: text(item.url, 1000),
        name: text(item.name, 300),
        date: text(item.date, 10),
        reason: text(item.reason, 300),
      };
    }),
  };
}

export function rowHash(kind: "fixture" | "skipped", payload: Record<string, string>) {
  const basis =
    kind === "fixture"
      ? [
          payload.name,
          payload.date,
          payload.distance,
          payload.unit,
          payload.sourceUrl,
          payload.startTime,
        ]
      : [payload.url, payload.name, payload.date];
  return createHash("sha256")
    .update(`${kind}|${basis.map((x) => (x ?? "").toLowerCase().trim()).join("|")}`)
    .digest("hex");
}

/** A skipped page is worth researching only if it names a race. */
export function worthResearching(s: IntakeSkipped, today: string) {
  if (!s.name || s.name.length < 4 || !/^https:\/\//i.test(s.url)) return false;
  if (s.date && s.date < today) return false;
  return !/\b(?:junior\s+)?parkrun\b|virtual/i.test(s.name);
}

/** Store the collector's output. Rows seen before are ignored, so daily runs only add news. */
export async function receiveIntake(sql: Sql, body: IntakeBody, today = londonDate()) {
  let added = 0;
  let ignored = 0;
  const items: {
    kind: "fixture" | "skipped";
    source: string;
    payload: Record<string, string>;
    flags: IntakeFlag[];
    status: string;
  }[] = [
    ...body.fixtures.map((f) => ({
      kind: "fixture" as const,
      source: f.sourceId ?? "",
      payload: f.row,
      flags: f.flags ?? [],
      status: "queued",
    })),
    ...body.skipped
      .filter((s) => worthResearching(s, today))
      .map((s) => ({
        kind: "skipped" as const,
        source: s.source,
        payload: { name: s.name, date: s.date, url: s.url, reason: s.reason },
        flags: [],
        status: "enrich",
      })),
  ];
  ignored += body.skipped.length - items.filter((i) => i.kind === "skipped").length;
  for (const item of items) {
    const rows =
      await sql`insert into fixture_autoingest_rows(run_key,row_hash,kind,source_id,payload,check_flags,status)
      values(${body.runKey},${rowHash(item.kind, item.payload)},${item.kind},${item.source},
        ${JSON.stringify(item.payload)}::jsonb,${JSON.stringify(item.flags)}::jsonb,${item.status})
      on conflict(row_hash) do nothing returning id`;
    if (rows.length) added++;
    else ignored++;
  }
  return { added, ignored };
}

/** The detail-missing reasons research might fix, as opposed to out-of-scope rows. */
export function classifyInvalid(reason: string): "enrich" | "rejected" {
  if (
    /parkrun|Only standalone running|outside the selected scope|Discovery calendars|Exact date outside this window/i.test(
      reason,
    )
  )
    return "rejected";
  return "enrich";
}

export function missingFromHeld(reason: string) {
  return /Distance outside scope|venue unresolved|evidence missing|Invalid start time|Invalid entry|region is outside/i.test(
    reason,
  );
}

export function automaticScope(today: string): Scope {
  return {
    countries: COLLECTOR_COUNTRIES.map((c) => c.code),
    dateFrom: today,
    dateTo: addDays(today, 1095),
    min: 0,
    max: 500,
    unit: "mi",
    passes: 1,
    regional: false,
  };
}

function uploadInput(rows: Record<string, string>[], today: string): FixtureUploadInput {
  return {
    content: JSON.stringify(rows),
    format: "json",
    label: `Automatic collection ${today}`,
    scope: automaticScope(today),
  };
}

async function setStatus(
  sql: Sql,
  ids: number[],
  status: string,
  reasons: string[] = [],
  extra: { runId?: string; published?: boolean } = {},
) {
  if (!ids.length) return;
  await sql`update fixture_autoingest_rows set status=${status},reasons=${reasons}::text[],
    processed_at=now(),next_attempt_at=case when ${status} in ('enrich','queued') then now() else next_attempt_at end,collector_run_id=coalesce(${extra.runId ?? null}::uuid,collector_run_id),
    published_at=case when ${extra.published ?? false} then now() else published_at end
    where id=any(${ids}::bigint[])`;
}

const sameRow = (c: Candidate, r: Record<string, string>) =>
  c.name === r.name && c.date === r.date && c.sourceUrl === r.sourceUrl;

/**
 * Classify, save and publish queued fixture rows. Returns counts for the run log.
 * Publication uses the same stage → validate → publish path staff use, under the
 * automation identity, so every guard still applies.
 */
export async function processFixtures(sql: Sql, today = londonDate(), limit = PROCESS_BATCH) {
  const { previewFixtureUpload, importFixtureUpload } = await import("./fixture-upload.server.ts");
  const claimed = await sql<QueueRow>`update fixture_autoingest_rows set attempts=attempts+1,
      next_attempt_at=now()+interval '20 minutes'
    where id in (select id from fixture_autoingest_rows
      where kind='fixture' and status in ('queued','failed') and next_attempt_at<=now() and attempts<5
      order by id limit ${Math.min(limit, FIXTURE_UPLOAD_LIMIT)} for update skip locked)
    returning id,kind,source_id,payload,check_flags,status,reasons,enrich_attempts`;
  const counts = {
    claimed: claimed.length,
    published: 0,
    alreadyListed: 0,
    duplicate: 0,
    enrich: 0,
    missing: 0,
    rejected: 0,
    failed: 0,
  };
  if (!claimed.length) return counts;
  try {
    const preview = await previewFixtureUpload(
      uploadInput(
        claimed.map((r) => r.payload),
        today,
      ),
      sql,
    );
    const keep: QueueRow[] = [];
    const publishable = new Set<number>();
    for (const [i, p] of preview.rows.entries()) {
      const q = claimed[i];
      const errors = q.check_flags.filter((f) => f.severity === "error");
      if (p.status === "invalid") {
        const route = classifyInvalid(p.reason);
        await setStatus(sql, [q.id], route, p.reason.split("; "));
        counts[route === "enrich" ? "enrich" : "rejected"]++;
      } else if (p.status === "repeat" || p.status === "duplicate") {
        await setStatus(sql, [q.id], "already_listed", [p.reason]);
        counts.alreadyListed++;
      } else if (p.status === "held" && missingFromHeld(p.reason)) {
        await setStatus(sql, [q.id], "enrich", p.reason.split("; "));
        counts.enrich++;
      } else if (p.status === "review" && errors.length && q.enrich_attempts === 0) {
        // The source contradicts itself; research may settle it before staff see it.
        await setStatus(
          sql,
          [q.id],
          "enrich",
          errors.map((e) => `${e.check}: ${e.detail}`),
        );
        counts.enrich++;
      } else {
        keep.push(q);
        if (p.status === "review" && !errors.length) publishable.add(q.id);
      }
    }
    if (!keep.length) return counts;

    const input = uploadInput(
      keep.map((r) => r.payload),
      today,
    );
    const again = await previewFixtureUpload(input, sql);
    const saved = await importFixtureUpload(
      { ...input, previewHash: again.hash },
      AUTOMATION_ACTOR,
      sql,
    );
    const candidates = await sql<{
      id: string;
      candidate: Candidate;
      status: string;
      reason: string;
      event_slug: string;
    }>`
      select id,candidate,status,reason,event_slug from race_collector_candidates where run_id=${saved.id}::uuid`;
    const byRow = new Map<number, (typeof candidates)[number]>();
    for (const q of keep) {
      const match = candidates.find((c) => sameRow(c.candidate, q.payload));
      if (match) byRow.set(q.id, match);
    }
    for (const [rowId, c] of byRow)
      await sql`update fixture_autoingest_rows set candidate_id=${c.id}::uuid where id=${rowId}`;
    // Anything the saved check holds is a decision for staff, not something to guess.
    for (const q of keep) {
      const c = byRow.get(q.id);
      if (!c || c.status === "review") continue;
      if (c.status === "duplicate") {
        await setStatus(sql, [q.id], "already_listed", [c.reason], { runId: saved.id });
        counts.alreadyListed++;
      } else {
        await setStatus(sql, [q.id], "duplicate", [c.reason], { runId: saved.id });
        counts.duplicate++;
      }
      publishable.delete(q.id);
    }
    const flaggedForStaff = keep.filter(
      (q) => byRow.get(q.id)?.status === "review" && !publishable.has(q.id),
    );
    for (const q of flaggedForStaff) {
      await setStatus(
        sql,
        [q.id],
        "missing",
        q.check_flags.filter((f) => f.severity === "error").map((e) => `${e.check}: ${e.detail}`),
        { runId: saved.id },
      );
      counts.missing++;
    }

    const ready = keep.filter((q) => publishable.has(q.id) && byRow.has(q.id));
    const record = async (chunk: QueueRow[], result: Awaited<ReturnType<typeof publishChunk>>) => {
      for (const q of chunk) {
        const c = byRow.get(q.id)!;
        const key = `${c.event_slug}|${c.candidate.date}|${c.candidate.distanceLabel}`;
        const held = result.holds.find((h) => h.startsWith(`${key}:`));
        if (result.error) {
          await setStatus(
            sql,
            [q.id],
            "missing",
            [`Automatic publication stopped: ${result.error}`],
            { runId: saved.id },
          );
          counts.missing++;
        } else if (held) {
          await setStatus(sql, [q.id], "missing", [held], { runId: saved.id });
          counts.missing++;
        } else {
          await setStatus(sql, [q.id], "published", [], { runId: saved.id, published: true });
          await sql`update fixture_autoingest_rows set batch_id=${result.batchId} where id=${q.id}`;
          counts.published++;
        }
      }
    };
    for (let n = 0; n < ready.length; n += PUBLISH_CHUNK) {
      const chunk = ready.slice(n, n + PUBLISH_CHUNK);
      const result = await publishChunk(
        sql,
        saved.id,
        chunk.map((q) => byRow.get(q.id)!.id),
      );
      if (!result.error || chunk.length === 1) await record(chunk, result);
      // One bad row rolls back the whole batch; publish the rest one at a time.
      else
        for (const q of chunk)
          await record([q], await publishChunk(sql, saved.id, [byRow.get(q.id)!.id]));
    }
    return counts;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`update fixture_autoingest_rows set status='failed',reasons=${[message.slice(0, 500)]}::text[]
      where id=any(${claimed.map((r) => r.id)}::bigint[]) and status='queued'`;
    counts.failed = claimed.length;
    return counts;
  }
}

/** Same atomic path as staff "Publish selected": stage, validate and publish or roll back together. */
async function publishChunk(sql: Sql, runId: string, candidateIds: string[]) {
  const { actOnFindings } = await import("./bulk-actions.server.ts");
  try {
    const result = await actOnFindings(
      { runId, ids: candidateIds, action: "publish", confirmed: true, sourcesReviewed: true },
      AUTOMATION_ACTOR,
      sql,
    );
    const [batch] = result.batchId
      ? await sql<{ publish_summary: { distanceHolds?: string[] } | null }>`
          select publish_summary from catalogue_import_batches where id=${result.batchId}`
      : [];
    return {
      batchId: result.batchId ?? null,
      error: "",
      holds: batch?.publish_summary?.distanceHolds ?? [],
    };
  } catch (error) {
    return {
      batchId: null,
      error: error instanceof Error ? error.message : String(error),
      holds: [] as string[],
    };
  }
}

function partialFrom(q: QueueRow): PartialFixture {
  const p = q.payload;
  if (q.kind === "skipped")
    return {
      name: p.name,
      date: p.date,
      url: p.url,
      missing: [p.reason || "distance, town or date"],
    };
  return {
    name: p.name,
    date: p.date,
    url: p.sourceUrl,
    city: p.city,
    country: p.country,
    distance: [p.distance, p.unit].filter(Boolean).join(" "),
    missing: q.reasons,
  };
}

export function candidateRow(c: Candidate, today: string, via: string): Record<string, string> {
  return {
    name: c.name,
    country: c.country || c.countryCode,
    city: c.city,
    region: c.region,
    date: c.date,
    distance: String(c.distance),
    unit: c.unit,
    surface: c.surface,
    startTime: c.startTime,
    sourceUrl: c.sourceUrl,
    entryUrl: c.entryUrl,
    sourceKind: c.sourceKind,
    evidence: `${c.evidence} (Found by automated research from ${via}.)`.slice(0, 3000),
    checkedAt: today,
    entryStatus: c.entryStatus,
    notes: c.notes,
  };
}

/** Research rows with missing details; found details go back through the normal checks. */
export async function enrichRows(
  sql: Sql,
  today = londonDate(),
  opts: {
    limit?: number;
    dailyLimit?: number;
    research?: (
      p: PartialFixture,
    ) => Promise<{ candidates: Candidate[]; gaps: string[]; sources: string[] }>;
  } = {},
) {
  const dailyLimit = opts.dailyLimit ?? Number(process.env.FIXTURE_ENRICH_DAILY_LIMIT || 300);
  const [{ used }] = await sql<{
    used: number;
  }>`select count(*)::int used from fixture_autoingest_rows
    where enrichment is not null and (enrichment->>'at')::date=${today}::date`;
  const room = Math.max(0, Math.min(opts.limit ?? 4, dailyLimit - used));
  const counts = { researched: 0, found: 0, stillMissing: 0, deferred: 0 };
  if (!room) return counts;
  const research = opts.research ?? (await import("./autoingest-enrich.server.ts")).enrichFixture;
  const rows =
    await sql<QueueRow>`update fixture_autoingest_rows set enrich_attempts=enrich_attempts+1,
      next_attempt_at=now()+interval '30 minutes'
    where id in (select id from fixture_autoingest_rows where status='enrich' and next_attempt_at<=now()
      order by (payload->>'date') nulls last, id limit ${room} for update skip locked)
    returning id,kind,source_id,payload,check_flags,status,reasons,enrich_attempts`;
  await Promise.all(
    rows.map(async (q) => {
      const partial = partialFrom(q);
      try {
        const outcome = await research(partial);
        counts.researched++;
        const note = {
          at: today,
          sources: outcome.sources.slice(0, 10),
          gaps: outcome.gaps.slice(0, 10),
          found: outcome.candidates.length,
        };
        if (!outcome.candidates.length) {
          await sql`update fixture_autoingest_rows set status='missing',enrichment=${JSON.stringify(note)}::jsonb,
            reasons=${[...partial.missing, ...outcome.gaps.slice(0, 3)].slice(0, 6)}::text[],processed_at=now() where id=${q.id}`;
          counts.stillMissing++;
          return;
        }
        for (const c of outcome.candidates) {
          const payload = candidateRow(c, today, partial.url);
          await sql`insert into fixture_autoingest_rows(run_key,row_hash,kind,source_id,payload,status,enrich_attempts)
            values(${`research:${q.id}`},${rowHash("fixture", payload)},'fixture',${q.source_id},${JSON.stringify(payload)}::jsonb,'queued',1)
            on conflict(row_hash) do nothing`;
        }
        await sql`update fixture_autoingest_rows set status='already_listed',enrichment=${JSON.stringify(note)}::jsonb,
          reasons=${[`Research found ${outcome.candidates.length} confirmed distance(s); they were checked as new rows`]}::text[],processed_at=now() where id=${q.id}`;
        counts.found++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (q.enrich_attempts >= 3) {
          await sql`update fixture_autoingest_rows set status='missing',
            reasons=${[...partial.missing, `Research could not be completed: ${message.slice(0, 200)}`]}::text[],processed_at=now() where id=${q.id}`;
          counts.stillMissing++;
        } else counts.deferred++;
      }
    }),
  );
  return counts;
}

/** Races whose date has passed join the results list (results usually follow within a week). */
export async function queuePassedRaces(sql: Sql, today = londonDate()) {
  const rows = await sql`insert into fixture_results_queue(edition_id,event_date,next_check_at)
    select e.id,e.event_date,now() from editions e
    where e.event_date < ${today}::date and e.event_date >= ${addDays(today, -14)}::date
      and coalesce(e.status,'') <> 'Cancelled'
    on conflict(edition_id) do nothing returning edition_id`;
  return rows.length;
}

export async function runAutoingestWorker(sqlOverride?: Sql, deadlineMs = 300_000) {
  const sql = sqlOverride ?? (await getSql());
  const started = Date.now();
  const today = londonDate();
  const totals = {
    fixtures: [] as Awaited<ReturnType<typeof processFixtures>>[],
    enrichment: null as Awaited<ReturnType<typeof enrichRows>> | null,
    queuedForResults: 0,
  };
  const { enrichmentReady } = await import("./autoingest-enrich.server.ts");
  if (enrichmentReady()) totals.enrichment = await enrichRows(sql, today);
  while (Date.now() - started < deadlineMs) {
    const result = await processFixtures(sql, today);
    totals.fixtures.push(result);
    if (result.claimed < PROCESS_BATCH) break;
  }
  totals.queuedForResults = await queuePassedRaces(sql, today);
  return totals;
}

export type IntakeDashboard = {
  today: string;
  counts: Record<string, number>;
  publishedToday: number;
  forStaff: {
    id: number;
    status: "duplicate" | "missing";
    name: string;
    date: string;
    distance: string;
    city: string;
    sourceUrl: string;
    reasons: string[];
    runId: string | null;
    receivedAt: string;
  }[];
};

/** Staff view: what is waiting for a person, newest races first. */
export async function intakeDashboard(sqlOverride?: Sql): Promise<IntakeDashboard> {
  const sql = sqlOverride ?? (await getSql());
  const today = londonDate();
  const counts = await sql<{ status: string; n: number }>`
    select status,count(*)::int n from fixture_autoingest_rows group by status`;
  const [{ n: publishedToday }] = await sql<{
    n: number;
  }>`select count(*)::int n from fixture_autoingest_rows
    where status='published' and (published_at at time zone 'Europe/London')::date=${today}::date`;
  const rows = await sql<{
    id: number;
    status: "duplicate" | "missing";
    payload: Record<string, string>;
    reasons: string[];
    collector_run_id: string | null;
    received_at: string;
  }>`select r.id,r.status,r.payload,r.reasons,r.collector_run_id,r.received_at::text
    from fixture_autoingest_rows r left join race_collector_candidates c on c.id=r.candidate_id
    where r.resolved_at is null and (r.status='missing' or (r.status='duplicate'
      and (c.id is null or (c.dismissed_at is null and c.kept_at is null and c.status<>'staged'))))
    order by coalesce(nullif(r.payload->>'date',''),'9999-12-31'),r.id limit 300`;
  return {
    today,
    counts: Object.fromEntries(counts.map((c) => [c.status, c.n])),
    publishedToday,
    forStaff: rows.map((r) => ({
      id: r.id,
      status: r.status,
      name: r.payload.name ?? "",
      date: r.payload.date ?? "",
      distance: [r.payload.distance, r.payload.unit].filter(Boolean).join(" "),
      city: r.payload.city ?? "",
      sourceUrl: r.payload.sourceUrl || r.payload.url || "",
      reasons: r.reasons,
      runId: r.collector_run_id,
      receivedAt: r.received_at,
    })),
  };
}

/** Staff marks a row handled (added by hand, dismissed, or not a real race). */
export async function resolveIntakeRow(id: number, email: string, sqlOverride?: Sql) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid row.");
  const sql = sqlOverride ?? (await getSql());
  const rows = await sql`update fixture_autoingest_rows set resolved_at=now(),resolved_by=${email}
    where id=${id} and resolved_at is null and status in ('duplicate','missing') returning id`;
  return { changed: rows.length };
}

/** Staff sends a row back for another automatic attempt after fixing the source. */
export async function retryIntakeRow(id: number, sqlOverride?: Sql) {
  if (!Number.isInteger(id) || id <= 0) throw new Error("Invalid row.");
  const sql = sqlOverride ?? (await getSql());
  const rows = await sql`update fixture_autoingest_rows set
      status=case when kind='skipped' then 'enrich' else 'queued' end,
      attempts=0,enrich_attempts=0,next_attempt_at=now(),reasons='{}'
    where id=${id} and resolved_at is null and status in ('duplicate','missing') returning id`;
  return { changed: rows.length };
}
