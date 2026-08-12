/** One listing per event + date (multi-distance days collapse to a single card). */

export function eventDateKey(slug: string, date: string): string {
  return `${slug}|${date}`;
}

export function normalizeEventName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function collapseSameEventDate<
  T extends { event_slug: string; event_date: string; distance_code: string },
>(rows: T[]): T[] {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const key = eventDateKey(row.event_slug, row.event_date);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, row);
      continue;
    }
    const distances = new Set(
      `${existing.distance_code} · ${row.distance_code}`
        .split("·")
        .map((part) => part.trim())
        .filter(Boolean),
    );
    seen.set(key, {
      ...existing,
      distance_code: [...distances].join(" · "),
    });
  }
  return [...seen.values()];
}

export function collapseSameNameDate<
  T extends { name: string; next_date: string | null; slug: string },
>(rows: T[]): T[] {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const key = `${normalizeEventName(row.name)}|${row.next_date ?? row.slug}`;
    if (!seen.has(key)) seen.set(key, row);
  }
  return [...seen.values()];
}
