// Fixture quality checks, run before upload. Pure functions: rows in, flags out.
// error = will be rejected or is almost certainly wrong; warn = look before publishing; info = worth knowing.
import { parseCsv } from "./lib.mjs";

const KM = (r) => Number(r.distance) * (r.unit === "mi" ? 1.609344 : 1);
const STANDARD = [
  [5, "5k"],
  [10, "10k"],
  [21.0975, "half"],
  [42.195, "marathon"],
  [16.0934, "10 mile"],
  [8.04672, "5 mile"],
];
const COUNTIES = new Set(
  "bedfordshire berkshire buckinghamshire cambridgeshire cheshire cornwall cumbria derbyshire devon dorset durham essex gloucestershire hampshire herefordshire hertfordshire kent lancashire leicestershire lincolnshire norfolk northamptonshire northumberland nottinghamshire oxfordshire rutland shropshire somerset staffordshire suffolk surrey sussex warwickshire wiltshire worcestershire yorkshire antrim armagh down fermanagh londonderry tyrone clare cork donegal galway kerry kildare kilkenny laois limerick mayo meath wicklow".split(
    " ",
  ),
);
const DISCOVERY = /runabc|findarace|racecalendar|runningintheusa|raceplace/i;
const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const tokens = (s) => new Set(norm(s).split(" ").filter((t) => t.length > 2));
const jaccard = (a, b) => {
  const A = tokens(a),
    B = tokens(b);
  const i = [...A].filter((t) => B.has(t)).length;
  return A.size + B.size ? i / (A.size + B.size - i) : 0;
};
const realDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;

