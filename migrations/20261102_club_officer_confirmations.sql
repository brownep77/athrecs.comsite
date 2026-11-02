-- Private confirmation of a specific version of an application and its target.
create table if not exists club_officer_confirmations (
  application_id uuid not null references club_registration_applications(id) on delete cascade,
  revision integer not null,
  target_club_id integer references clubs(id) on delete restrict,
  method text not null check (method in ('email','manual')),
  status text not null check (status in ('pending','confirmed','disputed','failed')),
  source_url text not null,
  contact text not null,
  reply_note text not null default '',
  staff_id text references "user"(id) on delete set null,
  token_digest text unique,
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(application_id, revision)
);
-- Notices are delivered to the club account, including when staff resolve a missing listing.
create table if not exists club_access_notices (
  application_id uuid not null references club_registration_applications(id) on delete cascade,
  revision integer not null,
  club_id integer not null references clubs(id) on delete cascade,
  recipient_id text not null references "user"(id) on delete cascade,
  disputed_at timestamptz,
  primary key(application_id, revision, club_id, recipient_id)
);
create index if not exists club_access_notices_recipient on club_access_notices(recipient_id);
-- Public content supplied by club officers is separate from verification contacts.
create table if not exists club_profile_updates (
  club_id integer primary key references clubs(id) on delete cascade,
  biography text not null,
  training text not null,
  contact_url text not null,
  revision integer not null
);
