#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { resultCollectionProvider, resultCollectionScope } from '../src/lib/results-archive/collection-provider.ts';
import { marathonPageReaderExpression } from './lib/marathon-page-collection.mjs';
import {
  runCollectionJob, exportCollectionCsv, loadArchiveCaptureTools, MAX_CAPTURE_BYTES,
} from './lib/marathon-collection-job.mjs';

const HELP = `Collect a supported marathon results listing into private local files.

Brussels historical PDFs: add --provider brussels (use --provider brussels --help).

New job:
  npm run collect:marathon-results -- --url '<observed page-1 URL>' --job <private-directory> --authority '<authority to retain>'
Resume:
  npm run collect:marathon-results -- --job <private-directory> --resume
Export confirmed pages, including an explicitly partial job:
  npm run collect:marathon-results -- --job <private-directory> --export-only
Check one page without writing a job:
  npm run collect:marathon-results -- --url '<observed page-1 URL>' --authority '<authority to retain>' --dry-run

Optional: --max-pages <1..500> limits new pages per invocation.
The inspected London list layout is supported. Chicago needs an inspected sample.
Requests are sequential, at least two seconds apart, and time out after 20 seconds.
Blocked requests stop the job; there are no automatic retries or account/API writes.
Complete jobs export CSV parts of at most 25 MiB for the existing staff importer.
`;

function argumentsFor(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (['--help', '--resume', '--export-only', '--dry-run'].includes(flag)) {
      if (result[flag]) throw Error(`Repeated option: ${flag}`);
      result[flag] = true;
    } else if (['--url', '--job', '--authority', '--max-pages'].includes(flag)) {
      if (result[flag] !== undefined || !argv[i + 1] || argv[i + 1].startsWith('--')) throw Error(`Supply ${flag} once with a value.`);
      result[flag] = argv[++i];
    } else throw Error(`Unknown option: ${flag}. Use --help.`);
  }
  if (result['--help']) return result;
  if ([result['--resume'], result['--export-only'], result['--dry-run']].filter(Boolean).length > 1)
    throw Error('Choose one of --resume, --export-only or --dry-run.');
  if (!result['--dry-run'] && !result['--job']) throw Error('Supply a dedicated private --job directory.');
  if (!result['--resume'] && !result['--export-only']) {
    if (!result['--url']) throw Error('Supply the observed first-page --url, including its page and page-size parameters.');
    if (!result['--authority'] || result['--authority'].trim().length < 12 || result['--authority'].length > 2000)
      throw Error('Supply an explicit --authority note of 12–2,000 characters.');
    resultCollectionScope(result['--url']);
    if (new URL(result['--url']).searchParams.get('page') !== '1') throw Error('Start on the actual first page of the source listing.');
  }
  if (result['--max-pages'] !== undefined && (!/^[1-9]\d*$/.test(result['--max-pages']) || Number(result['--max-pages']) > 500))
    throw Error('--max-pages must be between 1 and 500.');
  if ((result['--dry-run'] || result['--export-only']) && result['--max-pages']) throw Error('--max-pages applies to collection, not dry-run/export.');
  return result;
}

async function responseHtml(response) {
  if (!response.ok) throw Error(`The results site returned HTTP ${response.status}. Stopped without automatic retries.`);
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) throw Error('The source did not return an HTML results page.');
  const charset = contentType.match(/;\s*charset\s*=\s*["']?([^;\s"']+)/i)?.[1];
  if (charset && !/^utf-?8$/i.test(charset)) throw Error(`Unsupported source charset: ${charset}. This adapter requires UTF-8.`);
  if (Number(response.headers.get('content-length')) > MAX_CAPTURE_BYTES) throw Error('The source page exceeds 25 MiB.');
  if (!response.body) throw Error('The source returned an empty response.');
  const reader = response.body.getReader();
  const parts = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_CAPTURE_BYTES) throw Error('The source page exceeds 25 MiB.');
      parts.push(Buffer.from(value));
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  return new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(parts));
}

