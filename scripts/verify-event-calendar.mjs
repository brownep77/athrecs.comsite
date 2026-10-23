import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { registerHooks } from "node:module";
import { spawnSync } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && context.parentURL?.includes("/src/")) {
      let p = fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(p)) p = fs.existsSync(p + ".ts") ? p + ".ts" : path.join(p, "index.ts");
      return nextResolve(pathToFileURL(p).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const modulePath =
  process.env.CALENDAR_TEST_MODULE || path.join(root, "src/lib/athrecs/event-calendar.ts");
const {
  buildCalendarEvent,
  calendarIcs,
  calendarLinks,
  calendarUtc,
  calendarUnavailable,
  calendarFilename,
} = await import(pathToFileURL(modulePath));
const { calendarTimeZoneForPlace } = await import("../src/lib/athrecs/timezone.ts");
const { catalogueCalendarRace } = await import("../src/lib/athrecs/catalogue-calendar.ts");
let checks = 0;
const check = (name, fn) => {
  try {
    fn();
    checks++;
  } catch (e) {
    throw new Error(name + ": " + e.message, { cause: e });
  }
};
const input = {
  id: "synthetic-10k",
  name: "Synthetic test race",
  distance: "10K",
  date: "2027-07-04",
  startTime: "10:00",
  timeZone: "Europe/London",
  pageUrl: "https://www.athrecs.com/races/synthetic",
  location: "Test venue",
  officialUrl: "https://example.org/race",
};
const build = (changes = {}) => buildCalendarEvent({ ...input, ...changes });
check("summer start uses BST", () => assert.equal(build().startUtc, "2027-07-04T09:00:00Z"));
check("winter start uses GMT", () =>
  assert.equal(build({ date: "2027-02-21" }).startUtc, "2027-02-21T10:00:00Z"),
);
const cases = [
  ["2027-03-28", "00:30", "Europe/London", "2027-03-28T00:30:00Z"],
  ["2027-03-28", "01:30", "Europe/London", null],
  ["2027-03-28", "02:30", "Europe/London", "2027-03-28T01:30:00Z"],
  ["2027-10-31", "01:30", "Europe/London", null],
  ["2027-10-31", "02:30", "Europe/London", "2027-10-31T02:30:00Z"],
  ["2027-03-14", "02:30", "America/New_York", null],
  ["2027-11-07", "01:30", "America/New_York", null],
  ["2027-07-04", "08:00", "America/Los_Angeles", "2027-07-04T15:00:00Z"],
  ["2027-07-04", "08:00", "Pacific/Honolulu", "2027-07-04T18:00:00Z"],
  ["2027-07-04", "00:00", "Asia/Kathmandu", "2027-07-03T18:15:00Z"],
  ["2027-01-04", "08:30", "Australia/Adelaide", "2027-01-03T22:00:00Z"],
  ["2027-07-04", "08:30", "Australia/Adelaide", "2027-07-03T23:00:00Z"],
  ["2027-01-04", "08:30", "Pacific/Auckland", "2027-01-03T19:30:00Z"],
  ["2027-07-04", "10:00", "America/St_Johns", "2027-07-04T12:30:00Z"],
  ["2027-07-04", "10:00", "Not/AZone", null],
];
for (const [date, time, zone, expected] of cases)
  check(`timezone ${date} ${time} ${zone}`, () =>
    assert.equal(calendarUtc(date, time, zone), expected),
  );
for (const date of [
  "2027-02-29",
  "2028-02-30",
  "2027-04-31",
  "2027-13-01",
  "TBC",
  "2027",
  "",
  "2027-2-21",
  "2027-01-01T10:00Z",
])
  check("invalid date " + date, () => assert.equal(build({ date }), null));
check("leap date accepted", () => assert(build({ date: "2028-02-29" })));
for (const startTime of [
  "24:00",
  "12:60",
  "09:30:60",
  "9am",
  "09:00-10:00",
  "TBC",
  "09:00junk",
  null,
])
  check("invalid time " + startTime, () => assert.equal(build({ startTime }).startUtc, null));
check("seconds preserved", () =>
  assert.equal(build({ startTime: "09:30:12" }).startUtc, "2027-07-04T08:30:12Z"),
);
check("start label never becomes exact", () =>
  assert.equal(build({ startLabel: "Waves from 10:00" }).startUtc, null),
);
check("unknown zone date-only", () => assert.equal(build({ timeZone: null }).startUtc, null));
check("unknown location is not London", () =>
  assert.equal(calendarTimeZoneForPlace({ country: "Unknown" }), null),
);
check("multi-zone USA has no default", () =>
  assert.equal(calendarTimeZoneForPlace({ country: "United States" }), null),
);
check("split state has no guess", () =>
  assert.equal(calendarTimeZoneForPlace({ country: "United States", county: "Florida" }), null),
);
check("region country scoped", () =>
  assert.equal(
    calendarTimeZoneForPlace({ country: "England", county: "California" }),
    "Europe/London",
  ),
);
check("known region", () =>
  assert.equal(
    calendarTimeZoneForPlace({ country: "United States", county: "California" }),
    "America/Los_Angeles",
  ),
);
for (const status of ["Cancelled", "Postponed", "Finished"])
  check("ineligible " + status, () => assert.equal(build({ status }), null));
for (const status of ["Open", "Closed", "TBC"])
  check("entry status is not cancellation " + status, () => assert(build({ status })));
check("bad end date rejected", () => assert.equal(build({ endDate: "2027-02-30" }), null));
check("reversed date rejected", () => assert.equal(build({ endDate: "2027-07-03" }), null));
check("reversed finish not invented overnight", () =>
  assert.equal(build({ endTime: "09:00" }).endUtc, null),
);
check("overnight explicit finish", () =>
  assert.equal(
    build({ startTime: "23:00", endDate: "2027-07-05", endTime: "02:00" }).endUtc,
    "2027-07-05T01:00:00Z",
  ),
);
check("unknown finish omitted", () => assert(!calendarIcs(build()).includes("DTEND:")));
check("all-day exclusive end", () =>
  assert(calendarIcs(build({ startTime: null })).includes("DTEND;VALUE=DATE:20270705")),
);
check("multiday all-day inclusive source end", () =>
  assert(
    calendarIcs(build({ startTime: null, endDate: "2027-07-06" })).includes(
      "DTEND;VALUE=DATE:20270707",
    ),
  ),
);
check("year rollover", () =>
  assert.equal(build({ date: "2027-12-31", startTime: null }).endDateExclusive, "2028-01-01"),
);
check("tentative date visible", () =>
  assert.match(calendarIcs(build({ provisional: true })), /STATUS:TENTATIVE/),
);
check("uid stable across correction", () =>
  assert.equal(build().uid, build({ startTime: "11:00", date: "2027-07-05" }).uid),
);
check("distinct distance ids", () =>
  assert.notEqual(build().uid, build({ id: "synthetic-half" }).uid),
);
check("uid injection encoded", () =>
  assert(
    !calendarIcs(build({ id: "x\r\nBEGIN:VEVENT" })).includes("\r\nBEGIN:VEVENT\r\nBEGIN:VEVENT"),
  ),
);
check("malformed unicode must not crash", () => assert(build({ id: "x\ud800" })));
for (const officialUrl of [
  "javascript:alert(1)",
  "data:text/html,hello",
  "https://u:pw@example.org",
  "https://example.org/\r\nATTENDEE:x",
  "https://runabc.co.uk/race",
])
  check("unsafe link excluded " + officialUrl, () =>
    assert(!build({ officialUrl }).description.includes("Official website:")),
  );
const hostile =
  "Race, semi; slash\\\r\nBEGIN:VEVENT\r\nATTENDEE:mailto:unwanted@example.org\r\nEND:VEVENT";
check("ical injection escaped", () => {
  const ics = calendarIcs(build({ name: hostile, location: hostile }));
  assert.equal(ics.split("\r\n").filter((l) => l === "BEGIN:VEVENT").length, 1);
  assert(!ics.includes("\r\nATTENDEE:"));
  assert(!ics.includes("\r\nVALARM"));
});
check("HTML in provider descriptions escaped", () => {
  const url = new URL(calendarLinks(build({ name: "<img src=x onerror=alert(1)>" })).google);
  assert(!url.searchParams.get("details").includes("<img"));
});
check("unicode folding roundtrip", () => {
  const event = build({ name: "東京 🏃🏽 São Paulo, café; ".repeat(20), location: "🏃🏽".repeat(90) });
  const ics = calendarIcs(event);
  for (const line of ics.split("\r\n")) assert(Buffer.byteLength(line) <= 75);
  const unfolded = ics.replace(/\r\n /g, "");
  assert(unfolded.includes("東京"));
  assert(!unfolded.includes("\ufffd"));
});
check("filename safe", () =>
  assert.match(calendarFilename(build({ name: "../../A/B\\C\nTest" })), /^[A-Za-z0-9-]+\.ics$/),
);
check("google date and zone roundtrip", () => {
  const u = new URL(calendarLinks(build()).google);
  assert.equal(u.hostname, "calendar.google.com");
  assert.equal(u.searchParams.get("dates"), "20270704T090000Z/20270704T090000Z");
  assert.equal(u.searchParams.get("ctz"), "Europe/London");
});
check("outlook all-day marker and exclusive end", () => {
  const urls = calendarLinks(build({ startTime: null }));
  for (const url of [urls.outlook, urls.office]) {
    const p = new URL(url).searchParams;
    assert.equal(p.get("allday"), "true");
    assert.equal(p.get("startdt"), "2027-07-04");
    assert.equal(p.get("enddt"), "2027-07-05");
  }
});
check("provider parameters cannot be injected", () => {
  const e = build({ name: "Test & dates=19990101/19990102 # ? ü" });
  for (const [provider, url] of Object.entries(calendarLinks(e))) {
    const u = new URL(url);
    assert.equal(u.hash, "");
    assert.equal(u.searchParams.get(provider === "google" ? "text" : "subject"), e.title);
  }
});
// Real adapter contract, using retained edition-specific organiser overrides; no database access.
const fixtureEvent = {
  slug: "marriotts-way-marathon-half",
  name: "Synthetic calendar adapter",
  country: "England",
  city: "Norwich",
};
const { FIXTURE_DETAILS } = await import("../src/data/fixture-details.ts");
const fixtureKey = Object.keys(FIXTURE_DETAILS).find(
  (key) => key.includes("marriotts") && key.endsWith("|2027-02-21"),
);
assert(fixtureKey);
fixtureEvent.slug = fixtureKey.split("|")[0];
for (const [distance_code, start] of Object.entries(FIXTURE_DETAILS[fixtureKey].starts)) {
  const row = {
    id: 42,
    event_date: "2027-02-21",
    distance_code,
    distance_km: distance_code === "Half" ? 21.0975 : 42.195,
    status: "Open",
    start_time: "23:59",
  };
  check("edition-specific override " + distance_code, () =>
    assert.equal(
      catalogueCalendarRace(fixtureEvent, row, "https://www.athrecs.com").startTime,
      start.time,
    ),
  );
  check("no next-year carryover " + distance_code, () =>
    assert.equal(
      catalogueCalendarRace(
        fixtureEvent,
        { ...row, event_date: "2028-02-21", start_time: null },
        "https://www.athrecs.com",
      ).startTime,
      null,
    ),
  );
}
// Deterministic adversarial text/date sampling.
for (let n = 0; n < 300; n++) {
  const date = `2028-${String((n % 12) + 1).padStart(2, "0")}-${String((n % 28) + 1).padStart(2, "0")}`;
  const e = build({
    date,
    name: `${n} 🏃 café, ; \\ < > & # \r\nTEXT`,
    startTime: n % 2 ? "00:00" : null,
  });
  check("fuzz " + n, () => {
    const ics = calendarIcs(e, new Date("2026-10-23T00:00:00Z"));
    assert(!/(?<!\r)\n/.test(ics));
    for (const line of ics.split("\r\n")) assert(Buffer.byteLength(line) <= 75);
    assert.equal(ics.split("\r\n").filter((l) => l === "BEGIN:VEVENT").length, 1);
    const params = new URL(calendarLinks(e).google).searchParams;
    assert.equal(params.get("text"), e.title);
  });
}
console.log(
  `PASS: ${checks} calendar assertions including DST, ambiguous times, dates, security, Unicode, links and adapters.`,
);
if (process.argv.includes("--mutations")) {
  const source = fs.readFileSync(modulePath, "utf8");
  const mutations = [
    ["DST ignored", "naive - offset", "naive"],
    ["ambiguous clock accepted", "matches.length === 1", "matches.length >= 1"],
    ["all-day end off by one", "+ DAY)", "+ 0)"],
    ["cancelled enabled", "/cancelled|canceled|postponed|finished/i", "/never-matches/i"],
    ["Unicode byte folding removed", "encoder.encode(char).length", "char.length"],
    ["unsafe links allowed", '["https:", "http:"].includes(url.protocol)', "true"],
    [
      "distance UID collapsed",
      "encodeURIComponent(new TextDecoder().decode(new TextEncoder().encode(race.id)))",
      '"same-id"',
    ],
  ];
  const file = path.join(root, "src/lib/athrecs/.calendar-mutant.ts");
  try {
    for (const [name, from, to] of mutations) {
      assert(source.includes(from), name + " target missing");
      fs.writeFileSync(file, source.replace(from, to));
      const run = spawnSync(process.execPath, [fileURLToPath(import.meta.url)], {
        cwd: root,
        env: { ...process.env, CALENDAR_TEST_MODULE: file },
        encoding: "utf8",
      });
      assert.notEqual(run.status, 0, "SURVIVED: " + name);
      console.log("Mutation detected: " + name);
    }
  } finally {
    fs.rmSync(file, { force: true });
  }
}
