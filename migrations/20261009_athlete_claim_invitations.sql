-- Staff suggestions are private. Invitations never grant athlete ownership.
create table if not exists athlete_claim_invitations (
  id text primary key,
  user_id text not null references "user"(id) on delete cascade,
  recipient_email text not null,
  athlete_id int not null references athletes(id) on delete cascade,
  result_id int not null references results(id) on delete cascade,
  token_hash text not null unique,
  claim_url text not null,
  match_note text not null,
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  revoked_at timestamptz,
  declined_at timestamptz,
  claim_id bigint references result_claims(id) on delete set null,
  email_payload jsonb not null,
  email_sent_at timestamptz,
  first_attempt_at timestamptz,
  reserved_until timestamptz,
  delivery_error boolean not null default false,
  delivery_needs_review boolean not null default false
);
create index if not exists athlete_claim_invitations_user_idx
  on athlete_claim_invitations(user_id, created_at desc);
comment on table athlete_claim_invitations is
  'Private staff-reviewed profile suggestions bound to an existing account and mailbox. Claim URLs and frozen email payloads are confidential. Acceptance submits to existing staff identity review, never publishes or links ownership.';
