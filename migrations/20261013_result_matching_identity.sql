-- Private matching/contact settings are deliberately separate from public profile_details.
create table if not exists athlete_result_matching_settings (
  user_id text primary key references "user"(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  notice_version text not null default 'result-matching-2026-10-13',
  updated_at timestamptz not null default now()
);
