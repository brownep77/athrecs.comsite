-- Athrecs athlete backend: account links, private passport data, sports,
-- identifiers, memberships, permissions, kit, commerce signals and consent.
-- Sensitive athlete information is kept out of the public `athletes` table.

create table if not exists athlete_user_links (
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  relationship text not null default 'self',
  role text not null default 'owner',
  status text not null default 'pending',
  permissions jsonb not null default '{}'::jsonb,
  verification_case_id int references verification_cases (id) on delete set null,
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (athlete_id, user_id, relationship),
  check (relationship in ('self', 'parent', 'guardian', 'coach', 'agent', 'manager', 'club_admin', 'medical_support', 'other')),
  check (role in ('owner', 'editor', 'contributor', 'viewer')),
  check (status in ('pending', 'verified', 'rejected', 'revoked'))
);

-- Only one verified self/owner account may control an athlete profile. Other
-- parents, guardians and delegated roles can coexist through separate links.
create unique index if not exists athlete_user_links_verified_self_owner_idx
  on athlete_user_links (athlete_id)
  where relationship = 'self' and role = 'owner' and status = 'verified';

create table if not exists athlete_private_profiles (
  athlete_id int primary key references athletes (id) on delete cascade,
  legal_given_name text,
  legal_middle_names text,
  legal_family_name text,
  preferred_name text,
  date_of_birth date,
  competition_sex text,
  nationality text,
  country_of_residence text,
  primary_email text,
  mobile_phone text,
  address jsonb not null default '{}'::jsonb,
  emergency_contact jsonb not null default '{}'::jsonb,
  race_entry_profile jsonb not null default '{}'::jsonb,
  accessibility_requirements jsonb not null default '{}'::jsonb,
  medical_data_ciphertext text,
  medical_key_version text,
  profile_completeness int not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (profile_completeness between 0 and 100)
);

create table if not exists athlete_public_settings (
  athlete_id int primary key references athletes (id) on delete cascade,
  profile_visibility text not null default 'public',
  location_visibility text not null default 'city',
  date_of_birth_visibility text not null default 'age_category',
  upcoming_events_visibility text not null default 'private',
  equipment_visibility text not null default 'private',
  allow_follows boolean not null default true,
  allow_contact_requests boolean not null default false,
  show_verified_badges boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (profile_visibility in ('private', 'unlisted', 'public')),
  check (location_visibility in ('private', 'country', 'region', 'county', 'city')),
  check (date_of_birth_visibility in ('private', 'age_category', 'age', 'full')),
  check (upcoming_events_visibility in ('private', 'followers', 'public')),
  check (equipment_visibility in ('private', 'followers', 'public'))
);

create table if not exists athlete_sports (
  athlete_id int not null references athletes (id) on delete cascade,
  sport_id int not null references sports (id) on delete cascade,
  discipline_id int references disciplines (id) on delete set null,
  is_primary boolean not null default false,
  participation_level text not null default 'recreational',
  status text not null default 'active',
  started_on date,
  ended_on date,
  preferred_surface_id int references surfaces (id) on delete set null,
  preferred_distance_value numeric,
  preferred_distance_unit text,
  public_notes text,
  private_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, sport_id, discipline_id),
  check (participation_level in ('recreational', 'club', 'county', 'regional', 'national', 'international', 'professional', 'elite')),
  check (status in ('active', 'inactive', 'retired')),
  check (preferred_distance_value is null or preferred_distance_value >= 0),
  check (ended_on is null or started_on is null or ended_on >= started_on)
);

-- Enforce one athlete/sport/discipline row when discipline is NULL.
create unique index if not exists athlete_sports_identity_idx
  on athlete_sports (athlete_id, sport_id, coalesce(discipline_id, 0));

create table if not exists athlete_identifiers (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  sport_id int references sports (id) on delete set null,
  issuing_body text not null,
  identifier_type text not null,
  identifier_value text not null,
  country_code text,
  status text not null default 'unverified',
  valid_from date,
  valid_until date,
  verified_at timestamptz,
  verified_by_user_id text references "user" ("id") on delete set null,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issuing_body, identifier_type, identifier_value),
  check (status in ('unverified', 'pending', 'verified', 'expired', 'rejected')),
  check (valid_until is null or valid_from is null or valid_until >= valid_from)
);

