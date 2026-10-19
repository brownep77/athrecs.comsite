/** Presentation only: no identity merge, verification upgrade or source deletion. */
export type ResultCandidateIdentity = {
  athleteId?: number;
  name: string;
  date: string;
  distance: string;
  event: string;
  eventSlug?: string;
  performance: string;
  seconds?: number | null;
  bib?: string | null;
  round?: string;
  qualification?: string;
  sources?: readonly string[];
};

const text = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export const resultDistanceKey = (value: string) =>
  /^(?:mile|2 miles)$/i.test(value.trim())
    ? `track:${text(value)}`
    : text(value)
        .replace(/^half(?: marathon)?$/, "half")
        .replace(/^marathon$/, "marathon")
        .replace(/(\d)\s*(?:kilometres|kilometers|km|k)(?: road)?$/, "$1k")
        .replace(/(\d)\s*(?:miles|mile|mi)(?: road)?$/, "$1mi");

/** Retain original marks in the UI; this is only an exact comparison value. */
export function candidateMark(value: string, seconds?: number | null): string | null {
  const mark = value.replace(/\s+/g, "");
  if (/^(?:\d+:)?\d+:[0-5]\d(?:\.\d+)?$/.test(mark) && /[1-9]/.test(mark))
    return `time:${mark.split(":").reduce((sum, part) => sum * 60 + Number(part), 0)}`;
  // Preserve compound/qualified and dotted source notation without assigning a timing basis.
  if (
    mark &&
    /^(?:\d+[.:])*\d+(?:\((?:\d+[.:])*\d+\))?(?:[aiwch]|\(SC\))*$/i.test(mark) &&
    /[1-9]/.test(mark)
  )
    return `mark:${mark.toLowerCase()}`;
  if (!mark && seconds != null && Number.isFinite(seconds) && seconds > 0) return `time:${seconds}`;
  return null;
}

export function sameResultCandidate(
  a: ResultCandidateIdentity,
  b: ResultCandidateIdentity,
): boolean {
  if (a.athleteId && b.athleteId && a.athleteId !== b.athleteId) return false;
  if (!a.name || text(a.name) !== text(b.name)) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date) || a.date !== b.date) return false;
  const sameSource = a.sources?.some((source) => b.sources?.includes(source));
  const distanceA = resultDistanceKey(a.distance),
    distanceB = resultDistanceKey(b.distance);
  // Shared source and explicit event names can join these stored labels without
  // assigning a distance to junior parkrun or changing either original discipline.
  const sameParkrun =
    sameSource &&
    [distanceA, distanceB].every((value) => ["5k", "parkrun"].includes(value)) &&
    [a.event, b.event].every((event) => /\bparkrun\b/i.test(event) && !/\bjunior/i.test(event));
  if (!a.distance || (distanceA !== distanceB && !sameParkrun)) return false;
  const mark = candidateMark(a.performance, a.seconds);
  const otherMark = candidateMark(b.performance, b.seconds);
  // A source-linked plain time and its annotated original describe one suggestion.
  // The caller must retain both original performance strings when grouping them.
  const leadingTime = (value: string) => {
    const leading = value
      .replace(/\s+/g, "")
      .match(/^((?:\d+:)?\d+:[0-5]\d(?:\.\d+)?)(?:[aiwch]|\()/i)?.[1];
    return leading ? candidateMark(leading) : null;
  };
  if (
    !mark ||
    !otherMark ||
    (mark !== otherMark &&
      !(
        sameSource &&
        ((mark.startsWith("time:") && mark === leadingTime(b.performance)) ||
          (otherMark.startsWith("time:") && otherMark === leadingTime(a.performance)))
      ))
  )
    return false;
  if ((a.round ?? "") !== (b.round ?? "") || (a.qualification ?? "") !== (b.qualification ?? ""))
    return false;
  if (a.bib && b.bib && text(a.bib) !== text(b.bib)) return false;
  return Boolean(
    (a.eventSlug && a.eventSlug === b.eventSlug) ||
    (a.event && text(a.event) === text(b.event)) ||
    sameSource,
  );
}

/** Known profiles first. An archive record must match exactly one profile group. */
export function groupResultCandidates<T>(
  rows: readonly T[],
  identity: (row: T) => ResultCandidateIdentity,
): T[][] {
  const groups: T[][] = [];
  const buckets = new Map<string, T[][]>();
  const ordered = [...rows].sort(
    (a, b) => Number(Boolean(identity(b).athleteId)) - Number(Boolean(identity(a).athleteId)),
  );
  for (const row of ordered) {
    const candidate = identity(row);
    const bucketKey = `${text(candidate.name)}|${candidate.date}`;
    const bucket = buckets.get(bucketKey) ?? [];
    // Compare all members: a weak intermediary must not join contradictory records.
    const matches = bucket.filter((group) =>
      group.every((item) => sameResultCandidate(identity(item), candidate)),
    );
    if (matches.length === 1) matches[0].push(row);
    else {
      const group = [row];
      groups.push(group);
      bucket.push(group);
      buckets.set(bucketKey, bucket);
    }
  }
  return groups;
}
