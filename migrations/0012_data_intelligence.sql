-- Privacy-first data intelligence for the ATHRECS staff microsite.
--
-- Event geography is kept on the public event record. Athlete-reported habits
-- remain in a separate private table and are only reportable when a matching,
-- active purpose consent exists. Site analytics deliberately store no IP
-- address, raw browser identifier, full referrer URL or query string.

alter table events add column if not exists region text;
alter table events add column if not exists postcode text;
alter table events add column if not exists latitude double precision;
alter table events add column if not exists longitude double precision;
alter table events add column if not exists data_verified_at timestamptz;
alter table events add column if not exists updated_at timestamptz not null default now();

create index if not exists events_country_region_idx
  on events (country, region);
create index if not exists events_country_city_idx
  on events (country, city);
create index if not exists events_postcode_idx
  on events (postcode) where postcode is not null;

create table if not exists site_analytics_events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  event_name text not null check (
    event_name in (
      'page_view',
      'event_view',
      'athlete_view',
      'entry_click',
      'results_view',
      'search',
      'filter_apply'
    )
  ),
  path text not null,
  entity_type text check (entity_type is null or entity_type in ('event', 'athlete', 'club')),
  entity_slug text,
  session_hash text not null,
  athlete_id int references athletes (id) on delete set null,
  referrer_domain text,
  device_class text check (
    device_class is null or device_class in ('desktop', 'mobile', 'tablet', 'other')
  ),
  country_code text,
  region text,
  city text,
  consent_version text not null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists site_analytics_occurred_idx
  on site_analytics_events (occurred_at desc);
create index if not exists site_analytics_event_time_idx
  on site_analytics_events (event_name, occurred_at desc);
create index if not exists site_analytics_path_time_idx
  on site_analytics_events (path, occurred_at desc);
create index if not exists site_analytics_entity_time_idx
  on site_analytics_events (entity_type, entity_slug, occurred_at desc);

create table if not exists athlete_data_consents (
  id bigserial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text references "user" (id) on delete set null,
  purpose text not null check (
    purpose in ('performance_insights', 'personalisation', 'product_research', 'marketing')
  ),
  status text not null check (status in ('granted', 'withdrawn')),
  policy_version text not null,
  source text not null,
  granted_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (athlete_id, purpose)
);

create index if not exists athlete_data_consents_status_idx
  on athlete_data_consents (purpose, status);

create table if not exists athlete_habit_profiles (
  athlete_id int primary key references athletes (id) on delete cascade,
  training_days_per_week smallint check (
    training_days_per_week is null or training_days_per_week between 0 and 14
  ),
  weekly_distance_km numeric(8, 2) check (
    weekly_distance_km is null or weekly_distance_km between 0 and 1000
  ),
  races_per_year smallint check (
    races_per_year is null or races_per_year between 0 and 365
  ),
  preferred_distances jsonb not null default '[]'::jsonb,
  preferred_surfaces jsonb not null default '[]'::jsonb,
  shoe_brands jsonb not null default '[]'::jsonb,
  kit_brands jsonb not null default '[]'::jsonb,
  nutrition_categories jsonb not null default '[]'::jsonb,
  recovery_methods jsonb not null default '[]'::jsonb,
  travel_preferences jsonb not null default '[]'::jsonb,
  source text not null,
  collected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table athlete_habit_profiles is
  'Private athlete-reported sport habits. Staff analytics must require active purpose consent and aggregate by default.';
