-- Fin can preserve a visitor's search, but never create accounts or grant ownership.
-- The opaque link is hashed at rest. Its random nonce permits safe action retries.
create table if not exists fin_onboarding_handoffs (
  request_key_hash text primary key,
  token_nonce text not null,
  token_hash text not null unique,
  payload_hash text not null,
  racing_name text not null check (length(racing_name) between 2 and 120),
  event_name text check (length(event_name) between 2 and 200),
  year integer check (year between 1800 and 9999),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_by text references "user"(id) on delete cascade,
  consumed_at timestamptz,
  check (expires_at > created_at),
  check ((consumed_by is null) = (consumed_at is null))
);
create index if not exists fin_onboarding_handoffs_expiry on fin_onboarding_handoffs(expires_at);

-- One verified registration per account. This survives short-lived hint cleanup.
-- No email, racing name, source evidence or chat transcript is copied here.
create table if not exists fin_assisted_signups (
  user_id text primary key references "user"(id) on delete cascade,
  handoff_key text not null,
  completed_at timestamptz not null default now()
);
create index if not exists fin_assisted_signups_completed on fin_assisted_signups(completed_at);

create table if not exists fin_connector_usage (
  bucket text primary key,
  requests integer not null check (requests > 0),
  expires_at timestamptz not null
);
create index if not exists fin_connector_usage_expiry on fin_connector_usage(expires_at);
