-- One private staff mailbox. Passwords are encrypted with a dedicated runtime key.
create table athlete_inbox_connection (
  mailbox text primary key check (mailbox='paul@athrecs.com'),
  password_ciphertext text not null,
  uid_validity text not null,
  last_uid bigint not null default 0,
  connected_at timestamptz not null default now(),
  connected_by text references "user"(id) on delete set null,
  last_synced_at timestamptz,
  last_error text,
  lease_token text,
  lease_until timestamptz,
  imported_count integer not null default 0,
  ambiguous_count integer not null default 0
);
alter table athlete_messages drop constraint athlete_messages_source_check;
alter table athlete_messages add constraint athlete_messages_source_check
  check(source in ('site','manual','inbox'));
alter table athlete_messages drop constraint athlete_messages_status_check;
alter table athlete_messages add constraint athlete_messages_status_check
  check(status in ('accepted','failed','unknown','recorded','received'));
create index athlete_messages_email_contact on athlete_messages(lower(contact))
  where channel='email' and source='site' and status='accepted';
