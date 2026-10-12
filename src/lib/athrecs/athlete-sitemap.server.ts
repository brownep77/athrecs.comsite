import type { Sql } from "../db";
import { indexableApprovedAthleteSetSql } from "./athlete-search-policy.server.ts";
import { withDiscoveryRead } from "./discovery-read.server.ts";

// Keep well below the 50,000 URL limit and bound each database read.
export const ATHLETE_SITEMAP_PAGE_SIZE = 5000;

const indexableProfiles = `select a.slug, a.id as sort_key
  from athletes a where ${indexableApprovedAthleteSetSql}`;

export async function athleteSitemapPageCount(sql: Sql): Promise<number> {
  const [row] = await withDiscoveryRead(sql, (read) =>
    read.query<{ count: number }>(
      `select count(*)::int as count from (${indexableProfiles}) profiles`,
    ),
  );
  return Math.ceil(row.count / ATHLETE_SITEMAP_PAGE_SIZE);
}

export async function athleteSitemapSlugs(sql: Sql, page: number): Promise<string[]> {
  if (!Number.isSafeInteger(page) || page < 1) return [];
  const rows = await withDiscoveryRead(sql, (read) =>
    read.query<{ slug: string }>(
      // Build the eligible set before LIMIT influences the join plan. Otherwise
      // underestimated approval joins can rescan the entire set for each slug.
      `with profiles as materialized (${indexableProfiles})
     select slug from profiles
     order by sort_key limit $1 offset $2`,
      [ATHLETE_SITEMAP_PAGE_SIZE, (page - 1) * ATHLETE_SITEMAP_PAGE_SIZE],
    ),
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

export type SitemapEntry = string | { url: string; lastmod?: string };

export function sitemapXml(urls: SitemapEntry[], index = false): string {
  const root = index ? "sitemapindex" : "urlset";
  const entry = index ? "sitemap" : "url";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((value) => {
      const { url, lastmod } = typeof value === "string" ? { url: value } : value;
      return `  <${entry}><loc>${escapeXml(url)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</${entry}>`;
    })
    .join("\n")}\n</${root}>\n`;
}

export function sitemapResponse(xml: string, index = false): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Publication and privacy changes must be reflected on the next crawl.
      // The index contains only child sitemap filenames, never athlete URLs.
      // Membership in every child sitemap remains freshly privacy-checked.
      "Cache-Control": index ? "public, max-age=60, s-maxage=300" : "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
