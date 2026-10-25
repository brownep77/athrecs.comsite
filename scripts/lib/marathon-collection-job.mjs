import { createHash, randomUUID } from 'node:crypto';
import { hostname } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { mkdir, open, readFile, rename, unlink, lstat } from 'node:fs/promises';

export const MAX_CAPTURE_BYTES = 25 * 1024 * 1024;
export const REQUEST_DELAY_MS = 2000;
const FORMAT = 'athrecs-marathon-collection-job-v1';
const hash = value => createHash('sha256').update(value).digest('hex');
const json = value => JSON.stringify(value);
const equal = (a, b) => json(a) === json(b);
const fail = message => { throw new Error(message); };

/** Reuse the application's validators without changing its bundler-oriented imports. */
export function loadArchiveCaptureTools() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/lib/results-archive');
  const require = createRequire(import.meta.url);
  const ts = require('typescript');
  const cache = new Map();
  const load = path => {
    if (!path.startsWith(root + sep)) fail('Archive loader escaped its allowed source directory.');
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    const code = ts.transpileModule(readFileSync(path, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText;
    new Function('require', 'module', 'exports', code)(specifier => {
      if (specifier === 'zod') return require('zod');
      if (!specifier.startsWith('./')) fail(`Unsupported archive dependency: ${specifier}`);
      return load(resolve(dirname(path), specifier.endsWith('.ts') ? specifier : `${specifier}.ts`));
    }, module, module.exports);
    return module.exports;
  };
  return { ...load(resolve(root, 'core.ts')), ...load(resolve(root, 'browser-capture.ts')) };
}

export async function privateDirectory(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077))
    fail('Use a dedicated private job directory with permissions 0700, not a shared folder.');
}

export async function privateRead(path, limit) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) || stat.size > limit)
    fail(`Unsafe permissions, file type or size: ${path}`);
  return readFile(path, 'utf8');
}

/** A capture or checkpoint is either wholly replaced or left untouched. */
export async function atomicWrite(path, content) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(content);
    await handle.sync();
    await handle.close();
    handle = null;
    await rename(temporary, path);
    const directory = await open(dirname(path), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  } finally {
    if (handle) await handle.close();
    await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

export async function lockDirectory(directory) {
  await privateDirectory(directory);
  const path = resolve(directory, 'job.lock');
  const value = json({ pid: process.pid, host: hostname(), nonce: randomUUID() });
  const claim = async () => {
    const file = await open(path, 'wx', 0o600);
    try { await file.writeFile(value); } finally { await file.close(); }
  };
  try { await claim(); } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    // Only one process may inspect/reclaim a dead owner's lock. Re-read it after
    // acquiring this guard; a prior reader must never unlink a newly acquired lock.
    const guardPath = resolve(directory, 'job-recovery.lock');
    let guard;
    try { guard = await open(guardPath, 'wx', 0o600); }
    catch (e) { if (e.code === 'EEXIST') fail('Another process is checking this job lock. If it was interrupted, confirm all collectors are stopped before removing job-recovery.lock.'); throw e; }
    try {
      const lock = JSON.parse(await privateRead(path, 4096));
      if (lock.host !== hostname() || !Number.isInteger(lock.pid) || lock.pid < 1)
        fail('The job has an unfamiliar lock. Check that no other collector is using it.');
      let running = true;
      try { process.kill(lock.pid, 0); } catch (e) { if (e.code === 'ESRCH') running = false; }
      if (running) fail('This job is already open in another collector process.');
      await unlink(path);
      // A normal new claimant can win this exclusive create; it cannot be removed.
      try { await claim(); } catch (e) { if (e.code === 'EEXIST') fail('This job is already open in another collector process.'); throw e; }
    } finally { await guard.close(); await unlink(guardPath); }
  }
  return async () => {
    if (await privateRead(path, 4096) === value) await unlink(path);
  };
}

async function saveState(directory, state) {
  state.updatedAt = new Date().toISOString();
  await atomicWrite(resolve(directory, 'checkpoint.json'), json({ format: FORMAT, sha256: hash(json(state)), state }) + '\n');
}

async function readState(directory) {
  const wrapper = JSON.parse(await privateRead(resolve(directory, 'checkpoint.json'), 4 * 1024 * 1024));
  if (wrapper.format !== FORMAT || hash(json(wrapper.state)) !== wrapper.sha256)
    fail('Checkpoint integrity check failed. Preserve the job files for review.');
  const state = wrapper.state;
  if (!state || !Array.isArray(state.pages) || state.pages.length > 500 ||
      typeof state.authorityNote !== 'string' || state.authorityNote.trim().length < 12 || state.authorityNote.length > 2000 ||
      typeof state.startUrl !== 'string' || !['running', 'paused', 'complete'].includes(state.status))
    fail('Unsupported or incomplete collection checkpoint.');
  return state;
}

