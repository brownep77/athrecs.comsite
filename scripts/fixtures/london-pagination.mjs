// Invented test runners only. Matches the pagination structure in the supplied HTML.
export const londonFixtureUrl = 'https://results.tcslondonmarathon.com/2026/?page=1&event=MAS&num_results=2&pid=list&search%5Bsex%5D=W';
export function londonPaginationFixture(page = 1, { total = 5, repeated = false, wrongHeader = false } = {}) {
  const headers = ['Place (Overall)', 'Place (Gender)', 'Place (Category)', 'Name', 'Club', 'Runner Number', 'Category', 'Event', 'Half', 'Finish'];
  const types = ['type-place place-secondary', 'type-place place-primary', 'type-place place-secondary', 'type-fullname', 'type-field', 'type-field', 'type-age_class', 'type-event_name', 'type-time split', 'type-time split'];
  const fields = (values, body = false) => values.map((v, i) => `<div class="list-field ${types[i]}">${body && i > 3 ? `<div class="list-label">${headers[i]}</div>` : ''}${v}</div>`).join('');
  const url = (n) => { const u = new URL(londonFixtureUrl); u.searchParams.set('page', String(n)); return u; };
  const links = Array.from({ length: Math.ceil(total / 2) }, (_, i) => {
    const n = i + 1, href = url(n).search.replaceAll('&', '&amp;');
    const silver = [...href].map(c => c.charCodeAt(0)).join(',');
    return `<li class="${n === page ? 'active' : ''}"><a href="#" data-silver="${silver}" class="silver-link">${n}</a></li>`;
  }).join('');
  const body = Array.from({ length: Math.max(0, Math.min(2, total - (page - 1) * 2)) }, (_, i) => {
    const rank = repeated ? i + 1 : (page - 1) * 2 + i + 1;
    const name = rank === 1 ? 'Synthetic, Morgan Browser (IRL)' : `Synthetic, Runner ${rank} (GBR)`;
    const values = [String(rank), String(rank), String(rank), `<a href="?content=detail&idp=synthetic-${9000 + rank}">${name}</a>`, 'Synthetic AC', String(9000 + rank), '18-39', 'Mass', '00:18:00', `00:3${rank}:00`];
    return `<li class="list-group-item">${fields(values, true)}<div class="list-field type-favorite">Favourite</div></li>`;
  }).join('');
  if (wrongHeader) headers[0] = 'Wrong placing';
  return `<!doctype html><title>Synthetic London collection</title><style>.list-label{display:none}</style><ul class="list-info"><li><span class="str_num">${total} Results</span> | <span class="officiality">unofficial results</span> | <span class="list-info__filter sex">Women</span></li></ul><ul class="list-group-multicolumn"><li class="list-group-header">${fields(headers)}</li>${body}</ul><ul class="pagination">${links}</ul>`;
}
