-- Additive diagnostics: successful sign-ins remain in their existing canonical log.
alter table athlete_client_logins add column request_id text;
alter table athlete_client_logins add column host text;
alter table athlete_client_logins add column route text;
alter table athlete_client_logins add column duration_ms integer;
alter table athlete_client_logins add column http_status integer;
alter table athlete_client_logins add column release_id text;

create table athlete_access_events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id text references "user"(id) on delete cascade,
  attempted_email text,
  kind text not null,
  outcome text not null check(outcome in ('info','failed','error')),
  error_code text,
  request_id text not null,
  host text,
  route text,
  sign_in_method text,
  user_agent text not null default '',
  country_code text,
  region text,
  city text,
  duration_ms integer,
  http_status integer,
  release_id text,
  online boolean,
  viewport text,
  source text not null check(source in ('server','browser'))
);
create index athlete_access_events_date on athlete_access_events(occurred_at desc,id desc);
create index athlete_access_events_user on athlete_access_events(user_id,occurred_at desc);
create index athlete_access_events_email on athlete_access_events(lower(attempted_email));
create table athlete_access_tracking (
  singleton boolean primary key default true check(singleton),
  started_at timestamptz not null default now()
);
insert into athlete_access_tracking(singleton) values(true);
create table athlete_diagnostic_limits (
  bucket text primary key,
  window_start timestamptz not null,
  hits integer not null
);
-- Failed attempts never establish identity. Remove their entered address when
-- the matching account is deleted, without attributing the attempt to its owner.
create function remove_deleted_account_diagnostics() returns trigger language plpgsql as $$
begin
  delete from athlete_access_events where lower(attempted_email)=lower(old.email);
  return old;
end;
$$;
create trigger remove_deleted_account_diagnostics before delete on "user"
  for each row execute function remove_deleted_account_diagnostics();
comment on table athlete_access_events is 'Staff-only, 90-day support diagnostics. No bodies, passwords, OTPs, tokens, raw IPs, arbitrary error messages, stack traces or query strings. Browser reports are unverified observations.';
