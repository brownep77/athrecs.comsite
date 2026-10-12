export async function publishEventOfferCorrections(sql, publishing, eventOfferCorrections) {
  for (const correction of eventOfferCorrections) {
    await sql.transaction(async (tx) => {
      // Take the publication lock first, matching normal publication/rollback.
      // Keep source checks, staging and publication in one atomic transaction.
      await tx.query("select id from catalogue_publish_state where id=1 for update");
      await publishEventOfferCorrection(tx, publishing, correction);
    });
  }
}

async function publishEventOfferCorrection(sql, publishing, correction) {
  const actor = "athrecs-production-deployment@athrecs.com";
  const sourceKey = `athrecs-code:event-offers:2026-10-12:${correction.providerCode}`;
  const completed = await sql.query(
    "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back') limit 1",
    [sourceKey],
  );
  if (completed.length) return; // Never replay a completed or rolled-back correction.
  const [slug, date, distance] = correction.key.split("|");
  const rows = await sql.query(
    `select ed.*, o.id as option_id, row_to_json(o) as option
      from events e join editions ed on ed.event_id=e.id
      join edition_entry_options o on o.edition_id=ed.id
      where e.slug=$1 and ed.event_date=$2::date and ed.distance_code=$3 and o.provider_code=$4
      for update of ed, o`,
    [slug, date, distance, correction.providerCode],
  );
  if (rows.length !== 1) throw new Error(`Expected one existing option: ${correction.key}`);
  const row = rows[0];
  const o = row.option;
  if (!o.is_verified || o.entry_type !== "official" || o.source_url !== correction.sourceUrl)
    throw new Error(`Source/verification changed: ${correction.key}`);
  if (new Date(o.checked_at) > new Date(correction.patch.checkedAt)) {
    console.log(`[event-offers] preserving more recent evidence: ${correction.key}`);
    return;
  }
  if (o.status !== correction.previousStatus && o.status !== correction.patch.status)
    throw new Error(`Entry status changed: ${correction.key}`);
  const option = {
    providerCode: o.provider_code,
    providerName: o.provider_name,
    entryUrl: o.entry_url,
    entryType: o.entry_type,
    status: o.status,
    priceAmount: o.price_amount == null ? undefined : Number(o.price_amount),
    priceCurrency: o.price_currency ?? undefined,
    opensAt: o.opens_at ?? undefined,
    closesAt: o.closes_at ?? undefined,
    checkedAt: o.checked_at,
    sourceUrl: o.source_url,
    isVerified: o.is_verified,
    isPrimary: o.is_primary,
    ...correction.patch,
    notes: [o.notes, correction.patch.notes].filter(Boolean).join("\n"),
  };
  const staged = await publishing.stageCatalogueBatch(
    {
      sourceKey,
      sourceUrl: correction.sourceUrl,
      editions: [
        {
          eventSlug: slug,
          date,
          distance,
          distanceKm: Number(row.distance_km),
          status: row.status,
          entryUrl: row.entry_url ?? undefined,
          source: row.source_url ?? undefined,
          startTime: row.start_time ?? undefined,
          // The importer stores edition notes; keep the exact opening time
          // here as well as in the staged source payload (opens_at is a DATE).
          notes: [row.notes, correction.patch.notes].filter(Boolean).join("\n"),
          entryOptions: [option],
        },
      ],
    },
    actor,
    sql,
  );
  const validation = await publishing.validateCatalogueBatch(staged.batchId, sql);
  if (validation.status !== "ready")
    throw new Error(`Correction validation failed: ${JSON.stringify(validation)}`);
  const result = await publishing.publishCatalogueBatch(staged.batchId, actor, sql);
  console.log(`[event-offers] ${correction.key}: revision ${result.revisionId}`);
}
