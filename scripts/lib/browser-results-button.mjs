import { marathonPageReaderExpression } from './marathon-page-collection.mjs';
import { startBrowserCollection } from './browser-page-collection.mjs';
import { resultCollectionProvider } from '../../src/lib/results-archive/collection-provider.ts';
/** Self-contained functions: embedded in a bookmark, with no remote scripts; handoff is an explicit click. */
export function collectBrowserResults(doc = document) {
  const win = doc.defaultView;
  const visible = (el) => Boolean(el.getClientRects().length) &&
    !el.closest('[hidden], [aria-hidden="true"]') &&
    !['hidden', 'collapse'].includes(win.getComputedStyle(el).visibility) &&
    (typeof el.checkVisibility !== 'function' || el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }));
  const text = (el, omit = '') => {
    if (!visible(el)) return '';
    // Do not capture inputs, hidden DOM text, scripts or offscreen accessibility labels.
    const walker = doc.createTreeWalker(el, 4);
    const parts = [];
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!parent || (omit && parent.closest(omit)) || parent.closest('script,style,select,button,textarea,input,[aria-hidden="true"],[hidden],.sr-only,.visually-hidden') || !visible(parent)) continue;
      parts.push(node.textContent);
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };
  const safeUrl = (value) => {
    try { const u = new URL(value, doc.location.href); return u.protocol === 'https:' && !u.username && !u.password ? u.href : ''; }
    catch { return ''; }
  };
  const sourceUrl = safeUrl(doc.location.href);
  if (!sourceUrl) throw new Error('Open the HTTPS race-results page before using this bookmark.');
  const tables = [], warnings = [];
  const distinctHeaders = (values) => {
    const used = new Set();
    return values.map((value, index) => {
      const base = value || `Unlabelled column ${index + 1}`;
      let label = base, suffix = 2;
      while (used.has(label)) label = `${base} (${suffix++})`;
      used.add(label); return label;
    });
  };
  const add = (container, headerCells, rowCells, rowElements, label, options = {}) => {
    if (!headerCells.length || !rowCells.length) return;
    if (headerCells.length > 80 || rowCells.length > 5000) {
      warnings.push(`${label}: exceeds 80 columns or 5,000 loaded rows; choose a smaller page.`); return;
    }
    if (rowCells.some(cells => cells.length !== headerCells.length)) {
      warnings.push(`${label}: column counts differ. No rows from this table were exported.`); return;
    }
    if ([...headerCells, ...rowCells.flat()].some(cell => Number(cell.getAttribute('colspan') || 1) !== 1 || Number(cell.getAttribute('rowspan') || 1) !== 1)) {
      warnings.push(`${label}: merged cells need a separate parser. No rows from this table were exported.`); return;
    }
    const headers = distinctHeaders(headerCells.map(el => text(el, options.omit) || (el.getAttribute('data-label') || el.getAttribute('data-title') || '')));
    const rows = rowCells.map(cells => cells.map(cell => text(cell, options.omit)));
    if (headers.some(h => h.length > 160) || rows.flat().some(v => v.length > 4000)) {
      warnings.push(`${label}: contains cells too large for a results table.`); return;
    }
    const rowLinks = rowElements.map(row => [...row.querySelectorAll(options.links || 'a[href]')].filter(visible).map(a => safeUrl(a.href)).filter(Boolean));
    if (rowLinks.some(links => links.join('\n').length > 4000)) {
      warnings.push(`${label}: too many links in a row.`); return;
    }
    tables.push({ label, headers, rows, rowLinks });
  };
  const selector = 'table,[role="table"],[role="grid"]';
  for (const container of doc.querySelectorAll(selector)) {
    if (!visible(container) || container.closest('[data-athrecs-capture]')) continue;
    const rows = [...container.querySelectorAll('tr,[role="row"]')].filter(row => row.closest(selector) === container && visible(row));
    const cells = row => [...row.querySelectorAll(':scope > th,:scope > td,:scope > [role="columnheader"],:scope > [role="cell"],:scope > [role="gridcell"],:scope > [role="rowheader"]')];
    const headIndex = rows.findIndex(row => cells(row).some(c => c.matches('th,[role="columnheader"]')));
    const label = text(container.querySelector('caption') || container.querySelector('[role="caption"]') || container.previousElementSibling || container).slice(0, 100) || `Table ${tables.length + 1}`;
    if (headIndex < 0) { warnings.push(`${label}: no column headings detected.`); continue; }
    const header = cells(rows[headIndex]);
    const body = rows.slice(headIndex + 1).filter(row => !row.closest('tfoot'));
    add(container, header, body.map(cells), body, label);
  }
  // Mika's labelled list layout has a separate heading row and typed fields, not table cells.
  // Match its complete header structure, checking each row's types and inline labels.
  for (const container of doc.querySelectorAll('ul.list-group-multicolumn')) {
    if (!visible(container) || container.closest('[data-athrecs-capture]')) continue;
    const head = [...container.children].find(row => row.classList.contains('list-group-header'));
    if (!head) continue;
    const fields = row => [...row.querySelectorAll('.list-field')].filter(cell => !cell.classList.contains('type-favorite'));
    const header = fields(head);
    const rows = [...container.children].filter(row => row !== head && row.classList.contains('list-group-item') && visible(row));
    if (!header.length || !rows.length) continue;
    const heading = cell => text(cell, '.list-label');
    if (header.some(cell => !visible(cell) || !heading(cell))) {
      warnings.push('Labelled results list: widen the browser window until all column headings are visible, then try again.'); continue;
    }
    const signature = cell => [...cell.classList].filter(c => c.startsWith('type-') || c === 'place-primary' || c === 'place-secondary' || c === 'split').sort().join(' ');
    const body = rows.map(fields);
    if (body.some(cells => cells.length !== header.length || cells.some((cell, i) => {
      const inline = cell.querySelector('.list-label')?.textContent.replace(/\s+/g, ' ').trim();
      return !visible(cell) || signature(cell) !== signature(header[i]) || (inline && inline !== heading(header[i]));
    }))) {
      warnings.push('Labelled results list: the row fields do not match the column headings; no rows exported.'); continue;
    }
    add(container, header, body, rows, 'Labelled results list', { omit: '.list-label', links: '.type-fullname a[href]' });
  }
  // Results providers also render labelled responsive lists instead of HTML tables.
  for (const container of doc.querySelectorAll('ul.list-group,ol.list-group,[data-results-list]')) {
    if (!visible(container) || container.closest(selector) || container.matches('.list-group-multicolumn')) continue;
    const rows = [...container.children].filter(row => visible(row) && row.querySelector('[data-label],[data-title]'));
    if (!rows.length) continue;
    const cells = row => [...row.querySelectorAll('[data-label],[data-title]')].filter(cell => !cell.querySelector('[data-label],[data-title]'));
    const columns = cells(rows[0]);
    const headings = columns.map(c => c.getAttribute('data-label') || c.getAttribute('data-title') || '');
    if (headings.some(h => !h) || rows.some(row => JSON.stringify(cells(row).map(c => c.getAttribute('data-label') || c.getAttribute('data-title') || '')) !== JSON.stringify(headings))) {
      warnings.push('Responsive results list: inconsistent column labels; no rows exported.'); continue;
    }
    const fakeHeaders = headings.map(h => {
      const span = doc.createElement('span'); span.setAttribute('data-label', h); return span;
    });
    add(container, fakeHeaders, rows.map(cells), rows, `Results list ${tables.length + 1}`);
  }
  return {
    format: 'athrecs-browser-results-v1', scope: 'loaded-page-only',
    capturedAt: new Date().toISOString(), page: { url: sourceUrl, title: doc.title.slice(0, 500) },
    tables, warnings,
  };
}

