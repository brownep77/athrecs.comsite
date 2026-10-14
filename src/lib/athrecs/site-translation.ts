import { isPrivateAnalyticsPath } from "./web-analytics.ts";

export const TRANSLATION_LANGUAGES = [
  { code: "en", label: "English", englishLabel: "English" },
  { code: "fr", label: "Français", englishLabel: "French" },
  { code: "de", label: "Deutsch", englishLabel: "German" },
  { code: "es", label: "Español", englishLabel: "Spanish" },
  { code: "it", label: "Italiano", englishLabel: "Italian" },
  { code: "nl", label: "Nederlands", englishLabel: "Dutch" },
  { code: "pl", label: "Polski", englishLabel: "Polish" },
  { code: "pt", label: "Português", englishLabel: "Portuguese" },
] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number]["code"];
const PUBLIC_ORIGIN = "https://www.athrecs.com";

export function publicTranslationUrl(pathname: string): string | null {
  try {
    // Only the public pathname is shared: never search terms, auth links or fragments.
    if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
    const decoded = decodeURIComponent(pathname);
    if (
      decoded.startsWith("//") ||
      /[?#\\%]/.test(decoded) ||
      [...decoded].some((character) => character.charCodeAt(0) <= 0x20)
    ) return null;
    const url = new URL(decoded, PUBLIC_ORIGIN);
    if (url.origin !== PUBLIC_ORIGIN) return null;
    const path = decodeURIComponent(url.pathname);
    const lowerPath = path.toLowerCase();
    if (
      isPrivateAnalyticsPath(lowerPath) ||
      lowerPath === "/join" ||
      lowerPath.startsWith("/join/")
    )
      return null;
    // Existing country pages have an English original under /en/<country>.
    const segments = url.pathname.split("/");
    if (segments.length >= 3 && TRANSLATION_LANGUAGES.some(({ code }) => code === segments[1])) {
      segments[1] = "en";
      url.pathname = segments.join("/");
    }
    return url.href;
  } catch {
    return null;
  }
}

export function translatedPageUrl(pathname: string, language: string): string | null {
  if (!TRANSLATION_LANGUAGES.some(({ code }) => code === language)) return null;
  const original = publicTranslationUrl(pathname);
  if (!original) return null;
  if (language === "en") return original;
  const url = new URL("https://translate.google.com/translate");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", language);
  url.searchParams.set("u", original);
  return url.href;
}
