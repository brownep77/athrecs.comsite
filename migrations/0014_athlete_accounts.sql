-- Private ATHRECS Athlete Accounts / Entry Passports.
--
-- Authentication identity remains in Better Auth's "user" table. Public race
-- results remain in athletes/results. These tables hold athlete-declared,
-- private account information and purpose-specific consent separately.

create table if not exists athlete_private_profiles (
  user_id text primary key references "user" ("id") on delete cascade,
  verified_email text not null check (length(trim(verified_email)) > 3),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  display_name text,
  date_of_birth date check (date_of_birth is null or date_of_birth <= current_date),
  country text,
  region text,
  city text,
  postcode text,
  nationality text,
  club_or_team text,
  preferred_language text,
  privacy_notice_version text not null,
  privacy_acknowledged_at timestamptz not null,
  onboarding_completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_private_profiles_email_idx
  on athlete_private_profiles (lower(verified_email));

create table if not exists athlete_sport_profiles (
  id bigserial primary key,
  user_id text not null references "user" ("id") on delete cascade,
  sport_code text not null,
  is_primary boolean not null default false,
  experience_level text check (
    experience_level is null or experience_level in (
      'new', 'recreational', 'club', 'competitive', 'elite', 'coach', 'other'
    )
  ),
  disciplines text[] not null default '{}',
  preferred_distances text[] not null default '{}',
  preferred_surfaces text[] not null default '{}',
  training_sessions_per_week smallint check (
    training_sessions_per_week is null or training_sessions_per_week between 0 and 30
  ),
  training_hours_per_week numeric(5, 1) check (
    training_hours_per_week is null or training_hours_per_week between 0 and 168
  ),
  weekly_distance_km numeric(8, 2) check (
    weekly_distance_km is null or weekly_distance_km between 0 and 2000
  ),
  events_per_year smallint check (
    events_per_year is null or events_per_year between 0 and 500
  ),
  goals text,
  coach_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, sport_code)
);

create unique index if not exists athlete_sport_profiles_one_primary_idx
  on athlete_sport_profiles (user_id) where is_primary;
create index if not exists athlete_sport_profiles_sport_idx
  on athlete_sport_profiles (sport_code, user_id);

create table if not exists athlete_product_preferences (
  user_id text primary key references "user" ("id") on delete cascade,
  equipment_items text[] not null default '{}',
  equipment_brands text[] not null default '{}',
  equipment_models text[] not null default '{}',
  equipment_notes text,
  nutrition_products text[] not null default '{}',
  nutrition_brands text[] not null default '{}',
  nutrition_notes text,
  technology_devices text[] not null default '{}',
  technology_apps text[] not null default '{}',
  technology_brands text[] not null default '{}',
  technology_notes text,
  clothing_items text[] not null default '{}',
  clothing_brands text[] not null default '{}',
  clothing_size text,
  clothing_fit text check (
    clothing_fit is null or clothing_fit in ('relaxed', 'regular', 'fitted', 'compression', 'varies')
  ),
  clothing_notes text,
  recovery_products text[] not null default '{}',
  recovery_brands text[] not null default '{}',
  recovery_notes text,
  purchase_channels text[] not null default '{}',
  purchase_priorities text[] not null default '{}',
  annual_sports_spend_band text check (
    annual_sports_spend_band is null or annual_sports_spend_band in (
      'prefer_not_to_say', 'under_250', '250_499', '500_999', '1000_1999', '2000_plus'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists athlete_account_consents (
  user_id text not null references "user" ("id") on delete cascade,
  purpose text not null check (
    purpose in ('performance_insights', 'personalisation', 'product_research', 'marketing')
  ),
  status text not null check (status in ('granted', 'withdrawn')),
  policy_version text not null,
  source text not null default 'athlete_account',
  granted_at timestamptz,
  withdrawn_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, purpose)
);

create index if not exists athlete_account_consents_reporting_idx
  on athlete_account_consents (purpose, status, updated_at desc);

comment on table athlete_private_profiles is
  'Private athlete identity and Entry Passport data. Never render on public athlete pages without a separate visibility choice.';
comment on table athlete_product_preferences is
  'Optional, athlete-declared product and purchasing preferences. Aggregate research requires active product_research consent.';
comment on table athlete_account_consents is
  'Purpose-specific athlete consent. Marketing and product research are optional and unbundled.';
