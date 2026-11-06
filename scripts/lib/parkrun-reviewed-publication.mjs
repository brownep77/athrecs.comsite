import { isDeepStrictEqual } from "node:util";

export const PARKRUN_EVENT_METADATA_FIELDS = [
  "id",
  "slug",
  "sport",
  "name",
  "country",
  "county",
  "city",
  "area",
  "surface",
  "summary",
  "description",
  "organiser",
  "website",
];
const editableFields = PARKRUN_EVENT_METADATA_FIELDS.slice(3);
const actor = "athrecs-parkrun-review@athrecs.com";
const scheduledNote =
  "Scheduled weekly parkrun. Please check the event's own page for cancellations before travelling.";
const copy = (value) => JSON.parse(JSON.stringify(value));
const clock = (value) => (typeof value === "string" && value.length === 5 ? `${value}:00` : value);
const key = (slug, date, distance) => `${slug}|${date}|${distance}`;

function requireDate(value, label) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw new Error(`Invalid parkrun ${label}: ${value}`);
  return value;
}

function requireTime(value, label) {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))
    throw new Error(`Invalid parkrun ${label}: ${value}`);
}

function requireUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    /* Report a consistent review error below. */
  }
  if (!url || !["https:", "http:"].includes(url.protocol) || url.username || url.password)
    throw new Error(`Invalid parkrun ${label}: an http(s) URL is required`);
  return url;
}

/** Event subpages, http/https, www, tracking queries and fragments share an identity. */
function canonicalUrl(value) {
  if (!value) return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!["https:", "http:"].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    /* A malformed stored URL is not a decoded alias. */
  }
  path = path.replace(/\/+$/, "").toLowerCase();
  if (host.startsWith("parkrun.")) {
    path = path.split("/").filter(Boolean)[0] ?? "";
    if (!path || ["events", "results", "register", "cancellations", "about"].includes(path))
      return null;
    path = `/${path}`;
  }
  return `${host}${url.port ? `:${url.port}` : ""}${path}`;
}

const normalizedName = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const identityCountry = (country) =>
  ["England", "Scotland", "Wales", "Northern Ireland", "United Kingdom", "UK"].includes(country)
    ? "unitedkingdom"
    : normalizedName(country);

function sameIdentity(left, right) {
  const urls = new Set([left.website, left.source_url].map(canonicalUrl).filter(Boolean));
  return (
    [right.website, right.source_url].map(canonicalUrl).some((url) => url && urls.has(url)) ||
    (normalizedName(left.name) &&
      normalizedName(left.name) === normalizedName(right.name) &&
      identityCountry(left.country) === identityCountry(right.country))
  );
}

function assertNoIdentityCollision(reviewed, current) {
  for (const { event } of reviewed) {
    const duplicate = current.find((row) => row.slug !== event.slug && sameIdentity(event, row));
    if (duplicate)
      throw new Error(`Duplicate parkrun identity: ${event.slug} matches ${duplicate.slug}`);
  }
}

