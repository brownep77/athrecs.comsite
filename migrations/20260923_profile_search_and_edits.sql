-- Search discovery is separate from link sharing. Existing unlisted accounts stay unlisted.
alter table athlete_public_shares add column if not exists search_indexable boolean not null default false;

-- Paul explicitly requested indexing of his already-published profile on 23 September 2026.
update athlete_public_shares s set search_indexable=true, updated_at=now()
where s.enabled and exists (
  select 1 from athlete_account_links l join athletes a on a.id=l.athlete_id
  where l.user_id=s.user_id and l.status='active' and a.slug='paul-browne'
    and a.profile_visibility='public'
);

create table if not exists athlete_profile_edit_suggestions (
  id bigint generated always as identity primary key,
  user_id text not null references "user"("id") on delete cascade,
  profile_slug text not null,
  suggestion text not null check(length(suggestion) between 10 and 2000),
  evidence_url text not null default '',
  status text not null default 'pending' check(status in ('pending','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references "user"("id") on delete set null
);
create index if not exists athlete_profile_edits_pending_idx on athlete_profile_edit_suggestions(status, created_at);
