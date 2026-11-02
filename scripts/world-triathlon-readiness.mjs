// Offline, read-only report. Never fetches World Triathlon or changes AthRecs.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function calendarWindowEnd(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("as_of must be YYYY-MM-DD");
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error("as_of must be a real calendar date");
  const target = new Date(date);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + 3);
  const lastDay = new Date(target);
  lastDay.setUTCMonth(lastDay.getUTCMonth() + 1);
  lastDay.setUTCDate(0);
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay.getUTCDate()));
  return target.toISOString().slice(0, 10);
}

const countFields = [
  "events", "edition_rows", "upcoming_rows", "next_three_months",
  "next_three_months_blank_starts", "future_other_distance", "histories",
  "athletes", "performance_rows", "published_histories", "complete_histories",
  "keyed_rows", "duplicate_key_groups", "cross_profile_duplicate_keys",
];

export function readinessReport(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
    throw new Error("Expected a readiness snapshot object");
  const end = calendarWindowEnd(snapshot.as_of);
  if (snapshot.window_end !== end)
    throw new Error("window_end must be three calendar months, month-end clamped");
  if (snapshot.scope !== "world-triathlon-linked-event-histories-v1")
    throw new Error("Unexpected audit scope");
  for (const key of countFields) {
    if (!Number.isSafeInteger(snapshot[key]) || snapshot[key] < 0)
      throw new Error(`Invalid count: ${key}`);
  }
  for (const [part, total] of [
    ["upcoming_rows", "edition_rows"],
    ["next_three_months", "upcoming_rows"],
    ["next_three_months_blank_starts", "next_three_months"],
    ["future_other_distance", "upcoming_rows"],
    ["athletes", "histories"],
    ["published_histories", "histories"],
    ["complete_histories", "histories"],
    ["keyed_rows", "performance_rows"],
    ["cross_profile_duplicate_keys", "duplicate_key_groups"],
  ]) {
    if (snapshot[part] > snapshot[total])
      throw new Error(`${part} cannot exceed ${total}`);
  }
  if (!Array.isArray(snapshot.capture_approvals))
    throw new Error("capture_approvals must be an array");
  for (const approval of snapshot.capture_approvals) {
    if (!approval || typeof approval.approval_basis !== "string" ||
        typeof approval.scope !== "string" || !Number.isSafeInteger(approval.n) || approval.n < 1)
      throw new Error("Invalid approval summary");
  }
  const privateOnly = snapshot.capture_approvals.length > 0 &&
    snapshot.capture_approvals.every((a) => a.scope === "staff_only");
  return [
    `# World Triathlon readiness audit: ${snapshot.as_of}`,
    "",
    `Inclusive fixture window: ${snapshot.as_of} to ${end}.`,
    "",
    `Stored World Triathlon histories: ${snapshot.histories}; athletes: ${snapshot.athletes}; performance rows: ${snapshot.performance_rows}.`,
    `Published history records: ${snapshot.published_histories}; histories marked complete: ${snapshot.complete_histories}. Neither count is fresh source verification.`,
    `Performance rows with World Triathlon keys: ${snapshot.keyed_rows}; rows outside that key audit: ${snapshot.performance_rows - snapshot.keyed_rows}.`,
    `Repeated key groups: ${snapshot.duplicate_key_groups}; cross-profile groups: ${snapshot.cross_profile_duplicate_keys}.`,
    "The key check does not establish identity, cover native results or prove unkeyed rows are unique.",
    "",
    `World Triathlon-linked events: ${snapshot.events}; stored edition rows: ${snapshot.edition_rows}; upcoming rows: ${snapshot.upcoming_rows}.`,
    `Edition rows in the three-month window: ${snapshot.next_three_months}; blank starts in that window: ${snapshot.next_three_months_blank_starts}.`,
    `Upcoming rows with the Other distance placeholder: ${snapshot.future_other_distance}.`,
    "These are stored rows, not counts of public fixtures. Nonblank starts and nonplaceholder distances are not automatically verified.",
    "",
    "## Collection and publication gates",
    privateOnly ? "All recorded capture approvals in this snapshot are staff-only." :
      "Capture approval summaries require individual scope and evidence review.",
    "Owner-private capture approval is not provider permission for bulk collection or public republication.",
    "This report never grants collection, licensing, identity, merging or publication approval.",
    "New fixtures: 0. New results: 0. New profiles: 0. Merges: 0.",
    "No external crawl or database write is implemented by this tool.",
    "",
    "## Next review order",
    "Resolve provider permission and API access; then check today/next two days, seven days, 30 days and the remainder of the window.",
    "Keep unresolved editions in staff review. Preserve existing source IDs, claims, privacy choices and source qualifications.",
    "Only report full coverage after reconciling every page, event, race programme, result and athlete-history checkpoint within a declared scope.",
    "",
  ].join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error("Usage: node scripts/world-triathlon-readiness.mjs /private/snapshot.json");
    console.log(readinessReport(JSON.parse(await readFile(process.argv[2], "utf8"))));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Readiness report failed");
    process.exitCode = 1;
  }
}