create table if not exists athlete_memberships (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  sport_id int references sports (id) on delete set null,
  club_id int references clubs (id) on delete set null,
  team_id int references teams (id) on delete set null,
  organisation_id int references organisations (id) on delete set null,
  membership_type text not null default 'member',
  membership_number text,
  start_date date,
  end_date date,
  is_primary boolean not null default false,
  status text not null default 'active',
  verification_status text not null default 'unverified',
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (club_id is not null or team_id is not null or organisation_id is not null),
  check (membership_type in ('member', 'athlete', 'player', 'captain', 'coach', 'official', 'alumni', 'guest', 'other')),
  check (status in ('active', 'inactive', 'suspended', 'ended')),
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists athlete_delegations (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  delegate_user_id text not null references "user" ("id") on delete cascade,
  delegation_type text not null,
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  granted_by_user_id text references "user" ("id") on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, delegate_user_id, delegation_type),
  check (delegation_type in ('parent', 'guardian', 'coach', 'agent', 'manager', 'club_admin', 'medical_support', 'other')),
  check (status in ('pending', 'active', 'expired', 'revoked', 'rejected')),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists athlete_preferences (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  preference_type text not null,
  sport_id int references sports (id) on delete cascade,
  value_json jsonb not null,
  source_type text not null default 'athlete_declared',
  confidence text not null default 'high',
  visibility text not null default 'private',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, preference_type, sport_id),
  check (preference_type in ('distance', 'surface', 'location', 'travel_radius', 'entry_price', 'season', 'brand', 'product', 'event_type', 'communication', 'other')),
  check (source_type in ('athlete_declared', 'observed_on_athrecs', 'purchase_confirmed', 'connected_partner', 'calculated', 'inferred')),
  check (confidence in ('low', 'medium', 'high', 'authoritative')),
  check (visibility in ('private', 'organisers', 'partners', 'public'))
);

-- Enforce one preference per athlete/type/sport, including global
-- preferences where sport_id is NULL.
create unique index if not exists athlete_preferences_identity_idx
  on athlete_preferences (athlete_id, preference_type, coalesce(sport_id, 0));

create table if not exists result_claims (
  id serial primary key,
  result_id int not null references competition_results (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  submitted_by_user_id text not null references "user" ("id") on delete restrict,
  claim_type text not null,
  status text not null default 'submitted',
  evidence jsonb not null default '[]'::jsonb,
  verification_case_id int references verification_cases (id) on delete set null,
  reviewed_by_user_id text references "user" ("id") on delete set null,
  reviewer_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (result_id, athlete_id, claim_type, submitted_by_user_id),
  check (claim_type in ('belongs_to_me', 'not_me', 'correction', 'duplicate')),
  check (status in ('submitted', 'automated_checks', 'under_review', 'approved', 'rejected', 'cancelled'))
);

create table if not exists products (
  id serial primary key,
  slug text not null unique,
  brand text not null,
  name text not null,
  category text not null,
  sport_id int references sports (id) on delete set null,
  model text,
  variant text,
  product_url text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('active', 'discontinued', 'hidden'))
);

create table if not exists athlete_equipment (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  product_id int references products (id) on delete set null,
  sport_id int references sports (id) on delete set null,
  category text not null,
  brand text,
  model text,
  variant text,
  size text,
  colour text,
  ownership_type text not null default 'purchased',
  purchase_date date,
  retailer text,
  purchase_price numeric,
  currency text,
  first_used_on date,
  retired_on date,
  status text not null default 'active',
  usage_distance numeric,
  usage_distance_unit text,
  usage_hours numeric,
  athlete_rating numeric,
  notes text,
  visibility text not null default 'private',
  disclosure text not null default 'personally_purchased',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ownership_type in ('purchased', 'gifted', 'sponsored', 'borrowed', 'trial', 'unknown')),
  check (status in ('wishlist', 'active', 'retired', 'returned', 'sold', 'lost')),
  check (purchase_price is null or purchase_price >= 0),
  check (usage_distance is null or usage_distance >= 0),
  check (usage_hours is null or usage_hours >= 0),
  check (athlete_rating is null or athlete_rating between 0 and 5),
  check (visibility in ('private', 'followers', 'public')),
  check (disclosure in ('personally_purchased', 'gifted', 'sponsored', 'affiliate', 'review_sample', 'unknown')),
  check (retired_on is null or first_used_on is null or retired_on >= first_used_on)
);

