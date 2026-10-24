// Synthetic source responses, inert browser parsing and disposable SQL only.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { tmpdir, hostname } from 'node:os';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import * as crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { PGlite } from '@electric-sql/pglite';
import { resultCollectionScope } from '../src/lib/results-archive/collection-provider.ts';
import { marathonPageReaderExpression } from './lib/marathon-page-collection.mjs';
import { londonFixtureUrl, londonPaginationFixture } from './fixtures/london-pagination.mjs';
import { runMarathonCollectorCli } from './collect-marathon-results.mjs';
import { runCollectionJob, exportCollectionCsv, loadArchiveCaptureTools } from './lib/marathon-collection-job.mjs';

const temporary = await mkdtemp(resolve(tmpdir(), 'athrecs-marathon-test-'));
const tools = loadArchiveCaptureTools();
const scopeFor = resultCollectionScope;
const authority = 'Synthetic source authority for disposable regression testing only.';
const browser = await chromium.launch({ headless: true,
  executablePath: process.env.ATHRECS_TEST_CHROMIUM_EXECUTABLE ?? process.env.CHROMIUM_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
let db;
try {
  const logs = [];
  const requests = [];
  let clock = 10000;
  let blockedStatus = null;
  let revised = false;
  const htmlFor = page => londonPaginationFixture(page)
    .replaceAll('Synthetic AC', 'Synthetic "Example", AC')
    .replace('00:31:00', revised ? '00:31:01.2500' : '00:31:00.2500')
    + '<script>throw Error("Source scripts must never execute")</script><img src="https://never-contact.example.test/pixel">';
  const syntheticFetch = async (address, options) => {
    assert.equal(options.redirect, 'error');
    assert.equal(options.credentials, 'omit');
    assert(options.signal instanceof AbortSignal);
    const page = Number(new URL(address).searchParams.get('page'));
    requests.push({ page, at: clock });
    const response = new Response(page === 2 && blockedStatus ? 'Blocked synthetic source' : htmlFor(page), {
      status: page === 2 && blockedStatus ? blockedStatus : 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
    Object.defineProperty(response, 'url', { value: address });
    return response;
  };
  const dependencies = {
    fetch: syntheticFetch, captureTools: tools, log: value => logs.push(value),
    sleep: async milliseconds => { assert(milliseconds > 0 && milliseconds <= 2000); clock += milliseconds; },
    now: () => clock,
    launchBrowser: async () => ({ newContext: options => browser.newContext(options), close: async () => {} }),
  };
  const directory = resolve(temporary, 'cli-job');
  const start = ['--url', londonFixtureUrl, '--job', directory, '--authority', authority];
  const dry = await runMarathonCollectorCli([...start, '--dry-run'], dependencies);
  assert.deepEqual([dry.pageRows, dry.totalPages, dry.totalRows], [2, 3, 5]);
  await assert.rejects(stat(directory), { code: 'ENOENT' });

  const partial = await runMarathonCollectorCli([...start, '--max-pages', '1'], dependencies);
  assert.equal(partial.state.pages.length, 1);
  assert.equal(partial.state.complete, false);
  const partialExport = await runMarathonCollectorCli(['--job', directory, '--export-only'], dependencies);
  assert.equal(partialExport.exported.manifest.complete, false);
  assert.equal(partialExport.exported.manifest.savedRows, 2);
  assert(logs.some(value => value.includes('PARTIAL collection')));

  for (const status of [429, 403]) {
    blockedStatus = status;
    const before = requests.length;
    await assert.rejects(runMarathonCollectorCli(['--job', directory, '--resume'], dependencies), new RegExp(`HTTP ${status}`));
    assert.equal(requests.length, before + 1, 'A blocked response is never retried automatically');
    assert.equal(requests.at(-1).page, 2, 'Resume requests the next unconfirmed page');
    const saved = JSON.parse(await readFile(resolve(directory, 'checkpoint.json'), 'utf8')).state;
    assert.equal(saved.pages.length, 1);
    assert.equal(saved.status, 'paused');
  }
  blockedStatus = null;
  const beforeResume = requests.length;
  const completed = await runMarathonCollectorCli(['--job', directory, '--resume'], dependencies);
  assert.deepEqual(requests.slice(beforeResume).map(item => item.page), [2, 3]);
  assert.equal(completed.state.complete, true);
  assert.equal(completed.state.rows, 5);
  assert.equal(completed.exported.manifest.complete, true);
  // Skip the separate one-page dry run; all job requests obey the persisted delay.
  for (let i = 2; i < requests.length; i++) assert(requests[i].at - requests[i - 1].at >= 2000);
  const beforeCompleteResume = requests.length;
  await runMarathonCollectorCli(['--job', directory, '--resume'], dependencies);
  assert.equal(requests.length, beforeCompleteResume, 'A completed job does not refetch source pages');

  const bounded = await exportCollectionCsv({ directory, captureTools: tools, scopeFor, maxBytes: 2000 });
  assert(bounded.manifest.parts.length > 1, 'Small part budget exercises splitting at row boundaries');
  const allRows = [];
  for (const part of bounded.manifest.parts) {
    const path = resolve(bounded.directory, part.file);
    const csv = await readFile(path, 'utf8');
    assert(Buffer.byteLength(csv) <= 2000);
    assert.equal(createHash('sha256').update(csv).digest('hex'), part.sha256);
    assert.equal((await stat(path)).mode & 0o077, 0, 'Export files are private');
    const table = tools.parseDelimited(csv);
    const mapping = tools.suggestColumns(table.headers);
    assert.equal(mapping.name, 'Athlete Name');
    assert.equal(mapping.country, 'Country');
    const rows = tools.mapArchiveRows(table, mapping);
    assert.equal(rows.length, part.rows);
    allRows.push(...rows);
  }
  assert.equal(allRows.length, 5);
  assert.equal(new Set(allRows.map(row => row.sourceKey)).size, 5);
  assert.equal(allRows[0].sourceKey, 'bib:9001');
  assert.equal(allRows[0].name, 'Morgan Browser Synthetic');
  assert.equal(allRows[0].country, 'IRL');
  assert.equal(allRows[0].club, 'Synthetic "Example", AC');
  assert.equal(allRows[0].finishSeconds, 1860.25);
  assert.equal(allRows[0].chipSeconds, null);
  assert.equal(allRows[0].gunSeconds, null);
  assert.equal(allRows[0].original['Finish Time'], '00:31:00.2500', 'Source precision is retained verbatim');
  assert.equal(allRows[0].original['Original 4: Name'], 'Synthetic, Morgan Browser (IRL)');
  assert(allRows[0].original._capture_row_links.includes('idp=synthetic-9001'));
  assert(allRows[0].original._capture_checked_at);
  assert(allRows[0].original._capture_source_url.includes('page=1'));
  assert(allRows[0].original._capture_notes.includes('unofficial results'));
  for (const path of [directory, resolve(directory, 'pages'), resolve(directory, 'checkpoint.json'),
    resolve(directory, 'pages/page-0001.athrecs.json')]) assert.equal((await stat(path)).mode & 0o077, 0);

  // Unsupported providers are rejected before opening a browser or fetching a page.
  const noWork = { launchBrowser: () => { throw Error('Unexpected browser'); }, fetch: () => { throw Error('Unexpected network'); } };
  await assert.rejects(runMarathonCollectorCli(['--url', londonFixtureUrl.replace('results.tcslondonmarathon.com', 'results.chicagomarathon.com'),
    '--authority', authority, '--dry-run'], noWork), /inspected results-page sample/);
  await assert.rejects(runMarathonCollectorCli([...start, '--max-pages', '0'], noWork), /between 1 and 500/);
  for (const [body, contentType, pattern] of [
    ['Unsupported charset', 'text/html; charset=iso-8859-1', /requires UTF-8/],
    [new Uint8Array([0xc3, 0x28]), 'text/html; charset=utf-8', /not valid for encoding/],
  ]) {
    await assert.rejects(runMarathonCollectorCli([...start, '--dry-run'], { ...dependencies,
      fetch: async () => new Response(body, { headers: { 'content-type': contentType } }) }), pattern);
  }

  // Dependency-injected state engine: changed pages, corruption, interruption and locks.
  const context = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' });
  await context.route('**/*', route => route.abort());
  const parser = await context.newPage();
  const expression = marathonPageReaderExpression();
  const parse = (address, html) => parser.evaluate(({ address: url, html: source, expression: reader }) =>
    (0, eval)(reader)(new DOMParser().parseFromString(source, 'text/html'), url), { address, html, expression });
  const engine = jobName => ({ directory: resolve(temporary, jobName), startUrl: londonFixtureUrl,
    authorityNote: authority, captureTools: tools, scopeFor,
    sleep: async milliseconds => { clock += milliseconds; }, now: () => clock,
    readPage: address => parse(address, londonPaginationFixture(Number(new URL(address).searchParams.get('page')))) });
  const wrongFirst = await parse(londonFixtureUrl, londonPaginationFixture(1));
  const different = new URL(wrongFirst.capture.page.url);
  different.searchParams.set('event', 'synthetic-other-division');
  wrongFirst.capture.page.url = different.href;
  wrongFirst.scope = scopeFor(different.href);
  await assert.rejects(runCollectionJob({ ...engine('wrong-first-scope'), readPage: async () => wrongFirst }), /requested page or filters/);
  for (const [name, fixtureOptions, pattern] of [
    ['duplicate', { repeated: true }, /repeated across pages/],
    ['changed-total', { total: 6 }, /totals changed/],
    ['changed-header', { wrongHeader: true }, /column headings have changed/],
  ]) {
    const options = engine(name);
    await runCollectionJob({ ...options, maxPages: 1 });
    await assert.rejects(runCollectionJob({ ...options, resume: true,
      readPage: address => parse(address, londonPaginationFixture(2, fixtureOptions)) }), pattern);
    assert.equal(JSON.parse(await readFile(resolve(options.directory, 'checkpoint.json'), 'utf8')).state.pages.length, 1);
  }
  const corrupted = engine('corrupt-file');
  await runCollectionJob({ ...corrupted, maxPages: 1 });
  const pageFile = resolve(corrupted.directory, 'pages/page-0001.athrecs.json');
  await writeFile(pageFile, (await readFile(pageFile, 'utf8')).replace('9001', '9999'));
  await assert.rejects(runCollectionJob({ ...corrupted, resume: true, readPage: () => { throw Error('Must validate before network'); } }), /integrity check/);

  const corruptedCheckpoint = engine('corrupt-checkpoint');
  await runCollectionJob({ ...corruptedCheckpoint, maxPages: 1 });
  const checkpoint = resolve(corruptedCheckpoint.directory, 'checkpoint.json');
  await writeFile(checkpoint, (await readFile(checkpoint, 'utf8')).replace('"rows":2', '"rows":3'));
  await assert.rejects(runCollectionJob({ ...corruptedCheckpoint, resume: true }), /Checkpoint integrity/);

  const interrupted = engine('interrupted');
  const controller = new AbortController();
  await assert.rejects(runCollectionJob({ ...interrupted, signal: controller.signal,
    onProgress: () => controller.abort(new Error('Synthetic interruption')) }), /Synthetic interruption/);
  const resumedPages = [];
  const resumed = await runCollectionJob({ ...interrupted, resume: true, readPage: async (address, options) => {
    resumedPages.push(Number(new URL(address).searchParams.get('page')));
    return interrupted.readPage(address, options);
  } });
  assert.deepEqual(resumedPages, [2, 3]);
  assert.equal(resumed.rows, 5);

  const reported = engine('final-report-error');
  await assert.rejects(runCollectionJob({ ...reported, onProgress: progress => {
    if (progress.complete) throw Error('Synthetic final progress report error');
  } }), /final progress report error/);
  const stillComplete = await runCollectionJob({ ...reported, resume: true,
    readPage: () => { throw Error('A completed job must not be fetched again'); } });
  assert.equal(stillComplete.complete, true, 'Reporting failure cannot corrupt confirmed completion');

  const orphaned = engine('orphan-page');
  const orphanState = await runCollectionJob({ ...orphaned, maxPages: 1 });
  const orphanPage = await orphaned.readPage(orphanState.nextUrl);
  await writeFile(resolve(orphaned.directory, 'pages/page-0002.athrecs.json'), JSON.stringify(orphanPage.capture), { mode: 0o600 });
  const orphanRequests = [];
  await runCollectionJob({ ...orphaned, resume: true, readPage: async (address, options) => {
    orphanRequests.push(Number(new URL(address).searchParams.get('page')));
    return orphaned.readPage(address, options);
  } });
  assert.deepEqual(orphanRequests, [2, 3], 'An unconfirmed orphan file does not skip its source page');

  const timeout = engine('request-timeout');
  await assert.rejects(runCollectionJob({ ...timeout, timeoutMs: 10, readPage: (_address, { signal }) =>
    new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })) }), /timeout/i);
  assert.equal(JSON.parse(await readFile(resolve(timeout.directory, 'checkpoint.json'), 'utf8')).state.pages.length, 0);

  const locked = engine('locked');
  let enter, proceed;
  const entered = new Promise(resolveEnter => { enter = resolveEnter; });
  const gate = new Promise(resolveProceed => { proceed = resolveProceed; });
  const active = runCollectionJob({ ...locked, maxPages: 1, readPage: async address => { enter(); await gate; return locked.readPage(address); } });
  await entered;
  await assert.rejects(runCollectionJob({ ...locked, resume: true }), /already open/);
  proceed();
  await active;

  const stale = engine('stale-lock');
  await runCollectionJob({ ...stale, maxPages: 1 });
  const exited = spawnSync(process.execPath, ['-e', '']);
  assert.equal(exited.status, 0);
  await writeFile(resolve(stale.directory, 'job.lock'), JSON.stringify({ pid: exited.pid, host: hostname(), nonce: randomUUID() }), { mode: 0o600 });
  let enteredRecovery, releaseRecovery;
  const recoveryEntered = new Promise(done => { enteredRecovery = done; });
  const recoveryGate = new Promise(done => { releaseRecovery = done; });
  const recovering = { ...stale, resume: true, maxPages: 1, readPage: async address => {
    enteredRecovery(); await recoveryGate; return stale.readPage(address);
  } };
  const recoveries = Promise.allSettled([runCollectionJob(recovering), runCollectionJob(recovering)]);
  await recoveryEntered;
  releaseRecovery();
  const recovered = await recoveries;
  assert.equal(recovered.filter(result => result.status === 'fulfilled').length, 1, 'Only one stale-lock claimant writes the job');
  assert.equal(recovered.filter(result => result.status === 'rejected').length, 1);
  await context.close();

  // Actual archive service demonstrates idempotence and genuine revisions after CSV import.
  db = new PGlite();
  await db.waitReady;
  const sqlFor = connection => {
    const query = async (text, parameters = []) => (await connection.query(text, parameters)).rows;
    const sql = async (parts, ...values) => {
      let text = parts[0]; values.forEach((_, index) => { text += `$${index + 1}${parts[index + 1]}`; });
      return query(text, values);
    };
    sql.query = query;
    sql.transaction = work => db.transaction(transaction => work(sqlFor(transaction)));
    return sql;
  };
  const sql = sqlFor(db);
  for (const name of readdirSync('migrations').filter(name => name.endsWith('.sql')).sort()) await db.exec(readFileSync(`migrations/${name}`, 'utf8'));
  const ts = createRequire(import.meta.url)('typescript');
  const module = { exports: {} };
  new Function('require', 'module', 'exports', ts.transpileModule(readFileSync('src/lib/results-archive/service.server.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText)(name => {
    if (name === 'node:crypto') return crypto;
    if (name === './core') return tools;
    throw Error(`Unexpected service dependency ${name}`);
  }, module, module.exports);
  const service = module.exports;
  const actor = { userId: 'local-collector-test-staff', staffEmail: 'collector@example.test' };
  await sql`insert into "user"(id,name,email,"emailVerified") values(${actor.userId},'Synthetic Collector Staff',${actor.staffEmail},true)`;
  const [event] = await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('local-collector-synthetic','Synthetic Local Collector Race','Running','GB','','','Road','Synthetic') returning id`;
  const [edition] = await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-10-01','Marathon',42.195,'Finished') returning id`;
  const dataset = await service.createArchiveDataset(sql, { editionId: Number(edition.id), provider: 'Synthetic Local Collector',
    sourceRaceKey: 'synthetic-local-collector', sourceUrl: londonFixtureUrl, permissionNote: authority, expectedRows: null }, actor);
  const insert = await service.ingestArchiveBatch(sql, { datasetId: dataset.id, requestId: randomUUID(), rows: allRows }, actor);
  assert.deepEqual([insert.inserted, insert.revised, insert.unchanged], [5, 0, 0]);
  const replay = await service.ingestArchiveBatch(sql, { datasetId: dataset.id, requestId: randomUUID(), rows: allRows }, actor);
  assert.deepEqual([replay.inserted, replay.revised, replay.unchanged], [0, 0, 5]);
  revised = true;
  const revisedDirectory = resolve(temporary, 'revised-source');
  const fresh = await runMarathonCollectorCli(['--url', londonFixtureUrl, '--job', revisedDirectory, '--authority', authority], dependencies);
  const freshRows = [];
  for (const part of fresh.exported.manifest.parts) {
    const table = tools.parseDelimited(await readFile(resolve(fresh.exported.directory, part.file), 'utf8'));
    freshRows.push(...tools.mapArchiveRows(table, tools.suggestColumns(table.headers)));
  }
  const change = await service.ingestArchiveBatch(sql, { datasetId: dataset.id, requestId: randomUUID(), rows: freshRows }, actor);
  assert.deepEqual([change.inserted, change.revised, change.unchanged], [0, 1, 4], 'A fresh capture timestamp does not revise unchanged results');
  const [counts] = await sql`select (select count(*) from result_archive_entries)::int entries,(select count(*) from results)::int canonical,(select count(*) from athletes)::int athletes`;
  assert.deepEqual(counts, { entries: 5, canonical: 0, athletes: 0 }, 'Collection and archive import do not create profiles or canonical results');
  console.log('Local marathon collector passed: inert shared parser, CLI dry run, private atomic checkpoints, 403/429 stop, restart/resume, integrity checks, bounded CSV round trip, genuine archive replay/revision and no profile publication.');
} finally {
  if (db) await db.close();
  await browser.close();
  await rm(temporary, { recursive: true, force: true });
}
