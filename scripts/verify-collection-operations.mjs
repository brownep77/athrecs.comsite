// Invoked from the disposable real-RPC collection-stats suite, never production.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClientRpc } from "@tanstack/start-client-core/client-rpc";
import { runWithStartContext } from "@tanstack/start-storage-context";

export async function verifyCollectionOperations({ server, sql, browser, origin }) {
  const source = await (await fetch(`${origin}/src/lib/collection-stats/operations-api.ts`)).text();
  const rpcId = source.match(/createClientRpc\("([^"]+)"\)/)?.[1];
  assert(rpcId, "Operations real RPC compiled");
  async function read(data = {}, token = "stats-token", extra = {}) {
    const result = await runWithStartContext({ startOptions: {} }, () =>
      createClientRpc(rpcId)({
        method: "GET",
        data,
        context: {},
        headers: {
          origin,
          "sec-fetch-site": "same-origin",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          ...extra,
        },
      }),
    );
    if (result.error)
      throw new Error(
        `Operations ${data.section ?? "results"}/${data.group ?? "default"}/${data.mode ?? "summary"}: ${result.error.message}`,
      );
    return result.result;
  }
  await assert.rejects(() => read({}, null), /Unauthorized/);
  await assert.rejects(() => read({}, "member-token"), /Forbidden/);
  await assert.rejects(
    () =>
      read({}, "stats-token", {
        origin: "https://untrusted.example",
        "sec-fetch-site": "cross-site",
      }),
    /Forbidden|Cross/,
  );
  await assert.rejects(
    () => read({}, "stats-token", { "x-forwarded-host": "www.athrecs.com" }),
    /staff host required/,
  );
  await assert.rejects(() => read({ section: "results;drop table athletes" }));
  await assert.rejects(() => read({ page: -1 }));
  await assert.rejects(() => read({ unexpected: true }));
  const { operationSections } = await server.ssrLoadModule(
    "/src/lib/collection-stats/operations.ts",
  );
  for (const section of Object.keys(operationSections)) {
    const report = await read({ section });
    assert(Array.isArray(report.rows), `${section} real query executes`);
    assert(Number.isFinite(report.total));
  }
  const initial = await read({ section: "results" });
  assert.equal(initial.metrics.find((x) => x.label === "Main results saved").value, 2);
  assert.equal(
    initial.rows.reduce((n, x) => n + x.count, 0),
    2,
  );
  assert.equal(
    (await read({ section: "coverage" })).rows.find((r) => r.key === "No saved results").count,
    2,
  );
  assert.equal(
    (await read({ section: "coverage" })).rows.find((r) => r.key === "Imported history only").count,
    1,
  );
  assert.equal((await read({ section: "results", q: "' OR 1=1 --" })).total, 0);

  const [male] = await sql`select id from athletes where slug='stats-male'`;
  const [female] = await sql`select id from athletes where slug='stats-female'`;
  const [result] =
    await sql`select id,edition_id from results where athlete_id=${male.id} order by id limit 1`;
  await sql`update results set bib='42',source_url='https://example.test/results',result_details='{"verificationStatus":"source_verified"}' where id=${result.id}`;
  await sql`insert into results(edition_id,athlete_id,bib,source_url,result_details) values(${result.edition_id},${female.id},'42','https://example.test/results','{"verificationStatus":"unverified"}')`;
  await sql`update athletes set display_name='Private Name' where slug='stats-unknown'`;
  const [club] =
    await sql`insert into clubs(slug,name,summary,website) values('stats-club','Synthetic Stats Club','','') returning id`;
  await sql`update athletes set club_id=${club.id},second_club_id=${club.id} where id=${male.id}`;
  await sql`insert into club_registration_applications(id,user_id,club_id,request_key,details,status,submitted_at) values('11111111-1111-4111-8111-111111111111','stats-member',${club.id},'stats','{}','pending',now()-interval '9 days')`;
  await sql`insert into club_scan_candidates(id,club_id,source_key,data,status) values('22222222-2222-4222-8222-222222222222',${club.id},'stats','{}','approved')`;
  await sql`insert into event_register_sources(source_key,name,host) values('stats-source','Synthetic source','example.test'),('unchecked','Unchecked source','unchecked.example')`;
  for (const [key, kind, state] of [
    ["1", "results", "extracted"],
    ["2", "fixture", "partial"],
    ["3", "results", "failed"],
    ["4", "results", "held"],
    ["5", "unclassified", "pending"],
    ["6", "results", "excluded"],
  ]) {
    await sql`insert into event_register_extraction_items(source_host,item_key,source_url,kind,state,records,result_rows,checked_at) values('example.test',${key},${`https://example.test/${key}`},${kind},${state},1,2,now())`;
  }
  await sql`insert into result_ingestion_runs(id,source_name,status,rows_detected,rows_imported,rows_updated,rows_skipped,error_count) values('stats-run','Synthetic provider','completed_with_errors',8,3,2,1,2)`;
  await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note,expected_rows) values('33333333-3333-4333-8333-333333333333',${result.edition_id},'Synthetic provider','race','https://example.test/race','Synthetic permission for isolated testing',2)`;
  const [entry] =
    await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash) values('33333333-3333-4333-8333-333333333333','unmatched','{"name":"Synthetic Unmatched"}',${"a".repeat(64)}) returning id`;
  await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash,canonical_result_id,applied_revision,review_state) values('33333333-3333-4333-8333-333333333333','linked','{"name":"Synthetic Linked"}',${"b".repeat(64)},${result.id},1,'linked')`;
  await sql`insert into result_archive_match_requests(entry_id,user_id,revision,note) values(${entry.id},'stats-member',1,'Synthetic matching request')`;
  for (const uid of ["stats-member", "stats-staff"])
    await sql`insert into result_claims(result_id,athlete_id,claimant_user_id,claimant_email,verification_method,declaration_accepted) values(${result.id},${male.id},${uid},${uid + "@example.test"},'other',true)`;
  await sql`insert into athlete_result_verification_requests(id,athlete_id,result_key,requested_by,result_snapshot,result_version) values('44444444-4444-4444-8444-444444444444',${male.id},${"r:" + result.id},'stats-member','{}','synthetic')`;
  await sql`insert into fixture_import_batches(id,snapshot_id,snapshot_created_at,source_record_count) values('stats-batch','stats-snapshot',now(),3)`;
  for (const status of ["eligible", "duplicate", "failed"])
    await sql`insert into fixture_candidates(id,batch_id,source_race_id,source_edition_id,source_id,source_url,source_row_hash,fingerprint,event_name,event_slug,event_date,payload,status,created_at) values(${status},'stats-batch','race',${status},'provider','https://example.test/race','hash',${status},${"Synthetic " + status},${"stats-" + status},'2027-01-01','{}',${status},now()-interval '35 days')`;
  await sql`insert into athlete_profile_result_confirmations(id,user_id,athlete_id,input_hash,snapshot,included_keys,excluded_keys,added_count) values('55555555-5555-4555-8555-555555555555','stats-member',${male.id},'hash','synthetic','[]','[]',2)`;

  assert.equal(
    (await read({ section: "results" })).rows.reduce((n, x) => n + x.count, 0),
    3,
  );
  for (const group of ["sport", "country", "distance", "year"]) {
    const report = await read({ section: "results", group });
    assert.equal(
      report.rows.reduce((n, x) => n + x.count, 0),
      3,
    );
    for (const row of report.rows)
      assert.equal(
        (await read({ section: "results", group, mode: "records", key: row.key })).total,
        row.count,
      );
  }
  const progress = await read({ section: "sources", group: "inventory" });
  const site = progress.rows.find((r) => r.key === "example.test");
  assert.equal(site.known, 4);
  assert.equal(site.extracted, 1);
  assert.equal(site.outstanding, 3);
  assert.equal(site.percent, 25);
  assert.equal(site.failed, 1);
  assert.equal(progress.rows.find((r) => r.key === "unchecked.example").percent, null);
  assert.equal(
    (await read({ section: "sources", group: "inventory", mode: "records", key: "example.test" }))
      .total,
    6,
  );
  const imports = await read({ section: "sources", group: "imports" });
  assert.equal(imports.rows[0].imported, 3);
  assert.equal(imports.rows[0].updated, 2);
  assert.equal(imports.rows[0].failed, 1);
  const datasets = await read({ section: "sources", group: "datasets" });
  assert.equal(datasets.rows[0].expected, 2);
  assert.equal(datasets.rows[0].observed, 2);
  assert.equal(datasets.rows[0].percent, 100);
  assert.equal(
    (
      await read({
        section: "sources",
        group: "datasets",
        mode: "records",
        key: datasets.rows[0].key,
      })
    ).total,
    2,
  );
  const matching = await read({ section: "matching" });
  assert.equal(
    matching.rows.find((r) => r.key === "Collected results: athlete still to be matched").count,
    1,
  );
  assert.equal(
    matching.rows.find(
      (r) => r.key === "The same result claimed by different people or flagged as conflicting",
    ).count,
    2,
  );
  const verified = await read({ section: "verification" });
  assert.equal(
    verified.rows.find((r) => r.key === "Main results: Checked against source").count,
    1,
  );
  assert.equal(
    verified.rows.find((r) => r.key === "Requests to check results: Waiting for review").count,
    1,
  );
  const missing = await read({ section: "gaps" });
  assert.equal(missing.rows.find((r) => r.key === "Athletes: missing nationality").count, 1);
  const dup = await read({ section: "duplicates" });
  assert.equal(
    dup.rows.find((r) => r.key === "Athletes sharing a name: check before merging").count,
    2,
  );
  assert.equal(
    dup.rows.find((r) => r.key === "One source result linked to different athletes").count,
    2,
  );
  const clubs = await read({ section: "clubs" });
  assert.equal(clubs.rows[0].athletes, 1, "first and second club are not double counted");
  assert.equal(clubs.rows[0].results, 2);
  assert.equal(clubs.rows[0].applications, 1);
  assert.equal(clubs.rows[0].missing, "Website and biography");
  const backlog = await read({ section: "backlog" });
  assert.equal(
    backlog.rows.find((r) => r.key === "Events found: Passed initial checks").older30,
    1,
  );
  assert(!backlog.rows.some((r) => r.key.includes("duplicate")));
  assert.equal(backlog.rows.find((r) => r.key === "Club findings: Approved").count, 1);
  const active = await read({ section: "activity" });
  assert.equal(active.rows.find((r) => r.key === "Athletes adding results").count, 1);
  assert.equal(active.rows.find((r) => r.key === "Accounts claiming a profile").count, 1);

  // Undated legacy rows stay unknown. No-op/timestamp-only updates are not edits.
  await sql`update results set stats_created_at=null where id=${result.id}`;
  await sql`delete from collection_stats_changes`;
  await sql`update events set name=name,updated_at=now()`;
  assert.equal((await sql`select count(*) n from collection_stats_changes`)[0].n, 0);
  await sql`update athletes set bio='Synthetic edit' where id=${male.id}`;
  await sql`update athletes set bio='Second edit today' where id=${male.id}`;
  assert.equal((await sql`select count(*) n from collection_stats_changes`)[0].n, 1);
  const growth = await read({ section: "growth" });
  assert.equal(growth.rows.find((r) => r.key === "results").undated, 1);
  assert.equal(growth.rows.find((r) => r.key === "athletes").updated, 1);
  const daily = await read({ section: "growth", group: "daily", days: 7 });
  assert.equal(daily.total, 7);
  assert.equal(
    daily.rows.reduce((n, x) => n + x.updated, 0),
    1,
  );
  const unknownDates = await read({ section: "growth", mode: "records", key: "undated" });
  assert.equal(unknownDates.total, 1);
  assert.equal(unknownDates.rows[0].detail, "Date first saved is unknown");
  const dayRecords = await read({
    section: "growth",
    group: "daily",
    mode: "records",
    key: daily.rows[0].drill,
  });
  assert(dayRecords.total > 0);
  const page90 = await read({ section: "growth", group: "daily", days: 90, page: 2 });
  assert.equal(page90.total, 90);
  assert.equal(page90.rows.length, 10);
  for (const section of Object.keys(operationSections)) {
    const report = await read({ section });
    for (const row of report.rows.filter((r) => r.drill)) {
      const details = await read({ section, key: row.drill, mode: "records" });
      assert(details.rows.every((r) => !r.href || r.href.startsWith("/admin/")));
    }
  }
  // Pagination is stable and complete, not a capped total.
  for (let i = 0; i < 43; i++)
    await sql`insert into clubs(slug,name) values(${`stats-page-${i}`},${`Pagination club ${String(i).padStart(2, "0")}`})`;
  const first = await read({ section: "clubs" }),
    second = await read({ section: "clubs", page: 1 });
  assert.equal(first.total, 44);
  assert.equal(first.rows.length, 40);
  assert.equal(second.rows.length, 4);
  assert.equal(new Set([...first.rows, ...second.rows].map((r) => r.key)).size, 44);
  console.log(
    "PASS: all 11 operations reports, real RPC access controls, counts, drill-downs, source denominators, overlap boundaries, aging, change tracking and pagination.",
  );

  const { verifySourceCoverage } = await import("./verify-source-coverage.mjs");
  if (!browser) await verifySourceCoverage({ sql, read });

  if (browser) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      extraHTTPHeaders: { authorization: "Bearer stats-token" },
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/admin/collection-stats?section=operations`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    const table = page.getByRole("table", { name: "Operations report table", exact: true });
    await table.getByRole("cell", { name: "Running", exact: true }).waitFor();
    await page.getByRole("button", { name: "See entries: Running", exact: true }).click();
    await page.getByRole("button", { name: "Back to report", exact: true }).waitFor();
    await table.getByRole("link", { name: "Open entry" }).first().waitFor();
    await page.getByRole("button", { name: "Back to report", exact: true }).click();
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("sources");
    await table.getByRole("cell", { name: "example.test", exact: true }).waitFor();
    await page.getByLabel("Show figures by", { exact: true }).selectOption("datasets");
    await table.getByRole("cell", { name: "100", exact: true }).waitFor();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download this page for Excel", exact: true }).click();
    assert((await readFile(await (await download).path(), "utf8")).includes('"Entries expected"'));
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("clubs");
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await page.getByText("Page 2", { exact: true }).waitFor();
    await page.getByLabel("Search this report", { exact: true }).fill("Synthetic Stats Club");
    await page.getByRole("button", { name: "Search report", exact: true }).click();
    await table.getByRole("cell", { name: "Synthetic Stats Club", exact: true }).waitFor();
    assert.equal(await table.locator("tbody tr").count(), 1);
    await page.getByRole("button", { name: "Clear search", exact: true }).click();
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("backlog");
    await table
      .getByRole("cell", { name: "Events found: Passed initial checks", exact: true })
      .waitFor();
    await page.screenshot({ path: "artifacts/collection-operations-desktop.png", fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("growth");
    await page.getByLabel("Show figures by", { exact: true }).selectOption("daily");
    await page.getByLabel("Reporting period", { exact: true }).selectOption("7");
    await page.getByRole("cell", { name: "1", exact: true }).first().waitFor();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "Operations mobile layout does not overflow",
    );
    await page.screenshot({ path: "artifacts/collection-operations-mobile.png", fullPage: true });
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("activity");
    await page
      .getByRole("region", { name: "Collection progress and work to do" })
      .getByText("Visits and account actions are separate totals.", { exact: false })
      .waitFor();
    await table.getByRole("cell", { name: "Athletes adding results", exact: true }).waitFor();
    await page
      .getByRole("link", { name: "Open website reporting and connections", exact: true })
      .waitFor();
    // Source fixtures mutate provenance, which is itself tracked as an edit.
    // Add them only after the existing growth checks have used their own fixture.
    await verifySourceCoverage({ sql, read });
    await page.getByRole("button", { name: "Sources & coverage", exact: true }).click();
    await page.getByRole("heading", { name: "Sources & coverage", exact: true }).waitFor();
    await table.getByRole("cell", { name: "fixtures.test · Running", exact: true }).waitFor();
    const refresh = page.getByLabel("Refresh stored figures every minute while this tab is open");
    assert.equal(await refresh.isChecked(), false);
    await refresh.check();
    await refresh.uncheck();
    await page.getByLabel("Show figures by", { exact: true }).selectOption("athleteSources");
    await table.getByRole("columnheader", { name: "Share of athletes (%)", exact: true }).waitFor();
    await page.getByRole("button", { name: "See entries: example.test", exact: true }).click();
    await page.getByRole("button", { name: "Back to report", exact: true }).click();
    await page.getByLabel("Show figures by", { exact: true }).selectOption("profileResults");
    await table.getByRole("columnheader", { name: "Source captured at", exact: true }).waitFor();
    await table.getByRole("cell", { name: "Unknown", exact: true }).first().waitFor();
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "Source coverage fits mobile",
    );
    await page.screenshot({ path: "artifacts/source-coverage-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.getByLabel("Show figures by", { exact: true }).selectOption("fixtures");
    await table.getByRole("cell", { name: "66.7", exact: true }).waitFor();
    await page.screenshot({ path: "artifacts/source-coverage-desktop.png", fullPage: true });
    // A failing endpoint shows an error, not an empty successful report.
    await page.route("**/_serverFn/**", (route) =>
      route.fulfill({ status: 503, body: "Unavailable" }),
    );
    await page.getByLabel("What would you like to see?", { exact: true }).selectOption("matching");
    await page
      .getByRole("alert")
      .filter({ hasText: "Figures are unavailable. This does not mean there are no entries" })
      .waitFor();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      "PASS: operations desktop/mobile navigation, drill-down, CSV, pagination, search, periods and failed-request state.",
    );
  }
}
