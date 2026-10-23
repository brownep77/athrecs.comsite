import fs from "node:fs";
import { SPORTS_ORGANISATIONS } from "../src/data/sports-organisations.ts";
import {
  FIXTURE_SOURCE_REGISTRY_HEADERS,
  parseFixtureSourceRegistry,
} from "../src/lib/athrecs/source-registry.ts";
import { missingOrganisationSources } from "../src/lib/athrecs/organisation-sources.ts";

const file = new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url);
const original = fs.readFileSync(file, "utf8");
const missing = missingOrganisationSources(
  parseFixtureSourceRegistry(original),
  SPORTS_ORGANISATIONS,
);
if (missing.length && !process.argv.includes("--write")) {
  throw new Error(
    `${missing.length} organisation source pages missing. Review, then run with --write to register disabled research leads.`,
  );
}
const csv = (value) => {
  const text = typeof value === "boolean" ? (value ? "1" : "0") : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
if (missing.length)
  fs.writeFileSync(
    file,
    original.replace(/\n?$/, "\n") +
      missing
        .map((row) => FIXTURE_SOURCE_REGISTRY_HEADERS.map((key) => csv(row[key])).join(","))
        .join("\n") +
      "\n",
  );
console.log(
  JSON.stringify({ organisations: SPORTS_ORGANISATIONS.length, added: missing.length, enabled: 0 }),
);
