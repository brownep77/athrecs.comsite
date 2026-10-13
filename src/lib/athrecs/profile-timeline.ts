import type { ProfileResult } from "./profile-records";
import type { SourceHistory, SourcePerformance } from "./source-performance-history";
import { sourceHistorySports, type HistoryResult } from "./profile-history-results.ts";
import { isWmmSource, publicProfileResultNotes } from "./profile-source-presentation.ts";
import { hasHistoryFinish, resultVerification } from "./profile-result-presentation.ts";
import { competitionRound } from "./competition-awards.ts";

const normal = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export function profileDisciplineLabel(value: string): string {
  if (/^mile$/i.test(value.trim())) return "Mile";
  if (/^2 miles$/i.test(value.trim())) return "2 miles";
  return value
    .trim()
    .replace(/^mile road$/i, "1mi")
    .replace(/^Half$/i, "Half marathon")
    .replace(/^Half Marathon$/i, "Half marathon")
    .replace(/\s*(?:kilometres|kilometers|km)(?: road)?$/i, "K")
    .replace(/\s*(?:miles?|mi)(?: road)?$/i, "mi")
    .replace(/^([\d,]+)\s+metres$/i, "$1m");
}

/** Road and track distances must never collapse into the same performance. */
function discipline(value: string, mark = ""): string {
  if (/^(?:mile|2 miles)$/i.test(value.trim())) return `track:${normal(value)}`;
  const short = /short course|\(sc\)/i.test(`${value} ${mark}`);
  const code = normal(value)
    .replace(/\s*\(short course\)/g, "")
    .replace(/^half(?: marathon)?$/, "half")
    .replace(/\s*(?:kilometres|kilometers|km)(?: road)?$/, "k")
    .replace(/\s*(?:miles?|mi)(?: road)?$/, "mi");
  return `${code}${short ? " (short course)" : ""}`;
}

function seconds(mark: string): number | null {
  const plain = mark.replace(/\s*\(SC\)$/i, "");
  if (!/^\d+:\d{2}(?::\d{2})?(?:\.\d+)?$/.test(plain)) return null;
  return plain.split(":").reduce((sum, part) => sum * 60 + Number(part), 0);
}

