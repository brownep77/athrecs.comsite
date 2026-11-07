-- Staff-reviewed archive associations never enter canonical/public result feeds.
create table result_archive_private_matches (
  entry_id bigint primary key references result_archive_entries(id) on delete restrict,
  revision integer not null check (revision > 0),
  edition_id integer not null references editions(id) on delete restrict,
  athlete_id integer not null references athletes(id) on delete restrict,
  bib text,
  tier text not null check (tier in ('bridge','name_club','name_country')),
  reviewed_by text references "user"(id) on delete set null,
  reviewed_at timestamptz not null default now(),
  unique (edition_id, athlete_id),
  unique (edition_id, bib)
);
alter table result_archive_private_matches enable row level security;
revoke all on result_archive_private_matches from public;
