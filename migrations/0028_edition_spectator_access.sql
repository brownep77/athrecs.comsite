-- Spectator access is deliberately separate from athlete race entry.
-- Only verified rows with an evidence URL are exposed by the public API.

create table if not exists edition_spectator_access (
  edition_id int primary key references editions (id) on delete cascade,
  access_type text not null default 'unknown' check (
    access_type in (
      'free',
      'ticketed',
      'free_and_ticketed',
      'registration_required',
      'sold_out',
      'unknown'
    )
  ),
  ticket_url text check (ticket_url is null or ticket_url ~ '^https://'),
  price_amount numeric(12, 2) check (price_amount is null or price_amount >= 0),
  price_currency text,
  source_url text not null check (source_url ~ '^https://'),
  checked_at timestamptz not null default now(),
  is_verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    access_type not in ('ticketed', 'free_and_ticketed', 'registration_required', 'sold_out')
    or ticket_url is not null
  )
);

create index if not exists edition_spectator_access_public_idx
  on edition_spectator_access (access_type, checked_at desc)
  where is_verified;