export function showBrowserResults(collect, readCollection, startCollection, identifyProvider) {
  const previous = document.querySelector('[data-athrecs-capture]');
  if (previous) { previous.stopCollection?.(); previous.remove(); return; }
  let capture;
  try { capture = collect(document); }
  catch (error) { alert(error.message); return; }
  const host = document.createElement('div'); host.setAttribute('data-athrecs-capture', '');
  host.style.cssText = 'position:fixed;inset:20px;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{all:initial}*{box-sizing:border-box}section{font:15px/1.5 system-ui,sans-serif;color:#122638;background:#fff;max-width:1000px;max-height:calc(100vh - 40px);overflow:auto;margin:auto;padding:24px;border:2px solid #167d8b;border-radius:16px;box-shadow:0 12px 80px #0008}h2{margin:0;font-size:24px}p{margin:12px 0}button,select{font:inherit;padding:10px;border:1px solid #97aeb8;border-radius:8px;background:#f1f7fa;color:#122638;cursor:pointer}button:focus-visible,a:focus-visible,select:focus-visible{outline:3px solid #167d8b}button.primary{background:#126571;color:#fff}button.close{position:sticky;top:0;display:block;margin:0 0 12px auto;background:#122638;color:#fff;border:2px solid #fff;font-weight:700;z-index:1}select{max-width:100%;width:100%}table{border-collapse:collapse;white-space:nowrap;font-size:13px}td,th{padding:8px;border:1px solid #dce5eb;text-align:left}.scroll{overflow:auto}.note{padding:12px;background:#fff5df;border-radius:8px}a{color:#126571}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}';
  root.append(style);
  const make = (tag, value, parent = panel) => { const el = document.createElement(tag); if (value) el.textContent = value; parent.append(el); return el; };
  const panel = document.createElement('section'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Save results for AthRecs'); root.append(panel);
  const close = make('button', 'Close'); close.className = 'close'; close.onclick = () => { host.stopCollection?.(); host.remove(); };
  make('h2', 'Save results for AthRecs');
  make('p', 'Send the rows loaded on this page to the AthRecs import screen. Check the sample before sending.');
  const source = make('p', capture.page.title + ' · ' + capture.page.url); source.style.overflowWrap = 'anywhere';
  const summary = make('p'); summary.className = 'note'; summary.setAttribute('role', 'status');
  if (!capture.tables.length) {
    summary.textContent = 'No supported results table was found on this page. If runners are visible, this layout may need additional support. Check any message below, or save the page as HTML and send it to AthRecs for checking.';
  } else {
    const label = make('label', 'Choose the results table');
    const select = make('select', '', label); select.setAttribute('aria-label', 'Results table');
    capture.tables.forEach((table, i) => { const option = make('option', `${table.rows.length} rows · ${table.headers.join(' / ').slice(0, 130)}`, select); option.value = String(i); });
    const preview = make('div'); preview.className = 'scroll';
    const render = () => {
      const table = capture.tables[Number(select.value)];
      summary.textContent = `${table.rows.length} loaded rows. Check the names, headings and times below. This is a page capture, not confirmation of a complete race field.`;
      preview.replaceChildren();
      const grid = make('table', '', preview), head = make('tr', '', make('thead', '', grid));
      table.headers.forEach(h => make('th', h, head));
      const body = make('tbody', '', grid);
      table.rows.slice(0, 5).forEach(values => { const row = make('tr', '', body); values.forEach(v => make('td', v, row)); });
      make('p', 'Preview: first five captured rows. Original column values are kept with the import.', preview);
    };
    select.onchange = render; render();
    const actions = make('div'); actions.className = 'actions';
    const selectedJson = () => {
      const { tables, ...metadata } = capture;
      const json = JSON.stringify({ ...metadata, table: tables[Number(select.value)] });
      if (new Blob([json]).size > 25 * 1024 * 1024) throw new Error('Capture exceeds 25 MB. Choose a smaller results page.');
      return json;
    };
    const send = make('button', 'Send to AthRecs', actions); send.className = 'primary';
    send.onclick = () => {
      let json;
      try { json = selectedJson(); } catch (error) { summary.textContent = error.message; return; }
      const origin = 'https://update.athrecs.com';
      const token = crypto.randomUUID();
      const target = window.open(origin + '/tools/import-results.html#' + token, '_blank');
      if (!target) { summary.textContent = 'Allow the AthRecs tab to open, or use Download a file instead.'; return; }
      send.disabled = true;
      summary.textContent = 'Opening AthRecs. Keep this page open while the selected rows transfer…';
      const finish = (message) => {
        window.removeEventListener('message', receive); clearTimeout(timeout);
        send.disabled = false; summary.textContent = message;
      };
      const receive = (event) => {
        if (event.source !== target || event.origin !== origin || event.data?.token !== token) return;
        if (event.data.type === 'athrecs-import-ready') target.postMessage({ type: 'athrecs-import-capture', token, json }, origin);
        if (event.data.type === 'athrecs-import-received') finish('Rows received. In the AthRecs tab, click Continue to import. Review the race and preview, then save.');
        if (event.data.type === 'athrecs-import-error') finish('AthRecs could not keep this capture. See the message in its tab, or use Download a file instead.');
      };
      window.addEventListener('message', receive);
      const timeout = setTimeout(() => finish('The transfer could not be confirmed. Check the AthRecs tab. If it has no capture, use Download a file instead.'), 35000);
    };
    if (identifyProvider(location.href)) {
      try {
        const first = readCollection(document, location.href);
        if (first.page !== 1) throw Error('Open page 1 to collect every page for these filters.');
        make('p', `Collect every page for: ${first.filterLabel} · ${first.totalPages} pages · ${first.totalRows.toLocaleString()} results. To collect the whole field, choose All runners and remove other filters on the results website first.`);
        const all = make('button', 'Collect all pages', actions);
        const pause = make('button', 'Pause collection', actions); pause.disabled = true;
        const resume = make('button', 'Resume collection', actions); resume.disabled = true;
        all.onclick = () => {
          const origin = 'https://update.athrecs.com', token = crypto.randomUUID();
          const target = window.open(origin + '/tools/import-results.html#' + token, '_blank');
          if (!target) { summary.textContent = 'Allow the AthRecs tab to open, then try Collect all pages again.'; return; }
          all.disabled = true; send.disabled = true;
          const collection = { version: 1, firstUrl: first.capture.page.url, totalPages: first.totalPages, totalRows: first.totalRows, pageSize: first.pageSize, filterLabel: first.filterLabel };
          const stop = startCollection(first, readCollection, target, token, summary, { pause, resume });
          let received = false;
          const ready = event => {
            if (event.source !== target || event.origin !== origin || event.data?.token !== token) return;
            if (event.data.type === 'athrecs-import-ready') target.postMessage({ type: 'athrecs-import-capture', token, json: JSON.stringify(first.capture), collection }, origin);
            if (event.data.type === 'athrecs-import-received') { received = true; clearTimeout(timeout); window.removeEventListener('message', ready); summary.textContent = 'In the AthRecs tab, confirm the race and click Save and collect all pages. Keep both tabs open; closing this panel stops collection.'; }
            if (event.data.type === 'athrecs-import-error') { stop(); summary.textContent = 'AthRecs could not prepare the collection. Check its tab or try the single-page import.'; }
          };
          const timeout = setTimeout(() => { if (!received) { stop(); window.removeEventListener('message', ready); summary.textContent = 'Transfer not confirmed. Check the AthRecs tab; reopen this button to restart if needed.'; } }, 35000);
          window.addEventListener('message', ready);
          host.stopCollection = () => { clearTimeout(timeout); window.removeEventListener('message', ready); stop(); };
          summary.textContent = 'Opening AthRecs. Confirm this race once to save all pages automatically.';
        };
      } catch (error) { make('p', 'All-pages collection: ' + error.message); }
    }
    const save = make('button', 'Download a file instead', actions);
    save.onclick = () => {
      const { tables, ...metadata } = capture;
      const selected = { ...metadata, table: tables[Number(select.value)] };
      const json = JSON.stringify(selected, null, 2);
      if (new Blob([json]).size > 25 * 1024 * 1024) { summary.textContent = 'Capture exceeds 25 MB. Choose a smaller results page.'; return; }
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = make('a', '', actions); a.href = url;
      a.download = `athrecs-results-${new URL(capture.page.url).hostname}-${Date.now()}.athrecs.json`;
      a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      summary.textContent = `Download requested for ${selected.table.rows.length} rows. Choose this .athrecs.json file in AthRecs → Collected results → Import a race. Keep the same race source ID when adding the next page.`;
    };
    const link = make('a', 'Open AthRecs collected results', actions); link.href = 'https://update.athrecs.com/admin/result-archive'; link.target = '_blank'; link.rel = 'noopener noreferrer';
  }
  if (capture.warnings.length) make('p', capture.warnings.join(' '));
  make('p', 'Use results you are authorised to retain. Only the selected table, its visible row links and capture details are sent. Other pages are collected only after choosing Collect all pages and confirming the race in AthRecs. Athlete identity and publication still need review.');
  document.documentElement.append(host); close.focus();
}

export function browserResultsBookmark() {
  return 'javascript:' + encodeURIComponent(`void (${showBrowserResults.toString()})(${collectBrowserResults.toString()},${marathonPageReaderExpression()},${startBrowserCollection.toString()},${resultCollectionProvider.toString()})`);
}
