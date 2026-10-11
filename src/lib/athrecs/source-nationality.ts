export type SourceNationality = { value: string; provider: string; sourceUrl: string };

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}
function observation(
  value: unknown,
  provider: unknown,
  sourceUrl: unknown,
): SourceNationality | null {
  const nationality = text(value, 100);
  const name = text(provider, 160);
  const url = text(sourceUrl, 2000);
  if (!nationality || /^(?:unknown|unspecified|n\/?a|none|null|[-?]+)$/i.test(nationality) || !name)
    return null;
  try {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password)
      return null;
  } catch {
    return null;
  }
  return { value: nationality, provider: name, sourceUrl: url };
}

/** Source-reported sporting nationality, never residence or independent identity verification. */
export function readSourceNationality(value: unknown): SourceNationality | null {
  const details = record(value);
  if (text(details.nationality, 100)) return null;
  const supplied = record(details.sourceNationalityObservation);
  if (Object.keys(supplied).length)
    return observation(supplied.value, supplied.provider, supplied.sourceUrl);
  // Earlier reviewed WMM imports keep the observation in the ranking metadata.
  const wmm = record(details.worldMarathonMajors);
  const archive = record(details.archiveCreation);
  if (
    archive.sourceRowsCompared === true &&
    archive.candidateId === wmm.athleteId &&
    typeof wmm.athleteId === "string" &&
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(wmm.athleteId) &&
    wmm.sourceUrl === "https://www.worldmarathonmajors.com/rankings/world-rankings"
  ) {
    return observation(wmm.nationality, "Abbott World Marathon Majors", wmm.sourceUrl);
  }
  const duv = record(details.duvSourceObservation);
  const identities = Array.isArray(details.sourceIdentities) ? details.sourceIdentities : [];
  for (const identity of identities) {
    const source = record(identity);
    const url = text(source.sourceUrl, 2000);
    const match = /^https:\/\/statistik\.d-u-v\.org\/getresultperson\.php\?runner=(\d+)$/.exec(url);
    if (match && String(source.externalId) === match[1])
      return observation(duv.nationality, "DUV", url);
  }
  return null;
}
