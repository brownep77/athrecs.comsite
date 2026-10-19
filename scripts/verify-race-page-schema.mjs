import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { sportsEventJsonLd } from "../src/lib/athrecs/seo.ts";
import * as runrecsSeo from "../src/runrecs/seo.ts";

const race = {
  name: 'Example meeting "Autumn"',
  slug: "example-autumn-meeting",
  description: "Example meeting archive and race details.",
  city: "Example City",
  country: "Example Country",
  sport: "Athletics",
  website: "https://example.org/meeting",
};
const serialized = (input) => JSON.parse(JSON.stringify(sportsEventJsonLd(input)));

assert.equal(
  sportsEventJsonLd({ ...race, startDate: "2027-04-25", organiser: "See official site" }).organizer,
  undefined,
);
for (const organiser of [
  "See runABC / organiser", "See official race site", "See event listing",
  "Official event organiser", "England Athletics licensed competition",
  "World Athletics / national federation", "UTMB World Series / local organiser",
  "Park West race organiser / Eventmaster",
]) {
  assert.equal(sportsEventJsonLd({ ...race, startDate: "2027-04-25", organiser }).organizer,
    undefined, `Do not publish placeholder as an organisation: ${organiser}`);
}

const now = new Date("2026-10-12T17:00:00Z");
const option = {
  is_verified: true,
  entry_type: "official",
  entry_url: "https://example.org/entry",
  price_amount: "25.00",
  price_currency: "GBP",
  status: "open",
  source_url: "https://example.org/race-information",
};
const offerFor = (overrides = {}, at = now) =>
  JSON.parse(
    JSON.stringify(
      sportsEventJsonLd(
        {
          ...race,
          startDate: "2027-04-25",
          entryOptions: [{ ...option, ...overrides }],
        },
        at,
      ),
    ),
  ).offers;
for (const [status, availability] of [
  ["open", "InStock"],
  ["closing_soon", "InStock"],
  ["sold_out", "SoldOut"],
]) {
  const [offer] = offerFor({ status });
  assert.equal(offer.availability, `https://schema.org/${availability}`);
  assert.equal(offer.price, 25);
  assert.equal("validFrom" in offer, false, "No invented sale-start date");
}
for (const status of ["closed", "waitlist", "ballot"]) {
  assert.deepEqual(offerFor({ status }), [], `${status} is not a purchasable ticket`);
}
for (const status of ["unknown", "unrecognised"]) {
  assert.equal("availability" in offerFor({ status })[0], false);
}
for (const overrides of [
  { is_verified: false },
  { entry_type: "third_party" },
  { entry_type: "charity" },
  { entry_type: "tour_operator" },
  { entry_url: "https://" },
  { entry_url: "http://example.org/entry" },
  { entry_url: "https://user:password@example.org" },
  { price_amount: null },
  { price_amount: "" },
  { price_amount: "   " },
  { price_amount: "TBC" },
  { price_amount: -1 },
  { price_amount: Infinity },
  { price_currency: null },
  { price_currency: "gbp" },
  { price_currency: "£" },
])
  assert.deepEqual(offerFor(overrides), [], JSON.stringify(overrides));
