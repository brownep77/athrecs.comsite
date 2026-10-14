-- A staff-managed reporting credential. Never returned through public APIs.
create table if not exists staff_web_stats_connections (
  provider text primary key check (provider = 'vercel'),
  credential_ciphertext text not null,
  updated_by text not null,
  updated_at timestamptz not null default now()
);
