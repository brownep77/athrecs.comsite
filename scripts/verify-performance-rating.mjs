import assert from "node:assert/strict";
import {
  ratePerformance,
  performanceRatingCategory,
  performanceRatingDistance,
  historicalRatingTimingConsistent,
  performanceRatingReference,
} from "../src/lib/athrecs/performance-rating.ts";
import { PERFORMANCE_REFERENCE_STANDARDS } from "../src/lib/athrecs/performance-rating-standards.ts";

const today = new Date("2026-10-23T12:00:00Z");
const result = (extra = {}) => ({
  resultId: 1,
  editionId: 1,
  eventName: "Synthetic running test",
  eventSlug: "synthetic-running-test",
  sport: "Running",
  surface: "Road",
  country: "",
  eventDate: "2026-10-01",
  distanceCode: "5K",
  distanceKm: 5,
  status: "finished",
  finishTimeSeconds: 1200,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
  overallPlace: null,
  resultGender: "M",
  category: null,
  sourceUrls: [],
  ...extra,
});
const score = (extra = {}, sourceGender = "") =>
  ratePerformance(result(extra), sourceGender, today);
const history = (extra = {}) => ({
  key: "synthetic:1",
  sport: "Running",
  performance: {
    year: 2026,
    date: "2026-10-01",
    sourceDate: "2026-10-02",
    ageGroup: "",
    discipline: "50K",
    performance: "4:00:00.25",
    wind: "",
    place: "",
    venue: "",
    meeting: "Synthetic ultra test",
    sourceUrls: [],
    labels: ["Trail"],
    ...extra,
  },
});

// Independently inspected numeric OC-sec values, not the conflicting display-formatted row.
assert.equal(score().displayScore, 641, "Men's 20-minute 5K uses the fixed 12:49 reference");
assert.equal(score({ resultGender: "F" }).displayScore, 695, "Women's 20-minute 5K uses 13:54");
assert.equal(
  score({ distanceCode: "Marathon", distanceKm: 42.195, finishTimeSeconds: 10800 }).displayScore,
  670,
);
assert.equal(
  score({ distanceCode: "100K", distanceKm: 100, resultGender: "F", finishTimeSeconds: 23591 })
    .score,
  1000,
);
assert.equal(
  score({ finishTimeSeconds: 600 }).score > 1000,
  true,
  "The score is not capped at a false world-record ceiling",
);
assert.equal(
  score({ eventDate: "1998-01-01" }).score,
  score().score,
  "Historic and current marks share the same standard version",
);
assert.equal(score({ finishTimeSeconds: 2400 }).score, score().score / 2);
assert.ok(
  score({ finishTimeSeconds: 1199 }).score > score().score,
  "Faster performances always rate higher",
);

for (const standard of PERFORMANCE_REFERENCE_STANDARDS) {
  assert.equal(performanceRatingDistance(standard.key, standard.km)?.key, standard.key);
  for (const [category, resultGender] of [
    ["men", "M"],
    ["women", "F"],
  ]) {
    const rating = score({
      distanceCode: standard.key,
      distanceKm: standard.km,
      resultGender,
      finishTimeSeconds: standard[category],
    });
    assert.equal(rating.score, 1000, `${category} ${standard.key} reference`);
    assert.equal(rating.interpolated, false);
  }
}

assert.equal(
  score({ resultGender: null, category: "M40" }),
  null,
  "An age category does not establish sex classification",
);
assert.equal(score({ resultGender: null }, "female").category, "women");
assert.equal(
  score({ resultGender: "F" }, "male").category,
  "women",
  "The explicit result category wins",
);
assert.equal(
  score({ resultGender: "X" }, "male"),
  null,
  "An unsupported explicit category is never overwritten",
);
assert.equal(performanceRatingCategory("", ""), null);

const parkrun = score({ sport: "Parkrun", surface: "Parkrun" });
assert.notEqual(parkrun.group, score().group, "Parkrun and road 5K remain distinct");
assert.equal(parkrun.comparison, "course-unadjusted");
assert.equal(
  score({ sport: "Athletics", surface: "Track", distanceCode: "5000m" }).comparison,
  "distance-only-estimate",
);
assert.equal(score({ surface: "Unknown" }).comparison, "distance-only-estimate");
assert.notEqual(score({ surface: "Trail" }).group, score({ surface: "Fell" }).group);

