import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  clubSaveSchema,
  clubReviewSchema,
  clubDetailsSchema,
} from "../src/lib/clubs/registration.ts";
import * as service from "../src/lib/clubs/registration.server.ts";

const pg = new PGlite();
await pg.waitReady;
function wrap(db) {
  const sql = async (strings, ...params) =>
    (
      await db.query(
        strings.reduce((q, s, i) => q + (i ? `$${i}` : "") + s, ""),
        params,
      )
    ).rows;
  sql.query = async (query, params = []) => (await db.query(query, params)).rows;
  sql.transaction = (fn) => db.transaction((tx) => fn(wrap(tx)));
  return sql;
}
const sql = wrap(pg);
try {
  for (const name of [
    "0001_auth.sql",
    "0002_athrecs.sql",
    "0013_result_claims.sql",
    "0014_athlete_accounts.sql",
    "20261013_club_registration.sql",
  ])
    await pg.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  await pg.exec(
    await readFile(
      new URL("../migrations/20261013_club_registration.sql", import.meta.url),
      "utf8",
    ),
  );
  for (const id of ["officer", "other", "staff", "unverified", "junior"])
    await sql`insert into "user" (id,name,email,"emailVerified") values (${id}, ${id}, ${`${id}@example.test`}, ${id !== "unverified"})`;
  await sql`insert into athlete_private_profiles (user_id, verified_email, full_name, date_of_birth, privacy_notice_version, privacy_acknowledged_at)
    values ('junior','junior@example.test','Synthetic Junior',(current_date - interval '16 years')::date,'test',now())`;
  const [club] =
    await sql`insert into clubs (slug,name,city,county,country,sports) values ('test-club','Synthetic Test Club','Norwich','Norfolk','England','Running') returning id`;
  const [club2] =
    await sql`insert into clubs (slug,name,city,county,country,sports) values ('other-club','Other Synthetic Club','Dublin','','Ireland','Running') returning id`;
  const details = clubDetailsSchema.parse({
    clubName: "Synthetic Test Club",
    country: "England",
    city: "Norwich",
    sports: ["Running"],
    representativeName: "Synthetic Officer",
    representativeRole: "Secretary",
    website: "https://club.example.test",
    verificationMethod: "officer_page",
    evidenceUrl: "https://club.example.test/committee",
    authorityDetails: "Appointed by our committee; the official club page identifies my role.",
    affiliation: "unaffiliated",
    adultConfirmed: true,
    authorityConfirmed: true,
    privacyAcknowledged: true,
  });
  const input = { clubId: club.id, details, submit: true };
  assert.throws(() =>
    clubSaveSchema.parse({ ...input, details: { ...details, authorityConfirmed: false } }),
  );
  assert.throws(() => clubDetailsSchema.parse({ evidenceUrl: "javascript:alert(1)" }));
  assert.throws(() =>
    clubDetailsSchema.parse({ evidenceUrl: "https://user:password@example.test/" }),
  );
  assert.throws(() =>
    clubDetailsSchema.parse({ evidenceUrl: "https://example.test/?token=secret" }),
  );
  await assert.rejects(
    () => service.saveClubApplication(sql, "unverified", input),
    /Verify your account email/,
  );
  await assert.rejects(
    () => service.saveClubApplication(sql, "junior", input),
    /adult club representative/,
  );
  await assert.rejects(
    () => service.saveClubApplication(sql, "officer", { ...input, clubId: 9999 }),
    /existing club/,
  );
  await assert.rejects(
    () => service.requireClubRepresentative(sql, "officer", club.id),
    /required/,
  );
  const draft = await service.saveClubApplication(sql, "unverified", {
    ...input,
    submit: false,
    details: clubDetailsSchema.parse({}),
  });
  assert.equal(
    draft.status,
    "draft",
    "Unverified accounts can save incomplete drafts without getting access",
  );
  assert.equal(
    (await service.clubReviewQueue(sql, "pending", 1)).total,
    0,
    "Drafts stay out of submitted review queue",
  );
  const app = await service.saveClubApplication(sql, "officer", input);
  assert.equal(app.status, "pending");
  assert.equal((await service.myClubApplications(sql, "other")).applications.length, 0);
  await assert.rejects(
    () =>
      service.saveClubApplication(sql, "other", { ...input, id: app.id, revision: app.revision }),
    /not found for this account/,
  );
  await assert.rejects(
    () => service.withdrawClubApplication(sql, "other", app.id, app.revision),
    /not found for this account/,
  );
  await assert.rejects(
    () => service.saveClubApplication(sql, "officer", input),
    /already have an application/,
  );
  await assert.rejects(
    () =>
      service.saveClubApplication(sql, "officer", {
        ...input,
        id: app.id,
        revision: app.revision,
        clubId: club2.id,
      }),
    /selected club cannot change/,
  );
  const decision = {
    id: app.id,
    revision: app.revision,
    action: "approved",
    message: "Your appointment has been confirmed.",
    evidenceNote:
      "PRIVATE AUDIT: verified independent club contact and committee appointment on 2026-10-13.",
    identityChecked: true,
    authorityChecked: true,
    createListing: false,
  };
  assert.throws(() => clubReviewSchema.parse({ ...decision, authorityChecked: false }));
  await assert.rejects(
    () => service.reviewClubApplication(sql, "officer", decision),
    /Another staff member/,
  );
  await assert.rejects(
    () => service.reviewClubApplication(sql, "staff", { ...decision, resolvedClubId: club2.id }),
    /selected directory club/,
  );
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    action: "needs_changes",
    message: "Please clarify your committee appointment date.",
  });
  await assert.rejects(
    () =>
      service.saveClubApplication(sql, "officer", { ...input, id: app.id, revision: app.revision }),
    /changed/,
  );
  const returned = (await service.myClubApplications(sql, "officer")).applications[0];
  assert.equal(returned.status, "needs_changes");
  assert.ok(
    !JSON.stringify(returned).includes("PRIVATE AUDIT"),
    "Applicant never sees private review evidence",
  );
  const resubmitted = await service.saveClubApplication(sql, "officer", {
    ...input,
    id: app.id,
    revision: returned.revision,
  });
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    revision: resubmitted.revision,
  });
  await service.requireClubRepresentative(sql, "officer", club.id);
  await assert.rejects(
    () => service.requireClubRepresentative(sql, "officer", club2.id),
    /required/,
  );
  await assert.rejects(() => service.requireClubRepresentative(sql, "other", club.id), /required/);
  assert.equal(
    (await sql`select count(*)::int as n from athlete_account_links`)[0].n,
    0,
    "Club approval never claims athletes",
  );
  assert.equal(
    (await sql`select name from clubs where id = ${club.id}`)[0].name,
    "Synthetic Test Club",
    "Existing listing is not overwritten by registration",
  );
  const approved = (await service.myClubApplications(sql, "officer")).applications[0];
  await assert.rejects(
    () =>
      service.saveClubApplication(sql, "officer", {
        ...input,
        id: app.id,
        revision: approved.revision,
      }),
    /closed/,
  );
  await sql`update "user" set email = 'changed@example.test' where id = 'officer'`;
  await assert.rejects(
    () => service.requireClubRepresentative(sql, "officer", club.id),
    /required/,
  );
  await sql`update "user" set email = 'officer@example.test' where id = 'officer'`;
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    revision: approved.revision,
    action: "revoked",
    message: "The club has reported a change of secretary.",
  });
  await assert.rejects(
    () => service.requireClubRepresentative(sql, "officer", club.id),
    /required/,
  );
  await assert.rejects(
    () => service.reviewClubApplication(sql, "staff", { ...decision, revision: approved.revision }),
    /changed/,
  );
  const newInput = {
    ...input,
    clubId: null,
    details: { ...details, clubName: "New Synthetic Club" },
  };
  const missing = await service.saveClubApplication(sql, "other", newInput);
  assert.equal(
    (await sql`select count(*)::int as n from clubs`)[0].n,
    2,
    "Missing club requests are not automatically published",
  );
  await assert.rejects(
    () => service.reviewClubApplication(sql, "staff", { ...decision, id: missing.id, revision: 1 }),
    /Select the existing club/,
  );
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    id: missing.id,
    revision: 1,
    createListing: true,
  });
  const newClub = (await service.myClubApplications(sql, "other")).applications.find(
    (a) => a.id === missing.id,
  );
  await service.requireClubRepresentative(sql, "other", newClub.club_id);
  assert.equal((await sql`select count(*)::int as n from clubs`)[0].n, 3);
  const duplicateMissing = await service.saveClubApplication(sql, "officer", {
    ...newInput,
    details: { ...newInput.details, clubName: "New   Synthetic Club" },
  });
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", {
        ...decision,
        id: duplicateMissing.id,
        revision: 1,
        createListing: true,
      }),
    /already listed/,
  );
  assert.equal(
    (await service.myClubApplications(sql, "officer")).applications.find(
      (a) => a.id === duplicateMissing.id,
    ).status,
    "pending",
    "Failed approval rolls back",
  );
  await service.withdrawClubApplication(sql, "officer", duplicateMissing.id, 1);
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", {
        ...decision,
        id: duplicateMissing.id,
        revision: 2,
      }),
    /current status/,
  );
  const second = await service.saveClubApplication(sql, "other", { ...input, clubId: club2.id });
  await sql`update "user" set "emailVerified" = false where id = 'other'`;
  await assert.rejects(
    () => service.reviewClubApplication(sql, "staff", { ...decision, id: second.id, revision: 1 }),
    /verified email changed/,
  );
  assert.ok((await sql`select count(*)::int as n from club_registration_audit`)[0].n >= 10);
  console.log(
    "Club registration: schema, draft/resume, verified email, minors, cross-account isolation, stale changes, self-review, evidence privacy, approval, revocation, duplicate listings and rollback passed.",
  );
} finally {
  await pg.close();
}
