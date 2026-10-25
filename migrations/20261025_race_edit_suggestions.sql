create table if not exists race_edit_suggestions (
  id bigint generated always as identity primary key,
  user_id text not null references "user"("id") on delete cascade,
  event_id bigint not null references events(id) on delete cascade,
  race_slug text not null,
  race_name text not null,
  suggestion text not null check (length(suggestion) between 10 and 2000),
  evidence_url text not null default '',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references "user"("id") on delete set null
);
create index if not exists race_edits_pending_idx on race_edit_suggestions(status, created_at, id);
create index if not exists race_edits_user_date_idx on race_edit_suggestions(user_id, created_at);
