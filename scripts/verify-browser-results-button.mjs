// Synthetic results only. Browser requests are intercepted; no race website or database is touched.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import ts from 'typescript';
import { z } from 'zod';
import { marathonPageReaderExpression } from './lib/marathon-page-collection.mjs';
import * as providers from '../src/lib/results-archive/collection-provider.ts';
import { londonPaginationFixture, londonFixtureUrl } from './fixtures/london-pagination.mjs';
import { collectBrowserResults, browserResultsBookmark } from './lib/browser-results-button.mjs';

function load(file, deps) {
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(name => { assert.ok(name in deps, name); return deps[name]; }, module, module.exports);
  return module.exports;
}
const core = load('src/lib/results-archive/core.ts', { zod: { z } });
const captureParser = load('src/lib/results-archive/browser-capture.ts', { zod: { z }, './core': core });
const { parseBrowserCapture } = captureParser;
const collectionParser = load('src/lib/results-archive/browser-collection.ts', { zod: { z }, './core': core, './browser-capture': captureParser, './collection-provider': providers });
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
  await page.getByRole('button', { name: 'Download a file instead', exact: true }).click();
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
  assert.equal(await page.getByRole('button', { name: 'Download a file instead' }).count(), 0);

  // London/Mika list structure, reproduced with synthetic values only.
  const londonHeadings = ['Place <small>(Overall)</small>', 'Place <small>(Gender)</small>', 'Place <small>(Category)</small>', 'Name', 'Club', 'Runner Number', 'Category', 'Event', 'Half', 'Finish'];
  const londonTypes = ['type-place place-secondary', 'type-place place-primary', 'type-place place-secondary', 'type-fullname', 'type-field', 'type-field', 'type-age_class', 'type-event_name', 'type-time split', 'type-time split'];
  const londonValues = ['215', '1', '1', '<a href="?idp=synthetic-london">Example, Synthetic (IRL)</a>', 'Test club', '501', '18-39', 'Mass', '01:30:00', '03:04:05'];
  const fields = (values, body = false) => values.map((value, i) => `<div class="list-field ${londonTypes[i]}">${body && i > 3 ? `<div class="list-label">${londonHeadings[i]}</div>` : ''}${value}</div>`).join('');
  const londonFixture = `<style>.list-label{display:none}</style><ul class="list-group list-group-multicolumn"><li class="list-group-header"><div class="list-field-wrap">${fields(londonHeadings)}</div></li><li class="list-group-item"><div class="list-field-wrap">${fields(londonValues, true)}<div class="list-field type-favorite"><a href="?favorite_add=synthetic">Favourite</a></div></div></li></ul>`;
  await page.goto('https://results.tcslondonmarathon.com/2026/?pid=list');
  await page.setContent(londonFixture);
  const london = await page.evaluate('(' + collectBrowserResults.toString() + ')(document)');
  assert.equal(london.tables.length, 1);
  assert.deepEqual(london.tables[0].headers, ['Place (Overall)', 'Place (Gender)', 'Place (Category)', 'Name', 'Club', 'Runner Number', 'Category', 'Event', 'Half', 'Finish']);
  assert.deepEqual(london.tables[0].rows[0], ['215', '1', '1', 'Example, Synthetic (IRL)', 'Test club', '501', '18-39', 'Mass', '01:30:00', '03:04:05']);
  assert.equal(london.tables[0].rowLinks[0].length, 1);
  await page.evaluate(decodeURIComponent(browserResultsBookmark().slice('javascript:'.length)));
  const londonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a file instead', exact: true }).click();
  const londonParsed = parseBrowserCapture(readFileSync(await (await londonDownload).path(), 'utf8'));
  assert.equal(londonParsed.table.rows[0][9], '03:04:05');
  const londonMapped = core.mapArchiveRows(londonParsed.table, londonParsed.mapping)[0];
  assert.equal(londonMapped.name, 'Synthetic Example');
  assert.equal(londonMapped.country, 'IRL');
  assert.equal(londonMapped.original.Name, 'Example, Synthetic (IRL)');
  assert.equal(londonMapped.sourceKey, 'bib:501');
  assert.equal(londonMapped.finishSeconds, 11045);
  assert.equal(londonMapped.chipSeconds, null);
  assert.equal(londonMapped.gunSeconds, null);
  assert.equal(londonMapped.overallPlace, 215);
  assert.equal(londonMapped.genderPlace, 1);
  assert.equal(londonMapped.categoryPlace, 1);
  // A different provider's comma names/tags are not interpreted as London's format.
  const unknown = JSON.parse(json); unknown.page.url = 'https://unknown.example.test/results';
  unknown.table.headers = ['Name', 'Runner Number', 'Finish'];
  unknown.table.rows = [['Example, Synthetic (IRL)', '501', '03:04:05']]; unknown.table.rowLinks = [[]];
  const unknownParsed = parseBrowserCapture(JSON.stringify(unknown));
  assert.equal(core.mapArchiveRows(unknownParsed.table, unknownParsed.mapping)[0].name, 'Example, Synthetic (IRL)');
  assert.ok(await page.getByRole('button', { name: 'Close', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  // Visible inline labels must never contaminate cell values.
  await page.addStyleTag({ content: '.list-label{display:block}' });
  assert.deepEqual((await page.evaluate('(' + collectBrowserResults.toString() + ')(document)')).tables[0].rows, london.tables[0].rows);
  await page.locator('.list-group-item .type-age_class').evaluate(el => el.remove());
  assert.equal((await page.evaluate('(' + collectBrowserResults.toString() + ')(document)')).tables.length, 0);
  await page.setContent(londonFixture.replace('>Runner Number</div>501', '>Wrong heading</div>501'));
  assert.equal((await page.evaluate('(' + collectBrowserResults.toString() + ')(document)')).tables.length, 0);
  await page.setContent(londonFixture + '<style>.list-group-header .type-time{display:none}</style>');
  const narrow = await page.evaluate('(' + collectBrowserResults.toString() + ')(document)');
  assert.equal(narrow.tables.length, 0);
  assert.match(narrow.warnings.join(' '), /widen the browser/);

  // Pagination comes from the site's actual links; filter changes and corrupt lists stop collection.
  await page.goto(londonFixtureUrl);
  await page.setContent(londonPaginationFixture(1));
  const plan = await page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)');
  const metadata = { version: 1, firstUrl: plan.capture.page.url, totalPages: plan.totalPages, totalRows: plan.totalRows, pageSize: plan.pageSize, filterLabel: plan.filterLabel };
  assert.deepEqual(collectionParser.collectionSchema.parse(metadata), metadata);
  collectionParser.validateCollectionPage(JSON.stringify(plan.capture), metadata, 1);
  for (const value of [{ ...metadata, totalPages: 4 }, { ...metadata, firstUrl: 'https://other.example.test/2026/?page=1&pid=list' }, { ...metadata, firstUrl: metadata.firstUrl.replace('page=1', 'page=2') }]) assert.throws(() => collectionParser.collectionSchema.parse(value));
  const wrongFilter = structuredClone(plan.capture); wrongFilter.page.url = wrongFilter.page.url.replace('sex%5D=W', 'sex%5D=M');
  assert.throws(() => collectionParser.validateCollectionPage(JSON.stringify(wrongFilter), metadata, 1));
  assert.throws(() => collectionParser.validateCollectionPage(JSON.stringify(plan.capture), metadata, 2));
  assert.equal(plan.totalPages, 3); assert.equal(plan.totalRows, 5); assert.equal(plan.filterLabel, 'Women');
  assert.equal(new URL(plan.next).searchParams.get('page'), '2');
  assert.equal(new URL(plan.next).searchParams.get('search[sex]'), 'W');
  const firstPage = parseBrowserCapture(JSON.stringify(plan.capture));
  assert.equal(core.mapArchiveRows(firstPage.table, firstPage.mapping)[0].name, 'Morgan Browser Synthetic');
  for (const fixture of [londonPaginationFixture(1, { wrongHeader: true }), londonPaginationFixture(1).replace('5 Results', 'Results unavailable'), londonPaginationFixture(1).replaceAll('9002', '9001')]) {
    await page.setContent(fixture);
    await assert.rejects(() => page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)'));
  }

  // Host recognition alone never enables a provider whose actual layout needs review.
  for (const host of ['results.chicagomarathon.com', 'chicago-history.r.mikatiming.com']) {
    const url = `https://${host}/2025/?pid=list&event=synthetic-event&page=1&num_results=2`;
    assert.equal(providers.resultCollectionProvider(url)?.automatic, false);
    assert.throws(() => providers.resultCollectionScope(url), /inspected results-page sample/);
    await page.goto(url);
    await page.setContent(londonPaginationFixture(1));
    await page.evaluate(decodeURIComponent(browserResultsBookmark().slice('javascript:'.length)));
    assert.equal(await page.getByRole('button', { name: 'Collect all pages', exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Send to AthRecs', exact: true }).count(), 1);
    assert.match(await page.getByRole('dialog').innerText(), /Chicago automatic collection needs an inspected/);
    assert.deepEqual(providers.collectionImportDefaults(url), {
      raceName: 'Chicago Marathon',
      sourceUrl: `https://${host}/2025/?pid=list&event=synthetic-event`,
      sourceRaceKey: `https://${host}/2025/?pid=list&event=synthetic-event`,
    });
  }
  for (const url of [londonFixtureUrl + '&page=2', londonFixtureUrl + '&event=other', londonFixtureUrl.replace('page=1', 'page=01'), londonFixtureUrl.replace('num_results=2', 'num_results=2e0')])
    assert.throws(() => providers.resultCollectionScope(url), /unambiguous/);

  // The shared reader tolerates a genuine column reorder, mapping values by headings.
  await page.goto(londonFixtureUrl);
  await page.setContent(londonPaginationFixture(1));
  await page.evaluate(() => document.querySelectorAll('.list-group-multicolumn > li').forEach(row => {
    const fields = [...row.querySelectorAll('.list-field')].filter(el => !el.classList.contains('type-favorite'));
    row.prepend(fields.find(el => el.classList.contains('type-fullname')));
  }));
  const reordered = await page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)');
  const reorderedCapture = parseBrowserCapture(JSON.stringify(reordered.capture));
  const reorderedRow = core.mapArchiveRows(reorderedCapture.table, reorderedCapture.mapping)[0];
  assert.equal(reorderedRow.name, 'Morgan Browser Synthetic');
  assert.equal(reorderedRow.overallPlace, 1);
  assert.equal(reorderedRow.finishSeconds, 1860);
  // A plausible response for the wrong page must not become a new checkpoint.
  await page.setContent(londonPaginationFixture(2));
  await assert.rejects(() => page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)'), /requested page and filters/);
  await page.setContent(londonPaginationFixture(1).replace('5 Results', '1,2 Results'));
  await assert.rejects(() => page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)'), /missing or ambiguous/);
  for (const query of ['?pid=list&event=OTHER', '?pid=list&event=MAS&event=OTHER']) {
    await page.goto('https://results.tcslondonmarathon.com/2026/' + query);
    await page.setContent(londonPaginationFixture(1));
    await assert.rejects(() => page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)'), /requested page and filters/);
  }
  // Explicit filters are preserved when the site's navigation supplies default page/size.
  await page.goto('https://results.tcslondonmarathon.com/2026/?pid=list&event=MAS');
  await page.setContent(londonPaginationFixture(1));
  assert.equal((await page.evaluate('(' + marathonPageReaderExpression() + ')(document,location.href)')).totalRows, 5);

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
