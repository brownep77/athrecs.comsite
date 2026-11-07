-- Daily scan of upcoming published fixtures for likely duplicates (owner
-- request, 7 November 2026). Findings are flagged for review, never merged
-- automatically.
create table if not exists fixture_duplicate_findings (
  pair_key text primary key,
  first_event_id int not null references events (id) on delete cascade,
  second_event_id int not null references events (id) on delete cascade,
  event_date date not null,
  distance text not null,
  first_name text not null,
  second_name text not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'not_duplicate')),
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index if not exists fixture_duplicate_findings_open
  on fixture_duplicate_findings (status, event_date);