function validateReview(review) {
  if (!review?.sourceKey?.trim()) throw new Error("Parkrun review sourceKey is required");
  requireUrl(review.sourceUrl, "review source URL");
  if (typeof review.checkedAt !== "string" || Number.isNaN(Date.parse(review.checkedAt)))
    throw new Error("Parkrun review checkedAt is required");
  requireDate(review.fromDate, "fromDate");
  requireDate(review.toDate, "toDate");
  if (review.fromDate > review.toDate || review.fromDate < review.checkedAt.slice(0, 10))
    throw new Error("Parkrun publication window must start on or after the review date");
  const slugs = new Set();
  for (const item of review.events ?? []) {
    const { event, schedule, expected } = item;
    if (
      !event ||
      !/^[a-z0-9][a-z0-9-]*$/.test(event.slug) ||
      event.sport !== "Parkrun" ||
      typeof item.isNew !== "boolean" ||
      slugs.has(event.slug)
    )
      throw new Error(`Invalid or repeated reviewed parkrun identity: ${event?.slug}`);
    slugs.add(event.slug);
    if (editableFields.some((field) => typeof event[field] !== "string") || !event.name.trim())
      throw new Error(`Incomplete reviewed parkrun metadata: ${event.slug}`);
    requireUrl(event.website, `website for ${event.slug}`);
    if (
      !Array.isArray(event.distances) ||
      event.distances.some((distance) => !["5K", "2K"].includes(distance))
    )
      throw new Error(`Invalid reviewed parkrun distances: ${event.slug}`);
    if (item.isNew && expected)
      throw new Error(`New parkrun cannot have an existing baseline: ${event.slug}`);
    if (expected && PARKRUN_EVENT_METADATA_FIELDS.some((field) => !Object.hasOwn(expected, field)))
      throw new Error(`Incomplete parkrun metadata baseline: ${event.slug}`);
    if (!schedule) continue;
    requireDate(schedule.fromDate, `schedule fromDate for ${event.slug}`);
    requireTime(schedule.startTime, `start time for ${event.slug}`);
    requireUrl(schedule.sourceUrl, `schedule source for ${event.slug}`);
    if (
      !Number.isInteger(schedule.weekday) ||
      schedule.weekday < 0 ||
      schedule.weekday > 6 ||
      ![
        ["5K", 5],
        ["2K", 2],
      ].some(([code, km]) => schedule.distance === code && schedule.distanceKm === km) ||
      !event.distances.includes(schedule.distance)
    )
      throw new Error(`Invalid reviewed parkrun schedule: ${event.slug}`);
    const months = new Set();
    for (const season of schedule.seasonalStartTimes ?? []) {
      requireTime(season.startTime, `seasonal start time for ${event.slug}`);
      if (!Array.isArray(season.months) || !season.months.length)
        throw new Error(`Seasonal parkrun months required: ${event.slug}`);
      for (const month of season.months) {
        if (!Number.isInteger(month) || month < 1 || month > 12 || months.has(month))
          throw new Error(`Overlapping or invalid seasonal parkrun month: ${event.slug}`);
        months.add(month);
      }
    }
  }
  assertNoIdentityCollision(
    review.events ?? [],
    (review.events ?? []).map((item) => item.event),
  );
  const corrections = new Set();
  for (const correction of review.startCorrections ?? []) {
    if (
      !/^[a-z0-9][a-z0-9-]*$/.test(correction.slug) ||
      corrections.has(correction.slug) ||
      correction.distance !== "5K" ||
      correction.distanceKm !== 5
    )
      throw new Error(`Invalid or repeated parkrun start correction: ${correction.slug}`);
    corrections.add(correction.slug);
    requireDate(correction.fromDate, `correction fromDate for ${correction.slug}`);
    requireDate(correction.toDate, `correction toDate for ${correction.slug}`);
    if (correction.fromDate < review.fromDate || correction.toDate < correction.fromDate)
      throw new Error(
        `Parkrun correction is outside its reviewed future window: ${correction.slug}`,
      );
    requireTime(correction.expectedStartTime, `expected start for ${correction.slug}`);
    requireTime(correction.startTime, `corrected start for ${correction.slug}`);
    requireUrl(correction.sourceUrl, `correction source for ${correction.slug}`);
  }
}