function sameSource(a: readonly string[], b: readonly string[]): boolean {
  const key = (url: string) => {
    const wa = url.match(
      /^https:\/\/worldathletics\.org\/athletes\/(?:.*-|athlete=)(\d+)(?:[/?#]|$)/,
    );
    return wa ? `world-athletics:${wa[1]}` : url;
  };
  const keys = new Set(b.map(key));
  return a.some((url) => keys.has(key(url)));
}

function sameRound(a: SourcePerformance, b: SourcePerformance): boolean {
  const round = (row: SourcePerformance) => row.labels.find((label) => /^round:/i.test(label));
  return !round(a) || !round(b) || normal(round(a)!) === normal(round(b)!);
}

const notes = (...values: (string | undefined)[]) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].join("\n\n") || undefined;

/**
 * One display timeline. Stored evidence, verification, PBs and achievement inputs
 * stay untouched. Only exact, dated marks with an event/source match collapse.
 */
export function buildProfileTimeline(
  recorded: readonly ProfileResult[],
  histories: readonly SourceHistory[],
): { results: ProfileResult[]; history: HistoryResult[]; count: number } {
  const results: ProfileResult[] = recorded
    .filter((r) => !r.details?.profileExcluded)
    .map((r) => ({
      ...r,
      sourceUrls: [...r.sourceUrls],
      details: { ...r.details },
    }));
  const history: HistoryResult[] = [];
  const sourcePlaces = new Map<ProfileResult, { priority: number; places: Set<string> }>();
  for (const source of histories) {
    for (const [index, original] of source.performances.entries()) {
      if (original.profileExcluded) continue;
      const row = { ...original, providerName: original.providerName || source.provider };
      const known = results.find(
        (r) =>
          row.date &&
          r.eventDate === row.date &&
          discipline(r.distanceCode) === discipline(row.discipline, row.performance) &&
          JSON.stringify(r.details?.disqualification) === JSON.stringify(row.disqualification) &&
          ((seconds(row.performance) === r.finishTimeSeconds && r.finishTimeSeconds !== null) ||
            (r.finishTimeSeconds === null && normal(r.status) === normal(row.performance))) &&
          ((row.eventSlug === r.eventSlug && Boolean(row.eventSlug)) ||
            normal(row.meeting) === normal(r.eventName) ||
            sameSource(row.sourceKeys ?? row.sourceUrls, r.sourceKeys ?? r.sourceUrls)),
      );
      if (known) {
        known.details ??= {};
        const sourceRound = row.labels.some((label) => /^round:/i.test(label))
          ? competitionRound(row.labels)
          : undefined;
        if (sourceRound && resultVerification(row.verificationStatus, row.providerName).verified)
          known.displayRound =
            known.displayRound && known.displayRound !== sourceRound ? "conflicting" : sourceRound;
        known.sourceUrls = [
          ...new Set([
            ...known.sourceUrls,
            ...row.sourceUrls.filter((url) => !isWmmSource(null, [url])),
          ]),
        ];
        if (known.sourceKeys || row.sourceKeys)
          known.sourceKeys = [...new Set([...(known.sourceKeys ?? []), ...(row.sourceKeys ?? [])])];
        known.details.note = notes(
          known.details.note,
          publicProfileResultNotes(row.notes, row.providerName, row.sourceUrls),
        );
        // Keep the original classification untouched. An accepted source's explicit
        // overall place may decorate this merged row, with its provenance in evidence.
        if (known.overallPlace === null && row.place)
          known.details.note = notes(
            known.details.note,
            `${isWmmSource(row.providerName, row.sourceUrls) ? "Source result" : row.providerName}: place ${row.place}.`,
          );
        const supplied = row.places ? String(row.places.overall ?? "") : row.place;
        const place = supplied.match(/^([1-9]\d*(?:=|[AB])?)(?:\/(?:[1-9]\d*)?){0,2}$/)?.[1];
        if (
          known.overallPlace === null &&
          !known.conflicting &&
          place &&
          hasHistoryFinish(row) &&
          resultVerification(row.verificationStatus, row.providerName).verified
        ) {
          const priority = /^world\s*athletics$/i.test(row.providerName.trim()) ? 2 : 1;
          const existing = sourcePlaces.get(known);
          if (!existing || priority > existing.priority)
            sourcePlaces.set(known, { priority, places: new Set([place]) });
          else if (priority === existing.priority) existing.places.add(place);
        }
        continue;
      }
      const duplicate = history.find(
        ({ performance: p }) =>
          row.date &&
          p.date === row.date &&
          discipline(p.discipline, p.performance) === discipline(row.discipline, row.performance) &&
          p.performance === row.performance &&
          p.wind === row.wind &&
          p.place === row.place &&
          sameRound(p, row) &&
          JSON.stringify(p.disqualification) === JSON.stringify(row.disqualification) &&
          (normal(p.meeting) === normal(row.meeting) ||
            sameSource(p.sourceKeys ?? p.sourceUrls, row.sourceKeys ?? row.sourceUrls)),
      );
      if (duplicate) {
        duplicate.performance = {
          ...duplicate.performance,
          sourceUrls: [...new Set([...duplicate.performance.sourceUrls, ...row.sourceUrls])],
          ...(duplicate.performance.sourceKeys || row.sourceKeys
            ? {
                sourceKeys: [
                  ...new Set([
                    ...(duplicate.performance.sourceKeys ?? []),
                    ...(row.sourceKeys ?? []),
                  ]),
                ],
              }
            : {}),
          notes: notes(duplicate.performance.notes, row.notes),
        };
      } else {
        history.push({
          key: `${source.provider}:${source.externalId}:${index}`,
          sport: sourceHistorySports([{ ...source, performances: [row] }])[0] ?? "Unclassified",
          performance: row,
        });
      }
    }
  }
  for (const [result, candidates] of sourcePlaces) {
    if (candidates.places.size === 1) result.displayOverallPlace = [...candidates.places][0];
  }
  return { results, history, count: results.length + history.length };
}
