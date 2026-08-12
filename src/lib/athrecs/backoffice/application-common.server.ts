import type { Sql } from "@/lib/db";
import { slugify } from "./verification";

export type SubmissionRecord = {
  id: string;
  submission_type: string;
  entity_type: string;
  entity_id: string | null;
  organisation_id: number | null;
  athlete_id: number | null;
  event_id: number | null;
  edition_id: number | null;
  competition_id: number | null;
  source_url: string | null;
  status: string;
  applied_at: string | null;
};

export type ApprovedItem = {
  id: string;
  row_number: number;
  target_id: string | null;
  normalized_data: unknown;
  status: string;
  applied_at: string | null;
};

export type ApplicationSummary = {
  submissionId: string;
  submissionType: string;
  status: "applied" | "partially_applied" | "already_applied";
  appliedItemCount: number;
  skippedItemCount: number;
  entityIds: string[];
};

export function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function asObject(value: unknown, label: string): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Fall through to a stable error below.
    }
  }
  throw new Error(`${label} is not a JSON object`);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export async function resolveSport(
  sql: Sql,
  rawSlug: string,
): Promise<{ id: number; slug: string; name: string }> {
  const requested = slugify(rawSlug);
  const rows = await sql<{ id: number; slug: string; name: string }>`
    select distinct s.id, s.slug, s.name
    from sports s
    left join sport_aliases sa on sa.sport_id = s.id
    where s.active = true
      and (s.slug = ${requested} or replace(lower(sa.alias), ' ', '-') = ${requested})
    limit 1
  `;
  if (!rows[0]) throw new Error(`Unknown sport taxonomy: ${rawSlug}`);
  return rows[0];
}

export async function resolveDiscipline(
  sql: Sql,
  sportId: number,
  rawSlug: string | null,
): Promise<number | null> {
  if (!rawSlug) return null;
  const requested = slugify(rawSlug);
  const rows = await sql<{ id: number }>`
    select id
    from disciplines
    where sport_id = ${sportId}
      and slug = ${requested}
      and active = true
    limit 1
  `;
  if (!rows[0]) {
    throw new Error(`Unknown discipline taxonomy: ${rawSlug}`);
  }
  return rows[0].id;
}
