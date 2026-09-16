import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  brandSchema,
  opportunitySchema,
  applicationSchema,
  preferenceSchema,
} from "../src/lib/athrecs/partnerships.ts";
import * as service from "../src/lib/athrecs/partnerships.server.ts";

const pg = new PGlite();
await pg.waitReady;
for (const name of [
  "0001_auth.sql",
  "0002_athrecs.sql",
  "0013_result_claims.sql",
  "0014_athlete_accounts.sql",
  "0031_brand_partnerships.sql",
]) {
  await pg.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
}
function wrap(db) {
  const sql = async (strings, ...params) => {
    const query = strings.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, "");
    return (await db.query(query, params)).rows;
  };
  sql.query = async (query, params = []) => (await db.query(query, params)).rows;
  sql.transaction = (work) => db.transaction((tx) => work(wrap(tx)));
  return sql;
}
const sql = wrap(pg);
for (const id of ["brand", "other", "athlete", "junior", "staff", "club", "unverified"]) {
  await sql`insert into "user" (id, name, email, "emailVerified") values (${id}, ${id}, ${`${id}@example.test`}, ${id !== "unverified"})`;
}
await sql`insert into athletes (id, slug, display_name) values (101, 'test-athlete', 'Test Athlete'), (102, 'test-junior', 'Test Junior')`;
await sql`insert into athlete_account_links (athlete_id, user_id, user_email) values (101, 'athlete', 'athlete@example.test'), (102, 'junior', 'junior@example.test')`;
await sql`insert into athlete_private_profiles (user_id, verified_email, full_name, date_of_birth, privacy_notice_version, privacy_acknowledged_at)
  values ('junior', 'junior@example.test', 'Test Junior', (current_date - interval '16 years')::date, 'test', now())`;

const brand = brandSchema.parse({
  name: "Example Footwear",
  website: "https://example.test",
  category: "footwear",
  description: "Test company offering shoes for athletes.",
  sports: "Running",
  markets: "United Kingdom",
  contactName: "Test Manager",
  contactRole: "Partnerships manager",
  declaration: true,
});
assert.throws(() => brandSchema.parse({ ...brand, website: "javascript:alert(1)" }));
assert.throws(() => brandSchema.parse({ ...brand, declaration: false }));
await assert.rejects(() => service.registerBrand(sql, "unverified", brand), /verified email/);
const registered = await service.registerBrand(sql, "brand", brand);
const brandId = Number(registered.id);
assert.equal(
  (await service.publicPartnerships(sql)).brands.length,
  0,
  "Pending companies stay private",
);
await assert.rejects(
  () => service.registerBrand(sql, "other", { ...brand, website: "https://www.example.test/path" }),
  /already has a registration/,
);
const closingDate = new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10);
const opportunity = opportunitySchema.parse({
  title: "Running shoe testing",
  kind: "product_testing",
  audience: "both",
  description: "Try our running shoes and provide an honest product report.",
  benefits: "One pair of shoes, with no payment required.",
  requirements: "An honest written report; no public post is required.",
  sports: "Running",
  markets: "United Kingdom",
  closingDate,
  declaration: true,
});
await assert.rejects(
  () => service.submitOpportunity(sql, "brand", opportunity),
  /brand must be approved/,
);
await service.reviewPartnerItem(sql, "staff", {
  entity: "brand",
  id: brandId,
  revision: 1,
  action: "approved",
  note: "Company identity and representative authority checked independently.",
});
assert.equal((await service.publicPartnerships(sql)).brands.length, 1);
const created = await service.submitOpportunity(sql, "brand", opportunity);
const opportunityId = Number(created.id);
assert.equal((await service.publicPartnerships(sql)).opportunities.length, 0);
await assert.rejects(
  () => service.submitOpportunity(sql, "other", opportunity),
  /brand must be approved/,
);
await service.reviewPartnerItem(sql, "staff", {
  entity: "opportunity",
  id: opportunityId,
  revision: 1,
  action: "approved",
  note: "Terms, product claims and rights requirements checked.",
});
await assert.rejects(
  () =>
    service.reviewPartnerItem(sql, "staff", {
      entity: "opportunity",
      id: opportunityId,
      revision: 1,
      action: "rejected",
      note: "A stale review should not overwrite the latest decision.",
    }),
  /changed since/,
);
assert.equal((await service.publicPartnerships(sql)).opportunities.length, 1);
const publicJson = JSON.stringify(await service.publicPartnerships(sql));
assert.doesNotMatch(
  publicJson,
  /example.test.*@|contact_name|contact_role|owner_user_id|review_note|email/,
);

