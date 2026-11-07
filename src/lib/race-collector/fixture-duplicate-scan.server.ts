// Daily duplicate check across upcoming published fixtures (owner request,
// 7 November 2026). Two different events on the same date and distance are
// flagged when their names closely match or they share an organiser website.
// Findings are recorded and emailed for review; nothing is merged or hidden.
import { getSql, type Sql } from "../db";

export type FixtureRow = {
  edition_id: number;
  event_id: number;
  slug: string;
  name: string;
  country: string;
  city: string;
  website: string;
  date: string;
  distance_km: number;
  distance_code: string;
};

export type DuplicateFinding = {
  pairKey: string;
  first: FixtureRow;
  second: FixtureRow;
  reason: string;
};

const SHARED_HOSTS =
  /(^|\.)(facebook|instagram|eventbrite|runbritain|letsdothis|racecheck|findarace|ahotu|raceroster|runsignup|active|strava|google|parkrun|wikipedia|worldathletics|englandathletics|athleticsireland|totalracetiming|racebest|entrycentral|sientries)\./i;
const NOISE = new Set([
  "the",
  "and",
  "of",
  "race",
  "run",
  "running",
  "fun",
  "road",
  "trail",
  "edition",
  "annual",
  "km",
  "k",
  "mile",
  "miles",
  "marathon",
  "half",
  "10k",
  "5k",
  "10",
  "5",
]);

export function nameTokens(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d+(st|nd|rd|th)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 1 && !NOISE.has(token));
}

export function nameSimilarity(a: string, b: string): number {
  const x = new Set(nameTokens(a));
  const y = new Set(nameTokens(b));
  if (!x.size || !y.size) return 0;
  const shared = [...x].filter((token) => y.has(token)).length;
  return shared / Math.min(x.size, y.size);
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function distanceKey(row: FixtureRow): string {
  return row.distance_km > 0
    ? (Math.round(row.distance_km * 10) / 10).toFixed(1)
    : row.distance_code;
}

/** Pure comparison so it can be tested without a database. */
export function findDuplicates(rows: FixtureRow[]): DuplicateFinding[] {
  const groups = new Map<string, FixtureRow[]>();
  for (const row of rows) {
    const key = `${row.date}|${distanceKey(row)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const findings: DuplicateFinding[] = [];
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i += 1)
      for (let j = i + 1; j < group.length; j += 1) {
        const [a, b] = [group[i], group[j]].sort((p, q) => p.event_id - q.event_id);
        if (a.event_id === b.event_id) continue;
        if (a.country && b.country && a.country.toLowerCase() !== b.country.toLowerCase()) continue;
        const similarity = nameSimilarity(a.name, b.name);
        const ha = host(a.website);
        const sameSite = Boolean(ha) && ha === host(b.website) && !SHARED_HOSTS.test(`.${ha}`);
        const sameTown = Boolean(a.city) && a.city.toLowerCase() === b.city.toLowerCase();
        let reason = "";
        if (similarity >= 0.8) reason = "Names match closely";
        else if (sameSite && (similarity >= 0.34 || sameTown)) reason = "Same organiser website";
        else if (similarity >= 0.6 && sameTown) reason = "Similar names in the same town";
        if (!reason) continue;
        findings.push({
          pairKey: `${a.event_id}:${b.event_id}:${a.date}:${distanceKey(a)}`,
          first: a,
          second: b,
          reason,
        });
      }
  }
  return findings;
}

export async function scanFixtureDuplicates(options: { sqlOverride?: Sql; today?: string } = {}) {
  const sql = options.sqlOverride ?? (await getSql());
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const rows = await sql<FixtureRow>`
    select ed.id as edition_id, ev.id as event_id, ev.slug, ev.name, ev.country, ev.city,
      coalesce(ev.website, '') as website, ed.event_date::text as date,
      coalesce(ed.distance_km, 0)::float8 as distance_km, ed.distance_code
    from editions ed join events ev on ev.id = ed.event_id
    where ed.event_date >= ${today}::date and ed.event_date < ${today}::date + 366`;
  const findings = findDuplicates(rows);
  const fresh: DuplicateFinding[] = [];
  for (const f of findings) {
    const inserted = await sql<{ pair_key: string }>`
      insert into fixture_duplicate_findings
        (pair_key, first_event_id, second_event_id, event_date, distance, first_name, second_name, reason)
      values (${f.pairKey}, ${f.first.event_id}, ${f.second.event_id}, ${f.first.date}::date,
        ${f.first.distance_code}, ${f.first.name}, ${f.second.name}, ${f.reason})
      on conflict (pair_key) do update set last_seen = now()
      returning (xmax = 0) as inserted, pair_key`;
    if ((inserted[0] as unknown as { inserted: boolean })?.inserted) fresh.push(f);
  }
  const [{ open }] = await sql<{ open: number }>`
    select count(*)::int as open from fixture_duplicate_findings where status = 'open' and event_date >= ${today}::date`;
  return { scanned: rows.length, flagged: findings.length, fresh, open };
}

export function duplicateSummaryEmail(fresh: DuplicateFinding[], open: number) {
  const base = "https://www.athrecs.com/races/";
  const lines = fresh
    .slice(0, 100)
    .map(
      (f) =>
        `- ${f.first.date} ${f.first.distance_code}: "${f.first.name}" and "${f.second.name}" (${f.reason})\n  ${base}${f.first.slug}\n  ${base}${f.second.slug}`,
    );
  const text = [
    `The daily duplicate check found ${fresh.length} new possible duplicate fixture${fresh.length === 1 ? "" : "s"} (${open} open in total).`,
    "",
    ...lines,
    fresh.length > 100 ? `\n…and ${fresh.length - 100} more.` : "",
    "",
    "Nothing has been merged or hidden. Review each pair and remove or merge the duplicate.",
  ].join("\n");
  return {
    from: "AthRecs <info@athrecs.com>",
    to: ["paul@athrecs.com"],
    subject: `AthRecs duplicate check: ${fresh.length} new possible duplicate fixture${fresh.length === 1 ? "" : "s"}`,
    text,
  };
}

export async function sendDuplicateSummary(fresh: DuplicateFinding[], open: number) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || !fresh.length) return null;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify(duplicateSummaryEmail(fresh, open)),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return ((await response.json()) as { id?: string }).id ?? null;
}
