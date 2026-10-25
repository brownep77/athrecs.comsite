import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import {
  archiveRowSchema,
  httpsSource,
  mapArchiveRows,
  suggestColumns,
  type ArchiveRow,
  type ColumnMapping,
} from "../results-archive/core";
import {
  createArchiveDataset,
  fingerprint,
  ingestArchiveBatch,
  reviewArchiveEntry,
  type ArchiveActor,
} from "../results-archive/service.server";
import { readTimingTable } from "../../../scripts/lib/result-evidence-audit.mjs";
import {
  finderProfilePreviewSchema,
  finderTime,
  finderProfileSaveSchema,
  type FinderProfileOption,
  type FinderProfilePreview,
  type FinderProfilePreviewInput,
  type FinderProfileReceipt,
  type FinderProfileSaveInput,
} from "./add-to-profile";

type Source = {
  row: ArchiveRow | null;
  original: Record<string, string>;
  headers: string[];
  mapping: ColumnMapping;
  name: string;
  date: string;
  distance: string;
  provider: string;
  url: string;
  editionId: number | null;
  entryId: number | null;
  revision: number | null;
  resultId: number | null;
  sourceRaceKey: string;
  historyReference: Record<string, unknown> | null;
  identity: string;
  version: unknown;
  issues: string[];
};
const normal = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");
const nullableText = (value: unknown) => (typeof value === "string" ? value : "");
function distanceKm(value: string): number | null {
  if (/^half(?:\s*marathon)?$/i.test(value)) return 21.0975;
  if (/^marathon$/i.test(value)) return 42.195;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(km|k|miles?|mi|m)$/i);
  return match
    ? Number(match[1]) *
        (/^mi/i.test(match[2]) ? 1.609344 : match[2].toLowerCase() === "m" ? 0.001 : 1)
    : null;
}

export async function findProfileAdditionOptions(
  sql: Sql,
  input: { kind: "athlete" | "edition"; q: string },
): Promise<FinderProfileOption[]> {
  const q = `%${escapeLike(input.q)}%`;
  if (input.kind === "edition")
    return sql<FinderProfileOption>`
    select ed.id,e.name,concat(ed.event_date::text,' · ',ed.distance_code,' · ',e.sport) as detail,null::text as slug
    from editions ed join events e on e.id=ed.event_id
    where e.name ilike ${q} and ed.event_date<=current_date
    order by ed.event_date desc,ed.id desc limit 40`;
  return sql<FinderProfileOption>`
    select a.id,a.display_name as name,a.slug,concat_ws(' · ',nullif(coalesce(c.name,a.source_club_name),''),nullif(a.country,''),'#'||a.id::text) as detail
    from athletes a left join clubs c on c.id=a.club_id
    where (a.display_name ilike ${q} or exists(select 1 from jsonb_array_elements_text(
      case when jsonb_typeof(a.profile_details->'aliases')='array' then a.profile_details->'aliases' else '[]'::jsonb end) alias where alias ilike ${q}))
      and coalesce(a.profile_details#>>'{nameReview,mode}','') not in ('merged_source_entry','results_only')
    order by a.display_name,a.id limit 40`;
}

