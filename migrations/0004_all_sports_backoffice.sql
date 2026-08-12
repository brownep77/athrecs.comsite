-- Athrecs all-sports + back-office foundation.
--
-- This migration is deliberately additive. The existing events / editions /
-- athletes / results tables continue to power the live running catalogue while
-- the normalized tables below support every sport, event-organiser access,
-- staged edits, generic results, verification and audit history.

-- ---------------------------------------------------------------------------
-- 1. Extensible sport and discipline taxonomy
-- ---------------------------------------------------------------------------

create table if not exists sports (
  id serial primary key,
  slug text not null unique,
  name text not null,
  category text not null default 'sport',
  governing_body text,
  default_result_type text not null default 'mixed',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists disciplines (
  id serial primary key,
  sport_id int not null references sports (id) on delete cascade,
  slug text not null,
  name text not null,
  default_result_type text not null default 'placing',
  default_unit text,
  supports_individuals boolean not null default true,
  supports_teams boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport_id, slug)
);

insert into sports (slug, name, category, default_result_type) values
  ('running', 'Running', 'endurance', 'time'),
  ('athletics', 'Athletics', 'athletics', 'mixed'),
  ('cycling', 'Cycling', 'endurance', 'time'),
  ('swimming', 'Swimming', 'aquatic', 'time'),
  ('triathlon', 'Triathlon', 'multisport', 'time'),
  ('duathlon', 'Duathlon', 'multisport', 'time'),
  ('aquathlon', 'Aquathlon', 'multisport', 'time'),
  ('aquabike', 'Aquabike', 'multisport', 'time'),
  ('rowing', 'Rowing', 'water', 'time'),
  ('canoeing', 'Canoeing', 'water', 'time'),
  ('kayaking', 'Kayaking', 'water', 'time'),
  ('sailing', 'Sailing', 'water', 'points'),
  ('surfing', 'Surfing', 'water', 'judged'),
  ('obstacle-course-racing', 'Obstacle Course Racing', 'endurance', 'time'),
  ('adventure-racing', 'Adventure Racing', 'multisport', 'time'),
  ('orienteering', 'Orienteering', 'navigation', 'time'),
  ('football', 'Football', 'team', 'score'),
  ('futsal', 'Futsal', 'team', 'score'),
  ('rugby-union', 'Rugby Union', 'team', 'score'),
  ('rugby-league', 'Rugby League', 'team', 'score'),
  ('cricket', 'Cricket', 'team', 'score'),
  ('field-hockey', 'Field Hockey', 'team', 'score'),
  ('ice-hockey', 'Ice Hockey', 'team', 'score'),
  ('basketball', 'Basketball', 'team', 'score'),
  ('netball', 'Netball', 'team', 'score'),
  ('volleyball', 'Volleyball', 'team', 'score'),
  ('handball', 'Handball', 'team', 'score'),
  ('baseball', 'Baseball', 'team', 'score'),
  ('softball', 'Softball', 'team', 'score'),
  ('tennis', 'Tennis', 'racket', 'score'),
  ('table-tennis', 'Table Tennis', 'racket', 'score'),
  ('badminton', 'Badminton', 'racket', 'score'),
  ('squash', 'Squash', 'racket', 'score'),
  ('padel', 'Padel', 'racket', 'score'),
  ('golf', 'Golf', 'precision', 'score'),
  ('gymnastics', 'Gymnastics', 'judged', 'judged'),
  ('trampolining', 'Trampolining', 'judged', 'judged'),
  ('cheerleading', 'Cheerleading', 'judged', 'judged'),
  ('dance-sport', 'Dance Sport', 'judged', 'judged'),
  ('climbing', 'Climbing', 'outdoor', 'mixed'),
  ('skiing', 'Skiing', 'winter', 'time'),
  ('snowboarding', 'Snowboarding', 'winter', 'mixed'),
  ('skating', 'Skating', 'winter', 'mixed'),
  ('boxing', 'Boxing', 'combat', 'win_loss'),
  ('judo', 'Judo', 'combat', 'win_loss'),
  ('karate', 'Karate', 'combat', 'mixed'),
  ('taekwondo', 'Taekwondo', 'combat', 'mixed'),
  ('wrestling', 'Wrestling', 'combat', 'win_loss'),
  ('weightlifting', 'Weightlifting', 'strength', 'measurement'),
  ('powerlifting', 'Powerlifting', 'strength', 'measurement'),
  ('functional-fitness', 'Functional Fitness', 'strength', 'mixed'),
  ('equestrian', 'Equestrian', 'equestrian', 'mixed'),
  ('motorsport', 'Motorsport', 'motorsport', 'time'),
  ('archery', 'Archery', 'precision', 'score'),
  ('shooting-sport', 'Shooting Sport', 'precision', 'score'),
  ('darts', 'Darts', 'precision', 'score'),
  ('snooker', 'Snooker', 'cue', 'score'),
  ('billiards', 'Billiards', 'cue', 'score'),
  ('bowls', 'Bowls', 'precision', 'score'),
  ('esports', 'Esports', 'digital', 'win_loss'),
  ('other', 'Other Sport', 'other', 'mixed')
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  default_result_type = excluded.default_result_type,
  active = true,
  updated_at = now();

