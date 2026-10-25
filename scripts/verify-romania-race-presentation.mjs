import assert from "node:assert/strict";
import { formatDistanceWithUnits, kmFromDistanceCode } from "../src/lib/athrecs/distance.ts";
import { timeZoneForPlace, timeZoneAbbr, calendarTimeZoneForPlace } from "../src/lib/athrecs/timezone.ts";

// Oradea and URC publish 21 km courses, not certified half-marathon lengths.
assert.equal(formatDistanceWithUnits("21K"), "21K · 21 km / 13.0 mi");
assert.equal(kmFromDistanceCode("Half"), 21.0975);
assert.equal(kmFromDistanceCode("21K", 21.0975), 21.0975);
assert.equal(formatDistanceWithUnits("21K", 21.0975), "21K · 21.1 km / 13.1 mi");

// January Oradea/Făget starts and summer races need the venue's seasonal offset.
const zone = timeZoneForPlace({ country: "Romania", county: "Bihor" });
assert.equal(zone, "Europe/Bucharest");
assert.match(timeZoneAbbr(zone, "2027-01-16"), /^(EET|UTC\+2)$/);
assert.match(timeZoneAbbr(zone, "2027-07-17"), /^(EEST|UTC\+3)$/);
assert.equal(calendarTimeZoneForPlace({ country: "Romania" }), "Europe/Bucharest");
assert.equal(timeZoneForPlace({ country: "Romania", timeZone: "Europe/Paris" }), "Europe/Paris");
console.log("Romanian race distances and seasonal venue time zones verified.");
