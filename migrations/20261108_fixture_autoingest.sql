-- Owner instruction, 7 November 2026: collect fixtures from every approved source
-- automatically, publish clean source-supported fixtures without staff review,
-- and send only possible duplicates and unresolved missing information to staff.
-- This table is the private intake queue; no row here is public.
create table if not exists fixture_autoingest_rows (
  id bigserial primary key,
  run_key text not null,
  row_hash text not null unique,
  kind text not null check (kind in ('fixture', 'skipped')),
  source_id text not null default '',
  payload jsonb not null,
  check_flags jsonb not null default '[]'::jsonb,
  status text not null default 'queued' check (status in (
    'queued',        -- waiting for the worker
    'enrich',        -- details missing; automated research pending
    'published',     -- published automatically
    'already_listed',-- the same event, date and distance is already in fixtures
    'duplicate',     -- possible duplicate; staff decide
    'missing',       -- required details still missing after research; staff decide
    'rejected',      -- out of scope (not a standalone running race, parkrun, past date)
    'failed'         -- processing error; retried
  )),
  reasons text[] not null default '{}',
  enrichment jsonb,
  enrich_attempts int not null default 0,
  attempts int not null default 0,
  collector_run_id uuid,
  candidate_id uuid,
  batch_id text,
  resolved_at timestamptz,
  resolved_by text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  published_at timestamptz,
  next_attempt_at timestamptz not null default now()
);
create index if not exists fixture_autoingest_rows_status
  on fixture_autoingest_rows (status, next_attempt_at);
create index if not exists fixture_autoingest_rows_processed
  on fixture_autoingest_rows (processed_at);

-- One summary email per London date and slot (08:00 or 18:00).
create table if not exists fixture_summary_deliveries (
  slot_key text primary key,
  recipient text not null,
  payload jsonb not null,
  provider_id text,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

-- Races whose date has passed join this list so a results collection can follow.
-- Results usually appear one to seven days after a race; next_check_at spaces checks.
create table if not exists fixture_results_queue (
  edition_id int primary key references editions (id) on delete cascade,
  event_date date not null,
  status text not null default 'waiting' check (status in ('waiting', 'found', 'not_available')),
  attempts int not null default 0,
  queued_at timestamptz not null default now(),
  next_check_at timestamptz not null default now(),
  last_note text
);
create index if not exists fixture_results_queue_next
  on fixture_results_queue (status, next_check_at);

alter table fixture_autoingest_rows enable row level security;
alter table fixture_summary_deliveries enable row level security;
alter table fixture_results_queue enable row level security;
revoke all on fixture_autoingest_rows, fixture_summary_deliveries, fixture_results_queue from public;
