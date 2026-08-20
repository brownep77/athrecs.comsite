-- Durable, auditable staging for the collected scraper workbook. Every source
-- edition is retained; only candidates that pass source, quality and duplicate
-- checks may be copied into the public events catalogue.

create table if not exists fixture_import_batches (
  id text primary key,
  snapshot_id text not null,
  snapshot_created_at timestamptz not null,
  source_record_count int not null check (source_record_count >= 0),
  staged_count int not null default 0 check (staged_count >= 0),
  eligible_count int not null default 0 check (eligible_count >= 0),
  blocked_count int not null default 0 check (blocked_count >= 0),
  duplicate_count int not null default 0 check (duplicate_count >= 0),
  published_candidate_count int not null default 0 check (published_candidate_count >= 0),
  published_event_count int not null default 0 check (published_event_count >= 0),
  published_edition_count int not null default 0 check (published_edition_count >= 0),
  status text not null default 'staging' check (
    status in ('staging', 'staged', 'publishing', 'published', 'published_with_blocks', 'failed')
  ),
  created_at timestamptz not null default now(),
  staged_at timestamptz,
  published_at timestamptz
);

create table if not exists fixture_candidates (
  id text primary key,
  batch_id text not null references fixture_import_batches (id) on delete cascade,
  source_race_id text not null,
  source_edition_id text not null,
  source_id text not null,
  source_url text not null,
  source_row_hash text not null,
  fingerprint text not null,
  event_name text not null,
  event_slug text not null,
  -- Text is deliberate: invalid or missing source dates must still be retained
  -- in staging with a blocking reason instead of being dropped on ingest.
  event_date text not null,
  payload jsonb not null,
  review_item_count int not null default 0 check (review_item_count >= 0),
  high_issue_count int not null default 0 check (high_issue_count >= 0),
  publish_eligible boolean not null default false,
  status text not null check (
    status in ('staged', 'blocked', 'duplicate', 'eligible', 'published', 'failed')
  ),
  block_reasons jsonb not null default '[]'::jsonb,
  catalogue_event_id int references events (id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (batch_id, source_edition_id)
);

create index if not exists fixture_candidates_batch_status_idx
  on fixture_candidates (batch_id, status);

create index if not exists fixture_candidates_fingerprint_idx
  on fixture_candidates (fingerprint);

create index if not exists fixture_candidates_source_idx
  on fixture_candidates (source_id, source_edition_id);
