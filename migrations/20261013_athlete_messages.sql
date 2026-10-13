-- Private correspondence, never included in public athlete profile queries.
create table athlete_messages (
  id text primary key,
  user_id text references "user"(id) on delete cascade,
  athlete_id integer references athletes(id) on delete cascade,
  direction text not null check (direction in ('sent','received')),
  channel text not null check (channel in ('email','whatsapp','sms','telegram','phone','social','other')),
  subject text not null,
  body text not null,
  contact text not null,
  sender text,
  status text not null check (status in ('accepted','failed','unknown','recorded')),
  source text not null check (source in ('site','manual')),
  source_key text unique,
  provider_id text,
  replaces_invitation_record boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  recorded_by text references "user"(id) on delete set null,
  check (user_id is not null or athlete_id is not null)
);
create index athlete_messages_user_time on athlete_messages(user_id,occurred_at desc,id);
create index athlete_messages_athlete_time on athlete_messages(athlete_id,occurred_at desc,id);
comment on table athlete_messages is 'Staff-only correspondence. Site emails record provider acceptance, not delivery or reading. Manual entries do not send messages. Authentication codes and action URLs are omitted.';
