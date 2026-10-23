// Real service SQL against disposable synthetic data. Never opens an application database.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";

const require = createRequire(import.meta.url);
const ts = require("typescript");
export function loadFinderModule(path, dependencies = {}, verificationExports = "") {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(path, "utf8") + verificationExports, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
      return dependencies[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}

async function verifyCapturePrefilterParity(sql, core) {
  // Expose the actual private builder only in this disposable test module.
  const { captureCandidatesForVerification: build } = loadFinderModule(
    "src/lib/athlete-finder/search.server.ts",
    { "./core": core },
    "\nexport const captureCandidatesForVerification = captureCandidates;\n",
  );
  const names = [
    "Paul Browne",
    "PAUL BROWNE",
    "paul-browne",
    "Paul A. Browne",
    "NotPaul NotBrowne",
    "Paula Browne",
    "Ｐａｕｌ Ｂｒｏｗｎｅ",
    "𝑷𝒂𝒖𝒍 𝑩𝒓𝒐𝒘𝒏𝒆",
    "Paul Browne\u200b",
    "Paul Browne\u0301",
    "Jane Doe",
    "JANE-DOE",
    "O'Neill",
    "O’Neill",
    "ONeill",
    "J.R. Smith",
    "JR Smith",
    "I Smith",
    "i smith",
    "İ Smith",
    "ı Smith",
    "İsmail Kaya",
    "Ismail Kaya",
    "ismail kaya",
    "François Brown",
    "FRANÇOIS BROWN",
    "Francois Brown",
    "ΣΩΤΗΡΗΣ ΣΠΥΡΟΣ",
    "σωτηρης σπυρος",
    "σωτηρησ σπυροσ",
    "Άλφα",
    "ΑΛΦΑ",
    "Džordže Brown",
    "DŽORDŽE BROWN",
    "Alice Smith",
    "Paul Brown",
    "Browne Paul",
    "P. Browne",
    "",
    null,
    "Paul Browne " + "x".repeat(2000) + "é",
    "x".repeat(2000) + "Paul Browne",
  ];
  const queries = [
    ["Paul Browne"],
    ["Paul Browne", "Jane Doe"],
    ["Paul Browne", "Άλφα"],
    ["I Smith"],
    ["İsmail Kaya"],
    ["François Brown", "Jane Doe"],
    ["Ｐａｕｌ Ｂｒｏｗｎｅ"],
    ["O’Neill"],
    ["ΣΩΤΗΡΗΣ ΣΠΥΡΟΣ"],
    ["Džordže Brown"],
    ["J.R. Smith"],
    ["P. Browne"],
  ];
  const exact =
    "to_tsvector('simple',regexp_replace(normalize(left(coalesce(p.value->>'name',''),2000),NFKC),'[^[:alnum:]]+',' ','g')) @@ to_tsquery('simple',$1)";
  let comparisons = 0;
  let positive = 0;
  let fastPaths = 0;
  for (const aliases of queries) {
    const lexemes = await sql.query(
      "select tsvector_to_array(to_tsvector('simple',regexp_replace(normalize(name,NFKC),'[^[:alnum:]]+',' ','g'))) as words from unnest($1::text[]) name",
      [aliases],
    );
    const terms = core.finderNameTerms(lexemes.map((row) => row.words));
    const built = build(terms);
    if (built.nameClause.startsWith("case")) fastPaths++;
    const parameters = [core.finderNameQuery(terms), "", null, null, [], 0, ...built.values, names];
    const types = parameters
      .map((_, index) => {
        const type =
          index < 2 ? "text" : index === 2 || index === 3 || index === 5 ? "integer" : "text[]";
        return `$${index + 1}::${type} as p${index + 1}`;
      })
      .join(",");
    const rows = await sql.query(
      `with typed_parameters as (select ${types})
        select sample.name,(${exact}) as original,(${built.nameClause}) as filtered
        from unnest($${parameters.length}::text[]) sample(name)
        cross join lateral(select jsonb_build_object('name',sample.name) as value) p`,
      parameters,
    );
    for (const row of rows) {
      assert.equal(
        row.filtered,
        row.original,
        `Prefilter changed ${JSON.stringify(row.name)} for ${aliases.join(" / ")}`,
      );
      comparisons++;
      if (row.original) positive++;
    }
  }
  assert.equal(comparisons, 504);
  assert.equal(positive, 72, "Parity must include real positive matches");
  assert.equal(fastPaths, 10, "A Unicode-only alias must disable the shortcut");
  console.log(
    "ASCII shortcut parity: 504 SQL comparisons, 72 positive matches, mixed aliases and Unicode/truncation boundaries passed.",
  );
}

export function finderSqlFor(database, connection = database, observedQueries = []) {
  const query = async (text, values = []) => {
    observedQueries.push(text);
    try {
      return (await connection.query(text, values)).rows;
    } catch (error) {
      // Synthetic fixture only. Surface SQL errors which the production API safely labels.
      if (!/57014|55P03/.test(String(error?.code)))
        console.error("Synthetic finder SQL:", error.message);
      throw error;
    }
  };
  const sql = (parts, ...values) =>
    query(
      parts.reduce((s, part, i) => s + (i ? `$${i}` : "") + part, ""),
      values,
    );
  sql.query = query;
  sql.transaction = (work) =>
    database.transaction((tx) => work(finderSqlFor(database, tx, observedQueries)));
  return sql;
}

export async function createFinderSyntheticFixture() {
  const db = new PGlite();
  await db.waitReady;
  const queries = [];
  const sql = finderSqlFor(db, db, queries);
  const core = loadFinderModule("src/lib/athlete-finder/core.ts", { zod: { z } });
  const service = loadFinderModule("src/lib/athlete-finder/search.server.ts", { "./core": core });
  for (const filename of readdirSync("migrations")
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await db.exec(readFileSync(`migrations/${filename}`, "utf8"));
  }
  const source = (source_id, source_name, start_url, overrides = {}) => ({
    source_id,
    source_name,
    start_url,
    source_type: "Timing provider",
    enabled: true,
    source_section: "Results",
    region_scope: "Europe",
    country_focus: "Ireland",
    coverage_scope: "Synthetic tests only",
    coverage_start_year: "2020",
    coverage_end_year: "2026",
    surface_scope: "Road",
    timing_scope: "Chip and gun",
    chip_timed_status: "Available",
    permission_url: "",
    allowed_domains: new URL(start_url).hostname,
    race_link_include_regex: "",
    race_link_exclude_regex: "",
    profile: "manual",
    follow_history_links: false,
    max_pages: 1,
    rate_limit_seconds: 2,
    rights_status: "No published crawl restriction found",
    notes: "Synthetic fixture",
    ...overrides,
  });
  const registry = [
    source("synthetic_timing", "Synthetic Timing", "https://timing.test/", {
      allowed_domains: "timing.test|results.timing.test",
    }),
    source("synthetic_links", "Synthetic URL-only source", "https://links.test/"),
    source("synthetic_other", "Synthetic Other", "https://other.test/"),
  ];
  const searchName = "Éva O’Neill";
  const marker = "SYNTHETIC_PRIVATE_ORIGINAL_DO_NOT_TRANSFER";
  const staffUserId = "finder-synthetic-staff";
  await sql`insert into "user"(id,name,email,"emailVerified") values(${staffUserId},'Synthetic Finder Staff','finder-staff@example.test',true)`;
  const [event] =
    await sql`insert into events(slug,name,sport,country,surface) values('synthetic-finder-harbour','Synthetic Harbour 10K','Running','Ireland','Road') returning id`;
  const [edition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-10-01','10K',10,'Finished') returning id`;
  const [club] =
    await sql`insert into clubs(slug,name,country) values('synthetic-harbour-ac','Harbour AC','Ireland') returning id`;
  const [athlete] =
    await sql`insert into athletes(slug,display_name,club_id,profile_visibility) values('synthetic-eva-finder',${searchName},${club.id},'private') returning id`;
  const [sameName] =
    await sql`insert into athletes(slug,display_name,source_club_name,profile_visibility) values('synthetic-other-eva-finder',${searchName},'Inland AC','private') returning id`;
  const [result] =
    await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,result_source,source_url,result_visibility,result_details,bib)
    values(${edition.id},${athlete.id},'finished',2112,'Synthetic Timing','https://timing.test/race','private',${JSON.stringify({ clubAtRace: "Harbour AC", timing: { finishText: "00:35:12.45" }, original: { private: marker } })}::jsonb,'17') returning id`;
  const [otherResult] =
    await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,result_source,source_url,result_visibility)
    values(${edition.id},${sameName.id},'finished',2255,'Other Timer','https://other.test/race','private') returning id`;
  await sql`insert into result_source_references(result_id,source_name,source_url) values(${otherResult.id},'Synthetic Timing','https://results.timing.test/supporting')`;
  const datasetId = "10000000-0000-4000-8000-000000000001";
  await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note,expected_rows,created_by)
    values(${datasetId},${edition.id},'Synthetic Timing','finder-race','https://timing.test/race','Synthetic permission retained for disposable tests',31,${staffUserId})`;
  let archiveEntryId;
  for (let index = 0; index < 31; index++) {
    const [entry] =
      await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash,review_state)
      values(${datasetId},${`synthetic-${index}`},${JSON.stringify({ name: searchName, club: "Harbour AC", finishText: "00:35:12.45", finishSeconds: 2112.45, status: "finished", original: { private: marker, document: "x".repeat(3000) } })}::jsonb,${createHash("sha256").update(`archive-${index}`).digest("hex")},${index === 0 ? "held" : "unmatched"}) returning id::integer`;
    if (index === 0) archiveEntryId = entry.id;
  }
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values(${athlete.id},'Synthetic History','eva-private','https://other.test/profile','2026-10-01',true,ARRAY[2024,2026],ARRAY[2024,2026],${JSON.stringify(
      [
        {
          meeting: "Synthetic Harbour 10K",
          discipline: "10 km",
          performance: "35:12.45",
          date: "2026-10-01",
          club: "Harbour AC",
          sourceUrls: ["https://other.test/performance", "https://results.timing.test/history-row"],
          archiveReference: { sourceRow: "17", original: { private: marker } },
        },
        {
          meeting: "Synthetic Earlier 5K",
          discipline: "5 km",
          performance: "17:12",
          year: 2024,
          dateLabel: "2024",
          labels: ["Club at race: Harbour AC"],
          sourceUrls: ["https://timing.test/earlier"],
          profileExcluded: true,
        },
      ],
    )}::jsonb,null)`;
  await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    values(${sameName.id},'Synthetic History','eva-published','https://other.test/profile-2','2026-10-01',true,ARRAY[2026],ARRAY[2026],${JSON.stringify([{ meeting: "Synthetic Other Meet", discipline: "10 km", performance: "37:35", date: "2026-10-01", club: "Inland AC" }])}::jsonb,'2026-10-02')`;
  await sql`insert into result_archive_capture_approvals(id,provider,approved_by,approval_basis,evidence)
    values('finder-active','Synthetic Timing','Synthetic owner','owner_private_import','{}'),('finder-revoked','Synthetic Timing','Synthetic owner','owner_private_import','{}')`;
  await sql`update result_archive_capture_approvals set revoked_at='2026-10-03' where id='finder-revoked'`;
  await sql`insert into result_archive_capture_runs(id,approval_id,provider,inventory)
    values('20000000-0000-4000-8000-000000000001','finder-active','Synthetic Timing','[]')`;
  const insertCapture = async (sourceKey, rows, options = {}) => {
    const payload = {
      publication: "staff_only",
      index: { name: "Synthetic Captured 10K", date: "2026-10-01", ...options.index },
      rows,
    };
    const text = JSON.stringify(payload);
    const [capture] = await sql.query(
      `insert into result_archive_source_captures
      (run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
      values('20000000-0000-4000-8000-000000000001',$1,'Synthetic Timing',$2,$3,$4,repeat('a',64),$5,$6::jsonb,$7,$8,'{}',$9::timestamptz) returning id::text`,
      [
        options.approvalId ?? "finder-active",
        sourceKey,
        options.sourceUrl ?? `https://www.timing.test/${sourceKey}`,
        createHash("sha256").update(text).digest("hex"),
        new TextEncoder().encode(marker),
        text,
        rows.length,
        options.sourceCheck ?? "compared",
        options.capturedAt ?? "2026-10-01T12:00:00Z",
      ],
    );
    return capture.id;
  };
  const captureRows = Array.from({ length: 31 }, (_, i) => ({
    name: searchName,
    club: "Harbour AC",
    bib: String(i + 1),
    sourceRow: String(i + 1),
    tableKey: "10K",
    status: "finished",
    original: {
      "Chip Time": "00:35:12.45",
      "Gun Time": "00:35:13.10",
      private: marker,
      document: "x".repeat(3000),
    },
  }));
  const captureId = await insertCapture("active-race", captureRows);
  const supersededCaptureId = await insertCapture("new-held-race", [
    { name: searchName, club: "Harbour AC" },
  ]);
  await insertCapture("new-held-race", [{ name: "Synthetic Held Replacement" }], {
    sourceCheck: "held",
    capturedAt: "2026-10-02T12:00:00Z",
  });
  const revokedCaptureId = await insertCapture("new-revoked-race", [
    { name: searchName, club: "Harbour AC" },
  ]);
  await insertCapture("new-revoked-race", [{ name: "Synthetic Revoked Replacement" }], {
    approvalId: "finder-revoked",
    capturedAt: "2026-10-02T12:00:00Z",
  });
  await insertCapture("split-person-race", [{ name: "Éva Different" }, { name: "Riley O’Neill" }]);
  await sql`insert into edition_result_links(edition_id,provider_code,provider_name,results_url,canonical_url,source_url,registry_source_id,status)
    values(${edition.id},'synthetic','Synthetic URL-only source','https://links.test/race','https://links.test/race','https://links.test/index','synthetic_links','approved')`;
  queries.length = 0;
  return {
    db,
    sql,
    service,
    core,
    registry,
    queries,
    searchName,
    marker,
    insertCapture,
    ids: {
      staffUserId,
      athleteId: athlete.id,
      canonicalAthleteId: athlete.id,
      resultId: result.id,
      canonicalResultId: result.id,
      sameNameAthleteId: sameName.id,
      otherResultId: otherResult.id,
      archiveEntryId,
      captureId,
      datasetId,
      supersededCaptureId,
      revokedCaptureId,
      editionId: edition.id,
    },
  };
}