function inspect(capture, captureTools) {
  const content = json(capture);
  if (Buffer.byteLength(content) > MAX_CAPTURE_BYTES) fail('A captured page exceeds the 25 MiB import limit.');
  const parsed = captureTools.parseBrowserCapture(content);
  const rows = captureTools.mapArchiveRows(parsed.table, parsed.mapping);
  return { parsed, rows, keys: rows.map(row => row.sourceKey), content };
}

function validatePage(page, state, seen, options) {
  const expectedPage = state.pages.length + 1;
  if (!page || page.page !== expectedPage || !Number.isInteger(page.totalRows) || page.totalRows < 1 || page.totalRows > 1000000 ||
      !Number.isInteger(page.pageSize) || page.pageSize < 1 || page.pageSize > 5000 ||
      page.totalPages !== Math.ceil(page.totalRows / page.pageSize) || page.totalPages > 500 ||
      typeof page.filterLabel !== 'string' || !page.filterLabel || page.filterLabel.length > 500)
    fail('The page number, source totals or filters are invalid.');
  const checked = inspect(page.capture, options.captureTools);
  const address = checked.parsed.sourceUrl;
  const scope = options.scopeFor(address);
  if (scope !== page.scope || Number(new URL(address).searchParams.get('page')) !== expectedPage ||
      checked.rows.length !== Math.min(page.pageSize, page.totalRows - (expectedPage - 1) * page.pageSize))
    fail('The captured page does not match its source page, filters or row count.');
  if (scope !== options.scopeFor(state.nextUrl) || Number(new URL(state.nextUrl).searchParams.get('page')) !== expectedPage)
    fail('The response changed the requested page or filters.');
  const source = {
    scope, totalRows: page.totalRows, totalPages: page.totalPages, pageSize: page.pageSize,
    filterLabel: page.filterLabel, headers: checked.parsed.table.headers,
    providerId: page.providerId ?? null,
  };
  if (state.source && !equal(source, state.source)) fail('Source headings, filters or totals changed. The saved pages are retained.');
  if (checked.keys.some(key => seen.has(key))) fail('A source result ID or bib repeated across pages.');
  if (expectedPage < page.totalPages) {
    if (typeof page.next !== 'string' || options.scopeFor(page.next) !== scope ||
        Number(new URL(page.next).searchParams.get('page')) !== expectedPage + 1)
      fail('The source did not supply a valid next-page link.');
  } else if (page.next !== null) fail('The source supplied pages beyond its stated total.');
  return { ...checked, source };
}

/** Re-read every committed file before resume/export; never trust counters alone. */
async function verifySaved(directory, state, options) {
  const seen = new Set();
  const rebuilt = { ...state, pages: [], source: null, nextUrl: state.startUrl };
  for (const entry of state.pages) {
    const expectedName = `page-${String(rebuilt.pages.length + 1).padStart(4, '0')}.athrecs.json`;
    if (entry.file !== expectedName) fail('Checkpoint contains an unexpected page filename.');
    const content = await privateRead(resolve(directory, 'pages', entry.file), MAX_CAPTURE_BYTES);
    if (hash(content) !== entry.sha256) fail(`Saved page ${entry.page} failed its integrity check.`);
    const page = { ...state.source, page: entry.page, capture: JSON.parse(content), next: entry.next };
    const checked = validatePage(page, rebuilt, seen, options);
    if (entry.rows !== checked.rows.length || entry.url !== checked.parsed.sourceUrl || entry.capturedAt !== checked.parsed.capturedAt || entry.keysSha256 !== hash(json(checked.keys)))
      fail(`Saved page ${entry.page} does not match its checkpoint.`);
    checked.keys.forEach(key => seen.add(key));
    rebuilt.source = checked.source;
    rebuilt.pages.push(entry);
    rebuilt.nextUrl = entry.next;
  }
  if (!equal(rebuilt.source, state.source) || rebuilt.nextUrl !== state.nextUrl || state.rows !== seen.size ||
      state.complete !== Boolean(state.source && state.pages.length === state.source.totalPages && seen.size === state.source.totalRows && state.nextUrl === null) ||
      (state.status === 'complete') !== state.complete)
    fail('Checkpoint progress is inconsistent with the saved pages.');
  return seen;
}

