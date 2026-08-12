-- Athrecs multi-sport event, competition, entry, result and verification model.
-- Organiser uploads are staged here; nothing becomes verified merely because an
-- organiser uploaded it. Athrecs review and provenance are separate states.

create table if not exists event_occurrences (
  id serial primary key,
  event_id int not null references events (id) on delete cascade,
  slug text not null,
  name text,
  season text,
  start_at timestamptz,
  end_at timestamptz,
  timezone text,
  status text not null default 'draft',
  entry_status text not null default 'tbc',
  entry_url text,
  venue_id int references venues (id) on delete set null,
  country_code text,
  nation text,
  region text,
  county text,
  district text,
  city text,
  postcode text,
  source_url text,
  results_status text not null default 'not_expected',
  visibility text not null default 'private',
  verification_status text not null default 'unverified',
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, slug),
  check (status in ('draft', 'scheduled', 'entries_open', 'entries_closed', 'postponed', 'cancelled', 'in_progress', 'completed')),
  check (entry_status in ('tbc', 'not_applicable', 'coming_soon', 'open', 'closing_soon', 'closed', 'waitlist', 'sold_out')),
  check (results_status in ('not_expected', 'awaiting', 'provisional', 'partial', 'complete', 'corrected')),
  check (visibility in ('private', 'unlisted', 'public')),
  check (verification_status in ('unverified', 'pending', 'automated_checks_passed', 'verified', 'rejected', 'disputed')),
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table if not exists event_competitions (
  id serial primary key,
  occurrence_id int not null references event_occurrences (id) on delete cascade,
  sport_id int not null references sports (id) on delete restrict,
  discipline_id int references disciplines (id) on delete set null,
  surface_id int references surfaces (id) on delete set null,
  venue_id int references venues (id) on delete set null,
  code text not null,
  name text not null,
  participant_kind text not null default 'individual',
  result_model text not null default 'multi_metric',
  distance_value numeric,
  distance_unit text,
  duration_seconds int,
  category_code text,
  category_name text,
  gender_category text,
  age_min int,
  age_max int,
  weight_class text,
  classification text,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'scheduled',
  entry_status text not null default 'tbc',
  entry_url text,
  entry_fee numeric,
  currency text,
  capacity int,
  rules_url text,
  permit_number text,
  source_url text,
  allows_ties boolean not null default false,
  custom_data jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified',
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (occurrence_id, code),
  check (participant_kind in ('individual', 'team', 'pair', 'relay', 'crew', 'mixed')),
  check (result_model in ('time', 'score', 'distance', 'height', 'points', 'placement', 'win_loss', 'multi_metric')),
  check (status in ('draft', 'scheduled', 'postponed', 'cancelled', 'in_progress', 'completed')),
  check (entry_status in ('tbc', 'not_applicable', 'coming_soon', 'open', 'closing_soon', 'closed', 'waitlist', 'sold_out')),
  check (verification_status in ('unverified', 'pending', 'automated_checks_passed', 'verified', 'rejected', 'disputed')),
  check (distance_value is null or distance_value >= 0),
  check (duration_seconds is null or duration_seconds >= 0),
  check (entry_fee is null or entry_fee >= 0),
  check (capacity is null or capacity >= 0),
  check (age_min is null or age_min >= 0),
  check (age_max is null or age_max >= 0),
  check (age_min is null or age_max is null or age_max >= age_min),
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table if not exists competition_rounds (
  id serial primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  parent_round_id int references competition_rounds (id) on delete cascade,
  code text not null,
  name text not null,
  round_type text not null default 'stage',
  sequence_no int not null default 1,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'scheduled',
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, code),
  check (round_type in ('session', 'stage', 'round', 'heat', 'semi_final', 'final', 'set', 'game', 'leg', 'lap', 'apparatus', 'other')),
  check (sequence_no > 0),
  check (status in ('draft', 'scheduled', 'cancelled', 'in_progress', 'completed')),
  check (end_at is null or start_at is null or end_at >= start_at)
);

create table if not exists teams (
  id serial primary key,
  slug text not null unique,
  name text not null,
  sport_id int references sports (id) on delete set null,
  organisation_id int references organisations (id) on delete set null,
  club_id int references clubs (id) on delete set null,
  country_code text,
  region text,
  city text,
  website text,
  status text not null default 'active',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('active', 'inactive', 'disbanded')),
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'))
);

