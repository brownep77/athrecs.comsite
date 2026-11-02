-- Future fixture corrections only. Commit both staff alerts with the suggestion.
create table race_edit_alert_deliveries (
  id bigserial primary key,
  suggestion_id bigint not null references race_edit_suggestions(id) on delete cascade,
  recipient text not null check (recipient in ('paul@athrecs.com','paultwbrowne@gmail.com')),
  submission jsonb not null,
  email_payload jsonb,
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  needs_review boolean not null default false,
  last_error text,
  unique(suggestion_id,recipient)
);
create index race_edit_alert_pending on race_edit_alert_deliveries(next_attempt_at)
  where sent_at is null and not needs_review;
alter table race_edit_alert_deliveries enable row level security;
revoke all on race_edit_alert_deliveries from public;

create function queue_race_edit_alerts() returns trigger language plpgsql as $$
begin
  insert into race_edit_alert_deliveries(suggestion_id,recipient,submission)
  select NEW.id,recipient,jsonb_build_object(
    'name',u.name,'email',u.email,'createdAt',NEW.created_at,
    'raceName',NEW.race_name,'racePath',NEW.race_path,
    'suggestion',NEW.suggestion,'evidenceUrl',NEW.evidence_url,
    'syntheticTest',athrecs_is_test_user(NEW.user_id))
  from "user" u cross join
    (values ('paul@athrecs.com'),('paultwbrowne@gmail.com')) as recipients(recipient)
  where u.id=NEW.user_id
    and (recipient='paul@athrecs.com' or not athrecs_is_test_user(NEW.user_id))
  on conflict(suggestion_id,recipient) do nothing;
  return NEW;
end;
$$;
create trigger new_race_edit_alerts after insert on race_edit_suggestions
  for each row execute function queue_race_edit_alerts();
