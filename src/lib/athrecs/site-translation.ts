import { isPrivateAnalyticsPath } from "./web-analytics.ts";

export const TRANSLATION_LANGUAGES = [
  { code: "en", flag: "🇬🇧", label: "English", englishLabel: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français", englishLabel: "French" },
  { code: "de", flag: "🇩🇪", label: "Deutsch", englishLabel: "German" },
  { code: "es", flag: "🇪🇸", label: "Español", englishLabel: "Spanish" },
  { code: "it", flag: "🇮🇹", label: "Italiano", englishLabel: "Italian" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands", englishLabel: "Dutch" },
  { code: "pl", flag: "🇵🇱", label: "Polski", englishLabel: "Polish" },
  { code: "pt", flag: "🇵🇹", label: "Português (Portugal)", englishLabel: "Portuguese (Portugal)" },
  { code: "pt-BR", flag: "🇧🇷", label: "Português (Brasil)", englishLabel: "Portuguese (Brazil)" },
  { code: "ar", flag: "🇸🇦", label: "العربية", englishLabel: "Arabic" },
  { code: "ja", flag: "🇯🇵", label: "日本語", englishLabel: "Japanese" },
  { code: "zh-CN", flag: "🇨🇳", label: "简体中文", englishLabel: "Chinese (Simplified)" },
  { code: "zh-TW", flag: "🇹🇼", label: "繁體中文", englishLabel: "Chinese (Traditional)" },
  { code: "cs", flag: "🇨🇿", label: "Čeština", englishLabel: "Czech" },
  { code: "da", flag: "🇩🇰", label: "Dansk", englishLabel: "Danish" },
  { code: "ru", flag: "🇷🇺", label: "Русский", englishLabel: "Russian" },
  { code: "ro", flag: "🇷🇴", label: "Română", englishLabel: "Romanian" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe", englishLabel: "Turkish" },
  { code: "el", flag: "🇬🇷", label: "Ελληνικά", englishLabel: "Greek" },
  { code: "hu", flag: "🇭🇺", label: "Magyar", englishLabel: "Hungarian" },
  { code: "sv", flag: "🇸🇪", label: "Svenska", englishLabel: "Swedish" },
  { code: "no", flag: "🇳🇴", label: "Norsk", englishLabel: "Norwegian" },
  { code: "fi", flag: "🇫🇮", label: "Suomi", englishLabel: "Finnish" },
  { code: "ko", flag: "🇰🇷", label: "한국어", englishLabel: "Korean" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia", englishLabel: "Indonesian" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी", englishLabel: "Hindi" },
  { code: "th", flag: "🇹🇭", label: "ไทย", englishLabel: "Thai" },
  { code: "af", flag: "🇿🇦", label: "Afrikaans", englishLabel: "Afrikaans" },
] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number]["code"];
const PUBLIC_ORIGIN = "https://www.athrecs.com";
// Keep the existing Portuguese route/chat code while selecting Google's regional targets.
const GOOGLE_LANGUAGE_CODES: Partial<Record<TranslationLanguage, string>> = {
  pt: "pt-PT",
  "pt-BR": "pt",
};

function normalizedLanguageSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function matchingTranslationLanguages(search: string) {
  const query = normalizedLanguageSearch(search);
  return TRANSLATION_LANGUAGES.filter(({ code, label, englishLabel }) =>
    normalizedLanguageSearch(`${code} ${label} ${englishLabel}`).includes(query),
  );
}

export function publicTranslationUrl(pathname: string): string | null {
  try {
    // Only the public pathname is shared: never search terms, auth links or fragments.
    if (!pathname.startsWith("/") || pathname.startsWith("//")) return null;
    const decoded = decodeURIComponent(pathname);
    if (
      decoded.startsWith("//") ||
      /[?#\\%]/.test(decoded) ||
      [...decoded].some((character) => character.charCodeAt(0) <= 0x20)
    )
      return null;
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
  const option = TRANSLATION_LANGUAGES.find(({ code }) => code === language);
  if (!option) return null;
  const original = publicTranslationUrl(pathname);
  if (!original) return null;
  if (language === "en") return original;
  const url = new URL("https://translate.google.com/translate");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", GOOGLE_LANGUAGE_CODES[option.code] ?? option.code);
  url.searchParams.set("u", original);
  return url.href;
}
