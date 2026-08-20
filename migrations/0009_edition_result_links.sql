-- Multiple verified result providers may be linked to the same race edition.
-- Links are edition-level metadata only: participant result tables remain out
-- of scope unless they are imported through the separate results workflow.

create table if not exists edition_result_links (
  id serial primary key,
  edition_id int not null references editions (id) on delete cascade,
  provider_code text not null,
  provider_name text not null,
  results_url text not null check (results_url ~ '^https://'),
  canonical_url text not null check (canonical_url ~ '^https://'),
  source_url text check (source_url is null or source_url ~ '^https://'),
  registry_source_id text,
  is_verified boolean not null default false,
  status text not null default 'approved' check (
    status in ('approved', 'held', 'rejected')
  ),
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (edition_id, canonical_url)
);

create index if not exists edition_result_links_edition_idx
  on edition_result_links (edition_id);

create index if not exists edition_result_links_public_idx
  on edition_result_links (edition_id, status, is_verified);
