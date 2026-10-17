/** Preserve records and publish reviewed additions through the normal ledger. */
export async function publishEventSchemaCorrections(sql, publishing, corrections) {
  for (const correction of corrections) {
    await sql.transaction(async (tx) => {
      await tx.query("select id from catalogue_publish_state where id=1 for update");
      const sourceKey = `athrecs-code:event-schema:2026-10-15:${correction.slug}`;
      const completed = await tx.query(
        "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
        [sourceKey],
      );
      if (completed.length) return;
      const events = await tx.query("select * from events where slug=$1 for update", [
        correction.slug,
      ]);
      if (events.length !== 1) throw new Error(`Expected existing event: ${correction.slug}`);
      const event = events[0];
      if (event.organiser || event.website !== correction.expectedWebsite)
        throw new Error(`Organiser evidence changed: ${correction.slug}`);
      const distances = await tx.query(
        "select distance_code from event_distances where event_id=$1 order by distance_code",
        [event.id],
      );
      const editions = [];
      for (const patch of correction.editions) {
        const rows = await tx.query(
          "select *,event_date::text as date from editions where event_id=$1 and event_date=$2::date and distance_code=$3 for update",
          [event.id, patch.date, patch.distance],
        );
        if (rows.length !== 1)
          throw new Error(
            `Expected existing edition: ${correction.slug} ${patch.date} ${patch.distance}`,
          );
        const row = rows[0];
        if (
          row.start_time !== patch.expectedStart ||
          row.status !== patch.expectedStatus ||
          row.source_url !== correction.expectedWebsite ||
          row.end_date ||
          row.end_time
        )
          throw new Error(`Edition evidence changed: ${correction.slug} ${patch.distance}`);
        let entryOptions;
        if (patch.price !== undefined) {
          const options = await tx.query(
            "select id from edition_entry_options where edition_id=$1 for update",
            [row.id],
          );
          if (options.length || row.entry_url)
            throw new Error(`Entry options changed: ${correction.slug} ${patch.distance}`);
          entryOptions = [
            {
              providerCode: "official-sientries",
              providerName: "SiEntries — official Beacons entry",
              entryUrl: correction.sourceUrl,
              entryType: "official",
              status: "open",
              priceAmount: patch.price,
              priceCurrency: "GBP",
              opensAt: "2025-12-01",
              closesAt: "2026-11-01",
              sourceUrl: correction.sourceUrl,
              checkedAt: "2026-10-15",
              isVerified: true,
              isPrimary: true,
            },
          ];
        }
        editions.push({
          eventSlug: event.slug,
          date: row.date,
          distance: row.distance_code,
          distanceKm: Number(row.distance_km),
          status: entryOptions ? "Open" : row.status,
          startTime: patch.startTime ?? row.start_time ?? undefined,
          // Omit entryUrl for untouched options: the importer preserves it and
          // must not synthesize a replacement unverified official option.
          entryUrl: entryOptions ? correction.sourceUrl : undefined,
          entryOptions,
          source: row.source_url ?? undefined,
          endDate: patch.endDate,
          endTime: patch.endTime,
          endSourceUrl: patch.endSourceUrl,
          endCheckedAt: patch.endCheckedAt,
          notes: [row.notes, correction.note].filter(Boolean).join("\n"),
        });
      }
      const actor = "athrecs-production-deployment@athrecs.com";
      const staged = await publishing.stageCatalogueBatch(
        {
          sourceKey,
          sourceUrl: correction.sourceUrl,
          events: [
            {
              ...event,
              distances: distances.map((d) => d.distance_code),
              organiser: correction.organiser,
              website: correction.website,
            },
          ],
          editions,
        },
        actor,
        tx,
      );
      const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
      if (validation.status !== "ready")
        throw new Error(`Event correction validation failed: ${JSON.stringify(validation)}`);
      const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx);
      console.log(`[event-schema] ${correction.slug}: revision ${result.revisionId}`);
    });
  }
}

/** Separate identity revisions also repair deployments whose edition updates
 * completed while the default publisher correctly preserved event metadata. */
export async function publishEventOrganiserCorrections(sql, publishing, corrections) {
  for (const correction of corrections) {
    await sql.transaction(async (tx) => {
      await tx.query("select id from catalogue_publish_state where id=1 for update");
      const sourceKey = `athrecs-code:event-organisers:2026-10-15:${correction.slug}`;
      const completed = await tx.query(
        "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
        [sourceKey],
      );
      if (completed.length) return;
      const rows = await tx.query("select * from events where slug=$1 for update", [
        correction.slug,
      ]);
      if (rows.length !== 1 || rows[0].organiser || rows[0].website !== correction.expectedWebsite)
        throw new Error(`Organiser evidence changed: ${correction.slug}`);
      const event = rows[0];
      const distances = await tx.query(
        "select distance_code from event_distances where event_id=$1 order by distance_code",
        [event.id],
      );
      const actor = "athrecs-production-deployment@athrecs.com";
      const staged = await publishing.stageCatalogueBatch(
        {
          sourceKey,
          sourceUrl: correction.sourceUrl,
          events: [
            {
              ...event,
              distances: distances.map((d) => d.distance_code),
              organiser: correction.organiser,
              website: correction.website,
            },
          ],
        },
        actor,
        tx,
      );
      const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
      if (validation.status !== "ready") throw new Error("Organiser correction validation failed");
      const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx, {
        eventIdentityCorrections: [
          { slug: correction.slug, expectedWebsite: correction.expectedWebsite },
        ],
      });
      console.log(`[event-organisers] ${correction.slug}: revision ${result.revisionId}`);
    });
  }
}

/** Replace only our exact appended audit wording with reader-facing source notes.
 * Original notes and all record fields remain in the normal revision history. */
export async function publishEventPublicNotes(sql, publishing, corrections) {
  for (const correction of corrections) {
    await sql.transaction(async (tx) => {
      await tx.query("select id from catalogue_publish_state where id=1 for update");
      const sourceKey = `athrecs-code:event-public-notes:2026-10-15:${correction.slug}`;
      const completed = await tx.query(
        "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
        [sourceKey],
      );
      if (completed.length) return;
      if (!correction.note || !correction.publicNote?.trim())
        throw new Error(`Public note evidence missing: ${correction.slug}`);
      const editions = [];
      for (const patch of correction.editions) {
        const rows = await tx.query(
          "select ed.*,ed.event_date::text as date from editions ed join events e on e.id=ed.event_id where e.slug=$1 and ed.event_date=$2::date and ed.distance_code=$3 for update of ed",
          [correction.slug, patch.date, patch.distance],
        );
        if (rows.length !== 1) throw new Error(`Public note edition changed: ${correction.slug}`);
        const row = rows[0];
        const original = row.notes ?? "";
        if (original !== correction.note && !original.endsWith(`\n${correction.note}`))
          throw new Error(`Public note evidence changed: ${correction.slug}`);
        editions.push({
          eventSlug: correction.slug,
          date: row.date,
          distance: row.distance_code,
          distanceKm: Number(row.distance_km),
          status: row.status,
          startTime: row.start_time ?? undefined,
          source: row.source_url ?? undefined,
          notes: original.slice(0, -correction.note.length) + correction.publicNote,
        });
      }
      const actor = "athrecs-production-deployment@athrecs.com";
      const staged = await publishing.stageCatalogueBatch(
        { sourceKey, sourceUrl: correction.sourceUrl, editions }, actor, tx,
      );
      const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
      if (validation.status !== "ready") throw new Error("Public note validation failed");
      const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx);
      console.log(`[event-public-notes] ${correction.slug}: revision ${result.revisionId}`);
    });
  }
}
