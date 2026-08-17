-- Multiple verified ways to enter a race edition.
--
-- `editions.entry_url` remains as a backwards-compatible pointer to the
-- primary entry route. New imports and race pages use this normalized table.

create table if not exists edition_entry_options (
  id serial primary key,
  edition_id int not null references editions (id) on delete cascade,
  provider_code text not null,
  provider_name text not null,
  entry_url text not null,
  entry_type text not null default 'official'
    check (entry_type in ('official', 'third_party', 'charity', 'tour_operator')),
  status text not null default 'unknown'
    check (status in ('open', 'closing_soon', 'ballot', 'waitlist', 'sold_out', 'closed', 'unknown')),
  price_amount numeric(12, 2)
    check (price_amount is null or price_amount >= 0),
  price_currency text,
  opens_at date,
  closes_at date,
  checked_at timestamptz not null default now(),
  source_url text,
  is_verified boolean not null default false,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (edition_id, provider_code)
);

create index if not exists edition_entry_options_edition_idx
  on edition_entry_options (edition_id);

create unique index if not exists edition_entry_options_one_primary_idx
  on edition_entry_options (edition_id)
  where is_primary;

-- Preserve every existing entry link as the primary official route. This is
-- intentionally idempotent so it is also safe on databases that were partly
-- prepared by the runtime schema guard.
insert into edition_entry_options (
  edition_id,
  provider_code,
  provider_name,
  entry_url,
  entry_type,
  status,
  checked_at,
  source_url,
  is_verified,
  is_primary
)
select
  ed.id,
  'official',
  'Official race entry',
  ed.entry_url,
  'official',
  case ed.status
    when 'Open' then 'open'
    when 'ClosingSoon' then 'closing_soon'
    when 'Closed' then 'closed'
    when 'Finished' then 'closed'
    else 'unknown'
  end,
  now(),
  coalesce(nullif(ed.source_url, ''), ed.entry_url),
  false,
  true
from editions ed
where nullif(trim(ed.entry_url), '') is not null
on conflict (edition_id, provider_code) do nothing;
