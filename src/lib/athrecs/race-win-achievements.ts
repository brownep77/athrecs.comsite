import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import { isCompletedResult, resultDay, resultEvidenceLabel } from "./profile-achievements.ts";

type WinKind = "overall" | "gender" | "category";
export type WinEvidence = {
  event: string;
  date: string;
  sourceUrls: string[];
  evidenceLabel: string;
  performance?: string;
  result?: ProfileResult;
};
export type RaceWinAchievement = {
  id: string;
  distance: string;
  sport: string;
  kind: WinKind;
  label: string;
  results: WinEvidence[];
};
type Distance = { key: string; label: string; km: number };
type Candidate = {
  aliases: string[];
  sport: string;
  distance: Distance;
  eligible: boolean;
  overall: number | null;
  gender: number | null;
  category: number | null;
  genderLabel: string;
  categoryLabel: string;
  evidence: WinEvidence;
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const excludedRace = /\b(?:relay|stage|leg|split|heat|heats|semi[- ]?final|qualif\w*|virtual)\b/i;
const uncertain =
  /\b(?:unverified|uncertain|unresolved|conflict\w*|disputed|club.reported|not independently verified|dnf|dns|dq|dsq|disqualified)\b/i;
const validPlace = (value: number | null | undefined) =>
  value != null && Number.isInteger(value) && value > 0 ? value : null;
const categoryName = (value: string | null | undefined) =>
  !value || /^(?:none|unknown|n\/?a|open|all|not specified|-)$/i.test(value.trim())
    ? ""
    : value.trim().toUpperCase();
const genderName = (value: string | null | undefined) =>
  /^(?:f|female|women|w)$/i.test(value ?? "")
    ? "Women’s race"
    : /^(?:m|male|men)$/i.test(value ?? "")
      ? "Men’s race"
      : "Gender classification";

/** Standard names and exact catalogue roundings only; unknown distances earn no badge. */
function winDistance(code: string, km = 0, triathlonSport = false): Distance | null {
  const name = code.trim().replace(/^(?:men|women|male|female)\s+/i, "");
  if (excludedRace.test(name) || /unknown|tbc|variable/i.test(name)) return null;
  const standard = /^(?:half|half marathon)$/i.test(name)
    ? { key: "half", label: "Half marathon", km: 21.0975 }
    : /^(?:full )?marathon$/i.test(name)
      ? { key: "marathon", label: "Marathon", km: 42.195 }
      : null;
  if (standard)
    return !km || [standard.km, +standard.km.toFixed(1), +standard.km.toFixed(2)].includes(km)
      ? standard
      : null;
  const numeric = name.match(/^(\d+(?:\.\d+)?)\s*(km|k|m|mi|mile|miles)$/i);
  if (numeric) {
    const value = Number(numeric[1]);
    if (!(value > 0)) return null;
    const unit = numeric[2].toLowerCase();
    // Uppercase M can mean miles in road-result imports; do not guess without a numeric distance.
    if (numeric[2] === "M" && !km) return null;
    const miles = unit.startsWith("mi") || (numeric[2] === "M" && km > value);
    const metres = unit === "m" && !miles;
    const exact = value * (miles ? 1.609344 : metres ? 0.001 : 1);
    if (km > 0 && ![exact, +exact.toFixed(1), +exact.toFixed(2), +exact.toFixed(3)].includes(km))
      return null;
    return {
      key: `${metres ? "m" : miles ? "mi" : "km"}:${value}`,
      label: `${value}${metres ? "m" : miles ? (value === 1 ? " mile" : " miles") : "K"}`,
      km: exact,
    };
  }
  const triathlon = name.replace(/^triathlon\s*[-–—:]?\s*/i, "");
  const formats: Record<string, string> = {
    sprint: "Sprint",
    standard: "Standard distance",
    olympic: "Standard distance",
    "middle distance": "Middle distance",
    "70.3": "Middle distance",
    ironman: "IRONMAN",
    "140.6": "IRONMAN",
  };
  if (triathlonSport && formats[triathlon.toLowerCase()])
    return {
      key: normalise(formats[triathlon.toLowerCase()]),
      label: formats[triathlon.toLowerCase()],
      km: 0,
    };
  return km > 0 && Number.isFinite(km) && name
    ? { key: `${normalise(name)}:${km}`, label: name, km }
    : null;
}

function sportName(value: string): string {
  return /^(?:running|athletics)$/i.test(value.trim()) ? "Running" : value.trim();
}

function aliases(evidence: WinEvidence, sport: string, distance: Distance): string[] {
  const prefix = `${evidence.date}|${sport.toLowerCase()}|${distance.key}|`;
  return [
    `${prefix}name:${normalise(evidence.event)}`,
    // Only the primary result source identifies a race; secondary news pages may cover many races.
    ...(evidence.sourceUrls[0] ? [`${prefix}url:${evidence.sourceUrls[0]}`] : []),
    ...(evidence.result?.editionId && evidence.result.editionId > 0
      ? [`edition:${evidence.result.editionId}`]
      : []),
  ];
}

/** Read a named placing, never a number mentioned in narrative text or a PB rank. */
function sourcePlace(
  labels: string[],
  pattern: RegExp,
): { value: number | null; conflict: boolean } {
  const values = [
    ...new Set(
      labels.flatMap((label) => {
        const match = label.match(pattern);
        return match ? [Number(match[1])] : [];
      }),
    ),
  ];
  return { value: values.length === 1 ? validPlace(values[0]) : null, conflict: values.length > 1 };
}

export function buildRaceWinAchievements(
  results: ProfileResult[],
  histories: readonly SourceHistory[] = [],
  sourceGender = "",
  today = new Date(),
): RaceWinAchievement[] {
  const candidates: Candidate[] = [];
  for (const result of results) {
    const distance = winDistance(
      result.distanceCode,
      result.distanceKm,
      /^triathlon$/i.test(result.sport),
    );
    if (!distance) continue;
    const sport = sportName(result.sport);
    const evidence: WinEvidence = {
      event: result.eventName,
      date: result.eventDate,
      sourceUrls: result.sourceUrls,
      evidenceLabel: resultEvidenceLabel(result),
      result,
    };
    candidates.push({
      aliases: aliases(evidence, sport, distance),
      sport,
      distance,
      evidence,
      eligible:
        isCompletedResult(result, today) &&
        !/parkrun/i.test(`${result.sport} ${result.eventName}`) &&
        !excludedRace.test(
          `${result.eventName} ${result.distanceCode} ${result.details?.note ?? ""}`,
        ) &&
        !uncertain.test(result.details?.note ?? ""),
      overall: validPlace(result.overallPlace),
      gender: validPlace(result.genderPlace),
      category: validPlace(result.categoryPlace),
      genderLabel: genderName(result.resultGender),
      categoryLabel: categoryName(result.category),
    });
  }
  for (const history of histories)
    for (const row of history.performances) {
      const distance = winDistance(row.discipline, 0, /^triathlon/i.test(row.discipline));
      if (!distance) continue;
      const sport = /^triathlon/i.test(row.discipline) ? "Triathlon" : "Running";
      const overall = sourcePlace(
        row.labels,
        /^Overall (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
      );
      const gender = sourcePlace(
        row.labels,
        /^Gender (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
      );
      const category = sourcePlace(
        row.labels,
        /^(?:Cat|Category) (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
      );
      const day = resultDay(row.date);
      const evidence: WinEvidence = {
        event: row.meeting,
        date: row.date,
        sourceUrls: row.sourceUrls,
        performance: row.performance,
        evidenceLabel: "Source-history result",
      };
      candidates.push({
        aliases: aliases(evidence, sport, distance),
        sport,
        distance,
        evidence,
        eligible:
          day != null &&
          day <= today.getTime() &&
          row.sourceUrls.length > 0 &&
          !row.disqualification &&
          /^\d+(?::\d{2}){1,2}(?:\.\d+)?$/.test(row.performance.trim()) &&
          /[1-9]/.test(row.performance) &&
          !/parkrun/i.test(row.meeting) &&
          !excludedRace.test(`${row.meeting} ${row.discipline}`) &&
          !row.labels.some((label) =>
            /\b(?:virtual|heat|heats|semi[- ]?final|stage result|relay result)\b/i.test(label),
          ) &&
          !(
            sport !== "Triathlon" &&
            row.labels.some((label) => /\b(?:split|segment|leg)\b/i.test(label))
          ) &&
          !uncertain.test(row.labels.join(" ")) &&
          !overall.conflict &&
          !gender.conflict &&
          !category.conflict,
        // Source "place" can mean a heat or an age-group position. Require a named classification.
        overall: overall.value,
        gender: gender.value,
        category: category.value,
        genderLabel: genderName(sourceGender),
        categoryLabel: categoryName(row.ageGroup),
      });
    }

  const indexed = new Map<string, Set<Candidate>>();
  for (const candidate of candidates) {
    const group = new Set<Candidate>([candidate]);
    for (const alias of candidate.aliases)
      for (const row of indexed.get(alias) ?? []) group.add(row);
    for (const row of group) for (const alias of row.aliases) indexed.set(alias, group);
  }
  const wins = new Map<string, RaceWinAchievement>();
  for (const group of new Set(indexed.values())) {
    const rows = [...group];
    if (rows.some((row) => !row.eligible)) continue;
    const first = rows[0];
    for (const kind of ["overall", "gender", "category"] as const) {
      const places = new Set(rows.map((row) => row[kind]).filter((value) => value != null));
      if (places.size !== 1 || !places.has(1)) continue;
      const labels = new Set(
        rows
          .filter((row) => row[kind] === 1)
          .map((row) =>
            kind === "overall"
              ? "Overall race"
              : kind === "gender"
                ? row.genderLabel
                : row.categoryLabel,
          ),
      );
      if (labels.size !== 1) continue;
      const label = [...labels][0];
      if (!label) continue;
      const id = `${first.sport}|${first.distance.key}|${kind}|${label}`;
      const achievement = wins.get(id) ?? {
        id,
        sport: first.sport,
        distance: first.distance.label,
        kind,
        label: kind === "category" ? `Category · ${label}` : label,
        results: [],
      };
      const evidence = rows.find((row) => row[kind] === 1)!.evidence;
      achievement.results.push({
        ...evidence,
        sourceUrls: [...new Set(rows.flatMap((row) => row.evidence.sourceUrls))],
      });
      wins.set(id, achievement);
    }
  }
  return [...wins.values()].sort(
    (a, b) =>
      a.sport.localeCompare(b.sport) ||
      a.distance.localeCompare(b.distance, undefined, { numeric: true }) ||
      ["overall", "gender", "category"].indexOf(a.kind) -
        ["overall", "gender", "category"].indexOf(b.kind) ||
      a.label.localeCompare(b.label),
  );
}
