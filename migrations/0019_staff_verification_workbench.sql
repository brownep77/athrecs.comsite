-- Staff-managed website intake, crawl staging and manual verification.
--
-- Discovery pages remain separate from verified public catalogue data. A crawl
-- candidate can only publish after a staff reviewer confirms the canonical
-- official website, identity facts, duplicate resolution and every public
-- entry/results provider.

alter table events
  add column if not exists official_website_status text not null default 'legacy'
    check (official_website_status in ('legacy', 'verified', 'not_found', 'rejected')),
  add column if not exists official_website_evidence_url text,
  add column if not exists official_website_checked_by text,
  add column if not exists official_website_checked_at timestamptz,
  add column if not exists official_website_review_note text;

alter table edition_entry_options
  add column if not exists canonical_url text,
  add column if not exists provider_relationship text not null default 'legacy'
    check (provider_relationship in (
      'legacy',
      'organiser_direct',
      'authorised_partner',
      'charity_place',
      'tour_operator',
      'unconfirmed',
      'rejected'
    )),
  add column if not exists review_status text not null default 'legacy'
    check (review_status in ('legacy', 'pending', 'approved', 'needs_changes', 'rejected')),
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text,
  add column if not exists notes text;

update edition_entry_options
set canonical_url = entry_url
where canonical_url is null;

create index if not exists edition_entry_options_canonical_url_idx
  on edition_entry_options (edition_id, canonical_url);

alter table edition_result_links
  add column if not exists reviewed_by text,
  add column if not exists review_note text;

create table if not exists managed_fixture_sources (
  source_id text primary key check (source_id ~ '^[a-z0-9_]+$'),
  source_name text not null,
  start_url text not null,
  canonical_start_url text not null unique,
  source_type text not null check (source_type in ('directory', 'results', 'sitemap')),
  requested_enabled boolean not null default false,
  enabled boolean not null default false,
  source_section text not null,
  region_scope text not null,
  country_focus text not null,
  coverage_scope text not null,
  coverage_start_year int,
  coverage_end_year int,
  surface_scope text not null,
  timing_scope text not null,
  chip_timed_status text not null,
  permission_url text,
  allowed_domains text not null,
  race_link_include_regex text,
  race_link_exclude_regex text,
  profile text not null,
  follow_history_links boolean not null default false,
  max_pages int not null check (max_pages > 0),
  rate_limit_seconds double precision not null check (rate_limit_seconds > 0),
  rights_status text not null,
  notes text not null,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'manual_only', 'rejected')),
  duplicate_status text not null default 'new'
    check (duplicate_status in ('new', 'update', 'exact_duplicate', 'possible_duplicate')),
  duplicate_note text,
  imported_by text not null,
  imported_at timestamptz not null default now(),
  reviewed_by text,
  reviewed_at timestamptz,
  review_note text,
  updated_at timestamptz not null default now(),
  check (
    (coverage_start_year is null and coverage_end_year is null)
    or (
      coverage_start_year is not null
      and coverage_end_year is not null
      and coverage_start_year <= coverage_end_year
    )
  )
);

create index if not exists managed_fixture_sources_review_idx
  on managed_fixture_sources (review_status, source_id);

create table if not exists managed_source_crawl_runs (
  id text primary key,
  source_id text not null references managed_fixture_sources (source_id) on delete cascade,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'completed_with_errors', 'failed', 'cancelled')),
  requested_by text not null,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  pages_fetched int not null default 0 check (pages_fetched >= 0),
  candidates_found int not null default 0 check (candidates_found >= 0),
  error_message text
);

create unique index if not exists managed_source_crawl_runs_one_active_idx
  on managed_source_crawl_runs (source_id)
  where status in ('queued', 'running');

create table if not exists managed_source_crawl_pages (
  run_id text not null references managed_source_crawl_runs (id) on delete cascade,
  canonical_url text not null,
  page_url text not null,
  discovered_from text,
  depth int not null default 0 check (depth >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'fetching', 'fetched', 'failed', 'skipped')),
  http_status int,
  content_type text,
  error_message text,
  fetched_at timestamptz,
  primary key (run_id, canonical_url)
);

create index if not exists managed_source_crawl_pages_claim_idx
  on managed_source_crawl_pages (status, depth, canonical_url);

