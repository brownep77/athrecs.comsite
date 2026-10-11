-- Explicit, snapshot-scoped athlete declarations. These do not verify performances.
create table athlete_profile_result_confirmations (
  id uuid primary key,
  user_id text not null references "user"(id) on delete cascade,
  athlete_id integer not null references athletes(id),
  claim_id integer references result_claims(id),
  input_hash text not null,
  snapshot text not null,
  included_keys jsonb not null,
  excluded_keys jsonb not null,
  added_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id,athlete_id,input_hash)
);
create index profile_confirmation_user on athlete_profile_result_confirmations(user_id,athlete_id,created_at desc);
create table athlete_profile_history_choices (
  user_id text not null references "user"(id) on delete cascade,
  athlete_id integer not null references athletes(id),
  provider text not null,
  external_id text not null,
  performance_hash text not null,
  excluded boolean not null,
  confirmed_at timestamptz not null default now(),
  primary key(user_id,athlete_id,provider,external_id,performance_hash)
);
comment on table athlete_profile_history_choices is 'Owner-scoped declarations on exact source rows. Originals and independent verification remain unchanged; edited or newly imported rows require another review.';

alter table athlete_profile_result_confirmations
  add column email_payload jsonb,
  add column email_sent_at timestamptz,
  add column email_first_attempt_at timestamptz,
  add column email_next_attempt_at timestamptz not null default now(),
  add column email_needs_review boolean not null default false;
