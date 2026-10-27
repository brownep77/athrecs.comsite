import { isCompletedHistoryResult, type AchievementResult } from "./profile-history-results.ts";
import { countryFlag } from "./country-flags.ts";
import { eligiblePerformance, performanceGroup } from "./profile-records.ts";
import { isDisqualified } from "./result-details.ts";
import { hasFinishMark } from "./profile-result-presentation.ts";
import { normalizeDistanceCode } from "./distance.ts";
import {
  achievementEvidenceVerified,
  achievementResultVerified,
} from "./achievement-verification.ts";

const DAY = 86_400_000;
const RUNNING_SPORTS = new Set(["running", "athletics", "parkrun"]);

/** Only exact calendar dates can establish a date-window achievement. */
export function resultDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function isCompletedResult(result: AchievementResult, today = new Date()): boolean {
  if (result.details?.syntheticTest || result.details?.profileExcluded) return false;
  if (result.history)
    return (
      !result.conflicting &&
      !isDisqualified(result) &&
      isCompletedHistoryResult(result.history.performance, today)
    );
  const day = resultDay(result.eventDate);
  const partialYear = /^\d{4}$/.test(result.eventDate) ? Number(result.eventDate) : null;
  return (
    ["finished", "fin"].includes(result.status.trim().toLowerCase()) &&
    !isDisqualified(result) &&
    !result.conflicting &&
    (day != null
      ? day <= today.getTime()
      : partialYear != null && partialYear <= today.getUTCFullYear())
  );
}

// Explicit catalogue identities avoid awarding a major for an unrelated city race.
// AbbottWMM rules checked 16 September 2026:
// https://www.worldmarathonmajors.com/six-star/how-it-works
export const MARATHON_MAJORS = [
  { id: "tokyo", name: "Tokyo", slugs: ["tokyo-marathon"], country: "JP", original: true },
  { id: "boston", name: "Boston", slugs: ["boston-marathon"], country: "US", original: true },
  { id: "london", name: "London", slugs: ["london-marathon"], country: "GB", original: true },
  {
    id: "berlin",
    name: "Berlin",
    slugs: ["berlin-marathon", "bmw-berlin-marathon", "wa-bmw-berlin-marathon-7235580"],
    country: "DE",
    original: true,
  },
  { id: "chicago", name: "Chicago", slugs: ["chicago-marathon"], country: "US", original: true },
  {
    id: "new-york",
    name: "New York City",
    slugs: ["new-york-city-marathon"],
    country: "US",
    original: true,
  },
  {
    id: "sydney",
    name: "Sydney",
    slugs: ["sydney-marathon", "wa-tcs-sydney-marathon-presented-by-asics-7235579"],
    country: "AU",
    original: false,
    fromYear: 2025,
  },
  {
    id: "cape-town",
    name: "Cape Town",
    slugs: ["sanlam-cape-town-marathon"],
    country: "ZA",
    original: false,
    fromYear: 2026,
  },
];

export type ProfileAchievement = {
  id: string;
  title: string;
  rule: string;
  results: AchievementResult[];
  calendarYears?: { year: number; verified: boolean }[];
  verified: boolean;
};

/** A known racing year does not require a verification decision or an exact day. */
function recordedCalendarYear(result: AchievementResult, today: Date): number | null {
  const row = result.history?.performance;
  if (
    result.conflicting ||
    result.details?.syntheticTest ||
    result.details?.profileExcluded ||
    isDisqualified(result)
  )
    return null;
  if (
    row &&
    (row.syntheticTest ||
      row.profileExcluded ||
      !hasFinishMark(row.performance, row.place) ||
      /conflicting (?:source|details|result)/i.test(row.notes ?? "") ||
      row.labels.some((label) => /^(?:split|intermediate)(?:\b|:)/i.test(label)))
  )
    return null;
  if (!row && !isCompletedResult(result, today)) return null;
  const date = row?.date ?? result.eventDate;
  if (row?.endDate && (resultDay(row.endDate) == null || resultDay(row.endDate)! > today.getTime()))
    return null;
  if (date && !/^\d{4}$/.test(date)) {
    const day = resultDay(date);
    return day != null && day <= today.getTime() ? Number(date.slice(0, 4)) : null;
  }
  let year = date || row?.yearLabel?.trim() || String(row?.year ?? "");
  if (row?.dateLabel && !date) {
    const labelledYears = [...new Set(row.dateLabel.match(/\b\d{4}\b/g) ?? [])];
    if (labelledYears.length > 1 || /\b\d{4}\s*[/–-]\s*\d{2}\b/.test(row.dateLabel)) return null;
    if (labelledYears.length === 1) {
      if (year && year !== labelledYears[0]) return null;
      year = labelledYears[0];
    }
  }
  // A season such as 2018/2019 cannot establish either individual year.
  if (!/^\d{4}$/.test(year) || Number(year) > today.getUTCFullYear()) return null;
  if (!date && row?.endDate && row.endDate.slice(0, 4) !== year) return null;
  return Number(year);
}

