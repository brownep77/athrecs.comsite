const publicQualifications = [
  "Non-competitive event",
  "Manually timed",
  "Distance not established",
  "Preliminary results",
  "Provisional results",
  "Seconds disputed; minute precision",
  "Organiser-listed 42.00 km",
] as const;

/** Only explicit public qualifications may be rendered from the mixed label field. */
export function historicalResultQualifications(labels: readonly string[]): string[] {
  const recorded = new Set(labels.map((label) => label.trim().toLowerCase()));
  return publicQualifications.filter((label) => recorded.has(label.toLowerCase()));
}
