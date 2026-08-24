import { createHash, randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { getSql, type Sql } from "@/lib/db";
import {
  RUNNABLE_SOURCE_RIGHTS_STATUSES,
  buildBulkSourceJobManifest,
  parseFixtureSourceRegistry,
  type FixtureSource,
} from "./source-registry";
import { getFixtureSourceRegistry } from "./source-registry.server";
import { stageVerificationCandidate, type VerificationCandidateInput } from "./verification-workflow.server";

const MAX_SOURCE_CSV_BYTES = 2_000_000;
const MAX_CRAWL_PAGE_BYTES = 2_000_000;
const MAX_CRAWL_BATCH = 5;
const CRAWL_TIMEOUT_MS = 20_000;

type ManagedSourceRow = {
  source_id: string;
  source_name: string;
  start_url: string;
  canonical_start_url: string;
  source_type: "directory" | "results" | "sitemap";
  requested_enabled: boolean;
  enabled: boolean;
  source_section: string;
  region_scope: string;
  country_focus: string;
  coverage_scope: string;
  coverage_start_year: number | null;
  coverage_end_year: number | null;
  surface_scope: string;
  timing_scope: string;
  chip_timed_status: string;
  permission_url: string | null;
  allowed_domains: string;
  race_link_include_regex: string | null;
  race_link_exclude_regex: string | null;
  profile: string;
  follow_history_links: boolean;
  max_pages: number;
  rate_limit_seconds: number;
  rights_status: string;
  notes: string;
  review_status: "pending" | "approved" | "manual_only" | "rejected";
  duplicate_status: "new" | "update" | "exact_duplicate" | "possible_duplicate";
  duplicate_note: string | null;
  imported_by: string;
  imported_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  updated_at: string;
};

type SourcePreviewStatus =
  | "ready"
  | "update"
  | "exact_duplicate"
  | "possible_duplicate"
  | "invalid";

export type ManagedSourcePreviewRow = {
  rowNumber: number;
  source: FixtureSource;
  canonicalStartUrl: string;
  status: SourcePreviewStatus;
  issues: string[];
  duplicateOf: string | null;
};

type CrawlRunRow = {
  id: string;
  source_id: string;
  status: string;
  requested_by: string;
  requested_at: string;
  started_at: string | null;
  finished_at: string | null;
  pages_fetched: number;
  candidates_found: number;
  error_message: string | null;
};

type CrawlPageRow = {
  run_id: string;
  source_id: string;
  canonical_url: string;
  page_url: string;
  depth: number;
  start_url: string;
  allowed_domains: string;
  race_link_include_regex: string | null;
  race_link_exclude_regex: string | null;
  max_pages: number;
  rate_limit_seconds: number;
  source_name: string;
  country_focus: string;
  surface_scope: string;
};

type ExtractedEntry = NonNullable<VerificationCandidateInput["entryOptions"]>[number];

type ExtractedEvent = {
  eventName: string;
  eventDate: string;
  distance: string;
  distanceKm: number;
  sport: string;
  country: string;
  county: string;
  city: string;
  area: string;
  venue: string;
  surface: string;
  organiser: string;
  officialWebsiteCandidate: string | null;
  startTime: string | null;
  entryStatus: string;
  entryOptions: ExtractedEntry[];
};

export function canonicalSourceUrl(value: string): string {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Source URLs must use HTTP or HTTPS");
  }
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  parsed.hash = "";
  if ((parsed.protocol === "https:" && parsed.port === "443") || (parsed.protocol === "http:" && parsed.port === "80")) {
    parsed.port = "";
  }
  for (const key of [...parsed.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(?:fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) {
      parsed.searchParams.delete(key);
    }
  }
  parsed.searchParams.sort();
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  return parsed.toString();
}

function hostname(value: string): string {
  return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
}

function privateIpv4(address: string): boolean {
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value))) return true;
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function privateIp(address: string): boolean {
  const normalized = address.toLowerCase();
  if (isIP(normalized) === 4) return privateIpv4(normalized);
  if (isIP(normalized) !== 6) return true;
  if (normalized === "::1" || normalized === "::") return true;
  if (/^(?:fc|fd)/.test(normalized) || /^fe[89ab]/.test(normalized)) return true;
  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? privateIpv4(mapped[1]) : false;
}

async function assertPublicRemoteUrl(value: string): Promise<void> {
  const parsed = new URL(value);
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    isIP(host) > 0
  ) {
    throw new Error("Private, local and IP-literal crawl targets are not allowed");
  }
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((row) => privateIp(row.address))) {
    throw new Error("Crawl target resolves to a private or reserved network address");
  }
}

