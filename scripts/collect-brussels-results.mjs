#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { discoverBrusselsReports, runBrusselsCollection } from './lib/brussels-document-collection.mjs';

const HELP = `Collect an inspected Brussels ChronoRace Marathon PDF into private local files.
Discover actual PDF links: --discover '<observed ChronoRace reports index URL>'
New job: --url '<observed PDF URL>' --job <private-directory> --authority '<authority to retain>'
Resume: --job <private-directory> --resume
Export complete/explicitly partial CSV: --job <private-directory> --export-only
Check the whole document: --url '<observed PDF URL>' --authority '<authority to retain>' --dry-run
Optional: --max-pages <1..500> bounds new confirmed PDF pages per invocation.
Use ATHRECS_PDF_PYTHON for Python with scripts/requirements-brussels-collector.txt installed.
All printed pages and rows must pass two independent PDF readers before collection.
The PDF is fetched once; resume verifies and reuses the retained snapshot offline.
No account, database, identity or publication changes. HTTP failures stop without retries.
`;

export async function runBrusselsCollectorCli(argv, dependencies = {}) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (args[flag] !== undefined) throw Error(`Repeated option: ${flag}`);
    if (['--help', '--resume', '--export-only', '--dry-run'].includes(flag)) args[flag] = true;
    else if (['--url', '--job', '--authority', '--max-pages', '--discover'].includes(flag) && argv[i + 1] && !argv[i + 1].startsWith('--')) args[flag] = argv[++i];
    else throw Error(`Unknown option or missing value: ${flag}. Use --help.`);
  }
  const log = dependencies.log ?? console.log;
  if (args['--help']) { log(HELP); return { help: true }; }
  if (args['--discover']) {
    if (Object.keys(args).length !== 1) throw Error('--discover is a separate read-only command.');
    const result = await discoverBrusselsReports(args['--discover'], dependencies);
    log(JSON.stringify(result, null, 2)); return result;
  }
  if (['--resume', '--export-only', '--dry-run'].filter(key => args[key]).length > 1) throw Error('Choose one of resume, export-only or dry-run.');
  if (!args['--dry-run'] && !args['--job']) throw Error('Supply a dedicated private --job directory.');
  if ((args['--dry-run'] || args['--export-only']) && args['--max-pages']) throw Error('--max-pages applies to collection only.');
  if (args['--max-pages'] && !/^[1-9]\d*$/.test(args['--max-pages'])) throw Error('Invalid --max-pages.');
  const controller = new AbortController();
  const interrupt = () => controller.abort(Error('Interrupted. Resume the retained job with --resume.'));
  process.once('SIGINT', interrupt); process.once('SIGTERM', interrupt);
  let temporary;
  try {
    if (args['--dry-run']) temporary = await mkdtemp(join(tmpdir(), 'athrecs-brussels-dry-'));
    const result = await runBrusselsCollection({ ...dependencies, directory: temporary ?? args['--job'],
      url: args['--url'], authority: args['--authority'], resume: !!args['--resume'], exportOnly: !!args['--export-only'],
      maxPages: args['--max-pages'] ? Number(args['--max-pages']) : args['--dry-run'] ? 1 : 500,
      signal: controller.signal, onProgress: p => log(`Confirmed PDF page ${p.pages}/${p.totalPages}: ${p.rows} rows.`) });
    if (args['--dry-run']) log('Whole-document comparison passed. Temporary private files removed after this dry run.');
    else if (result.exported) log(`${result.state.complete ? 'Complete document' : 'PARTIAL collection'}: ${result.state.rows} rows. CSV: ${result.exported.directory}`);
    else log(`Paused at PDF page ${result.state.confirmedPages}. Resume with the same --job directory.`);
    return result;
  } finally {
    process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt);
    if (temporary) await rm(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  runBrusselsCollectorCli(process.argv.slice(2)).catch(error => { console.error(`Collection stopped: ${error.message}`); process.exitCode = 1; });
