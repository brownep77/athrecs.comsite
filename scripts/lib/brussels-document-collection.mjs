import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, lstat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { atomicWrite, privateDirectory, privateRead, lockDirectory, MAX_CAPTURE_BYTES, loadArchiveCaptureTools } from './marathon-collection-job.mjs';

const exec = promisify(execFile);
const FORMAT = 'athrecs-brussels-document-job-v1';
const sha = value => createHash('sha256').update(value).digest('hex');
const stringify = value => JSON.stringify(value);
const fail = message => { throw Error(message); };

export function brusselsSourceUrl(address, kind = 'pdf') {
  const url = new URL(address);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.port) fail('Use an unmodified HTTPS source URL without credentials.');
  if (kind === 'pdf') {
    if (url.origin !== 'https://crdev.blob.core.windows.net' || !/^\/files\/\d+\.pdf$/.test(url.pathname) || url.search)
      fail('Use an observed ChronoRace PDF link. Other historical formats require an inspected reader.');
  } else if (!['prod.chronorace.be', 'www.chronorace.be', 'chronorace.be'].includes(url.hostname) ||
    url.pathname.toLowerCase() !== '/classements/listerapports.aspx' || !/^\d+$/.test(url.searchParams.get('eventId') ?? '') ||
    [...url.searchParams.keys()].some(key => url.searchParams.getAll(key).length !== 1))
    fail('Use the observed ChronoRace event reports index.');
  return url.href;
}

async function fetchBytes(address, type, options) {
  const response = await (options.fetch ?? fetch)(address, {
    signal: AbortSignal.any([options.signal ?? new AbortController().signal, AbortSignal.timeout(20000)]),
    redirect: 'error', credentials: 'omit', cache: 'no-store',
    headers: { Accept: type, 'User-Agent': 'AthRecs-Local-Results-Collector/1.0' },
  });
  if (!response.ok) fail(`The results site returned HTTP ${response.status}. Stopped without automatic retries.`);
  if (response.url && response.url !== address) fail('The requested source URL changed.');
  const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
  if (contentType !== type && !(type === 'application/pdf' && contentType === 'application/octet-stream'))
    fail(`Expected ${type} from the source.`);
  if (!response.body || Number(response.headers.get('content-length')) > MAX_CAPTURE_BYTES) fail('Empty or oversized source response.');
  const parts = [];
  let size = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_CAPTURE_BYTES) fail('Source response exceeds 25 MiB.');
      parts.push(Buffer.from(value));
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  return Buffer.concat(parts);
}

