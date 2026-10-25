import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import * as crypto from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { runMarathonCollectorCli } from './collect-marathon-results.mjs';
import { runBrusselsCollectorCli } from './collect-brussels-results.mjs';
import { parseBrusselsPdf, brusselsSourceUrl, discoverBrusselsReports, runBrusselsCollection, documentTable } from './lib/brussels-document-collection.mjs';
import { loadArchiveCaptureTools } from './lib/marathon-collection-job.mjs';

const temp = await mkdtemp(resolve(tmpdir(), 'athrecs-brussels-test-'));
const sourceUrl = 'https://crdev.blob.core.windows.net/files/999999999.pdf'; // Synthetic fetch only.
const authority = 'Synthetic source authority for disposable regression testing.';
const tools = loadArchiveCaptureTools();
let db;
try {
  execFileSync(process.env.ATHRECS_PDF_PYTHON ?? 'python3', ['scripts/fixtures/brussels-pdf.py', temp]);
  const document = await parseBrusselsPdf(resolve(temp, 'valid.pdf'));
  assert.deepEqual([document.totalPages, document.totalRows], [2, 4]);
  assert.equal(document.pages[0].rows[1].original.name, 'SYNTHETIC Zoe Wrapped surname');
  const netDocument = await parseBrusselsPdf(resolve(temp, 'neto.pdf'));
  const netTable = documentTable(netDocument, { url: sourceUrl, capturedAt: '2099-10-04T12:00:00Z' });
  const netRows = tools.mapArchiveRows(netTable, tools.suggestColumns(netTable.headers));
  assert.equal(netRows[0].chipSeconds, 17942); assert.equal(netRows[0].gunSeconds, 18002);
  assert.equal(netRows[0].country, 'bel'); assert.equal(netRows[0].overallPlace, 1);
  assert.equal(netRows[0].original['Original: position'], 'B 1.');
  for (const [file, message] of [['half', /full Marathon/], ['heading', /timing headings/],
    ['duplicate', /Duplicate bib/], ['missing-name', /Missing bib\/name/], ['total', /Printed total/]])
    await assert.rejects(parseBrusselsPdf(resolve(temp, file + '.pdf')), message);
  for (const url of ['https://evil.example/files/1.pdf', sourceUrl + '?other=1', sourceUrl + '#page=1', sourceUrl.replace('https:', 'http:')])
    assert.throws(() => brusselsSourceUrl(url));
  let requests = 0;
  const bytes = await readFile(resolve(temp, 'valid.pdf'));
  const dependencies = { captureTools: tools, log: () => {}, fetch: async (url, options) => {
    requests++; assert.equal(url, sourceUrl); assert.equal(options.redirect, 'error'); assert.equal(options.credentials, 'omit');
    return new Response(bytes, { headers: { 'content-type': 'application/pdf' } });
  } };
  const job = resolve(temp, 'job');
  const args = ['--url', sourceUrl, '--job', job, '--authority', authority];
  const dry = await runMarathonCollectorCli(['--provider', 'brussels', ...args, '--dry-run'], dependencies);
  assert.equal(dry.state.confirmedPages, 1);
  await assert.rejects(stat(job), { code: 'ENOENT' });
  const partial = await runBrusselsCollectorCli([...args, '--max-pages', '1'], dependencies);
  assert.equal(partial.state.complete, false);
  const exportedPartial = await runBrusselsCollectorCli(['--job', job, '--export-only'], dependencies);
  assert.equal(exportedPartial.exported.manifest.savedRows, 2);
  assert.equal(exportedPartial.exported.manifest.complete, false);
  const before = requests;
  const done = await runMarathonCollectorCli(['--provider', 'brussels', '--job', job, '--resume'], dependencies);
  assert.equal(done.state.complete, true); assert.equal(done.state.rows, 4);
  await runBrusselsCollectorCli(['--job', job, '--resume'], dependencies);
  assert.equal(requests, before, 'Resume/export never refetch a retained document');
  const bounded = await runBrusselsCollection({ directory: job, exportOnly: true, maxBytes: 2000 });
  assert(bounded.exported.manifest.parts.length > 1);
  const rows = [];
  for (const part of bounded.exported.manifest.parts) {
    const file = resolve(bounded.exported.directory, part.file), csv = await readFile(file, 'utf8');
    assert.equal((await stat(file)).mode & 0o077, 0);
    assert(Buffer.byteLength(csv) <= 2000);
    const table = tools.parseDelimited(csv);
    rows.push(...tools.mapArchiveRows(table, tools.suggestColumns(table.headers)));
  }
  assert.equal(rows[0].country, 'FIN'); assert.equal(rows[1].country, '');
  assert.equal(rows[0].chipSeconds, null); assert.equal(rows[0].gunSeconds, 18062); assert.equal(rows[0].finishSeconds, 18002);
  assert.deepEqual(rows.map(row => row.status), ['finished', 'finished', 'DNF', 'DQ']);
  assert.equal(rows[2].finishSeconds, null); assert.equal(rows[2].overallPlace, null);
  assert.equal(rows[0].original['PDF page'], '1');
  for (const code of [403, 429]) {
    let calls = 0;
    await assert.rejects(runBrusselsCollection({ directory: resolve(temp, `blocked-${code}`), url: sourceUrl, authority,
      fetch: async () => { calls++; return new Response('blocked', { status: code }); } }), new RegExp(`HTTP ${code}`));
    assert.equal(calls, 1);
  }
  const controller = new AbortController();
  const interruptedJob = resolve(temp, 'interrupted');
  await assert.rejects(runBrusselsCollection({ ...dependencies, directory: interruptedJob, url: sourceUrl, authority,
    signal: controller.signal, onProgress: () => controller.abort(Error('test interrupt')) }), /test interrupt/);
  const resumed = await runBrusselsCollection({ directory: interruptedJob, resume: true });
  assert.equal(resumed.state.rows, 4);
  await writeFile(resolve(job, 'source.pdf'), Buffer.from('%PDF-damaged'));
  await assert.rejects(runBrusselsCollection({ directory: job, resume: true }), /PDF integrity/);
  const index = 'https://prod.chronorace.be/Classements/ListeRapports.aspx?eventId=999999999';
  const discovery = await discoverBrusselsReports(index, { fetch: async () => new Response(`<a href="${sourceUrl}">Details</a><a href="https://evil.example/report.pdf">Ignore</a>`, { headers: { 'content-type': 'text/html' } }) });
  assert.deepEqual(discovery.reports.map(report => report.url), [sourceUrl]);

  // Real archive SQL, all migrations, disposable database. No production writes.
  db = new PGlite(); await db.waitReady;
  for (const name of readdirSync('migrations').filter(name => name.endsWith('.sql')).sort()) await db.exec(readFileSync(`migrations/${name}`, 'utf8'));
  const sqlFor = connection => {
    const query = async (text, parameters = []) => (await connection.query(text, parameters)).rows;
    const sql = async (parts, ...values) => query(parts.reduce((s, part, i) => s + (i ? `$${i}` : '') + part, ''), values);
    sql.query = query; sql.transaction = work => db.transaction(tx => work(sqlFor(tx))); return sql;
  };
  const sql = sqlFor(db), ts = createRequire(import.meta.url)('typescript'), module = { exports: {} };
  new Function('require', 'module', 'exports', ts.transpileModule(readFileSync('src/lib/results-archive/service.server.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText)(name => { if (name === 'node:crypto') return crypto; if (name === './core') return tools; throw Error(name); }, module, module.exports);
  const service = module.exports, actor = { userId: 'brussels-test-staff', staffEmail: 'brussels@example.test' };
  await sql`insert into "user"(id,name,email,"emailVerified") values(${actor.userId},'Synthetic Staff',${actor.staffEmail},true)`;
  const [event] = await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('synthetic-brussels','Synthetic Brussels','Running','BE','','','Road','Synthetic') returning id`;
  const [edition] = await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2099-10-04','Marathon',42.195,'Finished') returning id`;
  const dataset = await service.createArchiveDataset(sql, { editionId: Number(edition.id), provider: 'Synthetic ChronoRace',
    sourceRaceKey: sourceUrl, sourceUrl, permissionNote: authority, expectedRows: 4 }, actor);
  const ingest = r => service.ingestArchiveBatch(sql, { datasetId: dataset.id, requestId: crypto.randomUUID(), rows: r }, actor);
  const inserted = await ingest(rows); assert.equal(inserted.inserted, 4);
  const fresh = structuredClone(rows); fresh.forEach(row => { row.original._capture_checked_at = '2099-10-05T12:00:00Z'; });
  const replay = await ingest(fresh); assert.equal(replay.unchanged, 4); assert.equal(replay.revised, 0);
  fresh[0].name = 'CORRECTED Synthetic'; fresh[0].original['Athlete Name'] = fresh[0].name;
  const revision = await ingest(fresh); assert.equal(revision.revised, 1); assert.equal(revision.unchanged, 3);
  const [counts] = await sql`select (select count(*) from results)::int results,(select count(*) from athletes)::int athletes`;
  assert.deepEqual(counts, { results: 0, athletes: 0 });
  console.log('Brussels collector passed: actual dual PDF reader, strict layouts/counts, wrapped names, statuses/nationalities/timing, CLI dispatch, resume, partial/bounded CSV, 403/429, corruption, discovery, archive replay/revision and no profile publication.');
} finally { if (db) await db.close(); await rm(temp, { recursive: true, force: true }); }
