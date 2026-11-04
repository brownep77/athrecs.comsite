// Minimal, disposable PostgreSQL fixtures still execute the production ownership
// predicate. No existing link gains review provenance merely by installing it.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

export async function installReviewedManagementSchema(db) {
  await db.exec(`
    alter table athlete_account_links add column source_claim_id integer,
      add column confirmation_method text not null default 'unrecorded';
    create table result_claims (
      id serial primary key, athlete_id integer not null, claimant_user_id text not null,
      claimant_email text not null, status text not null, confirmation_method text not null,
      verification_method text not null, declaration_accepted boolean not null,
      evidence_text text, reviewed_at timestamptz, reviewed_by_user_id text,
      reviewed_by_email text, staff_note text, confirmed_at timestamptz
    );
  `);
  await db.exec(
    await readFile(
      new URL("../../migrations/20261103_reviewed_athlete_management.sql", import.meta.url),
      "utf8",
    ),
  );
}

export async function recordSyntheticManagementReview(db, { athleteId, userId }) {
  const reviewerId = "synthetic-independent-ownership-reviewer";
  assert.notEqual(userId, reviewerId);
  const { rows: claims } = await db.query(
    `insert into result_claims(athlete_id,claimant_user_id,claimant_email,status,
      confirmation_method,verification_method,declaration_accepted,evidence_text,
      reviewed_at,reviewed_by_user_id,reviewed_by_email,staff_note,confirmed_at)
    values($1,$2,$3,'approved','staff','club_confirmation',true,
      'Synthetic club-officer response identifying the claimant.',now(),$4,$5,
      'Synthetic independent club-officer response checked against this account.',now())
    returning id`,
    [athleteId, userId, `${userId}@example.test`, reviewerId, `${reviewerId}@example.test`],
  );
  const { rows: links } = await db.query(
    `update athlete_account_links set source_claim_id=$1,confirmation_method='staff'
      where athlete_id=$2 and user_id=$3 and status='active' returning athlete_id`,
    [claims[0].id, athleteId, userId],
  );
  assert.equal(links.length, 1, "Synthetic review must target exactly one existing active link");
}
