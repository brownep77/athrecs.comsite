/** Public profile credits only; stored provenance and staff evidence stay intact. */
export function isPublicProfileSource(url: string, label = ""): boolean {
  if (/power\s*of\s*(?:10|ten)/i.test(label)) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return !["powerof10.uk", "thepowerof10.info"].some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}
