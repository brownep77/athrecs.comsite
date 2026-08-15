-- Athrecs multi-sport foundation: taxonomy, organisations, permissions and venues.
-- Additive migration: the existing running catalogue remains intact.

create table if not exists sports (
  id serial primary key,
  code text not null unique,
  name text not null,
  category text not null default 'sport',
  active boolean not null default true,
  allows_custom_disciplines boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (code = lower(code)),
  check (category in ('sport', 'multi_sport', 'para_sport', 'mind_sport', 'esport', 'other'))
);

create table if not exists sport_aliases (
  alias text primary key,
  sport_id int not null references sports (id) on delete cascade,
  source text not null default 'athrecs',
  created_at timestamptz not null default now()
);

create table if not exists disciplines (
  id serial primary key,
  sport_id int not null references sports (id) on delete cascade,
  code text not null,
  name text not null,
  participant_kind text not null default 'individual',
  result_model text not null default 'multi_metric',
  default_unit text,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sport_id, code),
  check (code = lower(code)),
  check (participant_kind in ('individual', 'team', 'pair', 'relay', 'crew', 'mixed')),
  check (result_model in ('time', 'score', 'distance', 'height', 'points', 'placement', 'win_loss', 'multi_metric'))
);

create table if not exists surfaces (
  id serial primary key,
  code text not null unique,
  name text not null,
  category text not null default 'other',
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (code = lower(code))
);

create table if not exists organisations (
  id serial primary key,
  slug text not null unique,
  name text not null,
  organisation_type text not null default 'event_organiser',
  legal_name text,
  company_number text,
  charity_number text,
  governing_body text,
  website text,
  public_email text,
  country_code text,
  status text not null default 'active',
  verification_status text not null default 'unverified',
  verification_level text not null default 'none',
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  created_by_user_id text references "user" ("id") on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (organisation_type in (
    'event_organiser', 'club', 'team', 'league', 'governing_body', 'timing_company',
    'venue', 'charity', 'school', 'university', 'commercial', 'media', 'other'
  )),
  check (status in ('active', 'suspended', 'closed')),
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
  check (verification_level in ('none', 'identity', 'organisation', 'governing_body', 'official_partner'))
);

create table if not exists organisation_members (
  organisation_id int not null references organisations (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  role text not null,
  status text not null default 'active',
  permissions jsonb not null default '{}'::jsonb,
  invited_by_user_id text references "user" ("id") on delete set null,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organisation_id, user_id),
  check (role in ('owner', 'admin', 'editor', 'results_uploader', 'finance', 'viewer')),
  check (status in ('invited', 'active', 'suspended', 'revoked'))
);

create table if not exists platform_user_roles (
  user_id text not null references "user" ("id") on delete cascade,
  role text not null,
  granted_by_user_id text references "user" ("id") on delete set null,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key (user_id, role),
  check (role in ('super_admin', 'admin', 'reviewer', 'data_steward', 'support', 'read_only'))
);

create table if not exists venues (
  id serial primary key,
  organisation_id int references organisations (id) on delete set null,
  slug text,
  name text not null,
  address_line_1 text,
  address_line_2 text,
  city text,
  district text,
  county text,
  region text,
  nation text,
  country_code text,
  postcode text,
  latitude double precision,
  longitude double precision,
  timezone text,
  website text,
  accessibility jsonb not null default '{}'::jsonb,
  transport jsonb not null default '{}'::jsonb,
  facilities jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, slug),
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'))
);

create table if not exists sport_data_schemas (
  id serial primary key,
  sport_id int not null references sports (id) on delete cascade,
  discipline_id int references disciplines (id) on delete cascade,
  scope text not null,
  version int not null default 1,
  schema_json jsonb not null,
  status text not null default 'draft',
  created_by_user_id text references "user" ("id") on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (sport_id, discipline_id, scope, version),
  check (scope in ('event', 'occurrence', 'competition', 'entry', 'result', 'athlete')),
  check (status in ('draft', 'active', 'retired'))
);

-- Extend the existing public event-series table without changing existing routes.
alter table events add column if not exists sport_id int references sports (id) on delete set null;
alter table events add column if not exists owner_organisation_id int references organisations (id) on delete set null;
alter table events add column if not exists event_type text not null default 'participation';
alter table events add column if not exists timezone text;
alter table events add column if not exists visibility text not null default 'public';
alter table events add column if not exists lifecycle_status text not null default 'active';
alter table events add column if not exists verification_status text not null default 'legacy_imported';
alter table events add column if not exists verified_at timestamptz;
alter table events add column if not exists verified_by_user_id text references "user" ("id") on delete set null;
alter table events add column if not exists governing_body text;
alter table events add column if not exists permit_number text;
alter table events add column if not exists rules_url text;
alter table events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table events add column if not exists updated_at timestamptz not null default now();

