import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith(".") && context.parentURL?.includes("/src/")) ||
      specifier.startsWith("@/")
    ) {
      let target = specifier.startsWith("@/")
        ? path.resolve("src", specifier.slice(2))
        : fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(target))
        target = fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});

const { raceQuestions } = await import("../src/lib/athrecs/race-questions.ts");
const { buildRaceBriefing } = await import("../src/lib/athrecs/race-briefing.ts");
const event = {
  name: "Example Race",
  slug: "synthetic-race",
  sport: "Running",
  country: "England",
  city: "Norwich",
  county: "Norfolk",
  website: "https://example.test/",
};
const row = {
  event_date: "2027-04-04",
  distance_code: "Half",
  distance_km: 21.0975,
  status: "Open",
  start_time: "09:00",
  entry_options: [],
  entry_url: "https://example.test/entry",
};
const questions = (upcoming, overrides = {}) =>
  raceQuestions({ event: { ...event, ...overrides }, upcoming });
const answer = (rows, question) => rows.find((item) => item.question === question).answer;

const mixed = questions([
  row,
  { ...row, distance_code: "10K", distance_km: 10, start_time: "10:00" },
  { ...row, event_date: "2028-04-02", distance_code: "5K" },
  { ...row, status: "Cancelled", distance_code: "Marathon" },
]);
assert.match(answer(mixed, "When is the next event?"), /4 April 2027/);
assert.match(answer(mixed, "Where is it held?"), /Norwich, Norfolk, England/);
assert.match(answer(mixed, "Which distances are listed?"), /Half marathon, 10K/);
assert.doesNotMatch(answer(mixed, "Which distances are listed?"), /5K|Marathon/);
assert.match(answer(mixed, "What time does it start?"), /Half marathon: 09:00 BST; 10K: 10:00 BST/);

const unknown = questions([
  row,
  { ...row, distance_code: "10K", distance_km: 10, start_time: null },
]);
assert.match(answer(unknown, "What time does it start?"), /10K: start time not yet verified/);
const waves = questions([{ ...row, start_label: "Waves from 09:00" }]);
assert.match(answer(waves, "What time does it start?"), /Waves from 09:00/);
const archive = questions([]);
assert.match(answer(archive, "When is the next event?"), /No future date/);
assert.doesNotMatch(JSON.stringify(archive), /4 April 2027|09:00/);
const noVenue = questions([row], { city: "", county: "", country: "" });
assert.match(answer(noVenue, "Where is it held?"), /venue.*not yet been confirmed/i);
assert.doesNotMatch(answer(noVenue, "Where is it held?"), /International|Unknown/);
const cancelled = questions([{ ...row, status: "Cancelled" }]);
assert.match(answer(cancelled, "When is the next event?"), /No future date/);

const hyrox = questions(
  [
    {
      ...row,
      distance_code: "8K + workouts",
      distance_km: 8,
      start_time: null,
      end_date: "2027-04-06",
    },
  ],
  { sport: "HYROX" },
);
assert.match(answer(hyrox, "When is the next event?"), /4 April 2027 to 6 April 2027/);
assert.match(answer(hyrox, "Which distances are listed?"), /workout stations/);
assert.match(answer(hyrox, "What time does it start?"), /assigned individual start slot/);
const briefing = buildRaceBriefing({ ...event, sport: "HYROX" });
assert.match(briefing.what, /fitness race/);
assert(briefing.checklist.some((item) => /division and assigned individual/.test(item)));

const closed = questions([{ ...row, status: "Closed" }]);
assert.match(answer(closed, "How do I enter?"), /available entry route is not confirmed/);
assert.equal(closed.at(-1).link.href, "https://example.test/");
const unsafe = questions([{ ...row, entry_url: "javascript:alert(1)" }], {
  website: "data:text/html,bad",
});
assert.equal(unsafe.at(-1).link, undefined);

console.log(
  "PASS: race questions follow the next dated programme, separate distances and waves, retain unknown clocks, omit cancelled editions, preserve archive uncertainty and entry gates, and describe HYROX correctly.",
);
