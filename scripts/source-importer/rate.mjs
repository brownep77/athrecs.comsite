// Rates fixture sources by checking what they say against the live athrecs.com race pages.
// Usage: node scripts/source-importer/rate.mjs fixtures.csv [--out dir] [--history docs/source-registry/source-ratings.csv]
// Needs network access to athrecs.com. Run with NODE_USE_ENV_PROXY=1 in sandboxes that use a proxy. Publishes nothing.
import { mkdir, readFile, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { parseCsv, toCsv } from "./lib.mjs";

const SITE = "https://www.athrecs.com";
const norm = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const STOP = new Set("the and run race road series festival of in at for 2025 2026 2027 2028 k km mi mile miles".split(" "));
const toks = (s) => new Set(norm(s).split(" ").filter((t) => t.length > 1 && !STOP.has(t)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const distLabel = (r) => {
  const d = Number(r.distance), km = d * (r.unit === "mi" ? 1.609344 : 1);
  if (Math.abs(km - 42.195) < 0.3) return "marathon";
  if (Math.abs(km - 21.0975) < 0.3) return "half";
  return r.unit === "mi" ? `${+d.toFixed(2)}mi` : `${+km.toFixed(2)}k`;
};

export async function loadSlugs(fetchImpl = fetch) {
  const out = [];
  for (let i = 1; i <= 12; i++) {
    const res = await fetchImpl(`${SITE}/sitemaps/races-${i}.xml`).catch(() => null);
    if (!res || !res.ok) break;
    const xml = await res.text();
    for (const m of xml.matchAll(/<loc>[^<]*\/races\/([^<]+)<\/loc>/g)) out.push(m[1]);
  }
  return out;
}

/** Parse what a live race page says: dates, distances and a text blob for town checks. */
export function parsePage(html) {
  const body = html.replace(/<script.*?<\/script>|<style.*?<\/style>/gs, "");
  const text = body.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  const dates = new Set(text.match(/\b20\d\d-\d\d-\d\d\b/g) ?? []);
  const distances = new Set();
  for (const m of text.matchAll(/· (Marathon|Half|\d+(?:\.\d+)?\s?(?:K|mi|km)) · ([\d.]+) km/g)) {
    const w = m[1].toLowerCase().replace(/\s/g, "");
    distances.add(w === "marathon" || w === "half" ? w : w.endsWith("mi") ? w : `${+parseFloat(w).toFixed(2)}k`);
  }
  return { dates, distances, text: norm(text) };
}

export function candidates(name, slugs, limit = 12, city = "") {
  const want = toks(name);
  if (!want.size) return [];
  // Slugs sometimes abbreviate the name ("nyd" for New Year's Day), so also take pages that carry the town and share a name word.
  const town = norm(city).split(" ").find((t) => t.length >= 4);
  const byTown = town
    ? slugs.filter((s) => {
        const have = toks(s.replace(/-/g, " "));
        return have.has(town) && [...want].some((t) => t !== town && have.has(t) === true);
      })
    : [];
  const byName = slugs
    .map((s) => {
      const have = toks(s.replace(/-/g, " "));
      const hit = [...want].filter((t) => have.has(t)).length;
      return { s, score: hit / Math.max(want.size, 1) - 0.01 * Math.max(0, have.size - want.size) };
    })
    .filter((x) => x.score >= 0.6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
  const seen = new Set(byName);
  return [...byName, ...byTown.filter((s) => !seen.has(s)).slice(0, 6)];
}

/** Verdict for one fixture group (same name+date, several distances). */
export function judge(group, pages) {
  const { date, city } = group;
  const wantD = group.distances;
  const dateHits = pages.filter((p) => p.page.dates.has(date));
  if (dateHits.length) {
    const best = dateHits.sort((a, b) => [...b.page.distances].length - [...a.page.distances].length)[0];
    const missing = wantD.filter((d) => !best.page.distances.has(d));
    if (!best.page.distances.size) return { verdict: "unverified", page: best.slug, detail: "date agrees; page shows no distance list to compare" };
    const townOk = !city || best.page.text.includes(norm(city));
    if (missing.length) return { verdict: "distance-missing", page: best.slug, detail: `page lacks ${missing.join(", ")}` };
    return townOk
      ? { verdict: "confirmed", page: best.slug, detail: "date, distances and town agree" }
      : { verdict: "town-differs", page: best.slug, detail: `date agrees but ${city} not on the page` };
  }
  if (pages.length) {
    const near = pages.find((p) => [...p.page.dates].some((d) => Math.abs(Date.parse(d) - Date.parse(date)) <= 14 * 864e5));
    if (near) return { verdict: "date-conflict", page: near.slug, detail: `site has ${[...near.page.dates].filter((d) => Math.abs(Date.parse(d) - Date.parse(date)) <= 14 * 864e5).join(", ")}, source says ${date}` };
    return { verdict: "other-edition", page: pages[0].slug, detail: "same-named event on site, but not on this date" };
  }
  return { verdict: "not-on-site", page: "", detail: "no matching page found" };
}

export function groupRows(rows) {
  const g = new Map();
  for (const r of rows) {
    const host = (() => { try { return new URL(r.sourceUrl).hostname.replace(/^www\./, ""); } catch { return "unknown"; } })();
    const k = `${norm(r.name)}|${r.date}`;
    if (!g.has(k)) g.set(k, { name: r.name, date: r.date, city: r.city, host, sourceUrl: r.sourceUrl, distances: [] });
    g.get(k).distances.push(distLabel(r));
  }
  return [...g.values()];
}

/** Score per source: confirmed fixtures count for it, conflicts count against it, not-on-site is neutral. */
export function rateSources(results) {
  const by = {};
  for (const r of results) {
    const s = (by[r.host] ??= { host: r.host, fixtures: 0, confirmed: 0, conflicts: 0, distanceMissing: 0, townDiffers: 0, notOnSite: 0, otherEdition: 0, unverified: 0 });
    s.fixtures++;
    if (r.verdict === "confirmed") s.confirmed++;
    else if (r.verdict === "date-conflict") s.conflicts++;
    else if (r.verdict === "distance-missing") s.distanceMissing++;
    else if (r.verdict === "town-differs") s.townDiffers++;
    else if (r.verdict === "other-edition") s.otherEdition++;
    else if (r.verdict === "unverified") s.unverified++;
    else s.notOnSite++;
  }
  return Object.values(by).map((s) => {
    const judged = s.confirmed + s.conflicts + s.distanceMissing + s.townDiffers + s.unverified * 0;
    const accuracy = judged ? Math.round((100 * (s.confirmed + 0.5 * s.distanceMissing + 0.5 * s.townDiffers)) / judged) : null;
    const coverage = Math.round((100 * judged) / s.fixtures);
    const rating = accuracy === null ? "Unrated (nothing to compare)" : judged < 5 ? `${accuracy >= 90 ? "Medium" : "Low"} (only ${judged} compared)` : accuracy >= 95 && s.conflicts === 0 ? "High" : accuracy >= 80 ? "Medium" : "Low";
    return { ...s, compared: judged, accuracy: accuracy ?? "", coverage, rating };
  }).sort((a, b) => b.fixtures - a.fixtures);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--") && !["--out", "--history"].includes(args[args.indexOf(a) - 1]));
  const opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d);
  const out = opt("out", "tmp/source-ratings");
  await mkdir(out, { recursive: true });
  const rows = parseCsv(await readFile(file, "utf8"));
  const slugs = await loadSlugs();
  if (!slugs.length) throw new Error("Could not read the live race sitemaps - is athrecs.com reachable?");
  const cache = new Map();
  const page = async (s) => {
    if (!cache.has(s)) {
      await sleep(250);
      const res = await fetch(`${SITE}/races/${s}`, { headers: { "user-agent": "AthRecsSourceRater/1.0" } }).catch(() => null);
      cache.set(s, res?.ok ? parsePage(await res.text()) : null);
    }
    return cache.get(s);
  };
  const groups = groupRows(rows);
  const results = [];
  for (const g of groups) {
    const cands = candidates(g.name, slugs, 12, g.city);
    const pages = [];
    for (const s of cands) { const p = await page(s); if (p) pages.push({ slug: s, page: p }); }
    results.push({ ...g, distances: [...new Set(g.distances)], ...judge({ ...g, distances: [...new Set(g.distances)] }, pages) });
  }
  const ratings = rateSources(results);
  const today = new Date().toISOString().slice(0, 10);
  await writeFile(join(out, "fixture-checks.csv"), toCsv(["name", "date", "city", "host", "distances", "verdict", "page", "detail", "sourceUrl"], results.map((r) => ({ ...r, distances: r.distances.join("|") }))));
  await writeFile(join(out, "source-ratings.csv"), toCsv(["host", "fixtures", "compared", "confirmed", "conflicts", "distanceMissing", "townDiffers", "otherEdition", "notOnSite", "unverified", "accuracy", "coverage", "rating"], ratings));
  const hist = opt("history", "");
  if (hist) {
    let exists = true; try { await readFile(hist, "utf8"); } catch { exists = false; }
    const cols = ["date", "host", "fixtures", "compared", "confirmed", "conflicts", "distanceMissing", "townDiffers", "accuracy", "rating"];
    const body = toCsv(cols, ratings.map((r) => ({ ...r, date: today })));
    await (exists ? appendFile(hist, body.split("\n").slice(1).join("\n")) : writeFile(hist, body));
  }
  console.log(`${groups.length} fixtures from ${rows.length} rows`);
  const v = {}; for (const r of results) v[r.verdict] = (v[r.verdict] ?? 0) + 1;
  console.log(v);
  for (const r of ratings) console.log(`${r.host}: ${r.fixtures} fixtures, ${r.compared} compared, accuracy ${r.accuracy}% -> ${r.rating}`);
  console.log(`Written to ${out}`);
}