assert.equal(offerFor({ price_amount: 0 })[0].price, 0, "Explicit free entry remains valid");
assert.equal(offerFor({ opens_at: "2026-01-03" })[0].validFrom, "2026-01-03");
assert.equal(offerFor({ opens_at: "2024-02-29" })[0].validFrom, "2024-02-29");
for (const opens_at of [
  null,
  "",
  "mid-February",
  "2026",
  "2026-02-29",
  "2026-04-31",
  "2027-04-26",
  "2026-01-03T18:00:00Z",
]) {
  assert.equal("validFrom" in offerFor({ opens_at })[0], false, String(opens_at));
}
assert.equal("validFrom" in offerFor({ opens_at: "2026-01-03", source_url: null })[0], false);
assert.equal("validFrom" in offerFor({ opens_at: "2026-01-03", source_url: "invalid" })[0], false);
assert.equal(
  "validFrom" in offerFor({ checked_at: "2026-01-03", created_at: "2026-01-03" })[0],
  false,
);
const futureSale = offerFor({ status: "closed", opens_at: "2026-12-01" })[0];
assert.equal(futureSale.validFrom, "2026-12-01");
assert.equal("availability" in futureSale, false, "Not yet on sale is not PreOrder");
assert.equal(
  "availability" in offerFor({ opens_at: "2026-12-01" })[0],
  false,
  "Future sale does not claim InStock",
);
assert.equal(
  offerFor({ closes_at: "2026-10-11" }).length,
  0,
  "Do not advertise expired tickets as in stock",
);
assert.equal(offerFor({ closes_at: "2026-10-12" }).length, 1, "Keep date-only deadlines inclusive");
assert.equal(
  offerFor({ closes_at: "2026-10-12" }, new Date("2026-10-12T23:30:00Z")).length,
  0,
  "After UK midnight a ticket must not remain InStock until UTC midnight",
);
assert.equal(
  offerFor({ closes_at: "2026-10-12" }, new Date("2026-10-12T22:59:59Z")).length,
  1,
  "The UK closing day remains inclusive until midnight",
);
assert.equal(
  offerFor({ closes_at: "2026-12-01" }, new Date("2026-12-01T23:30:00Z")).length,
  1,
  "Winter deadlines follow GMT without a fixed summer offset",
);
assert.equal(
  offerFor({ opens_at: "2026-10-13" }, new Date("2026-10-12T23:30:00Z"))[0].availability,
  "https://schema.org/InStock",
  "A verified open status on its opening day uses the same UK date as the page",
);
assert.equal(
  offerFor({ status: "sold_out", closes_at: "2026-10-11" })[0].availability,
  "https://schema.org/SoldOut",
);
assert.equal(
  "validFrom" in offerFor({ opens_at: "2026-12-01", closes_at: "2026-11-01" })[0],
  false,
);

// Historical pages and undated listings must not emit incomplete event items.
// Invalid calendar dates must not become made-up race dates through JS rollover.
for (const startDate of [
  undefined,
  null,
  "",
  "TBC",
  "2026",
  "2026-2-3",
  "2026-02-29",
  "2026-04-31",
  "2026-13-01",
  "2026-00-01",
]) {
  const item = serialized({ ...race, startDate, startTime: "09:00" });
  assert.equal(item["@type"], "WebPage", String(startDate));
  assert.equal(item.name, race.name);
  assert.equal(item.description, race.description);
  assert.equal(item.url, `https://www.athrecs.com/races/${race.slug}`);
  for (const field of ["startDate", "eventStatus", "eventAttendanceMode", "organizer", "location"])
    assert.equal(field in item, false, `${String(startDate)}: unexpected event field ${field}`);
}

// Keep dated event listings eligible, without inventing an unknown start time.
const dateOnly = serialized({ ...race, startDate: "2026-10-10" });
assert.equal(dateOnly["@type"], "SportsEvent");
assert.equal(dateOnly.startDate, "2026-10-10");
assert.equal(dateOnly.eventStatus, "https://schema.org/EventScheduled");
assert.equal(dateOnly.location.address.addressLocality, race.city);
assert.equal(dateOnly.location.address.addressCountry, race.country);
assert.equal(serialized({ ...race, startDate: "2028-02-29" }).startDate, "2028-02-29");
assert.equal(
  serialized({ ...race, startDate: "2026-10-10", startTime: "09:30:00" }).startDate,
  "2026-10-10T09:30:00",
);

// Exercise serialized output from both actual build variants. The previous
// export-only compatibility test did not catch RunRecs emitting undated events.
for (const [brand, generate] of [
  ["athrecs", sportsEventJsonLd],
  ["runrecs", runrecsSeo.sportsEventJsonLd],
]) {
  const schema = (fields) => JSON.parse(JSON.stringify(generate({ ...race, ...fields })));
  for (const startDate of [
    undefined, null, "", "TBC", "2027", "2027-04", "2027-2-3",
    "2027-02-29", "2027-04-31", "2027-00-01", "2027-13-01",
    "2027-04-25T09:30:00Z", " 2027-04-25 ",
  ]) {
    const item = schema({ startDate, startTime: "09:30" });
    assert.equal(item["@type"], "WebPage", `${brand}: ${String(startDate)}`);
    assert.equal(item.name, race.name);
    assert.equal(item.description, race.description);
    assert.equal(item.url, `https://www.${brand}.com/races/${race.slug}`);
    for (const field of ["startDate", "offers", "eventStatus", "location", "organizer"])
      assert.equal(field in item, false, `${brand}: undated ${field}`);
  }
  for (const startTime of [
    undefined, null, "", "TBC", "09:30", "09:30:00", "00:00", "23:59:59",
    "9:30", "24:00", "09:60", "09:30:60", "09:30Z", "09:30+01:00", " 09:30 ",
  ]) {
    const item = schema({ startDate: "2027-04-25", startTime });
    const validTimes = ["09:30", "09:30:00", "00:00", "23:59:59"];
    assert.equal(item["@type"], "SportsEvent");
    assert.equal(
      item.startDate,
      validTimes.includes(startTime) ? `2027-04-25T${startTime}` : "2027-04-25",
      `${brand}: preserve date precision for ${String(startTime)}`,
    );
  }
  assert.equal(schema({ startDate: "2028-02-29" }).startDate, "2028-02-29");
  assert.equal(schema({ startDate: "2000-02-29" }).startDate, "2000-02-29");
  assert.equal(schema({ startDate: "1900-02-29" })["@type"], "WebPage");
}

