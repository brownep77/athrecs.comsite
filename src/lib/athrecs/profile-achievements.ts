import type { ProfileResult } from "./profile-records";
import { countryFlag } from "./country-flags.ts";
import { eligiblePerformance, performanceGroup } from "./profile-records.ts";

const DAY = 86_400_000;
const RUNNING_SPORTS = new Set(["running", "athletics", "parkrun"]);

/** Only exact calendar dates can establish a date-window achievement. */
export function resultDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function isCompletedResult(result: ProfileResult, today = new Date()): boolean {
  const day = resultDay(result.eventDate);
  const partialYear = /^\d{4}$/.test(result.eventDate) ? Number(result.eventDate) : null;
  return (
    ["finished", "fin"].includes(result.status.trim().toLowerCase()) &&
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
  results: ProfileResult[];
};

export function resultEvidenceLabel(result: ProfileResult): string {
  if (/athlete|self|manual|user/i.test(result.resultSource ?? "")) return "Athlete-submitted";
  return result.sourceUrls.length ? "Source-linked result" : "Recorded result";
}

function recordedSport(result: ProfileResult): string {
  return RUNNING_SPORTS.has(result.sport.trim().toLowerCase()) ? "Running" : result.sport.trim();
}

export function runningDistanceKind(result: ProfileResult): "marathon" | "ultra" | null {
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

export function buildProfileAchievements(results: ProfileResult[], today = new Date()) {
  const editions = new Map<string, ProfileResult[]>();
  for (const result of results) {
    const key =
      result.editionId > 0
        ? `edition:${result.editionId}`
        : JSON.stringify([result.eventSlug, result.eventDate, result.sport, result.distanceCode]);
    const group = editions.get(key) ?? [];
    group.push(result);
    editions.set(key, group);
  }
  const finishes: ProfileResult[] = [];
  for (const group of editions.values()) {
    // Never hide a conflicting source by selecting whichever row looks like a finish.
    if (group.some((r) => r.conflicting)) continue;
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
    if (isCompletedResult(group[0], today)) finishes.push(group[0]);
  }
  const marathons = finishes.filter((r) => runningDistanceKind(r) === "marathon");
  const ultras = finishes.filter((r) => runningDistanceKind(r) === "ultra");
  const countries = new Map<string, { code: string; name: string; results: ProfileResult[] }>();
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
    .filter((r): r is { result: ProfileResult; day: number } => r.day != null)
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
      const day = resultDay(result.eventDate);
      return (
        major.slugs.includes(result.eventSlug) &&
        country === major.country &&
        day != null &&
        (!major.fromYear || Number(result.eventDate.slice(0, 4)) >= major.fromYear) &&
        !/virtual|relay|multi|stage/i.test(
          `${result.eventName} ${result.distanceCode} ${result.surface}`,
        )
      );
    }),
  }));
  const completedMajors = majors.filter((major) => major.results.length);
  const milestones: ProfileAchievement[] = [];
  const add = (id: string, title: string, rule: string, evidence: ProfileResult[]) => {
    if (evidence.length) milestones.push({ id, title, rule, results: evidence });
  };
  const byDate = (list: ProfileResult[]) =>
    [...list].sort((a, b) => a.eventDate.localeCompare(b.eventDate) || a.resultId - b.resultId);
  const milestone = (id: string, list: ProfileResult[], label: string, levels: number[]) => {
    const target = levels.find((count) => list.length >= count);
    if (target)
      add(
        id,
        target === 1
          ? `First recorded ${label}`
          : `${target} ${label}${label === "finish" ? "es" : "s"} completed`,
        `Based on ${target} distinct completed events in your linked record.`,
        byDate(list).slice(0, target),
      );
  };
  milestone("finishes", finishes, "finish", [500, 250, 100, 50, 25, 10, 5, 1]);
  milestone("marathons", marathons, "marathon", [100, 50, 25, 20, 10, 5, 1]);
  milestone("ultras", ultras, "ultra", [100, 50, 25, 10, 5, 1]);
  for (const [distance, label] of [
    [1.609344, "mile"],
    [5, "5K"],
    [10, "10K"],
    [21.0975, "half marathon"],
  ] as const) {
    const first = byDate(finishes).find(
      (r) =>
        recordedSport(r) === "Running" &&
        [distance, Number(distance.toFixed(2)), Number(distance.toFixed(1))].includes(
          r.distanceKm,
        ) &&
        !/relay|multi|stage/i.test(r.distanceCode),
    );
    if (first)
      add(
        `first-${label}`,
        `First recorded ${label}`,
        "First matching distance in your linked results; earlier unlinked history may exist.",
        [first],
      );
  }
  const countryMilestone = [50, 25, 10, 5, 2].find((n) => countries.size >= n);
  if (countryMilestone)
    add(
      "countries",
      `${countryMilestone} countries raced`,
      "One completed event in each different country; UK home nations count together.",
      [...countries.values()]
        .slice(0, countryMilestone)
        .map((country) => byDate(country.results)[0]),
    );
  if (completedMajors.length)
    add(
      "majors",
      completedMajors.length === 1
        ? "First marathon major"
        : `${completedMajors.length} marathon majors completed`,
      "Different qualifying major marathons. Repeated finishes of one major count once here.",
      completedMajors.map((major) => byDate(major.results)[0]),
    );
  const originalSix = majors.filter((major) => major.original);
  if (originalSix.every((major) => major.results.length))
    add(
      "original-six",
      "Original six majors completed",
      "Tokyo, Boston, London, Berlin, Chicago and New York City. This AthRecs achievement does not confirm an official Six Star medal.",
      originalSix.map((major) => byDate(major.results)[0]),
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
      "At least one completed result in each sport; running, athletics and parkrun are grouped together.",
      sports.map((sport) => byDate(finishes).find((result) => recordedSport(result) === sport)!),
    );
  const years = [...new Set(finishes.map((r) => r.eventDate.slice(0, 4)))].sort();
  if (years.length >= 3)
    add(
      "years",
      `Raced in ${years.length} calendar years`,
      "At least one recorded finish in each year; this does not imply an uninterrupted streak.",
      years.map((year) => byDate(finishes).find((r) => r.eventDate.startsWith(year))!),
    );
  const priorBests = new Map<string, ProfileResult>();
  const improvements: ProfileResult[] = [];
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
      "Personal best improved",
      "A faster result after an earlier performance in the same sport, distance, surface and timing category.",
      [...new Map(improvements.map((r) => [r.resultId, r])).values()],
    );
  const nextFinishTarget =
    [1, 5, 10, 25, 50, 100, 250, 500].find((target) => target > finishes.length) ?? null;
  return {
    finishes,
    marathons,
    ultras,
    countries: [...countries.values()].sort((a, b) => a.name.localeCompare(b.name)),
    marathonWeek,
    sports,
    majors,
    completedMajors,
    milestones,
    nextFinishTarget,
  };
}
