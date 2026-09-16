import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { sponsorshipSchema } from "../src/lib/sponsorship.ts";
import * as service from "../src/lib/sponsorship.server.ts";

const pg = new PGlite();
await pg.waitReady;
for (const name of ["0001_auth.sql", "0032_sponsorship_enquiries.sql"]) {
  await pg.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
}
await pg.exec(
  "create table athlete_private_profiles (user_id text primary key, date_of_birth date)",
);
function wrap(db) {
  const sql = async (strings, ...params) =>
    (
      await db.query(
        strings.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
        params,
      )
    ).rows;
  sql.query = async (query, params = []) => (await db.query(query, params)).rows;
  sql.transaction = (work) => db.transaction((tx) => work(wrap(tx)));
  return sql;
}
const sql = wrap(pg);
for (const id of ["owner", "other", "staff", "unverified", "junior"]) {
  await sql`insert into "user" (id, name, email, "emailVerified") values (${id}, ${id}, ${`${id}@example.test`}, ${id !== "unverified"})`;
}
await sql`insert into athlete_private_profiles values ('junior', current_date - interval '16 years')`;
const futureDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const input = sponsorshipSchema.parse({
  requestId: randomUUID(),
  kind: "race_organiser",
  contactName: "Example Organiser",
  name: "Test Road Race",
  website: "https://example.test/race",
  location: "Norwich, UK",
  eventDate: futureDate,
  support: "mixed",
  budget: "GBP 5,000",
  reach: "Estimate: 500 entrants, organiser forecast",
  message: "Seeking a title sponsor and product sampling for a test event.",
  declaration: true,
  adultConfirmed: true,
});
assert.throws(() => sponsorshipSchema.parse({ ...input, declaration: false }));
assert.throws(() => sponsorshipSchema.parse({ ...input, adultConfirmed: false }));
assert.throws(() => sponsorshipSchema.parse({ ...input, eventDate: undefined }));
assert.throws(() => sponsorshipSchema.parse({ ...input, website: "javascript:alert(1)" }));
await assert.rejects(
  () => service.createSponsorshipEnquiry(sql, "unverified", "runrecs", input),
  /verified email/,
);
await assert.rejects(
  () => service.createSponsorshipEnquiry(sql, "junior", "athrecs", input),
  /18 and over/,
);
await assert.rejects(
  () =>
    service.createSponsorshipEnquiry(sql, "owner", "runrecs", {
      ...input,
      eventDate: "2000-01-01",
    }),
  /upcoming/,
);
const first = await service.createSponsorshipEnquiry(sql, "owner", "runrecs", input);
assert.deepEqual(
  await service.createSponsorshipEnquiry(sql, "owner", "runrecs", input),
  first,
  "Network retries must not duplicate a brief",
);
assert.equal((await service.mySponsorshipEnquiries(sql, "owner")).enquiries.length, 1);
assert.equal(
  (await service.mySponsorshipEnquiries(sql, "other")).enquiries.length,
  0,
  "Other account cannot read a private brief",
);
await assert.rejects(
  () => service.withdrawSponsorshipEnquiry(sql, "other", first.id),
  /unavailable/,
);
const [queued] = await service.sponsorshipReviewQueue(sql, "pending");
assert.equal(queued.source, "runrecs");
assert.equal(queued.email, "owner@example.test");
assert.equal("email" in (await service.mySponsorshipEnquiries(sql, "owner")).enquiries[0], false);
await service.reviewSponsorshipEnquiry(sql, "staff", {
  id: first.id,
  revision: 1,
  status: "in_review",
  response: "Please confirm your authority to represent this event.",
});
assert.match(
  (await service.mySponsorshipEnquiries(sql, "owner")).enquiries[0].response,
  /confirm your authority/,
);
await assert.rejects(
  () =>
    service.reviewSponsorshipEnquiry(sql, "staff", {
      id: first.id,
      revision: 1,
      status: "closed",
      response: "This stale response must not overwrite the latest state.",
    }),
  /changed or is closed/,
);
await service.withdrawSponsorshipEnquiry(sql, "owner", first.id);
assert.equal((await service.sponsorshipReviewQueue(sql, "in_review")).length, 0);
await assert.rejects(
  () =>
    service.reviewSponsorshipEnquiry(sql, "staff", {
      id: first.id,
      revision: 3,
      status: "in_review",
      response: "A withdrawn enquiry must not be reopened by a reviewer.",
    }),
  /changed or is closed/,
);
for (let i = 0; i < 5; i++)
  await service.createSponsorshipEnquiry(sql, "owner", "athrecs", {
    ...input,
    requestId: randomUUID(),
    kind: "creator",
    eventDate: undefined,
  });
await assert.rejects(
  () =>
    service.createSponsorshipEnquiry(sql, "owner", "runrecs", {
      ...input,
      requestId: randomUUID(),
    }),
  /five open enquiries/,
);
assert.equal((await service.mySponsorshipEnquiries(sql, "other")).enquiries.length, 0);
assert.equal(
  Number(
    (
      await sql`select count(*) as count from sponsorship_enquiry_audit where enquiry_id = ${first.id}`
    )[0].count,
  ),
  3,
);
// The API boundary must use session identity for private calls and the staff gate for reviews.
const api = await readFile(new URL("../src/lib/sponsorship-api.ts", import.meta.url), "utf8");
assert.equal((api.match(/middleware\(\[authMiddleware\]\)/g) ?? []).length, 3);
assert.equal((api.match(/middleware\(\[staffMiddleware\]\)/g) ?? []).length, 2);
assert.match(api, /context\.userId, PUBLIC_SITE_BRAND, data/);
await pg.close();
console.log(
  "Sponsorship privacy, account eligibility, withdrawal, idempotency, review and abuse-limit checks passed.",
);
