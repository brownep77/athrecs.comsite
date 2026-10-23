import assert from "node:assert/strict";
import { calendarDownloadResponse } from "../src/lib/athrecs/calendar-download.ts";
const race = {
  id: "download-test",
  name: "Test race 🏃",
  date: "2027-07-04",
  startTime: "10:00",
  timeZone: "Europe/London",
  pageUrl: "https://www.athrecs.com/races/test",
  location: "Test venue",
};
const request = (value = race) =>
  new Request("https://www.athrecs.com/api/event-calendar", {
    method: "POST",
    body: new URLSearchParams({ race: JSON.stringify(value) }),
  });
let checks = 0;
for (const [input, status] of [
  [race, 200],
  [{ ...race, startTime: null }, 200],
  [{ ...race, date: "2027-02-30" }, 422],
  [{ ...race, status: "Cancelled" }, 422],
  [{ ...race, endDate: "2027-01-01" }, 422],
  [{}, 400],
  [null, 400],
  [[], 400],
  [{ ...race, name: [] }, 400],
  [{ ...race, timeZone: {} }, 400],
  [{ ...race, name: "x".repeat(1001) }, 400],
  [{ ...race, provisional: "false" }, 400],
]) {
  assert.equal((await calendarDownloadResponse(request(input))).status, status);
  checks++;
}
const response = await calendarDownloadResponse(request());
assert.equal(response.headers.get("content-type"), "text/calendar; charset=utf-8");
assert.match(
  response.headers.get("content-disposition"),
  /^attachment; filename="[A-Za-z0-9-]+\.ics"$/,
);
assert.equal(response.headers.get("cache-control"), "private, no-store");
assert.match(await response.text(), /DTSTART:20270704T090000Z\r\n/);
checks++;
const attack = await calendarDownloadResponse(
  request({
    ...race,
    id: "x\r\nBEGIN:VEVENT",
    name: "x\r\nBEGIN:VEVENT",
    pageUrl: "javascript:alert(1)",
    notes: "PRIVATE EVIDENCE",
    officialUrl: "https://runabc.co.uk/withheld",
  }),
);
const ics = await attack.text();
assert.equal(ics.match(/^BEGIN:VEVENT/gm).length, 1);
assert(!ics.includes("javascript:"));
assert(!ics.includes("PRIVATE EVIDENCE"));
assert(!/runabc/i.test(ics));
checks++;
assert.equal(
  (await calendarDownloadResponse(new Request("https://www.athrecs.com/api/event-calendar")))
    .status,
  405,
);
checks++;
assert.equal(
  (
    await calendarDownloadResponse(
      new Request("https://www.athrecs.com/api/event-calendar", {
        method: "POST",
        body: "not a form",
      }),
    )
  ).status,
  415,
);
checks++;
for (const body of [
  "race=%7Bbroken",
  "race=null",
  "race=%7B%7D&race=%7B%7D",
  "missing=x",
  "race=" + "x".repeat(65536),
]) {
  const result = await calendarDownloadResponse(
    new Request("https://www.athrecs.com/api/event-calendar", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    }),
  );
  assert.equal(result.status, body.length > 65536 ? 413 : 400);
  checks++;
}
let canceled = false;
const stream = new ReadableStream({
  pull(controller) {
    controller.enqueue(new Uint8Array(16384));
  },
  cancel() {
    canceled = true;
  },
});
assert.equal(
  (
    await calendarDownloadResponse(
      new Request("https://www.athrecs.com/api/event-calendar", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: stream,
        duplex: "half",
      }),
    )
  ).status,
  413,
);
assert(canceled);
checks++;
console.log(
  `PASS: ${checks} server calendar download checks, including malformed bodies, unavailable events, unsafe fields, response headers and bounded streaming.`,
);
