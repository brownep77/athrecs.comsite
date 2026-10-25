import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { publicUrl, digest, writeJson } from "./start-time-fetch.mjs";

const dateKey = (value) => String(value ?? "").slice(0, 10);
const missing = (value) =>
  !String(value ?? "").trim() || /^(?:tbc|tbd)$/i.test(String(value).trim());
const relevant =
  /schedule|timetable|programme|program\b|race.?day|race.?info|instructions|athlete.?guide|runner.?guide|participant|faq|start.?time|event.?info|horair|zeitplan|ausschreibung|reglement|reglamento|horario|orari|partenza|大会要項|競技日程|スタート/i;
const excluded =
  /privacy|cookie|terms|login|sign.?in|cart|checkout|donat|results|résultats|resultados|ergebnis|photos|gallery|facebook|instagram|twitter|youtube/i;

export function makeQueue(rows, { from, to, limit = Infinity } = {}) {
  if (!Array.isArray(rows)) throw Error("Inventory must be a JSON array");
  const seen = new Set(),
    groups = new Map();
  for (const row of rows) {
    const date = dateKey(row.event_date);
    if (row.id === undefined || !row.name || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw Error("Inventory row needs id, name and event_date");
    if (seen.has(String(row.id))) throw Error(`Duplicate inventory edition ${row.id}`);
    seen.add(String(row.id));
    if (
      !missing(row.start_time) ||
      date < from ||
      date > to ||
      /^cancelled$/i.test(row.status ?? "")
    )
      continue;
    const days = Math.floor((Date.parse(date) - Date.parse(from)) / 86400000);
    const priority =
      days <= 2
        ? "within-48-hours"
        : days <= 7
          ? "within-7-days"
          : days <= 30
            ? "within-30-days"
            : "later";
    const key = `${row.event_id ?? row.slug ?? row.name}|${date}`;
    if (!groups.has(key))
      groups.set(key, {
        key,
        date,
        priority,
        name: row.name,
        sport: row.sport ?? "",
        country: row.country ?? "",
        editions: [],
        seeds: [],
      });
    const group = groups.get(key);
    group.editions.push({ ...row, event_date: date });
    for (const field of ["website", "source_url", "entry_url"]) {
      if (!row[field]) continue;
      try {
        const url = publicUrl(row[field]);
        if (!group.seeds.some((s) => s.url === url))
          group.seeds.push({ url, label: field, depth: 0, parentUrl: null });
      } catch {
        group.seeds.push({
          url: row[field],
          label: `${field}: invalid URL`,
          depth: 0,
          parentUrl: null,
        });
      }
    }
  }
  const all = [...groups.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
  );
  return {
    all,
    selected: all.slice(0, limit),
    totalEditions: all.reduce((n, g) => n + g.editions.length, 0),
  };
}

/** Clues for a reviewer, NEVER a verified edition-to-time assignment. */
export function findTimeClues(text) {
  const pattern =
    /\b(?:(?:[01]?\d|2[0-3])[:.h][0-5]\d\s*(?:a\.?m\.?|p\.?m\.?)?|(?:0?[1-9]|1[0-2])\s*(?:a\.?m\.?|p\.?m\.?))\b|(?:[01]?\d|2[0-3])時(?:[0-5]?\d分)?/gi;
  const clues = [];
  const seen = new Set();
  for (const match of text.matchAll(pattern)) {
    const before = text.slice(Math.max(0, match.index - 8), match.index);
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 35);
    // Decimal distances/prices and numeric dates are not clocks, even beside a start label.
    if (
      /[£€$]\s*$/.test(before) ||
      /^\s*(?:km|kilomet|mi\b|mile|metre|mètre|€|£|\$)/i.test(after) ||
      /\d[./]$/.test(before) ||
      /^[./]\d/.test(after)
    )
      continue;
    const start = Math.max(0, match.index - 180),
      end = Math.min(text.length, match.index + match[0].length + 220);
    const excerpt = text.slice(start, end).trim();
    if (
      !/start|race|wave|depart|départ|partenza|salida|uit|inicio|heat|gun|session|大会|スタート|競技|種目/i.test(
        excerpt,
      )
    )
      continue;
    let token = match[0].toLowerCase().replace(/\./g, ":").replace(/\s/g, "");
    const time = token.match(/^(\d{1,2})(?:[:h時](\d{1,2}))?/);
    if (!time) continue;
    let hour = Number(time[1]);
    const minute = Number(time[2] ?? 0);
    if (/p:?m/.test(token) && hour < 12) hour += 12;
    if (/a:?m/.test(token) && hour === 12) hour = 0;
    if (hour > 23) continue;
    const normalized = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const key = `${normalized}|${excerpt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    clues.push({
      time: normalized,
      printed: match[0],
      offset: match.index,
      excerpt,
      cautions: [
        ...(/registration|check.in|bib|packet|shuttle|bus|pickup|collection|inscription|clôture|barrière|cut.off|dossard/i.test(
          excerpt,
        )
          ? ["Nearby registration/travel information: distinguish from the start"]
          : []),
        ...(/provisional|subject to|tbc|tbd|approx/i.test(excerpt)
          ? ["Provisional wording nearby"]
          : []),
        ...(/wave|window|rolling|first|last/i.test(excerpt)
          ? ["Wave or window scope needs checking"]
          : []),
      ],
    });
    if (clues.length === 100) break;
  }
  return clues;
}

export function followupLinks(page, year) {
  return (page.links ?? [])
    .map((link) => {
      const label = `${link.text} ${link.url}`;
      if (excluded.test(label)) return null;
      const years = label.match(/\b20\d{2}\b/g) ?? [];
      if (years.length && !years.includes(year)) return null;
      let score = relevant.test(label) ? 10 : 0;
      if (/\.pdf(?:\?|$)/i.test(link.url)) score += 5;
      if (
        /entry|entries|register|registration|book|inscription|anmeldung|entrycentral|runbritain|runthrough|race-nation|raceroster|ultrasignup/i.test(
          label,
        )
      )
        score += 3;
      if (score === 0) return null;
      if (years.includes(year)) score += 5;
      try {
        return { ...link, url: publicUrl(link.url, page.finalUrl ?? page.url), score };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

async function scanGroup(group, reader, { maxPages, depth, discovery = [] }) {
  const pending = [
    ...group.seeds,
    ...discovery
      .filter((d) => d.groupKey === group.key)
      .map((d) => ({
        url: d.url,
        label: "additional discovered source",
        depth: 0,
        parentUrl: d.foundOn ?? null,
      })),
  ];
  const seen = new Set(),
    attempts = [],
    clues = [],
    deferred = [];
  while (pending.length && seen.size < maxPages) {
    const next = pending.shift();
    if (seen.has(next.url)) continue;
    seen.add(next.url);
    const page = await reader.read(next.url);
    const attempt = {
      url: next.url,
      finalUrl: page.finalUrl ?? next.url,
      parentUrl: next.parentUrl,
      label: next.label,
      checkedAt: page.checkedAt ?? null,
      reusedCapture: page.reusedCapture === true,
      imported: page.imported === true,
      captureOrigin: page.captureOrigin ?? null,
      captureDatePrecision: page.captureDatePrecision ?? "timestamp",
      status: page.status,
      error: page.error ?? null,
      unchecked: page.unchecked === true,
      textHash: page.textHash ?? null,
      title: page.title ?? "",
      depth: next.depth,
      characters: page.text?.length ?? 0,
    };
    attempts.push(attempt);
    if (page.status !== 200) continue;
    const year = group.date.slice(0, 4);
    for (const clue of findTimeClues(page.text ?? ""))
      clues.push({
        ...clue,
        url: next.url,
        textHash: page.textHash,
        sourceContainsEditionYear: (page.text ?? "").includes(year),
        sourceYears: [...new Set((page.text ?? "").match(/\b20\d{2}\b/g) ?? [])].sort(),
      });
    for (const link of followupLinks(page, year)) {
      if (seen.has(link.url) || pending.some((p) => p.url === link.url)) continue;
      if (next.depth >= depth)
        deferred.push({ url: link.url, parentUrl: next.url, reason: "Depth limit" });
      else
        pending.push({
          url: link.url,
          label: link.text,
          parentUrl: next.url,
          depth: next.depth + 1,
        });
    }
  }
  deferred.push(
    ...pending
      .filter((p) => !seen.has(p.url))
      .map((p) => ({ url: p.url, parentUrl: p.parentUrl, reason: "Page limit" })),
  );
  const uniqueDeferred = [
    ...new Map(deferred.filter((p) => !seen.has(p.url)).map((p) => [p.url, p])).values(),
  ];
  const opened = attempts.filter((a) => a.status === 200).length;
  // Absence from a bounded crawl is never evidence that the organiser has not published it.
  const state = clues.length
    ? "needs-review"
    : opened
      ? "unchecked"
      : attempts.some((a) => !a.unchecked)
        ? "inaccessible"
        : "unchecked";
  return {
    ...group,
    state,
    attempts,
    clues,
    deferred: uniqueDeferred,
    reason: clues.length
      ? "Time clues found; match event, year/date, distance, category, timezone and wave against the source before staging."
      : opened
        ? "No start identified in the inspected material. Further source/search or visual review required."
        : state === "inaccessible"
          ? "Sources could not be read; see individual attempts."
          : "No source check completed.",
    searchQueries: [
      `${group.name} ${group.date.slice(0, 4)} start time programme timetable`,
      `${group.name} ${group.date.slice(0, 4)} race instructions filetype:pdf`,
    ],
  };
}

export async function runStartTimeBatch(
  rows,
  {
    directory,
    reader,
    from,
    to,
    limit = Infinity,
    concurrency = 6,
    maxPages = 12,
    depth = 2,
    discovery = [],
    onProgress = () => {},
  },
) {
  await mkdir(join(directory, "groups"), { recursive: true, mode: 0o700 });
  const queue = makeQueue(rows, { from, to, limit });
  const records = new Map();
  let cursor = 0,
    completed = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.selected.length) }, async () => {
      while (cursor < queue.selected.length) {
        const group = queue.selected[cursor++];
        const result = await scanGroup(group, reader, { maxPages, depth, discovery });
        records.set(group.key, result);
        await writeJson(join(directory, "groups", `${digest(group.key)}.json`), result);
        onProgress({
          completed: ++completed,
          groups: queue.selected.length,
          editions: queue.totalEditions,
          clues: result.clues.length,
          name: group.name,
        });
      }
    }),
  );
  const groups = queue.all.map(
    (g) =>
      records.get(g.key) ?? {
        ...g,
        state: "unchecked",
        reason: "Outside this invocation’s event limit",
        attempts: [],
        clues: [],
        deferred: [],
        searchQueries: [],
      },
  );
  const count = (predicate) => groups.filter(predicate).reduce((n, g) => n + g.editions.length, 0);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scope: { from, to },
    summary: {
      editions: queue.totalEditions,
      eventDates: groups.length,
      scannedEventDates: records.size,
      editionsWithClues: count((g) => g.clues.length > 0),
      inaccessibleEditions: count((g) => g.state === "inaccessible"),
      uncheckedEditions: count((g) => g.state === "unchecked"),
      deferredLinks: groups.reduce((n, g) => n + g.deferred.length, 0),
      remainingUnverifiedEditions: queue.totalEditions,
      published: 0,
      ...reader.stats,
    },
    groups,
  };
  await writeJson(join(directory, "report.json"), report);
  return report;
}

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const link = (value) => {
  try {
    return `<a href="${esc(publicUrl(value))}" target="_blank" rel="noreferrer">${esc(value)}</a>`;
  } catch {
    return esc(value);
  }
};
export function reviewHtml(report) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AthRecs start-time batch review</title><style>
  body{font:16px/1.5 system-ui;margin:2rem auto;max-width:1100px;padding:0 1rem;color:#18232c;background:#f6f8fa}h1{font-size:1.7rem}article{background:white;border:1px solid #ccd5df;border-radius:10px;padding:1rem;margin:1rem 0}summary{cursor:pointer}input,select{padding:.65rem;border:1px solid #aebac6;border-radius:6px;max-width:90%}input{width:25rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:.75rem}a{color:#0755a6;overflow-wrap:anywhere}.tag{background:#e6edf4;padding:.15rem .4rem;border-radius:4px}small{color:#455565}li{margin:.5rem 0}.hidden{display:none}</style>
  <h1>Start-time research queue</h1><p>${report.summary.editions} missing edition starts across ${report.summary.eventDates} event dates (${esc(report.scope.from)}–${esc(report.scope.to)}). ${report.summary.editionsWithClues} editions have source time clues; <strong>all ${report.summary.remainingUnverifiedEditions} still require verification</strong>. No catalogue changes.</p>
  <p>Clues can include another distance, an earlier year, registration or a later wave. Open the linked source and confirm the exact edition before staging. Reused captures retain their original check date. “Unchecked” includes bounded or unsuccessful follow-up, never “not yet published”.</p>
  <label>Find <input id="search" type="search" placeholder="Event, sport, country or distance"></label> <label>State <select id="state"><option value="">All</option><option>needs-review</option><option>unchecked</option><option>inaccessible</option></select></label> <label>Priority <select id="priority"><option value="">All</option><option>within-48-hours</option><option>within-7-days</option><option>within-30-days</option><option>later</option></select></label><p id="visible"></p>
  ${report.groups
    .map(
      (
        g,
      ) => `<article data-state="${esc(g.state)}" data-priority="${esc(g.priority)}" data-search="${esc([g.name, g.sport, g.country, g.editions.map((e) => e.distance_code).join(" ")].join(" ").toLowerCase())}"><h2>${esc(g.name)}</h2><p>${esc(g.date)} · ${esc(g.sport)} · ${esc(g.country)} · <span class="tag">${esc(g.state)}</span> · ${esc(g.priority)}</p><p>Missing: ${g.editions.map((e) => `${esc(e.distance_code === "Other" ? "Distance not yet confirmed" : e.distance_code)} (edition ${esc(e.id)})`).join(", ")}</p><p>${esc(g.reason)}</p>
  <details><summary>${g.clues.length} source time clues</summary>${g.clues.map((c) => `<p><strong>${esc(c.time)}</strong> · ${link(c.url)}<br><small>${c.sourceContainsEditionYear ? "Edition year appears somewhere on page; date/distance still unverified" : "Edition year NOT found in page"} · ${esc(c.cautions.join("; "))}</small></p><pre>${esc(c.excerpt)}</pre>`).join("")}</details>
  <details><summary>${g.attempts.length} source attempts · ${g.deferred.length} deferred links</summary><ul>${g.attempts.map((a) => `<li>${link(a.url)}<br><small>${esc(a.error ?? "Opened")} · ${esc(a.checkedAt ?? "Not checked")}${a.reusedCapture ? " · retained capture" : ""}${a.imported ? " · imported" : ""}</small></li>`).join("")}${g.deferred.map((d) => `<li>${link(d.url)} · ${esc(d.reason)}</li>`).join("")}</ul></details>
  <details><summary>Further searches</summary><ul>${g.searchQueries.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></details></article>`,
    )
    .join("")}
  <script>const fields=['search','state','priority'].map(id=>document.getElementById(id));function filter(){let n=0;document.querySelectorAll('article').forEach(el=>{const show=el.dataset.search.includes(fields[0].value.toLowerCase())&&(!fields[1].value||el.dataset.state===fields[1].value)&&(!fields[2].value||el.dataset.priority===fields[2].value);el.hidden=!show;if(show)n++});document.getElementById('visible').textContent=n+' event dates shown'}fields.forEach(el=>el.addEventListener('input',filter));filter()</script></html>`;
}

/** Explicit reviewer handoff. Still no write path: existing staged publication performs live guards. */
export async function prepareReviewedStarts(report, decisions, { cacheDirectory, currentRows }) {
  const current = new Map(currentRows.map((row) => [String(row.id), row]));
  const seen = new Set();
  const updates = [];
  for (const decision of decisions) {
    const id = String(decision.id);
    if (seen.has(id)) throw Error(`Duplicate decision ${id}`);
    seen.add(id);
    const group = report.groups.find((g) => g.editions.some((e) => String(e.id) === id));
    const before = group?.editions.find((e) => String(e.id) === id),
      live = current.get(id);
    if (!before || !live || !missing(live.start_time))
      throw Error(`Edition missing or already has a start: ${id}`);
    for (const field of ["event_id", "name", "slug", "distance_code", "start_time", "notes"])
      if (before[field] !== live[field])
        throw Error(`Edition ${id} changed since research: ${field}`);
    if (dateKey(live.event_date) !== before.event_date) throw Error(`Edition ${id} date changed`);
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(decision.time) ||
      !decision.reviewer?.trim() ||
      !decision.explanation?.trim() ||
      !decision.scope?.trim() ||
      !["organiser", "authorised-entry", "governing-body"].includes(decision.authority) ||
      decision.editionMatched !== true ||
      decision.conflictsResolved !== true
    )
      throw Error(`Edition ${id} needs explicit source, edition, scope and conflict review`);
    try {
      new Intl.DateTimeFormat("en", { timeZone: decision.timezone }).format();
      if (!decision.timezone) throw Error();
    } catch {
      throw Error(`Edition ${id} needs a valid IANA timezone`);
    }
    const url = publicUrl(decision.sourceUrl);
    const attempt = group.attempts.find(
      (a) => a.url === url && a.status === 200 && a.textHash === decision.textHash,
    );
    if (!attempt) throw Error(`Source capture not inspected in this report for ${id}`);
    const source = JSON.parse(await readFile(join(cacheDirectory, `${digest(url)}.json`), "utf8"));
    if (
      digest(source.text) !== decision.textHash ||
      !decision.evidenceExcerpt?.trim() ||
      !source.text.includes(decision.evidenceExcerpt) ||
      !findTimeClues(source.text).some((c) => c.time === decision.time)
    )
      throw Error(`Source evidence changed or time absent for ${id}`);
    if (decision.authority === "authorised-entry" && !decision.authorisationEvidence?.trim())
      throw Error(`Record organiser authorisation of the entry programme for ${id}`);
    updates.push({
      id: before.id,
      before,
      patch: {
        start_time: decision.time,
        notes: [
          before.notes,
          `Start checked from ${url} (source captured ${attempt.checkedAt}); ${decision.explanation} Local timezone: ${decision.timezone}. Scope: ${decision.scope}.`,
        ]
          .filter(Boolean)
          .join("\n"),
      },
      review: {
        ...decision,
        reviewedAt: new Date().toISOString(),
        sourceCheckedAt: attempt.checkedAt,
      },
      publicationState: "reviewed-awaiting-live-staging-validation",
    });
  }
  return { schemaVersion: 1, published: false, updates };
}