create table if not exists fixture_verification_candidates (
  id text primary key,
  fingerprint text not null unique,
  source_id text not null,
  discovery_url text not null,
  event_slug text not null,
  event_name text not null,
  sport text not null,
  country text not null,
  county text not null default '',
  city text not null default '',
  area text not null default '',
  venue text not null default '',
  surface text not null default '',
  organiser text not null default '',
  official_website_candidate text,
  official_website_evidence_url text,
  official_website_status text not null default 'pending'
    check (official_website_status in ('pending', 'verified', 'rejected', 'conflict', 'not_found')),
  event_date date not null,
  distance_code text not null,
  distance_km double precision not null default 0 check (distance_km >= 0),
  start_time text,
  entry_status text not null default 'TBC'
    check (entry_status in ('Open', 'ClosingSoon', 'Closed', 'Finished', 'TBC')),
  event_name_check text not null default 'pending',
  organiser_check text not null default 'pending',
  date_check text not null default 'pending',
  distance_check text not null default 'pending',
  location_check text not null default 'pending',
  surface_check text not null default 'pending',
  start_time_check text not null default 'pending',
  entry_status_check text not null default 'pending',
  cancellation_check text not null default 'pending',
  duplicate_status text not null default 'pending'
    check (duplicate_status in (
      'pending',
      'new',
      'matched_existing',
      'exact_duplicate',
      'possible_duplicate',
      'needs_review'
    )),
  matched_event_id int references events (id) on delete set null,
  matched_edition_id int references editions (id) on delete set null,
  duplicate_note text,
  overall_status text not null default 'pending'
    check (overall_status in ('pending', 'approved', 'needs_changes', 'rejected')),
  workflow_status text not null default 'pending'
    check (workflow_status in ('pending', 'approved', 'published', 'rejected')),
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_by text,
  published_at timestamptz
);

create index if not exists fixture_verification_candidates_queue_idx
  on fixture_verification_candidates (workflow_status, created_at desc);

create index if not exists fixture_verification_candidates_event_idx
  on fixture_verification_candidates (event_slug, event_date, distance_code);

create table if not exists fixture_candidate_entry_options (
  id text primary key,
  candidate_id text not null references fixture_verification_candidates (id) on delete cascade,
  provider_code text not null,
  provider_name text not null,
  entry_url text not null,
  canonical_url text not null,
  entry_type text not null
    check (entry_type in ('official', 'third_party', 'charity', 'tour_operator')),
  status text not null default 'unknown'
    check (status in ('open', 'closing_soon', 'ballot', 'waitlist', 'sold_out', 'closed', 'unknown')),
  price_amount numeric(12, 2) check (price_amount is null or price_amount >= 0),
  price_currency text,
  opens_at date,
  closes_at date,
  source_url text,
  provider_relationship text not null default 'unconfirmed'
    check (provider_relationship in (
      'organiser_direct',
      'authorised_partner',
      'charity_place',
      'tour_operator',
      'unconfirmed',
      'rejected'
    )),
  url_check text not null default 'pending',
  event_check text not null default 'pending',
  edition_check text not null default 'pending',
  availability_check text not null default 'pending',
  duplicate_status text not null default 'pending'
    check (duplicate_status in ('pending', 'new', 'exact_duplicate', 'possible_duplicate', 'needs_review')),
  is_primary boolean not null default false,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'needs_changes', 'rejected')),
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, provider_code),
  unique (candidate_id, canonical_url)
);

create unique index if not exists fixture_candidate_entry_options_one_primary_idx
  on fixture_candidate_entry_options (candidate_id)
  where is_primary and review_status <> 'rejected';

create table if not exists fixture_candidate_result_links (
  id text primary key,
  candidate_id text not null references fixture_verification_candidates (id) on delete cascade,
  provider_code text not null,
  provider_name text not null,
  results_url text not null,
  canonical_url text not null,
  source_url text,
  url_check text not null default 'pending',
  event_check text not null default 'pending',
  edition_check text not null default 'pending',
  event_level_check text not null default 'pending',
  participant_scope_check text not null default 'pending',
  duplicate_status text not null default 'pending'
    check (duplicate_status in ('pending', 'new', 'exact_duplicate', 'possible_duplicate', 'needs_review')),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'needs_changes', 'rejected')),
  review_note text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, canonical_url)
);

create table if not exists staff_verification_audit (
  id bigserial primary key,
  entity_type text not null
    check (entity_type in ('source', 'crawl', 'fixture_candidate', 'entry_option', 'result_link')),
  entity_id text not null,
  action text not null,
  actor_email text not null,
  note text,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz not null default now()
);

create index if not exists staff_verification_audit_entity_idx
  on staff_verification_audit (entity_type, entity_id, created_at desc);
