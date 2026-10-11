/** Owner-selected public presentation; stored provenance and verification stay intact. */
export function isWmmSource(provider?: string | null, urls: readonly string[] = []): boolean {
  if (
    /^(?:(?:abbott\s*)?world\s+marathon\s+majors|abbott\s*wmm|wmm)$/i.test(provider?.trim() ?? "")
  )
    return true;
  return urls.some((value) => {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return host === "worldmarathonmajors.com" || host.endsWith(".worldmarathonmajors.com");
    } catch {
      return false;
    }
  });
}

/** Remove provider branding from public notes without losing evidence limitations. */
export function publicProfileResultNotes(
  notes: string | undefined,
  provider?: string | null,
  urls: readonly string[] = [],
): string | undefined {
  if (!notes || !isWmmSource(provider, urls)) return notes;
  return notes
    .replace(/^WMM result [^;]+; athlete [^;]+; bib /i, "Bib ")
    .replace(
      /\b(?:Abbott\s+World\s+Marathon\s+Majors|World\s+Marathon\s+Majors|Abbott\s*WMM|WMM)\b/gi,
      "the source",
    );
}
