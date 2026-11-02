import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import {
  countryFlag,
  countryFlagImageCode,
  countryAbbreviation,
} from "../src/lib/athrecs/country-flags.ts";
import {
  resolveCountry,
  countryMatchesFilter,
  flagForCountryFilter,
} from "../src/lib/athrecs/countries.ts";

const nations = [
  ["England", "ENG", ["English", "ENG", "GB-ENG"]],
  ["Scotland", "SCO", ["Scottish", "SCO", "SCT", "GB-SCT"]],
  ["Wales", "WAL", ["Welsh", "WAL", "WLS", "GB-WLS"]],
  ["Northern Ireland", "NIR", ["Northern Irish", "NIR", "GB-NIR"]],
];
for (const [name, abbr, aliases] of nations) {
  for (const value of [name, ...aliases, `  ${name.toUpperCase()}  `]) {
    assert.equal(countryFlagImageCode(value), "GB", value);
    assert.equal(countryFlag(value).emoji, "🇬🇧", value);
    assert.equal(countryFlag(value).name, name, "Preserve geographic names");
    assert.equal(countryAbbreviation(value), abbr);
    assert.equal(flagForCountryFilter(value), "🇬🇧");
    assert.equal(resolveCountry({ country: value }).ukNation, name);
  }
}
for (const value of ["British", "GB", "GBR", "UK", "Great Britain", "United Kingdom"])
  assert.equal(countryFlagImageCode(value), "GB");
assert.equal(countryMatchesFilter(resolveCountry({ country: "Scotland" }), "England"), false);
assert.equal(countryMatchesFilter(resolveCountry({ country: "Scotland" }), "United Kingdom"), true);
for (const [value, code] of [
  ["Ireland", "IE"],
  ["IRL", "IE"],
  ["NI", "NI"],
  ["Jersey", "JE"],
  ["Kenya", "KE"],
  ["Unknown", ""],
  [null, ""],
])
  assert.equal(countryFlagImageCode(value), code);

// Render the actual shared and archive components used by fixtures/results/profiles.
const server = await createServer({
  configFile: false,
  plugins: [react()],
  resolve: { alias: { "@": resolve("src") } },
  server: { middlewareMode: true },
});
try {
  const { CountryFlag } = await server.ssrLoadModule("/src/components/athletes/CountryFlag.tsx");
  const { ChannelFlags } = await server.ssrLoadModule(
    "/src/components/swimming/ChannelArchive.tsx",
  );
  for (const [country] of nations) {
    const $ = load(
      renderToStaticMarkup(createElement(CountryFlag, { country, showName: true, showCode: true })),
    );
    assert.equal($("img").attr("src"), "https://flagcdn.com/gb.svg");
    assert.equal($("[data-country-code]").attr("data-country-code"), "GB");
    assert.ok($.text().includes(country));
  }
  const $ = load(
    renderToStaticMarkup(
      createElement(ChannelFlags, {
        flags: [
          { code: "GB", label: "United Kingdom", abbr: "GBR" },
          { code: "GB-SCT", label: "Scotland", abbr: "SCO" },
          { code: "GB-NIR", label: "Northern Ireland", abbr: "NIR" },
          { code: "IE", label: "Ireland", abbr: "IRL" },
        ],
      }),
    ),
  );
  assert.deepEqual(
    $("img")
      .map((_, image) => $(image).attr("src"))
      .get(),
    ["https://flagcdn.com/gb.svg", "https://flagcdn.com/ie.svg"],
  );
} finally {
  await server.close();
}

console.log("UK flags: shared/archive rendering, aliases and country filters passed.");