create table if not exists sport_aliases (
  alias text primary key,
  sport_id int not null references sports (id) on delete cascade
);

insert into sport_aliases (alias, sport_id)
select a.alias, s.id
from (
  values
    ('running', 'running'),
    ('parkrun', 'running'),
    ('athletics', 'athletics'),
    ('trackandfield', 'athletics'),
    ('track and field', 'athletics'),
    ('cycling', 'cycling'),
    ('swimming', 'swimming'),
    ('triathlon', 'triathlon'),
    ('duathlon', 'duathlon'),
    ('aquathlon', 'aquathlon'),
    ('aquabike', 'aquabike'),
    ('rowing', 'rowing'),
    ('ocr', 'obstacle-course-racing'),
    ('obstacle course racing', 'obstacle-course-racing')
) as a(alias, sport_slug)
join sports s on s.slug = a.sport_slug
on conflict (alias) do update set sport_id = excluded.sport_id;

insert into disciplines (
  sport_id, slug, name, default_result_type, default_unit,
  supports_individuals, supports_teams
)
select s.id, d.slug, d.name, d.result_type, d.unit, d.individuals, d.teams
from (
  values
    ('running', 'road-running', 'Road Running', 'time', 'milliseconds', true, true),
    ('running', 'trail-running', 'Trail Running', 'time', 'milliseconds', true, true),
    ('running', 'fell-running', 'Fell Running', 'time', 'milliseconds', true, true),
    ('running', 'cross-country-running', 'Cross-Country Running', 'time', 'milliseconds', true, true),
    ('athletics', 'track', 'Track', 'time', 'milliseconds', true, true),
    ('athletics', 'field', 'Field', 'distance', 'metres', true, true),
    ('athletics', 'combined-events', 'Combined Events', 'points', 'points', true, true),
    ('cycling', 'road-cycling', 'Road Cycling', 'time', 'milliseconds', true, true),
    ('cycling', 'track-cycling', 'Track Cycling', 'mixed', null, true, true),
    ('cycling', 'mountain-biking', 'Mountain Biking', 'time', 'milliseconds', true, true),
    ('cycling', 'cyclocross', 'Cyclocross', 'time', 'milliseconds', true, true),
    ('swimming', 'pool-swimming', 'Pool Swimming', 'time', 'milliseconds', true, true),
    ('swimming', 'open-water-swimming', 'Open-Water Swimming', 'time', 'milliseconds', true, true),
    ('triathlon', 'triathlon', 'Triathlon', 'time', 'milliseconds', true, true),
    ('football', 'football-match', 'Football Match', 'score', 'goals', true, true),
    ('gymnastics', 'artistic-gymnastics', 'Artistic Gymnastics', 'judged', 'points', true, true)
) as d(sport_slug, slug, name, result_type, unit, individuals, teams)
join sports s on s.slug = d.sport_slug
on conflict (sport_id, slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. Organisations, organiser accounts and platform roles
-- ---------------------------------------------------------------------------

create table if not exists organisations (
  id serial primary key,
  slug text not null unique,
  name text not null,
  organisation_type text not null default 'event_organiser',
  legal_name text,
  registration_number text,
  country text not null default '',
  region text not null default '',
  city text not null default '',
  website text,
  public_email text,
  verification_status text not null default 'unverified',
  verification_evidence jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  verified_by_user_id text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organisation_members (
  id serial primary key,
  organisation_id int not null references organisations (id) on delete cascade,
  user_id text not null,
  role text not null default 'viewer',
  status text not null default 'invited',
  invited_by_user_id text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

create table if not exists organisation_claims (
  id text primary key,
  organisation_id int references organisations (id) on delete cascade,
  proposed_name text,
  user_id text not null,
  relationship text not null default 'owner',
  evidence jsonb not null default '[]'::jsonb,
  status text not null default 'submitted',
  reviewed_by_user_id text,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists platform_user_roles (
  user_id text not null,
  role text not null,
  active boolean not null default true,
  granted_by_user_id text,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ---------------------------------------------------------------------------
-- 3. Venues and additive extensions to the live event catalogue
-- ---------------------------------------------------------------------------

create table if not exists venues (
  id serial primary key,
  slug text not null unique,
  name text not null,
  address_line_1 text not null default '',
  address_line_2 text not null default '',
  city text not null default '',
  district text not null default '',
  county_or_state text not null default '',
  region text not null default '',
  postcode text not null default '',
  country text not null default '',
  country_code text not null default '',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  timezone text not null default 'Europe/London',
  indoor boolean,
  accessibility jsonb not null default '{}'::jsonb,
  transport jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table events add column if not exists event_type text not null default 'race';
alter table events add column if not exists lifecycle_status text not null default 'active';
alter table events add column if not exists visibility text not null default 'public';
alter table events add column if not exists primary_sport_id int references sports (id) on delete set null;
alter table events add column if not exists primary_organisation_id int references organisations (id) on delete set null;
alter table events add column if not exists venue_id int references venues (id) on delete set null;
alter table events add column if not exists timezone text not null default 'Europe/London';
alter table events add column if not exists participant_type text not null default 'individual';
alter table events add column if not exists verification_status text not null default 'unverified';
alter table events add column if not exists data_quality_score int not null default 0;
alter table events add column if not exists last_verified_at timestamptz;
alter table events add column if not exists verified_by_user_id text;
alter table events add column if not exists published_at timestamptz;
alter table events add column if not exists updated_at timestamptz not null default now();
alter table events add column if not exists metadata jsonb not null default '{}'::jsonb;

update events e
set primary_sport_id = sa.sport_id
from sport_aliases sa
where e.primary_sport_id is null
  and lower(e.sport) = sa.alias;

update events e
set primary_sport_id = s.id
from sports s
where e.primary_sport_id is null
  and (lower(e.sport) = lower(s.name) or lower(e.sport) = lower(s.slug));

create table if not exists event_sports (
  event_id int not null references events (id) on delete cascade,
  sport_id int not null references sports (id) on delete cascade,
  discipline_id int references disciplines (id) on delete set null,
  relationship text not null default 'primary',
  created_at timestamptz not null default now(),
  primary key (event_id, sport_id, relationship)
);

insert into event_sports (event_id, sport_id, relationship)
select e.id, e.primary_sport_id, 'primary'
from events e
where e.primary_sport_id is not null
on conflict do nothing;

create table if not exists event_organisations (
  event_id int not null references events (id) on delete cascade,
  organisation_id int not null references organisations (id) on delete cascade,
  relationship text not null default 'organiser',
  status text not null default 'active',
  can_edit_event boolean not null default false,
  can_manage_entries boolean not null default false,
  can_upload_results boolean not null default false,
  verified_at timestamptz,
  verified_by_user_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, organisation_id, relationship)
);

alter table editions add column if not exists venue_id int references venues (id) on delete set null;
alter table editions add column if not exists start_at timestamptz;
alter table editions add column if not exists end_at timestamptz;
alter table editions add column if not exists timezone text not null default 'Europe/London';
alter table editions add column if not exists registration_open_at timestamptz;
alter table editions add column if not exists registration_close_at timestamptz;
alter table editions add column if not exists capacity int;
alter table editions add column if not exists entry_fee_minor int;
alter table editions add column if not exists currency text not null default 'GBP';
alter table editions add column if not exists verification_status text not null default 'unverified';
alter table editions add column if not exists last_verified_at timestamptz;
alter table editions add column if not exists verified_by_user_id text;
alter table editions add column if not exists published_at timestamptz;
alter table editions add column if not exists updated_at timestamptz not null default now();
alter table editions add column if not exists metadata jsonb not null default '{}'::jsonb;

-- A competition is the smallest independently enterable / result-bearing unit:
-- a 10K within a race weekend, a football fixture, a swimming heat, a gymnastics
-- apparatus final, a tournament class, etc.
create table if not exists event_competitions (
  id serial primary key,
  edition_id int not null references editions (id) on delete cascade,
  sport_id int not null references sports (id) on delete restrict,
  discipline_id int references disciplines (id) on delete set null,
  slug text not null,
  name text not null,
  competition_type text not null default 'competition',
  format text not null default '',
  participant_type text not null default 'individual',
  result_type text not null default 'placing',
  scoring_method text not null default '',
  distance_value numeric,
  distance_unit text,
  distance_metres numeric,
  measurement_unit text,
  duration_seconds int,
  surface text not null default '',
  course_variant text not null default '',
  age_categories jsonb not null default '[]'::jsonb,
  gender_categories jsonb not null default '[]'::jsonb,
  classification_rules jsonb not null default '{}'::jsonb,
  team_size_min int,
  team_size_max int,
  capacity int,
  start_at timestamptz,
  end_at timestamptz,
  status text not null default 'scheduled',
  entry_url text,
  entry_fee_minor int,
  currency text not null default 'GBP',
  rules_url text,
  verification_status text not null default 'unverified',
  last_verified_at timestamptz,
  verified_by_user_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (edition_id, slug)
);

create table if not exists competition_rounds (
  id serial primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  parent_round_id int references competition_rounds (id) on delete cascade,
  source_key text not null,
  name text not null,
  round_type text not null default 'round',
  sequence_no int not null default 1,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'scheduled',
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists competition_rounds_unique_idx
  on competition_rounds (competition_id, source_key);

create index if not exists competition_rounds_structure_idx
  on competition_rounds (competition_id, parent_round_id, sequence_no, name);

-- ---------------------------------------------------------------------------
-- 4. Athlete identity, multi-sport participation and private passport data
-- ---------------------------------------------------------------------------

alter table athletes add column if not exists verification_status text not null default 'unverified';
alter table athletes add column if not exists data_quality_score int not null default 0;
alter table athletes add column if not exists last_verified_at timestamptz;
alter table athletes add column if not exists verified_by_user_id text;
alter table athletes add column if not exists profile_visibility text not null default 'public';
alter table athletes add column if not exists updated_at timestamptz not null default now();

create table if not exists athlete_claims (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text not null,
  relationship text not null default 'self',
  status text not null default 'submitted',
  verification_level text not null default 'unverified',
  permissions jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by_user_id text,
  review_note text
);

create unique index if not exists athlete_claims_active_unique_idx
  on athlete_claims (athlete_id, user_id, relationship)
  where status in (
    'submitted', 'under_review', 'needs_information',
    'approved_pending_application', 'approved', 'verified'
  );

create table if not exists athlete_private_profiles (
  athlete_id int primary key references athletes (id) on delete cascade,
  legal_given_name text,
  legal_family_name text,
  preferred_name text,
  date_of_birth date,
  nationality_codes jsonb not null default '[]'::jsonb,
  contact_details jsonb not null default '{}'::jsonb,
  address jsonb not null default '{}'::jsonb,
  emergency_contact jsonb not null default '{}'::jsonb,
  race_entry_passport jsonb not null default '{}'::jsonb,
  medical_data_encrypted text,
  visibility_settings jsonb not null default '{}'::jsonb,
  profile_completeness int not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists athlete_sports (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  sport_id int not null references sports (id) on delete cascade,
  discipline_id int references disciplines (id) on delete set null,
  participation_level text not null default 'recreational',
  status text not null default 'active',
  primary_sport boolean not null default false,
  started_on date,
  ended_on date,
  preferences jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists athlete_sports_unique_idx
  on athlete_sports (athlete_id, sport_id, coalesce(discipline_id, 0));

create table if not exists athlete_verifications (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  verification_type text not null,
  status text not null default 'pending',
  source text,
  evidence jsonb not null default '[]'::jsonb,
  confidence numeric(5, 2),
  verified_at timestamptz,
  verified_by_user_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists athlete_consents (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text,
  purpose text not null,
  channel text not null default 'in_app',
  status text not null,
  policy_version text not null,
  evidence jsonb not null default '{}'::jsonb,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id serial primary key,
  slug text not null unique,
  name text not null,
  sport_id int references sports (id) on delete set null,
  organisation_id int references organisations (id) on delete set null,
  club_id int references clubs (id) on delete set null,
  country text not null default '',
  region text not null default '',
  city text not null default '',
  verification_status text not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists team_memberships (
  id serial primary key,
  team_id int not null references teams (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  role text not null default 'athlete',
  shirt_number text,
  starts_on date,
  ends_on date,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists team_memberships_unique_idx
  on team_memberships (
    team_id,
    athlete_id,
    role,
    coalesce(starts_on, date '0001-01-01')
  );

create table if not exists event_entries (
  id text primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  user_id text,
  athlete_id int references athletes (id) on delete set null,
  team_id int references teams (id) on delete set null,
  entry_status text not null default 'entered',
  entry_provider text,
  entry_reference text,
  entered_at timestamptz,
  fee_minor int,
  currency text not null default 'GBP',
  start_wave text,
  bib text,
  answers jsonb not null default '{}'::jsonb,
  consent_snapshot jsonb not null default '{}'::jsonb,
  source text not null default 'athrecs',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Staged submissions, automated checks and manual review
-- ---------------------------------------------------------------------------

create table if not exists data_submissions (
  id text primary key,
  submission_type text not null,
  entity_type text not null,
  entity_id text,
  submitted_by_user_id text not null,
  organisation_id int references organisations (id) on delete set null,
  athlete_id int references athletes (id) on delete set null,
  event_id int references events (id) on delete set null,
  edition_id int references editions (id) on delete set null,
  competition_id int references event_competitions (id) on delete set null,
  source_type text not null default 'user_submission',
  source_url text,
  original_filename text,
  content_type text,
  storage_key text,
  content_hash text,
  status text not null default 'draft',
  verification_status text not null default 'not_started',
  risk_level text not null default 'standard',
  row_count int not null default 0,
  accepted_count int not null default 0,
  warning_count int not null default 0,
  rejected_count int not null default 0,
  automated_score numeric(5, 2),
  summary jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by_user_id text,
  review_note text,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists submission_items (
  id text primary key,
  submission_id text not null references data_submissions (id) on delete cascade,
  row_number int not null,
  entity_type text not null,
  entity_key text,
  proposed_action text not null default 'upsert',
  target_table text,
  target_id text,
  raw_data jsonb not null default '{}'::jsonb,
  current_data jsonb,
  normalized_data jsonb,
  status text not null default 'pending',
  errors jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (submission_id, row_number)
);

create table if not exists verification_checks (
  id text primary key,
  submission_id text not null references data_submissions (id) on delete cascade,
  submission_item_id text references submission_items (id) on delete cascade,
  check_type text not null,
  status text not null,
  severity text not null default 'info',
  score numeric(5, 2),
  message text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  automated boolean not null default true,
  checked_by_user_id text,
  checked_at timestamptz not null default now()
);

create table if not exists review_decisions (
  id text primary key,
  submission_id text not null references data_submissions (id) on delete cascade,
  submission_item_id text references submission_items (id) on delete cascade,
  decision text not null,
  reviewer_user_id text not null,
  reason text not null default '',
  changes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Generic result model for individual, team, timed, scored and judged sports
-- ---------------------------------------------------------------------------

create table if not exists competition_results (
  id text primary key,
  competition_id int not null references event_competitions (id) on delete cascade,
  round_id int references competition_rounds (id) on delete set null,
  athlete_id int references athletes (id) on delete set null,
  team_id int references teams (id) on delete set null,
  participant_name text not null default '',
  participant_external_id text,
  bib text,
  lane_or_position text,
  result_status text not null default 'finished',
  rank int,
  tied_rank boolean not null default false,
  qualification_status text,
  result_type text not null default 'placing',
  time_ms bigint,
  distance_value numeric,
  distance_unit text,
  measurement_value numeric,
  measurement_unit text,
  score numeric,
  points numeric,
  result_text text,
  outcome text,
  attempts jsonb not null default '[]'::jsonb,
  splits jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  source_record_key text,
  source_url text,
  source_submission_id text references data_submissions (id) on delete set null,
  verification_status text not null default 'pending',
  verification_confidence numeric(5, 2),
  verified_at timestamptz,
  verified_by_user_id text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    athlete_id is not null
    or team_id is not null
    or length(trim(participant_name)) > 0
  )
);

create unique index if not exists competition_results_source_key_idx
  on competition_results (competition_id, source_record_key)
  where source_record_key is not null;

create table if not exists result_contributions (
  result_id text not null references competition_results (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  contribution_role text not null default 'participant',
  participation_status text not null default 'participated',
  stats jsonb not null default '{}'::jsonb,
  primary key (result_id, athlete_id, contribution_role)
);

create table if not exists result_identity_claims (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text not null,
  result_model text not null,
  result_id text not null,
  relationship text not null default 'direct',
  status text not null default 'submitted',
  verification_level text not null default 'unverified',
  evidence jsonb not null default '[]'::jsonb,
  source_submission_id text references data_submissions (id) on delete set null,
  reviewed_at timestamptz,
  reviewed_by_user_id text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists result_identity_claims_active_unique_idx
  on result_identity_claims (athlete_id, result_model, result_id, relationship)
  where status in (
    'submitted', 'under_review', 'needs_information',
    'approved_pending_application', 'approved', 'verified'
  );

-- Add generic verification fields to legacy running results without changing the
-- public queries that already read them.
alter table results add column if not exists verification_status text not null default 'source_imported';
alter table results add column if not exists verification_confidence numeric(5, 2);
alter table results add column if not exists verified_at timestamptz;
alter table results add column if not exists verified_by_user_id text;
alter table results add column if not exists source_submission_id text references data_submissions (id) on delete set null;
alter table results add column if not exists result_data jsonb not null default '{}'::jsonb;
alter table results add column if not exists created_at timestamptz not null default now();
alter table results add column if not exists updated_at timestamptz not null default now();

-- One read model powers athlete analytics by sport, distance, surface and
-- geography across both the current running catalogue and the new generic model.
create or replace view athlete_activity_facts as
select
  'legacy'::text as source_model,
  r.id::text as result_id,
  r.athlete_id,
  null::int as team_id,
  e.id as event_id,
  ed.id as edition_id,
  null::int as competition_id,
  ed.event_date,
  e.sport,
  null::text as discipline,
  ed.distance_code as distance_label,
  case
    when ed.distance_km > 0 then (ed.distance_km * 1000)::numeric
    else null::numeric
  end as distance_metres,
  e.surface,
  e.country,
  e.county as region,
  e.city,
  r.status as result_status,
  r.overall_place as rank,
  case when r.finish_time_seconds is not null then r.finish_time_seconds::bigint * 1000 else null end as time_ms,
  null::numeric as score,
  null::numeric as points,
  null::numeric as measurement_value,
  null::text as measurement_unit,
  null::text as result_text,
  null::text as outcome,
  r.verification_status,
  r.source_url,
  r.created_at
from results r
join editions ed on ed.id = r.edition_id
join events e on e.id = ed.event_id
union all
select
  'generic'::text as source_model,
  cr.id as result_id,
  cr.athlete_id,
  cr.team_id,
  e.id as event_id,
  ed.id as edition_id,
  ec.id as competition_id,
  ed.event_date,
  s.name as sport,
  d.name as discipline,
  coalesce(
    nullif(ec.distance_value::text || case when ec.distance_unit is not null then ' ' || ec.distance_unit else '' end, ''),
    ec.name
  ) as distance_label,
  ec.distance_metres,
  ec.surface,
  coalesce(nullif(v.country, ''), e.country) as country,
  coalesce(nullif(v.region, ''), nullif(v.county_or_state, ''), e.county) as region,
  coalesce(nullif(v.city, ''), e.city) as city,
  cr.result_status,
  cr.rank,
  cr.time_ms,
  cr.score,
  cr.points,
  cr.measurement_value,
  cr.measurement_unit,
  cr.result_text,
  cr.outcome,
  cr.verification_status,
  cr.source_url,
  cr.created_at
from competition_results cr
join event_competitions ec on ec.id = cr.competition_id
join editions ed on ed.id = ec.edition_id
join events e on e.id = ed.event_id
join sports s on s.id = ec.sport_id
left join disciplines d on d.id = ec.discipline_id
left join venues v on v.id = coalesce(ed.venue_id, e.venue_id)
union all
select
  'generic_contribution'::text as source_model,
  cr.id as result_id,
  rc.athlete_id,
  cr.team_id,
  e.id as event_id,
  ed.id as edition_id,
  ec.id as competition_id,
  ed.event_date,
  s.name as sport,
  d.name as discipline,
  coalesce(
    nullif(ec.distance_value::text || case when ec.distance_unit is not null then ' ' || ec.distance_unit else '' end, ''),
    ec.name
  ) as distance_label,
  ec.distance_metres,
  ec.surface,
  coalesce(nullif(v.country, ''), e.country) as country,
  coalesce(nullif(v.region, ''), nullif(v.county_or_state, ''), e.county) as region,
  coalesce(nullif(v.city, ''), e.city) as city,
  cr.result_status,
  cr.rank,
  cr.time_ms,
  cr.score,
  cr.points,
  cr.measurement_value,
  cr.measurement_unit,
  cr.result_text,
  cr.outcome,
  cr.verification_status,
  cr.source_url,
  cr.created_at
from result_contributions rc
join competition_results cr on cr.id = rc.result_id
join event_competitions ec on ec.id = cr.competition_id
join editions ed on ed.id = ec.edition_id
join events e on e.id = ed.event_id
join sports s on s.id = ec.sport_id
left join disciplines d on d.id = ec.discipline_id
left join venues v on v.id = coalesce(ed.venue_id, e.venue_id)
where cr.athlete_id is null or cr.athlete_id <> rc.athlete_id;

-- ---------------------------------------------------------------------------
-- 7. Kit, product preferences and first-party commerce behaviour
-- ---------------------------------------------------------------------------

create table if not exists products (
  id serial primary key,
  slug text not null unique,
  brand text not null default '',
  name text not null,
  category text not null,
  sport_id int references sports (id) on delete set null,
  model text,
  variant text,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists athlete_equipment (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  product_id int references products (id) on delete set null,
  sport_id int references sports (id) on delete set null,
  category text not null,
  brand text not null default '',
  model text not null default '',
  variant text,
  size text,
  acquisition_type text not null default 'purchased',
  purchase_date date,
  retailer text,
  price_minor int,
  currency text not null default 'GBP',
  usage_total numeric,
  usage_unit text,
  status text not null default 'active',
  visibility text not null default 'private',
  sponsored_disclosure boolean not null default false,
  rating numeric(3, 2),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists equipment_usage (
  id text primary key,
  athlete_equipment_id text not null references athlete_equipment (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  edition_id int references editions (id) on delete set null,
  competition_result_id text references competition_results (id) on delete set null,
  activity_type text not null default 'competition',
  usage_value numeric,
  usage_unit text,
  notes text,
  occurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists athlete_product_preferences (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  sport_id int references sports (id) on delete cascade,
  category text not null,
  preference_data jsonb not null default '{}'::jsonb,
  source text not null default 'athlete_declared',
  confidence numeric(5, 2),
  marketing_use_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists athlete_product_preferences_unique_idx
  on athlete_product_preferences (athlete_id, coalesce(sport_id, 0), category);

create table if not exists athlete_commerce_events (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text,
  event_type text not null,
  product_id int references products (id) on delete set null,
  category text,
  retailer text,
  order_reference text,
  value_minor int,
  currency text not null default 'GBP',
  source text not null default 'athrecs',
  consent_basis text,
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists athlete_activity_snapshots (
  id text primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  period_start date,
  period_end date,
  sport_id int references sports (id) on delete cascade,
  summary jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now()
);

create unique index if not exists athlete_activity_snapshots_unique_idx
  on athlete_activity_snapshots (
    athlete_id,
    coalesce(period_start, date '0001-01-01'),
    coalesce(period_end, date '9999-12-31'),
    coalesce(sport_id, 0)
  );

-- ---------------------------------------------------------------------------
-- 8. Immutable audit trail and useful indexes
-- ---------------------------------------------------------------------------

create table if not exists data_audit_log (
  id bigserial primary key,
  actor_user_id text,
  organisation_id int references organisations (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  submission_id text references data_submissions (id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists sports_active_idx on sports (active, name);
create index if not exists sport_aliases_sport_idx on sport_aliases (sport_id);
create index if not exists disciplines_sport_idx on disciplines (sport_id, active);
create index if not exists organisation_members_user_idx on organisation_members (user_id, status);
create index if not exists organisation_claims_user_idx on organisation_claims (user_id, status);
create index if not exists events_primary_sport_idx on events (primary_sport_id);
create index if not exists events_primary_organisation_idx on events (primary_organisation_id);
create index if not exists events_verification_idx on events (verification_status, updated_at);
create index if not exists event_organisations_org_idx on event_organisations (organisation_id, status);
create index if not exists editions_verification_idx on editions (verification_status, event_date);
create index if not exists event_competitions_edition_idx on event_competitions (edition_id, status);
create index if not exists event_competitions_sport_idx on event_competitions (sport_id, discipline_id);
create index if not exists athlete_claims_user_idx on athlete_claims (user_id, status);
create index if not exists athlete_sports_sport_idx on athlete_sports (sport_id, status);
create index if not exists athlete_verifications_athlete_idx on athlete_verifications (athlete_id, verification_type, status);
create index if not exists athlete_consents_athlete_idx on athlete_consents (athlete_id, purpose, status);
create index if not exists team_memberships_athlete_idx on team_memberships (athlete_id, status);
create index if not exists event_entries_athlete_idx on event_entries (athlete_id, entry_status);
create index if not exists event_entries_team_idx on event_entries (team_id, entry_status);
create index if not exists data_submissions_queue_idx on data_submissions (status, verification_status, created_at);
create index if not exists data_submissions_submitter_idx on data_submissions (submitted_by_user_id, created_at);
create index if not exists data_submissions_org_idx on data_submissions (organisation_id, created_at);
create index if not exists submission_items_submission_idx on submission_items (submission_id, status, row_number);
create index if not exists verification_checks_submission_idx on verification_checks (submission_id, status, severity);
create index if not exists competition_results_competition_idx on competition_results (competition_id, rank);
create index if not exists competition_results_athlete_idx on competition_results (athlete_id, created_at);
create index if not exists competition_results_team_idx on competition_results (team_id, created_at);
create index if not exists competition_results_verification_idx on competition_results (verification_status, published_at);
create index if not exists result_identity_claims_athlete_idx on result_identity_claims (athlete_id, status, created_at);
create index if not exists athlete_equipment_athlete_idx on athlete_equipment (athlete_id, status, category);
create index if not exists equipment_usage_athlete_idx on equipment_usage (athlete_id, occurred_at);
create index if not exists athlete_commerce_events_athlete_idx on athlete_commerce_events (athlete_id, event_type, occurred_at);
create index if not exists data_audit_entity_idx on data_audit_log (entity_type, entity_id, created_at);
