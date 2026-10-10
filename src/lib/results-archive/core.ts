import { z } from "zod";

const text = (max: number) => z.string().trim().max(max).default("");
const rank = z.number().int().positive().max(2147483647).nullable().default(null);
const seconds = z.number().finite().nonnegative().max(2147483647).nullable().default(null);
export const archiveRowSchema = z
  .object({
    sourceKey: z.string().trim().min(1).max(300),
    name: z.string().trim().min(1).max(200),
    bib: text(100),
    club: text(200),
    category: text(100),
    gender: text(30),
    country: text(100),
    status: z.enum(["finished", "DNF", "DNS", "DQ", "unknown"]),
    finishSeconds: seconds,
    chipSeconds: seconds,
    gunSeconds: seconds,
    overallPlace: rank,
    genderPlace: rank,
    categoryPlace: rank,
    sourceAthleteProvider: text(100),
    sourceAthleteId: text(200),
    // Non-time marks, relay members and splits are retained without inventing a finish time.
    performance: text(200),
    team: text(200),
    leg: text(100),
    splits: z
      .array(z.object({ label: z.string().max(100), value: z.string().max(200) }).strict())
      .max(100)
      .default([]),
    original: z.record(z.string().max(160), z.string().max(4000)).default({}),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (Object.keys(r.original).length > 100)
      ctx.addIssue({ code: "custom", message: "At most 100 source columns are supported per row" });
    if (r.chipSeconds !== null && r.gunSeconds !== null && r.chipSeconds > r.gunSeconds)
      ctx.addIssue({ code: "custom", message: "Chip time exceeds gun time" });
    if (r.genderPlace && r.overallPlace && r.genderPlace > r.overallPlace)
      ctx.addIssue({ code: "custom", message: "Gender place exceeds overall place" });
    if (r.categoryPlace && r.genderPlace && r.categoryPlace > r.genderPlace)
      ctx.addIssue({ code: "custom", message: "Category place exceeds gender place" });
    if (Boolean(r.sourceAthleteProvider) !== Boolean(r.sourceAthleteId))
      ctx.addIssue({
        code: "custom",
        message: "Source athlete provider and ID must be supplied together",
      });
  });
export type ArchiveRow = z.output<typeof archiveRowSchema>;
export const positiveId = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const httpsSource = z
  .string()
  .trim()
  .url()
  .max(2000)
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  }, "Use an HTTPS source URL without credentials");
export const datasetSchema = z
  .object({
    editionId: positiveId,
    provider: z.string().trim().min(1).max(160),
    sourceRaceKey: z.string().trim().min(1).max(300),
    sourceUrl: httpsSource,
    permissionNote: z.string().trim().min(12).max(2000),
    expectedRows: z.number().int().nonnegative().max(2147483647).nullable().default(null),
  })
  .strict();
export type DatasetInput = z.input<typeof datasetSchema>;
export const batchSchema = z
  .object({
    requestId: z.string().uuid(),
    datasetId: z.string().uuid(),
    rows: z.array(archiveRowSchema).min(1).max(500),
  })
  .strict()
  .refine(
    (v) => new Set(v.rows.map((r) => r.sourceKey)).size === v.rows.length,
    "Repeated source row IDs in this batch",
  );
export type BatchInput = z.input<typeof batchSchema>;
export const reviewSchema = z
  .object({
    entryId: positiveId,
    revision: positiveId,
    action: z.enum(["link", "correct", "hold", "reopen"]),
    athleteId: positiveId.optional(),
    identityNote: z.string().trim().min(12).max(2000),
    sourceChecked: z.boolean().default(false),
    // Optimistic comparison of the canonical result prevents overwriting a concurrent edit.
    resultFingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/)
      .optional(),
  })
  .strict();
export type ReviewInput = z.input<typeof reviewSchema>;
export type ArchiveState = "all" | "unmatched" | "linked" | "changed" | "held";
export type ArchiveCandidate = {
  id: number;
  name: string;
  slug: string;
  club: string;
  country: string;
  managed: boolean;
  existingResultId: number | null;
  reason: string;
};
export type ArchiveEntry = {
  id: number;
  datasetId: string;
  sourceKey: string;
  revision: number;
  appliedRevision: number | null;
  canonicalChanged: boolean;
  state: string;
  resultId: number | null;
  athleteId: number | null;
  athleteName: string | null;
  payload: ArchiveRow;
  eventName: string;
  eventDate: string;
  distance: string;
  provider: string;
  sourceUrl: string;
};
export type BatchReceipt = {
  requestId: string;
  inserted: number;
  revised: number;
  unchanged: number;
  replay: boolean;
};

export const ARCHIVE_FIELDS = [
  "sourceKey",
  "name",
  "bib",
  "club",
  "category",
  "gender",
  "country",
  "status",
  "finishTime",
  "chipTime",
  "gunTime",
  "overallPlace",
  "genderPlace",
  "categoryPlace",
  "sourceAthleteProvider",
  "sourceAthleteId",
  "performance",
  "team",
  "leg",
] as const;
export type ArchiveField = (typeof ARCHIVE_FIELDS)[number];
export type ColumnMapping = Partial<Record<ArchiveField, string>>;

