import { createHash, randomUUID } from "node:crypto";
import { getSql, dbSource, type Sql } from "../db";
import { parseFixtureUpload, type FixtureUploadInput } from "./fixture-upload";
import {
  checkFinding,
  repeatedFinding,
  saveResult,
  snapshot,
  type CandidateRow,
} from "./service.server";
import { candidateProblems } from "./core";

export async function previewFixtureUpload(input: FixtureUploadInput, sqlOverride?: Sql) {
  const parsed = parseFixtureUpload(input);
  const hash = createHash("sha256")
    .update(JSON.stringify({ scope: parsed.scope, rows: parsed.rows }))
    .digest("hex");
  const sql = sqlOverride ?? (await getSql());
  const snap = await snapshot(sql, [parsed.scope.dateFrom, parsed.scope.dateTo]);
  const prior: CandidateRow[] = [];
  const rows = parsed.rows.map(({ row, candidate: c, errors }) => {
    const job = {
      country: c.countryCode,
      dateFrom: parsed.scope.dateFrom,
      dateTo: parsed.scope.dateTo,
      pass: 1 as const,
    };
    const issues = [...errors, ...candidateProblems(c, job, parsed.scope)];
    if (!parsed.scope.countries.includes(c.countryCode))
      issues.push("Start country is outside the selected scope");
    if (/\b(?:junior\s+)?parkrun\b/i.test(c.name))
      issues.push("Use the separate verified parkrun workflow for recurring parkrun fixtures");
    const decision = checkFinding(c, job, parsed.scope, snap, prior);
    const repeated = !issues.length && repeatedFinding(c, decision.eventSlug, prior);
    const status: "invalid" | "repeat" | "review" | "duplicate" | "held" = issues.length
      ? "invalid"
      : repeated
        ? "repeat"
        : decision.status;
    const reason = issues.length
      ? [...new Set(issues)].join("; ")
      : repeated
        ? "Same event, date and equivalent distance already appear in this file"
        : decision.reason;
    if (!issues.length && !repeated)
      prior.push({
        id: String(row),
        candidate: c,
        status,
        reason,
        event_slug: decision.eventSlug,
        event_id: decision.eventId,
        batch_id: null,
      });
    return {
      row,
      name: c.name,
      date: c.date,
      distance: c.distanceLabel,
      startTime: c.startTime,
      sourceUrl: c.sourceUrl,
      status,
      reason,
    };
  });
  const counts = { rows: rows.length, ready: 0, duplicate: 0, held: 0, repeat: 0, invalid: 0 };
  for (const row of rows) counts[row.status === "review" ? "ready" : row.status]++;
  return { hash, label: parsed.label, scope: parsed.scope, rows, counts };
}

/** Save proposals atomically, independently of research credentials or a paused scan. */
export async function importFixtureUpload(
  input: FixtureUploadInput & { previewHash: string },
  email: string,
  sqlOverride?: Sql,
) {
  if (!sqlOverride && dbSource !== "neon")
    throw new Error("Connect persistent storage before saving an import.");
  const sql = sqlOverride ?? (await getSql());
  return sql.transaction(async (tx) => {
    const preview = await previewFixtureUpload(input, tx);
    if (input.previewHash !== preview.hash)
      throw new Error("The file or settings changed. Preview the import again.");
    if (preview.counts.invalid)
      throw new Error(
        `Correct ${preview.counts.invalid} invalid rows, then preview again. Nothing was saved.`,
      );
    const parsed = parseFixtureUpload(input);
    const h = preview.hash;
    const id = `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
    const chunks = parsed.scope.countries.flatMap((country) => {
      const candidates = parsed.rows
        .filter((r) => r.candidate.countryCode === country)
        .map((r) => r.candidate);
      return Array.from({ length: Math.ceil(candidates.length / 50) }, (_, n) => ({
        country,
        candidates: candidates.slice(n * 50, n * 50 + 50),
      }));
    });
    const scope = {
      ...parsed.scope,
      method: "fixture-upload" as const,
      label: parsed.label,
      importHash: preview.hash,
    };
    const inserted =
      await tx`insert into race_collector_runs(id,scope,status,requested_by,total_jobs) values(${id}::uuid,${JSON.stringify(scope)}::jsonb,'complete',${email},${chunks.length}) on conflict(id) do nothing returning id`;
    if (!inserted.length) {
      const [existing] = await tx<{
        scope: { importHash?: string };
      }>`select scope from race_collector_runs where id=${id}::uuid`;
      if (existing?.scope.importHash !== preview.hash)
        throw new Error("Import identity conflict; no changes were made.");
      return { id, reused: true, counts: preview.counts };
    }
    for (const [ordinal, chunk] of chunks.entries()) {
      const jobId = randomUUID(),
        token = randomUUID();
      const window = {
        country: chunk.country,
        dateFrom: scope.dateFrom,
        dateTo: scope.dateTo,
        pass: 1 as const,
      };
      await tx`insert into race_collector_jobs(id,run_id,ordinal,"window",status,attempts,lease_token) values(${jobId}::uuid,${id}::uuid,${ordinal},${JSON.stringify(window)}::jsonb,'running',0,${token}::uuid)`;
      await saveResult(
        tx,
        { id: jobId, run_id: id, window, lease_token: token, attempts: 0 },
        {
          id,
          scope,
          status: "complete",
          total_jobs: chunks.length,
          created_at: new Date().toISOString(),
          error: null,
        },
        {
          candidates: chunk.candidates,
          sources: [...new Set(chunk.candidates.map((c) => c.sourceUrl))],
          gaps: [
            "Staff-uploaded fixture proposals. Primary programmes must be reviewed before publication. No automated source crawl was performed.",
          ],
          capped: false,
          usage: "none: fixture upload",
          responseId: preview.hash,
        },
      );
    }
    return { id, reused: false, counts: preview.counts };
  });
}
