#!/usr/bin/env node
import assert from "node:assert/strict";
import { providerNeutralAthleteSlug } from "../src/lib/athrecs/athlete-public-slug.ts";

const a = providerNeutralAthleteSlug("arjan-winters", "duv", "1704031");
const b = providerNeutralAthleteSlug("arjan-winters", "duv", "1704032");
const c = providerNeutralAthleteSlug("arjan-winters", "worldathletics", "1704031");
assert.match(a, /^arjan-winters-athlete-[a-f0-9]{16}$/);
assert.notEqual(a, b, "Different source IDs must have distinct URLs");
assert.notEqual(a, c, "Provider namespace must distinguish IDs internally");
assert.equal(a, providerNeutralAthleteSlug("arjan-winters", "duv", "1704031"));
assert(!a.includes("-duv-") && !a.includes("1704031"), "Never expose provider IDs");
const long = providerNeutralAthleteSlug("an-extremely-long-athlete-name-".repeat(5), "duv", "123");
assert(long.length <= 87 && /^[a-z0-9][a-z0-9-]*$/.test(long));
for (const args of [["", "duv", "1"], ["athlete", "", "1"], ["athlete", "duv", ""]]) {
  assert.throws(() => providerNeutralAthleteSlug(...args));
}
console.log("PASS: provider-neutral athlete slugs are stable, distinct and source-ID free.");
