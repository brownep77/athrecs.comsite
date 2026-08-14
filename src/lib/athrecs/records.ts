/**
 * ATHRECS course/event records helpers.
 * Records are best times from results held on ATHRECS only —
 * not an official course-record claim unless the timer confirms it.
 */

export type RecordRow = {
  scope: "overall" | "category";
  gender: string;
  category: string | null;
  categoryLabel: string;
  isDisability: boolean;
  athleteName: string;
  athleteSlug: string;
  club: string | null;
  finishTimeSeconds: number;
  eventDate: string;
  distanceCode: string | null;
};

/** UK road / track age and open codes → readable label. */
const CATEGORY_LABELS: Record<string, string> = {
  MSEN: "Male Senior",
  FSEN: "Female Senior",
  MS: "Male Senior",
  FS: "Female Senior",
  MO: "Male Open",
  FO: "Female Open",
  MU23: "Male U23",
  FU23: "Female U23",
  MU20: "Male U20",
  FU20: "Female U20",
  MU17: "Male U17",
  FU17: "Female U17",
  MU15: "Male U15",
  FU15: "Female U15",
  JU11: "Junior U11",
  M15: "Male 15–19",
  F15: "Female 15–19",
  M18: "Male 18–39",
  F18: "Female 18–39",
  M35: "Male 35–39",
  F35: "Female 35–39",
  M40: "Male 40–44",
  F40: "Female 40–44",
  M45: "Male 45–49",
  F45: "Female 45–49",
  "F45-49": "Female 45–49",
  M50: "Male 50–54",
  F50: "Female 50–54",
  M55: "Male 55–59",
  F55: "Female 55–59",
  M60: "Male 60–64",
  F60: "Female 60–64",
  M65: "Male 65–69",
  F65: "Female 65–69",
  M70: "Male 70–74",
  F70: "Female 70–74",
  M75: "Male 75–79",
  F75: "Female 75–79",
  M80: "Male 80+",
  F80: "Female 80+",
  MV40: "Male 40+",
  FV40: "Female 40+",
  OPEN: "Open",
  SEN: "Senior",
};

/** Codes / patterns that indicate disability, para or wheelchair categories. */
const DISABILITY_RE =
  /\b(WC|WHEEL|WCH|PARA|PARALYMP|GUIDE|AMBULANT|HANDCYCLE|RACING.?CHAIR|T\d{2}|F\d{2}|SPORTS?\s*CLASS|IMPAIR|DISAB|DEAF|BLIND|VI\b|HI\b)\b/i;

export function isDisabilityCategory(category: string | null | undefined): boolean {
  if (!category) return false;
  return DISABILITY_RE.test(category.trim());
}

export function categoryLabel(category: string | null | undefined): string {
  if (!category || !category.trim()) return "Open / uncategorised";
  const key = category.trim().toUpperCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  // M40-44 style
  const age = key.match(/^([MF])(\d{2})(?:[-–](\d{2}|\+))?$/);
  if (age) {
    const sex = age[1] === "F" ? "Female" : "Male";
    const from = age[2];
    const to = age[3];
    if (!to || to === "+") return `${sex} ${from}+`;
    return `${sex} ${from}–${to}`;
  }
  if (isDisabilityCategory(category)) {
    return `Disability / para · ${category.trim()}`;
  }
  return category.trim();
}

export function genderLabel(gender: string | null | undefined): string {
  switch ((gender || "U").toUpperCase()) {
    case "M":
      return "Male";
    case "F":
      return "Female";
    case "X":
      return "Non-binary / open";
    default:
      return "Open";
  }
}

/** Sort key for age categories so MSEN comes before M40 before M70. */
export function categorySortKey(category: string | null | undefined): string {
  const raw = (category || "ZZZ").toUpperCase();
  if (isDisabilityCategory(raw)) return `9-${raw}`;
  const m = raw.match(/^([MF])(\d{2}|SEN|S|O)/);
  if (m) {
    const sex = m[1] === "F" ? "2" : "1";
    let age = "50";
    if (m[2] === "SEN" || m[2] === "S" || m[2] === "O") age = "18";
    else age = m[2];
    return `${sex}-${age.padStart(2, "0")}-${raw}`;
  }
  return `5-${raw}`;
}

export type EventRecordsBundle = {
  overall: RecordRow[];
  categories: RecordRow[];
  disability: RecordRow[];
  resultCount: number;
  editionCount: number;
};
