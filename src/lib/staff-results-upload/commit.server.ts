import { createHash } from "node:crypto";
import { getSql, type Sql } from "../db";
import { normalize, slug, runningClub } from "./core";
import { prepareUpload, planUpload, type UploadInput, type ReviewedRow } from "./service.server";

export type ImportDecision = { index: number; mode: "new" | "link"; athleteId?: number; identityNote: string };
export type ImportRequest = {
  upload: UploadInput; reviewHash: string; requestId: string; decisions: ImportDecision[];
  rightsConfirmed: true; identitiesConfirmed: true; confirmation: "IMPORT SELECTED RESULTS";
};
export type ImportReceipt = {
  runId: string; editionId: number; createdProfiles: number; linkedProfiles: number;
  importedResults: number; heldRows: number; resultsPath: string; replay: boolean;
};
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const round = (value: number | null) => value === null ? null : Math.round(value);

/** No deployment hook: called only by the authenticated staff POST after explicit review. */
export async function commitUpload(request: ImportRequest, actor: { userId: string; staffEmail: string }): Promise<ImportReceipt> {
  if (!actor.userId || !actor.staffEmail) throw new Error("An authenticated staff identity is required.");
  if (request.rightsConfirmed !== true || request.identitiesConfirmed !== true || request.confirmation !== "IMPORT SELECTED RESULTS")
    throw new Error("Confirm publication authority and the selected identities before importing.");
  if (!/^[a-f0-9]{64}$/.test(request.reviewHash) || !/^[a-f0-9-]{36}$/i.test(request.requestId)) throw new Error("Check the file again before importing.");
  const choices = request.decisions;
  if (!choices.length || choices.length > 5000 || new Set(choices.map(d => d.index)).size !== choices.length)
    throw new Error("Select 1–5,000 distinct checked rows.");
  if (choices.some(d => !Number.isSafeInteger(d.index) || d.index < 1 || d.identityNote.trim().length < 12 || d.identityNote.length > 1000))
    throw new Error("Each selected identity needs a review note.");
  // Fetch and compare the official source before opening a write transaction.
  const prepared = await prepareUpload(request.upload);
  const fingerprint = digest({ upload: request.upload, decisions: choices, rightsConfirmed: true, identitiesConfirmed: true });
  const sql = await getSql();
  return sql.transaction(async tx => {
    await tx.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    await tx.query("SET LOCAL lock_timeout = '5s'");
    await tx.query("SET LOCAL statement_timeout = '25s'");
    await tx`select pg_advisory_xact_lock(hashtext('athrecs:reviewed-results'), hashtext(${request.upload.sourceUrl + '|' + request.upload.date + '|' + request.upload.distance}))`;
    const previous = await tx<{ file_sha256: string; requested_by_user_id: string; status: string }>`
      select file_sha256, requested_by_user_id, status from result_ingestion_runs where id=${request.requestId} for update`;
    if (previous.length) {
      if (previous[0].file_sha256 !== fingerprint || previous[0].requested_by_user_id !== actor.userId || previous[0].status !== "completed")
        throw new Error("This import request identifier is already in use. Check the file again.");
      return receipt(tx, request.requestId, true);
    }
    // Re-evaluate the full live public/private directory in this transaction.
    const review = await planUpload(tx, request.upload, prepared.rows, prepared.source);
    if (review.reviewHash !== request.reviewHash) throw new Error("The source or athlete matches changed. Check the file again; nothing was imported.");
    const byIndex = new Map(review.rows.map(row => [row.index, row]));
    const selected: { row: ReviewedRow; choice: ImportDecision }[] = [];
    const linked = new Set<number>();
    for (const choice of choices) {
      const row = byIndex.get(choice.index);
      if (!row || row.issues.length || row.state === "blocked" || row.state === "duplicate")
        throw new Error("A selected row is blocked or already imported. Check the file again.");
      if (choice.mode === "new") {
        if (row.state !== "new" || row.candidates.length || choice.athleteId !== undefined)
          throw new Error("A possible existing athlete cannot be bulk-created as a new profile.");
      } else if (choice.mode === "link") {
        const candidate = row.candidates.find(c => c.id === choice.athleteId);
        if (!candidate || !candidate.id || candidate.managed || candidate.visibility !== "public")
          throw new Error("Only an explicitly reviewed, public, unmanaged profile can be linked here. Protected profiles use their owner workflow.");
        if (linked.has(candidate.id)) throw new Error("Two race entries cannot be assigned to the same athlete in one edition.");
        linked.add(candidate.id);
      } else throw new Error("Unknown review decision.");
      selected.push({ row, choice });
    }
    // Lock linked profiles and recheck ownership/visibility; do not change them.
    if (linked.size) {
      const locked = await tx<{ id: number; profile_visibility: string; managed: boolean }>`
        select a.id,a.profile_visibility,
          exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed
        from athletes a where a.id=any(${[...linked]}::integer[]) order by a.id for update of a`;
      if (locked.length !== linked.size || locked.some(a => a.managed || a.profile_visibility !== "public"))
        throw new Error("A selected profile's ownership or visibility changed. Nothing was imported.");
    }
    let event = review.event;
    if (!event) {
      const [created] = await tx<{ id: number; slug: string; name: string; sport: string }>`
        insert into events(slug,name,sport,country,county,city,surface,summary)
        values(${slug(request.upload.eventName)},${request.upload.eventName},'Running','','','','Unknown',${request.upload.eventName})
        returning id,slug,name,sport`;
      event = created;
    }
    await tx`insert into event_distances(event_id,distance_code) values(${event.id},${request.upload.distance}) on conflict do nothing`;
    let editionId = review.edition?.id;
    if (!editionId) {
      const [edition] = await tx<{ id: number }>`
        insert into editions(event_id,event_date,distance_code,distance_km,status,source_url)
        values(${event.id},${request.upload.date}::date,${request.upload.distance},${request.upload.distanceKm},'Finished',${request.upload.sourceUrl}) returning id`;
      editionId = edition.id;
    }
    if (linked.size) {
      const existing = await tx<{ id: number }>`select id from results where edition_id=${editionId} and athlete_id=any(${[...linked]}::integer[])`;
      if (existing.length) throw new Error("A selected athlete already has a result for this edition. Nothing was overwritten.");
    }
    const clubs = await tx<{ id: number; name: string }>`select id,name from clubs`;
    const newEntries = selected.filter(s => s.choice.mode === "new").map(({ row }) => {
      const label = runningClub(row.club), matches = label ? clubs.filter(c => normalize(c.name) === normalize(label)) : [];
      return { index: row.index, slug: `${slug(row.name).slice(0,120)}-${digest([request.upload.sourceUrl,request.upload.date,request.upload.distance,row.bib]).slice(0,12)}`,
        name: row.name, given: row.givenName || null, family: row.familyName || null,
        gender: ["M","F","U","X"].includes(row.gender) ? row.gender : "U", club_id: matches.length === 1 ? matches[0].id : null, club: label };
    });
    const newIds = new Map<number, number>();
    if (newEntries.length) {
      const created = await tx<{ id: number; slug: string }>`
        insert into athletes(slug,display_name,given_name,family_name,gender,club_id,source_club_name,city,county,country,bio,profile_visibility)
        select r.slug,r.name,r.given,r.family,r.gender,r.club_id,r.club,'','','','','public'
        from jsonb_to_recordset(${JSON.stringify(newEntries)}::jsonb)
          as r(slug text,name text,given text,family text,gender text,club_id integer,club text)
        returning id,slug`;
      if (created.length !== newEntries.length) throw new Error("Not all selected profiles were created; the batch was rolled back.");
      for (const entry of newEntries) {
        const athlete = created.find(a => a.slug === entry.slug);
        if (!athlete) throw new Error("New profile identity could not be resolved.");
        newIds.set(entry.index, athlete.id);
      }
      await tx`insert into athlete_identifiers(athlete_id) select unnest(${created.map(a => a.id)}::integer[]) on conflict do nothing`;
    }
    const runId = request.requestId;
    await tx`insert into result_ingestion_runs
      (id,sport,source_name,source_url,acquisition_method,file_name,file_sha256,status,requested_by_user_id,requested_by_email,rows_detected,notes)
      values(${runId},'Running','Total Race Timing',${request.upload.sourceUrl},'upload',${request.upload.filename},${fingerprint},'processing',${actor.userId},${actor.staffEmail},${review.rows.length},'Staff-confirmed selected-row import; exact source times retained in result_details. Unselected records were not changed.')`;
    const checkedAt = new Date().toISOString();
    const payload = selected.map(({ row, choice }) => ({
      athlete_id: choice.mode === "new" ? newIds.get(row.index) : choice.athleteId,
      bib: row.bib, place: row.place, gp: row.genderPlace, cp: row.categoryPlace, category: row.category,
      finish: Math.round(row.finishSeconds), chip: round(row.chipSeconds), gun: round(row.gunSeconds),
      details: {
        timing: { finishSeconds: row.finishSeconds, chipSeconds: row.chipSeconds, gunSeconds: row.gunSeconds,
          finishText: row.chipText || row.gunText || row.timeText, chipText: row.chipText, gunText: row.gunText },
        note: `Source timing precision retained. Timing basis selected by staff: ${request.upload.timingBasis}.`,
        sourceRow: { url: request.upload.sourceUrl, bib: row.bib, name: row.name, club: row.club, gender: row.gender, sourceHash: review.sourceHash },
        verification: { status: "source_checked", method: "independent_source_comparison_and_staff_identity_review", checkedAt,
          actor: actor.staffEmail, identityNote: choice.identityNote, timingBasis: request.upload.timingBasis, timingBasisMethod: "staff_selection" }
      }
    }));
    const inserted = await tx<{ id: number }>`
      insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,gender_place,category_place,category,result_source,source_url,result_visibility,ingestion_run_id,result_details)
      select ${editionId},r.athlete_id,'finished',r.finish,r.chip,r.gun,r.bib,r.place,r.gp,r.cp,r.category,'Total Race Timing',${request.upload.sourceUrl},'public',${runId},r.details
      from jsonb_to_recordset(${JSON.stringify(payload)}::jsonb)
        as r(athlete_id integer,finish integer,chip integer,gun integer,bib text,place integer,gp integer,cp integer,category text,details jsonb)
      returning id`;
    if (inserted.length !== selected.length) throw new Error("Not all selected results were inserted; the batch was rolled back.");
    await tx`insert into result_source_references(result_id,source_url,source_name)
      select unnest(${inserted.map(r => r.id)}::integer[]),${request.upload.sourceUrl},'Total Race Timing' on conflict do nothing`;
    const outcome: ImportReceipt = { runId, editionId, createdProfiles: newEntries.length, linkedProfiles: linked.size,
      importedResults: inserted.length, heldRows: review.rows.length - selected.length, resultsPath: `/results/${editionId}`, replay: false };
    await tx`insert into network_audit_log(actor_user_id,actor_email,action,entity_type,entity_id,before_value,after_value,note)
      values(${actor.userId},${actor.staffEmail},'results.reviewed_upload','result_ingestion_run',${runId},
        ${JSON.stringify({ event: review.event, edition: review.edition, existingProfilesChanged: 0, existingResultsChanged: 0 })}::jsonb,
        ${JSON.stringify({ ...outcome, decisions: choices, sourceHash: review.sourceHash, rightsConfirmed: true })}::jsonb,
        'Explicit staff confirmation. Only selected checked rows were inserted. Existing profiles, existing results, privacy and account ownership were retained.')`;
    await tx`insert into result_ingestion_editions
      (ingestion_run_id,event_id,edition_id,sport,event_name,event_slug,event_date,distance_code,source_url,status,rows_detected,rows_imported,rows_updated,rows_skipped,error_count,finished_at,updated_at)
      values(${runId},${event.id},${editionId},'Running',${request.upload.eventName},${event.slug},${request.upload.date}::date,${request.upload.distance},${request.upload.sourceUrl},${outcome.heldRows ? 'partial' : 'complete'},${review.rows.length},${inserted.length},0,${outcome.heldRows},0,now(),now())`;
    await tx`update result_ingestion_runs set status='completed',rows_imported=${inserted.length},rows_updated=0,
      rows_skipped=${outcome.heldRows},edition_count=1,error_count=0,finished_at=now(),updated_at=now() where id=${runId}`;
    return outcome;
  });
}
async function receipt(sql: Sql, runId: string, replay: boolean): Promise<ImportReceipt> {
  const rows = await sql<{ after_value: ImportReceipt }>`select after_value from network_audit_log where action='results.reviewed_upload' and entity_id=${runId}`;
  if (rows.length !== 1) throw new Error("The saved import receipt needs staff review; no further import was attempted.");
  return { ...rows[0].after_value, replay };
}