async function sourceRow(sql: Sql, input: FinderProfilePreviewInput): Promise<Source> {
  if (input.source.kind === "archive") {
    const [r] = await sql<{
      id: number;
      revision: number;
      payload: ArchiveRow;
      review_state: string;
      canonical_result_id: number | null;
      edition_id: number;
      provider: string;
      source_url: string;
      source_race_key: string;
      name: string;
      date: string;
      distance: string;
    }>`
      select a.id,a.revision,a.payload,a.review_state,a.canonical_result_id,d.edition_id,d.provider,d.source_url,d.source_race_key,
        e.name,ed.event_date::text as date,ed.distance_code as distance
      from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id
      join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id where a.id=${input.source.entryId}`;
    if (!r) throw new Error("This archived result is no longer available. Search again.");
    const row = archiveRowSchema.parse(r.payload);
    return {
      row,
      original: row.original,
      headers: [],
      mapping: {},
      name: r.name,
      date: r.date,
      distance: r.distance,
      provider: r.provider,
      url: r.source_url,
      editionId: r.edition_id,
      entryId: r.id,
      revision: r.revision,
      resultId: r.canonical_result_id,
      sourceRaceKey: r.source_race_key,
      historyReference: null,
      identity: `archive:${r.id}`,
      version: r,
      issues:
        r.review_state === "held"
          ? ["This result is held. Resolve and reopen its archive review before adding it."]
          : [],
    };
  }
  const { captureId, ordinal } = input.source;
  const [c] = await sql<{
    provider: string;
    source_key: string;
    source_url: string;
    payload_hash: string;
    html_sha256: string;
    index: Record<string, unknown>;
    row: Record<string, unknown>;
  }>`
    select c.provider,c.source_key,c.source_url,c.payload_hash,c.html_sha256,c.payload->'index' as index,c.payload->'rows'->(${ordinal}-1) as row
    from result_archive_source_captures c join result_archive_capture_approvals a on a.id=c.approval_id
    where c.id=${captureId}::bigint and c.source_check='compared' and c.payload->>'publication'='staff_only'
      and a.scope='staff_only' and a.revoked_at is null
      and not exists(select 1 from result_archive_source_captures newer where newer.provider=c.provider and newer.source_key=c.source_key and (newer.captured_at,newer.id)>(c.captured_at,c.id))`;
  if (!c?.row)
    throw new Error("This capture was withdrawn, superseded or has no such row. Search again.");
  const raw = c.row.original;
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    Object.keys(raw).length > 80 ||
    Object.entries(raw).some(
      ([key, value]) => key.length > 160 || typeof value !== "string" || value.length > 4000,
    )
  )
    throw new Error("This capture needs source-column review in the collected results workspace.");
  const original = raw as Record<string, string>;
  const reserved = [
    "_finder_name",
    "_finder_source_key",
    "_finder_status",
    "_finder_club",
    "_finder_category",
    "_finder_gender",
  ];
  if (reserved.some((key) => key in original))
    throw new Error("Reserved source headings need archive review.");
  const table = nullableText(c.row.tableKey);
  const locator = nullableText(c.row.sourceRow) || nullableText(c.row.bib);
  const issues: string[] = [];
  if (!table || !locator)
    issues.push(
      "This capture has no stable table and source-row locator. Review it in collected results first.",
    );
  if (
    [c.row.team, c.row.leg, original.Team, original.Leg, original.Heat].some(
      (value) => typeof value === "string" && value.trim(),
    )
  )
    issues.push(
      "This capture contains a team, relay leg or heat. Use its sport-specific review workflow.",
    );
  const sourceRaceKey = `finder:${fingerprint([c.provider, c.source_key, table])}`;
  const stableKey = `row:${locator}`;
  const columns = {
    ...original,
    _finder_name: nullableText(c.row.name),
    _finder_source_key: stableKey,
    _finder_status: nullableText(c.row.status),
    _finder_club: nullableText(c.row.club),
    _finder_category: nullableText(c.row.category),
    _finder_gender: nullableText(c.row.gender),
  };
  const headers = Object.keys(columns);
  const suggested = suggestColumns(headers);
  const mapping: ColumnMapping = input.mapping
    ? { ...input.mapping }
    : {
        ...suggested,
        name: "_finder_name",
        sourceKey: "_finder_source_key",
        ...(suggested.status ? {} : { status: "_finder_status" }),
        ...(suggested.club ? {} : { club: "_finder_club" }),
        ...(suggested.category ? {} : { category: "_finder_category" }),
        ...(suggested.gender ? {} : { gender: "_finder_gender" }),
      };
  // The source locator and retained normalized name cannot be replaced by another column.
  mapping.name = "_finder_name";
  mapping.sourceKey = "_finder_source_key";
  let row: ArchiveRow | null = null;
  try {
    row = mapArchiveRows({ headers, rows: [Object.values(columns)] }, mapping)[0];
  } catch (error) {
    issues.push(error instanceof Error ? error.message : "Check the source-column mapping.");
  }
  // TRT has an independent heading-based reader. Compare every supplied timing and placing,
  // including nulls, so a changed mapping cannot silently omit or relabel a source value.
  if (
    row &&
    (c.provider === "Total Race Timing" ||
      /^https:\/\/(www\.)?totalracetiming\.co\.uk\//i.test(c.source_url))
  ) {
    const source = readTimingTable({
      headers: Object.keys(original),
      rows: [Object.values(original)],
    })?.[0];
    if (!source)
      issues.push(
        "The independent Total Race Timing comparison cannot read these original headings.",
      );
    else if (
      normal(source.name) !== normal(row.name) ||
      String(source.bib ?? "").trim() !== row.bib ||
      source.chip !== row.chipSeconds ||
      source.gun !== row.gunSeconds ||
      (source.time ?? source.chip ?? source.gun) !== row.finishSeconds ||
      source.overall !== row.overallPlace ||
      source.gender !== row.genderPlace ||
      source.categoryPlace !== row.categoryPlace
    )
      issues.push(
        "The independent Total Race Timing comparison found a name, timing or placing mismatch. Check every mapped heading.",
      );
  }
  const [staged] = await sql<{
    id: number;
    revision: number;
    canonical_result_id: number | null;
    edition_id: number;
    review_state: string;
  }>`
    select a.id,a.revision,a.canonical_result_id,d.edition_id,a.review_state from result_archive_entries a
    join result_archive_datasets d on d.id=a.dataset_id where d.provider=${c.provider} and d.source_race_key=${sourceRaceKey} and a.source_key=${stableKey} limit 1`;
  if (staged?.review_state === "held")
    issues.push("This source row is held in the archive. Resolve its review first.");
  if (staged && input.editionId && staged.edition_id !== input.editionId)
    issues.push(
      "This source row has already been recorded against another race edition. Review the existing archive entry.",
    );
  return {
    row,
    original: columns,
    headers,
    mapping,
    name: nullableText(c.index.name),
    date: nullableText(c.row.date) || nullableText(c.index.date),
    distance: nullableText(c.row.distanceLabel),
    provider: c.provider,
    url: c.source_url,
    editionId: staged?.edition_id ?? input.editionId ?? null,
    entryId: staged?.id ?? null,
    revision: staged?.revision ?? null,
    resultId: staged?.canonical_result_id ?? null,
    sourceRaceKey,
    historyReference: { sourceKey: c.source_key, tableKey: table, sourceRow: c.row.sourceRow },
    identity: `capture:${sourceRaceKey}:${stableKey}`,
    version: {
      captureId,
      ordinal,
      payloadHash: c.payload_hash,
      htmlHash: c.html_sha256,
      row: c.row,
      index: c.index,
      staged,
    },
    issues,
  };
}

