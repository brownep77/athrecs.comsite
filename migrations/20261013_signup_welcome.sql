-- Only future signups enter the automatic welcome flow; no historical mailout.
create table signup_welcome_deliveries (
  user_id text primary key references "user"(id) on delete cascade,
  created_at timestamptz not null default now(),
  recipient text,
  email_payload jsonb,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  skipped_reason text check(skipped_reason in ('invitation_welcome_sent','email_changed')),
  needs_review boolean not null default false,
  last_error text
);
create index signup_welcome_pending on signup_welcome_deliveries(next_attempt_at)
  where sent_at is null and skipped_reason is null and not needs_review;
create function queue_signup_welcome() returns trigger language plpgsql as $$
begin
  insert into signup_welcome_deliveries(user_id) values(NEW.id) on conflict do nothing;
  return NEW;
end;
$$;
create trigger new_signup_welcome after insert on "user"
  for each row execute function queue_signup_welcome();
