/** Automated discoveries cannot replace an edition's already recorded start. */
export function automatedStartTimeError(
  sourceKey: string,
  existingStart: unknown,
  proposedStart: string | undefined,
): string | null {
  if (!sourceKey.startsWith("athrecs-holding:delta:")) return null;
  if (typeof existingStart !== "string" || !existingStart.trim()) return null;
  const normalized = (value: string) => {
    const time = value.trim();
    return time.length === 5 ? `${time}:00` : time;
  };
  if (normalized(existingStart) === normalized(proposedStart ?? "")) return null;
  return "Automated catalogue changes cannot clear or replace an existing start time; review the source timetable separately";
}
