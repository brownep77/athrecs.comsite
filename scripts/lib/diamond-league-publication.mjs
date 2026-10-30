/** Add only missing, reviewed competition days. Existing results/options/starts stay intact. */
export async function publishDiamondLeagueEditions(sql, publishing, meetings) {
  const sourceKey = "athrecs-code:diamond-league:2027:2026-10-30-v1";
  return sql.transaction(async (tx) => {
    await tx.query("select id from catalogue_publish_state where id=1 for update");
    const completed = await tx.query(
      "select id from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
      [sourceKey],
    );
    if (completed.length) return { skipped: true };
    const events = [],
      editions = [];
    for (const meeting of meetings) {
      const redirects = await tx.query(
        "select current_slug from slug_redirects where entity_type='event' and old_slug=$1",
        [meeting.slug],
      );
      const targetSlug = redirects[0]?.current_slug ?? meeting.slug;
      const rows = await tx.query("select * from events where slug=$1 for update", [targetSlug]);
      if (rows.length !== 1 || rows[0].sport !== "Athletics" || rows[0].surface !== "Track")
        throw new Error(`Expected existing track meeting: ${meeting.slug}`);
      const event = rows[0];
      const existing = await tx.query(
        "select event_date::text as date from editions where event_id=$1 and event_date between $2::date and $3::date",
        [event.id, meeting.startDate, meeting.endDate],
      );
      const dates = new Set(existing.map((row) => row.date));
      const missing = [];
      for (let date = meeting.startDate; date <= meeting.endDate;) {
        if (!dates.has(date)) missing.push(date);
        const next = new Date(`${date}T12:00:00Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        date = next.toISOString().slice(0, 10);
      }
      if (!missing.length) continue;
      const distances = await tx.query(
        "select distance_code from event_distances where event_id=$1",
        [event.id],
      );
      events.push({
        ...event,
        distances: [...new Set([...distances.map((d) => d.distance_code), "Track & field"])],
      });
      for (const date of missing)
        editions.push({
          eventSlug: event.slug,
          date,
          distance: "Track & field",
          distanceKm: 0,
          status: "TBC",
          source: meeting.sourceUrl,
          notes: `Diamond League 2027 calendar reviewed 30 October 2026. ${meeting.note ?? ""} Start time not yet announced.`,
        });
    }
    if (!editions.length) return { added: 0 };
    const actor = "athrecs-production-deployment@athrecs.com";
    const staged = await publishing.stageCatalogueBatch(
      { sourceKey, sourceUrl: meetings[0].sourceUrl, events, editions },
      actor,
      tx,
    );
    const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
    if (validation.status !== "ready")
      throw new Error(`Diamond League validation failed: ${JSON.stringify(validation)}`);
    const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx);
    return { added: editions.length, revisionId: result.revisionId };
  });
}
