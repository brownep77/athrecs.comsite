import assert from "node:assert/strict";
import {
  TRANSLATION_LANGUAGES,
  publicTranslationUrl,
  translatedPageUrl,
} from "../src/lib/athrecs/site-translation.ts";

assert.equal(TRANSLATION_LANGUAGES.length, 8);
assert.equal(new Set(TRANSLATION_LANGUAGES.map(({ code }) => code)).size, 8);
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
      assert.equal(destination.searchParams.get("tl"), code);
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
console.log(
  "Site translation: eight language destinations, English originals and public-only URL boundaries verified.",
);