create table if not exists competition_entries (
  id serial primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  external_entry_key text,
  participant_kind text not null default 'individual',
  athlete_id int references athletes (id) on delete set null,
  team_id int references teams (id) on delete set null,
  display_name text,
  bib text,
  lane text,
  seed text,
  category_code text,
  category_name text,
  country_code text,
  club_id int references clubs (id) on delete set null,
  entry_status text not null default 'entered',
  entered_at timestamptz,
  source_type text not null default 'organiser',
  source_url text,
  custom_data jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (participant_kind in ('individual', 'team', 'pair', 'relay', 'crew', 'mixed')),
  check (entry_status in ('interested', 'waitlisted', 'entered', 'confirmed', 'withdrawn', 'transferred', 'dns', 'started', 'finished', 'dnf', 'disqualified')),
  check (source_type in ('athlete', 'organiser', 'timing_partner', 'governing_body', 'athrecs', 'public_source', 'import')),
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected', 'disputed')),
  check (athlete_id is not null or team_id is not null or display_name is not null)
);

create unique index if not exists competition_entries_external_key_idx
  on competition_entries (competition_id, external_entry_key)
  where external_entry_key is not null;
create index if not exists competition_entries_athlete_idx on competition_entries (athlete_id, competition_id);
create index if not exists competition_entries_team_idx on competition_entries (team_id, competition_id);

create table if not exists competition_entry_members (
  id serial primary key,
  entry_id int not null references competition_entries (id) on delete cascade,
  athlete_id int references athletes (id) on delete set null,
  external_member_key text,
  display_name text,
  member_role text,
  sequence_no int,
  is_reserve boolean not null default false,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (athlete_id is not null or display_name is not null),
  check (sequence_no is null or sequence_no > 0)
);

create unique index if not exists competition_entry_members_external_key_idx
  on competition_entry_members (entry_id, external_member_key)
  where external_member_key is not null;
create unique index if not exists competition_entry_members_sequence_idx
  on competition_entry_members (entry_id, sequence_no)
  where sequence_no is not null;

create table if not exists result_upload_batches (
  id serial primary key,
  organisation_id int not null references organisations (id) on delete restrict,
  competition_id int not null references event_competitions (id) on delete cascade,
  uploaded_by_user_id text not null references "user" ("id") on delete restrict,
  original_filename text not null,
  mime_type text,
  byte_size bigint,
  sha256 text not null,
  storage_key text,
  upload_format text not null,
  parser_version text not null default 'athrecs-v1',
  status text not null default 'draft',
  row_count int not null default 0,
  valid_row_count int not null default 0,
  warning_count int not null default 0,
  error_count int not null default 0,
  source_url text,
  declared_official boolean not null default false,
  is_final_results boolean not null default false,
  uploader_note text,
  raw_headers jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  automated_checked_at timestamptz,
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  published_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, competition_id, sha256),
  check (upload_format in ('csv', 'json', 'xml', 'api', 'manual', 'pdf_reference')),
  check (status in ('draft', 'uploaded', 'validating', 'needs_correction', 'submitted', 'under_review', 'verified', 'rejected', 'publishing', 'published', 'failed')),
  check (byte_size is null or byte_size >= 0),
  check (row_count >= 0 and valid_row_count >= 0 and warning_count >= 0 and error_count >= 0)
);

create table if not exists result_upload_rows (
  id serial primary key,
  batch_id int not null references result_upload_batches (id) on delete cascade,
  row_number int not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  fingerprint text,
  validation_status text not null default 'pending',
  errors jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  matched_entry_id int references competition_entries (id) on delete set null,
  matched_athlete_id int references athletes (id) on delete set null,
  published_result_id int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, row_number),
  check (row_number > 0),
  check (validation_status in ('pending', 'valid', 'warning', 'invalid', 'published', 'skipped'))
);

create unique index if not exists result_upload_rows_fingerprint_idx
  on result_upload_rows (batch_id, fingerprint)
  where fingerprint is not null and validation_status <> 'skipped';

create table if not exists result_upload_checks (
  id serial primary key,
  batch_id int not null references result_upload_batches (id) on delete cascade,
  check_code text not null,
  check_name text not null,
  status text not null,
  severity text not null default 'error',
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  unique (batch_id, check_code),
  check (status in ('pending', 'passed', 'warning', 'failed', 'not_applicable')),
  check (severity in ('info', 'warning', 'error', 'blocking'))
);

