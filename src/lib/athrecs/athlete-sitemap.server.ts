import type { Sql } from "../db";

// Keep well below the 50,000 URL limit and bound each database read.
export const ATHLETE_SITEMAP_PAGE_SIZE = 5000;

const publicSourceProfile = `(a.profile_type = 'Public figure' or a.profile_visibility = 'public')
  and not exists (select 1 from athlete_account_links l
    where l.athlete_id = a.id and l.status = 'active')`;

export async function athleteSitemapPageCount(sql: Sql): Promise<number> {
  const [row] = await sql.query<{ count: number }>(
    `select count(*)::int as count from athletes a where ${publicSourceProfile}`,
  );
  return Math.ceil(row.count / ATHLETE_SITEMAP_PAGE_SIZE);
}

export async function athleteSitemapSlugs(sql: Sql, page: number): Promise<string[]> {
  if (!Number.isSafeInteger(page) || page < 1) return [];
  const rows = await sql.query<{ slug: string }>(
    `select a.slug from athletes a where ${publicSourceProfile}
     order by a.id limit $1 offset $2`,
    [ATHLETE_SITEMAP_PAGE_SIZE, (page - 1) * ATHLETE_SITEMAP_PAGE_SIZE],
  );
  return rows.map((row) => row.slug);
}

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]!,
  );
}

export function sitemapXml(urls: string[], index = false): string {
  const root = index ? "sitemapindex" : "urlset";
  const entry = index ? "sitemap" : "url";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <${entry}><loc>${escapeXml(url)}</loc></${entry}>`)
    .join("\n")}\n</${root}>\n`;
}

export function sitemapResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Publication and privacy changes must be reflected on the next crawl.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
