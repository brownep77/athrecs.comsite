import { hasWithheldCatalogueReference } from "./public-catalogue-content.ts";

/** Results may carry source locators in free-text fields on older imports. */
export function publicResultLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const label = value.trim();
  if (!label || label.length > 160 || hasWithheldCatalogueReference(label)
    || /(?:https?:|www\.|[/\\]|\.(?:csv|xlsx?|pdf|html?)\b)/i.test(label)) return null;
  return label;
}

const providers: Record<string, string> = {
  "totalracetiming.co.uk": "Total Race Timing",
  "chiptiminguk.co.uk": "Chip Timing UK",
  "chiptiming.co.uk": "Chip Timing",
  "stuweb.co.uk": "StuWeb",
  "raceclocker.com": "RaceClocker",
};

/** Derive plain attribution before returning a public response. */
export function resultCredit(sourceUrl: string | null, sourceName: string | null): string | null {
  if (hasWithheldCatalogueReference(sourceUrl) || hasWithheldCatalogueReference(sourceName)) return null;
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
      const provider = providers[url.hostname.toLowerCase().replace(/^www\./, "")];
      if (provider) return provider;
    } catch { return null; }
  }
  const label = publicResultLabel(sourceName);
  return label && !/^(import|manual|scan|api|seed|athlete|official|athrecs results import)$/i.test(label) ? label : null;
}
