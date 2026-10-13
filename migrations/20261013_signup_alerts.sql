-- Future account creations only. The alert is committed with the account.
create table signup_alert_deliveries (
  id bigserial primary key,
  user_id text not null references "user"(id) on delete cascade,
  recipient text not null check (recipient in ('paul@athrecs.com','paultwbrowne@gmail.com')),
  signup_name text not null,
  signup_email text not null,
  signup_at timestamptz not null,
  email_verified boolean not null,
  email_payload jsonb,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  needs_review boolean not null default false,
  last_error text,
  unique(user_id,recipient)
);
create index signup_alert_pending on signup_alert_deliveries(next_attempt_at)
  where sent_at is null and not needs_review;

create function queue_new_signup_alerts() returns trigger language plpgsql as $$
begin
  insert into signup_alert_deliveries(user_id,recipient,signup_name,signup_email,signup_at,email_verified)
  select NEW.id,recipient,NEW.name,NEW.email,NEW."createdAt",NEW."emailVerified"
    from (values ('paul@athrecs.com'),('paultwbrowne@gmail.com')) as recipients(recipient)
  on conflict(user_id,recipient) do nothing;
  return NEW;
end;
$$;
create trigger new_signup_alerts after insert on "user"
  for each row execute function queue_new_signup_alerts();
