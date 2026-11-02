// Parallel race importer: reads the source registry, visits only ENABLED sources, and writes a CSV in the
// existing fixture importer's format. It never publishes anything: the CSV is uploaded to Import running
// fixtures, which runs the duplicate check and the normal review/Keep/Publish steps.
//
// Rules this tool enforces (see docs/source-registry/README.md):
//  - enabled = 1 sources only; a disabled row is never fetched.
//  - event-level metadata only: no result, athlete, runner, participant or entrant pages are opened.
//  - robots.txt is honoured (disallow, crawl-delay); the registry's rate limit and page budget apply.
//  - only registry allowed_domains are followed.

export const USER_AGENT = "AthRecsSourceBot/1.0 (+https://athrecs.com; event listings only)";
export const OUTPUT_HEADERS = [
  "name",
  "country",
  "city",
  "region",
  "date",
  "distance",
  "unit",
  "surface",
  "startTime",
  "sourceUrl",
  "entryUrl",
  "sourceKind",
  "evidence",
  "checkedAt",
  "entryStatus",
  "notes",
];
const PEOPLE_PATH = /\/(results?|raceresults?|athletes?|runners?|participants?|entrants?|startlist|start-list|profile|user)s?(\/|$|\?)/i;
const DISCOVERY_HOST = /(^|\.)(runabc|findarace|racecalendar|runningcalendar)\./i;

