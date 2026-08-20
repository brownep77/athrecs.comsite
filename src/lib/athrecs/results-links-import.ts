export const RESULT_LINK_HEADERS = [
  "event_slug",
  "date",
  "distance",
  "provider_name",
  "results_url",
] as const;

export type ParsedResultLinkRow = {
  rowNumber: number;
  eventSlug: string;
  date: string;
  distance: string;
  providerName: string;
  providerCode: string;
  resultsUrl: string;
  canonicalUrl: string;
  sourceUrl: string | null;
  verified: boolean;
  checkedAt: string | null;
  issues: string[];
};

export type ResultLinkPolicySource = {
  source_id: string;
  source_name: string;
  allowed_domains: string;
  queue_status: "queued" | "blocked";
  block_reason: string | null;
};

export type ResultLinkSourceDecision = {
  allowed: boolean;
  sourceId: string | null;
  sourceName: string;
  reason: string | null;
};

export type ResultLinkPreviewStatus =
  "ready" | "duplicate" | "held" | "unmatched" | "ambiguous" | "invalid";

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

  if (inQuotes) throw new Error("CSV contains an unterminated quoted field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.endsWith("\r") ? field.slice(0, -1) : field);
    rows.push(row);
  }
  return rows.filter((values) => values.some((value) => value.trim()));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function parseBoolean(value: string): boolean | null {
  if (/^(?:1|true|yes|y)$/i.test(value.trim())) return true;
  if (/^(?:0|false|no|n)$/i.test(value.trim())) return false;
  return null;
}

function httpsUrl(value: string): string | null {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function canonicalResultUrl(value: string): string {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "https:") throw new Error("Results URLs must use HTTPS");
  parsed.protocol = parsed.protocol.toLowerCase();
  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.hash = "";
  if (parsed.port === "443") parsed.port = "";
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  for (const key of [...parsed.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(?:fbclid|gclid)$/i.test(key)) {
      parsed.searchParams.delete(key);
    }
  }
  parsed.searchParams.sort();
  return parsed.toString();
}

export function parseResultLinksCsv(input: string): ParsedResultLinkRow[] {
  if (input.length > 5_000_000) throw new Error("CSV is larger than the 5 MB import limit");
  const rows = parseCsv(input.replace(/^\uFEFF/, ""));
  const rawHeaders = rows.shift();
  if (!rawHeaders) throw new Error("CSV is empty");
  const headers = rawHeaders.map((header) => header.trim().toLowerCase());
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicateHeaders.length) {
    throw new Error(`CSV contains duplicate header: ${duplicateHeaders[0]}`);
  }
  const missing = RESULT_LINK_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`CSV is missing required header(s): ${missing.join(", ")}`);
  if (rows.length > 5_000) throw new Error("CSV contains more than the 5,000-row import limit");

  return rows.map((values, index) => {
    const value = (name: string) => values[headers.indexOf(name)]?.trim() ?? "";
    const eventSlug = value("event_slug");
    const date = value("date");
    const distance = value("distance");
    const providerName = value("provider_name");
    const providerCode = slugify(value("provider_code") || providerName);
    const rawResultsUrl = value("results_url");
    const resultsUrl = httpsUrl(rawResultsUrl) ?? rawResultsUrl;
    const rawSourceUrl = value("source_url");
    const sourceUrl = rawSourceUrl ? (httpsUrl(rawSourceUrl) ?? rawSourceUrl) : null;
    const rawVerified = value("verified");
    const verified = parseBoolean(rawVerified);
    const rawCheckedAt = value("checked_at");
    const issues: string[] = [];

    if (!eventSlug) issues.push("event_slug is required");
    if (!validDate(date)) issues.push("date must be a real YYYY-MM-DD date");
    if (!distance) issues.push("distance is required");
    if (!providerName) issues.push("provider_name is required");
    if (!providerCode) issues.push("provider_code could not be derived");
    if (!httpsUrl(rawResultsUrl)) issues.push("results_url must be a complete HTTPS URL");
    if (rawSourceUrl && !httpsUrl(rawSourceUrl)) {
      issues.push("source_url must be a complete HTTPS URL");
    }
    if (verified === null) issues.push("verified must be true/false, yes/no or 1/0");
    if (
      rawCheckedAt &&
      (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(rawCheckedAt) || Number.isNaN(Date.parse(rawCheckedAt)))
    ) {
      issues.push("checked_at must be an ISO date or timestamp");
    }

    let canonicalUrl = "";
    if (httpsUrl(rawResultsUrl)) canonicalUrl = canonicalResultUrl(rawResultsUrl);

    return {
      rowNumber: index + 2,
      eventSlug,
      date,
      distance,
      providerName,
      providerCode,
      resultsUrl,
      canonicalUrl,
      sourceUrl,
      verified: verified ?? false,
      checkedAt: rawCheckedAt || null,
      issues,
    };
  });
}

function hostname(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function decideResultLinkSource(
  row: Pick<ParsedResultLinkRow, "resultsUrl" | "sourceUrl" | "verified">,
  sources: ResultLinkPolicySource[],
): ResultLinkSourceDecision {
  if (!row.verified) {
    return {
      allowed: false,
      sourceId: null,
      sourceName: "Unverified upload",
      reason: "The row is not marked verified",
    };
  }

  const domains = new Set(
    [hostname(row.sourceUrl), hostname(row.resultsUrl)].filter((value): value is string => !!value),
  );
  const sourceDomains = (source: ResultLinkPolicySource) =>
    source.allowed_domains
      .split("|")
      .map((domain) =>
        domain
          .trim()
          .toLowerCase()
          .replace(/^www\./, ""),
      )
      .filter(Boolean);
  const blocked = sources.find(
    (source) =>
      source.queue_status === "blocked" &&
      sourceDomains(source).some((allowedDomain) =>
        [...domains].some(
          (domain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`),
        ),
      ),
  );
  if (blocked) {
    return {
      allowed: false,
      sourceId: blocked.source_id,
      sourceName: blocked.source_name,
      reason: blocked.block_reason || "This registered source is held for review",
    };
  }
  const approved = sources.find(
    (source) =>
      source.queue_status === "queued" &&
      sourceDomains(source).some((domain) => domains.has(domain)),
  );
  if (approved) {
    return {
      allowed: true,
      sourceId: approved.source_id,
      sourceName: approved.source_name,
      reason: null,
    };
  }
  return {
    allowed: true,
    sourceId: null,
    sourceName: "Manually verified direct source",
    reason: null,
  };
}
