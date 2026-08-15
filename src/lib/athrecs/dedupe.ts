/** One listing per event + date (multi-distance days collapse to a single card). */

export function eventDateKey(slug: string, date: string): string {
  return `${slug}|${date}`;
}

export function normalizeEventName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|tcs|bmw|aj\s*bell|edp|mainova|acea|zurich)\b/gi, " ")
    .replace(/[^a-z0-9]+/g, "");
}

function mergeDistanceCodes(a: string, b: string): string {
  const distances = new Set(
    `${a} · ${b}`
      .split("·")
      .map((part) => part.trim())
      .filter(Boolean),
  );
  return [...distances].join(" · ");
}

/** Collapse rows that share the same event slug + date (merge distance labels). */
export function collapseSameEventDate<
  T extends {
    event_slug: string;
    event_date: string;
    distance_code: string;
    event_name?: string;
  },
>(rows: T[]): T[] {
  const bySlugDate = new Map<string, T>();
  for (const row of rows) {
    const key = eventDateKey(row.event_slug, row.event_date);
    const existing = bySlugDate.get(key);
    if (!existing) {
      bySlugDate.set(key, row);
      continue;
    }
    bySlugDate.set(key, {
      ...existing,
      distance_code: mergeDistanceCodes(existing.distance_code, row.distance_code),
    });
  }

  // Second pass: same normalised name + same date (different slugs from multiple sources)
  const byNameDate = new Map<string, T>();
  for (const row of bySlugDate.values()) {
    const nameKey = row.event_name
      ? `${normalizeEventName(row.event_name)}|${row.event_date}`
      : eventDateKey(row.event_slug, row.event_date);
    const existing = byNameDate.get(nameKey);
    if (!existing) {
      byNameDate.set(nameKey, row);
      continue;
    }
    // Prefer the longer / more specific slug name when merging sources
    const preferNext =
      (row.event_name?.length ?? 0) > (existing.event_name?.length ?? 0) ||
      row.event_slug.length < existing.event_slug.length;
    const base = preferNext ? row : existing;
    const other = preferNext ? existing : row;
    byNameDate.set(nameKey, {
      ...base,
      distance_code: mergeDistanceCodes(base.distance_code, other.distance_code),
    });
  }

  return [...byNameDate.values()];
}

/** Collapse event list cards that share the same name and next race date. */
export function collapseSameNameDate<
  T extends { name: string; next_date: string | null; slug: string },
>(rows: T[]): T[] {
  const seen = new Map<string, T>();
  for (const row of rows) {
    const norm = normalizeEventName(row.name);
    // Always collapse by name+date when a next date exists
    const key = row.next_date ? `${norm}|${row.next_date}` : `${norm}|${row.slug}`;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, row);
      continue;
    }
    // Prefer shorter slug (canonical) or keep first
    if (row.slug.length < existing.slug.length) {
      seen.set(key, row);
    }
  }
  return [...seen.values()];
}
