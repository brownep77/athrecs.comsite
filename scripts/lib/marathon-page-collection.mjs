import { resultCollectionProvider, resultCollectionScope } from '../../src/lib/results-archive/collection-provider.ts';

/** Parse inert source HTML. All shared dependencies are explicitly injected. */
export function createMarathonPageReader(identifyProvider, scopeFor) {
  return function readMarathonCollectionPage(doc, address) {
    const provider = identifyProvider(address);
    if (!provider?.automatic) throw Error(provider?.note || 'Automatic collection is not supported for this results source.');
    const base = new URL(address);
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
    // Fields are mapped by heading, so a harmless column reorder is supported.
    // Unknown/missing/duplicate headings still require an adapter review.
    if (headers.length !== provider.headings.length || new Set(headers).size !== headers.length || headers.some(h => !provider.headings.includes(h)))
      throw Error(`${provider.name} column headings have changed. Review this page before continuing.`);
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
    const keys = rows.map(r => r[headers.indexOf(provider.bibHeading)]);
    if (keys.some(k => !k) || new Set(keys).size !== keys.length) throw Error('Missing or repeated runner numbers; automatic collection needs review.');
    const rowLinks = body.map(row => [...row.querySelectorAll('.type-fullname a[href]')].map(a => {
      const u = new URL(a.getAttribute('href'), base);
      if (u.origin !== base.origin || u.pathname !== base.pathname || !u.searchParams.get('idp') || u.searchParams.getAll('idp').length !== 1 || u.username || u.password) throw Error('An athlete detail link has changed unexpectedly.');
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
      if (u.origin !== base.origin || u.pathname !== base.pathname) throw Error('Page navigation left this results listing.');
      scopeFor(u.href);
      u.hash = '';
      return [{ page: Number(u.searchParams.get('page')), url: u.href, active: Boolean(a.closest('li')?.classList.contains('active')) }];
    });
    const active = links.filter(l => l.active);
    if (active.length !== 1) throw Error('The current page cannot be identified safely.');
    const scope = scopeFor(active[0].url);
    if (links.some(l => scopeFor(l.url) !== scope)) throw Error('Pagination changes the selected race filters.');
    // Navigation may supply omitted defaults, but every explicitly requested
    // page/filter must agree, even when the initial URL omitted a page number.
    const activeUrl = new URL(active[0].url);
    if (base.searchParams.has('idp') || base.searchParams.has('content') || [...base.searchParams].some(([key, value]) => base.searchParams.getAll(key).length !== 1 || activeUrl.searchParams.get(key) !== value))
      throw Error('The returned results page does not match the requested page and filters.');
    const totalText = doc.querySelector('.list-info .str_num')?.textContent.trim() || '';
    if (!/^(?:\d+|[1-9]\d{0,2}(?:,\d{3})+)\s+Results$/i.test(totalText)) throw Error('The source result total is missing or ambiguous.');
    const totalRows = Number(totalText.replace(/[^\d]/g, ''));
    const pageSize = Number(new URL(active[0].url).searchParams.get('num_results'));
    const totalPages = Math.ceil(totalRows / pageSize);
    if (totalRows < 1 || totalRows > 1000000 || totalPages > 500 || active[0].page > totalPages || rows.length !== Math.min(pageSize, totalRows - (active[0].page - 1) * pageSize)) throw Error('The loaded row count does not match the source page and total.');
    const nextLinks = links.filter(l => l.page === active[0].page + 1);
    if (new Set(nextLinks.map(l => { const u = new URL(l.url); u.searchParams.sort(); return u.href; })).size > 1) throw Error('The next page links disagree.');
    const next = nextLinks[0]?.url ?? null;
    if (active[0].page < totalPages && !next) throw Error('The next page link is missing. Collection cannot skip pages.');
    if (active[0].page === totalPages && next) throw Error('Page navigation exceeds the stated source total.');
    const label = [...doc.querySelectorAll('.list-info__filter')].map(clean).filter(Boolean).join(' · ') || 'Current source filters';
    const officiality = doc.querySelector('.list-info .officiality')?.textContent.trim();
    return {
      capture: { format: 'athrecs-browser-results-v1', scope: 'loaded-page-only', capturedAt: new Date().toISOString(), page: { url: active[0].url, title: doc.title.slice(0, 500) }, table: { label: `${provider.name} results`, headers, rows, rowLinks }, warnings: officiality ? [officiality] : [] },
      providerId: provider.id,
      page: active[0].page, next, first: links.find(l => l.page === 1)?.url ?? null,
      scope, totalRows, totalPages, pageSize, filterLabel: label.slice(0, 500), keys,
    };
  };
}

export const readMarathonCollectionPage = createMarathonPageReader(resultCollectionProvider, resultCollectionScope);

/** A complete standalone expression for the bookmark and the inert local parser. */
export function marathonPageReaderExpression() {
  return `(()=>{const resultCollectionProvider=${resultCollectionProvider.toString()};const resultCollectionScope=${resultCollectionScope.toString()};return (${createMarathonPageReader.toString()})(resultCollectionProvider,resultCollectionScope);})()`;
}
