-- Private calendar choices are separate from public athlete fixture plans.
create table athlete_race_calendars (
  user_id text primary key references "user"(id) on delete cascade,
  subscription_token text unique check (subscription_token ~ '^[a-f0-9]{64}$'),
  updated_at timestamptz not null default now()
);
create table athlete_race_calendar_items (
  user_id text not null references athlete_race_calendars(user_id) on delete cascade,
  race_id text not null check (length(race_id) between 1 and 250),
  created_at timestamptz not null default now(),
  primary key (user_id, race_id)
);
comment on column athlete_race_calendars.subscription_token is
  'Private bearer link for the selected race feed only. Never put in public HTML, analytics, or logs. Rotate or null to revoke.';
