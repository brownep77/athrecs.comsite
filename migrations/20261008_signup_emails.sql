-- Private signup outbox. Only new accounts are captured; existing users are not
-- replayed as new signups. The trigger commits or rolls back with the account.
create table if not exists signup_email_events (
  user_id text primary key references "user"("id") on delete cascade,
  created_at timestamptz not null default now(),
  prepared_at timestamptz
);
create or replace function queue_signup_email_event() returns trigger
language plpgsql as $$
begin
  insert into signup_email_events(user_id) values(new."id") on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists queue_signup_email_event on "user";
create trigger queue_signup_email_event after insert on "user"
  for each row execute function queue_signup_email_event();

create table if not exists signup_email_deliveries (
  id bigserial primary key,
  event_key text not null unique,
  user_id text references "user"("id") on delete cascade,
  payload jsonb not null,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  needs_review boolean not null default false,
  last_error text
);
create index if not exists signup_email_pending_idx on signup_email_deliveries(next_attempt_at)
  where sent_at is null and not needs_review;
create index if not exists signup_user_created_idx on "user"("createdAt");

-- Initial report covers yesterday. Then catch up one complete UK day per run,
-- including days with no registrations, without gaps or duplicate digests.
create table if not exists signup_email_schedule (
  id boolean primary key default true check (id),
  last_queued_date date not null
);
insert into signup_email_schedule(id, last_queued_date)
values(true, (now() at time zone 'Europe/London')::date - 2)
on conflict do nothing;
comment on table signup_email_deliveries is 'Private administrator signup emails; never expose payloads through public APIs.';
