/** Publish only reviewed edition metadata; preserve event identity and entry options. */
export async function publishCheckedFixtures(sql, publishing, details, review = {}) {
  const sourceKey = review.sourceKey ?? "athrecs:fixture-checks:norfolk:2026-10-20";
  const checkedAt = review.checkedAt ?? "2026-10-20";
  return sql.transaction(async (tx) => {
    await tx.query("select id from catalogue_publish_state where id=1 for update");
    const completed = await tx.query(
      "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
      [sourceKey],
    );
    if (completed.length) return { alreadyPublished: true };
    const editions = [];
    const reviewedDates = review.baseline
      ? new Set(Object.keys(review.baseline).map((key) => key.split("|").slice(0, 2).join("|")))
      : null;
    for (const [key, detail] of Object.entries(details).filter(
      ([key, value]) => value.checkedAt === checkedAt && (!reviewedDates || reviewedDates.has(key)),
    )) {
      const [slug, date] = key.split("|");
      const events = await tx.query("select id,slug from events where slug=$1 for update", [slug]);
      if (events.length !== 1) throw new Error(`Reviewed event missing or ambiguous: ${slug}`);
      for (const [distance, start] of Object.entries(detail.starts)) {
        if (review.baseline && !Object.hasOwn(review.baseline, `${key}|${distance}`)) continue;
        const rows = await tx.query(
          "select *,event_date::text as date from editions where event_id=$1 and event_date=$2::date and distance_code=$3 for update",
          [events[0].id, date, distance],
        );
        if (rows.length > 1) throw new Error(`Duplicate reviewed edition: ${key} ${distance}`);
        const row = rows[0];
        if (review.baseline) {
          const expected = review.baseline[`${key}|${distance}`];
          if (
            !row ||
            !expected ||
            Object.entries(expected).some(([field, value]) => row[field] !== value)
          )
            throw new Error(`Reviewed baseline changed: ${key} ${distance}`);
        }
        // Only this newly announced date is an authorised addition. Do not invent missing races.
        if (
          !row &&
          !(slug === "gear-10k-kings-lynn" && date === "2027-05-02" && distance === "10K")
        )
          continue;
        if (!row && events[0].id !== 43) throw new Error("GEAR canonical event changed");
        // New contradictory metadata requires a fresh review rather than an overwrite.
        if (start.time !== null && row?.start_time && row.start_time !== start.time) {
          const correction = review.startCorrections?.[`${key}|${distance}`];
          // Replacing a known time needs both the checked row baseline above and
          // an explicit reviewed before/after pair. Never allow a blanket override.
          if (
            !review.baseline ||
            correction?.from !== row.start_time ||
            correction?.to !== start.time
          )
            throw new Error(`Start changed since review: ${key} ${distance}`);
        }
        const note = [`Date checked ${detail.checkedAt} against ${detail.sourceUrl}.`, start.note]
          .filter(Boolean)
          .join(" ");
        editions.push({
          eventSlug: slug,
          date,
          distance,
          distanceKm: row ? Number(row.distance_km) : 10,
          status: row?.status ?? "Open",
          startTime: start.time ?? undefined,
          source: detail.sourceUrl,
          notes: [row?.notes, note].filter(Boolean).join("\n"),
        });
      }
    }
    if (!editions.length || editions.length > 30) throw new Error("Unexpected reviewed batch size");
    if (review.baseline && editions.length !== Object.keys(review.baseline).length)
      throw new Error("Reviewed batch is incomplete");
    const actor = "athrecs-production-deployment@athrecs.com";
    const staged = await publishing.stageCatalogueBatch(
      {
        sourceKey,
        sourceUrl: "https://www.athrecs.com/races/places/europe/united-kingdom/england/norfolk",
        editions,
      },
      actor,
      tx,
    );
    const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
    if (validation.status !== "ready")
      throw new Error(`Fixture checks failed validation: ${JSON.stringify(validation)}`);
    return publishing.publishCatalogueBatch(staged.batchId, actor, tx);
  });
}
