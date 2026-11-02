// Real PostgreSQL-compatible migrations/triggers and delivery SQL, with an
// in-memory database and intercepted transport. No real account or email is used.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const migration = "20261029_staff_submission_notifications.sql";
const db = new PGlite();
await db.waitReady;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  throw new Error("External traffic is forbidden in submission notification tests");
};
function sqlFor(connection) {
  const sql = async (parts, ...values) =>
    (await connection.query(parts.map((part, i) => (i ? `$${i}${part}` : part)).join(""), values)).rows;
  sql.query = async (text, values = []) => (await connection.query(text, values)).rows;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
const sends = [];
let ready = false;
let failRecipient = "";
let failAll = false;
const send = async (email, key) => {
  sends.push({ email: structuredClone(email), key });
  if (failAll || email.to.includes(failRecipient)) throw Error("Synthetic provider interruption");
  return `synthetic-receipt-${sends.length}`;
};
function loadService() {
  const module = { exports: {} };
  const dependencies = {
    "@/lib/db": { getSql: async () => sql },
    "@/lib/auth/signup-alerts.server": { signupAlertsReady: () => ready, sendSignupEmail: send },
  };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync("src/lib/athrecs/staff-submission-alerts.server.ts", "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (name) => {
      assert(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}
const count = async (kind) =>
  (await sql`select count(*)::int as n from staff_submission_alert_deliveries where event_kind=${kind}`)[0].n;
const eventRows = (kind, key) =>
  sql`select *,created_at::text from staff_submission_alert_deliveries where event_kind=${kind} and event_key=${key} order by recipient`;
try {
  for (const file of readdirSync("migrations").filter((file) => file.endsWith(".sql")).sort())
    if (file !== migration) await db.exec(readFileSync(`migrations/${file}`, "utf8"));

  await sql`insert into "user"(id,name,email,"emailVerified") values
    ('submission-member','Synthetic <Runner> & Example','runner@example.test',true),
    ('submission-company','Synthetic Company Representative','company@example.test',true),
    ('submission-test','Synthetic Test','paul@athrecs.com',true)`;
  await sql`insert into athletes(id,slug,display_name) values
    (918270,'synthetic-notification-runner','Synthetic Runner'),
    (918271,'synthetic-notification-test','Synthetic Test')`;
  await sql`insert into athrecs_test_athletes(athlete_id,user_id,email)
    values(918271,'submission-test','paul@athrecs.com')`;
  const [historical] = await sql`insert into athlete_profile_edit_suggestions(user_id,profile_slug,suggestion)
    values('submission-member','synthetic-notification-runner','Historical correction must not be replayed') returning id`;
  await db.exec(readFileSync(`migrations/${migration}`, "utf8"));
  assert.equal(await count("profile_correction"), 0, "Migration must not backfill historical submissions");

  // Department mailboxes are enabled only in this disposable database. Production
  // activation is a separate owner-controlled configuration decision.
  for (const category of ["support", "results", "partnerships"])
    await sql`insert into staff_notification_routes(category,recipient,enabled)
      values(${category},${`${category}@athrecs.com`},true)
      on conflict(category,recipient) do update set enabled=true`;
  const expected = (category) => ["paul@athrecs.com", "paultwbrowne@gmail.com", `${category}@athrecs.com`].sort();
  const svc = loadService();

  const correction = "Please change the recorded club to Synthetic & Example AC. <script>example</script>";
  const [profileEdit] = await sql`insert into athlete_profile_edit_suggestions(user_id,profile_slug,suggestion,evidence_url)
    values('submission-member','synthetic-notification-runner',${correction},'https://example.test/club') returning id`;
  let rows = await eventRows("profile_correction", String(profileEdit.id));
  assert.deepEqual(rows.map((row) => row.recipient), expected("support"));
  assert(rows.every((row) => row.attempts === 0 && !row.sent_at));
  assert.equal(rows[0].submission.email, "runner@example.test");
  assert.equal(rows[0].submission.fields.find((field) => field.label === "Suggested correction").value, correction);
  await sql`update athlete_profile_edit_suggestions set status='reviewed' where id=${profileEdit.id}`;
  assert.equal(await count("profile_correction"), 3, "Staff reviews do not submit new correction alerts");
  assert.equal((await eventRows("profile_correction", String(historical.id))).length, 0);

  const proposalId = randomUUID();
  const originalText = `Synthetic source text\n${"Unabridged athlete submission. ".repeat(140)}END-OF-SUBMISSION`;
  await sql`insert into athlete_result_proposals(id,athlete_id,submitted_by,source_url,original_text,input_hash,entries)
    values(${proposalId}::uuid,918270,'submission-member','https://example.test/results',${originalText},repeat('a',64),
    ${JSON.stringify([{ race: "Synthetic 10K", date: "2026-10-01", distance: "10K", time: "00:42:15.2", timingBasis: "chip", bib: "7", place: "12", sourceUrl: "https://example.test/result/7", state: "pending", staffEvidence: "PRIVATE-EVIDENCE-MUST-NOT-BE-MAILED" }])}::jsonb)`;
  rows = await eventRows("result_proposal", proposalId);
  assert.deepEqual(rows.map((row) => row.recipient), expected("results"));
  assert(rows[0].review_path.includes("athleteId=918270"));
  assert(!JSON.stringify(rows[0].submission).includes("PRIVATE-EVIDENCE"));
  assert.equal(rows[0].submission.fields.find((field) => field.label === "Submitted text").value, originalText);
  await sql`update athlete_result_proposals set revision=revision+1,evidence_for='Staff review' where id=${proposalId}::uuid`;
  assert.equal(await count("result_proposal"), 3);

  const verificationId = randomUUID();
  const resultSnapshot = { athleteName: "Synthetic Runner", race: "Synthetic 10K", date: "2026-10-01", distance: "10K", performance: "00:42:15.2", original: { identityDocument: "PRIVATE-ID-DOCUMENT" } };
  await sql`insert into athlete_result_verification_requests(id,athlete_id,result_key,requested_by,athlete_note,evidence_url,result_snapshot,result_version)
    values(${verificationId}::uuid,918270,'r:918270','submission-member','Please check the published chip time.','https://example.test/results',${JSON.stringify(resultSnapshot)}::jsonb,'v1')`;
  rows = await eventRows("result_verification", `${verificationId}:1`);
  assert.deepEqual(rows.map((row) => row.recipient), expected("results"));
  assert(rows[0].review_path.endsWith("#result-verification"));
  assert(!JSON.stringify(rows[0].submission).includes("PRIVATE-ID-DOCUMENT"));
  await sql`update athlete_result_verification_requests set revision=2,staff_evidence='{"staff":"private"}'::jsonb where id=${verificationId}::uuid`;
  assert.equal(await count("result_verification"), 3, "A staff-only revision is not a new request");
  await sql`update athlete_result_verification_requests set status='needs_info',revision=3 where id=${verificationId}::uuid`;
  assert.equal(await count("result_verification"), 3);
  await sql`update athlete_result_verification_requests set status='pending',revision=4,athlete_note='The organiser has now confirmed the chip time.' where id=${verificationId}::uuid`;
  assert.equal((await eventRows("result_verification", `${verificationId}:4`)).length, 3, "Member resubmission gets its own immutable alert");

  const clubId = randomUUID();
  const clubDetails = { clubName: "Synthetic Notification AC", city: "Norwich", county: "Norfolk", country: "England", sports: ["Running"], website: "https://example.test/club", representativeName: "Synthetic Runner", representativeRole: "Secretary", authorityDetails: "I am the club secretary and the committee page confirms my role.", evidenceUrl: "https://example.test/committee", privateDocument: "PRIVATE-CLUB-DOCUMENT" };
  await sql`insert into club_registration_applications(id,user_id,request_key,details)
    values(${clubId}::uuid,'submission-member','synthetic-club',${JSON.stringify(clubDetails)}::jsonb)`;
  assert.equal(await count("club_application"), 0, "Club drafts never generate alerts");
  await sql`update club_registration_applications set status='pending',submitted_at=now(),revision=2 where id=${clubId}::uuid`;
  rows = await eventRows("club_application", `${clubId}:2`);
  assert.deepEqual(rows.map((row) => row.recipient), expected("partnerships"));
  assert(!JSON.stringify(rows[0].submission).includes("PRIVATE-CLUB-DOCUMENT"));
  await sql`update club_registration_applications set status='needs_changes',revision=3,review_message='Please confirm the committee link.' where id=${clubId}::uuid`;
  assert.equal(await count("club_application"), 3);
  await sql`update club_registration_applications set status='pending',submitted_at=now(),revision=4 where id=${clubId}::uuid`;
  assert.equal((await eventRows("club_application", `${clubId}:4`)).length, 3);

  const [brand] = await sql`insert into partner_brands(owner_user_id,name,website,website_host,category,description,sports,markets,contact_name,contact_role)
    values('submission-company','Synthetic Brand','https://example.test','example.test','equipment','Synthetic equipment company for notification checks.','Running','United Kingdom','Synthetic Representative','Director') returning id`;
  assert.deepEqual((await eventRows("partner_registration", `${brand.id}:1`)).map((row) => row.recipient), expected("partnerships"));
  await sql`update partner_brands set revision=2 where id=${brand.id}`;
  assert.equal(await count("partner_registration"), 3, "Unchanged brand content does not create another alert");
  await sql`update partner_brands set status='approved',revision=3 where id=${brand.id}`;
  assert.equal(await count("partner_registration"), 3);
  const [opportunity] = await sql`insert into partner_opportunities(brand_id,title,kind,audience,description,benefits,requirements,sports,markets,closing_date)
    values(${brand.id},'Synthetic product testing','product_testing','athletes','A synthetic opportunity with enough detail for review.','Trial equipment','Give detailed feedback','Running','United Kingdom','2030-01-01') returning id`;
  assert.deepEqual((await eventRows("partner_opportunity", `${opportunity.id}:1`)).map((row) => row.recipient), expected("partnerships"));
  await sql`update partner_opportunities set status='approved',revision=2 where id=${opportunity.id}`;
  assert.equal(await count("partner_opportunity"), 3);
  const [application] = await sql`insert into partner_applications(opportunity_id,user_id,applicant_kind,athlete_id,display_name,message,policy_version)
    values(${opportunity.id},'submission-member','athlete',918270,'Synthetic Runner','I would like to test the equipment and provide detailed feedback.','synthetic') returning id`;
  rows = await eventRows("partner_application", String(application.id));
  assert.deepEqual(rows.map((row) => row.recipient), expected("partnerships"));
  assert.equal(rows[0].submission.email, "runner@example.test");
  await sql`update partner_applications set status='shared',brand_response='Thank you for applying.',revision=2 where id=${application.id}`;
  assert.equal(await count("partner_application"), 3, "Staff sharing and brand responses are not new applications");

  const fingerprint = "b".repeat(64);
  const fields = [{ label: "Full name", value: "Synthetic Runner" }, { label: "Current club", value: "Synthetic AC" }, { label: "Additional information", value: "Preferences saved; open the private staff record to review." }];
  const saveProfile = (snapshot, hash) => sql.transaction((tx) => svc.queuePrivateProfileSave(tx, "submission-member", snapshot, hash));
  const privateKey = await saveProfile(fields, fingerprint);
  assert.match(privateKey, new RegExp(`^submission-member:[a-f0-9-]{36}:${fingerprint}$`));
  assert.equal(await saveProfile(fields, fingerprint), privateKey);
  const repeated = await Promise.all(Array.from({ length: 3 }, () => saveProfile(fields, fingerprint)));
  assert(repeated.every((key) => key === privateKey));
  assert.equal(await count("private_profile_save"), 3, "Consecutive identical profile snapshots reuse one event, including concurrent saves");
  await assert.rejects(() => sql.transaction(async (tx) => {
    await svc.queuePrivateProfileSave(tx, "submission-member", fields, "c".repeat(64));
    throw Error("Synthetic rollback");
  }));
  assert.equal(await count("private_profile_save"), 3, "A rolled-back profile save cannot generate mail");
  const changedFields = fields.map((field) => field.label === "Current club" ? { ...field, value: "Changed Synthetic AC" } : field);
  const changedKey = await saveProfile(changedFields, "d".repeat(64));
  const revertedKey = await saveProfile(fields, fingerprint);
  assert.equal(new Set([privateKey, changedKey, revertedKey]).size, 3, "A → B → A creates three distinct submission events");
  assert.equal(await count("private_profile_save"), 9, "Each real profile change creates an independent three-recipient event");
  assert.equal(await saveProfile(fields, fingerprint), revertedKey);
  assert.equal(await count("private_profile_save"), 9, "Repeating the restored A snapshot does not create a fourth event");
  await svc.notifyStaffSubmission("private_profile_save", privateKey);
  assert.equal(sends.length, 0, "Readiness guard prevents local/preview delivery");
  ready = true;
  await svc.notifyStaffSubmission("private_profile_save", privateKey);
  assert.equal(sends.length, 3);
  assert((await eventRows("private_profile_save", privateKey)).every((row) => row.sent_at));

  failRecipient = "paultwbrowne@gmail.com";
  const delivery = await svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(profileEdit.id));
  assert.deepEqual(delivery, { sent: 2, failed: 1 });
  const initial = sends.slice(-3);
  assert(initial.every(({ email }) => email.text.includes(correction) && email.text.includes("runner@example.test")));
  assert(initial.every(({ email }) => email.reply_to === "runner@example.test"), "Staff replies address the validated submitter");
  assert(initial.every(({ email }) => email.text.includes("/admin/athlete-directory")));
  assert(initial.every(({ email }) => !email.html.includes("<script>") && !email.html.includes("<Runner>")));
  assert(initial.every(({ email }) => !/[\r\n]/.test(email.subject)));
  const sentCount = sends.length;
  assert.deepEqual(await svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(profileEdit.id)), { sent: 0, failed: 0 });
  assert.equal(sends.length, sentCount, "Successful and reserved recipients are not sent again");
  await sql`update "user" set name='Changed after submission' where id='submission-member'`;
  await sql`update athlete_profile_edit_suggestions set suggestion='Changed after the first provider attempt' where id=${profileEdit.id}`;
  await sql`update staff_submission_alert_deliveries set next_attempt_at=now()
    where event_kind='profile_correction' and event_key=${String(profileEdit.id)} and sent_at is null`;
  failRecipient = "";
  await Promise.all([
    svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(profileEdit.id)),
    svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(profileEdit.id)),
  ]);
  assert.equal(sends.length, sentCount + 1, "Concurrent workers only retry the failed recipient");
  assert.deepEqual(sends.at(-1), initial.find(({ email }) => email.to[0] === "paultwbrowne@gmail.com"), "Retry retains the exact payload and idempotency key");

  await svc.deliverStaffSubmissionAlerts(sql, "result_proposal", proposalId);
  assert(sends.slice(-3).every(({ email }) => email.text.includes("END-OF-SUBMISSION") && email.text.includes("00:42:15.2")));
  assert(sends.slice(-3).every(({ email }) => !email.text.includes("PRIVATE-EVIDENCE")));
  failAll = true;
  await svc.notifyStaffSubmission("result_verification", `${verificationId}:1`);
  assert.equal((await sql`select count(*)::int as n from athlete_result_verification_requests where id=${verificationId}::uuid`)[0].n, 1, "Provider outage does not undo the submitted request");
  assert((await eventRows("result_verification", `${verificationId}:1`)).every((row) => row.last_error && !row.sent_at));
  await sql`update staff_submission_alert_deliveries set first_attempt_at=now()-interval '24 hours',next_attempt_at=now()
    where event_kind='result_verification' and event_key=${`${verificationId}:1`}`;
  const expiredCount = sends.length;
  await svc.deliverStaffSubmissionAlerts(sql, "result_verification", `${verificationId}:1`);
  assert.equal(sends.length, expiredCount, "Ambiguous attempts outside the provider idempotency window require review");
  assert((await eventRows("result_verification", `${verificationId}:1`)).every((row) => row.needs_review));
  failAll = false;

  const [testEdit] = await sql`insert into athlete_profile_edit_suggestions(user_id,profile_slug,suggestion)
    values('submission-test','synthetic-notification-test','A synthetic private test correction only.') returning id`;
  rows = await eventRows("profile_correction", String(testEdit.id));
  assert.deepEqual(rows.map((row) => row.recipient), ["paul@athrecs.com"], "Fictional submissions go only to the approved test owner");
  await svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(testEdit.id));
  assert.match(sends.at(-1).email.subject, /^\[FICTIONAL TEST\]/);
  const [invalidReply] = await sql`insert into athlete_profile_edit_suggestions(user_id,profile_slug,suggestion)
    values('submission-member','synthetic-notification-runner','Synthetic email header validation correction.') returning id`;
  await sql`update staff_submission_alert_deliveries
    set submission=jsonb_set(submission,'{email}',${JSON.stringify("runner@example.test\r\nBcc: injected@example.test")}::jsonb)
    where event_kind='profile_correction' and event_key=${String(invalidReply.id)}`;
  await svc.deliverStaffSubmissionAlerts(sql, "profile_correction", String(invalidReply.id));
  assert(sends.slice(-3).every(({ email }) => !Object.hasOwn(email, "reply_to")), "Invalid reply-to content cannot become an email header");
  assert.equal((await sql`select count(*)::int as n from athlete_messages`)[0].n, 0, "Internal alerts do not enter athlete correspondence");
  console.log("PASS: category routing, seven real submission triggers, private profile snapshots including A → B → A, no historical replay/drafts/staff-review mail, curated fields, full submitted text, safe reply-to, transactional rollback, deduplication, independent retries, frozen idempotency payloads, concurrency, expired-delivery review, readiness guard and fictional-account isolation. No real emails sent.");
} finally {
  globalThis.fetch = originalFetch;
  await db.close();
}
