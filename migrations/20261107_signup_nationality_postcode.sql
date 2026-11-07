-- Nationality (required for new registrations) and an optional postcode or ZIP
-- code, both private registration details used to match historical results.
-- Never expose either on public athlete profiles.
alter table "user" add column if not exists "signupNationality" text;
alter table "user" add column if not exists "signupPostcode" text;
