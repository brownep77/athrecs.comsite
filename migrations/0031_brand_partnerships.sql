-- Brand registrations, reviewed opportunities and private applications.
-- No existing athlete preferences or claims grant marketing permission here.
create table partner_brands (
  id bigserial primary key,
  owner_user_id text not null unique references "user" ("id") on delete cascade,
  name text not null check (length(name) between 2 and 120),
  website text not null check (website ~ '^https://'),
  website_host text not null unique,
  category text not null check (category in ('sportswear','footwear','nutrition','equipment','technology','other')),
  description text not null check (length(description) between 20 and 1500),
  sports text not null check (length(sports) between 2 and 250),
  markets text not null check (length(markets) between 2 and 250),
  contact_name text not null,
  contact_role text not null,
  status text not null default 'pending' check (status in ('pending','approved','needs_changes','rejected','suspended')),
  review_note text not null default '',
  revision integer not null default 1,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partner_opportunities (
  id bigserial primary key,
  brand_id bigint not null references partner_brands(id) on delete cascade,
  title text not null check (length(title) between 5 and 140),
  kind text not null check (kind in ('sponsorship','ambassador','product_testing','paid_collaboration','club_partnership','discount')),
  audience text not null check (audience in ('athletes','clubs','both')),
  description text not null check (length(description) between 30 and 4000),
  benefits text not null check (length(benefits) between 5 and 1000),
  requirements text not null check (length(requirements) between 5 and 1500),
  sports text not null check (length(sports) between 2 and 250),
  markets text not null check (length(markets) between 2 and 250),
  closing_date date not null,
  status text not null default 'pending' check (status in ('pending','approved','needs_changes','rejected','closed')),
  review_note text not null default '',
  revision integer not null default 1,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index partner_opportunities_public_idx on partner_opportunities(status, closing_date, brand_id);

create table partner_preferences (
  user_id text primary key references "user" ("id") on delete cascade,
  sponsorship boolean not null default false,
  product_testing boolean not null default false,
  offers boolean not null default false,
  adult_confirmed boolean not null default false,
  policy_version text not null,
  updated_at timestamptz not null default now(),
  check (not (sponsorship or product_testing or offers) or adult_confirmed)
);

create table partner_applications (
  id bigserial primary key,
  opportunity_id bigint not null references partner_opportunities(id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  applicant_kind text not null check (applicant_kind in ('athlete','club')),
  athlete_id int references athletes(id) on delete cascade,
  display_name text not null,
  club_website text,
  message text not null check (length(message) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending','shared','declined','withdrawn')),
  review_note text not null default '',
  brand_response text not null default '' check (length(brand_response) <= 2000),
  revision integer not null default 1,
  policy_version text not null,
  declaration_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, user_id),
  check ((applicant_kind = 'athlete' and athlete_id is not null and club_website is null)
    or (applicant_kind = 'club' and athlete_id is null and club_website ~ '^https://'))
);
create index partner_applications_user_idx on partner_applications(user_id, created_at desc);

create table partner_audit (
  id bigserial primary key,
  actor_user_id text references "user" ("id") on delete set null,
  entity_type text not null check (entity_type in ('brand','opportunity','application','preferences')),
  entity_id text not null,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
comment on table partner_applications is 'Private applications; brand owners see only explicitly shared applications for their own approved brand. Email and private athlete data are never included.';
comment on table partner_audit is 'Staff-only record of review decisions, revisions and permission changes.';