function splitValues(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

function sourceFromManaged(row: ManagedSourceRow): FixtureSource {
  return {
    source_id: row.source_id,
    source_name: row.source_name,
    start_url: row.start_url,
    source_type: row.source_type,
    enabled: row.enabled,
    source_section: row.source_section,
    region_scope: row.region_scope,
    country_focus: row.country_focus,
    coverage_scope: row.coverage_scope,
    coverage_start_year: row.coverage_start_year == null ? "" : String(row.coverage_start_year),
    coverage_end_year: row.coverage_end_year == null ? "" : String(row.coverage_end_year),
    surface_scope: row.surface_scope,
    timing_scope: row.timing_scope,
    chip_timed_status: row.chip_timed_status,
    permission_url: row.permission_url ?? "",
    allowed_domains: row.allowed_domains,
    race_link_include_regex: row.race_link_include_regex ?? "",
    race_link_exclude_regex: row.race_link_exclude_regex ?? "",
    profile: row.profile,
    follow_history_links: row.follow_history_links,
    max_pages: row.max_pages,
    rate_limit_seconds: row.rate_limit_seconds,
    rights_status: row.rights_status,
    notes: row.notes,
  };
}

function validateSource(source: FixtureSource): string[] {
  const issues: string[] = [];
  let canonical = "";
  try {
    canonical = canonicalSourceUrl(source.start_url);
  } catch (error) {
    issues.push(error instanceof Error ? error.message : "Invalid start URL");
  }
  if (canonical) {
    const sourceHost = hostname(canonical);
    const allowed = splitValues(source.allowed_domains).map((domain) =>
      domain.toLowerCase().replace(/^www\./, ""),
    );
    if (!allowed.some((domain) => sourceHost === domain || sourceHost.endsWith(`.${domain}`))) {
      issues.push("allowed_domains does not include the start URL hostname");
    }
  }
  for (const [label, pattern] of [
    ["include", source.race_link_include_regex],
    ["exclude", source.race_link_exclude_regex],
  ] as const) {
    if (!pattern) continue;
    try {
      new RegExp(pattern, "i");
    } catch {
      issues.push(`Invalid ${label} regular expression`);
    }
  }
  if (!source.source_name.trim()) issues.push("Source name is required");
  if (!source.profile.trim()) issues.push("Extraction profile is required");
  if (!source.notes.trim()) issues.push("Review notes are required");
  if (!Number.isInteger(source.max_pages) || source.max_pages < 1) {
    issues.push("max_pages must be a positive whole number");
  }
  if (!Number.isFinite(source.rate_limit_seconds) || source.rate_limit_seconds <= 0) {
    issues.push("rate_limit_seconds must be greater than zero");
  }
  return issues;
}

async function managedRows(sql: Sql): Promise<ManagedSourceRow[]> {
  return sql<ManagedSourceRow>`
    select
      source_id,
      source_name,
      start_url,
      canonical_start_url,
      source_type,
      requested_enabled,
      enabled,
      source_section,
      region_scope,
      country_focus,
      coverage_scope,
      coverage_start_year,
      coverage_end_year,
      surface_scope,
      timing_scope,
      chip_timed_status,
      permission_url,
      allowed_domains,
      race_link_include_regex,
      race_link_exclude_regex,
      profile,
      follow_history_links,
      max_pages,
      rate_limit_seconds,
      rights_status,
      notes,
      review_status,
      duplicate_status,
      duplicate_note,
      imported_by,
      imported_at::text as imported_at,
      reviewed_by,
      reviewed_at::text as reviewed_at,
      review_note,
      updated_at::text as updated_at
    from managed_fixture_sources
    order by source_name, source_id
  `;
}

export async function previewManagedSourceCsv(csv: string) {
  if (!csv.trim()) throw new Error("The source CSV is empty");
  if (Buffer.byteLength(csv, "utf8") > MAX_SOURCE_CSV_BYTES) {
    throw new Error("The source CSV is larger than the 2 MB limit");
  }

  const parsed = parseFixtureSourceRegistry(csv);
  const sql = await getSql();
  const managed = await managedRows(sql);
  const staticSources = getFixtureSourceRegistry();

  const staticById = new Map(staticSources.map((source) => [source.source_id, source]));
  const managedById = new Map(managed.map((source) => [source.source_id, source]));
  const existingByCanonical = new Map<string, { id: string; kind: "static" | "managed" }>();
  for (const source of staticSources) {
    try {
      existingByCanonical.set(canonicalSourceUrl(source.start_url), {
        id: source.source_id,
        kind: "static",
      });
    } catch {
      // Existing controlled registry validation reports malformed rows separately.
    }
  }
  for (const source of managed) {
    existingByCanonical.set(source.canonical_start_url, {
      id: source.source_id,
      kind: "managed",
    });
  }

  const uploadCanonical = new Map<string, string>();
  const rows: ManagedSourcePreviewRow[] = parsed.map((source, index) => {
    const issues = validateSource(source);
    let canonicalStartUrl = "";
    try {
      canonicalStartUrl = canonicalSourceUrl(source.start_url);
    } catch {
      // Already represented in issues.
    }

    let status: SourcePreviewStatus = issues.length ? "invalid" : "ready";
    let duplicateOf: string | null = null;
    const staticMatch = staticById.get(source.source_id);
    const managedMatch = managedById.get(source.source_id);

    if (!issues.length && staticMatch) {
      status = "exact_duplicate";
      duplicateOf = staticMatch.source_id;
      issues.push("source_id already belongs to the controlled built-in registry");
    } else if (!issues.length && managedMatch) {
      status = "update";
      duplicateOf = managedMatch.source_id;
    } else if (!issues.length && canonicalStartUrl) {
      const existingUrl = existingByCanonical.get(canonicalStartUrl);
      if (existingUrl) {
        status = "exact_duplicate";
        duplicateOf = existingUrl.id;
        issues.push(`Canonical start URL already belongs to ${existingUrl.id}`);
      }
    }

    if (!issues.length && canonicalStartUrl) {
      const uploadedOwner = uploadCanonical.get(canonicalStartUrl);
      if (uploadedOwner && uploadedOwner !== source.source_id) {
        status = "exact_duplicate";
        duplicateOf = uploadedOwner;
        issues.push(`Another uploaded row uses the same canonical start URL (${uploadedOwner})`);
      } else {
        uploadCanonical.set(canonicalStartUrl, source.source_id);
      }
    }

    if (status === "ready") {
      const candidateDomains = new Set(
        splitValues(source.allowed_domains).map((domain) =>
          domain.toLowerCase().replace(/^www\./, ""),
        ),
      );
      const possible = [...staticSources.map((value) => ({
        id: value.source_id,
        name: value.source_name,
        domains: splitValues(value.allowed_domains),
      })), ...managed.map((value) => ({
        id: value.source_id,
        name: value.source_name,
        domains: splitValues(value.allowed_domains),
      }))].find((existing) => {
        if (existing.id === source.source_id) return false;
        const sameName =
          existing.name.trim().toLowerCase() === source.source_name.trim().toLowerCase();
        const overlap = existing.domains.some((domain) =>
          candidateDomains.has(domain.toLowerCase().replace(/^www\./, "")),
        );
        return sameName && overlap;
      });
      if (possible) {
        status = "possible_duplicate";
        duplicateOf = possible.id;
        issues.push(`Similar source name and domain overlap with ${possible.id}`);
      }
    }

    return {
      rowNumber: index + 2,
      source,
      canonicalStartUrl,
      status,
      issues,
      duplicateOf,
    };
  });

  return {
    counts: {
      total: rows.length,
      ready: rows.filter((row) => row.status === "ready").length,
      update: rows.filter((row) => row.status === "update").length,
      exactDuplicate: rows.filter((row) => row.status === "exact_duplicate").length,
      possibleDuplicate: rows.filter((row) => row.status === "possible_duplicate").length,
      invalid: rows.filter((row) => row.status === "invalid").length,
    },
    rows,
  };
}

async function audit(
  sql: Sql,
  entityType: "source" | "crawl" | "fixture_candidate" | "entry_option" | "result_link",
  entityId: string,
  action: string,
  actorEmail: string,
  note: string | null,
  before: unknown,
  after: unknown,
): Promise<void> {
  await sql.query(
    `insert into staff_verification_audit (
       entity_type, entity_id, action, actor_email, note, before_json, after_json
     ) values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)`,
    [
      entityType,
      entityId,
      action,
      actorEmail,
      note,
      before == null ? null : JSON.stringify(before),
      after == null ? null : JSON.stringify(after),
    ],
  );
}

export async function importManagedSourceCsv(csv: string, actorEmail: string) {
  const preview = await previewManagedSourceCsv(csv);
  const importable = preview.rows.filter((row) =>
    ["ready", "update", "possible_duplicate"].includes(row.status),
  );
  const sql = await getSql();
  let imported = 0;
  let updated = 0;

  await sql.transaction(async (tx) => {
    for (const row of importable) {
      const source = row.source;
      const beforeRows = await tx<ManagedSourceRow>`
        select * from managed_fixture_sources where source_id = ${source.source_id} limit 1
      `;
      const before = beforeRows[0] ?? null;
      const duplicateStatus =
        row.status === "update"
          ? "update"
          : row.status === "possible_duplicate"
            ? "possible_duplicate"
            : "new";
      await tx.query(
        `insert into managed_fixture_sources (
           source_id,
           source_name,
           start_url,
           canonical_start_url,
           source_type,
           requested_enabled,
           enabled,
           source_section,
           region_scope,
           country_focus,
           coverage_scope,
           coverage_start_year,
           coverage_end_year,
           surface_scope,
           timing_scope,
           chip_timed_status,
           permission_url,
           allowed_domains,
           race_link_include_regex,
           race_link_exclude_regex,
           profile,
           follow_history_links,
           max_pages,
           rate_limit_seconds,
           rights_status,
           notes,
           review_status,
           duplicate_status,
           duplicate_note,
           imported_by,
           imported_at,
           reviewed_by,
           reviewed_at,
           review_note,
           updated_at
         ) values (
           $1, $2, $3, $4, $5, $6, false, $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
           $21, $22, $23, $24, $25, 'pending', $26, $27, $28,
           now(), null, null, null, now()
         )
         on conflict (source_id) do update set
           source_name = excluded.source_name,
           start_url = excluded.start_url,
           canonical_start_url = excluded.canonical_start_url,
           source_type = excluded.source_type,
           requested_enabled = excluded.requested_enabled,
           enabled = false,
           source_section = excluded.source_section,
           region_scope = excluded.region_scope,
           country_focus = excluded.country_focus,
           coverage_scope = excluded.coverage_scope,
           coverage_start_year = excluded.coverage_start_year,
           coverage_end_year = excluded.coverage_end_year,
           surface_scope = excluded.surface_scope,
           timing_scope = excluded.timing_scope,
           chip_timed_status = excluded.chip_timed_status,
           permission_url = excluded.permission_url,
           allowed_domains = excluded.allowed_domains,
           race_link_include_regex = excluded.race_link_include_regex,
           race_link_exclude_regex = excluded.race_link_exclude_regex,
           profile = excluded.profile,
           follow_history_links = excluded.follow_history_links,
           max_pages = excluded.max_pages,
           rate_limit_seconds = excluded.rate_limit_seconds,
           rights_status = excluded.rights_status,
           notes = excluded.notes,
           review_status = 'pending',
           duplicate_status = excluded.duplicate_status,
           duplicate_note = excluded.duplicate_note,
           imported_by = excluded.imported_by,
           imported_at = now(),
           reviewed_by = null,
           reviewed_at = null,
           review_note = null,
           updated_at = now()`,
        [
          source.source_id,
          source.source_name,
          source.start_url,
          row.canonicalStartUrl,
          source.source_type,
          source.enabled,
          source.source_section,
          source.region_scope,
          source.country_focus,
          source.coverage_scope,
          source.coverage_start_year ? Number(source.coverage_start_year) : null,
          source.coverage_end_year ? Number(source.coverage_end_year) : null,
          source.surface_scope,
          source.timing_scope,
          source.chip_timed_status,
          source.permission_url || null,
          source.allowed_domains,
          source.race_link_include_regex || null,
          source.race_link_exclude_regex || null,
          source.profile,
          source.follow_history_links,
          source.max_pages,
          source.rate_limit_seconds,
          source.rights_status,
          source.notes,
          duplicateStatus,
          row.duplicateOf ? `Potential duplicate of ${row.duplicateOf}` : null,
          actorEmail,
        ],
      );
      const afterRows = await tx<ManagedSourceRow>`
        select * from managed_fixture_sources where source_id = ${source.source_id} limit 1
      `;
      await audit(
        tx,
        "source",
        source.source_id,
        before ? "reimported" : "imported",
        actorEmail,
        row.issues.join("; ") || null,
        before,
        afterRows[0] ?? null,
      );
      if (before) updated += 1;
      else imported += 1;
    }
  });

  return {
    preview,
    imported,
    updated,
    skipped: preview.counts.exactDuplicate + preview.counts.invalid,
  };
}

export async function reviewManagedSource(
  input: {
    sourceId: string;
    decision: "approved" | "manual_only" | "rejected";
    duplicateStatus?: "new" | "update";
    note: string;
  },
  actorEmail: string,
) {
  const sourceId = input.sourceId?.trim();
  const note = input.note?.trim();
  if (!sourceId) throw new Error("sourceId is required");
  if (!note) throw new Error("A source review note is required");

  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const rows = await tx<ManagedSourceRow>`
      select * from managed_fixture_sources where source_id = ${sourceId} for update
    `;
    const before = rows[0];
    if (!before) throw new Error("Managed source not found");

    const duplicateStatus = input.duplicateStatus ?? before.duplicate_status;
    if (input.decision === "approved") {
      if (!RUNNABLE_SOURCE_RIGHTS_STATUSES.has(before.rights_status)) {
        throw new Error(
          `This source cannot be enabled with rights status: ${before.rights_status}`,
        );
      }
      if (duplicateStatus === "possible_duplicate" || duplicateStatus === "exact_duplicate") {
        throw new Error("Resolve the source duplicate before approving it");
      }
    }

    const enabled = input.decision === "approved";
    await tx`
      update managed_fixture_sources
      set review_status = ${input.decision},
          enabled = ${enabled},
          duplicate_status = ${duplicateStatus},
          duplicate_note = ${note},
          reviewed_by = ${actorEmail},
          reviewed_at = now(),
          review_note = ${note},
          updated_at = now()
      where source_id = ${sourceId}
    `;
    const afterRows = await tx<ManagedSourceRow>`
      select * from managed_fixture_sources where source_id = ${sourceId} limit 1
    `;
    await audit(
      tx,
      "source",
      sourceId,
      `review:${input.decision}`,
      actorEmail,
      note,
      before,
      afterRows[0] ?? null,
    );
    return afterRows[0];
  });
}

