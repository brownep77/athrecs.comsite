-- Preserve the four required registration fields without backfilling guesses or
-- marking an athlete profile/privacy acknowledgement as completed.
alter table "user" add column if not exists "firstName" text;
alter table "user" add column if not exists "lastName" text;
alter table "user" add column if not exists "signupCountry" text;
alter table "user" add column if not exists "signupLocation" text;
