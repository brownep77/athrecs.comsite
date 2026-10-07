// Resolve only permanent redirects that still identify their live target.
// Historic event metadata must not overwrite the canonical event after a merge.
export async function resolveCataloguePublisherRedirects(sql, batch) {
  const slugs = [
    ...new Set([
      ...batch.events.map((event) => event.slug),
      ...batch.editions.map((edition) => edition.eventSlug),
    ]),
  ];
  if (!slugs.length) return batch;
  const rows = await sql.query(
    `select redirect.old_slug, event.slug as current_slug
     from slug_redirects redirect
     join events event
       on event.id = redirect.entity_id and event.slug = redirect.current_slug
     where redirect.entity_type = 'event' and redirect.old_slug = any($1::text[])`,
    [slugs],
  );
  if (!rows.length) return batch;
  const aliases = new Map(rows.map((row) => [row.old_slug, row.current_slug]));
  const editions = new Map();
  for (const original of batch.editions) {
    const target = aliases.get(original.eventSlug);
    const edition = target ? { ...original, eventSlug: target } : original;
    const key = `${edition.eventSlug}|${edition.date}|${edition.distance}`;
    const previous = editions.get(key);
    if (previous && JSON.stringify(previous) !== JSON.stringify(edition)) {
      throw new Error(`Conflicting catalogue editions after resolving historic URL: ${key}`);
    }
    if (!previous) editions.set(key, edition);
  }
  return {
    ...batch,
    events: batch.events.filter((event) => !aliases.has(event.slug)),
    editions: [...editions.values()],
  };
}