create table if not exists competition_results (
  id serial primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  round_id int references competition_rounds (id) on delete cascade,
  entry_id int not null references competition_entries (id) on delete cascade,
  result_status text not null default 'finished',
  rank_overall int,
  rank_category int,
  rank_gender int,
  performance_value numeric,
  performance_unit text,
  performance_display text,
  points numeric,
  score_for numeric,
  score_against numeric,
  outcome text,
  record_flags jsonb not null default '[]'::jsonb,
  source_type text not null default 'organiser',
  source_url text,
  upload_batch_id int references result_upload_batches (id) on delete set null,
  record_status text not null default 'active',
  superseded_by_result_id int references competition_results (id) on delete set null,
  verification_status text not null default 'unverified',
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  published_at timestamptz,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (result_status in ('entered', 'dns', 'started', 'finished', 'dnf', 'disqualified', 'withdrawn', 'cancelled', 'no_result', 'provisional')),
  check (rank_overall is null or rank_overall > 0),
  check (rank_category is null or rank_category > 0),
  check (rank_gender is null or rank_gender > 0),
  check (source_type in ('athlete', 'organiser', 'timing_partner', 'governing_body', 'athrecs', 'public_source', 'import')),
  check (record_status in ('active', 'superseded', 'removed')),
  check (superseded_by_result_id is null or superseded_by_result_id <> id),
  check (verification_status in ('unverified', 'athlete_confirmed', 'source_matched', 'automated_checks_passed', 'verified', 'rejected', 'disputed')),
  check (outcome is null or outcome in ('win', 'loss', 'draw', 'tie', 'qualified', 'eliminated', 'not_applicable'))
);

create unique index if not exists competition_results_entry_round_idx
  on competition_results (competition_id, entry_id, coalesce(round_id, 0))
  where record_status = 'active';
create index if not exists competition_results_verification_idx
  on competition_results (verification_status, competition_id);
create index if not exists competition_results_upload_idx on competition_results (upload_batch_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'result_upload_rows_published_result_fk'
      and conrelid = 'result_upload_rows'::regclass
  ) then
    alter table result_upload_rows
      add constraint result_upload_rows_published_result_fk
      foreign key (published_result_id) references competition_results (id) on delete set null;
  end if;
end $$;

create table if not exists result_metrics (
  id serial primary key,
  result_id int not null references competition_results (id) on delete cascade,
  metric_code text not null,
  metric_name text,
  value_numeric numeric,
  value_text text,
  unit text,
  sequence_no int not null default 1,
  is_primary boolean not null default false,
  rank_for_metric int,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (result_id, metric_code, sequence_no),
  check (value_numeric is not null or value_text is not null),
  check (sequence_no > 0),
  check (rank_for_metric is null or rank_for_metric > 0)
);

create index if not exists result_metrics_lookup_idx
  on result_metrics (metric_code, value_numeric);

create table if not exists result_segments (
  id serial primary key,
  result_id int not null references competition_results (id) on delete cascade,
  parent_segment_id int references result_segments (id) on delete cascade,
  segment_type text not null,
  segment_code text not null,
  segment_name text,
  sequence_no int not null,
  value_numeric numeric,
  value_text text,
  unit text,
  rank_for_segment int,
  status text,
  custom_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (result_id, segment_type, segment_code, sequence_no),
  check (sequence_no > 0),
  check (value_numeric is not null or value_text is not null or status is not null),
  check (rank_for_segment is null or rank_for_segment > 0)
);

create table if not exists verification_cases (
  id serial primary key,
  subject_type text not null,
  subject_id text not null,
  status text not null default 'open',
  verification_level text not null default 'athrecs_review',
  priority text not null default 'normal',
  assigned_to_user_id text references "user" ("id") on delete set null,
  automated_score numeric,
  risk_flags jsonb not null default '[]'::jsonb,
  summary text,
  decision text,
  decision_note text,
  opened_by_user_id text references "user" ("id") on delete set null,
  opened_at timestamptz not null default now(),
  reviewed_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  check (subject_type in ('organisation', 'event_submission', 'event', 'occurrence', 'competition', 'athlete_claim', 'athlete_edit', 'result_upload', 'result_claim', 'result_edit', 'missing_result', 'venue', 'team')),
  check (status in ('open', 'automated_checks', 'needs_information', 'under_review', 'approved', 'rejected', 'closed', 'cancelled')),
  check (verification_level in ('identity', 'source_match', 'automated_checks', 'athrecs_review', 'organiser', 'governing_body', 'official_partner')),
  check (priority in ('low', 'normal', 'high', 'urgent')),
  check (decision is null or decision in ('approve', 'reject', 'request_changes', 'cancel'))
);

