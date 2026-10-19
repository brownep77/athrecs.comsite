/** Source IDs identify meetings; names and generated URLs can change. */
export function meetingId(series) {
  const id = (series.source_url || series.website || "").match(
    /^https:\/\/worldathletics\.org\/competition\/calendar-results\/results\/(\d+)\/?$/,
  )?.[1];
  if (!id) throw new Error(`Missing official meeting ID: ${series.slug}`);
  return id;
}

const editionKey = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
const ordered = (rows) => [...rows].sort((a, b) => editionKey(a).localeCompare(editionKey(b)));

/**
 * Routine seeding adds missing events but deliberately preserves live identities.
 * Stage corrections separately: applying them as new slugs/dates would duplicate
 * live meetings, while deleting absent source rows could lose retained history.
 */
export function mergeWorldAthleticsRefresh(
  existingSeries,
  existingEditions,
  refreshed,
  liveReview = [],
) {
  const byId = new Map();
  for (const series of existingSeries) {
    const id = meetingId(series);
    byId.set(id, [...(byId.get(id) || []), series]);
  }
  const series = [...existingSeries];
  const editions = [...existingEditions];
  const added = [],
    review = [],
    nameReview = [],
    liveRecordReview = [],
    seen = new Set();
  const nameKey = (row) => row.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  for (const item of refreshed) {
    const id = meetingId(item.series);
    if (seen.has(id)) throw new Error(`Duplicate refreshed World Athletics ID: ${id}`);
    seen.add(id);
    const existing = byId.get(id);
    if (!existing) {
      const live = liveReview.find((row) => row.sourceId === id);
      if (live) {
        liveRecordReview.push({ ...live, proposed: item });
        continue;
      }
      if (series.some((row) => row.slug === item.series.slug))
        throw new Error(`Slug collision: ${item.series.slug}`);
      const conflicts = series.filter((row) => nameKey(row) === nameKey(item.series));
      if (conflicts.length) {
        // The combined catalogue groups these names. Retain the proposed days
        // for reconciliation instead of silently losing them in that grouping.
        nameReview.push({
          sourceId: id,
          conflicts: conflicts.map((row) => row.slug),
          proposed: item,
        });
        continue;
      }
      series.push(item.series);
      editions.push(...item.editions);
      added.push({ sourceId: id, slug: item.series.slug, days: item.editions.length });
      continue;
    }
    const beforeEditions = existingEditions.filter((row) =>
      existing.some((source) => source.slug === row.seriesSlug),
    );
    const stableSlug = existing[0].slug;
    const proposed = {
      series: { ...item.series, slug: stableSlug },
      editions: item.editions.map((row) => ({ ...row, seriesSlug: stableSlug })),
    };
    if (
      existing.length !== 1 ||
      JSON.stringify(existing[0]) !== JSON.stringify(proposed.series) ||
      JSON.stringify(ordered(beforeEditions)) !== JSON.stringify(ordered(proposed.editions))
    )
      review.push({
        sourceId: id,
        before: { series: existing, editions: beforeEditions },
        proposed,
      });
  }
  const duplicates = [...byId]
    .filter(([, rows]) => rows.length > 1)
    .map(([sourceId, rows]) => ({ sourceId, slugs: rows.map((row) => row.slug) }));
  return { series, editions, added, review, nameReview, liveRecordReview, duplicates };
}
