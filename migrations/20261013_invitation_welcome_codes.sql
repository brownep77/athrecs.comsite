-- Store send metadata only. Sign-in codes remain hashed in Better Auth's
-- verification table; never put them in invitation payloads or staff responses.
alter table athlete_claim_invitations
  add column if not exists welcome_attempt_id text,
  add column if not exists welcome_attempted_at timestamptz,
  add column if not exists welcome_attempts_today integer not null default 0;
