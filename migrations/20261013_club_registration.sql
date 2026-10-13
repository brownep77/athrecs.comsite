-- Directory listings and the authority to manage them are separate records.
create table if not exists club_registration_applications (
  id uuid primary key,
  user_id text not null references "user"(id) on delete cascade,
  club_id int references clubs(id) on delete restrict,
  request_key text not null,
  details jsonb not null,
  status text not null default 'draft' check (status in
    ('draft','pending','needs_changes','approved','rejected','revoked','withdrawn')),
  revision int not null default 1,
  submitted_email text,
  notice_version text,
  review_message text not null default '',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, request_key)
);
create index if not exists club_registration_review_idx
  on club_registration_applications(status, updated_at);

create table if not exists club_representatives (
  club_id int not null references clubs(id) on delete restrict,
  user_id text not null references "user"(id) on delete cascade,
  application_id uuid not null unique references club_registration_applications(id) on delete cascade,
  status text not null check (status in ('active','revoked')),
  approved_at timestamptz not null default now(),
  primary key(club_id, user_id)
);

create table if not exists club_registration_audit (
  id bigserial primary key,
  application_id uuid not null references club_registration_applications(id) on delete cascade,
  actor_user_id text references "user"(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists club_registration_audit_app_idx
  on club_registration_audit(application_id, id);