/** @returns {{row:number,name:string,date:string,severity:'error'|'warn'|'info',check:string,detail:string}[]} */
export function checkRows(rows, { today, allowedDomains = {}, windowEnd } = {}) {
  const flags = [];
  const add = (i, severity, check, detail) =>
    flags.push({ row: i + 2, name: rows[i].name, date: rows[i].date, severity, check, detail });
  const horizon = windowEnd ?? `${Number(today.slice(0, 4)) + 2}-12-31`;

  rows.forEach((r, i) => {
    // Date
    if (!realDate(r.date)) return add(i, "error", "date", `"${r.date}" is not a real YYYY-MM-DD date`);
    if (r.date < today) add(i, "error", "date", "date is in the past");
    else if (r.date > horizon) add(i, "warn", "date", `date is beyond ${horizon}`);
    const day = new Date(`${r.date}T00:00:00Z`).getUTCDay();
    if (r.date.slice(5) === "12-25" || r.date.slice(5) === "01-01") add(i, "info", "date", "falls on a bank holiday - confirm it is intended");
    const md = r.date.slice(5);
    const holidayish = md >= "12-24" || md <= "01-02" || (day === 1 && ["05", "08"].includes(md.slice(0, 2))) || /good friday|easter|bank holiday|christmas|boxing|new year/i.test(r.name);
    if (![0, 6].includes(day) && !holidayish && !/\b(night|evening|twilight|summer series|weekday|twilights?)\b/i.test(r.name) && r.startTime && r.startTime < "17:00")
      add(i, "warn", "date", `weekday (${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}) with a daytime start - check the date`);
    const y = r.name.match(/\b(20\d\d)\b/);
    if (y && !r.date.startsWith(y[1]) && !(Number(y[1]) === Number(r.date.slice(0, 4)) - 1 && Number(r.date.slice(5, 7)) <= 6))
      add(i, "warn", "date", `name says ${y[1]} but date is ${r.date.slice(0, 4)}`);

    // Time
    if (r.startTime) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(r.startTime)) add(i, "error", "time", `"${r.startTime}" is not HH:MM`);
      else {
        if (r.startTime === "00:00") add(i, "warn", "time", "00:00 is usually a missing time, not a midnight start");
        else if (r.startTime < "06:00" && !/ultra|night|sunrise|dawn|ironman|marathon/i.test(r.name)) add(i, "warn", "time", `very early start ${r.startTime}`);
        if (r.startTime >= "20:00" && !/night|twilight|evening|moonlight|midnight/i.test(r.name)) add(i, "warn", "time", `late start ${r.startTime} for a daytime event`);
        if (/night|twilight|evening|moonlight/i.test(r.name) && r.startTime < "15:00") add(i, "warn", "time", `name implies evening but start is ${r.startTime}`);
      }
    }

    // Distance
    const km = KM(r);
    if (!Number.isFinite(km) || km <= 0) add(i, "error", "distance", `distance "${r.distance} ${r.unit}" is not a positive number`);
    else {
      if (!["km", "mi"].includes(r.unit)) add(i, "error", "distance", `unit "${r.unit}" must be km or mi`);
      if (km > 804.672) add(i, "error", "distance", `${km.toFixed(1)} km is over the 500-mile limit`);
      if (km < 0.4) add(i, "warn", "distance", `${km.toFixed(2)} km is very short - is it a mile or a kids race?`);
      const label = norm(r.name);
      const claims = [
        [/\b5 ?k\b|\b5000m\b/, 5],
        [/\b10 ?k\b/, 10],
        [/\bhalf marathon\b|\bhalf\b/, 21.0975],
        [/\bmarathon\b/, 42.195],
        [/\b10 mile/, 16.0934],
        [/\b5 mile/, 8.04672],
      ];
      const named = claims.filter(([re, want]) => re.test(label) && !(want === 42.195 && /half/.test(label)));
      const fits = named.some(([, want]) => Math.abs(km - want) <= Math.max(0.25, want * 0.03));
      if (named.length && !fits && !/series|festival|weekend|league|relay|ultra|challenge/.test(label)) {
        const [, want] = named[0];
        add(i, "warn", "distance", `name mentions ${want === 21.0975 ? "half marathon" : want === 42.195 ? "marathon" : want + (want === 5 || want === 10 ? "K" : " mi")} but distance is ${r.distance}${r.unit}`);
      }
      const near = STANDARD.find(([d]) => Math.abs(km - d) <= Math.max(0.35, d * 0.02) && Math.abs(km - d) > 0.001);
      if (near && r.distance !== "21.1" && r.distance !== "42.2")
        add(i, "info", "distance", `${r.distance}${r.unit} is close to ${near[1]} - use the standard value if it is that distance`);
      if (/^(21\.1|42\.2)$/.test(r.distance) && r.unit === "km") add(i, "info", "distance", "rounded - use 21.0975 / 42.195 for half / full marathon");
    }

    // Names, places
    if (!r.name || r.name.length < 4) add(i, "error", "name", "name missing or too short");
    else {
      if (r.name === r.name.toUpperCase() && /[A-Z]{4}/.test(r.name)) add(i, "warn", "name", "ALL CAPS name - tidy before publishing");
      if (/\s{2,}|^\s|\s$/.test(r.name)) add(i, "info", "name", "stray whitespace");
      if (/test|tbc|tba|virtual|anywhere|your own/i.test(r.name)) add(i, "warn", "name", "looks like a virtual, placeholder or test event");
    }
    if (!r.city) add(i, "error", "place", "city missing");
    else {
      if (COUNTIES.has(norm(r.city))) add(i, "warn", "place", `"${r.city}" is a county, not a town - the start town is needed`);
      if (/^(anywhere|various|tbc|uk|united kingdom|ireland|england|scotland|wales)$/i.test(r.city)) add(i, "error", "place", `city "${r.city}" is not a place`);
      if (r.country && norm(r.city) === norm(r.country)) add(i, "warn", "place", "city is the same as the country");
    }
    if (!r.country) add(i, "error", "place", "country missing");

    // Source and evidence
    let host = "";
    try {
      const u = new URL(r.sourceUrl);
      host = u.hostname.replace(/^www\./, "");
      if (u.protocol !== "https:") add(i, "warn", "source", "source is not https");
      if (DISCOVERY.test(u.hostname)) add(i, "error", "source", "discovery calendars cannot be the primary source");
      if (/utm_|[?&](token|session|email)=/i.test(u.search)) add(i, "warn", "source", "source URL carries tracking or private parameters");
      if (/\/(results?|participants?|entrants?|start-?list)/i.test(u.pathname)) add(i, "error", "source", "results or participant page - event details only");
    } catch {
      add(i, "error", "source", "sourceUrl is not a valid URL");
    }
    const allowed = Object.values(allowedDomains).flat();
    if (host && allowed.length && !allowed.some((d) => host === d.replace(/^www\./, "") || host.endsWith(`.${d.replace(/^www\./, "")}`)))
      add(i, "info", "source", `${host} is not a registry domain - organiser pages are fine, check it is the event's own page`);
    if (!["organiser", "entry", "governing-body", "timing-provider"].includes(r.sourceKind)) add(i, "error", "source", `sourceKind "${r.sourceKind}" is not allowed`);
    if ((r.evidence ?? "").length < 20) add(i, "error", "evidence", "evidence is under 20 characters");
    else {
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const e = r.evidence.toLowerCase();
      const mentions = [r.date, r.date.slice(0, 4), months[Number(r.date.slice(5, 7)) - 1]].some((x) => e.includes(x));
      if (!mentions && !/\d/.test(e)) add(i, "info", "evidence", "evidence does not state the date");
    }
    if (!["Open", "Closed", "TBC"].includes(r.entryStatus)) add(i, "error", "entry", `entryStatus "${r.entryStatus}" must be Open, Closed or TBC`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt ?? "") || r.checkedAt > today) add(i, "error", "evidence", "checkedAt must be a real date no later than today");
  });

  // Cross-row checks
  const byEvent = new Map();
  rows.forEach((r, i) => {
    const k = `${norm(r.name)}|${r.date}`;
    byEvent.set(k, [...(byEvent.get(k) ?? []), i]);
  });
  for (const idx of byEvent.values()) {
    const cities = new Set(idx.map((i) => norm(rows[i].city)));
    const times = new Set(idx.map((i) => rows[i].startTime).filter(Boolean));
    if (cities.size > 1) idx.forEach((i) => add(i, "warn", "conflict", "same event and date listed in different towns"));
    const seen = new Set();
    idx.forEach((i) => {
      const k = KM(rows[i]).toFixed(1);
      if (seen.has(k)) add(i, "info", "duplicate", `distance ${rows[i].distance}${rows[i].unit} repeated for this event`);
      seen.add(k);
    });
    if (times.size > 3) idx.forEach((i) => add(i, "info", "time", "more than three different start times for one event"));
  }
  const byPlace = new Map();
  rows.forEach((r, i) => byPlace.set(`${r.date}|${norm(r.city)}`, [...(byPlace.get(`${r.date}|${norm(r.city)}`) ?? []), i]));
  for (const idx of byPlace.values()) {
    const dists = new Set(idx.map((i) => KM(rows[i]).toFixed(1)));
    const names = new Set(idx.map((i) => norm(rows[i].name)));
    if (dists.size > 1 && names.size > 1)
      idx.forEach((i) => {
        const others = idx.filter((j) => j !== i && norm(rows[j].name) !== norm(rows[i].name) && jaccard(rows[i].name, rows[j].name) >= 0.5);
        if (others.length && /\b\d+(\.\d+)?\s?(k|km|mi|miles?)$/i.test(rows[i].name.trim()))
          add(i, "warn", "name", "same event, date and town listed under several distance-specific names - use one shared name");
      });
  }
  const sorted = rows.map((r, i) => ({ r, i })).sort((a, b) => a.r.date.localeCompare(b.r.date));
  for (let a = 0; a < sorted.length; a++)
    for (let b = a + 1; b < sorted.length; b++) {
      const A = sorted[a],
        B = sorted[b];
      const gap = (Date.parse(B.r.date) - Date.parse(A.r.date)) / 864e5;
      if (gap > 7) break;
      if (A.r.name !== B.r.name && Math.abs(KM(A.r) - KM(B.r)) < 0.3 && norm(A.r.city) === norm(B.r.city) && jaccard(A.r.name, B.r.name) >= 0.6)
        add(B.i, "warn", "duplicate", `looks like row ${A.i + 2} "${A.r.name}" (${A.r.date}) - possible alias or duplicate`);
      if (A.r.name === B.r.name && gap > 0 && gap <= 7 && Math.abs(KM(A.r) - KM(B.r)) < 0.3)
        add(B.i, gap <= 3 ? "warn" : "info", "conflict", `same event and distance as row ${A.i + 2} but ${gap} day(s) apart - ${gap <= 3 ? "reschedule or typo?" : "a weekly series, or a typo?"}`);
    }
  return flags;
}

export function summarise(rows, flags) {
  const bad = new Set(flags.filter((f) => f.severity === "error").map((f) => f.row));
  const warn = new Set(flags.filter((f) => f.severity === "warn").map((f) => f.row));
  const by = {};
  for (const f of flags) by[`${f.severity}:${f.check}`] = (by[`${f.severity}:${f.check}`] ?? 0) + 1;
  return {
    rows: rows.length,
    clean: rows.length - new Set([...bad, ...warn]).size,
    withErrors: bad.size,
    withWarnings: [...warn].filter((r) => !bad.has(r)).length,
    by,
  };
}

export function loadAllowedDomains(registryText) {
  const out = {};
  for (const s of parseCsv(registryText))
    if (s.allowed_domains) out[s.source_id] = s.allowed_domains.split("|").map((d) => d.trim()).filter(Boolean);
  return out;
}