assert.equal(
  performanceRatingDistance("Half", 21.1).km,
  21.0975,
  "A named half accepts the legacy catalogue rounding",
);
assert.equal(
  performanceRatingDistance("Half", 20),
  null,
  "Distance/code contradictions are rejected",
);
assert.equal(
  performanceRatingDistance("5M", 0),
  null,
  "Ambiguous uppercase M needs numeric evidence",
);
assert.equal(performanceRatingDistance("5M", 8.05).key, "5mi");
assert.equal(performanceRatingDistance("5K", 8), null);
assert.equal(performanceRatingDistance("2K", 2).km, 2);
assert.equal(performanceRatingDistance("1000m", 1).km, 1);
assert.equal(performanceRatingDistance("1500m", 1.5).km, 1.5);
assert.equal(performanceRatingDistance("Mile", 1.609344).key, "1mi");
assert.equal(performanceRatingDistance("1 mile", 1.61).key, "1mi");
assert.equal(performanceRatingDistance("Road mile", 1.609344).key, "1mi");
assert.equal(performanceRatingDistance("999m", 0.999), null);
assert.equal(performanceRatingDistance("1K", 2), null);
assert.equal(
  performanceRatingDistance("parkrun", 5).key,
  "5K",
  "Adding the mile cannot change parkrun's exact distance",
);
assert.equal(performanceRatingReference(1.609344, "men").seconds, 227);
assert.equal(performanceRatingReference(1.609344, "women").seconds, 253);
assert.equal(performanceRatingReference(1.609344, "men").method, "published-road-standard");
assert.equal(performanceRatingReference(1.609344, "men").extrapolated, false);
const oneK = performanceRatingReference(1, "men");
assert.ok(
  Math.abs(oneK.seconds - 136.0201520171711) < 0.00000001,
  "Frozen mile-to-5K segment defines the estimated 1K reference",
);
assert.equal(oneK.method, "short-distance-extrapolation");
assert.equal(oneK.interpolated, true, "Legacy estimate flag includes a below-mile model estimate");
assert.equal(oneK.extrapolated, true);
assert.ok(
  Math.abs(performanceRatingReference(1, "women").seconds - 153.3465347680933) < 0.00000001,
);
for (const km of [1, 1.5, 2, 3, 3.218688, 4]) {
  const rating = score({ distanceCode: `${km}K`, distanceKm: km, finishTimeSeconds: 300 });
  assert.equal(rating.comparison, "distance-only-estimate");
  assert.equal(rating.distance.km, km);
  assert.equal(rating.standardsVersion, "usatf-mldr-2025-open-v2");
  assert.equal(
    rating.referenceMethod,
    km < 1.609344 ? "short-distance-extrapolation" : "interpolated-distance-estimate",
  );
}
const roadMile = score({ distanceCode: "1mi", distanceKm: 1.609344, finishTimeSeconds: 227 });
assert.equal(roadMile.score, 1000);
assert.equal(roadMile.comparison, "road-standard");
assert.equal(
  score({ distanceCode: "1mi", distanceKm: 1.609344, sport: "Athletics", surface: "Track" })
    .comparison,
  "distance-only-estimate",
);
for (const invalidKm of [0, 0.999, 200.001, 201, NaN, Infinity])
  assert.equal(
    performanceRatingReference(invalidKm, "men"),
    null,
    `No unsupported reference at ${invalidKm}km`,
  );
for (const category of ["men", "women"]) {
  let previous = 0;
  for (let step = 100; step <= 500; step++) {
    const reference = performanceRatingReference(step / 100, category);
    assert(
      reference.seconds > previous,
      "Short-distance estimates increase continuously with distance",
    );
    previous = reference.seconds;
  }
  for (const boundary of [1.609344, 5]) {
    const before = performanceRatingReference(boundary - 0.0000001, category).seconds;
    const after = performanceRatingReference(boundary + 0.0000001, category).seconds;
    assert(
      after > before && after - before < 0.0001,
      "No jump at short-distance reference boundaries",
    );
  }
}

