export type AthleteBioResult = {
  resultId: number;
  eventName: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
};

export type AthleteBioSource = {
  displayName: string;
  primarySport: string;
  city: string;
  region: string;
  country: string;
  clubOrTeam: string;
  results: AthleteBioResult[];
};

export function buildGeneratedAthleteBio(source: AthleteBioSource): string {
  const name = source.displayName.trim() || "This athlete";
  const role = roleForSport(source.primarySport);
  const location = joinLocation(source.city, source.region, source.country);
  const club = source.clubOrTeam.trim();
  const results = [...source.results].sort(
    (a, b) => b.eventDate.localeCompare(a.eventDate) || b.resultId - a.resultId,
  );

  const introductionParts = [`${name} is ${articleFor(role)} ${role}`];
  if (location) introductionParts.push(`based in ${location}`);
  if (club) introductionParts.push(`affiliated with ${club}`);

  const sentences = [`${joinWithAnd(introductionParts)}.`];

  if (results.length === 0) {
    sentences.push(
      "Their private ATHRECS record will update automatically as results are uploaded and linked to their athlete identity.",
    );
    return sentences.join(" ");
  }

  const eventCount = new Set(results.map((result) => `${result.eventName}|${result.eventDate}`)).size;
  const distances = uniqueDistances(results);
  const distanceSummary = summarizeList(distances, 5);
  sentences.push(
    `Their private ATHRECS record currently contains ${results.length} claimed ${plural("result", results.length)} from ${eventCount} ${plural("event", eventCount)}${distanceSummary ? `, covering ${distanceSummary}` : ""}.`,
  );

  const latest = results[0];
  const latestDetails = [
    `Their latest recorded performance is at ${latest.eventName}`,
    `on ${formatDate(latest.eventDate)}`,
    latest.distanceCode ? `over ${displayDistance(latest.distanceCode)}` : "",
    latest.finishTimeSeconds != null ? `completed in ${formatDuration(latest.finishTimeSeconds)}` : "",
  ].filter(Boolean);
  sentences.push(`${latestDetails.join(", ")}.`);

  const fastest = fastestByDistance(results).slice(0, 3);
  if (fastest.length) {
    const performances = fastest.map(
      (result) =>
        `${displayDistance(result.distanceCode)} in ${formatDuration(result.finishTimeSeconds as number)}`,
    );
    sentences.push(
      `Fastest claimed performances currently include ${joinNatural(performances)}.`,
    );
  }

  return sentences.join(" ");
}

function roleForSport(value: string): string {
  const sport = value.trim().toLowerCase();
  const roles: Record<string, string> = {
    running: "runner",
    athletics: "athlete",
    "trail running": "trail runner",
    "ultra running": "ultrarunner",
    parkrun: "parkrunner",
    triathlon: "triathlete",
    duathlon: "duathlete",
    aquathlon: "aquathlete",
    cycling: "cyclist",
    swimming: "swimmer",
    rowing: "rower",
    ocr: "obstacle-course athlete",
    "gym and fitness": "fitness athlete",
    "walking and hiking": "walker and hiker",
    "yoga and mobility": "yoga and mobility practitioner",
  };
  return roles[sport] ?? "athlete";
}

function articleFor(value: string): string {
  return /^[aeiou]/i.test(value) ? "an" : "a";
}

function joinLocation(...parts: string[]): string {
  const seen = new Set<string>();
  const values: string[] = [];
  for (const part of parts) {
    const value = part.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    values.push(value);
  }
  return values.join(", ");
}

function joinWithAnd(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

function plural(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function displayDistance(value: string): string {
  const normalized = value.toLowerCase().replaceAll(" ", "");
  const known: Record<string, string> = {
    "1mile": "1 mile",
    "5k": "5K",
    "5km": "5K",
    "5mile": "5 miles",
    "10k": "10K",
    "10km": "10K",
    "10mile": "10 miles",
    "halfmarathon": "Half Marathon",
    "21.1k": "Half Marathon",
    "21.1km": "Half Marathon",
    marathon: "Marathon",
  };
  return known[normalized] ?? value.trim();
}

function distanceRank(value: string): number {
  const normalized = value.toLowerCase().replaceAll(" ", "");
  const known: Record<string, number> = {
    "1mile": 1,
    "5k": 2,
    "5km": 2,
    "5mile": 3,
    "10k": 4,
    "10km": 4,
    "10mile": 5,
    "halfmarathon": 6,
    "21.1k": 6,
    "21.1km": 6,
    marathon: 7,
  };
  return known[normalized] ?? 100;
}

function uniqueDistances(results: AthleteBioResult[]): string[] {
  const values = new Map<string, string>();
  for (const result of results) {
    const label = displayDistance(result.distanceCode);
    if (label) values.set(label.toLowerCase(), label);
  }
  return [...values.values()].sort(
    (a, b) => distanceRank(a) - distanceRank(b) || a.localeCompare(b),
  );
}

function summarizeList(values: string[], visibleLimit: number): string {
  if (values.length <= visibleLimit) return joinNatural(values);
  const visible = values.slice(0, visibleLimit - 1);
  const remaining = values.length - visible.length;
  return `${joinNatural(visible)} and ${remaining} other ${plural("distance", remaining)}`;
}

function joinNatural(values: string[]): string {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function fastestByDistance(results: AthleteBioResult[]): AthleteBioResult[] {
  const best = new Map<string, AthleteBioResult>();
  for (const result of results) {
    if (result.finishTimeSeconds == null || result.finishTimeSeconds < 1) continue;
    const key = displayDistance(result.distanceCode).toLowerCase();
    const current = best.get(key);
    if (
      !current ||
      current.finishTimeSeconds == null ||
      result.finishTimeSeconds < current.finishTimeSeconds
    ) {
      best.set(key, result);
    }
  }
  return [...best.values()].sort(
    (a, b) =>
      distanceRank(a.distanceCode) - distanceRank(b.distanceCode) ||
      a.distanceCode.localeCompare(b.distanceCode),
  );
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
