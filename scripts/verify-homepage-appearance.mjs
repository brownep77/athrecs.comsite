import assert from "node:assert/strict";
import {
  HOMEPAGE_THEME_IDS,
  HOMEPAGE_THEME_KEY,
  HOMEPAGE_THEMES,
  homepageCardStyle,
  homepageThemeStyle,
  parseHomepageTheme,
  readHomepageTheme,
  saveHomepageTheme,
} from "../src/lib/running/homepage-themes.ts";

// Run with Node 24: node scripts/verify-homepage-appearance.mjs
for (const invalid of [null, undefined, "", "unknown", "constructor", "__proto__", 1, {}]) {
  assert.equal(parseHomepageTheme(invalid), "colourful");
}
assert.equal(readHomepageTheme(), "colourful");
assert.equal(
  readHomepageTheme({
    getItem() {
      throw new Error("blocked");
    },
  }),
  "colourful",
);
assert.equal(saveHomepageTheme(undefined, "midnight"), false);
assert.equal(
  saveHomepageTheme(
    {
      setItem() {
        throw new Error("quota");
      },
    },
    "midnight",
  ),
  false,
);

const preferences = new Map();
const storage = {
  getItem: (key) => preferences.get(key) ?? null,
  setItem: (key, value) => preferences.set(key, value),
};
for (const id of HOMEPAGE_THEME_IDS) {
  assert.equal(saveHomepageTheme(storage, id), true);
  assert.equal(preferences.get(HOMEPAGE_THEME_KEY), id);
  assert.equal(readHomepageTheme(storage), id);
}

const original = {
  background: "linear-gradient(white, pink)",
  color: "#123456",
  borderColor: "#abcdef",
};
assert.deepEqual(homepageThemeStyle("colourful"), {});
assert.deepEqual(homepageCardStyle("colourful", original), original);

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function checkContrast(text, background, label) {
  const [lighter, darker] = [luminance(text), luminance(background)].sort((a, b) => b - a);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  assert.ok(ratio >= 4.5, `${label}: ${ratio.toFixed(2)}:1 needs at least 4.5:1`);
}
for (const id of HOMEPAGE_THEME_IDS.filter((id) => id !== "colourful")) {
  const theme = HOMEPAGE_THEMES[id];
  for (const background of [theme.page, theme.surface, theme.country, theme.soft]) {
    for (const text of [theme.text, theme.muted, theme.brand]) {
      checkContrast(text, background, `${id} content`);
    }
  }
  checkContrast(theme.brandText, theme.brand, `${id} button`);
  theme.tones.forEach((tone, index) => {
    checkContrast(tone.text, tone.background, `${id} card ${index} text`);
    checkContrast(tone.accent, tone.background, `${id} card ${index} link`);
    const card = homepageCardStyle(id, original, "tone", index);
    assert.equal(card.background, tone.background);
    assert.equal(card.color, tone.accent);
    assert.equal(card["--homepage-card-heading"], tone.text);
  });
}
console.log("Homepage appearance: preferences, fallback, reset and palette contrast verified.");
