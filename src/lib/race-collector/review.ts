export const REVIEW_BATCH_LIMIT = 50;
export const REVIEW_FILTERS = [
  { value: "all", label: "All findings" },
  { value: "review", label: "Ready to review" },
  { value: "held", label: "Needs attention" },
  { value: "duplicate", label: "Already listed" },
  { value: "staged", label: "Sent for publication" },
] as const;
export type ReviewQuery = {
  status: (typeof REVIEW_FILTERS)[number]["value"];
  search: string;
  page: number;
  pageSize: number;
};
export function validateReviewQuery(input: Partial<ReviewQuery> = {}): ReviewQuery {
  const query = { status: "all" as const, search: "", page: 0, pageSize: 50, ...input };
  if (
    !REVIEW_FILTERS.some((filter) => filter.value === query.status) ||
    typeof query.search !== "string" ||
    query.search.length > 200 ||
    !Number.isSafeInteger(query.page) ||
    query.page < 0 ||
    query.page > 1_000_000 ||
    ![25, 50, 100].includes(query.pageSize)
  )
    throw new Error("Invalid review filters.");
  return { ...query, search: query.search.trim() };
}
export function reviewGuidance(row: { status: string; reason: string; event_id: number | null }) {
  if (row.status === "staged")
    return {
      title: "Sent for publication",
      why: "You have already confirmed this finding and sent it to publication review.",
      next: "Open Publication review to check the batch status and finish validation and approval.",
    };
  if (row.status === "duplicate")
    return {
      title: "Already listed",
      why: "The same event, date and distance are already in the catalogue.",
      next: "No action needed here. This finding cannot be selected again.",
    };
  if (row.status === "review")
    return {
      title: "Ready to review",
      why: row.event_id
        ? "A new date or distance was found for an existing event. Its source needs your final check."
        : "A new race listing was found. Its source needs your final check before it can be added.",
      next: "Open the source, confirm the date, distance and start venue, then select this finding.",
    };
  const reasons: Record<string, { why: string; next: string }> = {
    "Possible event alias needs review": {
      why: "This race may already be listed under a different name.",
      next: "Compare it with the existing event and confirm which record to use before adding it.",
    },
    "Proposed slug collides with another discovered event; canonical review required": {
      why: "Two findings point to the same event record but use different names.",
      next: "Check whether these are different distances at one event or separate events. Confirm the event record before adding them.",
    },
    "Multiple canonical identities need review": {
      why: "More than one existing event could match this race.",
      next: "Compare the possible matches and confirm the correct event record first.",
    },
    "Overlapping pending import": {
      why: "Another import already contains this event and date.",
      next: "Check the pending batch in Publication review before adding another copy.",
    },
    "Existing distance label differs numerically": {
      why: "The named distance disagrees with the distance saved in the catalogue.",
      next: "Check the organiser’s exact distance and correct the conflicting value first.",
    },
    "Possible reschedule or distinct repeat date; review first": {
      why: "This race has a different date from another edition recorded for the same year.",
      next: "Confirm whether the race moved date or is a separate repeat event before adding it.",
    },
  };
  return {
    title: "Needs attention",
    ...(reasons[row.reason] ?? {
      why: row.reason,
      next: "Resolve this issue against the primary programme before this finding can move forward.",
    }),
  };
}
