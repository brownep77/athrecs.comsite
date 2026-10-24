/** Runs only after the staff importer acknowledges the first saved page. */
export function startBrowserCollection(first, readPage, target, token, status, controls) {
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