/** Dependencies let the real CLI flow be checked against synthetic HTTP responses. */
export async function runMarathonCollectorCli(argv, dependencies = {}) {
  // PDF reports use document provenance, not the browser-only capture schema.
  if (argv.includes('--provider')) {
    const index = argv.indexOf('--provider');
    if (argv[index + 1] !== 'brussels' || argv.lastIndexOf('--provider') !== index)
      throw Error('Supported explicit provider: --provider brussels.');
    const { runBrusselsCollectorCli } = await import('./collect-brussels-results.mjs');
    return runBrusselsCollectorCli([...argv.slice(0, index), ...argv.slice(index + 2)], dependencies);
  }
  const args = argumentsFor(argv);
  const log = dependencies.log ?? console.log;
  if (args['--help']) { log(HELP); return { help: true }; }
  const captureTools = dependencies.captureTools ?? loadArchiveCaptureTools();
  const shared = { directory: args['--job'], captureTools, scopeFor: resultCollectionScope };
  if (args['--export-only']) {
    const exported = await exportCollectionCsv(shared);
    log(`${exported.manifest.complete ? 'Complete selected listing' : 'PARTIAL collection'}: ${exported.manifest.savedRows.toLocaleString()} saved rows in ${exported.manifest.parts.length} CSV part(s).`);
    log(`Export: ${exported.directory}`);
    return { exported };
  }

  const controller = new AbortController();
  const interrupt = () => controller.abort(new Error('Interrupted. Confirmed pages are retained; use --resume.'));
  process.once('SIGINT', interrupt);
  process.once('SIGTERM', interrupt);
  let browser, context;
  try {
    browser = await (dependencies.launchBrowser ?? (options => chromium.launch(options)))({
      headless: true,
      executablePath: process.env.ATHRECS_TEST_CHROMIUM_EXECUTABLE ?? process.env.CHROMIUM_PATH ?? process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
    // This browser never visits a source. DOMParser parses strings in an inert document.
    context = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: 'block' });
    await context.route('**/*', route => route.abort());
    const parser = await context.newPage();
    const expression = marathonPageReaderExpression();
    const fetchPage = dependencies.fetch ?? globalThis.fetch;
    const readPage = async (address, { signal }) => {
      const provider = resultCollectionProvider(address);
      if (!provider?.automatic) throw Error(provider?.note ?? 'This source has no supported automatic collector.');
      resultCollectionScope(address);
      const response = await fetchPage(address, { signal, redirect: 'error', credentials: 'omit', cache: 'no-store',
        headers: { Accept: 'text/html', 'User-Agent': 'AthRecs-Local-Results-Collector/1.0' } });
      const returnedUrl = response.url || address;
      if (resultCollectionScope(returnedUrl) !== resultCollectionScope(address) ||
          new URL(returnedUrl).searchParams.get('page') !== new URL(address).searchParams.get('page'))
        throw Error('The source changed the requested page or filters. Review the source before restarting.');
      const html = await responseHtml(response);
      signal.throwIfAborted();
      return parser.evaluate(({ source, address: url, reader }) => {
        const read = (0, eval)(reader);
        return read(new DOMParser().parseFromString(source, 'text/html'), url);
      }, { source: html, address: returnedUrl, reader: expression });
    };
    if (args['--dry-run']) {
      const page = await readPage(args['--url'], { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) });
      const parsed = captureTools.parseBrowserCapture(JSON.stringify(page.capture));
      const rows = captureTools.mapArchiveRows(parsed.table, parsed.mapping);
      const result = { dryRun: true, provider: resultCollectionProvider(args['--url']).name,
        pageRows: rows.length, totalPages: page.totalPages, totalRows: page.totalRows, filterLabel: page.filterLabel };
      log(`Dry run passed: ${rows.length} rows on page 1; ${page.totalPages} pages and ${page.totalRows.toLocaleString()} results for ${page.filterLabel}. No job files written.`);
      return result;
    }
    const state = await runCollectionJob({ ...shared, startUrl: args['--url'], authorityNote: args['--authority'],
      resume: Boolean(args['--resume']), maxPages: args['--max-pages'] ? Number(args['--max-pages']) : 500,
      signal: controller.signal, readPage, sleep: dependencies.sleep, now: dependencies.now,
      onProgress: progress => log(`Saved page ${progress.pages}/${progress.totalPages}: ${progress.rows.toLocaleString()} confirmed source rows.`) });
    if (!state.complete) {
      log(`Paused after ${state.pages.length} page(s). Resume with --job '${args['--job']}' --resume.`);
      return { state };
    }
    const exported = await exportCollectionCsv(shared);
    log(`Complete for selected filters: ${state.rows.toLocaleString()} rows. CSV export: ${exported.directory}`);
    return { state, exported };
  } finally {
    process.removeListener('SIGINT', interrupt);
    process.removeListener('SIGTERM', interrupt);
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMarathonCollectorCli(process.argv.slice(2)).catch(error => {
    console.error(`Collection stopped: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
