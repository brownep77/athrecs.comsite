import type { Sql } from "../db";

export type CapturedRace = {
  id: string;
  provider: string;
  source_url: string;
  name: string;
  date: string;
  location: string;
  row_count: number;
  captured_at: string;
};
export type CapturedRow = {
  ordinal: number;
  row: {
    name?: string;
    bib?: string;
    club?: string;
    gender?: string;
    category?: string;
    distanceLabel?: string;
    date?: string;
    status?: string;
    tableKey?: string;
    sourceRow?: string;
    original?: Record<string, string>;
  };
};
// Count retained rows without rewriting a legacy source's declared summary.
const storedRows = `CASE WHEN jsonb_typeof(c.payload->'rows')='array'
  THEN c.payload->'rows' ELSE '[]'::jsonb END`;
// Choose the latest observation before applying eligibility. A newer held or
// revoked capture must never make an older approved version current again.
// Original HTML stays server-side; only one bounded row page leaves.
const latest = `WITH observations AS (
  SELECT DISTINCT ON (provider,source_key) id
  FROM result_archive_source_captures
  ORDER BY provider,source_key,captured_at DESC,id DESC
), latest AS (
  SELECT c.id,c.provider,c.source_key,
    c.source_url,c.payload,jsonb_array_length(${storedRows}) AS row_count,c.captured_at
  FROM observations o
  JOIN result_archive_source_captures c ON c.id=o.id
  JOIN result_archive_capture_approvals a ON a.id=c.approval_id
  WHERE c.payload->>'publication'='staff_only' AND c.source_check IN ('compared','empty')
    AND a.scope='staff_only' AND a.revoked_at IS NULL
)`;
const columns = `id::text,provider,source_url,payload->'index'->>'name' AS name,
  payload->'index'->>'date' AS date,payload->'index'->>'location' AS location,
  row_count,captured_at::text`;

export async function listCapturedRaces(sql: Sql, input: { q: string; offset: number }) {
  const exists = await sql<{
    ready: boolean;
  }>`SELECT to_regclass('public.result_archive_source_captures') IS NOT NULL AS ready`;
  if (!exists[0]?.ready)
    return { available: false, rows: [], total: 0, races: 0, results: 0, next: null };
  const needle = input.q.toLowerCase();
  const [totals, rows] = await Promise.all([
    sql.query<{ races: number; results: number; total: number }>(
      `${latest}
      SELECT count(*)::int AS races,coalesce(sum(row_count),0)::int AS results,
      count(*) FILTER(WHERE $1='' OR strpos(lower(coalesce(payload->'index'->>'name','')||' '||provider||' '||coalesce(payload->'index'->>'date','')),$1)>0)::int AS total FROM latest`,
      [needle],
    ),
    sql.query<CapturedRace>(
      `${latest} SELECT ${columns} FROM latest
      WHERE $1='' OR strpos(lower(coalesce(payload->'index'->>'name','')||' '||provider||' '||coalesce(payload->'index'->>'date','')),$1)>0
      ORDER BY payload->'index'->>'date' DESC,id DESC LIMIT 51 OFFSET $2`,
      [needle, input.offset],
    ),
  ]);
  return {
    available: true,
    ...totals[0],
    rows: rows.slice(0, 50),
    next: rows.length > 50 ? input.offset + 50 : null,
  };
}

export async function capturedRaceRows(sql: Sql, input: { id: string; q: string; offset: number }) {
  const [race] = await sql.query<CapturedRace>(
    `${latest} SELECT ${columns} FROM latest WHERE id=$1::bigint`,
    [input.id],
  );
  if (!race) throw new Error("This source capture is unavailable or has been superseded.");
  const [result] = await sql.query<{ rows: CapturedRow[]; total: number }>(
    `${latest}, matches AS (
    SELECT r.ordinality::int AS ordinal,r.value AS row FROM latest c,
      LATERAL jsonb_array_elements(${storedRows}) WITH ORDINALITY r
    WHERE c.id=$1::bigint AND ($2='' OR strpos(lower(coalesce(r.value->>'name','')||' '||coalesce(r.value->>'bib','')||' '||coalesce(r.value->>'club','')||' '||coalesce(r.value->>'distanceLabel','')),$2)>0)
  ) SELECT (SELECT count(*)::int FROM matches) AS total,
    coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY ordinal) FROM (SELECT * FROM matches ORDER BY ordinal LIMIT 100 OFFSET $3) page),'[]'::jsonb) AS rows`,
    [input.id, input.q.toLowerCase(), input.offset],
  );
  return { race, ...result, next: input.offset + 100 < result.total ? input.offset + 100 : null };
}