export function parseCsv(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [head, ...body] = rows.filter((r) => r.some((v) => v !== ""));
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}
export function toCsv(headers, rows) {
  const esc = (v) => (/[",\n\r]/.test(String(v ?? "")) ? `"${String(v).replace(/"/g, '""')}"` : (v ?? ""));
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n") + "\n";
}

export function enabledSources(registry, only = []) {
  const wanted = new Set(only);
  const rows = registry.filter((r) => r.enabled === "1");
  for (const id of wanted)
    if (!rows.some((r) => r.source_id === id)) {
      const known = registry.find((r) => r.source_id === id);
      throw new Error(
        known
          ? `Source ${id} is disabled in the registry. A disabled row is never permission to crawl.`
          : `Source ${id} is not in the registry.`,
      );
    }
  // Result and archive sources hold participant rows: they are never part of the fixture importer.
  const fixtureOnly = (r) => !/result|archive|finished/i.test(`${r.source_id} ${r.profile ?? ""}`);
  return rows.filter((r) => (wanted.size ? wanted.has(r.source_id) : fixtureOnly(r)));
}

/** Longest-match robots.txt rules for our agent token, falling back to "*". */
export function parseRobots(text) {
  const groups = [];
  let current = null,
    lastWasAgent = false;
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase(),
      value = m[2].trim();
    if (key === "user-agent") {
      if (!lastWasAgent) {
        current = { agents: [], rules: [], delay: 0 };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (current) {
      lastWasAgent = false;
      if (key === "allow" || key === "disallow") current.rules.push({ allow: key === "allow", path: value });
      else if (key === "crawl-delay") current.delay = Number(value) || 0;
    }
  }
  const mine = groups.find((g) => g.agents.some((a) => a !== "*" && "athrecssourcebot".includes(a)));
  const group = mine ?? groups.find((g) => g.agents.includes("*")) ?? { rules: [], delay: 0 };
  const test = (rule, path) => {
    if (!rule.path) return -1;
    const rx = new RegExp(
      "^" + rule.path.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"),
    );
    return rx.test(path) ? rule.path.length : -1;
  };
  return {
    delay: group.delay,
    allows(path) {
      let best = { len: -1, allow: true };
      for (const rule of group.rules) {
        const len = test(rule, path);
        if (len > best.len || (len === best.len && rule.allow)) if (len >= 0) best = { len, allow: rule.allow };
      }
      return best.allow;
    },
  };
}

export function extractLinks(html, baseUrl, source) {
  const domains = new Set(String(source.allowed_domains).split("|").filter(Boolean));
  const include = source.race_link_include_regex ? new RegExp(source.race_link_include_regex) : null;
  const exclude = source.race_link_exclude_regex ? new RegExp(source.race_link_exclude_regex) : null;
  const out = new Set();
  for (const m of html.matchAll(/<a\s[^>]*href\s*=\s*["']([^"'#]+)["']/gi)) {
    let url;
    try {
      url = new URL(m[1].replace(/&amp;/g, "&"), baseUrl);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol) || !domains.has(url.hostname.toLowerCase())) continue;
    if (DISCOVERY_HOST.test(url.hostname) || PEOPLE_PATH.test(url.pathname)) continue;
    if (include && !include.test(url.pathname + url.search)) continue;
    if (exclude && exclude.test(url.pathname + url.search)) continue;
    out.add(url.href);
  }
  return [...out];
}

const EVENT_TYPES = new Set(["Event", "SportsEvent", "SportsCompetition", "RaceEvent", "Race"]);
function walk(node, out) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, out));
  if (!node || typeof node !== "object") return;
  const types = [].concat(node["@type"] ?? []);
  if (types.some((t) => EVENT_TYPES.has(t))) out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === "object") walk(v, out);
}
/** schema.org Event entries from JSON-LD blocks. Nothing else on the page is read. */
export function extractEvents(html) {
  const found = [];
  for (const m of html.matchAll(/<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1].trim()), found);
    } catch {
      /* malformed block: ignore */
    }
  }
  return found.map((e) => {
    const loc = [].concat(e.location ?? [])[0] ?? {};
    const addr = typeof loc.address === "object" ? (loc.address ?? {}) : {};
    const offers = [].concat(e.offers ?? []).map((o) => o?.name).filter(Boolean);
    const subs = [].concat(e.subEvent ?? []).map((s) => s?.name).filter(Boolean);
    return {
      name: String(e.name ?? "").trim(),
      startDate: String(e.startDate ?? ""),
      city: String(addr.addressLocality ?? (typeof loc.address === "string" ? "" : loc.name) ?? "").trim(),
      region: String(addr.addressRegion ?? "").trim(),
      country: String((typeof addr.addressCountry === "object" ? addr.addressCountry?.name : addr.addressCountry) ?? "").trim(),
      text: [e.name, e.description, ...offers, ...subs].filter(Boolean).join(" \n "),
      availability: JSON.stringify(e.offers ?? ""),
      url: String(e.url ?? ""),
    };
  });
}

/** Distances stated in text. Named races (half marathon, marathon) are added only if no numeric distance matches them. */
export function distancesFrom(text) {
  const out = new Map();
  const km = (d, u) => d * (u === "mi" ? 1.609344 : 1);
  const add = (d, u) => {
    if (d >= 1 && d <= 500) out.set(`${d}${u}`, { distance: d, unit: u });
  };
  const named = (d) => [...out.values()].some((x) => Math.abs(km(x.distance, x.unit) - d) < 0.3);
  const t = String(text).replace(/\bhalf[\s-]?marathon\b/gi, " HALFMARATHON ");
  for (const m of t.matchAll(/(?<![\w.])(\d{1,3}(?:\.\d{1,4})?)\s?(km|k|miles?|mi)\b/gi))
    add(Number(m[1]), /^mi/i.test(m[2]) ? "mi" : "km");
  if (/HALFMARATHON/.test(t) && !named(21.0975)) add(21.0975, "km");
  if (/\bmarathon\b/i.test(t.replace(/HALFMARATHON/g, "")) && !named(42.195)) add(42.195, "km");
  return [...out.values()];
}

const kindFor = (s) =>
  /governing/i.test(s.timing_scope) || /governing/i.test(s.source_type)
    ? "governing-body"
    : /organiser/i.test(s.timing_scope)
      ? "organiser"
      : /timing/i.test(s.timing_scope)
        ? "timing-provider"
        : "entry";
function countryName(raw, fallback) {
  const v = raw.trim();
  if (/^uk$/i.test(v)) return "United Kingdom";
  if (/^[A-Za-z]{2}$/.test(v)) {
    try {
      return new Intl.DisplayNames("en", { type: "region" }).of(v.toUpperCase()) ?? "";
    } catch {
      return "";
    }
  }
  return v || fallback;
}
export function toRows(source, pageUrl, events, { today, from, to }) {
  const rows = [],
    skipped = [];
  const fallback = !/[|;]/.test(source.country_focus) ? source.country_focus.trim() : "";
  for (const e of events) {
    const date = /^\d{4}-\d{2}-\d{2}/.test(e.startDate) ? e.startDate.slice(0, 10) : "";
    const why = !e.name
      ? "no event name"
      : !date
        ? "no start date"
        : date < today || date < from || date > to
          ? "outside date window"
          : null;
    const dist = why ? [] : distancesFrom(e.text);
    const country = countryName(e.country, fallback);
    const reason = why ?? (!dist.length ? "no distance stated on the page" : !e.city ? "no town or city" : !country ? "no country" : null);
    if (reason) {
      skipped.push({ source: source.source_id, url: pageUrl, name: e.name, date, reason });
      continue;
    }
    const time = /T(\d{2}:\d{2})/.exec(e.startDate)?.[1];
    for (const d of dist)
      rows.push({
        name: e.name,
        country,
        city: e.city,
        region: e.region,
        date,
        distance: d.distance,
        unit: d.unit,
        surface: "",
        startTime: time && time !== "00:00" && dist.length === 1 ? time : "",
        sourceUrl: pageUrl,
        entryUrl: "",
        sourceKind: kindFor(source),
        evidence: `Event data on ${new URL(pageUrl).hostname} gives "${e.name}" on ${date} with a ${d.distance}${d.unit} distance in ${e.city}`,
        checkedAt: today,
        entryStatus: /SoldOut|OutOfStock|Discontinued/i.test(e.availability) ? "Closed" : /InStock|PreOrder|LimitedAvailability/i.test(e.availability) ? "Open" : "TBC",
        notes: `Collected by the parallel source importer from ${source.source_id}; held for source review`,
      });
  }
  return { rows, skipped };
}

/** Per-host politeness: one request at a time per host, spaced by the larger of registry and robots delays. */
export function createHostGate(sleep = (ms) => new Promise((r) => setTimeout(r, ms))) {
  const tails = new Map(),
    last = new Map();
  return (host, delaySeconds, task) => {
    const run = (tails.get(host) ?? Promise.resolve()).then(async () => {
      const wait = (last.get(host) ?? 0) + delaySeconds * 1000 - Date.now();
      if (wait > 0) await sleep(wait);
      try {
        return await task();
      } finally {
        last.set(host, Date.now());
      }
    });
    tails.set(host, run.catch(() => {}));
    return run;
  };
}

export async function runSource(source, ctx) {
  const { fetchImpl, gate, robotsFor, options } = ctx;
  const log = [],
    rows = [],
    skipped = [];
  const budget = Math.min(Number(source.max_pages) || 1, options.maxPages ?? 100);
  const seeds = [source.start_url],
    seen = new Set(seeds),
    events = [];
  const baseDelay = Number(source.rate_limit_seconds) || 1;
  async function get(url) {
    const u = new URL(url);
    if (!new Set(source.allowed_domains.split("|")).has(u.hostname.toLowerCase())) {
      log.push(`skip ${url}: domain not allowed for ${source.source_id}`);
      return null;
    }
    if (PEOPLE_PATH.test(u.pathname)) {
      log.push(`skip ${url}: result or participant path`);
      return null;
    }
    const robots = await robotsFor(u.origin);
    if (!robots.allows(u.pathname + u.search)) {
      log.push(`skip ${url}: disallowed by robots.txt`);
      return null;
    }
    return gate(u.hostname, Math.max(baseDelay, robots.delay), async () => {
      try {
        const res = await fetchImpl(url, {
          headers: { "user-agent": USER_AGENT, accept: "text/html" },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok || !/html/i.test(res.headers.get("content-type") ?? "")) {
          log.push(`skip ${url}: HTTP ${res.status}`);
          return null;
        }
        const body = await res.text();
        return body.length > 2_000_000 ? null : body;
      } catch (error) {
        log.push(`skip ${url}: ${error.message}`);
        return null;
      }
    });
  }
  let pages = 0;
  const listing = await get(source.start_url);
  pages++;
  if (!listing) return { rows, skipped, log, pages };
  const direct = extractEvents(listing);
  if (direct.length) events.push({ url: source.start_url, events: direct });
  const links = extractLinks(listing, source.start_url, source)
    .filter((l) => !seen.has(l))
    .slice(0, Math.max(0, Math.min(budget * 25, options.maxEvents ?? 200)));
  for (const link of links) {
    seen.add(link);
    const html = await get(link);
    pages++;
    if (!html) continue;
    const found = extractEvents(html);
    if (found.length) events.push({ url: link, events: found });
    else skipped.push({ source: source.source_id, url: link, name: "", date: "", reason: "no event data on the page" });
  }
  for (const page of events) {
    const out = toRows(source, page.url, page.events, options);
    rows.push(...out.rows);
    skipped.push(...out.skipped);
  }
  return { rows, skipped, log, pages };
}

export async function runAll(sources, { fetchImpl = fetch, options, concurrency = 4, sleep }) {
  const gate = createHostGate(sleep);
  const robotsCache = new Map();
  const robotsFor = (origin) => {
    if (!robotsCache.has(origin))
      robotsCache.set(
        origin,
        (async () => {
          try {
            const res = await fetchImpl(`${origin}/robots.txt`, {
              headers: { "user-agent": USER_AGENT },
              signal: AbortSignal.timeout(15000),
            });
            if (res.status >= 400 && res.status < 500) return parseRobots("");
            if (!res.ok) return parseRobots("User-agent: *\nDisallow: /");
            return parseRobots(await res.text());
          } catch {
            return parseRobots("User-agent: *\nDisallow: /");
          }
        })(),
      );
    return robotsCache.get(origin);
  };
  const results = new Array(sources.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, sources.length) }, async () => {
      while (next < sources.length) {
        const i = next++;
        results[i] = {
          source: sources[i].source_id,
          ...(await runSource(sources[i], { fetchImpl, gate, robotsFor, options })),
        };
      }
    }),
  );
  const seen = new Set(),
    rows = [];
  for (const r of results)
    for (const row of r.rows) {
      const key = [row.name, row.date, row.distance, row.unit, row.sourceUrl].join("|").toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(row);
      }
    }
  return { results, rows };
}