async function identities(tx, review, slugs) {
  const all = await tx.query("select * from events where sport='Parkrun' order by id for update");
  const current = await tx.query(
    "select * from events where slug=any($1::text[]) order by slug for update",
    [slugs],
  );
  const aliases = await tx.query(
    "select old_slug,current_slug from slug_redirects where entity_type='event'",
  );
  for (const slug of slugs) {
    if (aliases.some((alias) => alias.old_slug === slug))
      throw new Error(`Reviewed parkrun slug is a historic alias: ${slug}`);
  }
  const bySlug = new Map(current.map((row) => [row.slug, row]));
  assertNoIdentityCollision(review.events ?? [], all);
  for (const item of review.events ?? []) {
    const row = bySlug.get(item.event.slug);
    if (item.isNew && aliases.some((alias) => alias.current_slug === item.event.slug))
      throw new Error(`New parkrun slug is a reserved redirect target: ${item.event.slug}`);
    if (item.isNew ? Boolean(row) : !row || row.sport !== "Parkrun")
      throw new Error(`Reviewed parkrun event identity changed: ${item.event.slug}`);
    if (
      item.expected &&
      PARKRUN_EVENT_METADATA_FIELDS.some((field) => (row[field] ?? null) !== item.expected[field])
    )
      throw new Error(`Reviewed parkrun event metadata changed: ${item.event.slug}`);
    if (
      item.expected &&
      Object.hasOwn(item.expected, "source_url") &&
      (row.source_url ?? null) !== item.expected.source_url
    )
      throw new Error(`Reviewed parkrun event source changed: ${item.event.slug}`);
    if (!item.isNew && !item.expected && !sameIdentity(item.event, row))
      throw new Error(`Unreviewed parkrun identity change: ${item.event.slug}`);
  }
  for (const correction of review.startCorrections ?? []) {
    if (bySlug.get(correction.slug)?.sport !== "Parkrun")
      throw new Error(`Expected existing parkrun for start correction: ${correction.slug}`);
  }
  return { current, bySlug };
}

async function snapshot(tx, current, fromDate, toDate) {
  const ids = current.map((event) => event.id);
  const distances = ids.length
    ? await tx.query(
        "select event_id,distance_code from event_distances where event_id=any($1::bigint[]) order by event_id,distance_code for update",
        [ids],
      )
    : [];
  const rows = ids.length
    ? await tx.query(
        `select row_to_json(ed)::text as record_json from editions ed
     where event_id=any($1::bigint[]) and event_date between $2::date and $3::date order by id for update`,
        [ids, fromDate, toDate],
      )
    : [];
  const editions = rows.map((row) => ({ record: JSON.parse(row.record_json), entryOptions: [] }));
  const options = editions.length
    ? await tx.query(
        "select row_to_json(o)::text as record_json from edition_entry_options o where edition_id=any($1::bigint[]) order by edition_id,id for update",
        [editions.map((edition) => edition.record.id)],
      )
    : [];
  const byId = new Map(editions.map((edition) => [edition.record.id, edition]));
  for (const row of options) {
    const option = JSON.parse(row.record_json);
    byId.get(option.edition_id).entryOptions.push(option);
  }
  return { events: copy(current), distances, editions };
}