const defaultSleep = (ms, signal) => new Promise((resolveSleep, reject) => {
  const abort = () => { clearTimeout(timer); reject(signal.reason); };
  const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolveSleep(); }, ms);
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
});

/** No transport or database dependency: one observed source page is confirmed at a time. */
export async function runCollectionJob(options) {
  const directory = resolve(options.directory);
  const maxPages = options.maxPages ?? 500;
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 500) fail('Use a page budget between 1 and 500.');
  if (options.timeoutMs !== undefined && (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1 || options.timeoutMs > 20000))
    fail('Request timeout must be between 1 and 20,000 milliseconds.');
  const release = await lockDirectory(directory);
  let state;
  try {
    await privateDirectory(resolve(directory, 'pages'));
    if (options.resume) {
      state = await readState(directory);
      if (options.startUrl && options.startUrl !== state.startUrl) fail('Resume must use the original starting URL.');
      if (options.authorityNote && options.authorityNote !== state.authorityNote) fail('Resume must retain the original authority note.');
    } else {
      try { await lstat(resolve(directory, 'checkpoint.json')); fail('This job already exists. Use --resume or a new private directory.'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (typeof options.authorityNote !== 'string' || options.authorityNote.trim().length < 12 || options.authorityNote.length > 2000)
        fail('Supply a meaningful authority-to-retain note (12–2,000 characters).');
      options.scopeFor(options.startUrl);
      if (new URL(options.startUrl).searchParams.get('page') !== '1') fail('Start on the source’s observed page 1 URL.');
      state = { id: randomUUID(), createdAt: new Date().toISOString(), updatedAt: '', authorityNote: options.authorityNote,
        startUrl: options.startUrl, source: null, pages: [], rows: 0, nextUrl: options.startUrl,
        complete: false, status: 'paused', lastError: null, lastRequestAt: null };
      await saveState(directory, state);
    }
    const seen = await verifySaved(directory, state, options);
    if (state.complete) return state;
    state.status = 'running'; state.lastError = null;
    const now = options.now ?? Date.now;
    const sleep = options.sleep ?? defaultSleep;
    let collected = 0;
    try {
      while (state.nextUrl && collected < maxPages) {
        options.signal?.throwIfAborted();
        const wait = state.lastRequestAt === null ? 0 : Math.max(0, REQUEST_DELAY_MS - (now() - state.lastRequestAt));
        if (wait) await sleep(wait, options.signal);
        options.signal?.throwIfAborted();
        state.lastRequestAt = now();
        await saveState(directory, state);
        const timeout = AbortSignal.timeout(options.timeoutMs ?? 20000);
        const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
        const page = await options.readPage(state.nextUrl, { signal });
        signal.throwIfAborted();
        const checked = validatePage(page, state, seen, options);
        const file = `page-${String(page.page).padStart(4, '0')}.athrecs.json`;
        const content = checked.content + '\n';
        if (Buffer.byteLength(content) > MAX_CAPTURE_BYTES) fail('Captured page exceeds the import size limit.');
        await atomicWrite(resolve(directory, 'pages', file), content);
        // A crash before the following checkpoint leaves only an unconfirmed page.
        // Resume requests that same observed URL and may replace that orphan file.
        state.source = checked.source;
        state.pages.push({ page: page.page, file, url: checked.parsed.sourceUrl, next: page.next,
          rows: checked.rows.length, capturedAt: checked.parsed.capturedAt, sha256: hash(content), keysSha256: hash(json(checked.keys)) });
        checked.keys.forEach(key => seen.add(key));
        state.rows = seen.size; state.nextUrl = page.next;
        state.complete = state.nextUrl === null;
        if (state.complete && (state.pages.length !== state.source.totalPages || state.rows !== state.source.totalRows))
          fail('Saved page and row totals do not match the source.');
        state.status = state.complete ? 'complete' : 'running';
        await saveState(directory, state);
        collected++;
        options.onProgress?.({ pages: state.pages.length, rows: state.rows, complete: state.complete, totalPages: state.source.totalPages });
      }
      if (!state.complete) { state.status = 'paused'; await saveState(directory, state); }
      return state;
    } catch (error) {
      // A reporting/storage error after the final page must not invalidate its
      // confirmed complete state; replay can still validate the committed files.
      state.status = state.complete ? 'complete' : 'paused';
      state.lastError = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
      await saveState(directory, state);
      throw error;
    }
  } finally { await release(); }
}

const CSV_HEADINGS = {
  sourceKey: 'Source Key', name: 'Athlete Name', bib: 'Bib', club: 'Club', category: 'Category', gender: 'Gender',
  country: 'Country', status: 'Status', finishTime: 'Finish Time', chipTime: 'Chip Time', gunTime: 'Gun Time',
  overallPlace: 'Overall Place', genderPlace: 'Gender Place', categoryPlace: 'Category Place',
  sourceAthleteProvider: 'Source Athlete Provider', sourceAthleteId: 'Source Athlete ID',
  performance: 'Performance', team: 'Team', leg: 'Leg',
};
const csvRow = values => values.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',') + '\r\n';

