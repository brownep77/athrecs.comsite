/** Pure upload validation. No network, database or publication side effects. */
export type TimingBasis = "chip" | "gun" | "unspecified";
export type UploadRow = {
  index: number; name: string; givenName: string; familyName: string;
  gender: string; category: string; club: string; bib: string;
  place: number | null; genderPlace: number | null; categoryPlace: number | null;
  timeText: string; chipText: string; gunText: string;
  finishSeconds: number; chipSeconds: number | null; gunSeconds: number | null;
  issues: string[];
};
export type IdentityCandidate = {
  id: number | null; name: string; slug: string | null; club: string;
  visibility: string; managed: boolean;
};
export const normalize = (v: unknown) => String(v ?? "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function slug(v: string) {
  return v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function csvTable(text: string): string[][] {
  const table: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (!quoted && c === ",") { row.push(cell.trim()); cell = ""; }
    else if (!quoted && (c === "\r" || c === "\n")) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim()); if (row.some(Boolean)) table.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (quoted) throw new Error("A quoted CSV cell is not closed.");
  row.push(cell.trim()); if (row.some(Boolean)) table.push(row);
  return table;
}
function heading(value: unknown): string {
  const n = normalize(value);
  // TRT table exports embed filter choices in these three headings.
  if (n === "genderfm" || n === "gendermf") return "gender";
  if (/^category(?:f\d|m\d|fo)/.test(n)) return "category";
  if (n.startsWith("club") && n.length > 20) return "club";
  const aliases: Record<string, string> = {
    position: "place", overallplace: "place", overallposition: "place",
    forename: "givenname", firstname: "givenname", surname: "familyname", lastname: "familyname",
    athletename: "name", displayname: "name", genderpos: "genderplace", genderposition: "genderplace",
    catpos: "categoryplace", categorypos: "categoryplace", agecategory: "category",
    tag: "bib", bibnumber: "bib", racenumber: "bib", clubname: "club", sex: "gender",
    finishtime: "time", totaltime: "time",
  };
  return aliases[n] ?? n;
}
function duration(value: unknown): { text: string; seconds: number | null } {
  // Numeric Excel durations are fractions of a day, not seconds.
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0 || value >= 7) return { text: String(value), seconds: null };
    const seconds = Math.round(value * 86400000) / 1000;
    const hours = Math.floor(seconds / 3600), minutes = Math.floor(seconds / 60) % 60;
    const sec = (seconds % 60).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    return { seconds, text: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${sec.padStart(sec.includes(".") ? sec.length + (Number(sec) < 10 ? 1 : 0) : 2, "0")}` };
  }
  const text = String(value ?? "").trim();
  if (!/^\d{1,3}:\d{2}(?::\d{2})?(?:\.\d{1,3})?$/.test(text)) return { text, seconds: null };
  const parts = text.split(":").map(Number);
  if (parts.slice(1).some(p => p >= 60)) return { text, seconds: null };
  const seconds = parts.reduce((a, b) => a * 60 + b, 0);
  return { text, seconds: seconds > 0 && seconds <= 604800 ? seconds : null };
}
export function parseTable(table: unknown[][], basis: TimingBasis): UploadRow[] {
  if (table.length < 2 || table.length > 5001) throw new Error("Upload a header and 1–5,000 results.");
  const headers = table[0].map(heading);
  for (const key of ["bib", "place"]) if (!headers.includes(key)) throw new Error(`Missing ${key} column.`);
  if (!headers.includes("name") && (!headers.includes("givenname") || !headers.includes("familyname")))
    throw new Error("Missing runner name columns.");
  const used = headers.filter(h => ["bib", "place", "name", "givenname", "familyname", "gender", "category", "genderplace", "categoryplace", "club", "time", "chiptime", "guntime"].includes(h));
  if (new Set(used).size !== used.length) throw new Error("Repeated column headings need review.");
  const get = (r: unknown[], key: string) => r[headers.indexOf(key)] ?? "";
  const str = (r: unknown[], key: string) => String(get(r, key)).replace(/\s+/g, " ").trim();
  const rank = (r: unknown[], key: string) => /^[1-9]\d*$/.test(str(r, key)) ? Number(str(r, key)) : null;
  const rows = table.slice(1).filter(r => r.some(v => String(v ?? "").trim())).map((r, index): UploadRow => {
    const givenName = str(r, "givenname"), familyName = str(r, "familyname");
    const name = str(r, "name") || `${givenName} ${familyName}`.trim();
    const generic = duration(get(r, "time")), rawChip = duration(get(r, "chiptime")), rawGun = duration(get(r, "guntime"));
    const chip = rawChip.seconds !== null ? rawChip : basis === "chip" ? generic : rawChip;
    const gun = rawGun.seconds !== null ? rawGun : basis === "gun" ? generic : rawGun;
    const finish = chip.seconds ?? gun.seconds ?? generic.seconds;
    const issues: string[] = [];
    const bib = str(r, "bib"), place = rank(r, "place"), gp = rank(r, "genderplace"), cp = rank(r, "categoryplace");
    if (!name || name.length > 200 || !bib || bib.length > 80) issues.push("Name or bib missing or too long");
    if (finish === null || !place) issues.push("A numeric finish position and valid finish time are required");
    if (gp && place && gp > place) issues.push("Gender position exceeds overall position");
    if (cp && gp && cp > gp) issues.push("Category position exceeds gender position");
    if (chip.seconds !== null && gun.seconds !== null && chip.seconds > gun.seconds) issues.push("Chip time exceeds gun time");
    if (str(r, "chiptime") && rawChip.seconds === null) issues.push("Invalid chip time");
    if (str(r, "guntime") && rawGun.seconds === null) issues.push("Invalid gun time");
    return { index: index + 1, name, givenName, familyName, bib,
      gender: str(r, "gender").toUpperCase(), category: str(r, "category"), club: str(r, "club"),
      place, genderPlace: gp, categoryPlace: cp, timeText: generic.text,
      chipText: chip.seconds === null ? "" : chip.text, gunText: gun.seconds === null ? "" : gun.text,
      finishSeconds: finish ?? 0, chipSeconds: chip.seconds, gunSeconds: gun.seconds, issues };
  });
  const bibs = new Map<string, number>(), names = new Map<string, number>();
  for (const r of rows) { bibs.set(r.bib, (bibs.get(r.bib) ?? 0) + 1); names.set(normalize(r.name), (names.get(normalize(r.name)) ?? 0) + 1); }
  for (const r of rows) {
    if ((bibs.get(r.bib) ?? 0) > 1) r.issues.push("Repeated bib in this upload");
    if ((names.get(normalize(r.name)) ?? 0) > 1) r.issues.push("Repeated runner name in this upload; identity review required");
  }
  return rows;
}
const names = ["dom dominic", "chris christopher", "jo joanne joanna", "andy andrew", "steve steven stephen", "mick mike michael", "dan danny daniel", "ben benjamin", "tom thomas", "rob bob robert", "jim james", "ed edward", "dave david", "alex alexander alexandra"];
const aliases = new Map(names.flatMap(group => group.split(" ").map(n => [n, group.split(" ")[0]] as const)));
export function possibleIdentity(left: string, right: string): boolean {
  if (normalize(left) === normalize(right)) return true;
  const parts = (s: string) => s.trim().split(/\s+/).map(normalize).filter(Boolean);
  const a = parts(left), b = parts(right);
  if (a.length < 2 || b.length < 2 || a.at(-1) !== b.at(-1)) return false;
  // Conservative candidates, not a decision to merge. Same initial also flags abbreviations.
  return a[0][0] === b[0][0] || (aliases.get(a[0]) ?? a[0]) === (aliases.get(b[0]) ?? b[0]);
}
export function runningClub(raw: string): string {
  return raw.split(/\s+&\s+/).map(s => s.trim()).filter(s => s && !/^CC:/i.test(s)).join(" & ");
}