/** Publish an explicit source-reviewed plan; never infer an inaugural or a start. */
export async function publishReviewedParkrunFixtures(sql, publishing, suppliedReview) {
  const review = copy(suppliedReview);
  validateReview(review);
  return sql.transaction(async (tx) => {
    await tx.query("set local lock_timeout='15s'");
    const state = await tx.query("select id from catalogue_publish_state where id=1 for update");
    if (state.length !== 1) throw new Error("Missing catalogue publication state");
    const completed = await tx.query(
      "select id,status from catalogue_import_batches where source_key=$1 and status in ('published','rolled_back')",
      [review.sourceKey],
    );
    if (completed.length)
      return {
        skipped: true,
        alreadyPublished: true,
        batchId: completed[0].id,
        status: completed[0].status,
      };
    // Row locks do not protect absent identities/dates. These bounded table locks
    // also exclude other import paths which do not take the publication-state lock.
    await tx.query(
      "lock table events, editions, event_distances, edition_entry_options, slug_redirects in share row exclusive mode",
    );
    const slugs = [
      ...new Set([
        ...(review.events ?? []).map((item) => item.event.slug),
        ...(review.startCorrections ?? []).map((item) => item.slug),
      ]),
    ];
    const initial = await identities(tx, review, slugs);
    const snapshotEnd = [
      review.toDate,
      ...(review.startCorrections ?? []).map((item) => item.toDate),
    ]
      .sort()
      .at(-1);
    const before = await snapshot(tx, initial.current, review.fromDate, snapshotEnd);
    for (const item of review.events ?? []) {
      if (!item.expected || !Object.hasOwn(item.expected, "distances")) continue;
      const actual = before.distances
        .filter((row) => row.event_id === item.expected.id)
        .map((row) => row.distance_code)
        .sort();
      if (!isDeepStrictEqual(actual, [...item.expected.distances].sort()))
        throw new Error(`Reviewed parkrun distances changed: ${item.event.slug}`);
    }
    const events = (review.events ?? [])
      .filter((item) => item.isNew || item.expected || item.schedule)
      .map((item) => ({
        ...(item.isNew || item.expected
          ? item.event
          : {
              ...Object.fromEntries(
                ["slug", "sport", ...editableFields].map((field) => [
                  field,
                  initial.bySlug.get(item.event.slug)[field],
                ]),
              ),
              distances: item.event.distances,
            }),
        reviewEvidence: { checkedAt: review.checkedAt, review: item.reviewEvidence ?? null },
      }));
    const editions = [],
      additions = [],
      corrected = new Map();
    let alreadyCorrectStarts = 0;
    for (const { event, schedule } of review.events ?? []) {
      if (!schedule) continue;
      const eventId = initial.bySlug.get(event.slug)?.id;
      // Any existing edition on a date is retained, including cancellation or a
      // legacy distance label; this helper must not create a competing fixture.
      const occupied = new Set(
        before.editions
          .filter((item) => item.record.event_id === eventId)
          .map((item) => item.record.event_date),
      );
      let date = [review.fromDate, schedule.fromDate].sort().at(-1);
      while (date <= review.toDate) {
        const day = new Date(`${date}T12:00:00Z`);
        if (day.getUTCDay() === schedule.weekday && !occupied.has(date)) {
          const startTime =
            schedule.seasonalStartTimes?.find((season) =>
              season.months.includes(day.getUTCMonth() + 1),
            )?.startTime ?? schedule.startTime;
          const edition = {
            eventSlug: event.slug,
            date,
            distance: schedule.distance,
            distanceKm: schedule.distanceKm,
            status: "TBC",
            startTime,
            source: schedule.sourceUrl,
            notes: scheduledNote,
            reviewEvidence: {
              checkedAt: review.checkedAt,
              kind: "reviewed-weekly-schedule",
              ...schedule,
            },
          };
          editions.push(edition);
          additions.push(edition);
        }
        day.setUTCDate(day.getUTCDate() + 1);
        date = day.toISOString().slice(0, 10);
      }
    }
    for (const correction of review.startCorrections ?? []) {
      const eventId = initial.bySlug.get(correction.slug).id;
      for (const { record } of before.editions) {
        if (
          record.event_id !== eventId ||
          record.event_date < correction.fromDate ||
          record.event_date > correction.toDate ||
          record.distance_code !== "5K" ||
          Number(record.distance_km) !== 5
        )
          continue;
        if (clock(record.start_time) === clock(correction.startTime)) {
          alreadyCorrectStarts += 1;
          continue;
        }
        if (clock(record.start_time) !== clock(correction.expectedStartTime))
          throw new Error(
            `Reviewed parkrun start changed: ${correction.slug} ${record.event_date}`,
          );
        const edition = {
          eventSlug: correction.slug,
          date: record.event_date,
          distance: record.distance_code,
          distanceKm: Number(record.distance_km),
          status: record.status,
          startTime: correction.startTime,
          source: record.source_url ?? undefined,
          notes: record.notes ?? undefined,
          reviewEvidence: {
            checkedAt: review.checkedAt,
            kind: "reviewed-start-correction",
            ...correction,
          },
        };
        // Omit entryUrl/options and end fields: the importer preserves these
        // verbatim. Passing entryUrl would synthesise an official entry provider.
        editions.push(edition);
        corrected.set(record.id, edition);
      }
    }
    const keys = editions.map((edition) => key(edition.eventSlug, edition.date, edition.distance));
    if (new Set(keys).size !== keys.length)
      throw new Error("Repeated parkrun edition in reviewed plan");
    if (!events.length && !editions.length)
      return {
        skipped: true,
        noChanges: true,
        addedEditions: 0,
        correctedStarts: 0,
        alreadyCorrectStarts,
      };
    const staged = await publishing.stageCatalogueBatch(
      { sourceKey: review.sourceKey, sourceUrl: review.sourceUrl, events, editions },
      actor,
      tx,
    );
    const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
    if (validation.status !== "ready")
      throw new Error(`Parkrun publication validation failed: ${JSON.stringify(validation)}`);
    const checked = await identities(tx, review, slugs);
    if (
      !isDeepStrictEqual(await snapshot(tx, checked.current, review.fromDate, snapshotEnd), before)
    )
      throw new Error("Parkrun catalogue changed after review checks; publication aborted");
    const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx, {
      reviewedEventMetadata: (review.events ?? [])
        .filter((item) => item.expected)
        .map((item) => ({ slug: item.event.slug, expected: item.expected })),
      expectedAbsentEvents: (review.events ?? [])
        .filter((item) => item.isNew)
        .map((item) => item.event.slug),
      preserveConfirmedStartTimes: corrected.size === 0,
    });
    if (result.withheldDistanceCount)
      throw new Error("A reviewed parkrun distance was unexpectedly held");
    const afterEvents = await tx.query(
      "select * from events where slug=any($1::text[]) order by slug",
      [slugs],
    );
    assertNoIdentityCollision(
      review.events ?? [],
      await tx.query("select * from events where sport='Parkrun'"),
    );
    for (const event of events) {
      const actual = afterEvents.find((row) => row.slug === event.slug);
      if (
        !actual ||
        actual.sport !== "Parkrun" ||
        editableFields.some((field) => actual[field] !== event[field])
      )
        throw new Error(`Parkrun metadata readback mismatch: ${event.slug}`);
    }
    const after = await snapshot(tx, afterEvents, review.fromDate, snapshotEnd);
    const afterById = new Map(after.editions.map((edition) => [edition.record.id, edition]));
    for (const original of before.editions) {
      const expected = copy(original);
      if (corrected.has(original.record.id))
        expected.record.start_time = corrected.get(original.record.id).startTime;
      if (!isDeepStrictEqual(afterById.get(original.record.id), expected))
        throw new Error(
          `Parkrun edition or entry evidence changed unexpectedly: ${original.record.id}`,
        );
    }
    const audit = await tx.query(
      "select entity_type,entity_key,before_json from catalogue_change_log where revision_id=$1",
      [result.revisionId],
    );
    for (const edition of additions) {
      const eventId = afterEvents.find((event) => event.slug === edition.eventSlug)?.id;
      const actual = after.editions.filter(
        (item) =>
          item.record.event_id === eventId &&
          item.record.event_date === edition.date &&
          item.record.distance_code === edition.distance,
      );
      const log = audit.find(
        (row) =>
          row.entity_type === "edition" &&
          row.entity_key === key(edition.eventSlug, edition.date, edition.distance),
      );
      if (
        actual.length !== 1 ||
        Number(actual[0].record.distance_km) !== edition.distanceKm ||
        actual[0].record.start_time !== edition.startTime ||
        actual[0].record.status !== "TBC" ||
        actual[0].record.notes !== scheduledNote ||
        actual[0].entryOptions.length ||
        !log ||
        log.before_json !== null
      )
        throw new Error(
          `New parkrun edition changed at publication: ${edition.eventSlug} ${edition.date}`,
        );
    }
    if (after.editions.length !== before.editions.length + additions.length)
      throw new Error("Unexpected parkrun edition count after publication");
    return {
      ...result,
      batchId: staged.batchId,
      addedEvents: (review.events ?? []).filter((item) => item.isNew).length,
      updatedEvents: (review.events ?? []).filter((item) => item.expected).length,
      addedEditions: additions.length,
      correctedStarts: corrected.size,
      alreadyCorrectStarts,
    };
  });
}
