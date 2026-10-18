-- Private member self-description only. Roles are interests and access requests,
-- never authentication privileges or approval to represent an organisation.
create table if not exists member_onboarding (
  user_id text primary key references "user"(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name text not null check (char_length(last_name) between 1 and 60),
  roles text[] not null check (cardinality(roles) between 1 and 7),
  organisation text not null default '' check (char_length(organisation) <= 160),
  policy_version text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(first_name || ' ' || last_name) <= 120),
  check (roles <@ array['athlete','coach','club','organiser','timing','supporter','staff_request']::text[])
);
create index if not exists member_onboarding_recent_idx on member_onboarding(updated_at desc);
comment on table member_onboarding is
  'Private self-declared member onboarding. Staff requests require separate approval; no role here grants privileges.';