// Only explicitly supplied, real ending dates/times belong in Event markup.
for (const endDate of [undefined, null, "", "TBC", "2027-02-29", "2027-05-08"]) {
  assert.equal(serialized({ ...race, startDate: "2027-05-09", endDate }).endDate, undefined);
}
assert.equal(
  serialized({
    ...race,
    startDate: "2027-05-09",
    endDate: "2027-05-09",
    startTime: "07:30",
    endTime: "10:00",
  }).endDate,
  "2027-05-09T10:00",
);
assert.equal(
  serialized({
    ...race,
    startDate: "2027-05-09",
    endDate: "2027-05-10",
    startTime: "23:00",
    endTime: "01:00",
  }).endDate,
  "2027-05-10T01:00",
);
for (const endTime of ["25:00", "10:99", "07:00", "about 10am"]) {
  assert.equal(
    serialized({
      ...race,
      startDate: "2027-05-09",
      endDate: "2027-05-09",
      startTime: "07:30",
      endTime,
    }).endDate,
    "2027-05-09",
  );
}
const sparse = serialized({ ...race, startDate: "2027-05-09", organiser: "  " });
assert.equal("organizer" in sparse, false);
assert.equal("endDate" in sparse, false, "Do not assume every race ends on its starting day");
assert.equal(
  "performer" in sparse,
  false,
  "Do not turn race participants into invented performers",
);
assert.equal(
  serialized({ ...race, startDate: "2027-05-09", organiser: " Example Club " }).organizer.name,
  "Example Club",
);

// The route must use the shared guard and the displayed upcoming edition.
const route = readFileSync(new URL("../src/routes/races/$slug.tsx", import.meta.url), "utf8");
assert.match(route, /sportsEventJsonLd\(\{/);
const nextSelectors = [...route.matchAll(/const next = (upcoming\.find\([^;]+\));/g)];
assert.equal(
  nextSelectors.length,
  2,
  "The page and its structured data select a scheduled edition",
);
for (const [, expression] of nextSelectors) {
  const selectNext = new Function("upcoming", `return ${expression};`);
  const selected = selectNext([
    { event_date: "2026-12-26", status: "Cancelled", start_time: "09:00" },
    { event_date: "2027-01-01", status: "Open", start_time: "09:30" },
  ]);
  assert.equal(selected.event_date, "2027-01-01");
  assert.equal(
    serialized({ ...race, startDate: selected.event_date, startTime: selected.start_time })
      .startDate,
    "2027-01-01T09:30",
  );
  assert.equal(selectNext([{ event_date: "2026-12-26", status: "Cancelled" }]), undefined);
}
assert.match(route, /startDate: next\?\.event_date/);
assert.match(route, /startTime: next\?\.start_time/);
assert.match(route, /entryOptions: next\?\.entry_options/);
assert.match(route, /endDate: next\?\.end_date/);
assert.match(route, /endTime: next\?\.end_time/);
assert.equal(
  serialized({ ...race, entryOptions: [option] }).offers,
  undefined,
  "Archive and undated pages never advertise current tickets",
);

// Vite substitutes the RunRecs SEO module in specialist builds. Every shared
// route import must retain a matching export in that module.
const seoImports = route.match(/import \{([^}]+)\} from "@\/lib\/athrecs\/seo"/);
assert(seoImports);
for (const name of seoImports[1].split(",").map((value) => value.trim())) {
  assert(name in runrecsSeo, `Missing RunRecs SEO export: ${name}`);
}

console.log(
  "Race-page schema verified: archive/undated fallback, sourced offers, explicit availability, real opening dates and expired/ballot/waitlist safeguards.",
);
