/** Public attribution only: never expose private ingestion notes or file names. */
export function resultCredit(sourceUrl: string | null, sourceName: string | null) {
  if (!sourceUrl) return null;
  let url: URL;
  try { url = new URL(sourceUrl); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const providers: Record<string, string> = {
    "totalracetiming.co.uk": "Total Race Timing",
    "chiptiminguk.co.uk": "Chip Timing UK",
    "chiptiming.co.uk": "Chip Timing",
    "stuweb.co.uk": "StuWeb",
    "raceclocker.com": "RaceClocker",
  };
  const name = sourceName?.trim();
  const label = providers[host] || (name && !/^(import|manual|scan|api|seed|official|athrecs results import)$/i.test(name) ? name : host);
  return { name: label, url: url.href };
}
