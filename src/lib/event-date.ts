/** Preserve known calendar precision; never roll an invalid date into another day. */
export function calendarDate(value: string | null | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

/** Unknown or malformed local times must not invalidate a known event date. */
export function localEventTime(value: string | null | undefined): string | undefined {
  return value && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value) ? value : undefined;
}
