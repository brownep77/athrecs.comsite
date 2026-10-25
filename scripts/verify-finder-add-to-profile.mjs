// Synthetic PostgreSQL records only; never reads application credentials or live data.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { z } from "zod";
import { readTimingTable } from "./lib/result-evidence-audit.mjs";
import { createFinderSyntheticFixture, loadFinderModule } from "./verify-athlete-source-finder.mjs";

export function loadProfileAdditionModules() {
  const archiveCore = loadFinderModule("src/lib/results-archive/core.ts", { zod: { z } });
  const archiveService = loadFinderModule("src/lib/results-archive/service.server.ts", {
    "node:crypto": crypto,
    "./core": archiveCore,
  });
  const core = loadFinderModule("src/lib/athlete-finder/add-to-profile.ts", {
    zod: { z },
    "../results-archive/core": archiveCore,
  });
  const service = loadFinderModule("src/lib/athlete-finder/add-to-profile.server.ts", {
    "node:crypto": crypto,
    "../results-archive/core": archiveCore,
    "../results-archive/service.server": archiveService,
    "../../../scripts/lib/result-evidence-audit.mjs": { readTimingTable },
    "./add-to-profile": core,
  });
  return { core, service, archiveCore, archiveService };
}

export async function createProfileAdditionFixture(fixture, actor) {
  const { sql } = fixture;
  const modules = loadProfileAdditionModules();
  const [target] =
    await sql`insert into athletes(slug,display_name,profile_visibility) values('finder-add-target-synthetic','Avery Addition Synthetic','public') returning id`;
  const [privateTarget] =
    await sql`insert into athletes(slug,display_name,profile_visibility) values('finder-add-private-synthetic','Avery Private Synthetic','private') returning id`;
  const [other] =
    await sql`insert into athletes(slug,display_name,profile_visibility) values('finder-add-other-synthetic','Avery Other Synthetic','public') returning id`;
  const [event] =
    await sql`insert into events(slug,name,sport,country,surface) values('finder-add-race-synthetic','Synthetic Addition Race','Running','GB','Road') returning id`;
  const [edition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-09-12','10K',10,'Finished') returning id`;
  const [secondEdition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-09-13','10K',10,'Finished') returning id`;
  const dataset = await modules.archiveService.createArchiveDataset(
    sql,
    {
      editionId: edition.id,
      provider: "Synthetic Addition Timer",
      sourceRaceKey: "add-test",
      sourceUrl: "https://addition.test/race",
      permissionNote: "Synthetic only, no real publication.",
    },
    actor,
  );
  const row = modules.archiveCore.archiveRowSchema.parse({
    sourceKey: "synthetic-101",
    name: "Avery Addition Synthetic",
    bib: "101",
    club: "Synthetic Former Club",
    status: "finished",
    finishSeconds: 2345.67,
    chipSeconds: 2345.67,
    gunSeconds: 2348.12,
    overallPlace: 12,
    genderPlace: 8,
    categoryPlace: 3,
    category: "V40",
    original: {
      Name: "Avery Addition Synthetic",
      Bib: "101",
      "Chip Time": "00:39:05.67",
      "Gun Time": "00:39:08.12",
    },
  });
  await modules.archiveService.ingestArchiveBatch(
    sql,
    { requestId: crypto.randomUUID(), datasetId: dataset.id, rows: [row] },
    actor,
  );
  const [entry] =
    await sql`select id::int from result_archive_entries where dataset_id=${dataset.id} and source_key=${row.sourceKey}`;
  const source = { kind: "archive", entryId: entry.id };
  const captureRow = {
    name: "Avery Addition Synthetic",
    bib: "202",
    club: "Synthetic Former Club",
    status: "finished",
    distanceLabel: "10K",
    tableKey: "10K",
    sourceRow: "202",
    original: { Name: "Avery Addition Synthetic", Bib: "202", Time: "00:40:05.12", Position: "14" },
  };
  const captureId = await fixture.insertCapture("finder-add-capture", [captureRow], {
    index: { name: "Synthetic Addition Race", date: "2026-09-12" },
  });
  return {
    ...modules,
    target,
    privateTarget,
    other,
    edition,
    secondEdition,
    event,
    source,
    row,
    entry,
    dataset,
    captureId,
    captureRow,
  };
}

async function verify() {
  const f = await createFinderSyntheticFixture();
  const { sql, db } = f;
  const actor = { userId: f.ids.staffUserId, staffEmail: "finder-staff@example.test" };
  try {
    const c = await createProfileAdditionFixture(f, actor),
      { core, service } = c;
    const input = { source: c.source, athleteId: c.target.id };
    const counts = () =>
      sql`select (select count(*)::int from results) results,(select count(*)::int from result_archive_entries) archive,(select count(*)::int from network_audit_log) audit`;
    const before = await counts();
    const preview = await service.previewProfileAddition(sql, input, actor);
    assert.deepEqual(preview.issues, []);
    assert.equal(preview.visibility, "public");
    assert.equal(preview.row.chipSeconds, 2345.67);
    assert.deepEqual(await counts(), before, "Opening and cancelling the panel is read only");
    const request = {
      ...input,
      version: preview.version,
      requestId: crypto.randomUUID(),
      note: "Synthetic identity and original row compared in the test.",
      sourceAndIdentityChecked: true,
      publicationConfirmed: true,
    };
    assert.throws(() =>
      core.finderProfileSaveSchema.parse({ ...request, publicationConfirmed: false }),
    );
    assert.throws(() => core.finderProfileSaveSchema.parse({ ...request, finishSeconds: 999 }));
    const receipt = await service.saveProfileAddition(sql, request, actor);
    const [result] = await sql`select * from results where id=${receipt.resultId}`;
    assert.equal(result.athlete_id, c.target.id);
    assert.equal(result.result_visibility, "public");
    assert.equal(result.finish_time_seconds, 2346);
    assert.equal(result.result_details.timing.chipSeconds, 2345.67);
    assert.equal(result.result_details.timing.gunSeconds, 2348.12);
    assert.equal(result.category_place, 3);
    assert.equal(result.result_details.clubAtRace, "Synthetic Former Club");
    assert.equal(
      result.result_details.verificationStatus,
      undefined,
      "Attachment must not grant a verification tick",
    );
    const savedCounts = await counts();
    assert.equal((await service.saveProfileAddition(sql, request, actor)).replay, true);
    assert.deepEqual(await counts(), savedCounts, "Identical retry must not add or audit twice");
    await assert.rejects(
      () =>
        service.saveProfileAddition(
          sql,
          { ...request, note: "Changed request with same reference" },
          actor,
        ),
      /reference/,
    );
    const duplicate = await service.previewProfileAddition(sql, input, actor);
    assert.ok(duplicate.issues.some((i) => i.includes("already has a result")));
    const wrong = await service.previewProfileAddition(
      sql,
      { ...input, athleteId: c.other.id },
      actor,
    );
    assert.ok(wrong.issues.some((i) => i.includes("already attached")));
    await assert.rejects(
      () =>
        service.saveProfileAddition(
          sql,
          {
            ...request,
            athleteId: c.other.id,
            version: wrong.version,
            requestId: crypto.randomUUID(),
          },
          actor,
        ),
      /already attached/,
    );
    assert.deepEqual(await counts(), savedCounts);

    const captureInput = {
      source: { kind: "capture", captureId: c.captureId, ordinal: 1 },
      athleteId: c.privateTarget.id,
      editionId: c.edition.id,
    };
    const capturePreview = await service.previewProfileAddition(sql, captureInput, actor);
    assert.deepEqual(capturePreview.issues, []);
    assert.equal(capturePreview.row.finishSeconds, 2405.12);
    assert.equal(capturePreview.row.chipSeconds, null);
    assert.equal(capturePreview.visibility, "private");
    const capReceipt = await service.saveProfileAddition(
      sql,
      {
        ...captureInput,
        version: capturePreview.version,
        requestId: crypto.randomUUID(),
        note: request.note,
        sourceAndIdentityChecked: true,
        publicationConfirmed: true,
      },
      actor,
    );
    const [capResult] =
      await sql`select result_visibility,finish_time_seconds,chip_time_seconds,gun_time_seconds,result_details from results where id=${capReceipt.resultId}`;
    assert.equal(capResult.result_visibility, "private");
    assert.equal(capResult.chip_time_seconds, null);
    assert.equal(capResult.gun_time_seconds, null);
    assert.equal(capResult.result_details.timing.finishSeconds, 2405.12);
    const capturedAgain = await service.previewProfileAddition(sql, captureInput, actor);
    assert.ok(capturedAgain.issues.some((i) => i.includes("already has a result")));
    const crossEdition = await service.previewProfileAddition(
      sql,
      { ...captureInput, editionId: c.secondEdition.id },
      actor,
    );
    assert.ok(crossEdition.issues.some((i) => i.includes("another race edition")));

    // Duplicate catalogue editions must not create a second performance.
    const [duplicateEdition] =
      await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${c.event.id},'2026-09-12','10 km',10,'Finished') returning id`;
    const copyDataset = await c.archiveService.createArchiveDataset(
      sql,
      {
        editionId: duplicateEdition.id,
        provider: "Synthetic copy timer",
        sourceRaceKey: "duplicate-edition",
        sourceUrl: "https://addition.test/copy",
        permissionNote: "Synthetic duplicate edition test only.",
      },
      actor,
    );
    await c.archiveService.ingestArchiveBatch(
      sql,
      {
        requestId: crypto.randomUUID(),
        datasetId: copyDataset.id,
        rows: [{ ...c.row, sourceKey: "duplicate-edition-row", bib: "909" }],
      },
      actor,
    );
    const [copyEntry] =
      await sql`select id::int from result_archive_entries where dataset_id=${copyDataset.id}`;
    assert.ok(
      (
        await service.previewProfileAddition(
          sql,
          { source: { kind: "archive", entryId: copyEntry.id }, athleteId: c.target.id },
          actor,
        )
      ).issues.some((i) => i.includes("already has a result")),
    );

    // The original TRT heading reader rejects swapped or dropped timings/placings.
    const trtOriginal = {
      Position: "12",
      Forename: "Avery Addition",
      Surname: "Synthetic",
      Tag: "505",
      "Chip Time": "00:39:05.67",
      "Gun Time": "00:39:08.12",
      "Gender Pos": "8",
      "Cat Pos": "3",
    };
    const trtCapture = await f.insertCapture(
      "finder-add-trt",
      [{ ...c.captureRow, bib: "505", sourceRow: "505", original: trtOriginal }],
      {
        sourceUrl: "https://totalracetiming.co.uk/raceresults/999",
        index: { name: "Synthetic Addition Race", date: "2026-09-12" },
      },
    );
    const trtInput = {
      source: { kind: "capture", captureId: trtCapture, ordinal: 1 },
      athleteId: c.other.id,
      editionId: c.edition.id,
    };
    const trtPreview = await service.previewProfileAddition(sql, trtInput, actor);
    assert.deepEqual(trtPreview.issues, []);
    const droppedChip = { ...trtPreview.mapping };
    delete droppedChip.chipTime;
    assert.ok(
      (
        await service.previewProfileAddition(sql, { ...trtInput, mapping: droppedChip }, actor)
      ).issues.some((i) => i.includes("independent Total Race Timing comparison")),
    );
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
      values(${c.target.id},'Synthetic Timing','same-capture-row','https://addition.test/another-history',now(),false,array[]::int[],array[]::int[],${JSON.stringify([{ archiveReference: { sourceKey: "finder-add-trt", tableKey: "10K", sourceRow: "505" } }])}::jsonb)`;
    assert.ok(
      (await service.previewProfileAddition(sql, trtInput, actor)).issues.some((i) =>
        i.includes("already held in"),
      ),
    );

    // Source changes, holds and withdrawal cannot be saved using an earlier preview.
    const nextRow = { ...c.row, sourceKey: "synthetic-303", bib: "303" };
    await c.archiveService.ingestArchiveBatch(
      sql,
      { requestId: crypto.randomUUID(), datasetId: c.dataset.id, rows: [nextRow] },
      actor,
    );
    const [nextEntry] =
      await sql`select id::int from result_archive_entries where source_key='synthetic-303'`;
    const nextInput = { source: { kind: "archive", entryId: nextEntry.id }, athleteId: c.other.id };
    const nextPreview = await service.previewProfileAddition(sql, nextInput, actor);
    assert.deepEqual(nextPreview.issues, []);
    const nextRequest = {
      ...request,
      ...nextInput,
      version: nextPreview.version,
      requestId: crypto.randomUUID(),
    };
    await sql`update result_archive_entries set review_state='held' where id=${nextEntry.id}`;
    const beforeHold = await counts();
    await assert.rejects(() => service.saveProfileAddition(sql, nextRequest, actor), /changed/);
    assert.deepEqual(await counts(), beforeHold);
    assert.ok(
      (await service.previewProfileAddition(sql, nextInput, actor)).issues.some((i) =>
        i.includes("held"),
      ),
    );
    for (const id of [f.ids.supersededCaptureId, f.ids.revokedCaptureId])
      await assert.rejects(
        () =>
          service.previewProfileAddition(
            sql,
            { source: { kind: "capture", captureId: id, ordinal: 1 } },
            actor,
          ),
        /withdrawn|superseded/,
      );

    // A source-identity clash discovered inside the reused archive transaction rolls back all work.
    await sql`update result_archive_entries set review_state='unmatched',payload=jsonb_set(jsonb_set(payload,'{sourceAthleteProvider}','"Synthetic ID"'),'{sourceAthleteId}','"same-id"') where id=${nextEntry.id}`;
    await sql`insert into result_archive_athlete_identifiers(provider,external_id,athlete_id,reviewed_by,note) values('Synthetic ID','same-id',${c.target.id},${actor.userId},'Synthetic existing identity')`;
    const clash = await service.previewProfileAddition(sql, nextInput, actor);
    const beforeClash = await counts();
    await assert.rejects(
      () => service.saveProfileAddition(sql, { ...nextRequest, version: clash.version }, actor),
      /identifier belongs/,
    );
    assert.deepEqual(await counts(), beforeClash);

    // A managed destination is protected unless the signed-in staff member is its linked owner.
    await sql`insert into athlete_account_links(user_id,user_email,athlete_id,status) values(${actor.userId},${actor.staffEmail},${c.other.id},'active')`;
    assert.ok(
      !(await service.previewProfileAddition(sql, nextInput, actor)).issues.some((i) =>
        i.includes("another account"),
      ),
    );
    assert.ok(
      (
        await service.previewProfileAddition(sql, nextInput, {
          userId: "different-user",
          staffEmail: "other@example.test",
        })
      ).issues.some((i) => i.includes("another account")),
    );
    await sql`update athletes set profile_details='{"nameReview":{"mode":"merged_source_entry"}}'::jsonb where id=${c.other.id}`;
    assert.ok(
      (await service.previewProfileAddition(sql, nextInput, actor)).issues.some((i) =>
        i.includes("active profile"),
      ),
    );
    assert.ok(
      !(await service.findProfileAdditionOptions(sql, { kind: "athlete", q: "Avery" })).some(
        (a) => a.id === c.other.id,
      ),
    );
    assert.deepEqual(
      await service.findProfileAdditionOptions(sql, {
        kind: "athlete",
        q: "%'; DROP TABLE athletes; --",
      }),
      [],
    );

    // A saved performance in source histories is also a duplicate, even if not yet public.
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances)
      values(${c.other.id},'Synthetic','addition-history','https://addition.test/history',now(),false,array[]::int[],array[]::int[], '[{"meeting":"Synthetic Addition Race","date":"2026-09-12","discipline":"10K","performance":"39:05.67"}]'::jsonb)`;
    assert.ok(
      (await service.previewProfileAddition(sql, nextInput, actor)).issues.some((i) =>
        i.includes("source history"),
      ),
    );

    // Capture mapping cannot invent source values; date and distance mismatches remain held.
    const freshCapture = await f.insertCapture(
      "finder-add-mapping",
      [{ ...c.captureRow, sourceRow: "404", bib: "404" }],
      { index: { name: "Synthetic Addition Race", date: "2026-09-12" } },
    );
    const fresh = {
      ...captureInput,
      source: { kind: "capture", captureId: freshCapture, ordinal: 1 },
      athleteId: c.other.id,
    };
    assert.ok(
      (
        await service.previewProfileAddition(
          sql,
          { ...fresh, editionId: c.secondEdition.id },
          actor,
        )
      ).issues.some((i) => i.includes("date does not match")),
    );
    assert.ok(
      (
        await service.previewProfileAddition(
          sql,
          { ...fresh, mapping: { finishTime: "Imaginary time" } },
          actor,
        )
      ).issues.some((i) => i.includes("source column")),
    );
    await sql`update result_archive_capture_approvals set revoked_at=now() where id='finder-active'`;
    await assert.rejects(() => service.previewProfileAddition(sql, fresh, actor), /withdrawn/);
    console.log(
      "PASS: real archive and capture additions, exact timing and placings, private/public visibility, read-only previews, replay, duplicate and cross-profile protection, changed/held/revoked sources, managed/merged profiles, source-identity rollback and history duplicates.",
    );
  } finally {
    await db.close();
  }
}
if (import.meta.url === pathToFileURL(resolve(process.argv[1] ?? "")).href) await verify();
