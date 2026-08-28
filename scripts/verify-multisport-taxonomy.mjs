#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const newSports = ["Adventure Racing", "Functional Fitness", "Walking"];
const taxonomyFiles = [
  "src/data/types.ts",
  "src/lib/athrecs/types.ts",
  "src/lib/athrecs/import.server.ts",
  "src/lib/athrecs/catalogue-publishing.server.ts",
  "src/lib/athrecs/filters.ts",
  "src/routes/index.tsx",
  "src/routes/races/index.tsx",
  "src/routes/$language/$country/races/index.tsx",
];

for (const path of taxonomyFiles) {
  const source = await readFile(path, "utf8");
  for (const sport of newSports) {
    assert(source.includes(`"${sport}"`), `${path} does not include ${sport}`);
  }
}

const filters = await readFile("src/lib/athrecs/filters.ts", "utf8");
assert(filters.includes('sport === "Adventure Racing"'), "Adventure Racing needs filters");
assert(filters.includes('sport === "Functional Fitness"'), "Functional Fitness needs filters");
assert(filters.includes('sport === "Walking"'), "Walking needs filters");

process.stdout.write("Multisport taxonomy verification passed.\n");
