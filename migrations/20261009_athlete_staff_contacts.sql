-- Private staff contact details never change public athlete/profile connections.
create table if not exists athlete_staff_contacts (
  user_id text primary key references "user"(id) on delete cascade,
  phone text check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$'),
  telegram_username text,
  social_links jsonb not null default '[]'::jsonb,
  source_note text not null,
  updated_by text references "user"(id) on delete set null,
  updated_at timestamptz not null default now()
);
