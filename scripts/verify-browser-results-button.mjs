// Synthetic results only. Browser requests are intercepted; no race website or database is touched.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import ts from 'typescript';
import { z } from 'zod';
import { collectBrowserResults, browserResultsBookmark } from './lib/browser-results-button.mjs';

function load(file, deps) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(name => { assert.ok(name in deps, name); return deps[name]; }, module, module.exports);
  return module.exports;
}
const core = load('src/lib/results-archive/core.ts', { zod: { z } });
const { parseBrowserCapture } = load('src/lib/results-archive/browser-capture.ts', { zod: { z }, './core': core });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage(), requests = [];
  const fixture = `<!doctype html><title>Synthetic race — test only</title><style>.sr-only{position:absolute;left:-9999px}</style>
    <table><caption>Marathon test table</caption><thead><tr><th>Bib</th><th>Name</th><th>Chip time</th><th>Gun time</th><th>Nation</th><th>Gender place</th><th>Overall place</th><th>Status</th></tr></thead>
    <tbody><tr><td>501</td><td><a href="?result=abc&amp;page=2">Test Runner Alpha</a><span hidden>SECRET</span><span style="opacity:0">HIDDEN</span><input value="PRIVATE"><span class="sr-only">More details</span></td><td>03:04:05.25</td><td>03:05:06</td><td>IRL</td><td>2</td><td>5</td><td>FIN</td></tr>
    <tr><td>502</td><td>Test Runner Beta</td><td></td><td></td><td></td><td></td><td></td><td>DNF</td></tr></tbody></table>
    <table hidden><tr><th>Name</th></tr><tr><td>SECRET hidden row</td></tr></table>
    <table><caption>Malformed</caption><tr><th>Name</th><th>Bib</th></tr><tr><td>Test only</td></tr></table>
    <ul class="list-group"><li><span data-label="Name">List Test Alpha</span><span data-label="Bib">L1</span><span data-label="Net time">04:00:00</span></li><li><span data-label="Name">List Test Beta</span><span data-label="Bib">L2</span><span data-label="Net time">04:01:00</span></li></ul>`;
  await page.route('**/*', route => { requests.push(route.request().url()); return route.fulfill({ contentType: 'text/html', body: fixture }); });
  await page.goto('https://results.example.test/2025/?page=2');
  const capture = await page.evaluate('(' + collectBrowserResults.toString() + ')(document)');
  assert.equal(capture.tables.length, 2);
  assert.equal(capture.tables[0].rows.length, 2);
  assert.equal(capture.tables[0].rows[0][1], 'Test Runner Alpha');
  assert.equal(capture.tables[1].headers[0], 'Name');
  assert.equal(capture.tables[1].rows[0][0], 'List Test Alpha');
  assert.ok(capture.warnings.some(w => w.includes('column counts differ')));
  assert.ok(!JSON.stringify(capture).includes('SECRET'));
  assert.ok(!JSON.stringify(capture).includes('HIDDEN'));
  assert.ok(!JSON.stringify(capture).includes('PRIVATE'));
  assert.equal(capture.scope, 'loaded-page-only');

  // Execute the generated bookmark and actually download its selected table.
  await page.evaluate(url => {
    const link = document.createElement('a'); link.id = 'test-bookmark'; link.textContent = 'Test bookmark'; link.href = url; document.body.append(link);
  }, browserResultsBookmark());
  await page.locator('#test-bookmark').click();
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.match(await page.getByRole('status').innerText(), /2 loaded rows/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save this page', exact: true }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.athrecs\.json$/);
  const json = readFileSync(await download.path(), 'utf8');
  const parsed = parseBrowserCapture(json);
  assert.equal(parsed.sourceUrl, 'https://results.example.test/2025/?page=2');
  const mapped = core.mapArchiveRows(parsed.table, core.suggestColumns(parsed.table.headers));
  assert.equal(mapped[0].sourceKey, 'bib:501');
  assert.equal(mapped[0].chipSeconds, 11045.25);
  assert.equal(mapped[0].gunSeconds, 11106);
  assert.equal(mapped[0].country, 'IRL');
  assert.equal(mapped[0].genderPlace, 2);
  assert.equal(mapped[0].overallPlace, 5);
  assert.equal(mapped[1].status, 'DNF');
  assert.equal(mapped[1].finishSeconds, null);
  assert.equal(mapped[0].original['_capture_scope'], 'loaded-page-only');
  assert.equal(mapped[0].original['Chip time'], '03:04:05.25');
  assert.match(mapped[0].original['_capture_row_links'], /result=abc/);
  assert.deepEqual(requests, ['https://results.example.test/2025/?page=2']);
  assert.ok(!('verified' in mapped[0]));
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);

  // Reject malformed or privilege-bearing captures; preserve source text as plain data.
  const raw = JSON.parse(json);
  for (const mutate of [
    v => { v.verified = true; },
    v => { v.scope = 'complete-race'; },
    v => { v.page.url = 'javascript:alert(1)'; },
    v => { v.table.rows[0].pop(); },
    v => { v.table.headers[1] = v.table.headers[0]; },
    v => { v.table.headers[0] = '_capture_scope'; },
    v => { v.table.rowLinks.pop(); },
  ]) {
    const bad = structuredClone(raw); mutate(bad); assert.throws(() => parseBrowserCapture(JSON.stringify(bad)));
  }
  const hostile = structuredClone(raw); hostile.table.rows[0][1] = '=HYPERLINK("https://example.test")';
  assert.equal(parseBrowserCapture(JSON.stringify(hostile)).table.rows[0][1], hostile.table.rows[0][1]);
  const repeat = structuredClone(raw); repeat.table.rows[1][0] = repeat.table.rows[0][0];
  const repeated = parseBrowserCapture(JSON.stringify(repeat));
  assert.throws(() => core.mapArchiveRows(repeated.table, core.suggestColumns(repeated.table.headers)), /Repeated source row IDs/);

  // Empty pages and merged cells fail visibly instead of claiming successful collection.
  await page.setContent('<table><tr><th>Name</th><th>Bib</th></tr><tr><td colspan="2">Unsupported</td></tr></table>');
  await page.evaluate(decodeURIComponent(browserResultsBookmark().slice('javascript:'.length)));
  assert.match(await page.getByRole('status').innerText(), /No supported results table/);
  assert.equal(await page.getByRole('button', { name: 'Save this page' }).count(), 0);

  // Setup page uses the exact tested bookmark, with a usable mobile layout.
  await page.setContent(readFileSync('public/tools/browser-results.html', 'utf8'));
  assert.equal(await page.locator('#bookmark').getAttribute('href'), browserResultsBookmark());
  await page.locator('#bookmark').click();
  assert.match(await page.locator('#install-status').innerText(), /Drag this button/);
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  if (process.env.CAPTURE_SCREENSHOT) await page.screenshot({ path: process.env.CAPTURE_SCREENSHOT, fullPage: true });
  console.log('PASS: capture → bookmark panel → downloaded file → archive validation and field mapping; hidden content, malformed data, duplicate IDs, no network calls, setup layout.');
} finally { await browser.close(); }
