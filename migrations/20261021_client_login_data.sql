-- Staff-only login history. Session IDs are correlation IDs, never bearer tokens.
-- Keep the existing lifetime sign-in counter unchanged.
create table athlete_client_tracking (
  singleton boolean primary key default true check (singleton),
  started_at timestamptz not null default now()
);
insert into athlete_client_tracking(singleton) values(true);

create table athlete_client_devices (
  id bigserial primary key,
  user_id text not null references "user"(id) on delete cascade,
  device_key_hash text not null,
  first_seen_at timestamptz not null,
  last_seen_at timestamptz not null,
  unique(user_id, device_key_hash)
);
create index athlete_client_devices_last_seen on athlete_client_devices(last_seen_at);

create table athlete_client_logins (
  id bigserial primary key,
  session_id text not null unique,
  user_id text not null references "user"(id) on delete cascade,
  signed_in_at timestamptz not null,
  user_agent text not null default '',
  device_id bigint references athlete_client_devices(id) on delete set null,
  sign_in_method text,
  country_code text,
  region text,
  city text,
  captured_from text not null check(captured_from in ('session', 'existing_session'))
);
create index athlete_client_logins_user_date on athlete_client_logins(user_id, signed_in_at desc, id desc);
create index athlete_client_logins_date on athlete_client_logins(signed_in_at);

create function record_athlete_client_login() returns trigger language plpgsql as $$
begin
  insert into athlete_client_logins(session_id,user_id,signed_in_at,user_agent,captured_from)
    values(new.id,new."userId",new."createdAt",left(coalesce(new."userAgent",''),1024),'session')
    on conflict(session_id) do nothing;
  return new;
end;
$$;
create trigger record_athlete_client_login after insert on "session"
  for each row execute function record_athlete_client_login();

-- Only sessions that still exist are recoverable. Never infer a device identity,
-- location or the method used from the account's currently linked providers.
insert into athlete_client_logins(session_id,user_id,signed_in_at,user_agent,captured_from)
  select id,"userId","createdAt",left(coalesce("userAgent",''),1024),'existing_session'
  from "session" where "createdAt">=now()-interval '90 days'
  on conflict(session_id) do nothing;

comment on table athlete_client_logins is 'Private staff login history for 90 days; expired rows purged at the next login or client-data read. No tokens, passwords, raw IP addresses, precise coordinates or hardware IDs.';
comment on table athlete_client_devices is 'Account-scoped signed browser cookie recognition. Not a physical device identity. Inactive entries expire after 90 days; IDs are never reused.';
