-- Count new authenticated sessions from this migration onwards, not page views
-- or refreshes. No historical totals are inferred from expiring session rows.
create table athlete_login_tracking (
  singleton boolean primary key default true check (singleton),
  started_at timestamptz not null default now()
);
insert into athlete_login_tracking (singleton) values (true);

create table athlete_login_activity (
  user_id text primary key references "user" ("id") on delete cascade,
  sign_in_count bigint not null default 0 check (sign_in_count >= 0),
  last_sign_in_at timestamptz not null
);

create function record_athlete_sign_in() returns trigger language plpgsql as $$
begin
  insert into athlete_login_activity (user_id, sign_in_count, last_sign_in_at)
    values (new."userId", 1, new."createdAt")
  on conflict (user_id) do update set
    sign_in_count = athlete_login_activity.sign_in_count + 1,
    last_sign_in_at = greatest(athlete_login_activity.last_sign_in_at, excluded.last_sign_in_at);
  return new;
end;
$$;
create trigger record_athlete_sign_in after insert on "session"
  for each row execute function record_athlete_sign_in();

create index user_signup_date_idx on "user" ("createdAt" desc, "id");
comment on table athlete_login_activity is
  'Private staff activity totals since athlete_login_tracking.started_at. New sessions include signup; refreshes and failed logins do not count. No tokens, IP addresses or user agents retained.';