async function plan(sql: Sql, input: FinderProfilePreviewInput, actor: ArchiveActor) {
  const source = await sourceRow(sql, input);
  const [edition] = source.editionId
    ? await sql<{
        id: number;
        name: string;
        date: string;
        distance: string;
        km: number;
        event_id: number;
      }>`
    select ed.id,ed.event_id,e.name,ed.event_date::text as date,ed.distance_code as distance,ed.distance_km as km
    from editions ed join events e on e.id=ed.event_id where ed.id=${source.editionId}`
    : [];
  const [target] = input.athleteId
    ? await sql<{
        id: number;
        name: string;
        slug: string;
        visibility: string;
        mode: string;
        club: string;
        owners: string[];
      }>`
    select a.id,a.display_name as name,a.slug,a.profile_visibility as visibility,coalesce(a.profile_details#>>'{nameReview,mode}','') as mode,
      coalesce(c.name,a.source_club_name,'') as club,array(select l.user_id from athlete_account_links l where l.athlete_id=a.id and l.status='active' order by l.user_id) as owners
    from athletes a left join clubs c on c.id=a.club_id where a.id=${input.athleteId}`
    : [];
  const issues = [...source.issues];
  const validSourceUrl = httpsSource.safeParse(source.url);
  if (!validSourceUrl.success)
    issues.push("The source link needs review before adding this result.");
  if (!target) issues.push("Choose an existing athlete profile.");
  if (target && ["merged_source_entry", "results_only"].includes(target.mode))
    issues.push("Choose the athlete's active profile, not a retired or unnamed source record.");
  if (target?.owners.length && !target.owners.includes(actor.userId))
    issues.push(
      "This profile is managed by another account. Its owner must confirm the result through the athlete review workflow.",
    );
  if (!edition) issues.push("Choose the correct race edition and distance.");
  if (edition && edition.date > new Date().toISOString().slice(0, 10))
    issues.push("A result cannot be added for a future race.");
  if (input.source.kind === "capture" && edition) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.date) || source.date !== edition.date)
      issues.push(
        "The selected edition date does not match the captured race date. Resolve the date first.",
      );
    const km = distanceKm(source.distance);
    if (
      !source.distance ||
      (normal(source.distance) !== normal(edition.distance) &&
        (km === null || Math.abs(km - Number(edition.km)) > 0.001))
    )
      issues.push(
        "The selected distance does not match the captured row. Resolve the distance first.",
      );
  }
  const row = source.row;
  if (row?.team || row?.leg)
    issues.push("Team and relay-leg results need their sport-specific review workflow.");
  if (
    row &&
    (row.status === "unknown" ||
      (row.status === "finished" && !(row.finishSeconds && row.finishSeconds > 0)))
  )
    issues.push("Check the finish status and time before adding this result.");
  if (
    row &&
    edition &&
    /parkrun/i.test(edition.name) &&
    (row.chipSeconds !== null || row.gunSeconds !== null)
  )
    issues.push("parkrun is not chip timed. Map its published time as finish time only.");
  const existingRows = await sql<{
    resultId: number;
    athleteId: number;
    name: string;
    slug: string;
    value: Record<string, unknown>;
  }>`
    select r.id as "resultId",r.athlete_id as "athleteId",a.display_name as name,a.slug,to_jsonb(r) as value
    from results r join athletes a on a.id=r.athlete_id join editions existing_edition on existing_edition.id=r.edition_id where r.id=${source.resultId}
      or (r.athlete_id=${target?.id ?? null} and existing_edition.event_id=${edition?.event_id ?? null} and existing_edition.event_date=${edition?.date ?? null}::date and (existing_edition.distance_code=${edition?.distance ?? null} or abs(existing_edition.distance_km-${edition?.km ?? null})<0.001))
      or (r.edition_id=${edition?.id ?? null} and ${row?.bib ?? ""}<>'' and r.bib=${row?.bib ?? ""})
    order by r.id limit 3`;
  const existing = existingRows[0] ?? null;
  if (existing)
    issues.push(
      existing.athleteId === target?.id
        ? "This athlete already has a result for this edition. Nothing will be added twice."
        : `This result is already attached to ${existing.name}. Review or merge the athlete profiles before moving results.`,
    );
  // Histories are another profile read path. Do not create a second performance there.
  const histories =
    target && edition
      ? await sql<{ provider: string; external_id: string; performance: unknown }>`
    select h.provider,h.external_id,p.value as performance from athlete_source_histories h cross join lateral jsonb_array_elements(h.performances) p(value)
    where h.athlete_id=${target.id} and left(coalesce(p.value->>'date',''),10)=${edition.date}
      and (regexp_replace(lower(coalesce(p.value->>'meeting',p.value->>'event','')),'[^[:alnum:]]','','g')=regexp_replace(lower(${edition.name}),'[^[:alnum:]]','','g')
        or regexp_replace(lower(coalesce(p.value->>'discipline','')),'[^[:alnum:]]','','g')=regexp_replace(lower(${edition.distance}),'[^[:alnum:]]','','g')) limit 3`
      : [];
  if (histories.length)
    issues.push(
      "A possible result for this race is already in the athlete's source history. Review it before adding another.",
    );
  const historyAssignments =
    source.historyReference && target
      ? await sql<{ athlete_id: number; name: string; external_id: string }>`
    select h.athlete_id,a.display_name as name,h.external_id from athlete_source_histories h
    join athletes a on a.id=h.athlete_id where h.provider=${source.provider}
      and h.performances @> ${JSON.stringify([{ archiveReference: source.historyReference }])}::jsonb limit 3`
      : [];
  if (historyAssignments.length)
    issues.push(
      `This captured row is already held in ${historyAssignments.map((h) => h.name).join(", ")}'s source history. Review that profile before adding another copy.`,
    );
  const version = fingerprint({
    source: source.version,
    mapping: source.mapping,
    row,
    edition,
    target,
    existing: existingRows,
    histories,
    historyAssignments,
  });
  const preview: FinderProfilePreview = {
    version,
    row,
    sourceName: source.provider,
    sourceUrl: validSourceUrl.success ? validSourceUrl.data : "",
    original: source.original,
    headers: source.headers,
    mapping: source.mapping,
    raceName: source.name,
    raceDate: source.date,
    distance: source.distance,
    edition: edition
      ? { id: edition.id, name: edition.name, date: edition.date, distance: edition.distance }
      : null,
    athlete: target
      ? { id: target.id, name: target.name, slug: target.slug, detail: target.club }
      : null,
    visibility: target?.visibility === "public" ? "public" : "private",
    issues,
    existing: existing
      ? {
          resultId: existing.resultId,
          athleteId: existing.athleteId,
          name: existing.name,
          slug: existing.slug,
        }
      : null,
  };
  return { preview, source, target };
}