export async function queueManagedSourceCrawls(
  input: { sourceIds?: string[] },
  actorEmail: string,
) {
  const sql = await getSql();
  const ids = [...new Set((input.sourceIds ?? []).map((value) => value.trim()).filter(Boolean))];
  const sources = ids.length
    ? await sql<ManagedSourceRow>`
        select * from managed_fixture_sources
        where source_id = any(${ids}::text[])
          and review_status = 'approved'
          and enabled
        order by source_id
      `
    : await sql<ManagedSourceRow>`
        select * from managed_fixture_sources
        where review_status = 'approved' and enabled
        order by source_id
      `;

  let queued = 0;
  let alreadyActive = 0;
  await sql.transaction(async (tx) => {
    for (const source of sources) {
      const active = await tx<{ id: string }>`
        select id
        from managed_source_crawl_runs
        where source_id = ${source.source_id}
          and status in ('queued', 'running')
        limit 1
      `;
      if (active[0]) {
        alreadyActive += 1;
        continue;
      }
      const runId = randomUUID();
      await tx`
        insert into managed_source_crawl_runs (id, source_id, requested_by)
        values (${runId}, ${source.source_id}, ${actorEmail})
      `;
      await tx`
        insert into managed_source_crawl_pages (
          run_id, canonical_url, page_url, depth
        ) values (
          ${runId},
          ${canonicalSourceUrl(source.start_url)},
          ${source.start_url},
          0
        )
      `;
      await audit(
        tx,
        "crawl",
        runId,
        "queued",
        actorEmail,
        `Queued ${source.source_id}`,
        null,
        { sourceId: source.source_id, startUrl: source.start_url },
      );
      queued += 1;
    }
  });
  return { requested: sources.length, queued, alreadyActive };
}

