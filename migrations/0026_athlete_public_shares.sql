-- Opt-in, unlisted Athlete Profile sharing.
--
-- Ordinary Athlete Accounts stay private. This table is the separate visibility
-- choice required before any account-owned name, club, location, bio or claimed
-- result may be rendered on a public URL. Email, date of birth, postcode,
-- previous names, IDs, photographs and product preferences are never stored here
-- and must not be selected by the public loader.

create table if not exists athlete_public_shares (
  user_id text primary key references "user" ("id") on delete cascade,
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 8 and 80),
  enabled boolean not null default false,
  share_bio boolean not null default true,
  share_results boolean not null default true,
  share_club boolean not null default true,
  share_location boolean not null default true,
  acknowledged_at timestamptz,
  published_at timestamptz,
  unpublished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists athlete_public_shares_enabled_slug_idx
  on athlete_public_shares (slug)
  where enabled;

create index if not exists athlete_public_shares_updated_idx
  on athlete_public_shares (updated_at desc);

comment on table athlete_public_shares is
  'Opt-in unlisted public profile sharing for Athlete Accounts. Disabled by default; never list in /athletes unless a later directory consent is added.';
comment on column athlete_public_shares.slug is
  'Stable public slug. Regenerated only when missing; kept after unpublish so a later re-enable restores the same URL.';
comment on column athlete_public_shares.enabled is
  'When false the public loader must 404. Withdrawal is immediate.';
