-- Department addresses are staged until their mailbox/alias existence is confirmed.
-- Preserve the owner's established delivery paths; this table grants no staff access.
create table staff_notification_routes (
  category text not null check (category in ('support','fixtures','results','partnerships')),
  recipient text not null check (recipient in (
    'paul@athrecs.com','paultwbrowne@gmail.com','support@athrecs.com',
    'fixtures@athrecs.com','results@athrecs.com','partnerships@athrecs.com'
  )),
  enabled boolean not null default false,
  check (recipient in ('paul@athrecs.com','paultwbrowne@gmail.com') or recipient=category||'@athrecs.com'),
  primary key(category,recipient)
);
alter table staff_notification_routes enable row level security;
revoke all on staff_notification_routes from public;

insert into staff_notification_routes(category,recipient,enabled)
select category,recipient,true
from (values ('support'),('fixtures'),('results'),('partnerships')) c(category)
cross join (values ('paul@athrecs.com'),('paultwbrowne@gmail.com')) r(recipient);
insert into staff_notification_routes(category,recipient,enabled) values
  ('support','support@athrecs.com',false),
  ('fixtures','fixtures@athrecs.com',false),
  ('results','results@athrecs.com',false),
  ('partnerships','partnerships@athrecs.com',false);

create function athrecs_notification_recipients(requested_category text, synthetic boolean default false)
returns table(recipient text) language sql stable as $$
  select r.recipient from staff_notification_routes r
  where r.category=requested_category and r.enabled and not synthetic
  union
  select 'paul@athrecs.com'::text
  where synthetic or not exists (
    select 1 from staff_notification_routes r where r.category=requested_category and r.enabled
  )
$$;

alter table signup_alert_deliveries drop constraint signup_alert_deliveries_recipient_check;
alter table signup_alert_deliveries add constraint signup_alert_deliveries_recipient_check
  check(recipient in ('paul@athrecs.com','paultwbrowne@gmail.com','support@athrecs.com'));
alter table athlete_profile_setup_alerts drop constraint athlete_profile_setup_alerts_recipient_check;
alter table athlete_profile_setup_alerts add constraint athlete_profile_setup_alerts_recipient_check
  check(recipient in ('paul@athrecs.com','paultwbrowne@gmail.com','support@athrecs.com'));
alter table race_edit_alert_deliveries drop constraint race_edit_alert_deliveries_recipient_check;
alter table race_edit_alert_deliveries add constraint race_edit_alert_deliveries_recipient_check
  check(recipient in ('paul@athrecs.com','paultwbrowne@gmail.com','fixtures@athrecs.com'));

create or replace function queue_new_signup_alerts() returns trigger language plpgsql as $$
begin
  insert into signup_alert_deliveries(user_id,recipient,signup_name,signup_email,signup_at,email_verified)
  select NEW.id,r.recipient,NEW.name,NEW.email,NEW."createdAt",NEW."emailVerified"
  from athrecs_notification_recipients('support',exists(
    select 1 from athrecs_test_athletes t where t.email=lower(trim(NEW.email))
  )) r
  on conflict(user_id,recipient) do nothing;
  return NEW;
end $$;

create or replace function queue_race_edit_alerts() returns trigger language plpgsql as $$
begin
  insert into race_edit_alert_deliveries(suggestion_id,recipient,submission)
  select NEW.id,r.recipient,jsonb_build_object(
    'submissionId',NEW.id,'name',u.name,'email',u.email,'createdAt',NEW.created_at,
    'raceName',NEW.race_name,'racePath',NEW.race_path,
    'suggestion',NEW.suggestion,'evidenceUrl',NEW.evidence_url,
    'syntheticTest',athrecs_is_test_user(NEW.user_id))
  from "user" u cross join lateral
    athrecs_notification_recipients('fixtures',athrecs_is_test_user(NEW.user_id)) r
  where u.id=NEW.user_id
  on conflict(suggestion_id,recipient) do nothing;
  return NEW;
end $$;

-- Deliberately do not rewrite sent/frozen payloads or backfill historical submissions.
