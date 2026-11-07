// Partnership emails go only to sites that refuse collection, once per site and address.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import "./collector-bulk-fixture.mjs"; // module resolution hooks; no network database

const { sendSourceOutreach, outreachEmail } =
  await import("../src/lib/race-collector/source-outreach.server.ts");
const pg = new PGlite();
await pg.exec(await readFile("migrations/20261107_source_outreach.sql", "utf8"));
const sql = async (strings, ...values) => {
  let q = strings[0];
  values.forEach((_, i) => (q += `$${i + 1}${strings[i + 1]}`));
  return (await pg.query(q, values)).rows;
};
const sent = [];
const send = async (email) => {
  sent.push(email);
  return `id-${sent.length}`;
};
const t = (id, email, reason = "disallowed by robots.txt") => ({
  sourceId: id,
  siteName: `Site ${id}`,
  siteUrl: `https://${id}.example/`,
  contactEmail: email,
  reason,
});
delete process.env.SOURCE_OUTREACH_ENABLED;
let r = await sendSourceOutreach([t("a", "info@a.example")], { sqlOverride: sql, send });
assert.equal(r.results[0].status, "would_send");
assert.equal(sent.length, 0);
process.env.SOURCE_OUTREACH_ENABLED = "true";
process.env.RESEND_API_KEY = "test";
r = await sendSourceOutreach(
  [
    t("a", "info@a.example"),
    t("b", "info@a.example"),
    t("c", ""),
    t("d", "x@d.example", "HTTP 403"),
  ],
  { sqlOverride: sql, send },
);
assert.deepEqual(
  r.results.map((x) => x.status),
  ["sent", "already_sent_to_address", "no_contact", "not_refused"],
);
r = await sendSourceOutreach([t("a", "info@a.example")], { sqlOverride: sql, send });
assert.equal(r.results[0].status, "already_sent");
assert.equal(sent.length, 1);
const e = outreachEmail(t("a", "info@a.example"));
assert.equal(e.from, "AthRecs <info@athrecs.com>");
assert.match(e.text, /won't contact you again/);
console.log(
  "Source outreach checks passed: only robots.txt refusals, dry run until switched on, one email per site and address, opt-out wording.",
);
