// Change only when shared guide content, links or structured data materially changes.
// Never use the request/build date: unchanged pages must not appear freshly edited.
export const ROAD_GUIDE_TEMPLATE_MODIFIED = "2026-10-07";

export function roadGuideModifiedAt(checkedDates: readonly string[]): string {
  return [ROAD_GUIDE_TEMPLATE_MODIFIED, ...checkedDates].sort().at(-1)!;
}
