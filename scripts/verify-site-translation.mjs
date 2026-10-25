import assert from "node:assert/strict";
import {
  TRANSLATION_LANGUAGES,
  matchingTranslationLanguages,
  publicTranslationUrl,
  translatedPageUrl,
} from "../src/lib/athrecs/site-translation.ts";

const expectedLanguages = [
  "en",
  "fr",
  "de",
  "es",
  "it",
  "nl",
  "pl",
  "pt",
  "pt-BR",
  "ar",
  "ja",
  "zh-CN",
  "zh-TW",
  "cs",
  "da",
  "ru",
  "ro",
  "tr",
  "el",
  "hu",
  "sv",
  "no",
  "fi",
  "ko",
  "id",
  "hi",
  "th",
  "af",
];
assert.equal(TRANSLATION_LANGUAGES.length, expectedLanguages.length);
assert.deepEqual(
  new Set(TRANSLATION_LANGUAGES.map(({ code }) => code)),
  new Set(expectedLanguages),
);
for (const path of [
  "/",
  "/running/uk-marathons",
  "/athletes/example-athlete",
  "/news/example-report",
]) {
  for (const { code } of TRANSLATION_LANGUAGES) {
    const destination = new URL(translatedPageUrl(path, code));
    if (code === "en") {
      assert.equal(destination.href, `https://www.athrecs.com${path}`);
    } else {
      assert.equal(destination.origin, "https://translate.google.com");
      assert.equal(destination.searchParams.get("sl"), "en");
      const target = code === "pt" ? "pt-PT" : code === "pt-BR" ? "pt" : code;
      assert.equal(destination.searchParams.get("tl"), target);
      assert.equal(destination.searchParams.get("u"), `https://www.athrecs.com${path}`);
    }
  }
}
assert.equal(publicTranslationUrl("/fr/france"), "https://www.athrecs.com/en/france");
assert.equal(
  publicTranslationUrl("/de/germany/races/sample"),
  "https://www.athrecs.com/en/germany/races/sample",
);
for (const path of [
  "/ADMIN",
  "/Athlete-Account",
  "/JOIN",
  "/admin",
  "/admin/athletes",
  "/api/auth",
  "/auth",
  "/athlete-account",
  "/my-athlete-profile",
  "/athlete-results",
  "/claim-results",
  "/review-results",
  "/test-account",
  "/join",
  "/clubs/account",
  "/clubs/register",
  "/brands/manage",
  "/brands/register",
  "/sportsrecs",
  "/%61dmin/private",
  "/news/../admin",
  "/%2e%2e/admin",
  "/%2561dmin/private",
  "//example.com/",
  "https://example.com",
  "/\\example.com",
  "/%2fexample.com",
  "/?token=secret",
  "/#private",
  "/%3Ftoken=secret",
  "/bad%escape",
  "/%00admin",
]) {
  assert.equal(publicTranslationUrl(path), null, path);
  assert.equal(translatedPageUrl(path, "fr"), null, path);
}
assert.equal(translatedPageUrl("/", "unknown"), null);
assert.equal(translatedPageUrl("/", "__proto__"), null);
for (const [search, expected] of [
  ["  JAPANESE ", ["ja"]],
  ["العربية", ["ar"]],
  ["日本語", ["ja"]],
  ["中文", ["zh-CN", "zh-TW"]],
  ["cestina", ["cs"]],
  ["turkce", ["tr"]],
  ["Portuguese", ["pt", "pt-BR"]],
  ["Brazil", ["pt-BR"]],
  ["pt-BR", ["pt-BR"]],
  ["Cymraeg", []],
  ["Gaeilge", []],
  ["not-a-language", []],
]) {
  assert.deepEqual(
    matchingTranslationLanguages(search).map(({ code }) => code),
    expected,
    search,
  );
}
assert.equal(matchingTranslationLanguages("  ").length, 28);
console.log(
  "Site translation: 28 language choices, regional targets, multilingual search, English originals and public-only URL boundaries verified.",
);
