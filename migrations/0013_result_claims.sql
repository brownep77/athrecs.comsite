-- Athlete-submitted result claims and staff-approved profile ownership.
--
-- A claim never edits a published result. Approval links the authenticated
-- account to the athlete profile attached to that result. The original result,
-- source and import history remain unchanged and auditable.

create table if not exists result_claims (
  id bigserial primary key,
  result_id int not null references results (id) on delete cascade,
  athlete_id int not null references athletes (id) on delete cascade,
  claimant_user_id text not null references "user" ("id") on delete cascade,
  claimant_email text not null,
  status text not null default 'pending' check (
    status in ('pending', 'needs_info', 'approved', 'rejected', 'withdrawn')
  ),
  verification_method text not null check (
    verification_method in ('bib', 'official_email', 'club_confirmation', 'other')
  ),
  evidence_text text not null default '',
  evidence_url text check (evidence_url is null or evidence_url ~ '^https://'),
  declaration_accepted boolean not null check (declaration_accepted),
  conflict_reason text,
  staff_note text,
  reviewed_by_user_id text references "user" ("id") on delete set null,
  reviewed_by_email text,
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (result_id, claimant_user_id)
);

create index if not exists result_claims_status_submitted_idx
  on result_claims (status, submitted_at desc);
create index if not exists result_claims_claimant_idx
  on result_claims (claimant_user_id, submitted_at desc);
create index if not exists result_claims_athlete_idx
  on result_claims (athlete_id, status);

create table if not exists athlete_account_links (
  athlete_id int primary key references athletes (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  user_email text not null,
  source_claim_id bigint references result_claims (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  linked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_account_links_user_idx
  on athlete_account_links (user_id, status);

comment on table result_claims is
  'Private athlete result-ownership requests. Only the claimant and allowlisted staff may read them.';
comment on table athlete_account_links is
  'Staff-approved ownership link between a Better Auth account and an ATHRECS athlete profile.';
