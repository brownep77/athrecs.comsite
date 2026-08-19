import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const queuePath = path.join(root, "docs/uk-10k-enrichment/queue.json");
const progressPath = path.join(root, "docs/uk-10k-enrichment/progress.json");
const runAbcPath = path.join(root, "src/data/runabc.ts");
const optionsPath = path.join(root, "src/data/entry-options-uk-10ks.ts");

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const progress = JSON.parse(fs.readFileSync(progressPath, "utf8"));
const runAbc = fs.readFileSync(runAbcPath, "utf8");
const options = fs.readFileSync(optionsPath, "utf8");

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const allowedStatuses = new Set([
  "queued",
  "researched",
  "coded",
  "tested",
  "checkpoint_saved",
  "deployed",
  "live_verified",
  "blocked",
]);
const checkpointRank = new Map([
  ["queued", 0],
  ["researched", 1],
  ["coded", 2],
  ["tested", 3],
  ["checkpoint_saved", 4],
  ["deployed", 5],
  ["live_verified", 6],
]);

assert(queue.schemaVersion === 1, "queue schemaVersion must be 1");
assert(progress.schemaVersion === 1, "progress schemaVersion must be 1");
assert(queue.checkpointSize === 3, "checkpoint size must remain three races");
assert(queue.releaseSize === 12, "release size must remain twelve races");
assert(queue.totalRaces === queue.races.length, "queue totalRaces does not match races length");
assert(
  queue.totalCheckpoints === Math.ceil(queue.races.length / queue.checkpointSize),
  "queue totalCheckpoints is incorrect",
);
assert(
  queue.totalReleases === Math.ceil(queue.races.length / queue.releaseSize),
  "queue totalReleases is incorrect",
);

const keys = new Set();
const checkpointCounts = new Map();
for (const [index, race] of queue.races.entries()) {
  assert(race.position === index + 1, `queue position ${race.position} should be ${index + 1}`);
  assert(!keys.has(race.key), `duplicate queue key: ${race.key}`);
  keys.add(race.key);
  assert(
    race.key === `${race.slug}|${race.sourceDate}|${race.distance}`,
    `malformed queue key: ${race.key}`,
  );
  assert(race.distance === "10K", `non-10K race in queue: ${race.key}`);
  assert(
    runAbc.includes(`"seriesSlug": "${race.slug}"`),
    `queue slug missing from runABC: ${race.slug}`,
  );
  checkpointCounts.set(race.checkpoint, (checkpointCounts.get(race.checkpoint) ?? 0) + 1);
}

for (const [checkpoint, count] of checkpointCounts) {
  assert(count === queue.checkpointSize, `${checkpoint} contains ${count} races instead of three`);
}

for (const [checkpoint, detail] of Object.entries(progress.checkpoints)) {
  assert(checkpointCounts.has(checkpoint), `progress references unknown checkpoint ${checkpoint}`);
  assert(allowedStatuses.has(detail.status), `${checkpoint} has invalid status ${detail.status}`);
  const expectedKeys = queue.races
    .filter((race) => race.checkpoint === checkpoint)
    .map((race) => race.key);
  assert(
    JSON.stringify(detail.races) === JSON.stringify(expectedKeys),
    `${checkpoint} race list differs from the master queue`,
  );

  if ((checkpointRank.get(detail.status) ?? -1) >= checkpointRank.get("coded")) {
    for (const key of expectedKeys) {
      assert(
        options.includes(`"${key}": [`),
        `${checkpoint} is coded but has no entry options for ${key}`,
      );
    }
  }
}

const optionBlocks = [...options.matchAll(/^\s*"([^"\n]+\|\d{4}-\d{2}-\d{2}\|[^"]+)":\s*\[/gm)].map(
  (match) => match[1],
);
assert(
  optionBlocks.length === new Set(optionBlocks).size,
  "duplicate edition keys exist in UK 10K entry options",
);

for (const race of queue.races) {
  if (!options.includes(`"${race.key}": [`)) continue;
  const start = options.indexOf(`"${race.key}": [`);
  const next = options.indexOf('\n  "', start + race.key.length + 5);
  const block = options.slice(start, next < 0 ? options.length : next);
  const primaryCount = (block.match(/isPrimary:\s*true/g) ?? []).length;
  const verifiedCount = (block.match(/isVerified:\s*true/g) ?? []).length;
  assert(primaryCount === 1, `${race.key} must have exactly one primary provider`);
  assert(verifiedCount >= 1, `${race.key} must have at least one verified provider`);
}

if (failures.length) {
  console.error("UK 10K workflow verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

const recorded = Object.values(progress.checkpoints).reduce((counts, checkpoint) => {
  counts[checkpoint.status] = (counts[checkpoint.status] ?? 0) + 1;
  return counts;
}, {});
const unrecorded = queue.totalCheckpoints - Object.keys(progress.checkpoints).length;
console.log("UK 10K workflow verification passed");
console.log(
  `${queue.totalRaces} races · ${queue.totalCheckpoints} three-race checkpoints · ${queue.totalReleases} twelve-race releases`,
);
console.log(
  `Progress: ${JSON.stringify({ ...recorded, queued: (recorded.queued ?? 0) + unrecorded })}`,
);
