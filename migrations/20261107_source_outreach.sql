-- Partnership emails to fixture sources whose robots.txt refuses automated
-- collection (owner request, 7 November 2026). One email per source and per
-- address, ever; replies go to info@athrecs.com.
create table if not exists source_outreach (
  source_id text primary key,
  site_name text not null,
  site_url text not null,
  contact_email text,
  status text not null check (status in ('sent', 'no_contact', 'failed', 'declined')),
  detail text not null default '',
  provider_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists source_outreach_sent_email
  on source_outreach (lower(contact_email)) where status = 'sent';