/** Discovery only: show links actually in the index; never construct report IDs. */
export async function discoverBrusselsReports(address, options = {}) {
  const sourceUrl = brusselsSourceUrl(address, 'index');
  const bytes = await fetchBytes(sourceUrl, 'text/html', options);
  const $ = load(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  const reports = [];
  $('a[href]').each((_, element) => {
    const href = new URL($(element).attr('href'), sourceUrl).href;
    try { brusselsSourceUrl(href); } catch { return; }
    if (reports.some(report => report.url === href)) return;
    const section = $(element).closest('table').parent();
    const reportLabel = $(element).parents('tr').toArray().map(row => $(row).prev().text().replace(/\s+/g, ' ').trim())
      .find(text => /marathon/i.test(text)) ?? '';
    reports.push({ url: href, linkText: $(element).text().trim(),
      reportLabel,
      context: section.text().replace(/\s+/g, ' ').trim().slice(0, 1200) });
  });
  return { sourceUrl, checkedAt: new Date().toISOString(), reports,
    qualification: reports.length ? 'Choose the full Marathon Details report. The document reader checks its headings and totals.' : 'No PDF report links found. This is a coverage gap, not a zero-finisher race.' };
}

export async function parseBrusselsPdf(path, options = {}) {
  const { stdout } = await exec(options.python ?? process.env.ATHRECS_PDF_PYTHON ?? 'python3',
    [resolve(dirname(fileURLToPath(import.meta.url)), 'chronorace-pdf.py'), path],
    { signal: options.signal, timeout: 300000, maxBuffer: MAX_CAPTURE_BYTES, encoding: 'utf8' });
  return JSON.parse(stdout);
}

const blank = value => value === '-' ? '' : value;
export function documentTable(document, source, pages = document.totalPages) {
  const originalKeys = ['position', 'bib', 'marker', 'name', 'age', 'nationality',
    ...document.groups.flatMap(group => [group + ' place', group + ' time']),
    'Official', 'Gap', 'TKm', 'categoryPlace', 'category', ...(document.headers.at(-1) === 'City' ? ['city'] : [])];
  const headers = ['Source Key', 'Athlete Name', 'Bib', 'Country', 'Category', 'Gender', 'Status',
    'Overall Place', 'Category Place', 'Chip Time', 'Gun Time', 'Finish Time',
    ...originalKeys.map(key => `Original: ${key}`),
    '_capture_source_url', '_capture_checked_at', '_capture_page_title', 'PDF page', 'PDF row'];
  const net = document.groups.at(-1) === 'Neto';
  const rows = document.pages.slice(0, pages).flatMap(page => page.rows.map(row => {
    const v = row.original;
    // Brutto is explicitly gross. Official remains a generic finish time in this
    // layout; do not infer chip timing because it is usually lower than Brutto.
    const chip = net ? blank(v['Neto time']) : '';
    const gun = net ? blank(v.Official) : blank(v['Brutto time']);
    const finish = net ? chip : blank(v.Official);
    const gender = v.marker === 'F' || /^F\d|^SEF$/.test(v.category) ? 'F' : /^M\d|^SEH$/.test(v.category) ? 'M' : '';
    return [`bib:${v.bib}`, v.name, v.bib, blank(v.nationality), blank(v.category), gender, row.status,
      row.status === 'finished' ? row.position.replace(/\.$/, '') : '', blank(v.categoryPlace), chip, gun, finish,
      ...originalKeys.map(key => v[key] ?? ''), source.url, source.capturedAt, document.title, String(row.page), String(row.row)];
  }));
  return { headers, rows };
}

function validateDocument(document, source, captureTools) {
  if (document.format !== 'athrecs-chronorace-pdf-v1' || document.sha256 !== source.sha256 ||
    document.comparison !== 'pdfplumber/PyMuPDF all cells' || !Array.isArray(document.pages) ||
    document.totalPages !== document.pages.length || document.totalPages < 1 || document.totalPages > 500 ||
    !Number.isInteger(document.totalRows) || document.totalRows < 1 || document.totalRows > 1000000 ||
    ![['10k', '21k', '30k', '39k', 'Neto'], ['10k', '21k', '30k', 'Brutto']].some(g => stringify(g) === stringify(document.groups)))
    fail('Unsupported or inconsistent parsed document.');
  document.pages.forEach((page, index) => {
    if (page.page !== index + 1 || !page.rows.length || page.rows.length > 5000 ||
      page.rows.some((row, rowIndex) => row.page !== page.page || row.row !== rowIndex + 1)) fail('Invalid document page/row sequence.');
  });
  const table = documentTable(document, source);
  const rows = captureTools.mapArchiveRows(table, captureTools.suggestColumns(table.headers));
  if (rows.length !== document.totalRows) fail('Extracted rows differ from the printed document total.');
  return table;
}

async function save(directory, state) {
  await atomicWrite(resolve(directory, 'checkpoint.json'), stringify({ format: FORMAT, state, sha256: sha(stringify(state)) }) + '\n');
}

async function binaryRead(path) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) || stat.size > MAX_CAPTURE_BYTES) fail('Unsafe saved PDF file.');
  return readFile(path);
}

async function restore(directory, tools) {
  const wrapper = JSON.parse(await privateRead(resolve(directory, 'checkpoint.json'), MAX_CAPTURE_BYTES));
  const state = wrapper.state;
  if (wrapper.format !== FORMAT || wrapper.sha256 !== sha(stringify(state))) fail('Checkpoint integrity check failed.');
  brusselsSourceUrl(state.source.url);
  if (typeof state.authority !== 'string' || state.authority.trim().length < 12 || state.authority.length > 2000 ||
    !Number.isFinite(Date.parse(state.source.capturedAt))) fail('Invalid saved authority or capture date.');
  const bytes = await binaryRead(resolve(directory, 'source.pdf'));
  if (sha(bytes) !== state.source.sha256) fail('Saved PDF integrity check failed.');
  const raw = await privateRead(resolve(directory, 'document.json'), MAX_CAPTURE_BYTES);
  if (sha(raw) !== state.documentHash) fail('Parsed document integrity check failed.');
  const document = JSON.parse(raw);
  validateDocument(document, state.source, tools);
  if (!Number.isInteger(state.confirmedPages) || state.confirmedPages < 0 || state.confirmedPages > document.totalPages ||
    state.complete !== (state.confirmedPages === document.totalPages) ||
    state.rows !== document.pages.slice(0, state.confirmedPages).reduce((n, p) => n + p.rows.length, 0)) fail('Inconsistent saved progress.');
  return { state, document };
}