create table if not exists verification_checks (
  id serial primary key,
  case_id int not null references verification_cases (id) on delete cascade,
  check_code text not null,
  check_name text not null,
  status text not null,
  severity text not null default 'error',
  details jsonb not null default '{}'::jsonb,
  performed_by text not null default 'system',
  performed_by_user_id text references "user" ("id") on delete set null,
  performed_at timestamptz not null default now(),
  unique (case_id, check_code),
  check (status in ('pending', 'passed', 'warning', 'failed', 'not_applicable')),
  check (severity in ('info', 'warning', 'error', 'blocking')),
  check (performed_by in ('system', 'athrecs_reviewer', 'organiser', 'governing_body', 'data_partner'))
);

create table if not exists data_submissions (
  id serial primary key,
  submission_type text not null,
  target_type text not null,
  target_id text,
  organisation_id int references organisations (id) on delete set null,
  athlete_id int references athletes (id) on delete set null,
  submitted_by_user_id text not null references "user" ("id") on delete restrict,
  payload jsonb not null,
  current_snapshot jsonb,
  source_url text,
  status text not null default 'draft',
  verification_case_id int references verification_cases (id) on delete set null,
  reviewer_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_user_id text references "user" ("id") on delete set null,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (submission_type in ('new_event', 'event_claim', 'event_edit', 'new_occurrence', 'occurrence_edit', 'competition_edit', 'athlete_claim', 'athlete_public_edit', 'missing_result', 'result_edit', 'result_claim', 'team_claim', 'venue_edit')),
  check (target_type in ('event', 'occurrence', 'competition', 'athlete', 'result', 'team', 'venue')),
  check (status in ('draft', 'submitted', 'automated_checks', 'needs_information', 'under_review', 'approved', 'rejected', 'applied', 'cancelled'))
);

create table if not exists evidence_items (
  id serial primary key,
  subject_type text not null,
  subject_id text not null,
  evidence_type text not null,
  source_url text,
  storage_key text,
  filename text,
  mime_type text,
  sha256 text,
  description text,
  is_official_source boolean not null default false,
  added_by_user_id text references "user" ("id") on delete set null,
  created_at timestamptz not null default now(),
  check (evidence_type in ('official_results', 'organiser_document', 'governing_body_record', 'timing_file', 'certificate', 'photo', 'identity_document', 'website', 'email', 'gps_activity', 'other'))
);

create table if not exists data_provenance (
  id serial primary key,
  entity_type text not null,
  entity_id text not null,
  field_path text,
  source_type text not null,
  source_url text,
  source_reference text,
  import_batch_id int references result_upload_batches (id) on delete set null,
  submitted_by_user_id text references "user" ("id") on delete set null,
  collected_at timestamptz,
  verified_at timestamptz,
  confidence text not null default 'unknown',
  permitted_uses jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (source_type in ('athlete', 'organiser', 'timing_partner', 'governing_body', 'athrecs', 'public_source', 'import', 'calculated', 'inferred')),
  check (confidence in ('unknown', 'low', 'medium', 'high', 'authoritative'))
);

create table if not exists audit_log (
  id bigserial primary key,
  actor_user_id text references "user" ("id") on delete set null,
  actor_type text not null default 'user',
  action text not null,
  entity_type text not null,
  entity_id text,
  organisation_id int references organisations (id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  check (actor_type in ('user', 'system', 'import', 'api'))
);

create index if not exists event_occurrences_event_idx on event_occurrences (event_id, start_at);
create index if not exists event_occurrences_location_idx on event_occurrences (country_code, region, county, city);
create index if not exists event_occurrences_visibility_idx on event_occurrences (visibility, verification_status, status);
create index if not exists event_competitions_occurrence_idx on event_competitions (occurrence_id, start_at);
create index if not exists event_competitions_taxonomy_idx on event_competitions (sport_id, discipline_id, surface_id);
create index if not exists event_competitions_distance_idx on event_competitions (distance_value, distance_unit);
create index if not exists event_competitions_verification_idx on event_competitions (verification_status, status);
create index if not exists result_upload_batches_queue_idx on result_upload_batches (status, created_at);
create index if not exists result_upload_rows_batch_status_idx on result_upload_rows (batch_id, validation_status);
create index if not exists verification_cases_queue_idx on verification_cases (status, priority, opened_at);
create index if not exists data_submissions_queue_idx on data_submissions (status, submission_type, created_at);
create index if not exists data_submissions_user_idx on data_submissions (submitted_by_user_id, created_at);
create index if not exists evidence_items_subject_idx on evidence_items (subject_type, subject_id);
create index if not exists data_provenance_entity_idx on data_provenance (entity_type, entity_id, field_path);
create index if not exists audit_log_entity_idx on audit_log (entity_type, entity_id, created_at);
create index if not exists audit_log_actor_idx on audit_log (actor_user_id, created_at);
