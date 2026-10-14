/** Self-contained: embedded in the bookmark. Parse inert HTML; never execute source scripts. */
export function readLondonCollectionPage(doc, address) {
  const base = new URL(address);
  if (base.origin !== 'https://results.tcslondonmarathon.com' || !/^\/\d{4}\/$/.test(base.pathname)) throw Error('Automatic collection currently supports London Marathon results only.');
  const clean = (el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll('.list-label,script,style,input,button,select,textarea,[hidden],[aria-hidden="true"]').forEach(e => e.remove());
    return copy.textContent.replace(/\s+/g, ' ').trim();
  };
  const tables = [...doc.querySelectorAll('ul.list-group-multicolumn')];
  if (tables.length !== 1) throw Error('The expected results list is missing. The site may have blocked the request; collection has stopped.');
  const list = tables[0], head = [...list.children].find(e => e.classList.contains('list-group-header'));
  if (!head) throw Error('Results headings are missing.');
  const cells = row => [...row.querySelectorAll('.list-field')].filter(e => !e.classList.contains('type-favorite'));
  const headers = cells(head).map(clean);
  const required = ['Place (Overall)', 'Place (Gender)', 'Place (Category)', 'Name', 'Club', 'Runner Number', 'Category', 'Event', 'Half', 'Finish'];
  if (JSON.stringify(headers) !== JSON.stringify(required)) throw Error('London column headings have changed. Review this page before continuing.');
  const signature = e => [...e.classList].filter(c => c.startsWith('type-') || c === 'place-primary' || c === 'place-secondary' || c === 'split').sort().join(' ');
  const expectedTypes = cells(head).map(signature);
  const body = [...list.children].filter(e => e !== head && e.classList.contains('list-group-item'));
  if (!body.length || body.length > 5000) throw Error('The page has no results or exceeds 5,000 rows.');
  const rows = body.map(row => {
    const fields = cells(row);
    if (fields.length !== headers.length || fields.some((e, i) => signature(e) !== expectedTypes[i] || (e.querySelector('.list-label') && clean(e.querySelector('.list-label')) !== headers[i]))) throw Error('A result row does not match the headings.');
    const values = fields.map(clean);
    if (values.some(v => v.length > 4000)) throw Error('A result cell is too large.');
    return values;
  });
  const bibIndex = headers.indexOf('Runner Number');
  const keys = rows.map(r => r[bibIndex]);
  if (keys.some(k => !k) || new Set(keys).size !== keys.length) throw Error('Missing or repeated runner numbers; automatic collection needs review.');
  const rowLinks = body.map(row => [...row.querySelectorAll('.type-fullname a[href]')].map(a => {
    const u = new URL(a.getAttribute('href'), base);
    if (u.origin !== base.origin || u.pathname !== base.pathname || !u.searchParams.get('idp') || u.username || u.password) throw Error('An athlete detail link has changed unexpectedly.');
    return u.href;
  }));
  const nav = doc.querySelector('ul.pagination');
  if (!nav) throw Error('Page navigation is missing; use the single-page button for this listing.');
  const links = [...nav.querySelectorAll('a')].flatMap(a => {
    if (a.closest('li')?.classList.contains('disabled')) return [];
    let href = a.getAttribute('href') || '';
    const silver = a.getAttribute('data-silver');
    if (silver) {
      if (silver.length > 16000 || !/^\d+(,\d+)*$/.test(silver)) throw Error('Unsupported navigation link.');
      const codes = silver.split(',').map(Number);
      if (codes.some(c => c < 32 || c > 126)) throw Error('Unsupported navigation link.');
      href = codes.map(c => String.fromCharCode(c)).join('').replace(/&amp;/g, '&');
    }
    const u = new URL(href, base);
    if (!u.searchParams.has('page')) return [];
    if (u.origin !== base.origin || u.pathname !== base.pathname || u.username || u.password || u.searchParams.get('pid') !== 'list' || u.searchParams.has('idp') || u.searchParams.has('content')) throw Error('Page navigation left this results listing.');
    u.hash = '';
    const page = Number(u.searchParams.get('page'));
    if (!Number.isSafeInteger(page) || page < 1 || page > 500) throw Error('Invalid page number or more than 500 pages. Choose a smaller result filter.');
    return [{ page, url: u.href, active: Boolean(a.closest('li')?.classList.contains('active')) }];
  });
  const active = links.filter(l => l.active);
  if (active.length !== 1) throw Error('The current page cannot be identified safely.');
  const scope = value => { const u = new URL(value); u.searchParams.delete('page'); u.searchParams.sort(); return u.href; };
  if (links.some(l => scope(l.url) !== scope(active[0].url))) throw Error('Pagination changes the selected race filters.');
  const totalText = doc.querySelector('.list-info .str_num')?.textContent.trim() || '';
  if (!/^[\d,]+\s+Results$/i.test(totalText)) throw Error('The source result total is missing.');
  const totalRows = Number(totalText.replace(/[^\d]/g, ''));
  const pageSize = Number(new URL(active[0].url).searchParams.get('num_results'));
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 5000 || totalRows < 1 || totalRows > 1000000) throw Error('The page size or result total is unsupported.');
  const totalPages = Math.ceil(totalRows / pageSize);
  if (totalPages > 500 || active[0].page > totalPages || rows.length !== Math.min(pageSize, totalRows - (active[0].page - 1) * pageSize)) throw Error('The loaded row count does not match the source page and total.');
  const next = links.find(l => l.page === active[0].page + 1)?.url ?? null;
  if (active[0].page < totalPages && !next) throw Error('The next page link is missing. Collection cannot skip pages.');
  const label = [...doc.querySelectorAll('.list-info__filter')].map(clean).filter(Boolean).join(' · ') || 'Current source filters';
  const officiality = doc.querySelector('.list-info .officiality')?.textContent.trim();
  return {
    capture: { format: 'athrecs-browser-results-v1', scope: 'loaded-page-only', capturedAt: new Date().toISOString(), page: { url: active[0].url, title: doc.title.slice(0, 500) }, table: { label: 'London-style results', headers, rows, rowLinks }, warnings: officiality ? [officiality] : [] },
    page: active[0].page, next, first: links.find(l => l.page === 1)?.url ?? null,
    scope: scope(active[0].url), totalRows, totalPages, pageSize, filterLabel: label.slice(0, 500), keys,
  };
}

