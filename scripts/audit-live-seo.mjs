#!/usr/bin/env node
/**
 * Sitewide public URL SEO audit.
 * Reads the published sitemap index and every child sitemap; does not need DB access.
 * Usage:
 *   node scripts/audit-live-seo.mjs --origin=https://www.athrecs.com --limit=100
 *   node scripts/audit-live-seo.mjs --origin=https://www.athrecs.com --limit=0 --output=seo-audit.json
 * A limit of 0 audits all sitemap URLs. This script is a read-only diagnostic,
 * not a deployment gate: network availability and size can vary.
 */
import { writeFile } from "node:fs/promises";

const arg = (key, fallback) => {
  const found = process.argv.find((x) => x.startsWith(`--${key}=`));
  return found ? found.slice(key.length + 3) : fallback;
};
const origin = new URL(arg("origin", "https://www.athrecs.com")).origin;
const limit = Math.max(0, Number.parseInt(arg("limit", "100"), 10) || 0);
const concurrency = Math.min(8, Math.max(1, Number.parseInt(arg("concurrency", "4"), 10) || 4));
const output = arg("output", "");
const TIMEOUT_MS = 20000;
const problems = [];
const notices = [];
const stats = { sitemapFiles: 0, discoveredUrls: 0, auditedUrls: 0, failures: 0 };

function decodeXml(text) {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}
function xmlLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => decodeXml(m[1].trim()));
}
async function request(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "AthRecs-SEO-Audit/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { response, body: await response.text() };
}
function absolutePublicUrl(value) {
  try {
    const url = new URL(value);
    if (url.origin !== origin || !/^https?:$/.test(url.protocol)) return null;
    return url.href;
  } catch { return null; }
}
async function discoverSitemaps() {
  const seen = new Set();
  const pages = new Set();
  const queue = [origin + "/sitemap.xml"];
  while (queue.length) {
    const target = queue.shift();
    if (seen.has(target)) continue;
    seen.add(target);
    if (seen.size > 5000) throw Error("Sitemap index exceeded safety limit");
    const { response, body } = await request(target);
    if (!response.ok) {
      problems.push({ url: target, kind: "sitemap-http", status: response.status });
      continue;
    }
    if (!/<(?:sitemapindex|urlset)\b/.test(body)) {
      problems.push({ url: target, kind: "invalid-sitemap-xml" });
      continue;
    }
    if (/<sitemapindex\b/.test(body)) {
      for (const loc of xmlLocs(body)) {
        const url = absolutePublicUrl(loc);
        if (url && !seen.has(url)) queue.push(url);
        else if (!url) notices.push({ url: target, kind: "external-sitemap", value: loc });
      }
    } else {
      for (const loc of xmlLocs(body)) {
        const url = absolutePublicUrl(loc);
        if (url) pages.add(url);
        else notices.push({ url: target, kind: "external-url", value: loc });
      }
    }
  }
  stats.sitemapFiles = seen.size;
  stats.discoveredUrls = pages.size;
  return [...pages];
}
function tagContent(html, attribute, value) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  return tags.filter((tag) =>
    new RegExp(`\\b${attribute}\\s*=\\s*["']${value}["']`, "i").test(tag)
  ).map((tag) => tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1] ?? "");
}
function canonicals(html) {
  return (html.match(/<link\b[^>]*>/gi) ?? []).filter((tag) => /\brel\s*=\s*["']canonical["']/i.test(tag))
    .map((tag) => tag.match(/\bhref\s*=\s*["']([^"']*)["']/i)?.[1] ?? "");
}
async function inspect(url) {
  try {
    const { response, body } = await request(url);
    stats.auditedUrls++;
    if (!response.ok) {
      problems.push({ url, kind: "http", status: response.status });
      return;
    }
    if (response.url !== url) problems.push({ url, kind: "sitemap-redirect", destination: response.url });
    const robotsHeader = response.headers.get("x-robots-tag") ?? "";
    if (/\bnoindex\b/i.test(robotsHeader) || /\bnoindex\b/i.test(tagContent(body, "name", "robots").join(" "))) {
      problems.push({ url, kind: "sitemap-noindex" });
    }
    const titles = [...body.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((x) => x[1].trim());
    if (titles.length !== 1 || !titles[0]) problems.push({ url, kind: "title-count", count: titles.length });
    const descriptions = tagContent(body, "name", "description");
    if (descriptions.length !== 1 || !descriptions[0].trim()) problems.push({ url, kind: "description-count", count: descriptions.length });
    const canonical = canonicals(body);
    if (canonical.length !== 1) problems.push({ url, kind: "canonical-count", count: canonical.length });
    else {
      const normalized = new URL(canonical[0], url).href;
      if (normalized !== url) problems.push({ url, kind: "canonical-mismatch", canonical: normalized });
    }
    const headings = body.match(/<h1(?:\s|>)/gi) ?? [];
    if (headings.length !== 1) notices.push({ url, kind: "h1-count", count: headings.length });
    if (!/text\/html/i.test(response.headers.get("content-type") ?? "")) notices.push({ url, kind: "non-html-content" });
  } catch (error) {
    problems.push({ url, kind: "fetch-error", error: String(error).slice(0, 200) });
  }
}
async function main() {
  const urls = await discoverSitemaps();
  const selected = limit ? urls.slice(0, limit) : urls;
  let cursor = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < selected.length) {
      const current = selected[cursor++];
      await inspect(current);
    }
  }));
  stats.failures = problems.length;
  const result = { origin, createdAt: new Date().toISOString(), limit, stats, problems, notices };
  if (output) await writeFile(output, JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ stats, sampleProblems: problems.slice(0, 30), sampleNotices: notices.slice(0, 10), output }, null, 2));
  if (problems.length) process.exitCode = 1;
}
await main();
