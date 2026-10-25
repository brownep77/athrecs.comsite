/** Run dates use the process timezone; race dates remain venue-local dates. */
export function startTimeReviewToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function realDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

/** Three calendar months, inclusive, clamped at month-end. */
export function startTimeReviewThrough(today: string): string {
  if (!realDate(today)) throw new Error("Start-time review needs a valid run date.");
  const date = new Date(`${today}T00:00:00Z`);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 3, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target.toISOString().slice(0, 10);
}

export function startTimeReviewPriority(date: string, today: string): number | null {
  const through = startTimeReviewThrough(today);
  if (!realDate(date) || date < today || date > through) return null;
  const days = (Date.parse(date) - Date.parse(today)) / 86400000;
  return days <= 2 ? 0 : days <= 7 ? 1 : days <= 30 ? 2 : 3;
}

export function isResearchStartTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function startTimeResearchInstruction(today: string): string {
  return `MANDATORY THREE-MONTH START-TIME REVIEW: run date ${today}; within this job’s requested geography, dates and distances, fully review each candidate dated from ${today} through ${startTimeReviewThrough(today)} inclusive. Do not expand the collection scope to this window. This is three calendar months, not 90 days. Prioritise today/next two days, then seven days, then 30 days, then the rest of the window. For each in-window edition, exhaust reasonably available current-edition sources: organiser timetable/schedule; FAQ; race instructions, athlete guide and linked PDFs (inspect image/scanned pages when text extraction fails); authorised entry programme and its distance categories; relevant governing-body fixture; organiser news and official social updates. Search the exact event, year and distance in English and the relevant local language. Use secondary calendars to find primary evidence only. If a page is inaccessible, try its linked official documents, an accessible official alternative or authorised entry page; record the access failure and continue. A landing page, search snippet or one unsuccessful page is not a completed check. Record in notes the start-time source URL and checked date, local clock, IANA venue timezone, exact distance/category and first wave or start window. Never substitute registration, transport, event-village opening or another year's start. For unresolved starts, keep startTime empty and record each attempted URL with its outcome, one of organiser-not-yet-published / inaccessible / conflicting / unchecked, and the next action and retry date. Never label a partial search not yet published. Recheck unresolved races weekly at 31 days to three months, every three days at 8–30 days, and daily within seven days; immediately revisit new official updates. Reconfirm known starts at seven and two days. Do not guess or contact organisers without explicit messaging authority. Unresolved in-window editions must stay in gaps for follow-up; successful fixture collection does not close their time review.`;
}
