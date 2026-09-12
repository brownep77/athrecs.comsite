create table if not exists race_collector_runs (
 id uuid primary key, scope jsonb not null, status text not null check(status in ('running','paused','complete','cancelled')),
 requested_by text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 total_jobs int not null, error text
);
create unique index if not exists race_collector_one_active on race_collector_runs ((true)) where status in ('running','paused');
create table if not exists race_collector_jobs (
 id uuid primary key, run_id uuid not null references race_collector_runs(id), ordinal int not null, "window" jsonb not null,
 status text not null default 'queued' check(status in ('queued','running','complete','failed')),
 attempts int not null default 0, lease_token uuid, lease_until timestamptz, available_at timestamptz not null default now(),
 report jsonb, error text, finished_at timestamptz, unique(run_id,ordinal)
);
create index if not exists race_collector_claim on race_collector_jobs(run_id,status,ordinal);
create table if not exists race_collector_candidates (
 id uuid primary key, run_id uuid not null references race_collector_runs(id), job_id uuid not null references race_collector_jobs(id),
 fingerprint text not null, candidate jsonb not null, status text not null check(status in ('review','duplicate','held','staged')),
 reason text not null, event_slug text not null, event_id int, batch_id uuid, reviewed_by text, reviewed_at timestamptz,
 created_at timestamptz not null default now(), unique(run_id,fingerprint)
);
create index if not exists race_collector_review on race_collector_candidates(run_id,status);