/** RFC4180-style CSV/TSV parsing. Headers are mapped explicitly; never infer column positions. */
export function parseDelimited(input: string): { headers: string[]; rows: string[][] } {
  const source = input.replace(/^\uFEFF/, "");
  const first = source.split(/\r?\n/, 1)[0];
  const separator = first.includes("\t") && !first.includes(",") ? "\t" : ",";
  const table: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const pushRow = () => {
    row.push(cell);
    if (row.some((v) => v.trim())) table.push(row);
    row = [];
    cell = "";
    closed = false;
  };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += ch;
    } else if (ch === '"' && !cell && !closed) quoted = true;
    else if (ch === separator) {
      row.push(cell);
      cell = "";
      closed = false;
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      pushRow();
    } else {
      if (closed) throw new Error("Unexpected text after a quoted CSV cell");
      cell += ch;
    }
  }
  if (quoted) throw new Error("The file has an unclosed quoted cell");
  if (cell || row.length) pushRow();
  const headers = (table.shift() ?? []).map((v) => v.trim());
  if (
    !headers.length ||
    headers.some((h) => !h) ||
    new Set(headers).size !== headers.length ||
    headers.length > 100
  )
    throw new Error("Use 1–100 distinct, non-empty column headings");
  if (table.some((r) => r.length !== headers.length))
    throw new Error("A row has a different number of columns from the headings");
  return { headers, rows: table };
}

const aliases: Record<ArchiveField, string[]> = {
  sourceKey: ["sourcekey", "resultid", "entryid"],
  name: ["name", "athletename", "fullname", "runner"],
  bib: ["bib", "bibnumber", "number", "tag"],
  club: ["club", "clubname"],
  category: ["category", "agegroup"],
  gender: ["gender", "sex"],
  country: ["country", "nation"],
  status: ["status", "finishstatus"],
  finishTime: ["finishtime", "time", "duration"],
  chipTime: ["chiptime", "nettime"],
  gunTime: ["guntime", "gross time"],
  overallPlace: ["overallplace", "position", "place", "overallposition"],
  genderPlace: ["genderplace", "genderpos"],
  categoryPlace: ["categoryplace", "catpos"],
  sourceAthleteProvider: ["sourceathleteprovider"],
  sourceAthleteId: ["sourceathleteid"],
  performance: ["performance", "mark"],
  team: ["team"],
  leg: ["leg", "heat"],
};
export function suggestColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const field of ARCHIVE_FIELDS) {
    const matches = headers.filter((h) =>
      aliases[field].includes(h.toLowerCase().replace(/[^a-z]/g, "")),
    );
    if (matches.length === 1) mapping[field] = matches[0];
  }
  return mapping;
}
function duration(value: string): number | null {
  if (!value.trim()) return null;
  const parts = value.trim().split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p)))
    throw new Error("Times must use MM:SS or HH:MM:SS, with optional decimal seconds");
  if (
    parts.slice(1).some((p) => Number(p) >= 60) ||
    parts.slice(0, -1).some((p) => p.includes("."))
  )
    throw new Error("Invalid minutes or seconds in time");
  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}
export function mapArchiveRows(
  table: { headers: string[]; rows: string[][] },
  mapping: ColumnMapping,
): ArchiveRow[] {
  if (!mapping.name || (!mapping.sourceKey && !mapping.bib))
    throw new Error("Map athlete name and a stable source result ID or bib");
  const columns = Object.values(mapping).filter(Boolean);
  if (columns.some((h) => !table.headers.includes(h)) || new Set(columns).size !== columns.length)
    throw new Error("Each mapping must use a different source column");
  const rows = table.rows.map((cells, index) => {
    const get = (field: ArchiveField) =>
      mapping[field] ? (cells[table.headers.indexOf(mapping[field]!)] ?? "").trim() : "";
    try {
      if (!get("sourceKey") && !get("bib")) throw new Error("Source result ID or bib is missing");
      const chip = duration(get("chipTime")),
        gun = duration(get("gunTime")),
        finish = duration(get("finishTime"));
      const rawStatus = get("status").toUpperCase();
      const status = ["FIN", "FINISHED", "FINISHER"].includes(rawStatus)
        ? "finished"
        : rawStatus || ((finish ?? chip ?? gun) !== null ? "finished" : "unknown");
      const placing = (field: ArchiveField) => {
        const v = get(field);
        if (!v) return null;
        if (!/^[1-9]\d*$/.test(v)) throw new Error(`Invalid ${field}`);
        return Number(v);
      };
      return archiveRowSchema.parse({
        sourceKey: get("sourceKey") || `bib:${get("bib")}`,
        name: get("name"),
        bib: get("bib"),
        club: get("club"),
        category: get("category"),
        gender: get("gender"),
        country: get("country"),
        status,
        finishSeconds: finish ?? chip ?? gun,
        chipSeconds: chip,
        gunSeconds: gun,
        overallPlace: placing("overallPlace"),
        genderPlace: placing("genderPlace"),
        categoryPlace: placing("categoryPlace"),
        sourceAthleteProvider: get("sourceAthleteProvider"),
        sourceAthleteId: get("sourceAthleteId"),
        performance: get("performance"),
        team: get("team"),
        leg: get("leg"),
        original: Object.fromEntries(table.headers.map((h, i) => [h, cells[i] ?? ""])),
      });
    } catch (error) {
      throw new Error(
        `Row ${index + 2}: ${error instanceof Error ? error.message : "Invalid row"}`,
      );
    }
  });
  if (new Set(rows.map((r) => r.sourceKey)).size !== rows.length)
    throw new Error(
      "Repeated source row IDs: use a provider result ID that distinguishes heats, relay legs and duplicate bibs",
    );
  return rows;
}
