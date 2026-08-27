#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE_URL = "https://www.ironman.com";
const OUTPUT_DIR = "tmp/ironman-703-audit";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function visibleText(html) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

async function fetchText(url, accept = "text/html") {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: accept,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
  }
  throw lastError;
}

function ajaxUrl(page) {
  const url = new URL(`${BASE_URL}/views/ajax`);
  url.searchParams.set("_wrapper_format", "drupal_ajax");
  url.searchParams.set("view_name", "races_v2");
  url.searchParams.set("view_display_id", "block_1");
  url.searchParams.set("view_path", "/node/108781");
  url.searchParams.set("pager_element", "0");
  url.searchParams.set("facet[0]", "race:IRONMAN 70.3");
  url.searchParams.set("page", String(page));
  url.searchParams.set("_drupal_ajax", "1");
  return url;
}

function extractRaceIds(html) {
  const ids = new Set();
  const patterns = [
    /href=["'](?:https:\/\/www\.ironman\.com)?\/(?:races\/)?(im703-[a-z0-9-]+)(?:[/?#"'])/gi,
    /(?:https:\/\/www\.ironman\.com)?\/(?:races\/)?(im703-[a-z0-9-]+)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) ids.add(match[1]);
  }
  return [...ids];
}

function extractMetadata(id, html, url) {
  const text = visibleText(html);
  const title = decodeHtml(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? id,
  );
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? url;
  const dates = [
    ...new Set(
      text.match(
        /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+20\d{2}\b/gi,
      ) ?? [],
    ),
  ].slice(0, 20);
  const statuses = [
    ...new Set(
      text.match(
        /\b(?:General Registration Sold Out|Registration Sold Out|Registration Now Open|Registration Opening Soon|Registration Closed|Race Weekend)\b/gi,
      ) ?? [],
    ),
  ];
  return {
    id,
    url,
    canonical,
    title,
    dates,
    statuses,
    textPreview: text.slice(0, 4000),
  };
}

await mkdir(join(OUTPUT_DIR, "ajax"), { recursive: true });
await mkdir(join(OUTPUT_DIR, "races"), { recursive: true });

const ids = new Set();
for (let page = 0; page <= 50; page += 1) {
  const url = ajaxUrl(page);
  const raw = await fetchText(url, "application/json");
  await writeFile(join(OUTPUT_DIR, "ajax", `page-${page}.json`), raw);
  const payload = JSON.parse(raw);
  const html = payload
    .filter((item) => typeof item?.data === "string")
    .map((item) => item.data)
    .join("\n");
  await writeFile(join(OUTPUT_DIR, "ajax", `page-${page}.html`), html);
  const pageIds = extractRaceIds(html);
  console.log(`page ${page}: ${pageIds.length} race links`);
  if (pageIds.length === 0) break;
  const before = ids.size;
  pageIds.forEach((id) => ids.add(id));
  if (ids.size === before && page > 0) break;
  await new Promise((resolve) => setTimeout(resolve, 500));
}

const races = [];
for (const id of [...ids].sort()) {
  const candidateUrls = [`${BASE_URL}/races/${id}`, `${BASE_URL}/${id}`];
  let html;
  let resolvedUrl;
  let error;
  for (const candidateUrl of candidateUrls) {
    try {
      html = await fetchText(candidateUrl);
      resolvedUrl = candidateUrl;
      break;
    } catch (candidateError) {
      error = candidateError;
    }
  }
  if (!html) {
    races.push({ id, error: String(error) });
    continue;
  }
  await writeFile(join(OUTPUT_DIR, "races", `${id}.html`), html);
  races.push(extractMetadata(id, html, resolvedUrl));
  console.log(`race ${races.length}/${ids.size}: ${id}`);
  await new Promise((resolve) => setTimeout(resolve, 150));
}

await writeFile(join(OUTPUT_DIR, "race-ids.txt"), `${[...ids].sort().join("\n")}\n`);
await writeFile(
  join(OUTPUT_DIR, "summary.json"),
  `${JSON.stringify({ checkedAt: new Date().toISOString(), count: ids.size, races }, null, 2)}\n`,
);
console.log(`Audited ${ids.size} IRONMAN 70.3 race pages.`);
