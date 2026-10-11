import { COLLECTOR_COUNTRIES, realDate, validateScope, type Candidate, type Scope } from "./core";

export const FIXTURE_UPLOAD_LIMIT = 500;
export const FIXTURE_UPLOAD_BYTES = 2_000_000;
export const FIXTURE_UPLOAD_HEADERS = [
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
export const UK_FIXTURE_SCOPE: Scope = {
  countries: ["GB"],
  dateFrom: "2026-01-01",
  dateTo: "2027-12-31",
  min: 0,
  max: 500,
  unit: "mi",
  passes: 1,
  regional: false,
};
export type FixtureUploadInput = {
  content: string;
  format: "csv" | "json";
  label: string;
  scope: Scope;
};
export type UploadRow = { row: number; candidate: Candidate; errors: string[] };

/** RFC-style quoted fields, including CRLF, escaped quotes and multiline evidence. */
function csvRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false,
    closed = false;
  const cell = () => {
    row.push(field.trim());
    field = "";
    closed = false;
  };
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (quoted) {
      if (c === '"' && content[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else field += c;
    } else if (c === '"' && !field && !closed) quoted = true;
    else if (c === ",") cell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && content[i + 1] === "\n") i++;
      cell();
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else if (c === '"' || (closed && c.trim()))
      throw new Error("CSV contains an unexpected quote or text after a quoted field.");
    else field += c;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  cell();
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
const aliases: Record<string, string> = {
  event: "name",
  eventname: "name",
  racename: "name",
  eventdate: "date",
  source: "sourceUrl",
  sourceurl: "sourceUrl",
  entryurl: "entryUrl",
  starttime: "startTime",
  sourcekind: "sourceKind",
  checkedat: "checkedAt",
  entrystatus: "entryStatus",
  countrycode: "countryCode",
  distancelabel: "distanceLabel",
  distancekm: "distanceKm",
  regioncode: "regionCode",
  county: "region",
};
const key = (s: string) => {
  const n = s.toLowerCase().replace(/[ _-]/g, "");
  return aliases[n] ?? n;
};
const homeNations = new Map(
  ["England", "Scotland", "Wales", "Northern Ireland", "United Kingdom", "UK"].map((c) => [
    c.toLowerCase(),
    c,
  ]),
);

export function parseFixtureUpload(
  input: FixtureUploadInput,
  today = new Date().toISOString().slice(0, 10),
) {
  if (
    !input ||
    typeof input.content !== "string" ||
    !input.content.trim() ||
    new TextEncoder().encode(input.content).length > FIXTURE_UPLOAD_BYTES
  )
    throw new Error("Choose a non-empty fixture file smaller than 2 MB.");
  if (!["csv", "json"].includes(input.format)) throw new Error("Choose CSV or JSON.");
  if (typeof input.label !== "string" || !input.label.trim() || input.label.length > 160)
    throw new Error("Give this import a name of up to 160 characters.");
  const scope = validateScope(input.scope);
  const content = input.content.replace(/^\uFEFF/, "");
  let records: unknown[];
  if (input.format === "csv") {
    const [headers, ...values] = csvRows(content);
    if (!headers || !values.length)
      throw new Error("CSV needs a header and at least one fixture row.");
    const names = headers.map(key);
    if (new Set(names).size !== names.length || names.some((n) => !n))
      throw new Error("CSV headers must be non-empty and unique.");
    records = values.map((values, i) => {
      if (values.length !== names.length)
        throw new Error(
          `CSV row ${i + 2}: expected ${names.length} columns, found ${values.length}.`,
        );
      return Object.fromEntries(names.map((n, j) => [n, values[j]]));
    });
  } else {
    let decoded: unknown;
    try {
      decoded = JSON.parse(content);
    } catch {
      throw new Error("The file is not valid JSON.");
    }
    records = Array.isArray(decoded)
      ? decoded
      : ((decoded && typeof decoded === "object"
          ? ((decoded as { fixtures?: unknown[]; candidates?: unknown[] }).fixtures ??
            (decoded as { candidates?: unknown[] }).candidates)
          : undefined) as unknown[]);
    if (!Array.isArray(records))
      throw new Error(
        "JSON must be an array of fixtures, or an object with a fixtures or candidates array.",
      );
  }
  if (!records.length || records.length > FIXTURE_UPLOAD_LIMIT)
    throw new Error(`Import 1–${FIXTURE_UPLOAD_LIMIT} fixture distances per file.`);
  const rows: UploadRow[] = records.map((raw, i) => {
    const row = i + (input.format === "csv" ? 2 : 1);
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error(`Row ${row} must be a fixture object.`);
    const r = Object.fromEntries(Object.entries(raw).map(([k, v]) => [key(k), v]));
    const errors: string[] = [];
    if (r.sport && r.sport !== "Running")
      errors.push("Only standalone running fixtures belong in this import");
    const str = (name: string) => {
      const v = r[name];
      if (v === undefined || v === null) return "";
      if (typeof v !== "string" && typeof v !== "number") {
        errors.push(`${name} must be text`);
        return "";
      }
      const s = String(v).trim();
      if (s.length > 3000) errors.push(`${name} is too long`);
      return s;
    };
    let country = str("country");
    const nation = homeNations.get(country.toLowerCase());
    const match = COLLECTOR_COUNTRIES.find(
      (c) => c.name.toLowerCase() === country.toLowerCase() || c.code === country.toUpperCase(),
    );
    const countryCode = str("countryCode") || (nation ? "GB" : (match?.code ?? ""));
    country = nation === "UK" ? "United Kingdom" : (nation ?? match?.name ?? country);
    if (!countryCode || !country || (!nation && !match))
      errors.push("Country must identify the start country (for example England or GB)");
    if ((nation && countryCode !== "GB") || (match && countryCode !== match.code))
      errors.push("Country and countryCode disagree");
    const distanceText = str("distance");
    let unitText = str("unit").toLowerCase();
    let distance = Number(distanceText);
    if (/^half[ -]?marathon$/i.test(distanceText)) {
      distance = 21.0975;
      unitText = "km";
    } else if (/^marathon$/i.test(distanceText)) {
      distance = 42.195;
      unitText = "km";
    } else {
      const measured = /^(\d+(?:\.\d+)?)\s*(k|km|kilometres?|kilometers?|mi|miles?)$/i.exec(
        distanceText,
      );
      if (measured) {
        const embeddedUnit = /^(mi|mile)/i.test(measured[2]) ? "mi" : "km";
        if (
          unitText &&
          ![
            embeddedUnit,
            ...(embeddedUnit === "km" ? ["k", "kilometres", "kilometers"] : ["mile", "miles"]),
          ].includes(unitText)
        )
          errors.push("Distance and unit disagree");
        distance = Number(measured[1]);
        unitText = embeddedUnit;
      }
    }
    if (["mile", "miles"].includes(unitText)) unitText = "mi";
    if (["k", "kilometres", "kilometers"].includes(unitText)) unitText = "km";
    if (!Number.isFinite(distance) || distance <= 0 || !["km", "mi"].includes(unitText))
      errors.push(
        "Distance needs a positive number and km or mi (or use 10K, half marathon, marathon)",
      );
    const distanceKm = distance * (unitText === "mi" ? 1.609344 : 1);
    if (
      str("distanceKm") &&
      (!Number.isFinite(Number(str("distanceKm"))) ||
        Math.abs(Number(str("distanceKm")) - distanceKm) > 0.025)
    )
      errors.push("distanceKm disagrees with distance and unit");
    const date = str("date"),
      checkedAt = str("checkedAt");
    if (!realDate(date)) errors.push("Date must be a real YYYY-MM-DD date");
    if (!realDate(checkedAt) || checkedAt > today)
      errors.push(
        "checkedAt must be the actual source-check date, YYYY-MM-DD, no later than today",
      );
    const candidate: Candidate = {
      name: str("name"),
      countryCode,
      country,
      city: str("city"),
      region: str("region"),
      regionCode: str("regionCode"),
      date,
      distance,
      unit: unitText as Candidate["unit"],
      distanceKm,
      distanceLabel:
        str("distanceLabel") ||
        (distance === 21.0975 && unitText === "km"
          ? "Half"
          : distance === 42.195 && unitText === "km"
            ? "Marathon"
            : `${distance}${unitText === "mi" ? "mi" : "K"}`),
      surface: str("surface"),
      startTime: str("startTime"),
      sourceUrl: str("sourceUrl"),
      entryUrl: str("entryUrl"),
      sourceKind: str("sourceKind") as Candidate["sourceKind"],
      evidence: str("evidence"),
      checkedAt,
      entryStatus: (str("entryStatus") || "TBC") as Candidate["entryStatus"],
      notes: str("notes"),
    };
    return { row, candidate, errors };
  });
  return { scope, label: input.label.trim(), rows };
}
