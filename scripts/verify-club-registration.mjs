import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  clubSaveSchema,
  clubReviewSchema,
  clubDetailsSchema,
} from "../src/lib/clubs/registration.ts";
import {
  startClubConfirmation,
  answerClubConfirmation,
} from "../src/lib/clubs/confirmation.server.ts";
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
    "20261102_club_officer_confirmations.sql",
  ])
    await pg.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  await pg.exec(
    await readFile(
      new URL("../migrations/20261013_club_registration.sql", import.meta.url),
      "utf8",
    ),
  );
  for (const id of ["officer", "other", "staff", "unverified", "junior", "second-officer"])
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
  const additionalSports = [
    "HYROX",
    "DEKA",
    "CrossFit",
    "Swimrun",
    "Indoor Rowing",
    "Orienteering",
    "Aquathlon",
    "Aquabike",
    "OCR",
    "Adventure Racing",
  ];
  assert.deepEqual(clubDetailsSchema.parse({ sports: additionalSports }).sports, additionalSports);
  assert.throws(() => clubDetailsSchema.parse({ sports: ["Unsupported sport"] }));
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
  const req = {
    id: app.id,
    revision: resubmitted.revision,
    targetClubId: club.id,
    method: "email",
    sourceUrl: "https://club.example.test/committee",
    contact: "chair@example.test",
    replyNote: "",
  };
  let mail;
  const capture = async (m) => {
    mail = m;
  };
  const token = () => new URL(mail.actionUrl).hash.slice(1);
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", { ...decision, revision: resubmitted.revision }),
    /Independent club confirmation/,
  );
  await assert.rejects(
    () => startClubConfirmation(sql, "officer", req, capture),
    /independent reviewer/,
  );
  await assert.rejects(
    () => startClubConfirmation(sql, "staff", { ...req, contact: "officer@example.test" }, capture),
    /distinct/,
  );
  await assert.rejects(
    () => startClubConfirmation(sql, "staff", { ...req, targetClubId: club2.id }, capture),
    /directory club/,
  );
  await assert.rejects(
    () =>
      startClubConfirmation(sql, "staff", req, async () => {
        throw Error("test failure");
      }),
    /Delivery/,
  );
  await startClubConfirmation(sql, "staff", req, capture);
  assert.match(mail.message, /Synthetic Officer/);
  assert.match(mail.message, /officer@example.test/);
  assert.match(mail.message, /Synthetic Test Club/);
  assert.equal(await answerClubConfirmation(sql, "x".repeat(43), "confirmed"), false);
  assert.equal(
    (
      await sql`select expires_at - updated_at = interval '48 hours' as exact
      from club_officer_confirmations where application_id=${app.id}`
    )[0].exact,
    true,
  );
  const expired = token();
  await sql`update club_officer_confirmations set updated_at=now()-interval '2 days',expires_at=now()-interval '1 hour' where application_id=${app.id}`;
  assert.equal(await answerClubConfirmation(sql, expired, "confirmed"), false);
  await startClubConfirmation(sql, "staff", req, capture);
  assert.equal(await answerClubConfirmation(sql, expired, "confirmed"), false);
  assert.equal(await answerClubConfirmation(sql, token(), "confirmed"), true);
  assert.equal(await answerClubConfirmation(sql, token(), "disputed"), false);
  await assert.rejects(
    () => service.requireClubRepresentative(sql, "officer", club.id),
    /required/,
  );
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
  const edit = {
    clubId: club.id,
    revision: 0,
    biography: "Synthetic club biography",
    training: "Wednesdays",
    contactUrl: "https://club.example.test/join",
  };
  await assert.rejects(() => service.saveClubContent(sql, "other", edit), /required/);
  await assert.rejects(
    () => service.saveClubContent(sql, "officer", { ...edit, clubId: club2.id }),
    /required/,
  );
  await service.saveClubContent(sql, "officer", edit);
  await assert.rejects(() => service.saveClubContent(sql, "officer", edit), /changed/);
  // Staff can correct the proposed directory match for a missing-club request.
  const secondOfficer = await service.saveClubApplication(sql, "second-officer", {
    ...input,
    clubId: club2.id,
  });
  await startClubConfirmation(
    sql,
    "staff",
    {
      ...req,
      id: secondOfficer.id,
      revision: secondOfficer.revision,
      targetClubId: club2.id,
    },
    capture,
  );
  assert.equal(await answerClubConfirmation(sql, token(), "confirmed"), true);
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    id: secondOfficer.id,
    revision: secondOfficer.revision,
  });
  const unmatched = await service.saveClubApplication(sql, "other", {
    ...input,
    clubId: null,
    details: { ...details, clubName: "Synthetic directory correction" },
  });
  const firstTarget = { ...req, id: unmatched.id, revision: unmatched.revision };
  await startClubConfirmation(sql, "staff", firstTarget, capture);
  assert(
    (await service.myClubApplications(sql, "officer")).notices.some((n) => n.id === unmatched.id),
  );
  // The replacement cooldown has elapsed, but the application revision is unchanged.
  await sql`update club_officer_confirmations set updated_at=now()-interval '2 minutes' where application_id=${unmatched.id}`;
  await startClubConfirmation(sql, "staff", { ...firstTarget, targetClubId: club2.id }, capture);
  assert(
    !(await service.myClubApplications(sql, "officer")).notices.some((n) => n.id === unmatched.id),
    "A representative of the former target must not see the corrected request",
  );
  await assert.rejects(
    () => service.disputeClubNotice(sql, "officer", unmatched.id, unmatched.revision, club.id),
    /unavailable/,
  );
  assert(
    (await service.myClubApplications(sql, "second-officer")).notices.some(
      (n) => n.id === unmatched.id,
    ),
  );
  await service.disputeClubNotice(
    sql,
    "second-officer",
    unmatched.id,
    unmatched.revision,
    club2.id,
  );
  await assert.rejects(() => startClubConfirmation(sql, "staff", firstTarget, capture), /disputed/);

  const extra = await service.saveClubApplication(sql, "other", input);
  assert.equal((await service.myClubApplications(sql, "officer")).notices[0].id, extra.id);
  await startClubConfirmation(
    sql,
    "staff",
    { ...req, id: extra.id, revision: extra.revision },
    capture,
  );
  assert.equal(await answerClubConfirmation(sql, token(), "disputed"), true);
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", {
        ...decision,
        id: extra.id,
        revision: extra.revision,
      }),
    /Independent club confirmation/,
  );
  await assert.rejects(
    () =>
      service.saveClubApplication(sql, "other", {
        ...input,
        id: extra.id,
        revision: extra.revision,
      }),
    /staff review/,
  );
  await assert.rejects(
    () => service.disputeClubNotice(sql, "other", extra.id, extra.revision, club.id),
    /required/,
  );
  await service.disputeClubNotice(sql, "officer", extra.id, extra.revision, club.id);
  await service.reviewClubApplication(sql, "staff", {
    ...decision,
    id: extra.id,
    revision: extra.revision,
    action: "needs_changes",
  });
  const revised = await service.saveClubApplication(sql, "other", {
    ...input,
    id: extra.id,
    revision: extra.revision + 1,
  });
  await startClubConfirmation(
    sql,
    "staff",
    { ...req, id: extra.id, revision: revised.revision },
    capture,
  );
  assert.equal(await answerClubConfirmation(sql, token(), "confirmed"), true);
  await service.disputeClubNotice(sql, "officer", extra.id, revised.revision, club.id);
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", {
        ...decision,
        id: extra.id,
        revision: revised.revision,
      }),
    /Independent club confirmation/,
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
  await assert.rejects(
    () => service.saveClubContent(sql, "officer", { ...edit, revision: 1 }),
    /required/,
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
  await startClubConfirmation(
    sql,
    "staff",
    {
      ...req,
      id: missing.id,
      revision: 1,
      targetClubId: null,
      method: "manual",
      contact: "Synthetic Chair via governing body",
      replyNote: "The current chair confirmed the named account by telephone on 2 November.",
    },
    capture,
  );
  await assert.rejects(
    () =>
      service.reviewClubApplication(sql, "staff", {
        ...decision,
        id: missing.id,
        revision: 1,
        resolvedClubId: club.id,
      }),
    /Independent club confirmation/,
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