const application = applicationSchema.parse({
  opportunityId,
  applicantKind: "athlete",
  athleteId: 101,
  message: "I would like to test the shoes and provide feedback.",
  declaration: true,
  adultConfirmed: true,
});
await assert.rejects(
  () => service.applyToOpportunity(sql, "athlete", application),
  /Enable this type/,
);
assert.throws(() =>
  preferenceSchema.parse({
    sponsorship: true,
    productTesting: false,
    offers: false,
    adultConfirmed: false,
  }),
);
await assert.rejects(
  () =>
    service.savePreferences(sql, "junior", {
      sponsorship: true,
      productTesting: true,
      offers: true,
      adultConfirmed: true,
    }),
  /18 and over/,
);
await service.savePreferences(sql, "athlete", {
  sponsorship: false,
  productTesting: true,
  offers: false,
  adultConfirmed: true,
});
await assert.rejects(() => service.applyToOpportunity(sql, "other", application), /approved claim/);
const applied = await service.applyToOpportunity(sql, "athlete", application);
const applicationId = Number(applied.id);
await assert.rejects(
  () =>
    service.submitOpportunity(sql, "brand", {
      ...opportunity,
      id: opportunityId,
      revision: 2,
      kind: "sponsorship",
    }),
  /already applied/,
);
await assert.rejects(
  () =>
    service.registerBrand(sql, "brand", { ...brand, website: "https://different.example.test" }),
  /Company identity cannot change/,
);
assert.equal(
  (await service.publicPartnerships(sql)).opportunities[0].kind,
  "product_testing",
  "Applied terms remain unchanged",
);
await assert.rejects(
  () => service.applyToOpportunity(sql, "athlete", application),
  /already applied/,
);
assert.equal(
  (await service.myPartnerships(sql, "brand")).incoming.length,
  0,
  "Unreviewed applications are private",
);
assert.equal((await service.myPartnerships(sql, "other")).applications.length, 0);
await assert.rejects(
  () => service.respondToApplication(sql, "brand", applicationId, "A premature response."),
  /not available/,
);
await service.reviewPartnerItem(sql, "staff", {
  entity: "application",
  id: applicationId,
  revision: 1,
  action: "shared",
  note: "Applicant and intended disclosure checked.",
});
const incoming = (await service.myPartnerships(sql, "brand")).incoming;
assert.equal(incoming.length, 1);
assert.doesNotMatch(
  JSON.stringify(incoming),
  /athlete@example.test|date_of_birth|user_id|postcode/,
);
assert.equal(incoming[0].review_note, "", "Review evidence is not disclosed to companies");
await assert.rejects(
  () =>
    service.respondToApplication(
      sql,
      "other",
      applicationId,
      "Trying another brand's application.",
    ),
  /not available/,
);
await assert.rejects(() => service.withdrawApplication(sql, "other", applicationId), /not found/);
await service.respondToApplication(
  sql,
  "brand",
  applicationId,
  "Thank you. We would like to discuss the opportunity.",
);
assert.match(
  (await service.myPartnerships(sql, "athlete")).applications[0].brand_response,
  /Thank you/,
);
await sql`update athlete_account_links set status = 'revoked' where athlete_id = 101`;
assert.equal(
  (await service.myPartnerships(sql, "brand")).incoming.length,
  0,
  "Revoked claims remove company access",
);
await assert.rejects(
  () =>
    service.respondToApplication(
      sql,
      "brand",
      applicationId,
      "Cannot reply after claim revocation.",
    ),
  /not available/,
);
await sql`update athlete_account_links set status = 'active' where athlete_id = 101`;
await service.savePreferences(sql, "athlete", {
  sponsorship: false,
  productTesting: false,
  offers: false,
  adultConfirmed: true,
});
assert.equal(
  (await service.myPartnerships(sql, "brand")).incoming.length,
  0,
  "Withdrawing a category removes company access immediately",
);
assert.equal((await service.myPartnerships(sql, "athlete")).applications[0].status, "withdrawn");

const clubApp = await service.applyToOpportunity(
  sql,
  "club",
  applicationSchema.parse({
    opportunityId,
    applicantKind: "club",
    clubName: "Example AC",
    clubWebsite: "https://club.example.test",
    message: "I am the membership officer and request testing for our club.",
    declaration: true,
    adultConfirmed: true,
  }),
);
assert.equal(
  (await service.myPartnerships(sql, "brand")).incoming.length,
  0,
  "Club authority is reviewed before sharing",
);
await service.reviewPartnerItem(sql, "staff", {
  entity: "application",
  id: Number(clubApp.id),
  revision: 1,
  action: "shared",
  note: "Club chair contacted using the governing-body directory; authority confirmed.",
});
assert.equal((await service.myPartnerships(sql, "brand")).incoming.length, 1);
await service.reviewPartnerItem(sql, "staff", {
  entity: "brand",
  id: brandId,
  revision: 2,
  action: "suspended",
  note: "Representative authority has been withdrawn by the company.",
});
assert.equal(
  (await service.publicPartnerships(sql)).opportunities.length,
  0,
  "Suspending a brand hides its opportunities",
);
assert.equal((await service.myPartnerships(sql, "brand")).incoming.length, 0);
await assert.rejects(() => service.registerBrand(sql, "brand", brand), /suspended/);
await assert.rejects(() => service.closeOpportunity(sql, "other", opportunityId), /not found/);
await service.closeOpportunity(sql, "brand", opportunityId);
const [audit] = await sql`select count(*)::int as count from partner_audit`;
assert.ok(audit.count >= 13, "Decisions and withdrawals have an audit trail");
await pg.close();
console.log(
  "Partnership checks passed: approval gates, account isolation, privacy, club review, consent withdrawal, age checks, stale decisions and audit history.",
);
