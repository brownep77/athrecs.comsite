import { z } from "zod";

export const httpsUrl = z.string().trim().url().max(2000).refine(value => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}, "Use an HTTPS source URL without credentials.");
export const draftSchema = z.object({
  index: z.number().int().min(1).max(250), race: z.string().trim().max(200),
  date: z.string().trim().max(40), distance: z.string().trim().max(40),
  time: z.string().trim().max(80), timingBasis: z.enum(["chip", "gun", "unspecified"]),
  sourceUrl: z.string().trim().max(2000), bib: z.string().trim().max(80).default(""),
  place: z.string().trim().max(20).default(""),
}).strict();
export type DraftResult = z.infer<typeof draftSchema>;
export type CandidateResult = DraftResult & {
  state: "pending" | "approved" | "duplicate" | "rejected";
  response?: "yes" | "no" | "unsure";
  responseBy?: string; responseAt?: string; responseNote?: string;
  resultId?: number; decisionNote?: string;
};
export type Batch = {
  id: string; athlete_id: number | null; submitted_by: string; source_url: string;
  original_text: string; input_hash: string; entries: CandidateResult[]; revision: number;
  evidence_for: string; evidence_against: string; updated_at: string;
};
export type ProfileFields = {
  display_name: string; given_name: string; family_name: string; gender: string;
  source_club_name: string; city: string; county: string; country: string; bio: string;
};
export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(200), given_name: z.string().trim().max(100),
  family_name: z.string().trim().max(100), gender: z.enum(["M", "F", "U", "X"]),
  source_club_name: z.string().trim().max(200), city: z.string().trim().max(150),
  county: z.string().trim().max(150), country: z.string().trim().max(150), bio: z.string().trim().max(4000),
}).strict();
export const normal = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function distanceValue(value: string): { code: string; km: number } | null {
  if (/^half(?:\s*marathon)?$/i.test(value)) return { code: "Half", km: 21.0975 };
  if (/^marathon$/i.test(value)) return { code: "Marathon", km: 42.195 };
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(k|km|m|mi|mile|miles)$/i);
  if (!match) return null;
  const amount = Number(match[1]), unit = match[2].toLowerCase();
  if (amount <= 0) return null;
  const km = amount * (unit === "m" ? 0.001 : unit.startsWith("mi") ? 1.609344 : 1);
  if (km > 1000) return null;
  return { code: unit === "m" ? `${amount}m` : unit.startsWith("mi") ? `${amount}mi` : `${amount}K`, km };
}
export function timeSeconds(value: string): number | null {
  if (!/^\d{1,3}:\d{2}(?::\d{2})?(?:\.\d{1,3})?$/.test(value)) return null;
  const parts = value.split(":").map(Number);
  if (parts.slice(1).some(part => part >= 60)) return null;
  const seconds = parts.reduce((sum, part) => sum * 60 + part, 0);
  return seconds > 0 && seconds <= 604800 ? seconds : null;
}
export function isoDate(value: string, order: "day-first" | "month-first" = "day-first"): string {
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const numeric = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (numeric) return `${numeric[3]}-${(order === "day-first" ? numeric[2] : numeric[1]).padStart(2,"0")}-${(order === "day-first" ? numeric[1] : numeric[2]).padStart(2,"0")}`;
  const words = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (words) {
    const month = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(words[2].slice(0,3).toLowerCase());
    if (month >= 0) return `${words[3]}-${String(month+1).padStart(2,"0")}-${words[1].padStart(2,"0")}`;
  }
  return text; // Never invent the century of a two-digit year.
}
export function resultIssues(row: DraftResult, asOf = new Date().toISOString().slice(0,10)): string[] {
  const issues: string[] = [];
  if (row.race.length < 3) issues.push("Race/meeting name required");
  const parsed = Date.parse(row.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date) || !Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0,10) !== row.date || row.date > asOf) issues.push("Use a valid past date with a four-digit year");
  if (!distanceValue(row.distance)) issues.push("Specify a distance with units, Half or Marathon");
  if (timeSeconds(row.time) === null) issues.push("Use MM:SS or HH:MM:SS; review any qualification marks separately");
  if (!httpsUrl.safeParse(row.sourceUrl).success) issues.push("Source-results HTTPS link required");
  if (row.place && !/^[1-9]\d*$/.test(row.place)) issues.push("Overall position must be a positive whole number or blank");
  return issues;
}
export function tableCells(text: string): string[][] {
  if (!text.trim() || text.length > 200000) throw new Error("Paste a results table, up to 200,000 characters.");
  const delimiter = text.includes("\t") ? "\t" : ",";
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (c==='"') { if(quoted && text[i+1]==='"') { cell+='"'; i++; } else quoted=!quoted; }
    else if (!quoted && c===delimiter) { row.push(cell.trim());cell=""; }
    else if (!quoted && (c==='\n'||c==='\r')) { if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=""; }
    else cell+=c;
  }
  if(quoted)throw new Error("A quoted cell is not closed.");
  row.push(cell.trim());if(row.some(Boolean))rows.push(row);
  if(rows.length<2||rows.length>251)throw new Error("Include column headings and 1–250 result rows per paste.");
  if(rows.some(r=>r.length>40))throw new Error("Paste only the results table, not a complete webpage.");
  if(rows.some(r=>r.length!==rows[0].length))throw new Error("The copied rows have different column counts. Check the table before continuing; no columns have been guessed.");
  return rows;
}
export function parsePaste(text: string, defaults: { sourceUrl: string; timingBasis: DraftResult["timingBasis"]; dateOrder: "day-first"|"month-first" }): DraftResult[] {
  const table=tableCells(text), headers=table[0].map(normal);
  const find=(names:string[])=>{
    const matches=headers.flatMap((h,i)=>names.includes(h)?[i]:[]);
    if(matches.length>1)throw new Error(`More than one ${names[0]} column was found. Paste one clearly labelled column per field, or use the Excel/CSV race-results importer for separate chip and gun columns. Nothing has been saved.`);
    return matches[0]??-1;
  };
  const raceIndex=find(["race","racename","meeting","meetingname","eventname","competition"]);
  const dateIndex=find(["date","racedate","eventdate"]);
  const distIndex=find(["distance","distancecode","discipline",...(raceIndex>=0?["event"]:[])]);
  const timeIndex=find(["time","finishtime","performance","perf","chiptime","guntime"]);
  if(dateIndex<0||timeIndex<0)throw new Error("The pasted table needs Date and Time/Performance headings. Use the example headings below or edit the copied table first.");
  const idx={race:raceIndex>=0?raceIndex:find(["event"]),date:dateIndex,distance:distIndex,time:timeIndex,bib:find(["bib","tag","racenumber"]),place:find(["position","place","overallplace","pos"]),source:find(["sourceurl","resultsurl","url"])};
  const get=(r:string[],i:number)=>i<0?"":r[i]??"";
  return table.slice(1).map((r,i)=>({index:i+1,race:get(r,idx.race),date:isoDate(get(r,idx.date),defaults.dateOrder),distance:get(r,idx.distance),time:get(r,idx.time),bib:get(r,idx.bib),place:get(r,idx.place),sourceUrl:get(r,idx.source)||defaults.sourceUrl,timingBasis:headers[timeIndex]==="chiptime"?"chip":headers[timeIndex]==="guntime"?"gun":defaults.timingBasis}));
}
