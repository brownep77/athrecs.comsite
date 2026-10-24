import assert from "node:assert/strict";
import { buildRaceShareData, buildRaceShareLinks } from "../src/lib/athrecs/race-sharing.ts";

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
  // eslint-disable-next-line no-control-regex -- Assert that share titles exclude control characters.
  assert.doesNotMatch(data.title, /[\u0000-\u001f\u007f]/);
  // eslint-disable-next-line no-control-regex -- Share body permits line breaks, but excludes the other controls.
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

check("five direct sharing destinations use the intended provider endpoints", () => {
  const links = buildRaceShareLinks(buildRaceShareData(base));
  assert.deepEqual(
    links.map(({ id, label }) => [id, label]),
    [
      ["whatsapp", "WhatsApp"],
      ["facebook", "Facebook"],
      ["x", "X"],
      ["telegram", "Telegram"],
      ["email", "Email"],
    ],
  );
  const endpoints = {
    whatsapp: ["https:", "wa.me", "/"],
    facebook: ["https:", "www.facebook.com", "/sharer/sharer.php"],
    x: ["https:", "x.com", "/intent/tweet"],
    telegram: ["https:", "t.me", "/share/url"],
    email: ["mailto:", "", ""],
  };
  for (const link of links) {
    const url = new URL(link.href);
    assert.deepEqual([url.protocol, url.hostname, url.pathname], endpoints[link.id]);
    assert.equal(url.hash, "");
  }
});

check("provider parameters roundtrip punctuation and Unicode without private query values", () => {
  const data = buildRaceShareData({
    ...base,
    name: "Race & + % #? 🏃 東京",
    distance: "5K",
    location: "A&B",
    pageUrl:
      "https://www.athrecs.com/races/%E6%9D%B1%E4%BA%AC?token=private-token&utm_source=private-source#private-fragment",
  });
  const links = Object.fromEntries(
    buildRaceShareLinks(data).map(({ id, href }) => [id, new URL(href)]),
  );
  assert.equal(links.whatsapp.searchParams.get("text"), `${data.text}\r\n\r\n${data.url}`);
  assert.equal(links.facebook.searchParams.get("u"), data.url);
  assert.deepEqual([...links.facebook.searchParams.keys()], ["u"]);
  assert.equal(links.x.searchParams.get("text"), data.text);
  assert.equal(links.x.searchParams.get("url"), data.url);
  assert.equal(links.telegram.searchParams.get("text"), data.text);
  assert.equal(links.telegram.searchParams.get("url"), data.url);
  assert.equal(links.email.searchParams.get("subject"), data.title);
  assert.equal(links.email.searchParams.get("body"), `${data.text}\r\n\r\n${data.url}`);
  assert.doesNotMatch(JSON.stringify(links), /private-token|private-source|private-fragment/);
});

check("query and email header injection characters remain ordinary encoded message text", () => {
  const data = buildRaceShareData({
    ...base,
    name: "Synthetic\r\nBcc: nowhere@example.test &bcc=nowhere@example.test?x=1#fragment",
    location: "A+B &subject=changed",
  });
  const expectedKeys = {
    whatsapp: ["text"],
    facebook: ["u"],
    x: ["text", "url"],
    telegram: ["text", "url"],
    email: ["body", "subject"],
  };
  for (const { id, href } of buildRaceShareLinks(data)) {
    const url = new URL(href);
    assert.deepEqual([...url.searchParams.keys()].sort(), expectedKeys[id]);
    assert.equal(url.hash, "");
    assert.doesNotMatch(href, /[\r\n]/);
    if (id === "email") {
      assert.equal(url.pathname, "", "Do not preselect an email recipient");
      assert.equal(url.searchParams.get("subject"), data.title);
      assert.doesNotMatch(url.searchParams.get("subject"), /[\r\n]/);
      assert.equal(url.searchParams.get("body"), `${data.text}\r\n\r\n${data.url}`);
    }
  }
});

check("long Unicode race names stay shareable and X text stays within 120 codepoints", () => {
  for (const name of [
    "Long race name ".repeat(60),
    "A" + "🏃".repeat(250),
    "東京".repeat(250),
    "Synthetic \ud800 race",
  ]) {
    const data = buildRaceShareData({ ...base, name, location: "Long venue ".repeat(60) });
    let links;
    assert.doesNotThrow(() => {
      links = buildRaceShareLinks(data);
    });
    const x = new URL(links.find(({ id }) => id === "x").href);
    const text = x.searchParams.get("text");
    assert([...text].length <= 120);
    assert(text.endsWith("…"), "Long X descriptions should visibly indicate truncation");
    assert.equal(x.searchParams.get("url"), data.url);
    for (const { href } of links) {
      for (const value of new URL(href).searchParams.values()) {
        assert(value.isWellFormed(), "Provider parameters must not contain broken Unicode");
      }
    }
  }
});

check(
  "short X text retains cancellation and provisional qualifications before long race names",
  () => {
    for (const [status, marker] of [
      ["Cancelled", /cancelled/i],
      ["Postponed", /postponed/i],
      ["Finished", /past race|finished/i],
    ]) {
      const data = buildRaceShareData({
        ...base,
        name: "東京 Marathon 🏃 ".repeat(40),
        location: "Norwich 東京 ".repeat(40),
        status,
        provisional: true,
      });
      const link = buildRaceShareLinks(data).find(({ id }) => id === "x");
      const text = new URL(link.href).searchParams.get("text");
      assert([...text].length <= 120);
      assert.match(text, marker);
      assert.match(text, /provisional/i);
      assert.match(text, /4 Jul(?:y)? 2027/);
    }
    const provisional = buildRaceShareData({ ...base, date: "2027-02-30", provisional: true });
    assert.match(provisional.text, /date to be confirmed/i);
  },
);

console.log(
  `PASS: ${checks} focused race-sharing checks; no external sharing or clipboard access.`,
);
