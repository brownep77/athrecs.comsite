-- Audited review state for fixture candidates that were collected successfully
-- but could not be published under the original all-fields-required policy.

alter table fixture_candidates
  add column if not exists review_status text not null default 'pending';

alter table fixture_candidates
  add column if not exists review_policy text;

alter table fixture_candidates
  add column if not exists review_warnings jsonb not null default '[]'::jsonb;

alter table fixture_candidates
  add column if not exists reviewed_at timestamptz;

alter table fixture_candidates
  add column if not exists reviewed_by text;

alter table fixture_candidates
  add column if not exists review_note text;

alter table fixture_candidates
  add constraint fixture_candidates_review_status_check check (
    review_status in ('pending', 'releasable', 'not_applicable', 'approved', 'rejected')
  );

create index if not exists fixture_candidates_review_queue_idx
  on fixture_candidates (batch_id, review_status, source_id);

create table if not exists fixture_review_actions (
  id serial primary key,
  candidate_id text not null references fixture_candidates (id) on delete cascade,
  batch_id text not null references fixture_import_batches (id) on delete cascade,
  action text not null check (action in ('approved', 'released', 'rejected')),
  policy_code text,
  previous_status text not null,
  previous_block_reasons jsonb not null default '[]'::jsonb,
  remaining_block_reasons jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  reviewer_user_id text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists fixture_review_actions_candidate_idx
  on fixture_review_actions (candidate_id, created_at desc);

create index if not exists fixture_review_actions_batch_idx
  on fixture_review_actions (batch_id, created_at desc);
