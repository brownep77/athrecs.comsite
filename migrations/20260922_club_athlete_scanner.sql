-- Staff-only collection workspace. Scanning never changes public athlete data.
create table if not exists club_scan_runs (
 id uuid primary key, club_id integer not null references clubs(id), scope jsonb not null,
 status text not null check(status in ('running','paused','complete','cancelled')),
 created_by text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists club_scan_jobs (
 id uuid primary key, run_id uuid not null references club_scan_runs(id), url text not null,
 kind text not null check(kind in ('index','race','manual')),
 status text not null check(status in ('queued','processing','done','error','held')),
 attempts integer not null default 0, lease_token uuid, lease_until timestamptz,
 error text, source_hash text, capture jsonb, checked_at timestamptz, unique(run_id,url)
);
create index if not exists club_scan_jobs_queue on club_scan_jobs(status,lease_until);
create table if not exists club_scan_candidates (
 id uuid primary key, club_id integer not null references clubs(id), source_key text not null,
 data jsonb not null, matches jsonb not null default '[]', issues jsonb not null default '[]',
 status text not null check(status in ('proposed','held','approved','published','dismissed','duplicate')),
 decision jsonb, athlete_id integer references athletes(id), published_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(club_id,source_key)
);
create table if not exists club_scan_run_candidates (
 run_id uuid not null references club_scan_runs(id), candidate_id uuid not null references club_scan_candidates(id),
 primary key(run_id,candidate_id)
);
create index if not exists club_scan_candidates_status on club_scan_candidates(club_id,status);
create table if not exists club_scan_reviews (
 id uuid primary key, candidate_id uuid not null references club_scan_candidates(id),
 actor text not null, action text not null, reason text not null, before_value jsonb,
 after_value jsonb, created_at timestamptz not null default now()
);
