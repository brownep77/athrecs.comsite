-- SportsRecs network foundation.
--
-- This migration is deliberately additive. It introduces controlled brands,
-- sports, disciplines, shadow event editions and competitions while leaving
-- every existing ATHRECS public URL and legacy result relationship untouched.

create table if not exists brands (
  id serial primary key,
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9-]*$'),
  name text not null,
  purpose text not null default '',
  launch_status text not null default 'planned' check (
    launch_status in ('planned', 'active', 'paused', 'retired')
  ),
  is_network boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brand_domains (
  id bigserial primary key,
  brand_id int not null references brands (id) on delete cascade,
  hostname text not null unique check (hostname = lower(hostname)),
  is_primary boolean not null default false,
  status text not null default 'provisional' check (
    status in ('provisional', 'active', 'retired')
  ),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists brand_domains_one_primary_idx
  on brand_domains (brand_id) where is_primary;

create table if not exists sports (
  id serial primary key,
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9_]*$'),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists disciplines (
  id serial primary key,
  sport_id int not null references sports (id) on delete cascade,
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9_]*$'),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists disciplines_sport_idx on disciplines (sport_id, name);

create table if not exists organisations (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  organisation_type text not null default 'other',
  country_code text,
  website text,
  status text not null default 'active' check (status in ('active', 'inactive', 'merged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organisation_sports (
  organisation_id bigint not null references organisations (id) on delete cascade,
  sport_id int not null references sports (id) on delete cascade,
  relationship text not null default 'participates',
  primary key (organisation_id, sport_id, relationship)
);

create table if not exists venues (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  country_code text,
  region text,
  city text,
  postcode text,
  latitude double precision,
  longitude double precision,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_country_city_idx on venues (country_code, city);

create table if not exists event_classifications (
  event_id int primary key references events (id) on delete cascade,
  sport_id int not null references sports (id) on delete restrict,
  primary_discipline_id int references disciplines (id) on delete set null,
  proposed_brand_id int references brands (id) on delete set null,
  classification_status text not null default 'auto' check (
    classification_status in ('auto', 'reviewed', 'overridden', 'unclassified')
  ),
  confidence numeric(4, 3) not null default 0.500 check (
    confidence between 0 and 1
  ),
  classification_source text not null default 'manual',
  reviewed_by_user_id text references "user" (id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_classifications_brand_idx
  on event_classifications (proposed_brand_id, classification_status);
create index if not exists event_classifications_sport_idx
  on event_classifications (sport_id, primary_discipline_id);

create table if not exists event_publications (
  id bigserial primary key,
  event_id int not null references events (id) on delete cascade,
  brand_id int not null references brands (id) on delete cascade,
  public_slug text not null,
  public_path text not null,
  publication_status text not null default 'planned' check (
    publication_status in ('planned', 'draft', 'legacy_live', 'live', 'redirected', 'retired')
  ),
  is_canonical boolean not null default false,
  canonical_url text,
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, brand_id),
  unique (brand_id, public_slug)
);

create unique index if not exists event_publications_one_live_canonical_idx
  on event_publications (event_id)
  where is_canonical and publication_status in ('legacy_live', 'live');
create index if not exists event_publications_brand_status_idx
  on event_publications (brand_id, publication_status);

create table if not exists network_event_editions (
  id bigserial primary key,
  event_id int not null references events (id) on delete cascade,
  edition_name text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'TBC',
  migration_state text not null default 'shadow' check (
    migration_state in ('shadow', 'active', 'retired')
  ),
  legacy_edition_count int not null default 0 check (legacy_edition_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, start_date)
);

create index if not exists network_event_editions_date_idx
  on network_event_editions (start_date, event_id);

create table if not exists competitions (
  id bigserial primary key,
  network_edition_id bigint not null references network_event_editions (id) on delete cascade,
  legacy_edition_id int unique references editions (id) on delete set null,
  discipline_id int references disciplines (id) on delete set null,
  competition_code text not null,
  name text not null,
  round text,
  heat_number int check (heat_number is null or heat_number > 0),
  scheduled_at timestamptz,
  distance_code text,
  result_format text not null default 'time' check (
    result_format in ('time', 'mark', 'points', 'score', 'position', 'other')
  ),
  status text not null default 'TBC',
  migration_state text not null default 'shadow' check (
    migration_state in ('shadow', 'active', 'retired')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (network_edition_id, competition_code)
);

create index if not exists competitions_edition_idx
  on competitions (network_edition_id, status);
create index if not exists competitions_discipline_idx
  on competitions (discipline_id, status);

create table if not exists network_staff_roles (
  code text primary key,
  name text not null,
  description text not null default '',
  can_publish boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists network_staff_assignments (
  id bigserial primary key,
  user_id text not null references "user" (id) on delete cascade,
  role_code text not null references network_staff_roles (code) on delete restrict,
  brand_id int references brands (id) on delete cascade,
  sport_id int references sports (id) on delete cascade,
  country_code text,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists network_staff_assignments_user_idx
  on network_staff_assignments (user_id, status);
create index if not exists network_staff_assignments_scope_idx
  on network_staff_assignments (brand_id, sport_id, country_code, status);

create table if not exists network_audit_log (
  id bigserial primary key,
  actor_user_id text references "user" (id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_value jsonb,
  after_value jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists network_audit_entity_idx
  on network_audit_log (entity_type, entity_id, created_at desc);
create index if not exists network_audit_actor_idx
  on network_audit_log (actor_user_id, created_at desc);

insert into brands (code, name, purpose, launch_status, is_network)
values
  ('sportsrecs', 'SportsRecs', 'Cross-sport network discovery and shared services', 'planned', true),
  ('runrecs', 'RunRecs', 'Road, trail, fell, ultra and parkrun', 'planned', false),
  ('athrecs', 'ATHRECS', 'Track and field, cross-country and race walking', 'active', false),
  ('cycrecs', 'CycRecs', 'Road, gravel, mountain bike, cyclocross and sportives', 'planned', false),
  ('swimrecs', 'SwimRecs', 'Pool and open-water swimming competitions', 'planned', false),
  ('trirecs', 'TriRecs', 'Triathlon, duathlon, aquathlon and aquabike', 'planned', false),
  ('gymrecs', 'GymRecs', 'Gymnastics competitions and results', 'planned', false),
  ('fitrecs', 'FitRecs', 'Functional fitness, fitness racing and obstacle competition', 'planned', false)
on conflict (code) do update set
  name = excluded.name,
  purpose = excluded.purpose,
  is_network = excluded.is_network,
  updated_at = now();

insert into brand_domains (brand_id, hostname, is_primary, status)
select b.id, seed.hostname, seed.is_primary, seed.status
from (
  values
    ('athrecs', 'www.athrecs.com', true, 'active'),
    ('athrecs', 'athrecs.com', false, 'active'),
    ('sportsrecs', 'sportsrecs.org', true, 'provisional'),
    ('runrecs', 'runrecs.com', true, 'provisional'),
    ('cycrecs', 'cycrecs.com', true, 'provisional'),
    ('swimrecs', 'swimrecs.com', true, 'provisional'),
    ('trirecs', 'trirecs.com', true, 'provisional'),
    ('gymrecs', 'gymrecs.com', true, 'provisional'),
    ('fitrecs', 'fitrecs.com', true, 'provisional')
) as seed(brand_code, hostname, is_primary, status)
join brands b on b.code = seed.brand_code
on conflict (hostname) do nothing;

insert into sports (code, name, description)
values
  ('running', 'Running', 'Road, trail, fell, ultra and recurring community runs'),
  ('athletics', 'Athletics', 'Track, field, cross-country and race walking'),
  ('cycling', 'Cycling', 'Road, gravel, mountain bike, cyclocross and related disciplines'),
  ('swimming', 'Swimming', 'Pool and open-water swimming'),
  ('triathlon', 'Triathlon and multisport', 'Triathlon, duathlon, aquathlon and aquabike'),
  ('gymnastics', 'Gymnastics', 'Artistic, rhythmic, acrobatic, trampoline and tumbling'),
  ('functional_fitness', 'Functional fitness', 'Fitness racing and functional-fitness competition'),
  ('rowing', 'Rowing', 'Indoor, coastal and on-water rowing'),
  ('obstacle_racing', 'Obstacle racing', 'Obstacle course racing and related competitions'),
  ('adventure_racing', 'Adventure racing', 'Multidiscipline expedition and adventure racing'),
  ('walking', 'Walking', 'Competitive and mass-participation walking'),
  ('other', 'Other', 'Unclassified or future sports')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into disciplines (sport_id, code, name, description)
select s.id, seed.code, seed.name, seed.description
from (
  values
    ('running', 'road_running', 'Road running', 'Road races and measured road events'),
    ('running', 'trail_running', 'Trail running', 'Trail and mixed-terrain running'),
    ('running', 'fell_running', 'Fell running', 'Fell and mountain running'),
    ('running', 'track_running', 'Track running', 'Mass-participation or endurance track races'),
    ('running', 'cross_country_running', 'Cross-country running', 'Running events classified outside formal athletics meetings'),
    ('running', 'parkrun', 'Parkrun', 'Recurring parkrun events'),
    ('athletics', 'track_and_field', 'Track and field', 'Indoor and outdoor track-and-field competition'),
    ('athletics', 'cross_country', 'Cross-country', 'Formal cross-country leagues and championships'),
    ('athletics', 'race_walking', 'Race walking', 'Track and road race walking'),
    ('cycling', 'road_cycling', 'Road cycling', 'Road races, time trials and sportives'),
    ('cycling', 'gravel_cycling', 'Gravel cycling', 'Gravel races and rides'),
    ('cycling', 'mountain_biking', 'Mountain biking', 'Cross-country, downhill and other MTB formats'),
    ('cycling', 'cyclocross', 'Cyclocross', 'Cyclocross competitions'),
    ('swimming', 'pool_swimming', 'Pool swimming', 'Short-course and long-course pool competitions'),
    ('swimming', 'open_water_swimming', 'Open-water swimming', 'Open-water races and challenges'),
    ('triathlon', 'triathlon', 'Triathlon', 'Swim-bike-run competition'),
    ('triathlon', 'duathlon', 'Duathlon', 'Run-bike-run competition'),
    ('triathlon', 'aquathlon', 'Aquathlon', 'Swim-run competition'),
    ('triathlon', 'aquabike', 'Aquabike', 'Swim-bike competition'),
    ('gymnastics', 'gymnastics_general', 'Gymnastics', 'Gymnastics competition pending detailed apparatus classification'),
    ('functional_fitness', 'functional_fitness', 'Functional fitness', 'General functional-fitness competition'),
    ('functional_fitness', 'fitness_racing', 'Fitness racing', 'Fitness racing including HYROX-style events'),
    ('functional_fitness', 'crossfit_competition', 'CrossFit competition', 'CrossFit-branded or related licensed competition'),
    ('rowing', 'rowing_event', 'Rowing', 'Rowing event pending detailed format classification'),
    ('obstacle_racing', 'obstacle_course_racing', 'Obstacle course racing', 'Obstacle course racing'),
    ('adventure_racing', 'adventure_racing', 'Adventure racing', 'Adventure racing'),
    ('walking', 'walking_event', 'Walking event', 'Competitive or mass-participation walking'),
    ('other', 'unclassified', 'Unclassified', 'Requires staff classification')
) as seed(sport_code, code, name, description)
join sports s on s.code = seed.sport_code
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into network_staff_roles (code, name, description, can_publish)
values
  ('network_admin', 'Network administrator', 'All brands, sports and countries', true),
  ('brand_manager', 'Brand manager', 'One or more assigned brands', true),
  ('catalogue_editor', 'Catalogue editor', 'Events, editions and competitions', false),
  ('fixture_reviewer', 'Fixture reviewer', 'Staging, duplicate and conflict decisions', true),
  ('results_operator', 'Results operator', 'Result imports and source coverage', false),
  ('claims_moderator', 'Claims moderator', 'Athlete identity and result claims', false),
  ('analyst', 'Analyst', 'Aggregated read-only reporting', false),
  ('auditor', 'Read-only auditor', 'Read-only records and audit history', false)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  can_publish = excluded.can_publish;

create or replace view sportsrecs_event_classification_suggestions as
select
    e.id as event_id,
    case
      when lower(trim(e.sport)) in ('running', 'parkrun') then 'running'
      when lower(trim(e.sport)) = 'athletics' then 'athletics'
      when lower(trim(e.sport)) = 'cycling' then 'cycling'
      when lower(trim(e.sport)) = 'swimming' then 'swimming'
      when lower(trim(e.sport)) in ('triathlon', 'duathlon', 'aquathlon', 'aquabike') then 'triathlon'
      when lower(trim(e.sport)) = 'gymnastics' then 'gymnastics'
      when lower(trim(e.sport)) = 'functional fitness' then 'functional_fitness'
      when lower(trim(e.sport)) = 'rowing' then 'rowing'
      when lower(trim(e.sport)) = 'ocr' then 'obstacle_racing'
      when lower(trim(e.sport)) = 'adventure racing' then 'adventure_racing'
      when lower(trim(e.sport)) = 'walking' then 'walking'
      else 'other'
    end as sport_code,
    case
      when lower(trim(e.sport)) = 'parkrun' then 'parkrun'
      when lower(trim(e.sport)) = 'running' and lower(coalesce(e.surface, '')) like '%trail%' then 'trail_running'
      when lower(trim(e.sport)) = 'running' and lower(coalesce(e.surface, '')) like '%fell%' then 'fell_running'
      when lower(trim(e.sport)) = 'running' and lower(coalesce(e.surface, '')) like '%track%' then 'track_running'
      when lower(trim(e.sport)) = 'running' and (
        lower(coalesce(e.surface, '')) like '%cross country%'
        or lower(coalesce(e.surface, '')) like '%cross-country%'
      ) then 'cross_country_running'
      when lower(trim(e.sport)) = 'running' then 'road_running'
      when lower(trim(e.sport)) = 'athletics' then 'track_and_field'
      when lower(trim(e.sport)) = 'cycling' and (
        lower(coalesce(e.surface, '')) like '%gravel%'
        or lower(e.name) like '%gravel%'
      ) then 'gravel_cycling'
      when lower(trim(e.sport)) = 'cycling' and (
        lower(coalesce(e.surface, '')) like '%mountain%'
        or lower(e.name) like '%mountain bike%'
        or lower(e.name) like '%mtb%'
      ) then 'mountain_biking'
      when lower(trim(e.sport)) = 'cycling' and lower(e.name) like '%cyclocross%' then 'cyclocross'
      when lower(trim(e.sport)) = 'cycling' then 'road_cycling'
      when lower(trim(e.sport)) = 'swimming' and (
        lower(coalesce(e.surface, '')) like '%open water%'
        or lower(e.name) like '%open water%'
      ) then 'open_water_swimming'
      when lower(trim(e.sport)) = 'swimming' then 'pool_swimming'
      when lower(trim(e.sport)) = 'triathlon' then 'triathlon'
      when lower(trim(e.sport)) = 'duathlon' then 'duathlon'
      when lower(trim(e.sport)) = 'aquathlon' then 'aquathlon'
      when lower(trim(e.sport)) = 'aquabike' then 'aquabike'
      when lower(trim(e.sport)) = 'gymnastics' then 'gymnastics_general'
      when lower(trim(e.sport)) = 'functional fitness' and lower(e.name) like '%hyrox%' then 'fitness_racing'
      when lower(trim(e.sport)) = 'functional fitness' and lower(e.name) like '%crossfit%' then 'crossfit_competition'
      when lower(trim(e.sport)) = 'functional fitness' then 'functional_fitness'
      when lower(trim(e.sport)) = 'rowing' then 'rowing_event'
      when lower(trim(e.sport)) = 'ocr' then 'obstacle_course_racing'
      when lower(trim(e.sport)) = 'adventure racing' then 'adventure_racing'
      when lower(trim(e.sport)) = 'walking' then 'walking_event'
      else 'unclassified'
    end as discipline_code,
    case
      when lower(trim(e.sport)) in ('running', 'parkrun') then 'runrecs'
      when lower(trim(e.sport)) = 'athletics' then 'athrecs'
      when lower(trim(e.sport)) = 'cycling' then 'cycrecs'
      when lower(trim(e.sport)) = 'swimming' then 'swimrecs'
      when lower(trim(e.sport)) in ('triathlon', 'duathlon', 'aquathlon', 'aquabike') then 'trirecs'
      when lower(trim(e.sport)) = 'gymnastics' then 'gymrecs'
      when lower(trim(e.sport)) in ('functional fitness', 'ocr') then 'fitrecs'
      else 'sportsrecs'
    end as brand_code,
    case
      when lower(trim(e.sport)) in (
        'running', 'parkrun', 'athletics', 'cycling', 'swimming', 'triathlon',
        'duathlon', 'aquathlon', 'aquabike', 'gymnastics', 'functional fitness',
        'rowing', 'ocr', 'adventure racing', 'walking'
      ) then 0.950
      else 0.400
    end as confidence,
    case
      when lower(trim(e.sport)) in (
        'running', 'parkrun', 'athletics', 'cycling', 'swimming', 'triathlon',
        'duathlon', 'aquathlon', 'aquabike', 'gymnastics', 'functional fitness',
        'rowing', 'ocr', 'adventure racing', 'walking'
      ) then 'auto'
      else 'unclassified'
    end as classification_status
from events e;

insert into event_classifications (
  event_id,
  sport_id,
  primary_discipline_id,
  proposed_brand_id,
  classification_status,
  confidence,
  classification_source
)
select
  normalized.event_id,
  sport.id,
  discipline.id,
  brand.id,
  normalized.classification_status,
  normalized.confidence,
  'migration:0027_sportsrecs_network_foundation'
from sportsrecs_event_classification_suggestions normalized
join sports sport on sport.code = normalized.sport_code
left join disciplines discipline on discipline.code = normalized.discipline_code
left join brands brand on brand.code = normalized.brand_code
on conflict (event_id) do nothing;

-- Preserve today's ATHRECS URLs as the only live canonical publications. The
-- proposed specialist brand lives on event_classifications until a later,
-- explicitly approved URL migration switches the canonical publication.
insert into event_publications (
  event_id,
  brand_id,
  public_slug,
  public_path,
  publication_status,
  is_canonical,
  canonical_url,
  published_at
)
select
  event.id,
  brand.id,
  event.slug,
  '/races/' || event.slug,
  'legacy_live',
  true,
  'https://www.athrecs.com/races/' || event.slug,
  event.created_at
from events event
join brands brand on brand.code = 'athrecs'
on conflict (event_id, brand_id) do nothing;

-- Build a shadow edition layer by grouping today's distance-specific edition
-- rows into one event occurrence per date. Existing pages and results continue
-- to use the legacy editions table until a later guarded cutover.
create or replace view sportsrecs_network_edition_suggestions as
select
  edition.event_id,
  event.name || ' ' || substring(edition.event_date::text from 1 for 4) as edition_name,
  edition.event_date as start_date,
  edition.event_date as end_date,
  case
    when sum(case when edition.status = 'Open' then 1 else 0 end) > 0 then 'Open'
    when sum(case when edition.status = 'ClosingSoon' then 1 else 0 end) > 0 then 'ClosingSoon'
    when sum(case when edition.status = 'TBC' then 1 else 0 end) > 0 then 'TBC'
    when sum(case when edition.status = 'Closed' then 1 else 0 end) > 0 then 'Closed'
    else 'Finished'
  end as status,
  count(*)::int as legacy_edition_count
from editions edition
join events event on event.id = edition.event_id
group by edition.event_id, event.name, edition.event_date;

insert into network_event_editions (
  event_id,
  edition_name,
  start_date,
  end_date,
  status,
  migration_state,
  legacy_edition_count
)
select
  suggestion.event_id,
  suggestion.edition_name,
  suggestion.start_date,
  suggestion.end_date,
  suggestion.status,
  'shadow',
  suggestion.legacy_edition_count
from sportsrecs_network_edition_suggestions suggestion
on conflict (event_id, start_date) do nothing;

create or replace view sportsrecs_competition_suggestions as
select
  network_edition.id as network_edition_id,
  legacy_edition.id as legacy_edition_id,
  classification.primary_discipline_id as discipline_id,
  'legacy-edition-' || legacy_edition.id::text as competition_code,
  coalesce(nullif(trim(legacy_edition.distance_code), ''), event.name) as name,
  nullif(trim(legacy_edition.distance_code), '') as distance_code,
  case
    when lower(coalesce(legacy_edition.distance_code, '')) ~ '(jump|vault|shot|discus|hammer|javelin|throw)' then 'mark'
    else 'time'
  end as result_format,
  legacy_edition.status
from editions legacy_edition
join events event on event.id = legacy_edition.event_id
join network_event_editions network_edition
  on network_edition.event_id = legacy_edition.event_id
  and network_edition.start_date = legacy_edition.event_date
left join event_classifications classification on classification.event_id = event.id;

insert into competitions (
  network_edition_id,
  legacy_edition_id,
  discipline_id,
  competition_code,
  name,
  distance_code,
  result_format,
  status,
  migration_state
)
select
  suggestion.network_edition_id,
  suggestion.legacy_edition_id,
  suggestion.discipline_id,
  suggestion.competition_code,
  suggestion.name,
  suggestion.distance_code,
  suggestion.result_format,
  suggestion.status,
  'shadow'
from sportsrecs_competition_suggestions suggestion
on conflict (legacy_edition_id) do nothing;

create or replace view sportsrecs_result_competition_map as
select
  result.id as result_id,
  result.edition_id as legacy_edition_id,
  competition.id as competition_id,
  competition.network_edition_id
from results result
join competitions competition on competition.legacy_edition_id = result.edition_id;

create or replace view sportsrecs_network_migration_report as
select
  (select count(*) from events) as event_count,
  (select count(*) from event_classifications) as classified_event_count,
  (
    select count(*) from event_classifications
    where classification_status = 'unclassified'
  ) as unclassified_event_count,
  (
    select count(*) from event_classifications
    where proposed_brand_id is not null
  ) as brand_planned_event_count,
  (select count(*) from editions) as legacy_edition_count,
  (select count(*) from network_event_editions) as network_edition_count,
  (
    select count(*) from competitions where legacy_edition_id is not null
  ) as mapped_competition_count,
  (select count(*) from results) as legacy_result_count,
  (select count(*) from sportsrecs_result_competition_map) as mapped_result_count,
  (
    select count(*) from event_publications
    where publication_status = 'legacy_live' and is_canonical
  ) as protected_legacy_publication_count;

insert into app_meta (key, value)
values ('sportsrecs_network_foundation', 'v1-shadow-no-public-url-cutover')
on conflict (key) do update set value = excluded.value;
