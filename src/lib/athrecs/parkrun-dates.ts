/** Weekly parkrun dates through the end of 2027. */

export const PARKRUN_FIRST_SAT = "2026-08-15";
export const PARKRUN_LAST_SAT = "2027-12-25";
export const PARKRUN_FIRST_SUN = "2026-08-16";
export const PARKRUN_LAST_SUN = "2027-12-26";

const EARLY = new Set([
  "Australia",
  "New Zealand",
  "South Africa",
  "Namibia",
  "Eswatini",
  "Singapore",
  "Malaysia",
  "Japan",
]);

export function isJuniorParkrun(name: string): boolean {
  return /junior/i.test(name);
}

export function parkrunStartTime(country: string, junior = false): string {
  if (junior) return "09:00";
  return EARLY.has(country) ? "08:00" : "09:00";
}

export function parkrunDistance(name: string): { code: string; km: number } {
  return isJuniorParkrun(name) ? { code: "2K", km: 2 } : { code: "5K", km: 5 };
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseIso(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function maxIso(a: string, b: string): string {
  return a > b ? a : b;
}

function minIso(a: string, b: string): string {
  return a < b ? a : b;
}

/** `dow`: 0 Sunday … 6 Saturday (UTC). */
export function weeklyDates(dow: number, from: string, to: string): string[] {
  if (from > to) return [];
  const start = parseIso(from);
  const delta = (dow - start.getUTCDay() + 7) % 7;
  start.setUTCDate(start.getUTCDate() + delta);
  const dates: string[] = [];
  while (iso(start) <= to) {
    dates.push(iso(start));
    start.setUTCDate(start.getUTCDate() + 7);
  }
  return dates;
}

export function parkrunWindow(name: string): { from: string; to: string; dow: number } {
  const junior = isJuniorParkrun(name);
  return junior
    ? { from: PARKRUN_FIRST_SUN, to: PARKRUN_LAST_SUN, dow: 0 }
    : { from: PARKRUN_FIRST_SAT, to: PARKRUN_LAST_SAT, dow: 6 };
}

export function parkrunDates(name: string, from?: string, to?: string): string[] {
  const window = parkrunWindow(name);
  const start = maxIso(from || window.from, window.from);
  const end = minIso(to || window.to, window.to);
  return weeklyDates(window.dow, start, end);
}

export function nextParkrunDate(name: string, from: string): string | null {
  return parkrunDates(name, from)[0] ?? null;
}

export function remainingParkrunCount(name: string, from: string): number {
  return parkrunDates(name, from).length;
}