create table if not exists equipment_usage (
  id serial primary key,
  equipment_id int not null references athlete_equipment (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  competition_id int references event_competitions (id) on delete set null,
  result_id int references competition_results (id) on delete set null,
  usage_date date,
  usage_type text not null default 'competition',
  distance numeric,
  distance_unit text,
  duration_seconds int,
  conditions jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  check (usage_type in ('training', 'competition', 'recovery', 'travel', 'other')),
  check (distance is null or distance >= 0),
  check (duration_seconds is null or duration_seconds >= 0)
);

create table if not exists product_interactions (
  id bigserial primary key,
  athlete_id int references athletes (id) on delete cascade,
  user_id text references "user" ("id") on delete set null,
  product_id int references products (id) on delete set null,
  interaction_type text not null,
  source text not null default 'athrecs',
  order_reference text,
  quantity int,
  value numeric,
  currency text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  check (interaction_type in ('view', 'save', 'wishlist', 'basket', 'checkout_started', 'purchase', 'return', 'affiliate_click', 'offer_redeemed', 'review', 'replacement_reminder')),
  check (quantity is null or quantity > 0),
  check (value is null or value >= 0)
);

create table if not exists athlete_consents (
  id serial primary key,
  athlete_id int not null references athletes (id) on delete cascade,
  user_id text references "user" ("id") on delete set null,
  purpose text not null,
  channel text not null default 'in_app',
  status text not null,
  lawful_basis text,
  policy_version text,
  source text not null default 'athrecs',
  granted_at timestamptz,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (athlete_id, purpose, channel),
  check (purpose in ('service', 'race_recommendations', 'equipment_recommendations', 'race_alerts', 'athrecs_news', 'product_offers', 'partner_offers_via_athrecs', 'direct_partner_sharing', 'anonymous_research', 'profiling')),
  check (channel in ('in_app', 'email', 'sms', 'push', 'phone', 'data_sharing')),
  check (status in ('not_asked', 'granted', 'withdrawn', 'denied', 'expired')),
  check (lawful_basis is null or lawful_basis in ('contract', 'consent', 'legitimate_interests', 'legal_obligation', 'vital_interests', 'public_task'))
);

create index if not exists athlete_user_links_user_idx on athlete_user_links (user_id, status);
create index if not exists athlete_sports_sport_idx on athlete_sports (sport_id, discipline_id, status);
create index if not exists athlete_identifiers_athlete_idx on athlete_identifiers (athlete_id, status);
create index if not exists athlete_memberships_athlete_idx on athlete_memberships (athlete_id, status);
create index if not exists athlete_preferences_lookup_idx on athlete_preferences (preference_type, sport_id, source_type);
create index if not exists result_claims_queue_idx on result_claims (status, submitted_at);
create index if not exists athlete_equipment_athlete_idx on athlete_equipment (athlete_id, status, category);
create index if not exists equipment_usage_result_idx on equipment_usage (result_id, competition_id);
create index if not exists product_interactions_athlete_idx on product_interactions (athlete_id, interaction_type, occurred_at);
create index if not exists athlete_consents_lookup_idx on athlete_consents (purpose, channel, status);

-- Entry/result behaviour by sport, distance, surface and geography. This view is
-- calculated from source records, so it cannot drift like manually stored totals.
create or replace view athlete_activity_breakdown_v as
select
  ce.athlete_id,
  s.code as sport_code,
  s.name as sport_name,
  d.code as discipline_code,
  d.name as discipline_name,
  sf.code as surface_code,
  sf.name as surface_name,
  c.distance_value,
  c.distance_unit,
  coalesce(o.country_code, v.country_code) as country_code,
  coalesce(o.nation, v.nation) as nation,
  coalesce(o.region, v.region) as region,
  coalesce(o.county, v.county) as county,
  coalesce(o.district, v.district) as district,
  coalesce(o.city, v.city) as city,
  count(distinct ce.id)::int as entry_count,
  count(distinct cr.id)::int as result_count,
  count(distinct case when cr.result_status = 'finished' then cr.id end)::int as finish_count,
  count(distinct case when cr.result_status = 'dns' then cr.id end)::int as dns_count,
  count(distinct case when cr.result_status = 'dnf' then cr.id end)::int as dnf_count,
  min(o.start_at) as first_entry_at,
  max(o.start_at) as latest_entry_at
from competition_entries ce
join event_competitions c on c.id = ce.competition_id
join event_occurrences o on o.id = c.occurrence_id
join sports s on s.id = c.sport_id
left join disciplines d on d.id = c.discipline_id
left join surfaces sf on sf.id = c.surface_id
left join venues v on v.id = coalesce(c.venue_id, o.venue_id)
left join competition_results cr
  on cr.entry_id = ce.id
 and cr.competition_id = c.id
 and cr.record_status = 'active' 
where ce.athlete_id is not null
group by
  ce.athlete_id,
  s.code, s.name,
  d.code, d.name,
  sf.code, sf.name,
  c.distance_value, c.distance_unit,
  coalesce(o.country_code, v.country_code),
  coalesce(o.nation, v.nation),
  coalesce(o.region, v.region),
  coalesce(o.county, v.county),
  coalesce(o.district, v.district),
  coalesce(o.city, v.city);

create or replace view athlete_equipment_summary_v as
select
  ae.athlete_id,
  ae.category,
  coalesce(p.brand, ae.brand) as brand,
  count(*)::int as items_recorded,
  count(*) filter (where ae.status = 'active')::int as active_items,
  sum(coalesce(ae.usage_distance, 0)) as recorded_distance,
  sum(coalesce(ae.usage_hours, 0)) as recorded_hours,
  max(ae.purchase_date) as most_recent_purchase,
  avg(ae.athlete_rating) as average_rating
from athlete_equipment ae
left join products p on p.id = ae.product_id
group by ae.athlete_id, ae.category, coalesce(p.brand, ae.brand);
