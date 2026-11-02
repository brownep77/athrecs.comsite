/** A bounded, repeatable publication through the existing catalogue audit ledger. */
export const COLOMBIA_SOURCE_KEY = "athrecs-code:colombia-running:2026-10-28-v1";

const clock = (value) => value ? (value.length === 5 ? `${value}:00` : value) : null;

export function colombiaPublicationPayload(data) {
  if (data.colombiaRaceSeries.length !== 18 || data.colombiaRaceEditions.length !== 52)
    throw new Error("Reviewed Colombia batch size changed");
  return {
    sourceKey: COLOMBIA_SOURCE_KEY,
    sourceUrl: "https://github.com/brownep77/athrecs.comsite/blob/main/docs/colombia-running-calendar/review-2026-10-28.json",
    events: data.colombiaRaceSeries.map(({ source_url: _source, featured: _featured, ...event }) => event),
    editions: data.colombiaRaceEditions.map(({ seriesSlug, publishAllDistances: _all, ...edition }) => ({
      ...edition,
      eventSlug: seriesSlug,
    })),
  };
}

export async function publishColombiaRunning(sql, publishing, data) {
  const payload = colombiaPublicationPayload(data);
  const actor = "athrecs-production-deployment@athrecs.com";
  return sql.transaction(async (tx) => {
    await tx.query("select id from catalogue_publish_state where id = 1 for update");
    const completed = await tx.query(
      "select id,status from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
      [payload.sourceKey],
    );
    if (completed.length) return { alreadyPublished: true, batchId: completed[0].id };

    // All three existing identities were read from their public AthRecs pages.
    // Stop if another review has changed them; never overwrite a concurrent edit.
    const reviewedEventMetadata = [];
    for (const [slug, expected] of Object.entries(data.colombiaExistingEventBaselines)) {
      const rows = await tx.query("select * from events where slug=$1 for update", [slug]);
      if (rows.length !== 1 || Object.entries(expected).some(([key, value]) => rows[0][key] !== value))
        throw new Error(`Colombia event changed since review: ${slug}`);
      reviewedEventMetadata.push({ slug, expected });
    }

    for (const edition of payload.editions) {
      const rows = await tx.query(
        `select ed.start_time from editions ed join events e on e.id=ed.event_id
         where e.slug=$1 and ed.event_date=$2::date and ed.distance_code=$3 for update of ed`,
        [edition.eventSlug, edition.date, edition.distance],
      );
      if (rows.length > 1) throw new Error(`Duplicate Colombia edition: ${edition.eventSlug} ${edition.date} ${edition.distance}`);
      const prior = clock(rows[0]?.start_time);
      if (prior && prior !== clock(edition.startTime))
        throw new Error(`Colombia start changed since review: ${edition.eventSlug} ${edition.distance}`);
    }

    const staged = await publishing.stageCatalogueBatch(payload, actor, tx);
    const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
    if (validation.status !== "ready")
      throw new Error(`Colombia publication validation failed: ${JSON.stringify(validation.errors ?? validation)}`);
    const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx, {
      reviewedEventMetadata,
      preserveConfirmedStartTimes: true,
      expectedAbsentEvents: payload.events
        .map((event) => event.slug)
        .filter((slug) => !Object.hasOwn(data.colombiaExistingEventBaselines, slug)),
    });
    if (result.withheldDistanceCount) throw new Error("A reviewed Colombia distance was unexpectedly held");

    // Verify identity as well as distance keys. A newly claimed slug must never
    // receive this programme while retaining another event's metadata.
    for (const event of payload.events) {
      const rows = await tx.query("select * from events where slug=$1", [event.slug]);
      const fields = ["name", "sport", "country", "county", "city", "area", "surface", "summary", "description", "organiser", "website"];
      if (rows.length !== 1 || fields.some((field) => rows[0][field] !== event[field]))
        throw new Error(`Colombia event identity readback mismatch: ${event.slug}`);
    }

    // Read the exact edition keys back before the transaction commits.
    for (const edition of payload.editions) {
      const rows = await tx.query(
        `select ed.event_date::text as date, ed.distance_km, ed.start_time, ed.end_date::text as end_date
         from editions ed join events e on e.id=ed.event_id
         where e.slug=$1 and ed.event_date=$2::date and ed.distance_code=$3`,
        [edition.eventSlug, edition.date, edition.distance],
      );
      if (rows.length !== 1 || Number(rows[0].distance_km) !== edition.distanceKm ||
          clock(rows[0].start_time) !== clock(edition.startTime) ||
          (edition.endDate && rows[0].end_date !== edition.endDate))
        throw new Error(`Colombia publication readback mismatch: ${edition.eventSlug} ${edition.distance}`);
    }
    return result;
  });
}
