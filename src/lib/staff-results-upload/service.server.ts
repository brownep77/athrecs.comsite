import { createHash } from "node:crypto";
import { load } from "cheerio";
import { getSql, dbSource, type Sql } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { fetchSource } from "../club-scanner/provider.server";
import { auditResults } from "../../../scripts/lib/result-evidence-audit.mjs";
import { csvTable, parseTable, normalize, slug, possibleIdentity, type UploadRow, type IdentityCandidate, type TimingBasis } from "./core";
export type UploadInput = { filename: string; content: string; eventName: string; date: string; distance: string; distanceKm: number; sourceUrl: string; timingBasis: TimingBasis };
export type ReviewedRow = UploadRow & { state: "new" | "review" | "duplicate" | "blocked"; candidates: IdentityCandidate[]; note: string };
const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
function assertInput(input: UploadInput) {
  if (IS_RUNRECS_SITE) throw new Error("Use the AthRecs staff site for athlete results.");
  if (!/^https:\/\/totalracetiming\.co\.uk\/raceresults\/[1-9]\d*\/?$/.test(input.sourceUrl)) throw new Error("Use the exact Total Race Timing race-results URL, without a query or fragment.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Number.isFinite(Date.parse(input.date)) || new Date(input.date).toISOString().slice(0, 10) !== input.date || input.date > new Date().toISOString().slice(0, 10)) throw new Error("A valid past race date is required.");
  const selectedKm = distanceKm(input.distance);
  if (selectedKm === null || Math.abs(selectedKm - input.distanceKm) > 0.001) throw new Error("Selected distance label and kilometres disagree with the distance table selection.");
}
/** Bound ZIP expansion before handing an XLSX to ExcelJS. ZIP64 is not accepted. */
function checkWorkbookZip(bytes: Buffer) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (bytes.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  if (end < 0) throw new Error("This is not a readable .xlsx workbook.");
  const count = bytes.readUInt16LE(end + 10), offset = bytes.readUInt32LE(end + 16);
  if (count > 200 || count === 65535 || offset >= bytes.length) throw new Error("Workbook is too complex; save a single results sheet.");
  let p = offset, size = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > bytes.length || bytes.readUInt32LE(p) !== 0x02014b50) throw new Error("Invalid workbook archive.");
    size += bytes.readUInt32LE(p + 24);
    if (size > 15000000) throw new Error("Expanded workbook exceeds 15 MB.");
    p += 46 + bytes.readUInt16LE(p + 28) + bytes.readUInt16LE(p + 30) + bytes.readUInt16LE(p + 32);
  }
}
async function uploadedRows(input: UploadInput): Promise<UploadRow[]> {
  if (/\.csv$/i.test(input.filename)) return parseTable(csvTable(input.content), input.timingBasis);
  if (!/\.xlsx$/i.test(input.filename)) throw new Error("Choose the original CSV or a single-sheet .xlsx file.");
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(input.content)) throw new Error("Invalid workbook encoding.");
  const bytes = Buffer.from(input.content, "base64"); checkWorkbookZip(bytes);
  const ExcelJS = await import("exceljs");
  const { Workbook, ValueType } = ExcelJS.default ?? ExcelJS;
  const wb = new Workbook();
  await wb.xlsx.load(bytes as never);
  const sheets = wb.worksheets.filter(s => s.actualRowCount > 1);
  if (sheets.length !== 1) throw new Error("Save just the race-results worksheet in this upload.");
  const sheet = sheets[0];
  if (sheet.rowCount > 5001 || sheet.columnCount > 32) throw new Error("Maximum 5,000 results and 32 columns.");
  const table: unknown[][] = [];
  sheet.eachRow(row => {
    const cells: unknown[] = [];
    for (let i = 1; i <= sheet.columnCount; i++) {
      const c = row.getCell(i);
      if (c.type === ValueType.Formula || c.type === ValueType.Error) throw new Error("Use values, not formulas or error cells, in the results workbook.");
      const value = c.value;
      if (value instanceof Date) {
        const serial = 25569 + value.getTime() / 86400000 - (wb.properties.date1904 ? 1462 : 0);
        if (!Number.isFinite(serial) || serial <= 0 || serial >= 7)
          throw new Error("A calendar-date cell cannot be used as a finish duration.");
        const column = normalize(sheet.getRow(1).getCell(i).text);
        if (!["time", "chiptime", "guntime", "finishtime", "totaltime"].includes(column))
          throw new Error("Date-formatted cells are only accepted in race-time columns.");
        cells.push(serial);
      } else cells.push(typeof value === "number" ? value : c.text);
    }
    table.push(cells);
  });
  return parseTable(table, input.timingBasis);
}
function distanceKm(label: string): number | null {
  if (/^half(?: marathon)?$/i.test(label.trim())) return 21.0975;
  if (/^marathon$/i.test(label.trim())) return 42.195;
  const m = label.trim().match(/^(\d+(?:\.\d+)?)\s*(k|km|mile|miles|mi)$/i);
  return m ? Number(m[1]) * (/^m/i.test(m[2]) ? 1.609344 : 1) : null;
}
async function verifySource(input: UploadInput, rows: UploadRow[]) {
  const html = await fetchSource(input.sourceUrl), $ = load(html); $("br").replaceWith(" ");
  $("select, button").remove();
  const text = (s: string) => s.replace(/\s+/g, " ").trim();
  const eventName = text($("h2").first().text());
  if (normalize(eventName) !== normalize(input.eventName)) throw new Error(`Source race is “${eventName}”; correct the race name before continuing.`);
  const captures: { url: string; headings: string[]; startTimes: string[]; rowCount: number; tables: { headers: string[]; rows: string[][] }[] }[] = [];
  $("table").each((_, table) => {
    const t = $(table), label = text(t.prevAll("h3").first().text()), km = distanceKm(label);
    if (km === null || Math.abs(km - input.distanceKm) > 0.001) return;
    const headers = t.find("thead th").toArray().map(h => text($(h).text()));
    const values = t.find("tbody tr").toArray().map(tr => $(tr).find("td").toArray().map(td => text($(td).text())));
    const dates = text(t.prevAll("p").first().text()).match(/\d{2}\/\d{2}\/\d{4}/g) ?? [];
    captures.push({ url: input.sourceUrl, headings: [eventName, label], startTimes: dates, rowCount: values.length, tables: [{ headers, rows: values }] });
  });
  if (captures.length !== 1) throw new Error("Source distance table is missing or ambiguous. Nothing was imported.");
  const capture = captures[0], official = parseTable([capture.tables[0].headers, ...capture.tables[0].rows], input.timingBasis);
  const audit = auditResults(rows.map(r => ({ id: r.index, athlete_id: r.index, display_name: r.name, event_name: input.eventName, event_date: input.date, distance_code: input.distance, status: "finished", source_url: input.sourceUrl, finish_time_seconds: r.finishSeconds, chip_time_seconds: r.chipSeconds, gun_time_seconds: r.gunSeconds, overall_place: r.place, gender_place: r.genderPlace, category_place: r.categoryPlace })), [capture]);
  for (const r of rows) {
    const matches = official.filter(o => o.bib === r.bib && normalize(o.name) === normalize(r.name));
    const o = matches[0];
    if (matches.length !== 1 || !o || o.issues.length || ["gender", "category", "club"].some(k => String(o[k as keyof UploadRow]) !== String(r[k as keyof UploadRow])) || ["finishSeconds", "chipSeconds", "gunSeconds", "place", "genderPlace", "categoryPlace"].some(k => o[k as keyof UploadRow] !== r[k as keyof UploadRow])) r.issues.push("Uploaded fields differ from the independent official source row");
    r.issues.push(...audit.issues.filter(i => "result_id" in i && i.result_id === r.index).flatMap(i => i.flags), ...audit.comparisons.filter(c => "result_id" in c && c.result_id === r.index).flatMap(c => c.flags));
  }
  if (audit.scope.untestedResults) throw new Error("Independent source comparison did not cover every uploaded row.");
  return { sourceHash: hash(capture), sourceRows: capture.rowCount };
}
type ExistingResult = { id: number; athleteId: number; name: string; bib: string; source: string; finish: number | null; chip: number | null; gun: number | null; place: number | null; gp: number | null; cp: number | null; category: string };
/** SELECT-only plan, shared by preview and by the explicit import transaction. */
export async function planUpload(sql: Sql, input: UploadInput, rows: UploadRow[], source: { sourceHash: string; sourceRows: number }) {
  const identities = await sql<IdentityCandidate>`
    select a.id, a.display_name as name, a.slug, coalesce(c.name,a.source_club_name,'') as club,
      a.profile_visibility as visibility,
      exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed
    from athletes a left join clubs c on c.id=a.club_id
    union all
    select null::integer, coalesce(nullif(p.display_name,''),p.full_name,u."name",'Athlete'), null::text,
      coalesce(p.club_or_team,''), 'private', true
    from athlete_private_profiles p join "user" u on u."id"=p.user_id
    limit 100001`;
  if (identities.length > 100000) throw new Error("Directory is too large for this bounded review; no incomplete comparison is allowed.");
  identities.sort((a,b) => (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER) || JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const events = await sql<{ id: number; slug: string; name: string; sport: string }>`select id,slug,name,sport from events where slug=${slug(input.eventName)} or regexp_replace(lower(name),'[^a-z0-9]','','g')=${normalize(input.eventName)}`;
  if (events.length > 1 || events.some(e => !['Running','Athletics'].includes(e.sport))) throw new Error("Existing race identity is ambiguous; resolve the event before importing.");
  const event = events[0] ?? null;
  const editions = event ? await sql<{ id: number; distance_km: number }>`select id,distance_km from editions where event_id=${event.id} and event_date=${input.date}::date and distance_code=${input.distance}` : [];
  if (editions.length > 1 || editions.some(e => Math.abs(Number(e.distance_km) - input.distanceKm) > 0.001)) throw new Error("Existing race distance requires review.");
  const edition = editions[0] ?? null;
  const prior = edition ? await sql<ExistingResult>`select r.id, r.athlete_id as "athleteId", a.display_name as name, r.bib, r.source_url as source, r.finish_time_seconds as finish, r.chip_time_seconds as chip, r.gun_time_seconds as gun, r.overall_place as place, r.gender_place as gp, r.category_place as cp, r.category from results r join athletes a on a.id=r.athlete_id where r.edition_id=${edition.id}` : [];
  const reviewed: ReviewedRow[] = rows.map(r => {
    const candidates = identities.filter(a => possibleIdentity(r.name, a.name));
    const sameBib = prior.filter(p => p.bib === r.bib);
    const exact = sameBib.length === 1 && normalize(sameBib[0].name) === normalize(r.name) && sameBib[0].source?.split('#')[0] === input.sourceUrl && sameBib[0].finish === Math.round(r.finishSeconds) && sameBib[0].chip === (r.chipSeconds === null ? null : Math.round(r.chipSeconds)) && sameBib[0].gun === (r.gunSeconds === null ? null : Math.round(r.gunSeconds)) && sameBib[0].place === r.place && sameBib[0].gp === r.genderPlace && sameBib[0].cp === r.categoryPlace && sameBib[0].category === r.category;
    const withinFile = rows.some(o => o.index !== r.index && possibleIdentity(r.name, o.name));
    const state = r.issues.length ? "blocked" : exact ? "duplicate" : sameBib.length ? "blocked" : candidates.length || withinFile ? "review" : "new";
    return { ...r, state, candidates: candidates.slice(0, 20), note: r.issues.join('; ') || (exact ? "This source result already exists; skip it" : sameBib.length ? "Existing bib/result conflicts; retained unchanged" : withinFile ? "Possible same-person variant within this file" : candidates.length ? "Possible existing identity; do not create another profile" : "No possible match in the live public/private directory") };
  });
  const summary = { total: reviewed.length, new: reviewed.filter(r=>r.state==='new').length, review: reviewed.filter(r=>r.state==='review').length, duplicate: reviewed.filter(r=>r.state==='duplicate').length, blocked: reviewed.filter(r=>r.state==='blocked').length, identitiesChecked: identities.length };
  return { rows: reviewed, summary, event, edition, ...source, reviewHash: hash({ metadata: { ...input, content: hash(input.content) }, reviewed, event, edition, source }) };
}
/** Source checks only; this helper never writes or connects to a substitute database. */
export async function prepareUpload(input: UploadInput) {
  assertInput(input);
  if (dbSource !== "neon") throw new Error("The live database connection is not configured. No seed-catalogue substitute is used for duplicate checking.");
  const rows = await uploadedRows(input), source = await verifySource(input, rows);
  return { rows, source };
}
export async function previewUpload(input: UploadInput) {
  const prepared = await prepareUpload(input);
  return planUpload(await getSql(), input, prepared.rows, prepared.source);
}
