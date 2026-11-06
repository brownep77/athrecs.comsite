-- Durable Fin result-research jobs. Provider conversations are not the job record:
-- xAI zero-data retention disables deferred, batch and stateful response storage.
create table if not exists fin_research_tokens (
  token_hash text primary key,
  user_id text not null references "user"(id) on delete cascade,
  purpose text not null check (purpose = 'result_research'),
  handoff_key text not null,
  settings_revision text not null,
  profile_revision text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index if not exists fin_research_tokens_user on fin_research_tokens(user_id, created_at desc);

create table if not exists fin_result_research_jobs (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  idempotency_key text not null,
  scope_hash text not null,
  state text not null check (state in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 2 check (max_attempts between 1 and 3),
  scope jsonb not null,
  settings_revision text not null,
  profile_revision text not null,
  message text not null default '',
  error_code text,
  provider_calls integer not null default 0 check (provider_calls >= 0),
  locked_until timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index if not exists fin_result_research_jobs_user on fin_result_research_jobs(user_id, created_at desc);
create index if not exists fin_result_research_jobs_queue on fin_result_research_jobs(state, locked_until);

create table if not exists fin_result_research_candidates (
  id text primary key,
  job_id text not null references fin_result_research_jobs(id) on delete cascade,
  user_id text not null references "user"(id) on delete cascade,
  candidate_key text not null,
  athlete_name text not null,
  event_name text not null,
  event_date text not null default '',
  sport text not null default '',
  discipline text not null default '',
  distance text not null default '',
  chip_time text not null default '',
  gun_time text not null default '',
  published_finish_time text not null default '',
  timing_label text not null default '',
  finish_status text not null default '',
  overall_position integer,
  gender_position integer,
  category_position integer,
  source_url text not null,
  source_provider text not null,
  checked_at timestamptz not null,
  row_locator text not null default '',
  supporting_clues jsonb not null default '[]'::jsonb,
  conflicting_evidence jsonb not null default '[]'::jsonb,
  evidence_level text not null check (evidence_level in ('suggested', 'source_checked', 'athlete_supplied')),
  source_accessible boolean,
  catalogue_result_id integer,
  linked_to_account boolean not null default false,
  already_on_profile boolean not null default false,
  review_state text not null default 'unreviewed' check (review_state in ('unreviewed', 'selected', 'rejected', 'uncertain')),
  private_notes text not null default '',
  created_at timestamptz not null default now(),
  unique (job_id, candidate_key)
);
create index if not exists fin_result_research_candidates_user on fin_result_research_candidates(user_id, job_id);

-- A private draft is not a claim and cannot be marked published from this table.
create table if not exists fin_research_profile_drafts (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  job_id text not null,
  fingerprint text not null,
  full_name text not null,
  details jsonb not null,
  published boolean not null default false check (published = false),
  claim_submitted boolean not null default false check (claim_submitted = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

-- Separate from fin_assisted_signups. Research activity is not a completed registration.
create table if not exists fin_research_outcomes (
  id bigserial primary key,
  user_id text not null references "user"(id) on delete cascade,
  job_id text,
  outcome text not null check (outcome in (
    'search_completed',
    'candidates_reviewed',
    'first_accepted_result',
    'profile_draft_saved',
    'profile_setup_continued'
  )),
  outcome_key text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists fin_research_outcomes_user on fin_research_outcomes(user_id, created_at);
