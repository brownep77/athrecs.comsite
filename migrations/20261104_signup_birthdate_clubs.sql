-- New athlete registration details. Never expose date of birth in public athlete profiles.
-- Existing accounts remain valid; required fields apply to new registrations only.
alter table "user" add column if not exists "signupDateOfBirth" text;
alter table "user" add column if not exists "signupClubs" text;