export function resultEvidenceLabel(result: AchievementResult): string {
  if (/athlete|self|manual|user/i.test(result.resultSource ?? "")) return "Athlete-submitted";
  return result.sourceUrls.length ? "Source-linked result" : "Recorded result";
}

function recordedSport(result: AchievementResult): string {
  const sport = result.sport.trim();
  if (sport.toLowerCase() === "athletics" && result.surface !== "Road") return "Athletics";
  return RUNNING_SPORTS.has(sport.toLowerCase()) ? "Running" : sport;
}

export function runningDistanceKind(result: AchievementResult): "marathon" | "ultra" | null {
  if (!RUNNING_SPORTS.has(result.sport.toLowerCase())) return null;
  const code = result.distanceCode.trim().toLowerCase();
  // A rounded marathon is not an ultra; a half/relay is not a full marathon.
  if (/half|relay|multi|stage/.test(code)) return null;
  if (/^(?:full\s+)?marathon$/.test(code))
    return result.distanceKm <= 0 || [42.195, 42.2, 42.19, 42.1].includes(result.distanceKm)
      ? "marathon"
      : null;
  if ([42.195, 42.2, 42.19].includes(result.distanceKm) && !/ultra/.test(code)) return "marathon";
  if (result.distanceKm > 42.195 || /\bultra\b/.test(code)) return "ultra";
  return null;
}

