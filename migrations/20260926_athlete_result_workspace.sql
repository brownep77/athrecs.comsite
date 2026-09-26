-- Private proposals only. This migration does not import or publish any athlete data.
create table if not exists athlete_result_proposals (
  id uuid primary key,
  athlete_id integer references athletes(id) on delete restrict,
  submitted_by text not null references "user"(id) on delete cascade,
  source_url text not null check (source_url ~ '^https://'),
  original_text text not null check (length(original_text) <= 200000),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  entries jsonb not null check (jsonb_typeof(entries) = 'array' and jsonb_array_length(entries) between 1 and 250),
  revision integer not null default 1 check (revision > 0),
  evidence_for text not null default '',
  evidence_against text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists athlete_result_proposal_repeat
  on athlete_result_proposals (submitted_by, coalesce(athlete_id,0), input_hash);
create index if not exists athlete_result_proposal_target on athlete_result_proposals (athlete_id, updated_at desc);
create index if not exists athlete_result_proposal_submitter on athlete_result_proposals (submitted_by, updated_at desc);
create table if not exists athlete_result_review_invitations (
  id uuid primary key,
  batch_id uuid not null references athlete_result_proposals(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  recipient_email text not null,
  issued_revision integer not null,
  created_by text not null references "user"(id) on delete cascade,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists athlete_result_review_batch on athlete_result_review_invitations (batch_id);
