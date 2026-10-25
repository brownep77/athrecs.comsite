import assert from "node:assert/strict";
import { bulkFixture } from "./collector-bulk-fixture.mjs";

const { applyImportBundle, parseEventsCsv } = await import("../src/lib/athrecs/import.server.ts");
const { pg, sql } = await bulkFixture();
try {
  const parsed = parseEventsCsv("name,sport,country,city\nSynthetic Virtual Open,CrossFit,International,Virtual");
  assert.equal(parsed.events[0].county, "");
  assert.equal(parsed.events[0].surface, "");
  assert.equal(parsed.events[0].summary, "Synthetic Virtual Open");
  const unknown = parseEventsCsv("name\nSynthetic Unknown Venue").events[0];
  for (const field of ["country", "county", "city", "surface"]) assert.equal(unknown[field], "");

  const event = { slug: "synthetic-virtual-open", name: "Synthetic Virtual Open", sport: "CrossFit", country: "International", city: "Virtual" };
  const apply = async (bundle) => {
    const result = await applyImportBundle(bundle, { sqlOverride: sql });
    assert.deepEqual(result.errors, []);
  };
  const read = async () => (await sql.query("select country,county,city,area,surface from events where slug=$1", [event.slug]))[0];
  await apply({ events: [event] });
  assert.deepEqual(await read(), { country: "International", county: "", city: "Virtual", area: "", surface: "" });
  await apply({ events: [{ ...event, country: "Sweden", county: "Stockholm County", city: "Stockholm", area: "Test Venue", surface: "Indoor" }] });
  await apply({ events: [{ slug: event.slug, name: event.name, sport: event.sport }] });
  assert.deepEqual(await read(), { country: "Sweden", county: "Stockholm County", city: "Stockholm", area: "Test Venue", surface: "Indoor" });
  await apply({ events: [{ ...event, county: "", surface: "" }] });
  assert.equal((await read()).county, "", "Explicit corrections can clear an invented county");
  assert.equal((await read()).surface, "");
  await apply({ editions: [{ eventName: "Synthetic Edition Only", date: "2027-02-17", distance: "Other" }] });
  const minimal = (await sql.query("select country,county,city,surface from events where slug='synthetic-edition-only'"))[0];
  assert.deepEqual(minimal, { country: "", county: "", city: "", surface: "" });
  console.log("PASS: imports leave unknown geography and surfaces blank, preserve existing evidence when omitted, and support explicit corrections.");
} finally {
  await pg.close();
}