const interpolated = score({ distanceCode: "55K", distanceKm: 55, finishTimeSeconds: 18000 });
assert.equal(interpolated.interpolated, true);
assert.equal(interpolated.comparison, "distance-only-estimate");
assert.equal(interpolated.distance.km, 55);
assert.ok(interpolated.benchmarkSeconds > 8820 && interpolated.benchmarkSeconds < 16080);
assert.notEqual(interpolated.group, score({ distanceCode: "50K", distanceKm: 50 }).group);
assert.equal(
  score({ distanceCode: "201K", distanceKm: 201 }),
  null,
  "No ultra extrapolation beyond the standards",
);
assert.equal(
  score({ distanceCode: "24h", distanceKm: 160 }),
  null,
  "Fixed-duration distance results need a different method",
);
assert.equal(score({ distanceCode: "Ultra", distanceKm: 55 }).distance.km, 55);
assert.equal(
  score({ distanceCode: "Ultra", distanceKm: 80.4672 }).distance.key,
  "50mi",
  "The same exact distance shares an identity despite a generic ultra label",
);

const projectedHistory = {
  history: history(),
  distanceCode: "50K",
  distanceKm: 50,
  surface: "Trail",
  finishTimeSeconds: null,
};
const trail = score(projectedHistory);
assert.equal(
  trail.finishTimeSeconds,
  14400.25,
  "Preserve historical source precision when the PB projection removed its time",
);
assert.equal(trail.comparison, "distance-only-estimate");
assert.equal(score({ ...projectedHistory, history: history({ performance: "DNF" }) }), null);
assert.equal(
  score({ ...projectedHistory, history: history({ performance: "4:00:00a" }) }),
  null,
  "An aided historical mark is ineligible",
);
assert.equal(
  score({ ...projectedHistory, history: history({ labels: ["Intermediate split"] }) }),
  null,
);
assert.equal(
  score({ ...projectedHistory, history: history({ notes: "Conflicting result timings" }) }),
  null,
);

for (const timing of [
  { basis: "chip", chip: "20:00" },
  { basis: "gun", gun: "20:00" },
  { basis: "chip", chip: "00:00" },
  { basis: "gun", gun: "20:99" },
  { basis: "chip", chip: "Infinity" },
]) {
  const contradictory = history({ discipline: "5K", performance: "20:06", timing });
  assert.equal(historicalRatingTimingConsistent(contradictory.performance), false);
  assert.equal(
    score({ history: contradictory }),
    null,
    `An explicit invalid or mismatched ${timing.basis} column cannot receive a time rating`,
  );
}
for (const timing of [
  { basis: "chip", chip: "20:06.0", gun: "20:10" },
  { basis: "gun", gun: "20:06", chip: "20:00" },
  { basis: "unknown", chip: "20:00", gun: "20:10" },
  { basis: "chip" },
]) {
  const consistent = history({ discipline: "5K", performance: "20:06", timing });
  assert.equal(historicalRatingTimingConsistent(consistent.performance), true);
  assert.equal(score({ history: consistent }).finishTimeSeconds, 1206);
}
assert.equal(
  score({ finishTimeSeconds: 1206, chipTimeSeconds: 1200, gunTimeSeconds: 1210 }).finishTimeSeconds,
  1206,
  "A canonical finish with an unknown basis is not contradicted by distinct chip/gun columns",
);

for (const extra of [
  { status: "DNF" },
  { status: "DNS" },
  { status: "DQ" },
  { conflicting: true },
  { eventDate: "2026-11-01" },
  { eventDate: "2026-02-30" },
  { details: { profileExcluded: true } },
  { details: { syntheticTest: true } },
  { details: { note: "Short course" } },
  { details: { note: "Conflicting source timings" } },
  { finishTimeSeconds: null },
  { finishTimeSeconds: 0 },
  { finishTimeSeconds: -1 },
  { finishTimeSeconds: Infinity },
  { finishTimeSeconds: NaN },
  { sport: "Triathlon" },
  { sport: "Cycling" },
  { distanceCode: "5K relay" },
  { distanceCode: "Unknown", distanceKm: 5 },
])
  assert.equal(score(extra), null, `Ineligible performance ${JSON.stringify(extra)}`);

assert.equal(
  score({
    eventSlug: "great-north-run",
    eventDate: "2023-09-10",
    distanceCode: "Half",
    distanceKm: 21.0975,
  }),
  null,
  "Existing edition-specific assisted-course rules are retained",
);

console.log(
  "Performance rating checks passed: source standards, monotonicity, categories, course separation, interpolation, historical precision and invalid-result gates.",
);