async function verifyFinder() {
  const fixture = await createFinderSyntheticFixture();
  const { db, sql, service, core, registry, queries, searchName, marker, ids, insertCapture } =
    fixture;
  const find = (input = {}) =>
    service.searchStoredAthleteResults(sql, { q: searchName, ...input }, registry);
  try {
    const before = (
      await sql.query(`select
      (select count(*) from results)::int results,(select count(*) from athletes)::int athletes,
      (select count(*) from result_archive_entries)::int entries,(select count(*) from result_change_history)::int changes,
      (select count(*) from result_archive_match_requests)::int requests`)
    )[0];
    queries.length = 0;
    const first = await find();
    assert.deepEqual(
      first.stores.map((store) => [store.kind, store.status]),
      core.FINDER_STORE_KINDS.map((kind) => [kind, "searched"]),
    );
    assert.equal(
      first.rows.length,
      55,
      "Two distinct canonical athletes, 25 archive rows, 25 captures and three histories remain observations",
    );
    assert.equal(first.hasMore, true);
    assert.equal(first.nextOffset, 25);
    assert.equal(first.completeForSelectedStores, false);
    assert.equal(new Set(first.rows.map((row) => row.key)).size, first.rows.length);
    assert.equal(
      first.rows.filter((row) => row.kind === "canonical").length,
      2,
      "Same-name athletes are not merged",
    );
    assert.ok(first.rows.some((row) => row.reviewState === "unpublished history"));
    assert.ok(first.rows.some((row) => row.reviewState === "published history"));
    assert.ok(first.rows.some((row) => row.reviewState.includes("excluded from profile")));
    assert.equal(JSON.stringify(first).includes(marker), false);
    assert.equal(JSON.stringify(first).includes("source_html_gzip"), false);
    assert.equal(JSON.stringify(first).includes('"original"'), false);
    assert.ok(
      JSON.stringify(first).length < 70000,
      "No whole histories, capture documents or original payloads leave SQL",
    );
    assert.ok(
      queries.every(
        (query) => !/\b(insert|update|delete|alter|create|drop|truncate)\b/i.test(query),
      ),
      "Searching performs no writes",
    );
    assert.ok(
      queries.filter((query) => query.startsWith("set local statement_timeout")).length === 5,
      "Input normalization and every selected store have bounded read-only transactions",
    );
    const second = await find({ offset: first.nextOffset });
    assert.equal(second.rows.length, 12);
    assert.equal(second.hasMore, false);
    assert.equal(second.completeForSelectedStores, true);
    assert.ok(
      second.rows.some((row) => row.kind === "archive" && row.reviewState === "held"),
      "Staff can inspect held central observations",
    );
    const allKeys = [...first.rows, ...second.rows].map((row) => row.key);
    assert.equal(new Set(allKeys).size, allKeys.length, "Paging does not repeat observations");
    assert.equal(
      (await find({ q: "Synthetic Newname", aliases: [searchName] })).rows.length,
      first.rows.length,
    );
    assert.equal(
      (await find({ q: "E\u0301va O'Neill", kind: "canonical" })).rows.length,
      2,
      "Unicode normalization and name punctuation align",
    );
    assert.equal((await find({ q: "ÉVA O’NEILL", kind: "canonical" })).rows.length, 2);
    assert.equal(
      (await find({ q: "Nonsense ' | ! true --" })).rows.length,
      0,
      "Search syntax stays literal",
    );
    assert.equal((await find({ q: "%' OR true --" })).rows.length, 0);
    assert.equal((await find({ kind: "canonical", club: "inland" })).rows.length, 1);
    assert.equal(
      (await find({ kind: "history", yearFrom: 2024, yearTo: 2024 })).rows.length,
      1,
      "Year-only stored dates remain searchable",
    );
    assert.equal((await find({ yearFrom: 2025, yearTo: 2025 })).rows.length, 0);
    const timing = await find({ sourceId: "synthetic_timing" });
    assert.equal(
      timing.rows.filter((row) => row.kind === "canonical").length,
      2,
      "Supporting canonical reference can match a source",
    );
    assert.equal(
      timing.rows.find((row) => row.resultId === ids.otherResultId)?.sourceUrl,
      "https://results.timing.test/supporting",
    );
    assert.equal(
      timing.rows.find((row) => row.kind === "history" && row.date === "2026-10-01")?.sourceUrl,
      "https://results.timing.test/history-row",
    );
    assert.equal(
      (await find({ sourceId: "synthetic_links" })).rows.length,
      0,
      "A stored URL does not imply searchable participant contents",
    );
    const captures = [...first.rows, ...second.rows].filter((row) => row.kind === "capture");
    assert.equal(captures.length, 31);
    assert.ok(
      captures.every((row) => row.captureId === ids.captureId),
      "Held/revoked newest versions cannot revive earlier approved captures",
    );
    assert.equal(
      captures[0].performance,
      "Chip 00:35:12.45 · Gun 00:35:13.10",
      "Chip and gun evidence stays separate and precise",
    );
    assert.equal(
      (await find({ q: "Éva O’Neill", kind: "capture" })).rows.some((row) =>
        row.rowLocator.includes("split-person"),
      ),
      false,
    );
    await assert.rejects(() => find({ sourceId: "missing" }), /current source registry/);
    for (const input of [
      { q: "" },
      { q: "---" },
      { q: "a".repeat(161) },
      { aliases: Array(9).fill("Name") },
      { yearFrom: 2026, yearTo: 2020 },
      { offset: 10001 },
      { offset: -1 },
      { kind: "anything" },
      { sourceId: "https://timing.test" },
    ]) {
      await assert.rejects(() => find(input), "Malformed input is rejected before querying");
    }
    assert.deepEqual(
      core.registrySourceHosts({
        start_url: "https://WWW.timing.test./race",
        allowed_domains: "*.results.timing.test other.test",
      }),
      ["timing.test", "results.timing.test", "other.test"],
    );
    assert.equal(core.sourceUrlHost("https://private@timing.test/race"), null);
    assert.equal(core.sourceUrlHost("javascript:alert(1)"), null);
    const after = (
      await sql.query(`select
      (select count(*) from results)::int results,(select count(*) from athletes)::int athletes,
      (select count(*) from result_archive_entries)::int entries,(select count(*) from result_change_history)::int changes,
      (select count(*) from result_archive_match_requests)::int requests`)
    )[0];
    assert.deepEqual(
      after,
      before,
      "Search does not create results, athletes, links, audit changes or claim requests",
    );
    assert.equal(
      (await sql`select result_visibility from results where id=${ids.resultId}`)[0]
        .result_visibility,
      "private",
    );

    await insertCapture(
      "oversized-fields",
      [
        {
          name: `Synthetic Bounds ${"a ".repeat(1500)}`,
          club: "c".repeat(5000),
          sourceRow: "r".repeat(5000),
          tableKey: "d".repeat(5000),
          status: "s".repeat(5000),
          original: {
            "Chip Time": "t".repeat(5000),
            "Gun Time": "g".repeat(5000),
            private: marker,
          },
        },
      ],
      { sourceUrl: `https://timing.test/${"u".repeat(3000)}`, index: { name: "e".repeat(5000) } },
    );
    const bounded = await find({ q: "Synthetic Bounds", kind: "capture" });
    assert.equal(bounded.rows.length, 1);
    for (const [field, limit] of Object.entries({
      name: 200,
      club: 200,
      event: 300,
      distance: 100,
      performance: 160,
      status: 60,
      rowLocator: 500,
    })) {
      assert.ok(
        bounded.rows[0][field].length <= limit,
        `${field} is bounded even for malformed source text`,
      );
    }
    assert.equal(
      bounded.rows[0].sourceUrl,
      null,
      "An overlong source URL is omitted rather than truncated into a different URL",
    );
    assert.ok(JSON.stringify(bounded).length < 5000);

    // The index must handle an entire large race, including a match at its end.
    const largeRows = Array.from({ length: 35000 }, (_, index) => ({
      name: `Bulk${createHash("md5").update(String(index)).digest("hex")}`,
    }));
    largeRows.push({
      name: "Synthetic Endmarker",
      club: "Harbour AC",
      original: { private: marker },
    });
    await insertCapture("large-race", largeRows);
    const tail = await find({ q: "Synthetic Endmarker", kind: "capture" });
    assert.equal(tail.stores[0].status, "searched");
    assert.equal(
      tail.rows.length,
      1,
      "Large capture index covers the final row, not a truncated name list",
    );
    assert.equal(tail.rows[0].captureOrdinal, 35001);
    assert.ok(JSON.stringify(tail).length < 5000);
    const indexPlan = await sql.query(
      "explain select id from result_archive_source_captures where payload->>'publication'='staff_only' and athlete_finder_capture_name_keys(payload) @> ARRAY['end']",
    );
    assert.ok(
      indexPlan.some((row) => String(row["QUERY PLAN"]).includes("athlete_finder_capture_names")),
      "Capture candidates can use the GIN name index",
    );

    // Model broad race-level keys: many pages are candidates, while name-word
    // conjunction must still match a single participant. The first page must
    // stop before expanding every capture and later pages must remain exact.
    for (let index = 0; index < 8; index++) {
      await insertCapture(
        `ordered-page-${index}`,
        Array.from({ length: 3 }, () => ({ name: "Synthetic Orderedpage" })),
      );
    }
    const orderedCaptureId = await insertCapture(
      "ordered-page-newest",
      Array.from({ length: 31 }, (_, index) => ({
        name:
          index === 0
            ? "Ｓｙｎｔｈｅｔｉｃ Ｏｒｄｅｒｅｄｐａｇｅ"
            : index === 1
              ? "SYNTHETIC ORDEREDPAGE"
              : index === 2
                ? "Synthetic-Orderedpage"
                : "Synthetic Orderedpage",
      })),
    );
    const splitCaptureId = await insertCapture("ordered-page-split-name-decoy", [
      { name: "Synthetic Other" },
      { name: "Unrelated Orderedpage" },
      { name: "Nonsynthetic Orderedpage" },
      { name: "Synthetic Preorderedpage" },
    ]);
    let orderedRequest;
    const observeSql = {
      transaction: (work) =>
        sql.transaction((tx) =>
          work({
            query: (query, values) => {
              if (query.startsWith("with candidates")) orderedRequest = { query, values };
              return tx.query(query, values);
            },
          }),
        ),
    };
    const orderedFirst = await service.searchStoredAthleteResults(
      observeSql,
      { q: "Synthetic Orderedpage", kind: "capture" },
      registry,
    );
    assert.equal(orderedFirst.rows.length, 25);
    assert.ok(orderedFirst.rows.every((row) => row.captureId === orderedCaptureId));
    assert.equal(
      orderedFirst.rows[0].captureOrdinal,
      1,
      "Fullwidth names bypass the ASCII shortcut",
    );
    assert.equal(orderedFirst.rows[2].captureOrdinal, 3, "Punctuation remains a word boundary");
    const orderedSecond = await find({ q: "Synthetic Orderedpage", kind: "capture", offset: 25 });
    const orderedThird = await find({ q: "Synthetic Orderedpage", kind: "capture", offset: 50 });
    const orderedRows = [...orderedFirst.rows, ...orderedSecond.rows, ...orderedThird.rows];
    assert.equal(orderedRows.length, 55);
    assert.equal(new Set(orderedRows.map((row) => row.key)).size, 55);
    assert.equal(orderedThird.hasMore, false);
    assert.ok(orderedRows.every((row) => row.captureId !== splitCaptureId));
    assert.ok(
      orderedRows.every((row, index) => {
        const previous = orderedRows[index - 1];
        return (
          !previous ||
          BigInt(previous.captureId) > BigInt(row.captureId) ||
          (previous.captureId === row.captureId && previous.captureOrdinal < row.captureOrdinal)
        );
      }),
      "Capture IDs descend and source row ordinals ascend across page boundaries",
    );
    const [orderedPlan] = await sql.query(
      `explain (analyze true, timing false, format json) ${orderedRequest.query}`,
      orderedRequest.values,
    );
    const planNodes = [];
    const collectPlan = (node) => {
      planNodes.push(node);
      for (const child of node.Plans ?? []) collectPlan(child);
    };
    collectPlan(orderedPlan["QUERY PLAN"][0].Plan);
    assert.ok(
      planNodes.some(
        (node) =>
          node["Node Type"] === "Incremental Sort" &&
          node["Presorted Key"]?.includes("selected.id"),
      ),
      "Paging must preserve ordered candidate execution instead of sorting all expanded rows",
    );
    const expansions = planNodes.find(
      (node) => node["Node Type"] === "Function Scan" && node.Alias === "p",
    );
    assert.ok(
      expansions && expansions["Actual Loops"] < 10,
      "The first page does not expand all ten candidate captures",
    );
    assert.equal(
      (await find({ q: "Unrelated Alias", aliases: ["Synthetic Orderedpage"], kind: "capture" }))
        .rows[0].captureId,
      orderedCaptureId,
      "The ASCII shortcut includes supplied aliases",
    );
    console.log(
      "Capture paging: 55 exact observations across three pages; bounded ordered expansion, fullwidth names, aliases and split-person decoys passed.",
    );
    await verifyCapturePrefilterParity(sql, core);

    await db.exec("alter table result_source_references rename to finder_test_saved_references");
    const noReferences = await find({ kind: "canonical" });
    assert.equal(noReferences.rows.length, 2);
    assert.equal(noReferences.stores[0].status, "searched");
    assert.match(noReferences.stores[0].message, /supporting source references/);
    assert.equal(noReferences.completeForSelectedStores, false);
    await db.exec("alter table finder_test_saved_references rename to result_source_references");
    await db.exec("alter table athlete_source_histories rename to finder_test_saved_histories");
    const missing = await find();
    assert.equal(missing.stores.find((store) => store.kind === "history").status, "unavailable");
    assert.ok(missing.rows.some((row) => row.kind === "canonical"));
    assert.equal(missing.completeForSelectedStores, false);
    await db.exec("alter table finder_test_saved_histories rename to athlete_source_histories");
    await db.exec(
      "alter function athlete_finder_capture_name_keys(jsonb) rename to finder_test_saved_name_keys",
    );
    const missingIndex = await find({ kind: "capture" });
    assert.equal(missingIndex.stores[0].status, "unavailable");
    assert.match(missingIndex.stores[0].message, /migration/);
    await db.exec(
      "alter function finder_test_saved_name_keys(jsonb) rename to athlete_finder_capture_name_keys",
    );
    const timeoutSql = {
      transaction: (work) =>
        sql.transaction((tx) =>
          work({
            query: (query, values) => {
              if (query.startsWith("with candidates")) {
                const error = new Error("Synthetic capture timeout");
                error.code = "57014";
                throw error;
              }
              return tx.query(query, values);
            },
          }),
        ),
    };
    const timeout = await service.searchStoredAthleteResults(
      timeoutSql,
      { q: searchName },
      registry,
    );
    assert.equal(timeout.stores.find((store) => store.kind === "capture").status, "timed_out");
    assert.ok(timeout.rows.some((row) => row.kind === "canonical"));
    assert.equal(timeout.completeForSelectedStores, false);

    // Exact names and ordinary case variants must survive both the indexed
    // candidate pass and the final PostgreSQL word comparison in every store.
    const unicodeCases = [
      ["İpek Yılmaz", "İpek Yılmaz"],
      ["İpek Yılmaz", "İPEK YILMAZ"],
      ["ΟΣ ΚΟΣ", "ΟΣ ΚΟΣ"],
      ["ΟΣ ΚΟΣ", "ος κος"],
      ["ος κος", "ΟΣ ΚΟΣ"],
      ["अनिता शर्मा", "अनिता शर्मा"],
      ["Amélie Synthetic", "Ame\u0301lie Synthetic"],
      ["中文合成测试", "中文合成测试"],
    ];
    const unicodeMisses = [];
    for (const [index, [storedName, requestedName]] of unicodeCases.entries()) {
      await sql.query("update athletes set display_name=$1 where id=$2", [
        storedName,
        ids.athleteId,
      ]);
      await sql.query(
        "update result_archive_entries set payload=jsonb_set(payload,'{name}',to_jsonb($1::text)) where id=$2",
        [storedName, ids.archiveEntryId],
      );
      const captureId = await insertCapture(`unicode-case-${index}`, [{ name: storedName }]);
      const found = await find({ q: requestedName });
      const expected = {
        canonical: (row) => row.kind === "canonical" && row.resultId === ids.resultId,
        archive: (row) => row.archiveEntryId === ids.archiveEntryId,
        capture: (row) => row.captureId === captureId,
        history: (row) => row.kind === "history" && row.athleteId === ids.athleteId,
      };
      for (const [kind, matches] of Object.entries(expected)) {
        if (!found.rows.some(matches)) unicodeMisses.push({ storedName, requestedName, kind });
      }
    }
    assert.deepEqual(
      unicodeMisses,
      [],
      "Unicode names and Greek final-sigma case variants must not silently return false zeroes",
    );
    console.log("Unicode adversarial search: 32 store/name assertions passed.");
    const api = readFileSync("src/lib/athlete-finder/api.ts", "utf8");
    assert.match(api, /\.middleware\(\[staffMiddleware\]\)/);
    assert.match(api, /finderSearchSchema\.parse/);
    assert.match(api, /private, no-store/);
    console.log(
      "Athlete source finder: all four SQL stores, ambiguous names, aliases/Unicode, source/year/club filters, large capture indexing, latest/revoked captures, bounded private evidence, pagination, partial availability, time limits and staff guards passed.",
    );
  } finally {
    await db.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await verifyFinder();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
