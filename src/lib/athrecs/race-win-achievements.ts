import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import { isCompletedResult, resultDay, resultEvidenceLabel } from "./profile-achievements.ts";
import { historicalDistance, historicalTime } from "./history-performance.ts";
import { hasFinishMark, resultVerification } from "./profile-result-presentation.ts";
import { sourceHistorySport } from "./source-history-sport.ts";

type WinKind = "overall" | "gender" | "category";
export type WinEvidence = {
  event: string;
  date: string;
  sourceUrls: string[];
  evidenceLabel: string;
  verified: boolean;
  sourceKeys?: string[];
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
  mark: string;
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const excludedRace = /\b(?:relay|stage|leg|split|heat|heats|semi[- ]?final|qualif\w*|virtual)\b/i;
const uncertain = /\b(?:uncertain|unresolved|conflict\w*|disputed|dnf|dns|dq|dsq|disqualified)\b/i;
const nonFinalRound =
  /\b(?:heat|heats|semi[- ]?final|qualif\w*|prelim\w*|section)\b|^(?:Round:\s*)?(?:h|sf|q)\d*$/i;
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

function sportName(value: string, surface = ""): string {
  return /^athletics$/i.test(value.trim()) && /^road$/i.test(surface) ? "Running" : value.trim();
}

function aliases(evidence: WinEvidence, sport: string, distance: Distance): string[] {
  const prefix = `${evidence.date}|${sport.toLowerCase()}|${distance.key}|`;
  return [
    `${prefix}name:${normalise(evidence.event)}`,
    // Only the primary result source identifies a race; secondary news pages may cover many races.
    ...(evidence.sourceKeys?.length
      ? [`${prefix}source:${evidence.sourceKeys[0]}`]
      : evidence.sourceUrls[0] && !/worldathletics\.org\/athletes\//i.test(evidence.sourceUrls[0])
        ? [`${prefix}url:${evidence.sourceUrls[0]}`]
        : []),
    ...(evidence.result?.editionId && evidence.result.editionId > 0
      ? [`${prefix}edition:${evidence.result.editionId}`]
      : []),
  ];
}

/** Read a named placing, never a number mentioned in narrative text or a PB rank. */
function sourcePlace(
  labels: string[],
  pattern: RegExp,
  explicit?: number | null,
): { value: number | null; conflict: boolean } {
  const values = [
    ...new Set([
      ...(validPlace(explicit) != null ? [explicit!] : []),
      ...labels.flatMap((label) => {
        const match = label.match(pattern);
        return match ? [Number(match[1])] : [];
      }),
    ]),
  ];
  return { value: values.length === 1 ? validPlace(values[0]) : null, conflict: values.length > 1 };
}

export function buildRaceWinAchievements(
  results: readonly ProfileResult[],
  histories: readonly SourceHistory[] = [],
  sourceGender = "",
  today = new Date(),
): RaceWinAchievement[] {
  const candidates: Candidate[] = [];
  for (const result of results) {
    const sport = sportName(result.sport, result.surface);
    const distance = winDistance(
      historicalDistance(result.distanceCode, sport).code,
      result.distanceKm,
      /^(?:triathlon|duathlon|aquathlon|aquabike)$/i.test(sport),
    );
    if (!distance) continue;
    const evidence: WinEvidence = {
      event: result.eventName,
      date: result.eventDate,
      sourceUrls: result.sourceUrls,
      evidenceLabel: resultEvidenceLabel(result),
      result,
      verified: resultVerification(
        result.details?.verificationStatus,
        result.resultSource,
        result.conflicting,
      ).verified,
      sourceKeys: /^world\s*athletics$/i.test(result.resultSource ?? "")
        ? undefined
        : result.sourceKeys,
    };
    candidates.push({
      aliases: aliases(evidence, sport, distance),
      sport,
      distance,
      evidence,
      mark: String(result.finishTimeSeconds ?? result.status),
      eligible:
        isCompletedResult(result, today) &&
        !result.details?.profileExcluded &&
        !/parkrun/i.test(`${result.sport} ${result.eventName}`) &&
        !nonFinalRound.test(result.displayRound ?? "") &&
        !excludedRace.test(
          `${result.eventName} ${result.distanceCode} ${result.displayRound ?? ""}`,
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
      if (row.profileExcluded || row.syntheticTest) continue;
      const sport = sourceHistorySport(row.discipline, history.provider, row.meeting);
      if (!sport || sport === "Parkrun") continue;
      const code = row.discipline
        .replace(
          /^(?:triathlon|duathlon|aquathlon|aquabike|cycling|swimming|swim|rowing)\s*[-–—:]?\s+/i,
          "",
        )
        .replace(/\s+(?:road|track|cross[ -]country|trail)$/i, "");
      const suppliedDistance = historicalDistance(code, sport);
      const distance = winDistance(
        suppliedDistance.code,
        suppliedDistance.km,
        /^(?:triathlon|duathlon|aquathlon|aquabike)$/i.test(sport),
      );
      if (!distance) continue;
      const overall = sourcePlace(
        row.labels,
        /^Overall (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
        row.places?.overall,
      );
      const gender = sourcePlace(
        row.labels,
        /^Gender (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
        row.places?.gender,
      );
      const category = sourcePlace(
        row.labels,
        /^(?:Cat|Category) (?:Pos|Position):\s*(\d+)(?:\s*\([^)]*\))?$/i,
        row.places?.category,
      );
      const day = resultDay(row.date);
      const years = (row.yearLabel || String(row.year)).match(/\b\d{4}\b/g)?.map(Number) ?? [];
      const dated = row.date
        ? day != null && day <= today.getTime()
        : years.length > 0 && Math.max(...years) <= today.getUTCFullYear();
      const finalRound = row.labels.some((label) => /^Round:\s*(?:final|finals|f)$/i.test(label));
      const nonFinal = row.labels.some((label) => nonFinalRound.test(label));
      const evidence: WinEvidence = {
        event: row.meeting,
        date: row.date || row.dateLabel || row.yearLabel || String(row.year),
        sourceUrls: row.sourceUrls,
        performance: row.performance,
        evidenceLabel: "Source-history result",
        verified: resultVerification(row.verificationStatus, row.providerName || history.provider)
          .verified,
        sourceKeys: /^world\s*athletics$/i.test(row.providerName || history.provider)
          ? undefined
          : row.sourceKeys,
      };
      candidates.push({
        aliases: aliases(evidence, sport, distance),
        sport,
        distance,
        evidence,
        mark: String(historicalTime(row.performance) ?? row.performance),
        eligible:
          dated &&
          (!row.endDate ||
            (resultDay(row.endDate) != null && resultDay(row.endDate)! <= today.getTime())) &&
          (row.sourceUrls.length > 0 || (row.sourceKeys?.length ?? 0) > 0) &&
          !row.disqualification &&
          hasFinishMark(row.performance, row.place) &&
          !/parkrun/i.test(row.meeting) &&
          !excludedRace.test(`${row.meeting} ${row.discipline}`) &&
          (!nonFinal || finalRound) &&
          !row.labels.some((label) => /\b(?:virtual|stage result|relay result)\b/i.test(label)) &&
          !(
            sport !== "Triathlon" &&
            row.labels.some((label) => /\b(?:split|segment|leg)\b/i.test(label))
          ) &&
          !uncertain.test(row.labels.join(" ")) &&
          !/conflicting (?:source|details|result)|disputed placing/i.test(row.notes ?? "") &&
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
    if (new Set(rows.map((row) => row.mark)).size !== 1) continue;
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
        verified: rows.some((row) => row[kind] === 1 && row.evidence.verified),
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
