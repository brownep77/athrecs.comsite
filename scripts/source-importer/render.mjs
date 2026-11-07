// Free JavaScript-page reader for fixture sources the plain importer cannot see.
// Uses a local headless browser (Playwright) - no paid scraping credits. Honours robots.txt and the registry rate limit.
// Usage: node scripts/source-importer/render.mjs --adapter racebest [--from 2026-10-27] [--to 2027-12-31] [--out dir] [--max-detail 150]
// Output matches the plain importer: fixtures.csv (upload to Import running fixtures), skipped.csv, report.md. Publishes nothing.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { OUTPUT_HEADERS, USER_AGENT, parseRobots, toCsv } from "./lib.mjs";

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const COUNTY = new Set("bedfordshire berkshire buckinghamshire cambridgeshire cheshire cornwall cumbria derbyshire devon dorset durham essex gloucestershire hampshire herefordshire hertfordshire kent lancashire leicestershire lincolnshire norfolk northamptonshire northumberland nottinghamshire oxfordshire rutland shropshire somerset staffordshire suffolk surrey sussex warwickshire wiltshire worcestershire yorkshire antrim armagh down fermanagh londonderry tyrone".split(" "));
const isCountyish = (s) => COUNTY.has(s.toLowerCase().replace(/^(north|south|east|west)\s+/, "").replace(/\s+(yorkshire|sussex)$/, " $1").trim()) || /\b(yorkshire|sussex|midlands|county)\b/i.test(s) || COUNTY.has(s.toLowerCase());

