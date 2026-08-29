-- Extra private identity fields used to find a runner at registration.
-- These stay on the Athlete Account. They are not published on public profiles.

alter table athlete_private_profiles
  add column if not exists previous_names text[] not null default '{}',
  add column if not exists parkrun_id text,
  add column if not exists athletics_urn text,
  add column if not exists power_of_10_url text,
  add column if not exists world_athletics_url text,
  add column if not exists fingerprint_event text,
  add column if not exists fingerprint_year text,
  add column if not exists fingerprint_distance text,
  add column if not exists fingerprint_time text;

create table if not exists athlete_external_match_searches (
  id bigserial primary key,
  user_id text not null references "user" ("id") on delete cascade,
  cache_key text not null,
  status text not null check (status in ('ok', 'unavailable', 'error')),
  model text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists athlete_external_match_searches_user_idx
  on athlete_external_match_searches (user_id, created_at desc);
create unique index if not exists athlete_external_match_searches_cache_idx
  on athlete_external_match_searches (user_id, cache_key);

comment on column athlete_private_profiles.previous_names is
  'Maiden, known-as or previous racing names. Used only for private result matching.';
comment on table athlete_external_match_searches is
  'Cached Grok/xAI public-result lookups. Stores sourced candidates, never auto-links ownership.';