export async function previewProfileAddition(
  sql: Sql,
  raw: FinderProfilePreviewInput,
  actor: ArchiveActor,
): Promise<FinderProfilePreview> {
  const input = finderProfilePreviewSchema.parse(raw);
  return sql.transaction(async (tx) => {
    await tx.query("set transaction read only");
    await tx.query("set local statement_timeout='10s'");
    return (await plan(tx, input, actor)).preview;
  });
}

export async function saveProfileAddition(
  sql: Sql,
  raw: FinderProfileSaveInput,
  actor: ArchiveActor,
): Promise<FinderProfileReceipt> {
  const input = finderProfileSaveSchema.parse(raw);
  if (!actor.userId || !actor.staffEmail) throw new Error("Staff sign-in required.");
  const requestHash = fingerprint(input);
  return sql.transaction(async (tx) => {
    await tx.query("set transaction isolation level serializable");
    await tx.query("set local statement_timeout='25s'");
    await tx.query("set local lock_timeout='5s'");
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:finder-add'),hashtext(${input.requestId}))`;
    const [previous] = await tx<{
      actor_user_id: string;
      after_value: { requestHash: string; receipt: FinderProfileReceipt };
    }>`
      select actor_user_id,after_value from network_audit_log where action='athlete.finder_result_added' and entity_id=${input.requestId}`;
    if (previous) {
      if (
        previous.actor_user_id !== actor.userId ||
        previous.after_value.requestHash !== requestHash
      )
        throw new Error("This save reference is already in use. Review again.");
      return { ...previous.after_value.receipt, replay: true };
    }
    const { preview, source, target } = await plan(tx, input, actor);
    if (preview.version !== input.version)
      throw new Error(
        "The result, profile or duplicate checks changed. Reload the review before adding it.",
      );
    if (preview.issues.length || !target || !preview.edition || !source.row)
      throw new Error(preview.issues[0] ?? "Complete the result review first.");
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:finder-source'),hashtext(${source.identity}))`;
    let entryId = source.entryId,
      revision = source.revision;
    if (input.source.kind === "capture") {
      const dataset = await createArchiveDataset(
        tx,
        {
          editionId: preview.edition.id,
          provider: source.provider,
          sourceRaceKey: source.sourceRaceKey,
          sourceUrl: source.url,
          permissionNote: input.note,
          expectedRows: null,
        },
        actor,
      );
      await ingestArchiveBatch(
        tx,
        { requestId: randomUUID(), datasetId: dataset.id, rows: [source.row] },
        actor,
      );
      const [entry] = await tx<{
        id: number;
        revision: number;
      }>`select id,revision from result_archive_entries where dataset_id=${dataset.id} and source_key=${source.row.sourceKey}`;
      entryId = entry.id;
      revision = entry.revision;
    }
    if (!entryId || !revision) throw new Error("The selected source row could not be prepared.");
    const saved = await reviewArchiveEntry(
      tx,
      {
        entryId,
        revision,
        action: "link",
        athleteId: target.id,
        identityNote: input.note,
        sourceChecked: true,
      },
      actor,
    );
    if (!saved.resultId) throw new Error("The result was not added.");
    // Only the newly created result is published, using the selected profile's
    // existing visibility. Profile privacy, ownership and other results stay intact.
    await tx`update results set result_visibility=${preview.visibility},result_details=result_details||${JSON.stringify(
      {
        clubAtRace: source.row.club,
        timing: {
          finishSeconds: source.row.finishSeconds,
          finishText: source.row.finishSeconds === null ? "" : finderTime(source.row.finishSeconds),
          chipSeconds: source.row.chipSeconds,
          gunSeconds: source.row.gunSeconds,
        },
        finderAttachment: { source: input.source, requestId: input.requestId },
      },
    )}::jsonb where id=${saved.resultId} and athlete_id=${target.id}`;
    const receipt: FinderProfileReceipt = {
      resultId: saved.resultId,
      athleteId: target.id,
      name: target.name,
      slug: target.slug,
      visibility: preview.visibility,
      replay: false,
    };
    await tx`insert into network_audit_log(actor_user_id,actor_email,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},${actor.staffEmail},'athlete.finder_result_added','result',${input.requestId},
        ${JSON.stringify({ source: input.source, version: input.version, sourceSnapshot: source.version, sourceAndIdentityChecked: true, publicationConfirmed: true })}::jsonb,
        ${JSON.stringify({ requestHash, receipt })}::jsonb,${input.note})`;
    return receipt;
  });
}