export const toIso = (text) => {
  const m = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3})[a-z]*\.?\s+(20\d\d)/.exec(text);
  if (!m || !MONTHS[m[2].toLowerCase()]) return "";
  return `${m[3]}-${String(MONTHS[m[2].toLowerCase()]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
};

/** Distances named in free text, as {value, unit}. Marathon/half are exact; others as written. */
export function namedDistances(text) {
  const out = [];
  const t = text.toLowerCase();
  if (/\bhalf[ -]?marathon\b/.test(t)) out.push({ value: 21.0975, unit: "km" });
  if (/(?<!half[ -]?)\bmarathon\b/.test(t.replace(/half[ -]?marathon/g, ""))) out.push({ value: 42.195, unit: "km" });
  for (const m of t.matchAll(/\b(\d+(?:\.\d+)?)\s*(k|km|kilometres?|miles?|mile|mi)\b/g)) {
    const unit = /^(mi|mile)/.test(m[2]) ? "mi" : "km";
    out.push({ value: Number(m[1]), unit });
  }
  const seen = new Set();
  return out.filter((d) => { const k = `${d.value}${d.unit}`; if (seen.has(k)) return false; seen.add(k); return true; });
}
const km = (d) => d.value * (d.unit === "mi" ? 1.609344 : 1);

/** Parse the listing's distance cell: single distance, or a range [lo, hi]. */
export function parseListingDistance(cell) {
  const t = cell.toLowerCase().replace(/,/g, "");
  const unit = /mile/.test(t) ? "mi" : /(kilomet|\bk\b|km)/.test(t) ? "km" : "";
  const nums = [...t.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));
  if (!unit || !nums.length) return null;
  if (/half marathon/.test(t)) return { exact: [{ value: 21.0975, unit: "km" }] };
  if (/marathon/.test(t) && nums.length === 0) return { exact: [{ value: 42.195, unit: "km" }] };
  if (nums.length === 1) return { exact: [{ value: nums[0], unit }] };
  return { range: [Math.min(...nums), Math.max(...nums)], unit };
}

export function townFrom(location) {
  const parts = location.split(",").map((p) => p.trim()).filter((p) => p && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(p));
  if (!parts.length) return "";
  const last = parts[parts.length - 1];
  return isCountyish(last) && parts.length > 1 ? parts[parts.length - 2] : last;
}

export const adapters = {
  racebest: {
    sourceId: "racebest_upcoming",
    host: "racebest.com",
    listUrl: "https://racebest.com/races",
    async list(page) {
      return page.evaluate(() =>
        [...document.querySelectorAll("tr")]
          .map((tr) => ({ cells: [...tr.children].map((td) => td.innerText.trim().replace(/\s+/g, " ")), href: tr.querySelector("a")?.getAttribute("href") ?? "" }))
          .filter((r) => r.cells.length >= 5 && r.href),
      );
    },
    parseRow(r) {
      const [date, name, location, distance, type] = r.cells;
      return { date: toIso(date), name, location, distance, type, href: r.href };
    },
    async detail(page, url) {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      const text = await page.evaluate(() => document.body.innerText);
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const i = lines.findIndex((l) => /^(Mon|Tues?|Wednes|Thurs?|Fri|Satur|Sun)day \d/.test(l));
      // The headline sentence sits two lines after the title: date, title, location+price, headline.
      const headline = i >= 0 ? lines.slice(i + 3, i + 4).join(" ") : "";
      return { headline, date: i >= 0 ? toIso(lines[i]) : "" };
    },
  },
};

export function buildRows(listing, detail, source, today, url) {
  const cell = parseListingDistance(listing.distance);
  if (!cell) return { rows: [], skip: "distance not stated as a number" };
  let dists;
  if (cell.exact) dists = cell.exact;
  else {
    const named = namedDistances(detail?.headline ?? "").filter((d) => d.unit === cell.unit ? d.value >= cell.range[0] - 0.15 && d.value <= cell.range[1] + 0.15 : km(d) >= cell.range[0] * (cell.unit === "mi" ? 1.609344 : 1) - 0.25 && km(d) <= cell.range[1] * (cell.unit === "mi" ? 1.609344 : 1) + 0.25);
    if (named.length < 2) return { rows: [], skip: `range ${listing.distance} not itemised on the race page` };
    dists = named;
  }
  if (detail?.date && detail.date !== listing.date) return { rows: [], skip: `date differs between list (${listing.date}) and page (${detail.date})` };
  const rows = dists.map((d) => ({
    name: listing.name,
    country: "United Kingdom",
    city: townFrom(listing.location),
    region: "",
    date: listing.date,
    distance: String(d.value),
    unit: d.unit,
    surface: /trail/i.test(listing.type) ? "Trail" : /cross/i.test(listing.type) ? "Cross country" : /track/i.test(listing.type) ? "Track" : "Road",
    startTime: "",
    sourceUrl: url,
    entryUrl: "",
    sourceKind: "entry",
    evidence: `${source.host} race page gives ${listing.date} for ${listing.name}${listing.location ? `, at ${listing.location}` : ""}`,
    checkedAt: today,
    entryStatus: "TBC",
    notes: `Read with a headless browser from ${source.sourceId}; country assumed UK, the site check confirms it`,
  }));
  return { rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);
  const today = new Date().toISOString().slice(0, 10);
  const from = opt("from", today), to = opt("to", `${Number(today.slice(0, 4)) + 1}-12-31`);
  const out = opt("out", join("tmp", `render-${today}`));
  const maxDetail = Number(opt("max-detail", "150"));
  const source = adapters[opt("adapter", "racebest")];
  if (!source) throw new Error(`Unknown adapter. Choose one of: ${Object.keys(adapters).join(", ")}`);
  const { createRequire } = await import("node:module");
  let chromium;
  try {
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    throw new Error("Playwright is not installed (npm i -D playwright, then npx playwright install chromium).");
  }
  const proxy = process.env.HTTPS_PROXY;
  const browser = await chromium.launch({ proxy: proxy ? { server: proxy } : undefined });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: !!proxy, userAgent: USER_AGENT });
  const page = await ctx.newPage();
  const robotsRes = await fetch(`https://${source.host}/robots.txt`, { headers: { "user-agent": USER_AGENT } }).catch(() => null);
  const robots = parseRobots(robotsRes?.ok ? await robotsRes.text() : robotsRes && robotsRes.status < 500 ? "" : "User-agent: *\nDisallow: /");
  const delay = Math.max(1, robots.delay || 0) * 1000;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rows = [], skipped = [], notes = [];
  if (!robots.allows(new URL(source.listUrl).pathname)) notes.push(`${source.listUrl} disallowed by robots.txt - nothing read`);
  else {
    await page.goto(source.listUrl, { waitUntil: "networkidle", timeout: 45000 });
    const listing = (await source.list(page)).map((r) => source.parseRow(r)).filter((r) => r.date && r.date >= from && r.date <= to && !/virtual/i.test(`${r.type} ${r.location}`));
    let detailCount = 0;
    for (const l of listing) {
      const url = new URL(l.href, source.listUrl).href;
      if (!robots.allows(new URL(url).pathname)) { skipped.push({ name: l.name, date: l.date, reason: "disallowed by robots.txt", url }); continue; }
      let detail = null;
      if (parseListingDistance(l.distance)?.range && detailCount < maxDetail) {
        detailCount++; await sleep(delay);
        detail = await source.detail(page, url).catch(() => null);
      }
      const built = buildRows(l, detail, source, today, url);
      if (built.skip) skipped.push({ name: l.name, date: l.date, reason: built.skip, url }); else rows.push(...built.rows);
    }
    notes.push(`${listing.length} upcoming non-virtual races listed; ${detailCount} race pages opened`);
  }
  await browser.close();
  await mkdir(out, { recursive: true });
  await writeFile(join(out, "fixtures.csv"), toCsv(OUTPUT_HEADERS, rows));
  await writeFile(join(out, "skipped.csv"), toCsv(["name", "date", "reason", "url"], skipped));
  await writeFile(join(out, "report.md"), `# Rendered import ${today}\n\n${source.sourceId}: ${rows.length} rows, ${skipped.length} skipped.\n\n${notes.map((n) => `- ${n}`).join("\n")}\n\nUpload fixtures.csv to Import running fixtures. Nothing is published until you Keep and Publish.\n`);
  console.log(`${source.sourceId}: ${rows.length} rows, ${skipped.length} skipped. Files in ${out}`);
}