/** Canonical headings make the existing uploader's suggested mapping unambiguous. */
export function captureCsvTable(capture, captureTools) {
  const { parsed, rows } = inspect(capture, captureTools);
  const fields = ['sourceKey', ...Object.keys(CSV_HEADINGS).filter(field => field !== 'sourceKey' && parsed.mapping[field])];
  const originals = parsed.table.headers.map((header, index) => header.startsWith('_capture_') ? header : `Original ${index + 1}: ${header}`.slice(0, 160));
  const headers = [...fields.map(field => CSV_HEADINGS[field]), ...originals];
  if (headers.length > 100 || new Set(headers).size !== headers.length) fail('This source needs a reviewed CSV mapping; the original page captures remain available.');
  const suggested = captureTools.suggestColumns(headers);
  if (fields.some(field => suggested[field] !== CSV_HEADINGS[field])) fail('CSV headings would produce an ambiguous archive import.');
  return { headers, rows: parsed.table.rows.map((values, index) => [
    ...fields.map(field => field === 'sourceKey' ? rows[index].sourceKey : values[parsed.table.headers.indexOf(parsed.mapping[field])] ?? ''),
    ...values,
  ]) };
}

export async function exportCollectionCsv(options) {
  const directory = resolve(options.directory);
  const release = await lockDirectory(directory);
  try {
    const state = await readState(directory);
    await verifySaved(directory, state, options);
    if (!state.pages.length) fail('No confirmed pages are available to export.');
    const limit = options.maxBytes ?? MAX_CAPTURE_BYTES;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CAPTURE_BYTES) fail('CSV parts must fit within 25 MiB.');
    const exportDirectory = resolve(directory, 'exports', `export-${randomUUID()}`);
    await privateDirectory(exportDirectory);
    let headings, header, pending = [], bytes = 0, rows = 0;
    const parts = [];
    const flush = async () => {
      if (!rows) return;
      const file = `results-${String(parts.length + 1).padStart(4, '0')}.csv`;
      const content = pending.join('');
      await atomicWrite(resolve(exportDirectory, file), content);
      parts.push({ file, rows, bytes: Buffer.byteLength(content), sha256: hash(content) });
      pending = [header]; bytes = Buffer.byteLength(header); rows = 0;
    };
    for (const entry of state.pages) {
      const content = await privateRead(resolve(directory, 'pages', entry.file), MAX_CAPTURE_BYTES);
      if (hash(content) !== entry.sha256) fail('A capture changed during export.');
      const table = captureCsvTable(JSON.parse(content), options.captureTools);
      if (!headings) { headings = table.headers; header = csvRow(headings); pending = [header]; bytes = Buffer.byteLength(header); }
      else if (!equal(headings, table.headers)) fail('Export headings changed between pages.');
      for (const values of table.rows) {
        const line = csvRow(values), size = Buffer.byteLength(line);
        if (Buffer.byteLength(header) + size > limit) fail('One CSV row exceeds the selected part limit. Use the per-page captures.');
        if (bytes + size > limit) await flush();
        pending.push(line); bytes += size; rows++;
      }
    }
    await flush();
    const manifest = { format: 'athrecs-marathon-csv-export-v1', jobId: state.id, exportedAt: new Date().toISOString(),
      authorityNote: state.authorityNote, source: state.source, startUrl: state.startUrl,
      complete: state.complete, savedPages: state.pages.length, savedRows: state.rows, parts,
      firstCapturedAt: state.pages[0].capturedAt, lastCapturedAt: state.pages.at(-1).capturedAt,
      importNote: 'Choose the exact existing race edition and the same saved race source for every part. Source collection does not verify identity or publish profiles.' };
    await atomicWrite(resolve(exportDirectory, 'manifest.json'), json(manifest) + '\n');
    return { directory: exportDirectory, manifest };
  } finally { await release(); }
}
