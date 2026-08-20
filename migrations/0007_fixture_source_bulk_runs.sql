-- Persist a complete snapshot of the configuration-driven fixture source registry
-- for each one-click bulk run. Runnable sources enter the queue; disabled or
-- unapproved sources remain visible as blocked jobs and cannot be claimed.

create table if not exists fixture_source_runs (
  id text primary key,
  registry_hash text not null,
  registry_source_count int not null check (registry_source_count >= 0),
  runnable_source_count int not null check (runnable_source_count >= 0),
  blocked_source_count int not null check (blocked_source_count >= 0),
  status text not null default 'queued' check (
    status in ('queued', 'running', 'completed', 'completed_with_errors', 'failed', 'cancelled')
  ),
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists fixture_source_runs_requested_at_idx
  on fixture_source_runs (requested_at desc);

create unique index if not exists fixture_source_runs_one_active_idx
  on fixture_source_runs ((1))
  where status in ('queued', 'running');

create table if not exists fixture_source_jobs (
  id text primary key,
  run_id text not null references fixture_source_runs (id) on delete cascade,
  source_id text not null,
  source_name text not null,
  start_url text not null,
  source_type text not null,
  source_section text not null,
  region_scope text not null,
  country_focus text not null,
  coverage_scope text not null,
  surface_scope text not null,
  allowed_domains text not null,
  race_link_include_regex text,
  race_link_exclude_regex text,
  profile text not null,
  follow_history_links boolean not null default false,
  max_pages int not null check (max_pages > 0),
  rate_limit_seconds double precision not null check (rate_limit_seconds > 0),
  rights_status text not null,
  notes text not null,
  enabled_at_queue_time boolean not null,
  status text not null check (
    status in ('queued', 'blocked', 'running', 'completed', 'needs_review', 'failed', 'cancelled')
  ),
  block_reason text,
  cursor text,
  pages_fetched int not null default 0 check (pages_fetched >= 0),
  candidates_found int not null default 0 check (candidates_found >= 0),
  candidates_staged int not null default 0 check (candidates_staged >= 0),
  exact_duplicates int not null default 0 check (exact_duplicates >= 0),
  possible_duplicates int not null default 0 check (possible_duplicates >= 0),
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  unique (run_id, source_id),
  check (
    (status = 'blocked' and block_reason is not null)
    or (status <> 'blocked')
  )
);

create index if not exists fixture_source_jobs_claim_idx
  on fixture_source_jobs (run_id, status, created_at);

create index if not exists fixture_source_jobs_source_idx
  on fixture_source_jobs (source_id, created_at desc);
