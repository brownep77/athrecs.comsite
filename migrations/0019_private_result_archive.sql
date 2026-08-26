-- Private-by-default historical result archive and ingestion ledger.
--
-- Participant rows remain available to authenticated matching and claim flows,
-- but only public figures (or a later explicit athlete opt-in) are returned by
-- public result/profile queries. Staff coverage is tracked by sport, event and
-- edition instead of exposing participant names and finish times in the ledger.

create table if not exists result_ingestion_runs (
  id text primary key,
  sport text not null default 'Running',
  source_name text not null,
  source_url text check (source_url is null or source_url ~ '^https://'),
  acquisition_method text not null default 'upload' check (
    acquisition_method in ('scan', 'upload', 'api', 'manual')
  ),
  file_name text,
  file_sha256 text,
  status text not null default 'processing' check (
    status in ('queued', 'processing', 'completed', 'completed_with_errors', 'failed', 'cancelled')
  ),
  requested_by_user_id text references "user" ("id") on delete set null,
  requested_by_email text,
  rows_detected int not null default 0 check (rows_detected >= 0),
  rows_imported int not null default 0 check (rows_imported >= 0),
  rows_updated int not null default 0 check (rows_updated >= 0),
  rows_skipped int not null default 0 check (rows_skipped >= 0),
  edition_count int not null default 0 check (edition_count >= 0),
  error_count int not null default 0 check (error_count >= 0),
  notes text not null default '',
  error_summary text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists result_ingestion_runs_created_idx
  on result_ingestion_runs (created_at desc);
create index if not exists result_ingestion_runs_sport_status_idx
  on result_ingestion_runs (sport, status, created_at desc);
create index if not exists result_ingestion_runs_source_idx
  on result_ingestion_runs (source_name, created_at desc);

create table if not exists result_ingestion_editions (
  id bigserial primary key,
  ingestion_run_id text not null references result_ingestion_runs (id) on delete cascade,
  event_id int not null references events (id) on delete cascade,
  edition_id int not null references editions (id) on delete cascade,
  sport text not null,
  event_name text not null,
  event_slug text not null,
  event_date date not null,
  distance_code text not null,
  source_url text check (source_url is null or source_url ~ '^https://'),
  status text not null default 'processing' check (
    status in ('queued', 'processing', 'complete', 'partial', 'failed', 'blocked')
  ),
  rows_detected int not null default 0 check (rows_detected >= 0),
  rows_imported int not null default 0 check (rows_imported >= 0),
  rows_updated int not null default 0 check (rows_updated >= 0),
  rows_skipped int not null default 0 check (rows_skipped >= 0),
  error_count int not null default 0 check (error_count >= 0),
  error_summary text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ingestion_run_id, edition_id)
);

create index if not exists result_ingestion_editions_event_idx
  on result_ingestion_editions (event_id, event_date desc);
create index if not exists result_ingestion_editions_sport_idx
  on result_ingestion_editions (sport, event_date desc);
create index if not exists result_ingestion_editions_status_idx
  on result_ingestion_editions (status, updated_at desc);

alter table athletes add column if not exists profile_visibility text not null default 'private';
alter table athletes drop constraint if exists athletes_profile_visibility_check;
alter table athletes add constraint athletes_profile_visibility_check check (
  profile_visibility in ('private', 'public')
);

alter table results add column if not exists result_visibility text not null default 'private';
alter table results drop constraint if exists results_result_visibility_check;
alter table results add constraint results_result_visibility_check check (
  result_visibility in ('private', 'public', 'public_figure')
);
alter table results add column if not exists ingestion_run_id text
  references result_ingestion_runs (id) on delete set null;

update athletes
set profile_visibility = 'public'
where profile_type = 'Public figure';

update results result
set result_visibility = 'public_figure'
from athletes athlete
where athlete.id = result.athlete_id
  and athlete.profile_type = 'Public figure';

create index if not exists athletes_profile_visibility_idx
  on athletes (profile_visibility, profile_type);
create index if not exists results_public_visibility_idx
  on results (edition_id, result_visibility);
create index if not exists results_ingestion_run_idx
  on results (ingestion_run_id) where ingestion_run_id is not null;

comment on table result_ingestion_runs is
  'Auditable result pulls/uploads. Staff views aggregate by source, sport and event edition; participant data stays in private result rows.';
comment on table result_ingestion_editions is
  'Per-edition result coverage for an ingestion run, deliberately excluding athlete names and finish times.';
comment on column results.result_visibility is
  'Private by default. Public output is limited to public figures or an explicit athlete opt-in.';