/** Runs only after the staff importer acknowledges the first saved page. */
export function startLondonCollection(first, readPage, target, token, status, controls) {
  const origin = 'https://update.athrecs.com';
  let current = first, pending = null, active = false, stopped = false, waiting = null;
  let seen = new Set(first.keys);
  const tell = (type, extra = {}) => { if (!target.closed) target.postMessage({ type, token, ...extra }, origin); };
  const pause = (message) => { stopped = true; status.textContent = message; tell('athrecs-collection-status', { message }); };
  const loop = async () => {
    if (active) return;
    active = true; stopped = false;
    try {
      while (!stopped && current.next) {
        if (target.closed) throw Error('The AthRecs tab was closed. Reopen the browser button to restart; saved rows will be checked for duplicates.');
        if (!pending) {
          status.textContent = `Saved page ${current.page} of ${first.totalPages}. Loading the next page…`;
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (stopped) break;
          const response = await fetch(current.next, { credentials: 'same-origin', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000) });
          if (!response.ok) throw Error(`The results site returned HTTP ${response.status}. Collection stopped; no automatic retries.`);
          if (!response.headers.get('content-type')?.includes('text/html')) throw Error('The results site did not return a results page.');
          const html = await response.text();
          if (html.length > 25 * 1024 * 1024) throw Error('The next page is too large.');
          pending = readPage(new DOMParser().parseFromString(html, 'text/html'), response.url);
          if (pending.page !== current.page + 1 || pending.scope !== first.scope || pending.totalRows !== first.totalRows || pending.totalPages !== first.totalPages || JSON.stringify(pending.capture.table.headers) !== JSON.stringify(first.capture.table.headers) || pending.keys.some(k => seen.has(k))) { pending = null; throw Error('A page repeated runners, changed filters or changed totals. Saved pages are retained; review the source before restarting.'); }
        }
        if (stopped) break;
        const page = pending.page, json = JSON.stringify(pending.capture);
        status.textContent = `Saving page ${page} of ${first.totalPages} into AthRecs…`;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => { waiting = null; reject(Error('AthRecs did not confirm the save. Keep both tabs open and use Resume collection to retry safely.')); }, 90000);
          waiting = { page, resolve: () => { clearTimeout(timeout); waiting = null; resolve(); }, reject: message => { clearTimeout(timeout); waiting = null; reject(Error(message)); } };
          tell('athrecs-collection-page', { page, json });
        });
        pending.keys.forEach(k => seen.add(k)); current = pending; pending = null;
      }
      if (!stopped && !current.next) {
        if (seen.size !== first.totalRows) throw Error('The saved total differs from the source total. Review the partial collection.');
        status.textContent = `Saved all ${first.totalPages} pages (${seen.size.toLocaleString()} results) for ${first.filterLabel}.`;
        tell('athrecs-collection-complete', { pages: current.page, rows: seen.size });
      }
    } catch (error) { pause(`${error.message} Already saved pages are kept.`); }
    finally { active = false; controls.pause.disabled = true; controls.resume.disabled = !stopped; }
  };
  controls.pause.onclick = () => { pause('Paused. The current save can finish; use Resume collection when ready.'); controls.resume.disabled = false; };
  controls.resume.onclick = () => { if (!active) { controls.pause.disabled = false; controls.resume.disabled = true; void loop(); } };
  const receive = event => {
    if (event.source !== target || event.origin !== origin || event.data?.token !== token) return;
    if (event.data.type === 'athrecs-collection-start' && !active) {
      // Staff may have refreshed and reconfirmed. Restart from page one, safely deduplicating.
      current = first; pending = null; seen = new Set(first.keys); controls.pause.disabled = false; controls.resume.disabled = true; void loop();
    }
    if (event.data.type === 'athrecs-collection-saved' && waiting?.page === event.data.page) waiting.resolve();
    if (event.data.type === 'athrecs-collection-error' && waiting?.page === event.data.page) waiting.reject(event.data.message || 'AthRecs could not save this page.');
    if (event.data.type === 'athrecs-collection-stop' && current.next) pause('Paused by AthRecs. Keep both tabs open to resume.');
  };
  window.addEventListener('message', receive);
  return () => { stopped = true; waiting?.reject('Collection closed.'); window.removeEventListener('message', receive); };
}
