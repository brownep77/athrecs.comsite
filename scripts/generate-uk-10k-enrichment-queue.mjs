import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const runAbcPath = path.join(root, "src/data/runabc.ts");
const optionsPath = path.join(root, "src/data/entry-options-uk-10ks.ts");
const outputPath = path.join(root, "docs/uk-10k-enrichment/queue.json");
const checkpointSize = 3;
const releaseSize = 12;
const firstRelease = 63;
const firstQueueKey = "runabc-west-acre-wild-10k|2026-10-18|10K";

if (fs.existsSync(outputPath) && !process.argv.includes("--force")) {
  console.log(
    `${path.relative(root, outputPath)} already exists; the master queue is immutable. Pass --force only when deliberately starting a new catalogue phase.`,
  );
  process.exit(0);
}

const runAbc = fs.readFileSync(runAbcPath, "utf8");
const options = fs.readFileSync(optionsPath, "utf8");
const completedKeys = new Set(
  [...options.matchAll(/^\s*"([^"\n]+\|\d{4}-\d{2}-\d{2}\|[^"]+)":\s*\[/gm)].map(
    (match) => match[1],
  ),
);
const editionPattern =
  /\{"seriesSlug":\s*"([^"]+)",\s*"date":\s*"([^"]+)",\s*"distance":\s*"([^"]+)"[^\n]*?"source":\s*"([^"]+)"\}/g;

const editions = [...runAbc.matchAll(editionPattern)]
  .map((match) => ({
    key: `${match[1]}|${match[2]}|${match[3]}`,
    slug: match[1],
    sourceDate: match[2],
    distance: match[3],
    sourceUrl: match[4],
  }))
  .filter((edition) => edition.distance === "10K")
  .filter((edition) => !completedKeys.has(edition.key))
  .sort(
    (left, right) =>
      left.sourceDate.localeCompare(right.sourceDate) || left.slug.localeCompare(right.slug),
  );

const firstIndex = editions.findIndex((edition) => edition.key === firstQueueKey);
if (firstIndex < 0) {
  throw new Error(`Queue start ${firstQueueKey} was not found in src/data/runabc.ts`);
}

const queue = editions.slice(firstIndex).map((edition, index) => {
  const release = firstRelease + Math.floor(index / releaseSize);
  const checkpointLetter = String.fromCharCode(
    65 + Math.floor((index % releaseSize) / checkpointSize),
  );
  return {
    position: index + 1,
    release,
    checkpoint: `${release}${checkpointLetter}`,
    ...edition,
  };
});

const payload = {
  schemaVersion: 1,
  generatedAt: "2026-08-19T09:30:00+01:00",
  generatedFrom: "src/data/runabc.ts",
  createdAgainstSeed: "athrecs-uk-10k-entry-batch-sixty-two-v207",
  firstQueueKey,
  checkpointSize,
  releaseSize,
  firstRelease,
  totalRaces: queue.length,
  totalCheckpoints: Math.ceil(queue.length / checkpointSize),
  totalReleases: Math.ceil(queue.length / releaseSize),
  races: queue,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Wrote ${queue.length} races in ${payload.totalCheckpoints} checkpoints and ${payload.totalReleases} releases to ${path.relative(root, outputPath)}`,
);