export function buildProfileAchievements(
  results: AchievementResult[],
  today = new Date(),
  options: { includeRecordedYears?: boolean } = {},
) {
  const editions = new Map<string, AchievementResult[]>();
  for (const result of results) {
    const row = result.history?.performance;
    const key = row
      ? JSON.stringify([
          "history",
          row.meeting.trim().toLowerCase(),
          row.venue.trim().toLowerCase(),
          row.date || `${row.yearLabel || row.year}:${row.sourceDate}`,
          normalizeDistanceCode(row.discipline).toLowerCase(),
          row.performance,
          row.place,
        ])
      : result.editionId > 0
        ? `edition:${result.editionId}`
        : JSON.stringify([
            result.eventSlug,
            result.eventDate,
            result.sport,
            normalizeDistanceCode(result.distanceCode),
            result.distanceKm,
            result.surface,
          ]);
    const group = editions.get(key) ?? [];
    group.push(result);
    editions.set(key, group);
  }
  const finishes: AchievementResult[] = [];
  for (const group of editions.values()) {
    // Never hide a conflicting source by selecting whichever row looks like a finish.
    if (group.some((r) => r.conflicting || isDisqualified(r))) continue;
    const outcomes = new Set(
      group.map((r) =>
        JSON.stringify([
          r.status.trim().toLowerCase().replace(/^fin$/, "finished"),
          r.finishTimeSeconds,
          r.distanceKm,
          r.eventDate,
        ]),
      ),
    );
    if (outcomes.size > 1) continue;
    const representative = group.find(achievementResultVerified) ?? group[0];
    if (isCompletedResult(representative, today)) finishes.push(representative);
  }
  const marathons = finishes.filter((r) => runningDistanceKind(r) === "marathon");
  const ultras = finishes.filter((r) => runningDistanceKind(r) === "ultra");
  // Use the same distinct completed results for distance totals, evidence and progress.
  // Completion does not require PB eligibility, a known surface or verification.
  const distanceFinishes = [
    { id: "miles", km: 1.609344, label: "mile race", plural: "mile races" },
    { id: "5K", km: 5, label: "5K finish", plural: "5K finishes" },
    { id: "10K", km: 10, label: "10K finish", plural: "10K finishes" },
    { id: "half-marathons", km: 21.0975, label: "half marathon", plural: "half marathons" },
  ]
    .map(({ km, ...distance }) => {
      const matching = finishes.filter((result) => {
        const row = result.history?.performance;
        const qualifications = [result.distanceCode, row?.discipline, ...(row?.labels ?? [])].join(
          " ",
        );
        return (
          recordedSport(result) === "Running" &&
          [km, Number(km.toFixed(2)), Number(km.toFixed(1))].includes(result.distanceKm) &&
          !/relay|stage|split|intermediate|short[ -]course|\bmulti\b(?![ -]terrain)/i.test(
            qualifications,
          )
        );
      });
      return {
        ...distance,
        results: matching,
        nextTarget:
          [1, 5, 10, 20, 25, 50, 100, 250, 500].find((target) => target > matching.length) ?? null,
      };
    })
    .filter((distance) => distance.results.length > 0);
  const countries = new Map<string, { code: string; name: string; results: AchievementResult[] }>();
  for (const result of finishes) {
    const flag = countryFlag(result.country);
    if (!flag.code) continue;
    const code = flag.code.startsWith("GB-") ? "GB" : flag.code;
    const country = countries.get(code) ?? { code, name: countryFlag(code).name, results: [] };
    country.results.push(result);
    countries.set(code, country);
  }
  const dated = marathons
    .map((result) => ({ result, day: resultDay(result.eventDate) }))
    .filter((r): r is { result: AchievementResult; day: number } => r.day != null)
    .sort((a, b) => a.day - b.day);
  // Seven consecutive calendar dates, inclusive; independent of week/year boundaries.
  let left = 0;
  let bestStart = 0;
  let bestEnd = 0;
  for (let right = 0; right < dated.length; right++) {
    while (dated[right].day - dated[left].day > 6 * DAY) left++;
    if (right - left + 1 > bestEnd - bestStart) {
      bestStart = left;
      bestEnd = right + 1;
    }
  }
  const marathonWeek = dated.slice(bestStart, bestEnd).map((r) => r.result);
  const sports = [...new Set(finishes.map(recordedSport).filter(Boolean))].sort();
  const majors = MARATHON_MAJORS.map((major) => ({
    ...major,
    results: marathons.filter((result) => {
      const code = countryFlag(result.country).code;
      const country = code?.startsWith("GB-") ? "GB" : code;
      const year = recordedCalendarYear(result, today);
      return (
        major.slugs.includes(result.eventSlug) &&
        country === major.country &&
        year != null &&
        (!major.fromYear || year >= major.fromYear) &&
        !/virtual|relay|multi|stage/i.test(
          `${result.eventName} ${result.distanceCode} ${result.surface}`,
        )
      );
    }),
  }));
  const completedMajors = majors.filter((major) => major.results.length);
  const milestones: ProfileAchievement[] = [];
  const add = (id: string, title: string, rule: string, evidence: AchievementResult[]) => {
    if (evidence.length)
      milestones.push({
        id,
        title,
        rule,
        results: evidence,
        verified: achievementEvidenceVerified(evidence),
      });
  };
  const byDate = (list: AchievementResult[]) =>
    [...list].sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.resultId - b.resultId);
  // Any qualifying confirmed witness can verify a country, sport or year.
  const confirmedFirst = (list: AchievementResult[]) =>
    byDate(list).sort(
      (a, b) => Number(achievementResultVerified(b)) - Number(achievementResultVerified(a)),
    );
  // Completion achievements show the current total. Thresholds belong to the
  // separate next-milestone progress cards; otherwise 16 marathons looks stuck at 10.
  const completion = (id: string, list: AchievementResult[], label: string) => {
    if (list.length)
      add(
        id,
        list.length === 1
          ? `First recorded ${label}`
          : `${list.length} ${label}${label === "finish" ? "es" : "s"} completed`,
        `Based on ${list.length} distinct completed events in your linked record.`,
        byDate(list),
      );
  };
  completion("finishes", finishes, "finish");
  completion("marathons", marathons, "marathon");
  completion("ultras", ultras, "ultra");
  for (const { id, label, plural, results: matching } of distanceFinishes) {
    add(
      id,
      matching.length === 1 ? `First recorded ${label}` : `${matching.length} ${plural} completed`,
      `Based on ${matching.length} distinct completed ${matching.length === 1 ? label : plural} in your linked record.`,
      byDate(matching),
    );
  }
  if (countries.size >= 2)
    add(
      "countries",
      `${countries.size} countries raced`,
      "One completed event in each different country; UK home nations count together.",
      [...countries.values()].map((country) => confirmedFirst(country.results)[0]),
    );
  if (completedMajors.length)
    add(
      "majors",
      completedMajors.length === 1
        ? "First marathon major"
        : `${completedMajors.length} marathon majors completed`,
      "Different qualifying major marathons. Repeated finishes of one major count once here.",
      completedMajors.map((major) => confirmedFirst(major.results)[0]),
    );
  const originalSix = majors.filter((major) => major.original);
  if (originalSix.every((major) => major.results.length))
    add(
      "original-six",
      "Original six majors completed",
      "Tokyo, Boston, London, Berlin, Chicago and New York City. This AthRecs achievement does not confirm an official Six Star medal.",
      originalSix.map((major) => confirmedFirst(major.results)[0]),
    );
  if (marathonWeek.length >= 2)
    add(
      "marathon-week",
      "2 marathons in 7 days",
      "Two distinct full marathons within seven consecutive calendar dates.",
      marathonWeek,
    );
  for (let i = 1; i < dated.length; i++) {
    if (dated[i].day - dated[i - 1].day === DAY) {
      add(
        "consecutive-marathons",
        "Consecutive-day marathons",
        "A completed full marathon on each of two consecutive calendar dates.",
        [dated[i - 1].result, dated[i].result],
      );
      break;
    }
  }
  if (sports.length >= 2)
    add(
      "sports",
      `${sports.length} sports completed`,
      "At least one completed result in each sport; track and field count as Athletics, while road running and parkrun count as Running.",
      sports.map((sport) =>
        confirmedFirst(finishes).find((result) => recordedSport(result) === sport)!,
      ),
    );
  const yearResults = options.includeRecordedYears
    ? [
        ...finishes.filter((result) => !result.history),
        ...results.filter((result) => result.history),
      ]
    : finishes;
  const byYear = new Map<number, AchievementResult[]>();
  for (const result of yearResults) {
    const year = recordedCalendarYear(result, today);
    if (year === null) continue;
    const entries = byYear.get(year) ?? [];
    entries.push(result);
    byYear.set(year, entries);
  }
  const verifiedYearResult = achievementResultVerified;
  const calendarYears = [...byYear]
    .sort(([a], [b]) => a - b)
    .map(([year, entries]) => ({
      year,
      verified: entries.some(verifiedYearResult),
    }));
  if (calendarYears.length >= (options.includeRecordedYears ? 1 : 3)) {
    add(
      "years",
      `Raced in ${calendarYears.length} calendar ${calendarYears.length === 1 ? "year" : "years"}`,
      "At least one recorded finish in each year; this does not imply an uninterrupted streak.",
      calendarYears.map(
        ({ year }) => byYear.get(year)!.find(verifiedYearResult) ?? byYear.get(year)![0],
      ),
    );
    milestones[milestones.length - 1].calendarYears = calendarYears;
  }
  const priorBests = new Map<string, AchievementResult>();
  const improvements: AchievementResult[] = [];
  for (const result of byDate(finishes).filter(
    (r) => resultDay(r.eventDate) != null && eligiblePerformance(r),
  )) {
    const key = performanceGroup(result),
      prior = priorBests.get(key);
    if (
      prior &&
      prior.eventDate < result.eventDate &&
      result.finishTimeSeconds! < prior.finishTimeSeconds!
    )
      improvements.push(prior, result);
    if (!prior || result.finishTimeSeconds! < prior.finishTimeSeconds!) priorBests.set(key, result);
  }
  if (improvements.length)
    add(
      "personal-improvement",
      "PB improved",
      "A faster result after an earlier performance in the same sport, distance, surface and timing category.",
      [...new Map(improvements.map((r) => [r.resultId, r])).values()],
    );
  const nextFinishTarget =
    [1, 5, 10, 25, 50, 100, 250, 500].find((target) => target > finishes.length) ?? null;
  return {
    finishes,
    marathons,
    ultras,
    distanceFinishes,
    countries: [...countries.values()].sort((a, b) => a.name.localeCompare(b.name)),
    marathonWeek,
    sports,
    majors,
    completedMajors,
    milestones,
    calendarYears,
    nextFinishTarget,
  };
}
