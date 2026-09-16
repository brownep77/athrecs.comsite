-- Private sponsorship intake. Submitting does not publish a listing or agree a fee.
create table sponsorship_enquiries (
  id bigserial primary key,
  user_id text not null references "user" (id) on delete cascade,
  request_id uuid not null,
  source text not null check (source in ('athrecs', 'runrecs')),
  kind text not null check (kind in ('brand', 'race_organiser', 'creator')),
  contact_name text not null check (length(contact_name) between 2 and 120),
  name text not null check (length(name) between 2 and 160),
  website text not null check (website ~ '^https://'),
  location text not null check (length(location) between 2 and 200),
  event_date date,
  support text not null check (support in ('cash', 'products', 'services', 'mixed')),
  budget text not null default '' check (length(budget) <= 160),
  reach text not null default '' check (length(reach) <= 600),
  message text not null check (length(message) between 30 and 3000),
  status text not null default 'pending' check (status in ('pending', 'in_review', 'closed', 'withdrawn')),
  response text not null default '' check (length(response) <= 2000),
  revision integer not null default 1,
  policy_version text not null,
  declaration_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, request_id),
  check (kind <> 'race_organiser' or event_date is not null)
);
create index sponsorship_enquiries_owner_idx on sponsorship_enquiries(user_id, created_at desc);
create index sponsorship_enquiries_review_idx on sponsorship_enquiries(status, created_at);
create table sponsorship_enquiry_audit (
  id bigserial primary key,
  enquiry_id bigint not null references sponsorship_enquiries(id) on delete cascade,
  actor_user_id text references "user" (id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);