-- PostgreSQL treats NULL values as distinct inside a normal UNIQUE constraint.
-- This expression index makes one schema version unique even when no discipline
-- is selected (sport-wide schema).
create unique index if not exists sport_data_schemas_scope_version_idx
  on sport_data_schemas (sport_id, coalesce(discipline_id, 0), scope, version);

create table if not exists organisation_events (
  organisation_id int not null references organisations (id) on delete cascade,
  event_id int not null references events (id) on delete cascade,
  relationship text not null default 'owner',
  status text not null default 'active',
  can_edit boolean not null default true,
  can_upload_results boolean not null default true,
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  created_at timestamptz not null default now(),
  primary key (organisation_id, event_id, relationship),
  check (relationship in ('owner', 'organiser', 'co_organiser', 'timing_partner', 'venue', 'governing_body', 'data_partner')),
  check (status in ('pending', 'active', 'suspended', 'ended'))
);

create index if not exists disciplines_sport_id_idx on disciplines (sport_id);
create index if not exists organisations_verification_idx on organisations (verification_status);
create index if not exists organisation_members_user_idx on organisation_members (user_id, status);
create index if not exists venues_location_idx on venues (country_code, region, county, city);
create index if not exists events_sport_id_idx on events (sport_id);
create index if not exists events_owner_org_idx on events (owner_organisation_id);
create index if not exists events_verification_idx on events (verification_status, visibility);
create index if not exists organisation_events_event_idx on organisation_events (event_id, status);

insert into sports (code, name, category) values
  ('running', 'Running', 'sport'),
  ('athletics', 'Athletics', 'sport'),
  ('cycling', 'Cycling', 'sport'),
  ('swimming', 'Swimming', 'sport'),
  ('triathlon', 'Triathlon', 'multi_sport'),
  ('duathlon', 'Duathlon', 'multi_sport'),
  ('aquathlon', 'Aquathlon', 'multi_sport'),
  ('aquabike', 'Aquabike', 'multi_sport'),
  ('rowing', 'Rowing', 'sport'),
  ('canoe-kayak', 'Canoe and Kayak', 'sport'),
  ('sailing', 'Sailing', 'sport'),
  ('football', 'Football', 'sport'),
  ('rugby-union', 'Rugby Union', 'sport'),
  ('rugby-league', 'Rugby League', 'sport'),
  ('cricket', 'Cricket', 'sport'),
  ('tennis', 'Tennis', 'sport'),
  ('badminton', 'Badminton', 'sport'),
  ('table-tennis', 'Table Tennis', 'sport'),
  ('squash', 'Squash', 'sport'),
  ('basketball', 'Basketball', 'sport'),
  ('netball', 'Netball', 'sport'),
  ('volleyball', 'Volleyball', 'sport'),
  ('handball', 'Handball', 'sport'),
  ('hockey', 'Hockey', 'sport'),
  ('ice-hockey', 'Ice Hockey', 'sport'),
  ('gymnastics', 'Gymnastics', 'sport'),
  ('equestrian', 'Equestrian', 'sport'),
  ('golf', 'Golf', 'sport'),
  ('boxing', 'Boxing', 'sport'),
  ('martial-arts', 'Martial Arts', 'sport'),
  ('wrestling', 'Wrestling', 'sport'),
  ('weightlifting', 'Weightlifting', 'sport'),
  ('powerlifting', 'Powerlifting', 'sport'),
  ('climbing', 'Climbing', 'sport'),
  ('orienteering', 'Orienteering', 'sport'),
  ('obstacle-course-racing', 'Obstacle Course Racing', 'sport'),
  ('modern-pentathlon', 'Modern Pentathlon', 'multi_sport'),
  ('biathlon', 'Biathlon', 'multi_sport'),
  ('skiing', 'Skiing', 'sport'),
  ('snowboarding', 'Snowboarding', 'sport'),
  ('skating', 'Skating', 'sport'),
  ('surfing', 'Surfing', 'sport'),
  ('skateboarding', 'Skateboarding', 'sport'),
  ('baseball', 'Baseball', 'sport'),
  ('softball', 'Softball', 'sport'),
  ('lacrosse', 'Lacrosse', 'sport'),
  ('bowls', 'Bowls', 'sport'),
  ('darts', 'Darts', 'mind_sport'),
  ('snooker', 'Snooker', 'mind_sport'),
  ('motorsport', 'Motorsport', 'sport'),
  ('esports', 'Esports', 'esport'),
  ('other', 'Other', 'other')