function allowedHost(url: string, allowedDomains: string): boolean {
  const host = hostname(url);
  return splitValues(allowedDomains)
    .map((domain) => domain.toLowerCase().replace(/^www\./, ""))
    .some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function discoverLinks(
  body: string,
  baseUrl: string,
  contentType: string,
  includePattern: string | null,
  excludePattern: string | null,
): string[] {
  const raw: string[] = [];
  if (/xml|sitemap/i.test(contentType) || /<urlset\b|<sitemapindex\b/i.test(body)) {
    for (const match of body.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)) {
      raw.push(cleanText(match[1] ?? ""));
    }
  } else {
    for (const match of body.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
      raw.push((match[1] ?? "").replace(/&amp;/gi, "&").trim());
    }
  }

  const include = includePattern ? new RegExp(includePattern, "i") : null;
  const exclude = excludePattern ? new RegExp(excludePattern, "i") : null;
  const links = new Set<string>();
  for (const href of raw) {
    if (!href || /^(?:mailto:|tel:|javascript:|#)/i.test(href)) continue;
    try {
      const resolved = new URL(href, baseUrl).toString();
      const parsed = new URL(resolved);
      const path = `${parsed.pathname}${parsed.search}`;
      if (include && !include.test(path)) continue;
      if (exclude && exclude.test(path)) continue;
      links.add(resolved);
    } catch {
      // Ignore malformed page links.
    }
  }
  return [...links];
}

function jsonLdObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(jsonLdObjects);
  if (!value || typeof value !== "object") return [];
  const row = value as Record<string, unknown>;
  return [row, ...jsonLdObjects(row["@graph"])];
}

function textValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function eventType(value: unknown): boolean {
  const types = Array.isArray(value) ? value : [value];
  return types.some((type) => /(?:^|:)event$/i.test(textValue(type)) || /sportsevent/i.test(textValue(type)));
}

function isoDate(value: unknown): string {
  const raw = textValue(value);
  if (!raw) return "";
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return "";
  const parsed = new Date(`${match[1]}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? "" : match[1];
}

function firstObject(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    return value.find((item) => item && typeof item === "object") as Record<string, unknown> | null;
  }
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function addressParts(locationValue: unknown) {
  const location = firstObject(locationValue);
  const address = firstObject(location?.address);
  return {
    venue: textValue(location?.name),
    city: textValue(address?.addressLocality),
    county: textValue(address?.addressRegion),
    country:
      textValue(address?.addressCountry) ||
      textValue(firstObject(address?.addressCountry)?.name),
    area: textValue(address?.streetAddress),
  };
}

function inferDistance(name: string): { code: string; km: number } {
  if (/half\s*marathon/i.test(name)) return { code: "Half", km: 21.0975 };
  if (/\bmarathon\b/i.test(name) && !/half/i.test(name)) return { code: "Marathon", km: 42.195 };
  if (/\bultra\b|ultramarathon/i.test(name)) return { code: "Ultra", km: 0 };
  const km = name.match(/\b(\d+(?:\.\d+)?)\s*(?:k|km|kilomet(?:er|re)s?)\b/i);
  if (km) {
    const value = Number(km[1]);
    return { code: `${value}K`, km: value };
  }
  const miles = name.match(/\b(\d+(?:\.\d+)?)\s*miles?\b/i);
  if (miles) {
    const value = Number(miles[1]);
    return { code: `${value} Mile${value === 1 ? "" : "s"}`, km: value * 1.609344 };
  }
  return { code: "Other", km: 0 };
}

function statusFromJsonLd(value: unknown): string {
  const raw = textValue(value).toLowerCase();
  if (raw.includes("cancel")) return "Closed";
  if (raw.includes("postpon")) return "TBC";
  return "TBC";
}

function entryStatusFromAvailability(value: unknown): string {
  const raw = textValue(value).toLowerCase();
  if (raw.includes("soldout") || raw.includes("sold_out")) return "sold_out";
  if (raw.includes("instock") || raw.includes("available")) return "open";
  if (raw.includes("preorder")) return "ballot";
  return "unknown";
}

function providerCode(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function extractOffers(value: unknown, fallbackSource: string): ExtractedEntry[] {
  const offers = Array.isArray(value) ? value : value ? [value] : [];
  const output: ExtractedEntry[] = [];
  for (const offerValue of offers) {
    const offer = firstObject(offerValue);
    if (!offer) continue;
    const url = textValue(offer.url);
    if (!url) continue;
    const seller = firstObject(offer.seller);
    const name = textValue(seller?.name) || textValue(offer.name) || "Entry provider";
    const price = Number(textValue(offer.price));
    output.push({
      providerCode: providerCode(name) || "entry-provider",
      providerName: name,
      entryUrl: url,
      entryType: "third_party",
      status: entryStatusFromAvailability(offer.availability),
      priceAmount: Number.isFinite(price) ? price : undefined,
      priceCurrency: textValue(offer.priceCurrency) || undefined,
      opensAt: undefined,
      closesAt: textValue(offer.validThrough).slice(0, 10) || undefined,
      sourceUrl: fallbackSource,
      providerRelationship: "unconfirmed",
    });
  }
  return output;
}

function extractJsonLdEvents(
  html: string,
  pageUrl: string,
  source: CrawlPageRow,
): ExtractedEvent[] {
  const parsedObjects: Record<string, unknown>[] = [];
  for (const match of html.matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = (match[1] ?? "").trim();
    if (!raw) continue;
    try {
      parsedObjects.push(...jsonLdObjects(JSON.parse(raw)));
    } catch {
      // A malformed third-party JSON-LD block should not fail the whole page.
    }
  }

  const output: ExtractedEvent[] = [];
  for (const row of parsedObjects) {
    if (!eventType(row["@type"])) continue;
    const eventName = textValue(row.name);
    const eventDate = isoDate(row.startDate);
    if (!eventName || !eventDate) continue;
    const location = addressParts(row.location);
    const organiserObject = firstObject(row.organizer);
    const organiser = textValue(organiserObject?.name) || textValue(row.organizer);
    const distance = inferDistance(eventName);
    const officialWebsiteCandidate =
      textValue(row.url) || textValue(organiserObject?.url) || null;
    output.push({
      eventName,
      eventDate,
      distance: distance.code,
      distanceKm: distance.km,
      sport: "Running",
      country: location.country || splitValues(source.country_focus)[0] || "Unknown",
      county: location.county,
      city: location.city,
      area: location.area,
      venue: location.venue,
      surface: splitValues(source.surface_scope)[0] || "",
      organiser,
      officialWebsiteCandidate,
      startTime: textValue(row.startDate).match(/T(\d{2}:\d{2})/)?.[1] ?? null,
      entryStatus: statusFromJsonLd(row.eventStatus),
      entryOptions: extractOffers(row.offers, pageUrl),
    });
  }
  return output;
}

async function pageCount(sql: Sql, runId: string): Promise<number> {
  const rows = await sql<{ count: number }>`
    select count(*)::int as count from managed_source_crawl_pages where run_id = ${runId}
  `;
  return rows[0]?.count ?? 0;
}

async function pendingPageCount(sql: Sql, runId: string): Promise<number> {
  const rows = await sql<{ count: number }>`
    select count(*)::int as count
    from managed_source_crawl_pages
    where run_id = ${runId} and status = 'pending'
  `;
  return rows[0]?.count ?? 0;
}

async function processCrawlPage(page: CrawlPageRow, actorEmail: string) {
  const sql = await getSql();
  const runRows = await sql<CrawlRunRow>`
    select * from managed_source_crawl_runs where id = ${page.run_id} limit 1
  `;
  const run = runRows[0];
  if (!run || !["queued", "running"].includes(run.status)) {
    return { processed: false, reason: "run_not_active" };
  }

  const lastRows = await sql<{ fetched_at: string | null }>`
    select max(page.fetched_at)::text as fetched_at
    from managed_source_crawl_pages page
    join managed_source_crawl_runs run on run.id = page.run_id
    where run.source_id = ${page.source_id}
      and page.status = 'fetched'
  `;
  const lastFetched = lastRows[0]?.fetched_at ? Date.parse(lastRows[0].fetched_at) : 0;
  if (
    lastFetched &&
    Date.now() - lastFetched < Math.ceil(page.rate_limit_seconds * 1000)
  ) {
    return { processed: false, reason: "rate_limited" };
  }

  await sql.transaction(async (tx) => {
    await tx`
      update managed_source_crawl_runs
      set status = 'running', started_at = coalesce(started_at, now()), error_message = null
      where id = ${page.run_id}
    `;
    await tx`
      update managed_source_crawl_pages
      set status = 'fetching', error_message = null
      where run_id = ${page.run_id} and canonical_url = ${page.canonical_url}
    `;
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CRAWL_TIMEOUT_MS);
  try {
    if (!allowedHost(page.page_url, page.allowed_domains)) {
      throw new Error("Page hostname is outside the approved allowed_domains");
    }
    await assertPublicRemoteUrl(page.page_url);
    const response = await fetch(page.page_url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent":
          "ATHRECS-Event-Metadata/1.0 (+https://www.athrecs.com; event-level metadata only)",
        accept: "text/html,application/xhtml+xml,application/xml,text/xml,application/ld+json;q=0.9,*/*;q=0.5",
      },
    });
    const finalUrl = response.url || page.page_url;
    if (!allowedHost(finalUrl, page.allowed_domains)) {
      throw new Error("A redirect left the approved allowed_domains");
    }
    await assertPublicRemoteUrl(finalUrl);
    const declared = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(declared) && declared > MAX_CRAWL_PAGE_BYTES) {
      throw new Error("Page is larger than the 2 MB crawl limit");
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_CRAWL_PAGE_BYTES) {
      throw new Error("Page is larger than the 2 MB crawl limit");
    }
    const body = new TextDecoder("utf-8").decode(buffer);
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const links = discoverLinks(
      body,
      finalUrl,
      contentType,
      page.race_link_include_regex,
      page.race_link_exclude_regex,
    ).filter((url) => allowedHost(url, page.allowed_domains));
    const events = /html|xml|json/i.test(contentType)
      ? extractJsonLdEvents(body, finalUrl, page)
      : [];

    let candidatesFound = 0;
    await sql.transaction(async (tx) => {
      const currentPages = await pageCount(tx, page.run_id);
      let remaining = Math.max(page.max_pages - currentPages, 0);
      for (const link of links) {
        if (remaining <= 0) break;
        const canonical = canonicalSourceUrl(link);
        const inserted = await tx.query<{ canonical_url: string }>(
          `insert into managed_source_crawl_pages (
             run_id, canonical_url, page_url, discovered_from, depth
           ) values ($1, $2, $3, $4, $5)
           on conflict (run_id, canonical_url) do nothing
           returning canonical_url`,
          [page.run_id, canonical, link, finalUrl, page.depth + 1],
        );
        if (inserted[0]) remaining -= 1;
      }

      for (const event of events) {
        const staged = await stageVerificationCandidate(
          {
            sourceId: page.source_id,
            discoveryUrl: finalUrl,
            eventName: event.eventName,
            sport: event.sport,
            country: event.country,
            county: event.county,
            city: event.city,
            area: event.area,
            venue: event.venue,
            surface: event.surface,
            organiser: event.organiser,
            officialWebsiteCandidate: event.officialWebsiteCandidate,
            officialWebsiteEvidenceUrl: finalUrl,
            eventDate: event.eventDate,
            distance: event.distance,
            distanceKm: event.distanceKm,
            startTime: event.startTime,
            entryStatus: event.entryStatus,
            entryOptions: event.entryOptions,
            resultLinks: [],
          },
          actorEmail,
          tx,
        );
        if (!staged.reused) candidatesFound += 1;
      }

      await tx`
        update managed_source_crawl_pages
        set status = 'fetched',
            page_url = ${finalUrl},
            http_status = ${response.status},
            content_type = ${contentType},
            fetched_at = now(),
            error_message = null
        where run_id = ${page.run_id} and canonical_url = ${page.canonical_url}
      `;
      await tx`
        update managed_source_crawl_runs
        set pages_fetched = pages_fetched + 1,
            candidates_found = candidates_found + ${candidatesFound}
        where id = ${page.run_id}
      `;
      const pending = await pendingPageCount(tx, page.run_id);
      const fetched = await tx<{ count: number }>`
        select count(*)::int as count
        from managed_source_crawl_pages
        where run_id = ${page.run_id} and status = 'fetched'
      `;
      if (pending === 0 || (fetched[0]?.count ?? 0) >= page.max_pages) {
        await tx`
          update managed_source_crawl_runs
          set status = 'completed', finished_at = now()
          where id = ${page.run_id}
        `;
      }
      await audit(
        tx,
        "crawl",
        page.run_id,
        "page_fetched",
        actorEmail,
        finalUrl,
        null,
        {
          page: finalUrl,
          linksQueued: Math.min(links.length, page.max_pages),
          candidatesFound,
        },
      );
    });

    return {
      processed: true,
      runId: page.run_id,
      pageUrl: finalUrl,
      linksFound: links.length,
      candidatesFound,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Crawl request timed out"
        : error instanceof Error
          ? error.message
          : String(error);
    await sql.transaction(async (tx) => {
      await tx`
        update managed_source_crawl_pages
        set status = 'failed', error_message = ${message}, fetched_at = now()
        where run_id = ${page.run_id} and canonical_url = ${page.canonical_url}
      `;
      const pending = await pendingPageCount(tx, page.run_id);
      await tx`
        update managed_source_crawl_runs
        set status = ${pending > 0 ? "running" : "completed_with_errors"},
            error_message = ${message},
            finished_at = case when ${pending} = 0 then now() else finished_at end
        where id = ${page.run_id}
      `;
      await audit(
        tx,
        "crawl",
        page.run_id,
        "page_failed",
        actorEmail,
        message,
        null,
        { page: page.page_url },
      );
    });
    return { processed: true, runId: page.run_id, pageUrl: page.page_url, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export async function processManagedCrawlQueue(
  input: { batchSize?: number },
  actorEmail: string,
) {
  const batchSize = Math.min(
    Math.max(Math.floor(input.batchSize ?? 3), 1),
    MAX_CRAWL_BATCH,
  );
  const sql = await getSql();
  const pages = await sql<CrawlPageRow>`
    select
      page.run_id,
      run.source_id,
      page.canonical_url,
      page.page_url,
      page.depth,
      source.start_url,
      source.allowed_domains,
      source.race_link_include_regex,
      source.race_link_exclude_regex,
      source.max_pages,
      source.rate_limit_seconds,
      source.source_name,
      source.country_focus,
      source.surface_scope
    from managed_source_crawl_pages page
    join managed_source_crawl_runs run on run.id = page.run_id
    join managed_fixture_sources source on source.source_id = run.source_id
    where page.status = 'pending'
      and run.status in ('queued', 'running')
      and source.review_status = 'approved'
      and source.enabled
    order by run.requested_at, page.depth, page.canonical_url
    limit ${batchSize * 4}
  `;

  const selected: CrawlPageRow[] = [];
  const usedSources = new Set<string>();
  for (const page of pages) {
    if (selected.length >= batchSize) break;
    if (usedSources.has(page.source_id)) continue;
    usedSources.add(page.source_id);
    selected.push(page);
  }

  const results = [];
  for (const page of selected) {
    results.push(await processCrawlPage(page, actorEmail));
  }
  return {
    attempted: selected.length,
    processed: results.filter((result) => result.processed).length,
    results,
  };
}

export async function getSourceManagementDashboard() {
  const sql = await getSql();
  const sources = await managedRows(sql);
  const runs = await sql<CrawlRunRow>`
    select
      id,
      source_id,
      status,
      requested_by,
      requested_at::text as requested_at,
      started_at::text as started_at,
      finished_at::text as finished_at,
      pages_fetched,
      candidates_found,
      error_message
    from managed_source_crawl_runs
    order by requested_at desc
    limit 50
  `;
  const queue = await sql<{ pending_pages: number; active_runs: number }>`
    select
      (select count(*)::int from managed_source_crawl_pages where status = 'pending') as pending_pages,
      (
        select count(*)::int
        from managed_source_crawl_runs
        where status in ('queued', 'running')
      ) as active_runs
  `;
  return {
    sources: sources.map((source) => ({
      ...source,
      manifest: buildBulkSourceJobManifest([sourceFromManaged(source)])[0],
    })),
    counts: {
      total: sources.length,
      pending: sources.filter((source) => source.review_status === "pending").length,
      approved: sources.filter((source) => source.review_status === "approved").length,
      manualOnly: sources.filter((source) => source.review_status === "manual_only").length,
      rejected: sources.filter((source) => source.review_status === "rejected").length,
      activeRuns: queue[0]?.active_runs ?? 0,
      pendingPages: queue[0]?.pending_pages ?? 0,
    },
    runs,
  };
}
