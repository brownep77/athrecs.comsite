import type { ProfileResult } from "./profile-records";
import type { SourceHistory } from "./source-performance-history";
import { sourceHistorySports, isCompletedHistoryResult } from "./profile-history-results.ts";
import { isDisqualified } from "./result-details.ts";
import { countryFlag } from "./country-flags.ts";
import { hasHistoryFinish } from "./profile-result-presentation.ts";
import { timingBasis } from "./profile-records.ts";
import { hasTimedMark, timingLabel } from "./performance-timing.ts";

const accepted = new Set(["source_verified", "verified_by_administrator"]);
const naturalList = (values: string[]) =>
  values.length < 2 ? (values[0] ?? "") : `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
const disciplineName = (value: string) =>
  value === "Half"
    ? "half marathon"
    : value.replace(/(\d)K\b/gi, "$1 kilometres").replace(/(\d)mi\b/gi, "$1 miles");

function spokenTime(seconds: number): string {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return naturalList([
    ...(hours ? [`${hours} hour${hours === 1 ? "" : "s"}`] : []),
    ...(minutes ? [`${minutes} minute${minutes === 1 ? "" : "s"}`] : []),
    ...(remainder ? [`${remainder} second${remainder === 1 ? "" : "s"}`] : []),
  ]);
}

/** Generated only from the same privacy-filtered facts rendered on the profile.
 * No remote model, inferred nationality, career claims or invented achievements.
 */
export function athleteSearchContent(
  input: {
    athlete: {
      display_name: string;
      slug: string;
      club?: string | null;
      nationality?: string | null;
    };
    profileResults: readonly ProfileResult[];
    sourceHistories: readonly SourceHistory[];
  },
  today = new Date(),
) {
  const { athlete, profileResults, sourceHistories } = input;
  const sports = [
    ...new Set([
      ...profileResults.filter((r) => !r.details?.profileExcluded).map((r) => r.sport),
      ...sourceHistorySports(sourceHistories),
    ]),
  ]
    .filter(Boolean)
    .sort();
  const role =
    sports.every((s) => ["Running", "Parkrun"].includes(s)) && sports.length
      ? "runner"
      : sports.length === 1 && /cycling/i.test(sports[0])
        ? "cyclist"
        : sports.length === 1 && sports[0] === "Triathlon"
          ? "triathlete"
          : sports.length === 1 && sports[0] === "Swimming"
            ? "swimmer"
            : "athlete";
  const sentences = [
    `${athlete.display_name} is ${role === "athlete" ? "an" : "a"} ${role}${sports.length ? ` with ${naturalList(sports.map((s) => s.toLowerCase()))} results recorded on ATHRECS` : " with a public profile on ATHRECS"}.`,
  ];
  if (athlete.club && !/^(unattached|unknown|tbc)$/i.test(athlete.club.trim()))
    sentences.push(`The club listed on this profile is ${athlete.club}.`);
  if (athlete.nationality) {
    const nationality = /^[A-Z]{2,3}$/i.test(athlete.nationality.trim())
      ? countryFlag(athlete.nationality).name || athlete.nationality
      : athlete.nationality;
    sentences.push(`The recorded nationality is ${nationality}.`);
  }
  const end = today.toISOString().slice(0, 10);
  const dated = (date: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    date <= end &&
    !Number.isNaN(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date;
  const performances = [
    ...profileResults
      .filter(
        (r) =>
          accepted.has(r.details?.verificationStatus ?? "") &&
          !r.details?.profileExcluded &&
          !r.conflicting &&
          !isDisqualified(r) &&
          r.status.toLowerCase() === "finished" &&
          dated(r.eventDate) &&
          r.finishTimeSeconds != null &&
          Number.isFinite(r.finishTimeSeconds) &&
          r.finishTimeSeconds > 0,
      )
      .map((r) => ({
        date: r.eventDate,
        discipline: disciplineName(r.distanceCode),
        event: r.eventName,
        mark: spokenTime(r.finishTimeSeconds!),
        timing:
          timingBasis(r) === "Unknown" ? "timing unknown" : `${timingBasis(r).toLowerCase()} time`,
      })),
    ...sourceHistories.flatMap((h) =>
      h.performances
        .filter(
          (r) =>
            isCompletedHistoryResult(r, today) &&
            hasHistoryFinish(r) &&
            dated(r.date) &&
            r.meeting.trim() &&
            r.performance.trim(),
        )
        .map((r) => ({
          date: r.date,
          discipline: disciplineName(r.discipline),
          event: r.meeting,
          mark: r.performance,
          timing: hasTimedMark(r.performance, r.discipline)
            ? timingLabel(r.timing?.basis ?? "unknown").toLowerCase()
            : "",
        })),
    ),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.event.localeCompare(b.event));
  const disciplines = [...new Set(performances.map((r) => r.discipline))].slice(0, 4);
  if (disciplines.length)
    sentences.push(`Published performances include ${naturalList(disciplines)}.`);
  const latest = performances[0];
  if (latest) {
    const date = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${latest.date}T00:00:00Z`));
    sentences.push(
      `A recorded ${latest.discipline} performance is ${latest.mark}${latest.timing ? ` (${latest.timing})` : ""} at ${latest.event} on ${date}.`,
    );
  }
  const bio = sentences.join(" ");
  const description = bio.length <= 175 ? bio : `${bio.slice(0, 172).replace(/\s+\S*$/, "")}…`;
  const title = `${athlete.display_name} — ${sports.length ? `${naturalList(sports)} results` : "Athlete profile"} | ATHRECS`;
  const url = `https://www.athrecs.com/athletes/${encodeURIComponent(athlete.slug)}`;
  return {
    bio,
    description,
    title,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description: bio,
      inLanguage: "en-GB",
      mainEntity: {
        "@type": "Person",
        "@id": `${url}#athlete`,
        name: athlete.display_name,
        url,
        description: bio,
        ...(athlete.club && !/^(unattached|unknown|tbc)$/i.test(athlete.club.trim())
          ? { memberOf: { "@type": "SportsOrganization", name: athlete.club } }
          : {}),
      },
    },
  };
}
