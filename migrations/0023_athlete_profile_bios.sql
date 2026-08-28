-- Optional private Athlete Profile biographies.
--
-- The automatic biography itself is not persisted. ATHRECS regenerates it from
-- the athlete's current private account details and linked results whenever the
-- profile is loaded, so newly imported performances are reflected immediately.

create table if not exists athlete_profile_bios (
  user_id text primary key references "user" ("id") on delete cascade,
  mode text not null default 'automatic' check (
    mode in ('automatic', 'custom', 'hidden')
  ),
  custom_bio text check (
    custom_bio is null or length(trim(custom_bio)) between 1 and 1200
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table athlete_profile_bios is
  'Private Athlete Profile bio preference. Automatic prose is regenerated from current linked results; custom text remains owner-controlled.';
comment on column athlete_profile_bios.mode is
  'automatic regenerates from current results, custom uses owner-written text, hidden removes the About section.';