const csvRow = values => values.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',') + '\r\n';
async function exportCsv(directory, state, document, maxBytes = MAX_CAPTURE_BYTES) {
  if (!state.confirmedPages) fail('No confirmed pages to export.');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_CAPTURE_BYTES) fail('Invalid export part limit.');
  const table = documentTable(document, state.source, state.confirmedPages);
  const output = resolve(directory, 'exports', `export-${randomUUID()}`);
  await privateDirectory(output);
  const header = csvRow(table.headers), parts = [];
  let pending = header, count = 0;
  const flush = async () => {
    const file = `results-${String(parts.length + 1).padStart(4, '0')}.csv`;
    await atomicWrite(resolve(output, file), pending);
    parts.push({ file, rows: count, bytes: Buffer.byteLength(pending), sha256: sha(pending) });
    pending = header; count = 0;
  };
  for (const values of table.rows) {
    const line = csvRow(values);
    if (Buffer.byteLength(header + line) > maxBytes) fail('One row exceeds the export part size.');
    if (Buffer.byteLength(pending + line) > maxBytes) await flush();
    pending += line; count++;
  }
  if (count) await flush();
  const manifest = { format: 'athrecs-brussels-csv-export-v1', provider: 'ChronoRace', source: state.source,
    authorityNote: state.authority, documentTitle: document.title, printedRows: document.totalRows,
    totalPages: document.totalPages, savedPages: state.confirmedPages, savedRows: state.rows, complete: state.complete,
    comparison: document.comparison, parts, exportedAt: new Date().toISOString(),
    qualification: 'Document extraction and source comparison, not identity verification. Select the exact existing edition in the staff importer. PDF date labels can be wrong. Reuse the saved dataset for every part; review matches and publication separately.',
    timing: document.groups.at(-1) === 'Neto' ? 'Neto = chip; Official = gun, inspected 2009 layout.' : 'Brutto = gun; Official = generic finish, not inferred chip.' };
  await atomicWrite(resolve(output, 'manifest.json'), stringify(manifest) + '\n');
  return { directory: output, manifest };
}

/** A whole PDF is a retained source snapshot, never a fabricated browser capture. */
export async function runBrusselsCollection(options) {
  const directory = resolve(options.directory);
  const tools = options.captureTools ?? loadArchiveCaptureTools();
  const maxPages = options.maxPages ?? 500;
  if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 500) fail('Use a page budget between 1 and 500.');
  const release = await lockDirectory(directory);
  try {
    let state, document;
    if (options.resume || options.exportOnly) {
      ({ state, document } = await restore(directory, tools));
      if ((options.url && options.url !== state.source.url) || (options.authority && options.authority !== state.authority)) fail('Resume must retain the original source and authority.');
    } else {
      for (const file of ['checkpoint.json', 'source.pdf', 'source.json', 'document.json']) {
        try { await lstat(resolve(directory, file)); fail('This job contains retained evidence. Use --resume for a confirmed job, or a new private directory.'); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      const url = brusselsSourceUrl(options.url);
      if (typeof options.authority !== 'string' || options.authority.trim().length < 12 || options.authority.length > 2000) fail('Supply an authority note of 12–2,000 characters.');
      const bytes = await fetchBytes(url, 'application/pdf', options);
      if (bytes.subarray(0, 5).toString() !== '%PDF-') fail('The response is not a PDF.');
      const source = { url, capturedAt: new Date().toISOString(), sha256: sha(bytes) };
      await atomicWrite(resolve(directory, 'source.pdf'), bytes);
      await atomicWrite(resolve(directory, 'source.json'), stringify({ source, authority: options.authority, qualification: 'Retained source; a checkpoint is created only after document comparison succeeds.' }) + '\n');
      document = await (options.parsePdf ?? parseBrusselsPdf)(resolve(directory, 'source.pdf'), options);
      validateDocument(document, source, tools);
      const raw = stringify(document) + '\n';
      if (Buffer.byteLength(raw) > MAX_CAPTURE_BYTES) fail('Parsed document exceeds 25 MiB.');
      await atomicWrite(resolve(directory, 'document.json'), raw);
      state = { source, authority: options.authority, documentHash: sha(raw), confirmedPages: 0, rows: 0, complete: false };
      await save(directory, state);
    }
    if (!options.exportOnly) {
      const target = Math.min(document.totalPages, state.confirmedPages + maxPages);
      while (state.confirmedPages < target) {
        options.signal?.throwIfAborted();
        state.rows += document.pages[state.confirmedPages].rows.length;
        state.confirmedPages++;
        state.complete = state.confirmedPages === document.totalPages;
        await save(directory, state);
        options.onProgress?.({ pages: state.confirmedPages, totalPages: document.totalPages, rows: state.rows });
      }
    }
    const exported = options.exportOnly || state.complete ? await exportCsv(directory, state, document, options.maxBytes) : null;
    return { state, exported };
  } finally { await release(); }
}
