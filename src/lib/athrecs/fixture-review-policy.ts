export const HISTORICAL_METADATA_POLICY = "historical-metadata-v1";

export type FixtureReviewIssue = {
  field: string;
  issueType: string;
  priority: string;
};

export type FixtureReviewPolicyInput = {
  eventName: string;
  eventDate: string;
  sport: string;
  country: string;
  sourceUrl: string;
  distances: Array<{ code: string; km: number }>;
  issues: FixtureReviewIssue[];
  blockReasons: string[];
};

export type FixtureReviewPolicyResult = {
  status: "releasable" | "pending" | "not_applicable";
  policyCode: string | null;
  remainingBlockReasons: string[];
  warnings: string[];
};

const SUPPORTED_SPORTS = new Set([
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
]);

// These fields improve a historical page, but their absence or conflict does
// not change the identity of an edition. They stay visible as warnings and can
// be enriched later. Unknown high-priority fields remain blocking by default.
const SAFE_HISTORICAL_WARNING_FIELDS = new Set([
  "official_website_url",
  "city",
  "image_url",
  "description",
  "venue_name",
  "first_observed_edition_date",
  "results_url",
  "latest_claimed_edition_number",
  "entry_status",
  "timing_evidence_url",
  "timing_provider",
]);

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function evaluateHistoricalFixtureReview(
  input: FixtureReviewPolicyInput,
  today: string,
): FixtureReviewPolicyResult {
  if (!input.blockReasons.includes("open_high_priority_review_item")) {
    return {
      status: input.blockReasons.length ? "pending" : "not_applicable",
      policyCode: null,
      remainingBlockReasons: unique(input.blockReasons),
      warnings: [],
    };
  }

  const remaining = input.blockReasons.filter(
    (reason) => reason !== "open_high_priority_review_item",
  );
  const warnings: string[] = [];

  if (!input.eventName.trim()) remaining.push("missing_event_name");
  if (!isRealDate(input.eventDate)) {
    remaining.push("missing_event_date");
  } else if (input.eventDate >= today) {
    remaining.push("not_historical_edition");
  }
  if (!SUPPORTED_SPORTS.has(input.sport)) remaining.push("unsupported_sport");
  if (!input.country.trim()) remaining.push("missing_country");
  if (!validHttpUrl(input.sourceUrl)) remaining.push("invalid_source_url");
  if (
    input.distances.length === 0 ||
    input.distances.some(
      (distance) => !distance.code.trim() || !Number.isFinite(distance.km) || distance.km <= 0,
    )
  ) {
    remaining.push("missing_distance");
  }

  for (const issue of input.issues) {
    if (issue.priority.toLowerCase() !== "high") continue;
    if (SAFE_HISTORICAL_WARNING_FIELDS.has(issue.field)) {
      warnings.push(`${issue.field}: ${issue.issueType}`);
    } else {
      remaining.push(`critical_review_issue:${issue.field || "unknown"}`);
    }
  }

  const remainingBlockReasons = unique(remaining);
  return {
    status: remainingBlockReasons.length === 0 ? "releasable" : "pending",
    policyCode: HISTORICAL_METADATA_POLICY,
    remainingBlockReasons,
    warnings: unique(warnings),
  };
}