on conflict (code) do update set name = excluded.name, category = excluded.category, active = true;

insert into sport_aliases (alias, sport_id)
select x.alias, s.id
from (values
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
  ('ocr', 'obstacle-course-racing')
) as x(alias, sport_code)
join sports s on s.code = x.sport_code
on conflict (alias) do update set sport_id = excluded.sport_id;

update events e
set sport_id = a.sport_id
from sport_aliases a
where e.sport_id is null and lower(e.sport) = a.alias;

insert into surfaces (code, name, category) values
  ('road', 'Road', 'land'),
  ('track-indoor', 'Indoor Track', 'track'),
  ('track-outdoor', 'Outdoor Track', 'track'),
  ('trail', 'Trail', 'land'),
  ('fell', 'Fell', 'land'),
  ('mountain', 'Mountain', 'land'),
  ('cross-country', 'Cross-country', 'land'),
  ('grass', 'Grass', 'land'),
  ('gravel', 'Gravel', 'land'),
  ('sand', 'Sand or Beach', 'land'),
  ('mixed-terrain', 'Mixed Terrain', 'land'),
  ('pool-25m', '25m Pool', 'water'),
  ('pool-50m', '50m Pool', 'water'),
  ('open-water', 'Open Water', 'water'),
  ('river', 'River', 'water'),
  ('lake', 'Lake', 'water'),
  ('sea', 'Sea', 'water'),
  ('velodrome-indoor', 'Indoor Velodrome', 'track'),
  ('velodrome-outdoor', 'Outdoor Velodrome', 'track'),
  ('court-indoor', 'Indoor Court', 'court'),
  ('court-outdoor', 'Outdoor Court', 'court'),
  ('pitch-grass', 'Grass Pitch', 'pitch'),
  ('pitch-artificial', 'Artificial Pitch', 'pitch'),
  ('ice', 'Ice', 'ice'),
  ('snow', 'Snow', 'snow'),
  ('virtual', 'Virtual', 'virtual'),
  ('other', 'Other', 'other')
on conflict (code) do update set name = excluded.name, category = excluded.category, active = true;

-- Common disciplines are seeded only as useful defaults. New disciplines are data,
-- not migrations, so Athrecs can support any sport without a code deployment.
insert into disciplines (sport_id, code, name, participant_kind, result_model, default_unit)
select s.id, x.code, x.name, x.participant_kind, x.result_model, x.default_unit
from (values
  ('running', 'road-running', 'Road Running', 'individual', 'time', 'seconds'),
  ('running', 'trail-running', 'Trail Running', 'individual', 'time', 'seconds'),
  ('running', 'cross-country', 'Cross-country Running', 'individual', 'time', 'seconds'),
  ('running', 'fell-running', 'Fell Running', 'individual', 'time', 'seconds'),
  ('athletics', 'track', 'Track', 'individual', 'time', 'seconds'),
  ('athletics', 'field', 'Field', 'individual', 'distance', 'metres'),
  ('athletics', 'combined-events', 'Combined Events', 'individual', 'points', 'points'),
  ('cycling', 'road', 'Road Cycling', 'individual', 'time', 'seconds'),
  ('cycling', 'track', 'Track Cycling', 'individual', 'time', 'seconds'),
  ('cycling', 'mountain-bike', 'Mountain Biking', 'individual', 'time', 'seconds'),
  ('cycling', 'bmx', 'BMX', 'individual', 'placement', 'place'),
  ('swimming', 'pool', 'Pool Swimming', 'individual', 'time', 'seconds'),
  ('swimming', 'open-water', 'Open-water Swimming', 'individual', 'time', 'seconds'),
  ('triathlon', 'standard', 'Triathlon', 'individual', 'time', 'seconds'),
  ('football', 'association-football', 'Association Football', 'team', 'win_loss', 'goals'),
  ('gymnastics', 'artistic', 'Artistic Gymnastics', 'individual', 'points', 'points'),
  ('rowing', 'regatta', 'Regatta Rowing', 'crew', 'time', 'seconds')
) as x(sport_code, code, name, participant_kind, result_model, default_unit)
join sports s on s.code = x.sport_code
on conflict (sport_id, code) do update set
  name = excluded.name,
  participant_kind = excluded.participant_kind,
  result_model = excluded.result_model,
  default_unit = excluded.default_unit,
  active = true;
