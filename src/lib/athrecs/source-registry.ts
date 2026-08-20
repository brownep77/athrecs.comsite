export const FIXTURE_SOURCE_REGISTRY_HEADERS = [
  "source_id",
  "source_name",
  "start_url",
  "source_type",
  "enabled",
  "source_section",
  "region_scope",
  "country_focus",
  "coverage_scope",
  "coverage_start_year",
  "coverage_end_year",
  "surface_scope",
  "timing_scope",
  "chip_timed_status",
  "permission_url",
  "allowed_domains",
  "race_link_include_regex",
  "race_link_exclude_regex",
  "profile",
  "follow_history_links",
  "max_pages",
  "rate_limit_seconds",
  "rights_status",
  "notes",
] as const;

export const RUNNABLE_SOURCE_RIGHTS_STATUSES = new Set([
  "No published crawl restriction found",
  "Permitted by published crawl rules",
  "Permitted subject to published crawl delay",
  "Reference metadata permitted by published crawl signal",
]);

type Header = (typeof FIXTURE_SOURCE_REGISTRY_HEADERS)[number];

export type FixtureSource = {
  [Key in Header]: Key extends "enabled" | "follow_history_links"
    ? boolean
    : Key extends "max_pages" | "rate_limit_seconds"
      ? number
      : string;
};

export type BulkSourceJobManifest = FixtureSource & {
  queue_status: "queued" | "blocked";
  block_reason: string | null;
};

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (inQuotes) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (inQuotes) throw new Error("Source registry contains an unterminated quoted field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
    rows.push(row);
  }
  return rows.filter((values) => values.some(Boolean));
}

export function parseFixtureSourceRegistry(input: string): FixtureSource[] {
  const rows = parseCsv(input.replace(/^\uFEFF/, ""));
  const header = rows.shift();
  if (!header || header.join("\u0000") !== FIXTURE_SOURCE_REGISTRY_HEADERS.join("\u0000")) {
    throw new Error("Source registry headers changed unexpectedly");
  }

  const seen = new Set<string>();
  return rows.map((values, index) => {
    if (values.length !== FIXTURE_SOURCE_REGISTRY_HEADERS.length) {
      throw new Error(`Source registry row ${index + 2} has the wrong number of columns`);
    }
    const raw = Object.fromEntries(
      FIXTURE_SOURCE_REGISTRY_HEADERS.map((name, column) => [name, values[column] ?? ""]),
    ) as Record<Header, string>;
    if (!/^[a-z0-9_]+$/.test(raw.source_id)) {
      throw new Error(`Source registry row ${index + 2} has an invalid source_id`);
    }
    if (seen.has(raw.source_id)) {
      throw new Error(`Duplicate source_id in registry: ${raw.source_id}`);
    }
    seen.add(raw.source_id);
    const maxPages = Number(raw.max_pages);
    const rateLimit = Number(raw.rate_limit_seconds);
    if (!Number.isInteger(maxPages) || maxPages < 1) {
      throw new Error(`Source ${raw.source_id} has an invalid max_pages value`);
    }
    if (!Number.isFinite(rateLimit) || rateLimit <= 0) {
      throw new Error(`Source ${raw.source_id} has an invalid rate_limit_seconds value`);
    }

    return {
      ...raw,
      enabled: raw.enabled === "1",
      follow_history_links: raw.follow_history_links === "1",
      max_pages: maxPages,
      rate_limit_seconds: rateLimit,
    } as FixtureSource;
  });
}

export function buildBulkSourceJobManifest(sources: FixtureSource[]): BulkSourceJobManifest[] {
  return sources.map((source) => {
    const approvedRights = RUNNABLE_SOURCE_RIGHTS_STATUSES.has(source.rights_status);
    const runnable = source.enabled && approvedRights;
    return {
      ...source,
      queue_status: runnable ? "queued" : "blocked",
      block_reason: runnable
        ? null
        : source.enabled
          ? `Rights status is not approved: ${source.rights_status}`
          : source.rights_status,
    };
  });
}

export function summarizeFixtureSourceRegistry(manifest: BulkSourceJobManifest[]) {
  const runnable = manifest.filter((source) => source.queue_status === "queued");
  const regions = [...new Set(manifest.map((source) => source.region_scope))].sort();
  const countries = [
    ...new Set(
      manifest.flatMap((source) =>
        source.country_focus
          .split("|")
          .map((country) => country.trim())
          .filter(Boolean),
      ),
    ),
  ].sort();
  return {
    sources: manifest.length,
    runnable: runnable.length,
    blocked: manifest.length - runnable.length,
    regions,
    countries,
  };
}
