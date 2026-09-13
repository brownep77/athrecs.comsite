-- Manual keeper choices remove collector findings only. Catalogue records are never deleted.
create table if not exists race_collector_duplicate_reviews (
  id uuid primary key,
  candidate_id uuid not null references race_collector_candidates(id),
  kept_event_id integer not null,
  kept_edition_id integer not null,
  before_state jsonb not null,
  kept_snapshot jsonb not null,
  reason text not null,
  reviewed_by text not null,
  reviewed_at timestamptz not null default now(),
  undone_by text,
  undone_at timestamptz,
  check ((undone_by is null) = (undone_at is null))
);
create unique index if not exists race_collector_one_active_duplicate_review
  on race_collector_duplicate_reviews(candidate_id) where undone_at is null;
