import assert from "node:assert/strict";
import { buildRaceShareData } from "../src/lib/athrecs/race-sharing.ts";

const base = {
  id: "synthetic-half",
  name: "Calendar test race 🏃",
  distance: "Half marathon",
  date: "2027-07-04",
  pageUrl: "https://www.athrecs.com/races/synthetic",
  location: "Synthetic venue",
};
let checks = 0;
function check(name, action) {
  action();
  checks++;
  console.log("PASS: " + name);
}

check("public race title, distance, date and location", () => {
  const data = buildRaceShareData(base);
  assert(data);
  assert.match(data.title, /Calendar test race 🏃/u);
  assert.match(data.title, /Half marathon/);
  assert.match(data.text, /4 Jul(?:y)? 2027/);
  assert.match(data.text, /Synthetic venue/);
  assert.equal(data.url, base.pageUrl);
});

check("only canonical public URLs are shared, without tracking or private query values", () => {
  const data = buildRaceShareData({
    ...base,
    pageUrl: base.pageUrl + "?utm_source=private-source&token=private-token#private-fragment",
    officialUrl: "https://organiser.example.test/private-entry",
    entryUrl: "https://entry.example.test/private-entry",
  });
  assert.equal(data.url, base.pageUrl);
  assert.doesNotMatch(JSON.stringify(data), /private-|organiser\.example|entry\.example/);
});

check("AthRecs and RunRecs public race and guide routes", () => {
  for (const host of ["athrecs.com", "www.athrecs.com", "runrecs.com", "www.runrecs.com"]) {
    for (const path of [
      "/races/synthetic",
      "/running/races/synthetic",
      "/running/ultramarathons/synthetic",
    ]) {
      for (const protocol of ["https:", "http:"]) {
        const data = buildRaceShareData({ ...base, pageUrl: protocol + "//" + host + path });
        assert(data, protocol + "//" + host + path);
        const url = new URL(data.url);
        assert.equal(url.pathname, path);
        assert.equal(url.search, "");
        assert.equal(url.hash, "");
        assert(
          ["athrecs.com", "www.athrecs.com", "runrecs.com", "www.runrecs.com"].includes(
            url.hostname,
          ),
        );
      }
    }
  }
});

check("malformed, external, credentialed and private URLs are rejected", () => {
  for (const pageUrl of [
    "",
    "not a URL",
    "/races/synthetic",
    "javascript:alert(1)",
    "data:text/html,synthetic",
    "file:///races/synthetic",
    "ftp://www.athrecs.com/races/synthetic",
    "https://example.test/races/synthetic",
    "https://www.athrecs.com.example.test/races/synthetic",
    "https://www.athrecs.com@evil.example.test/races/synthetic",
    "https://user:password@www.athrecs.com/races/synthetic",
    "https://www.athrecs.com:8443/races/synthetic",
    "https://www.athrecs.com/my-race-calendar?race=synthetic",
    "https://www.athrecs.com/api/race-calendar/private-token",
    "https://www.athrecs.com/admin",
    "https://www.athrecs.com/athletes/synthetic",
    "https://www.athrecs.com/races/",
    "https://www.athrecs.com/races/synthetic/private",
    "https://www.athrecs.com/races/synthe\ntic",
  ]) {
    assert.equal(buildRaceShareData({ ...base, pageUrl }), null, pageUrl);
  }
});

check("public metadata is clean and optional fields stay optional", () => {
  const data = buildRaceShareData({
    ...base,
    name: "  Calendar\u0000 test\n race 🏃  ",
    distance: null,
    location: "Synthetic\tvenue\u0001",
  });
  assert(data);
  assert.match(data.title, /🏃/u);
  assert.doesNotMatch(data.title, /[\u0000-\u001f\u007f]/);
  assert.doesNotMatch(data.text, /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/);
  assert.doesNotMatch(JSON.stringify(data), /undefined|null/);
});

check("provisional and unavailable race qualifications are retained when sharing", () => {
  assert.match(buildRaceShareData({ ...base, provisional: true }).text, /provisional/i);
  for (const [status, marker] of [
    ["Cancelled", /cancelled/i],
    ["Postponed", /postponed/i],
    ["Finished", /past race|finished/i],
  ]) {
    const data = buildRaceShareData({ ...base, status });
    assert(data, "A public race remains shareable when its calendar action is unavailable");
    assert.match(data.text, marker);
  }
});

check("changed selected distance and date produce current share metadata", () => {
  const first = buildRaceShareData(base);
  const next = buildRaceShareData({ ...base, distance: "Marathon", date: "2027-07-05" });
  assert.notEqual(first.title, next.title);
  assert.match(next.title, /Marathon/);
  assert.doesNotMatch(next.title, /Half marathon/);
  assert.match(next.text, /5 Jul(?:y)? 2027/);
  assert.doesNotMatch(next.text, /4 Jul(?:y)? 2027/);
  assert.equal(next.url, base.pageUrl);
});

check("invalid dates never become a fabricated race day", () => {
  const data = buildRaceShareData({ ...base, date: "2027-02-30" });
  assert(data);
  assert.doesNotMatch(data.text, /Invalid Date|2 Mar(?:ch)? 2027|30 Feb(?:ruary)? 2027/);
});

check("date-only race days remain stable across process timezones", () => {
  const originalTimeZone = process.env.TZ;
  try {
    const outputs = ["UTC", "America/Los_Angeles", "Pacific/Auckland"].map((timeZone) => {
      process.env.TZ = timeZone;
      assert.equal(new Intl.DateTimeFormat().resolvedOptions().timeZone, timeZone);
      return buildRaceShareData({ ...base, date: "2027-01-01" });
    });
    assert.match(outputs[0].text, /1 Jan(?:uary)? 2027/);
    assert.deepEqual(outputs[1], outputs[0]);
    assert.deepEqual(outputs[2], outputs[0]);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

console.log(
  `PASS: ${checks} focused race-sharing checks; no external sharing or clipboard access.`,
);
