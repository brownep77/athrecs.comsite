/** Identify results in mixed reference lists. Dedicated result fields are always private. */
export function isResultDocument(value?: string | null, label = ""): boolean {
  if (!value || !/^https?:\/\//i.test(value)) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase();
  if (/(?:^|\.)(?:athrecs|runrecs)\.com$/.test(host)) return false;
  const path = url.pathname.toLowerCase();
  // Athletics SA posts the meeting timetable alongside the live result service.
  if (host === "liveresults.com.au" && /^\/\d+\/groups\.html$/.test(path)) return false;
  if (
    /(^|\.)worldathletics\.org$/.test(host) &&
    /^\/competition\/calendar-results(?:\/calendar(?:\/|$)|\/?$)/.test(path)
  )
    return false;
  if (/(?:^|\.)(?:(?:live|race)?results?|rankings)\./.test(host)) return true;
  if (/(?:^|\.)(?:rtrt\.me|marathonview\.net|sporthive\.com)$/.test(host)) return true;
  if (
    /(?:^|\.)(?:webscorer\.com|stuweb\.co\.uk|sportsplits\.com)$/.test(host) &&
    /^\/(?:race(?:s|details)?|results?)(?:\/|$)/.test(path)
  )
    return true;
  if (
    /(?:^|[/_.-])(?:[a-z0-9_-]*results?|resultats?|resultados?|ergebnisse|klassement|classements?|rankings?|standings|leaderboards?)(?:[/_.\d-]|$)/.test(
      path,
    ) ||
    Array.from(url.searchParams.keys()).some((key) => /^results?$/i.test(key))
  )
    return true;
  return (
    /\b(?:results?|leaderboard|standings|finish order|finisher list|chip timing)\b/i.test(label) &&
    !/\b(?:ballot|entry|registration|claim form|guidance|news report)\b/i.test(label)
  );
}
