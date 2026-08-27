import { readFile, writeFile } from "node:fs/promises";

async function patchFile(path, replacements) {
  let source = await readFile(path, "utf8");
  for (const { name, from, to } of replacements) {
    if (source.includes(to)) continue;
    if (!source.includes(from)) throw new Error(`${path}: missing ${name} anchor`);
    source = source.replace(from, to);
  }
  await writeFile(path, source);
}

await patchFile("src/data/catalogue.ts", [
  {
    name: "IRONMAN import",
    from: 'import { multiSportEditions, multiSportSeries } from "./multisport";',
    to:
      'import { ironman703Editions, ironman703Series } from "./ironman-703-calendar";\n' +
      'import { multiSportEditions, multiSportSeries } from "./multisport";',
  },
  {
    name: "IRONMAN series merge",
    from:
      '  ...(runabcSeries as Series[]),\n' +
      '  ...(multiSportSeries as Series[]),',
    to:
      '  ...(runabcSeries as Series[]),\n' +
      '  ...(ironman703Series as Series[]),\n' +
      '  ...(multiSportSeries as Series[]),',
  },
  {
    name: "IRONMAN edition merge",
    from:
      '  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),\n' +
      '  ...(multiSportEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),',
    to:
      '  ...(runabcEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),\n' +
      '  ...(ironman703Editions as Edition[]).filter((edition) =>\n' +
      '    extraSlugs.has(edition.seriesSlug),\n' +
      '  ),\n' +
      '  ...(multiSportEditions as Edition[]).filter((edition) => extraSlugs.has(edition.seriesSlug)),',
  },
]);

await patchFile("package.json", [
  {
    name: "IRONMAN verifier command",
    from:
      '    "verify:multisport-taxonomy": "node scripts/verify-multisport-taxonomy.mjs",\n' +
      '    "ci:verify":',
    to:
      '    "verify:multisport-taxonomy": "node scripts/verify-multisport-taxonomy.mjs",\n' +
      '    "verify:ironman-703-calendar": "node --experimental-strip-types scripts/verify-ironman-703-calendar.mjs",\n' +
      '    "ci:verify":',
  },
  {
    name: "IRONMAN verifier in CI",
    from: '&& npm run verify:multisport-taxonomy && npm run build",',
    to:
      '&& npm run verify:multisport-taxonomy && npm run verify:ironman-703-calendar && npm run build",',
  },
]);

console.log("Applied IRONMAN 70.3 catalogue and CI patches.");
